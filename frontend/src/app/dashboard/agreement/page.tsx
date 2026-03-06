'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAgreements, deleteAgreement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Loader2, Trash2, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Agreement } from '@/types/agreement';

export default function AgreementListPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAgreements = async () => {
        try {
            const data = await fetchAgreements();
            setAgreements(data);
        } catch (error) {
            console.error('Failed to load agreements:', error);
            toast({
                title: 'Error',
                description: 'Failed to load agreements',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAgreements();
    }, [toast]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agreement?')) return;
        try {
            await deleteAgreement(id);
            toast({
                title: 'Success',
                description: 'Agreement deleted successfully',
            });
            loadAgreements();
        } catch (error) {
            console.error('Failed to delete agreement:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete agreement',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Agreements</h2>
                <Button onClick={() => router.push('/dashboard/agreement/create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Agreement
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agreement ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Valid From</TableHead>
                            <TableHead>Terms</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agreements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No agreements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            agreements.map((agreement) => (
                                <TableRow key={agreement.id}>
                                    <TableCell className="font-medium">{agreement.agreementId}</TableCell>
                                    <TableCell>{agreement.customer?.name}</TableCell>
                                    <TableCell>{format(new Date(agreement.validFrom), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{agreement.minimumRentPeriod} Days</TableCell>
                                    <TableCell>{agreement.status}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/agreement/${agreement.id}`)}>
                                                <FileText className="h-4 w-4 mr-1" /> View
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/agreement/${agreement.id}/edit`)}>
                                                <Edit className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(agreement.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
