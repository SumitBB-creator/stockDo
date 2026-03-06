import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { SupabaseService } from '../common/services/supabase.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, SupabaseService],
})
export class CompanyModule { }
