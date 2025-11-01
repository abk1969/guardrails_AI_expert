
import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { CollapsibleNavSection } from './navigation/CollapsibleNavSection';
import { NavSection } from '../App';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  stepNumber?: number;
  description?: string;
  badge?: string;
}

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  navItems: NavItem[];
  navSections?: NavSection[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeNav, setActiveNav, navItems, navSections }) => {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0">
        <ShieldCheck className="text-cyan-500" size={28} />
        <span className="ml-2 text-xl font-bold text-white">AI RISK MANAGER</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-custom">
        {navSections ? (
          // Mode sections collapsibles (nouvelle UI)
          navSections.map((section) => (
            <CollapsibleNavSection
              key={section.id}
              title={section.label}
              icon={section.icon}
              badge={section.badge}
              defaultOpen={section.defaultOpen}
              items={section.items.map((item) => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                badge: item.badge,
                description: item.description,
                stepNumber: item.stepNumber,
                isActive: activeNav === item.id,
                onClick: () => setActiveNav(item.id),
              }))}
            />
          ))
        ) : (
          // Mode liste plate (ancienne UI - compatibilité)
          navItems.map((item) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveNav(item.id);
              }}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-200 ${
                activeNav === item.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="ml-4 font-medium">{item.label}</span>
            </a>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700 flex-shrink-0">
        <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg">
          <LogOut size={20} />
          <span className="ml-4 font-medium">Déconnexion</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
