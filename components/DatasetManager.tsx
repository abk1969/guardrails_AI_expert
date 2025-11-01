import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { useDataset } from '../contexts/DatasetContext';
import { ATTACK_FAMILIES, GUARDRAIL_CATEGORIES } from '../constants';
import { GuardrailCategory, PromptTemplate, PromptComplexity, AttackFamily } from '../types';
import { Pencil, Trash2, PlusCircle, Check, X, ChevronDown, Download } from 'lucide-react';
import { datasetImportService } from '../services/datasetImportService';

// A badge for complexity
const ComplexityBadge: React.FC<{ complexity: PromptComplexity }> = ({ complexity }) => {
    const complexityStyles: Record<PromptComplexity, string> = {
        [PromptComplexity.SIMPLE]: 'bg-blue-500/20 text-blue-300 border-blue-400',
        [PromptComplexity.MOYEN]: 'bg-yellow-500/20 text-yellow-300 border-yellow-400',
        [PromptComplexity.SOPHISTIQUE]: 'bg-red-500/20 text-red-300 border-red-400',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${complexityStyles[complexity]}`}>
            {complexity}
        </span>
    );
};

// Component for a single prompt entry
const PromptItem: React.FC<{ prompt: PromptTemplate }> = ({ prompt }) => {
    const { updatePrompt, deletePrompt } = useDataset();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(prompt.text);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSave = () => {
        if (editText.trim()) {
            updatePrompt(prompt.id, editText);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(prompt.text);
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-700 rounded-md group">
            <div className="flex items-center justify-between p-3">
                {isEditing ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md p-1 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                ) : (
                    <p className="text-gray-300 flex-1 pr-4">{prompt.text}</p>
                )}
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                     <ComplexityBadge complexity={prompt.complexity} />
                     {isEditing ? (
                        <>
                            <button onClick={handleSave} className="text-green-400 hover:text-green-300" aria-label="Sauvegarder"><Check size={18} /></button>
                            <button onClick={handleCancel} className="text-red-400 hover:text-red-300" aria-label="Annuler"><X size={18} /></button>
                        </>
                    ) : (
                        <>
                             <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Modifier"><Pencil size={16} /></button>
                             <button onClick={() => deletePrompt(prompt.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Supprimer"><Trash2 size={16} /></button>
                        </>
                    )}
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white" aria-label="Afficher les détails">
                        <ChevronDown size={20} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-600 bg-gray-800/50 rounded-b-md">
                    <p className="text-xs text-gray-500 mb-2">Catégorie Guardrail: {prompt.category}</p>
                    <h4 className="font-semibold text-cyan-400 mb-1">Guide de l'Attaque</h4>
                    <p className="text-sm text-gray-400 mb-4">{prompt.guide}</p>
                    <h4 className="font-semibold text-green-400 mb-1">Protection Technique</h4>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap font-mono">{prompt.protection}</p>
                </div>
            )}
        </div>
    );
};

const AddPromptForm: React.FC<{ family: AttackFamily }> = ({ family }) => {
    const { addPrompt } = useDataset();
    const [text, setText] = useState('');
    const [category, setCategory] = useState<GuardrailCategory>(GUARDRAIL_CATEGORIES[0].name);

    if (family !== AttackFamily.CUSTOM_PROMPTS) return null;

    const handleAdd = () => {
        if (text.trim()) {
            addPrompt(category, text);
            setText('');
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <input
                type="text"
                placeholder="Ajouter un nouveau prompt personnalisé..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GuardrailCategory)}
                className="w-full sm:w-auto bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
                {GUARDRAIL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <button onClick={handleAdd} className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors flex-shrink-0 w-full sm:w-auto justify-center" aria-label="Ajouter le prompt">
                <PlusCircle size={20} />
            </button>
        </div>
    );
}

// Component for importing datasets
const DatasetImportButtons: React.FC = () => {
    const { addPromptBatch } = useDataset();
    const [loadingBeavertails, setLoadingBeavertails] = useState(false);
    const [loadingHarmBench, setLoadingHarmBench] = useState(false);
    const [loadingPliny, setLoadingPliny] = useState(false);

    const handleImportBeaverTails = async () => {
        setLoadingBeavertails(true);
        try {
            const prompts = await datasetImportService.importBeaverTails(100);
            addPromptBatch(prompts);
            alert(`✅ ${prompts.length} prompts BeaverTails importés avec succès!`);
        } catch (error) {
            console.error('Erreur import BeaverTails:', error);
            alert(`❌ Erreur lors de l'import BeaverTails: ${error.message || error}`);
        } finally {
            setLoadingBeavertails(false);
        }
    };

    const handleImportHarmBench = async () => {
        setLoadingHarmBench(true);
        try {
            const prompts = await datasetImportService.importHarmBench(50);
            addPromptBatch(prompts);
            alert(`✅ ${prompts.length} prompts HarmBench importés avec succès!`);
        } catch (error) {
            console.error('Erreur import HarmBench:', error);
            alert(`❌ Erreur lors de l'import HarmBench: ${error.message || error}`);
        } finally {
            setLoadingHarmBench(false);
        }
    };

    const handleImportPliny = async () => {
        setLoadingPliny(true);
        try {
            const prompts = await datasetImportService.importPliny(30);
            addPromptBatch(prompts);
            alert(`✅ ${prompts.length} prompts Pliny importés avec succès!`);
        } catch (error) {
            console.error('Erreur import Pliny:', error);
            alert(`❌ Erreur lors de l'import Pliny: ${error.message || error}`);
        } finally {
            setLoadingPliny(false);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Download size={20} className="mr-2 text-cyan-500" />
                Importer des Datasets Externes
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                Enrichissez votre bibliothèque avec des datasets académiques de qualité (BeaverTails 330K+, HarmBench, Pliny).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    onClick={handleImportBeaverTails}
                    disabled={loadingBeavertails}
                    className="flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                >
                    {loadingBeavertails ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Importation...
                        </>
                    ) : (
                        <>
                            <Download size={18} className="mr-2" />
                            BeaverTails (100)
                        </>
                    )}
                </button>

                <button
                    onClick={handleImportHarmBench}
                    disabled={loadingHarmBench}
                    className="flex items-center justify-center px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                >
                    {loadingHarmBench ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Importation...
                        </>
                    ) : (
                        <>
                            <Download size={18} className="mr-2" />
                            HarmBench (50)
                        </>
                    )}
                </button>

                <button
                    onClick={handleImportPliny}
                    disabled={loadingPliny}
                    className="flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                >
                    {loadingPliny ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Importation...
                        </>
                    ) : (
                        <>
                            <Download size={18} className="mr-2" />
                            Pliny (30)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const DatasetManager: React.FC = () => {
    const { promptTemplates } = useDataset();

    const promptsByFamily = useMemo(() => {
        return promptTemplates.reduce((acc, prompt) => {
            const family = prompt.attackFamily;
            if (!acc[family]) {
                acc[family] = [];
            }
            acc[family].push(prompt);
            return acc;
        }, {} as Record<AttackFamily, PromptTemplate[]>);
    }, [promptTemplates]);

    return (
        <div className="space-y-6">
             <header className="mb-4">
                <h2 className="text-2xl font-bold text-white">Bibliothèque d'Attaques de Test</h2>
                <p className="text-gray-400 mt-1">Visualisez, modifiez et enrichissez les scénarios d'attaque basés sur les taxonomies de sécurité standards.</p>
            </header>

            <DatasetImportButtons />

            {ATTACK_FAMILIES.map(familyInfo => {
                 const promptsForFamily = promptsByFamily[familyInfo.name] || [];
                 if (promptsForFamily.length === 0 && familyInfo.name !== AttackFamily.CUSTOM_PROMPTS) return null;
                 
                 return (
                    <Card key={familyInfo.name}>
                        <h3 className="text-xl font-bold text-white mb-2">{familyInfo.name}</h3>
                        <p className="text-sm text-gray-400 mb-6">{familyInfo.description}</p>
                        
                        {promptsForFamily.length > 0 ? (
                             <div className="space-y-2">
                                {promptsForFamily.map((prompt) => (
                                    <PromptItem key={prompt.id} prompt={prompt} />
                                ))}
                            </div>
                        ) : (
                            familyInfo.name !== AttackFamily.CUSTOM_PROMPTS && <p className="text-gray-500">Aucun prompt dans cette famille.</p>
                        )}
                        
                        {familyInfo.name === AttackFamily.CUSTOM_PROMPTS && <AddPromptForm family={familyInfo.name} />}
                    </Card>
                )
            })}
        </div>
    );
};

export default DatasetManager;