/**
 * Refactored Dashboard Component
 *
 * Changes from original:
 * 1. Uses Zustand instead of Context API for state
 * 2. Uses TanStack Query for server state
 * 3. Better separation of concerns
 * 4. Improved loading/error states
 * 5. Optimistic updates
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

// Zustand stores
import {
  useTestRunStore,
  useTestStatistics,
  useIsTestRunning,
} from '../store/test-run.store';

// TanStack Query hooks
import {
  useCreateTestRun,
  useTestTargets,
  usePromptTemplates,
} from '../api/test-api';

// UI Components
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import TestConfiguration from './TestConfiguration';
import LiveTestView from './LiveTestView';
import RealTimeResults from './RealTimeResults';

// Types
import { TestConfiguration as TestConfigType } from '../types';

const DashboardRefactored: React.FC = () => {
  // Local state
  const [showConfiguration, setShowConfiguration] = useState(false);

  // Zustand state
  const isRunning = useIsTestRunning();
  const { isFinished, progress, configuration } = useTestRunStore();
  const statistics = useTestStatistics();

  // Mutations
  const createTestRun = useCreateTestRun();

  // Queries
  const { data: testTargets, isLoading: targetsLoading } = useTestTargets();
  const { data: promptTemplates } = usePromptTemplates();

  // Handlers
  const handleStartTest = async (config: TestConfigType) => {
    try {
      await createTestRun.mutateAsync(config);
      setShowConfiguration(false);
    } catch (error) {
      console.error('Failed to start test:', error);
      // Error handling with toast notification
      // toast.error('Failed to start test. Please try again.');
    }
  };

  const handleNewTest = () => {
    useTestRunStore.getState().resetTest();
    setShowConfiguration(true);
  };

  // Loading state
  if (targetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Clock className="animate-spin" />
          <span>Loading test targets...</span>
        </div>
      </div>
    );
  }

  // Configuration view
  if (!isRunning && !isFinished && showConfiguration) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Configure New Test</h2>
          <TestConfiguration
            onStart={handleStartTest}
            onCancel={() => setShowConfiguration(false)}
            availableTargets={testTargets || []}
            promptTemplates={promptTemplates || []}
            isSubmitting={createTestRun.isPending}
          />
        </div>
      </Card>
    );
  }

  // Test running view
  if (isRunning) {
    return (
      <div className="space-y-6">
        <LiveTestView
          progress={progress}
          statistics={statistics}
          configuration={configuration}
        />
      </div>
    );
  }

  // Results view
  if (isFinished) {
    return (
      <div className="space-y-6">
        <RealTimeResults
          statistics={statistics}
          configuration={configuration}
          onNewTest={handleNewTest}
        />
      </div>
    );
  }

  // Welcome / Empty state
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-8 text-center">
          <div className="mb-6">
            <PlayCircle className="mx-auto text-cyan-500" size={64} />
          </div>

          <h2 className="text-2xl font-bold mb-4">
            Welcome to AI Risk Manager
          </h2>

          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Test the robustness and security of your AI systems with
            comprehensive guardrail testing. Configure your first test to get
            started.
          </p>

          <Button
            onClick={() => setShowConfiguration(true)}
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <PlayCircle className="mr-2" size={20} />
            Start New Test
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Tests"
          value={statistics.total}
          icon={<Clock />}
          color="blue"
        />
        <StatsCard
          title="Tests Passed"
          value={statistics.passed}
          icon={<CheckCircle2 />}
          color="green"
        />
        <StatsCard
          title="Tests Failed"
          value={statistics.failed}
          icon={<AlertCircle />}
          color="red"
        />
      </div>
    </div>
  );
};

// Helper component for stats cards
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red';
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    red: 'text-red-500 bg-red-500/10',
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DashboardRefactored;
