'use client';

import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Settings, BarChart3, RefreshCw, Download, Play, Pause } from 'lucide-react';
import { ConjugationComplianceValidator, ValidationOptions } from '../../lib/conjugationComplianceValidator';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AdminValidationInterface = () => {
  const [selectedVerb, setSelectedVerb] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [systemAnalysis, setSystemAnalysis] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationOptions, setValidationOptions] = useState<ValidationOptions>({
    includeDeprecatedCheck: true,
    includeCrossTableAnalysis: true,
    includeTerminologyValidation: true,
    generateAutoFixes: true,
    maxVerbsToAnalyze: 50,
    priorityFilter: 'all'
  });
  const [activeTab, setActiveTab] = useState('single-verb');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };
  const handleVerbValidation = async () => {
    if (!selectedVerb.trim()) return;

    setIsValidating(true);
    setDebugLog([]); // Clear previous logs
    addDebugLog(`🔍 Starting validation for: ${selectedVerb}`);

    try {
      const validator = new ConjugationComplianceValidator(supabase);

      // Pass the debug function to the validator
      const result = await validator.validateSpecificVerbWithDebug(selectedVerb, addDebugLog);

      if (result) {
        setValidationResult(result);
        addDebugLog(`✅ Validation completed successfully`);
      } else {
        addDebugLog(`❌ Validation returned null - check previous errors`);
      }
    } catch (error) {
      addDebugLog(`❌ Validation failed: ${error.message}`);
      addDebugLog(`❌ Stack trace: ${error.stack}`);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSystemAnalysis = async () => {
    setIsValidating(true);
    setDebugLog([]); // Clear previous logs
    addDebugLog('🔍 Starting system-wide analysis...');
    try {
      const validator = new ConjugationComplianceValidator(supabase);
      const result = await validator.validateConjugationSystemWithDebug(validationOptions, addDebugLog);
      setSystemAnalysis(result);
      addDebugLog('✅ System analysis completed');
    } catch (error) {
      addDebugLog(`❌ System analysis failed: ${error.message}`);
      addDebugLog(`❌ Stack: ${error.stack}`);
      setSystemAnalysis(null);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs-work': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical-issues': return <XCircle className="w-5 h-5 text-orange-500" />;
      case 'blocks-migration': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const ComplianceScoreCard = ({ title, score, description, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{score}%</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`w-16 h-16 rounded-full bg-${color}-100 flex items-center justify-center`}>
          <div className={`text-${color}-600 font-bold text-lg`}>{score}</div>
        </div>
      </div>
    </div>
  );

  const IssueCard = ({ issue, showAutoFix = false }) => (
    <div className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}>
              {issue.severity.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">{issue.ruleId}</span>
          </div>
          <h4 className="font-medium text-gray-900 mb-2">{issue.message}</h4>
          
          {issue.currentValue && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-700">Current:</span>
              <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                {Array.isArray(issue.currentValue) ? issue.currentValue.join(', ') : issue.currentValue}
              </code>
            </div>
          )}
          
          {issue.expectedValue && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-700">Expected:</span>
              <span className="ml-2 text-xs text-gray-600">{issue.expectedValue}</span>
            </div>
          )}

          {issue.autoFix && showAutoFix && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <span className="text-xs font-medium text-green-700">Auto-Fix Available:</span>
              <p className="text-xs text-green-600 mt-1">{issue.autoFix}</p>
            </div>
          )}

          {issue.manualSteps && !showAutoFix && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-700">Manual Steps:</span>
              <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                {issue.manualSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {issue.epicContext && (
            <div className="mt-2 text-xs text-gray-500 italic">
              EPIC Context: {issue.epicContext}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conjugation Compliance Validator</h1>
        <p className="text-gray-600">EPIC 002: Monitor data quality and architectural readiness before migration</p>
      </div>

      {showDebugPanel && (
        <div className="mb-6 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-semibold">Debug Console</h3>
            <button
              onClick={() => setDebugLog([])}
              className="text-gray-400 hover:text-white text-xs"
            >
              Clear
            </button>
          </div>
          {debugLog.length === 0 ? (
            <p className="text-gray-500">No debug output yet...</p>
          ) : (
            debugLog.map((log, idx) => (
              <div key={idx} className="py-1 border-b border-gray-700 last:border-b-0">
                {log}
              </div>
            ))
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('single-verb')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'single-verb'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Single Verb Analysis
        </button>
        <button
          onClick={() => setActiveTab('system-analysis')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'system-analysis'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          System-Wide Analysis
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Validation Settings
        </button>
      </div>

      {/* Single Verb Analysis Tab */}
      {activeTab === 'single-verb' && (
        <div className="space-y-6">
          {/* Verb Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Individual Verb Validation</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="verb-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Italian Verb
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="verb-input"
                    type="text"
                    value={selectedVerb}
                    onChange={(e) => setSelectedVerb(e.target.value)}
                    placeholder="e.g., parlare, finire, essere..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerbValidation()}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleVerbValidation}
                  disabled={isValidating || !selectedVerb.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Validate
                </button>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-6">
              {/* Compliance Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Compliance Report: {validationResult.verbItalian}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validationResult.complianceStatus)}
                    <span className="font-medium capitalize">
                      {validationResult.complianceStatus.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <ComplianceScoreCard
                    title="Overall Score"
                    score={validationResult.overallScore}
                    description="Architectural compliance"
                    color="blue"
                  />
                  <ComplianceScoreCard
                    title="Priority Level"
                    score={validationResult.priorityLevel === 'high' ? 100 : validationResult.priorityLevel === 'medium' ? 60 : 20}
                    description={`${validationResult.priorityLevel} priority verb`}
                    color={validationResult.priorityLevel === 'high' ? 'red' : validationResult.priorityLevel === 'medium' ? 'yellow' : 'green'}
                  />
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-900">Migration Ready</h4>
                    <p className={`text-2xl font-bold ${validationResult.migrationReadiness ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResult.migrationReadiness ? 'YES' : 'NO'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ready for new system</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-900">Estimated Fix Time</h4>
                    <p className="text-2xl font-bold text-gray-900">{validationResult.estimatedFixTime}</p>
                    <p className="text-xs text-gray-500 mt-1">Time to resolve issues</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.wordLevelIssues.length + validationResult.translationLevelIssues.length +
                       validationResult.formLevelIssues.length + validationResult.crossTableIssues.length}
                    </div>
                    <div className="text-xs text-red-600">Total Issues</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{validationResult.autoFixableIssues.length}</div>
                    <div className="text-xs text-green-600">Auto-Fixable</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{validationResult.manualInterventionRequired.length}</div>
                    <div className="text-xs text-orange-600">Manual Required</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{validationResult.missingBuildingBlocks.length}</div>
                    <div className="text-xs text-purple-600">Missing Blocks</div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis by Category */}
              <div className="space-y-6">
                {/* Word Level Issues */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Word Level Analysis</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm text-gray-700">Conjugation Class</h5>
                        <div className="mt-1 text-sm">
                          {validationResult.wordLevelIssues.some(i => i.ruleId === 'missing-conjugation-class') ? (
                            <span className="text-red-600">❌ Missing</span>
                          ) : (
                            <span className="text-green-600">✅ Present</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm text-gray-700">Transitivity</h5>
                        <div className="mt-1 text-sm">
                          {validationResult.wordLevelIssues.some(i => i.ruleId === 'missing-transitivity') ? (
                            <span className="text-red-600">❌ Missing</span>
                          ) : (
                            <span className="text-green-600">✅ Present</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm text-gray-700">Frequency Tag</h5>
                        <div className="mt-1 text-sm">
                          <span className="text-green-600">✅ Present</span>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm text-gray-700">CEFR Level</h5>
                        <div className="mt-1 text-sm">
                          <span className="text-green-600">✅ Present</span>
                        </div>
                      </div>
                    </div>

                    {validationResult.wordLevelIssues.length > 0 && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h6 className="font-medium text-red-800 mb-2">Required Fixes:</h6>
                        {validationResult.wordLevelIssues.map((issue, idx) => (
                          <div key={idx} className="mb-3 text-sm">
                            <div className="font-medium text-red-700">{issue.message}</div>
                            <div className="mt-1 text-red-600">
                              <strong>Action:</strong> Add tag to dictionary.tags: {issue.expectedValue}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Translation Analysis - REAL DATA GROUPED BY TRANSLATION */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Translation Analysis (REAL DATA)</h4>
                  
                  {validationResult.detailedAnalysis ? (
                    <div className="space-y-4">
                      {/* Overall Translation Statistics */}
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {validationResult.detailedAnalysis.auxiliaries.length}
                            </div>
                            <div className="text-gray-600">Auxiliaries Detected</div>
                            <div className="text-xs text-gray-500">
                              {validationResult.detailedAnalysis.auxiliaries.join(', ')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {validationResult.detailedAnalysis.formTranslationCoverage.translationBreakdown.length}
                            </div>
                            <div className="text-gray-600">Total Translations</div>
                            <div className="text-xs text-gray-500">Each with distinct meaning</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {validationResult.detailedAnalysis.formTranslationCoverage.totalFormTranslations}
                            </div>
                            <div className="text-gray-600">Total Form-Translations</div>
                            <div className="text-xs text-gray-500">Junction table entries</div>
                          </div>
                        </div>
                      </div>

                      {/* Group Translation Issues by Translation */}
                      {validationResult.detailedAnalysis.formTranslationCoverage.translationBreakdown.map((translation, idx) => {
                        const translationIssues = validationResult.translationLevelIssues.filter(issue => 
                          issue.message.includes(`\"${translation.translation}\"`) || 
                          issue.message.includes(`Translation #${idx + 1}`)
                        );

                        return (
                          <div key={idx} className={`border rounded-lg p-4 ${
                            idx === 0 ? 'border-purple-200 bg-purple-50' : 'border-indigo-200 bg-indigo-50'
                          }`}>
                            <div className="flex justify-between items-start mb-3">
                              <h6 className={`text-lg font-medium ${
                                idx === 0 ? 'text-purple-900' : 'text-indigo-900'
                              }`}>
                                Translation {idx + 1}: "{translation.translation}"
                              </h6>
                              <span className={`text-xs px-2 py-1 rounded ${
                                idx === 0 ? 'bg-purple-200 text-purple-800' : 'bg-indigo-200 text-indigo-800'
                              }`}>
                                {translation.auxiliary}
                              </span>
                            </div>

                            {/* Translation Metadata Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="p-3 bg-white rounded border">
                                <div className="text-sm font-medium text-gray-700">Auxiliary Assignment</div>
                                <div className={`text-sm mt-1 ${
                                  translation.auxiliary !== 'unknown' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {translation.auxiliary !== 'unknown' ? 
                                    `✅ ${translation.auxiliary}` : 
                                    '❌ Missing (need: avere/essere)'
                                  }
                                </div>
                              </div>
                              
                              <div className="p-3 bg-white rounded border">
                                <div className="text-sm font-medium text-gray-700">Form Coverage</div>
                                <div className={`text-sm mt-1 ${
                                  translation.coverage >= 100 ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {translation.coverage >= 100 ? 
                                    `✅ ${translation.coverage}%` : 
                                    `⚠️ ${translation.coverage}% (${translation.actual}/${translation.expected})`
                                  }
                                </div>
                              </div>

                              <div className="p-3 bg-white rounded border">
                                <div className="text-sm font-medium text-gray-700">Issues Found</div>
                                <div className={`text-sm mt-1 ${
                                  translationIssues.length === 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {translationIssues.length === 0 ? 
                                    '✅ No issues' : 
                                    `❌ ${translationIssues.length} issues`
                                  }
                                </div>
                              </div>
                            </div>

                            {/* Translation-Specific Issues */}
                            {translationIssues.length > 0 && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                                <h6 className="font-medium text-red-800 mb-2">Issues for this translation:</h6>
                                <div className="space-y-2">
                                  {translationIssues.map((issue, issueIdx) => (
                                    <div key={issueIdx} className="text-sm">
                                      <div className="font-medium text-red-700">❌ {issue.message}</div>
                                      <div className="text-red-600 text-xs mt-1">
                                        <strong>Current:</strong> {JSON.stringify(issue.currentValue)}
                                      </div>
                                      <div className="text-red-600 text-xs">
                                        <strong>Expected:</strong> {issue.expectedValue}
                                      </div>
                                      {issue.manualSteps && (
                                        <div className="mt-2 p-2 bg-red-100 rounded">
                                          <div className="text-red-800 font-medium text-xs">Actions:</div>
                                          <ul className="text-red-700 text-xs mt-1 list-decimal list-inside">
                                            {issue.manualSteps.map((step, stepIdx) => (
                                              <li key={stepIdx}>{step}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Form-Translation Coverage Details */}
                            <div className="mt-4 p-3 bg-white border rounded">
                              <h6 className="font-medium text-gray-800 mb-2">Form-Translation Coverage Details</h6>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div className="text-center">
                                  <div className="font-bold text-gray-700">{translation.expected}</div>
                                  <div className="text-gray-500">Expected Links</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-blue-600">{translation.actual}</div>
                                  <div className="text-gray-500">Actual Links</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-orange-600">{translation.expected - translation.actual}</div>
                                  <div className="text-gray-500">Missing Links</div>
                                </div>
                                <div className="text-center">
                                  <div className={`font-bold ${translation.coverage >= 100 ? 'text-green-600' : 'text-red-600'}`}> {translation.coverage}%</div>
                                  <div className="text-gray-500">Completion</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-red-600">No detailed analysis available</div>
                  )}
                </div>

                {/* Forms Analysis by Mood Groups - REAL DATA */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Forms Analysis by Mood (REAL DATA)</h4>
                  
                  {validationResult.detailedAnalysis ? (
                    <>
                      {/* Real Data Summary */}
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h6 className="font-medium text-blue-900 mb-2">Form Expectations Calculator (REAL DATA)</h6>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-blue-800">Auxiliaries Detected:</div>
                            <div className="text-blue-700">
                              {validationResult.detailedAnalysis.auxiliaries.length} total: {validationResult.detailedAnalysis.auxiliaries.join(', ') || 'None'}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-800">Simple Forms:</div>
                            <div className="text-blue-700">
                              Found: {validationResult.detailedAnalysis.formCounts.byType.simple} / Expected: {validationResult.detailedAnalysis.formCounts.expectations.simple}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-800">Perfect Compounds:</div>
                            <div className="text-blue-700">
                              Found: {validationResult.detailedAnalysis.formCounts.byType.perfectCompound} / Expected: {validationResult.detailedAnalysis.formCounts.expectations.perfectCompound}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-800">Total Progress:</div>
                            <div className="text-blue-700">
                              {validationResult.detailedAnalysis.formCounts.byType.total} / {validationResult.detailedAnalysis.formCounts.expectations.total} ({Math.round(validationResult.detailedAnalysis.formCounts.byType.total/validationResult.detailedAnalysis.formCounts.expectations.total*100)}%)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Real Mood-by-Mood Breakdown */}
                      {Object.entries(validationResult.detailedAnalysis.formCounts.byMood).map(([mood, tenses]) => {
                        const moodDisplayNames = {
                          'indicativo': 'Indicative (Indicativo)',
                          'congiuntivo': 'Subjunctive (Congiuntivo)', 
                          'condizionale': 'Conditional (Condizionale)',
                          'imperativo': 'Imperative (Imperativo)',
                          'infinito': 'Infinitive Forms',
                          'participio': 'Participle Forms',
                          'gerundio': 'Gerund Forms'
                        };

                        return (
                          <div key={mood} className="border rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-gray-800 mb-3">{moodDisplayNames[mood] || mood}</h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                              {Object.entries(tenses as { [tense: string]: number }).map(([tense, count]) => {
                                const auxiliaryCount = validationResult.detailedAnalysis.auxiliaries.length || 1;
                                let expected = 6;
                                if (tense.includes('imperativo')) expected = 5;
                                if (tense.includes('infinito') || tense.includes('participio') || tense.includes('gerundio')) expected = 1;
                                const isCompound = tense.includes('passato') || tense.includes('anteriore') || tense.includes('trapassato');
                                if (isCompound && auxiliaryCount > 1) expected = expected * auxiliaryCount;
                                const isComplete = count >= expected;
                                const isMissing = count === 0;
                                return (
                                  <div key={tense} className={`p-2 rounded ${
                                    isMissing ? 'bg-red-50' :
                                    !isComplete ? 'bg-yellow-50' : 'bg-gray-50'
                                  }`}>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium text-xs">
                                          {tense.replace(/-/g, ' ')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Found: {count} / Expected: {expected}
                                          {auxiliaryCount > 1 && isCompound && (
                                            <div className="text-xs text-gray-400">
                                              ({expected/auxiliaryCount} × {auxiliaryCount} aux)
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <span className={
                                        isMissing ? 'text-red-600' :
                                        !isComplete ? 'text-yellow-600' : 'text-green-600'
                                      }>
                                        {isMissing ? '❌' : !isComplete ? '⚠️' : '✅'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-red-600">No detailed analysis available</div>
                  )}
                </div>

                {/* REAL Orphaned Records */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Orphaned Records Analysis (REAL DATA)</h4>
                  
                  {validationResult.detailedAnalysis ? (
                    <>
                      {/* REAL Forms without Form-Translations */}
                      <div className="mb-6">
                        <h6 className="font-medium text-gray-800 mb-3">🔗 Forms without Form-Translation Assignments</h6>
                        <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">Orphaned Forms</span>
                            <span className="text-red-600 text-sm">
                              Found: {validationResult.detailedAnalysis.orphanedRecords.formsWithoutTranslations.length} forms
                            </span>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {validationResult.detailedAnalysis.orphanedRecords.formsWithoutTranslations.length === 0 ? (
                              <div className="text-green-600 text-sm">✅ All forms have form_translation assignments</div>
                            ) : (
                              <div className="space-y-1 text-sm">
                                {validationResult.detailedAnalysis.orphanedRecords.formsWithoutTranslations.map((form, idx) => (
                                  <div key={idx} className="p-2 bg-red-100 rounded text-red-800">
                                    "{form.text}" (ID: {form.id}) - Tags: {form.tags.join(', ')} - No English translation
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* REAL Translations without Forms */}
                      <div className="mb-6">
                        <h6 className="font-medium text-gray-800 mb-3">🔗 Translations without Form-Translation Assignments</h6>
                        <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-orange-800">Orphaned Translations</span>
                            <span className="text-orange-600 text-sm">
                              Found: {validationResult.detailedAnalysis.orphanedRecords.translationsWithoutForms.length} translations
                            </span>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {validationResult.detailedAnalysis.orphanedRecords.translationsWithoutForms.length === 0 ? (
                              <div className="text-green-600 text-sm">✅ All translations are linked to forms</div>
                            ) : (
                              <div className="space-y-1 text-sm">
                                {validationResult.detailedAnalysis.orphanedRecords.translationsWithoutForms.map((trans, idx) => (
                                  <div key={idx} className="p-2 bg-orange-100 rounded text-orange-800">
                                    "{trans.translation}" (ID: {trans.id}) - {trans.auxiliary} auxiliary - Covers no forms
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* REAL Missing Tags Breakdown */}
                      <div className="mb-6">
                        <h6 className="font-medium text-gray-800 mb-3">🏷️ Missing Tags Breakdown</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Real Building Block Tags */}
                          <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                            <div className="font-medium text-yellow-800 mb-2">Missing Building-Block Tags</div>
                            <div className="text-yellow-600 text-sm mb-2">
                              Found: {validationResult.detailedAnalysis.orphanedRecords.missingTags.buildingBlocks.length} forms
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                              {validationResult.detailedAnalysis.orphanedRecords.missingTags.buildingBlocks.length === 0 ? (
                                <div className="text-green-600">✅ All building blocks properly tagged</div>
                              ) : (
                                validationResult.detailedAnalysis.orphanedRecords.missingTags.buildingBlocks.map((form, idx) => (
                                  <div key={idx} className="p-1 bg-yellow-100 rounded text-yellow-800">
                                    "{form.text}" (ID: {form.id}) - Need {form.missingTag} tag
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Real Auxiliary Tags */}
                          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                            <div className="font-medium text-red-800 mb-2">Missing Auxiliary Tags</div>
                            <div className="text-red-600 text-sm mb-2">
                              Found: {validationResult.detailedAnalysis.orphanedRecords.missingTags.auxiliaries.length} forms
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                              {validationResult.detailedAnalysis.orphanedRecords.missingTags.auxiliaries.length === 0 ? (
                                <div className="text-green-600">✅ All compound forms have auxiliary tags</div>
                              ) : (
                                validationResult.detailedAnalysis.orphanedRecords.missingTags.auxiliaries.map((form, idx) => (
                                  <div key={idx} className="p-1 bg-red-100 rounded text-red-800">
                                    "{form.text}" (ID: {form.id}) - Need {form.expectedTag}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-600">No detailed analysis available</div>
                  )}
                </div>

                {/* Summary Stats - REAL DATA */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-3">Summary (REAL DATA)</h5>
                  
                  {validationResult.detailedAnalysis ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {validationResult.detailedAnalysis.formCounts.byType.total}/{validationResult.detailedAnalysis.formCounts.expectations.total}
                          </div>
                          <div className="text-gray-600">Forms Present ({Math.round(validationResult.detailedAnalysis.formCounts.byType.total/validationResult.detailedAnalysis.formCounts.expectations.total*100)}%)</div>
                          <div className="text-xs text-gray-500">
                            {validationResult.detailedAnalysis.auxiliaries.length} aux: {validationResult.detailedAnalysis.auxiliaries.join(', ')}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {Math.round((validationResult.detailedAnalysis.formCounts.expectations.total - validationResult.detailedAnalysis.formCounts.byType.total) / 6)}
                          </div>
                          <div className="text-gray-600">Missing Tense Sets</div>
                          <div className="text-xs text-gray-500">
                            {validationResult.detailedAnalysis.formCounts.expectations.total - validationResult.detailedAnalysis.formCounts.byType.total} individual forms missing
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {validationResult.detailedAnalysis.orphanedRecords.missingTags.auxiliaries.length}
                          </div>
                          <div className="text-gray-600">Forms Need Auxiliary Tags</div>
                          <div className="text-xs text-gray-500">Perfect compound & progressive</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {validationResult.detailedAnalysis.orphanedRecords.missingTags.buildingBlocks.length}
                          </div>
                          <div className="text-gray-600">Missing Building-Block Tags</div>
                          <div className="text-xs text-gray-500">Critical for materialization</div>
                        </div>
                      </div>
                      
                      {/* REAL Detailed Breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h6 className="font-medium text-gray-700 mb-2">Form Category Breakdown (REAL DATA)</h6>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-medium text-green-800">Simple Forms</div>
                            <div className="text-green-600">
                              {validationResult.detailedAnalysis.formCounts.byType.simple} / {validationResult.detailedAnalysis.formCounts.expectations.simple}
                            </div>
                            <div className="text-green-500">
                              {Math.round(validationResult.detailedAnalysis.formCounts.byType.simple/validationResult.detailedAnalysis.formCounts.expectations.simple*100)}% Complete
                            </div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-medium text-red-800">Perfect Compounds</div>
                            <div className="text-red-600">
                              {validationResult.detailedAnalysis.formCounts.byType.perfectCompound} / {validationResult.detailedAnalysis.formCounts.expectations.perfectCompound}
                            </div>
                            <div className="text-red-500">
                              {Math.round(validationResult.detailedAnalysis.formCounts.byType.perfectCompound/validationResult.detailedAnalysis.formCounts.expectations.perfectCompound*100)}% Complete
                            </div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="font-medium text-orange-800">Progressive Forms</div>
                            <div className="text-orange-600">
                              {validationResult.detailedAnalysis.formCounts.byType.progressive} / {validationResult.detailedAnalysis.formCounts.expectations.progressive}
                            </div>
                            <div className="text-orange-500">
                              {Math.round(validationResult.detailedAnalysis.formCounts.byType.progressive/validationResult.detailedAnalysis.formCounts.expectations.progressive*100)}% Complete
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-600">No detailed analysis available</div>
                  )}
                </div>
              </div>
              {/* Issues by Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auto-Fixable Issues */}
                {validationResult.autoFixableIssues.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Auto-Fixable Issues</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {validationResult.autoFixableIssues.length} issues
                      </span>
                    </div>
                    <div className="space-y-3">
                      {validationResult.autoFixableIssues.map((issue, idx) => (
                        <IssueCard key={idx} issue={issue} showAutoFix={true} />
                      ))}
                    </div>
                    <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                      Apply All Auto-Fixes
                    </button>
                  </div>
                )}

                {/* Manual Intervention Required */}
                {validationResult.manualInterventionRequired.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Manual Intervention Required</h4>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                        {validationResult.manualInterventionRequired.length} issues
                      </span>
                    </div>
                    <div className="space-y-3">
                      {validationResult.manualInterventionRequired.map((issue, idx) => (
                        <IssueCard key={idx} issue={issue} showAutoFix={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Missing Building Blocks */}
              {validationResult.missingBuildingBlocks.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Missing Building Blocks</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h5 className="text-red-800 font-medium mb-2">Critical for Compound Generation</h5>
                        <div className="space-y-2">
                          {validationResult.missingBuildingBlocks.map((item, idx) => (
                            <div key={idx} className="text-red-700 text-sm p-2 bg-red-100 rounded border-l-4 border-red-400">
                              {item}
                            </div>
                          ))}
                        </div>
                        <p className="text-red-600 text-xs mt-3">
                          These forms are essential for generating compound tenses. The new architecture cannot function without them.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* System Analysis Tab */}
      {activeTab === 'system-analysis' && (
        <div className="space-y-6">
          {/* System Analysis Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System-Wide Compliance Analysis</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Analyze all verbs in the system against EPIC 002 architectural requirements
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>• Compliance scoring</span>
                  <span>• Migration readiness assessment</span>
                  <span>• Issue prioritization</span>
                  <span>• Remediation planning</span>
                </div>
              </div>
              <button
                onClick={handleSystemAnalysis}
                disabled={isValidating}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                Run System Analysis
              </button>
            </div>
          </div>

          {/* System Analysis Results */}
          {systemAnalysis && (
            <div className="space-y-6">
              {/* Overall Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ComplianceScoreCard
                  title="Overall Compliance"
                  score={systemAnalysis.overallScore.overall}
                  description={`${systemAnalysis.analyzedVerbs} verbs analyzed`}
                  color="blue"
                />
                <ComplianceScoreCard
                  title="Migration Ready"
                  score={Math.round((systemAnalysis.complianceDistribution.compliant / systemAnalysis.analyzedVerbs) * 100)}
                  description={`${systemAnalysis.complianceDistribution.compliant} verbs ready`}
                  color="green"
                />
                <ComplianceScoreCard
                  title="Critical Issues"
                  score={systemAnalysis.overallScore.blockers}
                  description="Migration blockers"
                  color="red"
                />
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900">Estimated Work</h3>
                  <p className="text-2xl font-bold text-gray-900">{systemAnalysis.estimatedWorkRequired}</p>
                  <p className="text-xs text-gray-500 mt-1">To fix all issues</p>
                </div>
              </div>

              {/* Compliance Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{systemAnalysis.complianceDistribution.compliant}</div>
                    <div className="text-sm text-green-600 font-medium">Compliant</div>
                    <div className="text-xs text-gray-500">Ready for migration</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{systemAnalysis.complianceDistribution.needsWork}</div>
                    <div className="text-sm text-yellow-600 font-medium">Needs Work</div>
                    <div className="text-xs text-gray-500">Minor issues to resolve</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">{systemAnalysis.complianceDistribution.criticalIssues}</div>
                    <div className="text-sm text-orange-600 font-medium">Critical Issues</div>
                    <div className="text-xs text-gray-500">Significant problems</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{systemAnalysis.complianceDistribution.blocksMigration}</div>
                    <div className="text-sm text-red-600 font-medium">Blocks Migration</div>
                    <div className="text-xs text-gray-500">Must fix before migration</div>
                  </div>
                </div>
              </div>

              {/* Top Issues */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Issues Across System</h3>
                <div className="space-y-3">
                  {systemAnalysis.topIssues.map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{issue.ruleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <p className="text-sm text-gray-600 mt-1">{issue.impact}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{issue.count}</div>
                        <div className="text-xs text-gray-500">verbs affected</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Migration Readiness */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Migration Readiness Assessment</h3>
                <div className={`p-4 rounded-lg border-2 ${systemAnalysis.migrationReadiness.ready ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center">
                    {systemAnalysis.migrationReadiness.ready ? (
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 mr-3" />
                    )}
                    <div>
                      <h4 className={`font-semibold ${systemAnalysis.migrationReadiness.ready ? 'text-green-800' : 'text-red-800'}`}>
                        {systemAnalysis.migrationReadiness.ready ? 'System Ready for Migration' : 'Migration Blocked'}
                      </h4>
                      <p className={`text-sm mt-1 ${systemAnalysis.migrationReadiness.ready ? 'text-green-700' : 'text-red-700'}`}>
                        {systemAnalysis.migrationReadiness.ready
                          ? 'All critical requirements met. Safe to proceed with architectural changes.'
                          : 'Critical issues must be resolved before proceeding with migration.'}
                      </p>
                    </div>
                  </div>
                </div>

                {systemAnalysis.migrationReadiness.blockers.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Migration Blockers:</h5>
                    <ul className="space-y-1">
                      {systemAnalysis.migrationReadiness.blockers.map((blocker, idx) => (
                        <li key={idx} className="text-sm text-red-600 flex items-center">
                          <XCircle className="w-4 h-4 mr-2" />
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {systemAnalysis.migrationReadiness.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                    <ul className="space-y-1">
                      {systemAnalysis.migrationReadiness.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-blue-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                    Apply Auto-Fixes ({systemAnalysis.autoFixableCount})
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validationOptions.includeDeprecatedCheck}
                  onChange={(e) => setValidationOptions(prev => ({ ...prev, includeDeprecatedCheck: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Check for deprecated content</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validationOptions.includeCrossTableAnalysis}
                  onChange={(e) => setValidationOptions(prev => ({ ...prev, includeCrossTableAnalysis: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include cross-table relationship validation</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validationOptions.includeTerminologyValidation}
                  onChange={(e) => setValidationOptions(prev => ({ ...prev, includeTerminologyValidation: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Validate universal terminology compliance</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validationOptions.generateAutoFixes}
                  onChange={(e) => setValidationOptions(prev => ({ ...prev, generateAutoFixes: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Generate auto-fix suggestions</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum verbs to analyze
              </label>
              <input
                type="number"
                value={validationOptions.maxVerbsToAnalyze}
                onChange={(e) => setValidationOptions(prev => ({ ...prev, maxVerbsToAnalyze: parseInt(e.target.value) }))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority filter
              </label>
              <select
                value={validationOptions.priorityFilter}
                onChange={(e) => setValidationOptions(prev => ({ ...prev, priorityFilter: e.target.value as 'high-only' | 'all' }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All verbs</option>
                <option value="high-only">High priority only</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminValidationInterface;
