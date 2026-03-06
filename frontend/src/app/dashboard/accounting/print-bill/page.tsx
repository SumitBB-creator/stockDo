'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFilteredBills, fetchCustomers } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, CheckSquare, Square, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function PrintBillPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Dropdown filters
    const [filterType, setFilterType] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');

    // Metadata
    const [customers, setCustomers] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [selectedBillIds, setSelectedBillIds] = useState<Set<string>>(new Set());

    const [loadingFilters, setLoadingFilters] = useState(false);
    const [loadingBills, setLoadingBills] = useState(false);

    // Filter Options matching screenshot
    const FILTER_OPTIONS = [
        { value: '', label: '--Select--' },
        { value: 'Year', label: 'Year' },
        { value: 'Month-Year', label: 'Month-Year' },
        { value: 'Customer & Year', label: 'Customer & Year' },
        { value: 'Customer & Month-Year', label: 'Customer & Month-Year' },
        { value: 'Customers & Month-Year', label: 'Customers & Month-Year' },
    ];

    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
    const MONTHS = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const customerData = await fetchCustomers();
                setCustomers(customerData);
            } catch (error) {
                console.error("Failed to load customers", error);
            }
        };
        loadInitialData();
    }, []);

    const handleSearch = async () => {
        if (!filterType) {
            toast({ title: 'Validation', description: 'Please select a filter type first.', variant: 'destructive' });
            return;
        }

        // Validity checks based on filter type
        if (filterType.includes('Year') && !selectedYear) {
            toast({ title: 'Validation', description: 'Please select a Year.', variant: 'destructive' });
            return;
        }
        if (filterType.includes('Month') && !selectedMonth) {
            toast({ title: 'Validation', description: 'Please select a Month.', variant: 'destructive' });
            return;
        }
        if ((filterType.includes('Customer &') || filterType.includes('Customers &')) && !selectedCustomer) {
            toast({ title: 'Validation', description: 'Please select a Customer.', variant: 'destructive' });
            return;
        }

        setLoadingBills(true);
        try {
            const data = await fetchFilteredBills({
                year: selectedYear || undefined,
                month: selectedMonth || undefined,
                customerId: selectedCustomer || undefined
            });
            setBills(data);
            setSelectedBillIds(new Set()); // Reset selections
        } catch (error) {
            toast({ title: 'Search Failed', description: 'Could not fetch bills based on the provided filters.', variant: 'destructive' });
        } finally {
            setLoadingBills(false);
        }
    };

    const toggleAll = () => {
        if (selectedBillIds.size === bills.length) {
            setSelectedBillIds(new Set());
        } else {
            setSelectedBillIds(new Set(bills.map(b => b.id)));
        }
    };

    const toggleRow = (id: string) => {
        const next = new Set(selectedBillIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedBillIds(next);
    };

    const handlePrint = () => {
        if (selectedBillIds.size === 0) return;
        const idsString = Array.from(selectedBillIds).join(',');
        router.push(`/dashboard/accounting/billing/print-bulk?ids=${idsString}`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Print Filters</h2>

            {/* Filter Configuration Container */}
            <div className="bg-card p-6 rounded-lg border shadow-sm max-w-4xl space-y-4">
                {/* Main Filter Dropdown */}
                <div className="flex items-center gap-2 p-2 rounded w-max">
                    <Label className="font-bold text-foreground ml-2">Filter Bill By :</Label>
                    <select
                        className="flex h-9 w-[220px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            setSelectedYear('');
                            setSelectedMonth('');
                            setSelectedCustomer('');
                            setBills([]); // Clear table on filter swap
                        }}
                    >
                        {FILTER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Sub-Filters conditional rendering */}
                {filterType && (
                    <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg border">
                        {filterType.includes('Customer') && (
                            <div className="space-y-1 w-64">
                                <Label className="text-sm font-semibold">Select Customer</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                >
                                    <option value="">--Select Customer--</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType.includes('Month') && (
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Select Month</Label>
                                <select
                                    className="flex h-9 w-[160px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="">--Select Month--</option>
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType.includes('Year') && (
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Select Year</Label>
                                <select
                                    className="flex h-9 w-[120px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">--Year--</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Button onClick={handleSearch} disabled={loadingBills} className="ml-auto w-[120px]">
                            {loadingBills ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" /> Search</>}
                        </Button>
                    </div>
                )}
            </div>

            {/* Print Bulk Actions Table */}
            {bills.length > 0 && (
                <div className="bg-card rounded-lg border shadow-sm">
                    {/* Bulk Action Header */}
                    <div className="p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground ml-2">
                                Found {bills.length} Bill(s)
                            </span>
                        </div>
                        <Button
                            disabled={selectedBillIds.size === 0}
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Printer className="h-4 w-4 mr-2" /> Print Selected ({selectedBillIds.size})
                        </Button>
                    </div>
                    {/* Table Render */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center">
                                        <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                                            {selectedBillIds.size > 0 && selectedBillIds.size === bills.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                        </button>
                                    </TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Bill No.</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Date Range</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.map(bill => (
                                    <TableRow key={bill.id}>
                                        <TableCell className="text-center align-middle">
                                            <button onClick={() => toggleRow(bill.id)} className="text-muted-foreground hover:text-foreground">
                                                {selectedBillIds.has(bill.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                                            </button>
                                        </TableCell>
                                        <TableCell className="font-medium">{bill.customer?.name}</TableCell>
                                        <TableCell className="font-mono">{bill.billNumber}</TableCell>
                                        <TableCell className="text-right tabular-nums">₹{(bill.grandTotal || bill.totalAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{new Date(bill.dateFrom).toLocaleDateString()} - {new Date(bill.dateTo).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
