'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Search, CalendarIcon, ChevronLeft, ChevronRight, Plus, Eye, Trash2, X, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchChallans, fetchCustomers, deleteChallan, updateChallan } from '@/lib/api';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn, formatCustomerAddress } from "@/lib/utils";

export default function ChallanListPage() {
    const [challans, setChallans] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Filters
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');

    // Edit Transport Modal
    const [editingChallan, setEditingChallan] = useState<any>(null);
    const [eWayBillNo, setEWayBillNo] = useState('');
    const [biltyNumber, setBiltyNumber] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [challansData, customersData] = await Promise.all([
                fetchChallans(),
                fetchCustomers()
            ]);
            setChallans(challansData);
            setCustomers(customersData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? Deleting this challan will also PERMANENTLY DELETE all bills generated for this customer after this date. This action cannot be undone.")) {
            return;
        }
        setLoading(true);
        try {
            await deleteChallan(id);
            toast({ title: "Success", description: "Challan deleted successfully." });
            loadData();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete challan",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    const handleEditTransport = (challan: any) => {
        setEditingChallan(challan);
        setEWayBillNo(challan.eWayBillNo || '');
        setBiltyNumber(challan.biltyNumber || '');
    };

    const handleSaveTransport = async () => {
        if (!editingChallan) return;
        setSaving(true);
        try {
            await updateChallan(editingChallan.id, { eWayBillNo, biltyNumber });
            toast({ title: "Success", description: "Transport details updated successfully." });
            setEditingChallan(null);
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Filter Logic
    const filteredChallans = challans.filter(challan => {
        const challanDate = new Date(challan.date);
        const isDateMatch = selectedDate ? isSameMonth(challanDate, selectedDate) : true;
        const isCustomerMatch = selectedCustomer ? challan.customerId === selectedCustomer : true;
        const isIssueMatch = challan.type === 'ISSUE';

        return isDateMatch && isCustomerMatch && isIssueMatch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Challans</h2>
                    <p className="text-muted-foreground">
                        Manage your stock challans.
                    </p>
                </div>
                <Link href="/dashboard/stock/challan/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Challan
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {/* Date Selector */}
                <div className="flex items-center gap-1 bg-background rounded-md border p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setSelectedDate(prev => prev ? subMonths(prev, 1) : subMonths(new Date(), 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"ghost"}
                                className={cn(
                                    "h-8 font-medium justify-center w-[130px]",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "MMM yyyy") : <span>Filter by month</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setSelectedDate(prev => prev ? addMonths(prev, 1) : addMonths(new Date(), 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    {selectedDate && (
                        <div className="border-l pl-1 ml-1 h-6 flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => setSelectedDate(undefined)}
                                title="Clear date filter"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Customer Autocomplete Search */}
                <div className="w-[300px]">
                    <Autocomplete
                        items={customers.map(c => ({
                            value: c.id,
                            label: c.name,
                            subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                            tertiaryLabel: formatCustomerAddress(c)
                        }))}
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder="Search Customer..."
                        className="bg-background"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Sr.No.</TableHead>
                            <TableHead>Challan No</TableHead>
                            <TableHead>Manual No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center flex-col items-center">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                                        <span className="text-muted-foreground">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredChallans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No challans found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredChallans.map((challan, index) => (
                                <TableRow 
                                    key={challan.id} 
                                    className={cn(challan.isBilled && "text-red-600 dark:text-red-500")}
                                    title={challan.isBilled ? "A bill has been generated for this challan" : undefined}
                                >
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                                    <TableCell className={cn(challan.isBilled ? "opacity-80" : "text-muted-foreground")}>{challan.manualChallanNumber || '-'}</TableCell>
                                    <TableCell>{format(new Date(challan.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{challan.customer?.name}</div>
                                        <div className={cn("text-xs truncate max-w-[250px]", challan.isBilled ? "opacity-80" : "text-muted-foreground")}>
                                            {formatCustomerAddress(challan.customer)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/stock/challan/${challan.id}/print`}>
                                                <Button variant="ghost" size="icon" className={cn("h-8 w-8", challan.isBilled ? "text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950" : "text-muted-foreground hover:text-foreground")}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleEditTransport(challan)}
                                                title="Edit Transport Details"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(challan.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!editingChallan} onOpenChange={(open) => !open && setEditingChallan(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Transport Details</DialogTitle>
                        <DialogDescription>
                            Update the E-Way Bill Number and Builty Number for this challan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="eWay" className="text-right">
                                E-Way Bill No
                            </Label>
                            <Input
                                id="eWay"
                                value={eWayBillNo}
                                onChange={(e) => setEWayBillNo(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter E-Way Bill No"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="builty" className="text-right">
                                Builty No
                            </Label>
                            <Input
                                id="builty"
                                value={biltyNumber}
                                onChange={(e) => setBiltyNumber(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter Builty No"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditingChallan(null)}>Cancel</Button>
                        <Button type="button" onClick={handleSaveTransport} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
