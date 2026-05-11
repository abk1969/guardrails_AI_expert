# PLAN DE REFACTORING UNIFIÉ - AI Risk Manager

## Date: 2026-03-01
## Équipe: 3 analystes (frontend, backend, transversal)

---

## RÉSUMÉ EXÉCUTIF

| Domaine | Issues | Critical | High | Medium | Low |
|---------|--------|----------|------|--------|-----|
| Frontend | 47 | 2 | 3 | 22 | 20 |
| Backend | 27 | 7 | 5 | 12 | 8 |
| Transversal | 58 | 3 | 15 | 22 | 18 |
| **TOTAL** | **132** | **12** | **23** | **56** | **46** |

**Effort total estimé : ~120-140 heures**
**ROI attendu : 30-50% d'amélioration de maintenabilité**

---

## PHASE 0 : URGENCES SÉCURITÉ (2h - IMMÉDIAT)

> Ces issues doivent être corrigées AVANT tout refactoring.

### SEC-001 [CRITICAL] Clé API Gemini hardcodée dans docker-compose.yml
- **Fichier:** `docker-compose.yml:290-291`
- **Risque:** Clé API visible dans le contrôle de version
- **Action:** Remplacer par `${GEMINI_API_KEY}` + nettoyer l'historique git
- **Effort:** 30 min

### SEC-002 [CRITICAL] Clé Gemini exposée côté frontend
- **Fichier:** `.env` (root)
- **Risque:** `GEMINI_API_KEY` envoyée au navigateur (Vite inclut toutes les vars dans le build)
- **Action:** Supprimer du frontend, configurer uniquement en backend
- **Effort:** 15 min

### SEC-003 [CRITICAL] JWT_SECRET trop faible
- **Fichier:** `docker-compose.yml:67`
- **Action:** Forcer variable d'environnement en production, documenter
- **Effort:** 15 min

### SEC-004 [HIGH] Sudoers sans mot de passe dans Strix
- **Fichier:** `backend/docker/strix/Dockerfile:91-92`
- **Action:** Utiliser permissions Unix socket directement
- **Effort:** 30 min

### SEC-005 [HIGH] Mots de passe en clair dans docker-compose.yml
- **Action:** Migrer vers Docker Compose secrets ou `.env`
- **Effort:** 30 min

---

## PHASE 1 : QUICK WINS (8-10h - Semaine 1)

> Changements rapides à fort impact. Pas de risque de régression.

### QW-001 Supprimer geminiService.ts (déprécié)
- **Fichier:** `services/geminiService.ts`
- **Raison:** Doublon de `geminiServiceSecure.ts`, marqué deprecated
- **Action:** Supprimer le fichier, mettre à jour les imports
- **Effort:** 30 min
- **Risque:** LOW - vérifier qu'aucun import ne le référence

### QW-002 Créer hook useLocalStorage()
- **Impact:** Élimine 82 patterns try/catch/JSON.parse identiques dans 18 contextes
- **Gain:** ~150 lignes supprimées
- **Action:** Créer `hooks/useLocalStorage.ts`, refactorer les contextes
- **Effort:** 2h
- **Risque:** LOW - remplacement mécanique

### QW-003 Nettoyer fichiers orphelins
- **Fichiers:**
  - `components/PromptfooResultsView.tsx.bak` → supprimer
  - `bash.exe.stackdump` → supprimer + ajouter `*.stackdump` au `.gitignore`
  - `.kiro/`, `.qodo/` → investiguer puis supprimer si non utilisés
- **Effort:** 15 min

### QW-004 Standardiser le package manager (npm uniquement)
- **Problème:** Frontend = npm, Backend = pnpm (lock files incompatibles)
- **Action:** Supprimer `pnpm-lock.yaml`, convertir Dockerfiles backend de pnpm à npm
- **Fichiers:** `backend/apps/api-gateway/Dockerfile`, `backend/package.json`
- **Effort:** 1h
- **Risque:** MEDIUM - tester le build Docker après

### QW-005 Ajouter templates .env
- **Action:** Créer `.env.example`, `.env.production.example`, documenter toutes les variables
- **Effort:** 30 min

### QW-006 Archiver la documentation excessive
- **Problème:** 111+ fichiers .md à la racine
- **Action:** Créer `docs/archive/`, déplacer les fichiers obsolètes, garder 5-10 docs actives
- **Effort:** 1h

### QW-007 Consolider les scripts d'installation
- **Problème:** 8 scripts install différents
- **Action:** Garder `install.ps1` comme canonique, archiver les autres dans `scripts/archive/`
- **Effort:** 30 min

### QW-008 Corriger vite.config.ts
- **Actions:**
  - `strictPort: true` (éviter le fallback silencieux)
  - Réduire `usePolling` interval de 30s à 5s
  - Réduire `chunkSizeWarningLimit` de 1000KB à 500KB
- **Effort:** 15 min

