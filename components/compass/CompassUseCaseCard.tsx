import React from 'react';
import { CompassUseCase, RiskLevel } from '../../types';
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
  Shield,
  ArrowRight
} from 'lucide-react';
import Card from '../ui/Card';

interface CompassUseCaseCardProps {
  useCase: CompassUseCase;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const CompassUseCaseCard: React.FC<CompassUseCaseCardProps> = ({
  useCase,
  viewMode,
  onClick
}) => {
  const { language, t } = useCompass();

  // Risk level styling
  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return <Flame className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'moderate':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'text-red-400 bg-red-900/30 border-red-700';
      case 'high':
        return 'text-orange-400 bg-orange-900/30 border-orange-700';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      case 'low':
        return 'text-blue-400 bg-blue-900/30 border-blue-700';
    }
  };

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'moderate':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    const labels = {
      critical: { fr: 'Critique', en: 'Critical' },
      high: { fr: 'Élevé', en: 'High' },
      moderate: { fr: 'Modéré', en: 'Moderate' },
      low: { fr: 'Faible', en: 'Low' }
    };
    return labels[level][language];
  };

  // OODA phase icon
  const getOODAIcon = () => {
    switch (useCase.oodaPhase) {
      case 'observe':
        return <Eye className="w-4 h-4" />;
      case 'orient':
        return <CompassIcon className="w-4 h-4" />;
      case 'decide':
        return <CheckSquare className="w-4 h-4" />;
      case 'act':
        return <Map className="w-4 h-4" />;
    }
  };

  const getOODALabel = () => {
    const labels = {
      observe: { fr: 'Observer', en: 'Observe' },
      orient: { fr: 'Orienter', en: 'Orient' },
      decide: { fr: 'Décider', en: 'Decide' },
      act: { fr: 'Agir', en: 'Act' }
    };
    return labels[useCase.oodaPhase][language];
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="p-4 cursor-pointer hover:border-cyan-600 transition-all hover:shadow-lg hover:shadow-cyan-900/20 group"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          {/* Risk Badge */}
          <div className={`flex-shrink-0 p-3 rounded-lg border ${getRiskColor(useCase.riskLevel)}`}>
            {getRiskIcon(useCase.riskLevel)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors">
                {t(useCase.title)}
              </h3>

              {/* Risk Score */}
              <div
                className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                title={language === 'fr' ? 'Cliquez pour voir les détails' : 'Click to view details'}
              >
                <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskBadgeColor(useCase.riskLevel)} text-white`}>
                  {getRiskLabel(useCase.riskLevel)}
                </span>
                <span className="text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  {useCase.riskScore}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{t(useCase.description)}</p>

            <div className="flex items-center gap-4 text-sm">
              {/* OODA Phase */}
              <div className="flex items-center gap-1 text-cyan-400">
                {getOODAIcon()}
                <span>{getOODALabel()}</span>
              </div>

              {/* Impact & Likelihood */}
              <div className="flex items-center gap-3 text-gray-500">
                <span>
                  {language === 'fr' ? 'Impact:' : 'Impact:'}{' '}
                  <span className="text-orange-400 font-semibold">{useCase.impact}/5</span>
                </span>
                <span>
                  {language === 'fr' ? 'Probabilité:' : 'Likelihood:'}{' '}
                  <span className="text-orange-400 font-semibold">{useCase.likelihood}/5</span>
                </span>
              </div>

              {/* MITRE ATT&CK */}
              {useCase.attackMapping.mitre && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span className="font-mono text-xs">{useCase.attackMapping.mitre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-gray-600 group-hover:text-cyan-400 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className="p-6 cursor-pointer hover:border-cyan-600 transition-all hover:shadow-lg hover:shadow-cyan-900/20 group h-full flex flex-col"
      onClick={onClick}
    >
      {/* Header with Risk Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2 rounded-lg border cursor-pointer hover:scale-110 transition-transform ${getRiskColor(useCase.riskLevel)}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          title={language === 'fr' ? 'Cliquez pour voir les détails' : 'Click to view details'}
        >
          {getRiskIcon(useCase.riskLevel)}
        </div>

        <div
          className="flex flex-col items-end gap-1 cursor-pointer hover:scale-105 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          title={language === 'fr' ? 'Cliquez pour voir les détails' : 'Click to view details'}
        >
          <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskBadgeColor(useCase.riskLevel)} text-white`}>
            {getRiskLabel(useCase.riskLevel)}
          </span>
          <span className="text-3xl font-bold text-orange-400 hover:text-orange-300 transition-colors">
            {useCase.riskScore}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-100 mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
        {t(useCase.title)}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">{t(useCase.description)}</p>

      {/* Footer */}
      <div className="space-y-3 pt-4 border-t border-gray-700">
        {/* OODA Phase */}
        <div className="flex items-center gap-2 text-sm text-cyan-400">
          {getOODAIcon()}
          <span>{getOODALabel()}</span>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {language === 'fr' ? 'Impact:' : 'Impact:'}{' '}
            <span className="text-orange-400 font-semibold">{useCase.impact}/5</span>
          </span>
          <span>
            {language === 'fr' ? 'Prob:' : 'Likelihood:'}{' '}
            <span className="text-orange-400 font-semibold">{useCase.likelihood}/5</span>
          </span>
        </div>

        {/* MITRE ATT&CK */}
        {useCase.attackMapping.mitre && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span className="font-mono">{useCase.attackMapping.mitre}</span>
          </div>
        )}
      </div>

      {/* Action Button - Always Visible */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span className="text-sm">{language === 'fr' ? 'Voir détails' : 'View details'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

export default CompassUseCaseCard;
