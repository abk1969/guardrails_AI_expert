# Document d'architecture — AI Risk Manager / Guardrails AI Expert

| Champ | Valeur |
|---|---|
| Version du document | 1.0 |
| Date | 2026-04-21 |
| Repository | `ai_risk_and_red_team_manager/guardrails_AI_expert` |
| Branche de référence | `main` |
| Cible du document | Revue d'architecture (robustesse, modularité) |
| Méthode | Lecture directe du code, pas d'inférence |

> Ce document décrit l'état **réellement observable** du code source à la date indiquée. Les éléments non vérifiables (intention produit, roadmap, performance runtime) ne sont pas inclus. Les faits d'architecture contradictoires avec la documentation existante (CLAUDE.md, ENTERPRISE_ARCHITECTURE_PENTEST_PLATFORM.md) sont tranchés en faveur du code.

---

## 1. Résumé exécutif

AI Risk Manager est une plateforme de test, gouvernance et remédiation des risques IA, construite en deux couches applicatives indépendantes :

1. **Un SPA React 19** qui peut fonctionner **standalone** (mode simulateur, sans backend) ou **full-stack**.
2. **Un backend NestJS 10 en monorepo** (API Gateway + 3 services annexes) avec PostgreSQL/Prisma, Redis/Bull (partiellement désactivé), Socket.IO, et orchestration par `docker exec` de conteneurs Garak et Promptfoo isolés dans un réseau dédié.

Le frontend possède par ailleurs un **second chemin d'exécution serverless** via **Vercel Functions** (`api/v1/*`) qui ré‑implémente un sous-ensemble des endpoints backend (chatbot, llm/test-connection, system/health, unified/metrics).

Le modèle de domaine couvre : OWASP LLM Top 10, OWASP Agentic Top 15, OWASP COMPASS (31 scénarios), OWASP Data Security 2026 (22 DSGAI), MITRE ATLAS/ATT&CK, AI Risk Repository (MIT, 1724+ risques, 74 frameworks), politique IA CLUSIF, MAESTRO.

---

## 2. Périmètre, contraintes et hypothèses

### 2.1 Périmètre fonctionnel (8 sections de navigation, 23 items)

| # | Section (UI FR) | Modules principaux |
|---|---|---|
| 0 | Applications à Tester | `ApplicationProfileManager` |
| 1 | Mode Débutant | `PromptfooWizard` |
| 2 | Mode Expert | `Dashboard`, `PromptfooConfigEditor`, `DatasetManager`, `PromptfooTestExecution` |
| 3 | Plateforme Unifiée | `UnifiedSecurityHub`, `GarakScannerUI` |
| 4 | Gouvernance IA | Cas d'usage, Profil de menace, Surface d'attaque, Préparation Incidents, Politique IA |
| 5 | Red Team & Audit | Revue de Sécurité, Résultats d'Audit |
| 6 | Référentiels | COMPASS, Agentic, Base Risques IA, Vulnérabilités, Incidents, Défenses, Questionnaire Tiers, Wiki |
| 7 | Paramètres | Configuration, Configuration LLM |

### 2.2 Contraintes techniques issues du code

- `package.json` frontend : `"type": "module"`, React 19.1, TypeScript 5.8, Vite 6.2. Aucun linter effectif (scripts `lint` et `type-check` réduits à `tsc --noEmit`).
- `backend/package.json` : `engines.node >=18.0.0, npm >=9.0.0`.
- Coexistence **npm + pnpm** : `backend/package-lock.json` présent (438 Ko) et `backend/.pnpm-store/` présent. Les Dockerfiles backend utilisent `pnpm`.
- Dev non-Linux : `CLAUDE.md` rappelle que les volumes du conteneur `api-gateway` sont désactivés sous Windows → pas de hot-reload backend.

### 2.3 Hypothèses non satisfaites par le code

- **Aucun dossier `backend/prisma/migrations/`** n'existe. La base est manipulée en `prisma db push` (voir `package.json` script `prisma:push`), **sans historique de migration sous contrôle de version**.
- **`JwtAuthGuard` retourne `true` en développement** (bypass documenté côté code).
- **`CacheModule` (Redis) et `BullModule` commentés** dans `apps/api-gateway/src/app.module.ts`.

---

## 3. Vue contextuelle (C4 niveau 1)

```
                       ┌─────────────────────────────┐
                       │    Utilisateurs internes    │
                       │   (RSSI, Red Team, Audit)   │
                       └──────────────┬──────────────┘
                                      │ HTTPS
                                      ▼
       ┌──────────────────────────────────────────────────────┐
       │                   AI Risk Manager                    │
       │  ┌──────────────┐       ┌───────────────────────┐    │
       │  │ SPA React 19 │──REST─│ NestJS API Gateway    │    │
       │  │ (Vite)       │◀──WS──│  (Socket.IO + REST)   │    │
       │  └──────┬───────┘       └───────────┬───────────┘    │
       │         │                           │                │
       │         │ (mode Vercel)             │ docker exec    │
       │         ▼                           ▼                │
       │  ┌──────────────┐       ┌───────────────────────┐    │
       │  │ Vercel Funcs │       │ Garak / Promptfoo     │    │
       │  │ api/v1/*.ts  │       │ (conteneurs isolés)   │    │
       │  └──────┬───────┘       └───────────────────────┘    │
       │         │                                            │
       └─────────┼────────────────────────────────────────────┘
                 │                 │                   │
                 ▼                 ▼                   ▼
          ┌─────────────┐   ┌───────────────┐  ┌───────────────┐
          │ LLM Providers│  │  PostgreSQL   │  │   Vault (opt) │
          │ (10 SDKs)    │  │  + Redis      │  │  secrets mgmt │
          └──────────────┘  └───────────────┘  └───────────────┘
```

Acteurs externes : utilisateurs humains, fournisseurs LLM (Gemini, OpenAI, Anthropic, Mistral, Groq, DeepSeek, Qwen, xAI, Ollama, LM Studio), Vault (facultatif), Neon Postgres (prod alt.).

---

## 4. Vue conteneurs (C4 niveau 2)

### 4.1 Inventaire des conteneurs (docker‑compose.yml, dev)

