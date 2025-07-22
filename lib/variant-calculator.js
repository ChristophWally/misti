// lib/variant-calculator.js
// Enhanced morphological transformation engine for Italian conjugations
// Handles all participle patterns and gender agreement calculations

export class VariantCalculator {
  
  // MAIN DETECTION FUNCTION - Determines if gender variants are needed
  static needsGenderVariants(wordTags, formTags = []) {
    // Only for ESSERE auxiliary verbs
    if (!wordTags.includes('essere-auxiliary')) return null;

    // Must be a compound tense (uses past participle, not gerund)
    if (!formTags.includes('compound')) return null;

    // PROGRESSIVE forms use gerunds, so they never get gender variants
    if (formTags.includes('presente-progressivo') ||
        formTags.includes('passato-progressivo')) return null;

    // INCLUDE compound forms that use past participles:
    // - Passato prossimo: "sono andato" → "sono andata" ✅
    // - Compound gerunds: "essendo andato" → "essendo andata" ✅
    // - Future perfect: "sarò andato" → "sarò andata" ✅

    return {
      type: 'essere-compound',
      variants: ['fem-sing', 'fem-plur']
    };
  }

  
  // COMPREHENSIVE PARTICIPLE TRANSFORMATION RULES
  static transformParticiple(masculineForm, targetGender, targetNumber) {
    // Extract participle from compound form (e.g., "sono andato" → "andato")
    const participle = this.extractParticiple(masculineForm);
    if (!participle) return masculineForm;
    
    // Transform the participle
    const transformedParticiple = this.applyParticipleRules(participle, targetGender, targetNumber);
    
    // Reconstruct the full form
    return masculineForm.replace(participle, transformedParticiple);
  }
  
  // EXTRACT PARTICIPLE FROM COMPOUND FORM
  static extractParticiple(compoundForm) {
    // Handle various compound patterns
    const parts = compoundForm.trim().split(/\s+/);
    
    // For most compounds, participle is the last word
    if (parts.length >= 2) {
      return parts[parts.length - 1];
    }
    
    // For single words, assume it's already a participle
    return compoundForm.trim();
  }
  
  // COMPREHENSIVE PARTICIPLE MORPHOLOGICAL RULES
  static applyParticipleRules(participle, targetGender, targetNumber) {
    console.log('🔍 Transforming participle:', participle, 'to', targetGender, targetNumber);

    // REGULAR -ATO PATTERN (andato, parlato, lavato)
    if (participle.endsWith('ato')) {
      const stem = participle.slice(0, -3); // Remove 'ato'
      if (targetGender === 'feminine' && targetNumber === 'singular') {
        const result = stem + 'ata';
        console.log('✅ -ato fem-sing:', participle, '→', result);
        return result;
      }
      if (targetGender === 'masculine' && targetNumber === 'plural') {
        const result = stem + 'ati';
        console.log('✅ -ato masc-plur:', participle, '→', result);
        return result;
      }
      if (targetGender === 'feminine' && targetNumber === 'plural') {
        const result = stem + 'ate';
        console.log('✅ -ato fem-plur:', participle, '→', result);
        return result;
      }
      console.log('✅ -ato unchanged:', participle);
      return participle; // masculine singular (original)
    }

    // REGULAR -ATI PATTERN (for plural stored forms)
    if (participle.endsWith('ati')) {
      const stem = participle.slice(0, -3); // Remove 'ati'
      if (targetGender === 'feminine' && targetNumber === 'plural') {
        const result = stem + 'ate';
        console.log('✅ -ati fem-plur:', participle, '→', result);
        return result;
      }
      console.log('✅ -ati unchanged:', participle);
      return participle; // masculine plural (original)
    }
    
    // REGULAR -ITO PATTERN (finito, partito, servito)
    if (participle.endsWith('ito')) {
      const stem = participle.slice(0, -3); // Remove 'ito'
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'ita';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'iti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'ite';
      return participle; // masculine singular (original)
    }
    
    // REGULAR -UTO PATTERN (venuto, caduto, piaciuto)
    if (participle.endsWith('uto')) {
      const stem = participle.slice(0, -3); // Remove 'uto'
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'uta';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'uti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'ute';
      return participle; // masculine singular (original)
    }
    
    // IRREGULAR -TO PATTERN (fatto, detto, letto)
    if (participle.endsWith('tto')) {
      const stem = participle.slice(0, -3); // Remove 'tto'
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'tta';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'tti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'tte';
      return participle; // masculine singular (original)
    }
    
    // IRREGULAR -SO PATTERN (preso, acceso, difeso)
    if (participle.endsWith('so')) {
      const stem = participle.slice(0, -2); // Remove 'so'
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'sa';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'si';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'se';
      return participle; // masculine singular (original)
    }
    
    // IRREGULAR -STO PATTERN (visto, posto)
    if (participle.endsWith('sto')) {
      const stem = participle.slice(0, -3); // Remove 'sto'
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'sta';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'sti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'ste';
      return participle; // masculine singular (original)
    }
    
    // CONSONANT + O PATTERN (morto, nato, stato)
    if (participle.endsWith('to') && !participle.endsWith('ato') && !participle.endsWith('ito') && !participle.endsWith('uto')) {
      const stem = participle.slice(0, -2); // Remove 'to'
      if (targetGender === 'feminine' && targetNumber === 'singular') return stem + 'ta';
      if (targetGender === 'masculine' && targetNumber === 'plural') return stem + 'ti';
      if (targetGender === 'feminine' && targetNumber === 'plural') return stem + 'te';
      return participle; // masculine singular (original)
    }
    
    // FALLBACK: Return original if no pattern matches
    console.warn(`Unknown participle pattern: ${participle}`);
    return participle;
  }
  
