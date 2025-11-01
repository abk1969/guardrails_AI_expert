# Séparation des Parcours Débutant et Expert

**Date**: 2025-11-01
**Version**: 2.0

---

## 🎯 Problème Identifié

L'utilisateur a signalé : **"le parcours Débutant promptfoo et le parcours expert sont confondus. la transition est mal gérée"**

### Problème Détaillé

**Avant** :
- Une seule section "Tests de Sécurité" avec 6 items mélangés
- Items débutant et expert dans la même liste
- Aucune séparation visuelle claire
- Confusion sur quel workflow suivre

```
Tests de Sécurité
  ├─ 🚀 Assistant Guidé (Débutant) [1]
  ├─ Configuration (Expert) [2]
  ├─ Édition YAML (Expert) [3]
  ├─ Datasets & Prompts [4]
  ├─ Exécution (Expert) [5]
  └─ 📊 Résultats Red Team [6]
```

**Problèmes** :
1. L'utilisateur ne sait pas s'il doit utiliser l'assistant OU les étapes expertes
2. Numérotation continue (1-6) suggère qu'il faut TOUT faire dans l'ordre
3. Pas de séparation visuelle entre les 2 workflows
4. L'assistant guidé est censé être tout-en-un mais apparaît comme une étape parmi d'autres

---

## ✅ Solution Implémentée

### Séparation en 2 Sections Distinctes

**Après** :
```
📋 Étape 0 : Applications à Tester
  └─ Profils d'Applications [0]
      ⚠️ PRÉREQUIS

🚀 Mode Débutant (Recommandé)
  ├─ Assistant Guidé [1]
  │   → Tout-en-un : Config → Validation → Exécution
  └─ 📊 Résultats [2]
      → Consulter et exporter

⚙️ Mode Expert
  ├─ 1️⃣ Configuration [1]
  ├─ 2️⃣ Édition YAML [2]
  ├─ 3️⃣ Datasets (Optionnel) [3]
  ├─ 4️⃣ Exécution [4]
  └─ 5️⃣ Résultats [5]

Gouvernance IA
  └─ ...

Red Team & Audit
  └─ ...

Références
  └─ ...

Configuration
  └─ ...
```

---

## 🎨 Changements de Structure

### 1. Création de la Section "Mode Débutant"

```typescript
const beginnerSection: NavSection = {
  id: 'beginner-mode',
  label: '🚀 Mode Débutant (Recommandé)',
  icon: <Zap size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'promptfoo-wizard',
      label: 'Assistant Guidé',
      stepNumber: 1,
      description: 'Tout-en-un : Configuration → Validation → Exécution en 3 étapes'
    },
    {
      id: 'test-results-beginner',
      label: '📊 Résultats',
      stepNumber: 2,
      description: 'Consulter les résultats et exporter (PDF/Excel)'
    },
  ]
};
```

**Caractéristiques** :
- **2 items seulement** : Assistant + Résultats
- Numérotation **indépendante** (1-2)
- Label clair : "Mode Débutant (Recommandé)"
- Icône distinctive : ⚡ (Zap)

### 2. Création de la Section "Mode Expert"

```typescript
const expertSection: NavSection = {
  id: 'expert-mode',
  label: '⚙️ Mode Expert',
  icon: <Settings size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'test-config',
      label: '1️⃣ Configuration',
      stepNumber: 1,
      description: 'Catégories, plugins, volume, cible API'
    },
    {
      id: 'promptfoo-config',
      label: '2️⃣ Édition YAML',
      stepNumber: 2,
      description: 'Prévisualiser et éditer promptfooconfig.yaml'
    },
    {
      id: 'test-datasets',
      label: '3️⃣ Datasets (Optionnel)',
      stepNumber: 3,
      description: 'Ajouter des prompts personnalisés'
    },
    {
      id: 'promptfoo-execution',
      label: '4️⃣ Exécution',
      stepNumber: 4,
      description: 'Lancer Promptfoo et suivre la progression'
    },
    {
      id: 'test-results-expert',
      label: '5️⃣ Résultats',
      stepNumber: 5,
      description: 'Vulnérabilités détectées, graphiques et statistiques'
    },
  ]
};
```