| Conteneur | Image / Build | Ports hôte | Réseaux | Limites CPU/RAM |
|---|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5435→5432 | airiskmgr | — |
| `redis` | `redis:7-alpine` | 6380→6379 | airiskmgr | — |
| `api-gateway` | `backend/` (target: development) | 3003→3001 | airiskmgr + monte `/var/run/docker.sock` | — |
| `test-execution-service` | `backend/apps/test-execution-service/Dockerfile` | — | airiskmgr | — |
| `frontend` | `./Dockerfile` (target: development) | 3004→3000 | airiskmgr | — |
| `adminer` | `adminer:latest` | 8082→8080 | airiskmgr | — |
| `redis-commander` | `rediscommander/redis-commander:latest` | 8081→8081 | airiskmgr | — |
| `mailhog` | `mailhog/mailhog:latest` | 1025, 8025 | airiskmgr | — |
| `prometheus` | `prom/prometheus:latest` | 9090→9090 | airiskmgr | — |
| `grafana` | `grafana/grafana:latest` | 3002→3000 | airiskmgr | — |
| `garak-runner` | `backend/docker/garak/Dockerfile` | — (interne) | **pentest-isolated** + airiskmgr | 2.0 CPU / 2 Go |
| `promptfoo-runner` | `backend/docker/promptfoo/Dockerfile` | — (interne) | **pentest-isolated** + airiskmgr | 1.0 CPU / 1 Go |

**Réseaux** : `airiskmgr-network` (bridge), `pentest-isolated-network` (bridge, `internal: false`). Garak et Promptfoo sont attachés aux deux réseaux, ce qui permet à l'API Gateway d'exécuter des commandes par `docker exec`. **L'isolation "strict" annoncée n'est pas effective** : les conteneurs de pentest restent joignables depuis le réseau principal.

### 4.2 Différences en production (`docker-compose.production.yml`)

- Décomposition en **4 réseaux** : `frontend-network`, `backend-network` (`internal:true`), `tools-network` (`internal:true`), `database-network` (`internal:true`).
- Nouveaux conteneurs : `orchestrator`, `github-sync`, `minio`, `elasticsearch`, `kibana`.
- Limites de ressources systématiques, utilisateurs non-root, `cap_drop: ALL`, `no-new-privileges:true`.
- Variables blue/green (`COLOR`, `IMAGE_TAG`).

### 4.3 Chemin serverless (Vercel)

Le frontend expose une **seconde API fonctionnelle** sous `api/v1/`, indépendante du backend NestJS :

| Fichier | Endpoint | Responsabilité |
|---|---|---|
| `api/v1/system/health.ts` | `GET /api/v1/system/health` | Statut DB Neon + ok |
| `api/v1/chatbot/send.ts` | `POST /api/v1/chatbot/send` | Chatbot Gemini avec résumé DSGAI inliné (voir commit `9f72e0d`) |
| `api/v1/llm/test-connection.ts` | `POST /api/v1/llm/test-connection` | Test de connectivité multi‑providers |
| `api/v1/unified/metrics.ts` | `GET /api/v1/unified/metrics` | Métriques agrégées |
| `api/lib/neon.ts` | — | Client Neon (`@neondatabase/serverless`) |

`vercel.json` : `maxDuration: 30s` pour les fonctions, rewrites SPA (`/((?!api|assets).*) → /index.html`).

**Conséquence architecturale** : il existe **deux implémentations parallèles** du chatbot et du test de connexion LLM (NestJS vs Vercel). La logique métier peut diverger.

---

## 5. Vue composants — Frontend

### 5.1 Topologie React

- `index.html` charge `index.tsx` → `<StrictMode><App/></StrictMode>`.
- `App.tsx` (557 lignes) : encapsule **22 providers de contexte** imbriqués (ordre ci-dessous), une `Suspense` globale et un switch sur `activeNav`.

```
LanguageProvider → NavigationProvider → ApplicationProfileProvider →
AIPolicyProvider → AIRiskRepositoryProvider → CompassProvider →
AgenticSecurityProvider → WikiProvider → DatasetProvider → TestRunProvider →
SettingsProvider → LLMConfigProvider → UseCaseProvider → ThreatProfileProvider →
AttackSurfaceProvider → KnownVulnerabilitiesProvider → KnownIncidentsProvider →
IncidentReadinessProvider → RedTeamProvider → RedTeamResultsProvider →
DefensesMitigationsProvider → AIThirdPartyQuestionsProvider
```

> `CLAUDE.md` mentionne 23 providers, le code en contient 22. Le document tranche en faveur du code.

### 5.2 Répertoires significatifs

| Répertoire | Contenu réel | Remarque |
|---|---|---|
| `components/` | 39 .tsx racine + 7 sous-dossiers (`chatbot`, `compass`, `navigation`, `policy`, `repository`, `ui`, `wiki`) | Domaines fonctionnels monolithiques |
| `src/components/` | `unified/` (`GarakScannerUI`, `UnifiedSecurityHub`, `UnifiedOrchestrationDashboard`) + `ui/Card.tsx` | **Dualité** : deux racines de composants (`components/` et `src/components/`) et **deux `Card`** (`components/ui/Card.tsx` + `src/components/ui/Card.tsx`). Source de confusion d'import. |
| `contexts/` | 22 contextes | Pas de middleware (Redux, Zustand, Recoil absents) |
| `services/` | 12 services applicatifs | Logique métier centralisée côté client |
| `types/` | 12 modules + `index.ts` (barrel) | Aucune duplication de noms (validé) |
| `hooks/` | `useLocalStorage`, `useAllContexts` | `useAllContexts` agrège les 22 contextes pour le chatbot / MCP |
| `constants/` | `llmProviders.ts` (10 providers) | — |
| `constants.ts` | 1 081 lignes | Monofichier, bibliothèque d'attaques (40+ templates), catégories, targets |
| `data/` | 15 fichiers (5,8 Mo) | Données statiques typées TS : COMPASS, AI Policy, AI Risk DB, OWASP DSGAI, Agentic, Wiki |
| `types.ts` racine | 14 lignes | Re‑export legacy vers `/types/` |
| `frontend-refactored/` | Archive non active | À nettoyer ou décommissionner formellement |

