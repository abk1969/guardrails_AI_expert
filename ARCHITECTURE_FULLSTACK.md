# Architecture Full Stack - AI RISK MANAGER
## Proposition d'Architecture Moderne, Sécurisée et Maintenable

---

## Table des Matières

1. [Vision Architecturale](#vision-architecturale)
2. [Stack Technologique Recommandée](#stack-technologique-recommandée)
3. [Architecture en Couches](#architecture-en-couches)
4. [Design Patterns et Principes](#design-patterns-et-principes)
5. [Sécurité et Conformité](#sécurité-et-conformité)
6. [Modularité et Scalabilité](#modularité-et-scalabilité)
7. [Plan de Migration](#plan-de-migration)

---

## Vision Architecturale

### Philosophie de Design

L'architecture proposée suit les principes **SOLID**, **Clean Architecture**, et **Domain-Driven Design (DDD)** pour créer une application:

- **Découplée**: Séparation claire entre frontend, backend, et infrastructure
- **Testable**: Chaque couche peut être testée indépendamment
- **Évolutive**: Facilité d'ajout de nouvelles fonctionnalités sans refactoring massif
- **Sécurisée**: Security by design à tous les niveaux
- **Maintenable**: Code lisible, documenté, avec des responsabilités claires

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Presentation │  │   Feature    │  │   Shared/Common    │   │
│  │     Layer     │  │   Modules    │  │    Components      │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│         │                  │                    │               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Application State (Zustand/TanStack)       │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                        │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              API Client Layer (React Query)          │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST/GraphQL over HTTPS
                         │ WebSocket (temps réel)
┌────────────────────────┴────────────────────────────────────────┐
│                    API GATEWAY (NestJS/Fastify)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ Auth/AuthZ   │  │  Rate Limit  │  │   Validation     │     │
│  │ Middleware   │  │   Throttle   │  │   Sanitization   │     │
│  └──────────────┘  └──────────────┘  └──────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    BACKEND SERVICES (Microservices)             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Test Execution   │  │  Risk Management │  │ AI Services  │ │
│  │    Service       │  │     Service      │  │   Proxy      │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Reporting      │  │   Compliance     │  │   Audit      │ │
│  │    Service       │  │    Service       │  │   Service    │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   PostgreSQL     │  │      Redis       │  │   MongoDB    │ │
│  │  (Relationnelle) │  │     (Cache)      │  │  (Documents) │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   S3/MinIO       │  │   Elasticsearch  │                   │
│  │ (Stockage Objet) │  │    (Recherche)   │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Technologique Recommandée

### Frontend

#### Framework & Bibliothèques Core
- **React 19** avec **TypeScript 5.8+**
- **Vite** (déjà en place) pour le build ultra-rapide
- **React Router v6** pour le routing (remplacer la navigation sidebar actuelle)

#### Gestion d'État Moderne
**Recommandation: Migration de Context API vers architecture hybride**

```typescript
// Solution 1: Zustand (Simple, performant, peu verbeux)
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface TestRunStore {
  isRunning: boolean
  results: TestResult[]
  startTest: (config: TestConfiguration) => Promise<void>
  resetTest: () => void
}

export const useTestRunStore = create<TestRunStore>()(
  devtools(
    persist(
      (set, get) => ({
        isRunning: false,
        results: [],
        startTest: async (config) => {
          set({ isRunning: true })
          // Business logic
        },
        resetTest: () => set({ isRunning: false, results: [] })
      }),
      { name: 'test-run-storage' }
    )
  )
)

// Solution 2: TanStack Query (pour données serveur)
import { useQuery, useMutation } from '@tanstack/react-query'

export const useTestRun = (runId: string) => {
  return useQuery({
    queryKey: ['test-run', runId],
    queryFn: () => apiClient.getTestRun(runId),
    staleTime: 5000,
  })
}
```

**Avantages vs Context API actuel:**
- ✅ Performance: Pas de re-render cascade
- ✅ DevTools intégrés pour debugging
- ✅ Middleware (persist, logger) out-of-the-box
- ✅ TypeScript first-class support
- ✅ Moins de boilerplate (pas de Provider hell dans App.tsx)

#### UI & Styling
- **Tailwind CSS** (déjà en place) ✅
- **Shadcn/ui** ou **Radix UI** pour composants accessibles (remplacer `/components/ui/`)
- **Framer Motion** pour animations avancées (remplacer animations CSS custom)
- **React Hook Form + Zod** pour validation formulaires

#### Data Fetching
- **TanStack Query (React Query)** pour:
  - Cache automatique
  - Synchronisation serveur
  - Optimistic updates
  - Retry logic
  - Pagination/infinite scroll

#### Testing
```bash
# Stack de tests complète
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D @playwright/test  # E2E tests
npm install -D msw  # Mock Service Worker pour API mocking
```

### Backend

#### Framework Principal: **NestJS**

**Pourquoi NestJS?**
- Architecture modulaire native
- Dependency Injection puissante
- TypeScript natif (partage de types avec frontend)
- Écosystème riche (GraphQL, WebSocket, Microservices)
- Documentation exhaustive

**Structure Backend Recommandée:**

```
backend/
├── apps/                           # Microservices
│   ├── api-gateway/                # Point d'entrée unique
│   ├── test-execution-service/     # Exécution tests guardrails
│   ├── risk-management-service/    # Gestion risques IA
│   └── ai-proxy-service/           # Proxy sécurisé vers LLMs
├── libs/                           # Bibliothèques partagées
│   ├── common/                     # DTOs, interfaces, constants
│   ├── database/                   # Entities, repositories
│   ├── auth/                       # JWT, RBAC, guards
│   └── telemetry/                  # Logging, metrics, tracing
├── prisma/                         # ORM (voir section Database)
└── docker/                         # Conteneurisation
```

#### API Design

**Option A: REST (Recommandé pour MVP)**
```typescript
// Exemple: Module Test Execution
@Module({
  imports: [
    TestModule,
    GuardrailModule,
    QueueModule.registerQueue({ name: 'test-execution' }),
  ],
  controllers: [TestExecutionController],
  providers: [TestExecutionService, TestRunnerStrategy],
})
export class TestExecutionModule {}

@Controller('api/v1/tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestExecutionController {

  @Post('run')
  @Roles('tester', 'admin')
  async runTest(@Body() dto: CreateTestRunDto, @CurrentUser() user: User) {
    return this.testService.executeTest(dto, user.id)
  }

  @Get('runs/:id/results')
  @ApiResponse({ type: TestResultsDto })
  async getResults(@Param('id') id: string) {
    return this.testService.getResults(id)
  }

  @Get('runs/:id/stream')
  @Sse()  // Server-Sent Events pour temps réel
  streamResults(@Param('id') id: string): Observable<MessageEvent> {
    return this.testService.streamResults(id)
  }
}
```

**Option B: GraphQL (Recommandé pour évolution future)**
```typescript
// Schema GraphQL avec code-first approach
@ObjectType()
export class TestRun {
  @Field(() => ID)
  id: string

  @Field()
  status: TestStatus

  @Field(() => [TestResult])
  results: TestResult[]

  @Field(() => TestConfiguration)
  configuration: TestConfiguration
}

@Resolver(() => TestRun)
export class TestRunResolver {

  @Query(() => TestRun)
  async testRun(@Args('id') id: string) {
    return this.testService.findOne(id)
  }

  @Mutation(() => TestRun)
  async startTest(@Args('input') input: StartTestInput) {
    return this.testService.start(input)
  }

  @Subscription(() => TestResult)
  testResultAdded(@Args('runId') runId: string) {
    return this.pubSub.asyncIterator(`testResult.${runId}`)
  }
}
```

#### Base de Données

**Prisma ORM (Recommandation forte)**

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Domain Models
model Organization {
  id        String   @id @default(uuid())
  name      String
  users     User[]
  testRuns  TestRun[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id             String   @id @default(uuid())
  email          String   @unique
  passwordHash   String
  role           Role     @default(TESTER)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  testRuns       TestRun[]
  createdAt      DateTime @default(now())
}

model TestRun {
  id              String            @id @default(uuid())
  status          TestRunStatus     @default(PENDING)
  configuration   Json              // TestConfiguration serialized
  userId          String
  user            User              @relation(fields: [userId], references: [id])
  organizationId  String
  organization    Organization      @relation(fields: [organizationId], references: [id])
  results         TestResult[]
  startedAt       DateTime          @default(now())
  completedAt     DateTime?

  @@index([userId, status])
  @@index([organizationId, startedAt])
}

model TestResult {
  id              String       @id @default(uuid())
  testRunId       String
  testRun         TestRun      @relation(fields: [testRunId], references: [id], onDelete: Cascade)
  promptText      String       @db.Text
  response        String?      @db.Text
  score           Float
  status          TestStatus
  evaluationChain Json         // EvaluationStep[]
  remediation     String?      @db.Text
  createdAt       DateTime     @default(now())

  @@index([testRunId, status])
}

model AIPolicy {
  id           String            @id @default(uuid())
  reference    String            @unique
  ruleText     String            @db.Text
  status       PolicyRuleStatus  @default(NOT_IMPLEMENTED)
  notes        String?           @db.Text
  organizationId String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

enum Role {
  ADMIN
  SECURITY_OFFICER
  TESTER
  VIEWER
}

enum TestRunStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum TestStatus {
  PENDING
  RUNNING
  PASSED
  FAILED
}

enum PolicyRuleStatus {
  NOT_IMPLEMENTED
  IN_PROGRESS
  IMPLEMENTED
  NOT_APPLICABLE
}
```

**Migrations et Seeding:**
```bash
# Créer migration
npx prisma migrate dev --name init

# Générer client TypeScript
npx prisma generate

# Seed initial data
npx prisma db seed
```

#### Cache & Performance

**Redis pour:**
- Session storage (alternative à JWT si besoin)
- Rate limiting
- Cache des résultats de tests
- Queue de jobs (BullMQ)

```typescript
// Configuration Redis
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 3600, // 1 hour default
    }),
  ],
})
export class AppModule {}

// Utilisation
@Injectable()
export class TestService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getResults(runId: string): Promise<TestResult[]> {
    const cached = await this.cache.get(`results:${runId}`)
    if (cached) return cached

    const results = await this.prisma.testResult.findMany({
      where: { testRunId: runId }
    })

    await this.cache.set(`results:${runId}`, results, 3600)
    return results
  }
}
```

#### Queue System (Traitement Asynchrone)

**BullMQ pour l'exécution des tests:**

```typescript
// test-execution.processor.ts
@Processor('test-execution')
export class TestExecutionProcessor {

  @Process('run-test')
  async handleTestExecution(job: Job<TestExecutionJob>) {
    const { runId, configuration, prompts } = job.data

    for (const [index, prompt] of prompts.entries()) {
      // Exécution réelle du test (remplace mockTestRunner)
      const result = await this.executePromptTest(prompt, configuration)

      // Sauvegarde progressive
      await this.prisma.testResult.create({ data: result })

      // Mise à jour progression
      await job.updateProgress((index + 1) / prompts.length * 100)

      // Emission temps réel via WebSocket
      this.eventGateway.emitTestResult(runId, result)
    }

    await this.prisma.testRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    })
  }
}
```

### Infrastructure & DevOps

#### Conteneurisation (Docker)

```dockerfile
# frontend/Dockerfile (Multi-stage build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

#### Docker Compose (Développement Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api-gateway
    environment:
      - VITE_API_URL=http://localhost:3001

  api-gateway:
    build: ./backend/apps/api-gateway
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/airiskmgr
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}

  test-execution-service:
    build: ./backend/apps/test-execution-service
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/airiskmgr
      - REDIS_HOST=redis

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=airiskmgr
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"

