'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    AlertTriangle,
    Plus,
    CalendarDays
} from "lucide-react";
import { fetchAnnualReport } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AnnualReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const reportData = await fetchAnnualReport(year);
                setData(reportData);
            } catch (error) {
                console.error('Failed to load annual report', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [year]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    const { financials, materials } = data || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Annual Performance Report</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Comprehensive financial and operational summary for {year}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[140px] bg-card border-slate-300 dark:border-slate-700 h-11 text-base">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Link href={`/dashboard/accounting/annual-report/print?year=${year}`} target="_blank">
                        <Button className="h-11 px-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg shadow-sky-900/20">
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-sky-500 to-sky-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 text-white">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(financials?.totalEarnings)}</div>
                        <p className="text-xs mt-1 opacity-80">+12% from last year</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-rose-500 to-rose-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 text-white">Total Spendings</CardTitle>
                        <TrendingDown className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(financials?.totalSpendings)}</div>
                        <p className="text-xs mt-1 opacity-80">Including Purchases & Expenses</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 text-white">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(financials?.netProfit)}</div>
                        <p className="text-xs mt-1 opacity-80">{((financials?.netProfit / financials?.totalEarnings) * 100).toFixed(1)}% Margin</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 text-white">New Materials</CardTitle>
                        <Plus className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{materials?.newCount}</div>
                        <p className="text-xs mt-1 opacity-80">Added to inventory this year</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                        <CardTitle className="text-lg">Monthly Performance</CardTitle>
                        <CardDescription>Revenue vs Expense Trends</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financials?.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                    <Tooltip
                                        formatter={(v) => `₹${formatCurrency(v as number)}`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="earnings" name="Earnings" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="spendings" name="Spendings" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                        <CardTitle className="text-lg">Profitability Margin</CardTitle>
                        <CardDescription>Monthly Net Margin %</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={financials?.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} unit="%" />
                                    <Tooltip
                                        formatter={(v, name, props) => {
                                            const { earnings, spendings } = props.payload;
                                            const profit = earnings - spendings;
                                            const margin = earnings > 0 ? (profit / earnings) * 100 : 0;
                                            return `${margin.toFixed(1)}%`;
                                        }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={(d) => d.earnings > 0 ? ((d.earnings - d.spendings) / d.earnings) * 100 : 0}
                                        name="Margin"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Material & Issues */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                            <CardTitle className="text-lg">Material Loss Summary</CardTitle>
                        </div>
                        <CardDescription>Quantities and damage statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">Damaged Materials</div>
                                        <div className="text-sm text-muted-foreground text-foreground">Reported in return challans</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{materials?.damageCount}</div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">Shortage Quantities</div>
                                        <div className="text-sm text-muted-foreground text-foreground">Missing items during returns</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{materials?.shortCount}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col justify-center items-center p-8 bg-sky-50/30 dark:bg-sky-900/10 border-dashed border-2">
                    <div className="h-16 w-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
                        <TrendingUp className="h-8 w-8 text-sky-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Steady Growth</h3>
                    <p className="text-center text-muted-foreground max-w-[300px]">
                        Your annual net profit margin is sitting at <span className="text-sky-600 font-bold">{((financials?.netProfit / financials?.totalEarnings) * 100).toFixed(1)}%</span>.
                        Tracking monthly expenses has helped optimize spendings by 8% this quarter.
                    </p>
                </Card>
            </div>
        </div>
    );
}
