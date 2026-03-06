
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const company = await prisma.company.findFirst();
        console.log('Company Record:', JSON.stringify(company, null, 2));

        if (company) {
            const txnsWithId = await prisma.transaction.count({
                where: { ledgerAccountId: company.id }
            });

            const txnsWithLedgerId = company.ledgerAccountId ? await prisma.transaction.count({
                where: { ledgerAccountId: company.ledgerAccountId }
            }) : 0;

            console.log(`Transactions with id (${company.id}):`, txnsWithId);
            console.log(`Transactions with ledgerAccountId (${company.ledgerAccountId}):`, txnsWithLedgerId);

            const sampleTxns = await prisma.transaction.findMany({
                where: {
                    OR: [
                        { ledgerAccountId: company.id },
                        { ledgerAccountId: company.ledgerAccountId || 'none' }
                    ]
                },
                take: 5
            });
            console.log('Sample Transactions:', JSON.stringify(sampleTxns, null, 2));
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
