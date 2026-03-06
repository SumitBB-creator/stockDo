import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    async create(createSupplierDto: CreateSupplierDto) {
        // Unified Ledger Account ID Logic
        const lastCustomer = await this.prisma.customer.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { ledgerAccountId: true },
        });

        const lastEmployee = await this.prisma.employee.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { ledgerAccountId: true },
        });

        const lastSupplier = await this.prisma.supplier.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { ledgerAccountId: true },
        });

        let maxId = 0;
        const extractId = (id: string | null | undefined) => {
            if (!id) return 0;
            const match = id.match(/^LAID(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        };

        const lastCustId = extractId(lastCustomer?.ledgerAccountId);
        const lastEmpId = extractId(lastEmployee?.ledgerAccountId);
        const lastSupId = extractId(lastSupplier?.ledgerAccountId);

        maxId = Math.max(lastCustId, lastEmpId, lastSupId);
        const newLedgerId = `LAID${(maxId + 1).toString().padStart(6, '0')}`;

        return this.prisma.supplier.create({
            data: {
                ...createSupplierDto,
                ledgerAccountId: createSupplierDto.ledgerAccountId || newLedgerId,
            },
        });
    }

    findAll() {
        return this.prisma.supplier.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.supplier.findUnique({
            where: { id },
        });
    }

    update(id: string, updateSupplierDto: UpdateSupplierDto) {
        return this.prisma.supplier.update({
            where: { id },
            data: updateSupplierDto,
        });
    }

    remove(id: string) {
        return this.prisma.supplier.delete({
            where: { id },
        });
    }
}