**Caractéristiques** :
- **5 items** : Workflow complet pas à pas
- Numérotation **indépendante** (1-5) avec emojis 1️⃣2️⃣3️⃣4️⃣5️⃣
- Label clair : "Mode Expert"
- Icône distinctive : ⚙️ (Settings)

### 3. Mise à Jour de la Liste des Sections

```typescript
export const navSections: NavSection[] = [
  applicationsSection,   // Étape 0
  beginnerSection,       // Mode Débutant (nouveau)
  expertSection,         // Mode Expert (nouveau)
  governanceSection,     // Reste inchangé
  redTeamSection,        // Reste inchangé
  referencesSection,     // Reste inchangé
  settingsSection        // Reste inchangé
];
```

---

## 🚀 Workflows Clairs

### Workflow Débutant (Simplifié)

```
Étape 0 : Applications à Tester
  → Créer un profil d'application
         ↓
🚀 Mode Débutant
  → 1. Assistant Guidé
       ├─ Configuration (choix simple)
       ├─ Validation (dry-run automatique)
       └─ Exécution (lancement automatique)
         ↓
  → 2. Résultats
       ├─ Voir les vulnérabilités
       └─ Exporter PDF/Excel
```

**Avantages** :
- ✅ Seulement 2 étapes après la config de l'app
- ✅ Tout est guidé et automatisé
- ✅ Pas de choix complexes
- ✅ Recommandé pour les nouveaux utilisateurs

### Workflow Expert (Détaillé)

```
Étape 0 : Applications à Tester
  → Créer un profil d'application
         ↓
⚙️ Mode Expert
  → 1️⃣ Configuration
       - Sélection fine des catégories
       - Choix des plugins spécifiques
       - Réglage du volume
         ↓
  → 2️⃣ Édition YAML
       - Prévisualisation du YAML généré
       - Édition manuelle du fichier
       - Personnalisation avancée
         ↓
  → 3️⃣ Datasets (Optionnel)
       - Ajout de prompts personnalisés
       - Import de fichiers
         ↓
  → 4️⃣ Exécution
       - Lancement manuel
       - Suivi en temps réel
       - Contrôle granulaire
         ↓
  → 5️⃣ Résultats
       - Analyse approfondie
       - Export avancé
```

**Avantages** :
- ✅ Contrôle total sur chaque étape
- ✅ Personnalisation maximale
- ✅ Workflow séquentiel clair
- ✅ Pour utilisateurs expérimentés

---

## 📊 Comparaison Avant/Après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Nombre de sections** | 1 section mixte | 2 sections séparées |
| **Workflow débutant** | Noyé parmi les items experts | Section dédiée avec 2 items |
| **Workflow expert** | Mélangé avec débutant | Section dédiée avec 5 items |
| **Numérotation** | Continue (1-6) | Indépendante par workflow |
| **Clarté visuelle** | ❌ Confus | ✅ Clair |
| **Transition** | ❌ Mal gérée | ✅ Séparation nette |
| **Choix utilisateur** | ❌ Pas évident | ✅ Clair dès le départ |

---

## 🎯 Bénéfices pour l'Utilisateur

### Pour les Débutants

**Avant** :
- "Dois-je utiliser l'assistant ET faire les étapes 2-5 ?"
- "Pourquoi y a-t-il un assistant si je dois quand même tout configurer ?"
- **Confusion** et **abandon**

**Après** :
- "Je vais dans Mode Débutant, je clique sur Assistant Guidé"
- "Ensuite je vais voir les résultats"
- **Clarté** et **succès**

### Pour les Experts

**Avant** :
- "L'assistant est pour débutants, mais où est le mode expert ?"
- "Je dois cliquer sur Configuration (Expert) mais c'est l'étape 2 après l'assistant ?"
- **Confusion** sur le workflow