volumes:
  postgres_data:
  redis_data:
```

---

## Design Patterns et Principes

### 1. Clean Architecture (Hexagonal)

```typescript
// Domain Layer (core business logic, no dependencies)
// domain/entities/test-run.entity.ts
export class TestRun {
  constructor(
    public readonly id: string,
    public configuration: TestConfiguration,
    private _status: TestRunStatus,
    private _results: TestResult[] = []
  ) {}

  addResult(result: TestResult): void {
    if (this._status !== TestRunStatus.RUNNING) {
      throw new Error('Cannot add results to non-running test')
    }
    this._results.push(result)
  }

  complete(): void {
    if (this._results.length === 0) {
      throw new Error('Cannot complete test with no results')
    }
    this._status = TestRunStatus.COMPLETED
  }

  get status(): TestRunStatus {
    return this._status
  }

  get results(): readonly TestResult[] {
    return this._results
  }

  get score(): number {
    if (this._results.length === 0) return 0
    return this._results.reduce((sum, r) => sum + r.score, 0) / this._results.length
  }
}

// Application Layer (use cases)
// application/use-cases/start-test.use-case.ts
export class StartTestUseCase {
  constructor(
    private testRunRepository: ITestRunRepository,
    private promptGenerator: IPromptGenerator,
    private testExecutor: ITestExecutor,
    private eventBus: IEventBus
  ) {}

