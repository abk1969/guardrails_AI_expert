# CLAUDE.md

## Project Overview

**AI RISK MANAGER** — Plateforme complète de test, gestion et gouvernance de la sécurité des systèmes IA.

Architecture hybride : SPA React (standalone) + backend NestJS full-stack avec PostgreSQL, Redis, et outils de pentest conteneurisés (Garak, Promptfoo).

**UI en français.** Support bilingue FR/EN via `BilingualText` (`{ fr: string; en: string }`).

## Commands

```bash
# Frontend (standalone)
npm run dev                          # http://localhost:5080
npm run build && npm run preview     # Production build

# Backend
cd backend
npm run start:dev                    # API Gateway hot reload
npm run test                         # Jest tests
npm run prisma:generate              # Regenerate Prisma client
npm run prisma:push                  # Push schema to DB
npm run prisma:studio                # Database GUI

# Docker (full-stack)
docker-compose up -d                 # Start all 11 services
docker-compose logs -f api-gateway   # Backend logs
docker-compose logs -f frontend      # Frontend logs

# Data transforms
node scripts/transform-compass-data.cjs
node scripts/parse-ai-risk-database.cjs
```

## Ports

| Service       | Standalone | Docker (external → internal) |
|---------------|------------|------------------------------|
| Frontend      | 5080       | 3004 → 3000                  |
| API Gateway   | —          | 3003 → 3001                  |
| PostgreSQL    | —          | 5435 → 5432                  |
| Redis         | —          | 6380 → 6379                  |
| Adminer       | —          | 8082                         |
| Redis Cmdr    | —          | 8081                         |
| Mailhog       | —          | 8025 (web), 1025 (SMTP)      |
| Grafana       | —          | 3002                         |
| Prometheus    | —          | 9090                         |

## Tech Stack

**Frontend:** React 19.1, TypeScript 5.8, Vite 6.2, Tailwind CSS, Lucide React, Recharts, Socket.IO Client, jsPDF
**Backend:** NestJS 10.3, Prisma (PostgreSQL 16), Redis 7 + Bull Queue, Passport JWT, Socket.IO, Helmet, Throttler
**Pentest:** Garak (Python), Promptfoo (Node.js)

## Directory Structure

```
├── App.tsx                    # Main app — 23 context providers, 8 nav sections
├── types.ts                   # Legacy re-export → use types/ directly
├── types/                     # Modular types (10 files, ~1100 LOC)
│   ├── index.ts               # Central re-exports
│   ├── test-execution.ts      # GuardrailCategory, TestResult, EvaluationStep
│   ├── references.ts          # ThreatProfile, KnownVulnerability, incidents
│   ├── compass.ts             # CompassUseCase, RiskLevel, OODAPhase
│   ├── applications.ts        # TestTarget, ApplicationProfile
│   ├── llm-config.ts          # LLMConfiguration, LLMProvider
│   ├── policy.ts              # AIPolicy, PolicyChapter
│   ├── risk-repository.ts     # Risk database types
│   ├── agentic-security.ts    # Agentic AI analysis
│   └── promptfoo.ts           # Promptfoo config types
├── components/                # 48+ React components
│   ├── ui/                    # Card, Button, Modal, Accordion, Tooltip...
│   ├── compass/               # OWASP COMPASS (5 components)
│   ├── policy/                # AI Policy (14 components)
│   ├── repository/            # AI Risk Repository (11 components)
│   ├── chatbot/               # ChatbotModern, ChatWindow, ChatbotFab
│   ├── wiki/                  # Wiki Red Teamer
│   ├── navigation/            # Breadcrumbs, CollapsibleNavSection
│   └── promptfoo/             # PromptfooWizard, ConfigEditor, Execution
├── contexts/                  # 23 React Context providers
├── services/                  # Business logic (10 services)
├── hooks/                     # useLocalStorage, useAllContexts
├── constants/                 # llmProviders.ts
├── data/                      # Static content (compassContent.ts, etc.)
├── data_ai_risk/              # Source Excel + extracted JSON
├── scripts/                   # Data transformation (CJS)
├── src/components/            # New modules
│   ├── unified/               # UnifiedSecurityHub, GarakScannerUI
│   └── ui/                    # Card.tsx (unified)
├── backend/                   # NestJS monorepo
│   ├── apps/api-gateway/src/  # 17 modules (auth, garak, gemini, llm, mcp...)
│   ├── apps/test-execution-service/
│   ├── libs/                  # Shared (auth, common, database)
│   ├── prisma/                # Schema, migrations, seed
│   └── docker/                # Dockerfiles for Garak, Promptfoo
└── infrastructure/            # nginx, Prometheus, Grafana configs
```

