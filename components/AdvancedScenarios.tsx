import React, { useMemo } from 'react';
import Card from './ui/Card';
import { ATTACK_LIBRARY } from '../constants';
import { PromptTemplate, PromptComplexity } from '../types';
import { Bot, FileText, Users, Shield, Database, TestTubeDiagonal, ToyBrick, KeyRound } from 'lucide-react';

const ComplexityBadge: React.FC<{ complexity: PromptComplexity }> = ({ complexity }) => {
    const complexityStyles: Record<PromptComplexity, string> = {
        [PromptComplexity.SIMPLE]: 'bg-blue-500/20 text-blue-300 border-blue-400',
        [PromptComplexity.MOYEN]: 'bg-yellow-500/20 text-yellow-300 border-yellow-400',
        [PromptComplexity.SOPHISTIQUE]: 'bg-red-500/20 text-red-300 border-red-400',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${complexityStyles[complexity]}`}>
            {complexity}
        </span>
    );
};

const ScenarioItem: React.FC<{ prompt: PromptTemplate }> = ({ prompt }) => {
    return (
        <div className="bg-gray-700/50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700 hover:ring-1 hover:ring-cyan-500">
            <div className="flex justify-between items-start mb-3">
                <p className="font-mono text-sm text-gray-200 flex-1 pr-4">{prompt.text}</p>
                <div className="flex-shrink-0">
                    <ComplexityBadge complexity={prompt.complexity} />
                </div>
            </div>
            <div className="pt-3 border-t border-gray-600/50 space-y-3">
                <div>
                    <h4 className="font-semibold text-xs text-cyan-400 mb-1">Guide de l'Attaque</h4>
                    <p className="text-sm text-gray-400">{prompt.guide}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-xs text-green-400 mb-1">Protection Technique</h4>
                    <p className="text-sm text-gray-400">{prompt.protection}</p>
                </div>
            </div>
        </div>
    );
};

interface ScenarioSectionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    promptIds: string[];
}

const ScenarioSection: React.FC<ScenarioSectionProps> = ({ title, description, icon, promptIds }) => {
    const prompts = useMemo(() => ATTACK_LIBRARY.filter(p => promptIds.includes(p.id)), [promptIds]);

    if (prompts.length === 0) return null;

    return (
        <Card>
            <div className="flex items-start mb-6">
                <div className="bg-gray-700 p-3 rounded-lg mr-4">{icon}</div>
                <div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>
            <div className="space-y-4">
                {prompts.map(prompt => <ScenarioItem key={prompt.id} prompt={prompt} />)}
            </div>
        </Card>
    );
};

const AdvancedScenarios: React.FC = () => {
    return (
        <div className="space-y-8">
            <header className="mb-4">
                <h2 className="text-2xl font-bold text-white">Scénarios d'Attaque Avancés</h2>
                <p className="text-gray-400 mt-1">Explorez des vecteurs d'attaque complexes ciblant les architectures d'IA modernes pour renforcer vos défenses.</p>
            </header>

            <ScenarioSection
                title="Attaques sur le Prompt Système et Évasion"
                description="Ces attaques visent à contourner ou à révéler les instructions fondamentales (meta-prompt) qui régissent le comportement du modèle, en utilisant des techniques d'offuscation."
                icon={<KeyRound size={24} className="text-cyan-400" />}
                promptIds={['pi-so1', 'pi-so2', 'ev-so2']}
            />

            <ScenarioSection
                title="Manipulation de Contexte et Empoisonnement de la Mémoire"
                description="Ces scénarios exploitent la manière dont un modèle utilise les informations externes (documents RAG, mémoire de conversation) pour l'induire en erreur ou corrompre son état de manière persistante."
                icon={<FileText size={24} className="text-cyan-400" />}
                promptIds={['rag-m1', 'rag-so1', 'rag-so2', 'ag-so2']}
            />
            
            <ScenarioSection
                title="Attaques sur les Outils et l'Interaction Agent"
                description="Ces attaques ciblent les agents dotés d'outils, en tentant de détourner leurs fonctionnalités (Tool Abuse), de polluer leurs paramètres ou d'empoisonner leurs descriptions."
                icon={<Bot size={24} className="text-cyan-400" />}
                promptIds={['ag-m1', 'mcp-so2', 'ag-so3']}
            />
            
            <ScenarioSection
                title="Attaques sur Systèmes Multi-Agents (Agentic AI)"
                description="Vecteurs d'attaque sophistiqués visant à détourner l'objectif principal, à tromper les agents pour qu'ils interagissent de manière non sécurisée, ou à compromettre la chaîne d'approvisionnement."
                icon={<Users size={24} className="text-cyan-400" />}
                promptIds={['aga-so1', 'a2a-so1', 'aga-so2']}
            />

            <ScenarioSection
                title="Attaques sur la Chaîne d'Approvisionnement (Supply Chain)"
                description="Ces scénarios simulent des compromissions via des dépendances externes, comme des outils tiers malveillants ou des registres d'agents compromis."
                icon={<ToyBrick size={24} className="text-cyan-400" />}
                promptIds={['mcp-so3']}
            />
            
            <ScenarioSection
                title="Attaques sur Architectures Spécifiques (MCP)"
                description="Ces scénarios simulent des tentatives d'usurpation du contexte applicatif (ex: bancaire) pour contourner les politiques de sécurité intégrées au protocole."
                icon={<Database size={24} className="text-cyan-400" />}
                promptIds={['mcp-so1']}
            />

        </div>
    );
};

export default AdvancedScenarios;