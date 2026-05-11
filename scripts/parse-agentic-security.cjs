// ============================================================
// Agentic Security Analysis - Excel to JSON Extraction
// Source: 20260302_AgentsSecurityAnalyse_Enriched_V2.xlsx
// Parses the "Ref" sheet (33 threats, 9 categories) and "Maestro" sheet
// ============================================================

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

console.log('Parsing Agentic Security Analysis Excel...\n');

// ============================================================
// READ EXCEL
// ============================================================

const excelPath = path.join(__dirname, '..', 'data_ai_risk', '20260302_AgentsSecurityAnalyse_Enriched_V2.xlsx');
const wb = xlsx.readFile(excelPath);

// ============================================================
// PARSE MAESTRO SHEET
// ============================================================

function parseMaestroSheet() {
  const ws = wb.Sheets['Maestro'];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const layers = [];
  // Rows 3-9 contain layers 1-7, each starting with "N. Name (English) : Description"
  for (let i = 3; i <= 9; i++) {
    const text = String(rows[i][0] || '').trim();
    // Pattern: "1. Modèles fondationnels (Foundation Models) : Description..."
    const match = text.match(/^(\d+)\.\s+(.+?)\s*\((.+?)\)\s*:\s*(.+)$/);
    if (match) {
      layers.push({
        index: parseInt(match[1]),
        nameFr: match[2].trim(),
        name: match[3].trim(),
        description: match[4].trim()
      });
    }
  }

  console.log(`  Parsed ${layers.length} MAESTRO layers`);
  return layers;
}

// ============================================================
// PARSE REF SHEET
// ============================================================

function cleanText(text) {
  if (!text) return '';
  return String(text).replace(/\r/g, '').trim();
}

function cleanMultiline(text) {
  if (!text) return '';
  // Replace pipe-separated newlines from Excel with actual newlines
  return String(text).replace(/\r/g, '').trim();
}

// Extract GRC priority from MAESTRO column text
// Look for "Priorité : XXX" pattern to avoid false matches from other text
function extractGRCPriority(maestroText) {
  const text = String(maestroText || '');
  // Match the explicit priority line
  const priorityMatch = text.match(/Priorit[ée]\s*:\s*([^\n|]+)/i);
  if (priorityMatch) {
    const priorityText = priorityMatch[1].toUpperCase().trim();
    if (priorityText.startsWith('CRITIQUE')) return 'CRITIQUE';
    if (priorityText.startsWith('HAUTE') || priorityText.startsWith('ÉLEVÉ') || priorityText.startsWith('ELEVE') || priorityText.startsWith('\u00C9LEV\u00C9')) return 'HAUTE';
    if (priorityText.startsWith('MOYENNE') || priorityText.startsWith('MOYEN')) return 'MOYENNE';
    if (priorityText.startsWith('BASSE') || priorityText.startsWith('BAS') || priorityText.startsWith('FAIBLE')) return 'BASSE';
  }
  // Fallback: scan entire text
  const upper = text.toUpperCase();
  if (upper.includes('CRITIQUE')) return 'CRITIQUE';
  if (upper.includes('ÉLEVÉ') || upper.includes('ELEVE') || upper.includes('HAUTE')) return 'HAUTE';
  if (upper.includes('MOYEN')) return 'MOYENNE';
  return 'MOYENNE'; // default
}

// Extract MITRE ATLAS reference from MAESTRO column text
function extractMitreAtlasRef(maestroText) {
  const text = String(maestroText || '');
  const match = text.match(/MITRE\s+ATLAS\s*:\s*(T\d{4}(?:[–\-]T\d{4})?)/i);
  return match ? match[1] : undefined;
}

// Extract MAESTRO layers from the text
function extractMaestroLayers(maestroText) {
  const text = String(maestroText || '');
  // Pattern: "MAESTRO : Couche X (Name) + Couche Y (Name)"
  const layerMatches = text.match(/Couche\s+(\d+)\s*\([^)]+\)/g);
  const layers = layerMatches ? layerMatches.map(m => m.trim()) : [];
  if (text.includes('Cross-Layer')) {
    layers.push('Cross-Layer');
  }
  return layers.join(' + ') || text.split('\n')[0].trim();
}

