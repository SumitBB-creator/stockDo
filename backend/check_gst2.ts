import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const companies = await prisma.company.findMany();
    console.log('COMPANIES:', JSON.stringify(companies, null, 2));

    const latestBills = await prisma.bill.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
    console.log('LATEST BILLS:', JSON.stringify(latestBills.map(b => ({
        id: b.id, billNumber: b.billNumber, totalAmount: b.totalAmount,
        gstType: b.gstType, gstRate: b.gstRate, cgst: b.cgst, sgst: b.sgst,
        igst: b.igst, grandTotal: b.grandTotal, createdAt: b.createdAt
    })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
