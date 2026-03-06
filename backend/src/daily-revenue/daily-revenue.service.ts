import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DailyRevenueService {
    private readonly logger = new Logger(DailyRevenueService.name);

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyRevenueCalculation() {
        this.logger.log('Starting daily revenue calculation...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Get all active agreements
            const agreements = await this.prisma.agreement.findMany({
                where: { status: 'Active' },
                include: {
                    items: true,
                    challans: {
                        include: {
                            items: true,
                        },
                    },
                },
            });

            let totalDailyRevenue = 0;

            for (const agreement of agreements) {
                // Calculate current stock levels for this agreement
                const stockMap = new Map<string, number>();

                for (const challan of agreement.challans) {
                    for (const item of challan.items) {
                        const currentQty = stockMap.get(item.materialId) || 0;
                        if (challan.type === 'ISSUE') {
                            stockMap.set(item.materialId, currentQty + item.quantity);
                        } else if (challan.type === 'RETURN') {
                            stockMap.set(item.materialId, currentQty - item.quantity);
                        }
                    }
                }

                // Apply rates from agreement items
                for (const [materialId, quantity] of stockMap.entries()) {
                    if (quantity <= 0) continue;

                    const agreementItem = agreement.items.find(i => i.materialId === materialId);
                    if (agreementItem) {
                        totalDailyRevenue += quantity * agreementItem.hireRate;
                    }
                }
            }

            // 2. Store or update the revenue for today
            await this.prisma.dailyRevenue.upsert({
                where: { date: today },
                update: { amount: totalDailyRevenue },
                create: {
                    date: today,
                    amount: totalDailyRevenue,
                },
            });

            this.logger.log(`Daily revenue calculated and stored: ₹${totalDailyRevenue.toFixed(2)}`);
        } catch (error) {
            this.logger.error('Failed to calculate daily revenue:', error);
        }
    }

    async getRevenueTrend() {
        // Return last 30 days of data, sorted chronologically
        const results = await this.prisma.dailyRevenue.findMany({
            orderBy: { date: 'desc' },
            take: 30,
        });
        return results.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
}
