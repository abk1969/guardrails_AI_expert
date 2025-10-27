# 🚀 Guide Rapide - Test MCP sans Backend Complet

## Situation Actuelle

- ✅ **Frontend**: Actif sur http://localhost:5085
- ✅ **MCP Client**: Intégré dans le chatbot
- ✅ **MCP Server**: Code créé dans `backend/apps/api-gateway/src/mcp/`
- ⏳ **Backend**: Pas encore démarré (nécessite installation)

## Option 1: Tester avec Mode Mock (IMMÉDIAT)

### Activer le Mode Mock

Le frontend est déjà configuré pour basculer automatiquement en mode mock si le backend n'est pas disponible.

1. **Ouvrir le Chatbot**:
   - Aller sur http://localhost:5085
   - Cliquer sur le bouton FAB du chatbot (en bas à droite)

2. **Tester les Questions**:
   ```
   "Qu'est-ce que la règle SIA-01?"
   "Explique-moi les risques d'injection de prompt"
   "Quelles sont les vulnérabilités OWASP?"
   ```

3. **Vérifier les Logs**:
   - Ouvrir la console navigateur (F12)
   - Rechercher:
     ```
     🔍 Fetching relevant context from MCP...
     Mock MCP query: search_ai_policies
     💬 Sending to Gemini with context: Yes
     ```

Le chatbot **fonctionne déjà** avec des données mock!

## Option 2: Démarrer le Backend Complet

### Prérequis

```bash
# Installer Node.js 18+ si ce n'est pas déjà fait
node --version

# Installer PostgreSQL
# https://www.postgresql.org/download/
```

### Étape 1: Configuration Base de Données

Créer un fichier `.env` dans le dossier `backend/`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/airiskmgr_db"
JWT_SECRET=dev-secret-key-change-me
ENCRYPTION_KEY=dev-32-char-encryption-key-change
GEMINI_API_KEY=votre-cle-gemini
PORT=3001
```

### Étape 2: Installation Backend

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

### Étape 3: Démarrer le Backend

```bash
# Depuis le dossier backend/
npm run start:dev
```

Le backend démarre sur **http://localhost:3001**

### Étape 4: Vérifier l'API MCP

```bash
# Tester l'endpoint MCP (nécessite authentification)
curl http://localhost:3001/api/v1/mcp/tools/list

# Voir la documentation Swagger
# http://localhost:3001/api/docs
```

### Étape 5: Tester le Chatbot avec Backend Réel

1. Le frontend détectera automatiquement le backend
2. Les requêtes MCP iront vers PostgreSQL
3. Dans la console, vous verrez:
   ```
   🔍 Fetching relevant context from MCP...
   (pas de message "Mock MCP query")
   💬 Sending to Gemini with context: Yes
   ```

## Option 3: Utiliser Docker (RECOMMANDÉ)

Si vous avez Docker installé:

```bash
# À la racine du projet
docker compose up -d

# Attendre que tous les services démarrent (environ 30 secondes)

# Initialiser la base de données
docker compose exec api-gateway npx prisma generate
docker compose exec api-gateway npx prisma db push
docker compose exec api-gateway npx prisma db seed

# Accéder à l'application
# Frontend: http://localhost:3000
# API: http://localhost:3001
# Adminer (DB UI): http://localhost:8080
```

## Tester l'Intégration MCP

### Questions à Poser au Chatbot

Pour vérifier que le MCP fonctionne, testez ces questions:

#### 1. Politiques IA (SIA)
```
"Qu'est-ce que la règle SIA-01?"
"Montre-moi toutes les règles SIA sur la sécurité"
"Explique SIA-03"
```

#### 2. Tests Guardrails
```
"Quels sont mes résultats de tests?"
"Combien de tests ont échoué?"
"Montre-moi les statistiques"
```

#### 3. Vulnérabilités
```
"Quelles vulnérabilités OWASP connaissons-nous?"
"Montre-moi les CVE critiques"
"Explique OWASP LLM01"
```

#### 4. Cas d'Usage
```
"Quels sont les risques principaux?"
"Montre-moi les cas d'usage à haut risque"
"Quelles sont nos évaluations de risques?"
```

### Vérifier les Logs

**Console Navigateur (F12)**:
- `🔍 Fetching relevant context from MCP...` - MCP client actif
- `Mock MCP query: ...` - Mode mock (backend absent)
- `💬 Sending to Gemini with context: Yes` - Contexte récupéré
- `💬 Sending to Gemini with context: No` - Pas de contexte trouvé

**Backend Logs** (si backend actif):
```
[McpService] Executing MCP tool: search_ai_policies
[McpService] Found 22 policies matching query
```

## Architecture Actuelle

```
┌─────────────────────────────────────────┐
│  Frontend (http://localhost:5085)      │
│  ✅ Actif                               │
│                                          │
│  ChatbotModern                          │
│       ↓                                  │
│  geminiService.chat()                   │
│       ↓                                  │
│  mcpClient.getRelevantContext()         │
│       ↓                                  │
│  [Mode Mock Actif]                      │
│  - Mock data pour politiques            │
│  - Mock data pour statistiques          │
│  - Mock data pour OWASP                 │
│       ↓                                  │
│  Gemini API (avec contexte mock)        │
│       ↓                                  │
│  Réponse ✅                             │
└─────────────────────────────────────────┘
```

## Comparaison Mode Mock vs Backend Réel

| Fonctionnalité | Mode Mock | Backend Réel |
|----------------|-----------|--------------|
| Chatbot fonctionne | ✅ Oui | ✅ Oui |
| Données contextuelles | Mock (exemples) | PostgreSQL (réelles) |
| 22 règles SIA | Exemples limités | Toutes disponibles |
| Statistiques tests | Fictives | Réelles de la DB |
| Vulnérabilités | Exemples | CVE réels |
| Performance | Rapide | Dépend du réseau |
| Nécessite backend | ❌ Non | ✅ Oui |

## Prochaines Étapes

### Pour Développement Rapide (Mode Mock)
1. ✅ Le chatbot est déjà fonctionnel
2. ✅ Tester avec questions d'exemple
3. ✅ Développer l'UI sans backend

### Pour Intégration Complète (Backend Réel)
1. Installer PostgreSQL
2. Configurer `.env` backend
3. `npm install` dans `backend/`
4. `npx prisma db push && npx prisma db seed`
5. `npm run start:dev`
6. Tester avec données réelles

### Pour Production (Docker)
1. `docker compose up -d`
2. Initialiser la DB dans le conteneur
3. Tout est prêt!

## Support

- **Mode Mock**: Fonctionne immédiatement, aucune configuration nécessaire
- **Backend Local**: Nécessite Node.js, PostgreSQL, et configuration
- **Docker**: Nécessite Docker Desktop, mais tout est automatisé

## État Actuel du Projet

✅ **Prêt à utiliser**:
- Frontend avec chatbot moderne
- MCP Client intégré
- Mode mock fonctionnel
- Interface complète AI RISK MANAGER

⏳ **Nécessite configuration**:
- Backend NestJS (code prêt, installation nécessaire)
- PostgreSQL (pour données réelles)
- Authentification JWT

🎯 **Recommandation**:
Commencez par tester le mode mock pour valider l'UX, puis configurez le backend quand vous voulez intégrer les données réelles.

---

**Le chatbot MCP est fonctionnel dès maintenant avec le mode mock! 🎉**
