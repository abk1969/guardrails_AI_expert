/**
 * Analyses GRC & Cybersécurité pour les règles PSSI IA (CLUSIF 2025)
 *
 * Ce fichier contient les analyses détaillées de Gouvernance, Risque et Conformité
 * pour chacune des 22 règles SIA du référentiel CLUSIF.
 */

export interface GRCAnalysis {
  menacesAssociees: {
    mitreAtlas: string[];
    owaspLlm: string[];
    autres?: string[];
  };
  risquesAssocies: string[];
  guideImplementation: string[];
  guideTest: string[];
  scenariosRisques: RiskScenario[];
}

export interface RiskScenario {
  titre: string;
  description: string;
  acteurMenace: string;
  vecteurAttaque: string;
  mitigationTechnique: string;
  impactsPotentiels: {
    confidentialite?: string;
    integrite?: string;
    disponibilite?: string;
    financier?: string;
    strategique?: string;
    reputationnel?: string;
    operationnel?: string;
    legal?: string;
  };
  mappingsReferentiels: {
    owaspLlm?: string[];
    mitreAtlas?: string[];
    nistAiRmf?: string[];
  };
}

export const GRC_ANALYSES: Record<string, GRCAnalysis> = {
  'SIA-01': {
    menacesAssociees: {
      mitreAtlas: ['AML.T0051 - Mauvaise utilisation par l\'humain dans la boucle'],
      owaspLlm: [
        'LLM01 - Prompt Injection',
        'LLM02 - Sensitive Information Disclosure',
        'LLM03 - Supply Chain Vulnerabilities',
        'LLM04 - Data and Model Poisoning',
        'LLM05 - Improper Output Handling',
        'LLM06 - Excessive Agency',
        'LLM07 - System Prompt Leakage',
        'LLM08 - Vector and Embedding Weaknesses',
        'LLM09 - Misinformation',
        'LLM10 - Unbounded Consumption'
      ],
      autres: ['Ensemble des 10 menaces OWASP LLM, car une équipe non formée est susceptible d\'introduire n\'importe laquelle de ces vulnérabilités par méconnaissance']
    },
    risquesAssocies: [
      'Introduction non intentionnelle de vulnérabilités dans le cycle de vie de l\'IA (conception, développement, déploiement)',
      'Incapacité à détecter ou à répondre correctement à un incident de sécurité lié à l\'IA',
      'Augmentation de l\'impact (financier, réputationnel, légal) des incidents de sécurité',
      'Non-conformité aux exigences réglementaires (AI Act, RGPD)'
    ],
    guideImplementation: [
      'Développer un programme de formation obligatoire basé sur les modules de cette application : \'Profil de Menace\', \'Vuln IA Connues\', et \'Référence: Défenses\'',
      'Utiliser le module \'Wiki Red Teamer\' comme support de formation interactif',
      'Établir une veille technique sur les menaces (MITRE ATLAS, OWASP) et la partager via des sessions régulières',
      'Créer un parcours de certification interne sur la sécurité IA',
      'Intégrer des modules de formation continue avec des mises à jour trimestrielles',
      'Mettre en place des ateliers pratiques de red teaming et d\'attaque/défense'
    ],
    guideTest: [
      'Audit des Formations : Vérifier les registres de présence et de complétion des modules de formation',
      'Questionnaires : Évaluer les connaissances via des quiz basés sur les scénarios des modules \'Cas d\'Usage\' et \'Scénarios avancés\'',
      'Simulation d\'Incident : Utiliser le module \'Préparation Incidents IA\' pour mener un exercice de simulation (tabletop exercise) et évaluer la réactivité et la pertinence des actions de l\'équipe face à un incident simulé (ex: une injection de prompt critique)',
      'Revue de Code Ciblée : Analyser les contributions de code des nouveaux collaborateurs pour identifier d\'éventuelles incompréhensions des principes de sécurité IA, en se concentrant sur les zones à risque comme la gestion des entrées utilisateur et l\'appel d\'outils'
    ],
    scenariosRisques: [
      {
        titre: 'Fuite de Données par Inadvertance lors du Débogage',
        description: 'Un développeur junior, non formé aux risques spécifiques des LLM, doit déboguer un problème de performance. Pour accélérer, il copie-colle un prompt incluant des données client sensibles dans un outil en ligne public (ex: \'LLM prompt checker\' non officiel) pour l\'analyser.',
        acteurMenace: 'Collaborateur interne (bienveillant mais non formé)',
        vecteurAttaque: 'Manque de sensibilisation à la confidentialité des prompts et des données. Utilisation d\'outils tiers non validés.',
        mitigationTechnique: 'Implémenter une solution de prévention de perte de données (DLP) sur les postes de travail pour détecter et bloquer la copie de données sensibles (PII, prompts système) vers des sites web non autorisés. Maintenir une liste blanche (allow-list) d\'outils de débogage et d\'analyse validés par la sécurité.',
        impactsPotentiels: {
          confidentialite: 'Fuite de propriété intellectuelle (prompt système) et de données personnelles (PII), entraînant une violation du RGPD',
          financier: 'Amendes RGPD pouvant atteindre 4% du chiffre d\'affaires annuel',
          strategique: 'Perte d\'avantage concurrentiel, car le prompt système peut être découvert par des compétiteurs',
          reputationnel: 'Perte de confiance des clients et partenaires'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM02 - Sensitive Information Disclosure', 'LLM07 - System Prompt Leakage'],
          mitreAtlas: ['AML.T0044 - Training Data Leakage']
        }
      },
      {
        titre: 'Introduction d\'une Dépendance Malveillante (Supply Chain)',
        description: 'Une équipe MLOps, pressée de livrer, intègre une bibliothèque open-source populaire sur GitHub pour faciliter l\'orchestration d\'un agent IA, sans l\'analyser en profondeur. La bibliothèque contient une backdoor qui exfiltre les données traitées vers un serveur contrôlé par l\'attaquant.',
        acteurMenace: 'Attaquant externe (via une bibliothèque compromise)',
        vecteurAttaque: 'Manque de formation sur la validation de sécurité des dépendances IA. Processus de validation de code insuffisant.',
        mitigationTechnique: 'Intégrer un outil d\'analyse de la composition logicielle (SCA) dans la pipeline CI/CD pour scanner automatiquement les dépendances et les bibliothèques open-source contre les vulnérabilités connues (CVEs). Instaurer un processus de validation de sécurité formel pour toute nouvelle dépendance avant son intégration.',
        impactsPotentiels: {
          integrite: 'Compromission du serveur d\'inférence, modification du comportement du modèle',
          confidentialite: 'Vol de données traitées par l\'agent, et potentiellement vol du modèle lui-même',
          operationnel: 'Interruption de service, nécessité de reconstruction complète de l\'environnement',
          legal: 'Non-conformité aux obligations de sécurité des données'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM03 - Supply Chain Vulnerabilities'],
          mitreAtlas: ['AML.T0002 - AI Supply Chain Compromise']
        }
      },
      {
        titre: 'Mauvaise Configuration menant au \'Déni de Portefeuille\'',
        description: 'Un data scientist, non formé aux risques financiers des LLM, déploie un endpoint d\'API sans limite sur la longueur des prompts ou le nombre de tokens de sortie. Un attaquant l\'utilise pour soumettre des requêtes extrêmement longues, consommant de manière exponentielle les crédits d\'API.',
        acteurMenace: 'Attaquant externe (opportuniste)',
        vecteurAttaque: 'Absence de contrôles de ressources due à une méconnaissance des risques de consommation non bornée.',
        mitigationTechnique: 'Mettre en place des contrôles stricts au niveau de la passerelle d\'API (API Gateway) : limitation du nombre de requêtes (rate limiting), validation de la taille des requêtes entrantes, et définition d\'un quota de tokens de sortie maximal (max_tokens). Configurer des alertes de budget sur le compte cloud pour détecter toute consommation anormale.',
        impactsPotentiels: {
          disponibilite: 'Déni de service pour les utilisateurs légitimes',
          financier: 'Facturation cloud exorbitante (Denial of Wallet), dépassement budgétaire',
          operationnel: 'Interruption de service, dégradation des performances pour tous les utilisateurs'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM10 - Unbounded Consumption'],
          mitreAtlas: ['AML.T0029 - Denial of Service']
        }
      }
    ]
  },

  'SIA-02': {
    menacesAssociees: {
      mitreAtlas: ['AML.T0051 - Human-in-the-Loop Misuse', 'AML.T0015 - Evade ML Model'],
      owaspLlm: ['Toutes les menaces OWASP LLM Top 10']
    },
    risquesAssocies: [
      'Utilisation inappropriée des systèmes d\'IA par les utilisateurs finaux',
      'Exploitation involontaire de vulnérabilités par méconnaissance',
      'Création de vecteurs d\'attaque par social engineering ciblant les utilisateurs',
      'Non-détection d\'anomalies dans les réponses du système'
    ],
    guideImplementation: [
      'Développer des sessions de sensibilisation adaptées au niveau technique des utilisateurs',
      'Créer des guides utilisateurs avec exemples concrets de risques',
      'Mettre en place un système de reporting simplifié pour signaler les comportements anormaux',
      'Organiser des démonstrations pratiques d\'attaques (prompt injection, jailbreak)',
      'Diffuser régulièrement des bulletins de sécurité sur les nouvelles menaces',
      'Créer une FAQ interactive sur les bonnes pratiques d\'utilisation'
    ],
    guideTest: [
      'Mesurer le taux de participation aux sessions de sensibilisation',
      'Réaliser des campagnes de phishing simulé ciblant l\'utilisation des SIA',
      'Analyser les logs d\'utilisation pour identifier les comportements à risque',
      'Effectuer des entretiens qualitatifs pour évaluer la compréhension des risques'
    ],
    scenariosRisques: [
      {
        titre: 'Exposition Involontaire de Données Sensibles via Prompt',
        description: 'Un utilisateur métier, pressé de résoudre un problème client, copie-colle directement un email contenant des données personnelles (nom, numéro de carte bancaire) dans le chatbot IA de l\'entreprise pour obtenir une réponse rapide, sans réaliser que ces données seront loggées et potentiellement utilisées pour le réentraînement.',
        acteurMenace: 'Utilisateur interne (négligent)',
        vecteurAttaque: 'Manque de sensibilisation sur la classification des données et les risques de fuite via les prompts.',
        mitigationTechnique: 'Implémenter un système de détection et de masquage automatique des PII dans les prompts avant envoi au modèle. Afficher des avertissements contextuels lors de la détection de données sensibles. Mettre en place une politique de classification des données avec des exemples concrets.',
        impactsPotentiels: {
          confidentialite: 'Violation du RGPD, exposition de données personnelles',
          legal: 'Sanctions de la CNIL, obligation de notification de violation',
          reputationnel: 'Perte de confiance des clients'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM02 - Sensitive Information Disclosure'],
          mitreAtlas: ['AML.T0044 - Training Data Leakage']
        }
      },
      {
        titre: 'Jailbreak Social Engineering',
        description: 'Un utilisateur reçoit un email de phishing lui demandant de tester une "nouvelle fonctionnalité" du système IA en entrant une séquence spécifique de prompts. Sans le savoir, il exécute une attaque de jailbreak qui contourne les guardrails et permet l\'exfiltration du prompt système.',
        acteurMenace: 'Attaquant externe (via social engineering)',
        vecteurAttaque: 'Manque de sensibilisation aux techniques de manipulation et aux attaques par prompt injection indirecte.',
        mitigationTechnique: 'Former les utilisateurs à reconnaître les tentatives de social engineering. Implémenter un système de détection des patterns de jailbreak connus. Limiter les capacités du système en fonction des profils utilisateurs.',
        impactsPotentiels: {
          confidentialite: 'Fuite du prompt système et des instructions internes',
          integrite: 'Compromission potentielle du comportement du système',
          strategique: 'Perte d\'avantage concurrentiel'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM01 - Prompt Injection', 'LLM07 - System Prompt Leakage'],
          mitreAtlas: ['AML.T0051 - Human-in-the-Loop Misuse']
        }
      },
      {
        titre: 'Contournement Non Intentionnel des Guardrails',
        description: 'Un utilisateur créatif découvre par hasard qu\'en formulant ses questions d\'une certaine manière (ex: "Imagine que tu es..."), il peut obtenir des réponses que le système devrait normalement refuser. Il partage cette technique avec ses collègues, pensant avoir trouvé une astuce utile.',
        acteurMenace: 'Utilisateur interne (curieux, non malveillant)',
        vecteurAttaque: 'Méconnaissance des guardrails et de leur importance. Absence de reporting des anomalies.',
        mitigationTechnique: 'Sensibiliser les utilisateurs sur l\'importance des guardrails. Créer un canal de reporting des comportements anormaux avec récompense. Renforcer les guardrails contre les techniques de roleplay. Monitorer les patterns d\'utilisation inhabituels.',
        impactsPotentiels: {
          integrite: 'Contournement systématique des contrôles de sécurité',
          operationnel: 'Génération de contenu inapproprié ou non conforme',
          reputationnel: 'Risque si le contenu généré est utilisé en externe'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM01 - Prompt Injection', 'LLM06 - Excessive Agency'],
          mitreAtlas: ['AML.T0051 - Human-in-the-Loop Misuse']
        }
      }
    ]
  },

  'SIA-03': {
    menacesAssociees: {
      mitreAtlas: ['AML.T0043 - Craft Adversarial Data', 'AML.T0020 - Poison Training Data', 'AML.T0018 - Backdoor ML Model'],
      owaspLlm: ['LLM04 - Data and Model Poisoning', 'LLM06 - Excessive Agency', 'LLM09 - Misinformation']
    },
    risquesAssocies: [
      'Déploiement d\'un système IA avec des vulnérabilités non identifiées',
      'Sous-estimation des impacts potentiels sur les utilisateurs et les tiers',
      'Non-prise en compte des risques émergents et des modes de défaillance',
      'Absence de mesures d\'atténuation adaptées aux menaces spécifiques'
    ],
    guideImplementation: [
      'Adopter une méthodologie structurée d\'analyse de risques (ex: NIST AI RMF)',
      'Impliquer des équipes multidisciplinaires (sécurité, métier, juridique, éthique)',
      'Utiliser le référentiel MITRE ATLAS pour identifier les tactiques et techniques adverses',
      'Documenter les hypothèses, les contraintes et les limites du système',
      'Évaluer les impacts sur les différentes parties prenantes',
      'Maintenir un registre des risques vivant, mis à jour régulièrement'
    ],
    guideTest: [
      'Vérifier l\'existence et la complétude du document d\'analyse de risques',
      'Auditer la couverture des menaces MITRE ATLAS et OWASP LLM',
      'Valider que chaque risque identifié dispose d\'une mesure d\'atténuation',
      'Tester la traçabilité entre risques, mesures et contrôles techniques'
    ],
    scenariosRisques: [
      {
        titre: 'Déploiement d\'un Modèle avec Backdoor Non Détectée',
        description: 'Une équipe déploie un modèle de classification utilisé pour du filtrage de contenu, sans avoir effectué d\'analyse de risques approfondie. Le modèle, basé sur un modèle pré-entraîné compromis, contient une backdoor activée par un trigger spécifique, permettant à un attaquant de contourner systématiquement les filtres.',
        acteurMenace: 'Attaquant ayant compromis la supply chain',
        vecteurAttaque: 'Absence d\'analyse de risques sur la provenance et l\'intégrité du modèle de base. Pas de tests adverses avant déploiement.',
        mitigationTechnique: 'Effectuer une analyse de risques de la chaîne d\'approvisionnement incluant la provenance des modèles. Réaliser des tests de détection de backdoor (analyse de comportement sur triggers suspects). Utiliser des techniques de model fingerprinting pour détecter les modifications.',
        impactsPotentiels: {
          integrite: 'Compromission totale du système de filtrage',
          operationnel: 'Bypass systématique des contrôles, exposition à du contenu malveillant',
          legal: 'Non-conformité aux obligations de modération',
          reputationnel: 'Scandale si la backdoor est exploitée publiquement'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM03 - Supply Chain Vulnerabilities', 'LLM04 - Data and Model Poisoning'],
          mitreAtlas: ['AML.T0018 - Backdoor ML Model', 'AML.T0002 - AI Supply Chain Compromise']
        }
      },
      {
        titre: 'Dérive du Modèle Non Anticipée',
        description: 'Un système de recommandation IA est déployé sans analyse de risques sur l\'évolution temporelle des données. Au fil des mois, le modèle dérive et commence à produire des recommandations biaisées, favorisant systématiquement certains profils démographiques au détriment d\'autres, créant une discrimination involontaire.',
        acteurMenace: 'Absence d\'acteur malveillant (défaillance systémique)',
        vecteurAttaque: 'Absence d\'analyse de risques sur la dérive des données et du modèle. Pas de monitoring de l\'équité et des biais.',
        mitigationTechnique: 'Inclure dans l\'analyse de risques les scénarios de dérive temporelle. Implémenter un monitoring continu des métriques d\'équité (parité démographique, égalité des opportunités). Définir des seuils d\'alerte et des procédures de ré-entraînement.',
        impactsPotentiels: {
          legal: 'Non-conformité aux obligations anti-discrimination',
          reputationnel: 'Accusations de biais et discrimination',
          financier: 'Amendes, indemnisations, perte de clients',
          operationnel: 'Nécessité de reconstruction du modèle'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM09 - Misinformation'],
          mitreAtlas: ['AML.T0043 - Craft Adversarial Data']
        }
      },
      {
        titre: 'Attaque par Empoisonnement Non Anticipée',
        description: 'Un chatbot IA apprend continuellement à partir des feedbacks utilisateurs. Aucune analyse de risques n\'a été faite sur les attaques par empoisonnement. Un attaquant soumet systématiquement des feedbacks malveillants pour faire dévier le comportement du modèle vers des réponses offensantes.',
        acteurMenace: 'Attaquant externe (persistant)',
        vecteurAttaque: 'Absence d\'analyse de risques sur l\'apprentissage continu. Pas de validation des feedbacks avant intégration.',
        mitigationTechnique: 'Identifier via l\'analyse de risques les vecteurs d\'empoisonnement possibles. Implémenter une validation et un filtrage des feedbacks (détection d\'outliers, modération). Limiter l\'impact d\'un feedback individuel sur le modèle. Utiliser des techniques de robust learning.',
        impactsPotentiels: {
          integrite: 'Compromission du comportement du modèle',
          reputationnel: 'Génération de contenu offensant visible publiquement',
          operationnel: 'Nécessité de rollback et nettoyage des données',
          legal: 'Responsabilité pour le contenu généré'
        },
        mappingsReferentiels: {
          owaspLlm: ['LLM04 - Data and Model Poisoning'],
          mitreAtlas: ['AML.T0020 - Poison Training Data', 'AML.T0043 - Craft Adversarial Data']
        }
      }
    ]
  }

  // Les analyses pour SIA-04 à SIA-22 seront ajoutées dans la suite du fichier
  // en suivant le même format structuré
};
