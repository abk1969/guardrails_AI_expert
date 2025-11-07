# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI RISK MANAGER is a comprehensive platform for testing, managing, and governing AI system security. The application simulates LLM guardrail testing, manages AI risk assessments, and provides governance frameworks for AI systems.

**Architecture Evolution:** The project is transitioning from a 100% client-side SPA to a full-stack architecture with NestJS backend microservices, PostgreSQL database, and Redis for caching/queues.

## Quick Reference

### Most Common Commands
```bash
# Frontend development (standalone mode)
npm run dev                    # Start dev server on http://localhost:5080

# Docker development (full-stack)
docker-compose up -d           # Start all services
docker-compose logs -f frontend # View frontend logs
docker-compose logs -f api-gateway # View backend logs

# Backend development (local)
cd backend
npm run start:dev              # Start API Gateway with hot reload
npm run prisma:studio          # Open database GUI

# Data transformation
node scripts/transform-compass-data.cjs # Regenerate COMPASS data
```

### Port Reference
- **Standalone:** Frontend on 5080
- **Docker:** Frontend on 3004, API on 3003, PostgreSQL on 5435, Redis on 6380

## Installation

### Installation Rapide (PowerShell)

```powershell
# Installation complète avec Docker (RECOMMANDÉ)
.\install.ps1 -Mode docker

# Installation standalone (frontend uniquement)
.\install.ps1 -Mode standalone

# Installation fullstack (frontend + backend local)
.\install.ps1 -Mode fullstack
```

**Documentation:**
- [QUICK_START.md](./QUICK_START.md) - Démarrage en 5 minutes
- [INSTALLATION.md](./INSTALLATION.md) - Guide d'installation détaillé
- [SCRIPTS_README.md](./SCRIPTS_README.md) - Documentation complète des scripts PowerShell

## Development Commands

### Frontend Development
```bash
npm run dev          # Starts Vite dev server on http://localhost:5080
npm run build        # Creates production build in dist/
npm run preview      # Previews production build locally
```

### Backend Development (NestJS Monorepo)
```bash
cd backend
npm run start:dev                        # Start API Gateway with hot reload
npm run start:dev test-execution-service # Start test execution worker
npm run build                            # Build all backend services
npm run start:prod                       # Start in production mode
npm run prisma:generate                  # Generate Prisma client
npm run prisma:push                      # Push schema to database
npm run prisma:seed                      # Seed database with initial data
npm run prisma:studio                    # Open Prisma Studio GUI
npm run test                             # Run Jest tests
npm run test:watch                       # Run tests in watch mode
npm run test:cov                         # Run tests with coverage
npm run lint                             # Lint with ESLint
npm run format                           # Format with Prettier
```

**Important:** Backend requires Node.js >=18.0.0 and npm >=9.0.0

### Docker Deployment
```bash
docker-compose up -d           # Start all services (frontend, backend, postgres, redis)
docker-compose down            # Stop all services
docker-compose logs -f         # Follow logs
```

**Services in docker-compose:**
- Frontend: http://localhost:3004 (mapped from container port 3000)
- API Gateway: http://localhost:3003 (mapped from container port 3001)
- PostgreSQL: localhost:5435 (mapped from container port 5432)
- Redis: localhost:6380 (mapped from container port 6379)
- Adminer (DB UI): http://localhost:8082
- Redis Commander: http://localhost:8081
- Mailhog SMTP: localhost:1025, Web UI: http://localhost:8025
- Grafana: http://localhost:3002
- Prometheus: http://localhost:9090

**Note:** External ports are modified from defaults to avoid conflicts with other services.

### PowerShell Management Scripts
```powershell
.\install.ps1 -Mode docker      # Full installation with Docker
.\install.ps1 -Mode standalone  # Frontend-only installation
.\install.ps1 -Mode fullstack   # Frontend + local backend
.\dev.ps1                       # Start development environment
.\update.ps1                    # Update dependencies and rebuild
.\backup.ps1                    # Backup database and configuration
.\migrate.ps1                   # Run database migrations
.\uninstall.ps1                 # Complete cleanup
```

### Data Transformation Scripts (Node.js)
```bash
node scripts/transform-compass-data.cjs              # Parse OWASP Excel to TypeScript
node scripts/finalize-compass-translations.cjs       # Finalize bilingual content
node scripts/link-compass-relationships.cjs          # Link cross-module relationships
node scripts/parse-ai-risk-database.cjs              # Parse AI Risk Repository data
```

