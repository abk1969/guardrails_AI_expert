import React, { useState, useEffect, useCallback } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { UseCase } from '../types';
import { useUseCase } from '../contexts/UseCaseContext';
import { AlertCircle } from 'lucide-react';

interface UseCaseFormModalProps {
    useCase: UseCase | null;
    onClose: () => void;
}

type FormState = Omit<UseCase, 'id' | 'riskScore'>;
type FormErrors = Partial<Record<keyof FormState, string>>;

const UseCaseFormModal: React.FC<UseCaseFormModalProps> = ({ useCase, onClose }) => {
    const { addUseCase, updateUseCase } = useUseCase();
    
    const [formState, setFormState] = useState<FormState>({
        useCase: useCase?.useCase || '',
        impact: useCase?.impact || 3,
        likelihood: useCase?.likelihood || 3,
        recommendation: useCase?.recommendation || '',
        associatedThreat: useCase?.associatedThreat || '',
        mapping: useCase?.mapping || '',
    });
    
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = useCallback(() => {
        const newErrors: FormErrors = {};
        if (!formState.useCase.trim()) newErrors.useCase = "Le cas d'usage est requis.";
        if (!formState.recommendation.trim()) newErrors.recommendation = "La recommandation est requise.";
        if (!formState.associatedThreat.trim()) newErrors.associatedThreat = "La menace associée est requise.";
        if (!formState.mapping.trim()) newErrors.mapping = "Le mapping est requis.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formState]);
    
    const riskScore = formState.impact * formState.likelihood;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: name === 'impact' || name === 'likelihood' ? parseInt(value, 10) : value,
        }));
    };
    
    const handleSubmit = () => {
        if (!validate()) return;

        if (useCase) { // Editing
            updateUseCase({ ...formState, id: useCase.id, riskScore });
        } else { // Adding
            addUseCase(formState);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={useCase ? "Modifier le Cas d'Usage" : "Ajouter un Cas d'Usage"}
            footer={
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Sauvegarder</Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="useCase" className="block text-sm font-medium text-gray-300 mb-1">Cas d'Usage</label>
                    <textarea id="useCase" name="useCase" value={formState.useCase} onChange={handleChange} rows={2} className="w-full bg-gray-700 rounded-md p-2 text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                    {errors.useCase && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.useCase}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="impact" className="block text-sm font-medium text-gray-300 mb-1">Impact (1-5)</label>
                        <select id="impact" name="impact" value={formState.impact} onChange={handleChange} className="w-full bg-gray-700 rounded-md p-2 text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500">
                            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="likelihood" className="block text-sm font-medium text-gray-300 mb-1">Likelihood (1-5)</label>
                        <select id="likelihood" name="likelihood" value={formState.likelihood} onChange={handleChange} className="w-full bg-gray-700 rounded-md p-2 text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500">
                             {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="riskScore" className="block text-sm font-medium text-gray-300 mb-1">Risk Score</label>
                        <input id="riskScore" name="riskScore" type="number" value={riskScore} disabled className="w-full bg-gray-900 rounded-md p-2 text-white border border-gray-600 font-bold text-center" />
                    </div>
                </div>

                 <div>
                    <label htmlFor="recommendation" className="block text-sm font-medium text-gray-300 mb-1">Recommandation</label>
                    <textarea id="recommendation" name="recommendation" value={formState.recommendation} onChange={handleChange} rows={2} className="w-full bg-gray-700 rounded-md p-2 text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                     {errors.recommendation && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.recommendation}</p>}
                </div>
                 <div>
                    <label htmlFor="associatedThreat" className="block text-sm font-medium text-gray-300 mb-1">Menace Associée</label>
                    <input id="associatedThreat" name="associatedThreat" type="text" value={formState.associatedThreat} onChange={handleChange} className="w-full bg-gray-700 rounded-md p-2 text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                     {errors.associatedThreat && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.associatedThreat}</p>}
                </div>
                 <div>
                    <label htmlFor="mapping" className="block text-sm font-medium text-gray-300 mb-1">Mapping (ATT&CK/ATLAS)</label>
                    <input id="mapping" name="mapping" type="text" value={formState.mapping} onChange={handleChange} className="w-full bg-gray-700 rounded-md p-2 text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500" />
                     {errors.mapping && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.mapping}</p>}
                </div>
            </div>
        </Modal>
    );
};

export default UseCaseFormModal;
