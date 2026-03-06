import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createTransferDto: CreateTransferDto) {
        const { fromCustomerId, toCustomerId, agreementId, items, date } = createTransferDto;

        // 1. Basic Validations
        if (fromCustomerId === toCustomerId) {
            throw new BadRequestException('Source and destination customers must be different');
        }

        // 2. Verify Receiver's Agreement
        const agreement = await this.prisma.agreement.findUnique({
            where: { id: agreementId },
            include: { items: true },
        });

        if (!agreement) {
            throw new NotFoundException('Receiver agreement not found');
        }

        if (agreement.customerId !== toCustomerId) {
            throw new BadRequestException('Agreement does not belong to the receiver customer');
        }

        // 3. Validate Items against Agreement
        const agreementMaterialIds = new Set(agreement.items.map(i => i.materialId));
        for (const item of items) {
            if (!agreementMaterialIds.has(item.materialId)) {
                throw new BadRequestException(`Material ${item.materialId} is not part of the receiver's agreement`);
            }
        }

        return this.prisma.$transaction(async (tx) => {
            // Generate Transfer Number
            const transferCount = await tx.transfer.count();
            const transferNumber = `MTID-${(transferCount + 1).toString().padStart(4, '0')}`;

            // Generate Challan Numbers (Simplified for now, similar to ChallansService)
            const issueCount = await tx.challan.count({ where: { type: 'ISSUE' } });
            const returnCount = await tx.challan.count({ where: { type: 'RETURN' } });

            const returnChallanNumber = `RTN-${(returnCount + 1).toString().padStart(4, '0')}`;
            const issueChallanNumber = `CHN-${(issueCount + 1).toString().padStart(4, '0')}`;

            // Create RETURN Challan for sender
            const returnChallan = await tx.challan.create({
                data: {
                    challanNumber: returnChallanNumber,
                    date: new Date(date),
                    customerId: fromCustomerId,
                    type: 'RETURN',
                    vehicleNumber: createTransferDto.vehicleNumber,
                    remarks: `Internal Transfer to ${toCustomerId} (${transferNumber})`,
                    items: {
                        create: items.map(item => ({
                            materialId: item.materialId,
                            quantity: item.quantity,
                        }))
                    }
                }
            });

            // Create ISSUE Challan for receiver
            const issueChallan = await tx.challan.create({
                data: {
                    challanNumber: issueChallanNumber,
                    date: new Date(date),
                    customerId: toCustomerId,
                    agreementId: agreementId,
                    type: 'ISSUE',
                    vehicleNumber: createTransferDto.vehicleNumber,
                    remarks: `Internal Transfer from ${fromCustomerId} (${transferNumber})`,
                    items: {
                        create: items.map(item => ({
                            materialId: item.materialId,
                            quantity: item.quantity,
                        }))
                    }
                }
            });

            // Create Transfer record
            const transfer = await tx.transfer.create({
                data: {
                    transferNumber,
                    date: new Date(date),
                    fromCustomerId,
                    toCustomerId,
                    agreementId,
                    vehicleNumber: createTransferDto.vehicleNumber,
                    remarks: createTransferDto.remarks,
                    senderTransportation: createTransferDto.senderTransportation || 0,
                    receiverTransportation: createTransferDto.receiverTransportation || 0,
                    returnChallanId: returnChallan.id,
                    issueChallanId: issueChallan.id,
                    items: {
                        create: items.map(item => ({
                            materialId: item.materialId,
                            quantity: item.quantity,
                        }))
                    }
                }
            });

            // Update challans with transferId
            await tx.challan.updateMany({
                where: { id: { in: [returnChallan.id, issueChallan.id] } },
                data: { transferId: transfer.id }
            });

            return transfer;
        });
    }

    async findAll() {
        return this.prisma.transfer.findMany({
            include: {
                fromCustomer: true,
                toCustomer: true,
                items: {
                    include: {
                        material: true,
                    }
                }
            },
            orderBy: {
                date: 'desc',
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.transfer.findUnique({
            where: { id },
            include: {
                fromCustomer: true,
                toCustomer: true,
                agreement: true,
                items: {
                    include: {
                        material: true,
                    }
                },
                challans: true
            }
        });
    }
}
