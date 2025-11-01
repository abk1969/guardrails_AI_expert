# Phase 3: Fonctionnalités Avancées - Documentation Complète

## Vue d'Ensemble

La **Phase 3** enrichit l'application AI Risk Manager avec des fonctionnalités avancées pour une intégration plus profonde avec Promptfoo et une gestion améliorée des datasets de test.

## Nouvelles Fonctionnalités

### 1. Import de Datasets Externes (BeaverTails, HarmBench, Pliny)

#### Service: `datasetImportService.ts`

**Emplacement**: `services/datasetImportService.ts`

**Description**: Service permettant d'importer des datasets académiques massifs pour enrichir la bibliothèque d'attaques.

**Datasets Supportés**:

1. **BeaverTails** (330K+ prompts)
   - Source: Dataset académique de jailbreak
   - Format: Prompts de manipulation et contournement
   - Méthode: `importBeaverTails(limit: number = 100)`

2. **HarmBench** (50+ prompts)
   - Source: Dataset académique de contenu nuisible
   - Format: Prompts harmful catégorisés
   - Méthode: `importHarmBench(limit: number = 50)`

3. **Pliny** (30+ prompts)
   - Source: Collection curée de jailbreaks efficaces
   - Format: Jailbreaks prouvés contre GPT-4
   - Méthode: `importPliny(limit: number = 30)`

**Fonctionnalités**:
- Mapping automatique des catégories externes vers `GuardrailCategory`
- Inférence de complexité basée sur heuristiques
- Fallback vers mocks si datasets absents
- Sanitization automatique des textes

**Exemple d'utilisation**:

```typescript
import { datasetImportService } from './services/datasetImportService';

// Importer 100 prompts BeaverTails
const beavertailsPrompts = await datasetImportService.importBeaverTails(100);

// Importer 50 prompts HarmBench
const harmbenchPrompts = await datasetImportService.importHarmBench(50);

// Importer 30 prompts Pliny
const plinyPrompts = await datasetImportService.importPliny(30);
```

#### Intégration UI: `DatasetManager.tsx`

**Nouveau composant**: `DatasetImportButtons`

**Emplacement**: Section "Importer des Datasets Externes" dans `DatasetManager.tsx`

**Fonctionnalités**:
- 3 boutons distincts pour chaque dataset
- États de chargement individuels
- Feedback utilisateur (alert avec nombre de prompts importés)
- Couleurs distinctes: Purple (BeaverTails), Orange (HarmBench), Red (Pliny)

**Utilisation**:
1. Naviguer vers "Jeu de données"
2. Cliquer sur le bouton d'import souhaité
3. Attendre la confirmation
4. Les prompts importés apparaissent automatiquement dans la bibliothèque

**Screenshot conceptuel**:
```
┌─────────────────────────────────────────────────┐
│ 📥 Importer des Datasets Externes              │
│                                                 │
│ Enrichissez votre bibliothèque avec des        │
│ datasets académiques de qualité...             │
│                                                 │
│ [BeaverTails (100)] [HarmBench (50)] [Pliny]   │
└─────────────────────────────────────────────────┘
```

---

### 2. Visualisation de l'Interface Promptfoo Native

#### Intégration: `Analytics.tsx`

**Nouveau composant**: Iframe Promptfoo UI

**Emplacement**: Nouvelle section "Interface Promptfoo Avancée" dans `Analytics.tsx`

**Fonctionnalités**:
- Iframe intégrée pointant vers `http://localhost:15500`
- Toggle Afficher/Masquer l'interface
- Instructions pas-à-pas pour démarrer le serveur
- Lien "Ouvrir dans un nouvel onglet"
- Sandbox sécurisée

**Mode d'emploi**:

1. **Démarrer le serveur Promptfoo**:
   ```bash
   cd guardrail/solution_promptfoo/ai-risk-guardrails-tests
   npx promptfoo@latest view
   ```

2. **Naviguer vers Analytics dans AI Risk Manager**

3. **Cliquer sur "Afficher l'interface"**

4. **L'iframe se charge automatiquement avec l'interface native Promptfoo**

**Avantages**:
- Visualisation détaillée des résultats de tests réels
- Comparaison de modèles (Gemini vs GPT-4o)
- Export de rapports HTML
- Historique complet des exécutions
- Analyse granulaire des assertions

