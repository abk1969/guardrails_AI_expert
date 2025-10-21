import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from './ui/Card';
import { WIKI_SECTIONS } from '../data/wikiContent';
import { Search } from 'lucide-react';

const WikiRedTeamerView: React.FC = () => {
    const [activeSectionId, setActiveSectionId] = useState<string>(WIKI_SECTIONS[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    const activeSection = useMemo(() => WIKI_SECTIONS.find(s => s.id === activeSectionId), [activeSectionId]);
    
    // Scroll to section when activeSectionId changes
    useEffect(() => {
        const element = document.getElementById(activeSectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeSectionId]);

    const handleNavClick = (id: string) => {
        setSearchTerm(''); // Clear search on nav click
        setActiveSectionId(id);
    };

    return (
        <div className="flex h-full">
            {/* Left Sidebar for Navigation */}
            <aside className="w-1/4 h-full pr-8 border-r border-gray-700 overflow-y-auto wiki-sidebar">
                <nav className="sticky top-0 p-4 bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-white mb-4">Sections du Guide</h2>
                     <div className="relative mb-4">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher dans le guide..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </nav>
                <ul className="space-y-1 px-4">
                    {WIKI_SECTIONS.map(section => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                onClick={(e) => { e.preventDefault(); handleNavClick(section.id); }}
                                className={`flex items-center p-2 rounded-md transition-colors ${activeSectionId === section.id && !searchTerm ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                                {section.icon}
                                <span className="ml-3 font-medium">{section.title}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Right Content Area */}
            <main ref={contentRef} className="w-3/4 h-full pl-8 overflow-y-auto">
                {searchTerm ? (
                     <Card>
                        <h2 className="text-2xl font-bold text-white mb-4">Résultats de recherche pour "{searchTerm}"</h2>
                        {WIKI_SECTIONS.map(section => React.cloneElement(section.content as React.ReactElement, { searchTerm }))}
                    </Card>
                ) : (
                    <div className="space-y-12">
                         {WIKI_SECTIONS.map(section => (
                            <section key={section.id} id={section.id}>
                                {section.content}
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WikiRedTeamerView;
