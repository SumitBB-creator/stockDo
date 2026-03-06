import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    // Creates a new manual transaction (Receipt, Payment, Credit/Debit Note, etc)
    async create(data: any) {
        // Determine prefix
        let prefix = 'TXN';
        if (data.type === 'RECEIPT') prefix = 'R';
        else if (data.type === 'CREDIT_NOTE') prefix = 'CN';
        else if (data.type === 'DEBIT_NOTE') prefix = 'DN';
        else if (data.type === 'PAYMENT') prefix = 'P';
        else if (data.type === 'EXPENSE') prefix = 'E';

        // Find last transaction of this type to sequence
        const lastTxn = await this.prisma.transaction.findFirst({
            where: { type: data.type, transactionNumber: { startsWith: `${prefix}-` } },
            orderBy: { createdAt: 'desc' }
        });

        let nextNum = 1;
        if (lastTxn && lastTxn.transactionNumber) {
            const parts = lastTxn.transactionNumber.split('-');
            if (parts.length === 2) {
                const num = parseInt(parts[1], 10);
                if (!isNaN(num)) nextNum = num + 1;
            }
        }

        const transactionNumber = `${prefix}-${nextNum.toString().padStart(4, '0')}`;

        return this.prisma.transaction.create({
            data: {
                ledgerAccountId: data.customerId,
                date: new Date(data.date),
                type: data.type,
                amount: parseFloat(data.amount),
                description: data.description,
                referenceId: data.referenceId,
                transactionNumber,
                // GST Fields
                taxableAmount: data.taxableAmount ? parseFloat(data.taxableAmount) : null,
                gstRate: data.gstRate ? parseFloat(data.gstRate) : null,
                cgst: data.cgst ? parseFloat(data.cgst) : 0,
                sgst: data.sgst ? parseFloat(data.sgst) : 0,
                igst: data.igst ? parseFloat(data.igst) : 0,
                gstType: data.gstType || null,
            }
        });
    }

    // Fetches the ledger statement for a single customer within a date range
    async getLedger(customerId: string, fromDate?: string, toDate?: string) {
        const from = fromDate ? new Date(fromDate) : new Date(0); // Epoch if no fromDate
        const to = toDate ? new Date(toDate) : new Date();

        // 1. Resolve Party Detail & All Possible IDs
        let party: any = null;
        const idSet = new Set<string>([customerId]);

        // Try Customer
        const customer = await this.prisma.customer.findFirst({
            where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] },
            select: { id: true, name: true, ledgerAccountId: true }
        });
        if (customer) {
            party = { name: customer.name, type: 'CUSTOMER' };
            idSet.add(customer.id);
            if (customer.ledgerAccountId) idSet.add(customer.ledgerAccountId);
        }

        if (!party) {
            // Try Supplier
            const supplier = await this.prisma.supplier.findFirst({
                where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] },
                select: { id: true, name: true, ledgerAccountId: true }
            });
            if (supplier) {
                party = { name: supplier.name, type: 'SUPPLIER' };
                idSet.add(supplier.id);
                if (supplier.ledgerAccountId) idSet.add(supplier.ledgerAccountId);
            }
        }

        if (!party) {
            // Try Employee
            const employee = await this.prisma.employee.findFirst({
                where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] },
                select: { id: true, name: true, ledgerAccountId: true }
            });
            if (employee) {
                party = { name: employee.name, type: 'EMPLOYEE' };
                idSet.add(employee.id);
                if (employee.ledgerAccountId) idSet.add(employee.ledgerAccountId);
            }
        }

        if (!party) {
            // Try Company
            const company = await this.prisma.company.findFirst({
                where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] },
                select: { id: true, companyName: true, ledgerAccountId: true }
            });
            if (company) {
                party = { name: company.companyName, type: 'COMPANY' };
                idSet.add(company.id);
                if (company.ledgerAccountId) idSet.add(company.ledgerAccountId);
            }
        }

        const isCompany = party?.type === 'COMPANY';
        const isSupplier = party?.type === 'SUPPLIER';
        const allPossibleIds = Array.from(idSet);

        // 2. Calculate Opening Balance (all transactions prior to fromDate)
        const priorTransactions = await this.prisma.transaction.findMany({
            where: isCompany ? {
                date: { lt: from }
            } : {
                ledgerAccountId: { in: allPossibleIds },
                date: { lt: from }
            }
        });

        let openingBalance = 0;
        for (const t of priorTransactions) {
            const isIncreaseType = t.type === 'BILL' || t.type === 'DEBIT_NOTE';
            const isDecreaseType = t.type === 'RECEIPT' || t.type === 'CREDIT_NOTE' || t.type === 'PAYMENT';

            if (isCompany || isSupplier) {
                // For Company/Supplier: Receipts/Payments are + (Debit), Bills are - (Credit)
                if (isDecreaseType) openingBalance += t.amount;
                else if (isIncreaseType) openingBalance -= t.amount;
            } else {
                // For Customer/Employee: Bills are + (Debit), Receipts/Payments are - (Credit)
                if (isIncreaseType) openingBalance += t.amount;
                else if (isDecreaseType) openingBalance -= t.amount;
            }
        }

        // 3. Fetch Transactions for the requested period
        const periodTransactions = await this.prisma.transaction.findMany({
            where: isCompany ? {
                date: {
                    gte: from,
                    lte: to
                }
            } : {
                ledgerAccountId: { in: allPossibleIds },
                date: {
                    gte: from,
                    lte: to
                }
            },
            orderBy: { date: 'asc' }
        });

        // 4. Resolve Bill Numbers for 'BILL' type transactions
        const billIds = periodTransactions
            .filter(t => t.type === 'BILL' && t.referenceId)
            .map(t => t.referenceId as string);

        const bills = await this.prisma.bill.findMany({
            where: { id: { in: billIds } },
            select: { id: true, billNumber: true }
        });

        const billMap = new Map(bills.map(b => [b.id, b.billNumber]));

        // 5. Bulk Resolve Entity Names for transaction rows
        const uniqueLedgerIds = Array.from(new Set(periodTransactions.map(t => t.ledgerAccountId)));
        const nameMap = new Map<string, string>();

        for (const lid of uniqueLedgerIds) {
            let resolvedName = '-';
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lid);

            // Try Customer
            const c = await this.prisma.customer.findFirst({
                where: isUuid ? { OR: [{ id: lid }, { ledgerAccountId: lid }] } : { ledgerAccountId: lid },
                select: { name: true }
            });
            if (c) resolvedName = c.name;

            if (resolvedName === '-') {
                const s = await this.prisma.supplier.findFirst({
                    where: isUuid ? { OR: [{ id: lid }, { ledgerAccountId: lid }] } : { ledgerAccountId: lid },
                    select: { name: true }
                });
                if (s) resolvedName = s.name;
            }

            if (resolvedName === '-') {
                const e = await this.prisma.employee.findFirst({
                    where: isUuid ? { OR: [{ id: lid }, { ledgerAccountId: lid }] } : { ledgerAccountId: lid },
                    select: { name: true }
                });
                if (e) resolvedName = e.name;
            }

            if (resolvedName === '-') {
                const comp = await this.prisma.company.findFirst({
                    where: isUuid ? { OR: [{ id: lid }, { ledgerAccountId: lid }] } : { ledgerAccountId: lid },
                    select: { companyName: true }
                });
                if (comp) resolvedName = comp.companyName;
            }
            nameMap.set(lid, resolvedName);
        }

        // 6. Compute Running Balances & Enrich
        let runningBalance = openingBalance;
        const ledgerEntries = periodTransactions.map((t) => {
            let debit = 0;
            let credit = 0;

            const isIncreaseType = t.type === 'BILL' || t.type === 'DEBIT_NOTE';
            const isDecreaseType = t.type === 'RECEIPT' || t.type === 'CREDIT_NOTE' || t.type === 'PAYMENT';

            if (isCompany || isSupplier) {
                // Mirror Logic: Receipt/Payment -> Debit (+), Bill -> Credit (-)
                if (isDecreaseType) {
                    debit = t.amount;
                    runningBalance += t.amount;
                } else if (isIncreaseType) {
                    credit = t.amount;
                    runningBalance -= t.amount;
                }
            } else {
                // Standard Logic: Bill -> Debit (+), Receipt/Payment -> Credit (-)
                if (isIncreaseType) {
                    debit = t.amount;
                    runningBalance += t.amount;
                } else if (isDecreaseType) {
                    credit = t.amount;
                    runningBalance -= t.amount;
                }
            }

            return {
                ...t,
                debit,
                credit,
                balance: runningBalance,
                entityName: nameMap.get(t.ledgerAccountId) || '-',
                // Attach resolved bill number if it exists
                resolvedReference: t.type === 'BILL' && t.referenceId ? billMap.get(t.referenceId) : null
            };
        });

        return {
            party,
            openingBalance,
            closingBalance: runningBalance,
            transactions: ledgerEntries
        };
    }

    // Aggregates net dues for all customers up to a specific date
    async getDueslist(asOfDate?: string) {
        let dateLimit = new Date();
        if (asOfDate) {
            const d = new Date(asOfDate);
            dateLimit = new Date(d.setHours(23, 59, 59, 999));
        }

        // Grouping directly in Postgres via Prisma grouping
        const grouped = await this.prisma.transaction.groupBy({
            by: ['ledgerAccountId', 'type'],
            _sum: {
                amount: true
            },
            where: {
                date: { lte: dateLimit }
            }
        });

        const balances: {
            [key: string]: {
                billingAmount: number;
                billPayment: number;
                refundPayment: number;
                netDue: number;
            }
        } = {};

        // Sum up Debits and Credits independently
        for (const record of grouped) {
            const customerId = record.ledgerAccountId;
            const type = record.type;
            const amount = record._sum.amount || 0;

            if (!balances[customerId]) {
                balances[customerId] = {
                    billingAmount: 0,
                    billPayment: 0,
                    refundPayment: 0,
                    netDue: 0
                };
            }

            if (type === 'BILL' || type === 'DEBIT_NOTE') {
                balances[customerId].billingAmount += amount;
                balances[customerId].netDue += amount;
            } else if (type === 'RECEIPT' || type === 'CREDIT_NOTE') {
                balances[customerId].billPayment += amount;
                balances[customerId].netDue -= amount;
            } else if (type === 'PAYMENT') {
                // If we pay them back
                balances[customerId].refundPayment += amount;
                balances[customerId].netDue += amount;
            }
        }

        // Fetch Customer Details
        const customersWithDues: any[] = [];
        for (const [customerId, data] of Object.entries(balances)) {
            // Include everyone, since they might have 0 due but a large billing history 
            // the user's UI filter can hide 0 dues if requested
            const customer = await this.prisma.customer.findFirst({
                where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] }
            });

            if (customer) {
                // Calculate Advance: If netDue is negative, that means they paid more than billed.
                const advancePayment = data.netDue < 0 ? Math.abs(data.netDue) : 0;

                // If they have an advance, their excluding advance balance is exactly 0.
                const balanceExcludingAdvance = data.netDue > 0 ? data.netDue : 0;

                customersWithDues.push({
                    customer,
                    billingAmount: data.billingAmount,
                    billPayment: data.billPayment,
                    refundPayment: data.refundPayment,
                    advancePayment: advancePayment,
                    currentBalanceIncluded: data.netDue, // Negative means CR
                    currentBalanceExcluded: balanceExcludingAdvance,
                    netDue: data.netDue
                });
            }
        }

        // Sort descending by highest due or by name if dues are same
        return customersWithDues.sort((a, b) => b.netDue - a.netDue || a.customer.name.localeCompare(b.customer.name));
    }

    // Daybook: All transactions globally for a specific day
    async getDaybook(date: string) {
        const targetDate = new Date(date);
        const start = new Date(targetDate.setHours(0, 0, 0, 0));
        const end = new Date(targetDate.setHours(23, 59, 59, 999));

        const transactions = await this.prisma.transaction.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: { date: 'asc' }
        });

        // Resolve customer/entity names
        const enriched = await Promise.all(transactions.map(async (t) => {
            // Try Customer
            let entity = await this.prisma.customer.findFirst({
                where: { OR: [{ id: t.ledgerAccountId }, { ledgerAccountId: t.ledgerAccountId }] },
                select: { name: true, relationType: true, relationName: true }
            });

            if (entity) {
                return {
                    ...t,
                    entityName: `${entity.name} ${entity.relationType ? `(${entity.relationType} ${entity.relationName})` : ''}`
                };
            }

            // Try Supplier
            const supplier = await this.prisma.supplier.findFirst({
                where: { OR: [{ id: t.ledgerAccountId }, { ledgerAccountId: t.ledgerAccountId }] },
                select: { name: true }
            });
            if (supplier) return { ...t, entityName: `Supplier: ${supplier.name}` };

            // Try Employee
            const employee = await this.prisma.employee.findFirst({
                where: { OR: [{ id: t.ledgerAccountId }, { ledgerAccountId: t.ledgerAccountId }] },
                select: { name: true }
            });
            if (employee) return { ...t, entityName: `Employee: ${employee.name}` };

            // Try Company
            const company = await this.prisma.company.findFirst({
                where: { OR: [{ id: t.ledgerAccountId }, { ledgerAccountId: t.ledgerAccountId }] },
                select: { companyName: true }
            });
            if (company) return { ...t, entityName: `Internal: ${company.companyName}` };

            return {
                ...t,
                entityName: t.ledgerAccountId
            };
        }));

        return enriched;
    }

    async getTransaction(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        // Fetch customer details manually because ledgerAccountId links logically
        const customer = await this.prisma.customer.findFirst({
            where: { OR: [{ id: transaction.ledgerAccountId }, { ledgerAccountId: transaction.ledgerAccountId }] }
        });

        return {
            ...transaction,
            customer
        };
    }

    async deleteTransaction(id: string) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!transaction) throw new NotFoundException('Transaction not found');
        return this.prisma.transaction.delete({ where: { id } });
    }

    async getBalanceSheet(asOfDate?: string) {
        let dateLimit = new Date();
        if (asOfDate) {
            const d = new Date(asOfDate);
            dateLimit = new Date(d.setHours(23, 59, 59, 999));
        }

        // 1. Assets - Fixed Assets (from Company)
        const company = await this.prisma.company.findFirst();
        const fixedAssets = company?.fixedAssetsValue || 0;

        // 2. Assets - Closing Stock Valuation
        const materials = await this.prisma.material.findMany({
            where: { status: 'Active' },
            select: { id: true, totalQty: true }
        });

        let stockValue = 0;
        for (const m of materials) {
            // Get latest purchase rate for this material
            const lastPurchaseItem = await this.prisma.purchaseItem.findFirst({
                where: { materialId: m.id },
                orderBy: { createdAt: 'desc' },
                select: { rate: true }
            });
            const rate = lastPurchaseItem?.rate || 0;
            stockValue += m.totalQty * rate;
        }

        // 3. Assets - Debtors (Customer Dues)
        const debtorsList = await this.getDueslist(asOfDate);
        const totalDebtors = debtorsList.reduce((sum, item) => sum + (item.netDue > 0 ? item.netDue : 0), 0);
        const totalAdvances = debtorsList.reduce((sum, item) => sum + (item.netDue < 0 ? Math.abs(item.netDue) : 0), 0);

        // 4. Assets - Cash & Bank (Derive from Receipts, Payments, Notes)
        const cashTransactions = await this.prisma.transaction.findMany({
            where: {
                date: { lte: dateLimit },
                type: { in: ['RECEIPT', 'PAYMENT', 'CREDIT_NOTE', 'DEBIT_NOTE'] }
            }
        });

        let liquidCash = 0;
        for (const t of cashTransactions) {
            if (t.type === 'RECEIPT') liquidCash += t.amount;
            else if (t.type === 'PAYMENT') liquidCash -= t.amount;
            else if (t.type === 'CREDIT_NOTE') liquidCash += t.amount;
            else if (t.type === 'DEBIT_NOTE') liquidCash -= t.amount;
        }

        // 5. Liabilities - Creditors (Supplier Dues)
        const suppliers = await this.prisma.supplier.findMany();
        let totalCreditors = 0;
        for (const s of suppliers) {
            const lid = s.ledgerAccountId;
            if (!lid) continue;

            const stxns = await this.prisma.transaction.findMany({
                where: {
                    ledgerAccountId: { in: [lid, s.id] },
                    date: { lte: dateLimit }
                }
            });

            let sBalance = 0;
            for (const st of stxns) {
                if (st.type === 'PURCHASE' || st.type === 'DEBIT_NOTE') sBalance += st.amount;
                else if (st.type === 'PAYMENT' || st.type === 'RECEIPT' || st.type === 'CREDIT_NOTE') sBalance -= st.amount;
            }
            if (sBalance > 0) totalCreditors += sBalance;
        }

        return {
            asOfDate: dateLimit,
            assets: {
                fixedAssets,
                stockValue,
                debtors: totalDebtors,
                liquidCash,
                total: fixedAssets + stockValue + totalDebtors + liquidCash
            },
            liabilities: {
                creditors: totalCreditors,
                advancesFromCustomers: totalAdvances,
                capital: (fixedAssets + stockValue + totalDebtors + liquidCash) - (totalCreditors + totalAdvances),
                total: fixedAssets + stockValue + totalDebtors + liquidCash
            }
        };
    }

    async getGstSummary(fromDate: string, toDate: string) {
        // Robust date parsing for start and end of days
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        // Fetch company settings for extra charge rules
        const company = await this.prisma.company.findFirst();
        const hasGst = Boolean(company?.gstin && company.gstin.trim() !== '');
        const gstOnTransport = Boolean(hasGst && company?.gstOnTransportation);

        // 1. Fetch Sales (Bills) - Filtered by billing period end date
        const bills = await this.prisma.bill.findMany({
            where: {
                dateTo: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            }
        });

        // 2. Fetch Purchases
        const purchases = await this.prisma.purchase.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            }
        });

        // 3. Aggregate Sales
        const sales = {
            taxable: bills.reduce((sum, b) => {
                if (b.taxableAmount && b.taxableAmount > 0) {
                    return sum + b.taxableAmount;
                }
                const subtotal = b.totalAmount || 0;
                const extra = gstOnTransport ? ((b.transportationCost || 0) + (b.greenTax || 0)) : 0;
                return sum + subtotal + extra;
            }, 0),
            cgst: bills.reduce((sum, b) => sum + (b.cgst || 0), 0),
            sgst: bills.reduce((sum, b) => sum + (b.sgst || 0), 0),
            igst: bills.reduce((sum, b) => sum + (b.igst || 0), 0),
        };

        // 4. Aggregate Purchases
        const aggregatedPurchases = {
            taxable: purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
            cgst: purchases.reduce((sum, p) => sum + (p.cgst || 0), 0),
            sgst: purchases.reduce((sum, p) => sum + (p.sgst || 0), 0),
            igst: purchases.reduce((sum, p) => sum + (p.igst || 0), 0),
        };

        return {
            sales,
            purchases: aggregatedPurchases
        };
    }

    async getAnnualReport(year: number) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        // 1. Financial Performance
        const bills = await this.prisma.bill.findMany({
            where: { dateFrom: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
            select: { grandTotal: true, dateFrom: true }
        });

        const purchases = await this.prisma.purchase.findMany({
            where: { date: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
            select: { grandTotal: true, date: true }
        });

        const expenses = await this.prisma.transaction.findMany({
            where: { date: { gte: startDate, lte: endDate }, type: 'EXPENSE' },
            select: { amount: true, date: true }
        });

        // Monthly Breakdown
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(year, i).toLocaleString('default', { month: 'short' }),
            earnings: 0,
            spendings: 0
        }));

        bills.forEach(b => {
            const m = b.dateFrom.getMonth();
            monthlyData[m].earnings += b.grandTotal || 0;
        });

        purchases.forEach(p => {
            const m = p.date.getMonth();
            monthlyData[m].spendings += p.grandTotal || 0;
        });

        expenses.forEach(e => {
            const m = e.date.getMonth();
            monthlyData[m].spendings += e.amount || 0;
        });

        const totalEarnings = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        const totalPurchases = purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalSpendings = totalPurchases + totalExpenses;

        // 2. Material Statistics
        const newMaterials = await this.prisma.material.count({
            where: { createdAt: { gte: startDate, lte: endDate } }
        });

        const challanItems = await this.prisma.challanItem.findMany({
            where: {
                challan: { date: { gte: startDate, lte: endDate }, type: 'RETURN' }
            },
            select: { damageQuantity: true, shortQuantity: true }
        });

        const totalDamage = challanItems.reduce((sum, item) => sum + item.damageQuantity, 0);
        const totalShort = challanItems.reduce((sum, item) => sum + item.shortQuantity, 0);

        return {
            financials: {
                totalEarnings,
                totalSpendings,
                netProfit: totalEarnings - totalSpendings,
                monthlyData
            },
            materials: {
                newCount: newMaterials,
                damageCount: totalDamage,
                shortCount: totalShort
            }
        };
    }

    async getDashboardSummary() {
        const now = new Date();
        const year = now.getFullYear();
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        // 1. Current Year Financials
        const bills = await this.prisma.bill.findMany({
            where: { dateFrom: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
            select: { grandTotal: true, dateFrom: true }
        });

        const purchases = await this.prisma.purchase.findMany({
            where: { date: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
            select: { grandTotal: true, date: true }
        });

        const expenses = await this.prisma.transaction.findMany({
            where: { date: { gte: startDate, lte: endDate }, type: 'EXPENSE' },
            select: { amount: true, date: true }
        });

        // Monthly Breakdown for Chart
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(year, i).toLocaleString('default', { month: 'short' }),
            earnings: 0,
            spendings: 0
        }));

        bills.forEach(b => {
            const m = b.dateFrom.getMonth();
            monthlyData[m].earnings += b.grandTotal || 0;
        });

        purchases.forEach(p => {
            const m = p.date.getMonth();
            monthlyData[m].spendings += p.grandTotal || 0;
        });

        expenses.forEach(e => {
            const m = e.date.getMonth();
            monthlyData[m].spendings += e.amount || 0;
        });

        const totalEarnings = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        const totalPurchases = purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalSpendings = totalPurchases + totalExpenses;

        // 2. Active Inventory Alerts (Shortage)
        const materials = await this.prisma.material.findMany({
            where: { status: 'Active' },
            include: {
                challanItems: {
                    include: { challan: true }
                }
            }
        });

        let shortageCount = 0;
        materials.forEach(m => {
            let issuedQty = 0;
            m.challanItems.forEach(ci => {
                if (ci.challan.type === 'ISSUE') issuedQty += ci.quantity;
                if (ci.challan.type === 'RETURN') issuedQty -= ci.quantity;
            });
            const availableQty = m.totalQty - Math.max(0, issuedQty);
            if (availableQty <= (m.lowerLimit || 0)) {
                shortageCount++;
            }
        });

        // 3. Counts
        const activeAgreements = await this.prisma.agreement.count({
            where: { status: 'Active' }
        });

        const customerCount = await this.prisma.customer.count();
        const vehicleCount = await this.prisma.vehicle.count({
            where: { status: 'Active' }
        });

        return {
            earnings: totalEarnings,
            spendings: totalSpendings,
            profit: totalEarnings - totalSpendings,
            shortageCount,
            activeAgreements,
            customerCount,
            vehicleCount,
            monthlyData,
            year
        };
    }

    async getYearlyBalanceSheet(year: number) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        // 1. Earnings (Sales)
        const bills = await this.prisma.bill.findMany({
            where: { dateFrom: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
            select: { totalAmount: true, cgst: true, sgst: true, igst: true, grandTotal: true }
        });

        // 2. Spendings (Purchases + Expenses)
        const purchases = await this.prisma.purchase.findMany({
            where: { date: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
            select: { totalAmount: true, cgst: true, sgst: true, igst: true, grandTotal: true }
        });

        const expenses = await this.prisma.transaction.findMany({
            where: { date: { gte: startDate, lte: endDate }, type: 'EXPENSE' },
            select: { amount: true, cgst: true, sgst: true, igst: true }
        });

        const earnings = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

        const purchaseAmount = purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
        const expenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const spendings = purchaseAmount + expenseAmount;

        const gstCollected = bills.reduce((sum, b) => sum + (b.cgst || 0) + (b.sgst || 0) + (b.igst || 0), 0);

        const gstPaidOnPurchases = purchases.reduce((sum, p) => sum + (p.cgst || 0) + (p.sgst || 0) + (p.igst || 0), 0);
        const gstPaidOnExpenses = expenses.reduce((sum, e) => sum + (e.cgst || 0) + (e.sgst || 0) + (e.igst || 0), 0);
        const gstPaid = gstPaidOnPurchases + gstPaidOnExpenses;

        return {
            earnings,
            spendings,
            gstCollected,
            gstPaid,
            year
        };
    }
}
