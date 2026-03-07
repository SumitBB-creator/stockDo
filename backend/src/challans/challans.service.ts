import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateChallanDto } from './dto/create-challan.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallansService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createChallanDto: CreateChallanDto) {
        const { customerId, agreementId, items, type } = createChallanDto;

        // Agreement validation only for ISSUE challans
        if (type === 'ISSUE') {
            if (!agreementId) {
                throw new BadRequestException('Agreement is required for Issue challans');
            }

            // 1. Verify Agreement
            const agreement = await this.prisma.agreement.findUnique({
                where: { id: agreementId },
                include: { items: true },
            });

            if (!agreement) {
                throw new NotFoundException('Agreement not found');
            }

            if (agreement.customerId !== customerId) {
                throw new BadRequestException('Agreement does not belong to this customer');
            }

            // 2. Validate Items against Agreement
            const agreementMaterialIds = new Set(agreement.items.map(i => i.materialId));
            for (const item of items) {
                if (!agreementMaterialIds.has(item.materialId)) {
                    throw new BadRequestException(`Material ${item.materialId} is not part of the agreement`);
                }
            }
        }

        return this.prisma.$transaction(async (tx) => {
            // Generate Challan Number
            const year = new Date().getFullYear();
            const count = await tx.challan.count({ where: { type } });
            const prefix = type === 'RETURN' ? 'RTN' : 'CHN';
            const challanNumber = `${prefix}-${(count + 1).toString().padStart(4, '0')}`;

            // Create Challan
            const challan = await tx.challan.create({
                data: {
                    challanNumber,
                    date: new Date(createChallanDto.date),
                    customerId,
                    agreementId: agreementId || null,
                    vehicleNumber: createChallanDto.vehicleNumber,
                    driverName: createChallanDto.driverName,
                    remarks: createChallanDto.remarks,
                    type: createChallanDto.type,
                    manualChallanNumber: createChallanDto.manualChallanNumber,
                    goodsValue: createChallanDto.goodsValue,
                    weight: createChallanDto.weight,
                    transportationCost: createChallanDto.transportationCost,
                    greenTax: createChallanDto.greenTax,
                    transporterName: createChallanDto.transporterName,
                    biltyNumber: createChallanDto.biltyNumber,
                    receiverName: createChallanDto.receiverName,
                    receiverMobile: createChallanDto.receiverMobile,
                    driverMobile: createChallanDto.driverMobile,
                    licenseNumber: createChallanDto.licenseNumber,
                    timeOut: createChallanDto.timeOut,
                    timeIn: createChallanDto.timeIn,
                    items: {
                        create: items.map((item) => ({
                            materialId: item.materialId,
                            quantity: item.quantity,
                            damageQuantity: item.damageQuantity || 0,
                            shortQuantity: item.shortQuantity || 0,
                        })),
                    },
                },
            });

            // Stock Validations or Updates could go here in future.

            return challan;
        });
    }

    async findAll() {
        return this.prisma.challan.findMany({
            include: {
                customer: true,
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
        return this.prisma.challan.findUnique({
            where: { id },
            include: {
                customer: true,
                agreement: true,
                items: {
                    include: {
                        material: true,
                    }
                }
            }
        });
    }

    async getCustomerStock(customerId: string) {
        // 1. Fetch all challan items for this customer
        const challans = await this.prisma.challan.findMany({
            where: { customerId },
            include: { items: { include: { material: true } } },
        });

        const stockMap = new Map<string, { material: any, quantity: number }>();

        for (const challan of challans) {
            for (const item of challan.items) {
                const current = stockMap.get(item.materialId) || { material: item.material, quantity: 0 };

                if (challan.type === 'ISSUE') {
                    current.quantity += item.quantity;
                } else if (challan.type === 'RETURN') {
                    current.quantity -= item.quantity;
                }

                stockMap.set(item.materialId, current);
            }
        }

        return Array.from(stockMap.values())
            .map(s => ({
                materialId: s.material.id,
                materialName: s.material.name,
                unit: s.material.unit, // New field, flattened from material
                material: s.material,
                quantity: s.quantity,
            }))
            .filter(s => s.quantity !== 0);
    }

    async getCompanyStock() {
        // 1. Fetch all materials
        const materials = await this.prisma.material.findMany();

        // 2. Fetch all challans and their items
        const allChallans = await this.prisma.challan.findMany({
            include: { items: true },
        });

        // 3. Map to keep track of issued quantities
        const issuedMap = new Map<string, number>();

        for (const challan of allChallans) {
            for (const item of challan.items) {
                const currentIssued = issuedMap.get(item.materialId) || 0;

                if (challan.type === 'ISSUE') {
                    issuedMap.set(item.materialId, currentIssued + item.quantity);
                } else if (challan.type === 'RETURN') {
                    // Prevent negative issued stock, assuming data might have discrepancies
                    issuedMap.set(item.materialId, Math.max(0, currentIssued - item.quantity));
                }
            }
        }

        // 4. Combine material total stock with issued stock to calculate available stock
        return materials.map(material => {
            const issuedQty = issuedMap.get(material.id) || 0;
            const availableQty = material.totalQty - issuedQty;

            return {
                materialId: material.id,
                materialName: material.name,
                unit: material.unit,
                totalQty: material.totalQty,
                lowerLimit: material.lowerLimit,
                issuedQty,
                availableQty,
            };
        });
    }

    async remove(id: string) {
        // Cascade delete Items then Challan
        return this.prisma.$transaction(async (tx) => {
            await tx.challanItem.deleteMany({
                where: { challanId: id }
            });
            return tx.challan.delete({
                where: { id }
            });
        });
    }

    async getTransportationChallans(filters: { month?: string; year?: string; customerId?: string }) {
        const whereClause: any = {};

        if (filters.year) {
            const yearNum = parseInt(filters.year);
            const startOfYear = new Date(yearNum, 0, 1);
            const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);

            if (filters.month) {
                const monthNum = parseInt(filters.month);
                const startOfMonth = new Date(yearNum, monthNum - 1, 1);
                // Get the last day of the month correctly
                const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
                whereClause.date = { gte: startOfMonth, lte: endOfMonth };
            } else {
                whereClause.date = { gte: startOfYear, lte: endOfYear };
            }
        }

        if (filters.customerId) {
            whereClause.customerId = filters.customerId;
        }

        return this.prisma.challan.findMany({
            where: whereClause,
            include: {
                customer: true,
            },
            orderBy: {
                date: 'desc',
            }
        });
    }
}
