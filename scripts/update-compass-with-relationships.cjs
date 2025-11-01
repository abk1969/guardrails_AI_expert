const fs = require('fs');
const path = require('path');

// ============================================================================
// Update COMPASS Data with Relationships
// ============================================================================
// Takes generated relationships and updates compassContent.ts
// ============================================================================

const relationshipsPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-relationships.json');
const compassContentPath = path.join(__dirname, '..', 'data', 'compassContent.ts');

console.log('🔄 Updating COMPASS Content with Relationships\n');

// Load relationships
const relationships = JSON.parse(fs.readFileSync(relationshipsPath, 'utf8'));
console.log(`✅ Loaded relationships for ${relationships.length} use cases`);

// Load existing compass content
const compassContent = fs.readFileSync(compassContentPath, 'utf8');

// Parse the use cases array
const useCasesMatch = compassContent.match(/export const compassUseCases: CompassUseCase\[\] = (\[[\s\S]*?\n\]);/);
if (!useCasesMatch) {
  console.error('❌ Could not find use cases array in compassContent.ts');
  process.exit(1);
}

const useCasesText = useCasesMatch[1];
let useCasesArray;
try {
  // Clean up TypeScript syntax to make it valid JSON
  // NOTE: Apostrophes (') are valid in JSON strings and don't need escaping
  let jsonText = useCasesText
    .replace(/–/g, '-') // Replace en-dash (U+2013) with regular dash
    .replace(/—/g, '-') // Replace em-dash (U+2014) with regular dash
    .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes (U+2018, U+2019) with apostrophe
    .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes (U+201C, U+201D) with regular quotes
    .replace(/,(\s*[\]}])/g, '$1'); // Remove trailing commas

  useCasesArray = JSON.parse(jsonText);

  // Initialize missing relatedSheets fields for backward compatibility
  console.log('✅ Checking existing relatedSheets structure...');
  useCasesArray.forEach(uc => {
    if (!uc.relatedSheets) {
      uc.relatedSheets = {};
    }
    // Ensure all fields exist before update (for robustness)
    if (!uc.relatedSheets.vulnerabilities) uc.relatedSheets.vulnerabilities = [];
    if (!uc.relatedSheets.incidents) uc.relatedSheets.incidents = [];
    if (!uc.relatedSheets.defenses) uc.relatedSheets.defenses = [];
    if (!uc.relatedSheets.questions) uc.relatedSheets.questions = [];
    if (!uc.relatedSheets.threatProfiles) uc.relatedSheets.threatProfiles = [];
    if (!uc.relatedSheets.attackSurfaces) uc.relatedSheets.attackSurfaces = [];
    if (!uc.relatedSheets.incidentReadiness) uc.relatedSheets.incidentReadiness = [];
    if (!uc.relatedSheets.redTeamSecurity) uc.relatedSheets.redTeamSecurity = [];
    if (!uc.relatedSheets.redTeamResults) uc.relatedSheets.redTeamResults = [];
    if (!uc.relatedSheets.useCases) uc.relatedSheets.useCases = [];
  });
} catch (e) {
  console.error('❌ Could not parse use cases JSON:', e.message);
  process.exit(1);
}

console.log(`✅ Parsed ${useCasesArray.length} existing use cases\n`);

// Update use cases with relationships
let updateCount = 0;
useCasesArray.forEach(useCase => {
  const relationship = relationships.find(r => r.id === useCase.id);
  if (relationship) {
    useCase.relatedSheets = {
      vulnerabilities: relationship.vulnerabilities,
      incidents: relationship.incidents,
      defenses: relationship.defenses,
      questions: relationship.questions,
      threatProfiles: relationship.threatProfiles || [],
      attackSurfaces: relationship.attackSurfaces || [],
      incidentReadiness: relationship.incidentReadiness || [],
      redTeamSecurity: relationship.redTeamSecurity || [],
      redTeamResults: relationship.redTeamResults || [],
      useCases: relationship.useCases || []
    };
    updateCount++;
  }
});

console.log(`✅ Updated ${updateCount} use cases with relationships\n`);

// Rebuild the file
const newUseCasesArray = JSON.stringify(useCasesArray, null, 2);

// Replace in original file
const updatedContent = compassContent.replace(
  /export const compassUseCases: CompassUseCase\[\] = \[[\s\S]*?\n\];/,
  `export const compassUseCases: CompassUseCase[] = ${newUseCasesArray};`
);

// Write back
fs.writeFileSync(compassContentPath, updatedContent, 'utf8');

