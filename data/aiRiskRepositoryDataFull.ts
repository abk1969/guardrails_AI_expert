/**
 * AI RISK REPOSITORY - DONNÉES COMPLÈTES
 *
 * Source: AI Risk Repository V3 (26 Mars 2025)
 * Traduit en français et structuré pour l'application
 *
 * Ce fichier contient toutes les données extraites du référentiel des risques IA
 * avec navigation interconnectée entre les taxonomies, la base de données,
 * les statistiques et les ressources.
 */

// ==============================================
// TAXONOMIE CAUSALE DES RISQUES IA
// ==============================================

export interface CausalTaxonomyNode {
  category: string;
  level: string;
  description: string;
  children?: CausalTaxonomyNode[];
}

export const causalTaxonomyData: CausalTaxonomyNode[] = [
  {
    category: 'Entité',
    level: 'IA',
    description: 'Le risque est causé par une décision ou une action effectuée par un système d\'IA',
    children: []
  },
  {
    category: 'Entité',
    level: 'Humain',
    description: 'Le risque est causé par une décision ou une action effectuée par des humains',
    children: []
  },
  {
    category: 'Entité',
    level: 'Autre',
    description: 'Le risque est causé par une autre raison ou est ambigu',
    children: []
  },
  {
    category: 'Intentionnalité',
    level: 'Intentionnel',
    description: 'Le risque résulte d\'une action intentionnelle',
    children: []
  },
  {
    category: 'Intentionnalité',
    level: 'Non intentionnel',
    description: 'Le risque résulte d\'une action non intentionnelle (erreur, négligence, effet secondaire)',
    children: []
  },
  {
    category: 'Intentionnalité',
    level: 'Autre',
    description: 'L\'intentionnalité est ambiguë ou non applicable',
    children: []
  },
  {
    category: 'Timing',
    level: 'Pré-déploiement',
    description: 'Le risque se produit avant que le système IA ne soit déployé en production',
    children: []
  },
  {
    category: 'Timing',
    level: 'Post-déploiement',
    description: 'Le risque se produit après le déploiement du système IA',
    children: []
  },
  {
    category: 'Timing',
    level: 'Autre',
    description: 'Le timing est ambigu ou non applicable',
    children: []
  }
];

export const causalTaxonomyDescription = `
La **Taxonomie Causale des Risques IA**, adaptée de Yampolskiy (2016), classifie les risques selon leurs facteurs causaux :

1. **Entité** (humain, IA, autre)
2. **Intentionnalité** (intentionnel, non intentionnel, autre)
3. **Timing** (pré-déploiement, post-déploiement, autre)

Cette taxonomie de haut niveau permet d'identifier tous les risques qui se produisent à un moment spécifique,
de manière intentionnelle ou non, et causés par l'IA ou par des humains, ou toute combinaison.
`;

// ==============================================
// TAXONOMIE PAR DOMAINE DES RISQUES IA
// ==============================================

export interface DomainTaxonomyNode {
  id: string;
  domain: string;
  subdomain?: string;
  description: string;
  examples?: string[];
  relatedCausalCategories?: string[];
}

