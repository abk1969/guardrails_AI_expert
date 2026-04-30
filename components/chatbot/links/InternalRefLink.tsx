import React, { useCallback } from 'react';
import { Link2, BookMarked, Compass, Bot, Database } from 'lucide-react';
import { useNavigation } from '../../../contexts/NavigationContext';
import type { RefKind } from '../../../services/answerEnricher';

interface Props {
  kind: Extract<RefKind, 'sia' | 'compass' | 'agentic' | 'dsgai'>;
  label: string;
  navTo: string;
  anchor?: string;
}

const KIND_STYLES: Record<Props['kind'], { color: string; bg: string; border: string; Icon: React.ElementType; tooltip: string }> = {
  sia: { color: 'text-cyan-300', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20', border: 'border-cyan-500/30', Icon: BookMarked, tooltip: 'PSSI IA v3 — voir la fiche dans Politique IA' },
  compass: { color: 'text-emerald-300', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', border: 'border-emerald-500/30', Icon: Compass, tooltip: 'OWASP COMPASS — voir le scénario' },
  agentic: { color: 'text-orange-300', bg: 'bg-orange-500/10 hover:bg-orange-500/20', border: 'border-orange-500/30', Icon: Bot, tooltip: 'Sécurité Agentique — voir la menace' },
  dsgai: { color: 'text-pink-300', bg: 'bg-pink-500/10 hover:bg-pink-500/20', border: 'border-pink-500/30', Icon: Database, tooltip: 'OWASP GenAI Data Security — voir dans le Wiki' },
};

const InternalRefLink: React.FC<Props> = ({ kind, label, navTo, anchor }) => {
  const { setActiveNav } = useNavigation();
  const style = KIND_STYLES[kind];
  const Icon = style.Icon;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveNav(navTo);
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor) || document.querySelector(`[data-ref-id="${anchor}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  }, [setActiveNav, navTo, anchor]);

  return (
    <button
      type="button"
      onClick={handleClick}
      title={style.tooltip}
      className={`inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md border text-xs font-mono font-semibold transition-colors ${style.color} ${style.bg} ${style.border} cursor-pointer no-underline`}
    >
      <Icon size={11} className="flex-shrink-0" />
      <span>{label}</span>
      <Link2 size={9} className="opacity-60" />
    </button>
  );
};

export default InternalRefLink;
