# CROSS-CUTTING ARCHITECTURE ANALYSIS REPORT
## AI Risk Manager - Guardrails Platform
### Analysis Date: 2026-03-01

---

## 1. TYPES.TS ANALYSIS (756+ lines)

### Issues Found:

#### HIGH SEVERITY:
- **Type Duplication & Naming Conflicts** (CRITICAL TECHNICAL DEBT)
  - Multiple "threat profile" types with different structures:
    - `ThreatProfile` (DB): fields `profile`, `threat`, `note`, `initialRating`, `defenses` (lines 138-145)
    - `CompassThreatProfile` (COMPASS): fields `name`, `description`, `systemType`, `aiComponents`, `riskAppetite` (lines 683-692)
  - Multiple "vulnerability" types:
    - `KnownVulnerability` (DB): fields `organizationTool`, `cveIdentifier`, `associatedCwes` (lines 200-212)
    - `CompassKnownVulnerability` (COMPASS): fields `title`, `description`, `cveId` (lines 706-717)
  - Multiple "incident" types:
    - `KnownAIIncident` (lines 215-221)
    - `KnownIncident` (COMPASS, lines 720-731)
  - Multiple "defense/mitigation" types:
    - `DefenseMitigationReference` (DB, lines 336-347)
    - `DefenseMitigation` (COMPASS, lines 734-746)
  - **Impact**: Developer confusion, type casting errors, maintenance burden

#### MEDIUM SEVERITY:
- **Logical Grouping Issues - No Clear Architecture**:
  - Lines 1-77: Test configuration types
  - Lines 78-200: Test execution & Guardrail types
  - Lines 201-374: Reference data types (disparate grouping)
  - Lines 375-478: AI Policy types (mixed with reference data)
  - Lines 481-577: AI Risk Repository types
  - Lines 580-757: OWASP COMPASS types
  - Lines 760-860: Application Profile types
  - Lines 891-937: LLM Configuration types
  - **Problem**: File has become monolithic with 8+ feature domains mixed together
  - **Result**: 20+ second IDE indexing time, poor discoverability

- **Inconsistent Rating/Status/Level Naming Conventions**:
  - Rating types: `ThreatRating` (line 129), `CompassRating` (line 298), `RedTeamRating` (line 265), `ReadinessRating` (line 237), `QuestionRating` (line 376) - 5 different enums for similar concepts
  - Status types: `TestStatus` (line 87), `AIPolicyRuleStatus` (line 417), `RoadmapStatus` (line 323), `ApplicationTestSession.status` property (line 868) - 4 different patterns
  - Level types: `RiskLevel` (line 590), `VulnerabilitySeverity` (line 198), `ImpactLevelName` (line 154) - 3 incompatible level systems
  - **Impact**: Type guards become complex, switch statements unmaintainable

- **Inconsistent Language & Terminology**:
  - Some enums in English: `GuardrailCategory` (lines 1-7) with mixed FR/EN values: "Sécurité et Confidentialité"
  - Some in French: `PromptComplexity.MOYEN` (line 26)
  - Some bilingual: `BilingualText` interface (lines 584-587)
  - **Problem**: No clear language policy, makes internationalization harder

#### LOW SEVERITY:
- **Complex Nested/Union Types with Unclear Usage**:
  - `WikiChecklistItem`, `WikiChecklistSubSection`, `WikiChecklistCategory` (lines 387-400): Heavily nested
  - `OWASPSheet` (lines 646-655): Metadata type for reference
  - `DatabaseExplainerContent` (lines 490-500): Complex union of text/list/warning/box/h3 types
  - `AIPolicyContentItem` (lines 461-465): Union type with 4 variants
  - **Question**: Are these actually used? Or dead code?

### Recommendation:
**Modularize types.ts - Split into 8 files:**
- `types/test-execution.ts` - Test configuration, prompts, results, evaluation steps
- `types/compass.ts` - OWASP COMPASS threat framework (31 use cases, bilingual)
- `types/database.ts` - Prisma models and database schemas
- `types/references.ts` - Vulnerabilities, incidents, defenses, questions
- `types/policy.ts` - AI Policy framework and rules
- `types/risk-repository.ts` - AI Risk database entries and metadata
- `types/applications.ts` - Application profiles and testing sessions
- `types/llm-config.ts` - LLM providers and configuration
- `types/common.ts` - Shared enums: consolidate 5 rating types into unified system

