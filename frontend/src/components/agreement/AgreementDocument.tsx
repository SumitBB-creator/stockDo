import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
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
        color: '#000000',
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
        lineHeight: 1.3,
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
    introSection: {
        marginTop: 5,
        marginBottom: 8,
        lineHeight: 1,
        textAlign: 'justify',
    },
    boldText: {
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'underline',
    },
    normalText: {
        fontFamily: 'Helvetica',
    },
    termsList: {
        marginLeft: 10,
        marginTop: 5,
    },
    termItem: {
        flexDirection: 'row',
        marginBottom: 4, // Reduced spacing for more compact look
    },
    termNumber: {
        width: 20,
        fontSize: 10,
    },
    termText: {
        flex: 1,
        fontSize: 10,
        textAlign: 'justify',
        lineHeight: 1.2,
    },
    tableLabel: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 10,
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableCellHeader: {
        padding: 4,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    tableCell: {
        padding: 4,
        fontSize: 9,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    lastCell: {
        borderRightWidth: 0,
    },
    // Column widths
    colSr: { width: '8%' },
    colItem: { width: '32%', textAlign: 'left' },
    colHire: { width: '20%' },
    colRecD: { width: '20%' },
    colRecS: { width: '20%' },

    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    signatureBlock: {
        flex: 1,
        alignItems: 'flex-start', // Default left
    },
    signatureBlockCenter: {
        flex: 1,
        alignItems: 'center',
    },
    signatureBlockRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    signatureText: {
        fontSize: 10,
        marginTop: 40, // Space for signature
    },
    companyNameFooter: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 40,
    }

});

interface AgreementDocumentProps {
    agreement: any;
    company: any;
    logoUrl: string | null;
    template?: any;
}

