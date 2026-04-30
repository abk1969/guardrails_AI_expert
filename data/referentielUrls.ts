export interface ReferentielEntry {
  fullName: string;
  description?: string;
  sanction?: string;
  url: string;
}

const E = (entries: [string, ReferentielEntry][]): Record<string, ReferentielEntry> => Object.fromEntries(entries);

const aiAct: Record<string, ReferentielEntry> = E([
  ['AI Act art. 5', {
    fullName: 'Règlement (UE) 2024/1689 — Article 5 (Pratiques prohibées)',
    description: 'Manipulation subliminale, exploitation vulnérabilités, scoring social, prédiction criminalité, scraping massif facial, biométrie en temps réel public.',
    sanction: '35M€ ou 7% CA mondial (Art. 99(3))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 9', {
    fullName: 'Règlement (UE) 2024/1689 — Article 9 (Système de gestion des risques)',
    sanction: '15M€ / 3% CA (Art. 99(4))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 10', {
    fullName: 'AI Act — Article 10 (Données et gouvernance des données)',
    sanction: '15M€ / 3% CA (Art. 99(4))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 17', {
    fullName: 'AI Act — Article 17 (Système de gestion de la qualité)',
    sanction: '15M€ / 3% CA (Art. 99(4))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 27', {
    fullName: 'AI Act — Article 27 (Analyse d\'impact sur les droits fondamentaux — FRIA)',
    sanction: '15M€ / 3% CA (Art. 99(4))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 49', {
    fullName: 'AI Act — Article 49 (Enregistrement systèmes haut risque base UE)',
    sanction: '15M€ / 3% CA (Art. 99(4))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 50', {
    fullName: 'AI Act — Article 50 (Transparence : signaler IA, deepfakes, chatbots)',
    sanction: '15M€ / 3% CA (Art. 99(4))',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 73', {
    fullName: 'AI Act — Article 73 (Notification incidents graves)',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 99', {
    fullName: 'AI Act — Article 99 (Sanctions administratives)',
    sanction: '35M€/7% (Art. 5) ; 15M€/3% (autres) ; 7,5M€/1% (fausses infos)',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  }],
  ['AI Act art. 99(3)', { fullName: 'AI Act Art. 99(3) — Sanctions Art. 5 prohibitions', sanction: '35M€ ou 7% CA mondial', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' }],
  ['AI Act art. 99(4)', { fullName: 'AI Act Art. 99(4) — Sanctions générales', sanction: '15M€ ou 3% CA mondial', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' }],
  ['AI Act art. 99(5)', { fullName: 'AI Act Art. 99(5) — Fausses informations', sanction: '7,5M€ ou 1% CA mondial', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' }],
]);

const rgpd: Record<string, ReferentielEntry> = E([
  ['RGPD art. 5', { fullName: 'RGPD — Art. 5 (Principes de licéité, minimisation, exactitude...)', sanction: '4% CA / 20M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 6', { fullName: 'RGPD — Art. 6 (Bases légales du traitement)', sanction: '4% CA / 20M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 9', { fullName: 'RGPD — Art. 9 (Catégories particulières : santé, biométrie, génétique...)', sanction: '4% CA mondial / 20M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679#d1e2051-1-1' }],
  ['RGPD art. 22', { fullName: 'RGPD — Art. 22 (Décision automatisée + profilage)', sanction: '4% CA / 20M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 25', { fullName: 'RGPD — Art. 25 (Protection by design / by default)', sanction: '4% CA / 20M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 26', { fullName: 'RGPD — Art. 26 (Responsables conjoints du traitement)', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 30', { fullName: 'RGPD — Art. 30 (Registre des activités de traitement)', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 32', { fullName: 'RGPD — Art. 32 (Sécurité du traitement)', sanction: '2% CA / 10M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 33', { fullName: 'RGPD — Art. 33 (Notification de violation à la CNIL ≤ 72h)', sanction: '2% CA / 10M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 34', { fullName: 'RGPD — Art. 34 (Communication de violation aux personnes)', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 35', { fullName: 'RGPD — Art. 35 (AIPD/PIA — analyse d\'impact)', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 44', { fullName: 'RGPD — Art. 44 (Transferts hors UE — principe général)', sanction: '4% CA / 20M€', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
  ['RGPD art. 83', { fullName: 'RGPD — Art. 83 (Conditions générales pour amendes administratives)', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679' }],
]);

const dora: Record<string, ReferentielEntry> = E([
  ['DORA art. 5', { fullName: 'DORA — Art. 5 (Cadre de gestion des risques ICT)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  ['DORA art. 17', { fullName: 'DORA — Art. 17 (Processus de gestion des incidents ICT)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  ['DORA art. 23', { fullName: 'DORA — Art. 23 (Notification des incidents majeurs)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  ['DORA art. 24', { fullName: 'DORA — Art. 24 (Tests de résilience opérationnelle digitale)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  ['DORA art. 25', { fullName: 'DORA — Art. 25 (Tests d\'intrusion fondés sur la menace — TLPT)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  ['DORA art. 28', { fullName: 'DORA — Art. 28 (Gestion des risques tiers ICT)', sanction: 'Sanction ACPR jusqu\'à 2% CA + restriction', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  ['DORA art. 47', { fullName: 'DORA — Art. 47 (Sanctions administratives ACPR/AMF)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
]);

const nis2: Record<string, ReferentielEntry> = E([
  ['NIS2 art. 20', { fullName: 'NIS2 — Art. 20 (Gouvernance)', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' }],
  ['NIS2 art. 21', { fullName: 'NIS2 — Art. 21 (Mesures de gestion des risques)', sanction: '10M€ ou 2% CA pour entités essentielles', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' }],
  ['NIS2 art. 23', { fullName: 'NIS2 — Art. 23 (Obligations de notification)', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' }],
]);

const iso: Record<string, ReferentielEntry> = E([
  ['ISO 42001', { fullName: 'ISO/IEC 42001:2023 — AI Management System', description: '7 sections + Annex A (9 contrôles)', url: 'https://www.iso.org/standard/81230.html' }],
  ['ISO 42001:2023', { fullName: 'ISO/IEC 42001:2023 — AI Management System', url: 'https://www.iso.org/standard/81230.html' }],
  ['ISO 27001', { fullName: 'ISO/IEC 27001:2022 — Information Security Management System', url: 'https://www.iso.org/standard/27001' }],
  ['ISO 27001:2022', { fullName: 'ISO/IEC 27001:2022 — ISMS', url: 'https://www.iso.org/standard/27001' }],
  ['ISO 27090', { fullName: 'ISO/IEC 27090 — AI Cybersecurity (en développement)', url: 'https://www.iso.org/standard/56581.html' }],
  ['ISO 27701', { fullName: 'ISO/IEC 27701:2019 — Privacy Information Management', url: 'https://www.iso.org/standard/71670.html' }],
  ['ISO 27701:2019', { fullName: 'ISO/IEC 27701:2019 — PIMS', url: 'https://www.iso.org/standard/71670.html' }],
  ['ISO 22301', { fullName: 'ISO 22301 — Business Continuity Management', url: 'https://www.iso.org/standard/75106.html' }],
  ['ISO 27031', { fullName: 'ISO/IEC 27031 — ICT readiness for business continuity', url: 'https://www.iso.org/standard/80265.html' }],
  ['ISO 27036', { fullName: 'ISO/IEC 27036 — Supplier relationships security', url: 'https://www.iso.org/standard/59648.html' }],
]);

const owasp: Record<string, ReferentielEntry> = E([
  ['OWASP LLM Top 10', { fullName: 'OWASP Top 10 for LLM Applications 2025', url: 'https://genai.owasp.org/llm-top-10/' }],
  ['OWASP AISVS', { fullName: 'OWASP AI Security Verification Standard 1.0', url: 'https://github.com/OWASP/AISVS' }],
  ['OWASP Agentic Top 10', { fullName: 'OWASP Top 10 for Agentic Applications 2026', url: 'https://genai.owasp.org/' }],
  ['OWASP COMPASS', { fullName: 'OWASP GenAI COMPASS', url: 'https://genai.owasp.org/' }],
  ['OWASP DSGAI', { fullName: 'OWASP GenAI Data Security Risks and Mitigations 2026', url: 'https://genai.owasp.org/' }],
]);

const mitre: Record<string, ReferentielEntry> = E([
  ['MITRE ATLAS', { fullName: 'MITRE Adversarial Threat Landscape for AI Systems', url: 'https://atlas.mitre.org/' }],
  ['MITRE ATT&CK', { fullName: 'MITRE ATT&CK Framework', url: 'https://attack.mitre.org/' }],
]);

const nist: Record<string, ReferentielEntry> = E([
  ['NIST AI RMF', { fullName: 'NIST AI Risk Management Framework 1.0 (2023)', description: 'GOVERN — MAP — MEASURE — MANAGE', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }],
  ['NIST SP 800-226', { fullName: 'NIST SP 800-226 — Differential Privacy Guidelines', url: 'https://csrc.nist.gov/publications/detail/sp/800-226/draft' }],
  ['NIST SP 800-50r1', { fullName: 'NIST SP 800-50r1 — Cybersecurity Awareness/Training', url: 'https://csrc.nist.gov/pubs/sp/800/50/r1/final' }],
  ['NIST SP 800-218', { fullName: 'NIST SP 800-218 — SSDF Secure Software Development Framework', url: 'https://csrc.nist.gov/Projects/ssdf' }],
]);

const anssi: Record<string, ReferentielEntry> = E([
  ['ANSSI R34', { fullName: 'ANSSI R34 — Recommandations cloud', url: 'https://cyber.gouv.fr/' }],
  ['SecNumCloud', { fullName: 'SecNumCloud — Référentiel ANSSI 2024 v3.2', url: 'https://cyber.gouv.fr/secnumcloud-pour-les-fournisseurs-de-services-cloud' }],
  ['HDS', { fullName: 'Hébergeur Données Santé — Référentiel ANS v2024', url: 'https://esante.gouv.fr/produits-services/hds' }],
]);

const codeFr: Record<string, ReferentielEntry> = E([
  ['Code travail L.1331-1', { fullName: 'Code du travail — Art. L.1331-1 (Sanction disciplinaire)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006900817' }],
  ['Code travail L.1232-1', { fullName: 'Code du travail — Art. L.1232-1 (Cause licenciement)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901002' }],
  ['Code pénal art. 226-13', { fullName: 'Code pénal — Art. 226-13 (Violation secret professionnel)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006417944' }],
  ['Code pénal art. 226-16', { fullName: 'Code pénal — Art. 226-16 (Atteinte droits liés aux fichiers)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000028253991' }],
  ['Code pénal art. 323-1', { fullName: 'Code pénal — Art. 323-1 (Accès frauduleux STAD)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000030939438' }],
  ['Code monétaire L.612-39', { fullName: 'CMF — Art. L.612-39 (Sanctions ACPR jusqu\'à 100M€)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000028356552' }],
  ['Code santé L.1110-4', { fullName: 'CSP — Art. L.1110-4 (Secret médical)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041721915' }],
  ['Code santé L.1111-7', { fullName: 'CSP — Art. L.1111-7 (Droits patients accès dossier)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019956209' }],
  ['Code santé L.1111-8', { fullName: 'CSP — Art. L.1111-8 (Hébergement données santé)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037947819' }],
]);

const cjue: Record<string, ReferentielEntry> = E([
  ['Schrems II', { fullName: 'CJUE — Schrems II 2020 (Privacy Shield invalidé)', url: 'https://curia.europa.eu/juris/liste.jsf?num=C-311/18' }],
]);

export const REFERENTIELS: Record<string, ReferentielEntry> = {
  ...aiAct, ...rgpd, ...dora, ...nis2, ...iso, ...owasp, ...mitre, ...nist, ...anssi, ...codeFr, ...cjue,
};

const lookup: Record<string, ReferentielEntry> = {};
for (const [k, v] of Object.entries(REFERENTIELS)) lookup[k.toLowerCase().replace(/\s+/g, ' ').trim()] = v;

export function lookupReferentiel(rawCode: string): ReferentielEntry | null {
  const normalized = rawCode.toLowerCase().replace(/\s+/g, ' ').trim();
  if (lookup[normalized]) return lookup[normalized];
  for (const k of Object.keys(lookup)) {
    if (normalized.startsWith(k) || k.startsWith(normalized)) return lookup[k];
  }
  return null;
}