  // PHONETIC TRANSFORMATION RULES
  static transformPhonetic(originalPhonetic, originalParticiple, transformedParticiple) {
    if (!originalPhonetic || originalParticiple === transformedParticiple) {
      return originalPhonetic;
    }
    
    // Apply phonetic transformations based on ending changes
    const originalEnding = originalParticiple.slice(-3);
    const transformedEnding = transformedParticiple.slice(-3);
    
    // Phonetic transformation patterns
    const phoneticRules = {
      // -ato patterns
      'ato': { 'ata': 'toh→tah', 'ati': 'toh→tee', 'ate': 'toh→teh' },
      // -ito patterns  
      'ito': { 'ita': 'toh→tah', 'iti': 'toh→tee', 'ite': 'toh→teh' },
      // -uto patterns
      'uto': { 'uta': 'toh→tah', 'uti': 'toh→tee', 'ute': 'toh→teh' },
      // -tto patterns
      'tto': { 'tta': 'toh→tah', 'tti': 'toh→tee', 'tte': 'toh→teh' },
      // -so patterns
      'so': { 'sa': 'soh→sah', 'si': 'soh→see', 'se': 'soh→seh' },
      // -sto patterns
      'sto': { 'sta': 'stoh→stah', 'sti': 'stoh→stee', 'ste': 'stoh→steh' }
    };
    
    // Find matching rule and apply transformation
    for (const [pattern, rules] of Object.entries(phoneticRules)) {
      if (originalEnding.includes(pattern.slice(-2))) {
        const rule = rules[transformedEnding];
        if (rule) {
          const [from, to] = rule.split('→');
          return originalPhonetic.replace(from, to);
        }
      }
    }
    
    return originalPhonetic; // Return original if no rule matches
  }
  
