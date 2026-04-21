import React from 'react';
import Card from '../components/ui/Card';
import { WikiChecklistCategory, WikiTool, WikiDataset } from '../types';
import WikiChecklist from '../components/wiki/WikiChecklist';
import WikiToolsTable from '../components/wiki/WikiToolsTable';
import { FileText, Zap, ShieldCheck, TestTubeDiagonal, BarChart3, Database, BookOpen, Bot, Lock, ClipboardCheck } from 'lucide-react';
import { pdfReferences } from './pdfReferences';

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="search-highlight">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};


// Extracted and structured content from OWASP GenAI Red Teaming Guide

const QUICK_START_GUIDE = [
    { title: "Définir les Objectifs & le Périmètre", text: "Identifiez les applications d'IA critiques ou celles manipulant des données sensibles. L'objectif est de démarrer, de prendre de l'élan et de montrer la valeur." },
    { title: "Assembler l'Équipe", text: "Impliquez des ingénieurs IA, des experts en cybersécurité, et si possible, des spécialistes en éthique ou conformité. La diversité des compétences assure une évaluation complète." },
    { title: "Modélisation des Menaces", text: "Considérez comment des attaquants pourraient exploiter les applications identifiées. Quelles sont les attaques les plus probables (ex: injection de prompt, extraction de données) ? Alignez ces scénarios avec vos risques prioritaires." },
    { title: "Analyser la Stack Complète", text: "Évaluation du Modèle (toxicité, biais), Vérification de l'Implémentation (garde-fous, prompts), Test du Système (APIs, stockage), Interaction Humaine (manipulation en temps réel)." },
    { title: "Utiliser les Outils & Frameworks", text: "Commencez avec des outils de base pour le test de prompts, le filtrage de contenu et les requêtes adversariales. Référez-vous aux annexes du guide pour une liste d'outils open-source." },
    { title: "Documenter les Résultats & Rapporter", text: "Enregistrez chaque vulnérabilité, scénario d'exploit et faiblesse découverte. Résumez-les dans des rapports exploitables avec des étapes de remédiation claires." },
    { title: "Debriefing / Analyse Post-Engagement", text: "Discutez des tactiques, techniques et procédures (TTPs) utilisées, identifiez les vulnérabilités exploitées, les leçons apprises et recommandez des améliorations." },
    { title: "Amélioration Continue", text: "Le Red Teaming n'est pas un événement unique. Ré-évaluez après l'implémentation des correctifs et intégrez des vérifications périodiques dans votre cycle de vie de l'IA." },
];

const ESSENTIAL_TECHNIQUES = [
    { title: "Ingénierie de Prompt Adversariale", text: "Une approche structurée pour générer et gérer divers jeux de données de prompts adversariaux, conçus pour tester rigoureusement la robustesse du modèle." },
    { title: "Génération et Manipulation de Données", text: "Utilisez des jeux de données statiques ou dynamiques. Les jeux de données synthétiques et perturbés sont préférables pour tester des scénarios de menace évolutifs." },
    { title: "Attaques en un ou plusieurs tours", text: "Les attaques 'One-Shot' se concentrent sur des prompts individuels, tandis que les attaques 'Multi-Turn' peuvent révéler des faiblesses supplémentaires en engageant le modèle dans un flux conversationnel." },
    { title: "Test de Fragilité des Prompts (Brittleness)", text: "Répétez les prompts pour explorer le non-déterminisme et perturbez-les légèrement pour évaluer la fragilité du modèle." },
    { title: "Gestion de la Variabilité Stochastique", text: "Effectuez plusieurs tentatives pour chaque prompt. Un seuil de succès (ex: succès après 15 tentatives) peut indiquer une vulnérabilité potentielle." },
    { title: "Tests Basés sur des Scénarios", text: "Créez des scénarios qui simulent une mauvaise utilisation ou un abus potentiel du système d'IA dans le contexte de l'application métier." },
    { title: "Analyse et Validation des Sorties", text: "Implémentez des vérifications automatisées pour l'exactitude factuelle, la cohérence et la sécurité. Effectuez une revue manuelle pour les problèmes nuancés comme les biais." },
    { title: "Tests Éthiques et de Biais", text: "Testez systématiquement différents types de biais (historiques, sociétaux) et évaluez la gestion par le modèle des sujets éthiquement sensibles." },
];

