'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export default function TestDatabase() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Database test loaded');
  const [queryResult, setQueryResult] = useState('Not queried');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessage('useEffect ran - ready for database test');
  }, []);

  const testDatabaseQuery = async () => {
    try {
      setLoading(true);
      setQueryResult('Querying...');
      
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .limit(3);

      if (error) {
        setQueryResult(`❌ Database error: ${error.message}`);
        return;
      }

      setQueryResult(`✅ Query success: Found ${(data || []).length} rules`);
    } catch (err: any) {
      setQueryResult(`❌ Catch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h1>Test Database Query</h1>
      <p>Message: {message}</p>
      <p>Count: {count}</p>
      <p>Query Result: {queryResult}</p>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      
      <div className="space-x-2">
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Increment
        </button>
        
        <button 
          onClick={testDatabaseQuery}
          disabled={loading}
          className="bg-red-500 text-white px-3 py-1 rounded disabled:bg-gray-400"
        >
          Test Database Query
        </button>
      </div>
    </div>
  );
}