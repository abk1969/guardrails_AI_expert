import * as XLSX from 'xlsx';
import { AIPolicyChapter, AIPolicyRule, RiskScenario } from '../types/policy';

interface FlatSiaRow {
  id: string;
  chapterNumber: string;
  chapterTitle: string;
  ruleText: string;
  sourcesReferentials: string;
  testableControl: string;
  tier: string;
  raci: string;
  reviewFrequency: string;
  status: string;
  notes: string;
  scenariosCount: number;
}

interface DetailedSiaRow extends FlatSiaRow {
  associatedThreat: string;
  associatedRisk: string;
  implementationGuide: string;
  testingGuide: string;
  implementationDetails: string;
}

interface ScenarioRow {
  siaId: string;
  chapterNumber: string;
  chapterTitle: string;
  scenarioIndex: number;
  scenarioTitle: string;
  description: string;
  threatActor: string;
  attackVector: string;
  mitigation: string;
  impactConfidentiality: string;
  impactIntegrity: string;
  impactAvailability: string;
  impactFinancial: string;
  impactReputational: string;
  impactOperational: string;
  impactStrategic: string;
  mappingOwaspLlm: string;
  mappingOwaspAgentic: string;
  mappingMitreAtlas: string;
  mappingNistRmf: string;
}

function flattenRules(policyData: AIPolicyChapter[]): AIPolicyRule[] {
  const rules: AIPolicyRule[] = [];
  for (const chapter of policyData) {
    for (const section of chapter.sections) {
      for (const item of section.content) {
        if (item.type === 'rule') rules.push(item.rule);
      }
    }
  }
  return rules;
}

function buildSyntheseRows(rules: AIPolicyRule[]): FlatSiaRow[] {
  return rules.map(r => ({
    id: r.id,
    chapterNumber: r.chapterNumber || '',
    chapterTitle: r.chapterTitle || '',
    ruleText: r.ruleText,
    sourcesReferentials: r.sourcesReferentials || '',
    testableControl: r.testableControl || '',
    tier: r.tier || '',
    raci: r.raci || '',
    reviewFrequency: r.reviewFrequency || '',
    status: r.status,
    notes: r.notes || '',
    scenariosCount: r.riskScenarios?.length || 0,
  }));
}

function buildDetailRows(rules: AIPolicyRule[]): DetailedSiaRow[] {
  return rules.map(r => ({
    id: r.id,
    chapterNumber: r.chapterNumber || '',
    chapterTitle: r.chapterTitle || '',
    ruleText: r.ruleText,
    sourcesReferentials: r.sourcesReferentials || '',
    testableControl: r.testableControl || '',
    tier: r.tier || '',
    raci: r.raci || '',
    reviewFrequency: r.reviewFrequency || '',
    status: r.status,
    notes: r.notes || '',
    scenariosCount: r.riskScenarios?.length || 0,
    associatedThreat: r.associatedThreat || '',
    associatedRisk: r.associatedRisk || '',
    implementationGuide: r.implementationGuide || '',
    testingGuide: r.testingGuide || '',
    implementationDetails: r.implementationDetails || '',
  }));
}

function buildScenarioRows(rules: AIPolicyRule[]): ScenarioRow[] {
  const rows: ScenarioRow[] = [];
  for (const r of rules) {
    if (!r.riskScenarios) continue;
    r.riskScenarios.forEach((s: RiskScenario, idx: number) => {
      rows.push({
        siaId: r.id,
        chapterNumber: r.chapterNumber || '',
        chapterTitle: r.chapterTitle || '',
        scenarioIndex: idx + 1,
        scenarioTitle: s.title,
        description: s.description,
        threatActor: s.threatActor,
        attackVector: s.attackVector,
        mitigation: s.mitigation,
        impactConfidentiality: s.impact?.confidentiality || '',
        impactIntegrity: s.impact?.integrity || '',
        impactAvailability: s.impact?.availability || '',
        impactFinancial: s.impact?.financial || '',
        impactReputational: s.impact?.reputational || '',
        impactOperational: s.impact?.operational || '',
        impactStrategic: s.impact?.strategic || '',
        mappingOwaspLlm: s.mappings?.owaspLlm || '',
        mappingOwaspAgentic: s.mappings?.owaspAgentic || '',
        mappingMitreAtlas: s.mappings?.mitreAtlas || '',
        mappingNistRmf: s.mappings?.nistRmf || '',
      });
    });
  }
  return rows;
}

