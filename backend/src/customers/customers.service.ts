import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async create(createCustomerDto: CreateCustomerDto) {
    // Generate Ledger Account ID
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

    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        ledgerAccountId: createCustomerDto.ledgerAccountId || newLedgerId,
      },
    });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
