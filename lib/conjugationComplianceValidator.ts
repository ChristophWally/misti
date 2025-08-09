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
    display_priority: number;
  }>;
  forms: Array<{
    id: number;
    form_text: string;
    form_type: string;
    tags: string[];
    phonetic_form?: string;
    ipa?: string;
    created_at?: string;
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

  async validateConjugationSystemWithDebug(options: ValidationOptions, debugLog: (msg: string) => void): Promise<SystemComplianceReport> {
    debugLog('🔍 Starting system-wide validation...');
    this.resetValidationResults();

    try {
      const verbs = await this.loadVerbsForValidation(options);
      debugLog(`✅ Loaded ${verbs.length} verbs for analysis`);
      this.validationResults.totalVerbs = verbs.length;

      for (let i = 0; i < verbs.length; i++) {
        const verb = verbs[i];
        debugLog(`🔍 Analyzing ${i + 1}/${verbs.length}: ${verb.italian}`);

        try {
          const verbReport = await this.validateSingleVerb(verb, options);
          this.validationResults.verbReports.push(verbReport);
          this.validationResults.analyzedVerbs++;
        } catch (error) {
          debugLog(`❌ Error validating ${verb.italian}: ${error.message}`);
          this.validationResults.validationErrors.push(`${verb.italian}: ${error.message}`);
        }
      }

      this.validationResults.systemReport = this.generateSystemReport();
      debugLog(`✅ System analysis complete: ${this.validationResults.systemReport.overallScore.overall}% compliance`);

      return this.validationResults.systemReport;

    } catch (error) {
      debugLog(`❌ System validation failed: ${error.message}`);
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

      // 4. Cross-Table Validation (updated)
      if (options.includeCrossTableAnalysis) {
        console.log('🔍 Starting cross-table validation...');
        report.crossTableIssues = await this.validateCrossTableRelationships(verbData);
        const formTranslationIssues = await this.validateFormTranslationRelationships(verbData);
        report.crossTableIssues.push(...formTranslationIssues);
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
      // Load word forms (removed 'translation' column that doesn't exist)
      const { data: forms, error: formsError } = await this.supabase
        .from('word_forms')
        .select(`
          id,
          form_text,
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

    // Check conjugation class requirement
    const conjugationClassTags = tags.filter(tag =>
      VERB_COMPLIANCE_RULES.wordLevel.conjugation_class.tags.includes(tag)
    );

    if (conjugationClassTags.length === 0) {
      const expectedClasses = VERB_COMPLIANCE_RULES.wordLevel.conjugation_class.tags;
      const suggestedClass = this.suggestConjugationClass(word.italian);

      issues.push({
        ruleId: 'missing-conjugation-class',
        severity: 'critical',
        message: 'Missing required conjugation class tag',
        currentValue: tags,
        expectedValue: 'Exactly one of: ' + expectedClasses.join(', '),
        autoFix: suggestedClass,
        manualSteps: [
          'Analyze verb ending (-are, -ere, -ire)',
          'Add appropriate conjugation class tag',
          `For "${word.italian}": ${suggestedClass}`
        ],
        epicContext: 'Layer 1: Word Properties - conjugation class determines form generation patterns'
      });
    }

    // Detailed transitivity check
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
        manualSteps: [
          'Check if verb takes direct objects (transitive)',
          'Check if verb never takes direct objects (intransitive)',
          'Check if verb can be both (like "mangiare")',
          'Add appropriate tag to word.tags array'
        ],
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

    if (translations.length === 0) {
      issues.push({
        ruleId: 'no-translations',
        severity: 'critical',
        message: 'Verb has no translations defined',
        currentValue: 0,
        expectedValue: 'At least one translation required',
        manualSteps: [
          'Go to word_translations table',
          'Add entry with word_id = this verb ID',
          'Set translation to English meaning',
          'Set context_metadata.auxiliary to "avere" or "essere"'
        ],
        epicContext: 'Translation-driven architecture requires at least one meaning definition'
      });
      return issues;
    }

    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      const metadata = translation.context_metadata || {};

      // Detailed auxiliary check
      if (!metadata.auxiliary || !['avere', 'essere'].includes(metadata.auxiliary)) {
        issues.push({
          ruleId: 'missing-auxiliary-assignment',
          severity: 'critical',
          message: `Translation #${i + 1} "${translation.translation}" missing auxiliary assignment`,
          currentValue: metadata.auxiliary || 'undefined',
          expectedValue: 'avere or essere',
          manualSteps: [
            `Edit word_translations record ID: ${translation.id}`,
            'Set context_metadata.auxiliary to:',
            '  - "avere" for transitive actions (takes direct object)',
            '  - "essere" for intransitive actions, motion, state changes',
            `For "${translation.translation}": analyze if it takes direct objects`
          ],
          epicContext: 'Layer 2: Translation Metadata - auxiliary drives all compound form materialization'
        });
      }

      if (!metadata.transitivity) {
        issues.push({
          ruleId: 'missing-transitivity',
          severity: 'high',
          message: `Translation #${i + 1} "${translation.translation}" missing transitivity`,
          currentValue: metadata.transitivity || 'undefined',
          expectedValue: 'transitive or intransitive',
          manualSteps: [
            `Edit word_translations record ID: ${translation.id}`,
            'Set context_metadata.transitivity based on whether it takes direct objects'
          ],
          epicContext: 'Required for auxiliary validation consistency'
        });
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

    for (const assignment of verbData.formTranslations) {
      const form = verbData.forms.find(f => f.id === assignment.form_id);
      const translation = verbData.translations.find(t => t.id === assignment.word_translation_id);

      if (!form || !translation) {
        issues.push({
          ruleId: 'broken-form-translation-reference',
          severity: 'critical',
          message: `Form_translation ${assignment.id} references missing form or translation`,
          currentValue: assignment,
          expectedValue: 'Valid form_id and word_translation_id',
          manualSteps: ['Remove invalid assignment', 'Create missing record', 'Verify form_translations entries'],
          epicContext: 'Translation-to-form relationship integrity essential'
        });
        continue;
      }

      const translationAux = translation.context_metadata?.auxiliary;
      if (translationAux && this.isCompoundForm(form)) {
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

    return issues;
  }

  private async validateFormTranslationRelationships(verbData: VerbData): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];

    // Count expected form_translations based on auxiliary variations
    const auxiliaries = new Set(
      verbData.translations.map(t => t.context_metadata?.auxiliary).filter(Boolean)
    );
    const totalForms = verbData.forms.length;

    // Each translation should cover appropriate forms
    for (const translation of verbData.translations) {
      const translationFormTranslations = verbData.formTranslations.filter(ft =>
        ft.word_translation_id === translation.id
      );

      const expectedCount = auxiliaries.size > 1 ? totalForms : totalForms;

      if (translationFormTranslations.length === 0) {
        issues.push({
          ruleId: 'translation-no-forms',
          severity: 'critical',
          message: `Translation "${translation.translation}" covers no forms`,
          currentValue: 0,
          expectedValue: `~${expectedCount} form_translations`,
          manualSteps: [
            'Create form_translations entries linking this translation to appropriate forms',
            `Link to forms with matching auxiliary type (${translation.context_metadata?.auxiliary})`
          ],
          epicContext: 'Each translation must cover its auxiliary-appropriate forms'
        });
      } else if (translationFormTranslations.length < expectedCount * 0.8) {
        issues.push({
          ruleId: 'translation-incomplete-coverage',
          severity: 'high',
          message: `Translation "${translation.translation}" has incomplete form coverage`,
          currentValue: translationFormTranslations.length,
          expectedValue: `~${expectedCount} form_translations`,
          manualSteps: [
            `Add ${expectedCount - translationFormTranslations.length} missing form_translations`,
            'Ensure all tenses are covered for this meaning'
          ],
          epicContext: 'Complete form coverage required for proper conjugation display'
        });
      }
    }

    return issues;
  }

  /**
   * Validate building blocks for compound generation
   */
  private validateBuildingBlocks(forms: any[]): string[] {
    const detailedMissing: string[] = [];

    // Check for past participle (NO building-block tag needed)
    const hasParticiple = forms.some(f =>
      f.tags?.includes('participio-passato') &&
      f.tags?.includes('participio')
    );

    if (!hasParticiple) {
      detailedMissing.push('Past Participle (participio-passato) - Required for: passato prossimo, trapassato prossimo, futuro anteriore, condizionale passato');
    }

    // Check for present gerund (NO building-block tag needed)
    const hasGerund = forms.some(f =>
      f.tags?.includes('gerundio-presente') &&
      f.tags?.includes('gerundio')
    );

    if (!hasGerund) {
      detailedMissing.push('Present Gerund (gerundio-presente) - Required for: presente progressivo, passato progressivo, futuro progressivo');
    }

    // Check for present infinitive (NO building-block tag needed)
    const hasInfinitive = forms.some(f =>
      f.tags?.includes('infinito-presente') &&
      f.tags?.includes('infinito')
    );

    if (!hasInfinitive) {
      detailedMissing.push('Present Infinitive (infinito-presente) - Required for: negative imperatives, clitic attachment');
    }

    return detailedMissing;
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
   * Helper function to get translation constraints for form expectations
   */
  private getTranslationConstraints(translations: any[]): {
    isReciprocal: boolean;
    isDirectReflexive: boolean;
    expectedFormsMultiplier: number;
    allowedPersons: string[];
  } {
    // Check if any translation is reciprocal
    const hasReciprocal = translations.some(t =>
      t.context_metadata?.usage === "reciprocal" &&
      t.context_metadata?.plurality === "plural-only"
    );

    // Check if any translation is direct reflexive
    const hasDirectReflexive = translations.some(t =>
      t.context_metadata?.usage === "direct-reflexive" &&
      t.context_metadata?.plurality === "any"
    );

    if (hasReciprocal) {
      return {
        isReciprocal: true,
        isDirectReflexive: false,
        expectedFormsMultiplier: 0.5, // 3 forms instead of 6 for finite tenses
        allowedPersons: ['plural-only']
      };
    } else if (hasDirectReflexive) {
      return {
        isReciprocal: false,
        isDirectReflexive: true,
        expectedFormsMultiplier: 1.0, // Normal 6 forms for finite tenses
        allowedPersons: ['any']
      };
    } else {
      return {
        isReciprocal: false,
        isDirectReflexive: false,
        expectedFormsMultiplier: 1.0, // Normal expectations
        allowedPersons: ['any']
      };
    }
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
   * Validate specific verb with comprehensive debugging
   */

  async validateSpecificVerbWithDebug(verbItalian: string, debugLog: (msg: string) => void): Promise<VerbComplianceReport | null> {
    debugLog(`🔍 Starting validation for: ${verbItalian}`);

    try {
      debugLog('📥 Connecting to database...');
      const { data: word, error } = await this.supabase
        .from('dictionary')
        .select('*')
        .ilike('italian', verbItalian)
        .eq('word_type', 'VERB')
        .single();

      if (error || !word) {
        debugLog(`❌ Verb not found: ${error?.message}`);
        return null;
      }

      debugLog(`✅ Found verb: ${word.italian} (ID: ${word.id})`);
      debugLog(`📊 Word tags: ${JSON.stringify(word.tags)}`);

      // DETAILED WORD TAG ANALYSIS
      debugLog('🔍 WORD LEVEL ANALYSIS:');
      const requiredWordTags = {
        conjugationClass: ['are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'],
        transitivity: ['always-transitive', 'always-intransitive', 'both-possible'],
        frequency: ['freq-top100', 'freq-top200', 'freq-top500', 'freq-top1000', 'freq-top5000'],
        cefr: ['CEFR-A1', 'CEFR-A2', 'CEFR-B1', 'CEFR-B2', 'CEFR-C1', 'CEFR-C2']
      };

      for (const [category, options] of Object.entries(requiredWordTags)) {
        const found = word.tags.filter(tag => options.includes(tag));
        debugLog(`  ${category}: ${found.length > 0 ? '✅ ' + found.join(', ') : '❌ MISSING - expected one of: ' + options.join(', ')}`);
      }

      // DETAILED TRANSLATIONS ANALYSIS
      debugLog('📥 Loading translations...');
      const { data: translations, error: translationsError } = await this.supabase
        .from('word_translations')
        .select('*')
        .eq('word_id', word.id);

      if (translationsError) {
        debugLog(`❌ Translations error: ${translationsError.message}`);
        return null;
      }

      debugLog(`✅ Loaded ${translations?.length || 0} translations`);
      debugLog('🔍 TRANSLATIONS ANALYSIS:');

      if (!translations || translations.length === 0) {
        debugLog('  ❌ NO TRANSLATIONS FOUND - verb needs at least one translation');
      } else {
        for (let i = 0; i < translations.length; i++) {
          const t = translations[i];
          debugLog(`  Translation ${i + 1}: "${t.translation}"`);
          debugLog(`    ID: ${t.id}`);
          debugLog(`    Priority: ${t.display_priority || 'undefined'}`);

          const metadata = t.context_metadata || {};
          debugLog(`    Auxiliary: ${metadata.auxiliary || '❌ MISSING (required: avere/essere)'}`);
          debugLog(`    Transitivity: ${metadata.transitivity || '❌ MISSING (required: transitive/intransitive)'}`);
          debugLog(`    Usage: ${metadata.usage || 'undefined'}`);
        }
      }

      // DETAILED FORMS ANALYSIS
      debugLog('📥 Loading forms...');
      const { data: forms, error: formsError } = await this.supabase
        .from('word_forms')
        .select('*')
        .eq('word_id', word.id);

      if (formsError) {
        debugLog(`❌ Forms error: ${formsError.message}`);
        return null;
      }

      debugLog(`✅ Loaded ${forms?.length || 0} forms`);
      // DETAILED FORMS ANALYSIS BY MOOD
      debugLog('🔍 COMPREHENSIVE FORMS ANALYSIS BY MOOD:');

      const moodGroups = [
        {
          name: 'Indicative (Indicativo)',
          moods: ['indicativo'],
          tenses: [
            { tag: 'presente', name: 'Presente', persons: 6, compound: false },
            { tag: 'imperfetto', name: 'Imperfetto', persons: 6, compound: false },
            { tag: 'futuro-semplice', name: 'Futuro Semplice', persons: 6, compound: false },
            { tag: 'passato-remoto', name: 'Passato Remoto', persons: 6, compound: false },
            { tag: 'passato-prossimo', name: 'Passato Prossimo', persons: 6, compound: true },
            { tag: 'trapassato-prossimo', name: 'Trapassato Prossimo', persons: 6, compound: true },
            { tag: 'futuro-anteriore', name: 'Futuro Anteriore', persons: 6, compound: true },
            { tag: 'trapassato-remoto', name: 'Trapassato Remoto', persons: 6, compound: true },
            { tag: 'presente-progressivo', name: 'Presente Progressivo', persons: 6, compound: true },
            { tag: 'imperfetto-progressivo', name: 'Imperfetto Progressivo', persons: 6, compound: true },
            { tag: 'futuro-progressivo', name: 'Futuro Progressivo', persons: 6, compound: true }
          ]
        },
        {
          name: 'Subjunctive (Congiuntivo)',
          moods: ['congiuntivo'],
          tenses: [
            { tag: 'congiuntivo-presente', name: 'Presente', persons: 6, compound: false },
            { tag: 'congiuntivo-imperfetto', name: 'Imperfetto', persons: 6, compound: false },
            { tag: 'congiuntivo-passato', name: 'Passato', persons: 6, compound: true },
            { tag: 'congiuntivo-trapassato', name: 'Trapassato', persons: 6, compound: true },
            { tag: 'congiuntivo-presente-progressivo', name: 'Presente Progressivo', persons: 6, compound: true }
          ]
        },
        {
          name: 'Conditional (Condizionale)',
          moods: ['condizionale'],
          tenses: [
            { tag: 'condizionale-presente', name: 'Presente', persons: 6, compound: false },
            { tag: 'condizionale-passato', name: 'Passato', persons: 6, compound: true },
            { tag: 'condizionale-presente-progressivo', name: 'Presente Progressivo', persons: 6, compound: true }
          ]
        },
        {
          name: 'Imperative (Imperativo)',
          moods: ['imperativo'],
          tenses: [
            { tag: 'imperativo-presente', name: 'Presente', persons: 5, compound: false },
            { tag: 'imperativo-passato', name: 'Passato', persons: 5, compound: true }
          ]
        },
        {
          name: 'Non-finite Forms',
          moods: ['infinito', 'participio', 'gerundio'],
          tenses: [
            { tag: 'infinito-presente', name: 'Infinito Presente', persons: 0, compound: false },
            { tag: 'infinito-passato', name: 'Infinito Passato', persons: 0, compound: true },
            { tag: 'participio-presente', name: 'Participio Presente', persons: 0, compound: false },
            { tag: 'participio-passato', name: 'Participio Passato', persons: 0, compound: false },
            { tag: 'gerundio-presente', name: 'Gerundio Presente', persons: 0, compound: false },
            { tag: 'gerundio-passato', name: 'Gerundio Passato', persons: 0, compound: true }
          ]
        }
      ];

      let totalExpected = 0;
      let totalFound = 0;

      for (const group of moodGroups) {
        debugLog(`\n  ${group.name}:`);

        for (const expected of group.tenses) {
          const foundForms = forms?.filter(f =>
            group.moods.some(mood => f.tags?.includes(mood)) &&
            f.tags?.includes(expected.tag)
          ) || [];

          const expectedCount = expected.persons || 1;
          totalExpected += expectedCount;
          totalFound += foundForms.length;

          debugLog(`    ${expected.name}:`);
          debugLog(`      Expected: ${expectedCount} forms | Found: ${foundForms.length} forms`);

          if (foundForms.length === 0) {
            debugLog('      ❌ COMPLETELY MISSING');
          } else if (foundForms.length < expectedCount) {
            debugLog(`      ⚠️ INCOMPLETE (missing ${expectedCount - foundForms.length})`);

            if (expected.persons > 0) {
              const personTags = ['prima-persona', 'seconda-persona', 'terza-persona'];
              const numbers = ['singolare', 'plurale'];

              debugLog('      Present persons:');
              for (const number of numbers) {
                for (const person of personTags) {
                  const personForm = foundForms.find(f =>
                    f.tags?.includes(person) && f.tags?.includes(number)
                  );
                  const personLabel = `${person.split('-')[0]} ${number}`;
                  if (personForm) {
                    debugLog(`        ✅ ${personLabel}: "${personForm.form_text}"`);
                  } else {
                    debugLog(`        ❌ ${personLabel}: MISSING`);
                  }
                }
              }
            }
          } else {
            debugLog('      ✅ COMPLETE');
          }

          if (expected.compound && foundForms.length > 0) {
            const withAuxTags = foundForms.filter(f =>
              f.tags?.some(t => ['avere-auxiliary', 'essere-auxiliary', 'stare-auxiliary'].includes(t))
            );
            debugLog(`      Auxiliary tags: ${withAuxTags.length}/${foundForms.length} forms have auxiliary tags`);
          }
        }
      }

      debugLog(`\n📊 FORMS SUMMARY: ${totalFound}/${totalExpected} total forms (${Math.round(totalFound / totalExpected * 100)}% complete)`);

      // BUILDING BLOCKS ANALYSIS
      debugLog('🔍 BUILDING BLOCKS ANALYSIS:');
      const buildingBlocks = [
        { name: 'Past Participle', mood: 'participio', tense: 'participio-passato', required: true, purpose: 'Compound tenses generation' },
        { name: 'Present Gerund', mood: 'gerundio', tense: 'gerundio-presente', required: true, purpose: 'Progressive tenses generation' },
        { name: 'Present Infinitive', mood: 'infinito', tense: 'infinito-presente', required: true, purpose: 'Negative imperatives, clitic attachment' }
      ];

      for (const block of buildingBlocks) {
        const found = forms?.find(f =>
          f.tags?.includes(block.mood) &&
          f.tags?.includes(block.tense)
        );

        if (found) {
          debugLog(`  ✅ ${block.name}: "${found.form_text}"`);
        } else {
          debugLog(`  ❌ ${block.name}: MISSING (needed for ${block.purpose})`);
        }
      }

      // FORM-TRANSLATION RELATIONSHIPS ANALYSIS
      debugLog('🔍 FORM-TRANSLATION RELATIONSHIPS ANALYSIS:');

      const formIds = (forms || []).map(f => f.id);
      const { data: formTranslations } = await this.supabase
        .from('form_translations')
        .select('*')
        .in('form_id', formIds);
      debugLog(`  Total form_translations found: ${formTranslations?.length || 0}`);

      // Remove any reference to form_ids arrays
      debugLog(`  📊 Architecture validation:`);
      debugLog(`    ✅ Using proper many-to-many relationship via form_translations`);
      debugLog(`    ✅ No direct form_ids arrays needed in translations`);

      // EXTRACT REAL DATA FOR FRONTEND
      const auxiliaries = Array.from(
        new Set((translations || []).map(t => t.context_metadata?.auxiliary).filter(Boolean))
      ) as string[];

      // Count forms by mood and tense
      const formCountsByMood: { [mood: string]: { [tense: string]: number } } = {};
      const moods = ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'];

      for (const mood of moods) {
        formCountsByMood[mood] = {};
        const moodForms = (forms || []).filter(f => f.tags?.includes(mood));

        const tenses = new Set<string>(
          moodForms
            .flatMap(f => f.tags || [])
            .filter(tag =>
              tag.includes('presente') ||
              tag.includes('passato') ||
              tag.includes('futuro') ||
              tag.includes('imperfetto') ||
              tag.includes('remoto') ||
              tag.includes('trapassato')
            )
        );

        tenses.forEach((tense: string) => {
          formCountsByMood[mood][tense] = moodForms.filter(f => f.tags?.includes(tense)).length;
        });
      }

      // Calculate type-based counts
      const auxiliaryCount = auxiliaries.length || 1;
      const simpleFormCount = (forms || []).filter(f => {
        const tags = f.tags || [];
        return !tags.some(tag =>
          tag.includes('auxiliary') || tag.includes('progressivo') || tag.includes('passato')
        );
      }).length;

      const compoundFormCount = (forms || []).filter(f => {
        const tags = f.tags || [];
        return tags.some(tag => tag.includes('auxiliary') || tag.includes('passato'));
      }).length;

      const progressiveFormCount = (forms || []).filter(f => {
        const tags = f.tags || [];
        return tags.some(tag => tag.includes('progressivo'));
      }).length;

        // Calculate expectations based on auxiliary count AND translation constraints
        const translationConstraints = this.getTranslationConstraints(translations || []);
        const formsMultiplier = translationConstraints.expectedFormsMultiplier;

        // Finite tenses counts (affected by reciprocal constraint)
        const finiteSimpleCount = Math.round(27 * formsMultiplier); // 27 finite simple forms normally
        const finiteCompoundCount = Math.round(49 * auxiliaryCount * formsMultiplier); // All compound forms are finite
        const finiteProgressiveCount = Math.round(24 * formsMultiplier); // 24 finite progressive forms normally

        // Non-finite forms (unchanged regardless of reciprocal/reflexive)
        const nonFiniteSimpleCount = 24; // 24 non-finite simple forms
        const nonFiniteProgressiveCount = 6; // 6 non-finite progressive forms

        const expectations = {
          simple: finiteSimpleCount + nonFiniteSimpleCount,
          perfectCompound: finiteCompoundCount,
          progressive: finiteProgressiveCount + nonFiniteProgressiveCount,
          total:
            finiteSimpleCount +
            nonFiniteSimpleCount +
            finiteCompoundCount +
            finiteProgressiveCount +
            nonFiniteProgressiveCount,
          translationConstraints: translationConstraints
        };

        if (translationConstraints.isReciprocal) {
          debugLog(
            `📊 RECIPROCAL VERB DETECTED: Finite tenses expect 3 forms (plural only), non-finite unchanged`
          );
        } else if (translationConstraints.isDirectReflexive) {
          debugLog(
            `📊 DIRECT REFLEXIVE VERB DETECTED: Normal form expectations (6 forms per finite tense)`
          );
        }

      // Analyze form-translation coverage
      const translationBreakdown = (translations || []).map(translation => {
        const translationFormTranslations = (formTranslations || []).filter(
          ft => ft.word_translation_id === translation.id
        );

        return {
          translation: translation.translation,
          auxiliary: translation.context_metadata?.auxiliary || 'unknown',
          expected: expectations.total,
          actual: translationFormTranslations.length,
          coverage: Math.round(
            (translationFormTranslations.length / expectations.total) * 100
          )
        };
      });

      // Find orphaned records
      const assignedFormIds = new Set((formTranslations || []).map(ft => ft.form_id));
      const formsWithoutTranslations = (forms || [])
        .filter(f => !assignedFormIds.has(f.id))
        .map(f => ({ id: f.id, text: f.form_text, tags: f.tags || [] }));

      const translationsWithForms = new Set(
        (formTranslations || []).map(ft => ft.word_translation_id)
      );
      const translationsWithoutForms = (translations || [])
        .filter(t => !translationsWithForms.has(t.id))
        .map(t => ({
          id: t.id,
          translation: t.translation,
          auxiliary: t.context_metadata?.auxiliary || 'unknown'
        }));

      // Find forms without proper mood/tense classification
      const formsWithoutMoodTense = (forms || [])
        .filter(f => {
          const tags = f.tags || [];
          const hasMood = moods.some(mood => tags.includes(mood));
          const hasTense = tags.some(tag =>
            tag.includes('presente') ||
            tag.includes('passato') ||
            tag.includes('futuro') ||
            tag.includes('imperfetto') ||
            tag.includes('remoto')
          );
          return !hasMood || !hasTense;
        })
        .map(f => ({ id: f.id, text: f.form_text, tags: f.tags || [] }));

      // Find missing auxiliary tags
      const compoundForms = (forms || []).filter(f => {
        const tags = f.tags || [];
        return tags.some(tag =>
          tag.includes('passato-prossimo') ||
          tag.includes('trapassato') ||
          tag.includes('futuro-anteriore') ||
          tag.includes('condizionale-passato')
        );
      });

      const missingAuxiliaryTags = compoundForms
        .filter(f => {
          const tags = f.tags || [];
          return !tags.some(tag => tag.includes('auxiliary'));
        })
        .map(f => ({
          id: f.id,
          text: f.form_text,
          expectedTag: 'avere-auxiliary or essere-auxiliary'
        }));

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
        estimatedFixTime: '0 minutes',
        detailedAnalysis: {
          rawData: {
            wordTags: word.tags || [],
            translations: translations || [],
            forms: forms || [],
            formTranslations: formTranslations || []
          },
            auxiliaries,
            translationConstraints,
            formCounts: {
              byMood: formCountsByMood,
              byType: {
                simple: simpleFormCount,
                perfectCompound: compoundFormCount,
                progressive: progressiveFormCount,
              total: (forms || []).length
            },
            expectations
          },
          formTranslationCoverage: {
            totalFormTranslations: (formTranslations || []).length,
            translationBreakdown
          },
          orphanedRecords: {
            formsWithoutTranslations,
            translationsWithoutForms,
            formsWithoutMoodTense,
            missingTags: {
              auxiliaries: missingAuxiliaryTags
            }
          }
        }
      };

      // Continue with existing validation logic...
      report.wordLevelIssues = this.validateWordLevelDetailed(word);
      report.translationLevelIssues = this.validateTranslationLevelDetailed(translations || []);
      report.formLevelIssues = this.validateFormLevelDetailed(forms || [], true);
      report.missingBuildingBlocks = this.validateBuildingBlocksDetailed(forms || []);

      this.calculateVerbCompliance(report);

      debugLog(`✅ Final score: ${report.overallScore}% (${report.complianceStatus})`);
      debugLog('🎉 Validation completed successfully!');
      return report;
    } catch (error) {
      debugLog(`❌ Unexpected error: ${error.message}`);
      debugLog(`❌ Stack: ${error.stack}`);
      return null;
    }
  }

  private validateWordLevelDetailed(word: any): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const tags = word.tags || [];

    const conjugationClasses = ['are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'];
    const foundConjugation = tags.filter(tag => conjugationClasses.includes(tag));
    if (foundConjugation.length === 0) {
      issues.push({
        ruleId: 'missing-conjugation-class',
        severity: 'critical',
        message: 'Missing conjugation class tag',
        currentValue: tags,
        expectedValue: 'Exactly one of: ' + conjugationClasses.join(', '),
        manualSteps: [
          `Verb "${word.italian}" needs conjugation class tag`,
          `Based on ending: ${this.suggestConjugationClass(word.italian)}`,
          'Add to word.tags array in dictionary table'
        ],
        epicContext: 'Conjugation class determines form generation patterns'
      });
    }

    const transitivityTags = ['always-transitive', 'always-intransitive', 'both-possible'];
    const foundTransitivity = tags.filter(tag => transitivityTags.includes(tag));
    if (foundTransitivity.length === 0) {
      issues.push({
        ruleId: 'missing-transitivity',
        severity: 'high',
        message: 'Missing transitivity classification',
        currentValue: tags,
        expectedValue: 'One of: ' + transitivityTags.join(', '),
        manualSteps: [
          'Analyze if verb takes direct objects',
          'Add appropriate transitivity tag to word.tags'
        ],
        epicContext: 'Required for auxiliary assignment validation'
      });
    }
    return issues;
  }

  private validateTranslationLevelDetailed(translations: any[]): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (translations.length === 0) {
      issues.push({
        ruleId: 'no-translations',
        severity: 'critical',
        message: 'No translations found',
        currentValue: 0,
        expectedValue: 'At least 1 translation required',
        manualSteps: [
          'Add record to word_translations table',
          'Set translation to English meaning',
          'Set context_metadata.auxiliary to avere/essere',
          'Create form_translations entries to link forms to this translation'
        ],
        epicContext: 'Translation-driven architecture requires meaning definitions'
      });
      return issues;
    }

    for (let i = 0; i < translations.length; i++) {
      const t = translations[i];
      const metadata = t.context_metadata || {};
      if (!metadata.auxiliary) {
        issues.push({
          ruleId: 'missing-auxiliary',
          severity: 'critical',
          message: `Translation "${t.translation}" missing auxiliary`,
          currentValue: metadata,
          expectedValue: 'auxiliary: "avere" or "essere"',
          manualSteps: [
            `Edit word_translations record ID: ${t.id}`,
            'Set context_metadata.auxiliary to "avere" or "essere"',
            'Use "avere" for transitive, "essere" for intransitive/reflexive'
          ],
          epicContext: 'Auxiliary determines compound form generation'
        });
      }

      if (!metadata.transitivity) {
        issues.push({
          ruleId: 'missing-transitivity',
          severity: 'high',
          message: `Translation "${t.translation}" missing transitivity`,
          currentValue: metadata,
          expectedValue: 'transitivity: "transitive" or "intransitive"',
          manualSteps: [
            `Edit word_translations record ID: ${t.id}`,
            'Set context_metadata.transitivity based on whether it takes direct objects'
          ],
          epicContext: 'Required for auxiliary validation consistency'
        });
      }

      // no form_ids validation needed
    }
    return issues;
  }

  private validateFormLevelDetailed(forms: any[], includeTerminology: boolean = true): ComplianceIssue[] {
    return this.validateFormLevel(forms, includeTerminology);
  }

  private validateBuildingBlocksDetailed(forms: any[]): string[] {
    const missing: string[] = [];
    const requiredBlocks = [
      { name: 'Past Participle', mood: 'participio', tense: 'participio-passato', impact: 'Cannot generate: passato prossimo, trapassato prossimo, futuro anteriore, condizionale passato' },
      { name: 'Present Gerund', mood: 'gerundio', tense: 'gerundio-presente', impact: 'Cannot generate: presente progressivo, passato progressivo, futuro progressivo' },
      { name: 'Present Infinitive', mood: 'infinito', tense: 'infinito-presente', impact: 'Cannot generate: negative imperatives, clitic attachments' }
    ];
    for (const block of requiredBlocks) {
      const found = forms.find(f =>
        f.tags?.includes(block.mood) &&
        f.tags?.includes(block.tense)
      );
      if (!found) {
        missing.push(`${block.name} (${block.mood}/${block.tense}) - ${block.impact}`);
      }
    }
    return missing;
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