
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const customers = await prisma.customer.findMany({ select: { ledgerAccountId: true } });
    const employees = await prisma.employee.findMany({ select: { ledgerAccountId: true } });
    const suppliers = await prisma.supplier.findMany({ select: { ledgerAccountId: true } });

    const partyIds = new Set([
        ...customers.map(c => c.ledgerAccountId),
        ...employees.map(e => e.ledgerAccountId),
        ...suppliers.map(s => s.ledgerAccountId)
    ].filter(Boolean));

    const transactions = await prisma.transaction.findMany({
        select: { ledgerAccountId: true },
        distinct: ['ledgerAccountId']
    });

    const unknownAccounts = transactions.filter(t => !partyIds.has(t.ledgerAccountId));

    console.log("Account Summary:");
    console.log("Party Ledger Account IDs count:", partyIds.size);
    console.log("Unique Ledger Account IDs in Transactions:", transactions.map(t => t.ledgerAccountId));
    console.log("Unknown Ledger Account IDs:", unknownAccounts.map(t => t.ledgerAccountId));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
