'use client';

import { useState, useEffect } from 'react';
import { ModernDatabaseService } from '../services/ModernDatabaseService';
import { MetavalService } from '../services/MetavalService';
import { DisplayNameService } from '../utils/DisplayNameUtils';

/**
 * Debug component to test the metaval service chain
 * This will help identify where the display name lookup is failing
 */
export default function MetavalDebugTest() {
  const [results, setResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebugTests = async () => {
    setIsLoading(true);
    setError(null);
    const testResults: any = {};

    try {
      // Test 1: Basic database connectivity
      const dbService = ModernDatabaseService.getInstance();
      const connectionTest = await dbService.testDatabaseConnection();
      testResults.databaseConnection = connectionTest;

      // Test 2: Check if metaval tables exist and have data
      try {
        // Import supabase directly
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: attributesData, error: attrError } = await supabase
          .from('meta_attributes')
          .select('*')
          .limit(5);
        
        testResults.metaAttributesTable = {
          exists: !attrError,
          error: attrError?.message,
          sampleData: attributesData || [],
          count: attributesData?.length || 0
        };
      } catch (err) {
        testResults.metaAttributesTable = {
          exists: false,
          error: String(err),
          sampleData: [],
          count: 0
        };
      }

      try {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: valuesData, error: valError } = await supabase
          .from('meta_values')
          .select('*')
          .limit(5);
        
        testResults.metaValuesTable = {
          exists: !valError,
          error: valError?.message,
          sampleData: valuesData || [],
          count: valuesData?.length || 0
        };
      } catch (err) {
        testResults.metaValuesTable = {
          exists: false,
          error: String(err),
          sampleData: [],
          count: 0
        };
      }

      // Test 3: Test specific stable ID lookups
      const metavalService = new MetavalService();
      
      // Try to get metaattr008 (should be Gender)
      const attr008 = await metavalService.getAttributeByStableId('metaattr008');
      testResults.metaattr008Lookup = attr008;

      // Try to get metaattr008val038 (should be Feminine)
      const val038 = await metavalService.getValueByStableId('metaattr008val038');
      testResults.val038Lookup = val038;

      // Test 4: DisplayNameService tests
      const displayService = DisplayNameService.getInstance();
      
      try {
        const attrDisplayName = await displayService.getAttributeDisplayName('metaattr008');
        testResults.displayServiceAttr = attrDisplayName;
      } catch (err) {
        testResults.displayServiceAttr = { error: String(err) };
      }

      try {
        const valueDisplayName = await displayService.getValueDisplayName('metaattr008val038');
        testResults.displayServiceValue = valueDisplayName;
      } catch (err) {
        testResults.displayServiceValue = { error: String(err) };
      }

      // Test 5: Sample data from dictionary table to see what we're working with
      const sampleDictionary = await dbService.getTableSample('dictionary', 3);
      testResults.sampleDictionaryData = sampleDictionary;

      // Test 6: Cache statistics
      const cacheStats = displayService.getCacheStats();
      testResults.cacheStats = cacheStats;

      setResults(testResults);

    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDebugTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Metaval Debug Test Results</h3>
        <button
          onClick={runDebugTests}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? 'Running Tests...' : 'Re-run Tests'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-medium text-red-800">Error:</h4>
          <pre className="text-sm text-red-700 mt-2">{error}</pre>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className="border rounded p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Test: {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {/* Quick Test Section */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-medium text-yellow-800 mb-2">Quick Test: Expected vs Actual</h4>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Test Case</div>
            <div className="font-medium">Expected</div>
            <div className="font-medium">Actual</div>
            
            <div>metaattr008 lookup</div>
            <div>Gender</div>
            <div className="font-mono text-xs">
              {results.metaattr008Lookup?.display_name || results.metaattr008Lookup?.name || 'NULL'}
            </div>
            
            <div>metaattr008val038 lookup</div>
            <div>Feminine</div>
            <div className="font-mono text-xs">
              {results.val038Lookup?.value || results.val038Lookup?.shorthand || 'NULL'}
            </div>
            
            <div>DisplayService attr lookup</div>
            <div>Gender</div>
            <div className="font-mono text-xs">
              {typeof results.displayServiceAttr === 'string' ? results.displayServiceAttr : 'ERROR'}
            </div>
            
            <div>DisplayService value lookup</div>
            <div>Feminine</div>
            <div className="font-mono text-xs">
              {typeof results.displayServiceValue === 'string' ? results.displayServiceValue : 'ERROR'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}