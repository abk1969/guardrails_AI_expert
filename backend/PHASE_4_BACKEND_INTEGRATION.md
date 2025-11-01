# Phase 4: Intégration Backend - Plan d'Implémentation Détaillé

## Vue d'Ensemble

La **Phase 4** transforme l'application AI Risk Manager en solution multi-utilisateurs avec persistance complète des tests et résultats via le backend NestJS + PostgreSQL.

## Architecture

```
Frontend (React)
     ↓ HTTP REST / WebSocket
Backend NestJS (api-gateway)
     ↓ Prisma ORM
PostgreSQL Database
```

---

## 1. Structure du Module Tests

### Arborescence

```
backend/apps/api-gateway/src/
└── tests/
    ├── tests.module.ts
    ├── tests.controller.ts
    ├── tests.service.ts
    ├── tests.gateway.ts (WebSocket)
    └── dto/
        ├── create-test-run.dto.ts
        ├── update-test-run.dto.ts
        ├── test-run-response.dto.ts
        ├── test-result.dto.ts
        └── query-tests.dto.ts
```

---

## 2. DTOs (Data Transfer Objects)

### `dto/create-test-run.dto.ts`

```typescript
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum GuardrailCategory {
  SECURITY_PRIVACY = 'Sécurité et Confidentialité',
  RELEVANCE_RESPONSE = 'Pertinence et Justesse',
  LINGUISTIC_QUALITY = 'Qualité de Sortie',
  CONTENT_VALIDATION = 'Contenu Nuisible',
  LOGICAL_VALIDATION = 'Logique et Cohérence',
}

enum PromptComplexity {
  SIMPLE = 'Simple',
  MOYEN = 'Moyen',
  SOPHISTIQUE = 'Sophistiqué',
}

enum Sensitivity {
  TOLERANT = 'Tolérant',
  NORMAL = 'Normal',
  STRICT = 'Strict',
}

export class CreateTestRunDto {
  @ApiProperty({ enum: GuardrailCategory, isArray: true })
  @IsArray()
  @IsEnum(GuardrailCategory, { each: true })
  categories: GuardrailCategory[];

  @ApiProperty()
  @IsString()
  targetId: string; // ID de la cible de test (TestTarget)

  @ApiProperty({ minimum: 10, maximum: 1000 })
  @IsNumber()
  @Min(10)
  @Max(1000)
  volume: number;

  @ApiProperty({ enum: PromptComplexity, isArray: true })
  @IsArray()
  @IsEnum(PromptComplexity, { each: true })
  complexities: PromptComplexity[];

  @ApiProperty({ required: false })
  @IsOptional()
  categorySensitivities?: Record<GuardrailCategory, Sensitivity>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customPlugins?: string[];

  @ApiProperty({ enum: ['simulation', 'real'], default: 'simulation' })
  @IsEnum(['simulation', 'real'])
  @IsOptional()
  testMode?: 'simulation' | 'real';
}
```

