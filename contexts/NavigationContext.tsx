import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * NavigationContext - Cross-Module Navigation State Management
 *
 * Purpose: Enable navigation between COMPASS use cases and related modules
 * (Vulnerabilities, Incidents, Defenses, Questions) with filtering and highlighting
 */

export interface FilterParams {
  highlightIds?: string[]; // IDs to highlight in target view (CVEs, incident names, etc.)
  category?: string; // OWASP category or other classification
  searchTerm?: string; // Search term to apply
  sourceUseCaseId?: string; // Original use case ID for reference
  sourceUseCaseTitle?: string; // Original use case title for breadcrumb
}

interface NavigationHistoryItem {
  moduleId: string;
  moduleName: string;
  itemId: string;
  itemTitle: string;
  timestamp: number;
}

interface NavigationState {
  // Current navigation state
  navigationSource: string | null; // Module ID that initiated navigation (e.g., 'compass-use-cases')
  sourceId: string | null; // ID of source item (e.g., use case ID)
  sourceTitle: string | null; // Title of source item for breadcrumb display

  // Filter parameters to apply in target module
  filterParams: FilterParams | null;

  // Active navigation (sidebar)
  activeNav: string;
  setActiveNav: (navId: string) => void;

  // Navigation functions
  navigateToModule: (
    moduleId: string,
    sourceModule: string,
    sourceId: string,
    sourceTitle: string,
    filterParams: FilterParams
  ) => void;

  clearNavigation: () => void;
}

const NavigationContext = createContext<NavigationState | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  activeNav?: string;
  setActiveNav?: (navId: string) => void;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  activeNav: externalActiveNav,
  setActiveNav: externalSetActiveNav,
}) => {
  const [internalActiveNav, setInternalActiveNav] = useState<string>('dashboard');
  const [navigationSource, setNavigationSource] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<FilterParams | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const [reverseNavigationEnabled, setReverseNavigationEnabled] = useState<boolean>(false);

  // Use external state if provided, otherwise use internal state
  const activeNav = externalActiveNav || internalActiveNav;
  const setActiveNav = externalSetActiveNav || setInternalActiveNav;

  const pushToHistory = (moduleId: string, moduleName: string, itemId: string, itemTitle: string) => {
    setNavigationHistory(prev => [...prev, {
      moduleId,
      moduleName,
      itemId,
      itemTitle,
      timestamp: Date.now()
    }]);
  };

  const popFromHistory = () => {
    setNavigationHistory(prev => prev.slice(0, -1));
  };

  const clearHistory = () => {
    setNavigationHistory([]);
  };

  const navigateToHistoryItem = (index: number) => {
    if (index >= 0 && index < navigationHistory.length) {
      const historyItem = navigationHistory[index];
      setActiveNav(historyItem.moduleId);
      // Trim history to the selected item
      setNavigationHistory(prev => prev.slice(0, index + 1));
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const enableReverseNavigation = (itemId: string, itemTitle: string) => {
    setReverseNavigationEnabled(true);
  };

  const navigateToModule = (
    moduleId: string,
    sourceModule: string,
    srcId: string,
    srcTitle: string,
    params: FilterParams
  ) => {
    setNavigationSource(sourceModule);
    setSourceId(srcId);
    setSourceTitle(srcTitle);
    setFilterParams(params);

    // Navigate sidebar to target module
    setActiveNav(moduleId);

    // Scroll to top when navigating
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const clearNavigation = () => {
    setNavigationSource(null);
    setSourceId(null);
    setSourceTitle(null);
    setFilterParams(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        navigationSource,
        sourceId,
        sourceTitle,
        filterParams,
        activeNav,
        setActiveNav,
        navigateToModule,
        clearNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationState => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
