import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import { getReferencesByCategory, type PDFReference } from '../../data/pdfReferences';
import { useLanguage } from '../../contexts/LanguageContext';

const RELEVANT_CATEGORIES = ['data-security', 'governance', 'agentic-security'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const CATEGORY_LABELS: Record<string, { fr: string; en: string }> = {
  'data-security': { fr: 'Sécurité des Données', en: 'Data Security' },
  governance: { fr: 'Gouvernance', en: 'Governance' },
  'agentic-security': { fr: 'Sécurité Agentique', en: 'Agentic Security' },
};

const CompassOWASPReferences: React.FC = () => {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [expandedPdfId, setExpandedPdfId] = useState<string | null>(null);

  const relevantRefs = RELEVANT_CATEGORIES.flatMap(c => getReferencesByCategory(c));

  if (relevantRefs.length === 0) return null;

  const t = {
    title: language === 'fr' ? 'Documents OWASP de référence' : 'OWASP Reference Documents',
    subtitle:
      language === 'fr'
        ? `${relevantRefs.length} documents liés à ce module COMPASS`
        : `${relevantRefs.length} documents related to this COMPASS module`,
    keyItemsLabel: language === 'fr' ? 'éléments clés' : 'key items',
    openSource: language === 'fr' ? 'Source OWASP' : 'OWASP source',
  };

  return (
    <Card className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-white">{t.title}</h3>
            <p className="text-sm text-gray-400">{t.subtitle}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-700 p-4 space-y-3">
          {relevantRefs.map(ref => (
            <PDFRefCard
              key={ref.id}
              pdf={ref}
              isExpanded={expandedPdfId === ref.id}
              onToggle={() =>
                setExpandedPdfId(expandedPdfId === ref.id ? null : ref.id)
              }
              labels={t}
              language={language}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

interface PDFRefCardProps {
  pdf: PDFReference;
  isExpanded: boolean;
  onToggle: () => void;
  labels: { keyItemsLabel: string; openSource: string };
  language: 'fr' | 'en';
}

const PDFRefCard: React.FC<PDFRefCardProps> = ({
  pdf,
  isExpanded,
  onToggle,
  labels,
  language,
}) => {
  const categoryLabel = CATEGORY_LABELS[pdf.category]?.[language] || pdf.category;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-3 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
              {categoryLabel}
            </span>
            {pdf.documentMeta?.version && (
              <span className="text-xs text-gray-500">v{pdf.documentMeta.version}</span>
            )}
          </div>
          <h4 className="font-medium text-white text-sm">{pdf.title}</h4>
          <p className="text-xs text-gray-400 mt-1">
            {pdf.keyItems.length} {labels.keyItemsLabel}
            {pdf.documentMeta?.pages && ` • ${pdf.documentMeta.pages} pages`}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-700 p-3 space-y-2">
          <p className="text-xs text-gray-300 leading-relaxed">{pdf.summary}</p>

          {pdf.url && (
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              {labels.openSource}
            </a>
          )}

          <ul className="space-y-1 mt-2">
            {pdf.keyItems.slice(0, 10).map(item => (
              <li key={item.id} className="flex items-start gap-2 text-xs">
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-mono flex-shrink-0 ${
                    PRIORITY_COLORS[item.priority || 'medium']
                  }`}
                >
                  {item.code || item.id.toUpperCase()}
                </span>
                <span className="text-gray-300">{item.title}</span>
              </li>
            ))}
            {pdf.keyItems.length > 10 && (
              <li className="text-xs text-gray-500 italic pl-2">
                {language === 'fr' ? `… +${pdf.keyItems.length - 10} autres` : `… +${pdf.keyItems.length - 10} more`}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompassOWASPReferences;