const BLUEPRINT_CHECKLISTS: WikiChecklistCategory[] = [
    {
        title: "1. Évaluation du Modèle",
        sections: [
            { title: "Attaques d'Inférence", items: ["Test des méthodes d'inférence des paramètres du modèle", "Sondage pour les détails de l'architecture/entraînement", "Test de l'inférence des capacités du modèle", "Évaluation de l'empreinte du système backend", "Test de l'inférence des données d'entraînement", "Sondage des détails de déploiement du modèle", "Test des schémas d'allocation de ressources", "Évaluation de la détection de version du modèle"].map((text, i) => ({ id: `m-inf-${i}`, text })) },
            { title: "Attaques d'Extraction", items: ["Test de l'extraction de la base de connaissances du modèle", "Sondage pour la récupération des données d'entraînement", "Test de l'extraction des poids/paramètres", "Évaluation des méthodes d'extraction des embeddings", "Test de l'extraction des politiques/règles", "Sondage de l'extraction du modèle de prompt", "Test de la récupération du prompt système", "Évaluation des vecteurs de distillation du modèle"].map((text, i) => ({ id: `m-ext-${i}`, text })) },
            { title: "Attaques sur l'Ajustement des Instructions", items: ["Test de la manipulation de la rétention d'instruction", "Sondage des conditions aux limites du fine-tuning", "Test de l'exploitation des conflits d'instruction", "Évaluation des méthodes de surcharge d'instruction", "Test de l'interférence inter-tâches", "Sondage de la persistance de l'instruction", "Test des attaques de collision d'instruction", "Évaluation de la manipulation de la priorité d'instruction"].map((text, i) => ({ id: `m-ins-${i}`, text })) },
            { title: "Évaluation des Dommages Socio-technologiques", items: ["Test des schémas de biais démographiques", "Évaluation de la génération de discours de haine", "Test des limites de contenu préjudiciable", "Évaluation des contrôles CSAM/NSII", "Test des schémas de génération de toxicité", "Évaluation de la propagation des stéréotypes", "Test de la génération de contenu extrémiste", "Évaluation des réponses discriminatoires"].map((text, i) => ({ id: `m-soc-${i}`, text })) },
            { title: "Évaluation des Risques de Données", items: ["Test de violation d'accès aux données", "Test de l'extraction de propriété intellectuelle", "Test des violations de copyright en sortie", "Test des sorties de watermarking", "Sondage de la récupération de PII/données sensibles", "Test de la reconstruction des données d'entraînement", "Évaluation des schémas d'accès aux données", "Test des contrôles de limites de données", "Évaluation des méthodes d'inférence de données", "Test de l'identification de la source de données", "Sondage des schémas de rétention de données"].map((text, i) => ({ id: `m-dat-${i}`, text })) },
            { title: "Test de Contrôle de l'Alignement", items: ["Test de l'efficacité des techniques de jailbreak", "Évaluation des méthodes d'injection de prompt", "Test des limites d'alignement des valeurs", "Évaluation des contournements de la couche de sécurité", "Test des conditions aux limites éthiques", "Évaluation des schémas de surcharge d'instruction", "Test des limites de rétention de contrôle", "Sondage des conflits de contrôle de sécurité", "Test de conversation manifestement hors limites"].map((text, i) => ({ id: `m-ali-${i}`, text })) },
            { title: "Test de Robustesse Adversariale", items: ["Test de nouveaux schémas d'attaque", "Évaluation des vulnérabilités inconnues", "Test des comportements de cas limites", "Évaluation des modes de défaillance", "Test des capacités émergentes", "Évaluation des combinaisons de chaînes d'attaque", "Test des comportements indéfinis", "Sondage des limites de résilience"].map((text, i) => ({ id: `m-rob-${i}`, text })) },
            { title: "Test de Vecteurs de Dommages Techniques", items: ["Test des limites de génération de code", "Évaluation du potentiel de génération d'exploits", "Test de la création de scripts d'attaque", "Évaluation des vecteurs d'attaque sur l'infrastructure", "Test de la génération de commandes système", "Évaluation de la découverte de vulnérabilités", "Test de la création de méthodologies d'attaque", "Sondage des capacités de support aux cyber-attaques"].map((text, i) => ({ id: `m-tec-${i}`, text })) },
        ]
    },
    {
        title: "2. Évaluation de l'Implémentation",
        sections: [
            { title: "Test de Contrôle de Sécurité des Prompts", items: ["Test des techniques de jailbreak direct et des schémas d'évasion", "Sondage des vulnérabilités de manipulation de contexte", "Test des chaînes d'attaque par interaction multi-messages", "Évaluation des contournements basés sur le jeu de rôle et la persona"].map((text, i) => ({ id: `i-pro-${i}`, text })) },
            { title: "Sécurité de la Récupération de Connaissances", items: ["Test des vecteurs d'empoisonnement de base de données vectorielle", "Sondage des attaques de manipulation d'embedding", "Test des méthodes de pollution de recherche sémantique", "Évaluation de la manipulation des résultats de récupération", "Test des techniques d'empoisonnement de cache"].map((text, i) => ({ id: `i-kno-${i}`, text })) },
            { title: "Contrôle d'Architecture Système", items: ["Test des contournements de limites d'isolation du modèle", "Sondage de l'évasion des règles de proxy/pare-feu"].map((text, i) => ({ id: `i-arc-${i}`, text })) },
            { title: "Test de Contournement du Filtrage de Contenu", items: ["Test des limites d'application de la politique de contenu", "Sondage des techniques d'évasion de filtre", "Test de la cohérence des filtres multilingues", "Évaluation des contournements de filtres contextuels", "Test des contrôles de nettoyage des sorties", "Évaluation des vecteurs de modification de contenu", "Test de la manipulation de la chaîne de filtres", "Sondage des conflits de règles de filtre"].map((text, i) => ({ id: `i-fil-${i}`, text })) },
            { title: "Test de Contrôle d'Accès", items: ["Test des conditions aux limites de l'authentification", "Sondage des contournements de niveau d'autorisation", "Test des contrôles de gestion de session", "Évaluation des restrictions d'accès API", "Test des contrôles d'accès basés sur les rôles", "Évaluation des vecteurs d'escalade de privilèges", "Test de l'authentification de service à service", "Sondage des contrôles de validation de token"].map((text, i) => ({ id: `i-acc-${i}`, text })) },
        ]
    },
    {
        title: "3. Évaluation du Système",
        sections: [
            { title: "Exécution de Code à Distance", items: ["Test de l'exécution de code en sortie du modèle", "Sondage de l'injection de commandes système", "Test des vulnérabilités de sérialisation", "Évaluation des vecteurs d'injection de template", "Test de la manipulation de chemin de fichier", "Sondage de l'abus de callback/webhook", "Test des vecteurs d'importation de module"].map((text, i) => ({ id: `s-rce-${i}`, text })) },
            { title: "Vulnérabilités de la Chaîne d'Approvisionnement", items: ["Test de l'intégrité des dépendances", "Sondage de la sécurité des dépôts de paquets", "Test de la sécurité du mécanisme de mise à jour", "Évaluation de la validation de la source du modèle", "Test de la sécurité du pipeline de déploiement", "Sondage de la sécurité de l'image de conteneur", "Test de la version de la bibliothèque de contrôle"].map((text, i) => ({ id: `s-sup-${i}`, text })) },
            { title: "Évaluation de l'Intégrité Globale du Système", items: ["Test des chaînes de validation de sortie", "Sondage de l'efficacité du nettoyage des entrées", "Test de l'intégrité du pipeline de données", "Évaluation du contrôle de version du modèle", "Test de la cohérence de la configuration", "Sondage de l'intégrité de la journalisation/audit", "Test de l'intégrité du système de sauvegarde", "Évaluation des mécanismes de rollback"].map((text, i) => ({ id: `s-int-${i}`, text })) },
        ]
    },
    {
        title: "4. Évaluation Runtime / Humaine & Agentique",
        sections: [
            { title: "Test d'Intégration des Processus Métier", items: ["Sondage des moyens de perturber les transferts de workflow entre l'IA et les opérateurs humains", "Test des conditions de course dans le traitement parallèle des tâches IA-humain", "Identification de l'escalade de privilèges non autorisée via les chaînes de processus", "Test des conditions aux limites dans les flux de décision automatisés"].map((text, i) => ({ id: `r-bus-${i}`, text })) },
            { title: "Test d'Interaction Multi-Composants IA", items: ["Exploitation des sorties conflictuelles entre différents modèles d'IA", "Test de la fuite d'informations entre des composants IA ségrégués", "Sondage des défaillances en cascade à travers les systèmes IA interconnectés", "Identification des opportunités de contournement d'authentification entre les services IA"].map((text, i) => ({ id: `r-mul-${i}`, text })) },
            { title: "Évaluation de la Sur-confiance", items: ["Test des scénarios de sur-confiance de l'opérateur humain", "Sondage du biais d'automatisation dans la prise de décision", "Identification des chemins critiques manquant de supervision humaine", "Test des mécanismes de repli", "Évaluation des opérations en mode dégradé"].map((text, i) => ({ id: `r-ove-${i}`, text })) },
            { title: "Vecteurs d'Ingénierie Sociale", items: ["Test de l'injection de prompt via les opérateurs humains", "Exploitation des relations de confiance IA-humain", "Sondage des vulnérabilités d'usurpation d'autorité", "Test de la manipulation des traits de personnalité de l'IA", "Identification des vecteurs d'exploitation émotionnelle"].map((text, i) => ({ id: `r-soc-${i}`, text })) },
        ]
    }
];

