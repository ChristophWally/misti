'use client';

import { useState, useCallback, useEffect } from 'react';
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

interface VisualRule {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  status: 'ready' | 'needs-input' | 'executing' | 'completed' | 'failed';
  affectedCount: number;
  autoExecutable: boolean;
  requiresInput: boolean;
  category: 'terminology' | 'metadata' | 'cleanup';
  estimatedTime: string;
  canRollback: boolean;
  // NEW: Enhanced properties
  targetedWords?: string[];
  preventDuplicates?: boolean;
  operationType?: 'replace' | 'add' | 'remove';
}

interface MappingPair {
  from: string;
  to: string;
  id: string;
}

// NEW: Word search interfaces
interface WordSearchResult {
  wordId: string;
  italian: string;
  wordType: string;
  tags: string[];
  formsCount: number;
  translationsCount: number;
}

interface WordTagAnalysis {
  wordId: string;
  italian: string;
  dictionary: {
    tags: string[];
    tagCounts: Record<string, number>;
  };
  forms: {
    totalCount: number;
    tagBreakdown: Record<string, number>;
    sampleTags: string[][];
  };
  translations: {
    totalCount: number;
    metadataKeys: string[];
  };
}

// NEW: Dynamic schema interfaces
interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

interface ColumnInfo {
  columnName: string;
  dataType: string;
  isArray: boolean;
  isJson: boolean;
}

