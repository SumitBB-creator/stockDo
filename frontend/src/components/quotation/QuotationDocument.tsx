import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register a font (optional, using default Helvetica for now which supports basic needs)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
        paddingBottom: 30,
        paddingLeft: 40,
        paddingRight: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333333',
    },
    header: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#111827', // gray-900
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
        lineHeight: 1.5,
        color: '#4B5563', // gray-600
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
        color: '#E5E7EB', // gray-200
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
        width: '40%',
        alignItems: 'flex-end',
    },
    sectionTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#6B7280', // gray-500
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
        lineHeight: 1.0,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 2,
        width: '100%',
    },
    metaLabel: {
        color: '#6B7280',
        fontFamily: 'Helvetica-Bold',
        width: 70,
        textAlign: 'right',
        marginRight: 10,
    },
    metaValue: {
        fontFamily: 'Helvetica',
        color: '#111827',
        width: 80,
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
        backgroundColor: '#F9FAFB', // gray-50
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
    colSr: { width: '5%', paddingLeft: 5 },
    colDesc: { width: '40%', paddingLeft: 5 },
    colRate: { width: '15%', paddingRight: 5, textAlign: 'right' },
    colUnit: { width: '10%', paddingRight: 5, textAlign: 'right' },
    colRecD: { width: '15%', paddingRight: 5, textAlign: 'right' },
    colRecS: { width: '15%', paddingRight: 5, textAlign: 'right' },

    headerText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        textTransform: 'uppercase',
    },
    cellText: {
        fontSize: 9,
        color: '#4B5563',
        lineHeight: 1.0,
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
        width: '60%',
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

interface QuotationDocumentProps {
    quotation: any;
    company: any;
    logoUrl: string | null;
}

const QuotationDocument: React.FC<QuotationDocumentProps> = ({ quotation, company, logoUrl }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.companyName}>{company?.companyName || 'Company Name'}</Text>
                    <Text style={styles.companyAddress}>{company?.address1}{company?.address2 ? ` ${company.address2}` : ''}</Text>
                    <Text style={styles.companyAddress}>{company?.city ? `${company.city}, ` : ''}{company?.state}{company?.pin ? ` - ${company.pin}` : ''}</Text>
                    {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                    {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                    {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                    {company?.pan && <Text style={styles.companyAddress}>PAN No : {company.pan}</Text>}
                </View>
                <View style={styles.headerRight}>
                    {/* 
                      * Note on Images:
                      * React-pdf supports URL sources. Ensure allowed in config if remote.
                      * We use the full URL passed from parent
                      */}
                    {logoUrl && (
                        <Image
                            style={styles.logo}
                            src={logoUrl}
                        />
                    )}
                    <Text style={styles.title}>Quotation</Text>
                </View>
            </View>

            {/* Customer & Meta Info */}
            <View style={styles.section}>
                <View style={styles.customerSection}>
                    <Text style={styles.sectionTitle}>Quotation For</Text>
                    <Text style={styles.customerName}>{quotation.customer?.name}</Text>
                    {(() => {
                        const customer = quotation.customer;
                        const relation = customer?.relationName ? `${customer.relationType || 'C/O'}-Mr. ${customer.relationName}` : '';

                        let customerAddress = customer?.siteAddress || customer?.residenceAddress || customer?.officeAddress || customer?.address || '';
                        const customerCity = customer?.siteCity || customer?.officeCity;
                        const customerState = customer?.officeState || customer?.siteState;
                        const customerPin = customer?.officePin || customer?.sitePin;

                        const addressParts = [relation, customerAddress, customerCity].filter(Boolean);
                        let fullAddress = addressParts.join(', ');
                        if (customerState || customerPin) {
                            const statePin = [customerState, customerPin].filter(Boolean).join(' - ');
                            if (statePin) fullAddress += ` (${statePin})`;
                        }

                        return <Text style={styles.text}>{fullAddress}</Text>;
                    })()}
                    {quotation.customer?.gstIn && <Text style={styles.text}>GSTIN: {quotation.customer.gstIn}</Text>}
                </View>
                <View style={styles.metaSection}>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Quotation #:</Text>
                        <Text style={styles.metaValue}>{quotation.quotationId}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Date:</Text>
                        <Text style={styles.metaValue}>{format(new Date(quotation.date), 'dd MMM yyyy')}</Text>
                    </View>
                </View>
            </View>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colSr, styles.headerText]}>Sr.</Text>
                    <Text style={[styles.colDesc, styles.headerText]}>Material Description</Text>
                    <Text style={[styles.colRate, styles.headerText]}>Hire Rate</Text>
                    <Text style={[styles.colUnit, styles.headerText]}>Unit</Text>
                    <Text style={[styles.colRecD, styles.headerText]}>Rec (D)</Text>
                    <Text style={[styles.colRecS, styles.headerText]}>Rec (S)</Text>
                </View>
                {quotation.items?.map((item: any, index: number) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.colSr, styles.cellText]}>{index + 1}</Text>
                        <Text style={[styles.colDesc, styles.cellText]}>{item.material?.name}</Text>
                        <Text style={[styles.colRate, styles.cellText]}>{item.hireRate?.toFixed(2)}</Text>
                        <Text style={[styles.colUnit, styles.cellText]}>{item.rateAppliedAs}</Text>
                        <Text style={[styles.colRecD, styles.cellText]}>{item.damageRecoveryRate?.toFixed(2)}</Text>
                        <Text style={[styles.colRecS, styles.cellText]}>{item.shortRecoveryRate?.toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Terms removed as requested */}
                <View style={styles.terms}>
                    {/* Empty or minimal terms can go here if needed later */}
                </View>
                <View style={styles.signature}>
                    <Text style={[styles.text, { fontSize: 10, textAlign: 'right' }]}>For {company?.companyName || 'Company'}</Text>
                    <View style={{ width: '100%', alignItems: 'flex-end' }}>
                        <View style={styles.signLine} />
                        <Text style={[styles.text, { fontSize: 8, marginTop: 4 }]}>Authorized Signatory</Text>
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

export default QuotationDocument;
