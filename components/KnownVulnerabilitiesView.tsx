import React, { useState, useMemo, useCallback } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useKnownVulnerabilities } from '../contexts/KnownVulnerabilitiesContext';
import { KnownVulnerability, VulnerabilitySeverity } from '../types';
import { PlusCircle, Trash2, Edit, Save, X, Search } from 'lucide-react';

const SEVERITY_OPTIONS: VulnerabilitySeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', ''];
const SEVERITY_COLORS: Record<VulnerabilitySeverity, string> = {
    'CRITICAL': 'bg-red-700/80 text-red-200 border-red-500',
    'HIGH': 'bg-orange-600/80 text-orange-200 border-orange-400',
    'MEDIUM': 'bg-yellow-500/80 text-yellow-200 border-yellow-300',
    'LOW': 'bg-green-600/80 text-green-200 border-green-400',
    '': 'bg-gray-600/80 text-gray-200 border-gray-500'
};

const EditableCell: React.FC<{ value: string | number; onChange: (value: string) => void; type?: string, rows?: number }> = ({ value, onChange, type = 'text', rows }) => {
    if (rows) {
        return (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full bg-gray-900 border-cyan-500 border p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                rows={rows}
            />
        )
    }
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full bg-gray-900 border-cyan-500 border p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400 focus:outline-none"
        />
    );
};

