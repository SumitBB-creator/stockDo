import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateCustomerDto {
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
    relativeAadhar?: string;

    @IsString()
    @IsOptional()
    residenceAddress?: string;

    @IsString()
    @IsOptional()
    pan?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    // Office Address
    @IsString()
    @IsOptional()
    officeAddress?: string;

    @IsString()
    @IsOptional()
    officeCity?: string;

    @IsString()
    @IsOptional()
    officePin?: string;

    @IsString()
    @IsOptional()
    officeState?: string;

    @IsString()
    @IsOptional()
    officeCountry?: string;

    @IsString()
    @IsOptional()
    officePhone?: string;

    @IsString()
    @IsOptional()
    officeFax?: string;

    @IsEmail()
    @IsOptional()
    officeEmail?: string;

    @IsString()
    @IsOptional()
    officeGst?: string;

    // Site Address
    @IsString()
    @IsOptional()
    siteAddress?: string;

    @IsString()
    @IsOptional()
    siteCity?: string;

    @IsString()
    @IsOptional()
    sitePin?: string;

    @IsString()
    @IsOptional()
    siteState?: string;

    @IsString()
    @IsOptional()
    siteCountry?: string;

    @IsString()
    @IsOptional()
    sitePhone?: string;

    @IsString()
    @IsOptional()
    siteFax?: string;

    @IsEmail()
    @IsOptional()
    siteEmail?: string;

    @IsString()
    @IsOptional()
    siteGst?: string;

    @IsString()
    @IsOptional()
    gstIn?: string;
}
