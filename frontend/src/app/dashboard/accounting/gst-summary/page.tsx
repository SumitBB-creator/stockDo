'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2, Printer, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchGstSummary, fetchCompany } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function GstSummaryPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);

    // Default to current month range
    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    useEffect(() => {
        loadData();
        loadCompany();
    }, [fromDate, toDate]);

    const loadCompany = async () => {
        try {
            const data = await fetchCompany();
            setCompany(data);
        } catch (error) {
            console.error('Failed to load company:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchGstSummary(fromDate, toDate);
            setSummary(data);
        } catch (error) {
            console.error('Failed to load GST summary:', error);
            toast({ title: "Error", description: "Failed to load GST summary data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getGstTotal = (row: any) => {
        if (!row) return 0;
        return (row.cgst || 0) + (row.sgst || 0) + (row.igst || 0);
    };

    // Calculate Totals for Output Tax
    const outputTaxRows = [
        { label: 'Sales', data: summary?.sales, isAdjustment: false },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">GST Summary Report</h2>
                    <p className="text-muted-foreground mt-1">Date-wise Input-Output Tax Statement</p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/dashboard/accounting/gst-summary/print?fromDate=${fromDate}&toDate=${toDate}`} target="_blank">
                        <Button variant="outline" className="border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Report
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-slate-200 shadow-xl overflow-hidden rounded-xl">
                <CardHeader className="bg-[#0f172a] border-b border-slate-800 py-6 px-8">
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="fromDate" className="text-xs font-bold text-slate-300 tracking-wider uppercase ml-1">From Date</Label>
                            <Input
                                id="fromDate"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-[220px] bg-[#1e293b] border-slate-700 text-white h-10 text-base shadow-inner focus:ring-primary focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="toDate" className="text-xs font-bold text-slate-300 tracking-wider uppercase ml-1">To Date</Label>
                            <Input
                                id="toDate"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-[220px] bg-[#1e293b] border-slate-700 text-white h-10 text-base shadow-inner focus:ring-primary focus:border-primary transition-all"
                            />
                        </div>

                        <Button
                            onClick={loadData}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-base font-bold"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                            Generate Report
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Particulars</TableHead>
                                    <TableHead className="text-right">Taxable Value</TableHead>
                                    <TableHead className="text-right">SGST</TableHead>
                                    <TableHead className="text-right">CGST</TableHead>
                                    <TableHead className="text-right">IGST</TableHead>
                                    <TableHead className="text-right">GST Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Static / Carry Forward Rows (Mocked for now as per image) */}
                                <TableRow className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">Balance Brought Forward</TableCell>
                                    <TableCell className="text-right">-</TableCell>
                                    <TableCell className="text-right tabular-nums">0.00</TableCell>
                                    <TableCell className="text-right tabular-nums">0.00</TableCell>
                                    <TableCell className="text-right tabular-nums">0.00</TableCell>
                                    <TableCell className="text-right tabular-nums font-semibold">0.00</TableCell>
                                </TableRow>

                                {/* dynamic Rows */}
                                {outputTaxRows.map((row, idx) => (
                                    <TableRow key={idx} className={cn("hover:bg-muted/50 transition-colors", row.isAdjustment && "text-muted-foreground/70")}>
                                        <TableCell className="font-medium">Add: {row.label}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {row.data ? formatCurrency(row.data.taxable) : '0.00'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-green-600">
                                            {row.data ? formatCurrency(row.data.sgst) : '0.00'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-green-600">
                                            {row.data ? formatCurrency(row.data.cgst) : '0.00'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-green-600">
                                            {row.data ? formatCurrency(row.data.igst) : '0.00'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums">
                                            {row.data ? formatCurrency(getGstTotal(row.data)) : '0.00'}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* Purchases (Input Tax) */}
                                <TableRow className="hover:bg-muted/50 transition-colors border-t border-muted">
                                    <TableCell className="font-bold text-foreground py-3.5">Less: Purchases (Input Tax)</TableCell>
                                    <TableCell className="text-right font-bold tabular-nums py-3.5">
                                        {summary?.purchases ? formatCurrency(summary.purchases.taxable) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums text-red-600 py-3.5">
                                        -{summary?.purchases ? formatCurrency(summary.purchases.sgst) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums text-red-600 py-3.5">
                                        -{summary?.purchases ? formatCurrency(summary.purchases.cgst) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums text-red-600 py-3.5">
                                        -{summary?.purchases ? formatCurrency(summary.purchases.igst) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums text-red-600 py-3.5">
                                        -{summary?.purchases ? formatCurrency(getGstTotal(summary.purchases)) : '0.00'}
                                    </TableCell>
                                </TableRow>

                                {/* Final Total Row */}
                                <TableRow className="bg-primary/10 dark:bg-primary/20 hover:bg-primary/15 border-t-2 border-primary/30">
                                    <TableCell className="font-black text-foreground text-lg py-4">NET GST PAYABLE</TableCell>
                                    <TableCell className="text-right font-black">-</TableCell>
                                    <TableCell className="text-right font-black tabular-nums text-lg py-4">
                                        {summary ? formatCurrency(
                                            (summary?.sales?.sgst || 0) - (summary?.purchases?.sgst || 0)
                                        ) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-black tabular-nums text-lg py-4">
                                        {summary ? formatCurrency(
                                            (summary?.sales?.cgst || 0) - (summary?.purchases?.cgst || 0)
                                        ) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-black tabular-nums text-lg py-4">
                                        {summary ? formatCurrency(
                                            (summary?.sales?.igst || 0) - (summary?.purchases?.igst || 0)
                                        ) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right font-black tabular-nums text-xl text-sky-500 dark:text-sky-400 py-4">
                                        {summary ? formatCurrency(
                                            getGstTotal(summary?.sales) - getGstTotal(summary?.purchases)
                                        ) : '0.00'}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border shadow-sm">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Output Tax (Sales)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-3xl font-bold text-foreground tabular-nums">
                            ₹{summary ? formatCurrency(getGstTotal(summary.sales)) : '0.00'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Input Tax (Purchases)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-500 tabular-nums">
                            ₹{summary ? formatCurrency(getGstTotal(summary.purchases)) : '0.00'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 dark:bg-slate-950 text-white">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-wider text-center">Final GST Liability</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-3xl font-bold tabular-nums text-sky-400">
                            ₹{summary ? formatCurrency(
                                getGstTotal(summary.sales) - getGstTotal(summary.purchases)
                            ) : '0.00'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
