'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchDaybook, fetchCompany } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import DaybookDocument from '@/components/daybook/DaybookDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border text-slate-500">Generating Daybook PDF...</div>,
    }
);

function DaybookPrintContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [transactions, setTransactions] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const termParam = searchParams.get('search') || '';

    useEffect(() => {
        const loadData = async () => {
            try {
                const [daybookRes, companyData] = await Promise.all([
                    fetchDaybook(dateParam),
                    fetchCompany()
                ]);

                const actualData = daybookRes.data ? daybookRes.data : daybookRes;
                let dataArray = Array.isArray(actualData) ? actualData : [];

                if (termParam) {
                    const lower = termParam.toLowerCase();
                    dataArray = dataArray.filter(t =>
                        t.entityName?.toLowerCase().includes(lower) ||
                        t.referenceId?.toLowerCase().includes(lower) ||
                        t.description?.toLowerCase().includes(lower)
                    );
                }

                setTransactions(dataArray);
                setCompany(companyData);
            } catch (error) {
                console.error("Failed to load daybook for print:", error);
                toast({ title: "Error", description: "Failed to load daybook details.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dateParam, termParam, toast]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const logoUrl = company?.logo
        ? (company.logo.startsWith('http')
            ? company.logo
            : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${company.logo}`)
        : null;

    return (
        <div className="h-screen flex flex-col bg-slate-200">
            {/* Toolbar */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Daybook
                    </Button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-slate-600">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <DaybookDocument
                            transactions={transactions}
                            company={company}
                            logoUrl={logoUrl}
                            date={dateParam}
                        />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}

export default function DaybookPrintPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>}>
            <DaybookPrintContent />
        </Suspense>
    );
}