## Navigation (8 sections in App.tsx)

| # | Section | Key Modules |
|---|---------|-------------|
| 0 | Applications à Tester | Profils d'Applications (prérequis) |
| 1a | Mode Débutant | Assistant Guidé (Promptfoo Wizard) |
| 1b | Mode Expert | Configuration → YAML → Datasets → Exécution |
| 1c | Plateforme Unifiée | Centre Unifié, Garak Scanner |
| 2 | Gouvernance IA | Cas d'Usage, Menaces, Surface d'Attaque, Incidents, Politique IA |
| 3 | Red Team & Audit | Revue de Sécurité, Résultats d'Audit |
| 4 | Référentiels | COMPASS, Sécurité Agentique, Base Risques, Vulnérabilités, Wiki |
| 5 | Paramètres | Configuration, Configuration LLM |

## State Management (23 Context Providers)

Provider nesting order in `App.tsx` — **order matters** (outer → inner dependencies):

```
LanguageProvider → NavigationProvider → ApplicationProfileProvider →
  AIPolicyProvider → AIRiskRepositoryProvider → CompassProvider →
    AgenticSecurityProvider → WikiProvider → DatasetProvider →
      TestRunProvider → SettingsProvider → LLMConfigProvider →
        UseCaseProvider → ThreatProfileProvider → AttackSurfaceProvider →
          KnownVulnerabilitiesProvider → KnownIncidentsProvider →
            IncidentReadinessProvider → RedTeamProvider →
              RedTeamResultsProvider → DefensesMitigationsProvider →
                AIThirdPartyQuestionsProvider
```

**Persistence (localStorage keys):**
- `llmGuardrailTestHistory` — Test history (last 20 runs)
- `compass-ooda-progress` — OODA Loop progress
- `llm-global-config` — Centralized LLM configuration
- `ai-policy-*`, `ai-risk-repository-*` — Module data
- Active test runs are **ephemeral** (memory only, lost on refresh)

## Critical Patterns

### Import Conventions

```typescript
// Card uses default export
import Card from '../ui/Card';          // ✅
// import { Card } from '../ui/Card';   // ❌

// Types — import from types/ barrel
import { GuardrailCategory, TestResult } from '../types';
import { CompassUseCase } from '../types/compass';     // Or specific module
```

### COMPASS vs Database Types

Prefix `Compass` distinguishes OWASP COMPASS types from Prisma database models:
- `ThreatProfile` (DB) vs `CompassThreatProfile` (COMPASS)
- `KnownVulnerability` (DB) vs `CompassKnownVulnerability` (COMPASS)

### Environment Variables

```typescript
// Frontend (Vite) — MUST use VITE_ prefix
import.meta.env.VITE_API_URL
import.meta.env.VITE_MCP_API_URL

// Backend (Node.js)
process.env.DATABASE_URL
process.env.GEMINI_API_KEY

// Scripts (.cjs)
process.env.*
```

### Context Hook Pattern

```typescript
// All contexts follow this pattern
const { data } = useMyContext();  // Throws if used outside <MyProvider>
```

### Optional Chaining (required for WebSocket data)

```typescript
// ✅ Always use optional chaining for WebSocket/async data
{findings?.length || 0} findings
{(execution?.progress || 0).toFixed(1)}%
{execution?.status || 'Unknown'}
```

## LLM Configuration

**10 supported providers:** Gemini, OpenAI, Claude, Mistral, DeepSeek, Qwen, xAI Grok, Groq, Ollama, LM Studio

