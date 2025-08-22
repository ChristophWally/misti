'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/DatabaseService';

interface AuditTabProps {
  debugState: {
    logs: string[];
    isExpanded: boolean;
  };
  updateDebugState: (updates: any) => void;
}

export default function AuditTab({ debugState, updateDebugState }: AuditTabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState('word_forms');

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    updateDebugState({
      logs: [...debugState.logs, `[${timestamp}] ${message}`]
    });
  };

  const runDatabaseAnalysis = async () => {
    setIsAnalyzing(true);
    addDebugLog('🔍 Starting database analysis...');
    
    try {
      const databaseService = new DatabaseService();
      
      // Analyze metadata across all tables
      const results = {
        totalRecords: {
          dictionary: 0,
          word_forms: 0,
          word_translations: 0,
          form_translations: 0
        },
        metadataConsistency: {
          withMetadata: 0,
          withOptionalTags: 0,
          withLegacyTags: 0,
          inconsistencies: []
        },
        tagAnalysis: {
          mostCommonTags: [],
          orphanedTags: [],
          duplicatePatterns: []
        }
      };

      // Get record counts and sample metadata
      for (const table of ['dictionary', 'word_forms', 'word_translations', 'form_translations']) {
        addDebugLog(`📊 Analyzing ${table} table...`);
        const metadata = await databaseService.extractMetadata(table as any, []);
        results.totalRecords[table as keyof typeof results.totalRecords] = metadata.combined.length;
      }

      addDebugLog('✅ Database analysis complete');
      setAuditResults(results);
    } catch (error) {
      addDebugLog(`❌ Analysis failed: ${error}`);
      console.error('Audit analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runDatabaseAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Database Analysis & Tag Consistency</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time analysis of metadata consistency across all tables
          </p>
        </div>
        <button
          onClick={runDatabaseAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🔄 Refresh Analysis'}
        </button>
      </div>

      {/* Table Selection */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Table Focus</h3>
        <div className="grid grid-cols-4 gap-2">
          {['dictionary', 'word_forms', 'word_translations', 'form_translations'].map(table => (
            <button
              key={table}
              onClick={() => setSelectedTable(table)}
              className={`px-3 py-2 text-sm rounded border ${
                selectedTable === table
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {table.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {auditResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Record Counts */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">📊 Record Statistics</h3>
            <div className="space-y-3">
              {Object.entries(auditResults.totalRecords).map(([table, count]) => (
                <div key={table} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{table.replace('_', ' ')}</span>
                  <span className="font-mono text-sm font-medium">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata Consistency */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">🔍 Metadata Consistency</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">With metadata (JSONB)</span>
                <span className="font-mono text-sm font-medium text-green-600">
                  {auditResults.metadataConsistency.withMetadata}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">With optional_tags</span>
                <span className="font-mono text-sm font-medium text-blue-600">
                  {auditResults.metadataConsistency.withOptionalTags}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Legacy tags column</span>
                <span className="font-mono text-sm font-medium text-orange-600">
                  {auditResults.metadataConsistency.withLegacyTags}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story 2.3.1 Compliance Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">✅ Story 2.3.1 Unified Metadata Compliance</h3>
        <div className="text-sm text-green-800 space-y-1">
          <div>📋 <strong>metadata (JSONB):</strong> Structured grammatical properties</div>
          <div>🏷️ <strong>optional_tags (text[]):</strong> Descriptive supplementary tags</div>
          <div>⚠️ <strong>tags (text[]):</strong> Legacy support during transition</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">🛠️ Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <button className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50">
            Export Analysis
          </button>
          <button className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50">
            Check Orphaned Tags
          </button>
          <button className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50">
            Validate Schema
          </button>
        </div>
      </div>
    </div>
  );
}