  async execute(command: StartTestCommand): Promise<TestRun> {
    // Validation
    if (command.configuration.volume <= 0) {
      throw new ValidationError('Volume must be positive')
    }

    // Generate prompts
    const prompts = await this.promptGenerator.generate(
      command.configuration.categories,
      command.configuration.volume
    )

    // Create test run entity
    const testRun = new TestRun(
      uuidv4(),
      command.configuration,
      TestRunStatus.PENDING
    )

    // Persist
    await this.testRunRepository.save(testRun)

    // Emit event for async processing
    await this.eventBus.publish(new TestRunStartedEvent(testRun.id, prompts))

    return testRun
  }
}

// Infrastructure Layer (adapters)
// infrastructure/repositories/test-run.repository.ts
@Injectable()
export class TestRunRepository implements ITestRunRepository {
  constructor(private prisma: PrismaService) {}

  async save(testRun: TestRun): Promise<void> {
    await this.prisma.testRun.create({
      data: {
        id: testRun.id,
        configuration: testRun.configuration as any,
        status: testRun.status,
        userId: testRun.userId,
      }
    })
  }

  async findById(id: string): Promise<TestRun | null> {
    const data = await this.prisma.testRun.findUnique({
      where: { id },
      include: { results: true }
    })
    if (!data) return null

    return this.toDomain(data)
  }

