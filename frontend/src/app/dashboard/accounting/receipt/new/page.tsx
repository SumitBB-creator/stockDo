'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, Save, Receipt as ReceiptIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchCustomers, fetchSuppliers, fetchEmployees, fetchCompany, createTransaction } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Autocomplete, AutocompleteItem } from '@/components/ui/autocomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';

export default function ReceiptEntryPage() {
    const { toast } = useToast();
    const router = useRouter();

    const [parties, setParties] = useState<AutocompleteItem[]>([]);
    const [selectedParty, setSelectedParty] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [paymentAs, setPaymentAs] = useState('Advance Payment');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [paymentMode, setPaymentMode] = useState('BANK TRANSFER');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState(''); // Serves as 'On Account of'

    useEffect(() => {
        loadParties();
    }, []);

    const loadParties = async () => {
        setLoading(true);
        try {
            const [custData, suppData, empData, compData] = await Promise.all([
                fetchCustomers(),
                fetchSuppliers(),
                fetchEmployees(),
                fetchCompany()
            ]);

            const allParties: AutocompleteItem[] = [];

            // 1. Company
            if (compData && compData.ledgerAccountId) {
                allParties.push({
                    value: compData.ledgerAccountId,
                    label: compData.companyName,
                    subLabel: "Internal / Main Company Account",
                });
            }

            // 2. Customers
            custData.forEach((c: any) => allParties.push({
                value: c.ledgerAccountId || c.id,
                label: c.name,
                subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : "Customer",
                tertiaryLabel: "CUSTOMER"
            }));

            // 3. Suppliers
            suppData.forEach((s: any) => allParties.push({
                value: s.ledgerAccountId || s.id,
                label: s.name,
                subLabel: "Supplier",
                tertiaryLabel: "SUPPLIER"
            }));

            // 4. Employees
            empData.forEach((e: any) => allParties.push({
                value: e.ledgerAccountId || e.id,
                label: e.name,
                subLabel: "Employee",
                tertiaryLabel: "EMPLOYEE"
            }));

            setParties(allParties);
        } catch (error) {
            console.error("Failed to load parties:", error);
            toast({ title: "Error", description: "Failed to load account list.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReceipt = async () => {
        if (!selectedParty) {
            toast({ title: "Validation Error", description: "Please select an account.", variant: "destructive" });
            return;
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast({ title: "Validation Error", description: "Please enter a valid amount greater than 0.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const description = [
                paymentAs,
                `via ${paymentMode}`,
                reference ? `(Ref: ${reference})` : '',
                notes ? `- ${notes}` : ''
            ].filter(Boolean).join(' ');

            // Merge time if date is today
            let transactionDate = new Date(date);
            const today = new Date();
            const selectedDateObj = new Date(date);

            if (selectedDateObj.toDateString() === today.toDateString()) {
                transactionDate.setHours(today.getHours(), today.getMinutes(), today.getSeconds());
            }

            await createTransaction({
                customerId: selectedParty,
                date: transactionDate,
                type: 'RECEIPT',
                amount: parseFloat(amount),
                description,
                referenceId: reference || undefined,
            });

            toast({ title: "Receipt Saved", description: "Payment receipt recorded successfully." });
            router.push('/dashboard/accounting/receipt');

        } catch (error) {
            console.error("Failed to save receipt:", error);
            toast({ title: "Error", description: "Failed to record the receipt.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/accounting/receipt')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center justify-between flex-1">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Record Receipt</h2>
                        <p className="text-muted-foreground mt-1">Book incoming payments from customers</p>
                    </div>
                    <ReceiptIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Receipt Details</CardTitle>
                    <CardDescription>Enter the payment information to accurately update the ledger.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Payment Type Selection */}
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                        <Label className="text-sm font-semibold text-foreground">Payment Type</Label>
                        <RadioGroup
                            value={paymentAs}
                            onValueChange={setPaymentAs}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Advance Payment" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer">Advance</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Bill Payment" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer">Against Bill</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Refund Payment" id="r3" />
                                <Label htmlFor="r3" className="cursor-pointer">Refund</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Loss Payment" id="r4" />
                                <Label htmlFor="r4" className="cursor-pointer">Loss</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="customer">Account / Party *</Label>
                            <Autocomplete
                                items={parties}
                                value={selectedParty}
                                onChange={setSelectedParty}
                                placeholder="Search and select account..."
                                disabled={loading || submitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Payment Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={submitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount Received (₹) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={submitting}
                                className="text-lg font-semibold tabular-nums"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mode">Payment Mode</Label>
                            <select
                                id="mode"
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                disabled={submitting}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="CASH">Cash</option>
                                <option value="BANK TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                                <option value="UPI">UPI / QR Code</option>
                                <option value="CHEQUE">Cheque</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference / Transaction ID</Label>
                            <Input
                                id="reference"
                                placeholder="e.g. UTR Number, Cheque No"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                disabled={submitting}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">On Account of (Notes)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any specific details regarding this payment..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={submitting}
                                className="resize-none"
                                rows={2}
                            />
                        </div>

                    </div>

                    <div className="flex justify-end pt-6 border-t gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard/accounting/receipt')}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveReceipt} disabled={submitting} className="min-w-[150px]">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Receipt
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
