
import React from 'react';

interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-gray-700 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