const METRICS_DATA = [
    { category: "Métriques de Gouvernance", items: ["Nombre de tests complétés par semaine (par sujet)", "Analyses de prompts positifs et négatifs", "Analyses négatives groupées par type (HAP, biais, etc.)", "Nombre de politiques de garde-fou", "Volume d'analyse de prompts"] },
    { category: "Attaques Adversariales", items: ["Taux de Succès des Attaques (ASR) / Taux de Succès de Jailbreak (JSR)", "Taux de Détection : capacité à détecter, bloquer ou récupérer des attaques"] },
    { category: "Connaissances & Raisonnement", items: ["Factualité : Précision des informations", "Pertinence : Alignement avec la requête", "Cohérence : Consistance logique des sorties", "Ancrage (Groundedness) : Réponses supportées par des faits", "Complétude : Réponses complètes aux requêtes", "Aide & Innocuité : Fournir des informations utiles sans causer de tort"] },
    { category: "Comportement Émergent & Robustesse", items: ["Performance face à des entrées inattendues ou adversariales", "Consistance avec des prompts légèrement modifiés", "Prévisibilité sur un large spectre d'entrées", "Identification des modes de défaillance", "Surveillance de la dérive (drift) du modèle dans le temps", "Détection des hallucinations"] },
    { category: "Alignement", items: ["Pertinence de la Requête : Le modèle comprend-il la demande ?", "Pertinence du Contexte : Le modèle utilise-t-il le contexte pertinent ?", "Ancrage (Groundedness) : La réponse est-elle supportée par le contexte ?"] },
    { category: "Métriques de Biais et d'Équité", items: ["Représentation démographique (sur/sous-représentation)", "Biais stéréotypé", "Biais distributionnel", "Représentation d'opinions subjectives diverses", "Équité des capacités (entre différentes langues)", "Compas politique/moral"] },
];

