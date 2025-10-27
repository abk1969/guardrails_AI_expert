import React, { useState, useMemo, useCallback } from 'react';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Database,
    FileText,
    Table,
    Info,
    Globe,
    Mail,
    FileCheck,
    Sparkles,
    Play,
    MousePointerClick,
    ArrowRight,
    Check,
    BookOpen,
    Lightbulb,
    Target,
    Layers,
    Zap
} from 'lucide-react';

const RiskDatabaseExplainerView: React.FC = () => {
    const { setSearchQuery, setFilters, metadata, allRisks } = useAIRiskRepository();
    const { language } = useLanguage();
    const [activeSection, setActiveSection] = useState<string>('intro');
    const [hoveredExample, setHoveredExample] = useState<string | null>(null);

    // Navigate to database with filters
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

    // Interactive examples with real risk data
    const interactiveExamples = useMemo(() => [
        {
            id: 'example-1',
            title: {
                fr: 'Hallucinations des LLM',
                en: 'LLM Hallucinations'
            },
            description: {
                fr: 'Les modèles de langage génèrent du contenu factuel incorrectement',
                en: 'Language models generate factually incorrect content'
            },
            icon: <Sparkles size={24} />,
            color: 'from-yellow-600 to-orange-600',
            borderColor: 'border-yellow-500',
            filters: {
                domain: ['Désinformation'],
                subdomain: ['3.1']
            },
            riskCount: allRisks.filter(r =>
                r.domain.category === 'Désinformation' &&
                r.domain.subcategory?.includes('3.1')
            ).length
        },
        {
            id: 'example-2',
            title: {
                fr: 'Discrimination Algorithmique',
                en: 'Algorithmic Discrimination'
            },
            description: {
                fr: 'Les systèmes d\'IA discriminent injustement certains groupes',
                en: 'AI systems unfairly discriminate against certain groups'
            },
            icon: <Target size={24} />,
            color: 'from-red-600 to-pink-600',
            borderColor: 'border-red-500',
            filters: {
                domain: ['Discrimination et Toxicité']
            },
            riskCount: allRisks.filter(r =>
                r.domain.category === 'Discrimination et Toxicité'
            ).length
        },
        {
            id: 'example-3',
            title: {
                fr: 'Violations de la Vie Privée',
                en: 'Privacy Violations'
            },
            description: {
                fr: 'Fuite ou inférence d\'informations sensibles',
                en: 'Leaking or inferring sensitive information'
            },
            icon: <Layers size={24} />,
            color: 'from-purple-600 to-indigo-600',
            borderColor: 'border-purple-500',
            filters: {
                domain: ['Vie Privée et Sécurité']
            },
            riskCount: allRisks.filter(r =>
                r.domain.category === 'Vie Privée et Sécurité'
            ).length
        },
        {
            id: 'example-4',
            title: {
                fr: 'Utilisation Malveillante',
                en: 'Malicious Use'
            },
            description: {
                fr: 'Utilisation intentionnelle de l\'IA à des fins nuisibles',
                en: 'Intentional use of AI for harmful purposes'
            },
            icon: <Zap size={24} />,
            color: 'from-orange-600 to-red-600',
            borderColor: 'border-orange-500',
            filters: {
                domain: ['Acteurs Malveillants et Utilisation Abusive'],
                intentionality: ['Intentionnel']
            },
            riskCount: allRisks.filter(r =>
                r.domain.category === 'Acteurs Malveillants et Utilisation Abusive' &&
                r.causal.intentionality === 'Intentionnel'
            ).length
        }
    ], [allRisks]);

    // Database field explanations
    const databaseFields = useMemo(() => [
        {
            name: 'ID',
            description: {
                fr: 'Identifiant unique du risque (ex: RISK-0001)',
                en: 'Unique risk identifier (e.g., RISK-0001)'
            },
            type: 'metadata'
        },
        {
            name: 'Title',
            description: {
                fr: 'Titre du document source',
                en: 'Title of the source document'
            },
            type: 'metadata'
        },
        {
            name: 'Description',
            description: {
                fr: 'Description détaillée du risque',
                en: 'Detailed description of the risk'
            },
            type: 'core'
        },
        {
            name: 'Entity',
            description: {
                fr: 'Acteur à l\'origine (IA, Humain, Autre)',
                en: 'Entity responsible (AI, Human, Other)'
            },
            type: 'causal',
            color: 'text-cyan-400'
        },
        {
            name: 'Intent',
            description: {
                fr: 'Intentionnalité (Intentionnel, Non intentionnel)',
                en: 'Intentionality (Intentional, Unintentional)'
            },
            type: 'causal',
            color: 'text-cyan-400'
        },
        {
            name: 'Timing',
            description: {
                fr: 'Moment (Pré-déploiement, Post-déploiement)',
                en: 'Timing (Pre-deployment, Post-deployment)'
            },
            type: 'causal',
            color: 'text-cyan-400'
        },
        {
            name: 'Domain',
            description: {
                fr: 'Domaine de risque (1 parmi 7)',
                en: 'Risk domain (1 of 7)'
            },
            type: 'domain',
            color: 'text-purple-400'
        },
        {
            name: 'Sub-domain',
            description: {
                fr: 'Sous-domaine de risque (1 parmi 23)',
                en: 'Risk sub-domain (1 of 23)'
            },
            type: 'domain',
            color: 'text-purple-400'
        }
    ], []);

    // Learning path sections
    const learningSections = useMemo(() => [
        {
            id: 'intro',
            title: { fr: 'Introduction', en: 'Introduction' },
            icon: <BookOpen size={20} />,
            color: 'bg-cyan-600'
        },
        {
            id: 'structure',
            title: { fr: 'Structure', en: 'Structure' },
            icon: <Table size={20} />,
            color: 'bg-purple-600'
        },
        {
            id: 'taxonomies',
            title: { fr: 'Taxonomies', en: 'Taxonomies' },
            icon: <Layers size={20} />,
            color: 'bg-indigo-600'
        },
        {
            id: 'examples',
            title: { fr: 'Exemples', en: 'Examples' },
            icon: <Lightbulb size={20} />,
            color: 'bg-yellow-600'
        }
    ], []);

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-cyan-900/50 via-purple-900/50 to-indigo-900/50 border border-cyan-700/50 rounded-lg p-8">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-cyan-600/20 rounded-lg">
                        <Info size={48} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-3">
                            {language === 'fr'
                                ? 'Guide Interactif de la Base de Données'
                                : 'Interactive Database Guide'
                            }
                        </h2>
                        <p className="text-lg text-gray-300 mb-4">
                            {language === 'fr'
                                ? 'Découvrez comment naviguer et utiliser la base de 1,350 risques IA à travers des exemples interactifs'
                                : 'Discover how to navigate and use the database of 1,350 AI risks through interactive examples'
                            }
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="bg-cyan-600/20 px-4 py-2 rounded-lg border border-cyan-500/30">
                                <span className="text-cyan-300 font-semibold">{metadata.totalRisks}</span>
                                <span className="text-gray-400 ml-2">
                                    {language === 'fr' ? 'risques' : 'risks'}
                                </span>
                            </div>
                            <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
                                <span className="text-purple-300 font-semibold">2</span>
                                <span className="text-gray-400 ml-2">
                                    {language === 'fr' ? 'taxonomies' : 'taxonomies'}
                                </span>
                            </div>
                            <div className="bg-indigo-600/20 px-4 py-2 rounded-lg border border-indigo-500/30">
                                <span className="text-indigo-300 font-semibold">65</span>
                                <span className="text-gray-400 ml-2">
                                    {language === 'fr' ? 'sources' : 'sources'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Path Navigation */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Play size={20} className="text-cyan-400" />
                    {language === 'fr' ? 'Parcours Guidé' : 'Guided Tour'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {learningSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-300 ${
                                activeSection === section.id
                                    ? `${section.color} text-white shadow-lg scale-105`
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {section.icon}
                            <span className="font-medium text-sm">
                                {language === 'fr' ? section.title.fr : section.title.en}
                            </span>
                            {activeSection === section.id && <Check size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            {activeSection === 'intro' && (
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            {language === 'fr' ? 'À Propos de la Base de Données' : 'About the Database'}
                        </h3>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            {language === 'fr'
                                ? 'Cette base de données contient 1,350 risques d\'IA extraits de 65 frameworks et documents de recherche. Chaque risque est catégorisé selon deux taxonomies complémentaires pour une analyse complète.'
                                : 'This database contains 1,350 AI risks extracted from 65 frameworks and research documents. Each risk is categorized according to two complementary taxonomies for comprehensive analysis.'
                            }
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-cyan-900/20 border border-cyan-700/50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={20} className="text-cyan-400" />
                                    <h4 className="font-semibold text-cyan-300">
                                        {language === 'fr' ? 'Taxonomie Causale' : 'Causal Taxonomy'}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-300">
                                    {language === 'fr'
                                        ? '3 dimensions : Entité, Intentionnalité, Temporalité'
                                        : '3 dimensions: Entity, Intentionality, Timing'
                                    }
                                </p>
                            </div>
                            <div className="bg-purple-900/20 border border-purple-700/50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers size={20} className="text-purple-400" />
                                    <h4 className="font-semibold text-purple-300">
                                        {language === 'fr' ? 'Taxonomie par Domaine' : 'Domain Taxonomy'}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-300">
                                    {language === 'fr'
                                        ? '7 domaines thématiques, 23 sous-domaines'
                                        : '7 thematic domains, 23 sub-domains'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'structure' && (
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Table size={24} className="text-cyan-400" />
                            {language === 'fr' ? 'Structure de la Base' : 'Database Structure'}
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {language === 'fr'
                                ? 'Chaque risque dans la base de données contient les champs suivants :'
                                : 'Each risk in the database contains the following fields:'
                            }
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {databaseFields.map((field) => (
                                <div
                                    key={field.name}
                                    className={`bg-gray-800/50 border ${
                                        field.type === 'causal' ? 'border-cyan-700/50' :
                                        field.type === 'domain' ? 'border-purple-700/50' :
                                        'border-gray-700'
                                    } p-4 rounded-lg hover:scale-105 transition-transform duration-300`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-mono font-semibold ${field.color || 'text-white'}`}>
                                            {field.name}
                                        </span>
                                        {field.type === 'causal' && (
                                            <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded">
                                                Causal
                                            </span>
                                        )}
                                        {field.type === 'domain' && (
                                            <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                                                Domain
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {language === 'fr' ? field.description.fr : field.description.en}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'taxonomies' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-700/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Layers size={24} className="text-cyan-400" />
                            {language === 'fr' ? 'Les Deux Taxonomies' : 'The Two Taxonomies'}
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Causal Taxonomy Card */}
                            <div className="bg-gray-900/70 border border-cyan-700/50 p-6 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-cyan-600/20 rounded">
                                        <Database size={24} className="text-cyan-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-cyan-300">
                                        {language === 'fr' ? 'Taxonomie Causale' : 'Causal Taxonomy'}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-300 mb-4">
                                    {language === 'fr'
                                        ? 'Analyse les facteurs causaux derrière chaque risque'
                                        : 'Analyzes the causal factors behind each risk'
                                    }
                                </p>
                                <div className="space-y-3">
                                    <div className="bg-gray-800/50 p-3 rounded">
                                        <div className="font-semibold text-white text-sm mb-1">
                                            {language === 'fr' ? 'Entité' : 'Entity'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            IA • Humain • Autre
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded">
                                        <div className="font-semibold text-white text-sm mb-1">
                                            {language === 'fr' ? 'Intentionnalité' : 'Intentionality'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {language === 'fr' ? 'Intentionnel • Non intentionnel' : 'Intentional • Unintentional'}
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded">
                                        <div className="font-semibold text-white text-sm mb-1">
                                            {language === 'fr' ? 'Temporalité' : 'Timing'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {language === 'fr' ? 'Pré-déploiement • Post-déploiement' : 'Pre-deployment • Post-deployment'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Domain Taxonomy Card */}
                            <div className="bg-gray-900/70 border border-purple-700/50 p-6 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-600/20 rounded">
                                        <Layers size={24} className="text-purple-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-purple-300">
                                        {language === 'fr' ? 'Taxonomie par Domaine' : 'Domain Taxonomy'}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-300 mb-4">
                                    {language === 'fr'
                                        ? 'Classe les risques par domaines thématiques'
                                        : 'Classifies risks by thematic domains'
                                    }
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-gray-300">
                                            {language === 'fr' ? 'Discrimination & Toxicité' : 'Discrimination & Toxicity'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-gray-300">
                                            {language === 'fr' ? 'Vie Privée & Sécurité' : 'Privacy & Security'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-gray-300">
                                            {language === 'fr' ? 'Désinformation' : 'Misinformation'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-gray-300">
                                            {language === 'fr' ? 'Acteurs Malveillants' : 'Malicious Actors'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {language === 'fr' ? '+ 3 autres domaines' : '+ 3 more domains'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'examples' && (
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Lightbulb size={24} className="text-yellow-400" />
                            {language === 'fr' ? 'Exemples Interactifs' : 'Interactive Examples'}
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {language === 'fr'
                                ? 'Cliquez sur un exemple pour filtrer automatiquement la base de données et voir les risques correspondants :'
                                : 'Click on an example to automatically filter the database and see the corresponding risks:'
                            }
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {interactiveExamples.map((example) => (
                                <button
                                    key={example.id}
                                    onClick={() => navigateToDatabase(example.filters)}
                                    onMouseEnter={() => setHoveredExample(example.id)}
                                    onMouseLeave={() => setHoveredExample(null)}
                                    className={`group relative bg-gradient-to-br ${example.color} bg-opacity-10 border-2 ${example.borderColor} rounded-lg p-6 text-left transition-all duration-300 ${
                                        hoveredExample === example.id
                                            ? 'scale-105 shadow-2xl ring-2 ring-white/50'
                                            : 'hover:scale-102'
                                    }`}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${example.color} ${
                                            hoveredExample === example.id ? 'scale-110' : ''
                                        } transition-transform duration-300`}>
                                            {example.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-white mb-2">
                                                {language === 'fr' ? example.title.fr : example.title.en}
                                            </h4>
                                            <p className="text-sm text-gray-300 mb-3">
                                                {language === 'fr' ? example.description.fr : example.description.en}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white font-semibold">
                                                    {example.riskCount} {language === 'fr' ? 'risques' : 'risks'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 text-white transition-all ${
                                        hoveredExample === example.id ? 'translate-x-2' : ''
                                    }`}>
                                        <MousePointerClick size={16} />
                                        <span className="text-sm font-medium">
                                            {language === 'fr' ? 'Cliquer pour explorer' : 'Click to explore'}
                                        </span>
                                        <ArrowRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-cyan-400" />
                    {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => {
                            const tab = document.querySelector('[data-tab="database"]') as HTMLElement;
                            if (tab) tab.click();
                        }}
                        className="bg-gray-800/50 hover:bg-gray-700 border border-gray-700 p-4 rounded-lg transition-all duration-300 hover:scale-105 group"
                    >
                        <Database size={24} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-white font-semibold mb-1">
                            {language === 'fr' ? 'Explorer la Base' : 'Explore Database'}
                        </div>
                        <div className="text-xs text-gray-400">
                            {language === 'fr' ? 'Voir tous les risques' : 'View all risks'}
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            const tab = document.querySelector('[data-tab="causal-taxonomy"]') as HTMLElement;
                            if (tab) tab.click();
                        }}
                        className="bg-gray-800/50 hover:bg-gray-700 border border-gray-700 p-4 rounded-lg transition-all duration-300 hover:scale-105 group"
                    >
                        <Layers size={24} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-white font-semibold mb-1">
                            {language === 'fr' ? 'Taxonomie Causale' : 'Causal Taxonomy'}
                        </div>
                        <div className="text-xs text-gray-400">
                            {language === 'fr' ? 'Analyser par facteurs' : 'Analyze by factors'}
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            const tab = document.querySelector('[data-tab="domain-taxonomy"]') as HTMLElement;
                            if (tab) tab.click();
                        }}
                        className="bg-gray-800/50 hover:bg-gray-700 border border-gray-700 p-4 rounded-lg transition-all duration-300 hover:scale-105 group"
                    >
                        <FileCheck size={24} className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-white font-semibold mb-1">
                            {language === 'fr' ? 'Taxonomie Domaine' : 'Domain Taxonomy'}
                        </div>
                        <div className="text-xs text-gray-400">
                            {language === 'fr' ? 'Analyser par domaines' : 'Analyze by domains'}
                        </div>
                    </button>
                </div>
            </div>

            {/* Resources & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">
                            {language === 'fr' ? 'Plus d\'Informations' : 'More Information'}
                        </h3>
                    </div>
                    <a
                        href="https://airisk.mit.edu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors underline flex items-center gap-2"
                    >
                        <Globe size={16} />
                        https://airisk.mit.edu/
                        <ArrowRight size={16} />
                    </a>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail size={20} className="text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">
                            {language === 'fr' ? 'Contact' : 'Contact'}
                        </h3>
                    </div>
                    <a
                        href="mailto:pslat@mit.edu"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
                    >
                        <Mail size={16} />
                        pslat@mit.edu
                    </a>
                </div>
            </div>

            {/* Citation */}
            <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">
                        {language === 'fr' ? 'Citation' : 'Citation'}
                    </h3>
                </div>
                <div className="bg-gray-800/50 p-4 rounded font-mono text-xs text-gray-300 leading-relaxed">
                    Slattery, P., Saeri, A. K., Grundy, E. A. C., Graham, J., Noetel, M., Uuk, R., Dao, J., Pour, S., Casper, S., & Thompson, N. (2024). A systematic evidence review and common frame of reference for the risks from artificial intelligence. https://doi.org/10.48550/arXiv.2408.12622
                </div>
            </div>

            {/* Footer */}
            <div className="bg-cyan-900/20 border border-cyan-500/50 p-4 rounded-lg text-center">
                <p className="text-sm text-cyan-300">
                    {language === 'fr'
                        ? 'Ce travail est sous licence CC BY 4.0'
                        : 'This work is licensed under CC BY 4.0'
                    }
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Source: MIT AI Risk Repository V3 | {metadata.lastUpdated}
                </p>
            </div>
        </div>
    );
};

export default RiskDatabaseExplainerView;
