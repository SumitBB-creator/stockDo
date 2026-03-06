
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const customer = await prisma.customer.findFirst({
            where: { name: { contains: 'AP ENGINEERS', mode: 'insensitive' } }
        });

        if (customer) {
            console.log('Customer Record:', JSON.stringify(customer, null, 2));

            const txnsWithId = await prisma.transaction.count({
                where: { ledgerAccountId: customer.id }
            });

            const txnsWithLedgerId = customer.ledgerAccountId ? await prisma.transaction.count({
                where: { ledgerAccountId: customer.ledgerAccountId }
            }) : 0;

            console.log(`Transactions with id (${customer.id}):`, txnsWithId);
            console.log(`Transactions with ledgerAccountId (${customer.ledgerAccountId}):`, txnsWithLedgerId);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
