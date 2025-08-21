'use client';

import { useState, useEffect } from 'react';
import type { MigrationRule } from './migration-tools/types';
import { DatabaseService } from './migration-tools/DatabaseService';
import RuleList from './migration-tools/RuleList';
import RuleBuilder from './migration-tools/RuleBuilder';

export default function MigrationToolsRefactored() {
  const [rules, setRules] = useState<MigrationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<MigrationRule | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load rules on component mount
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedRules = await DatabaseService.loadRules();
      setRules(loadedRules);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setError('Failed to load migration rules. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewRule = () => {
    setEditingRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule: MigrationRule) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleRuleSaved = (savedRule: MigrationRule) => {
    if (editingRule) {
      // Update existing rule
      setRules(prev => prev.map(rule => 
        rule.id === savedRule.id ? savedRule : rule
      ));
    } else {
      // Add new rule
      setRules(prev => [...prev, savedRule]);
    }
    setEditingRule(null);
  };

  const handleExecuteRule = async (rule: MigrationRule) => {
    // Update rule status to executing
    setRules(prev => prev.map(r => 
      r.id === rule.id ? { ...r, status: 'executing' } : r
    ));

    try {
      // TODO: Implement rule execution
      console.log('Executing rule:', rule);
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update rule status to completed
      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, status: 'completed' } : r
      ));
    } catch (err) {
      console.error('Rule execution failed:', err);
      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, status: 'failed' } : r
      ));
    }
  };

  const handleCloseRuleBuilder = () => {
    setShowRuleBuilder(false);
    setEditingRule(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading migration tools...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Migration Tools (Refactored)
          </h2>
          <button
            onClick={handleCreateNewRule}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Rule
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadRules}
              className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Rules List */}
      <div className="p-6">
        <RuleList
          rules={rules}
          onEditRule={handleEditRule}
          onExecuteRule={handleExecuteRule}
        />
      </div>

      {/* Rule Builder Modal */}
      <RuleBuilder
        isOpen={showRuleBuilder}
        editingRule={editingRule}
        onClose={handleCloseRuleBuilder}
        onSave={handleRuleSaved}
      />
    </div>
  );
}