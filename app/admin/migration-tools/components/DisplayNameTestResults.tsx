'use client';

import { useState, useEffect } from 'react';
import { CoreTagDisplay, OptionalTagDisplay, AttributeNameDisplay } from './TagDisplayComponents';

/**
 * Component to test display name functionality with various scenarios
 */
export default function DisplayNameTestResults() {
  const [testCases] = useState([
    // Test cases that should trigger metaval lookup
    { type: 'core', attributeName: 'metaattr008', value: 'metaattr008val038', expected: 'Gender: Feminine' },
    { type: 'core', attributeName: 'metaattr008', value: 'metaattr008val037', expected: 'Gender: Masculine' },
    { type: 'core', attributeName: 'metaattr003', value: 'metaattr003val015', expected: 'Grammatical Person: First Person' },
    
    // Test cases that should use fallback formatting
    { type: 'core', attributeName: 'metaattr999', value: 'metaattr999val999', expected: 'Metaattr999: Metaattr999val999' },
    { type: 'core', attributeName: 'word_type', value: 'noun', expected: 'Word Type: noun' },
    { type: 'core', attributeName: 'auxiliary', value: 'essere', expected: 'Auxiliary: essere' },
    
    // Attribute name only tests  
    { type: 'attribute', attributeName: 'metaattr008', value: '', expected: 'Gender' },
    { type: 'attribute', attributeName: 'word_type', value: '', expected: 'Word Type' },
    { type: 'attribute', attributeName: 'metaattr999', value: '', expected: 'Metaattr999' },
    
    // Optional tag tests
    { type: 'optional', attributeName: '', value: 'metaattr008val038', expected: 'Feminine' },
    { type: 'optional', attributeName: '', value: 'irregular', expected: 'irregular' },
  ]);

  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Initialize results array
    setResults(testCases.map((testCase, index) => ({ 
      ...testCase, 
      index, 
      status: 'loading', 
      actual: 'Loading...' 
    })));
  }, [testCases]);

  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Display Name Test Results</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-medium text-blue-800">What This Tests</h4>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• CoreTagDisplay component rendering with metaval lookups</li>
            <li>• AttributeNameDisplay component for headers/labels</li>
            <li>• OptionalTagDisplay for optional tags</li>
            <li>• Fallback formatting when metaval data is missing</li>
          </ul>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Input</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual Rendering</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testCases.map((testCase, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {testCase.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    {testCase.type === 'core' && `${testCase.attributeName}: ${testCase.value}`}
                    {testCase.type === 'attribute' && testCase.attributeName}
                    {testCase.type === 'optional' && testCase.value}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {testCase.expected}
                  </td>
                  <td className="px-4 py-3">
                    {testCase.type === 'core' && (
                      <CoreTagDisplay 
                        attributeName={testCase.attributeName} 
                        value={testCase.value} 
                      />
                    )}
                    {testCase.type === 'attribute' && (
                      <AttributeNameDisplay 
                        stableId={testCase.attributeName} 
                      />
                    )}
                    {testCase.type === 'optional' && (
                      <OptionalTagDisplay 
                        tag={testCase.value} 
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                      Manual Check Required
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h4 className="font-medium text-green-800">Success Criteria</h4>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Components should show loading state briefly, then display formatted names</li>
            <li>• If metaval lookup works: "Gender: Feminine" instead of "metaattr008: metaattr008val038"</li>
            <li>• If metaval lookup fails: "Metaattr008: Metaattr008val038" instead of raw stable IDs</li>
            <li>• Normal attributes like "word_type" should show as "Word Type"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}