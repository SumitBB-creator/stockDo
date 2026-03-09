import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { AgreementTemplatesService } from './agreement-templates.service';
import { CreateAgreementTemplateDto } from './dto/create-agreement-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agreement-templates')
@UseGuards(JwtAuthGuard)
export class AgreementTemplatesController {
    constructor(private readonly agreementTemplatesService: AgreementTemplatesService) { }

    @Get('active')
    getActiveTemplate() {
        return this.agreementTemplatesService.getActiveTemplate();
    }

    @Get()
    getAllTemplates() {
        return this.agreementTemplatesService.getAllTemplates();
    }

    @Put(':id')
    updateTemplate(@Param('id') id: string, @Body() dto: CreateAgreementTemplateDto) {
        return this.agreementTemplatesService.updateTemplate(id, dto);
    }
}
