import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaterialDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsString()
    @IsOptional()
    hsn?: string;

    @IsString()
    @IsOptional()
    sac?: string;

    @IsInt()
    @IsOptional()
    totalQty?: number;

    @IsInt()
    @IsOptional()
    damageQty?: number;

    @IsInt()
    @IsOptional()
    shortQty?: number;

    @IsInt()
    @IsOptional()
    lowerLimit?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    branchId?: string;
}
