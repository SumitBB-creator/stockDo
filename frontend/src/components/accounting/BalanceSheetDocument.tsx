import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
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
    title: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#BDC3C7',
        letterSpacing: 2,
    },
    dateText: {
        fontSize: 10,
        marginBottom: 20,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    mainContainer: {
        flexDirection: 'row',
        flex: 1,
        borderWidth: 1,
        borderColor: '#000000',
    },
    leftColumn: {
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    rightColumn: {
        flex: 1,
    },
    columnHeader: {
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    columnHeaderTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 4,
        paddingLeft: 10,
    },
    itemText: {
        fontSize: 9,
    },
    itemAmount: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        width: 80,
        textAlign: 'right',
        paddingRight: 6,
    },
    verticalDivider: {
        width: 1,
        backgroundColor: '#000000',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 80,
    },
    totalRow: {
        backgroundColor: '#F9FAFB',
        padding: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '45%',
        alignItems: 'center',
    },
    signatureLine: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        marginTop: 40,
        marginBottom: 5,
    },
    footerLabel: {
        fontSize: 9,
        color: '#4B5563',
    }
});

interface BalanceSheetDocumentProps {
    data: any;
    company: any;
    logoUrl: string | null;
    asOfDate: string;
}

const BalanceSheetDocument: React.FC<BalanceSheetDocumentProps> = ({ data, company, logoUrl, asOfDate }) => {
    const formatCurrency = (val: number | null | undefined) => {
        if (!val && val !== 0) return '0.00';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{company?.companyName || 'StockDo'}</Text>
                        {company?.address1 && <Text style={styles.companyAddress}>{company.address1}</Text>}
                        {company?.address2 && <Text style={styles.companyAddress}>{company.address2}</Text>}
                        <Text style={styles.companyAddress}>
                            {company?.city ? `${company.city}, ` : ''}{company?.state} {company?.pin ? `- ${company.pin}` : ''}
                        </Text>
                        {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                        {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                        {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl && <Image style={styles.logo} src={logoUrl} />}
                        <Text style={styles.title}>BALANCE SHEET</Text>
                    </View>
                </View>

                {/* Sub-Header */}
                <Text style={styles.dateText}>
                    Statement as of {format(new Date(asOfDate), 'dd MMMM yyyy')}
                </Text>

                {/* Main Content - Traditional T Format */}
                <View style={styles.mainContainer}>
                    {/* LEFT SIDE: ASSETS */}
                    <View style={styles.leftColumn}>
                        <View style={styles.columnHeader}>
                            <Text style={[styles.columnHeaderTitle, { flex: 1 }]}>ASSETS</Text>
                            <View style={{ width: 1, backgroundColor: '#000', height: '100%', position: 'absolute', right: 80 }} />
                            <Text style={[styles.columnHeaderTitle, { width: 80, textAlign: 'center' }]}></Text>
                        </View>

                        <View style={{ flex: 1, position: 'relative' }}>
                            <View style={styles.verticalDivider} />

                            <View style={{ paddingVertical: 4 }}>
                                <Text style={[styles.itemText, { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', paddingLeft: 4, marginBottom: 4 }]}>Current Assets:</Text>

                                <View style={styles.itemRow}>
                                    <Text style={styles.itemText}>Cash & Bank Balance</Text>
                                    <Text style={styles.itemAmount}>{formatCurrency(data.assets.liquidCash)}</Text>
                                </View>
                                <View style={styles.itemRow}>
                                    <Text style={styles.itemText}>Closing Stock Valuation</Text>
                                    <Text style={styles.itemAmount}>{formatCurrency(data.assets.stockValue)}</Text>
                                </View>
                                <View style={styles.itemRow}>
                                    <Text style={styles.itemText}>Sundry Debtors (Net Dues)</Text>
                                    <Text style={styles.itemAmount}>{formatCurrency(data.assets.debtors)}</Text>
                                </View>

                                <View style={{ paddingVertical: 10 }}>
                                    <Text style={[styles.itemText, { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', paddingLeft: 4, marginBottom: 4 }]}>Non-Current Assets:</Text>
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemText}>Fixed Assets (Valuation)</Text>
                                        <Text style={styles.itemAmount}>{formatCurrency(data.assets.fixedAssets)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ borderTopWidth: 1, borderTopColor: '#000' }}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalText}>Total Assets</Text>
                                <View style={{ width: 80, borderLeftWidth: 1, borderLeftColor: '#000', position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingRight: 6 }}>
                                    <Text style={[styles.totalText, { textAlign: 'right' }]}>{formatCurrency(data.assets.total)}</Text>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', position: 'absolute', bottom: 4, left: 4, right: 4 }} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* RIGHT SIDE: LIABILITIES & CAPITAL */}
                    <View style={styles.rightColumn}>
                        <View style={styles.columnHeader}>
                            <Text style={[styles.columnHeaderTitle, { flex: 1 }]}>LIABILITIES & CAPITAL</Text>
                            <View style={{ width: 1, backgroundColor: '#000', height: '100%', position: 'absolute', right: 80 }} />
                            <Text style={[styles.columnHeaderTitle, { width: 80, textAlign: 'center' }]}></Text>
                        </View>

                        <View style={{ flex: 1, position: 'relative' }}>
                            <View style={styles.verticalDivider} />

                            <View style={{ paddingVertical: 4 }}>
                                <Text style={[styles.itemText, { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', paddingLeft: 4, marginBottom: 4 }]}>Liabilities:</Text>

                                <View style={styles.itemRow}>
                                    <Text style={styles.itemText}>Sundry Creditors</Text>
                                    <Text style={styles.itemAmount}>{formatCurrency(data.liabilities.creditors)}</Text>
                                </View>
                                <View style={styles.itemRow}>
                                    <Text style={styles.itemText}>Advances from Customers</Text>
                                    <Text style={styles.itemAmount}>{formatCurrency(data.liabilities.advancesFromCustomers)}</Text>
                                </View>

                                <View style={{ paddingVertical: 10 }}>
                                    <Text style={[styles.itemText, { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', paddingLeft: 4, marginBottom: 4 }]}>Stockholders' Equity:</Text>
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemText}>Owner's Capital</Text>
                                        <Text style={styles.itemAmount}>{formatCurrency(data.liabilities.capital)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ borderTopWidth: 1, borderTopColor: '#000' }}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalText}>Total Liabilities & Capital</Text>
                                <View style={{ width: 80, borderLeftWidth: 1, borderLeftColor: '#000', position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingRight: 6 }}>
                                    <Text style={[styles.totalText, { textAlign: 'right' }]}>{formatCurrency(data.liabilities.total)}</Text>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', position: 'absolute', bottom: 4, left: 4, right: 4 }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.footerLabel}>Checked By</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.footerLabel}>For {company?.companyName || 'StockDo'}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default BalanceSheetDocument;
