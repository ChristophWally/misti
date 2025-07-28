// lib/enhanced-dictionary-system.js
// Enhanced Dictionary System for Misti Italian Learning App
// Integrates with the comprehensive tagging database structure

export class EnhancedDictionarySystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
    this.searchTimeout = null;
  }

  // Enhanced word loading with article generation and comprehensive tags
  async loadWords(searchTerm = '', filters = {}) {
    try {
      let query = this.supabase
        .from('dictionary')
        .select(`
          id,
          italian,
          english,
          word_type,
          tags,
          created_at,
          word_audio_metadata(
            id,
            audio_filename,
            azure_voice_name,
            duration_seconds
          )
        `)
        .order('italian', { ascending: true });
      // Apply search filter
      if (searchTerm) {
        query = query.or(`italian.ilike.%${searchTerm}%,english.ilike.%${searchTerm}%`);
      }

      // Apply word type filter
      if (filters.wordType) {
        query = query.eq('word_type', filters.wordType);
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

      // Enhance words with article generation and processed tags
      const enhancedWords = await Promise.all(
        words.map(word => this.enhanceWordData(word))
      );

      return enhancedWords;
    } catch (error) {
      console.error('Error loading words:', error);
      throw error;
    }
  }

  // Enhance individual word with articles, processed tags, and related data
  async enhanceWordData(word) {
    const enhanced = { ...word };

    // Generate articles for nouns
    if (word.word_type === 'NOUN') {
      enhanced.articles = this.generateArticles(word);
    }

    // Process tags into categories
    enhanced.processedTags = this.processTagsForDisplay(word.tags, word.word_type);

    // Get word forms if available
    enhanced.forms = await this.getWordForms(word.id);

    // Get related words
    enhanced.relationships = await this.getRelatedWords(word.id);

    return enhanced;
  }

  // Generate Italian articles based on tags and phonetic rules
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

  // Calculate definite article (matches SQL function logic)
  calculateArticle(word, gender, isPlural) {
    const firstChar = word.charAt(0);
    const firstTwo = word.substring(0, 2);
    const consonantAfterS = word.length > 1 && /[bcdfghjklmnpqrstvwxyz]/.test(word.charAt(1));

    if (isPlural) {
      if (gender === 'masculine') {
        // Plural masculine: gli or i
        if (/[aeiou]/.test(firstChar) || 
            ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
            (firstChar === 's' && consonantAfterS)) {
          return 'gli';
        }
        return 'i';
      } else {
        // Plural feminine: always le
        return 'le';
      }
    } else {
      // Singular
      if (gender === 'masculine') {
        // Singular masculine: lo or il
        if (/[aeiou]/.test(firstChar) || 
            ['gn','ps','sc','sp','st','x','z'].includes(firstTwo) ||
            (firstChar === 's' && consonantAfterS)) {
          return 'lo';
        }
        return 'il';
      } else {
        // Singular feminine: la or l'
        if (/[aeiou]/.test(firstChar)) {
          return "l'";
        }
        return 'la';
      }
    }
  }

  // Calculate indefinite article
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

  // Process tags for visual display with comprehensive tag system
  processTagsForDisplay(tags, wordType) {
    const essential = [];
    const detailed = [];

    const tagMap = {
      // Gender (essential for nouns)
      'masculine': { display: '♂', class: 'bg-blue-100 text-blue-800', essential: wordType === 'NOUN', description: 'Masculine gender requiring masculine articles (il, un)' },
      'feminine': { display: '♀', class: 'bg-pink-100 text-pink-800', essential: wordType === 'NOUN', description: 'Feminine gender requiring feminine articles (la, una)' },
      'common-gender': { display: '⚥', class: 'bg-purple-100 text-purple-800', essential: wordType === 'NOUN', description: 'Same form for both genders, determined by article' },
      
      // Irregularity (essential when present)
      'irregular-pattern': { display: '⚠️ IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Does not follow standard patterns' },
      'form-irregular': { display: '⚠️ IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Special rules or position-dependent forms' },
      
      // ISC Conjugation (essential for verbs)
      'ire-isc-conjugation': { display: '-ISC', class: 'bg-yellow-100 text-yellow-800', essential: wordType === 'VERB', description: 'Uses -isc- infix in present forms' },
      
      // CEFR Levels (essential)
      'CEFR-A1': { display: '📚 A1', class: 'bg-green-100 text-green-800', essential: true, description: 'Beginner level vocabulary' },
      'CEFR-A2': { display: '📚 A2', class: 'bg-green-100 text-green-800', essential: true, description: 'Elementary level vocabulary' },
      'CEFR-B1': { display: '📚 B1', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Intermediate level vocabulary' },
      'CEFR-B2': { display: '📚 B2', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Upper intermediate vocabulary' },
      'CEFR-C1': { display: '📚 C1', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Advanced level vocabulary' },
      'CEFR-C2': { display: '📚 C2', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Proficiency level vocabulary' },
      
      // Frequency (essential)
      'freq-top100': { display: '⭐ 100', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 100 most frequent words' },
      'freq-top200': { display: '⭐ 200', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 200 most frequent words' },
      'freq-top300': { display: '⭐ 300', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 300 most frequent words' },
      'freq-top500': { display: '⭐ 500', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 500 most frequent words' },
      'freq-top1000': { display: '⭐ 1K', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 1000 most frequent words' },
      'freq-top5000': { display: '⭐ 5K', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 5000 most frequent words' },
      
      // Advanced Fluency (essential)
      'native': { display: '🗣️ NAT', class: 'bg-indigo-100 text-indigo-800', essential: true, description: 'Natural native-speaker vocabulary' },
      'business': { display: '💼 BIZ', class: 'bg-gray-100 text-gray-800', essential: true, description: 'Professional/commercial terminology' },
      'academic': { display: '🎓 ACAD', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Scholarly and technical vocabulary' },
      'literary': { display: '📜 LIT', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Literary and artistic language' },
      'regional': { display: '🗺️ REG', class: 'bg-green-100 text-green-800', essential: true, description: 'Regional dialects and variants' },
      
      // Conjugation Groups (detailed)
      'are-conjugation': { display: '🔸 -are', class: 'bg-teal-100 text-teal-800', essential: false, description: 'First conjugation group' },
      'ere-conjugation': { display: '🔹 -ere', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Second conjugation group' },
      'ire-conjugation': { display: '🔶 -ire', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Third conjugation group' },
      
      // Auxiliary Verbs (detailed)
      'avere-auxiliary': { display: '🤝 avere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses avere in compound tenses' },
      'essere-auxiliary': { display: '🫱 essere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses essere in compound tenses' },
      'both-auxiliary': { display: '🤜🤛 both', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Can use either auxiliary' },
      
      // Transitivity (detailed)
      'transitive-verb': { display: '➡️ trans', class: 'bg-green-100 text-green-800', essential: false, description: 'Takes a direct object' },
      'intransitive-verb': { display: '↩️ intrans', class: 'bg-green-100 text-green-800', essential: false, description: 'Does not take direct object' },
      'both-transitivity': { display: '↔️ both', class: 'bg-green-100 text-green-800', essential: false, description: 'Can be both transitive and intransitive' },

      // Plural patterns (detailed)
      'plural-i': { display: '📝 plural-i', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Forms plural by changing ending to -i' },
      'plural-e': { display: '📄 plural-e', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Forms plural by changing ending to -e' },
      'plural-invariable': { display: '🔒 invariable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Identical singular and plural forms' },
      
      // Topics (detailed)
      'topic-place': { display: '🌍 place', class: 'bg-emerald-100 text-emerald-800', essential: false, description: 'Geographical locations or spaces' },
      'topic-food': { display: '🍕 food', class: 'bg-orange-100 text-orange-800', essential: false, description: 'Food and drink vocabulary' },
      'topic-bodypart': { display: '👁️ body', class: 'bg-pink-100 text-pink-800', essential: false, description: 'Parts of the body' },
      'topic-profession': { display: '👩‍💼 job', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Jobs and professional roles' },
      'topic-abstract': { display: '💭 abstract', class: 'bg-purple-100 text-purple-800', essential: false, description: 'Concepts, ideas, and feelings' },
      'topic-daily-life': { display: '🏡 daily', class: 'bg-green-100 text-green-800', essential: false, description: 'Everyday activities and household' }
    };

    tags.forEach(tag => {
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

  // Get word forms (conjugations, plurals, etc.)
  async getWordForms(wordId) {
    try {
      const { data: forms, error } = await this.supabase
        .from('word_forms')
        .select('*')
        .eq('word_id', wordId)
        .order('form_type');

      if (error) throw error;
      return forms || [];
    } catch (error) {
      console.error('Error loading word forms:', error);
      return [];
    }
  }

  // Get related words (morphological relationships)
  async getRelatedWords(wordId) {
    try {
      const { data: relationships, error } = await this.supabase
        .rpc('get_related_words', { word_id: wordId });

      if (error) throw error;
      return relationships || [];
    } catch (error) {
      console.error('Error loading related words:', error);
      return [];
    }
  }

  // Get word type color scheme
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
