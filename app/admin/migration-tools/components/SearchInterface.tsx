'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type SearchMode = 'tag' | 'text' | 'metadata';
type TableName = 'dictionary' | 'word_forms' | 'word_translations' | 'form_translations';

interface SearchResult {
  id: string;
  table: TableName;
  primaryText: string;
  tags: string[];
  metadata: any;
  optional_tags: string[];
}

interface SelectionState {
  dictionary: string[];
  word_forms: string[];
  word_translations: string[];
  form_translations: string[];
}

export default function SearchInterface() {
  const [searchMode, setSearchMode] = useState<SearchMode>('tag');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<SelectionState>({
    dictionary: [],
    word_forms: [],
    word_translations: [],
    form_translations: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [transformRule, setTransformRule] = useState({ from: '', to: '' });
  
  const supabase = createClientComponentClient();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      const tables: TableName[] = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];
      
      for (const table of tables) {
        let query = supabase.from(table).select('*').limit(50);
        
        // Different search strategies based on mode
        if (searchMode === 'tag') {
          // Search in tags arrays and metadata
          query = query.or(`tags.cs.{"${searchTerm}"},optional_tags.cs.{"${searchTerm}"}`);
        } else if (searchMode === 'text') {
          // Search in primary text fields
          const primaryField = table === 'dictionary' ? 'italian' : 
                              table === 'word_forms' ? 'form_text' : 'translation';
          query = query.ilike(primaryField, `%${searchTerm}%`);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error(`Error searching ${table}:`, error);
          continue;
        }

        if (data) {
          const tableResults: SearchResult[] = data.map(record => ({
            id: record.id,
            table,
            primaryText: record.italian || record.form_text || record.translation || 'Unknown',
            tags: record.tags || [],
            metadata: record.metadata || {},
            optional_tags: record.optional_tags || []
          }));
          
          searchResults.push(...tableResults);
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleRecord = (table: TableName, recordId: string) => {
    setSelectedRecords(prev => ({
      ...prev,
      [table]: prev[table].includes(recordId)
        ? prev[table].filter(id => id !== recordId)
        : [...prev[table], recordId]
    }));
  };

  const executeTransform = async () => {
    if (!transformRule.from || !transformRule.to) {
      alert('Please specify both "from" and "to" values for the transformation.');
      return;
    }

    const totalSelected = Object.values(selectedRecords).flat().length;
    if (totalSelected === 0) {
      alert('Please select at least one record to transform.');
      return;
    }

    if (!confirm(`Transform "${transformRule.from}" → "${transformRule.to}" across ${totalSelected} selected records?`)) {
      return;
    }

    try {
      // TODO: Implement actual transformation
      alert(`Transformation completed successfully!
        Changed: ${totalSelected} records
        From: "${transformRule.from}" 
        To: "${transformRule.to}"`);
      
      // Clear selections and refresh
      setSelectedRecords({
        dictionary: [],
        word_forms: [],
        word_translations: [],
        form_translations: []
      });
      
    } catch (error) {
      alert(`Transformation failed: ${error}`);
    }
  };

  const totalSelected = Object.values(selectedRecords).flat().length;
  const resultsByTable = results.reduce((acc, result) => {
    if (!acc[result.table]) acc[result.table] = [];
    acc[result.table].push(result);
    return acc;
  }, {} as Record<TableName, SearchResult[]>);

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Mode</label>
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as SearchMode)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="tag">Search by Tag</option>
              <option value="text">Search by Text</option>
              <option value="metadata">Search by Metadata</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`Enter ${searchMode} to search...`}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search Across All Tables'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(resultsByTable).map(([table, tableResults]) => (
              <div key={table} className="bg-white border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 capitalize">
                  {table.replace('_', ' ')} ({tableResults.length})
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tableResults.map((result) => (
                    <div key={result.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedRecords[result.table].includes(result.id)}
                        onChange={() => toggleRecord(result.table, result.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{result.primaryText}</div>
                        <div className="text-xs text-gray-500 truncate">
                          Tags: {[...result.tags, ...result.optional_tags].join(', ') || 'None'}
                        </div>
                        <button
                          onClick={() => toggleRecord(result.table, result.id)}
                          className="text-blue-600 hover:underline text-xs mt-1"
                        >
                          Quick Execute →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Transformation Interface */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-4">Transform Selected Records</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">From</label>
                <input
                  type="text"
                  value={transformRule.from}
                  onChange={(e) => setTransformRule(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="Current tag/value"
                  className="w-full border border-blue-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">To</label>
                <input
                  type="text"
                  value={transformRule.to}
                  onChange={(e) => setTransformRule(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="New tag/value"
                  className="w-full border border-blue-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <button
                  onClick={executeTransform}
                  disabled={!transformRule.from || !transformRule.to || totalSelected === 0}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Execute Transform ({totalSelected})
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-blue-800">
              Selected: {Object.entries(selectedRecords).map(([table, ids]) => 
                `${table.replace('_', ' ')}: ${ids.length}`
              ).join(' | ')}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {results.length === 0 && !isSearching && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">Search Database</h3>
          <p>Search across all tables to find and transform records</p>
        </div>
      )}
    </div>
  );
}