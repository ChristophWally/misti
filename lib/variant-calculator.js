// lib/variant-calculator.js
// Complete variant calculation system with morphological generators

export class VariantCalculator {
  
  // Main detection function using existing tags
  static needsVariants(word, wordTags, formTags = []) {
    const patterns = [
      this.checkEssereCompounds(wordTags, formTags),
      this.checkCommonGender(wordTags),
      this.checkAdjective4Forms(wordTags),
      this.checkAdjective2Forms(wordTags),
      this.checkParticipleAdjectives(formTags)
    ].filter(Boolean);
    
    return patterns.length > 0 ? patterns[0] : null;
  }
  
  // Detection functions
  static checkEssereCompounds(wordTags, formTags) {
    if (wordTags.includes('essere-auxiliary') && formTags.includes('compound')) {
      return {
        type: 'essere-compound',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur']
      };
    }
    return null;
  }
  
  static checkCommonGender(wordTags) {
    if (wordTags.includes('common-gender')) {
      return {
        type: 'common-gender',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur']
      };
    }
    return null;
  }
  
  static checkAdjective4Forms(wordTags) {
    if (wordTags.includes('form-4')) {
      return {
        type: 'adjective-4',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur']
      };
    }
    return null;
  }
  
  static checkAdjective2Forms(wordTags) {
    if (wordTags.includes('form-2')) {
      return {
        type: 'adjective-2', 
        variants: ['singular', 'plural']
      };
    }
    return null;
  }
  
  static checkParticipleAdjectives(formTags) {
    if (formTags.includes('participio-passato') && !formTags.includes('compound')) {
      return {
        type: 'participle-adjective',
        variants: ['masc-sing', 'fem-sing', 'masc-plur', 'fem-plur'] 
      };
    }
    return null;
  }

  // MORPHOLOGICAL GENERATORS - Convert base text to variants
  
  static generateVariants(baseText, variantType) {
    switch(variantType.type) {
      case 'essere-compound':
        return this.generateEssereCompoundVariants(baseText);
      case 'common-gender':
        return this.generateCommonGenderVariants(baseText);
      case 'adjective-4':
        return this.generateAdjective4Variants(baseText);
      case 'adjective-2':
        return this.generateAdjective2Variants(baseText);
      case 'participle-adjective':
        return this.generateParticipleVariants(baseText);
      default:
        return {};
    }
  }

  // Generate essere compound variants: "sono andato" → "sono andata", "sono andati", "sono andate"
  static generateEssereCompoundVariants(baseText) {
    const variants = {};
    
    // Extract auxiliary and participle: "sono andato" → ["sono", "andato"]
    const parts = baseText.trim().split(/\s+/);
    if (parts.length < 2) return variants;
    
    const auxiliary = parts.slice(0, -1).join(' '); // "sono" or "siamo stati"
    const participle = parts[parts.length - 1]; // "andato"
    
    // Transform participle ending: -o → -a/-i/-e
    if (participle.endsWith('o')) {
      const stem = participle.slice(0, -1); // "andat"
      
      variants['masc-sing'] = baseText; // Original form
      variants['fem-sing'] = `${auxiliary} ${stem}a`;  // "sono andata"
      variants['masc-plur'] = `${auxiliary} ${stem}i`; // "sono andati"
      variants['fem-plur'] = `${auxiliary} ${stem}e`;  // "sono andate"
    }
    
    return variants;
  }

  // Generate common gender variants: "cantante" → "la cantante", "i cantanti", "le cantanti"
  static generateCommonGenderVariants(baseText) {
    const variants = {};
    const word = baseText.trim();
    
    // Generate article + word combinations
    variants['masc-sing'] = this.addDefiniteArticle(word, 'masculine', false);  // "il cantante"
    variants['fem-sing'] = this.addDefiniteArticle(word, 'feminine', false);   // "la cantante"
    
    // Generate plural forms
    const plural = this.makePlural(word);
    variants['masc-plur'] = this.addDefiniteArticle(plural, 'masculine', true);  // "i cantanti"
    variants['fem-plur'] = this.addDefiniteArticle(plural, 'feminine', true);    // "le cantanti"
    
    return variants;
  }

  // Generate 4-form adjective variants: "bello" → "bella", "belli", "belle"
  static generateAdjective4Variants(baseText) {
    const variants = {};
    const word = baseText.trim();
    
    // Handle -o ending adjectives
    if (word.endsWith('o')) {
      const stem = word.slice(0, -1); // "bell"
      
      variants['masc-sing'] = word;           // "bello"
      variants['fem-sing'] = `${stem}a`;     // "bella"
      variants['masc-plur'] = `${stem}i`;    // "belli"
      variants['fem-plur'] = `${stem}e`;     // "belle"
    }
    
    return variants;
  }

  // Generate 2-form adjective variants: "grande" → "grandi"
  static generateAdjective2Variants(baseText) {
    const variants = {};
    const word = baseText.trim();
    
    variants['singular'] = word;                    // "grande"
    variants['plural'] = this.makePlural(word);    // "grandi"
    
    return variants;
  }

