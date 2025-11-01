import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useNavigation } from '../contexts/NavigationContext';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Interface de Résultats Promptfoo Red Team - Version Complète
 *
 * Affiche les vulnérabilités trouvées après une exécution de tests red team
 * avec graphiques, filtres avancés, et détails d'analyse
 */

// Format retourné par le backend (provient de promptfoo.service.ts:339-350)
interface PromptfooResult {
  id: string;
  prompt: string;           // Backend utilise 'prompt', pas 'promptText'
  response: string;
  score: number;
  passed: boolean;          // Backend utilise 'passed: boolean', pas 'status: string'
  plugin: string;
  category: string;         // Backend utilise 'category', pas 'promptCategory'
  complexity: string;
  explanation: string | null;
  responseTime: number | null;
}

interface TestRunSummary {
  testRunId: string;
  status: string;           // 'COMPLETED', 'RUNNING', etc.
  target?: {
    name: string;
    componentType: string;
  };
  duration: string;         // Ex: "320 sec"
  summary: {
    totalTests: number;
    passed: number;         // Backend utilise 'passed', pas 'passedTests'
    failed: number;         // Backend utilise 'failed', pas 'failedTests'
    successRate: number;    // Pourcentage (0-100)
    averageScore: number;   // Score moyen (0-1)
    criticalFailures: number; // Nombre de tests avec score < 0.3
  };
  categoryStats: Record<string, { passed: number; failed: number }>;
  pluginStats: Record<string, number>; // Backend retourne juste le count, pas {passed, failed}
}

interface PromptfooResultsViewProps {
  testRunId?: string;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

const PromptfooResultsView: React.FC<PromptfooResultsViewProps> = ({ testRunId: propTestRunId }) => {
  const { setActiveNav } = useNavigation();

  const [testData, setTestData] = useState<TestRunSummary | null>(null);
  const [results, setResults] = useState<PromptfooResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<PromptfooResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [pluginFilter, setPluginFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Vue détails
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  // Onglets de vue
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'analytics'>('overview');

  // Récupérer testRunId depuis localStorage si non fourni
  const testRunId = propTestRunId || localStorage.getItem('promptfoo_last_test_run_id') || '';

  useEffect(() => {
    if (testRunId) {
      loadResults();
    }
  }, [testRunId]);

  useEffect(() => {
    applyFilters();
  }, [results, statusFilter, categoryFilter, pluginFilter, searchTerm]);

  const loadResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';
      const response = await fetch(`${API_URL}/promptfoo/results/${testRunId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Le backend retourne { testRunId, status, target, duration, summary: {...}, categoryStats, pluginStats, results: [...] }
      setTestData(data);
      setResults(data.results || []);
    } catch (err) {
      console.error('Erreur chargement résultats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    if (statusFilter !== 'ALL') {
      // Backend utilise 'passed: boolean', on doit convertir
      filtered = filtered.filter(r => {
        if (statusFilter === 'PASSED') return r.passed;
        if (statusFilter === 'FAILED') return !r.passed;
        return true;
      });
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    if (pluginFilter !== 'ALL') {
      filtered = filtered.filter(r => r.plugin === pluginFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.prompt.toLowerCase().includes(term) ||
        r.response.toLowerCase().includes(term) ||
        (r.explanation && r.explanation.toLowerCase().includes(term))
      );
    }

    setFilteredResults(filtered);
  };

  const toggleResultExpand = (resultId: string) => {
    setExpandedResultId(expandedResultId === resultId ? null : resultId);
  };

  const exportToPDF = () => {
    if (!testData || !results.length) {
      alert('Aucune donnée à exporter');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // En-tête du document
    doc.setFontSize(18);
    doc.setTextColor(0, 150, 200);
    doc.text('Rapport Red Team - Promptfoo', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Test Run: ${testRunId}`, pageWidth / 2, 22, { align: 'center' });
    doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, 27, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 30, pageWidth - 15, 30);

    // Section: Résumé
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('📊 Résumé Exécutif', 15, 38);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summary = testData.summary;
    const summaryData = [
      ['Tests Totaux', summary.totalTests.toString()],
      ['Tests Réussis', `${summary.passed} (${summary.successRate}%)`],
      ['Vulnérabilités Détectées', summary.failed.toString()],
      ['Score Moyen', `${Math.round(summary.averageScore * 100)}%`],
      ['Échecs Critiques (score < 30%)', summary.criticalFailures.toString()],
      ['Statut', testData.status],
      ['Durée', testData.duration]
    ];

    if (testData.target) {
      summaryData.push(['Cible', `${testData.target.name} (${testData.target.componentType})`]);
    }

    autoTable(doc, {
      startY: 42,
      head: [['Métrique', 'Valeur']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [0, 150, 200] },
      styles: { fontSize: 9 }
    });

    // Section: Résultats par Catégorie
    if (testData.categoryStats && Object.keys(testData.categoryStats).length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 42;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('📈 Résultats par Catégorie', 15, finalY + 10);

      const categoryData = Object.entries(testData.categoryStats).map(([category, stats]) => {
        const total = stats.passed + stats.failed;
        const rate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
        return [category, stats.passed.toString(), stats.failed.toString(), `${rate}%`];
      });

      autoTable(doc, {
        startY: finalY + 14,
        head: [['Catégorie', 'Réussis', 'Échecs', 'Taux Réussite']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 200] },
        styles: { fontSize: 9 }
      });
    }

