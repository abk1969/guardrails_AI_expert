import React, { useState } from 'react';
import TestConfiguration from './TestConfiguration';
import LiveTestView from './LiveTestView';
import RealTimeResults from './RealTimeResults';
import { useTestRun } from '../contexts/TestRunContext';
import Card from './ui/Card';
import Button from './ui/Button';
import DashboardHome from './DashboardHome';

const Dashboard: React.FC = () => {
    const { isRunning, isFinished, resetTest } = useTestRun();
    const [isConfiguring, setIsConfiguring] = useState(false);

    const handleStartConfiguration = () => setIsConfiguring(true);
    const handleCancelConfiguration = () => setIsConfiguring(false);

    const handleReset = () => {
        resetTest();
        setIsConfiguring(false); 
    };

    if (isRunning) {
        return <LiveTestView />;
    }

    if (isFinished) {
        return (
            <div className="space-y-8">
                 <Card>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">Test Terminé</h2>
                            <p className="text-gray-400">Le test est terminé. Voici le résumé des résultats.</p>
                        </div>
                        <Button onClick={handleReset} variant="secondary">Retour au Tableau de bord</Button>
                    </div>
                </Card>
                <RealTimeResults />
            </div>
        );
    }
    
    if (isConfiguring) {
        return <TestConfiguration onCancel={handleCancelConfiguration} />;
    }

    return <DashboardHome onStartConfiguration={handleStartConfiguration} />;
};

export default Dashboard;
