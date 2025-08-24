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
  
  // Word search state
  const [wordSearch, setWordSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [wordHierarchy, setWordHierarchy] = useState<{
    word: any;
    forms: any[];
    translations: any[];
    formTranslations: any[];
  } | null>(null);

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

  useEffect(() => {
    loadAvailableTags();
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
      handleSuccess(`Found ${totalResults} records with ANY of ${totalTags} selected tags`);
      
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

  // Filter optional tags based on search
  const filteredOptionalTags = availableTags.optionalTags.filter(tag => 
    tag.tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Search dictionary words
  const searchWords = async () => {
    if (!wordSearch.trim()) {
      handleError(new Error('Please enter a word to search'), 'Word search validation');
      return;
    }

    try {
      updateUIState({ isLoading: true, error: null });
      const words = await dbService.searchDictionaryWords(wordSearch.trim());
      
      if (words.length === 0) {
        handleError(new Error(`No dictionary words found matching "${wordSearch}"`), 'No results');
        updateUIState({ isLoading: false });
        return;
      }

      // Auto-select first word if only one result
      if (words.length === 1) {
        await selectWord(words[0]);
      } else {
        // Store search results for user selection
        updateDataState({ searchResults: { 'Dictionary Words': words } });
        updateUIState({ isLoading: false });
        handleSuccess(`Found ${words.length} dictionary words matching "${wordSearch}"`);
      }
    } catch (error) {
      handleError(error, 'Word search failed');
    }
  };

  // Select a word and build hierarchy
  const selectWord = async (word: any) => {
    try {
      updateUIState({ isLoading: true });
      const hierarchy = await dbService.buildWordHierarchy(word.id);
      setSelectedWord(word);
      setWordHierarchy(hierarchy);
      updateUIState({ isLoading: false });
      handleSuccess(`Loaded hierarchy for "${word.italian}" - ${hierarchy.forms.length} forms, ${hierarchy.translations.length} translations`);
    } catch (error) {
      handleError(error, 'Failed to load word hierarchy');
    }
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedTags({ coreTags: [], optionalTags: [] });
    setSelectedContentTypes(['Dictionary Words', 'Conjugated Forms', 'English Translations', 'Form Translations']);
    updateDataState({ searchResults: {} });
    setTagSearch('');
    setWordSearch('');
    setSelectedWord(null);
    setWordHierarchy(null);
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
            <div className="mb-3">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search available tags..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {/* Core Tags - Grouped */}
              <div>
                <div className="space-y-2">
                  {Object.entries(availableTags.groupedCoreTags)
                    .filter(([key, values]) => 
                      tagSearch === '' || 
                      key.toLowerCase().includes(tagSearch.toLowerCase()) ||
                      values.some(v => v.value.toLowerCase().includes(tagSearch.toLowerCase()))
                    )
                    .map(([key, values]) => (
                    <div key={key} className="border-l-2 border-blue-200 pl-2">
                      <div className="text-xs font-medium text-blue-700 mb-1">{key}</div>
                      <div className="space-y-1">
                        {values
                          .filter(v => tagSearch === '' || v.value.toLowerCase().includes(tagSearch.toLowerCase()))
                          .map((valueData) => {
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
          <div>
            <h3 className="font-medium text-gray-900">Search by Word</h3>
            <p className="text-sm text-gray-600">Find words and modify their specific tags at each level</p>
          </div>
          
          {/* Word Search */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">1. Find Dictionary Word:</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={wordSearch}
                onChange={(e) => setWordSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchWords()}
                placeholder="Search dictionary words..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={searchWords}
                disabled={uiState.isLoading || !wordSearch.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {uiState.isLoading ? '🔄' : 'Search'}
              </button>
            </div>
          </div>
          
          {/* Word Hierarchy Display */}
          {wordHierarchy ? (
            <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">📖 Word Hierarchy</h4>
                <button 
                  onClick={() => {
                    setSelectedWord(null);
                    setWordHierarchy(null);
                    updateDataState({ searchResults: {} });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Clear Selection
                </button>
              </div>

              {/* Dictionary Word Level */}
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                <h5 className="font-medium text-blue-900 mb-2">📚 Dictionary Word</h5>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{wordHierarchy.word.italian}</div>
                    <div className="text-sm text-gray-600">{wordHierarchy.word.english || 'No English translation'}</div>
                    
                    {/* Core Tags */}
                    {wordHierarchy.word.metadata && Object.keys(wordHierarchy.word.metadata).length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-blue-700">📋 Core Tags: </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {Object.entries(wordHierarchy.word.metadata).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              {key}: {value as string}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Optional Tags */}
                    {wordHierarchy.word.optional_tags && wordHierarchy.word.optional_tags.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs font-medium text-green-700">🏷️ Optional Tags: </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {wordHierarchy.word.optional_tags.map((tag: string) => (
                            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                    Edit Tags
                  </button>
                </div>
              </div>

              {/* Word Forms Level */}
              {wordHierarchy.forms.length > 0 && (
                <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                  <h5 className="font-medium text-green-900 mb-2">🔄 Word Forms ({wordHierarchy.forms.length})</h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {wordHierarchy.forms.slice(0, 5).map((form) => (
                      <div key={form.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{form.form_text}</span>
                          {form.metadata && (
                            <span className="ml-2 text-xs text-gray-600">
                              {Object.entries(form.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </span>
                          )}
                        </div>
                        <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors">
                          Edit
                        </button>
                      </div>
                    ))}
                    {wordHierarchy.forms.length > 5 && (
                      <div className="text-xs text-gray-500 text-center">
                        ... and {wordHierarchy.forms.length - 5} more forms
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Translations Level */}
              {wordHierarchy.translations.length > 0 && (
                <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                  <h5 className="font-medium text-purple-900 mb-2">🌐 Translations ({wordHierarchy.translations.length})</h5>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {wordHierarchy.translations.slice(0, 3).map((translation) => (
                      <div key={translation.id} className="flex justify-between items-center text-sm">
                        <span>{translation.english}</span>
                        <button className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                          Edit
                        </button>
                      </div>
                    ))}
                    {wordHierarchy.translations.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        ... and {wordHierarchy.translations.length - 3} more translations
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">📖</div>
                <h4 className="font-medium mb-1">Word Hierarchy</h4>
                <p className="text-sm">
                  Search for dictionary words above to see their forms and translations.<br />
                  Each level allows you to modify specific tags.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dictionary Word Selection (when multiple words found) */}
      {searchMode === 'word' && hasResults && dataState.searchResults['Dictionary Words'] && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              Select Dictionary Word ({dataState.searchResults['Dictionary Words'].length} found)
            </h3>
            <div className="text-sm text-gray-500">
              Search term: "{wordSearch}"
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Dictionary Words</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {dataState.searchResults['Dictionary Words'].map((word, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => selectWord(word)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{word.italian}</div>
                      {word.english && (
                        <div className="text-sm text-gray-600 mb-1">English: {word.english}</div>
                      )}
                      
                      {/* Core Tags Display */}
                      {word.metadata && Object.keys(word.metadata).length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-blue-700">📋 Core Tags: </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {Object.entries(word.metadata).map(([key, value]) => (
                              <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                {key}: {value as string}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Optional Tags Display */}
                      {word.optional_tags && word.optional_tags.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-700">🏷️ Optional Tags: </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {word.optional_tags.map((tag: string) => (
                              <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectWord(word);
                      }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                    <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                      Select All ({records.length})
                    </button>
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
                            
                            <input 
                              type="checkbox" 
                              className="ml-4 mt-1"
                              title={`Select ${record.italian || record.form_text || record.translation || record.english}`}
                            />
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
    </div>
  );
}