### 5.3 Services applicatifs (`services/`)

| Service | Responsabilité | Intégration backend |
|---|---|---|
| `backendApiService` | REST + Socket.IO vers API Gateway | JWT Bearer |
| `backendStatus` | Singleton de détection santé backend (TTL 1 min, arrêt après 2 échecs) | `GET /system/health` |
| `geminiServiceSecure` | Proxy prompts Gemini côté backend | `POST /gemini/generate-prompts` |
| `promptfooAutomationService` | Wizard Promptfoo : estimation, dry‑run, exécution | `/promptfoo/*` |
| `promptfooIntegrationService` | Génération YAML + parsing résultats | `/promptfoo/*` |
| `yamlGenerator` | Construction `promptfooconfig.yaml` | — |
| `testRunnerService` | Simulateur local (défaut, no real API call) | — |
| `sandboxService` | Exécution sandbox | — |
| `datasetImportService` | Import CSV/JSON | — |
| `agenticChatService` / `agenticService` | Chatbot + analyse de risque | `/chatbot/send` |
| `mcpClientService` | Client MCP pour récupération contexte 28 outils | `/mcp/*` |

### 5.4 Persistance locale (localStorage)

| Clé | Source | Nature |
|---|---|---|
| `llmGuardrailTestHistory` | `TestRunContext` | Historique de test (20 derniers runs) |
| `llmGuardrailScoringSettings` | `SettingsContext` | Paramètres de scoring |
| `llm-global-config` | `LLMConfigContext` | Configuration LLM centralisée |
| `compass-ooda-progress`, `compass-language` | `CompassContext` | Progression OODA |
| `app-language` | `LanguageContext` | Langue FR/EN |
| `app-profiles` | `ApplicationProfileContext` | Profils d'applications testées |

> Note de sécurité : la clé `llm-global-config` peut contenir des clés API utilisateur en clair côté navigateur. Le mode simulateur est activé par défaut pour éviter toute fuite externe.

### 5.5 Build / tooling

- **Vite** : port 5080, HMR 3004, alias `@/→./`, manualChunks `react-vendor`/`socket-vendor`, pas de sourcemap.
- **TypeScript** : target ES2022, module ESNext, `jsx: react-jsx`, `moduleResolution: bundler`, `noEmit`.
- `VITE_API_URL` : `http://localhost:3001/api/v1` (dev) ou `/api/v1` (prod Vercel, same-origin).

---

## 6. Vue composants — Backend

### 6.1 Monorepo NestJS (`nest-cli.json`)

| Projet | Type | Root | Entry | Statut |
|---|---|---|---|---|
| `api-gateway` | application (root) | `apps/api-gateway` | `main` | actif |
| `database` | library | `libs/database/src` | `index` | actif |
| `auth` | library | `libs/auth/src` | `index` | actif |
| `common` | library | `libs/common/src` | `index` | **vide** |

Applications présentes **hors** `nest-cli.json` :

- `apps/test-execution-service/` : Dockerfile + référencé dans `docker-compose.yml`, **pas de code source visible**. Placeholder.
- `apps/github-sync-service/` : 13 fichiers TS (webhooks GitHub, builder Docker, déploiement bleu/vert, notifications Slack/SMTP).
- `apps/vault-integration/` : client HashiCorp Vault (get/set/delete) avec fallback env.

### 6.2 Bootstrap `main.ts` (API Gateway)

- Port : `PORT` env (3001 par défaut).
- Préfixe global : `API_PREFIX` (par défaut `api`), versioning URI (`/api/v1/...`).
- Middlewares : `helmet` (CSP désactivée pour WebSocket), `compression`, `ValidationPipe` global (whitelist, transform, implicit conversion).
- CORS : origines `CORS_ORIGIN` + `http://localhost:5080`, `5081`, `3000`.
- Swagger : `/api/docs`.
- Throttling : `THROTTLE_TTL` (60 s) / `THROTTLE_LIMIT` (100 req). Override 10/min sur les tests.
- **Pas de filtre d'exception global ni d'intercepteur d'audit** dans `main.ts`.

### 6.3 Modules feature (`apps/api-gateway/src/`)

16 modules : `analytics`, `auth`, `chatbot`, `garak`, `gemini`, `llm`, `mcp`, `policies`, `promptfoo`, `risks`, `shared`, `system`, `tests`, `unified`, `users`, `docker`.

#### 6.3.1 Matrice des routes exposées

| Module | Méthode + Route | Rôle requis | Notes |
|---|---|---|---|
| **tests** | POST `/tests/run` | TESTER, ADMIN | throttle 10/min |
| | GET `/tests/runs` | TESTER, ADMIN, ANALYST, VIEWER | paginée |
| | GET `/tests/runs/:id` | idem | — |
| | GET `/tests/runs/:id/results` | idem | paginée |
| | POST `/tests/runs/:id/cancel` | TESTER, ADMIN | — |
| | POST `/tests/runs/:id/retry` | TESTER, ADMIN | — |
| | GET `/tests/targets` | TESTER, ADMIN, VIEWER | — |
| | POST `/tests/targets` | ADMIN | — |
| | GET `/tests/prompt-templates` | TESTER, ADMIN, VIEWER | filtre category/complexity |
| **garak** | POST `/garak/scan` | — | `docker exec` dans `airiskmgr-garak-runner`, timeout 1 h |
| | GET `/garak/health` | — | `docker inspect` du conteneur |
| | GET `/garak/results/:id` | — | — |
| **promptfoo** | POST `/promptfoo/run` | public | YAML inline |
| | GET `/promptfoo/status/:id` | public | — |
| | GET `/promptfoo/results/:id` | public | — |
| | GET `/promptfoo/runs` | public | — |
| | GET `/promptfoo/health` | public | — |
| | POST `/promptfoo/dry-run` | public | validation YAML sans exécution |
| **gemini** | POST `/gemini/generate-prompts` | — | SDK `@google/genai`, modèle `gemini-3-flash-preview` |
| | POST `/gemini/chat` | — | — |
| **llm** | POST `/llm/test-connection` | — | 10 providers |
| **mcp** | POST `/mcp/query` | — | 28 outils |
| | POST `/mcp/tools/list` | — | — |
| **policies** | GET `/policies` | JwtAuthGuard | — |
| **risks** | GET `/risks` | JwtAuthGuard | — |
| **users** | GET `/users/me` | — | — |
| **analytics** | GET `/analytics/dashboard` | — | org-scoped |
| **system** | GET `/system/health` | public | — |
| **unified** | GET `/unified/metrics` | — | agrégation Garak + Promptfoo |
| | POST `/unified/orchestration/start` | — | orchestration pentest |
| | GET `/unified/orchestration/:id` | — | — |
| | POST `/unified/orchestration/:id/stop` | — | — |
| **chatbot** | POST `/chatbot/send` | — | agent ReAct (think/act/observe) |

