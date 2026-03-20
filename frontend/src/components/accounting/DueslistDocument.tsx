import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#333333',
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
        flex: 1,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    companyName: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        color: '#111827',
    },
    companyAddress: {
        fontSize: 8,
        lineHeight: 1.3,
        color: '#4B5563',
    },
    logo: {
        width: 80,
        height: 40,
        objectFit: 'contain',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#111827',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 9,
        color: '#6B7280',
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 5,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 4,
        justifyContent: 'center',
    },
    tableCol: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        padding: 4,
    },
    tableCellHeader: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: '#4B5563',
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 7,
        color: '#111827',
    },
    footerRow: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'solid',
    },
    footerCellLabel: {
        padding: 4,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        flex: 1,
    },
    footerCellValue: {
        padding: 4,
        width: '9%', // Matches the Current Balance columns
    },
    footerText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
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

interface DueslistDocumentProps {
    dues: any[];
    company: any;
    logoUrl?: string | null;
    asOfDate: string;
}

const DueslistDocument: React.FC<DueslistDocumentProps> = ({ dues, company, logoUrl, asOfDate }) => {

    const getCompanyAddress = () => {
        if (!company) return '';
        const parts = [
            company.address1,
            company.address2,
            company.city,
            company.state,
            company.pin ? `- ${company.pin}` : ''
        ].filter(Boolean);
        return parts.join(', ');
    };

    const getCustomerAddress = (customer: any) => {
        if (!customer) return '';
        const parts = [
            customer.officeAddress,
            customer.officeCity,
            customer.officeState,
        ].filter(Boolean);
        return parts.join(', ');
    };

    const formatCurrency = (val: number | null | undefined) => {
        if (!val && val !== 0) return '0.00';
        return val.toFixed(2);
    };

    const totalBillAmt = dues.reduce((sum, d) => sum + (d.billingAmount || 0), 0);
    const totalPayments = dues.reduce((sum, d) => sum + (d.billPayment || 0), 0);
    const totalNetDue = dues.reduce((sum, d) => sum + (d.netDue || 0), 0);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {company?.name && <Text style={styles.companyName}>{company.name}</Text>}
                        <Text style={styles.companyAddress}>{getCompanyAddress()}</Text>
                        {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                        {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                        <Text style={styles.title}>OUTSTANDING DUES REPORT</Text>
                        <Text style={styles.subtitle}>As Of: {format(new Date(asOfDate), 'dd-MMM-yyyy')}</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColHeader, { width: '3%' }]}><Text style={styles.tableCellHeader}>Sr</Text></View>
                        <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'left' }]}>Party Name</Text></View>
                        <View style={[styles.tableColHeader, { width: '18%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'left' }]}>Address</Text></View>
                        <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'left' }]}>Phone</Text></View>
                        <View style={[styles.tableColHeader, { width: '9%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Advances</Text></View>
                        <View style={[styles.tableColHeader, { width: '9%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Bill Amt</Text></View>
                        <View style={[styles.tableColHeader, { width: '9%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Payments</Text></View>
                        <View style={[styles.tableColHeader, { width: '9%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Refunds</Text></View>
                        <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Bal (Inc Adv)</Text></View>
                        <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Bal (Exc Adv)</Text></View>

                    </View>

                    {dues.map((due, index) => (
                        <View style={styles.tableRow} key={due.customer.id} wrap={false}>
                            <View style={[styles.tableCol, { width: '3%' }]}><Text style={[styles.tableCell, { textAlign: 'center' }]}>{index + 1}</Text></View>
                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>{due.customer.name}</Text></View>
                            <View style={[styles.tableCol, { width: '18%' }]}><Text style={styles.tableCell}>{getCustomerAddress(due.customer)}</Text></View>
                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{due.customer.officePhone || '-'}</Text></View>

                            <View style={[styles.tableCol, { width: '9%' }]}><Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatCurrency(due.advancePayment)}</Text></View>
                            <View style={[styles.tableCol, { width: '9%' }]}><Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatCurrency(due.billingAmount)}</Text></View>
                            <View style={[styles.tableCol, { width: '9%' }]}><Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatCurrency(due.billPayment)}</Text></View>
                            <View style={[styles.tableCol, { width: '9%' }]}><Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatCurrency(due.refundPayment)}</Text></View>

                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold', color: due.currentBalanceIncluded > 0 ? '#DC2626' : (due.currentBalanceIncluded < 0 ? '#16A34A' : '#333') }]}>
                                    {due.currentBalanceIncluded > 0 ? formatCurrency(due.currentBalanceIncluded) : due.currentBalanceIncluded < 0 ? `${formatCurrency(Math.abs(due.currentBalanceIncluded))} CR` : '-'}
                                </Text>
                            </View>

                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                                    {due.currentBalanceExcluded > 0 ? formatCurrency(due.currentBalanceExcluded) : '-'}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Footer Row for Total */}
                    <View style={styles.footerRow} wrap={false}>
                        <View style={[styles.footerCellLabel, { alignItems: 'flex-end' }]}>
                            <Text style={[styles.footerText, { textAlign: 'right' }]}>TOTAL NET DUES (Inc Adv):</Text>
                        </View>
                        <View style={[styles.footerCellValue, { width: '10%', borderRightWidth: 1, borderColor: '#E5E7EB' }]}>
                            <Text style={[styles.footerText, { textAlign: 'right', color: totalNetDue > 0 ? '#DC2626' : (totalNetDue < 0 ? '#16A34A' : '#333') }]}>
                                {totalNetDue > 0 ? formatCurrency(totalNetDue) : totalNetDue < 0 ? `${formatCurrency(Math.abs(totalNetDue))} CR` : '-'}
                            </Text>
                        </View>
                        <View style={[styles.footerCellValue, { width: '10%' }]}>
                            <Text></Text>
                        </View>
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

export default DueslistDocument;
