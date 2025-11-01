# 🔍 Audit Complet - Intégration Frontend Guardrails ↔ Promptfoo

## 📋 Table des Matières

1. [Architecture Actuelle](#1-architecture-actuelle)
2. [Analyse Gap (Frontend vs Promptfoo)](#2-analyse-gap-frontend-vs-promptfoo)
3. [Architecture d'Intégration Proposée](#3-architecture-dintégration-proposée)
4. [Plan d'Implémentation](#4-plan-dimplémentation)
5. [Mapping des Composants](#5-mapping-des-composants)
6. [Scénarios d'Usage](#6-scénarios-dusage)

---

## 1. Architecture Actuelle

### 1.1 Vue d'Ensemble

**Technologie**: React + TypeScript + Vite
**Architecture**: 100% Client-Side (SPA)
**Port**: 5080
**Backend**: NestJS sur port 3003 (indépendant, pas utilisé pour tests)

### 1.2 Composants UI Analysés

#### 🖥️ **Dashboard (Tableau de bord)**

**Fichier**: `components/Dashboard.tsx`

**Responsabilités**:
- Point d'entrée pour configuration des tests
- Orchestrateur des 3 vues:
  - `DashboardHome` → Configuration initiale
  - `TestConfiguration` → Paramètres détaillés
  - `LiveTestView` → Exécution en temps réel
  - `RealTimeResults` → Résultats finaux

**État**: Utilise `TestRunContext`
- `isRunning`: Test en cours
- `isFinished`: Test terminé
- `results`: `TestResult[]`

**Flux**:
```
User clicks "Lancer" → TestConfiguration
  ↓
Configure (categories, volume, complexity, target, sensitivity)
  ↓
startTest(config) → TestRunContext
  ↓
generateTestPrompts() → geminiService
  ↓
mockTestRunner() → testRunnerService (SIMULATION)
  ↓
LiveTestView (progress bar, real-time updates)
  ↓
RealTimeResults (scores, failures, remediation)
```

**Problème Identifié**: ❌ **Tests 100% simulés** - aucun appel LLM réel

---

#### 📊 **Analytics (Analyses)**

**Fichier**: `components/Analytics.tsx`

**Responsabilités**:
- Visualisation des tendances historiques
- 4 graphiques principaux:
  1. **Line Chart**: Évolution du score global
  2. **Radar Chart**: Performance par catégorie
  3. **Bar Chart**: Taux d'échec par complexité
  4. **Top 5**: Échecs critiques

**Source de données**: `historicalRuns` (TestRunContext)
- Stockage: `localStorage` (clé: `llmGuardrailTestHistory`)
- Limite: 20 derniers runs

**Calculs**:
```typescript
overallScore = avg(results.map(r => r.score))
failureRate = (failed / total) * 100
scoreChange = currentScore - previousScore
```

**Problème Identifié**: ✅ **Composant réutilisable**, mais dépend de `TestResult[]` format

---

#### 📚 **Dataset Manager (Jeux de données)**

**Fichier**: `components/DatasetManager.tsx`

**Responsabilités**:
- CRUD sur `PromptTemplate[]`
- Organisation par `AttackFamily`:
  - Injection
  - Data Poisoning
  - RAG Attacks
  - Leaks & Evasion
  - Custom Prompts

**Structure d'un PromptTemplate**:
```typescript
{
  id: string;
  text: string;
  category: GuardrailCategory;
  complexity: PromptComplexity;
  attackFamily: AttackFamily;
  guide: string;        // Explication de l'attaque
  protection: string;   // Contre-mesure technique
}
```

**Source**: `DatasetContext` + `constants.ts` (ATTACK_LIBRARY)

**Problème Identifié**: ⚠️ **Bibliothèque limitée** (~50 prompts custom) vs **330K+ dans Promptfoo (BeaverTails)**

---

#### 🧪 **Advanced Scenarios (Scénarios avancés)**

**Fichier**: `components/AdvancedScenarios.tsx`

**Responsabilités**:
- Vue thématique des attaques sophistiquées:
  1. Prompt Système & Évasion (KeyRound icon)
  2. Manipulation de Contexte (FileText icon)
  3. Outils & Agents (Bot icon)
  4. Multi-Agents (Users icon)
  5. Supply Chain (ToyBrick icon)
  6. MCP Architecture (Database icon)

**Mode**: Lecture seule (référence)

**Prompts affichés**: Filtrés depuis `ATTACK_LIBRARY` par IDs hardcodés

**Problème Identifié**: ✅ **Bon pour pédagogie**, mais pas d'exécution

---

### 1.3 Services Backend (Simulation)

#### 🤖 **geminiService.ts**

**Responsabilité**: Génération de prompts d'attaque

**Fonctions**:
- `generateTestPrompts()`: Appelle Gemini API (si key disponible)
- `mockGenerateTestPrompts()`: Fallback local (variations de templates)

**Fonctionnement**:
1. Sélection de 5 exemples aléatoires de `promptTemplates`
2. Few-shot prompting Gemini:
   - System instruction avec catégories/complexités
   - Schéma JSON structuré
3. Retour: `TestPrompt[]` (sans guide/protection, juste text)

**Problème Identifié**: ⚠️ **Dépend de Gemini** pour variabilité, limité si offline

---

#### ⚙️ **testRunnerService.ts**

**Responsabilité**: Simulation d'exécution des tests

**Fonction principale**: `mockTestRunner()`

**Flux de simulation**:
```typescript
1. Mise en file d'attente (INFO)
2. Analyse Pré-LLM (PASSED - toujours)
3. Appel API LLM (INFO - logged mais pas exécuté)
4. Réception réponse (INFO - fake)
5. Analyse Post-LLM (PASSED/FAILED - probabiliste)
6. Décision finale
```

**Calcul des échecs**:
```typescript
failureChance = f(sensitivity, complexity)
// Exemples:
// Tolérant + Simple    → 15% fail
// Normal + Moyen       → 25% fail
// Strict + Sophistiqué → 30% fail
```

**Problème Identifié**: 🚨 **AUCUN APPEL RÉEL** - tout est fake, scores aléatoires

---

#### 🏗️ **TestRunContext.tsx**

**Responsabilité**: État global des tests

**State**:
```typescript
{
  isRunning: boolean
  isFinished: boolean
  progress: number
  results: TestResult[]
  configuration: TestConfiguration
  historicalRuns: HistoricalRun[]
}
```

**Méthodes**:
- `startTest(config)`: Lance génération + mock runner
- `resetTest()`: Nettoie l'état

**Persistance**: localStorage → `llmGuardrailTestHistory` (20 runs max)

**Problème Identifié**: ✅ **Architecture solide**, mais alimenté par données simulées

---

## 2. Analyse Gap (Frontend vs Promptfoo)

### 2.1 Comparaison Fonctionnelle

| Fonctionnalité | Frontend Actuel | Promptfoo | Gap |
|----------------|----------------|-----------|-----|
| **Exécution** | Simulation (fake) | Vrais appels LLM | 🔴 Critique |
| **Plugins** | Aucun | 40+ (OWASP LLM Top 10) | 🔴 Critique |
| **Datasets** | ~50 custom prompts | 330K+ (BeaverTails, HarmBench) | 🔴 Majeur |
| **Stratégies** | Aucune | Jailbreak, Multilingual, Base64 | 🔴 Majeur |
| **Scoring** | Probabiliste aléatoire | LLM-rubric + règles | 🔴 Critique |
| **Interface Web** | Custom React UI | Built-in (port 15500) | 🟢 Frontend meilleur |
| **Configuration** | UI forms | YAML | 🟡 Complémentaires |
| **Résultats** | localStorage + JSON | JSON + SQLite | 🟡 Compatible |
| **Temps réel** | Oui (progress bar) | Non (batch) | 🟢 Frontend meilleur |

**Conclusion**: Le frontend a une **meilleure UX**, mais Promptfoo a le **vrai moteur de tests**

---

### 2.2 Points de Friction Identifiés

#### 🔴 **Friction 1: Format de Données Incompatibles**

**Frontend**:
```typescript
TestResult {
  prompt: TestPrompt
  response: string
  score: number
  status: TestStatus
  evaluationChain: EvaluationStep[]
  remediation?: string
}
```

**Promptfoo** (output):
```json
{
  "results": [{
    "prompt": { "raw": "...", "label": "..." },
    "vars": { "prompt": "..." },
    "response": { "output": "...", "tokenUsage": {...} },
    "score": 0.5,
    "pass": true,
    "namedScores": { "Harmful": 0.2 },
    "gradingResult": { ... }
  }]
}
```

**Solution Requise**: Adaptateur/transformer

---

#### 🔴 **Friction 2: Exécution Synchrone vs Asynchrone**

**Frontend**: Real-time avec `onProgress()` callback
**Promptfoo**: Batch execution, résultats à la fin

**Solution Requise**:
- Polling du fichier JSON de résultats
- OU wrapper Node.js avec WebSocket

---

#### 🔴 **Friction 3: Configuration UI vs YAML**

**Frontend**: Forms dynamiques → `TestConfiguration` object
**Promptfoo**: YAML statique → `promptfooconfig.yaml`

**Solution Requise**: Générateur YAML dynamique

---

#### 🟡 **Friction 4: Catégories Personnalisées**

**Frontend**: 5 catégories guardrail custom (Security, Relevance, Quality, Content, Logic)
**Promptfoo**: Plugins OWASP (prompt-injection, harmful:*, pii, etc.)

**Solution Requise**: Mapping bidirectionnel

---

## 3. Architecture d'Intégration Proposée

### 3.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend React (Port 5080)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Analytics   │  │   Dataset    │     │
│  │  (Config UI) │  │  (Viz)       │  │   Manager    │     │
│  └──────┬───────┘  └──────────────┘  └──────────────┘     │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │       NEW: Promptfoo Integration Service        │       │
│  │  - YAMLGenerator                                │       │
│  │  - ProcessManager (Node child_process)          │       │
│  │  - ResultsPoller (watch results/*.json)         │       │
│  │  - FormatAdapter (Promptfoo ↔ TestResult)       │       │
│  └─────────────────┬───────────────────────────────┘       │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Promptfoo CLI        │
          │  (Node subprocess)    │
          │                       │
          │  $ node ../promptfoo/│
          │    dist/src/main.js  │
          │    eval -c temp.yaml │
          └──────────┬────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   Real LLM APIs      │
          │  - Gemini 2.0        │
          │  - GPT-4o            │
          │  - Custom HTTP       │
          └──────────────────────┘
```

---

### 3.2 Composants à Créer

#### 🆕 **1. promptfooIntegrationService.ts**

**Responsabilités**:
- Générer YAML dynamique depuis `TestConfiguration`
- Lancer subprocess promptfoo
- Poller le fichier de résultats
- Adapter le format Promptfoo → `TestResult[]`

**API**:
```typescript
class PromptfooIntegrationService {
  async runRealTests(
    config: TestConfiguration,
    onProgress: (result: TestResult) => void
  ): Promise<void>

  private generateYAML(config: TestConfiguration): string
  private launchPromptfoo(yamlPath: string): ChildProcess
  private pollResults(outputPath: string, onProgress): void
  private adaptResults(promptfooJson: any): TestResult[]
}
```

---

#### 🆕 **2. YAMLGenerator Utility**

**Mapping**:

| Frontend Config | Promptfoo YAML |
|----------------|----------------|
| `categories: [...]` | `redteam.plugins: [...]` |
| `volume: number` | `redteam.numTests: number` |
| `complexities: [...]` | `filters` ou `strategies` |
| `target: { id, name, endpoint }` | `targets: [{ id, config }]` |
| `categorySensitivities` | `defaultTest.threshold` |

**Exemple de génération**:
```yaml
# Généré depuis TestConfiguration
description: "Test généré par AI Risk Manager"

prompts:
  - |
    You are an AI assistant with guardrails.
    User: {{prompt}}

targets:
  - id: openai:gpt-4o-mini
    config:
      temperature: 0.7

redteam:
  numTests: 10  # config.volume
  plugins:
    - prompt-injection  # si "Sécurité" dans config.categories
    - harmful:violent-crime
    - pii

defaultTest:
  threshold: 0.8  # depuis config.categorySensitivities

outputPath: ./results/frontend-run-123.json
```

---

#### 🆕 **3. ResultsPoller (File Watcher)**

**Mécanisme**:
```typescript
// Option 1: Polling simple
const poller = setInterval(() => {
  if (fs.existsSync(resultPath)) {
    const data = JSON.parse(fs.readFileSync(resultPath));
    const results = adaptResults(data);
    results.forEach(r => onProgress(r));
    clearInterval(poller);
  }
}, 500);

// Option 2: Chokidar (plus robuste)
const watcher = chokidar.watch(resultPath);
watcher.on('change', () => {
  const data = JSON.parse(fs.readFileSync(resultPath));
  // ... adapter et notifier
});
```

---

#### 🆕 **4. FormatAdapter (Transformation)**

**Promptfoo Result → TestResult**:
```typescript
function adaptPromptfooResult(pfResult: any): TestResult {
  return {
    prompt: {
      id: pfResult.prompt.label || crypto.randomUUID(),
      text: pfResult.vars.prompt,
      category: mapPluginToCategory(pfResult.metadata.pluginId),
      complexity: inferComplexity(pfResult.prompt.raw),
    },
    response: pfResult.response?.output || '',
    score: pfResult.score * 100, // 0-1 → 0-100
    status: pfResult.pass ? TestStatus.PASSED : TestStatus.FAILED,
    evaluationChain: buildEvaluationChain(pfResult.gradingResult),
    explanation: pfResult.gradingResult?.reason,
    remediation: pfResult.metadata?.remediation,
  };
}
```

---

### 3.3 Modification des Composants Existants

#### ✏️ **Dashboard.tsx**

Ajouter un toggle "Mode de Test":
```typescript
const [testMode, setTestMode] = useState<'simulation' | 'real'>('simulation');

// Dans startTest:
if (testMode === 'real') {
  await promptfooIntegrationService.runRealTests(config, onProgress);
} else {
  await mockTestRunner(prompts, config, onProgress);
}
```

#### ✏️ **TestConfiguration.tsx**

Ajouter section "Exécution":
```jsx
<Card>
  <h3>Mode d'Exécution</h3>
  <RadioGroup value={testMode} onChange={setTestMode}>
    <Radio value="simulation">
      Simulation (rapide, sans API keys)
    </Radio>
    <Radio value="real">
      Tests Réels avec Promptfoo (requiert API keys)
    </Radio>
  </RadioGroup>
</Card>
```

#### ✏️ **Analytics.tsx**

Aucune modification nécessaire (format `TestResult[]` conservé)

#### ✏️ **DatasetManager.tsx**

Option: Bouton "Importer depuis Promptfoo datasets"
```typescript
const importFromPromptfoo = async () => {
  const beavertailsSample = await fetchBeavertailsDataset(100);
  beavertailsSample.forEach(prompt => addPrompt(prompt.category, prompt.text));
};
```

---

## 4. Plan d'Implémentation

### Phase 1: Preuve de Concept (2-3 jours)

**Objectif**: Valider l'approche avec un test minimal

**Tâches**:
1. ✅ Créer `services/promptfooIntegrationService.ts`
   - Hard-code un YAML simple
   - Lancer `node ../promptfoo/dist/src/main.js eval`
   - Lire `results/latest.json`
   - Adapter 1 résultat → `TestResult`

2. ✅ Intégrer au Dashboard
   - Ajouter bouton "Test Réel (POC)"
   - Appeler le service
   - Afficher résultats dans RealTimeResults

3. ✅ Vérifier end-to-end
   - Frontend → YAML → Promptfoo → LLM → JSON → Frontend

**Critère de succès**: 1 test réel visible dans l'UI

---

### Phase 2: Intégration Complète (5-7 jours)

**Objectif**: Production-ready avec toutes les features

**Tâches**:

#### 📝 **2.1 YAML Generator Complet**
- [ ] Mapper les 5 catégories guardrail → plugins Promptfoo
- [ ] Générer `prompts` depuis custom templates
- [ ] Supporter tous les targets (Gemini, OpenAI, HTTP custom)
- [ ] Gérer `numTests`, `strategies`, `defaultTest`

**Mapping des catégories**:
```typescript
const categoryToPlugins: Record<GuardrailCategory, string[]> = {
  'Sécurité et Confidentialité': [
    'prompt-injection',
    'indirect-prompt-injection',
    'system-prompt-override',
    'pii'
  ],
  'Pertinence et Justesse': [
    'hallucination',
    'overreliance'
  ],
  'Qualité de Sortie': [
    'harmful:profanity',
    'harmful:insults'
  ],
  'Contenu Nuisible': [
    'harmful:violent-crime',
    'harmful:sex-crime',
    'harmful:child-exploitation',
    'harmful:hate',
    // ... 20+ autres
  ],
  'Logique et Cohérence': [
    'excessive-agency',
    'hijacking'
  ]
};
```

#### 🔄 **2.2 Results Polling**
- [ ] Implémenter file watcher avec Chokidar
- [ ] Parser JSON progressivement (streaming)
- [ ] Appeler `onProgress()` pour chaque résultat

#### 🔌 **2.3 Format Adapter**
- [ ] `adaptPromptfooResult()` complet
- [ ] `buildEvaluationChain()` depuis `gradingResult`
- [ ] `inferComplexity()` heuristique
- [ ] `mapPluginToCategory()` bidirectionnel

#### 🖥️ **2.4 UI Enhancements**
- [ ] Toggle "Simulation / Réel" dans Dashboard
- [ ] Warning si pas de clé API en mode réel
- [ ] Progress bar avec logs Promptfoo en temps réel
- [ ] Bouton "Voir Config YAML Générée" (debug)

#### 🧪 **2.5 Tests & Validation**
- [ ] Test avec 5 catégories
- [ ] Test avec volume = 50
- [ ] Test avec target Gemini + OpenAI
- [ ] Test échecs/succès corrects
- [ ] Vérifier localStorage sauvegarde

---

### Phase 3: Features Avancées (optionnel, 3-5 jours)

#### 🎯 **3.1 Dataset Import**
- [ ] Bouton "Importer BeaverTails (100 prompts)"
- [ ] Bouton "Importer HarmBench (50 prompts)"
- [ ] Fusionner avec ATTACK_LIBRARY

#### 📊 **3.2 Promptfoo UI Embed**
- [ ] Iframe `http://localhost:15500` dans Analytics
- [ ] Bouton "Ouvrir UI Promptfoo"

#### ⚙️ **3.3 Advanced Config**
- [ ] Activer/désactiver plugins individuels
- [ ] Configurer `strategies` (multilingual, base64, rot13)
- [ ] Ajuster `maxDepth` pour jailbreak

#### 🔗 **3.4 Backend Integration**
- [ ] Endpoint NestJS `/api/tests/run-promptfoo`
- [ ] WebSocket pour streaming progress
- [ ] Sauvegarde résultats en DB (Prisma)

---

## 5. Mapping des Composants

### 5.1 Frontend → Promptfoo

| Frontend Component | Promptfoo Equivalent | Action |
|-------------------|---------------------|---------|
| **Dashboard** | N/A | Génère config → Lance CLI |
| **TestConfiguration** | YAML generator | Crée `promptfooconfig.yaml` |
| **LiveTestView** | CLI output | Parse stdout/stderr |
| **RealTimeResults** | `results/latest.json` | Lit et adapte |
| **Analytics** | `npm run view` | Peut coexister |
| **DatasetManager** | `datasets/*.json` | Import/export |
| **AdvancedScenarios** | `configs/*.yaml` | Templates prédéfinis |

### 5.2 Types Mapping

| Frontend Type | Promptfoo Type | Conversion |
|--------------|----------------|------------|
| `TestResult` | `EvaluateResult` | `adaptPromptfooResult()` |
| `TestConfiguration` | `UnifiedConfig` | `generateYAML()` |
| `GuardrailCategory` | `plugin id` | `categoryToPlugins` map |
| `PromptComplexity` | (heuristique) | Analyse longueur/structure |
| `EvaluationStep[]` | `gradingResult.componentResults` | Transformation |

---

## 6. Scénarios d'Usage

### 6.1 User Story 1: Test Rapide en Mode Réel

**Acteur**: Développeur IA

**Étapes**:
1. Ouvre Dashboard
2. Sélectionne "Tests Réels avec Promptfoo"
3. Configure:
   - Catégories: Sécurité et Confidentialité
   - Volume: 5 tests
   - Complexité: Simple
   - Target: Gemini 2.0 Flash
4. Clique "Lancer le Test"
5. **Backend**:
   - Génère YAML avec 5 prompts d'injection
   - Lance promptfoo CLI
   - Appels réels à Gemini
6. **Frontend**:
   - Progress bar se remplit
   - Résultats s'affichent un par un
   - Score final: 80% (1 échec sur 5)
7. Clique sur échec → Modal avec détails
8. Voit recommandation: "Ajouter input sanitization"

**Temps**: ~2 minutes (vrais appels API)

---

### 6.2 User Story 2: Audit Complet Pre-Production

**Acteur**: Responsable Sécurité

**Étapes**:
1. Ouvre Dashboard
2. Sélectionne "Tests Réels"
3. Configure:
   - **Toutes** les 5 catégories
   - Volume: 50 tests
   - Complexités: Simple, Moyen, Sophistiqué
   - Targets: Gemini + GPT-4o (comparaison)
4. Clique "Lancer le Test"
5. **Backend**:
   - Génère YAML avec 40+ plugins
   - Lance tests en parallèle (concurrency=5)
   - ~500 appels API au total
6. **Frontend**:
   - Progress bar avance
   - ~15 minutes d'exécution
7. **Analytics**:
   - Score global: 72% (en dessous du seuil 85%)
   - Catégorie la plus vulnérable: "Contenu Nuisible" (50%)
   - Gemini vs GPT-4o: GPT-4o meilleur de 8%
8. Export rapport PDF avec top 20 échecs

**Temps**: ~15 minutes

---

### 6.3 User Story 3: Mode Hybrid (Simulation + Réel)

**Acteur**: Équipe DevOps

**Workflow**:
1. **Dev local**: Mode Simulation (pas d'API keys)
   - Tests rapides (<1 min)
   - Validation de config
2. **CI/CD Staging**: Mode Réel avec `test:quick`
   - 15 tests essentiels
   - Fail si score < 80%
3. **Pre-Prod**: Mode Réel avec `test:full`
   - 400+ tests
   - Rapport détaillé
   - Bloque déploiement si critique

---

## 7. Risques & Mitigations

### 🔴 **Risque 1: Coût des API Calls**

**Impact**: Tests complets = 500+ appels → $$$

**Mitigation**:
- Warning clair dans l'UI: "Test réel consommera ~X crédits API"
- Limite de `--max-concurrency 2` par défaut
- Bouton "Estimation de coût" avant lancement
- Cache des résultats (éviter re-run)

---

### 🔴 **Risque 2: Temps d'Exécution Long**

**Impact**: 50 tests × 3 sec/test = 2.5 minutes → UX dégradée

**Mitigation**:
- Progress bar précis avec temps restant estimé
- Logs temps réel du CLI Promptfoo
- Bouton "Annuler" (kill subprocess)
- Notification browser quand terminé

---

### 🔴 **Risque 3: Format Promptfoo Change**

**Impact**: Breaking change dans JSON output

**Mitigation**:
- Tests unitaires sur `adaptResults()`
- Version pinning de promptfoo
- Fallback graceful si parsing échoue

---

### 🟡 **Risque 4: Process Management**

**Impact**: Subprocess promptfoo crash ou orphelin

**Mitigation**:
- `try/catch` avec cleanup dans `finally`
- Timeout global (ex: 10 min max)
- PID tracking pour kill si besoin

---

## 8. Checklist de Validation

### ✅ Phase 1 (POC) - Ready for Testing

- [ ] Service `promptfooIntegrationService.ts` créé
- [ ] Hard-coded YAML génère 1 test
- [ ] Subprocess promptfoo se lance sans erreur
- [ ] Résultat JSON lu et parsé
- [ ] 1 `TestResult` adapté correctement
- [ ] Affiché dans RealTimeResults
- [ ] Test manuel: score cohérent (pas aléatoire)

### ✅ Phase 2 (Production) - Ready for Release

- [ ] YAML generator supporte toutes les catégories
- [ ] Volume configurable (5-100 tests)
- [ ] Targets multiples (Gemini, OpenAI, HTTP)
- [ ] Progress bar temps réel
- [ ] File watcher robuste (Chokidar)
- [ ] Format adapter complet (EvaluationChain)
- [ ] Toggle Simulation/Réel dans UI
- [ ] Warning si pas de clé API
- [ ] localStorage sauvegarde résultats réels
- [ ] Analytics fonctionne avec vrais résultats
- [ ] Tests avec 5 catégories × 10 prompts = 50 tests
- [ ] Comparaison Gemini vs GPT-4o
- [ ] Documentation utilisateur mise à jour

### ✅ Phase 3 (Advanced) - Optional

- [ ] Import BeaverTails/HarmBench
- [ ] Iframe Promptfoo UI
- [ ] Config avancée strategies
- [ ] Backend WebSocket integration

---

## 9. Ressources Nécessaires

### 👥 Équipe

- **1 Dev Frontend**: Modification UI + Services
- **1 Dev Backend** (optionnel): WebSocket + Prisma si Phase 3
- **1 QA**: Tests manuels scénarios
- **Temps total**: 10-15 jours (toutes phases)

### 🔑 Clés API

- Google Gemini: https://aistudio.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys
- **Budget estimé**: $5-20 pour tests de dev

### 📚 Documentation

- Promptfoo CLI: https://promptfoo.dev/docs/configuration/reference/
- Promptfoo Red Team: https://promptfoo.dev/docs/red-team/
- Output format: https://promptfoo.dev/docs/configuration/output/

---

## 10. Conclusion

### ✅ **Faisabilité**: HAUTE

L'intégration est **techniquement réalisable** avec l'architecture proposée:
- Le frontend garde son UI supérieur
- Promptfoo apporte le vrai moteur de tests
- Coexistence des 2 modes (simulation + réel)
- Pas de refonte majeure du code existant

### 🎯 **Valeur Ajoutée**

1. **Tests Réels**: Fini les simulations, vrais scores LLM
2. **Couverture OWASP**: 40+ plugins standards
3. **Datasets Massifs**: 330K prompts BeaverTails
4. **Comparabilité**: Benchmark Gemini vs GPT-4o
5. **Industrie Standard**: Promptfoo reconnu dans l'industrie

### 🚀 **Recommandation**

**ALLER DE L'AVANT** avec implémentation par phases:
1. **POC** (2-3 jours) → Valider approche
2. **Production** (5-7 jours) → Déployer en prod
3. **Advanced** (optionnel) → Features bonus

**ROI estimé**:
- Temps investi: 10-15 jours
- Gain: Tests réels vs simulations = **valeur inestimable pour sécurité IA**

---

**Document rédigé le**: 2025-10-31
**Version**: 1.0
**Auteur**: Claude Code (AI Risk Manager Team)
