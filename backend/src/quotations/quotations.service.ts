import { Injectable } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) { }

  private async generateQuotationId(): Promise<string> {
    const lastQuotation = await this.prisma.quotation.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!lastQuotation) {
      return 'QTN-0001';
    }

    const lastId = lastQuotation.quotationId;
    const parts = lastId.split('-');
    if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
      const number = parseInt(parts[1]) + 1;
      return `QTN-${number.toString().padStart(4, '0')}`;
    }

    return `QTN-${Date.now()}`; // Fallback
  }

  async create(createQuotationDto: CreateQuotationDto) {
    const quotationId = await this.generateQuotationId();
    const { items, ...quotationData } = createQuotationDto;

    return this.prisma.quotation.create({
      data: {
        quotationId,
        ...quotationData,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  findAll() {
    return this.prisma.quotation.findMany({
      include: {
        customer: true,
        items: {
          include: {
            material: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  findLatestByCustomer(customerId: string) {
    return this.prisma.quotation.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto) {
    const { items, ...quotationData } = updateQuotationDto;

    const existingQuotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingQuotation) {
      throw new Error(`Quotation with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create a snapshot of the current version
      await tx.quotationVersion.create({
        data: {
          quotationId: id,
          version: existingQuotation.version,
          data: JSON.parse(JSON.stringify(existingQuotation)), // Deep copy to ensure JSON compatibility
        },
      });

      // 2. Handle Items Update
      if (items) {
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      }

      // 3. Update Quotation
      return tx.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          version: { increment: 1 },
          ...(items ? {
            items: {
              create: items,
            },
          } : {}),
        },
        include: { items: true },
      });
    });
  }

  getVersions(id: string) {
    return this.prisma.quotationVersion.findMany({
      where: { quotationId: id },
      orderBy: { version: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.quotation.delete({
      where: { id },
    });
  }
}
