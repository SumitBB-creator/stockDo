import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class CreatePurchaseItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    rate: number;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    materialId?: string;
}

export class CreatePurchaseDto {
    @IsString()
    @IsOptional()
    billNumber?: string;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsNotEmpty()
    supplierId: string;

    @IsNumber()
    totalAmount: number;

    @IsString()
    @IsOptional()
    gstType?: string;

    @IsNumber()
    @IsOptional()
    gstRate?: number;

    @IsNumber()
    @IsOptional()
    cgst?: number;

    @IsNumber()
    @IsOptional()
    sgst?: number;

    @IsNumber()
    @IsOptional()
    igst?: number;

    @IsNumber()
    @IsOptional()
    grandTotal?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseItemDto)
    items: CreatePurchaseItemDto[];
}
