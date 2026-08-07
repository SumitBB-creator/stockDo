import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    ledgerAccountId?: string;

    @IsString()
    @IsOptional()
    relationType?: string;

    @IsString()
    @IsOptional()
    relationName?: string;

    @IsString()
    @IsOptional()
    referenceAddress?: string;

    @IsString()
    @IsOptional()
    referenceCity?: string;

    @IsString()
    @IsOptional()
    referencePin?: string;

    @IsString()
    @IsOptional()
    referenceState?: string;

    @IsString()
    @IsOptional()
    referenceCountry?: string;

    @IsString()
    @IsOptional()
    referencePhone?: string;

    @IsString()
    @IsOptional()
    pan?: string;

    // Address
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    pin?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    fax?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    gstIn?: string;
}
