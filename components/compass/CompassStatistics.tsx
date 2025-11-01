import React from 'react';
import { useCompass } from '../../contexts/CompassContext';
import { Flame, AlertTriangle, AlertCircle, Info, TrendingUp, Target } from 'lucide-react';
import Card from '../ui/Card';

const CompassStatistics: React.FC = () => {
  const { statistics, language } = useCompass();

  const stats = [
    {
      label: { fr: 'Critique', en: 'Critical' },
      value: statistics.byRiskLevel.critical,
      icon: <Flame className="w-6 h-6" />,
      color: 'text-red-400 bg-red-900/20 border-red-700'
    },
    {
      label: { fr: 'Élevé', en: 'High' },
      value: statistics.byRiskLevel.high,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-orange-400 bg-orange-900/20 border-orange-700'
    },
    {
      label: { fr: 'Modéré', en: 'Moderate' },
      value: statistics.byRiskLevel.moderate,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
    },
    {
      label: { fr: 'Faible', en: 'Low' },
      value: statistics.byRiskLevel.low,
      icon: <Info className="w-6 h-6" />,
      color: 'text-blue-400 bg-blue-900/20 border-blue-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {/* Total */}
      <Card className="p-4 border-cyan-700 bg-cyan-900/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-cyan-900/30 text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
        </div>
        <div className="text-3xl font-bold text-cyan-400 mb-1">{statistics.totalUseCases}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          {language === 'fr' ? 'Total' : 'Total'}
        </div>
      </Card>

      {/* Risk Levels */}
      {stats.map((stat, index) => (
        <Card key={index} className={`p-4 border ${stat.color}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stat.value}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label[language]}</div>
        </Card>
      ))}

      {/* Average Score */}
      <Card className="p-4 border-orange-700 bg-orange-900/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-orange-900/30 text-orange-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="text-3xl font-bold text-orange-400 mb-1">{statistics.avgRiskScore}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          {language === 'fr' ? 'Score moyen' : 'Avg Score'}
        </div>
      </Card>
    </div>
  );
};

export default CompassStatistics;
