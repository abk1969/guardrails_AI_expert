
import React from 'react';
import TestConfiguration from './TestConfiguration';
import RealTimeResults from './RealTimeResults';
import { useTestRun } from '../contexts/TestRunContext';

const Dashboard: React.FC = () => {
    const { isRunning, isFinished } = useTestRun();

    return (
        <div className="space-y-8">
            <TestConfiguration />
            {(isRunning || isFinished) && <RealTimeResults />}
        </div>
    );
};

export default Dashboard;
