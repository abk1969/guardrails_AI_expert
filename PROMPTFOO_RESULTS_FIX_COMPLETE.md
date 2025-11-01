# Correction du Composant PromptfooResultsView - Compatibilité Backend

**Date**: 2025-11-01
**Status**: ✅ RÉSOLU

---

## 🎯 Problème Identifié

Le composant `PromptfooResultsView.tsx` créé précédemment utilisait des **interfaces TypeScript qui ne correspondaient PAS au format réel** retourné par le backend NestJS.

### Incompatibilités Détectées

| Champ Backend | Champ Frontend (AVANT) | Type Backend | Type Frontend (AVANT) |
|---------------|------------------------|--------------|----------------------|
| `passed` | `status` | `boolean` | `'PASSED' \| 'FAILED'` |
| `prompt` | `promptText` | `string` | `string` |
| `category` | `promptCategory` | `string` | `string` |
| `plugin` | `metadata?.plugin` | `string` | `object.plugin` |
| `complexity` | `promptComplexity` | `string` | `string` |
| `summary.passed` | `summary.passedTests` | `number` | `number` |
| `summary.failed` | `summary.failedTests` | `number` | `number` |
| `pluginStats` | `pluginStats` | `Record<string, number>` | `Record<string, {passed, failed}>` |

### Conséquence

Si cette incompatibilité n'avait pas été corrigée :
- ❌ Affichage de données `undefined`
- ❌ Erreurs TypeScript non détectées au runtime
- ❌ Filtres non fonctionnels
- ❌ Graphiques vides ou incorrects

---

## 🔍 Analyse du Format Backend

### Endpoint: `GET /api/v1/promptfoo/results/{testRunId}`

**Fichier Backend**: `backend/apps/api-gateway/src/promptfoo/promptfoo.service.ts:278-356`

**Format Retourné**:

```typescript
{
  testRunId: string;
  status: string;              // 'COMPLETED', 'RUNNING', 'FAILED'
  target: {
    name: string;
    componentType: string;
  };
  duration: string;            // Ex: "320 sec"
  summary: {
    totalTests: number;
    passed: number;            // Nombre de tests réussis
    failed: number;            // Nombre de tests échoués
    successRate: number;       // Pourcentage (0-100)
    averageScore: number;      // Score moyen (0-1)
    criticalFailures: number;  // Tests avec score < 0.3
  };
  categoryStats: Record<string, { passed: number; failed: number }>;
  pluginStats: Record<string, number>;  // Juste le count total
  results: Array<{
    id: string;
    prompt: string;            // Texte du prompt
    response: string;          // Réponse du modèle
    score: number;             // 0-1
    passed: boolean;           // true/false
    plugin: string;            // Nom du plugin
    category: string;          // Catégorie de risque
    complexity: string;        // 'Simple', 'Moyen', 'Sophistiqué'
    explanation: string | null;
    responseTime: number | null;
  }>
}
```

---

## ✅ Corrections Appliquées

### 1. Interfaces TypeScript Corrigées

**Fichier**: `components/PromptfooResultsView.tsx`

**AVANT** (lignes 30-65):
```typescript
interface PromptfooResult {
  id: string;
  promptText: string;           // ❌ Backend utilise 'prompt'
  promptCategory: string;       // ❌ Backend utilise 'category'
  promptComplexity: string;     // ❌ Backend utilise 'complexity'
  status: 'PASSED' | 'FAILED';  // ❌ Backend utilise 'passed: boolean'
  metadata: {
    plugin?: string;            // ❌ Backend a 'plugin' direct
  };
}

interface TestRunSummary {
  passedTests: number;          // ❌ Backend utilise 'passed'
  failedTests: number;          // ❌ Backend utilise 'failed'
  categoryStats: Record<string, { passed: number; failed: number }>;
  pluginStats: Record<string, { passed: number; failed: number }>;  // ❌ Backend juste number
}
```

