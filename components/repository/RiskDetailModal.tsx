import React from 'react';
import { X, AlertTriangle, FileText, Link2, Tag, Calendar, Database } from 'lucide-react';
import { AIRiskEntry } from '../../types';
import Button from '../ui/Button';

interface RiskDetailModalProps {
    risk: AIRiskEntry;
    onClose: () => void;
    relatedRisks: AIRiskEntry[];
    onRiskClick: (risk: AIRiskEntry) => void;
}

const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ risk, onClose, relatedRisks, onRiskClick }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{risk.id}</span>
                            <span className="text-xs font-mono bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">{risk.evId}</span>
                            <span className="text-xs font-semibold bg-purple-900/50 text-purple-300 px-2 py-1 rounded">{risk.quickRef}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">{risk.title}</h2>
                        <div className="flex flex-wrap gap-2">
                            {risk.riskCategory && (
                                <span className="bg-purple-900/40 border border-purple-500/50 text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                                    📋 {risk.riskCategory}
                                </span>
                            )}
                            {risk.riskSubcategory && (
                                <span className="bg-purple-800/30 border border-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm">
                                    ↳ {risk.riskSubcategory}
                                </span>
                            )}
                            <span className="bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm">
                                🎯 {risk.categoryLevel}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description (Original English) */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={20} className="text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">Description</h3>
                            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">EN</span>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                            <p className="text-gray-200 leading-relaxed text-base">
                                {risk.description}
                            </p>
                        </div>
                    </section>

                    {/* Taxonomies */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Tag size={20} className="text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">Classification Taxonomique</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Causal Taxonomy */}
                            <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700/50 p-5 rounded-lg">
                                <h4 className="font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                                    <span className="text-xl">🔗</span>
                                    Taxonomie Causale
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-400 text-sm block mb-1">Entité Causale / Causal Entity:</span>
                                        <span className="text-white font-semibold text-lg">{risk.causal.entity}</span>
                                    </div>
                                    <div className="bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-400 text-sm block mb-1">Intentionnalité / Intentionality:</span>
                                        <span className="text-white font-semibold text-lg">{risk.causal.intentionality}</span>
                                    </div>
                                    <div className="bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-400 text-sm block mb-1">Temporalité / Timing:</span>
                                        <span className="text-white font-semibold text-lg">{risk.causal.timing}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Domain Taxonomy */}
                            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/50 p-5 rounded-lg">
                                <h4 className="font-semibold text-purple-300 mb-4 flex items-center gap-2">
                                    <span className="text-xl">🗂️</span>
                                    Taxonomie par Domaine
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-400 text-sm block mb-1">Catégorie / Category:</span>
                                        <span className="text-white font-semibold">{risk.domain.category}</span>
                                    </div>
                                    {risk.domain.subcategory && (
                                        <div className="bg-gray-900/50 p-3 rounded">
                                            <span className="text-gray-400 text-sm block mb-1">Sous-catégorie / Subcategory:</span>
                                            <span className="text-white font-semibold">{risk.domain.subcategory}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Additional Evidence (Original English) */}
                    {risk.additionalEvidence && risk.additionalEvidence.length > 10 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={20} className="text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">Preuves Additionnelles / Additional Evidence</h3>
                                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">EN</span>
                            </div>
                            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-5 rounded-r-lg">
                                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
                                    {risk.additionalEvidence}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Complete Data Overview */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Database size={20} className="text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">Données Complètes / Complete Data</h3>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-gray-400 text-sm block mb-1">Source:</span>
                                    <span className="text-white font-medium">{risk.source}</span>
                                </div>
                                {risk.paperId && (
                                    <div>
                                        <span className="text-gray-400 text-sm block mb-1">Paper ID:</span>
                                        <span className="text-white font-medium">{risk.paperId}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-400 text-sm block mb-1">Niveau de Catégorie / Category Level:</span>
                                    <span className="text-white font-medium">{risk.categoryLevel}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-sm block mb-1">ID d'Evidence:</span>
                                    <span className="text-white font-medium font-mono">{risk.evId}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-sm block mb-1">Quick Reference:</span>
                                    <span className="text-white font-medium">{risk.quickRef}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-sm block mb-1">Risk ID:</span>
                                    <span className="text-white font-medium font-mono">{risk.id}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Related Risks */}
                    {relatedRisks.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Link2 size={20} className="text-cyan-400" />
                                <h3 className="text-lg font-semibold text-white">Risques Connexes / Related Risks</h3>
                                <span className="text-sm bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded">{relatedRisks.length}</span>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {relatedRisks.map((relatedRisk) => (
                                    <button
                                        key={relatedRisk.id}
                                        onClick={() => onRiskClick(relatedRisk)}
                                        className="w-full text-left bg-gray-900/50 hover:bg-gray-700/50 p-4 rounded-lg transition-all border border-gray-700 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded">{relatedRisk.id}</span>
                                                    <span className="text-xs text-cyan-400 font-semibold">{relatedRisk.quickRef}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{relatedRisk.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded">{relatedRisk.causal.entity}</span>
                                                    <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">{relatedRisk.domain.category.substring(0, 30)}...</span>
                                                </div>
                                            </div>
                                            <span className="ml-2 text-cyan-400 text-xl">→</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        Source: MIT AI Risk Repository V3 (CC BY 4.0) | Contenu original en anglais
                    </span>
                    <Button onClick={onClose} variant="primary">
                        Fermer
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RiskDetailModal;
