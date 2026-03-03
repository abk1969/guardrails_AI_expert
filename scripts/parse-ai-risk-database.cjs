const fs = require('fs');
const path = require('path');

console.log('🔄 Parsing AI Risk Database...\n');

// Lire le fichier JSON extrait
const rawData = require('../data_ai_risk/extracted/ai_risk_database_v3.json');

// Ligne 1 contient les noms de colonnes
const headers = rawData[1];
console.log('📋 Headers found:', Object.keys(headers).length, 'columns');

// Mapping des colonnes (basé sur l'analyse du fichier)
const COL = {
  title: "This page is not mobile-friendly; please access on a computer if you can.",
  quickRef: "Watch video\nView explainer\nGive feedback",
  evId: "Updated: 03 December 2025",
  paperId: "__EMPTY",
  catId: "__EMPTY_1",
  subCatId: "__EMPTY_2",
  addEvId: "__EMPTY_3",
  categoryLevel: "__EMPTY_4",
  riskCategory: "This work is licensed under CC BY 4.0",
  riskSubcategory: "__EMPTY_5",
  description: "Please create a copy if you would like to use the filters and interact with the database",
  additionalEvidence: "__EMPTY_6",
  pDef: "__EMPTY_7",
  pAddEv: "__EMPTY_8",
  entity: "__EMPTY_9",
  intent: "__EMPTY_10",
  timing: "__EMPTY_11",
  domain: "__EMPTY_12",
  subdomain: "__EMPTY_13"
};

// Dictionnaires de traduction
const TRANSLATIONS = {
  entity: {
    '0 - AI': 'IA',
    '1 - Human': 'Humain',
    '2 - Other': 'Autre',
    '2 - AI': 'IA',
    '3 - Other': 'Autre',
    '4 - Not coded': 'Non codé',
    'AI': 'IA',
    'Human': 'Humain',
    'Other': 'Autre'
  },
  intent: {
    '1 - Intentional': 'Intentionnel',
    '2 - Unintentional': 'Non intentionnel',
    '3 - Other': 'Autre',
    '4 - Not coded': 'Non codé',
    'Intentional': 'Intentionnel',
    'Unintentional': 'Non intentionnel',
    'Other': 'Autre'
  },
  timing: {
    '1 - Pre-deployment': 'Pré-déploiement',
    '2 - Post-deployment': 'Post-déploiement',
    '3 - Other': 'Autre',
    '4 - Not coded': 'Non codé',
    'Pre-deployment': 'Pré-déploiement',
    'Post-deployment': 'Post-déploiement',
    'Other': 'Autre'
  },
  domain: {
    '1. Discrimination, Hate speech and Exclusion': 'Discrimination et Toxicité',
    '2. Information Hazards': 'Désinformation',
    '3. Misinformation Harms': 'Désinformation',
    '4. Malicious Uses': 'Acteurs Malveillants et Utilisation Abusive',
    '5. Human-Computer Interaction Harms': 'Interaction Humain-Ordinateur',
    '6. Socioeconomic and Environmental': 'Socioéconomique et Environnemental',
    '7. AI System Safety, Failures, and Limitations': 'Sécurité du Système IA, Défaillances et Limitations',
    '7. AI System Safety, Failures, & Limitations': 'Sécurité du Système IA, Défaillances et Limitations',
    '1. Discrimination & Toxicity': 'Discrimination et Toxicité',
    '2. Privacy & Security': 'Vie Privée et Sécurité',
    '3. Misinformation': 'Désinformation',
    '4. Malicious Actors & Misuse': 'Acteurs Malveillants et Utilisation Abusive',
    '5. Human-Computer Interaction': 'Interaction Humain-Ordinateur',
    '6. Socioeconomic & Environmental': 'Socioéconomique et Environnemental',
    '7. AI System Safety': 'Sécurité du Système IA, Défaillances et Limitations'
  }
};

function translateValue(category, value) {
  if (!value) return '';
  const trimmed = value.trim();
  if (TRANSLATIONS[category] && TRANSLATIONS[category][trimmed]) {
    return TRANSLATIONS[category][trimmed];
  }
  // Extraire le numéro au début si présent
  const match = trimmed.match(/^\d+\s*[-\.]\s*(.+)$/);
  if (match) {
    const extracted = match[1];
    if (TRANSLATIONS[category] && TRANSLATIONS[category][extracted]) {
      return TRANSLATIONS[category][extracted];
    }
  }
  return trimmed;
}

function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

// Parser les données
const parsedRisks = [];
let skippedRows = 0;
let processedRows = 0;

