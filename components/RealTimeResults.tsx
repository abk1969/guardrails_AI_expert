
import React, { useMemo } from 'react';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import { useTestRun } from '../contexts/TestRunContext';
import { TestStatus } from '../types';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const StatusIcon = ({ status }: { status: TestStatus }) => {
  switch (status) {
    case TestStatus.PASSED:
      return <CheckCircle className="text-green-500" size={20} />;
    case TestStatus.FAILED:
      return <XCircle className="text-red-500" size={20} />;
    case TestStatus.PENDING:
      return <Clock className="text-gray-500" size={20} />;
    default:
      return <AlertTriangle className="text-yellow-500" size={20} />;
  }
};

const ScoreBadge = ({ score }: { score: number }) => {
    const color = score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${color}`}>
            {score}
        </span>
    );
};


const RealTimeResults: React.FC = () => {
    const { progress, results, isRunning, isFinished, configuration } = useTestRun();

    const stats = useMemo(() => {
        const passed = results.filter(r => r.status === TestStatus.PASSED).length;
        const failed = results.filter(r => r.status === TestStatus.FAILED).length;
        const pending = results.filter(r => r.status === TestStatus.PENDING).length;
        const total = results.length;
        const overallScore = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.filter(r => r.status !== TestStatus.PENDING).length) || 0 : 0;

        return { passed, failed, pending, total, overallScore };
    }, [results]);

    const visibleResults = useMemo(() => {
        return results.filter(r => r.status !== TestStatus.PENDING).reverse();
    }, [results]);

    if (!configuration) return null;

    return (
        <Card>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-white">Résultats en Temps Réel</h2>
                    <span className="text-gray-400 font-mono text-sm">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-center">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Modèle</p>
                    <p className="text-lg font-bold text-white">{configuration.model}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Prompts</p>
                    <p className="text-lg font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-green-900/50 p-4 rounded-lg">
                    <p className="text-sm text-green-400">Passés</p>
                    <p className="text-lg font-bold text-white">{stats.passed}</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                    <p className="text-sm text-red-400">Échoués</p>
                    <p className="text-lg font-bold text-white">{stats.failed}</p>
                </div>
                <div className="bg-cyan-900/50 p-4 rounded-lg">
                    <p className="text-sm text-cyan-400">Score Global</p>
                    <p className="text-lg font-bold text-white">{isFinished ? stats.overallScore : '-'}</p>
                </div>
            </div>

            {isFinished && (
                 <div className="bg-gray-700/50 border border-cyan-500 text-cyan-200 px-4 py-3 rounded-lg relative text-center mb-6" role="alert">
                    <strong className="font-bold">Test Terminé!</strong>
                    <span className="block sm:inline ml-2">{stats.failed} violations critiques détectées avec un score de conformité de {stats.overallScore}%.</span>
                </div>
            )}
            
            <div className="max-h-96 overflow-y-auto bg-gray-900 rounded-lg p-2">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3">Statut</th>
                            <th scope="col" className="px-4 py-3">Catégorie</th>
                            <th scope="col" className="px-4 py-3">Prompt</th>
                            <th scope="col" className="px-4 py-3 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleResults.map(result => (
                            <tr key={result.prompt.id} className="border-b border-gray-700 hover:bg-gray-800">
                                <td className="px-4 py-3"><StatusIcon status={result.status} /></td>
                                <td className="px-4 py-3">{result.prompt.category}</td>
                                <td className="px-4 py-3 font-mono text-gray-300 truncate max-w-md">{result.prompt.text}</td>
                                <td className="px-4 py-3 text-right"><ScoreBadge score={result.score} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {isRunning && visibleResults.length === 0 && (
                     <div className="text-center py-8 text-gray-500">En attente des premiers résultats...</div>
                 )}
            </div>
        </Card>
    );
};

export default RealTimeResults;