  private toDomain(raw: any): TestRun {
    // Map persistence model to domain entity
    return new TestRun(
      raw.id,
      raw.configuration,
      raw.status,
      raw.results.map(this.resultToDomain)
    )
  }
}
```

### 2. CQRS (Command Query Responsibility Segregation)

```typescript
// Commands (write operations)
export class CreateTestRunCommand {
  constructor(
    public readonly configuration: TestConfiguration,
    public readonly userId: string
  ) {}
}

@CommandHandler(CreateTestRunCommand)
export class CreateTestRunHandler implements ICommandHandler<CreateTestRunCommand> {
  async execute(command: CreateTestRunCommand): Promise<string> {
    // Business logic for creating test run
    const testRun = await this.testService.create(command)
    return testRun.id
  }
}

// Queries (read operations)
export class GetTestRunQuery {
  constructor(public readonly runId: string) {}
}

@QueryHandler(GetTestRunQuery)
export class GetTestRunHandler implements IQueryHandler<GetTestRunQuery> {
  async execute(query: GetTestRunQuery): Promise<TestRunDto> {
    // Optimized read from read model (could be different DB)
    return this.testReadRepository.getById(query.runId)
  }
}

// Usage in controller
@Post('runs')
async createTestRun(@Body() dto: CreateTestRunDto) {
  const runId = await this.commandBus.execute(
    new CreateTestRunCommand(dto.configuration, dto.userId)
  )
  return { id: runId }
}

@Get('runs/:id')
async getTestRun(@Param('id') id: string) {
  return this.queryBus.execute(new GetTestRunQuery(id))
}
```

### 3. Event Sourcing (Pour Audit Trail)

```typescript
// Event Store pour traçabilité complète
interface DomainEvent {
  aggregateId: string
  eventType: string
  payload: any
  timestamp: Date
  userId: string
}

@Injectable()
export class EventStore {
  constructor(private prisma: PrismaService) {}

