'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchChallans, deleteChallan } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { formatCustomerAddress } from '@/lib/utils';

export default function ReturnListPage() {
    const [challans, setChallans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadChallans();
    }, []);

    const loadChallans = async () => {
        try {
            const data = await fetchChallans();
            setChallans(data.filter((c: any) => c.type === 'RETURN'));
        } catch (error) {
            console.error('Failed to load returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? Deleting this return will also PERMANENTLY DELETE all bills generated for this customer after this date. This action cannot be undone.")) {
            return;
        }
        try {
            await deleteChallan(id);
            toast({ title: "Success", description: "Return deleted successfully." });
            loadChallans();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete return",
                variant: "destructive"
            });
        }
    };

    const filteredChallans = challans.filter(challan =>
        challan.type === 'RETURN' && (
            challan.challanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            challan.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            challan.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Stock Returns
                </h1>
                <Link href="/dashboard/stock/return/new">
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 transition-opacity">
                        <Plus className="mr-2 h-4 w-4" /> Create Return
                    </Button>
                </Link>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search returns..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Return No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Vehicle No</TableHead>
                            <TableHead>Items Returned</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading returns...
                                </TableCell>
                            </TableRow>
                        ) : filteredChallans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No returns found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredChallans.map((challan) => (
                                <TableRow key={challan.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                                    <TableCell>{format(new Date(challan.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{challan.customer?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                                            {formatCustomerAddress(challan.customer)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{challan.vehicleNumber || '-'}</TableCell>
                                    <TableCell>{challan.items?.length || 0} Items</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/stock/challan/${challan.id}/print`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(challan.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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
