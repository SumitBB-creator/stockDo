'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Printer, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchCustomers, fetchLedger, fetchCompany, fetchSuppliers, fetchEmployees } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Autocomplete, AutocompleteItem } from '@/components/ui/autocomplete';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function LedgerPage() {
    const getInitialFromDate = () => {
        const today = new Date();
        const year = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
        return format(new Date(year, 3, 1), 'yyyy-MM-dd'); // April 1st
    };

    const [parties, setParties] = useState<AutocompleteItem[]>([]);
    const [selectedParty, setSelectedParty] = useState('');
    const [fromDate, setFromDate] = useState(getInitialFromDate());
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [ledgerData, setLedgerData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadBaseData = async () => {
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
                console.error("Failed to load base data:", error);
            }
        };
        loadBaseData();
    }, []);

    useEffect(() => {
        if (selectedParty) {
            loadLedgerStatement();
        } else {
            setLedgerData(null);
        }
    }, [selectedParty, fromDate, toDate]);

    const loadLedgerStatement = async () => {
        setLoading(true);
        try {
            const data = await fetchLedger(selectedParty, fromDate, toDate);
            setLedgerData(data);
        } catch (error) {
            console.error("Failed to load ledger:", error);
            toast({ title: "Error", description: "Failed to generate ledger statement.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Correct Accounting Logic for Totals and Balances
    const sideDebitTotal = (ledgerData?.transactions?.reduce((sum: number, t: any) => sum + (t.debit || 0), 0) || 0) +
        (ledgerData?.openingBalance < 0 ? Math.abs(ledgerData.openingBalance) : 0);

    const sideCreditTotal = (ledgerData?.transactions?.reduce((sum: number, t: any) => sum + (t.credit || 0), 0) || 0) +
        (ledgerData?.openingBalance > 0 ? Math.abs(ledgerData.openingBalance) : 0);

    const balancedTotal = Math.max(sideDebitTotal, sideCreditTotal);
    const closingBalanceValue = Math.abs(sideDebitTotal - sideCreditTotal);
    const isCreditBalance = sideCreditTotal > sideDebitTotal;
    const isDebitBalance = sideDebitTotal > sideCreditTotal;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Ledger Statement</h2>
                    <p className="text-sm text-muted-foreground mt-1">Detailed account statement for reconciliation</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 font-medium"
                    disabled={!ledgerData || ledgerData?.transactions?.length === 0}
                    onClick={() => window.print()}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Statement
                </Button>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-start gap-4 flex-wrap print:hidden">
                <div className="w-[300px]">
                    <Autocomplete
                        items={parties}
                        value={selectedParty}
                        onChange={setSelectedParty}
                        placeholder="Search Account..."
                        className="bg-background"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">From:</span>
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-[160px] h-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">To:</span>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-[160px] h-9"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="border rounded-lg overflow-x-auto shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="text-xs whitespace-nowrap font-medium h-10">Date</TableHead>
                            <TableHead className="text-xs whitespace-nowrap font-medium h-10 w-[40px] text-center">Cr/Dr</TableHead>
                            <TableHead className="text-xs min-w-[200px] font-medium h-10">Particulars</TableHead>
                            <TableHead className="text-xs whitespace-nowrap font-medium h-10">Vch Type</TableHead>
                            <TableHead className="text-xs whitespace-nowrap font-medium h-10">Vch No</TableHead>
                            <TableHead className="text-xs whitespace-nowrap font-medium h-10 text-right w-[120px]">Debit (₹)</TableHead>
                            <TableHead className="text-xs whitespace-nowrap font-medium h-10 text-right w-[120px]">Credit (₹)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!selectedParty ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                    <ReceiptText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                    Please select an account to view statement.
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="font-medium">Loading records...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : ledgerData ? (
                            <>
                                {/* Opening Balance Row */}
                                <TableRow className="bg-muted/30 border-b">
                                    <TableCell className="text-[11px] py-1 align-top whitespace-nowrap">{format(new Date(fromDate), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell className="text-xs py-1 align-top text-center font-medium">
                                        {ledgerData.openingBalance > 0 ? "Cr" : (ledgerData.openingBalance < 0 ? "Dr" : "")}
                                    </TableCell>
                                    <TableCell className="text-xs py-1 align-top font-bold uppercase">Opening Balance</TableCell>
                                    <TableCell className="text-xs py-1 align-top text-muted-foreground">-</TableCell>
                                    <TableCell className="text-xs py-1 align-top text-muted-foreground">-</TableCell>
                                    <TableCell className="text-right text-xs py-1 align-top font-bold tabular-nums">
                                        {ledgerData.openingBalance < 0 ? formatCurrency(Math.abs(ledgerData.openingBalance)) : '0.00'}
                                    </TableCell>
                                    <TableCell className="text-right text-xs py-1 align-top font-bold tabular-nums">
                                        {ledgerData.openingBalance > 0 ? formatCurrency(Math.abs(ledgerData.openingBalance)) : '0.00'}
                                    </TableCell>
                                </TableRow>

                                {/* Transaction Rows */}
                                {ledgerData.transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-xs">
                                            No receipts or transactions found for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ledgerData.transactions.map((t: any) => {
                                        const typeLabel = t.type === 'BILL' ? 'Sale' :
                                            t.type === 'RECEIPT' ? 'Payment' :
                                                t.type === 'PAYMENT' ? 'Refund' :
                                                    t.type === 'CREDIT_NOTE' ? 'Credit Note' :
                                                        t.type === 'DEBIT_NOTE' ? 'Debit Note' : t.type;

                                        return (
                                            <TableRow key={t.id} className="hover:bg-muted/50 transition-colors border-b">
                                                <TableCell className="text-[11px] py-2 align-top whitespace-nowrap">{format(new Date(t.date), 'dd-MMM-yyyy')}</TableCell>
                                                <TableCell className="text-xs py-2 align-top text-center font-medium">
                                                    {t.debit > 0 ? "Dr" : (t.credit > 0 ? "Cr" : "")}
                                                </TableCell>
                                                <TableCell className="py-2 align-top">
                                                    <div className="font-bold text-xs leading-tight uppercase">{t.entityName || ledgerData.party?.name || 'CASH'}</div>
                                                    {t.description && <div className="italic text-[10px] text-muted-foreground mt-1 leading-tight">{t.description}</div>}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 align-top">{typeLabel}</TableCell>
                                                <TableCell className="text-xs py-2 align-top font-medium">
                                                    {/* Prioritize resolved bill number (e.g. BILL0001) over IDs */}
                                                    {t.resolvedReference || t.referenceId || t.transactionNumber || '-'}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 align-top text-right tabular-nums font-semibold">
                                                    {t.debit > 0 ? formatCurrency(t.debit) : '0.00'}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 align-top text-right tabular-nums font-semibold">
                                                    {t.credit > 0 ? formatCurrency(t.credit) : '0.00'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </>
                        ) : null}
                    </TableBody>

                    {/* Triple-Row Footer - Re-integrated into Table for identical column widths and colors */}
                    {!loading && ledgerData && (
                        <TableFooter className="bg-transparent font-medium border-t-2">
                            {/* 1. Sub-Totals Row */}
                            <TableRow className="hover:bg-transparent border-b">
                                <TableCell className="h-10" />
                                <TableCell className="h-10" />
                                <TableCell className="py-2 align-top font-bold text-xs uppercase text-muted-foreground underline underline-offset-4 decoration-muted-foreground/30">Sub-Totals</TableCell>
                                <TableCell className="h-10" />
                                <TableCell className="h-10" />
                                <TableCell className="p-2 text-right font-bold text-xs tabular-nums align-top border-l border-muted/10">
                                    {formatCurrency(sideDebitTotal)}
                                </TableCell>
                                <TableCell className="p-2 text-right font-bold text-xs tabular-nums align-top">
                                    {formatCurrency(sideCreditTotal)}
                                </TableCell>
                            </TableRow>

                            {/* 2. Balancing (Closing) Row */}
                            <TableRow className="hover:bg-transparent border-b">
                                <TableCell className="h-10" />
                                <TableCell className="text-xs p-1 text-center font-bold align-top">
                                    {isCreditBalance ? "Cr" : (isDebitBalance ? "Dr" : "")}
                                </TableCell>
                                <TableCell className="p-2 font-bold text-xs align-top uppercase">Closing Balance</TableCell>
                                <TableCell className="h-10" />
                                <TableCell className="h-10" />
                                <TableCell className="p-2 text-right font-bold text-xs tabular-nums align-top border-l border-muted/10">
                                    {isCreditBalance ? formatCurrency(closingBalanceValue) : '0.00'}
                                </TableCell>
                                <TableCell className="p-2 text-right font-bold text-xs tabular-nums align-top">
                                    {isDebitBalance ? formatCurrency(closingBalanceValue) : '0.00'}
                                </TableCell>
                            </TableRow>

                            {/* 3. Final Balanced Total Row */}
                            <TableRow className="hover:bg-transparent border-t-2 border-double border-muted/50">
                                <TableCell className="h-10" />
                                <TableCell className="h-10" />
                                <TableCell className="p-2 text-[10px] font-bold h-10 flex items-center tracking-widest uppercase">Grand Balanced Total</TableCell>
                                <TableCell className="h-10" />
                                <TableCell className="h-10" />
                                <TableCell className="p-2 text-right font-bold text-sm tabular-nums align-top underline underline-offset-4 decoration-double border-l border-muted/10">
                                    {formatCurrency(balancedTotal)}
                                </TableCell>
                                <TableCell className="p-2 text-right font-bold text-sm tabular-nums align-top underline underline-offset-4 decoration-double">
                                    {formatCurrency(balancedTotal)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>
        </div>
    );
}
