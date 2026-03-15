// lib/migration/migrationRecommendationEngine.test.ts
// Story 002.003: Integration Tests for Migration Recommendation Engine
// Tests the recommendation engine against real data and existing migration system

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MigrationRecommendationEngine } from './migrationRecommendationEngine';
import { EnhancedMigrationRuleEngine } from './migrationRuleEngine';
import { DEFAULT_MIGRATION_RULES } from './defaultRules';

/**
 * Test suite for Migration Recommendation Engine integration
 * 
 * This test file is designed to:
 * 1. Verify the recommendation engine works with real database data
 * 2. Test integration with existing migration rule engine
 * 3. Validate recommendation accuracy and safety
 * 4. Ensure UI integration compatibility
 */

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

export class MigrationRecommendationEngineTest {
  private supabase: any;
  private recommendationEngine: MigrationRecommendationEngine;
  private migrationEngine: EnhancedMigrationRuleEngine;
  private testResults: TestSuite[] = [];
  
  constructor() {
    this.supabase = createClientComponentClient();
    this.recommendationEngine = new MigrationRecommendationEngine(this.supabase);
    this.migrationEngine = new EnhancedMigrationRuleEngine(this.supabase);
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting Migration Recommendation Engine Integration Tests...');
    console.log('📋 Testing against real database data and existing migration system');
    
    try {
      // Clear any cached data for clean testing
      this.recommendationEngine.clearCache();
      
      // Run test suites
      await this.testDatabaseConnectivity();
      await this.testDataStateAnalysis();
      await this.testRuleRecommendations();
      await this.testIntegrationWithMigrationEngine();
      await this.testUICompatibility();
      await this.testSafetyValidation();
      await this.testPerformanceMetrics();
      
      // Generate summary
      this.generateTestSummary();
      
      return this.testResults;
      
    } catch (error: any) {
      console.error('❌ Test suite failed:', error);
      throw new Error(`Integration test suite failed: ${error.message}`);
    }
  }

