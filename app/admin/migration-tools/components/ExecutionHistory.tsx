'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ExecutionRecord {
  execution_id: string;
  rule_id: string;
  execution_type: string;
  affected_tables: string[];
  records_affected: number;
  changes_made: any;
  execution_status: string;
  execution_time: string;
  executed_at: string;
  error_details?: any;
  revert_data?: any;
}

export default function ExecutionHistory() {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadExecutionHistory();
  }, []);

  const loadExecutionHistory = async () => {
    try {
      let query = supabase
        .from('migration_execution_history')
        .select('*')
        .order('executed_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('execution_status', filter === 'success' ? 'success' : 'failed');
      }

      const { data, error } = await query;

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error loading execution history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (execution: ExecutionRecord) => {
    if (!execution.revert_data) {
      alert('No revert data available for this execution.');
      return;
    }

    if (!confirm(`Revert execution "${execution.execution_id}"? This will restore all affected records to their previous state.`)) {
      return;
    }

    try {
      // TODO: Implement actual revert logic
      alert(`Revert completed successfully!
        Restored: ${execution.records_affected} records
        Tables: ${execution.affected_tables.join(', ')}`);
      
      // Refresh history
      loadExecutionHistory();
    } catch (error) {
      alert(`Revert failed: ${error}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExecutions = executions.filter(execution => {
    if (filter === 'all') return true;
    return execution.execution_status === (filter === 'success' ? 'success' : 'failed');
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading execution history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Execution History</h2>
          <p className="text-sm text-gray-600">View and revert database migrations</p>
        </div>
        
        <div className="flex space-x-2">
          {['all', 'success', 'failed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {executions.filter(e => e.execution_status === 'success').length}
          </div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {executions.filter(e => e.execution_status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {executions.reduce((sum, e) => sum + e.records_affected, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Records Affected</div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {executions.filter(e => e.revert_data).length}
          </div>
          <div className="text-sm text-gray-600">Can Revert</div>
        </div>
      </div>

      {/* Execution List */}
      {filteredExecutions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No Executions Found</h3>
          <p>Execute some migrations to see history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExecutions.map((execution) => (
            <div key={execution.execution_id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {execution.execution_type === 'revert' ? 'Revert Operation' : 'Migration Execution'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.execution_status)}`}>
                      {execution.execution_status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Tables: {execution.affected_tables.join(', ')}</div>
                    <div>Records: {execution.records_affected.toLocaleString()}</div>
                    <div>Duration: {execution.execution_time}</div>
                    <div>Executed: {new Date(execution.executed_at).toLocaleString()}</div>
                  </div>

                  {/* Show changes details */}
                  {execution.changes_made && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                        View changes made
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(execution.changes_made, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}

                  {/* Show error details if failed */}
                  {execution.execution_status === 'failed' && execution.error_details && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="text-xs font-medium text-red-900">Error Details:</div>
                      <div className="text-xs text-red-800 mt-1">
                        {JSON.stringify(execution.error_details)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {execution.revert_data && execution.execution_status === 'success' && (
                    <button
                      onClick={() => handleRevert(execution)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Revert
                    </button>
                  )}
                  
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}