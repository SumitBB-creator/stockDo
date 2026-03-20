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
        backgroundColor: '#1F2937',
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
        color: '#FFFFFF',
        paddingHorizontal: 4,
    },
    tableCell: {
        fontSize: 8,
        color: '#374151',
        paddingHorizontal: 4,
    },
    colSr: { width: '5%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colSupplier: { width: '40%', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colGstin: { width: '15%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colDate: { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colBillNo: { width: '13%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
    colAmount: { width: '15%', textAlign: 'right' },

    supplierName: {
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    supplierAddress: {
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

interface PurchaseReportDocumentProps {
    purchases: any[];
    company: any;
    logoUrl: string | null;
    title: string;
    period: string;
}

export const PurchaseReportPage: React.FC<PurchaseReportDocumentProps> = ({ purchases, company, logoUrl, title, period }) => {
    const totals = purchases.reduce((acc, p) => {
        const taxable = p.totalAmount || 0;
        const cgst = p.cgst || 0;
        const sgst = p.sgst || 0;
        const igst = p.igst || 0;
        const grand = p.grandTotal || (taxable + cgst + sgst + igst);

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
                    <Text style={[styles.reportTitle, { marginTop: 0 }]}>PURCHASE REPORT</Text>
                </View>
            </View>

            <Text style={styles.reportTitle}>
                {title}
            </Text>
            <Text style={styles.periodText}>{period}</Text>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colSr, styles.tableCellHeader]}>Sr.No.</Text>
                    <Text style={[styles.colSupplier, styles.tableCellHeader]}>Supplier Name & Address</Text>
                    <Text style={[styles.colGstin, styles.tableCellHeader]}>GSTIN/UIN</Text>
                    <Text style={[styles.colDate, styles.tableCellHeader]}>Date</Text>
                    <Text style={[styles.colBillNo, styles.tableCellHeader]}>Bill No</Text>
                    <Text style={[styles.colAmount, styles.tableCellHeader]}>Taxable Amt</Text>
                </View>

                {purchases.map((p, index) => {
                    const taxable = p.totalAmount || 0;
                    return (
                        <View key={p.id} style={styles.tableRow} wrap={false}>
                            <Text style={[styles.colSr, styles.tableCell]}>{index + 1}</Text>
                            <View style={[styles.colSupplier, styles.tableCell]}>
                                <Text style={styles.supplierName}>{p.supplier?.name}</Text>
                                <Text style={styles.supplierAddress}>
                                    {p.supplier?.address || 'No Address Provided'}
                                    {p.supplier?.state && `, ${p.supplier.state}`}
                                </Text>
                                <Text style={styles.stateInfo}>
                                    STATE NAME : {p.supplier?.state?.toUpperCase() || '-'} /
                                    STATE CODE : {p.supplier?.gstIn ? p.supplier.gstIn.substring(0, 2) : (p.supplier?.stateCode || '-')}
                                </Text>
                            </View>
                            <Text style={[styles.colGstin, styles.tableCell]}>{p.supplier?.gstIn || '-'}</Text>
                            <Text style={[styles.colDate, styles.tableCell]}>{format(new Date(p.date), 'dd-MM-yyyy')}</Text>
                            <Text style={[styles.colBillNo, styles.tableCell]}>{p.billNumber || '-'}</Text>
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

                    {/* GST Rows - Swapped for Purchases */}
                    {title.toLowerCase().includes('local') ? (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IGST :</Text>
                            <Text style={styles.totalValue}>
                                ₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>CGST :</Text>
                                <Text style={styles.totalValue}>
                                    ₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>SGST :</Text>
                                <Text style={styles.totalValue}>
                                    ₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </>
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
            </View>
            <Text 
                style={styles.pageNumber} 
                render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
                fixed 
            />
        </Page>
    );
};

const PurchaseReportDocument: React.FC<PurchaseReportDocumentProps> = (props) => (
    <Document>
        <PurchaseReportPage {...props} />
    </Document>
);

export default PurchaseReportDocument;
