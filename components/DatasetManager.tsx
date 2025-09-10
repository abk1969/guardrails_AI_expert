import React, { useState } from 'react';
import Card from './ui/Card';
import { useDataset } from '../contexts/DatasetContext';
import { GUARDRAIL_CATEGORIES } from '../constants';
import { GuardrailCategory, PromptTemplate, PromptComplexity } from '../types';
import { Pencil, Trash2, PlusCircle, Check, X, ChevronDown } from 'lucide-react';

// A badge for complexity
const ComplexityBadge = ({ complexity }: { complexity: PromptComplexity }) => {
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
const PromptItem = ({ prompt, category }: { prompt: PromptTemplate; category: GuardrailCategory }) => {
    const { updatePrompt, deletePrompt } = useDataset();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(prompt.text);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSave = () => {
        if (editText.trim()) {
            updatePrompt(category, prompt.id, editText);
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
                             <button onClick={() => deletePrompt(category, prompt.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Supprimer"><Trash2 size={16} /></button>
                        </>
                    )}
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white" aria-label="Afficher les détails">
                        <ChevronDown size={20} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-600 bg-gray-800/50 rounded-b-md">
                    <h4 className="font-semibold text-cyan-400 mb-1">Guide du Prompt</h4>
                    <p className="text-sm text-gray-400 mb-4">{prompt.guide}</p>
                    <h4 className="font-semibold text-green-400 mb-1">Protection Technique</h4>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap font-mono">{prompt.protection}</p>
                </div>
            )}
        </div>
    );
};

const DatasetManager: React.FC = () => {
    const { promptTemplates, addPrompt } = useDataset();
    const [newPrompts, setNewPrompts] = useState<Record<string, string>>({});

    const handleNewPromptChange = (category: GuardrailCategory, value: string) => {
        setNewPrompts(prev => ({ ...prev, [category]: value }));
    };

    const handleAddPrompt = (category: GuardrailCategory) => {
        const text = newPrompts[category];
        if (text && text.trim()) {
            addPrompt(category, text);
            setNewPrompts(prev => ({...prev, [category]: ''}));
        }
    };

    return (
        <div className="space-y-6">
             <header className="mb-4">
                <h2 className="text-2xl font-bold text-white">Gestion des Jeux de Données</h2>
                <p className="text-gray-400 mt-1">Visualisez, modifiez et enrichissez les modèles de prompts pour chaque guardrail.</p>
            </header>
            {GUARDRAIL_CATEGORIES.map(categoryInfo => (
                <Card key={categoryInfo.name}>
                    <h3 className="text-xl font-bold text-white mb-2">{categoryInfo.name}</h3>
                    <p className="text-sm text-gray-400 mb-6">{categoryInfo.description}</p>
                    
                    <div className="space-y-2 mb-6">
                        {promptTemplates[categoryInfo.name].map((prompt) => (
                            <PromptItem key={prompt.id} prompt={prompt} category={categoryInfo.name} />
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                         <input
                            type="text"
                            placeholder="Ajouter un nouveau prompt simple..."
                            value={newPrompts[categoryInfo.name] || ''}
                            onChange={(e) => handleNewPromptChange(categoryInfo.name, e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPrompt(categoryInfo.name)}
                        />
                        <button onClick={() => handleAddPrompt(categoryInfo.name)} className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors flex-shrink-0" aria-label="Ajouter le prompt">
                            <PlusCircle size={20} />
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DatasetManager;