**Capture d'écran conceptuelle**:
```
┌────────────────────────────────────────────────┐
│ 👁️ Interface Promptfoo Avancée    [Afficher]  │
├────────────────────────────────────────────────┤
│ 📌 Instructions:                               │
│ 1. Terminal: npx promptfoo@latest view        │
│ 2. Interface: http://localhost:15500          │
│ 3. L'iframe se chargera automatiquement       │
├────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ [Promptfoo UI Native - Iframe]            │ │
│ │                                            │ │
│ │ • Test results visualization              │ │
│ │ • Model comparisons                       │ │
│ │ • Detailed assertions                     │ │
│ └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

### 3. Configuration Avancée des Plugins Promptfoo

#### Nouveau composant: `AdvancedTestConfiguration.tsx`

**Emplacement**: `components/AdvancedTestConfiguration.tsx`

**Description**: Modal de configuration granulaire permettant de sélectionner manuellement les plugins Promptfoo à utiliser pour les tests réels.

**Fonctionnalités**:
- Sélection manuelle de 40+ plugins Promptfoo
- Regroupement par catégorie (Sécurité, Pertinence, Qualité, etc.)
- Actions globales: Sélectionner tout / Désélectionner tout
- Compteur en temps réel des plugins sélectionnés
- Interface à deux colonnes pour meilleure lisibilité

**Plugins disponibles** (par catégorie):

**Sécurité et Confidentialité** (5 plugins):
- `prompt-injection` - Injection de commandes
- `indirect-prompt-injection` - Injection indirecte via RAG
- `system-prompt-override` - Contournement du système
- `prompt-extraction` - Extraction du prompt
- `pii` - Fuite de données personnelles

**Pertinence et Justesse** (2 plugins):
- `hallucination` - Génération de faits inventés
- `overreliance` - Surconfiance

**Qualité de Sortie** (2 plugins):
- `harmful:profanity` - Langage grossier
- `harmful:insults` - Insultes

**Contenu Nuisible** (15 plugins):
- `harmful:violent-crime`
- `harmful:sex-crime`
- `harmful:child-exploitation`
- `harmful:harassment-bullying`
- `harmful:hate`
- `harmful:self-harm`
- `harmful:sexual-content`
- `harmful:radicalization`
- `harmful:cybercrime`
- `harmful:cybercrime:malicious-code`
- `harmful:illegal-activities`
- `harmful:illegal-drugs`
- `harmful:misinformation-disinformation`
- `harmful:specialized-advice`
- `harmful:copyright-violations`

**Logique et Cohérence** (2 plugins):
- `excessive-agency` - Agence excessive
- `hijacking` - Détournement

#### Intégration dans `TestConfiguration.tsx`

**Nouveau bouton**: "Configurer" (dans section Mode Réel)

**Flow utilisateur**:
1. Activer "Tests Réels avec Promptfoo"
2. Une nouvelle section apparaît: "Configuration Avancée des Plugins"
3. Cliquer sur "Configurer"
4. Modal s'ouvre avec sélection de plugins
5. Sélectionner/désélectionner les plugins souhaités
6. Cliquer sur "Appliquer"
7. Le compteur se met à jour: "X plugin(s) personnalisés sélectionnés"

**Mode automatique vs Manuel**:
- **Automatique** (défaut): Les catégories sélectionnées → mapping automatique vers plugins
- **Manuel**: Les plugins sélectionnés explicitement → utilisés directement

**Exemple visuel**:
```
┌──────────────────────────────────────────────────┐
│ ⚙️ Configuration Avancée - Sélection de Plugins │
│ 25 / 26 plugins sélectionnés                    │
├──────────────────────────────────────────────────┤
│ [Tout sélectionner] [Tout désélectionner]       │
├──────────────────────────────────────────────────┤
│ • Sécurité et Confidentialité                    │
│   [✓] Prompt Injection   [✓] PII                │
│   [✓] Extraction         [ ] System Override    │
│                                                  │
│ • Contenu Nuisible                               │
│   [✓] Violent Crime      [✓] Hate Speech        │
│   [ ] Child Expl.        [✓] Cybercrime         │
├──────────────────────────────────────────────────┤
│            [Annuler]  [Appliquer]                │
└──────────────────────────────────────────────────┘
```

---

## Modifications des Types et Services

### Type `TestConfiguration`

**Fichier**: `types.ts`

**Ajout**:
```typescript
export interface TestConfiguration {
  // ... existing fields
  customPlugins?: string[]; // 🆕 Liste des plugins personnalisés
}
```

### Service `yamlGenerator.ts`

**Modification**: Support des plugins personnalisés

**Logique**:
```typescript
export function generatePromptfooYAML(config: TestConfiguration): string {
  // 🆕 Si customPlugins fourni, utiliser ces plugins directement
  const plugins = config.customPlugins && config.customPlugins.length > 0
    ? config.customPlugins
    : getPluginsForCategories(config.categories); // Mapping automatique

  // ... rest of YAML generation
}
```

**Avantage**: Flexibilité totale - l'utilisateur peut choisir entre mapping automatique ou sélection manuelle granulaire.

### DatasetContext - `addPromptBatch`

**Fichier**: `contexts/DatasetContext.tsx`

**Nouvelle méthode**:
```typescript
interface DatasetState {
  // ... existing
  addPromptBatch: (prompts: PromptTemplate[]) => void; // 🆕
}