// Commencer à la ligne 2 (ligne 0 = metadata, ligne 1 = headers)
for (let i = 2; i < rawData.length; i++) {
  const row = rawData[i];

  // Vérifier si c'est une ligne de données valide
  const categoryLevel = row[COL.categoryLevel];

  // On ne garde que les lignes avec des risques réels (pas les headers de papier)
  if (!categoryLevel || categoryLevel === 'Paper' || !row[COL.description]) {
    skippedRows++;
    continue;
  }

  const evId = row[COL.evId] || '';
  const title = cleanText(row[COL.title]) || '';
  const quickRef = cleanText(row[COL.quickRef]) || '';
  const description = cleanText(row[COL.description]) || '';

  // Skip si pas de description
  if (!description || description.length < 10) {
    skippedRows++;
    continue;
  }

  // Extraire taxonomies
  const entity = translateValue('entity', row[COL.entity]);
  const intent = translateValue('intent', row[COL.intent]);
  const timing = translateValue('timing', row[COL.timing]);
  const domain = translateValue('domain', row[COL.domain]);
  const subdomain = cleanText(row[COL.subdomain]);

  // Extraire catégorie de risque
  const riskCategory = cleanText(row[COL.riskCategory]);
  const riskSubcategory = cleanText(row[COL.riskSubcategory]);

  // Générer ID unique
  const id = `RISK-${String(processedRows + 1).padStart(4, '0')}`;

  const risk = {
    id,
    evId,
    title: title || riskCategory || `Risque ${id}`,
    quickRef,
    description,

    // Catégorie du risque
    riskCategory,
    riskSubcategory,

    // Taxonomie Causale
    causal: {
      entity: entity || 'Autre',
      intentionality: intent || 'Autre',
      timing: timing || 'Autre'
    },

    // Taxonomie Domaine
    domain: {
      category: domain || 'Non classifié',
      subcategory: subdomain || ''
    },

    // Métadonnées
    source: quickRef,
    paperId: row[COL.paperId] || '',
    categoryLevel,
    additionalEvidence: cleanText(row[COL.additionalEvidence]) || '',

    // Pour recherche
    searchText: `${title} ${description} ${riskCategory}`.toLowerCase()
  };

  parsedRisks.push(risk);
  processedRows++;

  // Log progress every 100 rows
  if (processedRows % 100 === 0) {
    console.log(`✓ Processed ${processedRows} risks...`);
  }
}

console.log(`\n📊 Processing complete:`);
console.log(`   ✓ Processed: ${processedRows} risks`);
console.log(`   ⊘ Skipped: ${skippedRows} rows (headers/empty)`);
console.log(`   📈 Total rows: ${rawData.length}`);

// Calculer statistiques
const stats = {
  total: parsedRisks.length,
  byEntity: {},
  byIntentionality: {},
  byTiming: {},
  byDomain: {}
};

parsedRisks.forEach(risk => {
  // Stats entité
  stats.byEntity[risk.causal.entity] = (stats.byEntity[risk.causal.entity] || 0) + 1;

  // Stats intentionnalité
  stats.byIntentionality[risk.causal.intentionality] =
    (stats.byIntentionality[risk.causal.intentionality] || 0) + 1;

  // Stats timing
  stats.byTiming[risk.causal.timing] = (stats.byTiming[risk.causal.timing] || 0) + 1;

  // Stats domaine
  if (risk.domain.category) {
    stats.byDomain[risk.domain.category] = (stats.byDomain[risk.domain.category] || 0) + 1;
  }
});

console.log(`\n📈 Statistics:`);
console.log(`   Entité:`, stats.byEntity);
console.log(`   Intentionnalité:`, stats.byIntentionality);
console.log(`   Timing:`, stats.byTiming);
console.log(`   Domaine:`, stats.byDomain);

// Sauvegarder
const output = {
  metadata: {
    version: '4.0',
    lastUpdated: '2025-12-03',
    extractedAt: new Date().toISOString(),
    totalRisks: parsedRisks.length,
    language: 'fr',
    source: 'Copy of The AI Risk Repository V4_03_12_2025.xlsx',
    previousVersion: 'AI Risk Repository V3_26_03_2025.xlsx',
    license: 'CC BY 4.0'
  },
  statistics: stats,
  risks: parsedRisks
};

const outputPath = path.join(__dirname, '../data/aiRiskDatabaseParsed.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Success!`);
console.log(`   📁 Output: ${outputPath}`);
console.log(`   📊 ${parsedRisks.length} risks saved`);
console.log(`   💾 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

// Sauvegarder aussi une version compacte (sans espaces)
const compactPath = path.join(__dirname, '../data/aiRiskDatabaseParsed.compact.json');
fs.writeFileSync(compactPath, JSON.stringify(output));
console.log(`   💾 Compact: ${(fs.statSync(compactPath).size / 1024 / 1024).toFixed(2)} MB`);

// Créer un sample pour preview
const sample = {
  metadata: output.metadata,
  statistics: stats,
  sampleRisks: parsedRisks.slice(0, 10)
};

const samplePath = path.join(__dirname, '../data/aiRiskDatabaseSample.json');
fs.writeFileSync(samplePath, JSON.stringify(sample, null, 2));
console.log(`   📄 Sample (10 risks): ${samplePath}`);

console.log(`\n🎉 Parsing complete! You can now integrate this data.`);
