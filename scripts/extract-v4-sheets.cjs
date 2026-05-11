/**
 * Extract all sheets from AI Risk Repository V4 Excel file to JSON
 * Mirrors the V3 extraction format in data_ai_risk/extracted/
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const V4_PATH = path.join(__dirname, '../data_ai_risk/Copy of The AI Risk Repository V4_03_12_2025.xlsx');
const OUTPUT_DIR = path.join(__dirname, '../data_ai_risk/extracted');

console.log('=== Extracting AI Risk Repository V4 ===\n');

const wb = XLSX.readFile(V4_PATH);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map V4 sheet names to V3-compatible output file names
const sheetMapping = {
  'Contents': 'contents.json',
  'Causal Taxonomy of AI Risks v1': 'causal_taxonomy_of_ai_risks_v3.json',
  'Domain Taxonomy of AI Risks v1': 'domain_taxonomy_of_ai_risks_v3.json',
  'AI Risk Database v4': 'ai_risk_database_v3.json',
  'AI Risk Database explainer': 'ai_risk_database_explainer.json',
  'Causal Taxonomy statistics': 'causal_taxonomy_statistics.json',
  'Domain Taxonomy statistics': 'domain_taxonomy_statistics.json',
  'Causal x Domain Taxonomy compar': 'causal_x_domain_taxonomy_compar.json',
  'Included resources': 'included_resources.json',
  'Resources being considered': 'resources_being_considered.json',
  'Change Log': 'change_log.json'
};

const summary = {
  fileName: 'Copy of The AI Risk Repository V4_03_12_2025.xlsx',
  extractedAt: new Date().toISOString(),
  totalSheets: wb.SheetNames.length,
  sheets: []
};

for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const outputFileName = sheetMapping[sheetName];
  if (!outputFileName) {
    console.log(`  Skipping unmapped sheet: "${sheetName}"`);
    continue;
  }

  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  const fileSize = fs.statSync(outputPath).size;
  console.log(`  Extracted "${sheetName}" -> ${outputFileName} (${data.length} rows, ${(fileSize / 1024).toFixed(1)} KB)`);

  summary.sheets.push({
    index: wb.SheetNames.indexOf(sheetName),
    name: sheetName,
    rows: data.length,
    columns: data.length > 0 ? Object.keys(data[0]).length : 0,
    outputFile: outputFileName
  });
}

// Write summary
const summaryPath = path.join(OUTPUT_DIR, '_summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`\n  Summary -> _summary.json`);

console.log(`\nExtraction complete. ${summary.sheets.length} sheets extracted.`);
