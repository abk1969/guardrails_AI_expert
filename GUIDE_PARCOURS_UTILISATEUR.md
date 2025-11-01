# Guide du Parcours Utilisateur - AI RISK MANAGER

**Date**: 2025-11-01
**Version**: 1.0

---

## 🎯 Objectif

Ce guide explique **le parcours complet** pour tester la sécurité de vos applications IA avec AI RISK MANAGER.

---

## 📋 Vue d'Ensemble du Workflow

Le workflow se déroule en **2 étapes principales** :

```
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 0 : Applications à Tester (PRÉREQUIS)               │
│  ➜ Configurez vos applications IA avant de lancer des tests│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : Tests de Sécurité                                │
│  ➜ Lancez des tests red team sur vos applications          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 ÉTAPE 0 : Applications à Tester (PRÉREQUIS)

### Pourquoi cette étape ?

Avant de lancer des tests de sécurité, vous devez **configurer les applications IA** que vous souhaitez tester (chatbots, RAG, agents multimodaux, etc.).

### Comment faire ?

1. **Accédez à la section** : `📋 Étape 0 : Applications à Tester`
2. **Cliquez sur** : `Profils d'Applications`
3. **Créez un profil d'application** avec :
   - Nom de l'application
   - Type (Chatbot, RAG, Multimodal, etc.)
   - Endpoint API (si vous testez un modèle réel)
   - Clés API (stockées de manière sécurisée)

### ⚠️ AVERTISSEMENT DE SÉCURITÉ

La page affiche un avertissement rouge car vous êtes sur le point de configurer des tests sur des applications **RÉELLES** ou **CLIENTES** ou en **PRODUCTION**.

**Risques** :
- Coûts imprévus (tests consomment des crédits API)
- Surcharge serveur (volume élevé peut ralentir)
- Données sensibles (prompts de test peuvent contenir du contenu sensible)
- Rate limiting (dépasser les limites peut bloquer l'API)
- Logs et audit (vos tests apparaissent dans les logs client)

**Bonnes Pratiques** :
- ✅ Toujours obtenir une autorisation écrite du client
- ✅ Privilégier DEV/STAGING avant PROD
- ✅ Petit volume initial (5-10 tests pour valider)
- ✅ Mode Blackbox d'abord (ne pas demander d'accès inutiles)
- ✅ Documentation complète (sauvegarder config, résultats, et rapport)
- ✅ Communication proactive (avertir le client avant/après les tests)

---

## 🧪 ÉTAPE 1 : Tests de Sécurité

Une fois votre application configurée, vous pouvez lancer des tests.

### Option 1 : Assistant Guidé (RECOMMANDÉ pour débutants)

**Navigation** : `Étape 1 : Tests de Sécurité` > `🚀 Assistant Guidé (Recommandé)`

**Workflow en 3 étapes** :