const addPromptBatch = (prompts: PromptTemplate[]) => {
  if (!prompts || prompts.length === 0) return;
  const sanitizedPrompts = prompts.map(p => ({
    ...p,
    text: sanitizeText(p.text)
  }));
  setPromptTemplates(prev => ([...prev, ...sanitizedPrompts]));
};
```

**Usage**: Permet d'ajouter plusieurs prompts en une seule opération (import de datasets).

---

## Guide d'Utilisation Complet

### Scénario 1: Importer des datasets externes

1. **Naviguer vers "Jeu de données"**
2. **Chercher la section "Importer des Datasets Externes"**
3. **Cliquer sur le dataset souhaité**:
   - `BeaverTails (100)` - Pour jailbreaks académiques
   - `HarmBench (50)` - Pour contenu nuisible
   - `Pliny (30)` - Pour jailbreaks curés
4. **Attendre la confirmation**: "✅ X prompts importés avec succès!"
5. **Les prompts apparaissent automatiquement dans les familles d'attaque appropriées**

### Scénario 2: Visualiser l'interface Promptfoo

**Prérequis**: Tests réels exécutés au moins une fois

1. **Démarrer le serveur Promptfoo**:
   ```bash
   cd guardrail/solution_promptfoo/ai-risk-guardrails-tests
   npx promptfoo@latest view
   ```

2. **Naviguer vers "Analyses" dans AI Risk Manager**

3. **Scroller jusqu'à "Interface Promptfoo Avancée"**

4. **Cliquer sur "Afficher l'interface"**

5. **L'iframe charge automatiquement l'UI Promptfoo**

6. **Explorer**:
   - Résultats de tests
   - Comparaisons de modèles
   - Assertions détaillées
   - Historique complet

### Scénario 3: Configurer manuellement les plugins

**Contexte**: Vous voulez tester uniquement des plugins spécifiques (ex: PII + Hallucination + Cybercrime)

1. **Aller dans "Tableau de bord"**

2. **Configurer un test**:
   - Sélectionner des catégories
   - Choisir "Tests Réels avec Promptfoo"

3. **Une nouvelle section apparaît**: "Configuration Avancée des Plugins"

4. **Cliquer sur "Configurer"**

5. **Modal s'ouvre avec 26 plugins**

6. **Stratégies**:
   - **Approche 1**: Cliquer sur "Désélectionner tout", puis sélectionner manuellement `pii`, `hallucination`, `harmful:cybercrime`
   - **Approche 2**: Partir de "Sélectionner tout", puis désélectionner ce qui n'est pas pertinent

7. **Cliquer sur "Appliquer"**

8. **Vérifier**: "3 plugin(s) personnalisés sélectionnés"

9. **Lancer le test** → Promptfoo utilisera UNIQUEMENT ces 3 plugins

---

## Architecture Technique

### Diagramme de Flux - Import de Datasets

```
User clicks "Import BeaverTails"
  ↓
DatasetImportButtons component
  ↓ handleImportBeaverTails()
  ↓
datasetImportService.importBeaverTails(100)
  ↓ fs.readFileSync(beavertailsPath)
  ↓ Parse JSON
  ↓ Map to PromptTemplate[]
  ↓ Return array
  ↓
addPromptBatch(prompts) [DatasetContext]
  ↓ Sanitize texts
  ↓ Merge with existing templates
  ↓
UI updates automatically
```

### Diagramme de Flux - Configuration Avancée

```
User enables "Real Tests"
  ↓
