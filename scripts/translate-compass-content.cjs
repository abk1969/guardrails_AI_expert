const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables manually (since this is Node.js, not Vite)
require('dotenv').config();

console.log('🌐 Traduction du contenu OWASP COMPASS (FR → EN)...\n');

// Initialize Gemini API
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ Clé API Gemini introuvable dans .env');
  console.error('   Définir VITE_GEMINI_API_KEY dans le fichier .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.0-flash-exp';

// Load transformed data
const dataPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-data-transformed.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// ============================================================
// TRANSLATION FUNCTIONS
// ============================================================

async function translateText(frenchText, context = '') {
  try {
    const prompt = `Translate the following French text to English in the context of AI security and threat defense.
Context: ${context}
French text: "${frenchText}"

Requirements:
- Provide ONLY the English translation, no explanations
- Keep technical terms accurate (AI, LLM, prompt injection, etc.)
- Maintain the same tone and formality
- If it's already in English, return it as-is`;

    const result = await ai.models.generateContent({
      model,
      contents: prompt
    });

    const translation = result.text.trim();

    // Remove quotes if Gemini added them
    return translation.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error(`   ⚠️  Erreur de traduction: ${error.message}`);
    // Fallback: return original text with marker
    return `[TRANSLATION_FAILED] ${frenchText}`;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// TRANSLATE USE CASES
// ============================================================

async function translateUseCases() {
  console.log('📝 Traduction des cas d\'usage...\n');

  const useCases = data.useCases;
  let translatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < useCases.length; i++) {
    const uc = useCases[i];
    console.log(`[${i + 1}/${useCases.length}] ${uc.id}: ${uc.title.fr}`);

    try {
      // Translate title
      if (uc.title.en.includes('[TO_TRANSLATE]')) {
        uc.title.en = await translateText(uc.title.fr, 'Use case title - AI security threat scenario');
        await delay(1000); // Rate limiting: 1 req/sec
      }

      // Translate description
      if (uc.description.en.includes('[TO_TRANSLATE]')) {
        uc.description.en = await translateText(uc.description.fr, 'Use case description - threat details');
        await delay(1000);
      }

      // Translate recommendation
      if (uc.recommendation.en.includes('[TO_TRANSLATE]')) {
        uc.recommendation.en = await translateText(uc.recommendation.fr, 'Security recommendation');
        await delay(1000);
      }

      // Translate associated threat
      if (uc.associatedThreat.en.includes('[TO_TRANSLATE]')) {
        uc.associatedThreat.en = await translateText(uc.associatedThreat.fr, 'Associated threat description');
        await delay(1000);
      }

      // Translate attack mapping description
      if (uc.attackMapping.description && uc.attackMapping.description.en.includes('[TO_TRANSLATE]')) {
        uc.attackMapping.description.en = await translateText(
          uc.attackMapping.description.fr,
          'MITRE ATT&CK / ATLAS technique description'
        );
        await delay(1000);
      }

      console.log(`   ✅ Traduit: ${uc.title.en}\n`);
      translatedCount++;
    } catch (error) {
      console.error(`   ❌ Échec: ${error.message}\n`);
      failedCount++;
    }
  }

  console.log(`\n✅ Traduction terminée:`);
  console.log(`   • Réussis: ${translatedCount}/${useCases.length}`);
  console.log(`   • Échecs: ${failedCount}/${useCases.length}\n`);

  return useCases;
}

// ============================================================
// GENERATE OUTPUT FILES
// ============================================================

async function generateOutputFiles(translatedUseCases) {
  const sheets = data.sheets;
  const stats = data.stats;

  // TypeScript content file
  const tsContent = `// ============================================================
// OWASP COMPASS Data - Auto-generated with translations
// Generated: ${new Date().toISOString()}
// Source: Copy of ⭕ OWASP GenAI COMPASS v. 1.xlsx
// Translated: FR → EN via Gemini API
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

export const compassUseCases: CompassUseCase[] = ${JSON.stringify(translatedUseCases, null, 2)};

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
  console.log(`📁 Fichier TypeScript mis à jour: ${outputPath}`);

  // Write JSON for reference
  const jsonPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-data-translated.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ useCases: translatedUseCases, sheets, stats }, null, 2),
    'utf-8'
  );
  console.log(`📁 Fichier JSON créé: ${jsonPath}`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  try {
    const translatedUseCases = await translateUseCases();
    await generateOutputFiles(translatedUseCases);

    console.log('\n✅ TRADUCTION COMPLÈTE\n');
    console.log('📊 Résultat:');
    console.log(`   • ${translatedUseCases.length} cas d'usage traduits FR → EN`);
    console.log(`   • Données bilingues prêtes pour l'application`);
    console.log(`   • Fichier: data/compassContent.ts`);
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  }
}

main();
