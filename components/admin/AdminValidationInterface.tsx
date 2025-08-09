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
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [expandedMoodTenses, setExpandedMoodTenses] = useState<Set<string>>(new Set());

  const toggleMoodTenseExpansion = (key: string) => {
    const newExpanded = new Set(expandedMoodTenses);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMoodTenses(newExpanded);
  };

  // Duplicate detection helper
  const detectDuplicateForms = (forms) => {
    const formGroups = new Map();

    forms.forEach(form => {
      const tags = form.tags || [];
      const mood = tags.find(t => ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'].includes(t));
      const person = tags.find(t => ['prima-persona', 'seconda-persona', 'terza-persona'].includes(t));
      const number = tags.find(t => ['singolare', 'plurale'].includes(t));
      const auxiliary = tags.find(t => t.includes('auxiliary'));
      const tense = tags.find(t =>
        t.includes('presente') || t.includes('passato') || t.includes('futuro') ||
        t.includes('imperfetto') || t.includes('remoto') || t.includes('trapassato')
      );

      // Create unique key for this form type
      const key = `${mood}-${tense}-${person}-${number}-${auxiliary || 'none'}`;

      if (!formGroups.has(key)) {
        formGroups.set(key, []);
      }
      formGroups.get(key).push(form);
    });

    // Find groups with duplicates
    const duplicates = new Map();
    formGroups.forEach((forms, key) => {
      if (forms.length > 1) {
        duplicates.set(key, forms);
      }
    });

    return duplicates;
  };

  const getTenseDuplicateInfo = (tenseInfo, moodName, analysis) => {
    const moodTenseForms = analysis.rawData.forms.filter(f =>
      f.tags?.includes(moodName) && f.tags?.includes(tenseInfo.tense)
    );

    const duplicates = detectDuplicateForms(moodTenseForms);
    const duplicateCount = Array.from(duplicates.values()).reduce((sum, forms) => sum + forms.length, 0);

    return {
      hasDuplicates: duplicates.size > 0,
      duplicateGroups: duplicates.size,
      duplicateFormsCount: duplicateCount,
      totalForms: moodTenseForms.length
    };
  };

  const getFormAuxiliary = (form) => {
    const tags = form.tags || [];
    const auxTag = tags.find(t => t.includes('auxiliary'));
    if (auxTag) {
      return auxTag.replace('-auxiliary', '');
    }
    return null;
  };

  const getAuxiliaryMismatches = (form, analysis) => {
    const formAuxiliary = getFormAuxiliary(form);
    if (!formAuxiliary) return [];

    const linkedTranslations = analysis.rawData.formTranslations
      .filter(ft => ft.form_id === form.id)
      .map(ft => {
        const translation = analysis.rawData.translations.find(t => t.id === ft.word_translation_id);
        return {
          ...ft,
          translationAuxiliary: translation?.context_metadata?.auxiliary,
          translationText: translation?.translation
        };
      });

    return linkedTranslations.filter(lt =>
      lt.translationAuxiliary && lt.translationAuxiliary !== formAuxiliary
    );
  };

  // REPLACE the existing renderTenseWithDropdown function with this enhanced version:
  const renderTenseWithDropdown = (tenseInfo, moodName, analysis) => {
    const constraints = analysis.translationConstraints || {
      isReciprocal: false,
      expectedFormsMultiplier: 1.0
    };

    // Adjust expected count for reciprocal verbs (finite tenses only)
    let adjustedExpected = tenseInfo.expected;
    const isFiniteTense = tenseInfo.expected === 6; // Finite tenses expect 6 normally

    if (constraints.isReciprocal && isFiniteTense) {
      adjustedExpected = 3; // Reciprocal verbs only have plural forms
    }

    const found = analysis.formCounts.byMood[moodName]?.[tenseInfo.tense] || 0;
    const tenseKey = `${moodName}-${tenseInfo.tense}`;
    const isExpanded = expandedMoodTenses.has(tenseKey);
    
    // Get actual forms for this mood/tense
    const moodTenseForms = analysis.rawData.forms.filter(f =>
      f.tags?.includes(moodName) && f.tags?.includes(tenseInfo.tense)
    ).sort((a, b) => {
      // Sort by: First Singular, Second Singular, Third Singular, First Plural, Second Plural, Third Plural
      const getOrder = (form) => {
        const tags = form.tags || [];
        const isSingular = tags.includes('singolare');
        const isPrima = tags.includes('prima-persona');
        const isSeconda = tags.includes('seconda-persona');
        
        if (isSingular) {
          if (isPrima) return 1;
          if (isSeconda) return 2;
          return 3; // terza-persona
        } else {
          if (isPrima) return 4;
          if (isSeconda) return 5;
          return 6; // terza-persona
        }
      };
      return getOrder(a) - getOrder(b);
    });

    return (
      <div key={tenseInfo.tense} className={`border rounded ${found >= adjustedExpected ? 'bg-gray-50' : 'bg-red-50'}`}>
        <button
          onClick={() => toggleMoodTenseExpansion(tenseKey)}
          className={`w-full flex justify-between items-center p-2 text-left hover:bg-gray-100 ${
            found >= adjustedExpected ? '' : 'hover:bg-red-100'
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span>{tenseInfo.name} ({adjustedExpected} forms)</span>
              {constraints.isReciprocal && isFiniteTense && (
                <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 text-xs rounded font-medium">
                  PLURAL ONLY
                </span>
              )}
              {(() => {
                const duplicateInfo = getTenseDuplicateInfo(tenseInfo, moodName, analysis);
                if (duplicateInfo.hasDuplicates) {
                  return (
                    <span className="px-1.5 py-0.5 bg-orange-200 text-orange-800 text-xs rounded font-medium">
                      {duplicateInfo.duplicateGroups} DUPE GROUPS
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={found >= adjustedExpected ? 'text-green-600' : 'text-red-600'}>
              {found >= adjustedExpected ? '✅ Complete' : `❌ ${found}/${adjustedExpected}`}
            </span>
            <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="border-t bg-white p-3">
            {moodTenseForms.length === 0 ? (
              <div className="text-red-600 text-sm">No forms found for this tense</div>
            ) : (
              <div className="space-y-3">
            {moodTenseForms.map((form, formIdx) => {
              // Get linked translations for this form
              const linkedTranslations = analysis.rawData.formTranslations
                .filter(ft => ft.form_id === form.id)
                .map(ft => {
                  const wordTranslation = analysis.rawData.translations.find(t => t.id === ft.word_translation_id);
                  return {
                    ...ft,
                    translationAuxiliary: wordTranslation?.context_metadata?.auxiliary,
                    translationText: ft.translation,
                    wordTranslationText: wordTranslation?.translation
                  };
                });

              // Check for auxiliary mismatches
              const formAuxiliary = getFormAuxiliary(form);
              const auxiliaryMismatches = getAuxiliaryMismatches(form, analysis);

              // Check if this form is a duplicate
              const duplicates = detectDuplicateForms(moodTenseForms);
              const tags = form.tags || [];
              const mood = tags.find(t => ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'].includes(t));
              const person = tags.find(t => ['prima-persona', 'seconda-persona', 'terza-persona'].includes(t));
              const number = tags.find(t => ['singolare', 'plurale'].includes(t));
              const auxiliary = tags.find(t => t.includes('auxiliary'));
              const tense = tags.find(t =>
                t.includes('presente') || t.includes('passato') || t.includes('futuro') ||
                t.includes('imperfetto') || t.includes('remoto') || t.includes('trapassato')
              );
              const duplicateKey = `${mood}-${tense}-${person}-${number}-${auxiliary || 'none'}`;
              const isDuplicate = duplicates.has(duplicateKey);

              const personLabel = form.tags?.includes('prima-persona') ? 'First' :
                               form.tags?.includes('seconda-persona') ? 'Second' : 'Third';
              const numberLabel = form.tags?.includes('singolare') ? 'Singular' : 'Plural';

              // Categorize tags
              const expectedTags = (form.tags || []).filter(tag =>
                // Mood/tense tags
                ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'].includes(tag) ||
                tag.includes('presente') || tag.includes('passato') || tag.includes('futuro') ||
                tag.includes('imperfetto') || tag.includes('remoto') || tag.includes('trapassato') ||
                // Person/number tags
                ['prima-persona', 'seconda-persona', 'terza-persona', 'singolare', 'plurale'].includes(tag) ||
                // Form type tags
                ['simple', 'compound', 'progressive'].includes(tag) ||
                // Auxiliary tags
                tag.includes('auxiliary') ||
                // Regularity tags
                tag.includes('irregular') || tag.includes('regular')
              );

              const otherTags = (form.tags || []).filter(tag => !expectedTags.includes(tag));

              return (
                <div key={formIdx} className={`border rounded p-3 ${
                  isDuplicate ? 'bg-orange-50 border-orange-200' :
                  auxiliaryMismatches.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                }`}>
                  {/* Form Header with Warnings */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{personLabel} Person {numberLabel}</div>
                        {isDuplicate && (
                          <span className="px-1.5 py-0.5 bg-orange-200 text-orange-800 text-xs rounded font-medium">
                            DUPLICATE
                          </span>
                        )}
                        {auxiliaryMismatches.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-200 text-red-800 text-xs rounded font-medium">
                            AUX MISMATCH
                          </span>
                        )}
                      </div>
                      <div className="text-blue-600 font-mono text-lg">"{form.form_text}"</div>
                      {formAuxiliary && (
                        <div className="text-xs text-gray-600">Form Auxiliary: {formAuxiliary}</div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      linkedTranslations.length > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {linkedTranslations.length > 0 ? '✅ Translated' : '⚠️ No Translation'}
                    </div>
                  </div>

                  {/* Linked Translations with Auxiliary Info */}
                  {linkedTranslations.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">English Translations:</div>
                      <div className="space-y-1">
                        {linkedTranslations.map((lt, transIdx) => {
                          const isAuxMismatch = formAuxiliary && lt.translationAuxiliary &&
                                               formAuxiliary !== lt.translationAuxiliary;

                          return (
                            <div key={transIdx} className={`flex items-center justify-between p-2 rounded text-xs ${
                              isAuxMismatch ? 'bg-red-100 border border-red-300' : 'bg-green-100'
                            }`}>
                              <div className="flex-1">
                                <div className={isAuxMismatch ? 'text-red-800 font-medium' : 'text-green-800'}>
                                  "{lt.translationText}"
                                </div>
                                {lt.wordTranslationText && (
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    From: "{lt.wordTranslationText}"
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded ${
                                  isAuxMismatch ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                }`}>
                                  Trans Aux: {lt.translationAuxiliary || 'none'}
                                </span>
                                {isAuxMismatch && (
                                  <span className="text-red-600 font-bold">❌</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expected Tags */}
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">Expected Tags ({expectedTags.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {expectedTags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Other Tags */}
                  {otherTags.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Other Tags ({otherTags.length}):</div>
                      <div className="flex flex-wrap gap-1">
                        {otherTags.map((tag, tagIdx) => (
                          <span key={tagIdx} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}
      </div>
    );
  };

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

      {debugLog.length > 0 && (
        <div className="mb-6 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="w-full flex justify-between items-center p-4 text-white font-semibold hover:bg-gray-800"
          >
            <span>Debug Console ({debugLog.length} entries)</span>
            <span>{showDebugPanel ? '▼' : '▶'}</span>
          </button>
          {showDebugPanel && (
            <div className="p-4 max-h-96 overflow-y-auto border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-semibold">Debug Output</h3>
                <button
                  onClick={() => setDebugLog([])}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              </div>
              {debugLog.map((log, idx) => (
                <div key={idx} className="py-1 border-b border-gray-700 last:border-b-0">
                  {log}
                </div>
              ))}
            </div>
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

              {/* REAL DATA SUMMARY - MOVED TO TOP */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comprehensive Validation Summary (REAL DATA)</h4>
                
                {(() => {
                  const analysis = validationResult.detailedAnalysis;
                  if (!analysis?.rawData) return <div className="text-red-600">No analysis data available</div>;

                  // Use the SAME calculation logic as the detailed form analysis
                  const auxiliaries = analysis.auxiliaries;
                  const auxiliaryCount = auxiliaries.length || 1;

                  // Expected forms calculation (same as Form Expectations Calculator)
                  const expectations = {
                    simple: 51,
                    perfectCompound: 49 * auxiliaryCount,
                    progressive: 30,
                    total: 51 + (49 * auxiliaryCount) + 30
                  };

                  // Actual form counts (same as detailed analysis)
                  const actualCounts = analysis.formCounts.byType;

                  // Calculate real expected vs missing tags
                  const wordTagStats = {
                    conjugationClass: analysis.rawData.wordTags.filter(tag => 
                      ['are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'].includes(tag)
                    ).length > 0,
                    transitivity: analysis.rawData.wordTags.filter(tag => 
                      ['always-transitive', 'always-intransitive', 'both-possible'].includes(tag)
                    ).length > 0,
                    irregularity: analysis.rawData.wordTags.filter(tag => 
                      tag.includes('irregular') || tag.includes('regular')
                    ).length > 0
                  };

                  const translationStats = {
                    withAuxiliary: analysis.rawData.translations.filter(t => 
                      t.context_metadata?.auxiliary
                    ).length,
                    withTransitivity: analysis.rawData.translations.filter(t => 
                      t.context_metadata?.transitivity
                    ).length,
                    total: analysis.rawData.translations.length
                  };

                  const formStats = {
                    withMoodTense: analysis.rawData.forms.filter(f => {
                      const moods = ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'];
                      return f.tags?.some(tag => moods.includes(tag));
                    }).length,
                    withTranslations: analysis.rawData.formTranslations.length,
                    totalForms: analysis.rawData.forms.length,
                    expectedForms: expectations.total // Use same calculation as detailed analysis
                  };

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Word Level Summary */}
                      <div className="p-4 border rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">Word Level Tags</h6>
                        <div className="space-y-1 text-sm">
                          <div className={`flex justify-between ${wordTagStats.conjugationClass ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Conjugation Class:</span>
                            <span>{wordTagStats.conjugationClass ? '✅' : '❌'}</span>
                          </div>
                          <div className={`flex justify-between ${wordTagStats.transitivity ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Transitivity:</span>
                            <span>{wordTagStats.transitivity ? '✅' : '❌'}</span>
                          </div>
                          <div className={`flex justify-between ${wordTagStats.irregularity ? 'text-green-600' : 'text-orange-600'}`}>
                            <span>Regularity:</span>
                            <span>{wordTagStats.irregularity ? '✅' : '⚠️'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Translation Level Summary */}
                      <div className="p-4 border rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">Translation Metadata</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>With Auxiliary:</span>
                            <span className={translationStats.withAuxiliary === translationStats.total ? 'text-green-600' : 'text-red-600'}>
                              {translationStats.withAuxiliary}/{translationStats.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>With Transitivity:</span>
                            <span className={translationStats.withTransitivity === translationStats.total ? 'text-green-600' : 'text-red-600'}>
                              {translationStats.withTransitivity}/{translationStats.total}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Form Level Summary - CORRECTED */}
                      <div className="p-4 border rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">Form Classification</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>With Mood/Tense:</span>
                            <span className={formStats.withMoodTense === formStats.totalForms ? 'text-green-600' : 'text-red-600'}>
                              {formStats.withMoodTense}/{formStats.totalForms}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Forms:</span>
                            <span className={`${formStats.totalForms === formStats.expectedForms ? 'text-green-600' : 'text-orange-600'}`}>
                              {formStats.totalForms}/{formStats.expectedForms}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Form-Translation Links Summary - CORRECTED */}
                      <div className="p-4 border rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">Form-Translation Links</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Links:</span>
                            <span className="text-blue-600">{formStats.withTranslations}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coverage:</span>
                            <span className={formStats.withTranslations >= formStats.expectedForms ? 'text-green-600' : 'text-orange-600'}>
                              {Math.round((formStats.withTranslations / formStats.expectedForms) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Detailed Analysis by Category */}
              <div className="space-y-6">
                {/* Word Level Analysis - FIXED TO SHOW ACTUAL VALUES */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Word Level Analysis</h4>

                  {(() => {
                    const analysis = validationResult.detailedAnalysis;
                    if (!analysis?.rawData) return <div className="text-red-600">No word data available</div>;

                    const wordTags = analysis.rawData.wordTags;

                    const tagCategories = [
                      {
                        name: 'Conjugation Class',
                        options: ['are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'],
                        present: wordTags.filter(tag => 
                          ['are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'].includes(tag)
                        ),
                        rule: 'exactly-one',
                        critical: true
                      },
                      {
                        name: 'Transitivity',
                        options: ['always-transitive', 'always-intransitive', 'both-possible'],
                        present: wordTags.filter(tag => 
                          ['always-transitive', 'always-intransitive', 'both-possible'].includes(tag)
                        ),
                        rule: 'exactly-one',
                        critical: true
                      },
                      {
                        name: 'Regularity Pattern',
                        options: ['regular-pattern', 'irregular-pattern', 'stem-changing', 'irregular-participle', 'irregular-gerund', 'irregular-imperative'],
                        present: wordTags.filter(tag => 
                          tag.includes('irregular') || tag.includes('regular') || tag.includes('stem-changing')
                        ),
                        rule: 'at-least-one',
                        critical: true
                      },
                      {
                        name: 'Frequency',
                        options: ['freq-top100', 'freq-top200', 'freq-top500', 'freq-top1000', 'freq-top5000'],
                        present: wordTags.filter(tag => 
                          tag.startsWith('freq-')
                        ),
                        rule: 'at-least-one',
                        critical: false
                      },
                      {
                        name: 'CEFR Level',
                        options: ['CEFR-A1', 'CEFR-A2', 'CEFR-B1', 'CEFR-B2', 'CEFR-C1', 'CEFR-C2'],
                        present: wordTags.filter(tag => 
                          tag.startsWith('CEFR-')
                        ),
                        rule: 'at-least-one',
                        critical: false
                      }
                    ];

                    return (
                      <div className="space-y-4">
                        {/* Critical Required Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {tagCategories.filter(cat => cat.critical).map((category, idx) => {
                            const isComplete = category.rule === 'exactly-one' ? category.present.length === 1 : category.present.length > 0;
                            const expectedCount = category.rule === 'exactly-one' ? '1' : '1+';

                            return (
                              <div key={idx} className={`border rounded p-3 ${isComplete ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className={`font-medium text-sm ${isComplete ? 'text-green-800' : 'text-red-800'}`}>{category.name}</h6>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    isComplete ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {isComplete ? '✅' : '❌'} {category.present.length}/{expectedCount}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <div className="text-xs text-gray-600 mb-1">Present Tags:</div>
                                  {category.present.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {category.present.map((tag, tagIdx) => (
                                        <span key={tagIdx} className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-blue-100 text-blue-800">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-red-600 text-xs">None found</div>
                                  )}
                                </div>

                                {!isComplete && (
                                  <div className="text-xs text-red-700">
                                    <strong>Expected one of:</strong> {category.options.join(', ')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Optional Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tagCategories.filter(cat => !cat.critical).map((category, idx) => {
                            const isComplete = category.present.length > 0;

                            return (
                              <div key={idx} className={`border rounded p-3 ${isComplete ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className={`font-medium text-sm ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>{category.name}</h6>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {isComplete ? '✅' : '⚠️'} {category.present.length}/1+
                                  </span>
                                </div>

                                {category.present.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {category.present.map((tag, tagIdx) => (
                                      <span key={tagIdx} className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-blue-100 text-blue-800">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* All Present Word Tags */}
                        <div className="border rounded p-3 bg-blue-50">
                          <h6 className="font-medium text-sm text-blue-900 mb-2">All Present Word Tags ({wordTags.length} total)</h6>
                          <div className="flex flex-wrap gap-1">
                            {wordTags.map((tag, tagIdx) => (
                              <span key={tagIdx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-mono bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Translation Analysis with INTEGRATED METADATA - REAL STRUCTURED DATA */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Translation Analysis</h4>
                  <div className="space-y-4">
                    {(() => {
                      const analysis = validationResult.detailedAnalysis;
                      if (!analysis?.rawData) {
                        return <div className="text-red-600">No translation analysis available</div>;
                      }

                      const translations = analysis.rawData.translations;

                      // Group validation issues by translation
                      const translationIssuesByTranslation = new Map();
                      validationResult.translationLevelIssues.forEach(issue => {
                        const translationMatch = issue.message.match(/Translation.*?"([^"]+)"/);
                        const translationName = translationMatch ? translationMatch[1] : 'Unknown Translation';

                        if (!translationIssuesByTranslation.has(translationName)) {
                          translationIssuesByTranslation.set(translationName, []);
                        }
                        translationIssuesByTranslation.get(translationName).push(issue);
                      });

                      return (
                        <div className="space-y-4">
                          {translations.map((translation, idx) => {
                            const translationIssues = translationIssuesByTranslation.get(translation.translation) || [];
                            const hasIssues = translationIssues.length > 0;
                            const metadata = translation.context_metadata || {};
                            const coverage = analysis.formTranslationCoverage.translationBreakdown[idx];

                            return (
                              <div key={idx} className={`border rounded-lg p-4 ${
                                hasIssues ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                              }`}>
                                {/* Translation Header */}
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h6 className={`font-medium ${hasIssues ? 'text-red-900' : 'text-green-900'}`}>
                                      Translation: "{translation.translation}"
                                    </h6>
                                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-3">
                                      <span>Priority: {translation.display_priority}</span>
                                      <span>Coverage: {coverage?.coverage || 0}% ({coverage?.actual || 0}/{130})</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      hasIssues ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                    }`}>
                                      {hasIssues ? `${translationIssues.length} issues` : 'No issues'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      idx === 0 ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                                    }`}>
                                      {metadata.auxiliary || 'no aux'}
                                    </span>
                                  </div>
                                </div>

                                {/* Metadata Display */}
                                <div className="mb-3">
                                  <h6 className="text-sm font-medium text-gray-700 mb-2">Translation Metadata</h6>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                      { name: 'Auxiliary', value: metadata.auxiliary, required: true },
                                      { name: 'Transitivity', value: metadata.transitivity, required: true },
                                      { name: 'Usage', value: metadata.usage, required: false },
                                      { name: 'Register', value: metadata.register, required: false }
                                    ].map((field, fieldIdx) => {
                                      const hasValue = field.value && field.value !== 'undefined';
                                      return (
                                        <div key={fieldIdx} className={`p-2 rounded text-xs border ${
                                          hasValue ? 'bg-green-50 border-green-200' :
                                          field.required ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                          <div className={`font-medium ${
                                            hasValue ? 'text-green-800' : field.required ? 'text-red-800' : 'text-gray-600'
                                          }`}>
                                            {field.name}
                                          </div>
                                          <div className={`font-mono ${
                                            hasValue ? 'text-green-700' : field.required ? 'text-red-600' : 'text-gray-500'
                                          }`}>
                                            {hasValue ? field.value : (field.required ? 'Missing' : 'Not set')}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* All Metadata Tags */}
                                  {Object.keys(metadata).length > 0 && (
                                    <div className="mt-2 p-2 border rounded bg-blue-50">
                                      <div className="text-xs text-blue-900 font-medium mb-1">All metadata:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {Object.entries(metadata).map(([key, value], metaIdx) => (
                                          <span key={metaIdx} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800">
                                            {key}: {JSON.stringify(value)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Auxiliary Mismatch Analysis */}
                                {(() => {
                                  const translationForms = analysis.rawData.forms.filter(f =>
                                    analysis.rawData.formTranslations.some(ft =>
                                      ft.form_id === f.id && ft.word_translation_id === translation.id
                                    )
                                  );

                                  const mismatchedForms = translationForms.filter(form => {
                                    const formAux = getFormAuxiliary(form);
                                    const transAux = translation.context_metadata?.auxiliary;
                                    return formAux && transAux && formAux !== transAux;
                                  });

                                  if (mismatchedForms.length > 0) {
                                    return (
                                      <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
                                        <div className="text-red-800 font-medium text-sm mb-2">
                                          ⚠️ Auxiliary Mismatches: {mismatchedForms.length} forms
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                          {mismatchedForms.map((form, idx) => (
                                            <div key={idx} className="text-xs text-red-700 bg-red-50 p-1 rounded">
                                              "{form.form_text}" has {getFormAuxiliary(form)}-auxiliary but translation expects {translation.context_metadata?.auxiliary}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Form Level Tags - REAL STRUCTURED DATA */}
                <div className="border rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-gray-800 mb-3">Form Level Tags Summary</h5>

                  {(() => {
                    const analysis = validationResult.detailedAnalysis;
                    if (!analysis?.rawData) return <div className="text-red-600">No form data available</div>;

                    const forms = analysis.rawData.forms;

                    // Extract all unique tags from forms
                    const allFormTags = new Set<string>();
                    const tagsByCategory = {
                      moods: new Set<string>(),
                      tenses: new Set<string>(),
                      persons: new Set<string>(),
                      numbers: new Set<string>(),
                      auxiliaries: new Set<string>(),
                      other: new Set<string>()
                    };

                    forms.forEach(form => {
                      (form.tags || []).forEach(tag => {
                        allFormTags.add(tag);

                        // Categorize tags
                        if (['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'].includes(tag)) {
                          tagsByCategory.moods.add(tag);
                        } else if (tag.includes('auxiliary')) {
                          tagsByCategory.auxiliaries.add(tag);
                        } else if (tag.includes('persona')) {
                          tagsByCategory.persons.add(tag);
                        } else if (['singolare', 'plurale'].includes(tag)) {
                          tagsByCategory.numbers.add(tag);
                        } else if (
                          tag.includes('presente') ||
                          tag.includes('passato') ||
                          tag.includes('futuro') ||
                          tag.includes('imperfetto') ||
                          tag.includes('remoto') ||
                          tag.includes('trapassato')
                        ) {
                          tagsByCategory.tenses.add(tag);
                        } else {
                          tagsByCategory.other.add(tag);
                        }
                      });
                    });

                    return (
                      <div className="space-y-3">
                        {/* Tag Categories Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(tagsByCategory).map(([category, tags]) => (
                            <div key={category} className="border rounded p-2">
                              <div className="font-medium text-xs text-gray-700 mb-1 capitalize">
                                {category} ({(tags as Set<string>).size})
                              </div>
                              <div className="space-y-1">
                                {Array.from(tags as Set<string>).slice(0, 3).map((tag, idx) => (
                                  <div key={idx} className="bg-blue-50 px-1.5 py-0.5 rounded text-xs font-mono text-blue-800">
                                    {tag}
                                  </div>
                                ))}
                                {(tags as Set<string>).size > 3 && (
                                  <div className="text-gray-500 text-xs">+{(tags as Set<string>).size - 3} more</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* All Form Tags */}
                        <div className="border rounded p-3 bg-green-50">
                          <h6 className="font-medium text-sm text-green-900 mb-2">
                            All Form Tags Present ({allFormTags.size} unique across {forms.length} forms)
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(allFormTags).map((tag, tagIdx) => (
                              <span key={tagIdx} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-green-100 text-green-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Forms Analysis by Mood Groups - ACCURATE */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Forms Analysis by Mood</h4>

                  {(() => {
                    // REAL DATA from validationResult.detailedAnalysis
                    const analysis = validationResult.detailedAnalysis;
                    if (!analysis) {
                      return <div className="text-red-600">No detailed analysis available</div>;
                    }

                    const auxiliaries = analysis.auxiliaries;
                    const auxiliaryCount = auxiliaries.length || 1;
                    const actualCounts = analysis.formCounts.byType;
                    const expectations = analysis.formCounts.expectations;

                    return (
                      <>
                        {/* REAL DATA Auxiliary Detection and Calculation Info + Duplicate Detection */}
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h6 className="font-medium text-blue-900 mb-2">Form Expectations Calculator (REAL DATA)</h6>

                          {(() => {
                            const duplicates = detectDuplicateForms(analysis.rawData.forms);
                            const constraints = analysis.translationConstraints || {
                              isReciprocal: false,
                              isDirectReflexive: false,
                              expectedFormsMultiplier: 1.0,
                              allowedPersons: ['any']
                            };

                            return (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm mb-3">
                                  <div>
                                    <div className="font-medium text-blue-800">Auxiliaries Detected:</div>
                                    <div className="text-blue-700">
                                      {auxiliaryCount} total: {auxiliaries.join(', ') || 'None'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-blue-800">Verb Type:</div>
                                    <div className="text-blue-700">
                                      {constraints.isReciprocal ? 'Reciprocal (plural only)' :
                                       constraints.isDirectReflexive ? 'Direct Reflexive' : 'Standard'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-blue-800">Simple Forms:</div>
                                    <div className="text-blue-700">
                                      Found: {actualCounts.simple} / Expected: {expectations.simple}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-blue-800">Perfect Compounds:</div>
                                    <div className="text-blue-700">
                                      Found: {actualCounts.perfectCompound} / Expected: {expectations.perfectCompound}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-blue-800">Total Expected:</div>
                                    <div className="text-blue-700">
                                      {actualCounts.total} / {expectations.total} ({Math.round(actualCounts.total/expectations.total*100)}%)
                                    </div>
                                  </div>
                                </div>

                                {/* Constraint Explanation */}
                                {constraints.isReciprocal && (
                                  <div className="p-3 bg-purple-100 border border-purple-300 rounded mb-3">
                                    <div className="font-medium text-purple-800 mb-1">
                                      🔄 RECIPROCAL VERB: Form expectations adjusted for plural-only usage
                                    </div>
                                    <div className="text-purple-700 text-sm">
                                      Finite tenses expect 3 forms (1st/2nd/3rd person plural) instead of 6. 
                                      Singular persons are not applicable for reciprocal actions.
                                    </div>
                                  </div>
                                )}

                                {constraints.isDirectReflexive && (
                                  <div className="p-3 bg-green-100 border border-green-300 rounded mb-3">
                                    <div className="font-medium text-green-800 mb-1">
                                      🪞 DIRECT REFLEXIVE VERB: Standard form expectations apply
                                    </div>
                                    <div className="text-green-700 text-sm">
                                      All 6 persons (singular + plural) are valid for direct reflexive actions.
                                    </div>
                                  </div>
                                )}

                                {/* Existing duplicate forms warning */}
                                {duplicates.size > 0 && (
                                  <div className="p-3 bg-orange-100 border border-orange-300 rounded">
                                    <div className="font-medium text-orange-800 mb-1">
                                      ⚠️ Duplicate Forms Detected: {duplicates.size} duplicate groups found
                                    </div>
                                    <div className="text-orange-700 text-sm">
                                      This explains why "Found" counts exceed "Expected" - multiple forms exist for the same grammatical combination.
                                      Check form dropdowns for highlighted duplicates.
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Indicative Mood with REAL DATA */}
                        <div className="border rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-gray-800 mb-3">Indicative (Indicativo)</h5>

                          {/* Simple Tenses with REAL counts */}
                          <div className="mb-4">
                            <h6 className="font-medium text-gray-700 mb-2">Simple Tenses</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {[
                                { name: 'Presente', tense: 'presente', expected: 6 },
                                { name: 'Imperfetto', tense: 'imperfetto', expected: 6 },
                                { name: 'Futuro Semplice', tense: 'futuro-semplice', expected: 6 },
                                { name: 'Passato Remoto', tense: 'passato-remoto', expected: 6 }
                              ].map((tenseInfo) => renderTenseWithDropdown(tenseInfo, 'indicativo', analysis))}
                            </div>
                          </div>

                          {/* Perfect Compounds with REAL counts */}
                          <div className="mb-4">
                            <h6 className="font-medium text-gray-700 mb-2">Perfect Compound Tenses</h6>
                            <div className="text-xs text-gray-600 mb-2">
                              Each tense needs {auxiliaryCount === 2 ? 'both avere AND essere forms' : 'forms for detected auxiliary'}
                              ({auxiliaryCount === 2 ? '12 forms each (6 avere + 6 essere)' : '6 forms each'})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {[
                                { name: 'Passato Prossimo', tense: 'passato-prossimo', expected: 6 * auxiliaryCount },
                                { name: 'Trapassato Prossimo', tense: 'trapassato-prossimo', expected: 6 * auxiliaryCount },
                                { name: 'Futuro Anteriore', tense: 'futuro-anteriore', expected: 6 * auxiliaryCount },
                                { name: 'Trapassato Remoto', tense: 'trapassato-remoto', expected: 6 * auxiliaryCount }
                              ].map((tenseInfo) => renderTenseWithDropdown(tenseInfo, 'indicativo', analysis))}
                            </div>
                          </div>

                          {/* Progressive Tenses with REAL counts */}
                          <div className="mb-4">
                            <h6 className="font-medium text-gray-700 mb-2">Progressive Tenses</h6>
                            <div className="text-xs text-gray-600 mb-2">
                              Progressive forms always use STARE auxiliary only (6 forms each, regardless of verb's other auxiliaries)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {[
                                { name: 'Presente Progressivo', tense: 'presente-progressivo', expected: 6 },
                                { name: 'Passato Progressivo', tense: 'passato-progressivo', expected: 6 },
                                { name: 'Futuro Progressivo', tense: 'futuro-progressivo', expected: 6 }
                              ].map((tenseInfo) => renderTenseWithDropdown(tenseInfo, 'indicativo', analysis))}
                            </div>
                          </div>
                        </div>

                        {/* Subjunctive with REAL DATA */}
                        <div className="border rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-gray-800 mb-3">Subjunctive (Congiuntivo)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {[
                              { name: 'Presente', tense: 'congiuntivo-presente', expected: 6 },
                              { name: 'Imperfetto', tense: 'congiuntivo-imperfetto', expected: 6 },
                              { name: 'Passato', tense: 'congiuntivo-passato', expected: 6 * auxiliaryCount },
                              { name: 'Trapassato', tense: 'congiuntivo-trapassato', expected: 6 * auxiliaryCount },
                              { name: 'Presente Progressivo', tense: 'congiuntivo-presente-progressivo', expected: 6 }
                            ].map((tenseInfo) => renderTenseWithDropdown(tenseInfo, 'congiuntivo', analysis))}
                          </div>
                        </div>

                        {/* Conditional & Imperative with REAL DATA */}
                        <div className="border rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-gray-800 mb-3">Conditional & Imperative</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {[
                              { name: 'Condizionale Presente', tense: 'condizionale-presente', expected: 6 },
                              { name: 'Condizionale Passato', tense: 'condizionale-passato', expected: 6 * auxiliaryCount },
                              { name: 'Condizionale Presente Progressivo', tense: 'condizionale-presente-progressivo', expected: 6 },
                              { name: 'Imperativo Presente', tense: 'imperativo-presente', expected: 5 },
                              { name: 'Imperativo Passato', tense: 'imperativo-passato', expected: 5 * auxiliaryCount }
                            ].map((tenseInfo) => {
                              const moodName = tenseInfo.tense.includes('condizionale') ? 'condizionale' : 'imperativo';
                              return renderTenseWithDropdown(tenseInfo, moodName, analysis);
                            })}
                          </div>
                        </div>

                        {/* Non-finite Forms with REAL DATA */}
        <div className="border rounded-lg p-4 mb-4">
          <h5 className="font-semibold text-gray-800 mb-3">Non-finite Forms</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {[
              { name: 'Infinito Presente', tense: 'infinito-presente', expected: 1 },
              { name: 'Infinito Passato', tense: 'infinito-passato', expected: auxiliaryCount },
              { name: 'Participio Presente', tense: 'participio-presente', expected: 1 },
              { name: 'Participio Passato', tense: 'participio-passato', expected: 1 },
              { name: 'Gerundio Presente', tense: 'gerundio-presente', expected: 1 },
              { name: 'Gerundio Passato', tense: 'gerundio-passato', expected: auxiliaryCount }
            ].map((tenseInfo) => {
              const moodName = tenseInfo.tense.split('-')[0];
              return renderTenseWithDropdown(tenseInfo, moodName, analysis);
            })}
          </div>
        </div>
                      </>
                    );
                  })()}
                </div>

                  {(() => {
                    const analysis = validationResult.detailedAnalysis;
                    if (!analysis) return null;
                    return (
                      <>
                        {/* REAL Form-Translation Analysis */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Form-Translation Analysis (REAL DATA)</h4>

                          {/* Individual Translation Coverage with CORRECTED CALCULATIONS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.formTranslationCoverage.translationBreakdown.map((translation, idx) => {
                              // CORRECTED: Each translation expects 130 forms (51 simple + 49 compound + 30 progressive)
                              // Not the total verb expectation of 179
                              const expectedPerTranslation = 130; // Fixed per translation regardless of total auxiliaries
                              const correctedCoverage = Math.round((translation.actual / expectedPerTranslation) * 100);
                              
                              return (
                                <div key={idx} className={`border rounded-lg p-4 ${
                                  idx === 0 ? 'border-purple-200 bg-purple-50' : 'border-indigo-200 bg-indigo-50'
                                }`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <h6 className={`font-medium ${idx === 0 ? 'text-purple-900' : 'text-indigo-900'}`}>
                                      Translation: "{translation.translation}"
                                    </h6>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      idx === 0 ? 'bg-purple-200 text-purple-800' : 'bg-indigo-200 text-indigo-800'
                                    }`}>
                                      {translation.auxiliary}
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className={idx === 0 ? 'text-purple-700' : 'text-indigo-700'}>Expected form_translations:</span>
                                      <span className={`font-medium ${idx === 0 ? 'text-purple-800' : 'text-indigo-800'}`}>
                                        {expectedPerTranslation}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className={idx === 0 ? 'text-purple-700' : 'text-indigo-700'}>Actual form_translations:</span>
                                      <span className="font-medium text-green-600">{translation.actual}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className={idx === 0 ? 'text-purple-700' : 'text-indigo-700'}>Coverage:</span>
                                      <span className={`font-medium ${correctedCoverage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {correctedCoverage}% ({translation.actual}/{expectedPerTranslation})
                                      </span>
                                    </div>
                                    {correctedCoverage < 100 && (
                                      <div className={`text-xs mt-2 ${idx === 0 ? 'text-purple-600' : 'text-indigo-600'}`}>
                                        Missing: {expectedPerTranslation - translation.actual} form_translations 
                                        ({Math.round((expectedPerTranslation - translation.actual)/6)} tense sets)
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* REAL Orphaned Records - EXPANDED VERSION */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Orphaned Records Analysis (REAL DATA)</h4>

                          {/* Forms without Form-Translations */}
                          <div className="mb-6">
                            <h6 className="font-medium text-gray-800 mb-3">🔗 Forms without Form-Translation Assignments</h6>
                            <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-red-800">Orphaned Forms</span>
                                <span className="text-red-600 text-sm">Found: {analysis.orphanedRecords.formsWithoutTranslations.length} forms</span>
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                {analysis.orphanedRecords.formsWithoutTranslations.length === 0 ? (
                                  <div className="text-green-600 text-sm">✅ All forms have form_translation assignments</div>
                                ) : (
                                  <div className="space-y-1 text-sm">
                                    {analysis.orphanedRecords.formsWithoutTranslations.map((form, idx) => (
                                      <div key={idx} className="p-2 bg-red-100 rounded text-red-800">
                                        "{form.text}" (ID: {form.id}) - Tags: {form.tags.join(', ')} - No English translation
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Forms without Mood/Tense Classification */}
                          <div className="mb-6">
                            <h6 className="font-medium text-gray-800 mb-3">🏷️ Forms without Proper Mood/Tense Tags</h6>
                            <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-orange-800">Unclassified Forms</span>
                                <span className="text-orange-600 text-sm">Found: {analysis.orphanedRecords.formsWithoutMoodTense.length} forms</span>
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                {analysis.orphanedRecords.formsWithoutMoodTense.length === 0 ? (
                                  <div className="text-green-600 text-sm">✅ All forms have proper mood and tense classification</div>
                                ) : (
                                  <div className="space-y-1 text-sm">
                                    {analysis.orphanedRecords.formsWithoutMoodTense.map((form, idx) => (
                                      <div key={idx} className="p-2 bg-orange-100 rounded text-orange-800">
                                        "{form.text}" (ID: {form.id}) - Tags: {form.tags.join(', ')} - Missing mood/tense classification
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Forms Missing Auxiliary Tags */}
                          <div className="mb-6">
                            <h6 className="font-medium text-gray-800 mb-3">⚡ Compound Forms Missing Auxiliary Tags</h6>
                            <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-yellow-800">Missing Auxiliary Tags</span>
                                <span className="text-yellow-600 text-sm">Found: {analysis.orphanedRecords.missingTags.auxiliaries.length} forms</span>
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                {analysis.orphanedRecords.missingTags.auxiliaries.length === 0 ? (
                                  <div className="text-green-600 text-sm">✅ All compound forms have proper auxiliary tags</div>
                                ) : (
                                  <div className="space-y-1 text-sm">
                                    {analysis.orphanedRecords.missingTags.auxiliaries.map((form, idx) => (
                                      <div key={idx} className="p-2 bg-yellow-100 rounded text-yellow-800">
                                        "{form.text}" (ID: {form.id}) - Expected: {form.expectedTag}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Translations without Forms */}
                          <div className="mb-6">
                            <h6 className="font-medium text-gray-800 mb-3">📝 Translations without Form Assignments</h6>
                            <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-purple-800">Unlinked Translations</span>
                                <span className="text-purple-600 text-sm">Found: {analysis.orphanedRecords.translationsWithoutForms.length} translations</span>
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                {analysis.orphanedRecords.translationsWithoutForms.length === 0 ? (
                                  <div className="text-green-600 text-sm">✅ All translations have form assignments</div>
                                ) : (
                                  <div className="space-y-1 text-sm">
                                    {analysis.orphanedRecords.translationsWithoutForms.map((translation, idx) => (
                                      <div key={idx} className="p-2 bg-purple-100 rounded text-purple-800">
                                        "{translation.translation}" (ID: {translation.id}) - Auxiliary: {translation.auxiliary} - No linked forms
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
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

              {/* Building Blocks Analysis - NO REDUNDANT TAGS REQUIRED */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Building Blocks Analysis</h4>
                <div className="text-sm text-gray-600 mb-4">
                  Building blocks are essential forms needed for compound tense generation. Identified by their grammatical classification (no additional tags needed).
                </div>

                {(() => {
                  const analysis = validationResult.detailedAnalysis;
                  if (!analysis?.rawData) return <div className="text-red-600">No building blocks data available</div>;
                  
                  const forms = analysis.rawData.forms;
                  
                  const requiredBuildingBlocks = [
                    {
                      name: 'Past Participle',
                      moodTag: 'participio',
                      tenseTag: 'participio-passato',
                      purpose: 'Compound perfect tenses',
                      impact: 'passato prossimo, trapassato prossimo, futuro anteriore, condizionale passato'
                    },
                    {
                      name: 'Present Gerund', 
                      moodTag: 'gerundio',
                      tenseTag: 'gerundio-presente',
                      purpose: 'Progressive tenses',
                      impact: 'presente progressivo, passato progressivo, futuro progressivo'
                    },
                    {
                      name: 'Present Infinitive',
                      moodTag: 'infinito', 
                      tenseTag: 'infinito-presente',
                      purpose: 'Negative imperatives',
                      impact: 'negative imperatives, clitic attachment base'
                    }
                  ];
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {requiredBuildingBlocks.map((block, idx) => {
                          // Find form by grammatical tags only
                          const foundForm = forms.find(f => 
                            f.tags?.includes(block.moodTag) && 
                            f.tags?.includes(block.tenseTag)
                          );
                          
                          const exists = !!foundForm;
                          
                          return (
                            <div key={idx} className={`border rounded-lg p-4 ${
                              exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className={`font-medium ${exists ? 'text-green-800' : 'text-red-800'}`}>
                                  {block.name}
                                </div>
                                <span className={`text-lg ${exists ? 'text-green-600' : 'text-red-600'}`}>
                                  {exists ? '✅' : '❌'}
                                </span>
                              </div>
                              
                              {exists ? (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Form text:</span>
                                    <span className="font-mono text-gray-800">"{foundForm.form_text}"</span>
                                  </div>
                                  
                                  <div className="text-green-600 text-sm">
                                    ✅ Identified by grammatical tags: {block.moodTag}, {block.tenseTag}
                                  </div>
                                  
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-600 mb-1">All tags:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {(foundForm.tags || []).map((tag, tagIdx) => (
                                        <span key={tagIdx} className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                          tag === block.moodTag || tag === block.tenseTag ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-red-100 border border-red-200 rounded p-2">
                                  <div className="text-xs text-red-800 font-medium">Missing Form:</div>
                                  <div className="text-xs text-red-700">
                                    Need form with tags: {block.moodTag}, {block.tenseTag}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-3 p-2 border rounded bg-blue-50">
                                <div className="text-xs text-blue-900 font-medium">Purpose:</div>
                                <div className="text-xs text-blue-800">{block.purpose}</div>
                                <div className="text-xs text-blue-700 mt-1">Enables: {block.impact}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Simplified Summary */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h6 className="font-medium text-gray-900 mb-3">Building Blocks Summary</h6>
                        {(() => {
                          const foundBlocks = requiredBuildingBlocks.filter(block => 
                            forms.some(f => f.tags?.includes(block.moodTag) && f.tags?.includes(block.tenseTag))
                          ).length;
                          
                          return (
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-blue-600">{foundBlocks}/{requiredBuildingBlocks.length}</div>
                                <div className="text-sm text-gray-600">Building Blocks Present</div>
                              </div>
                              <div>
                                <div className={`text-2xl font-bold ${foundBlocks === requiredBuildingBlocks.length ? 'text-green-600' : 'text-red-600'}`}>
                                  {foundBlocks === requiredBuildingBlocks.length ? '✅' : '❌'}
                                </div>
                                <div className="text-sm text-gray-600">Ready for Compound Generation</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
              </div>
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
