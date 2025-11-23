import React, { useState, Suspense, lazy } from 'react';
import './components/policy/PolicyView.css';
import Sidebar from './components/Sidebar';
import { NavigationBreadcrumbs } from './components/navigation/NavigationBreadcrumbs';

// Lazy load heavy components for better initial load performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const Analytics = lazy(() => import('./components/Analytics'));
const DatasetManager = lazy(() => import('./components/DatasetManager'));
const AdvancedScenarios = lazy(() => import('./components/AdvancedScenarios'));
const PromptfooConfigEditor = lazy(() => import('./components/PromptfooConfigEditor'));
const PromptfooTestExecution = lazy(() => import('./components/PromptfooTestExecution'));
const PromptfooWizard = lazy(() => import('./components/PromptfooWizard'));
const UseCasesView = lazy(() => import('./components/UseCasesView'));
const ThreatProfileView = lazy(() => import('./components/ThreatProfileView'));
const AttackSurfaceAnalysisView = lazy(() => import('./components/AttackSurfaceAnalysisView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const KnownVulnerabilitiesView = lazy(() => import('./components/KnownVulnerabilitiesView'));
const KnownIncidentsView = lazy(() => import('./components/KnownIncidentsView'));
const IncidentReadinessView = lazy(() => import('./components/IncidentReadinessView'));
const RedTeamSecurityView = lazy(() => import('./components/RedTeamSecurityView'));
const RedTeamResultsView = lazy(() => import('./components/RedTeamResultsView'));
const DefensesMitigationsView = lazy(() => import('./components/DefensesMitigationsView'));
const AIThirdPartyQuestionsView = lazy(() => import('./components/AIThirdPartyQuestionsView'));
const WikiRedTeamerView = lazy(() => import('./components/WikiRedTeamerView'));
const AIPolicyView = lazy(() => import('./components/AIPolicyViewComplete'));
const AIRiskRepositoryView = lazy(() => import('./components/AIRiskRepositoryView'));
const CompassUseCasesView = lazy(() => import('./components/compass/CompassUseCasesView'));
const ChatbotModern = lazy(() => import('./components/chatbot/ChatbotModern'));
const ChatbotFab = lazy(() => import('./components/chatbot/ChatbotFab'));
const ApplicationProfileManager = lazy(() => import('./components/ApplicationProfileManager'));
// import PromptfooResultsView from './components/PromptfooResultsView'; // Temporairement désactivé
const UnifiedSecurityHub = lazy(() => import('./src/components/unified/UnifiedSecurityHub'));
const GarakScannerUI = lazy(() => import('./src/components/unified/GarakScannerUI'));
const StrixDashboard = lazy(() => import('./src/components/unified/StrixDashboardEnriched'));
const LLMConfigView = lazy(() => import('./components/LLMConfigView'));
import { TestRunProvider } from './contexts/TestRunContext';
import { DatasetProvider } from './contexts/DatasetContext';
import { UseCaseProvider } from './contexts/UseCaseContext';
import { ThreatProfileProvider } from './contexts/ThreatProfileContext';
import { AttackSurfaceProvider } from './contexts/AttackSurfaceContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { KnownVulnerabilitiesProvider } from './contexts/KnownVulnerabilitiesContext';
import { KnownIncidentsProvider } from './contexts/KnownIncidentsContext';
import { IncidentReadinessProvider } from './contexts/IncidentReadinessContext';
import { RedTeamProvider } from './contexts/RedTeamContext';
import { RedTeamResultsProvider } from './contexts/RedTeamResultsContext';
import { DefensesMitigationsProvider } from './contexts/DefensesMitigationsContext';
import { AIThirdPartyQuestionsProvider } from './contexts/AIThirdPartyQuestionsContext';
import { WikiProvider } from './contexts/WikiContext';
import { AIPolicyProvider } from './contexts/AIPolicyContext';
import { AIRiskRepositoryProvider } from './contexts/AIRiskRepositoryContext';
import { CompassProvider } from './contexts/CompassContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ApplicationProfileProvider } from './contexts/ApplicationProfileContext';
import { LLMConfigProvider } from './contexts/LLMConfigContext';
import {
  ShieldCheck, LayoutDashboard, BarChart3, Database, FlaskConical, FileSpreadsheet,
  ShieldAlert, ClipboardCheck, SlidersHorizontal, ShieldQuestion, FileWarning, HeartPulse,
  SearchCheck, ClipboardPen, BookLock, ClipboardList, BookOpen, BookMarked, Lock,
  RefreshCw, MoreHorizontal, BookCopy, Compass, TestTube2, Settings, FileText, Play,
  Target, Shield, BookOpenCheck, FileCode, Server, Zap, Wrench, Activity, AlertTriangle, Layers, Sparkles
} from 'lucide-react';

// ============================================
// STRUCTURE DE NAVIGATION AMÉLIORÉE
// ============================================

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  section?: string;
  stepNumber?: number;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
}

// ============================================
// SECTION 0 : GESTION DES APPLICATIONS (Prérequis)
// ============================================
const applicationsSection: NavSection = {
  id: 'applications',
  label: '📋 Étape 0 : Applications à Tester',
  icon: <Target size={20} />,
  defaultOpen: true,
  items: [
    {
      id: 'application-profiles',
      label: 'Profils d\'Applications',
      icon: <Server size={18} />,
      content: <ApplicationProfileManager />,
      section: 'Applications à Tester',
      stepNumber: 0,
      description: '⚠️ PRÉREQUIS : Configurez d\'abord vos applications IA avant de lancer des tests'
    },
  ]
};

// ============================================
// SECTION 1A : MODE DÉBUTANT (Parcours Guidé)
// ============================================
const beginnerSection: NavSection = {
  id: 'beginner-mode',
  label: '🚀 Mode Débutant (Recommandé)',
  icon: <Zap size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'promptfoo-wizard',
      label: 'Assistant Guidé',
      icon: <Zap size={18} />,
      content: <PromptfooWizard />,
      section: 'Mode Débutant',
      stepNumber: 1,
      description: 'Tout-en-un : Configuration → Validation → Exécution en 3 étapes'
    },
    // {
    //   id: 'test-results-beginner',
    //   label: '📊 Résultats',
    //   icon: <BarChart3 size={18} />,
    //   content: <PromptfooResultsView />,
    //   section: 'Mode Débutant',
    //   stepNumber: 2,
    //   description: 'Consulter les résultats et exporter (PDF/Excel)'
    // },
  ]
};

