import React, { useState, useMemo, useRef } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAIThirdPartyQuestions } from '../contexts/AIThirdPartyQuestionsContext';
import { AIThirdPartyQuestion, QuestionRating } from '../types';
import { PlusCircle, Trash2, Search, ChevronDown, Upload, Download, PieChart, CheckSquare, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';


const RATING_OPTIONS: QuestionRating[] = ['Excellent', 'Good', 'Acceptable', 'Poor', 'Not Answered', ''];

const RATING_COLORS: Record<QuestionRating, string> = {
    'Excellent': 'bg-green-500/30 text-green-200 border-green-500',
    'Good': 'bg-teal-500/30 text-teal-200 border-teal-500',
    'Acceptable': 'bg-yellow-500/30 text-yellow-200 border-yellow-500',
    'Poor': 'bg-red-500/30 text-red-200 border-red-500',
    'Not Answered': 'bg-gray-500/30 text-gray-200 border-gray-500',
    '': 'bg-gray-700/50 text-gray-400 border-gray-600',
};
const CHART_COLORS: Record<QuestionRating, string> = {
    'Excellent': '#4ade80',
    'Good': '#2dd4bf',
    'Acceptable': '#facc15',
    'Poor': '#f87171',
    'Not Answered': '#9ca3af',
    '': '#6b7280',
};


const QuestionRow: React.FC<{ question: AIThirdPartyQuestion, onUpdate: (id: string, data: Partial<AIThirdPartyQuestion>) => void, onDelete: (id: string) => void }> = ({ question, onUpdate, onDelete }) => {
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(question.id, { [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(question.id, { rating: e.target.value as QuestionRating });
    }

    return (
        <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <textarea 
                    name="question"
                    value={question.question}
                    onChange={handleTextChange}
                    className="w-full bg-transparent text-white font-semibold rounded-md focus:bg-gray-700/50 p-1 -m-1"
                    rows={2}
                />
                 <button onClick={() => onDelete(question.id)} className="p-2 text-gray-500 hover:text-red-400 ml-2 flex-shrink-0" aria-label="Supprimer"><Trash2 size={16} /></button>
            </div>
             <div>
                <textarea 
                    name="response"
                    value={question.response}
                    onChange={handleTextChange}
                    placeholder="Saisir la réponse du tiers ici..."
                    className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition text-sm"
                    rows={4}
                />
            </div>
            <div>
                 <select
                    name="rating"
                    value={question.rating}
                    onChange={handleSelectChange}
                    className={`w-full md:w-1/3 p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition border text-xs font-semibold ${RATING_COLORS[question.rating]}`}
                >
                    {RATING_OPTIONS.map(r => <option key={r} value={r} className="bg-gray-800 text-white font-semibold">{r || 'Noter...'}</option>)}
                </select>
            </div>
        </div>
    );
};

const CategorySection: React.FC<{ category: string, questions: AIThirdPartyQuestion[], onAdd: (category: string) => void, onUpdate: (id: string, data: Partial<AIThirdPartyQuestion>) => void, onDelete: (id: string) => void }> = ({ category, questions, onAdd, onUpdate, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card className="p-0">
             <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-4 bg-gray-700/50 rounded-t-lg">
                <h3 className="text-xl font-bold text-white">{category}</h3>
                <div className="flex items-center">
                    <span className="text-sm text-gray-400 mr-4">{questions.length} questions</span>
                    <ChevronDown size={24} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {questions.map(q => <QuestionRow key={q.id} question={q} onUpdate={onUpdate} onDelete={onDelete} />)}
                    <div className="pt-2">
                        <Button onClick={() => onAdd(category)} variant="secondary" className="text-xs py-1 px-2">
                            <PlusCircle size={14} className="mr-2" />
                            Ajouter une question
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    )
}

const AIThirdPartyQuestionsView: React.FC = () => {
    const { questions, updateQuestion, addQuestion, deleteQuestion, importQuestions } = useAIThirdPartyQuestions();
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredQuestions = useMemo(() => {
        if (!searchTerm) return questions;
        const lowercasedFilter = searchTerm.toLowerCase();
        return questions.filter(q => 
            q.category.toLowerCase().includes(lowercasedFilter) ||
            q.question.toLowerCase().includes(lowercasedFilter) ||
            q.response.toLowerCase().includes(lowercasedFilter)
        );
    }, [questions, searchTerm]);

    const groupedQuestions = useMemo(() => {
        return filteredQuestions.reduce((acc, q) => {
            (acc[q.category] = acc[q.category] || []).push(q);
            return acc;
        }, {} as Record<string, AIThirdPartyQuestion[]>);
    }, [filteredQuestions]);

    const stats = useMemo(() => {
        const total = questions.length;
        const answered = questions.filter(q => q.response.trim() !== '').length;
        const rated = questions.filter(q => q.rating !== '').length;
        const ratingDistribution = questions.reduce((acc, q) => {
            if (q.rating) {
                acc[q.rating] = (acc[q.rating] || 0) + 1;
            }
            return acc;
        }, {} as Record<QuestionRating, number>);

        const chartData = Object.entries(ratingDistribution)
            .map(([name, value]) => ({ name: name as QuestionRating, value }))
            .filter(item => item.value > 0);

        return { total, answered, rated, chartData };
    }, [questions]);
    
    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(questions, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "ai_third_party_questions.json";
        link.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content === 'string') {
                        const importedData = JSON.parse(content);
                        if (importQuestions(importedData)) {
                           alert('Importation réussie !');
                        } else {
                           alert("Échec de l'importation. Le fichier est invalide ou corrompu.");
                        }
                    }
                } catch (error) {
                    alert("Erreur lors de la lecture du fichier. Assurez-vous que c'est un JSON valide.");
                }
            };
            reader.readAsText(file);
            // Reset file input value to allow re-uploading the same file
            event.target.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">6c Référence: Questionnaire pour Tiers IA</h2>
                <p className="text-gray-400 mt-1">
                    Ces questions devraient être ajoutées au questionnaire TPRM (Third-Party Risk Management) pour l'assurance IA dans les services et fournisseurs tiers.
                </p>
            </header>

             <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center col-span-1 md:col-span-2 lg:col-span-1">
                         <PieChart size={32} className="text-cyan-400 mr-4" />
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                            <div className="text-sm text-gray-400">Questions Totales</div>
                        </div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center">
                        <MessageSquare size={32} className="text-cyan-400 mr-4" />
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.answered}</div>
                            <div className="text-sm text-gray-400">Réponses Reçues</div>
                        </div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center">
                         <CheckSquare size={32} className="text-cyan-400 mr-4" />
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.rated}</div>
                            <div className="text-sm text-gray-400">Questions Notées</div>
                        </div>
                    </div>
                    <div className="h-24">
                         <ResponsiveContainer width="100%" height="100%">
                             <RechartsPieChart>
                                 <Tooltip contentStyle={{ backgroundColor: '#272b30', border: '1px solid #3c424a' }} />
                                <Pie data={stats.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} fill="#8884d8">
                                    {stats.chartData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-1/2">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par catégorie, question ou réponse..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                        <Button onClick={handleImportClick} variant="secondary" className="w-1/2 md:w-auto"><Upload size={16} className="mr-2"/> Importer JSON</Button>
                        <Button onClick={handleExport} variant="secondary" className="w-1/2 md:w-auto"><Download size={16} className="mr-2"/> Exporter JSON</Button>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                {Object.entries(groupedQuestions).map(([category, qs]) => (
                    <CategorySection 
                        key={category} 
                        category={category} 
                        questions={qs}
                        onUpdate={updateQuestion}
                        onDelete={deleteQuestion}
                        onAdd={addQuestion}
                    />
                ))}
            </div>

        </div>
    );
};

export default AIThirdPartyQuestionsView;