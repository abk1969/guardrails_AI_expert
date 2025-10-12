import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useKnownIncidents } from '../contexts/KnownIncidentsContext';
import { KnownAIIncident, ResourceLink, ResourceLinkCategory } from '../types';
import { RESOURCE_LINK_CATEGORIES } from '../constants';
import { PlusCircle, Trash2, Edit, Save, X, Link as LinkIcon } from 'lucide-react';

// Editable Row for Incidents Table
const IncidentRow: React.FC<{ incident: KnownAIIncident }> = ({ incident }) => {
    const { updateIncident, deleteIncident } = useKnownIncidents();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState(incident);

    const handleUpdate = (field: keyof Omit<KnownAIIncident, 'id'>, value: string) => {
        setEditState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        updateIncident(incident.id, editState);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditState(incident);
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet incident ?")) {
            deleteIncident(incident.id);
        }
    }

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            {isEditing ? (
                <>
                    <td className="px-2 py-1"><textarea rows={2} value={editState.incident} onChange={e => handleUpdate('incident', e.target.value)} className="w-full bg-gray-900 p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400" /></td>
                    <td className="px-2 py-1"><input type="text" value={editState.vulnerability} onChange={e => handleUpdate('vulnerability', e.target.value)} className="w-full bg-gray-900 p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400" /></td>
                    <td className="px-2 py-1"><input type="text" value={editState.impact} onChange={e => handleUpdate('impact', e.target.value)} className="w-full bg-gray-900 p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400" /></td>
                    <td className="px-2 py-1"><input type="url" value={editState.referenceUrl} onChange={e => handleUpdate('referenceUrl', e.target.value)} className="w-full bg-gray-900 p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400" /></td>
                </>
            ) : (
                <>
                    <td className="px-4 py-3 font-medium text-white">{incident.incident}</td>
                    <td className="px-4 py-3">{incident.vulnerability}</td>
                    <td className="px-4 py-3">{incident.impact}</td>
                    <td className="px-4 py-3">
                        <a href={incident.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center">
                            Link <LinkIcon size={12} className="ml-1" />
                        </a>
                    </td>
                </>
            )}
            <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="p-2 text-green-400 hover:text-green-300" aria-label="Sauvegarder"><Save size={16} /></button>
                            <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-white" aria-label="Annuler"><X size={16} /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-cyan-400" aria-label="Modifier"><Edit size={16} /></button>
                            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer"><Trash2 size={16} /></button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

// Editable Item for Resource Links
const ResourceLinkItem: React.FC<{ link: ResourceLink }> = ({ link }) => {
    const { updateResourceLink, deleteResourceLink } = useKnownIncidents();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({ text: link.text, url: link.url });

    const handleSave = () => {
        updateResourceLink(link.id, editState);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lien ?")) {
            deleteResourceLink(link.id);
        }
    };
    
    return (
        <li className="group flex items-center justify-between text-cyan-400 py-1">
            {isEditing ? (
                <div className="flex-grow flex items-center space-x-2 mr-2">
                    <input type="text" value={editState.text} onChange={e => setEditState(p => ({...p, text: e.target.value}))} className="w-1/2 bg-gray-900 p-1 rounded-md" />
                    <input type="url" value={editState.url} onChange={e => setEditState(p => ({...p, url: e.target.value}))} className="w-1/2 bg-gray-900 p-1 rounded-md" />
                </div>
            ) : (
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate" title={link.text}>
                    {link.text}
                </a>
            )}
             <div className="flex items-center space-x-2 pl-2">
                {isEditing ? (
                     <>
                        <button onClick={handleSave} className="text-green-400 hover:text-green-300" aria-label="Sauvegarder"><Save size={14} /></button>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white" aria-label="Annuler"><X size={14} /></button>
                     </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100" aria-label="Modifier"><Edit size={14} /></button>
                        <button onClick={handleDelete} className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100" aria-label="Supprimer"><Trash2 size={14} /></button>
                    </>
                )}
            </div>
        </li>
    )
}

const KnownIncidentsView: React.FC = () => {
    const { incidents, resourceLinks, addIncident, addResourceLink } = useKnownIncidents();

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">3b: Orient Known AI Incidents</h2>
                <p className="text-gray-400 mt-1">
                    Utilisez l'onglet "Orient Incident" pour rechercher les incidents IA et les coûts d'impact si disponibles. Mettez à jour le tableau existant d'exemples d'incidents/impacts avec des informations objectives pertinentes en utilisant les liens vers les rapports, les bases de données d'incidents, les informations légales et réglementaires.
                </p>
            </header>
            
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Incidents IA Connus</h3>
                    <Button onClick={addIncident} variant="secondary">
                        <PlusCircle size={18} className="mr-2" />
                        Ajouter un Incident
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-1/3">Incident</th>
                                <th scope="col" className="px-4 py-3">Vulnérabilité</th>
                                <th scope="col" className="px-4 py-3">Impact</th>
                                <th scope="col" className="px-4 py-3">Référence</th>
                                <th scope="col" className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map(incident => (
                                <IncidentRow key={incident.id} incident={incident} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {RESOURCE_LINK_CATEGORIES.map(category => (
                    <Card key={category.id}>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                            <Button onClick={() => addResourceLink(category.id)} variant="secondary" className="text-xs py-1 px-2">
                                <PlusCircle size={14} />
                            </Button>
                        </div>
                         <ul className="space-y-1 text-sm">
                           {resourceLinks.filter(link => link.category === category.id).map(link => (
                               <ResourceLinkItem key={link.id} link={link} />
                           ))}
                        </ul>
                    </Card>
                ))}
            </div>

        </div>
    );
};

export default KnownIncidentsView;