# 🏗️ Architecture Full Stack - AI RISK MANAGER

## 📚 Index des Fichiers de Documentation

Ce dépôt contient maintenant une documentation complète pour la migration vers une architecture full stack moderne:

### 1. **CLAUDE.md**
📄 Guide pour Claude Code - Vue d'ensemble du projet actuel
- Structure de l'application SPA actuelle
- Commandes de développement
- Architecture des composants

### 2. **ARCHITECTURE_FULLSTACK.md** ⭐
📐 **Document principal** - Architecture complète proposée
- Vision architecturale détaillée
- Stack technologique recommandée (NestJS, Prisma, Zustand, TanStack Query)
- Design patterns (Clean Architecture, CQRS, Event Sourcing)
- Sécurité enterprise-grade
- Plan de migration 12 semaines
- **Plus de 500 lignes de code d'exemple prêt à l'emploi**

### 3. **MIGRATION_GUIDE.md**
🚀 Guide pratique étape par étape
- Instructions détaillées pour chaque phase
- Commandes à exécuter
- Checkpoints de validation
- Plan de rollback

### 4. **Fichiers de Configuration**

#### Infrastructure
- `docker-compose.yml` - Orchestration complète (PostgreSQL, Redis, backend, frontend, monitoring)
- `.env.example` - Toutes les variables d'environnement documentées

#### Backend
- `backend/prisma/schema.prisma` - Schéma de base de données complet
- `backend/prisma/seed.ts` - Données de démo
- `backend/apps/api-gateway/src/main.ts` - Point d'entrée NestJS
- `backend/apps/api-gateway/src/app.module.ts` - Configuration modules
- `backend/apps/api-gateway/src/tests/tests.controller.ts` - Exemple de controller
- `backend/apps/api-gateway/src/tests/dto/` - DTOs avec validation

#### Frontend Refactorisé
- `frontend-refactored/src/store/test-run.store.ts` - Store Zustand
- `frontend-refactored/src/api/test-api.ts` - Client TanStack Query
- `frontend-refactored/src/components/Dashboard-refactored.tsx` - Composant refactorisé

#### CI/CD
- `.github/workflows/ci-cd.yml` - Pipeline complet (tests, build, deploy)

---

## 🎯 Quick Start

### Pour Comprendre l'Architecture

1. **Lire d'abord**: `ARCHITECTURE_FULLSTACK.md`
   - Comprendre la vision globale
   - Voir les design patterns
   - Explorer les exemples de code

2. **Ensuite**: `MIGRATION_GUIDE.md`
   - Suivre les étapes pratiques
   - Exécuter les commandes
   - Valider chaque phase

### Pour Démarrer le Développement

```bash
# 1. Cloner et setup
git clone <repo>
cd guardrails_AI_expert

# 2. Copier la configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer les services
docker-compose up -d

# 4. Initialiser la base de données
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Démarrer le développement
npm run dev  # Backend sur :3001
cd ../frontend
npm run dev  # Frontend sur :3000
```

### Accès aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:3001/api/v1 | - |
| Swagger Docs | http://localhost:3001/api/docs | - |
| Adminer (DB) | http://localhost:8080 | airiskmgr / airiskmgr_dev_password |
| Redis Commander | http://localhost:8081 | - |
| Grafana | http://localhost:3002 | admin / admin |

**Comptes de test** (après seed):
- Admin: `admin@demo.airiskmgr.com` / `Demo123!`
- Tester: `tester@demo.airiskmgr.com` / `Demo123!`
- Analyst: `analyst@demo.airiskmgr.com` / `Demo123!`

---

## 📊 Structure du Projet

```
ai-risk-manager/
├── 📄 README.md                     # Ce fichier
├── 📄 CLAUDE.md                     # Guide Claude Code (app actuelle)
├── 📄 ARCHITECTURE_FULLSTACK.md    # 📐 Architecture complète
├── 📄 MIGRATION_GUIDE.md           # 🚀 Guide de migration
│
├── 🐳 docker-compose.yml            # Services (DB, Redis, etc.)
├── 🔒 .env.example                  # Configuration environnement
│
├── backend/                         # 🔙 Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma           # Schéma DB complet
│   │   └── seed.ts                 # Données de test
│   ├── apps/
│   │   ├── api-gateway/            # API principale
│   │   └── test-execution-service/ # Service d'exécution tests
│   └── libs/                       # Bibliothèques partagées
│       ├── common/
│       ├── auth/
│       └── database/
│
├── frontend/                        # 🎨 Frontend React (actuel)
│   ├── src/
│   ├── components/
│   └── contexts/                   # Context API (à migrer)
│
├── frontend-refactored/            # 🎨 Frontend refactorisé
│   ├── src/
│   │   ├── store/                  # Zustand stores
│   │   ├── api/                    # TanStack Query
│   │   └── components/             # Composants refactorés
│
├── infrastructure/                 # ☁️ Infrastructure
│   ├── docker/
│   ├── kubernetes/
│   └── monitoring/
│
└── .github/                        # ⚙️ CI/CD
    └── workflows/
        └── ci-cd.yml               # Pipeline complet
```

