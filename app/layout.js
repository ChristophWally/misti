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
        <style dangerouslySetInnerHTML={{
          __html: `
            body { font-family: 'Comic Neue', cursive; }
            .tag-essential, .tag-detailed {
              display: inline-block;
              font-size: 10px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 9999px;
              margin: 1px;
              cursor: help;
            }
            .tag-essential {
              border: 1px solid rgba(0,0,0,0.1);
            }
            .tag-detailed {
              border: 1px solid rgba(0,0,0,0.1);
            }
          `
        }} />
      </head>
      <body className="bg-gradient-to-br from-cyan-50 to-blue-50">
        <nav className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">Misti</h1>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  id="dictionary-btn"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-md"
                >
                  📚 Dictionary
                </button>
                <button className="text-white hover:text-cyan-200 transition-colors">
                  My Decks
                </button>
                <button className="text-white hover:text-cyan-200 transition-colors">
                  Profile
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dictionary Slide-out Panel */}
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
              <h2 className="text-lg font-semibold text-white">Dictionary</h2>
              <button 
                id="close-dictionary"
                className="text-white hover:text-cyan-200"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b bg-cyan-50">
              <input
                type="text"
                id="dictionary-search"
                placeholder="Search Italian words..."
                className="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Dictionary Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <div id="dictionary-results">
                <div id="words-container" className="space-y-3">
                  {/* Words will be loaded here */}
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

        {/* JavaScript for Dictionary Panel */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const dictionaryBtn = document.getElementById('dictionary-btn');
              const dictionaryPanel = document.getElementById('dictionary-panel');
              const closeDictionary = document.getElementById('close-dictionary');
              const overlay = document.getElementById('dictionary-overlay');
              const searchInput = document.getElementById('dictionary-search');
              const wordsContainer = document.getElementById('words-container');
              const loading = document.getElementById('loading');
              const noResults = document.getElementById('no-results');
              const resizeHandle = document.getElementById('resize-handle');

              // Supabase client
              const SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
              const SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
              
              // Create Supabase client for audio functions
              const { createClient } = supabase;
              const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
                dictionaryPanel.style.transition = 'none'; // Disable transition during resize
              });

              function handleResize(e) {
                if (!isResizing) return;
                const deltaX = startX - e.clientX; // Reverse direction since we're resizing from left
                const newWidth = startWidth + deltaX;
                const minWidth = 384; // Minimum width
                const maxWidth = window.innerWidth * 0.8; // Maximum 80% of viewport
                
                if (newWidth >= minWidth && newWidth <= maxWidth) {
                  dictionaryPanel.style.width = newWidth + 'px';
                }
              }

              function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
                dictionaryPanel.style.transition = ''; // Re-enable transition
              }

              function openDictionary() {
                dictionaryPanel.classList.remove('translate-x-full');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                searchInput.focus();
                loadWords(); // Load words when opening
              }

              function closeDictionaryPanel() {
                dictionaryPanel.classList.add('translate-x-full');
                overlay.classList.add('opacity-0', 'pointer-events-none');
              }

              async function loadWords(searchTerm = '') {
                loading.classList.remove('hidden');
                wordsContainer.innerHTML = '';
                noResults.classList.add('hidden');

                try {
                  let url = SUPABASE_URL + '/rest/v1/dictionary?select=*';
                  if (searchTerm) {
                    url += '&or=(italian.ilike.*' + searchTerm + '*,english.ilike.*' + searchTerm + '*)';
                  }
                  url += '&limit=20';

                  const response = await fetch(url, {
                    headers: {
                      'apikey': SUPABASE_ANON_KEY,
                      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                    }
                  });

                  const words = await response.json();
                  
                  loading.classList.add('hidden');

                  if (words.length === 0) {
                    noResults.classList.remove('hidden');
                    return;
                  }

                  words.forEach(word => {
                    const wordElement = createWordElement(word);
                    wordsContainer.appendChild(wordElement);
                  });

                } catch (error) {
                  console.error('Error loading words:', error);
                  loading.classList.add('hidden');
                  noResults.textContent = 'Error loading words';
                  noResults.classList.remove('hidden');
                }
              }

              function createWordElement(word) {
                const div = document.createElement('div');
                
                const wordTypeColors = {
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

                const colors = wordTypeColors[word.word_type] || {
                  border: 'border-gray-200',
                  bg: 'bg-gray-50',
                  hover: 'hover:bg-gray-100',
                  tag: 'bg-gray-100 text-gray-800',
                  text: 'text-gray-900'
                };

                div.className = \`border-2 \${colors.border} \${colors.bg} \${colors.hover} rounded-lg p-4 transition-colors\`;

                // Process tags
                const tags = word.tags || [];
                const tagElements = processTagsForDisplay(tags, word.word_type);

                div.innerHTML = \`
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-xl font-semibold \${colors.text}">\${word.italian}</h3>
                        <button 
                          class="audio-btn w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors"
                          onclick="playAudio('\${word.id}', '\${word.italian}')"
                          title="Play pronunciation"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        \${tagElements.essential}
                      </div>
                      <p class="text-base \${colors.text} opacity-80 mb-3">\${word.english}</p>
                      <div class="flex flex-wrap gap-1">
                        <span class="inline-block \${colors.tag} text-xs px-2 py-1 rounded-full">
                          \${word.word_type.toLowerCase()}
                        </span>
                        \${tagElements.detailed}
                      </div>
                    </div>
                    <button class="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4">
                      + Add
                    </button>
                  </div>
                \`;
                
                return div;
              }

              function processTagsForDisplay(tags, wordType) {
                const essential = [];
                const detailed = [];

                tags.forEach(tag => {
                  const tagInfo = getTagDisplayInfo(tag, wordType);
                  if (tagInfo) {
                    if (tagInfo.essential) {
                      essential.push(\`<span class="tag-essential \${tagInfo.class}" title="\${tagInfo.description}">\${tagInfo.display}</span>\`);
                    } else {
                      detailed.push(\`<span class="tag-detailed \${tagInfo.class}" title="\${tagInfo.description}">\${tagInfo.display}</span>\`);
                    }
                  }
                });

                return {
                  essential: essential.join(' '),
                  detailed: detailed.join(' ')
                };
              }

              function getTagDisplayInfo(tag, wordType) {
                const tagMap = {
                  // Gender (essential for nouns)
                  'masculine': { display: '♂', class: 'bg-blue-100 text-blue-800', essential: wordType === 'NOUN', description: 'Masculine gender requiring masculine articles (il, un)' },
                  'feminine': { display: '♀', class: 'bg-pink-100 text-pink-800', essential: wordType === 'NOUN', description: 'Feminine gender requiring feminine articles (la, una)' },
                  'common-gender': { display: '⚥', class: 'bg-purple-100 text-purple-800', essential: wordType === 'NOUN', description: 'Same form for both genders, determined by article' },
                  
                  // Irregularity (essential when present)
                  'irregular-pattern': { display: '⚠️ IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Does not follow standard patterns' },
                  
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
                  
                  // Topics (detailed)
                  'topic-place': { display: '🌍 place', class: 'bg-emerald-100 text-emerald-800', essential: false, description: 'Geographical locations or spaces' },
                  'topic-food': { display: '🍕 food', class: 'bg-orange-100 text-orange-800', essential: false, description: 'Food and drink vocabulary' },
                  'topic-bodypart': { display: '👁️ body', class: 'bg-pink-100 text-pink-800', essential: false, description: 'Parts of the body' },
                  'topic-profession': { display: '👩‍💼 job', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Jobs and professional roles' },
                  'topic-abstract': { display: '💭 abstract', class: 'bg-purple-100 text-purple-800', essential: false, description: 'Concepts, ideas, and feelings' },
                  'topic-daily-life': { display: '🏡 daily', class: 'bg-green-100 text-green-800', essential: false, description: 'Everyday activities and household' }
                };

                return tagMap[tag] || null;
              }

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

              // Audio playback function
              async function playAudio(wordId, italianText) {
                const audioBtn = event.target.closest('button');
                const originalHTML = audioBtn.innerHTML;
                
                // Show loading state with pause icon
                audioBtn.innerHTML = \`
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                \`;
                audioBtn.disabled = true;

                try {
                  // For now, we'll use TTS fallback since we don't have pregenerated audio yet
                  // TODO: Add pregenerated audio check later
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                } catch (error) {
                  console.error('Audio error:', error);
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                }
              }

              // TTS fallback function
              function fallbackToTTS(text, audioBtn, originalHTML) {
                console.log('Using TTS fallback for:', text);
                
                // Use Web Speech API for TTS fallback
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(text);
                  utterance.lang = 'it-IT';
                  utterance.rate = 0.8;
                  
                  utterance.onend = () => {
                    audioBtn.innerHTML = originalHTML;
                    audioBtn.disabled = false;
                  };
                  
                  speechSynthesis.speak(utterance);
                } else {
                  // No TTS available - show error icon briefly
                  audioBtn.innerHTML = \`
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  \`;
                  setTimeout(() => {
                    audioBtn.innerHTML = originalHTML;
                    audioBtn.disabled = false;
                  }, 1000);
                }
              }

              // Make functions global for onclick handlers
              window.playAudio = playAudio;
            });
          `
        }} />
      </body>
    </html>
  )
}
