# ✅ Intégration MCP Complète - AI RISK MANAGER

## 🎉 Résumé de l'Implémentation

L'architecture MCP (Model Context Protocol) a été **complètement implémentée** dans l'application AI RISK MANAGER. Le chatbot est maintenant capable de requêter toutes les données de l'application en temps réel pour fournir des réponses contextualisées et précises.

## 📦 Fichiers Créés

### Backend (NestJS)

1. **`backend/apps/api-gateway/src/mcp/mcp.controller.ts`**
   - Contrôleur REST pour exposer les outils MCP
   - Routes: `/api/v1/mcp/query` et `/api/v1/mcp/tools/list`
   - Protection JWT + Swagger documentation

2. **`backend/apps/api-gateway/src/mcp/mcp.service.ts`**
   - Service principal avec 12 outils MCP
   - Intégration complète avec Prisma ORM
   - Requêtes optimisées sur PostgreSQL

3. **`backend/apps/api-gateway/src/mcp/mcp.module.ts`**
   - Module NestJS pour MCP
   - Exportation des services

4. **`backend/apps/api-gateway/src/mcp/dto/mcp.dto.ts`**
   - DTOs pour validation des requêtes/réponses MCP

### Frontend (React)

5. **`services/mcpClientService.ts`**
   - Service client MCP complet
   - Routage intelligent des requêtes
   - Mode mock automatique en cas d'échec
   - Fonction `getRelevantContext()` pour analyse de questions

### Fichiers Modifiés

6. **`services/geminiService.ts`**
   - Intégration MCP dans la fonction `chat()`
   - Récupération automatique du contexte
   - Prompt enrichi avec données réelles

7. **`components/chatbot/ChatbotModern.tsx`**
   - Mise à jour pour utiliser le mode de chat
   - Passage du paramètre `mode` à `geminiService.chat()`

8. **`backend/apps/api-gateway/src/app.module.ts`**
   - Ajout du `McpModule` aux imports

9. **`.env.example`**
   - Configuration MCP ajoutée:
     - `VITE_MCP_API_URL`
     - `VITE_MCP_MOCK_MODE`

### Documentation

10. **`MCP_ARCHITECTURE.md`**
    - Architecture complète du système MCP
    - Documentation des 12 outils
    - Exemples d'utilisation
    - Diagrammes et flux de données

11. **`MCP_INTEGRATION_COMPLETE.md`** (ce fichier)
    - Guide de déploiement et configuration

## 🛠️ Les 12 Outils MCP Disponibles

| # | Outil | Description | Paramètres |
|---|-------|-------------|------------|
| 1 | `search_ai_policies` | Recherche dans les 22 règles SIA CLUSIF | query, reference, status, limit |
| 2 | `get_policy_by_reference` | Obtenir une politique spécifique (ex: SIA-01) | reference (requis) |
| 3 | `search_test_results` | Résultats de tests guardrails | status, category, limit |
| 4 | `get_test_statistics` | Statistiques globales des tests | - |
| 5 | `search_use_cases` | Cas d'usage et risques | query, minRisk, limit |
| 6 | `search_threat_profiles` | Profils de menaces | query, limit |
| 7 | `search_vulnerabilities` | CVE et vulnérabilités OWASP | query, owaspCategory, minSeverity, limit |
| 8 | `search_defenses` | Défenses et mitigations | query |
| 9 | `get_owasp_categories` | Catégories OWASP LLM Top 10 | - |
| 10 | `search_prompt_templates` | Templates de prompts d'attaque | category, complexity, attackFamily, limit |
| 11 | `get_test_targets` | Cibles de test configurées | - |
| 12 | `analyze_risk_trends` | Tendances de risques | - |

## 🚀 Démarrage et Configuration

### Prérequis

1. **Base de données PostgreSQL** configurée et initialisée
2. **Redis** pour cache et queues (optionnel pour dev)
3. **Node.js 18+** et npm

### Étape 1: Configuration de l'Environnement

Créez un fichier `.env` à la racine du projet:

```bash
# Copier le template
cp .env.example .env
```

