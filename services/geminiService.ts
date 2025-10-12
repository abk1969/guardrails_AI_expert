import { GoogleGenAI, Type } from "@google/genai";
import { GuardrailCategory, TestPrompt, PromptTemplate, PromptComplexity } from '../types';
import { ATTACK_LIBRARY } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This is a mock function since we don't have a real Gemini API key
// It creates variations of existing prompt templates
const mockGenerateTestPrompts = async (
  categories: GuardrailCategory[],
  count: number,
  promptTemplates: PromptTemplate[],
  complexities: PromptComplexity[]
): Promise<TestPrompt[]> => {
    if (categories.length === 0 || count === 0 || complexities.length === 0) {
        return [];
    }

    const generatedPrompts: TestPrompt[] = [];
    const filteredTemplates = promptTemplates.filter(p => 
        categories.includes(p.category) && complexities.includes(p.complexity)
    );

    if (filteredTemplates.length === 0) {
        console.warn(`No templates found for the selected criteria. Cannot generate prompts.`);
        return [];
    }

    for (let i = 0; i < count; i++) {
        const template = filteredTemplates[i % filteredTemplates.length];
        // Add a small variation to make it look "generated"
        const variationText = `${template.text} (variation #${Math.floor(i / filteredTemplates.length) + 1})`; 
        generatedPrompts.push({
            id: `prompt-mock-${template.category.replace(/\s/g, '')}-${crypto.randomUUID()}`,
            text: variationText,
            category: template.category,
            complexity: template.complexity,
            templateId: template.id,
        });
    }

    return generatedPrompts;
}


export const generateTestPrompts = async (
  categories: GuardrailCategory[],
  count: number,
  promptTemplates: PromptTemplate[],
  complexities: PromptComplexity[]
): Promise<TestPrompt[]> => {
    // We will use the mock function directly as we cannot use the real Gemini API.
    return mockGenerateTestPrompts(categories, count, promptTemplates, complexities);
};