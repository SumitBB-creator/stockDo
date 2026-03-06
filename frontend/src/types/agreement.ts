export interface Agreement {
    id: string;
    agreementId: string;
    customerId: string;
    customer?: {
        name: string;
        siteAddress?: string;
        officeAddress?: string;
    };
    validFrom: string;
    siteAddress?: string;
    residenceAddress?: string;
    authorizedRepresentative?: string;
    minimumRentPeriod: number;
    status: string;
    items: AgreementItem[];
    createdAt: string;
    updatedAt: string;
}

export interface AgreementItem {
    id: string;
    agreementId: string;
    materialId: string;
    material?: {
        name: string;
    };
    hireRate: number;
    damageRecoveryRate: number;
    shortRecoveryRate: number;
    rateAppliedAs: string;
}
