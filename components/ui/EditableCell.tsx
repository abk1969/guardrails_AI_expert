import React from 'react';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  rows?: number;
  className?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onChange, type = 'text', rows, className = '' }) => {
  const baseClass = `w-full h-full bg-gray-900 border-cyan-500 border p-1 rounded-md text-white focus:ring-1 focus:ring-cyan-400 focus:outline-none ${className}`;

  if (rows) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
        rows={rows}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={baseClass}
    />
  );
};

export default EditableCell;