function buildStatistics(rules: AIPolicyRule[]) {
  const byChapter = new Map<string, { number: string; title: string; total: number; implemented: number; inProgress: number; notApplicable: number; notImplemented: number }>();
  let totalScenarios = 0;
  let totalEnriched = 0;

  for (const r of rules) {
    const key = r.chapterNumber || 'unknown';
    const entry = byChapter.get(key) || {
      number: r.chapterNumber || '',
      title: r.chapterTitle || '',
      total: 0,
      implemented: 0,
      inProgress: 0,
      notApplicable: 0,
      notImplemented: 0,
    };
    entry.total++;
    if (r.status === 'Implémentée') entry.implemented++;
    else if (r.status === 'En cours') entry.inProgress++;
    else if (r.status === 'Non applicable') entry.notApplicable++;
    else entry.notImplemented++;
    byChapter.set(key, entry);

    if (r.riskScenarios?.length) totalScenarios += r.riskScenarios.length;
    if ((r.associatedThreat?.length || 0) > 50) totalEnriched++;
  }

  const chapters = Array.from(byChapter.values()).sort((a, b) => Number(a.number) - Number(b.number));

  const summary = [
    { metric: 'Total SIA', value: rules.length },
    { metric: 'SIA enrichis (full depth)', value: totalEnriched },
    { metric: 'Scénarios de risque', value: totalScenarios },
    { metric: 'Chapitres', value: chapters.length },
    { metric: 'Implémentées', value: chapters.reduce((s, c) => s + c.implemented, 0) },
    { metric: 'En cours', value: chapters.reduce((s, c) => s + c.inProgress, 0) },
    { metric: 'Non applicable', value: chapters.reduce((s, c) => s + c.notApplicable, 0) },
    { metric: 'Non implémentées', value: chapters.reduce((s, c) => s + c.notImplemented, 0) },
  ];

  return { chapters, summary };
}

function buildReferentielsSheet() {
  return [
    { code: 'AI Act', fullName: 'EU Regulation 2024/1689', notes: 'Système IA — pratiques prohibées (Art. 5), risk management (Art. 9), data governance (Art. 10), AI literacy (Art. 4), sanctions Art. 99 (15M€/3% ou 35M€/7%)' },
    { code: 'RGPD', fullName: 'EU Regulation 2016/679 GDPR', notes: 'Art. 9 santé, 25 by design, 32 sécurité, 35 AIPD/PIA, 26 responsabilité conjointe, 44-49 transferts hors UE (Schrems II), 33-34 notification 72h' },
    { code: 'DORA', fullName: 'EU Regulation 2022/2554', notes: 'ICT risk management ; art. 17-23 incident reporting ; art. 24-27 TLPT ; art. 28 third-party risk ; art. 47 sanctions ACPR' },
    { code: 'NIS2', fullName: 'EU Directive 2022/2555', notes: 'Art. 21 measures, 23 notifications. Sanctions 10M€ / 2% CA pour entités essentielles' },
    { code: 'ISO 42001:2023', fullName: 'AI Management System', notes: '7 sections + Annex A (9 contrôles). §6.1.4 data quality, §7.5 documentation, §8.3 controls implementation, §9.3 management review' },
    { code: 'ISO 27001:2022', fullName: 'ISMS', notes: '§A.5.10 inventory, §A.6.3 awareness, §A.8.3 access to networks, §A.8.24 cryptography, §9.2 internal audit' },
    { code: 'ISO 27701:2019', fullName: 'PIMS Privacy Information Management', notes: 'Extension ISO 27001 pour vie privée' },
    { code: 'OWASP AISVS', fullName: 'AI Security Verification Standard 1.0', notes: 'L1/L2/L3. Ch. 1, 3, 5, 6, 9, 10, 12 référencés' },
    { code: 'OWASP LLM Top 10', fullName: 'Top 10 for LLM Applications 2025', notes: 'LLM01-LLM10 mapping' },
    { code: 'OWASP Agentic Top 10', fullName: 'Top 10 for Agentic Applications 2026', notes: 'A01-A10' },
    { code: 'MITRE ATLAS', fullName: 'Adversarial Threat Landscape for AI', notes: 'TTPs : T1213, T1530, T1551, T1565, T1606, AML.TA0002, AML.T0084' },
    { code: 'NIST AI RMF', fullName: 'AI Risk Management Framework 1.0 (2023)', notes: 'GOVERN, MAP, MEASURE, MANAGE' },
    { code: 'NIST SP 800-226', fullName: 'Differential Privacy Guidelines', notes: 'Privacy budget epsilon, composition theorem' },
    { code: 'ANSSI', fullName: 'Agence nationale de la sécurité des systèmes d\'information', notes: 'R34 cloud souverain, RGS cryptographie, SecNumCloud référentiel 2024 v3.2, doctrine Cloud au Centre' },
    { code: 'CLUSIF', fullName: 'Club de la Sécurité de l\'Information Français', notes: 'Modèle PSSI IA fév 2025, baromètre cybersécurité' },
    { code: 'CESIN', fullName: 'Club des Experts Sécurité Information', notes: 'Baromètre annuel cyber 2026' },
    { code: 'Code travail', fullName: 'Code du Travail français', notes: 'L.1331-1 sanctions, L.1232-1 licenciement, L.1332-1 à L.1332-5 procédure disciplinaire, L.2312-8 CSE' },
    { code: 'Code pénal', fullName: 'Code pénal français', notes: 'Art. 226-13/16/17/18, 323-1/2/3, 313-1' },
    { code: 'Code civil', fullName: 'Code civil français', notes: 'Art. 1240, 1241, 1242, 1245 responsabilité' },
    { code: 'Code monétaire', fullName: 'Code monétaire et financier', notes: 'L.612-39 sanctions ACPR jusqu\'à 100M€' },
    { code: 'Code santé', fullName: 'Code de la santé publique', notes: 'L.1110-4 secret médical, L.1111-7 droits patients, L.1111-8 hébergement' },
    { code: 'HDS', fullName: 'Hébergeur Données Santé', notes: 'Référentiel ANS v2024 (6 prestations)' },
    { code: 'SecNumCloud', fullName: 'Cloud souverain ANSSI', notes: 'Référentiel ANSSI 2024 v3.2' },
  ];
}

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map(w => ({ wch: w }));
}

