export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Misti - Italian Learning</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
        <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap" rel="stylesheet" />
        
        {/* Environment Variables - Fixed injection */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
            window.SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
          `
        }} />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            body { font-family: 'Comic Neue', cursive; }
            
            /* Sketchy Effects */
            .sketchy {
              position: relative;
            }

            .sketchy::before {
              content: '';
              position: absolute;
              top: -1px;
              left: -1px;
              right: -1px;
              bottom: -1px;
              border: 2px solid currentColor;
              border-radius: inherit;
              opacity: 0.8;
            }

            /* Scribbled fill effect inside borders */
            .sketchy-fill::after {
              content: '';
              position: absolute;
              top: 2px;
              left: 2px;
              right: 2px;
              bottom: 2px;
              background: 
                repeating-linear-gradient(
                  23deg,
                  transparent,
                  transparent 1px,
                  currentColor 1px,
                  currentColor 1.5px,
                  transparent 1.5px,
                  transparent 4px
                ),
                repeating-linear-gradient(
                  67deg,
                  transparent,
                  transparent 1px,
                  currentColor 1px,
                  currentColor 1.5px,
                  transparent 1.5px,
                  transparent 6px
                );
              opacity: 0.05;
              border-radius: inherit;
              pointer-events: none;
            }

            /* Enhanced Tag Styling */
            .tag-essential, .tag-detailed {
              display: inline-block;
              font-size: 12px;
              font-weight: 600;
              padding: 4px 8px;
              border-radius: 9999px;
              margin: 1px;
              cursor: help;
              transform: rotate(0.8deg);
              transition: all 0.2s ease;
            }
            
            .tag-essential:nth-child(even), .tag-detailed:nth-child(even) {
              transform: rotate(-0.8deg);
            }

            .tag-essential:hover, .tag-detailed:hover {
              transform: rotate(0deg) scale(1.05);
            }

            /* PRIMARY TAGS - Filled backgrounds, consistent emojis across word types */
            .tag-primary-gender-masc { 
              background: #3b82f6; 
              color: white; 
              border: 1px solid #2563eb; 
            }
            .tag-primary-gender-fem { 
              background: #ec4899; 
              color: white; 
              border: 1px solid #db2777; 
            }
            .tag-primary-gender-common { 
              background: #8b5cf6; 
              color: white; 
              border: 1px solid #7c3aed; 
            }
            .tag-primary-level { 
              background: #f59e0b; 
              color: white; 
              border: 1px solid #d97706; 
            }
            .tag-primary-freq { 
              background: #f59e0b; 
              color: white; 
              border: 1px solid #d97706; 
            }
            .tag-primary-irregular { 
              background: #ef4444; 
              color: white; 
              border: 1px solid #dc2626; 
            }
            .tag-primary-isc { 
              background: #fbbf24; 
              color: #92400e; 
              border: 1px solid #f59e0b; 
            }

            /* WORD TYPE TAGS - Filled with word type colors */
            .word-card-verb .tag-word-type { 
              background: #14b8a6; 
              color: white; 
              border: 1px solid #0f766e;
            }
            .word-card-noun .tag-word-type { 
              background: #0891b2; 
              color: white; 
              border: 1px solid #0e7490;
            }
            .word-card-adjective .tag-word-type { 
              background: #3b82f6; 
              color: white; 
              border: 1px solid #2563eb;
            }
            .word-card-adverb .tag-word-type { 
              background: #8b5cf6; 
              color: white; 
              border: 1px solid #7c3aed;
            }

            /* SECONDARY TAGS - Unfilled, transparent background */
            .tag-secondary {
              background: transparent;
              color: currentColor;
              border: 1px solid currentColor;
              opacity: 0.8;
            }

            /* Enhanced Word Cards with Sketchy Styling */
            .word-card {
              transition: all 0.2s ease;
              transform: rotate(0.3deg);
              position: relative;
            }
            
            .word-card:nth-child(even) {
              transform: rotate(-0.3deg);
            }
            
            .word-card:hover {
              transform: rotate(0deg) translateY(-1px) scale(1.01);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            /* Word Type Specific Styling */
            .word-card-verb {
              background: #f0fdfa !important;
              border: 2px solid #5eead4 !important;
              color: #134e4a !important;
            }
            .word-card-noun {
              background: #ecfeff !important;
              border: 2px solid #67e8f9 !important;
              color: #164e63 !important;
            }
            .word-card-adjective {
              background: #eff6ff !important;
              border: 2px solid #93c5fd !important;
              color: #1e3a8a !important;
            }
            .word-card-adverb {
              background: #faf5ff !important;
              border: 2px solid #c4b5fd !important;
              color: #581c87 !important;
            }

            /* Audio Button Enhancements */
            .audio-btn {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              transform: rotate(0.5deg);
            }

            .audio-btn:hover {
              transform: rotate(-0.5deg) scale(1.1);
            }

            /* Audio Button Colors by Word Type */
            .word-card-verb .audio-btn {
              background: #14b8a6 !important;
              color: white !important;
              border: none;
            }
            .word-card-noun .audio-btn {
              background: #0891b2 !important;
              color: white !important;
              border: none;
            }
            .word-card-adjective .audio-btn {
              background: #3b82f6 !important;
              color: white !important;
              border: none;
            }
            .word-card-adverb .audio-btn {
              background: #8b5cf6 !important;
              color: white !important;
              border: none;
            }

            .audio-btn.premium-audio {
              border: 2px solid #FFD700 !important;
              box-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
            }

            .audio-btn svg {
              width: 14px;
              height: 14px;
            }

            /* Article Display with Diamonds */
            .article-display {
              font-weight: 600;
              font-size: 14px;
              color: #059669;
              margin-right: 4px;
              transform: rotate(-0.1deg);
            }

            /* Enhanced Form Elements */
            .search-input-sketchy {
              transform: rotate(-0.2deg);
              transition: all 0.2s ease;
            }

            .search-input-sketchy:focus {
              transform: rotate(0.2deg);
            }

            /* Button Enhancements */
            .btn-sketchy {
              transform: rotate(-0.5deg);
              transition: all 0.2s ease;
            }

            .btn-sketchy:hover {
              transform: rotate(0.5deg) scale(1.05);
            }

            /* Filter Chip Styling */
            .filter-chip {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              border: 1px solid #d1d5db;
              transform: rotate(0.5deg);
            }

            .filter-chip:nth-child(even) {
              transform: rotate(-0.5deg);
            }

            .filter-chip:hover {
              background-color: #f3f4f6;
              transform: rotate(0deg) scale(1.05);
            }
            
            .filter-chip.active {
              background-color: #0d9488;
              color: white;
              border-color: #0d9488;
            }

            /* Navigation Enhancements */
            .nav-title-sketchy {
              transform: rotate(-0.5deg);
            }

            .nav-btn-sketchy {
              transform: rotate(0.3deg);
              transition: all 0.2s ease;
            }

            .nav-btn-sketchy:hover {
              transform: rotate(-0.3deg);
            }

            /* Word Forms and Relationships */
            .word-forms-container {
              max-height: 0;
              overflow: hidden;
              transition: max-height 0.3s ease;
            }
            .word-forms-container.expanded {
              max-height: 300px;
            }
            .relationships-container {
              max-height: 0;
              overflow: hidden;
              transition: max-height 0.3s ease;
            }
            .relationships-container.expanded {
              max-height: 200px;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
              .tag-essential, .tag-detailed {
                font-size: 10px;
                padding: 3px 6px;
              }
              
              .audio-btn {
                width: 24px;
                height: 24px;
              }
              
              .audio-btn svg {
                width: 12px;
                height: 12px;
              }
            }
          `
        }} />
      </head>
      <body className="bg-gradient-to-br from-cyan-50 to-blue-50">
        <nav className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white nav-title-sketchy">Misti</h1>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  id="dictionary-btn"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-md btn-sketchy"
                >
                  📚 Dictionary
                </button>
                <button className="text-white hover:text-cyan-200 transition-colors nav-btn-sketchy">
                  My Decks
                </button>
                <button className="text-white hover:text-cyan-200 transition-colors nav-btn-sketchy">
                  Profile
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Enhanced Dictionary Slide-out Panel */}
        <div 
          id="dictionary-panel"
          className="fixed inset-y-0 right-0 w-96 md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out z-50"
          style={{ minWidth: '384px', maxWidth: '80vw' }}
        >
          {/* Resize Handle */}
          <div 
            id="resize-handle"
            className="absolute left-0 top-0 w-1 h-full bg-teal-300 cursor-ew-resize hover:bg-teal-400 transition-colors opacity-0 hover:opacity-100"
          ></div>
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-500">
              <h2 className="text-lg font-semibold text-white nav-title-sketchy">Dictionary</h2>
              <button 
                id="close-dictionary"
                className="text-white hover:text-cyan-200"
              >
                ✕
              </button>
            </div>

            {/* Enhanced Search Bar */}
            <div className="p-4 border-b bg-cyan-50">
              <div className="space-y-3">
                {/* Search Input */}
                <input
                  type="text"
                  id="dictionary-search"
                  placeholder="Search Italian words..."
                  className="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 search-input-sketchy"
                />
                
                {/* Filter Toggle */}
                <button id="toggle-filters" className="text-sm text-teal-600 hover:text-teal-800 flex items-center btn-sketchy">
                  <span className="mr-1">🔍</span> Advanced Filters
                  <span id="filter-arrow" className="ml-1 transform transition-transform">▼</span>
                </button>
                
                {/* Advanced Filters (initially hidden) */}
                <div id="advanced-filters" className="hidden space-y-3 pt-2 border-t border-teal-200">
                  {/* Word Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word Type</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="filter-chip active" data-filter="wordType" data-value="">All</span>
                      <span className="filter-chip" data-filter="wordType" data-value="NOUN">Noun</span>
                      <span className="filter-chip" data-filter="wordType" data-value="VERB">Verb</span>
                      <span className="filter-chip" data-filter="wordType" data-value="ADJECTIVE">Adjective</span>
                      <span className="filter-chip" data-filter="wordType" data-value="ADVERB">Adverb</span>
                    </div>
                  </div>
                  
                  {/* CEFR Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEFR Level</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="filter-chip active" data-filter="cefrLevel" data-value="">All Levels</span>
                      <span className="filter-chip" data-filter="cefrLevel" data-value="A1">A1</span>
                      <span className="filter-chip" data-filter="cefrLevel" data-value="A2">A2</span>
                      <span className="filter-chip" data-filter="cefrLevel" data-value="B1">B1</span>
                      <span className="filter-chip" data-filter="cefrLevel" data-value="B2">B2</span>
                      <span className="filter-chip" data-filter="cefrLevel" data-value="C1">C1</span>
                      <span className="filter-chip" data-filter="cefrLevel" data-value="C2">C2</span>
                    </div>
                  </div>
                  
                  {/* Dynamic Grammar Filter */}
                  <div id="grammar-filter-section">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grammar</label>
                    <div id="grammar-filters" className="flex flex-wrap gap-2 transition-all duration-300 ease-in-out">
                      {/* Universal grammar filters */}
                      <span className="filter-chip" data-filter="tags" data-value="irregular-pattern">Irregular</span>
                      <span className="filter-chip" data-filter="tags" data-value="CEFR-A1">A1 Level</span>
                      <span className="filter-chip" data-filter="tags" data-value="freq-top100">Top 100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dictionary Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <div id="dictionary-results">
                <div id="words-container" className="space-y-3">
                  {/* Enhanced words will be loaded here */}
                </div>
                <div id="loading" className="text-center py-4 text-teal-600">
                  Loading words...
                </div>
                <div id="no-results" className="text-center py-4 text-gray-500 hidden">
                  No words found
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div 
          id="dictionary-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 opacity-0 pointer-events-none transition-opacity duration-300"
        ></div>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* ENHANCED Dictionary System JavaScript with Sketchy Theme */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Enhanced Dictionary System Class with Sketchy Theme Support
            class EnhancedDictionarySystem {
              constructor(supabaseClient) {
                this.supabase = supabaseClient;
                this.cache = new Map();
                this.searchTimeout = null;
                this.currentSearchTerm = '';
                this.currentFilters = {};
                this.isLoading = false;
              }

              // Main method to load words with proper foreign key join
              async loadWords(searchTerm = '', filters = {}) {
                try {
                  this.isLoading = true;
                  
                  let query = this.supabase
                    .from('dictionary')
                    .select(\`
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
                    \`)
                    .order('italian', { ascending: true });

                  // Apply search filter
                  if (searchTerm) {
                    query = query.or(\`italian.ilike.%\${searchTerm}%,english.ilike.%\${searchTerm}%\`);
                  }

                  // Apply word type filter
                  if (filters.wordType && filters.wordType.length > 0) {
                    query = query.in('word_type', filters.wordType);
                  }

                  // Apply tag filters
                  if (filters.tags && filters.tags.length > 0) {
                    filters.tags.forEach(tag => {
                      query = query.contains('tags', [tag]);
                    });
                  }

                  // Apply CEFR level filter
                  if (filters.cefrLevel) {
                    query = query.contains('tags', [\`CEFR-\${filters.cefrLevel}\`]);
                  }

                  const { data: words, error } = await query.limit(20);

                  if (error) {
                    console.error('Supabase query error:', error);
                    throw error;
                  }

                  // Transform the data to ensure proper structure
                  const enhancedWords = await Promise.all(
                    words.map(word => this.enhanceWordData(word))
                  );

                  return enhancedWords;
                } catch (error) {
                  console.error('Error loading words:', error);
                  throw error;
                } finally {
                  this.isLoading = false;
                }
              }

              // Enhance individual word with articles, processed tags, and related data
              async enhanceWordData(word) {
                try {
                  const enhanced = { ...word };

                  // Generate articles for nouns
                  if (word.word_type === 'NOUN') {
                    enhanced.articles = this.generateArticles(word);
                  }

                  // Process tags into categories with sketchy theme support
                  enhanced.processedTags = this.processTagsForDisplay(word.tags, word.word_type);

                  // Get word forms if available
                  enhanced.forms = await this.getWordForms(word.id);

                  // Get related words
                  enhanced.relationships = await this.getRelatedWords(word.id);

                  return enhanced;
                } catch (error) {
                  console.error('Error enhancing word data for word:', word.id, error);
                  return {
                    ...word,
                    articles: null,
                    processedTags: { essential: [], detailed: [] },
                    forms: [],
                    relationships: []
                  };
                }
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

                // Generate articles using phonetic rules
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

              // Calculate definite article
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

              // Enhanced tag processing for sketchy theme with primary/secondary classification
              processTagsForDisplay(tags, wordType) {
                const essential = [];
                const detailed = [];

                const tagMap = {
                  // PRIMARY TAGS - Consistent across all word types, filled backgrounds
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
                  
                  // SECONDARY TAGS - Unfilled, consistent emojis across word types
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

                  // Plural patterns (detailed)
                  'plural-i': { display: '📝 plural-i', class: 'tag-secondary', essential: false, description: 'Forms plural by changing ending to -i' },
                  'plural-e': { display: '📄 plural-e', class: 'tag-secondary', essential: false, description: 'Forms plural by changing ending to -e' },
                  'plural-invariable': { display: '🔒 invariable', class: 'tag-secondary', essential: false, description: 'Identical singular and plural forms' },
                  
                  // Topics (detailed) - consistent emojis across all word types
                  'topic-place': { display: '🌍 place', class: 'tag-secondary', essential: false, description: 'Geographical locations or spaces' },
                  'topic-food': { display: '🍕 food', class: 'tag-secondary', essential: false, description: 'Food and drink vocabulary' },
                  'topic-bodypart': { display: '👁️ body', class: 'tag-secondary', essential: false, description: 'Parts of the body' },
                  'topic-profession': { display: '👩‍💼 job', class: 'tag-secondary', essential: false, description: 'Jobs and professional roles' },
                  'topic-abstract': { display: '💭 abstract', class: 'tag-secondary', essential: false, description: 'Concepts, ideas, and feelings' },
                  'topic-daily-life': { display: '🏡 daily', class: 'tag-secondary', essential: false, description: 'Everyday activities and household' },

                  // Form patterns (detailed)
                  'form-4': { display: '📋 form-4', class: 'tag-secondary', essential: false, description: 'Four distinct forms for gender/number' },
                  'form-2': { display: '📑 form-2', class: 'tag-secondary', essential: false, description: 'Two forms: -e for singular, -i for plural' },
                  'form-invariable': { display: '🔐 invariable', class: 'tag-secondary', essential: false, description: 'Form never changes' },
                  'type-gradable': { display: '📈 gradable', class: 'tag-secondary', essential: false, description: 'Can be intensified or compared' },

                  // Adverb types (detailed)
                  'type-manner': { display: '🎭 manner', class: 'tag-secondary', essential: false, description: 'Describes how action is performed' },
                  'type-time': { display: '⏰ time', class: 'tag-secondary', essential: false, description: 'Indicates when action occurs' },
                  'type-place': { display: '📍 place', class: 'tag-secondary', essential: false, description: 'Indicates where action occurs' },
                  'type-quantity': { display: '📊 quantity', class: 'tag-secondary', essential: false, description: 'Expresses how much or degree' },
                  'type-frequency': { display: '🔁 frequency', class: 'tag-secondary', essential: false, description: 'Indicates how often' },
                  'type-affirming': { display: '✅ affirming', class: 'tag-secondary', essential: false, description: 'Used to affirm or confirm' },
                  'type-negating': { display: '❌ negating', class: 'tag-secondary', essential: false, description: 'Used to negate or deny' },
                  'type-doubting': { display: '🤔 doubting', class: 'tag-secondary', essential: false, description: 'Expresses doubt or uncertainty' },
                  'type-interrogative': { display: '❔ question', class: 'tag-secondary', essential: false, description: 'Used to ask questions' }
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
                    class: 'word-card-verb',
                    text: 'text-teal-900'
                  },
                  'NOUN': {
                    class: 'word-card-noun',
                    text: 'text-cyan-900'
                  },
                  'ADJECTIVE': {
                    class: 'word-card-adjective',
                    text: 'text-blue-900'
                  },
                  'ADVERB': {
                    class: 'word-card-adverb',
                    text: 'text-purple-900'
                  }
                };

                return colors[wordType] || {
                  class: 'border-gray-200 bg-gray-50',
                  text: 'text-gray-900'
                };
              }
            }

            // Initialize Enhanced Dictionary System
            document.addEventListener('DOMContentLoaded', function() {
              // Supabase client with environment variables
              const SUPABASE_URL = window.SUPABASE_URL;
              const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
              
              if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.error('Missing Supabase environment variables');
                return;
              }
              
              // Create Supabase client for audio functions
              const { createClient } = supabase;
              const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

              // Initialize enhanced dictionary system
              const dictionarySystem = new EnhancedDictionarySystem(supabaseClient);

              // DOM elements
              const dictionaryBtn = document.getElementById('dictionary-btn');
              const dictionaryPanel = document.getElementById('dictionary-panel');
              const closeDictionary = document.getElementById('close-dictionary');
              const overlay = document.getElementById('dictionary-overlay');
              const searchInput = document.getElementById('dictionary-search');
              const wordsContainer = document.getElementById('words-container');
              const loading = document.getElementById('loading');
              const noResults = document.getElementById('no-results');
              const toggleFilters = document.getElementById('toggle-filters');
              const advancedFilters = document.getElementById('advanced-filters');
              const filterArrow = document.getElementById('filter-arrow');
              const resizeHandle = document.getElementById('resize-handle');

              // Current filters state
              let currentFilters = {
                wordType: [],
                cefrLevel: '',
                tags: []
              };

              // Grammar filter options by word type
              const grammarFiltersByType = {
                'NOUN': [
                  { value: 'masculine', label: 'Masculine ♂' },
                  { value: 'feminine', label: 'Feminine ♀' },
                  { value: 'common-gender', label: 'Common ⚥' },
                  { value: 'plural-i', label: 'Plural -i' },
                  { value: 'plural-e', label: 'Plural -e' },
                  { value: 'plural-invariable', label: 'Invariable' }
                ],
                'VERB': [
                  { value: 'are-conjugation', label: '-are verbs' },
                  { value: 'ere-conjugation', label: '-ere verbs' },
                  { value: 'ire-conjugation', label: '-ire verbs' },
                  { value: 'ire-isc-conjugation', label: '-isc verbs' },
                  { value: 'avere-auxiliary', label: 'Uses avere' },
                  { value: 'essere-auxiliary', label: 'Uses essere' },
                  { value: 'transitive-verb', label: 'Transitive' },
                  { value: 'intransitive-verb', label: 'Intransitive' }
                ],
                'ADJECTIVE': [
                  { value: 'form-4', label: '4 forms' },
                  { value: 'form-2', label: '2 forms' },
                  { value: 'form-invariable', label: 'Invariable' },
                  { value: 'type-gradable', label: 'Gradable' }
                ],
                'ADVERB': [
                  { value: 'type-manner', label: 'Manner' },
                  { value: 'type-time', label: 'Time' },
                  { value: 'type-place', label: 'Place' },
                  { value: 'type-quantity', label: 'Quantity' }
                ],
                'ALL': [
                  { value: 'irregular-pattern', label: 'Irregular ⚠️' },
                  { value: 'freq-top100', label: 'Top 100 ⭐' },
                  { value: 'freq-top500', label: 'Top 500 ⭐' },
                  { value: 'native', label: 'Native 🗣️' },
                  { value: 'business', label: 'Business 💼' }
                ]
              };

              // Update grammar filters based on selected word types
              function updateGrammarFilters() {
                const grammarContainer = document.getElementById('grammar-filters');
                const selectedTypes = currentFilters.wordType.length === 0 ? ['ALL'] : currentFilters.wordType;
                
                // Collect all applicable filters
                let applicableFilters = [];
                selectedTypes.forEach(type => {
                  if (grammarFiltersByType[type]) {
                    applicableFilters = applicableFilters.concat(grammarFiltersByType[type]);
                  }
                });
                
                // Always include universal filters
                applicableFilters = applicableFilters.concat(grammarFiltersByType['ALL']);
                
                // Remove duplicates
                const uniqueFilters = applicableFilters.filter((filter, index, self) => 
                  index === self.findIndex(f => f.value === filter.value)
                );
                
                // Animate transition
                grammarContainer.style.opacity = '0.5';
                grammarContainer.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                  grammarContainer.innerHTML = uniqueFilters
                    .map(filter => \`
                      <span class="filter-chip \${currentFilters.tags.includes(filter.value) ? 'active' : ''}" 
                            data-filter="tags" 
                            data-value="\${filter.value}">
                        \${filter.label}
                      </span>
                    \`)
                    .join('');
                  
                  grammarContainer.style.opacity = '1';
                  grammarContainer.style.transform = 'translateY(0)';
                }, 150);
              }

              // Resize functionality
              let isResizing = false;
              let startX = 0;
              let startWidth = 0;

              resizeHandle.addEventListener('mousedown', function(e) {
                isResizing = true;
                startX = e.clientX;
                startWidth = parseInt(window.getComputedStyle(dictionaryPanel, null).getPropertyValue('width'));
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
                dictionaryPanel.style.transition = 'none';
              });

              function handleResize(e) {
                if (!isResizing) return;
                const deltaX = startX - e.clientX;
                const newWidth = startWidth + deltaX;
                const minWidth = 384;
                const maxWidth = window.innerWidth * 0.8;
                
                if (newWidth >= minWidth && newWidth <= maxWidth) {
                  dictionaryPanel.style.width = newWidth + 'px';
                }
              }

              function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
                dictionaryPanel.style.transition = '';
              }

              async function openDictionary() {
                dictionaryPanel.classList.remove('translate-x-full');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                searchInput.focus();
                loadWords();
              }

              function closeDictionaryPanel() {
                dictionaryPanel.classList.add('translate-x-full');
                overlay.classList.add('opacity-0', 'pointer-events-none');
              }

              // Filter toggle
              toggleFilters.addEventListener('click', function() {
                const isHidden = advancedFilters.classList.contains('hidden');
                if (isHidden) {
                  advancedFilters.classList.remove('hidden');
                  filterArrow.style.transform = 'rotate(180deg)';
                } else {
                  advancedFilters.classList.add('hidden');
                  filterArrow.style.transform = 'rotate(0deg)';
                }
              });

              // Filter chips handling
              document.addEventListener('click', function(e) {
                if (e.target.classList.contains('filter-chip')) {
                  const filterType = e.target.dataset.filter;
                  const filterValue = e.target.dataset.value;
                  
                  if (filterType === 'wordType') {
                    // Handle multi-select for word types
                    if (filterValue === '') {
                      // "All" selected - clear all others
                      const siblings = e.target.parentElement.querySelectorAll('.filter-chip');
                      siblings.forEach(chip => chip.classList.remove('active'));
                      e.target.classList.add('active');
                      currentFilters.wordType = [];
                    } else {
                      // Specific type selected
                      const allChip = e.target.parentElement.querySelector('[data-value=""]');
                      allChip.classList.remove('active');
                      
                      // Toggle this chip
                      if (currentFilters.wordType.includes(filterValue)) {
                        currentFilters.wordType = currentFilters.wordType.filter(type => type !== filterValue);
                        e.target.classList.remove('active');
                      } else {
                        currentFilters.wordType.push(filterValue);
                        e.target.classList.add('active');
                      }
                      
                      // If no types selected, activate "All"
                      if (currentFilters.wordType.length === 0) {
                        allChip.classList.add('active');
                      }
                    }
                    
                    // Update grammar filters based on word type selection
                    updateGrammarFilters();
                    
                  } else if (filterType === 'tags') {
                    // Handle multi-select for tags
                    if (currentFilters.tags.includes(filterValue)) {
                      currentFilters.tags = currentFilters.tags.filter(tag => tag !== filterValue);
                      e.target.classList.remove('active');
                    } else {
                      currentFilters.tags.push(filterValue);
                      e.target.classList.add('active');
                    }
                    
                  } else {
                    // Handle single-select for CEFR level
                    const siblings = e.target.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(chip => chip.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilters[filterType] = filterValue;
                  }
                  
                  // Reload words with new filters
                  loadWords(searchInput.value);
                }
              });

              // Load and display words
              async function loadWords(searchTerm = '') {
                loading.classList.remove('hidden');
                wordsContainer.innerHTML = '';
                noResults.classList.add('hidden');

                try {
                  const words = await dictionarySystem.loadWords(searchTerm, currentFilters);
                  loading.classList.add('hidden');

                  if (words.length === 0) {
                    noResults.classList.remove('hidden');
                    return;
                  }

                  words.forEach(word => {
                    const wordElement = createEnhancedWordElement(word);
                    wordsContainer.appendChild(wordElement);
                  });
                  setupMobileTagTooltips();

                } catch (error) {
                  console.error('Error loading words:', error);
                  loading.classList.add('hidden');
                  noResults.textContent = 'Error loading words';
                  noResults.classList.remove('hidden');
                }
              }

              // Enhanced word element creation with sketchy theme
              function createEnhancedWordElement(word) {
                const div = document.createElement('div');
                const colors = dictionarySystem.getWordTypeColors(word.word_type);
                
                div.className = \`word-card \${colors.class} rounded-lg p-4 transition-colors sketchy-fill\`;
                
                // Audio detection with proper null checking
                console.log('DEBUG: createEnhancedWordElement - word.word_audio_metadata:', word.word_audio_metadata);
                
                const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
                  ? word.word_audio_metadata[0] 
                  : null;
                  
                console.log('DEBUG: createEnhancedWordElement - audioMetadata:', audioMetadata);
                
                const hasPremiumAudio = audioMetadata && audioMetadata.audio_filename && audioMetadata.audio_filename.trim() !== '';
                const audioFilename = hasPremiumAudio ? audioMetadata.audio_filename : null;
                
                console.log('DEBUG: createEnhancedWordElement - hasPremiumAudio:', hasPremiumAudio, 'audioFilename:', audioFilename);

                // Build article display for nouns with diamond separators
                let articleDisplay = '';
                if (word.word_type === 'NOUN' && word.articles) {
                  articleDisplay = \`
                    <div class="article-display mb-2">
                      \${word.articles.singular} • \${word.articles.plural} • \${word.articles.indefinite.singular}
                    </div>
                  \`;
                }
                
                // Build essential tags (primary tags)
                const essentialTags = word.processedTags.essential
                  .map(tag => \`<span class="tag-essential \${tag.class}" title="\${tag.description}">\${tag.display}</span>\`)
                  .join(' ');
                
                // Build detailed tags (secondary tags)
                const detailedTags = word.processedTags.detailed
                  .map(tag => \`<span class="tag-detailed \${tag.class}" title="\${tag.description}">\${tag.display}</span>\`)
                  .join(' ');
                
                // Build word forms section
                let formsSection = '';
                if (word.forms && word.forms.length > 0) {
                  const formsPreview = word.forms.slice(0, 3)
                    .map(form => \`<span class="text-xs bg-gray-100 px-2 py-1 rounded">\${form.form_text}</span>\`)
                    .join(' ');
                  
                  formsSection = \`
                    <div class="mt-2">
                      <button class="text-xs text-blue-600 hover:text-blue-800 toggle-forms btn-sketchy" data-word-id="\${word.id}">
                        📝 \${word.forms.length} forms \${formsPreview}
                      </button>
                      <div class="word-forms-container mt-2" id="forms-\${word.id}">
                        <div class="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded">
                          \${word.forms.map(form => \`
                            <div class="text-xs">
                              <strong>\${form.form_text}</strong>
                              \${form.translation ? \`<br><span class="text-gray-600">\${form.translation}</span>\` : ''}
                              \${form.form_mood || form.form_tense ? \`<br><span class="text-gray-500">\${[form.form_mood, form.form_tense, form.form_person, form.form_number].filter(Boolean).join(' ')}</span>\` : ''}
                            </div>
                          \`).join('')}
                        </div>
                      </div>
                    </div>
                  \`;
                }
                
                // Build relationships section
                let relationshipsSection = '';
                if (word.relationships && word.relationships.length > 0) {
                  relationshipsSection = \`
                    <div class="mt-2">
                      <button class="text-xs text-purple-600 hover:text-purple-800 toggle-relationships btn-sketchy" data-word-id="\${word.id}">
                        🔗 \${word.relationships.length} related words
                      </button>
                      <div class="relationships-container mt-2" id="relationships-\${word.id}">
                        <div class="p-3 bg-purple-50 rounded">
                          \${word.relationships.map(rel => \`
                            <div class="text-xs mb-1">
                              <strong>\${rel.italian}</strong> 
                              <span class="text-gray-600">(\${rel.english})</span>
                              <br><span class="text-purple-600">\${rel.relationship_type.replace('-', ' ')}</span>
                            </div>
                          \`).join('')}
                        </div>
                      </div>
                    </div>
                  \`;
                }
                
                div.innerHTML = \`
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      \${articleDisplay}
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-xl font-semibold \${colors.text}">\${word.italian}</h3>
                        <button 
                          class="audio-btn \${hasPremiumAudio ? 'premium-audio' : ''}"
                          onclick="playAudio('\${word.id}', '\${word.italian}', \${audioFilename ? \`'\${audioFilename}'\` : 'null'})"
                          title="\${hasPremiumAudio ? 'Play premium audio' : 'Play pronunciation'}"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        \${essentialTags}
                      </div>
                      <p class="text-base \${colors.text} opacity-80 mb-3">\${word.english}</p>
                      <div class="flex flex-wrap gap-1 mb-2">
                        <span class="tag-essential tag-word-type">
                          \${word.word_type.toLowerCase()}
                        </span>
                        \${detailedTags}
                      </div>
                      \${formsSection}
                      \${relationshipsSection}
                    </div>
                    <button class="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4 btn-sketchy">
                      + Add
                    </button>
                  </div>
                \`;
                
                return div;
              }

              // Toggle word forms display
              document.addEventListener('click', function(e) {
                if (e.target.classList.contains('toggle-forms')) {
                  const wordId = e.target.dataset.wordId;
                  const container = document.getElementById(\`forms-\${wordId}\`);
                  container.classList.toggle('expanded');
                }
                
                if (e.target.classList.contains('toggle-relationships')) {
                  const wordId = e.target.dataset.wordId;
                  const container = document.getElementById(\`relationships-\${wordId}\`);
                  container.classList.toggle('expanded');
                }
              });

              let searchTimeout;
              searchInput.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                  loadWords(e.target.value);
                }, 300);
              });

              dictionaryBtn.addEventListener('click', openDictionary);
              closeDictionary.addEventListener('click', closeDictionaryPanel);
              overlay.addEventListener('click', closeDictionaryPanel);

              // Initialize grammar filters on page load
              updateGrammarFilters();

              // Enhanced audio playback function with proper error handling
              async function playAudio(wordId, italianText, audioFilename) {
                const audioBtn = event.target.closest('button');
                const originalHTML = audioBtn.innerHTML;
                
                console.log('DEBUG: playAudio called - wordId:', wordId, 'italianText:', italianText, 'audioFilename:', audioFilename);
                console.log('DEBUG: audioFilename type:', typeof audioFilename, 'value:', audioFilename);
                
                // Show loading state
                audioBtn.innerHTML = \`
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                \`;
                audioBtn.disabled = true;

                try {
                  // More robust check for premium audio file
                  const hasValidAudioFile = audioFilename && 
                                          audioFilename !== 'null' && 
                                          audioFilename !== null && 
                                          audioFilename.trim() !== '' &&
                                          typeof audioFilename === 'string';
                  
                  console.log('DEBUG: hasValidAudioFile:', hasValidAudioFile);
                  
                  if (hasValidAudioFile) {
                    console.log(\`DEBUG: Attempting to create signed URL for: \${audioFilename}\`);
                    
                    // Try both possible bucket names to be safe
                    let urlData, urlError;
                    
                    // First try 'word-audio'
                    const result1 = await supabaseClient
                      .storage
                      .from('word-audio')
                      .createSignedUrl(audioFilename, 60);
                    
                    if (result1.data && result1.data.signedUrl) {
                      urlData = result1.data;
                      urlError = null;
                    } else {
                      // Try 'audio-files' as fallback
                      const result2 = await supabaseClient
                        .storage
                        .from('audio-files')
                        .createSignedUrl(audioFilename, 60);
                      
                      urlData = result2.data;
                      urlError = result2.error;
                    }

                    if (urlData && urlData.signedUrl) {
                      console.log('DEBUG: Successfully created signed URL. Playing audio.');
                      const audio = new Audio(urlData.signedUrl);
                      
                      audio.onended = () => {
                        audioBtn.innerHTML = originalHTML;
                        audioBtn.disabled = false;
                      };
                      
                      audio.onerror = (e) => {
                        console.error('DEBUG: Error playing pregenerated audio from URL:', e);
                        fallbackToTTS(italianText, audioBtn, originalHTML);
                      };
                      
                      await audio.play();
                      return;
                    } else {
                       console.error('DEBUG: Error creating signed URL:', urlError);
                    }
                  }
                  
                  // Fallback to TTS
                  console.log('DEBUG: No valid audioFilename. Falling back to TTS.');
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                  
                } catch (error) {
                  console.error('DEBUG: General error in playAudio function:', error);
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                }
              }

              // Improved TTS fallback function with iOS support
              function fallbackToTTS(text, audioBtn, originalHTML) {
                console.log('DEBUG: Using TTS fallback for:', text);
                
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(text);
                  
                  const setItalianVoice = (voices) => {
                    const italianVoices = voices.filter(voice => 
                      voice.lang.startsWith('it') || 
                      voice.lang.includes('IT') || 
                      voice.name.toLowerCase().includes('ital')
                    );
                    
                    if (italianVoices.length > 0) {
                      const preferredVoice = italianVoices.find(voice => 
                        voice.name.includes('Luca') || 
                        voice.name.includes('Alice') ||  
                        voice.name.includes('Federica') || 
                        voice.name.includes('Italia')
                      ) || italianVoices[0];
                      
                      utterance.voice = preferredVoice;
                    }
                    
                    utterance.lang = 'it-IT';
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                  };
                  
                  const speakText = () => {
                    utterance.onend = () => {
                      audioBtn.innerHTML = originalHTML;
                      audioBtn.disabled = false;
                    };
                    
                    utterance.onerror = (event) => {
                      console.error('DEBUG: Speech synthesis error:', event);
                      audioBtn.innerHTML = originalHTML;
                      audioBtn.disabled = false;
                    };
                    
                    speechSynthesis.cancel();
                    setTimeout(() => speechSynthesis.speak(utterance), 100);
                  };
                  
                  let voices = speechSynthesis.getVoices();
                  
                  if (voices.length === 0) {
                    speechSynthesis.onvoiceschanged = () => {
                      voices = speechSynthesis.getVoices();
                      setItalianVoice(voices);
                      speakText();
                    };
                    speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                    speechSynthesis.cancel();
                  } else {
                    setItalianVoice(voices);
                    speakText();
                  }
                } else {
                  console.error('DEBUG: Speech synthesis not supported');
                  audioBtn.innerHTML = originalHTML;
                  audioBtn.disabled = false;
                }
              }
              
              function showAudioError(audioBtn, originalHTML) {
                audioBtn.innerHTML = \`
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-red-500">
                    <path d="M12 2C6.47 2 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                  </svg>
                \`;
                setTimeout(() => {
                  audioBtn.innerHTML = originalHTML;
                  audioBtn.disabled = false;
                }, 2000);
              }

              // Initialize voices for mobile
              function initializeVoices() {
                if ('speechSynthesis' in window) {
                  speechSynthesis.onvoiceschanged = () => {
                    console.log('🔄 Voices loaded:', speechSynthesis.getVoices().length);
                  };
                  speechSynthesis.getVoices();
                }
              }
              
              initializeVoices();

              // Make functions global for onclick handlers
              window.playAudio = playAudio;

              // Mobile-friendly tag tooltips
              function setupMobileTagTooltips() {
                if (!document.getElementById('mobile-tooltip')) {
                  const tooltip = document.createElement('div');
                  tooltip.id = 'mobile-tooltip';
                  tooltip.className = 'fixed hidden bg-gray-800 text-white text-xs rounded px-2 py-1 z-50 max-w-xs';
                  tooltip.style.pointerEvents = 'none';
                  document.body.appendChild(tooltip);
                }
                
                document.addEventListener('click', function(e) {
                  const tag = e.target.closest('.tag-essential, .tag-detailed');
                  const tooltip = document.getElementById('mobile-tooltip');
                  
                  if (tag && tag.title) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const rect = tag.getBoundingClientRect();
                    tooltip.textContent = tag.title;
                    tooltip.style.left = rect.left + 'px';
                    tooltip.style.top = (rect.top - 30) + 'px';
                    tooltip.classList.remove('hidden');
                    
                    setTimeout(() => {
                      tooltip.classList.add('hidden');
                    }, 3000);
                  } else if (!tag) {
                    tooltip.classList.add('hidden');
                  }
                });
              }

              setupMobileTagTooltips();
              window.setupMobileTagTooltips = setupMobileTagTooltips;
              window.dictionarySystem = dictionarySystem;
            });
          `
        }} />
      </body>
    </html>
  )
}