import React, { useMemo } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { WikiChecklistCategory } from '../../types';
import Accordion from '../ui/Accordion';

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="search-highlight">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};


interface WikiChecklistProps {
    categories: WikiChecklistCategory[];
    searchTerm?: string;
}

const WikiChecklist: React.FC<WikiChecklistProps> = ({ categories, searchTerm = '' }) => {
    const { checkedItems, toggleCheckItem } = useWiki();
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;

        return categories
            .map(category => ({
                ...category,
                sections: category.sections
                    .map(section => ({
                        ...section,
                        items: section.items.filter(item => item.text.toLowerCase().includes(lowercasedSearchTerm)),
                    }))
                    .filter(section => section.items.length > 0),
            }))
            .filter(category => category.sections.length > 0);
    }, [categories, lowercasedSearchTerm]);

    if (filteredCategories.length === 0 && searchTerm) {
        return <p className="text-gray-400 text-center">Aucun élément de checklist ne correspond à votre recherche.</p>;
    }

    return (
        <div className="space-y-4">
            {filteredCategories.map(category => {
                const totalItems = category.sections.reduce((sum, section) => sum + section.items.length, 0);
                const checkedCount = category.sections.reduce((sum, section) => 
                    sum + section.items.filter(item => checkedItems[item.id]).length, 
                0);
                const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
                
                return (
                    <Accordion 
                        key={category.title} 
                        title={
                            <div className="flex items-center justify-between w-full">
                                <Highlight text={category.title} highlight={searchTerm} />
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-400 mr-4">{checkedCount} / {totalItems}</span>
                                    <div className="w-24 bg-gray-700 rounded-full h-1.5">
                                        <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            {category.sections.map(section => (
                                <div key={section.title}>
                                    <h4 className="font-semibold text-cyan-400 mb-2 border-b border-gray-700 pb-1">
                                         <Highlight text={section.title} highlight={searchTerm} />
                                    </h4>
                                    <ul className="space-y-2">
                                        {section.items.map(item => (
                                            <li key={item.id} className="flex items-center wiki-checklist-item">
                                                <input
                                                    type="checkbox"
                                                    id={item.id}
                                                    checked={!!checkedItems[item.id]}
                                                    onChange={() => toggleCheckItem(item.id)}
                                                />
                                                <label htmlFor={item.id} className="ml-3 text-gray-300 cursor-pointer">
                                                     <Highlight text={item.text} highlight={searchTerm} />
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Accordion>
                )
            })}
        </div>
    );
};

export default WikiChecklist;