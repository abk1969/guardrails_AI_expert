import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  AgenticSecurityThreat,
  AgenticSecurityCategory,
  MaestroLayer,
  AgenticSecurityStatistics,
  GRCPriority
} from '../types';
import {
  agenticSecurityThreats,
  agenticSecurityCategories,
  maestroFramework,
  agenticSecurityStatistics,
  getThreatById,
  getThreatsByCategory,
  getThreatsByPriority
} from '../data/agenticSecurityContent';

// ============================================================
// Context Types
// ============================================================

interface AgenticSecurityFilters {
  category: string | 'all';
  priority: GRCPriority | 'all';
  maestroLayer: string | 'all';
  searchQuery: string;
}

interface AgenticSecurityContextValue {
  // Static data
  threats: AgenticSecurityThreat[];
  categories: AgenticSecurityCategory[];
  maestroFramework: MaestroLayer[];
  statistics: AgenticSecurityStatistics;

  // Reactive filters
  filters: AgenticSecurityFilters;
  setFilters: React.Dispatch<React.SetStateAction<AgenticSecurityFilters>>;
  filteredThreats: AgenticSecurityThreat[];

  // Selection
  selectedThreat: AgenticSecurityThreat | null;
  selectThreat: (id: string | null) => void;

  // Utility functions
  getThreatById: (id: string) => AgenticSecurityThreat | undefined;
  getThreatsByCategory: (category: string) => AgenticSecurityThreat[];
  getThreatsByPriority: (priority: GRCPriority) => AgenticSecurityThreat[];
}

// ============================================================
// Context Creation
// ============================================================

const AgenticSecurityContext = createContext<AgenticSecurityContextValue | undefined>(undefined);

// ============================================================
// Provider Component
// ============================================================

interface AgenticSecurityProviderProps {
  children: ReactNode;
}

export const AgenticSecurityProvider: React.FC<AgenticSecurityProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<AgenticSecurityFilters>({
    category: 'all',
    priority: 'all',
    maestroLayer: 'all',
    searchQuery: ''
  });

  const [selectedThreat, setSelectedThreat] = useState<AgenticSecurityThreat | null>(null);

  // Select threat by ID
  const selectThreat = (id: string | null) => {
    if (id === null) {
      setSelectedThreat(null);
    } else {
      const threat = getThreatById(id);
      setSelectedThreat(threat || null);
    }
  };

  // Filtered threats based on active filters
  const filteredThreats = useMemo(() => {
    let result = agenticSecurityThreats;

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      result = result.filter(t => t.grcPriority === filters.priority);
    }

    // Filter by MAESTRO layer
    if (filters.maestroLayer !== 'all') {
      result = result.filter(t => t.maestroLayer.includes(filters.maestroLayer));
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.threatName.toLowerCase().includes(query) ||
        t.threatNameEn.toLowerCase().includes(query) ||
        t.owaspCode.toLowerCase().includes(query) ||
        t.riskDescription.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.attackMechanism.toLowerCase().includes(query) ||
        t.mitigations.some(m => m.toLowerCase().includes(query))
      );
    }

    return result;
  }, [filters]);

  // Context value
  const value: AgenticSecurityContextValue = {
    threats: agenticSecurityThreats,
    categories: agenticSecurityCategories,
    maestroFramework,
    statistics: agenticSecurityStatistics,
    filters,
    setFilters,
    filteredThreats,
    selectedThreat,
    selectThreat,
    getThreatById,
    getThreatsByCategory,
    getThreatsByPriority
  };

  return (
    <AgenticSecurityContext.Provider value={value}>
      {children}
    </AgenticSecurityContext.Provider>
  );
};

// ============================================================
// Hook
// ============================================================

export const useAgenticSecurity = (): AgenticSecurityContextValue => {
  const context = useContext(AgenticSecurityContext);
  if (context === undefined) {
    throw new Error('useAgenticSecurity must be used within an AgenticSecurityProvider');
  }
  return context;
};
