import React, { useState, useMemo, useCallback } from 'react';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Database,
    Users,
    Target,
    Clock,
    AlertTriangle,
    TrendingUp,
    Filter,
    ChevronRight,
    Info,
    BookOpen,
    BarChart3,
    GitBranch,
    Sparkles
} from 'lucide-react';

const CausalTaxonomyView: React.FC = () => {
    const { language } = useLanguage();
    const { statistics, setFilters, setSearchQuery } = useAIRiskRepository();
    const [activeTab, setActiveTab] = useState<'overview' | 'entity' | 'intent' | 'timing'>('overview');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Safety check for statistics
    if (!statistics || !statistics.byEntity || !statistics.byIntentionality || !statistics.byTiming) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement des données...</p>
                </div>
            </div>
        );
    }

    // Navigate to database with filter - memoized
    const navigateToDatabase = useCallback((filters: any) => {
        setSearchQuery('');
        setFilters(filters);
        setTimeout(() => {
            const databaseTab = document.querySelector('[data-tab="database"]') as HTMLElement;
            if (databaseTab) {
                databaseTab.click();
            }
        }, 100);
    }, [setSearchQuery, setFilters]);

    // Filter handlers for each dimension - memoized
    const handleEntityClick = useCallback((value: string) => {
        navigateToDatabase({ entity: [value] });
    }, [navigateToDatabase]);

    const handleIntentClick = useCallback((value: string) => {
        navigateToDatabase({ intentionality: [value] });
    }, [navigateToDatabase]);

    const handleTimingClick = useCallback((value: string) => {
        navigateToDatabase({ timing: [value] });
    }, [navigateToDatabase]);

    // Calculate statistics - memoized to avoid recalculation on every render
    const entityStats = useMemo(() => [
        {
            id: 'ai',
            label: { fr: 'IA', en: 'AI' },
            value: statistics.byEntity['IA'] || 0,
            description: {
                fr: "En raison d'une décision ou d'une action prise par un système d'IA",
                en: "Due to a decision or action made by an AI system"
            },
            color: 'bg-cyan-600',
            gradient: 'from-cyan-600 to-cyan-700',
            icon: <Sparkles size={24} />
        },
        {
            id: 'human',
            label: { fr: 'Humain', en: 'Human' },
            value: statistics.byEntity['Humain'] || 0,
            description: {
                fr: "En raison d'une décision ou d'une action prise par des humains",
                en: "Due to a decision or action made by humans"
            },
            color: 'bg-purple-600',
            gradient: 'from-purple-600 to-purple-700',
            icon: <Users size={24} />
        },
        {
            id: 'other',
            label: { fr: 'Autre', en: 'Other' },
            value: statistics.byEntity['Autre'] || 0,
            description: {
                fr: "Pour une autre raison ou ambigu",
                en: "Due to some other reason or ambiguous"
            },
            color: 'bg-gray-600',
            gradient: 'from-gray-600 to-gray-700',
            icon: <GitBranch size={24} />
        }
    ], [statistics]);

    const intentStats = useMemo(() => [
        {
            id: 'intentional',
            label: { fr: 'Intentionnel', en: 'Intentional' },
            value: statistics.byIntentionality['Intentionnel'] || 0,
            description: {
                fr: "En raison d'un résultat attendu de la poursuite d'un objectif",
                en: "Due to an expected outcome from pursuing a goal"
            },
            color: 'bg-red-600',
            gradient: 'from-red-600 to-red-700',
            icon: <Target size={24} />
        },
        {
            id: 'unintentional',
            label: { fr: 'Non intentionnel', en: 'Unintentional' },
            value: statistics.byIntentionality['Non intentionnel'] || 0,
            description: {
                fr: "En raison d'un résultat inattendu de la poursuite d'un objectif",
                en: "Due to an unexpected outcome from pursuing a goal"
            },
            color: 'bg-yellow-600',
            gradient: 'from-yellow-600 to-yellow-700',
            icon: <AlertTriangle size={24} />
        },
        {
            id: 'other',
            label: { fr: 'Autre', en: 'Other' },
            value: statistics.byIntentionality['Autre'] || 0,
            description: {
                fr: "Sans préciser clairement l'intentionnalité",
                en: "Without clearly specifying the intentionality"
            },
            color: 'bg-gray-600',
            gradient: 'from-gray-600 to-gray-700',
            icon: <GitBranch size={24} />
        }
    ], [statistics]);

    const timingStats = useMemo(() => [
        {
            id: 'pre',
            label: { fr: 'Pré-déploiement', en: 'Pre-deployment' },
            value: statistics.byTiming['Pré-déploiement'] || 0,
            description: {
                fr: "Avant que l'IA ne soit déployée",
                en: "Before the AI is deployed"
            },
            color: 'bg-blue-600',
            gradient: 'from-blue-600 to-blue-700',
            icon: <Clock size={24} />
        },
        {
            id: 'post',
            label: { fr: 'Post-déploiement', en: 'Post-deployment' },
            value: statistics.byTiming['Post-déploiement'] || 0,
            description: {
                fr: "Après que le modèle d'IA ait été formé et déployé",
                en: "After the AI model has been trained and deployed"
            },
            color: 'bg-green-600',
            gradient: 'from-green-600 to-green-700',
            icon: <TrendingUp size={24} />
        },
        {
            id: 'other',
            label: { fr: 'Autre', en: 'Other' },
            value: statistics.byTiming['Autre'] || 0,
            description: {
                fr: "Sans moment d'occurrence clairement spécifié",
                en: "Without a clearly specified time of occurrence"
            },
            color: 'bg-gray-600',
            gradient: 'from-gray-600 to-gray-700',
            icon: <GitBranch size={24} />
        }
    ], [statistics]);

    const totalRisks = useMemo(() =>
        entityStats.reduce((sum, stat) => sum + stat.value, 0),
        [entityStats]
    );

    const renderDimensionCard = useCallback((
        stat: any,
        index: number,
        onClickHandler: (value: string) => void,
        dimensionKey: string
    ) => {
        const percentage = totalRisks > 0 ? ((stat.value / totalRisks) * 100).toFixed(1) : '0.0';
        const isHovered = hoveredCard === `${dimensionKey}-${stat.id}`;

        return (
            <button
                key={stat.id}
                onClick={() => onClickHandler(stat.label.fr)}
                onMouseEnter={() => setHoveredCard(`${dimensionKey}-${stat.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative group"
            >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`}></div>

                {/* Card content */}
                <div className={`relative bg-gray-900/90 border ${isHovered ? 'border-cyan-500' : 'border-gray-700'} rounded-lg p-6 transition-all duration-300 ${isHovered ? 'scale-105 shadow-2xl' : 'scale-100'}`}>
                    {/* Icon and label */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 ${stat.color} rounded-lg`}>
                            {stat.icon}
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-gray-400">{language === 'fr' ? 'risques' : 'risks'}</div>
                        </div>
                    </div>

                    {/* Label */}
                    <div className="mb-2">
                        <h4 className="text-lg font-semibold text-white">{stat.label[language]}</h4>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 min-h-[40px]">{stat.description[language]}</p>

                    {/* Progress bar */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">{language === 'fr' ? 'Distribution' : 'Distribution'}</span>
                            <span className="text-xs font-semibold text-cyan-400">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${stat.color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Action hint */}
                    <div className={`flex items-center gap-2 text-sm transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <Filter size={14} className="text-cyan-400" />
                        <span className="text-cyan-400 font-medium">
                            {language === 'fr' ? 'Cliquer pour filtrer' : 'Click to filter'}
                        </span>
                        <ChevronRight size={14} className="text-cyan-400" />
                    </div>
                </div>
            </button>
        );
    }, [totalRisks, hoveredCard, language]);

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/30 rounded-lg p-8 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-xl shadow-lg">
                            <GitBranch size={40} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {language === 'fr'
                                    ? 'Taxonomie Causale des Risques IA'
                                    : 'Causal Taxonomy of AI Risks'}
                            </h1>
                            <p className="text-gray-400 text-lg">
                                {language === 'fr'
                                    ? 'Classification des risques selon leurs facteurs de causalité (Entité, Intentionnalité, Temporalité)'
                                    : 'Risk classification by causal factors (Entity, Intent, Timing)'}
                            </p>
                        </div>
                    </div>

                    {/* Stats banner */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Database className="text-cyan-400" size={24} />
                                <div>
                                    <div className="text-2xl font-bold text-white">{totalRisks}</div>
                                    <div className="text-xs text-gray-400">
                                        {language === 'fr' ? 'Risques totaux' : 'Total risks'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <GitBranch className="text-purple-400" size={24} />
                                <div>
                                    <div className="text-2xl font-bold text-white">3</div>
                                    <div className="text-xs text-gray-400">
                                        {language === 'fr' ? 'Dimensions' : 'Dimensions'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-yellow-400" size={24} />
                                <div>
                                    <div className="text-2xl font-bold text-white">9</div>
                                    <div className="text-xs text-gray-400">
                                        {language === 'fr' ? 'Catégories' : 'Categories'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-green-400" size={24} />
                                <div>
                                    <div className="text-2xl font-bold text-white">MIT</div>
                                    <div className="text-xs text-gray-400">
                                        {language === 'fr' ? 'Source' : 'Source'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold text-cyan-400 mb-1">
                            {language === 'fr' ? 'Navigation interactive' : 'Interactive navigation'}
                        </p>
                        <p>
                            {language === 'fr'
                                ? 'Cliquez sur n\'importe quelle carte ci-dessous pour filtrer la base de données par cette dimension causale. Les visualisations vous permettent d\'explorer les risques selon leur entité responsable, leur intentionnalité et leur temporalité.'
                                : 'Click on any card below to filter the database by that causal dimension. The visualizations allow you to explore risks by responsible entity, intentionality, and timing.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-700">
                {[
                    { id: 'overview', label: { fr: 'Vue d\'ensemble', en: 'Overview' }, icon: <BarChart3 size={16} /> },
                    { id: 'entity', label: { fr: 'Entité', en: 'Entity' }, icon: <Users size={16} /> },
                    { id: 'intent', label: { fr: 'Intentionnalité', en: 'Intent' }, icon: <Target size={16} /> },
                    { id: 'timing', label: { fr: 'Temporalité', en: 'Timing' }, icon: <Clock size={16} /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                            activeTab === tab.id
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        {tab.icon}
                        {tab.label[language]}
                    </button>
                ))}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* All three dimensions */}
                    <div className="space-y-6">
                        {/* Entity Dimension */}
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="text-cyan-400" size={28} />
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {language === 'fr' ? '1. Entité' : '1. Entity'}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {language === 'fr'
                                            ? "Le facteur à l'origine de la décision ou de l'action causant le risque"
                                            : "The factor behind the decision or action causing the risk"}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {entityStats.map((stat, idx) => renderDimensionCard(stat, idx, handleEntityClick, 'entity'))}
                            </div>
                        </div>

                        {/* Intent Dimension */}
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="text-purple-400" size={28} />
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {language === 'fr' ? '2. Intentionnalité' : '2. Intent'}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {language === 'fr'
                                            ? "La nature intentionnelle ou non intentionnelle du risque"
                                            : "Whether the risk is intentional or unintentional"}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {intentStats.map((stat, idx) => renderDimensionCard(stat, idx, handleIntentClick, 'intent'))}
                            </div>
                        </div>

                        {/* Timing Dimension */}
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="text-yellow-400" size={28} />
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {language === 'fr' ? '3. Temporalité' : '3. Timing'}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {language === 'fr'
                                            ? "Le moment où le risque se produit par rapport au déploiement de l'IA"
                                            : "When the risk occurs relative to AI deployment"}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {timingStats.map((stat, idx) => renderDimensionCard(stat, idx, handleTimingClick, 'timing'))}
                            </div>
                        </div>
                    </div>

                    {/* Example classification */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 rounded-lg p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-cyan-600 rounded-lg">
                                <BookOpen size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-2">
                                    {language === 'fr' ? 'Exemple de classification' : 'Example classification'}
                                </h4>
                                <p className="text-gray-300 mb-4 italic">
                                    "{language === 'fr'
                                        ? "L'utilisation malveillante de l'IA a le potentiel de mettre en danger la sécurité numérique, la sécurité physique et la sécurité politique. Les entités internationales chargées de l'application de la loi sont aux prises avec une variété de risques liés à l'utilisation malveillante de l'IA."
                                        : "Malicious utilization of AI has the potential to endanger digital security, physical security, and political security. International law enforcement entities grapple with a variety of risks linked to the Malevolent Utilization of AI."}"
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleEntityClick('Humain')}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Users size={16} />
                                        <span className="font-medium">Entity = {language === 'fr' ? 'Humain' : 'Human'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleIntentClick('Intentionnel')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Target size={16} />
                                        <span className="font-medium">Intent = {language === 'fr' ? 'Intentionnel' : 'Intentional'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleTimingClick('Post-déploiement')}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Clock size={16} />
                                        <span className="font-medium">Timing = {language === 'fr' ? 'Post-déploiement' : 'Post-deployment'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'entity' && (
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="text-cyan-400" size={32} />
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    {language === 'fr' ? 'Dimension : Entité' : 'Dimension: Entity'}
                                </h3>
                                <p className="text-gray-400">
                                    {language === 'fr'
                                        ? "Le facteur à l'origine de la décision ou de l'action causant le risque"
                                        : "The factor behind the decision or action causing the risk"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {entityStats.map((stat, idx) => renderDimensionCard(stat, idx, handleEntityClick, 'entity'))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'intent' && (
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="text-purple-400" size={32} />
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    {language === 'fr' ? 'Dimension : Intentionnalité' : 'Dimension: Intent'}
                                </h3>
                                <p className="text-gray-400">
                                    {language === 'fr'
                                        ? "La nature intentionnelle ou non intentionnelle du risque"
                                        : "Whether the risk is intentional or unintentional"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {intentStats.map((stat, idx) => renderDimensionCard(stat, idx, handleIntentClick, 'intent'))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'timing' && (
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="text-yellow-400" size={32} />
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    {language === 'fr' ? 'Dimension : Temporalité' : 'Dimension: Timing'}
                                </h3>
                                <p className="text-gray-400">
                                    {language === 'fr'
                                        ? "Le moment où le risque se produit par rapport au déploiement de l'IA"
                                        : "When the risk occurs relative to AI deployment"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {timingStats.map((stat, idx) => renderDimensionCard(stat, idx, handleTimingClick, 'timing'))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Info Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                    {language === 'fr' ? 'Comment utiliser cette taxonomie' : 'How to use this taxonomy'}
                </h4>
                <p className="text-gray-400 mb-4">
                    {language === 'fr'
                        ? "La taxonomie causale de haut niveau vous permet d'utiliser notre base de données pour, par exemple, identifier toutes les mentions de risques qui se présentent comme survenant en pré-déploiement ou post-déploiement, de manière intentionnelle ou non, et causés par l'IA ou par des humains, ou toute combinaison de ces facteurs."
                        : "The high-level causal taxonomy allows you to use our database to, for example, identify all risk mentions that are presented as occurring pre-deployment or post-deployment, intentionally or unintentionally, and caused by AI or humans, or any combination of these factors."}
                </p>
                <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <BookOpen size={16} />
                    <a
                        href="https://arxiv.org/abs/2408.12622"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        {language === 'fr'
                            ? 'Lire le rapport complet sur ArXiv'
                            : 'Read the full report on ArXiv'}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CausalTaxonomyView;
