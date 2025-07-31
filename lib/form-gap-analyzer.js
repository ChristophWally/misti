// lib/form-gap-analyzer.js
// REBUILT: EPIC 002 Compliant Form Gap Analysis System
// Comprehensive cross-table analysis with static auxiliary patterns

import { 
  AUXILIARY_PATTERNS, 
  getAuxiliaryPattern, 
  isCompoundTense,
  getAvailableCompoundTenses 
} from './auxPatterns'

export class FormGapAnalyzer {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.analysisResults = {
      totalVerbs: 0,
      analyzedVerbs: 0,
      epicAlignmentIssues: [],
      missingEpicForms: [],
      deprecatedForms: [],
      highPriorityGaps: [],
      tagInconsistencies: [],
      crossTableIssues: [],
      summary: {}
    };

    // EPIC 002 Required Form Categories (26 distinct categories)
    this.epicRequiredForms = {
      // Simple Tenses (Stored in Database) - Core 8 categories
      'simple-present': {
        mood: 'indicativo',
        tense: 'presente',
        type: 'simple',
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
        required: true,
        priority: 'critical',
        description: 'Present indicative - foundation tense'
      },
      'simple-imperfect': {
        mood: 'indicativo', 
        tense: 'imperfetto',
        type: 'simple',
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
        required: true,
        priority: 'high',
        description: 'Imperfect indicative - essential past description'
      },
      'simple-future': {
        mood: 'indicativo',
        tense: 'futuro-semplice', 
        type: 'simple',
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
        required: true,
        priority: 'high',
        description: 'Future simple - essential future expression'
      },
      'simple-past-remote': {
        mood: 'indicativo',
        tense: 'passato-remoto',
        type: 'simple', 
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
        required: true,
        priority: 'medium',
        description: 'Past remote - literary and formal past'
      },
      'subjunctive-present': {
        mood: 'congiuntivo',
        tense: 'congiuntivo-presente',
        type: 'simple',
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
        required: true,
        priority: 'high',
        description: 'Present subjunctive - essential for complex expression'
      },
      'subjunctive-imperfect': {
        mood: 'congiuntivo',
        tense: 'congiuntivo-imperfetto', 
        type: 'simple',
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
        required: true,
        priority: 'medium',
        description: 'Imperfect subjunctive - hypothetical expressions'
      },
      'conditional-present': {
        mood: 'condizionale',
        tense: 'condizionale-presente',
        type: 'simple',
        persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'], 
        required: true,
        priority: 'high',
        description: 'Present conditional - polite requests and hypotheticals'
      },
      'imperative-present': {
        mood: 'imperativo',
        tense: 'imperativo-presente',
        type: 'simple',
        persons: ['tu', 'lui', 'noi', 'voi', 'loro'], // No io in imperative
        required: true,
        priority: 'medium',
        description: 'Imperative - commands and instructions'
      },

      // Building Blocks (Essential for Compound Generation) - 4 categories
      'infinitive-present': {
        mood: 'infinito',
        tense: 'infinito-presente',
        type: 'simple',
        persons: [],
        required: true,
        priority: 'critical',
        description: 'Present infinitive - base form for clitic attachment'
      },
      'gerund-present': {
        mood: 'gerundio', 
        tense: 'gerundio-presente',
        type: 'simple',
        persons: [],
        required: true,
        priority: 'critical',
        description: 'Present gerund - essential for progressive tenses'
      },
      'participle-past': {
        mood: 'participio',
        tense: 'participio-passato',
        type: 'simple', 
        persons: [],
        required: true,
        priority: 'critical',
        description: 'Past participle - essential for all compound tenses'
      },
      'participle-present': {
        mood: 'participio',
        tense: 'participio-presente',
        type: 'simple',
        persons: [],
        required: false,
        priority: 'low',
        description: 'Present participle - adjectival uses'
      }
    };

    // Compound forms that should be GENERATED, not stored (14 categories from EPIC)
    this.shouldBeGenerated = [
      'passato-prossimo',
      'trapassato-prossimo', 
      'futuro-anteriore',
      'trapassato-remoto',
      'congiuntivo-passato',
      'congiuntivo-trapassato',
      'condizionale-passato',
      'presente-progressivo',
      'passato-progressivo', 
      'futuro-progressivo',
      'congiuntivo-presente-progressivo',
      'condizionale-presente-progressivo',
      'infinito-passato',
      'gerundio-passato'
    ];

