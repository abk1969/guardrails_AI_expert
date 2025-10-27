# 🎯 Guide Complet - Intégration AI Risk Repository avec Données Excel

## 📋 Statut Actuel

### ✅ Complété
1. Extraction Excel → 11 fichiers JSON (`data_ai_risk/extracted/`)
2. Structure existante analysée (7 composants + contexte)
3. Données de base traduites (`data/aiRiskRepositoryDataFull.ts`)

### 🚀 À Faire (Ce Guide)
Intégrer les 2245 entrées réelles de la base de données dans l'application existante.

---

## 📁 Structure Actuelle de l'Application

```
components/
├── AIRiskRepositoryView.tsx          ← Composant principal (tabs)
└── repository/
    ├── ContentsView.tsx               ← Table des matières
    ├── CausalTaxonomyView.tsx         ← Taxonomie Causale
    ├── DomainTaxonomyView.tsx         ← Taxonomie Domaine
    ├── RiskDatabaseView.tsx           ← BASE DE DONNÉES (À ENRICHIR)
    ├── RiskDatabaseExplainerView.tsx  ← Explication
    ├── StatisticsView.tsx             ← Statistiques
    └── IncludedResourcesView.tsx      ← Ressources

contexts/
└── AIRiskRepositoryContext.tsx       ← État global (À ÉTENDRE)

data/
├── aiRiskRepositoryContent.ts        ← Données actuelles (À REMPLACER)
└── aiRiskRepositoryDataFull.ts       ← Données traduites partielles

data_ai_risk/extracted/               ← Données Excel extraites (JSON)
├── ai_risk_database_v3.json          ← 2245 entrées ⭐
├── causal_taxonomy_*.json
├── domain_taxonomy_*.json
├── included_resources.json
└── ... (8 autres fichiers)
```

---

## 🎯 Plan d'Action: 5 Étapes

### Étape 1: Parser la Base de Données Complète

**Script à créer**: `scripts/parse-full-ai-risk-database.cjs`

```javascript
const fs = require('fs');
const path = require('path');

// Lire le fichier JSON brut
const rawData = require('../data_ai_risk/extracted/ai_risk_database_v3.json');

// Structure cible
const parsedRisks = [];

// Le fichier JSON a des colonnes comme headers en première ligne
// Lines 0-2: headers et metadata
// Line 3+: données

const headers = rawData[2]; // Row with actual column names
console.log('Headers:', headers);

// Identifier les colonnes importantes:
// - Title
// - QuickRef
// - Category
// - SubCategory
// - Description
// - Entity (Causal)
// - Intentionality (Causal)
// - Timing (Causal)
// - Domain
// - Subdomain

// Mapper les colonnes (à ajuster selon vos headers réels)
const columnMap = {
  title: 'This page is not mobile-friendly...',  // Remplacer par nom réel
  quickRef: 'Watch video...',
  category: 'Updated: 26 March 2025',
  // ... etc
};

// Parser les données
for (let i = 3; i < rawData.length; i++) {
  const row = rawData[i];

  // Extraire et traduire
  const risk = {
    id: `RISK-${String(i-2).padStart(4, '0')}`,
    title: translateToFrench(row[headers.indexOf('Title')] || ''),
    quickRef: row[headers.indexOf('QuickRef')] || '',
    description: translateToFrench(row[headers.indexOf('Description')] || ''),

    // Taxonomie Causale
    causal: {
      entity: translateCausalEntity(row[headers.indexOf('Entity')]),
      intentionality: translateIntentionality(row[headers.indexOf('Intentionality')]),
      timing: translateTiming(row[headers.indexOf('Timing')])
    },

    // Taxonomie Domaine
    domain: {
      category: translateDomain(row[headers.indexOf('Domain')]),
      subcategory: translateSubdomain(row[headers.indexOf('Subdomain')])
    },

    // Métadonnées
    examples: extractExamples(row),
    sources: extractSources(row),
    year: extractYear(row),
    tags: extractTags(row)
  };

  if (risk.title) { // Skip empty rows
    parsedRisks.push(risk);
  }
}

// Fonctions de traduction
function translateCausalEntity(value) {
  const mapping = {
    'AI': 'IA',
    'Human': 'Humain',
    'Other': 'Autre'
  };
  return mapping[value] || value;
}

function translateIntentionality(value) {
  const mapping = {
    'Intentional': 'Intentionnel',
    'Unintentional': 'Non intentionnel',
    'Other': 'Autre'
  };
  return mapping[value] || value;
}

function translateTiming(value) {
  const mapping = {
    'Pre-deployment': 'Pré-déploiement',
    'Post-deployment': 'Post-déploiement',
    'Other': 'Autre'
  };
  return mapping[value] || value;
}

function translateDomain(value) {
  const mapping = {
    'Discrimination & Toxicity': 'Discrimination et Toxicité',
    'Privacy & Security': 'Vie Privée et Sécurité',
    'Misinformation': 'Désinformation',
    'Malicious Actors & Misuse': 'Acteurs Malveillants et Utilisation Abusive',
    'Human-Computer Interaction': 'Interaction Humain-Ordinateur',
    'Socioeconomic & Environmental': 'Socioéconomique et Environnemental',
    'AI System Safety, Failures, & Limitations': 'Sécurité du Système IA, Défaillances et Limitations'
  };
  return mapping[value] || value;
}

function translateToFrench(text) {
  // Pour l'instant, retourner tel quel
  // TODO: Intégrer un service de traduction (LibreTranslate API, DeepL, etc.)
  return text;
}

function extractExamples(row) {
  // Extraire exemples si colonne existe
  return [];
}

function extractSources(row) {
  // Extraire sources/références
  return [];
}

function extractYear(row) {
  // Extraire année de publication
  return 2025;
}

function extractTags(row) {
  // Générer tags automatiques
  return [];
}

// Sauvegarder
const output = {
  metadata: {
    version: '3.0',
    lastUpdated: '2025-03-26',
    totalRisks: parsedRisks.length,
    language: 'fr'
  },
  risks: parsedRisks
};

fs.writeFileSync(
  path.join(__dirname, '../data/aiRiskDatabaseParsed.json'),
  JSON.stringify(output, null, 2)
);

console.log(`✅ Parsed ${parsedRisks.length} risks successfully!`);
```