---

## PHASE 2 : REFACTORING FRONTEND (20-24h - Semaine 2-3)

### FE-001 [CRITICAL] Extraire composant EditableTableRow générique
- **Problème:** 85%+ duplication CRUD dans 5+ composants (KnownVulnerabilitiesView, KnownIncidentsView, DefensesMitigationsView...)
- **Pattern dupliqué:** isEditing, handleSave, handleCancel, handleDelete, EditableCell
- **Action:** Créer `components/ui/EditableTableRow.tsx` avec props generics
- **Gain:** ~250 lignes supprimées
- **Effort:** 3h
- **Risque:** MEDIUM - tester chaque vue après refactoring

### FE-002 [CRITICAL] Décomposer les composants géants
- **Fichiers critiques:**
  - `ApplicationConfigWizard.tsx` (945 lignes → 4 composants)
  - `PromptfooWizard.tsx` (654 lignes → 3 composants)
  - `TestConfiguration.tsx` (465 lignes → 2 composants)
- **Règle:** Aucun composant > 300 lignes
- **Effort:** 6h
- **Risque:** MEDIUM - extractions mécaniques, pas de changement logique

### FE-003 [HIGH] Modulariser types.ts (936 lignes)
- **Action:** Splitter en 8 fichiers :
  - `types/test-execution.ts` - Config, prompts, résultats
  - `types/compass.ts` - OWASP COMPASS (31 use cases)
  - `types/database.ts` - Modèles Prisma
  - `types/references.ts` - Vulnérabilités, incidents, défenses
  - `types/policy.ts` - AI Policy
  - `types/risk-repository.ts` - AI Risk Repository
  - `types/applications.ts` - Application profiles
  - `types/llm-config.ts` - LLM providers
  - `types/common.ts` - Enums partagés (consolider 5 rating types)
  - `types/index.ts` - Re-export centralisé
- **Effort:** 4h
- **Risque:** LOW - re-exports maintiennent la compatibilité

### FE-004 [HIGH] Simplifier le nesting des providers (18 → ~8 niveaux)
- **Problème:** 18 niveaux de nesting dans App.tsx:442-551
- **Action:**
  1. Fusionner les contextes de référence (Vulnérabilités + Incidents + Défenses + Questions → `ReferenceDataProvider`)
  2. Fusionner les contextes Red Team (RedTeam + RedTeamResults → `RedTeamProvider`)
  3. Créer une fonction `composeProviders()` pour aplatir le nesting
- **Cible:** 8 providers max
- **Effort:** 4h
- **Risque:** MEDIUM - tester les dépendances inter-contextes

### FE-005 [HIGH] Standardiser la gestion d'erreurs des services
- **Problème:** Patterns inconsistants (throw, fallback silencieux, return null)
- **Action:** Créer `services/errorHandler.ts` avec pattern Result<T, E>
- **Effort:** 3h

---

## PHASE 3 : REFACTORING BACKEND (16-20h - Semaine 3-4)

### BE-001 [CRITICAL] Splitter StrixService (664 lignes → 4 services)
- **Fichier:** `backend/apps/api-gateway/src/strix/strix.service.ts`
- **Décomposition:**
  - `StrixCommandBuilder` - Construction des commandes Docker
  - `StrixProcessExecutor` - Gestion des processus
  - `StrixOutputParser` - Parsing des résultats
  - `StrixOrchestrator` - Coordination (conserve le nom StrixService)
- **Effort:** 4h
- **Risque:** MEDIUM - tester l'intégration WebSocket après

### BE-002 [CRITICAL] Remplacer dépendances circulaires par EventEmitter
- **Problème:** Services couplés directement aux Gateways WebSocket
- **Action:** Utiliser `@nestjs/event-emitter` (EventEmitter2)
  - Services émettent des événements
  - Gateways écoutent et broadcastent
- **Effort:** 3h
- **Risque:** LOW - découplage pur, même comportement

### BE-003 [CRITICAL] Extraire ProcessExecutorService base class
- **Problème:** Strix, Garak, Promptfoo gèrent chacun le spawning Docker indépendamment
- **Action:** Créer `shared/ProcessExecutorService` avec méthodes communes
- **Gain:** ~200 lignes de code dupliqué éliminées
- **Effort:** 3h

### BE-004 [HIGH] Implémenter exception filter hierarchy
- **Problème:** Erreurs formatées inconsistamment (raw throw, silent log, formatted return)
- **Action:**
  - Créer `AllExceptionsFilter` global
  - Créer exceptions custom (ProcessExecutionException, DockerException, etc.)
  - Standardiser les réponses d'erreur
- **Effort:** 2h

### BE-005 [HIGH] Corriger validation DTOs
- **Problème:** DTOs sans décorateurs class-validator
- **Action:** Ajouter `@IsNotEmpty()`, `@MaxLength()`, `@IsUrl()` etc. sur tous les DTOs
- **Fichiers:** `strix/dto/`, `garak/dto/`, `promptfoo/dto/`
- **Effort:** 2h

