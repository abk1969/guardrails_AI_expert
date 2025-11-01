import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Settings, FlaskConical, ShieldCheck, BarChart3, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

interface ProcessStepProps {
    stepNumber: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    navigationId: string;
    isCompleted?: boolean;
}

const ProcessStep: React.FC<ProcessStepProps> = ({
    stepNumber,
    icon,
    title,
    description,
    actionLabel,
    navigationId,
    isCompleted = false
}) => {
    const { setActiveNav } = useNavigation();

    return (
        <div className="relative group">
            {/* Carte d'étape avec hover effect */}
            <div className="h-full p-6 bg-gray-700/30 border border-gray-600 rounded-lg hover:bg-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
                {/* Header avec numéro et icône */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Numéro d'étape */}
                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-lg font-bold ${
                            isCompleted
                                ? 'bg-green-500/20 text-green-400 border-2 border-green-400'
                                : 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-400'
                        }`}>
                            {isCompleted ? <CheckCircle2 size={20} /> : stepNumber}
                        </div>
                        {/* Icône */}
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-600/50 text-cyan-400">
                            {icon}
                        </div>
                    </div>
                </div>

                {/* Contenu */}
                <div className="mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
                </div>

                {/* Bouton d'action */}
                <Button
                    onClick={() => setActiveNav(navigationId)}
                    variant="secondary"
                    className="w-full group-hover:bg-cyan-600 group-hover:text-white transition-colors"
                >
                    {actionLabel}
                    <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </div>
    );
};


const TestProcessExplainer: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header du guide */}
            <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Comment Conduire un Test de Sécurité avec Promptfoo ?
                            </h3>
                            <p className="text-gray-300">
                                Suivez ces 5 étapes pour tester vos systèmes d'IA avec Promptfoo. Le workflow génère automatiquement
                                la configuration YAML et lance les tests réels avec 40+ plugins de sécurité.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Grille des étapes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProcessStep
                    stepNumber={1}
                    icon={<Settings size={20} />}
                    title="Configuration"
                    description="Sélectionnez les catégories de risques, plugins Promptfoo (40+ disponibles), volume de tests, et l'API cible à tester."
                    actionLabel="Configurer"
                    navigationId="test-config"
                />
                <ProcessStep
                    stepNumber={2}
                    icon={<FlaskConical size={20} />}
                    title="Édition YAML"
                    description="Prévisualisez et éditez la configuration Promptfoo générée automatiquement (promptfooconfig.yaml) avant l'exécution."
                    actionLabel="Éditer YAML"
                    navigationId="test-yaml-editor"
                />
                <ProcessStep
                    stepNumber={3}
                    icon={<ShieldCheck size={20} />}
                    title="Datasets (Optionnel)"
                    description="Ajoutez des datasets personnalisés ou utilisez les datasets intégrés (BeaverTails, HarmBench, Pliny)."
                    actionLabel="Gérer Datasets"
                    navigationId="test-datasets"
                />
                <ProcessStep
                    stepNumber={4}
                    icon={<FlaskConical size={20} />}
                    title="Exécution"
                    description="Lancez Promptfoo en subprocess et suivez la progression en temps réel. Durée: 5-30 minutes selon la configuration."
                    actionLabel="Exécuter"
                    navigationId="test-execution"
                />
                <ProcessStep
                    stepNumber={5}
                    icon={<BarChart3 size={20} />}
                    title="Résultats"
                    description="Analysez les scores par plugin, identifiez les échecs, et consultez les recommandations de remédiation."
                    actionLabel="Voir Résultats"
                    navigationId="test-results"
                />
            </div>

            {/* Conseils rapides */}
            <Card className="bg-gray-700/30 border-gray-600">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-cyan-400 mt-1">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">💡 Conseil pour débuter</h4>
                        <p className="text-sm text-gray-300">
                            Pour votre premier test, commencez par <strong className="text-cyan-400">1-2 catégories</strong> avec
                            une complexité <strong className="text-cyan-400">Simple</strong> et un volume de <strong className="text-cyan-400">10-20 prompts</strong>.
                            Cela vous permettra de comprendre le processus avant de lancer des tests plus complets.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TestProcessExplainer;