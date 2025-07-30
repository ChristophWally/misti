// lib/form-gap-analyzer.js
// EPIC-Aligned Form Gap Analysis Tool for Misti Italian Learning App
// Compares actual forms against EPIC 002 specifications (26 distinct form categories)

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
summary: {}
};

```
// EPIC 002 Required Form Categories (26 distinct categories)
this.epicRequiredForms = {
  // Simple Tenses (Stored in Database) - 4 main tenses
  'simple-present': {
    mood: 'indicativo',
    tense: 'presente',
    type: 'simple',
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
    required: true,
    priority: 'critical'
  },
  'simple-imperfect': {
    mood: 'indicativo', 
    tense: 'imperfetto',
    type: 'simple',
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
    required: true,
    priority: 'high'
  },
  'simple-future': {
    mood: 'indicativo',
    tense: 'futuro-semplice', 
    type: 'simple',
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
    required: true,
    priority: 'high'
  },
  'simple-past-remote': {
    mood: 'indicativo',
    tense: 'passato-remoto',
    type: 'simple', 
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
    required: true,
    priority: 'medium'
  },

  // Subjunctive Simple Tenses
  'subjunctive-present': {
    mood: 'congiuntivo',
    tense: 'congiuntivo-presente',
    type: 'simple',
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
    required: true,
    priority: 'high'
  },
  'subjunctive-imperfect': {
    mood: 'congiuntivo',
    tense: 'congiuntivo-imperfetto', 
    type: 'simple',
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
    required: true,
    priority: 'medium'
  },

  // Conditional
  'conditional-present': {
    mood: 'condizionale',
    tense: 'condizionale-presente',
    type: 'simple',
    persons: ['io', 'tu', 'lui', 'noi', 'voi', 'loro'], 
    required: true,
    priority: 'high'
  },

  // Imperative  
  'imperative-present': {
    mood: 'imperativo',
    tense: 'imperativo-presente',
    type: 'simple',
    persons: ['tu', 'lui', 'noi', 'voi', 'loro'], // No io in imperative
    required: true,
    priority: 'medium'
  },

  // Building Blocks (Essential for Compound Generation)
  'infinitive-present': {
    mood: 'infinito',
    tense: 'infinito-presente',
    type: 'simple',
    persons: [],
    required: true,
    priority: 'critical'
  },
  'gerund-present': {
    mood: 'gerundio', 
    tense: 'gerundio-presente',
    type: 'simple',
    persons: [],
    required: true,
    priority: 'critical'
  },
  'participle-past': {
    mood: 'participio',
    tense: 'participio-passato',
    type: 'simple', 
    persons: [],
    required: true,
    priority: 'critical'
  },
  'participle-present': {
    mood: 'participio',
    tense: 'participio-presente',
    type: 'simple',
    persons: [],
    required: false,
    priority: 'low'
  }
};

// Forms that should NOT exist according to EPIC (deprecated)
this.deprecatedFormPatterns = [
  'imperativo-negativo', // Removed in EPIC - negative imperatives use different construction
  'imperative-negative', // Alternative naming
  'neg-imperative',      // Alternative naming
];

// Compound forms that should be GENERATED, not stored
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
  'infinito-passato',
  'gerundio-passato'
];
```

}

/**

- Main analysis function - EPIC alignment analysis
  */
  async runCompleteAnalysis(options = {}) {
  const {
  limitToHighPriority = true,
  checkDeprecatedForms = true,
  maxVerbs = 50
  } = options;

```
console.log('🔍 Starting EPIC-Aligned FormGapAnalyzer');

try {
  // Step 1: Load verbs to analyze
  const verbs = await this.loadVerbsForAnalysis(limitToHighPriority, maxVerbs);
  this.analysisResults.totalVerbs = verbs.length;
  
  console.log(`📊 Analyzing ${verbs.length} verbs against EPIC specifications...`);

  // Step 2: Analyze each verb against EPIC requirements
  for (const verb of verbs) {
    await this.analyzeVerbAgainstEpic(verb, checkDeprecatedForms);
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
```

}