    // Section: Détails des Vulnérabilités (filtrer les échecs)
    const vulnerabilities = results.filter(r => !r.passed);

    if (vulnerabilities.length > 0) {
      doc.addPage();

      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text(`⚠️  Vulnérabilités Détectées (${vulnerabilities.length})`, 15, 15);

      const vulnData = vulnerabilities.map((vuln, index) => [
        (index + 1).toString(),
        vuln.plugin || 'N/A',
        vuln.category,
        `${Math.round(vuln.score * 100)}%`,
        vuln.prompt.substring(0, 50) + (vuln.prompt.length > 50 ? '...' : ''),
        vuln.explanation?.substring(0, 80) || 'Aucune explication'
      ]);

      autoTable(doc, {
        startY: 20,
        head: [['#', 'Plugin', 'Catégorie', 'Score', 'Prompt', 'Analyse']],
        body: vulnData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          4: { cellWidth: 40 },
          5: { cellWidth: 50 }
        }
      });
    }

    // Pied de page sur toutes les pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `AI RISK MANAGER - Rapport Promptfoo | Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Sauvegarde
    const filename = `promptfoo-report-${testRunId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const exportToExcel = () => {
    if (!testData || !results.length) {
      alert('Aucune donnée à exporter');
      return;
    }

    // Feuille 1: Résumé
    const summarySheet = [
      ['Rapport Red Team - Promptfoo'],
      [''],
      ['Test Run ID', testRunId],
      ['Généré le', new Date().toLocaleString('fr-FR')],
      [''],
      ['RÉSUMÉ EXÉCUTIF'],
      ['Tests Totaux', testData.summary.totalTests],
      ['Tests Réussis', testData.summary.passed],
      ['Vulnérabilités Détectées', testData.summary.failed],
      ['Taux de Réussite', `${testData.summary.successRate}%`],
      ['Score Moyen', `${Math.round(testData.summary.averageScore * 100)}%`],
      ['Échecs Critiques (< 30%)', testData.summary.criticalFailures],
      ['Statut', testData.status],
      ['Durée', testData.duration]
    ];

    if (testData.target) {
      summarySheet.push(['Cible', testData.target.name]);
      summarySheet.push(['Type de Composant', testData.target.componentType]);
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);

    // Feuille 2: Résultats par Catégorie
    const categoryData = [
      ['Catégorie', 'Tests Réussis', 'Échecs', 'Total', 'Taux Réussite']
    ];

    if (testData.categoryStats) {
      Object.entries(testData.categoryStats).forEach(([category, stats]) => {
        const total = stats.passed + stats.failed;
        const rate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
        categoryData.push([category, stats.passed, stats.failed, total, `${rate}%`]);
      });
    }

    const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);

    // Feuille 3: Résultats par Plugin
    const pluginData = [
      ['Plugin', 'Nombre de Tests']
    ];

    if (testData.pluginStats) {
      Object.entries(testData.pluginStats).forEach(([plugin, count]) => {
        pluginData.push([plugin, count]);
      });
    }

    const wsPlugins = XLSX.utils.aoa_to_sheet(pluginData);

    // Feuille 4: Tous les Résultats
    const allResultsData = [
      ['#', 'Statut', 'Score', 'Plugin', 'Catégorie', 'Complexité', 'Prompt', 'Réponse', 'Explication', 'Temps Réponse (ms)']
    ];

    results.forEach((result, index) => {
      allResultsData.push([
        index + 1,
        result.passed ? 'RÉUSSI' : 'ÉCHEC',
        Math.round(result.score * 100),
        result.plugin,
        result.category,
        result.complexity,
        result.prompt,
        result.response,
        result.explanation || '',
        result.responseTime || ''
      ]);
    });

    const wsAllResults = XLSX.utils.aoa_to_sheet(allResultsData);

    // Feuille 5: Vulnérabilités Uniquement
    const vulnerabilities = results.filter(r => !r.passed);
    const vulnData = [
      ['#', 'Score', 'Plugin', 'Catégorie', 'Prompt', 'Réponse', 'Analyse', 'Temps Réponse (ms)']
    ];

    vulnerabilities.forEach((vuln, index) => {
      vulnData.push([
        index + 1,
        Math.round(vuln.score * 100),
        vuln.plugin,
        vuln.category,
        vuln.prompt,
        vuln.response,
        vuln.explanation || '',
        vuln.responseTime || ''
      ]);
    });

    const wsVulnerabilities = XLSX.utils.aoa_to_sheet(vulnData);

    // Créer le workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');
    XLSX.utils.book_append_sheet(wb, wsCategories, 'Par Catégorie');
    XLSX.utils.book_append_sheet(wb, wsPlugins, 'Par Plugin');
    XLSX.utils.book_append_sheet(wb, wsAllResults, 'Tous les Résultats');
    XLSX.utils.book_append_sheet(wb, wsVulnerabilities, 'Vulnérabilités');

    // Appliquer des styles aux colonnes (largeur)
    const colWidths = [
      { wch: 5 },   // #
      { wch: 10 },  // Statut
      { wch: 8 },   // Score
      { wch: 20 },  // Plugin
      { wch: 15 },  // Catégorie
      { wch: 12 },  // Complexité
      { wch: 50 },  // Prompt
      { wch: 50 },  // Réponse
      { wch: 60 },  // Explication
      { wch: 12 }   // Temps
    ];

    wsAllResults['!cols'] = colWidths;
    wsVulnerabilities['!cols'] = colWidths;

    // Sauvegarde
    const filename = `promptfoo-report-${testRunId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const getSuccessRate = () => {
    if (!testData || !testData.summary) return 0;
    return testData.summary.successRate || 0;
  };

  const getStatusIcon = (passed: boolean) => {
    return passed
      ? <CheckCircle2 size={20} className="text-green-400" />
      : <XCircle size={20} className="text-red-400" />;
  };

  const getSeverityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-900/20 border-green-500/30';
    if (score >= 0.5) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    return 'text-red-400 bg-red-900/20 border-red-500/30';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 0.8) return 'SÉCURISÉ';
    if (score >= 0.5) return 'ATTENTION';
    return 'VULNÉRABLE';
  };

  const prepareChartData = () => {
    if (!testData || !testData.categoryStats) return [];

    return Object.entries(testData.categoryStats).map(([name, stats]: [string, { passed: number; failed: number }]) => ({
      name,
      passed: stats.passed,
      failed: stats.failed,
      total: stats.passed + stats.failed
    }));
  };

  const preparePieData = () => {
    if (!testData || !testData.summary) return [];

    return [
      { name: 'Réussis', value: testData.summary.passed, color: '#10b981' },
      { name: 'Échecs', value: testData.summary.failed, color: '#ef4444' }
    ];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-center py-12">
            <Activity size={48} className="animate-spin text-cyan-400 mr-4" />
            <div>
              <p className="text-lg font-bold text-white">Chargement des résultats...</p>
              <p className="text-sm text-gray-400 font-mono">Test Run ID: {testRunId}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-900/20 border-red-500/30">
          <div className="text-center py-8">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Erreur de Chargement</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <Button onClick={loadResults}>Réessayer</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-cyan-500/30">
          <div className="text-center py-16 px-8">
            <div className="mb-6">
              <Shield size={80} className="text-cyan-400 mx-auto mb-4 opacity-50" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              Aucun Test Exécuté
            </h2>

            <p className="text-gray-300 text-lg mb-2">
              Pour voir des résultats ici, vous devez d'abord lancer des tests de sécurité.
            </p>

            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Les tests red team permettent de détecter les vulnérabilités de vos systèmes IA
              en simulant des attaques (injection de prompts, jailbreak, fuites de données, etc.)
            </p>

            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center justify-center gap-2">
                <Activity size={24} />
                Comment démarrer ?
              </h3>

              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Pour Débutants</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Utilisez l'<strong>Assistant Guidé</strong> qui vous accompagne pas à pas
                      </p>
                      <Button
                        onClick={() => setActiveNav('promptfoo-wizard')}
                        className="w-full bg-cyan-500 hover:bg-cyan-600"
                      >
                        🚀 Lancer l'Assistant
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Pour Experts</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Configurez manuellement les tests avec le <strong>Mode Expert</strong>
                      </p>
                      <Button
                        onClick={() => setActiveNav('promptfoo-config')}
                        variant="secondary"
                        className="w-full"
                      >
                        ⚙️ Configuration Expert
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Clock size={16} />
              <span>Durée estimée : 5-30 minutes selon la configuration</span>
            </div>
          </div>
        </Card>

        {/* Card d'information supplémentaire */}
        <Card className="border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-cyan-400" />
            Ce que vous verrez après l'exécution des tests
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <BarChart3 size={32} className="text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Statistiques</h4>
              <p className="text-sm text-gray-400">
                Taux de réussite, nombre de vulnérabilités, scores moyens
              </p>
            </div>

            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <AlertTriangle size={32} className="text-orange-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Vulnérabilités</h4>
              <p className="text-sm text-gray-400">
                Détails des failles détectées avec recommandations
              </p>
            </div>

            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <Download size={32} className="text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Exports</h4>
              <p className="text-sm text-gray-400">
                Rapports PDF et Excel pour partage avec votre équipe
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const successRate = getSuccessRate();
  const categories = ['ALL', ...Object.keys(testData.categoryStats || {})];
  const plugins = ['ALL', ...Object.keys(testData.pluginStats || {})];
  const chartData = prepareChartData();
  const pieData = preparePieData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Shield size={32} className="mr-3 text-cyan-400" />
              Résultats Red Team - Promptfoo
            </h2>
            <p className="text-gray-400 mt-2 font-mono text-sm">
              Test Run: <span className="text-cyan-400">{testRunId}</span>
            </p>
            {testData.target && (
              <p className="text-gray-400 mt-1">
                Cible: <span className="text-white font-semibold">{testData.target.name}</span> ({testData.target.componentType})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportToPDF} className="flex items-center gap-2">
              <Download size={16} />
              PDF
            </Button>
            <Button variant="secondary" onClick={exportToExcel} className="flex items-center gap-2">
              <Download size={16} />
              Excel
            </Button>
            <Button variant="secondary" onClick={loadResults} className="flex items-center gap-2">
              <Activity size={16} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tests Totaux</p>
                <p className="text-3xl font-bold text-white">{testData.summary.totalTests}</p>
              </div>
              <Target size={32} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">Tests Réussis</p>
                <p className="text-3xl font-bold text-green-400">{testData.summary.passed}</p>
              </div>
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
          </div>

          <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Vulnérabilités</p>
                <p className="text-3xl font-bold text-red-400">{testData.summary.failed}</p>
              </div>
              <AlertTriangle size={32} className="text-red-400" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getSeverityColor(successRate / 100)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Taux de Réussite</p>
                <p className="text-3xl font-bold">{successRate}%</p>
              </div>
              <TrendingUp size={32} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
          <Clock size={16} />
          <span>Statut: <span className="text-white">{testData.status}</span></span>
          <span>•</span>
          <span>Durée: <span className="text-white">{testData.duration}</span></span>
        </div>
      </Card>

      {/* Onglets */}
      <Card>
        <div className="flex gap-2 border-b border-gray-700 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-t ${activeTab === 'overview' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Vue d'Ensemble
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-t ${activeTab === 'analytics' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Analytiques
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-t ${activeTab === 'details' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Détails ({filteredResults.length})
          </button>
        </div>
      </Card>

      {/* Contenu selon onglet */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats par Catégorie */}
          {testData.categoryStats && Object.keys(testData.categoryStats).length > 0 && (
            <Card>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={24} className="text-cyan-400" />
                Résultats par Catégorie
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(testData.categoryStats).map(([category, stats]: [string, { passed: number; failed: number }]) => {
                  const total = stats.passed + stats.failed;
                  const rate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
                  return (
                    <div
                      key={category}
                      className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
                      onClick={() => { setCategoryFilter(category); setActiveTab('details'); }}
                    >
                      <p className="text-white font-semibold mb-3">{category}</p>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={14} /> {stats.passed}
                        </span>
                        <span className="text-red-400 flex items-center gap-1">
                          <XCircle size={14} /> {stats.failed}
                        </span>
                        <span className={`font-bold ${rate >= 70 ? 'text-green-400' : rate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {rate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${rate >= 70 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Top Vulnérabilités */}
          <Card className="bg-red-900/10 border-red-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-400" />
              Vulnérabilités Critiques
            </h3>
            <div className="space-y-2">
              {results.filter(r => r.status === 'FAILED' && r.score < 0.5).slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="bg-gray-800/50 p-3 rounded border border-red-500/30 hover:border-red-500/50 transition-colors cursor-pointer"
                  onClick={() => { setExpandedResultId(result.id); setActiveTab('details'); }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold line-clamp-1">{result.promptText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{result.promptCategory}</span>
                        {result.metadata?.plugin && (
                          <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded">
                            {result.metadata.plugin}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-red-400 font-bold text-lg">{Math.round(result.score * 100)}%</span>
                  </div>
                </div>
              ))}
              {results.filter(r => r.status === 'FAILED' && r.score < 0.5).length === 0 && (
                <p className="text-center text-gray-400 py-4">Aucune vulnérabilité critique détectée ✓</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Résultats par Catégorie</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="passed" name="Réussis" fill="#10b981" />
                  <Bar dataKey="failed" name="Échecs" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Distribution Globale</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Stats par Plugin */}
          {testData.pluginStats && Object.keys(testData.pluginStats).length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Résultats par Plugin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(testData.pluginStats).map(([plugin, count]) => {
                  // pluginStats est Record<string, number>, pas {passed, failed}
                  return (
                    <div key={plugin} className="bg-gray-800/30 p-3 rounded border border-gray-700">
                      <p className="text-sm text-cyan-400 font-mono mb-2">{plugin}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Tests exécutés:</span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Filtres */}
          <Card>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">Filtres:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PASSED">Réussis uniquement</option>
                <option value="FAILED">Échecs uniquement</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={pluginFilter}
                onChange={(e) => setPluginFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
              >
                {plugins.map(plugin => (
                  <option key={plugin} value={plugin}>
                    {plugin === 'ALL' ? 'Tous les plugins' : plugin}
                  </option>
                ))}
              </select>

              <div className="flex-1 flex items-center gap-2 bg-gray-700 px-3 py-2 rounded border border-gray-600 focus-within:border-cyan-500">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-3">
              {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''} trouvé{filteredResults.length > 1 ? 's' : ''}
            </p>
          </Card>

          {/* Liste des Résultats */}
          <div className="space-y-3">
            {filteredResults.map((result) => {
              const isExpanded = expandedResultId === result.id;
              return (
                <Card
                  key={result.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !result.passed
                      ? 'border-red-500/30 hover:border-red-500/60'
                      : 'border-green-500/30 hover:border-green-500/60'
                  }`}
                  onClick={() => toggleResultExpand(result.id)}
                >
                  {/* Header Résultat */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.passed)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-mono px-2 py-1 rounded border ${getSeverityColor(result.score)}`}>
                            {getSeverityLabel(result.score)}
                          </span>
                          <span className="text-sm text-gray-400">{result.category}</span>
                          {result.plugin && (
                            <span className="text-xs px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded border border-cyan-500/30 font-mono">
                              {result.plugin}
                            </span>
                          )}
                        </div>
                        <p className="text-white font-semibold">{result.prompt}</p>
                        {result.explanation && !isExpanded && (
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{result.explanation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.round(result.score * 100)}%
                        </p>
                        {result.responseTime && (
                          <p className="text-xs text-gray-400">{result.responseTime}ms</p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Détails Étendus */}
                  {isExpanded && (
                    <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                      {/* Réponse du Modèle */}
                      <div>
                        <p className="text-sm font-semibold text-gray-400 mb-2">📝 Réponse du Modèle:</p>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                          <p className="text-white whitespace-pre-wrap">{result.response}</p>
                        </div>
                      </div>

                      {/* Analyse */}
                      {result.explanation && (
                        <div>
                          <p className="text-sm font-semibold text-gray-400 mb-2">🔍 Analyse:</p>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-gray-300">{result.explanation}</p>
                          </div>
                        </div>
                      )}

                      {/* Métadonnées */}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>🧩 Plugin: <span className="text-white font-mono">{result.plugin}</span></span>
                        <span>📊 Complexité: <span className="text-white">{result.complexity}</span></span>
                        <span>🎯 Catégorie: <span className="text-white">{result.category}</span></span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}

            {filteredResults.length === 0 && (
              <Card>
                <p className="text-center text-gray-400 py-8">
                  Aucun résultat ne correspond aux filtres sélectionnés
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptfooResultsView;
