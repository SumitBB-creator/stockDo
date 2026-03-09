import { Module } from '@nestjs/common';
import { AgreementTemplatesService } from './agreement-templates.service';
import { AgreementTemplatesController } from './agreement-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AgreementTemplatesController],
    providers: [AgreementTemplatesService],
    exports: [AgreementTemplatesService],
})
export class AgreementTemplatesModule { }
