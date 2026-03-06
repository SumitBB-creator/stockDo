'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, Printer, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Autocomplete } from '@/components/ui/autocomplete';
import { fetchCustomers, fetchCompany, fetchTransportationChallans } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatCustomerAddress } from '@/lib/utils';

export default function TransportationPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [challans, setChallans] = useState<any[]>([]);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        if (companyInfo) {
            loadTransportationData();
        }
    }, [month, year, selectedCustomer, companyInfo]);

    const loadBaseData = async () => {
        try {
            const [custData, compData] = await Promise.all([
                fetchCustomers(),
                fetchCompany()
            ]);
            setCustomers(custData);
            setCompanyInfo(compData);
        } catch (error) {
            console.error("Failed to load base data:", error);
            toast({ title: "Error", description: "Failed to load base data.", variant: "destructive" });
        }
    };

    const loadTransportationData = async () => {
        setLoading(true);
        try {
            const response = await fetchTransportationChallans({
                month: month.toString(),
                year: year.toString(),
                customerId: selectedCustomer || undefined
            });
            const dataArray = Array.isArray(response) ? response : (response?.data || []);
            setChallans(dataArray);
        } catch (error) {
            console.error("Failed to load transportation data:", error);
            toast({ title: "Error", description: "Failed to load transportation data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = subMonths(selectedDate, 1);
    const nextMonth = addMonths(selectedDate, 1);

    const getCompanyAddress = () => {
        if (!companyInfo) return '';
        const parts = [
            companyInfo.address1,
            companyInfo.address2,
            companyInfo.city,
            companyInfo.state,
            companyInfo.pin ? `- ${companyInfo.pin}` : ''
        ].filter(Boolean);
        return parts.join(', ');
    };

    const getCustomerAddress = (customer: any) => {
        return formatCustomerAddress(customer);
    };

    const getPartyDetails = (customer: any) => {
        if (!customer) return '';
        let details = customer.name;
        if (customer.relationType && customer.relationName) {
            details += ` ${customer.relationType} ${customer.relationName}`;
        }
        return details;
    };

    const formatLocation = (challan: any, isFrom: boolean) => {
        const companyAddr = getCompanyAddress();
        const customerAddr = getCustomerAddress(challan.customer);

        if (challan.type === 'ISSUE') {
            return isFrom ? companyAddr : customerAddr;
        } else {
            // RETURN
            return isFrom ? customerAddr : companyAddr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Transportation</h2>
            </div>

            {/* Filter Controls Row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Month Selector */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedDate(prevMonth)}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {format(prevMonth, 'MMM yyyy')}
                    </Button>

                    <div className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm">
                        {format(selectedDate, 'MMMM yyyy')}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedDate(nextMonth)}
                    >
                        {format(nextMonth, 'MMM yyyy')}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                {/* Customer Autocomplete Search */}
                <div className="w-[300px]">
                    <Autocomplete
                        items={customers.map(c => ({
                            value: c.id,
                            label: c.name,
                            tertiaryLabel: formatCustomerAddress(c),
                        }))}
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder="Search Customer..."
                        className="bg-background"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="border rounded-lg overflow-x-auto shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[40px] text-xs">Sr.No.</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Challan No</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Date</TableHead>
                            <TableHead className="whitespace-nowrap text-xs">Vehicle No</TableHead>
                            <TableHead className="min-w-[150px] text-xs">Party Details</TableHead>
                            <TableHead className="min-w-[180px] text-xs">From</TableHead>
                            <TableHead className="min-w-[180px] text-xs">To</TableHead>
                            <TableHead className="text-right whitespace-nowrap text-xs">Transportation (₹)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground font-medium">Loading records...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : challans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    No transportation records found for the selected criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            challans.map((challan, index) => (
                                <TableRow key={challan.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="text-xs font-medium align-top">{index + 1}</TableCell>
                                    <TableCell className="text-xs font-medium align-top whitespace-nowrap">{challan.challanNumber}</TableCell>
                                    <TableCell className="text-[11px] align-top whitespace-nowrap">{format(new Date(challan.date), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell className="text-[11px] align-top whitespace-nowrap">{challan.vehicleNumber || '-'}</TableCell>
                                    <TableCell className="align-top">
                                        <div className="font-medium text-xs leading-tight">{getPartyDetails(challan.customer)}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[10px] leading-tight align-top pr-2">
                                        {formatLocation(challan, true)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[10px] leading-tight align-top pr-2">
                                        {formatLocation(challan, false)}
                                    </TableCell>
                                    <TableCell className="text-xs align-top text-right whitespace-nowrap tabular-nums font-semibold">
                                        {challan.transportationCost?.toFixed(2) || '0.00'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => router.push(`/dashboard/accounting/transportation/print?month=${month}&year=${year}${selectedCustomer ? `&customerId=${selectedCustomer}` : ''}`)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print PDF
                </Button>
            </div>
        </div>
    );
}
