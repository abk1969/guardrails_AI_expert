import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Shield, ExternalLink, Database, AlertTriangle } from 'lucide-react';

interface RiskRepositoryIntegrationProps {
  ruleReference: string;
  onNavigateToRepo: () => void;
}

export const RiskRepositoryIntegration: React.FC<RiskRepositoryIntegrationProps> = ({
  ruleReference,
  onNavigateToRepo
}) => {
  // Map rules to risk categories
  const getRiskMapping = (ref: string): { category: string; subcategory: string; count: number } | null => {
    // Mapping based on rule context
    if (ref.startsWith('SIA-01') || ref.startsWith('SIA-02')) {
      return { category: 'Formation et Sensibilisation', subcategory: 'Awareness', count: 12 };
    }
    if (ref.startsWith('SIA-03') || ref.startsWith('SIA-18') || ref.startsWith('SIA-19')) {
      return { category: 'Gestion des Risques', subcategory: 'Risk Assessment', count: 45 };
    }
    if (ref.startsWith('SIA-04') || ref.startsWith('SIA-06')) {
      return { category: 'Chaîne d\'Approvisionnement', subcategory: 'Supply Chain', count: 23 };
    }
    if (ref.startsWith('SIA-07') || ref.startsWith('SIA-11') || ref.startsWith('SIA-12')) {
      return { category: 'Protection des Données', subcategory: 'Data Protection', count: 34 };
    }
    if (ref.startsWith('SIA-15') || ref.startsWith('SIA-16')) {
      return { category: 'Surveillance et Monitoring', subcategory: 'Monitoring', count: 18 };
    }
    if (ref.startsWith('SIA-20') || ref.startsWith('SIA-21')) {
      return { category: 'IA Générative', subcategory: 'Code Generation', count: 15 };
    }
    return null;
  };

  const mapping = getRiskMapping(ruleReference);

  if (!mapping) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Database className="text-purple-400" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Shield size={16} className="text-purple-400" />
            Lien avec le Référentiel des Risques IA
          </h4>
          <p className="text-xs text-gray-400 mb-3">
            Cette règle est associée à {mapping.count} risques identifiés dans le référentiel MIT AI Risk Repository
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-yellow-400" />
              <span className="text-gray-300">Catégorie:</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium border border-purple-500/30">
                {mapping.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Database size={14} className="text-blue-400" />
              <span className="text-gray-300">Sous-catégorie:</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                {mapping.subcategory}
              </span>
            </div>
          </div>

          <Button
            onClick={onNavigateToRepo}
            variant="secondary"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30"
          >
            <ExternalLink size={14} />
            Voir les risques associés dans le référentiel
          </Button>
        </div>
      </div>
    </Card>
  );
};
