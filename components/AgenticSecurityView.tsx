import React, { useState } from 'react';
import { useAgenticSecurity } from '../contexts/AgenticSecurityContext';
import {
  Search,
  Filter,
  ChevronDown,
  Shield,
  Bot,
  Brain,
  Wrench,
  Database,
  Users,
  Network,
  Server,
  AlertTriangle,
  Flame,
  AlertCircle,
  Info,
  Grid,
  List,
  X,
  ExternalLink,
  Layers,
  Eye,
  Lock,
  Cpu
} from 'lucide-react';
import Card from './ui/Card';
import type { AgenticSecurityThreat, GRCPriority } from '../types';

// ============================================================
// Priority helpers
// ============================================================

const getPriorityColor = (priority: GRCPriority) => {
  switch (priority) {
    case 'CRITIQUE': return 'text-red-400 bg-red-900/30 border-red-700';
    case 'HAUTE': return 'text-orange-400 bg-orange-900/30 border-orange-700';
    case 'MOYENNE': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
    case 'BASSE': return 'text-blue-400 bg-blue-900/30 border-blue-700';
  }
};

const getPriorityIcon = (priority: GRCPriority) => {
  switch (priority) {
    case 'CRITIQUE': return <Flame className="w-4 h-4" />;
    case 'HAUTE': return <AlertTriangle className="w-4 h-4" />;
    case 'MOYENNE': return <AlertCircle className="w-4 h-4" />;
    case 'BASSE': return <Info className="w-4 h-4" />;
  }
};

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Le Cerveau': return <Brain className="w-5 h-5" />;
    case 'Les Mains': return <Wrench className="w-5 h-5" />;
    case 'La Mémoire': return <Database className="w-5 h-5" />;
    case 'Le Passeport': return <Lock className="w-5 h-5" />;
    case "L'Écosystème": return <Network className="w-5 h-5" />;
    case "Le Chef d'Orchestre": return <Users className="w-5 h-5" />;
    case 'Le Facteur Humain': return <Eye className="w-5 h-5" />;
    case "L'Infrastructure": return <Server className="w-5 h-5" />;
    case 'MIT 7.6': return <Cpu className="w-5 h-5" />;
    default: return <Bot className="w-5 h-5" />;
  }
};

// ============================================================
// Threat Detail Modal
// ============================================================

