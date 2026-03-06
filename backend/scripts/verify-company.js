
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function verify() {
    try {
        console.log('Fetching company...');
        const company = await prisma.company.findFirst();

        if (!company) {
            console.log('No company found.');
            return;
        }

        console.log('Current Company Data:', JSON.stringify(company, null, 2));

        if (!company.ledgerAccountId) {
            console.log('ledgerAccountId is missing. Assigning one...');
            const updated = await prisma.company.update({
                where: { id: company.id },
                data: { ledgerAccountId: uuidv4() }
            });
            console.log('Updated Company Data:', JSON.stringify(updated, null, 2));
        } else {
            console.log('ledgerAccountId already exists:', company.ledgerAccountId);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
