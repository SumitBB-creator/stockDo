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
        marginBottom: 2,
        width: '100%',
    },
    metaLabel: {
        color: '#6B7280',
        fontFamily: 'Helvetica-Bold',
        width: 90,
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
        marginBottom: 20,
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
    // Column widths for ISSUE type
    colSr: { width: '7%', paddingLeft: 5 },
    colDesc: { width: '43%', paddingLeft: 5 },
    colHsn: { width: '15%', paddingRight: 5, textAlign: 'center' },
    colQty: { width: '15%', paddingRight: 5, textAlign: 'right' },
    colUnit: { width: '10%', paddingRight: 5, textAlign: 'center' },
    colRate: { width: '10%', paddingRight: 5, textAlign: 'right' },
    // Extra columns for RETURN type
    colRetQty: { width: '12%', paddingRight: 5, textAlign: 'right' },
    colDmgQty: { width: '12%', paddingRight: 5, textAlign: 'right' },
    colShortQty: { width: '12%', paddingRight: 5, textAlign: 'right' },
    colDescReturn: { width: '30%', paddingLeft: 5 },

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
    detailsGrid: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 20,
    },
    detailsCol: {
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    detailLabel: {
        width: 100,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 9,
        color: '#111827',
        flex: 1,
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: '#111827',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    receiverBox: {
        width: '45%',
    },
    signature: {
        width: '35%',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 80,
    },
    signLine: {
        borderTopWidth: 1,
        borderTopColor: '#9CA3AF',
        width: '100%',
        marginTop: 40,
    },
    notesSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    notesTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
        color: '#111827',
    },
    noteItem: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 10,
    },
    noteNumber: {
        width: 20,
        fontSize: 9,
        color: '#4B5563',
    },
    noteText: {
        flex: 1,
        fontSize: 9,
        color: '#4B5563',
        lineHeight: 1.4,
    },
});

interface ChallanDocumentProps {
    challan: any;
    company: any;
    logoUrl: string | null;
}

