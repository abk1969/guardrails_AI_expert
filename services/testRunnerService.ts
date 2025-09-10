
import { TestPrompt, TestConfiguration, TestResult, TestStatus } from '../types';

// This is a mock service to simulate running tests against an LLM backend.
// It generates random results for demonstration purposes.

export const mockTestRunner = (
  prompts: TestPrompt[],
  config: TestConfiguration,
  onProgress: (result: TestResult) => void
): Promise<void> => {
  return new Promise(resolve => {
    let completed = 0;

    prompts.forEach((prompt, index) => {
      const delay = (index * 100) + Math.random() * 50;
      setTimeout(() => {
        const isFailed = Math.random() < 0.15; // 15% chance of failure
        const score = isFailed ? Math.floor(Math.random() * 40) : 60 + Math.floor(Math.random() * 41);
        
        const result: TestResult = {
          prompt,
          response: `Mocked response for prompt: "${prompt.text.substring(0, 30)}..." on model ${config.model}.`,
          score,
          status: isFailed ? TestStatus.FAILED : TestStatus.PASSED,
          explanation: isFailed ? 'Detected potential policy violation.' : 'Response passed all checks.',
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
