'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Download, Package, RefreshCcw } from 'lucide-react';
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
import { fetchCompanyStock } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

export default function ShortageNoticePage() {
    const [stock, setStock] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStock();
    }, []);

    const loadStock = async () => {
        setLoading(true);
        try {
            const data = await fetchCompanyStock();
            // Filter materials that are at or below the lower limit
            const shortageData = (Array.isArray(data) ? data : []).filter(item =>
                item.availableQty <= (item.lowerLimit || 0)
            );
            setStock(shortageData);
        } catch (error) {
            console.error('Failed to fetch shortage data', error);
            setStock([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredStock = stock.filter(item =>
        item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.unit && item.unit.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-t-lg border-b border-slate-800 shadow-xl">
                <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    Material Shortage Notice
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadStock} className="bg-[#1e293b] border-slate-700 text-slate-300 hover:bg-[#334155] hover:text-white">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#1e293b] border-slate-700 text-slate-300 hover:bg-[#334155] hover:text-white">
                        <Download className="mr-2 h-4 w-4" /> Export List
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by material..."
                        className="pl-9 bg-[#020817] border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm font-medium text-slate-400">
                    Showing <span className="text-amber-500 font-bold">{filteredStock.length}</span> items in shortage
                </div>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#0f172a] shadow-2xl">
                <Table>
                    <TableHeader className="bg-[#1e293b]/50">
                        <TableRow className="hover:bg-transparent border-slate-800">
                            <TableHead className="text-slate-400 font-bold">Material Name</TableHead>
                            <TableHead className="text-slate-400 font-bold text-center">Unit</TableHead>
                            <TableHead className="text-right text-slate-400 font-bold">Total Stock</TableHead>
                            <TableHead className="text-right text-slate-400 font-bold">Lower Limit</TableHead>
                            <TableHead className="text-right text-amber-500 font-bold text-lg">Current Available</TableHead>
                            <TableHead className="text-center text-slate-400 font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow className="border-slate-800">
                                <TableCell colSpan={6} className="text-center h-48">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
                                        <span className="text-slate-400">Checking stock levels...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredStock.length === 0 ? (
                            <TableRow className="border-slate-800">
                                <TableCell colSpan={6} className="text-center h-48">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package className="h-12 w-12 text-slate-700" />
                                        <span className="text-slate-500 text-lg font-medium">No materials currently in shortage.</span>
                                        <span className="text-slate-600 text-sm">All materials are above their defined lower limits.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStock.map((item) => {
                                const isCritical = item.availableQty === 0;
                                const isLow = item.availableQty <= item.lowerLimit;

                                return (
                                    <TableRow key={item.materialId} className="hover:bg-[#1e293b]/30 border-slate-800 transition-colors">
                                        <TableCell className="font-bold text-slate-200">
                                            <div className="flex flex-col">
                                                <span>{item.materialName}</span>
                                                <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">{item.materialId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-none px-2 py-0">
                                                {item.unit || 'Nos'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400">{item.totalQty}</TableCell>
                                        <TableCell className="text-right font-medium text-slate-300">{item.lowerLimit || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-bold text-lg ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                                                {item.availableQty}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isCritical ? (
                                                <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                                                    CRITICAL OUT
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    LOW STOCK
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200/80 leading-relaxed">
                    <strong className="text-amber-500">Notice:</strong> This list automatically populates with materials whose <span className="text-white font-medium">Currently Available</span> quantity has reached or dropped below their <span className="text-white font-medium">Lower Limit</span> as defined in the Material Master. Please arrange for re-ordering as soon as possible.
                </div>
            </div>
        </div>
    );
}
