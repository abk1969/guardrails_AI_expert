import React from 'react';
import Modal from './ui/Modal';
import { TestResult, TestStatus, EvaluationStep } from '../types';
import { CheckCircle, XCircle, Info, Wrench, ShieldAlert } from 'lucide-react';
import { useTestRun } from '../contexts/TestRunContext';

const StepIcon = ({ status }: { status: EvaluationStep['status'] }) => {
    switch (status) {
        case 'PASSED':
            return <CheckCircle className="text-green-500 flex-shrink-0" size={20} />;
        case 'FAILED':
            return <XCircle className="text-red-500 flex-shrink-0" size={20} />;
        case 'INFO':
            return <Info className="text-blue-400 flex-shrink-0" size={20} />;
    }
};

const ResultDetailModal: React.FC<{ result: TestResult; onClose: () => void }> = ({ result, onClose }) => {
    const { prompt, response, score, status, explanation, evaluationChain, remediation } = result;
    const { configuration } = useTestRun();

    const title = status === TestStatus.FAILED ? "Détails de la Violation de Guardrail" : "Détails du Test Réussi";
    const isSandboxMode = configuration?.target.id === 'embedded-sandbox';

    return (
        <Modal isOpen={true} onClose={onClose} title={title}>
            <div className="space-y-6">
                {/* Prompt Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Prompt Envoyé</h3>
                    <div className="bg-gray-900 p-3 rounded-md">
                        <p className="font-mono text-sm text-gray-300">{prompt.text}</p>
                        <p className="text-xs text-gray-500 mt-2">Catégorie: {prompt.category} | Complexité: {prompt.complexity}</p>
                    </div>
                </div>

                {/* Response Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Réponse du Modèle (Simulée)</h3>
                    <div className="bg-gray-900 p-3 rounded-md">
                        <p className="text-sm text-gray-400">{response || 'Aucune réponse générée.'}</p>
                    </div>
                </div>

                {/* Summary Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Résumé</h3>
                     <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                         <div className="flex items-center">
                            {status === TestStatus.PASSED ? <CheckCircle className="text-green-500 mr-3" size={24}/> : <XCircle className="text-red-500 mr-3" size={24}/>}
                            <div>
                                <p className={`text-lg font-bold ${status === TestStatus.PASSED ? 'text-green-400' : 'text-red-400'}`}>
                                    {status === TestStatus.PASSED ? 'Passé' : 'Échoué'}
                                </p>
                            </div>
                         </div>
                        <div className="text-right">
                             <p className="text-sm text-gray-400">Score</p>
                             <p className="text-2xl font-bold text-white">{score}%</p>
                        </div>
                    </div>
                </div>

                {/* Sandbox Exploit Analysis Section */}
                {isSandboxMode && status === TestStatus.FAILED && explanation && (
                     <div>
                        <h3 className="text-lg font-semibold text-cyan-300 mb-2 flex items-center">
                            <ShieldAlert className="mr-2" size={20} />
                            Analyse de l'Exploitation (Bac à Sable)
                        </h3>
                        <div className="bg-cyan-900/30 border border-cyan-500/50 p-4 rounded-md">
                            <p className="text-sm text-cyan-200">{explanation}</p>
                        </div>
                    </div>
                )}


                {/* Remediation Section */}
                {status === TestStatus.FAILED && remediation && (
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center">
                            <Wrench className="mr-2" size={20} />
                            Actions Correctives Recommandées
                        </h3>
                        <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-md">
                            <p className="text-sm text-yellow-200">{remediation}</p>
                        </div>
                    </div>
                )}


                {/* Evaluation Chain Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-3">Chaîne d'Évaluation</h3>
                    <div className="border border-gray-700 rounded-md p-4 bg-gray-900 space-y-3">
                        {evaluationChain.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <StepIcon status={step.status} />
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{step.stage}</p>
                                    <p className="text-sm text-gray-400">{step.details}</p>
                                    <p className="text-xs text-gray-500 font-mono pt-1">{new Date(step.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ResultDetailModal;