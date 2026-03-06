import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    // List unbilled customers for a month — MUST be before :id route
    @Get('unbilled')
    async getUnbilledCustomers(
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.billingService.getUnbilledCustomers(Number(month), Number(year));
    }

    // Preview bill for a single customer — MUST be before :id route
    @Get('preview')
    async previewBill(
        @Query('customerId') customerId: string,
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.billingService.generateBill(customerId, Number(month), Number(year));
    }

    // List finalized bills for a month
    @Get()
    async getBillsByMonth(
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.billingService.getBillsByMonth(Number(month), Number(year));
    }

    // Filter finalized bills based on dynamic parameters
    @Get('filter')
    async getFilteredBills(
        @Query('year') year?: string,
        @Query('month') month?: string,
        @Query('customerId') customerId?: string,
        @Query('customerIds') customerIds?: string,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ) {
        return this.billingService.getFilteredBills({ year, month, customerId, customerIds, fromDate, toDate });
    }

    // Get a single bill by ID — MUST be after named routes
    @Get(':id')
    async getBillById(@Param('id') id: string) {
        return this.billingService.getBillById(id);
    }

    // Finalize bills for selected customers
    @Post('finalize')
    async finalizeBills(@Body() data: { customerIds: string[], month: number, year: number }) {
        return this.billingService.finalizeBills(data.customerIds, data.month, data.year);
    }

    // Custom date range preview
    @Post('custom-preview')
    async customPreview(@Body() data: { customerId: string, fromDate: string, toDate: string }) {
        return this.billingService.generateBillCustomRange(data.customerId, new Date(data.fromDate), new Date(data.toDate));
    }

    // Finalize a custom date range bill
    @Post('finalize-custom')
    async finalizeCustomBill(@Body() data: { customerId: string, fromDate: string, toDate: string }) {
        return this.billingService.finalizeCustomBill(data.customerId, new Date(data.fromDate), new Date(data.toDate));
    }

    // Cancel a bill
    @Patch(':id/cancel')
    async cancelBill(@Param('id') id: string) {
        return this.billingService.cancelBill(id);
    }
}
