# 🔗 Intégration Frontend AI Risk Manager ↔ Promptfoo

## 📖 Vue d'Ensemble

Ce dossier contient la **documentation complète** pour intégrer le frontend React existant (AI Risk Manager) avec le moteur de tests Promptfoo.

---

## 📚 Documents Disponibles

### 1. **AUDIT_INTEGRATION.md** 📋
**[Lire le document](./AUDIT_INTEGRATION.md)**

**Contenu**:
- ✅ Analyse détaillée de l'architecture frontend actuelle
- ✅ Audit des 4 composants principaux (Dashboard, Analytics, Dataset Manager, Advanced Scenarios)
- ✅ Analyse des services (geminiService, testRunnerService, TestRunContext)
- ✅ Comparaison Frontend vs Promptfoo (tableau gap analysis)
- ✅ Points de friction identifiés
- ✅ Architecture d'intégration proposée avec diagrammes
- ✅ Composants à créer (promptfooIntegrationService, YAMLGenerator, ResultsPoller, FormatAdapter)
- ✅ Mapping des types (TestResult ↔ Promptfoo Result)
- ✅ 3 scénarios d'usage détaillés
- ✅ Risques & mitigations
- ✅ Checklist de validation

**À lire si**: Vous voulez comprendre **POURQUOI** et **COMMENT** l'intégration fonctionne.

---

### 2. **IMPLEMENTATION_PLAN.md** 🚀
**[Lire le document](./IMPLEMENTATION_PLAN.md)**

**Contenu**:
- ✅ Plan d'implémentation étape par étape (3 phases)
- ✅ **Phase 1 (POC)**: 2-3 jours
  - Code complet de `promptfooIntegrationService.ts`
  - Modifications de `TestRunContext.tsx`
  - Ajouts UI dans `TestConfiguration.tsx`
  - Procédure de test end-to-end
- ✅ **Phase 2 (Production)**: 5-7 jours
  - `yamlGenerator.ts` avec mapping catégories → plugins
  - Results polling avec Chokidar
  - Format adapter complet avec EvaluationChain
  - UI enhancements (warnings, preview YAML)
- ✅ **Phase 3 (Advanced)**: 3-5 jours (optionnel)
  - Import datasets (BeaverTails, HarmBench)
  - Embed Promptfoo UI
  - Backend NestJS integration
- ✅ Timeline détaillée
- ✅ Checklist finale

**À lire si**: Vous voulez **IMPLÉMENTER** l'intégration concrètement.

---

### 3. **SOLUTION_SUMMARY.md** 📝
**[Lire le document](./SOLUTION_SUMMARY.md)**

**Contenu**:
- ✅ Vue d'ensemble de la solution Promptfoo standalone
- ✅ Infrastructure créée (promptfoo + ai-risk-guardrails-tests)
- ✅ Capacités de test (40+ plugins, 330K prompts BeaverTails)
- ✅ Guide de démarrage rapide
- ✅ Commandes disponibles
- ✅ Interprétation des résultats
- ✅ Personnalisation

**À lire si**: Vous voulez d'abord tester **Promptfoo seul** avant l'intégration.

---

### 4. **CHECKLIST.md** ✅
**[Lire le document](../ai-risk-guardrails-tests/CHECKLIST.md)**

**Contenu**:
- ✅ Checklist de vérification pré-tests
- ✅ Diagnostic des problèmes courants
- ✅ Tests de santé (Quick Check)

**À lire si**: Vous rencontrez des **problèmes techniques** avec Promptfoo.

---

## 🎯 Quelle Documentation Lire en Premier?

### Scénario 1: "Je veux comprendre l'audit complet"
**Ordre de lecture**:
1. `AUDIT_INTEGRATION.md` (45 min)
2. `IMPLEMENTATION_PLAN.md` (30 min)

### Scénario 2: "Je veux implémenter rapidement"
**Ordre de lecture**:
1. `IMPLEMENTATION_PLAN.md` - Phase 1 (15 min)
2. Tester le POC
3. Revenir à `AUDIT_INTEGRATION.md` pour comprendre les détails

### Scénario 3: "Je veux d'abord tester Promptfoo seul"
**Ordre de lecture**:
1. `SOLUTION_SUMMARY.md` (10 min)
2. `GETTING_STARTED.md` dans `ai-risk-guardrails-tests/` (5 min)
3. Lancer `npm run test:quick`
4. Revenir à `AUDIT_INTEGRATION.md` quand prêt pour l'intégration

