# Déploiement sur Vercel - AI RISK MANAGER

## 🚀 Déploiement Frontend

### Prérequis

1. Compte Vercel (gratuit) : https://vercel.com/signup
2. Repository GitHub avec le code

### Étapes de Déploiement

#### 1. Connecter le Repository

1. Aller sur https://vercel.com/new
2. Importer le repository GitHub
3. Sélectionner le projet `guardrails_AI_expert`

#### 2. Configuration Build

Vercel détecte automatiquement Vite grâce au `vercel.json` :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### 3. Variables d'Environnement

Ajouter dans les settings Vercel :

**Required** :
- `GEMINI_API_KEY` : Votre clé API Gemini

**Optional (si backend déployé)** :
- `VITE_API_URL` : URL du backend API (ex: `https://api.example.com/api/v1`)
- `VITE_MCP_API_URL` : URL MCP (ex: `https://api.example.com/api/v1/mcp`)
- `VITE_MCP_MOCK_MODE` : `"false"` si backend actif, `"true"` pour mode standalone

#### 4. Déployer

Cliquer sur "Deploy" et attendre ~2 minutes.

### URL de Production

Vercel fournira une URL comme :
- `https://ai-risk-platform-v2.vercel.app` (URL canonique production)
- `https://ai-risk-platform-v2-xxx.vercel.app` (URL unique de chaque deployment)

> **Note (2026-05-11)** : projet renommé `guardrails-ai-expert` → `ai-risk-platform-v2` suite à incident de sécurité. Anciennes URLs `guardrails-ai-expert.vercel.app` désactivées.

---

## 🔧 Déploiement Backend (Optionnel)

Le backend NestJS peut également être déployé sur Vercel.

### Configuration Backend

Créer un `vercel.json` dans le dossier `backend/` :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api-gateway/src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/api-gateway/src/main.ts"
    }
  ]
}
```

### Variables d'Environnement Backend

Dans les settings Vercel du backend :

- `DATABASE_URL` : PostgreSQL connection string (utiliser Vercel Postgres ou Supabase)
- `REDIS_URL` : Redis connection string (utiliser Upstash Redis)
- `JWT_SECRET` : Secret pour JWT
- `ENCRYPTION_KEY` : Clé de chiffrement 32 caractères
- `GEMINI_API_KEY` : Clé API Gemini

---

## 📊 Mode Standalone vs Full-Stack

### Mode Standalone (Frontend uniquement)

**Avantages** :
- Déploiement simple (1 seul service)
- Gratuit sur Vercel
- Aucune base de données nécessaire
- Tout fonctionne dans le navigateur

**Limitations** :
- Pas de persistance multi-utilisateurs
- Pas de collaboration
- Données stockées dans localStorage

**Configuration** :
```env
VITE_MCP_MOCK_MODE=true
```

### Mode Full-Stack (Frontend + Backend)

**Avantages** :
- Persistance en base de données
- Multi-utilisateurs
- Collaboration
- Audit trail complet

**Configuration** :
```env
VITE_API_URL=https://your-backend.vercel.app/api/v1
VITE_MCP_MOCK_MODE=false
```

---

## 🔐 Sécurité

### Variables d'Environnement

**⚠️ IMPORTANT** :
- Ne JAMAIS committer le fichier `.env`
- Utiliser les variables d'environnement Vercel
- Les variables `VITE_*` sont exposées au client (OK pour URLs publiques)
- Les variables backend (JWT_SECRET, etc.) restent privées côté serveur

### CORS

Si vous déployez frontend et backend séparément, configurez CORS :

**Backend** :
```typescript
// apps/api-gateway/src/main.ts
app.enableCors({
  origin: 'https://ai-risk-manager.vercel.app',
  credentials: true
});
```

---

## 🧪 Test du Déploiement

### Vérification Frontend

1. Accéder à l'URL Vercel
2. Vérifier que l'interface se charge
3. Tester l'Assistant Guidé
4. Vérifier les exports PDF/Excel

### Vérification Backend (si déployé)

```bash
# Health check
curl https://your-backend.vercel.app/api/v1/health

# Devrait retourner:
{"status":"ok","timestamp":"...","service":"ai-risk-manager-api-gateway"}
```

---

## 🚨 Dépannage

### Erreur : "Build failed"

**Cause** : Dépendances manquantes ou erreurs TypeScript

**Solution** :
```bash
# Tester localement
npm run build

# Vérifier les erreurs TypeScript
npx tsc --noEmit
```

### Erreur : "404 on reload"

**Cause** : Routing SPA non configuré

**Solution** : Le `vercel.json` contient déjà la configuration :
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Erreur : "API not available"

**Cause** : Backend non déployé ou URL incorrecte

**Solution** :
1. Vérifier `VITE_API_URL` dans les variables d'environnement Vercel
2. Ou mettre `VITE_MCP_MOCK_MODE=true` pour mode standalone

---

## 📈 Performance

### Optimisations Automatiques

Vercel optimise automatiquement :
- Compression Brotli/Gzip
- Cache des assets statiques
- CDN global (Edge Network)
- HTTPS automatique

### Build Optimization

Le build Vite est déjà optimisé :
- Code splitting
- Tree shaking
- Minification
- Import maps pour React/Recharts

---

## 🎯 Checklist Déploiement

### Avant de Déployer

- [ ] Tester localement : `npm run build && npm run preview`
- [ ] Vérifier les variables d'environnement
- [ ] Créer `.env.example` avec les variables nécessaires
- [ ] Mettre à jour `README.md` avec instructions de déploiement
- [ ] Vérifier que `.env` est dans `.gitignore`

### Pendant le Déploiement

- [ ] Connecter le repository GitHub à Vercel
- [ ] Configurer les variables d'environnement
- [ ] Lancer le build
- [ ] Vérifier les logs de build

### Après le Déploiement

- [ ] Tester l'URL de production
- [ ] Vérifier tous les parcours (Débutant, Expert)
- [ ] Tester les exports (PDF, Excel)
- [ ] Vérifier la console navigateur (pas d'erreurs)
- [ ] Tester sur mobile

---

## 🔄 Continuous Deployment

Vercel déploie automatiquement :
- **Push sur `main`** → Déploiement en production
- **Pull Request** → Preview deployment avec URL unique
- **Push sur autre branche** → Preview deployment

### Preview Deployments

Chaque PR génère une URL de preview :
```
https://ai-risk-manager-git-feature-xyz.vercel.app
```

Parfait pour tester avant de merger !

---

## 📞 Support

- **Vercel Docs** : https://vercel.com/docs
- **Vite Docs** : https://vitejs.dev/guide/build.html
- **NestJS Vercel** : https://docs.nestjs.com/deployment#vercel

---

## ✅ Prêt pour Vercel !

L'application est maintenant **prête à être déployée** sur Vercel avec :

✅ Configuration `vercel.json` optimisée
✅ Build script configuré
✅ Variables d'environnement documentées
✅ Routing SPA fonctionnel
✅ Support mode standalone ET full-stack

**Déployez maintenant** : https://vercel.com/new 🚀
