// lib/migration/migrationRecommendationEngine.ts
// Story 002.003: Unified Migration Recommendation Engine
// Analyzes current data state and recommends which existing migration rules to execute

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DEFAULT_MIGRATION_RULES, getRuleById } from './defaultRules';
import { MigrationRule, EnhancedMigrationRuleEngine } from './migrationRuleEngine';

/**
 * Recommendation result for a migration rule
 */
export interface MigrationRecommendation {
  rule: MigrationRule;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  estimatedImpact: {
    affectedRows: number;
    affectedTables: string[];
    executionTime: string;
  };
  readiness: 'ready' | 'needs_input' | 'blocked' | 'complete';
  blockers?: string[];
  reasons: string[];
  previewData?: any[];
}

/**
 * Overall recommendation analysis result
 */
export interface MigrationAnalysis {
  totalIssuesFound: number;
  criticalIssues: number;
  recommendations: MigrationRecommendation[];
  executionOrder: string[]; // Rule IDs in recommended execution order
  estimatedTotalTime: string;
  safetyWarnings: string[];
  dataQuality: {
    score: number; // 0-100
    issues: string[];
    improvements: string[];
  };
}

/**
 * Data state analysis for specific migration categories
 */
export interface DataStateAnalysis {
  terminology: {
    legacyTerms: number;
    universalTerms: number;
    mixedUsage: number;
    completionPercentage: number;
  };
  metadata: {
    missingAuxiliaries: number;
    missingTransitivity: number;
    incompleteTranslations: number;
    completionPercentage: number;
  };
  cleanup: {
    deprecatedTags: number;
    inconsistentFormats: number;
    redundantData: number;
    completionPercentage: number;
  };
  structure: {
    integrityIssues: number;
    missingRelationships: number;
    orphanedRecords: number;
    completionPercentage: number;
  };
}

