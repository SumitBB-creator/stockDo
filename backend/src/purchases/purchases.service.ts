import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreatePurchaseDto) {
        const { items, ...purchaseData } = data;

        // Generate purchase number (e.g., PUR-0001)
        const lastPurchase = await this.prisma.purchase.findFirst({
            orderBy: { purchaseNumber: 'desc' },
        });

        let nextNumber = 1;
        if (lastPurchase) {
            const lastNum = parseInt(lastPurchase.purchaseNumber.split('-')[1]);
            nextNumber = lastNum + 1;
        }
        const purchaseNumber = `PUR-${nextNumber.toString().padStart(4, '0')}`;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const purchase = await tx.purchase.create({
                data: {
                    ...purchaseData,
                    purchaseNumber,
                    date: data.date ? new Date(data.date) : new Date(),
                    status: 'Finalized',
                    items: {
                        create: items.map((item) => ({
                            description: item.description,
                            quantity: item.quantity,
                            rate: item.rate,
                            amount: item.amount,
                            materialId: item.materialId,
                        })),
                    },
                },
                include: { items: true },
            });

            // 2. Create Transaction for Ledger
            // Purchase is a CREDIT to the Supplier and a DEBIT to the Company (Material/Expense)
            // Since our ledger logic treats Bills as + (Debit for Customer, - for Company),
            // we need to be careful.
            // Based on our Mirror Logic for Company/Supplier:
            // Receipt/Payment -> Debit (+), Bill/Purchase/DebitNote -> Credit (-)

            const supplier = await tx.supplier.findUnique({
                where: { id: data.supplierId },
            });

            if (supplier && supplier.ledgerAccountId) {
                await tx.transaction.create({
                    data: {
                        ledgerAccountId: supplier.ledgerAccountId,
                        date: purchase.date,
                        type: 'PURCHASE',
                        amount: purchase.grandTotal || purchase.totalAmount,
                        referenceId: purchase.id,
                        transactionNumber: purchase.purchaseNumber,
                        description: `Purchase: ${purchase.purchaseNumber}`,
                    },
                });
            }

            return purchase;
        });
    }

    async findAll(filters: { supplierId?: string; gstType?: string; status?: string; fromDate?: string; toDate?: string }) {
        const where: any = {
            supplierId: filters.supplierId,
            gstType: filters.gstType,
            status: filters.status,
        };

        if (filters.fromDate || filters.toDate) {
            where.date = {};
            if (filters.fromDate) where.date.gte = new Date(filters.fromDate);
            if (filters.toDate) where.date.lte = new Date(filters.toDate);
        }

        return this.prisma.purchase.findMany({
            where,
            include: {
                supplier: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(id: string) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                items: true,
                supplier: true,
            },
        });

        if (!purchase) {
            throw new NotFoundException('Purchase not found');
        }

        return purchase;
    }

    async update(id: string, data: UpdatePurchaseDto) {
        const { items, ...purchaseData } = data;

        const existing = await this.findOne(id);

        return this.prisma.$transaction(async (tx) => {
            // 1. Update items if provided
            if (items) {
                // Remove existing items and add new ones
                await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
                await tx.purchase.update({
                    where: { id },
                    data: {
                        items: {
                            create: items.map((item) => ({
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.rate,
                                amount: item.amount,
                                materialId: item.materialId,
                            })),
                        },
                    },
                });
            }

            // 2. Update Purchase main data
            const updated = await tx.purchase.update({
                where: { id },
                data: {
                    ...purchaseData,
                    date: data.date ? new Date(data.date) : undefined,
                },
                include: { items: true },
            });

            // 3. Update Transaction if total changed
            const amount = updated.grandTotal || updated.totalAmount;
            await tx.transaction.updateMany({
                where: { referenceId: id, type: 'PURCHASE' },
                data: {
                    amount,
                    date: updated.date,
                },
            });

            return updated;
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure exists

        return this.prisma.$transaction(async (tx) => {
            // 1. Delete associated ledger transaction
            await tx.transaction.deleteMany({
                where: { referenceId: id, type: 'PURCHASE' },
            });

            // 2. Delete purchase items
            await tx.purchaseItem.deleteMany({
                where: { purchaseId: id },
            });

            // 3. Delete the purchase record
            return tx.purchase.delete({
                where: { id },
            });
        });
    }
}