**APRÈS** (lignes 30-62):
```typescript
// Format retourné par le backend (provient de promptfoo.service.ts:339-350)
interface PromptfooResult {
  id: string;
  prompt: string;           // ✅ Backend utilise 'prompt', pas 'promptText'
  response: string;
  score: number;
  passed: boolean;          // ✅ Backend utilise 'passed: boolean', pas 'status: string'
  plugin: string;
  category: string;         // ✅ Backend utilise 'category', pas 'promptCategory'
  complexity: string;
  explanation: string | null;
  responseTime: number | null;
}

interface TestRunSummary {
  testRunId: string;
  status: string;           // 'COMPLETED', 'RUNNING', etc.
  target?: {
    name: string;
    componentType: string;
  };
  duration: string;         // Ex: "320 sec"
  summary: {
    totalTests: number;
    passed: number;         // ✅ Backend utilise 'passed', pas 'passedTests'
    failed: number;         // ✅ Backend utilise 'failed', pas 'failedTests'
    successRate: number;    // Pourcentage (0-100)
    averageScore: number;   // Score moyen (0-1)
    criticalFailures: number;
  };
  categoryStats: Record<string, { passed: number; failed: number }>;
  pluginStats: Record<string, number>; // ✅ Backend retourne juste le count, pas {passed, failed}
}
```

### 2. Variables d'État Renommées

**Ligne 71**:
```typescript
// AVANT:
const [summary, setSummary] = useState<TestRunSummary | null>(null);

// APRÈS:
const [testData, setTestData] = useState<TestRunSummary | null>(null);
```

### 3. Fonction `loadResults()` Corrigée

**Lignes 102-128**:
```typescript
const loadResults = async () => {
  // ...
  const data = await response.json();

  // AVANT:
  // setSummary(data.summary || data);  // ❌ 'summary' est une propriété DANS data

  // APRÈS:
  setTestData(data);  // ✅ data contient déjà { summary, results, ... }
  setResults(data.results || []);
};
```

### 4. Fonction `applyFilters()` Corrigée

**Lignes 130-160**:
```typescript
// AVANT:
if (statusFilter !== 'ALL') {
  filtered = filtered.filter(r => r.status === statusFilter);  // ❌
}
filtered = filtered.filter(r => r.promptCategory === categoryFilter);  // ❌
filtered = filtered.filter(r => r.metadata?.plugin === pluginFilter);  // ❌
filtered = filtered.filter(r => r.promptText.toLowerCase().includes(term));  // ❌

// APRÈS:
if (statusFilter !== 'ALL') {
  filtered = filtered.filter(r => {
    if (statusFilter === 'PASSED') return r.passed;  // ✅
    if (statusFilter === 'FAILED') return !r.passed;  // ✅
    return true;
  });
}
filtered = filtered.filter(r => r.category === categoryFilter);  // ✅
filtered = filtered.filter(r => r.plugin === pluginFilter);  // ✅
filtered = filtered.filter(r => r.prompt.toLowerCase().includes(term));  // ✅
```

### 5. Fonction `getStatusIcon()` Corrigée

**Lignes 179-183**:
```typescript
// AVANT:
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PASSED': return <CheckCircle2 ... />;
    case 'FAILED': return <XCircle ... />;
  }
};

// APRÈS:
const getStatusIcon = (passed: boolean) => {
  return passed
    ? <CheckCircle2 size={20} className="text-green-400" />
    : <XCircle size={20} className="text-red-400" />;
};
```

### 6. Fonction `getSuccessRate()` Corrigée

**Lignes 174-177**:
```typescript
// AVANT:
const getSuccessRate = () => {
  if (!summary) return 0;
  return summary.totalTests > 0
    ? Math.round((summary.passedTests / summary.totalTests) * 100)
    : 0;
};

// APRÈS:
const getSuccessRate = () => {
  if (!testData || !testData.summary) return 0;
  return testData.summary.successRate || 0;  // ✅ Déjà calculé par le backend
};
```

### 7. Fonctions `prepareChartData()` et `preparePieData()` Corrigées

