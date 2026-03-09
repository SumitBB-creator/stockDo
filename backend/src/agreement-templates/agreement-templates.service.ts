import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgreementTemplateDto } from './dto/create-agreement-template.dto';

@Injectable()
export class AgreementTemplatesService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.initializeDefaultTemplate();
    }

    private async initializeDefaultTemplate() {
        const count = await this.prisma.agreementTemplate.count();
        if (count === 0) {
            const defaultIntro = "This agreement come in force from this date {date} between {party1} (Party No-1) and {party2} (Party No-2).";
            const defaultTerms = [
                "That the 1st party shall supply the shuttering material on hire basis exour godown to Party No. 2 for their site situated at {siteAddress} and residence at {residenceAddress}",
                "That the 2nd Party undertake to make regular payments of bill amounting for the hired period and items on the charged rates which has been agreed between the both parties within the seven day on receipt of the bill in every month by cheque.",
                "That the 2nd Part undertake not to transfer the any hired items to any other site without the permission of 1st Party which shall be writting of the 2nd Party.",
                "That the 2nd Party undertake to return all the hired materials in safe & sound condition. In any damage or lost conditional the 2nd Party shall pay the cost of item which is agreed between the both parties.",
                "That the 2nd Party has authorized Mr. {authorizedRepresentative} as his/her representative and is also attest his signature. This representative Mr. {authorizedRepresentative} shall sign, receive the challan and bills etc. of the 2nd party on his/her behalf.",
                "That the both parties undertake to honour this agreement and shall never seek any reason to evade their responsibility.",
                "That in case of any dispute with regard to the terms and condition shall be (subjected to) settled at component court of law at New Delhi (Delhi).",
                "That the minimum rent period for the hired material shall be {minimumRentPeriod} Days."
            ];

            await this.prisma.agreementTemplate.create({
                data: {
                    name: 'Standard Agreement',
                    introText: defaultIntro,
                    terms: defaultTerms,
                    isActive: true,
                },
            });
            console.log('Initialized default agreement template');
        }
    }

    async getActiveTemplate() {
        return this.prisma.agreementTemplate.findFirst({
            where: { isActive: true },
        });
    }

    async updateTemplate(id: string, dto: CreateAgreementTemplateDto) {
        return this.prisma.agreementTemplate.update({
            where: { id },
            data: {
                ...dto,
            },
        });
    }

    async getAllTemplates() {
        return this.prisma.agreementTemplate.findMany();
    }
}
