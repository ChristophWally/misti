export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Misti - Italian Learning</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `body { font-family: 'Comic Neue', cursive; }`
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
          className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out z-50"
        >
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

              // Supabase client
              const SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
              const SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';

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
                div.className = 'border-2 border-teal-100 rounded-lg p-3 hover:bg-teal-50 transition-colors';
                
                const wordTypeColor = {
                  'VERB': 'bg-teal-100 text-teal-800',
                  'NOUN': 'bg-cyan-100 text-cyan-800', 
                  'ADJECTIVE': 'bg-blue-100 text-blue-800',
                  'ADVERB': 'bg-purple-100 text-purple-800'
                }[word.word_type] || 'bg-gray-100 text-gray-800';

                div.innerHTML = \`
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-medium text-teal-900">\${word.italian}</h3>
                      <p class="text-sm text-teal-700">\${word.english}</p>
                      <span class="inline-block \${wordTypeColor} text-xs px-2 py-1 rounded-full mt-1">
                        \${word.word_type.toLowerCase()}
                      </span>
                    </div>
                    <button class="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 transition-colors">
                      + Add
                    </button>
                  </div>
                \`;
                
                return div;
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
            });
          `
        }} />
      </body>
    </html>
  )
}
