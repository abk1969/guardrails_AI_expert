import React, { createContext, useContext, ReactNode } from 'react';
import { KnownAIIncident, ResourceLink, ResourceLinkCategory } from '../types';
import { INITIAL_KNOWN_INCIDENTS, INITIAL_RESOURCE_LINKS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface KnownIncidentsData {
  incidents: KnownAIIncident[];
  resourceLinks: ResourceLink[];
}

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

const DEFAULTS: KnownIncidentsData = {
  incidents: INITIAL_KNOWN_INCIDENTS,
  resourceLinks: INITIAL_RESOURCE_LINKS,
};

export const KnownIncidentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useLocalStorage<KnownIncidentsData>('llmGuardrailKnownIncidents', DEFAULTS);

  const addIncident = () => {
    const newIncident: KnownAIIncident = {
      id: `inc-custom-${crypto.randomUUID()}`,
      incident: 'Nouvel incident...',
      vulnerability: '',
      impact: '',
      referenceUrl: '#',
    };
    setData(prev => ({ ...prev, incidents: [newIncident, ...prev.incidents] }));
  };

  const updateIncident = (id: string, updatedData: Partial<Omit<KnownAIIncident, 'id'>>) => {
    setData(prev => ({ ...prev, incidents: prev.incidents.map(i => (i.id === id ? { ...i, ...updatedData } : i)) }));
  };

  const deleteIncident = (id: string) => {
    setData(prev => ({ ...prev, incidents: prev.incidents.filter(i => i.id !== id) }));
  };

  const addResourceLink = (category: ResourceLinkCategory) => {
    const newLink: ResourceLink = {
      id: `rl-custom-${crypto.randomUUID()}`,
      category,
      text: 'Nouveau lien...',
      url: '#',
    };
    setData(prev => ({ ...prev, resourceLinks: [...prev.resourceLinks, newLink] }));
  };

  const updateResourceLink = (id: string, updatedData: Partial<Omit<ResourceLink, 'id' | 'category'>>) => {
    setData(prev => ({ ...prev, resourceLinks: prev.resourceLinks.map(rl => (rl.id === id ? { ...rl, ...updatedData } : rl)) }));
  };

  const deleteResourceLink = (id: string) => {
    setData(prev => ({ ...prev, resourceLinks: prev.resourceLinks.filter(rl => rl.id !== id) }));
  };

  return (
    <KnownIncidentsContext.Provider value={{
      incidents: data.incidents,
      resourceLinks: data.resourceLinks,
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
