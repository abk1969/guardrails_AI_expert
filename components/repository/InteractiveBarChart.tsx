import React, { useState } from 'react';
import { useAIRiskRepository } from '../../contexts/AIRiskRepositoryContext';

interface BarChartProps {
    data: { label: string; value: number; percentage: string; color: string }[];
    title: string;
    onBarClick: (label: string) => void;
}

const InteractiveBarChart: React.FC<BarChartProps> = ({ data, title, onBarClick }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-6">{title}</h4>
            <div className="space-y-4">
                {data.map((item, index) => {
                    const widthPercentage = (item.value / maxValue) * 100;
                    const isHovered = hoveredIndex === index;

                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-300 font-medium">{item.label}</span>
                                <span className="text-gray-400">{item.value} risks ({item.percentage})</span>
                            </div>
                            <button
                                onClick={() => onBarClick(item.label)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="w-full group"
                            >
                                <div className="relative h-10 bg-gray-800 rounded-lg overflow-hidden">
                                    <div
                                        className={`h-full rounded-lg transition-all duration-500 ease-out ${item.color} ${
                                            isHovered ? 'opacity-100 shadow-lg' : 'opacity-80'
                                        }`}
                                        style={{ width: `${widthPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center px-3">
                                            <span className={`text-sm font-semibold transition-opacity ${
                                                isHovered ? 'opacity-100' : 'opacity-0'
                                            } text-white`}>
                                                Click to filter database →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InteractiveBarChart;
