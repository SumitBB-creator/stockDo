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
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#f3f4f6',
        padding: 5,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        width: '48%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 8,
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 14,
        fontWeight: 'bold',
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
        minHeight: 20,
        alignItems: 'center',
    },
    tableHeaderRow: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCol: {
        width: '33.33%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 5,
        textAlign: 'center',
    },
    tableColLast: {
        width: '33.33%',
        padding: 5,
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 9,
    },
    footer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureLine: {
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 5,
        textAlign: 'center',
        fontSize: 9,
    }
});

interface AnnualReportDocumentProps {
    data: any;
    company: any;
    year: number;
}

export const AnnualReportDocument: React.FC<AnnualReportDocumentProps> = ({ data, company, year }) => {
    const { financials, materials } = data;

    const formatCurrency = (amount: number) => {
        return (amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

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
                    <Text style={styles.reportTitle}>Annual Performance Report</Text>
                    <Text style={styles.periodInfo}>For the Year: {year}</Text>
                </View>

                {/* Financial Summary */}
                <Text style={styles.sectionTitle}>Financial Performance</Text>
                <View style={styles.grid}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Total Earnings</Text>
                        <Text style={styles.cardValue}>{formatCurrency(financials.totalEarnings)}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Total Spendings</Text>
                        <Text style={styles.cardValue}>{formatCurrency(financials.totalSpendings)}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Net Profit</Text>
                        <Text style={[styles.cardValue, { color: financials.netProfit >= 0 ? '#10b981' : '#f43f5e' }]}>
                            {formatCurrency(financials.netProfit)}
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Profit Margin</Text>
                        <Text style={styles.cardValue}>
                            {financials.totalEarnings > 0 ? ((financials.netProfit / financials.totalEarnings) * 100).toFixed(2) : '0.00'}%
                        </Text>
                    </View>
                </View>

                {/* Monthly Data Table */}
                <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>Month</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>Earnings</Text></View>
                        <View style={styles.tableColLast}><Text style={styles.tableCell}>Spendings</Text></View>
                    </View>
                    {financials.monthlyData.map((m: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{m.month}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatCurrency(m.earnings)}</Text></View>
                            <View style={styles.tableColLast}><Text style={styles.tableCell}>{formatCurrency(m.spendings)}</Text></View>
                        </View>
                    ))}
                </View>

                {/* Material Statistics */}
                <Text style={styles.sectionTitle}>Material Statistics</Text>
                <View style={styles.grid}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>New Materials Created</Text>
                        <Text style={styles.cardValue}>{materials.newCount}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Damaged Inventory</Text>
                        <Text style={[styles.cardValue, { color: '#f43f5e' }]}>{materials.damageCount}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Shortage Reported</Text>
                        <Text style={[styles.cardValue, { color: '#f59e0b' }]}>{materials.shortCount}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.signatureLine}>Prepared By</Text>
                    <Text style={styles.signatureLine}>Authorized Signatory</Text>
                </View>
            </Page>
        </Document>
    );
};
