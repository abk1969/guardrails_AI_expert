import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAIPolicy } from '../contexts/AIPolicyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PolicyStatisticsCard } from './policy/PolicyStatisticsCard';
import { ChapterProgressChart } from './policy/ChapterProgressChart';
import { PolicyNavigationSidebar } from './policy/PolicyNavigationSidebar';
import { PolicyChapterView } from './policy/PolicyChapterView';
import { PolicyFilters, LifecyclePhase, RiskFunction } from './policy/PolicyFilters';
import { AuditChecklistMode } from './policy/AuditChecklistMode';
import LanguageSwitcher from './ui/LanguageSwitcher';
import './policy/PolicyView.css';
import {
  Search,
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  ExternalLink,
  ClipboardCheck,
  BarChart3,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { exportPolicyToExcel, exportPolicyToCsv } from '../services/pssiExportService';
import { PSSI_IA_V3_VERSION, PSSI_IA_V3_TOTAL_RULES } from '../data/aiPolicyContentNew';

const AIPolicyViewComplete: React.FC = () => {
  const { policyData, importPolicyData } = useAIPolicy();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    policyData.length > 0 ? policyData[0].id : null
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<LifecyclePhase>(LifecyclePhase.ALL);
  const [selectedFunction, setSelectedFunction] = useState<RiskFunction>(RiskFunction.ALL);
  const [showAuditMode, setShowAuditMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
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
    let data = policyData;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase();
      data = data
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
    }

    // Apply phase filter (filter rules based on their chapter/section context)
    if (selectedPhase !== LifecyclePhase.ALL) {
      // Chapter 3 contains lifecycle phases
      data = data.map(chapter => {
        if (chapter.id === 'chapter-3-cybersecurity') {
          return {
            ...chapter,
            sections: chapter.sections.filter(section => {
              if (selectedPhase === LifecyclePhase.DESIGN && section.id === 'cyber-design') return true;
              if (selectedPhase === LifecyclePhase.DEVELOPMENT && section.id === 'cyber-development') return true;
              if (selectedPhase === LifecyclePhase.DEPLOYMENT && section.id === 'cyber-deployment') return true;
              if (selectedPhase === LifecyclePhase.OPERATION && section.id === 'cyber-operation') return true;
              return false;
            })
          };
        }
        return chapter;
      }).filter(chapter => chapter.sections.length > 0 || chapter.id !== 'chapter-3-cybersecurity');
    }

    // Apply risk function filter
    if (selectedFunction !== RiskFunction.ALL) {
      // Chapter 4 contains risk functions
      data = data.map(chapter => {
        if (chapter.id === 'chapter-4-risk-management') {
          return {
            ...chapter,
            sections: chapter.sections.filter(section => {
              if (selectedFunction === RiskFunction.GOVERN && section.id === 'risk-govern') return true;
              if (selectedFunction === RiskFunction.MAP && section.id === 'risk-map') return true;
              if (selectedFunction === RiskFunction.MEASURE && section.id === 'risk-measure') return true;
              if (selectedFunction === RiskFunction.MANAGE && section.id === 'risk-manage') return true;
              return false;
            })
          };
        }
        return chapter;
      }).filter(chapter => chapter.sections.length > 0 || chapter.id !== 'chapter-4-risk-management');
    }

    return data;
  }, [policyData, searchTerm, selectedPhase, selectedFunction]);

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(policyData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `pssi_ia_v${PSSI_IA_V3_VERSION}_${PSSI_IA_V3_TOTAL_RULES}_SIA_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportExcel = () => {
    exportPolicyToExcel(policyData, {
      version: PSSI_IA_V3_VERSION,
      exportedAt: new Date().toISOString(),
      totalRules: PSSI_IA_V3_TOTAL_RULES,
    });
  };

  const handleExportCsv = () => {
    exportPolicyToCsv(policyData, {
      version: PSSI_IA_V3_VERSION,
      exportedAt: new Date().toISOString(),
      totalRules: PSSI_IA_V3_TOTAL_RULES,
    });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToRepo = () => {
    // Navigate to AI Risk Repository module
    // This would be handled by the parent App component in a real scenario
    console.log('Navigate to AI Risk Repository');
  };

  const activeChapter = useMemo(() => {
    return filteredPolicyData.find(chapter => chapter.id === activeChapterId) || filteredPolicyData[0];
  }, [filteredPolicyData, activeChapterId]);

  const handleResetFilters = () => {
    setSelectedPhase(LifecyclePhase.ALL);
    setSelectedFunction(RiskFunction.ALL);
    setSearchTerm('');
  };

  const hasActiveFilters =
    selectedPhase !== LifecyclePhase.ALL ||
    selectedFunction !== RiskFunction.ALL ||
    searchTerm.trim() !== '';

  return (
    <>
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

        {/* Charts Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {showCharts ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCharts ? 'Masquer' : 'Afficher'} les graphiques
          </button>
        </div>

        {/* Progress Charts */}
        {showCharts && <ChapterProgressChart policyData={policyData} />}

        {/* Search and Actions Bar */}
        <Card>
          <div className="flex flex-col gap-4">
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
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  className={showFilters ? 'bg-cyan-500/20 border-cyan-500/50' : ''}
                >
                  <Filter size={16} className="mr-2" />
                  Filtres
                </Button>
                <Button onClick={() => setShowAuditMode(true)} variant="secondary">
                  <ClipboardCheck size={16} className="mr-2" />
                  Audit
                </Button>
                <Button onClick={handleImportClick} variant="secondary">
                  <Upload size={16} className="mr-2" />
                  {t('policy.import')}
                </Button>
                <Button onClick={handleExportExcel} variant="primary" title="Export Excel multi-feuilles : Synthèse + Détail + Scénarios + Statistiques + Référentiels">
                  <FileSpreadsheet size={16} className="mr-2" />
                  Excel
                </Button>
                <Button onClick={handleExportCsv} variant="secondary" title="Export CSV plat (UTF-8 BOM, séparateur ; pour Excel FR)">
                  <FileText size={16} className="mr-2" />
                  CSV
                </Button>
                <Button onClick={handleExport} variant="secondary" title="Export JSON brut (sauvegarde / réimport)">
                  <FileJson size={16} className="mr-2" />
                  JSON
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {filteredPolicyData.length} chapitre(s) correspondant(s) aux filtres
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Réinitialiser tous les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <PolicyFilters
            selectedPhase={selectedPhase}
            selectedFunction={selectedFunction}
            onPhaseChange={setSelectedPhase}
            onFunctionChange={setSelectedFunction}
            onReset={handleResetFilters}
          />
        )}

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Sticky */}
          <div className="lg:col-span-1">
            <div className="policy-sidebar policy-sidebar-scroll">
              <PolicyNavigationSidebar
                policyData={filteredPolicyData}
                activeChapterId={activeChapterId}
                activeSectionId={activeSectionId}
                onNavigate={handleNavigation}
              />
            </div>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-3">
            {filteredPolicyData.length > 0 ? (
              activeChapter ? (
                <PolicyChapterView
                  chapter={activeChapter}
                  highlightSectionId={activeSectionId}
                />
              ) : (
                <Card className="text-center">
                  <p className="text-gray-400">Sélectionnez un chapitre dans la navigation</p>
                </Card>
              )
            ) : (
              <Card className="text-center py-12">
                <Search size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">
                  {t('policy.no_results')} "{searchTerm}"
                </p>
                <Button onClick={handleResetFilters} variant="secondary" className="mt-4">
                  Réinitialiser la recherche
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="mt-8 pt-4 border-t border-gray-800">
          <div className="text-center text-xs text-gray-500">
            <p>© CLUSIF 2025 - Modèle PSSI IA</p>
          </div>
        </div>
      </div>

      {/* Audit Checklist Modal */}
      {showAuditMode && (
        <AuditChecklistMode policyData={policyData} onClose={() => setShowAuditMode(false)} />
      )}
    </>
  );
};

export default AIPolicyViewComplete;
