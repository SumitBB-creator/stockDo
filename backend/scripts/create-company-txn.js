
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create() {
    try {
        const company = await prisma.company.findFirst();
        if (!company || !company.ledgerAccountId) {
            console.error('No company or ledgerAccountId found');
            return;
        }

        console.log('Creating transaction for Company...');
        const txn = await prisma.transaction.create({
            data: {
                ledgerAccountId: company.ledgerAccountId,
                date: new Date(),
                type: 'RECEIPT',
                amount: 500,
                description: 'Test Company Receipt',
                transactionNumber: 'TEST-R-0001'
            }
        });
        console.log('Created:', JSON.stringify(txn, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

create();