#### 1️⃣ Configuration
- Sélectionnez la cible (application configurée à l'étape 0)
- Choisissez la profondeur des tests (Light, Standard, Deep)
- Sélectionnez les catégories de risques

#### 2️⃣ Validation
- Prévisualisation du YAML généré
- Estimation de durée et coût
- Dry-run pour valider la configuration
- 2 cases à cocher obligatoires pour confirmer

#### 3️⃣ Exécution
- Lancement des tests réels
- Suivi en temps réel
- Redirection automatique vers les résultats

### Option 2 : Configuration Expert (pour utilisateurs avancés)

**Navigation** : `Étape 1 : Tests de Sécurité` > `Configuration (Expert)`

**Workflow** :
1. **Configuration manuelle** : Catégories, plugins, volume, cible API
2. **Édition YAML** : Prévisualiser et éditer `promptfooconfig.yaml`
3. **Datasets** (optionnel) : Ajouter des prompts personnalisés
4. **Exécution** : Lancer Promptfoo et suivre la progression
5. **Résultats** : Voir les vulnérabilités détectées

---

## 📊 Consultation des Résultats

**Navigation** : `Étape 1 : Tests de Sécurité` > `📊 Résultats Red Team`

### Que trouve-t-on ici ?

1. **Stats Grid** :
   - Total tests
   - Tests réussis
   - Vulnérabilités (échecs)
   - Taux de réussite

2. **Timeline** :
   - Statut de l'exécution (COMPLETED, RUNNING, FAILED)
   - Durée totale

3. **Graphiques** :
   - Bar chart par catégorie
   - Pie chart de répartition

4. **Liste détaillée** :
   - Tous les résultats de tests
   - Filtres par statut, catégorie, plugin
   - Détails expandables (prompt, réponse, explication)

5. **Exports** :
   - **PDF** : Rapport professionnel de 2 pages
   - **Excel** : Classeur de 5 feuilles avec données détaillées

### État Vide

Si vous accédez à cette page **sans avoir lancé de tests**, vous verrez :

- Message clair : "Aucun Test Exécuté"
- Explication du contexte
- **2 boutons d'action** :
  - `🚀 Lancer l'Assistant` → Redirige vers l'Assistant Guidé
  - `⚙️ Configuration Expert` → Redirige vers Configuration Expert
- Preview de ce qui sera affiché après l'exécution
- Durée estimée : 5-30 minutes

---

## 🔄 Parcours Utilisateur Complet

### Scénario 1 : Premier Utilisateur (Débutant)

1. **Page d'accueil** → Voir l'overview de l'application
2. **📋 Étape 0 : Applications à Tester** → Créer un profil d'application
   - Remplir le formulaire
   - Lire l'avertissement de sécurité
   - Cocher "J'ai lu et compris les risques"
   - Sauvegarder
3. **Étape 1 : Tests de Sécurité** → `🚀 Assistant Guidé`
   - Étape 1/3 : Configuration
   - Étape 2/3 : Validation + Dry-run
   - Étape 3/3 : Exécution
4. **📊 Résultats Red Team** → Consulter les résultats
   - Analyser les vulnérabilités
   - Exporter en PDF ou Excel

**Durée totale estimée** : 15-30 minutes

### Scénario 2 : Utilisateur Expérimenté

1. **📋 Étape 0 : Applications à Tester** → Configurer une application (si pas déjà fait)
2. **Étape 1 : Tests de Sécurité** → `Configuration (Expert)`
   - Configuration manuelle fine-tunée
   - Édition YAML avancée
   - Ajout de datasets personnalisés
   - Exécution
3. **📊 Résultats Red Team** → Analyse approfondie
   - Filtrage avancé
   - Export pour analyse externe

**Durée totale estimée** : 30-60 minutes

---

## 🎨 Améliorations UX Récentes

### Navigation Clarifiée

**Avant** :
- Section "Applications à Tester" (pas de numéro)
- Section "Tests de Sécurité" (stepNumber 0-5)
- **Confusion** : L'utilisateur ne sait pas par où commencer

**Après** :
- Section `📋 Étape 0 : Applications à Tester` (stepNumber: 0)
- Section `Étape 1 : Tests de Sécurité` (stepNumber: 1-6)
- **Clarté** : Le numéro d'étape indique clairement l'ordre

### Labels Améliorés

| Avant | Après |
|-------|-------|
| "Applications à Tester" | "📋 Étape 0 : Applications à Tester" |
| "Tests de Sécurité" | "Étape 1 : Tests de Sécurité" |
| "Assistant Guidé (Débutant)" | "🚀 Assistant Guidé (Recommandé)" |
| Description générique | "⚠️ PRÉREQUIS : Configurez d'abord vos applications IA avant de lancer des tests" |

### État Vide de la Page Résultats

**Avant** :
- Message simple : "Aucun Résultat"
- Pas de guidance

**Après** :
- Message clair avec explication
- 2 boutons d'action avec navigation
- Preview de ce qui sera affiché
- Estimation de durée

---

## 🔍 Points Clés à Retenir

### ✅ Toujours Commencer par l'Étape 0

**Avant de lancer des tests**, configurez vos applications à tester.

### ✅ Choisir le Bon Mode

- **Assistant Guidé** : Recommandé pour premiers tests et utilisateurs débutants
- **Mode Expert** : Pour configuration avancée et utilisateurs expérimentés

### ✅ Comprendre les Risques

Lisez **impérativement** l'avertissement de sécurité avant de tester des applications réelles ou en production.

### ✅ Sauvegarder les Résultats

Utilisez les exports PDF/Excel pour conserver une trace des tests et partager avec votre équipe.

---

## 📞 Support

Si vous rencontrez des problèmes ou avez des questions :

1. Consultez la documentation : `README.md`, `QUICK_START.md`
2. Vérifiez les guides spécifiques :
   - `GUIDE_TESTS_APPLICATIONS_CLIENTS.md` - Tests sur applications clientes
   - `TEST_EXPORT_RAPIDE.md` - Guide de test des exports
   - `UX_IMPROVEMENTS_RESULTS_PAGE.md` - Améliorations UX

---

## 🎉 Conclusion

Le parcours utilisateur a été simplifié et clarifié :

1. **Étape 0** : Configurez vos applications (prérequis)
2. **Étape 1** : Lancez des tests de sécurité
3. **Consultez les résultats** et exportez

**Navigation claire** + **Guidance contextuelle** = **Meilleure expérience utilisateur** ! 🚀
