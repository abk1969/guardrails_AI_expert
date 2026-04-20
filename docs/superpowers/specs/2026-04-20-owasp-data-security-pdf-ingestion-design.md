# Design Spec — Ingestion intégrale du PDF OWASP GenAI Data Security 2026 v1.0

**Date** : 2026-04-20
**Auteur** : Abbas BENTERKI (via Claude)
**Module cible** : Référentiels → OWASP COMPASS + Wiki Red Teamer
**PDF source** : `data_ai_risk/OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf`

---

## 1. Contexte et objectif

Le projet AI Risk Manager expose 7 documents OWASP via un registre centralisé `data/pdfReferences.ts` consommé par le module Wiki Red Teamer. Le module OWASP COMPASS (`data/compassContent.ts`) est indépendant et ne lie aucun PDF externe aujourd'hui.

**Objectif** : intégrer le 8ᵉ document OWASP (« GenAI Data Security Risks and Mitigations 2026 v1.0 », 103 pages, 21 risques DSGAI) avec :

- extraction **rigoureuse et intégrale** du contenu via un script CJS rejouable ;
- référencement dans le registre standard `pdfReferences.ts` (nouvelle catégorie `data-security`) ;
- enrichissement du module COMPASS avec un panneau « Références OWASP liées » (dans le modal use-case) ET une section globale « Documents OWASP de référence » (en tête du module) ;
- intégration dans le Wiki Red Teamer suivant le pattern des 7 entrées existantes.

---

## 2. Inventaire intégral du PDF source

**Structure vérifiée (3 897 lignes texte extraites, 103 pages PDF) :**

| Pages | Section | Intégration |
|-------|---------|-------------|
| 1-2 | Couverture + Licence CC BY-SA 4.0 | Attribution dans le champ `url` + note license dans `summary` |
| 3-4 | Table of Contents | Non intégré (redondant avec `keyItems`) |
| 5 | Document Scope and Objectives | Synthétisé dans `summary` |
| 6-8 | What is Data Security in the GenAI Context? | Synthétisé dans `summary` + `detailedSections.overview` du document-level |
| 9-12 | **DSPM for Gen AI (AI-DSPM)** — 13 capability categories | Entrée séparée `keyItems[0]` : `id: 'dspm-genai'`, code `DSPM` |
| 13-14 | GenAI Data Risks (introduction taxonomie) | Intro du `summary` |
| 15-19 | **DSGAI01 — Sensitive Data Leakage** | `keyItems[1]` avec `detailedSections` complet |
| 20-23 | **DSGAI02 — Agent Identity & Credential Exposure** | `keyItems[2]` |
| 24-27 | **DSGAI03 — Shadow AI & Unsanctioned Data Flows** | `keyItems[3]` |
| 28-33 | **DSGAI04 — Data, Model & Artifact Poisoning** | `keyItems[4]` |
| 34-36 | **DSGAI05 — Data Integrity & Validation Failures** | `keyItems[5]` |
| 37-41 | **DSGAI06 — Tool, Plugin & Agent Data Exchange Risks** | `keyItems[6]` |
| 42-45 | **DSGAI07 — Data Governance, Lifecycle & Classification** | `keyItems[7]` |
| 46-49 | **DSGAI08 — Non-Compliance & Regulatory Violations** | `keyItems[8]` |
| 50-53 | **DSGAI09 — Multimodal Capture & Cross-Channel Leakage** | `keyItems[9]` |
| 54-58 | **DSGAI10 — Synthetic Data, Anonymization & Transformation Pitfalls** | `keyItems[10]` |
| 59-62 | **DSGAI11 — Cross-Context & Multi-User Conversation Bleed** | `keyItems[11]` |
| 63-66 | **DSGAI12 — Unsafe Natural-Language Data Gateways (LLM-to-SQL/Graph)** | `keyItems[12]` |
| 67-70 | **DSGAI13 — Vector Store Platform Data Security** | `keyItems[13]` |
| 71-73 | **DSGAI14 — Excessive Telemetry & Monitoring Leakage** | `keyItems[14]` |
| 74-77 | **DSGAI15 — Over-Broad Context Windows & Prompt Over-Sharing** | `keyItems[15]` |
| 78-81 | **DSGAI16 — Endpoint & Browser Assistant Overreach** | `keyItems[16]` |
| 82-85 | **DSGAI17 — Data Availability & Resilience Failures** | `keyItems[17]` |
| 86-89 | **DSGAI18 — Inference & Data Reconstruction** | `keyItems[18]` |
| 90-92 | **DSGAI19 — Human-in-the-Loop & Labeler Overexposure** | `keyItems[19]` |
| 93-95 | **DSGAI20 — Model Exfiltration & IP Replication** | `keyItems[20]` |
| 96-100 | **DSGAI21 — Disinformation & Integrity Attacks via Data Poisoning** | `keyItems[21]` |
| 101 | Acknowledgements (auteurs, contributeurs, reviewers) | Synthétisé dans `detailedSections.acknowledgements` |
| 102-103 | Sponsors + Supporters | Non intégré (dynamique côté OWASP) |

