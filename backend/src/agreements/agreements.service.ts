import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

@Injectable()
export class AgreementsService {
    constructor(private prisma: PrismaService) { }

    async create(createAgreementDto: CreateAgreementDto) {
        const { items, ...agreementData } = createAgreementDto;

        // Generate Agreement ID logic (e.g., AGRMT-0001)
        const count = await this.prisma.agreement.count();
        const agreementId = `AGRMT-${String(count + 1).padStart(6, '0')}`;

        return this.prisma.agreement.create({
            data: {
                ...agreementData,
                agreementId,
                items: {
                    create: items,
                },
            },
            include: {
                items: {
                    include: {
                        material: true
                    }
                },
                customer: true,
            },
        });
    }

    findAll(status?: string) {
        return this.prisma.agreement.findMany({
            where: status ? { status } : {},
            include: {
                customer: true,
                items: {
                    include: {
                        material: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const agreement = await this.prisma.agreement.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        material: true,
                    },
                },
                customer: true,
            },
        });

        if (!agreement) {
            throw new NotFoundException(`Agreement with ID ${id} not found`);
        }

        return agreement;
    }

    async update(id: string, updateAgreementDto: UpdateAgreementDto) {
        const { items, ...agreementData } = updateAgreementDto;

        // Transactional update
        return this.prisma.$transaction(async (prisma) => {
            // 1. Update basic fields
            await prisma.agreement.update({
                where: { id },
                data: agreementData,
            });

            // 2. Handle items if provided
            if (items) {
                // Delete existing items
                await prisma.agreementItem.deleteMany({
                    where: { agreementId: id },
                });

                // Create new items
                // Since we deleted all, just create new ones linked to this ID
                // Note: Prisma update doesn't support 'createMany' nested inside update cleanly for complex cases usually, 
                // but 'deleteMany' + 'create' is a common pattern for replacing lists.
                // Actually, we can use `items: { deleteMany: {}, create: items }` inside the update query, 
                // but explicit transaction is clearer.

                await prisma.agreementItem.createMany({
                    data: items.map(item => ({
                        ...item,
                        agreementId: id
                    }))
                });
            }

            // Return refreshed data
            return prisma.agreement.findUnique({
                where: { id },
                include: {
                    items: {
                        include: {
                            material: true,
                        },
                    },
                    customer: true,
                },
            });
        });
    }

    async remove(id: string) {
        return this.prisma.agreement.delete({
            where: { id },
        });
    }
}
