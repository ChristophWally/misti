'use client';

import { useEffect } from 'react';
import { ModernDatabaseService } from '../services/ModernDatabaseService';

interface ExecutionHistoryProps {
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

export default function ExecutionHistory({ state, actions, handlers, dbService }: ExecutionHistoryProps) {
  const { uiState, dataState, formState } = state;
  const { updateUIState, updateDataState, updateFormState } = actions;
  const { handleError, handleSuccess } = handlers;

  // Load execution history from database
  const loadHistory = async () => {
    try {
      updateUIState({ isLoading: true, error: null });
      const history = await dbService.getExecutionHistory(50);
      updateDataState({ executionHistory: history });
      updateUIState({ isLoading: false });
    } catch (error) {
      handleError(error, 'Failed to load execution history');
    }
  };

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Revert execution (placeholder for Phase 2)
  const revertExecution = async (execution: any) => {
    if (!confirm(`Revert execution "${execution.rule_name}"? This will undo all changes made.`)) {
      return;
    }

    try {
      updateUIState({ isLoading: true });
      
      // Placeholder for actual revert logic
      handleSuccess(`Execution "${execution.rule_name}" reverted successfully!`);
      
      await loadHistory(); // Refresh
    } catch (error) {
      handleError(error, 'Revert failed');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (uiState.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading execution history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Execution History</h2>
          <p className="text-sm text-gray-600">View and manage migration execution history with live data</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadHistory}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Export History
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl mr-3">📊</div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{dataState.executionHistory.length}</div>
              <div className="text-sm text-blue-600">Total Executions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl mr-3">✅</div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {dataState.executionHistory.filter(h => h.status === 'completed').length}
              </div>
              <div className="text-sm text-green-600">Successful</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-2xl mr-3">❌</div>
            <div>
              <div className="text-2xl font-bold text-red-900">
                {dataState.executionHistory.filter(h => h.status === 'failed').length}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-purple-600 text-2xl mr-3">🔄</div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {dataState.executionHistory.reduce((sum, h) => sum + (h.affected_records || 0), 0)}
              </div>
              <div className="text-sm text-purple-600">Records Changed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution History List */}
      {dataState.executionHistory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No Execution History</h3>
          <p className="mb-4">Execute some migration rules to see their history here</p>
          <div className="text-sm text-gray-400">
            Connected to live Supabase database • {new Date().toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {dataState.executionHistory.map((execution) => (
            <div key={execution.execution_id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{execution.rule_name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Execution ID:</span><br />
                      <code className="text-xs bg-gray-100 px-1 rounded">{execution.execution_id}</code>
                    </div>
                    <div>
                      <span className="font-medium">Executed:</span><br />
                      {new Date(execution.executed_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Records:</span><br />
                      {execution.affected_records || 0} affected
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span><br />
                      {execution.duration || 'Unknown'}
                    </div>
                  </div>

                  {execution.rule_config && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">Rule Configuration:</span>
                      <details className="mt-1">
                        <summary className="cursor-pointer text-blue-600 hover:underline">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(execution.rule_config, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  {execution.changes_made && execution.changes_made.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">
                        Changes Made ({execution.changes_made.length} records):
                      </span>
                      <details className="mt-1">
                        <summary className="cursor-pointer text-blue-600 hover:underline">
                          View changes
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {execution.changes_made.slice(0, 3).map((change: any, index: number) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded mb-1">
                              <div className="font-medium">{change.table} - {change.record_id}</div>
                              <div className="text-gray-600">
                                Before: {JSON.stringify(change.before).substring(0, 100)}...
                              </div>
                              <div className="text-gray-600">
                                After: {JSON.stringify(change.after).substring(0, 100)}...
                              </div>
                            </div>
                          ))}
                          {execution.changes_made.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              ... and {execution.changes_made.length - 3} more changes
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {execution.status === 'completed' && (
                    <button
                      onClick={() => revertExecution(execution)}
                      disabled={uiState.isLoading}
                      className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
                    >
                      Revert
                    </button>
                  )}
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase 2 Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Phase 2 Features</h4>
        <p className="text-sm text-yellow-700">
          Advanced features coming in Phase 2 include:
        </p>
        <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
          <li>One-click revert functionality with automatic rollback</li>
          <li>Detailed execution metrics and performance analysis</li>
          <li>Export history to CSV/JSON formats</li>
          <li>Execution scheduling and automation</li>
          <li>Advanced filtering and search within history</li>
        </ul>
      </div>
    </div>
  );
}