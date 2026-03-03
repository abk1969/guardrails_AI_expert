import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { ReasoningStep } from '../../types/chatbot';
import ToolCallCard from './ToolCallCard';

interface ReasoningPanelProps {
  steps: ReasoningStep[];
  isProcessing?: boolean;
}

const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ steps, isProcessing }) => {
  const [expanded, setExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const thinkingSteps = steps.filter(s => s.type === 'thinking');
  const toolCalls = steps.filter(s => s.type === 'tool_call');
  const uniqueTools = [...new Set(toolCalls.map(s => s.toolName))];

  return (
    <div className="reasoning-panel">
      <button className="reasoning-toggle" onClick={() => setExpanded(!expanded)}>
        <Brain size={14} className="text-purple-400" />
        <span>
          {thinkingSteps.length} étape{thinkingSteps.length > 1 ? 's' : ''} de raisonnement, {uniqueTools.length} outil{uniqueTools.length > 1 ? 's' : ''} appelé{uniqueTools.length > 1 ? 's' : ''}
        </span>
        {isProcessing && <div className="reasoning-spinner" />}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="reasoning-steps">
          {steps.map(step => (
            <div key={step.id} className={`reasoning-step ${step.type}`}>
              {step.type === 'thinking' && (
                <div className="thinking-step">
                  <Brain size={12} className="text-purple-400" />
                  <span>{step.thought}</span>
                </div>
              )}
              {step.type === 'tool_call' && (
                <ToolCallCard
                  toolName={step.toolName || ''}
                  parameters={step.parameters}
                  result={steps.find(s => s.type === 'tool_result' && s.toolCallId === step.toolCallId)?.result}
                />
              )}
              {step.type === 'error' && (
                <div className="error-step">
                  <AlertCircle size={12} className="text-red-400" />
                  <span>{step.error}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReasoningPanel;