  // Generate participle adjective variants: "stanco" → "stanca", "stanchi", "stanche"
  static generateParticipleVariants(baseText) {
    // Same logic as 4-form adjectives
    return this.generateAdjective4Variants(baseText);
  }

  // HELPER FUNCTIONS - Italian morphological rules
  
  // Make plural form following Italian rules
  static makePlural(word) {
    if (word.endsWith('o')) return word.slice(0, -1) + 'i';    // libro → libri
    if (word.endsWith('a')) return word.slice(0, -1) + 'e';    // casa → case
    if (word.endsWith('e')) return word.slice(0, -1) + 'i';    // cantante → cantanti
    
    // Handle special cases
    if (word.endsWith('co')) return word.slice(0, -2) + 'chi'; // amico → amici
    if (word.endsWith('go')) return word.slice(0, -2) + 'ghi'; // luogo → luoghi
    if (word.endsWith('ca')) return word.slice(0, -2) + 'che'; // amica → amiche
    if (word.endsWith('ga')) return word.slice(0, -2) + 'ghe'; // collega → colleghe
    
    // Default: no change (invariable)
    return word;
  }
  
  // Add definite article based on gender and phonetic rules
  static addDefiniteArticle(word, gender, isPlural) {
    const firstChar = word.charAt(0).toLowerCase();
    const firstTwo = word.substring(0, 2).toLowerCase();
    
    // Check for consonant clusters after 's'
    const consonantAfterS = word.length > 1 && 
      /[bcdfghjklmnpqrstvwxyz]/.test(word.charAt(1));
    
    if (isPlural) {
      if (gender === 'masculine') {
        // Plural masculine: gli or i
        if (/[aeiou]/.test(firstChar) || 
            ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
            (firstChar === 's' && consonantAfterS)) {
          return `gli ${word}`;
        }
        return `i ${word}`;
      } else {
        // Plural feminine: always le
        return `le ${word}`;
      }
    } else {
      // Singular
      if (gender === 'masculine') {
        // Singular masculine: lo or il
        if (/[aeiou]/.test(firstChar) || 
            ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
            (firstChar === 's' && consonantAfterS)) {
          return `lo ${word}`;
        }
        return `il ${word}`;
      } else {
        // Singular feminine: la or l'
        if (/[aeiou]/.test(firstChar)) {
          return `l'${word}`;
        }
        return `la ${word}`;
      }
    }
  }

  // COMPLETE VARIANT GENERATION - Main public interface
  
  static calculateAllVariants(word, form = null) {
    const wordTags = word.tags || [];
    const formTags = form ? (form.tags || []) : [];
    
    // Check if variants are needed
    const variantPattern = this.needsVariants(word, wordTags, formTags);
    if (!variantPattern) return null;
    
    // Use form text if available, otherwise word text
    const baseText = form ? form.form_text : word.italian;
    
    // Generate actual variant texts
    const variantTexts = this.generateVariants(baseText, variantPattern);
    
    // Convert to complete variant objects with metadata
    const variants = [];
    
    Object.entries(variantTexts).forEach(([variantType, text]) => {
      if (text !== baseText) { // Don't include the base form as a variant
        variants.push({
          variant_type: variantType,
          form_text: text,
          pattern_type: variantPattern.type,
          base_text: baseText,
          // Generate appropriate tags for this variant
          tags: this.generateVariantTags(variantType, variantPattern.type, wordTags, formTags)
        });
      }
    });
    
    return variants.length > 0 ? variants : null;
  }
  
  // Generate appropriate tags for calculated variants
  static generateVariantTags(variantType, patternType, baseWordTags, baseFormTags) {
    const tags = [...baseFormTags]; // Start with base form tags
    
    // Add variant-specific tags
    switch (patternType) {
      case 'essere-compound':
        // Keep all base tags, add gender/number specific tags
        if (variantType === 'fem-sing') tags.push('feminine', 'singolare');
        if (variantType === 'masc-plur') tags.push('masculine', 'plurale');
        if (variantType === 'fem-plur') tags.push('feminine', 'plurale');
        break;
        
      case 'common-gender':
        // Add article and gender/number tags
        tags.push('with-article');
        if (variantType === 'masc-sing') tags.push('masculine', 'singolare');
        if (variantType === 'fem-sing') tags.push('feminine', 'singolare');
        if (variantType === 'masc-plur') tags.push('masculine', 'plurale');
        if (variantType === 'fem-plur') tags.push('feminine', 'plurale');
        break;
        
      case 'adjective-4':
      case 'participle-adjective':
        // Add agreement tags
        if (variantType === 'fem-sing') tags.push('feminine', 'singolare');
        if (variantType === 'masc-plur') tags.push('masculine', 'plurale');
        if (variantType === 'fem-plur') tags.push('feminine', 'plurale');
        break;
        
      case 'adjective-2':
        // Add number tag
        if (variantType === 'plural') tags.push('plurale');
        break;
    }
    
    // Mark as calculated variant
    tags.push('calculated-variant');
    
    return tags;
  }
}