> **Observation de robustesse** : les routes `/promptfoo/*`, `/garak/*`, `/gemini/*`, `/llm/*`, `/mcp/*`, `/chatbot/send` n'exigent **pas** d'authentification. Associé au fait que `JwtAuthGuard` est documenté comme **bypassé en développement**, la surface d'attaque API en local est très large.

#### 6.3.2 Passerelles WebSocket (Socket.IO)

| Namespace | Événements émis | Source |
|---|---|---|
| `/tests` | `test:progress:{id}`, `test:result:{id}`, `test:complete:{id}`, `test:error:{id}` | `tests.gateway.ts` |
| `/garak` | progress, result, complete, error | `garak.gateway.ts` |
| `/chatbot` | `chatbot:thinking:{sid}`, `chatbot:tool_call:{sid}`, `chatbot:tool_result:{sid}`, `chatbot:complete:{sid}` | `chatbot.gateway.ts` |

### 6.4 Couche MCP (`apps/api-gateway/src/mcp/`)

28 outils exposés sous la forme d'un **MCP-like REST** (`POST /mcp/query`). **Il ne s'agit pas d'un serveur MCP au sens protocole** ; c'est une API HTTP reprenant les schémas et nommages MCP.

| Catégorie | Nombre | Exemples |
|---|---|---|
| Database tools | 12 | `search_ai_policies`, `search_vulnerabilities`, `analyze_risk_trends` |
| Static data tools | 13 | `search_compass_scenarios`, `search_owasp_llm_top_10`, `search_agentic_security_threats` |
| DSGAI tools | 3 | `search_dsgai_patterns`, `get_dsgai_pattern`, `search_dsgai_mitigations` |

Fichiers statiques sous `mcp/static-data/` :

| Fichier | Taille | Objet |
|---|---|---|
| `ai-risk-database.json` | 636 Ko | 1 724+ risques, 74 frameworks |
| `owasp-data-security-2026.json` | 217 Ko | OWASP DSGAI 2026 (22 patterns) |
| `agentic-security-threats.json` | 53 Ko | 29 menaces agentiques / 9 couches MAESTRO |
| `compass-scenarios.json` | 49 Ko | 31 scénarios COMPASS |
| `module-explanations.json` | 6 Ko | descriptions UI |

### 6.5 Librairies partagées (`libs/`)

| Lib | Exports | Observation |
|---|---|---|
| `@app/database` | `DatabaseModule`, `PrismaService` | injection globale Prisma |
| `@app/auth` | `AuthModule`, guards (JWT, Local, Roles, WsJwt), strategies, decorators (`@Public`, `@Roles`, `@CurrentUser`) | `JwtAuthGuard.canActivate()` court-circuité en dev |
| `@app/common` | (vide) | À planifier |

### 6.6 Files d'attente et cache

- Dans `apps/api-gateway/src/app.module.ts` : `CacheModule` (Redis) **commenté**, `BullModule` **commenté** (contournement dev).
- `apps/github-sync-service/` : file Bull active (`github-sync`, retry x3, backoff exponentiel 2 s, `removeOnComplete: 100`).
- Conséquence : les endpoints backend tests n'utilisent **pas** de file asynchrone effective ; l'exécution pentest est lancée en direct via `docker exec`.

### 6.7 Intégration des outils de pentest

- Garak : `docker exec airiskmgr-garak-runner` avec CLI Garak 0.14.0. Output monté via volume `garak_output`. Max buffer 10 Mo, timeout 3 600 000 ms.
- Promptfoo : `docker exec airiskmgr-promptfoo-runner` pour évaluer un YAML, résultats JSON dans volume.
- Prérequis : l'API Gateway monte `/var/run/docker.sock` → **elle a Docker root sur l'hôte**. Point de vigilance majeur de robustesse (cf. §10).

---

## 7. Modèle de données

### 7.1 Prisma (`backend/prisma/schema.prisma`, 521 lignes)

Datasource PostgreSQL, generator `prisma-client-js` (binaryTargets `native`, `debian-openssl-3.0.x`).

#### Modèles (18) regroupés par domaine

| Domaine | Modèles |
|---|---|
| Identité & tenant | `Organization`, `User`, `RefreshToken` |
| Exécution de tests | `TestTarget`, `TestRun`, `TestResult`, `PromptTemplate` |
| Gouvernance des risques | `UseCase`, `ThreatProfile`, `KnownVulnerability` |
| Politique IA | `AIPolicy` |
| Audit & événementiel | `AuditLog`, `EventStore` |
| Notifications | `Notification` |
| Configuration | `SystemSetting`, `FeatureFlag` |

#### Enums (12) — extrait

`Plan`, `Role` (6 rôles : SUPER_ADMIN, ADMIN, SECURITY_OFFICER, TESTER, ANALYST, VIEWER), `AIComponentType`, `TestRunStatus`, `TestStatus`, `GuardrailCategory`, `PromptComplexity`, `ThreatRating`, `VulnerabilitySeverity`, `PolicyRuleStatus`, `NotificationType`.

#### Modélisation tenant et soft‑delete

- Multi‑tenant implicite par `organizationId` sur `TestTarget`, `TestRun`, `UseCase`, `ThreatProfile`, `KnownVulnerability`, `User`, `AIPolicy` (nullable).
- Soft delete (`deletedAt`) sur `Organization`, `User`, `TestTarget`, `TestRun`.
- Unicités : `Organization.slug`, `User.email`, `RefreshToken.token`, `SystemSetting.key`, `FeatureFlag.name`.
- Chiffrement : `TestTarget.apiHeaders` est stocké chiffré (AES‑256, documenté côté CLAUDE.md, valeur contrôlée par `ENCRYPTION_KEY`).

