'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchBill, fetchCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import { BillPage } from '@/components/billing/BillDocument';
import { Document } from '@react-pdf/renderer';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border">Loading PDF Viewer...</div>,
    }
);

export default function BulkBillPrintPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const [bills, setBills] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const idsParam = searchParams.get('ids');

    useEffect(() => {
        const loadData = async () => {
            if (!idsParam) {
                setLoading(false);
                return;
            }

            const ids = idsParam.split(',').filter(id => id.trim() !== '');
            if (ids.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const companyData = await fetchCompany();
                setCompany(companyData);

                // Fetch all selected bills in parallel
                const billsData = await Promise.all(ids.map(id => fetchBill(id)));
                setBills(billsData.filter(b => b != null));
            } catch (error) {
                console.error("Failed to load bulk print data", error);
                toast({
                    title: "Error",
                    description: "Failed to load bills for printing",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [idsParam, toast]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!bills.length) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">No valid bills found to print.</h2>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
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
                        Bulk Printing ({bills.length} Bills)
                    </h1>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-gray-500">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <Document>
                            {bills.map((bill) => (
                                <BillPage key={bill.id} bill={bill} company={company} logoUrl={logoUrl} />
                            ))}
                        </Document>
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}
