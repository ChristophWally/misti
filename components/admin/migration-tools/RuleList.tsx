'use client';

import type { MigrationRule } from './types';

interface RuleListProps {
  rules: MigrationRule[];
  onEditRule: (rule: MigrationRule) => void;
  onExecuteRule: (rule: MigrationRule) => void;
}

export default function RuleList({ rules, onEditRule, onExecuteRule }: RuleListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'needs-input': return '⚙️';
      case 'executing': return '⏳';
      case 'completed': return '🎉';
      case 'failed': return '❌';
      default: return '📋';
    }
  };

  const getOperationIcon = (operation?: string) => {
    switch (operation) {
      case 'replace': return '🔄';
      case 'add': return '➕';
      case 'remove': return '🗑️';
      default: return '⚙️';
    }
  };

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Rule Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon(rule.status)}</span>
              <span className="text-lg">{getOperationIcon(rule.operationType)}</span>
              <h3 className="font-semibold text-gray-900">{rule.title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {rule.affectedCount} records
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                {rule.ruleSource}
              </span>
            </div>
          </div>

          {/* Rule Description */}
          <p className="text-gray-600 mb-3">{rule.description}</p>

          {/* Rule Configuration */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3 text-sm">
            <div className="font-medium text-gray-700 mb-2">Configuration:</div>
            <div className="space-y-1">
              <div>
                <span className="font-medium">Operation:</span> {rule.operationType?.toUpperCase()} on {rule.configuration.selectedTable}:{rule.configuration.selectedColumn}
              </div>
              
              {rule.configuration.selectedTagsForMigration?.length > 0 && (
                <div>
                  <span className="font-medium">Target Tags:</span> {rule.configuration.selectedTagsForMigration.slice(0, 3).join(', ')}
                  {rule.configuration.selectedTagsForMigration.length > 3 && ` (+${rule.configuration.selectedTagsForMigration.length - 3} more)`}
                </div>
              )}
              
              {rule.configuration.mappings?.length > 0 && (
                <div>
                  <span className="font-medium">Mappings:</span> 
                  {rule.configuration.mappings.slice(0, 2).map(m => `"${m.from}" → "${m.to}"`).join(', ')}
                  {rule.configuration.mappings.length > 2 && ` (+${rule.configuration.mappings.length - 2} more)`}
                </div>
              )}
              
              {rule.configuration.selectedWords?.length > 0 && (
                <div>
                  <span className="font-medium">Target Words:</span> {rule.configuration.selectedWords.slice(0, 2).map(w => w.italian).join(', ')}
                  {rule.configuration.selectedWords.length > 2 && ` (+${rule.configuration.selectedWords.length - 2} more)`}
                </div>
              )}
              
              {rule.configuration.selectedFormNames?.length > 0 && (
                <div>
                  <span className="font-medium">Target Forms:</span> {rule.configuration.selectedFormNames.slice(0, 2).join(', ')}
                  {rule.configuration.selectedFormNames.length > 2 && ` (+${rule.configuration.selectedFormNames.length - 2} more)`}
                </div>
              )}
              
              {rule.configuration.selectedTranslationNames?.length > 0 && (
                <div>
                  <span className="font-medium">Target Translations:</span> {rule.configuration.selectedTranslationNames.slice(0, 2).join(', ')}
                  {rule.configuration.selectedTranslationNames.length > 2 && ` (+${rule.configuration.selectedTranslationNames.length - 2} more)`}
                </div>
              )}
              
              <div>
                <span className="font-medium">Prevent Duplicates:</span> {rule.preventDuplicates ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => onEditRule(rule)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              {rule.ruleSource === 'custom' && (
                <button
                  onClick={() => onExecuteRule(rule)}
                  disabled={rule.status === 'executing'}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {rule.status === 'executing' ? 'Executing...' : 'Execute'}
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              ID: {rule.id}
            </div>
          </div>
        </div>
      ))}
      
      {rules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No migration rules found. Create a new rule to get started.
        </div>
      )}
    </div>
  );
}