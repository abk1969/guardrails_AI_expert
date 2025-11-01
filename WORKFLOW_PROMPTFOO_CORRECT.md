# ✅ Workflow Promptfoo Correct - Analyse et Correction

**Date:** 2025-10-31
**Statut:** 🔍 ANALYSE COMPLÈTE - En cours de correction

---

## 🚨 Problèmes Identifiés

### 1. Erreurs de Duplication dans App.tsx

**Erreur actuelle:**
```typescript
{
  id: 'test-config',
  label: 'Configuration',
  stepNumber: 1,
  content: <Dashboard />  // ✅ Correct
},
{
  id: 'test-execution',
  label: 'Exécution',
  stepNumber: 3,
  content: <Dashboard />  // ❌ ERREUR: Devrait être un composant différent!
}
```

**Impact:** Les étapes 1 et 3 affichent le même contenu!

### 2. Workflow Incomplet et Chaotique

**Ce que j'avais créé (INCORRECT):**
1. Configuration → Dashboard (TestConfiguration)
2. Génération de Prompts → DatasetManager
3. Exécution → Dashboard (DUPLICATE!)
4. Résultats → Analytics

**Problèmes:**
- Pas de lien clair entre configuration et génération YAML
- Pas de composant pour lancer Promptfoo
- Pas de composant pour éditer le YAML avancé
- DatasetManager et AdvancedScenarios déconnectés du workflow

---

## 📖 Workflow Promptfoo Réel (Documentation Analysée)

D'après `guardrail/solution_promptfoo/SOLUTION_SUMMARY.md` et `IMPLEMENTATION_PLAN.md`:

### Le Workflow Réel de Promptfoo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Configuration des Clés API                              │
│    → Éditer .env avec GOOGLE_API_KEY ou OPENAI_API_KEY      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Configuration du Test (promptfooconfig.yaml)            │
│    → System prompt                                           │
│    → Targets (API à tester)                                  │
│    → Plugins de sécurité (40+ plugins disponibles)          │
│    → NumTests, thresholds, etc.                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Préparation des Datasets (OPTIONNEL)                    │
│    → datasets/ : Datasets personnalisés                      │
│    → prompts/ : Prompts personnalisés                        │
│    → Ou utiliser datasets intégrés (BeaverTails, HarmBench) │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Exécution des Tests                                      │
│    → npm run test:quick  (5 mins, 15 tests)                 │
│    → npm run test        (30-60 mins, tests complets)       │
│    → node promptfoo/dist/src/main.js eval -c config.yaml    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Visualisation des Résultats                              │
│    → npm run view                                            │
│    → Interface web sur http://localhost:15500                │
│    → Analyse des scores, échecs, vulnérabilités             │
└─────────────────────────────────────────────────────────────┘
```

### Commandes Clés

```bash
# Configuration
cd ai-risk-guardrails-tests
cp .env.example .env
nano .env  # Ajouter API keys

# Tests
npm run test:quick     # Test rapide (5 mins)
npm run test           # Test complet (30-60 mins)
npm run test:full      # Alias complet

# Configurations spécialisées
node ../promptfoo/dist/src/main.js eval -c configs/prompt-injection-only.yaml
node ../promptfoo/dist/src/main.js eval -c configs/harmful-content-only.yaml

# Visualisation
npm run view           # Interface web
```

---

## ✅ Workflow Correct pour l'Application

### Architecture de l'Intégration

D'après `IMPLEMENTATION_PLAN.md`, l'intégration se fait via:

**Service d'intégration:**
```typescript
// services/promptfooIntegrationService.ts
class PromptfooIntegrationService {
  async runRealTests(config: TestConfiguration, onProgress: callback) {
    // 1. Générer YAML depuis la configuration UI
    const yaml = this.generateYAML(config);
    const configPath = this.saveYAML(yaml);

    // 2. Lancer Promptfoo en subprocess
    await this.executePromptfoo(configPath);

    // 3. Lire et adapter les résultats
    const results = this.readResults();
    return this.adaptResults(results);
  }
}
```

**Flux complet:**
```
Frontend UI (TestConfiguration)
  → Génère promptfooconfig.yaml
  → Lance subprocess: node promptfoo/dist/src/main.js eval
  → Écoute stdout/stderr pour progression
  → Lit results/output.json
  → Adapte au format TestResult[]
  → Affiche dans UI (Analytics, RealTimeResults)