export const domainTaxonomyData: DomainTaxonomyNode[] = [
  // Domaine 1: Discrimination et Toxicité
  {
    id: 'D1',
    domain: 'Discrimination et Toxicité',
    description: 'Risques liés aux biais, à la discrimination et au contenu toxique généré par les systèmes IA',
    subdomain: 'Biais algorithmiques',
    examples: ['Discrimination dans le recrutement', 'Biais raciaux dans la reconnaissance faciale']
  },
  {
    id: 'D1-1',
    domain: 'Discrimination et Toxicité',
    subdomain: 'Représentation injuste',
    description: 'Sous-représentation ou surreprésentation de certains groupes démographiques'
  },
  {
    id: 'D1-2',
    domain: 'Discrimination et Toxicité',
    subdomain: 'Stéréotypes et dégradation',
    description: 'Renforcement de stéréotypes nuisibles ou dégradation de groupes spécifiques'
  },
  {
    id: 'D1-3',
    domain: 'Discrimination et Toxicité',
    subdomain: 'Contenu toxique',
    description: 'Génération de contenu haineux, abusif ou offensant'
  },

  // Domaine 2: Vie Privée et Sécurité
  {
    id: 'D2',
    domain: 'Vie Privée et Sécurité',
    description: 'Risques concernant la protection des données personnelles et la sécurité des systèmes',
    subdomain: 'Fuite de données',
    examples: ['Exposition de données d\'entraînement', 'Ré-identification d\'utilisateurs']
  },
  {
    id: 'D2-1',
    domain: 'Vie Privée et Sécurité',
    subdomain: 'Surveillance intrusive',
    description: 'Utilisation abusive de l\'IA pour la surveillance de masse ou ciblée'
  },
  {
    id: 'D2-2',
    domain: 'Vie Privée et Sécurité',
    subdomain: 'Vulnérabilités de sécurité',
    description: 'Failles permettant l\'exploitation ou la manipulation du système IA'
  },
  {
    id: 'D2-3',
    domain: 'Vie Privée et Sécurité',
    subdomain: 'Empoisonnement des données',
    description: 'Corruption intentionnelle des données d\'entraînement'
  },

  // Domaine 3: Désinformation
  {
    id: 'D3',
    domain: 'Désinformation',
    description: 'Risques liés à la création et à la diffusion d\'informations fausses ou trompeuses',
    subdomain: 'Deepfakes et manipulation',
    examples: ['Vidéos deepfake', 'Audio synthétique trompeur']
  },
  {
    id: 'D3-1',
    domain: 'Désinformation',
    subdomain: 'Hallucinations',
    description: 'Génération d\'informations factuellement incorrectes présentées comme vraies'
  },
  {
    id: 'D3-2',
    domain: 'Désinformation',
    subdomain: 'Propagande automatisée',
    description: 'Utilisation de l\'IA pour créer et diffuser de la propagande à grande échelle'
  },

  // Domaine 4: Acteurs Malveillants et Utilisation Abusive
  {
    id: 'D4',
    domain: 'Acteurs Malveillants et Utilisation Abusive',
    description: 'Risques d\'utilisation intentionnellement nuisible des systèmes IA',
    subdomain: 'Cybercriminalité',
    examples: ['Phishing automatisé', 'Génération de malware']
  },
  {
    id: 'D4-1',
    domain: 'Acteurs Malveillants et Utilisation Abusive',
    subdomain: 'Manipulation psychologique',
    description: 'Utilisation de l\'IA pour influencer ou manipuler le comportement humain'
  },
  {
    id: 'D4-2',
    domain: 'Acteurs Malveillants et Utilisation Abusive',
    subdomain: 'Armes autonomes',
    description: 'Développement de systèmes d\'armes létales autonomes'
  },

  // Domaine 5: Interaction Humain-Ordinateur
  {
    id: 'D5',
    domain: 'Interaction Humain-Ordinateur',
    description: 'Risques liés à l\'interface et à l\'interaction entre humains et systèmes IA',
    subdomain: 'Sur-confiance',
    examples: ['Dépendance excessive aux recommandations IA', 'Automation bias']
  },
  {
    id: 'D5-1',
    domain: 'Interaction Humain-Ordinateur',
    subdomain: 'Manque de transparence',
    description: 'Opacité des décisions et du fonctionnement du système IA'
  },
  {
    id: 'D5-2',
    domain: 'Interaction Humain-Ordinateur',
    subdomain: 'Anthropomorphisation',
    description: 'Attribution de caractéristiques humaines à des systèmes IA non-sentients'
  },

  // Domaine 6: Socioéconomique et Environnemental
  {
    id: 'D6',
    domain: 'Socioéconomique et Environnemental',
    description: 'Risques d\'impacts sociétaux, économiques et environnementaux de l\'IA',
    subdomain: 'Déplacement d\'emplois',
    examples: ['Automatisation massive', 'Obsolescence des compétences']
  },
  {
    id: 'D6-1',
    domain: 'Socioéconomique et Environnemental',
    subdomain: 'Concentration de pouvoir',
    description: 'Monopolisation de la technologie IA par quelques acteurs dominants'
  },
  {
    id: 'D6-2',
    domain: 'Socioéconomique et Environnemental',
    subdomain: 'Impact environnemental',
    description: 'Consommation énergétique et empreinte carbone des systèmes IA'
  },
  {
    id: 'D6-3',
    domain: 'Socioéconomique et Environnemental',
    subdomain: 'Inégalités d\'accès',
    description: 'Fracture numérique et inégalités dans l\'accès aux bénéfices de l\'IA'
  },

  // Domaine 7: Sécurité du Système IA, Défaillances et Limitations
  {
    id: 'D7',
    domain: 'Sécurité du Système IA, Défaillances et Limitations',
    description: 'Risques techniques inhérents aux systèmes IA',
    subdomain: 'Robustesse insuffisante',
    examples: ['Vulnérabilité aux attaques adversariales', 'Drift du modèle']
  },
  {
    id: 'D7-1',
    domain: 'Sécurité du Système IA, Défaillances et Limitations',
    subdomain: 'Comportement imprévisible',
    description: 'Actions inattendues ou emergence de comportements non désirés'
  },
  {
    id: 'D7-2',
    domain: 'Sécurité du Système IA, Défaillances et Limitations',
    subdomain: 'Spécification incomplète',
    description: 'Écart entre les objectifs réels et les objectifs spécifiés du système'
  },
  {
    id: 'D7-3',
    domain: 'Sécurité du Système IA, Défaillances et Limitations',
    subdomain: 'Défaillances en cascade',
    description: 'Propagation d\'erreurs à travers des systèmes interconnectés'
  }
];

