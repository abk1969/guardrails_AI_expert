import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useUseCase } from '../contexts/UseCaseContext';
import { UseCase } from '../types';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import UseCaseFormModal from './UseCaseFormModal';
import { useSettings } from '../contexts/SettingsContext';

const RiskScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const { settings } = useSettings();
    
    const riskLevel = settings.riskLevels.find(rl => score >= rl.range[0] && score <= rl.range[1]);
    const colorClass = riskLevel ? riskLevel.color : 'bg-gray-500/30 text-gray-300 border-gray-500/50';

    return (
        <span className={`px-2.5 py-1 text-sm font-bold rounded-full border ${colorClass}`}>
            {score}
        </span>
    );
};

const UseCasesView: React.FC = () => {
    const { useCases, deleteUseCase } = useUseCase();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUseCase, setEditingUseCase] = useState<UseCase | null>(null);

    const handleAddNew = () => {
        setEditingUseCase(null);
        setIsModalOpen(true);
    };

    const handleEdit = (useCase: UseCase) => {
        setEditingUseCase(useCase);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cas d'usage ? Cette action est irréversible.")) {
            deleteUseCase(id);
        }
    };
    
    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Matrice des Risques d'Usage de l'IA</h2>
                    <p className="text-gray-400 mt-1">Évaluez et gérez les risques potentiels liés aux cas d'usage des modèles de langage.</p>
                </div>
                 <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
                    <PlusCircle size={18} className="mr-2" />
                    Ajouter un Cas d'Usage
                </Button>
            </header>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 min-w-[250px]">Use Case</th>
                                <th scope="col" className="px-6 py-3 text-center">Impact</th>
                                <th scope="col" className="px-6 py-3 text-center">Likelihood</th>
                                <th scope="col" className="px-6 py-3 text-center">Risk Score</th>
                                <th scope="col" className="px-6 py-3 min-w-[250px]">Recommendation</th>
                                <th scope="col" className="px-6 py-3 min-w-[250px]">Associated Threat</th>
                                <th scope="col" className="px-6 py-3 min-w-[250px]">Mapping</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {useCases.map(uc => (
                                <tr key={uc.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{uc.useCase}</td>
                                    <td className="px-6 py-4 text-center">{uc.impact}</td>
                                    <td className="px-6 py-4 text-center">{uc.likelihood}</td>
                                    <td className="px-6 py-4 text-center"><RiskScoreBadge score={uc.riskScore} /></td>
                                    <td className="px-6 py-4">{uc.recommendation}</td>
                                    <td className="px-6 py-4">{uc.associatedThreat}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{uc.mapping}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleEdit(uc)} className="p-2 text-gray-400 hover:text-cyan-400" aria-label="Modifier"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(uc.id)} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <UseCaseFormModal
                    useCase={editingUseCase}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default UseCasesView;