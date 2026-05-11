# 📚 Guide d'utilisation de la Configuration LLM Centralisée

**Date**: 2025-11-08
**Version**: 1.0

---

## 🎯 Vue d'ensemble

L'application dispose maintenant d'une **configuration LLM centralisée** accessible via un menu dédié: **Paramètres → Configuration LLM**.

Cette configuration est utilisée par:
- ✅ Strix Agent (Tests Agentic AI)
- ✅ Garak (Scanner de vulnérabilités LLM)
- ✅ Promptfoo (Framework de tests)
- ✅ Chatbot de l'application

---

## 📂 Fichiers créés

### 1. Types TypeScript (`types.ts`)

```typescript
export type LLMProvider =
  | 'gemini' | 'openai' | 'mistral' | 'claude'
  | 'deepseek' | 'qwen' | 'xai-grok' | 'groq'
  | 'ollama' | 'lm-studio';

export interface LLMConfiguration {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string; // Pour Ollama, LM Studio
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}
```

### 2. Contexte (`contexts/LLMConfigContext.tsx`)

Gère:
- ✅ Chargement/sauvegarde en `localStorage` (clé: `llm-global-config`)
- ✅ Test de connexion via backend API
- ✅ État global accessible partout

### 3. Constantes (`constants/llmProviders.ts`)

Liste de 10 providers LLM avec leurs modèles:
- Gemini (Google)
- OpenAI (GPT-4, GPT-4o)
- Mistral AI
- Claude (Anthropic)
- DeepSeek
- Qwen (Alibaba)
- xAI Grok
- Groq (GRATUIT)
- Ollama (Local)
- LM Studio (Local)

### 4. Interface (`components/LLMConfigView.tsx`)

Interface utilisateur complète avec:
- Sélection du provider
- Champ clé API
- Sélection du modèle
- Paramètres avancés (température, max tokens)
- Test de connexion
- Sauvegarde

---

## 🔧 Utilisation dans les composants React

### Importer le hook

```typescript
import { useLLMConfig } from '../contexts/LLMConfigContext';
```

### Utiliser la configuration

```typescript
const MyComponent: React.FC = () => {
  const { config, isConfigured, loading } = useLLMConfig();

  if (!isConfigured) {
    return (
      <div>
        Veuillez configurer un modèle LLM dans Paramètres → Configuration LLM
      </div>
    );
  }

  console.log('Provider:', config.provider);
  console.log('Model:', config.model);
  console.log('API Key:', config.apiKey ? '***' : 'Non configurée');

  // Utiliser la config pour appeler un service...
  const handleTest = async () => {
    const response = await fetch('/api/v1/some-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        llmConfig: config, // Envoyer la config au backend
        // ... autres paramètres
      }),
    });
  };

  return <div>...</div>;
};
```

### Tester la connexion

```typescript
const { testConnection } = useLLMConfig();

const handleTest = async () => {
  const result = await testConnection();

  if (result.success) {
    alert(`Connexion réussie! Modèle: ${result.model}`);
  } else {
    alert(`Échec: ${result.message}`);
  }
};
```

---

## 🔌 Adaptation des services

### Exemple 1: Service Strix

**Fichier**: `backend/apps/api-gateway/src/strix/strix.service.ts`

```typescript
// AVANT
async startExecution(config: AgentConfigDto) {
  const command = `strix -t ${config.targetUrl} --model gpt-4o ...`;
  // Clé API hardcodée dans env
}

// APRÈS
async startExecution(config: AgentConfigDto, llmConfig: LLMConfiguration) {
  // Construire la commande avec le bon provider et modèle
  let command = `strix -t ${config.targetUrl}`;

  // Adapter selon le provider
  switch (llmConfig.provider) {
    case 'gemini':
      command += ` --model ${llmConfig.model}`;
      command += ` --api-key ${llmConfig.apiKey}`;
      break;
    case 'openai':
      command += ` --model ${llmConfig.model}`;
      command += ` --api-key ${llmConfig.apiKey}`;
      break;
    case 'ollama':
      command += ` --model ${llmConfig.model}`;
      command += ` --base-url ${llmConfig.baseUrl}`;
      break;
    // ... autres providers
  }

  // Ajouter les paramètres
  if (llmConfig.temperature) {
    command += ` --temperature ${llmConfig.temperature}`;
  }

  return this.executeCommand(command);
}
```

### Exemple 2: Chatbot

**Fichier**: `components/chatbot/ChatbotModern.tsx`

```typescript
import { useLLMConfig } from '../../contexts/LLMConfigContext';

const ChatbotModern: React.FC = () => {
  const { config } = useLLMConfig();

  const sendMessage = async (userMessage: string) => {
    // Utiliser le provider configuré
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';

    const response = await fetch(`${apiUrl}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        llmConfig: config, // ← Envoyer la config globale
      }),
    });

    const data = await response.json();
    return data.reply;
  };

  // ...
};
```

### Exemple 3: Promptfoo

**Fichier**: `services/promptfooIntegrationService.ts`

```typescript
import { useLLMConfig } from '../contexts/LLMConfigContext';