console.log(`✅ Updated compassContent.ts successfully!`);

// Print summary
console.log('\n' + '='.repeat(80));
console.log('📊 RELATIONSHIP UPDATE SUMMARY');
console.log('='.repeat(80));

const stats = useCasesArray.reduce((acc, uc) => {
  acc.totalVulns += uc.relatedSheets.vulnerabilities.length;
  acc.totalIncidents += uc.relatedSheets.incidents.length;
  acc.totalDefenses += uc.relatedSheets.defenses.length;
  acc.totalQuestions += uc.relatedSheets.questions.length;
  acc.totalThreats += (uc.relatedSheets.threatProfiles || []).length;
  acc.totalSurfaces += (uc.relatedSheets.attackSurfaces || []).length;
  acc.totalReadiness += (uc.relatedSheets.incidentReadiness || []).length;
  acc.totalSecurity += (uc.relatedSheets.redTeamSecurity || []).length;
  acc.totalResults += (uc.relatedSheets.redTeamResults || []).length;
  acc.totalUseCases += (uc.relatedSheets.useCases || []).length;

  if (uc.relatedSheets.vulnerabilities.length > 0) acc.withVulns++;
  if (uc.relatedSheets.incidents.length > 0) acc.withIncidents++;
  if (uc.relatedSheets.defenses.length > 0) acc.withDefenses++;
  if (uc.relatedSheets.questions.length > 0) acc.withQuestions++;
  if ((uc.relatedSheets.threatProfiles || []).length > 0) acc.withThreats++;
  if ((uc.relatedSheets.attackSurfaces || []).length > 0) acc.withSurfaces++;
  if ((uc.relatedSheets.incidentReadiness || []).length > 0) acc.withReadiness++;
  if ((uc.relatedSheets.redTeamSecurity || []).length > 0) acc.withSecurity++;
  if ((uc.relatedSheets.redTeamResults || []).length > 0) acc.withResults++;
  if ((uc.relatedSheets.useCases || []).length > 0) acc.withUseCases++;

  return acc;
}, {
  totalVulns: 0,
  totalIncidents: 0,
  totalDefenses: 0,
  totalQuestions: 0,
  totalThreats: 0,
  totalSurfaces: 0,
  totalReadiness: 0,
  totalSecurity: 0,
  totalResults: 0,
  totalUseCases: 0,
  withVulns: 0,
  withIncidents: 0,
  withDefenses: 0,
  withQuestions: 0,
  withThreats: 0,
  withSurfaces: 0,
  withReadiness: 0,
  withSecurity: 0,
  withResults: 0,
  withUseCases: 0
});

const grandTotal = stats.totalVulns + stats.totalIncidents + stats.totalDefenses + stats.totalQuestions +
                   stats.totalThreats + stats.totalSurfaces + stats.totalReadiness + stats.totalSecurity +
                   stats.totalResults + stats.totalUseCases;

console.log(`\n📊 Total Links: ${grandTotal}\n`);
console.log(`📦 Original 4 Modules:`);
console.log(`  - Vulnerabilities: ${stats.totalVulns} (${stats.withVulns}/${useCasesArray.length} use cases)`);
console.log(`  - Incidents: ${stats.totalIncidents} (${stats.withIncidents}/${useCasesArray.length} use cases)`);
console.log(`  - Defenses: ${stats.totalDefenses} (${stats.withDefenses}/${useCasesArray.length} use cases)`);
console.log(`  - Questions: ${stats.totalQuestions} (${stats.withQuestions}/${useCasesArray.length} use cases)`);
console.log(`\n🆕 New 6 Modules:`);
console.log(`  - Threat Profiles: ${stats.totalThreats} (${stats.withThreats}/${useCasesArray.length} use cases)`);
console.log(`  - Attack Surfaces: ${stats.totalSurfaces} (${stats.withSurfaces}/${useCasesArray.length} use cases)`);
console.log(`  - Incident Readiness: ${stats.totalReadiness} (${stats.withReadiness}/${useCasesArray.length} use cases)`);
console.log(`  - Red Team Security: ${stats.totalSecurity} (${stats.withSecurity}/${useCasesArray.length} use cases)`);
console.log(`  - Red Team Results: ${stats.totalResults} (${stats.withResults}/${useCasesArray.length} use cases)`);
console.log(`  - Related Use Cases: ${stats.totalUseCases} (${stats.withUseCases}/${useCasesArray.length} use cases)`);

console.log(`\n✅ STEP 2 Complete! Proceed to STEP 3: Create NavigationContext\n`);
