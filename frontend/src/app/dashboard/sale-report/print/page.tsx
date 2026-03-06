'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchFilteredBills, fetchCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import SaleReportDocument from '@/components/accounting/SaleReportDocument';

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

    const [bills, setBills] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const type = searchParams.get('type') || 'LOCAL';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const searchTerm = searchParams.get('searchTerm') || '';

    useEffect(() => {
        const loadData = async () => {
            try {
                const [companyData, billsData] = await Promise.all([
                    fetchCompany(),
                    fetchFilteredBills({
                        fromDate: fromDate || undefined,
                        toDate: toDate || undefined,
                    })
                ]);

                setCompany(companyData);

                // Filter by GST type and search term
                const filtered = billsData.filter((bill: any) => {
                    const matchesType = type === 'LOCAL' ? bill.gstType === 'CGST_SGST' : bill.gstType === 'IGST';
                    const matchesSearch = !searchTerm ||
                        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        bill.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesType && matchesSearch;
                });

                setBills(filtered);
            } catch (error) {
                console.error("Failed to load report data", error);
                toast({
                    title: "Error",
                    description: "Failed to load report data for printing",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [type, fromDate, toDate, searchTerm, toast]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const logoUrl = company?.logo
        ? (company.logo.startsWith('http')
            ? company.logo
            : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${company.logo}`)
        : null;

    const reportTitle = type === 'LOCAL' ? 'Local Sale Report (CGST/SGST)' : 'Central Sale Report (IGST)';
    const periodDisplay = `Period: ${fromDate ? new Date(fromDate).toLocaleDateString() : 'N/A'} To: ${toDate ? new Date(toDate).toLocaleDateString() : 'N/A'}`;

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        {reportTitle}
                    </h1>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-gray-500">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <SaleReportDocument
                            bills={bills}
                            company={company}
                            logoUrl={logoUrl}
                            title={reportTitle}
                            period={periodDisplay}
                        />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}

export default function SaleReportPrintPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <PrintContent />
        </Suspense>
    );
}