**Total** : **22 `keyItems`** (DSPM + 21 DSGAI).

### 2.1 Structure interne commune à chaque DSGAI

1. Titre : `DSGAI0X -- <Title>`
2. **How the attack unfolds** → `detailedSections.overview`
3. **Attacker Capabilities** → `detailedSections.attackVectors[]`
4. **Illustrative scenario** → `detailedSections.examples[]`
5. **Impact** (bullet points) → `detailedSections.impacts[]`
6. **Mitigations** (bullet points généraux) → `detailedSections.mitigations[]`
7. **Tier 1 (foundational) / Tier 2 (hardening) / Tier 3 (advanced)** → `detailedSections.mitigationTiers: { tier1: string[]; tier2: string[]; tier3: string[] }`
8. **Known CVEs / exploits** → `detailedSections.knownCVEs[]`
9. **References** → `detailedSections.references[]`

### 2.2 Anomalies détectées (à documenter)

Le PDF contient 5 références croisées **orphelines** vers des DSGAI inexistants (résidus d'une renumérotation) :

| Ligne | Contenu | Action |
|-------|---------|--------|
| 162 | « DSGAI01, DSGAI19, DSGAI21, **DSGAI25** » | Conservé tel quel, noter dans `detailedSections.editorialNotes` |
| 203 | « (DSGAI01–**DSGAI25**) » | Idem |
| 1179 | « see **DSGAI26** (Disinformation & Integrity Attacks via Data Poisoning) » → en réalité **DSGAI21** | Corriger l'ancre mentalement, mais **ne pas modifier** le texte source |
| 3803 | « see **DSGAI13** (Synthetic Data, Anonymization & Transformation Pitfalls) » → en réalité **DSGAI10** | Idem |

**Politique** : le script de parsing **préserve le texte source tel quel** (fidélité intégrale), et ajoute un champ `detailedSections.editorialNotes: string[]` documentant les anomalies détectées. Aucune correction silencieuse.

---

## 3. Architecture du pipeline

```
┌────────────────────────────────────────────────────────────────┐
│ data_ai_risk/OWASP-GenAI-Data-Security-Risks-and-Mitigations-  │
│                        2026-v1.0.pdf                           │
└────────────────────────────┬───────────────────────────────────┘
                             │ pdftotext -layout
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ data_ai_risk/extracted/OWASP-GenAI-Data-Security-2026-v1.0.txt │
│ (3 897 lignes, déjà produit)                                   │
└────────────────────────────┬───────────────────────────────────┘
                             │ scripts/parse-owasp-data-security-pdf.cjs
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ data_ai_risk/extracted/owasp-data-security-2026.json           │
│ { documentMeta, dspm: {...}, risks: [ {code, title, ...} x21]} │
└────────────────────────────┬───────────────────────────────────┘
                             │ import dans :
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ data/pdfReferences.ts  ← entrée #8 avec detailedSections       │
│ data/compassPDFMapping.ts  ← mapping CompassUseCase ↔ DSGAI    │
└────────────────────────────────────────────────────────────────┘
```

Le script CJS est **rejouable** : il peut régénérer le JSON depuis le PDF si OWASP publie une v1.1.

---

## 4. Extensions de types

### 4.1 `data/pdfReferences.ts`

```typescript
export type PDFCategory =
  | 'agentic-security'
  | 'mcp-security'
  | 'red-teaming'
  | 'incident-response'
  | 'governance'
  | 'data-security';            // ← NOUVEAU

export interface PDFReference {
  id: string;
  title: string;
  source: string;
  category: PDFCategory;        // ← typé strict
  summary: string;
  keyItems: ReferenceItem[];
  url?: string;
  // NOUVEAU — métadonnées document-level :
  documentMeta?: {
    version?: string;                  // ex: '1.0'
    publicationDate?: string;          // ex: '2026-03'
    pages?: number;                    // ex: 103
    authors?: string[];
    license?: string;                  // ex: 'CC BY-SA 4.0'
  };
}

export interface ReferenceItem {
  id: string;
  code?: string;
  title: string;
  description: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  // NOUVEAU — contenu intégral extrait du PDF :
  detailedSections?: {
    overview?: string;                 // "How the attack unfolds" in full
    attackVectors?: string[];          // "Attacker Capabilities" bullets
    examples?: string[];               // "Illustrative scenario"
    impacts?: string[];                // "Impact" bullets
    mitigations?: string[];            // general "Mitigations" bullets
    mitigationTiers?: {
      tier1?: string[];                // foundational
      tier2?: string[];                // hardening
      tier3?: string[];                // advanced
    };
    knownCVEs?: string[];              // "Known CVEs / exploits"
    references?: string[];             // "References" URLs/titles
    editorialNotes?: string[];         // anomalies détectées
    relatedOwaspLLM?: string[];        // mapping LLM01..LLM10
  };
}
```

✅ **Breaking change : aucun.** Les champs `documentMeta`, `detailedSections`, `PDFCategory` élargi sont tous rétrocompatibles avec les 7 entrées existantes.

### 4.2 `types/compass.ts`

```typescript
export interface CompassUseCase {
  // ... champs existants inchangés
  relatedPDFs?: Array<{
    pdfId: string;                     // ex: 'genai-data-security-2026'
    itemIds?: string[];                // ex: ['dsgai01', 'dsgai15']
    relevance?: BilingualText;         // optionnel — explication du lien
  }>;
}
```

✅ **Breaking change : aucun.** Champ optionnel.

---

## 5. Contenu extrait — entrée `pdfReferences.ts` #8

```typescript
{
  id: 'genai-data-security-2026',
  title: 'OWASP GenAI Data Security Risks and Mitigations 2026 v1.0',
  source: 'OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf',
  category: 'data-security',
  url: 'https://genai.owasp.org',
  documentMeta: {
    version: '1.0',
    publicationDate: '2026-03',
    pages: 103,
    license: 'CC BY-SA 4.0',
    authors: [
      'Scott Clinton (OWASP GenAI Co-founder)',
      'Kyriakos "Rock" Lambros (Zenity)',
      'Emmanuel Guilherme Junior (Data Security Initiative Lead)',
    ],
  },
  summary: '... (5-7 lignes : DSPM GenAI, 21 risques DSGAI, contexte ' +
           'data-plane/control-plane fusion, taxonomie évolutive) ...',
  keyItems: [
    { id: 'dspm-genai', code: 'DSPM', title: 'DSPM for GenAI (13 capability categories)', ... },
    { id: 'dsgai01', code: 'DSGAI01', title: 'Sensitive Data Leakage', priority: 'critical', detailedSections: {...} },
    { id: 'dsgai02', code: 'DSGAI02', title: 'Agent Identity & Credential Exposure', priority: 'critical', ... },
    // ... 20 autres DSGAI
  ],
}
```

**Priority heuristics** (définies lors du parsing) :
- `critical` : DSGAI01, 02, 04, 06, 11, 13, 21
- `high` : DSGAI03, 05, 07, 09, 12, 15, 16, 18, 20
- `medium` : DSGAI08, 10, 14, 17, 19, DSPM
- (ajustables après première revue)

---

## 6. Mapping COMPASS ↔ DSGAI

### 6.1 `data/compassPDFMapping.ts` (nouveau)

Fichier de configuration explicite (non généré — révisable à la main) :

```typescript
export const compassPDFMapping: Record<string /* CompassUseCase.id */, PDFLink[]> = {
  'COMPASS-UC-0001': [  // Jailbreak of internal chatbot
    { pdfId: 'genai-data-security-2026', itemIds: ['dsgai01', 'dsgai11', 'dsgai15'] },
    { pdfId: 'owasp-agentic-top10', itemIds: ['asi01'] },
  ],
  // ... 30 autres use-cases
};
```

### 6.2 Heuristiques de mapping initial (générées par le script)

Règles par mots-clés dans le titre/description/threat du CompassUseCase :

| Pattern (regex, ci) | DSGAI suggérés |
|---------------------|----------------|
| `jailbreak\|bypass\|prompt injection` | DSGAI01, DSGAI11, DSGAI15 |
| `data leak\|exfil\|PII\|PHI\|secret` | DSGAI01, DSGAI09, DSGAI14 |
| `agent\|autonomous\|delegation` | DSGAI02, DSGAI06, DSGAI11 |
| `RAG\|retrieval\|vector` | DSGAI13, DSGAI15, DSGAI17 |
| `poisoning\|tampering\|supply chain` | DSGAI04, DSGAI05, DSGAI21 |
| `shadow\|unsanctioned\|SaaS` | DSGAI03, DSGAI16 |
| `telemetry\|log\|monitoring` | DSGAI14 |
| `multimodal\|image\|voice` | DSGAI09 |
| `synthetic\|anonymization\|de-identification` | DSGAI10 |
| `compliance\|GDPR\|HIPAA\|regulatory` | DSGAI07, DSGAI08 |
| `inference\|reconstruction\|membership` | DSGAI18 |
| `labeler\|annotation\|HITL` | DSGAI19 |
| `model extraction\|IP theft\|distillation` | DSGAI20 |
| `SQL\|NL2SQL\|query injection` | DSGAI12 |

Le mapping initial est généré puis **validé manuellement** avant commit — pas de mapping heuristique opaque en production.

---

## 7. Composants UI

### 7.1 `components/compass/CompassOWASPReferences.tsx` (nouveau)

**Rôle** : section globale affichée en tête du module COMPASS.

**Props** :
```typescript
interface Props {
  onSelectItem?: (pdfId: string, itemId: string) => void;
}
```

**Comportement** :
- Récupère toutes les entrées de `pdfReferences.ts` via `getReferencesByCategory` pour les catégories `data-security`, `governance`, `agentic-security` (pertinentes pour COMPASS)
- Affiche une bannière repliable (accordion) avec icône `BookOpen` + titre « Documents OWASP de référence »
- Pour chaque PDF : titre, version, lien source, nombre de `keyItems`, bouton « Voir les détails » → redirige vers le Wiki Red Teamer à l'ancre correspondante
- Utilise `Card`, `Accordion` de `components/ui/`
- Bilingue via `useLanguage()` hook

**Position** : dans `CompassUseCasesView.tsx`, juste après le titre de section et avant `CompassFilters`.

### 7.2 `components/compass/CompassUseCaseModal.tsx` (modification)

**Ajout** : nouveau panneau « Références OWASP liées » visible uniquement si `useCase.relatedPDFs?.length > 0`.

**Structure visuelle** :

```
┌─ Modal use-case COMPASS-UC-0001 ──────────────────────────┐
│ [titre, risque, impact, vraisemblance... inchangés]       │
│                                                           │
│ [sections existantes : Related Sheets, Attack Mapping...] │
│                                                           │
│ ┌─ NEW : Références OWASP liées ──────────────────────┐   │
│ │ 📘 GenAI Data Security 2026                         │   │
│ │   └─ [🔴 CRITICAL] DSGAI01 — Sensitive Data Leakage │   │
│ │   └─ [🟠 HIGH]     DSGAI15 — Over-Broad Context ... │   │
│ │ 📘 OWASP Top 10 for Agentic Applications 2026      │   │
│ │   └─ [🔴 CRITICAL] ASI01 — Agent Goal Hijack        │   │
│ └─────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

Cliquer sur un item ouvre un sous-modal avec `detailedSections` complet (overview, attack vectors, mitigations tiers).

### 7.3 `data/wikiContent.tsx` (modification)

Ajout d'une section DSGAI suivant strictement le pattern des 7 entrées existantes :

```typescript
const DATA_SECURITY_REF = pdfReferences.find(r => r.id === 'genai-data-security-2026')!;
```

Rendu : accordion par DSGAI affichant `detailedSections` (overview, attack vectors, mitigations tiers, CVEs).

---

## 8. Fichiers créés / modifiés

| Action | Fichier | Effort |
|--------|---------|--------|
| **Existant** | `data_ai_risk/OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf` | — |
| **Existant** | `data_ai_risk/extracted/OWASP-GenAI-Data-Security-2026-v1.0.txt` (déjà produit) | — |
| **Créer** | `scripts/parse-owasp-data-security-pdf.cjs` | 1h |
| **Créer** | `data_ai_risk/extracted/owasp-data-security-2026.json` (généré) | auto |
| **Modifier** | `data/pdfReferences.ts` (+ types `PDFCategory`/`detailedSections`/`documentMeta` ; entrée #8) | 1h30 |
| **Créer** | `data/compassPDFMapping.ts` (mapping explicite) | 45min |
| **Modifier** | `types/compass.ts` (+ `relatedPDFs?`) | 10min |
| **Créer** | `components/compass/CompassOWASPReferences.tsx` | 1h |
| **Modifier** | `components/compass/CompassUseCaseModal.tsx` (panneau Références) | 30min |
| **Modifier** | `components/compass/CompassUseCasesView.tsx` (insertion section globale) | 15min |
| **Modifier** | `data/wikiContent.tsx` (section DSGAI) | 30min |

**Effort total estimé : ~5h15**

---

## 9. Tests / validation

### 9.1 Validation du parser (pas de framework de test frontend dispo)

Le frontend n'a pas Vitest/Jest configuré (prévu en Phase 3 du plan de refactoring global). La validation se fait donc via :

- **Assertions inline dans le script** `scripts/parse-owasp-data-security-pdf.cjs` : échoue avec exit code ≠ 0 si :
  - Nombre de DSGAI extraits ≠ 21
  - Un DSGAI n'a pas au minimum `code`, `title`, `detailedSections.overview`, `detailedSections.mitigations`
  - Un `code` est dupliqué
- **Console output** : le script affiche un résumé (nombre de DSGAI, CVEs, mitigations par tier) pour contrôle visuel
- **Snapshot JSON** : le fichier `owasp-data-security-2026.json` est commité ; toute regénération produit un diff git auditable
- **Backend tests (Jest)** : si un jour le parsing est déplacé côté backend, réutiliser `backend/npm run test` ; hors-scope pour l'instant

### 9.2 Tests TypeScript

- `cd backend && npm run prisma:generate` (si besoin)
- `npx tsc --noEmit` au racine → 0 erreur
- Vérifier qu'aucune des 7 références PDF existantes n'est cassée

### 9.3 Tests visuels manuels

1. `npm run dev` puis http://localhost:5080
2. **Section globale** : aller dans Référentiels → COMPASS → la bannière « Documents OWASP de référence » doit apparaître en tête, repliable, listant 8 PDF
3. **Panneau modal** : cliquer sur un use-case mappé (ex: COMPASS-UC-0001) → section « Références OWASP liées » visible avec liens cliquables
4. **Wiki** : Référentiels → Wiki → nouvelle section DSGAI visible avec 21 accordions
5. **Bilingue** : basculer FR ↔ EN → pas de chaîne non-traduite
6. **Régression** : vérifier que le reste du COMPASS, Wiki, et les 7 PDF précédents fonctionnent identiquement

### 9.4 Non-régression

- Pas de mutation des 31 `CompassUseCase` existants (l'ajout de `relatedPDFs?` est optionnel)
- Pas de modification de `compassContent.ts` (généré) — le mapping reste dans un fichier séparé
- Pas de modification de la structure de localStorage (`compass-ooda-progress`)

---

## 10. Questions ouvertes et hors-scope

### 10.1 Hors-scope (assumés exclus)

- Traduction automatique FR des `detailedSections` (contenu original anglais conservé, traduction éventuelle en phase ultérieure)
- Intégration backend (aucun endpoint NestJS nouveau — tout est côté frontend/données statiques)
- Export PDF du mapping (hors-scope v1)
- Mise à jour automatique si OWASP publie une v1.1 (le script reste manuel)

### 10.2 Questions ouvertes (non bloquantes)

1. La section **DSPM for GenAI** doit-elle être un `keyItem` unique ou éclatée en 13 `keyItems` (un par capability category) ? → Proposition : **1 `keyItem` agrégé** avec `detailedSections.mitigations` listant les 13 catégories. Ajustable si l'UI devient illisible.
2. Le mapping initial COMPASS ↔ DSGAI généré par heuristiques doit-il être commité tel quel ou passer par une revue utilisateur avant merge ? → Proposition : **commit initial + revue asynchrone**.

---

## 11. Attribution et licence

Contenu extrait sous licence **CC BY-SA 4.0** (OWASP GenAI Security Project). L'entrée `pdfReferences.ts` doit contenir :

- `documentMeta.license: 'CC BY-SA 4.0'`
- `url: 'https://genai.owasp.org'`
- Mention dans le `summary` : « Content extracted and adapted from OWASP GenAI Data Security Risks and Mitigations 2026 v1.0 under CC BY-SA 4.0 ».

---

## 12. Critères d'acceptation

- [ ] Script CJS extrait les 21 DSGAI + section DSPM sans erreur, output JSON valide
- [ ] `data/pdfReferences.ts` contient 8 entrées, l'entrée `genai-data-security-2026` a 22 `keyItems` avec `detailedSections` renseignés
- [ ] `types/compass.ts` déclare `relatedPDFs?` sans breaking change
- [ ] `data/compassPDFMapping.ts` couvre au minimum les 7 use-cases de niveau `critical` du COMPASS
- [ ] Bannière « Documents OWASP de référence » visible en tête du module COMPASS
- [ ] Panneau « Références OWASP liées » visible dans le modal use-case pour les use-cases mappés
- [ ] Wiki Red Teamer affiche la nouvelle section DSGAI (21 accordions)
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] Aucune régression visuelle dans les 7 PDF existants ni dans le COMPASS
