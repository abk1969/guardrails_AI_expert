import React, { useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useRedTeamResults } from '../contexts/RedTeamResultsContext';
import { useNavigation } from '../contexts/NavigationContext';
import { RedTeamResult, CompassRating, MitigationMapping, StrategyRoadmapItem, RoadmapStatus } from '../types';
import { VULNERABILITY_REFERENCES, BUG_CROWD_SCORES, COMPASS_SCORES, CVSS_CALCULATOR_LINK } from '../constants';
import { PlusCircle, Trash2, Link as LinkIcon, HelpCircle, ArrowLeft, Compass, X } from 'lucide-react';
import Tooltip from './ui/Tooltip';

const getRatingFromScore = (score: number | ''): { rating: CompassRating | ''; color: string } => {
    if (score === '') return { rating: '', color: 'bg-gray-700' };
    const scoreNum = Number(score);
    if (scoreNum >= 5) return { rating: COMPASS_SCORES[0].rating, color: COMPASS_SCORES[0].color };
    if (scoreNum === 4) return { rating: COMPASS_SCORES[1].rating, color: COMPASS_SCORES[1].color };
    if (scoreNum === 3) return { rating: COMPASS_SCORES[2].rating, color: COMPASS_SCORES[2].color };
    if (scoreNum === 2) return { rating: COMPASS_SCORES[3].rating, color: COMPASS_SCORES[3].color };
    if (scoreNum >= 1) return { rating: COMPASS_SCORES[4].rating, color: COMPASS_SCORES[4].color };
    return { rating: 'None', color: COMPASS_SCORES[4].color };
};

const ResultRow: React.FC<{ result: RedTeamResult; isHighlighted?: boolean }> = ({ result, isHighlighted = false }) => {
    const { updateResult, deleteResult } = useRedTeamResults();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let updatedValue: string | number = value;

        const updates: Partial<RedTeamResult> = { [name]: updatedValue };

        if (name === 'score') {
            const scoreNum = value === '' ? '' : parseInt(value, 10);
            if (scoreNum === '' || (!isNaN(scoreNum) && scoreNum >= 1 && scoreNum <= 5)) {
                 updates.score = scoreNum;
                 updates.rating = getRatingFromScore(scoreNum).rating;
            } else {
                return; // Do not update if score is invalid
            }
        }
        updateResult(result.id, updates);
    };

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
            deleteResult(result.id);
        }
    };

    const ratingInfo = getRatingFromScore(result.score);

    return (
        <tr className={`border-b border-gray-700 hover:bg-gray-800/50 align-top transition-all ${
            isHighlighted
                ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-l-cyan-400 ring-2 ring-cyan-500/30'
                : ''
        }`}>
            <td className="px-2 py-1"><textarea name="name" value={result.name} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1"><textarea name="description" value={result.description} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1"><textarea name="vulnerability" value={result.vulnerability} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1"><input type="number" name="score" value={result.score} onChange={handleChange} min="1" max="5" className="w-16 bg-gray-700/50 p-1 rounded-md text-center focus:bg-gray-700"/></td>
            <td className="px-2 py-1 text-center font-bold">
                 <div className={`p-2 rounded-md ${ratingInfo.color} ${ratingInfo.rating === 'Medium' ? 'text-black' : 'text-white'}`}>
                    {ratingInfo.rating}
                </div>
            </td>
            <td className="px-2 py-1"><textarea name="impact" value={result.impact} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1 text-center">
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer la ligne"><Trash2 size={16} /></button>
            </td>
        </tr>
    );
};

const MitigationMappingRow: React.FC<{ mapping: MitigationMapping }> = ({ mapping }) => {
    const { updateMitigationMapping, deleteMitigationMapping } = useRedTeamResults();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateMitigationMapping(mapping.id, { [e.target.name]: e.target.value });
    };

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne de mitigation ?")) {
            deleteMitigationMapping(mapping.id);
        }
    };

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50 align-top">
            <td className="px-1 py-1"><textarea name="threatVulnerability" value={mapping.threatVulnerability} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-1 py-1"><textarea name="description" value={mapping.description} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-1 py-1"><input type="text" name="score" value={mapping.score} onChange={handleChange} className="w-16 bg-gray-700/50 p-1 rounded-md text-center focus:bg-gray-700"/></td>
            <td className="px-1 py-1"><textarea name="defenseMitigation" value={mapping.defenseMitigation} onChange={handleChange} rows={2} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-1 py-1"><input type="text" name="residualScore" value={mapping.residualScore} onChange={handleChange} className="w-24 bg-gray-700/50 p-1 rounded-md text-center focus:bg-gray-700"/></td>
            <td className="px-1 py-1 text-center">
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer la ligne"><Trash2 size={16} /></button>
            </td>
        </tr>
    );
};

