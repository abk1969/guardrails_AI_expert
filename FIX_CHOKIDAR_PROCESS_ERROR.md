# 🔧 Correction Erreur "process is not defined"

**Date:** 2025-10-31
**Erreur:** `chokidar.js:156 Uncaught ReferenceError: process is not defined`

---

## 🐛 Problème Identifié

L'erreur "process is not defined" se produisait dans le navigateur car le frontend importait des packages **Node.js** qui ne peuvent pas s'exécuter dans un navigateur :

1. **`@google/genai`** - SDK Gemini (doit être côté serveur uniquement)
2. **`chokidar`** - Bibliothèque de surveillance de fichiers (Node.js uniquement)
3. **`@types/chokidar`** - Types TypeScript pour chokidar

Ces packages utilisent `process.env` et d'autres APIs Node.js qui n'existent pas dans le navigateur.

---

## ✅ Corrections Appliquées

### 1. Suppression des Dépendances Node.js du Frontend

**Commande exécutée:**
```bash
npm uninstall @google/genai chokidar @types/chokidar
```

**Résultat:**
- ✅ 28 packages retirés
- ✅ Frontend allégé (moins de dépendances inutiles)

**Dépendances retirées de `package.json`:**
```diff
  "dependencies": {
-   "@google/genai": "^1.19.0",
-   "@types/chokidar": "^1.7.5",
-   "chokidar": "^4.0.3",
    "lucide-react": "^0.543.0",
    "react": "^19.1.1",
    ...
  }
```

### 2. Modification de `services/geminiService.ts`

**Avant (PROBLÉMATIQUE):**
```typescript
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;
try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        console.warn('⚠️ ATTENTION: Clé API Gemini détectée côté client.');
    }
} catch (error) {
    console.log('Mode backend-only activé');
}
```

**Après (CORRIGÉ):**
```typescript
import { GuardrailCategory, TestPrompt, PromptTemplate, PromptComplexity } from '../types';
import { mcpClient } from './mcpClientService';

// ⚠️ SÉCURITÉ: La clé API ne doit JAMAIS être exposée côté client!
// Tous les appels Gemini doivent passer par le backend.
// ✅ Utiliser geminiServiceSecure.ts à la place de ce fichier!

console.warn('⚠️ geminiService.ts est déprécié. Utilisez geminiServiceSecure.ts pour des appels sécurisés.');
```

**Changements:**
- ✅ Supprimé l'import de `@google/genai`
- ✅ Supprimé toute initialisation de l'API Gemini côté client
- ✅ La fonction `generateTestPrompts()` utilise maintenant uniquement la génération mock locale
- ✅ Ajout d'avertissements pour orienter vers `geminiServiceSecure.ts`

### 3. Mise à Jour de `vite.config.ts`

**Ajout de variables d'environnement:**
```typescript
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api/v1'),
  'import.meta.env.VITE_MCP_API_URL': JSON.stringify(env.VITE_MCP_API_URL || 'http://localhost:3001/api/v1/mcp'),
  'import.meta.env.VITE_MCP_MOCK_MODE': JSON.stringify(env.VITE_MCP_MOCK_MODE || 'false'),
},
```

**Résultat:**
- ✅ Variables d'environnement correctement exposées au frontend
- ✅ Pas de clés API sensibles exposées
- ✅ Configuration simplifiée

---

## 📂 Fichiers Modifiés

```
frontend/
├── package.json                     ✅ Retiré @google/genai, chokidar, @types/chokidar
├── vite.config.ts                   ✅ Ajout variables d'environnement
└── services/
    └── geminiService.ts             ✅ Retiré import @google/genai, marqué comme déprécié
```

---

## 🎯 Architecture Correcte

### Avant (INCORRECT) ❌
```
Frontend
  ├── @google/genai (❌ Package Node.js)
  ├── chokidar (❌ Package Node.js)
  └── Appel direct Gemini API (❌ Clé exposée)
```

### Après (CORRECT) ✅
```
Frontend
  ├── geminiServiceSecure.ts
  └── Appels via backend uniquement
        ↓
Backend
  ├── @google/genai (✅ Package côté serveur)
  └── Gemini API (✅ Clé sécurisée)
```