#### Point critique

- **Aucune migration Prisma versionnée** (`backend/prisma/migrations/` absent). La cohérence entre `schema.prisma` et les bases déployées dépend exclusivement de `prisma db push`, sans audit trail du schéma.

### 7.2 Types frontend (`types/`, 12 modules)

| Module | Types principaux |
|---|---|
| `test-execution` | `GuardrailCategory`, `TestPrompt`, `PromptComplexity`, `TestConfiguration`, `TestResult`, `AIComponentType` |
| `references` | `Reference`, `DefenseMitigation`, `VulnerabilityEntry` |
| `policy` | `AIPolicyRule`, `PolicyChapter`, `RiskScenario` |
| `risk-repository` | `AIRiskEntry`, `AIRiskMetadata`, `IncludedResource` |
| `compass` | `CompassUseCase`, `OWASPSheet`, `OODAPhase`, `OODAProgress`, **`BilingualText`** |
| `applications` | `ApplicationProfile`, `ApplicationCategory` |
| `llm-config` | `LLMConfiguration`, `LLMProviderInfo`, `LLMModel` |
| `agentic-security` | `AgenticThreat`, `MAESTROFramework` |
| `chatbot` | `ChatMessage`, `ToolCall`, `ReasoningStep` |
| `garak` | `GarakScanConfig`, `GarakScanResult`, `GarakProbeType`, `GarakSeverity` |
| `promptfoo` | `PromptfooWizardConfig`, `PromptfooEstimation`, `PromptfooTargetPreset` |
| `index` | barrel |

Dédoublonnage vérifié. `types.ts` racine (14 lignes) n'est qu'un ré-export de compatibilité.

### 7.3 Contenus statiques typés (`data/`)

15 fichiers, 5,8 Mo. Points notables :

- `compassContent.ts` (82 Ko) : 31 scénarios COMPASS bilingues.
- `owaspDataSecurity2026.generated.ts` (223 Ko) : généré par `scripts/parse-owasp-data-security-pdf.cjs`.
- `aiPolicyContentNew.ts` (264 Ko) + `aiPolicyContent.ts` (183 Ko) : **deux versions coexistent**. Vérifier la source de vérité.
- `aiRiskDatabaseParsed.json` (2,3 Mo) : AI Risk Repository v3/v4 parsé.

---

## 8. Communication et contrats

### 8.1 Frontend ↔ Backend (REST)

- Base URL construite par Vite : `VITE_API_URL` (dev `http://localhost:3001/api/v1`, prod `/api/v1`).
- `VITE_MCP_API_URL` : `…/api/v1/mcp`, avec `VITE_MCP_MOCK_MODE` pour bypass.
- Authentification : JWT Bearer (actuellement non appliqué, cf. §6).

### 8.2 Frontend ↔ Backend (WebSocket)

- Socket.IO client → gateways `/tests`, `/garak`, `/chatbot`.
- Events typés côté backend, consommés dans `TestRunContext` et les composants chatbot.

### 8.3 Backend ↔ Outils

