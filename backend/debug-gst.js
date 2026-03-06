const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mocking logic if needed, but we can just use the real models
async function debugGstSummary() {
    const month = 3; // March
    const year = 2026;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    console.log(`Debugging GST Summary for ${month}/${year}`);
    console.log(`Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
        // 1. Fetch Sales (Bills)
        console.log('Fetching Bills...');
        const bills = await prisma.bill.findMany({
            where: {
                generationDate: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            }
        });
        console.log(`Found ${bills.length} bills`);

        // 2. Fetch Purchases
        console.log('Fetching Purchases...');
        const purchases = await prisma.purchase.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            }
        });
        console.log(`Found ${purchases.length} purchases`);

        // 3. Fetch Notes with GST
        console.log('Fetching Notes...');
        const notes = await prisma.transaction.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
                type: { in: ['DEBIT_NOTE', 'CREDIT_NOTE'] },
                taxableAmount: { not: null }
            }
        });
        console.log(`Found ${notes.length} notes`);

        // Aggregation Logic (copied from service)
        const summary = {
            sales: {
                taxable: bills.reduce((sum, b) => sum + (b.taxableAmount || 0), 0),
                cgst: bills.reduce((sum, b) => sum + (b.cgst || 0), 0),
                sgst: bills.reduce((sum, b) => sum + (b.sgst || 0), 0),
                igst: bills.reduce((sum, b) => sum + (b.igst || 0), 0),
            },
            purchases: {
                taxable: purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
                cgst: purchases.reduce((sum, p) => sum + (p.cgst || 0), 0),
                sgst: purchases.reduce((sum, p) => sum + (p.sgst || 0), 0),
                igst: purchases.reduce((sum, p) => sum + (p.igst || 0), 0),
            },
            debitNotes: {
                taxable: notes.filter(n => n.type === 'DEBIT_NOTE').reduce((sum, n) => sum + (n.taxableAmount || 0), 0),
                cgst: notes.filter(n => n.type === 'DEBIT_NOTE').reduce((sum, n) => sum + (n.cgst || 0), 0),
                sgst: notes.filter(n => n.type === 'DEBIT_NOTE').reduce((sum, n) => sum + (n.sgst || 0), 0),
                igst: notes.filter(n => n.type === 'DEBIT_NOTE').reduce((sum, n) => sum + (n.igst || 0), 0),
            },
            creditNotes: {
                taxable: notes.filter(n => n.type === 'CREDIT_NOTE').reduce((sum, n) => sum + (n.taxableAmount || 0), 0),
                cgst: notes.filter(n => n.type === 'CREDIT_NOTE').reduce((sum, n) => sum + (n.cgst || 0), 0),
                sgst: notes.filter(n => n.type === 'CREDIT_NOTE').reduce((sum, n) => sum + (n.sgst || 0), 0),
                igst: notes.filter(n => n.type === 'CREDIT_NOTE').reduce((sum, n) => sum + (n.igst || 0), 0),
            }
        };

        console.log('Summary calculated successfully:');
        console.log(JSON.stringify(summary, null, 2));

    } catch (err) {
        console.error('ERROR during GST Summary calculation:');
        console.error(err);
    }
}

debugGstSummary().catch(console.error).finally(() => prisma.$disconnect());
