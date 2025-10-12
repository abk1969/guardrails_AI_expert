import React from 'react';
import Card from './ui/Card';
import { Settings, FlaskConical, ShieldCheck, BarChart3, BookOpen } from 'lucide-react';

const ProcessStep: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-700 text-cyan-400">
            {icon}
        </div>
        <div className="ml-4">
            <h4 className="text-md font-semibold text-white">{title}</h4>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
    </div>
);


const TestProcessExplainer: React.FC = () => {
    return (
        <Card>
            <div className="flex items-center mb-6">
                 <BookOpen size={20} className="mr-3 text-cyan-500" />
                <h3 className="text-lg font-semibold text-white">Le Cycle de Vie d'un Test : Notre Procédé d'Audit Détaillé</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ProcessStep
                    icon={<Settings size={20} />}
                    title="Étape 1 : Configuration du Test"
                    description="Vous définissez la portée du test : les catégories de risques à évaluer, la complexité des attaques à simuler, le volume de tests, et la configuration exacte de l'API de votre système d'IA. Chaque test est taillé sur mesure."
                />
                 <ProcessStep
                    icon={<FlaskConical size={20} />}
                    title="Étape 2 : Génération du Jeu de Données"
                    description="Notre service utilise un LLM (Gemini) pour générer dynamiquement un jeu de données de prompts unique pour votre test, basé sur notre bibliothèque d'attaques et vos paramètres. Cela garantit des scénarios réalistes et variés."
                />
                <ProcessStep
                    icon={<ShieldCheck size={20} />}
                    title="Étape 3 : Exécution & Évaluation"
                    description="Chaque prompt est soumis à un pipeline d'évaluation en 6 étapes qui simule les guardrails d'entrée et de sortie. Un score est calculé et une décision (PASSED/FAILED) est prise, le tout consigné dans un journal d'audit détaillé."
                />
                 <ProcessStep
                    icon={<BarChart3 size={20} />}
                    title="Étape 4 : Analyse & Remédiation"
                    description="Les résultats sont affichés avec des statistiques claires. Chaque échec est accompagné d'un journal d'audit complet et d'une suggestion de remédiation, transformant le constat en un plan d'action pour vos équipes."
                />
            </div>
        </Card>
    );
};

export default TestProcessExplainer;