import React from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

interface Props {
  href: string;
  children: React.ReactNode;
}

function shorten(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 30 ? u.pathname.slice(0, 27) + '…' : u.pathname;
    return u.host + (path !== '/' ? path : '');
  } catch {
    return url;
  }
}

const ExternalUrlLink: React.FC<Props> = ({ href, children }) => {
  const display = typeof children === 'string' && children === href ? shorten(href) : children;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 underline underline-offset-2 decoration-blue-500/40 hover:decoration-blue-300 transition-colors break-all"
    >
      <span>{display}</span>
      <ExternalLinkIcon size={11} className="flex-shrink-0 opacity-70" />
    </a>
  );
};

export default ExternalUrlLink;
