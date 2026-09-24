import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { toWords } from '@/lib/utils';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        paddingTop: 30,
        
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333333',
    },
    pageBorder: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#4B5563',
        borderRadius: 4,
        padding: 10,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#4B5563',
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
    taxInvoice: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#4B5563',
        color: '#111827',
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
    underlinedTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'underline',
        marginBottom: 4,
        color: '#374151',
        textTransform: 'uppercase',
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
        borderBottomColor: '#E5E7EB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 6,
    },
    colSr: { width: '5%', textAlign: 'center' },
    colFromDate: { width: '10%', textAlign: 'center' },
    colToDate: { width: '10%', textAlign: 'center' },
    colParticulars: { width: '23%', paddingLeft: 5 },
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
        borderTopColor: '#E5E7EB',
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
    },
    totalLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    summaryLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    summaryAmount: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 90,
        left: 40,
        right: 40,
        height: 85,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        paddingTop: 10,
        paddingHorizontal: 10,
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
        fontFamily: 'Helvetica-Bold',
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
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 85,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9CA3AF',
    },
});

interface BillDocumentProps {
    bill: any;
    company: any;
    logoUrl: string | null;
}

export const BillPage: React.FC<BillDocumentProps> = ({ bill, company, logoUrl }) => (
    <Page size="A4" style={[styles.page, { paddingBottom: 180, backgroundColor: '#ffffff' }]}>
                <View style={{ paddingHorizontal: 40, paddingTop: 10 }}>
                <View fixed>
                {/* Top Info Bar */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: '#000000',
                    marginBottom: 10,
                }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' }}>
                        (GSTIN/UIN : {company?.gstin || ''})
                    </Text>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' }}>
                        I. Mark : CT
                    </Text>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' }}>
                        (PAN No : {company?.pan || ''})
                    </Text>
                </View>
        <Text style={styles.taxInvoice}>Tax Invoice</Text>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Text style={styles.companyName}>{company?.companyName || 'Company Name'}</Text>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#000000', marginBottom: 4 }}>
                    (Service Provider of Shuttering & Scaffolding Goods on Hire)
                </Text>
                <Text style={styles.companyAddress}>{company?.address1} {company?.address2}</Text>
                <Text style={styles.companyAddress}>{company?.city ? `${company.city}, ` : ''}{company?.state} {company?.pin ? `- ${company.pin}` : ''}</Text>
                {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
            </View>
            <View style={styles.headerRight}>
                {logoUrl && (
                    <Image style={styles.logo} src={logoUrl} />
                )}
                <Text style={styles.title}>Invoice</Text>
            </View>
        </View>

        {/* Customer & Meta Info */}
        <View style={styles.section}>
            <View style={styles.customerSection}>
                <Text style={styles.sectionTitle}>Bill To (Office Address)</Text>
                <Text style={styles.customerName}>{bill.customer?.name}</Text>
                {(() => {
                    const customer = bill.customer;
                    if (!customer) return null;
                    const billAddress = customer.residenceAddress || customer.officeAddress || customer.address || '';
                    const billCity = customer.residenceCity || customer.officeCity || customer.city || '';
                    const billState = customer.residenceState || customer.officeState || customer.state || '';
                    const billPin = customer.residencePin || customer.officePin || customer.pin || '';

                    const mainParts = [billAddress, billCity].filter(Boolean);
                    let formattedBillAddress = mainParts.join(', ');
                    if (billState || billPin) {
                        const statePin = [billState, billPin].filter(Boolean).join(' - ');
                        if (statePin) formattedBillAddress += ` (${statePin})`;
                    }

                    const siteAddressParts = [customer.siteAddress, customer.siteCity].filter(Boolean);
                    let formattedSiteAddress = siteAddressParts.join(', ');
                    if (customer.siteState || customer.sitePin) {
                        const siteStatePin = [customer.siteState, customer.sitePin].filter(Boolean).join('-');
                        if (siteStatePin) formattedSiteAddress += ` (${siteStatePin})`;
                    }

                    return (
                        <>
                            <Text style={styles.text}>{formattedBillAddress}</Text>
                            {customer.officeGst && <Text style={styles.text}>GSTIN: {customer.officeGst}</Text>}
                            <Text style={styles.text}>
                                STATE NAME : {(customer.officeState || '').toUpperCase()} / STATE CODE : {customer.officeStateCode || (customer.officeGst || '').substring(0, 2)}
                            </Text>
                            
                            {(customer.siteAddress || customer.siteCity) && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }]}>Shipped To (Site Address) :</Text>
                                    <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginTop: 2 }]}>{customer.name}</Text>
                                    <Text style={styles.text}>{formattedSiteAddress}</Text>
                                    <Text style={styles.text}>Email : {customer.siteEmail || customer.officeEmail || ''}</Text>
                                    <Text style={[styles.text, { marginTop: 4 }]}>
                                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>GSTIN/UIN : </Text>
                                        {customer.siteGst || customer.officeGst || ''}
                                    </Text>
                                    <Text style={styles.text}>
                                        STATE NAME : {(customer.siteState || customer.officeState || '').toUpperCase()} / STATE CODE : {customer.siteStateCode || customer.officeStateCode || (customer.siteGst || customer.officeGst || '').substring(0, 2)}
                                    </Text>
                                </View>
                            )}
                        </>
                    );
                })()}
            </View>
            <View style={styles.metaSection}>
                <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { textAlign: 'left', width: 90 }]}>Invoice No</Text>
                    <Text style={[styles.metaValue, { textAlign: 'left', width: 120 }]}>: {bill.billNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { textAlign: 'left', width: 90 }]}>Invoice Date</Text>
                    <Text style={[styles.metaValue, { textAlign: 'left', width: 120 }]}>: {format(new Date(bill.dateTo), 'dd/MM/yyyy')}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { textAlign: 'left', width: 90 }]}>Invoice Period</Text>
                    <Text style={[styles.metaValue, { textAlign: 'left', width: 120 }]}>: {format(new Date(bill.dateFrom), 'dd/MM/yyyy')} to {format(new Date(bill.dateTo), 'dd/MM/yyyy')}</Text>
                </View>

                <View style={{ marginTop: 10, width: '100%', alignItems: 'flex-start' }}>
                    <Text style={styles.underlinedTitle}>Banking Details</Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaLabel, { textAlign: 'left', width: 90 }]}>Bank Name</Text>
                        <Text style={[styles.metaValue, { textAlign: 'left', width: 120 }]}>: {company?.bankName || '........................'}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaLabel, { textAlign: 'left', width: 90 }]}>A/C No</Text>
                        <Text style={[styles.metaValue, { textAlign: 'left', width: 120 }]}>: {company?.accountNumber || '........................'}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaLabel, { textAlign: 'left', width: 90 }]}>IFSC Code</Text>
                        <Text style={[styles.metaValue, { textAlign: 'left', width: 120 }]}>: {company?.ifscCode || '........................'}</Text>
                    </View>
                </View>
            </View>
        </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
                <Text style={[styles.colSr, styles.headerText]}>Sr.</Text>
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
                    <Text style={[styles.colSr, styles.cellText]}>{index + 1}</Text>
                    <Text style={[styles.colFromDate, styles.cellText]}>
                        {item.fromDate ? format(new Date(item.fromDate), 'dd/MM/yyyy') : ''}
                    </Text>
                    <Text style={[styles.colToDate, styles.cellText]}>
                        {item.toDate ? format(new Date(item.toDate), 'dd/MM/yyyy') : ''}
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
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '40%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>Total Bill Amount (Hire Charge)</Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>
                    {bill.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '40%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>Transportation ( {bill.transportationCount || 0} )</Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>
                    {(bill.transportationCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '40%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>Green Tax ( {bill.greenTaxCount || 0} )</Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>
                    {(bill.greenTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#e5e7eb' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.cellText, { width: '40%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>
                    Total + Transportation + Green Tax (Before Tax Amount)
                </Text>
                <Text style={[styles.colAmount, styles.cellText, { width: '15%', color: '#111827', fontFamily: 'Helvetica-Bold' }]}>
                    {(bill.totalAmount + (bill.transportationCost || 0) + (bill.greenTax || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            {/* GST Rows */}
            {bill.gstType === 'CGST_SGST' ? (
                <>
                    <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                        <Text style={{ width: '45%' }}></Text>
                        <Text style={[styles.colRate, styles.cellText, { width: '40%', fontFamily: 'Helvetica-Bold' }]}>CGST @ {(bill.gstRate || 18) / 2}%:</Text>
                        <Text style={[styles.colAmount, styles.cellText, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>
                            {bill.cgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                        <Text style={{ width: '45%' }}></Text>
                        <Text style={[styles.colRate, styles.cellText, { width: '40%', fontFamily: 'Helvetica-Bold' }]}>SGST @ {(bill.gstRate || 18) / 2}%:</Text>
                        <Text style={[styles.colAmount, styles.cellText, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>
                            {bill.sgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </>
            ) : bill.gstType === 'IGST' ? (
                <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                    <Text style={{ width: '45%' }}></Text>
                    <Text style={[styles.colRate, styles.cellText, { width: '40%', fontFamily: 'Helvetica-Bold' }]}>IGST @ {bill.gstRate || 18}%:</Text>
                    <Text style={[styles.colAmount, styles.cellText, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>
                        {bill.igst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            ) : null}
            {/* Summary Rows */}
            <View style={{ flexDirection: 'row', paddingVertical: 4, backgroundColor: '#F3F4F6', borderTopWidth: 2, borderTopColor: '#E5E7EB' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.summaryLabel, { width: '40%' }]}>Bill-Amount</Text>
                <Text style={[styles.colAmount, styles.summaryAmount, { width: '15%' }]}>
                    {(bill.grandTotal || bill.totalAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, backgroundColor: '#F3F4F6' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.summaryLabel, { width: '40%' }]}>Pre-Balance</Text>
                <Text style={[styles.colAmount, styles.summaryAmount, { width: '15%' }]}>
                    {(bill.preBalance || 0)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, backgroundColor: '#F3F4F6', borderTopWidth: 1, borderTopColor: '#E5E7EB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.summaryLabel, { width: '40%' }]}>Pre-Balance + Bill-Amount</Text>
                <Text style={[styles.colAmount, styles.summaryAmount, { width: '15%' }]}>
                    {((bill.grandTotal || bill.totalAmount) + (bill.preBalance || 0))?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 4, backgroundColor: '#F3F4F6' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.summaryLabel, { width: '40%' }]}>Advance</Text>
                <Text style={[styles.colAmount, styles.summaryAmount, { width: '15%' }]}>
                    {(bill.advanceAmount || 0)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 8, backgroundColor: '#E5E7EB', borderTopWidth: 2, borderTopColor: '#D1D5DB' }}>
                <Text style={{ width: '45%' }}></Text>
                <Text style={[styles.colRate, styles.totalLabel, { width: '40%' }]}>GRAND TOTAL (Bill Amount After Tax)</Text>
                <Text style={[styles.colAmount, styles.totalAmount, { width: '15%' }]}>
                    {Math.max(0, (bill.grandTotal || bill.totalAmount) + (bill.preBalance || 0) - (bill.advanceAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
            </View>
            <View style={{ paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: '#111827', fontSize: 10 }}>Amount in Words : </Text>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: '#111827', fontSize: 10, marginLeft: 5, textTransform: 'capitalize' }}>
                    {toWords(Math.round(Math.max(0, (bill.grandTotal || bill.totalAmount) + (bill.preBalance || 0) - (bill.advanceAmount || 0))))} Rupees Only
                </Text>
            </View>
        </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
            <View style={styles.terms}>
                <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                <Text style={styles.termItem}>1. E. & O. E Interest @24% per annum will be charged if the bill is not paid within 15 days from the date of presentation.</Text>
                <Text style={styles.termItem}>2. Rates as per agreement.</Text>
                <Text style={styles.termItem}>3. Subject to jurisdiction of local courts.</Text>
            </View>
            <View style={styles.signature}>
                <Text style={[styles.text, { fontSize: 10, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>For {company?.companyName || 'Company'}</Text>
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                    <View style={styles.signLine} />
                    <Text style={[styles.text, { fontSize: 8, marginTop: 4, fontFamily: 'Helvetica-Bold' }]}>Authorized Signatory</Text>
                </View>
            </View>
        </View>
                <Text 
            style={styles.pageNumber} 
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
            fixed 
        />
            </Page>
);

const BillDocument: React.FC<BillDocumentProps> = ({ bill, company, logoUrl }) => (
    <Document>
        <BillPage bill={bill} company={company} logoUrl={logoUrl} />
    </Document>
);

export default BillDocument;


