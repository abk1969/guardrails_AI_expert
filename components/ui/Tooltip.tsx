
import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode | string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-gray-900 border border-gray-600 text-white text-sm rounded-lg shadow-lg z-[60]"
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;