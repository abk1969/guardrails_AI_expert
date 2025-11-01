// ⚠️ SÉCURITÉ: La clé API ne doit JAMAIS être exposée côté client!
// Tous les appels Gemini passent maintenant par le backend de manière sécurisée.
// ✅ Ce service utilise uniquement l'API backend sécurisée.

const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

console.log('✅ agenticService.ts configuré en mode backend sécurisé');

/**
 * This function acts as the "MCP Server".
 * It receives the user's raw prompt and the full application context from the "MCP Client".
 * It then constructs a comprehensive prompt for the GenAI model, instructing it to act as an expert
 * on the provided data, and returns the model's response.
 * @param userPrompt The user's question.
 * @param appContext A snapshot of all data from the application's contexts.
 * @returns The text response from the generative model.
 */
export const runAgenticQuery = async (userPrompt: string, appContext: object): Promise<string> => {
    
    // Clean up context to remove potentially large or irrelevant data for the prompt
    // For example, we don't need the full prompt text from the attack library, just the guide.
    const simplifiedContext = {
        ...appContext,
        attackLibrary: (appContext as any).attackLibrary.map((p: any) => ({
            id: p.id,
            category: p.category,
            attackFamily: p.attackFamily,
            guide: p.guide, // Only include the guide, not the full text
            complexity: p.complexity,
        }))
    };

    const systemInstruction = `Vous êtes un assistant de gouvernance et de sécurité IA de classe mondiale pour une application nommée "AI RISK MANAGER".
Votre unique but est de répondre à la question de l'utilisateur en vous basant *exclusivement* sur les données JSON fournies dans le 'Contexte de l'Application'.
N'utilisez aucune connaissance externe. Si la réponse ne se trouve pas dans le contexte, déclarez que vous ne pouvez pas trouver l'information dans les données de l'application.
Soyez serviable, concis et professionnel. Toutes vos réponses doivent être rédigées en français.
Lorsque vous faites référence à des points de données spécifiques, essayez de mentionner leur ID ou leur nom si disponible.
Analysez minutieusement le contexte JSON fourni pour donner la réponse la plus précise possible.`;

    const contents = `${systemInstruction}

## Question de l'utilisateur :
"${userPrompt}"

## Contexte de l'application (Données JSON) :
\`\`\`json
${JSON.stringify(simplifiedContext, null, 2)}
\`\`\`
`;

    try {
        // ✅ Option 1: Appeler le backend sécurisé (RECOMMANDÉ)
        console.log('🔒 Appel du backend sécurisé pour génération IA...');
        try {
            const response = await fetch(`${BACKEND_API_URL}/gemini/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: contents,
                    context: simplifiedContext,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            } else {
                console.warn('⚠️ Backend non disponible, mode fallback activé');
            }
        } catch (backendError) {
            console.warn('⚠️ Erreur backend:', backendError);
            // Fallback si backend non disponible
        }

        // ✅ Option 2 (Fallback): Générer réponse intelligente à partir du contexte applicatif
        console.log('💡 Mode fallback intelligent - génération de réponse à partir du contexte applicatif');
        console.log('📊 Contexte disponible:', {
            policies: simplifiedContext.aiPolicies?.policies?.length || 0,
            tests: simplifiedContext.testRun?.results?.length || 0,
            useCases: simplifiedContext.useCases?.useCases?.length || 0,
            vulnerabilities: simplifiedContext.vulnerabilities?.items?.length || 0,
        });
        return generateFallbackResponse(userPrompt, simplifiedContext);

    } catch (error) {
        console.error("❌ Erreur dans agentic service:", error);
        return generateFallbackResponse(userPrompt, simplifiedContext);
    }
};

/**
 * Génère une réponse de secours basée sur le contexte applicatif
 * Utilisé quand ni le backend ni la clé API Gemini ne sont disponibles
 */
function generateFallbackResponse(userPrompt: string, context: any): string {
    const promptLower = userPrompt.toLowerCase();

    // Analyser le contexte pour extraire des informations utiles
    const policies = context.aiPolicies?.policies || [];
    const testResults = context.testRun?.results || [];
    const useCases = context.useCases?.useCases || [];
    const vulnerabilities = context.vulnerabilities?.items || [];

    // Questions sur les politiques SIA
    if (promptLower.includes('sia') || promptLower.includes('politique') || promptLower.includes('règle')) {
        if (policies.length > 0) {
            const policyList = policies.slice(0, 5).map((p: any) =>
                `• **${p.reference}**: ${p.ruleText}`
            ).join('\n');

            return `📋 **Politiques SIA disponibles** (${policies.length} règles):\n\n${policyList}\n\n` +
                   `💡 *Note: Pour des analyses détaillées, configurez une clé API Gemini ou démarrez le backend.*`;
        }
    }

    // Questions sur les tests
    if (promptLower.includes('test') || promptLower.includes('résultat')) {
        if (testResults.length > 0) {
            const passed = testResults.filter((t: any) => t.status === 'passed').length;
            const failed = testResults.filter((t: any) => t.status === 'failed').length;
            const rate = ((passed / testResults.length) * 100).toFixed(1);

            return `📊 **Résultats de tests**:\n\n` +
                   `• Total: ${testResults.length} tests\n` +
                   `• Réussis: ${passed} ✅\n` +
                   `• Échoués: ${failed} ❌\n` +
                   `• Taux de réussite: ${rate}%\n\n` +
                   `💡 *Note: Pour des recommandations détaillées, configurez une clé API Gemini ou démarrez le backend.*`;
        } else {
            return `ℹ️ Aucun test n'a encore été exécuté.\n\n` +
                   `Pour tester vos guardrails:\n` +
                   `1. Accédez au **Tableau de bord**\n` +
                   `2. Configurez vos paramètres de test\n` +
                   `3. Générez et exécutez des tests`;
        }
    }

    // Questions sur les cas d'usage
    if (promptLower.includes('cas d\'usage') || promptLower.includes('use case')) {
        if (useCases.length > 0) {
            const useCaseList = useCases.slice(0, 5).map((uc: any) =>
                `• **${uc.name}** - Niveau de risque: ${uc.riskLevel || 'Non évalué'}`
            ).join('\n');

            return `🎯 **Cas d'usage disponibles** (${useCases.length} total):\n\n${useCaseList}\n\n` +
                   `💡 *Note: Pour des analyses de risque détaillées, configurez une clé API Gemini ou démarrez le backend.*`;
        }
    }

    // Questions sur les vulnérabilités
    if (promptLower.includes('vulnérabilité') || promptLower.includes('owasp') || promptLower.includes('cve')) {
        if (vulnerabilities.length > 0) {
            const vulnList = vulnerabilities.slice(0, 5).map((v: any) =>
                `• **${v.id || v.reference}**: ${v.name || v.title}`
            ).join('\n');

            return `🛡️ **Vulnérabilités connues** (${vulnerabilities.length} total):\n\n${vulnList}\n\n` +
                   `💡 *Note: Pour des détails techniques, configurez une clé API Gemini ou démarrez le backend.*`;
        }
    }

    // Réponse générique avec statistiques du contexte
    return `🤖 **Assistant AI RISK MANAGER** (Mode Hors-ligne)\n\n` +
           `📊 **Données disponibles dans votre application**:\n` +
           `• ${policies.length} politiques SIA\n` +
           `• ${testResults.length} résultats de tests\n` +
           `• ${useCases.length} cas d'usage\n` +
           `• ${vulnerabilities.length} vulnérabilités référencées\n\n` +
           `❓ **Votre question**: "${userPrompt}"\n\n` +
           `⚠️ **Mode dégradé actif**: Pour obtenir des réponses intelligentes et contextuelles:\n` +
           `1. **Option recommandée**: Configurez le backend sécurisé\n` +
           `2. **Option développement**: Ajoutez VITE_GEMINI_API_KEY dans .env (risque de sécurité)\n\n` +
           `💡 Je peux actuellement vous fournir des statistiques basiques, mais pas d'analyse approfondie.`;
}