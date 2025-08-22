'use client';

import { useState, useEffect } from 'react';

interface ProgressTabProps {
  executionState: any;
  debugState: any;
  updateExecutionState: (updates: any) => void;
  updateDebugState: (updates: any) => void;
}

export default function ProgressTab({ 
  executionState, 
  debugState, 
  updateExecutionState, 
  updateDebugState 
}: ProgressTabProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock execution history data
  const mockExecutionHistory = [
    {
      id: '1',
      timestamp: '2025-08-22T20:30:00Z',
      ruleName: 'Fix auxiliary verb tags',
      operation: 'replace',
      table: 'word_forms',
      recordsAffected: 234,
      status: 'completed',
      duration: '2.3s',
      changes: [
        { from: 'requires_avere', to: 'auxiliary:avere' },
        { from: 'requires_essere', to: 'auxiliary:essere' }
      ],
      canRevert: true
    },
    {
      id: '2',
      timestamp: '2025-08-22T19:15:00Z',
      ruleName: 'Standardize tense format',
      operation: 'replace',
      table: 'word_translations',
      recordsAffected: 1567,
      status: 'completed',
      duration: '8.7s',
      changes: [
        { from: 'present_tense', to: 'tense:present' },
        { from: 'past_tense', to: 'tense:past' }
      ],
      canRevert: true
    },
    {
      id: '3',
      timestamp: '2025-08-22T18:45:00Z',
      ruleName: 'Add mood indicators',
      operation: 'add',
      table: 'word_forms',
      recordsAffected: 892,
      status: 'completed',
      duration: '4.1s',
      changes: [
        { from: '', to: 'mood:indicative' },
        { from: '', to: 'mood:subjunctive' }
      ],
      canRevert: false
    },
    {
      id: '4',
      timestamp: '2025-08-22T17:20:00Z',
      ruleName: 'Remove obsolete tags',
      operation: 'remove',
      table: 'dictionary',
      recordsAffected: 45,
      status: 'failed',
      duration: '0.8s',
      error: 'Foreign key constraint violation',
      canRevert: false
    }
  ];

  const filteredHistory = mockExecutionHistory.filter(execution => {
    const matchesFilter = selectedFilter === 'all' || execution.status === selectedFilter;
    const matchesSearch = searchTerm === '' || 
      execution.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.table.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'replace': return '🔄';
      case 'add': return '➕';
      case 'remove': return '➖';
      default: return '⚙️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Execution History & Progress</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track migration executions, performance metrics, and rollback capabilities
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Export History
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search rules or tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-600">
            {filteredHistory.length} of {mockExecutionHistory.length} executions
          </div>
        </div>
      </div>

      {/* Execution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockExecutionHistory.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">✗</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockExecutionHistory.filter(e => e.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">Σ</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Records Affected</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockExecutionHistory
                  .filter(e => e.status === 'completed')
                  .reduce((sum, e) => sum + e.recordsAffected, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-sm">⏱</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Duration</p>
              <p className="text-lg font-semibold text-gray-900">4.2s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution History List */}
      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Recent Executions</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredHistory.map((execution) => (
            <div key={execution.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getOperationIcon(execution.operation)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{execution.ruleName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Table: {execution.table}</span>
                        <span>Records: {execution.recordsAffected.toLocaleString()}</span>
                        <span>Duration: {execution.duration}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(execution.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Changes Preview */}
                  <div className="mt-3 ml-8">
                    <div className="text-xs text-gray-600 mb-1">Changes:</div>
                    <div className="flex flex-wrap gap-2">
                      {execution.changes.slice(0, 3).map((change, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {change.from ? `"${change.from}" → "${change.to}"` : `+ "${change.to}"`}
                        </span>
                      ))}
                      {execution.changes.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{execution.changes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Error message if failed */}
                  {execution.status === 'failed' && execution.error && (
                    <div className="mt-2 ml-8 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      Error: {execution.error}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                  
                  {execution.canRevert && execution.status === 'completed' && (
                    <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                      Revert
                    </button>
                  )}
                  
                  <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredHistory.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No executions match your current filters</p>
          </div>
        )}
      </div>

      {/* Performance Analytics */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">📈 Performance Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-700">Peak Performance</div>
            <div className="text-xs text-gray-600 mt-1">
              Best: 2.3s (234 records) • Worst: 8.7s (1,567 records)
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-700">Success Rate</div>
            <div className="text-xs text-gray-600 mt-1">
              75% (3/4 executions successful)
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-700">Data Impact</div>
            <div className="text-xs text-gray-600 mt-1">
              2,693 total records migrated successfully
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}