### `dto/test-run-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class TestRunResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  totalTests: number;

  @ApiProperty()
  passedTests: number;

  @ApiProperty()
  failedTests: number;

  @ApiProperty()
  blockedTests: number;

  @ApiProperty()
  configuration: any;

  @ApiProperty()
  targetId: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### `dto/test-result.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class TestResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  testRunId: string;

  @ApiProperty()
  promptId: string;

  @ApiProperty()
  promptText: string;

  @ApiProperty()
  promptCategory: string;

  @ApiProperty()
  promptComplexity: string;

  @ApiProperty({ required: false })
  response?: string;

  @ApiProperty({ required: false })
  responseTime?: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  score: number;

  @ApiProperty({ required: false })
  explanation?: string;

  @ApiProperty()
  evaluationChain: any;

  @ApiProperty({ required: false })
  remediation?: string;

  @ApiProperty()
  createdAt: Date;
}
```

### `dto/query-tests.dto.ts`

```typescript
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTestsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ['createdAt', 'startedAt', 'completedAt'] })
  @IsOptional()
  @IsEnum(['createdAt', 'startedAt', 'completedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

---

## 3. Service Tests

### `tests.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@app/common/database/prisma.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { QueryTestsDto } from './dto/query-tests.dto';
import { TestRunStatus, Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Créer un nouveau test run
   */
  async createTestRun(
    dto: CreateTestRunDto,
    userId: string,
    organizationId: string,
  ) {
    // Vérifier que la cible existe
    const target = await this.prisma.testTarget.findUnique({
      where: { id: dto.targetId },
    });

    if (!target) {
      throw new NotFoundException(`Test target ${dto.targetId} not found`);
    }

    // Vérifier que la cible appartient à l'organisation
    if (target.organizationId !== organizationId) {
      throw new BadRequestException('Test target does not belong to your organization');
    }

    // Créer le test run
    const testRun = await this.prisma.testRun.create({
      data: {
        configuration: dto as any,
        status: TestRunStatus.PENDING,
        totalTests: dto.volume,
        targetId: dto.targetId,
        createdById: userId,
        organizationId,
      },
      include: {
        target: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`Test run ${testRun.id} created by user ${userId}`);

    // Émettre un événement pour déclencher l'exécution
    this.eventEmitter.emit('test.run.created', { testRunId: testRun.id });

    return testRun;
  }

  /**
   * Récupérer tous les test runs avec pagination et filtres
   */
  async findAll(
    query: QueryTestsDto,
    organizationId: string,
  ) {
    const { page, limit, status, targetId, sortBy, sortOrder } = query;

    const where: Prisma.TestRunWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status && { status: status as TestRunStatus }),
      ...(targetId && { targetId }),
    };

    const [testRuns, total] = await Promise.all([
      this.prisma.testRun.findMany({
        where,
        include: {
          target: {
            select: {
              id: true,
              name: true,
              componentType: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { results: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.testRun.count({ where }),
    ]);

    return {
      data: testRuns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer un test run par ID
   */
  async findOne(id: string, organizationId: string) {
    const testRun = await this.prisma.testRun.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        target: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        results: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!testRun) {
      throw new NotFoundException(`Test run ${id} not found`);
    }

    return testRun;
  }

  /**
   * Mettre à jour le statut et la progression d'un test run
   */
  async updateProgress(
    id: string,
    progress: number,
    status: TestRunStatus,
    stats?: {
      passedTests?: number;
      failedTests?: number;
      blockedTests?: number;
    },
  ) {
    const testRun = await this.prisma.testRun.update({
      where: { id },
      data: {
        progress,
        status,
        ...(stats && {
          passedTests: stats.passedTests,
          failedTests: stats.failedTests,
          blockedTests: stats.blockedTests,
        }),
        ...(status === TestRunStatus.COMPLETED && {
          completedAt: new Date(),
        }),
      },
    });

    // Émettre un événement pour WebSocket
    this.eventEmitter.emit('test.run.progress', {
      testRunId: id,
      progress,
      status,
      stats,
    });

    return testRun;
  }

  /**
   * Ajouter un résultat de test
   */
  async addTestResult(testRunId: string, result: any) {
    const testResult = await this.prisma.testResult.create({
      data: {
        testRunId,
        promptId: result.prompt.id,
        promptText: result.prompt.text,
        promptCategory: result.prompt.category,
        promptComplexity: result.prompt.complexity,
        response: result.response,
        responseTime: result.responseTime,
        status: result.status,
        score: result.score,
        explanation: result.explanation,
        evaluationChain: result.evaluationChain,
        remediation: result.remediation,
        metadata: result.metadata,
      },
    });

    // Émettre un événement pour WebSocket
    this.eventEmitter.emit('test.result.created', {
      testRunId,
      result: testResult,
    });

    return testResult;
  }

  /**
   * Annuler un test run
   */
  async cancel(id: string, organizationId: string) {
    const testRun = await this.findOne(id, organizationId);

    if (testRun.status === TestRunStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed test run');
    }

    const updated = await this.prisma.testRun.update({
      where: { id },
      data: {
        status: TestRunStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    this.eventEmitter.emit('test.run.cancelled', { testRunId: id });

    return updated;
  }

  /**
   * Supprimer (soft delete) un test run
   */
  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    const deleted = await this.prisma.testRun.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Test run ${id} soft deleted`);

    return deleted;
  }

  /**
   * Récupérer les statistiques globales
   */
  async getStats(organizationId: string) {
    const [total, completed, running, failed] = await Promise.all([
      this.prisma.testRun.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.testRun.count({
        where: { organizationId, status: TestRunStatus.COMPLETED, deletedAt: null },
      }),
      this.prisma.testRun.count({
        where: { organizationId, status: TestRunStatus.RUNNING, deletedAt: null },
      }),
      this.prisma.testRun.count({
        where: { organizationId, status: TestRunStatus.FAILED, deletedAt: null },
      }),
    ]);

    return {
      total,
      completed,
      running,
      failed,
      pending: total - completed - running - failed,
    };
  }
}
```

---

## 4. Contrôleur REST

### `tests.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { QueryTestsDto } from './dto/query-tests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TestRunResponseDto } from './dto/test-run-response.dto';

@ApiTags('tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test run' })
  @ApiResponse({ status: 201, type: TestRunResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTestRunDto: CreateTestRunDto,
    @CurrentUser() user: any,
  ) {
    return this.testsService.createTestRun(
      createTestRunDto,
      user.id,
      user.organizationId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all test runs with pagination and filters' })
  @ApiResponse({ status: 200, type: [TestRunResponseDto] })
  async findAll(
    @Query() query: QueryTestsDto,
    @CurrentUser() user: any,
  ) {
    return this.testsService.findAll(query, user.organizationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get test statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.testsService.getStats(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test run by ID with all results' })
  @ApiResponse({ status: 200, type: TestRunResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.testsService.findOne(id, user.organizationId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running test' })
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.testsService.cancel(id, user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test run (soft delete)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.testsService.remove(id, user.organizationId);
  }
}
```

---

## 5. WebSocket Gateway

### `tests.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  namespace: 'tests',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5080',
    credentials: true,
  },
})
export class TestsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TestsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:test-run')
  handleSubscribeToTestRun(client: Socket, testRunId: string) {
    client.join(`test-run:${testRunId}`);
    this.logger.log(`Client ${client.id} subscribed to test-run:${testRunId}`);
    return { event: 'subscribed', testRunId };
  }

  @SubscribeMessage('unsubscribe:test-run')
  handleUnsubscribeFromTestRun(client: Socket, testRunId: string) {
    client.leave(`test-run:${testRunId}`);
    this.logger.log(`Client ${client.id} unsubscribed from test-run:${testRunId}`);
    return { event: 'unsubscribed', testRunId };
  }

  // Événements du système

  @OnEvent('test.run.created')
  handleTestRunCreated(payload: { testRunId: string }) {
    this.server.emit('test:created', payload);
    this.logger.log(`Test run ${payload.testRunId} created event broadcast`);
  }

  @OnEvent('test.run.progress')
  handleTestRunProgress(payload: {
    testRunId: string;
    progress: number;
    status: string;
    stats?: any;
  }) {
    this.server.to(`test-run:${payload.testRunId}`).emit('test:progress', payload);
    this.logger.debug(`Progress update for test run ${payload.testRunId}: ${payload.progress}%`);
  }

  @OnEvent('test.result.created')
  handleTestResultCreated(payload: { testRunId: string; result: any }) {
    this.server.to(`test-run:${payload.testRunId}`).emit('test:result', payload);
  }

  @OnEvent('test.run.completed')
  handleTestRunCompleted(payload: { testRunId: string }) {
    this.server.to(`test-run:${payload.testRunId}`).emit('test:completed', payload);
    this.logger.log(`Test run ${payload.testRunId} completed event broadcast`);
  }

  @OnEvent('test.run.failed')
  handleTestRunFailed(payload: { testRunId: string; error: string }) {
    this.server.to(`test-run:${payload.testRunId}`).emit('test:failed', payload);
    this.logger.error(`Test run ${payload.testRunId} failed: ${payload.error}`);
  }

  @OnEvent('test.run.cancelled')
  handleTestRunCancelled(payload: { testRunId: string }) {
    this.server.to(`test-run:${payload.testRunId}`).emit('test:cancelled', payload);
    this.logger.log(`Test run ${payload.testRunId} cancelled event broadcast`);
  }
}
```

---

## 6. Module Tests

### `tests.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { TestsGateway } from './tests.gateway';
import { PrismaModule } from '@app/common/database/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [TestsController],
  providers: [TestsService, TestsGateway],
  exports: [TestsService],
})
export class TestsModule {}
```

---

## 7. Intégration Frontend

### Nouveau Service API: `services/backendApiService.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { TestConfiguration, TestResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class BackendApiService {
  private api: AxiosInstance;
  private socket: Socket | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor pour ajouter le token JWT
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Créer un nouveau test run
   */
  async createTestRun(config: TestConfiguration) {
    const response = await this.api.post('/tests', config);
    return response.data;
  }

  /**
   * Récupérer tous les test runs
   */
  async getTestRuns(params?: {
    page?: number;
    limit?: number;
    status?: string;
    targetId?: string;
  }) {
    const response = await this.api.get('/tests', { params });
    return response.data;
  }

  /**
   * Récupérer un test run avec ses résultats
   */
  async getTestRun(id: string) {
    const response = await this.api.get(`/tests/${id}`);
    return response.data;
  }

  /**
   * Annuler un test en cours
   */
  async cancelTestRun(id: string) {
    const response = await this.api.patch(`/tests/${id}/cancel`);
    return response.data;
  }

  /**
   * Supprimer un test run
   */
  async deleteTestRun(id: string) {
    await this.api.delete(`/tests/${id}`);
  }

  /**
   * Récupérer les statistiques
   */
  async getStats() {
    const response = await this.api.get('/tests/stats');
    return response.data;
  }

  /**
   * Connexion WebSocket pour temps réel
   */
  connectWebSocket(testRunId: string, callbacks: {
    onProgress?: (data: any) => void;
    onResult?: (data: any) => void;
    onCompleted?: (data: any) => void;
    onFailed?: (data: any) => void;
    onCancelled?: (data: any) => void;
  }) {
    if (!this.socket) {
      this.socket = io(`${WS_BASE_URL}/tests`, {
        auth: {
          token: localStorage.getItem('access_token'),
        },
      });
    }

    this.socket.emit('subscribe:test-run', testRunId);

    if (callbacks.onProgress) {
      this.socket.on('test:progress', callbacks.onProgress);
    }

    if (callbacks.onResult) {
      this.socket.on('test:result', callbacks.onResult);
    }

    if (callbacks.onCompleted) {
      this.socket.on('test:completed', callbacks.onCompleted);
    }

    if (callbacks.onFailed) {
      this.socket.on('test:failed', callbacks.onFailed);
    }

    if (callbacks.onCancelled) {
      this.socket.on('test:cancelled', callbacks.onCancelled);
    }

    return () => {
      this.socket?.emit('unsubscribe:test-run', testRunId);
      this.socket?.off('test:progress');
      this.socket?.off('test:result');
      this.socket?.off('test:completed');
      this.socket?.off('test:failed');
      this.socket?.off('test:cancelled');
    };
  }

  disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const backendApiService = new BackendApiService();
```

### Modification du TestRunContext

```typescript
// contexts/TestRunContext.tsx

import { backendApiService } from '../services/backendApiService';

export const TestRunProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useBackend, setUseBackend] = useState(false); // Toggle backend/local
  const [currentTestRunId, setCurrentTestRunId] = useState<string | null>(null);

  const startTest = useCallback(async (config: TestConfiguration) => {
    setIsRunning(true);
    setIsFinished(false);
    setResults([]);
    setProgress(0);
    setConfiguration(config);

    try {
      if (useBackend) {
        // 🆕 Mode Backend avec WebSocket
        const testRun = await backendApiService.createTestRun(config);
        setCurrentTestRunId(testRun.id);

        // Connexion WebSocket pour mises à jour temps réel
        const unsubscribe = backendApiService.connectWebSocket(testRun.id, {
          onProgress: (data) => {
            setProgress(data.progress);
          },
          onResult: (data) => {
            setResults(prev => [...prev, data.result]);
          },
          onCompleted: (data) => {
            setIsRunning(false);
            setIsFinished(true);
            setProgress(100);
          },
          onFailed: (data) => {
            alert(`Test failed: ${data.error}`);
            setIsRunning(false);
          },
        });

        // Cleanup au démontage
        return () => unsubscribe();

      } else if (testMode === 'real') {
        // Mode local avec Promptfoo (code existant)
        await promptfooIntegrationService.runRealTests(config, ...);
      } else {
        // Mode simulation (code existant)
        const prompts = await generateTestPrompts(...);
        // ...
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`);
      setIsRunning(false);
    }
  }, [useBackend, testMode]);

  return (
    <TestRunContext.Provider value={{
      // ... existing
      useBackend,
      setUseBackend,
      currentTestRunId,
    }}>
      {children}
    </TestRunContext.Provider>
  );
};
```

---

## 8. Variables d'Environnement

### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_risk_manager?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"

# Frontend URL (pour CORS)
FRONTEND_URL="http://localhost:5080"

# Server
PORT=3000
NODE_ENV=development
```

### Frontend `.env`

```env
# API Backend
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000

# Gemini API (existant)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 9. Migration Prisma

```bash
# Générer le client Prisma
cd backend
npx prisma generate

# Créer une migration
npx prisma migrate dev --name add-tests-module

# Appliquer les migrations
npx prisma migrate deploy
```

---

## 10. Tests (Exemples)

### Test E2E du contrôleur

```typescript
// tests.controller.spec.ts

describe('TestsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestsModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Login pour obtenir le token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = response.body.access_token;
  });

  it('POST /tests - should create a new test run', () => {
    return request(app.getHttpServer())
      .post('/tests')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        categories: ['SECURITY_PRIVACY'],
        targetId: 'target-uuid',
        volume: 10,
        complexities: ['SIMPLE'],
        testMode: 'simulation',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('PENDING');
      });
  });
});
```

---

## 11. Déploiement

### Docker Compose (mise à jour)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_risk_manager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/ai_risk_manager
      JWT_SECRET: your-super-secret-jwt-key
      FRONTEND_URL: http://localhost:5080
    depends_on:
      - postgres
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - ./prisma:/app/prisma
      - /app/node_modules

volumes:
  postgres_data:
```

---

## 12. Résumé des Avantages

### Par rapport à la solution actuelle (localStorage)

| Feature | Actuel (localStorage) | Avec Backend |
|---------|----------------------|--------------|
| Persistance | ❌ Perdue au rafraîchissement | ✅ Base de données |
| Multi-utilisateurs | ❌ Non | ✅ Oui avec auth |
| Temps réel | ❌ Non | ✅ WebSocket |
| Historique illimité | ❌ Limité (20 runs) | ✅ Illimité |
| Recherche avancée | ❌ Non | ✅ Oui (filtres, tri) |
| Statistiques globales | ❌ Session uniquement | ✅ Organisation |
| Partage de résultats | ❌ Non | ✅ Oui (même org) |
| Notifications | ❌ Non | ✅ Oui (système) |
| Audit logs | ❌ Non | ✅ Oui (complet) |

---

## 13. Prochaines Étapes

1. **Valider cette architecture** avant implémentation complète
2. **Choisir le scope**:
   - Minimal: juste API REST sans WebSocket
   - Complet: API REST + WebSocket + Auth
3. **Décider**: Garder le mode local ou tout migrer vers backend?
4. **Timeline**: Estimer le temps d'implémentation (3-5 jours)

---

**Auteur**: Claude Code
**Date**: 2025-10-31
**Version**: Phase 4 - Plan Détaillé