// ============================================
// SECTION 1B : MODE EXPERT (Parcours Avancé)
// ============================================
const expertSection: NavSection = {
  id: 'expert-mode',
  label: '⚙️ Mode Expert',
  icon: <Settings size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'test-config',
      label: '1️⃣ Configuration',
      icon: <Settings size={18} />,
      content: <Dashboard />,
      section: 'Mode Expert',
      stepNumber: 1,
      description: 'Catégories, plugins, volume, cible API'
    },
    {
      id: 'promptfoo-config',
      label: '2️⃣ Édition YAML',
      icon: <FileCode size={18} />,
      content: <PromptfooConfigEditor />,
      section: 'Mode Expert',
      stepNumber: 2,
      description: 'Prévisualiser et éditer promptfooconfig.yaml'
    },
    {
      id: 'test-datasets',
      label: '3️⃣ Datasets (Optionnel)',
      icon: <FileText size={18} />,
      content: <DatasetManager />,
      section: 'Mode Expert',
      stepNumber: 3,
      description: 'Ajouter des prompts personnalisés'
    },
    {
      id: 'promptfoo-execution',
      label: '4️⃣ Exécution',
      icon: <Play size={18} />,
      content: <PromptfooTestExecution />,
      section: 'Mode Expert',
      stepNumber: 4,
      description: 'Lancer Promptfoo et suivre la progression'
    },
    // {
    //   id: 'test-results-expert',
    //   label: '5️⃣ Résultats',
    //   icon: <BarChart3 size={18} />,
    //   content: <PromptfooResultsView />,
    //   section: 'Mode Expert',
    //   stepNumber: 5,
    //   description: 'Vulnérabilités détectées, graphiques et statistiques'
    // },
  ]
};

