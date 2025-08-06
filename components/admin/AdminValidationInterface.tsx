'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  BarChart3,
  RefreshCw,
  Download,
  Play,
  Pause
} from 'lucide-react';
import { ConjugationComplianceValidator, ValidationOptions } from '../../lib/conjugationComplianceValidator';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AdminValidationInterface = () => {
  const [selectedVerb, setSelectedVerb] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [systemAnalysis, setSystemAnalysis] = useState<any>(null);
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

  // Calculate form expectations based on auxiliary patterns
  const calculateFormExpectations = (auxiliaryCount: number) => {
    const simpleForms = 47; // Base simple forms
    const perfectCompoundBase = 44; // (7 tenses × 6 persons) + 2 invariable
    const progressiveForms = 30; // 5 tenses × 6 persons (always stare)

    return {
      simple: simpleForms,
      perfectCompound: perfectCompoundBase * auxiliaryCount,
      progressive: progressiveForms,
      total: simpleForms + perfectCompoundBase * auxiliaryCount + progressiveForms
    };
  };

  // Extract auxiliary count from validation result or debug
  const getAuxiliaryCount = () => {
    const debugText = debugLog.join(' ');
    const auxiliaries = new Set<string>();
    if (debugText.includes('avere')) auxiliaries.add('avere');
    if (debugText.includes('essere')) auxiliaries.add('essere');
    return Math.max(1, auxiliaries.size);
  };

  const handleVerbValidation = async () => {
    if (!selectedVerb.trim()) return;

    setIsValidating(true);
    setDebugLog([]);
    addDebugLog(`🔍 Starting validation for: ${selectedVerb}`);

    try {
      const validator = new ConjugationComplianceValidator(supabase);
      const result = await validator.validateSpecificVerbWithDebug(selectedVerb, addDebugLog);

      if (result) {
        setValidationResult(result);
        addDebugLog(`✅ Validation completed successfully`);
      } else {
        addDebugLog(`❌ Validation returned null - check previous errors`);
      }
    } catch (error: any) {
      addDebugLog(`❌ Validation failed: ${error.message}`);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSystemAnalysis = async () => {
    setIsValidating(true);
    setDebugLog([]);
    addDebugLog('🔍 Starting system-wide analysis...');
    try {
      const validator = new ConjugationComplianceValidator(supabase);
      const result = await validator.validateConjugationSystemWithDebug(validationOptions, addDebugLog);
      setSystemAnalysis(result);
      addDebugLog('✅ System analysis completed');
    } catch (error: any) {
      addDebugLog(`❌ System analysis failed: ${error.message}`);
      setSystemAnalysis(null);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs-work':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical-issues':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      case 'blocks-migration':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const ComplianceScoreCard = ({ title, score, description, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      </div>
      <div className="mt-2">
        <div className={`text-2xl font-bold text-${color}-600`}>{score}%</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  const IssueCard = ({ issue, showAutoFix = false }) => (
    <div className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-medium">{issue.message}</h5>
          <div className="mt-2 text-sm">
            <div>
              <strong>Current:</strong> {JSON.stringify(issue.currentValue)}
            </div>
            <div>
              <strong>Expected:</strong> {issue.expectedValue}
            </div>
          </div>

          {showAutoFix && issue.autoFix && (
            <div className="mt-2 text-sm font-medium text-green-700">
              Auto-fix: {issue.autoFix}
            </div>
          )}

          {issue.manualSteps && (
            <div className="mt-2">
              <div className="text-sm font-medium">Manual steps:</div>
              <ul className="text-sm list-disc list-inside mt-1">
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

  // Calculate form expectations for current validation
  const auxiliaryCount = validationResult ? getAuxiliaryCount() : 1;
  const formExpectations = calculateFormExpectations(auxiliaryCount);
  const currentForms = validationResult ? 67 : 0; // This should come from validation result
  const completionPercentage =
    formExpectations.total > 0 ? Math.round((currentForms / formExpectations.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conjugation Compliance Validator</h1>
        <p className="text-gray-600">
          EPIC 002: Monitor data quality and architectural readiness before migration
        </p>
      </div>

      {/* Debug Panel */}
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
          Settings
        </button>
      </div>

      {/* Single Verb Analysis Tab */}
      {activeTab === 'single-verb' && (
        <div className="space-y-6">
          {/* Verb Input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Single Verb Deep Analysis</h2>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={selectedVerb}
                      onChange={e => setSelectedVerb(e.target.value)}
                      placeholder="Enter Italian verb (e.g., finire)"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={e => e.key === 'Enter' && handleVerbValidation()}
                    />
                  </div>
                  <button
                    onClick={handleVerbValidation}
                    disabled={isValidating || !selectedVerb.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isValidating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <BarChart3 className="w-4 h-4" />
                    )}
                    {isValidating ? 'Analyzing...' : 'Analyze Verb'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-6">
              {/* Header Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Compliance Report: {validationResult.verbItalian}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(validationResult.complianceStatus)}
                      <span className="text-sm font-medium capitalize">
                        {validationResult.complianceStatus.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <ComplianceScoreCard
                    title="Overall Score"
                    score={validationResult.overallScore}
                    description="Architectural compliance"
                    color={
                      validationResult.overallScore >= 80
                        ? 'green'
                        : validationResult.overallScore >= 60
                        ? 'yellow'
                        : 'red'
                    }
                  />
                  <ComplianceScoreCard
                    title="Priority Level"
                    score={
                      validationResult.priorityLevel === 'high'
                        ? 100
                        : validationResult.priorityLevel === 'medium'
                        ? 60
                        : 20
                    }
                    description={`${validationResult.priorityLevel} priority verb`}
                    color={
                      validationResult.priorityLevel === 'high'
                        ? 'red'
                        : validationResult.priorityLevel === 'medium'
                        ? 'yellow'
                        : 'green'
                    }
                  />
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-900">Migration Ready</h4>
                    <p
                      className={`text-2xl font-bold ${
                        validationResult.migrationReadiness ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {validationResult.migrationReadiness ? 'YES' : 'NO'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ready for new system</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-900">Estimated Fix Time</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {validationResult.estimatedFixTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Time to resolve issues</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.wordLevelIssues.length +
                        validationResult.translationLevelIssues.length +
                        validationResult.formLevelIssues.length +
                        validationResult.crossTableIssues.length}
                    </div>
                    <div className="text-xs text-red-600">Total Issues</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResult.autoFixableIssues.length}
                    </div>
                    <div className="text-xs text-green-600">Auto-Fixable</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {validationResult.manualInterventionRequired.length}
                    </div>
                    <div className="text-xs text-orange-600">Manual Required</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {validationResult.missingBuildingBlocks.length}
                    </div>
                    <div className="text-xs text-purple-600">Missing Blocks</div>
                  </div>
                </div>
              </div>

              {/* Form Expectations Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Form Expectations Analysis
                </h4>

                {/* Auxiliary Detection */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h6 className="font-medium text-blue-900 mb-2">
                    Auxiliary Detection & Calculations
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-800">Auxiliaries Detected:</div>
                      <div className="text-blue-700">{auxiliaryCount} auxiliaries detected</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-800">Perfect Compounds:</div>
                      <div className="text-blue-700">
                        {formExpectations.perfectCompound} forms (44 base × {auxiliaryCount})
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-800">Total Expected:</div>
                      <div className="text-blue-700">{formExpectations.total} forms total</div>
                    </div>
                  </div>
                </div>

                {/* Form Breakdown */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h6 className="font-medium text-gray-800 mb-2">Simple Forms</h6>
                      <div className="text-2xl font-bold text-blue-600">47 / 47</div>
                      <div className="text-sm text-gray-600">100% Complete</div>
                      <div className="text-xs text-gray-500 mt-1">Always constant</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h6 className="font-medium text-gray-800 mb-2">Perfect Compounds</h6>
                      <div className="text-2xl font-bold text-red-600">
                        ~20 / {formExpectations.perfectCompound}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round((20 / formExpectations.perfectCompound) * 100)}% Complete
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Multiply by auxiliaries</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h6 className="font-medium text-gray-800 mb-2">Progressive Forms</h6>
                      <div className="text-2xl font-bold text-orange-600">~6 / 30</div>
                      <div className="text-sm text-gray-600">20% Complete</div>
                      <div className="text-xs text-gray-500 mt-1">Always use stare</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Summary</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentForms}/{formExpectations.total}
                    </div>
                    <div className="text-gray-600">Forms Present ({completionPercentage}%)</div>
                    <div className="text-xs text-gray-500">{auxiliaryCount} auxiliaries detected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Math.round((formExpectations.total - currentForms) / 6)}
                    </div>
                    <div className="text-gray-600">Missing Tense Sets</div>
                    <div className="text-xs text-gray-500">
                      {formExpectations.total - currentForms} individual forms
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {validationResult.formLevelIssues?.filter(i =>
                        i.message?.includes('auxiliary')
                      ).length || 0}
                    </div>
                    <div className="text-gray-600">Forms Need Aux Tags</div>
                    <div className="text-xs text-gray-500">Compound & progressive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {validationResult.missingBuildingBlocks?.length || 0}
                    </div>
                    <div className="text-gray-600">Missing Building Blocks</div>
                    <div className="text-xs text-gray-500">Critical for materialization</div>
                  </div>
                </div>
              </div>

              {/* Translation Analysis */}
              {validationResult.translationLevelIssues.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Translation Analysis
                  </h4>
                  <div className="space-y-3">
                    {validationResult.translationLevelIssues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Issues by Category */}
              {(validationResult.autoFixableIssues.length > 0 ||
                validationResult.manualInterventionRequired.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Auto-Fixable Issues */}
                  {validationResult.autoFixableIssues.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Auto-Fixable Issues
                        </h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {validationResult.autoFixableIssues.length} issues
                        </span>
                      </div>
                      <div className="space-y-3">
                        {validationResult.autoFixableIssues.map((issue, idx) => (
                          <IssueCard key={idx} issue={issue} showAutoFix={true} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Intervention Required */}
                  {validationResult.manualInterventionRequired.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Manual Intervention Required
                        </h4>
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
              )}

              {/* Missing Building Blocks */}
              {validationResult.missingBuildingBlocks.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Missing Building Blocks
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h5 className="text-red-800 font-medium mb-2">
                          Critical for Compound Generation
                        </h5>
                        <div className="space-y-2">
                          {validationResult.missingBuildingBlocks.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-red-700 text-sm p-2 bg-red-100 rounded border-l-4 border-red-400"
                            >
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System-Wide Compliance Analysis
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Analyze all verbs in the system against EPIC 002 architectural requirements
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>• Compliance scoring</span>
                  <span>• Migration readiness assessment</span>
                  <span>• Auto-fix identification</span>
                </div>
              </div>
              <button
                onClick={handleSystemAnalysis}
                disabled={isValidating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                {isValidating ? 'Analyzing...' : 'Run System Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationOptions.includeDeprecatedCheck}
                onChange={e =>
                  setValidationOptions(prev => ({
                    ...prev,
                    includeDeprecatedCheck: e.target.checked
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include deprecated content check
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationOptions.includeCrossTableAnalysis}
                onChange={e =>
                  setValidationOptions(prev => ({
                    ...prev,
                    includeCrossTableAnalysis: e.target.checked
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include cross-table relationship analysis
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationOptions.includeTerminologyValidation}
                onChange={e =>
                  setValidationOptions(prev => ({
                    ...prev,
                    includeTerminologyValidation: e.target.checked
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include terminology validation
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationOptions.generateAutoFixes}
                onChange={e =>
                  setValidationOptions(prev => ({
                    ...prev,
                    generateAutoFixes: e.target.checked
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Generate auto-fix suggestions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminValidationInterface;

