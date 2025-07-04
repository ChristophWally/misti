export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Misti - Italian Learning</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">Misti</h1>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  id="dictionary-btn"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  📚 Dictionary
                </button>
                <button className="text-gray-700 hover:text-gray-900">
                  My Decks
                </button>
                <button className="text-gray-700 hover:text-gray-900">
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
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Dictionary</h2>
              <button 
                id="close-dictionary"
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <input
                type="text"
                id="dictionary-search"
                placeholder="Search Italian words..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dictionary Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div id="dictionary-results">
                {/* Sample words - will be replaced with real data */}
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">parlare</h3>
                        <p className="text-sm text-gray-600">to speak, to talk</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                          verb
                        </span>
                      </div>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        + Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">casa</h3>
                        <p className="text-sm text-gray-600">house, home</p>
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                          noun
                        </span>
                      </div>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        + Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">bello</h3>
                        <p className="text-sm text-gray-600">beautiful, handsome</p>
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                          adjective
                        </span>
                      </div>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        + Add
                      </button>
                    </div>
                  </div>
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

              function openDictionary() {
                dictionaryPanel.classList.remove('translate-x-full');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                searchInput.focus();
              }

              function closeDictionaryPanel() {
                dictionaryPanel.classList.add('translate-x-full');
                overlay.classList.add('opacity-0', 'pointer-events-none');
              }

              dictionaryBtn.addEventListener('click', openDictionary);
              closeDictionary.addEventListener('click', closeDictionaryPanel);
              overlay.addEventListener('click', closeDictionaryPanel);

              // Sample search functionality
              searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                console.log('Searching for:', searchTerm);
                // TODO: Implement real search with Supabase
              });
            });
          `
        }} />
      </body>
    </html>
  )
}
