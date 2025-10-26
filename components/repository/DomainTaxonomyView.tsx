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
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first two levels
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
                    {node.description && <p className="node-description">{node.description}</p>}
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

const DomainTaxonomyView: React.FC = () => {
    const { domainTaxonomy } = useAIRiskRepository();

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-2">Feuille 3 : Taxonomie par Domaine des Risques IA v3</h2>
            <p className="text-gray-400 mb-6">
                Cette taxonomie a pour but de définir et de catégoriser les dangers liés au contenu. Les catégories sont divisées en trois groupes : physiques, non-physiques et contextuels. Ces regroupements ne reflètent pas une hiérarchie de gravité.
            </p>

             <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Catégories de Dangers de Contenu</h3>
                <p className="text-gray-400 mb-6">Cliquez sur les éléments pour déplier et voir les détails de chaque niveau.</p>
                <div className="space-y-2">
                    {domainTaxonomy.map(rootNode => (
                        <TaxonomyNode key={rootNode.id} node={rootNode} level={0} />
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default DomainTaxonomyView;