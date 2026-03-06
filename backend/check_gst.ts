import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const comp = await prisma.company.findFirst();
    console.log('Company:', comp);
    const lastBill = await prisma.bill.findFirst({ orderBy: { createdAt: 'desc' }, include: { items: true } });
    console.log('Last Bill:', lastBill?.gstType, lastBill?.gstRate, lastBill?.grandTotal, lastBill?.totalAmount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
