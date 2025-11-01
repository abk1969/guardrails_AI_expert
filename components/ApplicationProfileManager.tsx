import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import {
  Plus,
  Settings,
  AlertTriangle,
  Info,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Server,
  Lock,
  Unlock,
  Zap,
  Clock,
  Tag,
} from 'lucide-react';
import { useApplicationProfile } from '../contexts/ApplicationProfileContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ApplicationProfile, ApplicationArchitecture } from '../types';
import ApplicationConfigWizard from './ApplicationConfigWizard';

/**
 * Gestionnaire de Profils d'Applications
 *
 * CONTEXTE D'UTILISATION :
 * Ce composant permet de gérer les profils des applications IA à tester.
 * Il est conçu pour être utilisé de manière SÉCURISÉE lors de tests clients.
 *
 * AVERTISSEMENTS IMPORTANTS :
 * ⚠️ Vous testez des applications RÉELLES, potentiellement en PRODUCTION
 * ⚠️ Une mauvaise configuration peut causer des dommages ou coûts
 * ⚠️ Toujours valider les paramètres avant d'exécuter des tests
 * ⚠️ Respecter les rate limits et politiques d'usage des APIs
 *
 * MODE DE FONCTIONNEMENT :
 * 1. Mode GUIDÉ (recommandé) : Wizard étape par étape avec validations
 * 2. Mode EXPERT : Configuration manuelle directe
 *
 * BONNES PRATIQUES :
 * ✅ Commencer avec un petit volume de tests (5-10)
 * ✅ Utiliser le mode Blackbox pour tests initiaux
 * ✅ Tester sur environnement DEV avant PROD
 * ✅ Documenter les configurations pour chaque client
 * ✅ Sauvegarder les résultats et logs
 */