// ============================================
// SECTION 1C : PLATEFORME UNIFIÉE (Promptfoo + Garak + Strix)
// ============================================
const unifiedPlatformSection: NavSection = {
  id: 'unified-platform',
  label: '🛡️ Plateforme Unifiée (3 Outils)',
  icon: <Layers size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'unified-security-hub',
      label: 'Centre de Sécurité Unifié',
      icon: <Activity size={18} />,
      content: <UnifiedSecurityHub />,
      section: 'Plateforme Unifiée',
      description: 'Dashboard central - Vue d\'ensemble Promptfoo, Garak & Strix'
    },
    {
      id: 'garak-scanner',
      label: 'Scanner Garak (LLM)',
      icon: <AlertTriangle size={18} />,
      content: <GarakScannerUI />,
      section: 'Plateforme Unifiée',
      description: 'Scanner de vulnérabilités LLM (OWASP Top 10)'
    },
    {
      id: 'strix-agent',
      label: 'Agent Strix (Agentic AI)',
      icon: <Zap size={18} />,
      content: <StrixDashboard />,
      section: 'Plateforme Unifiée',
      description: 'Tests automatisés avec agent autonome'
    },
  ]
};

// ============================================
// SECTION 2 : GOUVERNANCE IA
// ============================================
const governanceSection: NavSection = {
  id: 'governance',
  label: 'Gouvernance IA',
  icon: <Shield size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'use-cases',
      label: 'Cas d\'Usage',
      icon: <FileSpreadsheet size={18} />,
      content: <UseCasesView />,
      section: 'Gouvernance IA',
      description: 'Gestion des cas d\'usage IA'
    },
    {
      id: 'threat-profile',
      label: 'Profil de Menace',
      icon: <ShieldAlert size={18} />,
      content: <ThreatProfileView />,
      section: 'Gouvernance IA',
      description: 'Identification des menaces'
    },
    {
      id: 'attack-surface',
      label: 'Surface d\'Attaque',
      icon: <ClipboardCheck size={18} />,
      content: <AttackSurfaceAnalysisView />,
      section: 'Gouvernance IA',
      description: 'Analyse des vecteurs d\'attaque'
    },
    {
      id: 'incident-readiness',
      label: 'Préparation Incidents',
      icon: <HeartPulse size={18} />,
      content: <IncidentReadinessView />,
      section: 'Gouvernance IA',
      description: 'Plan de réponse aux incidents'
    },
    {
      id: 'ai-policy',
      label: 'Politique IA (SIA)',
      icon: <BookMarked size={18} />,
      content: <AIPolicyView />,
      section: 'Gouvernance IA',
      description: '22 règles CLUSIF'
    },
  ]
};

// ============================================
// SECTION 3 : RED TEAM & SÉCURITÉ
// ============================================
const redTeamSection: NavSection = {
  id: 'red-team',
  label: 'Red Team & Audit',
  icon: <SearchCheck size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'red-team-review',
      label: 'Revue de Sécurité',
      icon: <SearchCheck size={18} />,
      content: <RedTeamSecurityView />,
      section: 'Red Team',
      description: 'Audit de sécurité complet'
    },
    {
      id: 'red-team-results',
      label: 'Résultats d\'Audit',
      icon: <ClipboardPen size={18} />,
      content: <RedTeamResultsView />,
      section: 'Red Team',
      description: 'Rapport d\'audit détaillé'
    },
  ]
};

