import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.company.findFirst();
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.company.findFirst();
    if (existing) {
      return this.prisma.company.update({
        where: { id: existing.id },
        data: {
          ...data,
          ledgerAccountId: existing.ledgerAccountId || randomUUID()
        },
      });
    }
    return this.prisma.company.create({
      data: {
        ...data,
        ledgerAccountId: data.ledgerAccountId || randomUUID()
      },
    });
  }
}
