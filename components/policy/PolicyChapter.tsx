import React, { useMemo } from 'react';
import { AIPolicyChapter, AIPolicyContentItem, AIPolicyRule } from '../../types';
import Accordion from '../ui/Accordion';
import PolicyRule from './PolicyRule';

const Highlight: React.FC<{ text: string; highlight?: string }> = ({ text, highlight }) => {
    if (!highlight || !highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
            )}
        </>
    );
};


const renderContentItem = (item: AIPolicyContentItem, index: number, searchTerm?: string) => {
    switch(item.type) {
        case 'paragraph':
            return <p key={index} className="text-gray-400 mb-4"><Highlight text={item.content} highlight={searchTerm} /></p>;
        case 'list':
            return (
                <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-gray-400">
                    {item.items.map((li, i) => <li key={i}><Highlight text={li} highlight={searchTerm} /></li>)}
                </ul>
            );
        case 'rule':
            return <PolicyRule key={item.rule.id} rule={item.rule} />;
        case 'table':
            return (
                <div key={index} className="overflow-x-auto my-4">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                {item.headers.map((header, hIndex) => (
                                    <th key={hIndex} scope="col" className="px-4 py-3">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {item.rows.map((row, rIndex) => (
                                <tr key={rIndex} className="border-b border-gray-700">
                                    {row.map((cell, cIndex) => (
                                        <td key={cIndex} className="px-4 py-3">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        default:
            return null;
    }
}

const PolicyChapter: React.FC<{ chapter: AIPolicyChapter }> = ({ chapter }) => {
    
    const stats = useMemo(() => {
        const rules = chapter.sections.flatMap(s => s.content.filter(c => c.type === 'rule')) as { type: 'rule', rule: AIPolicyRule }[];
        const total = rules.length;
        const implemented = rules.filter(r => r.rule.status === 'Implémentée').length;
        const progress = total > 0 ? (implemented / total) * 100 : 0;
        return { total, implemented, progress };
    }, [chapter]);

    return (
        <Accordion
            title={
                <div className="flex items-center justify-between w-full">
                    <span className="text-xl font-bold">{chapter.title}</span>
                    {stats.total > 0 && (
                        <div className="flex items-center space-x-3 text-sm">
                            <span className="text-gray-400">{stats.implemented} / {stats.total} Impl.</span>
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {chapter.introduction && chapter.introduction.map((p, i) => <p key={i} className="text-gray-400">{p}</p>)}
                
                {chapter.sections.map(section => (
                    <div key={section.id}>
                        <h4 className="text-lg font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-2">{section.title}</h4>
                        <div className="pl-2">
                            {section.content.map((item, index) => renderContentItem(item, index))}
                        </div>
                    </div>
                ))}
            </div>
        </Accordion>
    );
};

export default PolicyChapter;