## Environment Configuration

### Frontend (.env in root)
```env
GEMINI_API_KEY=your_gemini_key_here
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
```

**Port Configuration:**
- Standalone mode (npm run dev): Frontend runs on http://localhost:5080
- Docker mode: Frontend runs on http://localhost:3004 and points to API on port 3003

### Backend (docker-compose or .env in backend/)
```env
DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_dev_password
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ENCRYPTION_KEY=dev-32-char-encryption-key-here
CORS_ORIGIN=http://localhost:3004
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

**Note:** When connecting from host machine (not within Docker), use external ports (5435 for PostgreSQL, 6380 for Redis). Inside Docker network, use internal ports (5432, 6379).

**Important:**
- Frontend uses `import.meta.env.VITE_*` (NOT `process.env`)
- Backend uses `process.env`
- **Gemini API Migration:** For full-stack mode, use `geminiServiceSecure.ts` (backend-proxied). `geminiService.ts` is deprecated for production use but still works in standalone mode.
- The system has fallback to mock generation if API fails

## Architecture

### Core Philosophy (Hybrid Mode)
- **Hybrid Architecture**: Supports both standalone frontend-only mode and full-stack mode with backend
- **Privacy by Design**: Sensitive data (API keys, test results) never leave user's environment in standalone mode
- **Dual Persistence**:
  - Standalone mode: `localStorage` for user preferences, test history, and module state (persistent across sessions)
  - Full-stack mode: PostgreSQL for durable multi-user storage, Redis for sessions/cache/queues
  - **Important:** Active test runs are ephemeral (memory only), but results can be saved to localStorage or database
- **Microservices**: Backend uses NestJS with API Gateway + Test Execution Service
- **Simulator Mode**: Default test execution is simulated (no real API calls to configured targets) - see Test Execution Modes below

### Backend Architecture (NestJS Monorepo)

Located in `backend/`:

- **apps/api-gateway/**: Main API entry point, handles HTTP requests, authentication, rate limiting
- **apps/test-execution-service/**: Background worker service for executing LLM guardrail tests
- **libs/**: Shared libraries (database, encryption, monitoring)
- **prisma/**: Database schema and migrations

**Tech Stack:**
- NestJS 10 (TypeScript framework)
- Prisma ORM (PostgreSQL 16)
- Bull Queue (Redis 7 - based job queue with AOF persistence)
- Passport JWT + Local (authentication)
- Bcrypt (password hashing)
- Swagger/OpenAPI (API documentation)
- WebSockets (Socket.IO for real-time updates)
- Cache Manager with Redis backend
- Helmet (security headers)
- Throttler (rate limiting)
- Compression middleware

### Frontend Directory Structure

**Root-level files:**
- `App.tsx` - Main app component with 19+ nested context providers
- `types.ts` - TypeScript type definitions for entire application (756+ lines)
- `constants.ts` - Application constants and configuration data
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration (ES2022, react-jsx)

**Key directories:**
- `/components/` - React components organized by feature (40+ components)
  - `/ui/` - Reusable UI components (**Card uses `export default`**, NOT named exports!)
  - `/compass/` - OWASP COMPASS module (5 components: view, card, filters, stats, modal)
  - `/policy/` - AI Policy module components
  - `/repository/` - AI Risk Repository components
  - `/wiki/` - Wiki Red Teamer module components
  - `/chatbot/` - Chatbot interface with FAB and modern UI
  - Feature views: Dashboard, Analytics, DatasetManager, etc.

- `/contexts/` - React Context providers (19 contexts total)
  - Each module has its own context for state management
  - Provider order in `App.tsx` matters (dependencies flow outer → inner)
  - Custom hook pattern: `useContextName()` throws error if used outside provider

- `/services/` - Business logic layer, decoupled from UI
  - `geminiService.ts` - **DEPRECATED** - Direct Gemini API calls (browser-side, use only in standalone mode)
  - `geminiServiceSecure.ts` - **RECOMMENDED** - Secure backend-proxied Gemini calls (full-stack mode)
  - `mcpClientService.ts` - MCP (Model Context Protocol) client integration (see MCP section below)
  - `testRunnerService.ts` - Simulates test execution (mock mode)
  - `sandboxService.ts` - Local sandbox test mode
  - `agenticService.ts` - Agentic AI system utilities
  - `promptfooIntegrationService.ts` - Promptfoo YAML generation and test execution
  - `backendApiService.ts` - Backend API communication layer

- `/data/` - Static content and reference data
  - `compassContent.ts` - OWASP COMPASS use cases (31 threat scenarios)
  - `aiPolicyContent.ts` - AI policy framework data
  - `wikiContent.tsx` - Wiki reference content (JSX elements)
  - `aiRiskRepositoryContent.ts` - Risk database content

- `/data_ai_risk/` - Excel data and parsed JSON files
  - `Copy of ⭕ OWASP GenAI COMPASS v. 1.xlsx` - Source Excel file (19 sheets)
  - `compass-data-final.json` - Transformed COMPASS data

- `/scripts/` - Data transformation scripts (Node.js CJS modules)
  - `transform-compass-data.cjs` - Parse OWASP Excel to TypeScript
  - `finalize-compass-translations.cjs` - Bilingual content finalizer
  - `link-compass-relationships.cjs` - Cross-module relationship linking
  - `parse-ai-risk-database.cjs` - AI Risk Repository parser

- `/hooks/` - Custom React hooks
- `/infrastructure/` - Docker configs, nginx, monitoring (Prometheus/Grafana)
- `/backend/` - NestJS monorepo (separate from frontend)
- `/guardrail/solution_promptfoo/` - **Embedded Promptfoo installation** (separate project with own dependencies and .cursor rules - can be ignored when working on main AI Risk Manager codebase)

### State Management

Uses **React Context API** for state management. 19 context providers in total:

**Core contexts:**
- `LanguageProvider` - Outermost provider, bilingual support (FR/EN)
- `NavigationProvider` - Current active nav state
- `TestRunContext` - Active test session state (ephemeral)
- `DatasetContext` - Attack prompt library management
- `SettingsContext` - User settings and preferences

**Module-specific contexts:**
- `CompassContext` - OWASP COMPASS threat scenarios (31 use cases, filters, OODA progress)
- `AIPolicyContext` - AI policy management
- `AIRiskRepositoryContext` - Risk repository data
- `WikiContext` - Wiki content state
- `UseCaseContext` - Use cases management
- `ThreatProfileContext` - Threat profiling
- `AttackSurfaceContext` - Attack surface analysis
- `KnownVulnerabilitiesContext` - Known AI vulnerabilities
- `KnownIncidentsContext` - Known AI incidents
- `IncidentReadinessContext` - Incident response readiness
- `RedTeamContext` - Red team security review
- `RedTeamResultsContext` - Red team test results
- `DefensesMitigationsContext` - Defense reference library
- `AIThirdPartyQuestionsContext` - Third-party questionnaire

**Critical Context Provider Nesting Order (in App.tsx):**
```tsx
<LanguageProvider>  {/* 1. Outermost: Language settings */}
  <NavigationProvider>  {/* 2. Navigation state */}
    <AIPolicyProvider>  {/* 3. Policy framework */}
      <AIRiskRepositoryProvider>  {/* 4. Risk repository */}
        <CompassProvider>  {/* 5. COMPASS (depends on Risk Repository) */}
          <WikiProvider>
            <DatasetProvider>
              <TestRunProvider>
                <SettingsProvider>
                  {/* ... 10+ more nested providers ... */}
                </SettingsProvider>
              </TestRunProvider>
            </DatasetProvider>
          </WikiProvider>
        </CompassProvider>
      </AIRiskRepositoryProvider>
    </AIPolicyProvider>
  </NavigationProvider>
