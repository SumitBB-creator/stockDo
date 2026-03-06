import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const companies = await prisma.company.findMany();
    console.log(`FOUND ${companies.length} COMPANIES`);
    for (const c of companies) {
        console.log(`[${c.id}] GSTIN: "${c.gstin}" (${typeof c.gstin})`);
    }

    const bills = await prisma.bill.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
    for (const b of bills) {
        console.log(`[BILL ${b.billNumber}] GST TYPE: ${b.gstType} DATE: ${b.createdAt.toISOString()}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
