import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API in agentic service:", error);
        throw new Error("Failed to get a response from the AI agent.");
    }
};