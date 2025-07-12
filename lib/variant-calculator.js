// lib/variant-calculator.js
export class VariantCalculator {
  
  // Main detection function using existing tags
  static needsVariants(word, wordTags, formTags = []) {
    // Check each pattern type
    const patterns = [
      this.checkEssereCompounds(wordTags, formTags),
      this.checkCommonGender(wordTags),
      this.checkAdjective4Forms(wordTags),
      this.checkAdjective2Forms(wordTags),
      this.checkParticipleAdjectives(formTags)
    ].filter(Boolean);
    
    return patterns.length > 0 ? patterns[0] : null;
  }
  
  // Essere auxiliary compound tenses
  static checkEssereCompounds(wordTags, formTags) {
    if (wordTags.includes('essere-auxiliary') && formTags.includes('compound')) {
      return {
        type: 'essere-compound',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur']
      };
    }
    return null;
  }
  
  // Common gender nouns
  static checkCommonGender(wordTags) {
    if (wordTags.includes('common-gender')) {
      return {
        type: 'common-gender',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur']
      };
    }
    return null;
  }
  
  // 4-form adjectives  
  static checkAdjective4Forms(wordTags) {
    if (wordTags.includes('form-4')) {
      return {
        type: 'adjective-4',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur']
      };
    }
    return null;
  }
  
  // 2-form adjectives
  static checkAdjective2Forms(wordTags) {
    if (wordTags.includes('form-2')) {
      return {
        type: 'adjective-2', 
        variants: ['singular', 'plural']
      };
    }
    return null;
  }
  
  // Past participles used as adjectives
  static checkParticipleAdjectives(formTags) {
    if (formTags.includes('participio-passato') && !formTags.includes('compound')) {
      return {
        type: 'participle-adjective',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur'] 
      };
    }
    return null;
  }
}
