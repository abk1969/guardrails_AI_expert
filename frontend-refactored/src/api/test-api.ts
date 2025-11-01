/**
 * TanStack Query API Client for Test Execution
 *
 * Replaces: services/testRunnerService.ts + geminiService.ts
 *
 * Benefits:
 * - Automatic caching and cache invalidation
 * - Loading and error states
 * - Retry logic
 * - Optimistic updates
 * - Request deduplication
 * - Polling and real-time updates
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { TestRun, TestResult, TestConfiguration, TestTarget, PromptTemplate } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ==============================================
// API CLIENT
// ==============================================

class TestApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}/api/v1/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Test Runs
  async createTestRun(config: TestConfiguration): Promise<TestRun> {
    return this.request('tests/run', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getTestRuns(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<TestRun[]> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`tests/runs?${queryParams}`);
  }

  async getTestRun(id: string): Promise<TestRun> {
    return this.request(`tests/runs/${id}`);
  }

  async getTestResults(
    runId: string,
    filters?: { status?: string; category?: string }
  ): Promise<TestResult[]> {
    const queryParams = new URLSearchParams(filters as any).toString();
    return this.request(`tests/runs/${runId}/results?${queryParams}`);
  }

  async cancelTestRun(id: string): Promise<{ message: string }> {
    return this.request(`tests/runs/${id}/cancel`, { method: 'POST' });
  }

  async retryFailedTests(id: string): Promise<TestRun> {
    return this.request(`tests/runs/${id}/retry`, { method: 'POST' });
  }

  // Test Targets
  async getTestTargets(): Promise<TestTarget[]> {
    return this.request('tests/targets');
  }

  async createTestTarget(target: Partial<TestTarget>): Promise<TestTarget> {
    return this.request('tests/targets', {
      method: 'POST',
      body: JSON.stringify(target),
    });
  }

  // Prompt Templates
  async getPromptTemplates(filters?: {
    category?: string;
    complexity?: string;
  }): Promise<PromptTemplate[]> {
    const queryParams = new URLSearchParams(filters as any).toString();
    return this.request(`tests/prompt-templates?${queryParams}`);
  }

  // Real-time streaming (SSE)
  streamTestResults(runId: string): EventSource {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api/v1/tests/runs/${runId}/stream`;
    const eventSource = new EventSource(url);

    // Add auth header via custom event source if needed
    // For now, SSE doesn't support custom headers easily
    // Consider WebSocket for authenticated real-time data

    return eventSource;
  }
}

export const testApiClient = new TestApiClient();

// ==============================================
// REACT QUERY HOOKS
// ==============================================

// Query keys factory for better cache management
export const testKeys = {
  all: ['tests'] as const,
  runs: () => [...testKeys.all, 'runs'] as const,
  run: (id: string) => [...testKeys.runs(), id] as const,
  results: (runId: string) => [...testKeys.run(runId), 'results'] as const,
  targets: () => [...testKeys.all, 'targets'] as const,
  templates: () => [...testKeys.all, 'templates'] as const,
};

// ==============================================
// QUERIES
// ==============================================

/**
 * Fetch all test runs
 */
export const useTestRuns = (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [...testKeys.runs(), params],
    queryFn: () => testApiClient.getTestRuns(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch a single test run by ID
 */
export const useTestRun = (id: string, options?: UseQueryOptions<TestRun>) => {
  return useQuery({
    queryKey: testKeys.run(id),
    queryFn: () => testApiClient.getTestRun(id),
    staleTime: 10000, // 10 seconds
    ...options,
  });
};

/**
 * Fetch test results with polling
 */
export const useTestResults = (
  runId: string,
  options?: { refetchInterval?: number }
) => {
  return useQuery({
    queryKey: testKeys.results(runId),
    queryFn: () => testApiClient.getTestResults(runId),
    refetchInterval: options?.refetchInterval || false,
    staleTime: 5000, // 5 seconds
  });
};

/**
 * Fetch test targets
 */
export const useTestTargets = () => {
  return useQuery({
    queryKey: testKeys.targets(),
    queryFn: () => testApiClient.getTestTargets(),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Fetch prompt templates
 */
export const usePromptTemplates = (filters?: {
  category?: string;
  complexity?: string;
}) => {
  return useQuery({
    queryKey: [...testKeys.templates(), filters],
    queryFn: () => testApiClient.getPromptTemplates(filters),
    staleTime: 600000, // 10 minutes
  });
};

// ==============================================
// MUTATIONS
// ==============================================

/**
 * Create a new test run
 */
export const useCreateTestRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: TestConfiguration) => testApiClient.createTestRun(config),
    onSuccess: (newRun) => {
      // Invalidate and refetch runs list
      queryClient.invalidateQueries({ queryKey: testKeys.runs() });

      // Optimistically add the new run to cache
      queryClient.setQueryData(testKeys.run(newRun.id), newRun);
    },
  });
};

/**
 * Cancel a running test
 */
export const useCancelTestRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => testApiClient.cancelTestRun(runId),
    onSuccess: (_, runId) => {
      // Invalidate the specific run
      queryClient.invalidateQueries({ queryKey: testKeys.run(runId) });
      queryClient.invalidateQueries({ queryKey: testKeys.runs() });
    },
  });
};

/**
 * Retry failed tests
 */
export const useRetryFailedTests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => testApiClient.retryFailedTests(runId),
    onSuccess: (newRun) => {
      queryClient.invalidateQueries({ queryKey: testKeys.runs() });
      queryClient.setQueryData(testKeys.run(newRun.id), newRun);
    },
  });
};

/**
 * Create a new test target
 */
export const useCreateTestTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: Partial<TestTarget>) =>
      testApiClient.createTestTarget(target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.targets() });
    },
  });
};

// ==============================================
// REAL-TIME HOOKS
// ==============================================

/**
 * Subscribe to test results in real-time
 */
export const useTestResultsStream = (
  runId: string,
  onResult: (result: TestResult) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!runId) return;

    const eventSource = testApiClient.streamTestResults(runId);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data) as TestResult;
        onResult(result);
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      setError(new Error('SSE connection error'));
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [runId, onResult]);

  return { isConnected, error };
};
