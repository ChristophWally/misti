'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface Rule {
  rule_id: string;
  name: string;
  description: string;
  target_tables: string[];
  created_at: string;
  execution_count: number;
}

export default function SimpleRuleManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active');

      if (error) {
        setErrorMsg('Database error: ' + error.message);
        return;
      }

      setRules(data || []);
    } catch (err: any) {
      setErrorMsg('Load failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4">Loading rules...</div>;
  }

  if (errorMsg) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-2">Error: {errorMsg}</div>
        <button 
          onClick={loadRules}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-medium">Migration Rules</h2>
        <p className="text-sm text-gray-600">Found {rules.length} rules</p>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No rules found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.rule_id} className="border rounded p-3">
              <h3 className="font-medium">{rule.name}</h3>
              <p className="text-sm text-gray-600">{rule.description}</p>
              <p className="text-xs text-gray-500">
                Tables: {rule.target_tables.join(', ')} | 
                Executed: {rule.execution_count} times
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}