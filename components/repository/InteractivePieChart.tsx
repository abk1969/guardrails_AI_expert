import React, { useState } from 'react';

interface PieChartProps {
    data: { label: string; value: number; percentage: string; color: string }[];
    title: string;
    onSliceClick: (label: string) => void;
}

const InteractivePieChart: React.FC<PieChartProps> = ({ data, title, onSliceClick }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;

    // Map Tailwind class names to actual color values for SVG
    const getColorValue = (colorClass: string): string => {
        const colorMap: Record<string, string> = {
            'bg-cyan-600': '#0891b2',
            'bg-purple-600': '#9333ea',
            'bg-gray-600': '#4b5563',
            'bg-yellow-600': '#ca8a04',
            'bg-red-600': '#dc2626',
            'bg-green-600': '#16a34a',
            'bg-blue-600': '#2563eb',
        };
        return colorMap[colorClass] || '#6b7280'; // Default to gray
    };

    const createArc = (startAngle: number, endAngle: number, radius: number) => {
        const start = polarToCartesian(radius, startAngle);
        const end = polarToCartesian(radius, endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return [
            `M ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            `L 0 0`,
            'Z'
        ].join(' ');
    };

    const polarToCartesian = (radius: number, angle: number) => {
        const angleInRadians = ((angle - 90) * Math.PI) / 180;
        return {
            x: radius * Math.cos(angleInRadians),
            y: radius * Math.sin(angleInRadians)
        };
    };

    return (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-6">{title}</h4>

            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* SVG Pie Chart */}
                <div className="relative">
                    <svg width="280" height="280" viewBox="-140 -140 280 280" className="transform -rotate-90">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const sliceAngle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + sliceAngle;
                            currentAngle = endAngle;

                            const isHovered = hoveredIndex === index;
                            const radius = isHovered ? 125 : 120;

                            return (
                                <g key={item.label}>
                                    <path
                                        d={createArc(startAngle, endAngle, radius)}
                                        fill={getColorValue(item.color)}
                                        fillOpacity={isHovered ? 1 : 0.85}
                                        stroke={isHovered ? '#fff' : 'none'}
                                        strokeWidth={isHovered ? 2 : 0}
                                        className="cursor-pointer transition-all duration-300"
                                        style={{
                                            filter: isHovered ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={() => onSliceClick(item.label)}
                                    />
                                    {isHovered && (
                                        <text
                                            x="0"
                                            y="0"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="white"
                                            fontSize="24"
                                            fontWeight="bold"
                                            style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
                                        >
                                            {item.percentage}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                    {data.map((item, index) => {
                        const isHovered = hoveredIndex === index;
                        return (
                            <button
                                key={item.label}
                                onClick={() => onSliceClick(item.label)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                                    isHovered
                                        ? 'bg-gray-700 shadow-lg scale-105'
                                        : 'bg-gray-800/50 hover:bg-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                                    <span className="text-gray-200 font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400 text-sm">{item.value} risks</span>
                                    <span className="text-cyan-400 font-bold">{item.percentage}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InteractivePieChart;
