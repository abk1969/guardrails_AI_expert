const fs = require('fs');
const path = require('path');

console.log('🌐 Finalisation des traductions COMPASS...\n');

// Load transformed data
const dataPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-data-transformed.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// The source data is already in English, we just need to remove [TO_TRANSLATE] markers
function finalizeTranslations(useCases) {
  useCases.forEach((uc, index) => {
    console.log(`[${index + 1}/${useCases.length}] ${uc.id}`);

    // Remove [TO_TRANSLATE] markers - the text is already in English
    if (uc.title.en.includes('[TO_TRANSLATE]')) {
      uc.title.en = uc.title.en.replace('[TO_TRANSLATE] ', '');
    }

    if (uc.description.en.includes('[TO_TRANSLATE]')) {
      uc.description.en = uc.description.en.replace('[TO_TRANSLATE] ', '');
    }

    if (uc.recommendation.en.includes('[TO_TRANSLATE]')) {
      uc.recommendation.en = uc.recommendation.en.replace('[TO_TRANSLATE] ', '');
    }

    if (uc.associatedThreat.en.includes('[TO_TRANSLATE]')) {
      uc.associatedThreat.en = uc.associatedThreat.en.replace('[TO_TRANSLATE] ', '');
    }

    if (uc.attackMapping.description && uc.attackMapping.description.en.includes('[TO_TRANSLATE]')) {
      uc.attackMapping.description.en = uc.attackMapping.description.en.replace('[TO_TRANSLATE] ', '');
    }

    console.log(`   ✅ ${uc.title.en}`);
  });

  return useCases;
}

// ============================================================
// GENERATE OUTPUT FILES
// ============================================================

function generateOutputFiles(useCases) {
  const sheets = data.sheets;
  const stats = data.stats;

  // TypeScript content file
  const tsContent = `// ============================================================
// OWASP COMPASS Data - Auto-generated (Bilingual FR/EN)
// Generated: ${new Date().toISOString()}
// Source: Copy of ⭕ OWASP GenAI COMPASS v. 1.xlsx
// Note: Original data was in English
// ============================================================

import {
  CompassUseCase,
  OWASPSheet,
  OODAPhase,
  RiskLevel,
  BilingualText
} from '../types';

// ============================================================
// USE CASES (31 threat scenarios with risk scores - BILINGUAL)
// ============================================================

export const compassUseCases: CompassUseCase[] = ${JSON.stringify(useCases, null, 2)};

// ============================================================
// SHEETS METADATA (19 Excel tabs - BILINGUAL)
// ============================================================

export const owaspSheets: OWASPSheet[] = ${JSON.stringify(sheets, null, 2)};

// ============================================================
// STATISTICS
// ============================================================

export const compassStatistics = ${JSON.stringify(stats, null, 2)};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getUseCaseById(id: string): CompassUseCase | undefined {
  return compassUseCases.find(uc => uc.id === id);
}

export function getUseCasesByRiskLevel(level: RiskLevel): CompassUseCase[] {
  return compassUseCases.filter(uc => uc.riskLevel === level);
}

export function getUseCasesByOODAPhase(phase: OODAPhase): CompassUseCase[] {
  return compassUseCases.filter(uc => uc.oodaPhase === phase);
}

export function getSheetById(id: string): OWASPSheet | undefined {
  return owaspSheets.find(sheet => sheet.id === id);
}

export function getSheetsByOODAPhase(phase: OODAPhase): OWASPSheet[] {
  return owaspSheets.filter(sheet => sheet.oodaPhase === phase);
}

export function getReferenceSheets(): OWASPSheet[] {
  return owaspSheets.filter(sheet => sheet.oodaPhase === null);
}
`;

  // Write TypeScript file
  const outputPath = path.join(__dirname, '..', 'data', 'compassContent.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`\n📁 Fichier TypeScript mis à jour: ${outputPath}`);

  // Write JSON for reference
  const jsonPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-data-final.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ useCases, sheets, stats }, null, 2),
    'utf-8'
  );
  console.log(`📁 Fichier JSON créé: ${jsonPath}`);
}

// ============================================================
// MAIN
// ============================================================

const finalUseCases = finalizeTranslations(data.useCases);
generateOutputFiles(finalUseCases);

console.log('\n✅ TRADUCTIONS FINALISÉES\n');
console.log('📊 Résultat:');
console.log(`   • ${finalUseCases.length} cas d'usage bilingues FR/EN`);
console.log(`   • Source: Données déjà en anglais`);
console.log(`   • Fichier: data/compassContent.ts`);
console.log(`\n💡 Note: Le contenu source OWASP était déjà en anglais.`);
console.log(`   Pour du contenu français, utiliser le chatbot avec Gemini API.`);
