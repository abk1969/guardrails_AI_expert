import React, { useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useRedTeam } from '../contexts/RedTeamContext';
import { RedTeamQuestion, RedTeamRating } from '../types';
import { RED_TEAM_RATINGS } from '../constants';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const QuestionRow: React.FC<{ question: RedTeamQuestion }> = ({ question }) => {
    const { updateQuestion, deleteQuestion } = useRedTeam();
    const { settings } = useSettings();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateQuestion(question.id, { [e.target.name]: e.target.value });
    };

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
            deleteQuestion(question.id);
        }
    };

    const ratingColor = useMemo(() => {
      if (!question.initialRating) return 'border-gray-600 bg-gray-700/50';
      const ratingLevel = question.initialRating as RedTeamRating;
      const riskLevel = settings.riskLevels.find(r => r.level === ratingLevel);
      return riskLevel ? riskLevel.color.replace('/30', '/50') : 'border-gray-600 bg-gray-700/50';
    }, [question.initialRating, settings.riskLevels]);

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50 align-top">
            <td className="px-2 py-2 w-2/5">
                 <textarea
                    name="question"
                    value={question.question}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition text-white"
                    rows={3}
                />
            </td>
            <td className="px-2 py-2 w-2/5">
                <textarea
                    name="response"
                    value={question.response}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 p-2 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={3}
                    placeholder="Votre réponse ou analyse ici..."
                />
            </td>
            <td className="px-2 py-2 w-1/5">
                <select
                    name="initialRating"
                    value={question.initialRating}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition border ${ratingColor}`}
                >
                    <option value="" className="bg-gray-800">Sélectionner...</option>
                    {RED_TEAM_RATINGS.map(r => <option key={r} value={r} className="bg-gray-800">{r}</option>)}
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

const RedTeamSecurityView: React.FC = () => {
    const { questions, businessObjective, updateBusinessObjective, addQuestion } = useRedTeam();

    const groupedQuestions = useMemo(() => {
        return questions.reduce((acc, current) => {
            (acc[current.category] = acc[current.category] || []).push(current);
            return acc;
        }, {} as Record<string, RedTeamQuestion[]>);
    }, [questions]);
    
    const categoryOrder = [
        'General Questions',
        'Legal & Compliance',
        'Developers & Architects',
        'Adversarial Resilience'
    ];

    const sortedCategoryKeys = Object.keys(groupedQuestions).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">Questionnaire de Revue de Sécurité Red Team</h2>
                <p className="text-gray-400 mt-1">
                    Utilisez cet onglet pour poser des questions spécifiques sur le cas d'usage métier et l'architecture afin de réviser l'objectif.
                </p>
            </header>

            <Card>
                <h3 className="text-xl font-bold text-white mb-2">Objectif Métier</h3>
                 <textarea
                    value={businessObjective}
                    onChange={(e) => updateBusinessObjective(e.target.value)}
                    placeholder="Décrivez ici l'objectif métier, le cas d'usage et les composants architecturaux de haut niveau de l'application examinée..."
                    className="w-full bg-gray-700/50 p-3 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={4}
                />
            </Card>

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
                                    <th scope="col" className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedQuestions[categoryName].map(q => <QuestionRow key={q.id} question={q} />)}
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
    );
};

export default RedTeamSecurityView;