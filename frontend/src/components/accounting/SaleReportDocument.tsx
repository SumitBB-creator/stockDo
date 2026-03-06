import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#333333',
    },
    header: {
        marginBottom: 20,
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
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 5,
        color: '#111827',
    },
    companyAddress: {
        fontSize: 9,
        lineHeight: 1.3,
        color: '#4B5563',
    },
    logo: {
        width: 100,
        height: 50,
        objectFit: 'contain',
        marginBottom: 5,
    },
    reportTitle: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#111827',
        marginTop: 10,
        textAlign: 'center',
    },
    periodText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 15,
    },
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1F2937', // Match the dark gray header requested
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 6,
        alignItems: 'flex-start',
    },
    tableCellHeader: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#FFFFFF', // White text for header
        paddingHorizontal: 4,
    },
    tableCell: {
        fontSize: 8,
        color: '#374151',
        paddingHorizontal: 4,
    },
    colSr: { width: '5%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colCustomer: { width: '40%', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colGstin: { width: '15%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colBillDate: { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colBillNo: { width: '13%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colAmount: { width: '15%', textAlign: 'right' },

    customerName: {
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    customerAddress: {
        fontSize: 7,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    stateInfo: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },

    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#111827',
        paddingVertical: 4,
    },
    totalLabel: {
        width: '85%',
        textAlign: 'right',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        paddingRight: 10,
    },
    totalValue: {
        width: '15%',
        textAlign: 'right',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        paddingRight: 4,
    },
    grandTotalRow: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderTopWidth: 2,
        borderTopColor: '#111827',
        paddingVertical: 8,
        marginTop: 2,
    },
    grandTotalLabel: {
        width: '85%',
        textAlign: 'right',
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        paddingRight: 10,
    },
    grandTotalValue: {
        width: '15%',
        textAlign: 'right',
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#2563EB',
        paddingRight: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
    }
});

interface SaleReportDocumentProps {
    bills: any[];
    company: any;
    logoUrl: string | null;
    title: string;
    period: string;
}

export const SaleReportPage: React.FC<SaleReportDocumentProps> = ({ bills, company, logoUrl, title, period }) => {
    const totals = bills.reduce((acc, bill) => {
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

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.companyName}>{company?.companyName || 'Company Name'}</Text>
                    <Text style={styles.companyAddress}>{company?.address1} {company?.address2}</Text>
                    <Text style={styles.companyAddress}>{company?.city ? `${company.city}, ` : ''}{company?.state} {company?.pin ? `- ${company.pin}` : ''}</Text>
                    {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                    {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                    {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                    {company?.pan && <Text style={styles.companyAddress}>PAN No: {company.pan}</Text>}
                </View>
                <View style={styles.headerRight}>
                    {logoUrl && (
                        <Image style={styles.logo} src={logoUrl} />
                    )}
                    <Text style={[styles.reportTitle, { marginTop: 0 }]}>REPORT</Text>
                </View>
            </View>

            <Text style={styles.reportTitle}>
                {title.toLowerCase().includes('local') ? 'LOCAL SALE REPORT' :
                    title.toLowerCase().includes('central') ? 'CENTRAL SALE REPORT' : title}
            </Text>
            <Text style={styles.periodText}>{period}</Text>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colSr, styles.tableCellHeader]}>Sr.No.</Text>
                    <Text style={[styles.colCustomer, styles.tableCellHeader]}>Customer Name & Address</Text>
                    <Text style={[styles.colGstin, styles.tableCellHeader]}>GSTIN/UIN</Text>
                    <Text style={[styles.colBillDate, styles.tableCellHeader]}>Bill Date</Text>
                    <Text style={[styles.colBillNo, styles.tableCellHeader]}>Bill No</Text>
                    <Text style={[styles.colAmount, styles.tableCellHeader]}>Taxable Amt</Text>
                </View>

                {bills.map((bill, index) => {
                    const taxable = bill.taxableAmount || (bill.cgst || bill.sgst || bill.igst ? ((bill.cgst || 0) + (bill.sgst || 0) + (bill.igst || 0)) / (bill.gstRate / 100) : bill.totalAmount);
                    return (
                        <View key={bill.id} style={styles.tableRow} wrap={false}>
                            <Text style={[styles.colSr, styles.tableCell]}>{index + 1}</Text>
                            <View style={[styles.colCustomer, styles.tableCell]}>
                                <Text style={styles.customerName}>{bill.customer?.name}</Text>
                                <Text style={styles.customerAddress}>
                                    {bill.customer?.officeAddress || 'No Address Provided'}
                                    {bill.customer?.officeState && `, ${bill.customer.officeState}`}
                                </Text>
                                <Text style={styles.stateInfo}>
                                    STATE NAME : {bill.customer?.officeState?.toUpperCase() || company?.state?.toUpperCase() || '-'} /
                                    STATE CODE : {bill.customer?.officeGst ? bill.customer.officeGst.substring(0, 2) : (bill.customer?.officeStateCode || company?.stateCode || '-')}
                                </Text>
                            </View>
                            <Text style={[styles.colGstin, styles.tableCell]}>{bill.customer?.officeGst || bill.customer?.siteGst || bill.customer?.gstIn || '-'}</Text>
                            <Text style={[styles.colBillDate, styles.tableCell]}>{format(new Date(bill.generationDate || bill.dateTo), 'dd-MM-yyyy')}</Text>
                            <Text style={[styles.colBillNo, styles.tableCell]}>{bill.billNumber}</Text>
                            <Text style={[styles.colAmount, styles.tableCell]}>
                                {taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    );
                })}

                {/* Multi-row Summary */}
                <View style={{ marginTop: 10 }}>
                    {/* Total Row */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total :</Text>
                        <Text style={styles.totalValue}>
                            ₹{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>

                    {/* GST Rows */}
                    {title.includes('Local') ? (
                        <>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>CGST @ 9% :</Text>
                                <Text style={styles.totalValue}>
                                    ₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>SGST @ 9% :</Text>
                                <Text style={styles.totalValue}>
                                    ₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IGST @ 18% :</Text>
                            <Text style={styles.totalValue}>
                                ₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}

                    {/* Grand Total Row */}
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total :</Text>
                        <Text style={styles.grandTotalValue}>
                            ₹{totals.grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerText}>Generated on {format(new Date(), 'dd MMM yyyy HH:mm')}</Text>
                <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages}`
                )} />
            </View>
        </Page>
    );
};

const SaleReportDocument: React.FC<SaleReportDocumentProps> = (props) => (
    <Document>
        <SaleReportPage {...props} />
    </Document>
);

export default SaleReportDocument;
