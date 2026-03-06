'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function PurchaseForm({ id }: { id?: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        supplierId: '',
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        gstType: 'CGST_SGST',
        gstRate: 18,
    });

    const [items, setItems] = useState<any[]>([
        { description: '', quantity: 1, rate: 0, amount: 0 }
    ]);

    useEffect(() => {
        loadSuppliers();
        if (id) {
            loadPurchase();
        }
    }, [id]);

    const loadPurchase = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/purchases/${id}`);
            const purchase = response.data;
            setFormData({
                supplierId: purchase.supplierId,
                billNumber: purchase.billNumber || '',
                date: new Date(purchase.date).toISOString().split('T')[0],
                gstType: purchase.gstType || 'CGST_SGST',
                gstRate: purchase.gstRate || 18,
            });
            setItems(purchase.items.map((it: any) => ({
                description: it.description,
                quantity: it.quantity,
                rate: it.rate,
                amount: it.amount
            })));
        } catch (error) {
            console.error("Failed to load purchase", error);
            toast({ title: "Error", description: "Failed to load purchase data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error("Failed to load suppliers", error);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }
        setItems(newItems);
    };

    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = (subTotal * formData.gstRate) / 100;
    const grandTotal = subTotal + gstAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId) return toast({ title: "Error", description: "Please select a supplier", variant: "destructive" });

        setLoading(true);
        try {
            const payload = {
                ...formData,
                totalAmount: subTotal,
                grandTotal: grandTotal,
                cgst: formData.gstType === 'CGST_SGST' ? gstAmount / 2 : 0,
                sgst: formData.gstType === 'CGST_SGST' ? gstAmount / 2 : 0,
                igst: formData.gstType === 'IGST' ? gstAmount : 0,
                items: items,
            };

            if (id) {
                await api.patch(`/purchases/${id}`, payload);
                toast({ title: "Success", description: "Purchase updated successfully" });
            } else {
                await api.post('/purchases', payload);
                toast({ title: "Success", description: "Purchase recorded successfully" });
            }
            router.push('/dashboard/purchase/details');
        } catch (error) {
            console.error("Failed to save purchase", error);
            toast({ title: "Error", description: "Failed to save purchase", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {id ? 'Edit Purchase' : 'Record New Purchase'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Select
                                value={formData.supplierId}
                                onValueChange={(v) => setFormData({ ...formData, supplierId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Supplier Bill Number</Label>
                            <Input
                                placeholder="E.g. INV/24/001"
                                value={formData.billNumber}
                                onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Purchase Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>GST Type</Label>
                            <Select
                                value={formData.gstType}
                                onValueChange={(v) => setFormData({ ...formData, gstType: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CGST_SGST">Local (CGST + SGST)</SelectItem>
                                    <SelectItem value="IGST">Central (IGST)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Items</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4 last:border-0 last:pb-0">
                                <div className="col-span-6 space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Item description..."
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Qty</Label>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Rate</Label>
                                    <Input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <div className="flex-1 text-right font-medium">
                                        ₹{(item.amount || 0).toLocaleString()}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Card className="w-full md:w-80">
                        <CardContent className="pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>₹{subTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>GST ({formData.gstRate}%)</span>
                                <span>₹{gstAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total</span>
                                <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
                            </div>
                            <Button className="w-full mt-4" type="submit" disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Purchase'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
