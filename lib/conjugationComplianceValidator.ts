// lib/conjugationComplianceValidator.ts
// EPIC 002: Complete Conjugation System Validation - REBUILT FROM SCRATCH
// Comprehensive validation system incorporating all compliance rules and terminology mappings

import { 
  VERB_COMPLIANCE_RULES,
  VerbComplianceReport,
  SystemComplianceReport,
  ComplianceIssue,
  ComplianceScore,
  COMPLIANCE_THRESHOLDS
} from './verbComplianceRules';

import { 
  terminologyConverter,
  ALL_TERMINOLOGY_MAPPINGS 
} from './universalTerminologyMappings';

import { 
  AUXILIARY_PATTERNS,
  getAuxiliaryPattern,
  isCompoundTense 
} from './auxPatterns';

export interface ValidationOptions {
  includeDeprecatedCheck: boolean;
  includeCrossTableAnalysis: boolean;
  includeTerminologyValidation: boolean;
  maxVerbsToAnalyze?: number;
  priorityFilter?: 'high-only' | 'all';
  generateAutoFixes: boolean;
}

export interface VerbData {
  word: {
    id: string;
    italian: string;
    word_type: string;
    tags: string[];
    created_at: string;
  } | null;
  translations: Array<{
    id: string;
    translation: string;
    context_metadata: any;
    form_ids?: number[];
    display_priority: number;
  }>;
  forms: Array<{
    id: number;
    form_text: string;
    translation: string;
    form_type: string;
    tags: string[];
    phonetic_form?: string;
    ipa?: string;
  }>;
  formTranslations: Array<{
    id: string;
    form_id: number;
    word_translation_id: string;
    translation: string;
  }>;
}

/**
 * Complete Conjugation Compliance Validator
 * 
 * Rebuilt from scratch to properly implement EPIC 002 validation requirements
 * Combines gap analysis, compliance checking, and architectural readiness assessment
 */
