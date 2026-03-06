'use client';

import { PurchaseForm } from '@/components/accounting/purchase-form';
import { useParams } from 'next/navigation';

export default function EditPurchasePage() {
    const params = useParams();
    const id = params.id as string;

    return <PurchaseForm id={id} />;
}
