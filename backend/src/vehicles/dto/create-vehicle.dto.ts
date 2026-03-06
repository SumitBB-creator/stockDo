import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    vehicleNumber: string;

    @IsString()
    vehicleType: string;

    @IsOptional()
    @IsDateString()
    nextServiceDue?: string;

    @IsOptional()
    @IsDateString()
    pollutionDue?: string;

    @IsOptional()
    @IsDateString()
    insuranceDue?: string;

    @IsOptional()
    @IsDateString()
    roadTaxDue?: string;

    @IsOptional()
    @IsDateString()
    tokenTaxDue?: string;

    @IsOptional()
    @IsDateString()
    nationalPermitDue?: string;

    @IsOptional()
    @IsDateString()
    statePermitDue?: string;

    @IsOptional()
    @IsDateString()
    fitnessTestDue?: string;

    @IsOptional()
    @IsString()
    details?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
