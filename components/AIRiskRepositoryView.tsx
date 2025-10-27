import React, { useState } from 'react';
import Card from './ui/Card';
import CausalTaxonomyView from './repository/CausalTaxonomyView';
import DomainTaxonomyView from './repository/DomainTaxonomyView';
import RiskDatabaseView from './repository/RiskDatabaseView';
import RiskDatabaseExplainerView from './repository/RiskDatabaseExplainerView';
import StatisticsView from './repository/StatisticsView';
import IncludedResourcesView from './repository/IncludedResourcesView';
import ContentsView from './repository/ContentsView';
import LanguageSwitcher from './ui/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutGrid, Binary, Rows3, Database, MessageSquare, BarChart, FileJson, Link as LinkIcon, Info } from 'lucide-react';

type SheetId = 'contents' | 'causal-taxonomy' | 'domain-taxonomy' | 'database' | 'explainer' | 'causal-stats' | 'domain-stats' | 'comparison' | 'resources';

const AIRiskRepositoryView: React.FC = () => {
    const [activeSheet, setActiveSheet] = useState<SheetId>('causal-taxonomy');
    const { t } = useLanguage();

    const SHEETS = [
        { id: 'contents', title: t('nav.contents'), icon: <LayoutGrid size={16} /> },
        { id: 'causal-taxonomy', title: t('nav.causal_taxonomy'), icon: <Binary size={16} /> },
        { id: 'domain-taxonomy', title: t('nav.domain_taxonomy'), icon: <Rows3 size={16} /> },
        { id: 'database', title: t('nav.database'), icon: <Database size={16} /> },
        { id: 'explainer', title: t('nav.explainer'), icon: <Info size={16} /> },
        { id: 'causal-stats', title: t('nav.causal_stats'), icon: <BarChart size={16} /> },
        { id: 'domain-stats', title: t('nav.domain_stats'), icon: <BarChart size={16} /> },
        { id: 'comparison', title: t('nav.comparison'), icon: <FileJson size={16} /> },
        { id: 'resources', title: t('nav.resources'), icon: <LinkIcon size={16} /> },
    ];

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
            <header className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t('repo.title')}</h2>
                    <p className="text-gray-400 mt-1">
                        {t('repo.subtitle')}
                    </p>
                </div>
                <LanguageSwitcher />
            </header>

            <Card className="p-2">
                <div className="flex flex-wrap items-center gap-2">
                    {SHEETS.map(sheet => (
                        <button
                            key={sheet.id}
                            data-tab={sheet.id}
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
