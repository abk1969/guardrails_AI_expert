import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    FileText,
    Globe,
    Download,
    ExternalLink,
    BookOpen,
    Video,
    Mail,
    Github,
    FileCode,
    Database,
    Search,
    Filter,
    X,
    Link as LinkIcon,
    Award,
    Users,
    Calendar,
    Tag,
    ArrowUpRight
} from 'lucide-react';

interface Resource {
    id: string;
    title: string;
    type: 'paper' | 'website' | 'video' | 'dataset' | 'code' | 'documentation' | 'report';
    url: string;
    description: string;
    tags: string[];
    year?: number;
    authors?: string;
    organization?: string;
}

const IncludedResourcesView: React.FC = () => {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Comprehensive resource database
    const resources: Resource[] = [
        // Main Repository Resources
        {
            id: 'main-repo',
            title: 'AI Risk Repository Database',
            type: 'database',
            url: 'https://airisk.mit.edu/',
            description: language === 'fr'
                ? 'Base de données complète de 1,350+ risques d\'IA provenant de 43 sources documentées. Inclut les taxonomies causales et par domaine.'
                : 'Comprehensive database of 1,350+ AI risks from 43 documented sources. Includes causal and domain taxonomies.',
            tags: ['Primary', 'Database', 'Taxonomies'],
            year: 2025,
            organization: 'MIT FutureTech'
        },
        {
            id: 'main-paper',
            title: 'A systematic evidence review and common frame of reference for the risks from artificial intelligence',
            type: 'paper',
            url: 'https://doi.org/10.48550/arXiv.2408.12622',
            description: language === 'fr'
                ? 'Revue systématique des preuves et cadre de référence commun pour les risques de l\'IA. Article de recherche principal décrivant la méthodologie et les résultats.'
                : 'Systematic evidence review and common frame of reference for AI risks. Main research paper describing methodology and findings.',
            tags: ['Primary', 'Research', 'Methodology'],
            year: 2024,
            authors: 'Slattery, P., Saeri, A. K., Grundy, E. A. C., et al.'
        },

        // Key Source Papers
        {
            id: 'weidinger-2021',
            title: 'Ethical and social risks of harm from Language Models',
            type: 'paper',
            url: 'https://arxiv.org/abs/2112.04359',
            description: language === 'fr'
                ? 'Taxonomie fondamentale des risques éthiques et sociaux des modèles de langage. Base pour la taxonomie par domaine.'
                : 'Foundational taxonomy of ethical and social risks from language models. Basis for domain taxonomy.',
            tags: ['Source', 'Ethics', 'Language Models', 'Taxonomy'],
            year: 2021,
            authors: 'Weidinger, L., Mellor, J., Rauh, M., et al.',
            organization: 'DeepMind'
        },
        {
            id: 'critch-2023',
            title: 'TASRA: a Taxonomy and Analysis of Societal-Scale Risks from AI',
            type: 'paper',
            url: 'https://arxiv.org/abs/2306.06924',
            description: language === 'fr'
                ? 'Taxonomie et analyse des risques sociétaux à grande échelle de l\'IA. Focus sur les impacts systémiques.'
                : 'Taxonomy and analysis of societal-scale risks from AI. Focus on systemic impacts.',
            tags: ['Source', 'Societal Impact', 'Taxonomy'],
            year: 2023,
            authors: 'Critch, A., Russell, S.'
        },
        {
            id: 'hendrycks-2022',
            title: 'X-Risk Analysis for AI Research',
            type: 'paper',
            url: 'https://arxiv.org/abs/2206.05862',
            description: language === 'fr'
                ? 'Analyse des risques existentiels dans la recherche en IA. Évalue les menaces catastrophiques.'
                : 'X-risk analysis for AI research. Evaluates catastrophic threats.',
            tags: ['Source', 'Existential Risk', 'Safety'],
            year: 2022,
            authors: 'Hendrycks, D., Mazeika, M.',
            organization: 'Center for AI Safety'
        },
        {
            id: 'solaiman-2023',
            title: 'The Gradient of Generative AI Release: Methods and Considerations',
            type: 'paper',
            url: 'https://arxiv.org/abs/2302.04844',
            description: language === 'fr'
                ? 'Méthodes et considérations pour la publication d\'IA générative. Analyse des stratégies de déploiement.'
                : 'Methods and considerations for generative AI release. Analysis of deployment strategies.',
            tags: ['Source', 'Deployment', 'Generative AI', 'Governance'],
            year: 2023,
            authors: 'Solaiman, I.'
        },

        // Safety and Alignment
        {
            id: 'anthropic-constitutional',
            title: 'Constitutional AI: Harmlessness from AI Feedback',
            type: 'paper',
            url: 'https://arxiv.org/abs/2212.08073',
            description: language === 'fr'
                ? 'Approche d\'alignement utilisant des principes constitutionnels et le feedback d\'IA pour réduire les comportements nuisibles.'
                : 'Alignment approach using constitutional principles and AI feedback to reduce harmful behaviors.',
            tags: ['Safety', 'Alignment', 'RLHF'],
            year: 2022,
            authors: 'Bai, Y., Kadavath, S., et al.',
            organization: 'Anthropic'
        },
        {
            id: 'nist-ai-rmf',
            title: 'NIST AI Risk Management Framework',
            type: 'documentation',
            url: 'https://www.nist.gov/itl/ai-risk-management-framework',
            description: language === 'fr'
                ? 'Cadre de gestion des risques de l\'IA du NIST. Standard pour l\'évaluation et la gestion des risques d\'IA.'
                : 'NIST AI Risk Management Framework. Standard for AI risk assessment and management.',
            tags: ['Framework', 'Standards', 'Governance'],
            year: 2023,
            organization: 'NIST'
        },

        // Bias and Fairness
        {
            id: 'mehrabi-2021',
            title: 'A Survey on Bias and Fairness in Machine Learning',
            type: 'paper',
            url: 'https://arxiv.org/abs/1908.09635',
            description: language === 'fr'
                ? 'Enquête complète sur les biais et l\'équité dans l\'apprentissage automatique. Couvre la détection et l\'atténuation.'
                : 'Comprehensive survey on bias and fairness in machine learning. Covers detection and mitigation.',
            tags: ['Bias', 'Fairness', 'Survey'],
            year: 2021,
            authors: 'Mehrabi, N., Morstatter, F., et al.'
        },
        {
            id: 'buolamwini-2018',
            title: 'Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification',
            type: 'paper',
            url: 'http://proceedings.mlr.press/v81/buolamwini18a.html',
            description: language === 'fr'
                ? 'Étude révélant les disparités de précision intersectionnelles dans la classification de genre commerciale.'
                : 'Study revealing intersectional accuracy disparities in commercial gender classification.',
            tags: ['Bias', 'Discrimination', 'Computer Vision'],
            year: 2018,
            authors: 'Buolamwini, J., Gebru, T.',
            organization: 'MIT Media Lab'
        },

        // Privacy and Security
        {
            id: 'carlini-2023',
            title: 'Extracting Training Data from Large Language Models',
            type: 'paper',
            url: 'https://arxiv.org/abs/2012.07805',
            description: language === 'fr'
                ? 'Démonstration de l\'extraction de données d\'entraînement à partir de grands modèles de langage. Risques de confidentialité.'
                : 'Demonstration of extracting training data from large language models. Privacy risks.',
            tags: ['Privacy', 'Security', 'Language Models'],
            year: 2023,
            authors: 'Carlini, N., Tramer, F., et al.'
        },
        {
            id: 'zou-2023',
            title: 'Universal and Transferable Adversarial Attacks on Aligned Language Models',
            type: 'paper',
            url: 'https://arxiv.org/abs/2307.15043',
            description: language === 'fr'
                ? 'Attaques adversariales universelles sur les modèles de langage alignés. Implications pour la sécurité.'
                : 'Universal adversarial attacks on aligned language models. Security implications.',
            tags: ['Security', 'Adversarial', 'Language Models'],
            year: 2023,
            authors: 'Zou, A., Wang, Z., et al.'
        },

        // Misinformation and Deepfakes
        {
            id: 'bommasani-2021',
            title: 'On the Opportunities and Risks of Foundation Models',
            type: 'report',
            url: 'https://arxiv.org/abs/2108.07258',
            description: language === 'fr'
                ? 'Rapport complet sur les opportunités et les risques des modèles de fondation. Couvre la désinformation, les biais, et plus.'
                : 'Comprehensive report on opportunities and risks of foundation models. Covers misinformation, bias, and more.',
            tags: ['Foundation Models', 'Survey', 'Comprehensive'],
            year: 2021,
            authors: 'Bommasani, R., Hudson, D.A., et al.',
            organization: 'Stanford HAI'
        },
        {
            id: 'tolosana-2020',
            title: 'DeepFakes and Beyond: A Survey of Face Manipulation and Fake Detection',
            type: 'paper',
            url: 'https://arxiv.org/abs/2001.00179',
            description: language === 'fr'
                ? 'Enquête sur la manipulation de visages et la détection de deepfakes. État de l\'art des techniques.'
                : 'Survey on face manipulation and deepfake detection. State-of-the-art techniques.',
            tags: ['Deepfakes', 'Misinformation', 'Computer Vision'],
            year: 2020,
            authors: 'Tolosana, R., Vera-Rodriguez, R., et al.'
        },

        // Socioeconomic Impact
        {
            id: 'acemoglu-2020',
            title: 'Artificial Intelligence, Automation, and Work',
            type: 'paper',
            url: 'https://www.nber.org/papers/w24196',
            description: language === 'fr'
                ? 'Analyse économique de l\'impact de l\'IA sur l\'emploi et l\'automatisation. Implications socioéconomiques.'
                : 'Economic analysis of AI impact on employment and automation. Socioeconomic implications.',
            tags: ['Economics', 'Employment', 'Automation'],
            year: 2020,
            authors: 'Acemoglu, D., Restrepo, P.',
            organization: 'MIT'
        },
        {
            id: 'bender-2021',
            title: 'On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?',
            type: 'paper',
            url: 'https://dl.acm.org/doi/10.1145/3442188.3445922',
            description: language === 'fr'
                ? 'Critique des grands modèles de langage et de leurs coûts environnementaux et sociétaux.'
                : 'Critique of large language models and their environmental and societal costs.',
            tags: ['Environment', 'Ethics', 'Language Models'],
            year: 2021,
            authors: 'Bender, E.M., Gebru, T., et al.'
        },

        // Tools and Datasets
        {
            id: 'github-repo',
            title: 'AI Risk Repository - GitHub',
            type: 'code',
            url: 'https://github.com/mit-futuretech/airisk',
            description: language === 'fr'
                ? 'Dépôt GitHub officiel avec les données, les scripts de traitement et la documentation.'
                : 'Official GitHub repository with data, processing scripts, and documentation.',
            tags: ['Code', 'Data', 'Open Source'],
            year: 2025,
            organization: 'MIT FutureTech'
        },
        {
            id: 'ai-incident-db',
            title: 'AI Incident Database',
            type: 'database',
            url: 'https://incidentdatabase.ai/',
            description: language === 'fr'
                ? 'Base de données d\'incidents d\'IA réels documentant les défaillances et les préjudices.'
                : 'Database of real AI incidents documenting failures and harms.',
            tags: ['Database', 'Incidents', 'Case Studies'],
            organization: 'Responsible AI Collaborative'
        },

        // Standards and Guidelines
        {
            id: 'eu-ai-act',
            title: 'EU AI Act',
            type: 'documentation',
            url: 'https://artificialintelligenceact.eu/',
            description: language === 'fr'
                ? 'Cadre réglementaire de l\'UE pour l\'IA. Première législation complète sur l\'IA.'
                : 'EU regulatory framework for AI. First comprehensive AI legislation.',
            tags: ['Regulation', 'Policy', 'EU'],
            year: 2024,
            organization: 'European Union'
        },
        {
            id: 'oecd-principles',
            title: 'OECD AI Principles',
            type: 'documentation',
            url: 'https://oecd.ai/en/ai-principles',
            description: language === 'fr'
                ? 'Principes de l\'OCDE sur l\'IA. Standards internationaux pour une IA responsable.'
                : 'OECD AI Principles. International standards for responsible AI.',
            tags: ['Principles', 'Standards', 'International'],
            year: 2019,
            organization: 'OECD'
        },

        // Educational Resources
        {
            id: 'mit-course',
            title: 'MIT Course: AI Safety and Alignment',
            type: 'video',
            url: 'https://alignment.mit.edu/',
            description: language === 'fr'
                ? 'Cours MIT sur la sécurité et l\'alignement de l\'IA. Ressources éducatives complètes.'
                : 'MIT course on AI safety and alignment. Comprehensive educational resources.',
            tags: ['Education', 'Course', 'Safety'],
            organization: 'MIT'
        }
    ];

    // Get unique tags and types
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        resources.forEach(r => r.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, []);

    const resourceTypes = [
        { id: 'paper', label: language === 'fr' ? 'Articles' : 'Papers', icon: <FileText size={16} />, count: resources.filter(r => r.type === 'paper').length },
        { id: 'website', label: language === 'fr' ? 'Sites Web' : 'Websites', icon: <Globe size={16} />, count: resources.filter(r => r.type === 'website').length },
        { id: 'video', label: language === 'fr' ? 'Vidéos' : 'Videos', icon: <Video size={16} />, count: resources.filter(r => r.type === 'video').length },
        { id: 'dataset', label: language === 'fr' ? 'Données' : 'Datasets', icon: <Database size={16} />, count: resources.filter(r => r.type === 'dataset').length },
        { id: 'code', label: 'Code', icon: <FileCode size={16} />, count: resources.filter(r => r.type === 'code').length },
        { id: 'documentation', label: 'Docs', icon: <BookOpen size={16} />, count: resources.filter(r => r.type === 'documentation').length },
        { id: 'report', label: language === 'fr' ? 'Rapports' : 'Reports', icon: <Award size={16} />, count: resources.filter(r => r.type === 'report').length },
    ];

    // Filter resources
    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            const matchesSearch = !searchQuery ||
                resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resource.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesType = !selectedType || resource.type === selectedType;
            const matchesTag = !selectedTag || resource.tags.includes(selectedTag);

            return matchesSearch && matchesType && matchesTag;
        });
    }, [resources, searchQuery, selectedType, selectedTag]);

    // Get icon for resource type
    const getTypeIcon = (type: Resource['type']) => {
        switch (type) {
            case 'paper': return <FileText size={18} />;
            case 'website': return <Globe size={18} />;
            case 'video': return <Video size={18} />;
            case 'dataset': return <Database size={18} />;
            case 'code': return <FileCode size={18} />;
            case 'documentation': return <BookOpen size={18} />;
            case 'report': return <Award size={18} />;
            default: return <LinkIcon size={18} />;
        }
    };

    // Get color for resource type
    const getTypeColor = (type: Resource['type']) => {
        switch (type) {
            case 'paper': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
            case 'website': return 'text-green-400 bg-green-900/30 border-green-500/50';
            case 'video': return 'text-red-400 bg-red-900/30 border-red-500/50';
            case 'dataset': return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
            case 'code': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
            case 'documentation': return 'text-cyan-400 bg-cyan-900/30 border-cyan-500/50';
            case 'report': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
            default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
        }
    };

    return (
        <Card>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <LinkIcon size={28} className="text-cyan-400" />
                        {language === 'fr' ? 'Ressources Incluses' : 'Included Resources'}
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                        {language === 'fr'
                            ? `${resources.length} ressources documentées provenant de sources académiques, industrielles et réglementaires`
                            : `${resources.length} documented resources from academic, industry, and regulatory sources`
                        }
                    </p>
                </div>
            </div>

            {/* Statistics Banner */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/20 border border-cyan-500/50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">{resources.length}</div>
                        <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Ressources Totales' : 'Total Resources'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">{resources.filter(r => r.type === 'paper').length}</div>
                        <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Articles de Recherche' : 'Research Papers'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">{new Set(resources.flatMap(r => r.tags)).size}</div>
                        <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Thématiques' : 'Topics'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{new Set(resources.filter(r => r.organization).map(r => r.organization)).size}</div>
                        <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Organisations' : 'Organizations'}</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-8">
                {/* Search Bar */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={language === 'fr' ? 'Rechercher par titre, auteur, organisation, ou tag...' : 'Search by title, author, organization, or tag...'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border-gray-600 rounded-md py-3 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>

                {/* Type Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <Filter size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400 mr-2">{language === 'fr' ? 'Type:' : 'Type:'}</span>
                    {resourceTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                selectedType === type.id
                                    ? 'bg-cyan-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {type.icon}
                            <span>{type.label}</span>
                            <span className="ml-1 text-xs opacity-75">({type.count})</span>
                        </button>
                    ))}
                </div>

                {/* Tag Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <Tag size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400 mr-2">{language === 'fr' ? 'Tags:' : 'Tags:'}</span>
                    {allTags.slice(0, 10).map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                selectedTag === tag
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Active Filters */}
                {(selectedType || selectedTag || searchQuery) && (
                    <div className="flex items-center gap-2 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-md">
                        <span className="text-sm text-cyan-300">
                            {language === 'fr' ? 'Filtres actifs:' : 'Active filters:'}
                        </span>
                        {searchQuery && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-cyan-700/50 text-cyan-100 text-xs rounded">
                                Search: "{searchQuery}"
                                <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
                            </span>
                        )}
                        {selectedType && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-cyan-700/50 text-cyan-100 text-xs rounded">
                                Type: {resourceTypes.find(t => t.id === selectedType)?.label}
                                <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedType(null)} />
                            </span>
                        )}
                        {selectedTag && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-cyan-700/50 text-cyan-100 text-xs rounded">
                                Tag: {selectedTag}
                                <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedTag(null)} />
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedType(null);
                                setSelectedTag(null);
                            }}
                            className="ml-auto text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                            {language === 'fr' ? 'Réinitialiser tout' : 'Reset all'}
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-sm text-gray-400">
                    {language === 'fr'
                        ? `${filteredResources.length} ressource${filteredResources.length !== 1 ? 's' : ''} trouvée${filteredResources.length !== 1 ? 's' : ''}`
                        : `${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''} found`
                    }
                </p>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredResources.map(resource => (
                    <div
                        key={resource.id}
                        className={`border rounded-lg p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${getTypeColor(resource.type)}`}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 mt-1">
                                {getTypeIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold leading-tight mb-1 line-clamp-2">
                                    {resource.title}
                                </h3>
                                {resource.authors && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                        <Users size={12} />
                                        <span className="line-clamp-1">{resource.authors}</span>
                                    </div>
                                )}
                                {resource.organization && (
                                    <div className="text-xs text-gray-400 mb-1">
                                        {resource.organization}
                                    </div>
                                )}
                                {resource.year && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar size={12} />
                                        <span>{resource.year}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                            {resource.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                            {resource.tags.map(tag => (
                                <span
                                    key={tag}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTag(tag);
                                    }}
                                    className="px-2 py-0.5 bg-gray-900/50 text-gray-300 text-xs rounded hover:bg-gray-900 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Action Button */}
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/80 hover:bg-gray-900 text-white text-sm font-medium rounded-md transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={14} />
                            {language === 'fr' ? 'Accéder' : 'Access'}
                            <ArrowUpRight size={14} />
                        </a>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredResources.length === 0 && (
                <div className="text-center py-16">
                    <Search size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                        {language === 'fr' ? 'Aucune ressource trouvée' : 'No resources found'}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                        {language === 'fr'
                            ? 'Essayez de modifier vos critères de recherche ou de réinitialiser les filtres'
                            : 'Try adjusting your search criteria or resetting filters'
                        }
                    </p>
                    <Button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedType(null);
                            setSelectedTag(null);
                        }}
                        variant="primary"
                    >
                        {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
                    </Button>
                </div>
            )}

            {/* Footer with Citation */}
            <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                        <FileText size={20} className="text-cyan-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-semibold mb-2">
                                {language === 'fr' ? 'Citation' : 'Citation'}
                            </h3>
                            <p className="text-sm text-gray-300 font-mono leading-relaxed">
                                Slattery, P., Saeri, A. K., Grundy, E. A. C., Graham, J., Noetel, M., Uuk, R., Dao, J., Pour, S., Casper, S., & Thompson, N. (2024). A systematic evidence review and common frame of reference for the risks from artificial intelligence. https://doi.org/10.48550/arXiv.2408.12622
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
                        <a
                            href="mailto:pslat@mit.edu"
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                        >
                            <Mail size={14} />
                            pslat@mit.edu
                        </a>
                        <a
                            href="https://airisk.mit.edu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                        >
                            <Globe size={14} />
                            airisk.mit.edu
                        </a>
                        <a
                            href="https://github.com/mit-futuretech/airisk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                        >
                            <Github size={14} />
                            GitHub
                        </a>
                    </div>
                </div>
            </div>

            {/* License */}
            <div className="bg-cyan-900/20 border border-cyan-500/50 p-4 rounded-lg text-center mt-6">
                <p className="text-sm text-cyan-300">
                    {language === 'fr'
                        ? 'Toutes les ressources sont sous licence CC BY 4.0 sauf mention contraire'
                        : 'All resources are licensed under CC BY 4.0 unless otherwise stated'
                    }
                </p>
            </div>
        </Card>
    );
};

export default IncludedResourcesView;
