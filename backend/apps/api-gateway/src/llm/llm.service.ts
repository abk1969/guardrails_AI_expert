import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMConfigurationDto, LLMProvider } from './dto/llm-configuration.dto';

interface TestResult {
  success: boolean;
  message: string;
  model?: string;
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(private readonly configService: ConfigService) {}

  async testConnection(config: LLMConfigurationDto): Promise<TestResult> {
    this.logger.log(`Testing connection for provider: ${config.provider}, model: ${config.model}`);

    try {
      switch (config.provider) {
        case LLMProvider.GEMINI:
          return await this.testGemini(config);
        case LLMProvider.OPENAI:
          return await this.testOpenAI(config);
        case LLMProvider.CLAUDE:
          return await this.testClaude(config);
        case LLMProvider.MISTRAL:
          return await this.testMistral(config);
        case LLMProvider.GROQ:
          return await this.testGroq(config);
        case LLMProvider.OLLAMA:
          return await this.testOllama(config);
        case LLMProvider.LM_STUDIO:
          return await this.testLMStudio(config);
        case LLMProvider.DEEPSEEK:
          return await this.testDeepSeek(config);
        case LLMProvider.QWEN:
          return await this.testQwen(config);
        case LLMProvider.XAI_GROK:
          return await this.testXAIGrok(config);
        default:
          return {
            success: false,
            message: `Provider ${config.provider} non supporté`,
          };
      }
    } catch (error) {
      this.logger.error(`Test connection failed for ${config.provider}:`, error);
      return {
        success: false,
        message: error.message || 'Erreur inconnue lors du test de connexion',
      };
    }
  }

  private async testGemini(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API Gemini manquante' };
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });

      const result = await model.generateContent('Test connection');
      const response = await result.response;
      const text = response.text();

      if (text) {
        return {
          success: true,
          message: `Connexion réussie à Gemini (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse vide de Gemini' };
    } catch (error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        return { success: false, message: 'Clé API Gemini invalide' };
      }
      if (error.message?.includes('quota')) {
        return { success: false, message: 'Quota Gemini dépassé' };
      }
      return {
        success: false,
        message: `Erreur Gemini: ${error.message}`,
      };
    }
  }

  private async testOpenAI(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API OpenAI manquante' };
    }

    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: config.apiKey });

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      if (completion.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à OpenAI (${completion.model})`,
          model: completion.model,
        };
      }

      return { success: false, message: 'Réponse invalide d\'OpenAI' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API OpenAI invalide' };
      }
      if (error.status === 429) {
        return { success: false, message: 'Quota OpenAI dépassé ou rate limit atteint' };
      }
      return {
        success: false,
        message: `Erreur OpenAI: ${error.message}`,
      };
    }
  }

  private async testClaude(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API Claude manquante' };
    }

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: config.apiKey });

      const message = await anthropic.messages.create({
        model: config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }],
      });

      if (message.content?.[0]) {
        return {
          success: true,
          message: `Connexion réussie à Claude (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de Claude' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API Claude invalide' };
      }
      if (error.status === 429) {
        return { success: false, message: 'Rate limit Claude atteint' };
      }
      return {
        success: false,
        message: `Erreur Claude: ${error.message}`,
      };
    }
  }

  private async testMistral(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API Mistral manquante' };
    }

    try {
      const { Mistral } = await import('@mistralai/mistralai');
      const mistral = new Mistral({ apiKey: config.apiKey });

      const completion = await mistral.chat.complete({
        model: config.model,
        messages: [{ role: 'user', content: 'Test' }],
      });

      if (completion.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à Mistral (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de Mistral' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API Mistral invalide' };
      }
      if (error.status === 429) {
        return { success: false, message: 'Rate limit Mistral atteint' };
      }
      return {
        success: false,
        message: `Erreur Mistral: ${error.message}`,
      };
    }
  }

  private async testGroq(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API Groq manquante' };
    }

    try {
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: config.apiKey });

      const completion = await groq.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      if (completion.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à Groq (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de Groq' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API Groq invalide' };
      }
      return {
        success: false,
        message: `Erreur Groq: ${error.message}`,
      };
    }
  }

  private async testOllama(config: LLMConfigurationDto): Promise<TestResult> {
    const baseUrl = config.baseUrl || 'http://localhost:11434';

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          prompt: 'Test',
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message: `Modèle ${config.model} non trouvé dans Ollama. Utilisez 'ollama pull ${config.model}' pour le télécharger.`,
          };
        }
        return {
          success: false,
          message: `Erreur Ollama (${response.status}): ${response.statusText}`,
        };
      }

      const data = await response.json();

      if (data.response) {
        return {
          success: true,
          message: `Connexion réussie à Ollama (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide d\'Ollama' };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: `Impossible de se connecter à Ollama sur ${baseUrl}. Vérifiez qu'Ollama est démarré.`,
        };
      }
      return {
        success: false,
        message: `Erreur Ollama: ${error.message}`,
      };
    }
  }

  private async testLMStudio(config: LLMConfigurationDto): Promise<TestResult> {
    const baseUrl = config.baseUrl || 'http://localhost:1234';

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Erreur LM Studio (${response.status}): ${response.statusText}`,
        };
      }

      const data = await response.json();

      if (data.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à LM Studio`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de LM Studio' };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: `Impossible de se connecter à LM Studio sur ${baseUrl}. Vérifiez qu'un modèle est chargé et que le serveur local est démarré.`,
        };
      }
      return {
        success: false,
        message: `Erreur LM Studio: ${error.message}`,
      };
    }
  }

  private async testDeepSeek(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API DeepSeek manquante' };
    }

    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.deepseek.com',
      });

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      if (completion.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à DeepSeek (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de DeepSeek' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API DeepSeek invalide' };
      }
      if (error.status === 429) {
        return { success: false, message: 'Rate limit DeepSeek atteint' };
      }
      return {
        success: false,
        message: `Erreur DeepSeek: ${error.message}`,
      };
    }
  }

  private async testQwen(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API Qwen manquante' };
    }

    try {
      const OpenAI = (await import('openai')).default;
      // Default to Singapore endpoint, can be overridden with baseUrl
      const baseURL = config.baseUrl || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL,
      });

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      if (completion.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à Qwen (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de Qwen' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API Qwen invalide' };
      }
      if (error.status === 429) {
        return { success: false, message: 'Rate limit Qwen atteint' };
      }
      return {
        success: false,
        message: `Erreur Qwen: ${error.message}`,
      };
    }
  }

  private async testXAIGrok(config: LLMConfigurationDto): Promise<TestResult> {
    if (!config.apiKey) {
      return { success: false, message: 'Clé API xAI Grok manquante' };
    }

    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.x.ai/v1',
      });

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      if (completion.choices?.[0]?.message) {
        return {
          success: true,
          message: `Connexion réussie à xAI Grok (${config.model})`,
          model: config.model,
        };
      }

      return { success: false, message: 'Réponse invalide de xAI Grok' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, message: 'Clé API xAI Grok invalide' };
      }
      if (error.status === 429) {
        return { success: false, message: 'Rate limit xAI Grok atteint' };
      }
      return {
        success: false,
        message: `Erreur xAI Grok: ${error.message}`,
      };
    }
  }
}
