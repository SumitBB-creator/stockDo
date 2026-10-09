'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#000',
        backgroundColor: '#fff',
    },
    pageBorder: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#000',
    },
    header: {
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    companyAddress: {
        fontSize: 9,
        marginBottom: 6,
    },
    customerName: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
        marginTop: 6,
    },
    customerAddress: {
        fontSize: 9,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    period: {
        fontSize: 10,
        marginTop: 2,
    },
    table: {
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableHeaderRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        backgroundColor: '#fff',
    },
    colDate: {
        width: '10%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    colDrCr: {
        width: '5%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'center',
    },
    colParticulars: {
        width: '35%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    colVchType: {
        width: '12%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    colVchNo: {
        width: '12%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    colDebit: {
        width: '13%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'right',
    },
    colCredit: {
        width: '13%',
        padding: 4,
        textAlign: 'right',
    },
    headerText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },
    cellText: {
        fontSize: 8,
    },
    cellBold: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
    },
    cellSmall: {
        fontSize: 7,
        fontStyle: 'italic',
        marginTop: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#000',
    },
    summaryColFill: {
        width: '74%',
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'right',
    }
});

interface LedgerDocumentProps {
    data: any;
    company: any;
    fromDate: string;
    toDate: string;
}

const formatCurrency = (amount: number | undefined) => {
    if (!amount && amount !== 0) return '0.00';
    return Number(amount).toFixed(2);
};

