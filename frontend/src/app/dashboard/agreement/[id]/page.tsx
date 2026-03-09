'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAgreement, fetchCompany, fetchCustomers, fetchActiveAgreementTemplate } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import AgreementDocument from '@/components/agreement/AgreementDocument';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-md border">Loading PDF Viewer...</div>,
    }
);

export default function AgreementViewPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [agreement, setAgreement] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch agreement, company and active template
                const [agreementData, companyData, templateData] = await Promise.all([
                    fetchAgreement(params.id as string),
                    fetchCompany(),
                    fetchActiveAgreementTemplate()
                ]);

                // We need customer details. Agreement data usually contains minimal customer info or just ID.
                // Should check if agreementData.customer is populated. 
                // Based on previous work, fetchAgreement usually returns relations.
                // But if not sufficient, we might need to fetch customer separately.
                // Let's assume fetchAgreement returns { ...agreement, customer: { ... } } or similar
                // If customer is just an ID, we fetch it.

                let detailedAgreement = agreementData;

                // Check if customer is fully populated (e.g. has name)
                if (agreementData.customerId && (!agreementData.customer || !agreementData.customer.name)) {
                    // Fetch customers to find the one. 
                    // This is slightly inefficient if we have an endpoint for single customer, 
                    // but we used fetchCustomers() (all) in other places.
                    // Better would be if fetchAgreement includes it.
                    // Let's check api.ts later. For now, assuming fetchAgreement includes 'customer' relation as per standard Prisma patterns if included.
                    // If not, we might miss data. 
                    // To be safe, let's fetch customers list and find. Or if we have fetchCustomer(id)
                    const customers = await fetchCustomers();
                    const customer = customers.find((c: any) => c.id === agreementData.customerId);
                    detailedAgreement = { ...agreementData, customer };
                }

                setAgreement(detailedAgreement);
                setCompany(companyData);
                setTemplate(templateData);
            } catch (error) {
                console.error("Failed to load data", error);
                toast({
                    title: "Error",
                    description: "Failed to load agreement details",
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

    if (!agreement) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Agreement not found</h2>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

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
                        Agreement: {agreement.agreementId}
                    </h1>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="h-full w-full max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-gray-500">
                    <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                        <AgreementDocument agreement={agreement} company={company} logoUrl={logoUrl} template={template} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}
