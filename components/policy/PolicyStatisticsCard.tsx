import React, { useMemo } from 'react';
import Card from '../ui/Card';
import { AIPolicyChapter, AIPolicyRuleStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckCircle2, Clock, XCircle, TrendingUp, FileCheck } from 'lucide-react';

interface PolicyStatisticsCardProps {
  policyData: AIPolicyChapter[];
}

interface RuleStats {
  total: number;
  implemented: number;
  inProgress: number;
  notImplemented: number;
  complianceRate: number;
}

export const PolicyStatisticsCard: React.FC<PolicyStatisticsCardProps> = ({ policyData }) => {
  const { t } = useLanguage();

  const stats: RuleStats = useMemo(() => {
    let total = 0;
    let implemented = 0;
    let inProgress = 0;
    let notImplemented = 0;

    policyData.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.content.forEach(item => {
          if (item.type === 'rule') {
            total++;
            switch (item.rule.status) {
              case AIPolicyRuleStatus.IMPLEMENTED:
                implemented++;
                break;
              case AIPolicyRuleStatus.IN_PROGRESS:
                inProgress++;
                break;
              case AIPolicyRuleStatus.NOT_IMPLEMENTED:
                notImplemented++;
                break;
            }
          }
        });
      });
    });

    const complianceRate = total > 0 ? Math.round((implemented / total) * 100) : 0;

    return {
      total,
      implemented,
      inProgress,
      notImplemented,
      complianceRate
    };
  }, [policyData]);

  const getComplianceColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    if (rate >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComplianceBackground = (rate: number): string => {
    if (rate >= 80) return 'bg-green-500/10 border-green-500/30';
    if (rate >= 50) return 'bg-yellow-500/10 border-yellow-500/30';
    if (rate >= 25) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-cyan-500/20">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCheck className="text-cyan-400" size={20} />
          {t('policy.statistics')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Rules */}
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{t('policy.total_rules')}</span>
            <TrendingUp className="text-cyan-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>

        {/* Implemented */}
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{t('policy.implemented')}</span>
            <CheckCircle2 className="text-green-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.implemented}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total > 0 ? Math.round((stats.implemented / stats.total) * 100) : 0}%
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{t('policy.in_progress')}</span>
            <Clock className="text-yellow-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
          </div>
        </div>

        {/* Not Implemented */}
        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{t('policy.not_implemented')}</span>
            <XCircle className="text-red-400" size={16} />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.notImplemented}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total > 0 ? Math.round((stats.notImplemented / stats.total) * 100) : 0}%
          </div>
        </div>

        {/* Compliance Rate */}
        <div className={`rounded-lg p-4 border ${getComplianceBackground(stats.complianceRate)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{t('policy.compliance_rate')}</span>
            <CheckCircle2 className={getComplianceColor(stats.complianceRate)} size={16} />
          </div>
          <div className={`text-3xl font-bold ${getComplianceColor(stats.complianceRate)}`}>
            {stats.complianceRate}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.complianceRate >= 80
                  ? 'bg-green-500'
                  : stats.complianceRate >= 50
                  ? 'bg-yellow-500'
                  : stats.complianceRate >= 25
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${stats.complianceRate}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
