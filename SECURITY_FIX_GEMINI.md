# 🔒 FIX DE SÉCURITÉ CRITIQUE - Clé API Gemini

## ⚠️ PROBLÈME IDENTIFIÉ

**RISQUE MAJEUR** : La clé API Gemini est actuellement exposée côté frontend (client-side), ce qui signifie :

❌ Elle est visible dans le code JavaScript du navigateur
❌ N'importe qui peut l'extraire avec DevTools
❌ Elle peut être volée et utilisée frauduleusement
❌ Vous serez facturé pour toutes les utilisations malveillantes

## ✅ SOLUTION SÉCURISÉE

**La clé API doit être stockée UNIQUEMENT côté backend et jamais envoyée au client.**

### Architecture Correcte

```
Frontend (Navigateur)
    ↓
    POST /api/v1/chat (avec message seulement)
    ↓
Backend (NestJS)
    ↓
    Utilise GEMINI_API_KEY (côté serveur)
    ↓
    Appelle Gemini API
    ↓
    Retourne la réponse au frontend
```

## 🔧 IMPLÉMENTATION

### 1. Créer l'Endpoint Backend Sécurisé

**Fichier**: `backend/apps/api-gateway/src/chat/chat.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send message to AI chatbot' })
  async sendMessage(
    @Body('message') message: string,
    @Body('mode') mode?: 'normal' | 'expert' | 'concise',
  ) {
    // La clé API est utilisée côté serveur seulement
    return this.chatService.chat(message, mode || 'normal');
  }
}
```

**Fichier**: `backend/apps/api-gateway/src/chat/chat.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { McpService } from '../mcp/mcp.service';

@Injectable()
export class ChatService {
  private ai: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    private mcpService: McpService,
  ) {
    // ✅ Clé API sécurisée côté serveur
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chat(message: string, mode: 'normal' | 'expert' | 'concise'): Promise<string> {
    try {
      // Récupérer le contexte via MCP
      const context = await this.getRelevantContext(message);

      // Construire le prompt
      let systemPrompt = this.buildSystemPrompt(mode);
      if (context) {
        systemPrompt += `\n\n📊 CONTEXTE:\n${context}\n\n`;
      }
      systemPrompt += `Question: ${message}`;

      // Appeler Gemini
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Erreur lors de la génération de la réponse');
    }
  }

  private async getRelevantContext(message: string): Promise<string> {
    // Logique MCP existante
    const contexts: string[] = [];

    if (message.toLowerCase().includes('sia')) {
      const policies = await this.mcpService.executeQuery({
        tool: 'search_ai_policies',
        parameters: { limit: 3 }
      }, 'default-org-id');

      if (policies.result?.count > 0) {
        contexts.push(JSON.stringify(policies.result.policies, null, 2));
      }
    }

    return contexts.join('\n\n');
  }

  private buildSystemPrompt(mode: string): string {
    let prompt = 'Tu es un assistant expert en sécurité IA.';

    if (mode === 'expert') {
      prompt += ' Réponds avec détails techniques approfondis.';
    } else if (mode === 'concise') {
      prompt += ' Réponds de manière concise et directe.';
    }

    return prompt;
  }
}
```

### 2. Modifier le Frontend pour Utiliser l'Endpoint Backend

**Fichier**: `services/geminiService.ts`

```typescript
// ❌ AVANT (INSÉCURISÉ)
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // DANGEREUX!

// ✅ APRÈS (SÉCURISÉ)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const chat = async (message: string, mode: 'normal' | 'expert' | 'concise' = 'normal'): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, mode }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors du chat:", error);
        return "Désolé, je rencontre un problème technique. Veuillez réessayer.";
    }
};

export const geminiService = {
    chat
};
```

### 3. Supprimer la Clé API du Frontend

**Fichier**: `vite.config.ts`

```typescript
// ❌ SUPPRIMER CES LIGNES
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}

// ✅ REMPLACER PAR
define: {
  // Ne plus exposer de clés API
}
```

**Fichier**: `.env.example`

