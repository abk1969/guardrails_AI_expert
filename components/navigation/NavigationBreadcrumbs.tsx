import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface NavigationBreadcrumbsProps {
  items: BreadcrumbItem[];
  currentSection?: string;
}

/**
 * Composant de fil d'Ariane (breadcrumbs) pour la navigation
 * Affiche le chemin actuel et permet de remonter dans la hiérarchie
 */
export const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({
  items,
  currentSection
}) => {
  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700 text-sm">
      {/* Icône Home */}
      <Home size={14} className="text-gray-500" />

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {/* Séparateur */}
            {index > 0 && (
              <ChevronRight size={14} className="text-gray-600" />
            )}

            {/* Item */}
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? 'text-cyan-400 font-medium' : 'text-gray-500'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}

      {/* Section actuelle si spécifiée */}
      {currentSection && (
        <>
          <ChevronRight size={14} className="text-gray-600" />
          <span className="text-gray-300">{currentSection}</span>
        </>
      )}
    </div>
  );
};

export default NavigationBreadcrumbs;
