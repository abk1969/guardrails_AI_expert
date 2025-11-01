import React, { useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { useAttackSurface } from '../contexts/AttackSurfaceContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ImpactLevelName } from '../types';
import { ArrowLeft, Compass, X } from 'lucide-react';

const ratingColors: Record<number, string> = {
    5: 'bg-red-700', 4: 'bg-orange-600', 3: 'bg-yellow-500', 2: 'bg-green-600', 1: 'bg-teal-600'
};

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <Card className={className}>
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <div className="text-sm text-gray-400 space-y-2">{children}</div>
    </Card>
);

const AttackSurfaceAnalysisView: React.FC = () => {
    const {
        attackVectors,
        impactConfig,
        nuclearScenarios,
        updateAttackVector,
        updateImpactConfig,
        updateNuclearScenario
    } = useAttackSurface();

    const { settings } = useSettings();
    const { navigationSource, sourceTitle, filterParams, clearNavigation } = useNavigation();

    const formatCurrency = (value: string) => {
        const number = parseFloat(value.replace(/,/g, '.'));
        if (isNaN(number)) return value;
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(number);
    };

    const riskLevelColors: Record<number, string> = {
        5: 'bg-red-500 text-white',
        4: 'bg-orange-500 text-white',
        3: 'bg-yellow-500 text-black',
        2: 'bg-green-500 text-white',
        1: 'bg-teal-500 text-white',
    };

    // Sort attack vectors to show highlighted ones first
    const sortedAttackVectors = useMemo(() => {
        if (!filterParams?.highlightIds) return attackVectors;

        return [...attackVectors].sort((a, b) => {
            const aIndex = attackVectors.indexOf(a);
            const bIndex = attackVectors.indexOf(b);
            const aHighlighted = filterParams.highlightIds!.includes(String(aIndex));
            const bHighlighted = filterParams.highlightIds!.includes(String(bIndex));
            return aHighlighted === bHighlighted ? 0 : aHighlighted ? -1 : 1;
        });
    }, [attackVectors, filterParams]);

    // Auto-scroll to first highlighted item
    useEffect(() => {
        if (filterParams?.highlightIds && filterParams.highlightIds.length > 0) {
            // Wait for DOM to render
            setTimeout(() => {
                const firstHighlighted = document.querySelector('[data-highlighted="true"]');
                if (firstHighlighted) {
                    firstHighlighted.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 300);
        }
    }, [filterParams]);

    return (
        <div className="space-y-6">
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
                        {filterParams.highlightIds.length} surface(s) d'attaque liée(s)
                    </div>
                </Card>
            )}

            <header>
                <h2 className="text-2xl font-bold text-white">Analyse de la Surface d'Attaque</h2>
                <p className="text-gray-400 mt-1">Évaluez le risque des menaces en modélisant l'impact organisationnel et la probabilité.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InfoCard title="Instructions">
                    <p><strong>Étape 1:</strong> Révisez et ajustez les seuils financiers dans le tableau "Impact Organisationnel" pour les aligner sur les standards de votre organisation.</p>
                    <p><strong>Étape 2:</strong> Spécifiez 3 scénarios de "Désastre Nucléaire IA" pour définir les pires cas de figure.</p>
                    <p><strong>Étape 3:</strong> Utilisez les vecteurs d'attaque listés pour évaluer le niveau de risque-menace pour votre cas d'usage spécifique.</p>
                </InfoCard>
                <InfoCard title="Heat Map" className="flex items-center justify-center">
                    <table className="border-collapse text-center text-xs font-bold">
                        <tbody>
                            {settings.impactScores.map(({ score: impactScore }) => (
                                <tr key={impactScore}>
                                    <td className="border border-gray-600 p-2 w-8 h-8">{impactScore}</td>
                                    {settings.likelihoodScores.map(({ score: likelihoodScore }) => {
                                        const riskScore = impactScore * likelihoodScore;
                                        const riskLevel = settings.riskLevels.find(rl => riskScore >= rl.range[0] && riskScore <= rl.range[1]);
                                        const colorClass = riskLevel ? riskLevel.color.replace(/bg-([a-z]+)-(\d+)\/30/, 'bg-$1-$2/100').replace('border-transparent', '') : 'bg-gray-700';
                                        return (
                                            <td key={likelihoodScore} className={`border border-gray-600 w-8 h-8 text-white ${colorClass}`}>
                                                {riskScore}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                            <tr>
                                <td></td>
                                {settings.likelihoodScores.map(l => <td key={l.score} className="border border-gray-600 p-2 w-8 h-8">{l.score}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </InfoCard>
                <InfoCard title="Référence de Maturité des Défenses">
                    <ul className="space-y-1.5">
                        <li className="flex items-center"><span className="w-4 h-4 rounded-full bg-red-700 mr-2 border border-red-500"></span> 5 - Zéro / Rare / Menace Critique</li>
                        <li className="flex items-center"><span className="w-4 h-4 rounded-full bg-orange-600 mr-2 border border-orange-400"></span> 4 - Ad-hoc / Partiel / Menace Élevée</li>
                        <li className="flex items-center"><span className="w-4 h-4 rounded-full bg-yellow-500 mr-2 border border-yellow-300"></span> 3 - Implémenté / Planifié / Menace Modérée</li>
                        <li className="flex items-center"><span className="w-4 h-4 rounded-full bg-green-600 mr-2 border border-green-400"></span> 2 - Quantitatif / Géré / Menace Minimale</li>
                        <li className="flex items-center"><span className="w-4 h-4 rounded-full bg-teal-600 mr-2 border border-teal-400"></span> 1 - Opérationnel / Menace Faible</li>
                    </ul>
                </InfoCard>
            </div>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-1/4">Vecteur d'Attaque / Catégorie de Menace</th>
                                <th scope="col" className="px-4 py-3 w-1/2">Description</th>
                                <th scope="col" className="px-4 py-3 w-1/4">Niveau de Risque-Menace</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAttackVectors.map((vector) => {
                                const originalIndex = attackVectors.indexOf(vector);
                                const isHighlighted = filterParams?.highlightIds?.includes(String(originalIndex)) || false;
                                return (
                                <tr data-highlighted={isHighlighted} key={vector.id} className={`border-b border-gray-700 transition-all ${
                                    isHighlighted
                                        ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-l-cyan-400 ring-2 ring-cyan-500/30'
                                        : ''
                                }`}>
                                    <td className="px-4 py-2 font-medium text-white">{vector.threat}</td>
                                    <td className="px-4 py-2">
                                        <textarea 
                                            value={vector.description}
                                            onChange={e => updateAttackVector(vector.id, { description: e.target.value })}
                                            className="w-full bg-transparent p-1 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select 
                                            value={vector.riskLevel}
                                            onChange={e => updateAttackVector(vector.id, { riskLevel: parseInt(e.target.value) })}
                                            className={`w-full p-2 rounded-md font-bold border border-gray-600 focus:ring-1 focus:ring-cyan-500 transition ${riskLevelColors[vector.riskLevel]}`}
                                        >
                                            {[5,4,3,2,1].map(v => <option key={v} value={v} className="bg-gray-800 text-white">{v}</option>)}
                                        </select>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-0">
                    <h3 className="text-lg font-bold text-white p-4">Impact Organisationnel</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Niveau d'Impact</th>
                                    <th scope="col" className="px-4 py-2">Description (depuis Paramètres)</th>
                                    <th scope="col" className="px-4 py-2">Seuil Bas</th>
                                    <th scope="col" className="px-4 py-2">Seuil Haut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {impactConfig.map(config => {
                                    const setting = settings.impactScores.find(s => s.score === config.rating);
                                    return (
                                        <tr key={config.level} className={`border-b border-gray-700 ${ratingColors[config.rating]} text-white`}>
                                            <td className="px-4 py-2 font-bold flex items-center">
                                                <span className={`w-3 h-3 rounded-full mr-2 border border-black ${ratingColors[config.rating]}`}></span>
                                                {config.level} ({config.rating})
                                            </td>
                                            <td className="px-4 py-2 text-xs italic">{setting?.description || 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="text"
                                                    value={formatCurrency(config.lowRange)}
                                                    onChange={e => updateImpactConfig(config.level as ImpactLevelName, { lowRange: e.target.value.replace(/[^0-9,]/g, '') })}
                                                    className="w-full bg-gray-800/50 p-1 rounded-md border-gray-500 border focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="text"
                                                    value={formatCurrency(config.highRange)}
                                                    onChange={e => updateImpactConfig(config.level as ImpactLevelName, { highRange: e.target.value.replace(/[^0-9,]/g, '') })}
                                                    className="w-full bg-gray-800/50 p-1 rounded-md border-gray-500 border focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card className="p-0">
                    <h3 className="text-lg font-bold text-white p-4">Niveau de Probabilité</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Niveau de Probabilité</th>
                                    <th scope="col" className="px-4 py-2">Description (depuis Paramètres)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.likelihoodScores.sort((a,b) => b.score - a.score).map(level => (
                                    <tr key={level.level} className={`border-b border-gray-700 ${ratingColors[level.score]} text-white`}>
                                        <td className="px-4 py-2 font-bold flex items-center">
                                           <span className={`w-3 h-3 rounded-full mr-2 border border-black ${ratingColors[level.score]}`}></span>
                                            {level.level} ({level.score})
                                        </td>
                                        <td className="px-4 py-2 text-xs italic">{level.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            
            <Card className="p-0">
                <h3 className="text-lg font-bold text-white p-4">Établir le "Désastre Nucléaire IA" de l'Organisation</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-2">Scénario</th>
                                <th scope="col" className="px-4 py-2">Impact Catastrophique (note)</th>
                                <th scope="col" className="px-4 py-2 w-1/2">Scénario IA</th>
                                <th scope="col" className="px-4 py-2">Seuil Bas</th>
                                <th scope="col" className="px-4 py-2">Seuil Haut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nuclearScenarios.map((sc, index) => (
                                <tr key={sc.id} className="border-b border-gray-700 bg-red-900/50">
                                    <td className="px-4 py-2 font-bold text-white">Scénario {index + 1}</td>
                                    <td className="px-4 py-2 text-center font-bold text-white">{sc.impactRating}</td>
                                    <td className="px-4 py-2">
                                        <textarea 
                                            value={sc.scenarioDescription}
                                            onChange={e => updateNuclearScenario(sc.id, { scenarioDescription: e.target.value })}
                                            className="w-full bg-gray-800/50 p-1 rounded-md border-gray-500 border focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition text-white"
                                            rows={2}
                                            placeholder="Décrivez un scénario d'échec catastrophique..."
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            value={formatCurrency(sc.lowRange)}
                                            onChange={e => updateNuclearScenario(sc.id, { lowRange: e.target.value.replace(/[^0-9,]/g, '') })}
                                            className="w-full bg-gray-800/50 p-1 rounded-md border-gray-500 border focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition text-white"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                         <input 
                                            type="text"
                                            value={formatCurrency(sc.highRange)}
                                            onChange={e => updateNuclearScenario(sc.id, { highRange: e.target.value.replace(/[^0-9,]/g, '') })}
                                            className="w-full bg-gray-800/50 p-1 rounded-md border-gray-500 border focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition text-white"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AttackSurfaceAnalysisView;