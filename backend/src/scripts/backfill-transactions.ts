import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

async function backfillTransactions() {
    console.log("Starting Transaction backfill...");

    // Find all finalized bills
    const bills = await prisma.bill.findMany({
        where: { status: 'FINALIZED' }
    });

    console.log(`Found ${bills.length} finalized bills.`);
    let created = 0;

    for (const bill of bills) {
        // Check if transaction already exists for this bill
        const existingTx = await prisma.transaction.findFirst({
            where: { referenceId: bill.id, type: 'BILL' }
        });

        if (!existingTx) {
            await prisma.transaction.create({
                data: {
                    ledgerAccountId: bill.customerId,
                    date: bill.dateTo,
                    type: 'BILL',
                    amount: bill.grandTotal || 0,
                    referenceId: bill.id,
                    description: `Generated Bill #${bill.billNumber} for period ${format(new Date(bill.dateFrom), 'dd/MM/yyyy')} to ${format(new Date(bill.dateTo), 'dd/MM/yyyy')}`
                }
            });
            created++;
        }
    }

    console.log(`Backfill complete. Created ${created} missing transactions.`);
}

backfillTransactions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
