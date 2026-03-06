import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(private readonly prisma: PrismaService) { }

    create(createVehicleDto: CreateVehicleDto) {
        return this.prisma.vehicle.create({
            data: createVehicleDto,
        });
    }

    findAll() {
        return this.prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.vehicle.findUnique({
            where: { id },
        });
    }

    update(id: string, updateVehicleDto: UpdateVehicleDto) {
        return this.prisma.vehicle.update({
            where: { id },
            data: updateVehicleDto,
        });
    }

    remove(id: string) {
        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
}
