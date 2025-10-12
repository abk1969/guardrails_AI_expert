import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { TestResult, TestConfiguration, TestStatus, HistoricalRun } from '../types';
import { mockTestRunner } from '../services/testRunnerService';
import { generateTestPrompts } from '../services/geminiService';
import { useDataset } from './DatasetContext';

interface TestRunState {
  isRunning: boolean;
  isFinished: boolean;
  progress: number;
  results: TestResult[];
  configuration: TestConfiguration | null;
  historicalRuns: HistoricalRun[];
  startTest: (config: TestConfiguration) => Promise<void>;
  resetTest: () => void;
}

const TestRunContext = createContext<TestRunState | undefined>(undefined);

const TEST_HISTORY_KEY = 'llmGuardrailTestHistory';

export const TestRunProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [configuration, setConfiguration] = useState<TestConfiguration | null>(null);
  const [historicalRuns, setHistoricalRuns] = useState<HistoricalRun[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const { promptTemplates } = useDataset();

  useEffect(() => {
    try {
        const storedData = localStorage.getItem(TEST_HISTORY_KEY);
        if (storedData) {
            setHistoricalRuns(JSON.parse(storedData));
        }
    } catch (error) {
        console.error("Failed to load test history from localStorage", error);
        setHistoricalRuns([]);
    }
  }, []);
  
  useEffect(() => {
    if (isFinished && configuration && results.length > 0 && runId) {
        const newRun: HistoricalRun = {
            id: runId,
            date: new Date().toISOString(),
            configuration: configuration,
            results: results
        };
        
        setHistoricalRuns(prevRuns => {
            if (prevRuns.some(run => run.id === newRun.id)) {
                return prevRuns; // Already saved
            }
            const updatedRuns = [...prevRuns, newRun].slice(-20); // Keep last 20 runs
            try {
                localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(updatedRuns));
            } catch (error) {
                console.error("Failed to save test history to localStorage", error);
            }
            return updatedRuns;
        });
        setRunId(null); // Reset runId after saving
    }
  }, [isFinished, configuration, results, runId]);

  const startTest = useCallback(async (config: TestConfiguration) => {
    setIsRunning(true);
    setIsFinished(false);
    setResults([]);
    setProgress(0);
    setConfiguration(config);
    setRunId(`run-${Date.now()}`);

    const prompts = await generateTestPrompts(config.categories, config.volume, promptTemplates, config.complexities);
    
    if (prompts.length === 0) {
        setIsRunning(false);
        setIsFinished(true);
        setProgress(100);
        console.warn("Prompt generation resulted in an empty set. Test finished prematurely.");
        return;
    }

    const initialResults: TestResult[] = prompts.map(p => ({
        prompt: p,
        score: 0,
        status: TestStatus.PENDING,
        evaluationChain: [],
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
    setRunId(null);
  }, []);

  return (
    <TestRunContext.Provider value={{ isRunning, isFinished, progress, results, configuration, historicalRuns, startTest, resetTest }}>
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