</LanguageProvider>
```

**Persistence Strategy (localStorage keys):**
- `llmGuardrailTestHistory` - Historical test runs (last 20 runs) - **persistent**
- `compass-ooda-progress` - COMPASS OODA Loop progress - **persistent**
- `compass-language` - COMPASS language preference (fr/en) - **persistent**
- `ai-policy-*` - AI Policy module data - **persistent**
- `ai-risk-repository-*` - AI Risk Repository data - **persistent**
- Module-specific data (use cases, threat profiles, vulnerabilities, incidents, etc.) - **persistent**
- User settings and preferences - **persistent**
- Active test run state → Memory only (cleared on refresh) - **ephemeral**

**Note:** README.md describes this as "Données Éphémères" (ephemeral data) for compliance documentation purposes, but localStorage IS used for user preferences, test history, and module state. Only active test sessions are truly ephemeral.

### Test Execution Flow

1. **Configuration** (`TestConfiguration.tsx`): User selects categories, complexity, volume, and target
2. **Prompt Generation** (`geminiService.ts`): Calls Gemini API or falls back to mock generation
3. **Test Execution** - Multiple modes available:
   - **Simulator Mode (Default):** `testRunnerService.ts` simulates guardrail evaluation pipeline
     - **CRITICAL:** No real API calls are made to configured target endpoints (user API keys never leave browser)
     - Creates realistic evaluation chains with timestamps
     - Probabilistic pass/fail based on sensitivity settings
     - Generates remediation suggestions
   - **Sandbox Mode:** `sandboxService.ts` - Local test execution with actual API calls (optional)
   - **Promptfoo Integration:** `promptfooIntegrationService.ts` - Generate YAML configs and execute via embedded Promptfoo
   - **Backend Mode:** Full-stack execution via API Gateway + Test Execution Service (Bull queue)
4. **Real-time Updates** (`LiveTestView.tsx`): Progress bar and statistics
5. **Results Analysis** (`RealTimeResults.tsx`, `ResultDetailModal.tsx`): Audit trail and recommendations

### MCP (Model Context Protocol) Integration

The application includes an **experimental MCP architecture** for the chatbot feature:

**Architecture:**
- **Frontend**: `mcpClientService.ts` - MCP client that queries application data
- **Backend**: `apps/api-gateway/src/mcp/` - MCP server implementation (NestJS)
- **Integration**: Embedded Promptfoo with MCP support in `guardrail/solution_promptfoo/`

**How it works:**
1. Chatbot (`ChatbotModern.tsx`) receives user question
2. MCP client calls backend to retrieve relevant context from all application data (use cases, vulnerabilities, test results, etc.)
3. Context + user question sent to Gemini API (`agenticService.ts`)
4. Response generated with full application context

**Configuration:**
- `VITE_MCP_API_URL` - MCP server endpoint (default: `http://localhost:3003/api/v1/mcp`)
- `VITE_MCP_MOCK_MODE` - Enable mock mode for offline development (default: `false`)

