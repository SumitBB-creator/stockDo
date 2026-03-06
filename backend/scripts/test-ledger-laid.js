
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const customerId = 'LAID000001'; // Logical ID

    try {
        const from = new Date(0);
        const to = new Date();

        console.log(`Resolving party for ${customerId}...`);
        const idSet = new Set([customerId]);
        let party = null;
        const customer = await prisma.customer.findFirst({
            where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] },
            select: { id: true, name: true, ledgerAccountId: true }
        });
        if (customer) {
            party = { name: customer.name, type: 'CUSTOMER' };
            idSet.add(customer.id);
            if (customer.ledgerAccountId) idSet.add(customer.ledgerAccountId);
        }
        console.log('Resolved Party:', party);
        console.log('All IDs:', Array.from(idSet));

        console.log('Fetching transactions...');
        const periodTransactions = await prisma.transaction.findMany({
            where: {
                ledgerAccountId: { in: Array.from(idSet) },
            },
            orderBy: { date: 'asc' }
        });

        console.log('Transaction count:', periodTransactions.length);

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
