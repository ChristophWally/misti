'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/DatabaseService';
import Step2MetadataLoader from '../shared/Step2MetadataLoader';

interface MigrationTabProps {
  workflowState: any;
  tableState: any;
  recordState: any;
  metadataState: any;
  ruleState: any;
  executionState: any;
  debugState: any;
  updateWorkflowState: (updates: any) => void;
  updateTableState: (updates: any) => void;
  updateRecordState: (updates: any) => void;
  updateMetadataState: (updates: any) => void;
  updateRuleState: (updates: any) => void;
  updateExecutionState: (updates: any) => void;
  updateDebugState: (updates: any) => void;
  getSelectedRecordIds: () => string[];
}

export default function MigrationTab({
  workflowState,
  tableState,
  recordState,
  metadataState,
  ruleState,
  executionState,
  debugState,
  updateWorkflowState,
  updateTableState,
  updateRecordState,
  updateMetadataState,
  updateRuleState,
  updateExecutionState,
  updateDebugState,
  getSelectedRecordIds
}: MigrationTabProps) {
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [wordSearchResults, setWordSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    updateDebugState({
      logs: [...debugState.logs, `[${timestamp}] ${message}`]
    });
  };

  // Word search functionality
  const searchWords = async () => {
    if (wordSearchTerm.trim().length < 3) return;
    
    setIsSearching(true);
    addDebugLog(`🔍 Searching for words: ${wordSearchTerm}`);
    
    try {
      const databaseService = new DatabaseService();
      // Mock search for now - replace with actual implementation
      const results = [
        {
          wordId: '1',
          italian: wordSearchTerm,
          wordType: 'verb',
          formsCount: 12,
          translationsCount: 8
        }
      ];
      
      setWordSearchResults(results);
      addDebugLog(`✅ Found ${results.length} words`);
    } catch (error) {
      addDebugLog(`❌ Search failed: ${error}`);
    } finally {
      setIsSearching(false);
    }
  };

  const steps = [
    { id: 'config', name: 'Configuration', icon: '⚙️' },
    { id: 'words', name: 'Word Selection', icon: '🔍' },
    { id: 'forms', name: 'Forms & Translations', icon: '📝' },
    { id: 'tags', name: 'Metadata & Tags', icon: '🏷️' },
    { id: 'mappings', name: 'Mapping Rules', icon: '🔄' },
    { id: 'preview', name: 'Preview Changes', icon: '👁️' },
    { id: 'execute', name: 'Execute Migration', icon: '▶️' }
  ];

  return (
    <div className="space-y-6">
      {/* Step Progress Indicator */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Migration Workflow</h2>
          <div className="text-sm text-gray-600">
            Step: <span className="font-medium">{workflowState.currentStep}</span> | 
            Operation: <span className="font-medium">{workflowState.operationType}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => updateWorkflowState({ currentStep: step.id })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  workflowState.currentStep === step.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{step.icon}</span>
                {step.name}
              </button>
              {index < steps.length - 1 && (
                <div className="mx-2 text-gray-300">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border rounded-lg p-6">
        {workflowState.currentStep === 'config' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Step 1: Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Table</label>
                <select
                  value={tableState.selectedTable}
                  onChange={(e) => updateTableState({ selectedTable: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dictionary">Dictionary</option>
                  <option value="word_forms">Word Forms</option>
                  <option value="word_translations">Word Translations</option>
                  <option value="form_translations">Form Translations</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Column</label>
                <select
                  value={tableState.selectedColumn}
                  onChange={(e) => updateTableState({ selectedColumn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="metadata">metadata (JSONB)</option>
                  <option value="optional_tags">optional_tags (text[])</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operation Type</label>
              <div className="flex space-x-4">
                {['replace', 'add', 'remove'].map((op) => (
                  <label key={op} className="flex items-center">
                    <input
                      type="radio"
                      name="operation"
                      value={op}
                      checked={workflowState.operationType === op}
                      onChange={(e) => updateWorkflowState({ operationType: e.target.value })}
                      className="mr-2"
                    />
                    {op.charAt(0).toUpperCase() + op.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {workflowState.currentStep === 'words' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Step 2: Word Selection</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Italian Words</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={wordSearchTerm}
                  onChange={(e) => setWordSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchWords()}
                  placeholder="Search for Italian words..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={searchWords}
                  disabled={isSearching || wordSearchTerm.trim().length < 3}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSearching ? '🔍' : 'Search'}
                </button>
              </div>
            </div>

            {wordSearchResults.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Search Results</h4>
                <div className="space-y-3">
                  {wordSearchResults.map((word) => (
                    <div key={word.wordId} className="p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{word.italian}</span>
                          <span className="ml-2 text-sm text-gray-500">({word.wordType})</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {word.formsCount} forms, {word.translationsCount} translations
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {workflowState.currentStep === 'tags' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Step 3: Metadata & Tags (Step 2 Auto-Loading)</h3>
            
            <Step2MetadataLoader
              selectedRecordIds={getSelectedRecordIds()}
              selectedTable={tableState.selectedTable}
              metadataState={metadataState}
              updateMetadataState={updateMetadataState}
              addDebugLog={addDebugLog}
            />
          </div>
        )}

        {workflowState.currentStep === 'mappings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Step 4: Mapping Rules</h3>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Define from → to mappings for selected tags</p>
              <button
                onClick={() => updateRuleState({ 
                  mappings: [...ruleState.mappings, { id: Date.now().toString(), from: '', to: '' }]
                })}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Add Mapping
              </button>
            </div>

            <div className="space-y-2">
              {ruleState.mappings.map((mapping: any, index: number) => (
                <div key={mapping.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="From..."
                    value={mapping.from}
                    onChange={(e) => {
                      const newMappings = [...ruleState.mappings];
                      newMappings[index] = { ...mapping, from: e.target.value };
                      updateRuleState({ mappings: newMappings });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <span className="text-gray-400">→</span>
                  <input
                    type="text"
                    placeholder="To..."
                    value={mapping.to}
                    onChange={(e) => {
                      const newMappings = [...ruleState.mappings];
                      newMappings[index] = { ...mapping, to: e.target.value };
                      updateRuleState({ mappings: newMappings });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => {
                      const newMappings = ruleState.mappings.filter((_: any, i: number) => i !== index);
                      updateRuleState({ mappings: newMappings });
                    }}
                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other steps placeholder */}
        {!['config', 'words', 'tags', 'mappings'].includes(workflowState.currentStep) && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🚧</div>
            <h3 className="font-medium">Step: {workflowState.currentStep}</h3>
            <p className="text-sm">Implementation in progress</p>
          </div>
        )}
      </div>

      {/* Quick Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Current Selection Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-blue-800">
          <div>Table: <span className="font-medium">{tableState.selectedTable}</span></div>
          <div>Column: <span className="font-medium">{tableState.selectedColumn}</span></div>
          <div>Operation: <span className="font-medium">{workflowState.operationType}</span></div>
          <div>Selected Records: <span className="font-medium">{getSelectedRecordIds().length}</span></div>
        </div>
      </div>
    </div>
  );
}