'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchBill, fetchCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import BillDocument from '@/components/billing/BillDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border">Loading PDF Viewer...</div>,
    }
);

export default function BillViewPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [bill, setBill] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [billData, companyData] = await Promise.all([
                    fetchBill(params.id as string),
                    fetchCompany()
                ]);
                setBill(billData);
                setCompany(companyData);
            } catch (error) {
                console.error("Failed to load data", error);
                toast({
                    title: "Error",
                    description: "Failed to load bill details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadData();
        }
    }, [params.id, toast]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Bill not found</h2>
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
                        Bill: {bill.billNumber}
                    </h1>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${bill.status === 'FINALIZED' ? 'bg-green-100 text-green-700' :
                        bill.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            bill.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                        }`}>
                        {bill.status}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-gray-500">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <BillDocument bill={bill} company={company} logoUrl={logoUrl} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}
