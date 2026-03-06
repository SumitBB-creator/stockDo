'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2, Search, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchCustomers, previewCustomBill, finalizeCustomBill } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatCustomerAddress } from '@/lib/utils';

export default function CustomizeBillingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await fetchCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const handlePreview = async () => {
        if (!selectedCustomerId || !fromDate || !toDate) {
            toast({ title: "Error", description: "Please select a customer and date range", variant: "destructive" });
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            toast({ title: "Error", description: "From Date must be before To Date", variant: "destructive" });
            return;
        }

        setPreviewing(true);
        setPreview(null);
        try {
            const data = await previewCustomBill(selectedCustomerId, fromDate, toDate);
            setPreview(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to generate preview",
                variant: "destructive"
            });
        } finally {
            setPreviewing(false);
        }
    };

    const handleFinalize = async () => {
        if (!selectedCustomerId || !fromDate || !toDate) return;
        if (!window.confirm("Are you sure you want to finalize this bill? This action cannot be undone.")) return;

        setFinalizing(true);
        try {
            const bill = await finalizeCustomBill(selectedCustomerId, fromDate, toDate);
            toast({ title: "Bill Finalized", description: `Bill ${bill.billNumber} created successfully.` });
            router.push(`/dashboard/accounting/billing/${bill.id}`);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to finalize bill",
                variant: "destructive"
            });
        } finally {
            setFinalizing(false);
        }
    };

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    // Calculate GST for preview display
    const gstRate = 18;
    const subTotal = preview?.totalAmount || 0;
    const gstAmount = Math.round((subTotal * gstRate / 100) * 100) / 100;
    const grandTotal = Math.round((subTotal + gstAmount) * 100) / 100;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">
                Customize Billing
            </h2>
            <p className="text-muted-foreground">
                Generate a bill for a specific customer with a custom date range.
            </p>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-lg border">
                <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={(v) => { setSelectedCustomerId(v); setPreview(null); }}>
                        <SelectTrigger id="customer">
                            <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date</Label>
                    <Input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => { setFromDate(e.target.value); setPreview(null); }}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="toDate">To Date</Label>
                    <Input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => { setToDate(e.target.value); setPreview(null); }}
                    />
                </div>
            </div>

            {/* Preview Button */}
            <div className="flex gap-3">
                <Button
                    onClick={handlePreview}
                    disabled={!selectedCustomerId || !fromDate || !toDate || previewing}
                >
                    {previewing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Preview...</>
                    ) : (
                        <><Search className="mr-2 h-4 w-4" />Generate Preview</>
                    )}
                </Button>
            </div>

            {/* Preview Results */}
            {preview && (
                <div className="space-y-4">
                    {/* Customer Info Card */}
                    <div className="p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedCustomer?.name}</h3>
                                {selectedCustomer?.relationType && selectedCustomer?.relationName && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCustomer.relationType} {selectedCustomer.relationName}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">{formatCustomerAddress(selectedCustomer)}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p><span className="text-muted-foreground">Period:</span> {format(new Date(fromDate), 'dd MMM yyyy')} — {format(new Date(toDate), 'dd MMM yyyy')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>From Date</TableHead>
                                    <TableHead>To Date</TableHead>
                                    <TableHead>Particulars</TableHead>
                                    <TableHead>HSN/SAC</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead className="text-right">Days</TableHead>
                                    <TableHead className="text-right">No</TableHead>
                                    <TableHead className="text-right">Rate (₹)</TableHead>
                                    <TableHead className="text-right">Amount (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {preview.items?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-20 text-center text-muted-foreground">
                                            No stock found for this customer in the selected period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {preview.items?.map((item: any, index: number) => (
                                            <TableRow key={`${item.materialId}-${index}`} className="hover:bg-muted/50">
                                                <TableCell>{item.fromDate ? format(new Date(item.fromDate), 'dd/MM/yy') : ''}</TableCell>
                                                <TableCell>{item.toDate ? format(new Date(item.toDate), 'dd/MM/yy') : ''}</TableCell>
                                                <TableCell>{item.materialName}</TableCell>
                                                <TableCell>{item.hsn || item.sac || ''}</TableCell>
                                                <TableCell className="text-right tabular-nums">{item.balance || ''}</TableCell>
                                                <TableCell className="text-right tabular-nums">{item.days || ''}</TableCell>
                                                <TableCell className="text-right tabular-nums">{item.quantityDays?.toLocaleString() || item.quantity?.toLocaleString()}</TableCell>
                                                <TableCell className="text-right tabular-nums">{item.rate?.toFixed(2)}</TableCell>
                                                <TableCell className="text-right tabular-nums font-medium">
                                                    ₹{item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Sub Total */}
                                        <TableRow className="border-t-2 border-primary/20">
                                            <TableCell colSpan={8} className="text-right font-semibold">Sub Total:</TableCell>
                                            <TableCell className="text-right font-semibold tabular-nums">
                                                ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                        {/* GST */}
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-right text-muted-foreground">GST @ {gstRate}%:</TableCell>
                                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                                ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                        {/* Grand Total */}
                                        <TableRow className="bg-primary/5">
                                            <TableCell colSpan={8} className="text-right font-bold text-lg">Grand Total:</TableCell>
                                            <TableCell className="text-right font-bold text-lg tabular-nums">
                                                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Finalize Button */}
                    {preview.items?.length > 0 && (
                        <div className="flex gap-3">
                            <Button
                                onClick={handleFinalize}
                                disabled={finalizing}
                            >
                                {finalizing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finalizing...</>
                                ) : (
                                    <><FileText className="mr-2 h-4 w-4" />Finalize Bill</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
