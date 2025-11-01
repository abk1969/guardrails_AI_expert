import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
  stepNumber?: number;
  isActive?: boolean;
  onClick: () => void;
}

interface CollapsibleNavSectionProps {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
  badge?: string;
}

/**
 * Composant de section de navigation collapsible
 * Permet de regrouper logiquement les éléments de navigation
 */
export const CollapsibleNavSection: React.FC<CollapsibleNavSectionProps> = ({
  title,
  icon,
  items,
  defaultOpen = true,
  badge
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="nav-section mb-2">
      {/* Header de la section */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
            {icon}
          </span>
          <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
            {title}
          </span>
          {badge && (
            <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>

      {/* Items de la section */}
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                w-full flex items-center gap-3 p-2 pl-4 rounded-lg transition-all
                ${item.isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent'
                }
              `}
            >
              {/* Numéro d'étape si présent */}
              {item.stepNumber !== undefined && (
                <span className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                  ${item.isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {item.stepNumber}
                </span>
              )}

              {/* Icône */}
              {!item.stepNumber && (
                <span className={item.isActive ? 'text-cyan-400' : 'text-gray-500'}>
                  {item.icon}
                </span>
              )}

              {/* Label et description */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      px-1.5 py-0.5 text-xs rounded
                      ${item.isActive
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>

              {/* Indicateur actif */}
              {item.isActive && (
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleNavSection;
