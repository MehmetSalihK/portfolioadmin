import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiTrendingUp, 
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSettings,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiBarChart,
  FiGlobe,
  FiTarget,
  FiZap,
  FiFileText,
  FiImage,
  FiLink,
  FiClock,
  FiUser,
  FiFilter,
  FiDownload,
  FiExternalLink,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Types
interface SEOData {
  _id: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  robots: {
    index: boolean;
    follow: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
  };
  openGraph: {
    title: string;
    description: string;
    image?: string;
    type: string;
    url: string;
  };
  twitterCard: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
  structuredData: any;
  analysis: {
    score: number;
    issues: string[];
    recommendations: string[];
    keywordDensity: Record<string, number>;
    readabilityScore: number;
    wordCount: number;
  };
  performance: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    lastUpdated: string;
  };
  sitemapPriority: number;
  changeFrequency: string;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultImage: string;
  twitterHandle: string;
  facebookAppId: string;
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  robots: {
    globalIndex: boolean;
    globalFollow: boolean;
    crawlDelay: number;
  };
  sitemap: {
    enabled: boolean;
    changeFreq: string;
    priority: number;
  };
}

interface SEOAnalysis {
  totalEntities: number;
  optimizedEntities: number;
  averageScore: number;
  totalIssues: number;
  averageReadability: number;
  averageKeywordCount: number;
  topIssues: { issue: string; count: number }[];
  recommendations: string[];
  performanceMetrics: {
    totalClicks: number;
    totalImpressions: number;
    averageCTR: number;
    averagePosition: number;
  };
}

const SEOPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // États
  const [seoData, setSeoData] = useState<SEOData[]>([]);
  const [seoConfig, setSeoConfig] = useState<SEOConfig | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'config' | 'sitemap'>('overview');
  const [selectedEntity, setSelectedEntity] = useState<SEOData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    entityType: '',
    search: '',
    scoreRange: [0, 100],
    hasIssues: false,
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const loadSEOAnalysis = useCallback(async () => {
    const response = await fetch('/api/seo?action=analyze');
    if (!response.ok) throw new Error('Erreur lors du chargement de l\'analyse SEO');
    
    const data = await response.json();
    setSeoAnalysis(data.analysis);
  }, []);

  const loadSEOEntities = useCallback(async () => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      ...(filters.entityType && { type: filters.entityType }),
      ...(filters.search && { search: filters.search }),
    });
    
    const response = await fetch(`/api/seo?${params}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des entités SEO');
    
    const data = await response.json();
    setSeoData(data.seoEntries);
    setPagination(prev => ({ ...prev, ...data.pagination }));
  }, [pagination.page, pagination.limit, filters.entityType, filters.search]);

  const loadSEOConfig = useCallback(async () => {
    const response = await fetch('/api/seo?action=config');
    if (!response.ok) throw new Error('Erreur lors du chargement de la configuration SEO');
    
    const data = await response.json();
    setSeoConfig(data.config);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        await Promise.all([
          loadSEOAnalysis(),
          loadSEOConfig(),
        ]);
      } else if (activeTab === 'entities') {
        await loadSEOEntities();
      } else if (activeTab === 'config') {
        await loadSEOConfig();
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données SEO');
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadSEOAnalysis, loadSEOEntities, loadSEOConfig]);

  // Charger les données
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, activeTab, filters, pagination.page, loadData]);

  // Optimiser automatiquement toutes les entités
  const handleBulkOptimization = async () => {
    if (!confirm('Voulez-vous optimiser automatiquement toutes les entités ? Cette opération peut prendre du temps.')) {
      return;
    }
    
    try {
      setOptimizing(true);
      
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_optimize' }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'optimisation');
      
      const data = await response.json();
      toast.success(`${data.optimized} entités optimisées avec succès`);
      
      loadData();
    } catch (error) {
      console.error('Erreur optimisation:', error);
      toast.error('Erreur lors de l\'optimisation automatique');
    } finally {
      setOptimizing(false);
    }
  };

  // Optimiser une entité spécifique
  const handleOptimizeEntity = async (entityType: string, entityId: string) => {
    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          entityType,
          entityId,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'optimisation');
      
      toast.success('Entité optimisée avec succès');
      loadData();
    } catch (error) {
      console.error('Erreur optimisation entité:', error);
      toast.error('Erreur lors de l\'optimisation de l\'entité');
    }
  };

  // Supprimer une entrée SEO
  const handleDeleteSEO = async (seoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée SEO ?')) return;
    
    try {
      const response = await fetch(`/api/seo?seoId=${seoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      toast.success('Entrée SEO supprimée avec succès');
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Mettre à jour la configuration SEO
  const handleUpdateConfig = async (config: SEOConfig) => {
    try {
      const response = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          config,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      toast.success('Configuration SEO mise à jour');
      setSeoConfig(config);
      setShowConfigModal(false);
    } catch (error) {
      console.error('Erreur mise à jour config:', error);
      toast.error('Erreur lors de la mise à jour de la configuration');
    }
  };

  // Générer le sitemap
  const handleGenerateSitemap = async () => {
    try {
      const response = await fetch('/api/seo/sitemap', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la génération du sitemap');
      
      toast.success('Sitemap généré avec succès');
    } catch (error) {
      console.error('Erreur génération sitemap:', error);
      toast.error('Erreur lors de la génération du sitemap');
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Optimisation SEO</h1>
              <p className="mt-2 text-gray-600">
                Analysez et optimisez le référencement de votre portfolio
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBulkOptimization}
                disabled={optimizing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {optimizing ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiZap className="w-4 h-4" />
                )}
                <span>{optimizing ? 'Optimisation...' : 'Optimiser Tout'}</span>
              </button>
              
              <button
                onClick={() => setShowConfigModal(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FiSettings className="w-4 h-4" />
                <span>Configuration</span>
              </button>
            </div>
          </div>
          
          {/* Onglets */}
          <div className="flex space-x-8 border-b">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: FiBarChart },
              { id: 'entities', label: 'Entités', icon: FiFileText },
              { id: 'config', label: 'Configuration', icon: FiSettings },
              { id: 'sitemap', label: 'Sitemap', icon: FiGlobe },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <SEOOverview 
            analysis={seoAnalysis}
            config={seoConfig}
            onRefresh={loadData}
          />
        )}
        
        {activeTab === 'entities' && (
          <SEOEntities 
            entities={seoData}
            filters={filters}
            setFilters={setFilters}
            pagination={pagination}
            setPagination={setPagination}
            onOptimize={handleOptimizeEntity}
            onEdit={(entity) => {
              setSelectedEntity(entity);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteSEO}
          />
        )}
        
        {activeTab === 'config' && (
          <SEOConfiguration 
            config={seoConfig}
            onUpdate={handleUpdateConfig}
          />
        )}
        
        {activeTab === 'sitemap' && (
          <SEOSitemap 
            onGenerate={handleGenerateSitemap}
          />
        )}
      </div>

      {/* Modales */}
      <SEOEditModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEntity(null);
        }}
        entity={selectedEntity}
        onSave={() => {
          setShowEditModal(false);
          setSelectedEntity(null);
          loadData();
        }}
      />
      
      <SEOConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        config={seoConfig}
        onSave={handleUpdateConfig}
      />
    </div>
  );
};