```env
# ❌ NE PLUS METTRE de GEMINI_API_KEY ici (frontend)

# ✅ URL du backend uniquement
VITE_API_URL=http://localhost:3001/api/v1
VITE_MCP_API_URL=http://localhost:3001/api/v1/mcp
VITE_MCP_MOCK_MODE=false
```

**Fichier**: `backend/.env`

```env
# ✅ Clé API UNIQUEMENT côté backend
GEMINI_API_KEY=votre-cle-api-gemini-ici
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

## 🔐 RÈGLES DE SÉCURITÉ

### ✅ À FAIRE

1. **Backend uniquement** : Toutes les clés API doivent être dans `backend/.env`
2. **Variables VITE_** : Seules les variables préfixées par `VITE_` peuvent être exposées au frontend (URLs publiques uniquement)
3. **Proxy API** : Toujours passer par un endpoint backend pour les services externes
4. **Validation** : Valider et limiter les requêtes côté serveur
5. **Rate Limiting** : Implémenter des limites pour éviter les abus

### ❌ À NE JAMAIS FAIRE

1. ❌ Mettre des clés API dans `process.env` côté frontend
2. ❌ Exposer des secrets dans `vite.config.ts` via `define`
3. ❌ Committer des fichiers `.env` avec de vraies clés
4. ❌ Appeler des APIs externes directement depuis le navigateur
5. ❌ Stocker des tokens dans localStorage sans encryption

## 🚀 MIGRATION RAPIDE

### Étape 1: Sécuriser immédiatement

```bash
# 1. Supprimer la clé du frontend
# Éditer vite.config.ts et supprimer les lignes define

# 2. Créer backend/.env avec la clé
cd backend
echo "GEMINI_API_KEY=votre-cle-ici" > .env
echo "PORT=3001" >> .env

# 3. Redémarrer le frontend (la clé ne sera plus exposée)
npm run dev
```

### Étape 2: Implémenter l'endpoint sécurisé

```bash
cd backend

# 1. Créer le module chat
mkdir -p apps/api-gateway/src/chat

# 2. Créer les fichiers (voir code ci-dessus)
# - chat.controller.ts
# - chat.service.ts
# - chat.module.ts

# 3. Ajouter au app.module.ts
# imports: [..., ChatModule]

# 4. Démarrer le backend
npm run start:dev
```

### Étape 3: Modifier le frontend

```typescript
// services/geminiService.ts
// Remplacer tout le contenu par l'implémentation sécurisée ci-dessus
```

## ✅ VÉRIFICATION

Après la migration, vérifier que :

1. **DevTools** : Ouvrir F12 → Network → Voir que les appels vont vers `/api/v1/chat/message`
2. **Aucune clé visible** : Chercher "GEMINI" ou "API_KEY" dans le code source du navigateur → Aucun résultat
3. **Backend logs** : Voir les appels Gemini dans les logs du backend
4. **Fonctionne** : Le chatbot répond normalement

## 📊 COMPARAISON

| Aspect | ❌ Avant (Insécurisé) | ✅ Après (Sécurisé) |
|--------|----------------------|---------------------|
| Clé API | Visible dans browser | Cachée côté serveur |
| Risque | Très élevé | Faible |
| Coût | Non contrôlé | Contrôlé + rate limit |
| RGPD | Non conforme | Conforme |
| Appels API | Client → Gemini | Client → Backend → Gemini |

## 🎯 RÉSULTAT

Après cette correction :

✅ Clé API totalement invisible côté client
✅ Impossible de voler la clé
✅ Rate limiting possible
✅ Logs et monitoring centralisés
✅ Conformité RGPD/sécurité
✅ Contrôle des coûts

## ⚡ ACTION IMMÉDIATE

**À FAIRE MAINTENANT** :

1. Supprimer les lignes `define` de `vite.config.ts`
2. Déplacer `GEMINI_API_KEY` vers `backend/.env`
3. Redémarrer le frontend
4. ✅ La clé n'est plus exposée!

**Pour le fonctionnement complet** :
5. Implémenter l'endpoint backend `/api/v1/chat/message`
6. Modifier `geminiService.ts` pour appeler le backend
7. Tester le chatbot

---

**IMPORTANT** : Ne JAMAIS committer un fichier `.env` contenant de vraies clés API!