  // IPA TRANSFORMATION RULES
  static transformIPA(originalIPA, originalParticiple, transformedParticiple) {
    if (!originalIPA || originalParticiple === transformedParticiple) {
      return originalIPA;
    }
    
    // IPA transformation patterns
    const ipaRules = {
      'o/': 'a/', // Vowel change o→a
      'i/': 'i/', // Plural masculine stays i
      'e/': 'e/'  // Plural feminine becomes e
    };
    
    // Apply appropriate IPA transformation based on ending
    if (transformedParticiple.endsWith('a')) {
      return originalIPA.replace(/o\//, 'a/');
    } else if (transformedParticiple.endsWith('i')) {
      return originalIPA.replace(/o\//, 'i/');
    } else if (transformedParticiple.endsWith('e')) {
      return originalIPA.replace(/o\//, 'e/');
    }
    
    return originalIPA; // Return original if no transformation needed
  }
  
  // MAIN CALCULATION FUNCTION - Generates all gender variants
  static calculateGenderVariants(storedForm, wordTags) {
    const variantPattern = this.needsGenderVariants(wordTags, storedForm.tags || []);
    if (!variantPattern) return null;

    const variants = [];

    // Determine if this is plural from stored form tags
    const isPlural = storedForm.tags?.includes('plurale') ||
                     storedForm.tags?.some(tag => ['noi', 'voi', 'loro'].includes(tag));

    if (isPlural) {
      // For plural stored forms, only calculate feminine plural
      const femPlurForm = this.transformParticiple(storedForm.form_text, 'feminine', 'plural');
      const femPlurPhonetic = this.transformPhonetic(storedForm.phonetic_form, storedForm.form_text, femPlurForm);
      const femPlurIPA = this.transformIPA(storedForm.ipa, storedForm.form_text, femPlurForm);

      variants.push({
        variant_type: 'fem-plur',
        form_text: femPlurForm,
        phonetic_form: femPlurPhonetic,
        ipa: femPlurIPA,
        translation: storedForm.translation,
        form_translations: storedForm.form_translations
          ? storedForm.form_translations.map(ft => ({ ...ft }))
          : [],
        tags: [...(storedForm.tags || []), 'feminine', 'calculated-variant'],
        base_form_id: storedForm.id,
        pattern_type: variantPattern.type
      });
    } else {
      // For singular stored forms, only calculate feminine singular
      const femSingForm = this.transformParticiple(storedForm.form_text, 'feminine', 'singular');
      const femSingPhonetic = this.transformPhonetic(storedForm.phonetic_form, storedForm.form_text, femSingForm);
      const femSingIPA = this.transformIPA(storedForm.ipa, storedForm.form_text, femSingForm);

      variants.push({
        variant_type: 'fem-sing',
        form_text: femSingForm,
        phonetic_form: femSingPhonetic,
        ipa: femSingIPA,
        translation: storedForm.translation,
        form_translations: storedForm.form_translations
          ? storedForm.form_translations.map(ft => ({ ...ft }))
          : [],
        tags: [...(storedForm.tags || []), 'feminine', 'calculated-variant'],
        base_form_id: storedForm.id,
        pattern_type: variantPattern.type
      });
    }

    return variants.length > 0 ? variants : null;
  }

  
  // UTILITY FUNCTION - Check if form needs gender variants
  static needsCalculation(storedForm, wordTags) {
    return this.needsGenderVariants(wordTags, storedForm.tags || []) !== null;
  }
  
  // UTILITY FUNCTION - Get all forms (stored + calculated)
  static getAllForms(storedForms, wordTags) {
    const allForms = [...storedForms]; // Start with stored forms
    
    storedForms.forEach(storedForm => {
      const variants = this.calculateGenderVariants(storedForm, wordTags);
      if (variants) {
        allForms.push(...variants);
      }
    });
    
    return allForms;
  }
}

// TESTING UTILITIES (Remove in production)
export class VariantCalculatorTest {
  static testTransformations() {
    console.log('🧪 Testing Participle Transformations:');
    
    const testCases = [
      { input: 'andato', fem_sing: 'andata', masc_plur: 'andati', fem_plur: 'andate' },
      { input: 'finito', fem_sing: 'finita', masc_plur: 'finiti', fem_plur: 'finite' },
      { input: 'venuto', fem_sing: 'venuta', masc_plur: 'venuti', fem_plur: 'venute' },
      { input: 'fatto', fem_sing: 'fatta', masc_plur: 'fatti', fem_plur: 'fatte' },
      { input: 'preso', fem_sing: 'presa', masc_plur: 'presi', fem_plur: 'prese' },
      { input: 'visto', fem_sing: 'vista', masc_plur: 'visti', fem_plur: 'viste' },
      { input: 'morto', fem_sing: 'morta', masc_plur: 'morti', fem_plur: 'morte' }
    ];
    
    testCases.forEach(testCase => {
      const femSing = VariantCalculator.applyParticipleRules(testCase.input, 'feminine', 'singular');
      const mascPlur = VariantCalculator.applyParticipleRules(testCase.input, 'masculine', 'plural');
      const femPlur = VariantCalculator.applyParticipleRules(testCase.input, 'feminine', 'plural');
      
      console.log(`${testCase.input}: ${femSing} ${mascPlur} ${femPlur}`, 
        femSing === testCase.fem_sing && mascPlur === testCase.masc_plur && femPlur === testCase.fem_plur ? '✅' : '❌');
    });
  }
  
  static testCompoundTransformations() {
    console.log('🧪 Testing Compound Form Transformations:');
    
    const testCases = [
      { input: 'sono andato', fem_sing: 'sono andata' },
      { input: 'è finito', fem_sing: 'è finita' },
      { input: 'siamo venuti', fem_plur: 'siamo venute' },
      { input: 'mi sono lavato', fem_sing: 'mi sono lavata' }
    ];
    
    testCases.forEach(testCase => {
      if (testCase.fem_sing) {
        const result = VariantCalculator.transformParticiple(testCase.input, 'feminine', 'singular');
        console.log(`${testCase.input} → ${result}`, result === testCase.fem_sing ? '✅' : '❌');
      }
      if (testCase.fem_plur) {
        const result = VariantCalculator.transformParticiple(testCase.input, 'feminine', 'plural');
        console.log(`${testCase.input} → ${result}`, result === testCase.fem_plur ? '✅' : '❌');
      }
    });
  }
}
