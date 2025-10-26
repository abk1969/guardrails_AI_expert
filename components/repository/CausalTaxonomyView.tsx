import React, { useState } from 'react';
import Card from '../ui/Card';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import { CausalTaxonomyNode } from '../../types';
import { ChevronRight } from 'lucide-react';

interface TaxonomyNodeProps {
    node: CausalTaxonomyNode;
    level: number;
}

const TaxonomyNode: React.FC<TaxonomyNodeProps> = ({ node, level }) => {
    const [isExpanded, setIsExpanded] = useState(level < 1);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="taxonomy-node" style={{ marginLeft: `${level * 20}px` }}>
            <div 
                className={`node-header ${hasChildren ? 'cursor-pointer' : ''}`}
                onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            >
                {hasChildren && (
                    <ChevronRight 
                        size={18} 
                        className={`chevron ${isExpanded ? 'expanded' : ''}`}
                    />
                )}
                <h3 className="node-name" style={{ paddingLeft: hasChildren ? `0px` : '22px' }}>
                    {node.name}
                </h3>
            </div>
            {isExpanded && (
                <div className="node-content">
                    <p className="node-description">{node.description}</p>
                    {hasChildren && (
                        <div className="node-children">
                            {node.children?.map(child => (
                                <TaxonomyNode key={child.id} node={child} level={level + 1} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CausalTaxonomyView: React.FC = () => {
    const { causalTaxonomy } = useAIRiskRepository();

    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Feuille 1 : Taxonomie Causale des Risques IA v3</h2>
                    <p className="text-sm text-gray-500">Mis à jour le : 26 Mars 2025</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Description de la Taxonomie</h3>
                    <p className="text-gray-400">La Taxonomie Causale des Risques IA, adaptée de Yampolskiy (2016), classifie les risques selon leurs facteurs de causalité :</p>
                    <ol className="list-decimal list-inside text-gray-400 mt-2 pl-4 space-y-1">
                        <li>Entité (humain, IA)</li>
                        <li>Intentionnalité (intentionnel, non intentionnel)</li>
                        <li>Temporalité (pré-déploiement, post-déploiement)</li>
                    </ol>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Comment Utiliser</h3>
                    <p className="text-gray-400">La taxonomie de haut niveau permet d'utiliser notre base de données pour, par exemple, identifier toutes les mentions de risques qui se présentent comme survenant en pré-déploiement ou post-déploiement, de manière intentionnelle ou non, et causés par l'IA ou par des humains, ou toute combinaison de ces facteurs.</p>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Structure de la Taxonomie</h3>
                    <p className="text-gray-400 mb-6">Cliquez sur les éléments pour déplier et voir les détails de chaque niveau.</p>
                    <div className="space-y-2">
                        {causalTaxonomy.map(rootNode => (
                            <TaxonomyNode key={rootNode.id} node={rootNode} level={0} />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CausalTaxonomyView;