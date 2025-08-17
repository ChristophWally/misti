'use client';

import { useState } from 'react';
import { runMigrationRecommendationEngineTests } from '../../../../lib/migration/migrationRecommendationEngine.test';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  details: string;
  data?: any;
  error?: string;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export default function MigrationTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [overallSummary, setOverallSummary] = useState<any>(null);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallSummary(null);
    
    try {
      console.log('🧪 Starting Migration Recommendation Engine Integration Tests...');
      const results = await runMigrationRecommendationEngineTests();
      
      setTestResults(results);
      
      // Calculate overall summary
      const totalTests = results.reduce((sum, suite) => sum + suite.summary.total, 0);
      const totalPassed = results.reduce((sum, suite) => sum + suite.summary.passed, 0);
      const totalFailed = results.reduce((sum, suite) => sum + suite.summary.failed, 0);
      const totalWarnings = results.reduce((sum, suite) => sum + suite.summary.warnings, 0);
      
      setOverallSummary({
        totalTests,
        totalPassed,
        totalFailed,
        totalWarnings,
        successRate: Math.round((totalPassed / totalTests) * 100)
      });
      
    } catch (error: any) {
      console.error('❌ Test execution failed:', error);
      alert(`Test execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Migration Recommendation Engine Tests</h1>
            <p className="text-gray-600 mt-2">
              Integration tests for Story 002.003 - Verify recommendation engine works with real data
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/admin/migration-tools"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              ← Back to Migration Tools
            </a>
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRunning ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests...
                </div>
              ) : (
                '🧪 Run Integration Tests'
              )}
            </button>
          </div>
        </div>

        {/* Test Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What These Tests Validate:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Database connectivity and real data access</li>
            <li>• Data state analysis across all migration categories</li>
            <li>• Rule recommendation generation and accuracy</li>
            <li>• Integration with existing migration rule engine</li>
            <li>• UI interface compatibility for admin tools</li>
            <li>• Safety validation and error handling</li>
            <li>• Performance metrics and optimization</li>
          </ul>
        </div>
      </div>

      {/* Overall Summary */}
      {overallSummary && (
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Test Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{overallSummary.totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overallSummary.totalPassed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overallSummary.totalFailed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{overallSummary.totalWarnings}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${overallSummary.successRate >= 90 ? 'text-green-600' : overallSummary.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overallSummary.successRate}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Suites */}
      {testResults.length > 0 && (
        <div className="space-y-6">
          {testResults.map((suite, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Suite Header */}
              <div 
                className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedSuite(selectedSuite === suite.name ? null : suite.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className="text-sm text-green-600">✅ {suite.summary.passed}</span>
                      {suite.summary.failed > 0 && (
                        <span className="text-sm text-red-600">❌ {suite.summary.failed}</span>
                      )}
                      {suite.summary.warnings > 0 && (
                        <span className="text-sm text-yellow-600">⚠️ {suite.summary.warnings}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-600 mr-3">
                      {suite.summary.passed}/{suite.summary.total} passed
                    </div>
                    <div className="transform transition-transform duration-200">
                      {selectedSuite === suite.name ? '▼' : '▶'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suite Details */}
              {selectedSuite === suite.name && (
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {suite.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="mr-2">{getStatusIcon(result.status)}</span>
                              <h4 className="font-medium text-gray-900">{result.testName}</h4>
                              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}>
                                {result.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                            
                            {result.error && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                <strong>Error:</strong> {result.error}
                              </div>
                            )}
                            
                            {result.data && (
                              <details className="mt-2">
                                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                  View Test Data
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isRunning && testResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test Migration Engine</h3>
          <p className="text-gray-600 mb-6">
            Click the button above to run comprehensive integration tests for the Migration Recommendation Engine.
          </p>
          <div className="text-sm text-gray-500">
            <p>Tests will verify:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ Real database connectivity and data access</li>
              <li>✓ Data analysis accuracy across all categories</li>
              <li>✓ Recommendation generation and prioritization</li>
              <li>✓ Integration with existing migration tools</li>
              <li>✓ UI compatibility and safety validation</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}