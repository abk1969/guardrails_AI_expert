import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
            <Languages size={18} className="text-gray-400 ml-2" />
            <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    language === 'fr'
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
                FR
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    language === 'en'
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
