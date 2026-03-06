import { Controller, Post, Body, Get, Query, Delete, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() data: any) {
        return this.transactionsService.create(data);
    }

    @Get('dashboard-summary')
    getDashboardSummary() {
        return this.transactionsService.getDashboardSummary();
    }

    @Get('dues')
    getDueslist(@Query('asOfDate') asOfDate?: string) {
        return this.transactionsService.getDueslist(asOfDate);
    }

    @Get('daybook')
    getDaybook(@Query('date') date: string) {
        return this.transactionsService.getDaybook(date);
    }

    @Get('ledger')
    getLedger(@Query('customerId') customerId: string, @Query('fromDate') fromDate: string, @Query('toDate') toDate: string) {
        return this.transactionsService.getLedger(customerId, fromDate, toDate);
    }

    @Get('balance-sheet')
    getBalanceSheet(@Query('asOfDate') asOfDate?: string) {
        return this.transactionsService.getBalanceSheet(asOfDate);
    }

    @Get('gst-summary')
    getGstSummary(@Query('fromDate') fromDate: string, @Query('toDate') toDate: string) {
        return this.transactionsService.getGstSummary(fromDate, toDate);
    }

    @Get('yearly-balance-sheet')
    getYearlyBalanceSheet(@Query('year') year: string) {
        return this.transactionsService.getYearlyBalanceSheet(parseInt(year, 10) || new Date().getFullYear());
    }

    @Get('annual-report')
    getAnnualReport(@Query('year') year: string) {
        return this.transactionsService.getAnnualReport(parseInt(year, 10) || new Date().getFullYear());
    }

    @Get(':id')
    getTransaction(@Param('id') id: string) {
        return this.transactionsService.getTransaction(id);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.transactionsService.deleteTransaction(id);
    }
}
