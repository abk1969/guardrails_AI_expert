
import React, { useMemo } from 'react';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import { useTestRun } from '../contexts/TestRunContext';
import { TestStatus } from '../types';
import { FileInput, BrainCircuit, BotMessageSquare, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import './LiveTestView.css';

const LiveTestView: React.FC = () => {
    const { progress, results, configuration } = useTestRun();

    const stats = useMemo(() => {
        const passed = results.filter(r => r.status === TestStatus.PASSED).length;
        const failed = results.filter(r => r.status === TestStatus.FAILED).length;
        const pending = results.filter(r => r.status === TestStatus.PENDING).length;
        const total = results.length;
        return { passed, failed, pending, total };
    }, [results]);

    const latestCompletedResult = useMemo(() => {
        return [...results].reverse().find(r => r.status !== TestStatus.PENDING);
    }, [results]);
    
    if (!configuration) return null;

    const pipelineStages = [
        { name: "Analyse d'Entrée", icon: <FileInput size={24} /> },
        { name: "Interaction LLM", icon: <BotMessageSquare size={24} /> },
        { name: "Analyse de Sortie", icon: <BrainCircuit size={24} /> },
        { name: "Résultat Final", icon: <ShieldCheck size={24} /> },
    ];

    return (
        <Card>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-white">Test en Cours d'Exécution...</h2>
                    <span className="text-gray-400 font-mono text-sm">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} />
            </div>

             <div className="grid grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Cible de Test</p>
                    <p className="text-lg font-bold text-white truncate">{configuration.target.name}</p>
                </div>
                 <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">En Attente</p>
                    <p className="text-lg font-bold text-white">{stats.pending}</p>
                </div>
                 <div className="bg-green-900/50 p-4 rounded-lg">
                    <p className="text-sm text-green-400">Passés</p>
                    <p className="text-lg font-bold text-white">{stats.passed}</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                    <p className="text-sm text-red-400">Échoués</p>
                    <p className="text-lg font-bold text-white">{stats.failed}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">Chaîne de Traitement en Direct</h3>
            <div className="bg-gray-900 p-6 rounded-lg">
                <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-700"></div>
                    <div className="relative flex justify-between">
                        {pipelineStages.map(stage => (
                             <div key={stage.name} className="flex flex-col items-center z-10">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-cyan-400 border-2 border-gray-600">
                                    {stage.icon}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{stage.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-20">
                    {latestCompletedResult && (
                         <div key={latestCompletedResult.prompt.id} className="live-prompt-animation">
                            <Card className="flex items-center justify-between p-3 bg-gray-700 border-gray-600">
                                <p className="font-mono text-sm text-gray-300 truncate">{latestCompletedResult.prompt.text}</p>
                                {latestCompletedResult.status === TestStatus.PASSED && <CheckCircle className="text-green-500 ml-4 flex-shrink-0" />}
                                {latestCompletedResult.status === TestStatus.FAILED && <XCircle className="text-red-500 ml-4 flex-shrink-0" />}
                            </Card>
                         </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default LiveTestView;
