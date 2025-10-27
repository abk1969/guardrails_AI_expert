import React, { useState } from 'react';

interface HeatmapCell {
    timing: string;
    entity: string;
    intent: string;
    value: number;
    percentage: string;
}

interface InteractiveHeatmapProps {
    data: HeatmapCell[];
    onCellClick: (timing: string, entity: string, intent: string) => void;
}

const InteractiveHeatmap: React.FC<InteractiveHeatmapProps> = ({ data, onCellClick }) => {
    const [hoveredCell, setHoveredCell] = useState<string | null>(null);

    const timings = ['Pre-deployment', 'Post-deployment', 'Other'];
    const entities = ['Human', 'AI', 'Other'];
    const intents = ['Intentional', 'Unintentional', 'Other'];

    const getCell = (timing: string, entity: string, intent: string) => {
        return data.find(d => d.timing === timing && d.entity === entity && d.intent === intent);
    };

    const getColorIntensity = (value: number) => {
        if (value === 0 || value < 1) return 'bg-gray-800';
        if (value >= 15) return 'bg-cyan-600';
        if (value >= 10) return 'bg-cyan-700';
        if (value >= 5) return 'bg-cyan-800';
        return 'bg-cyan-900';
    };

    const getCellKey = (timing: string, entity: string, intent: string) =>
        `${timing}-${entity}-${intent}`;

    return (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 overflow-x-auto">
            <h4 className="text-lg font-semibold text-white mb-6">
                Interactive Risk Distribution Heatmap
                <span className="ml-3 text-xs text-gray-400">(Click cells to filter database)</span>
            </h4>

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-3 text-left text-cyan-400 font-semibold border-b-2 border-gray-700">Timing</th>
                        <th className="p-3 text-left text-cyan-400 font-semibold border-b-2 border-gray-700">Entity</th>
                        {intents.map(intent => (
                            <th key={intent} className="p-3 text-center text-purple-400 font-semibold border-b-2 border-gray-700">
                                {intent}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timings.map((timing, timingIndex) => (
                        <React.Fragment key={timing}>
                            {entities.map((entity, entityIndex) => {
                                const isFirstInGroup = entityIndex === 0;
                                return (
                                    <tr key={`${timing}-${entity}`} className="border-b border-gray-800">
                                        {isFirstInGroup && (
                                            <td
                                                rowSpan={3}
                                                className="p-3 font-semibold text-yellow-300 border-r border-gray-700 align-top"
                                            >
                                                {timing}
                                            </td>
                                        )}
                                        <td className="p-3 text-gray-300 border-r border-gray-700">{entity}</td>
                                        {intents.map(intent => {
                                            const cell = getCell(timing, entity, intent);
                                            const cellKey = getCellKey(timing, entity, intent);
                                            const isHovered = hoveredCell === cellKey;
                                            const colorClass = cell ? getColorIntensity(cell.value) : 'bg-gray-800';

                                            return (
                                                <td key={intent} className="p-0">
                                                    <button
                                                        onClick={() => cell && cell.value > 0 && onCellClick(timing, entity, intent)}
                                                        onMouseEnter={() => setHoveredCell(cellKey)}
                                                        onMouseLeave={() => setHoveredCell(null)}
                                                        disabled={!cell || cell.value === 0}
                                                        className={`w-full h-full p-4 text-center transition-all duration-300 ${
                                                            cell && cell.value > 0
                                                                ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400 hover:scale-105'
                                                                : 'cursor-not-allowed'
                                                        } ${colorClass} ${
                                                            isHovered ? 'shadow-xl scale-105 z-10 relative' : ''
                                                        }`}
                                                    >
                                                        <div className="relative">
                                                            <div className={`text-lg font-bold ${
                                                                cell && cell.value >= 10 ? 'text-white' : 'text-gray-300'
                                                            }`}>
                                                                {cell ? cell.percentage : '-'}
                                                            </div>
                                                            {cell && cell.value > 0 && isHovered && (
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 px-3 py-1 rounded text-xs whitespace-nowrap text-white shadow-lg border border-cyan-500">
                                                                    {cell.value} risks - Click to filter
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                            {timingIndex < timings.length - 1 && (
                                <tr className="h-2 bg-gray-800/30">
                                    <td colSpan={5}></td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
                <span className="font-semibold">Color intensity:</span>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-gray-800 rounded"></div>
                    <span>&lt;1%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-cyan-900 rounded"></div>
                    <span>1-5%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-cyan-800 rounded"></div>
                    <span>5-10%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-cyan-700 rounded"></div>
                    <span>10-15%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-cyan-600 rounded"></div>
                    <span>&gt;15%</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveHeatmap;
