'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Enhanced rule structure with Step 2 metadata
interface SimpleRule {
  id: string;
  name: string;
  mappings: { from: string; to: string }[];
  selectedTranslations: { id: string; name: string }[];
  selectedForms: { id: string; name: string }[];
  availableMetadataKeys: string[];
  selectedTagsForMigration: string[];
  status: 'ready' | 'saved';
}

interface WordSearchResult {
  wordId: string;
  italian: string;
  wordType: string;
  forms: { id: string; form_text: string; metadata?: any; optional_tags?: string[] }[];
  translations: { id: string; translation: string; metadata?: any; optional_tags?: string[] }[];
}

export default function SimpleMigrationTest() {
  const [rules, setRules] = useState<SimpleRule[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<SimpleRule | null>(null);

  // Builder state
  const [ruleName, setRuleName] = useState('');
  const [mappings, setMappings] = useState<{ from: string; to: string }[]>([]);
  const [selectedTranslations, setSelectedTranslations] = useState<{ id: string; name: string }[]>([]);
  const [selectedForms, setSelectedForms] = useState<{ id: string; name: string }[]>([]);
  const [selectedDictionaryWords, setSelectedDictionaryWords] = useState<{ id: string; name: string }[]>([]);
  const [availableMetadataKeys, setAvailableMetadataKeys] = useState<string[]>([]);
  const [selectedTagsForMigration, setSelectedTagsForMigration] = useState<string[]>([]);
  
  // Separate tracking for clearer UI
  const [availableFormTags, setAvailableFormTags] = useState<string[]>([]);
  const [availableTranslationKeys, setAvailableTranslationKeys] = useState<string[]>([]);
  const [availableDictionaryKeys, setAvailableDictionaryKeys] = useState<string[]>([]);

  // Word search state
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [wordSearchResults, setWordSearchResults] = useState<WordSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved rules on mount
  useEffect(() => {
    loadRules();
  }, []);

  // Search words when term changes
  useEffect(() => {
    if (wordSearchTerm.trim().length > 2) {
      searchWords();
    } else {
      setWordSearchResults([]);
    }
  }, [wordSearchTerm]);

  // Load Step 2 metadata when forms/translations/dictionary words change (same behavior for create AND edit)
  useEffect(() => {
    console.log('🔄 Step 2 useEffect triggered (create AND edit mode):', { 
      formCount: selectedForms.length, 
      translationCount: selectedTranslations.length,
      dictionaryCount: selectedDictionaryWords.length,
      currentKeys: availableMetadataKeys.length,
      editingMode: !!editingRule
    });
    
    if (selectedForms.length > 0 || selectedTranslations.length > 0 || selectedDictionaryWords.length > 0) {
      console.log('📊 Re-querying current metadata from database...');
      loadAvailableMetadata();
    } else {
      console.log('🧹 Clearing metadata - no items selected');
      setAvailableMetadataKeys([]);
      setSelectedTagsForMigration([]);
      setAvailableFormTags([]);
      setAvailableTranslationKeys([]);
      setAvailableDictionaryKeys([]);
    }
  }, [selectedForms, selectedTranslations, selectedDictionaryWords]);

  const searchWords = async () => {
    if (isSearching) return;
    setIsSearching(true);

    try {
      console.log('🔍 Searching for words:', wordSearchTerm);
      
      const { data: wordsData, error: wordsError } = await supabase
        .from('dictionary')
        .select('id, italian, word_type')
        .ilike('italian', `%${wordSearchTerm}%`)
        .limit(10);

      if (wordsError) throw wordsError;
      if (!wordsData?.length) {
        setWordSearchResults([]);
        return;
      }

      const wordIds = wordsData.map(w => w.id);

      // Get forms for these words (using new metadata structure)
      const { data: formsData, error: formsError } = await supabase
        .from('word_forms')
        .select('id, word_id, form_text, metadata, optional_tags')
        .in('word_id', wordIds);

      // Get translations for these words (metadata column renamed from context_metadata)
      const { data: translationsData, error: translationsError } = await supabase
        .from('word_translations')
        .select('id, word_id, translation, metadata, optional_tags')
        .in('word_id', wordIds);

      if (formsError) throw formsError;
      if (translationsError) throw translationsError;

      const searchResults: WordSearchResult[] = wordsData.map(word => ({
        wordId: word.id,
        italian: word.italian,
        wordType: word.word_type,
        forms: formsData?.filter(f => f.word_id === word.id) || [],
        translations: translationsData?.filter(t => t.word_id === word.id) || []
      }));

      setWordSearchResults(searchResults);
      console.log('✅ Found words:', searchResults);
    } catch (error) {
      console.error('❌ Word search failed:', error);
      setWordSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadAvailableMetadata = async () => {
    console.log('📊 STARTING metadata loading for NEW UNIFIED SCHEMA:', { 
      selectedFormIds: selectedForms.map(f => f.id),
      selectedTranslationIds: selectedTranslations.map(t => t.id),
      selectedDictionaryIds: selectedDictionaryWords.map(d => d.id)
    });
    
    const formTags = new Set<string>();
    const translationKeys = new Set<string>();
    const dictionaryKeys = new Set<string>();

    // Extract metadata and optional_tags from selected forms (NEW unified structure)
    if (selectedForms.length > 0) {
      try {
        console.log('🔍 Fetching form metadata with NEW unified schema...');
        const { data: formsData, error: formsError } = await supabase
          .from('word_forms')
          .select('id, metadata, optional_tags')
          .in('id', selectedForms.map(f => f.id));

        if (formsError) throw formsError;
        console.log('📝 Forms data received (NEW schema):', formsData);
        
        formsData?.forEach(form => {
          console.log('📝 Processing form (NEW schema):', form.id, form.metadata, form.optional_tags);
          
          // Extract metadata fields (structured) - NEW: tense, person, number, etc.
          if (form.metadata && typeof form.metadata === 'object') {
            Object.entries(form.metadata).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                const displayValue = `metadata.${key}: ${value}`;
                console.log('🏷️ Adding form metadata key-value:', displayValue);
                formTags.add(displayValue); // Show actual values for migration decisions
              }
            });
          }
          
          // Extract optional_tags array - NEW: descriptive tags only
          if (form.optional_tags && Array.isArray(form.optional_tags)) {
            form.optional_tags.forEach(tag => {
              console.log('🏷️ Adding form optional tag:', tag);
              formTags.add(tag);
            });
          }
        });
      } catch (error) {
        console.error('❌ Failed to load form metadata:', error);
      }
    }

    // Extract metadata and optional_tags from selected translations (NEW unified structure)
    if (selectedTranslations.length > 0) {
      try {
        console.log('🔍 Fetching translation metadata with NEW unified schema...');
        const { data: translationsData, error: translationsError } = await supabase
          .from('word_translations')
          .select('id, metadata, optional_tags')
          .in('id', selectedTranslations.map(t => t.id));

        if (translationsError) throw translationsError;
        console.log('🔤 Translations data received (NEW schema):', translationsData);
        
        translationsData?.forEach(translation => {
          console.log('🔤 Processing translation (NEW schema):', translation.id, translation.metadata, translation.optional_tags);
          
          // Extract metadata fields (structured) - NEW: register, gender_usage, auxiliary, etc.
          if (translation.metadata && typeof translation.metadata === 'object') {
            Object.entries(translation.metadata).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                const displayValue = `metadata.${key}: ${value}`;
                console.log('🏷️ Adding translation metadata key-value:', displayValue);
                translationKeys.add(displayValue); // Show actual values for migration decisions
              }
            });
          }
          
          // Extract optional_tags array - NEW: descriptive tags only  
          if (translation.optional_tags && Array.isArray(translation.optional_tags)) {
            translation.optional_tags.forEach(tag => {
              console.log('🏷️ Adding translation optional tag:', tag);
              translationKeys.add(tag);
            });
          }
        });
      } catch (error) {
        console.error('❌ Failed to load translation metadata:', error);
      }
    }

    // Extract metadata and optional_tags from selected dictionary words (NEW unified structure)
    if (selectedDictionaryWords.length > 0) {
      try {
        console.log('🔍 Fetching dictionary metadata with NEW unified schema...');
        const { data: dictionaryData, error: dictionaryError } = await supabase
          .from('dictionary')
          .select('id, metadata, optional_tags')
          .in('id', selectedDictionaryWords.map(d => d.id));

        if (dictionaryError) throw dictionaryError;
        console.log('📖 Dictionary data received (NEW schema):', dictionaryData);
        
        dictionaryData?.forEach(word => {
          console.log('📖 Processing dictionary word (NEW schema):', word.id, word.metadata, word.optional_tags);
          
          // Extract metadata fields (structured) - NEW: word_type, conjugation_type, auxiliary, etc.
          if (word.metadata && typeof word.metadata === 'object') {
            Object.entries(word.metadata).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                const displayValue = `metadata.${key}: ${value}`;
                console.log('🏷️ Adding dictionary metadata key-value:', displayValue);
                dictionaryKeys.add(displayValue); // Show actual values for migration decisions
              }
            });
          }
          
          // Extract optional_tags array - NEW: descriptive tags only  
          if (word.optional_tags && Array.isArray(word.optional_tags)) {
            word.optional_tags.forEach(tag => {
              console.log('🏷️ Adding dictionary optional tag:', tag);
              dictionaryKeys.add(tag);
            });
          }
        });
      } catch (error) {
        console.error('❌ Failed to load dictionary metadata:', error);
      }
    }

    // Combine all three sets for backward compatibility, but track separately
    const allKeys = [...Array.from(formTags), ...Array.from(translationKeys), ...Array.from(dictionaryKeys)].sort();
    console.log('🎯 SETTING metadata - Form tags:', Array.from(formTags), 'Translation keys:', Array.from(translationKeys), 'Dictionary keys:', Array.from(dictionaryKeys));
    
    setAvailableMetadataKeys(allKeys);
    setAvailableFormTags(Array.from(formTags));
    setAvailableTranslationKeys(Array.from(translationKeys));
    setAvailableDictionaryKeys(Array.from(dictionaryKeys));
    
    // In edit mode, preserve previously selected tags that are still available
    if (editingRule) {
      const stillAvailableTags = selectedTagsForMigration.filter(tag => allKeys.includes(tag));
      if (stillAvailableTags.length !== selectedTagsForMigration.length) {
        console.log('🔄 Some tags no longer available, filtering:', {
          previous: selectedTagsForMigration,
          stillAvailable: stillAvailableTags
        });
        setSelectedTagsForMigration(stillAvailableTags);
      }
    }
    
    console.log('✅ Metadata loading COMPLETED. Combined keys:', allKeys);
  };

  const loadRules = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const simpleRules: SimpleRule[] = data?.map(rule => ({
        id: rule.rule_id,
        name: rule.name,
        mappings: Object.entries(rule.transformation?.mappings || {}).map(([from, to]) => ({ from, to: to as string })),
        selectedTranslations: rule.rule_config?.selectedTranslationNames?.map((name: string, index: number) => ({
          id: rule.rule_config?.selectedTranslationIds?.[index] || `id-${index}`,
          name
        })) || [],
        selectedForms: rule.rule_config?.selectedFormNames?.map((name: string, index: number) => ({
          id: rule.rule_config?.selectedFormIds?.[index] || `id-${index}`,
          name
        })) || [],
        availableMetadataKeys: rule.rule_config?.availableMetadataKeys || [],
        selectedTagsForMigration: rule.rule_config?.selectedTagsForMigration || [],
        status: 'saved'
      })) || [];

      setRules(simpleRules);
      console.log('✅ Loaded rules:', simpleRules);
    } catch (error) {
      console.error('❌ Failed to load rules:', error);
    }
  };

  const saveRule = async () => {
    if (!ruleName.trim() || mappings.length === 0) return;

    const ruleId = editingRule?.id || `test-${Date.now()}`;
    
    try {
      const ruleData = {
        rule_id: ruleId,
        name: ruleName,
        description: 'Test rule with Step 2 metadata',
        pattern: {
          table: 'word_translations',
          column: 'context_metadata',
          targetFormIds: selectedForms.map(f => f.id),
          targetTranslationIds: selectedTranslations.map(t => t.id)
        },
        transformation: {
          type: 'array_replace',
          mappings: mappings.reduce((acc, m) => {
            acc[m.from] = m.to;
            return acc;
          }, {} as Record<string, string>)
        },
        rule_config: {
          selectedFormIds: selectedForms.map(f => f.id),
          selectedFormNames: selectedForms.map(f => f.name),
          selectedTranslationIds: selectedTranslations.map(t => t.id),
          selectedTranslationNames: selectedTranslations.map(t => t.name),
          availableMetadataKeys,
          selectedTagsForMigration,
          ruleBuilderMappings: mappings.map((m, i) => ({ id: i.toString(), from: m.from, to: m.to }))
        },
        status: 'active',
        tags: ['test-rule'],
        created_at: new Date().toISOString()
      };

      let error;
      if (editingRule) {
        ({ error } = await supabase
          .from('custom_migration_rules')
          .update(ruleData)
          .eq('rule_id', ruleId));
      } else {
        ({ error } = await supabase
          .from('custom_migration_rules')
          .insert(ruleData));
      }

      if (error) throw error;

      const newRule: SimpleRule = {
        id: ruleId,
        name: ruleName,
        mappings: [...mappings],
        selectedTranslations: [...selectedTranslations],
        selectedForms: [...selectedForms],
        availableMetadataKeys: [...availableMetadataKeys],
        selectedTagsForMigration: [...selectedTagsForMigration],
        status: 'saved'
      };

      if (editingRule) {
        setRules(prev => prev.map(r => r.id === ruleId ? newRule : r));
      } else {
        setRules(prev => [...prev, newRule]);
      }

      resetBuilder();
      console.log('✅ Rule saved:', newRule);
    } catch (error) {
      console.error('❌ Failed to save rule:', error);
    }
  };

  const editRule = async (rule: SimpleRule) => {
    console.log('✏️ STARTING editRule - will re-query metadata like create mode:', {
      ruleName: rule.name,
      mappings: rule.mappings,
      selectedForms: rule.selectedForms,
      selectedTranslations: rule.selectedTranslations,
      storedKeys: rule.availableMetadataKeys,
      storedTags: rule.selectedTagsForMigration
    });

    // Set editing rule and basic data
    setEditingRule(rule);
    setRuleName(rule.name);
    setMappings([...rule.mappings]);
    
    // Pre-set the tags we want to restore after metadata loads
    setSelectedTagsForMigration([...rule.selectedTagsForMigration]);
    
    // Set forms and translations - this will trigger useEffect to re-query metadata
    setSelectedTranslations([...rule.selectedTranslations]);
    setSelectedForms([...rule.selectedForms]);
    
    setShowBuilder(true);
    
    console.log('✏️ Basic state restored - useEffect will re-query current metadata and preserve selected tags');
    console.log('✅ Edit mode activated - Step 2 will show current metadata with previous selections');
  };

  const resetBuilder = () => {
    setEditingRule(null);
    setRuleName('');
    setMappings([]);
    setSelectedTranslations([]);
    setSelectedForms([]);
    setSelectedDictionaryWords([]);
    setAvailableMetadataKeys([]);
    setSelectedTagsForMigration([]);
    setAvailableFormTags([]);
    setAvailableTranslationKeys([]);
    setAvailableDictionaryKeys([]);
    setWordSearchTerm('');
    setWordSearchResults([]);
    setShowBuilder(false);
  };

  const addMapping = () => {
    setMappings(prev => [...prev, { from: '', to: '' }]);
  };

  const updateMapping = (index: number, field: 'from' | 'to', value: string) => {
    setMappings(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };

  const selectForm = (word: WordSearchResult, form: any) => {
    const formItem = { id: form.id, name: form.form_text };
    if (!selectedForms.find(f => f.id === form.id)) {
      setSelectedForms(prev => [...prev, formItem]);
      console.log('📝 Selected form:', formItem);
    }
  };

  const selectTranslation = (word: WordSearchResult, translation: any) => {
    const translationItem = { id: translation.id, name: translation.translation };
    if (!selectedTranslations.find(t => t.id === translation.id)) {
      setSelectedTranslations(prev => [...prev, translationItem]);
      console.log('🔤 Selected translation:', translationItem);
    }
  };

  const selectDictionaryWord = (word: WordSearchResult) => {
    const dictionaryItem = { id: word.wordId, name: word.italian };
    if (!selectedDictionaryWords.find(d => d.id === word.wordId)) {
      setSelectedDictionaryWords(prev => [...prev, dictionaryItem]);
      console.log('📖 Selected dictionary word:', dictionaryItem);
    }
  };

  const toggleMetadataTag = (key: string) => {
    setSelectedTagsForMigration(prev => 
      prev.includes(key) 
        ? prev.filter(tag => tag !== key)
        : [...prev, key]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            UNIFIED METADATA MIGRATION TEST - Story 002.003.1 Implementation
          </h1>
          <button
            onClick={() => setShowBuilder(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Test Rule
          </button>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {rule.status}
                  </span>
                  <button
                    onClick={() => editRule(rule)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Mappings:</span> 
                  {rule.mappings.map((m, i) => (
                    <span key={i} className="ml-2">"{m.from}" → "{m.to}"</span>
                  ))}
                </div>
                <div>
                  <span className="font-medium">Forms:</span> 
                  {rule.selectedForms.map(f => f.name).join(', ') || 'None'}
                </div>
                <div>
                  <span className="font-medium">Translations:</span> 
                  {rule.selectedTranslations.map(t => t.name).join(', ') || 'None'}
                </div>
                <div>
                  <span className="font-medium">Available Metadata Keys:</span> 
                  <span className="ml-2">{rule.availableMetadataKeys.join(', ') || 'None'}</span>
                </div>
                <div>
                  <span className="font-medium">Selected Tags for Migration:</span> 
                  <span className="ml-2 text-green-700">{rule.selectedTagsForMigration.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>
          ))}
          
          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No rules found. Create a test rule to verify Step 2 functionality.
            </div>
          )}
        </div>

        {/* Enhanced Builder Modal */}
        {showBuilder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingRule ? 'Edit' : 'Create'} Test Rule - WITH STEP 2
                </h2>
                <button
                  onClick={resetBuilder}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* LEFT: Word Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rule Name</label>
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rule name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Search Words</label>
                    <input
                      type="text"
                      value={wordSearchTerm}
                      onChange={(e) => setWordSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search for Italian words..."
                    />
                    {isSearching && <div className="text-sm text-blue-600 mt-1">Searching...</div>}
                  </div>

                  {wordSearchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded">
                      {wordSearchResults.map((word) => (
                        <div key={word.wordId} className="border-b border-gray-100 p-3">
                          <div className="font-medium text-gray-900 mb-2">
                            {word.italian} <span className="text-sm text-gray-500">({word.wordType})</span>
                            <button
                              onClick={() => selectDictionaryWord(word)}
                              className={`ml-3 px-2 py-1 text-xs rounded ${
                                selectedDictionaryWords.find(d => d.id === word.wordId)
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Select Dictionary Word
                            </button>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="text-sm font-medium text-blue-700">Forms:</div>
                            {word.forms.map((form) => (
                              <button
                                key={form.id}
                                onClick={() => selectForm(word, form)}
                                className={`mr-2 mb-1 px-2 py-1 text-xs rounded ${
                                  selectedForms.find(f => f.id === form.id)
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {form.form_text}
                              </button>
                            ))}
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="text-sm font-medium text-purple-700">Translations:</div>
                            {word.translations.map((translation) => (
                              <button
                                key={translation.id}
                                onClick={() => selectTranslation(word, translation)}
                                className={`mr-2 mb-1 px-2 py-1 text-xs rounded ${
                                  selectedTranslations.find(t => t.id === translation.id)
                                    ? 'bg-purple-200 text-purple-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {translation.translation}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Step 2 Configuration */}
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900">
                      STEP 2: NEW UNIFIED METADATA SCHEMA (Story 002.003.1)
                      {editingRule && <span className="text-xs font-normal">(Live database query)</span>}
                    </h3>
                    <div className="text-sm text-yellow-800 mt-1">
                      {availableFormTags.length === 0 && availableTranslationKeys.length === 0 && availableDictionaryKeys.length === 0 ? (
                        <div>Select dictionary words, forms, or translations to see new metadata structure (metadata jsonb + optional_tags text[])</div>
                      ) : (
                        <div className="space-y-3">
                          {/* Form Tags Section */}
                          {availableFormTags.length > 0 && (
                            <div>
                              <div className="font-medium text-blue-900 mb-1">
                                📝 Form Metadata & Tags ({availableFormTags.length}) - NEW UNIFIED SCHEMA:
                              </div>
                              <div className="text-xs text-blue-700 mb-2 italic">
                                metadata.* = structured grammatical properties (tense, person, etc.) | others = optional descriptive tags
                              </div>
                              <div className="space-y-1">
                                {availableFormTags.map((tag) => (
                                  <label key={`form-${tag}`} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedTagsForMigration.includes(tag)}
                                      onChange={() => toggleMetadataTag(tag)}
                                      className="rounded"
                                    />
                                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded border-blue-300">
                                      {tag}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Translation Keys Section */}
                          {availableTranslationKeys.length > 0 && (
                            <div>
                              <div className="font-medium text-purple-900 mb-1">
                                🔤 Translation Metadata & Tags ({availableTranslationKeys.length}) - NEW UNIFIED SCHEMA:
                              </div>
                              <div className="text-xs text-purple-700 mb-2 italic">
                                metadata.* = structured functional properties (register, auxiliary, etc.) | others = optional descriptive tags
                              </div>
                              <div className="space-y-1">
                                {availableTranslationKeys.map((key) => (
                                  <label key={`trans-${key}`} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedTagsForMigration.includes(key)}
                                      onChange={() => toggleMetadataTag(key)}
                                      className="rounded"
                                    />
                                    <span className="font-mono text-sm bg-purple-100 px-2 py-1 rounded border-purple-300">
                                      {key}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dictionary Keys Section */}
                          {availableDictionaryKeys.length > 0 && (
                            <div>
                              <div className="font-medium text-green-900 mb-1">
                                📖 Dictionary Metadata & Tags ({availableDictionaryKeys.length}) - NEW UNIFIED SCHEMA:
                              </div>
                              <div className="text-xs text-green-700 mb-2 italic">
                                metadata.* = word-level properties (conjugation_type, auxiliary, word_type, etc.) | others = optional descriptive tags
                              </div>
                              <div className="space-y-1">
                                {availableDictionaryKeys.map((key) => (
                                  <label key={`dict-${key}`} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedTagsForMigration.includes(key)}
                                      onChange={() => toggleMetadataTag(key)}
                                      className="rounded"
                                    />
                                    <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded border-green-300">
                                      {key}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-yellow-300">
                            <div className="text-xs text-yellow-700">
                              <strong>Total selected:</strong> {selectedTagsForMigration.length} migration targets
                              {editingRule && <span className="text-green-700"> (showing current database state)</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Mappings</label>
                      <button
                        onClick={addMapping}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Add Mapping
                      </button>
                    </div>
                    <div className="space-y-2">
                      {mappings.map((mapping, index) => (
                        <div key={index} className="flex space-x-2 items-center">
                          <input
                            type="text"
                            value={mapping.from}
                            onChange={(e) => updateMapping(index, 'from', e.target.value)}
                            placeholder="From..."
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                          <span>→</span>
                          <input
                            type="text"
                            value={mapping.to}
                            onChange={(e) => updateMapping(index, 'to', e.target.value)}
                            placeholder="To..."
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => removeMapping(index)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Selected Items Summary:</div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div><strong>Dictionary Words:</strong> {selectedDictionaryWords.length} selected</div>
                      <div><strong>Forms:</strong> {selectedForms.length} selected</div>
                      <div><strong>Translations:</strong> {selectedTranslations.length} selected</div>
                      <div><strong>Tags for Migration:</strong> {selectedTagsForMigration.length} selected</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={resetBuilder}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRule}
                  disabled={!ruleName.trim() || mappings.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}