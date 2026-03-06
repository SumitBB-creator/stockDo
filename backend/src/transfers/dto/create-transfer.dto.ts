import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class TransferItemDto {
    @IsString()
    @IsNotEmpty()
    materialId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;
}

export class CreateTransferDto {
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    fromCustomerId: string;

    @IsString()
    @IsNotEmpty()
    toCustomerId: string;

    @IsString()
    @IsNotEmpty()
    agreementId: string;

    @IsString()
    @IsOptional()
    vehicleNumber?: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsNumber()
    @IsOptional()
    senderTransportation?: number;

    @IsNumber()
    @IsOptional()
    receiverTransportation?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransferItemDto)
    items: TransferItemDto[];
}
