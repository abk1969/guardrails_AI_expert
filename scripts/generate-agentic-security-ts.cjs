// ============================================================
// Generate agenticSecurityContent.ts from extracted JSON data
// ============================================================

const fs = require('fs');
const path = require('path');

const data = require('../data_ai_risk/extracted/agentic_security_analysis.json');

const tsContent = `// ============================================================
// Agentic Security Analysis Data - Auto-generated
// Generated: ${new Date().toISOString()}
// Source: 20260302_AgentsSecurityAnalyse_Enriched_V2.xlsx
// 29 threats across 9 categories with MAESTRO framework mapping
// ============================================================

import type {
  AgenticSecurityThreat,
  AgenticSecurityCategory,
  MaestroLayer,
  AgenticSecurityStatistics,
  GRCPriority
} from '../types/agentic-security';

// ============================================================
// THREATS (29 agentic AI security threats)
// ============================================================

export const agenticSecurityThreats: AgenticSecurityThreat[] = ${JSON.stringify(data.threats, null, 2)};

// ============================================================
// CATEGORIES (9 threat categories)
// ============================================================

export const agenticSecurityCategories: AgenticSecurityCategory[] = ${JSON.stringify(data.categories, null, 2)};

// ============================================================
// MAESTRO FRAMEWORK (7 layers)
// ============================================================

export const maestroFramework: MaestroLayer[] = ${JSON.stringify(data.maestroLayers, null, 2)};

// ============================================================
// STATISTICS
// ============================================================

export const agenticSecurityStatistics: AgenticSecurityStatistics = ${JSON.stringify(data.statistics, null, 2)};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getThreatById(id: string): AgenticSecurityThreat | undefined {
  return agenticSecurityThreats.find(t => t.id === id);
}

export function getThreatsByCategory(category: string): AgenticSecurityThreat[] {
  return agenticSecurityThreats.filter(t => t.category === category);
}

export function getThreatsByPriority(priority: GRCPriority): AgenticSecurityThreat[] {
  return agenticSecurityThreats.filter(t => t.grcPriority === priority);
}

export function getThreatsByMaestroLayer(layerNumber: number): AgenticSecurityThreat[] {
  const pattern = \`Couche \${layerNumber}\`;
  return agenticSecurityThreats.filter(t => t.maestroLayer.includes(pattern));
}

export function searchThreats(query: string): AgenticSecurityThreat[] {
  const q = query.toLowerCase();
  return agenticSecurityThreats.filter(t =>
    t.threatName.toLowerCase().includes(q) ||
    t.threatNameEn.toLowerCase().includes(q) ||
    t.owaspCode.toLowerCase().includes(q) ||
    t.riskDescription.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );
}
`;

const outputPath = path.join(__dirname, '..', 'data', 'agenticSecurityContent.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log('TypeScript data file created:', outputPath);
console.log('  Threats:', data.threats.length);
console.log('  Categories:', data.categories.length);
console.log('  MAESTRO layers:', data.maestroLayers.length);
console.log('  File size:', (fs.statSync(outputPath).size / 1024).toFixed(1), 'KB');