  async append(event: DomainEvent): Promise<void> {
    await this.prisma.event.create({
      data: {
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        timestamp: event.timestamp,
        userId: event.userId
      }
    })
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.prisma.event.findMany({
      where: { aggregateId },
      orderBy: { timestamp: 'asc' }
    })
  }

  async replay(aggregateId: string): Promise<TestRun> {
    const events = await this.getEvents(aggregateId)
    let testRun: TestRun

    for (const event of events) {
      switch (event.eventType) {
        case 'TestRunCreated':
          testRun = new TestRun(event.payload)
          break
        case 'ResultAdded':
          testRun.addResult(event.payload)
          break
        case 'TestRunCompleted':
          testRun.complete()
          break
      }
    }

    return testRun
  }
}
```

### 4. Strategy Pattern (pour exécution multi-LLM)

```typescript
// Abstraction
interface IGuardrailTester {
  test(prompt: TestPrompt, config: TestConfiguration): Promise<TestResult>
}

// Implémentations concrètes
@Injectable()
export class OpenAIGuardrailTester implements IGuardrailTester {
  async test(prompt: TestPrompt, config: TestConfiguration): Promise<TestResult> {
    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt.text }]
    })
    return this.evaluateResponse(response, prompt, config)
  }
}

@Injectable()
export class GeminiGuardrailTester implements IGuardrailTester {
  async test(prompt: TestPrompt, config: TestConfiguration): Promise<TestResult> {
    const response = await this.geminiClient.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt.text
    })
    return this.evaluateResponse(response, prompt, config)
  }
}

@Injectable()
export class CustomEndpointTester implements IGuardrailTester {
  async test(prompt: TestPrompt, config: TestConfiguration): Promise<TestResult> {
    const body = config.target.apiBodyTemplate.replace('{{prompt}}', prompt.text)
    const response = await axios.post(config.target.apiUrl, JSON.parse(body), {
      headers: config.target.apiHeaders
    })
    return this.extractAndEvaluate(response, prompt, config)
  }
}

// Factory pour sélection
@Injectable()
export class GuardrailTesterFactory {
  constructor(
    private openaiTester: OpenAIGuardrailTester,
    private geminiTester: GeminiGuardrailTester,
    private customTester: CustomEndpointTester
  ) {}

  getTester(componentType: AIComponentType): IGuardrailTester {
    switch (componentType) {
      case AIComponentType.FOUNDATION_MODEL:
        return this.openaiTester
      case AIComponentType.RAG_SYSTEM:
        return this.geminiTester
      default:
        return this.customTester
    }
  }
}
```

---

## Sécurité et Conformité

### 1. Authentication & Authorization

**JWT avec Refresh Tokens:**

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private prisma: PrismaService
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password)
    if (!user) throw new UnauthorizedException()

    const tokens = await this.generateTokens(user)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' })
    ])

    return { accessToken, refreshToken }
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken)
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, token: refreshToken, revoked: false }
    })

    if (!storedToken) throw new UnauthorizedException()

    const user = await this.usersService.findById(payload.sub)
    return this.generateTokens(user)
  }
}

// Guards
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler())
    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.role)
  }
}

// Usage
@Controller('api/v1/tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  @Post()
  @Roles(Role.TESTER, Role.ADMIN)
  create(@Body() dto: CreateTestDto, @CurrentUser() user: User) {
    return this.testService.create(dto, user)
  }
}
```

### 2. Data Encryption

```typescript
// Encryption at rest (Prisma middleware)
prisma.$use(async (params, next) => {
  if (params.model === 'TestTarget' && params.action === 'create') {
    if (params.args.data.apiHeaders) {
      params.args.data.apiHeaders = await encryptObject(params.args.data.apiHeaders)
    }
  }

  if (params.model === 'TestTarget' && params.action === 'findUnique') {
    const result = await next(params)
    if (result?.apiHeaders) {
      result.apiHeaders = await decryptObject(result.apiHeaders)
    }
    return result
  }

  return next(params)
})

// Encryption utilities
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

export class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private keyLength = 32

  private getKey(): Buffer {
    return scryptSync(process.env.ENCRYPTION_KEY, 'salt', this.keyLength)
  }

  encrypt(text: string): string {
    const iv = randomBytes(16)
    const key = this.getKey()
    const cipher = createCipheriv(this.algorithm, key, iv)

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ])

    const authTag = cipher.getAuthTag()

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex')
    })
  }

  decrypt(encryptedData: string): string {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData)
    const key = this.getKey()

    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final()
    ])

    return decrypted.toString('utf8')
  }
}
```

