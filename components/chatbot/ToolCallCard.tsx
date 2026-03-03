import React, { useState } from 'react';
import { Wrench, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface ToolCallCardProps {
  toolName: string;
  parameters?: Record<string, any>;
  result?: any;
  toolCallId?: string;
  isLoading?: boolean;
}

const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolName, parameters, result, isLoading }) => {
  const [expanded, setExpanded] = useState(false);

  // Friendly tool name mapping
  const friendlyName = toolName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const hasResult = result !== undefined && result !== null;
  const isError = hasResult && result?.error;

  return (
    <div className="tool-call-card">
      <div className="tool-call-header" onClick={() => setExpanded(!expanded)}>
        <div className="tool-call-icon">
          {isLoading ? (
            <div className="tool-spinner" />
          ) : isError ? (
            <AlertCircle size={14} className="text-red-400" />
          ) : hasResult ? (
            <CheckCircle size={14} className="text-green-400" />
          ) : (
            <Wrench size={14} className="text-cyan-400" />
          )}
        </div>
        <span className="tool-call-name">{friendlyName}</span>
        {parameters && Object.keys(parameters).length > 0 && (
          <span className="tool-call-params">
            ({Object.entries(parameters).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')})
          </span>
        )}
        <button className="tool-call-expand">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {expanded && hasResult && (
        <div className={`tool-call-result ${isError ? 'error' : ''}`}>
          <pre>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ToolCallCard;