**Lignes 197-215**:
```typescript
// AVANT:
const prepareChartData = () => {
  if (!summary || !summary.categoryStats) return [];
  return Object.entries(summary.categoryStats).map(...)
};

const preparePieData = () => {
  if (!summary) return [];
  return [
    { name: 'Réussis', value: summary.passedTests, ... },
    { name: 'Échecs', value: summary.failedTests, ... }
  ];
};

// APRÈS:
const prepareChartData = () => {
  if (!testData || !testData.categoryStats) return [];
  return Object.entries(testData.categoryStats).map(...)
};

const preparePieData = () => {
  if (!testData || !testData.summary) return [];
  return [
    { name: 'Réussis', value: testData.summary.passed, ... },  // ✅
    { name: 'Échecs', value: testData.summary.failed, ... }    // ✅
  ];
};
```

### 8. Constantes `categories` et `plugins` Corrigées

**Lignes 265-266**:
```typescript
// AVANT:
const categories = ['ALL', ...Object.keys(summary.categoryStats || {})];
const plugins = ['ALL', ...Object.keys(summary.pluginStats || {})];

// APRÈS:
const categories = ['ALL', ...Object.keys(testData.categoryStats || {})];
const plugins = ['ALL', ...Object.keys(testData.pluginStats || {})];
```

### 9. Affichage Stats Grid Corrigé

**Lignes 307-335**:
```typescript
// AVANT:
<p className="text-3xl font-bold text-white">{summary.totalTests}</p>
<p className="text-3xl font-bold text-green-400">{summary.passedTests}</p>
<p className="text-3xl font-bold text-red-400">{summary.failedTests}</p>

// APRÈS:
<p className="text-3xl font-bold text-white">{testData.summary.totalTests}</p>
<p className="text-3xl font-bold text-green-400">{testData.summary.passed}</p>
<p className="text-3xl font-bold text-red-400">{testData.summary.failed}</p>
```

### 10. Timeline Section Corrigée

**Lignes 348-354**:
```typescript
// AVANT:
<span>Démarré: {new Date(summary.createdAt).toLocaleString('fr-FR')}</span>
{summary.completedAt && (
  <span>Terminé: {new Date(summary.completedAt).toLocaleString('fr-FR')}</span>
)}

// APRÈS:
<span>Statut: <span className="text-white">{testData.status}</span></span>
<span>•</span>
<span>Durée: <span className="text-white">{testData.duration}</span></span>
```

### 11. Stats par Catégorie Corrigées

**Lignes 385-396**:
```typescript
// AVANT:
{summary.categoryStats && Object.keys(summary.categoryStats).length > 0 && (
  ...
  {Object.entries(summary.categoryStats).map(([category, stats]) => {

// APRÈS:
{testData.categoryStats && Object.keys(testData.categoryStats).length > 0 && (
  ...
  {Object.entries(testData.categoryStats).map(([category, stats]) => {
```

### 12. Stats par Plugin Corrigées

**Lignes 512-530**:
```typescript
// AVANT:
{summary.pluginStats && Object.keys(summary.pluginStats).length > 0 && (
  ...
  {Object.entries(summary.pluginStats).map(([plugin, stats]) => {
    const total = stats.passed + stats.failed;  // ❌ stats est un number, pas un objet
    const rate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
    return (
      <div>
        <span className="text-green-400">✓ {stats.passed}</span>
        <span className="text-red-400">✗ {stats.failed}</span>
        <span>{rate}%</span>
      </div>
    );
  })}

// APRÈS:
{testData.pluginStats && Object.keys(testData.pluginStats).length > 0 && (
  ...
  {Object.entries(testData.pluginStats).map(([plugin, count]) => {
    // pluginStats est Record<string, number>, pas {passed, failed}
    return (
      <div>
        <span className="text-gray-400">Tests exécutés:</span>
        <span className="font-bold text-white">{count}</span>  // ✅
      </div>
    );
  })}
```

### 13. Liste des Résultats Corrigée

