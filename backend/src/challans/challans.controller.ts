import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChallansService } from './challans.service';
import { CreateChallanDto } from './dto/create-challan.dto';

@Controller('challans')
export class ChallansController {
    constructor(private readonly challansService: ChallansService) { }

    @Post()
    async create(@Body() createChallanDto: CreateChallanDto) {
        try {
            return await this.challansService.create(createChallanDto);
        } catch (error) {
            console.error("Backend Create Challan Error:", error);
            throw error;
        }
    }

    @Get()
    findAll() {
        return this.challansService.findAll();
    }

    @Get('company-stock')
    getCompanyStock() {
        return this.challansService.getCompanyStock();
    }

    @Get('transportation')
    getTransportationChallans(
        @Query('month') month?: string,
        @Query('year') year?: string,
        @Query('customerId') customerId?: string
    ) {
        return this.challansService.getTransportationChallans({ month, year, customerId });
    }

    @Get('stock/:customerId')
    getCustomerStock(@Param('customerId') customerId: string) {
        return this.challansService.getCustomerStock(customerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.challansService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.challansService.remove(id);
    }
}
