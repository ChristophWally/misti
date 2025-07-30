‘use client’

// app/analysis/page.js
// SIMPLE Form Gap Analysis Interface - Just Find and Show Issues

import { useState } from ‘react’
import { supabase } from ‘../../lib/supabase’
import { FormGapAnalyzer } from ‘../../lib/form-gap-analyzer’

export default function AnalysisPage() {
const [isRunning, setIsRunning] = useState(false)
const [analysisResults, setAnalysisResults] = useState(null)
const [specificVerb, setSpecificVerb] = useState(’’)
const [error, setError] = useState(null)

// Initialize analyzer
const analyzer = new FormGapAnalyzer(supabase)

// Run simple analysis
const runCompleteAnalysis = async () => {
setIsRunning(true)
setError(null)
setAnalysisResults(null)

```
try {
  console.log('🔍 Starting simple analysis...')
  const results = await analyzer.runCompleteAnalysis()
  setAnalysisResults(results)
  console.log('✅ Analysis complete!')

} catch (error) {
  console.error('❌ Analysis failed:', error)
  setError(error.message)
} finally {
  setIsRunning(false)
}
```

}

// Run analysis for specific verb
const runSpecificVerbAnalysis = async () => {
if (!specificVerb.trim()) {
setError(‘Please enter a verb to analyze’)
return
}

```
setIsRunning(true)
setError(null)
setAnalysisResults(null)

try {
  console.log(`🔍 Analyzing specific verb: ${specificVerb}`)
  const result = await analyzer.analyzeSpecificVerb(specificVerb.trim())
  
  if (result.error) {
    setError(result.error)
  } else {
    // Convert to format compatible with results display
    setAnalysisResults({
      analyzedVerbs: 1,
      specificVerbResult: result,
      summary: {
        totalGaps: result.issues?.length || 0,
        verbsNeedingAttention: result.issues?.length > 0 ? 1 : 0
      }
    })
  }

} catch (error) {
  console.error('❌ Specific verb analysis failed:', error)
  setError(error.message)
} finally {
  setIsRunning(false)
}
```

}

// Get priority color
const getPriorityColor = (priority) => {
switch (priority) {
case ‘CRITICAL’: return ‘text-red-700 bg-red-100 border-red-300’
case ‘HIGH’: return ‘text-orange-700 bg-orange-100 border-orange-300’
case ‘MEDIUM’: return ‘text-yellow-700 bg-yellow-100 border-yellow-300’
default: return ‘text-gray-700 bg-gray-100 border-gray-300’
}
}

return (
<div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
<div className="bg-white rounded-lg shadow-lg">

```
    {/* Header */}
    <div className="border-b border-gray-200 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🔍 Form Gap Analyzer (Simple)
      </h1>
      <p className="text-gray-600">
        Simple tool to find obvious issues in your verb forms.
      </p>
    </div>

    {/* Analysis Controls */}
    <div className="p-6 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Complete Analysis */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">📊 Complete Analysis</h3>
          <p className="text-sm text-gray-600">
            Check first 10 verbs for obvious issues like deprecated forms and missing building blocks.
          </p>
          <button
            onClick={runCompleteAnalysis}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              isRunning 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isRunning ? '🔄 Analyzing...' : '🚀 Find Issues'}
          </button>
        </div>

        {/* Specific Verb Analysis */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">🎯 Specific Verb Analysis</h3>
          <p className="text-sm text-gray-600">
            Check a specific verb for issues.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={specificVerb}
              onChange={(e) => setSpecificVerb(e.target.value)}
              placeholder="Enter verb (e.g., 'parlare')"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            />
            <button
              onClick={runSpecificVerbAnalysis}
              disabled={isRunning || !specificVerb.trim()}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                isRunning || !specificVerb.trim()
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Error Display */}
    {error && (
      <div className="p-6 border-b border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-600 text-xl mr-2">❌</span>
            <div>
              <h4 className="text-red-800 font-semibold">Analysis Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Progress Display */}
    {isRunning && (
      <div className="p-6 border-b border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
            <span className="text-blue-800 font-semibold">
              Analyzing verbs...
            </span>
          </div>
        </div>
      </div>
    )}

    {/* Results Display */}
    {analysisResults && (
      <div className="p-6">
        {/* Summary Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Analysis Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{analysisResults.analyzedVerbs}</div>
              <div className="text-sm text-blue-800">Verbs Analyzed</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{analysisResults.summary?.totalGaps || 0}</div>
              <div className="text-sm text-red-800">Issues Found</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{analysisResults.summary?.criticalIssues || 0}</div>
              <div className="text-sm text-orange-800">Critical Issues</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{analysisResults.summary?.verbsNeedingAttention || 0}</div>
              <div className="text-sm text-green-800">Verbs Need Attention</div>
            </div>
          </div>
        </div>

        {/* Issues Found */}
        {analysisResults.issues && analysisResults.issues.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚨 Issues Found</h3>
            <div className="space-y-3">
              {analysisResults.issues.map((issue, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(issue.priority)}`}>
                  <div className="flex items-start">
                    <span className="text-lg mr-2">
                      {issue.priority === 'CRITICAL' ? '🚨' : 
                       issue.priority === 'HIGH' ? '⚠️' : 
                       issue.priority === 'MEDIUM' ? '📝' : 'ℹ️'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {issue.verb ? `${issue.verb}: ` : ''}{issue.description}
                      </h4>
                      <p className="text-sm mt-1 opacity-90">{issue.action}</p>
                      {issue.forms && (
                        <div className="text-xs mt-2 opacity-75">
                          Affected forms: {issue.forms.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specific Verb Results */}
        {analysisResults.specificVerbResult && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Analysis for "{analysisResults.specificVerbResult.verb}"
            </h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Total Forms:</strong> {analysisResults.specificVerbResult.totalForms}
              </div>
            </div>

            {analysisResults.specificVerbResult.isComplete ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <span className="text-green-800 font-semibold">
                    No obvious issues found! This verb looks good.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {analysisResults.specificVerbResult.issues.map((issue, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(issue.priority)}`}>
                    <h4 className="font-semibold">{issue.description}</h4>
                    <p className="text-sm mt-1 opacity-90">{issue.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Issues Found */}
        {analysisResults.issues && analysisResults.issues.length === 0 && !analysisResults.specificVerbResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <span className="text-green-600 text-2xl">✅</span>
            <h3 className="text-green-800 font-semibold text-lg mt-2">No Issues Found</h3>
            <p className="text-green-700 mt-1">
              All analyzed verbs look good! No obvious problems detected.
            </p>
          </div>
        )}

        {/* Export Results */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(analysisResults, null, 2)
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
              const exportFileDefaultName = `simple-analysis-${new Date().toISOString().split('T')[0]}.json`
              
              const linkElement = document.createElement('a')
              linkElement.setAttribute('href', dataUri)
              linkElement.setAttribute('download', exportFileDefaultName)
              linkElement.click()
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            📥 Export Results as JSON
          </button>
        </div>
      </div>
    )}

    {/* Instructions */}
    {!analysisResults && !isRunning && (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Simple Analysis Tool</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2 text-blue-800">
            <p><strong>Complete Analysis:</strong> Quickly checks your first 10 verbs for obvious problems.</p>
            <p><strong>What it finds:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Deprecated forms (like "imperativo-negativo")</li>
              <li>• Missing building blocks (past participles, gerunds)</li>
              <li>• Stored compound forms that should be generated</li>
            </ul>
            <p><strong>Simple & Fast:</strong> No complex logic, just finds obvious issues!</p>
          </div>
        </div>
      </div>
    )}

  </div>
</div>
```

)
}