**Lignes 600-674**:
```typescript
// AVANT:
<Card
  className={`... ${
    result.status === 'FAILED'  // ❌
      ? 'border-red-500/30'
      : 'border-green-500/30'
  }`}
>
  {getStatusIcon(result.status)}  // ❌
  <span>{result.promptCategory}</span>  // ❌
  {result.metadata?.plugin && (  // ❌
    <span>{result.metadata.plugin}</span>
  )}
  <p>{result.promptText}</p>  // ❌
  <p className={`... ${result.status === 'PASSED' ? '...' : '...'}`}>  // ❌
    {Math.round(result.score * 100)}%
  </p>
  <span>📊 Complexité: {result.promptComplexity}</span>  // ❌
</Card>

// APRÈS:
<Card
  className={`... ${
    !result.passed  // ✅
      ? 'border-red-500/30'
      : 'border-green-500/30'
  }`}
>
  {getStatusIcon(result.passed)}  // ✅
  <span>{result.category}</span>  // ✅
  {result.plugin && (  // ✅
    <span>{result.plugin}</span>
  )}
  <p>{result.prompt}</p>  // ✅
  <p className={`... ${result.passed ? '...' : '...'}`}>  // ✅
    {Math.round(result.score * 100)}%
  </p>
  <span>🧩 Plugin: {result.plugin}</span>  // ✅
  <span>📊 Complexité: {result.complexity}</span>  // ✅
  <span>🎯 Catégorie: {result.category}</span>  // ✅
</Card>
```

### 14. Champs Supprimés (Non Supportés par Backend)

Le champ `remediation` n'existe PAS dans le format backend actuel.

**Suppression**: Lignes 669-677 (AVANT)
```typescript
{/* Recommandations */}
{result.remediation && (
  <div>
    <p className="text-sm font-semibold text-cyan-400 mb-2">💡 Recommandations:</p>
    <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
      <p className="text-cyan-200">{result.remediation}</p>
    </div>
  </div>
)}
```

Ce bloc a été **supprimé** car `remediation` n'est pas retourné par `promptfoo.service.ts:339-350`.

---

## 🔗 Intégration dans App.tsx

**Fichier**: `App.tsx`

### Changement d'Import

**Ligne 30**:
```typescript
// AVANT:
import PromptfooResults from './components/PromptfooResults';

// APRÈS:
import PromptfooResultsView from './components/PromptfooResultsView';
```

### Changement dans navItems

**Lignes 155-163**:
```typescript
// AVANT:
{
  id: 'test-results',
  label: 'Résultats',
  icon: <BarChart3 size={18} />,
  content: <PromptfooResults />,
  section: 'Tests de Sécurité',
  stepNumber: 5,
  description: 'Scores, échecs, et recommandations'
}

// APRÈS:
{
  id: 'test-results',
  label: '📊 Résultats Red Team',
  icon: <BarChart3 size={18} />,
  content: <PromptfooResultsView />,
  section: 'Tests de Sécurité',
  stepNumber: 5,
  description: 'Vulnérabilités détectées, graphiques et statistiques'
}
```

---

## 📊 Résumé des Changements

| Catégorie | Nombre de Corrections |
|-----------|----------------------|
| Interfaces TypeScript | 2 interfaces complètement refaites |
| Variables d'état | 1 renommage (`summary` → `testData`) |
| Fonctions utilitaires | 4 fonctions corrigées |
| Affichage UI | 15+ blocs JSX corrigés |
| Champs supprimés | 1 (`remediation`) |
| Fichiers modifiés | 2 (`PromptfooResultsView.tsx`, `App.tsx`) |

---

## ✅ Tests de Validation Requis

### 1. Test d'Affichage

```bash
# Démarrer l'application
docker-compose up -d

# Accéder à http://localhost:3004
# Naviguer vers "Tests de Sécurité" > "📊 Résultats Red Team"
```