const statusColors: Record<RoadmapStatus, string> = {
    'Not Started': 'bg-gray-500/30 text-gray-200',
    'In Progress': 'bg-blue-500/30 text-blue-200',
    'Completed': 'bg-green-500/30 text-green-200',
    '': 'bg-gray-700/50',
};

const StrategyRow: React.FC<{ item: StrategyRoadmapItem }> = ({ item }) => {
    const { updateStrategyItem, deleteStrategyItem } = useRedTeamResults();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateStrategyItem(item.id, { [e.target.name]: e.target.value });
    };

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette action ?")) {
            deleteStrategyItem(item.id);
        }
    };
    
    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50 align-top">
            <td className="px-2 py-1"><textarea name="action" value={item.action} onChange={handleChange} rows={3} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700 text-white"/></td>
            <td className="px-2 py-1"><textarea name="owners" value={item.owners} onChange={handleChange} rows={3} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1"><textarea name="strategy" value={item.strategy} onChange={handleChange} rows={3} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1"><textarea name="timeline" value={item.timeline} onChange={handleChange} rows={3} className="w-full bg-gray-700/50 p-1 rounded-md focus:bg-gray-700"/></td>
            <td className="px-2 py-1">
                <select name="status" value={item.status} onChange={handleChange} className={`w-full p-2 rounded-md font-semibold text-xs border border-gray-600 focus:ring-1 focus:ring-cyan-500 transition ${statusColors[item.status]}`}>
                    <option value="" className="bg-gray-800">Choisir...</option>
                    <option value="Not Started" className="bg-gray-800">Non commencé</option>
                    <option value="In Progress" className="bg-gray-800">En cours</option>
                    <option value="Completed" className="bg-gray-800">Terminé</option>
                </select>
            </td>
            <td className="px-2 py-1 text-center">
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer l'action"><Trash2 size={16} /></button>
            </td>
        </tr>
    );
};

