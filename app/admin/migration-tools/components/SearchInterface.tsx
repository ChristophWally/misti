'use client';

import { useState, useEffect } from 'react';
import { ModernDatabaseService, ModernSelectionCriteria } from '../services/ModernDatabaseService';

interface SearchInterfaceProps {
  state: {
    uiState: { isLoading: boolean; error: string | null; successMessage: string | null };
    dataState: { rules: any[]; searchResults: Record<string, any[]>; executionHistory: any[] };
    formState: { selectedTables: string[]; searchCriteria: any; currentRule: any; showCreateForm?: boolean; showEditForm?: boolean };
  };
  actions: {
    updateUIState: (updates: any) => void;
    updateDataState: (updates: any) => void;
    updateFormState: (updates: any) => void;
  };
  handlers: {
    handleError: (error: any, context: string) => void;
    handleSuccess: (message: string) => void;
  };
  dbService: ModernDatabaseService;
}

export default function SearchInterface({ state, actions, handlers, dbService }: SearchInterfaceProps) {
  const { uiState, dataState, formState } = state;
  const { updateUIState, updateDataState, updateFormState } = actions;
  const { handleError, handleSuccess } = handlers;

  const [availableTags, setAvailableTags] = useState<{
    coreTags: { tag: string; count: number; tables: string[] }[];
    optionalTags: { tag: string; count: number; tables: string[] }[];
    groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]>;
  }>({ coreTags: [], optionalTags: [], groupedCoreTags: {} });
  
  const [selectedTags, setSelectedTags] = useState<{
    coreTags: string[];
    optionalTags: string[];
  }>({ coreTags: [], optionalTags: [] });
  
  const [contentTypes] = useState(['Dictionary Words', 'Conjugated Forms', 'English Translations', 'Form Translations']);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['Dictionary Words', 'Conjugated Forms', 'English Translations', 'Form Translations']);
  
  const [tagSearch, setTagSearch] = useState('');
  const [showTagBrowser, setShowTagBrowser] = useState(true);
  const [searchMode, setSearchMode] = useState<'tag' | 'word'>('tag');
  
  // Table filtering for tags
  const [availableTables] = useState([
    { key: 'dictionary', name: 'Dictionary Words' },
    { key: 'word_forms', name: 'Conjugated Forms' },
    { key: 'word_translations', name: 'English Translations' },
    { key: 'form_translations', name: 'Form Translations' }
  ]);
  const [selectedTagTables, setSelectedTagTables] = useState<string[]>(['dictionary', 'word_forms', 'word_translations', 'form_translations']);
  
  // Hierarchical word search state
  const [wordSearch, setWordSearch] = useState('');
  const [availableWords, setAvailableWords] = useState<any[]>([]);
  const [showWordBrowser, setShowWordBrowser] = useState(true);
  
  // Hierarchical selection state with individual tag selection
  const [hierarchicalSelection, setHierarchicalSelection] = useState<{
    wordHierarchies: Record<string, {
      word: any;
      forms: any[];
      translations: any[];
      formTranslations: any[];
    }>;
    selectedTags: Record<string, {
      recordType: 'word' | 'form' | 'word_translation' | 'form_translation';
      tableName: string;
      selectedMetadataPaths: Set<string>; // metadata keys like "auxiliary", "person" 
      selectedOptionalTags: Set<string>; // optional tag values
      allTagsSelected: boolean; // if entire record's tags are selected
    }>;
    collapsedSections: Record<string, {
      forms: boolean;
      translations: boolean;
      formTranslations: boolean;
    }>;
  }>({
    wordHierarchies: {},
    selectedTags: {},
    collapsedSections: {}
  });
  
  // Record editing state
  const [editingRecord, setEditingRecord] = useState<{
    record: any;
    table: string;
    contentType: string;
  } | null>(null);
  
  // Selected records for bulk operations
  const [selectedRecords, setSelectedRecords] = useState<Record<string, Set<string>>>({});

  // Load all available tags on mount
  const loadAvailableTags = async () => {
    try {
      updateUIState({ isLoading: true, error: null });
      const tags = await dbService.getAllAvailableTags();
      setAvailableTags(tags);
      updateUIState({ isLoading: false });
    } catch (error) {
      handleError(error, 'Failed to load available tags');
    }
  };

  // Load available words
  const loadAvailableWords = async () => {
    try {
      updateUIState({ isLoading: true, error: null });
      const words = await dbService.loadAllDictionaryWords(100);
      setAvailableWords(words);
      updateUIState({ isLoading: false });
    } catch (error) {
      handleError(error, 'Failed to load available words');
    }
  };


  useEffect(() => {
    loadAvailableTags();
    loadAvailableWords();
  }, []);

  // Perform unified tag search
  const performUnifiedSearch = async () => {
    const hasSelectedTags = selectedTags.coreTags.length > 0 || selectedTags.optionalTags.length > 0;
    
    if (!hasSelectedTags) {
      handleError(new Error('Please select at least one tag to search'), 'Search validation');
      return;
    }

    if (selectedContentTypes.length === 0) {
      handleError(new Error('Please select at least one content type'), 'Search validation');
      return;
    }

    try {
      updateUIState({ isLoading: true, error: null });

      const results = await dbService.searchByUnifiedTags({
        coreTags: selectedTags.coreTags,
        optionalTags: selectedTags.optionalTags,
        contentTypes: selectedContentTypes
      });
      
      updateDataState({ searchResults: results });
      
      const totalResults = Object.values(results).reduce((sum, records) => sum + records.length, 0);
      const totalTags = selectedTags.coreTags.length + selectedTags.optionalTags.length;
      
      if (totalResults === 0) {
        handleError(new Error(`No results found for ${totalTags} selected tags`), 'No results');
      } else {
        handleSuccess(`Found ${totalResults} records with ANY of ${totalTags} selected tags`);
      }
      
    } catch (error) {
      handleError(error, 'Search failed');
    }
  };

  // Toggle tag selection
  const toggleTag = (tag: string, type: 'core' | 'optional') => {
    if (type === 'core') {
      setSelectedTags(prev => ({
        ...prev,
        coreTags: prev.coreTags.includes(tag)
          ? prev.coreTags.filter(t => t !== tag)
          : [...prev.coreTags, tag]
      }));
    } else {
      setSelectedTags(prev => ({
        ...prev,
        optionalTags: prev.optionalTags.includes(tag)
          ? prev.optionalTags.filter(t => t !== tag)
          : [...prev.optionalTags, tag]
      }));
    }
  };

  // Toggle content type selection
  const toggleContentType = (contentType: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(contentType)
        ? prev.filter(ct => ct !== contentType)
        : [...prev, contentType]
    );
  };

  // Toggle table selection for tag filtering
  const toggleTagTable = (tableKey: string) => {
    setSelectedTagTables(prev => 
      prev.includes(tableKey)
        ? prev.filter(t => t !== tableKey)
        : [...prev, tableKey]
    );
  };

  // Filter tags based on search and selected tables
  const filteredOptionalTags = availableTags.optionalTags.filter(tag => {
    const matchesSearch = tag.tag.toLowerCase().includes(tagSearch.toLowerCase());
    const matchesTables = tag.tables.some(table => selectedTagTables.includes(table));
    return matchesSearch && matchesTables;
  });

  const filteredGroupedCoreTags = Object.fromEntries(
    Object.entries(availableTags.groupedCoreTags)
      .map(([key, values]: [string, { value: string; count: number; tables: string[] }[]]) => [
        key,
        values.filter(valueData => {
          const matchesSearch = tagSearch === '' || 
            key.toLowerCase().includes(tagSearch.toLowerCase()) ||
            valueData.value.toLowerCase().includes(tagSearch.toLowerCase());
          const matchesTables = valueData.tables.some(table => selectedTagTables.includes(table));
          return matchesSearch && matchesTables;
        })
      ])
      .filter(([_, values]) => values.length > 0)
  ) as Record<string, { value: string; count: number; tables: string[] }[]>;

  // Auto-load hierarchies for all visible words
  const autoLoadHierarchies = async (words: any[]) => {
    const wordsToLoad = words.filter(word => !hierarchicalSelection.wordHierarchies[word.id]);
    
    if (wordsToLoad.length === 0) return;
    
    try {
      const hierarchyPromises = wordsToLoad.map(word => 
        dbService.buildWordHierarchy(word.id).then(hierarchy => ({ wordId: word.id, hierarchy }))
      );
      
      const hierarchyResults = await Promise.all(hierarchyPromises);
      
      setHierarchicalSelection(prev => {
        const newHierarchies = { ...prev.wordHierarchies };
        const newCollapsedSections = { ...prev.collapsedSections };
        
        hierarchyResults.forEach(({ wordId, hierarchy }) => {
          newHierarchies[wordId] = hierarchy;
          // Collapsed by default for cleaner interface
          newCollapsedSections[wordId] = {
            forms: true,
            translations: true,
            formTranslations: true
          };
        });
        
        return {
          ...prev,
          wordHierarchies: newHierarchies,
          collapsedSections: newCollapsedSections
        };
      });
    } catch (error) {
      console.error('Error auto-loading hierarchies:', error);
    }
  };

  // Toggle collapse state for sections
  const toggleSectionCollapse = (wordId: string, section: 'forms' | 'translations' | 'formTranslations') => {
    setHierarchicalSelection(prev => ({
      ...prev,
      collapsedSections: {
        ...prev.collapsedSections,
        [wordId]: {
          ...prev.collapsedSections[wordId],
          [section]: !prev.collapsedSections[wordId]?.[section]
        }
      }
    }));
  };

  // Toggle all tags for a record (select/deselect entire record)
  const toggleAllTagsForRecord = (recordId: string, recordType: 'word' | 'form' | 'word_translation' | 'form_translation', record: any) => {
    const tableName = recordType === 'word' ? 'dictionary' : 
                      recordType === 'form' ? 'word_forms' :
                      recordType === 'word_translation' ? 'word_translations' : 'form_translations';
    
    const isSelected = hierarchicalSelection.selectedTags[recordId]?.allTagsSelected;
    
    if (isSelected) {
      // Deselect all tags for this record
      setHierarchicalSelection(prev => {
        const newSelectedTags = { ...prev.selectedTags };
        delete newSelectedTags[recordId];
        return { ...prev, selectedTags: newSelectedTags };
      });
    } else {
      // Select all tags for this record
      const metadataPaths = record.metadata ? Object.keys(record.metadata) : [];
      const optionalTags = record.optional_tags || [];
      
      setHierarchicalSelection(prev => ({
        ...prev,
        selectedTags: {
          ...prev.selectedTags,
          [recordId]: {
            recordType,
            tableName,
            selectedMetadataPaths: new Set(metadataPaths),
            selectedOptionalTags: new Set(optionalTags),
            allTagsSelected: true
          }
        }
      }));
    }
  };

  // Toggle individual metadata tag
  const toggleMetadataTag = (recordId: string, tagPath: string, recordType: 'word' | 'form' | 'word_translation' | 'form_translation', record: any) => {
    const tableName = recordType === 'word' ? 'dictionary' : 
                      recordType === 'form' ? 'word_forms' :
                      recordType === 'word_translation' ? 'word_translations' : 'form_translations';
    
    setHierarchicalSelection(prev => {
      const existing = prev.selectedTags[recordId] || {
        recordType,
        tableName,
        selectedMetadataPaths: new Set(),
        selectedOptionalTags: new Set(),
        allTagsSelected: false
      };
      
      const newPaths = new Set(existing.selectedMetadataPaths);
      if (newPaths.has(tagPath)) {
        newPaths.delete(tagPath);
      } else {
        newPaths.add(tagPath);
      }
      
      return {
        ...prev,
        selectedTags: {
          ...prev.selectedTags,
          [recordId]: {
            ...existing,
            selectedMetadataPaths: newPaths,
            allTagsSelected: false
          }
        }
      };
    });
  };

  // Toggle individual optional tag
  const toggleOptionalTag = (recordId: string, tagValue: string, recordType: 'word' | 'form' | 'word_translation' | 'form_translation', record: any) => {
    const tableName = recordType === 'word' ? 'dictionary' : 
                      recordType === 'form' ? 'word_forms' :
                      recordType === 'word_translation' ? 'word_translations' : 'form_translations';
    
    setHierarchicalSelection(prev => {
      const existing = prev.selectedTags[recordId] || {
        recordType,
        tableName,
        selectedMetadataPaths: new Set(),
        selectedOptionalTags: new Set(),
        allTagsSelected: false
      };
      
      const newTags = new Set(existing.selectedOptionalTags);
      if (newTags.has(tagValue)) {
        newTags.delete(tagValue);
      } else {
        newTags.add(tagValue);
      }
      
      return {
        ...prev,
        selectedTags: {
          ...prev.selectedTags,
          [recordId]: {
            ...existing,
            selectedOptionalTags: newTags,
            allTagsSelected: false
          }
        }
      };
    });
  };

  // Execute hierarchical word search - build results from selections
  const performHierarchicalWordSearch = async () => {
    const selectedTagsCount = Object.keys(hierarchicalSelection.selectedTags).length;
    
    if (selectedTagsCount === 0) {
      handleError(new Error('No tags selected'), 'Please select tags or records to search');
      return;
    }

    try {
      updateUIState({ isLoading: true, error: null });
      
      const results: Record<string, any[]> = {
        'Dictionary Words': [],
        'Word Forms': [],
        'Word Translations': [],
        'Form Translations': []
      };

      // Process each selected record and its tags
      for (const [recordId, selection] of Object.entries(hierarchicalSelection.selectedTags)) {
        // Find the record data
        let record: any = null;
        let resultCategory = '';
        
        // Find record in hierarchies
        for (const hierarchy of Object.values(hierarchicalSelection.wordHierarchies)) {
          if (hierarchy.word.id === recordId) {
            record = hierarchy.word;
            resultCategory = 'Dictionary Words';
            break;
          }
          
          const form = hierarchy.forms.find(f => f.id === recordId);
          if (form) {
            record = form;
            resultCategory = 'Word Forms';
            break;
          }
          
          const translation = hierarchy.translations.find(t => t.id === recordId);
          if (translation) {
            record = translation;
            resultCategory = 'Word Translations';
            break;
          }
          
          const formTranslation = hierarchy.formTranslations.find(ft => ft.id === recordId);
          if (formTranslation) {
            record = formTranslation;
            resultCategory = 'Form Translations';
            break;
          }
        }
        
        if (record && resultCategory) {
          // Add metadata about selected tags to the record for display
          const recordWithSelection = {
            ...record,
            _selectedMetadataPaths: Array.from(selection.selectedMetadataPaths),
            _selectedOptionalTags: Array.from(selection.selectedOptionalTags),
            _allTagsSelected: selection.allTagsSelected,
            _tableName: selection.tableName
          };
          
          results[resultCategory].push(recordWithSelection);
        }
      }
      
      updateDataState({ searchResults: results });
      
      const totalResults = Object.values(results).reduce((sum, records) => sum + records.length, 0);
      
      if (totalResults === 0) {
        handleError(new Error('No results found for selected tags'), 'No results');
      } else {
        handleSuccess(`Found ${totalResults} records with selected tags across ${selectedTagsCount} selections`);
      }
      
    } catch (error) {
      handleError(error, 'Tag-based search failed');
    }
  };

  // Filter words based on search
  const filteredWords = availableWords.filter(word => 
    word.italian.toLowerCase().includes(wordSearch.toLowerCase()) ||
    (word.english && word.english.toLowerCase().includes(wordSearch.toLowerCase()))
  );

  // Auto-load hierarchies when filtered words change
  useEffect(() => {
    if (filteredWords.length > 0 && showWordBrowser) {
      autoLoadHierarchies(filteredWords);
    }
  }, [filteredWords, showWordBrowser]);

  // Get table name from content type
  const getTableFromContentType = (contentType: string): string => {
    const tableMap: Record<string, string> = {
      'Dictionary Words': 'dictionary',
      'Conjugated Forms': 'word_forms', 
      'English Translations': 'word_translations',
      'Form Translations': 'form_translations'
    };
    return tableMap[contentType] || 'dictionary';
  };

  // Open record for editing
  const openRecordEditor = (record: any, contentType: string) => {
    setEditingRecord({
      record: { ...record },
      table: getTableFromContentType(contentType),
      contentType
    });
  };

  // Toggle record selection
  const toggleRecordSelection = (recordId: string, contentType: string) => {
    setSelectedRecords(prev => {
      const newSelection = { ...prev };
      if (!newSelection[contentType]) {
        newSelection[contentType] = new Set();
      }
      
      if (newSelection[contentType].has(recordId)) {
        newSelection[contentType].delete(recordId);
      } else {
        newSelection[contentType].add(recordId);
      }
      
      return newSelection;
    });
  };

  // Select all records for a content type
  const selectAllRecords = (contentType: string, records: any[]) => {
    setSelectedRecords(prev => ({
      ...prev,
      [contentType]: new Set(records.map(r => r.id))
    }));
  };

  // Clear selected records for a content type
  const clearSelectedRecords = (contentType: string) => {
    setSelectedRecords(prev => {
      const newSelection = { ...prev };
      delete newSelection[contentType];
      return newSelection;
    });
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedTags({ coreTags: [], optionalTags: [] });
    setSelectedContentTypes(['Dictionary Words', 'Conjugated Forms', 'English Translations', 'Form Translations']);
    setSelectedTagTables(['dictionary', 'word_forms', 'word_translations', 'form_translations']);
    setHierarchicalSelection({
      wordHierarchies: {},
      selectedTags: {},
      collapsedSections: {}
    });
    setSelectedRecords({});
    setEditingRecord(null);
    updateDataState({ searchResults: {} });
    setTagSearch('');
    setWordSearch('');
  };

  const hasResults = Object.keys(dataState.searchResults).length > 0;
  const totalResults = Object.values(dataState.searchResults).reduce((sum, records) => sum + records.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Search & Execute</h2>
        <p className="text-sm text-gray-600">Browse and search by tags across all content types with live data</p>
      </div>

      {/* Search Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSearchMode('tag')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              searchMode === 'tag'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏷️ Search by Tag
          </button>
          <button
            onClick={() => setSearchMode('word')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              searchMode === 'word'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📖 Search by Word
          </button>
        </nav>
      </div>

      {/* Search by Tag Interface */}
      {searchMode === 'tag' && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Select Tags to Search</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowTagBrowser(!showTagBrowser)}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              {showTagBrowser ? 'Hide' : 'Show'} Available Tags
            </button>
            <button
              onClick={clearAll}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Static Tag Section Headers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Core Tags - Always Visible */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              📋 Core Tags <span className="text-xs text-gray-500 ml-1">(mandatory fields)</span>
            </h4>
          </div>

          {/* Optional Tags - Always Visible */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              🏷️ Optional Tags <span className="text-xs text-gray-500 ml-1">(supplementary)</span>
            </h4>
          </div>
        </div>

        {/* Tag Browser */}
        {showTagBrowser && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="mb-3 space-y-3">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search available tags..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Table Filter */}
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Filter by Tables:</h5>
                <div className="grid grid-cols-2 gap-2">
                  {availableTables.map((table) => (
                    <label key={table.key} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={selectedTagTables.includes(table.key)}
                        onChange={() => toggleTagTable(table.key)}
                        className="mr-1 scale-75"
                      />
                      <span className="truncate">{table.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {/* Core Tags - Grouped */}
              <div>
                <div className="space-y-2">
                  {Object.entries(filteredGroupedCoreTags).map(([key, values]) => (
                    <div key={key} className="border-l-2 border-blue-200 pl-2">
                      <div className="text-xs font-medium text-blue-700 mb-1">{key}</div>
                      <div className="space-y-1">
                        {values.map((valueData) => {
                          const fullTag = `${key}: ${valueData.value}`;
                          return (
                            <label key={fullTag} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedTags.coreTags.includes(fullTag)}
                                onChange={() => toggleTag(fullTag, 'core')}
                                className="mr-2"
                              />
                              <span className="text-sm flex-1 truncate">{valueData.value}</span>
                              <span className="text-xs text-gray-500 ml-2">({valueData.count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Tags */}
              <div>
                <div className="space-y-1">
                  {filteredOptionalTags.map((tagData) => (
                    <label key={tagData.tag} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.optionalTags.includes(tagData.tag)}
                        onChange={() => toggleTag(tagData.tag, 'optional')}
                        className="mr-2"
                      />
                      <span className="text-sm flex-1 truncate">{tagData.tag}</span>
                      <span className="text-xs text-gray-500 ml-2">({tagData.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Tags Display */}
        <div className="space-y-2">
          {selectedTags.coreTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">📋 Selected Core Tags:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedTags.coreTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                    onClick={() => toggleTag(tag, 'core')}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {selectedTags.optionalTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">🏷️ Selected Optional Tags:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedTags.optionalTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                    onClick={() => toggleTag(tag, 'optional')}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Type Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Content Types to Search:</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {contentTypes.map((contentType) => (
              <label key={contentType} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedContentTypes.includes(contentType)}
                  onChange={() => toggleContentType(contentType)}
                  className="mr-2"
                />
                <span className="text-sm">{contentType}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={performUnifiedSearch}
            disabled={uiState.isLoading || (selectedTags.coreTags.length === 0 && selectedTags.optionalTags.length === 0)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {uiState.isLoading ? '🔄 Searching...' : `🔍 Search (${selectedTags.coreTags.length + selectedTags.optionalTags.length} tags)`}
          </button>
          <button
            onClick={loadAvailableTags}
            disabled={uiState.isLoading}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            🔄 Refresh Tags
          </button>
        </div>
        </div>
      )}

      {/* Search by Word Interface */}
      {searchMode === 'word' && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">Hierarchical Word Search</h3>
              <p className="text-sm text-gray-600">Select records at different levels: Dictionary → Forms → Translations → Form Translations ({availableWords.length} words available)</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowWordBrowser(!showWordBrowser)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                {showWordBrowser ? 'Hide' : 'Show'} Word Hierarchy
              </button>
              <button
                onClick={() => {
                  setHierarchicalSelection({
                    wordHierarchies: {},
                    selectedTags: {},
                    collapsedSections: {}
                  });
                }}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Clear All Selections
              </button>
            </div>
          </div>

          {/* Hierarchical Word Browser */}
          {showWordBrowser && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="mb-4">
                <input
                  type="text"
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  placeholder="Search dictionary words..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {filteredWords.map((word) => {
                    const wordId = word.id; // Use the confirmed ID field
                    
                    if (!wordId) {
                      console.error('Word missing ID:', word);
                      return null; // Skip words without valid IDs
                    }
                    
                    const hierarchy = hierarchicalSelection.wordHierarchies[wordId];
                    const selectedTags = hierarchicalSelection.selectedTags[wordId];
                    const hasAnyTagSelected = selectedTags && (selectedTags.selectedMetadataPaths.size > 0 || selectedTags.selectedOptionalTags.size > 0);
                    const totalTags = (word.metadata ? Object.keys(word.metadata).length : 0) + (word.optional_tags ? word.optional_tags.length : 0);
                    const selectedTagsCount = selectedTags ? selectedTags.selectedMetadataPaths.size + selectedTags.selectedOptionalTags.size : 0;
                    const isWordSelected = selectedTags?.allTagsSelected || false;
                    const collapsed = hierarchicalSelection.collapsedSections[wordId];
                    
                    return (
                      <div key={wordId} className="border border-gray-200 rounded-lg p-3 bg-white">
                        {/* Dictionary Word Level */}
                        <div className="flex items-start space-x-3 mb-2">
                          <input
                            type="checkbox"
                            checked={isWordSelected}
                            ref={input => {
                              if (input) input.indeterminate = hasAnyTagSelected && !isWordSelected;
                            }}
                            onChange={() => toggleAllTagsForRecord(wordId, 'word', word)}
                            className="mt-1 flex-shrink-0"
                            title={hasAnyTagSelected && !isWordSelected ? `${selectedTagsCount}/${totalTags} tags selected` : isWordSelected ? 'All tags selected' : 'No tags selected'}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Dictionary</span>
                              <span className="font-medium">{word.italian}</span>
                              {word.english && <span className="text-gray-500">({word.english})</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {hierarchy ? `${hierarchy.forms.length} forms, ${hierarchy.translations.length} translations` : 'Loading...'}
                            </div>
                            
                            {/* Individual Tag Selection for this word */}
                            <div className="mt-2">
                              {/* Core Metadata Tags */}
                              {word.metadata && Object.keys(word.metadata).length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs text-gray-600 font-medium mb-1">Core Tags:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(word.metadata).map(([key, value]) => {
                                      const isSelected = hierarchicalSelection.selectedTags[wordId]?.selectedMetadataPaths.has(key) || false;
                                      return (
                                        <label key={key} className="flex items-center space-x-1 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleMetadataTag(wordId, key, 'word', word)}
                                            className="w-3 h-3"
                                          />
                                          <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {key}: {value as string}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {/* Optional Tags */}
                              {word.optional_tags && word.optional_tags.length > 0 && (
                                <div>
                                  <div className="text-xs text-gray-600 font-medium mb-1">Optional Tags:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {word.optional_tags.map((tag: string) => {
                                      const isSelected = hierarchicalSelection.selectedTags[wordId]?.selectedOptionalTags.has(tag) || false;
                                      return (
                                        <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleOptionalTag(wordId, tag, 'word', word)}
                                            className="w-3 h-3"
                                          />
                                          <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {tag}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Word Forms Level */}
                        {hierarchy && hierarchy.forms.length > 0 && (
                          <div className="ml-6 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-600 font-medium">Word Forms ({hierarchy.forms.length}):</div>
                              <button
                                onClick={() => toggleSectionCollapse(wordId, 'forms')}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                {collapsed?.forms ? '▼ Show' : '▲ Hide'}
                              </button>
                            </div>
                            {!collapsed?.forms && (
                            <div className="grid grid-cols-1 gap-2">
                              {hierarchy.forms.map((form) => {
                                const isFormSelected = hierarchicalSelection.selectedTags[form.id]?.allTagsSelected || false;
                                return (
                                  <div key={form.id} className="border border-gray-100 rounded p-2">
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isFormSelected}
                                        onChange={() => toggleAllTagsForRecord(form.id, 'form', form)}
                                        className="flex-shrink-0"
                                      />
                                      <span className="px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded">Form</span>
                                      <span className="font-medium">{form.form_text}</span>
                                    </label>
                                    
                                    {/* Individual Tag Selection for this form */}
                                    <div className="mt-1 ml-6">
                                      {/* Core Metadata Tags */}
                                      {form.metadata && Object.keys(form.metadata).length > 0 && (
                                        <div className="mb-1">
                                          <div className="text-xs text-gray-600 font-medium mb-1">Core Tags:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(form.metadata).map(([key, value]) => {
                                              const isSelected = hierarchicalSelection.selectedTags[form.id]?.selectedMetadataPaths.has(key) || false;
                                              return (
                                                <label key={key} className="flex items-center space-x-1 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMetadataTag(form.id, key, 'form', form)}
                                                    className="w-3 h-3"
                                                  />
                                                  <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {key}: {value as string}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Optional Tags */}
                                      {form.optional_tags && form.optional_tags.length > 0 && (
                                        <div>
                                          <div className="text-xs text-gray-600 font-medium mb-1">Optional Tags:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {form.optional_tags.map((tag: string) => {
                                              const isSelected = hierarchicalSelection.selectedTags[form.id]?.selectedOptionalTags.has(tag) || false;
                                              return (
                                                <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleOptionalTag(form.id, tag, 'form', form)}
                                                    className="w-3 h-3"
                                                  />
                                                  <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {tag}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        )}

                        {/* Word Translations Level */}
                        {hierarchy && hierarchy.translations.length > 0 && (
                          <div className="ml-6 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-600 font-medium">Word Translations ({hierarchy.translations.length}):</div>
                              <button
                                onClick={() => toggleSectionCollapse(wordId, 'translations')}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                {collapsed?.translations ? '▼ Show' : '▲ Hide'}
                              </button>
                            </div>
                            {!collapsed?.translations && (
                            <div className="space-y-1">
                              {hierarchy.translations.map((translation) => {
                                const isTranslationSelected = hierarchicalSelection.selectedTags[translation.id]?.allTagsSelected || false;
                                return (
                                  <div key={translation.id} className="border border-gray-100 rounded p-2">
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isTranslationSelected}
                                        onChange={() => toggleAllTagsForRecord(translation.id, 'word_translation', translation)}
                                        className="flex-shrink-0"
                                      />
                                      <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">Translation</span>
                                      <span className="font-medium">{translation.english || translation.translation}</span>
                                    </label>
                                    
                                    {/* Individual Tag Selection for this translation */}
                                    <div className="mt-1 ml-6">
                                      {/* Core Metadata Tags */}
                                      {translation.metadata && Object.keys(translation.metadata).length > 0 && (
                                        <div className="mb-1">
                                          <div className="text-xs text-gray-600 font-medium mb-1">Core Tags:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(translation.metadata).map(([key, value]) => {
                                              const isSelected = hierarchicalSelection.selectedTags[translation.id]?.selectedMetadataPaths.has(key) || false;
                                              return (
                                                <label key={key} className="flex items-center space-x-1 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMetadataTag(translation.id, key, 'word_translation', translation)}
                                                    className="w-3 h-3"
                                                  />
                                                  <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {key}: {value as string}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Optional Tags */}
                                      {translation.optional_tags && translation.optional_tags.length > 0 && (
                                        <div>
                                          <div className="text-xs text-gray-600 font-medium mb-1">Optional Tags:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {translation.optional_tags.map((tag: string) => {
                                              const isSelected = hierarchicalSelection.selectedTags[translation.id]?.selectedOptionalTags.has(tag) || false;
                                              return (
                                                <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleOptionalTag(translation.id, tag, 'word_translation', translation)}
                                                    className="w-3 h-3"
                                                  />
                                                  <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {tag}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        )}

                        {/* Form Translations Level */}
                        {hierarchy && hierarchy.formTranslations.length > 0 && (
                          <div className="ml-6">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-600 font-medium">Form Translations ({hierarchy.formTranslations.length}):</div>
                              <button
                                onClick={() => toggleSectionCollapse(wordId, 'formTranslations')}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                {collapsed?.formTranslations ? '▼ Show' : '▲ Hide'}
                              </button>
                            </div>
                            {!collapsed?.formTranslations && (
                            <div className="space-y-1">
                              {hierarchy.formTranslations.map((formTranslation) => {
                                const isFormTranslationSelected = hierarchicalSelection.selectedTags[formTranslation.id]?.allTagsSelected || false;
                                return (
                                  <div key={formTranslation.id} className="border border-gray-100 rounded p-2">
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isFormTranslationSelected}
                                        onChange={() => toggleAllTagsForRecord(formTranslation.id, 'form_translation', formTranslation)}
                                        className="flex-shrink-0"
                                      />
                                      <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">Form Translation</span>
                                      <span className="font-medium">{formTranslation.translation}</span>
                                    </label>
                                    
                                    {/* Individual Tag Selection for this form translation */}
                                    <div className="mt-1 ml-6">
                                      {/* Core Metadata Tags */}
                                      {formTranslation.metadata && Object.keys(formTranslation.metadata).length > 0 && (
                                        <div className="mb-1">
                                          <div className="text-xs text-gray-600 font-medium mb-1">Core Tags:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(formTranslation.metadata).map(([key, value]) => {
                                              const isSelected = hierarchicalSelection.selectedTags[formTranslation.id]?.selectedMetadataPaths.has(key) || false;
                                              return (
                                                <label key={key} className="flex items-center space-x-1 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMetadataTag(formTranslation.id, key, 'form_translation', formTranslation)}
                                                    className="w-3 h-3"
                                                  />
                                                  <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {key}: {value as string}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Optional Tags */}
                                      {formTranslation.optional_tags && formTranslation.optional_tags.length > 0 && (
                                        <div>
                                          <div className="text-xs text-gray-600 font-medium mb-1">Optional Tags:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {formTranslation.optional_tags.map((tag: string) => {
                                              const isSelected = hierarchicalSelection.selectedTags[formTranslation.id]?.selectedOptionalTags.has(tag) || false;
                                              return (
                                                <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleOptionalTag(formTranslation.id, tag, 'form_translation', formTranslation)}
                                                    className="w-3 h-3"
                                                  />
                                                  <span className={`px-1 py-0.5 text-xs rounded ${isSelected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {tag}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredWords.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {wordSearch ? `No words found matching "${wordSearch}"` : `${availableWords.length === 0 ? 'Loading words...' : 'No words available'}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hierarchical Selection Summary */}
          {Object.keys(hierarchicalSelection.selectedTags).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Tag-Based Selection Summary</h4>
              
              <div className="text-sm text-gray-700 mb-2">
                Selected {Object.keys(hierarchicalSelection.selectedTags).length} records with tag modifications:
              </div>
              
              <div className="space-y-2">
                {Object.entries(hierarchicalSelection.selectedTags).map(([recordId, selection]) => {
                  // Find the record name
                  let recordName = recordId;
                  for (const hierarchy of Object.values(hierarchicalSelection.wordHierarchies)) {
                    if (hierarchy.word.id === recordId) {
                      recordName = `${hierarchy.word.italian} (word)`;
                      break;
                    }
                    const form = hierarchy.forms.find(f => f.id === recordId);
                    if (form) {
                      recordName = `${form.form_text} (form)`;
                      break;
                    }
                    const translation = hierarchy.translations.find(t => t.id === recordId);
                    if (translation) {
                      recordName = `${translation.translation} (translation)`;
                      break;
                    }
                  }
                  
                  return (
                    <div key={recordId} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-700">{recordName}</div>
                      <div className="text-gray-600">
                        {selection.allTagsSelected 
                          ? "All tags selected" 
                          : `${selection.selectedMetadataPaths.size} core + ${selection.selectedOptionalTags.size} optional tags selected`
                        }
                        {!selection.allTagsSelected && selection.selectedMetadataPaths.size > 0 && (
                          <div className="text-xs mt-1">
                            Core: {Array.from(selection.selectedMetadataPaths).join(', ')}
                          </div>
                        )}
                        {!selection.allTagsSelected && selection.selectedOptionalTags.size > 0 && (
                          <div className="text-xs mt-1">
                            Optional: {Array.from(selection.selectedOptionalTags).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={performHierarchicalWordSearch}
              disabled={uiState.isLoading || Object.keys(hierarchicalSelection.selectedTags).length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {uiState.isLoading ? '🔄 Loading...' : `🔍 Search Selected Tags (${Object.keys(hierarchicalSelection.selectedTags).length} selections)`}
            </button>
            <button
              onClick={loadAvailableWords}
              disabled={uiState.isLoading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
            >
              🔄 Refresh Words
            </button>
          </div>
        </div>
      )}


      {/* Search Results (for tag search) */}
      {searchMode === 'tag' && hasResults && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              Search Results ({totalResults} total records with ANY selected tags)
            </h3>
            <div className="text-sm text-gray-500">
              Last search: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Results by Content Type */}
          {Object.entries(dataState.searchResults).map(([contentType, records]) => (
            <div key={contentType} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    {contentType} ({records.length} records)
                  </h4>
                  {records.length > 0 && (
                    <div className="flex space-x-2">
                      {selectedRecords[contentType]?.size > 0 && (
                        <button 
                          onClick={() => clearSelectedRecords(contentType)}
                          className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                          Clear ({selectedRecords[contentType]?.size})
                        </button>
                      )}
                      <button 
                        onClick={() => selectAllRecords(contentType, records)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Select All ({records.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {records.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No matching records found in {contentType}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {records.slice(0, 10).map((record, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Primary Content */}
                              <div className="font-medium text-gray-900 mb-1">
                                {record.italian || record.form_text || record.translation || record.english || `Record ${record.id}`}
                              </div>
                              
                              {/* Secondary Content */}
                              {record.english && record.italian !== record.english && (
                                <div className="text-sm text-gray-600 mb-1">
                                  English: {record.english}
                                </div>
                              )}
                              
                              {/* Core Tags Display */}
                              {record.metadata && Object.keys(record.metadata).length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-blue-700">📋 Core Tags: </span>
                                  <div className="inline-flex flex-wrap gap-1">
                                    {Object.entries(record.metadata).map(([key, value]) => (
                                      <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                        {key}: {value as string}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Optional Tags Display */}
                              {record.optional_tags && record.optional_tags.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-green-700">🏷️ Optional Tags: </span>
                                  <div className="inline-flex flex-wrap gap-1">
                                    {record.optional_tags.map((tag: string) => (
                                      <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => openRecordEditor(record, contentType)}
                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                title="Edit tags for this record"
                              >
                                Edit Tags
                              </button>
                              <input 
                                type="checkbox" 
                                className="mt-1"
                                checked={selectedRecords[contentType]?.has(record.id) || false}
                                onChange={() => toggleRecordSelection(record.id, contentType)}
                                title={`Select ${record.italian || record.form_text || record.translation || record.english}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {records.length > 10 && (
                    <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                      ... and {records.length - 10} more records
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Transformation Actions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Phase 2: Advanced Transformation Features</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Coming next: Selected records will support:
            </p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 mb-3">
              <li>📋 Core tag modifications (metadata JSONB field updates)</li>
              <li>🏷️ Optional tag additions/removals (array operations)</li>
              <li>🔄 Bulk transformations across multiple content types</li>
              <li>💾 Save selections as reusable migration rules</li>
              <li>⚡ One-click execution with audit trail</li>
            </ul>
            <button 
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm cursor-not-allowed"
            >
              Configure Transformation (Phase 2)
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && !uiState.isLoading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium mb-2">Browse and Search by Tags</h3>
          <p className="mb-4">
            Click "Browse Available Tags" to see all 📋 core tags and 🏷️ optional tags in your database
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Connected to live Supabase database • {new Date().toLocaleString()}</div>
            <div>
              Available: {availableTags.coreTags.length} core tags, {availableTags.optionalTags.length} optional tags
            </div>
          </div>
        </div>
      )}

      {/* Record Editing Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Edit Tags</h3>
                <p className="text-sm text-gray-600">
                  {editingRecord.contentType}: {editingRecord.record.italian || editingRecord.record.form_text || editingRecord.record.translation || editingRecord.record.english}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Core Tags (Metadata) Section */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-3">📋 Core Tags (Metadata JSONB)</h4>
                <div className="space-y-2">
                  {editingRecord.record.metadata && Object.entries(editingRecord.record.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-24">{key}:</span>
                      <input 
                        type="text" 
                        defaultValue={value as string}
                        className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm"
                        placeholder="Enter value"
                      />
                      <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="text" 
                      placeholder="New key"
                      className="w-24 px-2 py-1 border border-blue-300 rounded text-sm"
                    />
                    <span>:</span>
                    <input 
                      type="text" 
                      placeholder="New value"
                      className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm"
                    />
                    <button className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Tags Section */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-medium text-green-900 mb-3">🏷️ Optional Tags (Text Array)</h4>
                <div className="space-y-2">
                  {editingRecord.record.optional_tags?.map((tag: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        defaultValue={tag}
                        className="flex-1 px-2 py-1 border border-green-300 rounded text-sm"
                        placeholder="Tag value"
                      />
                      <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="text" 
                      placeholder="New optional tag"
                      className="flex-1 px-2 py-1 border border-green-300 rounded text-sm"
                    />
                    <button className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled
              >
                Save Changes (Phase 2)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}