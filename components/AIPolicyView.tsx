import React, { useState, useMemo, useRef } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAIPolicy } from '../contexts/AIPolicyContext';
import { AIPolicyChapter } from '../types';
// FIX: Module '"file:///components/policy/PolicyDashboard"' has no default export.
import { PolicyDashboard } from './policy/PolicyDashboard';
import PolicyChapter from './policy/PolicyChapter';
import { Search, Upload, Download } from 'lucide-react';

const AIPolicyView: React.FC = () => {
    const { policyData, importPolicyData } = useAIPolicy();
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredPolicyData = useMemo(() => {
        if (!searchTerm.trim()) {
            return policyData;
        }
        const lowercasedFilter = searchTerm.toLowerCase();

        return policyData
            .map(chapter => ({
                ...chapter,
                sections: chapter.sections
                    .map(section => ({
                        ...section,
                        content: section.content.filter(item => {
                            if (item.type === 'rule') {
                                return (
                                    item.rule.reference.toLowerCase().includes(lowercasedFilter) ||
                                    item.rule.ruleText.toLowerCase().includes(lowercasedFilter) ||
                                    (item.rule.implementationDetails && item.rule.implementationDetails.toLowerCase().includes(lowercasedFilter))
                                );
                            }
                            if (item.type === 'paragraph') {
                                return item.content.toLowerCase().includes(lowercasedFilter);
                            }
                            return false;
                        }),
                    }))
                    .filter(section => section.title.toLowerCase().includes(lowercasedFilter) || section.content.length > 0),
            }))
            .filter(chapter => chapter.title.toLowerCase().includes(lowercasedFilter) || chapter.sections.length > 0);
    }, [policyData, searchTerm]);
    
    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(policyData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "ai_security_policy.json";
        link.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content === 'string') {
                        const importedData = JSON.parse(content);
                        if (importPolicyData(importedData)) {
                           alert('Importation de la politique réussie !');
                        } else {
                           alert("Échec de l'importation. Le fichier est invalide ou corrompu.");
                        }
                    }
                } catch (error) {
                    alert("Erreur lors de la lecture du fichier. Assurez-vous que c'est un JSON valide.");
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    };


    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">Politique de Sécurité de l'IA (PSSI-IA)</h2>
                <p className="text-gray-400 mt-1">
                    Gérez, adaptez et suivez la mise en œuvre de votre politique de sécurité pour l'intelligence artificielle, basée sur le modèle CLUSIF.
                </p>
            </header>

            <PolicyDashboard policyData={policyData} />
            
             <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-1/2">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une règle, une section ou un mot-clé..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                        <Button onClick={handleImportClick} variant="secondary" className="w-1/2 md:w-auto"><Upload size={16} className="mr-2"/> Importer</Button>
                        <Button onClick={handleExport} variant="secondary" className="w-1/2 md:w-auto"><Download size={16} className="mr-2"/> Exporter</Button>
                    </div>
                </div>
            </Card>


            <div className="space-y-4">
                {filteredPolicyData.length > 0 ? (
                    filteredPolicyData.map(chapter => (
                        <PolicyChapter key={chapter.id} chapter={chapter} />
                    ))
                ) : (
                    <Card className="text-center">
                        <p className="text-gray-400">Aucun résultat trouvé pour "{searchTerm}".</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AIPolicyView;