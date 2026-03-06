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
    title: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#E5E7EB',
        letterSpacing: 2,
    },
    section: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    customerSection: {
        width: '50%',
    },
    metaSection: {
        width: '45%',
        alignItems: 'flex-end',
    },
    sectionTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
        color: '#111827',
    },
    text: {
        marginBottom: 2,
        color: '#4B5563',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 3,
        width: '100%',
    },
    metaLabel: {
        color: '#6B7280',
        fontFamily: 'Helvetica-Bold',
        width: 80,
        textAlign: 'right',
        marginRight: 10,
    },
    metaValue: {
        fontFamily: 'Helvetica',
        color: '#111827',
        width: 100,
        textAlign: 'right',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: '#111827',
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 6,
    },
    colFromDate: { width: '10%', textAlign: 'center' },
    colToDate: { width: '10%', textAlign: 'center' },
    colParticulars: { width: '28%', paddingLeft: 5 },
    colHsn: { width: '10%', textAlign: 'center' },
    colBalance: { width: '10%', paddingRight: 5, textAlign: 'right' },
    colDays: { width: '6%', paddingRight: 5, textAlign: 'right' },
    colNo: { width: '6%', paddingRight: 5, textAlign: 'right' },
    colRate: { width: '8%', paddingRight: 5, textAlign: 'right' },
    colAmount: { width: '12%', paddingRight: 5, textAlign: 'right' },
    headerText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        textTransform: 'uppercase',
    },
    cellText: {
        fontSize: 9,
        color: '#4B5563',
    },
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: '#111827',
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
    },
    totalLabel: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: '#111827',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    terms: {
        width: '55%',
    },
    signature: {
        width: '35%',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 80,
    },
    termItem: {
        fontSize: 8,
        marginBottom: 2,
        color: '#4B5563',
    },
    signLine: {
        borderTopWidth: 1,
        borderTopColor: '#9CA3AF',
        width: '100%',
        marginTop: 40,
    },
    statusBadge: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        textTransform: 'uppercase',
    },
});

interface BillDocumentProps {
    bill: any;
    company: any;
    logoUrl: string | null;
}