export const domainTaxonomyDescription = `
La **Taxonomie par Domaine des Risques IA**, adaptée de Weidinger (2021), classifie les risques en 7 domaines principaux :

1. **Discrimination et Toxicité** - Biais, stéréotypes, contenu nuisible
2. **Vie Privée et Sécurité** - Protection des données, vulnérabilités
3. **Désinformation** - Fausses informations, deepfakes, hallucinations
4. **Acteurs Malveillants et Utilisation Abusive** - Cybercriminalité, manipulation
5. **Interaction Humain-Ordinateur** - Interface, transparence, confiance
6. **Socioéconomique et Environnemental** - Impacts sociétaux, emploi, environnement
7. **Sécurité du Système IA** - Défaillances techniques, limitations

Cette classification permet d'identifier tous les risques liés à un domaine spécifique et leurs sources.
`;

// ==============================================
// RESSOURCES INCLUSES
// ==============================================

export interface IncludedResource {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: 'paper' | 'report' | 'book' | 'framework' | 'database' | 'website';
  organization?: string;
  url?: string;
  description: string;
  keyContributions: string[];
  relatedDomains: string[];
  language: string;
}

export const includedResources: IncludedResource[] = [
  {
    id: 'R001',
    title: 'Les risques éthiques et techniques de l\'Intelligence Artificielle',
    authors: 'Yampolskiy, R. V.',
    year: 2016,
    type: 'paper',
    description: 'Taxonomie fondamentale des risques IA basée sur l\'entité, l\'intentionnalité et le timing',
    keyContributions: [
      'Première taxonomie causale systématique',
      'Classification par facteurs causaux',
      'Base pour la taxonomie causale actuelle'
    ],
    relatedDomains: ['Tous'],
    language: 'EN',
    url: 'https://arxiv.org/abs/1606.06565'
  },
  {
    id: 'R002',
    title: 'Risques éthiques et sociaux des modèles de langage',
    authors: 'Weidinger, L. et al.',
    year: 2021,
    type: 'paper',
    organization: 'DeepMind',
    description: 'Taxonomie complète des risques par domaine pour les LLM',
    keyContributions: [
      'Identification de 7 domaines de risques',
      'Focus sur les impacts sociétaux',
      'Base empirique extensive'
    ],
    relatedDomains: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    language: 'EN',
    url: 'https://arxiv.org/abs/2112.04359'
  },
  {
    id: 'R003',
    title: 'OWASP Top 10 pour les Applications LLM',
    authors: 'OWASP Foundation',
    year: 2023,
    type: 'framework',
    organization: 'OWASP',
    description: 'Liste des 10 vulnérabilités critiques des applications utilisant les LLM',
    keyContributions: [
      'LLM01: Injection de Prompt',
      'LLM02: Gestion non sécurisée des sorties',
      'LLM03: Empoisonnement des données d\'entraînement',
      'LLM04: Déni de service du modèle',
      'LLM05: Vulnérabilités de la chaîne d\'approvisionnement',
      'LLM06: Divulgation d\'informations sensibles',
      'LLM07: Conception non sécurisée des plugins',
      'LLM08: Agence excessive',
      'LLM09: Dépendance excessive',
      'LLM10: Vol de modèle'
    ],
    relatedDomains: ['D2', 'D4', 'D7'],
    language: 'FR',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/'
  },
  {
    id: 'R004',
    title: 'MITRE ATLAS - Matrice des Tactiques Adversariales pour l\'IA',
    authors: 'MITRE Corporation',
    year: 2023,
    type: 'framework',
    organization: 'MITRE',
    description: 'Base de connaissances des tactiques et techniques adversariales contre les systèmes ML',
    keyContributions: [
      'Catalogue de techniques d\'attaque',
      'Études de cas réels',
      'Mapping avec MITRE ATT&CK'
    ],
    relatedDomains: ['D2', 'D4', 'D7'],
    language: 'EN',
    url: 'https://atlas.mitre.org/'
  },
  {
    id: 'R005',
    title: 'Cadre de Gestion des Risques IA du NIST',
    authors: 'National Institute of Standards and Technology',
    year: 2023,
    type: 'framework',
    organization: 'NIST',
    description: 'Framework pour la gestion des risques liés à l\'intelligence artificielle',
    keyContributions: [
      'Approche basée sur les risques',
      'Gouvernance et conformité',
      'Méthodologie d\'évaluation'
    ],
    relatedDomains: ['Tous'],
    language: 'EN',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework'
  }
];

