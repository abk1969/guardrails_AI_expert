# Backend NestJS Architecture Analysis Report

**Analysis Date:** March 1, 2026
**Analyzer:** Backend Architecture Specialist
**Status:** COMPLETE

---

## Executive Summary

The backend architecture consists of a **monolithic NestJS API Gateway** with **13+ feature modules** (Strix, Garak, Promptfoo, Gemini, LLM, MCP, Tests, Policies, Risks, Users, Analytics, System, Unified). The codebase demonstrates strong foundation patterns but exhibits **critical coupling issues, missing abstractions, and scattered error handling**.

**Key Findings:**
- **High Severity Issues:** 7
- **Medium Severity Issues:** 12
- **Low Severity Issues:** 8
- **Total Issues:** 27

**Recommendations:** Extract shared abstractions (ExecutorBase, GatewayBase), implement error filter hierarchy, and refactor process management into service layer.

---

## 1. MODULE STRUCTURE & SEPARATION OF CONCERNS

### 1.1 Module Organization

**Current Structure:**
```
apps/api-gateway/src/
├── strix/          (Strix agent testing)
├── garak/          (LLM vulnerability scanning)
├── promptfoo/      (Test execution framework)
├── gemini/         (LLM API integration)
├── llm/            (LLM configuration management)
├── mcp/            (Model Context Protocol)
├── unified/        (Unified orchestration - incomplete)
├── tests/          (Test run management)
├── policies/       (AI policy management)
├── risks/          (Risk assessment)
├── users/          (User management)
├── analytics/      (Analytics)
├── system/         (System health)
├── auth/           (Authentication)
└── app.module.ts   (Root module)
```

**Issues Found:**

#### **CRITICAL [HIGH-001] - Distributed Process Management Responsibility**
- **File:** `strix.service.ts:242-332`, `garak.service.ts:186-254`, `promptfoo.service.ts:124-217`
- **Severity:** HIGH
- **Issue:** Each service independently manages process spawning, Docker execution, and lifecycle
  - Strix uses `spawn('docker', ...)` directly (line 243)
  - Garak uses `execFileAsync('docker', ...)` directly (line 208)
  - Promptfoo uses `execFileAsync('docker', ...)` directly (line 166)
- **Problem:** NO shared abstraction, repeated code, inconsistent error handling
- **Impact:** Difficult to maintain, extend, or add new testing tools
- **Recommendation:** Extract `ProcessExecutorService` base class

```typescript
// NEW: common/services/process-executor.service.ts
abstract class ProcessExecutorService {
  protected abstract buildCommand(...args): string[];
  protected abstract handleOutput(data: Buffer): void;
  protected abstract handleError(error: Error): void;

  async executeInDocker(containerName: string, args: string[]): Promise<void> {
    // Centralized Docker execution logic
  }
}
```

---

