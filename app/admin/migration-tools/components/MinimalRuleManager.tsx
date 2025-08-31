'use client';

import { useState, useEffect } from 'react';

export default function MinimalRuleManager() {
  const [message, setMessage] = useState('Component loaded successfully');
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Minimal RuleManager Test</h3>
      <p>Status: {message}</p>
      <p>Step: {step}</p>
      
      <div className="space-x-2">
        <button 
          onClick={() => {
            setStep(2);
            setMessage('Button click works');
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Test Click
        </button>
        
        <button 
          onClick={() => {
            setStep(3);
            setMessage('Testing import...');
            import('../../../../lib/supabase').then(() => {
              setMessage('Supabase import successful');
              setStep(4);
            }).catch((err) => {
              setMessage(`Import failed: ${err.message}`);
            });
          }}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Test Import
        </button>
      </div>
      
      {step >= 4 && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">Basic component functionality works!</p>
        </div>
      )}
    </div>
  );
}