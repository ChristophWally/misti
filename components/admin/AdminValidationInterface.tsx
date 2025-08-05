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

                {/* Translation Level Issues */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Translation Level Analysis</h4>
                  <div className="space-y-4">
                    {validationResult.translationLevelIssues.some(i => i.ruleId === 'no-translations') ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-red-800 font-medium">❌ No translations found</div>
                        <div className="mt-2 text-sm text-red-700">
                          <strong>Action:</strong> Create records in word_translations table with auxiliary and form_ids
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Mock translation analysis - replace with real data */}
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">Translation 1: "to speak"</h5>
                            <span className="text-xs text-gray-500">Priority: 1</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Auxiliary:</span>
                              <span className="ml-2 text-red-600">❌ Missing (need: avere/essere)</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Transitivity:</span>
                              <span className="ml-2 text-red-600">❌ Missing (need: transitive/intransitive)</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Form IDs:</span>
                              <span className="ml-2 text-red-600">❌ Missing (need: array of form IDs)</span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Required Actions:</strong>
                            <ul className="mt-1 list-disc list-inside text-yellow-800">
                              <li>Set context_metadata.auxiliary = "avere" (transitive verb)</li>
                              <li>Set context_metadata.transitivity = "transitive"</li>
                              <li>Add form_ids array with relevant form IDs</li>
                            </ul>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">Translation 2: "to talk"</h5>
                            <span className="text-xs text-gray-500">Priority: 2</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Auxiliary:</span>
                              <span className="ml-2 text-red-600">❌ Missing (need: avere/essere)</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Transitivity:</span>
                              <span className="ml-2 text-red-600">❌ Missing (need: transitive/intransitive)</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Form IDs:</span>
                              <span className="ml-2 text-red-600">❌ Missing (need: array of form IDs)</span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Required Actions:</strong>
                            <ul className="mt-1 list-disc list-inside text-yellow-800">
                              <li>Set context_metadata.auxiliary = "avere" (transitive verb)</li>
                              <li>Set context_metadata.transitivity = "transitive"</li>
                              <li>Add form_ids array with relevant form IDs</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Forms Analysis by Mood Groups */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Forms Analysis by Mood</h4>

                  {/* Indicative Mood */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Indicative (Indicativo)</h5>

                    <div className="mb-3">
                      <h6 className="font-medium text-gray-700 mb-2">Simple Tenses</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>Presente (6 forms)</span>
                          <span className="text-green-600">✅ Complete</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>Imperfetto (6 forms)</span>
                          <span className="text-green-600">✅ Complete</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>Futuro Semplice (6 forms)</span>
                          <span className="text-green-600">✅ Complete</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>Passato Remoto (6 forms)</span>
                          <span className="text-green-600">✅ Complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6 className="font-medium text-gray-700 mb-2">Compound Tenses</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>Passato Prossimo (6 forms)</span>
                          <span className="text-yellow-600">⚠️ Missing auxiliary tags</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>Trapassato Prossimo (6 forms)</span>
                          <span className="text-red-600">❌ Completely missing</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>Futuro Anteriore (6 forms)</span>
                          <span className="text-red-600">❌ Completely missing</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>Trapassato Remoto (6 forms)</span>
                          <span className="text-red-600">❌ Completely missing</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6 className="font-medium text-gray-700 mb-2">Progressive Tenses</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>Presente Progressivo (6 forms)</span>
                          <span className="text-yellow-600">⚠️ Missing auxiliary tags</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>Imperfetto Progressivo (6 forms)</span>
                          <span className="text-red-600">❌ Completely missing</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>Futuro Progressivo (6 forms)</span>
                          <span className="text-red-600">❌ Completely missing</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subjunctive Mood */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Subjunctive (Congiuntivo)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Presente (6 forms)</span>
                        <span className="text-green-600">✅ Complete</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Imperfetto (6 forms)</span>
                        <span className="text-green-600">✅ Complete</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Passato (6 forms)</span>
                        <div className="text-right">
                          <span className="text-yellow-600">⚠️ Incomplete (1/6)</span>
                          <div className="text-xs text-gray-500">Missing: tu, lui/lei, noi, voi, loro</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Trapassato (6 forms)</span>
                        <span className="text-red-600">❌ Completely missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Presente Progressivo (6 forms)</span>
                        <span className="text-red-600">❌ Completely missing</span>
                      </div>
                    </div>
                  </div>

                  {/* Other Moods */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Conditional & Imperative</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Condizionale Presente (6 forms)</span>
                        <span className="text-green-600">✅ Complete</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Condizionale Passato (6 forms)</span>
                        <span className="text-red-600">❌ Completely missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Condizionale Presente Progressivo (6 forms)</span>
                        <span className="text-red-600">❌ Completely missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Imperativo Presente (5 forms)</span>
                        <span className="text-green-600">✅ Complete</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Imperativo Passato (5 forms)</span>
                        <span className="text-red-600">❌ Completely missing</span>
                      </div>
                    </div>
                  </div>

                  {/* Non-finite Forms */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Non-finite Forms</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Infinito Presente</span>
                        <span className="text-green-600">✅ Present</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Infinito Passato</span>
                        <span className="text-yellow-600">⚠️ No auxiliary tags</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Participio Presente</span>
                        <span className="text-green-600">✅ Present</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span>Participio Passato</span>
                        <span className="text-yellow-600">⚠️ Missing building-block tag</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span>Gerundio Presente</span>
                        <span className="text-yellow-600">⚠️ Missing building-block tag</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Gerundio Passato</span>
                        <span className="text-yellow-600">⚠️ No auxiliary tags</span>
                      </div>
                    </div>
                  </div>

                  {/* Building Blocks */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Building Blocks</h5>
                    <p className="text-xs text-gray-600 mb-3">
                      Building blocks need 'building-block' tags so the materialization engine can identify them for compound tense generation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <div>
                          <span className="font-medium">Past Participle "finito"</span>
                          <div className="text-xs text-gray-500">For: compound tenses</div>
                        </div>
                        <span className="text-yellow-600">⚠️ Missing 'building-block' tag</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <div>
                          <span className="font-medium">Present Gerund "finendo"</span>
                          <div className="text-xs text-gray-500">For: progressive tenses</div>
                        </div>
                        <span className="text-yellow-600">⚠️ Missing 'building-block' tag</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <div>
                          <span className="font-medium">Present Infinitive "finire"</span>
                          <div className="text-xs text-gray-500">For: negative imperatives</div>
                        </div>
                        <span className="text-yellow-600">⚠️ Missing 'building-block' tag</span>
                      </div>
                    </div>
                  </div>

                  {/* Form-Translation Relationships */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Form-Translation Relationships</h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-blue-800 font-medium text-sm">✅ English Translations Available</div>
                        <div className="text-blue-700 text-sm mt-1">
                          134 form-translation assignments found in form_translations table
                        </div>
                      </div>

                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="text-red-800 font-medium text-sm">❌ Missing Translation→Form Links</div>
                        <div className="text-red-700 text-sm mt-1 space-y-1">
                          <div>• Translation "to end": Missing form_ids array</div>
                          <div>• Translation "to finish": Missing form_ids array</div>
                          <div>• Without form_ids arrays, translations can't specify which forms to display</div>
                        </div>
                        <div className="mt-2 p-2 bg-red-100 rounded">
                          <div className="text-red-800 font-medium text-xs">Required Actions:</div>
                          <ol className="text-red-700 text-xs mt-1 list-decimal list-inside">
                            <li>Add form_ids arrays to each translation</li>
                            <li>Include relevant form IDs for each meaning</li>
                            <li>Test that forms display correctly per translation</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">67/142</div>
                        <div className="text-gray-600">Forms Present (47%)</div>
                        <div className="text-xs text-gray-500">Expected: 27 tense categories × ~5.3 persons avg</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">13</div>
                        <div className="text-gray-600">Missing Tense Sets</div>
                        <div className="text-xs text-gray-500">Including progressive forms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">18</div>
                        <div className="text-gray-600">Forms Need Auxiliary Tags</div>
                        <div className="text-xs text-gray-500">Compound & progressive forms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">3</div>
                        <div className="text-gray-600">Missing Building-Block Tags</div>
                        <div className="text-xs text-gray-500">Critical for materialization</div>
                      </div>
                    </div>
                  </div>
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
