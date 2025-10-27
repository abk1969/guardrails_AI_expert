import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import {
    LayoutGrid,
    Binary,
    Rows3,
    Database,
    MessageSquare,
    BarChart,
    FileJson,
    Link as LinkIcon,
    Info,
    ChevronRight,
    Search,
    TrendingUp,
    Users,
    Shield,
    Zap,
    BookOpen,
    Target,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Eye
} from 'lucide-react';

interface SheetDetail {
    id: string;
    title: { fr: string; en: string };
    icon: React.ReactNode;
    description: { fr: string; en: string };
    highlights: { fr: string[]; en: string[] };
    category: 'taxonomy' | 'data' | 'analysis' | 'resources';
    stats?: { label: { fr: string; en: string }; value: string | number };
    color: string;
    gradient: string;
}

interface ContentsViewProps {
    setActiveSheet: (sheetId: any) => void;
}

const ContentsView: React.FC<ContentsViewProps> = ({ setActiveSheet }) => {
    const { language } = useLanguage();
    const { metadata, statistics } = useAIRiskRepository();
    const [hoveredSheet, setHoveredSheet] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const SHEETS_DETAILS: SheetDetail[] = [
        {
            id: 'causal-taxonomy',
            title: {
                fr: 'Taxonomie Causale',
                en: 'Causal Taxonomy'
            },
            icon: <Binary size={24} />,
            description: {
                fr: "Structure les risques selon leurs chaînes causales fondamentales: Qui, Quand, Pourquoi",
                en: "Structures risks according to their fundamental causal chains: Who, When, Why"
            },
            highlights: {
                fr: ['3 dimensions causales', 'Analyse par entité', 'Temporalité des risques'],
                en: ['3 causal dimensions', 'Entity analysis', 'Risk timing']
            },
            category: 'taxonomy',
            stats: {
                label: { fr: 'Dimensions', en: 'Dimensions' },
                value: 3
            },
            color: 'cyan',
            gradient: 'from-cyan-900/40 to-blue-900/40'
        },
        {
            id: 'domain-taxonomy',
            title: {
                fr: 'Taxonomie par Domaine',
                en: 'Domain Taxonomy'
            },
            icon: <Rows3 size={24} />,
            description: {
                fr: "Organise les risques en 7 domaines d'impact couvrant l'ensemble des préjudices potentiels de l'IA",
                en: "Organizes risks into 7 impact domains covering the full spectrum of potential AI harms"
            },
            highlights: {
                fr: ['7 domaines d\'impact', 'Classification sectorielle', 'Analyse par préjudice'],
                en: ['7 impact domains', 'Sectoral classification', 'Harm analysis']
            },
            category: 'taxonomy',
            stats: {
                label: { fr: 'Domaines', en: 'Domains' },
                value: 7
            },
            color: 'yellow',
            gradient: 'from-yellow-900/40 to-orange-900/40'
        },
        {
            id: 'database',
            title: {
                fr: 'Base de Données des Risques',
                en: 'Risk Database'
            },
            icon: <Database size={24} />,
            description: {
                fr: `Collection exhaustive de ${metadata.totalRisks} risques documentés provenant de 43 sources académiques`,
                en: `Comprehensive collection of ${metadata.totalRisks} documented risks from 43 academic sources`
            },
            highlights: {
                fr: ['Recherche avancée', 'Filtres multicritères', 'Export de données'],
                en: ['Advanced search', 'Multi-criteria filters', 'Data export']
            },
            category: 'data',
            stats: {
                label: { fr: 'Risques', en: 'Risks' },
                value: metadata.totalRisks
            },
            color: 'purple',
            gradient: 'from-purple-900/40 to-pink-900/40'
        },
        {
            id: 'explainer',
            title: {
                fr: 'Explication de la Base',
                en: 'Database Explainer'
            },
            icon: <Info size={24} />,
            description: {
                fr: "Méthodologie, structure des données et guide d'utilisation du référentiel",
                en: "Methodology, data structure and usage guide for the repository"
            },
            highlights: {
                fr: ['Méthodologie détaillée', 'Exemples concrets', 'Guide d\'utilisation'],
                en: ['Detailed methodology', 'Concrete examples', 'Usage guide']
            },
            category: 'resources',
            color: 'blue',
            gradient: 'from-blue-900/40 to-indigo-900/40'
        },
        {
            id: 'causal-stats',
            title: {
                fr: 'Statistiques Causales',
                en: 'Causal Statistics'
            },
            icon: <BarChart size={24} />,
            description: {
                fr: "Visualisations interactives et statistiques dérivées de la taxonomie causale",
                en: "Interactive visualizations and statistics derived from causal taxonomy"
            },
            highlights: {
                fr: ['Graphiques interactifs', 'Distribution par entité', 'Analyse temporelle'],
                en: ['Interactive charts', 'Entity distribution', 'Temporal analysis']
            },
            category: 'analysis',
            stats: {
                label: { fr: 'Visualisations', en: 'Visualizations' },
                value: 3
            },
            color: 'green',
            gradient: 'from-green-900/40 to-emerald-900/40'
        },
        {
            id: 'domain-stats',
            title: {
                fr: 'Statistiques par Domaine',
                en: 'Domain Statistics'
            },
            icon: <BarChart size={24} />,
            description: {
                fr: "Visualisations interactives et statistiques dérivées de la taxonomie par domaine",
                en: "Interactive visualizations and statistics derived from domain taxonomy"
            },
            highlights: {
                fr: ['Graphiques interactifs', 'Distribution par domaine', 'Top risques'],
                en: ['Interactive charts', 'Domain distribution', 'Top risks']
            },
            category: 'analysis',
            stats: {
                label: { fr: 'Domaines', en: 'Domains' },
                value: Object.keys(statistics.byDomain).length
            },
            color: 'orange',
            gradient: 'from-orange-900/40 to-red-900/40'
        },
        {
            id: 'comparison',
            title: {
                fr: 'Comparaison Taxonomies',
                en: 'Taxonomy Comparison'
            },
            icon: <FileJson size={24} />,
            description: {
                fr: "Analyse croisée et comparaison détaillée entre les taxonomies causale et par domaine",
                en: "Cross-analysis and detailed comparison between causal and domain taxonomies"
            },
            highlights: {
                fr: ['Analyse comparative', 'Complémentarité', 'Exemples pratiques'],
                en: ['Comparative analysis', 'Complementarity', 'Practical examples']
            },
            category: 'analysis',
            color: 'pink',
            gradient: 'from-pink-900/40 to-purple-900/40'
        },
        {
            id: 'resources',
            title: {
                fr: 'Ressources Incluses',
                en: 'Included Resources'
            },
            icon: <LinkIcon size={24} />,
            description: {
                fr: "24 sources académiques, techniques et réglementaires utilisées pour construire ce référentiel",
                en: "24 academic, technical and regulatory sources used to build this repository"
            },
            highlights: {
                fr: ['Sources académiques', 'Standards internationaux', 'Outils pratiques'],
                en: ['Academic sources', 'International standards', 'Practical tools']
            },
            category: 'resources',
            stats: {
                label: { fr: 'Sources', en: 'Sources' },
                value: 24
            },
            color: 'teal',
            gradient: 'from-teal-900/40 to-cyan-900/40'
        }
    ];

    const categories = [
        { id: 'all', label: { fr: 'Tout voir', en: 'View all' }, icon: <LayoutGrid size={16} />, count: SHEETS_DETAILS.length },
        { id: 'taxonomy', label: { fr: 'Taxonomies', en: 'Taxonomies' }, icon: <Binary size={16} />, count: SHEETS_DETAILS.filter(s => s.category === 'taxonomy').length },
        { id: 'data', label: { fr: 'Données', en: 'Data' }, icon: <Database size={16} />, count: SHEETS_DETAILS.filter(s => s.category === 'data').length },
        { id: 'analysis', label: { fr: 'Analyses', en: 'Analysis' }, icon: <TrendingUp size={16} />, count: SHEETS_DETAILS.filter(s => s.category === 'analysis').length },
        { id: 'resources', label: { fr: 'Ressources', en: 'Resources' }, icon: <BookOpen size={16} />, count: SHEETS_DETAILS.filter(s => s.category === 'resources').length }
    ];

    const filteredSheets = selectedCategory && selectedCategory !== 'all'
        ? SHEETS_DETAILS.filter(sheet => sheet.category === selectedCategory)
        : SHEETS_DETAILS;

    const getColorClasses = (color: string) => {
        const colors: Record<string, any> = {
            cyan: { text: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-900/30', hover: 'hover:border-cyan-400' },
            yellow: { text: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-900/30', hover: 'hover:border-yellow-400' },
            purple: { text: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-900/30', hover: 'hover:border-purple-400' },
            blue: { text: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-900/30', hover: 'hover:border-blue-400' },
            green: { text: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-900/30', hover: 'hover:border-green-400' },
            orange: { text: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-900/30', hover: 'hover:border-orange-400' },
            pink: { text: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-900/30', hover: 'hover:border-pink-400' },
            teal: { text: 'text-teal-400', border: 'border-teal-500/50', bg: 'bg-teal-900/30', hover: 'hover:border-teal-400' }
        };
        return colors[color] || colors.cyan;
    };

    return (
        <Card>
            {/* Hero Header */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-blue-900/20 rounded-lg blur-xl"></div>
                <div className="relative bg-gradient-to-r from-gray-900/90 to-gray-800/90 border border-cyan-500/30 rounded-lg p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-cyan-900/50 rounded-lg border border-cyan-500/50">
                                    <LayoutGrid size={32} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white">
                                        {language === 'fr' ? 'Table des Matières' : 'Table of Contents'}
                                    </h2>
                                    <p className="text-cyan-400 text-sm mt-1">
                                        {language === 'fr' ? 'Navigation Interactive' : 'Interactive Navigation'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed max-w-3xl">
                                {language === 'fr'
                                    ? 'Explorez un référentiel complet de risques liés à l\'intelligence artificielle, basé sur des taxonomies structurées et une base de données d\'incidents réels. Cliquez sur une section pour découvrir son contenu en détail.'
                                    : 'Explore a comprehensive repository of AI-related risks, based on structured taxonomies and a database of real incidents. Click on a section to discover its detailed content.'
                                }
                            </p>
                        </div>
                        <div className="hidden lg:flex items-center gap-6 ml-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-cyan-400 mb-1">{metadata.totalRisks}</div>
                                <div className="text-xs text-gray-400">{language === 'fr' ? 'Risques' : 'Risks'}</div>
                            </div>
                            <div className="w-px h-16 bg-gray-700"></div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-400 mb-1">8</div>
                                <div className="text-xs text-gray-400">{language === 'fr' ? 'Modules' : 'Modules'}</div>
                            </div>
                            <div className="w-px h-16 bg-gray-700"></div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-yellow-400 mb-1">43</div>
                                <div className="text-xs text-gray-400">{language === 'fr' ? 'Sources' : 'Sources'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-4 text-center">
                    <Shield size={24} className="mx-auto text-cyan-400 mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">2</div>
                    <div className="text-xs text-gray-400">{language === 'fr' ? 'Taxonomies' : 'Taxonomies'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
                    <Database size={24} className="mx-auto text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">{metadata.totalRisks.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{language === 'fr' ? 'Enregistrements' : 'Records'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4 text-center">
                    <TrendingUp size={24} className="mx-auto text-green-400 mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">3</div>
                    <div className="text-xs text-gray-400">{language === 'fr' ? 'Statistiques' : 'Statistics'}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4 text-center">
                    <BookOpen size={24} className="mx-auto text-orange-400 mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">24</div>
                    <div className="text-xs text-gray-400">{language === 'fr' ? 'Ressources' : 'Resources'}</div>
                </div>
            </div>

            {/* Category Filters */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-gray-400" />
                    <h3 className="text-white font-semibold">
                        {language === 'fr' ? 'Filtrer par catégorie' : 'Filter by category'}
                    </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                                (selectedCategory === cat.id || (selectedCategory === null && cat.id === 'all'))
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50 scale-105'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {cat.icon}
                            <span>{language === 'fr' ? cat.label.fr : cat.label.en}</span>
                            <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sheets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredSheets.map((sheet, index) => {
                    const isHovered = hoveredSheet === sheet.id;
                    const colors = getColorClasses(sheet.color);

                    return (
                        <div
                            key={sheet.id}
                            onMouseEnter={() => setHoveredSheet(sheet.id)}
                            onMouseLeave={() => setHoveredSheet(null)}
                            onClick={() => setActiveSheet(sheet.id)}
                            className={`relative group cursor-pointer transition-all duration-300 ${
                                isHovered ? 'scale-[1.02] z-10' : 'scale-100'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Glow Effect */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${sheet.gradient} rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`}></div>

                            {/* Card Content */}
                            <div className={`relative bg-gray-900/90 border ${colors.border} ${colors.hover} rounded-lg p-6 transition-all duration-300`}>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`p-3 ${colors.bg} rounded-lg border ${colors.border} ${colors.text} transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                                            {sheet.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                                {language === 'fr' ? sheet.title.fr : sheet.title.en}
                                            </h3>
                                            {sheet.stats && (
                                                <div className={`text-sm ${colors.text} font-semibold`}>
                                                    {sheet.stats.value} {language === 'fr' ? sheet.stats.label.fr : sheet.stats.label.en}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight
                                        size={24}
                                        className={`flex-shrink-0 transition-all duration-300 ${
                                            isHovered ? `${colors.text} translate-x-1` : 'text-gray-600'
                                        }`}
                                    />
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                                    {language === 'fr' ? sheet.description.fr : sheet.description.en}
                                </p>

                                {/* Highlights */}
                                <div className="space-y-2 mb-4">
                                    {(language === 'fr' ? sheet.highlights.fr : sheet.highlights.en).map((highlight, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                                            <CheckCircle size={14} className={colors.text} />
                                            <span>{highlight}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <div className={`flex items-center justify-between pt-4 border-t ${colors.border} border-opacity-50`}>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                                        {sheet.category}
                                    </span>
                                    <div className={`flex items-center gap-2 text-sm font-semibold ${colors.text} transition-all duration-300 ${
                                        isHovered ? 'gap-3' : 'gap-2'
                                    }`}>
                                        <Eye size={16} />
                                        <span>{language === 'fr' ? 'Explorer' : 'Explore'}</span>
                                        <ArrowRight size={16} className={`transition-transform duration-300 ${
                                            isHovered ? 'translate-x-1' : 'translate-x-0'
                                        }`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Access Section */}
            <div className="mt-10 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 border border-cyan-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Zap size={24} className="text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">
                        {language === 'fr' ? 'Accès Rapide Recommandé' : 'Recommended Quick Access'}
                    </h3>
                </div>
                <p className="text-gray-300 mb-4">
                    {language === 'fr'
                        ? 'Pour une découverte optimale du référentiel, nous vous recommandons de suivre ce parcours:'
                        : 'For an optimal discovery of the repository, we recommend following this path:'
                    }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => setActiveSheet('explainer')}
                        className="flex items-center gap-3 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg hover:bg-blue-900/50 transition-all group"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-bold text-sm">
                            1
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-white font-semibold text-sm">{language === 'fr' ? 'Comprendre' : 'Understand'}</div>
                            <div className="text-blue-300 text-xs">{language === 'fr' ? 'Explication' : 'Explainer'}</div>
                        </div>
                        <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => setActiveSheet('causal-taxonomy')}
                        className="flex items-center gap-3 p-4 bg-cyan-900/30 border border-cyan-500/50 rounded-lg hover:bg-cyan-900/50 transition-all group"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-full text-white font-bold text-sm">
                            2
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-white font-semibold text-sm">{language === 'fr' ? 'Explorer' : 'Explore'}</div>
                            <div className="text-cyan-300 text-xs">{language === 'fr' ? 'Taxonomies' : 'Taxonomies'}</div>
                        </div>
                        <ArrowRight size={16} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => setActiveSheet('database')}
                        className="flex items-center gap-3 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg hover:bg-purple-900/50 transition-all group"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full text-white font-bold text-sm">
                            3
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-white font-semibold text-sm">{language === 'fr' ? 'Rechercher' : 'Search'}</div>
                            <div className="text-purple-300 text-xs">{language === 'fr' ? 'Base de données' : 'Database'}</div>
                        </div>
                        <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => setActiveSheet('causal-stats')}
                        className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-500/50 rounded-lg hover:bg-green-900/50 transition-all group"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full text-white font-bold text-sm">
                            4
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-white font-semibold text-sm">{language === 'fr' ? 'Analyser' : 'Analyze'}</div>
                            <div className="text-green-300 text-xs">{language === 'fr' ? 'Statistiques' : 'Statistics'}</div>
                        </div>
                        <ArrowRight size={16} className="text-green-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-8 flex items-start gap-4 p-5 bg-gray-900/50 border border-gray-700 rounded-lg">
                <Info size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">
                        {language === 'fr' ? 'À propos de ce référentiel' : 'About this repository'}
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {language === 'fr'
                            ? 'Ce référentiel compile des recherches académiques sur les risques de l\'IA depuis 2015. Chaque module offre une perspective unique pour analyser, comprendre et anticiper les risques potentiels des systèmes d\'intelligence artificielle.'
                            : 'This repository compiles academic research on AI risks since 2015. Each module offers a unique perspective to analyze, understand and anticipate potential risks of artificial intelligence systems.'
                        }
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default ContentsView;