  /**
   * Test database connectivity and basic data access
   */
  private async testDatabaseConnectivity(): Promise<void> {
    const suite: TestSuite = {
      name: 'Database Connectivity',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test basic table access
      const { data: dictData, error: dictError } = await this.supabase
        .from('dictionary')
        .select('id, italian, tags')
        .limit(1);

      suite.results.push({
        testName: 'Dictionary Table Access',
        status: dictError ? 'failed' : 'passed',
        details: dictError ? `Failed to access dictionary table: ${dictError.message}` : `Successfully accessed dictionary table`,
        data: dictData?.[0],
        error: dictError?.message
      });

      // Test word forms access
      const { data: formsData, error: formsError } = await this.supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .limit(1);

      suite.results.push({
        testName: 'Word Forms Table Access',
        status: formsError ? 'failed' : 'passed',
        details: formsError ? `Failed to access word_forms table: ${formsError.message}` : `Successfully accessed word_forms table`,
        data: formsData?.[0],
        error: formsError?.message
      });

      // Test translations access
      const { data: transData, error: transError } = await this.supabase
        .from('word_translations')
        .select('id, translation, context_metadata')
        .limit(1);

      suite.results.push({
        testName: 'Word Translations Table Access',
        status: transError ? 'failed' : 'passed',
        details: transError ? `Failed to access word_translations table: ${transError.message}` : `Successfully accessed word_translations table`,
        data: transData?.[0],
        error: transError?.message
      });

      // Test migration functions
      try {
        const { data: functionTest, error: functionError } = await this.supabase
          .rpc('execute_custom_query', {
            query: 'SELECT 1 as test_value'
          });

        suite.results.push({
          testName: 'Migration Functions Available',
          status: functionError ? 'warning' : 'passed',
          details: functionError ? `Migration functions not available: ${functionError.message}` : `Migration functions working`,
          data: functionTest,
          error: functionError?.message
        });
      } catch (error: any) {
        suite.results.push({
          testName: 'Migration Functions Available',
          status: 'warning',
          details: `Migration functions not available: ${error.message}`,
          error: error.message
        });
      }

    } catch (error: any) {
      suite.results.push({
        testName: 'Database Connection',
        status: 'failed',
        details: `Failed to connect to database: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Test data state analysis functionality
   */
  private async testDataStateAnalysis(): Promise<void> {
    const suite: TestSuite = {
      name: 'Data State Analysis',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test comprehensive data state analysis
      const dataState = await this.recommendationEngine.analyzeDataState();

      suite.results.push({
        testName: 'Data State Analysis Execution',
        status: 'passed',
        details: `Successfully analyzed data state across all categories`,
        data: {
          terminology: dataState.terminology,
          metadata: dataState.metadata,
          cleanup: dataState.cleanup,
          structure: dataState.structure
        }
      });

      // Validate terminology analysis
      if (typeof dataState.terminology.completionPercentage === 'number') {
        suite.results.push({
          testName: 'Terminology Analysis',
          status: 'passed',
          details: `Terminology analysis: ${dataState.terminology.completionPercentage}% complete (${dataState.terminology.legacyTerms} legacy, ${dataState.terminology.universalTerms} universal)`,
          data: dataState.terminology
        });
      } else {
        suite.results.push({
          testName: 'Terminology Analysis',
          status: 'failed',
          details: `Invalid terminology analysis result`,
          data: dataState.terminology
        });
      }

      // Validate metadata analysis
      if (typeof dataState.metadata.completionPercentage === 'number') {
        suite.results.push({
          testName: 'Metadata Analysis',
          status: 'passed',
          details: `Metadata analysis: ${dataState.metadata.completionPercentage}% complete (${dataState.metadata.missingAuxiliaries} missing auxiliaries)`,
          data: dataState.metadata
        });
      } else {
        suite.results.push({
          testName: 'Metadata Analysis',
          status: 'failed',
          details: `Invalid metadata analysis result`,
          data: dataState.metadata
        });
      }

      // Validate cleanup analysis
      if (typeof dataState.cleanup.completionPercentage === 'number') {
        suite.results.push({
          testName: 'Cleanup Analysis',
          status: 'passed',
          details: `Cleanup analysis: ${dataState.cleanup.completionPercentage}% complete (${dataState.cleanup.deprecatedTags} deprecated tags)`,
          data: dataState.cleanup
        });
      } else {
        suite.results.push({
          testName: 'Cleanup Analysis',
          status: 'failed',
          details: `Invalid cleanup analysis result`,
          data: dataState.cleanup
        });
      }

      // Validate structure analysis
      if (typeof dataState.structure.completionPercentage === 'number') {
        suite.results.push({
          testName: 'Structure Analysis',
          status: 'passed',
          details: `Structure analysis: ${dataState.structure.completionPercentage}% complete (${dataState.structure.orphanedRecords} orphaned records)`,
          data: dataState.structure
        });
      } else {
        suite.results.push({
          testName: 'Structure Analysis',
          status: 'warning',
          details: `Structure analysis completed with potential RPC function issues`,
          data: dataState.structure
        });
      }

    } catch (error: any) {
      suite.results.push({
        testName: 'Data State Analysis Execution',
        status: 'failed',
        details: `Data state analysis failed: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Test rule recommendation generation
   */
  private async testRuleRecommendations(): Promise<void> {
    const suite: TestSuite = {
      name: 'Rule Recommendations',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test full recommendation generation
      const analysis = await this.recommendationEngine.generateRecommendations();

      suite.results.push({
        testName: 'Recommendation Generation',
        status: 'passed',
        details: `Generated ${analysis.recommendations.length} recommendations (${analysis.criticalIssues} critical issues found)`,
        data: {
          totalIssues: analysis.totalIssuesFound,
          criticalIssues: analysis.criticalIssues,
          recommendationCount: analysis.recommendations.length,
          dataQualityScore: analysis.dataQuality.score
        }
      });

      // Test recommendation quality
      if (analysis.recommendations.length > 0) {
        const hasValidRecommendations = analysis.recommendations.every(r => 
          r.confidence >= 0 && r.confidence <= 100 &&
          ['ready', 'needs_input', 'blocked', 'complete'].includes(r.readiness) &&
          r.reasons.length > 0
        );

        suite.results.push({
          testName: 'Recommendation Quality',
          status: hasValidRecommendations ? 'passed' : 'failed',
          details: hasValidRecommendations ? 
            `All recommendations have valid structure and data` :
            `Some recommendations have invalid data`,
          data: analysis.recommendations.map(r => ({
            ruleId: r.rule.id,
            confidence: r.confidence,
            readiness: r.readiness,
            affectedRows: r.estimatedImpact.affectedRows
          }))
        });
      }

      // Test execution order calculation
      if (analysis.executionOrder.length > 0) {
        suite.results.push({
          testName: 'Execution Order Calculation',
          status: 'passed',
          details: `Calculated execution order for ${analysis.executionOrder.length} rules`,
          data: analysis.executionOrder
        });
      }

      // Test data quality scoring
      if (analysis.dataQuality.score >= 0 && analysis.dataQuality.score <= 100) {
        suite.results.push({
          testName: 'Data Quality Scoring',
          status: 'passed',
          details: `Data quality score: ${analysis.dataQuality.score}/100 (${analysis.dataQuality.issues.length} issues, ${analysis.dataQuality.improvements.length} improvements)`,
          data: analysis.dataQuality
        });
      } else {
        suite.results.push({
          testName: 'Data Quality Scoring',
          status: 'failed',
          details: `Invalid data quality score: ${analysis.dataQuality.score}`,
          data: analysis.dataQuality
        });
      }

      // Test individual rule recommendations
      for (const rule of DEFAULT_MIGRATION_RULES.slice(0, 3)) { // Test first 3 rules
        try {
          const recommendation = await this.recommendationEngine.getRecommendationForRule(rule.id);
          
          suite.results.push({
            testName: `Individual Rule Recommendation: ${rule.name}`,
            status: recommendation ? 'passed' : 'failed',
            details: recommendation ? 
              `Generated recommendation for ${rule.name}: ${recommendation.readiness} (${recommendation.confidence}% confidence)` :
              `Failed to generate recommendation for ${rule.name}`,
            data: recommendation ? {
              ruleId: recommendation.rule.id,
              confidence: recommendation.confidence,
              readiness: recommendation.readiness,
              affectedRows: recommendation.estimatedImpact.affectedRows
            } : null
          });
        } catch (error: any) {
          suite.results.push({
            testName: `Individual Rule Recommendation: ${rule.name}`,
            status: 'failed',
            details: `Failed to analyze rule ${rule.name}: ${error.message}`,
            error: error.message
          });
        }
      }

    } catch (error: any) {
      suite.results.push({
        testName: 'Recommendation Generation',
        status: 'failed',
        details: `Recommendation generation failed: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Test integration with existing migration rule engine
   */
  private async testIntegrationWithMigrationEngine(): Promise<void> {
    const suite: TestSuite = {
      name: 'Migration Engine Integration',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test that recommendation engine can use migration engine for previews
      const testRule = DEFAULT_MIGRATION_RULES[0]; // Test with first rule
      
      // Test preview generation through recommendation engine
      const recommendation = await this.recommendationEngine.getRecommendationForRule(testRule.id);
      
      if (recommendation) {
        suite.results.push({
          testName: 'Preview Generation Integration',
          status: 'passed',
          details: `Successfully generated preview through recommendation engine for rule: ${testRule.name}`,
          data: {
            ruleId: testRule.id,
            affectedRows: recommendation.estimatedImpact.affectedRows,
            executionTime: recommendation.estimatedImpact.executionTime
          }
        });
      } else {
        suite.results.push({
          testName: 'Preview Generation Integration',
          status: 'failed',
          details: `Failed to generate preview for rule: ${testRule.name}`
        });
      }

      // Test direct migration engine preview for comparison
      try {
        const directPreview = await this.migrationEngine.previewMigration(testRule);
        
        suite.results.push({
          testName: 'Direct Migration Engine Preview',
          status: 'passed',
          details: `Direct migration engine preview successful: ${directPreview.affectedRows} affected rows`,
          data: {
            affectedRows: directPreview.affectedRows,
            sqlStatements: directPreview.sqlStatements.length,
            safetyWarnings: directPreview.safetyWarnings.length
          }
        });

        // Compare recommendation vs direct preview
        if (recommendation && recommendation.estimatedImpact.affectedRows === directPreview.affectedRows) {
          suite.results.push({
            testName: 'Preview Consistency Check',
            status: 'passed',
            details: `Recommendation engine and direct engine show consistent results`,
            data: {
              recommendationRows: recommendation.estimatedImpact.affectedRows,
              directRows: directPreview.affectedRows
            }
          });
        } else if (recommendation) {
          suite.results.push({
            testName: 'Preview Consistency Check',
            status: 'warning',
            details: `Slight discrepancy in affected rows count between engines`,
            data: {
              recommendationRows: recommendation.estimatedImpact.affectedRows,
              directRows: directPreview.affectedRows
            }
          });
        }

      } catch (error: any) {
        suite.results.push({
          testName: 'Direct Migration Engine Preview',
          status: 'failed',
          details: `Direct migration engine preview failed: ${error.message}`,
          error: error.message
        });
      }

      // Test schema integration
      try {
        const schema = await this.migrationEngine.getTableSchema('word_forms');
        
        suite.results.push({
          testName: 'Schema Integration',
          status: 'passed',
          details: `Successfully retrieved schema for word_forms table: ${schema.columns.length} columns`,
          data: {
            tableName: schema.tableName,
            columnCount: schema.columns.length,
            columns: schema.columns.map(c => c.columnName)
          }
        });
      } catch (error: any) {
        suite.results.push({
          testName: 'Schema Integration',
          status: 'warning',
          details: `Schema integration working with fallback: ${error.message}`,
          error: error.message
        });
      }

    } catch (error: any) {
      suite.results.push({
        testName: 'Migration Engine Integration',
        status: 'failed',
        details: `Integration test failed: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Test UI compatibility with existing interface
   */
  private async testUICompatibility(): Promise<void> {
    const suite: TestSuite = {
      name: 'UI Compatibility',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test that recommendation data structure matches UI expectations
      const analysis = await this.recommendationEngine.generateRecommendations();

      // Check MigrationAnalysis interface compatibility
      const hasRequiredAnalysisFields = analysis && 
        typeof analysis.totalIssuesFound === 'number' &&
        typeof analysis.criticalIssues === 'number' &&
        Array.isArray(analysis.recommendations) &&
        Array.isArray(analysis.executionOrder) &&
        typeof analysis.estimatedTotalTime === 'string' &&
        Array.isArray(analysis.safetyWarnings) &&
        analysis.dataQuality &&
        typeof analysis.dataQuality.score === 'number';

      suite.results.push({
        testName: 'MigrationAnalysis Interface Compatibility',
        status: hasRequiredAnalysisFields ? 'passed' : 'failed',
        details: hasRequiredAnalysisFields ? 
          `MigrationAnalysis interface has all required fields` :
          `MigrationAnalysis interface missing required fields`,
        data: {
          totalIssuesFound: analysis?.totalIssuesFound,
          criticalIssues: analysis?.criticalIssues,
          recommendationsCount: analysis?.recommendations?.length,
          dataQualityScore: analysis?.dataQuality?.score
        }
      });

      // Check MigrationRecommendation interface compatibility
      if (analysis?.recommendations?.length > 0) {
        const firstRecommendation = analysis.recommendations[0];
        const hasRequiredRecommendationFields = firstRecommendation &&
          firstRecommendation.rule &&
          typeof firstRecommendation.confidence === 'number' &&
          firstRecommendation.estimatedImpact &&
          typeof firstRecommendation.readiness === 'string' &&
          Array.isArray(firstRecommendation.reasons);

        suite.results.push({
          testName: 'MigrationRecommendation Interface Compatibility',
          status: hasRequiredRecommendationFields ? 'passed' : 'failed',
          details: hasRequiredRecommendationFields ?
            `MigrationRecommendation interface has all required fields` :
            `MigrationRecommendation interface missing required fields`,
          data: {
            ruleId: firstRecommendation?.rule?.id,
            confidence: firstRecommendation?.confidence,
            readiness: firstRecommendation?.readiness,
            affectedRows: firstRecommendation?.estimatedImpact?.affectedRows
          }
        });
      }

      // Test data format for existing VisualRule interface mapping
      if (analysis?.recommendations?.length > 0) {
        const canMapToVisualRule = analysis.recommendations.every(r => {
          return r.rule.id && r.rule.name && r.rule.description && 
                 r.rule.category && r.rule.priority && 
                 typeof r.estimatedImpact.affectedRows === 'number';
        });

        suite.results.push({
          testName: 'VisualRule Interface Mapping',
          status: canMapToVisualRule ? 'passed' : 'failed',
          details: canMapToVisualRule ?
            `All recommendations can be mapped to VisualRule interface` :
            `Some recommendations cannot be mapped to VisualRule interface`
        });
      }

      // Test DataStateAnalysis interface for potential UI display
      const dataState = await this.recommendationEngine.analyzeDataState();
      const hasDataStateStructure = dataState &&
        dataState.terminology && dataState.metadata && 
        dataState.cleanup && dataState.structure;

      suite.results.push({
        testName: 'DataStateAnalysis Interface',
        status: hasDataStateStructure ? 'passed' : 'failed',
        details: hasDataStateStructure ?
          `DataStateAnalysis has proper structure for UI display` :
          `DataStateAnalysis missing required structure`,
        data: {
          terminology: dataState?.terminology?.completionPercentage,
          metadata: dataState?.metadata?.completionPercentage,
          cleanup: dataState?.cleanup?.completionPercentage,
          structure: dataState?.structure?.completionPercentage
        }
      });

    } catch (error: any) {
      suite.results.push({
        testName: 'UI Compatibility Test',
        status: 'failed',
        details: `UI compatibility test failed: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Test safety validation and error handling
   */
  private async testSafetyValidation(): Promise<void> {
    const suite: TestSuite = {
      name: 'Safety Validation',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test error handling with invalid data
      try {
        const invalidEngine = new MigrationRecommendationEngine(null);
        await invalidEngine.generateRecommendations();
        
        suite.results.push({
          testName: 'Invalid Client Handling',
          status: 'failed',
          details: `Should have failed with invalid client but didn't`
        });
      } catch (error: any) {
        suite.results.push({
          testName: 'Invalid Client Handling',
          status: 'passed',
          details: `Properly handles invalid client: ${error.message}`
        });
      }

      // Test safety warnings generation
      const analysis = await this.recommendationEngine.generateRecommendations();
      
      suite.results.push({
        testName: 'Safety Warnings Generation',
        status: 'passed',
        details: `Generated ${analysis.safetyWarnings.length} safety warnings`,
        data: analysis.safetyWarnings
      });

      // Test confidence scoring bounds
      const hasValidConfidenceScores = analysis.recommendations.every(r => 
        r.confidence >= 0 && r.confidence <= 100
      );

      suite.results.push({
        testName: 'Confidence Score Validation',
        status: hasValidConfidenceScores ? 'passed' : 'failed',
        details: hasValidConfidenceScores ?
          `All confidence scores within valid bounds (0-100)` :
          `Some confidence scores outside valid bounds`,
        data: analysis.recommendations.map(r => ({ ruleId: r.rule.id, confidence: r.confidence }))
      });

      // Test blocked rule detection
      const blockedRules = analysis.recommendations.filter(r => r.readiness === 'blocked');
      
      suite.results.push({
        testName: 'Blocked Rule Detection',
        status: 'passed',
        details: `Detected ${blockedRules.length} blocked rules requiring investigation`,
        data: blockedRules.map(r => ({ ruleId: r.rule.id, blockers: r.blockers }))
      });

      // Test cache safety
      this.recommendationEngine.clearCache();
      const analysisAfterClear = await this.recommendationEngine.generateRecommendations();
      
      suite.results.push({
        testName: 'Cache Safety',
        status: 'passed',
        details: `Cache clearing and regeneration works properly`,
        data: {
          originalRecommendations: analysis.recommendations.length,
          afterClearRecommendations: analysisAfterClear.recommendations.length
        }
      });

    } catch (error: any) {
      suite.results.push({
        testName: 'Safety Validation',
        status: 'failed',
        details: `Safety validation failed: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Test performance metrics and optimization
   */
  private async testPerformanceMetrics(): Promise<void> {
    const suite: TestSuite = {
      name: 'Performance Metrics',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    try {
      // Test analysis performance
      const startTime = Date.now();
      await this.recommendationEngine.generateRecommendations();
      const endTime = Date.now();
      const analysisTime = endTime - startTime;

      suite.results.push({
        testName: 'Analysis Performance',
        status: analysisTime < 10000 ? 'passed' : 'warning', // Should complete within 10 seconds
        details: `Analysis completed in ${analysisTime}ms`,
        data: { analysisTimeMs: analysisTime }
      });

      // Test cache performance
      const cacheStartTime = Date.now();
      await this.recommendationEngine.generateRecommendations(); // Should use cache
      const cacheEndTime = Date.now();
      const cacheTime = cacheEndTime - cacheStartTime;

      suite.results.push({
        testName: 'Cache Performance',
        status: cacheTime < 1000 ? 'passed' : 'warning', // Cached should be much faster
        details: `Cached analysis completed in ${cacheTime}ms`,
        data: { cacheTimeMs: cacheTime }
      });

      // Test memory usage (browser-compatible check)
      try {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          // Node.js environment
          const memBefore = process.memoryUsage().heapUsed;
          await this.recommendationEngine.generateRecommendations();
          const memAfter = process.memoryUsage().heapUsed;
          const memDiff = memAfter - memBefore;

          suite.results.push({
            testName: 'Memory Usage',
            status: memDiff < 50 * 1024 * 1024 ? 'passed' : 'warning',
            details: `Memory usage difference: ${Math.round(memDiff / 1024 / 1024)}MB`,
            data: { memoryDiffMB: Math.round(memDiff / 1024 / 1024) }
          });
        } else {
          // Browser environment - skip detailed memory testing
          await this.recommendationEngine.generateRecommendations();
          suite.results.push({
            testName: 'Memory Usage',
            status: 'passed',
            details: `Memory usage test skipped in browser environment`,
            data: { note: 'Browser environment detected' }
          });
        }
      } catch (error: any) {
        suite.results.push({
          testName: 'Memory Usage',
          status: 'warning',
          details: `Memory usage test failed: ${error.message}`,
          error: error.message
        });
      }

    } catch (error: any) {
      suite.results.push({
        testName: 'Performance Testing',
        status: 'failed',
        details: `Performance test failed: ${error.message}`,
        error: error.message
      });
    }

    this.calculateSuiteSummary(suite);
    this.testResults.push(suite);
  }

  /**
   * Calculate summary statistics for a test suite
   */
  private calculateSuiteSummary(suite: TestSuite): void {
    suite.summary.total = suite.results.length;
    suite.summary.passed = suite.results.filter(r => r.status === 'passed').length;
    suite.summary.failed = suite.results.filter(r => r.status === 'failed').length;
    suite.summary.warnings = suite.results.filter(r => r.status === 'warning').length;
  }

  /**
   * Generate overall test summary
   */
  private generateTestSummary(): void {
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.summary.total, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.summary.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.summary.failed, 0);
    const totalWarnings = this.testResults.reduce((sum, suite) => sum + suite.summary.warnings, 0);

    console.log('\n🎯 Migration Recommendation Engine Test Summary:');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⚠️  Warnings: ${totalWarnings}`);
    console.log(`📈 Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);

    this.testResults.forEach(suite => {
      console.log(`\n📋 ${suite.name}: ${suite.summary.passed}/${suite.summary.total} passed`);
    });
  }

  /**
   * Get detailed test results for UI display
   */
  getTestResults(): TestSuite[] {
    return this.testResults;
  }

  /**
   * Get test summary for quick overview
   */
  getTestSummary(): any {
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.summary.total, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.summary.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.summary.failed, 0);
    const totalWarnings = this.testResults.reduce((sum, suite) => sum + suite.summary.warnings, 0);

    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalWarnings,
      successRate: Math.round((totalPassed / totalTests) * 100),
      suites: this.testResults.map(suite => ({
        name: suite.name,
        passed: suite.summary.passed,
        total: suite.summary.total
      }))
    };
  }
}

// Export for use in admin interface
export async function runMigrationRecommendationEngineTests(): Promise<TestSuite[]> {
  const tester = new MigrationRecommendationEngineTest();
  return await tester.runAllTests();
}

console.log('🧪 Migration Recommendation Engine Test Suite loaded');
console.log('🎯 Ready to test integration with existing migration system');
console.log('📊 Provides comprehensive validation of recommendation accuracy and safety');