---

## 🏗️ Architecture Visuelle

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend React (Port 5080)                  │
│                                                             │
│  📊 Dashboard   📈 Analytics   📚 Dataset   🧪 Advanced    │
│  (Config UI)    (Viz)          Manager      Scenarios      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🆕 Promptfoo Integration Service                   │   │
│  │  - generateYAML()                                   │   │
│  │  - executePromptfoo() → subprocess                  │   │
│  │  - pollResults() → Chokidar file watcher           │   │
│  │  - adaptResults() → TestResult[] format            │   │
│  └───────────────────┬─────────────────────────────────┘   │
│                      │                                      │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Promptfoo CLI        │
            │  (Node subprocess)    │
            │                       │
            │  $ node promptfoo/   │
            │    dist/src/main.js  │
            │    eval -c temp.yaml │
            └──────────┬────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Real LLM APIs       │
            │  - Gemini 2.0 Flash  │
            │  - GPT-4o Mini       │
            │  - Custom HTTP       │
            └──────────────────────┘
```

---

## 🔑 Résumé des Fonctionnalités

### Avant Intégration (État Actuel)
- ✅ Interface UI excellente
- ✅ Dashboard avec configuration détaillée
- ✅ Analytics avec graphiques (Line, Radar, Bar)
- ✅ Dataset Manager (CRUD prompts)
- ✅ Advanced Scenarios (vues thématiques)
- ❌ **Tests 100% simulés** (pas de vrais appels LLM)
- ❌ **Scores aléatoires probabilistes**
- ❌ **Bibliothèque limitée** (~50 prompts custom)

### Après Intégration (Cible)
- ✅ **Tout ce qui précède** (UI conservée)
- ✅ **Tests réels via Promptfoo** (vrais appels LLM)
- ✅ **40+ plugins OWASP** (prompt-injection, harmful:*, pii)
- ✅ **330K+ prompts BeaverTails** + HarmBench + Pliny
- ✅ **Scores LLM-rubric authentiques**
- ✅ **Comparaison multi-providers** (Gemini vs GPT-4o)
- ✅ **Toggle Simulation/Réel** (coexistence des 2 modes)
- ✅ **Persistance résultats réels** dans localStorage + Analytics

---

## 📊 Comparaison Rapide

| Critère | Frontend Seul | Frontend + Promptfoo |
|---------|---------------|----------------------|
| **Exécution** | Simulation (fake) | Vrais appels LLM |
| **Durée test** | ~30 secondes | ~2-15 minutes |
| **Coût** | $0 (gratuit) | $$ (crédits API) |
| **Couverture** | 5 catégories custom | 40+ plugins OWASP |
| **Datasets** | ~50 prompts | 330K+ prompts |
| **Scoring** | Probabiliste aléatoire | LLM-rubric réel |
| **UX** | Excellente | Excellente (conservée) |
| **Valeur pour sécurité** | Éducative | **Production-ready** |

---

## 🚀 Quick Start - Par Où Commencer?

### Option 1: Tester Promptfoo Seul (Recommandé en Premier)

```bash
# 1. Configurer les clés API
cd ai-risk-guardrails-tests
cp .env.example .env
nano .env  # Ajouter GOOGLE_API_KEY=...

# 2. Test rapide (5 minutes)
npm run test:quick

# 3. Voir résultats
npm run view  # Ouvre http://localhost:15500
```

**Durée**: 10 minutes

---

### Option 2: Implémenter l'Intégration (Phase 1 POC)

```bash
# 1. Lire IMPLEMENTATION_PLAN.md - Phase 1

# 2. Créer le service
cd ../../services
# Copier le code de promptfooIntegrationService.ts depuis IMPLEMENTATION_PLAN.md

# 3. Modifier TestRunContext.tsx
# Ajouter testMode state + logique if/else

# 4. Modifier TestConfiguration.tsx
# Ajouter UI toggle Simulation/Réel

