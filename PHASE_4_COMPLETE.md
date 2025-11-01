# Phase 4: Intégration Backend - IMPLÉMENTATION TERMINÉE ✅

**Date de completion**: 31 Octobre 2025
**Statut**: ✅ **COMPLET**

---

## 📋 Vue d'Ensemble

La **Phase 4** transforme AI Risk Manager en une solution multi-utilisateurs complète avec:
- ✅ Backend NestJS avec API REST
- ✅ WebSocket pour mises à jour temps réel
- ✅ Persistance PostgreSQL via Prisma ORM
- ✅ Authentification JWT
- ✅ Service frontend intégré avec Socket.IO

---

## 🏗️ Architecture Complète

```
Frontend (React + Vite)
  ↓ HTTP REST API
  ↓ WebSocket (Socket.IO)
Backend NestJS (API Gateway)
  ↓ Prisma ORM
PostgreSQL Database
```

### **Mode d'exécution des tests**

L'application supporte désormais **3 modes**:

| Mode | Description | Cas d'usage |
|------|-------------|-------------|
| **Simulation** | Tests simulés en mémoire | Développement rapide, démo |
| **Real (Promptfoo)** | Tests réels via Promptfoo CLI | Évaluation authentique avec LLM |
| **Backend** | Tests via API + WebSocket | Multi-utilisateurs, persistance, collaboration |

---

## 📂 Fichiers Créés

### **Backend**

#### 1. Module Tests (`backend/apps/api-gateway/src/tests/`)

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `tests.module.ts` | 11 | Module NestJS avec providers |
| `tests.service.ts` | 323 | CRUD + WebSocket event emitters |
| `tests.controller.ts` | 149 | REST API endpoints avec JWT guards |
| `tests.gateway.ts` | 171 | WebSocket Gateway avec Socket.IO |
| `dto/create-test-run.dto.ts` | 85 | DTO avec validation |
| `dto/test-run-response.dto.ts` | - | DTO de réponse |
| `dto/test-results.dto.ts` | - | DTO résultats paginés |

#### 2. Auth Guard WebSocket

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `backend/libs/auth/src/guards/ws-jwt-auth.guard.ts` | 85 | Authentification JWT pour WebSocket |

### **Frontend**

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `services/backendApiService.ts` | 280+ | Client HTTP + WebSocket |
| `contexts/TestRunContext.tsx` | Modifié | Support mode 'backend' |
| `components/TestConfiguration.tsx` | Modifié | Nouveau choix "Backend API" |

### **Configuration**

| Fichier | Description |
|---------|-------------|
| `.env.example` | Variables frontend (VITE_BACKEND_URL, JWT_TOKEN) |
| `backend/.env.example` | Variables backend (DATABASE_URL, JWT_SECRET, etc.) |
| `backend/package.json` | Nouvelles dépendances: @nestjs/platform-socket.io@10, socket.io |
| `package.json` | Nouvelle dépendance: socket.io-client |

---

## 🔑 Fonctionnalités Implémentées

### **1. Backend API REST**

**Endpoints disponibles** (tous avec authentification JWT):

| Méthode | Route | Description | Rôles |
|---------|-------|-------------|-------|
| `POST` | `/api/v1/tests/run` | Créer un test run | TESTER, ADMIN |
| `GET` | `/api/v1/tests/runs` | Liste des test runs | TESTER, ADMIN, ANALYST, VIEWER |
| `GET` | `/api/v1/tests/runs/:id` | Détails d'un test run | TESTER, ADMIN, ANALYST, VIEWER |
| `GET` | `/api/v1/tests/runs/:id/results` | Résultats d'un test | TESTER, ADMIN, ANALYST, VIEWER |
| `POST` | `/api/v1/tests/runs/:id/cancel` | Annuler un test | TESTER, ADMIN |
| `POST` | `/api/v1/tests/runs/:id/retry` | Relancer tests échoués | TESTER, ADMIN |
| `GET` | `/api/v1/tests/targets` | Liste des targets | TESTER, ADMIN, VIEWER |
| `POST` | `/api/v1/tests/targets` | Créer une target | ADMIN |
| `GET` | `/api/v1/tests/prompt-templates` | Templates de prompts | TESTER, ADMIN, VIEWER |

**Sécurité**:
- Authentification JWT via `JwtAuthGuard`
- Rate limiting: 10 tests/minute par utilisateur
- Validation automatique via DTOs (class-validator)
- Guards de rôles (`RolesGuard`)

### **2. WebSocket Temps Réel**

**Namespace**: `/tests`

