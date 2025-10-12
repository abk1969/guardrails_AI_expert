import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTestRun } from '../contexts/TestRunContext';
import { PlayCircle, History, ArrowUp, ArrowDown } from 'lucide-react';
import TestProcessExplainer from './TestProcessExplainer';
import { HistoricalRun, TestStatus } from '../types';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

interface DashboardHomeProps {
  onStartConfiguration: () => void;
}

const renderScoreTrend = (change: number) => {
    if (change === 0) return <span className="text-gray-400 text-sm">stable</span>;
    const isUp = change > 0;
    return (
        <span className={`flex items-center text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
            {Math.abs(change).toFixed(1)}%
        </span>
    );
};


const DashboardSummaryCard: React.FC<{ latestRun: HistoricalRun, previousRun: HistoricalRun | null }> = ({ latestRun, previousRun }) => {
    const total = latestRun.results.length;
    const failedCount = latestRun.results.filter(r => r.status === TestStatus.FAILED).length;
    const overallScore = total > 0 ? Math.round(latestRun.results.reduce((acc, r) => acc + r.score, 0) / total) : 0;
    
    const previousScore = previousRun && previousRun.results.length > 0
        ? Math.round(previousRun.results.reduce((acc, r) => acc + r.score, 0) / previousRun.results.length)
        : null;
    
    const scoreChange = previousScore !== null ? overallScore - previousScore : 0;

    return (
        <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Résumé du Dernier Test</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Score Global</p>
                    <div className="flex items-center justify-center space-x-2">
                        <p className="text-2xl font-bold text-white">{overallScore}%</p>
                        {renderScoreTrend(scoreChange)}
                    </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Prompts Testés</p>
                    <p className="text-2xl font-bold text-white">{total}</p>
                </div>
                <div className="bg-green-900/50 p-4 rounded-lg">
                    <p className="text-sm text-green-400">Succès</p>
                    <p className="text-2xl font-bold text-white">{total - failedCount}</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                    <p className="text-sm text-red-400">Échecs</p>
                    <p className="text-2xl font-bold text-white">{failedCount}</p>
                </div>
            </div>
        </Card>
    );
};

const RecentRunsCard: React.FC<{ runs: HistoricalRun[] }> = ({ runs }) => {
    const recentRuns = runs.slice(-5).reverse();
    
    const chartData = runs.slice(-10).map(run => {
        const score = run.results.length > 0 ? Math.round(run.results.reduce((acc, r) => acc + r.score, 0) / run.results.length) : 0;
        return {
            date: new Date(run.date).toLocaleDateString(),
            Score: score,
        };
    });

    return (
        <Card>
            <div className="flex items-center mb-4">
                <History size={20} className="mr-3 text-cyan-500" />
                <h3 className="text-lg font-semibold text-white">Exécutions Récentes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    {recentRuns.map(run => {
                        const score = run.results.length > 0 ? Math.round(run.results.reduce((acc, r) => acc + r.score, 0) / run.results.length) : 0;
                        const scoreColor = score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400';
                        return (
                            <div key={run.id} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{run.configuration.target.name}</p>
                                    <p className="text-xs text-gray-400">{new Date(run.date).toLocaleString()}</p>
                                </div>
                                <div className={`text-lg font-bold ${scoreColor}`}>{score}%</div>
                            </div>
                        )
                    })}
                </div>
                 <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <Tooltip contentStyle={{ backgroundColor: '#272b30', border: '1px solid #3c424a' }} labelStyle={{ color: '#9da5b4' }} itemStyle={{ color: '#22d3ee' }} />
                            <YAxis stroke="#9da5b4" domain={[0, 100]} tick={{fontSize: 12}} />
                             <Line type="monotone" dataKey="Score" stroke="#22d3ee" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    )
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onStartConfiguration }) => {
  const { historicalRuns } = useTestRun();
  const latestRun = historicalRuns.length > 0 ? historicalRuns[historicalRuns.length - 1] : null;
  const previousRun = historicalRuns.length > 1 ? historicalRuns[historicalRuns.length - 2] : null;

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-gray-800 to-gray-800/80">
        <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white">Tableau de Bord de Gouvernance</h2>
                <p className="text-gray-400 mt-1">Surveillez, analysez et améliorez la robustesse de vos systèmes d'IA.</p>
            </div>
            <Button onClick={onStartConfiguration} className="mt-4 md:mt-0 px-6 py-3">
                <PlayCircle className="mr-2" />
                Lancer un Nouveau Test
            </Button>
        </div>
      </Card>

      {latestRun && <DashboardSummaryCard latestRun={latestRun} previousRun={previousRun} />}

      <TestProcessExplainer />

      {historicalRuns.length > 0 && <RecentRunsCard runs={historicalRuns} />}
    </div>
  );
};

export default DashboardHome;