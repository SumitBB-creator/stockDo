import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { toWords } from '@/lib/utils';

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
        borderBottomColor: '#E5E7EB',
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
        fontSize: 22,
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
        width: '45%',
    },
    metaSection: {
        width: '50%',
        alignItems: 'flex-end',
    },
    underlinedTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'underline',
        marginBottom: 6,
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    customerName: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
        color: '#111827',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    detailLabel: {
        width: 80,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 9,
        color: '#111827',
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        width: '100%',
    },
    metaLabel: {
        color: '#6B7280',
        fontFamily: 'Helvetica-Bold',
        width: 100,
        textAlign: 'right',
        marginRight: 10,
    },
    metaValue: {
        fontFamily: 'Helvetica',
        color: '#111827',
        width: 120,
        textAlign: 'right',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 20,
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
    colSr: { width: '8%', paddingLeft: 5 },
    colDesc: { width: '62%', paddingLeft: 5 },
    colQty: { width: '15%', paddingRight: 5, textAlign: 'right' },
    colUnit: { width: '15%', paddingRight: 5, textAlign: 'center' },
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
    summarySection: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalInWords: {
        fontSize: 9,
        marginBottom: 10,
        fontStyle: 'italic',
        color: '#4B5563',
    },
    transportationGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    footerGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
    },
    signatureBox: {
        width: '30%',
        alignItems: 'center',
    },
    signLine: {
        borderTopWidth: 1,
        borderTopColor: '#333',
        width: '100%',
        marginTop: 40,
        marginBottom: 5,
    },
    signLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 9,
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9CA3AF',
    },
});

interface TransferDocumentProps {
    transfer: any;
    company: any;
    logoUrl: string | null;
}

const TransferDocument: React.FC<TransferDocumentProps> = ({ transfer, company, logoUrl }) => {
    const totalQty = transfer.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;

    const formatAddress = (c: any) => {
        if (!c) return '';
        const addr = c.siteAddress || c.officeAddress || c.address || '';
        const city = c.siteCity || c.officeCity || '';
        const pin = c.sitePin || c.officePin || '';
        const state = c.siteState || c.officeState || '';
        
        const parts = [addr, city].filter(Boolean);
        let full = parts.join(', ');
        if (state || pin) {
            const statePin = [state, pin].filter(Boolean).join(' - ');
            if (statePin) full += ` (${statePin})`;
        }
        return full;
    };

    const formatCustomerName = (c: any) => {
        if (!c) return '';
        const ms = "M/S ";
        const relation = c.relationName ? ` ${c.relationType || 'Dir. Of-MR.'} ${c.relationName}` : '';
        return `${ms}${c.name}${relation}`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{company?.companyName || 'SEJWAL SHUTTERING STORE'}</Text>
                        <Text style={styles.companyAddress}>{company?.address1} {company?.address2}</Text>
                        <Text style={styles.companyAddress}>
                            {company?.city ? `${company.city}, ` : ''}{company?.state} {company?.pin ? `- ${company.pin}` : ''}
                        </Text>
                        {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                        {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                        {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                        {company?.pan && <Text style={styles.companyAddress}>PAN No : {company.pan}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl && <Image style={styles.logo} src={logoUrl} />}
                        <Text style={styles.title}>Material Transfer</Text>
                    </View>
                </View>

                {/* Meta Information */}
                <View style={styles.section}>
                    <View style={styles.customerSection}>
                        <Text style={styles.underlinedTitle}>Sender (From) :</Text>
                        <Text style={[styles.customerName, { textTransform: 'uppercase' }]}>{formatCustomerName(transfer.fromCustomer)}</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Address:</Text>
                            <Text style={styles.detailValue}>{formatAddress(transfer.fromCustomer)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone:</Text>
                            <Text style={styles.detailValue}>{transfer.fromCustomer?.sitePhone || transfer.fromCustomer?.officePhone || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Transfer ID:</Text>
                            <Text style={styles.metaValue}>{transfer.transferNumber}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Date:</Text>
                            <Text style={styles.metaValue}>{format(new Date(transfer.date), 'dd MMM yyyy')}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Vehicle No:</Text>
                            <Text style={styles.metaValue}>{transfer.vehicleNumber || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.customerSection}>
                        <Text style={styles.underlinedTitle}>Receiver (To) :</Text>
                        <Text style={[styles.customerName, { textTransform: 'uppercase' }]}>{formatCustomerName(transfer.toCustomer)}</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Address:</Text>
                            <Text style={styles.detailValue}>{formatAddress(transfer.toCustomer)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Agreement:</Text>
                            <Text style={styles.detailValue}>{transfer.agreement?.agreementId || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colSr, styles.headerText]}>Sr.</Text>
                        <Text style={[styles.colDesc, styles.headerText]}>Material Description</Text>
                        <Text style={[styles.colQty, styles.headerText]}>Quantity</Text>
                        <Text style={[styles.colUnit, styles.headerText]}>Unit</Text>
                    </View>
                    {transfer.items?.map((item: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.colSr, styles.cellText]}>{index + 1}</Text>
                            <Text style={[styles.colDesc, styles.cellText]}>{item.material?.name}</Text>
                            <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
                            <Text style={[styles.colUnit, styles.cellText]}>{item.material?.unit || 'Nos'}</Text>
                        </View>
                    ))}
                    {/* Total Row */}
                    <View style={[styles.tableRow, { borderBottomWidth: 0, backgroundColor: '#F9FAFB' }]}>
                        <Text style={[styles.colSr, styles.cellText]}></Text>
                        <Text style={[styles.colDesc, styles.cellText, { fontFamily: 'Helvetica-Bold' }]}>Total Quantity</Text>
                        <Text style={[styles.colQty, styles.cellText, { fontFamily: 'Helvetica-Bold' }]}>{totalQty}</Text>
                        <Text style={[styles.colUnit, styles.cellText]}></Text>
                    </View>
                </View>

                <Text style={styles.totalInWords}>Total in Words: {toWords(totalQty)}</Text>

                {/* Transportation Grid */}
                <View style={styles.transportationGrid}>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', padding: 8 }}>
                        <Text style={styles.underlinedTitle}>Sender Transportation</Text>
                        <Text style={styles.detailValue}>Amount: Rs. {transfer.senderTransportation?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', padding: 8 }}>
                        <Text style={styles.underlinedTitle}>Receiver Transportation</Text>
                        <Text style={styles.detailValue}>Amount: Rs. {transfer.receiverTransportation?.toFixed(2) || '0.00'}</Text>
                    </View>
                </View>

                {/* Remarks */}
                {transfer.remarks && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.underlinedTitle}>Remarks :</Text>
                        <Text style={styles.detailValue}>{transfer.remarks}</Text>
                    </View>
                )}

                {/* Footer / Signatures */}
                <View style={styles.footerGrid}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signLine} />
                        <Text style={styles.signLabel}>Sender Site Sign</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signLine} />
                        <Text style={styles.signLabel}>Receiver Site Sign</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signLine} />
                        <Text style={styles.signLabel}>Authorized Signatory</Text>
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

export default TransferDocument;