---

## 🎓 Concepts Clés

### Backend (NestJS)

- **Clean Architecture**: Séparation Domain/Application/Infrastructure
- **CQRS**: Commands et Queries séparées
- **Event Sourcing**: Audit trail complet
- **Microservices**: Services découplés communicant via events

### Frontend (React)

- **Zustand**: State management performant (remplace Context API)
- **TanStack Query**: Cache serveur intelligent, optimistic updates
- **Separation of Concerns**: Logique métier vs UI

### Base de Données

- **Prisma ORM**: Type-safe, migrations automatiques
- **PostgreSQL**: Données relationnelles, ACID
- **Redis**: Cache, sessions, queues

---

## 🔐 Sécurité

L'architecture implémente:

✅ **Authentication**: JWT avec refresh tokens
✅ **Authorization**: RBAC granulaire
✅ **Encryption**: AES-256-GCM pour données sensibles
✅ **Rate Limiting**: Protection DDoS
✅ **Input Validation**: class-validator sur tous les DTOs
✅ **SQL Injection**: Protection via Prisma
✅ **XSS**: Sanitization automatique
✅ **CSRF**: Protection helmet.js
✅ **Audit Logging**: Tous les événements tracés
✅ **GDPR**: Right to be forgotten, data export

---

## 📈 Performance

Optimisations intégrées:

- ⚡ **Cache Redis**: Réponses API cachées
- ⚡ **Query Optimization**: Index DB, pagination
- ⚡ **Compression**: Gzip sur toutes les réponses
- ⚡ **CDN Ready**: Assets statiques optimisés
- ⚡ **Lazy Loading**: Routes React code-splittées
- ⚡ **Background Jobs**: Tests exécutés async dans queues

---

## 🧪 Tests

Stack de tests complète:

```bash
# Backend
npm run test              # Unit tests (Vitest)
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report

# Frontend
npm run test              # Component tests
npm run test:e2e          # E2E tests (Playwright)

# Full CI/CD
git push                  # Déclenche pipeline complet
```

---

## 🚀 Déploiement

### Environnements

1. **Local**: `docker-compose up`
2. **Staging**: Auto-deploy sur push vers `develop`
3. **Production**: Auto-deploy sur push vers `main` (après validation)

### Pipeline CI/CD

Le workflow GitHub Actions exécute automatiquement:

1. ✅ Linting et formatting
2. ✅ Tests unitaires (backend + frontend)
3. ✅ Tests E2E
4. ✅ Security scan (Trivy, npm audit)
5. ✅ Build Docker images
6. ✅ Push vers registry
7. ✅ Deploy sur Kubernetes
8. ✅ Smoke tests post-déploiement
9. ✅ Notifications (Slack)

---

## 📚 Ressources Additionnelles

### Documentation Externe

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)

### Diagrammes

Tous les diagrammes d'architecture sont disponibles dans:
- `ARCHITECTURE_FULLSTACK.md` - Diagrammes textuels
- `docs/architecture/` - Diagrammes PNG (à créer avec draw.io)

---

## 🤝 Contribution

### Workflow Git

```bash
# Feature branch
git checkout -b feature/ma-feature

# Commits conventionnels
git commit -m "feat: add new guardrail category"
git commit -m "fix: resolve race condition in test execution"

# Pull request
gh pr create --base develop
```

### Standards de Code

- **TypeScript**: Strict mode activé
- **ESLint**: Airbnb style guide
- **Prettier**: Formatting automatique
- **Conventional Commits**: Messages standardisés

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/org/repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/org/repo/discussions)
- **Urgent**: Slack #ai-risk-manager

---

## 📝 License

Copyright © 2025 Powered by Globacom3000 / Abbas BENTERKI. Tous droits réservés.

---

## 🎉 Prêt à Commencer ?

1. **Lire**: `ARCHITECTURE_FULLSTACK.md` pour comprendre la vision
2. **Suivre**: `MIGRATION_GUIDE.md` pour migrer progressivement
3. **Coder**: Utiliser les exemples fournis comme base

**Bonne chance avec la migration ! 🚀**
