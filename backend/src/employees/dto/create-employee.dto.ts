import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    ledgerAccountId?: string;

    @IsString()
    @IsOptional()
    relationType?: string; // S/O, D/O, W/O, C/O

    @IsString()
    @IsOptional()
    relationName?: string;

    @IsString()
    @IsOptional()
    pan?: string;

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
