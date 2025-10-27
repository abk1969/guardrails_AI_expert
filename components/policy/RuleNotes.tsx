import React, { useState } from 'react';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { MessageSquare, Save, X, Edit2 } from 'lucide-react';

interface RuleNotesProps {
  ruleId: string;
  initialNotes: string;
  onSave: (notes: string) => void;
}

export const RuleNotes: React.FC<RuleNotesProps> = ({ ruleId, initialNotes, onSave }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [tempNotes, setTempNotes] = useState(initialNotes);

  const handleSave = () => {
    setNotes(tempNotes);
    onSave(tempNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <MessageSquare size={16} className="text-cyan-400" />
          Notes et commentaires
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
          >
            <Edit2 size={12} />
            {notes ? 'Modifier' : 'Ajouter'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={tempNotes}
            onChange={e => setTempNotes(e.target.value)}
            placeholder="Ajoutez vos notes, commentaires, ou plan d'implémentation pour cette règle..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} variant="primary" className="flex-1">
              <Save size={14} className="mr-1" />
              Enregistrer
            </Button>
            <Button onClick={handleCancel} variant="secondary" className="flex-1">
              <X size={14} className="mr-1" />
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {notes ? (
            <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap border border-gray-700">
              {notes}
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-lg p-3 text-sm text-gray-500 italic border border-gray-700/50">
              Aucune note ajoutée pour cette règle
            </div>
          )}
        </div>
      )}
    </div>
  );
};