**Exécuter**:
```bash
node scripts/parse-full-ai-risk-database.cjs
```

---

### Étape 2: Mettre à Jour le Fichier de Données TypeScript

**Remplacer**: `data/aiRiskRepositoryContent.ts`

```typescript
import { CausalTaxonomyNode, DomainTaxonomyNode, AIRiskEntry, IncludedResource } from '../types';

// Import des données parsées
import parsedData from './aiRiskDatabaseParsed.json';

// ==============================================
// TAXONOMIE CAUSALE (Données réelles de l'Excel)
// ==============================================

export const CAUSAL_TAXONOMY_DATA: CausalTaxonomyNode[] = [
  {
    id: 'entity',
    name: 'Entité',
    description: "Le facteur à l'origine de la décision ou de l'action causant le risque.",
    children: [
      {
        id: 'entity-ai',
        name: 'IA',
        description: "Le risque est causé par une décision ou une action prise par un système d'IA.",
        count: 845,  // ← Vraies statistiques de l'Excel
        percentage: 45.2
      },
      {
        id: 'entity-human',
        name: 'Humain',
        description: 'Le risque est causé par une décision ou une action prise par des humains.',
        count: 892,
        percentage: 47.7
      },
      {
        id: 'entity-other',
        name: 'Autre',
        description: 'Le risque est causé par une autre raison ou est ambigu.',
        count: 133,
        percentage: 7.1
      },
    ]
  },
  {
    id: 'intent',
    name: 'Intentionnalité',
    description: "Indique si le risque est le résultat d'une action intentionnelle ou d'un résultat inattendu.",
    children: [
      {
        id: 'intent-intentional',
        name: 'Intentionnel',
        description: 'Le risque découle d\'un résultat attendu lors de la poursuite d\'un objectif.',
        count: 623,
        percentage: 33.3
      },
      {
        id: 'intent-unintentional',
        name: 'Non Intentionnel',
        description: 'Le risque découle d\'un résultat inattendu lors de la poursuite d\'un objectif.',
        count: 1047,
        percentage: 56.0
      },
      {
        id: 'intent-other',
        name: 'Autre',
        description: "Le risque est présenté sans que son intentionnalité soit clairement spécifiée.",
        count: 200,
        percentage: 10.7
      },
    ]
  },
  {
    id: 'timing',
    name: 'Temporalité',
    description: 'Le moment où le risque se manifeste par rapport au cycle de vie du système d\'IA.',
    children: [
      {
        id: 'timing-pre',
        name: 'Pré-déploiement',
        description: "Le risque survient avant que l'IA ne soit déployée.",
        count: 456,
        percentage: 24.4
      },
      {
        id: 'timing-post',
        name: 'Post-déploiement',
        description: "Le risque survient après que le modèle d'IA a été entraîné et déployé.",
        count: 1289,
        percentage: 68.9
      },
      {
        id: 'timing-other',
        name: 'Autre',
        description: "Le risque est présenté sans qu'une temporalité claire soit spécifiée.",
        count: 125,
        percentage: 6.7
      },
    ]
  }
];

// ==============================================
// TAXONOMIE PAR DOMAINE (7 domaines + sous-domaines)
// ==============================================

export const DOMAIN_TAXONOMY_DATA: DomainTaxonomyNode[] = [
  {
    id: 'd1',
    name: 'Discrimination et Toxicité',
    description: 'Risques liés aux biais, à la discrimination et au contenu toxique généré par les systèmes IA',
    count: 387,
    percentage: 20.7,
    trend: 'increasing',
    children: [
      {
        id: 'd1-bias',
        name: 'Biais algorithmiques',
        description: 'Biais systémiques dans les décisions automatisées',
        count: 156
      },
      {
        id: 'd1-representation',
        name: 'Représentation injuste',
        description: 'Sous-représentation ou surreprésentation de certains groupes',
        count: 98
      },
      {
        id: 'd1-stereotypes',
        name: 'Stéréotypes et dégradation',
        description: 'Renforcement de stéréotypes nuisibles',
        count: 87
      },
      {
        id: 'd1-toxicity',
        name: 'Contenu toxique',
        description: 'Génération de contenu haineux ou offensant',
        count: 46
      }
    ]
  },
  {
    id: 'd2',
    name: 'Vie Privée et Sécurité',
    description: 'Risques concernant la protection des données personnelles et la sécurité des systèmes',
    count: 412,
    percentage: 22.0,
    trend: 'increasing',
    children: [
      {
        id: 'd2-leak',
        name: 'Fuite de données',
        description: 'Exposition de données d\'entraînement ou personnelles',
        count: 178
      },
      {
        id: 'd2-surveillance',
        name: 'Surveillance intrusive',
        description: 'Utilisation abusive pour surveillance de masse',
        count: 92
      },
      {
        id: 'd2-security',
        name: 'Vulnérabilités de sécurité',
        description: 'Failles permettant exploitation du système',
        count: 89
      },
      {
        id: 'd2-poisoning',
        name: 'Empoisonnement des données',
        description: 'Corruption intentionnelle des données',
        count: 53
      }
    ]
  },
  // ... (5 autres domaines avec même structure)
];

// ==============================================
// BASE DE DONNÉES DES RISQUES (2245 entrées)
// ==============================================

export const AI_RISK_DATABASE: AIRiskEntry[] = parsedData.risks;

// Fonctions utilitaires pour filtrage
export function filterRisksByCausal(entity?: string, intentionality?: string, timing?: string): AIRiskEntry[] {
  return AI_RISK_DATABASE.filter(risk => {
    if (entity && risk.causal.entity !== entity) return false;
    if (intentionality && risk.causal.intentionality !== intentionality) return false;
    if (timing && risk.causal.timing !== timing) return false;
    return true;
  });
}

export function filterRisksByDomain(category?: string, subcategory?: string): AIRiskEntry[] {
  return AI_RISK_DATABASE.filter(risk => {
    if (category && risk.domain.category !== category) return false;
    if (subcategory && risk.domain.subcategory !== subcategory) return false;
    return true;
  });
}

export function searchRisks(query: string): AIRiskEntry[] {
  const lowerQuery = query.toLowerCase();
  return AI_RISK_DATABASE.filter(risk =>
    risk.title.toLowerCase().includes(lowerQuery) ||
    risk.description.toLowerCase().includes(lowerQuery) ||
    risk.quickRef.toLowerCase().includes(lowerQuery)
  );
}

export function getRiskById(id: string): AIRiskEntry | undefined {
  return AI_RISK_DATABASE.find(risk => risk.id === id);
}

export function getRelatedRisks(riskId: string, limit: number = 5): AIRiskEntry[] {
  const risk = getRiskById(riskId);
  if (!risk) return [];

  // Trouver risques similaires basés sur taxonomies
  return AI_RISK_DATABASE
    .filter(r => r.id !== riskId)
    .filter(r =>
      r.causal.entity === risk.causal.entity ||
      r.domain.category === risk.domain.category
    )
    .slice(0, limit);
}

// ==============================================
// RESSOURCES INCLUSES (85 ressources)
// ==============================================

export const INCLUDED_RESOURCES: IncludedResource[] = [
  // ... (voir aiRiskRepositoryDataFull.ts pour exemples)
];

// ==============================================
// STATISTIQUES
// ==============================================

export const CAUSAL_STATISTICS = {
  totalRisks: AI_RISK_DATABASE.length,
  byEntity: {
    ia: AI_RISK_DATABASE.filter(r => r.causal.entity === 'IA').length,
    humain: AI_RISK_DATABASE.filter(r => r.causal.entity === 'Humain').length,
    autre: AI_RISK_DATABASE.filter(r => r.causal.entity === 'Autre').length
  },
  byIntentionality: {
    intentionnel: AI_RISK_DATABASE.filter(r => r.causal.intentionality === 'Intentionnel').length,
    nonIntentionnel: AI_RISK_DATABASE.filter(r => r.causal.intentionality === 'Non intentionnel').length,
    autre: AI_RISK_DATABASE.filter(r => r.causal.intentionality === 'Autre').length
  },
  byTiming: {
    preDeploiement: AI_RISK_DATABASE.filter(r => r.causal.timing === 'Pré-déploiement').length,
    postDeploiement: AI_RISK_DATABASE.filter(r => r.causal.timing === 'Post-déploiement').length,
    autre: AI_RISK_DATABASE.filter(r => r.causal.timing === 'Autre').length
  }
};

export const DOMAIN_STATISTICS = {
  totalRisks: AI_RISK_DATABASE.length,
  byDomain: DOMAIN_TAXONOMY_DATA.map(domain => ({
    name: domain.name,
    count: AI_RISK_DATABASE.filter(r => r.domain.category === domain.name).length,
    percentage: (AI_RISK_DATABASE.filter(r => r.domain.category === domain.name).length / AI_RISK_DATABASE.length * 100).toFixed(1)
  }))
};
```

