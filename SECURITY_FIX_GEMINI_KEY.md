# 🔒 Correction Sécurité - Clé API Gemini

## ❌ Problème Détecté

Votre clé API Gemini était **exposée publiquement** dans le code frontend, ce qui constitue un **risque de sécurité critique**.

### Ce qui n'allait pas:

```env
# ❌ DANGEREUX - Exposé au client
VITE_GEMINI_API_KEY=AIzaSy...
```

**Conséquences:**
- ✗ Clé visible dans le JavaScript du navigateur
- ✗ Peut être extraite par n'importe qui (F12 > Network/Sources)
- ✗ Utilisation frauduleuse possible
- ✗ Épuisement de votre quota
- ✗ Coûts potentiels importants

---

## ✅ Solution Appliquée

### 1. Clé API Sécurisée (Backend Uniquement)

**Fichier: `.env`**
```env
# ✅ SÉCURISÉ - Utilisé uniquement par le backend
GEMINI_API_KEY=AIzaSy...

# Note: Pas de préfixe VITE_ = pas exposé au client
```

### 2. Service Backend (À Créer)

**Fichier: `backend/apps/api-gateway/src/gemini/gemini.controller.ts`**

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Controller('gemini')
export class GeminiController {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  @Post('generate-prompts')
  async generatePrompts(@Body() dto: GeneratePromptsDto) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: this.buildPrompt(dto),
        config: {
          responseMimeType: "application/json",
          responseSchema: this.getSchema(dto),
        },
      });

      const parsed = JSON.parse(response.text.trim());
      return { prompts: parsed.prompts };
    } catch (error) {
      throw new HttpException('Generation failed', 500);
    }
  }

  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: dto.message,
      });

      return { response: response.text };
    } catch (error) {
      throw new HttpException('Chat failed', 500);
    }
  }
}
```

### 3. Service Frontend Sécurisé

**Fichier: `services/geminiServiceSecure.ts`** (créé)

```typescript
// Appelle le backend au lieu de Gemini directement
export const generateTestPromptsSecure = async (
  categories: GuardrailCategory[],
  count: number,
  complexities: PromptComplexity[]
): Promise<TestPrompt[]> => {
    const response = await fetch(`${BACKEND_API_URL}/gemini/generate-prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, count, complexities }),
    });

    const data = await response.json();
    return data.prompts;
};
```

---

## 🚀 Migration - Étapes à Suivre

### Étape 1: Vérifier la Configuration

```bash
# Vérifier que .env n'a PAS VITE_GEMINI_API_KEY
cat .env | grep GEMINI

# Devrait afficher:
# GEMINI_API_KEY=AIzaSy...
# (pas de VITE_ devant)
```

### Étape 2: Créer le Backend Gemini (si en mode fullstack/docker)

```bash
cd backend
npm install @google/genai

# Créer le module
nest g module gemini
nest g controller gemini
nest g service gemini
```

### Étape 3: Implémenter le Controller Backend

Copiez le code du controller ci-dessus dans:
`backend/apps/api-gateway/src/gemini/gemini.controller.ts`

### Étape 4: Modifier le Frontend

```typescript
// Ancienne méthode (NON SÉCURISÉE)
import { generateTestPrompts } from './services/geminiService';

// Nouvelle méthode (SÉCURISÉE)
import { generateTestPromptsSecure } from './services/geminiServiceSecure';

// Remplacer dans votre code:
const prompts = await generateTestPromptsSecure(categories, count, complexities);
```

### Étape 5: Redémarrer les Services

```bash
# Backend
cd backend && npm run start:dev

# Frontend
npm run dev
```

---

## 🔍 Vérification de Sécurité

### Comment vérifier que la clé n'est plus exposée:

1. **Ouvrez votre application** (http://localhost:5080)
2. **Ouvrez DevTools** (F12)
3. **Onglet Network** → Rafraîchir la page
4. **Cherchez** dans tous les fichiers `.js` chargés
5. **Vérifiez:** Aucune trace de `AIzaSy...`

### Test avec Chrome DevTools:

```javascript
// Dans la console (F12)
console.log(import.meta.env.VITE_GEMINI_API_KEY);
// Devrait afficher: undefined

console.log(import.meta.env.GEMINI_API_KEY);
// Devrait afficher: undefined

// ✅ Si les deux sont undefined, c'est bon!
```

---

## 📋 Checklist de Sécurité

- [ ] `.env` n'a que `GEMINI_API_KEY` (sans VITE_)
- [ ] `backend/.env` a `GEMINI_API_KEY`
- [ ] Backend expose `/api/v1/gemini/generate-prompts`
- [ ] Backend expose `/api/v1/gemini/chat`
- [ ] Frontend utilise `geminiServiceSecure.ts`
- [ ] Aucune référence à `VITE_GEMINI_API_KEY` dans le code
- [ ] Test DevTools confirme que la clé n'est pas visible
- [ ] `.env` est dans `.gitignore`

---

## ⚠️ Si vous avez déjà exposé votre clé

**IMPORTANT:** Si votre clé était publique (commit Git, déployée, partagée):

1. **Régénérez immédiatement** une nouvelle clé sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Révoquez** l'ancienne clé
3. **Mettez à jour** `.env` et `backend/.env` avec la nouvelle clé
4. **Ne committez JAMAIS** les fichiers `.env`

### Vérifier .gitignore:

```bash
cat .gitignore | grep .env

# Doit contenir:
# .env
# .env.local
# .env*.local
# backend/.env
```

---

## 🎯 Architecture Sécurisée Finale

```
┌─────────────┐         ┌──────────────┐        ┌─────────────┐
│   Browser   │────────→│   Backend    │───────→│   Gemini    │
│  (Frontend) │  HTTPS  │  (NestJS)    │  API   │     API     │
└─────────────┘         └──────────────┘        └─────────────┘
      ↑                        ↑
      │                        │
      │                   GEMINI_API_KEY
      │                   (côté serveur)
      │
  Aucune clé API!
  (sécurisé)
```

---

## 📚 Ressources

- [Google AI Studio](https://aistudio.google.com/app/apikey) - Gestion des clés
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html) - Documentation
- [OWASP API Security](https://owasp.org/www-project-api-security/) - Meilleures pratiques

---

## 💡 Bonnes Pratiques

### ✅ À FAIRE:
- Utiliser des clés API uniquement côté backend
- Stocker les secrets dans `.env` (non versionné)
- Créer des endpoints backend pour les services externes
- Utiliser HTTPS en production
- Régénérer les clés régulièrement

### ❌ À ÉVITER:
- Préfixer des secrets avec `VITE_`, `REACT_APP_`, `NEXT_PUBLIC_`
- Committer des fichiers `.env`
- Partager des clés API publiquement
- Utiliser des clés de production en développement
- Ignorer les warnings de sécurité

---

**Statut:** ✅ Correction appliquée - Clé API maintenant sécurisée

**Date:** 2025-10-31

**Action requise:** Implémenter le backend Gemini si vous utilisez le mode fullstack/docker