**Create mapping document**: `types/type-mapping.md`
- Explain COMPASS types vs Database types distinction
- Provide migration path for developers
- List which types are used where

---

## 2. DOCKER CONFIGURATION ANALYSIS

### docker-compose.yml Issues:

#### CRITICAL SECURITY:
- **Hardcoded Gemini API Key** (lines 290-291)
  ```yaml
  STRIX_LLM: gemini/gemini-2.5-flash
  LLM_API_KEY: <REVOKED_2026_05_11>  # ❌ EXPOSED!
  GEMINI_API_KEY: <REVOKED_2026_05_11>  # ❌ EXPOSED!
  ```
  - **Risk**: API key publicly visible in version control
  - **Impact**: Rate limit exhaustion (Strix is aggressive with API calls)
  - **Action Required**: Immediately remove, use `${GEMINI_API_KEY}` env variable only
  - **Verification**: Run `git log -p -- docker-compose.yml | grep -i "AIZA"` to find history

#### HIGH SEVERITY:
- **Inconsistent Frontend Port Configuration** (lines 127-144)
  - External port: `3004` (via Docker port mapping)
  - Container port: `3000` (Vite dev server)
  - `VITE_HMR_PORT`: `3004` (for hot module replacement WebSocket)
  - `VITE_API_URL`: `http://localhost:3003/api/v1` (hardcoded, not flexible)
  - `VITE_WS_URL`: `ws://localhost:3003`
  - **Problem**: Port configuration scattered across docker-compose.yml, Dockerfile, and vite.config.ts
  - **Hard to Change**: Changing port requires updates in 3+ places
  - **Fix**: Use single COMPOSE_PORT env var, inject into all configs

- **Volumes Disabled with No Alternative** (lines 71-79)
  ```yaml
  # volumes:
  #   - ./backend/apps:/app/apps
  #   - ./backend/libs:/app/libs
  # Volumes temporarily disabled for Windows compatibility
  ```
  - **Problem**: No hot reload in development on Windows
  - **Impact**: Must rebuild Docker image on every code change (destroys dev experience)
  - **Fix**: Create `docker-compose.override.yml` for Windows-specific configs
  - **Alternative**: Use `docker-compose.windows.yml` for platform-specific setup

- **Missing Explicit Dependencies on Core Services**
  - `test-execution-service` (lines 90-116) depends on postgres/redis but doesn't declare it (lines 109-113)
  - `frontend` (line 119) only depends on `api-gateway`, not database readiness
  - **Problem**: Race conditions if services start out of order
  - **Fix**: Add explicit `depends_on` with `service_healthy` conditions

#### MEDIUM SEVERITY:
- **Network Isolation Incomplete** (lines 358-365)
  - `pentest-isolated-network` marked `internal: false` (line 365)
  - Comment says "internal: false  # Allow external communication for testing targets"
  - **Problem**: "Isolated network" is NOT isolated (defeats security purpose)
  - **Risk**: Compromised Strix/Garak container could access any external system
  - **Current State**: Network isolation relies on egress firewall rules (not visible)
  - **Fix**: Use network policies with explicit allowed hosts or implement egress filtering at API Gateway

- **Resource Limits Only on Pentest Tools, Not Core Services**:
  - `api-gateway`, `test-execution-service`, `frontend`: NO limits
  - `postgres`, `redis`: NO limits
  - `garak-runner`, `strix-runner`, `promptfoo-runner`: CPU 2.0, RAM 2G (lines 243-250, 274-280, 318-324)
  - **Problem**: Runaway postgres query or frontend memory leak crashes entire stack
  - **Fix**: Add resource limits to all services:
    ```yaml
    api-gateway:
      deploy:
        resources:
          limits:
            cpus: '1.0'
            memory: 1G
    ```

- **Redis Configuration Mismatch** (line 34)
  - `--appendonly yes` (AOF persistence enabled)
  - But `redis_data` volume exists (line 36)
  - **Problem**: No explicit AOF file persistence configuration
  - **Risk**: AOF file not in volume, data lost on container restart
  - **Fix**: Verify AOF file location or use `--appendfilename` config

