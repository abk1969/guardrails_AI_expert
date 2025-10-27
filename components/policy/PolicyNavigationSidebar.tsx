import React from 'react';
import { AIPolicyChapter } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookOpen, ChevronRight } from 'lucide-react';

interface PolicyNavigationSidebarProps {
  policyData: AIPolicyChapter[];
  activeChapterId: string | null;
  activeSectionId: string | null;
  onNavigate: (chapterId: string, sectionId?: string) => void;
}

export const PolicyNavigationSidebar: React.FC<PolicyNavigationSidebarProps> = ({
  policyData,
  activeChapterId,
  activeSectionId,
  onNavigate
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="text-cyan-400" size={20} />
          {t('policy.navigate')}
        </h3>
      </div>

      <nav className="space-y-2">
        {policyData.map((chapter, chapterIndex) => {
          const isActiveChapter = activeChapterId === chapter.id;

          return (
            <div key={chapter.id} className="space-y-1">
              {/* Chapter Button */}
              <button
                onClick={() => onNavigate(chapter.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  flex items-center gap-2 text-sm font-medium
                  ${isActiveChapter
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                `}
              >
                <span className="text-xs font-mono text-gray-500 w-6">
                  {chapterIndex + 1}.
                </span>
                <span className="flex-1 truncate">{chapter.title}</span>
                {isActiveChapter && <ChevronRight size={14} className="flex-shrink-0" />}
              </button>

              {/* Sections (shown only for active chapter) */}
              {isActiveChapter && chapter.sections.length > 0 && (
                <div className="ml-6 pl-3 border-l-2 border-cyan-500/30 space-y-1">
                  {chapter.sections.map((section, sectionIndex) => {
                    const isActiveSection = activeSectionId === section.id;

                    return (
                      <button
                        key={section.id}
                        onClick={() => onNavigate(chapter.id, section.id)}
                        className={`
                          w-full text-left px-3 py-1.5 rounded-lg transition-all duration-200
                          flex items-center gap-2 text-xs
                          ${isActiveSection
                            ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                            : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-300'
                          }
                        `}
                      >
                        <span className="font-mono text-gray-600 w-8">
                          {chapterIndex + 1}.{sectionIndex + 1}
                        </span>
                        <span className="flex-1 truncate">{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 leading-relaxed">
          {t('policy.source')}
        </p>
      </div>
    </div>
  );
};
