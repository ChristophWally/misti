// lib/enhanced-dictionary-system.js
// Enhanced Dictionary System for Misti Italian Learning App - Translation-First Architecture
// Updated for Phase 2: Business Logic Core

import { ATTRIBUTES } from './meta-constants'

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
            // Test basic relationship query
            const { data: testData, error: testError } = await this.supabase
            .from('dictionary') 
            .select('italian, word_translations(*)')
            .limit(1);

            console.log('🔍 Relationship test:', { testData, testError });
          


      // Build the comprehensive query that loads everything we need
      let query = this.supabase
        .from('dictionary')
        .select(`
          *,
          word_translations(*),
          word_audio_metadata(audio_filename, azure_voice_name)
        `)
        .order('italian', { ascending: true });

      // FIXED - proper relationship search
      if (searchTerm) {
        query = query.or(`italian.ilike.%${searchTerm}%`);
        // Note: Translation search needs separate query due to Supabase limitations
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
   * Normalized loader: words + translations, then batch-fetch optional translation tags via RPC.
   * Feature-flag usage recommended from caller. Falls back to legacy on failure.
   */
  async loadWordsNormalized(searchTerm = '', filters = {}) {
    // Always use normalized listing RPC on this branch
    return await this.loadWordsViaListingRPC(searchTerm, filters);
  }

  /**
   * Normalized listing RPC -> transform to legacy word shape used by WordCard.
   */
  async loadWordsViaListingRPC(searchTerm = '', filters = {}) {
    const rpcFilters = this.mapUiFiltersToRpcFilters(filters);
    const params = {
      q: searchTerm && searchTerm.length ? searchTerm : null,
      word_types: (filters.wordType && filters.wordType.length > 0)
        ? filters.wordType.map((t) => String(t).toLowerCase())
        : null,
      filters: rpcFilters && rpcFilters.length ? rpcFilters : null,
      limit_count: 20,
      offset_count: 0,
      include_audio: true,
      include_translation_core: true,
      include_translation_optional: true,
      include_word_core: true,
      include_word_optional: true,
    };

    const { data, error } = await this.supabase.rpc('app_get_dictionary_listing', params);
    if (error) throw error;

    return (data || []).map((row) => this.transformListingRowToWord(row));
  }

  /**
   * Map UI filters to RPC EMV filters shape: [{ attribute, values: [] }, ...]
   * Word-level only. Translation-level filters are skipped for now.
   */
  mapUiFiltersToRpcFilters(filters = {}) {
    const out = [];

    // CEFR Level -> metaattr003 values like 'A1','A2','B1',...
    // Now includes advanced levels: native, academic, literary, specialized, business, regional
    if (filters.cefrLevel && typeof filters.cefrLevel === 'string' && filters.cefrLevel.trim()) {
      out.push({ attribute: 'metaattr003', values: [filters.cefrLevel.trim()] });
    }

    // Grammar/tags mapping
    const tagValues = Array.isArray(filters.tags) ? filters.tags : [];
    if (tagValues.length === 0) return out;

    const add = (attribute, value) => {
      if (!attribute || !value) return;
      const existing = out.find((f) => f.attribute === attribute);
      if (existing) {
        if (!existing.values.includes(value)) existing.values.push(value);
      } else {
        out.push({ attribute, values: [value] });
      }
    };

    // Conjugation Type (metaattr004): are/ere/ire/ire-isc
    const conjMap = {
      'are-conjugation': 'are',
      'ere-conjugation': 'ere',
      'ire-conjugation': 'ire',
      'ire-isc-conjugation': 'ire-isc',
    };
    // Frequency Tier (metaattr007): Hierarchical mapping
    // When user selects higher tier, include all lower tiers
    const getFrequencyTiers = (selectedTier) => {
      const tierHierarchy = {
        'freq-top100': ['top100'],
        'freq-top500': ['top100', 'top500'],
        'freq-top1000': ['top100', 'top500', 'top1000'],
        'freq-top2500': ['top100', 'top500', 'top1000', 'top2500'],
        'freq-top5000': ['top100', 'top500', 'top1000', 'top2500', 'top5000'],
        'freq-top10000': ['top100', 'top500', 'top1000', 'top2500', 'top5000', 'top10000'],
      };
      return tierHierarchy[selectedTier] || [];
    };
    // Gender (metaattr011): masculine/feminine/common
    const genderMap = {
      masculine: 'masculine',
      feminine: 'feminine',
      'common-gender': 'common-gender',
    };
    // Number: singolare/plurale  
    const numberMap = {
      singolare: 'singolare',
      plurale: 'plurale',
    };
    // Number Restriction (metaattr013): solo-singolare/solo-plurale
    const numberRestrictionMap = {
      'solo-singolare': 'solo-singolare',
      'solo-plurale': 'solo-plurale',
    };
    // Plural Formation (metaattr026): plural-e/plural-i/invariable/irregular
    const pluralMap = {
      'plural-e': 'plural-e',
      'plural-i': 'plural-i',
      'plural-invariable': 'invariable',
      'plural-irregular': 'irregular',
    };
    // Reflexive (metaattr017): reflexive
    const reflexiveMap = {
      'reflexive-verb': 'reflexive',
    };
    // Adverb Type (metaattr001): manner/time/place/quantity/frequency/etc.
    const adverbTypeMap = {
      'adverb-manner': 'manner',
      'adverb-time': 'time', 
      'adverb-place': 'place',
      'adverb-quantity': 'quantity',
      'adverb-frequency': 'frequency',
      'adverb-affirmation': 'affirmation',
      'adverb-doubt': 'doubt',
      'adverb-negation': 'negation',
      'adverb-interrogative': 'interrogative',
      'adverb-evaluation': 'evaluation',
      'adverb-emphasis': 'emphasis'
    };
    // Gradable (metaattr009): analytical-gradability/full-gradability/non-gradable
    const gradableMap = {
      'gradable-analytical': 'analytical-gradability',
      'gradable-full': 'full-gradability', 
      'gradable-none': 'non-gradable'
    };
    // Register (metaattr018): formal/casual/mixed (neutral excluded as default)
    const registerMap = {
      'register-formal': 'formal',
      'register-casual': 'casual',
      'register-mixed': 'mixed'
      // Note: 'register-neutral' intentionally excluded as it's the default
    };
    // Transitivity (metaattr020): transitive/intransitive/ambitransitive
    const transitivityMap = {
      'transitive-verb': 'transitive',
      'intransitive-verb': 'intransitive',
      'both-transitivity': 'ambitransitive'
    };
    // Reflexive Type (metaattr021): direct-reflexive/reciprocal
    const reflexiveTypeMap = {
      'reflexive-type-direct': 'direct-reflexive',
      'reflexive-type-reciprocal': 'reciprocal'
    };
    // Optional word topics (metaattr_opt_tag_word): topic-*
    const isTopic = (t) => t.startsWith('topic-');

    for (const t of tagValues) {
      if (conjMap[t]) add('metaattr004', conjMap[t]);
      else if (t.startsWith('freq-')) {
        // Handle hierarchical frequency tiers
        const tiers = getFrequencyTiers(t);
        tiers.forEach(tier => add('metaattr007', tier));
      }
      else if (genderMap[t]) add('metaattr011', genderMap[t]);
      else if (numberMap[t]) add('metaattr012', numberMap[t]);
      else if (numberRestrictionMap[t]) add('metaattr013', numberRestrictionMap[t]);
      else if (pluralMap[t]) add(ATTRIBUTES.PLURAL_FORMATION, pluralMap[t]);
      else if (reflexiveMap[t]) add('metaattr017', reflexiveMap[t]);
      else if (adverbTypeMap[t]) add('metaattr001', adverbTypeMap[t]);
      else if (gradableMap[t]) add('metaattr009', gradableMap[t]);
      else if (registerMap[t]) add('metaattr018', registerMap[t]);
      else if (transitivityMap[t]) add('metaattr020', transitivityMap[t]);
      else if (reflexiveTypeMap[t]) add('metaattr021', reflexiveTypeMap[t]);
      else if (t === 'avere-auxiliary') add('metaattr002', 'avere');
      else if (t === 'essere-auxiliary') add('metaattr002', 'essere');
      else if (t === 'irregular-pattern') add('metaattr005', 'irregular');
      else if (t === 'form-4') add('metaattr006', 'form-4');
      else if (t === 'form-2') add('metaattr006', 'form-2');
      else if (t === 'both-auxiliary') {
        // For "both auxiliary", we want words that have BOTH avere AND essere
        add('metaattr002', 'avere');
        add('metaattr002', 'essere');
      }
      else if (isTopic(t)) add('metaattr_opt_tag_word', t);
      // Skip translation-level only tags for now
    }

    return out;
  }

  /**
   * Transform a listing row to pass RPC data through directly.
   * WordCard now uses UUID-based RPC structure, so no complex mapping needed.
   */
  transformListingRowToWord(row) {
    const translations = Array.isArray(row.translations) ? row.translations : [];
    const word_translations = translations.map((tr) => ({
      id: tr.id,
      translation: tr.translation,
      display_priority: tr.display_priority,
      metadata: null,
      usage_notes: null,
      frequency_estimate: null,
      // Pass RPC tags through directly for new UUID-based system
      rpc_core: tr.core_tags || [],
      rpc_tags: tr.optional_tags || [],
    }));

    return {
      id: row.word_id,
      italian: row.italian,
      word_type: (row.word_type || '').toUpperCase(),
      audio_filename: row.audio_filename || null,
      ipa_pronunciation: row.ipa_pronunciation || null,
      
      // Pass RPC word core tags through directly
      word_core_tags: row.word_core_tags || [],
      word_optional_tags: row.word_optional_tags || [],
      
      // Legacy fields for backward compatibility (if needed)
      tags: [], // Now empty - WordCard uses word_core_tags directly
      aux_summary: '', // Can be computed from word_core_tags if needed
      
      word_translations,
    };
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
  // Sort translations by priority and enrich them for display
  processTranslationsForDisplay(translations) {
    if (!translations || translations.length === 0) return [];

    return translations
      .sort((a, b) => a.display_priority - b.display_priority)
      .map(translation => ({
        id: translation.id,
        translation: translation.translation,
        priority: translation.display_priority,
        isPrimary: translation.display_priority === 1,
        // In v3, translation context is stored in `metadata` jsonb
        contextInfo: translation.metadata || null,
        usageNotes: translation.usage_notes,
        frequencyEstimate: translation.frequency_estimate || 0.5,
        rpc_tags: translation.rpc_tags || []
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
      
      // Frequency now handled by RPC UUID system, legacy mappings removed
      
      // Advanced CEFR levels now handled by RPC UUID system, legacy mappings removed
      
      // SECONDARY TAGS - Detailed grammatical information
      // Conjugation type tags now handled by RPC UUID system, legacy mappings removed
      
      // Auxiliary Verbs - Now handled by RPC UUID system, legacy mappings removed
      
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
      // Use normalized listing (server-side) for search as well
      return await this.loadWordsViaListingRPC(searchTerm, {});
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