- `docker exec` synchrone (long-running, jusqu'à 1 h pour Garak).
- Résultats récupérés via volumes partagés (`garak_output`, `promptfoo_output`).

### 8.4 Backend ↔ LLM

SDK chargés côté backend (versions observées dans `backend/package.json`) :

| Provider | SDK npm | Version |
|---|---|---|
| Anthropic Claude | `@anthropic-ai/sdk` | 0.68.0 |
| Google Gemini | `@google/genai` | 1.28.0 |
| Google (alt.) | `@google/generative-ai` | 0.24.1 |
| Mistral | `@mistralai/mistralai` | 1.10.0 |
| Groq | `groq-sdk` | 0.34.0 |
| OpenAI | `openai` | 6.8.1 |
| DeepSeek / Qwen / xAI / Ollama / LM Studio | HTTP natif | — |

Le service `LLMService` contient une méthode de test par provider (`testGemini`, `testOpenAI`, …). `GeminiService` utilise exclusivement `gemini-3-flash-preview` (codé en dur).

---

## 9. Sécurité

### 9.1 Authentification et RBAC

- Stratégies Passport : JWT (`libs/auth/src/strategies/jwt.strategy.ts`) et Local.
- Garde `JwtAuthGuard` : **retourne `true` en dev** (observation directe). `RolesGuard` actif selon `@Roles()`.
- 6 rôles déclarés (voir §7.1), appliqués seulement sur le module `tests` et partiellement sur `policies`/`risks` (`@UseGuards(JwtAuthGuard)`).

### 9.2 Secrets et crypto

- `bcrypt` pour les mots de passe (`seed.ts` : 10 rounds).
- `JWT_SECRET`, `ENCRYPTION_KEY` attendus en env. `.env.example` fournit des placeholders de dev. L'audit mémoire signale que la valeur par défaut observée précédemment (`dev-jwt-secret...`) est **faible**.
- Vault HashiCorp : intégration optionnelle (`VAULT_ENABLED=true`), sinon fallback env. Mount par défaut `secret` (KV v2). Politiques `app-policy` (read-only) et `admin-policy` (CRUD).
- `.vercel/project.json` commité (projectId + orgId) — non sensible.

### 9.3 Défense réseau

- Helmet, compression, CORS liste blanche (localhost 3000/5080/5081 + `CORS_ORIGIN`).
- Throttler global 100 req/60 s + override 10/min sur `POST /tests/run`.
- Dev : réseau Docker `pentest-isolated-network` **non `internal`** ; isolation effective insuffisante.
- Prod : 4 réseaux avec 3 `internal: true` (backend, tools, database). Isolation correcte sous réserve d'un ingress (nginx) correctement déployé.

### 9.4 Points d'attention sécuritaires

| # | Constat | Fichier / preuve |
|---|---|---|
| S1 | `JwtAuthGuard` bypass en dev | `libs/auth/src/guards/jwt-auth.guard.ts` |
| S2 | Nombreuses routes `@Public()` (promptfoo complet) | `promptfoo.controller.ts` |
| S3 | `/var/run/docker.sock` monté dans l'API Gateway | `docker-compose.yml` |
| S4 | Absence de migrations Prisma versionnées | `backend/prisma/` |
| S5 | Clés LLM utilisateur persistées en localStorage | `LLMConfigContext` |
| S6 | Deux implémentations du chatbot (NestJS + Vercel) | `chatbot.controller.ts` vs `api/v1/chatbot/send.ts` |
| S7 | Modèle Gemini codé en dur (`gemini-3-flash-preview`) | `gemini.service.ts` |
| S8 | Pas d'intercepteur d'audit global — `AuditLog` non alimenté automatiquement | `main.ts`, `apps/api-gateway/src/*.controller.ts` |

### 9.5 Mode simulateur (frontend)

Mode par défaut (`testRunnerService.mockTestRunner`). Aucune requête vers la cible n'est émise, les clés n'atteignent pas le backend. Le mode `sandbox`/`backend` est opt-in.

---

## 10. Topologie d'infrastructure & déploiement

### 10.1 Environnements

| Env | Compose | Particularités |
|---|---|---|
| Dev local Docker | `docker-compose.yml` | 12 services, 2 réseaux |
| Dev local standalone | `npm run dev` + Vite | Frontend seul, mode simulateur |
| Prod self-hosted | `docker-compose.production.yml` | 4 réseaux, orchestrator, MinIO, ELK, resource limits |
| Prod Vercel | `vercel.json` | SPA + 4 Serverless Functions, Neon Postgres |

### 10.2 CI/CD (`.github/workflows/ci-cd.yml`)

Pipeline linéaire : `lint → test-backend + test-frontend → test-e2e (Playwright via docker-compose) → security (Trivy + npm audit) → build-push (GHCR) → deploy-staging (branch develop) / deploy-production (branch main)`.

Production : `azure/k8s-deploy` contre `infrastructure/kubernetes/production/`, étape `kubectl exec` pour migration, notification Slack.

> **Écart** : la CI lance `prisma migrate deploy` alors que le repo ne contient pas de dossier `migrations/`. Cette étape échouera silencieusement ou partiellement selon l'état du target.

### 10.3 Observabilité

- **Prometheus** : scrape de `api-gateway`, `orchestrator`, `github-sync`, `promptfoo-service`, `garak-service`, `postgres`, `redis`, `node-exporter`.
- **Grafana** : datasource Prometheus par défaut, dashboards provisionnés, plugins `grafana-piechart-panel`.
- **Alertes** (`alerts.yml`) : `CRITICAL` (ServiceDown, HighErrorRate, CriticalVulnerabilitiesFound, DB/Redis disconnect), `HIGH` (High memory/CPU/disk), `WARNING` (SlowTests, HighAPIResponseTime), `INFO` (NewVersionDeployed).
- **Logging prod** : Elasticsearch 8.11 + Kibana 5601, driver Docker `json-file` (max 10 Mo, max 5 fichiers).
- **Mailhog** : SMTP local pour dev.

### 10.4 Stockage et données

- PostgreSQL : volume `postgres_data` (dev) / `postgres-data` + `postgres-backups` (prod).
- Redis : volume `redis_data` / `redis-data`.
- MinIO (prod) : `minio-data` pour artefacts et rapports.
- Volumes pentest : `garak_output`, `promptfoo_output`, `promptfoo_configs`, `garak-cache` (prod).

### 10.5 Outillage installation

14 scripts PowerShell à la racine (`install.ps1`, `install-auto.ps1`, `install-auto-v2.ps1`, `install-auto-clean.ps1`, `install-complete.ps1`, `install-tools.ps1`, `quick-install.ps1`, `test-install.ps1`, `update.ps1`, `uninstall.ps1`, `rebuild-pentest-tools.ps1`, `migrate.ps1`, `backup.ps1`, `dev.ps1`). La duplication rend la source de vérité d'installation ambiguë.

---

## 11. Chaînes de scripts de données

Répertoire `scripts/` (CJS, Python marginal) :

| Script | Rôle |
|---|---|
| `transform-compass-data.cjs` | Excel (19 feuilles) → `data/compassContent.ts` |
| `parse-ai-risk-database.cjs` | Excel AI Risk Repository → JSON |
| `parse-owasp-data-security-pdf.cjs` | PDF DSGAI 2026 → TypeScript |
| `parse-agentic-security.cjs` | OWASP Agentic Top 10 → TS |
| `generate-agentic-security-ts.cjs` | Génération artefact TS |
| `analyze-compass-relationships.cjs` + `link-compass-relationships.cjs` + `update-compass-with-relationships.cjs` | Liaisons COMPASS ↔ vulnérabilités ↔ incidents ↔ défenses |
| `translate-compass-content.cjs` + `finalize-compass-translations.cjs` | Traductions FR/EN |
| `extract-v4-sheets.cjs`, `compare-v3-v4.cjs`, `extract-dsgai-json.cjs` | Versions AI Risk Repo |
| `test-owasp-data-security-ui.py` | Validation UI DSGAI |

Données sources dans `data_ai_risk/` (XLSX V3/V4, PDF OWASP, CLUSIF PSSI IA) et extraits dans `data_ai_risk/extracted/` (14 JSON).

---

## 12. Qualité, tests et gouvernance du code

### 12.1 Tests

| Niveau | Dispositif |
|---|---|
| Backend unitaire | `jest.config.js` + `npm run test` |
| Backend e2e | `apps/api-gateway/test/jest-e2e.json` |
| Frontend unitaire | Dépendance non présente dans `package.json` racine |
| Frontend e2e | `npx playwright install` dans CI, mais **pas de scripts `test:e2e` côté `package.json` frontend** — présence ambigüe |
| Capture écrans | Dossier `.test-screenshots/` (artefacts CI historiques) |

### 12.2 Linting / formatage

- Backend : ESLint + Prettier configurés (`@typescript-eslint/*`, `eslint-config-prettier`).
- Frontend : pas de ESLint/Prettier déclaré ; `npm run lint` → `tsc --noEmit`.

### 12.3 Journalisation des travaux

- Répertoire `.checkpoints/` (stateful) et plus de 100 `.md` à la racine (historiques de phases, plans, résumés). Source importante de bruit documentaire.

---

## 13. Couverture référentielle

| Référentiel | Intégration | Localisation |
|---|---|---|
| OWASP LLM Top 10 | Attack library + MCP tool `search_owasp_llm_top_10` | `constants.ts`, `mcp/static-data/` |
| OWASP Agentic Top 15 | `KnownVulnerability.owaspAgenticTop15`, MCP tool dédié, 29 menaces | `schema.prisma`, `agentic-security-threats.json` |
| OWASP COMPASS | Module frontend complet (6 composants), 31 scénarios, OODA Loop | `components/compass/`, `compass-scenarios.json` |
| OWASP Data Security 2026 (DSGAI) | 22 patterns, 3 outils MCP, chatbot awareness | `owasp-data-security-2026.json`, `api/v1/chatbot/send.ts` |
| MITRE ATLAS / ATT&CK | Mappings dans `CompassUseCase.attackMapping` | `types/compass.ts`, `compassContent.ts` |
| AI Risk Repository (MIT) | 1 724+ risques, 74 frameworks, double taxonomie | `data_ai_risk/extracted/ai_risk_database_v3.json` |
| NIST AI RMF, ISO 42001, CIS AI Controls | Inclus dans AI Risk Repository | même source |
| CLUSIF PSSI IA | Politique IA (22 règles CLUSIF) | `data/aiPolicyContent*.ts` |
| MAESTRO | 9 couches agentiques | `agentic-security-threats.json` |

---

## 14. Évaluation de robustesse et modularité (observations)

Cette section liste les faits observés **susceptibles d'impacter la robustesse et la modularité**, sans prescrire de solution.

### 14.1 Forces

- **Séparation stricte frontend / backend** : chaque couche démarre indépendamment ; le mode simulateur rend le SPA utilisable sans backend.
- **Typage domaine complet** : 12 modules de types frontend + 18 modèles Prisma sans duplication de noms, couverture explicite des référentiels OWASP.
- **Isolation des outils offensifs** : conteneurs dédiés (Garak, Promptfoo) avec limites CPU/mémoire, utilisateurs non‑root, `cap_drop: ALL`.
- **Monorepo NestJS** : 16 modules feature découpés par domaine, passerelles WebSocket par domaine, librairies partagées (`@app/*`).
- **Pipeline CI/CD complet** : lint, tests, e2e, Trivy, npm audit, build GHCR, déploiement K8s staging/prod.
- **Observabilité cadrée** : Prometheus/Grafana, règles d'alerte stratifiées en 4 niveaux.

### 14.2 Points de fragilité (faits)

| # | Constat | Preuve |
|---|---|---|
| F1 | **Double racine de composants** (`components/` et `src/components/`) et double `Card` | `components/ui/Card.tsx` vs `src/components/ui/Card.tsx` |
| F2 | **22 providers de contexte empilés** sans découpage par domaine d'activité (un seul arbre) | `App.tsx` |
| F3 | **Double implémentation d'API** (NestJS + Vercel Functions) avec contrats proches mais dérivables | `apps/api-gateway/src/chatbot/*` vs `api/v1/chatbot/send.ts` |
| F4 | **Co‑existence npm + pnpm** sur le backend | `backend/package-lock.json` + `backend/.pnpm-store/` |
| F5 | **Pas de migrations Prisma versionnées** | `backend/prisma/` (absence de `migrations/`) |
| F6 | **`JwtAuthGuard` désactivé en dev**, nombreuses routes publiques | `@Public()` dans `promptfoo.controller.ts`, `jwt-auth.guard.ts` |
| F7 | **Montage de `docker.sock`** dans l'API Gateway (escalade potentielle) | `docker-compose.yml` |
| F8 | **Bull + Redis cache commentés** dans `AppModule` | `apps/api-gateway/src/app.module.ts` |
| F9 | **`apps/test-execution-service` déclaré mais sans code source** | `apps/test-execution-service/` (Dockerfile seul) |
| F10 | **`libs/common` vide** | `libs/common/src/` |
| F11 | **14 scripts d'installation PowerShell** concurrents | racine du repo |
| F12 | **100+ fichiers `.md` racine** (historique de décisions, plans) | racine du repo |
| F13 | **Modèle Gemini codé en dur** (`gemini-3-flash-preview`) | `gemini/gemini.service.ts` |
| F14 | **Deux versions coexistantes** `aiPolicyContent.ts` et `aiPolicyContentNew.ts` | `data/` |
| F15 | **Deux fichiers de documentation d'architecture** préexistants (`ARCHITECTURE_FULLSTACK.md`, `ENTERPRISE_ARCHITECTURE_PENTEST_PLATFORM.md`) aux contenus divergents du code | racine |
| F16 | **Réseau `pentest-isolated-network` non `internal`** en dev | `docker-compose.yml` |
| F17 | **Aucune alimentation automatique d'`AuditLog`** (pas d'intercepteur Nest global) | `main.ts` |
| F18 | **Dépendance `@neondatabase/serverless` côté frontend** (uniquement utile aux fonctions Vercel) → couplage de build | `package.json` racine |
| F19 | **`frontend-refactored/` inactif** commité | racine |
| F20 | **`test-execution-service` encore référencé dans `docker-compose.yml`** | `docker-compose.yml` |

