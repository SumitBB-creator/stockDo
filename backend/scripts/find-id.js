
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const targetId = 'b0d2f7ff-f91e-41a5-97bf-88f032c3538d';

    const customer = await prisma.customer.findFirst({ where: { OR: [{ id: targetId }, { ledgerAccountId: targetId }] } });
    const employee = await prisma.employee.findFirst({ where: { OR: [{ id: targetId }, { ledgerAccountId: targetId }] } });
    const supplier = await prisma.supplier.findFirst({ where: { OR: [{ id: targetId }, { ledgerAccountId: targetId }] } });
    const company = await prisma.company.findFirst({ where: { id: targetId } });

    console.log("Looking for ID:", targetId);
    if (customer) console.log("Found in Customer:", customer.name);
    if (employee) console.log("Found in Employee:", employee.name);
    if (supplier) console.log("Found in Supplier:", supplier.name);
    if (company) console.log("Found in Company:", company.companyName);

    if (!customer && !employee && !supplier && !company) {
        console.log("ID not found in any related table.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
