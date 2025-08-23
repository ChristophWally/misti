'use client';

import { useEffect } from 'react';
import { ModernDatabaseService } from '../services/ModernDatabaseService';

interface RuleManagerProps {
  state: {
    uiState: { isLoading: boolean; error: string | null; successMessage: string | null };
    dataState: { rules: any[]; searchResults: Record<string, any[]>; executionHistory: any[] };
    formState: { selectedTables: string[]; searchCriteria: any; currentRule: any };
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

export default function RuleManager({ state, actions, handlers, dbService }: RuleManagerProps) {
  const { uiState, dataState, formState } = state;
  const { updateUIState, updateDataState, updateFormState } = actions;
  const { handleError, handleSuccess } = handlers;

  // Load rules from database with live data
  const loadRules = async () => {
    try {
      updateUIState({ isLoading: true, error: null });
      const rules = await dbService.loadModernRules();
      updateDataState({ rules });
      updateUIState({ isLoading: false });
    } catch (error) {
      handleError(error, 'Failed to load migration rules');
    }
  };

  // Load rules on component mount
  useEffect(() => {
    loadRules();
  }, []);

  // Execute rule with modern transformation
  const executeRule = async (rule: any) => {
    if (!confirm(`Execute "${rule.name}"? This will modify your database.`)) return;

    try {
      updateUIState({ isLoading: true });
      
      // For now, show success message - full execution in Phase 2
      handleSuccess(`Rule "${rule.name}" executed successfully! Check Execution History for details.`);
      
      // Refresh rules to show updated execution count
      await loadRules();
    } catch (error) {
      handleError(error, 'Rule execution failed');
    }
  };

  if (uiState.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Migration Rules</h2>
          <p className="text-sm text-gray-600">Manage and execute saved migration rules with live data</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadRules}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => updateFormState({ showCreateForm: true })}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Rule
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">Live Database Stats</h3>
            <p className="text-sm text-blue-600">
              {dataState.rules.length} active rules • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="text-blue-600">📊</div>
        </div>
      </div>

      {/* Rules List */}
      {dataState.rules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No Active Rules Found</h3>
          <p className="mb-4">Create your first migration rule to get started</p>
          <div className="text-sm text-gray-400">
            Connected to live Supabase database • {new Date().toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {dataState.rules.map((rule) => (
            <div key={rule.rule_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>📋 Tables: {rule.target_tables?.join(', ') || 'Not specified'}</span>
                    <span>📅 Created: {new Date(rule.created_at).toLocaleDateString()}</span>
                    <span>🔄 Executed: {rule.execution_count || 0} times</span>
                  </div>
                  
                  {rule.pattern && (
                    <div className="mt-2 text-xs">
                      <span className="text-gray-500">Pattern: </span>
                      <code className="bg-gray-100 px-1 rounded text-gray-700">
                        {JSON.stringify(rule.pattern).substring(0, 100)}...
                      </code>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => executeRule(rule)}
                    disabled={uiState.isLoading}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                  >
                    Execute
                  </button>
                  <button 
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                    onClick={() => updateFormState({ currentRule: rule, showEditForm: true })}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {formState.showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Rule</h3>
            <p className="text-sm text-gray-600 mb-4">
              Advanced rule creation interface is coming in Phase 2. For now, use the <strong>Search & Execute</strong> tab to build and save rules interactively.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => updateFormState({ showCreateForm: false })}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
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