export const BillPage: React.FC<BillDocumentProps> = ({ bill, company, logoUrl }) => (
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
                <Text style={styles.title}>Bill</Text>
            </View>
        </View>

        {/* Customer & Meta Info */}
        <View style={styles.section}>
            <View style={styles.customerSection}>
                <Text style={styles.sectionTitle}>Bill To</Text>
                <Text style={styles.customerName}>{bill.customer?.name}</Text>
                {bill.customer?.relationType && bill.customer?.relationName && (
                    <Text style={styles.text}>{bill.customer.relationType} {bill.customer.relationName}</Text>
                )}
                <Text style={styles.text}>
                    {bill.customer?.officeAddress || bill.customer?.siteAddress || ''}
                </Text>
                {bill.customer?.officeCity && (
                    <Text style={styles.text}>
                        {bill.customer.officeCity}
                        {bill.customer?.officeState ? `, ${bill.customer.officeState}` : ''}
                    </Text>
                )}
                {bill.customer?.officeGst && <Text style={styles.text}>GSTIN: {bill.customer.officeGst}</Text>}
            </View>
            <View style={styles.metaSection}>
                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Bill #:</Text>
                    <Text style={styles.metaValue}>{bill.billNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>From Date:</Text>
                    <Text style={styles.metaValue}>{format(new Date(bill.dateFrom), 'dd MMM yyyy')}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>To Date:</Text>
                    <Text style={styles.metaValue}>{format(new Date(bill.dateTo), 'dd MMM yyyy')}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Generated:</Text>
                    <Text style={styles.metaValue}>{format(new Date(bill.generationDate || bill.createdAt), 'dd MMM yyyy')}</Text>
                </View>
            </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={[styles.colFromDate, styles.headerText]}>From Date</Text>
                <Text style={[styles.colToDate, styles.headerText]}>To Date</Text>
                <Text style={[styles.colParticulars, styles.headerText]}>Particulars</Text>
                <Text style={[styles.colHsn, styles.headerText]}>HSN/SAC</Text>
                <Text style={[styles.colBalance, styles.headerText]}>Balance</Text>
                <Text style={[styles.colDays, styles.headerText]}>Days</Text>
                <Text style={[styles.colNo, styles.headerText]}>No</Text>
                <Text style={[styles.colRate, styles.headerText]}>Rate</Text>
                <Text style={[styles.colAmount, styles.headerText]}>Amount</Text>
            </View>
            {bill.items?.map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                    <Text style={[styles.colFromDate, styles.cellText]}>
                        {item.fromDate ? format(new Date(item.fromDate), 'dd/MM/yy') : ''}
                    </Text>
                    <Text style={[styles.colToDate, styles.cellText]}>
                        {item.toDate ? format(new Date(item.toDate), 'dd/MM/yy') : ''}
                    </Text>
                    <Text style={[styles.colParticulars, styles.cellText]}>{item.description}</Text>
                    <Text style={[styles.colHsn, styles.cellText]}>{item.hsn || ''}</Text>
                    <Text style={[styles.colBalance, styles.cellText]}>{item.balance || ''}</Text>
                    <Text style={[styles.colDays, styles.cellText]}>{item.days || ''}</Text>
                    <Text style={[styles.colNo, styles.cellText]}>{item.quantity || ''}</Text>
                    <Text style={[styles.colRate, styles.cellText]}>{item.rate?.toFixed(2)}</Text>
                    <Text style={[styles.colAmount, styles.cellText]}>{item.amount?.toFixed(2)}</Text>
                </View>
            ))}
            {/* Calculation Breakdown Rows */}
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '40%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '45%', color: '#111827' }]}>Total Bill Amount (Hire Charge)</Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827' }]}>
                    {bill.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '40%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '45%', color: '#111827' }]}>Transportation ( {bill.transportationCount || 0} )</Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827' }]}>
                    {(bill.transportationCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '40%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '45%', color: '#111827' }]}>Green Tax ( {bill.greenTaxCount || 0} )</Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827' }]}>
                    {(bill.greenTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '40%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '45%', color: '#111827' }]}>
                    Total + Transportation + Green Tax (Before Tax Amount)
                </Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827' }]}>
                    {(bill.totalAmount + (bill.transportationCost || 0) + (bill.greenTax || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            {/* GST Rows */}
            {bill.gstType === 'CGST_SGST' ? (
                <>
                    <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                        <Text style={{ width: '40%' }}></Text>
                        <Text style={[styles.colRate, styles.cellText, { width: '45%' }]}>CGST @ {(bill.gstRate || 18) / 2}%:</Text>
                        <Text style={[styles.colAmount, styles.cellText, { width: '15%' }]}>
                            {bill.cgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                        <Text style={{ width: '40%' }}></Text>
                        <Text style={[styles.colRate, styles.cellText, { width: '45%' }]}>SGST @ {(bill.gstRate || 18) / 2}%:</Text>
                        <Text style={[styles.colAmount, styles.cellText, { width: '15%' }]}>
                            {bill.sgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </>
            ) : bill.gstType === 'IGST' ? (
                <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                    <Text style={{ width: '40%' }}></Text>
                    <Text style={[styles.colRate, styles.cellText, { width: '45%' }]}>IGST @ {bill.gstRate || 18}%:</Text>
                    <Text style={[styles.colAmount, styles.cellText, { width: '15%' }]}>
                        {bill.igst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            ) : null}
            {/* Grand Total Row */}
            <View style={{ flexDirection: 'row', paddingVertical: 8, backgroundColor: '#F3F4F6', borderTopWidth: 2, borderTopColor: '#111827' }}>
                <Text style={{ width: '40%' }}></Text>
                <Text style={[styles.colRate, styles.totalLabel, { width: '45%' }]}>Grand Total:</Text>
                <Text style={[styles.colAmount, styles.totalAmount, { width: '15%' }]}>
                    Rs. {(bill.grandTotal || bill.totalAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <View style={styles.terms}>
                <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                <Text style={styles.termItem}>1. Payment is due within 15 days from the date of bill.</Text>
                <Text style={styles.termItem}>2. Rates as per agreement.</Text>
                <Text style={styles.termItem}>3. Subject to jurisdiction of local courts.</Text>
            </View>
            <View style={styles.signature}>
                <Text style={[styles.text, { fontSize: 10, textAlign: 'right' }]}>For {company?.companyName || 'Company'}</Text>
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                    <View style={styles.signLine} />
                    <Text style={[styles.text, { fontSize: 8, marginTop: 4 }]}>Authorized Signatory</Text>
                </View>
            </View>
        </View>
    </Page>
);

const BillDocument: React.FC<BillDocumentProps> = ({ bill, company, logoUrl }) => (
    <Document>
        <BillPage bill={bill} company={company} logoUrl={logoUrl} />
    </Document>
);

export default BillDocument;
