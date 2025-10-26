import React, { useState } from 'react';
import Sidebar, { NavItem } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import DatasetManager from './components/DatasetManager';
import AdvancedScenarios from './components/AdvancedScenarios';
import UseCasesView from './components/UseCasesView';
import ThreatProfileView from './components/ThreatProfileView';
import AttackSurfaceAnalysisView from './components/AttackSurfaceAnalysisView';
import SettingsView from './components/SettingsView';
import KnownVulnerabilitiesView from './components/KnownVulnerabilitiesView';
import KnownIncidentsView from './components/KnownIncidentsView';
import IncidentReadinessView from './components/IncidentReadinessView';
import RedTeamSecurityView from './components/RedTeamSecurityView';
import RedTeamResultsView from './components/RedTeamResultsView';
import DefensesMitigationsView from './components/DefensesMitigationsView';
import AIThirdPartyQuestionsView from './components/AIThirdPartyQuestionsView';
import WikiRedTeamerView from './components/WikiRedTeamerView';
import AIPolicyView from './components/AIPolicyView';
import AIRiskRepositoryView from './components/AIRiskRepositoryView';
import Chatbot from './components/chatbot/Chatbot';
import ChatbotFab from './components/chatbot/ChatbotFab';
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
import { ShieldCheck, LayoutDashboard, BarChart3, Database, FlaskConical, FileSpreadsheet, ShieldAlert, ClipboardCheck, SlidersHorizontal, ShieldQuestion, FileWarning, HeartPulse, SearchCheck, ClipboardPen, BookLock, ClipboardList, BookOpen, BookMarked, Lock, RefreshCw, MoreHorizontal, BookCopy } from 'lucide-react';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, content: <Dashboard /> },
  { id: 'analytics', label: 'Analyses', icon: <BarChart3 size={20} />, content: <Analytics /> },
  { id: 'datasets', label: 'Jeux de données', icon: <Database size={20} />, content: <DatasetManager /> },
  { id: 'use-cases', label: 'Cas d\'Usage', icon: <FileSpreadsheet size={20} />, content: <UseCasesView /> },
  { id: 'threat-profile', label: 'Profil de Menace', icon: <ShieldAlert size={20} />, content: <ThreatProfileView /> },
  { id: 'attack-surface', label: 'Analyse de Surface d\'Attaque', icon: <ClipboardCheck size={20} />, content: <AttackSurfaceAnalysisView /> },
  { id: 'known-vulnerabilities', label: 'Vuln IA Connues', icon: <ShieldQuestion size={20} />, content: <KnownVulnerabilitiesView /> },
  { id: 'known-incidents', label: 'Incidents IA Connus', icon: <FileWarning size={20} />, content: <KnownIncidentsView /> },
  { id: 'incident-readiness', label: 'Préparation Incidents IA', icon: <HeartPulse size={20} />, content: <IncidentReadinessView /> },
  { id: 'red-team-review', label: 'Revue Sécurité Red Team', icon: <SearchCheck size={20} />, content: <RedTeamSecurityView /> },
  { id: 'red-team-results', label: 'Résultats Red Team', icon: <ClipboardPen size={20} />, content: <RedTeamResultsView /> },
  { id: 'defenses-mitigations', label: 'Référence: Défenses', icon: <BookLock size={20} />, content: <DefensesMitigationsView /> },
  { id: 'third-party-questions', label: 'Référence: Tiers IA', icon: <ClipboardList size={20} />, content: <AIThirdPartyQuestionsView /> },
  { id: 'wiki-red-teamer', label: 'Wiki Red Teamer', icon: <BookOpen size={20} />, content: <WikiRedTeamerView /> },
  { id: 'ai-policy', label: 'Politique IA', icon: <BookMarked size={20} />, content: <AIPolicyView /> },
  { id: 'ai-risk-repository', label: 'Référentiel Risques IA', icon: <BookCopy size={20} />, content: <AIRiskRepositoryView /> },
  { id: 'advanced', label: 'Scénarios avancés', icon: <FlaskConical size={20} />, content: <AdvancedScenarios /> },
  { id: 'settings', label: 'Paramètres', icon: <SlidersHorizontal size={20} />, content: <SettingsView /> },
];

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const activeContent = navItems.find(item => item.id === activeNav)?.content;

  return (
    <AIPolicyProvider>
    <AIRiskRepositoryProvider>
      <WikiProvider>
        <DatasetProvider>
          <TestRunProvider>
            <SettingsProvider>
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
                                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} navItems={navItems} />
                                        <main className="flex-1 flex flex-col overflow-hidden">
                                            <div className="p-8 pb-0 flex-shrink-0">
                                                <header className="flex items-center justify-between mb-8">
                                                    <h1 className="text-3xl font-bold text-white flex items-center">
                                                    <ShieldCheck className="mr-3 text-cyan-500" size={32} />
                                                    Simulateur de Test Guardrails LLM
                                                    </h1>
                                                </header>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-8 pt-0">
                                                {activeContent}
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
                                  {!isChatbotOpen && <ChatbotFab onClick={() => setIsChatbotOpen(true)} />}
                                  {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
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
            </SettingsProvider>
          </TestRunProvider>
        </DatasetProvider>
      </WikiProvider>
    </AIRiskRepositoryProvider>
    </AIPolicyProvider>
  );
};

export default App;