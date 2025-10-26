import React, { useState } from 'react';
import Card from './ui/Card';
import CausalTaxonomyView from './repository/CausalTaxonomyView';
import DomainTaxonomyView from './repository/DomainTaxonomyView';
import RiskDatabaseView from './repository/RiskDatabaseView';
import RiskDatabaseExplainerView from './repository/RiskDatabaseExplainerView';
import StatisticsView from './repository/StatisticsView';
import IncludedResourcesView from './repository/IncludedResourcesView';
import ContentsView from './repository/ContentsView';
import { LayoutGrid, Binary, Rows3, Database, MessageSquare, BarChart, FileJson, Link as LinkIcon, Info } from 'lucide-react';

type SheetId = 'contents' | 'causal-taxonomy' | 'domain-taxonomy' | 'database' | 'explainer' | 'causal-stats' | 'domain-stats' | 'comparison' | 'resources';

const SHEETS = [
    { id: 'contents', title: 'Contenus', icon: <LayoutGrid size={16} /> },
    { id: 'causal-taxonomy', title: 'Taxonomie Causale', icon: <Binary size={16} /> },
    { id: 'domain-taxonomy', title: 'Taxonomie par Domaine', icon: <Rows3 size={16} /> },
    { id: 'database', title: 'Base de Données des Risques', icon: <Database size={16} /> },
    { id: 'explainer', title: 'Explication de la Base', icon: <Info size={16} /> },
    { id: 'causal-stats', title: 'Statistiques (Causale)', icon: <BarChart size={16} /> },
    { id: 'domain-stats', title: 'Statistiques (Domaine)', icon: <BarChart size={16} /> },
    { id: 'comparison', title: 'Comparaison Taxonomies', icon: <FileJson size={16} /> },
    { id: 'resources', title: 'Ressources Incluses', icon: <LinkIcon size={16} /> },
];

const AIRiskRepositoryView: React.FC = () => {
    const [activeSheet, setActiveSheet] = useState<SheetId>('causal-taxonomy');

    const renderContent = () => {
        switch (activeSheet) {
            case 'causal-taxonomy': return <CausalTaxonomyView />;
            case 'domain-taxonomy': return <DomainTaxonomyView />;
            case 'database': return <RiskDatabaseView />;
            case 'explainer': return <RiskDatabaseExplainerView />;
            case 'causal-stats':
            case 'domain-stats':
            case 'comparison':
                return <StatisticsView sheetId={activeSheet} />;
            case 'resources': return <IncludedResourcesView />;
            case 'contents': 
            default:
                return <ContentsView setActiveSheet={setActiveSheet} />;
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">Référentiel des Risques IA</h2>
                <p className="text-gray-400 mt-1">
                    Explorez un référentiel complet de risques liés à l'intelligence artificielle, basé sur des taxonomies et une base de données d'incidents.
                </p>
            </header>

            <Card className="p-2">
                <div className="flex flex-wrap items-center gap-2">
                    {SHEETS.map(sheet => (
                        <button
                            key={sheet.id}
                            onClick={() => setActiveSheet(sheet.id as SheetId)}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                activeSheet === sheet.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/80 hover:text-white'
                            }`}
                        >
                            {sheet.icon}
                            <span className="ml-2">{sheet.title}</span>
                        </button>
                    ))}
                </div>
            </Card>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AIRiskRepositoryView;
