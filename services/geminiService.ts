import { GuardrailCategory, TestPrompt, PromptTemplate, PromptComplexity } from '../types';
import { mcpClient } from './mcpClientService';

// ⚠️ SÉCURITÉ: La clé API ne doit JAMAIS être exposée côté client!
// Tous les appels Gemini doivent passer par le backend.
// ✅ Utiliser geminiServiceSecure.ts à la place de ce fichier!

// Pour le chat, utiliser l'endpoint backend sécurisé
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// ⚠️ DÉPRÉCIÉ: N'utilisez plus ce service!
// ✅ Utilisez geminiServiceSecure.ts à la place
console.warn('⚠️ geminiService.ts est déprécié. Utilisez geminiServiceSecure.ts pour des appels sécurisés.');

// This is a mock function for fallback or offline mode.
// It creates variations of existing prompt templates.
const mockGenerateTestPrompts = async (
  categories: GuardrailCategory[],
  count: number,
  promptTemplates: PromptTemplate[],
  complexities: PromptComplexity[]
): Promise<TestPrompt[]> => {
    console.warn("Falling back to mock prompt generation.");
    if (categories.length === 0 || count === 0 || complexities.length === 0) {
        return [];
    }

    const generatedPrompts: TestPrompt[] = [];
    const filteredTemplates = promptTemplates.filter(p => 
        categories.includes(p.category) && complexities.includes(p.complexity)
    );

    if (filteredTemplates.length === 0) {
        console.warn(`No templates found for the selected criteria in mock generation.`);
        return [];
    }

    for (let i = 0; i < count; i++) {
        const template = filteredTemplates[i % filteredTemplates.length];
        // Add a small variation to make it look "generated"
        const variationText = `${template.text} (variation #${Math.floor(i / filteredTemplates.length) + 1})`; 
        generatedPrompts.push({
            id: `prompt-mock-${crypto.randomUUID()}`,
            text: variationText,
            category: template.category,
            complexity: template.complexity,
            templateId: template.id,
        });
    }

    return generatedPrompts;
}


/**
 * ⚠️ DÉPRÉCIÉ: Cette fonction ne doit plus être utilisée!
 * ✅ Utilisez generateTestPromptsSecure() de geminiServiceSecure.ts
 *
 * Cette fonction génère maintenant uniquement des prompts mock locaux
 */
export const generateTestPrompts = async (
  categories: GuardrailCategory[],
  count: number,
  promptTemplates: PromptTemplate[],
  complexities: PromptComplexity[]
): Promise<TestPrompt[]> => {
    console.warn('⚠️ ATTENTION: Utilisation de generateTestPrompts() dépréciée. Utilisez generateTestPromptsSecure() à la place.');

    if (categories.length === 0 || count === 0 || complexities.length === 0) {
        return [];
    }

    // Fallback vers génération mock
    return mockGenerateTestPrompts(categories, count, promptTemplates, complexities);
};

/**
 * Chat function for the chatbot with MCP context retrieval
 * ✅ VERSION SÉCURISÉE: Appelle le backend au lieu de Gemini directement
 * @param message - User message
 * @param mode - Chat mode (normal, expert, concise)
 * @returns Assistant response
 */