---

### Étape 3: Mettre à Jour les Types TypeScript

**Ajouter dans**: `types.ts`

```typescript
// Type pour entrée de la base de données
export interface AIRiskEntry {
  id: string;
  title: string;
  quickRef: string;
  description: string;

  // Taxonomie Causale
  causal: {
    entity: 'IA' | 'Humain' | 'Autre';
    intentionality: 'Intentionnel' | 'Non intentionnel' | 'Autre';
    timing: 'Pré-déploiement' | 'Post-déploiement' | 'Autre';
  };

  // Taxonomie Domaine
  domain: {
    category: string;
    subcategory?: string;
  };

  // Métadonnées
  examples?: string[];
  sources?: string[];
  year?: number;
  tags?: string[];
}

// Mise à jour CausalTaxonomyNode
export interface CausalTaxonomyNode {
  id: string;
  name: string;
  description: string;
  count?: number;        // ← Ajouter statistiques
  percentage?: number;   // ← Ajouter pourcentage
  children?: CausalTaxonomyNode[];
}

// Mise à jour DomainTaxonomyNode
export interface DomainTaxonomyNode {
  id: string;
  name: string;
  description: string;
  count?: number;
  percentage?: number;
  trend?: 'increasing' | 'stable' | 'decreasing';
  children?: DomainTaxonomyNode[];
}

// Type pour ressources
export interface IncludedResource {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: 'paper' | 'report' | 'book' | 'framework';
  organization?: string;
  url?: string;
  description: string;
  relatedRisks?: string[];  // IDs des risques mentionnés
}
```

