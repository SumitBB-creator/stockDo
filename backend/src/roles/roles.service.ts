import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });
    }

    findOne(id: string) {
        return this.prisma.role.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        });
    }

    create(data: { name: string; permissions: any }) {
        return this.prisma.role.create({
            data
        });
    }

    update(id: string, data: { name?: string; permissions?: any }) {
        return this.prisma.role.update({
            where: { id },
            data
        });
    }

    remove(id: string) {
        return this.prisma.role.delete({
            where: { id }
        });
    }
}
