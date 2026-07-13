const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/challan/ChallanDocument.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /<View style=\{styles\.metaRow\}>[\s]*<Text style=\{styles\.metaLabel\}>Phone No:<\/Text>[\s]*<Text style=\{styles\.metaValue\}>\{challan\.customer\?\.sitePhone \|\| challan\.customer\?\.officePhone \|\| '\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.'\}<\/Text>[\s]*<\/View>/;

const replacement = `<View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Phone No:</Text>
                            <Text style={styles.metaValue}>{challan.customer?.sitePhone || challan.customer?.officePhone || '........................'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Demanded By Name:</Text>
                            <Text style={styles.metaValue}>{challan.receiverName || '........................'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Demand By Ph:</Text>
                            <Text style={styles.metaValue}>{challan.receiverMobile || '........................'}</Text>
                        </View>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log('Added header metadata successfully!');
} else {
    console.log('Regex failed');
}
