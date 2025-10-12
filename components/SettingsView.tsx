import React from 'react';
import Card from './ui/Card';
import { useSettings } from '../contexts/SettingsContext';
import { ImpactScoreSetting, LikelihoodScoreSetting, RiskLevelSetting } from '../types';

const SettingsView: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handleImpactChange = (score: number, description: string) => {
        const newImpactScores = settings.impactScores.map(is => 
            is.score === score ? { ...is, description } : is
        );
        updateSettings({ impactScores: newImpactScores });
    };

    const handleLikelihoodChange = (score: number, description: string) => {
        const newLikelihoodScores = settings.likelihoodScores.map(ls => 
            ls.score === score ? { ...ls, description } : ls
        );
        updateSettings({ likelihoodScores: newLikelihoodScores });
    };
    
    const handleRiskRangeChange = (level: string, index: 0 | 1, value: string) => {
        const newRiskLevels = settings.riskLevels.map(rl => {
            if (rl.level === level) {
                const newRange = [...rl.range] as [number, number];
                newRange[index] = parseInt(value, 10) || 0;
                return { ...rl, range: newRange };
            }
            return rl;
        });
        updateSettings({ riskLevels: newRiskLevels });
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">Paramètres et Méthodologie</h2>
                <p className="text-gray-400 mt-1">Configurez la méthodologie de notation des risques et consultez les guides d'utilisation.</p>
            </header>

            <Card>
                <h3 className="text-xl font-bold text-white mb-2">Objectif de ce classeur</h3>
                <p className="text-gray-400">
                    Ce classeur aide les organisations à identifier, évaluer et prioriser les menaces liées à l'IA tout au long de leur cycle de vie, en utilisant une notation structurée et une prise de décision cohérente. Sa mission est d'aider à sécuriser le déploiement de l'IA.
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Public Cible</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><strong>CISO:</strong> Définir les priorités des menaces IA et communiquer les risques au niveau exécutif.</li>
                        <li><strong>AI Red Teamer:</strong> Documenter et prioriser les résultats des tests contradictoires.</li>
                        <li><strong>Ingénieur Sécurité:</strong> Suivre les vulnérabilités et aligner les mesures de mitigation.</li>
                        <li><strong>Analyste de Menaces:</strong> Consolider les menaces émergentes et les incidents.</li>
                        <li><strong>Développeur/Ingénieur IA:</strong> Comprendre les risques d'abus des modèles et concevoir de manière sécurisée.</li>
                    </ul>
                </Card>
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Guide de Démarrage Rapide</h3>
                     <ol className="list-decimal list-inside space-y-2 text-gray-400">
                        <li>Le classeur est conçu pour une utilisation itérative afin de se concentrer sur les principales menaces.</li>
                        <li>Allez à l'onglet '2a Observe Objective Profile' et définissez les systèmes ou cas d'usage que vous évaluez.</li>
                        <li>Travaillez à travers chaque phase OODA (Observe → Orient → Decide → Act).</li>
                        <li>Priorisez les menaces en utilisant le système de notation 1-5 pour estimer la probabilité et l'impact.</li>
                        <li>Construisez une feuille de route basée sur les résultats.</li>
                    </ol>
                </Card>
            </div>
            
            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Légende de Notation (Configurable)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Impact Score */}
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Clé de Score d'Impact</h4>
                        <div className="space-y-2">
                            {settings.impactScores.sort((a,b) => b.score - a.score).map(item => (
                                <div key={item.score}>
                                    <label className="text-sm font-bold text-white">Score {item.score} - {item.level}</label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleImpactChange(item.score, e.target.value)}
                                        className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Likelihood Score */}
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Clé de Score de Probabilité</h4>
                        <div className="space-y-2">
                             {settings.likelihoodScores.sort((a,b) => b.score - a.score).map(item => (
                                <div key={item.score}>
                                    <label className="text-sm font-bold text-white">Score {item.score} - {item.level}</label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleLikelihoodChange(item.score, e.target.value)}
                                        className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Level */}
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">Niveau de Risque par Score</h4>
                        <div className="space-y-3">
                            {settings.riskLevels.map(item => (
                                <div key={item.level} className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs rounded-full border ${item.color} w-24 text-center`}>{item.level}</span>
                                    <input
                                        type="number"
                                        value={item.range[0]}
                                        onChange={e => handleRiskRangeChange(item.level, 0, e.target.value)}
                                        className="w-16 bg-gray-700 border-gray-600 rounded-md p-1 text-center text-sm text-white"
                                    />
                                    <span>-</span>
                                     <input
                                        type="number"
                                        value={item.range[1]}
                                         onChange={e => handleRiskRangeChange(item.level, 1, e.target.value)}
                                        className="w-16 bg-gray-700 border-gray-600 rounded-md p-1 text-center text-sm text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default SettingsView;