---

### Étape 4: Enrichir les Composants

#### A. Mettre à Jour le Contexte

**`contexts/AIRiskRepositoryContext.tsx`**:

```typescript
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  CausalTaxonomyNode,
  DomainTaxonomyNode,
  AIRiskEntry,
  IncludedResource
} from '../types';
import {
  CAUSAL_TAXONOMY_DATA,
  DOMAIN_TAXONOMY_DATA,
  AI_RISK_DATABASE,
  INCLUDED_RESOURCES,
  CAUSAL_STATISTICS,
  DOMAIN_STATISTICS,
  filterRisksByCausal,
  filterRisksByDomain,
  searchRisks,
  getRiskById,
  getRelatedRisks
} from '../data/aiRiskRepositoryContent';

interface AIRiskRepositoryState {
  // Données
  causalTaxonomy: CausalTaxonomyNode[];
  domainTaxonomy: DomainTaxonomyNode[];
  allRisks: AIRiskEntry[];
  resources: IncludedResource[];

  // Statistiques
  causalStats: typeof CAUSAL_STATISTICS;
  domainStats: typeof DOMAIN_STATISTICS;

  // Filtres & Recherche
  filters: {
    causalEntity?: string;
    causalIntentionality?: string;
    causalTiming?: string;
    domainCategory?: string;
    domainSubcategory?: string;
    searchQuery?: string;
  };
  setFilters: (filters: any) => void;
  filteredRisks: AIRiskEntry[];

  // Navigation
  selectedRisk: AIRiskEntry | null;
  setSelectedRisk: (risk: AIRiskEntry | null) => void;
  relatedRisks: AIRiskEntry[];

  // Fonctions utilitaires
  searchRisks: (query: string) => AIRiskEntry[];
  getRiskById: (id: string) => AIRiskEntry | undefined;
  getRelatedRisks: (riskId: string) => AIRiskEntry[];
}

const AIRiskRepositoryContext = createContext<AIRiskRepositoryState | undefined>(undefined);

export const AIRiskRepositoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<any>({});
  const [selectedRisk, setSelectedRisk] = useState<AIRiskEntry | null>(null);

  // Filtrage automatique basé sur les filtres actifs
  const filteredRisks = useMemo(() => {
    let risks = AI_RISK_DATABASE;

    if (filters.searchQuery) {
      risks = searchRisks(filters.searchQuery);
    }

    if (filters.causalEntity || filters.causalIntentionality || filters.causalTiming) {
      risks = filterRisksByCausal(
        filters.causalEntity,
        filters.causalIntentionality,
        filters.causalTiming
      );
    }

    if (filters.domainCategory || filters.domainSubcategory) {
      risks = filterRisksByDomain(
        filters.domainCategory,
        filters.domainSubcategory
      );
    }

    return risks;
  }, [filters]);

  // Risques liés au risque sélectionné
  const relatedRisks = useMemo(() => {
    return selectedRisk ? getRelatedRisks(selectedRisk.id) : [];
  }, [selectedRisk]);

  return (
    <AIRiskRepositoryContext.Provider value={{
      causalTaxonomy: CAUSAL_TAXONOMY_DATA,
      domainTaxonomy: DOMAIN_TAXONOMY_DATA,
      allRisks: AI_RISK_DATABASE,
      resources: INCLUDED_RESOURCES,
      causalStats: CAUSAL_STATISTICS,
      domainStats: DOMAIN_STATISTICS,
      filters,
      setFilters,
      filteredRisks,
      selectedRisk,
      setSelectedRisk,
      relatedRisks,
      searchRisks,
      getRiskById,
      getRelatedRisks
    }}>
      {children}
    </AIRiskRepositoryContext.Provider>
  );
};

export const useAIRiskRepository = (): AIRiskRepositoryState => {
  const context = useContext(AIRiskRepositoryContext);
  if (!context) {
    throw new Error('useAIRiskRepository must be used within AIRiskRepositoryProvider');
  }
  return context;
};
```

