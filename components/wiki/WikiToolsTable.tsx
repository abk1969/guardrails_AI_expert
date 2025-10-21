import React, { useState, useMemo } from 'react';
import { WikiTool, WikiDataset } from '../../types';
import { Search, Link as LinkIcon } from 'lucide-react';

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="search-highlight">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

interface WikiToolsTableProps {
    tools: WikiTool[];
    datasets: WikiDataset[];
    searchTerm?: string;
}

const WikiToolsTable: React.FC<WikiToolsTableProps> = ({ tools, datasets, searchTerm: globalSearchTerm = '' }) => {
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'tools' | 'datasets'>('tools');

    const finalSearchTerm = globalSearchTerm || filter;

    const filteredTools = useMemo(() => {
        if (!finalSearchTerm) return tools;
        const lowercasedFilter = finalSearchTerm.toLowerCase();
        return tools.filter(tool =>
            tool.name.toLowerCase().includes(lowercasedFilter) ||
            tool.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [tools, finalSearchTerm]);

    const filteredDatasets = useMemo(() => {
        if (!finalSearchTerm) return datasets;
        const lowercasedFilter = finalSearchTerm.toLowerCase();
        return datasets.filter(dataset =>
            dataset.name.toLowerCase().includes(lowercasedFilter) ||
            dataset.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [datasets, finalSearchTerm]);

    return (
        <div>
            <div className="flex border-b border-gray-700 mb-4">
                <button 
                    onClick={() => setActiveTab('tools')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'tools' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Outils ({tools.length})
                </button>
                <button 
                    onClick={() => setActiveTab('datasets')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'datasets' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Jeux de Données ({datasets.length})
                </button>
            </div>
            
            {!globalSearchTerm && (
                 <div className="relative mb-4">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder={`Rechercher dans les ${activeTab === 'tools' ? 'outils' : 'jeux de données'}...`} 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)}
                        className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            )}
            
            {activeTab === 'tools' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                            <tr>
                                <th className="px-4 py-3">Nom</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Licence</th>
                                <th className="px-4 py-3">Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTools.map(tool => (
                                <tr key={tool.name} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-3 font-semibold text-white"><Highlight text={tool.name} highlight={finalSearchTerm} /></td>
                                    <td className="px-4 py-3"><Highlight text={tool.description} highlight={finalSearchTerm} /></td>
                                    <td className="px-4 py-3"><Highlight text={tool.licensing} highlight={finalSearchTerm} /></td>
                                    <td className="px-4 py-3">
                                        <a href={tool.reference} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center">
                                            Lien <LinkIcon size={12} className="ml-1" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredTools.length === 0 && <p className="text-center text-gray-500 py-4">Aucun outil trouvé.</p>}
                </div>
            )}

             {activeTab === 'datasets' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                            <tr>
                                <th className="px-4 py-3">Nom</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Licence</th>
                                <th className="px-4 py-3">Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDatasets.map(dataset => (
                                <tr key={dataset.name} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-3 font-semibold text-white"><Highlight text={dataset.name} highlight={finalSearchTerm} /></td>
                                    <td className="px-4 py-3"><Highlight text={dataset.description} highlight={finalSearchTerm} /></td>
                                    <td className="px-4 py-3"><Highlight text={dataset.licensing} highlight={finalSearchTerm} /></td>
                                    <td className="px-4 py-3">
                                        <a href={dataset.reference} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center">
                                            Lien <LinkIcon size={12} className="ml-1" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredDatasets.length === 0 && <p className="text-center text-gray-500 py-4">Aucun jeu de données trouvé.</p>}
                </div>
            )}
        </div>
    );
};

export default WikiToolsTable;
