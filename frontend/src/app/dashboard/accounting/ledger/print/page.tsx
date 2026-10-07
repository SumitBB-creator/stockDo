'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { fetchLedger, fetchCompany } from '@/lib/api';
import { LedgerDocument } from '@/components/accounting/LedgerDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
    { ssr: false }
);

function PrintContent() {
    const searchParams = useSearchParams();
    const partyId = searchParams.get('partyId') || '';
    const fromDate = searchParams.get('from') || '';
    const toDate = searchParams.get('to') || '';

    const [data, setData] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!partyId) {
                setLoading(false);
                return;
            }
            try {
                const [ledgerData, companyData] = await Promise.all([
                    fetchLedger(partyId, fromDate, toDate),
                    fetchCompany()
                ]);
                setData(ledgerData);
                setCompany(companyData);
            } catch (error) {
                console.error('Failed to load print data:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [partyId, fromDate, toDate]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading Ledger...</span>
            </div>
        );
    }

    if (!partyId) {
        return <div className="p-8 text-center">No party selected for ledger.</div>;
    }

    if (!data) {
        return <div className="p-8 text-center">Failed to load ledger data.</div>;
    }

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true}>
                <LedgerDocument
                    data={data}
                    company={company}
                    fromDate={fromDate}
                    toDate={toDate}
                />
            </PDFViewer>
        </div>
    );
}

export default function LedgerPrintPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <PrintContent />
        </Suspense>
    );
}
