import React, { useState } from 'react';
import { useCompass } from '../../contexts/CompassContext';
import {
  Search,
  Filter,
  AlertTriangle,
  Flame,
  AlertCircle,
  Info,
  Grid,
  List,
  ChevronDown,
  Shield,
  Eye,
  Compass as CompassIcon,
  CheckSquare,
  Map,
  TrendingUp,
  Target
} from 'lucide-react';
import Card from '../ui/Card';
import { RiskLevel, OODAPhase } from '../../types';
import CompassUseCaseCard from './CompassUseCaseCard';
import CompassUseCaseModal from './CompassUseCaseModal';
import CompassFilters from './CompassFilters';
import CompassStatistics from './CompassStatistics';

const CompassUseCasesView: React.FC = () => {
  const {
    filteredUseCases,
    filters,
    setFilters,
    statistics,
    language,
    t,
    selectedUseCase,
    selectUseCase
  } = useCompass();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  // Risk level colors and icons
  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return <Flame className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'moderate':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-700';
      case 'high':
        return 'text-orange-400 bg-orange-900/20 border-orange-700';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-700';
    }
  };

  const getOODAIcon = (phase: OODAPhase | 'all') => {
    switch (phase) {
      case 'observe':
        return <Eye className="w-4 h-4" />;
      case 'orient':
        return <CompassIcon className="w-4 h-4" />;
      case 'decide':
        return <CheckSquare className="w-4 h-4" />;
      case 'act':
        return <Map className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getOODALabel = (phase: OODAPhase | 'all') => {
    const labels = {
      observe: { fr: 'Observer', en: 'Observe' },
      orient: { fr: 'Orienter', en: 'Orient' },
      decide: { fr: 'Décider', en: 'Decide' },
      act: { fr: 'Agir', en: 'Act' },
      all: { fr: 'Toutes phases', en: 'All phases' }
    };
    return labels[phase][language];
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-cyan-400">
            {language === 'fr' ? 'Cas d\'Usage OWASP COMPASS' : 'OWASP COMPASS Use Cases'}
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          {language === 'fr'
            ? '31 scénarios de menaces avec scores de risque basés sur la méthodologie OODA Loop'
            : '31 threat scenarios with risk scores based on OODA Loop methodology'}
        </p>
      </div>

      {/* Statistics */}
      <CompassStatistics />

      {/* Filters and View Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and View Mode */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title={language === 'fr' ? 'Grille' : 'Grid'}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title={language === 'fr' ? 'Liste' : 'List'}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>{language === 'fr' ? 'Filtres' : 'Filters'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && <CompassFilters />}
      </div>

      {/* Active Filters Display */}
      {(filters.riskLevel !== 'all' || filters.oodaPhase !== 'all' || filters.searchQuery) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">
            {language === 'fr' ? 'Filtres actifs:' : 'Active filters:'}
          </span>

          {filters.riskLevel !== 'all' && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getRiskColor(
                filters.riskLevel
              )}`}
            >
              {getRiskIcon(filters.riskLevel)}
              {filters.riskLevel.charAt(0).toUpperCase() + filters.riskLevel.slice(1)}
              <button
                onClick={() => setFilters({ ...filters, riskLevel: 'all' })}
                className="ml-1 hover:text-white"
              >
                ×
              </button>
            </span>
          )}

          {filters.oodaPhase !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-cyan-900/20 text-cyan-400 border border-cyan-700">
              {getOODAIcon(filters.oodaPhase)}
              {getOODALabel(filters.oodaPhase)}
              <button
                onClick={() => setFilters({ ...filters, oodaPhase: 'all' })}
                className="ml-1 hover:text-white"
              >
                ×
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-200 border border-gray-600">
              <Search className="w-3 h-3" />
              "{filters.searchQuery}"
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="ml-1 hover:text-white"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={() =>
              setFilters({ riskLevel: 'all', oodaPhase: 'all', searchQuery: '' })
            }
            className="text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            {language === 'fr' ? 'Réinitialiser' : 'Reset all'}
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-400">
          {language === 'fr' ? (
            <>
              <span className="text-cyan-400 font-semibold">{filteredUseCases.length}</span> cas
              d'usage{filteredUseCases.length !== statistics.totalUseCases && (
                <> sur {statistics.totalUseCases}</>
              )}
            </>
          ) : (
            <>
              <span className="text-cyan-400 font-semibold">{filteredUseCases.length}</span> use
              case{filteredUseCases.length !== 1 ? 's' : ''}
              {filteredUseCases.length !== statistics.totalUseCases && (
                <> of {statistics.totalUseCases}</>
              )}
            </>
          )}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>
            {language === 'fr' ? 'Score moyen:' : 'Average score:'}{' '}
            <span className="text-orange-400 font-semibold">{statistics.avgRiskScore}</span>
          </span>
        </div>
      </div>

      {/* Use Cases Grid/List */}
      {filteredUseCases.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400 mb-2">
            {language === 'fr' ? 'Aucun cas d\'usage trouvé' : 'No use cases found'}
          </p>
          <p className="text-gray-500">
            {language === 'fr'
              ? 'Essayez de modifier vos filtres ou votre recherche'
              : 'Try adjusting your filters or search query'}
          </p>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredUseCases.map((useCase) => (
            <CompassUseCaseCard
              key={useCase.id}
              useCase={useCase}
              viewMode={viewMode}
              onClick={() => selectUseCase(useCase.id)}
            />
          ))}
        </div>
      )}

      {/* Use Case Detail Modal */}
      {selectedUseCase && (
        <CompassUseCaseModal
          useCase={selectedUseCase}
          onClose={() => selectUseCase(null)}
        />
      )}
    </div>
  );
};

export default CompassUseCasesView;