    // Forms that should NOT exist according to EPIC (deprecated)
    this.deprecatedFormPatterns = [
      'imperativo-negativo', // Removed in EPIC - negative imperatives use different construction
      'imperative-negative', // Alternative naming
      'neg-imperative',      // Alternative naming
    ];

    console.log('🔧 FormGapAnalyzer initialized with EPIC 002 specifications');
    console.log(`📊 Tracking ${Object.keys(this.epicRequiredForms).length} required form categories`);
    console.log(`🚫 Checking for ${this.deprecatedFormPatterns.length} deprecated patterns`);
    console.log(`⚡ Using ${AUXILIARY_PATTERNS.length} static auxiliary patterns`);
  }

  /**
   * Main analysis function - EPIC alignment analysis with cross-table validation
   */
  async runCompleteAnalysis(options = {}) {
    const {
      limitToHighPriority = true,
      checkDeprecatedForms = true,
      maxVerbs = 50,
      includeCrossTableAnalysis = true
    } = options;

    console.log('🔍 Starting EPIC-Aligned FormGapAnalyzer');
    
    try {
      // Step 1: Load verbs to analyze
      const verbs = await this.loadVerbsForAnalysis(limitToHighPriority, maxVerbs);
      this.analysisResults.totalVerbs = verbs.length;
      
      console.log(`📊 Analyzing ${verbs.length} verbs against EPIC specifications...`);

      if (verbs.length === 0) {
        console.warn('⚠️ No verbs found matching criteria. Check your tag filters.');
        this.generateSummary();
        return this.analysisResults;
      }

      // Step 2: Analyze each verb against EPIC requirements
      for (let i = 0; i < verbs.length; i++) {
        const verb = verbs[i];
        console.log(`🔍 Analyzing ${i + 1}/${verbs.length}: ${verb.italian}`);
        
        await this.analyzeVerbAgainstEpic(verb, checkDeprecatedForms, includeCrossTableAnalysis);
        this.analysisResults.analyzedVerbs++;
      }

      // Step 3: Generate summary statistics
      this.generateSummary();

      console.log('✅ EPIC alignment analysis complete!');
      return this.analysisResults;

    } catch (error) {
      console.error('❌ EPIC analysis failed:', error);
      throw error;
    }
  }

  /**
   * Load verbs for analysis with proper priority filtering
   */
  async loadVerbsForAnalysis(limitToHighPriority = true, maxVerbs = 50) {
    console.log('📥 Loading verbs for analysis...');
    
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

    // Filter to high-priority verbs using correct tag format
    if (limitToHighPriority) {
      console.log('⭐ Filtering to high-priority verbs...');
      query = query.or(
        'tags.cs.{"freq-top100"},tags.cs.{"freq-top200"},tags.cs.{"freq-top500"},tags.cs.{"CEFR-A1"},tags.cs.{"CEFR-A2"},tags.cs.{"CEFR-B1"}'
      );
    }

    const { data: verbs, error } = await query
      .order('italian')
      .limit(maxVerbs);

    if (error) {
      console.error('❌ Error loading verbs:', error);
      throw error;
    }

    console.log(`✅ Loaded ${verbs?.length || 0} verbs for analysis`);
    
    if (limitToHighPriority && (!verbs || verbs.length === 0)) {
      console.warn('⚠️ No high-priority verbs found. Your verbs may use different tag formats.');
      console.log('💡 Retrying without priority filter...');
      
      // Retry without priority filter
      const { data: allVerbs, error: allError } = await this.supabase
        .from('dictionary')
        .select(`id, italian, word_type, tags, created_at`)
        .eq('word_type', 'VERB')
        .order('italian')
        .limit(maxVerbs);

      if (allError) throw allError;
      console.log(`📊 Found ${allVerbs?.length || 0} total verbs`);
      return allVerbs || [];
    }

    return verbs || [];
  }

  /**
   * Comprehensive verb analysis against EPIC 002 specifications
   */
  async analyzeVerbAgainstEpic(verb, checkDeprecated = true, includeCrossTable = true) {
    console.log(`🔍 EPIC Analysis: ${verb.italian}`);

    try {
      // Step 1: Load all related data for comprehensive analysis
      const verbData = await this.loadCompleteVerbData(verb.id);
      
      console.log(`📊 ${verb.italian}: Loaded ${verbData.forms?.length || 0} forms, ${verbData.translations?.length || 0} translations`);

      // Step 2: Check missing EPIC required forms
      const missingEpicForms = this.checkMissingEpicForms(verb, verbData.forms);
      if (missingEpicForms.length > 0) {
        console.log(`⚠️ ${verb.italian}: Found ${missingEpicForms.length} missing EPIC forms`);
        this.analysisResults.missingEpicForms.push({
          verb,
          missingForms: missingEpicForms
        });
      }

      // Step 3: Check for deprecated forms
      if (checkDeprecated) {
        const deprecatedForms = this.checkDeprecatedForms(verb, verbData.forms);
        if (deprecatedForms.length > 0) {
          console.log(`🗑️ ${verb.italian}: Found ${deprecatedForms.length} deprecated forms`);
          this.analysisResults.deprecatedForms.push({
            verb,
            deprecatedForms: deprecatedForms
          });
        }
      }

      // Step 4: Check stored compound forms that should be generated
      const incorrectlyStoredCompounds = this.checkIncorrectlyStoredCompounds(verb, verbData.forms);
      if (incorrectlyStoredCompounds.length > 0) {
        console.log(`🔄 ${verb.italian}: Found ${incorrectlyStoredCompounds.length} incorrectly stored compounds`);
        this.analysisResults.epicAlignmentIssues.push({
          verb,
          issue: 'stored-compounds',
          description: 'Has stored compound forms that should be generated dynamically',
          forms: incorrectlyStoredCompounds,
          priority: 'medium'
        });
      }

      // Step 5: Check for missing building blocks (critical for compound generation)
      const missingBuildingBlocks = this.checkEpicBuildingBlocks(verb, verbData.forms);
      if (missingBuildingBlocks.length > 0) {
        console.log(`🧱 ${verb.italian}: Found ${missingBuildingBlocks.length} missing building blocks`);
        this.analysisResults.epicAlignmentIssues.push({
          verb,
          issue: 'missing-building-blocks',
          description: 'Missing critical building blocks for compound form generation',
          forms: missingBuildingBlocks,
          priority: 'critical'
        });
      }

      // Step 6: Cross-table analysis (if requested)
      if (includeCrossTable) {
        const crossTableIssues = await this.analyzeCrossTableConsistency(verb, verbData);
        if (crossTableIssues.length > 0) {
          console.log(`🔗 ${verb.italian}: Found ${crossTableIssues.length} cross-table issues`);
          this.analysisResults.crossTableIssues.push({
            verb,
            issues: crossTableIssues
          });
        }
      }

      // Step 7: Check if this is a high priority verb with significant issues
      const isHighPriority = this.isHighPriorityVerb(verb);
      const hasSignificantIssues = missingEpicForms.length > 2 || missingBuildingBlocks.length > 0;
      
      if (isHighPriority && hasSignificantIssues) {
        this.analysisResults.highPriorityGaps.push({
          verb,
          missingEpicForms,
          missingBuildingBlocks,
          priorityReason: this.getPriorityReason(verb)
        });
      }

    } catch (error) {
      console.error(`❌ Error in EPIC analysis for ${verb.italian}:`, error);
      // Continue with other verbs even if one fails
    }
  }

  /**
   * Load complete verb data for cross-table analysis
   */
  async loadCompleteVerbData(wordId) {
    console.log(`📥 Loading complete data for word ID: ${wordId}`);

    try {
      // Load forms
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

      if (formsError) {
        console.error('❌ Error loading forms:', formsError);
        throw formsError;
      }

      // Load translations
      const { data: translations, error: transError } = await this.supabase
        .from('word_translations')
        .select(`
          id,
          translation,
          display_priority,
          context_metadata,
          usage_notes,
          frequency_estimate
        `)
        .eq('word_id', wordId);

      if (transError) {
        console.error('❌ Error loading translations:', transError);
        throw transError;
      }

      // Load form-translation assignments
      const { data: assignments, error: assignError } = await this.supabase
        .from('form_translations')
        .select(`
          id,
          form_id,
          word_translation_id,
          translation,
          assignment_method,
          confidence_score
        `)
        .in('form_id', (forms || []).map(f => f.id));

      if (assignError) {
        console.error('❌ Error loading form assignments:', assignError);
        // Don't throw - assignments might not exist yet
      }

      return {
        forms: forms || [],
        translations: translations || [],
        assignments: assignments || []
      };

    } catch (error) {
      console.error(`❌ Error loading complete verb data:`, error);
      return { forms: [], translations: [], assignments: [] };
    }
  }

  /**
   * Check for missing forms according to EPIC specifications
   */
  checkMissingEpicForms(verb, forms) {
    const missing = [];
    const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');

    console.log(`🔍 Checking EPIC forms for ${verb.italian}: ${conjugationForms.length} conjugation forms found`);

    for (const [formKey, spec] of Object.entries(this.epicRequiredForms)) {
      if (!spec.required) continue;

      if (spec.persons.length === 0) {
        // Non-finite forms (infinitive, gerund, participle)
        const hasForm = conjugationForms.some(f => 
          f.tags?.includes(spec.mood) &&
          f.tags?.includes(spec.tense) &&
          f.tags?.includes('simple') &&
          !this.hasPersonTags(f.tags)
        );

        if (!hasForm) {
          // Predict the expected form text
          let expectedFormText = verb.italian; // Default for infinitive
          if (spec.mood === 'participio' && spec.tense === 'participio-passato') {
            expectedFormText = this.predictPastParticiple(verb.italian, verb.tags);
          } else if (spec.mood === 'gerundio' && spec.tense === 'gerundio-presente') {
            expectedFormText = this.predictPresentGerund(verb.italian, verb.tags);
          }

          missing.push({
            category: formKey,
            description: `Missing ${spec.mood} ${spec.tense} form: "${expectedFormText}"`,
            expectedFormText: expectedFormText,
            mood: spec.mood,
            tense: spec.tense,
            requiredTags: [spec.mood, spec.tense, 'simple'],
            actionRequired: `Create form in word_forms table:\n  - form_text: "${expectedFormText}"\n  - tags: ["${spec.mood}", "${spec.tense}", "simple"]\n  - form_type: "conjugation"`,
            priority: spec.priority,
            impact: this.getFormImpact(formKey),
            epicDescription: spec.description
          });
        }
      } else {
        // Finite forms with persons
        const missingPersons = [];
        
        for (const person of spec.persons) {
          const hasPersonForm = conjugationForms.some(f =>
            f.tags?.includes(spec.mood) &&
            f.tags?.includes(spec.tense) &&
            f.tags?.includes(person) &&
            f.tags?.includes('simple')
          );

          if (!hasPersonForm) {
            missingPersons.push(person);
          }
        }

        if (missingPersons.length > 0) {
          missing.push({
            category: formKey,
            description: `${spec.mood} ${spec.tense}: missing ${missingPersons.length} forms`,
            mood: spec.mood,
            tense: spec.tense,
            missingPersons,
            missingFormsDetails: missingPersons.map(person => ({
              person,
              expectedFormText: this.predictPersonForm(verb.italian, verb.tags, spec.mood, spec.tense, person),
              requiredTags: [spec.mood, spec.tense, 'simple', person]
            })),
            actionRequired: `Create ${missingPersons.length} forms in word_forms table for persons: [${missingPersons.join(', ')}]`,
            priority: spec.priority,
            impact: this.getFormImpact(formKey),
            epicDescription: spec.description
          });
        }
      }
    }

    return missing;
  }

  /**
   * Check for deprecated forms that should be removed
   */
  checkDeprecatedForms(verb, forms) {
    const deprecated = [];
    const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');
    
    console.log(`🗑️ Checking ${conjugationForms.length} forms for deprecated patterns`);

    for (const form of conjugationForms) {
      if (!form.tags || !Array.isArray(form.tags)) continue;
      
      // Check for deprecated tense tags
      const foundDeprecatedTags = form.tags.filter(tag => 
        this.deprecatedFormPatterns.includes(tag)
      );

      if (foundDeprecatedTags.length > 0) {
        console.log(`🗑️ Found deprecated form: "${form.form_text}" with tags: [${foundDeprecatedTags.join(', ')}]`);
        
        deprecated.push({
          formId: form.id,
          formText: form.form_text,
          deprecatedTags: foundDeprecatedTags,
          recommendation: 'Remove - deprecated in EPIC 002',
          priority: 'medium'
        });
      }
    }

    return deprecated;
  }

  /**
   * Check for compound forms that are stored but should be generated
   */
  checkIncorrectlyStoredCompounds(verb, forms) {
    const incorrectlyStored = [];
    const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');

    for (const form of conjugationForms) {
      if (!form.tags || !Array.isArray(form.tags)) continue;

      const hasCompoundTenseTags = this.shouldBeGenerated.some(compoundTense =>
        form.tags.includes(compoundTense)
      );

      if (hasCompoundTenseTags && !form.tags.includes('generated')) {
        incorrectlyStored.push({
          formId: form.id,
          formText: form.form_text,
          compoundTense: form.tags.find(tag => this.shouldBeGenerated.includes(tag)),
          recommendation: 'Should be generated dynamically, not stored',
          priority: 'low'
        });
      }
    }

    return incorrectlyStored;
  }

  /**
   * Check for missing building blocks (EPIC critical requirements)
   */
  checkEpicBuildingBlocks(verb, forms) {
    const missing = [];
    const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');

    console.log(`🧱 Checking building blocks for ${verb.italian}: ${conjugationForms.length} forms`);

    // Past Participle (critical for all compound tenses)
    const hasParticiple = conjugationForms.some(f => 
      f.tags?.includes('participio-passato') && 
      f.tags?.includes('simple') &&
      !this.hasPersonTags(f.tags || [])
    );

    if (!hasParticiple) {
      const predictedParticiple = this.predictPastParticiple(verb.italian, verb.tags);
      missing.push({
        type: 'participio-passato',
        description: `Missing past participle form: "${predictedParticiple}"`,
        expectedFormText: predictedParticiple,
        requiredTags: ['participio', 'participio-passato', 'simple'],
        actionRequired: `Create form in word_forms table:\n  - form_text: "${predictedParticiple}"\n  - tags: ["participio", "participio-passato", "simple"]\n  - form_type: "conjugation"`,
        impact: 'Cannot generate compound tenses: passato prossimo, trapassato prossimo, futuro anteriore, etc.',
        priority: 'critical'
      });
    }

    // Present Gerund (critical for progressive tenses)
    const hasGerund = conjugationForms.some(f => 
      f.tags?.includes('gerundio-presente') && 
      f.tags?.includes('simple') &&
      !this.hasPersonTags(f.tags || [])
    );

    if (!hasGerund) {
      const predictedGerund = this.predictPresentGerund(verb.italian, verb.tags);
      missing.push({
        type: 'gerundio-presente',
        description: `Missing present gerund form: "${predictedGerund}"`,
        expectedFormText: predictedGerund,
        requiredTags: ['gerundio', 'gerundio-presente', 'simple'],
        actionRequired: `Create form in word_forms table:\n  - form_text: "${predictedGerund}"\n  - tags: ["gerundio", "gerundio-presente", "simple"]\n  - form_type: "conjugation"`,
        impact: 'Cannot generate progressive tenses: presente progressivo, passato progressivo, futuro progressivo, etc.',
        priority: 'critical'
      });
    }

    // Present Infinitive (needed for clitic attachment)
    const hasInfinitive = conjugationForms.some(f => 
      f.tags?.includes('infinito-presente') && 
      f.tags?.includes('simple')
    );

    if (!hasInfinitive) {
      missing.push({
        type: 'infinito-presente',
        description: `Missing present infinitive form: "${verb.italian}"`,
        expectedFormText: verb.italian,
        requiredTags: ['infinito', 'infinito-presente', 'simple'],
        actionRequired: `Create form in word_forms table:\n  - form_text: "${verb.italian}"\n  - tags: ["infinito", "infinito-presente", "simple"]\n  - form_type: "conjugation"`,
        impact: 'Cannot generate negative imperatives (non parlare!) and clitic attachment forms',
        priority: 'high'
      });
    }

    return missing;
  }

  /**
   * Analyze cross-table consistency (comprehensive data integrity check)
   */
  async analyzeCrossTableConsistency(verb, verbData) {
    const issues = [];

    console.log(`🔗 Cross-table analysis for ${verb.italian}`);

    try {
      // Check 1: Word-level tags vs translation metadata consistency
      const wordAuxiliaryTags = (verb.tags || []).filter(tag => 
        tag.includes('auxiliary') || tag.includes('avere') || tag.includes('essere')
      );

      const translationAuxiliaries = (verbData.translations || [])
        .map(t => t.context_metadata?.auxiliary)
        .filter(Boolean);

      if (wordAuxiliaryTags.length > 0 && translationAuxiliaries.length > 0) {
        // Check consistency between word tags and translation auxiliary assignments
        const hasConsistency = this.checkAuxiliaryConsistency(wordAuxiliaryTags, translationAuxiliaries);
        if (!hasConsistency) {
          issues.push({
            type: 'auxiliary-inconsistency',
            description: 'Word-level auxiliary tags don\'t match translation auxiliary assignments',
            priority: 'medium',
            wordTags: wordAuxiliaryTags,
            translationAuxiliaries: translationAuxiliaries
          });
        }
      }

      // Check 2: Form-translation assignment coverage
      const formsWithoutAssignments = (verbData.forms || []).filter(form => {
        const hasAssignment = (verbData.assignments || []).some(a => a.form_id === form.id);
        return !hasAssignment && form.form_type === 'conjugation';
      });

      if (formsWithoutAssignments.length > 0) {
        issues.push({
          type: 'missing-form-assignments',
          description: `${formsWithoutAssignments.length} forms lack English translation assignments`,
          priority: 'low',
          affectedForms: formsWithoutAssignments.slice(0, 5).map(f => f.form_text)
        });
      }

      // Check 3: Translation priority gaps
      const priorities = (verbData.translations || [])
        .map(t => t.display_priority)
        .filter(p => p != null)
        .sort((a, b) => a - b);

      if (priorities.length > 0 && priorities[0] !== 1) {
        issues.push({
          type: 'no-primary-translation',
          description: 'No translation marked as primary (display_priority = 1)',
          priority: 'medium',
          currentPriorities: priorities
        });
      }

      return issues;

    } catch (error) {
      console.error(`❌ Cross-table analysis error for ${verb.italian}:`, error);
      return [{
        type: 'analysis-error',
        description: `Failed to complete cross-table analysis: ${error.message}`,
        priority: 'low'
      }];
    }
  }

  /**
   * Check auxiliary consistency between word tags and translation metadata
   */
  checkAuxiliaryConsistency(wordTags, translationAuxiliaries) {
    // Simple consistency check - this could be more sophisticated
    const wordHasAvere = wordTags.some(tag => tag.includes('avere'));
    const wordHasEssere = wordTags.some(tag => tag.includes('essere'));
    
    const transHasAvere = translationAuxiliaries.includes('avere');
    const transHasEssere = translationAuxiliaries.includes('essere');

    // Allow for flexibility - word can be both if translations differ
    return (wordHasAvere && transHasAvere) || (wordHasEssere && transHasEssere);
  }

  /**
   * Get impact description for missing forms
   */
  getFormImpact(formKey) {
    const impacts = {
      'simple-present': 'Students cannot learn basic present tense',
      'simple-imperfect': 'Missing essential past tense for descriptions',
      'simple-future': 'Cannot teach future plans and intentions',
      'simple-past-remote': 'Missing historical/literary past tense',
      'subjunctive-present': 'Cannot teach doubt, desire, emotion expressions',
      'subjunctive-imperfect': 'Missing hypothetical and formal expressions',
      'conditional-present': 'Cannot teach polite requests and hypotheticals',
      'imperative-present': 'Missing command forms for instructions',
      'infinitive-present': 'Missing base form for references and clitic attachment',
      'gerund-present': 'Cannot generate progressive tenses (ongoing actions)',
      'participle-past': 'Cannot generate any compound tenses (perfect forms)',
      'participle-present': 'Missing adjectival and descriptive uses'
    };

    return impacts[formKey] || 'Pedagogical completeness affected';
  }

  /**
   * Generate comprehensive summary with EPIC-specific recommendations
   */
  generateSummary() {
    const summary = {
      totalIssues: this.analysisResults.missingEpicForms.length + 
                   this.analysisResults.deprecatedForms.length + 
                   this.analysisResults.epicAlignmentIssues.length +
                   this.analysisResults.crossTableIssues.length,
      
      criticalIssues: this.analysisResults.epicAlignmentIssues.filter(
        issue => issue.priority === 'critical'
      ).length,
      
      highPriorityVerbs: this.analysisResults.highPriorityGaps.length,
      
      verbsNeedingAttention: new Set([
        ...this.analysisResults.missingEpicForms.map(item => item.verb.id),
        ...this.analysisResults.deprecatedForms.map(item => item.verb.id),
        ...this.analysisResults.epicAlignmentIssues.map(item => item.verb.id),
        ...this.analysisResults.highPriorityGaps.map(item => item.verb.id),
        ...this.analysisResults.crossTableIssues.map(item => item.verb.id)
      ]).size,

      deprecatedFormsCount: this.analysisResults.deprecatedForms.reduce(
        (sum, item) => sum + item.deprecatedForms.length, 0
      ),

      crossTableIssuesCount: this.analysisResults.crossTableIssues.reduce(
        (sum, item) => sum + item.issues.length, 0
      ),

      epicAlignmentScore: this.calculateEpicAlignmentScore(),
      
      recommendedActions: this.generateEpicRecommendedActions()
    };

    this.analysisResults.summary = summary;
  }

  /**
   * Calculate EPIC alignment score (0-100%)
   */
  calculateEpicAlignmentScore() {
    if (this.analysisResults.analyzedVerbs === 0) return 0;

    const totalPossibleIssues = this.analysisResults.analyzedVerbs * 10; // Estimated max issues per verb
    const actualIssues = this.analysisResults.summary?.totalIssues || 0;
    
    return Math.max(0, Math.round(((totalPossibleIssues - actualIssues) / totalPossibleIssues) * 100));
  }

  /**
   * Generate EPIC-specific recommended actions
   */
  generateEpicRecommendedActions() {
    const actions = [];

    // Critical building blocks
    const criticalIssues = this.analysisResults.epicAlignmentIssues.filter(
      issue => issue.priority === 'critical'
    );
    
    if (criticalIssues.length > 0) {
      actions.push({
        priority: 'CRITICAL',
        action: 'Create missing building blocks immediately',
        description: `${criticalIssues.length} verbs missing past participles or gerunds`,
        impact: 'New conjugation system cannot generate compound tenses',
        epicAlignment: 'Blocks Phase 2 implementation'
      });
    }

    // Deprecated forms cleanup
    if (this.analysisResults.deprecatedForms.length > 0) {
      const deprecatedCount = this.analysisResults.deprecatedForms.reduce(
        (sum, item) => sum + item.deprecatedForms.length, 0
      );
      
      actions.push({
        priority: 'HIGH',
        action: 'Remove deprecated forms',
        description: `${deprecatedCount} deprecated forms found (e.g., imperativo-negativo)`,
        impact: 'Clean database before new system deployment',
        epicAlignment: 'Required for EPIC consistency'
      });
    }

    // Missing EPIC forms
    if (this.analysisResults.missingEpicForms.length > 0) {
      actions.push({
        priority: 'HIGH', 
        action: 'Complete EPIC-required form sets',
        description: `${this.analysisResults.missingEpicForms.length} verbs missing required forms`,
        impact: 'Incomplete conjugation learning experience',
        epicAlignment: 'Essential for 26-category completeness'
      });
    }

    // Cross-table issues
    if (this.analysisResults.crossTableIssues.length > 0) {
      actions.push({
        priority: 'MEDIUM',
        action: 'Fix cross-table data consistency',
        description: `${this.analysisResults.summary?.crossTableIssuesCount || 0} data consistency issues found`,
        impact: 'Translation system may not work correctly',
        epicAlignment: 'Required for proper form-translation assignment'
      });
    }

    return actions;
  }

  /**
   * Predict past participle based on Italian morphological rules
   */
  predictPastParticiple(verbItalian, verbTags = []) {
    // Handle irregular verbs first (from EPIC documentation)
    const irregularParticiples = {
      'essere': 'stato',
      'avere': 'avuto', 
      'fare': 'fatto',
      'dire': 'detto',
      'stare': 'stato',
      'dare': 'dato',
      'andare': 'andato',
      'venire': 'venuto',
      'vedere': 'visto',
      'sapere': 'saputo',
      'potere': 'potuto',
      'dovere': 'dovuto',
      'volere': 'voluto',
      'bere': 'bevuto',
      'tenere': 'tenuto',
      'rimanere': 'rimasto',
      'morire': 'morto',
      'nascere': 'nato',
      'vivere': 'vissuto',
      'scrivere': 'scritto',
      'leggere': 'letto',
      'prendere': 'preso',
      'mettere': 'messo',
      'chiudere': 'chiuso',
      'aprire': 'aperto',
      'offrire': 'offerto',
      'coprire': 'coperto'
    };

    if (irregularParticiples[verbItalian]) {
      return irregularParticiples[verbItalian];
    }

    // Regular patterns based on conjugation class
    if (verbItalian.endsWith('are')) {
      // -are → -ato (parlare → parlato)
      return verbItalian.slice(0, -3) + 'ato';
    } else if (verbItalian.endsWith('ere')) {
      // -ere → -uto (credere → creduto)  
      return verbItalian.slice(0, -3) + 'uto';
    } else if (verbItalian.endsWith('ire')) {
      // -ire → -ito (finire → finito)
      return verbItalian.slice(0, -3) + 'ito';
    }

    // Fallback
    return verbItalian.slice(0, -2) + 'to';
  }

  /**
   * Predict present gerund based on Italian morphological rules
   */
  predictPresentGerund(verbItalian, verbTags = []) {
    // Handle irregular gerunds first
    const irregularGerunds = {
      'essere': 'essendo',
      'avere': 'avendo',
      'fare': 'facendo', 
      'dire': 'dicendo',
      'stare': 'stando',
      'dare': 'dando',
      'bere': 'bevendo',
      'tradurre': 'traducendo',
      'condurre': 'conducendo',
      'produrre': 'producendo'
    };

    if (irregularGerunds[verbItalian]) {
      return irregularGerunds[verbItalian];
    }

    // Regular patterns based on conjugation class
    if (verbItalian.endsWith('are')) {
      // -are → -ando (parlare → parlando)
      return verbItalian.slice(0, -3) + 'ando';
    } else if (verbItalian.endsWith('ere')) {
      // -ere → -endo (credere → credendo)
      return verbItalian.slice(0, -3) + 'endo';
    } else if (verbItalian.endsWith('ire')) {
      // -ire → -endo (finire → finendo)
      return verbItalian.slice(0, -3) + 'endo';
    }

    // Fallback
    return verbItalian.slice(0, -2) + 'endo';
  }

  /**
   * Predict missing person forms based on conjugation patterns
   */
  predictPersonForm(verbItalian, verbTags, mood, tense, person) {
    // This is more complex - for now return a helpful template
    const conjugationClass = this.getConjugationClass(verbTags);
    return `${person} form of ${verbItalian} (${conjugationClass} ${mood} ${tense})`;
  }

  /**
   * Get conjugation class from verb tags
   */
  getConjugationClass(verbTags = []) {
    if (verbTags.includes('are-conjugation')) return '-are';
    if (verbTags.includes('ere-conjugation')) return '-ere'; 
    if (verbTags.includes('ire-conjugation')) return '-ire';
    if (verbTags.includes('ire-isc-conjugation')) return '-ire (isc)';
    return 'unknown';
  }
  hasPersonTags(tags) {
    const personTags = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
    return (tags || []).some(tag => personTags.includes(tag));
  }

  isHighPriorityVerb(verb) {
    const priorityTags = [
      'freq-top100', 'freq-top200', 'freq-top500',
      'CEFR-A1', 'CEFR-A2', 'CEFR-B1'
    ];
    return (verb.tags || []).some(tag => priorityTags.includes(tag));
  }

  getPriorityReason(verb) {
    if ((verb.tags || []).includes('freq-top100')) return 'Top 100 most frequent';
    if ((verb.tags || []).includes('freq-top200')) return 'Top 200 most frequent';
    if ((verb.tags || []).includes('freq-top500')) return 'Top 500 most frequent';
    if ((verb.tags || []).includes('CEFR-A1')) return 'Beginner level (A1)';
    if ((verb.tags || []).includes('CEFR-A2')) return 'Elementary level (A2)';
    if ((verb.tags || []).includes('CEFR-B1')) return 'Intermediate level (B1)';
    return 'High priority verb';
  }

  /**
   * Quick analysis for specific verb with EPIC alignment
   */
  async analyzeSpecificVerb(verbItalian) {
    console.log(`🔍 EPIC analysis for: ${verbItalian}`);

    try {
      const { data: verb, error: verbError } = await this.supabase
        .from('dictionary')
        .select('*')
        .eq('italian', verbItalian)
        .eq('word_type', 'VERB')
        .single();

      if (verbError || !verb) {
        return { error: `Verb "${verbItalian}" not found` };
      }

      // Clear previous results for clean analysis
      this.analysisResults = {
        totalVerbs: 0,
        analyzedVerbs: 0,
        epicAlignmentIssues: [],
        missingEpicForms: [],
        deprecatedForms: [],
        highPriorityGaps: [],
        tagInconsistencies: [],
        crossTableIssues: [],
        summary: {}
      };

      // Analyze against EPIC requirements
      await this.analyzeVerbAgainstEpic(verb, true, true);

      const gaps = {
        missingForms: this.analysisResults.missingEpicForms || [],
        deprecatedForms: this.analysisResults.deprecatedForms || [],
        alignmentIssues: this.analysisResults.epicAlignmentIssues || [],
        crossTableIssues: this.analysisResults.crossTableIssues || []
      };

      return {
        verb: verb.italian,
        gaps: gaps
      };

    } catch (error) {
      console.error(`❌ Error analyzing ${verbItalian}:`, error);
      return { error: error.message };
    }
  }
}