**Available MCP Tools:**
- `search_use_cases` - Search through use cases
- `get_vulnerabilities` - Retrieve known vulnerabilities
- `get_test_results` - Access historical test results
- `query_compass_data` - Query OWASP COMPASS threat scenarios
- And more (see `backend/apps/api-gateway/src/mcp/mcp.service.ts`)

**Note:** MCP integration is optional. The chatbot works in both standalone mode (mock) and full-stack mode (real MCP backend).

### Key Type Definitions

Located in `types.ts`:

**Core Test Types:**
- `GuardrailCategory` - 5 security domains (Security/Privacy, Relevance, Quality, Content, Logic)
- `AttackFamily` - Attack types (Injection, Poisoning, RAG, Leaks, Evasion, Custom)
- `PromptComplexity` - Simple, Moyen, Sophistiqué
- `TestConfiguration` - Complete test setup
- `TestResult` - Includes prompt, response, score, status, evaluation chain, remediation
- `EvaluationStep` - Individual pipeline stage with timestamp

**COMPASS Types:**
- `CompassUseCase` - Threat scenario with risk scoring, MITRE mapping, bilingual content
- `BilingualText` - `{ fr: string; en: string }` for bilingual support
- `RiskLevel` - 'critical' | 'high' | 'moderate' | 'low'
- `OODAPhase` - 'observe' | 'orient' | 'decide' | 'act'
- `OWASPSheet` - Metadata for 19 Excel sheets
- `OODAProgress` - Progress tracking for each OODA phase
- `CompassThreatProfile` - COMPASS-specific threat profile (distinct from database `ThreatProfile`)
- `CompassKnownVulnerability` - COMPASS-specific vulnerability (distinct from database `KnownVulnerability`)
- `AttackSurface`, `KnownIncident`, `DefenseMitigation`, `ThirdPartyQuestion`

**Database Types (Prisma):**
- `Organization` - Multi-tenant organizations with plan limits
- `User` - Users with role-based access control (6 roles: SUPER_ADMIN, ADMIN, SECURITY_OFFICER, TESTER, ANALYST, VIEWER)
- `TestTarget` - AI system configurations (encrypted API credentials)
- `TestRun` - Test execution sessions with status tracking
- `TestResult` - Individual test results with evaluation chains
- `PromptTemplate` - Reusable prompt templates for test generation
- `ThreatProfile` - Threat profiles (fields: `profile`, `threat`, `note`, `initialRating`, `defenses`)
- `KnownVulnerability` - Known vulnerabilities (fields: `organizationTool`, `cveIdentifier`, `associatedCwes`, `originalSeverity`, `owaspLlmCategory`, `owaspAgenticTop15`)
- `UseCase` - Risk-scored use cases with recommendations
- `AIPolicy` - AI governance policies with implementation status
- `AuditLog` - Complete audit trail of all system actions
- `RefreshToken` - JWT refresh token management
- `Notification` - User notifications for events
- `SystemSetting` & `FeatureFlag` - System configuration

