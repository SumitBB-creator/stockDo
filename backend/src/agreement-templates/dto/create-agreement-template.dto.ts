import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateAgreementTemplateDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    introText: string;

    @IsArray()
    terms: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
