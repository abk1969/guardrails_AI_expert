import React, { useState, useRef, useLayoutEffect } from 'react';
import { ExternalLink, BookOpen, AlertTriangle, Scale } from 'lucide-react';
import type { ReferentielEntry } from '../../../data/referentielUrls';

interface Props {
  label: string;
  href?: string;
  meta?: ReferentielEntry;
  type?: 'referentiel' | 'owasp-llm' | 'owasp-aisvs' | 'mitre-atlas';
}

const TYPE_STYLES = {
  referentiel: { color: 'text-purple-300', bg: 'bg-purple-500/10 hover:bg-purple-500/20', border: 'border-purple-500/30', Icon: Scale },
  'owasp-llm': { color: 'text-rose-300', bg: 'bg-rose-500/10 hover:bg-rose-500/20', border: 'border-rose-500/30', Icon: BookOpen },
  'owasp-aisvs': { color: 'text-rose-300', bg: 'bg-rose-500/10 hover:bg-rose-500/20', border: 'border-rose-500/30', Icon: BookOpen },
  'mitre-atlas': { color: 'text-amber-300', bg: 'bg-amber-500/10 hover:bg-amber-500/20', border: 'border-amber-500/30', Icon: AlertTriangle },
};

const ReferentielLink: React.FC<Props> = ({ label, href, meta, type = 'referentiel' }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number; placeAbove: boolean } | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const style = TYPE_STYLES[type];
  const Icon = style.Icon;

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const tipHeight = tooltipRef.current?.offsetHeight || 120;
    const placeAbove = rect.top > tipHeight + 16;
    setCoords({
      left: Math.max(8, Math.min(window.innerWidth - 320, rect.left)),
      top: placeAbove ? rect.top - tipHeight - 8 : rect.bottom + 8,
      placeAbove,
    });
  }, [open]);

  if (!href) {
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md border text-xs font-mono ${style.color} ${style.bg} ${style.border}`}>{label}</span>;
  }

  return (
    <span className="relative inline-block">
      <a
        ref={anchorRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => meta && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => meta && setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md border text-xs font-mono font-semibold transition-colors no-underline ${style.color} ${style.bg} ${style.border}`}
      >
        <Icon size={11} className="flex-shrink-0" />
        <span>{label}</span>
        <ExternalLink size={9} className="opacity-60" />
      </a>
      {open && meta && coords && (
        <div
          ref={tooltipRef}
          style={{ position: 'fixed', left: coords.left, top: coords.top, zIndex: 9999 }}
          className="w-80 p-3 rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-sm shadow-2xl text-xs text-gray-200 pointer-events-none"
        >
          <p className="font-semibold text-white mb-1">{meta.fullName}</p>
          {meta.description && <p className="text-gray-400 mb-2 leading-relaxed">{meta.description}</p>}
          {meta.sanction && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 mt-2">
              <AlertTriangle size={11} />
              <span className="font-medium">Sanction : {meta.sanction}</span>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-700 text-cyan-400 break-all opacity-80">{meta.url}</div>
        </div>
      )}
    </span>
  );
};

export default ReferentielLink;
