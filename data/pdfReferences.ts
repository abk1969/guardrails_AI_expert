// Structured reference data extracted from OWASP PDF documents
// Source: data_ai_risk/ directory - OWASP GenAI Security Project publications
// License: CC BY-SA 4.0

export interface PDFReference {
  id: string;
  title: string;
  source: string;
  category: 'agentic-security' | 'mcp-security' | 'red-teaming' | 'incident-response' | 'governance';
  summary: string;
  keyItems: ReferenceItem[];
  url?: string;
}

export interface ReferenceItem {
  id: string;
  code?: string;
  title: string;
  description: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export const pdfReferences: PDFReference[] = [
  // ─────────────────────────────────────────────────────────
  // 1. OWASP Top 10 for Agentic Applications 2026
  // ─────────────────────────────────────────────────────────
  {
    id: 'owasp-agentic-top10',
    title: 'OWASP Top 10 for Agentic Applications 2026',
    source: 'OWASP-Top-10-for-Agentic-Applications-2026-12.6-1.pdf',
    category: 'agentic-security',
    summary: 'Liste des 10 menaces les plus critiques pour les applications agentiques IA. Couvre les risques de hijacking, abus de permissions, empoisonnement de contexte et agents autonomes compromis. Version 2026 du projet OWASP GenAI Security.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'asi01',
        code: 'ASI01',
        title: 'Agent Goal Hijack',
        description: 'Manipulation des objectifs, de la selection de taches ou des parcours decisionnels d\'un agent via injection de prompt, donnees externes empoisonnees ou messages inter-agents falsifies. Contrairement a LLM01:2025 (reponse unique), ASI01 capture l\'impact agentique plus large ou des entrees manipulees redirigent les objectifs et le comportement multi-etapes.',
        priority: 'critical',
      },
      {
        id: 'asi02',
        code: 'ASI02',
        title: 'Tool Misuse and Exploitation',
        description: 'Un agent peut abuser d\'outils legitimes a cause d\'injection de prompt, de desalignement ou de delegation non securisee. Les risques incluent l\'exfiltration de donnees, la manipulation de sorties d\'outils ou le detournement de workflows. Lie a LLM06:2025 (Excessive Agency).',
        priority: 'critical',
      },
      {
        id: 'asi03',
        code: 'ASI03',
        title: 'Identity and Privilege Abuse',
        description: 'Exploitation des mecanismes d\'identite et de privileges des agents. Inclut l\'escalade de privileges, l\'usurpation d\'identite entre agents et l\'abus des permissions delegues dans les systemes multi-agents.',
        priority: 'critical',
      },
      {
        id: 'asi04',
        code: 'ASI04',
        title: 'Agentic Supply Chain Vulnerabilities',
        description: 'Vulnerabilites dans la chaine d\'approvisionnement des systemes agentiques : outils non verifies, frameworks compromis, modeles tiers non valides et dependances malveillantes dans l\'ecosysteme d\'outils de l\'agent.',
        priority: 'high',
      },
      {
        id: 'asi05',
        code: 'ASI05',
        title: 'Unexpected Code Execution (RCE)',
        description: 'Execution de code non prevue dans les systemes agentiques. Un agent generant du code via LLM peut executer des commandes systeme, acceder au systeme de fichiers ou exfiltrer des donnees si le sandboxing est insuffisant.',
        priority: 'critical',
      },
      {
        id: 'asi06',
        code: 'ASI06',
        title: 'Memory & Context Poisoning',
        description: 'Corruption persistante du contexte stocke ou de la memoire a long terme de l\'agent. Differe de ASI01 (manipulation directe des objectifs) car ASI06 cible la memoire pour influencer les decisions futures de maniere durable.',
        priority: 'high',
      },
      {
        id: 'asi07',
        code: 'ASI07',
        title: 'Insecure Inter-Agent Communication',
        description: 'Communications non securisees entre agents dans les systemes multi-agents. Inclut l\'empoisonnement de messages, l\'usurpation d\'identite d\'agent, et le manque de validation des messages echanges.',
        priority: 'high',
      },
      {
        id: 'asi08',
        code: 'ASI08',
        title: 'Cascading Failures',
        description: 'Defaillances en cascade dans les systemes agentiques ou un echec ou une compromission dans un composant se propage a travers le systeme entier, amplifiant l\'impact au-dela du point initial de defaillance.',
        priority: 'high',
      },
      {
        id: 'asi09',
        code: 'ASI09',
        title: 'Human-Agent Trust Exploitation',
        description: 'Exploitation de la confiance entre humains et agents IA. L\'agent manipule les utilisateurs en exploitant les biais cognitifs, l\'automatisation excessive et la sur-confiance dans les recommandations de l\'IA.',
        priority: 'high',
      },
      {
        id: 'asi10',
        code: 'ASI10',
        title: 'Rogue Agents',
        description: 'Agents autonomes devenus malveillants ou desalignes sans controle actif d\'un attaquant. Inclut le desalignement emergent, l\'evasion de monitoring et les comportements imprevus dans les systemes autonomes.',
        priority: 'high',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. Securing Agentic Applications Guide 1.0
  // ─────────────────────────────────────────────────────────
  {
    id: 'securing-agentic-guide',
    title: 'Securing Agentic Applications Guide 1.0',
    source: 'Securing-Agentic-Applications-Guide-1.0.pdf',
    category: 'agentic-security',
    summary: 'Guide pratique pour concevoir, developper et deployer des applications agentiques securisees. Couvre les architectures securisees, les guidelines developpeur, le hardening runtime et la securite de la chaine d\'approvisionnement pour les systemes IA agentiques.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'sag-kc1',
        title: 'KC1 - Securisation des modeles de langage',
        description: 'Securiser le moteur cognitif de l\'agent (LLM, multimodal, SLM, fine-tuned). Menaces : hallucinations en cascade (T5), manipulation d\'intention (T6), desalignement (T7), manipulation humaine (T15).',
        priority: 'critical',
      },
      {
        id: 'sag-kc2',
        title: 'KC2 - Securisation de l\'orchestration',
        description: 'Securiser le flux de controle : workflows, planification hierarchique, collaboration multi-agents. Menaces : manipulation du flux (T6), usurpation d\'identite (T9), submersion HITL (T10), empoisonnement de communication (T12).',
        priority: 'critical',
      },
      {
        id: 'sag-kc3',
        title: 'KC3 - Securisation du raisonnement et de la planification',
        description: 'Proteger les paradigmes de raisonnement (ReAct, Chain of Thought, Tree of Thoughts). Eviter les hallucinations propagees, la manipulation d\'intention et les decisions non tracables.',
        priority: 'high',
      },
      {
        id: 'sag-kc4',
        title: 'KC4 - Securisation des modules de memoire',
        description: 'Isoler les types de memoire : session unique, cross-agent, cross-session, cross-user. Chaque type presente des risques differents de compromission en cascade.',
        priority: 'high',
      },
      {
        id: 'sag-kc5',
        title: 'KC5 - Securisation des frameworks d\'integration d\'outils',
        description: 'Securiser LangChain, CrewAI, MCP et les SDK d\'outils. Menaces : abus d\'outils (T2), escalade de privileges (T3), execution de code inattendue (T11).',
        priority: 'high',
      },
      {
        id: 'sag-kc6',
        title: 'KC6 - Securisation de l\'environnement operationnel',
        description: 'Controles pour l\'acces API, l\'execution de code, l\'acces bases de donnees, la navigation web, le controle PC et les systemes critiques (SCADA). Chaque niveau d\'agentivite augmente la surface d\'attaque.',
        priority: 'critical',
      },
      {
        id: 'sag-design',
        title: 'Guidelines de conception securisee',
        description: 'Phase Design & Dev : principe du moindre privilege, isolation des composants, validation des entrees/sorties, sandboxing des outils, supervision humaine obligatoire pour les actions a haut risque.',
        priority: 'high',
      },
      {
        id: 'sag-runtime',
        title: 'Hardening runtime',
        description: 'Durcissement VM, containeurisation du runtime agentique, securisation memoire/outils/contexte, observabilite et forensics, hardening cloud specifique.',
        priority: 'high',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. Practical Guide for Secure MCP Server Development 1.0
  // ─────────────────────────────────────────────────────────
  {
    id: 'mcp-server-security',
    title: 'Guide de Developpement Securise de Serveurs MCP v1.0',
    source: 'A-Practical-Guide-for-Secure-MCP-Server-Development.v.1.0.pdf',
    category: 'mcp-security',
    summary: 'Bonnes pratiques pour concevoir et implementer des serveurs MCP securises. Couvre l\'architecture, le design d\'outils, la validation des donnees, les controles d\'injection de prompt, l\'authentification et le deploiement securise.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'mcp-dev-1',
        title: '1. Architecture MCP securisee',
        description: 'Connexions locales (STDIO/Unix sockets) vs distantes (TLS 1.2+). Authentification des clients MCP (mTLS, OAuth 2.1). Isolation des utilisateurs et sessions : pas de variables globales, nettoyage deterministe, quotas par session.',
        priority: 'critical',
      },
      {
        id: 'mcp-dev-2',
        title: '2. Design d\'outils securises',
        description: 'Manifestes cryptographiques pour chaque outil (signature, schema, version, permissions). Processus formel d\'approbation avec SAST, tests dynamiques, SCA et revue de securite manuelle. Validation description vs comportement reel.',
        priority: 'critical',
      },
      {
        id: 'mcp-dev-3',
        title: '3. Validation des donnees et gestion des ressources',
        description: 'Quotas et rate limiting par session. Validation stricte I/O via JSON Schema. Sanitisation des entrees/sorties contre XSS, SQL injection, RCE. Limites de taille sur toutes les sorties.',
        priority: 'high',
      },
      {
        id: 'mcp-dev-4',
        title: '4. Controles d\'injection de prompt',
        description: 'Appels d\'outils structures (JSON) plutot que texte libre. Human-in-the-Loop (HITL) pour les actions a haut risque. LLM-as-a-Judge pour verification des appels d\'outils. Une tache par session pour eviter la persistance d\'instructions cachees.',
        priority: 'critical',
      },
      {
        id: 'mcp-dev-5',
        title: '5. Authentification et autorisation',
        description: 'OAuth 2.1/OIDC obligatoire pour tous les serveurs MCP distants. Delegation de tokens (RFC 8693). Interdiction du passthrough de tokens. Tokens a duree de vie courte et scopes reduits.',
        priority: 'critical',
      },
      {
        id: 'mcp-dev-6',
        title: '6. Deploiement securise et mises a jour',
        description: 'Stockage de secrets dans des vaults (jamais en variables d\'environnement). Conteneurisation durcie (non-root). Segmentation reseau. Controles de chaine d\'approvisionnement. Gates de securite CI/CD.',
        priority: 'high',
      },
      {
        id: 'mcp-dev-7',
        title: '7. Gouvernance',
        description: 'Integrite cryptographique des outils et dependances. Revue par les pairs obligatoire. Journaux d\'audit immuables. Gouvernance des identites non-humaines (NHI).',
        priority: 'high',
      },
      {
        id: 'mcp-dev-8',
        title: '8. Outils et validation continue',
        description: 'Scan de code automatise (SAST + Invariant MCP-Scan). Protections runtime (seccomp, AppArmor). Monitoring continu (SIEM). Vigilance chaine d\'approvisionnement (OpenSSF Scorecard, OSV).',
        priority: 'medium',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. Cheat Sheet - Securely Using Third-Party MCP Servers
  // ─────────────────────────────────────────────────────────
  {
    id: 'mcp-third-party-cheatsheet',
    title: 'Guide de Securisation des Serveurs MCP Tiers v1.0',
    source: 'ChearSheet-A-Practical-Guide-for-Securely-Using-third-party-MCP-Servers1.0.pdf',
    category: 'mcp-security',
    summary: 'Cheat sheet pour les organisations utilisant des serveurs MCP tiers. Couvre les vulnerabilites specifiques (tool poisoning, rug pull, prompt injection), la decouverte et verification de serveurs, l\'authentification et la gouvernance.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'mcp-tp-1',
        title: 'Tool Poisoning et Rug Pull',
        description: 'Instructions malveillantes cachees dans les descriptions d\'outils. Rug pull : remplacement furtif d\'un outil legitime par une version malveillante. Mitigations : transparence totale des manifestes, sanitisation des descriptions, epinglage de versions avec checksums.',
        priority: 'critical',
      },
      {
        id: 'mcp-tp-2',
        title: 'Prompt Injection via MCP',
        description: 'Entrees malveillantes via descriptions d\'outils ou reponses de serveurs pour detourner le modele. Mitigations : validation des donnees non fiables, schemas stricts (JSON/YAML), segmentation des contextes.',
        priority: 'critical',
      },
      {
        id: 'mcp-tp-3',
        title: 'Empoisonnement de memoire',
        description: 'Corruption de la memoire court/long terme de l\'agent via les outils MCP. Mitigations : validation de chaque mise a jour memoire, TTL sur les donnees stockees, segmentation de la memoire par session.',
        priority: 'high',
      },
      {
        id: 'mcp-tp-4',
        title: 'Interference entre outils',
        description: 'Chaines d\'execution non prevues entre serveurs MCP multiples. Mitigations : Human-in-the-Loop, separation des contextes, timeouts d\'execution.',
        priority: 'high',
      },
      {
        id: 'mcp-tp-5',
        title: 'Decouverte et verification de serveurs',
        description: 'Verifier l\'origine avant connexion. Registre central de serveurs approuves. Choix STDIO (local) vs Streamable HTTP (distant). Epinglage de versions, deploiement par etapes, approbations humaines documentees.',
        priority: 'high',
      },
      {
        id: 'mcp-tp-6',
        title: 'Authentification et autorisation',
        description: 'Client Credentials pour operations systeme, OIDC/PKCE pour operations utilisateur. Scopes OAuth minimaux. Permissions granulaires par identite. Human-in-the-Loop pour actions inedites.',
        priority: 'critical',
      },
      {
        id: 'mcp-tp-7',
        title: 'Gouvernance MCP',
        description: 'Registre MCP de confiance : soumission, scan, revue, deploiement surveille, re-validation periodique. Roles : soumetteur (dev), reviseur securite, proprietaire domaine, approbateur, operateur (SRE).',
        priority: 'high',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. Vendor Evaluation Criteria for AI Red Teaming
  // ─────────────────────────────────────────────────────────
  {
    id: 'vendor-eval-red-teaming',
    title: 'Criteres d\'Evaluation des Fournisseurs de Red Teaming IA v1.0',
    source: 'Vendor-Evaluation-Criteria-for-AI-Red-Teaming-Providers-Tooling-v1.0.pdf',
    category: 'red-teaming',
    summary: 'Criteres pratiques pour evaluer les fournisseurs de services et d\'outils de Red Teaming IA. Couvre les systemes simples (chatbots, RAG) et avances (agents, MCP, multi-agents). Inclut une matrice de comparaison consultants vs outils automatises.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'vre-1',
        title: '3.1 Competence technique',
        description: 'Systemes simples : jailbreak, injection de prompt, attaques multi-tours, fuites de donnees, surface RAG. Systemes avances : semantique tool-calling, attaques multimodales, internes MCP, architectures multi-agents, escalade de privileges.',
        priority: 'critical',
      },
      {
        id: 'vre-2',
        title: '3.2 Methodologie et couverture',
        description: 'Simples : jailbreaks robustes, toxicite, biais, fiabilite RAG, extraction d\'infos, hallucinations. Avances : abus de tool-calling, manipulation de schemas, exposition MCP, contamination multi-agents, workflows adversariaux multi-etapes.',
        priority: 'critical',
      },
      {
        id: 'vre-3',
        title: '3.3 Creativite adversariale et expertise domaine',
        description: 'Consultants : capacite a creer des strategies adversariales nouvelles et des chaines d\'attaque complexes. Outils : diversite de generation d\'attaques, adaptabilite, simulation multi-tours et multi-agents.',
        priority: 'high',
      },
      {
        id: 'vre-4',
        title: '3.4 Realisme de la modelisation des menaces',
        description: 'Au-dela des jailbreaks : abus d\'outils, escalade de capacites MCP, violations de limites d\'agents, fuite de chain-of-thought, comportements adversariaux emergents entre agents.',
        priority: 'high',
      },
      {
        id: 'vre-5',
        title: '3.5 Rigueur d\'evaluation et metriques',
        description: 'Metriques cles : pass@k (succes apres k tentatives), Average Turns to Jailbreak, Average Risk Density, Retrieval Success Rate. Systemes avances : taux de misfire d\'outils, taux d\'appels d\'outils non securises, couverture d\'abus MCP.',
        priority: 'high',
      },
      {
        id: 'vre-6',
        title: '3.6 Qualite de l\'outillage et infrastructure',
        description: 'Simples : logging multi-tours, tracage de comportement, introspection RAG, rejeu de scenarios. Avances : rejeu de tool-calls, instrumentation MCP, simulation multi-agents, observabilite des traces.',
        priority: 'medium',
      },
      {
        id: 'vre-7',
        title: '3.7 Gouvernance des donnees et securite',
        description: 'Gestion des logs, prompts et sorties. Isolation des donnees operationnelles. Politique de retention zero. Options on-premise ou self-hosting.',
        priority: 'high',
      },
      {
        id: 'vre-8',
        title: '3.8 Transparence et explicabilite',
        description: 'Chaines d\'attaque detaillees etape par etape. Provenance des tool-calls. Diagrammes d\'escalade MCP. Traces d\'actions multi-agents. Separation claire entre actions du testeur et comportement observe.',
        priority: 'medium',
      },
      {
        id: 'vre-9',
        title: '3.9-3.13 Adaptabilite, integration, limitations, cout, conformite',
        description: 'Personnalisation au domaine et workflows. Integration CI/CD. Transparence sur les limitations. Rapport cout/valeur lie a la reduction reelle des risques. Alignement OWASP, NIST AI RMF, MITRE ATLAS, ISO 42001, EU AI Act.',
        priority: 'medium',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. OWASP GenAI COMPASS RunBook 1.0
  // ─────────────────────────────────────────────────────────
  {
    id: 'compass-runbook',
    title: 'OWASP GenAI COMPASS PlayBook v1.0',
    source: 'OWASP-GenAI-COMPASS-RunBook-1.0 (2).pdf',
    category: 'governance',
    summary: 'Guide operationnel pour utiliser le framework COMPASS (boucle OODA). Fournit les etapes detaillees pour evaluer les menaces IA, analyser la surface d\'attaque, identifier les vulnerabilites connues et produire une feuille de route de remediation.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'crb-1',
        title: 'Etape 1 - OBSERVE : Evaluation des profils de menaces',
        description: 'Trois profils : Profil 1 (menaces externes - adversaires utilisant l\'IA), Profil 2a (adoption IA interne), Profil 2b (outils IA productivite : Copilot, Gemini), Profil 2c (projets GenAI/agents personnalises).',
        priority: 'critical',
      },
      {
        id: 'crb-2',
        title: 'Etape 2 - OBSERVE : Tableau de bord objectif',
        description: 'Categoriser les menaces par profil de risque. Sequence recommandee : Profil 1 (externe) en priorite, puis Profil 2a (interne), puis 2b/2c selon les priorites strategiques.',
        priority: 'high',
      },
      {
        id: 'crb-3',
        title: 'Etape 3 - OBSERVE : Analyse de surface d\'attaque',
        description: 'Scoring 5 points (Impact x Vraisemblance). Documenter le scenario de "desastre nucleaire IA" de l\'organisation. Scoring : 1 (faible) a 5 (critique). En cas de doute, attribuer un score eleve.',
        priority: 'high',
      },
      {
        id: 'crb-4',
        title: 'Etape 4 - ORIENT : Vulnerabilites IA connues',
        description: 'Recherche CVE par mot-cle (LLM, prompt injection). Mapping vulnerabilite vers CWE (ex: prompt injection = CWE-77). Scoring CVSS adapte pour l\'IA. Revues bi-hebdomadaires recommandees.',
        priority: 'high',
      },
      {
        id: 'crb-5',
        title: 'Etape 5 - ORIENT : Incidents IA connus',
        description: 'Estimer vraisemblance et impact a partir des incidents publies (OpenAI, Google). Mettre a jour les scores de risque. Documenter les changements legaux et reglementaires.',
        priority: 'medium',
      },
      {
        id: 'crb-6',
        title: 'Etape 6 - DECIDE : Red Team vs Mitigations',
        description: 'Mapper les menaces aux defenses. Comparer les resultats du Red Team et les vulnerabilites connues avec les mitigations actuelles. Identifier les controles preventifs et detectifs manquants.',
        priority: 'high',
      },
      {
        id: 'crb-7',
        title: 'Etape 7 - ACT : Strategie et feuille de route',
        description: 'Documenter la strategie de remediation : taches specifiques, responsables, delais. Cadence de mise a jour reguliere. Integration avec les frameworks de risque internes existants.',
        priority: 'high',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. OWASP GenAI Incident Response Guide 1.0
  // ─────────────────────────────────────────────────────────
  {
    id: 'genai-ir-guide',
    title: 'Guide de Reponse aux Incidents GenAI v1.0',
    source: 'OWASP-GenAI-IR-Guide-1.0.pdf',
    category: 'incident-response',
    summary: 'Guide complet de reponse aux incidents pour les applications GenAI. Aligne sur le cycle de vie NIST IR. Couvre la definition d\'incidents IA, la preparation, la detection, la reponse et la recuperation pour les attaques sur les systemes IA, la chaine d\'approvisionnement et les fournisseurs de modeles.',
    url: 'https://genai.owasp.org',
    keyItems: [
      {
        id: 'gir-1',
        title: 'Definition d\'un incident IA',
        description: 'Tout evenement ou le comportement d\'un systeme IA conduit a des resultats non prevus, nuisibles ou augmentant les risques. Specifiques a l\'IA : centralite des prompts, generation stochastique, autonomie/agentivite, biais algorithmique, opacite du modele.',
        priority: 'critical',
      },
      {
        id: 'gir-2',
        title: 'Criteres diagnostiques par couche de stack IA',
        description: '4 couches : Modele (anomalies de performance, poisoning, integrite), Implementation (pipeline, extraction de modele, backdoors), Systeme (acces non autorise, usage compute), Runtime (injections adversariales, sorties inappropriees, patterns de requetes anormaux).',
        priority: 'critical',
      },
      {
        id: 'gir-3',
        title: 'Preparation : evaluation et gestion des risques',
        description: 'Identifier les risques IA (actifs, utilisateurs, operations, reputation, autonomie). Developper un framework de gestion des risques IA aligne avec NIST AI RMF. Inclure les risques GenAI dans le registre des risques enterprise.',
        priority: 'high',
      },
      {
        id: 'gir-4',
        title: 'Preparation : inventaire des actifs IA',
        description: 'Classification des actifs IA : modeles, donnees d\'entrainement, infrastructure, outils, APIs. Inventaire complet avec accessibilite, posture de securite, identites non-humaines et diagrammes reseau.',
        priority: 'high',
      },
      {
        id: 'gir-5',
        title: 'Detection d\'incidents IA',
        description: 'Techniques de detection par couche (modele, implementation, systeme, runtime). Integration de telemetrie dans SIEM/SOAR. Dashboards et strategie d\'alerting. Maturite de detection progressive.',
        priority: 'high',
      },
      {
        id: 'gir-6',
        title: 'Reponse : attaques sur les systemes IA',
        description: 'Couvre : attaques directes (prompt injection, jailbreak, evasion), attaques sur les donnees (poisoning, extraction), abus (DoS, manipulation de sorties). Detection, containment, eradication et recuperation specifiques.',
        priority: 'critical',
      },
      {
        id: 'gir-7',
        title: 'Reponse : attaques sur la chaine d\'approvisionnement',
        description: 'Types : modeles compromis, dependances malveillantes, donnees d\'entrainement empoisonnees, outils/frameworks manipules. Detection via SCA, verification d\'integrite, monitoring de comportement.',
        priority: 'high',
      },
      {
        id: 'gir-8',
        title: 'Reponse : attaques sur les fournisseurs de modeles tiers',
        description: 'Detection des compromissions de fournisseurs (degradation de performance, comportements inattendus). Containment, eradication via rollback de version, et activites post-incident.',
        priority: 'medium',
      },
      {
        id: 'gir-9',
        title: 'Equipe de reponse aux incidents IA',
        description: 'Roles specifiques : coordinateur incident IA, expert ML/IA, analyste donnees d\'entrainement, specialiste ethique IA, liaison juridique. Roles supplementaires pour l\'IA physique (robotique, systemes embarques).',
        priority: 'medium',
      },
    ],
  },
];

// Utility: Get references by category
export const getReferencesByCategory = (category: PDFReference['category']): PDFReference[] =>
  pdfReferences.filter(ref => ref.category === category);

// Utility: Get all key items across all references
export const getAllKeyItems = (): (ReferenceItem & { referenceId: string; referenceTitle: string })[] =>
  pdfReferences.flatMap(ref =>
    ref.keyItems.map(item => ({
      ...item,
      referenceId: ref.id,
      referenceTitle: ref.title,
    }))
  );

// Utility: Search across references
export const searchReferences = (query: string): PDFReference[] => {
  const lowerQuery = query.toLowerCase();
  return pdfReferences.filter(ref =>
    ref.title.toLowerCase().includes(lowerQuery) ||
    ref.summary.toLowerCase().includes(lowerQuery) ||
    ref.keyItems.some(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      (item.code && item.code.toLowerCase().includes(lowerQuery))
    )
  );
};
