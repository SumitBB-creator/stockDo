const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

let filesUpdated = 0;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix the broken import syntax
    content = content.replace(/import\s*\{\r?\nimport\s*\{\s*DatePicker\s*\}\s*from\s*'@\/components\/ui\/date-picker';/g, 
        "import { DatePicker } from '@/components/ui/date-picker';\nimport {");

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesUpdated++;
        console.log(`Fixed: ${filePath}`);
    }
}

walkDir(targetDir);
console.log(`\nFinished! Fixed ${filesUpdated} files.`);
