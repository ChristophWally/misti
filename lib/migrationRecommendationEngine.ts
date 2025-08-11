// lib/migrationRecommendationEngine.ts
// EPIC 002: Story 002.003 - Migration Recommendation Engine
// Converts validation issues into actionable, safe SQL migrations

import { 
  ComplianceIssue, 
  VerbComplianceReport, 
  SystemComplianceReport 
} from './verbComplianceRules';

export interface MigrationRecommendation {
  id: string;
  ruleId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedCount: number;
  
  // SQL Generation
  sqlStatements: string[];
  rollbackStatements: string[];
  
  // Safety and Validation
  safetyLevel: 'safe' | 'caution' | 'manual-review';
  dependencies: string[];
  preValidationChecks: string[];
  postValidationChecks: string[];
  
  // Progress Tracking
  estimatedDuration: string;
  category: 'terminology' | 'auxiliary' | 'tags' | 'cross-table' | 'cleanup';
  priority: number; // 1-10, higher = more urgent
}

export interface MigrationPlan {
  id: string;
  createdAt: string;
  totalRecommendations: number;
  
  // Execution Plan
  migrationBatches: MigrationBatch[];
  estimatedTotalTime: string;
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high';
  criticalMigrations: number;
  autoExecutableCount: number;
  manualReviewCount: number;
  
  // Validation
  preExecutionChecks: string[];
  successCriteria: string[];
}

export interface MigrationBatch {
  batchId: string;
  name: string;
  description: string;
  recommendations: MigrationRecommendation[];
  executionOrder: number;
  dependencies: string[];
  estimatedDuration: string;
}

/**
 * Migration Recommendation Engine
 * 
 * Converts validation issues from ConjugationComplianceValidator into
 * actionable, safe SQL migrations with rollback capabilities.
 */
export class MigrationRecommendationEngine {
  private migrationCounter: number = 0;

  constructor() {
    console.log('🔧 Migration Recommendation Engine initialized');
    console.log('⚡ Ready to convert validation issues to actionable migrations');
  }

