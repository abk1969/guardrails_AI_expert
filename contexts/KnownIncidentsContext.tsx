import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { KnownAIIncident, ResourceLink, ResourceLinkCategory } from '../types';
import { INITIAL_KNOWN_INCIDENTS, INITIAL_RESOURCE_LINKS } from '../constants';

interface KnownIncidentsState {
  incidents: KnownAIIncident[];
  resourceLinks: ResourceLink[];
  addIncident: () => void;
  updateIncident: (id: string, updatedData: Partial<Omit<KnownAIIncident, 'id'>>) => void;
  deleteIncident: (id: string) => void;
  addResourceLink: (category: ResourceLinkCategory) => void;
  updateResourceLink: (id: string, updatedData: Partial<Omit<ResourceLink, 'id' | 'category'>>) => void;
  deleteResourceLink: (id: string) => void;
}

const KnownIncidentsContext = createContext<KnownIncidentsState | undefined>(undefined);

const INCIDENTS_STORAGE_KEY = 'llmGuardrailKnownIncidents';

export const KnownIncidentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<KnownAIIncident[]>(INITIAL_KNOWN_INCIDENTS);
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>(INITIAL_RESOURCE_LINKS);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(INCIDENTS_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setIncidents(parsed.incidents || INITIAL_KNOWN_INCIDENTS);
        setResourceLinks(parsed.resourceLinks || INITIAL_RESOURCE_LINKS);
      } else {
        setIncidents(INITIAL_KNOWN_INCIDENTS);
        setResourceLinks(INITIAL_RESOURCE_LINKS);
      }
    } catch (error) {
      console.error("Failed to load known incidents from localStorage", error);
      setIncidents(INITIAL_KNOWN_INCIDENTS);
      setResourceLinks(INITIAL_RESOURCE_LINKS);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore = JSON.stringify({ incidents, resourceLinks });
      localStorage.setItem(INCIDENTS_STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error("Failed to save known incidents to localStorage", error);
    }
  }, [incidents, resourceLinks]);

  // Incident CRUD
  const addIncident = () => {
    const newIncident: KnownAIIncident = {
      id: `inc-custom-${crypto.randomUUID()}`,
      incident: 'Nouvel incident...',
      vulnerability: '',
      impact: '',
      referenceUrl: '#',
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncident = (id: string, updatedData: Partial<Omit<KnownAIIncident, 'id'>>) => {
    setIncidents(prev => prev.map(i => (i.id === id ? { ...i, ...updatedData } : i)));
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  // Resource Link CRUD
  const addResourceLink = (category: ResourceLinkCategory) => {
    const newLink: ResourceLink = {
      id: `rl-custom-${crypto.randomUUID()}`,
      category,
      text: 'Nouveau lien...',
      url: '#',
    };
    setResourceLinks(prev => [...prev, newLink]);
  };

  const updateResourceLink = (id: string, updatedData: Partial<Omit<ResourceLink, 'id' | 'category'>>) => {
    setResourceLinks(prev => prev.map(rl => (rl.id === id ? { ...rl, ...updatedData } : rl)));
  };
  
  const deleteResourceLink = (id: string) => {
    setResourceLinks(prev => prev.filter(rl => rl.id !== id));
  };

  return (
    <KnownIncidentsContext.Provider value={{ 
        incidents, 
        resourceLinks,
        addIncident, 
        updateIncident, 
        deleteIncident,
        addResourceLink,
        updateResourceLink,
        deleteResourceLink
    }}>
      {children}
    </KnownIncidentsContext.Provider>
  );
};

export const useKnownIncidents = (): KnownIncidentsState => {
  const context = useContext(KnownIncidentsContext);
  if (context === undefined) {
    throw new Error('useKnownIncidents must be used within a KnownIncidentsProvider');
  }
  return context;
};
