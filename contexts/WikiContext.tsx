import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface WikiState {
  checkedItems: Record<string, boolean>;
  toggleCheckItem: (itemId: string) => void;
}

const WikiContext = createContext<WikiState | undefined>(undefined);

const WIKI_CHECKLIST_STORAGE_KEY = 'wikiRedTeamerChecklistState';

export const WikiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const storedData = localStorage.getItem(WIKI_CHECKLIST_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
      console.error("Failed to load wiki checklist state from localStorage", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WIKI_CHECKLIST_STORAGE_KEY, JSON.stringify(checkedItems));
    } catch (error) {
      console.error("Failed to save wiki checklist state to localStorage", error);
    }
  }, [checkedItems]);

  const toggleCheckItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <WikiContext.Provider value={{ checkedItems, toggleCheckItem }}>
      {children}
    </WikiContext.Provider>
  );
};

export const useWiki = (): WikiState => {
  const context = useContext(WikiContext);
  if (context === undefined) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
};
