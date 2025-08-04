'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Settings, BarChart3, RefreshCw, Download, Play, Pause } from 'lucide-react';

// This would normally be imported from your validation system
// import { ConjugationComplianceValidator } from '../lib/conjugationComplianceValidator';

const AdminValidationInterface = () => {
  const [selectedVerb, setSelectedVerb] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [systemAnalysis, setSystemAnalysis] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationOptions, setValidationOptions] = useState({
    includeDeprecatedCheck: true,
    includeCrossTableAnalysis: true,
    includeTerminologyValidation: true,
    generateAutoFixes: true,
    maxVerbsToAnalyze: 50,
    priorityFilter: 'all'
  });
  const [activeTab, setActiveTab] = useState('single-verb');

  // Mock validation data for demonstration
  const mockVerbResult = {
    verbId: '123',
    verbItalian: 'parlare',
    overallScore: 85,
    complianceStatus: 'needs-work',
    wordLevelIssues: [
      {
        ruleId: 'missing-transitivity-potential',
        severity: 'high',
        message: 'Missing transitivity potential classification',
        currentValue: ['are-conjugation', 'freq-top100'],
        expectedValue: 'One of: always-transitive, always-intransitive, both-possible',
        manualSteps: ['Analyze verb usage patterns', 'Add appropriate transitivity tag'],
        epicContext: 'Translation-level auxiliary assignment validation depends on word-level transitivity'
      }
    ],
    translationLevelIssues: [
      {
        ruleId: 'missing-form-ids-array',
        severity: 'critical',
        message: 'Translation "to speak" missing form_ids array',
        currentValue: 'undefined',
        expectedValue: 'Array of form IDs this translation uses',
        manualSteps: ['Identify which forms belong to this translation meaning', 'Create form_ids array with appropriate form IDs'],
        epicContext: 'Translation-to-form relationship - core architecture requirement'
      }
    ],
    formLevelIssues: [
      {
        ruleId: 'legacy-person-terms',
        severity: 'critical',
        message: 'Form "io parlo" uses legacy person terms',
        currentValue: ['io'],
        expectedValue: ['first-person'],
        autoFix: 'Replace with universal terms: io → first-person',
        epicContext: 'Multi-language support requires universal terminology'
      }
    ],
    crossTableIssues: [],
    missingBuildingBlocks: ['participio-passato'],
    deprecatedContent: [],
    autoFixableIssues: [
      {
        ruleId: 'legacy-person-terms',
        severity: 'critical',
        message: 'Form "io parlo" uses legacy person terms',
        autoFix: 'Replace with universal terms: io → first-person'
      }
    ],
    manualInterventionRequired: [
      {
        ruleId: 'missing-form-ids-array',
        severity: 'critical',
        message: 'Translation "to speak" missing form_ids array',
        manualSteps: ['Identify which forms belong to this translation meaning', 'Create form_ids array with appropriate form IDs']
      }
    ],
    migrationReadiness: false,
    priorityLevel: 'high',
    estimatedFixTime: '25 minutes'
  };

  const mockSystemAnalysis = {
    totalVerbs: 150,
    analyzedVerbs: 50,
    complianceDistribution: {
      compliant: 12,
      needsWork: 28,
      criticalIssues: 8,
      blocksMigration: 2
    },
    overallScore: {
      overall: 72,
      critical: 88,
      blockers: 2,
      warnings: 36,
      verbsCompliant: 12,
      verbsNeedingWork: 38
    },
    topIssues: [
      { ruleId: 'missing-form-ids-array', count: 35, impact: 'Breaks translation-to-form relationship architecture' },
      { ruleId: 'legacy-person-terms', count: 28, impact: 'Prevents multi-language expansion' },
      { ruleId: 'missing-auxiliary-assignment', count: 22, impact: 'Prevents compound tense materialization' }
    ],
    autoFixableCount: 156,
    estimatedWorkRequired: '12 hours',
    migrationReadiness: {
      ready: false,
      blockers: ['2 verbs have critical migration-blocking issues', '15 verbs missing essential building blocks'],
      recommendations: ['Address migration-blocking issues immediately', 'Run automated fixes for 156 auto-fixable issues']
    }
  };

  const handleVerbValidation = async () => {
    if (!selectedVerb.trim()) return;
    
    setIsValidating(true);
    
    // Simulate validation delay
    setTimeout(() => {
      setValidationResult(mockVerbResult);
      setIsValidating(false);
    }, 1500);

    // Real implementation would be:
    // const validator = new ConjugationComplianceValidator(supabaseClient);
    // const result = await validator.validateSpecificVerb(selectedVerb);
    // setValidationResult(result);
  };

  const handleSystemAnalysis = async () => {
    setIsValidating(true);
    
    // Simulate system analysis delay
    setTimeout(() => {
      setSystemAnalysis(mockSystemAnalysis);
      setIsValidating(false);
    }, 3000);

    // Real implementation would be:
    // const validator = new ConjugationComplianceValidator(supabaseClient);
    // const result = await validator.validateConjugationSystem(validationOptions);
    // setSystemAnalysis(result);
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
          onClick={() => setActiveTab('debug')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'debug'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Debug Console
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

      {/* Debug Console Tab */}
      {activeTab === 'debug' && (
        <div className="space-y-6">
          {/* Debug Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Debug Console</h2>
              <div className="flex gap-2">
                <button
                  onClick={clearDebugLog}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Clear Log
                </button>
                <button
                  onClick={handleVerbValidation}
                  disabled={isValidating || !selectedVerb.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Debug Validate
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Verb
              </label>
              <input
                type="text"
                value={selectedVerb}
                onChange={(e) => setSelectedVerb(e.target.value)}
                placeholder="e.g., finire, parlare, essere..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleVerbValidation()}
              />
            </div>
          </div>

          {/* Debug Log */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Log</h3>
            <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto">
              {debugLog.length === 0 ? (
                <div className="text-gray-500">No debug information yet. Run a validation to see detailed logs.</div>
              ) : (
                debugLog.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Debug Data Viewer */}
          {Object.keys(debugData).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Inspector</h3>
              <div className="space-y-4">
                {Object.entries(debugData).map(([key, value]) => (
                  <div key={key} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-2">{key}</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Supabase URL:</span>
                <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 
                    '❌ Not configured'
                  }
                </div>
              </div>
              <div>
                <span className="font-medium">Supabase Key:</span>
                <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
                    '❌ Not configured'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div className="ml-3">
                        <h5 className="text-red-800 font-medium">Critical for Compound Generation</h5>
                        <p className="text-red-700 text-sm mt-1">
                          Missing: {validationResult.missingBuildingBlocks.join(', ')}
                        </p>
                        <p className="text-red-600 text-xs mt-2">
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
                onChange={(e) => setValidationOptions(prev => ({ ...prev, priorityFilter: e.target.value }))}
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
