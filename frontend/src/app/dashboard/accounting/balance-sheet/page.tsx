'use client';

import { useEffect, useState } from 'react';
import { Loader2, Printer, TrendingUp, TrendingDown, ReceiptIndianRupee, Landmark, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchYearlyBalanceSheet } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function BalanceSheetPage() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        loadData();
    }, [year]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchYearlyBalanceSheet(year);
            setData(res);
        } catch (error) {
            console.error("Failed to load balance sheet:", error);
            toast({ title: "Error", description: "Failed to load balance sheet.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto" />
                    <p className="text-muted-foreground animate-pulse font-medium">Calculating Yearly Statement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
            {/* Header section with Year Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Yearly Balance Sheet</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Financial summary and GST overview for the selected period</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 px-3">
                        <CalendarDays className="h-5 w-5 text-sky-600" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Financial Year</span>
                    </div>
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[140px] h-10 border-none bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 rounded-xl">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()} className="font-medium">FY {y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {data && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <Landmark className="h-5 w-5 text-sky-600" />
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Statement of Accounts</h2>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-wider text-[10px]">Head of Account</TableHead>
                                    <TableHead className="font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-wider text-[10px]">Description</TableHead>
                                    <TableHead className="text-right font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-wider text-[10px]">Amount (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Earnings Row */}
                                <TableRow className="group hover:bg-sky-50/30 dark:hover:bg-sky-900/10">
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-sky-100 dark:bg-sky-900/40 rounded-lg text-sky-600">
                                                <TrendingUp className="h-4 w-4" />
                                            </div>
                                            Total Earnings
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm italic px-6">Total revenue generated from sales and services</TableCell>
                                    <TableCell className="text-right font-black text-sky-600 dark:text-sky-400 text-lg tabular-nums px-6">
                                        {formatCurrency(data.earnings)}
                                    </TableCell>
                                </TableRow>

                                {/* Spendings Row */}
                                <TableRow className="group hover:bg-rose-50/30 dark:hover:bg-rose-900/10">
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg text-rose-600">
                                                <TrendingDown className="h-4 w-4" />
                                            </div>
                                            Total Spendings
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm italic px-6">Combined purchases and business operating expenses</TableCell>
                                    <TableCell className="text-right font-black text-rose-600 dark:text-rose-400 text-lg tabular-nums px-6">
                                        {formatCurrency(data.spendings)}
                                    </TableCell>
                                </TableRow>

                                <TableRow className="bg-slate-50/50 dark:bg-slate-800/20">
                                    <TableCell colSpan={3} className="px-6 py-3">
                                        <div className="flex items-center gap-2 opacity-50 uppercase tracking-widest text-[9px] font-bold text-slate-500">Taxation Summary</div>
                                    </TableCell>
                                </TableRow>

                                {/* GST Collected Row */}
                                <TableRow className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10">
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600">
                                                <ReceiptIndianRupee className="h-4 w-4" />
                                            </div>
                                            GST Collected
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm italic px-6">Total output tax collected on sales invoices</TableCell>
                                    <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400 text-lg tabular-nums px-6">
                                        {formatCurrency(data.gstCollected)}
                                    </TableCell>
                                </TableRow>

                                {/* GST Paid Row */}
                                <TableRow className="group hover:bg-amber-50/30 dark:hover:bg-amber-900/10 border-b-2 border-slate-100 dark:border-slate-800">
                                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600">
                                                <ReceiptIndianRupee className="h-4 w-4" />
                                            </div>
                                            GST Paid
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm italic px-6">Total input tax paid on purchases and expenses</TableCell>
                                    <TableCell className="text-right font-black text-amber-600 dark:text-amber-400 text-lg tabular-nums px-6">
                                        {formatCurrency(data.gstPaid)}
                                    </TableCell>
                                </TableRow>

                                {/* Net Position Summary Row */}
                                <TableRow className="bg-slate-900 dark:bg-black text-white h-20">
                                    <TableCell colSpan={2} className="px-8 h-full">
                                        <div className="flex items-center gap-4 h-full">
                                            <div className={`p-2 rounded-full ${data.earnings >= data.spendings ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                <Landmark className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Net Business Position</div>
                                                <div className="text-[10px] opacity-60 font-medium tracking-tight">Earnings minus Spendings for the Financial Year</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8 h-full">
                                        <span className={`text-3xl font-black tabular-nums ${data.earnings >= data.spendings ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            ₹ {formatCurrency(data.earnings - data.spendings)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Footer / Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-medium italic">
                    * This summary is generated in real-time based on your recorded sales, purchases, and expenses.
                </p>
                <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm" onClick={() => window.print()}>
                    <Printer className="mr-3 h-5 w-5 text-sky-600" />
                    Print Statement
                </Button>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    header, aside, button, select, div[role="combobox"] { display: none !important; }
                    body { background: white !important; }
                    .max-w-6xl { max-width: 100% !important; border: none !important; padding: 0 !important; }
                    .grid { gap: 20px !important; }
                    .shadow-xl { shadow: none !important; border: 1px solid #eee !important; }
                }
            `}</style>
        </div>
    );
}