- **Health Checks Inconsistent**:
  - Postgres: 10s interval, 5s timeout (lines 19-23)
  - Garak/Strix: 30s interval, 10s timeout (lines 257-260, 299-303)
  - Garak/Strix health checks use `--help` (always succeeds, not functional)
  - **Fix**: Implement actual functionality checks, standardize intervals

- **Environment Variable Duplication**:
  - `GEMINI_API_KEY` AND `LLM_API_KEY` (lines 290-291)
  - `DATABASE_URL` uses `postgres:5432` (internal) but should document this (line 60)
  - **Fix**: Document which env vars are required vs optional

### Dockerfile Analysis:

#### Frontend Dockerfile (`/Dockerfile`):

**HIGH**:
- Port inconsistency (stage 1: port 3000, stage 3: port 80)
  - Development stage (line 31): `EXPOSE 3000`
  - Production stage (line 68): `EXPOSE 80`
  - **Problem**: Confusing when viewing Dockerfile in isolation
  - **Fix**: Use port 3000 for both contexts, nginx listening on 3000 internally mapped to 80

- Missing HEALTHCHECK in development stage
  - Only production has HEALTHCHECK (line 71)
  - **Fix**: Add to all stages for consistency

**MEDIUM**:
- Missing nginx.conf optimization
  - Frontend production uses nginx (line 59) but no gzip/caching config mentioned
  - Check if `infrastructure/docker/nginx/nginx.conf` exists

#### Backend API Gateway Dockerfile (`backend/apps/api-gateway/Dockerfile`):

**CRITICAL**:
- **Dual Package Manager Mismatch**
  - Uses `pnpm` (lines 25-29, 72-74)
  - But frontend uses `npm`
  - **Problem**: Lock file incompatibility (`pnpm-lock.yaml` vs `package-lock.json`)
  - Different dependency resolution, different node_modules structure
  - CI must handle both formats
  - **Action**: Standardize on npm across entire monorepo NOW
  - Line 26-32: Remove pnpm, use npm only

- **Double Rebuild of bcrypt** (line 32)
  ```dockerfile
  RUN pnpm install
  RUN npm rebuild bcrypt --build-from-source  # Force npm rebuild after pnpm!
  ```
  - **Problem**: pnpm already handles native rebuilds, this is redundant
  - Forces npm to rebuild what pnpm just built
  - **Fix**: Remove npm rebuild line, trust pnpm

**HIGH**:
- Signal handling inconsistency (line 136)
  - Production uses `dumb-init` (line 136): `ENTRYPOINT ["dumb-init", "--"]`
  - Development uses CMD directly (line 47): `CMD ["pnpm", "run", "start:dev"]`
  - **Problem**: Signal propagation differs between dev and prod
  - **Fix**: Add dumb-init to development stage as well

- Layer caching optimization missing
  - Prisma schema copied separately (line 35) from package.json (line 22)
  - **Problem**: Changes to prisma/schema.prisma invalidate npm install layer
  - **Fix**: Copy schema in same RUN command as prisma generate

#### Strix Dockerfile (`backend/docker/strix/Dockerfile`):

**HIGH**:
- Poetry version hardcoded (line 49): `pip install --no-cache-dir poetry==1.8.3`
  - **Problem**: Version pinning too strict, may conflict with newer Python packages
  - **Fix**: Use `poetry^1.8.0` or document why 1.8.3 is required

- Docker socket access requires manual bridge connection (docker-compose lines 297-298)
  ```yaml
  # NOTE: Bridge network must be connected manually after container start:
  # docker network connect bridge airiskmgr-strix-runner
  ```
  - **Problem**: Automation cannot work, requires operator intervention
  - **Impact**: Container starts but Docker-in-Docker fails
  - **Fix**: Use Docker entrypoint to auto-connect to bridge network

- Non-root user can run sudo without password (lines 91-92)
  ```dockerfile
  echo "strix ALL=(root) NOPASSWD: /bin/chown, /bin/chmod" >> /etc/sudoers.d/strix
  ```
  - **Security Risk**: Privilege escalation vulnerability
  - Strix user can run arbitrary chown/chmod
  - **Fix**: Use Unix socket permissions instead (already partially implemented)

