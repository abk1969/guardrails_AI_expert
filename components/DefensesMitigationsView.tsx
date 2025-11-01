import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useNavigation } from '../contexts/NavigationContext';
import { useDefensesMitigations } from '../contexts/DefensesMitigationsContext';
import { DefenseMitigationReference, KeyControlStrategy, OwaspReference } from '../types';
import { DEFENSE_LAYERS, DEFENSE_QUESTIONS, DEFENSE_CONDITIONS, DEFENSE_OBJECTS_IN_SCOPE } from '../constants';
import { PlusCircle, Trash2, Edit, Save, X, Link as LinkIcon, Search, ArrowLeft, Compass, Download } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

// Reusable component for OWASP tables
const OwaspTable: React.FC<{
    title: string;
    headerColor: string;
    data: OwaspReference[];
    onAdd: () => void;
    onUpdate: (id: string, data: Partial<Omit<OwaspReference, 'id'>>) => void;
    onDelete: (id: string) => void;
}> = ({ title, headerColor, data, onAdd, onUpdate, onDelete }) => {
    return (
        <Card className="p-0">
            <h3 className={`text-xl font-bold text-white p-4 ${headerColor} rounded-t-lg`}>{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                        <tr>
                            <th className="px-3 py-3 w-[15%]">Vulnerability</th>
                            <th className="px-3 py-3 w-[25%]">Examples</th>
                            <th className="px-3 py-3 w-[25%] bg-blue-900/30">Preventative Controls</th>
                            <th className="px-3 py-3 w-[25%] bg-orange-900/30">Detective Controls</th>
                            <th className="px-3 py-3 w-[10%] text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/50 align-top">
                                <td className="p-1"><textarea value={item.vulnerability} onChange={e => onUpdate(item.id, { vulnerability: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3} /></td>
                                <td className="p-1"><textarea value={item.examples} onChange={e => onUpdate(item.id, { examples: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3} /></td>
                                <td className="p-1 bg-blue-900/20"><textarea value={item.preventativeControls} onChange={e => onUpdate(item.id, { preventativeControls: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3} /></td>
                                <td className="p-1 bg-orange-900/20"><textarea value={item.detectiveControls} onChange={e => onUpdate(item.id, { detectiveControls: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3} /></td>
                                <td className="p-1 text-center align-middle">
                                    <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-b-lg">
                <Button onClick={onAdd} variant="secondary" className="text-xs py-1 px-2">
                    <PlusCircle size={14} className="mr-2" />
                    Ajouter une ligne
                </Button>
            </div>
        </Card>
    );
};


const renderLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
        <>
            {parts.map((part, index) => 
                urlRegex.test(part) ? (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-block mr-2 break-all">
                        <LinkIcon size={12} className="inline mr-1" />
                        {part.split('/')[2]}...
                    </a>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </>
    );
};

const DefenseRow: React.FC<{ defense: DefenseMitigationReference }> = ({ defense }) => {
    const { updateDefense, deleteDefense } = useDefensesMitigations();
    const { filterParams } = useNavigation();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState(defense);

    const isHighlighted = filterParams?.highlightIds?.includes(String(defense.id)) || false;

    const handleSave = () => {
        updateDefense(defense.id, editState);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditState(defense);
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette référence ?")) {
            deleteDefense(defense.id);
        }
    };

    const renderCell = (field: keyof Omit<DefenseMitigationReference, 'id'>) => (
        <td className="px-2 py-1 align-top">
            <textarea
                value={editState[field]}
                onChange={e => setEditState(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full h-full bg-gray-900 border-cyan-500 border p-2 rounded-md text-white focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                rows={5}
            />
        </td>
    );

    return (
         <tr className="border-b border-gray-700 hover:bg-gray-800/50 text-xs">
            {isEditing ? (
                <>
                    {renderCell('attackType')}
                    {renderCell('threatIdName')}
                    {renderCell('aiStackLayer')}
                    {renderCell('coreAttackVector')}
                    {renderCell('impactBlastRadius')}
                    {renderCell('mitigation')}
                    {renderCell('references')}
                    {renderCell('estimatedRelation')}
                    {renderCell('mitreAtlasOwaspLinks')}
                </>
            ) : (
                <>
                    <td className="px-3 py-2 align-top font-semibold text-white">{defense.attackType}</td>
                    <td className="px-3 py-2 align-top text-white">{defense.threatIdName}</td>
                    <td className="px-3 py-2 align-top">{defense.aiStackLayer}</td>
                    <td className="px-3 py-2 align-top">{defense.coreAttackVector}</td>
                    <td className="px-3 py-2 align-top">{defense.impactBlastRadius}</td>
                    <td className="px-3 py-2 align-top">{defense.mitigation}</td>
                    <td className="px-3 py-2 align-top">{defense.references}</td>
                    <td className="px-3 py-2 align-top">{defense.estimatedRelation}</td>
                    <td className="px-3 py-2 align-top">{renderLinks(defense.mitreAtlasOwaspLinks)}</td>
                </>
            )}
             <td className="px-3 py-2 align-top sticky right-0 bg-gray-800">
                <div className="flex flex-col items-center justify-center space-y-2 h-full">
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


const DefensesMitigationsView: React.FC = () => {
    const {
        defenses, addDefense,
        keyControlsStrategies, updateKeyControlStrategy,
        keyDetectionMechanisms, updateKeyDetectionMechanism,
        owaspTopTen, addOwaspTopTenRow, updateOwaspTopTenRow, deleteOwaspTopTenRow,
        owaspAgenticTop15, addOwaspAgentic15Row, updateOwaspAgentic15Row, deleteOwaspAgentic15Row
    } = useDefensesMitigations();
    const { navigationSource, sourceTitle, filterParams, clearNavigation } = useNavigation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        if (!lowercasedFilter) {
            return {
                keyControlsStrategies,
                keyDetectionMechanisms,
                owaspTopTen,
                owaspAgenticTop15,
                defenses
            };
        }

        const filter = (items: any[]) => items.filter(item => 
            Object.values(item).some(value => String(value).toLowerCase().includes(lowercasedFilter))
        );

        return {
            keyControlsStrategies: keyControlsStrategies.filter(item => item.text.toLowerCase().includes(lowercasedFilter)),
            keyDetectionMechanisms: keyDetectionMechanisms.filter(item => item.text.toLowerCase().includes(lowercasedFilter)),
            owaspTopTen: filter(owaspTopTen),
            owaspAgenticTop15: filter(owaspAgenticTop15),
            defenses: filter(defenses),
        };
    }, [defenses, keyControlsStrategies, keyDetectionMechanisms, owaspTopTen, owaspAgenticTop15, searchTerm]);

    return (
        <div className="space-y-8">
             <header>
                <h2 className="text-2xl font-bold text-white">Référence: Défenses & Mitigations</h2>
                <p className="text-gray-400 mt-1">
                    Utilisez cette base de connaissances pour identifier les défenses et stratégies de mitigation appropriées contre les menaces et attaques identifiées.
                </p>
            </header>

            <Card className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-2/3">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher dans toutes les sections..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Section 6a */}
            <div className="space-y-6">
                 <header>
                    <h2 className="text-xl font-bold text-white">6a Référence: Mécanismes Préventifs et Détectifs</h2>
                    <p className="text-gray-400 mt-1">
                        Utilisez cet onglet pour mapper les mécanismes préventifs et les contrôles détectifs aux menaces et vulnérabilités des LLM.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h4 className="font-bold text-white mb-3">Key Controls / Mitigation Strategies</h4>
                        <div className="space-y-2">
                        {filteredData.keyControlsStrategies.map(item => (
                            <textarea
                                key={item.id}
                                value={item.text}
                                onChange={e => updateKeyControlStrategy(item.id, e.target.value)}
                                className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 text-xs"
                                rows={3}
                            />
                        ))}
                        </div>
                    </Card>
                    <Card>
                         <h4 className="font-bold text-white mb-3">Key Detection Mechanisms</h4>
                        <div className="space-y-2">
                        {filteredData.keyDetectionMechanisms.map(item => (
                            <textarea
                                key={item.id}
                                value={item.text}
                                onChange={e => updateKeyDetectionMechanism(item.id, e.target.value)}
                                className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 text-xs"
                                rows={3}
                            />
                        ))}
                        </div>
                    </Card>
                </div>
                
                <OwaspTable
                    title="OWASP Top Ten for LLM:2025"
                    headerColor="bg-red-800/80"
                    data={filteredData.owaspTopTen}
                    onAdd={addOwaspTopTenRow}
                    onUpdate={updateOwaspTopTenRow}
                    onDelete={deleteOwaspTopTenRow}
                />

                <OwaspTable
                    title="OWASP Agentic Top 15"
                    headerColor="bg-green-800/80"
                    data={filteredData.owaspAgenticTop15}
                    onAdd={addOwaspAgentic15Row}
                    onUpdate={updateOwaspAgentic15Row}
                    onDelete={deleteOwaspAgentic15Row}
                />
            </div>
            
            {/* Section 6 */}
            <div className="space-y-6 mt-12 pt-8 border-t-2 border-cyan-500/30">
                <header>
                    <h2 className="text-xl font-bold text-white">6 Référence: Matrice Détaillée des Attaques</h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <Card>
                        <h4 className="font-bold text-white mb-2">Layer (AI Red Teaming Guide pp. 25-26)</h4>
                        {DEFENSE_LAYERS.map(l => <div key={l.layer}><strong>{l.layer}:</strong> {l.focus}</div>)}
                    </Card>
                     <Card>
                        <h4 className="font-bold text-white mb-2">Question</h4>
                        {DEFENSE_QUESTIONS.map((q, i) => <div key={i}>{q.question}</div>)}
                    </Card>
                    <Card>
                        <h4 className="font-bold text-white mb-2">Condition</h4>
                        {DEFENSE_CONDITIONS.map((c, i) => <div key={i}>{c.condition}</div>)}
                    </Card>
                     <Card>
                        <h4 className="font-bold text-white mb-2">Typical objects in scope</h4>
                        <p>{DEFENSE_OBJECTS_IN_SCOPE}</p>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button onClick={addDefense}>
                        <PlusCircle size={18} className="mr-2" />
                        Ajouter à la Matrice Détaillée
                    </Button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-gray-400 border-collapse">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/60 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-3 min-w-[150px]">Types of AI System Attacks</th>
                                <th className="px-3 py-3 min-w-[200px]">Threat ID & Name</th>
                                <th className="px-3 py-3 min-w-[150px]">AI Stack/Layer</th>
                                <th className="px-3 py-3 min-w-[250px]">Core Attack Vector</th>
                                <th className="px-3 py-3 min-w-[250px]">Impact / Blast-Radius</th>
                                <th className="px-3 py-3 min-w-[250px]">Mitigation</th>
                                <th className="px-3 py-3 min-w-[150px]">References</th>
                                <th className="px-3 py-3 min-w-[200px]">Estimated Relation to OWASP Top 10 for LLM</th>
                                <th className="px-3 py-3 min-w-[300px]">MITRE ATLAS Technique / OWASP Top 10 for LLM / other links</th>
                                <th className="px-3 py-3 sticky right-0 bg-gray-700/60">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredData.defenses.map(d => (
                                <DefenseRow key={d.id} defense={d} />
                            ))}
                        </tbody>
                    </table>
                    {filteredData.defenses.length === 0 && searchTerm && (
                        <div className="text-center py-8 text-gray-500 bg-gray-800">
                            Aucune référence ne correspond à votre recherche dans la matrice détaillée.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DefensesMitigationsView;