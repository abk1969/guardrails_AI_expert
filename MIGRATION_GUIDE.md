# Guide de Migration - AI RISK MANAGER
## De l'Application Actuelle vers l'Architecture Full Stack

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Phase 1: Setup Initial](#phase-1-setup-initial)
4. [Phase 2: Migration Backend](#phase-2-migration-backend)
5. [Phase 3: Migration Frontend](#phase-3-migration-frontend)
6. [Phase 4: Tests et Validation](#phase-4-tests-et-validation)
7. [Phase 5: Déploiement](#phase-5-déploiement)
8. [Rollback et Contingence](#rollback-et-contingence)

---

## Vue d'ensemble

Cette migration transforme progressivement l'application actuelle (SPA 100% client) en une architecture full stack moderne avec:

- **Backend**: NestJS + PostgreSQL + Redis
- **Frontend**: React (refactorisé avec Zustand + TanStack Query)
- **Infrastructure**: Docker, Kubernetes, CI/CD

### Stratégie de Migration: **Strangler Fig Pattern**

Nous allons progressivement "étrangler" l'ancienne architecture en:
1. Construisant le nouveau backend en parallèle
2. Migrant les fonctionnalités une par une
3. Gardant l'ancienne application fonctionnelle jusqu'à la fin
4. Basculant complètement une fois validé

---

## Prérequis

### Outils à Installer

```bash
# Node.js 20+
nvm install 20
nvm use 20

# Docker & Docker Compose
# Télécharger depuis: https://www.docker.com/products/docker-desktop

# PostgreSQL CLI (optionnel, pour debug)
# Windows: https://www.postgresql.org/download/windows/

# Git (si pas déjà installé)
git --version
```

### Compétences Requises

- TypeScript (intermédiaire)
- React (intermédiaire)
- NestJS (débutant acceptable avec la doc)
- SQL basique
- Docker basique
- Git workflows

---

## Phase 1: Setup Initial

### Étape 1.1: Créer la Structure de Projet

```bash
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert

# Créer structure backend
mkdir -p backend/{apps/{api-gateway,test-execution-service},libs/{common,auth,database}}
mkdir -p backend/prisma

# Créer structure infrastructure
mkdir -p infrastructure/{docker,kubernetes,monitoring}

# Garder le frontend actuel
# Le nouveau frontend sera dans frontend-refactored/
```

### Étape 1.2: Initialiser Backend

```bash
cd backend

# Initialiser package.json
npm init -y

# Installer dépendances NestJS
npm install --save \
  @nestjs/common \
  @nestjs/core \
  @nestjs/platform-express \
  @nestjs/config \
  @nestjs/jwt \
  @nestjs/passport \
  @nestjs/swagger \
  @nestjs/throttler \
  @nestjs/cache-manager \
  @nestjs/bull \
  @prisma/client \
  passport \
  passport-jwt \
  bcrypt \
  class-validator \
  class-transformer \
  helmet \
  compression

# Installer dev dependencies
npm install --save-dev \
  @nestjs/cli \
  @nestjs/testing \
  @types/node \
  @types/bcrypt \
  @types/passport-jwt \
  prisma \
  typescript \
  ts-node \
  vitest \
  @vitest/coverage-v8
```

### Étape 1.3: Configuration Base de Données

```bash
# Copier le schema Prisma créé
# Fichier: backend/prisma/schema.prisma (déjà créé)

# Copier .env.example vers .env
cp ../.env.example .env

# Éditer .env avec vos valeurs
# IMPORTANT: Changer JWT_SECRET et ENCRYPTION_KEY !
```

### Étape 1.4: Démarrer les Services avec Docker

```bash
# Retour à la racine
cd ..

# Démarrer PostgreSQL et Redis
docker-compose up -d postgres redis

# Vérifier que les services sont up
docker-compose ps

# Vous devriez voir:
# - postgres (port 5432)
# - redis (port 6379)
```

### Étape 1.5: Initialiser la Base de Données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Créer la première migration
npx prisma migrate dev --name init

# Seed les données de démo
npx prisma db seed

# Ouvrir Prisma Studio pour visualiser
npx prisma studio
# Accès: http://localhost:5555
```

**Checkpoint 1**: Vous devez avoir:
- ✅ PostgreSQL qui tourne avec les tables créées
- ✅ Redis qui tourne
- ✅ Données de seed visible dans Prisma Studio
- ✅ Client Prisma généré

---

## Phase 2: Migration Backend

### Étape 2.1: Créer le Module Auth

```bash
cd backend

# Générer module Auth
npx nest generate module auth
npx nest generate service auth
npx nest generate controller auth
```

**Créer**: `libs/auth/src/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, user };
  }
}
```

### Étape 2.2: Tester l'Auth avec curl

```bash
# Démarrer le serveur backend
cd backend
npm run start:dev

# Dans un autre terminal, tester login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.airiskmgr.com","password":"Demo123!"}'

# Vous devriez recevoir un token JWT
```

### Étape 2.3: Implémenter le Module Tests

Utiliser les fichiers créés:
- `backend/apps/api-gateway/src/tests/tests.controller.ts`
- `backend/apps/api-gateway/src/tests/tests.service.ts`
- `backend/apps/api-gateway/src/tests/dto/*.dto.ts`

**Créer**: `tests.service.ts` (logique métier)

```typescript
@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
    private queue: Queue,
  ) {}

  async createTestRun(dto: CreateTestRunDto, userId: string, orgId: string) {
    // Créer le test run
    const testRun = await this.prisma.testRun.create({
      data: {
        configuration: dto as any,
        userId,
        organizationId: orgId,
        targetId: dto.targetId,
        totalPrompts: dto.volume,
        status: 'QUEUED',
      },
    });

    // Ajouter à la queue pour exécution async
    await this.queue.add('execute-test', {
      runId: testRun.id,
      configuration: dto,
    });

    return testRun;
  }

  // ... autres méthodes
}
```

**Checkpoint 2**: Vous devez avoir:
- ✅ Backend qui démarre sans erreur
- ✅ Login qui fonctionne et retourne un JWT
- ✅ Endpoint `/api/v1/tests/run` accessible
- ✅ Swagger doc accessible sur `/api/docs`

---

## Phase 3: Migration Frontend

### Étape 3.1: Setup TanStack Query

```bash
cd frontend  # ou frontend-refactored si vous créez à côté

# Installer dépendances
npm install \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  zustand \
  axios

# Installer UI components modernes
npm install \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-toast \
  framer-motion
```

### Étape 3.2: Configuration Providers

**Créer**: `src/App.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Votre app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Étape 3.3: Migration Progressive des Modules

**Ordre recommandé**:

1. **Auth Module** (priorité 1)
   - Créer `useAuth` store (Zustand)
   - Créer `useLogin`, `useLogout` mutations
   - Remplacer login actuel

2. **Test Execution** (priorité 2)
   - Remplacer `TestRunContext` par `useTestRunStore`
   - Remplacer appels service par hooks TanStack Query
   - Garder l'UI identique au début

3. **Analytics** (priorité 3)
   - Créer hooks pour fetch données historiques
   - Ajouter cache intelligent

4. **Autres Modules** (priorité 4+)
   - Migrer un par un
   - Tester à chaque étape

### Exemple de Migration: TestConfiguration

**Avant** (Context API):
```typescript
const { startTest } = useTestRun();
const handleSubmit = () => {
  startTest(configuration);
};
```

**Après** (Zustand + TanStack Query):
```typescript
const createTestRun = useCreateTestRun();
const handleSubmit = () => {
  createTestRun.mutate(configuration, {
    onSuccess: (data) => {
      toast.success('Test started!');
      navigate(`/tests/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
```

**Checkpoint 3**: Vous devez avoir:
- ✅ Frontend qui se connecte au backend
- ✅ Login fonctionnel avec JWT stocké
- ✅ Au moins 1 module migré (Tests)
- ✅ React Query DevTools visible

---

## Phase 4: Tests et Validation

### Étape 4.1: Tests Backend

```bash
cd backend

# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

**Créer des tests**:

```typescript
// tests/auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@demo.airiskmgr.com', password: 'Demo123!' })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
```

### Étape 4.2: Tests Frontend

```bash
cd frontend

# Tests unitaires (Vitest)
npm run test

# Tests E2E (Playwright)
npm run test:e2e
```

**Créer tests E2E**:

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[name="email"]', 'admin@demo.airiskmgr.com');
  await page.fill('[name="password"]', 'Demo123!');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*dashboard/);
});
```

**Checkpoint 4**: Vous devez avoir:
- ✅ Tous les tests backend passent
- ✅ Tests E2E passent
- ✅ Coverage > 70%

---

## Phase 5: Déploiement

### Étape 5.1: Build Production

```bash
# Frontend
cd frontend
npm run build
# Output: dist/

# Backend
cd ../backend
npm run build
# Output: dist/
```

### Étape 5.2: Docker Build

```bash
# Build toutes les images
docker-compose build

# Test en local
docker-compose up

# Accès:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - Adminer: http://localhost:8080
```

### Étape 5.3: Déploiement Staging

```bash
# Push vers GitHub
git add .
git commit -m "feat: full stack migration complete"
git push origin develop

# CI/CD va automatiquement:
# - Lancer tests
# - Build images Docker
# - Deploy sur staging
```

### Étape 5.4: Déploiement Production

```bash
# Créer PR vers main
gh pr create --base main --head develop

# Après review et merge:
# - CI/CD deploy automatiquement en prod
# - Notifications Slack/Email envoyées
```

**Checkpoint 5**: Vous devez avoir:
- ✅ Application déployée en staging
- ✅ Tests de smoke passés
- ✅ Performance acceptable
- ✅ Logs et monitoring actifs

---

## Rollback et Contingence

### Plan de Rollback

Si problème critique en production:

```bash
# Option 1: Revert Git
git revert HEAD
git push origin main
# CI/CD redéploie automatiquement

# Option 2: Rollback Kubernetes
kubectl rollout undo deployment/api-gateway -n production
kubectl rollout undo deployment/frontend -n production

# Option 3: Basculer vers ancienne version
# Modifier manifests Kubernetes pour pointer vers tag précédent
kubectl set image deployment/api-gateway api-gateway=ghcr.io/org/app:previous-tag
```

### Checklist de Validation Pré-Déploiement

- [ ] Tous les tests CI/CD passent
- [ ] Smoke tests manuels effectués en staging
- [ ] Performance testée (load testing)
- [ ] Backup DB effectué
- [ ] Monitoring et alertes configurés
- [ ] Documentation à jour
- [ ] Équipe prévenue du déploiement
- [ ] Plan de rollback validé

---

## Ressources

### Documentation

- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://docs.pmnd.rs/zustand

### Support

- **Issues**: Créer une issue GitHub
- **Questions**: Discussions GitHub
- **Urgent**: Slack channel #ai-risk-manager

---

## Prochaines Étapes Après Migration

1. **Optimisation Performance**
   - Mettre en place CDN
   - Optimiser requêtes DB
   - Implémenter cache agressif

2. **Features Avancées**
   - Real-time collaboration
   - Advanced analytics
   - AI-powered insights

3. **Scaling**
   - Horizontal scaling avec K8s
   - Read replicas pour DB
   - Multi-region deployment

Bonne migration ! 🚀