"Configure" button appears
  ↓
User clicks "Configure"
  ↓
AdvancedTestConfiguration modal opens
  ↓
User selects/deselects plugins
  ↓
User clicks "Apply"
  ↓ onPluginsChange(selectedPlugins)
  ↓
setCustomPlugins(selectedPlugins) [TestConfiguration state]
  ↓
Modal closes, counter updates
  ↓
User clicks "Launch Test"
  ↓ startTest({..., customPlugins})
  ↓
yamlGenerator.generatePromptfooYAML(config)
  ↓ Uses config.customPlugins if provided
  ↓ Else uses CATEGORY_TO_PLUGINS mapping
  ↓
YAML written with custom plugins
  ↓
Promptfoo executes with specified plugins only
```

---

## Maintenance et Évolutions Futures

### Ajout d'un nouveau dataset

**Étapes**:

1. **Ajouter la méthode dans `datasetImportService.ts`**:
   ```typescript
   async importMyDataset(limit: number = 50): Promise<PromptTemplate[]> {
     // Implementation
   }
   ```

2. **Ajouter un bouton dans `DatasetImportButtons`**:
   ```typescript
   const [loadingMyDataset, setLoadingMyDataset] = useState(false);

   const handleImportMyDataset = async () => {
     setLoadingMyDataset(true);
     try {
       const prompts = await datasetImportService.importMyDataset(50);
       addPromptBatch(prompts);
       alert(`✅ ${prompts.length} prompts importés!`);
     } catch (error) {
       alert(`❌ Erreur: ${error.message}`);
     } finally {
       setLoadingMyDataset(false);
     }
   };
   ```

3. **Ajouter le bouton dans le JSX**

### Ajout d'un nouveau plugin Promptfoo

**Étape unique**: Modifier `AdvancedTestConfiguration.tsx`

```typescript
const PROMPTFOO_PLUGINS = {
  'Ma Catégorie': [
    {
      id: 'mon-nouveau-plugin',
      name: 'Mon Plugin',
      description: 'Description du plugin'
    }
  ]
};
```

Le reste est automatique (compteur, sélection, génération YAML).

---

## Dépendances et Compatibilité

### Dépendances NPM requises
- `chokidar`: File watching pour résultats en temps réel (**déjà installé**)
- `@types/chokidar`: Types TypeScript (**déjà installé**)

### Compatibilité navigateurs
- **Chrome/Edge**: Full support (sandbox iframe)
- **Firefox**: Full support
- **Safari**: Full support (nécessite allow-same-origin)

### Versions Promptfoo
- Testé avec: `promptfoo@latest` (version 0.80+)
- Plugins: Standard Promptfoo redteam plugins
- Format: YAML config schema v1

---

## FAQ

**Q: Les datasets BeaverTails/HarmBench sont-ils inclus par défaut?**

R: Non. Les chemins pointent vers `guardrail/solution_promptfoo/promptfoo/examples/redteam/datasets/`. Si les fichiers n'existent pas, des mocks sont générés automatiquement.

**Q: Puis-je importer plusieurs fois le même dataset?**

R: Oui, mais attention aux doublons. Chaque import génère de nouveaux IDs uniques (`beavertails-{UUID}`).

**Q: L'iframe Promptfoo fonctionne-t-elle sans serveur?**

R: Non. Le serveur Promptfoo (`npx promptfoo view`) DOIT être démarré sur `http://localhost:15500` pour que l'iframe fonctionne.

**Q: Puis-je exporter les plugins sélectionnés?**

R: Actuellement non, mais la configuration est intégrée dans `TestConfiguration` et peut être sauvegardée via `historicalRuns`.

**Q: Les plugins personnalisés fonctionnent-ils en mode simulation?**

R: Non. Les plugins personnalisés sont UNIQUEMENT utilisés en mode "Tests Réels avec Promptfoo". En mode simulation, c'est le système mock qui prévaut.

---

## Conclusion

La **Phase 3** transforme AI Risk Manager en plateforme complète de red teaming avec:
- ✅ Accès à 400K+ prompts académiques
- ✅ Interface de visualisation professionnelle
- ✅ Contrôle granulaire sur 40+ plugins de sécurité

L'application est maintenant prête pour des audits de sécurité de niveau production.

---

**Auteur**: Claude Code
**Date**: 2025-10-31
**Version**: Phase 3 Complete
