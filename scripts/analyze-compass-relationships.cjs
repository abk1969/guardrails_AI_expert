const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data_ai_risk', 'owasp-compass-analysis.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('=== COMPASS RELATIONSHIP ANALYSIS ===\n');

// Analyze vulnerabilities sheet
const vulnSheet = data['3a Orient Known AI Vulnerabilit'];
console.log('📊 VULNERABILITIES SHEET');
console.log('Headers:', vulnSheet.headers);
console.log('Total rows:', vulnSheet.data.length);
console.log('\nSample rows (skipping instructions):');
vulnSheet.data.slice(10, 15).forEach((row, i) => {
  if (row.some(cell => cell && cell.trim())) {
    console.log(`Row ${10 + i}:`, row.filter(c => c).join(' | '));
  }
});

// Analyze incidents sheet
const incidentSheet = data['3b Orient Known AI Incidents'];
console.log('\n\n📊 INCIDENTS SHEET');
console.log('Headers:', incidentSheet.headers);
console.log('Total rows:', incidentSheet.data.length);
console.log('\nSample rows (skipping instructions):');
incidentSheet.data.slice(5, 10).forEach((row, i) => {
  if (row.some(cell => cell && cell.trim())) {
    console.log(`Row ${5 + i}:`, row.filter(c => c).join(' | '));
  }
});

// Analyze defenses sheet
const defenseSheet = data['6a Reference Defenses & Mitigat'];
console.log('\n\n📊 DEFENSES & MITIGATIONS SHEET');
console.log('Headers:', defenseSheet.headers);
console.log('Total rows:', defenseSheet.data.length);
console.log('\nSample rows:');
defenseSheet.data.slice(2, 10).forEach((row, i) => {
  if (row.some(cell => cell && cell.trim())) {
    console.log(`Row ${2 + i}:`, row.filter(c => c).join(' | '));
  }
});

// Analyze third party questions
const questionsSheet = data['6c Reference Third Party Questi'];
console.log('\n\n📊 THIRD PARTY QUESTIONS SHEET');
console.log('Headers:', questionsSheet.headers);
console.log('Total rows:', questionsSheet.data.length);
console.log('\nSample rows:');
questionsSheet.data.slice(1, 8).forEach((row, i) => {
  if (row.some(cell => cell && cell.trim())) {
    console.log(`Row ${1 + i}:`, row.filter(c => c).join(' | '));
  }
});

// Look for potential linkage patterns
console.log('\n\n🔗 POTENTIAL LINKAGE PATTERNS:');
console.log('\n1. MITRE/ATLAS Technique Mapping:');
const useCaseSheet = data['Notes Uses Cases'];
useCaseSheet.data.slice(0, 5).forEach((row, i) => {
  console.log(`  Use Case ${i + 1}: ${row[0]} → ${row[6]}`);
});

console.log('\n2. Threat Categories in Use Cases:');
useCaseSheet.data.slice(0, 5).forEach((row, i) => {
  console.log(`  Use Case ${i + 1}: ${row[0]} → Associated Threat: ${row[5]}`);
});