### 3. Input Validation & Sanitization

```typescript
// DTOs avec class-validator
import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateTestRunDto {
  @IsEnum(GuardrailCategory, { each: true })
  @ArrayNotEmpty()
  categories: GuardrailCategory[]

  @IsNumber()
  @Min(1)
  @Max(1000)
  volume: number

  @IsEnum(PromptComplexity, { each: true })
  @ArrayNotEmpty()
  complexities: PromptComplexity[]

  @ValidateNested()
  @Type(() => TestTargetDto)
  target: TestTargetDto
}

export class TestTargetDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsUrl()
  apiUrl: string

  @IsEnum(AIComponentType)
  componentType: AIComponentType

  @IsObject()
  @ValidateNested()
  apiHeaders: Record<string, string>

  @IsString()
  @IsNotEmpty()
  @Matches(/.*\{\{prompt\}\}.*/, { message: 'Body template must contain {{prompt}} placeholder' })
  apiBodyTemplate: string
}

// Global validation pipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Strip non-whitelisted properties
  forbidNonWhitelisted: true,  // Throw error if non-whitelisted
  transform: true,        // Auto-transform to DTO instances
  transformOptions: {
    enableImplicitConversion: true
  }
}))
```

### 4. Rate Limiting & DDoS Protection

```typescript
// Throttler module
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 10,   // 10 requests per minute
    }]),
  ],
})

// Custom rate limiter per endpoint
@Controller('api/v1/tests')
@UseGuards(ThrottlerGuard)
export class TestController {

  @Post('run')
  @Throttle({ default: { limit: 3, ttl: 60000 } })  // 3 tests per minute
  async runTest(@Body() dto: CreateTestRunDto) {
    return this.testService.run(dto)
  }
}

// Redis-based distributed rate limiting
@Injectable()
export class RedisThrottlerGuard extends ThrottlerGuard {
  async getTracker(req: Request): Promise<string> {
    return req.user?.id || req.ip  // Track per user or IP
  }

  async handleRequest(context: ExecutionContext, limit: number, ttl: number) {
    const tracker = await this.getTracker(context.switchToHttp().getRequest())
    const key = `throttle:${tracker}`

    const current = await this.redis.incr(key)
    if (current === 1) {
      await this.redis.expire(key, ttl / 1000)
    }

    if (current > limit) {
      throw new ThrottlerException()
    }

    return true
  }
}
```

### 5. GDPR Compliance

```typescript
// Data retention policies
@Injectable()
export class DataRetentionService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 0 * * *')  // Daily at midnight
  async cleanupOldData() {
    const retentionDays = 90
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // Soft delete old test runs
    await this.prisma.testRun.updateMany({
      where: {
        completedAt: { lt: cutoffDate },
        deletedAt: null
      },
      data: { deletedAt: new Date() }
    })
  }

  // Right to be forgotten
  async deleteUserData(userId: string) {
    await this.prisma.$transaction([
      // Anonymize test runs
      this.prisma.testRun.updateMany({
        where: { userId },
        data: { userId: 'ANONYMIZED' }
      }),
      // Delete PII
      this.prisma.user.delete({ where: { id: userId } })
    ])
  }

  // Data export
  async exportUserData(userId: string): Promise<any> {
    const [user, testRuns, policies] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.testRun.findMany({
        where: { userId },
        include: { results: true }
      }),
      this.prisma.aiPolicy.findMany({
        where: { organizationId: user.organizationId }
      })
    ])

    return {
      personalData: user,
      testHistory: testRuns,
      policies: policies
    }
  }
}
```

### 6. Audit Logging

