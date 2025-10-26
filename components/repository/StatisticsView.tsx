import React from 'react';
import Card from '../ui/Card';

interface StatisticsViewProps {
    sheetId: 'causal-stats' | 'domain-stats' | 'comparison';
}

const TITLES: Record<StatisticsViewProps['sheetId'], string> = {
    'causal-stats': 'Feuille 6 : Statistiques de la Taxonomie Causale',
    'domain-stats': 'Feuille 7 : Statistiques de la Taxonomie par Domaine',
    'comparison': 'Feuille 8 : Comparaison des Taxonomies Causale et par Domaine'
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ sheetId }) => {
    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-2">{TITLES[sheetId]}</h2>
            <p className="text-gray-400">
                Le contenu de cette feuille sera implémenté prochainement. Elle affichera des graphiques et des statistiques basés sur les données du référentiel.
            </p>
        </Card>
    );
};

export default StatisticsView;
