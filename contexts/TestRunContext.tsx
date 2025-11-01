import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { TestResult, TestConfiguration, TestStatus, HistoricalRun } from '../types';
import { mockTestRunner } from '../services/testRunnerService';
import { generateTestPromptsSecure } from '../services/geminiServiceSecure';
import { promptfooIntegrationService } from '../services/promptfooIntegrationService';
import { backendApiService } from '../services/backendApiService';
import { useDataset } from './DatasetContext';

export type TestMode = 'simulation' | 'real' | 'backend';

interface TestRunState {
  isRunning: boolean;
  isFinished: boolean;
  progress: number;
  results: TestResult[];
  configuration: TestConfiguration | null;
  historicalRuns: HistoricalRun[];
  testMode: TestMode;
  setTestMode: (mode: TestMode) => void;
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
  const [testMode, setTestMode] = useState<TestMode>('simulation');
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

    try {
      if (testMode === 'backend') {
        // 🔥 MODE BACKEND avec NestJS + WebSocket temps réel
        console.log('🔥 Lancement en MODE BACKEND avec API NestJS');

        // 1. Connecter WebSocket si pas déjà connecté
        if (!backendApiService.isWebSocketConnected()) {
          await backendApiService.connectWebSocket();
        }

        // 2. Créer le test run sur le backend
        const { testRunId } = await backendApiService.createTestRun(config);
        console.log(`✅ Test run créé: ${testRunId}`);

        // 3. S'abonner aux mises à jour temps réel
        const unsubscribe = backendApiService.subscribeToTestRun(testRunId, {
          onProgress: (data) => {
            console.log('[Backend] Progression:', data.progress);
            setProgress(data.progress);
          },
          onResult: ({ result }) => {
            console.log('[Backend] Nouveau résultat reçu');
            setResults(prevResults => [...prevResults, result]);
          },
          onCompleted: (data) => {
            console.log('✅ Tests backend terminés:', data);
            setIsRunning(false);
            setIsFinished(true);
            setProgress(100);
            unsubscribe(); // Se désabonner
          },
          onError: (error) => {
            console.error('❌ Erreur backend:', error);
            alert(`Erreur backend: ${error.error.message}`);
            setIsRunning(false);
            setIsFinished(false);
            unsubscribe();
          },
        });

        console.log('🔌 Abonné aux mises à jour WebSocket');

      } else if (testMode === 'real') {
        // 🆕 MODE RÉEL avec Promptfoo
        console.log('🔥 Lancement en MODE RÉEL avec Promptfoo');

        let totalResults = 0;
        let processedResults = 0;

        await promptfooIntegrationService.runRealTests(
          config,
          (result) => {
            // Callback pour chaque résultat
            setResults(prevResults => {
              const newResults = [...prevResults, result];
              processedResults = newResults.length;
              return newResults;
            });

            // Mettre à jour la progression (estimation)
            setProgress((processedResults / (config.volume || 10)) * 100);
          },
          (logMessage) => {
            // Callback pour les logs (optionnel)
            console.log(`[Promptfoo] ${logMessage}`);
          }
        );

        setIsRunning(false);
        setIsFinished(true);
        setProgress(100);
        console.log('✅ Tests réels terminés');

      } else {
        // Mode simulation (code existant)
        // 🔒 Utilise le service sécurisé via backend
        const prompts = await generateTestPromptsSecure(config.categories, config.volume, config.complexities);

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
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution des tests:', error);
      alert(`Erreur lors de l'exécution: ${error.message || error}`);
      setIsRunning(false);
      setIsFinished(false);
    }
  }, [promptTemplates, testMode]);
  
  const resetTest = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setResults([]);
    setProgress(0);
    setConfiguration(null);
    setRunId(null);
  }, []);

  return (
    <TestRunContext.Provider value={{
      isRunning,
      isFinished,
      progress,
      results,
      configuration,
      historicalRuns,
      testMode,
      setTestMode,
      startTest,
      resetTest
    }}>
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