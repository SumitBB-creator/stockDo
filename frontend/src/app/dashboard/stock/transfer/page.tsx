'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Loader2, RefreshCcw, FileText, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { formatCustomerAddress } from '@/lib/utils';

export default function TransferListPage() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transfers');
            setTransfers(response.data);
        } catch (error) {
            console.error('Failed to fetch transfers:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load transfers.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, []);

    const filteredTransfers = transfers.filter(t =>
        t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.fromCustomer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.toCustomer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Material Transfers</h2>
                    <p className="text-muted-foreground">Track movement of stock between different sites.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchTransfers} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/dashboard/stock/transfer/new">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
                            <Plus className="h-4 w-4 mr-2" />
                            New Transfer
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transfers..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Transfer ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>From (Sender)</TableHead>
                            <TableHead>To (Receiver)</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredTransfers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No transfers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransfers.map((transfer) => (
                                <TableRow key={transfer.id}>
                                    <TableCell className="font-mono font-medium text-blue-500">
                                        {transfer.transferNumber}
                                    </TableCell>
                                    <TableCell>{format(new Date(transfer.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{transfer.fromCustomer?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {formatCustomerAddress(transfer.fromCustomer)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{transfer.toCustomer?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {formatCustomerAddress(transfer.toCustomer)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                            {transfer.items?.length || 0} Materials
                                        </span>
                                    </TableCell>
                                    <TableCell>{transfer.vehicleNumber || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
                                            <FileText className="h-4 w-4" />
                                        </Button>
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