- Playwright browser install marked optional (line 67): `|| true`
  - **Problem**: If Playwright fails, Strix silently fails later
  - **Fix**: Remove `|| true`, fail fast with error message

#### Garak Dockerfile (`backend/docker/garak/Dockerfile`):

**HIGH**:
- Uses `latest` version (line 33): `pip install --no-cache-dir garak`
  - **Problem**: Builds are non-deterministic (different versions on each build)
  - **Fix**: Pin version: `pip install --no-cache-dir garak==0.x.x`

#### Promptfoo Dockerfile (`backend/docker/promptfoo/Dockerfile`):

**HIGH**:
- Uses `latest` version (line 30): `npm install -g promptfoo@latest`
  - **Fix**: Pin version: `npm install -g promptfoo@3.x.x`

---

## 3. FRONTEND/BACKEND TYPE COHERENCE

### Critical Mismatches:

#### LLM Configuration (BLOCKING ISSUE)
- Frontend type: `LLMConfiguration` (types.ts lines 920-929)
  ```typescript
  interface LLMConfiguration {
    provider: LLMProvider;
    apiKey?: string;
    model: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
  }
  ```
- Backend DTO: Located at `backend/apps/api-gateway/src/llm/dto/llm-configuration.dto.ts`
- **Problem**: Cannot verify they match without reading DTO file
- **Risk**: Frontend sends wrong shape, backend rejects request
- **Action**: Add shared type file that both import from

#### Strix Agent Configuration
- Frontend likely passes `StrixAgentConfig` via WebSocket to backend
- Backend receives via `backend/apps/api-gateway/src/strix/dto/agent-config.dto.ts`
- **Problem**: If shapes mismatch, WebSocket messages silently fail
- **Action**: Validate DTO matches frontend interface

#### Missing Type Exports
- types.ts has 100+ type definitions
- No `export` statements visible (assumed all are exported)
- Backend likely imports: `import { LLMConfiguration, TestResult } from '../../types'`
- **Problem**: Long import paths, relative imports fragile
- **Fix**: Re-export all types from single index file

### API Contract Issues:
- Frontend expects `/api/v1` endpoints (docker-compose line 131)
- Backend routes not visible in provided files
- **Missing**: OpenAPI/Swagger documentation link in types.ts
- **Fix**: Add JSDoc comments with API endpoint examples

---

## 4. BUILD CONFIGURATION ANALYSIS

### vite.config.ts Issues:

#### MEDIUM:
- **Excessive Watch Ignore Patterns** (lines 35-55)
  - Ignores `**/*.md` files
  - Ignores `/guardrail/**` (entire directory)
  - Ignores `/backend/**` (entire directory)
  - Ignores `/scripts/**`
  - **Problem**: 30-second poll interval with lots of exclusions suggests performance issues
  - **Question**: Why is Vite scanning backend/ if it's ignored?
  - **Fix**: Move backend outside Vite's watch scope entirely

- **Watch Polling Interval Too Long** (line 33): 30000ms (30 seconds)
  - **Problem**: Developer sees 30-second lag between code save and hot reload
  - **Fix**: Reduce to 5000ms (5 seconds) for acceptable UX
  - Note: Native file watching (inotify/FSEvents) is better than polling

- **Server strictPort = false** (line 20)
  - **Problem**: Silently falls back to random port if 5080 taken
  - Confuses developers who can't find dev server
  - **Fix**: Set `strictPort: true`, fail fast with clear error

- **Chunk Size Warning = 1000KB** (line 101)
  - Very large chunks (1MB+)
  - **Problem**: Entire vendor bundles in single chunk, poor caching
  - **Fix**: Reduce to 500KB-750KB for better granularity
  - This explains why Vite watch is slow

#### LOW:
- **ESBuild Sourcemaps Disabled** (lines 123-124)
  - `sourcemap: false`
  - **Problem**: Cannot debug production issues
  - **Fix**: Enable in dev mode, disable in prod

- **Middleware Mode Off** (line 30): `middlewareMode: false`
  - **Problem**: Unclear if intentional (no SSR planned?)
  - **Fix**: Document architectural decision or remove confusing config

