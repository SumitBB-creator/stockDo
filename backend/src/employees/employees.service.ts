import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async create(createEmployeeDto: CreateEmployeeDto) {
        // Generate Ledger Account ID logic
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

        return this.prisma.employee.create({
            data: {
                ...createEmployeeDto,
                ledgerAccountId: createEmployeeDto.ledgerAccountId || newLedgerId,
            },
        });
    }

    findAll() {
        return this.prisma.employee.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.employee.findUnique({
            where: { id },
        });
    }

    update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
        return this.prisma.employee.update({
            where: { id },
            data: updateEmployeeDto,
        });
    }

    remove(id: string) {
        return this.prisma.employee.delete({
            where: { id },
        });
    }
}