function setFreezeHeader(ws: XLSX.WorkSheet) {
  ws['!freeze'] = { ySplit: 1 };
  (ws as any)['!views'] = [{ state: 'frozen', ySplit: 1 }];
}

export interface ExportMetadata {
  version: string;
  exportedAt: string;
  totalRules: number;
}

export function exportPolicyToExcel(policyData: AIPolicyChapter[], metadata: ExportMetadata): void {
  const rules = flattenRules(policyData);
  const synthese = buildSyntheseRows(rules);
  const detail = buildDetailRows(rules);
  const scenarios = buildScenarioRows(rules);
  const stats = buildStatistics(rules);
  const referentiels = buildReferentielsSheet();

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: `PSSI IA v${metadata.version} — Export ${metadata.totalRules} SIA`,
    Subject: 'Politique de Sécurité des Systèmes IA',
    Author: 'AI Risk Manager',
    CreatedDate: new Date(metadata.exportedAt),
  };

  const metaRows = [
    { Champ: 'Document', Valeur: `PSSI IA v${metadata.version}` },
    { Champ: 'Total SIA', Valeur: metadata.totalRules },
    { Champ: 'Date export', Valeur: metadata.exportedAt },
    { Champ: 'Source', Valeur: 'AI Risk Manager — Module Politique IA (SIA)' },
    { Champ: 'Pipeline', Valeur: 'pssi-ia-v3-enrichments.json → generate-pssi-v3-artifacts.cjs → pssiIaV3.generated.ts' },
    { Champ: '', Valeur: '' },
    { Champ: 'Feuilles incluses', Valeur: '' },
    { Champ: '  1. Métadonnées', Valeur: 'Cette feuille' },
    { Champ: '  2. Synthèse', Valeur: `${synthese.length} SIA — vue compacte (sans contenu enrichi)` },
    { Champ: '  3. Détail', Valeur: `${detail.length} SIA — contenu complet (menaces, risques, implémentation, tests)` },
    { Champ: '  4. Scénarios', Valeur: `${scenarios.length} scénarios de risque — impact 4 dimensions + mappings référentiels` },
    { Champ: '  5. Statistiques', Valeur: `Synthèse + ventilation par chapitre (${stats.chapters.length} chapitres)` },
    { Champ: '  6. Référentiels', Valeur: `${referentiels.length} référentiels normatifs et réglementaires sourcés` },
    { Champ: '', Valeur: '' },
    { Champ: 'Tiers d\'amendes AI Act Art. 99', Valeur: '' },
    { Champ: '  Art. 99(3)', Valeur: '35M€ ou 7% CA mondial — Art. 5 pratiques prohibées' },
    { Champ: '  Art. 99(4)', Valeur: '15M€ ou 3% CA mondial — Art. 16, 22-27, 49, 50' },
    { Champ: '  Art. 99(5)', Valeur: '7,5M€ ou 1% CA mondial — fausses informations' },
  ];
  const wsMeta = XLSX.utils.json_to_sheet(metaRows);
  setColumnWidths(wsMeta, [40, 90]);
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Métadonnées');

  const wsSynthese = XLSX.utils.json_to_sheet(synthese, {
    header: ['id', 'chapterNumber', 'chapterTitle', 'ruleText', 'tier', 'raci', 'reviewFrequency', 'sourcesReferentials', 'testableControl', 'status', 'scenariosCount', 'notes'],
  });
  setColumnWidths(wsSynthese, [10, 5, 35, 80, 18, 50, 25, 50, 60, 18, 8, 30]);
  setFreezeHeader(wsSynthese);
  XLSX.utils.book_append_sheet(wb, wsSynthese, 'Synthèse');

  const wsDetail = XLSX.utils.json_to_sheet(detail, {
    header: ['id', 'chapterNumber', 'chapterTitle', 'ruleText', 'tier', 'raci', 'reviewFrequency', 'sourcesReferentials', 'testableControl', 'implementationDetails', 'associatedThreat', 'associatedRisk', 'implementationGuide', 'testingGuide', 'status', 'notes', 'scenariosCount'],
  });
  setColumnWidths(wsDetail, [10, 5, 30, 60, 18, 40, 25, 40, 50, 50, 80, 80, 100, 80, 18, 25, 8]);
  setFreezeHeader(wsDetail);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Détail');

  const wsScenarios = XLSX.utils.json_to_sheet(scenarios, {
    header: ['siaId', 'chapterNumber', 'chapterTitle', 'scenarioIndex', 'scenarioTitle', 'description', 'threatActor', 'attackVector', 'mitigation', 'impactConfidentiality', 'impactIntegrity', 'impactAvailability', 'impactFinancial', 'impactReputational', 'impactOperational', 'impactStrategic', 'mappingOwaspLlm', 'mappingOwaspAgentic', 'mappingMitreAtlas', 'mappingNistRmf'],
  });
  setColumnWidths(wsScenarios, [10, 5, 30, 8, 60, 80, 30, 30, 40, 30, 30, 30, 40, 40, 40, 40, 20, 20, 20, 20]);
  setFreezeHeader(wsScenarios);
  XLSX.utils.book_append_sheet(wb, wsScenarios, 'Scénarios');

  const wsStatsSummary = XLSX.utils.json_to_sheet(stats.summary);
  setColumnWidths(wsStatsSummary, [35, 15]);
  setFreezeHeader(wsStatsSummary);
  XLSX.utils.book_append_sheet(wb, wsStatsSummary, 'Statistiques');

  const wsStatsChapter = XLSX.utils.json_to_sheet(stats.chapters);
  setColumnWidths(wsStatsChapter, [5, 50, 8, 14, 10, 16, 18]);
  setFreezeHeader(wsStatsChapter);
  XLSX.utils.book_append_sheet(wb, wsStatsChapter, 'Stats par chapitre');

  const wsRef = XLSX.utils.json_to_sheet(referentiels);
  setColumnWidths(wsRef, [22, 45, 100]);
  setFreezeHeader(wsRef);
  XLSX.utils.book_append_sheet(wb, wsRef, 'Référentiels');

  const today = new Date().toISOString().split('T')[0];
  const filename = `PSSI_IA_v${metadata.version}_${metadata.totalRules}_SIA_${today}.xlsx`;
  XLSX.writeFile(wb, filename);
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(';') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const headerLine = headers.map(csvEscape).join(';');
  const dataLines = rows.map(row => headers.map(h => csvEscape(row[h])).join(';'));
  return '﻿' + [headerLine, ...dataLines].join('\r\n');
}

export function exportPolicyToCsv(policyData: AIPolicyChapter[], metadata: ExportMetadata): void {
  const rules = flattenRules(policyData);
  const detail = buildDetailRows(rules);
  const headers = [
    'id', 'chapterNumber', 'chapterTitle', 'ruleText',
    'tier', 'raci', 'reviewFrequency',
    'sourcesReferentials', 'testableControl', 'implementationDetails',
    'associatedThreat', 'associatedRisk', 'implementationGuide', 'testingGuide',
    'status', 'notes', 'scenariosCount',
  ];
  const csv = rowsToCsv(detail as unknown as Record<string, unknown>[], headers);
  const today = new Date().toISOString().split('T')[0];
  const filename = `PSSI_IA_v${metadata.version}_${metadata.totalRules}_SIA_${today}.csv`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