const AgreementDocument: React.FC<AgreementDocumentProps> = ({ agreement, company, logoUrl, template }) => {
    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '________________';
        return format(new Date(dateString), 'dd-MMM-yyyy');
    };

    const customer = agreement.customer;
    const companyName = company?.companyName || 'SEJWAL SHUTTERING STORE';

    // Construct Party 1 String
    const party1CO = company?.employerName ? ` C/O ${company.employerName}` : '';
    const addressParts = [company?.address1, company?.address2, company?.city].filter(Boolean);
    let party1Address = addressParts.join(', ');
    if (company?.pin) party1Address += ` - ${company.pin}`;
    if (company?.state) party1Address += ` (${company.state})`;
    const party1String = `${companyName}${party1CO} ${party1Address}`;

    // Construct Party 2 String
    const party2CO = customer?.relationName ? ` ${customer.relationType || 'C/O'}-Mr. ${customer.relationName}` : '';
    let customerAddress = customer?.siteAddress || customer?.residenceAddress || customer?.officeAddress || customer?.address || '';
    const customerCity = customer?.siteCity || customer?.officeCity;
    const customerState = customer?.siteState || customer?.officeState;
    const customerPin = customer?.sitePin || customer?.officePin;

    const party2AddressParts = [customerAddress, customerCity].filter(Boolean);
    let party2Address = party2AddressParts.join(', ');
    if (customerState || customerPin) {
        const statePin = [customerState, customerPin].filter(Boolean).join(' - ');
        if (statePin) party2Address += ` (${statePin})`;
    }
    const party2String = `${customer?.name}${party2CO}, ${party2Address}`;

    // Helper to replace placeholders
    const replacePlaceholders = (text: string) => {
        if (!text) return '';
        return text
            .replace(/{date}/g, formatDate(agreement.validFrom))
            .replace(/{party1}/g, party1String)
            .replace(/{party2}/g, party2String)
            .replace(/{siteAddress}/g, agreement.siteAddress || '__________________')
            .replace(/{residenceAddress}/g, agreement.residenceAddress || '__________________')
            .replace(/{authorizedRepresentative}/g, agreement.authorizedRepresentative || '__________________')
            .replace(/{minimumRentPeriod}/g, agreement.minimumRentPeriod?.toString() || '30');
    };

    const renderTextWithBoldPlaceholders = (text: string, style: any = styles.termText) => {
        if (!text) return null;

        const placeholders = [
            '{date}',
            '{party1}',
            '{party2}',
            '{siteAddress}',
            '{residenceAddress}',
            '{authorizedRepresentative}',
            '{minimumRentPeriod}'
        ];

        // Create a regex that captures the placeholders
        const regex = new RegExp(`(${placeholders.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
        const parts = text.split(regex);

        return (
            <Text style={style}>
                {parts.map((part, i) => {
                    if (placeholders.includes(part)) {
                        return <Text key={i} style={styles.boldText}>{replacePlaceholders(part)}</Text>;
                    }
                    return <Text key={i}>{part}</Text>;
                })}
            </Text>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{companyName}</Text>
                        <Text style={styles.companyAddress}>{company?.address1}{company?.address2 ? ` ${company.address2}` : ''}</Text>
                        <Text style={styles.companyAddress}>{company?.city ? `${company.city}, ` : ''}{company?.state}{company?.pin ? ` - ${company.pin}` : ''}</Text>
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
                        <Text style={styles.title}>AGREEMENT</Text>
                    </View>
                </View>

                {/* Intro Paragraph */}
                {renderTextWithBoldPlaceholders(
                    template?.introText || `This agreement come in force from this date {date} between {party1} (Party No-1) and {party2} (Party No-2).`,
                    styles.introSection
                )}

                <Text style={{ marginBottom: 5 }}>The Contents of this agreement are as under :-</Text>

                {/* Terms */}
                <View style={styles.termsList}>
                    {(template?.terms || [
                        "That the 1st party shall supply the shuttering material on hire basis exour godown to Party No. 2 for their site situated at {siteAddress} and residence at {residenceAddress}",
                        "That the 2nd Party undertake to make regular payments of bill amounting for the hired period and items on the charged rates which has been agreed between the both parties within the seven day on receipt of the bill in every month by cheque.",
                        "That the 2nd Part undertake not to transfer the any hired items to any other site without the permission of 1st Party which shall be writting of the 2nd Party.",
                        "That the 2nd Party undertake to return all the hired materials in safe & sound condition. In any damage or lost conditional the 2nd Party shall pay the cost of item which is agreed between the both parties.",
                        "That the 2nd Party has authorized Mr. {authorizedRepresentative} as his/her representative and is also attest his signature. This representative Mr. {authorizedRepresentative} shall sign, receive the challan and bills etc. of the 2nd party on his/her behalf.",
                        "That the both parties undertake to honour this agreement and shall never seek any reason to evade their responsibility.",
                        "That in case of any dispute with regard to the terms and condition shall be (subjected to) settled at component court of law at New Delhi (Delhi).",
                        "That the minimum rent period for the hired material shall be {minimumRentPeriod} Days."
                    ]).map((term: string, index: number) => (
                        <View key={index} style={styles.termItem}>
                            <Text style={styles.termNumber}>{index + 1}.</Text>
                            {renderTextWithBoldPlaceholders(term)}
                        </View>
                    ))}
                </View>

                <Text style={styles.tableLabel}>That the itemwise rates is as under :-</Text>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCellHeader, styles.colSr]}>Sr.No.</Text>
                        <Text style={[styles.tableCellHeader, styles.colItem]}>Item Name</Text>
                        <Text style={[styles.tableCellHeader, styles.colHire]}>Hire Rate</Text>
                        <Text style={[styles.tableCellHeader, styles.colRecD]}>Recovery Rate(Damage Material)</Text>
                        <Text style={[styles.tableCellHeader, styles.colRecS, styles.lastCell]}>Recovery Rate(Short Material)</Text>
                    </View>
                    {agreement.items?.map((item: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.colSr]}>{index + 1}</Text>
                            <Text style={[styles.tableCell, styles.colItem]}>{item.material?.name}</Text>
                            <Text style={[styles.tableCell, styles.colHire]}>{item.hireRate?.toFixed(2)} Rs./{item.rateAppliedAs}</Text>
                            <Text style={[styles.tableCell, styles.colRecD]}>{item.damageRecoveryRate?.toFixed(2)} Rs./Nos</Text>
                            <Text style={[styles.tableCell, styles.colRecS, styles.lastCell]}>{item.shortRecoveryRate?.toFixed(2)} Rs./Nos</Text>
                        </View>
                    ))}
                </View>

                {/* Footer Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.companyNameFooter}>{companyName}</Text>
                        <Text style={styles.signatureText}>Authorized Signatory</Text>
                    </View>
                    <View style={styles.signatureBlockCenter}>
                        <Text style={styles.companyNameFooter}>Yours Faithfully</Text>
                        <Text style={styles.signatureText}>Sign of Authorized Person</Text>
                    </View>
                    <View style={styles.signatureBlockRight}>
                        <Text style={styles.companyNameFooter}>Yours Faithfully</Text>
                        <Text style={styles.signatureText}>Sign. Owner/Hire's</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default AgreementDocument;
