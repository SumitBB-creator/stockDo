import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { MaterialsModule } from './materials/materials.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { QuotationsModule } from './quotations/quotations.module';
import { CompanyModule } from './company/company.module';
import { AgreementsModule } from './agreements/agreements.module';
import { ChallansModule } from './challans/challans.module';
import { BillingModule } from './billing/billing.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PurchasesModule } from './purchases/purchases.module';
import { RolesModule } from './roles/roles.module';
import { TransfersModule } from './transfers/transfers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyRevenueModule } from './daily-revenue/daily-revenue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    EmployeesModule,
    SuppliersModule,
    MaterialsModule,
    VehiclesModule,
    QuotationsModule,
    CompanyModule,
    AgreementsModule,
    ChallansModule,
    BillingModule,
    TransactionsModule,
    PurchasesModule,
    RolesModule,
    TransfersModule,
    ScheduleModule.forRoot(),
    DailyRevenueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