// ============================================
// SECTION 4 : RÉFÉRENTIELS & DOCUMENTATION
// ============================================
const referencesSection: NavSection = {
  id: 'references',
  label: 'Référentiels',
  icon: <BookOpenCheck size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'compass-use-cases',
      label: 'OWASP COMPASS',
      icon: <Compass size={18} />,
      content: <CompassUseCasesView />,
      section: 'Référentiels',
      description: '31 scénarios de menaces'
    },
    {
      id: 'ai-risk-repository',
      label: 'Base de Risques IA',
      icon: <BookCopy size={18} />,
      content: <AIRiskRepositoryView />,
      section: 'Référentiels',
      description: 'Référentiel centralisé'
    },
    {
      id: 'known-vulnerabilities',
      label: 'Vulnérabilités Connues',
      icon: <ShieldQuestion size={18} />,
      content: <KnownVulnerabilitiesView />,
      section: 'Référentiels',
      description: 'CVE et OWASP LLM/Agentic AI'
    },
    {
      id: 'known-incidents',
      label: 'Incidents Connus',
      icon: <FileWarning size={18} />,
      content: <KnownIncidentsView />,
      section: 'Référentiels',
      description: 'Base d\'incidents réels'
    },
    {
      id: 'defenses-mitigations',
      label: 'Défenses & Mitigations',
      icon: <BookLock size={18} />,
      content: <DefensesMitigationsView />,
      section: 'Référentiels',
      description: 'Catalogue de contre-mesures'
    },
    {
      id: 'third-party-questions',
      label: 'Questionnaire Tiers',
      icon: <ClipboardList size={18} />,
      content: <AIThirdPartyQuestionsView />,
      section: 'Référentiels',
      description: 'Évaluation fournisseurs IA'
    },
    {
      id: 'wiki-red-teamer',
      label: 'Wiki Red Teamer',
      icon: <BookOpen size={18} />,
      content: <WikiRedTeamerView />,
      section: 'Référentiels',
      description: 'Base de connaissances'
    },
  ]
};

// ============================================
// SECTION 5 : PARAMÈTRES
// ============================================
const settingsSection: NavSection = {
  id: 'settings-section',
  label: 'Paramètres',
  icon: <SlidersHorizontal size={20} />,
  defaultOpen: false,
  items: [
    {
      id: 'settings',
      label: 'Configuration',
      icon: <SlidersHorizontal size={18} />,
      content: <SettingsView />,
      section: 'Paramètres',
      description: 'Réglages de l\'application'
    },
    {
      id: 'llm-config',
      label: 'Configuration LLM',
      icon: <Sparkles size={18} />,
      content: <LLMConfigView />,
      section: 'Paramètres',
      description: 'Configuration des modèles de langage pour Strix, Garak, Promptfoo et le chatbot'
    },
  ]
};

// ============================================
// TOUTES LES SECTIONS (ordre d'affichage)
// ============================================
export const navSections: NavSection[] = [
  applicationsSection,
  beginnerSection,
  expertSection,
  unifiedPlatformSection,  // ✨ NOUVEAU: Plateforme Unifiée (Promptfoo + Garak + Strix)
  governanceSection,
  redTeamSection,
  referencesSection,
  settingsSection
];