const ApplicationProfileManager: React.FC = () => {
  const {
    applications,
    addApplication,
    deleteApplication,
    getApplicationStats,
    setSelectedApplicationId,
  } = useApplicationProfile();

  const { setActiveNav } = useNavigation();

  const [showGuidedMode, setShowGuidedMode] = useState(true);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationProfile | null>(null);

  const stats = getApplicationStats();

  const handleOpenWizard = (app?: ApplicationProfile) => {
    setEditingApp(app || null);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingApp(null);
  };

  const handleStartTest = (app: ApplicationProfile) => {
    // Sauvegarder l'application sélectionnée dans le contexte
    setSelectedApplicationId(app.id);

    // Naviguer vers la page de configuration de test
    setActiveNav('test-config');

    // Scroll vers le haut
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Déterminer l'icône selon l'architecture
  const getArchitectureIcon = (arch: ApplicationArchitecture) => {
    switch (arch) {
      case 'llm-chatbot':
      case 'rag':
      case 'agentic-rag':
      case 'code-generation':
        return <Server size={20} className="text-cyan-400" />;
      case 'text-to-speech':
      case 'speech-to-text':
        return <Zap size={20} className="text-purple-400" />;
      case 'text-to-video':
      case 'video-to-text':
        return <Zap size={20} className="text-pink-400" />;
      case 'complex-pipeline':
        return <Settings size={20} className="text-orange-400" />;
      default:
        return <Server size={20} className="text-gray-400" />;
    }
  };

  const getArchitectureLabel = (arch: ApplicationArchitecture): string => {
    const labels: Record<ApplicationArchitecture, string> = {
      'llm-chatbot': 'Chatbot LLM',
      'rag': 'RAG',
      'agentic-rag': 'Agentic RAG',
      'text-to-speech': 'Text-to-Speech',
      'text-to-video': 'Text-to-Video',
      'video-to-text': 'Video-to-Text',
      'speech-to-text': 'Speech-to-Text',
      'complex-pipeline': 'Pipeline Complexe',
      'code-generation': 'Génération de Code',
      'other': 'Autre',
    };
    return labels[arch];
  };

  return (
    <div className="space-y-6">
      {/* SECURITY WARNING - Toujours affiché la première fois */}
      {showSecurityWarning && (
        <Card className="bg-red-900/20 border-red-500/50">
          <div className="flex items-start gap-4">
            <AlertTriangle size={32} className="text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                ⚠️ AVERTISSEMENT DE SÉCURITÉ - À LIRE IMPÉRATIVEMENT
              </h3>
              <div className="space-y-2 text-sm text-gray-200">
                <p className="font-bold text-red-300">
                  Vous êtes sur le point de configurer des tests sur des applications RÉELLES,
                  potentiellement CLIENTES ou en PRODUCTION.
                </p>
                <div className="bg-red-950/50 p-3 rounded border border-red-500/30 space-y-2">
                  <p className="font-bold text-white">🚨 RISQUES PROFESSIONNELS :</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><strong>Coûts imprévus :</strong> Les tests consomment des crédits API (OpenAI, Anthropic, etc.)</li>
                    <li><strong>Surcharge serveur :</strong> Un volume élevé peut causer des ralentissements</li>
                    <li><strong>Données sensibles :</strong> Les prompts de test peuvent contenir du contenu sensible</li>
                    <li><strong>Rate limiting :</strong> Dépasser les limites peut bloquer l'API client</li>
                    <li><strong>Logs et audit :</strong> Vos tests apparaîtront dans les logs du client</li>
                  </ul>
                </div>
                <div className="bg-green-950/50 p-3 rounded border border-green-500/30 space-y-2">
                  <p className="font-bold text-white">✅ BONNES PRATIQUES OBLIGATOIRES :</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><strong>Autorisation écrite :</strong> Toujours obtenir une autorisation écrite du client</li>
                    <li><strong>Environnement de test :</strong> Privilégier DEV/STAGING avant PROD</li>
                    <li><strong>Petit volume initial :</strong> Commencer avec 5-10 tests pour valider</li>
                    <li><strong>Mode Blackbox d'abord :</strong> Ne pas demander d'accès inutiles</li>
                    <li><strong>Documentation complète :</strong> Sauvegarder config, résultats, et rapport</li>
                    <li><strong>Communication proactive :</strong> Avertir le client avant/après les tests</li>
                  </ul>
                </div>
                <p className="font-bold text-yellow-300 mt-3">
                  💡 CONSEIL : Si vous n'êtes pas sûr de la configuration, utilisez le MODE GUIDÉ
                  qui inclut des validations et warnings contextuels.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setShowSecurityWarning(false)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  J'ai lu et compris les risques
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open('https://owasp.org/www-project-top-10-for-large-language-model-applications/', '_blank')}
                >
                  <Info size={16} className="mr-2" />
                  En savoir plus (OWASP LLM Top 10)
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Header avec stats */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Server size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Gestionnaire d'Applications
              </h2>
              <p className="text-gray-300 mb-3">
                Configurez et gérez les profils de vos applications IA à tester.
                Chaque profil définit comment l'application sera testée (architecture, endpoints, sécurité).
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-cyan-400" />
                  <span className="text-white font-bold">{stats.total}</span>
                  <span className="text-gray-400">application(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-white font-bold">{stats.promptfooCompatible}</span>
                  <span className="text-gray-400">Promptfoo ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-blue-400" />
                  <span className="text-white font-bold">{stats.blackbox}</span>
                  <span className="text-gray-400">Blackbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <Unlock size={16} className="text-orange-400" />
                  <span className="text-white font-bold">{stats.whitebox}</span>
                  <span className="text-gray-400">Whitebox</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mode selection */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-2">Mode de Configuration</h4>
            <p className="text-sm text-gray-300 mb-3">
              Choisissez comment vous voulez créer vos profils d'applications :
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowGuidedMode(true)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  showGuidedMode
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className={showGuidedMode ? 'text-cyan-400' : 'text-gray-400'} />
                  <span className={`font-bold ${showGuidedMode ? 'text-white' : 'text-gray-300'}`}>
                    Mode Guidé (Recommandé)
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-left">
                  Wizard étape par étape avec validations, warnings contextuels, et explications détaillées.
                  <strong className="text-cyan-400"> Idéal pour tests clients.</strong>
                </p>
              </button>
              <button
                onClick={() => setShowGuidedMode(false)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  !showGuidedMode
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={20} className={!showGuidedMode ? 'text-orange-400' : 'text-gray-400'} />
                  <span className={`font-bold ${!showGuidedMode ? 'text-white' : 'text-gray-300'}`}>
                    Mode Expert
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-left">
                  Configuration manuelle directe. Pas de validation automatique.
                  <strong className="text-orange-400"> Pour utilisateurs avancés uniquement.</strong>
                </p>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Vos Applications</h3>
          <p className="text-sm text-gray-400">
            {applications.length === 0
              ? 'Aucune application configurée. Commencez par ajouter votre première application.'
              : `${applications.length} application(s) configurée(s)`}
          </p>
        </div>
        <Button onClick={() => handleOpenWizard()}>
          <Plus size={16} className="mr-2" />
          {showGuidedMode ? 'Ajouter avec le Wizard' : 'Ajouter Manuellement'}
        </Button>
      </div>

      {/* Liste des applications */}
      {applications.length === 0 ? (
        <Card className="bg-gray-700/30 border-gray-600">
          <div className="text-center py-12">
            <Server size={48} className="text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Aucune Application</h4>
            <p className="text-gray-400 mb-4">
              Commencez par ajouter le profil de votre première application à tester.
            </p>
            <Button onClick={() => handleOpenWizard()}>
              <Plus size={16} className="mr-2" />
              Créer mon premier profil
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map(app => (
            <Card key={app.id} className="hover:border-cyan-500/50 transition-all">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getArchitectureIcon(app.architecture)}
                    <div>
                      <h4 className="font-bold text-white">{app.name}</h4>
                      <p className="text-xs text-gray-400">{getArchitectureLabel(app.architecture)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {app.testMode === 'blackbox' ? (
                      <Lock size={16} className="text-blue-400" title="Mode Blackbox" />
                    ) : (
                      <Unlock size={16} className="text-orange-400" title="Mode Whitebox" />
                    )}
                  </div>
                </div>

                {/* Description */}
                {app.description && (
                  <p className="text-sm text-gray-300 line-clamp-2">{app.description}</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {app.testability.promptfooCompatible && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                      <CheckCircle2 size={12} />
                      Promptfoo Ready
                    </span>
                  )}
                  {app.safetyConfig.productionEnvironment && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                      <AlertTriangle size={12} />
                      Production
                    </span>
                  )}
                  {app.owner && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded">
                      <Tag size={12} />
                      {app.owner}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-700/50 p-2 rounded">
                    <p className="text-gray-400">Tests effectués</p>
                    <p className="text-white font-bold">{app.testCount || 0}</p>
                  </div>
                  <div className="bg-gray-700/50 p-2 rounded">
                    <p className="text-gray-400">Dernier test</p>
                    <p className="text-white font-bold">
                      {app.lastTestedAt
                        ? new Date(app.lastTestedAt).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 text-sm"
                    onClick={() => handleOpenWizard(app)}
                  >
                    <Settings size={14} className="mr-1" />
                    Configurer
                  </Button>
                  <Button
                    className="flex-1 text-sm"
                    onClick={() => handleStartTest(app)}
                  >
                    <Zap size={14} className="mr-1" />
                    Tester
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Aide contextuelle */}
      <Card className="bg-gray-700/30 border-gray-600">
        <div className="flex items-start gap-3">
          <HelpCircle size={20} className="text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-bold text-white mb-2">💡 Aide : Comment utiliser ce module ?</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                <strong>1. Créer un profil :</strong> Cliquez sur "Ajouter avec le Wizard" pour configurer une nouvelle application.
              </p>
              <p>
                <strong>2. Choisir le mode :</strong> Blackbox (URL seulement) ou Whitebox (avec accès auth).
              </p>
              <p>
                <strong>3. Tester :</strong> Une fois configuré, lancez les tests Promptfoo ou custom selon l'architecture.
              </p>
              <p>
                <strong>4. Analyser :</strong> Consultez les résultats et générez un rapport pour le client.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Wizard Modal */}
      <ApplicationConfigWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        editingApp={editingApp}
      />
    </div>
  );
};

export default ApplicationProfileManager;