### 14.3 Indicateurs quantitatifs

| Indicateur | Valeur mesurée |
|---|---|
| LOC `App.tsx` | 557 |
| LOC `constants.ts` | 1 081 |
| LOC `schema.prisma` | 521 |
| Contextes React | 22 |
| Sections de navigation | 8 (23 items) |
| Composants TSX (`components/` racine) | 39 + 45 dans sous‑dossiers |
| Services frontend | 12 |
| Modules de types frontend | 12 |
| Modules backend | 16 |
| Routes REST backend | ≥ 30 |
| Namespaces Socket.IO | 3 |
| Outils MCP exposés | 28 |
| Modèles Prisma | 18 |
| Enums Prisma | 12 |
| Providers LLM intégrés | 10 |
| Services Docker dev | 12 |
| Services Docker prod | ≥ 14 |
| Fichiers MD racine | > 100 |

---

## 15. Annexes

### A. Fichiers clés (chemins absolus relatifs au repo)

```
App.tsx
index.html
index.tsx
vite.config.ts
tsconfig.json
vercel.json
docker-compose.yml
docker-compose.production.yml
Dockerfile
backend/nest-cli.json
backend/package.json
backend/tsconfig.json
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/apps/api-gateway/src/main.ts
backend/apps/api-gateway/src/app.module.ts
backend/apps/api-gateway/src/mcp/mcp.module.ts
backend/apps/api-gateway/src/mcp/static-data/*.json
backend/apps/api-gateway/src/tests/tests.controller.ts
backend/apps/api-gateway/src/garak/garak.service.ts
backend/apps/api-gateway/src/promptfoo/promptfoo.service.ts
backend/apps/api-gateway/src/gemini/gemini.service.ts
backend/apps/api-gateway/src/llm/llm.service.ts
backend/apps/api-gateway/src/chatbot/chatbot.service.ts
backend/libs/auth/src/*
backend/libs/database/src/*
api/v1/chatbot/send.ts
api/v1/llm/test-connection.ts
api/v1/system/health.ts
api/v1/unified/metrics.ts
.github/workflows/ci-cd.yml
infrastructure/monitoring/prometheus/prometheus.yml
infrastructure/monitoring/prometheus/alerts.yml
infrastructure/monitoring/grafana/provisioning/datasources/prometheus.yml
infrastructure/vault/vault-config.hcl
```

