'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Users,
    AlertTriangle,
    ArrowUpRight,
    Briefcase,
    Truck
} from "lucide-react";
import { fetchDashboardSummary, fetchDailyRevenueTrend } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
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
    AreaChart,
    Area
} from 'recharts';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { token, _hasHydrated } = useAuthStore();

    useEffect(() => {
        const loadData = async () => {
            if (!_hasHydrated || !token) return; // Wait for hydration and token
            try {
                const [summary, trend] = await Promise.all([
                    fetchDashboardSummary(),
                    fetchDailyRevenueTrend()
                ]);
                console.log('Daily Revenue Trend Data:', trend);
                setData(summary);
                setDailyRevenue(trend);
            } catch (error) {
                console.error('Failed to load dashboard summary', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [_hasHydrated, token]); // Add dependencies

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Performance overview for {data?.year}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 text-white">Earnings</CardTitle>
                        <IndianRupee className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{formatCurrency(data?.earnings)}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-rose-500 to-rose-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 text-white">Spendings</CardTitle>
                        <TrendingDown className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{formatCurrency(data?.spendings)}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 text-white">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{formatCurrency(data?.profit)}</div>
                        <p className="text-xs mt-1 opacity-80">
                            {data?.earnings > 0 ? ((data.profit / data.earnings) * 100).toFixed(1) : '0'}% Margin
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-sky-500 to-sky-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 text-white">Agreements</CardTitle>
                        <Briefcase className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{data?.activeAgreements}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 text-white">Customers</CardTitle>
                        <Users className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{data?.customerCount}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-violet-500 to-violet-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 text-white">Vehicles</CardTitle>
                        <Truck className="h-4 w-4 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{data?.vehicleCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance & Margin Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly Performance Bar Chart */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                        <CardTitle className="text-lg font-semibold">
                            Monthly Performance
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm font-medium">
                            Revenue vs Expense Trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.monthlyData}
                                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 11 }}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: any) => formatCurrency(value)}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    <Bar
                                        name="Earnings"
                                        dataKey="earnings"
                                        fill="#0EA5E9"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                    <Bar
                                        name="Spendings"
                                        dataKey="spendings"
                                        fill="#F43F5E"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Daily Revenue Trend Chart */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                        <CardTitle className="text-lg font-semibold">
                            Daily Revenue Trend
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm font-medium">
                            Snapshot of Revenue from Active Inventory
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={dailyRevenue || []}
                                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 10 }}
                                        tickFormatter={(val) => {
                                            try {
                                                const d = new Date(val);
                                                return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                                            } catch (e) {
                                                return '';
                                            }
                                        }}
                                        dy={10}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 10 }}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            padding: '8px 12px'
                                        }}
                                        labelFormatter={(val) => {
                                            try {
                                                const d = new Date(val);
                                                return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                                            } catch (e) {
                                                return val;
                                            }
                                        }}
                                        formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                                    />
                                    <Area
                                        name="Daily Revenue"
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorDaily)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/dashboard/accounting/annual-report" className="group">
                    <Card className="border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-all cursor-pointer overflow-hidden shadow-sm h-full">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b group-hover:bg-sky-50 dark:group-hover:bg-sky-950 transition-colors">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-sky-500" />
                                Annual Insights
                                <ArrowUpRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-sm">
                                View comprehensive monthly trends, material usage, and detailed financial breakdowns for the entire year.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/stock/shortage-notice" className="group">
                    <Card className={`border-slate-200 dark:border-slate-800 transition-all cursor-pointer overflow-hidden shadow-sm h-full ${data?.shortageCount > 0 ? 'hover:border-rose-500' : 'hover:border-amber-500'}`}>
                        <CardHeader className={`bg-slate-50 dark:bg-slate-900 border-b transition-colors ${data?.shortageCount > 0 ? 'group-hover:bg-rose-50 dark:group-hover:bg-rose-950' : 'group-hover:bg-amber-50 dark:group-hover:bg-amber-950'}`}>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className={`h-5 w-5 ${data?.shortageCount > 0 ? 'text-rose-500' : 'text-amber-500'}`} />
                                Inventory Alerts
                                <ArrowUpRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm max-w-[250px]">
                                    {data?.shortageCount > 0
                                        ? `There are currently ${data.shortageCount} items below their lower stock limit.`
                                        : 'All stock levels are currently healthy with no immediate shortages reported.'}
                                </p>
                                {data?.shortageCount > 0 && (
                                    <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <span className="text-rose-600 font-bold">{data.shortageCount}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
