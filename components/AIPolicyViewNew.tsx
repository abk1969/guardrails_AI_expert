import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAIPolicy } from '../contexts/AIPolicyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PolicyStatisticsCard } from './policy/PolicyStatisticsCard';
import { PolicyNavigationSidebar } from './policy/PolicyNavigationSidebar';
import { PolicyChapterView } from './policy/PolicyChapterView';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { Search, Upload, Download, FileText, ExternalLink } from 'lucide-react';

const AIPolicyViewNew: React.FC = () => {
  const { policyData, importPolicyData } = useAIPolicy();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    policyData.length > 0 ? policyData[0].id : null
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to section when navigating
  useEffect(() => {
    if (activeSectionId) {
      const element = document.getElementById(activeSectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSectionId]);

  const filteredPolicyData = useMemo(() => {
    if (!searchTerm.trim()) {
      return policyData;
    }
    const lowercasedFilter = searchTerm.toLowerCase();

    return policyData
      .map(chapter => ({
        ...chapter,
        sections: chapter.sections
          .map(section => ({
            ...section,
            content: section.content.filter(item => {
              if (item.type === 'rule') {
                return (
                  item.rule.reference.toLowerCase().includes(lowercasedFilter) ||
                  item.rule.ruleText.toLowerCase().includes(lowercasedFilter) ||
                  (item.rule.implementationDetails &&
                    item.rule.implementationDetails.toLowerCase().includes(lowercasedFilter))
                );
              }
              if (item.type === 'paragraph') {
                return item.content.toLowerCase().includes(lowercasedFilter);
              }
              if (item.type === 'list') {
                return item.items.some(i => i.toLowerCase().includes(lowercasedFilter));
              }
              return false;
            })
          }))
          .filter(
            section =>
              section.title.toLowerCase().includes(lowercasedFilter) || section.content.length > 0
          )
      }))
      .filter(
        chapter =>
          chapter.title.toLowerCase().includes(lowercasedFilter) || chapter.sections.length > 0
      );
  }, [policyData, searchTerm]);

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(policyData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'ai_security_policy_clusif.json';
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedData = JSON.parse(content);
            if (importPolicyData(importedData)) {
              alert(t('policy.import_success'));
            } else {
              alert(t('policy.import_error'));
            }
          }
        } catch (error) {
          alert(t('policy.import_error'));
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  };

  const handleNavigation = (chapterId: string, sectionId?: string) => {
    setActiveChapterId(chapterId);
    setActiveSectionId(sectionId || null);

    if (!sectionId) {
      // Scroll to top of chapter
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeChapter = useMemo(() => {
    return policyData.find(chapter => chapter.id === activeChapterId) || policyData[0];
  }, [policyData, activeChapterId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-cyan-400" size={32} />
            <h2 className="text-3xl font-bold text-white">{t('policy.title')}</h2>
          </div>
          <p className="text-gray-400 mt-2 leading-relaxed">{t('policy.subtitle')}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">{t('policy.source')}</span>
            <a
              href="https://clusif.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              clusif.fr
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Statistics */}
      <PolicyStatisticsCard policyData={policyData} />

      {/* Search and Actions Bar */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t('policy.search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
            <Button onClick={handleImportClick} variant="secondary" className="w-1/2 md:w-auto">
              <Upload size={16} className="mr-2" />
              {t('policy.import')}
            </Button>
            <Button onClick={handleExport} variant="secondary" className="w-1/2 md:w-auto">
              <Download size={16} className="mr-2" />
              {t('policy.export')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <PolicyNavigationSidebar
            policyData={filteredPolicyData}
            activeChapterId={activeChapterId}
            activeSectionId={activeSectionId}
            onNavigate={handleNavigation}
          />
        </div>

        {/* Chapter Content */}
        <div className="lg:col-span-3">
          {filteredPolicyData.length > 0 ? (
            activeChapter ? (
              <PolicyChapterView chapter={activeChapter} highlightSectionId={activeSectionId} />
            ) : (
              <Card className="text-center">
                <p className="text-gray-400">Sélectionnez un chapitre dans la navigation</p>
              </Card>
            )
          ) : (
            <Card className="text-center">
              <p className="text-gray-400">
                {t('policy.no_results')} "{searchTerm}"
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gray-800/50 border-cyan-500/20">
        <div className="text-center text-sm text-gray-400">
          <p>
            © CLUSIF 2025 - {t('policy.source')}
          </p>
          <p className="mt-2 text-xs">
            Modèle de Politique de Sécurité des Systèmes d'Information (PSSI) pour l'Intelligence
            Artificielle
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIPolicyViewNew;
