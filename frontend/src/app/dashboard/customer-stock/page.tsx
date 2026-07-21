'use client';

import React, { useState, useEffect } from 'react';
import { User, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCustomers, fetchCustomerStockLedger } from '@/lib/api';
import { format, startOfMonth } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { Autocomplete } from '@/components/ui/autocomplete';
import { formatCustomerAddress } from '@/lib/utils';
import Link from 'next/link';

export default function CustomerStockPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [ledgerData, setLedgerData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [pageInitialized, setPageInitialized] = useState(false);
    const [startDate, setStartDate] = useState<string>(''); // No default date limit to load entire history by default
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomerId) {
            loadStock();
        }
    }, [startDate, endDate, selectedCustomerId]);

    const loadCustomers = async () => {
        try {
            const data = await fetchCustomers();
            setCustomers(data);
            setPageInitialized(true);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const loadStock = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            
            const data = await fetchCustomerStockLedger(selectedCustomerId, filters);
            setLedgerData(data);
        } catch (error) {
            console.error('Failed to fetch customer stock ledger', error);
            setLedgerData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerChange = (customerId: string) => {
        setSelectedCustomerId(customerId);
        if (!customerId) {
            setLedgerData(null);
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <User className="h-8 w-8 text-primary" />
                    Customer Stock
                </h1>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">From:</span>
                        <div className="w-[140px]">
                            <DatePicker 
                                value={startDate} 
                                onChange={(e: any) => setStartDate(e.target.value)} 
                            />
                        </div>
                        <span className="text-sm font-medium ml-2">To:</span>
                        <div className="w-[140px]">
                            <DatePicker 
                                value={endDate} 
                                onChange={(e: any) => setEndDate(e.target.value)} 
                            />
                        </div>
                    </div>

                    <Button onClick={loadStock} variant="outline" size="sm" className="gap-2" disabled={!selectedCustomerId || loading}>
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="shrink-0 bg-card p-4 rounded-lg border shadow-sm flex gap-4 items-end">
                <div className="flex-1 max-w-xl">
                    <label className="text-sm font-medium mb-1 block">Select Customer</label>
                    {pageInitialized ? (
                        <Autocomplete
                            items={customers.map(c => ({
                                value: c.id,
                                label: c.name,
                                subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                                tertiaryLabel: formatCustomerAddress(c)
                            }))}
                            value={selectedCustomerId}
                            onChange={handleCustomerChange}
                            placeholder="Search by name, reference, or address..."
                            className="w-full"
                        />
                    ) : (
                        <div className="animate-pulse h-10 bg-muted rounded-md w-full"></div>
                    )}
                </div>
            </div>

            {!selectedCustomerId ? (
                <div className="flex-1 flex justify-center items-center text-muted-foreground border rounded-md shadow-sm bg-card">
                    Please select a customer to view their stock ledger.
                </div>
            ) : loading && !ledgerData ? (
                <div className="flex-1 flex justify-center items-center border rounded-md shadow-sm bg-card">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : !ledgerData || !ledgerData.materials || ledgerData.materials.length === 0 ? (
                <div className="flex-1 flex justify-center items-center text-muted-foreground border rounded-md shadow-sm bg-card">
                    No data available for this customer.
                </div>
            ) : (
                <>
                    {/* Main Ledger Table - Horizontally Scrollable */}
                    <div className="flex-1 overflow-auto border rounded-md shadow-sm bg-card text-card-foreground relative">
                        {loading && (
                            <div className="absolute inset-0 bg-card text-card-foreground/50 z-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="sticky top-0 bg-muted text-muted-foreground z-20  border-b border-slate-300">
                                {/* First Header Row: Material Names */}
                                <tr>
                                    <th className="sticky left-0 bg-muted text-muted-foreground z-30 p-2 border-r border-slate-300 font-bold text-center min-w-[100px] align-middle" rowSpan={2}>
                                        Date
                                    </th>
                                    <th className="sticky left-[100px] bg-muted text-muted-foreground z-30 p-2 border-r border-slate-300 font-bold text-center min-w-[120px] align-middle" rowSpan={2}>
                                        Challan No.
                                    </th>
                                    <th className="sticky left-[220px] bg-muted text-muted-foreground z-30 p-2 border-r border-slate-300 font-bold text-center min-w-[120px] align-middle" rowSpan={2}>
                                        Vehicle No.
                                    </th>
                                    {ledgerData.materials.map((mat: any) => (
                                        <th key={mat.id} colSpan={6} className="p-2 border-r-2 border-slate-400 font-bold text-center">
                                            {mat.name} <span className="text-foreground font-bold">[{ledgerData.availableQty.find((a:any) => a.materialId === mat.id)?.available || 0}]</span>
                                        </th>
                                    ))}
                                </tr>
                                {/* Second Header Row: Sub-columns */}
                                <tr>
                                    {ledgerData.materials.map((mat: any) => (
                                        <React.Fragment key={`sub-${mat.id}`}>
                                            <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Issue</th>
                                            <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Rtn</th>
                                            <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Dmg</th>
                                            <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Short</th>
                                            <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Frozen</th>
                                            <th className="p-2 border-r-2 border-t border-slate-400 font-semibold text-center min-w-[60px]">Bal</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {ledgerData.ledger.length === 0 ? (
                                    <tr>
                                        <td colSpan={ledgerData.materials.length * 5 + 1} className="text-center p-8 text-muted-foreground">
                                            No transactions found for the selected period.
                                        </td>
                                    </tr>
                                ) : (
                                    ledgerData.ledger.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                            <td className="sticky left-0 bg-card text-card-foreground z-10 p-2 border-r border-slate-300 font-medium text-center">
                                                {format(new Date(row.date), 'dd-MMM-yyyy')}
                                            </td>
                                            <td className="sticky left-[100px] bg-card text-card-foreground z-10 p-2 border-r border-slate-300 font-medium text-center">
                                                <Link 
                                                    href={`/dashboard/stock/challan/${row.id}/print`}
                                                    target="_blank"
                                                    className="inline-flex items-center text-xs text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-full"
                                                    title="Print/View Document"
                                                >
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {row.type === 'ISSUE' ? '' : 'RTN-'}
                                                    {row.challanNo}
                                                </Link>
                                            </td>
                                            <td className="sticky left-[220px] bg-card text-card-foreground z-10 p-2 border-r border-slate-300 font-medium text-center">
                                                {row.vehicleNo || ''}
                                            </td>
                                            {ledgerData.materials.map((mat: any) => {
                                                const stats = row.materials[mat.id];
                                                if (!stats) {
                                                    return (
                                                        <React.Fragment key={`empty-${mat.id}`}>
                                                            <td className="p-2 border-r border-slate-300 text-center">0</td>
                                                            <td className="p-2 border-r border-slate-300 text-center">0</td>
                                                            <td className="p-2 border-r border-slate-300 text-center">0</td>
                                                            <td className="p-2 border-r border-slate-300 text-center">0</td>
                                                            <td className="p-2 border-r border-slate-300 text-center">0</td>
                                                            <td className="p-2 border-r-2 border-slate-400 text-center">0</td>
                                                        </React.Fragment>
                                                    );
                                                }
                                                return (
                                                    <React.Fragment key={`data-${mat.id}`}>
                                                        <td className="p-2 border-r border-slate-300 text-center text-green-600 font-medium">{stats.issue > 0 ? stats.issue : '0'}</td>
                                                        <td className="p-2 border-r border-slate-300 text-center text-amber-600 font-medium">{stats.rtn > 0 ? stats.rtn : '0'}</td>
                                                        <td className="p-2 border-r border-slate-300 text-center text-destructive font-medium">{stats.dmg > 0 ? stats.dmg : '0'}</td>
                                                        <td className="p-2 border-r border-slate-300 text-center text-destructive font-medium">{stats.short > 0 ? stats.short : '0'}</td>
                                                        <td className="p-2 border-r border-slate-300 text-center text-destructive font-medium">{stats.frozen > 0 ? stats.frozen : '0'}</td>
                                                        <td className="p-2 border-r-2 border-slate-400 text-center text-foreground font-bold">{stats.bal !== 0 ? stats.bal : '0'}</td>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Table: Available Qty */}
                    <div className="shrink-0 overflow-auto border rounded-md shadow-sm bg-card text-card-foreground">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-muted text-muted-foreground border-b border-slate-300">
                                <tr>
                                    <th className="p-2 border-r border-slate-300 font-bold text-center min-w-[100px] bg-muted text-muted-foreground sticky left-0 z-10">
                                        Current Date
                                    </th>
                                    <th className="p-2 border-r border-slate-300 font-bold text-center min-w-[120px] bg-muted text-muted-foreground sticky left-[100px] z-10"></th>
                                    <th className="p-2 border-r border-slate-300 font-bold text-center min-w-[120px] bg-muted text-muted-foreground sticky left-[220px] z-10"></th>
                                    {ledgerData.materials.map((mat: any) => (
                                        <th key={mat.id} className="p-2 border-r-2 border-slate-400 font-bold text-center min-w-[100px]">
                                            {mat.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={3} className="p-2 border-r border-slate-300 font-bold text-center bg-muted text-muted-foreground sticky left-0 z-10">
                                        Total Outstanding Qty.
                                    </td>
                                    {ledgerData.materials.map((mat: any) => {
                                        const qty = ledgerData.availableQty.find((a:any) => a.materialId === mat.id)?.available || 0;
                                        return (
                                            <td key={mat.id} className="p-2 border-r-2 border-slate-400 text-center text-foreground font-bold">
                                                {qty}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
