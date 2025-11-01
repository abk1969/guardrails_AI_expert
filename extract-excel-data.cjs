const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data_ai_risk', 'AI Risk Repository V3_26_03_2025.xlsx');
const outputDir = path.join(__dirname, 'data_ai_risk', 'extracted');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  console.log('Reading Excel file:', filePath);
  const workbook = XLSX.readFile(filePath);

  console.log('\nSheet names found:', workbook.SheetNames);

  const allData = {};

  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n[${index + 1}/${workbook.SheetNames.length}] Processing sheet: ${sheetName}`);

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    });

    // Also get with first row as headers
    const jsonDataWithHeaders = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false
    });

    allData[sheetName] = {
      raw: jsonData,
      withHeaders: jsonDataWithHeaders,
      rowCount: jsonData.length,
      columnCount: jsonData[0] ? jsonData[0].length : 0
    };

    // Save individual sheet as JSON
    const sheetFileName = sheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    fs.writeFileSync(
      path.join(outputDir, `${sheetFileName}.json`),
      JSON.stringify(jsonDataWithHeaders, null, 2)
    );

    console.log(`  ✓ Rows: ${jsonData.length}, Columns: ${jsonData[0] ? jsonData[0].length : 0}`);
    console.log(`  ✓ Saved to: ${sheetFileName}.json`);

    // Print first 3 rows as preview
    if (jsonData.length > 0) {
      console.log('  Preview (first row - headers):');
      console.log('  ', JSON.stringify(jsonData[0]));
    }
  });

  // Save summary
  const summary = {
    fileName: 'AI Risk Repository V3_26_03_2025.xlsx',
    extractedAt: new Date().toISOString(),
    totalSheets: workbook.SheetNames.length,
    sheets: workbook.SheetNames.map((name, i) => ({
      index: i,
      name: name,
      rows: allData[name].rowCount,
      columns: allData[name].columnCount
    }))
  };

  fs.writeFileSync(
    path.join(outputDir, '_summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\n✅ Extraction complete!');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📊 Total sheets extracted: ${workbook.SheetNames.length}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