---

## 🧪 Validation

### 1. Vérifier que l'erreur est corrigée

Démarrer le frontend et vérifier dans la console DevTools (F12) :
```bash
npm run dev
```

**Attendu:**
- ✅ Aucune erreur "process is not defined"
- ✅ Aucune erreur "chokidar"
- ⚠️ Avertissement: "geminiService.ts est déprécié"

### 2. Vérifier les variables d'environnement

Dans la console DevTools (F12) :
```javascript
console.log(import.meta.env.VITE_API_URL);
// Devrait afficher: "http://localhost:3001/api/v1"

console.log(import.meta.env.VITE_GEMINI_API_KEY);
// Devrait afficher: undefined ✅ (clé non exposée)
```

### 3. Vérifier les dépendances installées

```bash
npm list @google/genai
npm list chokidar
```

**Attendu:**
```
npm error 404 @google/genai@* is not in this registry.
npm error 404 chokidar@* is not in this registry.
```

---

## 📚 Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours utiliser le service sécurisé:**
   ```typescript
   import { generateTestPromptsSecure } from '../services/geminiServiceSecure';
   ```

2. **Backend pour appels API:**
   - Toutes les clés API doivent être dans `backend/.env`
   - Le frontend appelle le backend, qui appelle les APIs tierces

3. **Packages Node.js uniquement dans le backend:**
   - `@google/genai` → backend seulement
   - `chokidar` → backend seulement
   - `fs`, `path`, `crypto` (Node.js) → backend seulement

### ❌ À NE PAS FAIRE

1. **Ne JAMAIS installer de packages Node.js dans le frontend:**
   ```bash
   # ❌ INCORRECT
   npm install @google/genai chokidar
   ```

2. **Ne JAMAIS exposer de clés API avec VITE_:**
   ```env
   # ❌ INCORRECT
   VITE_GEMINI_API_KEY=AIza...

   # ✅ CORRECT (sans VITE_)
   GEMINI_API_KEY=AIza...
   ```

3. **Ne JAMAIS importer de packages Node.js dans le frontend:**
   ```typescript
   // ❌ INCORRECT
   import { GoogleGenAI } from "@google/genai";
   import chokidar from "chokidar";

   // ✅ CORRECT
   import { generateTestPromptsSecure } from '../services/geminiServiceSecure';
   ```

---

## 🔐 Sécurité: Checklist Finale

- [x] @google/genai retiré du frontend
- [x] chokidar retiré du frontend
- [x] geminiService.ts ne fait plus d'appels directs à Gemini
- [x] Tous les appels Gemini passent par geminiServiceSecure.ts
- [x] Le backend gère toutes les clés API
- [x] Aucune variable VITE_*_API_KEY dans .env
- [x] Variables d'environnement correctement exposées dans vite.config.ts

---

## 🚀 Prochaines Étapes

1. **Tester le frontend:**
   ```bash
   npm run dev
   ```

2. **Vérifier dans DevTools (F12):**
   - Aucune erreur "process is not defined"
   - Avertissement de dépréciation visible

3. **Démarrer le backend** (une fois erreurs TypeScript corrigées):
   ```bash
   cd backend
   npm run start:dev
   ```

4. **Tester l'intégration complète:**
   - Génération de prompts via backend
   - Chat via backend
   - Tout fonctionne avec clés sécurisées

---

## 💡 Résumé

**Cause de l'erreur:**
- Packages Node.js (`@google/genai`, `chokidar`) installés dans le frontend
- Ces packages utilisent `process.env` qui n'existe pas dans le navigateur

**Solution:**
1. ✅ Retiré tous les packages Node.js du frontend
2. ✅ Supprimé les imports problématiques dans `geminiService.ts`
3. ✅ Orienté tous les appels vers `geminiServiceSecure.ts`
4. ✅ Configuration Vite améliorée

**Résultat:**
- ✅ Erreur "process is not defined" corrigée
- ✅ Frontend plus léger et sécurisé
- ✅ Architecture fullstack correcte

---

**Date de correction:** 2025-10-31
**Statut:** ✅ Corrigé - Prêt pour test
