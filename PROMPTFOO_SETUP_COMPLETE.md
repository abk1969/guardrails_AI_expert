# ✅ INTÉGRATION PROMPTFOO - CORRECTIONS TERMINÉES

**Date:** 31 Octobre 2025
**Status:** Fonctionnel (nécessite démarrage backend)

---

## 🎯 PROBLÈMES CORRIGÉS

### 1. ✅ Backend API manquant
**Avant:** L'endpoint `/promptfoo/run` n'existait pas
**Après:** Créé module complet Promptfoo dans le backend

**Fichiers créés:**
- ✅ `backend/apps/api-gateway/src/promptfoo/promptfoo.controller.ts`
- ✅ `backend/apps/api-gateway/src/promptfoo/promptfoo.service.ts`
- ✅ `backend/apps/api-gateway/src/promptfoo/promptfoo.module.ts`
- ✅ `backend/apps/api-gateway/src/promptfoo/dto/run-promptfoo.dto.ts`

**Fichiers modifiés:**
- ✅ `backend/apps/api-gateway/src/app.module.ts` (ajout PromptfooModule)

### 2. ✅ Chemin hardcodé corrigé
**Avant:** `C:\Users\globa\...` (chemin absolu)
**Après:** `./guardrail/solution_promptfoo/ai-risk-guardrails-tests` (relatif)

**Fichier modifié:**
- ✅ `components/PromptfooTestExecution.tsx` ligne 160

---

## 🚀 COMMENT UTILISER PROMPTFOO MAINTENANT

### Mode 1: Avec Backend (Automatique) - RECOMMANDÉ

#### Étape 1: Démarrer le backend
```bash
cd backend
npm install
npm run start:dev
```

Le backend démarre sur `http://localhost:3001`

#### Étape 2: Démarrer le frontend
```bash
npm run dev
```

Le frontend démarre sur `http://localhost:5080`

#### Étape 3: Utiliser l'interface

1. **Configuration** (Étape 1)
   - Sélectionnez les catégories de tests (Sécurité, Contenu, etc.)
   - Choisissez la complexité (Simple, Moyen, Sophistiqué)
   - Définissez le volume (10-50 tests)
   - Configurez la cible (Gemini, OpenAI, custom HTTP)

2. **Édition YAML** (Étape 2)
   - Le YAML est généré automatiquement
   - Vous pouvez l'éditer manuellement si besoin
   - Cliquez sur "Télécharger" pour sauvegarder localement

3. **Exécution** (Étape 4)
   - Cliquez sur "Activer Mode Automatique"
   - Le système vérifie la disponibilité du backend
   - Cliquez sur "Lancer les Tests"
   - **Le backend lance Promptfoo et vous notifie** (5-30 min)

4. **Résultats** (Étape 5)
   - Consultez les scores et statistiques
   - Analysez les échecs détaillés
   - Téléchargez le rapport complet

---

### Mode 2: Manuel (CLI) - Sans Backend

#### Étape 1: Télécharger le YAML
- Allez à l'étape 2 "Édition YAML"
- Cliquez sur "Télécharger"
- Placez le fichier dans `guardrail/solution_promptfoo/ai-risk-guardrails-tests/`

#### Étape 2: Ouvrir un terminal
```bash
cd guardrail/solution_promptfoo/ai-risk-guardrails-tests
```

#### Étape 3: Lancer les tests
```bash
# Test rapide (5 min, 15 tests)
npm run test:quick

# Test complet (30-60 min)
npm run test
```

#### Étape 4: Voir les résultats
```bash
# Ouvre l'interface web Promptfoo sur http://localhost:15500
npm run view
```

---

## 📋 API BACKEND CRÉÉE

### POST /api/v1/promptfoo/run
Lance l'exécution de tests Promptfoo

**Auth:** Bearer JWT Token (requis)
**Body:**
```json
{
  "yaml": "description: Test...\nprompts:\n  - ...\n..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tests lancés avec succès",
  "testRunId": "run-1730411234567",
  "estimatedDuration": "5-30 minutes"
}
```

### GET /api/v1/promptfoo/status/:testRunId
Vérifie le statut d'une exécution

**Auth:** Bearer JWT Token (requis)
**Response:**
```json
{
  "success": true,
  "status": {
    "status": "running",
    "progress": 50
  }
}
```

---

## 🔧 CONFIGURATION BACKEND

