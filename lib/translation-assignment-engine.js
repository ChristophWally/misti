// lib/translation-assignment-engine.js
// Translation Assignment Engine for Misti Italian Learning App
// Intelligent form-to-translation matching with confidence scoring

export class TranslationAssignmentEngine {
  
  /**
   * Main method: Assign existing word forms to appropriate translations
   * This is the core migration and ongoing assignment logic
   */
  static assignFormsToTranslations(word, wordTranslations, wordForms) {
    console.log(`🧠 Assigning forms for "${word.italian}" with ${wordTranslations.length} translations and ${wordForms.length} forms`);
    
    const assignments = [];

    wordForms.forEach(form => {
      if (!form.translation || form.translation.trim() === '') {
        console.log(`⚠️ Skipping form "${form.form_text}" - no translation`);
        return;
      }

      // Find best matching translation(s) for this form
      const matches = this.findTranslationMatches(form, wordTranslations, word);
      
      matches.forEach(match => {
        assignments.push({
          form_id: form.id,
          word_translation_id: match.translation_id,
          translation: form.translation,
          assignment_method: match.method,
          confidence_score: match.confidence,
          usage_examples: this.generateUsageExamples(form, match.translation, word)
        });
        
        console.log(`✅ Assigned "${form.form_text}" to "${match.translation}" (${match.method}, ${match.confidence})`);
      });
    });

    console.log(`🎯 Created ${assignments.length} assignments for "${word.italian}"`);
    return assignments;
  }

  /**
   * Find matching translations for a word form based on semantic content
   * This is where the intelligence happens!
   */
  static findTranslationMatches(form, wordTranslations, word) {
    const matches = [];
    const formTranslation = form.translation.toLowerCase().trim();

    console.log(`🔍 Finding matches for form "${form.form_text}" with translation "${formTranslation}"`);

    wordTranslations.forEach(wordTranslation => {
      const translationText = wordTranslation.translation.toLowerCase().trim();
      let confidence = 0;
      let method = 'automatic';

      // Strategy 1: Direct keyword matching
      const keywordMatch = this.containsKeywords(formTranslation, translationText);
      if (keywordMatch.matches) {
        confidence = Math.max(confidence, keywordMatch.confidence);
        method = 'keyword-match';
        console.log(`🎯 Keyword match: "${formTranslation}" ↔ "${translationText}" (${keywordMatch.confidence})`);
      }

      // Strategy 2: Reflexive context matching for reflexive verbs
      if (word.tags?.includes('reflexive-verb') && wordTranslation.context_metadata) {
        const reflexiveMatch = this.checkReflexiveContext(form, wordTranslation.context_metadata);
        if (reflexiveMatch.matches) {
          confidence = Math.max(confidence, reflexiveMatch.confidence);
          method = 'reflexive-context';
          console.log(`🪞 Reflexive match: "${form.form_text}" → "${translationText}" (${reflexiveMatch.confidence})`);
        }
      }

      // Strategy 3: Plurality constraints for reciprocal verbs
      if (wordTranslation.context_metadata?.plurality === 'plural-only') {
        const isPlural = this.isFormPlural(form);
        if (!isPlural) {
          confidence = 0; // Block assignment of singular forms to plural-only translations
          console.log(`🚫 Blocked singular form "${form.form_text}" from plural-only translation "${translationText}"`);
        }
      }

      // Strategy 4: Part-of-speech matching (verb forms to verb translations)
      if (form.form_type === 'conjugation' && translationText.startsWith('to ')) {
        confidence = Math.max(confidence, 0.6);
        method = confidence > 0.6 ? method : 'pos-match';
      }

      // Add to matches if confidence is above threshold
      if (confidence > 0.3) { // Minimum confidence threshold
        matches.push({
          translation_id: wordTranslation.id,
          translation: wordTranslation.translation,
          confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
          method
        });
      }
    });

    // Fallback: If no matches found, assign to primary translation
    if (matches.length === 0) {
      const primaryTranslation = wordTranslations.find(t => t.display_priority === 1);
      if (primaryTranslation) {
        matches.push({
          translation_id: primaryTranslation.id,
          translation: primaryTranslation.translation,
          confidence: 0.5,
          method: 'fallback-primary'
        });
        console.log(`🔄 Fallback to primary translation: "${primaryTranslation.translation}"`);
      }
    }

    return matches;
  }

  /**
   * Check if form translation contains keywords from word translation
   */
  static containsKeywords(formTranslation, wordTranslation) {
    // Extract key verbs and concepts
    const wordKeywords = this.extractKeywords(wordTranslation);
    const formKeywords = this.extractKeywords(formTranslation);
    
    console.log(`🔤 Keywords - Word: [${wordKeywords.join(', ')}], Form: [${formKeywords.join(', ')}]`);
    
    // Check for overlap
    const overlap = wordKeywords.filter(keyword => 
      formKeywords.some(formKeyword => 
        formKeyword.includes(keyword) || keyword.includes(formKeyword)
      )
    );
    
    const confidence = overlap.length > 0 ? Math.min(0.9, 0.6 + (overlap.length * 0.1)) : 0;
    
    return {
      matches: overlap.length > 0,
      confidence,
      overlap
    };
  }