const VulnerabilityRow: React.FC<{ vulnerability: KnownVulnerability }> = ({ vulnerability }) => {
    const { updateVulnerability, deleteVulnerability } = useKnownVulnerabilities();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState(vulnerability);

    const handleUpdate = (field: keyof Omit<KnownVulnerability, 'id'>, value: string | number) => {
        setEditState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        const { id, ...dataToSave } = editState;
        updateVulnerability(id, dataToSave);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditState(vulnerability);
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la vulnérabilité ${vulnerability.cveIdentifier} ?`)) {
            deleteVulnerability(vulnerability.id);
        }
    }
    
    const cveLink = vulnerability.cveIdentifier.startsWith('CVE-') 
        ? `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnerability.cveIdentifier}`
        : `https://www.google.com/search?q=${encodeURIComponent(vulnerability.cveIdentifier)}`;

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            {Object.keys(editState).filter(key => key !== 'id').map((key) => {
                const fieldKey = key as keyof Omit<KnownVulnerability, 'id'>;
                if (!isEditing) {
                    return (
                        <td key={fieldKey} className="px-3 py-2 align-top">
                            {fieldKey === 'cveIdentifier' ? (
                                <a href={cveLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-mono">{vulnerability[fieldKey]}</a>
                            ) : fieldKey === 'originalSeverity' ? (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${SEVERITY_COLORS[vulnerability[fieldKey]]}`}>{vulnerability[fieldKey] || 'N/A'}</span>
                            ) : (
                                <span className={fieldKey === 'descriptionSummary' ? 'text-sm' : ''}>{String(vulnerability[fieldKey])}</span>
                            )}
                        </td>
                    );
                }
                // Editing mode
                return (
                    <td key={fieldKey} className="px-2 py-1 align-top">
                        {fieldKey === 'originalSeverity' ? (
                            <select
                                value={editState[fieldKey]}
                                onChange={e => handleUpdate(fieldKey, e.target.value)}
                                className={`w-full bg-gray-900 border-cyan-500 border p-1 rounded-md text-white ${SEVERITY_COLORS[editState[fieldKey]]}`}
                            >
                                {SEVERITY_OPTIONS.map(opt => <option key={opt || 'none'} value={opt} className="bg-gray-800">{opt || 'N/A'}</option>)}
                            </select>
                        ) : (
                             <EditableCell
                                value={editState[fieldKey]}
                                onChange={value => handleUpdate(fieldKey, value)}
                                type={fieldKey === 'fivePointScore' ? 'number' : 'text'}
                                rows={fieldKey === 'descriptionSummary' ? 4 : undefined}
                            />
                        )}
                    </td>
                );
            })}
            <td className="px-3 py-2 align-top">
                <div className="flex justify-center space-x-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="p-2 text-green-400 hover:text-green-300" aria-label="Sauvegarder"><Save size={16} /></button>
                            <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-white" aria-label="Annuler"><X size={16} /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-cyan-400" aria-label="Modifier"><Edit size={16} /></button>
                            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer"><Trash2 size={16} /></button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

const KnownVulnerabilitiesView: React.FC = () => {
    const { vulnerabilities, addVulnerability } = useKnownVulnerabilities();
    const [filters, setFilters] = useState({ tool: '', severity: '' as VulnerabilitySeverity, category: '' });

    const handleAddNew = () => {
        addVulnerability({
            organizationTool: "Nouvel Outil",
            cveIdentifier: "CVE-XXXX-XXXXX",
            associatedCwes: "",
            descriptionSummary: "Description de la vulnérabilité...",
            originalSeverity: '',
            fivePointScore: '',
            owaspLlmCategory: "",
            owaspCategoryName: "",
            owaspAgenticTop15: "",
            owaspAgenticTop15ThreatName: "",
        });
    };

    const filteredVulnerabilities = useMemo(() => {
        return vulnerabilities.filter(v => {
            const toolMatch = v.organizationTool.toLowerCase().includes(filters.tool.toLowerCase());
            const severityMatch = filters.severity ? v.originalSeverity === filters.severity : true;
            const categoryMatch = filters.category ? v.owaspLlmCategory.toLowerCase().includes(filters.category.toLowerCase()) : true;
            return toolMatch && severityMatch && categoryMatch;
        });
    }, [vulnerabilities, filters]);

    const owaspCategories = useMemo(() => [...new Set(vulnerabilities.map(v => v.owaspLlmCategory).filter(Boolean))], [vulnerabilities]);

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">3a Orient: Vulnérabilités IA Connues</h2>
                <p className="text-gray-400 mt-1">
                    Utilisez cet onglet pour rechercher les vulnérabilités liées à l'objectif cible. Cette liste de CVE mappées aux catégories OWASP LLM et OWASP Agentic Top 15 est fournie à titre d'exemple.
                </p>
                 <p className="text-gray-400 mt-2">
                    Utilisez la recherche par mots-clés sur <a href="https://cve.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">CVE.org</a> pour identifier des vulnérabilités supplémentaires ou spécifiques. Mots-clés exemples : Large Language Model, LLM, language model, prompt injection, prompt leakage.
                </p>
            </header>

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                    <div className="relative">
                        <label className="text-xs text-gray-400">Filtrer par Outil/Organisation</label>
                        <Search size={16} className="absolute left-2.5 top-8 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="ex: Llama Index" 
                            value={filters.tool} 
                            onChange={e => setFilters(f => ({ ...f, tool: e.target.value }))}
                            className="w-full bg-gray-800 border-gray-600 rounded-md p-2 pl-8 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Filtrer par Sévérité</label>
                        <select 
                            value={filters.severity} 
                            onChange={e => setFilters(f => ({ ...f, severity: e.target.value as VulnerabilitySeverity }))}
                            className={`w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 ${filters.severity ? SEVERITY_COLORS[filters.severity] : ''}`}
                        >
                            <option value="" className="bg-gray-800">Toutes les sévérités</option>
                            {SEVERITY_OPTIONS.filter(Boolean).map(opt => <option key={opt} value={opt} className="bg-gray-800">{opt}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-gray-400">Filtrer par Catégorie OWASP</label>
                        <select 
                            value={filters.category} 
                            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                            className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="">Toutes les catégories</option>
                            {owaspCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <Button onClick={handleAddNew}>
                        <PlusCircle size={18} className="mr-2" />
                        Ajouter une Vulnérabilité
                    </Button>
                </div>
            </Card>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/60 sticky top-0">
                            <tr>
                                <th className="px-3 py-3">Org/Tool</th>
                                <th className="px-3 py-3">CVE ID</th>
                                <th className="px-3 py-3">CWEs</th>
                                <th className="px-3 py-3 min-w-[300px]">Description</th>
                                <th className="px-3 py-3">Sévérité</th>
                                <th className="px-3 py-3">Score/5</th>
                                <th className="px-3 py-3">OWASP LLM Cat.</th>
                                <th className="px-3 py-3">Nom Cat.</th>
                                <th className="px-3 py-3">OWASP Agentic T15</th>
                                <th className="px-3 py-3">Nom Menace</th>
                                <th className="px-3 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredVulnerabilities.map(v => (
                                <VulnerabilityRow key={v.id} vulnerability={v} />
                            ))}
                        </tbody>
                    </table>
                     {filteredVulnerabilities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Aucune vulnérabilité ne correspond à vos critères de recherche.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default KnownVulnerabilitiesView;
