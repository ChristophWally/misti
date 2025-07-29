'use client'

// app/debug/page.js
// Auxiliary System Debugger - Uses Real Supabase Data

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { EnhancedDictionarySystem } from '../../lib/enhanced-dictionary-system'
import { AuxiliaryPatternService } from '../../lib/auxiliary-pattern-service'

export default function DebugPage() {
  const [debugData, setDebugData] = useState({
    word: null,
    translations: [],
    selectedTranslationId: null,
    auxiliaryLookup: null,
    storedForms: [],
    buildingBlocks: {
      participle: null,
      gerund: null
    },
    auxiliaryPatterns: [],
    generatedCompounds: [],
    errors: [],
    logs: []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [dictionarySystem] = useState(() => new EnhancedDictionarySystem(supabase))
  const [auxiliaryService] = useState(() => new AuxiliaryPatternService(supabase))

  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    console.log(logEntry)
    
    setDebugData(prev => ({
      ...prev,
      logs: [...prev.logs, { message, type, timestamp }]
    }))
  }

  // Simulate the getAuxiliaryForTranslation function from ConjugationModal
  const getAuxiliaryForTranslation = (translationId, translations) => {
    if (!translationId) return 'avere'

    const translation = translations.find(t => t.id === translationId)
    const auxiliary = translation?.context_metadata?.auxiliary

    addLog(`Auxiliary lookup - Translation: "${translation?.translation}", Result: ${auxiliary || 'avere'}`, 'info')

    return auxiliary || 'avere'
  }

  // Simulate building block detection from ConjugationModal
  const findBuildingBlocks = (storedForms) => {
    addLog(`Searching for building blocks in ${storedForms.length} stored forms`, 'info')

    const participle = storedForms.find(f =>
      f.tags?.includes('participio-passato') &&
      f.tags?.includes('simple') &&
      !f.tags?.includes('io') &&
      !f.tags?.includes('tu') &&
      !f.tags?.includes('lui')
    )

    const gerund = storedForms.find(f =>
      f.tags?.includes('gerundio-presente') &&
      f.tags?.includes('simple') &&
      !f.tags?.includes('io') &&
      !f.tags?.includes('tu') &&
      !f.tags?.includes('lui')
    )

    if (participle) {
      addLog(`✅ Participle found: "${participle.form_text}" with tags: [${participle.tags?.join(', ')}]`, 'success')
    } else {
      addLog(`❌ No participle found. Need: participio-passato + simple tags, no person tags`, 'error')
    }

    if (gerund) {
      addLog(`✅ Gerund found: "${gerund.form_text}" with tags: [${gerund.tags?.join(', ')}]`, 'success')
    } else {
      addLog(`⚠️ No gerund found. Need: gerundio-presente + simple tags, no person tags`, 'warning')
    }

    return { participle, gerund }
  }

  // Test auxiliary patterns table - COMPREHENSIVE RLS DIAGNOSTIC
  const testAuxiliaryPatterns = async () => {
    addLog('Testing auxiliary_patterns table...', 'info')
    
    try {
      // Get current user context
      const { data: user, error: userError } = await supabase.auth.getUser()
      if (userError) {
        addLog(`🔍 User context error: ${userError.message}`, 'warning')
      } else {
        addLog(`🔍 Current user: ${user?.user?.email || 'Anonymous'}`, 'info')
        addLog(`🔍 User ID: ${user?.user?.id || 'None'}`, 'info')
      }

      // Test 1: Basic select with detailed logging
      addLog('🔍 Test 1: Basic select from auxiliary_patterns', 'info')
      const { data: patterns, error, status, statusText } = await supabase
        .from('auxiliary_patterns')
        .select('*')
        .limit(5)

      addLog(`📊 Response status: ${status} ${statusText}`, 'info')

      if (error) {
        addLog(`❌ Auxiliary patterns error: ${error.message}`, 'error')
        addLog(`📋 Error code: ${error.code}`, 'error')
        addLog(`📋 Error hint: ${error.hint || 'None'}`, 'error')
        addLog(`📋 Error details: ${error.details || 'None'}`, 'error')
        
        // Check if it's an RLS error
        if (error.message.includes('row-level security') || error.message.includes('RLS') || error.code === '42501') {
          addLog('🔒 CONFIRMED: This is an RLS (Row Level Security) issue!', 'error')
        }
        
        return []
      }

      if (!patterns || patterns.length === 0) {
        addLog('❌ Query successful but returned 0 rows - likely RLS blocking access', 'error')
        addLog('🔒 DIAGNOSIS: Table has data (56 rows) but RLS policies prevent access', 'error')
        
        // Test 2: Try to count rows (different permission)
        addLog('🔍 Test 2: Trying to count rows in auxiliary_patterns', 'info')
        const { count, error: countError } = await supabase
          .from('auxiliary_patterns')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          addLog(`❌ Count error: ${countError.message}`, 'error')
        } else {
          addLog(`📊 Total rows returned by count: ${count}`, 'info')
          if (count === 0) {
            addLog('🔒 Count also returns 0 - RLS is blocking ALL access to this table', 'error')
          }
        }

        // Test 3: Try specific query that should work
        addLog('🔍 Test 3: Trying specific query for passato-prossimo', 'info')
        const { data: specificData, error: specificError } = await supabase
          .from('auxiliary_patterns')
          .select('compound_tense_tag, avere_auxiliary, essere_auxiliary')
          .eq('compound_tense_tag', 'passato-prossimo')
          .eq('person', 'prima-persona')
          .eq('plurality', 'singolare')
          .single()

        if (specificError) {
          addLog(`❌ Specific query error: ${specificError.message}`, 'error')
        } else if (specificData) {
          addLog(`✅ Specific query worked: ${JSON.stringify(specificData)}`, 'success')
        } else {
          addLog('❌ Specific query returned null', 'error')
        }
        
        return []
      }

      addLog(`✅ Found ${patterns.length} auxiliary patterns`, 'success')
      patterns.forEach((pattern, i) => {
        addLog(`  ${i + 1}. ${pattern.compound_tense_tag} ${pattern.person} ${pattern.plurality}: ${pattern.avere_auxiliary} / ${pattern.essere_auxiliary}`, 'info')
      })
      return patterns
    } catch (error) {
      addLog(`❌ Auxiliary patterns exception: ${error.message}`, 'error')
      addLog(`📋 Exception details: ${JSON.stringify(error)}`, 'error')
      return []
    }
  }

  // Test compound generation
  const testCompoundGeneration = async (participle, auxiliaryType) => {
    if (!participle) {
      addLog('❌ Cannot test compound generation - no participle', 'error')
      return []
    }

    addLog(`Testing compound generation with auxiliary: ${auxiliaryType}`, 'info')

    try {
      const generated = await auxiliaryService.generateCompoundForm(
        auxiliaryType,
        'passato-prossimo',
        'prima-persona',
        'singolare',
        participle.form_text,
        'I finished'
      )

      if (generated) {
        addLog(`✅ Generated compound: "${generated.form_text}"`, 'success')
        return [generated]
      } else {
        addLog('❌ Compound generation returned null', 'error')
        return []
      }
    } catch (error) {
      addLog(`❌ Compound generation error: ${error.message}`, 'error')
      return []
    }
  }

  // Main debug function
  const runDebugTest = async () => {
    setIsLoading(true)
    setDebugData(prev => ({ ...prev, logs: [], errors: [] }))
    
    addLog('🔄 Starting auxiliary system debug test for "finire"', 'info')

    try {
      // Step 1: Load word
      addLog('Step 1: Loading word "finire" from dictionary', 'info')
      const { data: words, error: wordError } = await supabase
        .from('dictionary')
        .select('*')
        .eq('italian', 'finire')
        .single()

      if (wordError || !words) {
        addLog(`❌ Failed to load word: ${wordError?.message || 'Not found'}`, 'error')
        return
      }

      addLog(`✅ Word loaded: ${words.italian} (${words.word_type})`, 'success')

      // Step 2: Load translations
      addLog('Step 2: Loading translations', 'info')
      const { data: translations, error: translationError } = await supabase
        .from('word_translations')
        .select(`
          id,
          translation,
          display_priority,
          context_metadata,
          usage_notes,
          frequency_estimate
        `)
        .eq('word_id', words.id)
        .order('display_priority')

      if (translationError) {
        addLog(`❌ Failed to load translations: ${translationError.message}`, 'error')
        return
      }

      addLog(`✅ Loaded ${translations?.length || 0} translations`, 'success')
      translations?.forEach((t, i) => {
        addLog(`  ${i + 1}. "${t.translation}" (priority: ${t.display_priority}, auxiliary: ${t.context_metadata?.auxiliary || 'undefined'})`, 'info')
      })

      // Step 3: Set selected translation
      const primaryTranslation = translations?.find(t => t.display_priority === 1) || translations?.[0]
      const selectedTranslationId = primaryTranslation?.id

      if (selectedTranslationId) {
        addLog(`✅ Selected translation: "${primaryTranslation.translation}" (ID: ${selectedTranslationId})`, 'success')
      } else {
        addLog('❌ No translation selected', 'error')
      }

      // Step 4: Test auxiliary lookup
      const auxiliaryLookup = selectedTranslationId 
        ? getAuxiliaryForTranslation(selectedTranslationId, translations)
        : null

      // Step 5: Load word forms
      addLog('Step 5: Loading word forms', 'info')
      const { data: storedForms, error: formsError } = await supabase
        .from('word_forms')
        .select(`
          *,
          form_translations (
            word_translation_id,
            translation,
            assignment_method
          )
        `)
        .eq('word_id', words.id)
        .eq('form_type', 'conjugation')

      if (formsError) {
        addLog(`❌ Failed to load forms: ${formsError.message}`, 'error')
        return
      }

      addLog(`✅ Loaded ${storedForms?.length || 0} word forms`, 'success')

      // Step 6: Find building blocks
      const buildingBlocks = findBuildingBlocks(storedForms || [])

      // Step 7: Test auxiliary patterns
      const auxiliaryPatterns = await testAuxiliaryPatterns()

      // Step 8: Test compound generation
      let generatedCompounds = []
      if (buildingBlocks.participle && auxiliaryLookup) {
        generatedCompounds = await testCompoundGeneration(buildingBlocks.participle, auxiliaryLookup)
      }

      // Update state
      setDebugData(prev => ({
        ...prev,
        word: words,
        translations: translations || [],
        selectedTranslationId,
        auxiliaryLookup,
        storedForms: storedForms || [],
        buildingBlocks,
        auxiliaryPatterns,
        generatedCompounds
      }))

      addLog('🎯 Debug test completed', 'success')

    } catch (error) {
      addLog(`❌ Debug test failed: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Test all auxiliary lookups
  const testAllAuxiliaryLookups = () => {
    addLog('🧪 Testing auxiliary lookup for all translations:', 'info')
    debugData.translations.forEach((translation, index) => {
      const auxiliary = getAuxiliaryForTranslation(translation.id, debugData.translations)
      addLog(`  ${index + 1}. "${translation.translation}" → ${auxiliary}`, 'info')
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🔧 Auxiliary System Debugger - REAL DATA
          </h1>
          <button
            onClick={runDebugTest}
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isLoading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isLoading ? '🔄 Testing...' : '🔍 Test "Finire" System'}
          </button>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{debugData.translations.length}</div>
            <div className="text-sm text-blue-800">Translations</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{debugData.storedForms.length}</div>
            <div className="text-sm text-green-800">Stored Forms</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {debugData.buildingBlocks.participle ? '✅' : '❌'}
            </div>
            <div className="text-sm text-purple-800">Participle Found</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{debugData.generatedCompounds.length}</div>
            <div className="text-sm text-orange-800">Generated Forms</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Translations */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-800">🌍 Translations</h3>
              {debugData.translations.length > 0 && (
                <button
                  onClick={testAllAuxiliaryLookups}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Test All
                </button>
              )}
            </div>
            <div className="space-y-2">
              {debugData.translations.map((translation, index) => (
                <div 
                  key={translation.id} 
                  className={`p-3 rounded border-2 ${
                    translation.id === debugData.selectedTranslationId 
                      ? 'border-green-500 bg-green-100' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{index + 1}. {translation.translation}</span>
                    {translation.id === debugData.selectedTranslationId && (
                      <span className="text-green-600 text-sm font-bold">✓ SELECTED</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                    <div><strong>Priority:</strong> {translation.display_priority}</div>
                    <div><strong>Auxiliary:</strong> 
                      <span className={`ml-1 px-1 rounded ${
                        translation.context_metadata?.auxiliary === 'avere' ? 'bg-blue-100 text-blue-800' :
                        translation.context_metadata?.auxiliary === 'essere' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {translation.context_metadata?.auxiliary || 'undefined'}
                      </span>
                    </div>
                    <div><strong>Usage:</strong> {translation.context_metadata?.usage || 'undefined'}</div>
                    <div><strong>Notes:</strong> {translation.usage_notes || 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Building Blocks */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-800 mb-3">🧱 Building Blocks</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded border">
                <div className="font-semibold text-sm mb-2">Participle (for compound tenses)</div>
                {debugData.buildingBlocks.participle ? (
                  <div className="text-sm space-y-1">
                    <div><strong>Form:</strong> <code className="bg-gray-100 px-1 rounded">{debugData.buildingBlocks.participle.form_text}</code></div>
                    <div><strong>Tags:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugData.buildingBlocks.participle.tags?.join(', ')}</code></div>
                    <div><strong>Form Translations:</strong> {debugData.buildingBlocks.participle.form_translations?.length || 0}</div>
                  </div>
                ) : (
                  <span className="text-red-600 font-semibold">❌ Not found</span>
                )}
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="font-semibold text-sm mb-2">Gerund (for progressive tenses)</div>
                {debugData.buildingBlocks.gerund ? (
                  <div className="text-sm space-y-1">
                    <div><strong>Form:</strong> <code className="bg-gray-100 px-1 rounded">{debugData.buildingBlocks.gerund.form_text}</code></div>
                    <div><strong>Tags:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{debugData.buildingBlocks.gerund.tags?.join(', ')}</code></div>
                    <div><strong>Form Translations:</strong> {debugData.buildingBlocks.gerund.form_translations?.length || 0}</div>
                  </div>
                ) : (
                  <span className="text-orange-600 font-semibold">⚠️ Not found</span>
                )}
              </div>
            </div>
          </div>

          {/* Auxiliary Lookup Result */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">🔍 Auxiliary Lookup Result</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Selected Translation ID:</strong> 
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{debugData.selectedTranslationId || 'None'}</code>
              </div>
              <div className="text-sm">
                <strong>Auxiliary Result:</strong>
                <span className={`ml-2 px-3 py-1 rounded font-bold ${
                  debugData.auxiliaryLookup === 'avere' ? 'bg-blue-100 text-blue-800' : 
                  debugData.auxiliaryLookup === 'essere' ? 'bg-pink-100 text-pink-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {debugData.auxiliaryLookup || 'undefined'}
                </span>
              </div>
            </div>
          </div>

          {/* Generated Compounds */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚡ Generated Compounds</h3>
            {debugData.generatedCompounds.length > 0 ? (
              <div className="space-y-2">
                {debugData.generatedCompounds.map((compound, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <div className="font-semibold">{compound.form_text}</div>
                    <div className="text-xs text-gray-600">
                      <div>Translation: {compound.translation}</div>
                      <div>Tags: {compound.tags?.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-yellow-700">No compounds generated yet</div>
            )}
          </div>
        </div>

        {/* Debug Logs */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Debug Logs ({debugData.logs.length})</h3>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {debugData.logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click "Test Finire System" to start.</div>
            ) : (
              debugData.logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>


      </div>
    </div>
  )
}