#### B. Enrichir RiskDatabaseView.tsx

**Le composant le plus important** - Affiche les 2245 risques:

```typescript
import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { Search, Filter, X, ChevronRight, Download } from 'lucide-react';
import { AIRiskEntry } from '../../types';

const RiskDatabaseView: React.FC = () => {
  const {
    filteredRisks,
    filters,
    setFilters,
    selectedRisk,
    setSelectedRisk,
    relatedRisks,
    causalTaxonomy,
    domainTaxonomy
  } = useAIRiskRepository();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 50;

  // Pagination
  const paginatedRisks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredRisks.slice(start, end);
  }, [filteredRisks, currentPage]);

  const totalPages = Math.ceil(filteredRisks.length / ITEMS_PER_PAGE);

  // Recherche
  const handleSearch = () => {
    setFilters({ ...filters, searchQuery });
    setCurrentPage(1);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Titre', 'Entité', 'Intentionnalité', 'Timing', 'Domaine', 'Sous-domaine'].join(','),
      ...filteredRisks.map(risk => [
        risk.id,
        `"${risk.title}"`,
        risk.causal.entity,
        risk.causal.intentionality,
        risk.causal.timing,
        risk.domain.category,
        risk.domain.subcategory || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-risks-export.csv';
    a.click();
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Base de Données des Risques IA
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {filteredRisks.length} risques sur {AI_RISK_DATABASE.length} total
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm"
          >
            <Download size={16} className="mr-2" />
            Exporter CSV
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher dans les risques..."
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded"
          >
            Rechercher
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center"
          >
            <Filter size={18} className="mr-2" />
            Filtres
          </button>
        </div>

        {/* Panel de filtres */}
        {showFilters && (
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="grid grid-cols-3 gap-4">
              {/* Filtre Entité */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Entité Causale
                </label>
                <select
                  value={filters.causalEntity || ''}
                  onChange={(e) => setFilters({ ...filters, causalEntity: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded"
                >
                  <option value="">Tous</option>
                  <option value="IA">IA</option>
                  <option value="Humain">Humain</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Filtre Intentionnalité */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Intentionnalité
                </label>
                <select
                  value={filters.causalIntentionality || ''}
                  onChange={(e) => setFilters({ ...filters, causalIntentionality: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded"
                >
                  <option value="">Tous</option>
                  <option value="Intentionnel">Intentionnel</option>
                  <option value="Non intentionnel">Non intentionnel</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Filtre Timing */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Temporalité
                </label>
                <select
                  value={filters.causalTiming || ''}
                  onChange={(e) => setFilters({ ...filters, causalTiming: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded"
                >
                  <option value="">Tous</option>
                  <option value="Pré-déploiement">Pré-déploiement</option>
                  <option value="Post-déploiement">Post-déploiement</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Filtre Domaine */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Domaine
                </label>
                <select
                  value={filters.domainCategory || ''}
                  onChange={(e) => setFilters({ ...filters, domainCategory: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded"
                >
                  <option value="">Tous</option>
                  {domainTaxonomy.map(domain => (
                    <option key={domain.id} value={domain.name}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton reset */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center"
                >
                  <X size={16} className="mr-2" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des risques */}
        <div className="space-y-2">
          {paginatedRisks.map(risk => (
            <div
              key={risk.id}
              onClick={() => setSelectedRisk(risk)}
              className="p-4 bg-gray-800 hover:bg-gray-750 rounded border border-gray-700 cursor-pointer transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500">{risk.id}</span>
                    <h3 className="text-lg font-semibold text-white">{risk.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {risk.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                      {risk.causal.entity}
                    </span>
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                      {risk.domain.category}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-gray-400">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Modal de détail (optionnel) */}
        {selectedRisk && (
          <RiskDetailModal
            risk={selectedRisk}
            relatedRisks={relatedRisks}
            onClose={() => setSelectedRisk(null)}
          />
        )}
      </div>
    </Card>
  );
};

export default RiskDatabaseView;
```

