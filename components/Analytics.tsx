
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Card from './ui/Card';
import { MOCK_HISTORICAL_DATA } from '../constants';
import { GUARDRAIL_CATEGORIES } from '../constants';

const COLORS = ['#06b6d4', '#14b8a6', '#84cc16', '#f97316', '#ef4444'];

const Analytics: React.FC = () => {
  const latestData = MOCK_HISTORICAL_DATA[MOCK_HISTORICAL_DATA.length - 1];

  const categoryScores = [
    { name: GUARDRAIL_CATEGORIES[0].name, score: latestData.security },
    { name: GUARDRAIL_CATEGORIES[1].name, score: latestData.relevance },
    { name: GUARDRAIL_CATEGORIES[2].name, score: latestData.linguistic },
    { name: GUARDRAIL_CATEGORIES[3].name, score: latestData.content },
    { name: GUARDRAIL_CATEGORIES[4].name, score: latestData.logic },
  ];

  const passFailData = [
    { name: 'Tests Passés', value: 450 },
    { name: 'Tests Échoués', value: 50 },
  ];
  const PIE_COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Score de Conformité Global</h3>
          <p className="text-4xl font-bold text-white">{latestData.overallScore}%</p>
          <p className="text-sm text-green-400">+2% depuis hier</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Tests (24h)</h3>
          <p className="text-4xl font-bold text-white">1,250</p>
           <p className="text-sm text-gray-400">sur 3 modèles</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Violations Critiques (24h)</h3>
          <p className="text-4xl font-bold text-red-500">12</p>
          <p className="text-sm text-gray-400">Principalement 'Injection de Prompt'</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white mb-6">Évolution du Score Global</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={MOCK_HISTORICAL_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[70, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Legend />
            <Line type="monotone" dataKey="overallScore" name="Score Global" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-bold text-white mb-6">Scores par Catégorie de Guardrail</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryScores} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={150} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="score" name="Score" barSize={20}>
                {categoryScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-xl font-bold text-white mb-6">Distribution des Résultats</h3>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={passFailData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {passFailData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
