import React, { useMemo } from 'react';
import { AIPolicyChapter, AIPolicyRule, AIPolicyRuleStatus } from '../../types';
import Card from '../ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AI_POLICY_STATUS_COLORS, AI_POLICY_CHART_COLORS } from '../../constants';
import { ListChecks, CheckCircle, Clock, XCircle, Slash } from 'lucide-react';

interface PolicyDashboardProps {
    policyData: AIPolicyChapter[];
}

export const PolicyDashboard: React.FC<PolicyDashboardProps> = ({ policyData }) => {
    const stats = useMemo(() => {
        const rules: AIPolicyRule[] = policyData.flatMap(chapter => 
            chapter.sections.flatMap(section => 
                section.content.flatMap(item => 
                    item.type === 'rule' ? [item.rule] : []
                )
            )
        );

        const totalRules = rules.length;
        
        const statusCounts = rules.reduce((acc, rule) => {
            acc[rule.status] = (acc[rule.status] || 0) + 1;
            return acc;
        }, {} as Record<AIPolicyRuleStatus, number>);

        const allStatuses: AIPolicyRuleStatus[] = ['Implémentée', 'En cours', 'Non implémentée', 'Non applicable'];
        allStatuses.forEach(status => {
            if (!statusCounts[status]) {
                statusCounts[status] = 0;
            }
        });

        const chartData = Object.entries(statusCounts)
            .map(([name, value]) => ({ name: name as AIPolicyRuleStatus, value }))
            .filter(d => d.value > 0);

        return { totalRules, statusCounts, chartData };
    }, [policyData]);

    const ICONS: Record<AIPolicyRuleStatus, React.ReactNode> = {
        'Implémentée': <CheckCircle className="text-green-400" />,
        'En cours': <Clock className="text-blue-400" />,
        'Non implémentée': <XCircle className="text-red-400" />,
        'Non applicable': <Slash className="text-gray-400" />,
    };

    const statusOrder: AIPolicyRuleStatus[] = ['Implémentée', 'En cours', 'Non implémentée', 'Non applicable'];

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><ListChecks className="mr-3 text-cyan-400" />État d'Implémentation de la Politique</h3>
                    <div className="space-y-3">
                        {statusOrder.map(status => {
                            const count = stats.statusCounts[status] || 0;
                            return (
                                <div key={status} className={`flex justify-between items-center p-3 rounded-lg border ${AI_POLICY_STATUS_COLORS[status]}`}>
                                    <div className="flex items-center font-semibold">
                                        {ICONS[status]}
                                        <span className="ml-3">{status}</span>
                                    </div>
                                    <div className="font-bold text-lg">{count}</div>
                                </div>
                            );
                        })}
                         <div className="flex justify-between items-center p-3 rounded-lg border border-gray-600 bg-gray-700/50">
                            <span className="font-semibold text-white">Total des Règles</span>
                            <span className="font-bold text-lg text-white">{stats.totalRules}</span>
                        </div>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                formatter={(value) => `${value} (${(stats.totalRules > 0 ? ((value as number) / stats.totalRules) * 100 : 0).toFixed(1)}%)`}
                            />
                            <Legend />
                            <Pie
                                data={stats.chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {stats.chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={AI_POLICY_CHART_COLORS[entry.name]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};