  /**
   * Generate comprehensive migration plan from system compliance report
   */
  generateMigrationPlan(systemReport: SystemComplianceReport): MigrationPlan {
    console.log('🔍 Generating migration plan from system compliance report...');
    
    const recommendations: MigrationRecommendation[] = [];
    
    // Extract all issues from verb reports
    systemReport.verbReports?.forEach(verbReport => {
      const verbRecommendations = this.generateVerbMigrations(verbReport);
      recommendations.push(...verbRecommendations);
    });

    // Group recommendations into logical batches
    const migrationBatches = this.createMigrationBatches(recommendations);
    
    // Calculate risk and timing
    const riskAssessment = this.assessMigrationRisk(recommendations);
    const totalTime = this.calculateTotalTime(recommendations);

    const plan: MigrationPlan = {
      id: `migration-plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalRecommendations: recommendations.length,
      migrationBatches,
      estimatedTotalTime: totalTime,
      riskLevel: riskAssessment.riskLevel,
      criticalMigrations: recommendations.filter(r => r.severity === 'critical').length,
      autoExecutableCount: recommendations.filter(r => r.safetyLevel === 'safe').length,
      manualReviewCount: recommendations.filter(r => r.safetyLevel === 'manual-review').length,
      preExecutionChecks: [
        'Backup database before migration',
        'Verify no active users in system',
        'Confirm rollback procedures tested',
        'Validate all SQL statements in staging environment'
      ],
      successCriteria: [
        'All critical compliance issues resolved',
        'Universal terminology migration complete',
        'Auxiliary assignments 100% complete',
        'Cross-table consistency validated',
        'No data integrity issues detected'
      ]
    };

    console.log(`✅ Generated migration plan with ${recommendations.length} recommendations`);
    console.log(`📊 Risk level: ${riskAssessment.riskLevel}, ${plan.autoExecutableCount} auto-executable`);
    
    return plan;
  }

  /**
   * Generate migration recommendations for a single verb
   */
  private generateVerbMigrations(verbReport: VerbComplianceReport): MigrationRecommendation[] {
    const recommendations: MigrationRecommendation[] = [];

    // Process all issue types
    const allIssues = [
      ...verbReport.wordLevelIssues,
      ...verbReport.translationLevelIssues,
      ...verbReport.formLevelIssues,
      ...verbReport.crossTableIssues
    ];

    allIssues.forEach(issue => {
      const recommendation = this.convertIssueToMigration(issue, verbReport);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    return recommendations;
  }

  /**
   * Convert a single compliance issue to migration recommendation
   */
  private convertIssueToMigration(
    issue: ComplianceIssue, 
    verbReport: VerbComplianceReport
  ): MigrationRecommendation | null {
    
    const migrationId = `migration-${++this.migrationCounter}`;
    
    switch (issue.ruleId) {
      case 'legacy-person-terms':
        return this.createPersonTerminologyMigration(issue, verbReport, migrationId);
        
      case 'missing-auxiliary-assignment':
        return this.createAuxiliaryAssignmentMigration(issue, verbReport, migrationId);
        
      case 'legacy-auxiliary-format':
        return this.createAuxiliaryFormatMigration(issue, verbReport, migrationId);
        
      case 'missing-conjugation-class':
        return this.createConjugationClassMigration(issue, verbReport, migrationId);
        
      case 'missing-mood-tag':
      case 'missing-tense-tag':
        return this.createMoodTenseMigration(issue, verbReport, migrationId);
        
      case 'auxiliary-consistency-mismatch':
        return this.createAuxiliaryConsistencyMigration(issue, verbReport, migrationId);
        
      default:
        console.warn(`⚠️ No migration handler for rule: ${issue.ruleId}`);
        return null;
    }
  }

  /**
   * Create person terminology migration (io/tu/lui → prima-persona/seconda-persona/terza-persona)
   */
  private createPersonTerminologyMigration(
    issue: ComplianceIssue,
    verbReport: VerbComplianceReport,
    migrationId: string
  ): MigrationRecommendation {
    
    // Extract legacy terms from the issue
    const legacyTerms = Array.isArray(issue.currentValue) ? issue.currentValue : [issue.currentValue];
    const sqlStatements: string[] = [];
    const rollbackStatements: string[] = [];

    // Generate SQL for each legacy term
    legacyTerms.forEach(legacyTerm => {
      const universalEquivalent = this.getUniversalEquivalent(legacyTerm);
      
      if (universalEquivalent) {
        // Add universal term if not already present
        sqlStatements.push(`
          UPDATE word_forms 
          SET tags = array_append(tags, '${universalEquivalent}')
          WHERE word_id = '${verbReport.verbId}' 
            AND tags @> ARRAY['${legacyTerm}']
            AND NOT tags @> ARRAY['${universalEquivalent}'];
        `);

        // Remove legacy term after adding universal
        sqlStatements.push(`
          UPDATE word_forms 
          SET tags = array_remove(tags, '${legacyTerm}')
          WHERE word_id = '${verbReport.verbId}' 
            AND tags @> ARRAY['${universalEquivalent}'];
        `);

        // Rollback: Add legacy term back and remove universal
        rollbackStatements.push(`
          UPDATE word_forms 
          SET tags = array_append(tags, '${legacyTerm}')
          WHERE word_id = '${verbReport.verbId}' 
            AND tags @> ARRAY['${universalEquivalent}']
            AND NOT tags @> ARRAY['${legacyTerm}'];
        `);

        rollbackStatements.push(`
          UPDATE word_forms 
          SET tags = array_remove(tags, '${universalEquivalent}')
          WHERE word_id = '${verbReport.verbId}' 
            AND tags @> ARRAY['${legacyTerm}'];
        `);
      }
    });

    return {
      id: migrationId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      description: `Convert person terminology for ${verbReport.verbItalian}: ${legacyTerms.join(', ')} → universal terms`,
      affectedCount: legacyTerms.length,
      sqlStatements,
      rollbackStatements,
      safetyLevel: 'safe',
      dependencies: [],
      preValidationChecks: [
        `Verify ${verbReport.verbItalian} forms contain legacy terms: ${legacyTerms.join(', ')}`,
        'Confirm universal equivalents not already present'
      ],
      postValidationChecks: [
        'Verify all legacy person terms removed',
        'Confirm universal terms correctly applied',
        'Validate form-person consistency'
      ],
      estimatedDuration: '2 minutes',
      category: 'terminology',
      priority: 9 // High priority for universal terminology
    };
  }

  /**
   * Create auxiliary assignment migration for translations
   */
  private createAuxiliaryAssignmentMigration(
    issue: ComplianceIssue,
    verbReport: VerbComplianceReport,
    migrationId: string
  ): MigrationRecommendation {
    
    // Determine correct auxiliary based on verb semantics
    const suggestedAuxiliary = this.determineCorrectAuxiliary(verbReport);
    const transitivity = this.determineTransitivity(suggestedAuxiliary);

    const sqlStatements = [`
      UPDATE word_translations 
      SET context_metadata = COALESCE(context_metadata, '{}'::jsonb) || 
          '{"auxiliary":"${suggestedAuxiliary}","transitivity":"${transitivity}"}'::jsonb
      WHERE word_id = '${verbReport.verbId}' 
        AND (context_metadata->>'auxiliary') IS NULL;
    `];

    const rollbackStatements = [`
      UPDATE word_translations 
      SET context_metadata = context_metadata - 'auxiliary' - 'transitivity'
      WHERE word_id = '${verbReport.verbId}' 
        AND context_metadata->>'auxiliary' = '${suggestedAuxiliary}';
    `];

    return {
      id: migrationId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      description: `Add auxiliary assignment for ${verbReport.verbItalian}: ${suggestedAuxiliary}`,
      affectedCount: 1,
      sqlStatements,
      rollbackStatements,
      safetyLevel: 'caution', // Requires linguistic validation
      dependencies: [],
      preValidationChecks: [
        `Verify ${verbReport.verbItalian} translations missing auxiliary`,
        `Confirm ${suggestedAuxiliary} is correct auxiliary for this verb`
      ],
      postValidationChecks: [
        'Verify auxiliary correctly assigned to all translations',
        'Confirm transitivity consistency',
        'Validate compound form generation capability'
      ],
      estimatedDuration: '3 minutes',
      category: 'auxiliary',
      priority: 10 // Critical for compound tense generation
    };
  }

  /**
   * Create auxiliary format migration (auxiliary-avere → avere-auxiliary)
   */
  private createAuxiliaryFormatMigration(
    issue: ComplianceIssue,
    verbReport: VerbComplianceReport,
    migrationId: string
  ): MigrationRecommendation {
    
    const legacyFormat = issue.currentValue;
    const standardFormat = this.convertToStandardAuxiliaryFormat(legacyFormat);

    const sqlStatements = [`
      UPDATE word_forms 
      SET tags = array_replace(tags, '${legacyFormat}', '${standardFormat}')
      WHERE word_id = '${verbReport.verbId}' 
        AND tags @> ARRAY['${legacyFormat}'];
    `];

    const rollbackStatements = [`
      UPDATE word_forms 
      SET tags = array_replace(tags, '${standardFormat}', '${legacyFormat}')
      WHERE word_id = '${verbReport.verbId}' 
        AND tags @> ARRAY['${standardFormat}'];
    `];

    return {
      id: migrationId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      description: `Standardize auxiliary format for ${verbReport.verbItalian}: ${legacyFormat} → ${standardFormat}`,
      affectedCount: 1,
      sqlStatements,
      rollbackStatements,
      safetyLevel: 'safe',
      dependencies: [],
      preValidationChecks: [
        `Verify forms contain legacy auxiliary format: ${legacyFormat}`
      ],
      postValidationChecks: [
        'Confirm standard auxiliary format applied',
        'Verify auxiliary tag consistency'
      ],
      estimatedDuration: '1 minute',
      category: 'tags',
      priority: 7
    };
  }

  /**
   * Create conjugation class migration
   */
  private createConjugationClassMigration(
    issue: ComplianceIssue,
    verbReport: VerbComplianceReport,
    migrationId: string
  ): MigrationRecommendation {
    
    const suggestedClass = this.determineConjugationClass(verbReport.verbItalian);

    const sqlStatements = [`
      UPDATE dictionary 
      SET tags = array_append(tags, '${suggestedClass}')
      WHERE id = '${verbReport.verbId}' 
        AND NOT tags @> ARRAY['${suggestedClass}'];
    `];

    const rollbackStatements = [`
      UPDATE dictionary 
      SET tags = array_remove(tags, '${suggestedClass}')
      WHERE id = '${verbReport.verbId}';
    `];

    return {
      id: migrationId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      description: `Add conjugation class for ${verbReport.verbItalian}: ${suggestedClass}`,
      affectedCount: 1,
      sqlStatements,
      rollbackStatements,
      safetyLevel: 'safe',
      dependencies: [],
      preValidationChecks: [
        `Verify ${verbReport.verbItalian} missing conjugation class`,
        `Confirm ${suggestedClass} is correct based on verb ending`
      ],
      postValidationChecks: [
        'Verify conjugation class correctly assigned',
        'Confirm no duplicate conjugation classes'
      ],
      estimatedDuration: '1 minute',
      category: 'tags',
      priority: 8
    };
  }

  /**
   * Create mood/tense migration
   */
  private createMoodTenseMigration(
    issue: ComplianceIssue,
    verbReport: VerbComplianceReport,
    migrationId: string
  ): MigrationRecommendation {
    
    // This requires form-specific analysis and would need the specific form data
    return {
      id: migrationId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      description: `Add missing mood/tense tags for ${verbReport.verbItalian}`,
      affectedCount: 1,
      sqlStatements: [
        `-- Manual analysis required for mood/tense assignment for ${verbReport.verbItalian}`
      ],
      rollbackStatements: [],
      safetyLevel: 'manual-review',
      dependencies: [],
      preValidationChecks: [
        'Manual analysis of form grammatical properties required'
      ],
      postValidationChecks: [
        'Verify mood and tense tags correctly assigned',
        'Confirm grammatical consistency'
      ],
      estimatedDuration: '10 minutes',
      category: 'tags',
      priority: 6
    };
  }

  /**
   * Create auxiliary consistency migration
   */
  private createAuxiliaryConsistencyMigration(
    issue: ComplianceIssue,
    verbReport: VerbComplianceReport,
    migrationId: string
  ): MigrationRecommendation {
    
    return {
      id: migrationId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      description: `Fix auxiliary consistency between translations and forms for ${verbReport.verbItalian}`,
      affectedCount: 1,
      sqlStatements: [
        `-- Cross-table auxiliary consistency fix required for ${verbReport.verbItalian}`
      ],
      rollbackStatements: [],
      safetyLevel: 'manual-review',
      dependencies: ['auxiliary-assignment-complete'],
      preValidationChecks: [
        'Verify translation auxiliary assignments complete',
        'Analyze form auxiliary tags for consistency'
      ],
      postValidationChecks: [
        'Confirm auxiliary consistency between tables',
        'Validate compound form generation'
      ],
      estimatedDuration: '5 minutes',
      category: 'cross-table',
      priority: 8
    };
  }

  /**
   * Group recommendations into logical execution batches
   */
  private createMigrationBatches(recommendations: MigrationRecommendation[]): MigrationBatch[] {
    const batches: MigrationBatch[] = [];

    // Batch 1: Safe terminology and tag migrations
    const safeTerminologyMigrations = recommendations.filter(r => 
      r.category === 'terminology' && r.safetyLevel === 'safe'
    );
    
    if (safeTerminologyMigrations.length > 0) {
      batches.push({
        batchId: 'batch-1-terminology',
        name: 'Universal Terminology Migration',
        description: 'Convert legacy Italian person terms to universal terminology',
        recommendations: safeTerminologyMigrations,
        executionOrder: 1,
        dependencies: [],
        estimatedDuration: this.calculateBatchDuration(safeTerminologyMigrations)
      });
    }

    // Batch 2: Auxiliary assignments
    const auxiliaryMigrations = recommendations.filter(r => 
      r.category === 'auxiliary'
    );
    
    if (auxiliaryMigrations.length > 0) {
      batches.push({
        batchId: 'batch-2-auxiliary',
        name: 'Auxiliary Assignment Migration',
        description: 'Add missing auxiliary assignments to translations',
        recommendations: auxiliaryMigrations,
        executionOrder: 2,
        dependencies: [],
        estimatedDuration: this.calculateBatchDuration(auxiliaryMigrations)
      });
    }

    // Batch 3: Tag cleanup and standardization
    const tagCleanupMigrations = recommendations.filter(r => 
      r.category === 'tags' && r.safetyLevel === 'safe'
    );
    
    if (tagCleanupMigrations.length > 0) {
      batches.push({
        batchId: 'batch-3-tags',
        name: 'Tag Standardization',
        description: 'Standardize tag formats and add missing classification tags',
        recommendations: tagCleanupMigrations,
        executionOrder: 3,
        dependencies: ['batch-1-terminology'],
        estimatedDuration: this.calculateBatchDuration(tagCleanupMigrations)
      });
    }

    // Batch 4: Cross-table consistency (depends on previous batches)
    const crossTableMigrations = recommendations.filter(r => 
      r.category === 'cross-table'
    );
    
    if (crossTableMigrations.length > 0) {
      batches.push({
        batchId: 'batch-4-consistency',
        name: 'Cross-Table Consistency',
        description: 'Fix consistency issues between tables after other migrations',
        recommendations: crossTableMigrations,
        executionOrder: 4,
        dependencies: ['batch-2-auxiliary', 'batch-3-tags'],
        estimatedDuration: this.calculateBatchDuration(crossTableMigrations)
      });
    }

    // Batch 5: Manual review items
    const manualReviewMigrations = recommendations.filter(r => 
      r.safetyLevel === 'manual-review'
    );
    
    if (manualReviewMigrations.length > 0) {
      batches.push({
        batchId: 'batch-5-manual',
        name: 'Manual Review Required',
        description: 'Migrations requiring manual analysis and review',
        recommendations: manualReviewMigrations,
        executionOrder: 5,
        dependencies: [],
        estimatedDuration: this.calculateBatchDuration(manualReviewMigrations)
      });
    }

    return batches;
  }

  /**
   * Helper methods for migration generation
   */
  private getUniversalEquivalent(legacyTerm: string): string | null {
    const mapping: Record<string, string> = {
      'io': 'prima-persona',
      'tu': 'seconda-persona', 
      'lui': 'terza-persona',
      'lei': 'terza-persona',
      'noi': 'prima-persona',
      'voi': 'seconda-persona',
      'loro': 'terza-persona'
    };
    
    return mapping[legacyTerm] || null;
  }

  private determineCorrectAuxiliary(verbReport: VerbComplianceReport): string {
    const italian = verbReport.verbItalian;
    
    // Basic heuristics - should be enhanced with linguistic rules
    if (italian === 'essere' || italian === 'andare' || italian.endsWith('si')) {
      return 'essere';
    }
    
    return 'avere'; // Default for most verbs
  }

  private determineTransitivity(auxiliary: string): string {
    return auxiliary === 'essere' ? 'intransitive' : 'transitive';
  }

  private convertToStandardAuxiliaryFormat(legacyFormat: string): string {
    const mapping: Record<string, string> = {
      'auxiliary-essere': 'essere-auxiliary',
      'auxiliary-avere': 'avere-auxiliary',
      'auxiliary-stare': 'stare-auxiliary'
    };
    
    return mapping[legacyFormat] || legacyFormat;
  }

  private determineConjugationClass(italian: string): string {
    if (italian.endsWith('are')) return 'are-conjugation';
    if (italian.endsWith('ere')) return 'ere-conjugation';
    if (italian.endsWith('ire')) {
      // Default to ire-conjugation, isc forms need linguistic analysis
      return 'ire-conjugation';
    }
    return 'irregular-pattern';
  }

  private calculateBatchDuration(recommendations: MigrationRecommendation[]): string {
    const totalMinutes = recommendations.reduce((total, rec) => {
      const minutes = parseInt(rec.estimatedDuration.split(' ')[0]) || 1;
      return total + minutes;
    }, 0);

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      return `${Math.round(totalMinutes / 60)} hours`;
    }
  }

  private calculateTotalTime(recommendations: MigrationRecommendation[]): string {
    return this.calculateBatchDuration(recommendations);
  }

  private assessMigrationRisk(recommendations: MigrationRecommendation[]): { riskLevel: 'low' | 'medium' | 'high' } {
    const criticalCount = recommendations.filter(r => r.severity === 'critical').length;
    const manualReviewCount = recommendations.filter(r => r.safetyLevel === 'manual-review').length;
    
    if (criticalCount > 5 || manualReviewCount > 3) {
      return { riskLevel: 'high' };
    } else if (criticalCount > 2 || manualReviewCount > 1) {
      return { riskLevel: 'medium' };
    } else {
      return { riskLevel: 'low' };
    }
  }
}

console.log('✅ Migration Recommendation Engine ready');
console.log('🔧 Converts validation issues to actionable SQL migrations');
console.log('📊 Provides risk assessment and batch execution planning');
console.log('🛡️ Includes rollback capabilities and safety checks');