const chat = async (message: string, mode: 'normal' | 'expert' | 'concise' = 'normal'): Promise<string> => {
    try {
        // Option 1: Utiliser le backend sécurisé (RECOMMANDÉ)
        console.log('🔒 Appel sécurisé via backend...');

        const response = await fetch(`${BACKEND_API_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, mode }),
        });

        if (!response.ok) {
            // Si le backend n'est pas disponible, utiliser le mode dégradé
            console.warn('⚠️ Backend non disponible, mode dégradé activé');
            return chatDegradeMode(message, mode);
        }

        const data = await response.json();
        return data.response || data;

    } catch (error) {
        console.error("❌ Erreur backend, basculement en mode dégradé:", error);
        return chatDegradeMode(message, mode);
    }
};

/**
 * Mode dégradé: Réponses intelligentes basées sur le contexte MCP
 * Utilisé quand le backend n'est pas disponible
 */
const chatDegradeMode = async (message: string, mode: 'normal' | 'expert' | 'concise'): Promise<string> => {
    console.log('🔍 Mode dégradé: Génération de réponse à partir du contexte MCP...');

    const messageLower = message.toLowerCase();

    try {
        // Déterminer le type de question et générer une réponse appropriée

        // Questions sur les tests
        if (messageLower.includes('test') || messageLower.includes('guardrail')) {
            const stats = await mcpClient.getTestStatistics();
            if (stats && stats.total > 0) {
                return formatTestResponse(stats, mode);
            } else {
                return "Pour tester vos guardrails, vous pouvez:\n\n" +
                       "1. **Accéder au module de test**: Cliquez sur 'Tableau de bord' dans le menu\n" +
                       "2. **Configurer un test**: Sélectionnez les catégories et la complexité\n" +
                       "3. **Générer des prompts**: Le système créera des prompts d'attaque\n" +
                       "4. **Exécuter les tests**: Analysez les résultats en temps réel\n\n" +
                       "Les tests couvrent 5 catégories: Sécurité/Confidentialité, Pertinence, Qualité, Contenu, et Logique.";
            }
        }

        // Questions sur les politiques SIA
        if (messageLower.includes('sia') || messageLower.includes('politique') || messageLower.includes('règle')) {
            const siaMatch = messageLower.match(/sia-?(\d+)/);
            if (siaMatch) {
                const ref = `SIA-${siaMatch[1].padStart(2, '0')}`;
                const policy = await mcpClient.getPolicy(ref);
                if (policy.found) {
                    return formatPolicyResponse(policy.policy, mode);
                }
            }

            return "Les politiques SIA (CLUSIF) sont disponibles dans l'onglet 'Politique IA'.\n\n" +
                   "Elles comprennent 22 règles couvrant:\n" +
                   "- Gouvernance et stratégie IA\n" +
                   "- Sécurité et conformité\n" +
                   "- Gestion des risques\n" +
                   "- Éthique et responsabilité\n\n" +
                   "Exemples: SIA-01 (Gouvernance), SIA-07 (Sécurité des données), SIA-15 (Gestion des incidents)";
        }

        // Questions sur les vulnérabilités
        if (messageLower.includes('vulnérabilité') || messageLower.includes('owasp') || messageLower.includes('cve')) {
            const owaspInfo = await mcpClient.getOwaspCategories();
            return formatOwaspResponse(owaspInfo, mode);
        }

        // Questions sur les risques
        if (messageLower.includes('risque') || messageLower.includes('évaluation')) {
            return "L'application offre plusieurs modules pour gérer les risques IA:\n\n" +
                   "📋 **Cas d'Usage**: Évaluez les risques de vos scénarios IA\n" +
                   "🎯 **Profil de Menace**: Identifiez les menaces spécifiques\n" +
                   "🔍 **Surface d'Attaque**: Analysez les points d'entrée\n" +
                   "⚠️ **Vulnérabilités Connues**: Consultez les CVE et OWASP LLM\n\n" +
                   "Consultez le 'Référentiel Risques IA' pour une vue complète.";
        }

        // Question générale ou non reconnue
        return generateGenericResponse(message, mode);

    } catch (error) {
        console.error('Erreur mode dégradé:', error);
        return "Je peux vous aider avec:\n\n" +
               "• **Tests de guardrails**: Configuration et exécution\n" +
               "• **Politiques SIA**: 22 règles de sécurité IA\n" +
               "• **Vulnérabilités OWASP**: LLM Top 10 et Agentic AI\n" +
               "• **Gestion des risques**: Évaluations et mitigations\n\n" +
               "Posez-moi une question spécifique sur ces sujets!";
    }
};

/**
 * Formate une réponse sur les statistiques de tests
 */
function formatTestResponse(stats: any, mode: string): string {
    const { total, passed, failed, passRate, byCategory } = stats;

    let response = `📊 **Résultats de vos tests guardrails**\n\n`;
    response += `**Statistiques globales:**\n`;
    response += `• Total de tests: ${total}\n`;
    response += `• Tests réussis: ${passed} ✅\n`;
    response += `• Tests échoués: ${failed} ❌\n`;
    response += `• Taux de réussite: ${passRate}%\n\n`;

    if (byCategory && byCategory.length > 0) {
        response += `**Par catégorie:**\n`;
        byCategory.forEach((cat: any) => {
            response += `• ${cat.category}: ${cat.count} tests\n`;
        });
    }

    response += `\n**Recommandations:**\n`;
    if (parseFloat(passRate) < 70) {
        response += `⚠️ Votre taux de réussite est faible. Considérez:\n`;
        response += `1. Renforcer vos règles de filtrage\n`;
        response += `2. Améliorer la détection d'injections\n`;
        response += `3. Revoir les configurations des guardrails\n`;
    } else if (parseFloat(passRate) < 90) {
        response += `✓ Performance correcte, mais améliorable:\n`;
        response += `1. Analysez les tests échoués\n`;
        response += `2. Affinez les seuils de détection\n`;
        response += `3. Testez avec des prompts plus complexes\n`;
    } else {
        response += `✅ Excellent taux de réussite!\n`;
        response += `Continuez avec des tests plus sophistiqués pour garantir la robustesse.\n`;
    }

    return response;
}

/**
 * Formate une réponse sur une politique SIA
 */
function formatPolicyResponse(policy: any, mode: string): string {
    let response = `📋 **${policy.reference}: ${policy.ruleText}**\n\n`;

    if (policy.associatedThreat) {
        response += `🎯 **Menace associée:**\n${policy.associatedThreat}\n\n`;
    }

    if (policy.associatedRisk) {
        response += `⚠️ **Risque:**\n${policy.associatedRisk}\n\n`;
    }

    if (policy.implementationGuide) {
        response += `✅ **Guide d'implémentation:**\n${policy.implementationGuide.substring(0, 300)}...\n\n`;
    }

    response += `📌 **Statut:** ${policy.status}\n`;

    if (mode !== 'concise' && policy.testingGuide) {
        response += `\n🧪 **Pour tester cette règle:**\n${policy.testingGuide.substring(0, 200)}...\n`;
    }

    return response;
}

/**
 * Formate une réponse sur OWASP
 */
function formatOwaspResponse(owaspInfo: any, mode: string): string {
    let response = `🛡️ **Vulnérabilités OWASP pour LLM**\n\n`;

    response += `**OWASP LLM Top 10:**\n`;
    owaspInfo.llmTop10.slice(0, 5).forEach((item: any) => {
        response += `• **${item.id}**: ${item.name}\n`;
    });

    if (mode !== 'concise') {
        response += `\n**OWASP Agentic AI Top 15:**\n`;
        owaspInfo.agenticAI.forEach((item: any) => {
            response += `• **${item.id}**: ${item.name}\n`;
        });

        response += `\n💡 **Pour plus de détails:**\n`;
        response += `Consultez les modules "Vuln IA Connues" et "Référence: Défenses" dans l'application.\n`;
    }

    return response;
}

/**
 * Génère une réponse générique utile
 */
function generateGenericResponse(message: string, mode: string): string {
    return "Je suis l'assistant AI Risk Manager. Je peux vous aider avec:\n\n" +
           "🧪 **Tests de sécurité:**\n" +
           "• Configuration et exécution de tests guardrails\n" +
           "• Analyse des résultats et recommandations\n" +
           "• Génération de prompts d'attaque\n\n" +
           "📋 **Politiques et conformité:**\n" +
           "• 22 règles SIA du CLUSIF\n" +
           "• Guides d'implémentation et de test\n" +
           "• Scénarios de risques associés\n\n" +
           "🛡️ **Sécurité IA:**\n" +
           "• OWASP LLM Top 10\n" +
           "• Vulnérabilités connues (CVE)\n" +
           "• Défenses et mitigations\n\n" +
           "Posez-moi une question spécifique sur ces sujets!\n\n" +
           "💡 *Note: Pour des réponses générées par IA avancée, le backend doit être actif.*";
}

export const geminiService = {
    chat
};