// Parse mitigations: split by [SEC-*] codes
function parseMitigations(mitigationText) {
  if (!mitigationText) return [];
  const text = cleanMultiline(mitigationText);
  // Split by [SEC-XXX-NN] pattern
  const parts = text.split(/(?=\[SEC-)/);
  return parts
    .map(p => p.trim())
    .filter(p => p.length > 0 && p.startsWith('[SEC-'));
}

// Parse MIT AI Risk Repository references
function parseMITReferences(refText) {
  if (!refText) return [];
  const text = cleanMultiline(refText);
  // Split by newlines or "|" separator
  const parts = text.split(/[\n|]+/);
  return parts
    .map(p => p.trim())
    .filter(p => p.length > 0 && (p.startsWith('MIT') || p.startsWith('(')));
}

// Extract French and English threat names from Col1
// Actual format (newline-separated):
//   Line 1: "ASI01 / T06"             (OWASP code)
//   Line 2: "Agent Goal Hijacking"     (English name)
//   Line 3: "(Détournement d'Objectif)" (French name in parentheses)
function parseThreatColumn(col1Text) {
  const text = cleanMultiline(col1Text);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let owaspCode = '';
  let threatNameEn = '';
  let threatNameFr = '';

  if (lines.length >= 1) {
    owaspCode = lines[0].trim();
  }

  if (lines.length >= 2) {
    threatNameEn = lines[1].trim();
  }

  // Find the French name in parentheses (usually line 3)
  for (const line of lines) {
    const frMatch = line.match(/^\((.+)\)$/);
    if (frMatch) {
      threatNameFr = frMatch[1].trim();
      break;
    }
  }

  // Fallback: if only 2 lines, English name is also used as French
  if (!threatNameFr) {
    threatNameFr = threatNameEn || owaspCode;
  }

  return { owaspCode, threatNameEn: threatNameEn || owaspCode, threatNameFr };
}

// Extract category name and icon from Col0
// Pattern: "LOGIQUE & OBJECTIFS | (Le Cerveau)" or section header
function parseCategoryColumn(col0Text) {
  const text = cleanMultiline(col0Text);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let categoryName = '';
  let categoryIcon = '';

  // Look for the icon in parentheses
  for (const line of lines) {
    const iconMatch = line.match(/\(([^)]+)\)/);
    if (iconMatch) {
      categoryIcon = iconMatch[1].trim();
    }
  }

  // Category name is the main text without the icon
  const fullText = lines.join(' ');
  categoryName = fullText.replace(/\([^)]+\)/g, '').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();

  return { categoryName, categoryIcon };
}

function parseRefSheet() {
  const ws = wb.Sheets['Ref'];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // Section header rows contain "═══"
  // Data rows follow their section header
  const SECTION_HEADERS = {
    1: { name: 'Logique & Objectifs', icon: 'Le Cerveau', index: 1 },
    5: { name: 'Outils & Execution', icon: 'Les Mains', index: 2 },
    10: { name: 'Memoire & Contexte', icon: 'La Memoire', index: 3 },
    15: { name: 'Identite & Gouvernance', icon: 'Le Passeport', index: 4 },
    18: { name: 'Chaine d\'Approvisionnement', icon: 'L\'Ecosysteme', index: 5 },
    20: { name: 'Orchestration & Multi-Agents', icon: 'Le Chef d\'Orchestre', index: 6 },
    27: { name: 'Confiance Homme-Agent', icon: 'Le Facteur Humain', index: 7 },
    29: { name: 'Infrastructure & MCP', icon: 'L\'Infrastructure', index: 8 },
    34: { name: 'Risques Emergents MIT', icon: 'MIT 7.x', index: 9 }
  };

  const threats = [];
  const categories = {};
  let currentSection = null;
  let threatIndex = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col0 = String(row[0] || '');

    // Skip header row
    if (i === 0) continue;

    // Check if this is a section header
    if (col0.includes('\u2550\u2550\u2550') || col0.includes('===')) {
      // Find matching section
      if (SECTION_HEADERS[i]) {
        currentSection = SECTION_HEADERS[i];
      } else {
        // Try to detect section from content
        for (const [rowIdx, section] of Object.entries(SECTION_HEADERS)) {
          if (parseInt(rowIdx) === i) {
            currentSection = section;
            break;
          }
        }
      }
      continue;
    }

    // Skip empty rows, legend, and statistics rows
    if (!col0 || col0 === '' || i >= 39) continue;
    if (!currentSection) continue;

    // This must be a data row - check that Col1 has threat data
    const col1 = String(row[1] || '').trim();
    if (!col1) continue;

    threatIndex++;
    const id = `AST-${String(threatIndex).padStart(3, '0')}`;

    // Parse Col0 for category info (may refine section data)
    const { categoryName: rawCatName, categoryIcon: rawCatIcon } = parseCategoryColumn(col0);

    // Use section data as primary, col0 as fallback for icon
    const categoryName = currentSection.name;
    const categoryIcon = rawCatIcon || currentSection.icon;
    const categoryIndex = currentSection.index;

    // Parse Col1 for threat name and OWASP code
    const { owaspCode, threatNameEn, threatNameFr } = parseThreatColumn(col1);

    // Parse remaining columns
    const riskDescription = cleanMultiline(String(row[2] || ''));
    const attackMechanism = cleanMultiline(String(row[3] || ''));
    const impactAndExamples = cleanMultiline(String(row[4] || ''));
    const mitigations = parseMitigations(String(row[5] || ''));
    const mitRiskReferences = parseMITReferences(String(row[6] || ''));
    const maestroRaw = cleanMultiline(String(row[7] || ''));
    const maestroLayer = extractMaestroLayers(maestroRaw);
    const grcPriority = extractGRCPriority(maestroRaw);
    const mitreAtlasRef = extractMitreAtlasRef(maestroRaw);

    const threat = {
      id,
      category: categoryName,
      categoryIcon,
      categoryIndex,
      threatName: threatNameFr,
      threatNameEn,
      owaspCode,
      riskDescription,
      attackMechanism,
      impactAndExamples,
      mitigations,
      mitRiskReferences,
      maestroLayer,
      grcPriority
    };

    if (mitreAtlasRef) {
      threat.mitreAtlasRef = mitreAtlasRef;
    }

    threats.push(threat);

    // Track categories
    if (!categories[categoryName]) {
      categories[categoryName] = {
        index: categoryIndex,
        name: categoryName,
        icon: categoryIcon,
        threatCount: 0,
        threats: []
      };
    }
    categories[categoryName].threatCount++;
    categories[categoryName].threats.push(id);
  }

  console.log(`  Parsed ${threats.length} threats across ${Object.keys(categories).length} categories`);
  return { threats, categories: Object.values(categories) };
}

