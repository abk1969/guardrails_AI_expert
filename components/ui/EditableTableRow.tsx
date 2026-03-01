import React, { useState, useCallback } from 'react';
import { Save, X, Edit, Trash2 } from 'lucide-react';
import EditableCell from './EditableCell';

// Column definition for the table
export interface ColumnDef<T> {
  key: keyof T;
  label?: string;
  /** Custom render for view mode. Receives the item and returns JSX. */
  renderView?: (item: T) => React.ReactNode;
  /** Custom render for edit mode. Receives value, onChange callback, and the full editState. */
  renderEdit?: (value: T[keyof T], onChange: (val: string) => void, editState: T) => React.ReactNode;
  /** Input type for default edit cell (text, number) */
  inputType?: string;
  /** Number of textarea rows (renders textarea instead of input if set) */
  rows?: number;
  /** Min width CSS class */
  minWidth?: string;
}

interface EditableTableRowProps<T extends { id: string }> {
  item: T;
  columns: ColumnDef<T>[];
  onUpdate: (id: string, data: Partial<Omit<T, 'id'>>) => void;
  onDelete: (id: string) => void;
  /** If true, all cells are always editable (no edit/save toggle) */
  alwaysEditable?: boolean;
  /** Highlight style (e.g. for COMPASS navigation) */
  isHighlighted?: boolean;
  /** Custom row className */
  rowClassName?: string;
  /** Confirmation message before delete. Set false to skip confirmation. */
  confirmDelete?: string | false;
  /** Custom className for the action cell <td> (e.g. sticky positioning) */
  actionCellClassName?: string;
  /** Custom className for the action buttons container <div> */
  actionContainerClassName?: string;
}

function EditableTableRow<T extends { id: string }>({
  item,
  columns,
  onUpdate,
  onDelete,
  alwaysEditable = false,
  isHighlighted = false,
  rowClassName = '',
  confirmDelete = 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  actionCellClassName = '',
  actionContainerClassName = '',
}: EditableTableRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<T>(item);

  // Sync editState when item changes externally (e.g. after context update in always-editable mode)
  // We only do this for alwaysEditable since edit-mode rows manage their own buffer
  const handleFieldChange = useCallback((field: keyof T, value: string) => {
    if (alwaysEditable) {
      onUpdate(item.id, { [field]: value } as Partial<Omit<T, 'id'>>);
    } else {
      setEditState(prev => ({ ...prev, [field]: value }));
    }
  }, [alwaysEditable, item.id, onUpdate]);

  const handleSave = useCallback(() => {
    const { id, ...data } = editState;
    onUpdate(id, data as Partial<Omit<T, 'id'>>);
    setIsEditing(false);
  }, [editState, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditState(item);
    setIsEditing(false);
  }, [item]);

  const handleDelete = useCallback(() => {
    if (confirmDelete === false || window.confirm(confirmDelete)) {
      onDelete(item.id);
    }
  }, [confirmDelete, item.id, onDelete]);

  const handleStartEdit = useCallback(() => {
    setEditState(item);
    setIsEditing(true);
  }, [item]);

  const showEdit = alwaysEditable || isEditing;

  const highlightClass = isHighlighted
    ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-l-cyan-400 ring-2 ring-cyan-500/30'
    : '';

  return (
    <tr
      data-highlighted={isHighlighted}
      className={`border-b border-gray-700 hover:bg-gray-800/50 transition-all ${highlightClass} ${rowClassName}`}
    >
      {columns.map((col) => {
        const value = showEdit ? (alwaysEditable ? item[col.key] : editState[col.key]) : item[col.key];

        if (showEdit) {
          // Edit mode cell
          return (
            <td key={String(col.key)} className={`px-2 py-1 align-top ${col.minWidth || ''}`}>
              {col.renderEdit ? (
                col.renderEdit(
                  alwaysEditable ? item[col.key] : editState[col.key],
                  (val) => handleFieldChange(col.key, val),
                  alwaysEditable ? item : editState
                )
              ) : (
                <EditableCell
                  value={String(value ?? '')}
                  onChange={(val) => handleFieldChange(col.key, val)}
                  type={col.inputType || 'text'}
                  rows={col.rows}
                />
              )}
            </td>
          );
        }

        // View mode cell
        return (
          <td key={String(col.key)} className={`px-3 py-2 align-top ${col.minWidth || ''}`}>
            {col.renderView ? col.renderView(item) : <span>{String(value ?? '')}</span>}
          </td>
        );
      })}

      {/* Action buttons */}
      <td className={`px-3 py-2 align-top ${actionCellClassName}`}>
        <div className={actionContainerClassName || "flex justify-center space-x-2"}>
          {alwaysEditable ? (
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer">
              <Trash2 size={16} />
            </button>
          ) : isEditing ? (
            <>
              <button onClick={handleSave} className="p-2 text-green-400 hover:text-green-300" aria-label="Sauvegarder">
                <Save size={16} />
              </button>
              <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-white" aria-label="Annuler">
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleStartEdit} className="p-2 text-gray-400 hover:text-cyan-400" aria-label="Modifier">
                <Edit size={16} />
              </button>
              <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400" aria-label="Supprimer">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default EditableTableRow;
