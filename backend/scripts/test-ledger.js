
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// We need to simulate the TransactionsService or just the logic
const { v4: uuidv4 } = require('uuid');

async function test() {
    const prisma = new PrismaClient();
    const customerId = 'b0d2f7ff-f91e-41a5-97bf-88f032c3538d';

    try {
        const from = new Date(0);
        const to = new Date();

        console.log('Resolving party...');
        let party = null;
        const customer = await prisma.customer.findFirst({
            where: { OR: [{ id: customerId }, { ledgerAccountId: customerId }] },
            select: { name: true }
        });
        if (customer) party = { name: customer.name, type: 'CUSTOMER' };
        console.log('Party:', party);

        console.log('Fetching transactions...');
        const periodTransactions = await prisma.transaction.findMany({
            where: {
                ledgerAccountId: customerId,
            },
            orderBy: { date: 'asc' }
        });

        console.log('Transaction count:', periodTransactions.length);
        if (periodTransactions.length > 0) {
            console.log('First txn:', JSON.stringify(periodTransactions[0], null, 2));
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
