'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Autocomplete } from '@/components/ui/autocomplete';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchCustomers, fetchDueslist } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatCustomerAddress } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';

export default function DueslistPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [dues, setDues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [duesFilter, setDuesFilter] = useState('All');

    const { toast } = useToast();

    useEffect(() => {
        const loadBaseData = async () => {
            try {
                const custData = await fetchCustomers();
                setCustomers(custData);
            } catch (error) {
                console.error("Failed to load customers:", error);
            }
        };
        loadBaseData();
    }, []);

    useEffect(() => {
        loadDuesData();
    }, [selectedDate]);

    const loadDuesData = async () => {
        setLoading(true);
        try {
            const responseData = await fetchDueslist(selectedDate);
            const actualData = responseData.data ? responseData.data : responseData;
            setDues(Array.isArray(actualData) ? actualData : []);
        } catch (error) {
            console.error("Failed to load dues:", error);
            toast({ title: "Error", description: "Failed to load dues list.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (customer: any) => {
        return formatCustomerAddress(customer);
    };

    const formatCurrency = (val: number | null | undefined) => {
        if (!val) return '0.00';
        return val.toFixed(2);
    };

    // Apply Filters
    const filteredDues = dues.filter(due => {
        if (selectedCustomer && due.customer.id !== selectedCustomer) return false;
        if (duesFilter === 'No Dues') return due.netDue <= 0;
        if (duesFilter === 'Over Dues') return due.netDue > 0;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Outstanding Dues</h2>
            </div>

            {/* Filter Controls Row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">

                <div className="flex items-center gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">As Of Date</label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Filter Status</label>
                        <RadioGroup defaultValue="All" value={duesFilter} onValueChange={setDuesFilter} className="flex gap-4 pt-1">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="All" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="General" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer">General</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Over Dues" id="r3" />
                                <Label htmlFor="r3" className="cursor-pointer">Over Dues</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No Dues" id="r4" />
                                <Label htmlFor="r4" className="cursor-pointer">No Dues</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* Customer Autocomplete Search */}
                <div className="w-[300px] space-y-1">
                    <label className="text-sm font-medium text-gray-700">Search Customer</label>
                    <Autocomplete
                        items={customers.map(c => ({
                            value: c.id,
                            label: c.name,
                            subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                            tertiaryLabel: formatCustomerAddress(c),
                        }))}
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder="Select Account..."
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
                            <TableHead className="w-[120px] text-xs">Customer Name</TableHead>
                            <TableHead className="w-[120px] text-xs">Customer Address</TableHead>
                            <TableHead className="w-[80px] text-xs">Phone No.</TableHead>
                            <TableHead className="text-right w-[80px] text-[11px] leading-tight">Advance Payment</TableHead>
                            <TableHead className="text-right w-[80px] text-[11px] leading-tight">Billing Amount</TableHead>
                            <TableHead className="text-right w-[80px] text-[11px] leading-tight">Bill Payment</TableHead>
                            <TableHead className="text-right w-[80px] text-[11px] leading-tight">Refund Payment</TableHead>
                            <TableHead className="text-right w-[80px] text-[11px] leading-tight text-primary font-bold">Current Bal<br />(Inc. Adv)</TableHead>
                            <TableHead className="text-right w-[80px] text-[11px] leading-tight">Current Bal<br />(Exc. Adv)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-32 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground font-medium">Loading records...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredDues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                    No dues records found for the selected criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDues.map((due, index) => (
                                <TableRow key={due.customer.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="text-xs font-medium align-top">{index + 1}</TableCell>
                                    <TableCell className="align-top">
                                        <div className="font-semibold text-xs leading-tight text-primary/90">{due.customer.name}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[10px] leading-tight align-top pr-2">
                                        {formatAddress(due.customer)}
                                    </TableCell>
                                    <TableCell className="text-[11px] align-top whitespace-nowrap text-muted-foreground">
                                        {due.customer.officePhone || '-'}
                                    </TableCell>

                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-medium text-blue-600/80">
                                        {formatCurrency(due.advancePayment)}
                                    </TableCell>
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-medium text-blue-600/80">
                                        {formatCurrency(due.billingAmount)}
                                    </TableCell>
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-medium text-blue-600/80">
                                        {formatCurrency(due.billPayment)}
                                    </TableCell>
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-medium text-blue-600/80">
                                        {formatCurrency(due.refundPayment)}
                                    </TableCell>

                                    {/* Including Advance: Maps to netDue */}
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-bold">
                                        {due.currentBalanceIncluded > 0 ? (
                                            <span className="text-red-600">{formatCurrency(due.currentBalanceIncluded)}</span>
                                        ) : due.currentBalanceIncluded < 0 ? (
                                            <span className="text-green-600">{formatCurrency(Math.abs(due.currentBalanceIncluded))} CR</span>
                                        ) : <span className="text-muted-foreground">-</span>}
                                    </TableCell>

                                    {/* Excluding Advance: Maps to currentBalanceExcluded */}
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-semibold">
                                        {due.currentBalanceExcluded > 0 ? formatCurrency(due.currentBalanceExcluded) : <span className="text-muted-foreground">-</span>}
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => router.push(`/dashboard/accounting/dueslist/print?asOfDate=${selectedDate}&filter=${duesFilter}${selectedCustomer ? `&customerId=${selectedCustomer}` : ''}`)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print PDF
                </Button>
            </div>
        </div>
    );
}
