import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
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
        marginTop: 10,
        marginBottom: 10,
        lineHeight: 1.5,
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
        marginBottom: 8, // Increased spacing for better readability
    },
    termNumber: {
        width: 20,
        fontSize: 10,
    },
    termText: {
        flex: 1,
        fontSize: 10,
        textAlign: 'justify',
        lineHeight: 1.5,
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
}

const AgreementDocument: React.FC<AgreementDocumentProps> = ({ agreement, company, logoUrl }) => {
    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '________________';
        return format(new Date(dateString), 'dd-MMM-yyyy');
    };

    const customer = agreement.customer;
    const companyName = company?.companyName || 'SEJWAL SHUTTERING STORE';

    // Construct Party 1 String
    // "SEJWAL SHUTTERING STORE C/O Deepak Sejwal Kh. No. 398..."
    const party1CO = company?.employerName ? ` C/O ${company.employerName}` : '';
    const party1Address = `${company?.address1 || ''} ${company?.address2 ? `, ${company.address2}` : ''} ${company?.city ? `, ${company.city}` : ''} ${(company?.pin) ? `- ${company.pin}` : ''} ${(company?.state) ? `(${company.state})` : ''}`;
    const party1String = `${companyName}${party1CO} ${party1Address}`;

    // Construct Party 2 String
    // "DEVENDER KUMAR SAINI C/O-Mr. BOBY SAINI, D - 1997 , PALAM VIHAR..."
    const party2CO = customer?.relationName ? ` ${customer.relationType || 'C/O'}-Mr. ${customer.relationName}` : '';
    // Use residence address if available as per template "residence at ...", but for the main definition usually customer address is used. 
    // The template uses specific address, we will use the stored address for the customer (likely 'residenceAddress' or 'officeAddress' or just 'address' depending on schema usage in frontend).
    // In Agreement schema we have `residenceAddress` and `siteAddress`.
    // The template says: "Party No. 2 for their site situated at [Site] and residence at [Residence]" later.
    // Here in the intro, it usually uses the main legal address (Residence).
    const party2Address = `${customer?.residenceAddress || customer?.siteAddress || customer?.officeAddress || ''}`;
    const party2String = `${customer?.name}${party2CO}, ${party2Address}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
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
                        <Text style={styles.title}>AGREEMENT</Text>
                    </View>
                </View>

                {/* Intro Paragraph */}
                <Text style={styles.introSection}>
                    This agreement come in force from this date <Text style={styles.boldText}>{formatDate(agreement.validFrom)}</Text> between <Text style={styles.boldText}>{party1String} (Party No-1)</Text> and <Text style={styles.boldText}>{party2String} (Party No-2)</Text>.
                </Text>

                <Text style={{ marginBottom: 5 }}>The Contents of this agreement are as under :-</Text>

                {/* Terms */}
                <View style={styles.termsList}>
                    {/* 1 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>1.</Text>
                        <Text style={styles.termText}>
                            That the 1st party shall supply the shuttering material on hire basis exour godown to Party No. 2 for their site situated at <Text style={styles.boldText}>{agreement.siteAddress || '__________________'}</Text> and residence at <Text style={styles.boldText}>{agreement.residenceAddress || '__________________'}</Text>
                        </Text>
                    </View>
                    {/* 2 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>2.</Text>
                        <Text style={styles.termText}>
                            That the 2nd Party undertake to make regular payments of bill amounting for the hired period and items on the charged rates which has been agreed between the both parties within the seven day on receipt of the bill in every month by cheque.
                        </Text>
                    </View>
                    {/* 3 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>3.</Text>
                        <Text style={styles.termText}>
                            That the 2nd Part undertake not to transfer the any hired items to any other site without the permission of 1st Party which shall be writting of the 2nd Party.
                        </Text>
                    </View>
                    {/* 4 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>4.</Text>
                        <Text style={styles.termText}>
                            That the 2nd Party undertake to return all the hired materials in safe & sound condition. In any damage or lost conditional the 2nd Party shall pay the cost of item which is agreed between the both parties.
                        </Text>
                    </View>
                    {/* 5 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>5.</Text>
                        <Text style={styles.termText}>
                            That the 2nd Party has authorized Mr. <Text style={styles.boldText}>{agreement.authorizedRepresentative || '__________________'}</Text> as his/her representative and is also attest his signature. This representative Mr. <Text style={styles.boldText}>{agreement.authorizedRepresentative || '__________________'}</Text> shall sign, receive the challan and bills etc. of the 2nd party on his/her behalf.
                        </Text>
                    </View>
                    {/* 6 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>6.</Text>
                        <Text style={styles.termText}>
                            That the both parties undertake to honour this agreement and shall never seek any reason to evade their responsibility.
                        </Text>
                    </View>
                    {/* 7 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>7.</Text>
                        <Text style={styles.termText}>
                            That in case of any dispute with regard to the terms and condition shall be (subjected to) settled at component court of law at New Delhi (Delhi).
                        </Text>
                    </View>
                    {/* 8 */}
                    <View style={styles.termItem}>
                        <Text style={styles.termNumber}>8.</Text>
                        <Text style={styles.termText}>
                            That the minimum rent period for the hired material shall be <Text style={styles.boldText}>{agreement.minimumRentPeriod}</Text> Days.
                        </Text>
                    </View>
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