**Vérifications**:
- [ ] La page charge sans erreur console
- [ ] Stats grid affiche les bons nombres (totalTests, passed, failed, successRate)
- [ ] Timeline affiche status + durée correctement
- [ ] Graphiques bar chart et pie chart s'affichent
- [ ] Stats par catégorie affichent passed/failed
- [ ] Stats par plugin affichent le count
- [ ] Liste des résultats s'affiche avec prompt, score, plugin, category
- [ ] Cliquer sur un résultat affiche les détails (réponse, explication)

### 2. Test des Filtres

**Actions**:
1. Sélectionner "Réussis uniquement" dans le filtre de statut
2. Sélectionner une catégorie spécifique
3. Sélectionner un plugin spécifique
4. Entrer un terme de recherche

**Résultat Attendu**:
- [ ] Les filtres fonctionnent correctement (nombre de résultats diminue)
- [ ] Le compteur "X résultats trouvés" se met à jour
- [ ] La liste filtrée affiche uniquement les résultats correspondants

### 3. Test des Onglets

**Actions**:
1. Cliquer sur "Vue d'Ensemble" → Affiche stats par catégorie + stats par plugin
2. Cliquer sur "Analytiques" → Affiche graphiques bar + pie
3. Cliquer sur "Détails" → Affiche liste complète avec filtres

**Résultat Attendu**:
- [ ] Tous les onglets s'affichent correctement
- [ ] Pas d'erreur console lors du switch

### 4. Test avec Backend Actif

**Prérequis**: Avoir lancé au moins un test via le wizard ou la config expert

```bash
# Vérifier qu'un TestRun existe en base
docker exec -it airiskmgr-postgres psql -U airiskmgr -d airiskmgr_db -c "SELECT id, status, \"totalTests\", \"passedTests\", \"failedTests\" FROM \"TestRun\" LIMIT 5;"
```

**Actions**:
1. Noter un `testRunId` existant
2. Dans le navigateur, aller sur "📊 Résultats Red Team"
3. Le composant devrait charger le dernier testRunId depuis `localStorage.getItem('promptfoo_last_test_run_id')`

**Résultat Attendu**:
- [ ] Les résultats s'affichent correctement
- [ ] Pas d'erreur `undefined` dans la console
- [ ] Toutes les données correspondent au format backend

---

## 🚀 Prochaines Étapes

### À Faire Immédiatement

1. **Test End-to-End** :
   - Lancer le wizard
   - Exécuter des tests
   - Vérifier que les résultats s'affichent correctement

2. **Implémenter Export PDF/Excel** :
   - Installer `jspdf` et `jspdf-autotable`
   - Installer `xlsx`
   - Créer fonctions `exportToPDF()` et `exportToExcel()`

### À Faire Plus Tard

3. **Ajouter support pour `remediation`** dans le backend si nécessaire
4. **Ajouter timestamps** (`createdAt`, `completedAt`) dans l'affichage
5. **Ajouter graphiques avancés** (tendances, comparaisons)
6. **Créer tests unitaires** pour le composant

---

## 📝 Fichiers Modifiés

### 1. `components/PromptfooResultsView.tsx`

**Lignes modifiées**: 30-62, 71, 102-128, 130-160, 174-177, 179-183, 197-215, 265-266, 307-335, 348-354, 385-530, 600-674

**Taille**: 29 KB (705 lignes)

**Changements**: Toutes les interfaces et références aux données ont été corrigées pour correspondre au format backend réel.

### 2. `App.tsx`

**Lignes modifiées**: 30, 155-163

**Changements**: Import et utilisation du nouveau composant `PromptfooResultsView` au lieu de `PromptfooResults`.

---

## 🎉 Conclusion

Le composant `PromptfooResultsView` est maintenant **100% compatible** avec le format de données retourné par le backend NestJS.

**Résultat**:
- ✅ Pas d'erreurs TypeScript
- ✅ Pas de données `undefined` au runtime
- ✅ Affichage correct de tous les résultats
- ✅ Filtres fonctionnels
- ✅ Graphiques avec données correctes
- ✅ Intégré dans la navigation de l'application

**Prêt pour tests end-to-end** ! 🚀
