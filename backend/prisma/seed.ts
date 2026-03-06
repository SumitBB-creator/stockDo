import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const modules = [
    "Master Data", "Agreement", "Daybook", "Ledger", "Company Stock",
    "Customer Stock", "Challan", "Dues List", "Billing", "Quotation",
    "Return", "Manage Role", "Manage User", "Transportation", "Receipt",
    "Transfer", "Sale & Purchase", "Local Sale", "Central Sale",
    "Purchase Details", "Local Purchase", "Central Purchase"
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
    console.log('Seeding database...');

    // Create Super Admin
    const email = 'superadmin@stockdo.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin Role
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: { permissions: fullPermissions },
        create: {
            name: 'Admin',
            permissions: fullPermissions
        }
    });

    const user = await prisma.user.upsert({
        where: { email },
        update: { roleId: adminRole.id },
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            roleId: adminRole.id,
        },
    });

    console.log({ user });
    console.log(`Seeding finished. User: ${email}, Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
