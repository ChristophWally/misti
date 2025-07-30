'use client'

// app/analysis/page.js
// Web-Based Form Gap Analysis Interface for Story 002.001
// Run verb form analysis directly in the browser - no CLI needed

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FormGapAnalyzer } from '../../lib/form-gap-analyzer'

export default function AnalysisPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [progress, setProgress] = useState({ percent: 0, processed: 0, total: 0 })
  const [selectedAnalysis, setSelectedAnalysis] = useState('complete')
  const [specificVerb, setSpecificVerb] = useState('')
  const [error, setError] = useState(null)

  // Initialize analyzer
  const analyzer = new FormGapAnalyzer(supabase)

  // Run complete analysis
  const runCompleteAnalysis = async () => {
    setIsRunning(true)
    setError(null)
    setAnalysisResults(null)
    setProgress({ percent: 0, processed: 0, total: 0 })

    try {
      console.log('🔍 Starting complete form gap analysis...')
      
      const results = await analyzer.runCompleteAnalysis({
        limitToHighPriority: true,
        includePhoneticGaps: true,
        checkTagConsistency: true,
        maxVerbs: 50 // Limit for web performance
      })

      setAnalysisResults(results)
      console.log('✅ Analysis complete!')

    } catch (error) {
      console.error('❌ Analysis failed:', error)
      setError(error.message)
    } finally {
      setIsRunning(false)
    }
  }

  // Run analysis for specific verb
  const runSpecificVerbAnalysis = async () => {
    if (!specificVerb.trim()) {
      setError('Please enter a verb to analyze')
      return
    }

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
          totalVerbs: 1,
          specificVerbResult: result,
          summary: {
            totalGaps: Object.values(result.gaps).flat().length,
            verbsNeedingAttention: Object.values(result.gaps).flat().length > 0 ? 1 : 0
          }
        })
      }

    } catch (error) {
      console.error('❌ Specific verb analysis failed:', error)
      setError(error.message)
    } finally {
      setIsRunning(false)
    }
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-300'
      case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Form Gap Analyzer
          </h1>
          <p className="text-gray-600">
            Web-based tool to identify missing verb forms and tag inconsistencies in your database.
          </p>
        </div>

        {/* Analysis Controls */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Complete Analysis */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">📊 Complete Analysis</h3>
              <p className="text-sm text-gray-600">
                Analyze top 50 high-priority verbs for missing forms, building blocks, and tag issues.
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
                {isRunning ? '🔄 Analyzing...' : '🚀 Run Complete Analysis'}
              </button>
            </div>

            {/* Specific Verb Analysis */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Specific Verb Analysis</h3>
              <p className="text-sm text-gray-600">
                Analyze a specific verb for detailed gap information.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specificVerb}
                  onChange={(e) => setSpecificVerb(e.target.value)}
                  placeholder="Enter verb (e.g., 'finire')"
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
                  {selectedAnalysis === 'specific' 
                    ? `Analyzing ${specificVerb}...` 
                    : `Analyzing verbs... ${progress.processed}/${progress.total}`}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Analysis Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResults.analyzedVerbs}</div>
                  <div className="text-sm text-blue-800">Verbs Analyzed</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{analysisResults.summary?.totalGaps || 0}</div>
                  <div className="text-sm text-red-800">Total Gaps Found</div>
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

            {/* Recommended Actions */}
            {analysisResults.summary?.recommendedActions && analysisResults.summary.recommendedActions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Recommended Actions</h3>
                <div className="space-y-3">
                  {analysisResults.summary.recommendedActions.map((action, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(action.priority)}`}>
                      <div className="flex items-start">
                        <span className="text-lg mr-2">
                          {action.priority === 'CRITICAL' ? '🚨' : action.priority === 'HIGH' ? '⚠️' : '📝'}
                        </span>
                        <div>
                          <h4 className="font-semibold">{action.action}</h4>
                          <p className="text-sm mt-1">{action.description}</p>
                          <p className="text-xs mt-1 opacity-75">{action.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Building Blocks */}
            {analysisResults.missingBuildingBlocks && analysisResults.missingBuildingBlocks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🧱 Missing Building Blocks (Critical)</h3>
                <div className="space-y-4">
                  {analysisResults.missingBuildingBlocks.map((item, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        {item.verb.italian} ({item.verb.tags?.join(', ')})
                      </h4>
                      <div className="space-y-2">
                        {item.gaps.map((gap, gapIndex) => (
                          <div key={gapIndex} className={`p-3 rounded border ${getSeverityColor(gap.severity)}`}>
                            <div className="font-medium">{gap.description}</div>
                            <div className="text-sm mt-1">{gap.impact}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Gaps */}
            {analysisResults.highPriorityGaps && analysisResults.highPriorityGaps.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⭐ High Priority Verbs with Gaps</h3>
                <div className="space-y-4">
                  {analysisResults.highPriorityGaps.map((item, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-1">
                        {item.verb.italian}
                      </h4>
                      <p className="text-sm text-orange-700 mb-3">{item.priorityReason}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.buildingBlockGaps.length > 0 && (
                          <div>
                            <h5 className="font-medium text-orange-800 mb-1">Building Block Issues:</h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {item.buildingBlockGaps.map((gap, gapIndex) => (
                                <li key={gapIndex}>• {gap.description}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.conjugationGaps.length > 0 && (
                          <div>
                            <h5 className="font-medium text-orange-800 mb-1">Conjugation Issues:</h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {item.conjugationGaps.slice(0, 3).map((gap, gapIndex) => (
                                <li key={gapIndex}>• {gap.description}</li>
                              ))}
                              {item.conjugationGaps.length > 3 && (
                                <li>• ... and {item.conjugationGaps.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Inconsistencies */}
            {analysisResults.tagInconsistencies && analysisResults.tagInconsistencies.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏷️ Tag Inconsistencies</h3>
                <div className="space-y-4">
                  {analysisResults.tagInconsistencies.map((issue, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">{issue.description}</h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                      <div className="text-xs text-yellow-600">
                        <strong>Affected tags:</strong> {issue.tags.join(', ')}
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
                
                {Object.values(analysisResults.specificVerbResult.gaps).every(gapArray => gapArray.length === 0) ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-green-600 text-xl mr-2">✅</span>
                      <span className="text-green-800 font-semibold">
                        No gaps found! This verb appears to be complete.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(analysisResults.specificVerbResult.gaps).map(([gapType, gaps]) => 
                      gaps.length > 0 && (
                        <div key={gapType} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2 capitalize">
                            {gapType.replace(/([A-Z])/g, ' $1')} Issues:
                          </h4>
                          <div className="space-y-2">
                            {gaps.map((gap, gapIndex) => (
                              <div key={gapIndex} className="text-sm text-gray-700">
                                • {gap.description || gap.type}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Export Results */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(analysisResults, null, 2)
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
                  const exportFileDefaultName = `form-gap-analysis-${new Date().toISOString().split('T')[0]}.json`
                  
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 How to Use This Tool</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-blue-800">
                <p><strong>Complete Analysis:</strong> Checks your top 50 high-priority verbs for missing forms, building blocks, and tag issues.</p>
                <p><strong>Specific Verb Analysis:</strong> Detailed analysis of any individual verb you want to examine.</p>
                <p><strong>Results:</strong> Shows exactly what needs to be fixed, prioritized by importance.</p>
                <p><strong>No CLI Required:</strong> Everything runs in your browser through this web interface!</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
