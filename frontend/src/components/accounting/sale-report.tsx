'use client';

import { useState, useEffect } from 'react';
import { fetchFilteredBills, fetchCompany } from '@/lib/api';
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
import { Search, Download, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SaleReportProps {
    type: 'LOCAL' | 'CENTRAL';
    title: string;
}

export function SaleReport({ type, title }: SaleReportProps) {
    const [bills, setBills] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
    const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));

    useEffect(() => {
        loadData();
    }, [fromDate, toDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [companyData, billsData] = await Promise.all([
                fetchCompany(),
                fetchFilteredBills({
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString(),
                })
            ]);

            setCompany(companyData);

            // Filter by GST type: Local (CGST_SGST) vs Central (IGST)
            const filtered = billsData.filter((bill: any) =>
                type === 'LOCAL' ? bill.gstType === 'CGST_SGST' : bill.gstType === 'IGST'
            );
            setBills(filtered);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBills = bills.filter(bill =>
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totals = filteredBills.reduce((acc, bill) => {
        const taxable = bill.taxableAmount || (bill.cgst || bill.sgst || bill.igst ? ((bill.cgst || 0) + (bill.sgst || 0) + (bill.igst || 0)) / (bill.gstRate / 100) : bill.totalAmount);
        const cgst = bill.cgst || 0;
        const sgst = bill.sgst || 0;
        const igst = bill.igst || 0;
        const grand = bill.grandTotal || (taxable + cgst + sgst + igst);

        return {
            taxable: acc.taxable + taxable,
            cgst: acc.cgst + cgst,
            sgst: acc.sgst + sgst,
            igst: acc.igst + igst,
            grand: acc.grand + grand
        };
    }, { taxable: 0, cgst: 0, sgst: 0, igst: 0, grand: 0 });

    const handlePrint = () => {
        const params = new URLSearchParams({
            type,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            searchTerm
        });
        window.open(`/dashboard/sale-report/print?${params.toString()}`, '_blank');
    };

    return (
        <div className="space-y-4 print:p-0">
            <Card className="print:border-none print:shadow-none">
                <CardHeader className="flex flex-col space-y-4 pb-4">
                    <div className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        <div className="flex items-center space-x-2 print:hidden">
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
                                placeholder="Search by Bill No or Customer..."
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
                            <TableHeader className="bg-gray-800">
                                <TableRow>
                                    <TableHead className="w-[50px] font-bold text-white border-r border-gray-700">Sr.No.</TableHead>
                                    <TableHead className="min-w-[300px] font-bold text-white border-r border-gray-700">Customer Name & Address</TableHead>
                                    <TableHead className="w-[150px] font-bold text-white border-r border-gray-700">GSTIN/UIN</TableHead>
                                    <TableHead className="w-[120px] font-bold text-white border-r border-gray-700">Bill Date</TableHead>
                                    <TableHead className="w-[120px] font-bold text-white border-r border-gray-700">Bill No</TableHead>
                                    <TableHead className="w-[150px] font-bold text-white text-right">Taxable Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredBills.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">No records found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBills.map((bill, index) => (
                                        <TableRow key={bill.id} className="align-top hover:bg-transparent">
                                            <TableCell className="text-center border-r py-3">{index + 1}</TableCell>
                                            <TableCell className="border-r py-3">
                                                <div className="space-y-1">
                                                    <div className="font-bold uppercase">{bill.customer?.name}</div>
                                                    <div className="text-xs italic text-muted-foreground">
                                                        {bill.customer?.officeAddress || 'No Address Provided'}
                                                        {bill.customer?.officeState && `, ${bill.customer.officeState}`}
                                                        {bill.customer?.officePinCode && `-${bill.customer.officePinCode}`}
                                                    </div>
                                                    <div className="text-sm font-semibold pt-2">
                                                        STATE NAME : {bill.customer?.officeState?.toUpperCase() || company?.state?.toUpperCase() || '-'} /
                                                        STATE CODE : {bill.customer?.officeGst ? bill.customer.officeGst.substring(0, 2) : (bill.customer?.officeStateCode || company?.stateCode || '-')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-r py-3">{bill.customer?.officeGst || bill.customer?.siteGst || bill.customer?.gstIn || '-'}</TableCell>
                                            <TableCell className="border-r py-3">{format(new Date(bill.generationDate || bill.dateTo), 'dd-MM-yyyy')}</TableCell>
                                            <TableCell className="border-r py-3">{bill.billNumber}</TableCell>
                                            <TableCell className="text-right py-3 font-medium">
                                                ₹{(bill.taxableAmount || (bill.cgst || bill.sgst || bill.igst ? ((bill.cgst || 0) + (bill.sgst || 0) + (bill.igst || 0)) / (bill.gstRate / 100) : bill.totalAmount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!loading && filteredBills.length > 0 && (
                                    <>
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell colSpan={5} className="text-right border-r">Total :</TableCell>
                                            <TableCell className="text-right">₹{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        {type === 'LOCAL' ? (
                                            <>
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={5} className="text-right border-r">CGST @ 9% :</TableCell>
                                                    <TableCell className="text-right">₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={5} className="text-right border-r">SGST @ 9% :</TableCell>
                                                    <TableCell className="text-right">₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            </>
                                        ) : (
                                            <TableRow className="bg-muted/50 font-bold">
                                                <TableCell colSpan={5} className="text-right border-r">IGST @ 18% :</TableCell>
                                                <TableCell className="text-right">₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        )}
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

            <style jsx global>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    body { background: white !important; }
                    nav { display: none !important; }
                    header { display: none !important; }
                }
            `}</style>
        </div>
    );
}