// Composant Vue d'ensemble
const SEOOverview: React.FC<{
  analysis: SEOAnalysis | null;
  config: SEOConfig | null;
  onRefresh: () => void;
}> = ({ analysis, config, onRefresh }) => {
  // Obtenir la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Obtenir l'icône du score
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <FiCheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <FiAlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <FiXCircle className="w-5 h-5 text-red-600" />;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <FiBarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune donnée d'analyse disponible</p>
        <button
          onClick={onRefresh}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entités Totales</p>
              <p className="text-2xl font-bold text-gray-900">{analysis.totalEntities}</p>
            </div>
            <FiFileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entités Optimisées</p>
              <p className="text-2xl font-bold text-green-600">{analysis.optimizedEntities}</p>
              <p className="text-xs text-gray-500">
                {Math.round((analysis.optimizedEntities / analysis.totalEntities) * 100)}% du total
              </p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score Moyen</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.averageScore)}`}>
                {Math.round(analysis.averageScore)}/100
              </p>
            </div>
            <FiTarget className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Problèmes Totaux</p>
              <p className="text-2xl font-bold text-red-600">{analysis.totalIssues}</p>
            </div>
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métriques de Performance</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Clics Totaux</span>
              <span className="font-medium">{analysis.performanceMetrics.totalClicks.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Impressions Totales</span>
              <span className="font-medium">{analysis.performanceMetrics.totalImpressions.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CTR Moyen</span>
              <span className="font-medium">{(analysis.performanceMetrics.averageCTR * 100).toFixed(2)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Position Moyenne</span>
              <span className="font-medium">{analysis.performanceMetrics.averagePosition.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Problèmes Principaux</h3>
          
          <div className="space-y-3">
            {analysis.topIssues.slice(0, 5).map((issue, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex-1">{issue.issue}</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {issue.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommandations</h3>
        
        <div className="space-y-3">
          {analysis.recommendations.slice(0, 5).map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant Liste des entités
const SEOEntities: React.FC<{
  entities: SEOData[];
  filters: any;
  setFilters: (filters: any) => void;
  pagination: any;
  setPagination: (pagination: any) => void;
  onOptimize: (entityType: string, entityId: string) => void;
  onEdit: (entity: SEOData) => void;
  onDelete: (seoId: string) => void;
}> = ({ entities, filters, setFilters, pagination, setPagination, onOptimize, onEdit, onDelete }) => {
  // Obtenir la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Obtenir l'icône du score
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <FiCheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <FiAlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <FiXCircle className="w-5 h-5 text-red-600" />;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'entité
            </label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value="project">Projets</option>
              <option value="skill">Compétences</option>
              <option value="experience">Expériences</option>
              <option value="education">Formations</option>
              <option value="page">Pages</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score minimum
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.scoreRange[0]}
              onChange={(e) => setFilters({ ...filters, scoreRange: [parseInt(e.target.value), filters.scoreRange[1]] })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{filters.scoreRange[0]}/100</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtres
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasIssues}
                onChange={(e) => setFilters({ ...filters, hasIssues: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Avec problèmes uniquement</span>
            </label>
          </div>
        </div>
      </div>

      {/* Liste des entités */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Entités SEO</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {entities.map((entity) => (
            <motion.div
              key={entity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {entity.entityType}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(entity.analysis.score)}
                      <span className={`font-medium ${getScoreColor(entity.analysis.score)}`}>
                        {Math.round(entity.analysis.score)}/100
                      </span>
                    </div>
                    
                    {entity.analysis.issues.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {entity.analysis.issues.length} problème(s)
                      </span>
                    )}
                  </div>
                  
                  <h4 className="mt-2 text-lg font-medium text-gray-900">{entity.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{entity.description}</p>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{entity.keywords.length} mot(s)-clé(s)</span>
                    <span>{entity.analysis.wordCount} mots</span>
                    <span>Lisibilité: {Math.round(entity.analysis.readabilityScore)}/100</span>
                    <span>Modifié: {formatDate(entity.lastModified)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOptimize(entity.entityType, entity.entityId)}
                    className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                    title="Optimiser automatiquement"
                  >
                    <FiZap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(entity)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Modifier"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entity._id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination({ ...pagination, page })}
                className={`px-3 py-2 rounded-lg ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Configuration SEO
