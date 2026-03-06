
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Fetching last 10 transactions...');
        const txns = await prisma.transaction.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
        console.log(JSON.stringify(txns, null, 2));

        const company = await prisma.company.findFirst();
        console.log('Company ledgerAccountId:', company.ledgerAccountId);

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