/**

- Load verbs for analysis with proper priority filtering
  */
  async loadVerbsForAnalysis(limitToHighPriority = true, maxVerbs = 50) {
  let query = this.supabase
  .from(‘dictionary’)
  .select(`id, italian, word_type, tags, created_at`)
  .eq(‘word_type’, ‘VERB’);

```
// Filter to high-priority verbs using correct tag format
if (limitToHighPriority) {
  query = query.or(
    'tags.cs.{"freq-top100"},tags.cs.{"freq-top200"},tags.cs.{"freq-top500"},tags.cs.{"CEFR-A1"},tags.cs.{"CEFR-A2"},tags.cs.{"CEFR-B1"}'
  );
}

const { data: verbs, error } = await query
  .order('italian')
  .limit(maxVerbs);

if (error) throw error;

return verbs || [];
```

}

/**

- Analyze verb against EPIC 002 specifications
  */
  async analyzeVerbAgainstEpic(verb, checkDeprecated = true) {
  console.log(`🔍 EPIC Analysis: ${verb.italian}`);

```
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

  console.log(`📊 ${verb.italian}: Loaded ${forms?.length || 0} total forms`);
  const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');
  console.log(`📊 ${verb.italian}: ${conjugationForms.length} conjugation forms`);

  // Check 1: Missing EPIC required forms
  const missingEpicForms = this.checkMissingEpicForms(verb, conjugationForms);
  if (missingEpicForms.length > 0) {
    console.log(`⚠️ ${verb.italian}: Found ${missingEpicForms.length} missing EPIC forms`);
    this.analysisResults.missingEpicForms.push({
      verb,
      missingForms: missingEpicForms
    });
  }

  // Check 2: Deprecated forms that should be removed
  if (checkDeprecated) {
    const deprecatedForms = this.checkDeprecatedForms(verb, conjugationForms);
    console.log(`🗑️ ${verb.italian}: Found ${deprecatedForms.length} deprecated forms`);
    if (deprecatedForms.length > 0) {
      console.log(`🗑️ Deprecated forms:`, deprecatedForms);
      this.analysisResults.deprecatedForms.push({
        verb,
        deprecatedForms: deprecatedForms
      });
    }
  }

  // Check 3: Stored compound forms that should be generated
  const incorrectlyStoredCompounds = this.checkIncorrectlyStoredCompounds(verb, conjugationForms);
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

  // Check 4: Missing building blocks (critical for compound generation)
  const missingBuildingBlocks = this.checkEpicBuildingBlocks(verb, conjugationForms);
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

  // Mark as high priority if it's a frequent word with significant issues
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
}
```

}

/**

- Check for missing forms according to EPIC specifications
  */
  checkMissingEpicForms(verb, forms) {
  const missing = [];

```
for (const [formKey, spec] of Object.entries(this.epicRequiredForms)) {
  if (!spec.required) continue;

  if (spec.persons.length === 0) {
    // Non-finite forms (infinitive, gerund, participle)
    const hasForm = forms.some(f => 
      f.tags?.includes(spec.mood) &&
      f.tags?.includes(spec.tense) &&
      f.tags?.includes('simple')
    );

    if (!hasForm) {
      missing.push({
        category: formKey,
        description: `Missing ${spec.mood} ${spec.tense}`,
        mood: spec.mood,
        tense: spec.tense,
        priority: spec.priority,
        impact: this.getFormImpact(formKey)
      });
    }
  } else {
    // Finite forms with persons
    const missingPersons = [];
    
    for (const person of spec.persons) {
      const hasPersonForm = forms.some(f =>
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
        description: `${spec.mood} ${spec.tense}: missing persons [${missingPersons.join(', ')}]`,
        mood: spec.mood,
        tense: spec.tense,
        missingPersons,
        priority: spec.priority,
        impact: this.getFormImpact(formKey)
      });
    }
  }
}

return missing;
```

}

