// lib/form-gap-analyzer.js
// SIMPLE Form Gap Analysis - Just Find Obvious Issues

export class FormGapAnalyzer {
constructor(supabaseClient) {
this.supabase = supabaseClient;
}

/**

- Simple analysis - just find obvious problems
  */
  async runCompleteAnalysis() {
  console.log(‘🔍 Running SIMPLE analysis…’);

```
const results = {
  analyzedVerbs: 0,
  issues: [],
  summary: { totalGaps: 0, verbsNeedingAttention: 0 }
};

try {
  // Load ANY verbs - no complex filtering
  console.log('📊 Loading verbs...');
  const { data: verbs, error } = await this.supabase
    .from('dictionary')
    .select('id, italian, word_type, tags')
    .eq('word_type', 'VERB')
    .limit(10);

  if (error) throw error;
  
  console.log(`✅ Found ${verbs?.length || 0} verbs`);
  
  if (!verbs || verbs.length === 0) {
    results.issues.push({
      type: 'no-verbs',
      description: 'No verbs found in database',
      priority: 'CRITICAL'
    });
    return results;
  }

  // Check each verb
  for (const verb of verbs) {
    console.log(`🔍 Checking ${verb.italian}...`);
    
    // Load forms for this verb
    const { data: forms, error: formError } = await this.supabase
      .from('word_forms')
      .select('id, form_text, tags, form_type')
      .eq('word_id', verb.id);

    if (formError) {
      console.error(`❌ Error loading forms for ${verb.italian}:`, formError);
      continue;
    }

    const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');
    console.log(`📊 ${verb.italian}: ${conjugationForms.length} conjugation forms`);

    // Check for deprecated forms
    const deprecatedForms = conjugationForms.filter(f => 
      f.tags?.includes('imperativo-negativo') ||
      f.tags?.includes('imperative-negative')
    );

    if (deprecatedForms.length > 0) {
      console.log(`⚠️ ${verb.italian}: Found ${deprecatedForms.length} deprecated forms`);
      results.issues.push({
        type: 'deprecated-forms',
        verb: verb.italian,
        description: `Has ${deprecatedForms.length} deprecated "imperativo-negativo" forms`,
        forms: deprecatedForms.map(f => f.form_text),
        priority: 'HIGH',
        action: 'Remove these deprecated forms'
      });
    }

    // Check for missing participle
    const hasParticiple = conjugationForms.some(f => 
      f.tags?.includes('participio-passato')
    );

    if (!hasParticiple) {
      console.log(`❌ ${verb.italian}: Missing past participle`);
      results.issues.push({
        type: 'missing-participle',
        verb: verb.italian,
        description: 'Missing past participle (participio-passato)',
        priority: 'CRITICAL',
        action: 'Create past participle form'
      });
    }

    // Check for missing gerund
    const hasGerund = conjugationForms.some(f => 
      f.tags?.includes('gerundio-presente')
    );

    if (!hasGerund) {
      console.log(`❌ ${verb.italian}: Missing gerund`);
      results.issues.push({
        type: 'missing-gerund',
        verb: verb.italian,
        description: 'Missing present gerund (gerundio-presente)',
        priority: 'HIGH',
        action: 'Create present gerund form'
      });
    }

    // Check for stored compound forms (should be generated)
    const storedCompounds = conjugationForms.filter(f => 
      f.tags?.includes('passato-prossimo') ||
      f.tags?.includes('presente-progressivo') ||
      f.tags?.includes('futuro-anteriore')
    );

    if (storedCompounds.length > 0) {
      console.log(`🔧 ${verb.italian}: Found ${storedCompounds.length} stored compound forms`);
      results.issues.push({
        type: 'stored-compounds',
        verb: verb.italian,
        description: `Has ${storedCompounds.length} stored compound forms that should be generated`,
        forms: storedCompounds.map(f => f.form_text),
        priority: 'MEDIUM',
        action: 'Remove stored compounds - let system generate them'
      });
    }

    results.analyzedVerbs++;
  }

  // Generate summary
  results.summary = {
    totalGaps: results.issues.length,
    verbsNeedingAttention: new Set(results.issues.map(i => i.verb)).size,
    criticalIssues: results.issues.filter(i => i.priority === 'CRITICAL').length,
    highIssues: results.issues.filter(i => i.priority === 'HIGH').length,
    mediumIssues: results.issues.filter(i => i.priority === 'MEDIUM').length
  };

  console.log('✅ Simple analysis complete!', results.summary);
  return results;

} catch (error) {
  console.error('❌ Simple analysis failed:', error);
  throw error;
}
```

}

/**

- Simple specific verb analysis
  */
  async analyzeSpecificVerb(verbItalian) {
  console.log(`🔍 Simple analysis for: ${verbItalian}`);

```
try {
  // Find the verb
  const { data: verb, error: verbError } = await this.supabase
    .from('dictionary')
    .select('*')
    .eq('italian', verbItalian)
    .eq('word_type', 'VERB')
    .single();

  if (verbError || !verb) {
    return { error: `Verb "${verbItalian}" not found` };
  }

  // Load forms
  const { data: forms, error: formsError } = await this.supabase
    .from('word_forms')
    .select('id, form_text, tags, form_type')
    .eq('word_id', verb.id);

  if (formsError) {
    return { error: `Error loading forms: ${formsError.message}` };
  }

  const conjugationForms = (forms || []).filter(f => f.form_type === 'conjugation');
  console.log(`📊 ${verbItalian}: ${conjugationForms.length} conjugation forms`);

  const issues = [];

  // Check for deprecated forms
  const deprecatedForms = conjugationForms.filter(f => 
    f.tags?.includes('imperativo-negativo')
  );

  if (deprecatedForms.length > 0) {
    issues.push({
      type: 'deprecated-forms',
      description: `${deprecatedForms.length} deprecated "imperativo-negativo" forms found`,
      action: 'Remove these forms',
      priority: 'HIGH'
    });
  }

  // Check for missing building blocks
  const hasParticiple = conjugationForms.some(f => 
    f.tags?.includes('participio-passato')
  );

  if (!hasParticiple) {
    issues.push({
      type: 'missing-participle',
      description: 'Missing past participle (participio-passato)',
      action: 'Create past participle form',
      priority: 'CRITICAL'
    });
  }

  const hasGerund = conjugationForms.some(f => 
    f.tags?.includes('gerundio-presente')
  );

  if (!hasGerund) {
    issues.push({
      type: 'missing-gerund',
      description: 'Missing present gerund (gerundio-presente)',
      action: 'Create present gerund form',
      priority: 'HIGH'
    });
  }

  return {
    verb: verbItalian,
    totalForms: conjugationForms.length,
    issues: issues,
    isComplete: issues.length === 0
  };

} catch (error) {
  console.error(`❌ Error analyzing ${verbItalian}:`, error);
  return { error: error.message };
}
```

}
}