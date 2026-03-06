import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@stockdo.com';
    const password = 'password123';

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('User NOT found!');
        return;
    }

    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