export class ConjugationComplianceValidator {
  private supabase: any;
  private validationResults: {
    totalVerbs: number;
    analyzedVerbs: number;
    verbReports: VerbComplianceReport[];
    systemReport: SystemComplianceReport;
    validationErrors: string[];
  };

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.resetValidationResults();
    console.log('🔧 ConjugationComplianceValidator initialized');
    console.log('📊 Loaded compliance rules for 4 data layers');
    console.log('🔄 Universal terminology converter ready');
    console.log('⚡ 74 auxiliary patterns available for validation');
  }

  private resetValidationResults() {
    this.validationResults = {
      totalVerbs: 0,
      analyzedVerbs: 0,
      verbReports: [],
      systemReport: this.createEmptySystemReport(),
      validationErrors: []
    };
  }

  /**
   * Main validation function - comprehensive analysis
   */
  async validateConjugationSystem(options: ValidationOptions = {
    includeDeprecatedCheck: true,
    includeCrossTableAnalysis: true,
    includeTerminologyValidation: true,
    maxVerbsToAnalyze: 50,
    priorityFilter: 'all',
    generateAutoFixes: true
  }): Promise<SystemComplianceReport> {

    console.log('🔍 Starting comprehensive conjugation system validation...');
    this.resetValidationResults();

    try {
      // Step 1: Load verbs for analysis
      const verbs = await this.loadVerbsForValidation(options);
      this.validationResults.totalVerbs = verbs.length;

      if (verbs.length === 0) {
        throw new Error('No verbs found matching criteria');
      }

      console.log(`📊 Validating ${verbs.length} verbs against EPIC 002 requirements...`);

      // Step 2: Validate each verb comprehensively
      for (let i = 0; i < verbs.length; i++) {
        const verb = verbs[i];
        console.log(`🔍 Validating ${i + 1}/${verbs.length}: ${verb.italian}`);
        
        try {
          const verbReport = await this.validateSingleVerb(verb, options);
          this.validationResults.verbReports.push(verbReport);
          this.validationResults.analyzedVerbs++;
        } catch (error) {
          console.error(`❌ Error validating ${verb.italian}:`, error);
          this.validationResults.validationErrors.push(`${verb.italian}: ${error.message}`);
        }
      }

      // Step 3: Generate system-wide compliance report
      this.validationResults.systemReport = this.generateSystemReport();

      console.log('✅ Comprehensive validation complete!');
      console.log(`📊 Overall compliance score: ${this.validationResults.systemReport.overallScore.overall}%`);
      
      return this.validationResults.systemReport;

    } catch (error) {
      console.error('❌ Validation system failure:', error);
      throw error;
    }
  }

  /**
   * Validate a single verb against all compliance rules
   */
  async validateSingleVerb(word: any, options: ValidationOptions): Promise<VerbComplianceReport> {
    console.log(`🔍 Deep validation: ${word.italian}`);

    try {
      console.log('📥 Loading complete verb data...');
      // Load complete verb data
      const verbData = await this.loadCompleteVerbData(word.id);
      console.log('✅ Loaded verb data:', verbData);

      const report: VerbComplianceReport = {
        verbId: word.id,
        verbItalian: word.italian,
        overallScore: 0,
        complianceStatus: 'compliant',
        wordLevelIssues: [],
        translationLevelIssues: [],
        formLevelIssues: [],
        crossTableIssues: [],
        missingBuildingBlocks: [],
        deprecatedContent: [],
        autoFixableIssues: [],
        manualInterventionRequired: [],
        epicAlignmentNotes: [],
        migrationReadiness: false,
        priorityLevel: this.calculateVerbPriority(word),
        estimatedFixTime: '0 minutes'
      };

      console.log('✅ Created base report');

      // 1. Word Level Validation
      console.log('🔍 Starting word level validation...');
      report.wordLevelIssues = this.validateWordLevel(word);
      console.log('✅ Word level complete:', report.wordLevelIssues.length, 'issues');

      // 2. Translation Level Validation
      console.log('🔍 Starting translation level validation...');
      report.translationLevelIssues = this.validateTranslationLevel(verbData.translations);
      console.log('✅ Translation level complete:', report.translationLevelIssues.length, 'issues');

      // 3. Form Level Validation
      console.log('🔍 Starting form level validation...');
      report.formLevelIssues = this.validateFormLevel(verbData.forms, options.includeTerminologyValidation);
      console.log('✅ Form level complete:', report.formLevelIssues.length, 'issues');

      // 4. Cross-Table Validation
      if (options.includeCrossTableAnalysis) {
        console.log('🔍 Starting cross-table validation...');
        report.crossTableIssues = await this.validateCrossTableRelationships(verbData);
        console.log('✅ Cross-table complete:', report.crossTableIssues.length, 'issues');
      }

      // 5. Building Blocks Validation
      console.log('🔍 Starting building blocks validation...');
      report.missingBuildingBlocks = this.validateBuildingBlocks(verbData.forms);
      console.log('✅ Building blocks complete:', report.missingBuildingBlocks.length, 'missing');

      // 6. Deprecated Content Check
      if (options.includeDeprecatedCheck) {
        console.log('🔍 Starting deprecated content check...');
        report.deprecatedContent = this.findDeprecatedContent(verbData);
        console.log('✅ Deprecated content complete:', report.deprecatedContent.length, 'items');
      }

      // 7. Auto-fix identification
      if (options.generateAutoFixes) {
        console.log('🔍 Identifying auto-fixes...');
        this.identifyAutoFixableIssues(report);
        console.log('✅ Auto-fixes complete:', report.autoFixableIssues.length, 'fixable');
      }

      // 8. Calculate overall compliance
      console.log('🔍 Calculating compliance...');
      this.calculateVerbCompliance(report);
      console.log('✅ Compliance calculated:', report.overallScore);

      console.log('✅ Validation result:', report);
      return report;

    } catch (error) {
      console.error(`❌ Error in validateSingleVerb for ${word.italian}:`, error);
      throw error; // Re-throw so the calling method sees it
    }
  }

  /**
   * Load verbs for validation with proper filtering
   */
  private async loadVerbsForValidation(options: ValidationOptions): Promise<any[]> {
    console.log('📥 Loading verbs for validation...');

    let query = this.supabase
      .from('dictionary')
      .select(`
        id,
        italian,
        word_type,
        tags,
        created_at
      `)
      .eq('word_type', 'VERB');

    // Apply priority filter
    if (options.priorityFilter === 'high-only') {
      query = query.or(
        'tags.cs.{"freq-top100"},tags.cs.{"freq-top200"},tags.cs.{"freq-top500"},tags.cs.{"CEFR-A1"},tags.cs.{"CEFR-A2"}'
      );
    }

    const { data: verbs, error } = await query
      .order('italian')
      .limit(options.maxVerbsToAnalyze || 50);

    if (error) {
      throw new Error(`Failed to load verbs: ${error.message}`);
    }

    console.log(`✅ Loaded ${verbs?.length || 0} verbs for validation`);
    return verbs || [];
  }

  /**
   * Load complete verb data for comprehensive analysis
   */
  private async loadCompleteVerbData(wordId: string): Promise<VerbData> {
    try {
      // Load word forms
      const { data: forms, error: formsError } = await this.supabase
        .from('word_forms')
        .select(`
          id,
          form_text,
          translation,
          form_type,
          tags,
          phonetic_form,
          ipa,
          created_at
        `)
        .eq('word_id', wordId);

      if (formsError) throw formsError;

      // Load word translations
      const { data: translations, error: translationsError } = await this.supabase
        .from('word_translations')
        .select(`
          id,
          translation,
          context_metadata,
          form_ids,
          display_priority,
          usage_notes
        `)
        .eq('word_id', wordId);

      if (translationsError) throw translationsError;

      // Load form-translation assignments
      const formIds = (forms || []).map(f => f.id);
      let formTranslations = [];
      
      if (formIds.length > 0) {
        const { data: assignments, error: assignmentsError } = await this.supabase
          .from('form_translations')
          .select(`
            id,
            form_id,
            word_translation_id,
            translation
          `)
          .in('form_id', formIds);

        if (assignmentsError) {
          console.warn(`⚠️ Could not load form assignments: ${assignmentsError.message}`);
        } else {
          formTranslations = assignments || [];
        }
      }

      return {
        word: null, // Will be populated by caller
        translations: translations || [],
        forms: forms || [],
        formTranslations: formTranslations
      };

    } catch (error) {
      console.error(`❌ Error loading verb data for ${wordId}:`, error);
      throw error;
    }
  }

  /**
   * Validate word-level compliance (dictionary table)
   */
  private validateWordLevel(word: any): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const tags = word.tags || [];

    console.log(`🔍 Word level validation: ${word.italian} with ${tags.length} tags`);

    // Check conjugation class requirement
    const conjugationClassTags = tags.filter(tag => 
      VERB_COMPLIANCE_RULES.wordLevel.conjugation_class.tags.includes(tag)
    );

    if (conjugationClassTags.length === 0) {
      issues.push({
        ruleId: 'missing-conjugation-class',
        severity: 'critical',
        message: 'Missing required conjugation class tag',
        currentValue: tags,
        expectedValue: 'Exactly one of: are-conjugation, ere-conjugation, ire-conjugation, ire-isc-conjugation',
        autoFix: this.suggestConjugationClass(word.italian),
        epicContext: 'Layer 1: Word Properties - conjugation class determines form generation patterns'
      });
    } else if (conjugationClassTags.length > 1) {
      issues.push({
        ruleId: 'multiple-conjugation-classes',
        severity: 'critical',
        message: 'Multiple conjugation class tags found',
        currentValue: conjugationClassTags,
        expectedValue: 'Exactly one conjugation class tag',
        manualSteps: ['Review verb ending and choose correct conjugation class', 'Remove duplicate tags'],
        epicContext: 'Each verb must have exactly one conjugation class'
      });
    }

    // Check for deprecated word-level tags
    const deprecatedTags = tags.filter(tag => 
      VERB_COMPLIANCE_RULES.wordLevel.deprecatedTags?.includes(tag)
    );

    if (deprecatedTags.length > 0) {
      issues.push({
        ruleId: 'deprecated-word-tags',
        severity: 'medium',
        message: `Found ${deprecatedTags.length} deprecated word-level tags`,
        currentValue: deprecatedTags,
        expectedValue: 'No deprecated tags',
        autoFix: `Remove deprecated tags: ${deprecatedTags.join(', ')}`,
        epicContext: 'Deprecated tags must be removed for architectural consistency'
      });
    }

    // Check transitivity potential for new architecture
    const transitivityTags = tags.filter(tag => 
      ['always-transitive', 'always-intransitive', 'both-possible'].includes(tag)
    );

    if (transitivityTags.length === 0) {
      issues.push({
        ruleId: 'missing-transitivity-potential',
        severity: 'high',
        message: 'Missing transitivity potential classification',
        currentValue: tags,
        expectedValue: 'One of: always-transitive, always-intransitive, both-possible',
        manualSteps: ['Analyze verb usage patterns', 'Add appropriate transitivity tag'],
        epicContext: 'Translation-level auxiliary assignment validation depends on word-level transitivity'
      });
    }

    return issues;
  }

  /**
   * Validate translation-level compliance (word_translations table)
   */
  private validateTranslationLevel(translations: any[]): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    console.log(`🔍 Translation level validation: ${translations.length} translations`);

    if (translations.length === 0) {
      issues.push({
        ruleId: 'no-translations',
        severity: 'critical',
        message: 'Verb has no translations defined',
        currentValue: 0,
        expectedValue: 'At least one translation required',
        manualSteps: ['Create at least one translation in word_translations table'],
        epicContext: 'Translation-driven architecture requires at least one meaning definition'
      });
      return issues;
    }

    for (const translation of translations) {
      const metadata = translation.context_metadata || {};

      // Check required auxiliary assignment
      if (!metadata.auxiliary || !['avere', 'essere'].includes(metadata.auxiliary)) {
        issues.push({
          ruleId: 'missing-auxiliary-assignment',
          severity: 'critical',
          message: `Translation "${translation.translation}" missing auxiliary assignment`,
          currentValue: metadata.auxiliary || 'undefined',
          expectedValue: 'avere or essere',
          manualSteps: [
            'Analyze verb semantics and transitivity',
            'Set context_metadata.auxiliary to "avere" or "essere"'
          ],
          epicContext: 'Layer 2: Translation Metadata - auxiliary drives all compound form materialization'
        });
      }

      // Check form_ids array (critical for new architecture)
      if (!translation.form_ids || !Array.isArray(translation.form_ids) || translation.form_ids.length === 0) {
        issues.push({
          ruleId: 'missing-form-ids-array',
          severity: 'critical',
          message: `Translation "${translation.translation}" missing form_ids array`,
          currentValue: translation.form_ids || 'undefined',
          expectedValue: 'Array of form IDs this translation uses',
          manualSteps: [
            'Identify which forms belong to this translation meaning',
            'Create form_ids array with appropriate form IDs'
          ],
          epicContext: 'Translation-to-form relationship - core architecture requirement'
        });
      }

      // Check transitivity consistency
      if (!metadata.transitivity || !['transitive', 'intransitive'].includes(metadata.transitivity)) {
        issues.push({
          ruleId: 'missing-transitivity',
          severity: 'high',
          message: `Translation "${translation.translation}" missing transitivity specification`,
          currentValue: metadata.transitivity || 'undefined',
          expectedValue: 'transitive or intransitive',
          manualSteps: ['Analyze if this meaning takes direct objects', 'Set context_metadata.transitivity'],
          epicContext: 'Semantic consistency validation with auxiliary selection'
        });
      }

      // Validate reflexive usage constraints
      if (metadata.usage && ['direct-reflexive', 'reciprocal'].includes(metadata.usage)) {
        if (metadata.usage === 'reciprocal' && metadata.plurality !== 'plural-only') {
          issues.push({
            ruleId: 'reciprocal-plurality-mismatch',
            severity: 'high',
            message: `Reciprocal usage requires plural-only constraint`,
            currentValue: metadata.plurality || 'undefined',
            expectedValue: 'plural-only',
            autoFix: 'Set context_metadata.plurality = "plural-only"',
            epicContext: 'Reciprocal actions require multiple participants'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate form-level compliance (word_forms table)
   */
  private validateFormLevel(forms: any[], includeTerminology: boolean = true): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    console.log(`🔍 Form level validation: ${forms.length} forms`);

    if (forms.length === 0) {
      issues.push({
        ruleId: 'no-forms',
        severity: 'critical',
        message: 'Verb has no forms defined',
        currentValue: 0,
        expectedValue: 'At least basic conjugation forms required',
        manualSteps: ['Create essential forms in word_forms table'],
        epicContext: 'Forms required for conjugation display and learning'
      });
      return issues;
    }

    for (const form of forms) {
      const tags = form.tags || [];

      // Universal terminology validation
      if (includeTerminology) {
        const terminologyIssues = this.validateUniversalTerminology(form, tags);
        issues.push(...terminologyIssues);
      }

      // Mood requirement
      const moodTags = tags.filter(tag => 
        VERB_COMPLIANCE_RULES.formLevel.moods.tags.includes(tag)
      );
      
      if (moodTags.length === 0) {
        issues.push({
          ruleId: 'missing-mood-tag',
          severity: 'critical',
          message: `Form "${form.form_text}" missing mood classification`,
          currentValue: tags,
          expectedValue: 'Exactly one mood tag required',
          manualSteps: ['Add appropriate mood tag: indicativo, congiuntivo, condizionale, etc.'],
          epicContext: 'Mood classification essential for form organization'
        });
      }

      // Tense requirement
      const tenseTags = tags.filter(tag => 
        VERB_COMPLIANCE_RULES.formLevel.tenses.tags.includes(tag)
      );
      
      if (tenseTags.length === 0) {
        issues.push({
          ruleId: 'missing-tense-tag',
          severity: 'critical',
          message: `Form "${form.form_text}" missing tense classification`,
          currentValue: tags,
          expectedValue: 'Exactly one tense tag required',
          manualSteps: ['Add appropriate tense tag from EPIC 26-category system'],
          epicContext: 'Complete tense specification from EPIC 26-category system'
        });
      }

      // Compound form auxiliary tag validation
      if (this.isCompoundForm(form)) {
        const auxiliaryTags = tags.filter(tag => 
          ['avere-auxiliary', 'essere-auxiliary', 'stare-auxiliary'].includes(tag)
        );
        
        if (auxiliaryTags.length === 0) {
          issues.push({
            ruleId: 'missing-auxiliary-tag',
            severity: 'critical',
            message: `Compound form "${form.form_text}" missing auxiliary tag`,
            currentValue: tags,
            expectedValue: 'One auxiliary tag: avere-auxiliary, essere-auxiliary, or stare-auxiliary',
            autoFix: this.detectAuxiliaryFromForm(form.form_text),
            epicContext: 'Explicit auxiliary tags eliminate runtime inference requirement'
          });
        }
      }

      // Building block validation
      if (this.isBuildingBlockForm(form)) {
        if (!tags.includes('building-block')) {
          issues.push({
            ruleId: 'missing-building-block-tag',
            severity: 'critical',
            message: `Building block form "${form.form_text}" missing building-block tag`,
            currentValue: tags,
            expectedValue: 'Must include building-block tag',
            autoFix: 'Add "building-block" tag',
            epicContext: 'Building blocks enable compound form generation'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate universal terminology compliance
   */
  private validateUniversalTerminology(form: any, tags: string[]): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // Check for legacy person terms
    const legacyPersons = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
    const foundLegacyPersons = tags.filter(tag => legacyPersons.includes(tag));
    
    if (foundLegacyPersons.length > 0) {
      const universalEquivalents = foundLegacyPersons.map(legacy => 
        terminologyConverter.legacyToUniversal(legacy)
      );
      
      issues.push({
        ruleId: 'legacy-person-terms',
        severity: 'critical',
        message: `Form "${form.form_text}" uses legacy person terms`,
        currentValue: foundLegacyPersons,
        expectedValue: universalEquivalents,
        autoFix: `Replace with universal terms: ${foundLegacyPersons.map((legacy, i) => 
          `${legacy} → ${universalEquivalents[i]}`
        ).join(', ')}`,
        epicContext: 'Multi-language support requires universal terminology'
      });
    }

    // Check for deprecated auxiliary format
    const legacyAuxiliaryTerms = tags.filter(tag => 
      ['auxiliary-essere', 'auxiliary-avere', 'auxiliary-stare'].includes(tag)
    );
    
    if (legacyAuxiliaryTerms.length > 0) {
      issues.push({
        ruleId: 'legacy-auxiliary-format',
        severity: 'critical',
        message: `Form "${form.form_text}" uses legacy auxiliary format`,
        currentValue: legacyAuxiliaryTerms,
        expectedValue: 'Standard format: essere-auxiliary, avere-auxiliary, stare-auxiliary',
        autoFix: legacyAuxiliaryTerms.map(legacy => 
          legacy.replace('auxiliary-', '') + '-auxiliary'
        ).join(', '),
        epicContext: 'Standardized auxiliary tag format required'
      });
    }

    return issues;
  }

  /**
   * Validate cross-table relationships
   */
  private async validateCrossTableRelationships(verbData: VerbData): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];

    console.log('🔗 Cross-table relationship validation');

    // Validate form_ids integrity
    for (const translation of verbData.translations) {
      if (translation.form_ids && Array.isArray(translation.form_ids)) {
        for (const formId of translation.form_ids) {
          const referencedForm = verbData.forms.find(f => f.id === formId);
          if (!referencedForm) {
            issues.push({
              ruleId: 'broken-form-reference',
              severity: 'critical',
              message: `Translation "${translation.translation}" references non-existent form ID ${formId}`,
              currentValue: translation.form_ids,
              expectedValue: 'All form_ids must reference existing forms',
              manualSteps: ['Remove invalid form_id', 'Create missing form', 'Verify form_ids array'],
              epicContext: 'Translation-to-form relationship integrity essential'
            });
          }
        }
      }
    }

    // Validate auxiliary consistency
    for (const translation of verbData.translations) {
      const translationAux = translation.context_metadata?.auxiliary;
      if (translationAux && translation.form_ids) {
        for (const formId of translation.form_ids) {
          const form = verbData.forms.find(f => f.id === formId);
          if (form && this.isCompoundForm(form)) {
            const expectedAuxTag = `${translationAux}-auxiliary`;
            if (!form.tags.includes(expectedAuxTag)) {
              issues.push({
                ruleId: 'auxiliary-consistency-mismatch',
                severity: 'critical',
                message: `Form "${form.form_text}" auxiliary tag doesn't match translation auxiliary`,
                currentValue: form.tags.filter(t => t.includes('auxiliary')),
                expectedValue: expectedAuxTag,
                autoFix: `Add "${expectedAuxTag}" tag to form`,
                epicContext: 'Auxiliary consistency between translation metadata and form tags'
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate building blocks for compound generation
   */
  private validateBuildingBlocks(forms: any[]): string[] {
    const missing: string[] = [];

    console.log('🧱 Building blocks validation');

    // Check for past participle
    const hasParticiple = forms.some(f => 
      f.tags?.includes('participio-passato') && 
      f.tags?.includes('building-block')
    );
    
    if (!hasParticiple) {
      missing.push('participio-passato');
    }

    // Check for present gerund
    const hasGerund = forms.some(f => 
      f.tags?.includes('gerundio-presente') && 
      f.tags?.includes('building-block')
    );
    
    if (!hasGerund) {
      missing.push('gerundio-presente');
    }

    // Check for present infinitive
    const hasInfinitive = forms.some(f => 
      f.tags?.includes('infinito-presente')
    );
    
    if (!hasInfinitive) {
      missing.push('infinito-presente');
    }

    return missing;
  }

  /**
   * Find deprecated content that should be removed
   */
  private findDeprecatedContent(verbData: VerbData): string[] {
    const deprecated: string[] = [];

    // Check for negative forms (out of scope)
    const negativeForms = verbData.forms.filter(f => 
      f.form_text.includes('non ') || f.tags?.includes('negative')
    );
    
    if (negativeForms.length > 0) {
      deprecated.push(`${negativeForms.length} negative forms (out of EPIC scope)`);
    }

    // Check for complex clitic forms (out of scope)
    const complexCliticForms = verbData.forms.filter(f => 
      this.hasComplexClitics(f.form_text)
    );
    
    if (complexCliticForms.length > 0) {
      deprecated.push(`${complexCliticForms.length} complex clitic forms (out of EPIC scope)`);
    }

    return deprecated;
  }

  /**
   * Helper methods for form classification
   */
  private isCompoundForm(form: any): boolean {
    const auxiliaryPatterns = [
      /^(ho|hai|ha|abbiamo|avete|hanno)\s+\w+$/,  // avere compounds
      /^(sono|sei|è|siamo|siete|sono)\s+\w+$/,    // essere compounds
      /^(sto|stai|sta|stiamo|state|stanno)\s+\w+$/ // stare progressives
    ];
    
    return auxiliaryPatterns.some(pattern => pattern.test(form.form_text));
  }

  private isBuildingBlockForm(form: any): boolean {
    const tags = form.tags || [];
    return tags.includes('participio-passato') || 
           tags.includes('gerundio-presente') ||
           tags.includes('infinito-presente');
  }

  private hasComplexClitics(formText: string): boolean {
    // Complex clitic patterns that are out of EPIC scope
    const complexPatterns = [
      /\w+(ti|mi|si|ci|vi|lo|la|li|le|ne|gli|glie)$/,  // Enclitic attachment
      /(me|te|se|ce|ve)\s+(lo|la|li|le|ne)\s+/,        // Double clitics
      /gli(elo|ela|eli|ele|ene)/                        // Combined pronouns
    ];
    
    return complexPatterns.some(pattern => pattern.test(formText));
  }

  private detectAuxiliaryFromForm(formText: string): string {
    if (/^(ho|hai|ha|abbiamo|avete|hanno)\s/.test(formText)) {
      return 'Add "avere-auxiliary" tag';
    } else if (/^(sono|sei|è|siamo|siete|sono)\s/.test(formText)) {
      return 'Add "essere-auxiliary" tag';  
    } else if (/^(sto|stai|sta|stiamo|state|stanno)\s/.test(formText)) {
      return 'Add "stare-auxiliary" tag';
    }
    return 'Add appropriate auxiliary tag based on form structure';
  }

  private suggestConjugationClass(verbItalian: string): string {
    if (verbItalian.endsWith('are')) return 'Add "are-conjugation" tag';
    if (verbItalian.endsWith('ere')) return 'Add "ere-conjugation" tag';
    if (verbItalian.endsWith('ire')) return 'Add "ire-conjugation" or "ire-isc-conjugation" tag';
    return 'Add appropriate conjugation class tag based on verb ending';
  }

  /**
   * Identify auto-fixable issues for automated remediation
   */
  private identifyAutoFixableIssues(report: VerbComplianceReport) {
    const allIssues = [
      ...report.wordLevelIssues,
      ...report.translationLevelIssues,
      ...report.formLevelIssues,
      ...report.crossTableIssues
    ];

    report.autoFixableIssues = allIssues.filter(issue => issue.autoFix);
    report.manualInterventionRequired = allIssues.filter(issue => !issue.autoFix);
  }

  /**
   * Calculate verb compliance score and status
   */
  private calculateVerbCompliance(report: VerbComplianceReport) {
    const allIssues = [
      ...report.wordLevelIssues,
      ...report.translationLevelIssues,
      ...report.formLevelIssues,
      ...report.crossTableIssues
    ];

    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const highIssues = allIssues.filter(i => i.severity === 'high').length;
    const mediumIssues = allIssues.filter(i => i.severity === 'medium').length;

    // Calculate score (0-100)
    const totalPossibleIssues = 20; // Estimated maximum issues per verb
    const weightedIssues = (criticalIssues * 4) + (highIssues * 2) + (mediumIssues * 1);
    report.overallScore = Math.max(0, Math.round(((totalPossibleIssues - weightedIssues) / totalPossibleIssues) * 100));

    // Determine compliance status
    if (criticalIssues > 0) {
      report.complianceStatus = 'blocks-migration';
    } else if (highIssues > 2) {
      report.complianceStatus = 'critical-issues';
    } else if (allIssues.length > 0) {
      report.complianceStatus = 'needs-work';
    } else {
      report.complianceStatus = 'compliant';
    }

    // Migration readiness
    report.migrationReadiness = criticalIssues === 0 && highIssues <= 1;

    // Estimate fix time
    const autoFixTime = report.autoFixableIssues.length * 2; // 2 minutes per auto-fix
    const manualFixTime = report.manualInterventionRequired.length * 15; // 15 minutes per manual fix
    const totalMinutes = autoFixTime + manualFixTime;
    
    if (totalMinutes === 0) {
      report.estimatedFixTime = '0 minutes';
    } else if (totalMinutes < 60) {
      report.estimatedFixTime = `${totalMinutes} minutes`;
    } else {
      report.estimatedFixTime = `${Math.round(totalMinutes / 60)} hours`;
    }
  }

  /**
   * Calculate verb priority for remediation ordering
   */
  private calculateVerbPriority(word: any): 'high' | 'medium' | 'low' {
    const tags = word.tags || [];
    
    if (tags.some(tag => ['freq-top100', 'CEFR-A1'].includes(tag))) {
      return 'high';
    } else if (tags.some(tag => ['freq-top500', 'CEFR-A2', 'CEFR-B1'].includes(tag))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate comprehensive system-wide compliance report
   */
  private generateSystemReport(): SystemComplianceReport {
    const reports = this.validationResults.verbReports;
    
    const complianceDistribution = {
      compliant: reports.filter(r => r.complianceStatus === 'compliant').length,
      needsWork: reports.filter(r => r.complianceStatus === 'needs-work').length,
      criticalIssues: reports.filter(r => r.complianceStatus === 'critical-issues').length,
      blocksMigration: reports.filter(r => r.complianceStatus === 'blocks-migration').length
    };

    const overallScore: ComplianceScore = {
      overall: Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length) || 0,
      critical: reports.filter(r => r.complianceStatus === 'compliant' || r.complianceStatus === 'needs-work').length / reports.length * 100,
      blockers: complianceDistribution.blocksMigration,
      warnings: complianceDistribution.needsWork + complianceDistribution.criticalIssues,
      verbsCompliant: complianceDistribution.compliant,
      verbsNeedingWork: reports.length - complianceDistribution.compliant
    };

    // Count top issues across all verbs
    const issueCounter = new Map<string, number>();
    reports.forEach(report => {
      [...report.wordLevelIssues, ...report.translationLevelIssues, 
       ...report.formLevelIssues, ...report.crossTableIssues].forEach(issue => {
        issueCounter.set(issue.ruleId, (issueCounter.get(issue.ruleId) || 0) + 1);
      });
    });

    const topIssues = Array.from(issueCounter.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ruleId, count]) => ({
        ruleId,
        count,
        impact: this.getIssueImpact(ruleId)
      }));

    const autoFixableCount = reports.reduce((sum, r) => sum + r.autoFixableIssues.length, 0);

    const migrationReadiness = {
      ready: overallScore.overall >= COMPLIANCE_THRESHOLDS.READY_FOR_MIGRATION && 
             complianceDistribution.blocksMigration === 0,
      blockers: this.identifyMigrationBlockers(reports),
      recommendations: this.generateRecommendations(reports, overallScore)
    };

    return {
      totalVerbs: this.validationResults.totalVerbs,
      analyzedVerbs: this.validationResults.analyzedVerbs,
      complianceDistribution,
      overallScore,
      topIssues,
      autoFixableCount,
      estimatedWorkRequired: this.calculateEstimatedWork(reports),
      migrationReadiness,
      epicAlignmentSummary: {
        architecturalReadiness: this.calculateArchitecturalReadiness(reports),
        dataQuality: this.calculateDataQuality(reports),
        linguisticAccuracy: this.calculateLinguisticAccuracy(reports)
      }
    };
  }

  private createEmptySystemReport(): SystemComplianceReport {
    return {
      totalVerbs: 0,
      analyzedVerbs: 0,
      complianceDistribution: { compliant: 0, needsWork: 0, criticalIssues: 0, blocksMigration: 0 },
      overallScore: { overall: 0, critical: 0, blockers: 0, warnings: 0, verbsCompliant: 0, verbsNeedingWork: 0 },
      topIssues: [],
      autoFixableCount: 0,
      estimatedWorkRequired: '0 minutes',
      migrationReadiness: { ready: false, blockers: [], recommendations: [] },
      epicAlignmentSummary: { architecturalReadiness: 0, dataQuality: 0, linguisticAccuracy: 0 }
    };
  }

  private getIssueImpact(ruleId: string): string {
    const impacts: Record<string, string> = {
      'missing-conjugation-class': 'Blocks form generation and categorization',
      'missing-auxiliary-assignment': 'Prevents compound tense materialization',
      'missing-form-ids-array': 'Breaks translation-to-form relationship architecture',
      'legacy-person-terms': 'Prevents multi-language expansion',
      'missing-auxiliary-tag': 'Requires runtime inference, degrades performance',
      'broken-form-reference': 'Causes runtime errors in new system'
    };
    
    return impacts[ruleId] || 'Affects data consistency and architectural compliance';
  }

  private identifyMigrationBlockers(reports: VerbComplianceReport[]): string[] {
    const blockers: string[] = [];
    
    const criticalIssueCount = reports.filter(r => r.complianceStatus === 'blocks-migration').length;
    if (criticalIssueCount > 0) {
      blockers.push(`${criticalIssueCount} verbs have critical migration-blocking issues`);
    }

    const missingBuildingBlocks = reports.filter(r => r.missingBuildingBlocks.length > 0).length;
    if (missingBuildingBlocks > 0) {
      blockers.push(`${missingBuildingBlocks} verbs missing essential building blocks`);
    }

    return blockers;
  }

  private generateRecommendations(reports: VerbComplianceReport[], score: ComplianceScore): string[] {
    const recommendations: string[] = [];

    if (score.blockers > 0) {
      recommendations.push('Address migration-blocking issues immediately');
    }

    if (score.warnings > 10) {
      recommendations.push('Implement batch remediation for common issues');
    }

    const autoFixCount = reports.reduce((sum, r) => sum + r.autoFixableIssues.length, 0);
    if (autoFixCount > 0) {
      recommendations.push(`Run automated fixes for ${autoFixCount} auto-fixable issues`);
    }

    if (score.overall < 80) {
      recommendations.push('Focus on high-priority verbs first (freq-top100, CEFR-A1)');
    }

    return recommendations;
  }

  private calculateEstimatedWork(reports: VerbComplianceReport[]): string {
    const totalMinutes = reports.reduce((sum, report) => {
      const minutes = parseInt(report.estimatedFixTime.split(' ')[0]) || 0;
      return sum + minutes;
    }, 0);

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else if (totalMinutes < 1440) {
      return `${Math.round(totalMinutes / 60)} hours`;
    } else {
      return `${Math.round(totalMinutes / 1440)} days`;
    }
  }

  private calculateArchitecturalReadiness(reports: VerbComplianceReport[]): number {
    const readyVerbs = reports.filter(r => r.migrationReadiness).length;
    return Math.round((readyVerbs / reports.length) * 100) || 0;
  }

  private calculateDataQuality(reports: VerbComplianceReport[]): number {
    const qualityVerbs = reports.filter(r => 
      r.complianceStatus === 'compliant' || r.complianceStatus === 'needs-work'
    ).length;
    return Math.round((qualityVerbs / reports.length) * 100) || 0;
  }

  private calculateLinguisticAccuracy(reports: VerbComplianceReport[]): number {
    const accurateVerbs = reports.filter(r => 
      r.missingBuildingBlocks.length === 0 && 
      r.deprecatedContent.length === 0
    ).length;
    return Math.round((accurateVerbs / reports.length) * 100) || 0;
  }

  /**
   * Quick validation for specific verb
   */
  async validateSpecificVerb(verbItalian: string): Promise<VerbComplianceReport | null> {
    console.log(`🔍 Quick validation for: ${verbItalian}`);

    try {
      console.log('📥 Looking up verb in database...');
      const { data: word, error } = await this.supabase
        .from('dictionary')
        .select('*')
        .eq('italian', verbItalian)
        .eq('word_type', 'VERB')
        .single();

      if (error) {
        console.error(`❌ Database error:`, error);
        return null;
      }

      if (!word) {
        console.error(`❌ Verb "${verbItalian}" not found`);
        return null;
      }

      console.log(`✅ Found verb:`, word);

      const options: ValidationOptions = {
        includeDeprecatedCheck: true,
        includeCrossTableAnalysis: true,
        includeTerminologyValidation: true,
        generateAutoFixes: true
      };

      console.log('🔍 Starting detailed validation...');
      const result = await this.validateSingleVerb(word, options);
      console.log('✅ Validation result:', result);

      return result;

    } catch (error) {
      console.error(`❌ Error validating ${verbItalian}:`, error);
      return null;
    }
  }

  /**
   * Get validation results
   */
  getLastValidationResults() {
    return this.validationResults;
  }
}

console.log('✅ ConjugationComplianceValidator ready');
console.log('🔧 Comprehensive validation system built from scratch');
console.log('📊 Incorporates all EPIC 002 compliance rules and terminology mappings');
console.log('🎯 Ready for browser-based admin interface integration');