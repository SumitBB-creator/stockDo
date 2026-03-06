'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Settings as SettingsIcon, Loader2, FileText } from 'lucide-react';
import { fetchQuotations } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Quotation {
    id: string;
    quotationId: string;
    date: string;
    customer: {
        name: string;
    };
    status: string;
    items: any[];
}

export default function QuotationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadQuotations();
    }, []);

    const loadQuotations = async () => {
        try {
            setLoading(true);
            const data = await fetchQuotations();
            setQuotations(data);
        } catch (error) {
            console.error('Failed to fetch quotations:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch quotations',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter((q) =>
        q.quotationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Quotations</h2>
                    <p className="text-muted-foreground">
                        Manage your quotations and estimates.
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/quotation/create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Quotation
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search quotations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quotation ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredQuotations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No quotations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredQuotations.map((quotation) => (
                                <TableRow key={quotation.id}>
                                    <TableCell className="font-medium">{quotation.quotationId}</TableCell>
                                    <TableCell>{format(new Date(quotation.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>{quotation.customer?.name || 'N/A'}</TableCell>
                                    <TableCell>{quotation.items?.length || 0}</TableCell>
                                    <TableCell>{quotation.status}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/quotation/${quotation.id}`)}>
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/quotation/${quotation.id}/edit`)}>
                                                Edit
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
