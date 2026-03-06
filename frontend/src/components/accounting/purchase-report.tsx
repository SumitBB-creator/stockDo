'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Plus, Save, Loader2, X, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PurchaseReportProps {
    type?: 'LOCAL' | 'CENTRAL' | 'ALL';
    title: string;
}

export function PurchaseReport({ type = 'ALL', title }: PurchaseReportProps) {
    const { toast } = useToast();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
    const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));

    // In-line entry state
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newEntry, setNewEntry] = useState({
        supplierId: '',
        billNumber: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        taxableAmount: '',
        gstType: type === 'CENTRAL' ? 'IGST' : 'CGST_SGST',
        gstRate: 18,
    });
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [fromDate, toDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [purchResponse, suppResponse, companyResponse] = await Promise.all([
                api.get('/purchases', {
                    params: {
                        fromDate: fromDate.toISOString(),
                        toDate: toDate.toISOString()
                    }
                }),
                api.get('/suppliers'),
                api.get('/company')
            ]);

            const companyState = companyResponse.data?.state?.toLowerCase() || '';
            let data = purchResponse.data;

            if (type === 'LOCAL') {
                data = data.filter((p: any) => {
                    const supplierState = p.supplier?.state?.toLowerCase() || '';
                    return supplierState === companyState;
                });
            } else if (type === 'CENTRAL') {
                data = data.filter((p: any) => {
                    const supplierState = p.supplier?.state?.toLowerCase() || '';
                    return supplierState !== companyState;
                });
            }

            setPurchases(data);
            setSuppliers(suppResponse.data);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSupplierChange = (supplierId: string) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        setNewEntry({ ...newEntry, supplierId });
        setSelectedSupplier(supplier || null);
    };

    const handleSaveInline = async () => {
        if (!newEntry.supplierId || !newEntry.taxableAmount) {
            toast({ title: "Validation Error", description: "Please select a supplier and enter taxable amount.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const taxable = parseFloat(newEntry.taxableAmount);
            const gstAmount = (taxable * newEntry.gstRate) / 100;
            const grandTotal = taxable + gstAmount;

            const payload = {
                supplierId: newEntry.supplierId,
                billNumber: newEntry.billNumber,
                date: new Date(newEntry.date).toISOString(),
                gstType: newEntry.gstType,
                gstRate: newEntry.gstRate,
                totalAmount: taxable,
                grandTotal: grandTotal,
                cgst: newEntry.gstType === 'CGST_SGST' ? gstAmount / 2 : 0,
                sgst: newEntry.gstType === 'CGST_SGST' ? gstAmount / 2 : 0,
                igst: newEntry.gstType === 'IGST' ? gstAmount : 0,
                items: [{ description: 'Purchase Order', quantity: 1, rate: taxable, amount: taxable }]
            };

            await api.post('/purchases', payload);
            toast({ title: "Success", description: "Purchase recorded successfully" });
            setIsAdding(false);
            setNewEntry({
                supplierId: '',
                billNumber: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                taxableAmount: '',
                gstType: type === 'CENTRAL' ? 'IGST' : 'CGST_SGST',
                gstRate: 18,
            });
            setSelectedSupplier(null);
            loadData();
        } catch (error) {
            console.error("Failed to save purchase", error);
            toast({ title: "Error", description: "Failed to save purchase", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        const params = new URLSearchParams({
            type,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            searchTerm
        });
        window.open(`/dashboard/purchase/print?${params.toString()}`, '_blank');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this purchase? This will also reverse the ledger entry and delete all associated items.')) {
            return;
        }

        try {
            await api.delete(`/purchases/${id}`);
            toast({ title: "Success", description: "Purchase deleted successfully" });
            loadData();
        } catch (error) {
            console.error("Failed to delete purchase", error);
            toast({ title: "Error", description: "Failed to delete purchase", variant: "destructive" });
        }
    };

    const filteredPurchases = purchases.filter(p =>
        p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totals = filteredPurchases.reduce((acc, p) => {
        const taxable = p.totalAmount || 0;
        const cgst = p.cgst || 0;
        const sgst = p.sgst || 0;
        const igst = p.igst || 0;
        const grand = p.grandTotal || (taxable + cgst + sgst + igst);

        return {
            taxable: acc.taxable + taxable,
            cgst: acc.cgst + cgst,
            sgst: acc.sgst + sgst,
            igst: acc.igst + igst,
            grand: acc.grand + grand
        };
    }, { taxable: 0, cgst: 0, sgst: 0, igst: 0, grand: 0 });

    return (
        <div className="space-y-4 print:p-0">
            <Card className="print:border-none print:shadow-none">
                <CardHeader className="flex flex-col space-y-4 pb-4">
                    <div className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        <div className="flex items-center space-x-2 print:hidden">
                            <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
                                <Plus className="h-4 w-4 mr-2" />
                                Quick Add
                            </Button>
                            <Link href="/dashboard/purchase/new">
                                <Button size="sm" variant="outline">
                                    Full Form
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Download className="h-4 w-4 mr-2" />
                                Print / Export
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 print:hidden">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">From:</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[180px] justify-start text-left font-normal",
                                            !fromDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fromDate ? format(fromDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={(date) => date && setFromDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">To:</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[180px] justify-start text-left font-normal",
                                            !toDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {toDate ? format(toDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={(date) => date && setToDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by PUR No, Bill No or Supplier..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="text-center w-full font-bold text-lg mt-4">
                        Period {format(fromDate, "dd-MMM-yyyy")} To {format(toDate, "dd-MMM-yyyy")}
                    </div>
                </CardHeader>
                <CardContent>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] font-bold text-center border-r">Action</TableHead>
                                    <TableHead className="min-w-[300px] font-bold border-r">Supplier Name & Address</TableHead>
                                    <TableHead className="w-[150px] font-bold border-r">GSTIN/UIN</TableHead>
                                    <TableHead className="w-[120px] font-bold border-r text-center">Bill Date</TableHead>
                                    <TableHead className="w-[160px] font-bold border-r">Bill No</TableHead>
                                    <TableHead className="w-[180px] font-bold text-right">Taxable Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* In-line Entry Row */}
                                {isAdding && (
                                    <TableRow className="bg-blue-50/50 align-top hover:bg-blue-50/50">
                                        <TableCell className="border-r py-3">
                                            <div className="flex items-center space-x-1 justify-center">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveInline} disabled={saving}>
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsAdding(false)} disabled={saving}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-r py-3">
                                            <div className="space-y-2">
                                                <Autocomplete
                                                    items={suppliers.map(s => ({
                                                        value: s.id,
                                                        label: s.name,
                                                        subLabel: "Supplier",
                                                        tertiaryLabel: s.address || s.city || undefined
                                                    }))}
                                                    value={newEntry.supplierId}
                                                    onChange={handleSupplierChange}
                                                    placeholder="Search Supplier..."
                                                    className="w-full bg-white text-black"
                                                />
                                                {selectedSupplier && (
                                                    <div className="text-xs italic text-muted-foreground">
                                                        {selectedSupplier.address || 'No Address Provided'}
                                                        {selectedSupplier.city && `, ${selectedSupplier.city}`}
                                                        {selectedSupplier.state && `, ${selectedSupplier.state}`}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-r py-3">
                                            <Input
                                                className="h-8 bg-white text-black"
                                                value={selectedSupplier?.gstIn || '-'}
                                                readOnly
                                            />
                                        </TableCell>
                                        <TableCell className="border-r py-3">
                                            <Input
                                                type="date"
                                                className="h-8 bg-white text-black"
                                                value={newEntry.date}
                                                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell className="border-r py-3">
                                            <Input
                                                placeholder="Bill No"
                                                className="h-8 bg-white text-black"
                                                value={newEntry.billNumber}
                                                onChange={(e) => setNewEntry({ ...newEntry, billNumber: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="h-8 bg-white text-right text-black"
                                                value={newEntry.taxableAmount}
                                                onChange={(e) => setNewEntry({ ...newEntry, taxableAmount: e.target.value })}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredPurchases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">No records found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPurchases.map((p) => (
                                        <TableRow key={p.id} className="align-top hover:bg-transparent">
                                            <TableCell className="text-center border-r py-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link href={`/dashboard/purchase/${p.id}/edit`}>
                                                        <Button size="sm" variant="ghost" className="h-8 px-2 text-blue-600">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-2 text-red-600"
                                                        onClick={() => handleDelete(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-r py-3">
                                                <div className="space-y-1">
                                                    <div className="font-bold uppercase">{p.supplier?.name}</div>
                                                    <div className="text-xs italic text-muted-foreground">
                                                        {p.supplier?.address || 'No Address Provided'}
                                                        {p.supplier?.city && `, ${p.supplier.city}`}
                                                        {p.supplier?.state && `, ${p.supplier.state}`}
                                                        {p.supplier?.pin && `-${p.supplier.pin}`}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-r py-3">{p.supplier?.gstIn || '-'}</TableCell>
                                            <TableCell className="border-r py-3 text-center">{format(new Date(p.date), 'dd-MM-yyyy')}</TableCell>
                                            <TableCell className="border-r py-3">{p.billNumber || '-'}</TableCell>
                                            <TableCell className="text-right py-3 font-medium">₹{(p.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!loading && filteredPurchases.length > 0 && (
                                    <>
                                        <TableRow className="bg-muted/50 font-bold border-t">
                                            <TableCell colSpan={5} className="text-right border-r">Total :</TableCell>
                                            <TableCell className="text-right">₹{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        {type === 'LOCAL' ? (
                                            <TableRow className="bg-muted/50 font-bold">
                                                <TableCell colSpan={5} className="text-right border-r">IGST :</TableCell>
                                                <TableCell className="text-right">₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ) : type === 'CENTRAL' ? (
                                            <>
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={5} className="text-right border-r">CGST :</TableCell>
                                                    <TableCell className="text-right">₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={5} className="text-right border-r">SGST :</TableCell>
                                                    <TableCell className="text-right">₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            </>
                                        ) : null}
                                        <TableRow className="bg-muted/50 font-bold text-lg">
                                            <TableCell colSpan={5} className="text-right border-r">Grand Total :</TableCell>
                                            <TableCell className="text-right text-primary">₹{totals.grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
