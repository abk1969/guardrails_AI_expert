import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { useDataset } from '../contexts/DatasetContext';
import { ATTACK_FAMILIES, GUARDRAIL_CATEGORIES } from '../constants';
import { GuardrailCategory, PromptTemplate, PromptComplexity, AttackFamily } from '../types';
import { Pencil, Trash2, PlusCircle, Check, X, ChevronDown } from 'lucide-react';

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