```

---

## 🔧 Workflow Correct à Implémenter

### Étapes Logiques

#### Étape 1: Configuration du Test ⚙️
**Composant:** `TestConfiguration.tsx`

**Actions:**
- Sélectionner catégories de risques (Injection, Jailbreak, PII, etc.)
- Choisir complexité (Simple, Moyen, Sophistiqué)
- Définir volume de tests (numTests: 5, 10, 20)
- Configurer target API (Gemini, GPT-4, API personnalisée)
- Définir system prompt

**Sortie:**
- Objet `TestConfiguration`
- **Bouton:** "Générer Configuration Promptfoo"

**Navigation:**
- Vers Étape 2: Prévisualisation YAML

---

#### Étape 2: Génération & Édition YAML 📝
**Composants:**
- `PromptfooConfigPreview.tsx` (NOUVEAU)
- `AdvancedTestConfiguration.tsx` (existant, à adapter)

**Actions:**
- Afficher le YAML généré automatiquement
- Permettre édition avancée (monaco-editor ou textarea)
- Sauvegarder dans `temp/config-{timestamp}.yaml`
- Valider la syntaxe YAML

**Affichage:**
```yaml
# Généré automatiquement depuis TestConfiguration
description: Test AI Risk Manager - {date}

prompts:
  - |
    You are an AI assistant...
    User: {{prompt}}

targets:
  - vertex:gemini-2.0-flash-exp

redteam:
  numTests: 10
  plugins:
    - prompt-injection
    - jailbreak
    - pii
```

**Navigation:**
- Vers Étape 3: Gestion des Datasets (optionnel)
- Ou directement vers Étape 4: Exécution

---

#### Étape 3: Gestion des Datasets (OPTIONNEL) 📚
**Composant:** `DatasetManager.tsx` (existant, à clarifier)

**Actions:**
- **Option A:** Utiliser datasets intégrés
  - BeaverTails (330K jailbreaks)
  - HarmBench (prompts académiques)
  - Pliny (jailbreaks curés)

- **Option B:** Créer datasets personnalisés
  - Uploader JSON: `datasets/custom-attacks.json`
  - Éditer dans l'UI
  - Format: `{ "prompts": ["...", "..."] }`

- **Option C:** Prompts individuels
  - Créer dans `prompts/custom-prompt.txt`
  - Référencer dans YAML: `file://prompts/custom-prompt.txt`

**Lien avec Workflow:**
- Modifie la section `tests:` du YAML
- Met à jour le preview en Étape 2

**Navigation:**
- Retour à Étape 2 pour valider
- Ou vers Étape 4: Exécution

---

#### Étape 4: Exécution des Tests 🚀
**Composant:** `PromptfooTestExecution.tsx` (NOUVEAU) ou adapter `LiveTestView.tsx`

**Actions:**
- **Lancer le test:**
  ```typescript
  const service = new PromptfooIntegrationService();
  await service.runRealTests(config, (progress) => {
    // Mise à jour UI en temps réel
  });
  ```

- **Affichage temps réel:**
  - Progression: "Running test 5/150..."
  - Logs stdout: `[Promptfoo] ✓ Generating test cases...`
  - Barre de progression
  - Timer: "Elapsed: 2:34 / ~5:00"

- **États:**
  - Queued → Running → Completed/Failed
  - Annulation possible (kill subprocess)

**UI Mock:**
```
┌──────────────────────────────────────────────────┐
│  🚀 Exécution des Tests Promptfoo en Cours       │
│                                                  │
│  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  45%                    │
│                                                  │
│  Tests exécutés: 68 / 150                       │
│  Temps écoulé: 3:24 / ~7:30                     │
│                                                  │
│  [Promptfoo] ✓ Testing prompt-injection...      │
│  [Promptfoo] ✓ Testing jailbreak (8/10)...      │
│  [Promptfoo] Running harmful:violent-crime...   │
│                                                  │
│  [ ⏸ Pause ]  [ ⏹ Arrêter ]                     │
└──────────────────────────────────────────────────┘
```

**Navigation:**
- Auto vers Étape 5 quand terminé

---

#### Étape 5: Analyse des Résultats 📊
**Composants:**
- `Analytics.tsx` (existant)
- `RealTimeResults.tsx` (existant)
- `ResultDetailModal.tsx` (existant)

**Actions:**
- Afficher scores globaux par plugin
- Tableau des résultats (PASSED/FAILED)
- Détails des échecs avec audit log
- Recommandations de remédiation
- Export JSON/CSV

**Statistiques:**
```
┌─────────────────────────┬──────────┬──────────┐
│ Plugin                  │ Score    │ Status   │
├─────────────────────────┼──────────┼──────────┤
│ prompt-injection        │ 8/10     │ ⚠️ 80%   │
│ jailbreak               │ 9/10     │ ✅ 90%   │
│ harmful:violent-crime   │ 10/10    │ ✅ 100%  │
│ pii                     │ 7/10     │ ❌ 70%   │
└─────────────────────────┴──────────┴──────────┘

Overall Pass Rate: 85%
Total Tests: 150
Passed: 128
Failed: 22
```

**Navigation:**
- Nouveau test: Retour Étape 1
- Exporter résultats
- Ouvrir interface Promptfoo (npm run view)

---

## 🎯 Corrections à Apporter

### 1. Corriger App.tsx

**Avant (INCORRECT):**
```typescript
{
  id: 'test-execution',
  label: 'Exécution',
  stepNumber: 3,
  content: <Dashboard />  // ❌ DUPLICATE
}
```

