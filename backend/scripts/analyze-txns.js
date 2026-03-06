
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const uniqueIds = await prisma.transaction.groupBy({
            by: ['ledgerAccountId'],
            _count: {
                _all: true
            }
        });

        console.log('Unique Ledger Account IDs in Transactions:');
        for (const item of uniqueIds) {
            console.log(`- ${item.ledgerAccountId} (Count: ${item._count._all})`);
        }

        // Also check if any transaction descriptions mention "Sejwal" or "Company"
        const descriptiveTxns = await prisma.transaction.findMany({
            where: {
                OR: [
                    { description: { contains: 'Sejwal', mode: 'insensitive' } },
                    { description: { contains: 'Company', mode: 'insensitive' } }
                ]
            }
        });
        console.log('\nTransactions mentioning "Sejwal" or "Company":', JSON.stringify(descriptiveTxns, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
