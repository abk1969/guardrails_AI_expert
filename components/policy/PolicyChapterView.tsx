import React from 'react';
import Card from '../ui/Card';
import { AIPolicyChapter, AIPolicyContentItem } from '../../types';
import { RuleCard } from './RuleCard';
import { BookOpen, List, Table } from 'lucide-react';

interface PolicyChapterViewProps {
  chapter: AIPolicyChapter;
  highlightSectionId?: string | null;
}

export const PolicyChapterView: React.FC<PolicyChapterViewProps> = ({
  chapter,
  highlightSectionId
}) => {
  const renderContentItem = (item: AIPolicyContentItem, index: number) => {
    switch (item.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-3">
            {item.content}
          </p>
        );

      case 'list':
        return (
          <ul key={index} className="space-y-2 mb-4">
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex} className="text-gray-300 flex gap-3">
                <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                <span className="flex-1">{listItem}</span>
              </li>
            ))}
          </ul>
        );

      case 'rule':
        return (
          <div key={index} className="mb-4">
            <RuleCard
              rule={item.rule}
              chapterTitle={chapter.title}
            />
          </div>
        );

      case 'table':
        return (
          <div key={index} className="mb-4 overflow-x-auto">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Table size={16} />
              <span>Tableau {index + 1}</span>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-700/50 border-b border-gray-600">
                    {item.headers.map((header, headerIndex) => (
                      <th
                        key={headerIndex}
                        className="px-4 py-3 text-left text-cyan-400 font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-gray-300 align-top"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-lg">
            <BookOpen className="text-cyan-400" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{chapter.title}</h2>
            {chapter.introduction && chapter.introduction.length > 0 && (
              <div className="space-y-2">
                {chapter.introduction.map((intro, index) => (
                  <p key={index} className="text-gray-300 leading-relaxed">
                    {intro}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Sections */}
      {chapter.sections.map((section) => {
        const isHighlighted = highlightSectionId === section.id;

        return (
          <div
            key={section.id}
            id={section.id}
            className={`scroll-mt-4 ${isHighlighted ? 'ring-2 ring-cyan-500 rounded-lg' : ''}`}
          >
            <Card>
              {/* Section Header */}
              <div className="mb-4 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <List className="text-cyan-400" size={20} />
                  <h3 className="text-xl font-bold text-white">{section.title}</h3>
                </div>
              </div>

              {/* Section Content */}
              <div className="space-y-4">
                {section.content.map((item, index) => renderContentItem(item, index))}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