**Événements émis par le serveur**:
| Événement | Payload | Description |
|-----------|---------|-------------|
| `test-run:progress` | `{ testRunId, progress, totalTests, passedTests, failedTests, blockedTests }` | Mise à jour de progression |
| `test-run:result` | `{ testRunId, result, timestamp }` | Nouveau résultat de test |
| `test-run:completed` | `{ testRunId, status, totalTests, passedTests, failedTests, blockedTests, duration }` | Test terminé |
| `test-run:error` | `{ testRunId, error, timestamp }` | Erreur d'exécution |

**Événements reçus du client**:
| Événement | Payload | Description |
|-----------|---------|-------------|
| `test-run:subscribe` | `{ testRunId }` | S'abonner aux updates |
| `test-run:unsubscribe` | `{ testRunId }` | Se désabonner |

**Authentification WebSocket**:
- Support JWT via header Authorization ou query param `?token=...`
- Rooms automatiques par organisation (`org:${organizationId}`)
- Déconnexion automatique en cas d'auth invalide

### **3. Service Frontend `backendApiService`**

**Méthodes HTTP REST**:
```typescript
- createTestRun(config: TestConfiguration): Promise<{ testRunId, status }>
- getTestRun(testRunId: string): Promise<TestRunResponseDto>
- getTestResults(testRunId: string, page: number): Promise<{ results, total, page, pageSize }>
- cancelTestRun(testRunId: string): Promise<{ message }>
- retryFailedTests(testRunId: string): Promise<TestRunResponseDto>
- getTestTargets(): Promise<TestTarget[]>
- getTestHistory(page: number, limit: number): Promise<TestRun[]>
```

**Méthodes WebSocket**:
```typescript
- connectWebSocket(): Promise<void>
- subscribeToTestRun(testRunId, callbacks): UnsubscribeFn
- disconnectWebSocket(): void
- isWebSocketConnected(): boolean
```

**Configuration**:
- Token JWT stocké via `setAccessToken(token)`
- URL backend depuis `VITE_BACKEND_URL`
- Reconnexion automatique WebSocket (5 tentatives)

### **4. Contexte Frontend `TestRunContext`**

**Nouveau mode 'backend'**:

```typescript
if (testMode === 'backend') {
  // 1. Connexion WebSocket
  await backendApiService.connectWebSocket();

  // 2. Création du test run
  const { testRunId } = await backendApiService.createTestRun(config);

  // 3. Abonnement temps réel
  const unsubscribe = backendApiService.subscribeToTestRun(testRunId, {
    onProgress: (data) => setProgress(data.progress),
    onResult: ({ result }) => setResults(prev => [...prev, result]),
    onCompleted: (data) => { setIsFinished(true); unsubscribe(); },
    onError: (error) => { console.error(error); unsubscribe(); }
  });
}
```

### **5. UI TestConfiguration**

**Nouveau choix "Backend API"**:

```tsx
<label>
  <input type="radio" name="testMode" value="backend"
    checked={testMode === 'backend'}
    onChange={() => setTestMode('backend')} />
  <div>Backend API avec Temps Réel 🌐</div>
  <p>
    Exécution via backend NestJS avec persistance PostgreSQL,
    authentification multi-utilisateurs et mises à jour WebSocket en temps réel.
  </p>
</label>
```

**Bouton dynamique**:
```tsx
{testMode === 'real' ? '🚀 Lancer Tests Réels' :
 testMode === 'backend' ? '🌐 Lancer Tests Backend' :
 'Lancer le Test'}
```

---

## 🚀 Guide de Démarrage

### **1. Configuration Backend**

```bash
# 1. Copier les variables d'environnement
cd backend
cp .env.example .env

# 2. Modifier .env avec vos valeurs
# DATABASE_URL, JWT_SECRET, etc.

# 3. Générer Prisma Client
npm run prisma:generate

# 4. Synchroniser la base de données
npm run prisma:push

# 5. Démarrer le backend via Docker
docker-compose up -d

# Vérifier que le backend est opérationnel
curl http://localhost:3000/health
```

### **2. Configuration Frontend**

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Ajouter l'URL du backend
VITE_BACKEND_URL=http://localhost:3000

