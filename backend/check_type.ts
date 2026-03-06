import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("== START CHECK ==");
    const comp = await prisma.company.findFirst();
    if (!comp) {
        console.log("NO COMPANY FOUND");
        return;
    }
    const rawGst = comp.gstin;
    console.log(`TYPE: ${typeof rawGst}`);
    console.log(`IS_NULL: ${rawGst === null}`);
    console.log(`IS_EMPTY_STRING: ${rawGst === ""}`);
    console.log(`VALUE: [${rawGst}]`);
    console.log(`LENGTH: ${rawGst ? rawGst.length : 0}`);

    // Also check last bill
    const bill = await prisma.bill.findFirst({ orderBy: { createdAt: 'desc' } });
    if (bill) {
        console.log(`LAST BILL: ${bill.billNumber}`);
        console.log(`GST TYPE ON LAST BILL: ${bill.gstType}`);
        console.log(`CREATED AT: ${bill.createdAt.toISOString()}`);
    }
    console.log("== END CHECK ==");
}

main().catch(console.error).finally(() => prisma.$disconnect());
