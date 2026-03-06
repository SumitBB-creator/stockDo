import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
    constructor(private readonly transfersService: TransfersService) { }

    @Post()
    async create(@Body() createTransferDto: CreateTransferDto) {
        return this.transfersService.create(createTransferDto);
    }

    @Get()
    async findAll() {
        return this.transfersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.transfersService.findOne(id);
    }
}
