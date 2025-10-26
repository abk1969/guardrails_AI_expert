import React from 'react';
import Card from '../ui/Card';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';
import Accordion from '../ui/Accordion';

const RiskDatabaseExplainerView: React.FC = () => {
    const { databaseExplainerContent } = useAIRiskRepository();

    const renderContentItem = (item: any, index: number) => {
        switch (item.type) {
            case 'paragraph':
                return <p key={index} className="text-gray-400 mb-3">{item.text}</p>;
            case 'list':
                return <ul key={index} className="list-disc list-inside space-y-1 text-gray-400 mb-3 pl-4">
                    {item.items.map((li: string, i: number) => <li key={i}>{li}</li>)}
                </ul>;
            case 'warning':
                return <div key={index} className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg my-4" role="alert">
                    <strong className="font-bold">AVERTISSEMENT: </strong>
                    <span className="block sm:inline">{item.text}</span>
                </div>;
            case 'box':
                 return <div key={index} className="bg-gray-700/50 border border-gray-600 p-4 rounded-lg my-4">
                    <h4 className="font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-300">{item.text}</p>
                </div>;
            case 'h3':
                return <h3 key={index} className="text-lg font-semibold text-cyan-400 mt-6 mb-2">{item.text}</h3>;
            default:
                return null;
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-2">Feuille 5 : Explication de la Base de Données des Risques</h2>
            <p className="text-gray-400 mb-6">
                Ce document est la référence officielle pour comprendre et mettre en œuvre la Norme d'Évaluation AlLuminate. Il est organisé en plusieurs sections pour une consultation facile.
            </p>
            
            <div className="space-y-4">
                {databaseExplainerContent.map(section => (
                    <Accordion 
                        key={section.id}
                        title={<span className="text-lg font-semibold">{section.title}</span>}
                        defaultOpen={section.id === 'about'}
                    >
                        <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-li:text-gray-400">
                            {section.content.map(renderContentItem)}
                        </div>
                    </Accordion>
                ))}
            </div>
        </Card>
    );
};

export default RiskDatabaseExplainerView;