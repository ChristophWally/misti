// lib/enhanced-dictionary-system.js
// Enhanced Dictionary System for Misti Italian Learning App - Translation-First Architecture
// Updated for Phase 2: Business Logic Core

export class EnhancedDictionarySystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
    this.searchTimeout = null;
  }

  /**
   * Load words with all translations using our translation-first architecture
   * This is the core method that brings together our entire system
   */
  async loadWordsWithTranslations(searchTerm = '', filters = {}) {
    try {
      console.log('🔍 Loading words with translations:', { searchTerm, filters });

      // Build the comprehensive query that loads everything we need
      let query = this.supabase
        .from('dictionary')
        .select(`
          id,
          italian,
          word_type,
          tags,
          phonetic_pronunciation,
          created_at,
          word_translations(
            id,
            translation,
            display_priority,
            context_metadata,
            usage_notes,
            frequency_estimate
          ),
          word_audio_metadata(
            id,
            audio_filename,
            azure_voice_name,
            duration_seconds
          )
        `)
        .order('italian', { ascending: true });

      // Apply search filter across both Italian and all translations
      if (searchTerm) {
        // Search both dictionary and translations
        query = query.or(
          `italian.ilike.%${searchTerm}%,word_translations.translation.ilike.%${searchTerm}%`
        );
      }

      // Apply word type filter
      if (filters.wordType && filters.wordType.length > 0) {
        query = query.in('word_type', filters.wordType);
      }

      // Apply tag filters  
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply CEFR level filter
      if (filters.cefrLevel) {
        query = query.overlaps('tags', [`CEFR-${filters.cefrLevel}`]);
      }

      const { data: words, error } = await query.limit(20);
      if (error) throw error;

      console.log(`✅ Loaded ${words?.length || 0} words with translations`);

      // Process and enhance the loaded data
      return await Promise.all(words.map(word => this.enhanceWordWithTranslations(word)));
    } catch (error) {
      console.error('❌ Error loading words with translations:', error);
      throw error;
    }
  }

  /**
   * Enhanced word processing that handles multiple translations
   */
  async enhanceWordWithTranslations(word) {
    const enhanced = { ...word };

    // Generate articles for nouns (existing logic)
    if (word.word_type === 'NOUN') {
      enhanced.articles = this.generateArticles(word);
    }

    // Process translations for display with priority ordering
    enhanced.processedTranslations = this.processTranslationsForDisplay(word.word_translations || []);

    // Process tags for visual display
    enhanced.processedTags = this.processTagsForDisplay(word.tags, word.word_type);

    // Check for premium audio
    enhanced.audioInfo = this.checkPremiumAudio(word);

    // Get word forms with translation assignments (if needed)
    if (word.word_type === 'VERB') {
      enhanced.conjugationPreview = await this.getConjugationPreview(word.id);
    }

    return enhanced;
  }

  /**
   * Process translations for display with proper prioritization and context info
   */
  processTranslationsForDisplay(translations) {
    if (!translations || translations.length === 0) return [];

    return translations
      .sort((a, b) => a.display_priority - b.display_priority)
      .map(translation => ({
        id: translation.id,
        translation: translation.translation,
        priority: translation.display_priority,
        isPrimary: translation.display_priority === 1,
        contextInfo: this.parseContextMetadata(translation.context_metadata),
        usageNotes: translation.usage_notes,
        frequencyEstimate: translation.frequency_estimate || 0.5
      }));
  }

  /**
   * Parse context metadata for UI display
   */
  parseContextMetadata(metadata) {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    return {
      usage: metadata.usage || null, // 'formal', 'reciprocal', 'direct-reflexive'
      plurality: metadata.plurality || null, // 'plural-only', 'singular-only', 'any'
      register: metadata.register || null, // 'formal', 'informal', 'neutral'  
      semanticDomain: metadata.semantic_domain || null, // 'body-care', 'social-interaction'
      semanticType: metadata.semantic_type || null, // 'self-directed', 'mutual-action'
      appliesTo: metadata.applies_to || null, // 'objects-places-people', 'men'
      genderSpecific: metadata.gender_specific || false,
      gender_usage: metadata.gender_usage || null
    };
  }

  /**
   * Get a preview of conjugations for verbs
   */
  async getConjugationPreview(wordId) {
    try {
      const { data: forms, error } = await this.supabase
        .from('word_forms')
        .select('form_text, translation, tags')
        .eq('word_id', wordId)
        .eq('form_type', 'conjugation')
        .contains('tags', ['presente', 'indicativo'])
        .limit(3);

      if (error) throw error;
      return forms || [];
    } catch (error) {
      console.error('Error loading conjugation preview:', error);
      return [];
    }
  }

  /**
   * Check for premium audio information
   */
  checkPremiumAudio(word) {
    const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
      ? word.word_audio_metadata[0] 
      : null;
      
    const hasPremiumAudio = audioMetadata && audioMetadata.audio_filename && audioMetadata.audio_filename.trim() !== '';
    
    return { 
      hasPremiumAudio, 
      audioFilename: hasPremiumAudio ? audioMetadata.audio_filename : null,
      voiceName: audioMetadata?.azure_voice_name || null
    };
  }

  /**
   * Generate Italian articles based on tags and phonetic rules (existing logic)
   */
  generateArticles(word) {
    const tags = word.tags || [];
    const italian = word.italian.toLowerCase();
    
    // Determine gender
    let gender = 'masculine'; // default
    if (tags.includes('feminine')) gender = 'feminine';
    if (tags.includes('masculine')) gender = 'masculine';
    if (tags.includes('common-gender')) gender = 'common';

    // Generate articles using the same logic as our SQL function
    const articles = {
      singular: this.calculateArticle(italian, gender, false),
      plural: this.calculateArticle(italian, gender, true)
    };

    // Add indefinite articles
    articles.indefinite = {
      singular: this.calculateIndefiniteArticle(italian, gender),
      plural: null // Italian doesn't have indefinite plural articles
    };

    return articles;
  }

  /**
   * Calculate definite article (existing logic)
   */
  calculateArticle(word, gender, isPlural) {
    const firstChar = word.charAt(0);
    const firstTwo = word.substring(0, 2);
    const consonantAfterS = word.length > 1 && /[bcdfghjklmnpqrstvwxyz]/.test(word.charAt(1));

    if (isPlural) {
      if (gender === 'masculine') {
        if (/[aeiou]/.test(firstChar) || 
            ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
            (firstChar === 's' && consonantAfterS)) {
          return 'gli';
        }
        return 'i';
      } else {
        return 'le';
      }
    } else {
      if (gender === 'masculine') {
        if (/[aeiou]/.test(firstChar) || 
            ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
            (firstChar === 's' && consonantAfterS)) {
          return 'lo';
        }
        return 'il';
      } else {
        if (/[aeiou]/.test(firstChar)) {
          return "l'";
        }
        return 'la';
      }
    }
  }

  /**
   * Calculate indefinite article (existing logic)
   */
  calculateIndefiniteArticle(word, gender) {
    const firstChar = word.charAt(0);
    const firstTwo = word.substring(0, 2);
    const consonantAfterS = word.length > 1 && /[bcdfghjklmnpqrstvwxyz]/.test(word.charAt(1));

    if (gender === 'masculine') {
      if (/[aeiou]/.test(firstChar) || 
          ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
          (firstChar === 's' && consonantAfterS)) {
        return 'uno';
      }
      return 'un';
    } else {
      if (/[aeiou]/.test(firstChar)) {
        return "un'";
      }
      return 'una';
    }
  }

  /**
   * Process tags for visual display (existing logic with comprehensive tag system)
   */
  processTagsForDisplay(tags, wordType) {
    const essential = [];
    const detailed = [];

    const tagMap = {
      // PRIMARY TAGS - Consistent across all word types, filled backgrounds with emojis
      'masculine': { 
        display: '♂', 
        class: 'tag-primary-gender-masc', 
        essential: wordType === 'NOUN', 
        description: 'Masculine gender requiring masculine articles (il, un)' 
      },
      'feminine': { 
        display: '♀', 
        class: 'tag-primary-gender-fem', 
        essential: wordType === 'NOUN', 
        description: 'Feminine gender requiring feminine articles (la, una)' 
      },
      'common-gender': { 
        display: '⚥', 
        class: 'tag-primary-gender-common', 
        essential: wordType === 'NOUN', 
        description: 'Same form for both genders, determined by article' 
      },
      
      // Irregularity (essential when present)
      'irregular-pattern': { 
        display: '⚠️ IRREG', 
        class: 'tag-primary-irregular', 
        essential: true, 
        description: 'Does not follow standard patterns' 
      },
      'form-irregular': { 
        display: '⚠️ IRREG', 
        class: 'tag-primary-irregular', 
        essential: true, 
        description: 'Special rules or position-dependent forms' 
      },
      
      // ISC Conjugation (essential for verbs)
      'ire-isc-conjugation': { 
        display: '-ISC', 
        class: 'tag-primary-isc', 
        essential: wordType === 'VERB', 
        description: 'Uses -isc- infix in present forms' 
      },
      
      // CEFR Levels (essential)
      'CEFR-A1': { display: '📚 A1', class: 'tag-primary-level', essential: true, description: 'Beginner level vocabulary' },
      'CEFR-A2': { display: '📚 A2', class: 'tag-primary-level', essential: true, description: 'Elementary level vocabulary' },
      'CEFR-B1': { display: '📚 B1', class: 'tag-primary-level', essential: true, description: 'Intermediate level vocabulary' },
      'CEFR-B2': { display: '📚 B2', class: 'tag-primary-level', essential: true, description: 'Upper intermediate vocabulary' },
      'CEFR-C1': { display: '📚 C1', class: 'tag-primary-level', essential: true, description: 'Advanced level vocabulary' },
      'CEFR-C2': { display: '📚 C2', class: 'tag-primary-level', essential: true, description: 'Proficiency level vocabulary' },
      
      // Frequency (essential)
      'freq-top100': { display: '⭐ 100', class: 'tag-primary-freq', essential: true, description: 'Top 100 most frequent words' },
      'freq-top200': { display: '⭐ 200', class: 'tag-primary-freq', essential: true, description: 'Top 200 most frequent words' },
      'freq-top300': { display: '⭐ 300', class: 'tag-primary-freq', essential: true, description: 'Top 300 most frequent words' },
      'freq-top500': { display: '⭐ 500', class: 'tag-primary-freq', essential: true, description: 'Top 500 most frequent words' },
      'freq-top1000': { display: '⭐ 1K', class: 'tag-primary-freq', essential: true, description: 'Top 1000 most frequent words' },
      'freq-top5000': { display: '⭐ 5K', class: 'tag-primary-freq', essential: true, description: 'Top 5000 most frequent words' },
      
      // Advanced Fluency (essential)
      'native': { display: '🗣️ NAT', class: 'tag-primary-level', essential: true, description: 'Natural native-speaker vocabulary' },
      'business': { display: '💼 BIZ', class: 'tag-primary-level', essential: true, description: 'Professional/commercial terminology' },
      'academic': { display: '🎓 ACAD', class: 'tag-primary-level', essential: true, description: 'Scholarly and technical vocabulary' },
      'literary': { display: '📜 LIT', class: 'tag-primary-level', essential: true, description: 'Literary and artistic language' },
      'regional': { display: '🗺️ REG', class: 'tag-primary-level', essential: true, description: 'Regional dialects and variants' },
      
      // SECONDARY TAGS - Detailed grammatical information
      'are-conjugation': { display: '🔸 -are', class: 'tag-secondary', essential: false, description: 'First conjugation group' },
      'ere-conjugation': { display: '🔹 -ere', class: 'tag-secondary', essential: false, description: 'Second conjugation group' },
      'ire-conjugation': { display: '🔶 -ire', class: 'tag-secondary', essential: false, description: 'Third conjugation group' },
      
      // Auxiliary Verbs (detailed)
      'avere-auxiliary': { display: '🤝 avere', class: 'tag-secondary', essential: false, description: 'Uses avere in compound tenses' },
      'essere-auxiliary': { display: '🫱 essere', class: 'tag-secondary', essential: false, description: 'Uses essere in compound tenses' },
      'both-auxiliary': { display: '🤜🤛 both', class: 'tag-secondary', essential: false, description: 'Can use either auxiliary' },
      
      // Transitivity (detailed)
      'transitive-verb': { display: '➡️ trans', class: 'tag-secondary', essential: false, description: 'Takes a direct object' },
      'intransitive-verb': { display: '↩️ intrans', class: 'tag-secondary', essential: false, description: 'Does not take direct object' },
      'both-transitivity': { display: '↔️ both', class: 'tag-secondary', essential: false, description: 'Can be both transitive and intransitive' },

      // Reflexive verbs (detailed)
      'reflexive-verb': { display: '🪞 reflexive', class: 'tag-secondary', essential: false, description: 'Action reflects back on the subject' },
      
      // Topics (detailed)
      'topic-place': { display: '🌍 place', class: 'tag-secondary', essential: false, description: 'Geographical locations or spaces' },
      'topic-food': { display: '🍕 food', class: 'tag-secondary', essential: false, description: 'Food and drink vocabulary' },
      'topic-bodypart': { display: '👁️ body', class: 'tag-secondary', essential: false, description: 'Parts of the body' },
      'topic-profession': { display: '👩‍💼 job', class: 'tag-secondary', essential: false, description: 'Jobs and professional roles' },
      'topic-abstract': { display: '💭 abstract', class: 'tag-secondary', essential: false, description: 'Concepts, ideas, and feelings' },
      'topic-daily-life': { display: '🏡 daily', class: 'tag-secondary', essential: false, description: 'Everyday activities and household' }
    };

    (tags || []).forEach(tag => {
      const tagInfo = tagMap[tag];
      if (tagInfo) {
        if (tagInfo.essential) {
          essential.push({
            tag,
            display: tagInfo.display,
            class: tagInfo.class,
            description: tagInfo.description
          });
        } else {
          detailed.push({
            tag,
            display: tagInfo.display,
            class: tagInfo.class,
            description: tagInfo.description
          });
        }
      }
    });

    return { essential, detailed };
  }

  /**
   * Search across translations as well as Italian/English
   */
  async searchAcrossTranslations(searchTerm) {
    try {
      // This would be implemented to search through word_translations table as well
      // For now, we use the standard search but this could be enhanced
      return await this.loadWordsWithTranslations(searchTerm);
    } catch (error) {
      console.error('Error searching across translations:', error);
      throw error;
    }
  }

  /**
   * Get word type colors (existing logic)
   */
  getWordTypeColors(wordType) {
    const colors = {
      'VERB': {
        border: 'border-teal-200',
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-100',
        tag: 'bg-teal-100 text-teal-800',
        text: 'text-teal-900'
      },
      'NOUN': {
        border: 'border-cyan-200',
        bg: 'bg-cyan-50',
        hover: 'hover:bg-cyan-100',
        tag: 'bg-cyan-100 text-cyan-800',
        text: 'text-cyan-900'
      },
      'ADJECTIVE': {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        tag: 'bg-blue-100 text-blue-800',
        text: 'text-blue-900'
      },
      'ADVERB': {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        tag: 'bg-purple-100 text-purple-800',
        text: 'text-purple-900'
      }
    };

    return colors[wordType] || {
      border: 'border-gray-200',
      bg: 'bg-gray-50',
      hover: 'hover:bg-gray-100',
      tag: 'bg-gray-100 text-gray-800',
      text: 'text-gray-900'
    };
  }
}
