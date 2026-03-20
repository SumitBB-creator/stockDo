'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
        borderBottom: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    companyInfo: {
        fontSize: 9,
        lineHeight: 1.4,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        textDecoration: 'underline',
        textTransform: 'uppercase',
    },
    periodInfo: {
        fontSize: 10,
        marginTop: 4,
        fontStyle: 'italic',
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeaderRow: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableColMain: {
        width: '35%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        paddingLeft: 5,
        height: '100%',
        justifyContent: 'center',
    },
    tableCol: {
        width: '13%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'right',
        paddingRight: 5,
        height: '100%',
        justifyContent: 'center',
    },
    tableColLast: {
        width: '13%',
        textAlign: 'right',
        paddingRight: 5,
        height: '100%',
        justifyContent: 'center',
    },
    columnHeader: {
        fontWeight: 'bold',
        fontSize: 9,
    },
    cellText: {
        fontSize: 9,
    },
    boldText: {
        fontWeight: 'bold',
    },
    footerRow: {
        backgroundColor: '#f9f9f9',
        borderTopWidth: 2,
        borderTopColor: '#000',
    },
    netPayableRow: {
        backgroundColor: '#eee',
        borderTopWidth: 1,
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
    },
    summarySection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryBox: {
        width: '30%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
    },
    summaryLabel: {
        fontSize: 8,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 15,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9CA3AF',
    },
});

interface GstSummaryDocumentProps {
    summary: any;
    company: any;
    fromDate: string;
    toDate: string;
}

export const GstSummaryDocument: React.FC<GstSummaryDocumentProps> = ({ summary, company, fromDate, toDate }) => {
    const formatCurrency = (amount: number) => {
        return (amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getGstTotal = (row: any) => {
        if (!row) return 0;
        return (row.cgst || 0) + (row.sgst || 0) + (row.igst || 0);
    };

    const formatDateStr = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const netSgst = (summary?.sales?.sgst || 0) - (summary?.purchases?.sgst || 0);
    const netCgst = (summary?.sales?.cgst || 0) - (summary?.purchases?.cgst || 0);
    const netIgst = (summary?.sales?.igst || 0) - (summary?.purchases?.igst || 0);
    const netTotal = getGstTotal(summary?.sales) - getGstTotal(summary?.purchases);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>{company?.companyName}</Text>
                    <View style={styles.companyInfo}>
                        {company?.address1 && <Text>{company.address1}</Text>}
                        {company?.address2 && <Text>{company.address2}</Text>}
                        <Text>
                            {company?.city}{company?.state ? `, ${company.state}` : ''}{company?.pin ? ` - ${company.pin}` : ''}
                        </Text>
                        <Text>Phone: {company?.phone} | Email: {company?.email}</Text>
                        <Text style={{ fontWeight: 'bold', marginTop: 2 }}>GSTIN: {company?.gstin}</Text>
                    </View>
                    <Text style={styles.reportTitle}>GST Input-Output Tax Report</Text>
                    <Text style={styles.periodInfo}>From {formatDateStr(fromDate)} To {formatDateStr(toDate)}</Text>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <View style={styles.tableColMain}><Text style={styles.columnHeader}>PARTICULARS</Text></View>
                        <View style={styles.tableCol}><Text style={styles.columnHeader}>TAXABLE VAL</Text></View>
                        <View style={styles.tableCol}><Text style={styles.columnHeader}>SGST</Text></View>
                        <View style={styles.tableCol}><Text style={styles.columnHeader}>CGST</Text></View>
                        <View style={styles.tableCol}><Text style={styles.columnHeader}>IGST</Text></View>
                        <View style={styles.tableColLast}><Text style={styles.columnHeader}>GST TOTAL</Text></View>
                    </View>

                    {/* Balance B/F */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColMain}><Text style={styles.cellText}>Balance Brought Forward</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>-</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>0.00</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>0.00</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>0.00</Text></View>
                        <View style={styles.tableColLast}><Text style={styles.cellText}>0.00</Text></View>
                    </View>

                    {/* Sales */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColMain}><Text style={styles.cellText}>Add: Sales</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>{formatCurrency(summary?.sales.taxable)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>{formatCurrency(summary?.sales.sgst)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>{formatCurrency(summary?.sales.cgst)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.cellText}>{formatCurrency(summary?.sales.igst)}</Text></View>
                        <View style={styles.tableColLast}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(getGstTotal(summary?.sales))}</Text></View>
                    </View>

                    {/* Purchases */}
                    <View style={[styles.tableRow, styles.footerRow]}>
                        <View style={styles.tableColMain}><Text style={[styles.cellText, styles.boldText]}>Less: Purchases (Input Tax)</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(summary?.purchases.taxable)}</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(summary?.purchases.sgst)}</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(summary?.purchases.cgst)}</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(summary?.purchases.igst)}</Text></View>
                        <View style={styles.tableColLast}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(getGstTotal(summary?.purchases))}</Text></View>
                    </View>

                    {/* Net Payable */}
                    <View style={[styles.tableRow, styles.netPayableRow]}>
                        <View style={styles.tableColMain}><Text style={[styles.cellText, styles.boldText, { fontSize: 10 }]}>NET GST PAYABLE</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>-</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(netSgst)}</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(netCgst)}</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.cellText, styles.boldText]}>{formatCurrency(netIgst)}</Text></View>
                        <View style={styles.tableColLast}><Text style={[styles.cellText, styles.boldText, { fontSize: 10 }]}>{formatCurrency(netTotal)}</Text></View>
                    </View>
                </View>

                {/* Summary Section */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Total Output Tax</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(getGstTotal(summary?.sales))}</Text>
                    </View>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Total Input Tax</Text>
                        <Text style={[styles.summaryValue, { color: '#d32f2f' }]}>{formatCurrency(getGstTotal(summary?.purchases))}</Text>
                    </View>
                    <View style={[styles.summaryBox, { backgroundColor: '#f0f0f0' }]}>
                        <Text style={styles.summaryLabel}>Final GST Liability</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(netTotal)}</Text>
                    </View>
                </View>

                {/* Footer / Signatures */}
                <View style={{ marginTop: 50, flexDirection: 'row', justifyContent: 'space-between' }} wrap={false}>
                    <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: '#000', paddingTop: 5, textAlign: 'center' }}>
                        <Text style={{ fontSize: 9 }}>Prepared By</Text>
                    </View>
                    <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: '#000', paddingTop: 5, textAlign: 'center' }}>
                        <Text style={{ fontSize: 9 }}>Authorized Signatory</Text>
                    </View>
                </View>
                <Text 
                    style={styles.pageNumber} 
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
                    fixed 
                />
            </Page>
        </Document>
    );
};
