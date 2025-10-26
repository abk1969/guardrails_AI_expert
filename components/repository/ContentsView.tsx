import React from 'react';
import Card from '../ui/Card';
import { LayoutGrid, Binary, Rows3, Database, MessageSquare, BarChart, FileJson, Link as LinkIcon, Info, ChevronRight } from 'lucide-react';

const SHEETS_DETAILS = [
    { id: 'causal-taxonomy', title: 'Taxonomie Causale des Risques IA v3', icon: <Binary size={20} />, description: "Structure les risques selon leurs chaînes causales, du dysfonctionnement au préjudice." },
    { id: 'domain-taxonomy', title: 'Taxonomie par Domaine des Risques IA v3', icon: <Rows3 size={20} />, description: "Organise les risques en fonction du secteur ou du domaine d'application affecté." },
    { id: 'database', title: 'Base de Données des Risques IA v3', icon: <Database size={20} />, description: "Une collection de 2,242 enregistrements détaillés de risques et incidents." },
    { id: 'explainer', title: 'Explication de la Base de Données', icon: <Info size={20} />, description: "Décrit la méthodologie et la structure des données de la base de risques." },
    { id: 'causal-stats', title: 'Statistiques (Causale)', icon: <BarChart size={20} />, description: "Visualisations et statistiques dérivées de la taxonomie causale." },
    { id: 'domain-stats', title: 'Statistiques (Domaine)', icon: <BarChart size={20} />, description: "Visualisations et statistiques dérivées de la taxonomie par domaine." },
    { id: 'comparison', title: 'Comparaison des Taxonomies', icon: <FileJson size={20} />, description: "Analyse croisée et comparaison entre les deux taxonomies." },
    { id: 'resources', title: 'Ressources Incluses', icon: <LinkIcon size={20} />, description: "Liste des sources et références utilisées pour construire ce référentiel." },
];

interface ContentsViewProps {
    setActiveSheet: (sheetId: any) => void;
}

const ContentsView: React.FC<ContentsViewProps> = ({ setActiveSheet }) => {
    return (
        <Card>
            <div className="flex items-center mb-6">
                <LayoutGrid size={24} className="text-cyan-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Feuille 2 : Contenus du Référentiel</h2>
            </div>
            <p className="text-gray-400 mb-6">
                Bienvenue dans le référentiel des risques IA. Cette section sert de table des matières. Cliquez sur une feuille pour explorer son contenu en détail.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHEETS_DETAILS.map(sheet => (
                    <div
                        key={sheet.id}
                        onClick={() => setActiveSheet(sheet.id)}
                        className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center">
                            <div className="text-cyan-400 mr-4 flex-shrink-0">{sheet.icon}</div>
                            <div>
                                <h3 className="font-semibold text-white">{sheet.title}</h3>
                                <p className="text-sm text-gray-400">{sheet.description}</p>
                            </div>
                        </div>
                         <ChevronRight size={20} className="text-gray-600 group-hover:text-cyan-400 transition-colors ml-2" />
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ContentsView;
