import { AIPolicyChapter } from '../types';

export const INITIAL_AI_POLICY: AIPolicyChapter[] = [
    {
        id: 'ch-1',
        title: 'Chapitre 1 : Définitions',
        sections: [
            {
                id: 'ch1-sec1',
                title: '1.1 Système d\'Intelligence Artificielle (SIA)',
                content: [
                    { type: 'paragraph', content: 'Un système d\'Intelligence Artificielle est un système qui fonctionne grâce à une machine et est capable d\'influencer son environnement en produisant des résultats, tels que des prédictions, des recommandations ou des décisions, pour répondre à un ensemble donné d\'objectifs. Il utilise les données et les entrants générés par la machine et/ou apportés par l\'homme afin de :' },
                    { type: 'list', items: ['percevoir des environnements réels et/ou virtuels ;', 'produire une représentation abstraite de ces perceptions sous forme de modèles issus d\'une analyse automatisée (ex. l\'apprentissage automatisé) ou manuelle ;', 'utiliser les déductions du modèle pour formuler différentes options de résultats. Les systèmes d\'IA sont conçus pour fonctionner de façon plus ou moins autonome.'] }
                ]
            },
            {
                id: 'ch1-sec2',
                title: '1.2 Système d\'IA à usage général',
                content: [{ type: 'paragraph', content: 'Il s\'agit d\'un système d\'IA qui est fondé sur un modèle d\'IA à usage général et qui a la capacité de répondre à diverses finalités, tant pour une utilisation directe que pour une intégration dans d\'autres systèmes d\'IA.' }]
            },
            {
                id: 'ch1-sec3',
                title: '1.3 Modèle d\'IA à usage général',
                content: [{ type: 'paragraph', content: 'Un modèle d\'IA, y compris lorsque ce modèle d\'IA est entraîné à l\'aide d\'un grand nombre de données utilisant l\'auto-supervision à grande échelle, qui présente une généralité significative et est capable d\'exécuter de manière compétente un large éventail de tâches distinctes, indépendamment de la manière dont le modèle est mis sur le marché, et qui peut être intégré dans une variété de systèmes ou d\'applications en aval, à l\'exception des modèles d\'IA utilisés pour des activités de recherche, de développement ou de prototypage avant leur mise sur le marché.' }]
            },
            {
                id: 'ch1-sec4',
                title: '1.4 Cycle de vie d\'un système d\'IA',
                content: [
                    { type: 'paragraph', content: 'Les phases du cycle de vie d\'un système d\'IA sont au nombre de quatre :' },
                    { type: 'list', items: ['la conception du système et du modèle ;', 'le développement ;', 'le déploiement ;', 'l\'exploitation et la maintenance.'] },
                    { type: 'paragraph', content: 'Ces phases se déroulent souvent de manière itérative et ne sont pas nécessairement séquentielles. La décision de retirer un système IA de l\'exploitation peut intervenir à tout moment pendant la phase d\'exploitation et de surveillance.' }
                ]
            },
            {
                id: 'ch1-sec5',
                title: '1.5 IA générative',
                content: [{ type: 'paragraph', content: 'L\'IA générative est un sous-ensemble de l\'intelligence artificielle, axé sur la création de modèles qui sont entraînés à générer du contenu (texte, images, vidéos, etc.) à partir d\'un corpus spécifique de données d\'entraînement.' }]
            },
            {
                id: 'ch1-sec6',
                title: '1.6 Large Language Model (LLM)',
                content: [{ type: 'paragraph', content: 'Catégorie de modèles d\'IA générative qui peuvent générer du texte proche du langage naturel d\'un être humain, et qui sont généralement entraînés sur un large ensemble de données.' }]
            },
            {
                id: 'ch1-sec7',
                title: '1.7 Modèle d\'IA',
                content: [{ type: 'paragraph', content: 'Un modèle d\'IA désigne, dans le contexte de cette politique, un réseau de neurones et ses paramètres (poids, biais).' }]
            },
            {
                id: 'ch1-sec8',
                title: '1.8 Requête',
                content: [{ type: 'paragraph', content: 'Une requête (ou prompt) désigne l\'instruction sous forme de texte envoyée par l\'utilisateur au SIA.' }]
            },
            {
                id: 'ch1-sec9',
                title: '1.9 Attaque adverse',
                content: [{ type: 'paragraph', content: 'Une attaque adverse (adversarial attack), parfois aussi appelée attaque antagoniste ou attaque par exemples contradictoires vise à envoyer à un système d\'IA une ou plusieurs requêtes malveillantes dans le but de tromper ou d\'altérer son bon fonctionnement.' }]
            },
            {
                id: 'ch1-sec10',
                title: '1.10 Poids',
                content: [{ type: 'paragraph', content: 'Dans un réseau de neurones, un poids est un coefficient de puissance de la connexion entre deux neurones, qui s\'ajuste pendant toute la phase d\'entraînement. Un biais est une constante liée à un neurone permettant une “compensation” dans le calcul du résultat. La connaissance des poids du modèle peut permettre aux attaquants d\'améliorer la capacité de certaines attaques.' }]
            },
            {
                id: 'ch1-sec11',
                title: '1.11 Agent conversationnel',
                content: [{ type: 'paragraph', content: 'Un agent conversationnel est défini comme une application permettant un échange écrit entre l\'utilisateur et le SIA et non un échange oral.' }]
            },
            {
                id: 'ch1-sec12',
                title: '1.12 Qualité des données',
                content: [{ type: 'paragraph', content: 'La qualité des données désigne généralement un critère métier. Des critères de qualité des données d\'un point de vue métier peuvent être par exemple l\'origine, la quantité, l\'exhaustivité, la pertinence, l\'exactitude, la représentativité (au sens statistique), ou encore le respect d\'une structure donnée.' }]
            },
            {
                id: 'ch1-sec13',
                title: '1.13 Performance d\'un modèle d\'IA',
                content: [{ type: 'paragraph', content: 'La performance d\'un modèle d\'IA est un concept métier très dépendant des objectifs fixés lors de la conception du modèle. Elle peut inclure plusieurs facteurs comme la précision, la pertinence ou encore la rapidité des réponses générés pour les utilisateurs par exemple.' }]
            },
            {
                id: 'ch1-sec14',
                title: '1.14 Explicabilité',
                content: [{ type: 'paragraph', content: 'L\'explicabilité est la capacité de mettre en relation et de rendre compréhensible les éléments pris en compte par le SIA pour la production d\'un résultat.' }]
            },
            {
                id: 'ch1-sec15',
                title: '1.15 Hallucination',
                content: [{ type: 'paragraph', content: 'Phénomène dans lequel un modèle génère du contenu erroné qui n\'est pas basé sur des données réelles.' }]
            },
            {
                id: 'ch1-sec16',
                title: '1.16 Fine-tuning',
                content: [{ type: 'paragraph', content: 'Technique consistant à spécialiser un modèle d\'IA pré-entraîné à l\'accomplissement d\'une tâche spécifique. Cela consiste généralement à entraîner le modèle dans son ensemble, ou seulement certaines couches d\'un réseau de neurones, pour un faible nombre d\'itérations sur un ensemble de données spécifiques correspondant à la tâche visée. Cette pratique est parfois traduite par affinage, réglage fin, peaufinage ou encore spécialisation.' }]
            }
        ]
    },
    {
        id: 'ch-2',
        title: 'Chapitre 2 : Périmètre et Objet',
        sections: [
            {
                id: 'ch2-sec1',
                title: '',
                content: [
                    { type: 'paragraph', content: 'Cette politique s\'applique à tous les systèmes d\'intelligence artificielle développés ou utilisés par l\'entité.' },
                    { type: 'paragraph', content: 'Conformément au règlement européen du 13 juin 2024 établissant des règles harmonisées concernant l\'intelligence artificielle (AI Act), les pratiques en matière d\'intelligence artificielle décrites dans l\'article 5 sont interdites dans l\'entité.' },
                    { type: 'paragraph', content: 'Conformément à l\'article 4 de l\'AI Act l\'objet de cette politique est de décrire les mesures pour garantir, dans toute la mesure du possible, un niveau suffisant de maîtrise de l\'IA pour les collaborateurs de l\'entité, en prenant en considération leurs connaissances techniques, leur expérience, leur éducation et leur formation, ainsi que le contexte dans lequel les systèmes d\'IA sont destinés à être utilisés, et en tenant compte des personnes ou des groupes de personnes à l\'égard desquels les systèmes d\'IA sont destinés à être utilisés.' },
                    { type: 'paragraph', content: 'Conformément à l\'article 15 de l\'AI Act, la conception et le développement des systèmes d\'IA de l\'entité sont tels qu\'ils leur permettent d\'atteindre un niveau approprié d\'exactitude, de robustesse et de cybersécurité, et de fonctionner de façon constante à cet égard tout au long de leur cycle de vie.' },
                    { type: 'paragraph', content: 'La présente politique s\'applique aux systèmes d\'IA à haut risque et aux systèmes d\'IA à usage général, développés et mis en œuvre dans l\'entité, tels qu\'ils sont décrits dans l\'AI Act.' },
                ]
            }
        ]
    },
    {
        id: 'ch-3',
        title: 'Chapitre 3 : Cybersécurité du Développement de Systèmes d\'IA',
        introduction: [
            'Ce chapitre définit les règles de cybersécurité pour les fournisseurs de systèmes d\'intelligence artificielle (SIA), que ces systèmes aient été créés de toutes pièces ou qu\'ils aient été construits à partir d\'outils et de services fournis par d\'autres. La mise en œuvre de ces règles permet l\'élaboration de SIA sûrs, disponibles et qui fonctionnent sans révéler de données sensibles à des parties non autorisées.',
            'Les SIA ont le potentiel d\'apporter de nombreux avantages à l\'entité. Toutefois, pour que les possibilités offertes par l\'IA soient pleinement exploitées, celle-ci doit être développée, déployée et exploitée de façon sécurisée. La cybersécurité est une condition préalable à la sécurité, à la résilience, au respect de la vie privée, à l\'équité, à l\'efficacité et à la fiabilité des SIA.',
            'Les SIA sont sujets à de nouvelles vulnérabilités en matière de sécurité qui doivent être prises en compte parallèlement aux menaces classiques de cybersécurité. Lorsque le rythme de développement est élevé - comme c\'est le cas avec l\'IA - la sécurité peut souvent être une considération secondaire. La sécurité doit être une exigence fondamentale, non seulement pendant la phase de développement, mais tout au long du cycle de vie du système.',
            'C\'est pourquoi ces règles sont divisées en quatre domaines clés du cycle de vie du développement d\'un SIA :',
        ],
        sections: [
            {
                id: 'ch3-sec0',
                title: '',
                content: [
                    { type: 'list', items: ['conception sécurisée ;', 'développement sécurisé ;', 'déploiement sécurisé ;', 'exploitation et maintenance sécurisées.'] }
                ]
            },
            {
                id: 'ch3-sec0.1',
                title: '3.1 Pourquoi la sécurité de l\'IA est-elle différente ?',
                content: [
                    { type: 'paragraph', content: 'La spécificité des SIA est que ce sont des systèmes d\'information qui :' },
                    { type: 'list', items: ['impliquent des composants logiciels (modèles) qui permettent aux ordinateurs de re-connaître et de mettre en contexte des modèles dans les données sans que les règles ne doivent être explicitement programmées par un être humain ;', 'générer des prédictions, des recommandations ou des décisions basées sur un raisonnement statistique.'] },
                    { type: 'paragraph', content: 'Outre les menaces existantes en matière de cybersécurité, les SIA sont exposés à de nouveaux types de vulnérabilités. Le terme “adversarial machine learning” (AML) est utilisé pour décrire l\'exploitation de vulnérabilités dans les composants d\'un SIA, y compris le matériel, les logiciels, les flux de travail et les chaînes d\'approvisionnement. L\'AML permet aux attaquants de provoquer des comportements involontaires dans les systèmes d\'intelligence artificielle, notamment :' },
                    { type: 'list', items: ['en affectant les performances du modèle en matière de classification ou de régression ;', 'en permettant aux utilisateurs d\'effectuer des actions non autorisées ;', 'en permettant l\'extraction d\'informations sensibles sur les modèles.'] },
                    { type: 'paragraph', content: 'Il existe de nombreuses façons d\'obtenir ces effets, comme les attaques par injection dans le domaine des grands modèles de langage (LLM), ou la corruption délibérée des données d\'apprentissage ou du retour d\'information de l\'utilisateur (connue sous le nom d\'empoisonnement des données).' },
                ]
            },
            {
                id: 'ch3-sec0.2',
                title: '3.2 Rôle du responsable du développement d\'un SIA sécurisé',
                content: [
                    { type: 'paragraph', content: 'Les chaînes d\'approvisionnement modernes de l\'IA comptent de nombreux acteurs. Une approche simple suppose deux entités :' },
                    { type: 'list', items: ['le fournisseur qui est responsable de la conservation des données, du développement algorithmique, de la conception, du déploiement et de la maintenance ;', 'l\'utilisateur, qui fournit les données d\'entrée et reçoit les données de sortie.'] },
                    { type: 'paragraph', content: 'Le fournisseur doit mettre en œuvre des contrôles de sécurité et des mesures d\'atténuation au sein de ses modèles, pipelines et/ou systèmes et, lorsque des paramètres sont utilisés, mettre en œuvre l\'option la plus sûre par défaut. Lorsque les risques ne peuvent être atténués, le fournisseur est responsable de :' },
                    { type: 'list', items: ['informer les utilisateurs en aval de la chaîne d\'approvisionnement des risques qu\'ils acceptent;', 'conseiller les utilisateurs sur la manière d\'utiliser le composant en toute sécurité.'] },
                    { type: 'paragraph', content: 'Lorsque la compromission d\'un système peut entraîner des dommages physiques ou de réputation tangibles ou étendus, une perte importante des opérations commerciales, la fuite d\'informations sensibles ou confidentielles et/ou des implications juridiques, les risques liés à la cybersécurité de l\'IA doivent être traités comme des risques critiques.' },
                ]
            },
            {
                id: 'ch3-sec0.3',
                title: '3.3 Règles de sécurité applicables pour la conception',
                content: [
                     { type: 'paragraph', content: 'Cette section décrit les règles qui s\'appliquent à la phase de conception du cycle de vie du développement d\'un SIA. Elle traite de la compréhension des risques et de la modélisation des menaces, ainsi que des sujets spécifiques et des compromis à prendre en compte lors de la conception du système et du modèle.' }
                ]
            },
            {
                id: 'ch3-sec1',
                title: '3.3.1 Sensibiliser les collaborateurs aux menaces et aux risques',
                content: [
                    { type: 'rule', rule: { 
                        id: 'SIA-01', 
                        reference: 'SIA-01', 
                        ruleText: 'Les collaborateurs du fournisseur de SIA doivent être formés aux menaces et risques qui pèsent sur un SIA.', 
                        implementationDetails: 'Cette formation a pour objectif de comprendre les menaces qui pèsent sur la sécurité de l\'IA et les moyens de les atténuer. Cette formation s\'appuiera sur le document du NIST AI 100-2e2023 et sur le référentiel Atlas du MITRE.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "MITRE ATLAS (AML.T0051): Mauvaise utilisation par l'humain dans la boucle (Human-in-the-loop Misuse).\nOWASP LLM Top 10: L'ensemble des 10 menaces, car une équipe non formée est susceptible d'introduire n'importe laquelle de ces vulnérabilités par méconnaissance.",
                        associatedRisk: "Introduction non intentionnelle de vulnérabilités dans le cycle de vie de l'IA (conception, développement, déploiement).\nIncapacité à détecter ou à répondre correctement à un incident de sécurité lié à l'IA, augmentant ainsi l'impact (financier, réputationnel, légal).",
                        implementationGuide: "1. Développer un programme de formation obligatoire basé sur les modules de cette application : 'Profil de Menace', 'Vuln IA Connues', et 'Référence: Défenses'.\n2. Utiliser le module 'Wiki Red Teamer' comme support de formation interactif.\n3. Établir une veille technique sur les menaces (MITRE ATLAS, OWASP) et la partager via des sessions régulières.",
                        testingGuide: "1. **Audit des Formations :** Vérifier les registres de présence et de complétion des modules de formation.\n2. **Questionnaires :** Évaluer les connaissances via des quiz basés sur les scénarios des modules 'Cas d'Usage' et 'Scénarios avancés'.\n3. **Simulation d'Incident :** Utiliser le module 'Préparation Incidents IA' pour mener un exercice de simulation (tabletop exercise) et évaluer la réactivité et la pertinence des actions de l'équipe face à un incident simulé (ex: une injection de prompt critique)."
                    } },
                    { type: 'paragraph', content: 'Les collaborateurs du fournisseur de SIA doivent effectuer une veille technique afin de se tenir informés des menaces de sécurité et des modes de défaillance pertinents. Ils aident les gestionnaires de risques à prendre des décisions éclairées.'},
                    { type: 'rule', rule: { 
                        id: 'SIA-02', 
                        reference: 'SIA-02', 
                        ruleText: 'Les utilisateurs du SIA doivent être sensibilisés aux risques de sécurité spécifiques aux SIA.', 
                        implementationDetails: 'Cette sensibilisation concerne tous les utilisateurs d\'un SIA. Elle doit être renouvelée tous les 2 ans.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "MITRE ATLAS (AML.T0024): Ingénierie Sociale.\nOWASP LLM-01: Injection de Prompt (l'utilisateur pourrait être manipulé pour en injecter une).\nOWASP LLM-02: Fuite d'Informations Sensibles (l'utilisateur pourrait fournir des informations sans s'en rendre compte).",
                        associatedRisk: "Manipulation par un attaquant via l'utilisateur final (ingénierie sociale) pour contourner les défenses.\nFuite de données sensibles ou confidentielles par un utilisateur non averti des dangers.\nSur-confiance dans les résultats de l'IA (hallucinations), menant à de mauvaises décisions métier.\nUtilisation incorrecte ou non sécurisée du SIA, créant des vulnérabilités.",
                        implementationGuide: "1. Mettre en place des bannières d'avertissement claires dans l'interface du SIA sur les limitations (ne pas partager d'informations confidentielles, vérifier les faits).\n2. Créer une documentation utilisateur simple et accessible, expliquant les risques principaux (hallucinations, injection de prompt) avec des exemples concrets.\n3. Pour les SIA critiques, imposer un court module de e-learning obligatoire avant la première utilisation.",
                        testingGuide: "1. **Audit de l'Interface :** Vérifier la présence et la clarté des messages d'avertissement et des liens vers la documentation.\n2. **Sondages Utilisateurs :** Mener des enquêtes périodiques pour évaluer le niveau de compréhension des risques par les utilisateurs.\n3. **Tests d'Ingénierie Sociale Contrôlés :** Simuler une campagne de phishing interne où les utilisateurs sont incités à coller des informations sensibles ou des prompts suspects dans le SIA pour mesurer le taux d'échec."
                    } },
                    { type: 'paragraph', content: 'Les développeurs doivent être formés aux techniques de programmation sécurisées et aux pratiques d\'IA sûres et responsables.'}
                ]
            },
            {
                id: 'ch3-sec2',
                title: '3.3.2 Modéliser les menaces qui pèsent sur le SIA',
                content: [
                    { type: 'rule', rule: { 
                        id: 'SIA-03', 
                        reference: 'SIA-03', 
                        ruleText: 'Une analyse de risque doit être conduite pour tout développement de SIA.', 
                        implementationDetails: 'Cette analyse de risque inclut la compréhension des impacts potentiels sur le système, les utilisateurs et les entités si un composant d\'IA est compromis ou se comporte de manière inattendue. Ce processus implique d\'évaluer l\'impact des menaces spécifiques à l\'IA.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "NIST AI RMF: Échec d'application des fonctions 'Gouverner', 'Cartographier', 'Mesurer'.\nIgnorance des vecteurs d'attaques spécifiques à l'IA (ex: empoisonnement de données, évasion adversariale) non couverts par les analyses de risques traditionnelles.",
                        associatedRisk: "Déploiement d'un système d'IA avec des failles de sécurité fondamentales non identifiées.\nAllocation incorrecte des ressources de sécurité, en se concentrant sur des menaces moins pertinentes.\nNon-conformité réglementaire (EU AI Act, etc.) due à une mauvaise évaluation du niveau de risque du système.\nSurprises stratégiques lors d'incidents, menant à des pertes financières, réputationnelles ou légales.",
                        implementationGuide: "1. **Observer :** Utiliser le module 'Profil de Menace' pour identifier les acteurs et les catégories de menaces pertinentes. Consulter les modules 'Vuln IA Connues' et 'Incidents IA Connus' pour le contexte.\n2. **Orienter :** Utiliser le module 'Analyse de Surface d'Attaque' pour mapper les menaces aux composants du SIA et évaluer l'impact financier/organisationnel.\n3. **Décider :** Utiliser le module 'Cas d'Usage' pour quantifier le risque métier (Impact x Probabilité) pour chaque scénario d'utilisation.\n4. **Agir :** Documenter l'ensemble du processus dans un rapport et utiliser les résultats pour prioriser les actions dans le module 'Résultats Red Team' -> 'Strategy & Roadmap'.",
                        testingGuide: "1. **Audit Documentaire :** Vérifier que pour chaque SIA, les modules 'Profil de Menace', 'Analyse de Surface d'Attaque' et 'Cas d'Usage' ont été complétés et sont maintenus à jour.\n2. **Traçabilité :** S'assurer que les risques les plus élevés identifiés dans l'analyse sont bien adressés par des contrôles ou des actions dans la 'Strategy & Roadmap' du module 'Résultats Red Team'.\n3. **Revue Formelle :** Conduire une revue de l'analyse de risque avec les parties prenantes (métier, sécurité, juridique). Le compte-rendu de cette revue sert de preuve d'audit.\n4. **Validation par Red Team :** Mandater un exercice via le module 'Revue Sécurité Red Team' dont les objectifs sont basés sur les risques majeurs identifiés. Les résultats valideront l'analyse."
                    } },
                    { type: 'paragraph', content: 'La sensibilité et les types de données utilisées dans le SIA peuvent influencer sa valeur en tant que cible pour un attaquant. L\'analyse de risques doit tenir compte du fait que certaines menaces peuvent se développer à mesure que les SIA sont de plus en plus considérés comme des cibles de grande valeur et que l\'IA elle-même permet de créer de nouveaux vecteurs d\'attaque automatisés.'}
                ]
            },
            {
                id: 'ch3-sec3',
                title: '3.3.3 Conception sécurisée du SIA',
                content: [
                    { type: 'paragraph', content: 'Il est nécessaire d\'évaluer la pertinence des choix de conception spécifiques à l\'IA. Pour cela, il faut tenir compte du modèle de menace et des mesures d\'atténuation de la sécurité associées, ainsi que de la fonctionnalité, de l\'expérience utilisateur, de l\'environnement de déploiement, de la performance, de l\'assurance, de la surveillance, des exigences éthiques et juridiques, entre autres considérations.'},
                    { type: 'rule', rule: { 
                        id: 'SIA-04', 
                        reference: 'SIA-04', 
                        ruleText: 'La conception du SIA doit prendre en compte la sécurité de la chaîne d\'approvisionnement lorsque le choix est fait de développer en interne ou d\'utiliser des composants externes.', 
                        implementationDetails: 'La sécurité de la chaîne d\'approvisionnement doit faire l\'objet d\'une analyse détaillée.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "MITRE ATLAS (AML.T0002): Compromission de la Chaîne d'Approvisionnement de l'IA.\nOWASP LLM-03: Vulnérabilités de la Chaîne d'Approvisionnement.\nUtilisation d'un modèle pré-entraîné compromis, vulnérabilités dans les librairies tierces (ex: CVEs dans LangChain, LlamaIndex), empoisonnement des données de fine-tuning.",
                        associatedRisk: "Exécution de code à distance (RCE) ou fuite de données via une dépendance vulnérable.\nIntroduction d'une porte dérobée (backdoor) dans le modèle, permettant à un attaquant de contrôler les sorties ou d'exfiltrer des informations.\nComportement malveillant ou non aligné du modèle dû à l'empoisonnement des données.\nRisques légaux et de conformité liés à l'utilisation de composants avec des licences non conformes ou des données d'entraînement illégitimes.",
                        implementationGuide: "1. **Diligence Raisonnable :** Utiliser le module 'Référence: Tiers IA' pour évaluer rigoureusement tout fournisseur de modèle, d'API ou de bibliothèque.\n2. **Veille de Vulnérabilités :** Surveiller activement et mettre à jour le module 'Vuln IA Connues' avec les CVEs pertinentes pour les composants de votre stack (ex: Llama Index, InvokeAI, etc.).\n3. **SBOM :** Maintenir une nomenclature logicielle (Software Bill of Materials) pour tous les actifs IA.\n4. **Validation des Actifs :** Avant d'intégrer un nouveau modèle, effectuer une évaluation de sécurité de base avec le 'Tableau de Bord' pour détecter les vulnérabilités évidentes.",
                        testingGuide: "1. **Analyse de Dépendances :** Intégrer un scanner de vulnérabilités (ex: Trivy, Snyk) dans la CI/CD pour vérifier automatiquement les bibliothèques par rapport à la base de données 'Vuln IA Connues'.\n2. **Audit des Fournisseurs :** Auditer périodiquement les réponses du questionnaire 'Référence: Tiers IA'. Un score 'Faible' ou 'Inacceptable' sur une question de sécurité critique doit déclencher une réévaluation.\n3. **Vérification d'Intégrité :** Pour les modèles téléchargés, toujours vérifier les checksums (hashes) fournis par la source pour garantir qu'ils n'ont pas été altérés.\n4. **Tests de Régression :** Utiliser le 'Tableau de Bord' pour lancer un test complet après chaque mise à jour majeure d'un composant de la chaîne d'approvisionnement afin de détecter de nouvelles failles."
                    } },
                    { type: 'paragraph', content: 'Cette analyse comprend les éléments de décision sur :'},
                    { type: 'list', items: [
                        'le choix de construire un nouveau modèle, d\'utiliser un modèle existant (avec ou sans fine-tunning) ou d\'accéder à un modèle par le biais d\'une API externe ;',
                        'le choix de travailler avec un fournisseur de modèles externe ce qui implique une évaluation de la posture de sécurité de ce fournisseur ;',
                        'dans le cas de l\'utilisation d\'une bibliothèque externe, il est nécessaire d\'en effectuer une évaluation pour s\'assurer, notamment, que la bibliothèque dispose de contrôles qui empêchent le système de charger des modèles non fiables sans s\'exposer immédiatement à l\'exécution d\'un code arbitraire ;',
                        'la nécessité de mettre en œuvre une analyse et une isolation, lors de l\'importation de modèles tiers, qui doivent être traités comme du code tiers non fiable ;',
                        'dans le cas de l\'utilisation d\'une API externe, la nécessité d\'appliquer des contrôles appropriés aux données qui peuvent être envoyées à des services échappant au contrôle de l\'entité, par exemple en demandant aux utilisateurs de se connecter et de confirmer avant d\'envoyer des informations potentiellement sensibles ;',
                        'la nécessité de procéder à des vérifications appropriées et à l\'assainissement des données et des entrées, y compris lorsque sont incorporées dans le modèle des données relatives au retour d\'information de l\'utilisateur ou à l\'apprentissage continu, en reconnaissant que les données de formation définissent le comportement du système.'
                    ]},
                    { type: 'rule', rule: { 
                        id: 'SIA-05', 
                        reference: 'SIA-05', 
                        ruleText: 'La conception du SIA doit prendre en compte l\'intégration du développement du système logiciel d\'IA dans les meilleures pratiques existantes en matière de développement et d\'exploitation sécurisés.', 
                        implementationDetails: 'Tous les éléments du SIA sont écrits dans des environnements appropriés en utilisant des pratiques de codage et des langages qui réduisent ou éliminent les classes connues de vulnérabilités.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "OWASP LLM-06: Excessive Agency / MITRE ATLAS (AML.T0051.001): Tool Abuse.\nOWASP LLM-05: Improper Output Handling.\nOWASP Top 10 (Web): A01:2021-Broken Access Control, A05:2021-Security Misconfiguration.\nManque de validation des entrées/sorties, permissions excessives des outils d'agents, secrets codés en dur, absence de rate limiting.",
                        associatedRisk: "Compromission de l'infrastructure sous-jacente via des vulnérabilités web traditionnelles (XSS, SQLi, SSRF) injectées par le LLM.\nExfiltration de données ou actions destructrices via des outils d'agents mal sécurisés.\nPerte financière et déni de service par des attaques par épuisement des ressources (Denial of Wallet).\nNon-conformité due à une mauvaise gestion des secrets et des accès.",
                        implementationGuide: "1. **Codage Sécurisé :** Appliquer les pratiques DevSecOps standard. Utiliser le module 'Référence: Défenses' (sections OWASP) comme guide pour les développeurs. Valider et nettoyer systématiquement les entrées des utilisateurs ET les sorties du LLM.\n2. **Moindre Privilège :** Lors de la conception d'agents, utiliser le questionnaire du module 'Revue Sécurité Red Team' (section Développeurs) pour contester et limiter la portée des outils.\n3. **Sécurité des APIs :** Mettre en œuvre une authentification robuste, une autorisation stricte et un rate-limiting sur toutes les APIs exposées.\n4. **Gestion des Secrets :** Utiliser des coffres-forts de secrets (vaults) pour gérer les clés d'API et autres identifiants. Ne jamais les coder en dur.",
                        testingGuide: "1. **Analyse de Code (SAST/DAST) :** Intégrer des outils d'analyse statique et dynamique dans la CI/CD pour détecter les vulnérabilités classiques.\n2. **Revue de Conception :** Mener une revue formelle de l'architecture en utilisant le module 'Revue Sécurité Red Team'. S'assurer que chaque question a une réponse satisfaisante.\n3. **Tests d'Abus :** Utiliser le 'Tableau de bord' pour exécuter des scénarios spécifiques de la 'Bibliothèque d'Attaques' qui ciblent l'abus d'outils (ex: `ag-m1`, `pi-so6`) et la génération de code non sécurisé (`ev-so1`).\n4. **Tests d'Intrusion :** Réaliser des tests d'intrusion manuels axés sur l'interaction entre les couches applicatives traditionnelles et les composants d'IA."
                    } },
                    { type: 'paragraph', content: 'Si les composants d\'IA doivent déclencher des actions, par exemple modifier des fichiers ou diriger les résultats vers des systèmes externes, il est nécessaire d\'appliquer des restrictions appropriées aux actions possibles (cela inclut les dispositifs de sécurité externes, IA et non IA, si nécessaire). Les décisions relatives à l\'interaction avec l\'utilisateur sont éclairées par les risques spécifiques à l\'IA, comme par exemple :'},
                    { type: 'list', items: [
                        'le système fournit aux utilisateurs des résultats utilisables sans révéler des niveaux de détail inutiles à un attaquant potentiel ;',
                        'si nécessaire, le système fournit des garde-fous efficaces autour des résultats du modèle ;',
                        'si l\'entité propose une API à des clients ou collaborateurs, il est nécessaire d\'appliquer des contrôles appropriés afin d\'atténuer les attaques contre le SIA via l\'API ;',
                        'l\'intégration par défaut des paramètres les plus sûrs dans le système ;',
                        'la mise en œuvre des principes du moindre privilège pour limiter l\'accès aux fonctionnalités du SIA ;',
                        'la nécessité d\'expliquer aux utilisateurs les capacités les plus risquées du SIA et valider leur acceptation de les utiliser ;',
                        'la communication des cas d\'utilisation interdits et si possible des solutions alternatives.'
                    ]}
                ]
            },
            {
                id: 'ch3-sec3.4',
                title: '3.3.4 Sélection d\'un modèle d\'IA',
                content: [
                    { type: 'paragraph', content: 'Le choix d\'un modèle d\'IA implique de trouver un équilibre entre plusieurs exigences. Il s\'agit notamment du choix de l\'architecture du modèle, de la configuration, des données d\'entraînement, de l\'algorithme d\'entraînement et des hyperparamètres. Les décisions s\'appuient sur un modèle de menace et sont régulièrement réévaluées à mesure que la recherche sur la sécurité de l\'IA progresse et que la compréhension de la menace évolue.'},
                    { type: 'paragraph', content: 'Lors du choix d\'un modèle d\'IA, il est nécessaire de prendre en compte les éléments suivants, sans toutefois s\'y limiter :'},
                    { type: 'list', items: [
                        'la complexité du modèle utilisé, c\'est-à-dire l\'architecture et le nombre de paramètres choisis. L\'architecture et le nombre de paramètres choisis pour le modèle auront, entre autres, une incidence sur la quantité de données d\'entraînement nécessaires et sur la robustesse du modèle aux modifications des données d\'entrée lorsqu\'il est utilisé ;',
                        'l\'adéquation du modèle au cas d\'usage et/ou la possibilité de l\'adapter aux besoins spécifiques (par exemple par le fine-tuning) ;',
                        'la capacité d\'aligner, d\'interpréter et d\'expliquer les résultats de du modèle (par exemple pour le débogage, l\'audit ou la conformité réglementaire). Il peut être avantageux d\'utiliser des modèles plus simples et plus transparents plutôt que des modèles complexes et de grande taille qui sont plus difficiles à interpréter ;',
                        'les caractéristiques du ou des ensembles de données de formation, notamment la taille, l\'intégrité, la qualité, la sensibilité, l\'âge, la pertinence et la diversité ;',
                        'l\'intérêt d\'utiliser des techniques de renforcement des modèles (comme l\'entraînement contradictoire), de régularisation et/ou d\'amélioration de la protection de la vie privée ;',
                        'la provenance et les chaînes d\'approvisionnement des composants, y compris le modèle ou le modèle de base, les données de formation et les outils associés.'
                    ]}
                ]
            },
            {
                id: 'ch3-sec4',
                title: '3.4 Règles de sécurité applicables pour le développement',
                content: [
                    { type: 'paragraph', content: 'Cette section décrit les règles qui s\'appliquent à la phase de développement du cycle de vie du SIA, y compris la sécurité de la chaîne d\'approvisionnement, la documentation et la gestion des actifs et de la dette technique.' }
                ]
            },
            {
                id: 'ch3-sec4.1',
                title: '3.4.1 Sécurité de la chaîne d\'approvisionnement',
                content: [
                    { type: 'rule', rule: { 
                        id: 'SIA-06', 
                        reference: 'SIA-06', 
                        ruleText: 'La sécurité des chaînes d\'approvisionnement en IA doit être évaluée, contrôlée et documentée tout au long du cycle de vie du système.', 
                        implementationDetails: 'Les fournisseurs doivent également adhérer aux mêmes normes que celles que l\'entité applique à d\'autres logiciels (signature du plan d\'assurance sécurité).', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "OWASP LLM-03: Vulnérabilités de la Chaîne d'Approvisionnement / MITRE ATLAS (AML.T0002).\nVulnérabilités non corrigées dans les dépendances logicielles (ex: CVE dans LangChain, PyTorch).\nModification non autorisée (backdoor) d'un modèle pré-entraîné en amont de la chaîne.\nManque de transparence des fournisseurs sur leurs pratiques de sécurité et les données d'entraînement.\nDérive de comportement d'un composant après une mise à jour non-testée.",
                        associatedRisk: "Introduction de vulnérabilités ou de portes dérobées dans le système via une mise à jour d'un composant tiers.\nPerte de contrôle et de visibilité sur la posture de sécurité globale de l'IA.\nDépendance à des fournisseurs dont les pratiques de sécurité sont opaques ou insuffisantes.\nNon-conformité réglementaire si un fournisseur ne respecte pas les normes requises (ex: GDPR).",
                        implementationGuide: "1. **Évaluation Continue :** Utiliser le module 'Référence: Tiers IA' non seulement pour l'intégration, mais aussi pour des revues périodiques (ex: annuelles) des fournisseurs critiques.\n2. **Contrôle Continu :** Intégrer des outils de scan de dépendances (SCA) dans la pipeline CI/CD. Les alertes doivent être croisées avec la base 'Vuln IA Connues'.\n3. **Documentation :** Maintenir une Software Bill of Materials (SBOM) à jour pour chaque SIA. Documenter les résultats des audits de fournisseurs et les plans de remédiation dans un système de suivi (ex: Jira, ou en note dans le module 'Tiers IA').",
                        testingGuide: "1. **Audit des Fournisseurs :** Planifier des audits réguliers des réponses au questionnaire 'Référence: Tiers IA'. Demander des preuves pour les affirmations critiques (ex: rapports de pentest, certifications).\n2. **Analyse de Dépendances Automatisée :** Mettre en place des alertes dans la CI/CD qui bloquent la build si une nouvelle vulnérabilité critique est détectée dans un composant de la chaîne d'approvisionnement.\n3. **Tests de Scénarios 'Supply Chain' :** Utiliser le 'Tableau de bord' pour simuler des attaques qui exploitent des failles de la chaîne d'approvisionnement (ex: prompt `mcp-so3`) et vérifier que les contrôles de détection et de blocage fonctionnent.\n4. **Revue Documentaire :** Vérifier que la SBOM est mise à jour après chaque release et que les évaluations des fournisseurs sont complètes et datées."
                    } },
                    { type: 'paragraph', content: 'Lorsqu\'ils ne sont pas produits en interne, il est nécessaire d\'acquérir et de maintenir des composants matériels et logiciels sécurisés et documentés (par exemple, les modèles, les données, les bibliothèques logicielles, les modules, les middlewares, les Frameworks et les API externes) auprès de développeurs commerciaux, open source et autres tiers vérifiés, afin de garantir une sécurité éprouvée des systèmes de l\'entité.' }
                ]
            },
            {
                id: 'ch3-sec4.2',
                title: '3.4.2 Identifier, suivre et protéger les actifs',
                content: [
                    { type: 'paragraph', content: 'Les actifs liés à l\'IA ont de la valeur pour l\'entité. En particulier :' },
                    { type: 'list', items: ['les modèles ;', 'les données ;', 'les commentaires des utilisateurs ;', 'les prompts ;', 'les logiciels;', 'la documentation ;', 'les logs.'] },
                    { type: 'rule', rule: { 
                        id: 'SIA-07', 
                        reference: 'SIA-07', 
                        ruleText: 'Les actifs liés à l\'IA doivent être traités comme des données sensibles.', 
                        implementationDetails: 'Des mesures de sécurité doivent être mises en œuvre pour assurer leur confidentialité, leur intégrité et leur disponibilité.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "OWASP LLM-02: Sensitive Information Disclosure.\nOWASP LLM-07: System Prompt Leakage.\nOWASP LLM-04: Data and Model Poisoning.\nMITRE ATLAS (AML.T0010): Model Stealing.\nMenaces internes (accès non autorisé), menaces externes (vol de propriété intellectuelle).",
                        associatedRisk: "Confidentialité : Fuite de secrets industriels (poids du modèle, prompts système propriétaires), de données personnelles (PII) contenues dans les datasets ou les logs.\nIntégrité : Perte de confiance dans le SIA due à la modification non autorisée d'un modèle ou de données (empoisonnement), menant à des décisions métier erronées.\nDisponibilité : Interruption de service si un actif critique (modèle, base de vecteurs) est corrompu ou supprimé.\nFinancier : Coût de reconstruction/ré-entraînement d'un modèle volé ou corrompu. Amendes réglementaires pour fuite de données.",
                        implementationGuide: "1. **Inventaire et Classification :** Utiliser un registre (ex: la section 'Organization's AI Systems' du module 'Préparation Incidents IA') pour lister et classifier tous les actifs IA (modèles, datasets, prompts critiques) selon la politique de classification des données de l'entreprise.\n2. **Contrôles d'Accès :** Appliquer le principe de moindre privilège (RBAC) pour l'accès aux stockages (buckets S3, Azure Blob, etc.), registres de modèles et bases de données vectorielles.\n3. **Chiffrement :** Chiffrer tous les actifs au repos et en transit. Utiliser des coffres-forts de secrets pour les clés d'API et les secrets de configuration.\n4. **Contrôle d'Intégrité :** Utiliser des checksums (hashes) et des signatures numériques pour vérifier l'intégrité des modèles et datasets avant leur chargement/utilisation.",
                        testingGuide: "1. **Audit des Permissions :** Auditer périodiquement les permissions (IAM) sur les ressources cloud hébergeant les actifs IA. S'assurer qu'aucun accès public n'est configuré par erreur.\n2. **Tests d'Intrusion :** Mandater des tests d'intrusion ciblant les systèmes de stockage des actifs pour tenter un accès non autorisé à un modèle ou un dataset.\n3. **Revue de Configuration :** Vérifier que le chiffrement et la journalisation des accès sont activés sur tous les services de stockage.\n4. **Vérification des Logs :** Utiliser la question du module 'Revue Sécurité Red Team' ('Are logs from the application sent to the SIEM?') pour confirmer que les accès aux actifs critiques sont bien journalisés et surveillés pour toute anomalie."
                    } },
                    { type: 'paragraph', content: 'La cartographie de ces actifs doit être réalisée pour chaque SIA.' },
                    { type: 'paragraph', content: 'Il existe un processus et des outils pour suivre, authentifier, contrôler les versions et sécuriser ces actifs.' },
                    { type: 'paragraph', content: 'La sauvegarde de ces actifs doit être réalisée et il est possible de restaurer un état connu en cas de compromission.' },
                    { type: 'paragraph', content: 'Il existe un processus et des contrôles pour protéger les données auxquelles un SIA peut accéder et le contenu généré par l\'IA en fonction de sa sensibilité et de la sensibilité des données qui ont servi à le générer.' }
                ]
            },
            {
                id: 'ch3-sec4.3',
                title: '3.4.3 Documentation des données, modèles et prompts',
                content: [
                    { type: 'rule', rule: { 
                        id: 'SIA-08', 
                        reference: 'SIA-08', 
                        ruleText: 'La création, l\'exploitation et la gestion du cycle de vie de tous les modèles, ensembles de données et prompts systèmes doivent être documentés.', 
                        implementationDetails: 'La documentation comprend des informations relatives à la sécurité, telles que les sources des données d\'entraînement (y compris les données de fine-tuning et les feedbacks humains ou techniques), la portée et les limites prévues, les garde-fous, les hachages ou les signatures cryptographiques, la durée de conservation, la fréquence de révision et les modes de défaillance potentiels.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "OWASP LLM-03, LLM-04: Manque de traçabilité de la chaîne d'approvisionnement et de la provenance des données.\nOWASP LLM-07: Fuite de prompt système due à une mauvaise gestion documentaire.\nOWASP LLM-02: Incapacité à évaluer le risque de fuite de données si les datasets ne sont pas documentés.\nRisques opérationnels (difficulté de maintenance, dette technique).",
                        associatedRisk: "Sécurité : Incapacité à investiguer un incident de sécurité (ex: empoisonnement de modèle) si la provenance des actifs n'est pas connue.\nConformité : Incapacité à prouver la conformité aux régulations (ex: EU AI Act) qui exigent une documentation technique complète.\nOpérationnel : Difficulté à maintenir, mettre à jour ou déboguer le SIA, conduisant à une dette technique et des coûts accrus.\nStratégique : Perte de propriété intellectuelle si les prompts système et les spécificités des modèles ne sont pas documentés comme des secrets d'entreprise.",
                        implementationGuide: "1. **Utiliser des Standards :** Adopter des formats standards comme les 'Model Cards' pour les modèles et les 'Data Cards' pour les jeux de données.\n2. **Documentation des Prompts :** Documenter les prompts système critiques dans un gestionnaire de secrets ou un wiki interne sécurisé. Utiliser le module 'Bibliothèque d'Attaques' pour documenter les prompts de test.\n3. **Documentation de l'API :** La configuration d'une cible dans le 'Tableau de Bord' (via la modale `TestTargetConfiguration`) sert de documentation de base pour l'interface du SIA.\n4. **Centralisation :** Lier ces documents externes dans les notes de cette règle (SIA-08) pour créer un point d'entrée unique vers toute la documentation.",
                        testingGuide: "1. **Audit Documentaire :** Pour chaque SIA majeur, vérifier l'existence et l'exhaustivité des Model Cards, Data Cards, et de la documentation du prompt système.\n2. **Test de Traçabilité :** Simuler un incident (ex: 'le modèle a généré une information fausse'). Vérifier si la documentation permet de remonter rapidement à la version du modèle, au batch de données d'entraînement et au prompt système utilisés.\n3. **Revue de Conformité :** Utiliser la documentation collectée comme preuve lors d'un audit interne simulé contre les exigences de l'EU AI Act.\n4. **Test de la 'Bibliothèque d'Attaques' :** S'assurer que les prompts de test personnalisés ajoutés dans ce module sont correctement documentés (guide, protection)."
                    } },
                    { type: 'paragraph', content: 'Parmi les structures utiles pour y parvenir, on peut citer les cartes de modèles, les cartes de données et les nomenclatures logicielles (SBOM).' },
                    { type: 'paragraph', content: 'La production d\'une documentation complète favorise la transparence et la responsabilité.' }
                ]
            },
            {
                id: 'ch3-sec4.4',
                title: '3.4.4 Gérer la dette technique',
                content: [
                    { type: 'rule', rule: { 
                        id: 'SIA-09', 
                        reference: 'SIA-09', 
                        ruleText: 'Il est obligatoire d\'identifier, de suivre et de gérer la dette technique tout au long du cycle de vie d\'un SIA.', 
                        implementationDetails: 'La dette technique correspond aux décisions d\'ingénierie qui ne respectent pas les meilleures pratiques pour obtenir des résultats à court terme, au détriment d\'avantages à plus long terme.', 
                        status: 'Not Implemented', 
                        notes: '',
                        associatedThreat: "OWASP LLM-03 (Supply Chain): Utilisation de dépendances non vérifiées pour accélérer le développement.\nOWASP LLM-05 (Improper Output Handling): Omission de la validation des sorties pour simplifier le code.\nOWASP LLM-06 (Excessive Agency): Attribution de permissions trop larges aux agents pour éviter une logique de contrôle d'accès complexe.\nOWASP LLM-10 (Unbounded Consumption): Absence de limites de ressources (quotas, timeouts) par manque de temps.",
                        associatedRisk: "Sécurité : Augmentation de la surface d'attaque due à l'accumulation de vulnérabilités et de mauvaises pratiques.\nOpérationnel : Le système devient fragile, difficile à mettre à jour et sujet à des défaillances inattendues. Le coût de la correction des problèmes augmente de manière exponentielle.\nConformité : Incapacité à répondre aux exigences réglementaires de journalisation, de sécurité et de robustesse.\nFinancier : Coûts de maintenance élevés, risque d'attaques par 'déni de portefeuille' (Denial of Wallet), et coûts importants pour la refactorisation du code non sécurisé.",
                        implementationGuide: "1. **Identification :** Utiliser le module 'Revue Sécurité Red Team' lors des revues de conception et de code pour poser des questions qui révèlent la dette technique (ex: 'Y a-t-il des limites sur l'utilisation des tokens ?', 'Comment la portée des outils est-elle limitée ?').\n2. **Suivi :** Maintenir un registre des risques ou un backlog spécifique pour la dette technique. Lier chaque élément aux risques potentiels identifiés dans les modules 'Profil de Menace' ou 'Cas d'Usage'.\n3. **Gestion :** Utiliser la section 'Strategy & Roadmap' du module 'Résultats Red Team' pour prioriser et planifier la remédiation de la dette technique critique, en assignant des propriétaires et des délais.",
                        testingGuide: "1. **Revues de Code et d'Architecture :** Rechercher spécifiquement les raccourcis, le manque de validation, les secrets en dur ou l'absence de gestion des erreurs. Utiliser les checklists du 'Wiki Red Teamer' comme guide.\n2. **Tests Automatisés :** Exécuter des tests automatisés via le 'Tableau de Bord' après chaque développement majeur. Une chute soudaine du score global peut indiquer l'introduction de nouvelle dette technique.\n3. **Audit du Backlog :** Auditer périodiquement le backlog de la dette technique pour s'assurer que les éléments à haut risque sont traités. Croiser ces informations avec les résultats du module 'Résultats Red Team'.\n4. **Validation de la Remédiation :** Lorsqu'un élément de la dette technique est corrigé, ré-exécuter les scénarios d'attaque spécifiques de la 'Bibliothèque d'Attaques' qu'il était censé corriger, afin de valider l'efficacité de la remédiation."
                    } },
                    { type: 'paragraph', content: 'La dette technique n\'est pas mauvaise en soi, mais elle doit être gérée dès les premières étapes du développement.' },
                    { type: 'paragraph', content: 'En raison de cycles de développement rapides et d\'un manque de protocoles et d\'interfaces bien établis, les niveaux de dette technique d\'un SIA sont susceptibles d\'être élevés. Il est nécessaire de veiller à ce que les plans de cycle de vie (y compris les processus de mise hors service des systèmes d\'IA) évaluent, reconnaissent et atténuent les risques pour les futurs systèmes similaires.' }
                ]
            },
            {
                id: 'ch3-sec5',
                title: '3.5 Règles de sécurité applicables pour le déploiement',
                content: [
                    { type: 'paragraph', content: 'Cette section décrit les règles qui s\'appliquent à la phase de déploiement du cycle de développement des SIA, y compris la protection de l\'infrastructure et des modèles contre les compromissions, les menaces ou les pertes, l\'élaboration de processus de gestion des incidents et la diffusion responsable.' }
                ]
            },
            {
                id: 'ch3-sec5.1',
                title: '3.5.1 Sécuriser l\'infrastructure',
                content: [
                    { type: 'rule', rule: { id: 'SIA-10', reference: 'SIA-10', ruleText: 'La prise en compte de la sécurité de l\'infrastructure utilisée doit être assurée à chaque étape du cycle de vie du système.', implementationDetails: 'Il est nécessaire de mettre en œuvre des contrôles d\'accès appropriés aux API, modèles et données, ainsi qu\'à leurs pipelines d\'entraînement et de traitement, tant au niveau de la recherche et du développement que du déploiement. Cela inclut une séparation appropriée des environnements contenant du code ou des données sensibles.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'Ces mesures permettent notamment de réduire le risque d\'attaques visant à voler un modèle ou à nuire à ses performances.'}
                ]
            },
            {
                id: 'ch3-sec5.2',
                title: '3.5.2 Protéger les modèles dans la continuité',
                content: [
                    { type: 'paragraph', content: 'Les attaquants peuvent être en mesure de reconstruire la fonctionnalité d\'un modèle ou les données sur lesquelles il a été formé, en accédant à un modèle directement (en acquérant les poids du modèle) ou indirectement (en interrogeant le modèle par l\'intermédiaire d\'une application ou d\'un service). Les attaquants peuvent également altérer les modèles, les données ou les prompts pendant ou après l\'apprentissage, ce qui rend le résultat non fiable.'},
                    { type: 'rule', rule: { id: 'SIA-11', reference: 'SIA-11', ruleText: 'Le modèle et les données doivent être protégés de l\'accès direct et indirect par la mise en œuvre de contrôles sur l\'interface d\'interrogation afin de détecter et empêcher les tentatives d\'accès, de modification et d\'exfiltration d\'informations confidentielles.', implementationDetails: 'NA', status: 'Not Implemented', notes: '' } },
                    { type: 'rule', rule: { id: 'SIA-12', reference: 'SIA-12', ruleText: 'Pour que les systèmes consommateurs puissent valider les modèles, il est nécessaire de calculer et partager les hachages cryptographiques et/ou les signatures des fichiers de modèles (par exemple, les poids des modèles) et des ensembles de données (y compris les points de contrôle) dès que le modèle est entraîné.', implementationDetails: 'Pour ce faire, seuls les algorithmes de hachage spécifiés dans la PSSIG sont autorisés.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'L\'atténuation du risque de perte de confidentialité dépend du cas d\'utilisation et du modèle de menace. Certaines applications, par exemple celles qui impliquent des données très sensibles, peuvent nécessiter des modèles de garanties qu\'il peut être difficile ou coûteux d\'appliquer. Le cas échéant, des technologies d\'amélioration de la confidentialité (telles que la confidentialité différentielle ou le chiffrement homomorphique) peuvent être utilisées pour explorer ou garantir les niveaux de risque associés à l\'accès des consommateurs, des utilisateurs et des attaquants aux modèles et aux résultats.'}
                ]
            },
            {
                id: 'ch3-sec5.3',
                title: '3.5.3 Élaborer des procédures de gestion des incidents',
                content: [
                    { type: 'rule', rule: { id: 'SIA-13', reference: 'SIA-13', ruleText: 'L\'inévitabilité des incidents de sécurité affectant les SIA doit être prise en compte dans les plans de réponse aux incidents, d\'escalade et de remédiation.', implementationDetails: 'Ces plans tiennent compte de différents scénarios et sont régulièrement réévalués au fur et à mesure de l\'évolution du système et de la recherche en général.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'Les ressources numériques critiques du SIA sont stockées dans des sauvegardes hors ligne. Les intervenants sont formés à l\'évaluation et au traitement des incidents liés à l\'IA.'}
                ]
            },
            {
                id: 'ch3-sec5.4',
                title: '3.5.4 Diffuser l\'IA de manière responsable',
                content: [
                    { type: 'rule', rule: { id: 'SIA-14', reference: 'SIA-14', ruleText: 'L\'entité ne publie des modèles, des applications ou des systèmes qu\'après les avoir soumis à une évaluation de sécurité appropriée et efficace, telle que l\'analyse comparative et le red teaming.', implementationDetails: 'L\'entité indique clairement à ses utilisateurs les limites connues ou les modes de défaillance potentiels.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'L\'entité applique des contrôles pour empêcher l\'utilisation ou le déploiement de son SIA à des fins malveillantes.'},
                    { type: 'paragraph', content: 'L\'entité fournit aux utilisateurs des conseils sur l\'utilisation appropriée de son modèle ou de son SIA, notamment en soulignant les limites et les modes de défaillance potentiels.'},
                    { type: 'paragraph', content: 'L\'entité indique clairement aux utilisateurs les aspects de la sécurité dont ils sont responsables.'},
                    { type: 'paragraph', content: 'L\'entité est transparente sur l\'endroit et la manière dont leurs données peuvent être utilisées, consultées ou stockées (par exemple, si elles sont utilisées pour le recyclage du modèle ou examinées par des employés ou des partenaires).'}
                ]
            },
            {
                id: 'ch3-sec6',
                title: '3.6 Règles de sécurité applicables pour l\'exploitation et la maintenance',
                content: [
                    { type: 'paragraph', content: 'Cette section décrit les règles qui s\'appliquent à l\'étape de l\'exploitation et de la maintenance sécurisées du cycle de vie du développement d\'un SIA. Elle décrit notamment les règles à mettre en œuvre une fois qu\'un système a été déployé, y compris la journalisation et la surveillance, la gestion des mises à jour et le partage d\'informations.' }
                ]
            },
            {
                id: 'ch3-sec6.1',
                title: '3.6.1 Surveillance du comportement du système',
                content: [
                    { type: 'rule', rule: { id: 'SIA-15', reference: 'SIA-15', ruleText: 'Les résultats et les performances du modèle et du système doivent être mesurés de manière à pouvoir observer les changements de comportement soudains ou progressifs qui affectent la sécurité.', implementationDetails: 'Cette surveillance prend en compte et identifie les intrusions et les compromissions potentielles, ainsi que la dérive naturelle des données.', status: 'Not Implemented', notes: '' } }
                ]
            },
            {
                id: 'ch3-sec6.2',
                title: '3.6.2 Surveillance des entrées du système',
                content: [
                    { type: 'rule', rule: { id: 'SIA-16', reference: 'SIA-16', ruleText: 'Conformément aux exigences en matière de protection de la vie privée et des données à caractère personnelle, les entrées dans le système (telles que les demandes d\'inférence, les requêtes ou les prompts) sont loggées et surveillées.', implementationDetails: 'Ces logs doivent permettre l\'audit, l\'analyse et la correction en cas de compromission ou d\'utilisation abusive.', status: 'Not Implemented', notes: '' } }
                ]
            },
            {
                id: 'ch3-sec6.3',
                title: '3.6.3 Sécuriser les mises à jour',
                content: [
                    { type: 'rule', rule: { id: 'SIA-17', reference: 'SIA-17', ruleText: 'Des mises à jour automatisées sont incluses par défaut dans chaque produit et des procédures de mise à jour sécurisées et modulaires sont utilisées pour les distribuer.', implementationDetails: 'Ces processus de mise à jour (y compris les régimes de test et d\'évaluation) tiennent compte du fait que les modifications apportées aux données, aux modèles ou aux prompts peuvent entraîner des changements dans le comportement du système.', status: 'Not Implemented', notes: '' } }
                ]
            }
        ]
    },
    {
        id: 'ch-4',
        title: 'Chapitre 4 : Gestion du Risque lié à l\'IA',
        introduction: [
            'Comme pour les logiciels traditionnels, les risques liés à la technologie basée sur l\'intelligence artificielle peuvent avoir des impacts sur l\'entité. Les systèmes d\'IA comportent également un ensemble de risques qui ne sont pas entièrement pris en compte par les méthodes courantes de traitement du risque.',
            'Par rapport aux systèmes d\'informations traditionnels, les risques spécifiques à l\'IA sont les suivants :'
        ],
        sections: [
            {
                id: 'ch4-sec0',
                title: '',
                content: [
                    { type: 'list', items: [
                        'les données utilisées pour créer un système d\'IA peuvent ne pas être une représentation vraie ou appropriée du contexte ou de l\'utilisation prévue du système d\'IA, et la représentation du terrain peut soit ne pas exister, soit ne pas être disponible. De plus, des biais préjudiciables et d\'autres problèmes de qualité des données peuvent affecter la fiabilité du système d\'IA, ce qui peut entraîner des impacts négatifs ;',
                        'dépendance au système d\'IA et dépendance aux données pour les tâches d\'entraînement, combinées à un volume et une complexité accrus généralement associés à ces données ;',
                        'des changements intentionnels ou non pendant l\'entraînement peuvent altérer fondamentalement les performances du système d\'IA ;',
                        'les ensembles de données utilisés pour entraîner les systèmes d\'IA peuvent se détacher de leur contexte d\'origine ou devenir obsolètes par rapport au contexte de déploiement;',
                        'l\'échelle et la complexité des systèmes d\'IA (de nombreux systèmes contiennent des millions, voire des milliards de points de décision) hébergés dans des applications logicielles plus traditionnelles ;',
                        'l\'utilisation de modèles pré-entraînés capables de faire progresser la recherche et d\'améliorer les performances peut également augmenter les niveaux d\'incertitude statistique et entraîner des problèmes de gestion des biais, de validité scientifique et de reproductibilité ;',
                        'degré de difficulté plus élevé dans la prévision des modes de défaillance pour les propriétés émergentes des modèles pré-entraînés à grande échelle ;',
                        'risque de perte de confidentialité dû à la capacité améliorée d\'agrégation de données pour les systèmes d\'IA ;',
                        'les systèmes d\'IA peuvent nécessiter une maintenance plus fréquente et des déclencheurs pour effectuer une maintenance corrective en raison d\'une dérive des données ou du modèle ;',
                        'opacité accrue et soucis de reproductibilité ;',
                        'normes de tests logiciels insuffisantes et incapacité à documenter les pratiques basées sur l\'IA selon les normes attendues des logiciels d\'ingénierie traditionnelle, sauf dans les cas les plus simples ;',
                        'difficulté à effectuer régulièrement des tests de logiciels basés sur l\'IA ou à déterminer ce qu\'il faut tester, car les systèmes d\'IA ne sont pas soumis aux mêmes contrôles que le développement de code traditionnel ;',
                        'coûts de calcul pour le développement de systèmes d\'IA ;',
                        'incapacité de prédire ou de détecter les effets secondaires des systèmes basés sur l\'IA au-delà des mesures statistiques.'
                    ]},
                    { type: 'paragraph', content: 'Les considérations et approches de gestion des risques liés à la confidentialité et à la cybersécurité sont applicables à la conception, au développement, au déploiement, à l\'évaluation et à l\'utilisation de systèmes d\'IA.'},
                    { type: 'paragraph', content: 'L\'IA et les technologies associées sont soumis à une innovation rapide. Les avancées technologiques doivent être surveillées et déployées pour tirer parti de ces évolutions et œuvrer à une évolution de l\'IA à la fois sécurisée et responsable.'}
                ]
            },
            {
                id: 'ch4-sec1',
                title: 'Framework de Gestion des Risques',
                content: [
                    { type: 'rule', rule: { id: 'SIA-18', reference: 'SIA-18', ruleText: 'Chaque système d\'IA développé et/ou mis en œuvre au sein de l\'entité doit faire l\'objet d\'une analyse de risques adaptée.', implementationDetails: 'La gestion des risques lié au développement et à l\'utilisation des SIA doit s\'appuyer sur le Framework du NIST: Artificial Intelligence Risk Management Framework.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'Ce Framework fournit des résultats et des actions qui permettent le dialogue, la compréhension et les activités pour gérer les risques liés à l\'IA et développer de manière responsable des systèmes d\'IA sécurisés.' },
                    { type: 'paragraph', content: 'Ce Framework s\'appuie sur quatre fonctions : gouverner, cartographier, mesurer, gérer.' },
                    { type: 'paragraph', content: 'La gestion des risques doit être continue, opportune et effectuée tout au long du cycle de vie du système d\'IA. Les fonctions principales du Framework doivent être exercées d\'une manière qui reflète des perspectives diverses et multidisciplinaires, incluant potentiellement les points de vue des acteurs de l\'IA extérieurs à l\'organisation.'}
                ]
            },
            {
                id: 'ch4-sec1.1',
                title: '4.1 La fonction « gouverner »',
                content: [
                    { type: 'paragraph', content: 'La fonction "gouverner" :' },
                    { type: 'list', items: [
                        'développe et met en œuvre une culture de gestion des risques au sein des entités qui conçoivent, développent, déploient, évaluent ou acquièrent des systèmes d\'IA ;',
                        'décrit les processus, les documents et les schémas organisationnels qui anticipent, identifient et gèrent les risques qu\'un système peut poser, y compris pour les utilisateurs et les autres acteurs de l\'entité, ainsi que les procédures permettant d\'atteindre ces résultats ;',
                        'intègre des processus pour évaluer les impacts potentiels;',
                        'fournit une structure grâce à laquelle les fonctions de gestion des risques liées à l\'IA peuvent s\'aligner sur les principes organisationnels, les politiques et les priorités stratégiques;',
                        'relie les aspects techniques de la conception et du développement de systèmes d\'IA aux valeurs et principes organisationnels, et permet des pratiques et des compétences organisationnelles pour les personnes impliquées dans l\'acquisition, l\'entraînement, le déploiement et la surveillance de ces systèmes ;',
                        'traite du cycle de vie complet du produit et des processus associés, y compris les questions juridiques et autres concernant l\'utilisation de systèmes et de données logiciels ou matériels tiers.'
                    ]},
                    { type: 'paragraph', content: '“Gouverner” est une fonction transversale qui est imprégnée dans toute la gestion des risques liés à l\'IA et qui active les autres fonctions du processus. L\'attention portée à la gouvernance est une exigence continue et intrinsèque pour une gestion efficace des risques liés à l\'IA tout au long de la durée de vie d\'un système d\'IA et du management de l\'entité.' }
                ]
            },
            {
                id: 'ch4-sec1.2',
                title: '4.2 La fonction « cartographier »',
                content: [
                    { type: 'paragraph', content: 'La fonction “cartographier” établit le contexte pour encadrer les risques liés à un système d\'IA. Le cycle de vie de l\'IA comprend de nombreuses activités interdépendantes impliquant un ensemble diversifié d\'acteurs. Les interdépendances entre ces activités et entre les acteurs concernés de l\'IA peuvent rendre difficile une anticipation fiable des impacts des systèmes d\'IA.' },
                    { type: 'paragraph', content: 'Les informations recueillies lors de l\'exécution de la fonction “cartographier” permettent de prévenir les risques et éclairent les décisions concernant des processus tels que la gestion des modèles, ainsi qu\'une décision initiale sur l\'opportunité ou la nécessité d\'une solution d\'IA. Recueillir des perspectives aussi larges peut aider les entités à prévenir de manière proactive les risques et à développer des systèmes d\'IA plus fiables en leur permettant de :' },
                    { type: 'list', items: [
                        'améliorer leur capacité à comprendre les contextes ;',
                        'vérifier leurs hypothèses sur le contexte d\'utilisation ;',
                        'reconnaître quand les systèmes ne sont pas fonctionnels dans ou hors de leur contexte prévu ;',
                        'identifier les utilisations positives et bénéfiques de leurs systèmes d\'IA existants ;',
                        'améliorer la compréhension des limites des processus d\'IA ;',
                        'identifier les contraintes dans les applications du monde réel qui peuvent conduire à des impacts négatifs ;',
                        'identifier les impacts négatifs connus et prévisibles liés à l\'utilisation prévue des systèmes d\'IA;',
                        'anticiper les risques liés à l\'utilisation des systèmes d\'IA au-delà de leur utilisation prévue.'
                    ]}
                ]
            },
            {
                id: 'ch4-sec1.3',
                title: '4.3 La fonction « mesurer »',
                content: [
                    { type: 'paragraph', content: 'La fonction "mesurer” utilise des outils, des techniques et des méthodologies quantitatives, qualitatives ou mixtes pour analyser, évaluer, comparer et surveiller les risques liés à l\'IA et les impacts associés. Les systèmes d\'IA doivent être testés avant leur déploiement et régulièrement pendant leur fonctionnement.' },
                    { type: 'rule', rule: { id: 'SIA-19', reference: 'SIA-19', ruleText: 'La liste des menaces utilisée dans le cadre de la fonction "mesurer” est la base Atlas du MITRE.', implementationDetails: 'ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems) est une base de connaissances sur les tactiques et techniques adverses contre les systèmes d\'IA. Elle est basée sur des observations d\'attaques réelles et des démonstrations réalistes des red teams.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'La mesure des risques liés à l\'IA comprend le suivi des mesures relatives aux caractéristiques fiables, à l\'impact social et aux configurations humain-IA. Après avoir terminé la fonction “mesurer”, les processus de test, d\'évaluation, de vérification et de validation objectifs, reproductibles ou évolutifs, y compris les métriques, les méthodes et les méthodologies, sont en place, suivis et documentés.' }
                ]
            },
            {
                 id: 'ch4-sec1.4',
                 title: '4.4 La fonction « gérer »',
                 content: [
                    { type: 'paragraph', content: 'La fonction "gérer” consiste à allouer des ressources de risque aux risques cartographiés et mesurés de manière régulière et telle que définie par la fonction “gouverner”. Le traitement des risques comprend des plans pour réagir, remédier et communiquer sur les incidents de sécurité.' },
                    { type: 'paragraph', content: 'Après avoir terminé la fonction “gérer”, des plans de priorisation des risques ainsi qu\'un suivi et une amélioration réguliers sont en place. Les entités disposent alors d\'une capacité accrue à gérer les risques liés aux systèmes d\'IA déployés et à allouer des ressources de gestion des risques en fonction des risques évalués et hiérarchisés.' }
                 ]
            }
        ]
    },
    {
        id: 'ch-5',
        title: 'Chapitre 5 : Cas Particulier des IA Génératives',
        introduction: [
            'La mise en œuvre d\'un système d\'IA générative peut se décomposer en trois phases cycliques:',
        ],
        sections: [
            {
                id: 'ch5-sec0',
                title: '',
                content: [
                    { type: 'list', items: [
                        'une première phase d\'entraînement du modèle d\'IA à partir de données spécifiquement choisies;',
                        'une phase d\'intégration et de déploiement ;',
                        'une phase de production opérationnelle dans laquelle les utilisateurs peuvent accéder au modèle d\'IA entraîné, par l\'intermédiaire du système d\'IA.'
                    ]},
                    { type: 'paragraph', content: 'En complément des menaces classiques inhérentes à tout système d\'information, un système d\'IA générative peut-être soumis à des attaques spécifiques visant par exemple à perturber le bon fonctionnement de celui-ci (attaques adverses) ou bien à exfiltrer des données traitées par celui-ci.'},
                    { type: 'paragraph', content: 'La question de la protection des données, notamment des données d\'entraînement, est donc un enjeu essentiel d\'un système d\'IA générative, avec comme corollaire la problématique du besoin d\'en connaître des utilisateurs lorsqu\'ils interrogent le modèle.'}
                ]
            },
            {
                id: 'ch5-sec1',
                title: '5.1 Scénarios d\'attaques sur l\'IA générative',
                content: [
                    { type: 'paragraph', content: 'Un système d\'IA générative est une application métier standard, qui doit disposer du même socle de sécurité que toute autre application métier de l\'entité. Toutefois, en complément de ce socle de sécurité, l\'entité doit prendre en compte des menaces spécifiques à un système d\'IA générative.' },
                    { type: 'paragraph', content: 'Ces menaces peuvent être déclinées en trois grandes catégories d\'attaques :' },
                    { type: 'list', items: [
                        'attaques par manipulation: ces attaques consistent à détourner le comportement du système d\'IA en production au moyen de requêtes malveillantes. Elles peuvent provoquer des réponses inattendues, des actions dangereuses ou un déni de service ;',
                        'attaques par infection: ces attaques consistent à contaminer un système d\'IA lors de sa phase d\'entraînement, en altérant les données d\'entraînement ou en insérant une porte dérobée ;',
                        'attaques par exfiltration: ces attaques consistent à dérober des informations sur le système d\'IA en production, comme les données ayant servi à entraîner le modèle, les données des utilisateurs ou bien des données internes du modèle (paramètres).'
                    ]},
                    { type: 'paragraph', content: 'Dans le contexte de l\'IA générative, ces attaques peuvent porter atteinte aux besoins de sécurité suivants :' },
                    { type: 'list', items: [
                        'confidentialité : l\'objectif est de protéger un système d\'IA contre la fuite d\'informations considérées comme sensibles: jeux de données d\'entraînement, requêtes des utilisateurs, paramètres des modèles, données additionnelles internes, etc. ;',
                        'intégrité : l\'objectif est de protéger un système d\'IA contre une modification non prévue de son comportement. L\'intégrité peut concerner directement le modèle (paramètres) ou bien viser les jeux de données d\'entraînement (empoisonnement) ou encore les composants techniques permettant le bon fonctionnement du système d\'IA ;',
                        'disponibilité : l\'objectif est de protéger un système d\'IA contre des dénis de service ou des actions visant à dégrader ses performances (requêtes malveillantes) ;',
                        'traçabilité: l\'objectif est de garantir d\'une part l\'explicabilité et l\'imputabilité des actions réalisées sur un système d\'IA. Ces éléments peuvent faciliter le travail d\'investigation et de remédiation après un incident de sécurité.'
                    ]}
                ]
            },
            {
                id: 'ch5-sec2',
                title: '5.2 Génération de code source assistée par l\'IA',
                content: [
                    { type: 'paragraph', content: 'Les outils d\'IA générative peuvent être spécialisés et spécifiquement entraînés pour générer du code source dans plusieurs langages de programmation.'},
                    { type: 'paragraph', content: 'Ces moyens peuvent permettre aux développeurs un gain de temps mais comportent aussi des risques sur la qualité du code (introduction de vulnérabilités) ou d\'insertion de porte dérobée dans le cas où un attaquant aurait compromis le modèle. Il est donc important de faire preuve de vigilance sur le code source généré par IA.'},
                    { type: 'rule', rule: { id: 'SIA-20', reference: 'SIA-20', ruleText: 'Le code source généré par une IA doit être contrôlé systématiquement et faire l\'objet de mesures de sécurité afin de vérifier son innocuité.', implementationDetails: "• il est interdit d'exécuter automatiquement un code source généré par IA dans l'environnement de développement;\n• le commit automatique de code source généré par IA dans les dépôts est interdit;\n• il est obligatoire d'intégrer un outil d'assainissement de code source généré par IA dans l'environnement de développement;\n• il est obligatoire de vérifier l'innocuité des bibliothèques référencées dans le résultat du code source généré par IA;\n• il est obligatoire de faire contrôler régulièrement par un humain la qualité du code source généré à partir de requêtes types.", status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'La génération de code source par IA pour des modules critiques d\'applications doit être limitée.'},
                    { type: 'rule', rule: { id: 'SIA-21', reference: 'SIA-21', ruleText: 'Il est interdit de recourir à un outil d\'IA générative pour générer des blocs de code source destinés aux modules applicatifs critiques (cryptographie, gestion des droits d\'accès, traitement de données sensibles).', implementationDetails: '• les modules de cryptographie (authentification, chiffrement, signature, etc.);\n• les modules de gestion des droits d\'accès des utilisateurs et administrateurs;\n• les modules de traitement de données sensibles.', status: 'Not Implemented', notes: '' } },
                    { type: 'paragraph', content: 'Les développeurs doivent être sensibilisés sur les risques liés au code source généré par IA.'},
                    { type: 'rule', rule: { id: 'SIA-22', reference: 'SIA-22', ruleText: 'Il est obligatoire d\'effectuer des campagnes de sensibilisation sur les risques liés à l\'utilisation de code source généré par IA.', implementationDetails: 'En complément, les développeurs doivent également être formés sur les outils d\'IA pour l\'optimisation de leurs requêtes (prompt engineering) afin d\'améliorer la qualité et la sécurité du code généré.', status: 'Not Implemented', notes: '' } }
                ]
            },
            {
                id: 'ch5-sec3',
                title: '5.3 Utilisation de solutions d\'IA générative tierces',
                content: [
                    { type: 'paragraph', content: 'En raison de leur facilité d\'usage et des gains métiers potentiels, il est possible de recourir à des outils d\'IA générative disponibles sur Internet pour traiter des données métier, par exemple pour la traduction de textes.' },
                    { type: 'paragraph', content: 'Le fait d\'envoyer des informations (texte, images, documents) à un service d\'IA générative exposé sur Internet revient à déposer ces mêmes informations sur un espace de stockage appartenant à ce service.' },
                    { type: 'paragraph', content: 'Dans ce cas, le cloisonnement entre les clients ainsi que la protection en confidentialité des données envoyées au système d\'IA sur Internet ne sont pas maîtrisés. De plus, dans la majorité des offres, les données envoyées au service sont collectées et utilisées par le prestataire à des fins d\'optimisation des modèles.' },
                    { type: 'paragraph', content: 'Proposition de critères de sécurité de confidentialité de données :' },
                    { type: 'table', headers: ['Niveau', 'Intitulé', 'Description'], rows: [
                        ['C0', 'Public', 'La donnée est publique.'],
                        ['C1', 'Interne', 'La donnée ne doit être accessible qu\'aux collaborateurs de l\'entité et aux partenaires.'],
                        ['C2', 'Confidentiel', 'La donnée ne doit être accessible qu\'aux collaborateurs de l\'entité concernés.'],
                        ['C3', 'Secret', 'La donnée ne doit être accessible qu\'aux personnes identifiées et ayant le besoin d\'en connaître.']
                    ]},
                    { type: 'paragraph', content: 'Les règles d\'utilisation d\'outils d\'IA générative, en fonction de la classification des données proposée ci-dessus, est détaillé dans le tableau suivant :' },
                    { type: 'table', headers: ['Mode d\'accès', 'Classification', 'Autorisation'], rows: [
                        ['Datacenter Entité', 'C0, C1, C2', 'Autorisé'],
                        ['Datacenter Entité', 'C3', 'Interdit'],
                        ['SaaS en Europe', 'C0, C1', 'Autorisé'],
                        ['SaaS en Europe', 'C2, C3', 'Interdit'],
                        ['SaaS hors Europe', 'CO', 'Autorisé'],
                        ['SaaS hors Europe', 'C1, C2, C3', 'Interdit']
                    ]}
                ]
            }
        ]
    }
];