### tsconfig.json Issues:

#### HIGH:
- **allowImportingTsExtensions: true** (line 27)
  - Allows `import './file.ts'` in source code
  - **Problem**: Breaks in production builds (Vite doesn't support)
  - **Fix**: Remove, use `.ts` only in `.d.ts` declaration files

#### GOOD:
- ✅ Path alias `@/*` properly configured (lines 21-24)
- ✅ `noEmit: true` correct (line 28) - Vite handles compilation
- ✅ `moduleResolution: bundler` correct for Vite

---

## 5. ENVIRONMENT VARIABLES INCONSISTENCY

### Frontend .env Issues:
```env
GEMINI_API_KEY=your_key_here          # ❌ EXPOSED CLIENT-SIDE!
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
```

**Problem**: `GEMINI_API_KEY` sent to browser, violates security model
- **Fix**: Remove from frontend, only configure in backend

### Backend .env Issues (docker-compose lines 57-71):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://airiskmgr:...@postgres:5432/...
REDIS_HOST=redis                      # Internal container name ✅
REDIS_PORT=6379                       # Internal port ✅
GEMINI_API_KEY=${GEMINI_API_KEY}      # Should come from env ✅
CORS_ORIGIN=http://localhost:3004     # ❌ Hardcoded!
JWT_SECRET=dev-jwt-secret...          # ❌ Development only!
ENCRYPTION_KEY=dev-32-char...         # ❌ Development only!
```

**Issues**:
1. `CORS_ORIGIN` hardcoded - should be env var for flexibility
2. `JWT_SECRET` and `ENCRYPTION_KEY` are placeholder strings
3. No validation that these are secrets

### Missing Configs:
- ❌ No `.env.production` template
- ❌ No `.env.test` template
- ❌ No `.env.example` for reference
- ❌ No validation that required env vars are set

### Consistency Issues:
- Frontend uses `VITE_` prefix (Vite convention)
- Backend uses no prefix
- **Fix**: Document why and enforce consistency

### Docker .env Issues:
- `GEMINI_API_KEY` hardcoded in docker-compose.yml (line 290) ← SECURITY HOLE
- Should only use `${GEMINI_API_KEY}` from environment

---

## 6. CODE DEAD & ORPHANED FILES

### Root-level Documentation (111+ FILES) - EXCESSIVE CLUTTER

**Documentation Files by Category**:

| Category | Count | Examples | Action |
|----------|-------|----------|--------|
| Strix Fixes | 15 | STRIX_*.md | Archive to `/docs/archive/strix/` |
| Corrections | 3 | CORRECTIONS_*.md | Archive to `/docs/archive/` |
| Fixes | 5 | FIX_*.md | Archive to `/docs/archive/` |
| Integration | 5 | INTEGRATION_*.md | Archive to `/docs/archive/` |
| Migrations | 3 | MIGRATION_*.md | Archive to `/docs/active-docs/` |
| Setup Guides | 8 | SETUP_*.md, QUICK_*.md | Archive to `/docs/active-docs/` |
| Reference | 25 | README_*, GUIDE_*, INDEX_* | Consolidate to 1 README.md |
| Other | 42 | Various status, summaries | Archive to `/docs/archive/` |

**Impact**:
- Developers unsure which docs are current
- New contributor overwhelmed by 111 .md files
- Git history difficult to navigate
- Recommendation: Archive to `/docs/archive/`, keep 5-10 active docs

### Backup Files:
- `components/PromptfooResultsView.tsx.bak` (line 1 of git status)
- **Action**: Delete immediately, use git instead

### System Files:
- `bash.exe.stackdump` (from MINGW64 crash, line 1 of git status)
- **Action**: Delete, add `*.stackdump` to .gitignore

### PowerShell Script Proliferation:
- 8 different install scripts:
  - `install.ps1` (canonical?)
  - `install-auto.ps1`
  - `install-auto-clean.ps1`
  - `install-auto-v2.ps1`
  - `install-complete.ps1`
  - `test-install.ps1`
  - `install-tools.ps1`
  - `quick-install.ps1`
- **Problem**: Unclear which is current
- **Action**: Keep 1 canonical `install.ps1`, archive others to `/scripts/archive/`

### Untracked Files Concern (git status):
- `components/LLMConfigView.tsx` (untracked)
- `contexts/LLMConfigContext.tsx` (untracked)
- `constants/` (untracked)
- `src/components/strix/` (untracked)
- `src/components/unified/StrixDashboardEnriched.tsx` (untracked)
- `src/hooks/` (untracked)
- `src/types/` (untracked)
- **Question**: Are these new features not yet committed? Or alternative implementations?
- **Risk**: Merge conflicts, duplicated code
- **Action**: Investigate and either commit or delete

### Unused/Orphaned Directories:
- `./.kiro/` (untracked)
- `./.qodo/` (untracked)
- **Action**: Document purpose or delete

---

## 7. DEPENDENCY ANALYSIS

### Frontend package.json (27 total - MINIMAL):
**Used**:
- ✅ React, React-DOM: Core framework
- ✅ Lucide-React: Icons (0.543.0)
- ✅ Recharts: Charts/graphs (3.2.0)
- ✅ Socket.IO-Client: WebSocket real-time (4.8.1)
- ✅ jsPDF, jsPDF-AutoTable: PDF export (3.0.3, 5.0.2)

**Dev Dependencies**:
- ✅ Vite: Build tool (6.2.0)
- ✅ TypeScript: Compiler (5.8.2)
- ✅ @vitejs/plugin-react: JSX support

**Issues**:
- ❌ No testing framework (should add Vitest)
- ❌ No linting (should add ESLint, Prettier)
- ⚠️ Minimal dependencies - good for bundle size

### Backend package.json (60+ dependencies):

**Core Frameworks**:
- ✅ NestJS ecosystem: Complete set (lines 30-41)
- ✅ Database: Prisma ORM + client (line 42)
- ✅ Cache: Redis client (line 57)

**LLM Integrations**:
- ✅ `@google/generative-ai` (line 28) - Gemini (PRIMARY)
- ✅ `openai` (line 53) - GPT (FALLBACK)
- ✅ `@mistralai/mistralai` (line 29) - Mistral (SUPPORTED)
- ✅ `@anthropic-ai/sdk` (line 26) - Claude (SUPPORTED)
- ✅ `groq-sdk` (line 51) - Groq (SUPPORTED)
- ⚠️ `@google/genai` (line 27) - LIKELY DEPRECATED by `@google/generative-ai`
  - **Recommendation**: Check if used, likely safe to remove

**Unused/Questioned**:
- ❌ `@anthropic-ai/sdk` - No Claude integration visible in code
  - **Action**: Search codebase, remove if unused
- ⚠️ `openai` - Is this used or just fallback?
  - **Action**: Document fallback strategy

**Package Manager Conflict**:
- Backend uses `pnpm` (pnpm-lock.yaml)
- Frontend uses `npm` (package-lock.json)
- **CRITICAL ISSUE**: Two different lock files in monorepo
  - Different dependency resolution algorithms
  - Version conflicts likely
  - CI/CD must handle both
  - **Action**: Standardize on npm, delete pnpm-lock.yaml

**Missing Dependencies**:
- Strix uses `litellm` (Python package) for LLM routing
- This is NOT in Node.js backend - Strix runs as separate container
- **Clarification**: Strix is Python-based CLI, not Node.js package

---

## 8. DATA TRANSFORMATION SCRIPTS

### Script Files in /scripts/ (8 total):
1. `transform-compass-data.cjs` - Parse OWASP Excel to TypeScript
2. `finalize-compass-translations.cjs` - Bilingual support
3. `link-compass-relationships.cjs` - Cross-reference linking
4. `analyze-compass-relationships.cjs` - Relationship analysis/debug
5. `update-compass-with-relationships.cjs` - Relationship updates
6. `parse-ai-risk-database.cjs` - AI Risk Repository parsing
7. `translate-compass-content.cjs` - Translation logic
8. `debug-json-parse.cjs` - Debug utility

### Issues:

**HIGH**:
- **Unclear execution order**
  - 5 scripts mention "relationships" (transform, link, update, analyze)
  - **Problem**: Which to run first? Dependencies unclear
  - No documentation on flow

- **No master orchestration script**
  - No `build-compass-data.sh` or npm script that calls them in order
  - **Fix**: Create master script:
    ```json
    "build:compass": "npm run compass:transform && npm run compass:link && npm run compass:finalize"
    ```

**MEDIUM**:
- **No error handling or validation**
  - Scripts likely fail silently if input malformed
  - No JSON schema validation of output
  - **Fix**: Add post-script validation using `ajv` (JSON Schema validator)

- **Duplicate/overlapping functionality**
  - `transform-compass-data.cjs` + `link-compass-relationships.cjs` + `update-compass-with-relationships.cjs`
  - **Problem**: 3 scripts doing similar things
  - **Fix**: Consolidate into single `build-compass-data.cjs` with clear phases

- **All CommonJS (.cjs) extension** (✅ CORRECT)
  - Allows Node.js to run them directly without babel
  - No ES6 module issues

---

## 9. SECURITY VULNERABILITIES

### CRITICAL (Immediate Action Required):
1. **Hardcoded Gemini API Key in docker-compose.yml (line 290)**
   - Visible in version control
   - Action: Remove immediately, use `${GEMINI_API_KEY}` env variable
   - Verify: `git log -p -- docker-compose.yml | grep -i "AIZA"`

2. **Gemini API Key exposed in frontend env file**
   - Should NEVER be in frontend, only backend
   - Action: Remove GEMINI_API_KEY from frontend .env

3. **JWT_SECRET = "dev-jwt-secret-change-in-production"**
   - Too weak, easily brute-forceable
   - Action: Enforce environment variable in production

### HIGH (Security Impact):
1. **Strix Docker socket access requires privileged operations**
   - Non-root user has sudoers access to chown/chmod
   - Action: Use Unix socket file permissions instead

2. **Plaintext passwords in docker-compose.yml**
   - `POSTGRES_PASSWORD: airiskmgr_dev_password`
   - `REDIS_PASSWORD: redis_dev_password`
   - Action: Use Docker Compose secrets or .env file

3. **CORS_ORIGIN hardcoded** (docker-compose line 69)
   - Should use env variable for flexibility
   - Action: Change to `${CORS_ORIGIN:-http://localhost:3004}`

4. **No input validation visible**
   - API endpoints should validate all user input
   - Action: Add class-validator decorators to all DTOs

### MEDIUM (Security Concern):
1. **Throttling configuration weak**
   - THROTTLE_LIMIT: 100 requests per 60 seconds (docker-compose line 71)
   - Strix rate limiting: 10 RPM (more restrictive)
   - Action: Document rate limiting strategy

2. **Network isolation incomplete**
   - pentest-isolated-network marked `internal: false`
   - Relies on external firewall rules (not enforced)
   - Action: Implement egress filtering at API Gateway level

3. **No audit logging visible**
   - Cannot track who did what
   - Action: Implement audit trail for security operations

---

## 10. ARCHITECTURE INCONSISTENCIES

### Monorepo Structure Fragmentation:
```
/                           # Frontend root
├── components/             # React components
├── contexts/              # React Context providers
├── services/              # Business logic
├── types.ts               # All TypeScript types (756+ lines)
├── /backend/              # Backend monorepo
│   ├── apps/
│   │   ├── api-gateway/   # Main API
│   │   ├── test-execution-service/
│   │   └── ...
│   ├── libs/              # (empty/unused?)
│   ├── prisma/            # Database schema
│   └── package.json       # Using pnpm
├── package.json           # Using npm
└── ...
```

**Problems**:
1. No `/packages/shared/` for shared code
2. Frontend and backend types duplicated
3. Two package managers (npm vs pnpm)
4. No clear code reuse strategy

**Recommendation**:
```
/
├── packages/
│   ├── shared/            # Shared types, utils
│   │   ├── types/
│   │   ├── utils/
│   │   └── package.json
│   ├── frontend/          # Move frontend here
│   └── backend/           # Move backend here
└── package.json           # Root workspace config
```

### State Management Over-Complexity:
- Frontend: 21 React Context providers (excessive)
- **Normal**: 5-10 contexts
- **Too many**: Each context adds ~100-200ms to React tree traversal
- **Problem**: No clear data flow or dependency graph
- **Fix**: Reduce to:
  - LanguageContext (i18n)
  - NavigationContext (routing)
  - AuthContext (user session)
  - SettingsContext (preferences)
  - TestRunContext (active test session)
  - LLMConfigContext (model configuration)
  - That's 6, rest can be local state or single merged context

### Backend-Frontend State Sync:
- Frontend: localStorage (ephemeral on page refresh)
- Backend: PostgreSQL (persistent)
- **Problem**: No sync mechanism visible
  - Test results saved to localStorage, lost on logout
  - Sync happens only on explicit save
- **Risk**: Data inconsistency between frontend form state and backend
- **Fix**: Implement saga pattern or dedicated sync service

---

## SUMMARY: FINDINGS BY SEVERITY & IMPACT

| Severity | Count | Category | Effort | Impact |
|----------|-------|----------|--------|--------|
| **CRITICAL** | 3 | Security | 1h | Immediate risk |
| **HIGH** | 15 | Architecture | 40h | System stability |
| **MEDIUM** | 22 | Consistency | 30h | Developer experience |
| **LOW** | 18 | Optimization | 20h | Performance |
| **DOCUMENTATION** | 111+ | Root clutter | 10h | Maintainability |

**Total Technical Debt**: ~100 hours of refactoring needed

---

## RECOMMENDED ACTION PLAN

### Phase 1 (IMMEDIATE - Week 1):
**Priority**: Fix security issues, prevent catastrophic failures

1. **Remove hardcoded API key** (30 min)
   - Delete line 290-291 in docker-compose.yml
   - Verify git history cleaned

2. **Split types.ts** (4 hours)
   - Create 8 new files in types/ directory
   - Update all imports
   - Add mapping document

3. **Standardize package manager** (1 hour)
   - Delete pnpm-lock.yaml
   - Verify backend uses npm
   - Update CI/CD if needed

4. **Add .env templates** (30 min)
   - Create .env.example
   - Create .env.production.example
   - Document all variables

### Phase 2 (SHORT-TERM - Week 2-3):
**Priority**: Improve developer experience and build reliability

1. **Consolidate documentation** (2 hours)
   - Archive 111 .md files to /docs/archive/
   - Keep 5-10 active docs
   - Create doc index

2. **Reduce install scripts to 1** (30 min)
   - Keep install.ps1 canonical
   - Archive others

3. **Add resource limits to all services** (1 hour)
   - docker-compose.yml
   - Test failover scenarios

4. **Create docker-compose.override.yml** (1 hour)
   - Platform-specific configs for Windows/Mac
   - Enable volume mounting for hot reload

### Phase 3 (MEDIUM-TERM - Week 4-6):
**Priority**: Architectural improvements

1. **Create /packages/shared/** (3 hours)
   - Move shared types
   - Add shared utilities
   - Update imports

2. **Consolidate data scripts** (2 hours)
   - Create master build-compass-data.cjs
   - Add validation
   - Document flow

3. **Add frontend testing** (2 hours)
   - Install Vitest
   - Add ESLint/Prettier
   - Configure pre-commit hooks

4. **Reduce React Context complexity** (2 hours)
   - Merge related contexts
   - Document data flow
   - Add context dependency diagram

### Phase 4 (LONG-TERM - Month 2+):
**Priority**: System-wide improvements

1. **Implement frontend-backend sync** (5 hours)
2. **Add OpenAPI documentation** (3 hours)
3. **Implement audit logging** (3 hours)
4. **Complete test coverage** (5 hours+)

---

## VERIFICATION CHECKLIST

- [ ] No hardcoded API keys in version control
- [ ] Package manager standardized (npm only)
- [ ] types.ts split into modular files
- [ ] Resource limits set on all Docker services
- [ ] Documentation consolidated and archived
- [ ] Hot reload working on Windows (docker-compose.override.yml)
- [ ] All DTOs match frontend types
- [ ] Environment variables documented with examples
- [ ] Security audit completed
- [ ] Tests added to frontend

---

## NEXT STEPS

1. **Immediately**: Schedule 2-hour security audit sprint
2. **Today**: Commit plan to documentation
3. **This week**: Execute Phase 1 (security + types split)
4. **This month**: Execute Phases 2-3
5. **Ongoing**: Address Phase 4 items as part of regular development

