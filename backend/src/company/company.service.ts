import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) { }

  async getCompany() {
    return this.prisma.company.findFirst();
  }

  async updateCompany(data: CreateCompanyDto) {
    const existing = await this.prisma.company.findFirst();
    if (existing) {
      return this.prisma.company.update({
        where: { id: existing.id },
        data: {
          ...data,
          ledgerAccountId: existing.ledgerAccountId || uuidv4()
        },
      });
    } else {
      return this.prisma.company.create({
        data: {
          ...data,
          ledgerAccountId: data.ledgerAccountId || uuidv4()
        },
      });
    }
  }
}
