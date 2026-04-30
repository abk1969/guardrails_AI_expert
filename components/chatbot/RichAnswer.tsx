import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { findReferences, MatchedRef } from '../../services/answerEnricher';
import InternalRefLink from './links/InternalRefLink';
import ReferentielLink from './links/ReferentielLink';
import ExternalUrlLink from './links/ExternalUrlLink';

interface Props {
  content: string;
}

function renderEnrichedText(text: string, keyPrefix: string): React.ReactNode {
  if (!text) return null;
  const refs = findReferences(text);
  if (refs.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  refs.forEach((ref: MatchedRef, i: number) => {
    if (ref.start > cursor) {
      parts.push(<React.Fragment key={`${keyPrefix}-t-${i}`}>{text.slice(cursor, ref.start)}</React.Fragment>);
    }
    parts.push(renderRef(ref, `${keyPrefix}-r-${i}`));
    cursor = ref.end;
  });
  if (cursor < text.length) {
    parts.push(<React.Fragment key={`${keyPrefix}-tail`}>{text.slice(cursor)}</React.Fragment>);
  }
  return <>{parts}</>;
}

function renderRef(ref: MatchedRef, key: string): React.ReactNode {
  switch (ref.kind) {
    case 'sia':
    case 'compass':
    case 'agentic':
    case 'dsgai':
      return <InternalRefLink key={key} kind={ref.kind} label={ref.raw} navTo={ref.navTo!} anchor={ref.anchor} />;
    case 'owasp-llm':
    case 'owasp-aisvs':
    case 'mitre-atlas':
      return <ReferentielLink key={key} label={ref.raw} href={ref.href} type={ref.kind} />;
    case 'referentiel':
      return <ReferentielLink key={key} label={ref.raw} href={ref.href} meta={ref.meta} type="referentiel" />;
    default:
      return <span key={key}>{ref.raw}</span>;
  }
}

function processChildren(children: React.ReactNode, keyPrefix: string): React.ReactNode {
  return React.Children.map(children, (child, i) => {
    if (typeof child === 'string') return renderEnrichedText(child, `${keyPrefix}-${i}`);
    return child;
  });
}

const RichAnswer: React.FC<Props> = ({ content }) => {
  const safeContent = useMemo(() => {
    if (typeof content !== 'string') return '';
    return content.replace(/\n{3,}/g, '\n\n');
  }, [content]);

  if (!safeContent) return null;

  return (
    <div className="rich-answer prose prose-invert prose-sm max-w-none text-gray-100 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => <ExternalUrlLink href={href || '#'}>{children}</ExternalUrlLink>,
          p: ({ children }) => <p className="my-2">{processChildren(children, 'p')}</p>,
          li: ({ children }) => <li className="my-1 ml-4 list-disc text-gray-200">{processChildren(children, 'li')}</li>,
          ul: ({ children }) => <ul className="my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal ml-6">{children}</ol>,
          h1: ({ children }) => <h3 className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-gray-700">{processChildren(children, 'h1')}</h3>,
          h2: ({ children }) => <h4 className="text-base font-bold text-cyan-300 mt-3 mb-2">{processChildren(children, 'h2')}</h4>,
          h3: ({ children }) => <h5 className="text-sm font-semibold text-cyan-200 mt-3 mb-1">{processChildren(children, 'h3')}</h5>,
          h4: ({ children }) => <h6 className="text-sm font-semibold text-gray-300 mt-2 mb-1">{processChildren(children, 'h4')}</h6>,
          strong: ({ children }) => <strong className="font-semibold text-white">{processChildren(children, 'strong')}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{processChildren(children, 'em')}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return <code className={`block p-3 my-2 rounded bg-gray-900/80 border border-gray-700 text-cyan-300 text-xs font-mono overflow-x-auto whitespace-pre ${className}`}>{children}</code>;
            }
            return <code className="px-1.5 py-0.5 rounded bg-gray-900/80 border border-gray-700/60 text-cyan-300 text-xs font-mono">{children}</code>;
          },
          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="my-2 pl-3 border-l-2 border-cyan-500/40 italic text-gray-300">{children}</blockquote>,
          table: ({ children }) => <div className="my-3 overflow-x-auto"><table className="min-w-full border border-gray-700 text-sm">{children}</table></div>,
          thead: ({ children }) => <thead className="bg-gray-800/60">{children}</thead>,
          tr: ({ children }) => <tr className="border-b border-gray-700/50">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-cyan-300">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-gray-200">{processChildren(children, 'td')}</td>,
          hr: () => <hr className="my-4 border-gray-700" />,
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export default RichAnswer;
