import { Injectable, Logger } from '@nestjs/common';
import { LLMChatService } from '../llm/llm-chat.service';
import { McpService } from '../mcp/mcp.service';
import { ChatbotGateway } from './chatbot.gateway';
import { MCP_TOOL_SCHEMAS } from '../mcp/mcp-tool-schemas';
import {
  ChatMessage,
  ContentBlock,
  ToolUseBlock,
  ToolSchema,
  ChatRequest,
} from '../llm/dto/chat-message.dto';
import { ChatbotSendDto } from './dto/chatbot.dto';

const MAX_ITERATIONS = 8;

const SYSTEM_PROMPT = `Vous etes l'assistant IA expert de la plateforme "AI RISK MANAGER".
Vous avez acces a 32 outils MCP pour interroger la base de donnees et les referentiels de securite IA.

Referentiels connus (a consulter via outils dedies) :
- OWASP LLM Top 10, OWASP Agentic AI Top 15
- OWASP GenAI COMPASS (31 scenarios)
- OWASP GenAI Data Security 2026 (DSPM + DSGAI01..DSGAI21, 22 risques)
- AI Risk Repository V4 (1579 risques)
- PSSI IA v3 consolidee (172 exigences SIA-001..SIA-172, 16 chapitres : gouvernance, tiering AI Act x AISVS, cycle de vie, donnees, supply chain, agentique, code assiste, supervision humaine, GPAI publics, incidents, conformite, formation, souverainete, sanctions, amelioration continue)

Votre role :
- Repondre aux questions sur la securite IA, les risques, les menaces, les politiques
- Utiliser les outils disponibles pour chercher des donnees precises
- Raisonner etape par etape avant de repondre
- Toujours repondre en francais
- Citer les sources (IDs, references, codes DSGAI/ASI/LLM/SIA) quand disponibles
- Si vous ne trouvez pas l'information dans les outils, dites-le clairement

Instructions de raisonnement :
1. Analysez la question de l'utilisateur
2. Identifiez quels outils utiliser pour trouver l'information :
   - search_dsgai_risks / get_dsgai_risk_by_code si la question mentionne DSGAI ou "data security"
   - get_pssi_sia_by_id si la question mentionne un identifiant SIA-XXX (ex: SIA-042)
   - search_pssi_sia si la question porte sur la politique, la gouvernance, la conformite, les exigences ou les referentiels reglementaires (AI Act, ISO 42001, etc.)
   - list_pssi_chapters / get_pssi_statistics pour une vue d'ensemble de la PSSI
3. Appelez les outils necessaires
4. Synthetisez les resultats en une reponse claire et structuree`;

@Injectable()
export class ReactAgentService {
  private readonly logger = new Logger(ReactAgentService.name);

  constructor(
    private readonly llmChatService: LLMChatService,
    private readonly mcpService: McpService,
    private readonly chatbotGateway: ChatbotGateway,
  ) {}

  async processMessage(
    dto: ChatbotSendDto,
    sessionId: string,
    organizationId: string,
  ): Promise<void> {
    try {
      // Build conversation messages
      const messages: ChatMessage[] = [];

      // Add conversation history
      if (dto.conversationHistory?.length) {
        for (const msg of dto.conversationHistory) {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      }

      // Add current user message
      messages.push({ role: 'user', content: dto.message });

      // Convert tool schemas to ToolSchema format
      const tools: ToolSchema[] = MCP_TOOL_SCHEMAS.map((s) => ({
        name: s.name,
        description: s.description,
        parameters: s.parameters,
      }));

      // ReAct loop
      const toolsUsed: string[] = [];
      let iteration = 0;

      while (iteration < MAX_ITERATIONS) {
        iteration++;
        this.logger.log(
          `ReAct iteration ${iteration}/${MAX_ITERATIONS} for session ${sessionId}`,
        );

        // Call LLM with tools — fall back to backend env if user did not provide an LLM config
        const userCfg = dto.llmConfig;
        const config = userCfg
          ? {
              provider: userCfg.provider,
              model: userCfg.model,
              apiKey: userCfg.apiKey,
              baseUrl: userCfg.baseUrl,
              temperature: userCfg.temperature ?? 0.3,
              maxTokens: userCfg.maxTokens ?? 4096,
            }
          : {
              provider: 'gemini' as any,
              model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash-exp',
              apiKey: process.env.GEMINI_API_KEY,
              temperature: 0.3,
              maxTokens: 4096,
            };

        if (!config.apiKey) {
          throw new Error(
            'No LLM API key available — neither user llmConfig nor backend GEMINI_API_KEY env. Configure an LLM provider in the UI.',
          );
        }

        const request: ChatRequest = {
          messages,
          tools,
          systemPrompt: SYSTEM_PROMPT,
          config,
        };

        const response = await this.llmChatService.chatWithTools(request);

        // Process response content
        const textBlocks: string[] = [];
        const toolUseBlocks: ToolUseBlock[] = [];

        for (const block of response.content) {
          if (block.type === 'text') {
            textBlocks.push(block.text);
          } else if (block.type === 'tool_use') {
            toolUseBlocks.push(block as ToolUseBlock);
          }
        }

        // Emit thinking if there's text alongside tool calls
        if (textBlocks.length > 0 && response.stopReason === 'tool_use') {
          this.chatbotGateway.emitThinking(
            sessionId,
            textBlocks.join('\n'),
          );
        }

        // If stop reason is end_turn or max_tokens, we're done
        if (
          response.stopReason === 'end_turn' ||
          response.stopReason === 'max_tokens'
        ) {
          const finalAnswer = textBlocks.join('\n');
          this.chatbotGateway.emitComplete(
            sessionId,
            finalAnswer,
            toolsUsed,
            iteration,
          );
          return;
        }

        // If stop reason is tool_use, execute each tool
        if (response.stopReason === 'tool_use' && toolUseBlocks.length > 0) {
          // Add assistant message with full content blocks to conversation
          messages.push({ role: 'assistant', content: response.content });

          for (const toolBlock of toolUseBlocks) {
            // Emit tool call event
            this.chatbotGateway.emitToolCall(
              sessionId,
              toolBlock.name,
              toolBlock.input,
              toolBlock.id,
            );

            // Execute tool via MCP service
            let toolResult: any;
            try {
              const mcpResponse = await this.mcpService.executeQuery(
                { tool: toolBlock.name, parameters: toolBlock.input },
                organizationId,
              );
              toolResult = mcpResponse.result;
            } catch (error) {
              toolResult = {
                error:
                  error.message ||
                  "Erreur lors de l'execution de l'outil",
              };
            }

            // Emit tool result event
            this.chatbotGateway.emitToolResult(
              sessionId,
              toolBlock.name,
              toolBlock.id,
              toolResult,
            );

            // Track tool usage
            if (!toolsUsed.includes(toolBlock.name)) {
              toolsUsed.push(toolBlock.name);
            }

            // Add tool result to messages
            messages.push({
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolBlock.id,
                  content: JSON.stringify(toolResult),
                },
              ],
            });
          }

          continue; // Next iteration
        }

        // Fallback: if no text and no tools, break
        break;
      }

      // If we exhausted iterations
      this.chatbotGateway.emitComplete(
        sessionId,
        "J'ai atteint la limite de raisonnement. Voici ce que j'ai pu trouver avec les outils consultes.",
        toolsUsed,
        iteration,
      );
    } catch (error) {
      this.logger.error(
        `Error in ReAct loop for session ${sessionId}:`,
        error,
      );
      this.chatbotGateway.emitError(
        sessionId,
        error.message || 'Erreur interne du moteur de raisonnement',
      );
    }
  }
}