/**

- Check for deprecated forms that should be removed
  */
  checkDeprecatedForms(verb, forms) {
  const deprecated = [];
  console.log(`🗑️ Checking ${forms.length} forms for deprecated patterns:`, this.deprecatedFormPatterns);

```
for (const form of forms) {
  console.log(`   Checking form: "${form.form_text}" with tags:`, form.tags);
  
  // Check for deprecated tense tags
  const hasDeprecatedTags = this.deprecatedFormPatterns.some(pattern => {
    const hasPattern = form.tags?.includes(pattern);
    if (hasPattern) {
      console.log(`     ✅ Found deprecated pattern "${pattern}" in form "${form.form_text}"`);
    }
    return hasPattern;
  });

  if (hasDeprecatedTags) {
    const deprecatedTagsFound = form.tags.filter(tag => 
      this.deprecatedFormPatterns.includes(tag)
    );
    
    console.log(`🗑️ Adding deprecated form: "${form.form_text}" with deprecated tags:`, deprecatedTagsFound);
    
    deprecated.push({
      formId: form.id,
      formText: form.form_text,
      deprecatedTags: deprecatedTagsFound,
      recommendation: 'Remove - deprecated in EPIC 002',
      priority: 'medium'
    });
  }
}

console.log(`🗑️ Total deprecated forms found: ${deprecated.length}`);
return deprecated;
```

}

/**

- Check for compound forms that are stored but should be generated
  */
  checkIncorrectlyStoredCompounds(verb, forms) {
  const incorrectlyStored = [];

```
for (const form of forms) {
  const hasCompoundTenseTags = this.shouldBeGenerated.some(compoundTense =>
    form.tags?.includes(compoundTense)
  );

  if (hasCompoundTenseTags && !form.tags?.includes('generated')) {
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
```

}

/**

- Check for missing building blocks (EPIC critical requirements)
  */
  checkEpicBuildingBlocks(verb, forms) {
  const missing = [];

```
// Past Participle (critical for all compound tenses)
const hasParticiple = forms.some(f => 
  f.tags?.includes('participio-passato') && 
  f.tags?.includes('simple') &&
  !this.hasPersonTags(f.tags)
);

if (!hasParticiple) {
  missing.push({
    type: 'participio-passato',
    description: 'Missing past participle - CRITICAL for compound tenses',
    impact: 'Cannot generate passato prossimo, trapassato prossimo, etc.',
    priority: 'critical'
  });
}

// Present Gerund (critical for progressive tenses)
const hasGerund = forms.some(f => 
  f.tags?.includes('gerundio-presente') && 
  f.tags?.includes('simple') &&
  !this.hasPersonTags(f.tags)
);

if (!hasGerund) {
  missing.push({
    type: 'gerundio-presente',
    description: 'Missing present gerund - CRITICAL for progressive tenses',
    impact: 'Cannot generate presente progressivo, passato progressivo, etc.',
    priority: 'critical'
  });
}

// Present Infinitive (needed for clitic attachment)
const hasInfinitive = forms.some(f => 
  f.tags?.includes('infinito-presente') && 
  f.tags?.includes('simple')
);

if (!hasInfinitive) {
  missing.push({
    type: 'infinito-presente',
    description: 'Missing present infinitive - needed for clitic attachment',
    impact: 'Cannot generate proper imperative negatives and clitic forms',
    priority: 'high'
  });
}

return missing;
```

}

/**

- Get impact description for missing forms
  */
  getFormImpact(formKey) {
  const impacts = {
  ‘simple-present’: ‘Students cannot learn basic present tense’,
  ‘simple-imperfect’: ‘Missing essential past tense for descriptions’,
  ‘simple-future’: ‘Cannot teach future plans and intentions’,
  ‘simple-past-remote’: ‘Missing historical/literary past tense’,
  ‘subjunctive-present’: ‘Cannot teach doubt, desire, emotion expressions’,
  ‘subjunctive-imperfect’: ‘Missing hypothetical and formal expressions’,
  ‘conditional-present’: ‘Cannot teach polite requests and hypotheticals’,
  ‘imperative-present’: ‘Missing command forms for instructions’,
  ‘infinitive-present’: ‘Missing base form for references and clitic attachment’,
  ‘gerund-present’: ‘Cannot generate progressive tenses (ongoing actions)’,
  ‘participle-past’: ‘Cannot generate any compound tenses (perfect forms)’,
  ‘participle-present’: ‘Missing adjectival and descriptive uses’
  };

```
return impacts[formKey] || 'Pedagogical completeness affected';
```

}

