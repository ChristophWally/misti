'use client';

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MigrationIssue {
  type: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  affectedCount: number;
  sqlPreview?: string;
  autoFixable: boolean;
}

interface DatabaseStats {
  totalVerbs: number;
  totalForms: number;
  totalTranslations: number;
  totalFormTranslations: number;
}

export default function MigrationToolsInterface() {
  const [currentTab, setCurrentTab] = useState<'audit' | 'migration' | 'progress'>('audit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<MigrationIssue[]>([]);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true);

  const supabase = createClientComponentClient();

  const addToDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const runTagAnalysis = async () => {
    setIsAnalyzing(true);
    setDebugLog([]);
    addToDebugLog('🔍 Starting comprehensive tag analysis...');

    try {
      // Get database stats
      addToDebugLog('📊 Analyzing database statistics...');
      const { data: verbCount } = await supabase
        .from('dictionary')
        .select('id', { count: 'exact' })
        .eq('word_type', 'VERB');

      const { data: formCount } = await supabase
        .from('word_forms')
        .select('id', { count: 'exact' });

      const { data: translationCount } = await supabase
        .from('word_translations')
        .select('id', { count: 'exact' });

      const { data: formTranslationCount } = await supabase
        .from('form_translations')
        .select('id', { count: 'exact' });

      const stats = {
        totalVerbs: verbCount?.length || 0,
        totalForms: formCount?.length || 0,
        totalTranslations: translationCount?.length || 0,
        totalFormTranslations: formTranslationCount?.length || 0,
      };
      
      setDatabaseStats(stats);
      addToDebugLog(`✅ Database stats: ${stats.totalVerbs} verbs, ${stats.totalForms} forms, ${stats.totalTranslations} translations`);

      // Analyze person terminology issues
      addToDebugLog('🔍 Analyzing person terminology consistency...');
      
      // Check for ALL legacy Italian person terms
      const legacyPersonTerms = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
      const { data: allFormsWithLegacyTerms } = await supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .or(legacyPersonTerms.map(term => `tags.cs.{"${term}"}`).join(','));

      const { data: universalTerminologyForms } = await supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .or('tags.cs.{"prima-persona"},tags.cs.{"seconda-persona"},tags.cs.{"terza-persona"}');

      // Count individual legacy terms for detailed breakdown
      let legacyTermCounts: Record<string, number> = {};
      for (const term of legacyPersonTerms) {
        const { data: termForms } = await supabase
          .from('word_forms')
          .select('id', { count: 'exact' })
          .contains('tags', [term]);
        legacyTermCounts[term] = termForms?.length || 0;
      }

      const totalLegacyCount = Object.values(legacyTermCounts).reduce((sum, count) => sum + count, 0);
      const universalCount = (universalTerminologyForms?.length || 0);

      addToDebugLog(`📊 Legacy terms breakdown: ${Object.entries(legacyTermCounts).map(([term, count]) => `${term}:${count}`).join(', ')}`);
      addToDebugLog(`📊 Total forms with legacy terminology: ${totalLegacyCount}, with universal terminology: ${universalCount}`);

      // Analyze missing auxiliaries
      addToDebugLog('🔍 Analyzing missing auxiliary assignments...');
      const { data: translationsWithoutAux } = await supabase
        .from('word_translations')
        .select('id, translation, context_metadata')
        .is('context_metadata->auxiliary', null);

      const missingAuxCount = translationsWithoutAux?.length || 0;
      addToDebugLog(`📊 Found ${missingAuxCount} translations missing auxiliary assignments`);

      // Analyze deprecated tags
      addToDebugLog('🔍 Analyzing deprecated tag usage...');
      const { data: deprecatedTagForms } = await supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .or('tags.cs.{"past-participle"},tags.cs.{"gerund"},tags.cs.{"infinitive"}');

      const deprecatedCount = deprecatedTagForms?.length || 0;
      addToDebugLog(`📊 Found ${deprecatedCount} forms with deprecated English tags`);

      // Generate migration issues
      const issues: MigrationIssue[] = [];

      if (totalLegacyCount > 0) {
        issues.push({
          type: 'critical',
          category: 'Universal Terminology',
          description: `${totalLegacyCount} forms using legacy Italian person terms (${Object.entries(legacyTermCounts).filter(([_, count]) => count > 0).map(([term, count]) => `${term}:${count}`).join(', ')})`,
          affectedCount: totalLegacyCount,
          sqlPreview: `UPDATE word_forms SET tags = array_replace(tags, 'io', 'prima-persona') WHERE tags ? 'io';`,
          autoFixable: true
        });
      }

      if (missingAuxCount > 0) {
        issues.push({
          type: 'critical',
          category: 'Auxiliary Assignments',
          description: `${missingAuxCount} translations missing required auxiliary metadata`,
          affectedCount: missingAuxCount,
          sqlPreview: `UPDATE word_translations SET context_metadata = context_metadata || '{"auxiliary":"avere"}'...`,
          autoFixable: false
        });
      }

      if (deprecatedCount > 0) {
        issues.push({
          type: 'medium',
          category: 'Deprecated Tags',
          description: `${deprecatedCount} forms using deprecated English grammatical terms`,
          affectedCount: deprecatedCount,
          sqlPreview: `UPDATE word_forms SET tags = array_replace(tags, 'past-participle', 'participio-passato')...`,
          autoFixable: true
        });
      }

      setAnalysisResults(issues);
      addToDebugLog(`✅ Analysis complete: ${issues.length} issue categories identified`);

    } catch (error: any) {
      addToDebugLog(`❌ Analysis failed: ${error.message}`);
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'audit', name: 'Tag Audit', description: 'Analyze current tag consistency' },
    { id: 'migration', name: 'Migration Tools', description: 'Execute systematic fixes' },
    { id: 'progress', name: 'Progress Tracking', description: 'Monitor migration progress' },
  ];

  const getSeverityColor = (type: MigrationIssue['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`${
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <div>
                <div>{tab.name}</div>
                <div className="text-xs text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Debug Log Section - Top of Page */}
      {debugLog.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-gray-900">Real-Time Analysis Progress</h4>
                {isAnalyzing && (
                  <div className="ml-3 flex items-center">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-blue-600 font-medium">Analyzing...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDebugLog([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Log
                </button>
                <button
                  onClick={() => setIsDebugExpanded(!isDebugExpanded)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  {isDebugExpanded ? 'Collapse' : 'Expand'}
                  <svg 
                    className={`ml-1 h-3 w-3 transform transition-transform ${isDebugExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {isDebugExpanded && (
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-green-400 font-mono space-y-1 max-h-48 overflow-y-auto">
                  {debugLog.length === 0 ? (
                    <div className="text-gray-500">No analysis logs yet. Click "Run Analysis" to start systematic tag analysis.</div>
                  ) : (
                    debugLog.map((log, index) => (
                      <div key={index} className={index === debugLog.length - 1 ? 'text-green-300 font-semibold' : ''}>{log}</div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Tag Audit Tab */}
        {currentTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Database Tag Analysis</h3>
                <p className="text-sm text-gray-600">
                  Systematic analysis of tag consistency across all tables
                </p>
              </div>
              <button
                onClick={runTagAnalysis}
                disabled={isAnalyzing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Run Analysis'
                )}
              </button>
            </div>

            {/* Database Stats */}
            {databaseStats && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Database State</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Verbs:</span> 
                    <span className="ml-1 font-medium">{databaseStats.totalVerbs}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Word Forms:</span> 
                    <span className="ml-1 font-medium">{databaseStats.totalForms}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Translations:</span> 
                    <span className="ml-1 font-medium">{databaseStats.totalTranslations}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Form Translations:</span> 
                    <span className="ml-1 font-medium">{databaseStats.totalFormTranslations}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Identified Issues</h4>
                {analysisResults.map((issue, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(issue.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {issue.type}
                          </span>
                          <span className="ml-2 text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                            {issue.category}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium">{issue.description}</p>
                        {issue.sqlPreview && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">SQL Preview:</p>
                            <code className="text-xs bg-white bg-opacity-50 p-2 rounded block font-mono">
                              {issue.sqlPreview}
                            </code>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {issue.autoFixable ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Auto-fixable
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Manual fix required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Migration Tools Tab */}
        {currentTab === 'migration' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Migration Execution</h3>
              <p className="text-sm text-gray-600">
                Execute systematic database migrations with safety checks
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Migration Tools Under Development
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Migration execution tools are being built. Run the Tag Audit first to identify issues that need migration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tracking Tab */}
        {currentTab === 'progress' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Migration Progress</h3>
              <p className="text-sm text-gray-600">
                Track the progress of systematic database improvements
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Progress Tracking Under Development
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Progress tracking features will be available once migration execution tools are implemented.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

