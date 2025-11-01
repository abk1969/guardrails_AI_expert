const fs = require('fs');
const path = require('path');

const compassContentPath = path.join(__dirname, '..', 'data', 'compassContent.ts');
const compassContent = fs.readFileSync(compassContentPath, 'utf8');

const useCasesMatch = compassContent.match(/export const compassUseCases: CompassUseCase\[\] = (\[[\s\S]*?\n\]);/);
if (!useCasesMatch) {
  console.error('Could not match use cases');
  process.exit(1);
}

const useCasesText = useCasesMatch[1];
const jsonText = useCasesText
  .replace(/,(\s*[\]}])/g, '$1')
  .replace(/'/g, '"')
  .replace(/–/g, '-')
  .replace(/—/g, '-')
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201C\u201D]/g, '"');

// Try to find the problematic line
const lines = jsonText.split('\n');
console.log('Total lines:', lines.length);
console.log('\nLine 44-48:');
for (let i = 43; i <= 47 && i < lines.length; i++) {
  console.log(`Line ${i+1}: ${lines[i].substring(0, 200)}`);
}

// Try parsing and capture detailed error
try {
  JSON.parse(jsonText);
  console.log('\n✅ Parsing succeeded!');
} catch (e) {
  console.log('\n❌ Parsing failed:', e.message);

  // Try to find context around error position
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log(`\nContext around position ${pos}:`);
    console.log('Before:', jsonText.substring(Math.max(0, pos-50), pos));
    console.log('ERROR HERE >>>');
    console.log('After:', jsonText.substring(pos, Math.min(jsonText.length, pos+50)));
  }
}
