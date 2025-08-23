'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export default function TestUseEffectDB() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // This is the EXACT pattern from RuleManager
  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setError('');
      setLoading(true);
      
      const { data, error: dbError } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (dbError) {
        setError(`Database error: ${dbError.message}`);
        return;
      }
      
      setRules(data || []);
    } catch (catchError: any) {
      setError(`Load failed: ${catchError.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading rules...</div>;
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600">Error: {error}</p>
        <button onClick={loadRules} className="bg-red-500 text-white px-2 py-1 rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Test useEffect Database Loading</h1>
      <p>Found {rules.length} rules</p>
      
      {rules.length === 0 ? (
        <p>No rules found</p>
      ) : (
        <div className="space-y-2">
          {rules.slice(0, 3).map((rule, i) => (
            <div key={i} className="border p-2 rounded">
              <p className="font-medium">{rule.name || 'Unnamed'}</p>
              <p className="text-sm text-gray-600">{rule.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={loadRules}
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
      >
        Reload Rules
      </button>
    </div>
  );
}