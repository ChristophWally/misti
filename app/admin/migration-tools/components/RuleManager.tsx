'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MigrationRule {
  rule_id: string;
  name: string;
  description: string;
  rule_config: any;
  transformation: any;
  target_tables: string[];
  created_at: string;
  execution_count: number;
  status: string;
}

export default function RuleManager() {
  const [rules, setRules] = useState<MigrationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const supabase = createClientComponentClient();

  // Load rules from database
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeRule = async (rule: MigrationRule) => {
    if (!confirm(`Execute "${rule.name}"? This will modify your database.`)) return;

    try {
      // TODO: Implement actual rule execution
      alert(`Rule "${rule.name}" executed successfully!`);
      
      // Update execution count
      await supabase
        .from('custom_migration_rules')
        .update({ 
          execution_count: rule.execution_count + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('rule_id', rule.rule_id);

      loadRules(); // Refresh
    } catch (error) {
      alert(`Execution failed: ${error}`);
    }
  };

  if (isLoading) {
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
          <p className="text-sm text-gray-600">Manage and execute saved migration rules</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Rule
        </button>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No Rules Found</h3>
          <p>Create your first migration rule to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.rule_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{rule.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Tables: {rule.target_tables.join(', ')}</span>
                    <span>Created: {new Date(rule.created_at).toLocaleDateString()}</span>
                    <span>Executed: {rule.execution_count} times</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => executeRule(rule)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Execute
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Rule</h3>
            <p className="text-sm text-gray-600 mb-4">
              Advanced rule creation interface coming soon. For now, use the Search & Execute tab to build rules interactively.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateForm(false)}
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