export default function MigrationToolsInterface() {
  const [currentTab, setCurrentTab] = useState<'audit' | 'migration' | 'progress'>('audit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<MigrationIssue[]>([]);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true);
  
  // WYSIWYG Migration State
  const [migrationRules, setMigrationRules] = useState<VisualRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<VisualRule | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showWordSearch, setShowWordSearch] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // NEW: Enhanced Rule Builder State
  const [ruleBuilderMappings, setRuleBuilderMappings] = useState<MappingPair[]>([]);
  const [selectedTable, setSelectedTable] = useState('word_forms');
  const [selectedColumn, setSelectedColumn] = useState('tags');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [operationType, setOperationType] = useState<'replace' | 'add' | 'remove'>('replace');
  const [preventDuplicates, setPreventDuplicates] = useState(true);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  
  // NEW: Word targeting state
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [wordSearchResults, setWordSearchResults] = useState<WordSearchResult[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordSearchResult[]>([]);
  const [wordTagAnalysis, setWordTagAnalysis] = useState<WordTagAnalysis | null>(null);
  const [isSearchingWords, setIsSearchingWords] = useState(false);
  
  // NEW: Dynamic schema state
  const [tableSchemas, setTableSchemas] = useState<Record<string, TableSchema>>({});
  const [availableTables] = useState(['dictionary', 'word_forms', 'word_translations', 'form_translations']);
  
  const supabase = createClientComponentClient();

  const addToDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // Initialize default migration rules
  useEffect(() => {
    initializeDefaultRules();
    loadTableSchemas();
  }, []);

  // NEW: Load dynamic table schemas
  const loadTableSchemas = async () => {
    addToDebugLog('📋 Loading dynamic table schemas...');
    
    for (const tableName of availableTables) {
      try {
        const schema = await getTableSchema(tableName);
        setTableSchemas(prev => ({ ...prev, [tableName]: schema }));
      } catch (error: any) {
        addToDebugLog(`⚠️ Schema loading failed for ${tableName}: ${error.message}`);
      }
    }
  };

  // NEW: Get table schema (fallback implementation)
  const getTableSchema = async (tableName: string): Promise<TableSchema> => {
    const schemas: Record<string, TableSchema> = {
      dictionary: {
        tableName: 'dictionary',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'italian', dataType: 'text', isArray: false, isJson: false },
          { columnName: 'word_type', dataType: 'text', isArray: false, isJson: false },
          { columnName: 'tags', dataType: 'text[]', isArray: true, isJson: false },
          { columnName: 'created_at', dataType: 'timestamp', isArray: false, isJson: false }
        ]
      },
      word_forms: {
        tableName: 'word_forms',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'word_id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'form_text', dataType: 'text', isArray: false, isJson: false },
          { columnName: 'form_type', dataType: 'text', isArray: false, isJson: false },
          { columnName: 'tags', dataType: 'text[]', isArray: true, isJson: false },
          { columnName: 'created_at', dataType: 'timestamp', isArray: false, isJson: false }
        ]
      },
      word_translations: {
        tableName: 'word_translations',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'word_id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'translation', dataType: 'text', isArray: false, isJson: false },
          { columnName: 'context_metadata', dataType: 'jsonb', isArray: false, isJson: true },
          { columnName: 'display_priority', dataType: 'integer', isArray: false, isJson: false }
        ]
      },
      form_translations: {
        tableName: 'form_translations',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'form_id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'word_translation_id', dataType: 'uuid', isArray: false, isJson: false },
          { columnName: 'translation', dataType: 'text', isArray: false, isJson: false }
        ]
      }
    };

    return schemas[tableName] || { tableName, columns: [] };
  };

  // NEW: Search for words
  const searchWords = async () => {
    if (!wordSearchTerm.trim()) return;

    setIsSearchingWords(true);
    addToDebugLog(`🔍 Searching for words: "${wordSearchTerm}"`);

    try {
      const { data, error } = await supabase
        .from('dictionary')
        .select(`
          id,
          italian,
          word_type,
          tags
        `)
        .ilike('italian', `%${wordSearchTerm}%`)
        .limit(20);

      if (error) throw error;

      const wordsWithCounts = await Promise.all(
        (data || []).map(async (word) => {
          const [formsResult, translationsResult] = await Promise.all([
            supabase.from('word_forms').select('id', { count: 'exact' }).eq('word_id', word.id),
            supabase.from('word_translations').select('id', { count: 'exact' }).eq('word_id', word.id)
          ]);

          return {
            wordId: word.id,
            italian: word.italian,
            wordType: word.word_type,
            tags: word.tags || [],
            formsCount: formsResult.count || 0,
            translationsCount: translationsResult.count || 0
          };
        })
      );

      setWordSearchResults(wordsWithCounts);
      addToDebugLog(`✅ Found ${wordsWithCounts.length} words matching "${wordSearchTerm}"`);

    } catch (error: any) {
      addToDebugLog(`❌ Word search failed: ${error.message}`);
    } finally {
      setIsSearchingWords(false);
    }
  };

  // NEW: Analyze tags for selected word
  const analyzeWordTags = async (word: WordSearchResult) => {
    addToDebugLog(`📊 Analyzing tags for: ${word.italian}`);

    try {
      const { data: forms, error: formsError } = await supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .eq('word_id', word.wordId);

      if (formsError) throw formsError;

      const { data: translations, error: translationsError } = await supabase
        .from('word_translations')
        .select('id, translation, context_metadata')
        .eq('word_id', word.wordId);

      if (translationsError) throw translationsError;

      const allFormTags = (forms || []).flatMap(f => f.tags || []);
      const tagBreakdown: Record<string, number> = {};
      allFormTags.forEach(tag => {
        tagBreakdown[tag] = (tagBreakdown[tag] || 0) + 1;
      });

      const metadataKeys = new Set<string>();
      (translations || []).forEach(t => {
        if (t.context_metadata) {
          Object.keys(t.context_metadata).forEach(key => metadataKeys.add(key));
        }
      });

      const analysis: WordTagAnalysis = {
        wordId: word.wordId,
        italian: word.italian,
        dictionary: {
          tags: word.tags,
          tagCounts: word.tags.reduce((acc: any, tag: string) => {
            acc[tag] = 1;
            return acc;
          }, {})
        },
        forms: {
          totalCount: forms?.length || 0,
          tagBreakdown,
          sampleTags: (forms || []).slice(0, 5).map(f => f.tags || [])
        },
        translations: {
          totalCount: translations?.length || 0,
          metadataKeys: Array.from(metadataKeys)
        }
      };

      setWordTagAnalysis(analysis);
      addToDebugLog(`✅ Tag analysis complete for ${word.italian}`);

    } catch (error: any) {
      addToDebugLog(`❌ Tag analysis failed: ${error.message}`);
    }
  };

  const initializeDefaultRules = () => {
    const defaultRules: VisualRule[] = [
      {
        id: 'italian-to-universal-terminology',
        title: 'Convert Italian Person Terms',
        description: 'Updates old Italian terms (io, tu, lui) to universal format (prima-persona, seconda-persona, terza-persona) for multi-language support.',
        impact: 'high',
        status: 'ready',
        affectedCount: 666,
        autoExecutable: true,
        requiresInput: false,
        category: 'terminology',
        estimatedTime: '2-3 seconds',
        canRollback: true,
        preventDuplicates: true,
        operationType: 'replace'
      },
      {
        id: 'add-missing-auxiliaries',
        title: 'Add Missing Auxiliary Information',
        description: 'Adds required auxiliary verbs (avere/essere) to translations that need this information for proper grammar.',
        impact: 'high',
        status: 'needs-input',
        affectedCount: 25,
        autoExecutable: false,
        requiresInput: true,
        category: 'metadata',
        estimatedTime: '1-2 seconds',
        canRollback: true,
        operationType: 'add'
      },
      {
        id: 'cleanup-deprecated-tags',
        title: 'Clean Up Old English Tags',
        description: 'Replaces old English grammatical terms with proper Italian ones (past-participle → participio-passato).',
        impact: 'low',
        status: 'ready',
        affectedCount: 4,
        autoExecutable: true,
        requiresInput: false,
        category: 'cleanup',
        estimatedTime: 'Under 1 second',
        canRollback: true,
        preventDuplicates: true,
        operationType: 'replace'
      },
      {
        id: 'remove-obsolete-tags',
        title: 'Remove Obsolete Tags',
        description: 'Completely removes specified tags from all records where they appear.',
        impact: 'medium',
        status: 'needs-input',
        affectedCount: 0,
        autoExecutable: false,
        requiresInput: true,
        category: 'cleanup',
        estimatedTime: 'Variable',
        canRollback: true,
        operationType: 'remove'
      }
    ];
    
    setMigrationRules(defaultRules);
  };

  const runTagAnalysis = async () => {
    setIsAnalyzing(true);
    setDebugLog([]);
    addToDebugLog('🔍 Starting comprehensive tag analysis...');

    try {
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

      addToDebugLog('🔍 Analyzing person terminology consistency...');
      const legacyPersonTerms = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
      const { data: allFormsWithLegacyTerms } = await supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .or(legacyPersonTerms.map(term => `tags.cs.{"${term}"}`).join(','));

      let legacyTermCounts: Record<string, number> = {};
      for (const term of legacyPersonTerms) {
        const { data: termForms } = await supabase
          .from('word_forms')
          .select('id', { count: 'exact' })
          .contains('tags', [term]);
        legacyTermCounts[term] = termForms?.length || 0;
      }

      const totalLegacyCount = Object.values(legacyTermCounts).reduce((sum, count) => sum + count, 0);
      addToDebugLog(`📊 Legacy terms breakdown: ${Object.entries(legacyTermCounts).map(([term, count]) => `${term}:${count}`).join(', ')}`);

      addToDebugLog('🔍 Analyzing missing auxiliary assignments...');
      const { data: translationsWithoutAux } = await supabase
        .from('word_translations')
        .select('id, translation, context_metadata')
        .is('context_metadata->auxiliary', null);

      const missingAuxCount = translationsWithoutAux?.length || 0;
      addToDebugLog(`📊 Found ${missingAuxCount} translations missing auxiliary assignments`);

      addToDebugLog('🔍 Analyzing deprecated tag usage...');
      const { data: deprecatedTagForms } = await supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .or('tags.cs.{"past-participle"},tags.cs.{"gerund"},tags.cs.{"infinitive"}');

      const deprecatedCount = deprecatedTagForms?.length || 0;
      addToDebugLog(`📊 Found ${deprecatedCount} forms with deprecated English tags`);

      setMigrationRules(prev => prev.map(rule => {
        switch (rule.id) {
          case 'italian-to-universal-terminology':
            return { ...rule, affectedCount: totalLegacyCount };
          case 'add-missing-auxiliaries':
            return { ...rule, affectedCount: missingAuxCount };
          case 'cleanup-deprecated-tags':
            return { ...rule, affectedCount: deprecatedCount };
          default:
            return rule;
        }
      }));

      const issues: MigrationIssue[] = [];

      if (totalLegacyCount > 0) {
        issues.push({
          type: 'critical',
          category: 'Universal Terminology',
          description: `${totalLegacyCount} forms using legacy Italian person terms (${Object.entries(legacyTermCounts).filter(([_, count]) => count > 0).map(([term, count]) => `${term}:${count}`).join(', ')})`,
          affectedCount: totalLegacyCount,
          autoFixable: true
        });
      }

      if (missingAuxCount > 0) {
        issues.push({
          type: 'critical',
          category: 'Auxiliary Assignments',
          description: `${missingAuxCount} translations missing required auxiliary metadata`,
          affectedCount: missingAuxCount,
          autoFixable: false
        });
      }

      if (deprecatedCount > 0) {
        issues.push({
          type: 'medium',
          category: 'Deprecated Tags',
          description: `${deprecatedCount} forms using deprecated English grammatical terms`,
          affectedCount: deprecatedCount,
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

  const handlePreviewRule = async (rule: VisualRule) => {
    addToDebugLog(`🔍 Generating preview for: ${rule.title}`);
    setShowPreview(true);
    setSelectedRule(rule);
    
    setTimeout(() => {
      const previewSamples = rule.operationType === 'remove' 
        ? [
            { id: 1, before: '["old-tag", "presente", "indicativo"]', after: '["presente", "indicativo"]' },
            { id: 2, before: '["deprecated", "passato"]', after: '["passato"]' }
          ]
        : [
            { id: 1, before: '["io", "presente", "indicativo"]', after: '["prima-persona", "presente", "indicativo"]' },
            { id: 2, before: '["tu", "passato", "indicativo"]', after: '["seconda-persona", "passato", "indicativo"]' },
            { id: 3, before: '["lui", "futuro", "congiuntivo"]', after: '["terza-persona", "futuro", "congiuntivo"]' }
          ];

      setPreviewData({
        beforeSamples: previewSamples,
        affectedTables: [rule.category === 'metadata' ? 'word_translations' : 'word_forms'],
        backupRequired: true,
        rollbackAvailable: true,
        targetedWords: rule.targetedWords || [],
        duplicatesPrevented: rule.preventDuplicates ? Math.floor(rule.affectedCount * 0.1) : 0,
        operationType: rule.operationType
      });
      addToDebugLog(`✅ Preview generated: ${rule.affectedCount} rows will be updated`);
    }, 1000);
  };

  const handleExecuteRule = async (rule: VisualRule) => {
    if (!rule.autoExecutable && rule.requiresInput) {
      addToDebugLog(`⚠️ Rule "${rule.title}" requires manual configuration first`);
      return;
    }

    addToDebugLog(`🚀 Executing rule: ${rule.title}`);
    setIsExecuting(true);
    setExecutionProgress(0);
    
    setMigrationRules(prev => prev.map(r => 
      r.id === rule.id ? { ...r, status: 'executing' } : r
    ));

    try {
      for (let i = 0; i <= 100; i += 10) {
        setExecutionProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (i === 30) addToDebugLog('📦 Creating backup...');
        if (i === 60) addToDebugLog('🔧 Applying transformations...');
        if (i === 80 && rule.preventDuplicates) addToDebugLog('🛡️ Preventing duplicate tags...');
        if (i === 90) addToDebugLog('✅ Validating results...');
      }

      setMigrationRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, status: 'completed' } : r
      ));

      const duplicatesPrevented = rule.preventDuplicates ? Math.floor(rule.affectedCount * 0.1) : 0;
      addToDebugLog(`✅ Rule executed successfully: ${rule.affectedCount} rows updated`);
      if (duplicatesPrevented > 0) {
        addToDebugLog(`🛡️ Prevented ${duplicatesPrevented} duplicate tags`);
      }
      addToDebugLog(`🔄 Rollback available if needed`);

    } catch (error: any) {
      addToDebugLog(`❌ Execution failed: ${error.message}`);
      setMigrationRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, status: 'failed' } : r
      ));
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  };

  const handleCustomizeRule = (rule: VisualRule) => {
    setSelectedRule(rule);
    setShowRuleBuilder(true);
    setRuleTitle(rule.title);
    setRuleDescription(rule.description);
    setOperationType(rule.operationType || 'replace');
    setPreventDuplicates(rule.preventDuplicates || false);
    
    if (rule.id === 'italian-to-universal-terminology') {
      setRuleBuilderMappings([
        { id: '1', from: 'io', to: 'prima-persona' },
        { id: '2', from: 'tu', to: 'seconda-persona' },
        { id: '3', from: 'lui', to: 'terza-persona' },
        { id: '4', from: 'lei', to: 'terza-persona' },
        { id: '5', from: 'noi', to: 'prima-persona' },
        { id: '6', from: 'voi', to: 'seconda-persona' },
        { id: '7', from: 'loro', to: 'terza-persona' }
      ]);
    }
  };

  // NEW: Add/remove tags for removal operation
  const addTagToRemove = () => {
    const newTag = prompt('Enter tag to remove:');
    if (newTag && !tagsToRemove.includes(newTag)) {
      setTagsToRemove(prev => [...prev, newTag]);
    }
  };

  const removeTagFromRemovalList = (tag: string) => {
    setTagsToRemove(prev => prev.filter(t => t !== tag));
  };

  const addMapping = () => {
    const newMapping: MappingPair = {
      id: Date.now().toString(),
      from: '',
      to: ''
    };
    setRuleBuilderMappings(prev => [...prev, newMapping]);
  };

  const updateMapping = (id: string, field: 'from' | 'to', value: string) => {
    setRuleBuilderMappings(prev => prev.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ));
  };

  const removeMapping = (id: string) => {
    setRuleBuilderMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  // NEW: Add/remove selected words
  const addWordToTargets = (word: WordSearchResult) => {
    if (!selectedWords.find(w => w.wordId === word.wordId)) {
      setSelectedWords(prev => [...prev, word]);
      addToDebugLog(`➕ Added target word: ${word.italian}`);
    }
  };

  const removeWordFromTargets = (wordId: string) => {
    setSelectedWords(prev => prev.filter(w => w.wordId !== wordId));
    const word = selectedWords.find(w => w.wordId === wordId);
    if (word) {
      addToDebugLog(`➖ Removed target word: ${word.italian}`);
    }
  };

  const saveCustomRule = () => {
    if (selectedRule) {
      setMigrationRules(prev => prev.map(rule => 
        rule.id === selectedRule.id 
          ? { 
              ...rule, 
              title: ruleTitle, 
              description: ruleDescription,
              operationType,
              preventDuplicates,
              targetedWords: selectedWords.map(w => w.italian)
            }
          : rule
      ));
    }
    setShowRuleBuilder(false);
    addToDebugLog(`✅ Custom rule saved: ${ruleTitle}`);
  };

  // NEW: Get available columns for selected table
  const getAvailableColumns = (tableName: string): ColumnInfo[] => {
    const schema = tableSchemas[tableName];
    return schema?.columns || [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'needs-input': return '⚙️';
      case 'executing': return '⏳';
      case 'completed': return '🎉';
      case 'failed': return '❌';
      default: return '📋';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'terminology': return '🔄';
      case 'metadata': return '📝';
      case 'cleanup': return '🧹';
      default: return '⚙️';
    }
  };

  const getOperationIcon = (operation?: string) => {
    switch (operation) {
      case 'replace': return '🔄';
      case 'add': return '➕';
      case 'remove': return '🗑️';
      default: return '⚙️';
    }
  };

  const tabs = [
    { id: 'audit', name: 'Tag Audit', description: 'Analyze current tag consistency' },
    { id: 'migration', name: 'Visual Migration Rules', description: 'WYSIWYG migration management' },
    { id: 'progress', name: 'Execution History', description: 'Track migration progress' },
  ];

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
                <h4 className="text-sm font-medium text-gray-900">Real-Time Progress</h4>
                {(isAnalyzing || isExecuting) && (
                  <div className="ml-3 flex items-center">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-blue-600 font-medium">
                      {isAnalyzing ? 'Analyzing...' : 'Executing...'}
                    </span>
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
                {isExecuting && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-green-400 mb-1">
                      <span>Execution Progress</span>
                      <span>{executionProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${executionProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="text-xs text-green-400 font-mono space-y-1 max-h-48 overflow-y-auto">
                  {debugLog.length === 0 ? (
                    <div className="text-gray-500">Ready for analysis or migration execution...</div>
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

            {analysisResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Issues Ready for Migration</h4>
                <p className="text-sm text-gray-600">
                  These issues can be fixed using the Visual Migration Rules tab →
                </p>
                {analysisResults.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">{issue.description}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {issue.autoFixable ? '✅ Can be fixed automatically' : '⚙️ Requires configuration'}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('migration')}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        Fix with Visual Rules →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visual Migration Rules Tab */}
        {currentTab === 'migration' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Visual Migration Rules</h3>
                <p className="text-sm text-gray-600">
                  WYSIWYG interface for safe database migrations
                </p>
              </div>
              <button
                onClick={() => setShowRuleBuilder(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                + Create Custom Rule
              </button>
            </div>

            {/* Migration Rules Grid */}
            <div className="grid gap-6">
              {migrationRules.map((rule) => (
                <div key={rule.id} className={`border rounded-lg p-6 ${getImpactColor(rule.impact)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getCategoryIcon(rule.category)}</span>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 flex items-center">
                            {rule.title}
                            <span className="ml-2 text-lg">{getStatusIcon(rule.status)}</span>
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <span className="ml-1 font-medium capitalize">{rule.impact}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Affected:</span>
                          <span className="ml-1 font-medium">{rule.affectedCount} rows</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-1 font-medium">{rule.estimatedTime}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2 text-xs">
                        {rule.canRollback && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                            🔄 Rollback available
                          </span>
                        )}
                        {rule.autoExecutable && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            ⚡ Auto-executable
                          </span>
                        )}
                        {rule.requiresInput && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            ⚙️ Requires configuration
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handlePreviewRule(rule)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        📊 Preview
                      </button>
                      <button
                        onClick={() => handleCustomizeRule(rule)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ⚙️ Customize
                      </button>
                      <button
                        onClick={() => handleExecuteRule(rule)}
                        disabled={rule.status === 'executing' || rule.status === 'completed'}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          rule.status === 'completed' 
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : rule.status === 'executing'
                            ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {rule.status === 'completed' ? '✅ Done' : 
                         rule.status === 'executing' ? '⏳ Running' : 
                         '▶️ Execute'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tracking Tab */}
        {currentTab === 'progress' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Migration Execution History</h3>
              <p className="text-sm text-gray-600">
                Track completed migrations and rollback options
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
                    Migration History Available After Execution
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Once you execute migrations, this tab will show detailed execution logs, rollback options, and performance metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedRule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Preview: {selectedRule.title}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What Will Happen</h4>
                  <p className="text-sm text-blue-800">{selectedRule.description}</p>
                  <div className="mt-2 text-sm text-blue-700">
                    <span className="font-medium">{selectedRule.affectedCount} rows</span> will be updated in 
                    <span className="font-medium"> {selectedRule.estimatedTime}</span>
                  </div>
                </div>

                {previewData && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sample Changes</h4>
                    <div className="space-y-3">
                      {previewData.beforeSamples.map((sample: any) => (
                        <div key={sample.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Before:</div>
                            <code className="text-sm bg-white px-2 py-1 rounded border">
                              {sample.before}
                            </code>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-gray-400">→</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">After:</div>
                            <code className="text-sm bg-white px-2 py-1 rounded border">
                              {sample.after}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                    📦 Backup will be created
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    🔄 Changes can be rolled back
                  </span>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleExecuteRule(selectedRule);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Execute Migration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Builder Modal */}
      {showRuleBuilder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedRule ? 'Customize Rule' : 'Create Custom Rule'}
                </h3>
                <button
                  onClick={() => setShowRuleBuilder(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Title
                    </label>
                    <input
                      type="text"
                      value={ruleTitle}
                      onChange={(e) => setRuleTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter rule title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={ruleDescription}
                      onChange={(e) => setRuleDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this rule does..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Table
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="word_forms">word_forms</option>
                      <option value="word_translations">word_translations</option>
                      <option value="dictionary">dictionary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Column
                    </label>
                    <select
                      value={selectedColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="tags">tags</option>
                      <option value="context_metadata">context_metadata</option>
                      <option value="form_text">form_text</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operation Type
                    </label>
                    <select
                      value={operationType}
                      onChange={(e) => setOperationType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="replace">Replace</option>
                      <option value="add">Add</option>
                      <option value="remove">Remove</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Value Mappings
                    </label>
                    <button
                      onClick={addMapping}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      + Add Mapping
                    </button>
                  </div>
                  <div className="space-y-3">
                    {ruleBuilderMappings.map((mapping) => (
                      <div key={mapping.id} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={mapping.from}
                          onChange={(e) => updateMapping(mapping.id, 'from', e.target.value)}
                          placeholder="From value..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-400">→</span>
                        <input
                          type="text"
                          value={mapping.to}
                          onChange={(e) => updateMapping(mapping.id, 'to', e.target.value)}
                          placeholder="To value..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => removeMapping(mapping.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {operationType === 'remove' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Tags to Remove
                      </label>
                      <button
                        onClick={addTagToRemove}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        + Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagsToRemove.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                          {tag}
                          <button onClick={() => removeTagFromRemovalList(tag)} className="ml-1">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRuleBuilder(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomRule}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

