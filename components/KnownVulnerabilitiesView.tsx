import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import EditableTableRow, { ColumnDef } from './ui/EditableTableRow';
import { useKnownVulnerabilities } from '../contexts/KnownVulnerabilitiesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { KnownVulnerability, VulnerabilitySeverity } from '../types';
import { PlusCircle, Search, ArrowLeft, Compass, Download, X } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

const SEVERITY_OPTIONS: VulnerabilitySeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', ''];
const SEVERITY_COLORS: Record<VulnerabilitySeverity, string> = {
    'CRITICAL': 'bg-red-700/80 text-red-200 border-red-500',
    'HIGH': 'bg-orange-600/80 text-orange-200 border-orange-400',
    'MEDIUM': 'bg-yellow-500/80 text-yellow-200 border-yellow-300',
    'LOW': 'bg-green-600/80 text-green-200 border-green-400',
    '': 'bg-gray-600/80 text-gray-200 border-gray-500'
};

const VULN_COLUMNS: ColumnDef<KnownVulnerability>[] = [
    { key: 'organizationTool' },
    {
        key: 'cveIdentifier',
        renderView: (item) => {
            const link = item.cveIdentifier.startsWith('CVE-')
                ? `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${item.cveIdentifier}`
                : `https://www.google.com/search?q=${encodeURIComponent(item.cveIdentifier)}`;
            return <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-mono">{item.cveIdentifier}</a>;
        },
    },
    { key: 'associatedCwes' },
    {
        key: 'descriptionSummary',
        rows: 4,
        minWidth: 'min-w-[300px]',
        renderView: (item) => <span className="text-sm">{item.descriptionSummary}</span>,
    },
    {
        key: 'originalSeverity',
        renderView: (item) => (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${SEVERITY_COLORS[item.originalSeverity]}`}>
                {item.originalSeverity || 'N/A'}
            </span>
        ),
        renderEdit: (value, onChange) => (
            <select
                value={String(value)}
                onChange={e => onChange(e.target.value)}
                className={`w-full bg-gray-900 border-cyan-500 border p-1 rounded-md text-white ${SEVERITY_COLORS[value as VulnerabilitySeverity]}`}
            >
                {SEVERITY_OPTIONS.map(opt => <option key={opt || 'none'} value={opt} className="bg-gray-800">{opt || 'N/A'}</option>)}
            </select>
        ),
    },
    { key: 'fivePointScore', inputType: 'number' },
    { key: 'owaspLlmCategory' },
    { key: 'owaspCategoryName' },
    { key: 'owaspAgenticTop15' },
    { key: 'owaspAgenticTop15ThreatName' },
];

const HEADERS = ['Org/Tool', 'CVE ID', 'CWEs', 'Description', 'Sévérité', 'Score/5', 'OWASP LLM Cat.', 'Nom Cat.', 'OWASP Agentic T15', 'Nom Menace', 'Actions'];

const KnownVulnerabilitiesView: React.FC = () => {
    const { vulnerabilities, addVulnerability, updateVulnerability, deleteVulnerability } = useKnownVulnerabilities();
    const { navigationSource, sourceTitle, filterParams, clearNavigation } = useNavigation();
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
        let filtered = vulnerabilities.filter(v => {
            const toolMatch = v.organizationTool.toLowerCase().includes(filters.tool.toLowerCase());
            const severityMatch = filters.severity ? v.originalSeverity === filters.severity : true;
            const categoryMatch = filters.category ? v.owaspLlmCategory.toLowerCase().includes(filters.category.toLowerCase()) : true;
            return toolMatch && severityMatch && categoryMatch;
        });

        if (filterParams?.highlightIds && filterParams.highlightIds.length > 0) {
            filtered = filtered.sort((a, b) => {
                const aHighlighted = filterParams.highlightIds!.includes(a.cveIdentifier);
                const bHighlighted = filterParams.highlightIds!.includes(b.cveIdentifier);
                return aHighlighted === bHighlighted ? 0 : aHighlighted ? -1 : 1;
            });
        }

        return filtered;
    }, [vulnerabilities, filters, filterParams]);

    const owaspCategories = useMemo(() => [...new Set(vulnerabilities.map(v => v.owaspLlmCategory).filter(Boolean))], [vulnerabilities]);

    useEffect(() => {
        if (filterParams?.highlightIds && filterParams.highlightIds.length > 0) {
            setTimeout(() => {
                const firstHighlighted = document.querySelector('[data-highlighted="true"]');
                if (firstHighlighted) {
                    firstHighlighted.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            }, 300);
        }
    }, [filterParams]);

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">3a Orient: Vulnérabilités IA Connues</h2>
                <p className="text-gray-400 mt-1">
                    Utilisez cet onglet pour rechercher les vulnérabilités liées à l'objectif cible. Cette liste de CVE mappées aux catégories OWASP LLM et OWASP Agentic Top 15 est fournie à titre d'exemple.
                </p>
                <p className="text-gray-400 mt-2">
                    Utilisez la recherche par mots-clés sur <a href="https://cve.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">CVE.org</a> pour identifier des vulnérabilités supplémentaires ou spécifiques.
                </p>
            </header>

            {navigationSource && filterParams?.highlightIds && (
                <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-transparent border-l-4 border-l-cyan-400 animate-in slide-in-from-top-4 duration-300 fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={clearNavigation} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                                <ArrowLeft className="w-5 h-5" />
                                <Compass className="w-5 h-5" />
                                <span>Retour à OWASP COMPASS</span>
                            </button>
                            <div className="h-6 w-px bg-cyan-600" />
                            <div className="text-sm text-gray-300">
                                <span className="font-semibold text-cyan-400">{filterParams.highlightIds.length}</span>{' '}
                                vulnérabilité(s) liée(s) au cas d'usage : <span className="font-semibold">{sourceTitle}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const highlightedVulns = vulnerabilities.filter(v => filterParams?.highlightIds?.includes(v.cveIdentifier));
                                    exportToPDF({
                                        title: 'Vulnérabilités IA Liées',
                                        sourceUseCase: sourceTitle || undefined,
                                        items: highlightedVulns,
                                        columns: [
                                            { key: 'organizationTool', label: 'Outil/Org' },
                                            { key: 'cveIdentifier', label: 'CVE ID' },
                                            { key: 'descriptionSummary', label: 'Description' },
                                            { key: 'originalSeverity', label: 'Sévérité' },
                                            { key: 'owaspLlmCategory', label: 'Catégorie OWASP' },
                                            { key: 'owaspCategoryName', label: 'Nom Catégorie' }
                                        ]
                                    });
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors text-sm"
                            >
                                <Download size={16} />
                                Exporter (HTML)
                            </button>
                            <button onClick={clearNavigation} className="text-gray-500 hover:text-gray-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </Card>
            )}

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
                                {HEADERS.map(h => (
                                    <th key={h} className={`px-3 py-3 ${h === 'Description' ? 'min-w-[300px]' : ''} ${h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredVulnerabilities.map(v => (
                                <EditableTableRow<KnownVulnerability>
                                    key={v.id}
                                    item={v}
                                    columns={VULN_COLUMNS}
                                    onUpdate={updateVulnerability}
                                    onDelete={deleteVulnerability}
                                    isHighlighted={filterParams?.highlightIds?.includes(v.cveIdentifier) || false}
                                    confirmDelete={`Êtes-vous sûr de vouloir supprimer la vulnérabilité ${v.cveIdentifier} ?`}
                                />
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