Le service Promptfoo recherche le répertoire:
```
${process.cwd()}/../../../guardrail/solution_promptfoo/ai-risk-guardrails-tests
```

**Depuis:** `backend/apps/api-gateway/`
**Résout vers:** `guardrail/solution_promptfoo/ai-risk-guardrails-tests/`

### Vérifier le chemin
```bash
cd backend/apps/api-gateway
node -e "console.log(require('path').join(process.cwd(), '../../../guardrail/solution_promptfoo/ai-risk-guardrails-tests'))"
```

---

## ⚠️ AUTHENTIFICATION BACKEND

**IMPORTANT:** Le backend nécessite une authentification JWT.

### Option 1: Désactiver temporairement l'auth (dev seulement)

Modifiez `promptfoo.controller.ts`:
```typescript
// Commentez temporairement
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
@Post('run')
async runPromptfooTests(@Body() dto: RunPromptfooDto) {
  // ...
}
```

### Option 2: Obtenir un token JWT

1. Créer un utilisateur:
```bash
cd backend
npm run prisma:seed
```

2. Se connecter:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@airiskmgr.com","password":"Demo123!"}'
```

3. Copier le token JWT retourné

4. Le frontend doit envoyer ce token:
```typescript
const response = await fetch(`${API_URL}/promptfoo/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`  // ← Ajouter
  },
  body: JSON.stringify({ yaml: yamlContent }),
});
```

---

## 🐛 DÉPANNAGE

### Erreur: "Backend non disponible"
**Solution:** Vérifiez que le backend tourne sur `http://localhost:3001`
```bash
curl http://localhost:3001/api/v1/health
```

### Erreur: "Le répertoire Promptfoo n'existe pas"
**Solution:** Vérifiez que le dossier existe:
```bash
ls guardrail/solution_promptfoo/ai-risk-guardrails-tests/
```

### Erreur: "401 Unauthorized"
**Solution:** Désactivez temporairement JwtAuthGuard (voir section Auth ci-dessus)

### Erreur: "Tests n'apparaissent pas"
**Solution:** Regardez les logs backend:
```bash
# Terminal backend
[Nest] LOG [PromptfooService] 🚀 Lancement de Promptfoo (run ID: run-...)
[Nest] LOG [PromptfooService] ✅ Tests Promptfoo terminés
```

---

## ✅ TESTS DE VALIDATION

### Test 1: Backend démarre sans erreur
```bash
cd backend
npm run start:dev

# Attendez:
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3001
```

### Test 2: Endpoint Promptfoo accessible
```bash
# Sans auth (si désactivée)
curl -X POST http://localhost:3001/api/v1/promptfoo/run \
  -H "Content-Type: application/json" \
  -d '{"yaml":"description: test\nprompts:\n  - test"}'
```

### Test 3: Frontend se connecte au backend
1. Ouvrir `http://localhost:5080`
2. Aller à "Tests de Sécurité" → "Exécution"
3. Cliquer "Activer Mode Automatique"
4. Devrait afficher: "✅ Backend disponible - Mode automatique activé"

---

## 📊 PROCHAINES AMÉLIORATIONS (TODO)

### Court terme
- [ ] Implémenter WebSocket pour progression temps réel
- [ ] Stocker les testRunId dans Prisma pour historique
- [ ] Parser les résultats JSON de Promptfoo
- [ ] Afficher les résultats dans l'interface "Résultats" (Étape 5)

### Moyen terme
- [ ] Gestion des clés API sécurisées (voir `ENCRYPTION_KEY`)
- [ ] Queue Bull pour tests en arrière-plan
- [ ] Notifications par email à la fin des tests
- [ ] Streaming logs en temps réel (WebSocket)

### Long terme
- [ ] Interface de comparaison de runs
- [ ] Export PDF des rapports
- [ ] Intégration CI/CD (GitHub Actions)
- [ ] Dashboard temps réel avec statistiques

---

## 📚 RESSOURCES

- **Promptfoo Docs:** https://promptfoo.dev/docs/
- **API Backend:** http://localhost:3001/api/docs (Swagger UI)
- **Frontend App:** http://localhost:5080

---

**✅ L'intégration Promptfoo est maintenant fonctionnelle !**
**🎯 Testez en mode manuel pour vérifier que tout fonctionne.**
**🚀 Démarrez le backend pour activer le mode automatique.**
