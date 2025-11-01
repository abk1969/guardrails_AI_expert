# 🚀 Configuration Fullstack avec Gemini Sécurisé - Guide Complet

## ✅ Ce Qui a Été Fait

### 1. Correction Sécurité
- ✅ Clé API Gemini retirée du frontend (plus de `VITE_GEMINI_API_KEY`)
- ✅ Clé API sécurisée côté backend uniquement (`GEMINI_API_KEY`)
- ✅ Service sécurisé créé: `geminiServiceSecure.ts`

### 2. Backend NestJS Configuré
- ✅ Module Gemini créé (`backend/apps/api-gateway/src/gemini/`)
- ✅ Service Gemini avec API @google/genai
- ✅ Controller avec 2 endpoints:
  - `POST /api/v1/gemini/generate-prompts`
  - `POST /api/v1/gemini/chat`
- ✅ DTOs pour validation
- ✅ Documentation Swagger intégrée
- ✅ Module ajouté à AppModule

### 3. Fichiers Créés

**Backend:**
```
backend/
├── .env                                      # Configuration avec GEMINI_API_KEY
├── apps/api-gateway/src/gemini/
│   ├── gemini.module.ts                      # Module NestJS
│   ├── gemini.controller.ts                  # Endpoints REST
│   ├── gemini.service.ts                     # Logique métier + appels Gemini
│   └── dto/
│       ├── generate-prompts.dto.ts           # DTO génération prompts
│       └── chat.dto.ts                       # DTO chat
```

**Frontend:**
```
services/geminiServiceSecure.ts               # Service sécurisé (appels backend)
```

**Documentation:**
```
SECURITY_FIX_GEMINI_KEY.md                   # Explication sécurité
FULLSTACK_GEMINI_SETUP.md                    # Ce fichier
```

---

## 🚀 Démarrage Rapide

### Option 1: Avec Scripts PowerShell (Recommandé)

```powershell
# Terminal 1: Backend
.\dev.ps1 start
# Choisir option "2) Frontend + Backend (fullstack)"

# OU manuellement:
cd backend
npm run start:dev

# Terminal 2: Frontend (si démarrage manuel)
npm run dev
```

### Option 2: Docker (Tous les services)

```powershell
docker-compose up -d
```

---

## 📋 Vérification Étape par Étape

### Étape 1: Vérifier la Configuration

**Backend (.env):**
```bash
cat backend/.env | grep GEMINI_API_KEY
# Devrait afficher: GEMINI_API_KEY=AIzaSy...
```

**Frontend (.env):**
```bash
cat .env | grep GEMINI
# Devrait afficher: GEMINI_API_KEY=AIzaSy... (sans VITE_)
```

### Étape 2: Installer les Dépendances

```bash
# Backend (si pas déjà fait)
cd backend
npm install

# Frontend (si pas déjà fait)
npm install
```

### Étape 3: Démarrer PostgreSQL et Redis

```powershell
# Option A: Docker Compose
docker-compose up -d postgres redis

# Option B: Vérifier s'ils sont déjà démarrés
docker ps | grep -E "postgres|redis"
```

### Étape 4: Démarrer le Backend

```bash
cd backend
npm run start:dev
```

**Vérifications:**
- ✅ Le backend démarre sur http://localhost:3001
- ✅ Aucune erreur "GEMINI_API_KEY not configured"
- ✅ Message: "Gemini AI service initialized successfully"

**Logs attendus:**
```
[NestApplication] Nest application successfully started
[RouterExplorer] Mapped {/api/v1/gemini/generate-prompts, POST} route
[RouterExplorer] Mapped {/api/v1/gemini/chat, POST} route
```

### Étape 5: Tester l'API Backend

**Test 1: Health Check**
```bash
curl http://localhost:3001/api/v1/health
# Devrait retourner: {"status":"ok"}
```

**Test 2: Génération de Prompts**
```bash
curl -X POST http://localhost:3001/api/v1/gemini/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Sécurité et Confidentialité"],
    "count": 5,
    "complexities": ["Simple"]
  }'
```

**Réponse attendue:**
```json
{
  "prompts": [
    {
      "id": "prompt-gen-xxx",
      "text": "...",
      "category": "Sécurité et Confidentialité",
      "complexity": "Simple",
      "templateId": "generated-by-ai-backend"
    }
  ]
}
```

**Test 3: Chat**
```bash
curl -X POST http://localhost:3001/api/v1/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, comment vas-tu?"
  }'
```

### Étape 6: Démarrer le Frontend

```bash
# Dans un nouveau terminal
npm run dev
```

**Vérifications:**
- ✅ Frontend démarre sur http://localhost:5080
- ✅ Aucune erreur dans la console
- ✅ Variable `VITE_GEMINI_API_KEY` est `undefined`

### Étape 7: Tester l'Intégration Frontend-Backend

1. **Ouvrir l'application:** http://localhost:5080

2. **Ouvrir DevTools (F12)**

3. **Console - Vérifier sécurité:**
```javascript
console.log(import.meta.env.VITE_GEMINI_API_KEY);
// Doit afficher: undefined ✅

console.log(import.meta.env.GEMINI_API_KEY);
// Doit afficher: undefined ✅
```

4. **Tester génération de prompts:**
   - Aller au Tableau de bord
   - Sélectionner une catégorie
   - Choisir "Simple", 10 prompts
   - Lancer le test
   - **Vérifier Network tab (F12):** Appel à `/api/v1/gemini/generate-prompts`

---