const SEOConfiguration: React.FC<{
  config: SEOConfig | null;
  onUpdate: (config: SEOConfig) => void;
}> = ({ config, onUpdate }) => {
  const [formData, setFormData] = useState<SEOConfig | null>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  if (!formData) {
    return (
      <div className="text-center py-12">
        <FiSettings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Configuration SEO non disponible</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Configuration SEO Globale</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du site
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du site
            </label>
            <input
              type="url"
              value={formData.siteUrl}
              onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre par défaut
          </label>
          <input
            type="text"
            value={formData.defaultTitle}
            onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description par défaut
          </label>
          <textarea
            value={formData.defaultDescription}
            onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mots-clés par défaut (séparés par des virgules)
          </label>
          <input
            type="text"
            value={formData.defaultKeywords.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              defaultKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handle Twitter
            </label>
            <input
              type="text"
              value={formData.twitterHandle}
              onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
              placeholder="@username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook App ID
            </label>
            <input
              type="text"
              value={formData.facebookAppId}
              onChange={(e) => setFormData({ ...formData, facebookAppId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
};

// Composant Sitemap
const SEOSitemap: React.FC<{
  onGenerate: () => void;
}> = ({ onGenerate }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion du Sitemap</h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Le sitemap est généré automatiquement et inclut toutes vos pages, projets, compétences et médias.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={onGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Régénérer le Sitemap</span>
            </button>
            
            <a
              href="/api/seo/sitemap"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>Voir le Sitemap</span>
            </a>
            
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>Voir robots.txt</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modale d'édition SEO
const SEOEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  entity: SEOData | null;
  onSave: () => void;
}> = ({ isOpen, onClose, entity, onSave }) => {
  const [formData, setFormData] = useState<Partial<SEOData>>({});

  useEffect(() => {
    if (entity) {
      setFormData(entity);
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          seoId: entity._id,
          data: formData,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      toast.success('SEO mis à jour avec succès');
      onSave();
    } catch (error) {
      console.error('Erreur mise à jour SEO:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Modifier le SEO - {entity.entityType}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.keywords?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Modale de configuration
const SEOConfigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  config: SEOConfig | null;
  onSave: (config: SEOConfig) => void;
}> = ({ isOpen, onClose, config, onSave }) => {
  if (!isOpen || !config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Configuration SEO Avancée
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          <SEOConfiguration config={config} onUpdate={onSave} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SEOPage;