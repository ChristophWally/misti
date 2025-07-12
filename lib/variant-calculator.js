// lib/variant-calculator.js
// Automatic variant calculation for Italian morphological agreement
// Handles gender/number variants for compounds, adjectives, and common-gender nouns

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
  
  // Generate all variants for a given pattern
  static generateVariants(baseText, pattern, baseWord = null) {
    switch (pattern.type) {
      case 'essere-compound':
        return this.generateEssereCompounds(baseText);
      case 'common-gender':
        return this.generateCommonGenderVariants(baseText, baseWord);
      case 'adjective-4':
        return this.generateAdjective4Variants(baseText);
      case 'adjective-2':
        return this.generateAdjective2Variants(baseText);
      case 'participle-adjective':
        return this.generateAdjective4Variants(baseText); // Same as adjective-4
      default:
        return {};
    }
  }
  
  // Essere compound variants: "sono andato" → "sono andata/andati/andate"
  static generateEssereCompounds(compoundText) {
    // Extract auxiliary + participle: "sono andato" → ["sono", "andato"]
    const parts = compoundText.split(' ');
    if (parts.length < 2) return {};
    
    const auxiliary = parts.slice(0, -1).join(' '); // "sono"
    const participle = parts[parts.length - 1];     // "andato"
    
    const participleVariants = this.generateParticipleVariants(participle);
    
    return {
      'masc-sing': compoundText, // Original: "sono andato"
      'fem-sing': `${auxiliary} ${participleVariants['fem-sing']}`, // "sono andata"
      'masc-plur': `${auxiliary} ${participleVariants['masc-plur']}`, // "sono andati"
      'fem-plur': `${auxiliary} ${participleVariants['fem-plur']}`   // "sono andate"
    };
  }
  
  // Participle morphology: "andato" → "andata/andati/andate"
  static generateParticipleVariants(participle) {
    // Pattern: -ato/-ito/-uto endings
    if (participle.endsWith('ato') || participle.endsWith('ito') || participle.endsWith('uto')) {
      const stem = participle.slice(0, -2); // "and-"
      return {
        'masc-sing': participle,           // "andato"
        'fem-sing': stem + 'a',           // "andata" 
        'masc-plur': stem + 'i',          // "andati"
        'fem-plur': stem + 'e'            // "andate"
      };
    }
    
    // Add other participle patterns as needed
    return { 'masc-sing': participle };
  }
  
  // Common gender variants: "cantante" → "il/la cantante, i/le cantanti"
  static generateCommonGenderVariants(noun, baseWord) {
    const pluralForm = this.generatePlural(noun, baseWord?.tags || []);
    
    return {
      'masc-sing': `il ${noun}`,     // "il cantante"
      'fem-sing': `la ${noun}`,      // "la cantante" 
      'masc-plur': `i ${pluralForm}`, // "i cantanti"
      'fem-plur': `le ${pluralForm}`  // "le cantanti"
    };
  }
  
  // 4-form adjectives: "bello" → "bella/belli/belle"
  static generateAdjective4Variants(adjective) {
    // Standard -o adjective pattern
    if (adjective.endsWith('o')) {
      const stem = adjective.slice(0, -1); // "bell-"
      return {
        'masc-sing': adjective,        // "bello"
        'fem-sing': stem + 'a',       // "bella"
        'masc-plur': stem + 'i',      // "belli" 
        'fem-plur': stem + 'e'        // "belle"
      };
    }
    
    // Other patterns (add as needed)
    return { 'masc-sing': adjective };
  }
  
  // 2-form adjectives: "grande" → "grandi"
  static generateAdjective2Variants(adjective) {
    const plural = adjective.endsWith('e') 
      ? adjective.slice(0, -1) + 'i'  // "grande" → "grandi"
      : adjective + 'i';               // fallback
      
    return {
      'singular': adjective,  // "grande"
      'plural': plural       // "grandi"
    };
  }
  
  // Helper: Generate plural forms
  static generatePlural(word, tags) {
    if (tags.includes('plural-i')) {
      return word.endsWith('e') ? word.slice(0, -1) + 'i' : word + 'i';
    }
    if (tags.includes('plural-e')) {
      return word.endsWith('a') ? word.slice(0, -1) + 'e' : word + 'e';
    }
    if (tags.includes('plural-invariable')) {
      return word;
    }
    
    // Default rules
    if (word.endsWith('e')) return word.slice(0, -1) + 'i'; // cantante → cantanti
    if (word.endsWith('a')) return word.slice(0, -1) + 'e'; // casa → case  
    if (word.endsWith('o')) return word.slice(0, -1) + 'i'; // gatto → gatti
    
    return word + 'i'; // fallback
  }
}
