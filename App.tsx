import React, { useState } from 'react';
import Sidebar, { NavItem } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import DatasetManager from './components/DatasetManager';
import AdvancedScenarios from './components/AdvancedScenarios'; // Import new component
import { TestRunProvider } from './contexts/TestRunContext';
import { DatasetProvider } from './contexts/DatasetContext';
import { ShieldCheck, LayoutDashboard, BarChart3, Database, FlaskConical } from 'lucide-react'; // Import new icon

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, content: <Dashboard /> },
  { id: 'analytics', label: 'Analyses', icon: <BarChart3 size={20} />, content: <Analytics /> },
  { id: 'datasets', label: 'Jeux de données', icon: <Database size={20} />, content: <DatasetManager /> },
  { id: 'advanced', label: 'Scénarios avancés', icon: <FlaskConical size={20} />, content: <AdvancedScenarios /> },
];

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  const activeContent = navItems.find(item => item.id === activeNav)?.content;

  return (
    <DatasetProvider>
      <TestRunProvider>
        <div className="flex h-screen bg-gray-900 font-sans">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} navItems={navItems} />
          <main className="flex-1 overflow-y-auto p-8">
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <ShieldCheck className="mr-3 text-cyan-500" size={32} />
                Simulateur de Test Guardrails LLM
              </h1>
            </header>
            {activeContent}
          </main>
        </div>
      </TestRunProvider>
    </DatasetProvider>
  );
};

export default App;