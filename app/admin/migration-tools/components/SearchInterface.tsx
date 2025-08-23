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

  const [searchMode, setSearchMode] = useState<'metadata' | 'optional_tags'>('metadata');
  const [metadataPath, setMetadataPath] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [availableTables] = useState(['dictionary', 'word_forms', 'word_translations', 'form_translations']);

  // Initialize selected tables
  useEffect(() => {
    if (formState.selectedTables.length === 0) {
      updateFormState({ selectedTables: [...availableTables] });
    }
  }, []);

  // Perform cross-table search with live data
  const performSearch = async () => {
    if (!searchValue.trim()) {
      handleError(new Error('Please enter a search value'), 'Search validation');
      return;
    }

    if (searchMode === 'metadata' && !metadataPath.trim()) {
      handleError(new Error('Please enter a metadata path (e.g., person, tense, mood)'), 'Search validation');
      return;
    }

    try {
      updateUIState({ isLoading: true, error: null });

      const criteria: ModernSelectionCriteria = {
        field: searchMode,
        metadataPath: searchMode === 'metadata' ? metadataPath : undefined,
        value: searchValue,
        selectedTables: formState.selectedTables
      };

      const results = await dbService.searchAcrossTables(criteria);
      
      updateDataState({ searchResults: results });
      updateFormState({ searchCriteria: criteria });
      
      const totalResults = Object.values(results).reduce((sum, records) => sum + records.length, 0);
      handleSuccess(`Found ${totalResults} matching records across ${Object.keys(results).length} tables`);
      
    } catch (error) {
      handleError(error, 'Search failed');
    }
  };

  // Toggle table selection
  const toggleTable = (table: string) => {
    const updated = formState.selectedTables.includes(table)
      ? formState.selectedTables.filter(t => t !== table)
      : [...formState.selectedTables, table];
    
    updateFormState({ selectedTables: updated });
  };

  // Clear search results
  const clearResults = () => {
    updateDataState({ searchResults: {} });
    updateFormState({ searchCriteria: null });
    setSearchValue('');
    setMetadataPath('');
  };

  const hasResults = Object.keys(dataState.searchResults).length > 0;
  const totalResults = Object.values(dataState.searchResults).reduce((sum, records) => sum + records.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Search & Execute</h2>
        <p className="text-sm text-gray-600">Search across multiple tables and execute transformations with live data</p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Search Configuration</h3>
        
        {/* Search Mode */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Search Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="metadata"
                checked={searchMode === 'metadata'}
                onChange={(e) => setSearchMode(e.target.value as 'metadata')}
                className="mr-2"
              />
              <span className="text-sm">Metadata (JSONB)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="optional_tags"
                checked={searchMode === 'optional_tags'}
                onChange={(e) => setSearchMode(e.target.value as 'optional_tags')}
                className="mr-2"
              />
              <span className="text-sm">Optional Tags (Array)</span>
            </label>
          </div>
        </div>

        {/* Metadata Path (only for metadata search) */}
        {searchMode === 'metadata' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Metadata Path
            </label>
            <input
              type="text"
              value={metadataPath}
              onChange={(e) => setMetadataPath(e.target.value)}
              placeholder="e.g., person, tense, mood"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the JSON path within the metadata field (e.g., "person" for metadata.person)
            </p>
          </div>
        )}

        {/* Search Value */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Search Value
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchMode === 'metadata' ? "e.g., first, past, indicative" : "e.g., A1, beginner, common"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Tables to Search ({formState.selectedTables.length} selected)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableTables.map((table) => (
              <label key={table} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formState.selectedTables.includes(table)}
                  onChange={() => toggleTable(table)}
                  className="mr-2"
                />
                <span className="text-sm">{table}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={performSearch}
            disabled={uiState.isLoading || formState.selectedTables.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {uiState.isLoading ? '🔄 Searching...' : '🔍 Search'}
          </button>
          <button
            onClick={clearResults}
            disabled={!hasResults}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Search Results */}
      {hasResults && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              Search Results ({totalResults} total records)
            </h3>
            <div className="text-sm text-gray-500">
              Last search: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Results by Table */}
          {Object.entries(dataState.searchResults).map(([table, records]) => (
            <div key={table} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    {table} ({records.length} records)
                  </h4>
                  {records.length > 0 && (
                    <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                      Select All
                    </button>
                  )}
                </div>
              </div>
              
              {records.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No matching records found in {table}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {records.slice(0, 5).map((record, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            ID: {record.id}
                          </div>
                          {searchMode === 'metadata' && record.metadata && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Metadata:</span> {JSON.stringify(record.metadata)}
                            </div>
                          )}
                          {record.optional_tags && record.optional_tags.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Tags:</span> {record.optional_tags.join(', ')}
                            </div>
                          )}
                          {record.english && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">English:</span> {record.english}
                            </div>
                          )}
                          {record.italian && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Italian:</span> {record.italian}
                            </div>
                          )}
                        </div>
                        <input type="checkbox" className="ml-2" />
                      </div>
                    </div>
                  ))}
                  {records.length > 5 && (
                    <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                      ... and {records.length - 5} more records
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Transformation Actions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Next Steps</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Advanced transformation interface is coming in Phase 2. Selected records will be available for:
            </p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 mb-3">
              <li>Metadata field updates (JSONB operations)</li>
              <li>Optional tags modifications (array operations)</li>
              <li>Bulk transformations across multiple tables</li>
              <li>Rule creation and execution</li>
            </ul>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors">
              Configure Transformation
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && !uiState.isLoading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">Search Database</h3>
          <p className="mb-4">Search across multiple tables using modern metadata and optional_tags fields</p>
          <div className="text-sm text-gray-400">
            Connected to live Supabase database • {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}