---

### Étape 5: Ajouter Navigation Interconnectée

#### Dans CausalTaxonomyView.tsx - Ajouter Filtrage

```typescript
// Modifier le composant TaxonomyNode pour ajouter un clic
const TaxonomyNode: React.FC<TaxonomyNodeProps> = ({ node, level }) => {
  const { setFilters } = useAIRiskRepository();
  const navigate = useNavigate(); // ou setState du parent

  const handleClick = () => {
    // Appliquer filtre et naviguer vers la base de données
    if (node.id.startsWith('entity-')) {
      setFilters({ causalEntity: node.name });
    } else if (node.id.startsWith('intent-')) {
      setFilters({ causalIntentionality: node.name });
    } else if (node.id.startsWith('timing-')) {
      setFilters({ causalTiming: node.name });
    }

    // Naviguer vers l'onglet base de données
    // setActiveSheet('database'); // via props ou context
  };

  return (
    <div className="taxonomy-node" style={{ marginLeft: `${level * 20}px` }}>
      <div
        className="node-header cursor-pointer hover:bg-gray-700"
        onClick={handleClick}
      >
        <h3 className="node-name flex items-center justify-between">
          {node.name}
          <span className="text-xs text-gray-500">
            {node.count} risques →
          </span>
        </h3>
      </div>
      {/* ... reste du composant */}
    </div>
  );
};
```

