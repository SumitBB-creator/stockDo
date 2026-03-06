'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, ReceiptText } from 'lucide-react';
import { api } from '@/lib/api';

// Re-using api but typing the call directly since we don't have a specific fetchReceipts function
const fetchReceipts = async (date: string, customerId?: string) => {
    const params: any = { date };
    // Fetch all transactions for the day
    const response = await api.get('/transactions/daybook', { params });
    const data = response.data.data ? response.data.data : response.data;

    // Filter down to only Receipts, and matching customer if provided
    let receipts = Array.isArray(data) ? data.filter((t: any) => t.type === 'RECEIPT') : [];

    if (customerId) {
        receipts = receipts.filter((t: any) => t.ledgerAccountId === customerId);
    }

    return receipts;
};

export default function ReceiptListPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        // Load customers for the filter
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
        loadReceipts();
    }, [selectedDate, selectedCustomer]);

    const loadReceipts = async () => {
        setLoading(true);
        try {
            const data = await fetchReceipts(selectedDate, selectedCustomer);
            setReceipts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
            // Don't toast on every change if it fails silently might be better, but keep for debugging
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this receipt? This will reverse the transaction.')) return;

        try {
            // Placeholder: need standard delete endpoint for transaction
            await api.delete(`/transactions/${id}`);
            toast({ title: 'Success', description: 'Receipt deleted successfully' });
            loadReceipts();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to delete receipt', variant: 'destructive' });
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
                    <h2 className="text-xl font-bold tracking-tight">Receipts</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage and view customer payments</p>
                </div>
                <Button onClick={() => router.push('/dashboard/accounting/receipt/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Receipt
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
                            <TableHead className="w-[40px] text-xs">Sr.No.</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Receipt No</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Dated</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Payment As</TableHead>
                            <TableHead className="min-w-[150px] text-xs">Parties Details</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Payment Mode</TableHead>
                            <TableHead className="text-right whitespace-nowrap text-xs">Amount (₹)</TableHead>
                            <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground font-medium">Loading records...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : receipts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    <ReceiptText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                    No receipts found for this date.
                                </TableCell>
                            </TableRow>
                        ) : (
                            receipts.map((r, i) => (
                                <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="text-xs font-medium align-top">{i + 1}</TableCell>
                                    <TableCell className="text-xs font-medium align-top whitespace-nowrap">{r.transactionNumber || `R-${r.id.toString().slice(-4).padStart(4, '0')}`}</TableCell>
                                    <TableCell className="text-[11px] align-top whitespace-nowrap">{format(new Date(r.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell className="text-xs align-top whitespace-nowrap">{r.description?.includes('Advance') ? 'Advance Payment' : 'Bill Payment'}</TableCell>
                                    <TableCell className="align-top">
                                        <div className="font-medium text-xs leading-tight">{r.entityName || 'Unknown Party'}</div>
                                    </TableCell>
                                    <TableCell className="text-xs align-top whitespace-nowrap">{r.description?.split('via ')[1]?.split(' ')[0] || 'Cash'}</TableCell>
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-semibold">
                                        {formatCurrency(r.amount)}
                                    </TableCell>
                                    <TableCell className="text-xs align-top text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs px-2"
                                                onClick={() => router.push(`/dashboard/accounting/receipt/${r.id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-7 text-xs px-2"
                                                onClick={() => handleDelete(r.id)}
                                            >
                                                Delete
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