export const generatePromptfooConfig = (llmConfig: LLMConfiguration) => {
  // Générer le YAML avec le bon provider
  const yamlConfig = `
providers:
  - id: ${llmConfig.provider}:${llmConfig.model}
    config:
      apiKey: ${llmConfig.apiKey || ''}
      temperature: ${llmConfig.temperature || 0.7}
      max_tokens: ${llmConfig.maxTokens || 4096}
      ${llmConfig.baseUrl ? `baseUrl: ${llmConfig.baseUrl}` : ''}

# ... rest of config
`;

  return yamlConfig;
};
```

---

## 🌐 Endpoint Backend `/api/v1/llm/test-connection`

### Créer le contrôleur

**Fichier**: `backend/apps/api-gateway/src/llm/llm.controller.ts`

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LLMConfiguration } from './dto/llm-configuration.dto';

@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Post('test-connection')
  async testConnection(@Body() config: LLMConfiguration) {
    return this.llmService.testConnection(config);
  }
}
```

### Créer le service

**Fichier**: `backend/apps/api-gateway/src/llm/llm.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
// ... autres imports

@Injectable()
export class LLMService {
  async testConnection(config: LLMConfiguration): Promise<{
    success: boolean;
    message: string;
    model?: string;
  }> {
    try {
      switch (config.provider) {
        case 'gemini':
          return await this.testGemini(config);
        case 'openai':
          return await this.testOpenAI(config);
        case 'claude':
          return await this.testClaude(config);
        // ... autres providers
        default:
          return {
            success: false,
            message: `Provider ${config.provider} non supporté`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  private async testGemini(config: LLMConfiguration) {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model });

    const result = await model.generateContent('Test');
    const response = await result.response;

    return {
      success: true,
      message: `Connexion réussie à Gemini`,
      model: config.model,
    };
  }

  private async testOpenAI(config: LLMConfiguration) {
    const openai = new OpenAI({ apiKey: config.apiKey });

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5,
    });

    return {
      success: true,
      message: `Connexion réussie à OpenAI`,
      model: completion.model,
    };
  }

  // ... autres méthodes de test
}
```

---

## 📋 Checklist d'intégration

Pour intégrer la configuration LLM dans un nouveau service:

- [ ] **1. Importer le hook** `useLLMConfig` dans votre composant
- [ ] **2. Vérifier si configuré** avec `isConfigured`
- [ ] **3. Récupérer la config** avec `config`
- [ ] **4. Envoyer au backend** dans les requêtes API
- [ ] **5. Adapter le backend** pour utiliser le provider/modèle correct
- [ ] **6. Tester** avec différents providers (Gemini, OpenAI, Groq gratuit)

---

## 🎨 Providers disponibles

### Providers Cloud (avec clé API)

| Provider | Modèles recommandés | Coût | Notes |
|----------|---------------------|------|-------|
| **Gemini** | `gemini-2.0-flash-exp` | Gratuit (quotas généreux) | ⭐ Recommandé |
| **Groq** | `llama-3.3-70b-versatile` | **GRATUIT** | ⭐⭐ Ultra rapide |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini` | Payant | Coûteux |
| **Mistral** | `mistral-large-2407` | Payant | Alternative EU |
| **Claude** | `claude-sonnet-4-5` | Payant | Excellente qualité |

### Providers Locaux (sans clé API)

| Provider | Modèles | Setup requis |
|----------|---------|-------------|
| **Ollama** | Llama 3.3, Qwen 2.5, Mistral | Installer Ollama + télécharger modèle |
| **LM Studio** | N'importe quel GGUF | Installer LM Studio + charger modèle |

---

## 🚀 Test rapide

1. **Ouvrir l'application** sur http://localhost:5081
2. **Aller dans** Paramètres → Configuration LLM
3. **Sélectionner** Groq (gratuit)
4. **Créer une clé API** sur https://console.groq.com
5. **Coller la clé** dans le champ
6. **Sélectionner** `llama-3.3-70b-versatile`
7. **Cliquer** "Tester la connexion"
8. **Cliquer** "Sauvegarder"

✅ La configuration est maintenant utilisée partout dans l'application!

---

## 📝 Notes importantes

- ✅ La configuration est **sauvegardée localement** en `localStorage`
- ✅ Les **clés API ne quittent jamais le navigateur** sauf pour les requêtes backend explicites
- ✅ La config est **chargée automatiquement** au démarrage de l'app
- ✅ **Pas besoin de recharger** l'application après sauvegarde
- ✅ Compatible avec **mode standalone** et **mode full-stack**

---

**Auteur**: Claude Code
**Support**: Voir CLAUDE.md pour plus d'informations
