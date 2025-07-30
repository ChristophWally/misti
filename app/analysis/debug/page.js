'use client'

// app/analysis/debug.js
// DEBUG VERSION - Shows exactly what's happening with database queries
// Use this to diagnose why the analysis isn't finding known issues

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AnalysisDebugPage() {
  const [debugLogs, setDebugLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [rawData, setRawData] = useState({
    verbs: [],
    wordForms: [],
    sampleTags: []
  })

  // Add debug log
  const addLog = (message, type = 'info', data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const logEntry = {
      timestamp,
      message,
      type,
      data
    }
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`, data || '')
    setDebugLogs(prev => [...prev, logEntry])
  }

  // Clear logs
  const clearLogs = () => {
    setDebugLogs([])
    setRawData({ verbs: [], wordForms: [], sampleTags: [] })
  }

  // Test basic database connectivity
  const testDatabaseConnectivity = async () => {
    setIsRunning(true)
    clearLogs()
    
    addLog('🔍 Starting database connectivity test...', 'info')

    try {
      // Test 1: Basic connection to dictionary table
      addLog('📊 Test 1: Loading verbs from dictionary table...', 'info')
      
      const { data: allVerbs, error: verbError, count } = await supabase
        .from('dictionary')
        .select('id, italian, word_type, tags', { count: 'exact' })
        .eq('word_type', 'VERB')
        .limit(10)

      if (verbError) {
        addLog(`❌ Dictionary query failed: ${verbError.message}`, 'error', verbError)
        return
      }

      addLog(`✅ Dictionary query successful - Total VERB count: ${count}`, 'success')
      addLog(`📋 Loaded ${allVerbs?.length || 0} sample verbs`, 'info', allVerbs)

      if (!allVerbs || allVerbs.length === 0) {
        addLog('⚠️ No verbs found in dictionary table with word_type = "VERB"', 'warning')
        return
      }

      // Test 2: Check specific verb structure
      const sampleVerb = allVerbs[0]
      addLog(`🔍 Test 2: Examining sample verb structure`, 'info')
      addLog(`Sample verb: ${sampleVerb.italian}`, 'info', sampleVerb)

      // Test 3: Check what tags look like
      addLog('🏷️ Test 3: Examining tag structures...', 'info')
      const verbsWithTags = allVerbs.filter(v => v.tags && v.tags.length > 0)
      addLog(`Verbs with tags: ${verbsWithTags.length}/${allVerbs.length}`, 'info')
      
      if (verbsWithTags.length > 0) {
        const sampleTags = verbsWithTags.map(v => ({
          verb: v.italian,
          tags: v.tags,
          tagCount: Array.isArray(v.tags) ? v.tags.length : 'not-array'
        }))
        addLog('Sample tag structures:', 'info', sampleTags)
        setRawData(prev => ({ ...prev, sampleTags }))
      }

      // Test 4: Load word_forms for first verb
      addLog(`🔍 Test 4: Loading word_forms for "${sampleVerb.italian}"...`, 'info')
      
      const { data: forms, error: formsError } = await supabase
        .from('word_forms')
        .select('*')
        .eq('word_id', sampleVerb.id)

      if (formsError) {
        addLog(`❌ Word_forms query failed: ${formsError.message}`, 'error', formsError)
        return
      }

      addLog(`📊 Found ${forms?.length || 0} forms for ${sampleVerb.italian}`, 'info')
      
      if (forms && forms.length > 0) {
        addLog('Sample form structure:', 'info', forms[0])
        
        // Check form types
        const formTypes = [...new Set(forms.map(f => f.form_type))].filter(Boolean)
        addLog(`Form types found: [${formTypes.join(', ')}]`, 'info')
        
        // Check conjugation forms specifically
        const conjugationForms = forms.filter(f => f.form_type === 'conjugation')
        addLog(`Conjugation forms: ${conjugationForms.length}/${forms.length}`, 'info')
        
        // Check tag structures in forms
        const formsWithTags = forms.filter(f => f.tags && f.tags.length > 0)
        addLog(`Forms with tags: ${formsWithTags.length}/${forms.length}`, 'info')
        
        if (formsWithTags.length > 0) {
          const sampleFormTags = formsWithTags.slice(0, 3).map(f => ({
            form: f.form_text,
            tags: f.tags,
            tagCount: Array.isArray(f.tags) ? f.tags.length : 'not-array'
          }))
          addLog('Sample form tag structures:', 'info', sampleFormTags)
        }

        setRawData(prev => ({ ...prev, wordForms: forms }))
      } else {
        addLog(`⚠️ No word_forms found for ${sampleVerb.italian}`, 'warning')
      }

      // Test 5: Look for building blocks specifically
      addLog('🧱 Test 5: Searching for building blocks across all forms...', 'info')
      
      const { data: buildingBlockSearch, error: bbError } = await supabase
        .from('word_forms')
        .select('word_id, form_text, tags, form_type')
        .eq('word_id', sampleVerb.id)
        .or('tags.cs.{"participio-passato"},tags.cs.{"gerundio-presente"}')

      if (bbError) {
        addLog(`❌ Building block search failed: ${bbError.message}`, 'error', bbError)
      } else {
        addLog(`🔍 Building blocks found: ${buildingBlockSearch?.length || 0}`, 'info', buildingBlockSearch)
      }

      // Test 6: Check for high-priority verb tags
      addLog('⭐ Test 6: Checking for high-priority verb tags...', 'info')
      
      const highPriorityVerbs = allVerbs.filter(v => {
        if (!v.tags || !Array.isArray(v.tags)) return false
        return v.tags.some(tag => 
          tag.includes('freq-') || 
          tag.includes('CEFR-') || 
          tag.includes('top')
        )
      })

      addLog(`High-priority verbs found: ${highPriorityVerbs.length}/${allVerbs.length}`, 'info')
      if (highPriorityVerbs.length > 0) {
        addLog('Sample high-priority tags:', 'info', highPriorityVerbs.slice(0, 3).map(v => ({
          verb: v.italian,
          priorityTags: v.tags.filter(tag => 
            tag.includes('freq-') || tag.includes('CEFR-') || tag.includes('top')
          )
        })))
      }

      setRawData(prev => ({ ...prev, verbs: allVerbs }))
      addLog('✅ Database connectivity test completed', 'success')

    } catch (error) {
      addLog(`💥 Unexpected error: ${error.message}`, 'error', error)
    } finally {
      setIsRunning(false)
    }
  }

  // Test the original analyzer logic step by step
  const testAnalyzerLogic = async () => {
    setIsRunning(true)
    addLog('🧪 Testing FormGapAnalyzer logic step by step...', 'info')

    try {
      // Step 1: Try the high-priority verb filter
      addLog('🔍 Step 1: Testing high-priority verb filter...', 'info')
      
      const { data: priorityVerbs, error: priorityError } = await supabase
        .from('dictionary')
        .select('id, italian, word_type, tags')
        .eq('word_type', 'VERB')
        .or('tags.cs.{"freq-top100"},tags.cs.{"freq-top500"},tags.cs.{"CEFR-A1"},tags.cs.{"CEFR-A2"},tags.cs.{"CEFR-B1"}')
        .limit(10)

      if (priorityError) {
        addLog(`❌ Priority filter failed: ${priorityError.message}`, 'error', priorityError)
        addLog('💡 This might be why the analyzer finds no verbs to check!', 'warning')
      } else {
        addLog(`✅ Priority filter worked: ${priorityVerbs?.length || 0} verbs found`, 'success')
        if (priorityVerbs && priorityVerbs.length > 0) {
          addLog('Priority verbs found:', 'info', priorityVerbs.map(v => ({
            verb: v.italian,
            tags: v.tags
          })))
        } else {
          addLog('⚠️ No verbs match priority filter - this explains why analyzer finds nothing!', 'warning')
          addLog('💡 Your verbs might use different tag formats than expected', 'info')
        }
      }

      // Step 2: Test without priority filter
      addLog('🔍 Step 2: Testing without priority filter...', 'info')
      
      const { data: allVerbs, error: allError } = await supabase
        .from('dictionary')
        .select('id, italian, word_type, tags')
        .eq('word_type', 'VERB')
        .limit(5)

      if (allError) {
        addLog(`❌ All verbs query failed: ${allError.message}`, 'error', allError)
      } else if (allVerbs && allVerbs.length > 0) {
        addLog(`✅ Found ${allVerbs.length} verbs without priority filter`, 'success')
        
        // Step 3: Test building block detection logic
        const testVerb = allVerbs[0]
        addLog(`🧱 Step 3: Testing building block detection for "${testVerb.italian}"...`, 'info')
        
        const { data: testForms, error: testError } = await supabase
          .from('word_forms')
          .select('id, form_text, tags, form_type')
          .eq('word_id', testVerb.id)

        if (testError) {
          addLog(`❌ Forms query failed: ${testError.message}`, 'error', testError)
        } else {
          addLog(`📊 Found ${testForms?.length || 0} forms total`, 'info')
          
          const conjugationForms = (testForms || []).filter(f => f.form_type === 'conjugation')
          addLog(`📊 Conjugation forms: ${conjugationForms.length}`, 'info')
          
          // Test participle detection
          const participles = conjugationForms.filter(f => 
            f.tags?.includes('participio-passato')
          )
          addLog(`🔍 Forms with 'participio-passato' tag: ${participles.length}`, 'info', participles)
          
          // Test simple participle detection  
          const simpleParticiples = conjugationForms.filter(f => 
            f.tags?.includes('participio-passato') && f.tags?.includes('simple')
          )
          addLog(`🔍 Simple participles: ${simpleParticiples.length}`, 'info', simpleParticiples)
          
          // Test person tag detection
          const personTags = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']
          const hasPersonTags = (tags) => tags?.some(tag => personTags.includes(tag))
          
          const particlesWithoutPersons = simpleParticiples.filter(f => !hasPersonTags(f.tags))
          addLog(`🔍 Simple participles without person tags: ${particlesWithoutPersons.length}`, 'info', particlesWithoutPersons)
          
          if (particlesWithoutPersons.length === 0 && simpleParticiples.length > 0) {
            addLog('💡 Found participles but they all have person tags - this might be the issue!', 'warning')
          }
          
          // Show all unique tags for debugging
          const allTags = new Set()
          conjugationForms.forEach(f => {
            if (f.tags && Array.isArray(f.tags)) {
              f.tags.forEach(tag => allTags.add(tag))
            }
          })
          addLog(`🏷️ All unique tags in this verb's forms:`, 'info', Array.from(allTags).sort())
        }
      }

      addLog('✅ Analyzer logic test completed', 'success')

    } catch (error) {
      addLog(`💥 Analyzer test error: ${error.message}`, 'error', error)
    } finally {
      setIsRunning(false)
    }
  }

  // Get log color
  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Analysis Debug Tool
          </h1>
          <p className="text-gray-600">
            Debug version to see exactly what's happening with database queries and data structure.
          </p>
        </div>

        {/* Debug Controls */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testDatabaseConnectivity}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isRunning 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? '🔄 Testing...' : '🔍 Test Database Connectivity'}
            </button>
            
            <button
              onClick={testAnalyzerLogic}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isRunning 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isRunning ? '🔄 Testing...' : '🧪 Test Analyzer Logic'}
            </button>

            <button
              onClick={clearLogs}
              disabled={isRunning}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Debug Logs</h2>
          
          {debugLogs.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                No debug logs yet. Click a test button above to start debugging.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugLogs.map((log, index) => (
                <div key={index} className={`p-3 rounded border ${getLogColor(log.type)}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono text-gray-500 mt-0.5 flex-shrink-0">
                      {log.timestamp}
                    </span>
                    <span className="font-medium flex-1">
                      {log.message}
                    </span>
                  </div>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:underline">
                        Show data
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raw Data Summary */}
        {(rawData.verbs.length > 0 || rawData.wordForms.length > 0) && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Raw Data Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Verbs Loaded</h3>
                <div className="text-2xl font-bold text-blue-600">{rawData.verbs.length}</div>
                {rawData.verbs.length > 0 && (
                  <div className="text-sm text-blue-700 mt-2">
                    Sample: {rawData.verbs.slice(0, 3).map(v => v.italian).join(', ')}
                  </div>
                )}
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Word Forms</h3>
                <div className="text-2xl font-bold text-green-600">{rawData.wordForms.length}</div>
                {rawData.wordForms.length > 0 && (
                  <div className="text-sm text-green-700 mt-2">
                    Types: {[...new Set(rawData.wordForms.map(f => f.form_type))].join(', ')}
                  </div>
                )}
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Tag Samples</h3>
                <div className="text-2xl font-bold text-purple-600">{rawData.sampleTags.length}</div>
                {rawData.sampleTags.length > 0 && (
                  <div className="text-sm text-purple-700 mt-2">
                    Avg tags: {Math.round(rawData.sampleTags.reduce((sum, v) => sum + (Array.isArray(v.tags) ? v.tags.length : 0), 0) / rawData.sampleTags.length)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
