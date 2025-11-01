/**
 * Zustand Store for Test Run Management
 *
 * Replaces: contexts/TestRunContext.tsx
 *
 * Benefits over Context API:
 * - Better performance (no Provider hell, selective subscriptions)
 * - Built-in DevTools
 * - Middleware support (persist, logger)
 * - Less boilerplate
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TestResult, TestConfiguration, TestStatus, HistoricalRun } from '../types';

interface TestRunState {
  // State
  isRunning: boolean;
  isFinished: boolean;
  progress: number;
  results: TestResult[];
  configuration: TestConfiguration | null;
  historicalRuns: HistoricalRun[];
  currentRunId: string | null;

  // Actions
  startTest: (config: TestConfiguration) => Promise<void>;
  resetTest: () => void;
  updateProgress: (progress: number) => void;
  addResult: (result: TestResult) => void;
  setFinished: (finished: boolean) => void;
  loadHistoricalRuns: () => void;
}

export const useTestRunStore = create<TestRunState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isRunning: false,
        isFinished: false,
        progress: 0,
        results: [],
        configuration: null,
        historicalRuns: [],
        currentRunId: null,

        // Actions
        startTest: async (config: TestConfiguration) => {
          const runId = `run-${Date.now()}`;

          set({
            isRunning: true,
            isFinished: false,
            progress: 0,
            results: [],
            configuration: config,
            currentRunId: runId,
          });

          // Test execution is now handled by backend
          // This would typically make an API call
          try {
            // Example: await apiClient.createTestRun(config)
            console.log('Test started with config:', config);
          } catch (error) {
            console.error('Failed to start test:', error);
            set({ isRunning: false });
          }
        },

        resetTest: () => {
          set({
            isRunning: false,
            isFinished: false,
            progress: 0,
            results: [],
            configuration: null,
            currentRunId: null,
          });
        },

        updateProgress: (progress: number) => {
          set({ progress });
        },

        addResult: (result: TestResult) => {
          set((state) => ({
            results: [...state.results, result],
          }));
        },

        setFinished: (finished: boolean) => {
          set({ isFinished: finished, isRunning: !finished });

          if (finished) {
            const { configuration, results, currentRunId } = get();
            if (configuration && results.length > 0 && currentRunId) {
              const newRun: HistoricalRun = {
                id: currentRunId,
                date: new Date().toISOString(),
                configuration,
                results,
              };

              set((state) => ({
                historicalRuns: [...state.historicalRuns, newRun].slice(-20),
              }));
            }
          }
        },

        loadHistoricalRuns: () => {
          // Load from localStorage or API
          const stored = localStorage.getItem('llmGuardrailTestHistory');
          if (stored) {
            try {
              set({ historicalRuns: JSON.parse(stored) });
            } catch (error) {
              console.error('Failed to load historical runs:', error);
            }
          }
        },
      }),
      {
        name: 'test-run-storage',
        // Only persist certain fields
        partialize: (state) => ({
          historicalRuns: state.historicalRuns,
        }),
      }
    ),
    {
      name: 'TestRunStore',
    }
  )
);

// Selectors for optimized subscriptions
export const useTestProgress = () => useTestRunStore((state) => state.progress);
export const useTestResults = () => useTestRunStore((state) => state.results);
export const useIsTestRunning = () => useTestRunStore((state) => state.isRunning);
export const useCurrentConfiguration = () => useTestRunStore((state) => state.configuration);

// Computed selectors
export const useTestStatistics = () =>
  useTestRunStore((state) => {
    const results = state.results;
    return {
      total: results.length,
      passed: results.filter((r) => r.status === TestStatus.PASSED).length,
      failed: results.filter((r) => r.status === TestStatus.FAILED).length,
      averageScore:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.score, 0) / results.length
          : 0,
    };
  });
