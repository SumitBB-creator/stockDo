import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class AgreementItemDto {
    @IsString()
    @IsNotEmpty()
    materialId: string;

    @IsNumber()
    hireRate: number;

    @IsNumber()
    damageRecoveryRate: number;

    @IsNumber()
    shortRecoveryRate: number;

    @IsString()
    rateAppliedAs: string;
}

export class CreateAgreementDto {
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsDateString()
    @IsNotEmpty()
    validFrom: string;

    @IsString()
    @IsOptional()
    siteAddress?: string;

    @IsString()
    @IsOptional()
    residenceAddress?: string;

    @IsString()
    @IsOptional()
    authorizedRepresentative?: string;

    @IsInt()
    @IsOptional()
    minimumRentPeriod?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AgreementItemDto)
    items: AgreementItemDto[];

    @IsString()
    @IsOptional()
    status?: string;
}
