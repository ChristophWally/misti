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
            body { 
              font-family: 'Comic Neue', cursive; 
            }
            
            /* Sketchy border effects - hard lines with scribbled fill */
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

            /* Scribbled fill effect inside the border */
            .sketchy::after {
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
            
            /* Enhanced tag styles with proper hierarchy */
            .tag-essential, .tag-detailed {
              display: inline-block;
              font-size: 12px;
              font-weight: 600;
              padding: 4px 8px;
              border-radius: 9999px;
              margin: 1px;
              cursor: help;
              transition: all 0.2s ease;
              transform: rotate(0.8deg);
            }
            
            .tag-essential:nth-child(even), .tag-detailed:nth-child(even) {
              transform: rotate(-0.8deg);
            }
            
            .tag-essential:hover, .tag-detailed:hover {
              transform: rotate(0deg) scale(1.05);
            }
            
            /* PRIMARY TAGS - All use same emojis and are FILLED */
            .tag-essential {
              border: 1px solid rgba(0,0,0,0.2);
              color: white;
              font-weight: 700;
            }
            
            /* Gender tags */
            .tag-essential.bg-blue-100 { background: #3b82f6 !important; color: white !important; border-color: #2563eb; }
            .tag-essential.bg-pink-100 { background: #ec4899 !important; color: white !important; border-color: #db2777; }
            .tag-essential.bg-purple-100 { background: #8b5cf6 !important; color: white !important; border-color: #7c3aed; }
            
            /* Level and frequency tags */
            .tag-essential.bg-green-100, .tag-essential.bg-yellow-100 { 
              background: #f59e0b !important; 
              color: white !important; 
              border-color: #d97706; 
            }
            
            /* Irregular tags */
            .tag-essential.bg-red-100 { background: #ef4444 !important; color: white !important; border-color: #dc2626; }
            
            /* Advanced fluency tags */
            .tag-essential.bg-indigo-100 { background: #6366f1 !important; color: white !important; border-color: #4f46e5; }
            .tag-essential.bg-gray-100 { background: #6b7280 !important; color: white !important; border-color: #4b5563; }
            
            /* WORD TYPE TAGS - Filled with word type colors */
            .word-card.bg-teal-50 .tag-detailed.bg-teal-100 { 
              background: #14b8a6 !important; 
              color: white !important; 
              border-color: #0f766e !important;
            }
            .word-card.bg-cyan-50 .tag-detailed.bg-cyan-100 { 
              background: #0891b2 !important; 
              color: white !important; 
              border-color: #0e7490 !important;
            }
            .word-card.bg-blue-50 .tag-detailed.bg-blue-100 { 
              background: #3b82f6 !important; 
              color: white !important; 
              border-color: #2563eb !important;
            }
            .word-card.bg-purple-50 .tag-detailed.bg-purple-100 { 
              background: #8b5cf6 !important; 
              color: white !important; 
              border-color: #7c3aed !important;
            }
            
            /* SECONDARY TAGS - Unfilled, transparent background */
            .tag-detailed:not(.bg-teal-100):not(.bg-cyan-100):not(.bg-blue-100):not(.bg-purple-100) {
              background: transparent !important;
              color: currentColor !important;
              border: 1px solid currentColor !important;
              opacity: 0.8;
            }
            
            .word-card {
              transition: all 0.3s ease;
              transform: rotate(0.3deg);
              position: relative;
            }
            
            .word-card:nth-child(even) {
              transform: rotate(-0.3deg);
            }
            
            .word-card:hover {
              transform: rotate(0deg) translateY(-2px) scale(1.01);
              box-shadow: 0 8px 25px rgba(0,0,0,0.12);
            }
            
            /* Audio button styling with word type colors */
            .audio-btn {
              transition: all 0.2s ease;
              transform: rotate(0.5deg);
              width: 32px !important;
              height: 32px !important;
            }
            
            .audio-btn:hover {
              transform: rotate(-0.5deg) scale(1.1);
            }
            
            .audio-btn svg {
              width: 14px !important;
              height: 14px !important;
            }
            
            /* Audio button colors by word type */
            .word-card.bg-teal-50 .audio-btn {
              background: #14b8a6 !important;
              color: white !important;
            }
            .word-card.bg-cyan-50 .audio-btn {
              background: #0891b2 !important;
              color: white !important;
            }
            .word-card.bg-blue-50 .audio-btn {
              background: #3b82f6 !important;
              color: white !important;
            }
            .word-card.bg-purple-50 .audio-btn {
              background: #8b5cf6 !important;
              color: white !important;
            }
            
            .audio-btn.premium-audio {
              border: 2px solid #FFD700 !important;
              box-shadow: 0 0 8px rgba(255, 215, 0, 0.4) !important;
            }
            
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
            
            /* Articles display with diamond separators */
            .article-display {
              font-weight: 600;
              font-size: 14px;
              color: #059669;
              margin-right: 4px;
              transform: rotate(-0.1deg);
            }
            
            /* Add sketchy effects to inputs and buttons */
            .search-input {
              transition: all 0.2s ease;
            }
            
            .search-input:focus {
              transform: rotate(-0.2deg);
            }
            
            /* Navigation button effects */
            .nav-btn {
              transition: all 0.2s ease;
              transform: rotate(0.3deg);
            }
            
            .nav-btn:hover {
              transform: rotate(-0.3deg) scale(1.02);
            }
            
            .nav-btn.primary {
              transform: rotate(-0.8deg);
            }
            
            .nav-btn.primary:hover {
              transform: rotate(0.8deg) scale(1.05);
            }
            
            /* Add button styling */
            .add-btn {
              transition: all 0.2s ease;
              transform: rotate(-0.5deg);
            }
            
            .add-btn:hover {
              transform: rotate(0.5deg) scale(1.05);
            }
            
            /* Panel title styling */
            .dictionary-title {
              transform: rotate(-0.3deg);
            }
            
            /* Close button effects */
            .close-btn:hover {
              transform: rotate(15deg);
            }
            
            /* Word title styling */
            .word-italian {
              transform: rotate(-0.2deg);
            }
            
            .word-english {
              transform: rotate(0.1deg);
            }
            
            /* Filter toggle styling */
            .filter-toggle {
              transform: rotate(0.2deg);
              transition: all 0.2s ease;
            }
            
            .filter-toggle:hover {
              transform: rotate(-0.2deg);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
              .tag-essential, .tag-detailed {
                font-size: 10px;
                padding: 3px 6px;
              }
              
              .audio-btn {
                width: 28px !important;
                height: 28px !important;
              }
              
              .audio-btn svg {
                width: 12px !important;
                height: 12px !important;
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
                <h1 className="text-xl font-bold text-white">Misti</h1>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  id="dictionary-btn"
                  className="nav-btn primary bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-md"
                >
                  📚 Dictionary
                </button>
                <button className="nav-btn text-white hover:text-cyan-200 transition-colors">
                  My Decks
                </button>
                <button className="nav-btn text-white hover:text-cyan-200 transition-colors">
                  Profile
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Enhanced Dictionary Slide-out Panel */}
        <div 
          id="dictionary-panel"
          className="fixed inset-y-0 right-0 w-96 md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out z-50 sketchy"
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
              <h2 className="dictionary-title text-lg font-semibold text-white">Dictionary</h2>
              <button 
                id="close-dictionary"
                className="close-btn text-white hover:text-cyan-200 transition-all"
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
                  className="search-input w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sketchy"
                />
                
                {/* Filter Toggle */}
                <button id="toggle-filters" className="filter-toggle text-sm text-teal-600 hover:text-teal-800 flex items-center">
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
                
                let gender = 'masculine';
                if (tags.includes('feminine')) gender = 'feminine';
                if (tags.includes('masculine')) gender = 'masculine';
                if (tags.includes('common-gender')) gender = 'common';

                const articles = {
                  singular: this.calculateArticle(italian, gender, false),
                  plural: this.calculateArticle(italian, gender, true)
                };

                articles.indefinite = {
                  singular: this.calculateIndefiniteArticle(italian, gender),
                  plural: null
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

              // Process tags for visual display with sketchy theme hierarchy
              processTagsForDisplay(tags, wordType) {
                const essential = [];
                const detailed = [];

                const tagMap = {
                  // PRIMARY TAGS (essential) - Same across all word types
                  'masculine': { display: '♂', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Masculine gender' },
                  'feminine': { display: '♀', class: 'bg-pink-100 text-pink-800', essential: true, description: 'Feminine gender' },
                  'common-gender': { display: '⚥', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Common gender' },
                  
                  'irregular-pattern': { display: '⚠️ IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Irregular pattern' },
                  'form-irregular': { display: '⚠️ IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Irregular forms' },
                  'ire-isc-conjugation': { display: '-ISC', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Uses -isc- infix' },
                  
                  'CEFR-A1': { display: '📚 A1', class: 'bg-green-100 text-green-800', essential: true, description: 'Beginner level' },
                  'CEFR-A2': { display: '📚 A2', class: 'bg-green-100 text-green-800', essential: true, description: 'Elementary level' },
                  'CEFR-B1': { display: '📚 B1', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Intermediate level' },
                  'CEFR-B2': { display: '📚 B2', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Upper intermediate' },
                  'CEFR-C1': { display: '📚 C1', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Advanced level' },
                  'CEFR-C2': { display: '📚 C2', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Proficiency level' },
                  
                  'freq-top100': { display: '⭐ 100', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 100 words' },
                  'freq-top200': { display: '⭐ 200', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 200 words' },
                  'freq-top300': { display: '⭐ 300', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 300 words' },
                  'freq-top500': { display: '⭐ 500', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 500 words' },
                  'freq-top1000': { display: '⭐ 1K', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 1000 words' },
                  'freq-top5000': { display: '⭐ 5K', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 5000 words' },
                  
                  'native': { display: '🗣️ NAT', class: 'bg-indigo-100 text-indigo-800', essential: true, description: 'Native vocabulary' },
                  'business': { display: '💼 BIZ', class: 'bg-gray-100 text-gray-800', essential: true, description: 'Business terminology' },
                  'academic': { display: '🎓 ACAD', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Academic vocabulary' },
                  'literary': { display: '📜 LIT', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Literary language' },
                  'regional': { display: '🗺️ REG', class: 'bg-green-100 text-green-800', essential: true, description: 'Regional variants' },
                  
                  // WORD TYPE TAGS (detailed) - Different colors per word type
                  'VERB': { display: 'verb', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Verb' },
                  'NOUN': { display: 'noun', class: 'bg-cyan-100 text-cyan-800', essential: false, description: 'Noun' },
                  'ADJECTIVE': { display: 'adjective', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Adjective' },
                  'ADVERB': { display: 'adverb', class: 'bg-purple-100 text-purple-800', essential: false, description: 'Adverb' },
                  
                  // SECONDARY TAGS (detailed) - Same emojis across all word types
                  'are-conjugation': { display: '🔸 -are', class: 'bg-teal-100 text-teal-800', essential: false, description: 'First conjugation' },
                  'ere-conjugation': { display: '🔹 -ere', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Second conjugation' },
                  'ire-conjugation': { display: '🔶 -ire', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Third conjugation' },
                  
                  'avere-auxiliary': { display: '🤝 avere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses avere' },
                  'essere-auxiliary': { display: '🫱 essere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses essere' },
                  'both-auxiliary': { display: '🤜🤛 both', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses both auxiliaries' },
                  
                  'transitive-verb': { display: '➡️ trans', class: 'bg-green-100 text-green-800', essential: false, description: 'Transitive verb' },
                  'intransitive-verb': { display: '↩️ intrans', class: 'bg-green-100 text-green-800', essential: false, description: 'Intransitive verb' },
                  'both-transitivity': { display: '↔️ both', class: 'bg-green-100 text-green-800', essential: false, description: 'Both transitive/intransitive' },

                  'plural-i': { display: '📝 plural-i', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Plural with -i' },
                  'plural-e': { display: '📄 plural-e', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Plural with -e' },
                  'plural-invariable': { display: '🔒 invariable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Invariable plural' },
                  
                  'form-4': { display: '📋 form-4', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Four forms' },
                  'form-2': { display: '📑 form-2', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Two forms' },
                  'form-invariable': { display: '🔐 invariable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Invariable forms' },
                  'type-gradable': { display: '📈 gradable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Gradable adjective' },
                  
                  'type-manner': { display: '🎭 manner', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Manner adverb' },
                  'type-time': { display: '⏰ time', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Time adverb' },
                  'type-place': { display: '📍 place', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Place adverb' },
                  'type-quantity': { display: '📊 quantity', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Quantity adverb' },
                  
                  'topic-place': { display: '🌍 place', class: 'bg-emerald-100 text-emerald-800', essential: false, description: 'Places and locations' },
                  'topic-food': { display: '🍕 food', class: 'bg-orange-100 text-orange-800', essential: false, description: 'Food and drink' },
                  'topic-bodypart': { display: '👁️ body', class: 'bg-pink-100 text-pink-800', essential: false, description: 'Body parts' },
                  'topic-profession': { display: '👩‍💼 job', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Jobs and professions' },
                  'topic-abstract': { display: '💭 abstract', class: 'bg-purple-100 text-purple-800', essential: false, description: 'Abstract concepts' },
                  'topic-daily-life': { display: '🏡 daily', class: 'bg-green-100 text-green-800', essential: false, description: 'Daily life' }
                };

                (tags || []).forEach(tag => {
                  const tagInfo = tagMap[tag] || tagMap[wordType];
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

                // Always add word type to detailed tags
                const wordTypeInfo = tagMap[wordType];
                if (wordTypeInfo) {
                  detailed.unshift({
                    tag: wordType,
                    display: wordTypeInfo.display,
                    class: wordTypeInfo.class,
                    description: wordTypeInfo.description
                  });
                }

                return { essential, detailed };
              }

              // Get word forms
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

              // Get related words
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

        <script dangerouslySetInnerHTML={{
          __html: `
            // Initialize Enhanced Dictionary System
            document.addEventListener('DOMContentLoaded', function() {
              const SUPABASE_URL = window.SUPABASE_URL;
              const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
              
              if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.error('Missing Supabase environment variables');
                return;
              }
              
              const { createClient } = supabase;
              const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
              const dictionarySystem = new window.EnhancedDictionarySystem(supabaseClient);

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

              // Update grammar filters
              function updateGrammarFilters() {
                const grammarContainer = document.getElementById('grammar-filters');
                if (!grammarContainer) return;
                
                const selectedTypes = currentFilters.wordType.length === 0 ? ['ALL'] : currentFilters.wordType;
                
                let applicableFilters = [];
                selectedTypes.forEach(type => {
                  if (grammarFiltersByType[type]) {
                    applicableFilters = applicableFilters.concat(grammarFiltersByType[type]);
                  }
                });
                
                applicableFilters = applicableFilters.concat(grammarFiltersByType['ALL']);
                
                const uniqueFilters = applicableFilters.filter((filter, index, self) => 
                  index === self.findIndex(f => f.value === filter.value)
                );
                
                grammarContainer.innerHTML = uniqueFilters
                  .map(filter => '<span class="filter-chip ' + (currentFilters.tags.includes(filter.value) ? 'active' : '') + '" data-filter="tags" data-value="' + filter.value + '">' + filter.label + '</span>')
                  .join('');
              }

              // Resize functionality
              let isResizing = false;
              let startX = 0;
              let startWidth = 0;

              if (resizeHandle) {
                resizeHandle.addEventListener('mousedown', function(e) {
                  isResizing = true;
                  startX = e.clientX;
                  startWidth = parseInt(window.getComputedStyle(dictionaryPanel, null).getPropertyValue('width'));
                  document.addEventListener('mousemove', handleResize);
                  document.addEventListener('mouseup', stopResize);
                  dictionaryPanel.style.transition = 'none';
                });
              }

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
                if (dictionaryPanel) {
                  dictionaryPanel.classList.remove('translate-x-full');
                }
                if (overlay) {
                  overlay.classList.remove('opacity-0', 'pointer-events-none');
                }
                if (searchInput) {
                  searchInput.focus();
                }
                loadWords();
              }

              function closeDictionaryPanel() {
                if (dictionaryPanel) {
                  dictionaryPanel.classList.add('translate-x-full');
                }
                if (overlay) {
                  overlay.classList.add('opacity-0', 'pointer-events-none');
                }
              }

              // Filter toggle
              if (toggleFilters && advancedFilters && filterArrow) {
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
              }

              // Filter chips handling
              document.addEventListener('click', function(e) {
                if (e.target.classList.contains('filter-chip')) {
                  const filterType = e.target.dataset.filter;
                  const filterValue = e.target.dataset.value;
                  
                  if (filterType === 'wordType') {
                    if (filterValue === '') {
                      const siblings = e.target.parentElement.querySelectorAll('.filter-chip');
                      siblings.forEach(chip => chip.classList.remove('active'));
                      e.target.classList.add('active');
                      currentFilters.wordType = [];
                    } else {
                      const allChip = e.target.parentElement.querySelector('[data-value=""]');
                      if (allChip) allChip.classList.remove('active');
                      
                      if (currentFilters.wordType.includes(filterValue)) {
                        currentFilters.wordType = currentFilters.wordType.filter(type => type !== filterValue);
                        e.target.classList.remove('active');
                      } else {
                        currentFilters.wordType.push(filterValue);
                        e.target.classList.add('active');
                      }
                      
                      if (currentFilters.wordType.length === 0 && allChip) {
                        allChip.classList.add('active');
                      }
                    }
                    
                    updateGrammarFilters();
                    
                  } else if (filterType === 'tags') {
                    if (currentFilters.tags.includes(filterValue)) {
                      currentFilters.tags = currentFilters.tags.filter(tag => tag !== filterValue);
                      e.target.classList.remove('active');
                    } else {
                      currentFilters.tags.push(filterValue);
                      e.target.classList.add('active');
                    }
                    
                  } else {
                    const siblings = e.target.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(chip => chip.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilters[filterType] = filterValue;
                  }
                  
                  loadWords(searchInput ? searchInput.value : '');
                }
              });

              // Load and display words
              async function loadWords(searchTerm = '') {
                if (loading) loading.classList.remove('hidden');
                if (wordsContainer) wordsContainer.innerHTML = '';
                if (noResults) noResults.classList.add('hidden');

                try {
                  const words = await dictionarySystem.loadWords(searchTerm, currentFilters);
                  if (loading) loading.classList.add('hidden');

                  if (words.length === 0) {
                    if (noResults) noResults.classList.remove('hidden');
                    return;
                  }

                  words.forEach(word => {
                    if (wordsContainer) {
                      const wordElement = createEnhancedWordElement(word);
                      wordsContainer.appendChild(wordElement);
                    }
                  });

                } catch (error) {
                  console.error('Error loading words:', error);
                  if (loading) loading.classList.add('hidden');
                  if (noResults) {
                    noResults.textContent = 'Error loading words';
                    noResults.classList.remove('hidden');
                  }
                }
              }

              // Create enhanced word element with sketchy styling
              function createEnhancedWordElement(word) {
                const div = document.createElement('div');
                const colors = dictionarySystem.getWordTypeColors(word.word_type);
                
                div.className = 'word-card border-2 ' + colors.border + ' ' + colors.bg + ' ' + colors.hover + ' rounded-lg p-4 transition-colors sketchy';
                
                const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
                  ? word.word_audio_metadata[0] 
                  : null;
                  
                const hasPremiumAudio = audioMetadata && audioMetadata.audio_filename && audioMetadata.audio_filename.trim() !== '';
                const audioFilename = hasPremiumAudio ? audioMetadata.audio_filename : null;

                // Build article display for nouns with diamond separators
                let articleDisplay = '';
                if (word.word_type === 'NOUN' && word.articles) {
                  const definiteText = word.articles.singular + ' • ' + word.articles.plural;
                  const indefiniteText = word.articles.indefinite.singular;
                  articleDisplay = '<div class="article-display flex items-center gap-2 mb-2 text-sm"><span>' + definiteText + '</span><span class="text-gray-400">•</span><span>' + indefiniteText + '</span></div>';
                }
                
                // Build essential tags (primary)
                const essentialTags = word.processedTags.essential
                  .map(tag => '<span class="tag-essential ' + tag.class + '" title="' + tag.description + '">' + tag.display + '</span>')
                  .join(' ');
                
                // Build detailed tags (secondary)
                const detailedTags = word.processedTags.detailed
                  .map(tag => '<span class="tag-detailed ' + tag.class + '" title="' + tag.description + '">' + tag.display + '</span>')
                  .join(' ');
                
                div.innerHTML = '<div class="flex justify-between items-start"><div class="flex-1">' + articleDisplay + '<div class="flex items-center gap-2 mb-2"><h3 class="word-italian text-xl font-semibold ' + colors.text + '">' + word.italian + '</h3><button class="audio-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ' + (hasPremiumAudio ? 'premium-audio' : '') + '" onclick="playAudio(\'' + word.id + '\', \'' + word.italian + '\', ' + (audioFilename ? '\'' + audioFilename + '\'' : 'null') + ')" title="' + (hasPremiumAudio ? 'Play premium audio' : 'Play pronunciation') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5"><path d="M8 5v14l11-7z"/></svg></button>' + essentialTags + '</div><p class="word-english text-base ' + colors.text + ' opacity-80 mb-3">' + word.english + '</p><div class="flex flex-wrap gap-1 mb-2">' + detailedTags + '</div></div><button class="add-btn bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4">+ Add</button></div>';
                
                return div;
              }

              // Audio playback function
              async function playAudio(wordId, italianText, audioFilename) {
                const audioBtn = event.target.closest('button');
                const originalHTML = audioBtn.innerHTML;
                
                audioBtn.innerHTML = '<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
                audioBtn.disabled = true;

                try {
                  const hasValidAudioFile = audioFilename && 
                                          audioFilename !== 'null' && 
                                          audioFilename !== null && 
                                          audioFilename.trim() !== '' &&
                                          typeof audioFilename === 'string';
                  
                  if (hasValidAudioFile) {
                    let urlData, urlError;
                    
                    const result1 = await supabaseClient
                      .storage
                      .from('word-audio')
                      .createSignedUrl(audioFilename, 60);
                    
                    if (result1.data && result1.data.signedUrl) {
                      urlData = result1.data;
                    } else {
                      const result2 = await supabaseClient
                        .storage
                        .from('audio-files')
                        .createSignedUrl(audioFilename, 60);
                      urlData = result2.data;
                    }

                    if (urlData && urlData.signedUrl) {
                      const audio = new Audio(urlData.signedUrl);
                      
                      audio.onended = () => {
                        audioBtn.innerHTML = originalHTML;
                        audioBtn.disabled = false;
                      };
                      
                      audio.onerror = () => {
                        fallbackToTTS(italianText, audioBtn, originalHTML);
                      };
                      
                      await audio.play();
                      return;
                    }
                  }
                  
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                  
                } catch (error) {
                  console.error('Audio playback error:', error);
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                }
              }

              function fallbackToTTS(text, audioBtn, originalHTML) {
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(text);
                  utterance.lang = 'it-IT';
                  utterance.rate = 0.9;
                  
                  utterance.onend = () => {
                    audioBtn.innerHTML = originalHTML;
                    audioBtn.disabled = false;
                  };
                  
                  utterance.onerror = () => {
                    audioBtn.innerHTML = originalHTML;
                    audioBtn.disabled = false;
                  };
                  
                  speechSynthesis.speak(utterance);
                } else {
                  audioBtn.innerHTML = originalHTML;
                  audioBtn.disabled = false;
                }
              }

              // Event listeners
              if (dictionaryBtn) {
                dictionaryBtn.addEventListener('click', openDictionary);
              }
              if (closeDictionary) {
                closeDictionary.addEventListener('click', closeDictionaryPanel);
              }
              if (overlay) {
                overlay.addEventListener('click', closeDictionaryPanel);
              }
              if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', function(e) {
                  clearTimeout(searchTimeout);
                  searchTimeout = setTimeout(() => {
                    loadWords(e.target.value);
                  }, 300);
                });
              }

              updateGrammarFilters();
              window.playAudio = playAudio;
            });
          `
        }} />
                  'regional': { display: '🗺️ REG', class: 'bg-green-100 text-green-800', essential: true, description: 'Regional variants' },
                  
                  // WORD TYPE TAGS (detailed) - Different colors per word type
                  'VERB': { display: 'verb', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Verb' },
                  'NOUN': { display: 'noun', class: 'bg-cyan-100 text-cyan-800', essential: false, description: 'Noun' },
                  'ADJECTIVE': { display: 'adjective', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Adjective' },
                  'ADVERB': { display: 'adverb', class: 'bg-purple-100 text-purple-800', essential: false, description: 'Adverb' },
                  
                  // SECONDARY TAGS (detailed) - Same emojis across all word types
                  'are-conjugation': { display: '🔸 -are', class: 'bg-teal-100 text-teal-800', essential: false, description: 'First conjugation' },
                  'ere-conjugation': { display: '🔹 -ere', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Second conjugation' },
                  'ire-conjugation': { display: '🔶 -ire', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Third conjugation' },
                  
                  'avere-auxiliary': { display: '🤝 avere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses avere' },
                  'essere-auxiliary': { display: '🫱 essere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses essere' },
                  'both-auxiliary': { display: '🤜🤛 both', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses both auxiliaries' },
                  
                  'transitive-verb': { display: '➡️ trans', class: 'bg-green-100 text-green-800', essential: false, description: 'Transitive verb' },
                  'intransitive-verb': { display: '↩️ intrans', class: 'bg-green-100 text-green-800', essential: false, description: 'Intransitive verb' },
                  'both-transitivity': { display: '↔️ both', class: 'bg-green-100 text-green-800', essential: false, description: 'Both transitive/intransitive' },

                  'plural-i': { display: '📝 plural-i', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Plural with -i' },
                  'plural-e': { display: '📄 plural-e', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Plural with -e' },
                  'plural-invariable': { display: '🔒 invariable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Invariable plural' },
                  
                  'form-4': { display: '📋 form-4', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Four forms' },
                  'form-2': { display: '📑 form-2', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Two forms' },
                  'form-invariable': { display: '🔐 invariable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Invariable forms' },
                  'type-gradable': { display: '📈 gradable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Gradable adjective' },
                  
                  'type-manner': { display: '🎭 manner', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Manner adverb' },
                  'type-time': { display: '⏰ time', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Time adverb' },
                  'type-place': { display: '📍 place', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Place adverb' },
                  'type-quantity': { display: '📊 quantity', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Quantity adverb' },
                  
                  'topic-place': { display: '🌍 place', class: 'bg-emerald-100 text-emerald-800', essential: false, description: 'Places and locations' },
                  'topic-food': { display: '🍕 food', class: 'bg-orange-100 text-orange-800', essential: false, description: 'Food and drink' },
                  'topic-bodypart': { display: '👁️ body', class: 'bg-pink-100 text-pink-800', essential: false, description: 'Body parts' },
                  'topic-profession': { display: '👩‍💼 job', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Jobs and professions' },
                  'topic-abstract': { display: '💭 abstract', class: 'bg-purple-100 text-purple-800', essential: false, description: 'Abstract concepts' },
                  'topic-daily-life': { display: '🏡 daily', class: 'bg-green-100 text-green-800', essential: false, description: 'Daily life' }
                };

                (tags || []).forEach(tag => {
                  const tagInfo = tagMap[tag] || tagMap[wordType];
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

                // Always add word type to detailed tags
                const wordTypeInfo = tagMap[wordType];
                if (wordTypeInfo) {
                  detailed.unshift({
                    tag: wordType,
                    display: wordTypeInfo.display,
                    class: wordTypeInfo.class,
                    description: wordTypeInfo.description
                  });
                }

                return { essential, detailed };
              }

              // Get word forms
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

              // Get related words
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

            // Initialize Enhanced Dictionary System
            document.addEventListener('DOMContentLoaded', function() {
              const SUPABASE_URL = window.SUPABASE_URL;
              const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
              
              if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.error('Missing Supabase environment variables');
                return;
              }
              
              const { createClient } = supabase;
              const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
                
                let applicableFilters = [];
                selectedTypes.forEach(type => {
                  if (grammarFiltersByType[type]) {
                    applicableFilters = applicableFilters.concat(grammarFiltersByType[type]);
                  }
                });
                
                applicableFilters = applicableFilters.concat(grammarFiltersByType['ALL']);
                
                const uniqueFilters = applicableFilters.filter((filter, index, self) => 
                  index === self.findIndex(f => f.value === filter.value)
                );
                
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
                    if (filterValue === '') {
                      const siblings = e.target.parentElement.querySelectorAll('.filter-chip');
                      siblings.forEach(chip => chip.classList.remove('active'));
                      e.target.classList.add('active');
                      currentFilters.wordType = [];
                    } else {
                      const allChip = e.target.parentElement.querySelector('[data-value=""]');
                      allChip.classList.remove('active');
                      
                      if (currentFilters.wordType.includes(filterValue)) {
                        currentFilters.wordType = currentFilters.wordType.filter(type => type !== filterValue);
                        e.target.classList.remove('active');
                      } else {
                        currentFilters.wordType.push(filterValue);
                        e.target.classList.add('active');
                      }
                      
                      if (currentFilters.wordType.length === 0) {
                        allChip.classList.add('active');
                      }
                    }
                    
                    updateGrammarFilters();
                    
                  } else if (filterType === 'tags') {
                    if (currentFilters.tags.includes(filterValue)) {
                      currentFilters.tags = currentFilters.tags.filter(tag => tag !== filterValue);
                      e.target.classList.remove('active');
                    } else {
                      currentFilters.tags.push(filterValue);
                      e.target.classList.add('active');
                    }
                    
                  } else {
                    const siblings = e.target.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(chip => chip.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilters[filterType] = filterValue;
                  }
                  
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

              // Create enhanced word element with sketchy styling
              function createEnhancedWordElement(word) {
                const div = document.createElement('div');
                const colors = dictionarySystem.getWordTypeColors(word.word_type);
                
                div.className = \`word-card border-2 \${colors.border} \${colors.bg} \${colors.hover} rounded-lg p-4 transition-colors sketchy\`;
                
                const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
                  ? word.word_audio_metadata[0] 
                  : null;
                  
                const hasPremiumAudio = audioMetadata && audioMetadata.audio_filename && audioMetadata.audio_filename.trim() !== '';
                const audioFilename = hasPremiumAudio ? audioMetadata.audio_filename : null;

                // Build article display for nouns with diamond separators
                let articleDisplay = '';
                if (word.word_type === 'NOUN' && word.articles) {
                  const definiteText = word.articles.singular + ' • ' + word.articles.plural;
                  const indefiniteText = word.articles.indefinite.singular;
                  articleDisplay = \`
                    <div class="article-display flex items-center gap-2 mb-2 text-sm">
                      <span>\${definiteText}</span>
                      <span class="text-gray-400">•</span>
                      <span>\${indefiniteText}</span>
                    </div>
                  \`;
                }
                
                // Build essential tags (primary)
                const essentialTags = word.processedTags.essential
                  .map(tag => \`<span class="tag-essential \${tag.class}" title="\${tag.description}">\${tag.display}</span>\`)
                  .join(' ');
                
                // Build detailed tags (secondary)
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
                      <button class="text-xs text-blue-600 hover:text-blue-800 toggle-forms" data-word-id="\${word.id}">
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
                      <button class="text-xs text-purple-600 hover:text-purple-800 toggle-relationships" data-word-id="\${word.id}">
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
                        <h3 class="word-italian text-xl font-semibold \${colors.text}">\${word.italian}</h3>
                        <button 
                          class="audio-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 \${hasPremiumAudio ? 'premium-audio' : ''}"
                          onclick="playAudio('\${word.id}', '\${word.italian}', \${audioFilename ? \`'\${audioFilename}'\` : 'null'})"
                          title="\${hasPremiumAudio ? 'Play premium audio' : 'Play pronunciation'}"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        \${essentialTags}
                      </div>
                      <p class="word-english text-base \${colors.text} opacity-80 mb-3">\${word.english}</p>
                      <div class="flex flex-wrap gap-1 mb-2">
                        \${detailedTags}
                      </div>
                      \${formsSection}
                      \${relationshipsSection}
                    </div>
                    <button class="add-btn bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4">
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

              updateGrammarFilters();

              // Audio playback function with proper error handling
              async function playAudio(wordId, italianText, audioFilename) {
                const audioBtn = event.target.closest('button');
                const originalHTML = audioBtn.innerHTML;
                
                audioBtn.innerHTML = \`
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                \`;
                audioBtn.disabled = true;

                try {
                  const hasValidAudioFile = audioFilename && 
                                          audioFilename !== 'null' && 
                                          audioFilename !== null && 
                                          audioFilename.trim() !== '' &&
                                          typeof audioFilename === 'string';
                  
                  if (hasValidAudioFile) {
                    let urlData, urlError;
                    
                    const result1 = await supabaseClient
                      .storage
                      .from('word-audio')
                      .createSignedUrl(audioFilename, 60);
                    
                    if (result1.data && result1.data.signedUrl) {
                      urlData = result1.data;
                      urlError = null;
                    } else {
                      const result2 = await supabaseClient
                        .storage
                        .from('audio-files')
                        .createSignedUrl(audioFilename, 60);
                      
                      urlData = result2.data;
                      urlError = result2.error;
                    }

                    if (urlData && urlData.signedUrl) {
                      const audio = new Audio(urlData.signedUrl);
                      
                      audio.onended = () => {
                        audioBtn.innerHTML = originalHTML;
                        audioBtn.disabled = false;
                      };
                      
                      audio.onerror = (e) => {
                        console.error('Error playing pregenerated audio:', e);
                        fallbackToTTS(italianText, audioBtn, originalHTML);
                      };
                      
                      await audio.play();
                      return;
                    }
                  }