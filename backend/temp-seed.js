const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modules = [
    "Master Data",
    "Agreement",
    "Daybook",
    "Ledger",
    "Company Stock",
    "Customer Stock",
    "Challan",
    "Dues List",
    "Billing",
    "Quotation",
    "Return",
    "Manage Role",
    "Manage User",
    "Transportation",
    "Receipt",
    "Transfer",
    "Sale & Purchase",
    "Local Sale",
    "Central Sale",
    "Purchase Details",
    "Local Purchase",
    "Central Purchase"
];

const fullPermissions = modules.map(m => ({
    module: m,
    view: true,
    add: true,
    edit: true,
    delete: true,
    print: true,
    fullControl: true
}));

async function main() {
    console.log('Seeding roles...');

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: { permissions: fullPermissions },
        create: {
            name: 'Admin',
            permissions: fullPermissions
        }
    });

    console.log('Admin role created/updated:', adminRole.id);

    // Assign Admin role to all existing users
    const users = await prisma.user.findMany();
    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: { roleId: adminRole.id }
        });
        console.log(`Updated user ${user.email} with Admin role.`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
