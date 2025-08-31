'use client';

import { useState } from 'react';

export default function SafeRuleManager() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const testStep = async (stepNum: number) => {
    try {
      setError(null);
      
      if (stepNum === 1) {
        // Test basic state
        const [rules, setRules] = useState([]);
        setStep(1);
      } else if (stepNum === 2) {
        // Test supabase import
        const { supabase } = await import('../../../../lib/supabase');
        setStep(2);
      } else if (stepNum === 3) {
        // Test useEffect
        const { useEffect } = await import('react');
        setStep(3);
      } else if (stepNum === 4) {
        // Test database call
        const { supabase } = await import('../../../../lib/supabase');
        const { data, error } = await supabase
          .from('custom_migration_rules')
          .select('*')
          .limit(1);
        
        if (error) {
          setError(`Database error: ${error.message}`);
        } else {
          setStep(4);
        }
      }
    } catch (err: any) {
      setError(`Step ${stepNum} failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Safe RuleManager Test</h3>
      
      <div className="space-x-2">
        <button onClick={() => testStep(1)} className="bg-blue-500 text-white px-3 py-1 rounded">
          Test State (Step 1)
        </button>
        <button onClick={() => testStep(2)} className="bg-green-500 text-white px-3 py-1 rounded">
          Test Supabase (Step 2)  
        </button>
        <button onClick={() => testStep(3)} className="bg-yellow-500 text-white px-3 py-1 rounded">
          Test Effects (Step 3)
        </button>
        <button onClick={() => testStep(4)} className="bg-red-500 text-white px-3 py-1 rounded">
          Test Database (Step 4)
        </button>
      </div>

      <div className="mt-4">
        <p>Current Step: {step}</p>
        {error && (
          <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {step >= 4 && (
          <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800 text-sm">All basic tests passed!</p>
          </div>
        )}
      </div>
    </div>
  );
}