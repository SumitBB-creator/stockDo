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
        color: '#000000',
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
        flex: 2,
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    companyName: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        color: '#111827',
    },
    companyAddress: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#1F2937',
    },
    logo: {
        width: 120,
        height: 60,
        objectFit: 'contain',
        marginBottom: 5,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#E5E7EB',
        letterSpacing: 1,
        textAlign: 'right',
        marginTop: 5,
    },
    boldText: {
        fontFamily: 'Helvetica-Bold',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metaText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
    },
    contentSection: {
        marginTop: 5,
        marginBottom: 10,
        lineHeight: 1.2,
    },
    bodyRow: {
        flexDirection: 'row',
        marginBottom: 0,
        alignItems: 'flex-start'
    },
    bodyLabel: {
        width: 150,
        fontFamily: 'Helvetica-Bold',
    },
    bodyValue: {
        flex: 1,
    },
    amountBox: {
        marginTop: 20,
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        width: '50%',
        borderRadius: 4,
    },
    amountLabel: {
        fontSize: 9,
        color: '#4B5563',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
    },
    footer: {
        marginTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    signatureBlock: {
        flex: 1,
        alignItems: 'flex-start',
    },
    signatureBlockRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    signatureText: {
        fontSize: 10,
        marginTop: 40,
    },
    companyNameFooter: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 40,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginTop: 10,
        marginBottom: 20,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9CA3AF',
    },
});

interface ReceiptDocumentProps {
    receipt: any;
    company: any;
    logoUrl: string | null;
}

const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({ receipt, company, logoUrl }) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd-MMM-yyyy');
    };

    const companyName = company?.companyName || 'SEJWAL SHUTTERING STORE';

    // Parse Description Details
    const descParts = receipt?.description?.split(' - ') || [];
    const mainDesc = descParts[0] || '';
    const notesStr = descParts[1] || '';

    // Attempt to extract payment method and reference
    let paymentMode = "Cash";
    let receiptType = "RECEIPT";

    if (mainDesc.includes('Advance')) receiptType = "ADVANCE RECEIPT";
    else if (mainDesc.includes('Bill')) receiptType = "BILL RECEIPT";

    if (mainDesc.includes('via ')) {
        const pParts = mainDesc.split('via ');
        paymentMode = pParts[1]?.trim() || "Cash";
    }

    // Number to Words Converter
    const numberToWords = (num: number): string => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const strNum = Math.floor(num).toString();
        if (strNum.length > 9) return 'overflow';
        let n = ('000000000' + strNum).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
        str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
        str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
        str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
        str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Only ' : '';
        return str.trim() || 'Zero Only';
    };

    const customerName = receipt?.customer?.name || receipt?.ledgerAccountId || '';
    const customerCO = receipt?.customer?.relationName ? ` C/O-${receipt?.customer?.relationName}` : '';
    const customerFullName = `${customerName}${customerCO}`;

    // Compile Address Completely
    const getFullAddress = (c: any) => {
        if (!c) return 'Delhi';
        const addr = c.siteAddress || c.officeAddress || c.residenceAddress || '';
        const city = c.siteCity || c.officeCity || '';
        const state = c.siteState || c.officeState || '';
        const pin = c.sitePin || c.officePin || '';

        let full = addr;
        if (city) full += `, ${city}`;
        if (state) full += `, ${state}`;
        if (pin) full += ` - ${pin}`;
        return full || 'Delhi';
    };

    const finalAddress = getFullAddress(receipt?.customer);
    const phone = receipt?.customer?.sitePhone || receipt?.customer?.officePhone || receipt?.customer?.phone || '';
    const showPhone = phone && phone.trim() !== '' && phone !== '+91 -';

    const amtInWords = numberToWords(receipt?.amount || 0);
    const renderedReceiptNo = receipt?.transactionNumber || `R-${receipt?.id?.toString().slice(-4).padStart(4, '0')}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* New Header Header Format */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{companyName}</Text>
                        <Text style={styles.companyAddress}>{company?.address1} {company?.address2}</Text>
                        <Text style={styles.companyAddress}>{company?.city ? `${company.city}, ` : ''}{company?.state} {company?.pin ? `- ${company.pin}` : ''}</Text>
                        {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                        {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                        {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                        {company?.pan && <Text style={styles.companyAddress}>PAN No : {company.pan}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl && (
                            <Image
                                style={styles.logo}
                                src={logoUrl}
                            />
                        )}
                        <Text style={styles.title}>{receiptType}</Text>
                    </View>
                </View>

                {/* Receipt Meta */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Receipt No: <Text style={styles.boldText}>{renderedReceiptNo}</Text></Text>
                    <Text style={styles.metaText}>Date: <Text style={styles.boldText}>{formatDate(receipt?.date)}</Text></Text>
                </View>

                {/* Main Content */}
                <View style={styles.contentSection}>
                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Received with thanks from:</Text>
                        <Text style={[styles.bodyValue, styles.boldText]}>{customerFullName}</Text>
                    </View>

                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Address:</Text>
                        <Text style={styles.bodyValue}>{finalAddress.toUpperCase()}</Text>
                    </View>

                    {showPhone && (
                        <View style={styles.bodyRow}>
                            <Text style={styles.bodyLabel}>Customer Phone:</Text>
                            <Text style={styles.bodyValue}>{phone}</Text>
                        </View>
                    )}

                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Payment Mode:</Text>
                        <Text style={styles.bodyValue}>{paymentMode}</Text>
                    </View>

                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>On Account Of:</Text>
                        <Text style={styles.bodyValue}>{notesStr || 'Shuttering Material on Hire Basis'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={{ marginTop: 10 }}>the sum of Rupees <Text style={styles.boldText}>{amtInWords}</Text></Text>

                    <View style={styles.amountBox}>
                        <Text style={styles.amountLabel}>TOTAL AMOUNT</Text>
                        <Text style={styles.amountValue}>Rs. {receipt?.amount?.toFixed(2) || '0.00'}/=</Text>
                    </View>
                </View>

                {/* Footer Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.companyNameFooter}>For: {receipt?.customer?.name || 'Customer'}</Text>
                        <Text style={styles.signatureText}>Sign. Customer/Payer</Text>
                    </View>
                    <View style={styles.signatureBlockRight}>
                        <Text style={styles.companyNameFooter}>For: {companyName}</Text>
                        <Text style={styles.signatureText}>Authorized Signatory</Text>
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

export default ReceiptDocument;