Configurez les variables essentielles:

```env
# Database
DATABASE_URL="postgresql://airiskmgr:password@localhost:5432/airiskmgr_db"

# JWT (générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=votre-secret-jwt-ici

# Gemini API
GEMINI_API_KEY=votre-cle-gemini-ici

# MCP Configuration
VITE_MCP_API_URL=http://localhost:3001/api/v1/mcp
VITE_MCP_MOCK_MODE=false

# Application
NODE_ENV=development
PORT=3001
```

### Étape 2: Initialiser la Base de Données

```bash
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer la base de données
npx prisma db push

# Peupler avec données de démo
npx prisma db seed
```

Cela créera:
- 2 organisations (Demo Organization, Enterprise Corp)
- 3 utilisateurs (admin, tester, analyst)
- Credentials: `admin@demo.airiskmgr.com` / `Demo123!`
- 2 test targets (OpenAI, RAG System)
- Templates de prompts d'attaque
- Politiques AI (POL-001, POL-002, POL-003)

### Étape 3: Démarrer le Backend

```bash
cd backend
npm run start:dev
```

Le backend démarre sur `http://localhost:3001`

Vérifiez:
- API: http://localhost:3001/api/v1/
- Swagger: http://localhost:3001/api/docs
- MCP Tools: http://localhost:3001/api/v1/mcp/tools/list

### Étape 4: Démarrer le Frontend

```bash
# À la racine du projet
npm run dev
```

Le frontend démarre sur `http://localhost:5083` (ou autre port disponible)

## 🧪 Tester l'Intégration MCP

### Test 1: Vérifier les Outils MCP

Ouvrir la console navigateur et tester:

```javascript
// Importer le service
import { mcpClient } from './services/mcpClientService';

// Lister les outils disponibles
const tools = await mcpClient.listTools();
console.log(tools); // Devrait afficher 12 outils

// Rechercher une politique
const policy = await mcpClient.getPolicy('SIA-01');
console.log(policy);

// Obtenir les statistiques
const stats = await mcpClient.getTestStatistics();
console.log(stats);
```

### Test 2: Utiliser le Chatbot

1. Ouvrir l'application: http://localhost:5083
2. Cliquer sur le bouton FAB du chatbot (en bas à droite)
3. Poser une question:

**Questions de test recommandées:**

```
"Qu'est-ce que la règle SIA-01?"
→ Le chatbot devrait récupérer la politique depuis PostgreSQL

"Quels sont les résultats de mes tests?"
→ Devrait afficher les statistiques réelles

"Montre-moi les vulnérabilités OWASP"
→ Devrait lister les vulnérabilités de la DB

"Explique-moi l'injection de prompt"
→ Devrait combiner connaissances + données de l'app
```

### Test 3: Vérifier les Logs

Dans la console navigateur, recherchez:
```
🔍 Fetching relevant context from MCP...
💬 Sending to Gemini with context: Yes
```

Cela confirme que le contexte MCP est bien récupéré.

### Test 4: Mode Mock (Sans Backend)

Si le backend n'est pas disponible:

1. Modifier `.env`:
   ```env
   VITE_MCP_MOCK_MODE=true
   ```

2. Recharger l'application
3. Le chatbot utilisera des données mock mais restera fonctionnel

## 📊 Exemple de Flux Complet

```
Utilisateur: "Explique-moi SIA-03"
     │
     ▼
ChatbotModern → geminiService.chat("Explique-moi SIA-03", 'normal')
     │
     ├─▶ mcpClient.getRelevantContext("Explique-moi SIA-03")
     │      │
     │      ├─▶ Détecte "SIA-03" dans la question
     │      │
     │      ├─▶ POST /api/v1/mcp/query
     │      │   {
     │      │     tool: "get_policy_by_reference",
     │      │     parameters: { reference: "SIA-03" }
     │      │   }
     │      │
     │      ├─▶ Backend: McpService.getPolicyByReference()
     │      │      │
     │      │      └─▶ Prisma: aIPolicy.findFirst({ where: { reference: "SIA-03" } })
     │      │             │
     │      │             └─▶ PostgreSQL → SELECT * FROM AIPolicy WHERE reference = 'SIA-03'
     │      │
     │      └─▶ Retour: { found: true, policy: { ... GRC complet ... } }
     │
     ├─▶ Construit prompt:
     │   "Tu es un assistant...
     │    📊 CONTEXTE: [Données SIA-03 complètes]
     │    QUESTION: Explique-moi SIA-03"
     │
     └─▶ Gemini API → Réponse avec contexte réel de l'application
```

