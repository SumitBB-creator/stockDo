import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ChallanType } from '@prisma/client';

class ChallanItemDto {
    @IsString()
    @IsNotEmpty()
    materialId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsOptional()
    damageQuantity?: number;

    @IsNumber()
    @IsOptional()
    shortQuantity?: number;
}

export class CreateChallanDto {
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsOptional()
    agreementId?: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsEnum(ChallanType)
    @IsOptional()
    type: ChallanType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChallanItemDto)
    items: ChallanItemDto[];

    @IsString()
    @IsOptional()
    vehicleNumber?: string;

    @IsString()
    @IsOptional()
    driverName?: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    // New Fields
    @IsString()
    @IsOptional()
    manualChallanNumber?: string;

    @IsNumber()
    @IsOptional()
    goodsValue?: number;

    @IsNumber()
    @IsOptional()
    weight?: number;

    @IsNumber()
    @IsOptional()
    transportationCost?: number;

    @IsNumber()
    @IsOptional()
    greenTax?: number;

    @IsString()
    @IsOptional()
    transporterName?: string;

    @IsString()
    @IsOptional()
    biltyNumber?: string;

    @IsString()
    @IsOptional()
    eWayBillNo?: string;

    @IsString()
    @IsOptional()
    receiverName?: string;

    @IsString()
    @IsOptional()
    receiverMobile?: string;

    @IsString()
    @IsOptional()
    driverMobile?: string;

    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @IsString()
    @IsOptional()
    timeOut?: string;

    @IsString()
    @IsOptional()
    timeIn?: string;
}
