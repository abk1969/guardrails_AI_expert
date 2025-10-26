import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import Card from './ui/Card';
import { useTestRun } from '../contexts/TestRunContext';
import { GuardrailCategory, PromptComplexity, TestResult, TestStatus } from '../types';
import { GUARDRAIL_CATEGORIES } from '../constants';
import { ArrowUp, ArrowDown, AlertTriangle, TrendingDown, ChevronsRight } from 'lucide-react';
import ResultDetailModal from './ResultDetailModal';

const renderScoreTrend = (change: number) => {
    if (change === 0) return <span className="text-gray-400">--</span>;
    const isUp = change > 0;
    return (
        <span className={`flex items-center text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
            {Math.abs(change).toFixed(1)}%
        </span>
    );
};

const Analytics: React.FC = () => {
    const { historicalRuns } = useTestRun();
    const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

    const analyticsData = useMemo(() => {
        if (!historicalRuns || historicalRuns.length === 0) return null;

        const latestRun = historicalRuns[historicalRuns.length - 1];
        const previousRun = historicalRuns.length > 1 ? historicalRuns[historicalRuns.length - 2] : null;

        const latestResults = latestRun.results;
        const total = latestResults.length;
        const failedCount = latestResults.filter(r => r.status === TestStatus.FAILED).length;
        const overallScore = total > 0 ? Math.round(latestResults.reduce((acc, r) => acc + r.score, 0) / total) : 0;
        
        const previousScore = previousRun && previousRun.results.length > 0
            ? Math.round(previousRun.results.reduce((acc, r) => acc + r.score, 0) / previousRun.results.length)
            : null;
        
        const scoreChange = previousScore !== null ? overallScore - previousScore : 0;

        const failureRate = total > 0 ? (failedCount / total) * 100 : 0;
        const previousFailureRate = previousRun && previousRun.results.length > 0
            ? (previousRun.results.filter(r => r.status === TestStatus.FAILED).length / previousRun.results.length) * 100
            : null;
        const failureRateChange = previousFailureRate !== null ? failureRate - previousFailureRate : 0;

        const failuresByCategory = latestResults
            .filter(r => r.status === TestStatus.FAILED)
            .reduce((acc, r) => {
                acc[r.prompt.category] = (acc[r.prompt.category] || 0) + 1;
                return acc;
            }, {} as Record<GuardrailCategory, number>);
        
        const topFailingCategory = Object.keys(failuresByCategory).length > 0
            ? Object.entries(failuresByCategory).sort((a, b) => b[1] - a[1])[0][0]
            : 'Aucune';

        const historicalChartData = historicalRuns.map(run => {
            const score = run.results.length > 0 ? Math.round(run.results.reduce((acc, r) => acc + r.score, 0) / run.results.length) : 0;
            return {
                date: new Date(run.date).toLocaleDateString(),
                "Score Global": score,
            };
        });
        
        const categoryPerformanceData = GUARDRAIL_CATEGORIES.map(cat => {
            const allCategoryResults = historicalRuns.flatMap(run => run.results.filter(r => r.prompt.category === cat.name));
            const avgScore = allCategoryResults.length > 0
                ? Math.round(allCategoryResults.reduce((acc, r) => acc + r.score, 0) / allCategoryResults.length)
                : 0;
            return {
                category: cat.name.replace(/ et | /g, ' & '), // Shorten labels for chart
                score: avgScore,
                fullMark: 100,
            };
        });

        const complexityData = Object.values(PromptComplexity).map(complexity => {
            const allComplexityResults = historicalRuns.flatMap(run => run.results.filter(r => r.prompt.complexity === complexity));
            const failed = allComplexityResults.filter(r => r.status === TestStatus.FAILED).length;
            const total = allComplexityResults.length;
            return {
                name: complexity,
                "Taux d'échec": total > 0 ? (failed / total) * 100 : 0,
            };
        });

        const topFailedPrompts = historicalRuns
            .flatMap(run => run.results)
            .filter(r => r.status === TestStatus.FAILED)
            .sort((a, b) => a.score - b.score)
            .slice(0, 5);

        return {
            overallScore,
            scoreChange,
            failureRate,
            failureRateChange,
            topFailingCategory,
            historicalChartData,
            categoryPerformanceData,
            complexityData,
            topFailedPrompts
        };

    }, [historicalRuns]);

    if (!analyticsData) {
        return (
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Bienvenue sur le Tableau de Bord d'Analyse</h2>
                <p className="text-gray-400 mb-6">Aucune donnée de test n'a encore été enregistrée. Lancez votre premier test depuis le 'Tableau de bord' pour commencer à collecter des données et visualiser les performances de vos guardrails.</p>
                <div className="bg-gray-700/50 p-4 rounded-lg inline-block">
                    <p className="text-cyan-300">Tableau de bord <ChevronsRight className="inline" size={16} /> Lancer le Test <ChevronsRight className="inline" size={16} /> Revenir ici</p>
                </div>
            </Card>
        );
    }
    
    const RADAR_COLORS = ['#22d3ee'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Score de Conformité Global</h3>
                    <div className="flex items-baseline justify-between">
                         <p className="text-4xl font-bold text-white">{analyticsData.overallScore}%</p>
                         {renderScoreTrend(analyticsData.scoreChange)}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Score du dernier test</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Taux d'Échec</h3>
                    <div className="flex items-baseline justify-between">
                         <p className="text-4xl font-bold text-white">{analyticsData.failureRate.toFixed(1)}%</p>
                         {renderScoreTrend(analyticsData.failureRateChange * -1)}
                    </div>
                     <p className="text-sm text-gray-400 mt-1">Échecs du dernier test</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Principale Vulnérabilité</h3>
                    <div className="flex items-center">
                         <TrendingDown size={36} className="text-red-500 mr-4" />
                         <p className="text-xl font-bold text-red-400 truncate">{analyticsData.topFailingCategory}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Catégorie avec le plus d'échecs (dernier test)</p>
                </Card>
            </div>

            <Card>
                <h3 className="text-xl font-bold text-white mb-6">Évolution du Score de Conformité</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.historicalChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Score Global" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">Performance par Catégorie (moyenne)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData.categoryPerformanceData}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }}/>
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                             <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                             <Radar name="Score" dataKey="score" stroke={RADAR_COLORS[0]} fill={RADAR_COLORS[0]} fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">Taux d'Échec par Complexité (moyenne)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.complexityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis dataKey="name" stroke="#9ca3af" />
                           <YAxis stroke="#9ca3af" domain={[0, 100]} unit="%" />
                           <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}/>
                           <Bar dataKey="Taux d'échec" barSize={40}>
                                {analyticsData.complexityData.map((entry, index) => {
                                    const colors: Record<PromptComplexity, string> = {
                                        [PromptComplexity.SIMPLE]: '#3b82f6', // blue
                                        [PromptComplexity.MOYEN]: '#f97316', // orange
                                        [PromptComplexity.SOPHISTIQUE]: '#ef4444', // red
                                    };
                                    return <Cell key={`cell-${index}`} fill={colors[entry.name as PromptComplexity]} />;
                                })}
                           </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center"><AlertTriangle className="text-yellow-400 mr-3" />Rapport d'Incidents : Top 5 des Échecs Critiques</h3>
                <div className="space-y-3">
                    {analyticsData.topFailedPrompts.length > 0 ? analyticsData.topFailedPrompts.map(result => (
                        <div key={result.prompt.id} className="bg-gray-700 p-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer flex items-center justify-between" onClick={() => setSelectedResult(result)}>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-mono text-sm text-gray-300 truncate">{result.prompt.text}</p>
                                <p className="text-xs text-gray-400">{result.prompt.category}</p>
                            </div>
                            <div className="ml-4 flex items-center space-x-4">
                               <span className="text-xs text-gray-400">{new Date(result.evaluationChain[0].timestamp).toLocaleDateString()}</span>
                                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full bg-red-600`}>
                                    Score: {result.score}
                                </span>
                            </div>
                        </div>
                    )) : (
                         <p className="text-gray-400 text-center py-4">Félicitations ! Aucun échec critique n'a été enregistré dans les tests récents.</p>
                    )}
                </div>
            </Card>

            {selectedResult && (
                <ResultDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
            )}
        </div>
    );
};

export default Analytics;