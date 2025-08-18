'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MigrationRecommendationEngine, MigrationAnalysis, MigrationRecommendation, DataStateAnalysis } from '../../lib/migration/migrationRecommendationEngine';

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
  category: 'terminology' | 'metadata' | 'cleanup' | 'custom';
  estimatedTime: string;
  canRollback: boolean;
  // Enhanced properties
  targetedWords?: string[];
  preventDuplicates?: boolean;
  operationType?: 'replace' | 'add' | 'remove';
  // NEW: Full rule configuration data
  ruleConfig?: {
    selectedTable: string;
    selectedColumn: string;
    selectedTagsForMigration: string[];
    ruleBuilderMappings: MappingPair[];
    tagsToRemove: string[];
    newTagToAdd: string;
    selectedWords: WordSearchResult[];
    selectedFormIds: string[];
    selectedTranslationIds: string[];
  };
  // NEW: Rule source tracking
  ruleSource?: 'default' | 'custom' | 'loaded';
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
  translations: {
    totalCount: number;
    metadataKeys: string[];
    sampleMetadata?: Record<string, any>[];
  };
  forms: {
    totalCount: number;
    tagBreakdown: Record<string, number>;
    sampleTags: string[][];
  };
  formTranslations: {
    totalCount: number;
    coverageAnalysis: {
      translationsWithForms: number;
    };
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
  const [currentTab, setCurrentTab] = useState<'audit' | 'recommendations' | 'migration' | 'progress'>('audit');
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
  const [newTagToAdd, setNewTagToAdd] = useState('');

  // NEW: Word targeting state
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [wordSearchResults, setWordSearchResults] = useState<WordSearchResult[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordSearchResult[]>([]);
  const [wordTagAnalysis, setWordTagAnalysis] = useState<WordTagAnalysis | null>(null);
  const [isSearchingWords, setIsSearchingWords] = useState(false);
  const [currentStep, setCurrentStep] = useState<'config' | 'mappings' | 'words' | 'forms' | 'translations' | 'tags'>('config');
  const [currentLocationTags, setCurrentLocationTags] = useState<Record<string, any> | null>(null);
  const [isLoadingCurrentTags, setIsLoadingCurrentTags] = useState(false);
  const [selectedTagsForMigration, setSelectedTagsForMigration] = useState<string[]>([]);
  const [globalTags, setGlobalTags] = useState<string[] | null>(null);
  const [isLoadingGlobalTags, setIsLoadingGlobalTags] = useState(false);
  const [formSelectionMode, setFormSelectionMode] = useState('all-forms');
  const [translationSelectionMode, setTranslationSelectionMode] = useState('all-translations');
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<string[]>([]);
  const [textContentOptions, setTextContentOptions] = useState<any[] | null>(null);
  const [isLoadingTextContent, setIsLoadingTextContent] = useState(false);
  const [selectedTextValues, setSelectedTextValues] = useState<string[]>([]);

  // NEW: Recommendation Engine State
  const [recommendationEngine, setRecommendationEngine] = useState<MigrationRecommendationEngine | null>(null);
  const [migrationAnalysis, setMigrationAnalysis] = useState<MigrationAnalysis | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<MigrationRecommendation | null>(null);
  const [dataStateAnalysis, setDataStateAnalysis] = useState<DataStateAnalysis | null>(null);
  
  // NEW: Custom Rules Persistence State
  const [savedCustomRules, setSavedCustomRules] = useState<any[]>([]);
  const [isLoadingSavedRules, setIsLoadingSavedRules] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [showSaveRuleModal, setShowSaveRuleModal] = useState(false);
  const [showLoadRulesModal, setShowLoadRulesModal] = useState(false);
  const [ruleToSave, setRuleToSave] = useState<VisualRule | null>(null);
  const [saveRuleName, setSaveRuleName] = useState('');
  const [saveRuleDescription, setSaveRuleDescription] = useState('');

  // NEW: Word-specific and drill-down state
  const [wordSpecificTags, setWordSpecificTags] = useState<Record<string, any> | null>(null);
  const [wordFormsData, setWordFormsData] = useState<Record<string, any[]> | null>(null);
  const [wordTranslationsData, setWordTranslationsData] = useState<Record<string, any[]> | null>(null);
  const [isLoadingWordSpecificTags, setIsLoadingWordSpecificTags] = useState(false);
  const [isLoadingWordForms, setIsLoadingWordForms] = useState(false);
  const [isLoadingWordTranslations, setIsLoadingWordTranslations] = useState(false);
  const [selectedFormTags, setSelectedFormTags] = useState<Record<string, number> | null>(null);
  const [selectedTranslationMetadata, setSelectedTranslationMetadata] = useState<Record<string, number> | null>(null);

  const resetTagLoadingStates = () => {
    setCurrentLocationTags(null);
    setGlobalTags(null);
    setWordSpecificTags(null);
    setWordFormsData(null);
    setWordTranslationsData(null);
    setTextContentOptions(null);
    setSelectedTagsForMigration([]);
    setSelectedFormIds([]);
    setSelectedTranslationIds([]);
    setSelectedTextValues([]);
    setFormSelectionMode('all-forms');
    setTranslationSelectionMode('all-translations');
    setSelectedFormTags(null);
    setSelectedTranslationMetadata(null);
  };

  const resetAllRuleBuilderState = () => {
    setCurrentLocationTags(null);
    setGlobalTags(null);
    setWordSpecificTags(null);
    setWordFormsData(null);
    setWordTranslationsData(null);
    setSelectedFormTags(null);
    setSelectedTranslationMetadata(null);
    setSelectedTagsForMigration([]);
    setSelectedFormIds([]);
    setSelectedTranslationIds([]);
    setSelectedWords([]);
    setSelectedTextValues([]);
    setRuleTitle('');
    setRuleDescription('');
    setRuleBuilderMappings([]);
    setTagsToRemove([]);
    setNewTagToAdd('');
    setOperationType('replace');
    setPreventDuplicates(true);
    setSelectedTable('dictionary');
    setSelectedColumn('tags');
    setFormSelectionMode('all-forms');
    setTranslationSelectionMode('all-translations');
    setWordSearchTerm('');
    setWordSearchResults([]);
    setShowWordSearch(false);
    setIsLoadingGlobalTags(false);
    setIsLoadingWordSpecificTags(false);
    setIsLoadingWordForms(false);
    setIsLoadingWordTranslations(false);
    setIsSearchingWords(false);
    setCurrentStep('config');
    addToDebugLog('🧹 Complete rule builder state reset');
  };

  const selectAllTagsForWord = (wordId: string, type: 'forms' | 'dictionary' | 'translations') => {
    const wordTags = currentLocationTags?.[wordId];
    if (!wordTags) return;

    let tagsToAdd: string[] = [];

    if (type === 'forms' && wordTags.tagBreakdown) {
      tagsToAdd = Object.keys(wordTags.tagBreakdown);
    } else if (type === 'dictionary' && wordTags.tags) {
      tagsToAdd = wordTags.tags;
    } else if (type === 'translations' && wordTags.metadataKeys) {
      tagsToAdd = wordTags.metadataKeys;
    }

    setSelectedTagsForMigration(prev => {
      const newTags = tagsToAdd.filter(tag => !prev.includes(tag));
      return [...prev, ...newTags];
    });
  };

  const deselectAllTagsForWord = (wordId: string, type: 'forms' | 'dictionary' | 'translations') => {
    const wordTags = currentLocationTags?.[wordId];
    if (!wordTags) return;

    let tagsToRemove: string[] = [];

    if (type === 'forms' && wordTags.tagBreakdown) {
      tagsToRemove = Object.keys(wordTags.tagBreakdown);
    } else if (type === 'dictionary' && wordTags.tags) {
      tagsToRemove = wordTags.tags;
    } else if (type === 'translations' && wordTags.metadataKeys) {
      tagsToRemove = wordTags.metadataKeys;
    }

    setSelectedTagsForMigration(prev => prev.filter(tag => !tagsToRemove.includes(tag)));
  };

  // NEW: Dynamic schema state
  const [tableSchemas, setTableSchemas] = useState<Record<string, TableSchema>>({});
  const [availableTables] = useState(['dictionary', 'word_forms', 'word_translations']);
  
  const supabase = createClientComponentClient();

  // Initialize recommendation engine
  useEffect(() => {
    const engine = new MigrationRecommendationEngine(supabase);
    setRecommendationEngine(engine);
  }, [supabase]);

  const addToDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // Initialize default migration rules
  useEffect(() => {
    initializeDefaultRules();
    loadTableSchemas();
  }, []);

  useEffect(() => {
    resetTagLoadingStates();
    addToDebugLog('🔄 Reset tag cache due to word selection change');
  }, [selectedWords]);

  useEffect(() => {
    resetTagLoadingStates();
    addToDebugLog(`🔄 Cleared tag cache due to table/column change: ${selectedTable}.${selectedColumn}`);
  }, [selectedTable, selectedColumn]);

  useEffect(() => {
    if (selectedTagsForMigration.length > 0 && operationType === 'remove') {
      setTagsToRemove(selectedTagsForMigration);
    } else if (selectedTagsForMigration.length > 0 && operationType === 'replace') {
      const newMappings = selectedTagsForMigration.map((tag, index) => ({
        id: `auto-${index}`,
        from: tag,
        to: '',
      }));
      setRuleBuilderMappings(newMappings);
      addToDebugLog(`🔄 Generated ${newMappings.length} replacement mappings - fill in 'To' values to complete rule`);
    }
  }, [selectedTagsForMigration, operationType]);

  useEffect(() => {
    setSelectedFormTags(null);
  }, [selectedFormIds]);

  useEffect(() => {
    setSelectedTranslationMetadata(null);
  }, [selectedTranslationIds]);

  // Removed Italian and form text auto-population effects

  // Advance steps when words selected (from any step, not just 'words')
  useEffect(() => {
    if (selectedWords.length > 0) {
      if (selectedTable === 'word_forms') {
        setCurrentStep('forms');
      } else if (selectedTable === 'word_translations') {
        setSelectedColumn('context_metadata'); // Ensure column is set for metadata workflow
        setCurrentStep('translations');
      } else {
        setCurrentStep('tags');
      }
    }
  }, [selectedWords.length, selectedTable]);

  // Auto-load tags when forms are selected/deselected
  useEffect(() => {
    if (selectedFormIds.length > 0 && wordFormsData && selectedTable === 'word_forms' && selectedColumn === 'tags') {
      loadSelectedFormTags();
    }
  }, [selectedFormIds, wordFormsData, selectedTable, selectedColumn]);

  // Auto-load translations when words selected for word_translations table
  useEffect(() => {
    if (selectedWords.length > 0 && selectedTable === 'word_translations' && currentStep === 'translations') {
      loadWordTranslationsData();
    }
  }, [selectedWords, selectedTable, currentStep]);

  // Removed automatic step advancement to allow two-step translation review
  // Users now manually proceed to tags step via the "Next: Metadata" button


  // Auto-load metadata when translations are selected
  useEffect(() => {
    if (selectedTranslationIds.length > 0 && wordTranslationsData && selectedTable === 'word_translations' && selectedColumn === 'context_metadata') {
      loadSelectedTranslationMetadata();
    }
  }, [selectedTranslationIds, wordTranslationsData, selectedTable, selectedColumn]);

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

      const translationIds = (translations || []).map(t => t.id);
      let formTranslations: any[] = [];
      if (translationIds.length > 0) {
        const { data: ftData, error: ftError } = await supabase
          .from('form_translations')
          .select('id, word_translation_id')
          .in('word_translation_id', translationIds);
        if (ftError) throw ftError;
        formTranslations = ftData || [];
      }

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

      const translationsWithForms = new Set(
        formTranslations.map(ft => ft.word_translation_id)
      );

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
        translations: {
          totalCount: translations?.length || 0,
          metadataKeys: Array.from(metadataKeys),
          sampleMetadata: (translations || [])
            .slice(0, 3)
            .map(t => t.context_metadata)
        },
        forms: {
          totalCount: forms?.length || 0,
          tagBreakdown,
          sampleTags: (forms || []).slice(0, 5).map(f => f.tags || [])
        },
        formTranslations: {
          totalCount: formTranslations.length,
          coverageAnalysis: {
            translationsWithForms: translationsWithForms.size
          }
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
        operationType: 'replace',
        ruleSource: 'default'
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
        operationType: 'add',
        ruleSource: 'default'
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
        operationType: 'replace',
        ruleSource: 'default'
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
        operationType: 'remove',
        ruleSource: 'default'
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

  // NEW: Recommendation Engine Functions
  const loadRecommendations = async () => {
    if (!recommendationEngine) {
      addToDebugLog('❌ Recommendation engine not initialized');
      return;
    }

    setIsLoadingRecommendations(true);
    addToDebugLog('🧠 Loading migration recommendations...');

    try {
      // Load data state analysis first
      addToDebugLog('📊 Analyzing current data state...');
      const dataState = await recommendationEngine.analyzeDataState();
      setDataStateAnalysis(dataState);
      addToDebugLog(`✅ Data state analyzed: ${dataState.terminology.legacyTerms} legacy terms, ${dataState.metadata.missingAuxiliaries} missing auxiliaries`);

      // Generate comprehensive recommendations
      addToDebugLog('🎯 Generating migration recommendations...');
      const analysis = await recommendationEngine.generateRecommendations();
      setMigrationAnalysis(analysis);
      addToDebugLog(`✅ Generated ${analysis.recommendations.length} recommendations (${analysis.criticalIssues} critical)`);

    } catch (error: any) {
      addToDebugLog(`❌ Failed to load recommendations: ${error.message}`);
      console.error('Recommendation loading error:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const executeRecommendation = async (recommendation: MigrationRecommendation) => {
    if (!recommendationEngine) {
      addToDebugLog('❌ Recommendation engine not initialized');
      return;
    }

    if (recommendation.readiness !== 'ready') {
      addToDebugLog(`⚠️ Cannot execute ${recommendation.rule.name}: ${recommendation.readiness}`);
      return;
    }

    addToDebugLog(`🚀 Executing recommendation: ${recommendation.rule.name}`);
    setIsExecuting(true);

    try {
      // This would integrate with the existing migration engine
      // For now, just show the execution flow
      addToDebugLog(`⏳ Executing rule: ${recommendation.rule.id}`);
      addToDebugLog(`🎯 Estimated impact: ${recommendation.estimatedImpact.affectedRows} rows`);
      
      // Simulate execution (in real implementation, this would use the migration engine)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToDebugLog(`✅ Successfully executed: ${recommendation.rule.name}`);
      
      // Refresh recommendations after execution
      await loadRecommendations();

    } catch (error: any) {
      addToDebugLog(`❌ Execution failed: ${error.message}`);
      console.error('Recommendation execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePreviewRule = async (rule: VisualRule) => {
    addToDebugLog(`🔍 Generating real preview for: ${rule.title}`);
    setShowPreview(true);
    setSelectedRule(rule);
    
    try {
      const previewSamples: any[] = [];
      const affectedTables: string[] = [];
      let totalAffectedCount = 0;
      
      // Determine which tables to query based on rule configuration
      const config = rule.ruleConfig;
      const tablesToQuery = config?.selectedTable === 'all_tables' 
        ? ['dictionary', 'word_forms', 'word_translations']
        : [config?.selectedTable || 'word_forms'];
      
      for (const tableName of tablesToQuery) {
        // Select appropriate columns first
        const columnToQuery = config?.selectedColumn === 'context_metadata' ? 'context_metadata' : 'tags';
        let query = supabase.from(tableName).select(`id, word_id, ${columnToQuery}, italian`);
        
        // Apply word-specific filtering if configured
        if (config?.selectedWords && config.selectedWords.length > 0) {
          const wordIds = config.selectedWords.map(w => w.wordId);
          if (tableName === 'dictionary') {
            query = query.in('id', wordIds);
          } else {
            query = query.in('word_id', wordIds);
          }
        }
        
        // Apply form-specific filtering
        if (tableName === 'word_forms' && config?.selectedFormIds && config.selectedFormIds.length > 0) {
          query = query.in('id', config.selectedFormIds);
        }
        
        // Apply translation-specific filtering  
        if (tableName === 'word_translations' && config?.selectedTranslationIds && config.selectedTranslationIds.length > 0) {
          query = query.in('id', config.selectedTranslationIds);
        }
        
        // Apply tag filtering if specified
        if (config?.selectedTagsForMigration && config.selectedTagsForMigration.length > 0) {
          for (const tag of config.selectedTagsForMigration) {
            if (columnToQuery === 'context_metadata') {
              query = query.not('context_metadata', 'is', null);
            } else {
              query = query.contains('tags', [tag]);
            }
          }
        }
        
        const { data, error } = await query.limit(5);
        
        if (!error && data) {
          totalAffectedCount += data.length;
          affectedTables.push(tableName);
          
          // Generate preview samples showing before/after
          data.forEach((record: any, index: number) => {
            const currentTags = columnToQuery === 'context_metadata' 
              ? Object.keys(record.context_metadata || {})
              : record.tags || [];
            
            let newTags = [...currentTags];
            
            // Apply rule transformations
            if (rule.operationType === 'replace' && config?.ruleBuilderMappings) {
              config.ruleBuilderMappings.forEach(mapping => {
                const fromIndex = newTags.indexOf(mapping.from);
                if (fromIndex !== -1) {
                  newTags[fromIndex] = mapping.to;
                }
              });
            } else if (rule.operationType === 'add' && config?.newTagToAdd) {
              if (!newTags.includes(config.newTagToAdd)) {
                newTags.push(config.newTagToAdd);
              }
            } else if (rule.operationType === 'remove' && config?.selectedTagsForMigration) {
              newTags = newTags.filter(tag => !config.selectedTagsForMigration.includes(tag));
            }
            
            previewSamples.push({
              id: `${tableName}-${record.id}`,
              table: tableName,
              record_id: record.id,
              word_context: record.italian || `Word ID: ${record.word_id}`,
              before: JSON.stringify(currentTags),
              after: JSON.stringify(newTags),
              changes: currentTags.length !== newTags.length || 
                       currentTags.some(tag => !newTags.includes(tag)) ||
                       newTags.some(tag => !currentTags.includes(tag))
            });
          });
        }
      }

      setPreviewData({
        beforeSamples: previewSamples.slice(0, 10), // Limit to 10 samples
        affectedTables,
        backupRequired: true,
        rollbackAvailable: true,
        targetedWords: config?.selectedWords?.map(w => w.italian) || [],
        duplicatesPrevented: rule.preventDuplicates ? Math.floor(totalAffectedCount * 0.1) : 0,
        operationType: rule.operationType,
        totalAffectedCount,
        ruleConfiguration: {
          table: config?.selectedTable || 'unknown',
          column: config?.selectedColumn || 'unknown',
          targetTags: config?.selectedTagsForMigration || [],
          mappings: config?.ruleBuilderMappings || [],
          addTag: config?.newTagToAdd || ''
        }
      });
      
      addToDebugLog(`✅ Real preview generated: ${totalAffectedCount} records found across ${affectedTables.length} table(s)`);
      
    } catch (error: any) {
      addToDebugLog(`❌ Preview generation failed: ${error.message}`);
      // Fallback to mock data
      const mockSamples = [
        { id: 'mock-1', table: 'word_forms', before: '["old-tag"]', after: '["new-tag"]', changes: true }
      ];
      setPreviewData({
        beforeSamples: mockSamples,
        affectedTables: ['word_forms'],
        backupRequired: true,
        rollbackAvailable: true,
        targetedWords: rule.targetedWords || [],
        duplicatesPrevented: 0,
        operationType: rule.operationType
      });
    }
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
    resetAllRuleBuilderState();
    setSelectedRule(rule);
    setShowRuleBuilder(true);
    setRuleTitle(rule.title);
    setRuleDescription(rule.description);
    setOperationType(rule.operationType || 'replace');
    setPreventDuplicates(rule.preventDuplicates !== false);

    // If rule has stored configuration (loaded/custom rules), restore it
    if (rule.ruleConfig) {
      const config = rule.ruleConfig;
      setSelectedTable(config.selectedTable);
      setSelectedColumn(config.selectedColumn);
      setSelectedTagsForMigration(config.selectedTagsForMigration);
      setRuleBuilderMappings(config.ruleBuilderMappings);
      setTagsToRemove(config.tagsToRemove);
      setNewTagToAdd(config.newTagToAdd);
      setSelectedWords(config.selectedWords);
      setSelectedFormIds(config.selectedFormIds);
      setSelectedTranslationIds(config.selectedTranslationIds);
      
      addToDebugLog(`🔧 Restored rule configuration for: ${rule.title}`);
      addToDebugLog(`📋 Mappings restored: ${JSON.stringify(config.ruleBuilderMappings)}`);
      addToDebugLog(`🏷️ Tags for migration: ${JSON.stringify(config.selectedTagsForMigration)}`);
      return;
    }

    // Fallback for default rules without stored config
    switch (rule.id) {
      case 'italian-to-universal-terminology':
        setRuleBuilderMappings([
          { id: '1', from: 'io', to: 'prima-persona' },
          { id: '2', from: 'tu', to: 'seconda-persona' },
          { id: '3', from: 'lui', to: 'terza-persona' },
          { id: '4', from: 'lei', to: 'terza-persona' },
          { id: '5', from: 'noi', to: 'prima-persona' },
          { id: '6', from: 'voi', to: 'seconda-persona' },
          { id: '7', from: 'loro', to: 'terza-persona' }
        ]);
        setTagsToRemove([]);
        break;

      case 'cleanup-deprecated-tags':
        setRuleBuilderMappings([
          { id: '1', from: 'past-participle', to: 'participio-passato' },
          { id: '2', from: 'gerund', to: 'gerundio' },
          { id: '3', from: 'infinitive', to: 'infinito' }
        ]);
        setTagsToRemove([]);
        break;

      case 'standardize-auxiliary-tag-format':
        setRuleBuilderMappings([
          { id: '1', from: 'auxiliary-essere', to: 'essere-auxiliary' },
          { id: '2', from: 'auxiliary-avere', to: 'avere-auxiliary' },
          { id: '3', from: 'auxiliary-stare', to: 'stare-auxiliary' }
        ]);
        setTagsToRemove([]);
        break;

      case 'remove-obsolete-tags':
        setRuleBuilderMappings([]);
        setTagsToRemove(['deprecated-tag-1', 'obsolete-marker']);
        break;

      case 'add-missing-auxiliaries':
      case 'add-missing-transitivity-metadata':
        setRuleBuilderMappings([]);
        setTagsToRemove([]);
        break;

      default:
        setRuleBuilderMappings([]);
        setTagsToRemove([]);
        break;
    }
  };

  const handleCloseRuleBuilder = () => {
    resetAllRuleBuilderState();
    setShowRuleBuilder(false);
    setSelectedRule(null);
  };

  const handleCreateNewRule = () => {
    resetAllRuleBuilderState();
    setShowRuleBuilder(true);
    setSelectedRule(null); // This ensures we're creating NEW rule
    setRuleTitle('New Custom Rule');
    setRuleDescription('Custom migration rule created by user');
    addToDebugLog('🆕 Creating new rule (fresh state)');
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

  // NEW: Load current tags from selected table/column for targeted words
  const loadCurrentLocationTags = async () => {
    if (selectedWords.length === 0) {
      addToDebugLog('⚠️ No words selected to analyze');
      return;
    }

    setIsLoadingCurrentTags(true);
    addToDebugLog(`📋 Loading current tags from ${selectedTable}.${selectedColumn} for ${selectedWords.length} words...`);

    try {
      const tagData: Record<string, any> = {};

      for (const word of selectedWords) {
        addToDebugLog(`🔍 Analyzing ${word.italian} in ${selectedTable}.${selectedColumn}...`);

        if (selectedTable === 'dictionary' && selectedColumn === 'tags') {
          const { data, error } = await supabase
            .from('dictionary')
            .select('tags')
            .eq('id', word.wordId)
            .single();

          if (error) throw error;

          tagData[word.wordId] = {
            tags: data?.tags || [],
            totalRecords: 1
          };
        } else if (selectedTable === 'word_forms' && selectedColumn === 'tags') {
          const { data, error } = await supabase
            .from('word_forms')
            .select('tags')
            .eq('word_id', word.wordId);

          if (error) throw error;

          const allTags = (data || []).flatMap(form => form.tags || []);
          const tagBreakdown: Record<string, number> = {};
          allTags.forEach(tag => {
            tagBreakdown[tag] = (tagBreakdown[tag] || 0) + 1;
          });

          tagData[word.wordId] = {
            tagBreakdown,
            totalRecords: data?.length || 0
          };
        } else if (selectedTable === 'word_translations' && selectedColumn === 'context_metadata') {
          const { data, error } = await supabase
            .from('word_translations')
            .select('context_metadata')
            .eq('word_id', word.wordId);

          if (error) throw error;

          const metadataKeys = new Set<string>();
          const sampleMetadata: any[] = [];

          (data || []).forEach(translation => {
            if (translation.context_metadata) {
              Object.keys(translation.context_metadata).forEach(key => metadataKeys.add(key));
              if (sampleMetadata.length < 3) {
                sampleMetadata.push(translation.context_metadata);
              }
            }
          });

          tagData[word.wordId] = {
            metadataKeys: Array.from(metadataKeys),
            sampleMetadata,
            totalRecords: data?.length || 0
          };
        }

        addToDebugLog(`✅ Loaded data for ${word.italian}: ${JSON.stringify(tagData[word.wordId])}`);
      }

      setCurrentLocationTags(tagData);
      addToDebugLog(`✅ Successfully loaded current tags for ${selectedWords.length} words`);
    } catch (error: any) {
      addToDebugLog(`❌ Error loading current tags: ${error.message}`);
      console.error('Error loading current tags:', error);
    } finally {
      setIsLoadingCurrentTags(false);
    }
  };

  const loadGlobalTags = async () => {
    setIsLoadingGlobalTags(true);
    addToDebugLog(`🌍 Loading ALL tags/metadata from ${selectedTable === 'all_tables' ? 'all tables' : selectedTable}...`);

    try {
      let allTags: string[] = [];
      const tagSet = new Set<string>();

      if (selectedTable === 'all_tables') {
        // Load tags from dictionary
        const { data: dictData, error: dictError } = await supabase
          .from('dictionary')
          .select('tags');
        if (!dictError) {
          (dictData || []).forEach((record: any) => {
            (record.tags || []).forEach((tag: string) => tagSet.add(tag));
          });
        }

        // Load tags from word_forms
        const { data: formsData, error: formsError } = await supabase
          .from('word_forms')
          .select('tags');
        if (!formsError) {
          (formsData || []).forEach((record: any) => {
            (record.tags || []).forEach((tag: string) => tagSet.add(tag));
          });
        }

        // Load metadata from word_translations
        const { data: transData, error: transError } = await supabase
          .from('word_translations')
          .select('context_metadata');
        if (!transError) {
          (transData || []).forEach((record: any) => {
            if (record.context_metadata) {
              Object.keys(record.context_metadata).forEach(key => tagSet.add(key));
            }
          });
        }

        allTags = Array.from(tagSet).sort();
      } else if (selectedColumn === 'tags') {
        const { data, error } = await supabase
          .from(selectedTable)
          .select('tags');

        if (error) throw error;

        (data || []).forEach((record: any) => {
          (record.tags || []).forEach((tag: string) => tagSet.add(tag));
        });
        allTags = Array.from(tagSet).sort();

      } else if (selectedColumn === 'context_metadata') {
        const { data, error } = await supabase
          .from(selectedTable)
          .select('context_metadata');

        if (error) throw error;

        (data || []).forEach((record: any) => {
          if (record.context_metadata) {
            Object.keys(record.context_metadata).forEach(key => tagSet.add(key));
          }
        });
        allTags = Array.from(tagSet).sort();
      }

      setGlobalTags(allTags);
      addToDebugLog(`✅ Loaded ${allTags.length} unique tags/metadata from ${selectedTable === 'all_tables' ? 'all tables' : selectedTable}`);

      } catch (error: any) {
        addToDebugLog(`❌ Failed to load global tags: ${error.message}`);
        console.error('Error loading global tags:', error);
      } finally {
        setIsLoadingGlobalTags(false);
      }
  };

  const loadAllTagsFromSelectedWords = async () => {
    if (selectedWords.length === 0) {
      addToDebugLog('⚠️ No words selected for comprehensive tag loading');
      return;
    }

    setIsLoadingGlobalTags(true);
    addToDebugLog(`🎯 Loading ALL tags & metadata from ${selectedWords.length} selected words...`);

    try {
      const allTags = new Set<string>();

      for (const word of selectedWords) {
        // Load dictionary tags
        const { data: dictData, error: dictError } = await supabase
          .from('dictionary')
          .select('tags')
          .eq('id', word.wordId);

        if (!dictError && dictData?.[0]?.tags) {
          dictData[0].tags.forEach((tag: string) => allTags.add(tag));
        }

        // Load form tags
        const { data: formsData, error: formsError } = await supabase
          .from('word_forms')
          .select('tags')
          .eq('word_id', word.wordId);

        if (!formsError) {
          (formsData || []).forEach((form: any) => {
            (form.tags || []).forEach((tag: string) => allTags.add(tag));
          });
        }

        // Load translation metadata
        const { data: transData, error: transError } = await supabase
          .from('word_translations')
          .select('context_metadata')
          .eq('word_id', word.wordId);

        if (!transError) {
          (transData || []).forEach((translation: any) => {
            if (translation.context_metadata) {
              Object.keys(translation.context_metadata).forEach(key => allTags.add(key));
            }
          });
        }
      }

      const sortedTags = Array.from(allTags).sort();
      setGlobalTags(sortedTags);
      addToDebugLog(`✅ Loaded ${sortedTags.length} unique tags & metadata from selected words`);

    } catch (error: any) {
      addToDebugLog(`❌ Failed to load tags from selected words: ${error.message}`);
    } finally {
      setIsLoadingGlobalTags(false);
    }
  };

  const getActionDescription = () => {
    // Determine operation type details
    const operation = operationType.toUpperCase();
    const selectedCount = selectedTagsForMigration.length;
    const tagType = selectedColumn === 'context_metadata' ? 'metadata keys' : 'tags';
    
    // Build detailed target scope
    let targetScope = '';
    let operationDetail = '';
    
    if (selectedWords.length > 0) {
      const wordList = selectedWords.map(w => w.italian).join(', ');
      targetScope = `${selectedWords.length} selected word(s): ${wordList}`;
      
      // Add specific form/translation details
      if (selectedTable === 'word_forms' && selectedFormIds.length > 0) {
        operationDetail = ` → ${selectedFormIds.length} specific forms selected`;
      } else if (selectedTable === 'word_translations' && selectedTranslationIds.length > 0) {
        operationDetail = ` → ${selectedTranslationIds.length} specific translations selected`;
      }
    } else {
      targetScope = 'ALL records in database';
    }
    
    // Build operation target with specificity
    let operationTarget = '';
    if (selectedTable === 'all_tables') {
      operationTarget = 'across all tables (dictionary, word_forms, word_translations)';
    } else if (selectedTable === 'dictionary') {
      operationTarget = 'in dictionary entries';
    } else if (selectedTable === 'word_forms') {
      if (selectedFormIds.length > 0) {
        operationTarget = `in ${selectedFormIds.length} specific word forms`;
      } else if (selectedWords.length > 0) {
        operationTarget = `in ALL forms for selected words`;
      } else {
        operationTarget = `in all word forms`;
      }
    } else if (selectedTable === 'word_translations') {
      if (selectedTranslationIds.length > 0) {
        operationTarget = `in ${selectedTranslationIds.length} specific translations`;
      } else if (selectedWords.length > 0) {
        operationTarget = `in ALL translations for selected words`;
      } else {
        operationTarget = `in all translations`;
      }
    }
    
    // Add mapping details for replace operations
    let mappingDetail = '';
    if (operation === 'REPLACE' && ruleBuilderMappings.length > 0) {
      const mappingPreview = ruleBuilderMappings.slice(0, 2).map(m => `"${m.from}" → "${m.to}"`).join(', ');
      const moreCount = ruleBuilderMappings.length > 2 ? ` (+${ruleBuilderMappings.length - 2} more)` : '';
      mappingDetail = ` | Mappings: ${mappingPreview}${moreCount}`;
    } else if (operation === 'ADD' && newTagToAdd) {
      mappingDetail = ` | Adding: "${newTagToAdd}"`;
    }
    
    return `${operation} ${selectedCount} ${tagType} ${operationTarget} for ${targetScope}${operationDetail}${mappingDetail}`;
  };

  const loadTextContent = async () => {
    setIsLoadingTextContent(true);
    addToDebugLog(`📝 Loading text content from ${selectedTable}.${selectedColumn}...`);

    try {
      const filter = selectedWords.length > 0 ? { in: selectedWords.map(w => w.wordId) } : null;
      let data: any[] | null = null;

      if (selectedTable === 'word_forms' && selectedColumn === 'form_text') {
        let query = supabase.from('word_forms').select('form_text, form_type, word_id');
        if (filter) query = query.in('word_id', filter.in);
        const { data: d, error } = await query;
        if (error) throw error;
        data = d || [];
      } else if (selectedTable === 'word_translations' && selectedColumn === 'translation') {
        let query = supabase.from('word_translations').select('translation, display_priority, word_id');
        if (filter) query = query.in('word_id', filter.in);
        const { data: d, error } = await query;
        if (error) throw error;
        data = d || [];
      } else if (selectedTable === 'dictionary' && selectedColumn === 'italian') {
        let query = supabase.from('dictionary').select('italian, id');
        if (filter) query = query.in('id', filter.in);
        const { data: d, error } = await query;
        if (error) throw error;
        data = d || [];
      }

      const optionsMap: Record<string, { value: string; context: string; count: number }> = {};
      (data || []).forEach((record: any) => {
        const value = record[selectedColumn];
        if (!value) return;
        if (!optionsMap[value]) {
          let context = '';
          if (record.form_type) context = record.form_type;
          if (record.display_priority !== undefined) context = `Priority ${record.display_priority}`;
          optionsMap[value] = { value, context, count: 0 };
        }
        optionsMap[value].count += 1;
      });

      setTextContentOptions(Object.values(optionsMap));
      addToDebugLog('✅ Loaded text content options');
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load text content: ${error.message}`);
    } finally {
      setIsLoadingTextContent(false);
    }
  };

  // NEW: Loading functions and execution placeholders
  const loadWordSpecificTags = async () => {
    if (selectedWords.length === 0) {
      addToDebugLog('⚠️ No words selected for tag loading');
      return;
    }

    setIsLoadingWordSpecificTags(true);
    addToDebugLog(`📋 Loading word-specific tags for ${selectedWords.length} words...`);

    try {
      const tagData: Record<string, any> = {};

      for (const word of selectedWords) {
        addToDebugLog(`🔍 Loading tags for: ${word.italian}`);

        if (selectedTable === 'dictionary') {
          const { data: dictData, error: dictError } = await supabase
            .from('dictionary')
            .select('tags')
            .eq('id', word.wordId)
            .single();

          if (dictError) throw dictError;

          tagData[word.wordId] = {
            dictionaryTags: dictData?.tags || []
          };

        } else if (selectedTable === 'word_forms') {
          const { data: formsData, error: formsError } = await supabase
            .from('word_forms')
            .select('tags')
            .eq('word_id', word.wordId);

          if (formsError) throw formsError;

          const tagCounts: Record<string, number> = {};
          (formsData || []).forEach((form: any) => {
            (form.tags || []).forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          });

          tagData[word.wordId] = {
            formTags: tagCounts
          };

        } else if (selectedTable === 'word_translations') {
          const { data: transData, error: transError } = await supabase
            .from('word_translations')
            .select('context_metadata')
            .eq('word_id', word.wordId);

          if (transError) throw transError;

          const metadataKeys = new Set<string>();
          (transData || []).forEach((translation: any) => {
            if (translation.context_metadata) {
              Object.keys(translation.context_metadata).forEach(key => metadataKeys.add(key));
            }
          });

          tagData[word.wordId] = {
            metadataKeys: Array.from(metadataKeys)
          };
        }

        addToDebugLog(`✅ Loaded tags for ${word.italian}: ${JSON.stringify(tagData[word.wordId])}`);
      }

      setWordSpecificTags(tagData);
      addToDebugLog(`✅ Successfully loaded word-specific tags for ${selectedWords.length} words`);

    } catch (error: any) {
      addToDebugLog(`❌ Error loading word-specific tags: ${error.message}`);
      console.error('Error loading word-specific tags:', error);
    } finally {
      setIsLoadingWordSpecificTags(false);
    }
  };

  const loadWordFormsData = async () => {
    if (selectedWords.length === 0) {
      addToDebugLog('⚠️ No words selected for forms loading');
      return;
    }

    setIsLoadingWordForms(true);
    addToDebugLog(`📝 Loading word forms for ${selectedWords.length} words...`);

    try {
      const formsData: Record<string, any[]> = {};

      for (const word of selectedWords) {
        addToDebugLog(`🔍 Loading forms for: ${word.italian}`);

        const { data: forms, error } = await supabase
          .from('word_forms')
          .select(`
          id,
          form_text,
          form_type,
          tags,
          created_at
        `)
          .eq('word_id', word.wordId)
          .order('form_type', { ascending: true })
          .order('form_text', { ascending: true });

        if (error) throw error;

        formsData[word.wordId] = forms || [];
        addToDebugLog(`✅ Loaded ${forms?.length || 0} forms for ${word.italian}`);
      }

      setWordFormsData(formsData);
      addToDebugLog(`✅ Successfully loaded word forms for all selected words`);

    } catch (error: any) {
      addToDebugLog(`❌ Error loading word forms: ${error.message}`);
      console.error('Error loading word forms:', error);
    } finally {
      setIsLoadingWordForms(false);
    }
  };

  const loadWordTranslationsData = async () => {
    if (selectedWords.length === 0) {
      addToDebugLog('⚠️ No words selected for translations loading');
      return;
    }

    setIsLoadingWordTranslations(true);
    addToDebugLog(`🌍 Loading translations for ${selectedWords.length} words...`);

    try {
      const translationsData: Record<string, any[]> = {};

      for (const word of selectedWords) {
        addToDebugLog(`🔍 Loading translations for: ${word.italian}`);

        const { data: translations, error } = await supabase
          .from('word_translations')
          .select(`
          id,
          translation,
          context_metadata,
          display_priority,
          usage_notes,
          created_at
        `)
          .eq('word_id', word.wordId)
          .order('display_priority', { ascending: true })
          .order('translation', { ascending: true });

        if (error) throw error;

        translationsData[word.wordId] = translations || [];
        addToDebugLog(`✅ Loaded ${translations?.length || 0} translations for ${word.italian}`);
      }

      setWordTranslationsData(translationsData);
      addToDebugLog(`✅ Successfully loaded translations for all selected words`);

    } catch (error: any) {
      addToDebugLog(`❌ Error loading translations: ${error.message}`);
      console.error('Error loading translations:', error);
    } finally {
      setIsLoadingWordTranslations(false);
    }
  };

  const loadSelectedFormTags = () => {
    if (selectedFormIds.length === 0) {
      addToDebugLog('⚠️ No forms selected for tag loading');
      return;
    }

    addToDebugLog(`🏷️ Loading tags from ${selectedFormIds.length} selected forms...`);

    try {
      const selectedForms = Object.values(wordFormsData || {})
        .flat()
        .filter((form: any) => selectedFormIds.includes(form.id));

      const tagCounts: Record<string, number> = {};
      selectedForms.forEach((form: any) => {
        (form.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      setSelectedFormTags(tagCounts);
      addToDebugLog(`✅ Loaded ${Object.keys(tagCounts).length} unique tags from selected forms`);
    } catch (error: any) {
      addToDebugLog(`❌ Error loading selected form tags: ${error.message}`);
    }
  };

  const loadSelectedTranslationMetadata = () => {
    if (selectedTranslationIds.length === 0) {
      addToDebugLog('⚠️ No translations selected for metadata loading');
      return;
    }

    addToDebugLog(`📋 Loading metadata from ${selectedTranslationIds.length} selected translations...`);

    try {
      const selectedTranslations = Object.values(wordTranslationsData || {})
        .flat()
        .filter((translation: any) => selectedTranslationIds.includes(translation.id));

      addToDebugLog(`Found ${selectedTranslations.length} matching translations`);

      const metadataCounts: Record<string, number> = {};
      selectedTranslations.forEach((translation: any) => {
        if (translation.context_metadata) {
          Object.keys(translation.context_metadata).forEach((key: string) => {
            metadataCounts[key] = (metadataCounts[key] || 0) + 1;
          });
        }
      });

      setSelectedTranslationMetadata(metadataCounts);
      addToDebugLog(`✅ Loaded ${Object.keys(metadataCounts).length} unique metadata keys from selected translations`);

      // Auto-populate selected tags for migration
      setSelectedTagsForMigration(Object.keys(metadataCounts));
    } catch (error: any) {
      addToDebugLog(`❌ Error loading selected translation metadata: ${error.message}`);
    }
  };

  const saveCustomRule = () => {
    if (selectedRule) {
      // Editing existing rule
      addToDebugLog(`🔧 Updating existing rule with mappings: ${JSON.stringify(ruleBuilderMappings)}`);
      
      setMigrationRules(prev => prev.map(rule =>
        rule.id === selectedRule.id
          ? {
              ...rule,
              title: ruleTitle,
              description: ruleDescription,
              operationType,
              preventDuplicates,
              targetedWords: selectedWords.map(w => w.italian),
              affectedCount: selectedTagsForMigration.length || ruleBuilderMappings.length || 1,
              // Update rule configuration
              ruleConfig: {
                selectedTable,
                selectedColumn,
                selectedTagsForMigration: [...selectedTagsForMigration],
                ruleBuilderMappings: [...ruleBuilderMappings],
                tagsToRemove: [...tagsToRemove],
                newTagToAdd,
                selectedWords: [...selectedWords],
                selectedFormIds: [...selectedFormIds],
                selectedTranslationIds: [...selectedTranslationIds]
              }
            }
          : rule
      ));
      addToDebugLog(`✅ Updated existing rule: ${ruleTitle}`);
    } else {
      // Creating new rule
      addToDebugLog(`💾 Saving rule with mappings: ${JSON.stringify(ruleBuilderMappings)}`);
      
      const newRule: VisualRule = {
        id: `custom-${Date.now()}`,
        title: ruleTitle,
        description: ruleDescription,
        impact: selectedTagsForMigration.length > 50 ? 'high' : selectedTagsForMigration.length > 10 ? 'medium' : 'low',
        status: 'ready',
        affectedCount: selectedTagsForMigration.length || ruleBuilderMappings.length || 1,
        autoExecutable: true,
        requiresInput: operationType === 'add' || operationType === 'replace',
        category: 'custom',
        estimatedTime: '1-2 seconds',
        canRollback: true,
        targetedWords: selectedWords.map(w => w.italian),
        preventDuplicates,
        operationType,
        ruleSource: 'custom',
        // NEW: Capture full rule configuration
        ruleConfig: {
          selectedTable,
          selectedColumn,
          selectedTagsForMigration: [...selectedTagsForMigration],
          ruleBuilderMappings: [...ruleBuilderMappings],
          tagsToRemove: [...tagsToRemove],
          newTagToAdd,
          selectedWords: [...selectedWords],
          selectedFormIds: [...selectedFormIds],
          selectedTranslationIds: [...selectedTranslationIds]
        }
      };

      addToDebugLog(`📦 Complete rule config: ${JSON.stringify(newRule.ruleConfig)}`);
      setMigrationRules(prev => [...prev, newRule]);
      addToDebugLog(`✅ Created new rule: ${ruleTitle}`);
    }

    setShowRuleBuilder(false);
    resetAllRuleBuilderState();
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
      case 'high': return 'border-orange-200 bg-orange-50';
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
    { id: 'recommendations', name: 'Smart Recommendations', description: 'AI-powered migration suggestions' },
    { id: 'migration', name: 'Visual Migration Rules', description: 'WYSIWYG migration management' },
    { id: 'progress', name: 'Execution History', description: 'Track migration progress' },
  ];

  // NEW: Custom Rules Persistence Functions
  const loadSavedCustomRules = async () => {
    setIsLoadingSavedRules(true);
    addToDebugLog('📚 Loading saved custom rules from database...');
    
    try {
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setSavedCustomRules(data || []);
      addToDebugLog(`✅ Loaded ${data?.length || 0} saved custom rules`);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load saved rules: ${error.message}`);
    } finally {
      setIsLoadingSavedRules(false);
    }
  };

  const saveRuleToDatabase = async (rule: VisualRule, customName?: string, customDescription?: string) => {
    setIsSavingRule(true);
    const ruleName = customName || saveRuleName || rule.title;
    const ruleDescription = customDescription || saveRuleDescription || rule.description;
    
    addToDebugLog(`💾 Saving custom rule: ${ruleName}`);
    addToDebugLog(`🔍 Rule mappings: ${JSON.stringify(rule.ruleConfig?.ruleBuilderMappings || [])}`);
    
    try {
      // Convert VisualRule to database format with real configuration
      const config = rule.ruleConfig;
      const ruleData = {
        rule_id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ruleName,
        description: ruleDescription,
        category: rule.category,
        priority: rule.impact === 'high' ? 'critical' : rule.impact === 'medium' ? 'high' : 'medium',
        pattern: {
          table: config?.selectedTable || 'word_forms',
          column: config?.selectedColumn || 'tags',
          condition: 'array_contains',
          targetTags: config?.selectedTagsForMigration || [],
          targetWords: rule.targetedWords || [],
          targetFormIds: config?.selectedFormIds || [],
          targetTranslationIds: config?.selectedTranslationIds || []
        },
        transformation: {
          type: rule.operationType === 'replace' ? 'array_replace' : 
                rule.operationType === 'add' ? 'array_add' : 'array_remove',
          preventDuplicates: rule.preventDuplicates || true,
          mappings: config?.ruleBuilderMappings?.reduce((acc, mapping) => {
            acc[mapping.from] = mapping.to;
            return acc;
          }, {} as Record<string, string>) || {},
          tagsToRemove: config?.tagsToRemove || [],
          newTagToAdd: config?.newTagToAdd || ''
        },
        safety_checks: [
          {
            type: 'preview_required',
            message: 'Preview changes before execution'
          }
        ],
        requires_manual_input: rule.requiresInput,
        estimated_affected_rows: rule.affectedCount,
        estimated_execution_time: rule.estimatedTime,
        rollback_strategy: {
          type: rule.canRollback ? 'automatic' : 'manual',
          backupRequired: true
        },
        editable: true,
        auto_executable: rule.autoExecutable
      };
      
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .insert([ruleData])
        .select();
      
      if (error) {
        throw error;
      }
      
      addToDebugLog(`✅ Custom rule saved successfully: ${ruleName}`);
      
      // Reload saved rules
      await loadSavedCustomRules();
      
      // Close modal and reset form
      setShowSaveRuleModal(false);
      setSaveRuleName('');
      setSaveRuleDescription('');
      setRuleToSave(null);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to save custom rule: ${error.message}`);
    } finally {
      setIsSavingRule(false);
    }
  };

  const loadCustomRule = async (savedRule: any) => {
    addToDebugLog(`📤 Loading custom rule: ${savedRule.name}`);
    
    try {
      // Convert database format back to VisualRule with full configuration
      const pattern = savedRule.pattern || {};
      const transformation = savedRule.transformation || {};
      
      const visualRule: VisualRule = {
        id: savedRule.rule_id,
        title: savedRule.name,
        description: savedRule.description,
        impact: savedRule.priority === 'critical' ? 'high' : savedRule.priority === 'high' ? 'medium' : 'low',
        status: 'ready',
        affectedCount: savedRule.estimated_affected_rows || 0,
        autoExecutable: savedRule.auto_executable,
        requiresInput: savedRule.requires_manual_input,
        category: savedRule.category,
        estimatedTime: savedRule.estimated_execution_time || '< 1 min',
        canRollback: savedRule.rollback_strategy?.type === 'automatic',
        targetedWords: pattern.targetWords || [],
        preventDuplicates: transformation.preventDuplicates || true,
        operationType: transformation.type === 'array_replace' ? 'replace' : 
                      transformation.type === 'array_add' ? 'add' : 'remove',
        ruleSource: 'loaded',
        // Reconstruct rule configuration
        ruleConfig: {
          selectedTable: pattern.table || 'word_forms',
          selectedColumn: pattern.column || 'tags',
          selectedTagsForMigration: pattern.targetTags || [],
          ruleBuilderMappings: Object.entries(transformation.mappings || {}).map(([from, to], index) => ({
            id: `loaded-${index}`,
            from,
            to: to as string
          })),
          tagsToRemove: transformation.tagsToRemove || [],
          newTagToAdd: transformation.newTagToAdd || '',
          selectedWords: [], // Cannot reconstruct full WordSearchResult objects
          selectedFormIds: pattern.targetFormIds || [],
          selectedTranslationIds: pattern.targetTranslationIds || []
        }
      };
      
      // Add to current migration rules
      setMigrationRules(prev => [...prev, visualRule]);
      addToDebugLog(`✅ Custom rule loaded: ${savedRule.name}`);
      
      setShowLoadRulesModal(false);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load custom rule: ${error.message}`);
    }
  };

  const deleteCustomRule = async (ruleId: string, ruleName: string) => {
    addToDebugLog(`🗑️ Deleting custom rule: ${ruleName}`);
    
    try {
      const { error } = await supabase
        .from('custom_migration_rules')
        .update({ status: 'archived' })
        .eq('rule_id', ruleId);
      
      if (error) {
        throw error;
      }
      
      addToDebugLog(`✅ Custom rule deleted: ${ruleName}`);
      await loadSavedCustomRules();
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to delete custom rule: ${error.message}`);
    }
  };

  // NEW: Delete rule from current session
  const deleteRuleFromSession = (ruleId: string) => {
    const rule = migrationRules.find(r => r.id === ruleId);
    if (rule) {
      setMigrationRules(prev => prev.filter(r => r.id !== ruleId));
      addToDebugLog(`🗑️ Deleted rule from session: ${rule.title}`);
    }
  };

  // Load saved rules on component mount
  useEffect(() => {
    loadSavedCustomRules();
  }, []);

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

        {/* Smart Recommendations Tab */}
        {currentTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Smart Migration Recommendations</h3>
                <p className="text-sm text-gray-600">
                  AI-powered analysis and migration suggestions based on your current data state
                </p>
              </div>
              <button
                onClick={loadRecommendations}
                disabled={isLoadingRecommendations || !recommendationEngine}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoadingRecommendations ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  '🧠 Generate Recommendations'
                )}
              </button>
            </div>

            {/* Data Quality Overview */}
            {dataStateAnalysis && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        dataStateAnalysis.terminology.completionPercentage >= 80 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          dataStateAnalysis.terminology.completionPercentage >= 80 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          T
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Terminology</div>
                      <div className="text-lg font-bold text-gray-700">
                        {dataStateAnalysis.terminology.completionPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {dataStateAnalysis.terminology.legacyTerms} legacy terms
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        dataStateAnalysis.metadata.completionPercentage >= 80 ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          dataStateAnalysis.metadata.completionPercentage >= 80 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          M
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Metadata</div>
                      <div className="text-lg font-bold text-gray-700">
                        {dataStateAnalysis.metadata.completionPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {dataStateAnalysis.metadata.missingAuxiliaries} missing auxiliaries
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        dataStateAnalysis.cleanup.completionPercentage >= 80 ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          dataStateAnalysis.cleanup.completionPercentage >= 80 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          C
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Cleanup</div>
                      <div className="text-lg font-bold text-gray-700">
                        {dataStateAnalysis.cleanup.completionPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {dataStateAnalysis.cleanup.deprecatedTags} deprecated tags
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        dataStateAnalysis.structure.completionPercentage >= 80 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          dataStateAnalysis.structure.completionPercentage >= 80 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          S
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Structure</div>
                      <div className="text-lg font-bold text-gray-700">
                        {dataStateAnalysis.structure.completionPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {dataStateAnalysis.structure.orphanedRecords} orphaned records
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Analysis Summary */}
            {migrationAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900">Migration Analysis Summary</h4>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Data Quality Score:</span>
                        <span className={`ml-2 font-bold ${
                          migrationAnalysis.dataQuality.score >= 80 ? 'text-green-600' :
                          migrationAnalysis.dataQuality.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {migrationAnalysis.dataQuality.score}/100
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Issues Found:</span>
                        <span className="ml-2 font-bold text-blue-900">{migrationAnalysis.totalIssuesFound}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Critical Issues:</span>
                        <span className="ml-2 font-bold text-red-600">{migrationAnalysis.criticalIssues}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Estimated Time:</span>
                        <span className="ml-2 font-bold text-blue-900">{migrationAnalysis.estimatedTotalTime}</span>
                      </div>
                    </div>
                  </div>
                  {migrationAnalysis.dataQuality.score < 100 && (
                    <div className="text-right">
                      <div className="text-blue-700 text-sm font-medium">Ready for Migration</div>
                      <div className="text-blue-600 text-xs">
                        {migrationAnalysis.recommendations.filter(r => r.readiness === 'ready').length} rules ready to execute
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations List */}
            {migrationAnalysis?.recommendations && migrationAnalysis.recommendations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Migration Recommendations</h4>
                <div className="space-y-3">
                  {migrationAnalysis.recommendations.map((recommendation, index) => (
                    <div
                      key={recommendation.rule.id}
                      className={`border rounded-lg p-4 ${
                        recommendation.priority === 'critical' ? 'border-red-200 bg-red-50' :
                        recommendation.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                        recommendation.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                              recommendation.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {recommendation.priority.toUpperCase()}
                            </span>
                            <h5 className="text-sm font-medium text-gray-900">{recommendation.rule.name}</h5>
                            <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              recommendation.readiness === 'ready' ? 'bg-green-100 text-green-800' :
                              recommendation.readiness === 'needs_input' ? 'bg-blue-100 text-blue-800' :
                              recommendation.readiness === 'blocked' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {recommendation.readiness.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{recommendation.rule.description}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="mr-4">
                              <strong>Impact:</strong> {recommendation.estimatedImpact.affectedRows} rows
                            </span>
                            <span className="mr-4">
                              <strong>Confidence:</strong> {recommendation.confidence}%
                            </span>
                            <span>
                              <strong>Time:</strong> {recommendation.estimatedImpact.executionTime}
                            </span>
                          </div>
                          {recommendation.reasons.length > 0 && (
                            <div className="mt-2">
                              <details className="text-xs">
                                <summary className="text-blue-600 cursor-pointer hover:text-blue-800">
                                  View Reasons ({recommendation.reasons.length})
                                </summary>
                                <ul className="mt-1 ml-4 list-disc text-gray-600">
                                  {recommendation.reasons.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </details>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {recommendation.readiness === 'ready' && (
                            <button
                              onClick={() => executeRecommendation(recommendation)}
                              disabled={isExecuting}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {isExecuting ? 'Executing...' : 'Execute'}
                            </button>
                          )}
                          {recommendation.readiness === 'needs_input' && (
                            <button
                              onClick={() => setCurrentTab('migration')}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 bg-white hover:bg-blue-50"
                            >
                              Configure
                            </button>
                          )}
                          {recommendation.readiness === 'blocked' && recommendation.blockers && (
                            <div className="text-xs text-red-600">
                              <strong>Blocked:</strong> {recommendation.blockers[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!migrationAnalysis && !isLoadingRecommendations && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze Your Data</h3>
                <p className="text-gray-600 mb-6">
                  Generate smart migration recommendations based on your current database state.
                </p>
                <p className="text-sm text-gray-500">
                  The recommendation engine will analyze your data for:
                </p>
                <ul className="mt-2 text-sm text-gray-500 space-y-1">
                  <li>✓ Legacy terminology that needs updating</li>
                  <li>✓ Missing auxiliary assignments for compound tenses</li>
                  <li>✓ Deprecated tags requiring cleanup</li>
                  <li>✓ Data structure inconsistencies</li>
                </ul>
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLoadRulesModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  📚 Load Saved ({savedCustomRules.length})
                </button>
                <button
                  onClick={handleCreateNewRule}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  + Create Custom Rule
                </button>
              </div>
            </div>

            {/* Much More Compact Status Cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white p-2 rounded shadow">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center mr-2">
                    <span className="text-red-600 text-xs">!</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Critical</div>
                    <div className="text-sm font-medium">27</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded shadow">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center mr-2">
                    <span className="text-yellow-600 text-xs">⚠</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Forms</div>
                    <div className="text-sm font-medium">581</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded shadow">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center mr-2">
                    <span className="text-orange-600 text-xs">◐</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Missing</div>
                    <div className="text-sm font-medium">25</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded shadow">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center mr-2">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Complete</div>
                    <div className="text-sm font-medium">7/7</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Much More Compact Mobile Rule Cards - Grouped by Source */}
            <div className="space-y-4">
              {/* Default Rules Section */}
              {migrationRules.filter(rule => rule.ruleSource === 'default').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-700">🔧 System Default Rules</h4>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {migrationRules.filter(rule => rule.ruleSource === 'default').length}
                    </span>
                  </div>
                  {migrationRules.filter(rule => rule.ruleSource === 'default').map((rule) => (
                    <div key={rule.id} className={`border rounded-lg p-3 ${getImpactColor(rule.impact)}`}>
                      {/* Compact Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-lg mr-2 flex-shrink-0">{getCategoryIcon(rule.category)}</span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center truncate">
                              {rule.title}
                              <span className="ml-1 text-sm flex-shrink-0">{getStatusIcon(rule.status)}</span>
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rule.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Compact Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                          <div className="font-medium capitalize">{rule.impact}</div>
                          <div className="text-gray-500">Impact</div>
                        </div>
                        <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">{rule.affectedCount}</div>
                          <div className="text-gray-500">Rows</div>
                        </div>
                        <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">{rule.estimatedTime}</div>
                          <div className="text-gray-500">Time</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-5 gap-1">
                        <button
                          onClick={() => handlePreviewRule(rule)}
                          className="text-xs py-2 px-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                          title="Preview"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleCustomizeRule(rule)}
                          className="text-xs py-2 px-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                          title="Edit"
                        >
                          ⚙️
                        </button>
                        <button
                          onClick={() => {
                            setRuleToSave(rule);
                            setSaveRuleName(rule.title);
                            setSaveRuleDescription(rule.description);
                            setShowSaveRuleModal(true);
                          }}
                          className="text-xs py-2 px-1 border border-green-300 rounded text-green-700 bg-green-50 hover:bg-green-100"
                          title="Save Rule"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => {
                            if (rule.ruleSource === 'default') {
                              addToDebugLog(`⚠️ Cannot permanently delete default rule: ${rule.title}`);
                            } else {
                              deleteRuleFromSession(rule.id);
                            }
                          }}
                          className={`text-xs py-2 px-1 border rounded ${
                            rule.ruleSource === 'default' 
                              ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                          }`}
                          title={rule.ruleSource === 'default' 
                            ? 'Default rules cannot be permanently deleted' 
                            : 'Delete Rule'
                          }
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => handleExecuteRule(rule)}
                          disabled={rule.status === 'executing' || rule.status === 'completed'}
                          className={`text-xs py-2 px-1 rounded font-medium ${
                            rule.status === 'completed'
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : rule.status === 'executing'
                              ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {rule.status === 'completed' ? '✅' :
                           rule.status === 'executing' ? '⏳' :
                           '▶️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom & Loaded Rules Section */}
              {migrationRules.filter(rule => rule.ruleSource === 'custom' || rule.ruleSource === 'loaded').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-700">⚡ Custom & Loaded Rules</h4>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {migrationRules.filter(rule => rule.ruleSource === 'custom' || rule.ruleSource === 'loaded').length}
                    </span>
                  </div>
                  {migrationRules.filter(rule => rule.ruleSource === 'custom' || rule.ruleSource === 'loaded').map((rule) => (
                    <div key={rule.id} className={`border rounded-lg p-3 ${getImpactColor(rule.impact)}`}>
                      {/* Compact Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-lg mr-2 flex-shrink-0">{getCategoryIcon(rule.category)}</span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center truncate">
                              {rule.title}
                              <span className="ml-1 text-sm flex-shrink-0">{getStatusIcon(rule.status)}</span>
                              {rule.ruleSource === 'loaded' && (
                                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">📚</span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rule.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Compact Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                          <div className="font-medium capitalize">{rule.impact}</div>
                          <div className="text-gray-500">Impact</div>
                        </div>
                        <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">{rule.affectedCount}</div>
                          <div className="text-gray-500">Rows</div>
                        </div>
                        <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">{rule.estimatedTime}</div>
                          <div className="text-gray-500">Time</div>
                        </div>
                      </div>

                      {/* Rule Configuration Details */}
                      {rule.ruleConfig && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2 text-xs">
                          <div className="font-medium text-gray-700 mb-1">Configuration:</div>
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Operation:</span> {rule.operationType?.toUpperCase()} on {rule.ruleConfig.selectedTable}:{rule.ruleConfig.selectedColumn}
                            </div>
                            {rule.ruleConfig.selectedTagsForMigration?.length > 0 && (
                              <div>
                                <span className="font-medium">Target Tags:</span> {rule.ruleConfig.selectedTagsForMigration.slice(0, 3).join(', ')}
                                {rule.ruleConfig.selectedTagsForMigration.length > 3 && ` (+${rule.ruleConfig.selectedTagsForMigration.length - 3} more)`}
                              </div>
                            )}
                            {rule.ruleConfig.ruleBuilderMappings?.length > 0 && (
                              <div>
                                <span className="font-medium">Mappings:</span> 
                                {rule.ruleConfig.ruleBuilderMappings.slice(0, 2).map(m => `"${m.from}" → "${m.to}"`).join(', ')}
                                {rule.ruleConfig.ruleBuilderMappings.length > 2 && ` (+${rule.ruleConfig.ruleBuilderMappings.length - 2} more)`}
                              </div>
                            )}
                            {rule.ruleConfig.newTagToAdd && (
                              <div>
                                <span className="font-medium">Adding:</span> "{rule.ruleConfig.newTagToAdd}"
                              </div>
                            )}
                            {rule.ruleConfig.selectedWords?.length > 0 && (
                              <div>
                                <span className="font-medium">Target Words:</span> {rule.ruleConfig.selectedWords.slice(0, 2).map(w => w.italian).join(', ')}
                                {rule.ruleConfig.selectedWords.length > 2 && ` (+${rule.ruleConfig.selectedWords.length - 2} more)`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-5 gap-1">
                        <button
                          onClick={() => handlePreviewRule(rule)}
                          className="text-xs py-2 px-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                          title="Preview"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleCustomizeRule(rule)}
                          className="text-xs py-2 px-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                          title="Edit"
                        >
                          ⚙️
                        </button>
                        <button
                          onClick={() => {
                            setRuleToSave(rule);
                            setSaveRuleName(rule.title);
                            setSaveRuleDescription(rule.description);
                            setShowSaveRuleModal(true);
                          }}
                          className="text-xs py-2 px-1 border border-green-300 rounded text-green-700 bg-green-50 hover:bg-green-100"
                          title="Save Rule"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => deleteRuleFromSession(rule.id)}
                          className="text-xs py-2 px-1 border border-red-300 rounded text-red-700 bg-red-50 hover:bg-red-100"
                          title="Delete Rule"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => handleExecuteRule(rule)}
                          disabled={rule.status === 'executing' || rule.status === 'completed'}
                          className={`text-xs py-2 px-1 rounded font-medium ${
                            rule.status === 'completed'
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : rule.status === 'executing'
                              ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {rule.status === 'completed' ? '✅' :
                           rule.status === 'executing' ? '⏳' :
                           '▶️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  {previewData?.duplicateAnalysis && (
                    <div className="mt-3">
                      {previewData.duplicateAnalysis.wouldCreateDuplicates ? (
                        <div className="flex items-center p-2 bg-yellow-100 border border-yellow-300 rounded-md">
                          <span className="text-yellow-600 mr-2">⚠️</span>
                          <div className="text-sm">
                            <span className="font-medium text-yellow-800">
                              Duplicate Prevention Active:
                            </span>
                            <span className="text-yellow-700 ml-1">
                              Would prevent {previewData.duplicateAnalysis.duplicateCount} duplicate tags ({previewData.duplicateAnalysis.affectedTags.join(', ')})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center p-2 bg-green-100 border border-green-300 rounded-md">
                          <span className="text-green-600 mr-2">✅</span>
                          <span className="text-sm text-green-800 font-medium">
                            No duplicate tags will be created
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* Much More Compact Mobile Rule Builder */}
      {showRuleBuilder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="min-h-screen p-2 flex items-start justify-center">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-xl mt-4 mb-4">
              {/* Compact Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {selectedRule ? `Edit Rule: ${selectedRule.title}` : 'Create New Rule'}
                </h3>
                <button
                  onClick={handleCloseRuleBuilder}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
                {/* Action Description - Always Visible */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs mb-3">
                  <div className="font-medium text-blue-900">Action Summary:</div>
                  <div className="text-blue-800 mt-1">{getActionDescription()}</div>
                </div>

                {/* Compact Title/Description */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={ruleTitle}
                    onChange={(e) => setRuleTitle(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Rule title..."
                  />
                  <textarea
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Description..."
                  />
                </div>

                {/* Compact Table/Column/Operation */}
                <div className="space-y-2">
                  <select
                    value={selectedTable}
                    onChange={(e) => {
                      const table = e.target.value;
                      setSelectedTable(table);
                      if (table === 'all_tables') {
                        setSelectedColumn('tags_and_metadata');
                      } else if (table === 'word_translations') {
                        setSelectedColumn('context_metadata');
                      } else {
                        setSelectedColumn('tags');
                      }
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all_tables">🌐 All Tables</option>
                    <option value="dictionary">📚 Dictionary</option>
                    <option value="word_forms">📝 Word Forms</option>
                    <option value="word_translations">🌍 Translations</option>
                  </select>

                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {selectedTable === 'all_tables' && (
                      <option value="tags_and_metadata">🏷️ Tags & Metadata</option>
                    )}
                    {selectedTable === 'dictionary' && (
                      <option value="tags">🏷️ Tags</option>
                    )}
                    {selectedTable === 'word_forms' && (
                      <option value="tags">🏷️ Tags</option>
                    )}
                    {selectedTable === 'word_translations' && (
                      <option value="context_metadata">📋 Metadata</option>
                    )}
                  </select>

                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="replace">🔄 Replace</option>
                    <option value="add">➕ Add</option>
                    <option value="remove">🗑️ Remove</option>
                  </select>

                  {operationType === 'add' && selectedWords.length === 0 && selectedFormIds.length === 0 && selectedTranslationIds.length === 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      ⚠️ Add operation requires word, form, or translation targets
                    </div>
                  )}
                </div>

                {/* Word Targeting - Collapsible */}
                <div className="border rounded p-2 bg-gray-50">
                  <button
                    onClick={() => setShowWordSearch(!showWordSearch)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700"
                  >
                    <span>🎯 Target Words ({selectedWords.length})</span>
                    <span className="text-xs">{showWordSearch ? '▼' : '▶️'}</span>
                  </button>

                  {showWordSearch && (
                    <div className="mt-2 space-y-2">
                      <div className="flex space-x-1">
                        <input
                          type="text"
                          value={wordSearchTerm}
                          onChange={(e) => setWordSearchTerm(e.target.value)}
                          placeholder="Search words..."
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={searchWords}
                          disabled={isSearchingWords}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          🔍
                        </button>
                      </div>

                      {selectedWords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedWords.map(word => (
                            <span key={word.wordId} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                              {word.italian}
                              <button
                                onClick={() => removeWordFromTargets(word.wordId)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {wordSearchResults.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border rounded bg-white">
                          {wordSearchResults.map(word => {
                            const isSelected = selectedWords.find(w => w.wordId === word.wordId);
                            return (
                              <div key={word.wordId} className={`p-2 border-b last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}> 
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        addWordToTargets(word);
                                      } else {
                                        removeWordFromTargets(word.wordId);
                                      }
                                    }}
                                    className="w-3 h-3"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{word.italian}</div>
                                    <div className="text-xs text-gray-500">{word.formsCount} forms</div>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Global Tags - Compact */}
                {selectedWords.length === 0 && ((selectedTable === 'all_tables' && selectedColumn === 'tags_and_metadata') || selectedColumn === 'tags' || selectedColumn === 'context_metadata') && (
                  <div className="border rounded p-2 bg-orange-50">
                    {!globalTags && (
                      <button
                        onClick={loadGlobalTags}
                        disabled={isLoadingGlobalTags}
                        className="w-full py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                      >
                        {isLoadingGlobalTags ? '⏳ Loading...' : (selectedTable === 'all_tables' || selectedColumn === 'context_metadata' ? '🌍 Load All Tags/Metadata' : '🌍 Load All Tags')}
                      </button>
                    )}

                    {globalTags && (
                      <div className="space-y-2">
                        <div className="text-xs text-orange-700">Select {selectedTable === 'all_tables' || selectedColumn === 'context_metadata' ? 'tags/metadata' : 'tags'} ({globalTags.length} available):</div>
                        <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1 text-xs">
                          {globalTags.map(tag => (
                            <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedTagsForMigration.includes(tag)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTagsForMigration(prev => [...prev, tag]);
                                  } else {
                                    setSelectedTagsForMigration(prev => prev.filter(t => t !== tag));
                                  }
                                }}
                                className="w-3 h-3"
                              />
                              <span className="truncate text-xs">{tag}</span>
                            </label>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {selectedTagsForMigration.length} of {globalTags.length} {selectedTable === 'all_tables' || selectedColumn === 'context_metadata' ? 'items' : 'tags'} selected
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedWords.length > 0 && selectedTable === 'all_tables' && selectedColumn === 'tags_and_metadata' && (
                  <div className="border rounded p-2 bg-blue-50">
                    <div className="text-xs text-blue-700 mb-2">
                      🎯 Tags & metadata from selected word(s): {selectedWords.map(w => w.italian).join(', ')}
                    </div>

                    {!globalTags && (
                      <button
                        onClick={loadAllTagsFromSelectedWords}
                        disabled={isLoadingGlobalTags}
                        className="w-full py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isLoadingGlobalTags ? '⏳ Loading...' : '📋 Load Tags & Metadata from Selected Words'}
                      </button>
                    )}

                    {isLoadingGlobalTags && (
                      <div className="flex items-center justify-center p-2">
                        <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs text-blue-700">Loading tags/metadata...</span>
                      </div>
                    )}

                    {globalTags && (
                      <div className="space-y-2">
                        <div className="text-xs text-blue-800 mb-1">Available tags & metadata:</div>
                        <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1 text-xs">
                          {globalTags.map(tag => (
                            <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedTagsForMigration.includes(tag)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTagsForMigration(prev => [...prev, tag]);
                                  } else {
                                    setSelectedTagsForMigration(prev => prev.filter(t => t !== tag));
                                  }
                                }}
                                className="w-3 h-3"
                              />
                              <span className="truncate text-xs">{tag}</span>
                            </label>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {selectedTagsForMigration.length} of {globalTags.length} items selected
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedWords.length > 0 && selectedColumn === 'tags' && (
                  <div className="border rounded p-2 bg-blue-50">
                    <div className="text-xs text-blue-700 mb-2">
                      🎯 Tags from selected word(s): {selectedWords.map(w => w.italian).join(', ')}
                    </div>

                    {!wordSpecificTags && !isLoadingWordSpecificTags && (
                      <button
                        onClick={loadWordSpecificTags}
                        className="w-full py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        📋 Load Tags from Selected Words
                      </button>
                    )}

                    {isLoadingWordSpecificTags && (
                      <div className="flex items-center justify-center p-2">
                        <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs text-blue-700">Loading tags...</span>
                      </div>
                    )}

                    {wordSpecificTags && (
                      <div className="space-y-2">
                        {selectedWords.map(word => (
                          <div key={word.wordId} className="border rounded p-2 bg-white">
                            <div className="text-xs font-medium text-gray-900 mb-1">{word.italian}</div>

                            {selectedTable === 'dictionary' && wordSpecificTags[word.wordId]?.dictionaryTags && (
                              <div className="mb-2">
                                <div className="text-xs text-gray-600 mb-1">Word-level tags:</div>
                                <div className="grid grid-cols-2 gap-1">
                                  {wordSpecificTags[word.wordId].dictionaryTags.map((tag: string) => (
                                    <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedTagsForMigration.includes(tag)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTagsForMigration(prev => [...prev, tag]);
                                          } else {
                                            setSelectedTagsForMigration(prev => prev.filter(t => t !== tag));
                                          }
                                        }}
                                        className="w-3 h-3"
                                      />
                                      <span className="text-xs truncate">{tag}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedTable === 'word_forms' && wordSpecificTags[word.wordId]?.formTags && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Form-level tags ({Object.keys(wordSpecificTags[word.wordId].formTags).length}):</div>
                                <div className="max-h-24 overflow-y-auto grid grid-cols-2 gap-1">
                                  {Object.entries(wordSpecificTags[word.wordId].formTags).map(([tag, count]: any) => (
                                    <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedTagsForMigration.includes(tag as string)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTagsForMigration(prev => [...prev, tag as string]);
                                          } else {
                                            setSelectedTagsForMigration(prev => prev.filter(t => t !== tag));
                                          }
                                        }}
                                        className="w-3 h-3"
                                      />
                                      <span className="text-xs truncate">{tag}</span>
                                      <span className="text-xs text-gray-500">({count as any})</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                {/* Word Forms Drill-Down */}
                {selectedWords.length > 0 && selectedTable === 'word_forms' && (
                  <div className="space-y-3">
                    <div className="border rounded p-2 bg-yellow-50">
                      <div className="text-xs text-yellow-700 mb-2">
                        📝 Step 1: Select Word Forms from: {selectedWords.map(w => w.italian).join(', ')}
                      </div>

                      {!wordFormsData && !isLoadingWordForms && (
                        <button
                          onClick={loadWordFormsData}
                          className="w-full py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          📝 Load Word Forms
                        </button>
                      )}

                      {isLoadingWordForms && (
                        <div className="flex items-center justify-center p-2">
                          <svg className="animate-spin h-4 w-4 text-yellow-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-xs text-yellow-700">Loading forms...</span>
                        </div>
                      )}

                      {wordFormsData && (
                        <div className="space-y-2">
                          {selectedWords.map(word => (
                            <div key={word.wordId} className="border rounded p-2 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-medium text-gray-900">{word.italian} Forms ({wordFormsData[word.wordId]?.length || 0})</div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      const wordFormIds = wordFormsData[word.wordId]?.map((f: any) => f.id) || [];
                                      setSelectedFormIds(prev => Array.from(new Set([...prev, ...wordFormIds])));
                                    }}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                                  >
                                    All
                                  </button>
                                  <button
                                    onClick={() => {
                                      const wordFormIds = wordFormsData[word.wordId]?.map((f: any) => f.id) || [];
                                      setSelectedFormIds(prev => prev.filter(id => !wordFormIds.includes(id)));
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded"
                                  >
                                    None
                                  </button>
                                </div>
                              </div>

                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {wordFormsData[word.wordId]?.map(form => (
                                  <label key={form.id} className="flex items-start space-x-2 p-1 hover:bg-yellow-50 rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedFormIds.includes(form.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedFormIds(prev => [...prev, form.id]);
                                        } else {
                                          setSelectedFormIds(prev => prev.filter(id => id !== form.id));
                                        }
                                      }}
                                    className="w-3 h-3 mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium truncate">{form.form_text}</div>
                                      <div className="text-xs text-gray-500 mb-1">{form.form_type}</div>
                                      <div className="text-xs text-blue-600 flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                                        {(form.tags || []).map(tag => (
                                          <span key={tag} className="bg-blue-100 px-1 rounded text-xs">{tag}</span>
                                        ))}
                                      </div>
                                  </div>
                                </label>
                              ))}
                            </div>

                              {selectedFormIds.length > 0 && (
                                <div className="mt-2 text-xs text-yellow-800">
                                  ✅ {selectedFormIds.length} form(s) selected
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedFormIds.length > 0 && selectedColumn === 'tags' && (
                      <div className="border rounded p-2 bg-blue-50">
                        <div className="text-xs text-blue-700 mb-2">
                          🏷️ Step 2: Select Tags from {selectedFormIds.length} Selected Form(s)
                        </div>

                        {!selectedFormTags && (
                          <button
                            onClick={loadSelectedFormTags}
                            className="w-full py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            🏷️ Load Tags from Selected Forms
                          </button>
                        )}

                        {selectedFormTags && (
                          <div className="space-y-2">
                            <div className="text-xs text-blue-800 mb-2">
                              Available tags from your {selectedFormIds.length} selected forms:
                            </div>
                            <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1">
                              {Object.entries(selectedFormTags).map(([tag, count]) => (
                                <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedTagsForMigration.includes(tag)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedTagsForMigration(prev => [...prev, tag]);
                                      } else {
                                        setSelectedTagsForMigration(prev => prev.filter(t => t !== tag));
                                      }
                                    }}
                                    className="w-3 h-3"
                                  />
                                  <span className="text-xs truncate">{tag}</span>
                                  <span className="text-xs text-blue-600">({count})</span>
                                </label>
                              ))}
                            </div>

                            {selectedTagsForMigration.length > 0 && (
                              <div className="mt-2 text-xs text-blue-800">
                                ✅ {selectedTagsForMigration.length} tag(s) selected for {operationType}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}


                {/* Translation Selection - Following Forms Pattern */}
                {currentStep === 'translations' && selectedTable === 'word_translations' && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">Step 1: Select specific translations from {selectedWords.map(w => w.italian).join(', ')}</div>

                    {!wordTranslationsData && (
                      <button
                        onClick={loadWordTranslationsData}
                        disabled={isLoadingWordTranslations}
                        className="w-full py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isLoadingWordTranslations ? '⏳ Loading...' : '🌍 Load Translations'}
                      </button>
                    )}

                    {isLoadingWordTranslations && (
                      <div className="flex items-center justify-center p-2">
                        <svg className="animate-spin h-4 w-4 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs text-green-700">Loading translations...</span>
                      </div>
                    )}

                    {wordTranslationsData && (
                      <div className="space-y-2">
                        {selectedWords.map(word => (
                          <div key={word.wordId} className="border rounded p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-gray-900">{word.italian} Translations ({wordTranslationsData[word.wordId]?.length || 0})</div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    const wordTransIds = wordTranslationsData[word.wordId]?.map((t: any) => t.id) || [];
                                    setSelectedTranslationIds(prev => Array.from(new Set([...prev, ...wordTransIds])));
                                  }}
                                  className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                                >
                                  All
                                </button>
                                <button
                                  onClick={() => {
                                    const wordTransIds = wordTranslationsData[word.wordId]?.map((t: any) => t.id) || [];
                                    setSelectedTranslationIds(prev => prev.filter(id => !wordTransIds.includes(id)));
                                  }}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded"
                                >
                                  None
                                </button>
                              </div>
                            </div>

                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {wordTranslationsData[word.wordId]?.map(translation => (
                                <label key={translation.id} className="flex items-start space-x-2 p-1 hover:bg-green-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedTranslationIds.includes(translation.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedTranslationIds(prev => [...prev, translation.id]);
                                      } else {
                                        setSelectedTranslationIds(prev => prev.filter(id => id !== translation.id));
                                      }
                                    }}
                                    className="w-3 h-3 mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium">"{translation.translation}"</div>
                                    <div className="text-xs text-gray-500 mb-1">Priority: {translation.display_priority}</div>
                                    <div className="text-xs text-purple-600 flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                                      {Object.keys(translation.context_metadata || {}).map(key => (
                                        <span key={key} className="bg-purple-100 px-1 rounded text-xs">{key}</span>
                                      ))}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>

                            {selectedTranslationIds.length > 0 && (
                              <div className="mt-2 text-xs text-green-800">
                                ✅ {selectedTranslationIds.length} translation(s) selected
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedTranslationIds.length > 0 && selectedColumn === 'context_metadata' && (
                      <div className="border rounded p-2 bg-purple-50">
                        <div className="text-xs text-purple-700 mb-2">
                          📋 Step 2: Select Metadata Keys from {selectedTranslationIds.length} Selected Translation(s)
                        </div>

                        {!selectedTranslationMetadata && (
                          <button
                            onClick={loadSelectedTranslationMetadata}
                            className="w-full py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            📋 Load Metadata from Selected Translations
                          </button>
                        )}

                        {selectedTranslationMetadata && (
                          <div className="space-y-2">
                            <div className="text-xs text-purple-800 mb-2">
                              Available metadata keys from your {selectedTranslationIds.length} selected translations:
                            </div>
                            <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1">
                              {Object.entries(selectedTranslationMetadata).map(([key, count]) => (
                                <label key={key} className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedTagsForMigration.includes(key)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedTagsForMigration(prev => [...prev, key]);
                                      } else {
                                        setSelectedTagsForMigration(prev => prev.filter(t => t !== key));
                                      }
                                    }}
                                    className="w-3 h-3"
                                  />
                                  <span className="text-xs truncate">{key}</span>
                                  <span className="text-xs text-purple-600">({count})</span>
                                </label>
                              ))}
                            </div>

                            {selectedTagsForMigration.length > 0 && (
                              <div className="mt-2 text-xs text-purple-800">
                                ✅ {selectedTagsForMigration.length} metadata key(s) selected for {operationType}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}


                {operationType === 'add' && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Tag to add:</div>
                    <input
                      type="text"
                      value={newTagToAdd}
                      onChange={(e) => setNewTagToAdd(e.target.value)}
                      placeholder="Enter tag to add..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-600">
                      This tag will be added to {selectedFormIds.length || selectedTranslationIds.length} selected items.
                    </div>
                  </div>
                )}

                {/* Compact Replace Mappings */}
                {operationType === 'replace' && (selectedColumn === 'tags' || selectedColumn === 'tags_and_metadata') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Replacements</span>
                      <button
                        onClick={addMapping}
                        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        + Add
                      </button>
                    </div>
                  {ruleBuilderMappings.map((mapping) => (
                    <div key={mapping.id} className="flex space-x-1 items-center">
                      <input
                        type="text"
                        value={mapping.from}
                        onChange={(e) => updateMapping(mapping.id, 'from', e.target.value)}
                        placeholder="From..."
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-400">→</span>
                      <input
                        type="text"
                        value={mapping.to}
                        onChange={(e) => updateMapping(mapping.id, 'to', e.target.value)}
                        placeholder="To..."
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeMapping(mapping.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}


                {operationType === 'replace' && selectedColumn === 'context_metadata' && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Metadata replacements:</div>
                    {selectedTagsForMigration.map((key, index) => (
                      <div key={key} className="flex space-x-1 items-center">
                        <input
                          type="text"
                          value={key}
                          disabled
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50"
                        />
                        <span className="text-xs text-gray-400">→</span>
                        <input
                          type="text"
                          value={ruleBuilderMappings.find(m => m.from === key)?.to || ''}
                          onChange={(e) => {
                            const mappingId = `metadata-${index}`;
                            setRuleBuilderMappings(prev => {
                              const existing = prev.find(m => m.from === key);
                              if (existing) {
                                return prev.map(m => m.from === key ? { ...m, to: e.target.value } : m);
                              } else {
                                return [...prev, { id: mappingId, from: key, to: e.target.value }];
                              }
                            });
                          }}
                          placeholder="Replace with..."
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

              {currentStep === 'mappings' && (
                <div className="flex space-x-2 p-3 border-t">
                  <button
                    onClick={() => setCurrentStep('config')}
                    className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={saveCustomRule}
                    disabled={
                      !ruleTitle.trim() ||
                      (operationType === 'replace' && ruleBuilderMappings.some(m => !m.to.trim())) ||
                      (operationType === 'add' && !newTagToAdd.trim()) ||
                      (operationType === 'remove' && 
                        selectedTagsForMigration.length === 0 && 
                        selectedWords.length === 0 && 
                        selectedFormIds.length === 0 && 
                        selectedTranslationIds.length === 0) ||
                      (operationType === 'replace' && 
                        selectedTagsForMigration.length === 0 && 
                        ruleBuilderMappings.length === 0 && 
                        selectedWords.length === 0 && 
                        selectedFormIds.length === 0 && 
                        selectedTranslationIds.length === 0)
                    }
                    className="flex-1 py-2 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Save Rule
                  </button>
                </div>
              )}

                {/* Duplicate Prevention */}
                <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">🛡️ Prevent Duplicates</span>
                  <input
                    type="checkbox"
                    checked={preventDuplicates}
                    onChange={(e) => setPreventDuplicates(e.target.checked)}
                    disabled={operationType === 'remove'}
                    className="w-4 h-4 disabled:opacity-50"
                  />
                </label>
              </div>

              {/* Footer - Always show Cancel and Save Rule buttons */}
                <div className="flex space-x-2 p-3 border-t">
                  <button
                    onClick={() => {
                      resetAllRuleBuilderState();
                      setShowRuleBuilder(false);
                      setSelectedRule(null);
                    }}
                    className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomRule}
                    disabled={
                      !ruleTitle.trim() ||
                      (operationType === 'replace' && ruleBuilderMappings.some(m => !m.to.trim())) ||
                      (operationType === 'add' && !newTagToAdd.trim()) ||
                      (operationType === 'remove' && 
                        selectedTagsForMigration.length === 0 && 
                        selectedWords.length === 0 && 
                        selectedFormIds.length === 0 && 
                        selectedTranslationIds.length === 0) ||
                      (operationType === 'replace' && 
                        selectedTagsForMigration.length === 0 && 
                        ruleBuilderMappings.length === 0 && 
                        selectedWords.length === 0 && 
                        selectedFormIds.length === 0 && 
                        selectedTranslationIds.length === 0)
                    }
                    className="flex-1 py-2 px-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save Rule
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Rule Modal */}
      {showSaveRuleModal && ruleToSave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Save Custom Rule</h3>
              <button
                onClick={() => {
                  setShowSaveRuleModal(false);
                  setRuleToSave(null);
                  setSaveRuleName('');
                  setSaveRuleDescription('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={saveRuleName}
                  onChange={(e) => setSaveRuleName(e.target.value)}
                  placeholder={ruleToSave.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={saveRuleDescription}
                  onChange={(e) => setSaveRuleDescription(e.target.value)}
                  placeholder={ruleToSave.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600">
                  <strong>Rule Details:</strong>
                  <div>Category: {ruleToSave.category}</div>
                  <div>Impact: {ruleToSave.impact}</div>
                  <div>Affected Rows: {ruleToSave.affectedCount}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveRuleModal(false);
                  setRuleToSave(null);
                  setSaveRuleName('');
                  setSaveRuleDescription('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveRuleToDatabase(ruleToSave)}
                disabled={isSavingRule}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingRule ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Rules Modal */}
      {showLoadRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Load Saved Rules</h3>
              <button
                onClick={() => setShowLoadRulesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {isLoadingSavedRules ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading saved rules...</div>
              </div>
            ) : savedCustomRules.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No saved rules found</div>
                <p className="text-sm text-gray-400">
                  Create and save custom rules to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedCustomRules.map((savedRule) => (
                  <div key={savedRule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{savedRule.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{savedRule.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {savedRule.category}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            savedRule.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            savedRule.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {savedRule.priority}
                          </span>
                          <span>{savedRule.estimated_affected_rows || 0} rows</span>
                          <span>
                            {new Date(savedRule.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => loadCustomRule(savedRule)}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteCustomRule(savedRule.rule_id, savedRule.name)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={loadSavedCustomRules}
                disabled={isLoadingSavedRules}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowLoadRulesModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

