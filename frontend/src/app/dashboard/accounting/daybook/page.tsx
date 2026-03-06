'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchDaybook } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function DaybookPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadDaybookData();
    }, [selectedDate]);

    const loadDaybookData = async () => {
        setLoading(true);
        try {
            const responseData = await fetchDaybook(selectedDate);
            const actualData = responseData.data ? responseData.data : responseData;
            setTransactions(Array.isArray(actualData) ? actualData : []);
        } catch (error) {
            console.error("Failed to load daybook:", error);
            toast({ title: "Error", description: "Failed to load daybook entries.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount && amount !== 0) return '-';
        return amount.toFixed(2);
    };

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case 'BILL': return 'Invoice';
            case 'RECEIPT': return 'Receipt';
            case 'PAYMENT': return 'Payment';
            case 'CREDIT_NOTE': return 'Credit Note';
            case 'DEBIT_NOTE': return 'Debit Note';
            default: return type;
        }
    };

    const isDebit = (type: string) => type === 'BILL' || type === 'DEBIT_NOTE';
    const isCredit = (type: string) => type === 'RECEIPT' || type === 'CREDIT_NOTE' || type === 'PAYMENT';

    const filteredTransactions = transactions.filter(t =>
        t.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate daily totals
    const totalDailyDebit = filteredTransactions.reduce((sum, t) => sum + (isDebit(t.type) ? t.amount : 0), 0);
    const totalDailyCredit = filteredTransactions.reduce((sum, t) => sum + (isCredit(t.type) ? t.amount : 0), 0);

    const handlePrint = () => {
        router.push(`/dashboard/accounting/daybook/print?date=${selectedDate}&search=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Daybook</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print PDF
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Select Date:</label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-[180px]"
                        />
                    </div>
                </div>

                <div className="relative w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search entity..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Party / Entity Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Particulars</TableHead>
                            <TableHead>Ref No.</TableHead>
                            <TableHead className="text-right w-[130px]">Debit (₹)</TableHead>
                            <TableHead className="text-right w-[130px]">Credit (₹)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No transactions recorded for this date.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {format(new Date(t.date), 'HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        {t.entityName}
                                    </TableCell>
                                    <TableCell>
                                        {getTransactionLabel(t.type)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-muted-foreground max-w-[200px] truncate" title={t.description}>
                                            {t.description || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {t.referenceId || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isDebit(t.type) ? formatCurrency(t.amount) : ''}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isCredit(t.type) ? formatCurrency(t.amount) : ''}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {!loading && transactions.length > 0 && (
                    <div className="bg-muted/20 border-t flex flex-wrap min-w-full">
                        <div className="flex-1 p-4 font-bold text-right pr-6 min-w-[300px]">
                            Daily Totals:
                        </div>
                        <div className="w-[130px] p-4 text-right font-bold tabular-nums">
                            {formatCurrency(totalDailyDebit)}
                        </div>
                        <div className="w-[130px] p-4 text-right font-bold tabular-nums">
                            {formatCurrency(totalDailyCredit)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
