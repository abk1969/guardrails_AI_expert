import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AIPolicyChapter, AIPolicyRuleStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAIPolicy } from '../../contexts/AIPolicyContext';
import { RuleStatusBadge } from './RuleStatusBadge';
import { ClipboardCheck, Download, Printer, CheckSquare, Square, MinusSquare } from 'lucide-react';

interface AuditChecklistModeProps {
  policyData: AIPolicyChapter[];
  onClose: () => void;
}

export const AuditChecklistMode: React.FC<AuditChecklistModeProps> = ({ policyData, onClose }) => {
  const { t } = useLanguage();
  const { updateRule } = useAIPolicy();
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const allRules = useMemo(() => {
    const rules: Array<{
      chapterTitle: string;
      chapterIndex: number;
      sectionTitle: string;
      rule: any;
    }> = [];

    policyData.forEach((chapter, chapterIndex) => {
      chapter.sections.forEach(section => {
        section.content.forEach(item => {
          if (item.type === 'rule') {
            rules.push({
              chapterTitle: chapter.title,
              chapterIndex: chapterIndex + 1,
              sectionTitle: section.title,
              rule: item.rule
            });
          }
        });
      });
    });

    return rules;
  }, [policyData]);

  const filteredRules = useMemo(() => {
    if (!showOnlyPending) return allRules;
    return allRules.filter(r => r.rule.status === AIPolicyRuleStatus.NOT_IMPLEMENTED);
  }, [allRules, showOnlyPending]);

  const stats = useMemo(() => {
    const total = allRules.length;
    const implemented = allRules.filter(r => r.rule.status === AIPolicyRuleStatus.IMPLEMENTED).length;
    const inProgress = allRules.filter(r => r.rule.status === AIPolicyRuleStatus.IN_PROGRESS).length;
    const notImplemented = allRules.filter(r => r.rule.status === AIPolicyRuleStatus.NOT_IMPLEMENTED).length;

    return { total, implemented, inProgress, notImplemented };
  }, [allRules]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Référence', 'Chapitre', 'Section', 'Règle', 'Statut', 'Détails'];
    const rows = filteredRules.map(item => [
      item.rule.reference,
      `Ch.${item.chapterIndex} - ${item.chapterTitle}`,
      item.sectionTitle,
      item.rule.ruleText.replace(/"/g, '""'),
      item.rule.status,
      (item.rule.implementationDetails || '').replace(/"/g, '""')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_pssi_ia_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/95 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                  <ClipboardCheck className="text-cyan-400" size={28} />
                  Mode Audit / Checklist
                </h2>
                <p className="text-gray-400 mb-4">
                  Liste complète des règles à auditer avec statuts de conformité
                </p>

                {/* Stats Bar */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="text-green-400" size={16} />
                    <span className="text-gray-300">
                      <span className="font-semibold text-green-400">{stats.implemented}</span> / {stats.total} implémentées
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MinusSquare className="text-yellow-400" size={16} />
                    <span className="text-gray-300">
                      <span className="font-semibold text-yellow-400">{stats.inProgress}</span> en cours
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="text-red-400" size={16} />
                    <span className="text-gray-300">
                      <span className="font-semibold text-red-400">{stats.notImplemented}</span> à faire
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={onClose} variant="secondary">
                Fermer
              </Button>
            </div>
          </Card>

          {/* Actions Bar */}
          <Card className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyPending}
                    onChange={e => setShowOnlyPending(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500 focus:ring-offset-gray-900"
                  />
                  <span className="text-sm text-gray-300">Afficher uniquement les règles non implémentées</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleExportCSV} variant="secondary" className="flex items-center gap-2">
                  <Download size={16} />
                  Exporter CSV
                </Button>
                <Button onClick={handlePrint} variant="secondary" className="flex items-center gap-2">
                  <Printer size={16} />
                  Imprimer
                </Button>
              </div>
            </div>
          </Card>

          {/* Checklist Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold w-24">Réf.</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold w-32">Chapitre</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold">Règle</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold w-40">Statut</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((item, index) => (
                    <tr
                      key={item.rule.id}
                      className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-cyan-400 text-xs">
                          {item.rule.reference}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        Ch.{item.chapterIndex}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 leading-relaxed">
                          {item.rule.ruleText}
                        </p>
                        {item.rule.implementationDetails && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.rule.implementationDetails}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <RuleStatusBadge status={item.rule.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateRule(item.rule.id, { status: AIPolicyRuleStatus.IMPLEMENTED })
                            }
                            className="p-1.5 hover:bg-green-500/20 rounded transition-colors"
                            title="Marquer comme implémentée"
                          >
                            <CheckSquare
                              size={16}
                              className={
                                item.rule.status === AIPolicyRuleStatus.IMPLEMENTED
                                  ? 'text-green-400'
                                  : 'text-gray-500'
                              }
                            />
                          </button>
                          <button
                            onClick={() =>
                              updateRule(item.rule.id, { status: AIPolicyRuleStatus.IN_PROGRESS })
                            }
                            className="p-1.5 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Marquer en cours"
                          >
                            <MinusSquare
                              size={16}
                              className={
                                item.rule.status === AIPolicyRuleStatus.IN_PROGRESS
                                  ? 'text-yellow-400'
                                  : 'text-gray-500'
                              }
                            />
                          </button>
                          <button
                            onClick={() =>
                              updateRule(item.rule.id, { status: AIPolicyRuleStatus.NOT_IMPLEMENTED })
                            }
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                            title="Marquer non implémentée"
                          >
                            <Square
                              size={16}
                              className={
                                item.rule.status === AIPolicyRuleStatus.NOT_IMPLEMENTED
                                  ? 'text-red-400'
                                  : 'text-gray-500'
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRules.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ClipboardCheck size={48} className="mx-auto mb-4 opacity-50" />
                <p>
                  {showOnlyPending
                    ? 'Toutes les règles sont implémentées ou en cours ! 🎉'
                    : 'Aucune règle trouvée'}
                </p>
              </div>
            )}
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Généré le {new Date().toLocaleDateString('fr-FR')} - PSSI IA (CLUSIF 2025)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
