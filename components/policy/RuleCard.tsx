import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AIPolicyRule, AIPolicyRuleStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAIPolicy } from '../../contexts/AIPolicyContext';
import { RuleStatusBadge } from './RuleStatusBadge';
import { RuleNotes } from './RuleNotes';
import { RiskRepositoryIntegration } from './RiskRepositoryIntegration';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';

interface RuleCardProps {
  rule: AIPolicyRule;
  chapterTitle?: string;
  sectionTitle?: string;
  onNavigateToRepo?: () => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, chapterTitle, sectionTitle, onNavigateToRepo }) => {
  const { t } = useLanguage();
  const { updateRule } = useAIPolicy();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (newStatus: AIPolicyRuleStatus) => {
    updateRule(rule.id, { status: newStatus });
  };

  const statusActions = [
    {
      status: AIPolicyRuleStatus.IMPLEMENTED,
      label: t('policy.mark_implemented'),
      icon: CheckCircle2,
      color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      status: AIPolicyRuleStatus.IN_PROGRESS,
      label: t('policy.mark_in_progress'),
      icon: Clock,
      color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    {
      status: AIPolicyRuleStatus.NOT_IMPLEMENTED,
      label: t('policy.mark_not_implemented'),
      icon: XCircle,
      color: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
    }
  ];

  return (
    <Card className="hover:border-cyan-500/40 transition-all duration-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded border border-cyan-500/30">
                {rule.reference}
              </span>
              <RuleStatusBadge status={rule.status} size="sm" />
            </div>

            {chapterTitle && sectionTitle && (
              <div className="text-xs text-gray-500 mb-2">
                {chapterTitle} • {sectionTitle}
              </div>
            )}

            <p className="text-white font-medium leading-relaxed">
              {rule.ruleText}
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="text-gray-400" size={20} />
            ) : (
              <ChevronDown className="text-gray-400" size={20} />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            {/* Implementation Details */}
            {rule.implementationDetails && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  {t('policy.implementation')}
                </h4>
                <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-line border border-gray-700">
                  {rule.implementationDetails}
                </div>
              </div>
            )}

            {/* Associated Threats */}
            {rule.associatedThreat && (
              <div>
                <h4 className="text-sm font-semibold text-orange-400 mb-2">
                  🎯 Menaces Associées
                </h4>
                <div className="bg-orange-500/5 rounded-lg p-4 text-sm text-gray-300 border border-orange-500/20">
                  <div className="prose prose-invert prose-sm max-w-none"
                       dangerouslySetInnerHTML={{
                         __html: rule.associatedThreat.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-400">$1</strong>').replace(/\n/g, '<br/>')
                       }}
                  />
                </div>
              </div>
            )}

            {/* Associated Risks */}
            {rule.associatedRisk && (
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">
                  ⚠️ Risques Associés
                </h4>
                <div className="bg-red-500/5 rounded-lg p-4 text-sm text-gray-300 border border-red-500/20">
                  <div className="prose prose-invert prose-sm max-w-none"
                       dangerouslySetInnerHTML={{
                         __html: rule.associatedRisk.replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-400">$1</strong>').replace(/\n/g, '<br/>')
                       }}
                  />
                </div>
              </div>
            )}

            {/* Implementation Guide */}
            {rule.implementationGuide && (
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">
                  ✅ Guide d'Implémentation
                </h4>
                <div className="bg-green-500/5 rounded-lg p-4 text-sm text-gray-300 border border-green-500/20">
                  <div className="prose prose-invert prose-sm max-w-none"
                       dangerouslySetInnerHTML={{
                         __html: rule.implementationGuide.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-400">$1</strong>').replace(/\n/g, '<br/>')
                       }}
                  />
                </div>
              </div>
            )}

            {/* Testing Guide */}
            {rule.testingGuide && (
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">
                  🧪 Guide de Test
                </h4>
                <div className="bg-blue-500/5 rounded-lg p-4 text-sm text-gray-300 border border-blue-500/20">
                  <div className="prose prose-invert prose-sm max-w-none"
                       dangerouslySetInnerHTML={{
                         __html: rule.testingGuide.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400">$1</strong>').replace(/\n/g, '<br/>')
                       }}
                  />
                </div>
              </div>
            )}

            {/* Risk Scenarios */}
            {rule.riskScenarios && rule.riskScenarios.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-3">
                  📋 Scénarios de Risques Associés ({rule.riskScenarios.length})
                </h4>
                <div className="space-y-4">
                  {rule.riskScenarios.map((scenario, idx) => (
                    <div key={idx} className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                      <h5 className="text-purple-400 font-semibold mb-3">
                        Scénario {idx + 1}: {scenario.title}
                      </h5>

                      <div className="space-y-3 text-sm text-gray-300">
                        <div>
                          <span className="font-semibold text-gray-400">Description: </span>
                          {scenario.description}
                        </div>

                        <div>
                          <span className="font-semibold text-gray-400">Acteur de menace: </span>
                          <span className="text-orange-400">{scenario.threatActor}</span>
                        </div>

                        <div>
                          <span className="font-semibold text-gray-400">Vecteur d'attaque: </span>
                          {scenario.attackVector}
                        </div>

                        <div>
                          <span className="font-semibold text-gray-400">Mitigation: </span>
                          {scenario.mitigation}
                        </div>

                        {scenario.impact && Object.keys(scenario.impact).length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-400 block mb-2">Impacts:</span>
                            <div className="ml-4 space-y-1">
                              {scenario.impact.confidentiality && (
                                <div><span className="text-red-400">• Confidentialité:</span> {scenario.impact.confidentiality}</div>
                              )}
                              {scenario.impact.integrity && (
                                <div><span className="text-yellow-400">• Intégrité:</span> {scenario.impact.integrity}</div>
                              )}
                              {scenario.impact.availability && (
                                <div><span className="text-blue-400">• Disponibilité:</span> {scenario.impact.availability}</div>
                              )}
                              {scenario.impact.financial && (
                                <div><span className="text-green-400">• Financier:</span> {scenario.impact.financial}</div>
                              )}
                              {scenario.impact.reputational && (
                                <div><span className="text-purple-400">• Réputationnel:</span> {scenario.impact.reputational}</div>
                              )}
                              {scenario.impact.operational && (
                                <div><span className="text-cyan-400">• Opérationnel:</span> {scenario.impact.operational}</div>
                              )}
                              {scenario.impact.strategic && (
                                <div><span className="text-pink-400">• Stratégique:</span> {scenario.impact.strategic}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {scenario.mappings && Object.keys(scenario.mappings).length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-400 block mb-2">Mappings référentiels:</span>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(scenario.mappings).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-gray-700 rounded text-xs text-cyan-400">
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External References */}
            {(rule.externalReferences?.mitreAtlas || rule.externalReferences?.nistRmf) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Références externes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {rule.externalReferences.mitreAtlas && (
                    <a
                      href={rule.externalReferences.mitreAtlas}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs rounded-lg border border-purple-500/30 transition-colors"
                    >
                      {t('policy.mitre_atlas')}
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {rule.externalReferences.nistRmf && (
                    <a
                      href={rule.externalReferences.nistRmf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30 transition-colors"
                    >
                      {t('policy.nist_framework')}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Status Actions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                {t('policy.status')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {statusActions.map(action => {
                  const Icon = action.icon;
                  const isActive = rule.status === action.status;

                  return (
                    <button
                      key={action.status}
                      onClick={() => handleStatusChange(action.status)}
                      disabled={isActive}
                      className={`
                        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                        border transition-all duration-200
                        ${isActive
                          ? action.color + ' ring-2 ring-offset-2 ring-offset-gray-900'
                          : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-700'
                        }
                        ${isActive ? 'cursor-default' : 'cursor-pointer'}
                      `}
                    >
                      <Icon size={16} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes and Comments */}
            <RuleNotes
              ruleId={rule.id}
              initialNotes={rule.notes || ''}
              onSave={(notes) => updateRule(rule.id, { notes })}
            />

            {/* AI Risk Repository Integration */}
            {onNavigateToRepo && (
              <RiskRepositoryIntegration
                ruleReference={rule.reference}
                onNavigateToRepo={onNavigateToRepo}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
