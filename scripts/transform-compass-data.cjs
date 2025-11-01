const fs = require('fs');
const path = require('path');

// Load parsed Excel data
const excelDataPath = path.join(__dirname, '..', 'data_ai_risk', 'owasp-compass-analysis.json');
const excelData = JSON.parse(fs.readFileSync(excelDataPath, 'utf-8'));

console.log('🔄 Transformation des données OWASP COMPASS...\n');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateRiskLevel(riskScore) {
  if (riskScore >= 20) return 'critical';
  if (riskScore >= 15) return 'high';
  if (riskScore >= 10) return 'moderate';
  return 'low';
}

function generateId(prefix, index) {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

function parseAttackMapping(mappingText) {
  if (!mappingText) return { mitre: undefined, atlas: undefined };

  const mitreMatch = mappingText.match(/T\d{4}(?:\.\d{3})?/);
  const atlasMatch = mappingText.match(/T\d{4}.*ATLAS/i);

  return {
    mitre: mitreMatch ? mitreMatch[0] : undefined,
    atlas: atlasMatch ? mappingText : undefined
  };
}

function cleanText(text) {
  if (!text) return '';
  return String(text).trim();
}

// ============================================================
// TRANSFORM USE CASES
// ============================================================

function transformUseCases() {
  const useCasesSheet = excelData['Notes Uses Cases'];
  if (!useCasesSheet) {
    console.error('❌ Feuille "Notes Uses Cases" introuvable');
    return [];
  }

  const useCases = [];

  useCasesSheet.data.forEach((row, index) => {
    if (!row[0]) return; // Skip empty rows

    const [
      useCase,
      impact,
      likelihood,
      riskScore,
      recommendation,
      associatedThreat,
      attackMapping
    ] = row;

    const parsedMapping = parseAttackMapping(attackMapping);
    const riskLevel = calculateRiskLevel(riskScore);

    useCases.push({
      id: generateId('COMPASS-UC', index + 1),
      title: {
        fr: cleanText(useCase),
        en: `[TO_TRANSLATE] ${cleanText(useCase)}` // Will be translated in Phase 2
      },
      description: {
        fr: cleanText(associatedThreat),
        en: `[TO_TRANSLATE] ${cleanText(associatedThreat)}`
      },
      impact: Number(impact) || 1,
      likelihood: Number(likelihood) || 1,
      riskScore: Number(riskScore) || 1,
      riskLevel,
      recommendation: {
        fr: cleanText(recommendation),
        en: `[TO_TRANSLATE] ${cleanText(recommendation)}`
      },
      associatedThreat: {
        fr: cleanText(associatedThreat),
        en: `[TO_TRANSLATE] ${cleanText(associatedThreat)}`
      },
      attackMapping: {
        mitre: parsedMapping.mitre,
        atlas: parsedMapping.atlas,
        description: {
          fr: cleanText(attackMapping),
          en: `[TO_TRANSLATE] ${cleanText(attackMapping)}`
        }
      },
      relatedSheets: {
        vulnerabilities: [], // To be populated later
        incidents: [],
        defenses: [],
        questions: []
      },
      oodaPhase: 'observe', // Default, will be refined
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  console.log(`✅ ${useCases.length} cas d'usage transformés`);
  return useCases;
}

// ============================================================
// TRANSFORM OWASP SHEETS METADATA
// ============================================================

function transformSheets() {
  const sheets = [
    {
      id: 'compass-getting-started',
      name: '0 Getting The Compass',
      title: { fr: 'Démarrage', en: 'Getting Started' },
      description: { fr: 'Guide de démarrage rapide', en: 'Quick start guide' },
      oodaPhase: null,
      icon: 'BookOpen',
      color: 'blue',
      order: 0
    },
    {
      id: 'compass-about',
      name: '1 About',
      title: { fr: 'À propos', en: 'About' },
      description: { fr: 'Introduction au framework COMPASS', en: 'Introduction to COMPASS framework' },
      oodaPhase: null,
      icon: 'Info',
      color: 'blue',
      order: 1
    },
    {
      id: 'compass-faq',
      name: '1 FAQ',
      title: { fr: 'FAQ', en: 'FAQ' },
      description: { fr: 'Questions fréquemment posées', en: 'Frequently Asked Questions' },
      oodaPhase: null,
      icon: 'HelpCircle',
      color: 'blue',
      order: 2
    },
    {
      id: 'compass-observe-dashboard',
      name: '2 Observe Objective Dashboard',
      title: { fr: 'Tableau de bord Observe', en: 'Observe Dashboard' },
      description: { fr: 'Vue d\'ensemble des objectifs et menaces', en: 'Overview of objectives and threats' },
      oodaPhase: 'observe',
      icon: 'Eye',
      color: 'purple',
      order: 3
    },
    {
      id: 'compass-threat-profile',
      name: '2a Observe Objective Threat Pr',
      title: { fr: 'Profil de menace', en: 'Threat Profile' },
      description: { fr: 'Définition du profil de menace de votre système', en: 'Define your system threat profile' },
      oodaPhase: 'observe',
      icon: 'Target',
      color: 'purple',
      order: 4
    },
    {
      id: 'compass-attack-surface',
      name: '2b Observe Attack Surface Analy',
      title: { fr: 'Surface d\'attaque', en: 'Attack Surface' },
      description: { fr: 'Analyse de la surface d\'attaque', en: 'Attack surface analysis' },
      oodaPhase: 'observe',
      icon: 'Shield',
      color: 'purple',
      order: 5
    },
    {
      id: 'compass-orient-summary',
      name: '3 Orient Summary',
      title: { fr: 'Résumé Orient', en: 'Orient Summary' },
      description: { fr: 'Synthèse de l\'orientation stratégique', en: 'Strategic orientation summary' },
      oodaPhase: 'orient',
      icon: 'Compass',
      color: 'cyan',
      order: 6
    },
    {
      id: 'compass-vulnerabilities',
      name: '3a Orient Known AI Vulnerabilit',
      title: { fr: 'Vulnérabilités connues', en: 'Known Vulnerabilities' },
      description: { fr: 'Base de données des vulnérabilités IA connues', en: 'Known AI vulnerabilities database' },
      oodaPhase: 'orient',
      icon: 'AlertTriangle',
      color: 'cyan',
      order: 7
    },
    {
      id: 'compass-incidents',
      name: '3b Orient Known AI Incidents',
      title: { fr: 'Incidents connus', en: 'Known Incidents' },
      description: { fr: 'Historique des incidents IA', en: 'AI incidents history' },
      oodaPhase: 'orient',
      icon: 'Flame',
      color: 'cyan',
      order: 8
    },
    {
      id: 'compass-incident-response',
      name: '3c Orient AI Incident Response ',
      title: { fr: 'Réponse aux incidents', en: 'Incident Response' },
      description: { fr: 'Procédures de réponse aux incidents IA', en: 'AI incident response procedures' },
      oodaPhase: 'orient',
      icon: 'Siren',
      color: 'cyan',
      order: 9
    },
    {
      id: 'compass-red-team-review',
      name: '3d Orient Red Team Security Rev',
      title: { fr: 'Revue Red Team', en: 'Red Team Review' },
      description: { fr: 'Revue de sécurité Red Team', en: 'Red Team security review' },
      oodaPhase: 'orient',
      icon: 'Users',
      color: 'cyan',
      order: 10
    },
    {
      id: 'compass-red-team-results',
      name: '3e Orient AI Red Team Results',
      title: { fr: 'Résultats Red Team', en: 'Red Team Results' },
      description: { fr: 'Résultats des tests adversaires', en: 'Adversarial testing results' },
      oodaPhase: 'orient',
      icon: 'FileText',
      color: 'cyan',
      order: 11
    },
    {
      id: 'compass-decide-prioritization',
      name: '4 Decide Red Team or Vuln vs Mi',
      title: { fr: 'Décision et priorisation', en: 'Decision & Prioritization' },
      description: { fr: 'Priorisation des vulnérabilités et mitigations', en: 'Vulnerabilities and mitigations prioritization' },
      oodaPhase: 'decide',
      icon: 'CheckSquare',
      color: 'green',
      order: 12
    },
    {
      id: 'compass-act-strategy',
      name: '5 Act Strategy & Roadmap',
      title: { fr: 'Stratégie et feuille de route', en: 'Strategy & Roadmap' },
      description: { fr: 'Plan d\'action et feuille de route', en: 'Action plan and roadmap' },
      oodaPhase: 'act',
      icon: 'Map',
      color: 'orange',
      order: 13
    },
    {
      id: 'compass-security-matrix',
      name: '6 Reference AI Security Matrix',
      title: { fr: 'Matrice de sécurité IA', en: 'AI Security Matrix' },
      description: { fr: 'Matrice de référence de sécurité IA', en: 'AI security reference matrix' },
      oodaPhase: null,
      icon: 'Grid',
      color: 'gray',
      order: 14
    },
    {
      id: 'compass-defenses',
      name: '6a Reference Defenses & Mitigat',
      title: { fr: 'Défenses et mitigations', en: 'Defenses & Mitigations' },
      description: { fr: 'Catalogue des défenses et mitigations', en: 'Defenses and mitigations catalog' },
      oodaPhase: null,
      icon: 'ShieldCheck',
      color: 'gray',
      order: 15
    },
    {
      id: 'compass-monitoring',
      name: '6b Reference Incident Monitorin',
      title: { fr: 'Surveillance des incidents', en: 'Incident Monitoring' },
      description: { fr: 'Outils et techniques de surveillance', en: 'Monitoring tools and techniques' },
      oodaPhase: null,
      icon: 'Activity',
      color: 'gray',
      order: 16
    },
    {
      id: 'compass-third-party',
      name: '6c Reference Third Party Questi',
      title: { fr: 'Questions tiers', en: 'Third Party Questions' },
      description: { fr: 'Questions pour fournisseurs IA tiers', en: 'Questions for third-party AI vendors' },
      oodaPhase: null,
      icon: 'MessageSquare',
      color: 'gray',
      order: 17
    },
    {
      id: 'compass-use-cases',
      name: 'Notes Uses Cases',
      title: { fr: 'Cas d\'usage', en: 'Use Cases' },
      description: { fr: '30 scénarios de menaces avec scores de risque', en: '30 threat scenarios with risk scores' },
      oodaPhase: null,
      icon: 'List',
      color: 'indigo',
      order: 18
    }
  ];

  console.log(`✅ ${sheets.length} feuilles configurées`);
  return sheets;
}

// ============================================================
// GENERATE OUTPUT FILES
// ============================================================

function generateOutputFiles() {
  const useCases = transformUseCases();
  const sheets = transformSheets();

  // Statistics
  const stats = {
    totalUseCases: useCases.length,
    byRiskLevel: {
      critical: useCases.filter(uc => uc.riskLevel === 'critical').length,
      high: useCases.filter(uc => uc.riskLevel === 'high').length,
      moderate: useCases.filter(uc => uc.riskLevel === 'moderate').length,
      low: useCases.filter(uc => uc.riskLevel === 'low').length
    },
    byOODAPhase: {
      observe: useCases.filter(uc => uc.oodaPhase === 'observe').length,
      orient: useCases.filter(uc => uc.oodaPhase === 'orient').length,
      decide: useCases.filter(uc => uc.oodaPhase === 'decide').length,
      act: useCases.filter(uc => uc.oodaPhase === 'act').length
    },
    avgRiskScore: (useCases.reduce((sum, uc) => sum + uc.riskScore, 0) / useCases.length).toFixed(2),
    avgImpact: (useCases.reduce((sum, uc) => sum + uc.impact, 0) / useCases.length).toFixed(2),
    avgLikelihood: (useCases.reduce((sum, uc) => sum + uc.likelihood, 0) / useCases.length).toFixed(2)
  };

  // TypeScript content file
  const tsContent = `// ============================================================
// OWASP COMPASS Data - Auto-generated from Excel
// Generated: ${new Date().toISOString()}
// Source: Copy of ⭕ OWASP GenAI COMPASS v. 1.xlsx
// ============================================================

import {
  CompassUseCase,
  OWASPSheet,
  OODAPhase,
  RiskLevel,
  BilingualText
} from '../types';

// ============================================================
// USE CASES (30 threat scenarios with risk scores)
// ============================================================

export const compassUseCases: CompassUseCase[] = ${JSON.stringify(useCases, null, 2)};

// ============================================================
// SHEETS METADATA (19 Excel tabs)
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
  console.log(`\n📁 Fichier TypeScript créé: ${outputPath}`);

  // Write JSON for reference
  const jsonPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-data-transformed.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ useCases, sheets, stats }, null, 2), 'utf-8');
  console.log(`📁 Fichier JSON créé: ${jsonPath}`);

  // Summary
  console.log('\n✅ TRANSFORMATION TERMINÉE\n');
  console.log('📊 Statistiques:');
  console.log(`   • Cas d'usage: ${stats.totalUseCases}`);
  console.log(`   • Critical: ${stats.byRiskLevel.critical}`);
  console.log(`   • High: ${stats.byRiskLevel.high}`);
  console.log(`   • Moderate: ${stats.byRiskLevel.moderate}`);
  console.log(`   • Low: ${stats.byRiskLevel.low}`);
  console.log(`   • Score risque moyen: ${stats.avgRiskScore}`);
  console.log(`\n⚠️  Notes:`);
  console.log(`   • Les traductions EN sont marquées [TO_TRANSLATE]`);
  console.log(`   • Utiliser Gemini API dans Phase 2 pour traduction`);
  console.log(`   • Relations inter-modules à compléter`);
}

// ============================================================
// MAIN
// ============================================================

generateOutputFiles();
