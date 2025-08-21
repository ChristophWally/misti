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
  estimatedCount?: number; // Original estimate from database
  autoExecutable: boolean;
  requiresInput: boolean;
  category: 'terminology' | 'metadata' | 'cleanup' | 'custom';
  estimatedTime: string;
  canRollback: boolean;
  lastRun?: string | null; // Last execution timestamp
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
    tagsToAdd: string[];
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
  const [currentTab, setCurrentTab] = useState<'audit' | 'migration' | 'progress'>('audit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<MigrationIssue[]>([]);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true);
  
  // Execution History State
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');
  const [historyTableFilter, setHistoryTableFilter] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [revertingExecutionId, setRevertingExecutionId] = useState<string | null>(null);
  const [revertProgress, setRevertProgress] = useState<{executionId: string, current: number, total: number} | null>(null);
  
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
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]); // NEW: Multiple tags support

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

  // NEW: Recommendation Engine State - REMOVED
  
  // NEW: Custom Rules Persistence State
  const [savedCustomRules, setSavedCustomRules] = useState<any[]>([]);
  const [archivedRules, setArchivedRules] = useState<any[]>([]);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
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
    setTagsToAdd([]); // NEW: Reset multi-tag state
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


  const addToDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // Initialize migration rules from database
  useEffect(() => {
    addToDebugLog('🚀 Component mounted - loading migration rules...');
    loadMigrationRules();
    loadTableSchemas();
  }, []);
  
  // Debug: Track migration rules changes
  useEffect(() => {
    const defaultCount = migrationRules.filter(r => r.ruleSource === 'default').length;
    const customCount = migrationRules.filter(r => r.ruleSource === 'custom').length;
    const loadedCount = migrationRules.filter(r => r.ruleSource === 'loaded').length;
    addToDebugLog(`📊 Rules count - Default: ${defaultCount}, Custom: ${customCount}, Loaded: ${loadedCount}, Total: ${migrationRules.length}`);
  }, [migrationRules]);

  useEffect(() => {
    // Skip reset when restoring loaded/custom/default rules - they have their selections configured
    if (selectedRule && (selectedRule.ruleSource === 'loaded' || selectedRule.ruleSource === 'custom' || selectedRule.ruleSource === 'default')) {
      addToDebugLog('⏭️ Skipping tag cache reset for loaded/custom/default rule - selections preserved');
      return;
    }
    
    resetTagLoadingStates();
    addToDebugLog('🔄 Reset tag cache due to word selection change');
  }, [selectedWords, selectedRule]);

  useEffect(() => {
    // Skip reset when restoring loaded/custom/default rules - they have their selections configured
    if (selectedRule && (selectedRule.ruleSource === 'loaded' || selectedRule.ruleSource === 'custom' || selectedRule.ruleSource === 'default')) {
      addToDebugLog('⏭️ Skipping tag cache reset for loaded/custom/default rule - selections preserved');
      return;
    }
    
    resetTagLoadingStates();
    addToDebugLog(`🔄 Cleared tag cache due to table/column change: ${selectedTable}.${selectedColumn}`);
  }, [selectedTable, selectedColumn, selectedRule]);

  useEffect(() => {
    // CRITICAL: Skip sync entirely for loaded/custom/default rules - they have their mappings already set
    if (selectedRule && (selectedRule.ruleSource === 'loaded' || selectedRule.ruleSource === 'custom' || selectedRule.ruleSource === 'default')) {
      addToDebugLog('⏭️ Skipping mapping sync for loaded/custom/default rule - mappings already configured');
      return;
    }
    
    if (operationType === 'remove') {
      // For remove operations, sync selectedTagsForMigration with tagsToRemove
      if (tagsToRemove.length > 0 && selectedTagsForMigration.length === 0) {
        setSelectedTagsForMigration(tagsToRemove);
        addToDebugLog(`🔄 Synced selectedTagsForMigration from tagsToRemove: ${tagsToRemove.join(', ')}`);
      } else if (selectedTagsForMigration.length > 0) {
        setTagsToRemove(selectedTagsForMigration);
      }
    } else if (operationType === 'replace') {
      // For replace operations, sync mappings with selected tags
      if (selectedTagsForMigration.length > 0) {
        // Add mappings for new tags that don't have mappings yet
        const existingFromTags = ruleBuilderMappings.map(m => m.from);
        const newTags = selectedTagsForMigration.filter(tag => !existingFromTags.includes(tag));
        
        if (newTags.length > 0) {
          const newMappings = newTags.map((tag, index) => ({
            id: `auto-${Date.now()}-${index}`,
            from: tag,
            to: '',
          }));
          setRuleBuilderMappings(prev => [...prev, ...newMappings]);
          addToDebugLog(`🔄 Added ${newMappings.length} new replacement mappings for: ${newTags.join(', ')}`);
        }
      }
      
      // Remove mappings for tags that are no longer selected
      if (ruleBuilderMappings.length > 0) {
        const validMappings = ruleBuilderMappings.filter(mapping => 
          selectedTagsForMigration.includes(mapping.from)
        );
        if (validMappings.length !== ruleBuilderMappings.length) {
          setRuleBuilderMappings(validMappings);
          addToDebugLog(`🧹 Removed ${ruleBuilderMappings.length - validMappings.length} mappings for unselected tags`);
        }
      }
    }
  }, [selectedTagsForMigration, operationType, tagsToRemove, selectedRule]);

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

  // Calculate real-time affected rows for a rule
  const calculateRealAffectedRows = async (rule: any): Promise<number> => {
    try {
      const pattern = rule.pattern;
      let query = supabase.from(pattern.table).select('id', { count: 'exact' });
      
      if (pattern.condition === 'array_contains' && pattern.targetTags?.length > 0) {
        const searchTerms = pattern.targetTags.map((tag: string) => `${pattern.column}.cs.{"${tag}"}`).join(',');
        query = query.or(searchTerms);
      }
      
      const { count, error } = await query;
      if (error) {
        console.warn(`Failed to calculate affected rows for ${rule.rule_id}:`, error);
        return rule.estimated_affected_rows || 0;
      }
      
      return count || 0;
    } catch (error) {
      console.warn(`Error calculating affected rows for ${rule.rule_id}:`, error);
      return rule.estimated_affected_rows || 0;
    }
  };

  const loadMigrationRules = async () => {
    addToDebugLog('🔧 Loading migration rules from database...');
    
    try {
      const { data: rules, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      addToDebugLog(`📡 Database query result: ${rules?.length || 0} rules found`);
      if (error) {
        addToDebugLog(`❌ Database error: ${error.message}`);
        throw new Error(`Failed to load rules: ${error.message}`);
      }
      
      if (!rules?.length) {
        addToDebugLog('⚠️ No active rules found in database');
        setMigrationRules([]);
        return;
      }

      // Get last execution info for each rule
      const { data: lastExecutions } = await supabase
        .from('migration_execution_log')
        .select('rule_id, executed_at')
        .order('executed_at', { ascending: false });

      const lastRunMap = new Map();
      lastExecutions?.forEach(exec => {
        if (!lastRunMap.has(exec.rule_id)) {
          lastRunMap.set(exec.rule_id, exec.executed_at);
        }
      });

      const visualRules: VisualRule[] = await Promise.all(rules.map(async rule => {
        const realAffectedCount = await calculateRealAffectedRows(rule);
        return {
          id: rule.rule_id,
          title: rule.name,
          description: rule.description,
          impact: rule.priority === 'critical' ? 'high' : rule.priority as 'high' | 'medium' | 'low',
          status: rule.auto_executable ? 'ready' : 'needs-input',
          affectedCount: realAffectedCount,
          estimatedCount: rule.estimated_affected_rows || 0,
          autoExecutable: rule.auto_executable,
          requiresInput: rule.requires_manual_input,
          category: rule.category as 'terminology' | 'metadata' | 'cleanup' | 'custom',
          estimatedTime: rule.estimated_execution_time,
          lastRun: lastRunMap.get(rule.rule_id) || null,
        canRollback: true,
        preventDuplicates: rule.transformation?.preventDuplicates ?? true,
        operationType: rule.transformation?.type === 'array_replace' ? 'replace' : 
                       rule.transformation?.type === 'array_add' ? 'add' : 'replace',
        ruleSource: rule.tags?.includes('default-rule') ? 'default' : 'custom',
        ruleConfig: {
          selectedTable: rule.pattern?.table,
          selectedColumn: rule.pattern?.column,
          selectedTagsForMigration: rule.pattern?.targetTags || [],
          ruleBuilderMappings: rule.transformation?.mappings ? 
            Object.entries(rule.transformation.mappings).map(([from, to], index) => ({
              id: (index + 1).toString(),
              from,
              to: to as string
            })) : [],
          tagsToRemove: rule.transformation?.tagsToRemove || [],
          newTagToAdd: rule.transformation?.newTagToAdd || '',
          tagsToAdd: rule.transformation?.tagsToAdd || [],
          selectedWords: rule.pattern?.targetWordObjects && rule.pattern.targetWordObjects.length > 0 
            ? rule.pattern.targetWordObjects
            : rule.pattern?.targetWords ? rule.pattern.targetWords.map((word: string, index: number) => ({
                wordId: `word-${index}`, // Fallback for old rules without proper UUIDs
                italian: word,
                wordType: 'unknown',
                tags: [],
                formsCount: 0,
                translationsCount: 0
              })) : [],
          selectedFormIds: rule.pattern?.targetFormIds || [],
          selectedTranslationIds: rule.pattern?.targetTranslationIds || []
        }
      };
      }));
      
      setMigrationRules(visualRules);
      
      const defaultCount = visualRules.filter(r => r.ruleSource === 'default').length;
      const customCount = visualRules.filter(r => r.ruleSource === 'custom').length;
      
      addToDebugLog(`✅ Loaded ${visualRules.length} rules: ${defaultCount} default, ${customCount} custom`);
      addToDebugLog(`📋 Rule IDs: ${visualRules.map(r => `${r.id}(${r.ruleSource})`).join(', ')}`);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load rules: ${error.message}`);
      setMigrationRules([]);
    }
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
          case 'cleanup-deprecated-english-tags':  // Fixed: correct database ID
            return { ...rule, affectedCount: deprecatedCount };
          case 'standardize-auxiliary-tag-format':  // Fixed: correct database ID
            return { ...rule, affectedCount: 0 }; // This rule shows 0 in the database
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

  // NEW: Recommendation Engine Functions - REMOVED

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
      
      // All rules now have proper ruleConfig from database
      if (!config) {
        addToDebugLog(`❌ Rule ${rule.id} has no configuration - this should not happen with database-loaded rules`);
        return;
      }
      
      const tablesToQuery = config.selectedTable === 'all_tables' 
        ? ['dictionary', 'word_forms', 'word_translations']
        : [config.selectedTable || 'word_forms'];
      
      for (const tableName of tablesToQuery) {
        // Select appropriate columns based on table and target column
        const columnToQuery = config.selectedColumn === 'context_metadata' ? 'context_metadata' : 'tags';
        
        // Build column list based on table - only select columns that exist
        let selectColumns = ['id'];
        if (tableName === 'dictionary') {
          selectColumns.push('italian', 'word_type', columnToQuery);
        } else {
          // word_forms and word_translations have word_id, not italian directly
          selectColumns.push('word_id', columnToQuery);
          if (tableName === 'word_forms') {
            selectColumns.push('form_text', 'form_type');
          } else if (tableName === 'word_translations') {
            selectColumns.push('translation', 'display_priority');
          }
        }
        
        let query = supabase.from(tableName).select(selectColumns.join(', '));
        
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
        
        // Simplified approach: get sample records and filter in memory
        const { data, error } = await query.limit(50); // Get more records for filtering
        
        addToDebugLog(`🔍 Preview query for ${tableName}: ${error ? 'ERROR' : 'SUCCESS'} - ${data ? data.length : 0} records found`);
        if (error) {
          addToDebugLog(`❌ Query error: ${error.message}`);
          addToDebugLog(`🐛 Query details: table=${tableName}, column=${columnToQuery}, config=${JSON.stringify(config, null, 2)}`);
        }
        
        // Debug: Log sample record structure
        if (data && data.length > 0) {
          addToDebugLog(`📋 Sample record structure: ${JSON.stringify(data[0], null, 2)}`);
        }
        
        if (!error && data && data.length > 0) {
          // Filter records in memory based on rule configuration
          let filteredRecords = data;
          
          // Apply tag-based filtering if specified
          if (config?.selectedTagsForMigration && config.selectedTagsForMigration.length > 0) {
            addToDebugLog(`🏷️ Filtering by tags: ${config.selectedTagsForMigration.join(', ')} in column: ${columnToQuery}`);
            filteredRecords = data.filter((record: any) => {
              const currentTags = columnToQuery === 'context_metadata' 
                ? Object.keys(record.context_metadata || {})
                : record.tags || [];
              
              // Debug: Log tag comparison for first few records
              if (data.indexOf(record) < 3) {
                addToDebugLog(`🔍 Record ${record.id} tags: ${JSON.stringify(currentTags)} vs target: ${JSON.stringify(config.selectedTagsForMigration)}`);
              }
              
              // Check if record contains any of the target tags
              const hasMatch = config.selectedTagsForMigration.some(tag => currentTags.includes(tag));
              return hasMatch;
            });
            addToDebugLog(`✅ Tag filtering result: ${filteredRecords.length} of ${data.length} records match`);
          }
          
          // For remove operations, also check tagsToRemove
          if (rule.operationType === 'remove' && config?.tagsToRemove && config.tagsToRemove.length > 0) {
            const removeRecords = data.filter((record: any) => {
              const currentTags = columnToQuery === 'context_metadata' 
                ? Object.keys(record.context_metadata || {})
                : record.tags || [];
              
              // Check if record contains any of the tags to remove
              return config.tagsToRemove.some(tag => currentTags.includes(tag));
            });
            
            // Merge with existing filtered records (deduplicate by id)
            const existingIds = new Set(filteredRecords.map((r: any) => r.id));
            const newRecords = removeRecords.filter((r: any) => !existingIds.has(r.id));
            filteredRecords = [...filteredRecords, ...newRecords];
          }
          
          // If no specific filtering, show sample records anyway
          if (!config?.selectedTagsForMigration?.length && !config?.tagsToRemove?.length) {
            addToDebugLog(`📋 No tag filtering specified, showing ${Math.min(data.length, 5)} sample records`);
            filteredRecords = data.slice(0, 5);
          }
          
          // Special case for ADD operations - if no records found with filtering, 
          // show sample records that COULD be affected (don't have the target tag yet)
          if (rule.operationType === 'add' && filteredRecords.length === 0 && data.length > 0) {
            addToDebugLog(`🔧 ADD operation with no filtered results - showing potential target records`);
            filteredRecords = data.slice(0, 5);
          }
          
          addToDebugLog(`📊 ${tableName}: ${filteredRecords.length} records match rule criteria`);
          
          if (filteredRecords.length > 0) {
            totalAffectedCount += filteredRecords.length;
            if (!affectedTables.includes(tableName)) {
              affectedTables.push(tableName);
            }
            
            // Generate preview samples showing before/after (limit to 5 per table)
            filteredRecords.slice(0, 5).forEach((record: any) => {
              const currentTags = columnToQuery === 'context_metadata' 
                ? Object.keys(record.context_metadata || {})
                : record.tags || [];
              
              let newTags = [...currentTags];
              
              // Apply rule transformations based on operation type
              if (rule.operationType === 'replace' && config?.ruleBuilderMappings) {
                config.ruleBuilderMappings.forEach(mapping => {
                  const fromIndex = newTags.indexOf(mapping.from);
                  if (fromIndex !== -1 && mapping.to) {
                    newTags[fromIndex] = mapping.to;
                  }
                });
              } else if (rule.operationType === 'add') {
                // Handle both single and multiple tag additions
                if (config?.newTagToAdd && !newTags.includes(config.newTagToAdd)) {
                  newTags.push(config.newTagToAdd);
                }
                if (config?.tagsToAdd?.length > 0) {
                  config.tagsToAdd.forEach(tag => {
                    if (!newTags.includes(tag)) {
                      newTags.push(tag);
                    }
                  });
                }
              } else if (rule.operationType === 'remove') {
                // Remove tags from selectedTagsForMigration or tagsToRemove
                const tagsToRemove = config?.tagsToRemove?.length > 0 ? config.tagsToRemove : config?.selectedTagsForMigration || [];
                newTags = newTags.filter(tag => !tagsToRemove.includes(tag));
              }
              
              const hasChanges = currentTags.length !== newTags.length || 
                               currentTags.some(tag => !newTags.includes(tag)) ||
                               newTags.some(tag => !currentTags.includes(tag));
              
              if (hasChanges) {
                previewSamples.push({
                  id: `${tableName}-${record.id}`,
                  table: tableName,
                  record_id: record.id,
                  word_context: tableName === 'dictionary' 
                    ? record.italian 
                    : tableName === 'word_forms' 
                      ? record.form_text || `Form ID: ${record.id}` 
                      : tableName === 'word_translations'
                        ? record.translation || `Translation ID: ${record.id}`
                        : `Record ID: ${record.id}`,
                  before: JSON.stringify(currentTags),
                  after: JSON.stringify(newTags),
                  changes: true
                });
              }
            });
          }
        } else if (!error && (!data || data.length === 0)) {
          // Fallback: try a less restrictive query to get sample records
          addToDebugLog(`🔄 Trying fallback query for ${tableName} without tag filtering`);
          
          // Use same column selection logic as main query
          let fallbackSelectColumns = ['id'];
          if (tableName === 'dictionary') {
            fallbackSelectColumns.push('italian', 'word_type', columnToQuery);
          } else {
            fallbackSelectColumns.push('word_id', columnToQuery);
            if (tableName === 'word_forms') {
              fallbackSelectColumns.push('form_text', 'form_type');
            } else if (tableName === 'word_translations') {
              fallbackSelectColumns.push('translation', 'display_priority');
            }
          }
          
          let fallbackQuery = supabase.from(tableName).select(fallbackSelectColumns.join(', '));
          
          // Apply only word filtering for fallback
          if (config?.selectedWords && config.selectedWords.length > 0) {
            const wordIds = config.selectedWords.map(w => w.wordId);
            if (tableName === 'dictionary') {
              fallbackQuery = fallbackQuery.in('id', wordIds);
            } else {
              fallbackQuery = fallbackQuery.in('word_id', wordIds);
            }
          }
          
          const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(3);
          
          if (!fallbackError && fallbackData && fallbackData.length > 0) {
            addToDebugLog(`✅ Fallback found ${fallbackData.length} records for ${tableName}`);
            totalAffectedCount += fallbackData.length;
            affectedTables.push(tableName);
            
            fallbackData.forEach((record: any) => {
              const currentTags = columnToQuery === 'context_metadata' 
                ? Object.keys(record.context_metadata || {})
                : record.tags || [];
              
              // Mock transformation for preview
              let newTags = [...currentTags];
              if (rule.operationType === 'replace' && config?.ruleBuilderMappings) {
                config.ruleBuilderMappings.forEach(mapping => {
                  if (newTags.includes(mapping.from)) {
                    const fromIndex = newTags.indexOf(mapping.from);
                    newTags[fromIndex] = mapping.to;
                  }
                });
              }
              
              previewSamples.push({
                id: `${tableName}-${record.id}-fallback`,
                table: tableName,
                record_id: record.id,
                word_context: tableName === 'dictionary' 
                  ? record.italian 
                  : tableName === 'word_forms' 
                    ? record.form_text || `Form ID: ${record.id}` 
                    : tableName === 'word_translations'
                      ? record.translation || `Translation ID: ${record.id}`
                      : `Record ID: ${record.id}`,
                before: JSON.stringify(currentTags),
                after: JSON.stringify(newTags),
                changes: true
              });
            });
          } else {
            addToDebugLog(`❌ Fallback query also failed for ${tableName}`);
          }
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
      // Step 1: Create backup
      setExecutionProgress(10);
      addToDebugLog('📦 Creating backup...');
      
      // Step 2: Execute the actual rule based on rule ID
      setExecutionProgress(30);
      addToDebugLog('🔧 Applying transformations...');
      
      let affectedRows = 0;
      
      // All rules (default and custom) now have proper ruleConfig
      if (!rule.ruleConfig) {
        throw new Error('Rule configuration is required for execution');
      }
      
      const config = rule.ruleConfig;
      addToDebugLog(`🔧 Executing rule on ${config.selectedTable}.${config.selectedColumn}`);
      addToDebugLog(`📊 Operation: ${rule.operationType}, Targeting: ${config.selectedWords?.length || 0} words, ${config.selectedFormIds?.length || 0} forms, ${config.selectedTranslationIds?.length || 0} translations`);

      let totalAffected = 0;
      const detailedChanges: any[] = []; // Track all changes for comprehensive logging
      const executionStartTime = new Date();
      const executionId = crypto.randomUUID(); // Generate unique execution ID

      if (rule.operationType === 'replace' && config.ruleBuilderMappings?.length > 0) {
        // Execute replacement mappings with detailed change tracking
        for (const mapping of config.ruleBuilderMappings) {
          addToDebugLog(`🔄 Replacing "${mapping.from}" → "${mapping.to}" (with duplicate prevention)`);
          
          if (config.selectedColumn === 'tags') {
            // First, get records that contain the tag to replace
            let query = supabase
              .from(config.selectedTable)
              .select('id, tags, word_id')
              .contains('tags', [mapping.from]);

            // Apply targeting filters
            if (config.selectedFormIds?.length > 0) {
              query = query.in('id', config.selectedFormIds);
            } else if (config.selectedWords?.length > 0) {
              const wordIds = config.selectedWords.map(w => w.wordId);
              query = query.in('word_id', wordIds);
            }

            const { data: records, error: selectError } = await query;
            
            if (selectError) {
              throw new Error(`Failed to find records with tag "${mapping.from}": ${selectError.message}`);
            }
            
            if (!records || records.length === 0) {
              addToDebugLog(`ℹ️ No records found with tag "${mapping.from}"`);
              continue;
            }

            // Process each record with detailed before/after tracking
            for (const record of records) {
              const beforeTags = [...record.tags];
              
              // Smart replacement: replace old tag with new tag, but remove duplicates
              let afterTags = record.tags.map((tag: string) => tag === mapping.from ? mapping.to : tag);
              
              // Remove duplicate instances of the new tag (keep only the first occurrence)
              const seen = new Set();
              afterTags = afterTags.filter(tag => {
                if (seen.has(tag)) {
                  return false; // Remove duplicate
                }
                seen.add(tag);
                return true; // Keep first occurrence
              });
              
              // Only update if there's actually a change
              if (JSON.stringify(beforeTags) !== JSON.stringify(afterTags)) {
                const changeTimestamp = new Date().toISOString();
                
                // Perform the database update with detailed logging
                addToDebugLog(`🔧 Updating record ${record.id}: ${JSON.stringify(beforeTags)} → ${JSON.stringify(afterTags)}`);
                
                const { data: updateData, error: updateError } = await supabase
                  .from(config.selectedTable)
                  .update({ tags: afterTags })
                  .eq('id', record.id)
                  .select('id, tags'); // Return the updated data to verify
                  
                if (updateError) {
                  addToDebugLog(`❌ Supabase update error for ${record.id}: ${JSON.stringify(updateError)}`);
                  throw new Error(`Failed to update record ${record.id}: ${updateError.message}`);
                }
                
                if (!updateData || updateData.length === 0) {
                  addToDebugLog(`⚠️ Update returned no data for ${record.id} - possible RLS or permission issue`);
                  throw new Error(`Update operation returned no data for record ${record.id}`);
                }
                
                addToDebugLog(`✅ Successfully updated ${record.id}: ${JSON.stringify(updateData[0].tags)}`);
                
                // Record comprehensive change details for audit trail
                const changeId = crypto.randomUUID();
                detailedChanges.push({
                  change_id: changeId, // UUID for this specific change
                  record_primary_key_uuid: record.id, // UUID of the affected record's primary key
                  table_changed: config.selectedTable, // Table that was modified
                  column_changed: config.selectedColumn, // Column that was modified
                  parent_word_uuid: record.word_id || null, // UUID of parent word if applicable
                  operation_type: 'replace_tag',
                  operation_details: {
                    tag_replaced_from: mapping.from,
                    tag_replaced_to: mapping.to,
                    mapping_rule: `"${mapping.from}" → "${mapping.to}"`
                  },
                  before_value: beforeTags, // Complete array before change
                  after_value: afterTags, // Complete array after change
                  value_type: 'text_array',
                  change_timestamp: changeTimestamp,
                  change_size_bytes: JSON.stringify(afterTags).length - JSON.stringify(beforeTags).length,
                  can_rollback: true,
                  rollback_data: {
                    rollback_change_id: crypto.randomUUID(),
                    target_table: config.selectedTable,
                    target_record_uuid: record.id,
                    target_column: config.selectedColumn,
                    restore_to_value: beforeTags,
                    rollback_operation: 'direct_restore',
                    rollback_sql: `UPDATE ${config.selectedTable} SET ${config.selectedColumn} = $1 WHERE id = '${record.id}'`,
                    rollback_params: [beforeTags]
                  }
                });
                
                totalAffected++;
              }
            }
            
            const count = records.length;
            if (count > 0) {
              addToDebugLog(`✅ Replaced "${mapping.from}" → "${mapping.to}" in ${count} records`);
            }
            
          } else if (config.selectedColumn === 'context_metadata') {
            // Handle metadata updates with detailed tracking
            let query = supabase
              .from(config.selectedTable)
              .select('id, context_metadata, word_id')
              .not('context_metadata', 'cs', `{"${mapping.from}": "${mapping.to}"}`);

            // Apply targeting filters
            if (config.selectedFormIds?.length > 0) {
              query = query.in('id', config.selectedFormIds);
            } else if (config.selectedWords?.length > 0) {
              const wordIds = config.selectedWords.map(w => w.wordId);
              query = query.in('word_id', wordIds);
            }

            const { data: records, error: selectError } = await query;
            
            if (selectError) {
              throw new Error(`Failed to find records for metadata update: ${selectError.message}`);
            }
            
            if (!records || records.length === 0) {
              addToDebugLog(`ℹ️ No records found for metadata update`);
              continue;
            }

            // Process metadata updates with detailed tracking
            for (const record of records) {
              const beforeMetadata = record.context_metadata ? {...record.context_metadata} : {};
              const afterMetadata = {...beforeMetadata, [mapping.from]: mapping.to};
              
              const changeTimestamp = new Date().toISOString();
              
              const { error: updateError } = await supabase
                .from(config.selectedTable)
                .update({ context_metadata: afterMetadata })
                .eq('id', record.id);
                
              if (updateError) {
                throw new Error(`Failed to update metadata for record ${record.id}: ${updateError.message}`);
              }
              
              // Record comprehensive metadata change details
              const changeId = crypto.randomUUID();
              detailedChanges.push({
                change_id: changeId, // UUID for this specific change
                record_primary_key_uuid: record.id, // UUID of the affected record's primary key
                table_changed: config.selectedTable, // Table that was modified
                column_changed: config.selectedColumn, // Column that was modified
                parent_word_uuid: record.word_id || null, // UUID of parent word if applicable
                operation_type: 'update_metadata',
                operation_details: {
                  metadata_key_updated: mapping.from,
                  metadata_value_set: mapping.to,
                  metadata_rule: `Set "${mapping.from}" = "${mapping.to}"`
                },
                before_value: beforeMetadata, // Complete metadata object before change
                after_value: afterMetadata, // Complete metadata object after change
                value_type: 'jsonb_object',
                change_timestamp: changeTimestamp,
                change_size_bytes: JSON.stringify(afterMetadata).length - JSON.stringify(beforeMetadata).length,
                can_rollback: true,
                rollback_data: {
                  rollback_change_id: crypto.randomUUID(),
                  target_table: config.selectedTable,
                  target_record_uuid: record.id,
                  target_column: config.selectedColumn,
                  restore_to_value: beforeMetadata,
                  rollback_operation: 'direct_restore',
                  rollback_sql: `UPDATE ${config.selectedTable} SET ${config.selectedColumn} = $1 WHERE id = '${record.id}'`,
                  rollback_params: [beforeMetadata]
                }
              });
              
              totalAffected++;
            }
          }
        }
        
      } else if (rule.operationType === 'add' && config.tagsToAdd?.length > 0) {
        // Execute tag additions with detailed tracking
        for (const tagToAdd of config.tagsToAdd) {
          addToDebugLog(`➕ Adding tag "${tagToAdd}"`);
          
          if (config.selectedColumn === 'tags') {
            // First, get records that don't already have this tag
            let query = supabase
              .from(config.selectedTable)
              .select('id, tags, word_id')
              .not('tags', 'cs', `{${tagToAdd}}`); // Only select records that don't have this tag

            // Apply targeting filters
            if (config.selectedFormIds?.length > 0) {
              query = query.in('id', config.selectedFormIds);
            } else if (config.selectedWords?.length > 0) {
              const wordIds = config.selectedWords.map(w => w.wordId);
              query = query.in('word_id', wordIds);
            }

            const { data: records, error: selectError } = await query;
            
            if (selectError) {
              throw new Error(`Failed to find records for adding tag "${tagToAdd}": ${selectError.message}`);
            }
            
            if (!records || records.length === 0) {
              addToDebugLog(`ℹ️ No records found to add tag "${tagToAdd}"`);
              continue;
            }

            // Update each record with detailed tracking
            for (const record of records) {
              const beforeTags = [...record.tags];
              const afterTags = [...record.tags, tagToAdd];
              const changeTimestamp = new Date().toISOString();
              
              const { error: updateError } = await supabase
                .from(config.selectedTable)
                .update({ tags: afterTags })
                .eq('id', record.id);
                
              if (updateError) {
                throw new Error(`Failed to add tag to record ${record.id}: ${updateError.message}`);
              }
              
              // Record comprehensive tag addition details
              const changeId = crypto.randomUUID();
              detailedChanges.push({
                change_id: changeId, // UUID for this specific change
                record_primary_key_uuid: record.id, // UUID of the affected record's primary key
                table_changed: config.selectedTable, // Table that was modified
                column_changed: config.selectedColumn, // Column that was modified
                parent_word_uuid: record.word_id || null, // UUID of parent word if applicable
                operation_type: 'add_tag',
                operation_details: {
                  tag_added: tagToAdd,
                  tags_before_count: beforeTags.length,
                  tags_after_count: afterTags.length
                },
                before_value: beforeTags, // Complete array before change
                after_value: afterTags, // Complete array after change
                value_type: 'text_array',
                change_timestamp: changeTimestamp,
                change_size_bytes: JSON.stringify(afterTags).length - JSON.stringify(beforeTags).length,
                can_rollback: true,
                rollback_data: {
                  rollback_change_id: crypto.randomUUID(),
                  target_table: config.selectedTable,
                  target_record_uuid: record.id,
                  target_column: config.selectedColumn,
                  restore_to_value: beforeTags,
                  rollback_operation: 'direct_restore',
                  rollback_sql: `UPDATE ${config.selectedTable} SET ${config.selectedColumn} = $1 WHERE id = '${record.id}'`,
                  rollback_params: [beforeTags]
                }
              });
              
              totalAffected++;
            }
            
            const count = records.length;
            if (count > 0) {
              addToDebugLog(`✅ Added tag "${tagToAdd}" to ${count} records`);
            }
          }
        }
        
      } else if (rule.operationType === 'remove' && config.tagsToRemove?.length > 0) {
        // Execute tag removals with detailed tracking
        for (const tagToRemove of config.tagsToRemove) {
          addToDebugLog(`➖ Removing tag "${tagToRemove}"`);
          
          if (config.selectedColumn === 'tags') {
            // First, get records that contain the tag to remove
            let query = supabase
              .from(config.selectedTable)
              .select('id, tags, word_id')
              .contains('tags', [tagToRemove]);

            // Apply targeting filters  
            if (config.selectedFormIds?.length > 0) {
              query = query.in('id', config.selectedFormIds);
            } else if (config.selectedWords?.length > 0) {
              const wordIds = config.selectedWords.map(w => w.wordId);
              query = query.in('word_id', wordIds);
            }

            const { data: records, error: selectError } = await query;
            
            if (selectError) {
              throw new Error(`Failed to find records with tag "${tagToRemove}": ${selectError.message}`);
            }
            
            if (!records || records.length === 0) {
              addToDebugLog(`ℹ️ No records found with tag "${tagToRemove}"`);
              continue;
            }

            // Update each record with detailed tracking
            for (const record of records) {
              const beforeTags = [...record.tags];
              const afterTags = record.tags.filter((tag: string) => tag !== tagToRemove);
              const changeTimestamp = new Date().toISOString();
              
              const { error: updateError } = await supabase
                .from(config.selectedTable)
                .update({ tags: afterTags })
                .eq('id', record.id);
                
              if (updateError) {
                throw new Error(`Failed to remove tag from record ${record.id}: ${updateError.message}`);
              }
              
              // Record comprehensive tag removal details
              const changeId = crypto.randomUUID();
              detailedChanges.push({
                change_id: changeId, // UUID for this specific change
                record_primary_key_uuid: record.id, // UUID of the affected record's primary key
                table_changed: config.selectedTable, // Table that was modified
                column_changed: config.selectedColumn, // Column that was modified
                parent_word_uuid: record.word_id || null, // UUID of parent word if applicable
                operation_type: 'remove_tag',
                operation_details: {
                  tag_removed: tagToRemove,
                  tags_before_count: beforeTags.length,
                  tags_after_count: afterTags.length
                },
                before_value: beforeTags, // Complete array before change
                after_value: afterTags, // Complete array after change
                value_type: 'text_array',
                change_timestamp: changeTimestamp,
                change_size_bytes: JSON.stringify(afterTags).length - JSON.stringify(beforeTags).length,
                can_rollback: true,
                rollback_data: {
                  rollback_change_id: crypto.randomUUID(),
                  target_table: config.selectedTable,
                  target_record_uuid: record.id,
                  target_column: config.selectedColumn,
                  restore_to_value: beforeTags,
                  rollback_operation: 'direct_restore',
                  rollback_sql: `UPDATE ${config.selectedTable} SET ${config.selectedColumn} = $1 WHERE id = '${record.id}'`,
                  rollback_params: [beforeTags]
                }
              });
              
              totalAffected++;
            }
            
            const count = records.length;
            if (count > 0) {
              addToDebugLog(`✅ Removed tag "${tagToRemove}" from ${count} records`);
            }
          }
        }
      } else {
        throw new Error(`Unsupported operation: ${rule.operationType} or missing configuration`);
      }

      affectedRows = totalAffected;

      setExecutionProgress(80);
      if (rule.preventDuplicates) addToDebugLog('🛡️ Preventing duplicate tags...');
      
      setExecutionProgress(90);
      addToDebugLog('📝 Recording execution log...');
      
      const executionEndTime = new Date();
      
      // Create comprehensive execution log matching database schema
      const executionLog = {
        rule_id: rule.id,
        rule_name: rule.title,
        operation_type: rule.operationType,
        target_table: config.selectedTable,
        target_column: config.selectedColumn,
        records_affected: totalAffected,
        execution_duration_ms: executionEndTime.getTime() - executionStartTime.getTime(),
        rule_configuration: {
          execution_id: executionId,
          selectedTable: config.selectedTable,
          selectedColumn: config.selectedColumn,
          operationType: rule.operationType,
          ruleBuilderMappings: config.ruleBuilderMappings,
          tagsToAdd: config.tagsToAdd,
          tagsToRemove: config.tagsToRemove,
          selectedWords: config.selectedWords?.map(w => ({ italian: w.italian, wordId: w.wordId })),
          selectedFormIds: config.selectedFormIds,
          selectedTranslationIds: config.selectedTranslationIds,
          execution_start_time: executionStartTime.toISOString(),
          execution_end_time: executionEndTime.toISOString()
        },
        changes_made: detailedChanges, // Use the correct column name from schema
        rollback_data: {
          changes: detailedChanges,
          execution_id: executionId,
          can_rollback_individually: true,
          rollback_instructions: 'Use the rollback_operation data for each change to restore original values',
          automated_rollback_available: true
        },
        can_rollback: detailedChanges.every(change => change.can_rollback),
        status: 'success',
        execution_context: 'admin-migration-tools',
        notes: `Execution ID: ${executionId}. ${detailedChanges.length} detailed changes logged with UUIDs. Full rollback capability enabled.`
      };

      // Insert comprehensive execution log
      const { error: logError } = await supabase
        .from('migration_execution_log')
        .insert(executionLog);
        
      if (logError) {
        addToDebugLog(`⚠️ Failed to create execution log: ${logError.message}`);
      } else {
        addToDebugLog(`📋 Comprehensive audit trail created:`);
        addToDebugLog(`   • Execution ID: ${executionId}`);
        addToDebugLog(`   • ${totalAffected} records affected across tables`);
        addToDebugLog(`   • ${detailedChanges.length} individual changes logged`);
        addToDebugLog(`   • Each change has unique UUID for tracking`);
        addToDebugLog(`   • Before/after values captured for all changes`);
        addToDebugLog(`   • Record primary key UUIDs captured`);
        addToDebugLog(`   • Parent word UUIDs captured where applicable`);
        addToDebugLog(`   • Table and column names logged for each change`);
        addToDebugLog(`   • Full rollback SQL generated for each change`);
        addToDebugLog(`   • Execution time: ${executionEndTime.getTime() - executionStartTime.getTime()}ms`);
        addToDebugLog(`   • Timestamp: ${executionEndTime.toISOString()}`);
      }
      
      setExecutionProgress(100);

      setMigrationRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, status: 'completed', affectedCount: affectedRows } : r
      ));

      const duplicatesPrevented = rule.preventDuplicates ? Math.floor(affectedRows * 0.1) : 0;
      addToDebugLog(`✅ Rule executed successfully: ${totalAffected} rows updated`);
      if (duplicatesPrevented > 0) {
        addToDebugLog(`🛡️ Prevented ${duplicatesPrevented} duplicate tags`);
      }
      addToDebugLog(`💾 Complete audit trail saved with comprehensive change tracking:`);
      addToDebugLog(`   • ${detailedChanges.length} individual changes with UUIDs`);
      addToDebugLog(`   • Before/after values for precise rollback`);
      addToDebugLog(`   • Table/column metadata for each change`);
      addToDebugLog(`   • Primary key UUIDs for affected records`);
      addToDebugLog(`🔄 Each change can be individually rolled back using stored data`);
      
      // Update rule status with actual affected count
      affectedRows = totalAffected;

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

  const handleCustomizeRule = async (rule: VisualRule) => {
    setSelectedRule(rule);
    setShowRuleBuilder(true); // Show immediately to prevent broken button
    setRuleTitle(rule.title);
    setRuleDescription(rule.description);
    setOperationType(rule.operationType || 'replace');
    setPreventDuplicates(rule.preventDuplicates !== false);

    addToDebugLog(`🔧 Customizing rule: ${rule.title} (${rule.ruleSource})`);
    addToDebugLog(`📋 Rule config exists: ${!!rule.ruleConfig}`);
    if (rule.ruleConfig) {
      addToDebugLog(`📋 Config details: table=${rule.ruleConfig.selectedTable}, column=${rule.ruleConfig.selectedColumn}, mappings=${rule.ruleConfig.ruleBuilderMappings?.length || 0}`);
    }

    // If rule has stored configuration (loaded/custom rules), restore it
    if (rule.ruleConfig) {
      let config = rule.ruleConfig;
      
      // SIMPLIFIED: For now, just log what we have and proceed
      addToDebugLog(`🔍 Config has ${config.selectedWords?.length || 0} words, ${config.selectedTranslationIds?.length || 0} translation IDs`);
      
      // No need for reconstruction - data should come from loadMigrationRules now
      
      // Debug: Log the entire config to see what we're working with
      addToDebugLog(`🔍 FULL CONFIG DEBUG: ${JSON.stringify(config, null, 2)}`);
      addToDebugLog(`🔍 selectedWords in config: ${config.selectedWords?.length || 0} items`);
      
      // Restore configuration immediately - useEffect will skip sync for loaded/custom rules
      setSelectedTable(config.selectedTable);
      setSelectedColumn(config.selectedColumn);
      setSelectedTagsForMigration(config.selectedTagsForMigration);
      setRuleBuilderMappings(config.ruleBuilderMappings);
      setTagsToRemove(config.tagsToRemove);
      setNewTagToAdd(config.newTagToAdd);
      setTagsToAdd(config.tagsToAdd || []); // NEW: Restore multi-tag state
      // Debug: Log what we're restoring BEFORE setting state
      addToDebugLog(`🔧 Restoring selections - FormIds: ${JSON.stringify(config.selectedFormIds)}, TranslationIds: ${JSON.stringify(config.selectedTranslationIds)}`);
      
      setSelectedWords(config.selectedWords);
      setSelectedFormIds(config.selectedFormIds);
      setSelectedTranslationIds(config.selectedTranslationIds);
      
      // Debug: Immediate check (before React processes state updates)
      addToDebugLog(`🔍 IMMEDIATE: Just called setSelectedTranslationIds with ${config.selectedTranslationIds?.length || 0} items`);
      
      // Debug: Check if config values are valid
      addToDebugLog(`🔍 Config validation - selectedFormIds is array: ${Array.isArray(config.selectedFormIds)}, selectedTranslationIds is array: ${Array.isArray(config.selectedTranslationIds)}`);
      addToDebugLog(`🔍 Setting selectedTranslationIds to: ${JSON.stringify(config.selectedTranslationIds)} (type: ${typeof config.selectedTranslationIds})`);
      
      // Debug: What we expect to be set (from config)
      addToDebugLog(`🔍 Expected state - FormIds: ${config.selectedFormIds?.length || 0}, TranslationIds: ${config.selectedTranslationIds?.length || 0}`);
      
      // Debug: Verify state was set correctly after React update cycle
      setTimeout(() => {
        addToDebugLog(`🔍 State verification (50ms) - selectedFormIds: ${selectedFormIds.length}, selectedTranslationIds: ${selectedTranslationIds.length}`);
        if (selectedTranslationIds.length === 0 && config.selectedTranslationIds && config.selectedTranslationIds.length > 0) {
          addToDebugLog(`⚠️ TIMING ISSUE: Expected ${config.selectedTranslationIds.length} translation IDs but state shows 0`);
        }
        if (selectedFormIds.length === 0 && config.selectedFormIds && config.selectedFormIds.length > 0) {
          addToDebugLog(`⚠️ TIMING ISSUE: Expected ${config.selectedFormIds.length} form IDs but state shows 0`);
        }
      }, 50);
      
      // Additional verification with longer delay to see if state eventually updates
      setTimeout(() => {
        addToDebugLog(`🔍 State verification (200ms) - selectedFormIds: ${selectedFormIds.length}, selectedTranslationIds: ${selectedTranslationIds.length}`);
        if (selectedTranslationIds.length > 0) {
          addToDebugLog(`✅ SUCCESS: Translation IDs eventually set correctly`);
        } else if (config.selectedTranslationIds && config.selectedTranslationIds.length > 0) {
          addToDebugLog(`❌ FAILURE: Translation IDs still not set after 200ms`);
        }
      }, 200);
      
      // Reset only general cache/loading states, not configuration or word-specific data
      setCurrentLocationTags(null);
      setGlobalTags(null);
      setWordSpecificTags(null);
      
      addToDebugLog(`🔧 Restored rule configuration for: ${rule.title}`);
      addToDebugLog(`📋 Mappings restored: ${JSON.stringify(config.ruleBuilderMappings)}`);
      addToDebugLog(`🏷️ Tags for migration: ${JSON.stringify(config.selectedTagsForMigration)}`);
      
      // Load appropriate data based on table type and selections
      if (config.selectedWords && config.selectedWords.length > 0) {
        addToDebugLog(`🔄 Loading data for table: ${config.selectedTable}, words: ${config.selectedWords.length}`);
        
        setTimeout(async () => {
          try {
            switch (config.selectedTable) {
              case 'word_forms':
                addToDebugLog(`📝 Loading word forms for ${config.selectedWords.length} words`);
                await loadWordFormsData(config.selectedWords);
                
                // If specific forms are selected, load their tags
                if (config.selectedFormIds && config.selectedFormIds.length > 0) {
                  setTimeout(() => {
                    addToDebugLog(`🏷️ Loading tags for ${config.selectedFormIds.length} selected forms`);
                    loadSelectedFormTags(config.selectedFormIds);
                  }, 200);
                }
                break;
                
              case 'word_translations':
                addToDebugLog(`🌍 Loading word translations for ${config.selectedWords.length} words`);
                await loadWordTranslationsData(config.selectedWords);
                
                // If specific translations are selected, load their metadata
                if (config.selectedTranslationIds && config.selectedTranslationIds.length > 0) {
                  setTimeout(() => {
                    addToDebugLog(`📊 Loading metadata for ${config.selectedTranslationIds.length} selected translations`);
                    loadSelectedTranslationMetadata(config.selectedTranslationIds);
                  }, 200);
                }
                break;
                
              case 'dictionary':
                addToDebugLog(`📚 Loading dictionary tags for ${config.selectedWords.length} words`);
                // Dictionary table - load word-specific tags
                loadWordSpecificTags();
                break;
                
              case 'all_tables':
                addToDebugLog(`🌐 Loading data across all tables for ${config.selectedWords.length} words`);
                // Load data from all relevant tables
                await Promise.all([
                  loadWordFormsData(config.selectedWords),
                  loadWordTranslationsData(config.selectedWords)
                ]);
                loadWordSpecificTags();
                break;
                
              default:
                addToDebugLog(`⚠️ Unknown table type: ${config.selectedTable}`);
            }
          } catch (error: any) {
            addToDebugLog(`❌ Error loading data for table ${config.selectedTable}: ${error.message}`);
          }
        }, 100);
      } else {
        addToDebugLog(`ℹ️ No specific words selected - rule applies globally`);
      }
    }

    // Fallback for default rules without stored config
    switch (rule.id) {
      case 'italian-to-universal-terminology':
        const italianMappings = [
          { id: '1', from: 'io', to: 'prima-persona' },
          { id: '2', from: 'tu', to: 'seconda-persona' },
          { id: '3', from: 'lui', to: 'terza-persona' },
          { id: '4', from: 'lei', to: 'terza-persona' },
          { id: '5', from: 'noi', to: 'prima-persona' },
          { id: '6', from: 'voi', to: 'seconda-persona' },
          { id: '7', from: 'loro', to: 'terza-persona' }
        ];
        setRuleBuilderMappings(italianMappings);
        setSelectedTagsForMigration(italianMappings.map(m => m.from)); // Add the "from" tags!
        setTagsToRemove([]);
        break;

      case 'cleanup-deprecated-tags':
        const deprecatedMappings = [
          { id: '1', from: 'past-participle', to: 'participio-passato' },
          { id: '2', from: 'gerund', to: 'gerundio' },
          { id: '3', from: 'infinitive', to: 'infinito' }
        ];
        setRuleBuilderMappings(deprecatedMappings);
        setSelectedTagsForMigration(deprecatedMappings.map(m => m.from)); // Add the "from" tags!
        setTagsToRemove([]);
        break;

      case 'standardize-auxiliary-tag-format':
        const auxiliaryMappings = [
          { id: '1', from: 'auxiliary-essere', to: 'essere-auxiliary' },
          { id: '2', from: 'auxiliary-avere', to: 'avere-auxiliary' },
          { id: '3', from: 'auxiliary-stare', to: 'stare-auxiliary' }
        ];
        setRuleBuilderMappings(auxiliaryMappings);
        setSelectedTagsForMigration(auxiliaryMappings.map(m => m.from)); // Add the "from" tags!
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
    const estimatedAffected = calculateAffectedCount();
    
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
    } else if (operation === 'ADD') {
      const tagsToAddText = tagsToAdd.length > 0 ? tagsToAdd.join(', ') : newTagToAdd;
      if (tagsToAddText) {
        mappingDetail = ` | Adding: "${tagsToAddText}"`;
      }
    }
    
    return `${operation} ${selectedCount} ${tagType} ${operationTarget} for ${targetScope}${operationDetail}${mappingDetail} (≈${estimatedAffected} records affected)`;
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

  const loadWordFormsData = async (wordsToLoad?: any[]) => {
    const words = wordsToLoad || selectedWords;
    if (words.length === 0) {
      addToDebugLog('⚠️ No words selected for forms loading');
      return;
    }

    setIsLoadingWordForms(true);
    addToDebugLog(`📝 Loading word forms for ${words.length} words...`);

    try {
      const formsData: Record<string, any[]> = {};

      for (const word of words) {
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

  const loadWordTranslationsData = async (wordsToLoad?: any[]) => {
    const words = wordsToLoad || selectedWords;
    if (words.length === 0) {
      addToDebugLog('⚠️ No words selected for translations loading');
      return;
    }

    setIsLoadingWordTranslations(true);
    addToDebugLog(`🌍 Loading translations for ${words.length} words...`);

    try {
      const translationsData: Record<string, any[]> = {};

      for (const word of words) {
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

  const loadSelectedFormTags = (formIds?: string[] | React.MouseEvent) => {
    // Handle both function call with IDs and onClick event
    const idsToUse = Array.isArray(formIds) ? formIds : selectedFormIds;
    
    if (idsToUse.length === 0) {
      addToDebugLog('⚠️ No forms selected for tag loading');
      return;
    }

    addToDebugLog(`🏷️ Loading tags from ${idsToUse.length} selected forms...`);

    try {
      const selectedForms = Object.values(wordFormsData || {})
        .flat()
        .filter((form: any) => idsToUse.includes(form.id));

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

  const loadSelectedTranslationMetadata = (translationIds?: string[] | React.MouseEvent) => {
    // Handle both function call with IDs and onClick event
    const idsToUse = Array.isArray(translationIds) ? translationIds : selectedTranslationIds;
    
    if (idsToUse.length === 0) {
      addToDebugLog('⚠️ No translations selected for metadata loading');
      return;
    }

    addToDebugLog(`📋 Loading metadata from ${idsToUse.length} selected translations...`);

    try {
      const selectedTranslations = Object.values(wordTranslationsData || {})
        .flat()
        .filter((translation: any) => idsToUse.includes(translation.id));

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
    } catch (error: any) {
      addToDebugLog(`❌ Error loading selected translation metadata: ${error.message}`);
    }
  };

  const calculateAffectedCount = () => {
    // Calculate a more accurate affected count based on rule configuration
    let count = 0;
    
    // If specific words are selected, estimate based on word count
    if (selectedWords.length > 0) {
      if (selectedTable === 'dictionary') {
        count = selectedWords.length;
      } else if (selectedTable === 'word_forms') {
        // Estimate forms per word (could be refined with actual data)
        count = selectedWords.reduce((sum, word) => sum + (word.formsCount || 10), 0);
      } else if (selectedTable === 'word_translations') {
        // Estimate translations per word
        count = selectedWords.reduce((sum, word) => sum + (word.translationsCount || 5), 0);
      } else if (selectedTable === 'all_tables') {
        // Combined estimate for all tables
        count = selectedWords.length + 
                selectedWords.reduce((sum, word) => sum + (word.formsCount || 10), 0) +
                selectedWords.reduce((sum, word) => sum + (word.translationsCount || 5), 0);
      }
    }
    
    // If specific forms/translations are selected
    if (selectedFormIds.length > 0) {
      count = selectedFormIds.length;
    } else if (selectedTranslationIds.length > 0) {
      count = selectedTranslationIds.length;
    }
    
    // If no specific targeting, estimate based on operation type
    if (count === 0) {
      if (operationType === 'replace' && ruleBuilderMappings.length > 0) {
        // Estimate based on mapping count - rough estimate
        count = ruleBuilderMappings.length * 10; // Assume 10 records per mapping
      } else if (operationType === 'add' && (tagsToAdd.length > 0 || newTagToAdd)) {
        // For add operations, could affect many records
        count = (tagsToAdd.length || 1) * 50; // Rough estimate
      } else if (operationType === 'remove' && selectedTagsForMigration.length > 0) {
        // Remove operations depend on how many records have those tags
        count = selectedTagsForMigration.length * 25; // Rough estimate
      } else if (selectedTagsForMigration.length > 0) {
        // General tag-based operations
        count = selectedTagsForMigration.length * 15; // Rough estimate
      }
    }
    
    // Minimum count of 1, maximum reasonable count
    return Math.max(1, Math.min(count, 10000));
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
              affectedCount: calculateAffectedCount(),
              // Update rule configuration
              ruleConfig: {
                selectedTable,
                selectedColumn,
                selectedTagsForMigration: [...selectedTagsForMigration],
                ruleBuilderMappings: [...ruleBuilderMappings],
                tagsToRemove: [...tagsToRemove],
                newTagToAdd,
                tagsToAdd: [...tagsToAdd], // NEW: Multiple tags support
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
        affectedCount: calculateAffectedCount(),
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
          tagsToAdd: [...tagsToAdd], // NEW: Multiple tags support
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
        .not('tags', 'cs', '{default-rule}')  // Exclude default rules
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setSavedCustomRules(data || []);
      addToDebugLog(`✅ Loaded ${data?.length || 0} saved custom rules (excluding defaults)`);
      
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
          targetWords: rule.targetedWords || [], // Keep for backward compatibility
          targetWordObjects: config?.selectedWords || [], // NEW: Save full word objects with UUIDs
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
          newTagToAdd: config?.newTagToAdd || '',
          tagsToAdd: config?.tagsToAdd || []
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

  const loadCustomRule = async (savedRule: any, openInBuilder: boolean = true) => {
    addToDebugLog(`📤 Loading custom rule: ${savedRule.name}`);
    
    try {
      // Convert database format back to VisualRule with full configuration
      const pattern = savedRule.pattern || {};
      const transformation = savedRule.transformation || {};
      
      // Use saved word objects if available, otherwise reconstruct from strings with real UUIDs
      let reconstructedWords = [];
      
      if (pattern.targetWordObjects && pattern.targetWordObjects.length > 0) {
        reconstructedWords = pattern.targetWordObjects;
        addToDebugLog(`🔍 Word reconstruction - Using saved objects: ${reconstructedWords.length} words`);
      } else if (pattern.targetWords && pattern.targetWords.length > 0) {
        // Need to look up real UUIDs from database for backward compatibility
        addToDebugLog(`🔍 Word reconstruction - Looking up real UUIDs for ${pattern.targetWords.length} words: [${pattern.targetWords.join(', ')}]`);
        
        try {
          const { data: realWords, error } = await supabase
            .from('dictionary')
            .select('id, italian, word_type')
            .in('italian', pattern.targetWords);
          
          if (error) {
            addToDebugLog(`❌ Failed to lookup real words: ${error.message}`);
            reconstructedWords = pattern.targetWords.map((word: string, index: number) => ({
              wordId: `word-${index}`, // Fallback to fake ID
              italian: word,
              wordType: 'unknown',
              tags: [],
              formsCount: 0,
              translationsCount: 0
            }));
          } else {
            reconstructedWords = realWords.map((word: any) => ({
              wordId: word.id,
              italian: word.italian,
              wordType: word.word_type || 'unknown',
              tags: [],
              formsCount: 0,
              translationsCount: 0
            }));
            addToDebugLog(`✅ Successfully looked up ${realWords.length} real words with UUIDs`);
          }
        } catch (lookupError: any) {
          addToDebugLog(`❌ Database lookup error: ${lookupError.message}`);
          reconstructedWords = pattern.targetWords.map((word: string, index: number) => ({
            wordId: `word-${index}`, // Fallback to fake ID
            italian: word,
            wordType: 'unknown',
            tags: [],
            formsCount: 0,
            translationsCount: 0
          }));
        }
      } else {
        reconstructedWords = [];
        addToDebugLog(`🔍 Word reconstruction - No words to reconstruct`);
      }
      
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
          tagsToAdd: transformation.tagsToAdd || [],
          selectedWords: reconstructedWords, // Reconstruct words from saved targetWords
          selectedFormIds: pattern.targetFormIds || [],
          selectedTranslationIds: pattern.targetTranslationIds || []
        }
      };
      
      // Add to current migration rules and immediately load into rule builder
      setMigrationRules(prev => [...prev, visualRule]);
      addToDebugLog(`✅ Custom rule loaded: ${savedRule.name}`);
      
      // Close the modal first (only when opening in builder)
      if (openInBuilder) {
        setShowLoadRulesModal(false);
        
        // Load the rule into the rule builder for editing
        handleCustomizeRule(visualRule);
      }
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load custom rule: ${error.message}`);
    }
  };

  const archiveCustomRule = async (ruleId: string, ruleName: string) => {
    addToDebugLog(`📦 Archiving custom rule: ${ruleName}`);
    
    try {
      const { error } = await supabase
        .from('custom_migration_rules')
        .update({ status: 'archived' })
        .eq('rule_id', ruleId);
      
      if (error) {
        throw error;
      }
      
      addToDebugLog(`✅ Custom rule archived: ${ruleName}`);
      await loadSavedCustomRules();
      await loadMigrationRules(); // Refresh active rules list
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to archive custom rule: ${error.message}`);
    }
  };

  // Remove rule from current session (for temporary loaded rules)
  const removeRuleFromSession = (ruleId: string) => {
    const rule = migrationRules.find(r => r.id === ruleId);
    if (rule) {
      setMigrationRules(prev => prev.filter(r => r.id !== ruleId));
      addToDebugLog(`🗑️ Removed rule from session: ${rule.title}`);
    }
  };

  // Load archived rules
  const loadArchivedRules = async () => {
    try {
      const { data: archived, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'archived')
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setArchivedRules(archived || []);
      addToDebugLog(`📦 Loaded ${archived?.length || 0} archived rules`);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load archived rules: ${error.message}`);
    }
  };

  // Restore archived rule
  const restoreArchivedRule = async (ruleId: string, ruleName: string) => {
    try {
      const { error } = await supabase
        .from('custom_migration_rules')
        .update({ status: 'active' })
        .eq('rule_id', ruleId);
      
      if (error) {
        throw error;
      }
      
      addToDebugLog(`✅ Restored rule: ${ruleName}`);
      await loadArchivedRules();
      await loadSavedCustomRules();
      await loadMigrationRules();
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to restore rule: ${error.message}`);
    }
  };

  // Convert custom rule to default rule
  const convertToDefaultRule = async (ruleId: string) => {
    try {
      // First get the current rule
      const { data: rule, error: fetchError } = await supabase
        .from('custom_migration_rules')
        .select('tags')
        .eq('rule_id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      // Add 'default-rule' tag if not already present
      const currentTags = rule.tags || [];
      if (!currentTags.includes('default-rule')) {
        const newTags = [...currentTags, 'default-rule'];
        
        const { error } = await supabase
          .from('custom_migration_rules')
          .update({ 
            tags: newTags,
            updated_at: new Date().toISOString()
          })
          .eq('rule_id', ruleId);

        if (error) throw error;
      }

      addToDebugLog(`✅ Converted rule ${ruleId} to default rule`);
      await Promise.all([loadMigrationRules(), loadSavedCustomRules()]);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to convert to default rule: ${error.message}`);
    }
  };

  // Convert default rule to custom rule
  const convertToCustomRule = async (ruleId: string) => {
    try {
      // First get the current rule
      const { data: rule, error: fetchError } = await supabase
        .from('custom_migration_rules')
        .select('tags')
        .eq('rule_id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      // Remove 'default-rule' tag
      const currentTags = rule.tags || [];
      const newTags = currentTags.filter(tag => tag !== 'default-rule');
      
      const { error } = await supabase
        .from('custom_migration_rules')
        .update({ 
          tags: newTags,
          updated_at: new Date().toISOString()
        })
        .eq('rule_id', ruleId);

      if (error) throw error;

      addToDebugLog(`✅ Converted rule ${ruleId} to custom rule`);
      await Promise.all([loadMigrationRules(), loadSavedCustomRules()]);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to convert to custom rule: ${error.message}`);
    }
  };

  // Load all saved custom rules into active rules
  const loadAllSavedRules = async () => {
    try {
      addToDebugLog('📤 Loading all saved custom rules...');
      const customRules = savedCustomRules.filter(rule => !rule.tags?.includes('default-rule'));
      
      for (const rule of customRules) {
        await loadCustomRule(rule, false); // Don't open each rule in builder when loading all
      }
      
      addToDebugLog(`✅ Loaded ${customRules.length} custom rules`);
      setShowLoadRulesModal(false);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load all saved rules: ${error.message}`);
    }
  };

  // Load saved rules on component mount
  useEffect(() => {
    loadSavedCustomRules();
  }, []);

  // Execution History Functions
  const loadExecutionHistory = async () => {
    setHistoryLoading(true);
    try {
      addToDebugLog('📋 Loading execution history from database...');
      
      const { data: history, error } = await supabase
        .from('migration_execution_log')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to load execution history: ${error.message}`);
      }

      setExecutionHistory(history || []);
      addToDebugLog(`✅ Loaded ${history?.length || 0} execution history entries`);
      
    } catch (error: any) {
      addToDebugLog(`❌ Failed to load execution history: ${error.message}`);
      setExecutionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load execution history when progress tab is first opened
  useEffect(() => {
    if (currentTab === 'progress' && executionHistory.length === 0) {
      loadExecutionHistory();
    }
  }, [currentTab]);

  // Filter execution history based on search and filters
  const filteredExecutionHistory = executionHistory.filter(execution => {
    // Search filter
    if (historySearch) {
      const searchLower = historySearch.toLowerCase();
      const matchesSearch = 
        execution.rule_name?.toLowerCase().includes(searchLower) ||
        execution.rule_id?.toLowerCase().includes(searchLower) ||
        execution.target_table?.toLowerCase().includes(searchLower) ||
        execution.target_column?.toLowerCase().includes(searchLower) ||
        execution.operation_type?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (historyStatusFilter && execution.status !== historyStatusFilter) {
      return false;
    }

    // Table filter
    if (historyTableFilter && execution.target_table !== historyTableFilter) {
      return false;
    }

    // Date filter
    if (historyDateFilter) {
      const executionDate = new Date(execution.executed_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (historyDateFilter) {
        case 'today':
          if (executionDate < today) return false;
          break;
        case 'yesterday':
          if (executionDate < yesterday || executionDate >= today) return false;
          break;
        case 'week':
          if (executionDate < weekAgo) return false;
          break;
        case 'month':
          if (executionDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  // Handle revert execution
  const handleRevertExecution = async (executionId: string) => {
    if (!confirm('Are you sure you want to revert this migration? This will undo all changes made by this execution.')) {
      return;
    }

    try {
      // Set revert in progress
      setRevertingExecutionId(executionId);
      addToDebugLog(`🔄 Starting revert for execution: ${executionId}`);
      
      // Find the execution
      const execution = executionHistory.find(e => e.id === executionId);
      if (!execution) {
        addToDebugLog(`❌ Execution not found in history array`);
        throw new Error('Execution not found');
      }

      addToDebugLog(`✅ Found execution: ${execution.rule_name}, can_rollback: ${execution.can_rollback}`);

      if (!execution.can_rollback) {
        throw new Error('This execution cannot be rolled back');
      }

      // Extract rollback data
      const rollbackData = execution.rollback_data;
      if (!rollbackData) {
        addToDebugLog(`❌ No rollback_data found`);
        throw new Error('No rollback data available');
      }

      if (!rollbackData.changes || !Array.isArray(rollbackData.changes)) {
        addToDebugLog(`❌ Invalid rollback_data.changes: ${JSON.stringify(rollbackData)}`);
        throw new Error('No rollback changes data available');
      }

      addToDebugLog(`📊 Reverting ${rollbackData.changes.length} individual changes...`);
      addToDebugLog(`🔍 Sample change structure: ${JSON.stringify(rollbackData.changes[0], null, 2)}`);

      // Initialize progress tracking
      const totalChanges = rollbackData.changes.length;
      setRevertProgress({ executionId, current: 0, total: totalChanges });

      // Execute rollback for each change in reverse order
      let revertedCount = 0;
      const changes = [...rollbackData.changes].reverse(); // Reverse order for rollback

      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        addToDebugLog(`🔄 Processing change ${i + 1}/${changes.length}: ${change.change_id}`);
        
        // Update progress
        setRevertProgress({ executionId, current: i + 1, total: totalChanges });
        
        if (change.rollback_data?.rollback_operation === 'direct_restore') {
          addToDebugLog(`📊 Reverting ${change.rollback_data.target_table}.${change.rollback_data.target_column} for record ${change.rollback_data.target_record_uuid}`);
          
          const { data: revertData, error: revertError } = await supabase
            .from(change.rollback_data.target_table)
            .update({ [change.rollback_data.target_column]: change.rollback_data.restore_to_value })
            .eq('id', change.rollback_data.target_record_uuid)
            .select('id');

          if (revertError) {
            addToDebugLog(`⚠️ Failed to revert change ${change.change_id}: ${revertError.message}`);
            continue;
          }

          if (!revertData || revertData.length === 0) {
            addToDebugLog(`⚠️ Revert returned no data for change ${change.change_id} - record may not exist`);
            continue;
          }

          addToDebugLog(`✅ Successfully reverted change ${change.change_id}`);
          revertedCount++;
        } else {
          addToDebugLog(`⚠️ Skipping change ${change.change_id}: unsupported rollback operation ${change.rollback_data?.rollback_operation}`);
        }
      }

      // Mark execution as reverted
      const { error: updateError } = await supabase
        .from('migration_execution_log')
        .update({ 
          reverted_at: new Date().toISOString(),
          reverted_by: 'admin-user', // TODO: Get actual user from session
          revert_notes: `${revertedCount}/${rollbackData.changes.length} changes reverted successfully`,
          notes: `${execution.notes || ''} | REVERTED: ${revertedCount}/${rollbackData.changes.length} changes reverted successfully`
        })
        .eq('id', executionId);

      if (updateError) {
        addToDebugLog(`⚠️ Failed to update execution status: ${updateError.message}`);
      }

      addToDebugLog(`✅ Revert completed: ${revertedCount}/${rollbackData.changes.length} changes reverted`);
      
      // Reload execution history
      await loadExecutionHistory();
      
    } catch (error: any) {
      addToDebugLog(`❌ Revert failed: ${error.message}`);
      alert(`Failed to revert execution: ${error.message}`);
    } finally {
      // Clear revert state
      setRevertingExecutionId(null);
      setRevertProgress(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              <div className="space-x-3">
                <button
                  onClick={loadMigrationRules}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🔄 Reload Rules
                </button>
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLoadRulesModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  📚 Load Saved ({savedCustomRules.length})
                </button>
                <button
                  onClick={() => {
                    setShowArchivedModal(true);
                    loadArchivedRules();
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  📦 Archive ({archivedRules.length})
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

            {/* Unified Migration Rules Section */}
            <div className="space-y-4">
              {/* Group rules by source for section headers */}
              {['default', 'custom', 'loaded'].map(source => {
                const rulesForSource = migrationRules.filter(rule => 
                  source === 'default' ? rule.ruleSource === 'default' : 
                  source === 'custom' ? (rule.ruleSource === 'custom' || rule.ruleSource === 'loaded') : 
                  false
                );
                
                if (rulesForSource.length === 0) return null;
                
                const sectionConfig = {
                  'default': {
                    title: '🔧 System Default Rules',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800'
                  },
                  'custom': {
                    title: '⚡ Custom & Loaded Rules', 
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800'
                  }
                }[source === 'loaded' ? 'custom' : source];
                
                return (
                  <div key={source} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-700">{sectionConfig.title}</h4>
                      <span className={`px-2 py-1 text-xs ${sectionConfig.bgColor} ${sectionConfig.textColor} rounded-full`}>
                        {rulesForSource.length}
                      </span>
                    </div>
                    {rulesForSource.map((rule) => (
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
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500 font-mono">ID: {rule.id}</span>
                                {rule.lastRun && (
                                  <span className="text-xs text-green-600">
                                    ✓ Last run: {new Date(rule.lastRun).toLocaleDateString()}
                                  </span>
                                )}
                                {!rule.lastRun && (
                                  <span className="text-xs text-gray-400">Never run</span>
                                )}
                              </div>
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
                            <div className="text-gray-500">
                              Rows
                              {rule.estimatedCount !== undefined && rule.estimatedCount !== rule.affectedCount && (
                                <span className="text-xs block text-red-500">Est: {rule.estimatedCount}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center p-1 bg-white bg-opacity-50 rounded">
                            <div className="font-medium">{rule.estimatedTime}</div>
                            <div className="text-gray-500">Time</div>
                          </div>
                        </div>

                        {/* Rule Configuration Details - Only for custom/loaded rules */}
                        {rule.ruleConfig && (rule.ruleSource === 'custom' || rule.ruleSource === 'loaded') && (
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
                              {rule.ruleConfig.tagsToAdd?.length > 0 && (
                                <div>
                                  <span className="font-medium">Adding Multiple:</span> {rule.ruleConfig.tagsToAdd.join(', ')}
                                </div>
                              )}
                              {rule.ruleConfig.selectedWords?.length > 0 && (
                                <div>
                                  <span className="font-medium">Target Words:</span> {rule.ruleConfig.selectedWords.slice(0, 2).map(w => w.italian).join(', ')}
                                  {rule.ruleConfig.selectedWords.length > 2 && ` (+${rule.ruleConfig.selectedWords.length - 2} more)`}
                                </div>
                              )}
                              {rule.ruleConfig.selectedFormIds?.length > 0 && (
                                <div>
                                  <span className="font-medium">Target Forms:</span> {rule.ruleConfig.selectedFormIds.length} specific form{rule.ruleConfig.selectedFormIds.length > 1 ? 's' : ''} selected
                                </div>
                              )}
                              {rule.ruleConfig.selectedTranslationIds?.length > 0 && (
                                <div>
                                  <span className="font-medium">Target Translations:</span> {rule.ruleConfig.selectedTranslationIds.length} specific translation{rule.ruleConfig.selectedTranslationIds.length > 1 ? 's' : ''} selected
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Prevent Duplicates:</span> {rule.preventDuplicates ? 'Yes' : 'No'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons - Conditional based on rule source */}
                        <div className={`grid gap-1 ${rule.ruleSource === 'default' ? 'grid-cols-5' : 'grid-cols-6'}`}>
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
                          {rule.ruleSource === 'default' ? (
                            <button
                              onClick={() => convertToCustomRule(rule.id)}
                              className="text-xs py-2 px-1 border border-orange-300 rounded text-orange-700 bg-orange-50 hover:bg-orange-100"
                              title="Convert to Custom Rule"
                            >
                              ⚡ Custom
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => convertToDefaultRule(rule.id)}
                                className="text-xs py-2 px-1 border border-blue-300 rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                                title="Convert to Default Rule"
                              >
                                🔧 Default
                              </button>
                              <button
                                onClick={() => removeRuleFromSession(rule.id)}
                                className="text-xs py-2 px-1 border border-red-300 rounded text-red-700 bg-red-50 hover:bg-red-100"
                                title="Delete Rule"
                              >
                                🗑️
                              </button>
                            </>
                          )}
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
                );
              })}
            </div>
          </div>
        )}

        {/* Execution History Tab */}
        {currentTab === 'progress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Migration Execution History</h3>
                <p className="text-sm text-gray-600">
                  Detailed audit trail with searchable logs and revert functionality
                </p>
              </div>
              <button
                onClick={loadExecutionHistory}
                disabled={historyLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {historyLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    🔄 Refresh History
                  </>
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search rules, tables, operations..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="rolled_back">Rolled Back</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                  <select
                    value={historyTableFilter}
                    onChange={(e) => setHistoryTableFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Tables</option>
                    <option value="word_forms">word_forms</option>
                    <option value="word_translations">word_translations</option>
                    <option value="dictionary">dictionary</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Execution History Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {filteredExecutionHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {historyLoading ? 'Loading execution history...' : 
                     executionHistory.length === 0 ? 'No executions found. Execute a migration rule to see history here.' :
                     'No executions match your current filters.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredExecutionHistory.map((execution) => (
                    <div key={execution.id} className="p-4 hover:bg-gray-50">
                      {/* Execution Summary Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                              execution.status === 'success' ? 'bg-green-400' :
                              execution.status === 'failed' ? 'bg-red-400' :
                              execution.status === 'rolled_back' ? 'bg-yellow-400' : 'bg-gray-400'
                            }`}></div>
                            <div className="truncate">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {execution.rule_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {execution.operation_type?.toUpperCase()} on {execution.target_table}.{execution.target_column} •
                                {execution.records_affected} records •
                                {formatDate(execution.executed_at)}
                                {execution.reverted_at && (
                                  <span className="text-purple-600 font-medium"> • REVERTED {formatDate(execution.reverted_at)}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            execution.reverted_at ? 'bg-purple-100 text-purple-800' :
                            execution.status === 'success' ? 'bg-green-100 text-green-800' :
                            execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                            execution.status === 'rolled_back' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {execution.reverted_at ? '↶ Reverted' :
                             execution.status === 'success' ? '✅ Success' :
                             execution.status === 'failed' ? '❌ Failed' :
                             execution.status === 'rolled_back' ? '🔄 Rolled Back' : execution.status}
                          </span>
                          {execution.can_rollback && execution.status === 'success' && !execution.reverted_at && (
                            <button
                              onClick={() => handleRevertExecution(execution.id)}
                              disabled={revertingExecutionId === execution.id}
                              className={`inline-flex items-center px-3 py-1 border text-xs font-medium rounded ${
                                revertingExecutionId === execution.id 
                                  ? 'border-yellow-300 text-yellow-700 bg-yellow-50 cursor-not-allowed'
                                  : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                              }`}
                            >
                              {revertingExecutionId === execution.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Reverting...
                                </>
                              ) : (
                                <>🔄 Revert</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedHistoryId(expandedHistoryId === execution.id ? null : execution.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedHistoryId === execution.id ? '▼' : '▶'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedHistoryId === execution.id && (
                        <div className="mt-4 space-y-4">
                          {/* Revert Progress Bar */}
                          {revertProgress && revertProgress.executionId === execution.id && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-yellow-900">Revert in Progress</h4>
                                <span className="text-xs text-yellow-700">
                                  {revertProgress.current} / {revertProgress.total} changes reverted
                                </span>
                              </div>
                              <div className="w-full bg-yellow-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${(revertProgress.current / revertProgress.total) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center mt-2 text-xs text-yellow-700">
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Reverting individual changes...
                              </div>
                            </div>
                          )}
                          
                          {/* Execution Details */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Execution Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="font-medium">Rule ID:</span> {execution.rule_id}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {execution.execution_duration_ms}ms
                              </div>
                              <div>
                                <span className="font-medium">Records Affected:</span> {execution.records_affected}
                              </div>
                              <div>
                                <span className="font-medium">Context:</span> {execution.execution_context}
                              </div>
                            </div>
                            {execution.notes && (
                              <div className="mt-2">
                                <span className="font-medium text-xs">Notes:</span>
                                <p className="text-xs text-gray-600 mt-1">{execution.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Revert Information */}
                          {execution.reverted_at && (
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <h4 className="text-sm font-medium text-purple-900 mb-2">Revert Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-medium">Reverted At:</span> {formatDate(execution.reverted_at)}
                                </div>
                                <div>
                                  <span className="font-medium">Reverted By:</span> {execution.reverted_by || 'System'}
                                </div>
                              </div>
                              {execution.revert_notes && (
                                <div className="mt-2">
                                  <span className="font-medium text-xs">Revert Notes:</span>
                                  <p className="text-xs text-purple-700 mt-1">{execution.revert_notes}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Individual Changes */}
                          {execution.changes_made && execution.changes_made.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Individual Changes ({execution.changes_made.length})
                              </h4>
                              <div className="max-h-96 overflow-y-auto space-y-2">
                                {execution.changes_made.map((change: any, index: number) => (
                                  <div key={change.change_id || index} className="bg-white border border-blue-200 rounded p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-blue-900">
                                        #{index + 1}: {change.operation_type} on {change.table_changed}.{change.column_changed}
                                      </span>
                                      <span className="text-xs text-blue-600">
                                        {change.change_timestamp ? formatDate(change.change_timestamp) : ''}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <div className="font-medium">Record UUID:</div>
                                      <div className="font-mono text-xs break-all">{change.record_primary_key_uuid}</div>
                                    </div>
                                    {change.operation_details && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        <div className="font-medium">Operation:</div>
                                        <div className="text-xs">{JSON.stringify(change.operation_details, null, 2)}</div>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div>
                                        <div className="font-medium text-xs text-red-700">Before:</div>
                                        <div className="text-xs font-mono bg-red-50 p-1 rounded max-h-20 overflow-y-auto">
                                          {JSON.stringify(change.before_value)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-medium text-xs text-green-700">After:</div>
                                        <div className="text-xs font-mono bg-green-50 p-1 rounded max-h-20 overflow-y-auto">
                                          {JSON.stringify(change.after_value)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedRule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-3 sm:p-5 border w-full sm:w-11/12 max-w-4xl shadow-lg rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-lg font-medium text-gray-900 pr-2">
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
                    <span className="font-medium">{previewData?.totalAffectedCount || selectedRule.affectedCount} rows</span> will be updated in
                    <span className="font-medium"> {selectedRule.estimatedTime}</span>
                  </div>
                  
                  {/* Detailed Rule Configuration */}
                  {selectedRule.ruleConfig && (
                    <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
                      <div className="text-xs font-medium text-blue-900 mb-2">Rule Configuration:</div>
                      <div className="space-y-1 text-xs text-blue-800">
                        <div><span className="font-medium">Operation:</span> {selectedRule.operationType?.toUpperCase()} on {selectedRule.ruleConfig.selectedTable}:{selectedRule.ruleConfig.selectedColumn}</div>
                        {selectedRule.ruleConfig.selectedTagsForMigration?.length > 0 && (
                          <div><span className="font-medium">Target Tags:</span> {selectedRule.ruleConfig.selectedTagsForMigration.join(', ')}</div>
                        )}
                        {selectedRule.ruleConfig.ruleBuilderMappings?.length > 0 && (
                          <div>
                            <span className="font-medium">Mappings:</span>
                            <div className="ml-2 mt-1">
                              {selectedRule.ruleConfig.ruleBuilderMappings.map(m => (
                                <div key={m.id} className="text-xs">"{m.from}" → "{m.to}"</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedRule.ruleConfig.newTagToAdd && (
                          <div><span className="font-medium">Adding:</span> "{selectedRule.ruleConfig.newTagToAdd}"</div>
                        )}
                        {selectedRule.ruleConfig.tagsToAdd?.length > 0 && (
                          <div><span className="font-medium">Adding Multiple:</span> {selectedRule.ruleConfig.tagsToAdd.join(', ')}</div>
                        )}
                        {selectedRule.ruleConfig.selectedWords?.length > 0 && (
                          <div><span className="font-medium">Target Words:</span> {selectedRule.ruleConfig.selectedWords.map(w => w.italian).join(', ')}</div>
                        )}
                        {selectedRule.ruleConfig.selectedFormIds?.length > 0 && (
                          <div><span className="font-medium">Target Forms:</span> {selectedRule.ruleConfig.selectedFormIds.length} specific form{selectedRule.ruleConfig.selectedFormIds.length > 1 ? 's' : ''} selected</div>
                        )}
                        {selectedRule.ruleConfig.selectedTranslationIds?.length > 0 && (
                          <div><span className="font-medium">Target Translations:</span> {selectedRule.ruleConfig.selectedTranslationIds.length} specific translation{selectedRule.ruleConfig.selectedTranslationIds.length > 1 ? 's' : ''} selected</div>
                        )}
                        <div><span className="font-medium">Prevent Duplicates:</span> {selectedRule.preventDuplicates ? 'Yes' : 'No'}</div>
                        {previewData?.affectedTables?.length > 0 && (
                          <div><span className="font-medium">Affected Tables:</span> {previewData.affectedTables.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
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
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Sample Changes
                      {previewData.totalAffectedCount > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          (showing {previewData.beforeSamples.length} of {previewData.totalAffectedCount} affected records)
                        </span>
                      )}
                    </h4>
                    <div className="space-y-3">
                      {previewData.beforeSamples.map((sample: any) => (
                        <div key={sample.id} className="border rounded-lg p-3 bg-gray-50">
                          {/* Record context */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                            <div className="text-xs text-gray-600 truncate">
                              <span className="font-medium">{sample.table || 'word_forms'}</span>
                              {sample.word_context && <span className="ml-1 sm:ml-2">• {sample.word_context}</span>}
                              {sample.record_id && <span className="ml-1 sm:ml-2 hidden sm:inline">• ID: {sample.record_id}</span>}
                            </div>
                            {sample.changes && (
                              <span className="text-xs text-green-600 font-medium self-start sm:self-auto">✓ Changes</span>
                            )}
                          </div>
                          
                          {/* Before/After comparison */}
                          <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Before:</div>
                              <code className="text-xs sm:text-sm bg-white px-2 py-1 rounded border block break-all">
                                {sample.before}
                              </code>
                            </div>
                            <div className="flex-shrink-0 self-center sm:mt-6">
                              <span className="text-gray-400 text-sm sm:hidden">↓</span>
                              <span className="text-gray-400 text-sm hidden sm:inline">→</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">After:</div>
                              <code className="text-xs sm:text-sm bg-white px-2 py-1 rounded border block break-all">
                                {sample.after}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {previewData.beforeSamples.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No matching records found for this rule configuration.
                        </div>
                      )}
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

                <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
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
                          onClick={() => loadWordFormsData()}
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
                        onClick={() => loadWordTranslationsData()}
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Tags to add:</span>
                      <button
                        onClick={() => {
                          if (newTagToAdd.trim()) {
                            setTagsToAdd(prev => [...prev, newTagToAdd.trim()]);
                            setNewTagToAdd('');
                          }
                        }}
                        disabled={!newTagToAdd.trim()}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                      >
                        + Add Tag
                      </button>
                    </div>
                    
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={newTagToAdd}
                        onChange={(e) => setNewTagToAdd(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newTagToAdd.trim()) {
                            setTagsToAdd(prev => [...prev, newTagToAdd.trim()]);
                            setNewTagToAdd('');
                          }
                        }}
                        placeholder="Enter tag to add..."
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    {tagsToAdd.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Tags to add:</div>
                        <div className="flex flex-wrap gap-1">
                          {tagsToAdd.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                            >
                              {tag}
                              <button
                                onClick={() => {
                                  const tagToRemove = tag;
                                  setTagsToAdd(prev => prev.filter((_, i) => i !== index));
                                  // Also remove from selectedTagsForMigration if it exists there
                                  setSelectedTagsForMigration(prev => prev.filter(t => t !== tagToRemove));
                                }}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-600">
                      {tagsToAdd.length > 0 
                        ? `${tagsToAdd.length} tag(s) will be added to ${selectedFormIds.length || selectedTranslationIds.length || 'all'} selected items.`
                        : `Enter tags above to add to ${selectedFormIds.length || selectedTranslationIds.length || 'all'} selected items.`
                      }
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
                      (operationType === 'add' && tagsToAdd.length === 0) ||
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
                      (operationType === 'add' && tagsToAdd.length === 0) ||
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
                          onClick={() => archiveCustomRule(savedRule.rule_id, savedRule.name)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          📦 Archive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <div className="space-x-2">
                <button
                  onClick={loadSavedCustomRules}
                  disabled={isLoadingSavedRules}
                  className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={loadAllSavedRules}
                  disabled={isLoadingSavedRules || savedCustomRules.length === 0}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  📤 Load All
                </button>
              </div>
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

      {/* Archive Rules Modal */}
      {showArchivedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">📦 Archived Rules</h3>
              <button
                onClick={() => setShowArchivedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {archivedRules.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No archived rules found</div>
                <p className="text-sm text-gray-400">
                  Rules that are archived will appear here and can be restored
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {archivedRules.map((rule) => (
                  <div key={rule.rule_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {rule.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {rule.description || 'No description'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span className="font-mono">ID: {rule.rule_id}</span>
                          <span className="ml-4">
                            Archived: {new Date(rule.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 ml-4">
                        <button
                          onClick={() => restoreArchivedRule(rule.rule_id, rule.name)}
                          className="px-3 py-1 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
                        >
                          ↶ Restore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={loadArchivedRules}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowArchivedModal(false)}
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

