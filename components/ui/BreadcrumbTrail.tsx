import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { NavigationHistoryItem } from '../../contexts/NavigationContext';

interface BreadcrumbTrailProps {
  history: NavigationHistoryItem[];
  onNavigateToHistoryItem: (index: number) => void;
  onClearHistory?: () => void;
}

/**
 * BreadcrumbTrail Component
 *
 * Displays a navigation history trail showing the path the user has taken through modules.
 * Allows clicking on any item in the history to navigate back to that point.
 *
 * Usage:
 * ```tsx
 * <BreadcrumbTrail
 *   history={navigationHistory}
 *   onNavigateToHistoryItem={navigateToHistoryItem}
 *   onClearHistory={clearHistory}
 * />
 * ```
 */
export const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  history,
  onNavigateToHistoryItem,
  onClearHistory
}) => {
  if (history.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <button
        onClick={() => onClearHistory?.()}
        className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors"
        title="Retour à l'accueil"
      >
        <Home size={14} />
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-400 overflow-x-auto max-w-full">
        {history.map((item, index) => (
          <React.Fragment key={`${item.itemId}-${item.timestamp}`}>
            <ChevronRight size={14} className="flex-shrink-0 text-gray-600" />
            <button
              onClick={() => onNavigateToHistoryItem(index)}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${
                index === history.length - 1
                  ? 'text-cyan-400 font-semibold'
                  : 'text-gray-400'
              }`}
              title={`${item.moduleName}: ${item.itemTitle}`}
            >
              {item.itemTitle}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreadcrumbTrail;