export class MigrationRecommendationEngine {
  private supabase: any;
  private migrationEngine: EnhancedMigrationRuleEngine;
  private analysisCache: Map<string, any> = new Map();
  
  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClientComponentClient();
    this.migrationEngine = new EnhancedMigrationRuleEngine(this.supabase);
  }

  /**
   * Main entry point: Analyze current data state and recommend migrations
   */
  async generateRecommendations(): Promise<MigrationAnalysis> {
    console.log('🔍 Starting comprehensive migration analysis...');
    
    try {
      // Analyze current data state
      const dataState = await this.analyzeDataState();
      
      // Generate recommendations for each available rule
      const recommendations: MigrationRecommendation[] = [];
      
      for (const rule of DEFAULT_MIGRATION_RULES) {
        const recommendation = await this.analyzeRule(rule, dataState);
        if (recommendation.estimatedImpact.affectedRows > 0 || recommendation.readiness === 'blocked') {
          recommendations.push(recommendation);
        }
      }
      
      // Sort by priority and impact
      recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });
      
      // Determine execution order
      const executionOrder = this.calculateExecutionOrder(recommendations);
      
      // Calculate total metrics
      const totalIssuesFound = recommendations.reduce((sum, r) => sum + r.estimatedImpact.affectedRows, 0);
      const criticalIssues = recommendations.filter(r => r.priority === 'critical').length;
      
      // Estimate total execution time
      const estimatedTotalTime = this.calculateTotalExecutionTime(recommendations);
      
      // Generate safety warnings
      const safetyWarnings = this.generateSafetyWarnings(recommendations);
      
      // Calculate data quality score
      const dataQuality = this.calculateDataQualityScore(dataState, recommendations);
      
      const analysis: MigrationAnalysis = {
        totalIssuesFound,
        criticalIssues,
        recommendations,
        executionOrder,
        estimatedTotalTime,
        safetyWarnings,
        dataQuality
      };
      
      console.log(`✅ Analysis complete: ${totalIssuesFound} issues found, ${criticalIssues} critical`);
      return analysis;
      
    } catch (error: any) {
      console.error('❌ Migration analysis failed:', error);
      throw new Error(`Migration recommendation analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze current data state across all migration categories
   */
  async analyzeDataState(): Promise<DataStateAnalysis> {
    console.log('📊 Analyzing current data state...');
    
    const cacheKey = 'data-state-analysis';
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }
    
    try {
      // Analyze terminology issues
      const terminology = await this.analyzeTerminology();
      
      // Analyze metadata completeness
      const metadata = await this.analyzeMetadata();
      
      // Analyze cleanup needs
      const cleanup = await this.analyzeCleanup();
      
      // Analyze structural issues
      const structure = await this.analyzeStructure();
      
      const analysis: DataStateAnalysis = {
        terminology,
        metadata,
        cleanup,
        structure
      };
      
      this.analysisCache.set(cacheKey, analysis);
      return analysis;
      
    } catch (error: any) {
      console.error('❌ Data state analysis failed:', error);
      throw new Error(`Data state analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a specific migration rule against current data state
   */
  async analyzeRule(rule: MigrationRule, dataState: DataStateAnalysis): Promise<MigrationRecommendation> {
    console.log(`🔍 Analyzing rule: ${rule.name}`);
    
    try {
      // Get preview to understand impact
      const preview = await this.migrationEngine.previewMigration(rule);
      
      // Determine readiness
      const readiness = this.determineRuleReadiness(rule, preview);
      
      // Calculate confidence based on data analysis
      const confidence = this.calculateConfidence(rule, dataState, preview);
      
      // Generate reasons for recommendation
      const reasons = this.generateReasons(rule, dataState, preview);
      
      // Identify any blockers
      const blockers = this.identifyBlockers(rule, preview);
      
      const recommendation: MigrationRecommendation = {
        rule,
        priority: rule.priority,
        confidence,
        estimatedImpact: {
          affectedRows: preview.affectedRows,
          affectedTables: [rule.pattern.table],
          executionTime: preview.estimatedDuration
        },
        readiness,
        blockers: blockers.length > 0 ? blockers : undefined,
        reasons,
        previewData: preview.previewData.slice(0, 3) // Sample data
      };
      
      return recommendation;
      
    } catch (error: any) {
      console.warn(`⚠️ Rule analysis failed for ${rule.id}:`, error);
      
      // Return a safe fallback recommendation
      return {
        rule,
        priority: rule.priority,
        confidence: 0,
        estimatedImpact: {
          affectedRows: 0,
          affectedTables: [rule.pattern.table],
          executionTime: 'unknown'
        },
        readiness: 'blocked',
        blockers: [`Analysis failed: ${error.message}`],
        reasons: ['Unable to analyze due to error'],
        previewData: []
      };
    }
  }

  /**
   * Analyze terminology migration needs
   */
  private async analyzeTerminology(): Promise<DataStateAnalysis['terminology']> {
    try {
      // Count legacy Italian terms
      const { data: legacyTermsData } = await this.supabase
        .from('word_forms')
        .select('id, tags')
        .or('tags.cs.{"io"},tags.cs.{"tu"},tags.cs.{"lui"},tags.cs.{"lei"},tags.cs.{"noi"},tags.cs.{"voi"},tags.cs.{"loro"}');
      
      // Count universal terms
      const { data: universalTermsData } = await this.supabase
        .from('word_forms')
        .select('id, tags')
        .or('tags.cs.{"prima-persona"},tags.cs.{"seconda-persona"},tags.cs.{"terza-persona"}');
      
      // Count mixed usage (forms with both legacy and universal)
      let mixedUsage = 0;
      if (legacyTermsData && universalTermsData) {
        const legacyIds = new Set(legacyTermsData.map(f => f.id));
        const universalIds = new Set(universalTermsData.map(f => f.id));
        mixedUsage = Array.from(legacyIds).filter(id => universalIds.has(id)).length;
      }
      
      const legacyTerms = legacyTermsData?.length || 0;
      const universalTerms = universalTermsData?.length || 0;
      const totalTerms = legacyTerms + universalTerms - mixedUsage; // Avoid double counting
      
      const completionPercentage = totalTerms > 0 ? Math.round((universalTerms / totalTerms) * 100) : 100;
      
      return {
        legacyTerms,
        universalTerms,
        mixedUsage,
        completionPercentage
      };
      
    } catch (error: any) {
      console.warn('⚠️ Terminology analysis failed:', error);
      return { legacyTerms: 0, universalTerms: 0, mixedUsage: 0, completionPercentage: 0 };
    }
  }

  /**
   * Analyze metadata completeness
   */
  private async analyzeMetadata(): Promise<DataStateAnalysis['metadata']> {
    try {
      // Count missing auxiliaries
      const { data: missingAuxData } = await this.supabase
        .from('word_translations')
        .select('id')
        .is('context_metadata->auxiliary', null);
      
      // Count missing transitivity
      const { data: missingTransData } = await this.supabase
        .from('word_translations')
        .select('id')
        .is('context_metadata->transitivity', null);
      
      // Get total translation count
      const { data: totalTransData } = await this.supabase
        .from('word_translations')
        .select('id', { count: 'exact', head: true });
      
      const missingAuxiliaries = missingAuxData?.length || 0;
      const missingTransitivity = missingTransData?.length || 0;
      const totalTranslations = totalTransData?.length || 1;
      
      // Consider incomplete if missing either auxiliary or transitivity
      const incompleteTranslations = Math.max(missingAuxiliaries, missingTransitivity);
      const completionPercentage = Math.round(((totalTranslations - incompleteTranslations) / totalTranslations) * 100);
      
      return {
        missingAuxiliaries,
        missingTransitivity,
        incompleteTranslations,
        completionPercentage
      };
      
    } catch (error: any) {
      console.warn('⚠️ Metadata analysis failed:', error);
      return { missingAuxiliaries: 0, missingTransitivity: 0, incompleteTranslations: 0, completionPercentage: 100 };
    }
  }

  /**
   * Analyze cleanup requirements
   */
  private async analyzeCleanup(): Promise<DataStateAnalysis['cleanup']> {
    try {
      // Count deprecated English tags
      const { data: deprecatedData } = await this.supabase
        .from('word_forms')
        .select('id')
        .or('tags.cs.{"past-participle"},tags.cs.{"gerund"},tags.cs.{"infinitive"},tags.cs.{"present-participle"}');
      
      // Count inconsistent auxiliary formats
      const { data: inconsistentData } = await this.supabase
        .from('word_forms')
        .select('id')
        .or('tags.cs.{"auxiliary-essere"},tags.cs.{"auxiliary-avere"},tags.cs.{"auxiliary-stare"}');
      
      // Get total forms count for percentage calculation
      const { data: totalFormsData } = await this.supabase
        .from('word_forms')
        .select('id', { count: 'exact', head: true });
      
      const deprecatedTags = deprecatedData?.length || 0;
      const inconsistentFormats = inconsistentData?.length || 0;
      const redundantData = 0; // Could be calculated by checking for exact duplicates
      const totalForms = totalFormsData?.length || 1;
      
      const totalCleanupNeeded = deprecatedTags + inconsistentFormats + redundantData;
      const completionPercentage = Math.round(((totalForms - totalCleanupNeeded) / totalForms) * 100);
      
      return {
        deprecatedTags,
        inconsistentFormats,
        redundantData,
        completionPercentage
      };
      
    } catch (error: any) {
      console.warn('⚠️ Cleanup analysis failed:', error);
      return { deprecatedTags: 0, inconsistentFormats: 0, redundantData: 0, completionPercentage: 100 };
    }
  }

  /**
   * Analyze structural integrity
   */
  private async analyzeStructure(): Promise<DataStateAnalysis['structure']> {
    try {
      // Check for orphaned word forms (word_id not in dictionary)
      const { data: orphanedForms } = await this.supabase
        .rpc('check_orphaned_word_forms');
      
      // Check for orphaned translations
      const { data: orphanedTranslations } = await this.supabase
        .rpc('check_orphaned_translations');
      
      // Check for missing relationships (forms without translations)
      const { data: missingRelationships } = await this.supabase
        .rpc('check_missing_form_translations');
      
      const integrityIssues = 0; // Could check referential integrity
      const orphanedRecords = (orphanedForms || 0) + (orphanedTranslations || 0);
      const missingRelationshipsCount = missingRelationships || 0;
      
      const totalIssues = integrityIssues + orphanedRecords + missingRelationshipsCount;
      const completionPercentage = totalIssues === 0 ? 100 : Math.max(0, 100 - totalIssues);
      
      return {
        integrityIssues,
        missingRelationships: missingRelationshipsCount,
        orphanedRecords,
        completionPercentage
      };
      
    } catch (error: any) {
      console.warn('⚠️ Structure analysis failed (RPC functions may not exist):', error);
      return { integrityIssues: 0, missingRelationships: 0, orphanedRecords: 0, completionPercentage: 100 };
    }
  }

  /**
   * Determine if a rule is ready for execution
   */
  private determineRuleReadiness(rule: MigrationRule, preview: any): 'ready' | 'needs_input' | 'blocked' | 'complete' {
    if (preview.affectedRows === 0) {
      return 'complete';
    }
    
    if (preview.safetyWarnings?.some((w: string) => w.includes('failed') || w.includes('error'))) {
      return 'blocked';
    }
    
    if (rule.requiresManualInput) {
      return 'needs_input';
    }
    
    return 'ready';
  }

  /**
   * Calculate confidence score for a recommendation
   */
  private calculateConfidence(rule: MigrationRule, dataState: DataStateAnalysis, preview: any): number {
    let confidence = 100;
    
    // Reduce confidence for preview errors
    if (preview.safetyWarnings?.length > 0) {
      confidence -= preview.safetyWarnings.length * 10;
    }
    
    // Increase confidence for well-analyzed data
    if (rule.category === 'terminology' && dataState.terminology.legacyTerms > 0) {
      confidence = Math.min(100, confidence + 20);
    }
    
    if (rule.category === 'metadata' && dataState.metadata.missingAuxiliaries > 0) {
      confidence = Math.min(100, confidence + 20);
    }
    
    // Reduce confidence for manual input rules
    if (rule.requiresManualInput) {
      confidence -= 15;
    }
    
    return Math.max(0, confidence);
  }

  /**
   * Generate reasons why this rule is recommended
   */
  private generateReasons(rule: MigrationRule, dataState: DataStateAnalysis, preview: any): string[] {
    const reasons: string[] = [];
    
    if (preview.affectedRows > 0) {
      reasons.push(`${preview.affectedRows} records need this migration`);
    }
    
    switch (rule.category) {
      case 'terminology':
        if (dataState.terminology.legacyTerms > 0) {
          reasons.push(`${dataState.terminology.legacyTerms} records use legacy terminology`);
          reasons.push('Multi-language support requires universal terms');
        }
        break;
        
      case 'metadata':
        if (dataState.metadata.missingAuxiliaries > 0) {
          reasons.push('Missing auxiliary data blocks compound tense generation');
        }
        if (dataState.metadata.missingTransitivity > 0) {
          reasons.push('Missing transitivity data affects validation');
        }
        break;
        
      case 'cleanup':
        if (dataState.cleanup.deprecatedTags > 0) {
          reasons.push('Deprecated tags create system inconsistencies');
        }
        break;
    }
    
    if (rule.priority === 'critical') {
      reasons.push('Critical priority - blocks other functionality');
    }
    
    return reasons;
  }

  /**
   * Identify blockers preventing rule execution
   */
  private identifyBlockers(rule: MigrationRule, preview: any): string[] {
    const blockers: string[] = [];
    
    if (preview.safetyWarnings) {
      for (const warning of preview.safetyWarnings) {
        if (warning.includes('failed') || warning.includes('error')) {
          blockers.push(warning);
        }
      }
    }
    
    if (rule.requiresManualInput && !rule.manualInputFields?.length) {
      blockers.push('Manual input required but no input fields defined');
    }
    
    return blockers;
  }

  /**
   * Calculate optimal execution order for rules
   */
  private calculateExecutionOrder(recommendations: MigrationRecommendation[]): string[] {
    // Priority order: critical ready rules first, then by dependency
    const readyRules = recommendations.filter(r => r.readiness === 'ready');
    const inputRules = recommendations.filter(r => r.readiness === 'needs_input');
    
    const order: string[] = [];
    
    // Add critical ready rules first
    readyRules
      .filter(r => r.priority === 'critical')
      .sort((a, b) => b.confidence - a.confidence)
      .forEach(r => order.push(r.rule.id));
    
    // Add other ready rules by priority
    readyRules
      .filter(r => r.priority !== 'critical')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        return priorityDiff !== 0 ? priorityDiff : b.confidence - a.confidence;
      })
      .forEach(r => order.push(r.rule.id));
    
    // Add input-required rules last
    inputRules
      .sort((a, b) => b.confidence - a.confidence)
      .forEach(r => order.push(r.rule.id));
    
    return order;
  }

  /**
   * Calculate total execution time for all recommendations
   */
  private calculateTotalExecutionTime(recommendations: MigrationRecommendation[]): string {
    const readyRules = recommendations.filter(r => r.readiness === 'ready');
    
    // Estimate based on affected rows
    const totalRows = readyRules.reduce((sum, r) => sum + r.estimatedImpact.affectedRows, 0);
    
    if (totalRows < 100) return '< 30 seconds';
    if (totalRows < 500) return '1-2 minutes';
    if (totalRows < 1000) return '2-5 minutes';
    return '5+ minutes';
  }

  /**
   * Generate safety warnings for the overall migration plan
   */
  private generateSafetyWarnings(recommendations: MigrationRecommendation[]): string[] {
    const warnings: string[] = [];
    
    const totalRows = recommendations.reduce((sum, r) => sum + r.estimatedImpact.affectedRows, 0);
    if (totalRows > 500) {
      warnings.push(`High impact migration: ${totalRows} total rows will be modified`);
    }
    
    const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
    if (criticalCount > 2) {
      warnings.push(`${criticalCount} critical issues require immediate attention`);
    }
    
    const blockedCount = recommendations.filter(r => r.readiness === 'blocked').length;
    if (blockedCount > 0) {
      warnings.push(`${blockedCount} rules are blocked and need investigation`);
    }
    
    const manualCount = recommendations.filter(r => r.readiness === 'needs_input').length;
    if (manualCount > 0) {
      warnings.push(`${manualCount} rules require manual input before execution`);
    }
    
    return warnings;
  }

  /**
   * Calculate overall data quality score
   */
  private calculateDataQualityScore(dataState: DataStateAnalysis, recommendations: MigrationRecommendation[]): {
    score: number;
    issues: string[];
    improvements: string[];
  } {
    const issues: string[] = [];
    const improvements: string[] = [];
    
    // Calculate weighted score based on completion percentages
    const weights = { terminology: 0.3, metadata: 0.4, cleanup: 0.2, structure: 0.1 };
    
    const score = Math.round(
      dataState.terminology.completionPercentage * weights.terminology +
      dataState.metadata.completionPercentage * weights.metadata +
      dataState.cleanup.completionPercentage * weights.cleanup +
      dataState.structure.completionPercentage * weights.structure
    );
    
    // Identify specific issues
    if (dataState.terminology.completionPercentage < 100) {
      issues.push(`${dataState.terminology.legacyTerms} forms use legacy terminology`);
      improvements.push('Convert to universal terminology for multi-language support');
    }
    
    if (dataState.metadata.completionPercentage < 100) {
      issues.push(`${dataState.metadata.missingAuxiliaries} translations missing auxiliary data`);
      improvements.push('Add auxiliary metadata to enable compound tense generation');
    }
    
    if (dataState.cleanup.completionPercentage < 100) {
      issues.push(`${dataState.cleanup.deprecatedTags} deprecated tags found`);
      improvements.push('Replace deprecated tags with current standards');
    }
    
    // Add improvement suggestions
    const readyCount = recommendations.filter(r => r.readiness === 'ready').length;
    if (readyCount > 0) {
      improvements.push(`${readyCount} automated improvements ready to execute`);
    }
    
    return { score, issues, improvements };
  }

  /**
   * Clear analysis cache (useful for development/testing)
   */
  clearCache(): void {
    this.analysisCache.clear();
    console.log('🧹 Analysis cache cleared');
  }

  /**
   * Get specific rule recommendation
   */
  async getRecommendationForRule(ruleId: string): Promise<MigrationRecommendation | null> {
    const rule = getRuleById(ruleId);
    if (!rule) return null;
    
    const dataState = await this.analyzeDataState();
    return await this.analyzeRule(rule, dataState);
  }
}

console.log('✅ Migration Recommendation Engine loaded');
console.log('🎯 Ready to analyze current data state and recommend optimal migration strategy');
console.log('📊 Supports comprehensive data quality assessment and automated recommendations');