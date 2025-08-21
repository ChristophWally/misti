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
  forms: { id: string; form_text: string; tags?: string[] }[];
  translations: { id: string; translation: string; context_metadata?: any }[];
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
  const [availableMetadataKeys, setAvailableMetadataKeys] = useState<string[]>([]);
  const [selectedTagsForMigration, setSelectedTagsForMigration] = useState<string[]>([]);

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

  // Load Step 2 metadata when forms/translations change (same behavior for create AND edit)
  useEffect(() => {
    console.log('🔄 Step 2 useEffect triggered (create AND edit mode):', { 
      formCount: selectedForms.length, 
      translationCount: selectedTranslations.length,
      currentKeys: availableMetadataKeys.length,
      editingMode: !!editingRule
    });
    
    if (selectedForms.length > 0 || selectedTranslations.length > 0) {
      console.log('📊 Re-querying current metadata from database...');
      loadAvailableMetadata();
    } else {
      console.log('🧹 Clearing metadata - no items selected');
      setAvailableMetadataKeys([]);
      setSelectedTagsForMigration([]);
    }
  }, [selectedForms, selectedTranslations]);

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

      // Get forms for these words (using tags, not context_metadata)
      const { data: formsData, error: formsError } = await supabase
        .from('word_forms')
        .select('id, word_id, form_text, tags')
        .in('word_id', wordIds);

      // Get translations for these words  
      const { data: translationsData, error: translationsError } = await supabase
        .from('word_translations')
        .select('id, word_id, translation, context_metadata')
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
    console.log('📊 STARTING metadata loading for:', { 
      selectedFormIds: selectedForms.map(f => f.id),
      selectedTranslationIds: selectedTranslations.map(t => t.id)
    });
    
    const metadataKeys = new Set<string>();

    // Extract metadata from selected forms (using tags array, not context_metadata)
    if (selectedForms.length > 0) {
      try {
        console.log('🔍 Fetching form tags...');
        const { data: formsData, error: formsError } = await supabase
          .from('word_forms')
          .select('id, tags')
          .in('id', selectedForms.map(f => f.id));

        if (formsError) throw formsError;
        console.log('📝 Forms data received:', formsData);
        
        formsData?.forEach(form => {
          console.log('📝 Processing form:', form.id, form.tags);
          if (form.tags && Array.isArray(form.tags)) {
            form.tags.forEach(tag => {
              console.log('🏷️ Adding form tag:', tag);
              metadataKeys.add(tag);
            });
          }
        });
      } catch (error) {
        console.error('❌ Failed to load form tags:', error);
      }
    }

    // Extract metadata from selected translations
    if (selectedTranslations.length > 0) {
      try {
        console.log('🔍 Fetching translation metadata...');
        const { data: translationsData, error: translationsError } = await supabase
          .from('word_translations')
          .select('id, context_metadata')
          .in('id', selectedTranslations.map(t => t.id));

        if (translationsError) throw translationsError;
        console.log('🔤 Translations data received:', translationsData);
        
        translationsData?.forEach(translation => {
          console.log('🔤 Processing translation:', translation.id, translation.context_metadata);
          if (translation.context_metadata && typeof translation.context_metadata === 'object') {
            Object.keys(translation.context_metadata).forEach(key => {
              console.log('🏷️ Adding translation metadata key:', key);
              metadataKeys.add(key);
            });
          }
        });
      } catch (error) {
        console.error('❌ Failed to load translation metadata:', error);
      }
    }

    const keys = Array.from(metadataKeys).sort();
    console.log('🎯 SETTING metadata keys:', keys);
    setAvailableMetadataKeys(keys);
    
    // In edit mode, preserve previously selected tags that are still available
    if (editingRule) {
      const stillAvailableTags = selectedTagsForMigration.filter(tag => keys.includes(tag));
      if (stillAvailableTags.length !== selectedTagsForMigration.length) {
        console.log('🔄 Some tags no longer available, filtering:', {
          previous: selectedTagsForMigration,
          stillAvailable: stillAvailableTags
        });
        setSelectedTagsForMigration(stillAvailableTags);
      }
    }
    
    console.log('✅ Metadata loading COMPLETED. Keys set:', keys);
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
    setAvailableMetadataKeys([]);
    setSelectedTagsForMigration([]);
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
            Enhanced Migration Test - WITH STEP 2 METADATA LOADING
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
                          <div className="font-medium text-gray-900">
                            {word.italian} <span className="text-sm text-gray-500">({word.wordType})</span>
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
                      STEP 2: Available Metadata Keys 
                      {editingRule && <span className="text-xs font-normal">(Re-queried from database)</span>}
                    </h3>
                    <div className="text-sm text-yellow-800 mt-1">
                      {availableMetadataKeys.length === 0 ? (
                        <div>Select forms or translations to see available metadata keys</div>
                      ) : (
                        <div>
                          <div className="mb-2">
                            Found {availableMetadataKeys.length} metadata keys 
                            {editingRule && <span className="text-green-700"> (current database state)</span>}:
                          </div>
                          <div className="space-y-1">
                            {availableMetadataKeys.map((key) => (
                              <label key={key} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selectedTagsForMigration.includes(key)}
                                  onChange={() => toggleMetadataTag(key)}
                                  className="rounded"
                                />
                                <span className="font-mono text-sm bg-yellow-100 px-2 py-1 rounded">
                                  {key}
                                </span>
                              </label>
                            ))}
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