**Multi-Tenancy:** All data is scoped by `organizationId` with cascade deletes. Soft deletes implemented via `deletedAt` timestamp.

**Security:** API credentials stored encrypted. Prisma generates client with `binaryTargets: ["native", "debian-openssl-3.0.x"]` for Docker compatibility.

Note: COMPASS types use `Compass` prefix to avoid naming conflicts with database models.

## Critical Implementation Details

### Security Considerations

1. **No Real API Calls in Tests**: `testRunnerService.ts` NEVER makes actual calls to configured target endpoints. User API keys never leave the browser.

2. **Sensitive Field Masking**: Headers containing "key" or "token" are auto-masked (type="password") in forms.

3. **Local Data Only**: All test results are ephemeral unless explicitly saved to `localStorage`.

### Test Simulation Logic

The `mockTestRunner` in `testRunnerService.ts` creates realistic evaluation chains:
- Pre-LLM analysis (always passes in simulation)
- LLM API call (logged but not executed)
- Post-LLM analysis (probabilistic based on category sensitivity)
- Final decision with remediation suggestions

Failure probability increases with:
- Higher sensitivity setting (Tolérant < Normal < Strict)
- Higher complexity prompts (Simple < Moyen < Sophistiqué)

### Module Navigation

The app uses a sidebar navigation system with 18+ modules including:
- Dashboard (test configuration)
- Analytics (trend analysis)
- Dataset Manager (attack prompt library)
- Use Cases, Threat Profiles, Attack Surface Analysis
- Known Vulnerabilities/Incidents
- Red Team modules
- Reference materials (Defenses, Third-Party Questions)
- Wiki Red Teamer
- AI Policy Management
- AI Risk Repository
- **OWASP COMPASS** (31 threat scenarios with OODA Loop methodology)

Each module is self-contained with its own context, view component, and data model.

### OWASP COMPASS Module

**NEW - Fully Implemented Threat Defense Framework**

**Overview:**
- 31 threat scenarios from OWASP GenAI COMPASS Excel file
- OODA Loop methodology (Observe, Orient, Decide, Act)
- Risk scoring: Impact (1-5) × Likelihood (1-5) = Risk Score
- Distribution: 7 Critical, 11 High, 9 Moderate, 4 Low
- Bilingual support (FR/EN structure ready)
- MITRE ATT&CK / ATLAS technique mapping

**Components:**
1. `CompassUseCasesView.tsx` - Main view with search, filters, grid/list toggle
2. `CompassUseCaseCard.tsx` - Interactive cards (all elements clickable: icons, scores, badges, buttons)
3. `CompassFilters.tsx` - Risk level and OODA phase filters
4. `CompassStatistics.tsx` - Stats dashboard with distribution
5. `CompassUseCaseModal.tsx` - Detailed modal with risk assessment, recommendations, MITRE mappings

**Key Features:**
- Real-time search across all fields
- Multi-criteria filtering (risk level + OODA phase)
- Grid and List view modes
- Clickable scores, badges, and icons (with hover effects)
- "Voir détails" button always visible
- Cross-module navigation ready (vulnerabilities, incidents, defenses, questions)
- Progress tracking for OODA phases

**Data Flow:**
```
Excel File (19 sheets)
  ↓ [analyze-owasp-excel.cjs]
  ↓ owasp-compass-analysis.json
  ↓ [transform-compass-data.cjs]
  ↓ compassContent.ts (31 use cases)
  ↓ CompassContext
  ↓ CompassUseCasesView
```

**Important Notes:**
- Use cases are fully typed with `CompassUseCase` interface
- Risk level colors: Critical (red), High (orange), Moderate (yellow), Low (blue)
- All interactive elements have hover effects and tooltips
- Modal click-outside-to-close UX implemented
- Card component uses `export default` (NOT named export!)

**To Regenerate Data:**
```bash
node scripts/transform-compass-data.cjs
node scripts/finalize-compass-translations.cjs
```

