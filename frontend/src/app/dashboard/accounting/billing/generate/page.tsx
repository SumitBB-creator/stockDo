'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Calculator, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Autocomplete } from '@/components/ui/autocomplete';
import { formatCustomerAddress } from '@/lib/utils';
import { fetchCustomers, previewBill, createBill } from '@/lib/api'; // previewBill needs to be added
import { useToast } from '@/components/ui/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function GenerateBillPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString()); // Current month default? Usually previous.
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    const [previewData, setPreviewData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        const data = await fetchCustomers();
        setCustomers(data);
    };

    const handlePreview = async () => {
        if (!selectedCustomer) {
            toast({ title: "Select Customer", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const data = await previewBill(selectedCustomer, parseInt(month), parseInt(year));
            setPreviewData(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to generate preview",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBill = async () => {
        if (!previewData) return;
        setGenerating(true);
        try {
            await createBill({
                customerId: selectedCustomer,
                dateFrom: previewData.period.start,
                dateTo: previewData.period.end,
                items: previewData.items,
                totalAmount: previewData.totalAmount,
            });
            toast({ title: "Success", description: "Bill generated successfully" });
            router.push('/dashboard/accounting/billing');
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save bill",
                variant: "destructive",
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col space-y-2">
                <h1 className="text-xl font-bold">Generate Monthly Bill</h1>
                <p className="text-muted-foreground">Calculate rent based on stock holdings and agreement rates.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Customer</label>
                        <Autocomplete
                            items={customers.map(c => ({
                                value: c.id,
                                label: c.name,
                                subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                                tertiaryLabel: formatCustomerAddress(c)
                            }))}
                            value={selectedCustomer}
                            onChange={(val) => {
                                setSelectedCustomer(val);
                                setPreviewData(null);
                            }}
                            placeholder="Select Customer..."
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Month</label>
                        <Select value={month} onValueChange={(v) => { setMonth(v); setPreviewData(null); }}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <SelectItem key={m} value={m.toString()}>{format(new Date(2000, m - 1, 1), 'MMMM')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <Select value={year} onValueChange={(v) => { setYear(v); setPreviewData(null); }}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026].map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handlePreview} disabled={loading || !selectedCustomer} className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Calculator className="mr-2 h-4 w-4" /> Calculate Bill
                    </Button>
                </CardFooter>
            </Card>

            {previewData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Bill Preview</span>
                                <span className="text-primary font-mono text-2xl">₹{previewData.totalAmount.toFixed(2)}</span>
                            </CardTitle>
                            <CardDescription>
                                Period: {format(new Date(previewData.period.start), 'dd MMM yyyy')} - {format(new Date(previewData.period.end), 'dd MMM yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead className="text-right">Total Qty-Days</TableHead>
                                        <TableHead className="text-right">Rate/Day</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.items.map((item: any) => (
                                        <TableRow key={item.materialId}>
                                            <TableCell className="font-medium">{item.materialId.substring(0, 8)}...</TableCell>
                                            <TableCell className="text-right">{item.quantityDays}</TableCell>
                                            <TableCell className="text-right">₹{item.rate.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-4 border-t pt-6">
                            <Button variant="outline" onClick={() => setPreviewData(null)}>Discard</Button>
                            <Button onClick={handleSaveBill} disabled={generating}>
                                {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <CheckCircle className="mr-2 h-4 w-4" /> Save & Finalize Bill
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
