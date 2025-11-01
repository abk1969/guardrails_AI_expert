import React, { useMemo, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useThreatProfile } from '../contexts/ThreatProfileContext';
import { ThreatProfile, ThreatRating } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigation } from '../contexts/NavigationContext';
import { PlusCircle, Trash2, ArrowLeft, Compass, X } from 'lucide-react';

interface ThreatRowProps {
    threat: ThreatProfile;
    onUpdate: (id: string, updatedData: Partial<ThreatProfile>) => void;
    onDelete: (id: string) => void;
    isHighlighted?: boolean;
    threatIndex?: number;
}

const ThreatRow: React.FC<ThreatRowProps> = ({ threat, onUpdate, onDelete, isHighlighted = false, threatIndex }) => {
    const { settings } = useSettings();
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onUpdate(threat.id, { [e.target.name]: e.target.value });
    };

    const ratingColor = useMemo(() => {
        return settings.riskLevels.find(r => r.level === threat.initialRating)?.color.replace(/bg-([a-z]+)-(\d+)\/30/, 'bg-$1-$2/20').replace(/border-([a-z]+)-(\d+)\/50/, 'border-$1-$2/100') || 'border-gray-600 bg-gray-700';
    }, [threat.initialRating, settings.riskLevels]);

    return (
        <tr data-highlighted={isHighlighted} className={`border-b border-gray-700 hover:bg-gray-800/50 transition-all ${
            isHighlighted
                ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-l-cyan-400 ring-2 ring-cyan-500/30'
                : ''
        }`}>
            <td className="px-2 py-2">
                <textarea
                    name="threat"
                    value={threat.threat}
                    onChange={handleInputChange}
                    className="w-full bg-transparent p-1 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={2}
                />
            </td>
            <td className="px-2 py-2">
                <textarea
                    name="note"
                    value={threat.note}
                    onChange={handleInputChange}
                    className="w-full bg-transparent p-1 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={2}
                />
            </td>
            <td className="px-2 py-2">
                <select
                    name="initialRating"
                    value={threat.initialRating}
                    onChange={handleInputChange}
                    className={`w-full p-1 rounded-md focus:ring-1 focus:ring-cyan-500 transition ${ratingColor}`}
                >
                    <option value="">Sélectionner</option>
                    {settings.riskLevels.map(r => (
                        <option key={r.level} value={r.level}>{r.level}</option>
                    ))}
                </select>
            </td>
            <td className="px-2 py-2">
                <textarea
                    name="defenses"
                    value={threat.defenses}
                    onChange={handleInputChange}
                    className="w-full bg-transparent p-1 rounded-md focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 transition"
                    rows={2}
                />
            </td>
            <td className="px-2 py-2 text-center">
                <button
                    onClick={() => onDelete(threat.id)}
                    className="p-2 text-gray-400 hover:text-red-400"
                    aria-label="Supprimer la menace"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};


const ThreatProfileView: React.FC = () => {
    const { threatProfiles, addThreatProfile, updateThreatProfile, deleteThreatProfile } = useThreatProfile();
    const { navigationSource, sourceTitle, filterParams, clearNavigation } = useNavigation();

    // Sort and group profiles with highlighted items first
    const groupedProfiles = useMemo(() => {
        let profiles = [...threatProfiles];

        // Sort to prioritize highlighted threats
        if (filterParams?.highlightIds && filterParams.highlightIds.length > 0) {
            profiles = profiles.sort((a, b) => {
                const aIndex = threatProfiles.indexOf(a);
                const bIndex = threatProfiles.indexOf(b);
                const aHighlighted = filterParams.highlightIds!.includes(String(aIndex));
                const bHighlighted = filterParams.highlightIds!.includes(String(bIndex));
                return aHighlighted === bHighlighted ? 0 : aHighlighted ? -1 : 1;
            });
        }

        return profiles.reduce((acc, current) => {
            (acc[current.profile] = acc[current.profile] || []).push(current);
            return acc;
        }, {} as Record<string, ThreatProfile[]>);
    }, [threatProfiles, filterParams]);

    const profileOrder = ['Profile 1: External Adversary', 'Profile 2: Model Deployer', 'Profile 3: Model Provider'];
    const sortedProfileKeys = Object.keys(groupedProfiles).sort((a, b) => {
        const indexA = profileOrder.indexOf(a);
        const indexB = profileOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette menace ?")) {
            deleteThreatProfile(id);
        }
    };

    // Auto-scroll to first highlighted item
    useEffect(() => {
        if (filterParams?.highlightIds && filterParams.highlightIds.length > 0) {
            // Wait for DOM to render
            setTimeout(() => {
                const firstHighlighted = document.querySelector('[data-highlighted="true"]');
                if (firstHighlighted) {
                    firstHighlighted.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 300);
        }
    }, [filterParams]);

    return (
        <div className="space-y-6">
            {/* Navigation Breadcrumb */}
            {navigationSource && filterParams?.highlightIds && (
                <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-transparent border-l-4 border-l-cyan-400 animate-in slide-in-from-top-4 duration-300 fade-in">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={clearNavigation}
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <Compass className="w-5 h-5" />
                            <span className="font-medium">Retour à OWASP COMPASS</span>
                        </button>
                        <button
                            onClick={clearNavigation}
                            className="p-1 hover:bg-cyan-900/30 rounded transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    {sourceTitle && (
                        <div className="mt-2 text-sm text-gray-300">
                            Navigation depuis: <span className="font-semibold text-cyan-300">{sourceTitle}</span>
                        </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">
                        {filterParams.highlightIds.length} profil(s) de menace lié(s)
                    </div>
                </Card>
            )}

            <header>
                <h2 className="text-2xl font-bold text-white">Profil de Menace Objective</h2>
                <p className="text-gray-400 mt-1">Identifiez et évaluez les menaces pour votre organisation en fonction des différents profils d'acteurs.</p>
            </header>

            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/60 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-1/3">Vecteur d'Attaque / Catégorie de Menace</th>
                                <th scope="col" className="px-4 py-3 w-1/4">Note</th>
                                <th scope="col" className="px-4 py-3">Évaluation Initiale</th>
                                <th scope="col" className="px-4 py-3 w-1/4">Défenses & Mitigations</th>
                                <th scope="col" className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        {sortedProfileKeys.map(profileName => (
                            <tbody key={profileName} className="bg-gray-800">
                                <tr className="bg-gray-700">
                                    <td colSpan={5} className="px-4 py-2 text-white font-bold">
                                        {profileName}
                                    </td>
                                </tr>
                                {groupedProfiles[profileName].map(threat => {
                                    const threatIndex = threatProfiles.indexOf(threat);
                                    const isHighlighted = filterParams?.highlightIds?.includes(String(threatIndex)) || false;
                                    return (
                                        <ThreatRow
                                            key={threat.id}
                                            threat={threat}
                                            onUpdate={updateThreatProfile}
                                            onDelete={handleDelete}
                                            isHighlighted={isHighlighted}
                                            threatIndex={threatIndex}
                                        />
                                    );
                                })}
                                <tr>
                                    <td colSpan={5} className="px-4 py-2">
                                        <Button onClick={() => addThreatProfile(profileName)} variant="secondary" className="text-xs py-1 px-2">
                                            <PlusCircle size={14} className="mr-2" />
                                            Ajouter une menace à "{profileName}"
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        ))}
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ThreatProfileView;