## TypeScript Configuration

- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Path alias: `@/*` maps to root directory
- `allowImportingTsExtensions: true` for `.tsx` imports
- `noEmit: true` (Vite handles compilation)

## Styling

- **Tailwind CSS** for utility-first styling
- Custom CSS files for specific animations (`LiveTestView.css`, `AIRiskRepository.css`, `PolicyView.css`)
- Dark theme by default (gray-900 backgrounds, cyan accents)
- Lucide React icons throughout

## Critical Implementation Details

### 1. French Language
The application UI and content are primarily in French. All user-facing strings, error messages, and documentation should be in French unless working in bilingual contexts (COMPASS module supports FR/EN).

### 2. Import Conventions

**Card Component:** `components/ui/Card.tsx` uses `export default`, NOT named export.
```typescript
import Card from '../ui/Card';  // ✅ Correct
// NOT: import { Card } from '../ui/Card';  // ❌ Wrong
```

### 3. Type Naming Conventions

**COMPASS vs Database Types:** To avoid naming conflicts between COMPASS module types and Prisma database models, COMPASS-specific types use the `Compass` prefix:

```typescript
// Database models (Prisma) - Used by backend and contexts
import { ThreatProfile, KnownVulnerability } from '../types';

// COMPASS module types - Used for OWASP threat scenarios
import { CompassThreatProfile, CompassKnownVulnerability } from '../types';
```

**Key differences:**
- `ThreatProfile` (DB): fields `profile`, `threat`, `note`, `initialRating`, `defenses`
- `CompassThreatProfile` (COMPASS): fields `name`, `description`, `systemType`, `aiComponents`, `riskAppetite`
- `KnownVulnerability` (DB): fields `organizationTool`, `cveIdentifier`, `associatedCwes`, `originalSeverity`
- `CompassKnownVulnerability` (COMPASS): fields `title`, `description`, `cveId`, `severity`, `mitigations`

**When to use which:**
- Use `ThreatProfile`/`KnownVulnerability` for database operations, ThreatProfileContext, KnownVulnerabilitiesContext
- Use `CompassThreatProfile`/`CompassKnownVulnerability` for OWASP COMPASS threat scenarios (currently defined but not actively used in CompassUseCase structure)

### 4. Environment Variables

- **Frontend (Vite):** Use `import.meta.env.VITE_*` (NOT `process.env`)
- **Backend (Node.js):** Use `process.env`
- **Scripts (.cjs):** Use `process.env`

### 5. Testing Framework
No test files currently in codebase. Backend has Jest configured but no tests written yet. When adding tests, use existing TypeScript configuration.

### 6. API Fallback Pattern
Always handle external API failures gracefully:
- Gemini API in `geminiService.ts` falls back to mock generation
- `testRunnerService.ts` simulates test execution (never makes real API calls to configured targets)
- `mcpClientService.ts` has mock mode for offline development

### 7. Data Persistence
- **localStorage keys must remain consistent** to avoid data loss
- When modifying context providers, check for `useEffect` hooks with localStorage
- Historical data limited to last 20 runs to prevent storage bloat

### 8. Context Provider Order
`App.tsx` wraps the app in 19+ nested context providers. **Order matters** due to dependencies:
- `LanguageProvider` must be outermost
- `CompassProvider` depends on `AIRiskRepositoryProvider`
- `NavigationProvider` needs to be near the top for cross-module navigation

### 9. Security Considerations and Test Execution Modes

**Simulator Mode (Default - No Real API Calls):**
- `testRunnerService.ts` NEVER makes actual calls to configured target endpoints
- User API keys never leave the browser in standalone mode
- This is the default and recommended mode for initial testing and demonstrations
- Provides realistic evaluation chains without risk of credential leakage

**Optional Real Execution Modes:**
- **Sandbox Mode:** `sandboxService.ts` makes actual API calls to configured endpoints (opt-in, use with caution)
- **Promptfoo Mode:** Can execute real tests via embedded Promptfoo installation
- **Backend Mode:** Full-stack execution with job queues and audit trails

**Sensitive Field Masking:** Headers containing "key" or "token" are auto-masked (type="password") in forms.

**Backend Security:** API Gateway uses Helmet, CORS, rate limiting (Throttler), JWT authentication, bcrypt password hashing, encrypted credential storage (AES-256).

