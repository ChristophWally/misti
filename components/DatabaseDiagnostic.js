'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DatabaseDiagnostic() {
  const [results, setResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const diagnostics = {}

    try {
      // Test 1: Basic dictionary table structure
      console.log('🔍 TEST 1: Basic dictionary query')
      const { data: basicDict, error: basicError } = await supabase
        .from('dictionary')
        .select('*')
        .limit(3)

      diagnostics.basicDictionary = {
        success: !basicError,
        error: basicError?.message,
        data: basicDict,
        count: basicDict?.length || 0,
        columns: basicDict?.[0] ? Object.keys(basicDict[0]) : []
      }

      // Test 2: Word translations table
      console.log('🔍 TEST 2: Word translations table')
      const { data: translations, error: transError } = await supabase
        .from('word_translations')
        .select('*')
        .limit(5)

      diagnostics.wordTranslations = {
        success: !transError,
        error: transError?.message,
        data: translations,
        count: translations?.length || 0,
        columns: translations?.[0] ? Object.keys(translations[0]) : []
      }

      // Test 3: Dictionary with translations relationship
      console.log('🔍 TEST 3: Dictionary with translations relationship')
      const { data: withTrans, error: relationError } = await supabase
        .from('dictionary')
        .select(`
          id,
          italian,
          word_type,
          tags,
          word_translations(
            id,
            translation,
            display_priority,
            context_metadata,
            usage_notes
          )
        `)
        .limit(3)

      diagnostics.relationshipQuery = {
        success: !relationError,
        error: relationError?.message,
        data: withTrans,
        count: withTrans?.length || 0,
        translationCounts: withTrans?.map(w => ({
          italian: w.italian,
          translationCount: w.word_translations?.length || 0
        }))
      }

      // Test 4: Enhanced Dictionary System
      console.log('🔍 TEST 4: Enhanced Dictionary System')
      try {
        const { EnhancedDictionarySystem } = await import('../lib/enhanced-dictionary-system')
        const dictSystem = new EnhancedDictionarySystem(supabase)
        const enhancedResults = await dictSystem.loadWordsWithTranslations('', {})
        
        diagnostics.enhancedSystem = {
          success: true,
          data: enhancedResults.slice(0, 2), // First 2 words
          count: enhancedResults.length,
          processedTranslationsCount: enhancedResults.map(w => ({
            italian: w.italian,
            processedCount: w.processedTranslations?.length || 0,
            rawTranslationsCount: w.word_translations?.length || 0
          }))
        }
      } catch (enhancedError) {
        diagnostics.enhancedSystem = {
          success: false,
          error: enhancedError.message
        }
      }

      // Test 5: Search functionality
      console.log('🔍 TEST 5: Search with "acqua"')
      const { data: searchResults, error: searchError } = await supabase
        .from('dictionary')
        .select(`
          id,
          italian,
          word_type,
          word_translations(id, translation)
        `)
        .ilike('italian', '%acqua%')

      diagnostics.searchTest = {
        success: !searchError,
        error: searchError?.message,
        data: searchResults,
        count: searchResults?.length || 0
      }

    } catch (error) {
      diagnostics.generalError = {
        success: false,
        error: error.message
      }
    }

    setResults(diagnostics)
    setIsLoading(false)
  }

  const renderTest = (testName, result) => {
    if (!result) return null

    return (
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          {result.success ? '✅' : '❌'} {testName}
        </h3>
        
        {result.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {result.success && (
          <div className="space-y-2">
            <p><strong>Count:</strong> {result.count}</p>
            
            {result.columns && (
              <div>
                <strong>Columns:</strong> 
                <code className="bg-gray-100 px-2 py-1 rounded ml-2">
                  {result.columns.join(', ')}
                </code>
              </div>
            )}

            {result.translationCounts && (
              <div>
                <strong>Translation Counts per Word:</strong>
                <ul className="list-disc ml-5">
                  {result.translationCounts.map((item, i) => (
                    <li key={i}>
                      <strong>{item.italian}:</strong> {item.translationCount} translations
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.processedTranslationsCount && (
              <div>
                <strong>Enhanced System Processing:</strong>
                <ul className="list-disc ml-5">
                  {result.processedTranslationsCount.map((item, i) => (
                    <li key={i}>
                      <strong>{item.italian}:</strong> {item.rawTranslationsCount} raw → {item.processedCount} processed
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Show Sample Data</summary>
                <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Diagnostic Tool</h1>
      
      <button
        onClick={runDiagnostics}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {Object.keys(results).length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Diagnostic Results</h2>
          
          {renderTest('Basic Dictionary Query', results.basicDictionary)}
          {renderTest('Word Translations Table', results.wordTranslations)}
          {renderTest('Dictionary + Translations Relationship', results.relationshipQuery)}
          {renderTest('Enhanced Dictionary System', results.enhancedSystem)}
          {renderTest('Search Functionality', results.searchTest)}
          
          {results.generalError && renderTest('General Error', results.generalError)}
        </div>
      )}
    </div>
  )
}
