import React, { useMemo } from 'react';
import Card from '../ui/Card';
import { AIPolicyChapter, AIPolicyRuleStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ChapterProgressChartProps {
  policyData: AIPolicyChapter[];
}

interface ChapterStats {
  chapterId: string;
  chapterTitle: string;
  total: number;
  implemented: number;
  inProgress: number;
  notImplemented: number;
  percentage: number;
}

export const ChapterProgressChart: React.FC<ChapterProgressChartProps> = ({ policyData }) => {
  const { t } = useLanguage();

  const chapterStats: ChapterStats[] = useMemo(() => {
    return policyData.map(chapter => {
      let total = 0;
      let implemented = 0;
      let inProgress = 0;
      let notImplemented = 0;

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

      const percentage = total > 0 ? Math.round((implemented / total) * 100) : 0;

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        total,
        implemented,
        inProgress,
        notImplemented,
        percentage
      };
    }).filter(stat => stat.total > 0); // Only chapters with rules
  }, [policyData]);

  const maxTotal = Math.max(...chapterStats.map(s => s.total), 1);

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/20">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <BarChart3 className="text-purple-400" size={20} />
          Progression par Chapitre
        </h3>
        <p className="text-sm text-gray-400">
          Vue détaillée de l'état d'implémentation des règles par chapitre
        </p>
      </div>

      <div className="space-y-6">
        {chapterStats.map((stat, index) => (
          <div key={stat.chapterId} className="space-y-2">
            {/* Chapter Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500">Ch. {index + 1}</span>
                  <h4 className="text-sm font-semibold text-white truncate">
                    {stat.chapterTitle}
                  </h4>
                </div>
                <p className="text-xs text-gray-500">
                  {stat.total} {stat.total === 1 ? 'règle' : 'règles'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-bold ${
                    stat.percentage >= 80
                      ? 'text-green-400'
                      : stat.percentage >= 50
                      ? 'text-yellow-400'
                      : stat.percentage >= 25
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`}
                >
                  {stat.percentage}%
                </span>
                {stat.percentage >= 80 && <TrendingUp className="text-green-400" size={16} />}
              </div>
            </div>

            {/* Stacked Progress Bar */}
            <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div className="absolute inset-0 flex">
                {/* Implemented */}
                {stat.implemented > 0 && (
                  <div
                    className="bg-green-500 transition-all duration-500 relative group"
                    style={{ width: `${(stat.implemented / stat.total) * 100}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {stat.implemented > 0 && stat.implemented}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {stat.implemented} implémentée{stat.implemented > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                {/* In Progress */}
                {stat.inProgress > 0 && (
                  <div
                    className="bg-yellow-500 transition-all duration-500 relative group"
                    style={{ width: `${(stat.inProgress / stat.total) * 100}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900">
                      {stat.inProgress > 0 && stat.inProgress}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {stat.inProgress} en cours
                    </div>
                  </div>
                )}
                {/* Not Implemented */}
                {stat.notImplemented > 0 && (
                  <div
                    className="bg-red-500 transition-all duration-500 relative group"
                    style={{ width: `${(stat.notImplemented / stat.total) * 100}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {stat.notImplemented > 0 && stat.notImplemented}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {stat.notImplemented} non implémentée{stat.notImplemented > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {stat.implemented}
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  {stat.inProgress}
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {stat.notImplemented}
                </span>
              </div>
              <span className="text-gray-500">
                {stat.implemented + stat.inProgress}/{stat.total} en cours/terminées
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Implémentée</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>En cours</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Non implémentée</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