export const LedgerDocument: React.FC<LedgerDocumentProps> = ({ data, company, fromDate, toDate }) => {
    
    // Totals logic
    const sideDebitTotal = (data?.transactions?.reduce((sum: number, t: any) => sum + (t.debit || 0), 0) || 0) +
        (data?.openingBalance < 0 ? Math.abs(data.openingBalance) : 0);

    const sideCreditTotal = (data?.transactions?.reduce((sum: number, t: any) => sum + (t.credit || 0), 0) || 0) +
        (data?.openingBalance > 0 ? Math.abs(data.openingBalance) : 0);

    const closingBalanceValue = Math.abs(sideDebitTotal - sideCreditTotal);
    const isCreditBalance = sideCreditTotal > sideDebitTotal;
    const isDebitBalance = sideDebitTotal > sideCreditTotal;
    
    const isCompanyLedger = data?.partyDetails?.isCompany || !data?.partyDetails?.name;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.pageBorder}>
                    
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Text style={styles.companyName}>{company?.companyName || 'Company Name'}</Text>
                        <Text style={styles.companyAddress}>
                            {company?.address1} {company?.address2 ? company.address2 + ', ' : ''}
                            {company?.city ? company.city + ', ' : ''}
                            {company?.state} {company?.pin ? '-' + company.pin : ''}
                        </Text>

                        {!isCompanyLedger && data?.partyDetails?.name && (
                            <>
                                <Text style={styles.customerName}>{data.partyDetails.name}</Text>
                                {data.partyDetails.address && (
                                    <Text style={styles.customerAddress}>{data.partyDetails.address}</Text>
                                )}
                            </>
                        )}
                        
                        <Text style={styles.period}>
                            Ledger From: {format(new Date(fromDate), 'dd-MMM-yyyy')} To: {format(new Date(toDate), 'dd-MMM-yyyy')}
                        </Text>
                    </View>

                    {/* Table Section */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableHeaderRow]}>
                            <Text style={[styles.colDate, styles.headerText]}>Date</Text>
                            <Text style={[styles.colDrCr, styles.headerText]}></Text>
                            <Text style={[styles.colParticulars, styles.headerText]}>Pariculars</Text>
                            <Text style={[styles.colVchType, styles.headerText]}>Receipt Type</Text>
                            <Text style={[styles.colVchNo, styles.headerText]}>Receipt No</Text>
                            <Text style={[styles.colDebit, styles.headerText]}>Debit</Text>
                            <Text style={[styles.colCredit, styles.headerText]}>Credit</Text>
                        </View>

                        {/* Opening Balance */}
                        {data?.openingBalance !== 0 && (
                            <View style={styles.tableRow}>
                                <Text style={[styles.colDate, styles.cellText]}>{format(new Date(fromDate), 'dd-MM-yyyy')}</Text>
                                <Text style={[styles.colDrCr, styles.cellText]}>
                                    {data?.openingBalance > 0 ? "Cr" : (data?.openingBalance < 0 ? "Dr" : "")}
                                </Text>
                                <Text style={[styles.colParticulars, styles.cellText]}>Opening Balance</Text>
                                <Text style={[styles.colVchType, styles.cellText]}></Text>
                                <Text style={[styles.colVchNo, styles.cellText]}></Text>
                                <Text style={[styles.colDebit, styles.cellText]}>
                                    {data?.openingBalance < 0 ? formatCurrency(Math.abs(data.openingBalance)) : '0'}
                                </Text>
                                <Text style={[styles.colCredit, styles.cellText]}>
                                    {data?.openingBalance > 0 ? formatCurrency(Math.abs(data.openingBalance)) : '0'}
                                </Text>
                            </View>
                        )}

                        {/* Transactions */}
                        {data?.transactions?.map((t: any, idx: number) => {
                            const typeLabel = t.type === 'BILL' ? 'Sale' :
                                t.type === 'RECEIPT' ? 'Payment' :
                                t.type === 'PAYMENT' ? 'Refund Payment' :
                                t.type === 'CREDIT_NOTE' ? 'Credit Note' :
                                t.type === 'DEBIT_NOTE' ? 'Debit Note' : t.type;
                                
                            const modeText = t.mode ? `By ${t.mode}` : '';
                            const entityName = (t.entityName || data?.partyDetails?.name || 'CASH').toUpperCase();

                            return (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.colDate, styles.cellText]}>{t.date ? format(new Date(t.date), 'dd-MM-yyyy') : ''}</Text>
                                    <Text style={[styles.colDrCr, styles.cellText]}>{t.debit ? 'Dr' : 'Cr'}</Text>
                                    <View style={[styles.colParticulars, { flexDirection: 'column' }]}>
                                        {isCompanyLedger ? (
                                            <>
                                                <Text style={styles.cellBold}>{entityName}</Text>
                                                {t.description && <Text style={styles.cellSmall}>{t.description}</Text>}
                                            </>
                                        ) : (
                                            <Text style={styles.cellText}>{t.description || typeLabel}</Text>
                                        )}
                                        {modeText && <Text style={styles.cellSmall}>{modeText}</Text>}
                                    </View>
                                    <Text style={[styles.colVchType, styles.cellText]}>{typeLabel}</Text>
                                    <Text style={[styles.colVchNo, styles.cellText]}>{t.resolvedReference || t.referenceId || t.transactionNumber || '-'}</Text>
                                    <Text style={[styles.colDebit, styles.cellText]}>{t.debit ? formatCurrency(t.debit) : '0.00'}</Text>
                                    <Text style={[styles.colCredit, styles.cellText]}>{t.credit ? formatCurrency(t.credit) : '0.00'}</Text>
                                </View>
                            );
                        })}

                        {/* Totals Row */}
                        <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
                            <Text style={styles.summaryColFill}></Text>
                            <Text style={[styles.colDebit, styles.cellBold]}>{formatCurrency(sideDebitTotal)}</Text>
                            <Text style={[styles.colCredit, styles.cellBold]}>{formatCurrency(sideCreditTotal)}</Text>
                        </View>

                        {/* Closing Balance Row */}
                        <View style={styles.tableRow}>
                            <Text style={[styles.colDate, styles.cellText]}></Text>
                            <Text style={[styles.colDrCr, styles.cellText]}>{isDebitBalance ? 'Dr' : (isCreditBalance ? 'Cr' : '')}</Text>
                            <View style={styles.colParticulars}>
                                <Text style={styles.cellText}>Closing Balance</Text>
                            </View>
                            <Text style={[styles.colVchType, styles.cellText]}></Text>
                            <Text style={[styles.colVchNo, styles.cellText]}></Text>
                            <Text style={[styles.colDebit, styles.cellText]}>
                                {isDebitBalance ? '' : formatCurrency(closingBalanceValue)}
                            </Text>
                            <Text style={[styles.colCredit, styles.cellText]}>
                                {isCreditBalance ? '' : formatCurrency(closingBalanceValue)}
                            </Text>
                        </View>
                        
                        {/* Final Tally Row */}
                        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.summaryColFill}></Text>
                            <Text style={[styles.colDebit, styles.cellBold]}>
                                {formatCurrency(Math.max(sideDebitTotal, sideCreditTotal))}
                            </Text>
                            <Text style={[styles.colCredit, styles.cellBold]}>
                                {formatCurrency(Math.max(sideDebitTotal, sideCreditTotal))}
                            </Text>
                        </View>
                        
                    </View>
                </View>
            </Page>
        </Document>
    );
};
