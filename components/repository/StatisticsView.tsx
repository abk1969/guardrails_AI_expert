import React, { useState } from 'react';
import Card from '../ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import InteractiveBarChart from './InteractiveBarChart';
import InteractivePieChart from './InteractivePieChart';
import InteractiveHeatmap from './InteractiveHeatmap';
import { FileText, Globe, Mail, BarChart3, Info, TrendingUp, Activity } from 'lucide-react';

interface StatisticsViewProps {
    sheetId: 'causal-stats' | 'domain-stats' | 'comparison';
}

const CausalStatisticsView: React.FC = () => {
    const { t, language } = useLanguage();
    const { statistics, setFilters, setSearchQuery } = useAIRiskRepository();
    const [activeView, setActiveView] = useState<'overview' | 'entity' | 'intent' | 'timing' | 'heatmap'>('overview');

    // Navigate to database with filter
    const navigateToDatabase = (filters: any) => {
        // First clear search query
        setSearchQuery('');
        // Then apply new filters
        setFilters(filters);
        // Navigate to database tab
        setTimeout(() => {
            const databaseTab = document.querySelector('[data-tab="database"]') as HTMLElement;
            if (databaseTab) {
                databaseTab.click();
            }
        }, 100);
    };

    // Prepare data for visualizations
    const entityData = [
        {
            label: 'AI',
            value: statistics.byEntity['IA'] || 0,
            percentage: '41%',
            color: 'bg-cyan-600'
        },
        {
            label: 'Human',
            value: statistics.byEntity['Humain'] || 0,
            percentage: '39%',
            color: 'bg-purple-600'
        },
        {
            label: 'Other',
            value: statistics.byEntity['Autre'] || 0,
            percentage: '20%',
            color: 'bg-gray-600'
        }
    ];

    const intentData = [
        {
            label: 'Unintentional',
            value: statistics.byIntentionality['Non intentionnel'] || 0,
            percentage: '35%',
            color: 'bg-yellow-600'
        },
        {
            label: 'Intentional',
            value: statistics.byIntentionality['Intentionnel'] || 0,
            percentage: '34%',
            color: 'bg-red-600'
        },
        {
            label: 'Other',
            value: statistics.byIntentionality['Autre'] || 0,
            percentage: '31%',
            color: 'bg-gray-600'
        }
    ];

    const timingData = [
        {
            label: 'Post-deployment',
            value: statistics.byTiming['Post-déploiement'] || 0,
            percentage: '62%',
            color: 'bg-green-600'
        },
        {
            label: 'Other',
            value: statistics.byTiming['Autre'] || 0,
            percentage: '25%',
            color: 'bg-gray-600'
        },
        {
            label: 'Pre-deployment',
            value: statistics.byTiming['Pré-déploiement'] || 0,
            percentage: '13%',
            color: 'bg-blue-600'
        }
    ];

    // Heatmap data
    const heatmapData = [
        // Pre-deployment
        { timing: 'Pre-deployment', entity: 'Human', intent: 'Intentional', value: 2, percentage: '2%' },
        { timing: 'Pre-deployment', entity: 'Human', intent: 'Unintentional', value: 4, percentage: '4%' },
        { timing: 'Pre-deployment', entity: 'Human', intent: 'Other', value: 1, percentage: '1%' },
        { timing: 'Pre-deployment', entity: 'AI', intent: 'Intentional', value: 1, percentage: '1%' },
        { timing: 'Pre-deployment', entity: 'AI', intent: 'Unintentional', value: 2, percentage: '2%' },
        { timing: 'Pre-deployment', entity: 'AI', intent: 'Other', value: 1, percentage: '1%' },
        { timing: 'Pre-deployment', entity: 'Other', intent: 'Intentional', value: 0, percentage: '-' },
        { timing: 'Pre-deployment', entity: 'Other', intent: 'Unintentional', value: 1, percentage: '1%' },
        { timing: 'Pre-deployment', entity: 'Other', intent: 'Other', value: 1, percentage: '1%' },
        // Post-deployment
        { timing: 'Post-deployment', entity: 'Human', intent: 'Intentional', value: 18, percentage: '18%' },
        { timing: 'Post-deployment', entity: 'Human', intent: 'Unintentional', value: 5, percentage: '5%' },
        { timing: 'Post-deployment', entity: 'Human', intent: 'Other', value: 3, percentage: '3%' },
        { timing: 'Post-deployment', entity: 'AI', intent: 'Intentional', value: 5, percentage: '5%' },
        { timing: 'Post-deployment', entity: 'AI', intent: 'Unintentional', value: 15, percentage: '15%' },
        { timing: 'Post-deployment', entity: 'AI', intent: 'Other', value: 9, percentage: '9%' },
        { timing: 'Post-deployment', entity: 'Other', intent: 'Intentional', value: 2, percentage: '2%' },
        { timing: 'Post-deployment', entity: 'Other', intent: 'Unintentional', value: 2, percentage: '2%' },
        { timing: 'Post-deployment', entity: 'Other', intent: 'Other', value: 4, percentage: '4%' },
        // Other timing
        { timing: 'Other', entity: 'Human', intent: 'Intentional', value: 3, percentage: '3%' },
        { timing: 'Other', entity: 'Human', intent: 'Unintentional', value: 2, percentage: '2%' },
        { timing: 'Other', entity: 'Human', intent: 'Other', value: 2, percentage: '2%' },
        { timing: 'Other', entity: 'AI', intent: 'Intentional', value: 3, percentage: '3%' },
        { timing: 'Other', entity: 'AI', intent: 'Unintentional', value: 4, percentage: '4%' },
        { timing: 'Other', entity: 'AI', intent: 'Other', value: 2, percentage: '2%' },
        { timing: 'Other', entity: 'Other', intent: 'Intentional', value: 0, percentage: '0%' },
        { timing: 'Other', entity: 'Other', intent: 'Unintentional', value: 2, percentage: '2%' },
        { timing: 'Other', entity: 'Other', intent: 'Other', value: 7, percentage: '7%' }
    ];

    const handleEntityClick = (label: string) => {
        const mapping: Record<string, string> = {
            'AI': 'IA',
            'Human': 'Humain',
            'Other': 'Autre'
        };
        console.log('🔍 Entity Filter Applied:', { entity: [mapping[label]] });
        navigateToDatabase({ entity: [mapping[label]] });
    };

    const handleIntentClick = (label: string) => {
        const mapping: Record<string, string> = {
            'Intentional': 'Intentionnel',
            'Unintentional': 'Non intentionnel',
            'Other': 'Autre'
        };
        console.log('🔍 Intentionality Filter Applied:', { intentionality: [mapping[label]] });
        navigateToDatabase({ intentionality: [mapping[label]] });
    };

    const handleTimingClick = (label: string) => {
        const mapping: Record<string, string> = {
            'Pre-deployment': 'Pré-déploiement',
            'Post-deployment': 'Post-déploiement',
            'Other': 'Autre'
        };
        console.log('🔍 Timing Filter Applied:', { timing: [mapping[label]] });
        navigateToDatabase({ timing: [mapping[label]] });
    };

    const handleHeatmapClick = (timing: string, entity: string, intent: string) => {
        const timingMapping: Record<string, string> = {
            'Pre-deployment': 'Pré-déploiement',
            'Post-deployment': 'Post-déploiement',
            'Other': 'Autre'
        };
        const entityMapping: Record<string, string> = {
            'Human': 'Humain',
            'AI': 'IA',
            'Other': 'Autre'
        };
        const intentMapping: Record<string, string> = {
            'Intentional': 'Intentionnel',
            'Unintentional': 'Non intentionnel',
            'Other': 'Autre'
        };

        const filters = {
            timing: [timingMapping[timing]],
            entity: [entityMapping[entity]],
            intentionality: [intentMapping[intent]]
        };
        console.log('🔍 Heatmap Cell Filter Applied:', filters);
        navigateToDatabase(filters);
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Activity size={28} className="text-cyan-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {language === 'fr' ? 'Statistiques Interactives - Taxonomie Causale' : 'Interactive Statistics - Causal Taxonomy'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {language === 'fr' ? 'Cliquez sur les graphiques pour filtrer la base de données' : 'Click on charts to filter the database'}
                        </p>
                    </div>
                </div>
                <TrendingUp size={32} className="text-cyan-500 animate-pulse" />
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                     onClick={() => navigateToDatabase({})}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Total Risks</span>
                        <BarChart3 className="text-cyan-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">1,250</div>
                    <div className="text-xs text-cyan-400 mt-1">Click to view all →</div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                     onClick={handleEntityClick.bind(null, 'AI')}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">AI-Caused</span>
                        <Activity className="text-purple-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{entityData[0].value}</div>
                    <div className="text-xs text-purple-400 mt-1">41% - Click to filter →</div>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                     onClick={handleTimingClick.bind(null, 'Post-deployment')}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Post-Deployment</span>
                        <TrendingUp className="text-green-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{timingData[0].value}</div>
                    <div className="text-xs text-green-400 mt-1">62% - Click to filter →</div>
                </div>
            </div>

            {/* View Selector */}
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-800 rounded-lg">
                {[
                    { id: 'overview', label: language === 'fr' ? 'Vue d\'ensemble' : 'Overview', icon: <BarChart3 size={16} /> },
                    { id: 'entity', label: language === 'fr' ? 'Par Entité' : 'By Entity', icon: <Activity size={16} /> },
                    { id: 'intent', label: language === 'fr' ? 'Par Intention' : 'By Intent', icon: <TrendingUp size={16} /> },
                    { id: 'timing', label: language === 'fr' ? 'Par Temporalité' : 'By Timing', icon: <Info size={16} /> },
                    { id: 'heatmap', label: 'Heatmap', icon: <BarChart3 size={16} /> }
                ].map(view => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                            activeView === view.id
                                ? 'bg-cyan-600 text-white shadow-lg scale-105'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {view.icon}
                        {view.label}
                    </button>
                ))}
            </div>

            {/* Interactive Visualizations */}
            <div className="space-y-8">
                {activeView === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <InteractivePieChart
                            data={entityData}
                            title={language === 'fr' ? 'Distribution par Entité' : 'Distribution by Entity'}
                            onSliceClick={handleEntityClick}
                        />
                        <InteractivePieChart
                            data={intentData}
                            title={language === 'fr' ? 'Distribution par Intentionnalité' : 'Distribution by Intentionality'}
                            onSliceClick={handleIntentClick}
                        />
                        <div className="lg:col-span-2">
                            <InteractiveBarChart
                                data={timingData}
                                title={language === 'fr' ? 'Distribution par Temporalité' : 'Distribution by Timing'}
                                onBarClick={handleTimingClick}
                            />
                        </div>
                    </div>
                )}

                {activeView === 'entity' && (
                    <div className="space-y-6">
                        <InteractivePieChart
                            data={entityData}
                            title={language === 'fr' ? 'Distribution par Entité Causale' : 'Distribution by Causal Entity'}
                            onSliceClick={handleEntityClick}
                        />
                        <InteractiveBarChart
                            data={entityData}
                            title={language === 'fr' ? 'Analyse Détaillée par Entité' : 'Detailed Analysis by Entity'}
                            onBarClick={handleEntityClick}
                        />
                    </div>
                )}

                {activeView === 'intent' && (
                    <div className="space-y-6">
                        <InteractivePieChart
                            data={intentData}
                            title={language === 'fr' ? 'Distribution par Intentionnalité' : 'Distribution by Intentionality'}
                            onSliceClick={handleIntentClick}
                        />
                        <InteractiveBarChart
                            data={intentData}
                            title={language === 'fr' ? 'Analyse Détaillée par Intentionnalité' : 'Detailed Analysis by Intentionality'}
                            onBarClick={handleIntentClick}
                        />
                    </div>
                )}

                {activeView === 'timing' && (
                    <div className="space-y-6">
                        <InteractivePieChart
                            data={timingData}
                            title={language === 'fr' ? 'Distribution par Temporalité' : 'Distribution by Timing'}
                            onSliceClick={handleTimingClick}
                        />
                        <InteractiveBarChart
                            data={timingData}
                            title={language === 'fr' ? 'Analyse Détaillée par Temporalité' : 'Detailed Analysis by Timing'}
                            onBarClick={handleTimingClick}
                        />
                    </div>
                )}

                {activeView === 'heatmap' && (
                    <InteractiveHeatmap
                        data={heatmapData}
                        onCellClick={handleHeatmapClick}
                    />
                )}

                {/* Table 1 - Reference Data (Clickable) */}
                <section>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {language === 'fr' ? 'Tableau 1. La proportion de risques dans la base de données par entité, intention et temporalité' : 'Table 1. The proportion of risks in the AI risk database by entity, intent and timing'}
                        <span className="ml-3 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">EN</span>
                        <span className="ml-2 text-xs text-gray-400">(Click rows to filter database)</span>
                    </h3>
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-cyan-400 font-semibold">Category</th>
                                    <th className="text-left p-4 text-cyan-400 font-semibold">Level</th>
                                    <th className="text-left p-4 text-cyan-400 font-semibold">Description</th>
                                    <th className="text-left p-4 text-cyan-400 font-semibold">Proportion of risks</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                {/* Entity */}
                                <tr className="border-b border-gray-800 bg-cyan-900/10 hover:bg-cyan-900/30 cursor-pointer transition-colors" onClick={() => handleEntityClick('Human')}>
                                    <td className="p-4 font-semibold text-cyan-300" rowSpan={3}>Entity</td>
                                    <td className="p-4">Human</td>
                                    <td className="p-4">The risk is caused by a decision or action made by humans</td>
                                    <td className="p-4 font-bold text-cyan-400 hover:scale-110 transition-transform">39%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-cyan-900/10 hover:bg-cyan-900/30 cursor-pointer transition-colors" onClick={() => handleEntityClick('AI')}>
                                    <td className="p-4">AI</td>
                                    <td className="p-4">The risk is caused by a decision or action made by an AI system</td>
                                    <td className="p-4 font-bold text-cyan-400 hover:scale-110 transition-transform">41%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-cyan-900/10 hover:bg-cyan-900/30 cursor-pointer transition-colors" onClick={() => handleEntityClick('Other')}>
                                    <td className="p-4">Other</td>
                                    <td className="p-4">The risk is caused by some other reason or is ambiguous</td>
                                    <td className="p-4 font-bold text-cyan-400 hover:scale-110 transition-transform">20%</td>
                                </tr>

                                {/* Intent */}
                                <tr className="border-b border-gray-800 bg-purple-900/10 hover:bg-purple-900/30 cursor-pointer transition-colors" onClick={() => handleIntentClick('Intentional')}>
                                    <td className="p-4 font-semibold text-purple-300" rowSpan={3}>Intent</td>
                                    <td className="p-4">Intentional</td>
                                    <td className="p-4">The risk occurs due to an expected outcome from pursuing a goal</td>
                                    <td className="p-4 font-bold text-purple-400 hover:scale-110 transition-transform">34%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-purple-900/10 hover:bg-purple-900/30 cursor-pointer transition-colors" onClick={() => handleIntentClick('Unintentional')}>
                                    <td className="p-4">Unintentional</td>
                                    <td className="p-4">The risk occurs due to an unexpected outcome from pursuing a goal</td>
                                    <td className="p-4 font-bold text-purple-400 hover:scale-110 transition-transform">35%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-purple-900/10 hover:bg-purple-900/30 cursor-pointer transition-colors" onClick={() => handleIntentClick('Other')}>
                                    <td className="p-4">Other</td>
                                    <td className="p-4">The risk is presented as occurring without clearly specifying the intentionality</td>
                                    <td className="p-4 font-bold text-purple-400 hover:scale-110 transition-transform">31%</td>
                                </tr>

                                {/* Timing */}
                                <tr className="border-b border-gray-800 bg-yellow-900/10 hover:bg-yellow-900/30 cursor-pointer transition-colors" onClick={() => handleTimingClick('Pre-deployment')}>
                                    <td className="p-4 font-semibold text-yellow-300" rowSpan={3}>Timing</td>
                                    <td className="p-4">Pre-deployment</td>
                                    <td className="p-4">The risk occurs before the AI is deployed</td>
                                    <td className="p-4 font-bold text-yellow-400 hover:scale-110 transition-transform">13%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-yellow-900/10 hover:bg-yellow-900/30 cursor-pointer transition-colors" onClick={() => handleTimingClick('Post-deployment')}>
                                    <td className="p-4">Post-deployment</td>
                                    <td className="p-4">The risk occurs after the AI model has been trained and deployed</td>
                                    <td className="p-4 font-bold text-yellow-400 hover:scale-110 transition-transform">62%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-yellow-900/10 hover:bg-yellow-900/30 cursor-pointer transition-colors" onClick={() => handleTimingClick('Other')}>
                                    <td className="p-4">Other</td>
                                    <td className="p-4">The risk is presented without a clearly specified time of occurrence</td>
                                    <td className="p-4 font-bold text-yellow-400 hover:scale-110 transition-transform">25%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Table 2 - Cross-category Analysis (Clickable) */}
                <section>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {language === 'fr' ? 'Tableau 2. Le chevauchement entre ces catégories' : 'Table 2. The overlap between these categories'}
                        <span className="ml-3 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">EN</span>
                        <span className="ml-2 text-xs text-gray-400">(Click cells to filter database)</span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        For instance, the percentage of all risks which were coded as human, intentional and post-deployment.
                    </p>
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-800">
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-3 text-cyan-400 font-semibold">Timing</th>
                                    <th className="text-left p-3 text-cyan-400 font-semibold">Entity</th>
                                    <th className="text-center p-3 text-purple-400 font-semibold" colSpan={3}>Intent</th>
                                </tr>
                                <tr className="border-b border-gray-700 bg-gray-800/50">
                                    <th className="p-3"></th>
                                    <th className="p-3"></th>
                                    <th className="text-center p-3 text-purple-300">Intentional</th>
                                    <th className="text-center p-3 text-purple-300">Unintentional</th>
                                    <th className="text-center p-3 text-purple-300">Other</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                {/* Pre-deployment */}
                                <tr className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3 font-semibold text-yellow-300" rowSpan={3}>Pre-deployment</td>
                                    <td className="p-3">Human</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'Human', 'Intentional')}>2%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'Human', 'Unintentional')}>4%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'Human', 'Other')}>1%</td>
                                </tr>
                                <tr className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3">AI</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'AI', 'Intentional')}>1%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'AI', 'Unintentional')}>2%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'AI', 'Other')}>1%</td>
                                </tr>
                                <tr className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3">Other</td>
                                    <td className="text-center p-3 text-gray-600">-</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'Other', 'Unintentional')}>1%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Pre-deployment', 'Other', 'Other')}>1%</td>
                                </tr>

                                {/* Post-deployment */}
                                <tr className="border-b border-gray-800 bg-cyan-900/10 hover:bg-cyan-900/20 transition-colors">
                                    <td className="p-3 font-semibold text-yellow-300" rowSpan={3}>Post-deployment</td>
                                    <td className="p-3">Human</td>
                                    <td className="text-center p-3 font-bold text-cyan-400 cursor-pointer hover:bg-cyan-600/30 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'Human', 'Intentional')}>18%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'Human', 'Unintentional')}>5%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'Human', 'Other')}>3%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-cyan-900/10 hover:bg-cyan-900/20 transition-colors">
                                    <td className="p-3">AI</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'AI', 'Intentional')}>5%</td>
                                    <td className="text-center p-3 font-bold text-cyan-400 cursor-pointer hover:bg-cyan-600/30 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'AI', 'Unintentional')}>15%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'AI', 'Other')}>9%</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-cyan-900/10 hover:bg-cyan-900/20 transition-colors">
                                    <td className="p-3">Other</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'Other', 'Intentional')}>2%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'Other', 'Unintentional')}>2%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Post-deployment', 'Other', 'Other')}>4%</td>
                                </tr>

                                {/* Other timing */}
                                <tr className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3 font-semibold text-yellow-300" rowSpan={3}>Other</td>
                                    <td className="p-3">Human</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'Human', 'Intentional')}>3%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'Human', 'Unintentional')}>2%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'Human', 'Other')}>2%</td>
                                </tr>
                                <tr className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3">AI</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'AI', 'Intentional')}>3%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'AI', 'Unintentional')}>4%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'AI', 'Other')}>2%</td>
                                </tr>
                                <tr className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-3">Other</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'Other', 'Intentional')}>0%</td>
                                    <td className="text-center p-3 cursor-pointer hover:bg-cyan-600/20 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'Other', 'Unintentional')}>2%</td>
                                    <td className="text-center p-3 font-bold text-cyan-400 cursor-pointer hover:bg-cyan-600/30 hover:scale-110 transition-transform" onClick={() => handleHeatmapClick('Other', 'Other', 'Other')}>7%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        In Table 2, values &lt;1% are not shown
                    </p>
                </section>

                {/* More Information */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-cyan-400" />
                        <h3 className="text-xl font-semibold text-white">
                            {language === 'fr' ? 'Plus d\'Informations' : 'More Information'}
                        </h3>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg space-y-4">
                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-cyan-400" />
                            <a
                                href="https://airisk.mit.edu/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
                            >
                                https://airisk.mit.edu/
                            </a>
                        </div>
                    </div>
                </section>

                {/* Feedback / Contact */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Mail size={20} className="text-cyan-400" />
                        <h3 className="text-xl font-semibold text-white">
                            {language === 'fr' ? 'Commentaires / Contact' : 'Feedback/Contact us'}
                        </h3>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💬</span>
                            <div>
                                <p className="text-gray-300 mb-2">
                                    Use this form to offer feedback, and suggest resources or risks to add
                                </p>
                                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">EN</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-cyan-400" />
                            <span className="text-gray-300">
                                Email: <a href="mailto:pslat@mit.edu" className="text-cyan-400 hover:text-cyan-300">pslat[at]mit.edu</a>
                            </span>
                        </div>
                    </div>
                </section>

                {/* Citation */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <FileText size={20} className="text-cyan-400" />
                        <h3 className="text-xl font-semibold text-white">
                            {language === 'fr' ? 'Citation' : 'Cite as'}
                        </h3>
                        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">EN</span>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📄</span>
                            <p className="text-gray-300 text-sm leading-relaxed font-mono">
                                Slattery, P., Saeri, A. K., Grundy, E. A. C., Graham, J., Noetel, M., Uuk, R., Dao, J., Pour, S., Casper, S., & Thompson, N. (2024). A systematic evidence review and common frame of reference for the risks from artificial intelligence. https://doi.org/10.48550/arXiv.2408.12622
                            </p>
                        </div>
                    </div>
                </section>

                {/* License Footer */}
                <div className="bg-cyan-900/20 border border-cyan-500/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-cyan-300">
                        {language === 'fr' ? 'Ce travail est sous licence CC BY 4.0' : 'This work is licensed under CC BY 4.0'}
                    </p>
                </div>
            </div>
        </Card>
    );
};

const DomainStatisticsView: React.FC = () => {
    const { t, language } = useLanguage();
    const { statistics, setFilters, metadata, setSearchQuery, clearFilters } = useAIRiskRepository();

    // Navigate to database with filter
    const navigateToDatabase = (filters: any) => {
        // First clear search query and reset filters
        setSearchQuery('');
        // Then apply new filters
        setFilters(filters);
        // Navigate to database tab
        setTimeout(() => {
            const databaseTab = document.querySelector('[data-tab="database"]') as HTMLElement;
            if (databaseTab) {
                databaseTab.click();
            }
        }, 100);
    };

    // Prepare data from real statistics.byDomain
    const domainEntries = Object.entries(statistics.byDomain).map(([domain, count]) => ({
        domain,
        count,
        percentage: ((count / metadata.totalRisks) * 100).toFixed(0) + '%'
    }));

    // Sort by count descending
    domainEntries.sort((a, b) => b.count - a.count);

    // Assign colors to top domains
    const colorMap: Record<number, string> = {
        0: 'bg-red-600',
        1: 'bg-yellow-600',
        2: 'bg-purple-600',
        3: 'bg-cyan-600',
        4: 'bg-blue-600',
        5: 'bg-green-600',
        6: 'bg-gray-600'
    };

    const domainData = domainEntries.slice(0, 7).map((entry, index) => ({
        label: entry.domain.length > 25 ? entry.domain.substring(0, 25) + '...' : entry.domain,
        fullLabel: entry.domain,
        value: entry.count,
        percentage: entry.percentage,
        color: colorMap[index] || 'bg-gray-600'
    }));

    const handleDomainClick = (fullDomain: string) => {
        console.log('🔍 Domain Filter Applied:', { domain: [fullDomain] });
        console.log('📊 Available domains in statistics:', Object.keys(statistics.byDomain));
        navigateToDatabase({ domain: [fullDomain] });
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BarChart3 size={28} className="text-cyan-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {language === 'fr' ? 'Statistiques Interactives - Taxonomie par Domaine' : 'Interactive Statistics - Domain Taxonomy'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {language === 'fr' ? 'Cliquez sur les graphiques pour filtrer la base de données' : 'Click on charts to filter the database'}
                        </p>
                    </div>
                </div>
                <Activity size={32} className="text-cyan-500 animate-pulse" />
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {domainData.length > 0 && (
                    <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                         onClick={() => handleDomainClick(domainData[0].fullLabel)}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Top Domain</span>
                            <Info className="text-red-400" size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white">{domainData[0].percentage}</div>
                        <div className="text-xs text-red-400 mt-1">{domainData[0].label} →</div>
                    </div>
                )}

                {domainData.length > 1 && (
                    <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                         onClick={() => handleDomainClick(domainData[1].fullLabel)}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">2nd Domain</span>
                            <TrendingUp className="text-yellow-400" size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white">{domainData[1].percentage}</div>
                        <div className="text-xs text-yellow-400 mt-1">{domainData[1].label} →</div>
                    </div>
                )}

                {domainData.length > 2 && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                         onClick={() => handleDomainClick(domainData[2].fullLabel)}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">3rd Domain</span>
                            <Activity className="text-purple-400" size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white">{domainData[2].percentage}</div>
                        <div className="text-xs text-purple-400 mt-1">{domainData[2].label} →</div>
                    </div>
                )}

                <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/50 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                     onClick={() => navigateToDatabase({})}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">All Domains</span>
                        <BarChart3 className="text-cyan-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{metadata.totalRisks}</div>
                    <div className="text-xs text-cyan-400 mt-1">View all →</div>
                </div>
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <InteractivePieChart
                    data={domainData}
                    title={language === 'fr' ? 'Distribution des Risques par Domaine' : 'Risk Distribution by Domain'}
                    onSliceClick={(label) => {
                        const domain = domainData.find(d => d.label === label || d.fullLabel === label);
                        if (domain) handleDomainClick(domain.fullLabel);
                    }}
                />
                <InteractiveBarChart
                    data={domainData}
                    title={language === 'fr' ? 'Analyse Détaillée par Domaine' : 'Detailed Analysis by Domain'}
                    onBarClick={(label) => {
                        const domain = domainData.find(d => d.label === label || d.fullLabel === label);
                        if (domain) handleDomainClick(domain.fullLabel);
                    }}
                />
            </div>

            {/* Domain Breakdown Table */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-cyan-400" />
                    {language === 'fr' ? 'Classification Détaillée par Domaine' : 'Detailed Domain Classification'}
                    <span className="ml-2 text-xs text-gray-400">(Click to filter database)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {domainData.map((domain, index) => {
                        const colorClasses = [
                            { bg: 'bg-red-900/20', border: 'border-red-500/50', hoverBg: 'hover:bg-red-900/40', textNum: 'text-red-400', textPct: 'text-red-300' },
                            { bg: 'bg-yellow-900/20', border: 'border-yellow-500/50', hoverBg: 'hover:bg-yellow-900/40', textNum: 'text-yellow-400', textPct: 'text-yellow-300' },
                            { bg: 'bg-purple-900/20', border: 'border-purple-500/50', hoverBg: 'hover:bg-purple-900/40', textNum: 'text-purple-400', textPct: 'text-purple-300' },
                            { bg: 'bg-cyan-900/20', border: 'border-cyan-500/50', hoverBg: 'hover:bg-cyan-900/40', textNum: 'text-cyan-400', textPct: 'text-cyan-300' },
                            { bg: 'bg-blue-900/20', border: 'border-blue-500/50', hoverBg: 'hover:bg-blue-900/40', textNum: 'text-blue-400', textPct: 'text-blue-300' },
                            { bg: 'bg-green-900/20', border: 'border-green-500/50', hoverBg: 'hover:bg-green-900/40', textNum: 'text-green-400', textPct: 'text-green-300' },
                            { bg: 'bg-gray-900/20', border: 'border-gray-500/50', hoverBg: 'hover:bg-gray-900/40', textNum: 'text-gray-400', textPct: 'text-gray-300' }
                        ];
                        const colors = colorClasses[index] || colorClasses[6];

                        return (
                            <button
                                key={domain.fullLabel}
                                onClick={() => handleDomainClick(domain.fullLabel)}
                                className={`${colors.bg} border ${colors.border} p-4 rounded-lg ${colors.hoverBg} hover:scale-105 transition-all cursor-pointer text-left`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`${colors.textNum} font-bold text-lg`}>{index + 1}</span>
                                    <span className={`${colors.textPct} font-bold text-2xl`}>{domain.percentage}</span>
                                </div>
                                <div className="text-white font-semibold mb-1">{domain.fullLabel}</div>
                                <div className="text-gray-400 text-xs">{domain.value} risks</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* More Information */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Globe size={20} className="text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">
                        {language === 'fr' ? 'Plus d\'Informations' : 'More Information'}
                    </h3>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg space-y-4">
                    <p className="text-gray-300 text-sm">
                        The Domain Taxonomy of AI Risks adapted from Weidinger (2021) classifies risks into 7 AI risk domains:
                        (1) Discrimination & Toxicity, (2) Privacy & Security, (3) Misinformation, (4) Malicious Actors & Misuse,
                        (5) Human-Computer Interaction, (6) Socioeconomic & Environmental, and (7) AI System Safety, Failures, & Limitations.
                    </p>
                    <div className="flex items-center gap-3">
                        <Globe size={18} className="text-cyan-400" />
                        <a
                            href="https://airisk.mit.edu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
                        >
                            https://airisk.mit.edu/
                        </a>
                    </div>
                </div>
            </section>

            {/* License Footer */}
            <div className="bg-cyan-900/20 border border-cyan-500/50 p-4 rounded-lg text-center mt-8">
                <p className="text-sm text-cyan-300">
                    {language === 'fr' ? 'Ce travail est sous licence CC BY 4.0' : 'This work is licensed under CC BY 4.0'}
                </p>
            </div>
        </Card>
    );
};

const TaxonomyComparisonView: React.FC = () => {
    const { t, language } = useLanguage();
    const { statistics, setFilters, setSearchQuery } = useAIRiskRepository();

    // Navigate to database with filter
    const navigateToDatabase = (filters: any) => {
        // First clear search query
        setSearchQuery('');
        // Then apply new filters
        setFilters(filters);
        // Navigate to database tab
        setTimeout(() => {
            const databaseTab = document.querySelector('[data-tab="database"]') as HTMLElement;
            if (databaseTab) {
                databaseTab.click();
            }
        }, 100);
    };

    // Click handlers for causal taxonomy
    const handleEntityClick = (label: string) => {
        const mapping: Record<string, string> = {
            'AI': 'IA',
            'Human': 'Humain',
            'Other': 'Autre'
        };
        console.log('🔍 Entity Filter Applied:', { entity: [mapping[label]] });
        navigateToDatabase({ entity: [mapping[label]] });
    };

    const handleIntentClick = (label: string) => {
        const mapping: Record<string, string> = {
            'Intentional': 'Intentionnel',
            'Unintentional': 'Non intentionnel',
            'Other': 'Autre'
        };
        console.log('🔍 Intentionality Filter Applied:', { intentionality: [mapping[label]] });
        navigateToDatabase({ intentionality: [mapping[label]] });
    };

    const handleTimingClick = (label: string) => {
        const mapping: Record<string, string> = {
            'Pre-deployment': 'Pré-déploiement',
            'Post-deployment': 'Post-déploiement',
            'Other': 'Autre'
        };
        console.log('🔍 Timing Filter Applied:', { timing: [mapping[label]] });
        navigateToDatabase({ timing: [mapping[label]] });
    };

    // Click handler for domain taxonomy
    const handleDomainClick = (domain: string) => {
        console.log('🔍 Domain Filter Applied:', { domain: [domain] });
        navigateToDatabase({ domain: [domain] });
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BarChart3 size={28} className="text-cyan-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {language === 'fr' ? 'Comparaison des Taxonomies de Risques IA' : 'Comparison of AI Risk Taxonomies'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {language === 'fr' ? 'Cliquez sur les éléments pour filtrer la base de données' : 'Click on elements to filter the database'}
                        </p>
                    </div>
                </div>
                <Activity size={32} className="text-cyan-500 animate-pulse" />
            </div>

            {/* Introduction */}
            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                    {language === 'fr' ? 'Vue d\'ensemble' : 'Overview'}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                    {language === 'fr'
                        ? 'Le référentiel des risques IA du MIT utilise deux taxonomies complémentaires pour classifier les risques. La taxonomie causale se concentre sur les facteurs causaux (qui, quand et pourquoi), tandis que la taxonomie par domaine organise les risques par domaines d\'impact et types de préjudice.'
                        : 'The MIT AI Risk Repository uses two complementary taxonomies to classify risks. The Causal Taxonomy focuses on causal factors (who, when, and why), while the Domain Taxonomy organizes risks by impact areas and types of harm.'
                    }
                </p>
            </div>

            {/* Comparison Table */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden mb-8">
                <h3 className="text-xl font-semibold text-white p-6 pb-4">
                    {language === 'fr' ? 'Tableau Comparatif' : 'Comparison Table'}
                    <span className="ml-3 text-xs text-gray-400">(Cliquez sur les taxonomies ci-dessous / Click on taxonomies below)</span>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800 border-b-2 border-gray-700">
                            <tr>
                                <th className="p-4 text-left text-cyan-400 font-semibold">{language === 'fr' ? 'Critère' : 'Criterion'}</th>
                                <th className="p-4 text-left text-purple-400 font-semibold">{language === 'fr' ? 'Taxonomie Causale' : 'Causal Taxonomy'}</th>
                                <th className="p-4 text-left text-yellow-400 font-semibold">{language === 'fr' ? 'Taxonomie par Domaine' : 'Domain Taxonomy'}</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4 font-semibold text-cyan-300">{language === 'fr' ? 'Objectif principal' : 'Primary purpose'}</td>
                                <td className="p-4">{language === 'fr' ? 'Identifier les facteurs causaux des risques' : 'Identify causal factors of risks'}</td>
                                <td className="p-4">{language === 'fr' ? 'Catégoriser par domaines d\'impact' : 'Categorize by impact domains'}</td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4 font-semibold text-cyan-300">{language === 'fr' ? 'Dimensions' : 'Dimensions'}</td>
                                <td className="p-4">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Entity (AI, Human, Other)</li>
                                        <li>Intent (Intentional, Unintentional, Other)</li>
                                        <li>Timing (Pre/Post-deployment, Other)</li>
                                    </ul>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1 text-sm">
                                        <div>1. Discrimination & Toxicity</div>
                                        <div>2. Privacy & Security</div>
                                        <div>3. Misinformation</div>
                                        <div>4. Malicious Actors & Misuse</div>
                                        <div>5. Human-Computer Interaction</div>
                                        <div>6. Socioeconomic & Environmental</div>
                                        <div>7. AI System Safety & Limitations</div>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4 font-semibold text-cyan-300">{language === 'fr' ? 'Nombre de catégories' : 'Number of categories'}</td>
                                <td className="p-4">3 dimensions × 3 niveaux = 27 combinaisons</td>
                                <td className="p-4">7 domaines, 23 sous-domaines</td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4 font-semibold text-cyan-300">{language === 'fr' ? 'Focus analytique' : 'Analytical focus'}</td>
                                <td className="p-4">{language === 'fr' ? 'Qui cause le risque ? Quand ? Pourquoi ?' : 'Who causes the risk? When? Why?'}</td>
                                <td className="p-4">{language === 'fr' ? 'Quel type de préjudice ? Quel domaine d\'impact ?' : 'What type of harm? What impact area?'}</td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4 font-semibold text-cyan-300">{language === 'fr' ? 'Utilité principale' : 'Main utility'}</td>
                                <td className="p-4">{language === 'fr' ? 'Attribution de responsabilité, timing d\'intervention' : 'Responsibility attribution, intervention timing'}</td>
                                <td className="p-4">{language === 'fr' ? 'Développement de politiques, évaluation d\'impact' : 'Policy development, impact assessment'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two-column layout for taxonomies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Causal Taxonomy Card */}
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
                        <Activity size={20} />
                        {language === 'fr' ? 'Taxonomie Causale' : 'Causal Taxonomy'}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                        {language === 'fr'
                            ? 'Classifie les risques selon trois facteurs causaux fondamentaux qui répondent aux questions : Qui ? Quand ? Pourquoi ?'
                            : 'Classifies risks according to three fundamental causal factors answering: Who? When? Why?'
                        }
                    </p>

                    <div className="space-y-4">
                        <div className="bg-gray-900/50 p-4 rounded">
                            <h4 className="font-semibold text-cyan-400 mb-2">Entity (Qui / Who)</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li
                                    className="cursor-pointer hover:text-cyan-400 hover:bg-cyan-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleEntityClick('AI')}
                                >
                                    • <strong>AI:</strong> 41% {language === 'fr' ? 'des risques' : 'of risks'}
                                </li>
                                <li
                                    className="cursor-pointer hover:text-cyan-400 hover:bg-cyan-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleEntityClick('Human')}
                                >
                                    • <strong>Human:</strong> 39%
                                </li>
                                <li
                                    className="cursor-pointer hover:text-cyan-400 hover:bg-cyan-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleEntityClick('Other')}
                                >
                                    • <strong>Other:</strong> 20%
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded">
                            <h4 className="font-semibold text-cyan-400 mb-2">Intent (Pourquoi / Why)</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li
                                    className="cursor-pointer hover:text-purple-400 hover:bg-purple-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleIntentClick('Unintentional')}
                                >
                                    • <strong>Unintentional:</strong> 35%
                                </li>
                                <li
                                    className="cursor-pointer hover:text-purple-400 hover:bg-purple-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleIntentClick('Intentional')}
                                >
                                    • <strong>Intentional:</strong> 34%
                                </li>
                                <li
                                    className="cursor-pointer hover:text-purple-400 hover:bg-purple-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleIntentClick('Other')}
                                >
                                    • <strong>Other:</strong> 31%
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded">
                            <h4 className="font-semibold text-cyan-400 mb-2">Timing (Quand / When)</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li
                                    className="cursor-pointer hover:text-yellow-400 hover:bg-yellow-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleTimingClick('Post-deployment')}
                                >
                                    • <strong>Post-deployment:</strong> 62%
                                </li>
                                <li
                                    className="cursor-pointer hover:text-yellow-400 hover:bg-yellow-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleTimingClick('Other')}
                                >
                                    • <strong>Other:</strong> 25%
                                </li>
                                <li
                                    className="cursor-pointer hover:text-yellow-400 hover:bg-yellow-900/20 p-2 rounded transition-colors"
                                    onClick={() => handleTimingClick('Pre-deployment')}
                                >
                                    • <strong>Pre-deployment:</strong> 13%
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Domain Taxonomy Card */}
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} />
                        {language === 'fr' ? 'Taxonomie par Domaine' : 'Domain Taxonomy'}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                        {language === 'fr'
                            ? 'Organise les risques en 7 domaines d\'impact couvrant l\'ensemble des préjudices potentiels de l\'IA.'
                            : 'Organizes risks into 7 impact domains covering the full spectrum of potential AI harms.'
                        }
                    </p>

                    <div className="space-y-2">
                        <div
                            className="bg-red-900/30 p-3 rounded text-sm cursor-pointer hover:bg-red-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('Discrimination et Toxicité')}
                        >
                            <strong className="text-red-300">1. Discrimination & Toxicity</strong>
                            <p className="text-gray-400 text-xs mt-1">Unfair treatment, toxic content, unequal performance</p>
                        </div>

                        <div
                            className="bg-blue-900/30 p-3 rounded text-sm cursor-pointer hover:bg-blue-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('Vie Privée et Sécurité')}
                        >
                            <strong className="text-blue-300">2. Privacy & Security</strong>
                            <p className="text-gray-400 text-xs mt-1">Data leaks, privacy violations, system vulnerabilities</p>
                        </div>

                        <div
                            className="bg-purple-900/30 p-3 rounded text-sm cursor-pointer hover:bg-purple-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('Désinformation')}
                        >
                            <strong className="text-purple-300">3. Misinformation</strong>
                            <p className="text-gray-400 text-xs mt-1">False information, filter bubbles, consensus reality loss</p>
                        </div>

                        <div
                            className="bg-orange-900/30 p-3 rounded text-sm cursor-pointer hover:bg-orange-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('Acteurs Malveillants et Utilisation Abusive')}
                        >
                            <strong className="text-orange-300">4. Malicious Actors & Misuse</strong>
                            <p className="text-gray-400 text-xs mt-1">Disinformation, cyberattacks, fraud, manipulation</p>
                        </div>

                        <div
                            className="bg-green-900/30 p-3 rounded text-sm cursor-pointer hover:bg-green-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('Interaction Humain-Ordinateur')}
                        >
                            <strong className="text-green-300">5. Human-Computer Interaction</strong>
                            <p className="text-gray-400 text-xs mt-1">Overreliance, loss of agency and autonomy</p>
                        </div>

                        <div
                            className="bg-yellow-900/30 p-3 rounded text-sm cursor-pointer hover:bg-yellow-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('Socioéconomique et Environnemental')}
                        >
                            <strong className="text-yellow-300">6. Socioeconomic & Environmental</strong>
                            <p className="text-gray-400 text-xs mt-1">Power centralization, inequality, environmental harm</p>
                        </div>

                        <div
                            className="bg-cyan-900/30 p-3 rounded text-sm cursor-pointer hover:bg-cyan-900/50 hover:scale-105 transition-all"
                            onClick={() => handleDomainClick('7. AI System Safety, Failures, & Limitations')}
                        >
                            <strong className="text-cyan-300">7. AI System Safety & Limitations</strong>
                            <p className="text-gray-400 text-xs mt-1">Misalignment, dangerous capabilities, robustness failures</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How they complement each other */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Info size={20} className="text-cyan-400" />
                    {language === 'fr' ? 'Complémentarité des Taxonomies' : 'How the Taxonomies Complement Each Other'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-cyan-300 mb-1">
                                    {language === 'fr' ? 'Analyse Multi-dimensionnelle' : 'Multi-dimensional Analysis'}
                                </h4>
                                <p className="text-sm text-gray-400">
                                    {language === 'fr'
                                        ? 'Chaque risque peut être analysé selon ses facteurs causaux ET son domaine d\'impact, offrant une vue complète.'
                                        : 'Each risk can be analyzed by both its causal factors AND its impact domain, providing a complete view.'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-300 mb-1">
                                    {language === 'fr' ? 'Attribution de Responsabilité' : 'Responsibility Attribution'}
                                </h4>
                                <p className="text-sm text-gray-400">
                                    {language === 'fr'
                                        ? 'La taxonomie causale identifie qui est responsable, tandis que la taxonomie par domaine montre l\'impact sociétal.'
                                        : 'The Causal Taxonomy identifies who is responsible, while the Domain Taxonomy shows societal impact.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-yellow-300 mb-1">
                                    {language === 'fr' ? 'Stratégies d\'Atténuation' : 'Mitigation Strategies'}
                                </h4>
                                <p className="text-sm text-gray-400">
                                    {language === 'fr'
                                        ? 'La taxonomie causale guide QUAND et COMMENT intervenir. La taxonomie par domaine guide les POLITIQUES à développer.'
                                        : 'The Causal Taxonomy guides WHEN and HOW to intervene. The Domain Taxonomy guides WHICH POLICIES to develop.'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white font-bold">4</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-300 mb-1">
                                    {language === 'fr' ? 'Recherche et Analyse' : 'Research & Analysis'}
                                </h4>
                                <p className="text-sm text-gray-400">
                                    {language === 'fr'
                                        ? 'Permet des analyses croisées pour identifier des patterns et des corrélations entre causes et impacts.'
                                        : 'Enables cross-analyses to identify patterns and correlations between causes and impacts.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Example */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                    {language === 'fr' ? 'Exemple : Classification d\'un Risque' : 'Example: Risk Classification'}
                </h3>
                <div className="bg-gray-900/50 p-5 rounded-lg">
                    <p className="text-gray-300 italic mb-4">
                        "{language === 'fr'
                            ? 'L\'utilisation malveillante de l\'IA peut mettre en danger la sécurité numérique, la sécurité physique et la sécurité politique. Les entités internationales chargées de l\'application de la loi sont confrontées à divers risques liés à l\'utilisation malveillante de l\'IA.'
                            : 'Malicious utilization of AI has the potential to endanger digital security, physical security, and political security. International law enforcement entities grapple with a variety of risks linked to the Malevolent Utilization of AI.'
                        }"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-purple-900/30 p-4 rounded">
                            <h4 className="font-semibold text-purple-300 mb-2">
                                {language === 'fr' ? 'Taxonomie Causale' : 'Causal Taxonomy'}
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li
                                    className="cursor-pointer hover:text-cyan-400 hover:bg-cyan-900/20 p-1 rounded transition-colors"
                                    onClick={() => handleEntityClick('Human')}
                                >
                                    • <strong>Entity:</strong> Human
                                </li>
                                <li
                                    className="cursor-pointer hover:text-purple-400 hover:bg-purple-900/20 p-1 rounded transition-colors"
                                    onClick={() => handleIntentClick('Intentional')}
                                >
                                    • <strong>Intent:</strong> Intentional
                                </li>
                                <li
                                    className="cursor-pointer hover:text-yellow-400 hover:bg-yellow-900/20 p-1 rounded transition-colors"
                                    onClick={() => handleTimingClick('Post-deployment')}
                                >
                                    • <strong>Timing:</strong> Post-deployment
                                </li>
                            </ul>
                        </div>
                        <div className="bg-yellow-900/30 p-4 rounded">
                            <h4 className="font-semibold text-yellow-300 mb-2">
                                {language === 'fr' ? 'Taxonomie par Domaine' : 'Domain Taxonomy'}
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li
                                    className="cursor-pointer hover:text-orange-400 hover:bg-orange-900/20 p-1 rounded transition-colors"
                                    onClick={() => handleDomainClick('Acteurs Malveillants et Utilisation Abusive')}
                                >
                                    • <strong>Domain:</strong> Malicious actors & misuse (4)
                                </li>
                                <li className="text-gray-400 text-xs">
                                    • <strong>Subdomain:</strong> 4.1 - Disinformation, surveillance, and influence at scale
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* More Information */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Globe size={20} className="text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">
                        {language === 'fr' ? 'Plus d\'Informations' : 'More Information'}
                    </h3>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg space-y-4">
                    <p className="text-gray-300 text-sm">
                        {language === 'fr'
                            ? 'Pour plus de détails sur ces taxonomies et leur application, consultez le rapport complet et la base de données complète.'
                            : 'For more details on these taxonomies and their application, see the full report and complete database.'
                        }
                    </p>
                    <div className="flex items-center gap-3">
                        <Globe size={18} className="text-cyan-400" />
                        <a
                            href="https://airisk.mit.edu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
                        >
                            https://airisk.mit.edu/
                        </a>
                    </div>
                </div>
            </section>

            {/* License Footer */}
            <div className="bg-cyan-900/20 border border-cyan-500/50 p-4 rounded-lg text-center mt-8">
                <p className="text-sm text-cyan-300">
                    {language === 'fr' ? 'Ce travail est sous licence CC BY 4.0' : 'This work is licensed under CC BY 4.0'}
                </p>
            </div>
        </Card>
    );
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ sheetId }) => {
    if (sheetId === 'causal-stats') {
        return <CausalStatisticsView />;
    }

    if (sheetId === 'domain-stats') {
        return <DomainStatisticsView />;
    }

    if (sheetId === 'comparison') {
        return <TaxonomyComparisonView />;
    }

    return null;
};

export default StatisticsView;
