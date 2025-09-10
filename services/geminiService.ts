import { GuardrailCategory, TestPrompt, PromptTemplate } from '../types';

// This is a mock service. In a real application, this would use the Gemini API.
// For example: `await ai.models.generateContent({ model: 'gemini-2.5-flash', ... })`
// to generate varied and realistic prompts based on categories.

export const generateTestPrompts = async (
  categories: GuardrailCategory[],
  count: number,
  promptTemplates: Record<GuardrailCategory, PromptTemplate[]>
): Promise<TestPrompt[]> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  const selectedPrompts: TestPrompt[] = [];
  
  if (categories.length === 0) return [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const templatesForCategory = promptTemplates[category];
    
    if (!templatesForCategory || templatesForCategory.length === 0) {
      continue; // Skip if a category has no prompt templates
    }

    const template = templatesForCategory[Math.floor(Math.random() * templatesForCategory.length)];
    selectedPrompts.push({
      id: `prompt-${Date.now()}-${i}`,
      text: `${template.text} (variation ${i + 1})`,
      category: category,
    });
  }

  return selectedPrompts;
};