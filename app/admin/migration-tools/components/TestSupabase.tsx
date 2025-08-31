'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export default function TestSupabase() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Supabase imported');
  const [importTest, setImportTest] = useState('Not tested');

  useEffect(() => {
    setMessage('useEffect ran with Supabase import');
  }, []);

  const testSupabaseImport = () => {
    if (supabase) {
      setImportTest('✅ Supabase client exists');
    } else {
      setImportTest('❌ Supabase client is null');
    }
  };

  return (
    <div className="space-y-3">
      <h1>Test Supabase Import</h1>
      <p>Message: {message}</p>
      <p>Count: {count}</p>
      <p>Import Test: {importTest}</p>
      
      <div className="space-x-2">
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Increment
        </button>
        
        <button 
          onClick={testSupabaseImport}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Test Supabase Import
        </button>
      </div>
    </div>
  );
}