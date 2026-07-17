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
                    eWayBillNo: createChallanDto.eWayBillNo,
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

        const stockMap = new Map<string, { material: any, quantity: number, history: any[] }>();

        for (const challan of challans) {
            for (const item of challan.items) {
                const current = stockMap.get(item.materialId) || { material: item.material, quantity: 0, history: [] };

                if (challan.type === 'ISSUE') {
                    current.quantity += item.quantity;
                } else if (challan.type === 'RETURN') {
                    current.quantity -= item.quantity;
                }

                current.history.push({
                    id: challan.id,
                    date: challan.date,
                    type: challan.type,
                    challanNo: challan.challanNumber || challan.manualChallanNumber,
                    quantity: item.quantity
                });

                stockMap.set(item.materialId, current);
            }
        }

        return Array.from(stockMap.values())
            .map(s => {
                s.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                return {
                    materialId: s.material.id,
                    materialName: s.material.name,
                    unit: s.material.unit,
                    material: s.material,
                    quantity: s.quantity,
                    history: s.history,
                };
            })
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
        // Fetch the challan first to get details for cascading bill deletion
        const challan = await this.prisma.challan.findUnique({
            where: { id },
        });

        if (!challan) {
            throw new NotFoundException('Challan not found');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Find all finalized bills for this customer that include this challan date or later
            // Since billing logic uses the entire history, deleting an old challan affects all subsequent bills.
            const affectedBills = await tx.bill.findMany({
                where: {
                    customerId: challan.customerId,
                    dateTo: { gte: challan.date },
                    status: { not: 'CANCELLED' }
                }
            });

            if (affectedBills.length > 0) {
                const billIds = affectedBills.map(b => b.id);

                // 2. Delete associated Transactions for these bills
                await tx.transaction.deleteMany({
                    where: { referenceId: { in: billIds } }
                });

                // 3. Delete the bills (BillItems will be deleted via Cascade in Schema)
                await tx.bill.deleteMany({
                    where: { id: { in: billIds } }
                });
            }

            // 4. Cascade delete Items then Challan
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

    async getCompanyStockLedger(filters?: { startDate?: string, endDate?: string }) {
        const materials = await this.prisma.material.findMany({
            orderBy: { name: 'asc' }
        });

        const allChallans = await this.prisma.challan.findMany({
            include: { items: true },
        });

        const allPurchases = await this.prisma.purchase.findMany({
            where: { status: 'Finalized' }, // Assuming we only count finalized purchases
            include: { items: true },
        });

        // 1. Group by Date
        const dateMap = new Map<string, any>(); // Map<dateString, { date, materials: Map<materialId, stats> }>

        // Helper to get or create date entry
        const getDateEntry = (dateObj: Date) => {
            const dateStr = dateObj.toISOString().split('T')[0];
            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, {
                    date: dateStr,
                    materials: new Map<string, { issue: number, rtn: number, dmg: number, short: number, newQty: number }>()
                });
            }
            return dateMap.get(dateStr).materials;
        };

        // Helper to get or create material entry for a date
        const getMaterialEntry = (materialsMap: Map<string, any>, materialId: string) => {
            if (!materialsMap.has(materialId)) {
                materialsMap.set(materialId, { issue: 0, rtn: 0, dmg: 0, short: 0, newQty: 0 });
            }
            return materialsMap.get(materialId);
        };

        // Process Challans
        for (const challan of allChallans) {
            const matMap = getDateEntry(new Date(challan.date));
            for (const item of challan.items) {
                const matEntry = getMaterialEntry(matMap, item.materialId);
                if (challan.type === 'ISSUE') {
                    matEntry.issue += item.quantity;
                } else if (challan.type === 'RETURN') {
                    matEntry.rtn += item.quantity;
                    matEntry.dmg += (item.damageQuantity || 0);
                    matEntry.short += (item.shortQuantity || 0);
                }
            }
        }

        // Process Purchases
        for (const purchase of allPurchases) {
            const matMap = getDateEntry(new Date(purchase.date));
            for (const item of purchase.items) {
                if (item.materialId) {
                    const matEntry = getMaterialEntry(matMap, item.materialId);
                    matEntry.newQty += item.quantity;
                }
            }
        }

        // Sort dates chronologically
        const sortedDates = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 2. Calculate running balances
        // We'll track the running balance for each material
        const runningBalances = new Map<string, number>();
        for (const mat of materials) {
            runningBalances.set(mat.id, mat.totalQty || 0);
        }

        const ledgerRows = sortedDates.map(dateRow => {
            const rowData: any = { date: dateRow.date, materials: {} };
            
            for (const mat of materials) {
                const matId = mat.id;
                const stats = dateRow.materials.get(matId) || { issue: 0, rtn: 0, dmg: 0, short: 0, newQty: 0 };
                
                let prevBal = runningBalances.get(matId) || 0;
                // Bal = Prev + New - Issue + Rtn - Dmg - Short
                // Wait, if damage and short are part of return, they shouldn't be added to good balance
                // Usually: Return qty is TOTAL received. But if some are damaged/short, they are subtracted from good stock
                let currentBal = prevBal + stats.newQty - stats.issue + stats.rtn - stats.dmg - stats.short;
                
                runningBalances.set(matId, currentBal);
                
                rowData.materials[matId] = {
                    ...stats,
                    frozen: 0, // Not implemented in schema
                    bal: currentBal
                };
            }
            
            return rowData;
        });

        // 3. Prepare bottom table (Available Qty)
        const availableQty = materials.map(mat => {
            return {
                materialId: mat.id,
                materialName: mat.name,
                unit: mat.unit,
                available: runningBalances.get(mat.id) || 0
            };
        });

        let filteredLedger = ledgerRows;
        if (filters?.startDate && filters?.endDate) {
            const start = new Date(filters.startDate).getTime();
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            const endTime = end.getTime();
            
            filteredLedger = ledgerRows.filter(row => {
                const rowTime = new Date(row.date).getTime();
                return rowTime >= start && rowTime <= endTime;
            });
        }

        return {
            materials: materials.map(m => ({ id: m.id, name: m.name, unit: m.unit })),
            ledger: filteredLedger,
            availableQty
        };
    }
}
