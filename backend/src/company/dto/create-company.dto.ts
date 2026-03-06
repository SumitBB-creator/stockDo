import { IsString, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    companyName: string;

    @IsOptional()
    @IsString()
    employerName?: string;

    @IsOptional()
    @IsString()
    address1?: string;

    @IsOptional()
    @IsString()
    address2?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    stateCode?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    pin?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    fax?: string;

    @IsOptional()
    @IsString()
    pan?: string;

    @IsOptional()
    @IsString()
    gstin?: string;

    @IsOptional()
    @IsString()
    history?: string;

    @IsOptional()
    @IsString()
    logo?: string;

    @IsOptional()
    @IsBoolean()
    gstOnTransportation?: boolean;

    @IsOptional()
    @IsString()
    ledgerAccountId?: string;

    @IsOptional()
    @IsNumber()
    fixedAssetsValue?: number;
}