  /**
   * Extract meaningful keywords from translation text
   */
  static extractKeywords(text) {
    // Remove common words and extract meaningful content
    const stopWords = [
      'to', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'he', 'she', 'it', 'they', 'i', 'you', 'we', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'can', 'may', 'might',
      'himself', 'herself', 'themselves', 'myself', 'yourself', 'ourselves'
    ];
    
    const words = text.split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Check reflexive context compatibility
   * This handles the complex logic for reflexive verbs
   */
  static checkReflexiveContext(form, contextMetadata) {
    if (!contextMetadata?.usage) {
      return { matches: false, confidence: 0 };
    }

    const usage = contextMetadata.usage;
    
    // Direct reflexive: requires reflexive pronouns, works with any plurality
    if (usage === 'direct-reflexive') {
      const hasReflexivePronoun = this.hasReflexivePronoun(form);
      return { 
        matches: hasReflexivePronoun, 
        confidence: hasReflexivePronoun ? 0.85 : 0,
        reason: hasReflexivePronoun ? 'has-reflexive-pronoun' : 'missing-reflexive-pronoun'
      };
    }

    // Reciprocal: requires plural subjects AND reflexive pronouns
    if (usage === 'reciprocal') {
      const isPlural = this.isFormPlural(form);
      const hasReflexivePronoun = this.hasReflexivePronoun(form);
      
      const matches = isPlural && hasReflexivePronoun;
      return { 
        matches, 
        confidence: matches ? 0.8 : 0,
        reason: matches ? 'plural-reflexive' : `missing-${isPlural ? 'pronoun' : 'plurality'}`
      };
    }

    return { matches: true, confidence: 0.5, reason: 'default-match' };
  }

  /**
   * Check if a form has reflexive pronouns
   */
  static hasReflexivePronoun(form) {
    const reflexivePronouns = ['mi', 'ti', 'si', 'ci', 'vi'];
    const formText = form.form_text.toLowerCase();
    const hasPronoun = reflexivePronouns.some(pronoun => 
      formText.includes(pronoun + ' ') || formText.startsWith(pronoun + ' ')
    );
    
    // Also check tags for reflexive indicators
    const hasReflexiveTag = form.tags?.includes('reflexive') || 
                           form.tags?.some(tag => reflexivePronouns.includes(tag));
    
    return hasPronoun || hasReflexiveTag;
  }

  /**
   * Check if a form is plural
   */
  static isFormPlural(form) {
    const pluralPronouns = ['noi', 'voi', 'loro'];
    const pluralTags = ['plurale', 'plural'];
    
    // Check tags first
    if (form.tags?.some(tag => pluralTags.includes(tag) || pluralPronouns.includes(tag))) {
      return true;
    }
    
    // Check form text for plural indicators
    const formText = form.form_text.toLowerCase();
    return pluralPronouns.some(pronoun => formText.includes(pronoun));
  }

  /**
   * Generate usage examples for form-translation pairs
   */
  static generateUsageExamples(form, translation, word) {
    const examples = [];
    
    // Create a basic example using the form
    if (form.form_text && translation) {
      // Simple example generation - in production this could be more sophisticated
      let exampleItalian = form.form_text;
      let exampleEnglish = form.translation;
      
      // Add context for reflexive verbs
      if (word.tags?.includes('reflexive-verb')) {
        if (translation.includes('each other')) {
          exampleItalian = `${form.form_text} dopo lo sport`;
          exampleEnglish = `${form.translation} after sports`;
        } else if (translation.includes('oneself') || translation.includes('myself')) {
          exampleItalian = `${form.form_text} ogni mattina`;
          exampleEnglish = `${form.translation} every morning`;
        }
      }
      
      examples.push({
        italian: exampleItalian,
        english: exampleEnglish,
        context: form.form_context || 'present tense'
      });
    }
    
    return examples;
  }

  /**
   * Batch process multiple words for assignment
   */
  static async batchAssignWords(wordsWithTranslationsAndForms) {
    const allAssignments = [];
    
    for (const wordData of wordsWithTranslationsAndForms) {
      const assignments = this.assignFormsToTranslations(
        wordData.word,
        wordData.translations,
        wordData.forms
      );
      allAssignments.push(...assignments);
    }
    
    return allAssignments;
  }

  /**
   * Analyze assignment quality and provide statistics
   */
  static analyzeAssignmentQuality(assignments) {
    const stats = {
      total: assignments.length,
      byMethod: {},
      avgConfidence: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0
    };
    
    let totalConfidence = 0;
    
    assignments.forEach(assignment => {
      // Count by method
      stats.byMethod[assignment.assignment_method] = 
        (stats.byMethod[assignment.assignment_method] || 0) + 1;
      
      // Track confidence levels
      totalConfidence += assignment.confidence_score;
      
      if (assignment.confidence_score >= 0.8) {
        stats.highConfidence++;
      } else if (assignment.confidence_score >= 0.6) {
        stats.mediumConfidence++;
      } else {
        stats.lowConfidence++;
      }
    });
    
    stats.avgConfidence = totalConfidence / assignments.length;
    stats.successRate = ((stats.highConfidence + stats.mediumConfidence) / stats.total * 100).toFixed(1);
    
    return stats;
  }

  /**
   * Get confidence score explanation
   */
  static explainConfidence(assignment) {
    const score = assignment.confidence_score;
    const method = assignment.assignment_method;
    
    if (score >= 0.9) return `Very High (${score}) - ${method}: Excellent semantic match`;
    if (score >= 0.8) return `High (${score}) - ${method}: Strong contextual match`;
    if (score >= 0.6) return `Medium (${score}) - ${method}: Good pattern match`;
    if (score >= 0.4) return `Low (${score}) - ${method}: Weak correlation`;
    return `Very Low (${score}) - ${method}: Fallback assignment`;
  }
}
