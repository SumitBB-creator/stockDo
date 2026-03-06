import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DailyRevenueService } from './daily-revenue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('daily-revenue')
export class DailyRevenueController {
    constructor(private readonly dailyRevenueService: DailyRevenueService) { }

    @Get('trend')
    getTrend() {
        return this.dailyRevenueService.getRevenueTrend();
    }

    @Post('trigger')
    triggerCalculation() {
        return this.dailyRevenueService.handleDailyRevenueCalculation();
    }
}