**Après** :
- "Je vais dans Mode Expert, je suis les 5 étapes dans l'ordre"
- "Chaque étape est numérotée 1️⃣ à 5️⃣"
- **Workflow clair** et **séquentiel**

---

## 🔍 Détails Techniques

### IDs Uniques

Pour éviter les conflits, les résultats ont des IDs différents :
- Mode Débutant : `test-results-beginner`
- Mode Expert : `test-results-expert`

**Même composant** (`<PromptfooResultsView />`) mais **IDs distincts** pour le routing.

### Numérotation Indépendante

Chaque section a sa propre numérotation :
- Mode Débutant : `stepNumber: 1-2`
- Mode Expert : `stepNumber: 1-5`

Cela renforce l'idée que ce sont **deux workflows séparés**.

### Icônes Distinctives

- 🚀 (Zap) : Mode Débutant → Rapidité, simplicité
- ⚙️ (Settings) : Mode Expert → Contrôle, personnalisation

---

## 📝 Messages Clairs

### Descriptions Améliorées

**Mode Débutant - Assistant Guidé** :
> "Tout-en-un : Configuration → Validation → Exécution en 3 étapes"

**Mode Expert - Configuration** :
> "Catégories, plugins, volume, cible API"

**Mode Expert - Édition YAML** :
> "Prévisualiser et éditer promptfooconfig.yaml"

**Mode Expert - Datasets** :
> "Ajouter des prompts personnalisés"

Chaque description explique **clairement** ce que fait l'étape.

---

## 🧪 Tests de Validation

### Test 1 : Navigation Débutant

1. Rafraîchir le navigateur
2. Vérifier que "🚀 Mode Débutant (Recommandé)" est une section séparée
3. Dérouler la section
4. Vérifier qu'il y a seulement 2 items : Assistant Guidé + Résultats
5. Numérotation : [1] et [2]

### Test 2 : Navigation Expert

1. Vérifier que "⚙️ Mode Expert" est une section séparée
2. Dérouler la section
3. Vérifier qu'il y a 5 items numérotés 1️⃣ à 5️⃣
4. Ordre : Configuration → YAML → Datasets → Exécution → Résultats

### Test 3 : Indépendance des Workflows

1. Utiliser l'Assistant Guidé (Mode Débutant)
2. Vérifier que les étapes expertes ne sont PAS obligatoires
3. Utiliser le Mode Expert
4. Vérifier que l'assistant n'est PAS nécessaire

---

## ✅ Résultat Final

### Navigation Finale (Structure Complète)

```
AI RISK MANAGER

📋 Étape 0 : Applications à Tester [Ouvert par défaut]
  └─ Profils d'Applications [0]

🚀 Mode Débutant (Recommandé) [Fermé par défaut]
  ├─ Assistant Guidé [1]
  └─ 📊 Résultats [2]

⚙️ Mode Expert [Fermé par défaut]
  ├─ 1️⃣ Configuration [1]
  ├─ 2️⃣ Édition YAML [2]
  ├─ 3️⃣ Datasets (Optionnel) [3]
  ├─ 4️⃣ Exécution [4]
  └─ 5️⃣ Résultats [5]

Gouvernance IA [Fermé]
  └─ ...

Red Team & Audit [Fermé]
  └─ ...

Références [Fermé]
  └─ ...

Configuration [Fermé]
  └─ ...
```

---

## 🎉 Conclusion

La séparation des parcours débutant et expert est maintenant **claire et évidente** :

✅ **2 sections distinctes** avec labels explicites
✅ **Icônes différentes** pour identification rapide
✅ **Numérotation indépendante** pour chaque workflow
✅ **Descriptions claires** de chaque étape
✅ **Pas de confusion** possible entre les 2 workflows

**L'utilisateur choisit son workflow dès le départ** et suit un parcours cohérent jusqu'au bout ! 🚀
