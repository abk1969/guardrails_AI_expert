/**
 * Compare AI Risk Repository V3 vs V4 Excel files
 * Outputs structural and content differences
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const V3_PATH = path.join(__dirname, '../data_ai_risk/AI Risk Repository V3_26_03_2025.xlsx');
const V4_PATH = path.join(__dirname, '../data_ai_risk/Copy of The AI Risk Repository V4_03_12_2025.xlsx');

console.log('=== AI Risk Repository V3 vs V4 Comparison ===\n');

// Check files exist
if (!fs.existsSync(V3_PATH)) {
  console.error('V3 file not found:', V3_PATH);
  process.exit(1);
}
if (!fs.existsSync(V4_PATH)) {
  console.error('V4 file not found:', V4_PATH);
  process.exit(1);
}

// File sizes
const v3Size = fs.statSync(V3_PATH).size;
const v4Size = fs.statSync(V4_PATH).size;
console.log(`V3 file size: ${(v3Size / 1024).toFixed(1)} KB`);
console.log(`V4 file size: ${(v4Size / 1024).toFixed(1)} KB`);
console.log(`Size difference: ${((v4Size - v3Size) / 1024).toFixed(1)} KB\n`);

// Open workbooks
const wbV3 = XLSX.readFile(V3_PATH);
const wbV4 = XLSX.readFile(V4_PATH);

// Compare sheet names
console.log('--- Sheet Names ---');
console.log('V3 sheets:', wbV3.SheetNames);
console.log('V4 sheets:', wbV4.SheetNames);

const v3Only = wbV3.SheetNames.filter(s => !wbV4.SheetNames.includes(s));
const v4Only = wbV4.SheetNames.filter(s => !wbV3.SheetNames.includes(s));
const common = wbV3.SheetNames.filter(s => wbV4.SheetNames.includes(s));

if (v3Only.length) console.log('Only in V3:', v3Only);
if (v4Only.length) console.log('Only in V4:', v4Only);
console.log('Common sheets:', common.length);
console.log('');

// Compare each common sheet
console.log('--- Sheet Row Counts ---');
for (const name of [...new Set([...wbV3.SheetNames, ...wbV4.SheetNames])]) {
  const v3Sheet = wbV3.Sheets[name];
  const v4Sheet = wbV4.Sheets[name];

  const v3Data = v3Sheet ? XLSX.utils.sheet_to_json(v3Sheet, { header: 1 }) : null;
  const v4Data = v4Sheet ? XLSX.utils.sheet_to_json(v4Sheet, { header: 1 }) : null;

  const v3Rows = v3Data ? v3Data.length : 'N/A';
  const v4Rows = v4Data ? v4Data.length : 'N/A';

  const diff = (v3Data && v4Data) ? v4Data.length - v3Data.length : 'N/A';
  console.log(`  ${name}: V3=${v3Rows} rows, V4=${v4Rows} rows, diff=${diff}`);
}
console.log('');

// Deep analysis of main database sheet
function findMainSheet(wb) {
  // Look for the main risk database sheet
  for (const name of wb.SheetNames) {
    if (name.toLowerCase().includes('risk database') && !name.toLowerCase().includes('explainer')) {
      return name;
    }
  }
  return null;
}

const v3MainName = findMainSheet(wbV3);
const v4MainName = findMainSheet(wbV4);

console.log('--- Main Database Sheet Analysis ---');
console.log(`V3 main sheet: "${v3MainName}"`);
console.log(`V4 main sheet: "${v4MainName}"`);

if (!v3MainName || !v4MainName) {
  console.error('Could not find main database sheet in one of the files');
  process.exit(1);
}

const v3Main = XLSX.utils.sheet_to_json(wbV3.Sheets[v3MainName], { header: 1 });
const v4Main = XLSX.utils.sheet_to_json(wbV4.Sheets[v4MainName], { header: 1 });

console.log(`V3 total rows (including headers): ${v3Main.length}`);
console.log(`V4 total rows (including headers): ${v4Main.length}`);
console.log('');

// Find header row in each (typically row 1, but let's detect)
function findHeaderRow(data) {
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i];
    if (row && row.some && row.some(cell => {
      const s = String(cell || '').toLowerCase();
      return s === 'title' || s.includes('ev_id') || s.includes('paper_id');
    })) {
      return i;
    }
  }
  return 1; // default
}

const v3HeaderIdx = findHeaderRow(v3Main);
const v4HeaderIdx = findHeaderRow(v4Main);

console.log(`V3 header row index: ${v3HeaderIdx}`);
console.log(`V4 header row index: ${v4HeaderIdx}`);

const v3Headers = v3Main[v3HeaderIdx] || [];
const v4Headers = v4Main[v4HeaderIdx] || [];

console.log(`\nV3 headers (${v3Headers.length} columns):`);
v3Headers.forEach((h, i) => console.log(`  [${i}] ${h}`));

console.log(`\nV4 headers (${v4Headers.length} columns):`);
v4Headers.forEach((h, i) => console.log(`  [${i}] ${h}`));

// Header differences
console.log('\n--- Header Comparison ---');
const maxCols = Math.max(v3Headers.length, v4Headers.length);
let headerChanges = 0;
for (let i = 0; i < maxCols; i++) {
  const v3h = v3Headers[i] || '(missing)';
  const v4h = v4Headers[i] || '(missing)';
  if (v3h !== v4h) {
    console.log(`  Col ${i}: V3="${v3h}" -> V4="${v4h}"`);
    headerChanges++;
  }
}
if (headerChanges === 0) {
  console.log('  Headers are IDENTICAL');
} else {
  console.log(`  ${headerChanges} header differences found`);
}

// Count data rows (non-empty after header)
function countDataRows(data, headerIdx) {
  let count = 0;
  for (let i = headerIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (row && row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
      count++;
    }
  }
  return count;
}

const v3DataCount = countDataRows(v3Main, v3HeaderIdx);
const v4DataCount = countDataRows(v4Main, v4HeaderIdx);

console.log(`\n--- Data Row Counts ---`);
console.log(`V3 data rows: ${v3DataCount}`);
console.log(`V4 data rows: ${v4DataCount}`);
console.log(`Difference: ${v4DataCount - v3DataCount} rows (${v4DataCount > v3DataCount ? 'V4 has MORE' : v4DataCount < v3DataCount ? 'V4 has FEWER' : 'SAME'})`);

// Sample first 3 and last 3 data rows from V4
console.log('\n--- V4 Sample Data (first 3 rows after header) ---');
for (let i = v4HeaderIdx + 1; i <= Math.min(v4HeaderIdx + 3, v4Main.length - 1); i++) {
  const row = v4Main[i];
  if (row) {
    console.log(`  Row ${i}:`, JSON.stringify(row.slice(0, 8))); // first 8 columns
  }
}

console.log('\n--- V4 Sample Data (last 3 rows) ---');
for (let i = Math.max(v4Main.length - 3, v4HeaderIdx + 1); i < v4Main.length; i++) {
  const row = v4Main[i];
  if (row) {
    console.log(`  Row ${i}:`, JSON.stringify(row.slice(0, 8))); // first 8 columns
  }
}

// Check for new column values in V4 (domains, entities, etc.)
console.log('\n--- Taxonomy Comparison ---');

function getUniqueValues(data, headerIdx, colIdx) {
  const values = new Set();
  for (let i = headerIdx + 1; i < data.length; i++) {
    const val = data[i] && data[i][colIdx];
    if (val !== undefined && val !== null && val !== '') {
      values.add(String(val).trim());
    }
  }
  return values;
}

// Find column indices for key taxonomy fields
function findColIdx(headers, searchTerm) {
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i] || '').toLowerCase().includes(searchTerm.toLowerCase())) {
      return i;
    }
  }
  return -1;
}

const taxonomyCols = ['Entity', 'Intent', 'Timing', 'Domain', 'Subdomain'];
for (const colName of taxonomyCols) {
  const v3Idx = findColIdx(v3Headers, colName);
  const v4Idx = findColIdx(v4Headers, colName);

  if (v3Idx >= 0 && v4Idx >= 0) {
    const v3Vals = getUniqueValues(v3Main, v3HeaderIdx, v3Idx);
    const v4Vals = getUniqueValues(v4Main, v4HeaderIdx, v4Idx);

    const newInV4 = [...v4Vals].filter(v => !v3Vals.has(v));
    const removedInV4 = [...v3Vals].filter(v => !v4Vals.has(v));

    console.log(`\n  ${colName} (V3 col ${v3Idx}, V4 col ${v4Idx}):`);
    console.log(`    V3 unique values: ${v3Vals.size}`);
    console.log(`    V4 unique values: ${v4Vals.size}`);
    if (newInV4.length) console.log(`    NEW in V4:`, newInV4);
    if (removedInV4.length) console.log(`    REMOVED from V3:`, removedInV4);
    if (!newInV4.length && !removedInV4.length) console.log(`    No changes`);
  } else {
    console.log(`  ${colName}: V3 col=${v3Idx}, V4 col=${v4Idx} (column not found in one version)`);
  }
}

// Check the "updated" date in the first row
console.log('\n--- Version Metadata ---');
const v3Row0 = v3Main[0] || [];
const v4Row0 = v4Main[0] || [];
console.log('V3 first row (metadata):', v3Row0.filter(c => c).join(' | '));
console.log('V4 first row (metadata):', v4Row0.filter(c => c).join(' | '));

// Extract date references
for (let i = 0; i < v3Row0.length; i++) {
  const cell = String(v3Row0[i] || '');
  if (cell.toLowerCase().includes('updated')) {
    console.log(`V3 update reference: "${cell}"`);
  }
}
for (let i = 0; i < v4Row0.length; i++) {
  const cell = String(v4Row0[i] || '');
  if (cell.toLowerCase().includes('updated')) {
    console.log(`V4 update reference: "${cell}"`);
  }
}

// Also check other V4-specific sheets
console.log('\n--- V4-Only Sheet Analysis ---');
for (const name of v4Only) {
  const sheet = wbV4.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`  "${name}": ${data.length} rows`);
  if (data.length > 0) {
    console.log(`    First row:`, JSON.stringify(data[0]));
  }
  if (data.length > 1) {
    console.log(`    Second row:`, JSON.stringify(data[1]));
  }
}

// Check change log sheet
console.log('\n--- Change Log ---');
const changeLogV3 = wbV3.Sheets['Change Log'];
const changeLogV4 = wbV4.Sheets['Change Log'];

if (changeLogV3) {
  const clV3 = XLSX.utils.sheet_to_json(changeLogV3, { header: 1 });
  console.log('V3 Change Log entries:', clV3.length);
  clV3.forEach((row, i) => {
    if (row && row.length > 0) console.log(`  V3[${i}]:`, row.join(' | '));
  });
}

if (changeLogV4) {
  const clV4 = XLSX.utils.sheet_to_json(changeLogV4, { header: 1 });
  console.log('\nV4 Change Log entries:', clV4.length);
  clV4.forEach((row, i) => {
    if (row && row.length > 0) console.log(`  V4[${i}]:`, row.join(' | '));
  });
}

// Summary
console.log('\n\n========== SUMMARY ==========');
console.log(`V3: ${v3DataCount} data rows, ${v3Headers.length} columns, ${wbV3.SheetNames.length} sheets`);
console.log(`V4: ${v4DataCount} data rows, ${v4Headers.length} columns, ${wbV4.SheetNames.length} sheets`);
console.log(`Row difference: ${v4DataCount - v3DataCount}`);
console.log(`Header changes: ${headerChanges}`);
console.log(`New sheets in V4: ${v4Only.length} (${v4Only.join(', ') || 'none'})`);
console.log(`Removed sheets in V4: ${v3Only.length} (${v3Only.join(', ') || 'none'})`);

if (v4DataCount > v3DataCount) {
  console.log('\nRECOMMENDATION: UPDATE NEEDED - V4 has more risks');
} else if (v4DataCount === v3DataCount && headerChanges === 0) {
  console.log('\nRECOMMENDATION: NO UPDATE NEEDED - same structure and count');
} else if (v4DataCount < v3DataCount) {
  console.log('\nRECOMMENDATION: INVESTIGATE - V4 has fewer risks (may be incomplete)');
} else {
  console.log('\nRECOMMENDATION: UPDATE NEEDED - schema changes detected');
}
