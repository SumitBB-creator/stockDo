'use client';

import React, { useState, useEffect } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCompanyStockLedger } from '@/lib/api';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { startOfMonth } from 'date-fns';



export default function CompanyStockPage() {
    const [ledgerData, setLedgerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        loadStock();
    }, [startDate, endDate]);

    const loadStock = async () => {
        setLoading(true);
        try {
            const data = await fetchCompanyStockLedger({ startDate, endDate });
            setLedgerData(data);
        } catch (error) {
            console.error('Failed to fetch company stock ledger', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !ledgerData) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!ledgerData || !ledgerData.materials || ledgerData.materials.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Package className="h-8 w-8 text-primary" />
                        Company Stock Ledger
                    </h1>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                    No data available.
                </div>
            </div>
        );
    }

    const { materials, ledger, availableQty } = ledgerData;

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    Company Stock Ledger
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

                    <Button onClick={loadStock} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

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
                            <th className="sticky left-0 bg-muted text-muted-foreground z-30 p-2 border-r border-slate-300 font-bold text-center min-w-[120px] align-middle" rowSpan={2}>
                                Date
                            </th>
                            {materials.map((mat: any) => (
                                <th key={mat.id} colSpan={7} className="p-2 border-r-2 border-slate-400 font-bold text-center">
                                    {mat.name} <span className="text-foreground font-bold">[{availableQty.find((a:any) => a.materialId === mat.id)?.available || 0}]</span>
                                </th>
                            ))}
                        </tr>
                        {/* Second Header Row: Sub-columns */}
                        <tr>
                            {materials.map((mat: any) => (
                                <React.Fragment key={`sub-${mat.id}`}>
                                    <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Issue</th>
                                    <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Rtn</th>
                                    <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Dmg</th>
                                    <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">Short</th>
                                    <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[60px]">Frozen</th>
                                    <th className="p-2 border-r border-t border-slate-300 font-semibold text-center min-w-[50px]">New</th>
                                    <th className="p-2 border-r-2 border-t border-slate-400 font-semibold text-center min-w-[60px]">Bal</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {ledger.length === 0 ? (
                            <tr>
                                <td colSpan={materials.length * 7 + 1} className="text-center p-8 text-muted-foreground">
                                    No transactions found for the selected period.
                                </td>
                            </tr>
                        ) : (
                            ledger.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/50 transition-colors">
                                    <td className="sticky left-0 bg-card text-card-foreground z-10 p-2 border-r border-slate-300 font-medium text-center">
                                        {format(new Date(row.date), 'dd-MMM-yyyy')}
                                    </td>
                                    {materials.map((mat: any) => {
                                        const stats = row.materials[mat.id];
                                        if (!stats) {
                                            return (
                                                <React.Fragment key={`empty-${mat.id}`}>
                                                    <td className="p-2 border-r border-slate-300 text-center"></td>
                                                    <td className="p-2 border-r border-slate-300 text-center"></td>
                                                    <td className="p-2 border-r border-slate-300 text-center"></td>
                                                    <td className="p-2 border-r border-slate-300 text-center"></td>
                                                    <td className="p-2 border-r border-slate-300 text-center"></td>
                                                    <td className="p-2 border-r border-slate-300 text-center"></td>
                                                    <td className="p-2 border-r-2 border-slate-400 text-center"></td>
                                                </React.Fragment>
                                            );
                                        }
                                        return (
                                            <React.Fragment key={`data-${mat.id}`}>
                                                <td className="p-2 border-r border-slate-300 text-center">{stats.issue > 0 ? stats.issue : ''}</td>
                                                <td className="p-2 border-r border-slate-300 text-center">{stats.rtn > 0 ? stats.rtn : ''}</td>
                                                <td className="p-2 border-r border-slate-300 text-center">{stats.dmg > 0 ? stats.dmg : ''}</td>
                                                <td className="p-2 border-r border-slate-300 text-center">{stats.short > 0 ? stats.short : ''}</td>
                                                <td className="p-2 border-r border-slate-300 text-center">{stats.frozen > 0 ? stats.frozen : ''}</td>
                                                <td className="p-2 border-r border-slate-300 text-center text-foreground font-bold">{stats.newQty > 0 ? stats.newQty : ''}</td>
                                                <td className="p-2 border-r-2 border-slate-400 text-center text-foreground font-bold">{stats.bal !== 0 ? stats.bal : ''}</td>
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
                            <th className="p-2 border-r border-slate-300 font-bold text-center min-w-[120px] bg-muted text-muted-foreground sticky left-0 z-10">
                                {format(new Date(), 'dd-MMM-yyyy')}
                            </th>
                            {materials.map((mat: any) => (
                                <th key={mat.id} className="p-2 border-r-2 border-slate-400 font-bold text-center min-w-[100px]">
                                    {mat.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border-r border-slate-300 font-bold text-center bg-muted text-muted-foreground sticky left-0 z-10">
                                Available Qty.
                            </td>
                            {materials.map((mat: any) => {
                                const qty = availableQty.find((a:any) => a.materialId === mat.id)?.available || 0;
                                return (
                                    <td key={mat.id} className="p-2 border-r-2 border-slate-400 text-center text-foreground">
                                        {qty}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
