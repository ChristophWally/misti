'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';

/**
 * Simple test to check what data we actually have
 */
export default function SimpleMetavalTest() {
  const [results, setResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check what's actually in the dictionary table
      const { data: dictData, error: dictError } = await supabase
        .from('dictionary')
        .select('id, italian, english, metadata, optional_tags')
        .limit(5);

      testResults.dictionarySample = {
        error: dictError?.message,
        data: dictData || []
      };

      // Test 2: Check if meta tables exist
      const { data: metaAttr, error: metaAttrErr } = await supabase
        .from('meta_attributes')
        .select('*')
        .limit(3);

      testResults.metaAttributes = {
        error: metaAttrErr?.message,
        data: metaAttr || []
      };

      const { data: metaVal, error: metaValErr } = await supabase
        .from('meta_values')
        .select('*')
        .limit(3);

      testResults.metaValues = {
        error: metaValErr?.message,
        data: metaVal || []
      };

      // Test 3: Look for the specific stable IDs mentioned in the issue
      if (!metaAttrErr) {
        const { data: attr008, error: attr008Err } = await supabase
          .from('meta_attributes')
          .select('*')
          .eq('stable_id', 'metaattr008');

        testResults.metaattr008 = {
          error: attr008Err?.message,
          data: attr008 || []
        };
      }

      if (!metaValErr) {
        const { data: val038, error: val038Err } = await supabase
          .from('meta_values')
          .select('*')
          .eq('stable_id', 'metaattr008val038');

        testResults.val038 = {
          error: val038Err?.message,
          data: val038 || []
        };
      }

      // Test 4: Look for any records that have metaattr008 in their metadata
      const { data: recordsWithMetaattr, error: recordsErr } = await supabase
        .from('dictionary')
        .select('id, italian, metadata')
        .not('metadata', 'is', null)
        .limit(10);

      if (!recordsErr && recordsWithMetaattr) {
        const metaattrRecords = recordsWithMetaattr.filter(record => 
          record.metadata && JSON.stringify(record.metadata).includes('metaattr')
        );
        testResults.recordsWithStableIds = metaattrRecords;
      }

      setResults(testResults);

    } catch (err) {
      setResults({ error: String(err) });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Simple Metaval Database Test</h3>
        <button
          onClick={runTest}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="border rounded p-4">
              <h4 className="font-medium mb-2">{key}</h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800">What We're Looking For:</h4>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• meta_attributes table with stable_id="metaattr008" and display_name="Gender"</li>
          <li>• meta_values table with stable_id="metaattr008val038" and value="Feminine"</li>
          <li>• Dictionary records with metadata containing these stable IDs</li>
        </ul>
      </div>
    </div>
  );
}