export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string; // Kept for backward compatibility or general address
    ledgerAccountId?: string;
    relationType?: string;
    relationName?: string;
    pan?: string;

    // Office
    officeAddress?: string;
    officeCity?: string;
    officePin?: string;
    officeState?: string;
    officeCountry?: string;
    officePhone?: string;
    officeFax?: string;
    officeEmail?: string;
    officeGst?: string;

    // Site
    siteAddress?: string;
    siteCity?: string;
    sitePin?: string;
    siteState?: string;
    siteCountry?: string;
    sitePhone?: string;
    siteFax?: string;
    siteEmail?: string;
    siteGst?: string;

    gstIn?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerDto {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    ledgerAccountId?: string;
    relationType?: string;
    relationName?: string;
    pan?: string;

    officeAddress?: string;
    officeCity?: string;
    officePin?: string;
    officeState?: string;
    officeCountry?: string;
    officePhone?: string;
    officeFax?: string;
    officeEmail?: string;
    officeGst?: string;

    siteAddress?: string;
    siteCity?: string;
    sitePin?: string;
    siteState?: string;
    siteCountry?: string;
    sitePhone?: string;
    siteFax?: string;
    siteEmail?: string;
    siteGst?: string;

    gstIn?: string;
}

export interface Employee {
    id: string;
    name: string;
    ledgerAccountId?: string;
    relationType?: string;
    relationName?: string;
    pan?: string;

    address?: string;
    city?: string;
    pin?: string;
    state?: string;
    country?: string;
    phone?: string;
    fax?: string;
    email?: string;
    gstIn?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateEmployeeDto {
    name: string;
    ledgerAccountId?: string;
    relationType?: string;
    relationName?: string;
    pan?: string;

    address?: string;
    city?: string;
    pin?: string;
    state?: string;
    country?: string;
    phone?: string;
    fax?: string;
    email?: string;
    gstIn?: string;
}

export interface Supplier {
    id: string;
    name: string;
    ledgerAccountId?: string;
    relationType?: string;
    relationName?: string;
    pan?: string;

    address?: string;
    city?: string;
    pin?: string;
    state?: string;
    country?: string;
    phone?: string;
    fax?: string;
    email?: string;
    gstIn?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierDto {
    name: string;
    ledgerAccountId?: string;
    relationType?: string;
    relationName?: string;
    pan?: string;

    address?: string;
    city?: string;
    pin?: string;
    state?: string;
    country?: string;
    phone?: string;
    fax?: string;
    email?: string;
    gstIn?: string;
}

export interface Material {
    id: string;
    name: string;
    materialId: string;
    unit?: string;
    hsn?: string;
    sac?: string;

    totalQty: number;
    damageQty: number;
    shortQty: number;
    lowerLimit: number;

    hireRate?: number;
    damageRecoveryRate?: number;
    shortRecoveryRate?: number;

    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMaterialDto {
    name: string;
    unit?: string;
    hsn?: string;
    sac?: string;

    totalQty?: number;
    damageQty?: number;
    shortQty?: number;
    lowerLimit?: number;

    hireRate?: number;
    damageRecoveryRate?: number;
    shortRecoveryRate?: number;

    status?: string;
}