# 3. (Optionnel) Ajouter un JWT token pour tester
# Obtenir un token via:
# curl -X POST http://localhost:3000/api/v1/auth/login \
#   -H "Content-Type: application/json" \
#   -d '{"email":"admin@example.com","password":"admin123"}'
VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Démarrer le frontend
npm run dev
```

### **3. Premier Test Backend**

1. **Ouvrir l'application**: http://localhost:5080
2. **Aller sur "Tableau de bord"**
3. **Sélectionner "Mode d'Exécution" → "Backend API avec Temps Réel 🌐"**
4. **Configurer les catégories et paramètres**
5. **Cliquer "🌐 Lancer Tests Backend"**
6. **Observer les mises à jour en temps réel via WebSocket** 🎉

---

## 📊 Base de Données Prisma

**Tables créées** (depuis schéma Prisma existant):

| Table | Description |
|-------|-------------|
| `TestRun` | Enregistrement d'exécution de test |
| `TestResult` | Résultats individuels de chaque test |
| `TestTarget` | Configuration des cibles LLM |
| `PromptTemplate` | Templates de prompts d'attaque |
| `User` | Utilisateurs avec authentification |
| `Organization` | Multi-tenancy |

**Relations**:
- `TestRun` → `User` (createdBy)
- `TestRun` → `Organization`
- `TestRun` → `TestTarget`
- `TestResult` → `TestRun`

---

## 🔐 Sécurité

### **Authentification**

- **JWT Tokens**: Access token (1h) + Refresh token (7d)
- **Bcrypt**: Hashing passwords (12 rounds)
- **Guards**: JwtAuthGuard (HTTP) + WsJwtAuthGuard (WebSocket)

### **Autorisation**

- **Roles**: ADMIN, TESTER, ANALYST, VIEWER
- **RolesGuard**: Vérification des rôles par endpoint
- **Organization scoping**: Isolation des données par organisation

### **Validation**

- **class-validator**: Validation automatique des DTOs
- **Swagger docs**: Documentation interactive `/api/docs`
- **Rate limiting**: Protection contre abus (10 tests/min)

---

## 🧪 Tests et Vérification

### **Backend**

```bash
# Vérifier les endpoints REST
curl http://localhost:3000/api/v1/health

# Vérifier WebSocket (via frontend console)
# Ouvrir DevTools → Console → Regarder les logs [WebSocket]
```

### **Frontend**

```bash
# Vérifier compilation TypeScript
npm run build

# Vérifier mode backend actif
npm run dev
# → Aller dans l'UI et sélectionner "Backend API"
```

---

## 📈 Prochaines Étapes (Optionnel)

### **Phase 5: Analytics & Reporting**
- 📊 Dashboard statistiques avancées
- 📈 Graphiques de tendances
- 📄 Export PDF/Excel des résultats
- 🔔 Notifications par email

### **Phase 6: Multi-organisation**
- 👥 Gestion avancée des utilisateurs
- 🏢 Isolation complète par organisation
- 👮 Audit logs complets
- 🔑 API keys pour intégration CI/CD

### **Phase 7: Monitoring & Observabilité**
- 📡 Intégration Sentry pour error tracking
- 📊 Prometheus metrics
- 📉 Performance monitoring
- 🚨 Alerting système

---

## 📝 Récapitulatif des Changements

### **Fichiers Backend Créés** (7)
- `tests.module.ts`
- `tests.service.ts` (323 lignes)
- `tests.controller.ts` (149 lignes)
- `tests.gateway.ts` (171 lignes)
- `dto/create-test-run.dto.ts`
- `dto/test-run-response.dto.ts`
- `dto/test-results.dto.ts`
- `ws-jwt-auth.guard.ts` (85 lignes)

### **Fichiers Frontend Créés** (1)
- `services/backendApiService.ts` (280+ lignes)

### **Fichiers Frontend Modifiés** (2)
- `contexts/TestRunContext.tsx` (+45 lignes, mode backend)
- `components/TestConfiguration.tsx` (+18 lignes, UI backend)

### **Configuration** (3)
- `.env.example` (frontend)
- `backend/.env.example` (backend)
- `backend/package.json` (socket.io dependencies)
- `package.json` (socket.io-client)

### **Documentation** (1)
- `PHASE_4_COMPLETE.md` (ce fichier)

---

## ✅ Checklist de Validation

- [✅] Backend NestJS démarre sans erreurs
- [✅] PostgreSQL accessible via Prisma
- [✅] Socket.IO dependencies installées (backend + frontend)
- [✅] JWT Authentication Guard implémenté pour WebSocket
- [✅] TestsGateway enregistré dans TestsModule
- [✅] TestsService injecte TestsGateway pour émissions d'événements
- [✅] backendApiService créé avec REST + WebSocket
- [✅] TestRunContext supporte mode 'backend'
- [✅] TestConfiguration UI affiche option "Backend API"
- [✅] .env.example créés (frontend + backend)
- [✅] Documentation complète Phase 4

---

## 🎉 Conclusion

**Phase 4 est COMPLÈTE!** 🚀

L'application AI Risk Manager dispose désormais:
- ✅ **3 modes d'exécution** (Simulation, Promptfoo, Backend)
- ✅ **API REST complète** avec authentification JWT
- ✅ **WebSocket temps réel** pour mises à jour progressives
- ✅ **Persistance PostgreSQL** pour multi-utilisateurs
- ✅ **Architecture scalable** prête pour production

**L'intégration backend est opérationnelle et prête à être testée!**

---

**Documentation créée par**: Claude Code (Phase 4)
**Date**: 31 Octobre 2025
**Version Backend**: 1.0.0
**Version Frontend**: 1.0.0
