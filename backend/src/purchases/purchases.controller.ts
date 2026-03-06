import { Controller, Get, Post, Body, Query, Param, Patch, Delete } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Controller('purchases')
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Post()
    async create(@Body() createPurchaseDto: CreatePurchaseDto) {
        return this.purchasesService.create(createPurchaseDto);
    }

    @Get()
    async findAll(
        @Query('supplierId') supplierId?: string,
        @Query('gstType') gstType?: string,
        @Query('status') status?: string,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ) {
        return this.purchasesService.findAll({ supplierId, gstType, status, fromDate, toDate });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
        return this.purchasesService.update(id, updatePurchaseDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.purchasesService.remove(id);
    }
}
