'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchTransaction, fetchCompany } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import ReceiptDocument from '@/components/receipt/ReceiptDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border text-slate-500">Generating PDF...</div>,
    }
);

export default function ReceiptPrintView() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [receipt, setReceipt] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [receiptData, companyData] = await Promise.all([
                    fetchTransaction(params.id as string),
                    fetchCompany()
                ]);

                if (receiptData.type !== 'RECEIPT') {
                    toast({ title: "Invalid Type", description: "Not a receipt record.", variant: "destructive" });
                    router.push('/dashboard/accounting/receipt');
                    return;
                }

                setReceipt(receiptData);
                setCompany(companyData);
            } catch (error) {
                console.error("Failed to load receipt:", error);
                toast({ title: "Error", description: "Failed to load receipt details.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadData();
        }
    }, [params.id, router, toast]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!receipt) return null;

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
                        Back to Receipts
                    </Button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-slate-600">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <ReceiptDocument receipt={receipt} company={company} logoUrl={logoUrl} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}
