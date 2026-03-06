
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const company = await prisma.company.findFirst();
        const idSet = new Set([company.id]);
        if (company.ledgerAccountId) idSet.add(company.ledgerAccountId);

        const companyIds = Array.from(idSet);
        console.log('Company IDs to exclude (if using notIn):', companyIds);

        // Instead of querying by company ID, we query everything else
        // because "customer transactions are against the company"
        const txns = await prisma.transaction.findMany({
            where: {
                ledgerAccountId: { notIn: companyIds }
            },
            orderBy: { date: 'asc' }
        });

        console.log(`Found ${txns.length} transactions in global pool.`);

        // Enumerate them
        for (const t of txns) {
            console.log(`${t.date.toISOString()} | ${t.type} | ${t.amount} | Account: ${t.ledgerAccountId}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
