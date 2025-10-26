import React, { useState } from 'react';
import { AIPolicyRule, AIPolicyRuleStatus } from '../../types';
import { useAIPolicy } from '../../contexts/AIPolicyContext';
import { AI_POLICY_STATUS_OPTIONS, AI_POLICY_STATUS_COLORS } from '../../constants';
import { Edit, Save, X, ShieldAlert, AlertTriangle, Settings, ClipboardCheck, BrainCircuit, UserX, Target, Activity, Eye, ShieldOff, Banknote, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import Accordion from '../ui/Accordion';

const PolicyRule: React.FC<{ rule: AIPolicyRule }> = ({ rule }) => {
    const { updateRule } = useAIPolicy();
    const [isEditing, setIsEditing] = useState(false);
    
    // Editable state
    const [notes, setNotes] = useState(rule.notes);
    const [status, setStatus] = useState(rule.status);
    const [associatedThreat, setAssociatedThreat] = useState(rule.associatedThreat || '');
    const [associatedRisk, setAssociatedRisk] = useState(rule.associatedRisk || '');
    const [implementationGuide, setImplementationGuide] = useState(rule.implementationGuide || '');
    const [testingGuide, setTestingGuide] = useState(rule.testingGuide || '');


    const handleSave = () => {
        updateRule(rule.id, { 
            notes, 
            status,
            associatedThreat,
            associatedRisk,
            implementationGuide,
            testingGuide
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setNotes(rule.notes);
        setStatus(rule.status);
        setAssociatedThreat(rule.associatedThreat || '');
        setAssociatedRisk(rule.associatedRisk || '');
        setImplementationGuide(rule.implementationGuide || '');
        setTestingGuide(rule.testingGuide || '');
        setIsEditing(false);
    };

    const statusColor = AI_POLICY_STATUS_COLORS[status];
    
    const GRCAnalysisSection: React.FC<{ label: string; content: string; icon: React.ReactNode; isEditing: boolean; onChange: (value: string) => void; placeholder: string; }> = ({ label, content, icon, isEditing, onChange, placeholder }) => (
        <div>
            <h5 className="flex items-center text-sm font-semibold text-cyan-300 mb-2">
                {icon}
                <span className="ml-2">{label}</span>
            </h5>
            {isEditing ? (
                 <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-gray-700 p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition text-sm text-white"
                    rows={4}
                />
            ) : (
                <div className="p-2 bg-gray-900/50 rounded-md min-h-[40px] text-sm text-gray-300 whitespace-pre-wrap">
                    {content || <span className="text-gray-500 italic">Non défini</span>}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-4">
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-mono text-cyan-400 bg-gray-900 px-2 py-1 rounded">{rule.reference}</span>
                    <p className="font-semibold text-white mt-2">{rule.ruleText}</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="secondary" className="py-1 px-2 text-xs">
                        <Edit size={14} className="mr-2" /> Modifier
                    </Button>
                )}
            </div>

            {rule.implementationDetails && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-300 font-medium">Détails d'implémentation :</p>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">{rule.implementationDetails}</p>
                </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Statut</label>
                        {isEditing ? (
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as AIPolicyRuleStatus)}
                                className={`w-full p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition border text-sm font-semibold ${statusColor}`}
                            >
                                {AI_POLICY_STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt} className="bg-gray-800 text-white font-semibold">{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <div className={`p-2 rounded-md text-sm font-semibold border ${statusColor}`}>
                                {status}
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Notes d'implémentation</label>
                        {isEditing ? (
                             <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajouter des notes sur l'implémentation, les contrôles associés, les propriétaires..."
                                className="w-full bg-gray-700 p-2 rounded-md focus:ring-1 focus:ring-cyan-500 transition text-sm text-white"
                                rows={4}
                            />
                        ) : (
                            <div className="p-2 bg-gray-900/50 rounded-md min-h-[40px] text-sm text-gray-300 whitespace-pre-wrap">
                                {notes || <span className="text-gray-500 italic">Aucune note</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                <Accordion 
                    title={
                        <div className="flex items-center">
                            <BrainCircuit size={18} className="mr-3 text-cyan-400" />
                            Analyse GRC, Cybersécurité & Scénarios de Risques
                        </div>
                    }
                >
                    <div className="space-y-6">
                        {/* GRC Part */}
                        <div className="pt-2">
                             <h4 className="text-md font-semibold text-white mb-4">Analyse GRC & Cybersécurité</h4>
                             <div className="space-y-4">
                                <GRCAnalysisSection
                                    label="Menace Associée"
                                    content={associatedThreat}
                                    icon={<ShieldAlert size={16} />}
                                    isEditing={isEditing}
                                    onChange={setAssociatedThreat}
                                    placeholder="Ex: Acteur interne non formé, Attaquant externe exploitant une API publique..."
                                />
                                 <GRCAnalysisSection
                                    label="Risque Associé"
                                    content={associatedRisk}
                                    icon={<AlertTriangle size={16} />}
                                    isEditing={isEditing}
                                    onChange={setAssociatedRisk}
                                    placeholder="Ex: Fuite de données PII, génération de contenu illégal, mauvaise décision métier..."
                                />
                                 <GRCAnalysisSection
                                    label="Guide d'Implémentation"
                                    content={implementationGuide}
                                    icon={<Settings size={16} />}
                                    isEditing={isEditing}
                                    onChange={setImplementationGuide}
                                    placeholder="Comment mettre en œuvre cette règle ? Quels modules de l'application utiliser ? Ex: Utiliser 'Profil de Menace' pour identifier les acteurs..."
                                />
                                 <GRCAnalysisSection
                                    label="Guide de Test"
                                    content={testingGuide}
                                    icon={<ClipboardCheck size={16} />}
                                    isEditing={isEditing}
                                    onChange={setTestingGuide}
                                    placeholder="Comment vérifier que la règle est bien implémentée ? Ex: Mener un exercice de 'Préparation aux Incidents', auditer les journaux..."
                                />
                            </div>
                        </div>

                        {/* Risk Scenarios Part */}
                        {rule.riskScenarios && rule.riskScenarios.length > 0 && (
                             <div className="pt-6 border-t border-gray-700">
                                <h4 className="text-md font-semibold text-white mb-4">Scénarios de Risques Associés ({rule.riskScenarios.length})</h4>
                                <div className="space-y-6">
                                    {rule.riskScenarios.map((scenario, index) => (
                                        <div key={index} className="p-4 bg-gray-900/50 border border-gray-600 rounded-md">
                                            <h5 className="font-bold text-white mb-2">{index + 1}. {scenario.title}</h5>
                                            <p className="text-sm text-gray-300 mb-4">{scenario.description}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                                <div>
                                                    <h6 className="flex items-center font-semibold text-gray-400 mb-1"><UserX size={14} className="mr-2" />Acteur de la Menace</h6>
                                                    <p className="text-gray-300">{scenario.threatActor}</p>
                                                </div>
                                                <div>
                                                    <h6 className="flex items-center font-semibold text-gray-400 mb-1"><Target size={14} className="mr-2" />Vecteur d'Attaque / Vulnérabilité</h6>
                                                    <p className="text-gray-300">{scenario.attackVector}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h6 className="flex items-center font-semibold text-green-400 mb-1"><ShieldCheck size={14} className="mr-2" />Mitigation Technique Recommandée</h6>
                                                <p className="text-gray-300 text-sm">{scenario.mitigation}</p>
                                            </div>

                                            <div className="mt-4">
                                                <h6 className="flex items-center font-semibold text-gray-400 mb-2"><Activity size={14} className="mr-2" />Impacts Potentiels</h6>
                                                <div className="text-xs space-y-1 text-gray-300 pl-4">
                                                    {scenario.impact.confidentiality && <p><Eye size={12} className="inline mr-2 text-blue-400" /><strong>Confidentialité:</strong> {scenario.impact.confidentiality}</p>}
                                                    {scenario.impact.integrity && <p><ShieldOff size={12} className="inline mr-2 text-orange-400" /><strong>Intégrité:</strong> {scenario.impact.integrity}</p>}
                                                    {scenario.impact.availability && <p><ShieldOff size={12} className="inline mr-2 text-red-400" /><strong>Disponibilité:</strong> {scenario.impact.availability}</p>}
                                                    {(scenario.impact.financial || scenario.impact.strategic) && <p><Banknote size={12} className="inline mr-2 text-green-400" /><strong>Financier/Stratégique:</strong> {scenario.impact.financial || scenario.impact.strategic}</p>}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-700/50">
                                                <h6 className="font-semibold text-gray-400 mb-2 text-sm">Mappings Référentiels</h6>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {scenario.mappings.owaspLlm && <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{scenario.mappings.owaspLlm}</span>}
                                                    {scenario.mappings.owaspAgentic && <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{scenario.mappings.owaspAgentic}</span>}
                                                    {scenario.mappings.mitreAtlas && <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full">{scenario.mappings.mitreAtlas}</span>}
                                                    {scenario.mappings.nistRmf && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{scenario.mappings.nistRmf}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Accordion>
            </div>

            {isEditing && (
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
                    <Button onClick={handleCancel} variant="secondary" className="text-xs py-1 px-2">
                        <X size={14} className="mr-1" /> Annuler
                    </Button>
                    <Button onClick={handleSave} variant="primary" className="text-xs py-1 px-2">
                        <Save size={14} className="mr-1" /> Sauvegarder
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PolicyRule;