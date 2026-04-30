import React from 'react';
import { AlertTriangle, KeyRound, Clock, AlertOctagon, WifiOff, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import type { ParsedChatbotError } from '../../services/chatbotErrorParser';

interface Props {
  error: ParsedChatbotError;
  onAction?: (action: 'open-llm-settings' | 'retry' | 'open-docs') => void;
}

const KIND_ICON: Record<ParsedChatbotError['kind'], React.ElementType> = {
  'invalid-api-key': KeyRound,
  'model-not-found': AlertOctagon,
  'rate-limit': Clock,
  'quota-exceeded': AlertOctagon,
  'timeout': Clock,
  'auth': KeyRound,
  'mcp-tool': AlertTriangle,
  'network': WifiOff,
  'unknown': AlertTriangle,
};

const ErrorCard: React.FC<Props> = ({ error, onAction }) => {
  const Icon = KIND_ICON[error.kind] || AlertTriangle;
  const ActionIcon =
    error.cta?.action === 'retry' ? RefreshCw :
    error.cta?.action === 'open-llm-settings' ? Settings :
    ExternalLink;

  return (
    <div
      role="alert"
      style={{
        margin: '4px 0',
        padding: 14,
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderLeft: '3px solid rgb(245, 158, 11)',
        borderRadius: 8,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <Icon size={20} style={{ flexShrink: 0, color: 'rgb(252, 211, 77)', marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'rgb(252, 211, 77)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          {error.title}
        </div>
        <div style={{ color: 'rgb(229, 231, 235)', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' }}>
          {error.detail}
        </div>
        {error.cta && onAction && (
          <button
            type="button"
            onClick={() => onAction(error.cta!.action)}
            style={{
              marginTop: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'rgba(34, 211, 238, 0.15)',
              border: '1px solid rgba(34, 211, 238, 0.4)',
              color: 'rgb(165, 243, 252)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34, 211, 238, 0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34, 211, 238, 0.15)')}
          >
            <ActionIcon size={13} />
            {error.cta.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorCard;