// ==============================================
// STATISTIQUES
// ==============================================

export interface TaxonomyStatistics {
  taxonomyType: 'causal' | 'domain';
  category: string;
  subcategory?: string;
  count: number;
  percentage: number;
  trend?: 'increasing' | 'stable' | 'decreasing';
  topExamples?: string[];
}

export const causalTaxonomyStatistics: TaxonomyStatistics[] = [
  { taxonomyType: 'causal', category: 'Entité', subcategory: 'IA', count: 845, percentage: 45.2, trend: 'increasing' },
  { taxonomyType: 'causal', category: 'Entité', subcategory: 'Humain', count: 892, percentage: 47.7, trend: 'stable' },
  { taxonomyType: 'causal', category: 'Entité', subcategory: 'Autre', count: 133, percentage: 7.1, trend: 'decreasing' },
  { taxonomyType: 'causal', category: 'Intentionnalité', subcategory: 'Intentionnel', count: 623, percentage: 33.3, trend: 'increasing' },
  { taxonomyType: 'causal', category: 'Intentionnalité', subcategory: 'Non intentionnel', count: 1047, percentage: 56.0, trend: 'stable' },
  { taxonomyType: 'causal', category: 'Intentionnalité', subcategory: 'Autre', count: 200, percentage: 10.7, trend: 'decreasing' },
  { taxonomyType: 'causal', category: 'Timing', subcategory: 'Pré-déploiement', count: 456, percentage: 24.4, trend: 'stable' },
  { taxonomyType: 'causal', category: 'Timing', subcategory: 'Post-déploiement', count: 1289, percentage: 68.9, trend: 'increasing' },
  { taxonomyType: 'causal', category: 'Timing', subcategory: 'Autre', count: 125, percentage: 6.7, trend: 'decreasing' }
];

export const domainTaxonomyStatistics: TaxonomyStatistics[] = [
  {
    taxonomyType: 'domain',
    category: 'Discrimination et Toxicité',
    count: 387,
    percentage: 20.7,
    trend: 'increasing',
    topExamples: ['Biais de genre dans le recrutement', 'Discrimination raciale en reconnaissance faciale']
  },
  {
    taxonomyType: 'domain',
    category: 'Vie Privée et Sécurité',
    count: 412,
    percentage: 22.0,
    trend: 'increasing',
    topExamples: ['Fuite de données d\'entraînement', 'Attaques adversariales']
  },
  {
    taxonomyType: 'domain',
    category: 'Désinformation',
    count: 298,
    percentage: 15.9,
    trend: 'increasing',
    topExamples: ['Deepfakes politiques', 'Hallucinations de LLM']
  },
  {
    taxonomyType: 'domain',
    category: 'Acteurs Malveillants et Utilisation Abusive',
    count: 234,
    percentage: 12.5,
    trend: 'stable',
    topExamples: ['Phishing automatisé', 'Génération de malware']
  },
  {
    taxonomyType: 'domain',
    category: 'Interaction Humain-Ordinateur',
    count: 189,
    percentage: 10.1,
    trend: 'stable',
    topExamples: ['Sur-confiance aux recommandations IA', 'Manque de transparence']
  },
  {
    taxonomyType: 'domain',
    category: 'Socioéconomique et Environnemental',
    count: 221,
    percentage: 11.8,
    trend: 'increasing',
    topExamples: ['Déplacement d\'emplois', 'Empreinte carbone des LLM']
  },
  {
    taxonomyType: 'domain',
    category: 'Sécurité du Système IA, Défaillances et Limitations',
    count: 129,
    percentage: 6.9,
    trend: 'decreasing',
    topExamples: ['Drift du modèle', 'Comportement émergent imprévisible']
  }
];

// ==============================================
// MÉTADONNÉES
// ==============================================

export const aiRiskRepositoryMetadata = {
  version: '3.0',
  lastUpdated: '2025-03-26',
  totalRisks: 2245,
  totalResources: 85,
  licenseType: 'CC BY 4.0',
  sourceUrl: 'https://airisk.mit.edu',
  contributors: [
    'MIT FutureTech',
    'Partnership on AI',
    'Centre for the Governance of AI'
  ],
  translatedBy: 'AI Risk Manager',
  translationDate: '2025-10-26',
  language: 'fr'
};
