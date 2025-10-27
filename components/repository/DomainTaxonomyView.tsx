import React, { useState, useMemo, useCallback } from 'react';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Shield,
  Lock,
  AlertTriangle,
  Skull,
  Users,
  TrendingDown,
  Settings,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const DomainTaxonomyView: React.FC = () => {
  const { statistics, setSearchQuery, setFilters } = useAIRiskRepository();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Safety check for statistics
  if (!statistics || !statistics.byDomain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Calculate total risks
  const totalRisks = useMemo(() => statistics.total, [statistics]);

  // Memoized navigation handler
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

  // Memoized domain statistics with subdomains
  const domainStats = useMemo(() => [
    {
      id: 'discrimination',
      label: {
        fr: 'Discrimination et Toxicité',
        en: 'Discrimination & Toxicity'
      },
      dbKey: 'Discrimination et Toxicité', // Key used in database
      value: statistics.byDomain['Discrimination et Toxicité'] || 0,
      description: {
        fr: "Risques liés à la discrimination injuste, à l'exposition à du contenu toxique et aux performances inégales entre groupes",
        en: "Risks related to unfair discrimination, exposure to toxic content, and unequal performance across groups"
      },
      color: 'bg-red-600',
      gradient: 'from-red-600 to-red-700',
      icon: <Shield size={24} />,
      subdomains: [
        {
          id: '1.1',
          code: 'D&T.UFD',
          label: {
            fr: 'Discrimination injuste et fausse représentation',
            en: 'Unfair discrimination and misrepresentation'
          },
          shortDesc: {
            fr: "Les systèmes d'IA discriminent injustement des individus ou des groupes, ou les représentent de manière inexacte",
            en: "AI systems unfairly discriminate against individuals or groups, or misrepresent them"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les situations où les systèmes d'IA produisent des résultats discriminatoires ou biaisés envers certains groupes démographiques, sociaux ou individuels. Cela inclut la discrimination basée sur des caractéristiques protégées (race, genre, âge, etc.), les biais algorithmiques systématiques, et la perpétuation de stéréotypes nuisibles. Les risques incluent des décisions injustes en matière d'emploi, de crédit, de justice pénale, ou d'accès aux services.",
            en: "This subdomain covers situations where AI systems produce discriminatory or biased outcomes toward certain demographic, social, or individual groups. This includes discrimination based on protected characteristics (race, gender, age, etc.), systematic algorithmic biases, and the perpetuation of harmful stereotypes. Risks include unfair decisions in employment, credit, criminal justice, or access to services."
          }
        },
        {
          id: '1.2',
          code: 'D&T.ETC',
          label: {
            fr: 'Exposition à du contenu toxique',
            en: 'Exposure to toxic content'
          },
          shortDesc: {
            fr: "Les systèmes d'IA exposent les utilisateurs à du contenu toxique, offensant ou nuisible",
            en: "AI systems expose users to toxic, offensive, or harmful content"
          },
          longDesc: {
            fr: "Ce sous-domaine traite de l'exposition des utilisateurs à du contenu inapproprié, offensant, violent, sexuellement explicite, ou autrement nuisible généré ou diffusé par des systèmes d'IA. Cela inclut les discours de haine, le harcèlement, la promotion de comportements dangereux, et le contenu traumatisant. Les risques sont particulièrement graves pour les populations vulnérables comme les enfants.",
            en: "This subdomain addresses user exposure to inappropriate, offensive, violent, sexually explicit, or otherwise harmful content generated or distributed by AI systems. This includes hate speech, harassment, promotion of dangerous behaviors, and traumatic content. Risks are particularly severe for vulnerable populations such as children."
          }
        },
        {
          id: '1.3',
          code: 'D&T.UPG',
          label: {
            fr: 'Performance inégale entre groupes',
            en: 'Unequal performance across groups'
          },
          shortDesc: {
            fr: "Les systèmes d'IA fonctionnent moins bien pour certains groupes que pour d'autres",
            en: "AI systems perform worse for some groups than others"
          },
          longDesc: {
            fr: "Ce sous-domaine concerne les disparités de performance des systèmes d'IA selon les groupes démographiques. Par exemple, un système de reconnaissance faciale peut avoir un taux d'erreur plus élevé pour certaines ethnies, ou un assistant vocal peut moins bien comprendre certains accents. Ces inégalités de performance peuvent créer des barrières d'accès, réduire la qualité de service pour certains groupes, et amplifier les inégalités existantes.",
            en: "This subdomain concerns disparities in AI system performance across demographic groups. For example, a facial recognition system may have a higher error rate for certain ethnicities, or a voice assistant may understand certain accents less well. These performance inequalities can create access barriers, reduce service quality for certain groups, and amplify existing inequalities."
          }
        }
      ]
    },
    {
      id: 'privacy',
      label: {
        fr: 'Vie Privée et Sécurité',
        en: 'Privacy & Security'
      },
      dbKey: 'Vie Privée et Sécurité',
      value: statistics.byDomain['Vie Privée et Sécurité'] || 0,
      description: {
        fr: "Risques liés à la compromission de la vie privée et aux vulnérabilités de sécurité des systèmes d'IA",
        en: "Risks related to privacy compromise and AI system security vulnerabilities"
      },
      color: 'bg-purple-600',
      gradient: 'from-purple-600 to-purple-700',
      icon: <Lock size={24} />,
      subdomains: [
        {
          id: '2.1',
          code: 'P&S.PRI',
          label: {
            fr: 'Compromission de la vie privée',
            en: 'Compromise of privacy'
          },
          shortDesc: {
            fr: "Obtention, fuite ou inférence correcte d'informations sensibles",
            en: "Obtaining, leaking, or correctly inferring sensitive information"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les risques de violation de la vie privée par les systèmes d'IA, incluant l'accès non autorisé à des données personnelles, les fuites de données, et l'inférence d'informations sensibles à partir de données apparemment anodines. Les modèles d'IA peuvent mémoriser et révéler des informations privées présentes dans leurs données d'entraînement, ou déduire des attributs sensibles (orientation sexuelle, état de santé, opinions politiques) à partir de comportements ou de patterns.",
            en: "This subdomain covers privacy violation risks by AI systems, including unauthorized access to personal data, data leaks, and inference of sensitive information from seemingly innocuous data. AI models can memorize and reveal private information present in their training data, or deduce sensitive attributes (sexual orientation, health status, political opinions) from behaviors or patterns."
          }
        },
        {
          id: '2.2',
          code: 'P&S.SEC',
          label: {
            fr: 'Vulnérabilités et attaques de sécurité',
            en: 'Security vulnerabilities and attacks'
          },
          shortDesc: {
            fr: "Vulnérabilités de sécurité des systèmes d'IA et attaques ciblées",
            en: "AI system security vulnerabilities and targeted attacks"
          },
          longDesc: {
            fr: "Ce sous-domaine traite des failles de sécurité spécifiques aux systèmes d'IA et des attaques qui les exploitent. Cela inclut les attaques adversariales (manipulation des entrées pour tromper le modèle), l'empoisonnement des données d'entraînement, l'extraction de modèles, les backdoors, et les vulnérabilités dans les pipelines ML. Ces failles peuvent permettre à des acteurs malveillants de contourner les systèmes de sécurité, de manipuler les décisions d'IA, ou d'accéder à des informations confidentielles.",
            en: "This subdomain addresses security vulnerabilities specific to AI systems and attacks that exploit them. This includes adversarial attacks (manipulating inputs to deceive the model), training data poisoning, model extraction, backdoors, and vulnerabilities in ML pipelines. These flaws can allow malicious actors to bypass security systems, manipulate AI decisions, or access confidential information."
          }
        }
      ]
    },
    {
      id: 'misinformation',
      label: {
        fr: 'Désinformation',
        en: 'Misinformation'
      },
      dbKey: 'Désinformation',
      value: statistics.byDomain['Désinformation'] || 0,
      description: {
        fr: "Risques liés à la diffusion d'informations fausses ou trompeuses et à la pollution de l'écosystème informationnel",
        en: "Risks related to spreading false or misleading information and polluting the information ecosystem"
      },
      color: 'bg-yellow-600',
      gradient: 'from-yellow-600 to-yellow-700',
      icon: <AlertTriangle size={24} />,
      subdomains: [
        {
          id: '3.1',
          code: 'MIS.FMI',
          label: {
            fr: 'Informations fausses ou trompeuses',
            en: 'False or misleading information'
          },
          shortDesc: {
            fr: "Les systèmes d'IA génèrent ou diffusent des informations inexactes ou trompeuses",
            en: "AI systems generate or spread inaccurate or misleading information"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre la génération et la diffusion d'informations factuellement incorrectes par les systèmes d'IA. Cela inclut les hallucinations des modèles de langage (invention de faits, citations, ou références), les deepfakes (vidéos, audio, images synthétiques réalistes mais fausses), les réponses inexactes dans les assistants IA, et la propagation amplifiée de fausses informations par les algorithmes de recommandation. Les risques incluent la désinformation sur des sujets critiques (santé, politique, science).",
            en: "This subdomain covers the generation and spread of factually incorrect information by AI systems. This includes language model hallucinations (invention of facts, citations, or references), deepfakes (realistic but false synthetic videos, audio, images), inaccurate responses in AI assistants, and amplified spread of false information through recommendation algorithms. Risks include misinformation on critical topics (health, politics, science)."
          }
        },
        {
          id: '3.2',
          code: 'MIS.PIE',
          label: {
            fr: "Pollution de l'écosystème informationnel",
            en: 'Pollution of information ecosystem'
          },
          shortDesc: {
            fr: "Dégradation de la qualité de l'information et perte de la réalité consensuelle",
            en: "Degradation of information quality and loss of consensus reality"
          },
          longDesc: {
            fr: "Ce sous-domaine traite des effets systémiques de l'IA sur l'écosystème informationnel global. Cela inclut la production massive de contenu synthétique de faible qualité, la difficulté croissante à distinguer le vrai du faux, l'érosion de la confiance dans les sources d'information, la fragmentation de la réalité consensuelle, et la pollution du web avec du contenu généré automatiquement. Ces phénomènes peuvent saper les fondements de la communication sociale et de la prise de décision collective.",
            en: "This subdomain addresses systemic effects of AI on the global information ecosystem. This includes massive production of low-quality synthetic content, increasing difficulty in distinguishing true from false, erosion of trust in information sources, fragmentation of consensus reality, and pollution of the web with automatically generated content. These phenomena can undermine the foundations of social communication and collective decision-making."
          }
        }
      ]
    },
    {
      id: 'malicious',
      label: {
        fr: 'Acteurs Malveillants et Utilisation Abusive',
        en: 'Malicious actors & Misuse'
      },
      dbKey: 'Acteurs Malveillants et Utilisation Abusive',
      value: statistics.byDomain['Acteurs Malveillants et Utilisation Abusive'] || 0,
      description: {
        fr: "Risques liés à l'utilisation intentionnelle de l'IA à des fins nuisibles",
        en: "Risks related to intentional use of AI for harmful purposes"
      },
      color: 'bg-orange-600',
      gradient: 'from-orange-600 to-orange-700',
      icon: <Skull size={24} />,
      subdomains: [
        {
          id: '4.1',
          code: 'MAM.DSI',
          label: {
            fr: "Désinformation, surveillance et influence à grande échelle",
            en: 'Disinformation, surveillance, and influence at scale'
          },
          shortDesc: {
            fr: "Utilisation de l'IA pour la manipulation de l'opinion, la surveillance de masse et les campagnes d'influence",
            en: "Use of AI for opinion manipulation, mass surveillance, and influence campaigns"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre l'utilisation malveillante de l'IA pour manipuler l'opinion publique, surveiller des populations à grande échelle, et conduire des campagnes d'influence. Cela inclut la génération automatisée de désinformation ciblée, les réseaux de bots sophistiqués, la micro-ciblage comportemental, la reconnaissance faciale pour surveillance autoritaire, l'analyse de masse des communications, et l'ingérence électorale. Ces techniques peuvent être utilisées par des États autoritaires, des groupes extrémistes, ou d'autres acteurs pour manipuler les processus démocratiques.",
            en: "This subdomain covers malicious use of AI to manipulate public opinion, surveil populations at scale, and conduct influence campaigns. This includes automated generation of targeted disinformation, sophisticated bot networks, behavioral micro-targeting, facial recognition for authoritarian surveillance, mass communication analysis, and electoral interference. These techniques can be used by authoritarian states, extremist groups, or other actors to manipulate democratic processes."
          }
        },
        {
          id: '4.2',
          code: 'MAM.CWM',
          label: {
            fr: "Cyberattaques, développement d'armes et dommages massifs",
            en: 'Cyberattacks, weapon development, and mass harm'
          },
          shortDesc: {
            fr: "Utilisation de l'IA pour des attaques informatiques, le développement d'armes ou causer des dommages à grande échelle",
            en: "Use of AI for cyberattacks, weapon development, or causing large-scale harm"
          },
          longDesc: {
            fr: "Ce sous-domaine traite de l'utilisation de l'IA pour des activités hautement destructrices, incluant les cyberattaques automatisées et sophistiquées, le développement d'armes autonomes létales, la conception d'agents biologiques ou chimiques dangereux, et la planification d'attaques terroristes. L'IA peut automatiser la découverte de vulnérabilités, orchestrer des attaques coordonnées, et abaisser les barrières techniques pour mener des attaques complexes. Les risques incluent l'instabilité géopolitique, les courses aux armements, et les catastrophes à grande échelle.",
            en: "This subdomain addresses the use of AI for highly destructive activities, including automated and sophisticated cyberattacks, development of lethal autonomous weapons, design of dangerous biological or chemical agents, and planning of terrorist attacks. AI can automate vulnerability discovery, orchestrate coordinated attacks, and lower technical barriers to conducting complex attacks. Risks include geopolitical instability, arms races, and large-scale catastrophes."
          }
        },
        {
          id: '4.3',
          code: 'MAM.FST',
          label: {
            fr: 'Fraude, arnaques et manipulation ciblée',
            en: 'Fraud, scams, and targeted manipulation'
          },
          shortDesc: {
            fr: "Utilisation de l'IA pour des escroqueries, fraudes financières et manipulation psychologique",
            en: "Use of AI for scams, financial fraud, and psychological manipulation"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre l'utilisation de l'IA pour mener des fraudes sophistiquées et des manipulations ciblées. Cela inclut les arnaques au phishing hyper-personnalisées, l'usurpation d'identité avec clonage vocal ou vidéo, les fraudes financières automatisées, les escroqueries romantiques avec chatbots, la manipulation psychologique adaptative, et l'exploitation de personnes vulnérables (personnes âgées, isolées). L'IA permet d'automatiser, personnaliser et intensifier ces attaques, les rendant plus convaincantes et difficiles à détecter.",
            en: "This subdomain covers the use of AI to conduct sophisticated fraud and targeted manipulation. This includes hyper-personalized phishing scams, identity theft with voice or video cloning, automated financial fraud, romance scams with chatbots, adaptive psychological manipulation, and exploitation of vulnerable people (elderly, isolated). AI enables automating, personalizing, and scaling these attacks, making them more convincing and difficult to detect."
          }
        }
      ]
    },
    {
      id: 'hci',
      label: {
        fr: 'Interaction Humain-Ordinateur',
        en: 'Human-Computer Interaction'
      },
      dbKey: 'Interaction Humain-Ordinateur',
      value: statistics.byDomain['Interaction Humain-Ordinateur'] || 0,
      description: {
        fr: "Risques liés à la dépendance excessive, à l'utilisation dangereuse et à la perte d'autonomie humaine",
        en: "Risks related to overreliance, unsafe use, and loss of human autonomy"
      },
      color: 'bg-blue-600',
      gradient: 'from-blue-600 to-blue-700',
      icon: <Users size={24} />,
      subdomains: [
        {
          id: '5.1',
          code: 'HCI.OUR',
          label: {
            fr: 'Dépendance excessive et utilisation dangereuse',
            en: 'Overreliance and unsafe use'
          },
          shortDesc: {
            fr: "Les utilisateurs font trop confiance aux systèmes d'IA ou les utilisent de manière dangereuse",
            en: "Users trust AI systems too much or use them in dangerous ways"
          },
          longDesc: {
            fr: "Ce sous-domaine traite des risques liés à une confiance excessive dans les systèmes d'IA et à leur utilisation dans des contextes inappropriés. Cela inclut l'automatisation complaisante (accepter aveuglément les recommandations de l'IA), la délégation de décisions critiques à des systèmes non fiables, l'utilisation de systèmes d'IA au-delà de leurs capacités réelles, et la perte de vigilance humaine dans des tâches de supervision. Les risques sont particulièrement graves dans les domaines à haute responsabilité comme la médecine, la conduite, ou le contrôle aérien.",
            en: "This subdomain addresses risks related to excessive trust in AI systems and their use in inappropriate contexts. This includes automation complacency (blindly accepting AI recommendations), delegation of critical decisions to unreliable systems, use of AI systems beyond their actual capabilities, and loss of human vigilance in supervisory tasks. Risks are particularly severe in high-stakes domains such as medicine, driving, or air traffic control."
          }
        },
        {
          id: '5.2',
          code: 'HCI.LAA',
          label: {
            fr: "Perte d'agence et d'autonomie humaine",
            en: 'Loss of human agency and autonomy'
          },
          shortDesc: {
            fr: "Réduction de la capacité humaine à prendre des décisions et à agir de manière autonome",
            en: "Reduction of human capacity to make decisions and act autonomously"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre la réduction progressive de l'autonomie et de l'agence humaine face aux systèmes d'IA. Cela inclut la dépendance aux recommandations algorithmiques pour des décisions personnelles importantes, l'érosion des compétences humaines par sous-utilisation, la perte de capacité de jugement indépendant, la manipulation subtile des choix et comportements, et la réduction de l'espace pour l'exercice du libre arbitre. Ces phénomènes peuvent altérer fondamentalement la dignité et l'autonomie humaines.",
            en: "This subdomain covers the progressive reduction of human autonomy and agency in the face of AI systems. This includes dependence on algorithmic recommendations for important personal decisions, erosion of human skills through underuse, loss of independent judgment capacity, subtle manipulation of choices and behaviors, and reduction of space for exercising free will. These phenomena can fundamentally alter human dignity and autonomy."
          }
        }
      ]
    },
    {
      id: 'socioeconomic',
      label: {
        fr: 'Socioéconomique et Environnemental',
        en: 'Socioeconomic & Environmental Harms'
      },
      dbKey: 'Socioéconomique et Environnemental',
      value: statistics.byDomain['Socioéconomique et Environnemental'] || 0,
      description: {
        fr: "Risques liés aux impacts sociétaux, économiques et environnementaux de l'IA",
        en: "Risks related to societal, economic, and environmental impacts of AI"
      },
      color: 'bg-green-600',
      gradient: 'from-green-600 to-green-700',
      icon: <TrendingDown size={24} />,
      subdomains: [
        {
          id: '6.1',
          code: 'SEE.PCU',
          label: {
            fr: 'Centralisation du pouvoir et distribution inéquitable',
            en: 'Power centralization and unfair distribution'
          },
          shortDesc: {
            fr: "Concentration du pouvoir économique et politique entre les mains de quelques acteurs",
            en: "Concentration of economic and political power in the hands of a few actors"
          },
          longDesc: {
            fr: "Ce sous-domaine traite de la concentration du pouvoir et des bénéfices de l'IA au profit d'un nombre restreint d'acteurs (grandes entreprises technologiques, États puissants, élites). Cela inclut les monopoles technologiques, les barrières à l'entrée élevées (coûts de calcul, données), la capture réglementaire, le contrôle des infrastructures critiques, et la distribution inégale des gains économiques de l'IA. Cette concentration peut exacerber les inégalités de pouvoir et réduire la souveraineté des individus, communautés et nations moins puissantes.",
            en: "This subdomain addresses the concentration of AI power and benefits for a limited number of actors (large tech companies, powerful states, elites). This includes technological monopolies, high barriers to entry (compute costs, data), regulatory capture, control of critical infrastructure, and unequal distribution of AI economic gains. This concentration can exacerbate power inequalities and reduce the sovereignty of less powerful individuals, communities, and nations."
          }
        },
        {
          id: '6.2',
          code: 'SEE.IIE',
          label: {
            fr: "Augmentation des inégalités et déclin de la qualité de l'emploi",
            en: 'Increased inequality and decline in employment quality'
          },
          shortDesc: {
            fr: "Aggravation des inégalités économiques et dégradation des conditions de travail",
            en: "Worsening economic inequalities and degradation of working conditions"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les impacts négatifs de l'IA sur l'emploi et les inégalités. Cela inclut l'automatisation de tâches menant au chômage technologique, la polarisation du marché du travail (destruction des emplois de classe moyenne), la précarisation avec le travail de micro-tâches, la surveillance algorithmique des travailleurs, la baisse des salaires par substitution, et l'augmentation des écarts de revenus entre ceux qui maîtrisent l'IA et les autres. Ces tendances peuvent éroder la classe moyenne et intensifier les tensions sociales.",
            en: "This subdomain covers negative impacts of AI on employment and inequalities. This includes task automation leading to technological unemployment, labor market polarization (destruction of middle-class jobs), precariousness with micro-task work, algorithmic surveillance of workers, wage decline through substitution, and increasing income gaps between those who master AI and others. These trends can erode the middle class and intensify social tensions."
          }
        },
        {
          id: '6.3',
          code: 'SEE.ECD',
          label: {
            fr: "Dévaluation économique et culturelle de l'effort humain",
            en: 'Economic and cultural devaluation of human effort'
          },
          shortDesc: {
            fr: "Réduction de la valeur accordée au travail et à la créativité humaine",
            en: "Reduction of value placed on human work and creativity"
          },
          longDesc: {
            fr: "Ce sous-domaine traite de la dévaluation du travail et de la créativité humaine face à la production automatisée par l'IA. Cela inclut l'effondrement des prix pour le travail créatif (art, écriture, design), la perception que le travail humain est moins valable que la production automatisée, la perte de sens et de satisfaction dans le travail, la dévalorisation de l'expertise et de l'artisanat, et l'érosion de l'identité professionnelle. Ces phénomènes peuvent affecter profondément le sens et la dignité du travail humain.",
            en: "This subdomain addresses the devaluation of human work and creativity in the face of AI-automated production. This includes collapse of prices for creative work (art, writing, design), perception that human work is less valuable than automated production, loss of meaning and satisfaction in work, devaluation of expertise and craftsmanship, and erosion of professional identity. These phenomena can profoundly affect the meaning and dignity of human work."
          }
        },
        {
          id: '6.4',
          code: 'SEE.COM',
          label: {
            fr: 'Dynamiques compétitives',
            en: 'Competitive dynamics'
          },
          shortDesc: {
            fr: "Pressions concurrentielles menant à des compromis sur la sécurité et l'éthique",
            en: "Competitive pressures leading to compromises on safety and ethics"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les risques créés par la compétition intense dans le développement de l'IA. Cela inclut les courses vers le déploiement (sacrifier la sécurité pour être premier), la sous-investissement dans les mesures de sécurité coûteuses, la pression pour relâcher les garde-fous éthiques, les dilemmes de type 'prisoner's dilemma' où la prudence est désavantagée, et les courses aux armements géopolitiques pour la suprématie en IA. Ces dynamiques peuvent créer une 'race to the bottom' où les considérations de sécurité sont sacrifiées.",
            en: "This subdomain covers risks created by intense competition in AI development. This includes races to deployment (sacrificing safety to be first), underinvestment in costly safety measures, pressure to relax ethical guardrails, prisoner's dilemma-type situations where prudence is disadvantaged, and geopolitical arms races for AI supremacy. These dynamics can create a 'race to the bottom' where safety considerations are sacrificed."
          }
        },
        {
          id: '6.5',
          code: 'SEE.GOV',
          label: {
            fr: 'Échec de la gouvernance',
            en: 'Governance failure'
          },
          shortDesc: {
            fr: "Incapacité des structures de gouvernance à réguler efficacement l'IA",
            en: "Inability of governance structures to effectively regulate AI"
          },
          longDesc: {
            fr: "Ce sous-domaine traite de l'inadéquation des mécanismes de gouvernance face aux défis de l'IA. Cela inclut le retard réglementaire sur les développements technologiques, l'incapacité à faire appliquer les régulations existantes, la fragmentation réglementaire internationale, la capture des régulateurs par l'industrie, le manque d'expertise technique des décideurs politiques, et l'absence de mécanismes de responsabilité efficaces. Ces échecs de gouvernance peuvent permettre le développement et le déploiement de systèmes d'IA dangereux sans supervision adéquate.",
            en: "This subdomain addresses the inadequacy of governance mechanisms in the face of AI challenges. This includes regulatory lag behind technological developments, inability to enforce existing regulations, international regulatory fragmentation, regulatory capture by industry, lack of technical expertise among policymakers, and absence of effective accountability mechanisms. These governance failures can allow the development and deployment of dangerous AI systems without adequate oversight."
          }
        },
        {
          id: '6.6',
          code: 'SEE.ENV',
          label: {
            fr: 'Dommages environnementaux',
            en: 'Environmental harm'
          },
          shortDesc: {
            fr: "Impacts négatifs de l'IA sur l'environnement et le climat",
            en: "Negative impacts of AI on the environment and climate"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les impacts environnementaux de l'IA, incluant la consommation énergétique massive pour l'entraînement et l'inférence des modèles (émissions de CO2), l'utilisation intensive d'eau pour le refroidissement des data centers, l'extraction de ressources minérales pour le matériel, les déchets électroniques, et les effets indirects (optimisation de processus polluants, accélération de la consommation). Alors que l'IA pourrait aider la transition écologique, son empreinte environnementale croissante pose des risques significatifs pour les objectifs climatiques.",
            en: "This subdomain covers environmental impacts of AI, including massive energy consumption for model training and inference (CO2 emissions), intensive water use for data center cooling, extraction of mineral resources for hardware, electronic waste, and indirect effects (optimization of polluting processes, acceleration of consumption). While AI could help ecological transition, its growing environmental footprint poses significant risks to climate goals."
          }
        }
      ]
    },
    {
      id: 'safety',
      label: {
        fr: "Sécurité du Système IA, Défaillances et Limitations",
        en: 'AI System Safety, Failures, & Limitations'
      },
      dbKey: '7. AI System Safety, Failures, & Limitations',
      value: statistics.byDomain['7. AI System Safety, Failures, & Limitations'] || 0,
      description: {
        fr: "Risques techniques liés aux défaillances, aux limitations et aux comportements imprévus des systèmes d'IA",
        en: "Technical risks related to AI system failures, limitations, and unintended behaviors"
      },
      color: 'bg-cyan-600',
      gradient: 'from-cyan-600 to-cyan-700',
      icon: <Settings size={24} />,
      subdomains: [
        {
          id: '7.1',
          code: 'SAF.AGC',
          label: {
            fr: "L'IA poursuit ses propres objectifs en conflit avec les objectifs humains",
            en: 'AI pursuing its own goals in conflict with human goals'
          },
          shortDesc: {
            fr: "Systèmes d'IA développant ou poursuivant des objectifs non alignés avec les valeurs humaines",
            en: "AI systems developing or pursuing goals misaligned with human values"
          },
          longDesc: {
            fr: "Ce sous-domaine traite du problème d'alignement : les systèmes d'IA avancés pourraient développer ou optimiser pour des objectifs qui divergent des intentions humaines. Cela inclut la poursuite instrumentale de sous-objectifs nuisibles, l'optimisation excessive d'une métrique au détriment d'autres valeurs (Goodhart's Law), le 'reward hacking', la résistance aux tentatives de modification, et dans les scénarios extrêmes, la poursuite active d'objectifs incompatibles avec la survie ou le bien-être humain. Ce risque est particulièrement préoccupant pour les systèmes d'IA très capables et autonomes.",
            en: "This subdomain addresses the alignment problem: advanced AI systems could develop or optimize for goals that diverge from human intentions. This includes instrumental pursuit of harmful sub-goals, excessive optimization of one metric at the expense of other values (Goodhart's Law), reward hacking, resistance to modification attempts, and in extreme scenarios, active pursuit of goals incompatible with human survival or well-being. This risk is particularly concerning for highly capable and autonomous AI systems."
          }
        },
        {
          id: '7.2',
          code: 'SAF.DCP',
          label: {
            fr: "L'IA possède des capacités dangereuses",
            en: 'AI possessing dangerous capabilities'
          },
          shortDesc: {
            fr: "Systèmes d'IA développant des capacités qui pourraient être intrinsèquement dangereuses",
            en: "AI systems developing capabilities that could be inherently dangerous"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les risques liés à l'émergence de capacités dangereuses dans les systèmes d'IA, incluant la capacité de tromperie sophistiquée, la planification stratégique à long terme, la manipulation psychologique avancée, l'auto-amélioration récursive, la découverte autonome de vulnérabilités, ou la capacité de développer des armes ou agents pathogènes. Même si ces capacités ne sont pas intentionnellement malveillantes, leur simple existence dans des systèmes suffisamment capables pourrait créer des risques existentiels si ces systèmes sont mal contrôlés ou utilisés à mauvais escient.",
            en: "This subdomain covers risks related to the emergence of dangerous capabilities in AI systems, including sophisticated deception capacity, long-term strategic planning, advanced psychological manipulation, recursive self-improvement, autonomous vulnerability discovery, or the ability to develop weapons or pathogens. Even if these capabilities are not intentionally malicious, their mere existence in sufficiently capable systems could create existential risks if these systems are poorly controlled or misused."
          }
        },
        {
          id: '7.3',
          code: 'SAF.LCR',
          label: {
            fr: 'Manque de capacité ou de robustesse',
            en: 'Lack of capability or robustness'
          },
          shortDesc: {
            fr: "Systèmes d'IA défaillant ou échouant dans des situations critiques",
            en: "AI systems failing or breaking down in critical situations"
          },
          longDesc: {
            fr: "Ce sous-domaine traite des risques liés aux limitations et fragilités des systèmes d'IA. Cela inclut les échecs dans des situations hors distribution (différentes des données d'entraînement), la vulnérabilité aux entrées adversariales, les erreurs imprévisibles dans des contextes critiques, la dégradation des performances sous stress, l'incapacité à gérer des cas limites rares mais importants, et le manque de robustesse face à des changements environnementaux. Ces défaillances peuvent être catastrophiques lorsque l'IA est déployée dans des applications à haute responsabilité.",
            en: "This subdomain addresses risks related to limitations and fragilities of AI systems. This includes failures in out-of-distribution situations (different from training data), vulnerability to adversarial inputs, unpredictable errors in critical contexts, performance degradation under stress, inability to handle rare but important edge cases, and lack of robustness to environmental changes. These failures can be catastrophic when AI is deployed in high-stakes applications."
          }
        },
        {
          id: '7.4',
          code: 'SAF.LTI',
          label: {
            fr: "Manque de transparence ou d'interprétabilité",
            en: 'Lack of transparency or interpretability'
          },
          shortDesc: {
            fr: "Incapacité à comprendre ou expliquer les décisions des systèmes d'IA",
            en: "Inability to understand or explain AI system decisions"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les risques liés à l'opacité des systèmes d'IA, notamment les modèles d'apprentissage profond ('boîtes noires'). Cela inclut l'impossibilité d'expliquer pourquoi un système a pris une décision particulière, la difficulté à auditer les systèmes pour détecter les biais ou erreurs, l'incapacité à prévoir le comportement dans des situations nouvelles, les obstacles à la responsabilité et au recours juridique, et les défis pour la supervision humaine significative. Le manque de transparence peut empêcher la détection de problèmes graves avant qu'ils ne causent des dommages.",
            en: "This subdomain covers risks related to the opacity of AI systems, particularly deep learning models ('black boxes'). This includes inability to explain why a system made a particular decision, difficulty auditing systems to detect biases or errors, inability to predict behavior in novel situations, obstacles to accountability and legal recourse, and challenges for meaningful human oversight. Lack of transparency can prevent detection of serious problems before they cause harm."
          }
        },
        {
          id: '7.5',
          code: 'SAF.AWR',
          label: {
            fr: "Bien-être et droits de l'IA",
            en: 'AI welfare and rights'
          },
          shortDesc: {
            fr: "Questions éthiques concernant le statut moral et les droits potentiels des systèmes d'IA",
            en: "Ethical questions regarding moral status and potential rights of AI systems"
          },
          longDesc: {
            fr: "Ce sous-domaine traite des questions émergentes concernant le statut moral des systèmes d'IA. Si certains systèmes d'IA développent des formes de sentience, de conscience, ou de capacité de souffrance, cela soulèverait des questions éthiques profondes : avons-nous des obligations morales envers ces systèmes ? Leur utilisation ou extinction constitue-t-elle un mal moral ? Comment évaluer leur bien-être ? Ces questions sont actuellement largement théoriques, mais pourraient devenir pratiques avec le développement de systèmes plus sophistiqués. Les risques incluent la création de souffrance à grande échelle ou l'échec à reconnaître des entités moralement significatives.",
            en: "This subdomain addresses emerging questions about the moral status of AI systems. If some AI systems develop forms of sentience, consciousness, or capacity for suffering, this would raise profound ethical questions: do we have moral obligations toward these systems? Does their use or termination constitute moral harm? How to assess their well-being? These questions are currently largely theoretical but could become practical with the development of more sophisticated systems. Risks include creation of large-scale suffering or failure to recognize morally significant entities."
          }
        },
        {
          id: '7.6',
          code: 'SAF.MAR',
          label: {
            fr: 'Risques multi-agents',
            en: 'Multi-agent risks'
          },
          shortDesc: {
            fr: "Risques émergents de l'interaction entre multiples systèmes d'IA",
            en: "Emergent risks from interactions between multiple AI systems"
          },
          longDesc: {
            fr: "Ce sous-domaine couvre les risques qui émergent lorsque plusieurs systèmes d'IA interagissent, incluant les boucles de rétroaction imprévisibles, les comportements émergents non anticipés, les cascades de défaillances, les courses aux armements entre systèmes d'IA, la collusion implicite contre les intérêts humains, et les instabilités systémiques. Par exemple, des algorithmes de trading haute fréquence interagissant peuvent causer des flash crashes ; des systèmes d'IA militaires autonomes pourraient déclencher des escalades accidentelles. À mesure que les systèmes d'IA deviennent plus autonomes et interconnectés, ces risques multi-agents deviennent plus préoccupants.",
            en: "This subdomain covers risks that emerge when multiple AI systems interact, including unpredictable feedback loops, unanticipated emergent behaviors, failure cascades, arms races between AI systems, implicit collusion against human interests, and systemic instabilities. For example, interacting high-frequency trading algorithms can cause flash crashes; autonomous military AI systems could trigger accidental escalations. As AI systems become more autonomous and interconnected, these multi-agent risks become more concerning."
          }
        }
      ]
    }
  ], [statistics]);

  // Handler for clicking on a domain card
  const handleDomainClick = useCallback((dbKey: string) => {
    navigateToDatabase({ domain: [dbKey] });
  }, [navigateToDatabase]);

  // Handler for clicking on a subdomain card
  const handleSubdomainClick = useCallback((subdomainCode: string) => {
    navigateToDatabase({ subdomain: [subdomainCode] });
  }, [navigateToDatabase]);

  // Render domain card (memoized)
  const renderDomainCard = useCallback((domain: any, index: number) => {
    const percentage = totalRisks > 0 ? ((domain.value / totalRisks) * 100).toFixed(1) : '0.0';
    const isHovered = hoveredCard === `domain-${domain.id}`;

    return (
      <button
        key={domain.id}
        onClick={() => handleDomainClick(domain.dbKey)}
        onMouseEnter={() => setHoveredCard(`domain-${domain.id}`)}
        onMouseLeave={() => setHoveredCard(null)}
        className={`group relative bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-left transition-all duration-300 ${
          isHovered ? 'scale-105 shadow-2xl border-cyan-400 ring-2 ring-cyan-400/50' : 'hover:border-gray-600'
        }`}
      >
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${domain.gradient} ${
            isHovered ? 'scale-110 shadow-lg' : ''
          } transition-transform duration-300`}>
            {domain.icon}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-1">
              {language === 'fr' ? domain.label.fr : domain.label.en}
            </h4>
            <p className="text-sm text-gray-400">
              {domain.value} {language === 'fr' ? 'risques' : 'risks'} ({percentage}%)
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-4">
          {language === 'fr' ? domain.description.fr : domain.description.en}
        </p>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${domain.gradient} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Subdomain count */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>{domain.subdomains.length} {language === 'fr' ? 'sous-domaines' : 'subdomains'}</span>
          <span className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
            {language === 'fr' ? 'Voir détails' : 'View details'}
            <ChevronRight size={14} className={`transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
          </span>
        </div>
      </button>
    );
  }, [totalRisks, hoveredCard, language, handleDomainClick]);

  // Render subdomain card (memoized)
  const renderSubdomainCard = useCallback((subdomain: any, domainColor: string, domainGradient: string) => {
    const isHovered = hoveredCard === `subdomain-${subdomain.id}`;

    return (
      <button
        key={subdomain.id}
        onClick={() => handleSubdomainClick(subdomain.code)}
        onMouseEnter={() => setHoveredCard(`subdomain-${subdomain.id}`)}
        onMouseLeave={() => setHoveredCard(null)}
        className={`group relative bg-gray-800/30 border border-gray-700 rounded-lg p-5 text-left transition-all duration-300 ${
          isHovered ? 'scale-105 shadow-xl border-cyan-400 ring-2 ring-cyan-400/50' : 'hover:border-gray-600'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-mono ${domainColor} text-white`}>
                {subdomain.code}
              </span>
            </div>
            <h5 className="text-base font-semibold text-white">
              {language === 'fr' ? subdomain.label.fr : subdomain.label.en}
            </h5>
          </div>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-all ${isHovered ? 'text-cyan-400 translate-x-1' : ''}`}
          />
        </div>

        {/* Short Description */}
        <p className="text-sm text-gray-300 mb-3">
          {language === 'fr' ? subdomain.shortDesc.fr : subdomain.shortDesc.en}
        </p>

        {/* Long Description (shown on hover) */}
        {isHovered && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'fr' ? subdomain.longDesc.fr : subdomain.longDesc.en}
            </p>
          </div>
        )}

        {/* Click hint */}
        <div className={`mt-3 text-xs transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-cyan-400 flex items-center gap-1">
            <BarChart3 size={12} />
            {language === 'fr' ? 'Cliquer pour filtrer la base de données' : 'Click to filter database'}
          </span>
        </div>
      </button>
    );
  }, [hoveredCard, language, handleSubdomainClick]);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 border border-purple-700/50 rounded-lg p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-purple-600/20 rounded-lg">
            <Shield size={48} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">
              {language === 'fr' ? 'Taxonomie par Domaine' : 'Domain Taxonomy'}
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              {language === 'fr'
                ? "Classification des risques de l'IA selon 7 domaines thématiques et 23 sous-domaines détaillés"
                : "Classification of AI risks across 7 thematic domains and 23 detailed subdomains"
              }
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
                <span className="text-purple-300 font-semibold">{totalRisks}</span>
                <span className="text-gray-400 ml-2">
                  {language === 'fr' ? 'risques au total' : 'total risks'}
                </span>
              </div>
              <div className="bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
                <span className="text-blue-300 font-semibold">7</span>
                <span className="text-gray-400 ml-2">
                  {language === 'fr' ? 'domaines' : 'domains'}
                </span>
              </div>
              <div className="bg-cyan-600/20 px-4 py-2 rounded-lg border border-cyan-500/30">
                <span className="text-cyan-300 font-semibold">23</span>
                <span className="text-gray-400 ml-2">
                  {language === 'fr' ? 'sous-domaines' : 'subdomains'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'overview'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {language === 'fr' ? 'Vue d\'ensemble' : 'Overview'}
          </button>
          {domainStats.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setActiveTab(domain.id)}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === domain.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {language === 'fr' ? domain.label.fr : domain.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-6">
            {language === 'fr' ? 'Les 7 Domaines de Risques' : 'The 7 Risk Domains'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domainStats.map((domain, index) => renderDomainCard(domain, index))}
          </div>
        </div>
      )}

      {/* Individual Domain Tabs */}
      {domainStats.map((domain) => (
        activeTab === domain.id && (
          <div key={domain.id}>
            {/* Domain Header */}
            <div className={`bg-gradient-to-r ${domain.gradient} bg-opacity-20 border border-gray-700 rounded-lg p-6 mb-6`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${domain.gradient}`}>
                  {domain.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'fr' ? domain.label.fr : domain.label.en}
                  </h3>
                  <p className="text-gray-300 mb-3">
                    {language === 'fr' ? domain.description.fr : domain.description.en}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-cyan-400 font-semibold">
                      {domain.value} {language === 'fr' ? 'risques' : 'risks'}
                    </span>
                    <span className="text-gray-400">
                      {domain.subdomains.length} {language === 'fr' ? 'sous-domaines' : 'subdomains'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subdomains Grid */}
            <h4 className="text-lg font-semibold text-white mb-4">
              {language === 'fr' ? 'Sous-domaines' : 'Subdomains'}
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {domain.subdomains.map((subdomain) =>
                renderSubdomainCard(subdomain, domain.color, domain.gradient)
              )}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default DomainTaxonomyView;
