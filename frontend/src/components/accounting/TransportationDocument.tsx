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
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280',
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 5,
    },
    tableCol: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        padding: 5,
    },
    tableCellHeader: {
        margin: 2,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#4B5563',
    },
    tableCell: {
        margin: 2,
        fontSize: 8,
        color: '#111827',
    },
    footerRow: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'solid',
    },
    footerCellLabel: {
        padding: 5,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        textAlign: 'right',
        flex: 1,
    },
    footerCellValue: {
        padding: 5,
        width: '10%', // matches amount column
    },
    footerText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    }
});

interface TransportationDocumentProps {
    challans: any[];
    company: any;
    logoUrl?: string | null;
    monthName: string;
    year: string;
}

const TransportationDocument: React.FC<TransportationDocumentProps> = ({ challans, company, logoUrl, monthName, year }) => {

    const getCompanyAddress = () => {
        if (!company) return '';
        const parts = [
            company.address1,
            company.address2,
            company.city,
            company.state,
            company.pin ? `- ${company.pin}` : ''
        ].filter(Boolean);
        return parts.join(', ');
    };

    const getCustomerAddress = (customer: any) => {
        if (!customer) return '';
        const parts = [
            customer.officeAddress,
            customer.officeCity,
            customer.officeState,
            customer.officePin ? `- ${customer.officePin}` : ''
        ].filter(Boolean);
        return parts.join(', ');
    };

    const getPartyDetails = (customer: any) => {
        if (!customer) return '';
        let details = customer.name;
        if (customer.relationType && customer.relationName) {
            details += ` ${customer.relationType} ${customer.relationName}`;
        }
        return details;
    };

    const formatLocation = (challan: any, isFrom: boolean) => {
        const companyAddr = getCompanyAddress();
        const customerAddr = getCustomerAddress(challan.customer);

        if (challan.type === 'ISSUE') {
            return isFrom ? companyAddr : customerAddr;
        } else {
            return isFrom ? customerAddr : companyAddr;
        }
    };

    const totalTransportation = challans.reduce((sum, c) => sum + (c.transportationCost || 0), 0);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {company?.name && <Text style={styles.companyName}>{company.name}</Text>}
                        <Text style={styles.companyAddress}>{getCompanyAddress()}</Text>
                        {company?.email && <Text style={styles.companyAddress}>Email: {company.email}</Text>}
                        {company?.phone && <Text style={styles.companyAddress}>Phone: {company.phone}</Text>}
                        {company?.gstin && <Text style={styles.companyAddress}>GSTIN: {company.gstin}</Text>}
                    </View>
                    <View style={styles.headerRight}>
                        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                        <Text style={styles.title}>TRANSPORTATION REPORT</Text>
                        <Text style={styles.subtitle}>{monthName} {year}</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColHeader, { width: '4%' }]}><Text style={styles.tableCellHeader}>Sr</Text></View>
                        <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={styles.tableCellHeader}>Challan</Text></View>
                        <View style={[styles.tableColHeader, { width: '6%' }]}><Text style={styles.tableCellHeader}>Date</Text></View>
                        <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={styles.tableCellHeader}>Vehicle No</Text></View>
                        <View style={[styles.tableColHeader, { width: '22%' }]}><Text style={styles.tableCellHeader}>Party Details</Text></View>
                        <View style={[styles.tableColHeader, { width: '22%' }]}><Text style={styles.tableCellHeader}>From</Text></View>
                        <View style={[styles.tableColHeader, { width: '22%' }]}><Text style={styles.tableCellHeader}>To</Text></View>
                        <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Amount</Text></View>
                    </View>

                    {challans.map((challan, index) => (
                        <View style={styles.tableRow} key={index} wrap={false}>
                            <View style={[styles.tableCol, { width: '4%' }]}><Text style={styles.tableCell}>{index + 1}</Text></View>
                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{challan.challanNumber.replace('CHN-', '').replace('RTN-', '')}</Text></View>
                            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCell}>{format(new Date(challan.date), 'dd-MMM')}</Text></View>
                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{challan.vehicleNumber || '-'}</Text></View>
                            <View style={[styles.tableCol, { width: '22%' }]}><Text style={styles.tableCell}>{getPartyDetails(challan.customer)}</Text></View>
                            <View style={[styles.tableCol, { width: '22%' }]}><Text style={styles.tableCell}>{formatLocation(challan, true)}</Text></View>
                            <View style={[styles.tableCol, { width: '22%' }]}><Text style={styles.tableCell}>{formatLocation(challan, false)}</Text></View>
                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={[styles.tableCell, { textAlign: 'right' }]}>{challan.transportationCost?.toFixed(2) || '0.00'}</Text></View>
                        </View>
                    ))}

                    {/* Footer Row for Total */}
                    <View style={styles.footerRow} wrap={false}>
                        <View style={styles.footerCellLabel}>
                            <Text style={styles.footerText}>TOTAL TRANSPORTATION COST</Text>
                        </View>
                        <View style={[styles.footerCellValue, { width: '10%' }]}>
                            <Text style={[styles.footerText, { textAlign: 'right' }]}>{totalTransportation.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default TransportationDocument;
