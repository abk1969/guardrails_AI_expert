import React, { useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useIncidentReadiness } from '../contexts/IncidentReadinessContext';
import { useNavigation } from '../contexts/NavigationContext';
import { IncidentReadinessQuestion, ReadinessRating, IncidentCategory, IncidentMonitoringReference } from '../types';
import { READINESS_RATINGS } from '../constants';
import { PlusCircle, Trash2, ArrowLeft, Compass, X } from 'lucide-react';

const QuestionRow: React.FC<{ question: IncidentReadinessQuestion; isHighlighted?: boolean }> = ({ question, isHighlighted = false }) => {
    const { updateQuestion, deleteQuestion } = useIncidentReadiness();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateQuestion(question.id, { [e.target.name]: e.target.value });
    };

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
            deleteQuestion(question.id);
        }
    };

    return (
        <tr className={`border-b border-gray-700 hover:bg-gray-800/50 align-top transition-all ${
            isHighlighted
                ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-l-cyan-400 ring-2 ring-cyan-500/30'
                : ''
        }`}>
            <td className="px-4 py-3 font-medium text-white w-1/3">{question.question}</td>
            <td className="px-2 py-2 w-1/4">
                <textarea
                    name="response"
                    value={question.response}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={2}
                />
            </td>
            <td className="px-2 py-2">
                <select
                    name="initialRating"
                    value={question.initialRating}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition border-gray-600 bg-gray-700/50"
                >
                    <option value="">Select...</option>
                    {READINESS_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </td>
            <td className="px-2 py-2">
                 <textarea
                    name="tested"
                    value={question.tested}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={2}
                />
            </td>
            <td className="px-2 py-2">
                <select
                    name="revisedRating"
                    value={question.revisedRating}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition border-gray-600 bg-gray-700/50"
                >
                    <option value="">Select...</option>
                    {READINESS_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </td>
             <td className="px-4 py-3 text-center">
                <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-400"
                    aria-label="Supprimer la question"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};

const IncidentReadinessView: React.FC = () => {
    const {
        questions, addQuestion,
        incidentCategories, addIncidentCategory, updateIncidentCategory, deleteIncidentCategory,
        incidentMonitoringReferences, addIncidentMonitoringReference, updateIncidentMonitoringReference, deleteIncidentMonitoringReference
     } = useIncidentReadiness();
    const { navigationSource, sourceTitle, filterParams, clearNavigation } = useNavigation();

    const groupedQuestions = useMemo(() => {
        return questions.reduce((acc, current) => {
            (acc[current.category] = acc[current.category] || []).push(current);
            return acc;
        }, {} as Record<string, IncidentReadinessQuestion[]>);
    }, [questions]);

    // Maintain a consistent order for categories
    const categoryOrder = [
        'Preparation',
        'Detection & Analysis',
        'Containment',
        'Eradication',
        'Recovery',
        'Post-Incident Review',
        'Tabletop Exercises',
        'Risk Assessment and Management',
        "Organization's AI Systems",
        'Detecting AI Incident'
    ];

    const sortedCategoryKeys = Object.keys(groupedQuestions).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <div className="space-y-8">
            {/* Navigation Breadcrumb */}
            {navigationSource && filterParams?.highlightIds && (
                <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-transparent border-l-4 border-l-cyan-400 animate-in slide-in-from-top-4 duration-300 fade-in">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={clearNavigation}
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <Compass className="w-5 h-5" />
                            <span className="font-medium">Retour à OWASP COMPASS</span>
                        </button>
                        <button
                            onClick={clearNavigation}
                            className="p-1 hover:bg-cyan-900/30 rounded transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    {sourceTitle && (
                        <div className="mt-2 text-sm text-gray-300">
                            Navigation depuis: <span className="font-semibold text-cyan-300">{sourceTitle}</span>
                        </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">
                        {filterParams.highlightIds.length} question(s) de préparation liée(s)
                    </div>
                </Card>
            )}

            {/* --- NOUVELLE SECTION DE RÉFÉRENCE --- */}
            <div className="space-y-6">
                <header>
                    <h2 className="text-2xl font-bold text-white">6b Référence: Surveillance des Incidents</h2>
                    <p className="text-gray-400 mt-1">
                        Utilisez cet onglet pour identifier quel type de catégorie d'incident LLM surveiller, la couche, le type d'alerte et des suggestions d'outils.
                    </p>
                </header>

                <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                                <tr>
                                    <th className="px-4 py-3 w-1/3">Type de Catégorie</th>
                                    <th className="px-4 py-3 w-2/3">Exemples d'Incidents</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidentCategories.map(cat => (
                                    <tr key={cat.id} className="border-b border-gray-700 hover:bg-gray-800/50 align-top">
                                        <td className="p-1"><textarea value={cat.categoryType} onChange={e => updateIncidentCategory(cat.id, { categoryType: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 text-white" rows={2}/></td>
                                        <td className="p-1"><textarea value={cat.examplesOfIncidents} onChange={e => updateIncidentCategory(cat.id, { examplesOfIncidents: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={2}/></td>
                                        <td className="p-1 text-center align-middle"><button onClick={() => deleteIncidentCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded-b-lg">
                        <Button onClick={addIncidentCategory} variant="secondary" className="text-xs py-1 px-2"><PlusCircle size={14} className="mr-2" />Ajouter une Catégorie</Button>
                    </div>
                </Card>

                <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                                <tr>
                                    <th className="px-4 py-3">Couche</th>
                                    <th className="px-4 py-3">Quoi Surveiller</th>
                                    <th className="px-4 py-3">Type d'Alerte</th>
                                    <th className="px-4 py-3">Outils Suggérés</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidentMonitoringReferences.map(ref => (
                                     <tr key={ref.id} className="border-b border-gray-700 hover:bg-gray-800/50 align-top">
                                        <td className="p-1"><textarea value={ref.layer} onChange={e => updateIncidentMonitoringReference(ref.id, { layer: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 text-white" rows={3}/></td>
                                        <td className="p-1"><textarea value={ref.whatToMonitor} onChange={e => updateIncidentMonitoringReference(ref.id, { whatToMonitor: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3}/></td>
                                        <td className="p-1"><textarea value={ref.alertType} onChange={e => updateIncidentMonitoringReference(ref.id, { alertType: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3}/></td>
                                        <td className="p-1"><textarea value={ref.suggestedTools} onChange={e => updateIncidentMonitoringReference(ref.id, { suggestedTools: e.target.value })} className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700" rows={3}/></td>
                                        <td className="p-1 text-center align-middle"><button onClick={() => deleteIncidentMonitoringReference(ref.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded-b-lg">
                        <Button onClick={addIncidentMonitoringReference} variant="secondary" className="text-xs py-1 px-2"><PlusCircle size={14} className="mr-2" />Ajouter une Référence</Button>
                    </div>
                </Card>
            </div>
            
            {/* --- SECTION QUESTIONNAIRE EXISTANTE --- */}
            <div className="space-y-6 mt-12 pt-8 border-t-2 border-cyan-500/30">
                <header>
                    <h2 className="text-2xl font-bold text-white">3c Orient AI Incident Response Readiness</h2>
                    <p className="text-gray-400 mt-1">
                        Utilisez ce questionnaire pour identifier les lacunes dans votre préparation à la réponse aux incidents IA.
                    </p>
                </header>

                {sortedCategoryKeys.map(categoryName => (
                    <Card key={categoryName} className="p-0">
                        <h3 className="text-xl font-bold text-white p-4 bg-gray-700/50 rounded-t-lg">{categoryName}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-700/30">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Question</th>
                                        <th scope="col" className="px-4 py-3">Response</th>
                                        <th scope="col" className="px-4 py-3">Initial Rating</th>
                                        <th scope="col" className="px-4 py-3">Tested</th>
                                        <th scope="col" className="px-4 py-3">Revised Rating</th>
                                        <th scope="col" className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedQuestions[categoryName].map(q => {
                                        const questionIndex = questions.indexOf(q);
                                        const isHighlighted = filterParams?.highlightIds?.includes(String(questionIndex)) || false;
                                        return <QuestionRow key={q.id} question={q} isHighlighted={isHighlighted} />;
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-2 bg-gray-800/50 rounded-b-lg">
                            <Button onClick={() => addQuestion(categoryName)} variant="secondary" className="text-xs py-1 px-2">
                                <PlusCircle size={14} className="mr-2" />
                                Ajouter une question
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default IncidentReadinessView;