/**

- Generate summary with EPIC-specific recommendations
  */
  generateSummary() {
  const summary = {
  totalIssues: this.analysisResults.missingEpicForms.length +
  this.analysisResults.deprecatedForms.length +
  this.analysisResults.epicAlignmentIssues.length,
  
  criticalIssues: this.analysisResults.epicAlignmentIssues.filter(
  issue => issue.priority === ‘critical’
  ).length,
  
  highPriorityVerbs: this.analysisResults.highPriorityGaps.length,
  
  verbsNeedingAttention: new Set([
  …this.analysisResults.missingEpicForms.map(item => item.verb.id),
  …this.analysisResults.deprecatedForms.map(item => item.verb.id),
  …this.analysisResults.epicAlignmentIssues.map(item => item.verb.id),
  …this.analysisResults.highPriorityGaps.map(item => item.verb.id)
  ]).size,
  
  deprecatedFormsCount: this.analysisResults.deprecatedForms.reduce(
  (sum, item) => sum + item.deprecatedForms.length, 0
  ),
  
  epicAlignmentScore: this.calculateEpicAlignmentScore(),
  
  recommendedActions: this.generateEpicRecommendedActions()
  };

```
this.analysisResults.summary = summary;
```

}

/**

- Calculate EPIC alignment score (0-100%)
  */
  calculateEpicAlignmentScore() {
  if (this.analysisResults.analyzedVerbs === 0) return 0;

```
const totalPossibleIssues = this.analysisResults.analyzedVerbs * 5; // Rough estimate
const actualIssues = this.analysisResults.summary?.totalIssues || 0;

return Math.max(0, Math.round(((totalPossibleIssues - actualIssues) / totalPossibleIssues) * 100));
```

}

/**

- Generate EPIC-specific recommended actions
  */
  generateEpicRecommendedActions() {
  const actions = [];

```
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

return actions;
```

}

/**

- Utility functions
  */
  hasPersonTags(tags) {
  const personTags = [‘io’, ‘tu’, ‘lui’, ‘lei’, ‘noi’, ‘voi’, ‘loro’];
  return tags?.some(tag => personTags.includes(tag)) || false;
  }

isHighPriorityVerb(verb) {
const priorityTags = [
‘freq-top100’, ‘freq-top200’, ‘freq-top500’,
‘CEFR-A1’, ‘CEFR-A2’, ‘CEFR-B1’
];
return verb.tags?.some(tag => priorityTags.includes(tag)) || false;
}

getPriorityReason(verb) {
if (verb.tags?.includes(‘freq-top100’)) return ‘Top 100 most frequent’;
if (verb.tags?.includes(‘freq-top200’)) return ‘Top 200 most frequent’;
if (verb.tags?.includes(‘freq-top500’)) return ‘Top 500 most frequent’;
if (verb.tags?.includes(‘CEFR-A1’)) return ‘Beginner level (A1)’;
if (verb.tags?.includes(‘CEFR-A2’)) return ‘Elementary level (A2)’;
if (verb.tags?.includes(‘CEFR-B1’)) return ‘Intermediate level (B1)’;
return ‘High priority verb’;
}

/**

- Quick analysis for specific verb with EPIC alignment
  */
  async analyzeSpecificVerb(verbItalian) {
  console.log(`🔍 EPIC analysis for: ${verbItalian}`);

```
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
    summary: {}
  };

  // Analyze against EPIC requirements
  await this.analyzeVerbAgainstEpic(verb, true);

  const gaps = {
    missingForms: this.analysisResults.missingEpicForms || [],
    deprecatedForms: this.analysisResults.deprecatedForms || [],
    alignmentIssues: this.analysisResults.epicAlignmentIssues || []
  };

  return {
    verb: verb.italian,
    gaps: gaps
  };

} catch (error) {
  console.error(`❌ Error analyzing ${verbItalian}:`, error);
  return { error: error.message };
}
```

}
}