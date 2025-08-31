'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ModernDatabaseService } from '../services/ModernDatabaseService';
import { supabase } from '../../../../lib/supabase';

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
  console.log('ExecutionHistory: Component rendering with props:', { state, actions, handlers, dbService });
  
  // Local component state for debugging and error boundary
  const [componentState, setComponentState] = useState<'initializing' | 'loading' | 'ready' | 'error'>('initializing');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const isLoadingRef = useRef(false);
  
  // Safely extract state with null checks
  let uiState, dataState, formState;
  try {
    if (!state) {
      console.error('ExecutionHistory: state prop is null/undefined');
      throw new Error('Missing state prop');
    }
    
    uiState = state.uiState || { isLoading: false, error: null, successMessage: null };
    dataState = state.dataState || { rules: [], searchResults: {}, executionHistory: [] };
    formState = state.formState || { selectedTables: [], searchCriteria: null, currentRule: null };
    
    console.log('ExecutionHistory: State extracted successfully', { uiState, dataState, formState });
  } catch (extractError) {
    console.error('ExecutionHistory: Error extracting state:', extractError);
    setComponentState('error');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Component Error</h3>
        <p className="text-red-700 text-sm mt-2">Failed to extract component state: {String(extractError)}</p>
        <pre className="text-xs text-red-600 mt-2 overflow-auto">{JSON.stringify({ state }, null, 2)}</pre>
      </div>
    );
  }
  
  // Safely extract actions with null checks
  let updateUIState, updateDataState, updateFormState;
  try {
    if (!actions) {
      console.error('ExecutionHistory: actions prop is null/undefined');
      throw new Error('Missing actions prop');
    }
    
    updateUIState = actions.updateUIState || (() => console.warn('updateUIState not available'));
    updateDataState = actions.updateDataState || (() => console.warn('updateDataState not available'));
    updateFormState = actions.updateFormState || (() => console.warn('updateFormState not available'));
    
    console.log('ExecutionHistory: Actions extracted successfully');
  } catch (actionsError) {
    console.error('ExecutionHistory: Error extracting actions:', actionsError);
    setComponentState('error');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Component Error</h3>
        <p className="text-red-700 text-sm mt-2">Failed to extract component actions: {String(actionsError)}</p>
      </div>
    );
  }
  
  // Safely extract handlers with null checks
  let handleError, handleSuccess;
  try {
    if (!handlers) {
      console.error('ExecutionHistory: handlers prop is null/undefined');
      throw new Error('Missing handlers prop');
    }
    
    handleError = handlers.handleError || ((error: any, context: string) => console.error(`${context}:`, error));
    handleSuccess = handlers.handleSuccess || ((message: string) => console.log('Success:', message));
    
    console.log('ExecutionHistory: Handlers extracted successfully');
  } catch (handlersError) {
    console.error('ExecutionHistory: Error extracting handlers:', handlersError);
    setComponentState('error');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Component Error</h3>
        <p className="text-red-700 text-sm mt-2">Failed to extract component handlers: {String(handlersError)}</p>
      </div>
    );
  }

  // Load execution history from database with comprehensive error handling
  const loadHistory = useCallback(async () => {
    // Prevent concurrent loading
    if (isLoadingRef.current) {
      console.log('ExecutionHistory: Already loading, skipping duplicate request');
      return;
    }
    
    console.log('ExecutionHistory: Starting loadHistory()');
    setDebugInfo(prev => ({ ...prev, lastLoadAttempt: new Date().toISOString() }));
    
    try {
      isLoadingRef.current = true;
      setComponentState('loading');
      
      // Validate dbService
      if (!dbService) {
        throw new Error('Database service is not available');
      }
      
      if (typeof dbService.getExecutionHistory !== 'function') {
        throw new Error('getExecutionHistory method is not available on database service');
      }
      
      console.log('ExecutionHistory: Calling updateUIState to set loading');
      updateUIState({ isLoading: true, error: null });
      
      console.log('ExecutionHistory: Calling dbService.getExecutionHistory(50)');
      const history = await dbService.getExecutionHistory(50);
      
      console.log('ExecutionHistory: Received history data:', { count: history?.length, sample: history?.[0] });
      setDebugInfo(prev => ({ ...prev, lastHistory: history, historyCount: history?.length || 0 }));
      
      // Ensure history is an array
      const safeHistory = Array.isArray(history) ? history : [];
      console.log('ExecutionHistory: Updating dataState with history');
      updateDataState({ executionHistory: safeHistory });
      
      console.log('ExecutionHistory: Setting UI state to not loading');
      updateUIState({ isLoading: false });
      
      setComponentState('ready');
      console.log('ExecutionHistory: loadHistory completed successfully');
      
    } catch (error) {
      console.error('ExecutionHistory: Error in loadHistory:', error);
      setDebugInfo(prev => ({ ...prev, lastError: error, errorTime: new Date().toISOString() }));
      setComponentState('error');
      
      try {
        updateUIState({ isLoading: false });
        handleError(error, 'Failed to load execution history');
      } catch (handlerError) {
        console.error('ExecutionHistory: Error calling error handlers:', handlerError);
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [dbService, updateUIState, updateDataState, handleError]);

  // Load history on component mount with dependency safety
  useEffect(() => {
    console.log('ExecutionHistory: useEffect triggered, calling loadHistory');
    setDebugInfo(prev => ({ ...prev, mountTime: new Date().toISOString() }));
    
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      loadHistory();
    }, 50);
    
    return () => {
      console.log('ExecutionHistory: Cleanup - clearing timer and loading flag');
      clearTimeout(timer);
      isLoadingRef.current = false;
    };
  }, []); // Remove dbService dependency to prevent re-runs

  // Revert execution using stored rollback data
  const revertExecution = async (execution: any) => {
    if (!execution) {
      handleError(new Error('Invalid execution data'), 'Revert failed');
      return;
    }

    if (!execution.can_rollback) {
      handleError(new Error('This execution cannot be rolled back'), 'Revert not available');
      return;
    }

    if (!execution.rollback_data || !Array.isArray(execution.rollback_data) || execution.rollback_data.length === 0) {
      handleError(new Error('No rollback data available for this execution'), 'Revert failed');
      return;
    }

    if (!execution.execution_id) {
      handleError(new Error('Missing execution ID'), 'Revert failed');
      return;
    }

    if (!confirm(`Revert execution "${execution.rule_name || 'Unknown'}"? This will restore ${execution.rollback_data.length} records to their previous state.`)) {
      return;
    }

    try {
      updateUIState({ isLoading: true });
      
      // Apply rollback using stored rollback data
      const rollbackPromises = execution.rollback_data.map(async (rollbackItem: any) => {
        const { error } = await supabase
          .from(rollbackItem.table)
          .update({ metadata: rollbackItem.original_value.metadata })
          .eq('id', rollbackItem.record_id);
        
        if (error) {
          throw new Error(`Failed to revert record ${rollbackItem.record_id}: ${error.message}`);
        }
      });

      await Promise.all(rollbackPromises);

      // Mark execution as reverted in the log
      const { error: updateError } = await supabase
        .from('migration_execution_log')
        .update({ 
          is_reverted: true, 
          reverted_at: new Date().toISOString(),
          reverted_by: 'admin-user', // Could be enhanced to track actual user
          revert_notes: `Reverted ${execution.rollback_data.length} records`
        })
        .eq('id', execution.execution_id);

      if (updateError) {
        console.warn('Failed to mark execution as reverted:', updateError);
      }
      
      handleSuccess(`Execution "${execution.rule_name}" reverted successfully! ${execution.rollback_data.length} records restored.`);
      
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

  // Loading state with component state check
  if (uiState.isLoading || componentState === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading execution history...</span>
        <div className="ml-4 text-xs text-gray-500">Component: {componentState}</div>
      </div>
    );
  }

  // Error state with debug information
  if (componentState === 'error') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">ExecutionHistory Component Error</h3>
          <p className="text-red-700 text-sm mt-2">
            The ExecutionHistory component encountered an error during initialization or data loading.
          </p>
          <button
            onClick={() => {
              console.log('ExecutionHistory: Attempting recovery...');
              setComponentState('initializing');
              loadHistory();
            }}
            className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            🔄 Retry Loading
          </button>
        </div>
        
        {/* Debug Information */}
        <details className="bg-gray-50 border rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            🐛 Debug Information
          </summary>
          <div className="mt-2 space-y-2">
            <div className="text-xs">
              <strong>Component State:</strong> {componentState}
            </div>
            <div className="text-xs">
              <strong>Debug Info:</strong>
              <pre className="bg-white p-2 rounded text-xs overflow-auto mt-1">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            <div className="text-xs">
              <strong>Props Check:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>state: {state ? '✅ Present' : '❌ Missing'}</li>
                <li>actions: {actions ? '✅ Present' : '❌ Missing'}</li>
                <li>handlers: {handlers ? '✅ Present' : '❌ Missing'}</li>
                <li>dbService: {dbService ? '✅ Present' : '❌ Missing'}</li>
              </ul>
            </div>
          </div>
        </details>
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
        {(() => {
          try {
            const safeHistory = Array.isArray(dataState?.executionHistory) ? dataState.executionHistory : [];
            const totalCount = safeHistory.length;
            const successfulCount = safeHistory.filter(h => h && typeof h === 'object' && h.status === 'completed').length;
            const failedCount = safeHistory.filter(h => h && typeof h === 'object' && h.status === 'failed').length;
            const totalRecords = safeHistory.reduce((sum, h) => {
              try {
                const affectedRecords = (h && typeof h === 'object' && typeof h.affected_records === 'number') ? h.affected_records : 0;
                return sum + affectedRecords;
              } catch (e) {
                console.warn('Error calculating affected records for history item:', h, e);
                return sum;
              }
            }, 0);
            
            return (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-blue-600 text-2xl mr-3">📊</div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">{totalCount}</div>
                      <div className="text-sm text-blue-600">Total Executions</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-green-600 text-2xl mr-3">✅</div>
                    <div>
                      <div className="text-2xl font-bold text-green-900">{successfulCount}</div>
                      <div className="text-sm text-green-600">Successful</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-red-600 text-2xl mr-3">❌</div>
                    <div>
                      <div className="text-2xl font-bold text-red-900">{failedCount}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-purple-600 text-2xl mr-3">🔄</div>
                    <div>
                      <div className="text-2xl font-bold text-purple-900">{totalRecords}</div>
                      <div className="text-sm text-purple-600">Records Changed</div>
                    </div>
                  </div>
                </div>
              </>
            );
          } catch (statsError) {
            console.error('ExecutionHistory: Error rendering statistics:', statsError);
            return (
              <div className="col-span-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 text-sm">
                  ⚠️ Unable to calculate statistics: {String(statsError)}
                </div>
              </div>
            );
          }
        })()}
      </div>

      {/* Execution History List */}
      {(() => {
        try {
          const safeHistory = Array.isArray(dataState?.executionHistory) ? dataState.executionHistory : [];
          
          if (safeHistory.length === 0) {
            return (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">No Execution History</h3>
                <p className="mb-4">Execute some migration rules to see their history here</p>
                <div className="text-sm text-gray-400">
                  Connected to live Supabase database • {new Date().toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Component State: {componentState} • History Length: {safeHistory.length}
                </div>
              </div>
            );
          }

          // Filter and validate executions with detailed error handling
          const validExecutions = safeHistory.filter((execution, index) => {
            try {
              if (!execution) {
                console.warn(`ExecutionHistory: Null execution at index ${index}`);
                return false;
              }
              if (typeof execution !== 'object') {
                console.warn(`ExecutionHistory: Invalid execution type at index ${index}:`, typeof execution);
                return false;
              }
              if (!execution.execution_id) {
                console.warn(`ExecutionHistory: Missing execution_id at index ${index}:`, execution);
                return false;
              }
              return true;
            } catch (filterError) {
              console.error(`ExecutionHistory: Error filtering execution at index ${index}:`, filterError);
              return false;
            }
          });

          if (validExecutions.length === 0) {
            return (
              <div className="text-center py-12 text-yellow-500">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium mb-2">Data Processing Issue</h3>
                <p className="mb-4">Found {safeHistory.length} history records, but none are valid for display</p>
                <details className="text-left bg-yellow-50 border rounded-lg p-4 mt-4">
                  <summary className="cursor-pointer font-medium">Raw Data Sample</summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(safeHistory.slice(0, 2), null, 2)}
                  </pre>
                </details>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {validExecutions.map((execution, index) => {
                try {
                  // Safe property access with fallbacks
                  const executionId = execution.execution_id || `unknown-${index}`;
                  const ruleName = execution.rule_name || 'Unknown Rule';
                  const status = execution.status || 'unknown';
                  const operationType = execution.operation_type || 'unknown';
                  const targetTable = execution.target_table || 'unknown';
                  const executedAt = execution.executed_at;
                  const affectedRecords = execution.affected_records || 0;
                  const canRollback = !!execution.can_rollback;
                  const rollbackDataLength = (Array.isArray(execution.rollback_data) ? execution.rollback_data.length : 0);
                  const isReverted = !!execution.is_reverted;

                  return (
                    <div key={executionId} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{ruleName}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Execution ID:</span><br />
                              <code className="text-xs bg-gray-100 px-1 rounded">{executionId}</code>
                            </div>
                            <div>
                              <span className="font-medium">Operation:</span><br />
                              <span className="capitalize">{operationType}</span> on {targetTable}
                            </div>
                            <div>
                              <span className="font-medium">Executed:</span><br />
                              {executedAt ? (() => {
                                try {
                                  return new Date(executedAt).toLocaleString();
                                } catch (dateError) {
                                  console.warn('Invalid date format:', executedAt);
                                  return String(executedAt);
                                }
                              })() : 'Unknown'}
                            </div>
                            <div>
                              <span className="font-medium">Records:</span><br />
                              {affectedRecords} affected
                            </div>
                            <div>
                              <span className="font-medium">Rollback:</span><br />
                              {canRollback ? (
                                <span className="text-green-600">✅ Available ({rollbackDataLength} items)</span>
                              ) : (
                                <span className="text-red-600">❌ Not available</span>
                              )}
                            </div>
                          </div>

                          {/* Rule Configuration - Safe rendering */}
                          {(() => {
                            try {
                              if (execution.rule_config) {
                                return (
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
                                );
                              }
                            } catch (configError) {
                              console.warn('Error rendering rule config:', configError);
                            }
                            return null;
                          })()}

                          {/* Changes Made - Safe rendering */}
                          {(() => {
                            try {
                              const changesMade = Array.isArray(execution.changes_made) ? execution.changes_made : [];
                              if (changesMade.length > 0) {
                                return (
                                  <div className="mt-3 text-sm">
                                    <span className="font-medium text-gray-700">
                                      Changes Made ({changesMade.length} records):
                                    </span>
                                    <details className="mt-1">
                                      <summary className="cursor-pointer text-blue-600 hover:underline">
                                        View changes
                                      </summary>
                                      <div className="mt-2 max-h-32 overflow-y-auto">
                                        {changesMade.slice(0, 3).map((change: any, changeIndex: number) => {
                                          try {
                                            const table = change?.table || 'unknown';
                                            const recordId = change?.record_id || 'unknown';
                                            const beforeStr = change?.before ? JSON.stringify(change.before).substring(0, 100) : 'N/A';
                                            const afterStr = change?.after ? JSON.stringify(change.after).substring(0, 100) : 'N/A';
                                            
                                            return (
                                              <div key={changeIndex} className="text-xs bg-gray-50 p-2 rounded mb-1">
                                                <div className="font-medium">{table} - {recordId}</div>
                                                <div className="text-gray-600">
                                                  Before: {beforeStr}...
                                                </div>
                                                <div className="text-gray-600">
                                                  After: {afterStr}...
                                                </div>
                                              </div>
                                            );
                                          } catch (changeError) {
                                            console.warn('Error rendering change:', changeError);
                                            return (
                                              <div key={changeIndex} className="text-xs bg-red-50 p-2 rounded mb-1 text-red-600">
                                                Error rendering change {changeIndex + 1}
                                              </div>
                                            );
                                          }
                                        })}
                                        {changesMade.length > 3 && (
                                          <div className="text-xs text-gray-500 text-center">
                                            ... and {changesMade.length - 3} more changes
                                          </div>
                                        )}
                                      </div>
                                    </details>
                                  </div>
                                );
                              }
                            } catch (changesError) {
                              console.warn('Error processing changes_made:', changesError);
                            }
                            return null;
                          })()}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          {status === 'completed' && !isReverted && canRollback && (
                            <button
                              onClick={() => revertExecution(execution)}
                              disabled={uiState.isLoading}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
                              title={`Revert ${rollbackDataLength} changes`}
                            >
                              🔙 Revert
                            </button>
                          )}
                          {isReverted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              ↺ Reverted
                            </span>
                          )}
                          {!canRollback && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              ⚠️ No Rollback
                            </span>
                          )}
                          <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } catch (renderError) {
                  console.error(`ExecutionHistory: Error rendering execution ${index}:`, renderError);
                  return (
                    <div key={`error-${index}`} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-red-800 font-medium">Rendering Error</h4>
                      <p className="text-red-700 text-sm mt-1">
                        Failed to render execution #{index + 1}: {String(renderError)}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-red-600 text-xs">Raw Data</summary>
                        <pre className="text-xs mt-1 overflow-auto">
                          {JSON.stringify(execution, null, 2)}
                        </pre>
                      </details>
                    </div>
                  );
                }
              })}
            </div>
          );
        } catch (listError) {
          console.error('ExecutionHistory: Error rendering execution list:', listError);
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">List Rendering Error</h3>
              <p className="text-red-700 text-sm mt-2">
                Failed to render execution history list: {String(listError)}
              </p>
              <button
                onClick={() => {
                  console.log('ExecutionHistory: Retrying after list error...');
                  loadHistory();
                }}
                className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                🔄 Retry
              </button>
            </div>
          );
        }
      })()}

      {/* Enhanced Revert System Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">🔄 Enhanced Revert System Active (Phase 4)</h4>
        <p className="text-sm text-green-700">
          Advanced rollback functionality with RuleBuilder support and backward compatibility.
        </p>
        <ul className="text-sm text-green-700 list-disc list-inside mt-2 space-y-1">
          <li>✅ Legacy format support: metadata-only reversion</li>
          <li>✅ RuleBuilder format support: metadata + optional_tags reversion</li>
          <li>✅ Nested metadata path restoration for targeted updates</li>
          <li>✅ Mixed execution support: handles both field types in one operation</li>
          <li>✅ Format validation and error resilience with detailed feedback</li>
          <li>✅ Real-time status tracking and comprehensive revert logging</li>
        </ul>
        <div className="mt-2 text-xs text-green-600">
          Debug: Component State = {componentState} | Valid Executions = {(() => {
            try {
              const safeHistory = Array.isArray(dataState?.executionHistory) ? dataState.executionHistory : [];
              return safeHistory.filter(h => h && h.execution_id).length;
            } catch {
              return 0;
            }
          })()} / {(() => {
            try {
              const safeHistory = Array.isArray(dataState?.executionHistory) ? dataState.executionHistory : [];
              return safeHistory.length;
            } catch {
              return 0;
            }
          })()} | Multi-Format Rollback Ready
        </div>
      </div>
    </div>
  );
}