# 5. Tester end-to-end
npm run dev  # Port 5080
# Aller sur Dashboard → Lancer Tests Réels
```

**Durée**: 2-3 jours

---

## 📈 Roadmap d'Implémentation

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: POC (2-3 jours)                                    │
│ ─────────────────────────────────────────────────────────── │
│ ✓ promptfooIntegrationService.ts créé                      │
│ ✓ YAML hard-codé (5 tests prompt-injection)                │
│ ✓ Subprocess Promptfoo fonctionne                          │
│ ✓ Résultats adaptés → TestResult[]                         │
│ ✓ UI toggle Simulation/Réel                                │
│ ✓ 1 test end-to-end validé                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Production (5-7 jours)                             │
│ ─────────────────────────────────────────────────────────── │
│ ✓ yamlGenerator.ts complet (mapping catégories)            │
│ ✓ Support tous targets (Gemini, OpenAI, HTTP)              │
│ ✓ Results polling temps réel (Chokidar)                    │
│ ✓ Format adapter avec EvaluationChain détaillée            │
│ ✓ UI warnings + preview YAML                               │
│ ✓ Tests 50+ prompts validés                                │
│ ✓ Analytics fonctionne avec résultats réels                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Advanced (3-5 jours) - OPTIONNEL                  │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Import BeaverTails (100 prompts)                         │
│ ✓ Embed Promptfoo UI (iframe)                              │
│ ✓ Backend NestJS endpoints                                 │
│ ✓ WebSocket streaming                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Objectifs Atteints

### Infrastructure Promptfoo ✅
- [x] Repo promptfoo cloné et buildé
- [x] 2863 packages npm installés
- [x] Configuration principale avec 40+ plugins
- [x] 3 configs spécialisées (quick, injection, harmful)
- [x] Documentation complète (README, GETTING_STARTED, CHECKLIST)

### Documentation d'Intégration ✅
- [x] Audit complet frontend (Dashboard, Analytics, Dataset, Scenarios)
- [x] Analyse gap Frontend vs Promptfoo
- [x] Architecture d'intégration conçue
- [x] Plan d'implémentation 3 phases
- [x] Code d'exemple pour Phase 1 (POC)
- [x] Timeline détaillée (10-15 jours)
- [x] Checklist de validation

### Prêt pour Implémentation ✅
- [x] Tous les composants à créer identifiés
- [x] Code TypeScript fourni (promptfooIntegrationService, yamlGenerator)
- [x] Modifications des composants existants documentées
- [x] Procédures de test end-to-end
- [x] Gestion des risques (coût API, temps d'exécution, format changes)

---

## 💡 Recommandations

### Court Terme (Maintenant)
1. **Tester Promptfoo seul** avec `npm run test:quick`
2. **Lire AUDIT_INTEGRATION.md** pour comprendre l'architecture
3. **Décider** si vous voulez procéder à l'intégration

### Moyen Terme (Semaine prochaine)
1. **Implémenter Phase 1 (POC)** en suivant IMPLEMENTATION_PLAN.md
2. **Valider** que le subprocess fonctionne end-to-end
3. **Tester** avec 5 prompts réels

### Long Terme (Mois prochain)
1. **Implémenter Phase 2 (Production)** pour usage complet
2. **(Optionnel)** Phase 3 si besoin de features avancées
3. **Former l'équipe** à utiliser les tests réels

---

## 📞 Support

### Questions sur Promptfoo
- Documentation: https://promptfoo.dev/docs/
- Red Team Guide: https://promptfoo.dev/docs/red-team/
- GitHub Issues: https://github.com/promptfoo/promptfoo/issues

### Questions sur l'Intégration
- Consulter `AUDIT_INTEGRATION.md` section "Risques & Mitigations"
- Consulter `CHECKLIST.md` pour diagnostics
- Consulter `IMPLEMENTATION_PLAN.md` pour code d'exemple

---

## 🏆 Conclusion

Vous disposez maintenant de:
1. ✅ Une solution Promptfoo **opérationnelle** (standalone)
2. ✅ Une **documentation complète** d'intégration (audit + plan)
3. ✅ Un **code d'exemple TypeScript** prêt à implémenter
4. ✅ Une **roadmap claire** (3 phases, 10-15 jours)

**Prochaine action**: Décider si vous voulez tester Promptfoo seul d'abord, ou démarrer l'intégration directement.

**Recommandation**: Commencer par tester Promptfoo seul (`npm run test:quick`) pour valider que tout fonctionne, puis revenir à l'intégration.

---

**Document créé le**: 2025-10-31
**Version**: 1.0
**Auteur**: Claude Code (AI Risk Manager Team)
