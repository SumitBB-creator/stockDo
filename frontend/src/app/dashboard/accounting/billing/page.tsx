'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Eye, Loader2, XCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { fetchUnbilledCustomers, fetchBillsByMonth, finalizeBills, cancelBill } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatCustomerAddress } from '@/lib/utils';

export default function MonthlyBillingPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'unprepared' | 'prepared'>('unprepared');
    const [unbilledCustomers, setUnbilledCustomers] = useState<any[]>([]);
    const [preparedBills, setPreparedBills] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const { toast } = useToast();

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    useEffect(() => {
        loadData();
        setSelectedIds(new Set());
    }, [month, year]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [unbilled, bills] = await Promise.all([
                fetchUnbilledCustomers(month, year),
                fetchBillsByMonth(month, year),
            ]);
            setUnbilledCustomers(unbilled);
            // Filter out cancelled bills for the "prepared" tab
            setPreparedBills(bills.filter((b: any) => b.status !== 'CANCELLED'));
        } catch (error) {
            console.error('Failed to load billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (activeTab === 'unprepared') {
            setSelectedIds(checked ? new Set(unbilledCustomers.map(c => c.customerId)) : new Set());
        } else {
            setSelectedIds(checked ? new Set(preparedBills.map(b => b.id)) : new Set());
        }
    };

    const handleToggleId = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleFinalize = async () => {
        if (selectedIds.size === 0) {
            toast({ title: "Error", description: "Please select at least one customer", variant: "destructive" });
            return;
        }
        if (!window.confirm(`Are you sure you want to finalize bills for ${selectedIds.size} customer(s)?`)) return;

        setFinalizing(true);
        try {
            const result = await finalizeBills(Array.from(selectedIds), month, year);
            const successCount = result.filter((r: any) => r.success).length;
            const failCount = result.filter((r: any) => !r.success).length;

            toast({
                title: "Bills Finalized",
                description: `${successCount} bill(s) created successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
            });
            setSelectedIds(new Set());
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to finalize bills", variant: "destructive" });
        } finally {
            setFinalizing(false);
        }
    };

    const handleCancelBill = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this bill? This action cannot be undone.")) return;

        try {
            await cancelBill(id);
            toast({ title: "Success", description: "Bill cancelled successfully." });
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to cancel bill", variant: "destructive" });
        }
    };

    const prevMonth = subMonths(selectedDate, 1);
    const nextMonth = addMonths(selectedDate, 1);
    const currentList = activeTab === 'unprepared' ? unbilledCustomers : preparedBills;

    const customerAddress = (customer: any) => {
        const parts = [];
        if (customer?.relationType && customer?.relationName) parts.push(`${customer.relationType} ${customer.relationName}`);
        const addr = formatCustomerAddress(customer);
        if (addr !== 'N/A') parts.push(addr);
        return parts.join(', ');
    };

    return (
        <div className="space-y-6">
            {/* Header with Month Navigator */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Monthly Billing</h2>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedDate(prevMonth)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {format(prevMonth, 'MMM yyyy')}
                </Button>

                <div className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm">
                    {format(selectedDate, 'MMMM yyyy')}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedDate(nextMonth)}
                >
                    {format(nextMonth, 'MMM yyyy')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b">
                <button
                    onClick={() => { setActiveTab('unprepared'); setSelectedIds(new Set()); }}
                    className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${activeTab === 'unprepared'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Bills Not Prepared
                    {unbilledCustomers.length > 0 && (
                        <span className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs px-2 py-0.5 rounded-full">
                            {unbilledCustomers.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('prepared'); setSelectedIds(new Set()); }}
                    className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${activeTab === 'prepared'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Prepared Bills
                    {preparedBills.length > 0 && (
                        <span className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                            {preparedBills.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.size > 0 && selectedIds.size === currentList.length}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead className="w-[60px]">Srno.</TableHead>
                            <TableHead>Customer</TableHead>
                            {activeTab === 'prepared' && <TableHead className="text-right">Billing Amount</TableHead>}
                            <TableHead>From Date</TableHead>
                            <TableHead>To Date</TableHead>
                            {activeTab === 'prepared' && <TableHead>Bill No.</TableHead>}
                            {activeTab === 'prepared' && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={activeTab === 'prepared' ? 8 : 5} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-muted-foreground">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : currentList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={activeTab === 'prepared' ? 8 : 5} className="h-24 text-center text-muted-foreground">
                                    {activeTab === 'unprepared'
                                        ? 'All bills have been prepared for this month.'
                                        : 'No bills prepared for this month yet.'}
                                </TableCell>
                            </TableRow>
                        ) : activeTab === 'unprepared' ? (
                            unbilledCustomers.map((item, index) => (
                                <TableRow key={item.customerId} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(item.customerId)}
                                            onCheckedChange={() => handleToggleId(item.customerId)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.customer?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[400px]">
                                            {customerAddress(item.customer)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(item.fromDate), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{format(new Date(item.toDate), 'MMM dd, yyyy')}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            preparedBills.map((bill, index) => (
                                <TableRow key={bill.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(bill.id)}
                                            onCheckedChange={() => handleToggleId(bill.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{bill.customer?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[400px]">
                                            {customerAddress(bill.customer)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">
                                        ₹{(bill.grandTotal || bill.totalAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>{format(new Date(bill.dateFrom), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{format(new Date(bill.dateTo), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm">{bill.billNumber}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/accounting/billing/${bill.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="View Bill">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                                                onClick={() => handleCancelBill(bill.id)}
                                            >
                                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex justify-start">
                {activeTab === 'unprepared' ? (
                    <Button
                        onClick={handleFinalize}
                        disabled={selectedIds.size === 0 || finalizing}
                    >
                        {finalizing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finalizing...
                            </>
                        ) : (
                            `Finalize Bill${selectedIds.size > 1 ? 's' : ''} (${selectedIds.size})`
                        )}
                    </Button>
                ) : selectedIds.size > 0 ? (
                    <div className="flex gap-2">
                        {selectedIds.size === 1 && (
                            <Link href={`/dashboard/accounting/billing/${Array.from(selectedIds)[0]}`}>
                                <Button variant="outline">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Bill
                                </Button>
                            </Link>
                        )}
                        <Link href={`/dashboard/accounting/billing/print-bulk?ids=${Array.from(selectedIds).join(',')}`}>
                            <Button variant="default">
                                Print Selected ({selectedIds.size})
                            </Button>
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
