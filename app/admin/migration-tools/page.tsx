'use client';

import { useState } from 'react';

export default function MigrationToolsPage() {
  const [testStep, setTestStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supabaseResult, setSupabaseResult] = useState<string | null>(null);

  const testSupabase = async () => {
    try {
      setError(null);
      const { supabase } = await import('../../../lib/supabase');
      const { data, error } = await supabase.from('dictionary').select('count').limit(1);
      
      if (error) {
        setSupabaseResult(`Supabase Error: ${error.message}`);
      } else {
        setSupabaseResult('Supabase connection successful!');
      }
    } catch (err: any) {
      setSupabaseResult(`Import Error: ${err.message}`);
    }
  };

  const testComponent = async (componentName: string) => {
    try {
      setError(null);
      if (componentName === 'RuleManager') {
        const { default: RuleManager } = await import('./components/RuleManager');
        setTestStep(1);
      } else if (componentName === 'SearchInterface') {
        const { default: SearchInterface } = await import('./components/SearchInterface');
        setTestStep(2);
      } else if (componentName === 'ExecutionHistory') {
        const { default: ExecutionHistory } = await import('./components/ExecutionHistory');
        setTestStep(3);
      } else if (componentName === 'MigrationTools') {
        const { default: MigrationTools } = await import('./components/MigrationTools');
        setTestStep(4);
      }
    } catch (err: any) {
      setError(`${componentName} failed to import: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Migration Tools Debug</h1>
          <p className="mt-2 text-gray-600">Progressive component testing</p>
        </div>
        
        <div className="space-y-4">
          {/* Supabase Test */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">1. Test Supabase Connection</h2>
            <button 
              onClick={testSupabase}
              className="bg-red-600 text-white px-4 py-2 rounded mr-4"
            >
              Test Supabase Import
            </button>
            {supabaseResult && (
              <div className="mt-2 p-3 bg-gray-100 rounded">
                <code className="text-sm">{supabaseResult}</code>
              </div>
            )}
          </div>

          {/* Component Tests */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">2. Test Component Imports</h2>
            <div className="space-x-2 mb-4">
              <button 
                onClick={() => testComponent('RuleManager')}
                className="bg-yellow-600 text-white px-3 py-2 rounded"
              >
                Test RuleManager
              </button>
              <button 
                onClick={() => testComponent('SearchInterface')}
                className="bg-orange-600 text-white px-3 py-2 rounded"
              >
                Test SearchInterface
              </button>
              <button 
                onClick={() => testComponent('ExecutionHistory')}
                className="bg-purple-600 text-white px-3 py-2 rounded"
              >
                Test ExecutionHistory
              </button>
              <button 
                onClick={() => testComponent('MigrationTools')}
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                Test Main Component
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm">Test Step: {testStep}</p>
              {error && (
                <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-800 text-sm font-mono">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Render Tests */}
          {testStep >= 4 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">3. Try Rendering Components</h2>
              <p className="text-sm text-gray-600 mb-4">
                All imports successful. Click to try rendering:
              </p>
              <button 
                onClick={() => setTestStep(5)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Render Full Interface
              </button>
            </div>
          )}

          {/* Controlled Render Test */}
          {testStep >= 5 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">3. Safe Component Rendering</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setTestStep(6)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Test RuleManager Render
                </button>
                <button 
                  onClick={() => setTestStep(7)}
                  className="bg-green-600 text-white px-4 py-2 rounded ml-2"
                >
                  Test SearchInterface Render
                </button>
                <button 
                  onClick={() => setTestStep(8)}
                  className="bg-green-600 text-white px-4 py-2 rounded ml-2"
                >
                  Test ExecutionHistory Render
                </button>
              </div>
            </div>
          )}

          {/* Individual Component Renders */}
          {testStep === 6 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">RuleManager Component - Safe Test</h3>
              <div className="border border-gray-300 rounded p-4">
                {(() => {
                  try {
                    const { default: TestSupabase } = require('./components/TestSupabase');
                    return <TestSupabase />;
                  } catch (err: any) {
                    return (
                      <div className="p-3 bg-red-100 border border-red-300 rounded">
                        <p className="text-red-800 font-mono text-sm">SafeRuleManager Error: {err.message}</p>
                        <pre className="text-xs mt-2 overflow-auto">{err.stack}</pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {testStep === 7 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">SearchInterface Component</h3>
              <div className="border border-gray-300 rounded p-4">
                {(() => {
                  try {
                    const { default: SearchInterface } = require('./components/SearchInterface');
                    return <SearchInterface />;
                  } catch (err: any) {
                    return (
                      <div className="p-3 bg-red-100 border border-red-300 rounded">
                        <p className="text-red-800 font-mono text-sm">SearchInterface Error: {err.message}</p>
                        <pre className="text-xs mt-2 overflow-auto">{err.stack}</pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {testStep === 8 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">ExecutionHistory Component</h3>
              <div className="border border-gray-300 rounded p-4">
                {(() => {
                  try {
                    const { default: ExecutionHistory } = require('./components/ExecutionHistory');
                    return <ExecutionHistory />;
                  } catch (err: any) {
                    return (
                      <div className="p-3 bg-red-100 border border-red-300 rounded">
                        <p className="text-red-800 font-mono text-sm">ExecutionHistory Error: {err.message}</p>
                        <pre className="text-xs mt-2 overflow-auto">{err.stack}</pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}