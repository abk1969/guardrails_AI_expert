import React from 'react';
import { useCompass } from '../../contexts/CompassContext';
import {
  Flame,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Compass as CompassIcon,
  CheckSquare,
  Map,
  Target
} from 'lucide-react';
import Card from '../ui/Card';
import { RiskLevel, OODAPhase } from '../../types';

const CompassFilters: React.FC = () => {
  const { filters, setFilters, language } = useCompass();

  const riskLevels: Array<{ value: RiskLevel | 'all'; label: { fr: string; en: string }; icon: React.ReactNode; color: string }> = [
    {
      value: 'all',
      label: { fr: 'Tous niveaux', en: 'All levels' },
      icon: <Target className="w-4 h-4" />,
      color: 'text-gray-400 border-gray-700 hover:border-gray-600'
    },
    {
      value: 'critical',
      label: { fr: 'Critique', en: 'Critical' },
      icon: <Flame className="w-4 h-4" />,
      color: 'text-red-400 border-red-700 hover:border-red-600'
    },
    {
      value: 'high',
      label: { fr: 'Élevé', en: 'High' },
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-orange-400 border-orange-700 hover:border-orange-600'
    },
    {
      value: 'moderate',
      label: { fr: 'Modéré', en: 'Moderate' },
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-yellow-400 border-yellow-700 hover:border-yellow-600'
    },
    {
      value: 'low',
      label: { fr: 'Faible', en: 'Low' },
      icon: <Info className="w-4 h-4" />,
      color: 'text-blue-400 border-blue-700 hover:border-blue-600'
    }
  ];

  const oodaPhases: Array<{ value: OODAPhase | 'all'; label: { fr: string; en: string }; icon: React.ReactNode }> = [
    {
      value: 'all',
      label: { fr: 'Toutes phases', en: 'All phases' },
      icon: <Target className="w-4 h-4" />
    },
    {
      value: 'observe',
      label: { fr: 'Observer', en: 'Observe' },
      icon: <Eye className="w-4 h-4" />
    },
    {
      value: 'orient',
      label: { fr: 'Orienter', en: 'Orient' },
      icon: <CompassIcon className="w-4 h-4" />
    },
    {
      value: 'decide',
      label: { fr: 'Décider', en: 'Decide' },
      icon: <CheckSquare className="w-4 h-4" />
    },
    {
      value: 'act',
      label: { fr: 'Agir', en: 'Act' },
      icon: <Map className="w-4 h-4" />
    }
  ];

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Level Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            {language === 'fr' ? 'Niveau de risque' : 'Risk Level'}
          </label>
          <div className="space-y-2">
            {riskLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setFilters({ ...filters, riskLevel: level.value })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  filters.riskLevel === level.value
                    ? `${level.color} bg-opacity-20`
                    : 'border-gray-700 text-gray-400 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <span className={filters.riskLevel === level.value ? '' : 'opacity-50'}>
                  {level.icon}
                </span>
                <span className="flex-1 text-left font-medium">{level.label[language]}</span>
                {filters.riskLevel === level.value && (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* OODA Phase Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            {language === 'fr' ? 'Phase OODA' : 'OODA Phase'}
          </label>
          <div className="space-y-2">
            {oodaPhases.map((phase) => (
              <button
                key={phase.value}
                onClick={() => setFilters({ ...filters, oodaPhase: phase.value })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  filters.oodaPhase === phase.value
                    ? 'border-cyan-600 text-cyan-400 bg-cyan-900/20'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <span className={filters.oodaPhase === phase.value ? '' : 'opacity-50'}>
                  {phase.icon}
                </span>
                <span className="flex-1 text-left font-medium">{phase.label[language]}</span>
                {filters.oodaPhase === phase.value && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompassFilters;
