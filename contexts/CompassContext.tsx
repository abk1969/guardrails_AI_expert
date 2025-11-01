import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CompassUseCase,
  OWASPSheet,
  OODAPhase,
  OODAProgress,
  RiskLevel,
  BilingualText
} from '../types';
import {
  compassUseCases,
  owaspSheets,
  compassStatistics,
  getUseCaseById,
  getUseCasesByRiskLevel,
  getUseCasesByOODAPhase,
  getSheetById,
  getSheetsByOODAPhase,
  getReferenceSheets
} from '../data/compassContent';

// ============================================================
// Context Types
// ============================================================

interface CompassFilters {
  riskLevel: RiskLevel | 'all';
  oodaPhase: OODAPhase | 'all';
  searchQuery: string;
}

interface CompassContextValue {
  // Data
  useCases: CompassUseCase[];
  sheets: OWASPSheet[];
  statistics: typeof compassStatistics;

  // Filters
  filters: CompassFilters;
  setFilters: React.Dispatch<React.SetStateAction<CompassFilters>>;
  filteredUseCases: CompassUseCase[];

  // OODA Progress tracking
  oodaProgress: OODAProgress;
  updateOODAProgress: (phase: keyof OODAProgress, update: Partial<OODAProgress[keyof OODAProgress]>) => void;

  // Selected items
  selectedUseCase: CompassUseCase | null;
  selectUseCase: (id: string | null) => void;
  selectedSheet: OWASPSheet | null;
  selectSheet: (id: string | null) => void;

  // Language
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (bilingualText: BilingualText) => string; // Translation helper

  // Helper functions
  getUseCaseById: (id: string) => CompassUseCase | undefined;
  getUseCasesByRiskLevel: (level: RiskLevel) => CompassUseCase[];
  getUseCasesByOODAPhase: (phase: OODAPhase) => CompassUseCase[];
  getSheetById: (id: string) => OWASPSheet | undefined;
  getSheetsByOODAPhase: (phase: OODAPhase) => OWASPSheet[];
  getReferenceSheets: () => OWASPSheet[];
}

// ============================================================
// Context Creation
// ============================================================

const CompassContext = createContext<CompassContextValue | undefined>(undefined);

// ============================================================
// Provider Component
// ============================================================

interface CompassProviderProps {
  children: ReactNode;
}

export const CompassProvider: React.FC<CompassProviderProps> = ({ children }) => {
  // State
  const [filters, setFilters] = useState<CompassFilters>({
    riskLevel: 'all',
    oodaPhase: 'all',
    searchQuery: ''
  });

  const [oodaProgress, setOODAProgress] = useState<OODAProgress>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('compass-ooda-progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse OODA progress from localStorage:', error);
      }
    }
    // Default initial state
    return {
      observe: {
        completed: false,
        profileDefined: false,
        attackSurfaceAnalyzed: false
      },
      orient: {
        completed: false,
        vulnerabilitiesReviewed: false,
        incidentsReviewed: false,
        redTeamCompleted: false
      },
      decide: {
        completed: false,
        prioritizationDone: false,
        mitigationsPrioritized: false
      },
      act: {
        completed: false,
        strategyDefined: false,
        roadmapCreated: false
      }
    };
  });

  const [selectedUseCase, setSelectedUseCase] = useState<CompassUseCase | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<OWASPSheet | null>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>(() => {
    return (localStorage.getItem('compass-language') as 'fr' | 'en') || 'fr';
  });

  // Save OODA progress to localStorage
  useEffect(() => {
    localStorage.setItem('compass-ooda-progress', JSON.stringify(oodaProgress));
  }, [oodaProgress]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('compass-language', language);
  }, [language]);

  // Update OODA progress
  const updateOODAProgress = (
    phase: keyof OODAProgress,
    update: Partial<OODAProgress[keyof OODAProgress]>
  ) => {
    setOODAProgress(prev => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        ...update
      }
    }));
  };

  // Select use case by ID
  const selectUseCase = (id: string | null) => {
    if (id === null) {
      setSelectedUseCase(null);
    } else {
      const useCase = getUseCaseById(id);
      setSelectedUseCase(useCase || null);
    }
  };

  // Select sheet by ID
  const selectSheet = (id: string | null) => {
    if (id === null) {
      setSelectedSheet(null);
    } else {
      const sheet = getSheetById(id);
      setSelectedSheet(sheet || null);
    }
  };

  // Translation helper
  const t = (bilingualText: BilingualText): string => {
    return bilingualText[language];
  };

  // Filtered use cases based on active filters
  const filteredUseCases = React.useMemo(() => {
    let result = compassUseCases;

    // Filter by risk level
    if (filters.riskLevel !== 'all') {
      result = result.filter(uc => uc.riskLevel === filters.riskLevel);
    }

    // Filter by OODA phase
    if (filters.oodaPhase !== 'all') {
      result = result.filter(uc => uc.oodaPhase === filters.oodaPhase);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(uc => {
        return (
          uc.title.fr.toLowerCase().includes(query) ||
          uc.title.en.toLowerCase().includes(query) ||
          uc.description.fr.toLowerCase().includes(query) ||
          uc.description.en.toLowerCase().includes(query) ||
          uc.recommendation.fr.toLowerCase().includes(query) ||
          uc.recommendation.en.toLowerCase().includes(query) ||
          uc.attackMapping.mitre?.toLowerCase().includes(query) ||
          uc.attackMapping.atlas?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [filters]);

  // Context value
  const value: CompassContextValue = {
    useCases: compassUseCases,
    sheets: owaspSheets,
    statistics: compassStatistics,
    filters,
    setFilters,
    filteredUseCases,
    oodaProgress,
    updateOODAProgress,
    selectedUseCase,
    selectUseCase,
    selectedSheet,
    selectSheet,
    language,
    setLanguage,
    t,
    getUseCaseById,
    getUseCasesByRiskLevel,
    getUseCasesByOODAPhase,
    getSheetById,
    getSheetsByOODAPhase,
    getReferenceSheets
  };

  return (
    <CompassContext.Provider value={value}>
      {children}
    </CompassContext.Provider>
  );
};

// ============================================================
// Hook
// ============================================================

export const useCompass = (): CompassContextValue => {
  const context = useContext(CompassContext);
  if (context === undefined) {
    throw new Error('useCompass must be used within a CompassProvider');
  }
  return context;
};
