import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuotationItemDto {
    @IsString()
    materialId: string;

    @IsNumber()
    hireRate: number;

    @IsNumber()
    damageRecoveryRate: number;

    @IsNumber()
    shortRecoveryRate: number;

    @IsOptional()
    @IsString()
    rateAppliedAs?: string;
}

export class CreateQuotationDto {
    @IsString()
    customerId: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuotationItemDto)
    items: CreateQuotationItemDto[];
}