// ============================================================
// COMPUTE STATISTICS
// ============================================================

function computeStatistics(threats) {
  const stats = {
    totalThreats: threats.length,
    byCategory: {},
    byPriority: { CRITIQUE: 0, HAUTE: 0, MOYENNE: 0, BASSE: 0 },
    byMaestroLayer: {}
  };

  threats.forEach(t => {
    // By category
    stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;

    // By priority
    stats.byPriority[t.grcPriority] = (stats.byPriority[t.grcPriority] || 0) + 1;

    // By MAESTRO layer - extract individual layers
    const layerMatches = t.maestroLayer.match(/Couche\s+(\d+)/g);
    if (layerMatches) {
      layerMatches.forEach(l => {
        stats.byMaestroLayer[l] = (stats.byMaestroLayer[l] || 0) + 1;
      });
    }
    if (t.maestroLayer.includes('Cross-Layer')) {
      stats.byMaestroLayer['Cross-Layer'] = (stats.byMaestroLayer['Cross-Layer'] || 0) + 1;
    }
  });

  return stats;
}

// ============================================================
// MAIN
// ============================================================

const maestroLayers = parseMaestroSheet();
const { threats, categories } = parseRefSheet();
const statistics = computeStatistics(threats);

// Print summary
console.log('\nStatistics:');
console.log(`  Total threats: ${statistics.totalThreats}`);
console.log('  By category:');
Object.entries(statistics.byCategory).forEach(([cat, count]) => {
  console.log(`    ${cat}: ${count}`);
});
console.log('  By priority:');
Object.entries(statistics.byPriority).forEach(([pri, count]) => {
  console.log(`    ${pri}: ${count}`);
});
console.log('  By MAESTRO layer:');
Object.entries(statistics.byMaestroLayer).forEach(([layer, count]) => {
  console.log(`    ${layer}: ${count}`);
});

// ============================================================
// OUTPUT
// ============================================================

const output = {
  metadata: {
    version: '2.0',
    source: '20260302_AgentsSecurityAnalyse_Enriched_V2.xlsx',
    extractedAt: new Date().toISOString(),
    totalThreats: threats.length,
    totalCategories: categories.length,
    language: 'fr'
  },
  maestroLayers,
  threats,
  categories,
  statistics
};

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'data_ai_risk', 'extracted');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'agentic_security_analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`\nJSON output: ${outputPath}`);
console.log(`  File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

console.log('\nExtraction complete!');
