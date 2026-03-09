'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { Search, CalendarIcon, ChevronLeft, ChevronRight, Plus, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchChallans, fetchCustomers, deleteChallan } from '@/lib/api';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCustomerAddress } from "@/lib/utils";

export default function ChallanListPage() {
    const [challans, setChallans] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Filters
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');

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

    // Filter Logic
    const filteredChallans = challans.filter(challan => {
        const challanDate = new Date(challan.date);
        const isDateMatch = isSameDay(challanDate, selectedDate);
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
                        onClick={() => setSelectedDate(subDays(selectedDate, 1))}
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
                                {selectedDate ? format(selectedDate, "dd MMM yyyy") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
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
                                    No challans found for this date.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredChallans.map((challan, index) => (
                                <TableRow key={challan.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                                    <TableCell className="text-muted-foreground">{challan.manualChallanNumber || '-'}</TableCell>
                                    <TableCell>{format(new Date(challan.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{challan.customer?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                                            {formatCustomerAddress(challan.customer)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/stock/challan/${challan.id}/print`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
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
        </div>
    );
}
