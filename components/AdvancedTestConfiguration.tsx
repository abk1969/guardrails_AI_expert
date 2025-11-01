import React, { useState } from 'react';
import { X, Check, Settings } from 'lucide-react';

// Liste complète des plugins Promptfoo disponibles
const PROMPTFOO_PLUGINS = {
  'Sécurité et Confidentialité': [
    { id: 'prompt-injection', name: 'Prompt Injection', description: 'Tentatives d\'injection de commandes malveillantes' },
    { id: 'indirect-prompt-injection', name: 'Injection Indirecte', description: 'Injections via données externes (RAG)' },
    { id: 'system-prompt-override', name: 'Override System Prompt', description: 'Tentatives de contournement du prompt système' },
    { id: 'prompt-extraction', name: 'Extraction de Prompt', description: 'Extraction du prompt système' },
    { id: 'pii', name: 'PII (Données Personnelles)', description: 'Détection de fuites de données personnelles' },
  ],
  'Pertinence et Justesse': [
    { id: 'hallucination', name: 'Hallucination', description: 'Génération de faits inventés ou incorrects' },
    { id: 'overreliance', name: 'Surconfiance', description: 'Assertions excessivement confiantes sans justification' },
  ],
  'Qualité de Sortie': [
    { id: 'harmful:profanity', name: 'Profanité', description: 'Langage grossier ou vulgaire' },
    { id: 'harmful:insults', name: 'Insultes', description: 'Langage insultant ou offensant' },
  ],
  'Contenu Nuisible': [
    { id: 'harmful:violent-crime', name: 'Crime Violent', description: 'Contenu lié aux crimes violents' },
    { id: 'harmful:sex-crime', name: 'Crime Sexuel', description: 'Contenu lié aux crimes sexuels' },
    { id: 'harmful:child-exploitation', name: 'Exploitation d\'Enfants', description: 'Contenu pédopornographique' },
    { id: 'harmful:harassment-bullying', name: 'Harcèlement', description: 'Harcèlement et intimidation' },
    { id: 'harmful:hate', name: 'Discours de Haine', description: 'Discours haineux et discrimination' },
    { id: 'harmful:self-harm', name: 'Auto-Mutilation', description: 'Incitation à l\'auto-mutilation' },
    { id: 'harmful:sexual-content', name: 'Contenu Sexuel', description: 'Contenu sexuellement explicite' },
    { id: 'harmful:radicalization', name: 'Radicalisation', description: 'Contenu de radicalisation' },
    { id: 'harmful:cybercrime', name: 'Cybercriminalité', description: 'Activités cybercriminelles' },
    { id: 'harmful:cybercrime:malicious-code', name: 'Code Malveillant', description: 'Génération de malware' },
    { id: 'harmful:illegal-activities', name: 'Activités Illégales', description: 'Instructions pour activités illégales' },
    { id: 'harmful:illegal-drugs', name: 'Drogues Illégales', description: 'Promotion de drogues illégales' },
    { id: 'harmful:misinformation-disinformation', name: 'Désinformation', description: 'Propagation de fausses informations' },
    { id: 'harmful:specialized-advice', name: 'Conseils Spécialisés', description: 'Conseils médicaux/juridiques non qualifiés' },
    { id: 'harmful:copyright-violations', name: 'Violation de Copyright', description: 'Reproduction de contenu protégé' },
  ],
  'Logique et Cohérence': [
    { id: 'excessive-agency', name: 'Agence Excessive', description: 'Actions autonomes non autorisées' },
    { id: 'hijacking', name: 'Détournement', description: 'Détournement du comportement prévu' },
  ],
};

interface AdvancedTestConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlugins: string[];
  onPluginsChange: (plugins: string[]) => void;
}

const AdvancedTestConfiguration: React.FC<AdvancedTestConfigurationProps> = ({
  isOpen,
  onClose,
  selectedPlugins,
  onPluginsChange,
}) => {
  const [localSelectedPlugins, setLocalSelectedPlugins] = useState<string[]>(selectedPlugins);

  if (!isOpen) return null;

  const handleTogglePlugin = (pluginId: string) => {
    setLocalSelectedPlugins(prev =>
      prev.includes(pluginId)
        ? prev.filter(id => id !== pluginId)
        : [...prev, pluginId]
    );
  };

  const handleSelectAll = () => {
    const allPluginIds = Object.values(PROMPTFOO_PLUGINS)
      .flat()
      .map(p => p.id);
    setLocalSelectedPlugins(allPluginIds);
  };

  const handleDeselectAll = () => {
    setLocalSelectedPlugins([]);
  };

  const handleApply = () => {
    onPluginsChange(localSelectedPlugins);
    onClose();
  };

  const totalPlugins = Object.values(PROMPTFOO_PLUGINS).flat().length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Settings className="mr-3 text-cyan-500" />
              Configuration Avancée - Sélection de Plugins
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {localSelectedPlugins.length} / {totalPlugins} plugins sélectionnés
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-700/50 border-b border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors"
            >
              Tout sélectionner
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
            >
              Tout désélectionner
            </button>
          </div>
          <p className="text-xs text-gray-400">
            💡 Les plugins sélectionnés seront utilisés pour les tests réels Promptfoo
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(PROMPTFOO_PLUGINS).map(([category, plugins]) => (
              <div key={category} className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plugins.map(plugin => {
                    const isSelected = localSelectedPlugins.includes(plugin.id);
                    return (
                      <button
                        key={plugin.id}
                        onClick={() => handleTogglePlugin(plugin.id)}
                        className={`text-left p-3 rounded-md transition-all border-2 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {isSelected && <Check size={16} className="text-cyan-400 mr-2" />}
                              <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {plugin.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{plugin.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-700/50">
          <p className="text-sm text-gray-400">
            {localSelectedPlugins.length === 0 ? (
              <span className="text-yellow-400">⚠️ Aucun plugin sélectionné - Les tests ne seront pas exécutés</span>
            ) : (
              <span>{localSelectedPlugins.length} plugin(s) seront utilisés pour les tests</span>
            )}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors font-medium"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTestConfiguration;
