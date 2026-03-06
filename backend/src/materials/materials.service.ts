import { Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialsService {
    constructor(private prisma: PrismaService) { }

    async create(createMaterialDto: CreateMaterialDto) {
        // Auto-generate Material ID (M0001, M0002...)
        const lastMaterial = await this.prisma.material.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        let newMaterialId = 'M0001';
        if (lastMaterial && lastMaterial.materialId) {
            const match = lastMaterial.materialId.match(/^M(\d+)$/);
            if (match) {
                const nextId = parseInt(match[1], 10) + 1;
                newMaterialId = `M${nextId.toString().padStart(4, '0')}`;
            }
        }

        return this.prisma.material.create({
            data: {
                ...createMaterialDto,
                materialId: newMaterialId,
                branchId: createMaterialDto.branchId || 'B00001', // Default Branch ID
            },
        });
    }

    findAll() {
        return this.prisma.material.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.material.findUnique({
            where: { id },
        });
    }

    update(id: string, updateMaterialDto: UpdateMaterialDto) {
        return this.prisma.material.update({
            where: { id },
            data: updateMaterialDto,
        });
    }

    remove(id: string) {
        return this.prisma.material.delete({
            where: { id },
        });
    }
}
