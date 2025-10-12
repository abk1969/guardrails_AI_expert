import { TestPrompt, TestConfiguration, TestResult, TestStatus, EvaluationStep, Sensitivity, PromptComplexity, SandboxDefenseConfig, AIComponentType } from '../types';
import { REMEDIATION_SUGGESTIONS, ATTACK_LIBRARY } from '../constants';
import { evaluatePromptInSandbox } from './sandboxService';

const createEvaluationStep = (stage: string, status: EvaluationStep['status'], details: string): EvaluationStep => ({
    stage,
    status,
    details,
    timestamp: new Date().toISOString(),
});

const getFailureChance = (sensitivity: Sensitivity, complexity: PromptComplexity): number => {
    const sensitivityMap: Record<Sensitivity, number> = { 'Tolérant': 1, 'Normal': 2, 'Strict': 3 };
    const complexityMap: Record<PromptComplexity, number> = { 'Simple': 1, 'Moyen': 2, 'Sophistiqué': 3 };

    const sensitivityScore = sensitivityMap[sensitivity];
    const complexityScore = complexityMap[complexity];

    // Simple Attack
    if (complexityScore === 1) { 
        if (sensitivityScore === 1) return 0.15; // Tolérant
        if (sensitivityScore === 2) return 0.10; // Normal
        if (sensitivityScore === 3) return 0.05; // Strict
    }
    // Medium Attack
    if (complexityScore === 2) {
        if (sensitivityScore === 1) return 0.40; // Tolérant
        if (sensitivityScore === 2) return 0.25; // Normal
        if (sensitivityScore === 3) return 0.15; // Strict
    }
    // Sophisticated Attack
    if (complexityScore === 3) {
        if (sensitivityScore === 1) return 0.75; // Tolérant
        if (sensitivityScore === 2) return 0.50; // Normal
        if (sensitivityScore === 3) return 0.30; // Strict
    }
    return 0.15; // Default
}

export const mockTestRunner = (
  prompts: TestPrompt[],
  config: TestConfiguration,
  onProgress: (result: TestResult) => void
): Promise<void> => {
  return new Promise(resolve => {
    let completed = 0;
    const isSandboxMode = config.target.componentType === AIComponentType.SANDBOX;

    prompts.forEach((prompt, index) => {
      const delay = (index * 100) + Math.random() * 50;
      setTimeout(() => {
        let finalResult: Partial<TestResult> = {};
        let evaluationChain: EvaluationStep[] = [];
        let response = '';

        const promptTemplate = ATTACK_LIBRARY.find(t => t.id === prompt.templateId);

        if (isSandboxMode && promptTemplate && config.sandboxConfig) {
            const sandboxEval = evaluatePromptInSandbox(promptTemplate, config.sandboxConfig);
            finalResult = {
                score: sandboxEval.score,
                status: sandboxEval.status,
                explanation: sandboxEval.explanation,
            };
            evaluationChain = sandboxEval.evaluationChain;
            response = sandboxEval.status === TestStatus.PASSED 
                ? promptTemplate.simulatedResponsePass 
                : promptTemplate.simulatedResponseFail;
        } else {
            // Original mock API logic for non-sandbox modes
            evaluationChain.push(createEvaluationStep('Étape 1 : Mise en File d\'Attente', 'INFO', `Le prompt est ajouté à la file d'attente pour la cible : ${config.target.name}.`));
            const sensitivity = config.categorySensitivities[prompt.category] || 'Normal';
            const complexity = prompt.complexity;
            
            evaluationChain.push(createEvaluationStep('Étape 2 : Analyse Pré-LLM (Guardrail d\'Entrée)', 'PASSED', 'Analyse de sécurité en amont. Le prompt est inspecté pour des menaces évidentes. Statut: AUCUNE VIOLATION DÉTECTÉE.'));
            evaluationChain.push(createEvaluationStep('Étape 3 : Appel API au LLM', 'INFO', `Simulation de l'appel à l'API cible. Le prompt formaté est envoyé à l'endpoint configuré.`));
            evaluationChain.push(createEvaluationStep('Étape 4 : Réception de la Réponse du LLM', 'INFO', 'Simulation de la réception d\'une réponse. La sortie brute du LLM est capturée.'));

            const failureChance = getFailureChance(sensitivity, complexity);
            const isFailed = Math.random() < failureChance;
            const score = isFailed ? Math.floor(Math.random() * 40) : 60 + Math.floor(Math.random() * 41);
            
            if (isFailed) {
                evaluationChain.push(createEvaluationStep('Étape 5 : Analyse Post-LLM (Guardrail de Sortie)', 'FAILED', `VIOLATION DÉTECTÉE. Sensibilité: '${sensitivity}', Complexité de l'attaque: '${complexity}'. La défense a été jugée insuffisante.`));
                evaluationChain.push(createEvaluationStep('Étape 6 : Décision Finale', 'FAILED', 'La réponse est BLOQUÉE en raison d\'une violation de politique.'));
            } else {
                evaluationChain.push(createEvaluationStep('Étape 5 : Analyse Post-LLM (Guardrail de Sortie)', 'PASSED', `CONFORME. Sensibilité: '${sensitivity}', Complexité de l'attaque: '${complexity}'. La défense a résisté à l'attaque.`));
                evaluationChain.push(createEvaluationStep('Étape 6 : Décision Finale', 'PASSED', 'La réponse est APPROUVÉE.'));
            }
            
            finalResult = {
                score,
                status: isFailed ? TestStatus.FAILED : TestStatus.PASSED,
                explanation: isFailed ? `Violation détectée basée sur une sensibilité '${sensitivity}' contre une attaque de complexité '${complexity}'.` : 'La réponse a passé tous les guardrails configurés.',
            };

            if (promptTemplate) {
                 response = finalResult.status === TestStatus.PASSED 
                    ? promptTemplate.simulatedResponsePass 
                    : promptTemplate.simulatedResponseFail;
            } else {
                response = `Mocked response for prompt: "${prompt.text.substring(0, 50)}..."`;
            }
        }

        let remediationSuggestion;
        if (finalResult.status === TestStatus.FAILED) {
            const suggestions = REMEDIATION_SUGGESTIONS[prompt.category] || [];
            if (suggestions.length > 0) {
                 remediationSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            }
        }

        const result: TestResult = {
          prompt,
          response,
          score: finalResult.score!,
          status: finalResult.status!,
          explanation: finalResult.explanation,
          evaluationChain,
          remediation: remediationSuggestion,
        };

        onProgress(result);
        
        completed++;
        if (completed === prompts.length) {
          resolve();
        }
      }, delay);
    });
  });
};