const TOOLS: WikiTool[] = [
    { name: "ASCII Smuggler", description: "Outil pour intégrer du contenu caché dans les prompts.", reference: "https://embracethered.com/blog/ascii-smuggler.html", licensing: "Open Source" },
    { name: "Adversarial Robustness Toolbox (ART)", description: "Bibliothèque Python pour la sécurité de l'apprentissage automatique.", reference: "https://github.com/Trusted-AI/adversarial-robustness-toolbox.git", licensing: "MIT License" },
    { name: "CleverHans", description: "Bibliothèque Python pour bencher la vulnérabilité des systèmes ML.", reference: "https://github.com/cleverhans-lab/cleverhans.git", licensing: "MIT License" },
    { name: "CyberSecEval", description: "Benchmark pour quantifier les risques de sécurité des LLM.", reference: "https://ai.meta.com/research/publications/cyberseceval-3-advancing-the-evaluation-of-cybersecurity-risks-and-capabilities-in-large-language-models/", licensing: "MIT License" },
    { name: "DeepEval", description: "Évaluation de LLM (test unitaire) avec possibilité de plusieurs sorties métriques.", reference: "https://github.com/confident-ai/deepeval", licensing: "Apache License 2.0" },
    { name: "Garak", description: "Kit d'évaluation et de red-teaming pour l'IA Générative.", reference: "https://github.com/NVIDIA/garak", licensing: "Apache License 2.0" },
    { name: "Harmbench", description: "Framework open-source pour évaluer les méthodes de Red Teaming automatisé.", reference: "https://github.com/centerforaisafety/HarmBench", licensing: "MIT License" },
    { name: "Modelscan", description: "Outil pour détecter divers types d'attaques de sérialisation de modèles.", reference: "https://github.com/protectai/modelscan", licensing: "Apache License 2.0" },
    { name: "Prompt Fuzzer", description: "Évalue la sécurité des applications GenAI en testant les prompts système contre des attaques dynamiques basées sur les LLM.", reference: "https://github.com/prompt-security/ps-fuzz", licensing: "MIT License" },
    { name: "Promptfoo", description: "Red Teaming, pen testing et scan de vulnérabilités pour les LLMs.", reference: "https://github.com/promptfoo/promptfoo", licensing: "MIT License" },
    { name: "Python Risk Identification Toolkit (PyRIT)", description: "Bibliothèque de Microsoft pour aider les chercheurs à évaluer la robustesse de leurs points de terminaison LLM.", reference: "https://github.com/Azure/PyRIT", licensing: "MIT License" },
    { name: "StrongREJECT", description: "Benchmark de jailbreak avec méthodologie d'évaluation.", reference: "https://strong-reject.readthedocs.io/en/latest/", licensing: "MIT License" },
];

