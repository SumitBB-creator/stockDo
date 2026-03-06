'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, fetchCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import NoteDocument from '@/components/notes/NoteDocument';

// Dynamically import PDFViewer with ssr disabled
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground gap-2" />
                <span className="ml-2 text-muted-foreground">Loading PDF Viewer...</span>
            </div>
        ),
    }
);

export default function NotePrintPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [note, setNote] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;

            try {
                // Fetch the transaction record (Note)
                const noteRes = await api.get(`/transactions/${params.id}`);
                setNote(noteRes.data);

                // Fetch Company details
                const companyData = await fetchCompany();
                setCompany(companyData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ title: 'Error', description: 'Failed to load Note details.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
                <p className="text-muted-foreground">Note not found or could not be loaded.</p>
                <Button onClick={() => router.push('/dashboard/accounting/notes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const logoUrl = company?.logoUrl ? (company.logoUrl.startsWith('http') ? company.logoUrl : `${apiUrl.replace('/api/v1', '')}${company.logoUrl}`) : null;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/accounting/notes')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Notes
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight">
                        Note: {note.transactionNumber || `${note.type === 'CREDIT_NOTE' ? 'CN' : 'DN'}-${note.id.toString().slice(-4).padStart(4, '0')}`}
                    </h2>
                </div>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-background">
                <PDFViewer width="100%" height="100%" className="border-none">
                    <NoteDocument
                        note={note}
                        company={company}
                        logoUrl={logoUrl}
                    />
                </PDFViewer>
            </div>
        </div>
    );
}