## 🔧 Architecture Finale

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser    │────────→│  Backend NestJS  │────────→│   Gemini    │
│  (Frontend)  │  HTTPS  │   (Port 3001)    │   API   │     API     │
│              │         │                  │         │             │
│ ✅ Pas de clé│         │ ✅ GEMINI_API_KEY│         │             │
│    API       │         │   (sécurisé)     │         │             │
└──────────────┘         └──────────────────┘         └─────────────┘
```

---

## 📊 Endpoints Disponibles

### 1. Génération de Prompts
**URL:** `POST /api/v1/gemini/generate-prompts`

**Body:**
```json
{
  "categories": [
    "Sécurité et Confidentialité",
    "Pertinence et Réponse"
  ],
  "count": 10,
  "complexities": ["Simple", "Moyen"]
}
```

**Réponse:**
```json
{
  "prompts": [
    {
      "id": "prompt-gen-uuid",
      "text": "Prompt généré...",
      "category": "Sécurité et Confidentialité",
      "complexity": "Simple",
      "templateId": "generated-by-ai-backend"
    }
  ]
}
```

### 2. Chat
**URL:** `POST /api/v1/gemini/chat`

**Body:**
```json
{
  "message": "Comment améliorer ma sécurité AI?",
  "context": {
    "testResults": [...],
    "currentModule": "dashboard"
  }
}
```

**Réponse:**
```json
{
  "response": "Pour améliorer votre sécurité AI..."
}
```

---

## 🐛 Dépannage

### Erreur: "GEMINI_API_KEY not configured"

**Cause:** backend/.env manquant ou incorrect

**Solution:**
```bash
# Vérifier
cat backend/.env | grep GEMINI_API_KEY

# Si vide, ajouter
echo "GEMINI_API_KEY=AIzaSy..." >> backend/.env

# Redémarrer backend
cd backend && npm run start:dev
```

### Erreur: "Cannot connect to backend"

**Cause:** Backend non démarré ou mauvaise URL

**Solution:**
```bash
# 1. Vérifier que backend tourne
curl http://localhost:3001/api/v1/health

# 2. Vérifier .env frontend
cat .env | grep VITE_API_URL
# Devrait être: VITE_API_URL=http://localhost:3001/api/v1

# 3. Redémarrer frontend
npm run dev
```

### Erreur: "Failed to initialize Gemini service"

**Cause:** Clé API invalide ou expirée

**Solution:**
1. Aller sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Vérifier/Régénérer la clé
3. Mettre à jour `backend/.env`
4. Redémarrer backend

### Frontend utilise toujours la clé directement

**Cause:** Ancien code non mis à jour

**Solution:**
```typescript
// ❌ Ancien (NON SÉCURISÉ)
import { generateTestPrompts } from './services/geminiService';

// ✅ Nouveau (SÉCURISÉ)
import { generateTestPromptsSecure } from './services/geminiServiceSecure';

// Mettre à jour tous les imports
```

### Erreur CORS

**Cause:** Backend ne permet pas l'origine du frontend

**Solution:**
```bash
# Vérifier backend/.env
cat backend/.env | grep CORS_ORIGIN

# Devrait contenir:
# CORS_ORIGIN=http://localhost:5080  # Pour mode standalone
# CORS_ORIGIN=http://localhost:3004  # Pour mode Docker

# Redémarrer backend après modification
```

---

## 📚 Prochaines Étapes

### 1. Utiliser le Service Sécurisé dans le Frontend

Créez ou modifiez les composants pour utiliser `geminiServiceSecure.ts`:

```typescript
// components/TestConfiguration.tsx (exemple)
import { generateTestPromptsSecure } from '../services/geminiServiceSecure';

const handleGeneratePrompts = async () => {
  try {
    const prompts = await generateTestPromptsSecure(
      selectedCategories,
      promptCount,
      selectedComplexities
    );

    console.log('Prompts générés de manière sécurisée:', prompts);
    // Utiliser les prompts...

  } catch (error) {
    console.error('Erreur génération sécurisée:', error);
    // Fallback vers mock si nécessaire
  }
};
```

### 2. Activer Swagger UI

**URL:** http://localhost:3001/api/docs

**Documentation auto-générée** avec:
- Schémas de données
- Exemples de requêtes
- Test interactif des endpoints

### 3. Monitoring

**Vérifier les logs backend:**
```bash
# Logs en temps réel
cd backend && npm run start:dev

# Chercher des erreurs
cd backend && npm run start:dev 2>&1 | grep -i error
```

---

## ✅ Checklist Finale

- [ ] `backend/.env` existe avec `GEMINI_API_KEY`
- [ ] `.env` (frontend) a `GEMINI_API_KEY` (sans VITE_)
- [ ] Backend démarre sans erreur
- [ ] Endpoints `/api/v1/gemini/*` accessibles
- [ ] Tests curl réussissent
- [ ] Frontend démarre
- [ ] DevTools confirme: pas de clé API côté client
- [ ] Génération de prompts fonctionne
- [ ] Chat fonctionne
- [ ] Aucune erreur CORS

---

## 🎯 Résumé

**Avant (NON SÉCURISÉ):**
```
Frontend ──(VITE_GEMINI_API_KEY)──> Gemini API ❌
```

**Après (SÉCURISÉ):**
```
Frontend ──> Backend ──(GEMINI_API_KEY)──> Gemini API ✅
```

**Avantages:**
- ✅ Clé API jamais exposée
- ✅ Contrôle côté serveur
- ✅ Rate limiting possible
- ✅ Monitoring centralisé
- ✅ Logs sécurisés

---

**Date:** 2025-10-31
**Version:** 1.0.0
**Statut:** ✅ Prêt pour le test