```typescript
import { useLLMConfig } from '../contexts/LLMConfigContext';

const { config, isConfigured, testConnection } = useLLMConfig();
// config.provider, config.model, config.apiKey
// config.temperature, config.maxTokens, config.topP, config.topK
```

Shared across: Garak, Promptfoo, Chatbot. Stored in `localStorage` key `llm-global-config`.

## Test Execution Modes

| Mode | Service | Real API Calls | Default |
|------|---------|----------------|---------|
| **Simulator** | `testRunnerService.ts` | **No** — keys never leave browser | ✅ |
| Sandbox | `sandboxService.ts` | Yes — opt-in | — |
| Promptfoo | `promptfooIntegrationService.ts` | Optional | — |
| Backend | NestJS API Gateway + Bull queue | Yes | — |

Simulator creates realistic evaluation chains (pre-LLM → API call logged → post-LLM → decision + remediation). Failure probability scales with sensitivity level and prompt complexity.

## Backend Architecture

**NestJS monorepo** in `backend/`. Node.js >=18.0.0 required.

**API Gateway modules** (`backend/apps/api-gateway/src/`):
auth, users, garak, promptfoo, gemini, llm, mcp, tests, policies, risks, analytics, system, docker, unified, shared

**Database:** PostgreSQL 16 via Prisma ORM. Multi-tenant (`organizationId` scoping). Soft deletes via `deletedAt`. Encrypted API credentials (AES-256).

**RBAC:** 6 roles — SUPER_ADMIN, ADMIN, SECURITY_OFFICER, TESTER, ANALYST, VIEWER

**Key models:** User, Organization, TestTarget, TestRun, TestResult, ThreatProfile, KnownVulnerability, AIPolicy, AuditLog, PromptTemplate, Notification, SystemSetting, FeatureFlag

## Docker Infrastructure

**11 services** on **2 networks:**

1. **airiskmgr-network** (bridge) — Frontend, API Gateway, PostgreSQL, Redis, monitoring, admin tools
2. **pentest-isolated-network** (bridge, non-internal) — Garak, Promptfoo (+ airiskmgr-network for API Gateway communication)

**Pentest tools resource limits:** CPU 2.0, RAM 2G per container.

**API Gateway volumes disabled** for Windows compatibility (uses image-baked code, no hot reload).

## OWASP COMPASS Module

31 threat scenarios. Risk score = Impact (1-5) × Likelihood (1-5). Distribution: 7 Critical, 11 High, 9 Moderate, 4 Low.

OODA Loop methodology (Observe → Orient → Decide → Act). MITRE ATT&CK / ATLAS mapping. Bilingual FR/EN.

**Data pipeline:** Excel (19 sheets) → `transform-compass-data.cjs` → `compassContent.ts` → `CompassContext` → UI

## Security Rules

1. **Simulator mode (default)** — NO real API calls to targets, user keys never leave browser
2. **Sensitive fields** auto-masked (type="password") if header contains "key" or "token"
3. **Backend security:** Helmet, CORS, Throttler, JWT auth, bcrypt passwords, AES-256 encrypted credentials
4. **Pentest isolation:** Separate Docker network, resource limits, communication only via API Gateway
5. **Never expose API keys client-side** — Gemini calls go through backend (`geminiServiceSecure.ts`)

## Troubleshooting

**Prisma issues:** `cd backend && npm run prisma:generate` then `npm run prisma:push`

**Port conflicts:** Project uses non-default ports (3003, 3004, 5435, 6380) to avoid conflicts.

**Context errors ("useContext must be used within Provider"):** Check provider nesting order in `App.tsx`.

**Docker node_modules issues:** `docker-compose down && docker-compose build --no-cache && docker-compose up -d`

**Build TypeScript errors:** Run `npm install`, then `cd backend && npm run prisma:generate`. Check `@/*` aliases.

**COMPASS data not updating:** Re-run `node scripts/transform-compass-data.cjs`, then hard refresh browser.

## Attribution

Content based on OWASP LLM Top 10, Agentic AI Top 15, and GenAI COMPASS v1 (CC BY-SA 4.0).
Copyright © 2025 Globacom3000 / Abbas BENTERKI.
