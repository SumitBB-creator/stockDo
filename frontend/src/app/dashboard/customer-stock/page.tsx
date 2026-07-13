'use client';

import React, { useState, useEffect } from 'react';
import { Package, Download, User, ChevronDown, ChevronUp, Calendar, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchCustomers, fetchCustomerStock } from '@/lib/api';
import { Autocomplete } from '@/components/ui/autocomplete';
import { formatCustomerAddress } from '@/lib/utils';

export default function CustomerStockPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [stock, setStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageInitialized, setPageInitialized] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await fetchCustomers();
            setCustomers(data);
            setPageInitialized(true);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const handleCustomerChange = async (customerId: string) => {
        setSelectedCustomerId(customerId);
        if (!customerId) {
            setStock([]);
            return;
        }

        setLoading(true);
        try {
            const stockData = await fetchCustomerStock(customerId);
            setStock(stockData);
        } catch (error) {
            console.error('Failed to load customer stock:', error);
            setStock([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <User className="h-8 w-8 text-primary" />
                    Customer Stock
                </h1>
                <Button variant="outline" disabled={!selectedCustomerId}>
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="max-w-xl">
                    <h2 className="text-lg font-semibold mb-4">Select Customer</h2>
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

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Material Name</TableHead>
                            <TableHead>Measurement Unit</TableHead>
                            <TableHead className="text-right">Current Stock Holding</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!selectedCustomerId ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                                    Please search and select a customer above to view their stock.
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32">
                                    Loading stock data...
                                </TableCell>
                            </TableRow>
                        ) : stock.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                                    This customer currently holds zero stock.
                                </TableCell>
                            </TableRow>
                        ) : (
                            stock.map((item) => (
                                <React.Fragment key={item.materialId}>
                                    <TableRow 
                                        className="cursor-pointer hover:bg-muted/50 transition-colors" 
                                        onClick={() => toggleRow(item.materialId)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {expandedRows.has(item.materialId) ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                {item.materialName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                                                {item.unit || item.material?.unit || 'Nos'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-primary font-bold text-lg">
                                            {item.quantity}
                                        </TableCell>
                                    </TableRow>
                                    
                                    {expandedRows.has(item.materialId) && item.history && item.history.length > 0 && (
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={3} className="p-0 border-b">
                                                <div className="p-4 bg-muted/20 border-t border-b overflow-hidden shadow-inner">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <h3 className="font-semibold text-sm">Transaction History</h3>
                                                    </div>
                                                    <div className="rounded-md border bg-card">
                                                        <Table>
                                                            <TableHeader className="bg-muted">
                                                                <TableRow>
                                                                    <TableHead className="w-[150px]">Date</TableHead>
                                                                    <TableHead>Transaction No</TableHead>
                                                                    <TableHead>Type</TableHead>
                                                                    <TableHead className="text-right">Quantity</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {item.history.map((tx: any) => (
                                                                    <TableRow key={tx.id}>
                                                                        <TableCell className="font-medium">
                                                                            <div className="flex items-center gap-2">
                                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                                {format(new Date(tx.date), 'dd MMM yyyy')}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Link 
                                                                                href={`/dashboard/stock/challan/${tx.id}/print`}
                                                                                target="_blank"
                                                                                className="text-primary hover:underline font-medium"
                                                                            >
                                                                                {tx.challanNo}
                                                                            </Link>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {tx.type === 'ISSUE' ? (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                                                                    <ArrowUpRight className="h-3 w-3" />
                                                                                    Sent
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                                                    <ArrowDownRight className="h-3 w-3" />
                                                                                    Received
                                                                                </span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-semibold">
                                                                            {tx.type === 'ISSUE' ? '+' : '-'}{tx.quantity}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
