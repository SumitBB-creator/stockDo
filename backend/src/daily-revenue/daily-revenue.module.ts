import { Module } from '@nestjs/common';
import { DailyRevenueService } from './daily-revenue.service';
import { DailyRevenueController } from './daily-revenue.controller';

@Module({
    controllers: [DailyRevenueController],
    providers: [DailyRevenueService],
})
export class DailyRevenueModule { }
