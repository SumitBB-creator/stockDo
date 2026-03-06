'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, Save, FileSignature, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchCustomers, createTransaction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function NotesEntryPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [noteType, setNoteType] = useState('CREDIT_NOTE');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reason, setReason] = useState('');

    // GST Fields
    const [isTaxable, setIsTaxable] = useState(false);
    const [gstType, setGstType] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST');
    const [gstRate, setGstRate] = useState('18');
    const [cgst, setCgst] = useState('0');
    const [sgst, setSgst] = useState('0');
    const [igst, setIgst] = useState('0');

    // Auto-calculate GST when amount/type/rate changes
    useEffect(() => {
        if (!isTaxable) {
            setCgst('0');
            setSgst('0');
            setIgst('0');
            return;
        }

        const amt = parseFloat(amount) || 0;
        const rate = parseFloat(gstRate) || 0;

        if (gstType === 'CGST_SGST') {
            const tax = (amt * (rate / 2)) / 100;
            setCgst(tax.toFixed(2));
            setSgst(tax.toFixed(2));
            setIgst('0');
        } else {
            const tax = (amt * rate) / 100;
            setIgst(tax.toFixed(2));
            setCgst('0');
            setSgst('0');
        }
    }, [amount, gstType, gstRate, isTaxable]);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await fetchCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to load customers:", error);
            toast({ title: "Error", description: "Failed to load customers list.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedCustomer) {
            toast({ title: "Validation Error", description: "Please select a customer.", variant: "destructive" });
            return;
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast({ title: "Validation Error", description: "Please enter a valid positive amount.", variant: "destructive" });
            return;
        }
        if (!reason.trim()) {
            toast({ title: "Validation Error", description: "A detailed reason/particulars is required for Notes.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            // Merge time if date is today
            let transactionDate = new Date(date);
            const today = new Date();
            const selectedDateObj = new Date(date);

            if (selectedDateObj.toDateString() === today.toDateString()) {
                transactionDate.setHours(today.getHours(), today.getMinutes(), today.getSeconds());
            }

            const totalGst = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
            const finalAmount = parseFloat(amount) + totalGst;

            await createTransaction({
                customerId: selectedCustomer,
                date: transactionDate,
                type: noteType, // CREDIT_NOTE or DEBIT_NOTE
                amount: finalAmount,
                description: `${noteType === 'CREDIT_NOTE' ? 'Credit' : 'Debit'} Note: ${reason}`,
                // New GST fields
                taxableAmount: isTaxable ? parseFloat(amount) : null,
                gstType: isTaxable ? gstType : null,
                gstRate: isTaxable ? parseFloat(gstRate) : null,
                cgst: isTaxable ? parseFloat(cgst) : 0,
                sgst: isTaxable ? parseFloat(sgst) : 0,
                igst: isTaxable ? parseFloat(igst) : 0,
            });

            toast({ title: "Note Saved", description: `${noteType === 'CREDIT_NOTE' ? 'Credit' : 'Debit'} note recorded successfully.` });

            // Navigate back to the list
            router.push('/dashboard/accounting/notes');

        } catch (error) {
            console.error("Failed to save note:", error);
            toast({ title: "Error", description: "Failed to record the note.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/accounting/notes')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Credit & Debit Notes</h2>
                        <p className="text-muted-foreground mt-1">Record manual adjustments, discounts, and returns</p>
                    </div>
                </div>
                <FileSignature className="h-8 w-8 text-muted-foreground opacity-50 hidden sm:block" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Note Details</CardTitle>
                    <CardDescription>
                        Be careful with Note types:
                        <br /><strong className="text-green-600">Credit Notes</strong> decrease customer balance (we owe them / rebate).
                        <br /><strong className="text-red-600">Debit Notes</strong> increase customer balance (they owe us / extra charges).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="customer">Customer / Party Account *</Label>
                            <Autocomplete
                                items={customers.map(c => ({
                                    value: c.id,
                                    label: c.name,
                                    subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                                }))}
                                value={selectedCustomer}
                                onChange={setSelectedCustomer}
                                placeholder="Search and select customer..."
                                disabled={loading || submitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Note Type *</Label>
                            <select
                                id="type"
                                value={noteType}
                                onChange={(e) => setNoteType(e.target.value)}
                                disabled={submitting}
                                className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background font-semibold
                                    ${noteType === 'CREDIT_NOTE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                                `}
                            >
                                <option value="CREDIT_NOTE">CREDIT NOTE</option>
                                <option value="DEBIT_NOTE">DEBIT NOTE</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={submitting}
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isTaxable"
                                    checked={isTaxable}
                                    onChange={(e) => setIsTaxable(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="isTaxable" className="cursor-pointer font-bold text-slate-700">This is a Taxable Note (Includes GST)</Label>
                            </div>

                            {isTaxable && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 mt-2">
                                    <div className="space-y-2">
                                        <Label>GST Type</Label>
                                        <select
                                            value={gstType}
                                            onChange={(e) => setGstType(e.target.value as any)}
                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                                        >
                                            <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                                            <option value="IGST">IGST (Inter-state)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>GST Rate (%)</Label>
                                        <Select value={gstRate} onValueChange={setGstRate}>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5%</SelectItem>
                                                <SelectItem value="12">12%</SelectItem>
                                                <SelectItem value="18">18%</SelectItem>
                                                <SelectItem value="28">28%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Taxable Amount (₹)</Label>
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="bg-white font-semibold"
                                        />
                                    </div>

                                    {gstType === 'CGST_SGST' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground text-xs">CGST ({parseFloat(gstRate) / 2}%)</Label>
                                                <Input value={cgst} readOnly className="bg-slate-100 font-mono text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground text-xs">SGST ({parseFloat(gstRate) / 2}%)</Label>
                                                <Input value={sgst} readOnly className="bg-slate-100 font-mono text-sm" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground text-xs">IGST ({gstRate}%)</Label>
                                            <Input value={igst} readOnly className="bg-slate-100 font-mono text-sm" />
                                        </div>
                                    )}

                                    <div className="md:col-span-3 pt-2 border-t border-dashed flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-500">Net Note Value (Amount + GST):</span>
                                        <span className="text-xl font-black text-slate-900">
                                            ₹{(parseFloat(amount || '0') + parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isTaxable && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="amount">Amount (₹) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={submitting}
                                    className={`text-lg font-bold ${noteType === 'CREDIT_NOTE' ? 'text-green-600' : 'text-red-600'}`}
                                />
                            </div>
                        )}

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="reason">Reason / Particulars *</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g. Volume discount for Q3 OR Shortage deduction..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={submitting}
                                className="resize-none"
                                rows={4}
                            />
                        </div>

                    </div>

                    <div className="flex justify-end pt-4 border-t gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedCustomer('');
                                setAmount('');
                                setReason('');
                                setNoteType('CREDIT_NOTE');
                            }}
                            disabled={submitting}
                        >
                            Clear Form
                        </Button>
                        <Button
                            onClick={handleSaveNote}
                            disabled={submitting}
                            className={`min-w-[150px] ${noteType === 'CREDIT_NOTE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Note
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
