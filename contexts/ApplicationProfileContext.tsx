import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ApplicationProfile,
  ApplicationTestSession,
  ApplicationArchitecture,
  TestMode,
} from '../types';

interface ApplicationProfileContextType {
  // Applications management
  applications: ApplicationProfile[];
  addApplication: (app: ApplicationProfile) => void;
  updateApplication: (id: string, app: Partial<ApplicationProfile>) => void;
  deleteApplication: (id: string) => void;
  getApplication: (id: string) => ApplicationProfile | undefined;

  // Test sessions
  testSessions: ApplicationTestSession[];
  createTestSession: (session: ApplicationTestSession) => void;
  updateTestSession: (id: string, session: Partial<ApplicationTestSession>) => void;
  getSessionsForApplication: (applicationId: string) => ApplicationTestSession[];

  // UI State
  selectedApplicationId: string | null;
  setSelectedApplicationId: (id: string | null) => void;

  // Utilities
  getApplicationsByArchitecture: (arch: ApplicationArchitecture) => ApplicationProfile[];
  getPromptfooCompatibleApps: () => ApplicationProfile[];
  getApplicationStats: () => {
    total: number;
    byArchitecture: Record<ApplicationArchitecture, number>;
    promptfooCompatible: number;
    requireCustomTest: number;
    blackbox: number;
    whitebox: number;
  };
}

const ApplicationProfileContext = createContext<ApplicationProfileContextType | undefined>(undefined);

export const useApplicationProfile = () => {
  const context = useContext(ApplicationProfileContext);
  if (!context) {
    throw new Error('useApplicationProfile must be used within ApplicationProfileProvider');
  }
  return context;
};

interface ApplicationProfileProviderProps {
  children: ReactNode;
}

export const ApplicationProfileProvider: React.FC<ApplicationProfileProviderProps> = ({ children }) => {
  const [applications, setApplications] = useState<ApplicationProfile[]>([]);
  const [testSessions, setTestSessions] = useState<ApplicationTestSession[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedApps = localStorage.getItem('application-profiles');
    const storedSessions = localStorage.getItem('application-test-sessions');

    if (storedApps) {
      try {
        setApplications(JSON.parse(storedApps));
      } catch (error) {
        console.error('Failed to load applications:', error);
      }
    }

    if (storedSessions) {
      try {
        setTestSessions(JSON.parse(storedSessions));
      } catch (error) {
        console.error('Failed to load test sessions:', error);
      }
    }
  }, []);

  // Save to localStorage whenever applications change
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('application-profiles', JSON.stringify(applications));
    }
  }, [applications]);

  // Save to localStorage whenever test sessions change
  useEffect(() => {
    if (testSessions.length > 0) {
      localStorage.setItem('application-test-sessions', JSON.stringify(testSessions));
    }
  }, [testSessions]);

  const addApplication = (app: ApplicationProfile) => {
    setApplications(prev => [...prev, app]);
  };

  const updateApplication = (id: string, updatedApp: Partial<ApplicationProfile>) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id
          ? { ...app, ...updatedApp, updatedAt: new Date().toISOString() }
          : app
      )
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    // Also delete related test sessions
    setTestSessions(prev => prev.filter(session => session.applicationId !== id));
  };

  const getApplication = (id: string): ApplicationProfile | undefined => {
    return applications.find(app => app.id === id);
  };

  const createTestSession = (session: ApplicationTestSession) => {
    setTestSessions(prev => [...prev, session]);

    // Update application test count and last tested date
    const appId = session.applicationId;
    updateApplication(appId, {
      lastTestedAt: session.startedAt,
      testCount: (getApplication(appId)?.testCount || 0) + 1,
    });
  };

  const updateTestSession = (id: string, updatedSession: Partial<ApplicationTestSession>) => {
    setTestSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, ...updatedSession } : session
      )
    );
  };

  const getSessionsForApplication = (applicationId: string): ApplicationTestSession[] => {
    return testSessions.filter(session => session.applicationId === applicationId);
  };

  const getApplicationsByArchitecture = (arch: ApplicationArchitecture): ApplicationProfile[] => {
    return applications.filter(app => app.architecture === arch);
  };

  const getPromptfooCompatibleApps = (): ApplicationProfile[] => {
    return applications.filter(app => app.testability.promptfooCompatible);
  };

  const getApplicationStats = () => {
    const byArchitecture: Record<ApplicationArchitecture, number> = {
      'llm-chatbot': 0,
      'rag': 0,
      'agentic-rag': 0,
      'text-to-speech': 0,
      'text-to-video': 0,
      'video-to-text': 0,
      'speech-to-text': 0,
      'complex-pipeline': 0,
      'code-generation': 0,
      'other': 0,
    };

    let promptfooCompatible = 0;
    let requireCustomTest = 0;
    let blackbox = 0;
    let whitebox = 0;

    applications.forEach(app => {
      byArchitecture[app.architecture]++;
      if (app.testability.promptfooCompatible) promptfooCompatible++;
      if (app.testability.requiresCustomTest) requireCustomTest++;
      if (app.testMode === 'blackbox') blackbox++;
      if (app.testMode === 'whitebox') whitebox++;
    });

    return {
      total: applications.length,
      byArchitecture,
      promptfooCompatible,
      requireCustomTest,
      blackbox,
      whitebox,
    };
  };

  const value: ApplicationProfileContextType = {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    getApplication,
    testSessions,
    createTestSession,
    updateTestSession,
    getSessionsForApplication,
    selectedApplicationId,
    setSelectedApplicationId,
    getApplicationsByArchitecture,
    getPromptfooCompatibleApps,
    getApplicationStats,
  };

  return (
    <ApplicationProfileContext.Provider value={value}>
      {children}
    </ApplicationProfileContext.Provider>
  );
};
