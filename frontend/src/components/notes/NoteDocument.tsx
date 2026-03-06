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
        color: '#1F2937', // gray-800
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
        color: '#E5E7EB', // matching light gray in image
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
    }
});

interface NoteDocumentProps {
    note: any;
    company: any;
    logoUrl: string | null;
}

const NoteDocument: React.FC<NoteDocumentProps> = ({ note, company, logoUrl }) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd-MMM-yyyy');
    };

    const companyName = company?.companyName || 'SEJWAL SHUTTERING STORE';

    // Parse Description Details
    const reasonText = note?.description?.split('Note: ')[1] || note?.description?.split('Reason: ')[1] || note?.description || '';

    const isCredit = note?.type === 'CREDIT_NOTE';
    const noteTypeStr = isCredit ? 'CREDIT NOTE' : 'DEBIT NOTE';

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

    const customerName = note?.customer?.name || note?.ledgerAccountId || '';
    const customerCO = note?.customer?.relationName ? ` C/O-${note?.customer?.relationName}` : '';
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

    const finalAddress = getFullAddress(note?.customer);
    const phone = note?.customer?.sitePhone || note?.customer?.officePhone || note?.customer?.phone || '';
    const showPhone = phone && phone.trim() !== '' && phone !== '+91 -';

    const amtInWords = numberToWords(note?.amount || 0);
    const renderedNoteNo = note?.transactionNumber || `${isCredit ? 'CN' : 'DN'}-${note?.id?.toString().slice(-4).padStart(4, '0')}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* New Header Header Format */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{companyName}</Text>
                        <Text style={styles.companyAddress}>{company?.address || 'Khasra No-390, Opp. Metro Pillar No. 129, Ghitorni, New Delhi-110030'}</Text>
                        <Text style={styles.companyAddress}>Phone: {company?.contactNumber || '+91-9811056075, +91-9818111115'}</Text>
                        {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                        {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                        {company?.pan && <Text style={styles.companyAddress}>PAN No : {company.pan}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl ? (
                            <Image src={logoUrl} style={styles.logo} />
                        ) : null}
                        <Text style={styles.title}>{noteTypeStr}</Text>
                    </View>
                </View>

                {/* Sub-Header / Meta Row */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Note No: <Text style={styles.boldText}>{renderedNoteNo}</Text></Text>
                    <Text style={styles.metaText}>Date: <Text style={styles.boldText}>{formatDate(note?.date)}</Text></Text>
                </View>

                <View style={styles.divider} />

                {/* Body Content Box */}
                <View style={styles.contentSection}>
                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Account Party Name</Text>
                        <View style={styles.bodyValue}>
                            <Text style={styles.boldText}>M/s. {customerFullName.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Address</Text>
                        <View style={styles.bodyValue}>
                            <Text>{finalAddress.toUpperCase()}</Text>
                        </View>
                    </View>

                    {showPhone && (
                        <View style={styles.bodyRow}>
                            <Text style={styles.bodyLabel}>Contact Number</Text>
                            <View style={styles.bodyValue}>
                                <Text>{phone}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Reason / Particulars</Text>
                        <View style={styles.bodyValue}>
                            <Text>{reasonText}</Text>
                        </View>
                    </View>

                    <View style={styles.bodyRow}>
                        <Text style={styles.bodyLabel}>Amount In Words</Text>
                        <View style={styles.bodyValue}>
                            <Text>{amtInWords} Rupees Only</Text>
                        </View>
                    </View>
                </View>

                {/* Highlighted Amount Box */}
                <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Total Adjustment Amount</Text>
                    <Text style={styles.amountValue}>Rs. {note?.amount?.toFixed(2) || '0.00'}/-</Text>
                </View>

                {/* Footer and Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureText}>Accountant / Authorized Signatory</Text>
                    </View>
                    <View style={styles.signatureBlockRight}>
                        <Text style={styles.companyNameFooter}>For {companyName}</Text>
                        <Text style={styles.signatureText}>Partner / Proprietor</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default NoteDocument;