const ThreatDetailModal: React.FC<{
  threat: AgenticSecurityThreat;
  onClose: () => void;
}> = ({ threat, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(threat.grcPriority)}`}>
                {getPriorityIcon(threat.grcPriority)}
                {threat.grcPriority}
              </span>
              <span className="px-2 py-1 rounded bg-cyan-900/30 text-cyan-400 text-xs font-mono border border-cyan-800">
                {threat.owaspCode}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {threat.threatName}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              ({threat.threatNameEn})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Risk Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Description du risque
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {threat.riskDescription}
            </p>
          </div>

          {/* Attack Mechanism - Red Team */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Mecanisme d'attaque (Red Team)
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
              {threat.attackMechanism}
            </p>
          </div>

          {/* Impact & Examples */}
          <div className="bg-orange-950/20 border border-orange-900/40 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Impact et exemples concrets
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
              {threat.impactAndExamples}
            </p>
          </div>

          {/* Mitigations - Blue Team */}
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Mesures de mitigation (Blue Team)
            </h3>
            <ul className="space-y-2">
              {threat.mitigations.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#x2713;</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* MIT Risk References */}
          {threat.mitRiskReferences.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                References MIT AI Risk Repository
              </h3>
              <div className="flex flex-wrap gap-2">
                {threat.mitRiskReferences.map((ref, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 text-xs border border-gray-600">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MAESTRO Layer & MITRE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Couche MAESTRO
              </h3>
              <p className="text-purple-300 text-sm">{threat.maestroLayer}</p>
            </div>

            {threat.mitreAtlasRef && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  MITRE ATLAS
                </h3>
                <p className="text-cyan-300 text-sm font-mono">{threat.mitreAtlasRef}</p>
              </div>
            )}
          </div>

          {/* Category Info */}
          <div className="bg-gray-700/30 rounded-lg p-4 flex items-center gap-3">
            <span className="text-cyan-400">
              {getCategoryIcon(threat.categoryIcon)}
            </span>
            <div>
              <p className="text-sm text-gray-400">Categorie</p>
              <p className="text-gray-200 font-medium">
                {threat.categoryIcon} - {threat.category}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Threat Card
// ============================================================

const ThreatCard: React.FC<{
  threat: AgenticSecurityThreat;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}> = ({ threat, viewMode, onClick }) => {
  if (viewMode === 'list') {
    return (
      <Card className="hover:border-cyan-700/50 transition-colors cursor-pointer !p-4" >
        <div className="flex items-center gap-4" onClick={onClick}>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getPriorityColor(threat.grcPriority)}`}>
            {getPriorityIcon(threat.grcPriority)}
            {threat.grcPriority}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {threat.threatName}
              <span className="text-gray-500 font-normal ml-2">({threat.threatNameEn})</span>
            </h3>
            <p className="text-xs text-gray-400 truncate mt-0.5">{threat.riskDescription}</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 text-xs font-mono border border-cyan-800 flex-shrink-0">
            {threat.owaspCode}
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 text-xs border border-purple-800 flex-shrink-0">
            {threat.maestroLayer.split('+')[0].trim()}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap flex-shrink-0"
          >
            Voir details
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:border-cyan-700/50 transition-all cursor-pointer flex flex-col h-full">
      <div className="flex-1" onClick={onClick}>
        {/* Top badges */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(threat.grcPriority)}`}>
            {getPriorityIcon(threat.grcPriority)}
            {threat.grcPriority}
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 text-xs font-mono border border-cyan-800">
            {threat.owaspCode}
          </span>
        </div>

        {/* Threat name */}
        <h3 className="text-base font-semibold text-white mb-1 leading-snug">
          {threat.threatName}
        </h3>
        <p className="text-xs text-gray-500 mb-3">({threat.threatNameEn})</p>

        {/* Risk description (truncated) */}
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {threat.riskDescription}
        </p>

        {/* MAESTRO layer */}
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-purple-300 truncate">{threat.maestroLayer.split('+')[0].trim()}</span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="w-full mt-auto pt-3 border-t border-gray-700 text-sm text-cyan-400 hover:text-cyan-300 transition-colors text-center"
      >
        Voir details
      </button>
    </Card>
  );
};

// ============================================================
// Main View
// ============================================================

const AgenticSecurityView: React.FC = () => {
  const {
    filteredThreats,
    filters,
    setFilters,
    statistics,
    categories,
    selectedThreat,
    selectThreat
  } = useAgenticSecurity();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  // Unique MAESTRO layers for dropdown
  const maestroLayers = [
    'Couche 1', 'Couche 2', 'Couche 3', 'Couche 4',
    'Couche 5', 'Couche 6', 'Couche 7'
  ];

  // Group filtered threats by category
  const threatsByCategory = categories
    .map(cat => ({
      ...cat,
      filteredThreats: filteredThreats.filter(t => t.category === cat.name)
    }))
    .filter(cat => cat.filteredThreats.length > 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Bot className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-cyan-400">
            Securite IA Agentique - OWASP ASI
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          {statistics.totalThreats} menaces de securite pour les systemes d'IA agentiques - Framework MAESTRO
        </p>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="!p-4 flex items-center gap-3 border-red-900/40">
          <div className="p-2 rounded-lg bg-red-900/30">
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{statistics.byPriority.CRITIQUE}</p>
            <p className="text-xs text-gray-400">Critique</p>
          </div>
        </Card>
        <Card className="!p-4 flex items-center gap-3 border-orange-900/40">
          <div className="p-2 rounded-lg bg-orange-900/30">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{statistics.byPriority.HAUTE}</p>
            <p className="text-xs text-gray-400">Haute</p>
          </div>
        </Card>
        <Card className="!p-4 flex items-center gap-3 border-yellow-900/40">
          <div className="p-2 rounded-lg bg-yellow-900/30">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{statistics.byPriority.MOYENNE}</p>
            <p className="text-xs text-gray-400">Moyenne</p>
          </div>
        </Card>
        <Card className="!p-4 flex items-center gap-3 border-blue-900/40">
          <div className="p-2 rounded-lg bg-blue-900/30">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{statistics.byPriority.BASSE}</p>
            <p className="text-xs text-gray-400">Basse</p>
          </div>
        </Card>
      </div>

      {/* Filters and View Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une menace..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Grille"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Liste"
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
            <span>Filtres</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            {/* Category Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Categorie</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Toutes les categories</option>
                {categories.map(cat => (
                  <option key={cat.index} value={cat.name}>
                    {cat.icon} - {cat.name} ({cat.threatCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Priorite GRC</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as GRCPriority | 'all' }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Toutes les priorites</option>
                <option value="CRITIQUE">Critique ({statistics.byPriority.CRITIQUE})</option>
                <option value="HAUTE">Haute ({statistics.byPriority.HAUTE})</option>
                <option value="MOYENNE">Moyenne ({statistics.byPriority.MOYENNE})</option>
                <option value="BASSE">Basse ({statistics.byPriority.BASSE})</option>
              </select>
            </div>

            {/* MAESTRO Layer Filter */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Couche MAESTRO</label>
              <select
                value={filters.maestroLayer}
                onChange={(e) => setFilters(prev => ({ ...prev, maestroLayer: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Toutes les couches</option>
                {maestroLayers.map(layer => (
                  <option key={layer} value={layer}>{layer}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(filters.category !== 'all' || filters.priority !== 'all' || filters.maestroLayer !== 'all' || filters.searchQuery) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">Filtres actifs :</span>

          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-cyan-900/20 text-cyan-400 border border-cyan-700">
              {filters.category}
              <button onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}

          {filters.priority !== 'all' && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getPriorityColor(filters.priority)}`}>
              {getPriorityIcon(filters.priority)}
              {filters.priority}
              <button onClick={() => setFilters(prev => ({ ...prev, priority: 'all' }))} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}

          {filters.maestroLayer !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-900/20 text-purple-300 border border-purple-700">
              <Layers className="w-3 h-3" />
              {filters.maestroLayer}
              <button onClick={() => setFilters(prev => ({ ...prev, maestroLayer: 'all' }))} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-200 border border-gray-600">
              <Search className="w-3 h-3" />
              "{filters.searchQuery}"
              <button onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}

          <button
            onClick={() => setFilters({ category: 'all', priority: 'all', maestroLayer: 'all', searchQuery: '' })}
            className="text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            Reinitialiser
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-400">
          <span className="text-cyan-400 font-semibold">{filteredThreats.length}</span> menace{filteredThreats.length !== 1 ? 's' : ''}
          {filteredThreats.length !== statistics.totalThreats && (
            <> sur {statistics.totalThreats}</>
          )}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Layers className="w-4 h-4" />
          <span>
            {categories.length} categories &middot; 7 couches MAESTRO
          </span>
        </div>
      </div>

      {/* Content */}
      {filteredThreats.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400 mb-2">Aucune menace trouvee</p>
          <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {threatsByCategory.map(cat => (
            <div key={cat.index}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700/50">
                <span className="text-cyan-400">
                  {getCategoryIcon(cat.icon)}
                </span>
                <h2 className="text-lg font-semibold text-white">
                  {cat.icon} - {cat.name}
                </h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  {cat.filteredThreats.length} menace{cat.filteredThreats.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Threat cards */}
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }>
                {cat.filteredThreats.map(threat => (
                  <ThreatCard
                    key={threat.id}
                    threat={threat}
                    viewMode={viewMode}
                    onClick={() => selectThreat(threat.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedThreat && (
        <ThreatDetailModal
          threat={selectedThreat}
          onClose={() => selectThreat(null)}
        />
      )}
    </div>
  );
};

export default AgenticSecurityView;