### BE-006 [HIGH] Extraire BaseGateway pour WebSockets
- **Problème:** 90% de code dupliqué entre 3 gateways
- **Action:** Créer `shared/BaseGateway` abstract class
- **Effort:** 2h

---

## PHASE 4 : INFRASTRUCTURE (10-12h - Semaine 4-5)

### INFRA-001 Ajouter resource limits Docker sur tous les services
- **Problème:** Seuls les outils pentest ont des limites
- **Action:** Ajouter CPU/RAM limits sur api-gateway, frontend, postgres, redis
- **Effort:** 1h

### INFRA-002 Corriger l'isolation réseau
- **Problème:** `pentest-isolated-network` avec `internal: false` (pas isolé)
- **Action:** Mettre `internal: true` + configurer egress filtering au niveau API Gateway
- **Effort:** 2h

### INFRA-003 Créer docker-compose.override.yml pour Windows
- **Problème:** Volumes désactivés sur Windows = pas de hot reload
- **Action:** Fichier override avec volumes et polling configurés
- **Effort:** 1h

### INFRA-004 Pin versions des outils (Garak, Promptfoo)
- **Problème:** `pip install garak` et `npm install promptfoo@latest` = non-déterministe
- **Action:** Fixer les versions dans les Dockerfiles
- **Effort:** 30 min

### INFRA-005 Corriger les health checks
- **Problème:** Garak/Strix utilisent `--help` (toujours succès)
- **Action:** Implémenter des checks fonctionnels réels
- **Effort:** 1h

### INFRA-006 Activer Redis/Bull pour les job queues
- **Problème:** Désactivé pour "testing" - pas de queue management
- **Action:** Réactiver et configurer correctement
- **Effort:** 3h

### INFRA-007 Créer packages/shared/ pour types partagés
- **Action:** Workspace npm avec types communs frontend/backend
- **Effort:** 3h
- **Dépend de:** FE-003 (modularisation types.ts)

---

## PHASE 5 : QUALITÉ & TESTS (10h+ - Mois 2+)

### QUAL-001 Ajouter Vitest au frontend
- **Problème:** Aucun framework de test frontend
- **Effort:** 2h (setup + premiers tests)

### QUAL-002 Ajouter ESLint + Prettier au frontend
- **Effort:** 1h

### QUAL-003 Augmenter couverture tests backend (40% → 80%)
- **Effort:** 8h+

### QUAL-004 Ajouter documentation OpenAPI/Swagger
- **Effort:** 3h

### QUAL-005 Implémenter audit logging complet
- **Effort:** 3h

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Phase 0 (URGENT)     ──► Phase 1 (Quick Wins)
                             │
                     ┌───────┼───────┐
                     ▼       ▼       ▼
               Phase 2   Phase 3   Phase 4
              (Frontend) (Backend) (Infra)
                     │       │       │
                     └───────┼───────┘
                             ▼
                        Phase 5
                    (Qualité & Tests)
```

**Dépendances clés :**
- Phase 0 bloque tout le reste
- QW-004 (npm) bloque INFRA-* (Docker)
- FE-003 (types) bloque INFRA-007 (shared package)
- Phase 2 et Phase 3 sont parallélisables
- Phase 5 peut commencer dès que Phase 2+3 sont terminées

---

## RISQUES DE RÉGRESSION

| Refactoring | Risque | Mitigation |
|-------------|--------|------------|
| Suppression geminiService.ts | LOW | Grep tous les imports |
| Hook useLocalStorage | LOW | Tests unitaires du hook |
| Modularisation types.ts | LOW | Re-exports index.ts |
| Fusion des providers | MEDIUM | Test E2E navigation complète |
| Décomposition composants | MEDIUM | Vérifier props/state passing |
| Split StrixService | MEDIUM | Test WebSocket intégration |
| EventEmitter migration | LOW | Même comportement, découplage |
| ProcessExecutorService | MEDIUM | Test Docker execution |
| npm standardization | MEDIUM | Rebuild complet Docker |

---

## MÉTRIQUES DE SUCCÈS

| Métrique | Avant | Cible | Mesure |
|----------|-------|-------|--------|
| Lignes types.ts | 936 | 0 (modularisé) | wc -l types/ |
| Provider nesting | 18 | 8 | Compter dans App.tsx |
| Fichiers >300 lignes | 9+ | 0 | Script de vérification |
| Code dupliqué | ~15% | <5% | jscpd ou similaire |
| Couverture tests | 40% | 80% | npm run test:cov |
| Complexité cyclomatique | 8.2 | <5 | ESLint complexity rule |
| Docs racine | 111+ | 5-10 | ls *.md | wc -l |
| Temps build Docker | ~5min | ~3min | time docker-compose build |
