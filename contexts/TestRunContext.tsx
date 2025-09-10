import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TestResult, TestConfiguration, TestStatus } from '../types';
import { mockTestRunner } from '../services/testRunnerService';
import { generateTestPrompts } from '../services/geminiService';
import { useDataset } from './DatasetContext';

interface TestRunState {
  isRunning: boolean;
  isFinished: boolean;
  progress: number;
  results: TestResult[];
  configuration: TestConfiguration | null;
  startTest: (config: TestConfiguration) => Promise<void>;
  resetTest: () => void;
}

const TestRunContext = createContext<TestRunState | undefined>(undefined);

export const TestRunProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [configuration, setConfiguration] = useState<TestConfiguration | null>(null);
  const { promptTemplates } = useDataset();

  const startTest = useCallback(async (config: TestConfiguration) => {
    setIsRunning(true);
    setIsFinished(false);
    setResults([]);
    setProgress(0);
    setConfiguration(config);

    const prompts = await generateTestPrompts(config.categories, config.volume, promptTemplates);
    
    const initialResults: TestResult[] = prompts.map(p => ({
        prompt: p,
        score: 0,
        status: TestStatus.PENDING,
    }));
    setResults(initialResults);

    mockTestRunner(prompts, config, (update) => {
      setResults(prevResults => {
          const newResults = [...prevResults];
          const index = newResults.findIndex(r => r.prompt.id === update.prompt.id);
          if (index !== -1) {
              newResults[index] = update;
          }
          return newResults;
      });
      setProgress(prev => prev + 1 / prompts.length * 100);
    }).then(() => {
      setIsRunning(false);
      setIsFinished(true);
      setProgress(100);
    });
  }, [promptTemplates]);
  
  const resetTest = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setResults([]);
    setProgress(0);
    setConfiguration(null);
  }, []);

  return (
    <TestRunContext.Provider value={{ isRunning, isFinished, progress, results, configuration, startTest, resetTest }}>
      {children}
    </TestRunContext.Provider>
  );
};

export const useTestRun = (): TestRunState => {
  const context = useContext(TestRunContext);
  if (context === undefined) {
    throw new Error('useTestRun must be used within a TestRunProvider');
  }
  return context;
};