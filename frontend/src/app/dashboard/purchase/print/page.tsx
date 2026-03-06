'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import PurchaseReportDocument from '@/components/accounting/PurchaseReportDocument';

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

    const [purchases, setPurchases] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const type = searchParams.get('type') || 'LOCAL';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const searchTerm = searchParams.get('searchTerm') || '';

    useEffect(() => {
        const loadData = async () => {
            try {
                const [purchResponse, suppResponse, companyResponse] = await Promise.all([
                    api.get('/purchases'),
                    api.get('/suppliers'),
                    api.get('/company')
                ]);

                const companyData = companyResponse.data;
                const companyState = companyData?.state?.toLowerCase() || '';
                setCompany(companyData);

                // Filter by type and search term
                let data = purchResponse.data;
                const filtered = data.filter((p: any) => {
                    const supplierState = p.supplier?.state?.toLowerCase() || '';
                    const matchesType = type === 'LOCAL' ? supplierState === companyState : supplierState !== companyState;
                    const matchesSearch = !searchTerm ||
                        p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesType && matchesSearch;
                });

                setPurchases(filtered);
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

    const reportTitle = type === 'LOCAL' ? 'Local Purchase Report' : 'Central Purchase Report';
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
                        <PurchaseReportDocument
                            purchases={purchases}
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

export default function PurchaseReportPrintPage() {
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