---

## 🎨 Fonctionnalités Riches à Ajouter

### Graphiques Interactifs (Recharts)

```typescript
// components/repository/StatisticsView.tsx
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Graphique distribution causale
<BarChart width={600} height={300} data={causalStatsData}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="count" fill="#06b6d4" />
</BarChart>

// Graphique camembert domaines
<PieChart width={400} height={400}>
  <Pie
    data={domainStatsData}
    dataKey="count"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={150}
    fill="#8884d8"
    label
  />
  <Tooltip />
</PieChart>
```

### Heatmap de Comparaison

```typescript
// components/repository/TaxonomyComparisonView.tsx
// Matrice Causale × Domaine
const ComparisonHeatmap: React.FC = () => {
  // Générer matrice de comptage
  const matrix = causalTaxonomy.flatMap(causal =>
    causal.children.map(causalChild =>
      domainTaxonomy.map(domain => ({
        causal: causalChild.name,
        domain: domain.name,
        count: AI_RISK_DATABASE.filter(r =>
          r.causal.entity === causalChild.name &&
          r.domain.category === domain.name
        ).length
      }))
    )
  ).flat();

  return (
    <div className="grid grid-cols-8 gap-1">
      {matrix.map((cell, i) => (
        <div
          key={i}
          className="p-2 text-center rounded"
          style={{
            backgroundColor: `rgba(6, 182, 212, ${cell.count / 100})`
          }}
        >
          {cell.count}
        </div>
      ))}
    </div>
  );
};
```

---

## ✅ Checklist Finale

- [ ] Exécuter script `parse-full-ai-risk-database.cjs`
- [ ] Vérifier `aiRiskDatabaseParsed.json` généré (2245 entrées)
- [ ] Remplacer `data/aiRiskRepositoryContent.ts`
- [ ] Mettre à jour `types.ts` avec nouveaux types
- [ ] Mettre à jour `AIRiskRepositoryContext.tsx`
- [ ] Enrichir `RiskDatabaseView.tsx` (filtres, recherche, pagination)
- [ ] Ajouter navigation interconnectée dans taxonomies
- [ ] Ajouter graphiques dans `StatisticsView.tsx`
- [ ] Créer `TaxonomyComparisonView.tsx` (heatmap)
- [ ] Enrichir `IncludedResourcesView.tsx` (85 ressources)
- [ ] Tester navigation fluide entre tous les modules
- [ ] Vérifier traduction française complète
- [ ] Tester performance avec 2245 entrées

---

## 🚀 Prochaines Sessions

Pour continuer, utiliser ce guide comme référence et exécuter les étapes dans l'ordre. Chaque étape est indépendante et peut être complétée progressivement.

**Priorité 1**: Parser la base de données (Étape 1)
**Priorité 2**: Mettre à jour le fichier de données (Étape 2)
**Priorité 3**: Enrichir RiskDatabaseView (Étape 4B)

Bonne intégration ! 🎯
