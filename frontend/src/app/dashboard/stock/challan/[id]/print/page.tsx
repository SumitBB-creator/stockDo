'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchChallan, fetchCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import ChallanDocument from '@/components/challan/ChallanDocument';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border">Loading PDF Viewer...</div>,
    }
);

export default function ChallanPrintPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [challan, setChallan] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [challanData, companyData] = await Promise.all([
                    fetchChallan(params.id as string),
                    fetchCompany()
                ]);
                setChallan(challanData);
                setCompany(companyData);
            } catch (error) {
                console.error("Failed to load data", error);
                toast({
                    title: "Error",
                    description: "Failed to load challan details",
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

    if (!challan) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Challan not found</h2>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const isReturn = challan.type === 'RETURN';
    const titleLabel = isReturn ? 'Return Challan' : 'Delivery Challan';

    // Construct full Logo URL
    const logoUrl = company?.logo
        ? (company.logo.startsWith('http')
            ? company.logo
            : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${company.logo}`)
        : null;

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Toolbar */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        {titleLabel}: {challan.challanNumber}
                    </h1>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-gray-500">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <ChallanDocument challan={challan} company={company} logoUrl={logoUrl} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}
