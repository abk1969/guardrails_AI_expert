import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AIRiskEntry } from '../../types';
import { Search, ChevronLeft, ChevronRight, Info, Filter, X, Download, Eye } from 'lucide-react';
import RiskDetailModal from './RiskDetailModal';

const RiskDatabaseView: React.FC = () => {
    const {
        filteredRisks,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        clearFilters,
        statistics,
        metadata,
        selectedRisk,
        setSelectedRisk,
        getRelatedRisks
    } = useAIRiskRepository();
    const { t } = useLanguage();

    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 50;

    // Get related risks for the selected risk
    const relatedRisks = selectedRisk ? getRelatedRisks(selectedRisk.id, 5) : [];

    // Pagination
    const paginatedRisks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRisks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRisks, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);

    // Toggle filter checkbox
    const toggleFilter = (category: 'entity' | 'intentionality' | 'timing' | 'domain', value: string) => {
        const currentValues = filters[category] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        setFilters({
            ...filters,
            [category]: newValues.length > 0 ? newValues : undefined
        });
        setCurrentPage(1);
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['ID', 'Title', 'Description', 'Entity', 'Intentionality', 'Timing', 'Domain', 'Subdomain', 'Category', 'Subcategory', 'Source'];
        const rows = filteredRisks.map(risk => [
            risk.id,
            `"${risk.title.replace(/"/g, '""')}"`,
            `"${risk.description.replace(/"/g, '""')}"`,
            risk.causal.entity,
            risk.causal.intentionality,
            risk.causal.timing,
            risk.domain.category,
            `"${risk.domain.subcategory.replace(/"/g, '""')}"`,
            `"${risk.riskCategory.replace(/"/g, '""')}"`,
            `"${risk.riskSubcategory.replace(/"/g, '""')}"`,
            risk.source
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ai-risks-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Active filters count
    const activeFiltersCount = Object.values(filters).reduce((sum, arr) => sum + (arr?.length || 0), 0);

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-2">{t('db.title')}</h2>
            <p className="text-gray-400 mb-4">
                {t('db.subtitle').replace('{count}', metadata.totalRisks.toString())}
            </p>

            {/* Statistics Summary */}
            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-cyan-400">{metadata.totalRisks}</div>
                        <div className="text-xs text-gray-400">{t('common.total_risks')}</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyan-400">{filteredRisks.length}</div>
                        <div className="text-xs text-gray-400">{t('common.displayed')}</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyan-400">{Object.keys(statistics.byDomain).length}</div>
                        <div className="text-xs text-gray-400">{t('common.domains')}</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyan-400">{metadata.version}</div>
                        <div className="text-xs text-gray-400">{t('common.version')}</div>
                    </div>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                <div className="relative w-full md:flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={t('db.search_placeholder')}
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant={activeFiltersCount > 0 ? "primary" : "secondary"}
                        className="relative"
                    >
                        <Filter size={16} className="mr-2" />
                        {t('common.filters')}
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                    <Button onClick={exportToCSV} variant="secondary">
                        <Download size={16} className="mr-2" />
                        {t('common.export_csv')}
                    </Button>
                    {activeFiltersCount > 0 && (
                        <Button onClick={() => { clearFilters(); setCurrentPage(1); }} variant="secondary">
                            <X size={16} className="mr-2" />
                            {t('common.reset')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-white font-semibold mb-4">{t('common.filters')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Entity Filter */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('filter.entity')}</h4>
                            {['IA', 'Humain', 'Autre'].map(entity => (
                                <label key={entity} className="flex items-center space-x-2 mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.entity?.includes(entity) || false}
                                        onChange={() => toggleFilter('entity', entity)}
                                        className="form-checkbox text-cyan-500"
                                    />
                                    <span className="text-sm text-gray-300">{entity} ({statistics.byEntity[entity] || 0})</span>
                                </label>
                            ))}
                        </div>

                        {/* Intentionality Filter */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('filter.intentionality')}</h4>
                            {['Intentionnel', 'Non intentionnel', 'Autre'].map(intent => (
                                <label key={intent} className="flex items-center space-x-2 mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.intentionality?.includes(intent) || false}
                                        onChange={() => toggleFilter('intentionality', intent)}
                                        className="form-checkbox text-cyan-500"
                                    />
                                    <span className="text-sm text-gray-300">{intent} ({statistics.byIntentionality[intent] || 0})</span>
                                </label>
                            ))}
                        </div>

                        {/* Timing Filter */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('filter.timing')}</h4>
                            {['Pré-déploiement', 'Post-déploiement', 'Autre'].map(timing => (
                                <label key={timing} className="flex items-center space-x-2 mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.timing?.includes(timing) || false}
                                        onChange={() => toggleFilter('timing', timing)}
                                        className="form-checkbox text-cyan-500"
                                    />
                                    <span className="text-sm text-gray-300">{timing} ({statistics.byTiming[timing] || 0})</span>
                                </label>
                            ))}
                        </div>

                        {/* Domain Filter */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('filter.domain')}</h4>
                            <div className="max-h-48 overflow-y-auto">
                                {Object.entries(statistics.byDomain).map(([domain, count]) => (
                                    <label key={domain} className="flex items-center space-x-2 mb-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.domain?.includes(domain) || false}
                                            onChange={() => toggleFilter('domain', domain)}
                                            className="form-checkbox text-cyan-500"
                                        />
                                        <span className="text-sm text-gray-300 truncate" title={domain}>
                                            {domain.length > 30 ? domain.substring(0, 30) + '...' : domain} ({count})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Risks List */}
            <div className="space-y-3">
                {paginatedRisks.map((risk) => (
                    <div key={risk.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-gray-500">{risk.id}</span>
                                    <span className="text-xs text-cyan-400 font-semibold">{risk.quickRef}</span>
                                </div>
                                <h3 className="text-white font-semibold">{risk.title}</h3>
                            </div>
                            <Button
                                onClick={() => setSelectedRisk(risk)}
                                variant="secondary"
                                className="ml-4"
                            >
                                <Eye size={16} className="mr-2" />
                                {t('common.details')}
                            </Button>
                        </div>

                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{risk.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="bg-gray-900/50 px-2 py-1 rounded">
                                <span className="text-gray-500">Entité: </span>
                                <span className="text-cyan-400">{risk.causal.entity}</span>
                            </div>
                            <div className="bg-gray-900/50 px-2 py-1 rounded">
                                <span className="text-gray-500">Intent: </span>
                                <span className="text-cyan-400">{risk.causal.intentionality}</span>
                            </div>
                            <div className="bg-gray-900/50 px-2 py-1 rounded">
                                <span className="text-gray-500">Timing: </span>
                                <span className="text-cyan-400">{risk.causal.timing}</span>
                            </div>
                            <div className="bg-gray-900/50 px-2 py-1 rounded truncate" title={risk.domain.category}>
                                <span className="text-gray-500">Domaine: </span>
                                <span className="text-cyan-400">{risk.domain.category}</span>
                            </div>
                        </div>

                        {risk.riskCategory && (
                            <div className="mt-2 text-xs">
                                <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                                    {risk.riskCategory}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredRisks.length === 0 && (
                <div className="text-center py-16">
                    <Info size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">{t('db.no_results')}</p>
                    <p className="text-gray-600 text-sm mb-4">{t('db.no_results_hint')}</p>
                    <Button onClick={() => { clearFilters(); setCurrentPage(1); }} variant="primary">
                        {t('common.reset')}
                    </Button>
                </div>
            )}

            {/* Pagination */}
            {filteredRisks.length > 0 && (
                <div className="flex justify-between items-center mt-6 text-sm">
                    <span className="text-gray-400">
                        {t('common.page')} {currentPage} {t('common.of')} {totalPages > 0 ? totalPages : 1} ({filteredRisks.length} {t('common.risks')})
                    </span>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="secondary"
                            className="p-2"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <span className="text-gray-400 px-3">
                            {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRisks.length)}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            variant="secondary"
                            className="p-2"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Risk Detail Modal */}
            {selectedRisk && (
                <RiskDetailModal
                    risk={selectedRisk}
                    onClose={() => setSelectedRisk(null)}
                    relatedRisks={relatedRisks}
                    onRiskClick={(risk) => setSelectedRisk(risk)}
                />
            )}
        </Card>
    );
};

export default RiskDatabaseView;