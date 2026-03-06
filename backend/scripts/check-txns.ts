import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const txns = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });
    console.log(JSON.stringify(txns, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
