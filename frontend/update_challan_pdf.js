const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/challan/ChallanDocument.tsx');
let content = fs.readFileSync(file, 'utf8');

// First apply the basic layout fixes (border, top info bar) just in case
const topInfoBar = `
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
                </View>`;

if (!content.includes('pageBorder')) {
    content = content.replace(/page:\s*\{([^}]*)\}/, (match, p1) => {
        let inner = p1.replace(/paddingTop:\s*\d+,/, 'padding: 10,');
        inner = inner.replace(/paddingBottom:\s*\d+,/, '');
        inner = inner.replace(/paddingLeft:\s*\d+,/, '');
        inner = inner.replace(/paddingRight:\s*\d+,/, '');
        return `page: {${inner}},\n    pageBorder: {\n        flex: 1,\n        borderWidth: 1,\n        borderColor: '#4B5563',\n        borderRadius: 4,\n        padding: 10,\n    }`;
    });
    content = content.replace(/(<Page[^>]*style=\{styles\.page\}[^>]*>)/, '$1\n                <View style={styles.pageBorder}>');
    content = content.replace(/(<\/Page>)/, '                </View>\n            $1');
    content = content.replace(/(<View style=\{styles\.pageBorder\}>)/, `$1${topInfoBar}`);
    const regex = /(<Text\s+style=\{styles\.pageNumber\}[^<]*\/>)\s*<\/View>/s;
    if (regex.test(content)) {
        content = content.replace(regex, "</View>\n                $1");
    }
}

// Ensure footer has dots (revert "Demanded By")
content = content.replace(/<Text style=\{styles\.boldText\}>Receiver's Sign & Mobile No<\/Text>[\s\S]*?<View style=\{\{ marginTop: 15 \}\}>[\s\S]*?<Text style=\{styles\.boldText\}>[\s\S]*?Receiver Name : \{challan\.receiverName \|\| '\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.'\}[\s\S]*?<\/Text>[\s\S]*?\{challan\.receiverMobile && \([\s\S]*?<Text style=\{\[styles\.boldText, \{ marginTop: 4 \}\]\}>[\s\S]*?Mobile No : \{challan\.receiverMobile\}[\s\S]*?<\/Text>[\s\S]*?\)\}[\s\S]*?<\/View>/,
    `<Text style={styles.boldText}>Receiver's Sign & Mobile No</Text>
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.boldText}>
                                    Receiver Name : ...................................
                                </Text>
                                <Text style={[styles.boldText, { marginTop: 4 }]}>
                                    Mobile No : ...................................
                                </Text>
                            </View>`);
content = content.replace(/<Text style=\{styles\.boldText\}>Demanded By Sign & Mobile No<\/Text>[\s\S]*?<View style=\{\{ marginTop: 15 \}\}>[\s\S]*?<Text style=\{styles\.boldText\}>[\s\S]*?Demanded By Name : \{challan\.receiverName \|\| '\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.'\}[\s\S]*?<\/Text>[\s\S]*?\{challan\.receiverMobile && \([\s\S]*?<Text style=\{\[styles\.boldText, \{ marginTop: 4 \}\]\}>[\s\S]*?Mobile No : \{challan\.receiverMobile\}[\s\S]*?<\/Text>[\s\S]*?\)\}[\s\S]*?<\/View>/,
    `<Text style={styles.boldText}>Receiver's Sign & Mobile No</Text>
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.boldText}>
                                    Receiver Name : ...................................
                                </Text>
                                <Text style={[styles.boldText, { marginTop: 4 }]}>
                                    Mobile No : ...................................
                                </Text>
                            </View>`);


// Add Demanded By Name and Ph to the top metaSection
const oldMeta = `<View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Phone No:</Text>
                            <Text style={styles.metaValue}>{challan.customer?.sitePhone || challan.customer?.officePhone || '........................'}</Text>
                        </View>`;
const newMeta = `<View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Phone No:</Text>
                            <Text style={styles.metaValue}>{challan.customer?.sitePhone || challan.customer?.officePhone || '........................'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Demanded By:</Text>
                            <Text style={styles.metaValue}>{challan.receiverName || '........................'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Demand By Ph:</Text>
                            <Text style={styles.metaValue}>{challan.receiverMobile || '........................'}</Text>
                        </View>`;

if (content.includes(oldMeta)) {
    content = content.replace(oldMeta, newMeta);
    console.log('Added header metadata successfully!');
}

fs.writeFileSync(file, content);
console.log('Done!');