```typescript
// Audit interceptor
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, user, body, ip } = request

    const auditLog = {
      userId: user?.id,
      action: `${method} ${url}`,
      payload: this.sanitizePayload(body),
      ipAddress: ip,
      timestamp: new Date()
    }

    return next.handle().pipe(
      tap(response => {
        this.auditService.log({ ...auditLog, status: 'SUCCESS', response })
      }),
      catchError(error => {
        this.auditService.log({ ...auditLog, status: 'FAILURE', error: error.message })
        throw error
      })
    )
  }

  private sanitizePayload(payload: any): any {
    // Remove sensitive fields
    const sanitized = { ...payload }
    delete sanitized.password
    delete sanitized.apiKey
    return sanitized
  }
}
```

---

## Modularité et Scalabilité

### 1. Architecture Microservices

**Services indépendants:**

```
services/
├── api-gateway/           # Reverse proxy, auth, routing
├── test-execution/        # Test guardrails execution
├── risk-management/       # Risk assessment & scoring
├── policy-management/     # AI policy CRUD
├── reporting/             # PDF generation, exports
├── ai-proxy/              # Proxy sécurisé vers LLMs externes
└── notification/          # Emails, webhooks, alerts
```

**Communication inter-services:**

```typescript
// Event-driven avec RabbitMQ/NATS
@Injectable()
export class TestExecutionService {
  constructor(
    @Inject('NATS_CLIENT') private natsClient: ClientProxy
  ) {}

  async completeTest(runId: string) {
    // Emit event
    await this.natsClient.emit('test.completed', {
      runId,
      timestamp: new Date()
    })
  }
}

// Listener dans Reporting Service
@Controller()
export class ReportingController {
  @EventPattern('test.completed')
  async handleTestCompleted(data: { runId: string }) {
    await this.generateReport(data.runId)
  }
}
```

### 2. Feature Flags

```typescript
// Configuration dynamique sans redéploiement
@Injectable()
export class FeatureFlagService {
  constructor(
    private configService: ConfigService,
    private redisClient: Redis
  ) {}

  async isEnabled(feature: string, userId?: string): Promise<boolean> {
    // Check user-specific override
    if (userId) {
      const userOverride = await this.redisClient.get(`feature:${feature}:user:${userId}`)
      if (userOverride !== null) return userOverride === 'true'
    }

    // Check global flag
    const globalFlag = await this.redisClient.get(`feature:${feature}`)
    if (globalFlag !== null) return globalFlag === 'true'

    // Fallback to env config
    return this.configService.get<boolean>(`features.${feature}`, false)
  }
}

// Usage
@Controller('api/v1/tests')
export class TestController {
  @Post('run')
  async runTest(@Body() dto: CreateTestRunDto, @CurrentUser() user: User) {
    const useRealExecution = await this.featureFlags.isEnabled('REAL_TEST_EXECUTION', user.id)

    if (useRealExecution) {
      return this.realTestService.execute(dto)
    } else {
      return this.mockTestService.execute(dto)
    }
  }
}
```

### 3. Multi-Tenancy

```typescript
// Tenant isolation au niveau DB
@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string): Promise<TestRun[]> {
    return this.prisma.testRun.findMany({
      where: { organizationId }
    })
  }
}

// Tenant middleware
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as User
    if (user) {
      req['tenantId'] = user.organizationId
    }
    next()
  }
}

// Row-Level Security (PostgreSQL)
-- Enable RLS
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their org's data
CREATE POLICY tenant_isolation ON test_runs
  USING (organization_id = current_setting('app.current_tenant')::uuid);

-- Set tenant context in Prisma
await prisma.$executeRaw`SET app.current_tenant = ${tenantId}`
```

---

## Plan de Migration

### Phase 1: Fondations Backend (Semaines 1-3)

**Semaine 1:**
- ✅ Setup projet NestJS monorepo
- ✅ Configuration Prisma + PostgreSQL
- ✅ Module Auth (JWT, guards)
- ✅ CI/CD pipeline (GitHub Actions)

**Semaine 2:**
- ✅ Migration des types TypeScript partagés
- ✅ API Gateway avec validation
- ✅ Module Test Execution (version simple)
- ✅ Tests unitaires (Vitest)

**Semaine 3:**
- ✅ Integration avec Gemini API
- ✅ Queue system (BullMQ)
- ✅ WebSocket pour temps réel
- ✅ Docker Compose pour dev local

