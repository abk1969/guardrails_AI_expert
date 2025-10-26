import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { RiskDatabaseExample } from '../../types';
import { Search, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const RiskDatabaseView: React.FC = () => {
    const { riskDatabaseExamples } = useAIRiskRepository();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredExamples = useMemo(() => {
        if (!searchTerm) return riskDatabaseExamples;
        const lower = searchTerm.toLowerCase();
        return riskDatabaseExamples.filter(ex => 
            ex.category.toLowerCase().includes(lower) ||
            ex.prompt.toLowerCase().includes(lower) ||
            ex.nonViolating.toLowerCase().includes(lower) ||
            ex.violating.toLowerCase().includes(lower) ||
            ex.why.toLowerCase().includes(lower)
        );
    }, [riskDatabaseExamples, searchTerm]);

    const paginatedExamples = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredExamples.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredExamples, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredExamples.length / itemsPerPage);

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-2">Feuille 4 : Base de Données des Risques IA v3</h2>
            <p className="text-gray-400 mb-4">
                Explorez les exemples de la base de données des risques. Utilisez la recherche pour filtrer les résultats.
            </p>
            <div className="bg-cyan-900/30 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-lg relative text-center mb-6 text-sm" role="alert">
                <Info size={16} className="inline mr-2" />
                <span className="font-semibold">Note :</span> Ceci est un échantillon des exemples fournis dans la documentation. La base de données complète de 2,242 enregistrements pourra être intégrée ultérieurement.
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                <div className="relative w-full md:w-1/2">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par catégorie, prompt, réponse..." 
                        value={searchTerm} 
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {paginatedExamples.map((item, index) => (
                    <div key={item.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-xs text-cyan-400 font-semibold mb-2">CATÉGORIE : {item.category}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-300 mb-1">Prompt</h4>
                                <p className="text-sm bg-gray-900/50 p-2 rounded">{item.prompt}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-300 mb-1">Pourquoi ? (Justification)</h4>
                                <p className="text-sm bg-gray-900/50 p-2 rounded">{item.why}</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-green-500/50 rounded-md p-3 bg-green-900/20">
                                <h4 className="font-semibold text-green-400 mb-1">Réponse NON-VIOLENTE</h4>
                                <p className="text-sm">{item.nonViolating}</p>
                            </div>
                            <div className="border border-red-500/50 rounded-md p-3 bg-red-900/20">
                                <h4 className="font-semibold text-red-400 mb-1">Réponse VIOLENTE</h4>
                                <p className="text-sm">{item.violating}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredExamples.length === 0 && (
                 <div className="text-center py-16">
                    <p className="text-gray-500">Aucun enregistrement ne correspond à votre recherche.</p>
                </div>
            )}


            <div className="flex justify-between items-center mt-6 text-sm">
                <span className="text-gray-400">
                    Page {currentPage} sur {totalPages > 0 ? totalPages : 1} ({filteredExamples.length} enregistrements)
                </span>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary" className="p-2">
                        <ChevronLeft size={16} />
                    </Button>
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} variant="secondary" className="p-2">
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default RiskDatabaseView;