const RedTeamResultsView: React.FC = () => {
    const { results, addResult, mitigationProfiles, mitigationMappings, addMitigationMapping, strategyRoadmap, addStrategyItem } = useRedTeamResults();
    const { navigationSource, sourceTitle, filterParams, clearNavigation } = useNavigation();

    const groupedStrategyItems = useMemo(() => {
        return strategyRoadmap.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<string, StrategyRoadmapItem[]>);
    }, [strategyRoadmap]);

    const strategyCategoryOrder = [
        "Enforce Security Controls and Policies",
        "Integrate Monitoring & Logging",
        "Apply Mitigations and Patches",
        "Training and Awareness",
        "Continuous Testing",
        "Feedback Loop"
    ];

    const sortedStrategyKeys = Object.keys(groupedStrategyItems).sort((a, b) => {
        const indexA = strategyCategoryOrder.indexOf(a);
        const indexB = strategyCategoryOrder.indexOf(b);
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
                        {filterParams.highlightIds.length} résultat(s) Red Team lié(s)
                    </div>
                </Card>
            )}
            <header>
                <h2 className="text-2xl font-bold text-white">3e Orient: AI Red Team Results : AI Vulnerability Severity & Scoring</h2>
                <p className="text-gray-400 mt-1">
                    Utilisez cet onglet pour noter les problèmes découverts lors des tests Red Team. Ajoutez des lignes supplémentaires si nécessaire. La création d'une ligne unique pour chaque vulnérabilité découverte devrait simplifier le rapport final. La sévérité est notée de 5 (la plus sévère) à 1 (la moins sévère). Les scores CVSS V3 doivent également être convertis.
                </p>
            </header>

            <Card className="p-0">
                <h3 className="text-xl font-bold text-white p-4 bg-red-800/80 rounded-t-lg">Red Team Testing</h3>
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Vulnerability</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3 text-center">Rating</th>
                                <th className="px-4 py-3">Impact</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((res, index) => {
                                const isHighlighted = filterParams?.highlightIds?.includes(String(index)) || false;
                                return <ResultRow key={res.id} result={res} isHighlighted={isHighlighted} />;
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-2 bg-gray-800/50 rounded-b-lg">
                    <Button onClick={addResult} variant="secondary" className="text-xs py-1 px-2">
                        <PlusCircle size={14} className="mr-2" />
                        Ajouter une ligne
                    </Button>
                </div>
            </Card>

            <Card>
                <h3 className="font-semibold text-white">CVSS V3 Calculator Link</h3>
                <a href={CVSS_CALCULATOR_LINK} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    {CVSS_CALCULATOR_LINK}
                </a>
            </Card>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="p-0">
                    <h3 className="text-lg font-bold text-white p-4 bg-gray-700/50 rounded-t-lg">Vulnerabilities</h3>
                     <div className="overflow-auto max-h-96">
                        <table className="w-full text-xs text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-700/60 sticky top-0">
                                <tr>
                                    <th className="px-2 py-2">Severity</th>
                                    <th className="px-2 py-2">Vulnerability</th>
                                    <th className="px-2 py-2">Details</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-700">
                                {VULNERABILITY_REFERENCES.map((vuln, i) => (
                                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-800/50' : 'bg-transparent'}`}>
                                        <td className="px-2 py-1 text-center">{vuln.severity}</td>
                                        <td className={`px-2 py-1 ${[ 'LLM01 Prompt Injection', 'LLM02 Sensitive Information Disclosure', 'LLM03 Supply Chain', 'LLM04 Data Model Poisoning', 'LLM05 Improper Output Handling'].includes(vuln.vulnerability) ? 'bg-blue-900/40 text-blue-200' : ''}`}>
                                            {vuln.vulnerability}
                                        </td>
                                        <td className="px-2 py-1">
                                            {vuln.details}
                                            {vuln.link && <a href={vuln.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-2"><LinkIcon size={12} className="inline"/></a>}
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                </Card>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="p-0">
                             <h3 className="text-lg font-bold text-white p-4 bg-orange-600/80 rounded-t-lg">BugCrowd Scoring</h3>
                             <table className="w-full text-sm text-center text-gray-200">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                                    <tr>
                                        <th className="px-4 py-2">Score</th>
                                        <th className="px-4 py-2">CVSS v3 Score</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800">
                                    {BUG_CROWD_SCORES.map(s => (
                                        <tr key={s.score} className="border-b border-gray-700">
                                            <td className="px-4 py-1">{s.score}</td>
                                            <td className="px-4 py-1">{s.cvssV3Score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </Card>
                         <Card className="p-0">
                             <h3 className="text-lg font-bold text-white p-4 bg-gray-700/50 rounded-t-lg">COMPASS Score</h3>
                              <table className="w-full text-sm text-center text-white">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                                    <tr>
                                        <th className="px-2 py-2">Score</th>
                                        <th className="px-2 py-2">Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {COMPASS_SCORES.map(s => (
                                        <tr key={s.score} className={`border-b border-gray-700 font-bold ${s.color} ${s.rating === 'Medium' ? 'text-black' : 'text-white'}`}>
                                            <td className="px-2 py-1">{s.score}</td>
                                            <td className="px-2 py-1">{s.rating}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </Card>
                    </div>
                    <Card className="p-0">
                         <h3 className="text-lg font-bold text-white p-4 bg-gray-700/50 rounded-t-lg">COMPASS Description</h3>
                         <div className="bg-gray-800 rounded-b-lg">
                            {COMPASS_SCORES.map(s => (
                                <div key={s.score} className={`p-2 border-b border-gray-700 flex items-center font-bold text-xs ${s.color} ${s.rating === 'Medium' ? 'text-black' : 'text-white'}`}>
                                    <span className="w-20">{s.rating}:</span>
                                    <span>{s.description}</span>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>
            </div>

            {/* --- SECTION DE MITIGATION --- */}
            <div className="space-y-8 mt-12 pt-8 border-t-2 border-cyan-500/30">
                <header>
                    <h2 className="text-2xl font-bold text-white">4 Decide: Red Team or Vuln vs Mitigations</h2>
                    <p className="text-gray-400 mt-1">
                        Utilisez cette section pour cartographier les vulnérabilités à des défenses et des mesures de mitigation. Utilisez les onglets de référence (6 Référence : Matrice de Sécurité IA et 6a Référence : Défenses & Mitigations) pour déterminer les mesures de mitigation appropriées pour l'objectif.
                    </p>
                </header>
                
                <Card className="bg-gray-800 border-cyan-500/30">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Comment utiliser cette section :</h3>
                    <ol className="list-decimal list-inside text-gray-300 space-y-1 text-sm">
                        <li>**Étape 1 (Observer/Orienter) :** Documentez les vulnérabilités découvertes dans le tableau "Red Team Testing" ci-dessus.</li>
                        <li>**Étape 2 (Décider) :** Pour chaque profil de menace pertinent ci-dessous, cartographiez ces vulnérabilités, décrivez les défenses planifiées ou existantes.</li>
                        <li>**Étape 3 (Agir) :** Évaluez le "Score Résiduel" pour quantifier le risque restant APRÈS mitigation. Cela vous aidera à prioriser les efforts de remédiation.</li>
                    </ol>
                </Card>

                {mitigationProfiles.map(profile => (
                    <Card key={profile.id} className="p-0">
                        <h3 className={`text-xl font-bold text-white p-4 ${profile.color} rounded-t-lg`}>{profile.title}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-700/60">
                                    <tr>
                                        <th className="px-2 py-3 w-[20%]">Threat / Vulnerability</th>
                                        <th className="px-2 py-3 w-[25%]">Description</th>
                                        <th className="px-2 py-3 w-[10%]">Score</th>
                                        <th className="px-2 py-3 w-[25%]">Defense / mitigation</th>
                                        <th className="px-2 py-3 w-[15%]">
                                            <div className="flex items-center">
                                                Residual Score
                                                <Tooltip content="Le niveau de risque restant APRÈS l'application de la défense/mitigation.">
                                                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                                                </Tooltip>
                                            </div>
                                        </th>
                                        <th className="px-2 py-3 w-[5%] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mitigationMappings
                                        .filter(m => m.profileId === profile.id)
                                        .map(mapping => <MitigationMappingRow key={mapping.id} mapping={mapping} />)
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="p-2 bg-gray-800/50 rounded-b-lg">
                            <Button onClick={() => addMitigationMapping(profile.id)} variant="secondary" className="text-xs py-1 px-2">
                                <PlusCircle size={14} className="mr-2" />
                                Ajouter une ligne
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- NOUVELLE SECTION STRATEGY & ROADMAP --- */}
            <div className="space-y-8 mt-12 pt-8 border-t-2 border-cyan-500/30">
                <header>
                    <h2 className="text-2xl font-bold text-white">5 Act: Strategy & Roadmap</h2>
                    <p className="text-gray-400 mt-1">
                        Utilisez cet onglet pour documenter les défenses et la stratégie de mitigation de l'Objectif, les propriétaires et la chronologie.
                    </p>
                </header>

                 <Card className="bg-gray-800 border-cyan-500/30">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Finaliser votre plan d'action :</h3>
                    <ol className="list-decimal list-inside text-gray-300 space-y-1 text-sm">
                        <li>**Étape 1 (Observer/Décider) :** Vous avez identifié, noté et cartographié les vulnérabilités dans les sections précédentes.</li>
                        <li>**Étape 2 (Agir) :** Utilisez le tableau ci-dessous pour transformer votre analyse en une feuille de route concrète. Pour chaque action, assignez un propriétaire, décrivez la stratégie et définissez une échéance.</li>
                        <li>**Étape 3 (Suivre) :** Mettez à jour le statut de chaque action pour suivre la progression de votre plan de mitigation.</li>
                    </ol>
                </Card>

                <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700/60 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 w-[30%]">Action / Control</th>
                                    <th className="px-4 py-3 w-[15%]">Owner(s)</th>
                                    <th className="px-4 py-3 w-[25%]">Strategy</th>
                                    <th className="px-4 py-3 w-[15%]">Timeline</th>
                                    <th className="px-4 py-3 w-[10%]">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            {sortedStrategyKeys.map(categoryName => (
                                <tbody key={categoryName}>
                                    <tr className="bg-gray-700">
                                        <td colSpan={6} className="px-4 py-2 text-white font-bold">
                                            {categoryName}
                                        </td>
                                    </tr>
                                    {groupedStrategyItems[categoryName].map(item => <StrategyRow key={item.id} item={item} />)}
                                    <tr>
                                        <td colSpan={6} className="px-4 py-2">
                                            <Button onClick={() => addStrategyItem(categoryName)} variant="secondary" className="text-xs py-1 px-2">
                                                <PlusCircle size={14} className="mr-2" />
                                                Ajouter une action
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RedTeamResultsView;