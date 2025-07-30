// lib/form-gap-analyzer.js
// Web-Based Form Gap Analysis Tool for Misti Italian Learning App
// Identifies missing verb forms and building blocks for high-priority verbs

export class FormGapAnalyzer {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.analysisResults = {
      totalVerbs: 0,
      analyzedVerbs: 0,
      missingForms: [],
      missingBuildingBlocks: [],
      incompleteConjugations: [],
      highPriorityGaps: [],
      tagInconsistencies: [],
      summary: {}
    };
  }

  /**
   * Main analysis function - runs complete form gap analysis
   * @param {Object} options - Analysis configuration
   * @returns {Object} Complete analysis results
   */
  async runCompleteAnalysis(options = {}) {
    const {
      limitToHighPriority = true,
      includePhoneticGaps = true,
      checkTagConsistency = true,
      maxVerbs = 50 // Limit for web performance
    } = options;

    console.log('🔍 Starting FormGapAnalyzer - Complete Analysis');
    
    try {
      // Step 1: Load verbs to analyze
      const verbs = await this.loadVerbsForAnalysis(limitToHighPriority, maxVerbs);
      this.analysisResults.totalVerbs = verbs.length;
      
      console.log(`📊 Analyzing ${verbs.length} verbs...`);

      // Step 2: Analyze each verb
      for (const verb of verbs) {
        await this.analyzeVerb(verb, includePhoneticGaps);
        this.analysisResults.analyzedVerbs++;
      }

      // Step 3: Check tag consistency if requested
      if (checkTagConsistency) {
        await this.analyzeTagConsistency();
      }

      // Step 4: Generate summary statistics
      this.generateSummary();

      console.log('✅ Analysis complete!');
      return this.analysisResults;

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Load verbs for analysis with priority filtering
   */
  async loadVerbsForAnalysis(limitToHighPriority = true, maxVerbs = 50) {
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

    // Filter to high-priority verbs if requested
    if (limitToHighPriority) {
      query = query.or(
        'tags.cs.{"freq-top100"},tags.cs.{"freq-top500"},tags.cs.{"CEFR-A1"},tags.cs.{"CEFR-A2"},tags.cs.{"CEFR-B1"}'
      );
    }

    const { data: verbs, error } = await query
      .order('italian')
      .limit(maxVerbs);

    if (error) throw error;

    return verbs || [];
  }

  /**
   * Analyze a single verb for completeness
   */
  async analyzeVerb(verb, includePhoneticGaps = true) {
    console.log(`🔍 Analyzing: ${verb.italian}`);

    try {
      // Load all forms for this verb
      const { data: forms, error } = await this.supabase
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
        .eq('word_id', verb.id);

      if (error) {
        console.error(`❌ Error loading forms for ${verb.italian}:`, error);
        return;
      }

      const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');

      // Check for missing building blocks
      const buildingBlockGaps = this.checkBuildingBlocks(verb, conjugationForms);
      if (buildingBlockGaps.length > 0) {
        this.analysisResults.missingBuildingBlocks.push({
          verb,
          gaps: buildingBlockGaps
        });
      }

      // Check for incomplete conjugation sets
      const conjugationGaps = this.checkConjugationCompleteness(verb, conjugationForms);
      if (conjugationGaps.length > 0) {
        this.analysisResults.incompleteConjugations.push({
          verb,
          gaps: conjugationGaps
        });
      }

      // Check for phonetic representation gaps
      if (includePhoneticGaps) {
        const phoneticGaps = this.checkPhoneticCompleteness(verb, conjugationForms);
        if (phoneticGaps.length > 0) {
          this.analysisResults.missingForms.push({
            verb,
            type: 'phonetic',
            gaps: phoneticGaps
          });
        }
      }

      // Mark as high priority if it's a frequent word with gaps
      const isHighPriority = this.isHighPriorityVerb(verb);
      const hasSignificantGaps = buildingBlockGaps.length > 0 || conjugationGaps.length > 2;
      
      if (isHighPriority && hasSignificantGaps) {
        this.analysisResults.highPriorityGaps.push({
          verb,
          buildingBlockGaps,
          conjugationGaps,
          priorityReason: this.getPriorityReason(verb)
        });
      }

    } catch (error) {
      console.error(`❌ Error analyzing ${verb.italian}:`, error);
    }
  }

  /**
   * Check for missing building blocks (participles, gerunds)
   */
  checkBuildingBlocks(verb, forms) {
    const gaps = [];

    // Check for past participle
    const hasParticiple = forms.some(f => 
      f.tags?.includes('participio-passato') && 
      f.tags?.includes('simple') &&
      !this.hasPersonTags(f.tags)
    );

    if (!hasParticiple) {
      gaps.push({
        type: 'missing-participle',
        description: 'Missing past participle (participio-passato)',
        severity: 'critical',
        impact: 'Cannot generate compound tenses (passato prossimo, etc.)'
      });
    }

    // Check for present gerund
    const hasGerund = forms.some(f => 
      f.tags?.includes('gerundio-presente') && 
      f.tags?.includes('simple') &&
      !this.hasPersonTags(f.tags)
    );

    if (!hasGerund) {
      gaps.push({
        type: 'missing-gerund',
        description: 'Missing present gerund (gerundio-presente)',
        severity: 'high',
        impact: 'Cannot generate progressive tenses (presente progressivo, etc.)'
      });
    }

    // Check for infinitive
    const hasInfinitive = forms.some(f => 
      f.tags?.includes('infinito-presente') && 
      f.tags?.includes('simple')
    );

    if (!hasInfinitive) {
      gaps.push({
        type: 'missing-infinitive',
        description: 'Missing present infinitive (infinito-presente)',
        severity: 'medium',
        impact: 'Missing base form for clitic attachment and references'
      });
    }

    return gaps;
  }

  /**
   * Check for incomplete conjugation sets
   */
  checkConjugationCompleteness(verb, forms) {
    const gaps = [];

    // Required tenses for complete conjugation
    const requiredTenses = [
      'presente',
      'imperfetto', 
      'futuro-semplice',
      'passato-remoto'
    ];

    // Required persons for each tense
    const requiredPersons = [
      'io', 'tu', 'lui', 'noi', 'voi', 'loro'
    ];

    // Check each required tense
    for (const tense of requiredTenses) {
      const tenseForms = forms.filter(f => f.tags?.includes(tense));
      
      if (tenseForms.length === 0) {
        gaps.push({
          type: 'missing-tense',
          tense,
          description: `Complete tense missing: ${tense}`,
          severity: 'high',
          impact: `Students cannot learn ${tense} forms`
        });
        continue;
      }

      // Check for missing persons within the tense
      const missingPersons = [];
      for (const person of requiredPersons) {
        const hasPersonForm = tenseForms.some(f => f.tags?.includes(person));
        if (!hasPersonForm) {
          missingPersons.push(person);
        }
      }

      if (missingPersons.length > 0) {
        gaps.push({
          type: 'missing-persons',
          tense,
          missingPersons,
          description: `${tense}: missing persons [${missingPersons.join(', ')}]`,
          severity: missingPersons.length > 3 ? 'high' : 'medium',
          impact: `Incomplete ${tense} conjugation set`
        });
      }
    }

    return gaps;
  }

  /**
   * Check for missing phonetic representations
   */
  checkPhoneticCompleteness(verb, forms) {
    const gaps = [];

    const formsWithoutPhonetic = forms.filter(f => 
      !f.phonetic_form || f.phonetic_form.trim() === ''
    );

    const formsWithoutIPA = forms.filter(f => 
      !f.ipa || f.ipa.trim() === ''
    );

    if (formsWithoutPhonetic.length > 0) {
      gaps.push({
        type: 'missing-phonetic',
        count: formsWithoutPhonetic.length,
        description: `${formsWithoutPhonetic.length} forms missing phonetic representation`,
        severity: 'low',
        impact: 'Audio pronunciation may be less accurate'
      });
    }

    if (formsWithoutIPA.length > 0) {
      gaps.push({
        type: 'missing-ipa',
        count: formsWithoutIPA.length,
        description: `${formsWithoutIPA.length} forms missing IPA transcription`,
        severity: 'low',
        impact: 'Pronunciation learning features limited'
      });
    }

    return gaps;
  }

  /**
   * Analyze tag consistency across the database
   */
  async analyzeTagConsistency() {
    console.log('🏷️ Analyzing tag consistency...');

    try {
      // Get all unique tags from word_forms
      const { data: formTags, error: formError } = await this.supabase
        .from('word_forms')
        .select('tags')
        .not('tags', 'is', null);

      if (formError) throw formError;

      // Get all unique tags from dictionary  
      const { data: wordTags, error: wordError } = await this.supabase
        .from('dictionary')
        .select('tags')
        .eq('word_type', 'VERB')
        .not('tags', 'is', null);

      if (wordError) throw wordError;

      // Analyze tag patterns
      const allFormTags = new Set();
      const allWordTags = new Set();

      (formTags || []).forEach(row => {
        if (row.tags && Array.isArray(row.tags)) {
          row.tags.forEach(tag => allFormTags.add(tag));
        }
      });

      (wordTags || []).forEach(row => {
        if (row.tags && Array.isArray(row.tags)) {
          row.tags.forEach(tag => allWordTags.add(tag));
        }
      });

      // Find potential inconsistencies
      const inconsistencies = this.findTagInconsistencies(allFormTags, allWordTags);
      this.analysisResults.tagInconsistencies = inconsistencies;

      console.log(`✅ Tag analysis complete. Found ${inconsistencies.length} potential issues.`);

    } catch (error) {
      console.error('❌ Tag consistency analysis failed:', error);
    }
  }

  /**
   * Find tag inconsistencies and deprecated patterns
   */
  findTagInconsistencies(formTags, wordTags) {
    const inconsistencies = [];

    // Check for mixed case tags
    const mixedCaseTags = [...formTags, ...wordTags].filter(tag => 
      tag !== tag.toLowerCase() && 
      tag !== tag.toUpperCase() &&
      tag.includes('_') || tag.includes(' ')
    );

    if (mixedCaseTags.length > 0) {
      inconsistencies.push({
        type: 'mixed-case',
        tags: [...new Set(mixedCaseTags)],
        description: 'Tags with inconsistent casing or separators',
        recommendation: 'Standardize to kebab-case'
      });
    }

    // Check for deprecated CEFR format  
    const oldCEFRTags = [...formTags, ...wordTags].filter(tag => 
      /^[ABC][12]$/.test(tag) || tag.includes('level-')
    );

    if (oldCEFRTags.length > 0) {
      inconsistencies.push({
        type: 'deprecated-cefr',
        tags: [...new Set(oldCEFRTags)],
        description: 'Old CEFR format tags',
        recommendation: 'Update to CEFR-A1, CEFR-A2, etc.'
      });
    }

    // Check for missing conjugation class tags
    const potentialVerbTags = [...wordTags].filter(tag => 
      tag.includes('are') || tag.includes('ere') || tag.includes('ire')
    );

    const standardConjugationTags = [
      'are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'
    ];

    const nonStandardConjugationTags = potentialVerbTags.filter(tag => 
      !standardConjugationTags.includes(tag)
    );

    if (nonStandardConjugationTags.length > 0) {
      inconsistencies.push({
        type: 'non-standard-conjugation',
        tags: nonStandardConjugationTags,
        description: 'Non-standard conjugation class tags',
        recommendation: 'Standardize to are-conjugation, ere-conjugation, ire-conjugation, ire-isc-conjugation'
      });
    }

    return inconsistencies;
  }

  /**
   * Utility functions
   */
  hasPersonTags(tags) {
    const personTags = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'];
    return tags?.some(tag => personTags.includes(tag)) || false;
  }

  isHighPriorityVerb(verb) {
    const priorityTags = [
      'freq-top100', 'freq-top200', 'freq-top500',
      'CEFR-A1', 'CEFR-A2', 'CEFR-B1'
    ];
    return verb.tags?.some(tag => priorityTags.includes(tag)) || false;
  }

  getPriorityReason(verb) {
    if (verb.tags?.includes('freq-top100')) return 'Top 100 most frequent';
    if (verb.tags?.includes('freq-top200')) return 'Top 200 most frequent';
    if (verb.tags?.includes('freq-top500')) return 'Top 500 most frequent';
    if (verb.tags?.includes('CEFR-A1')) return 'Beginner level (A1)';
    if (verb.tags?.includes('CEFR-A2')) return 'Elementary level (A2)';
    if (verb.tags?.includes('CEFR-B1')) return 'Intermediate level (B1)';
    return 'High priority verb';
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const summary = {
      totalGaps: this.analysisResults.missingForms.length + 
                 this.analysisResults.missingBuildingBlocks.length + 
                 this.analysisResults.incompleteConjugations.length,
      
      criticalIssues: this.analysisResults.missingBuildingBlocks.length,
      
      highPriorityVerbs: this.analysisResults.highPriorityGaps.length,
      
      verbsNeedingAttention: new Set([
        ...this.analysisResults.missingBuildingBlocks.map(item => item.verb.id),
        ...this.analysisResults.incompleteConjugations.map(item => item.verb.id),
        ...this.analysisResults.highPriorityGaps.map(item => item.verb.id)
      ]).size,

      tagInconsistencies: this.analysisResults.tagInconsistencies.length,

      recommendedActions: this.generateRecommendedActions()
    };

    this.analysisResults.summary = summary;
  }

  /**
   * Generate recommended actions based on analysis
   */
  generateRecommendedActions() {
    const actions = [];

    // Critical building block gaps
    if (this.analysisResults.missingBuildingBlocks.length > 0) {
      actions.push({
        priority: 'CRITICAL',
        action: 'Create missing building blocks',
        description: `${this.analysisResults.missingBuildingBlocks.length} verbs missing past participles or gerunds`,
        impact: 'Cannot generate compound tenses without these forms'
      });
    }

    // High priority verb gaps
    if (this.analysisResults.highPriorityGaps.length > 0) {
      actions.push({
        priority: 'HIGH',
        action: 'Complete high-priority verb conjugations',
        description: `${this.analysisResults.highPriorityGaps.length} frequent/beginner verbs have gaps`,
        impact: 'Essential verbs incomplete for students'
      });
    }

    // Tag inconsistencies
    if (this.analysisResults.tagInconsistencies.length > 0) {
      actions.push({
        priority: 'MEDIUM',
        action: 'Standardize tag formats',
        description: `${this.analysisResults.tagInconsistencies.length} tag inconsistencies found`,
        impact: 'New conjugation system requires consistent tags'
      });
    }

    return actions;
  }

  /**
   * Export results to JSON for external analysis
   */
  exportResults() {
    return {
      ...this.analysisResults,
      exportedAt: new Date().toISOString(),
      analysisVersion: '1.0'
    };
  }

  /**
   * Get simple progress callback for UI updates
   */
  createProgressCallback(callback) {
    let processed = 0;
    return () => {
      processed++;
      const progress = Math.round((processed / this.analysisResults.totalVerbs) * 100);
      callback(progress, processed, this.analysisResults.totalVerbs);
    };
  }

  /**
   * Quick analysis for specific verb (useful for debugging)
   */
  async analyzeSpecificVerb(verbItalian) {
    console.log(`🔍 Quick analysis for: ${verbItalian}`);

    try {
      // Load the verb
      const { data: verb, error: verbError } = await this.supabase
        .from('dictionary')
        .select('*')
        .eq('italian', verbItalian)
        .eq('word_type', 'VERB')
        .single();

      if (verbError || !verb) {
        return { error: `Verb "${verbItalian}" not found` };
      }

      // Analyze just this verb
      await this.analyzeVerb(verb, true);

      return {
        verb: verb.italian,
        gaps: {
          buildingBlocks: this.analysisResults.missingBuildingBlocks.filter(item => item.verb.id === verb.id),
          conjugations: this.analysisResults.incompleteConjugations.filter(item => item.verb.id === verb.id),
          phonetic: this.analysisResults.missingForms.filter(item => item.verb.id === verb.id)
        }
      };

    } catch (error) {
      console.error(`❌ Error analyzing ${verbItalian}:`, error);
      return { error: error.message };
    }
  }
}
