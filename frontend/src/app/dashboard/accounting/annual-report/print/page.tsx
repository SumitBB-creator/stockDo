'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { fetchAnnualReport, fetchCompany } from '@/lib/api';
import { AnnualReportDocument } from '@/components/accounting/AnnualReportDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
    { ssr: false }
);

function PrintContent() {
    const searchParams = useSearchParams();
    const yearStr = searchParams.get('year') || new Date().getFullYear().toString();
    const year = parseInt(yearStr, 10);

    const [data, setData] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [reportData, companyData] = await Promise.all([
                    fetchAnnualReport(year),
                    fetchCompany()
                ]);
                setData(reportData);
                setCompany(companyData);
            } catch (error) {
                console.error('Failed to load print data:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [year]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading Annual Report...</span>
            </div>
        );
    }

    if (!data) {
        return <div className="p-8 text-center">Failed to load report data.</div>;
    }

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true}>
                <AnnualReportDocument
                    data={data}
                    company={company}
                    year={year}
                />
            </PDFViewer>
        </div>
    );
}

export default function AnnualReportPrintPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <PrintContent />
        </Suspense>
    );
}
