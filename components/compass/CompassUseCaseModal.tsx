import React from 'react';
import { CompassUseCase, RiskLevel } from '../../types';
import { useCompass } from '../../contexts/CompassContext';
import { useNavigation } from '../../contexts/NavigationContext';
import {
  X,
  Flame,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Compass as CompassIcon,
  CheckSquare,
  Map,
  Shield,
  AlertOctagon,
  Lightbulb,
  ExternalLink,
  Bug,
  Flame as IncidentIcon,
  ShieldCheck,
  MessageSquare,
  Target,
  Layers,
  Activity,
  Users,
  FileSearch,
  FileText,
  BookOpen
} from 'lucide-react';
import { pdfReferences } from '../../data/pdfReferences';
import { getPDFLinksForUseCase } from '../../data/compassPDFMapping';
import Card from '../ui/Card';

interface CompassUseCaseModalProps {
  useCase: CompassUseCase;
  onClose: () => void;
}

const CompassUseCaseModal: React.FC<CompassUseCaseModalProps> = ({ useCase, onClose }) => {
  const { language, t } = useCompass();
  const { navigateToModule } = useNavigation();

  // Risk level styling
  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return <Flame className="w-6 h-6" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6" />;
      case 'moderate':
        return <AlertCircle className="w-6 h-6" />;
      case 'low':
        return <Info className="w-6 h-6" />;
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

  const getRiskLabel = (level: RiskLevel) => {
    const labels = {
      critical: { fr: 'Critique', en: 'Critical' },
      high: { fr: 'Élevé', en: 'High' },
      moderate: { fr: 'Modéré', en: 'Moderate' },
      low: { fr: 'Faible', en: 'Low' }
    };
    return labels[level][language];
  };

  // OODA phase
  const getOODAIcon = () => {
    switch (useCase.oodaPhase) {
      case 'observe':
        return <Eye className="w-5 h-5" />;
      case 'orient':
        return <CompassIcon className="w-5 h-5" />;
      case 'decide':
        return <CheckSquare className="w-5 h-5" />;
      case 'act':
        return <Map className="w-5 h-5" />;
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

  const pdfLinks = getPDFLinksForUseCase(useCase.id);
  const resolvedLinks = pdfLinks
    .map(link => {
      const pdf = pdfReferences.find(r => r.id === link.pdfId);
      if (!pdf) return null;
      const items = link.itemIds
        ? pdf.keyItems.filter(i => link.itemIds!.includes(i.id))
        : [];
      return { pdf, items, relevance: link.relevance };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b-2 ${getRiskColor(useCase.riskLevel)}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-lg border ${getRiskColor(useCase.riskLevel)}`}>
                {getRiskIcon(useCase.riskLevel)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRiskColor(
                      useCase.riskLevel
                    )}`}
                  >
                    {getRiskLabel(useCase.riskLevel)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-700 text-gray-300">
                    {language === 'fr' ? 'Score:' : 'Score:'} {useCase.riskScore}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-100 mb-2">{t(useCase.title)}</h2>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    {getOODAIcon()}
                    <span>{getOODALabel()}</span>
                  </div>
                  <span>ID: {useCase.id}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <Card className="p-5 bg-gray-800/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400">
                {language === 'fr' ? 'Description de la menace' : 'Threat Description'}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{t(useCase.description)}</p>
          </Card>

          {/* Risk Assessment */}
          <Card className="p-5 bg-gray-800/50">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              {language === 'fr' ? 'Évaluation du risque' : 'Risk Assessment'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Impact */}
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">
                  {language === 'fr' ? 'Impact' : 'Impact'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(useCase.impact / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-orange-400">{useCase.impact}/5</span>
                </div>
              </div>

              {/* Likelihood */}
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">
                  {language === 'fr' ? 'Probabilité' : 'Likelihood'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(useCase.likelihood / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-orange-400">
                    {useCase.likelihood}/5
                  </span>
                </div>
              </div>

              {/* Risk Score */}
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">
                  {language === 'fr' ? 'Score de risque' : 'Risk Score'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        useCase.riskLevel === 'critical'
                          ? 'bg-red-500'
                          : useCase.riskLevel === 'high'
                          ? 'bg-orange-500'
                          : useCase.riskLevel === 'moderate'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${(useCase.riskScore / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-orange-400">{useCase.riskScore}/25</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recommendation */}
          <Card className="p-5 bg-gray-800/50 border-l-4 border-l-cyan-500">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400">
                {language === 'fr' ? 'Recommandation' : 'Recommendation'}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{t(useCase.recommendation)}</p>
          </Card>

          {/* Associated Threat */}
          <Card className="p-5 bg-gray-800/50">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-orange-400">
                {language === 'fr' ? 'Menace associée' : 'Associated Threat'}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{t(useCase.associatedThreat)}</p>
          </Card>

          {/* MITRE ATT&CK / ATLAS Mapping */}
          {(useCase.attackMapping.mitre || useCase.attackMapping.atlas) && (
            <Card className="p-5 bg-gray-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-400">
                  {language === 'fr' ? 'Mapping ATT&CK / ATLAS' : 'ATT&CK / ATLAS Mapping'}
                </h3>
              </div>

              <div className="space-y-3">
                {useCase.attackMapping.mitre && (
                  <div className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 font-mono text-sm rounded">
                      {useCase.attackMapping.mitre}
                    </span>
                    <span className="text-gray-300 text-sm">MITRE ATT&CK Technique</span>
                  </div>
                )}

                {useCase.attackMapping.atlas && (
                  <div className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
                    <span className="text-gray-300 text-sm">{useCase.attackMapping.atlas}</span>
                  </div>
                )}

                {useCase.attackMapping.description && (
                  <p className="text-gray-400 text-sm">{t(useCase.attackMapping.description)}</p>
                )}
              </div>
            </Card>
          )}

          {/* Related Modules (Cross-navigation) */}
          <Card className="p-5 bg-gray-800/50">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              {language === 'fr' ? 'Modules associés' : 'Related Modules'}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Vulnerabilities Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.vulnerabilities.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.vulnerabilities.length > 0) {
                    navigateToModule(
                      'known-vulnerabilities',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.vulnerabilities,
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.vulnerabilities.length === 0}
              >
                <Bug className="w-5 h-5 text-orange-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Vulnérabilités' : 'Vulnerabilities'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.vulnerabilities.length}{' '}
                    {language === 'fr' ? 'liées' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Incidents Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.incidents.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.incidents.length > 0) {
                    navigateToModule(
                      'known-incidents',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.incidents,
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.incidents.length === 0}
              >
                <IncidentIcon className="w-5 h-5 text-red-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Incidents' : 'Incidents'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.incidents.length} {language === 'fr' ? 'liés' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Defenses Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.defenses.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.defenses.length > 0) {
                    navigateToModule(
                      'defenses-mitigations',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.defenses.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.defenses.length === 0}
              >
                <ShieldCheck className="w-5 h-5 text-green-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Défenses' : 'Defenses'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.defenses.length} {language === 'fr' ? 'liées' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Questions Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.questions.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.questions.length > 0) {
                    navigateToModule(
                      'third-party-questions',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.questions.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.questions.length === 0}
              >
                <MessageSquare className="w-5 h-5 text-blue-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Questions' : 'Questions'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.questions.length}{' '}
                    {language === 'fr' ? 'liées' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Threat Profiles Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.threatProfiles.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.threatProfiles.length > 0) {
                    navigateToModule(
                      'threat-profile',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.threatProfiles.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.threatProfiles.length === 0}
              >
                <Target className="w-5 h-5 text-purple-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Menaces' : 'Threats'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.threatProfiles.length} {language === 'fr' ? 'liées' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Attack Surfaces Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.attackSurfaces.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.attackSurfaces.length > 0) {
                    navigateToModule(
                      'attack-surface-analysis',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.attackSurfaces.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.attackSurfaces.length === 0}
              >
                <Layers className="w-5 h-5 text-yellow-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Surfaces' : 'Surfaces'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.attackSurfaces.length} {language === 'fr' ? 'liées' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Incident Readiness Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.incidentReadiness.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.incidentReadiness.length > 0) {
                    navigateToModule(
                      'incident-readiness',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.incidentReadiness.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.incidentReadiness.length === 0}
              >
                <Activity className="w-5 h-5 text-pink-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Préparation' : 'Readiness'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.incidentReadiness.length} {language === 'fr' ? 'liées' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Red Team Security Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.redTeamSecurity.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.redTeamSecurity.length > 0) {
                    navigateToModule(
                      'red-team-security',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.redTeamSecurity.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.redTeamSecurity.length === 0}
              >
                <Users className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Red Team' : 'Red Team'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.redTeamSecurity.length} {language === 'fr' ? 'liés' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Red Team Results Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.redTeamResults.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.redTeamResults.length > 0) {
                    navigateToModule(
                      'red-team-results',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.redTeamResults.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.redTeamResults.length === 0}
              >
                <FileSearch className="w-5 h-5 text-teal-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Résultats' : 'Results'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.redTeamResults.length} {language === 'fr' ? 'liés' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Use Cases Button */}
              <button
                className={`flex items-center gap-2 p-3 bg-gray-900/50 border rounded-lg transition-all text-left group ${
                  useCase.relatedSheets.useCases.length > 0
                    ? 'border-gray-700 hover:border-cyan-600 hover:bg-cyan-900/20 cursor-pointer transform hover:scale-[1.02]'
                    : 'border-gray-800 cursor-not-allowed opacity-50'
                }`}
                onClick={() => {
                  if (useCase.relatedSheets.useCases.length > 0) {
                    navigateToModule(
                      'use-cases',
                      'compass-use-cases',
                      useCase.id,
                      t(useCase.title),
                      {
                        highlightIds: useCase.relatedSheets.useCases.map(i => String(i)),
                        sourceUseCaseId: useCase.id,
                        sourceUseCaseTitle: t(useCase.title),
                      }
                    );
                    onClose();
                  }
                }}
                disabled={useCase.relatedSheets.useCases.length === 0}
              >
                <FileText className="w-5 h-5 text-amber-400 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {language === 'fr' ? 'Cas d\'usage' : 'Use Cases'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {useCase.relatedSheets.useCases.length} {language === 'fr' ? 'liés' : 'related'}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>
          </Card>

          {/* OWASP References Panel */}
          {resolvedLinks.length > 0 && (
            <section className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-400" aria-hidden="true" />
                <h3 className="font-semibold text-white">
                  {language === 'fr' ? 'Références OWASP liées' : 'Related OWASP References'}
                </h3>
              </div>
              <div className="space-y-3">
                {resolvedLinks.map(({ pdf, items, relevance }) => (
                  <div key={pdf.id} className="bg-gray-900/50 rounded p-3">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">{pdf.title}</h4>
                    {relevance && (
                      <p className="text-xs text-gray-400 italic mb-2">{relevance[language]}</p>
                    )}
                    {items.length > 0 && (
                      <ul className="space-y-1.5">
                        {items.map(item => (
                          <li key={item.id} className="flex items-start gap-2 text-xs">
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[10px] font-mono flex-shrink-0 ${
                                item.priority === 'critical'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : item.priority === 'high'
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                  : item.priority === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}
                            >
                              {item.code || item.id.toUpperCase()}
                            </span>
                            <div className="flex-1">
                              <span className="text-gray-200 font-medium">{item.title}</span>
                              {item.detailedSections?.overview && (
                                <p className="text-gray-400 mt-0.5 text-[11px] leading-relaxed">
                                  {item.detailedSections.overview.slice(0, 200)}
                                  {item.detailedSections.overview.length > 200 ? '…' : ''}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompassUseCaseModal;