## 🔒 Sécurité

L'intégration MCP respecte les bonnes pratiques de sécurité:

✅ **Authentification JWT** sur toutes les routes MCP
✅ **Isolation multi-tenant** par `organizationId`
✅ **Rate limiting** (100 req/min par défaut)
✅ **Validation des entrées** avec class-validator
✅ **Logs d'audit** automatiques
✅ **CORS** configuré
✅ **Helmet** pour headers de sécurité

## 📈 Prochaines Étapes

### Optimisations Possibles

1. **Cache Redis** pour contextes fréquents
   ```typescript
   // Dans mcpService.ts
   @Cacheable({ ttl: 300 }) // 5 minutes
   async searchAIPolicies() { ... }
   ```

2. **Pagination** pour grandes collections
3. **Recherche full-text** avec PostgreSQL tsvector
4. **Webhooks** pour notifications temps réel
5. **Métriques Prometheus** pour monitoring MCP
6. **Tests automatisés** (Jest + Supertest)

### Fonctionnalités Avancées

- **Multi-langue**: Détection automatique de la langue
- **Suggestions**: Auto-complétion basée sur MCP
- **Export contexte**: Permettre export du contexte récupéré
- **Feedback loop**: Améliorer routage avec machine learning

## 🐛 Dépannage

### Problème: Chatbot ne récupère pas le contexte

**Vérifier:**
1. Backend actif sur port 3001
2. Variables `.env` correctes
3. Console navigateur pour erreurs
4. Logs backend: `backend/logs/`

**Solution temporaire:**
```env
VITE_MCP_MOCK_MODE=true
```

### Problème: Erreur 401 Unauthorized

**Cause:** Pas de token JWT

**Solution:** Implémenter authentification ou retirer `@UseGuards(JwtAuthGuard)` pour dev:
```typescript
// backend/apps/api-gateway/src/mcp/mcp.controller.ts
// Commenter temporairement pour dev:
// @UseGuards(JwtAuthGuard)
```

### Problème: Base de données vide

**Solution:**
```bash
cd backend
npx prisma db seed
```

## 📚 Ressources

- **Architecture MCP**: `MCP_ARCHITECTURE.md`
- **API Docs**: http://localhost:3001/api/docs
- **Prisma Schema**: `backend/prisma/schema.prisma`
- **Code Client MCP**: `services/mcpClientService.ts`
- **Code Serveur MCP**: `backend/apps/api-gateway/src/mcp/`

## ✅ Checklist de Vérification

- [x] Backend NestJS avec module MCP créé
- [x] 12 outils MCP implémentés
- [x] Client MCP frontend créé
- [x] Chatbot intégré avec MCP
- [x] Routage intelligent des questions
- [x] Mode mock pour développement offline
- [x] Configuration environnement (.env.example)
- [x] Documentation complète (MCP_ARCHITECTURE.md)
- [x] Base de données PostgreSQL avec schéma complet
- [x] Seed data pour tests

## 🎯 Résultat

Le chatbot AI RISK MANAGER est maintenant un **véritable assistant intelligent** qui:

1. ✅ Comprend les questions en français
2. ✅ Identifie les données pertinentes à récupérer
3. ✅ Requête PostgreSQL via MCP
4. ✅ Enrichit le contexte Gemini avec données réelles
5. ✅ Fournit des réponses précises et contextualisées
6. ✅ Fonctionne en mode offline (mock) si besoin

**Le système est prêt à l'emploi! 🚀**

---

**Auteur:** AI RISK MANAGER Development Team
**Date:** 2025-10-27
**Version:** 1.0.0
