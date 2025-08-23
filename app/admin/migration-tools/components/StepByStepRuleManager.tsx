'use client';

import { useState, useEffect } from 'react';

export default function StepByStepRuleManager() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('Ready to test');
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testStep = async (stepNumber: number) => {
    try {
      setError(null);
      setMessage('Testing...');

      if (stepNumber === 1) {
        // Test full state setup like RuleManager
        const [testRules, setTestRules] = useState<any[]>([]);
        const [testLoading, setTestLoading] = useState(true);
        const [testError, setTestError] = useState<string | null>(null);
        const [testForm, setTestForm] = useState(false);
        setMessage('Full state setup works');
        setStep(1);

      } else if (stepNumber === 2) {
        // Test useEffect
        const { supabase } = await import('../../../../lib/supabase');
        
        useEffect(() => {
          setMessage('useEffect executed');
        }, []);
        
        setStep(2);
        setMessage('useEffect works');

      } else if (stepNumber === 3) {
        // Test database query
        const { supabase } = await import('../../../../lib/supabase');
        
        setIsLoading(true);
        const { data, error } = await supabase
          .from('custom_migration_rules')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          setError(`Database error: ${error.message}`);
        } else {
          setRules(data || []);
          setMessage(`Found ${(data || []).length} rules`);
          setStep(3);
        }
        setIsLoading(false);

      } else if (stepNumber === 4) {
        // Test the full loadRules function like in RuleManager
        setIsLoading(true);
        
        const loadRules = async () => {
          try {
            setError(null);
            const { supabase } = await import('../../../../lib/supabase');
            
            const { data, error } = await supabase
              .from('custom_migration_rules')
              .select('*')
              .eq('status', 'active')
              .order('created_at', { ascending: false });

            if (error) {
              setError(`Database error: ${error.message}`);
              return;
            }
            
            setRules(data || []);
            setMessage(`loadRules function works: ${(data || []).length} rules`);
            setStep(4);
          } catch (error: any) {
            setError('Failed to load migration rules. Please try again.');
          } finally {
            setIsLoading(false);
          }
        };

        await loadRules();
      }

    } catch (err: any) {
      setError(`Step ${stepNumber} failed: ${err.message}`);
      setMessage(`Step ${stepNumber} error`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Step-by-Step RuleManager Test</h3>
      <p>Status: {message}</p>
      <p>Current Step: {step}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Rules Count: {rules.length}</p>
      
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => testStep(1)}
          className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
        >
          Step 1: Full State Setup
        </button>
        
        <button 
          onClick={() => testStep(2)}
          className="bg-green-500 text-white px-3 py-2 rounded text-sm"
        >
          Step 2: useEffect Test
        </button>
        
        <button 
          onClick={() => testStep(3)}
          className="bg-yellow-500 text-white px-3 py-2 rounded text-sm"
        >
          Step 3: Database Query
        </button>
        
        <button 
          onClick={() => testStep(4)}
          className="bg-red-500 text-white px-3 py-2 rounded text-sm"
        >
          Step 4: Full loadRules Function
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800 text-sm font-mono">{error}</p>
        </div>
      )}
      
      {step >= 4 && !error && (
        <div className="p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">All RuleManager functions work individually!</p>
        </div>
      )}
    </div>
  );
}