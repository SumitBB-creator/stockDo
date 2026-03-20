import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000000',
    },
    header: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#111827',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 2,
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    companyName: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        color: '#111827',
    },
    companyAddress: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#1F2937',
    },
    logo: {
        width: 120,
        height: 60,
        objectFit: 'contain',
        marginBottom: 5,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#E5E7EB',
        letterSpacing: 1,
        textAlign: 'right',
        marginTop: 5,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metaText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableCellHeader: {
        padding: 6,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    tableCell: {
        padding: 6,
        fontSize: 9,
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    tableCellNum: {
        padding: 6,
        fontSize: 9,
        textAlign: 'right',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    lastCell: {
        borderRightWidth: 0,
    },
    // Column Widths
    colTime: { width: '10%', textAlign: 'center' },
    colEntity: { width: '25%' },
    colPart: { width: '25%' },
    colRef: { width: '12%', textAlign: 'center' },
    colDebit: { width: '14%' },
    colCredit: { width: '14%' },

    totalsRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
    },
    totalsLabel: {
        width: '72%', // Sum of Time, Entity, Part, Ref
        padding: 6,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    totalsValueDebit: {
        width: '14%',
        padding: 6,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    totalsValueCredit: {
        width: '14%',
        padding: 6,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
    },
    footerLabel: {
        fontSize: 9,
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 20,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9CA3AF',
    },
});

interface DaybookDocumentProps {
    transactions: any[];
    company: any;
    logoUrl: string | null;
    date: string;
}

const DaybookDocument: React.FC<DaybookDocumentProps> = ({ transactions, company, logoUrl, date }) => {
    const companyName = company?.companyName || 'SEJWAL SHUTTERING STORE';

    const formatCurrency = (amount: number | undefined) => {
        if (!amount && amount !== 0) return '';
        return amount.toFixed(2);
    };

    const isDebit = (type: string) => type === 'BILL' || type === 'DEBIT_NOTE';
    const isCredit = (type: string) => type === 'RECEIPT' || type === 'CREDIT_NOTE' || type === 'PAYMENT';

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case 'BILL': return 'Tax/Retail Invoice';
            case 'RECEIPT': return 'Receipt (Inflow)';
            case 'PAYMENT': return 'Payment (Outflow)';
            case 'CREDIT_NOTE': return 'Credit Note';
            case 'DEBIT_NOTE': return 'Debit Note';
            default: return type;
        }
    };

    const totalDailyDebit = transactions.reduce((sum, t) => sum + (isDebit(t.type) ? t.amount : 0), 0);
    const totalDailyCredit = transactions.reduce((sum, t) => sum + (isCredit(t.type) ? t.amount : 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{companyName}</Text>
                        <Text style={styles.companyAddress}>{company?.address1} {company?.address2}</Text>
                        <Text style={styles.companyAddress}>{company?.city ? `${company.city}, ` : ''}{company?.state} {company?.pin ? `- ${company.pin}` : ''}</Text>
                        {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                        {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                        {company?.pan && <Text style={styles.companyAddress}>PAN No : {company.pan}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl && (
                            <Image
                                style={styles.logo}
                                src={logoUrl}
                            />
                        )}
                        <Text style={styles.title}>DAYBOOK REPORT</Text>
                    </View>
                </View>

                {/* Sub-Header */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Date: {format(new Date(date), 'dd MMM yyyy')}</Text>
                    <Text style={styles.metaText}>Total Trx: {transactions.length}</Text>
                </View>

                {/* Main Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCellHeader, styles.colTime]}>Time</Text>
                        <Text style={[styles.tableCellHeader, styles.colEntity]}>Party / Entity</Text>
                        <Text style={[styles.tableCellHeader, styles.colPart]}>Particulars</Text>
                        <Text style={[styles.tableCellHeader, styles.colRef]}>Ref No.</Text>
                        <Text style={[styles.tableCellHeader, styles.colDebit]}>Debit (Rs)</Text>
                        <Text style={[styles.tableCellHeader, styles.colCredit, styles.lastCell]}>Credit (Rs)</Text>
                    </View>

                    {transactions.length === 0 ? (
                        <View style={styles.tableRow}>
                            <Text style={[{ padding: 10, textAlign: 'center', fontSize: 10, width: '100%' } as any]}>No transactions recorded for this date.</Text>
                        </View>
                    ) : (
                        transactions.map((t, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.colTime]}>{format(new Date(t.date), 'HH:mm')}</Text>
                                <Text style={[styles.tableCell, styles.colEntity]}>{t.entityName}</Text>
                                <View style={[styles.tableCell, styles.colPart]}>
                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>{getTransactionLabel(t.type)}</Text>
                                    {t.description && <Text style={{ fontSize: 8, color: '#4B5563', marginTop: 2 }}>{t.description.substring(0, 50)}</Text>}
                                </View>
                                <Text style={[styles.tableCell, styles.colRef]}>{t.referenceId || '-'}</Text>
                                <Text style={[styles.tableCellNum, styles.colDebit]}>{isDebit(t.type) ? formatCurrency(t.amount) : ''}</Text>
                                <Text style={[styles.tableCellNum, styles.colCredit, styles.lastCell]}>{isCredit(t.type) ? formatCurrency(t.amount) : ''}</Text>
                            </View>
                        ))
                    )}

                    {/* Totals Box at the absolute bottom of the table */}
                    {transactions.length > 0 && (
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>DAILY TOTALS</Text>
                            <Text style={styles.totalsValueDebit}>{formatCurrency(totalDailyDebit)}</Text>
                            <Text style={[styles.totalsValueCredit, styles.lastCell]}>{formatCurrency(totalDailyCredit)}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.footerLabel}>End of Daybook for {format(new Date(date), 'dd MMMM yyyy')}</Text>
                <Text 
                    style={styles.pageNumber} 
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
                    fixed 
                />
            </Page>
        </Document>
    );
};

export default DaybookDocument;
