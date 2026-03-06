'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, FileSignature, Trash2, Eye } from 'lucide-react';
import { api } from '@/lib/api';

const fetchNotes = async (date: string, customerId?: string) => {
    const params: any = { date };
    // Fetch all transactions for the day
    const response = await api.get('/transactions/daybook', { params });
    const data = response.data?.data ? response.data.data : response.data;

    let notes = Array.isArray(data) ? data.filter((t: any) => t.type === 'CREDIT_NOTE' || t.type === 'DEBIT_NOTE') : [];

    if (customerId) {
        notes = notes.filter((t: any) => t.ledgerAccountId === customerId);
    }

    return notes;
};

export default function NotesListPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const { fetchCustomers } = await import('@/lib/api');
                const data = await fetchCustomers();
                setCustomers(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadCustomers();
    }, []);

    useEffect(() => {
        loadNotes();
    }, [selectedDate, selectedCustomer]);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const data = await fetchNotes(selectedDate, selectedCustomer);
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this note? This will reverse the transaction.')) return;

        try {
            await api.delete(`/transactions/${id}`);
            toast({ title: 'Success', description: 'Note deleted successfully' });
            loadNotes();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' });
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Credit & Debit Notes</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage manual adjustments, discounts, and returns</p>
                </div>
                <Button onClick={() => router.push('/dashboard/accounting/notes/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </div>

            {/* Filter Controls Row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Date Selector */}
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-[180px]"
                    />
                </div>

                {/* Customer Autocomplete Search */}
                <div className="w-[300px]">
                    <Autocomplete
                        items={customers.map(c => ({
                            value: c.id,
                            label: c.name,
                            subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                        }))}
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder="Search Customer..."
                        className="bg-background"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="border rounded-lg overflow-x-auto shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="whitespace-nowrap text-xs">Type</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Dated</TableHead>
                            <TableHead className="min-w-[150px] text-xs">Customer Details</TableHead>
                            <TableHead className="min-w-[200px] text-xs">Reason/Particulars</TableHead>
                            <TableHead className="text-right whitespace-nowrap text-xs">Amount (₹)</TableHead>
                            <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : notes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                    <FileSignature className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No notes found for this date/customer.
                                </TableCell>
                            </TableRow>
                        ) : (
                            notes.map((note, idx) => {
                                const isCredit = note.type === 'CREDIT_NOTE';
                                return (
                                    <TableRow key={note.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                ${isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {isCredit ? 'CREDIT NOTE' : 'DEBIT NOTE'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">
                                            {format(new Date(note.date), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell className="font-medium text-primary/90">
                                            {note.entityName}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate" title={note.description}>
                                            {note.description?.split('Note: ')[1] || note.description}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium tabular-nums ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(note.amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/accounting/notes/${note.id}`)}
                                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary mr-1"
                                                title="View PDF"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View PDF</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(note.id)}
                                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