const ChallanDocument: React.FC<ChallanDocumentProps> = ({ challan, company, logoUrl }) => {
    const isReturn = challan.type === 'RETURN';
    const titleText = isReturn ? 'Return Challan' : 'Delivery Challan';

    return (
        <Document>
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
                        <Text style={styles.title}>{titleText}</Text>
                    </View>
                </View>

                {/* Customer & Meta Info */}
                <View style={styles.section}>
                    <View style={styles.customerSection}>
                        <Text style={styles.sectionTitle}>{isReturn ? 'Received From' : 'Delivered To'}</Text>
                        <Text style={styles.customerName}>{challan.customer?.name}</Text>
                        {(() => {
                            const customer = challan.customer;
                            if (!customer) return null;
                            const relation = customer.relationName ? `${customer.relationType || 'C/O'}-Mr. ${customer.relationName}` : '';
                            const address = customer.siteAddress || customer.residenceAddress || customer.officeAddress || customer.address || '';
                            const city = customer.siteCity || customer.residenceCity || customer.officeCity || customer.city || '';
                            const state = customer.siteState || customer.residenceState || customer.officeState || customer.state || '';
                            const pin = customer.sitePin || customer.residencePin || customer.officePin || customer.pin || '';

                            const mainParts = [address, city].filter(Boolean);
                            let formattedAddress = mainParts.join(', ');
                            if (state || pin) {
                                const statePin = [state, pin].filter(Boolean).join(' - ');
                                if (statePin) formattedAddress += ` (${statePin})`;
                            }

                            return (
                                <>
                                    {relation && <Text style={styles.text}>{relation}</Text>}
                                    <Text style={styles.text}>{formattedAddress}</Text>
                                    {customer.officeGst && <Text style={styles.text}>GSTIN: {customer.officeGst}</Text>}
                                </>
                            );
                        })()}
                    </View>
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Challan #:</Text>
                            <Text style={styles.metaValue}>{challan.challanNumber}</Text>
                        </View>
                        {challan.manualChallanNumber && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Manual #:</Text>
                                <Text style={styles.metaValue}>{challan.manualChallanNumber}</Text>
                            </View>
                        )}
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Date:</Text>
                            <Text style={styles.metaValue}>{format(new Date(challan.date), 'dd MMM yyyy')}</Text>
                        </View>
                        {challan.vehicleNumber && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Vehicle No:</Text>
                                <Text style={styles.metaValue}>{challan.vehicleNumber}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Additional Details Grid */}
                {(challan.driverName || challan.transporterName || challan.biltyNumber || challan.licenseNumber) && (
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailsCol}>

                            {challan.licenseNumber && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>License No:</Text>
                                    <Text style={styles.detailValue}>{challan.licenseNumber}</Text>
                                </View>
                            )}
                            {challan.driverMobile && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Driver Mobile:</Text>
                                    <Text style={styles.detailValue}>{challan.driverMobile}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.detailsCol}>

                            {challan.biltyNumber && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Bilty No:</Text>
                                    <Text style={styles.detailValue}>{challan.biltyNumber}</Text>
                                </View>
                            )}
                            {challan.timeOut && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Time Out:</Text>
                                    <Text style={styles.detailValue}>{challan.timeOut}</Text>
                                </View>
                            )}
                            {challan.timeIn && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Time In:</Text>
                                    <Text style={styles.detailValue}>{challan.timeIn}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colSr, styles.headerText]}>Sr.</Text>
                        <Text style={[isReturn ? styles.colDescReturn : styles.colDesc, styles.headerText]}>Material Description</Text>
                        {isReturn ? (
                            <>
                                <Text style={[styles.colRetQty, styles.headerText]}>Ret. Qty</Text>
                                <Text style={[styles.colDmgQty, styles.headerText]}>Dmg. Qty</Text>
                                <Text style={[styles.colShortQty, styles.headerText]}>Short Qty</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.colHsn, styles.headerText]}>HSN/SAC</Text>
                                <Text style={[styles.colQty, styles.headerText]}>Quantity</Text>
                            </>
                        )}
                        <Text style={[styles.colUnit, styles.headerText]}>Unit</Text>
                    </View>
                    {challan.items?.map((item: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.colSr, styles.cellText]}>{index + 1}</Text>
                            <Text style={[isReturn ? styles.colDescReturn : styles.colDesc, styles.cellText]}>{item.material?.name}</Text>
                            {isReturn ? (
                                <>
                                    <Text style={[styles.colRetQty, styles.cellText]}>{item.quantity}</Text>
                                    <Text style={[styles.colDmgQty, styles.cellText]}>{item.damageQuantity || 0}</Text>
                                    <Text style={[styles.colShortQty, styles.cellText]}>{item.shortQuantity || 0}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.colHsn, styles.cellText]}>9954</Text>
                                    <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
                                </>
                            )}
                            <Text style={[styles.colUnit, styles.cellText]}>{item.material?.unit || 'Nos'}</Text>
                        </View>
                    ))}
                </View>

                {/* Notes Section */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Notes :</Text>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>1.</Text>
                        <Text style={styles.noteText}>Responsibility of goods once removed from our godown shall rest with customer.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>2.</Text>
                        <Text style={styles.noteText}>Customer will be responsible for transportation of goods both ways.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>3.</Text>
                        <Text style={styles.noteText}>Customer will be Responsible for all cuts/breakage/damage/shortage of goods at the cost at that time.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>4.</Text>
                        <Text style={styles.noteText}>Work timing is 09:00 AM to 05:00 PM, TUESDAY Closed.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>5.</Text>
                        <Text style={styles.noteText}>Minimum rent will be charged for one month.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>6.</Text>
                        <Text style={styles.noteText}>In case of shortage cost will be charged as per Shuttering Materials Items Commitment under Agreement.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>7.</Text>
                        <Text style={styles.noteText}>All disputes are subject to Delhi Jurisdiction only.</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.noteNumber}>8.</Text>
                        <Text style={styles.noteText}>At any point of time Choudhary Timber is entitled to remove their goods from the site.</Text>
                    </View>
                </View>


                {/* Summary row for values if present */}
                {(challan.greenTax) && (
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailsCol}>

                        </View>
                        <View style={styles.detailsCol}>

                            {challan.greenTax != null && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Green Tax:</Text>
                                    <Text style={styles.detailValue}>₹ {challan.greenTax?.toFixed(2)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.receiverBox}>
                        <Text style={styles.sectionTitle}>Receiver's Acknowledgement</Text>
                        <View style={{ marginTop: 30 }}>
                            <View style={styles.signLine} />
                            <Text style={[styles.text, { fontSize: 8, marginTop: 4 }]}>
                                Name: {challan.receiverName || '_________________'}
                            </Text>
                            <Text style={[styles.text, { fontSize: 8, marginTop: 2 }]}>
                                Mobile: {challan.receiverMobile || '_________________'}
                            </Text>
                        </View>
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
        </Document>
    );
};

export default ChallanDocument;
