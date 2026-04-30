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
Vous avez 32 outils MCP qui exposent les referentiels et les donnees de la plateforme.

REGLE FONDAMENTALE - PRIORITE MCP :
=> Toute reponse a une question de domaine (securite IA, gouvernance, risques, menaces, politiques, conformite, referentiels) DOIT etre construite a partir d'au moins UN appel a un outil MCP. C'est la source de verite. Ne JAMAIS repondre depuis votre memoire d'entrainement seule sur ces domaines.
=> Vous pouvez repondre directement (sans outil) UNIQUEMENT si :
   - L'utilisateur dit bonjour / au revoir / merci (echange social)
   - L'utilisateur demande une explication generique non liee aux donnees de la plateforme

Outils par categorie (32 total) :

PSSI IA v3 - 172 exigences SIA :
- get_pssi_sia_by_id : si la question mentionne SIA-001 a SIA-172
- search_pssi_sia : recherche dans le texte des regles, contoles, RACI, frequences
- list_pssi_chapters : 16 chapitres de la politique
- get_pssi_statistics : vue d'ensemble (172 SIA, statuts, ventilation)

OWASP COMPASS - 31 scenarios :
- search_compass_scenarios, get_compass_scenario_by_id, get_compass_statistics

OWASP GenAI Data Security 2026 - 22 risques DSGAI :
- search_dsgai_risks, get_dsgai_risk_by_code (DSGAI01-21, DSPM)
- get_dsgai_statistics

OWASP Agentic AI - 29 menaces :
- search_agentic_security_threats, get_agentic_threat_by_id, get_maestro_layers

AI Risk Repository V4 - 1579 risques :
- search_ai_risk_database, get_ai_risk_statistics, get_ai_risk_domain_taxonomy

Donnees applicatives :
- search_ai_policies, get_policy_by_reference (regles SIA en base)
- search_test_results, get_test_statistics, get_test_targets, search_prompt_templates
- search_use_cases, search_threat_profiles, search_vulnerabilities, search_defenses
- analyze_risk_trends, get_owasp_categories
- get_module_explanations, get_platform_overview, get_supported_llm_providers, get_security_frameworks

Workflow obligatoire :
1. Identifier le ou les outils pertinents pour la question.
2. Appeler les outils (vous pouvez chainer plusieurs appels en parallele ou sequentiellement).
3. Construire la reponse uniquement avec les donnees retournees.
4. Citer explicitement les sources (IDs, references, codes : SIA-XXX, DSGAI##, COMPASS-UC-####, AST-###, LLM##, AISVS C##.#, T####, AI Act art. ##, RGPD art. ##, ISO ####, etc.).

Style de reponse :
- Toujours en francais.
- Structure claire (titres en markdown, listes, tableaux quand pertinent).
- Explicite quel outil a fourni quelle donnee.
- Si aucun outil ne donne de resultat probant : dites le clairement et suggerez une reformulation.`;

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
