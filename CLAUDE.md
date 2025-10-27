# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI RISK MANAGER is a comprehensive Single-Page Application (SPA) for testing, managing, and governing AI system security. The application simulates LLM guardrail testing, manages AI risk assessments, and provides governance frameworks for AI systems. It operates 100% client-side with no backend server, ensuring complete data privacy and security.

## Development Commands

### Development Server
```bash
npm run dev
```
Starts Vite dev server on `http://0.0.0.0:3000` with hot module replacement.

### Build
```bash
npm run build
```
Creates production build via Vite. Output goes to `dist/` directory.

### Preview Build
```bash
npm run preview
```
Serves production build locally for testing.

## Environment Configuration

The application uses Gemini API for dynamic prompt generation. Set up environment variables:

1. Create a `.env` file in the root directory (not tracked in git)
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

The key is accessed via `process.env.API_KEY` or `process.env.GEMINI_API_KEY` (both are defined in `vite.config.ts`).

**Important:** The app operates primarily offline. Gemini API is only called for test prompt generation (`geminiService.ts`). If the API fails, the system falls back to mock generation using local templates.

## Architecture

### Core Philosophy
- **100% Client-Side**: No backend server, all processing in browser
- **Privacy by Design**: No data sent to external servers except Gemini API for prompt generation
- **Ephemeral State**: Test results stored in memory only (cleared on page refresh)
- **Local Persistence**: Configuration data persisted in `localStorage` for UX continuity

### Directory Structure

- `/components/` - React components organized by feature
  - `/ui/` - Reusable UI components (Card, Button, Modal, etc.)
  - `/wiki/` - Wiki Red Teamer module components
  - `/chatbot/` - Chatbot interface components
  - Feature-specific views (Dashboard, Analytics, etc.)
- `/contexts/` - React Context providers for state management (each module has its own context)
- `/services/` - Business logic layer, decoupled from UI
  - `geminiService.ts` - ONLY place making external API calls (Gemini)
  - `testRunnerService.ts` - Simulates test execution (NO external calls)
  - `sandboxService.ts` - Local sandbox test mode
  - `agenticService.ts` - Agentic AI system utilities
- `/data/` - Static content and reference data
  - `aiPolicyContent.ts` - AI policy framework data
  - `wikiContent.tsx` - Wiki reference content
  - `aiRiskRepositoryContent.ts` - Risk database content
- `/hooks/` - Custom React hooks
- `types.ts` - TypeScript type definitions for entire application
- `constants.ts` - Application constants and configuration data

### State Management

Uses **React Context API** for state management. Each domain has dedicated context:

- `TestRunContext` - Active test session state (ephemeral)
- `DatasetContext` - Attack prompt library management
- `AIPolicyContext` - AI policy management
- `AIRiskRepositoryContext` - Risk repository data
- `WikiContext` - Wiki content state
- `SettingsContext` - User settings
- Plus 10+ additional contexts for specific modules

**Persistence Strategy:**
- Test configuration data → `localStorage`
- Historical test runs → `localStorage` (last 20 runs, key: `llmGuardrailTestHistory`)
- Active test state → Memory only

### Test Execution Flow

1. **Configuration** (`TestConfiguration.tsx`): User selects categories, complexity, volume, and target
2. **Prompt Generation** (`geminiService.ts`): Calls Gemini API or falls back to mock generation
3. **Test Execution** (`testRunnerService.ts`): Simulates guardrail evaluation pipeline
   - Creates evaluation chain with timestamps
   - Probabilistic pass/fail based on sensitivity settings
   - Generates remediation suggestions
4. **Real-time Updates** (`LiveTestView.tsx`): Progress bar and statistics
5. **Results Analysis** (`RealTimeResults.tsx`, `ResultDetailModal.tsx`): Audit trail and recommendations

### Key Type Definitions

Located in `types.ts`:
- `GuardrailCategory` - 5 security domains (Security/Privacy, Relevance, Quality, Content, Logic)
- `AttackFamily` - Attack types (Injection, Poisoning, RAG, Leaks, Evasion, Custom)
- `PromptComplexity` - Simple, Moyen, Sophistiqué
- `TestConfiguration` - Complete test setup
- `TestResult` - Includes prompt, response, score, status, evaluation chain, remediation
- `EvaluationStep` - Individual pipeline stage with timestamp

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

The app uses a sidebar navigation system with 17+ modules including:
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

Each module is self-contained with its own context, view component, and data model.

## Styling

- **Tailwind CSS** for utility-first styling
- Custom CSS files for specific animations (`LiveTestView.css`, `AIRiskRepository.css`)
- Dark theme by default (gray-900 backgrounds, cyan accents)
- Lucide React icons throughout

## TypeScript Configuration

- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Path alias: `@/*` maps to root directory
- `allowImportingTsExtensions: true` for `.tsx` imports
- `noEmit: true` (Vite handles compilation)

## Important Notes

1. **French Language**: The application UI and content are primarily in French.

2. **No Testing Framework**: No test files currently in codebase. When adding tests, use the TypeScript configuration as-is.

3. **Gemini API Fallback**: Always handle Gemini API failures gracefully - the mock generation in `geminiService.ts` ensures tests can proceed offline.

4. **localStorage Management**: Be careful when modifying context providers - ensure localStorage keys remain consistent to avoid data loss for users.

5. **Component Hierarchy**: `App.tsx` wraps the entire app in 15+ nested context providers. Order matters for context dependencies.

6. **OWASP Attribution**: Content based on OWASP LLM Top 10 and Agentic AI Top 15 projects (CC BY-SA 4.0 licensed). Maintain attribution in footer.

## Working with Contexts

When modifying state management:
1. Check if related context exists in `/contexts/`
2. Context providers are nested in `App.tsx` - dependencies flow from outer to inner
3. Custom hook pattern: `useContextName()` throws error if used outside provider
4. localStorage persistence handled in `useEffect` hooks within contexts
5. Use `useAllContexts.ts` hook when component needs multiple contexts

## Adding New Features

1. Create types in `types.ts`
2. Create context in `/contexts/` if needed
3. Create view component in `/components/`
4. Add navigation item in `App.tsx` navItems array
5. Wrap provider in `App.tsx` if context created
6. Update constants in `constants.ts` if adding reference data