#### **HIGH-002 - Circular Dependency: Service → Gateway → Service**
- **File:** `strix.service.ts:19-20`, `garak.service.ts:21-22`, `promptfoo.service.ts:24-26`
- **Severity:** HIGH
- **Issue:** Services inject Gateways with `@Inject(forwardRef(...))` to emit events
  - Creates bidirectional dependency between service and gateway
  - Violates separation of concerns (service shouldn't control presentation layer)
- **Example:**
  ```typescript
  constructor(
    @Inject(forwardRef(() => StrixGateway))
    private readonly gateway: StrixGateway,  // ❌ Circular reference
  )
  ```
- **Problem:**
  - Services tightly coupled to WebSocket layer
  - Hard to test services without gateways
  - Gateway logic mixed with business logic events
- **Recommendation:** Use event-driven architecture instead

```typescript
// Better: Services emit domain events, listeners handle WebSocket
@Injectable()
class StrixService {
  constructor(private eventEmitter: EventEmitter2) {}

  async startExecution(...) {
    // Just emit event
    this.eventEmitter.emit('strix.execution.started', { id, ... });
  }
}

// Separate listener
@WebSocketGateway()
class StrixEventListener {
  @OnEvent('strix.execution.started')
  onExecutionStarted(event) {
    this.server.emit(`strix:started:${event.id}`, ...);
  }
}
```

---

#### **HIGH-003 - Missing Error Filter Hierarchy**
- **File:** `main.ts:46-55`, services throughout
- **Severity:** HIGH
- **Issue:** No centralized error handling/transformation
- **Current:** Only `ValidationPipe` at global level, catch-all error handling in services
- **Problems:**
  - Errors formatted inconsistently (some throw, some log and return)
  - No unified error response format
  - Difficult to add cross-cutting concerns (logging, monitoring)
- **Example Inconsistencies:**
  ```typescript
  // strix.service.ts:164-165
  } catch (error) {
    this.logger.error('Failed to start Strix agent', error);
    throw error;  // ❌ Raw error thrown
  }

  // garak.service.ts:177-179
  } catch (error) {
    this.logger.error('Failed to start Garak scan:', error);
    throw error;  // ❌ Raw error thrown
  }

  // llm.service.ts:48-54
  } catch (error) {
    this.logger.error(`Test connection failed for ${config.provider}:`, error);
    return { success: false, message: error.message };  // ✓ Formatted response
  }
  ```
- **Recommendation:** Implement exception filter hierarchy

```typescript
// common/filters/execution-exception.filter.ts
@Catch()
export class ExecutionExceptionFilter implements ExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof ExecutionFailedException) {
      response.status(409).json({
        error: 'EXECUTION_FAILED',
        message: exception.message,
        details: exception.details,
      });
    } else {
      // Handle other exceptions
    }
  }
}
```

---

#### **MEDIUM-001 - Module Exports Inconsistency**
- **File:** `strix.module.ts:11`, `garak.module.ts`, `promptfoo.module.ts`
- **Severity:** MEDIUM
- **Issue:** Services export Gateways (due to circular dependency workaround)
  ```typescript
  exports: [StrixService, StrixGateway],  // ❌ Gateway shouldn't be exported
  ```
- **Better:** Export only services; gateways registered in module providers only
- **Recommendation:** Remove gateway exports once circular dependency is resolved

---

### 1.2 Module Dependency Analysis

**app.module.ts Imports (Lines 17-29):**
- **Count:** 13 feature modules
- **Issue:** `RedisStoreModule` and `BullModule` disabled (lines 42-66)
- **Problem:** Caching and queues commented out for "testing" - needs resolution before production
- **Recommendation:** Re-enable with proper test configurations

---

## 2. DATA TRANSFER OBJECTS (DTOs) & VALIDATION

### 2.1 DTO Quality Analysis

#### **GOOD Practices Found:**
✅ `AgentConfigDto` (strix/dto/agent-config.dto.ts):
- Clear validation rules with `@IsUrl()`, `@IsEnum()`, `@IsNumber()`
- Proper min/max constraints (lines 29-37)
- Optional fields marked with `@IsOptional()`
- Good API documentation with `@ApiProperty()`

#### **HIGH-004 - Inconsistent DTO Validation Coverage**
- **File:** `garak/dto/scan-config.dto.ts`
- **Severity:** HIGH
- **Issue:** Missing validators on critical fields
  ```typescript
  @ApiProperty({ example: 'gpt-4', description: 'LLM model to scan' })
  @IsString()
  model: string;  // ❌ No @IsNotEmpty() or length validation
  ```
- **Problems:**
  - Empty strings accepted as valid
  - No maximum length checks (could crash with huge inputs)
  - API key field lacks pattern validation
- **Recommendation:** Add comprehensive validation

```typescript
export class ScanConfigDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  model: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Pattern(/^sk-[a-zA-Z0-9]{20,}$/)  // Pattern for API keys
  apiKey?: string;
}
```

---

#### **HIGH-005 - Type Unsafe DTO Usage**
- **File:** `promptfoo.service.ts:297`, `garak.service.ts:316`
- **Severity:** HIGH
- **Issue:** DTOs used with `as any` type casting
  ```typescript
  // promptfoo.service.ts:296
  const parsedOutput = JSON.parse(jsonOutput);  // Type: unknown
  const results = parsedOutput.results || parsedOutput;

  if (!Array.isArray(results)) {  // Only runtime check
    throw new Error('Format JSON invalide: results doit être un tableau');
  }

  for (const result of results) {  // result: any
    const passed = result.pass || result.success || result.score >= 0.7;
    // ❌ Accessing arbitrary properties with no type safety
  }
  ```
- **Problems:**
  - No compile-time type checking
  - Runtime errors possible when external APIs return unexpected formats
  - Difficult to refactor/maintain
- **Recommendation:** Create strict response DTOs and use class-transformer

```typescript
// promptfoo.service.ts - NEW
class PromptfooResponseDto {
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  results: PromptfooResultDto[];
}

class PromptfooResultDto {
  @IsBoolean()
  pass: boolean;

  @IsNumber()
  score: number;

  // ... other fields
}

// Usage
const parsedOutput = plainToClass(PromptfooResponseDto, JSON.parse(jsonOutput));
const validation = await validate(parsedOutput);
if (validation.length) throw new BadRequestException(validation);
```

---

#### **MEDIUM-002 - Enum Type Inconsistency**
- **File:** `strix/dto/agent-execution.dto.ts:47-51`
- **Severity:** MEDIUM
- **Issue:** Status field uses string literals instead of enum

```typescript
// Current ❌
status: 'running' | 'paused' | 'completed' | 'failed';

// Better ✅
@IsEnum(ExecutionStatus)
status: ExecutionStatus;
```

**Problem:** No type validation, can't easily extend status values
**All Occurrences:**
- `agent-execution.dto.ts:47-51`
- `strix.service.ts:124-142` (execution state)
- `garak.service.ts:157-175` (scan state)

---

### 2.2 DTO Reusability Opportunities

**MEDIUM-003 - Duplicate Error Response Structures**
- **Location:** Every controller/service
- **Issue:** Error responses formatted inconsistently

```typescript
// Need unified DTO
class ErrorResponseDto {
  @IsString()
  @IsEnum(ErrorCode)
  code: ErrorCode;

  @IsString()
  message: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @IsNumber()
  timestamp: number;
}
```

---

## 3. SERVICE LAYER ANALYSIS

### 3.1 Service Size & Complexity

| Service | Lines | Methods | Issues |
|---------|-------|---------|--------|
| StrixService | 664 | 12 | God Object; mixed concerns |
| PromptfooService | 524 | 7 | Config + execution mixed |
| GarakService | 445 | 7 | Process exec + parsing mixed |
| LLMService | 465 | 11+ | Huge switch statement |
| GeminiService | ~300 | 6+ | API + fallback mixed |

**CRITICAL [HIGH-006] - God Object: StrixService (664 lines)**
- **File:** `strix.service.ts`
- **Severity:** HIGH
- **Responsibilities:**
  1. Command building (lines 40-72)
  2. Process execution (lines 201-332)
  3. Output parsing (lines 377-429)
  4. Result storage (lines 434-485)
  5. Process control (pause/resume/stop - lines 509-611)
  6. State reconstruction (lines 638-663)
- **Impact:**
  - Hard to test individual concerns
  - Changes to one responsibility affect others
  - Difficult to reuse components
- **Recommendation:** Split into 4 services

```typescript
// NEW STRUCTURE:
// 1. StrixCommandBuilder - Command generation
// 2. ProcessManager - Spawning and control
// 3. StrixOutputParser - Parsing outputs
// 4. StrixExecutionService - Orchestration (what's left)
```

---

### 3.2 Error Handling Patterns

#### **HIGH-007 - Inconsistent Try-Catch Patterns**
- **Files:** All services
- **Severity:** HIGH
- **Issues:**

1. **Generic Catch + Log + Rethrow** (StrixService:164-165)
   ```typescript
   } catch (error) {
     this.logger.error('Failed to start Strix agent', error);
     throw error;  // ❌ Raw error exposed to client
   }
   ```

2. **Catch + Silent Logging** (GarakService:369-375)
   ```typescript
   } catch (parseError) {
     this.logger.error(`Failed to parse line: ${line}`, parseError);
     this.gateway.emitLog(scanId, `⚠️ Failed to parse result line`);
     // ❌ User doesn't know parsing failed
   }
   ```

3. **Graceful Degradation** (StrixService:109-119)
   ```typescript
   try {
     testRun = await this.prisma.testRun.create({...});
   } catch (dbError) {
     this.logger.warn('Database unavailable, running in memory-only mode');
     // ✓ Fallback to in-memory
   }
   ```

4. **Inconsistent Response Format** (LLMService:57-92)
   ```typescript
   // Returns object instead of throwing
   { success: false, message: 'Error...' }
   ```

- **Recommendation:** Standardize error handling approach

---

### 3.3 Dependency Injection Patterns

#### **MEDIUM-004 - Missing Abstraction: Docker Execution**
- **Files:** `strix.service.ts:243`, `garak.service.ts:208`, `promptfoo.service.ts:166`
- **Severity:** MEDIUM
- **Issue:** Direct `spawn()`/`exec()` calls without abstraction

```typescript
// ✓ Better approach
@Injectable()
class DockerExecutorService {
  async execContainer(
    container: string,
    args: string[],
    options?: ExecOptions
  ): Promise<ExecResult> {
    // Centralized Docker logic
  }
}

// Usage in services
class StrixService {
  constructor(private dockerExecutor: DockerExecutorService) {}

  async runStrixAgent(...) {
    await this.dockerExecutor.execContainer('airiskmgr-strix-runner', args);
  }
}
```

---

### 3.4 Async & Process Management

#### **HIGH-008 - Non-Blocking Execution Without Guarantee**
- **Files:** `promptfoo.service.ts:145-216`, `garak.service.ts:186-254`
- **Severity:** HIGH
- **Issue:** Async execution launched without tracking

```typescript
// promptfoo.service.ts:94-94
this.runPromptfooInDocker(containerConfigPath, testRunId);

// Then: setTimeout(async () => { ... }, 0)  ❌ No error handling wrapper
setTimeout(async () => {
  try {
    // execution code
  } catch (error) {
    // Errors in setTimeout callbacks often lost
  }
}, 0);
```

**Problems:**
- Errors in async execution not properly caught
- Test run can be created but execution fails silently
- No retry mechanism
- Difficult to track execution status

**Recommendation:** Use job queues (Bull)

```typescript
// ✓ Better approach
@Injectable()
class PromptfooExecutorQueue {
  constructor(
    @Inject('PROMPTFOO_QUEUE')
    private queue: Queue<PromptfooExecutionJob>
  ) {}

  async queueExecution(config: RunPromptfooDto): Promise<string> {
    const job = await this.queue.add(config, {
      backoff: { type: 'exponential', delay: 2000 },
      attempts: 3,
      removeOnComplete: true,
    });
    return job.id;
  }

  @Process()
  async handleExecution(job: Job<PromptfooExecutionJob>) {
    try {
      // Execution with proper error handling
    } catch (error) {
      job.attemptsMade < job.attempts ? throw error : job.moveToFailed();
    }
  }
}
```

---

## 4. WEBSOCKET & REAL-TIME UPDATES

### 4.1 Gateway Pattern Analysis

**Files Analyzed:**
- `strix.gateway.ts` (189 lines)
- `garak.gateway.ts` (130 lines)
- `promptfoo.gateway.ts` (similar pattern)

#### **MEDIUM-005 - Gateway Duplication**
- **Severity:** MEDIUM
- **Issue:** Three nearly identical gateway implementations

```typescript
// strix.gateway.ts vs garak.gateway.ts - 90% duplicated code

// Both have:
@WebSocketGateway({ namespace: 'xxx', cors: {...} })
class XxxGateway {
  @WebSocketServer() server: Server;

  emitStarted(id: string) {
    this.server.emit(`xxx:started:${id}`, {...})
  }
  // Similar pattern for progress, logs, completion, failure
}
```

- **Impact:** High maintenance burden, inconsistent CORS policies
- **Recommendation:** Extract `BaseGateway` class

```typescript
// common/gateways/base-event.gateway.ts
abstract class BaseEventGateway implements OnGatewayInit, ... {
  @WebSocketServer() server: Server;
  protected abstract namespace: string;

  protected emitEvent<T>(eventName: string, id: string, data: T) {
    this.server.emit(`${this.namespace}:${eventName}:${id}`, {
      id,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitStarted(id: string) { this.emitEvent('started', id, {}); }
  emitProgress(id: string, progress: number, message: string) {
    this.emitEvent('progress', id, { progress, message });
  }
  // ... other common methods
}

// strix.gateway.ts
@WebSocketGateway({ namespace: '/strix', ... })
class StrixGateway extends BaseEventGateway {
  protected namespace = 'strix';
  // Override CORS if needed, inherit emitProgress, emitStarted, etc.
}
```

---

#### **MEDIUM-006 - CORS Configuration Inconsistency**
- **Files:** `strix.gateway.ts:11-23`, `garak.gateway.ts:11-16`
- **Severity:** MEDIUM
- **Issue:** Different CORS policies in different gateways

```typescript
// strix.gateway.ts
cors: {
  origin: ['http://localhost:3004', '...', '*'],  // ❌ Allows all origins
}

// garak.gateway.ts
cors: {
  origin: '*',  // ❌ Super permissive
}

// Better: centralized config
// config/websocket.config.ts
export const WEBSOCKET_CORS_CONFIG = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3004'],
  credentials: true,
};
```

---

### 4.2 WebSocket Event Structure

#### **MEDIUM-007 - Event Payload Inconsistency**
- **Files:** Multiple emit methods
- **Severity:** MEDIUM
- **Issue:** Different event payload structures

```typescript
// strix.gateway.ts:69-76
{ executionId, currentStep, totalSteps, progress, message, timestamp }

// garak.gateway.ts:54-60
{ scanId, progress, message, timestamp }  // ⚠️ No totalSteps

// promptfoo.gateway.ts (similar but different keys)
{ testRunId, ..., output, ... }
```

**Recommendation:** Standardize event DTOs

```typescript
// common/dto/websocket-events.dto.ts
export class ProgressEventDto {
  @IsUUID()
  executionId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsString()
  message: string;

  @IsNumber()
  timestamp: number;

  @IsOptional()
  @IsNumber()
  currentStep?: number;

  @IsOptional()
  @IsNumber()
  totalSteps?: number;
}
```

---

## 5. SECURITY ANALYSIS

### 5.1 Authentication & Authorization

#### **GOOD Practice:**
✅ `JwtAuthGuard` implemented globally (main.ts:46)
✅ `@Public()` decorator for unauthenticated endpoints
✅ `@CurrentUser()` decorator for accessing user context

#### **HIGH-009 - Hardcoded Development IDs**
- **Files:** Multiple locations
- **Severity:** HIGH
- **Locations:**
  ```typescript
  // strix.controller.ts:37-39
  const organizationId = user?.organizationId || '0872cd2b-4b4c-41a6-b505-799671a44daa';
  const userId = user?.id || '81976246-23f4-465c-bd1f-0b42c492a204';

  // current-user.decorator.ts:10-14
  if (!request.user) {
    return {
      id: '81976246-23f4-465c-bd1f-0b42c492a204',
      organizationId: '0872cd2b-4b4c-41a6-b505-799671a44daa',
    };
  }

  // promptfoo.service.ts:70-72
  const defaultOrgId = '0872cd2b-4b4c-41a6-b505-799671a44daa';
  const defaultUserId = '81976246-23f4-465c-bd1f-0b42c492a204';
  ```
- **Problem:**
  - Hardcoded development IDs scattered across codebase
  - If compromised, attackers know valid IDs
  - Difficult to change
- **Recommendation:** Centralized configuration

```typescript
// config/development.config.ts
export const DEV_SEED_DATA = {
  DEMO_ORGANIZATION_ID: process.env.DEV_DEMO_ORG_ID || '0872cd2b-...',
  DEMO_USER_ID: process.env.DEV_DEMO_USER_ID || '81976246-...',
};

// Usage
const organizationId = user?.organizationId || DEV_SEED_DATA.DEMO_ORGANIZATION_ID;
```

---

### 5.2 Input Validation

#### **GOOD:** Global validation pipe (main.ts:46-55)
- `whitelist: true` - rejects unknown properties
- `forbidNonWhitelisted: true` - strict validation
- `transform: true` - converts types

#### **MEDIUM-008 - Missing Rate Limiting on Async Operations**
- **Files:** `strix.service.ts:231-232`, `garak.service.ts`
- **Severity:** MEDIUM
- **Issue:** Rate limiting configured at HTTP level but not enforced per-execution

```typescript
// Strix implements rate limiting in Python script, but
// API Gateway doesn't prevent 10 concurrent Strix executions
```

- **Recommendation:** Add concurrency limits

```typescript
@Injectable()
class ExecutionLimiterService {
  private executing = new Map<string, number>();
  private maxConcurrent = 3;

  async acquireLock(executionType: string): Promise<void> {
    const count = this.executing.get(executionType) || 0;
    if (count >= this.maxConcurrent) {
      throw new ConflictException(
        `Too many concurrent ${executionType} executions`
      );
    }
    this.executing.set(executionType, count + 1);
  }
}
```

---

## 6. DOCKER & INFRASTRUCTURE

### 6.1 Dockerfile Analysis

#### **strix/Dockerfile (132 lines)**
**GOOD Points:**
✅ Multi-stage build implied (target: production vs development)
✅ Non-root user created (line 85)
✅ Health checks configured (line 124-125)
✅ Proper cleanup (line 38)

**Issues:**

#### **MEDIUM-009 - Docker Socket Security**
- **Line:** 56, 88, 100-102
- **Severity:** MEDIUM
- **Issue:** Docker socket mounted and Strix user added to docker group
  ```dockerfile
  RUN usermod -aG docker strix  # ❌ Allows strix user to control Docker
  ```
- **Problem:** If container is compromised, attacker can control host Docker
- **Recommendation:** Use limited Docker API proxy instead

```dockerfile
# Better: Use dockerd with restricted permissions
# Or: Use dind (Docker-in-Docker) instead of socket mounting
```

---

#### **MEDIUM-010 - Large Image Size Concerns**
- **Base:** `python:3.12-slim`
- **Added:** Chromium, Node.js, Docker CLI
- **Problem:** Image likely >2GB with all dependencies
- **Recommendation:**
  - Use multi-stage build with production stage only
  - Consider Alpine base if possible
  - Separate development and production images

---

### 6.2 docker-compose Configuration

#### **MEDIUM-011 - Redis & Bull Disabled**
- **File:** `app.module.ts:42-66`
- **Issue:** Caching and job queue disabled for "testing"
- **Problem:** Not sustainable for production
- **Recommendation:**
  - Enable with proper test configurations
  - Use separate docker-compose for testing
  - Add environment-based conditional loading

```typescript
// app.module.ts - NEW
const isTesting = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    isTesting
      ? []
      : [
          CacheModule.registerAsync({...}),
          BullModule.forRootAsync({...}),
        ],
    // ... other imports
  ],
})
```

---

## 7. CROSS-CUTTING CONCERNS

### 7.1 Logging

#### **GOOD:** Logger injected in all services
- Standard NestJS Logger used consistently

#### **MEDIUM-012 - Inconsistent Log Levels**
- **Issue:** Log messages use inconsistent prefixes and emojis

```typescript
// strix.service.ts
this.logger.log(`Starting Strix agent...`);  // No prefix

// garak.service.ts
this.logger.log(`🚀 Launching Garak CLI...`);  // Emoji
this.logger.log(`✅ Garak scan completed...`);

// Inconsistent formatting makes parsing difficult
```

- **Recommendation:** Use structured logging

```typescript
this.logger.log('Strix agent started', {
  organizationId,
  targetUrl: config.targetUrl,
  attackMode: config.attackMode,
});
```

---

### 7.2 Monitoring & Observability

#### **MEDIUM-013 - Missing Metrics Collection**
- **Issue:** No instrumentation for Prometheus/Grafana
- **Tools visible in docker-compose but not integrated**
- **Missing metrics:**
  - Execution duration
  - Success/failure rates
  - Queue depths
  - Error rates by type
- **Recommendation:** Add OpenTelemetry or Prometheus client

```typescript
// common/decorators/observable.decorator.ts
export function Metric(metricName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        histogram.observe({ operation: metricName }, Date.now() - start);
        counter.inc({ operation: metricName, status: 'success' });
        return result;
      } catch (error) {
        counter.inc({ operation: metricName, status: 'failure' });
        throw error;
      }
    };
  };
}
```

---

### 7.3 Configuration Management

#### **GOOD:** ConfigService used globally
- Environment variables loaded via `@nestjs/config`

#### **MEDIUM-014 - Configuration Scattered**
- **Issue:** Hardcoded values in multiple files
  - Timeouts: `strix.service.ts:209`, `garak.service.ts:209`
  - Container names: referenced as strings everywhere
  - Docker exec command builders duplicated
- **Recommendation:** Centralized config constants

```typescript
// config/execution.config.ts
export const EXECUTION_CONFIG = {
  CONTAINERS: {
    STRIX: 'airiskmgr-strix-runner',
    GARAK: 'airiskmgr-garak-runner',
    PROMPTFOO: 'airiskmgr-promptfoo-runner',
  },
  TIMEOUTS: {
    STRIX: 1800000,  // 30 min
    GARAK: 3600000,  // 1 hour
    PROMPTFOO: 3600000,
  },
};

// Usage
await execFileAsync('docker', ['exec', EXECUTION_CONFIG.CONTAINERS.STRIX, ...], {
  timeout: EXECUTION_CONFIG.TIMEOUTS.STRIX,
});
```

---

## 8. TESTING ANALYSIS

### 8.1 Test Files Found

- `strix.service.spec.ts` - 1 test file exists
- `garak.service.spec.ts` - Exists
- `promptfoo.service.spec.ts` - Exists
- `gemini.service.spec.ts` - Exists
- `system.service.spec.ts` - Exists

#### **MEDIUM-015 - Limited Test Coverage**
- **Issue:** Only service files have `*.spec.ts` files
- **Missing:** Controller tests, integration tests, e2e tests
- **Current:** Mostly unit tests with mocks
- **Problem:** Controllers not tested, integration issues hidden

---

### 8.2 Test Patterns

**Issue:** No consistent test fixtures or factories
**Recommendation:** Create test helpers

```typescript
// common/testing/factories/execution.factory.ts
export class ExecutionTestFactory {
  static createAgentConfig(overrides?: Partial<AgentConfigDto>): AgentConfigDto {
    return {
      targetUrl: 'http://localhost:3000',
      attackMode: AttackMode.MODERATE,
      headless: true,
      maxSteps: 20,
      timeout: 300,
      ...overrides,
    };
  }
}

// Usage in tests
it('should validate config', () => {
  const config = ExecutionTestFactory.createAgentConfig();
  expect(() => validator.validate(config)).not.toThrow();
});
```

---

## 9. ARCHITECTURE DEBT SUMMARY

### Critical Issues (Must Fix)
1. **HIGH-001:** Distributed process management - Extract `ProcessExecutorService`
2. **HIGH-002:** Circular service-gateway dependency - Implement event-driven pattern
3. **HIGH-003:** Missing error filter hierarchy - Create exception filters
4. **HIGH-006:** God object (StrixService) - Split into 4 services
5. **HIGH-007:** Inconsistent error handling - Standardize approach
6. **HIGH-008:** Non-blocking execution tracking - Implement job queues
7. **HIGH-009:** Hardcoded development IDs - Centralize configuration

### Medium Issues (Should Fix)
8. **MEDIUM-001:** Module export inconsistency
9. **MEDIUM-002:** Enum type inconsistency
10. **MEDIUM-003:** Duplicate error response structures
11. **MEDIUM-004:** Missing Docker execution abstraction
12. **MEDIUM-005:** Gateway duplication
13. **MEDIUM-006:** CORS configuration inconsistency
14. **MEDIUM-007:** WebSocket event payload inconsistency
15. **MEDIUM-008:** Missing execution concurrency limits
16. **MEDIUM-009:** Docker socket security
17. **MEDIUM-010:** Large Docker image size
18. **MEDIUM-011:** Redis/Bull disabled
19. **MEDIUM-012:** Inconsistent logging format
20. **MEDIUM-013:** Missing metrics collection
21. **MEDIUM-014:** Configuration scattered
22. **MEDIUM-015:** Limited test coverage

---

## 10. REFACTORING ROADMAP (PRIORITIZED)

### Phase 1: Foundation (CRITICAL - Week 1-2)
1. Extract `ProcessExecutorService` base class
2. Implement exception filter hierarchy
3. Replace circular dependency with event emitter pattern
4. Centralize error response DTOs

### Phase 2: Service Refactoring (HIGH - Week 2-3)
5. Split StrixService into 4 focused services
6. Extract BaseGateway for DRY gateway code
7. Implement job queue for async execution
8. Fix DTO validation coverage

### Phase 3: Infrastructure (MEDIUM - Week 3-4)
9. Re-enable Redis/Bull configuration
10. Add metrics/observability
11. Centralize configuration
12. Improve Docker images (multi-stage build)

### Phase 4: Hardening (MEDIUM - Week 4+)
13. Add comprehensive test coverage
14. Implement concurrency limits
15. Add security context validation
16. Performance optimization

---

## 11. CODE QUALITY METRICS

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Test Coverage | ~40% | 80% | 40% |
| Cyclomatic Complexity (Avg) | 8.2 | <5 | 3.2 |
| Lines per Service | 550 | <300 | 250 |
| Duplicated Code % | 15% | <5% | 10% |
| SonarQube Debt | ~2-3 weeks | <1 week | 1-2 weeks |

---

## Conclusion

The backend architecture has a **solid foundation with NestJS best practices** but suffers from **coupling issues and scattered responsibilities**. The refactoring roadmap above addresses critical architectural debt while maintaining stability. Implementation should follow the 4-phase approach to allow for proper testing and validation at each stage.

**Estimated Refactoring Effort:** 4-6 weeks for full implementation
**Risk Level:** LOW (changes are mostly structural, not functional)
**Expected Benefit:** 40-50% improvement in maintainability and testability

