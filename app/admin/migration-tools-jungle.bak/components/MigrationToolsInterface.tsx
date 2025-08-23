'use client';

import { useState, useCallback } from 'react';
import { ValidationService } from '../services/ValidationService';
import AuditTab from './tabs/AuditTab';
import MigrationTab from './tabs/MigrationTab';
import ProgressTab from './tabs/ProgressTab';

// Types for simplified state management (collaborative decision: 8 grouped useState)
type StepType = 'config' | 'words' | 'forms' | 'translations' | 'tags' | 'mappings' | 'preview' | 'execute';
type OperationType = 'replace' | 'add' | 'remove';

interface WordSearchResult {
  wordId: string;
  italian: string;
  wordType: string;
  tags: string[];
  formsCount: number;
  translationsCount: number;
}

interface MappingPair {
  id: string;
  from: string;
  to: string;
}

// Simplified MigrationToolsInterface - 8 grouped useState (down from 72)
export default function MigrationToolsInterface() {
  // 1. Workflow State
  const [workflowState, setWorkflowState] = useState({
    currentStep: 'config' as StepType,
    operationType: 'replace' as OperationType
  });

  // 2. Table Selection State  
  const [tableState, setTableState] = useState({
    selectedTable: 'word_forms',
    selectedColumn: 'metadata' // Changed default to metadata (Story 2.3.1)
  });

  // 3. Record Selection State
  const [recordState, setRecordState] = useState({
    selectedWords: [] as WordSearchResult[],
    selectedFormIds: [] as string[],
    selectedTranslationIds: [] as string[]
  });

  // 4. Metadata State (Step 2 Fix)
  const [metadataState, setMetadataState] = useState({
    availableMandatory: [] as string[],
    availableOptional: [] as string[],
    selectedTags: [] as string[],
    isLoading: false,
    error: null as string | null
  });

  // 5. Rule Configuration State
  const [ruleState, setRuleState] = useState({
    mappings: [] as MappingPair[],
    tagsToAdd: [] as string[],
    tagsToRemove: [] as string[],
    newTagToAdd: ''
  });

  // 6. Preview & Execution State
  const [executionState, setExecutionState] = useState({
    previewData: [] as any[],
    isExecuting: false,
    progress: 0,
    results: null as any
  });

  // 7. Debug & Logging State
  const [debugState, setDebugState] = useState({
    logs: [] as string[],
    isExpanded: true
  });

  // 8. Rule Management State
  const [ruleManagementState, setRuleManagementState] = useState({
    savedRules: [] as any[],
    selectedRule: null as any,
    showSaveModal: false
  });

  // Helper functions for state updates (simplified approach)
  const updateWorkflowState = useCallback((updates: Partial<typeof workflowState>) => {
    setWorkflowState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateTableState = useCallback((updates: Partial<typeof tableState>) => {
    setTableState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateRecordState = useCallback((updates: Partial<typeof recordState>) => {
    setRecordState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateMetadataState = useCallback((updates: Partial<typeof metadataState>) => {
    setMetadataState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateRuleState = useCallback((updates: Partial<typeof ruleState>) => {
    setRuleState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateExecutionState = useCallback((updates: Partial<typeof executionState>) => {
    setExecutionState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateDebugState = useCallback((updates: Partial<typeof debugState>) => {
    setDebugState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateRuleManagementState = useCallback((updates: Partial<typeof ruleManagementState>) => {
    setRuleManagementState(prev => ({ ...prev, ...updates }));
  }, []);

  // Debug logging
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    updateDebugState({
      logs: [...debugState.logs, `[${timestamp}] ${message}`]
    });
  }, [debugState.logs, updateDebugState]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'audit' | 'migration' | 'progress'>('migration');

  const tabs = [
    { id: 'audit' as const, name: 'Tag Audit', icon: '📊', description: 'Database analysis' },
    { id: 'migration' as const, name: 'Migration Rules', icon: '🔧', description: 'Create and execute rules' },
    { id: 'progress' as const, name: 'Execution History', icon: '📈', description: 'View migration history' }
  ];

  // Get selected record IDs for Step 2
  const getSelectedRecordIds = useCallback((): string[] => {
    const { selectedTable } = tableState;
    const { selectedWords, selectedFormIds, selectedTranslationIds } = recordState;

    switch (selectedTable) {
      case 'dictionary':
        return selectedWords.map(w => w.wordId);
      case 'word_forms':
        return selectedFormIds;
      case 'word_translations':
        return selectedTranslationIds;
      case 'form_translations':
        return selectedTranslationIds; // Form translations use translation IDs
      default:
        return [];
    }
  }, [tableState, recordState]);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Migration Tools - Rebuilt</h2>
            <p className="text-sm text-gray-600 mt-1">
              Simplified architecture with Story 2.3.1 unified metadata support
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-1 rounded bg-green-100 text-green-800">
              72→8 useState hooks
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
              Step 2 Fixed
            </span>
            <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
              Auto-loading
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'audit' && (
          <AuditTab
            debugState={debugState}
            updateDebugState={updateDebugState}
          />
        )}

        {activeTab === 'migration' && (
          <MigrationTab
            workflowState={workflowState}
            tableState={tableState}
            recordState={recordState}
            metadataState={metadataState}
            ruleState={ruleState}
            executionState={executionState}
            debugState={debugState}
            updateWorkflowState={updateWorkflowState}
            updateTableState={updateTableState}
            updateRecordState={updateRecordState}
            updateMetadataState={updateMetadataState}
            updateRuleState={updateRuleState}
            updateExecutionState={updateExecutionState}
            updateDebugState={updateDebugState}
            getSelectedRecordIds={getSelectedRecordIds}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            executionState={executionState}
            debugState={debugState}
            updateExecutionState={updateExecutionState}
            updateDebugState={updateDebugState}
          />
        )}
      </div>

      {/* Debug Console */}
      {debugState.isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Debug Console</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateDebugState({ logs: [] })}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Clear
                </button>
                <button
                  onClick={() => updateDebugState({ isExpanded: false })}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
              {debugState.logs.length === 0 ? (
                <div className="text-gray-500">No debug logs yet...</div>
              ) : (
                debugState.logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!debugState.isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-2">
          <button
            onClick={() => updateDebugState({ isExpanded: true })}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Show Debug Console ({debugState.logs.length} logs)
          </button>
        </div>
      )}
    </div>
  );
}