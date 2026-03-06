import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, addDays, isBefore, differenceInDays, format } from 'date-fns';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    /**
     * List all customers with active agreements who haven't been billed for the given month.
     */
    async getUnbilledCustomers(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month
        const today = new Date();
        const toDate = isBefore(today, endDate) ? today : endDate;

        // Get all customers with active agreements
        const agreements = await this.prisma.agreement.findMany({
            where: { status: 'Active' },
            include: { customer: true },
        });

        // Get all bills for this month (non-cancelled)
        const existingBills = await this.prisma.bill.findMany({
            where: {
                dateFrom: { gte: startDate },
                dateTo: { lte: endDate },
                status: { not: 'CANCELLED' },
            },
        });

        const billedCustomerIds = new Set(existingBills.map(b => b.customerId));

        // Get customers who have at least one ISSUE challan on or before the end of the billing month
        const challans = await this.prisma.challan.findMany({
            where: {
                type: 'ISSUE',
                date: { lte: toDate },
            },
            select: { customerId: true },
        });

        const customersWithStock = new Set(challans.map(c => c.customerId));

        // Filter to only those without an existing bill
        const unbilledAgreements = agreements.filter(a => !billedCustomerIds.has(a.customerId) && customersWithStock.has(a.customerId));

        const billableCustomers: any[] = [];

        // Run a lightweight preview calculation to ensure they actually have a bill > 0 this month
        for (const a of unbilledAgreements) {
            try {
                const preview = await this.generateBill(a.customerId, month, year);
                // Only include if there is actually an amount to bill (rent + transport + green tax)
                const checkTotal = preview.totalAmount + (preview.transportationCost || 0) + (preview.greenTax || 0);
                if (checkTotal > 0) {
                    billableCustomers.push({
                        customerId: a.customerId,
                        customer: a.customer,
                        agreementId: a.id,
                        fromDate: preview.period.start,
                        toDate: preview.period.end,
                    });
                }
            } catch (error) {
                // If generation errors out (e.g. no agreement items found), skip them
                continue;
            }
        }

        return billableCustomers;
    }

    /**
     * List all bills for a given month.
     */
    async getBillsByMonth(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const bills = await this.prisma.bill.findMany({
            where: {
                dateFrom: { gte: startDate },
                dateTo: { lte: endDate },
            },
            include: {
                customer: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Manually fetch materials and map HSN/SAC
        const materialIds = new Set<string>();
        bills.forEach(b => b.items.forEach(i => i.materialId && materialIds.add(i.materialId)));

        const materials = await this.prisma.material.findMany({
            where: { id: { in: Array.from(materialIds) } },
            select: { id: true, hsn: true, sac: true }
        });

        const matMap = new Map(materials.map(m => [m.id, m]));

        bills.forEach(b => {
            b.items = b.items.map(item => {
                const mat = item.materialId ? matMap.get(item.materialId) : null;
                return { ...item, hsn: mat?.hsn || mat?.sac || '' };
            });
        });

        return bills;
    }

    /**
     * Dynamically filter finalized bills based on optional Year, Month, Customer ID, or array of Customer IDs, or Date Range.
     */
    async getFilteredBills(filters: { year?: string; month?: string; customerId?: string; customerIds?: string; fromDate?: string; toDate?: string }) {
        const whereClause: any = { status: { not: 'CANCELLED' } };

        if (filters.fromDate && filters.toDate) {
            whereClause.dateTo = {
                gte: new Date(filters.fromDate),
                lte: new Date(filters.toDate),
            };
        } else if (filters.year) {
            const yearNum = parseInt(filters.year);
            const startOfYear = new Date(yearNum, 0, 1);
            const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);

            if (filters.month) {
                // If both Month and Year are provided
                const monthNum = parseInt(filters.month);
                const startOfMonth = new Date(yearNum, monthNum - 1, 1);
                const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
                whereClause.dateFrom = { gte: startOfMonth };
                whereClause.dateTo = { lte: endOfMonth };
            } else {
                // Only Year provided
                whereClause.dateFrom = { gte: startOfYear };
                whereClause.dateTo = { lte: endOfYear };
            }
        }

        if (filters.customerId) {
            whereClause.customerId = filters.customerId;
        }

        if (filters.customerIds) {
            const idsList = filters.customerIds.split(',').map(id => id.trim()).filter(id => id !== '');
            if (idsList.length > 0) {
                whereClause.customerId = { in: idsList };
            }
        }

        const bills = await this.prisma.bill.findMany({
            where: whereClause,
            include: {
                customer: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Manually fetch materials and map HSN/SAC
        const materialIds = new Set<string>();
        bills.forEach(b => b.items.forEach(i => i.materialId && materialIds.add(i.materialId)));

        if (materialIds.size > 0) {
            const materials = await this.prisma.material.findMany({
                where: { id: { in: Array.from(materialIds) } },
                select: { id: true, hsn: true, sac: true }
            });

            const matMap = new Map(materials.map(m => [m.id, m]));

            bills.forEach(b => {
                b.items = b.items.map(item => {
                    const mat = item.materialId ? matMap.get(item.materialId) : null;
                    return { ...item, hsn: mat?.hsn || mat?.sac || '' };
                });
            });
        }

        return bills;
    }

    /**
     * Get a single bill by ID with all details.
     */
    async getBillById(id: string) {
        const bill = await this.prisma.bill.findUnique({
            where: { id },
            include: {
                customer: true,
                items: true,
            },
        });

        if (!bill) {
            throw new NotFoundException('Bill not found');
        }

        const materialIds = bill.items.filter(i => i.materialId).map(i => i.materialId as string);
        if (materialIds.length > 0) {
            const materials = await this.prisma.material.findMany({
                where: { id: { in: materialIds } },
                select: { id: true, hsn: true, sac: true }
            });
            const matMap = new Map(materials.map(m => [m.id, m]));
            bill.items = bill.items.map(item => {
                const mat = item.materialId ? matMap.get(item.materialId) : null;
                return { ...item, hsn: mat?.hsn || mat?.sac || '' };
            });
        }

        return bill;
    }

    /**
     * Generate bill preview for a customer for a given month.
     */
    async generateBill(customerId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const today = new Date();
        const toDate = isBefore(today, endDate) ? today : endDate;

        // Fetch Customer & Agreement
        const agreement = await this.prisma.agreement.findFirst({
            where: { customerId, status: 'Active' },
            include: { items: { include: { material: true } } },
        });

        if (!agreement) {
            throw new NotFoundException('No active agreement found for this customer');
        }

        // Map Item Rates & Material Names
        const rates = new Map<string, { rate: number, name: string, unit: string, hsn: string, sac: string }>();
        agreement.items.forEach(item => {
            rates.set(item.materialId, {
                rate: item.hireRate,
                name: item.material.name,
                unit: item.rateAppliedAs || 'Nos/Days',
                hsn: item.material.hsn || '',
                sac: item.material.sac || '',
            });
        });

        // Fetch Stock Movements (Challans) up to toDate
        const challans = await this.prisma.challan.findMany({
            where: {
                customerId,
                date: { lte: toDate },
            },
            include: { items: true },
            orderBy: { date: 'asc' },
        });

        // Calculate Daily Balances & Rent
        const periodData = this.calculateHandlingPeriods(startDate, toDate, challans, rates);

        const transportationCost = challans.reduce((sum, c) => sum + (c.transportationCost || 0), 0);
        const transportationCount = challans.filter(c => c.transportationCost && c.transportationCost > 0).length;

        const greenTax = challans.reduce((sum, c) => sum + (c.greenTax || 0), 0);
        const greenTaxCount = challans.filter(c => c.greenTax && c.greenTax > 0).length;

        return {
            customerId,
            ...periodData,
            transportationCost,
            transportationCount,
            greenTax,
            greenTaxCount,
            generatedAt: new Date(),
        };
    }

    /**
     * Generate bill for a customer with a custom date range.
     */
    async generateBillCustomRange(customerId: string, fromDate: Date, toDate: Date) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        const agreement = await this.prisma.agreement.findFirst({
            where: { customerId, status: 'Active' },
            include: { items: { include: { material: true } } },
        });

        if (!agreement) {
            throw new NotFoundException('No active agreement found for this customer');
        }

        const rates = new Map<string, { rate: number, name: string, unit: string, hsn: string, sac: string }>();
        agreement.items.forEach(item => {
            rates.set(item.materialId, {
                rate: item.hireRate,
                name: item.material.name,
                unit: item.rateAppliedAs || 'Nos/Days',
                hsn: item.material.hsn || '',
                sac: item.material.sac || '',
            });
        });

        const challans = await this.prisma.challan.findMany({
            where: { customerId, date: { lte: endDate } },
            include: { items: true },
            orderBy: { date: 'asc' },
        });

        const periodData = this.calculateHandlingPeriods(startDate, endDate, challans, rates);

        const transportationCost = challans.reduce((sum, c) => sum + (c.transportationCost || 0), 0);
        const transportationCount = challans.filter(c => c.transportationCost && c.transportationCost > 0).length;

        const greenTax = challans.reduce((sum, c) => sum + (c.greenTax || 0), 0);
        const greenTaxCount = challans.filter(c => c.greenTax && c.greenTax > 0).length;

        return {
            customerId,
            ...periodData,
            transportationCost,
            transportationCount,
            greenTax,
            greenTaxCount,
            generatedAt: new Date(),
        };
    }

    /**
     * Finalize a custom date range bill (preview + create in one step).
     */
    async finalizeCustomBill(customerId: string, fromDate: Date, toDate: Date) {
        const preview = await this.generateBillCustomRange(customerId, fromDate, toDate);
        return this.createBill({
            customerId,
            dateFrom: preview.period.start,
            dateTo: preview.period.end,
            totalAmount: preview.totalAmount,
            transportationCost: preview.transportationCost,
            transportationCount: preview.transportationCount,
            greenTax: preview.greenTax,
            greenTaxCount: preview.greenTaxCount,
            items: preview.items,
        });
    }

    private calculateHandlingPeriods(
        startDate: Date,
        endDate: Date,
        challans: any[],
        rates: Map<string, { rate: number, name: string, unit: string, hsn: string, sac: string }>
    ) {
        const billItems: any[] = [];

        // stockState tracks open issues per material.
        // Array tracks FIFO: [oldest issue, newer issue, ...]
        const stockState = new Map<string, { challanNumber: string, date: Date, balance: number }[]>();

        // Helper to apply challan items to stockState
        const applyChallanList = (challanList: any[]) => {
            challanList.forEach(challan => {
                if (challan.type === 'ISSUE') {
                    challan.items.forEach((i: any) => {
                        const issues = stockState.get(i.materialId) || [];
                        const challanDate = startOfDay(new Date(challan.date));

                        const existing = issues.find(iss => startOfDay(iss.date).getTime() === challanDate.getTime());

                        if (existing) {
                            existing.balance += i.quantity;
                            if (challan.challanNumber && !existing.challanNumber.includes(challan.challanNumber)) {
                                if (existing.challanNumber === 'Opening') {
                                    existing.challanNumber = challan.challanNumber;
                                } else {
                                    existing.challanNumber += `, ${challan.challanNumber}`;
                                }
                            }
                        } else {
                            issues.push({
                                challanNumber: challan.challanNumber || 'Opening',
                                date: new Date(challan.date),
                                balance: i.quantity
                            });
                        }
                        stockState.set(i.materialId, issues);
                    });
                } else if (challan.type === 'RETURN') {
                    challan.items.forEach((i: any) => {
                        let returnQty = i.quantity;
                        const issues = stockState.get(i.materialId) || [];
                        // Deduct from oldest (index 0)
                        for (let j = 0; j < issues.length && returnQty > 0; j++) {
                            if (issues[j].balance > 0) {
                                const deduct = Math.min(issues[j].balance, returnQty);
                                issues[j].balance -= deduct;
                                returnQty -= deduct;
                            }
                        }
                    });
                }
            });
        };

        // 1. Replay history before startDate
        const historyChallans = challans.filter(c => isBefore(startOfDay(new Date(c.date)), startOfDay(startDate)));
        applyChallanList(historyChallans);

        const hasOpeningStock = Array.from(stockState.values()).some(issues => issues.some(iss => iss.balance > 0));
        let actualStartDate = startDate;

        if (!hasOpeningStock) {
            const firstChallanInPeriod = challans.find(c => !isBefore(new Date(c.date), startDate) && new Date(c.date) <= endDate);
            if (firstChallanInPeriod) {
                actualStartDate = new Date(firstChallanInPeriod.date);
            }
        }

        let currentDate = new Date(actualStartDate);

        // Key: `${materialId}|${challanNumber}`
        const activePeriods = new Map<string, { fromDate: Date, balance: number }>();

        // Set initial active periods based on opening stock
        stockState.forEach((issues, materialId) => {
            issues.forEach(iss => {
                if (iss.balance > 0) {
                    const periodKey = `${materialId}|${iss.challanNumber}`;
                    activePeriods.set(periodKey, { fromDate: new Date(actualStartDate), balance: iss.balance });
                }
            });
        });

        const closePeriod = (periodKey: string, toDate: Date) => {
            const active = activePeriods.get(periodKey);
            if (active && active.balance > 0) {
                // Determine if this exact period spans the entire calendar month boundary
                const isFullMonth = startOfDay(active.fromDate).getTime() <= startOfDay(actualStartDate).getTime()
                    && startOfDay(toDate).getTime() >= startOfDay(endDate).getTime();

                // Original mathematical difference plus conditional full-month offset
                const baseDays = differenceInDays(startOfDay(toDate), startOfDay(active.fromDate));
                const days = isFullMonth ? baseDays + 1 : baseDays;

                if (days > 0) {
                    const [materialId, challanNumber] = periodKey.split('|');
                    const rateInfo = rates.get(materialId);
                    const rate = rateInfo?.rate || 0;
                    const no = active.balance * days;

                    const matName = rateInfo?.name || 'Unknown';
                    const description = matName;

                    billItems.push({
                        materialId,
                        materialName: matName,
                        challanNumber, // Adding challanNumber for sorting
                        description,
                        hsn: rateInfo?.hsn || rateInfo?.sac || '',
                        fromDate: active.fromDate,
                        toDate: toDate,
                        balance: active.balance,
                        days,
                        quantityDays: no,
                        rate,
                        amount: no * rate,
                        unit: rateInfo?.unit || 'Nos/Days'
                    });
                }
            }
        };

        while (currentDate <= endDate) {
            const daysChallans = challans.filter(c =>
                startOfDay(new Date(c.date)).getTime() === startOfDay(currentDate).getTime()
            );

            if (daysChallans.length > 0) {
                applyChallanList(daysChallans);

                // Check differences and adjust periods
                stockState.forEach((issues, materialId) => {
                    issues.forEach(iss => {
                        const periodKey = `${materialId}|${iss.challanNumber}`;
                        const currentActive = activePeriods.get(periodKey);

                        if (currentActive) {
                            if (currentActive.balance !== iss.balance) {
                                if (currentDate > currentActive.fromDate) {
                                    closePeriod(periodKey, addDays(currentDate, -1));
                                }

                                if (iss.balance > 0) {
                                    activePeriods.set(periodKey, { fromDate: new Date(currentDate), balance: iss.balance });
                                } else {
                                    activePeriods.delete(periodKey);
                                }
                            }
                        } else if (iss.balance > 0) {
                            // New issue
                            activePeriods.set(periodKey, { fromDate: new Date(currentDate), balance: iss.balance });
                        }
                    });
                });
            }

            currentDate = addDays(currentDate, 1);
        }

        activePeriods.forEach((_val, periodKey) => {
            closePeriod(periodKey, endDate);
        });

        billItems.sort((a, b) => {
            if (a.materialName !== b.materialName) return a.materialName.localeCompare(b.materialName);
            if (a.challanNumber !== b.challanNumber) return (a.challanNumber || '').localeCompare(b.challanNumber || '');
            return a.fromDate.getTime() - b.fromDate.getTime();
        });

        const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);

        return {
            period: { start: startDate, end: endDate },
            items: billItems,
            totalAmount
        };
    }

    /**
     * Finalize bills for multiple customers at once.
     */
    async finalizeBills(customerIds: string[], month: number, year: number) {
        const results: any[] = [];

        for (const customerId of customerIds) {
            try {
                const preview = await this.generateBill(customerId, month, year);
                const bill = await this.createBill({
                    customerId,
                    dateFrom: preview.period.start,
                    dateTo: preview.period.end,
                    totalAmount: preview.totalAmount,
                    transportationCost: preview.transportationCost,
                    transportationCount: preview.transportationCount,
                    greenTax: preview.greenTax,
                    greenTaxCount: preview.greenTaxCount,
                    items: preview.items,
                });
                results.push({ customerId, success: true, bill });
            } catch (error: any) {
                results.push({ customerId, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Save Bill to DB with GST calculation.
     * GST Rule: Same state → CGST (9%) + SGST (9%), Different state → IGST (18%)
     */
    async createBill(data: any) {
        return this.prisma.$transaction(async (tx) => {
            const count = await tx.bill.count();
            const billNumber = `BILL${String(count + 1).padStart(5, '0')}`;

            // Fetch company and customer to compare states
            const company = await tx.company.findFirst();
            const customer = await tx.customer.findUnique({ where: { id: data.customerId } });

            const companyState = (company?.state || '').trim().toLowerCase();
            const customerState = (customer?.officeState || '').trim().toLowerCase();

            const hasGst = Boolean(company?.gstin && company.gstin.trim() !== '');
            const gstOnTransport = Boolean(hasGst && company?.gstOnTransportation);

            const GST_RATE = hasGst ? 18 : 0; // 18% total GST

            const subTotal = data.totalAmount;
            const transport = data.transportationCost || 0;
            const greenTax = data.greenTax || 0;
            const baseAmount = subTotal + transport + greenTax;

            // Taxable amount includes transport and green tax only if gstOnTransportation is true
            const taxableAmount = subTotal + (gstOnTransport ? (transport + greenTax) : 0);

            const isIntraState = companyState && customerState && companyState === customerState;

            let cgst = 0;
            let sgst = 0;
            let igst = 0;
            let gstType: string | null = null;

            if (hasGst) {
                if (isIntraState) {
                    gstType = 'CGST_SGST';
                    cgst = Math.round((taxableAmount * (GST_RATE / 2) / 100) * 100) / 100;
                    sgst = Math.round((taxableAmount * (GST_RATE / 2) / 100) * 100) / 100;
                } else {
                    gstType = 'IGST';
                    igst = Math.round((taxableAmount * GST_RATE / 100) * 100) / 100;
                }
            }

            const grandTotal = Math.round((baseAmount + cgst + sgst + igst) * 100) / 100;

            const bill = await tx.bill.create({
                data: {
                    billNumber,
                    customerId: data.customerId,
                    dateFrom: new Date(data.dateFrom),
                    dateTo: new Date(data.dateTo),
                    totalAmount: subTotal,
                    taxableAmount: taxableAmount,
                    transportationCost: transport,
                    transportationCount: data.transportationCount || 0,
                    greenTax: greenTax,
                    greenTaxCount: data.greenTaxCount || 0,
                    gstType,
                    gstRate: GST_RATE,
                    cgst,
                    sgst,
                    igst,
                    grandTotal,
                    status: 'FINALIZED',
                    items: {
                        create: data.items.map((item: any) => ({
                            description: item.description || item.materialName || `Rent for material`,
                            quantity: item.quantityDays,
                            rate: item.rate,
                            amount: item.amount,
                            materialId: item.materialId,
                            fromDate: item.fromDate ? new Date(item.fromDate) : null,
                            toDate: item.toDate ? new Date(item.toDate) : null,
                            balance: item.balance || 0,
                            days: item.days || 0,
                        }))
                    }
                },
                include: {
                },
            });

            // Add an automatic Transaction record for this bill
            await tx.transaction.create({
                data: {
                    ledgerAccountId: data.customerId,
                    date: new Date(data.dateTo), // post date is usually the end of the billing cycle
                    type: 'BILL',
                    amount: grandTotal,
                    referenceId: bill.id,
                    description: `Generated Bill #${billNumber} for period ${format(new Date(data.dateFrom), 'dd/MM/yyyy')} to ${format(new Date(data.dateTo), 'dd/MM/yyyy')}`
                }
            });

            return bill;
        });
    }

    /**
     * Cancel a bill.
     */
    async cancelBill(id: string) {
        const bill = await this.prisma.bill.findUnique({ where: { id } });

        if (!bill) {
            throw new NotFoundException('Bill not found');
        }

        if (bill.status === 'CANCELLED') {
            throw new BadRequestException('Bill is already cancelled');
        }

        return this.prisma.$transaction(async (tx) => {
            // Update bill status
            const updatedBill = await tx.bill.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            // Remove any associated ledger transactions
            await tx.transaction.deleteMany({
                where: { referenceId: id },
            });

            return updatedBill;
        });
    }
}