### Phase 2: Migration Frontend (Semaines 4-6)

**Semaine 4:**
- ✅ Refactor state management (Context → Zustand)
- ✅ Setup TanStack Query
- ✅ Migration Dashboard + TestConfiguration

**Semaine 5:**
- ✅ Migration Analytics + Reporting
- ✅ Migration modules Risk Management
- ✅ Amélioration UX avec Shadcn/ui

**Semaine 6:**
- ✅ Migration modules restants
- ✅ Tests E2E (Playwright)
- ✅ Performance optimization

### Phase 3: Features Avancées (Semaines 7-9)

**Semaine 7:**
- ✅ Exécution réelle des tests (vs simulation)
- ✅ Multi-provider LLM support
- ✅ Advanced reporting (PDF export)

**Semaine 8:**
- ✅ Multi-tenancy
- ✅ RBAC granulaire
- ✅ Audit trail complet

**Semaine 9:**
- ✅ Feature flags
- ✅ Monitoring (Prometheus + Grafana)
- ✅ Documentation (Swagger/OpenAPI)

### Phase 4: Production (Semaines 10-12)

**Semaine 10:**
- ✅ Security hardening
- ✅ Load testing
- ✅ Backup & disaster recovery

**Semaine 11:**
- ✅ Deployment infrastructure (Kubernetes)
- ✅ Observability (logs, metrics, traces)
- ✅ Staging environment

**Semaine 12:**
- ✅ Production deployment
- ✅ User training & documentation
- ✅ Post-launch monitoring

---

## Annexes

### A. Structure de Projet Recommandée

```
ai-risk-manager/
├── frontend/
│   ├── src/
│   │   ├── app/                    # App shell
│   │   ├── features/               # Feature modules
│   │   │   ├── test-execution/
│   │   │   ├── risk-management/
│   │   │   ├── analytics/
│   │   │   └── policy-management/
│   │   ├── shared/                 # Shared code
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── store/                  # Global state
│   │   └── api/                    # API client
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   └── package.json
│
├── backend/
│   ├── apps/
│   │   ├── api-gateway/
│   │   ├── test-execution-service/
│   │   ├── risk-management-service/
│   │   └── ai-proxy-service/
│   ├── libs/
│   │   ├── common/
│   │   ├── database/
│   │   ├── auth/
│   │   └── telemetry/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── package.json
│
├── shared/                         # Shared between FE/BE
│   └── types/
│       ├── dtos/
│       └── enums/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── monitoring/
│
├── docs/
│   ├── api/                        # API documentation
│   ├── architecture/               # Architecture diagrams
│   └── user-guides/
│
├── docker-compose.yml
├── package.json                    # Root workspace
└── README.md
```

### B. Scripts NPM Utiles

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run start:dev",

    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",

    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "test:e2e": "cd frontend && npm run test:e2e",

    "lint": "npm run lint:frontend && npm run lint:backend",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",

    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:studio": "cd backend && npx prisma studio"
  }
}
```

### C. Variables d'Environnement

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/airiskmgr"
DATABASE_POOL_SIZE=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Encryption
ENCRYPTION_KEY=32-char-encryption-key-here

# External APIs
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# CORS
CORS_ORIGIN=http://localhost:3000

# Application
NODE_ENV=development
PORT=3001
```

---

## Conclusion

Cette architecture full stack propose une **transformation progressive** de l'application actuelle vers une solution **enterprise-grade** tout en préservant:

✅ **La confidentialité**: Encryption, isolation tenant, GDPR compliance
✅ **La sécurité**: Auth robuste, validation, rate limiting, audit
✅ **La performance**: Cache, queue, optimistic updates
✅ **La maintenabilité**: Clean architecture, tests, documentation
✅ **La scalabilité**: Microservices, horizontal scaling

Le plan de migration de 12 semaines permet une transition **sans rupture** avec livraisons incrémentales.

**Prochaines étapes recommandées:**
1. Valider l'approche avec les stakeholders
2. Setup environnement de dev (Phase 1, Semaine 1)
3. Démarrer migration backend en parallèle du frontend actuel
4. Tests continus et feedback loops