// ============================================
// LISTE PLATE POUR COMPATIBILITÉ
// ============================================
export const navItems: NavItem[] = navSections.flatMap(section => section.items);

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('test-config');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const activeItem = navItems.find(item => item.id === activeNav);
  const activeContent = activeItem?.content;

  // Construire les breadcrumbs
  const breadcrumbs = activeItem ? [
    { label: 'Accueil', onClick: () => setActiveNav('test-config') },
    { label: activeItem.section || 'Navigation' },
    { label: activeItem.label }
  ] : [];

  return (
    <LanguageProvider>
      <NavigationProvider activeNav={activeNav} setActiveNav={setActiveNav}>
        <ApplicationProfileProvider>
          <AIPolicyProvider>
            <AIRiskRepositoryProvider>
              <CompassProvider>
                <WikiProvider>
                  <DatasetProvider>
                    <TestRunProvider>
                      <SettingsProvider>
                        <LLMConfigProvider>
                          <UseCaseProvider>
                            <ThreatProfileProvider>
                              <AttackSurfaceProvider>
                                <KnownVulnerabilitiesProvider>
                                  <KnownIncidentsProvider>
                                    <IncidentReadinessProvider>
                                      <RedTeamProvider>
                                        <RedTeamResultsProvider>
                                          <DefensesMitigationsProvider>
                                            <AIThirdPartyQuestionsProvider>
                                              <div className="flex flex-col h-screen bg-gray-900 font-sans text-gray-200">
                                                <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 py-2">
                                                  <h1 className="text-sm font-bold tracking-widest uppercase">AI RISK MANAGER</h1>
                                                  <div className="flex items-center space-x-4 text-gray-400">
                                                    <span className="text-xs">Device</span>
                                                    <RefreshCw size={16} className="cursor-pointer hover:text-white"/>
                                                    <MoreHorizontal size={16} className="cursor-pointer hover:text-white"/>
                                                  </div>
                                                </header>
                                                <div className="flex flex-1 overflow-hidden">
                                                  <Sidebar
                                                    activeNav={activeNav}
                                                    setActiveNav={setActiveNav}
                                                    navItems={navItems}
                                                    navSections={navSections}
                                                  />
                                                  <main className="flex-1 flex flex-col overflow-hidden">
                                                    {/* Breadcrumbs */}
                                                    <NavigationBreadcrumbs items={breadcrumbs} />

                                                    <div className="p-8 pb-0 flex-shrink-0">
                                                      <header className="flex items-center justify-between mb-8">
                                                        <div>
                                                          {/* Afficher l'intitulé uniquement pour les sections guardrails */}
                                                          {activeItem?.section && ['Mode Débutant', 'Mode Expert', 'Plateforme Unifiée'].includes(activeItem.section) && (
                                                            <h1 className="text-3xl font-bold text-white flex items-center">
                                                              <ShieldCheck className="mr-3 text-cyan-500" size={32} />
                                                              Simulateur de Test Guardrails LLM
                                                            </h1>
                                                          )}
                                                          {activeItem?.description && (
                                                            <p className="text-sm text-gray-400 mt-2 ml-11">
                                                              {activeItem.description}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </header>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto p-8 pt-0">
                                                      <Suspense fallback={
                                                        <div className="flex items-center justify-center h-full">
                                                          <div className="text-center">
                                                            <RefreshCw className="animate-spin mx-auto mb-4 text-cyan-500" size={32} />
                                                            <p className="text-gray-400">Chargement...</p>
                                                          </div>
                                                        </div>
                                                      }>
                                                        {activeContent}
                                                      </Suspense>
                                                    </div>
                                                    <div className="px-8 pb-8 pt-0 mt-auto flex-shrink-0">
                                                      <footer className="mt-8 pt-8 border-t border-gray-700 text-center text-xs text-gray-500">
                                                        <p>
                                                          Certains contenus de cette application sont basés sur le <a href="https://genai.owasp.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Projet OWASP Top 10 pour les Applications de Grands Modèles de Langage</a> et le projet <a href="https://owasp.org/www-project-agentic-ai-top-15/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">OWASP Agentic AI Top 15</a>, distribués sous licence <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">CC BY-SA 4.0</a>.
                                                        </p>
                                                        <p className="mt-2">
                                                          Copyright © 2025 Powered by Globacom3000 / Abbas BENTERKI. Tous droits réservés.
                                                        </p>
                                                      </footer>
                                                    </div>
                                                  </main>
                                                </div>
                                              </div>
                                              <Suspense fallback={null}>
                                                {!isChatbotOpen && <ChatbotFab onClick={() => setIsChatbotOpen(true)} />}
                                                {isChatbotOpen && <ChatbotModern onClose={() => setIsChatbotOpen(false)} />}
                                              </Suspense>
                                            </AIThirdPartyQuestionsProvider>
                                          </DefensesMitigationsProvider>
                                        </RedTeamResultsProvider>
                                      </RedTeamProvider>
                                    </IncidentReadinessProvider>
                                  </KnownIncidentsProvider>
                                </KnownVulnerabilitiesProvider>
                              </AttackSurfaceProvider>
                            </ThreatProfileProvider>
                          </UseCaseProvider>
                        </LLMConfigProvider>
                      </SettingsProvider>
                  </TestRunProvider>
                </DatasetProvider>
              </WikiProvider>
            </CompassProvider>
          </AIRiskRepositoryProvider>
        </AIPolicyProvider>
        </ApplicationProfileProvider>
      </NavigationProvider>
    </LanguageProvider>
  );
};

export default App;
