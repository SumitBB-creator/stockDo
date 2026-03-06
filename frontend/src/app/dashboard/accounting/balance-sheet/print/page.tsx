'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchCompany, fetchBalanceSheet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import BalanceSheetDocument from '@/components/accounting/BalanceSheetDocument';
import { format } from 'date-fns';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border">Loading PDF Viewer...</div>,
    }
);

function PrintContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const [data, setData] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const asOfDate = searchParams.get('asOfDate') || format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [bsData, companyData] = await Promise.all([
                    fetchBalanceSheet(asOfDate),
                    fetchCompany()
                ]);

                setData(bsData);
                setCompany(companyData);
            } catch (error) {
                console.error("Failed to load data", error);
                toast({
                    title: "Error",
                    description: "Failed to load balance sheet data",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [asOfDate, toast]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const logoUrl = company?.logo
        ? (company.logo.startsWith('http')
            ? company.logo
            : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${company.logo}`)
        : null;

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        Balance Sheet Report: {format(new Date(asOfDate), 'dd MMM yyyy')}
                    </h1>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full mx-auto shadow-2xl rounded-lg overflow-hidden bg-gray-500">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <BalanceSheetDocument
                            data={data}
                            company={company}
                            logoUrl={logoUrl}
                            asOfDate={asOfDate}
                        />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}

export default function PrintBalanceSheetPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <PrintContent />
        </Suspense>
    );
}