### 10. OWASP Attribution
Content based on OWASP LLM Top 10, Agentic AI Top 15, and GenAI COMPASS v1 projects (CC BY-SA 4.0 licensed). Maintain attribution in footer and respect license terms.

### 11. Docker Development
When using Docker:
- Frontend runs on external port 3004 (container port 3000) - not 5080 like standalone mode
- Backend API is on external port 3003 (container port 3001)
- PostgreSQL is on external port 5435 (container port 5432)
- Redis is on external port 6380 (container port 6379)
- Additional services: Adminer (8082), Redis Commander (8081), Mailhog (8025), Grafana (3002), Prometheus (9090)
- Hot reload works via volume mounts (code changes reflected automatically)
- Use `docker-compose logs -f frontend` or `docker-compose logs -f api-gateway` to debug
- Services communicate internally using container names (e.g., `postgres:5432`, `redis:6379`)
- Dockerfiles use multi-stage builds with separate `development` and `production` targets
- Node modules are volume-mounted to use container-compiled binaries (important for Debian-based images on Windows)

**Port conflicts:** All external ports are modified from defaults to avoid conflicts (e.g., 5435 instead of 5432 for PostgreSQL)

### 12. Embedded Promptfoo Integration
The `guardrail/solution_promptfoo/` directory contains a complete Promptfoo installation:
- Separate project with own package.json, node_modules, and configuration
- Has its own .cursor rules (in `guardrail/solution_promptfoo/promptfoo/.cursor/rules/`)
- **When working on AI Risk Manager codebase, ignore this subdirectory**
- Used for optional advanced test execution via `promptfooIntegrationService.ts`
- Integrated into frontend via YAML generation and test execution service

### 13. Unified Security Testing Platform (In Progress)

The backend is being extended with integrations for multiple security testing frameworks:

**Location:** `backend/apps/api-gateway/src/`