const DATASETS: WikiDataset[] = [
    { name: "AdvBench", description: "Attaques adversariales universelles et transférables sur des modèles de langage alignés.", reference: "https://api.semanticscholar.org/CorpusID:260202961", licensing: "Opensource" },
    { name: "BBQ", description: "Benchmark de Biais pour la Réponse aux Questions (QA).", reference: "https://github.com/nyu-mll/BBQ", licensing: "Opensource" },
    { name: "HarmBench Dataset", description: "Un framework d'évaluation standardisé pour le Red Teaming automatisé et le refus robuste.", reference: "https://api.semanticscholar.org/CorpusID:267499790", licensing: "Opensource" },
    { name: "JailbreakBench", description: "Un benchmark de robustesse ouvert pour le jailbreaking de grands modèles de langage.", reference: "https://api.semanticscholar.org/CorpusID:268857237", licensing: "Opensource" },
];

interface ContentComponentProps {
    searchTerm?: string;
}

const QuickStartContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><FileText size={24} className="mr-3 text-cyan-400" />Guide de Démarrage Rapide</h2>
        <div className="space-y-4">
            {QUICK_START_GUIDE.map((item, index) => (
                <div key={index} className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold mr-4">{index + 1}</div>
                    <div>
                        <h4 className="font-semibold text-white"><Highlight text={item.title} highlight={searchTerm} /></h4>
                        <p className="text-gray-400"><Highlight text={item.text} highlight={searchTerm} /></p>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const BlueprintContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><ShieldCheck size={24} className="mr-3 text-cyan-400" />Blueprint pour le Red Teaming GenAI</h2>
        <p className="text-gray-400 mb-6">Utilisez ces checklists interactives pour suivre systématiquement votre évaluation à travers les différentes phases du blueprint. Votre progression est sauvegardée localement.</p>
        <WikiChecklist categories={BLUEPRINT_CHECKLISTS} searchTerm={searchTerm} />
    </Card>
);

const TechniquesContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><Zap size={24} className="mr-3 text-cyan-400" />Techniques Essentielles</h2>
        <div className="space-y-3">
            {ESSENTIAL_TECHNIQUES.map((item, index) => (
                 <div key={index} className="bg-gray-700/50 p-3 rounded-md">
                    <h4 className="font-semibold text-white"><Highlight text={item.title} highlight={searchTerm} /></h4>
                    <p className="text-sm text-gray-400"><Highlight text={item.text} highlight={searchTerm} /></p>
                </div>
            ))}
        </div>
    </Card>
);

const MetricsContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><BarChart3 size={24} className="mr-3 text-cyan-400" />Métriques de Benchmark</h2>
         <div className="space-y-4">
            {METRICS_DATA.map((cat, index) => (
                <div key={index}>
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2"><Highlight text={cat.category} highlight={searchTerm} /></h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                       {cat.items.map((item, i) => <li key={i}><Highlight text={item} highlight={searchTerm} /></li>)}
                    </ul>
                </div>
            ))}
        </div>
    </Card>
);

const ToolsAndDatasetsContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
     <Card>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><Database size={24} className="mr-3 text-cyan-400" />Outils et Jeux de Données</h2>
        <WikiToolsTable tools={TOOLS} datasets={DATASETS} searchTerm={searchTerm}/>
    </Card>
);


// ─────────────────────────────────────────────────────────
// NEW SECTIONS: Agentic Security, MCP Security, Red Team Evaluation
// Source: OWASP GenAI Security Project PDF references
// ─────────────────────────────────────────────────────────

const AGENTIC_TOP10_REF = pdfReferences.find(r => r.id === 'owasp-agentic-top10')!;
const SECURING_AGENTIC_REF = pdfReferences.find(r => r.id === 'securing-agentic-guide')!;
const MCP_SERVER_REF = pdfReferences.find(r => r.id === 'mcp-server-security')!;
const MCP_THIRD_PARTY_REF = pdfReferences.find(r => r.id === 'mcp-third-party-cheatsheet')!;
const VENDOR_EVAL_REF = pdfReferences.find(r => r.id === 'vendor-eval-red-teaming')!;
const COMPASS_RUNBOOK_REF = pdfReferences.find(r => r.id === 'compass-runbook')!;
const IR_GUIDE_REF = pdfReferences.find(r => r.id === 'genai-ir-guide')!;
const DATA_SECURITY_REF = pdfReferences.find(r => r.id === 'genai-data-security-2026')!;

const priorityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const priorityLabels: Record<string, string> = {
    critical: 'Critique',
    high: 'Haut',
    medium: 'Moyen',
    low: 'Faible',
};

const AgenticSecurityContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Bot size={24} className="mr-3 text-cyan-400" />
            Sécurité IA Agentique
        </h2>
        <p className="text-gray-500 text-sm mb-6">
            Source : OWASP GenAI Security Project - Agentic Security Initiative (CC BY-SA 4.0)
        </p>

        {/* OWASP Top 10 Agentic */}
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="OWASP Top 10 for Agentic Applications 2026" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={AGENTIC_TOP10_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {AGENTIC_TOP10_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                {item.code && <span className="text-cyan-400 mr-2">{item.code}</span>}
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* Securing Agentic Applications */}
        <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="Guide de Sécurisation des Applications Agentiques" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={SECURING_AGENTIC_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {SECURING_AGENTIC_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

const MCPSecurityContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Lock size={24} className="mr-3 text-cyan-400" />
            Sécurité MCP (Model Context Protocol)
        </h2>
        <p className="text-gray-500 text-sm mb-6">
            Source : OWASP GenAI Security Project (CC BY-SA 4.0)
        </p>

        {/* MCP Server Development Security */}
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="Développement Sécurisé de Serveurs MCP" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={MCP_SERVER_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {MCP_SERVER_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* MCP Third-Party Cheat Sheet */}
        <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="Utilisation Sécurisée de Serveurs MCP Tiers" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={MCP_THIRD_PARTY_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {MCP_THIRD_PARTY_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

const RedTeamEvalContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <ClipboardCheck size={24} className="mr-3 text-cyan-400" />
            Critères d'Évaluation Red Team
        </h2>
        <p className="text-gray-500 text-sm mb-6">
            Source : OWASP GenAI Security Project (CC BY-SA 4.0)
        </p>

        {/* Vendor Evaluation */}
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="Évaluation des Fournisseurs de Red Teaming IA" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={VENDOR_EVAL_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {VENDOR_EVAL_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* COMPASS Runbook */}
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="COMPASS PlayBook - Procédures OODA" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={COMPASS_RUNBOOK_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {COMPASS_RUNBOOK_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* Incident Response Guide */}
        <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                <Highlight text="Guide de Réponse aux Incidents GenAI" highlight={searchTerm} />
            </h3>
            <p className="text-gray-400 text-sm mb-4">
                <Highlight text={IR_GUIDE_REF.summary} highlight={searchTerm} />
            </p>
            <div className="space-y-3">
                {IR_GUIDE_REF.keyItems.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                                <Highlight text={item.title} highlight={searchTerm} />
                            </h4>
                            {item.priority && (
                                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[item.priority]}`}>
                                    {priorityLabels[item.priority]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            <Highlight text={item.description} highlight={searchTerm} />
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

const DataSecurityContent: React.FC<ContentComponentProps> = ({ searchTerm = '' }) => (
    <Card>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Database size={24} className="mr-3 text-cyan-400" />
            Sécurité des Données GenAI (OWASP DSGAI)
        </h2>
        <p className="text-gray-500 text-sm mb-4">
            Source : OWASP GenAI Security Project - Data Security (CC BY-SA 4.0)
        </p>

        <p className="text-sm text-gray-300 mb-4">
            <Highlight text={DATA_SECURITY_REF.summary} highlight={searchTerm} />
        </p>

        {DATA_SECURITY_REF.documentMeta && (
            <div className="text-xs text-gray-400 flex flex-wrap gap-3 mb-6">
                <span>Version {DATA_SECURITY_REF.documentMeta.version}</span>
                <span>{DATA_SECURITY_REF.documentMeta.pages} pages</span>
                <span>Licence {DATA_SECURITY_REF.documentMeta.license}</span>
            </div>
        )}

        <div className="space-y-2">
            {DATA_SECURITY_REF.keyItems.map((item) => (
                <details key={item.id} className="bg-gray-800/50 rounded-lg border border-gray-700">
                    <summary className="cursor-pointer p-3 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${priorityColors[item.priority || 'medium']}`}>
                            {item.code || item.id.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-white">
                            <Highlight text={item.title} highlight={searchTerm} />
                        </span>
                    </summary>
                    <div className="p-3 pt-0 text-xs text-gray-300 space-y-3">
                        {item.detailedSections?.overview && (
                            <div>
                                <div className="font-semibold text-gray-200 mb-1">Aperçu</div>
                                <p className="leading-relaxed">{item.detailedSections.overview}</p>
                            </div>
                        )}
                        {item.detailedSections?.attackVectors && item.detailedSections.attackVectors.length > 0 && (
                            <div>
                                <div className="font-semibold text-gray-200 mb-1">Vecteurs d'attaque</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    {item.detailedSections.attackVectors.map((v, i) => <li key={i}>{v}</li>)}
                                </ul>
                            </div>
                        )}
                        {item.detailedSections?.mitigationTiers && (
                            <div>
                                <div className="font-semibold text-gray-200 mb-1">Mitigations par niveau</div>
                                {(['tier1', 'tier2', 'tier3'] as const).map(tier =>
                                    item.detailedSections?.mitigationTiers?.[tier]?.length ? (
                                        <div key={tier} className="mt-2">
                                            <div className="text-[11px] uppercase tracking-wide text-blue-400">
                                                {tier === 'tier1' ? 'Tier 1 (Foundational)' : tier === 'tier2' ? 'Tier 2 (Hardening)' : 'Tier 3 (Advanced)'}
                                            </div>
                                            <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                                {item.detailedSections.mitigationTiers[tier]!.map((m, i) => <li key={i}>{m}</li>)}
                                            </ul>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        )}
                        {item.detailedSections?.knownCVEs && item.detailedSections.knownCVEs.length > 0 && (
                            <div>
                                <div className="font-semibold text-gray-200 mb-1">CVEs / exploits connus</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    {item.detailedSections.knownCVEs.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>
            ))}
        </div>
    </Card>
);

export const WIKI_SECTIONS = [
    { id: 'quick-start', title: 'Démarrage Rapide', icon: <FileText size={18} />, content: <QuickStartContent /> },
    { id: 'blueprint', title: 'Blueprint (Checklists)', icon: <ShieldCheck size={18} />, content: <BlueprintContent /> },
    { id: 'techniques', title: 'Techniques Essentielles', icon: <Zap size={18} />, content: <TechniquesContent /> },
    { id: 'metrics', title: 'Métriques', icon: <BarChart3 size={18} />, content: <MetricsContent /> },
    { id: 'tools-datasets', title: 'Outils & Datasets', icon: <Database size={18} />, content: <ToolsAndDatasetsContent /> },
    { id: 'agentic-security', title: 'Sécurité IA Agentique', icon: <Bot size={18} />, content: <AgenticSecurityContent /> },
    { id: 'mcp-security', title: 'Sécurité MCP', icon: <Lock size={18} />, content: <MCPSecurityContent /> },
    { id: 'red-team-eval', title: 'Évaluation Red Team', icon: <ClipboardCheck size={18} />, content: <RedTeamEvalContent /> },
    { id: 'data-security-genai', title: 'Sécurité Données GenAI (DSGAI)', icon: <Database size={18} />, content: <DataSecurityContent /> },
];
