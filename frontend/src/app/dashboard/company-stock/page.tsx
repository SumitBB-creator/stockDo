'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Download } from 'lucide-react';
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

export default function CompanyStockPage() {
    const [stock, setStock] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStock();
    }, []);

    const loadStock = async () => {
        try {
            const data = await fetchCompanyStock();
            setStock(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch company stock', error);
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
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    Company Stock Overview
                </h1>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by material or category..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Material Name</TableHead>
                            <TableHead>Measurement Unit</TableHead>
                            <TableHead className="text-right">Total Purchased Stock</TableHead>
                            <TableHead className="text-right">Issued (Rented Out)</TableHead>
                            <TableHead className="text-right text-primary font-bold">Currently Available</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32">
                                    Loading stock data...
                                </TableCell>
                            </TableRow>
                        ) : filteredStock.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                    No materials found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStock.map((item) => (
                                <TableRow key={item.materialId}>
                                    <TableCell className="font-medium">{item.materialName}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                                            {item.unit || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{item.totalQty}</TableCell>
                                    <TableCell className="text-right text-amber-600 font-semibold">{item.issuedQty}</TableCell>
                                    <TableCell className="text-right text-green-600 font-bold text-lg">{item.availableQty}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