### B. Matrice des variables d'environnement

| Clé | Emplacement | Usage |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | backend | Prisma (Neon pooler + direct) |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` | backend | Cache/queue |
| `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` | backend | Auth |
| `ENCRYPTION_KEY` | backend | AES‑256 credentials |
| `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `COHERE_API_KEY` | backend | Providers LLM |
| `CORS_ORIGIN`, `THROTTLE_TTL`, `THROTTLE_LIMIT` | backend | HTTP |
| `VAULT_ENABLED`, `VAULT_MOUNT_PATH`, `VAULT_ADDR`, `VAULT_TOKEN` | backend | Secrets |
| `GITHUB_WEBHOOK_SECRET`, `DOCKER_REGISTRY` | github-sync | CI tools |
| `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | prod | Object storage |
| `GRAFANA_PASSWORD`, `SENTRY_DSN`, `PAGERDUTY_API_KEY` | prod | Observabilité |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `SLACK_WEBHOOK_URL` | prod | Notifications |
| `VITE_API_URL`, `VITE_WS_URL`, `VITE_MCP_API_URL`, `VITE_MCP_MOCK_MODE`, `VITE_DEFAULT_TEST_MODE` | frontend | Vite build |

### C. Événements Socket.IO par namespace

| Namespace | Événement | Payload (indicatif) |
|---|---|---|
| `/tests` | `test:progress:{id}` | `{ testRunId, progress, completed, total }` |
| `/tests` | `test:result:{id}` | `TestResult` |
| `/tests` | `test:complete:{id}` | `{ testRunId, duration }` |
| `/tests` | `test:error:{id}` | `{ testRunId, error }` |
| `/garak` | `progress`, `result`, `complete`, `error` | variable |
| `/chatbot` | `chatbot:thinking:{sid}` | `{ step }` |
| `/chatbot` | `chatbot:tool_call:{sid}` | `{ tool, args }` |
| `/chatbot` | `chatbot:tool_result:{sid}` | `{ tool, result }` |
| `/chatbot` | `chatbot:complete:{sid}` | `{ answer, toolsUsed, iterations }` |

### D. Répartition des 28 outils MCP (par famille)

- **DB (12)** : `search_ai_policies`, `get_policy_by_reference`, `search_test_results`, `get_test_statistics`, `search_use_cases`, `search_threat_profiles`, `search_vulnerabilities`, `search_defenses`, `get_owasp_categories`, `search_prompt_templates`, `get_test_targets`, `analyze_risk_trends`.
- **Données statiques (13)** : `search_compass_scenarios`, `get_compass_scenario_by_id`, `get_compass_statistics`, `search_agentic_security_threats`, `get_agentic_threat_by_id`, `search_ai_risk_database`, `get_ai_risk_entry`, `search_module_explanations`, `get_module_explanation`, `search_owasp_llm_top_10`, `get_owasp_category`, `search_owasp_agentic_top_10`, `get_owasp_agentic_threat`.
- **DSGAI (3)** : `search_dsgai_patterns`, `get_dsgai_pattern`, `search_dsgai_mitigations`.

### E. Changements récents observés via `git log`

```
9f72e0d fix(vercel): inline DSGAI_SUMMARY into send.ts (ESM import issue)
d6d3598 Merge pull request #2 from abk1969/feat/chatbot-mcp-dsgai
ff473b4 feat(vercel): DSGAI awareness in serverless chatbot
9ef441b chore(backend): commit untracked chatbot + llm modules baseline
2496ba2 feat(chatbot): update ReAct system prompt with 28 tools + DSGAI refs
```

---

## 16. Conclusion

L'architecture d'AI Risk Manager est **bi‑tête** : un SPA React fortement autonome (grâce au mode simulateur et à `localStorage`) et un backend NestJS conçu comme orchestrateur de tests offensifs (Garak, Promptfoo) via `docker exec`. Elle présente une **couverture domaine exhaustive** des référentiels IA (OWASP LLM/Agentic/COMPASS/DSGAI, MITRE, AI Risk Repository, CLUSIF), un **monorepo backend bien structuré** et une **chaîne CI/CD complète**.

Les principales **zones de fragilité factuelles** (20 points en §14.2) touchent à la gouvernance du dépôt (documentation, scripts, fichiers obsolètes), à la sécurité en développement (bypass JWT, routes publiques, `docker.sock` exposé), à la cohérence applicative (double Card, double chatbot NestJS/Vercel, double `aiPolicyContent`) et à l'opérationnel (pas de migrations Prisma, Bull/Redis désactivés, `apps/test-execution-service` sans code).

Ce document est un socle d'observation pour la revue d'architecture. Il ne propose pas d'orientation cible : toute remédiation doit être priorisée à l'issue de la revue, en fonction des objectifs produit et des contraintes opérationnelles.
