'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { fetchGstSummary, fetchCompany } from '@/lib/api';
import { GstSummaryDocument } from '@/components/accounting/GstSummaryDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
    { ssr: false }
);

function PrintContent() {
    const searchParams = useSearchParams();
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';

    const [summary, setSummary] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!fromDate || !toDate) {
                setLoading(false);
                return;
            }
            try {
                const [summaryData, companyData] = await Promise.all([
                    fetchGstSummary(fromDate, toDate),
                    fetchCompany()
                ]);
                setSummary(summaryData);
                setCompany(companyData);
            } catch (error) {
                console.error('Failed to load print data:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [fromDate, toDate]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading Report...</span>
            </div>
        );
    }

    if (!summary) {
        return <div className="p-8 text-center">Failed to load report data.</div>;
    }

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true}>
                <GstSummaryDocument
                    summary={summary}
                    company={company}
                    fromDate={fromDate}
                    toDate={toDate}
                />
            </PDFViewer>
        </div>
    );
}

export default function GstSummaryPrintPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <PrintContent />
        </Suspense>
    );
}