**Après (CORRECT):**
```typescript
{
  id: 'test-config',
  label: 'Configuration',
  stepNumber: 1,
  description: 'Catégories, complexité, volume, cible API',
  content: <TestConfiguration onCancel={() => {}} />  // ✅ Composant correct
},
{
  id: 'test-yaml-editor',
  label: 'Édition YAML',
  stepNumber: 2,
  description: 'Prévisualiser et éditer la configuration Promptfoo',
  content: <PromptfooConfigEditor />  // ✅ NOUVEAU composant
},
{
  id: 'test-datasets',
  label: 'Datasets & Prompts',
  stepNumber: 3,
  description: 'Gérer datasets personnalisés (optionnel)',
  content: <DatasetManager />  // ✅ Clarifier le rôle
},
{
  id: 'test-execution',
  label: 'Exécution',
  stepNumber: 4,
  description: 'Lancer les tests et suivre la progression',
  content: <PromptfooTestExecution />  // ✅ NOUVEAU composant ou adapter LiveTestView
},
{
  id: 'test-results',
  label: 'Résultats',
  stepNumber: 5,
  description: 'Analyser scores, échecs, et recommandations',
  content: <Analytics />  // ✅ Correct
}
```

### 2. Supprimer "Configuration Avancée" de la Section Tests

**Raison:** "Configuration Avancée" (AdvancedScenarios) est pour les scénarios MCP, pas pour Promptfoo.

**Action:** Déplacer vers section séparée ou renommer clairement

### 3. Clarifier DatasetManager

**Rôle actuel:** Bibliothèque d'attaques générique

**Nouveau rôle:** Gestion spécifique des datasets Promptfoo
- Import BeaverTails, HarmBench, Pliny
- Création datasets personnalisés
- Référencement dans YAML

### 4. Lier les Composants

**Flow logique:**
```
TestConfiguration
  ↓ (génère config)
PromptfooConfigEditor
  ↓ (édite YAML)
DatasetManager (optionnel)
  ↓ (ajoute datasets)
PromptfooTestExecution
  ↓ (lance tests)
Analytics
```

**Implémentation:**
- Context partagé: `PromptfooTestContext`
- State management: Configuration → YAML → Exécution → Résultats
- Navigation guidée avec boutons "Suivant"/"Précédent"

---

## 📝 Composants à Créer/Modifier

### Nouveaux Composants

1. **PromptfooConfigEditor.tsx**
   - Affiche YAML généré
   - Éditeur Monaco ou textarea
   - Validation syntaxe
   - Sauvegarde temp/config.yaml

2. **PromptfooTestExecution.tsx**
   - Lance subprocess promptfoo
   - Affiche progression temps réel
   - Logs stdout/stderr
   - Boutons pause/stop

3. **PromptfooTestContext.tsx**
   - State management global
   - Configuration → YAML → Résultats
   - Navigation entre étapes

### Composants à Modifier

1. **TestConfiguration.tsx**
   - Ajouter export vers YAML
   - Bouton "Générer Configuration Promptfoo"
   - Navigation vers PromptfooConfigEditor

2. **DatasetManager.tsx**
   - Clarifier: "Gestion des Datasets Promptfoo"
   - Focus sur datasets/ et prompts/
   - Lien avec YAML

3. **Analytics.tsx**
   - Adapter format résultats Promptfoo
   - Afficher scores par plugin
   - Lien vers interface web Promptfoo

4. **LiveTestView.tsx**
   - Option: Réutiliser pour Promptfoo
   - Ou créer PromptfooTestExecution séparé

---

## 🚀 Plan d'Implémentation

### Phase 1: Corrections Immédiates (1 heure)

1. ✅ Corriger duplication dans App.tsx
2. ✅ Renommer étapes correctement
3. ✅ Créer placeholder components
4. ✅ Tester navigation sans erreurs

### Phase 2: Composants Core (2-3 heures)

1. Créer PromptfooConfigEditor.tsx
2. Créer PromptfooTestExecution.tsx
3. Créer PromptfooTestContext.tsx
4. Intégrer avec TestConfiguration

### Phase 3: Service d'Intégration (2 heures)

1. Implémenter promptfooIntegrationService.ts
2. Génération YAML depuis configuration
3. Lancement subprocess
4. Lecture résultats

### Phase 4: UI/UX Polish (1-2 heures)

1. Boutons de navigation "Suivant"/"Précédent"
2. Indicateurs de progression
3. Guides contextuels
4. Tests end-to-end

---

## ✅ Checklist de Validation

- [ ] Étapes 1-5 distinctes et fonctionnelles
- [ ] Aucune duplication de contenu
- [ ] Navigation logique entre étapes
- [ ] TestConfiguration génère YAML
- [ ] YAML éditable et sauvegardé
- [ ] Datasets optionnels gérables
- [ ] Exécution lance vraiment Promptfoo
- [ ] Résultats affichés correctement
- [ ] Guide utilisateur clair à chaque étape

---

**Prochaine Action:** Corriger App.tsx avec le workflow correct et créer les composants placeholder.

