#!/usr/bin/env node
/**
 * Embeds cli/src/theme-preview-template.html into a TS const for compiled binary support.
 * Run after editing the HTML template: node scripts/embed-preview-template.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'cli/src/theme-preview-template.html'), 'utf8');
const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
const ts = `// Auto-generated — do not edit. Run: node scripts/embed-preview-template.js\nexport const PREVIEW_TEMPLATE = \`${escaped}\`;\n`;
fs.writeFileSync(path.join(root, 'cli/src/theme-preview-template.ts'), ts);
console.log(`✅ Embedded ${html.length} chars → cli/src/theme-preview-template.ts`);