**Components:**
- `unified/` - Unified platform orchestration layer (in development)
- `garak/` - [Garak](https://github.com/leondz/garak) LLM vulnerability scanner integration
- `strix/` - [Strix](https://github.com/hupe1980/strix) AI security testing framework integration
- `auth/` - Enhanced authentication for multi-framework support

**Status:** These integrations are under active development. The goal is to provide a unified interface for running tests across Promptfoo, Garak, and Strix from a single platform.

**Note:** When working on core AI Risk Manager features, these directories can be ignored. They represent future extensibility for advanced security testing workflows.

## Working with Contexts

When modifying state management:
1. Check if related context exists in `/contexts/`
2. Context providers are nested in `App.tsx` - dependencies flow from outer to inner
3. Custom hook pattern: `useContextName()` throws error if used outside provider
4. localStorage persistence handled in `useEffect` hooks within contexts
5. Use `useAllContexts.ts` hook when component needs multiple contexts

## Module Navigation System

The app uses a sidebar navigation with **organized sections** defined in `App.tsx`. The structure is hierarchical with collapsible sections.

**Navigation Architecture:**
```typescript
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  section?: string;
  stepNumber?: number;
  description?: string;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
}
```

**Main Sections in App.tsx:**
1. **Section 0: Applications à Tester** (Application Profiles)
   - Prerequisite: Configure AI applications before testing
2. **Section 1: Tests de Sécurité** (Security Testing Workflow)
   - Dashboard, Analytics, Dataset Manager, Advanced Scenarios, Promptfoo integration
3. **Section 2: Cadres de Gouvernance** (Governance Frameworks)
   - AI Policy, AI Risk Repository, OWASP COMPASS (31 threat scenarios)
4. **Section 3: Analyse des Risques** (Risk Analysis)
   - Use Cases, Threat Profiles, Attack Surface, Known Vulnerabilities, Known Incidents
5. **Section 4: Red Team** (Red Teaming)
   - Security Review, Test Results, Incident Readiness
6. **Section 5: Références** (Reference Materials)
   - Defenses/Mitigations, Third-Party Questions, Wiki Red Teamer
7. **Section 6: Configuration** (Settings)

**Cross-Module Navigation:**
- `NavigationContext` provides `navigateTo(moduleId: string)` function
- `NavigationBreadcrumbs` component shows current location with back navigation
- Modules can link to related modules (e.g., COMPASS → Vulnerabilities)
- Navigation state persisted across session
- Collapsible sections with `defaultOpen` property

## Adding New Features

### Adding a New Module

1. **Define types** in `types.ts`
   ```typescript
   export interface NewModuleItem {
     id: string;
     // ... fields
   }
   ```

2. **Create context** in `/contexts/NewModuleContext.tsx`
   ```typescript
   export const NewModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
     const [data, setData] = useState<NewModuleItem[]>([]);
     // ... localStorage logic, CRUD operations
   };
   ```

3. **Create view component** in `/components/NewModuleView.tsx`
   ```typescript
   const NewModuleView: React.FC = () => {
     const { data } = useNewModule();
     return <div>...</div>;
   };
   ```

4. **Add navigation item** in `App.tsx` navItems array
   ```typescript
   { id: 'new-module', label: 'Nouveau Module', icon: <Icon />, content: <NewModuleView /> }
   ```

5. **Wrap provider** in `App.tsx` provider hierarchy
   - Consider dependencies (which contexts does it need?)
   - Add at appropriate nesting level

6. **Update constants** in `constants.ts` if adding reference data

### Adding a New Data Transformation Script

1. Create `scripts/transform-new-data.cjs`
2. Use CommonJS syntax (`.cjs` extension)
3. Import `xlsx` for Excel parsing
4. Output to `/data/` or `/data_ai_risk/`
5. Update types in `types.ts` if needed
6. Document in this file under "Data Transformation Scripts"

## Deployment

### Local Development
See "Development Commands" section above for standalone, Docker, and full-stack modes.

### Production Deployment

**Docker Production:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

**Vercel Deployment (Frontend Only):**
The frontend can be deployed to Vercel as a standalone SPA:
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables (`GEMINI_API_KEY`, etc.)
4. Deploy

See recent commit `840fbbd` for Vercel deployment guide details.

**Note:** For full-stack deployments, you'll need to deploy backend separately (e.g., Railway, Render, AWS, Azure) and configure `VITE_API_URL` to point to the deployed backend.

## Troubleshooting

### Prisma Client Issues

**Problem:** `@prisma/client` import errors or type mismatches
```bash
cd backend
npm run prisma:generate  # Regenerate Prisma client
```

**Problem:** Database schema out of sync
```bash
cd backend
npm run prisma:push      # Push schema changes to database
```

### Port Conflicts

**Problem:** `EADDRINUSE: address already in use`

**Solution:** Check which ports are in use:
```bash
# Windows
netstat -ano | findstr :5080
netstat -ano | findstr :3003

# Linux/Mac
lsof -i :5080
lsof -i :3003
```

Kill the process using the port or change the port in configuration.

**Docker Port Conflicts:** The project uses non-default ports (3004, 3003, 5435, 6380) specifically to avoid conflicts. If these ports are taken, modify `docker-compose.yml`.

### Context Provider Errors

**Problem:** `useContext must be used within Provider` error

**Solution:** Check `App.tsx` for proper provider nesting order. The component must be wrapped inside the provider whose context it's trying to use.

**Problem:** Context state not persisting across sessions

**Solution:** Check localStorage keys. If localStorage is disabled or full, persistence will fail. Clear old data:
```javascript
// In browser console
localStorage.clear();  // Nuclear option - clears all data
// Or selectively:
localStorage.removeItem('llmGuardrailTestHistory');
```

### Docker Container Issues

**Problem:** Frontend container can't reach backend

**Solution:**
- Inside Docker network, use service names: `http://api-gateway:3001`
- From host machine, use external ports: `http://localhost:3003`
- Check `VITE_API_URL` environment variable

**Problem:** Node modules not working after rebuilding

**Solution:** Docker volumes cache compiled node_modules. Rebuild with no cache:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Data Transformation Issues

**Problem:** COMPASS data changes not appearing in UI

**Solution:** Regenerate transformed data:
```bash
node scripts/transform-compass-data.cjs
node scripts/finalize-compass-translations.cjs
```

Then refresh the browser to reload the static imports.

**Problem:** Excel parsing errors in transformation scripts

**Solution:** Ensure Excel file path is correct and file is not open in another program. Check `data_ai_risk/` directory for source files.

### Build Failures

**Problem:** TypeScript errors during `npm run build`

**Common Causes:**
1. Missing type definitions - run `npm install`
2. Prisma client not generated - run `cd backend && npm run prisma:generate`
3. Import path errors - check `@/*` aliases in `vite.config.ts`

**Problem:** Vite build succeeds but app doesn't work in production

**Solution:** Check environment variables. Vite only includes `VITE_*` prefixed variables in build. Ensure all required variables are set in production environment.
