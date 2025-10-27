import React from 'react';
import Card from '../ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { Filter, X } from 'lucide-react';

export enum LifecyclePhase {
  DESIGN = 'design',
  DEVELOPMENT = 'development',
  DEPLOYMENT = 'deployment',
  OPERATION = 'operation',
  ALL = 'all'
}

export enum RiskFunction {
  GOVERN = 'govern',
  MAP = 'map',
  MEASURE = 'measure',
  MANAGE = 'manage',
  ALL = 'all'
}

interface PolicyFiltersProps {
  selectedPhase: LifecyclePhase;
  selectedFunction: RiskFunction;
  onPhaseChange: (phase: LifecyclePhase) => void;
  onFunctionChange: (func: RiskFunction) => void;
  onReset: () => void;
}

export const PolicyFilters: React.FC<PolicyFiltersProps> = ({
  selectedPhase,
  selectedFunction,
  onPhaseChange,
  onFunctionChange,
  onReset
}) => {
  const { t } = useLanguage();

  const phases = [
    { value: LifecyclePhase.ALL, label: 'Toutes les phases', labelEn: 'All Phases' },
    { value: LifecyclePhase.DESIGN, label: t('policy.design'), icon: '🎨' },
    { value: LifecyclePhase.DEVELOPMENT, label: t('policy.development'), icon: '⚙️' },
    { value: LifecyclePhase.DEPLOYMENT, label: t('policy.deployment'), icon: '🚀' },
    { value: LifecyclePhase.OPERATION, label: t('policy.operation'), icon: '🔧' }
  ];

  const functions = [
    { value: RiskFunction.ALL, label: 'Toutes les fonctions', labelEn: 'All Functions' },
    { value: RiskFunction.GOVERN, label: t('policy.govern'), icon: '👔' },
    { value: RiskFunction.MAP, label: t('policy.map'), icon: '🗺️' },
    { value: RiskFunction.MEASURE, label: t('policy.measure'), icon: '📊' },
    { value: RiskFunction.MANAGE, label: t('policy.manage'), icon: '🎯' }
  ];

  const hasActiveFilters = selectedPhase !== LifecyclePhase.ALL || selectedFunction !== RiskFunction.ALL;

  return (
    <Card className="bg-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-cyan-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <X size={16} />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Lifecycle Phase Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t('policy.lifecycle_phase')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {phases.map(phase => (
              <button
                key={phase.value}
                onClick={() => onPhaseChange(phase.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  flex items-center justify-center gap-2
                  ${selectedPhase === phase.value
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                  }
                `}
              >
                {phase.icon && <span>{phase.icon}</span>}
                <span className="truncate">{phase.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Function Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t('policy.risk_function')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {functions.map(func => (
              <button
                key={func.value}
                onClick={() => onFunctionChange(func.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  flex items-center justify-center gap-2
                  ${selectedFunction === func.value
                    ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50 ring-2 ring-purple-500/30'
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                  }
                `}
              >
                {func.icon && <span>{func.icon}</span>}
                <span className="truncate">{func.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Filtres actifs :</p>
            <div className="flex flex-wrap gap-2">
              {selectedPhase !== LifecyclePhase.ALL && (
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                  Phase: {phases.find(p => p.value === selectedPhase)?.label}
                </span>
              )}
              {selectedFunction !== RiskFunction.ALL && (
                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/30">
                  Fonction: {functions.find(f => f.value === selectedFunction)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
