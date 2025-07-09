import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Italian Dictionary',
  description: 'Your personal Italian learning companion',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Inject environment variables safely into client-side */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
            window.SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
          `
        }} />
        
        {children}
        
        {/* Main Dictionary System Script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Initialize Supabase with environment variables
            const SUPABASE_URL = window.SUPABASE_URL;
            const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
            
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
              console.error('Missing Supabase environment variables');
            }
            
            const { createClient } = supabase;
            const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            class EnhancedDictionarySystem {
              constructor() {
                this.supabase = supabaseClient;
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
                    // For multiple tags, we want words that have ALL the tags
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

              async enhanceWordData(word) {
                try {
                  // Ensure proper audio metadata structure
                  const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
                    ? word.word_audio_metadata[0] 
                    : null;
                  
                  return {
                    ...word,
                    audioMetadata,
                    hasPremiumAudio: !!audioMetadata && !!audioMetadata.audio_filename,
                    audioFilename: audioMetadata && audioMetadata.audio_filename 
                      ? audioMetadata.audio_filename 
                      : null
                  };
                } catch (error) {
                  console.error('Error enhancing word data for word:', word.id, error);
                  return {
                    ...word,
                    audioMetadata: null,
                    hasPremiumAudio: false,
                    audioFilename: null
                  };
                }
              }

              createEnhancedWordElement(word) {
                // Extract audio information with proper null checking
                const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
                  ? word.word_audio_metadata[0] 
                  : null;
                const hasPremiumAudio = !!audioMetadata && !!audioMetadata.audio_filename;
                const audioFilename = audioMetadata && audioMetadata.audio_filename 
                  ? audioMetadata.audio_filename 
                  : null;

                // Create enhanced display with proper audio button
                const audioButtonHtml = hasPremiumAudio 
                  ? \`<button class="audio-btn premium-audio" onclick="playAudio('\${word.id}', '\${word.italian}', \${audioFilename ? \`'\${audioFilename}'\` : 'null'})" title="Play premium audio">
                      <span class="audio-icon">🔊</span>
                      <span class="premium-badge">Premium</span>
                    </button>\`
                  : \`<button class="audio-btn basic-audio" onclick="playAudio('\${word.id}', '\${word.italian}', null)" title="Play basic audio">
                      <span class="audio-icon">🔊</span>
                    </button>\`;

                // Format tags for display
                const tagsHtml = word.tags && word.tags.length > 0 
                  ? word.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join(' ')
                  : '';

                return \`
                  <div class="word-item" data-word-id="\${word.id}">
                    <div class="word-header">
                      <div class="word-main">
                        <span class="italian-word">\${word.italian}</span>
                        <span class="word-type">(\${word.word_type || 'N/A'})</span>
                      </div>
                      \${audioButtonHtml}
                    </div>
                    <div class="word-content">
                      <div class="english-translation">\${word.english}</div>
                      \${tagsHtml ? \`<div class="word-tags">\${tagsHtml}</div>\` : ''}
                    </div>
                  </div>
                \`;
              }

              async performSearch() {
                const searchInput = document.getElementById('searchInput');
                const resultsContainer = document.getElementById('searchResults');
                const loadingIndicator = document.getElementById('loadingIndicator');
                
                if (!searchInput || !resultsContainer) return;

                const searchTerm = searchInput.value.trim();
                this.currentSearchTerm = searchTerm;

                try {
                  // Show loading state
                  if (loadingIndicator) loadingIndicator.style.display = 'block';
                  resultsContainer.innerHTML = '';

                  // Load words with current filters
                  const words = await this.loadWords(searchTerm, this.currentFilters);
                  
                  // Display results
                  if (words && words.length > 0) {
                    const wordsHtml = words.map(word => this.createEnhancedWordElement(word)).join('');
                    resultsContainer.innerHTML = \`
                      <div class="results-count">Found \${words.length} word\${words.length !== 1 ? 's' : ''}</div>
                      <div class="words-list">\${wordsHtml}</div>
                    \`;
                  } else {
                    resultsContainer.innerHTML = \`
                      <div class="no-results">
                        <p>No words found\${searchTerm ? \` for "\${searchTerm}"\` : ''}.</p>
                        <p>Try a different search term or check your filters.</p>
                      </div>
                    \`;
                  }
                } catch (error) {
                  console.error('Search error:', error);
                  resultsContainer.innerHTML = \`
                    <div class="error-message">
                      <p>Error loading words. Please try again.</p>
                      <p class="error-detail">\${error.message}</p>
                    </div>
                  \`;
                } finally {
                  // Hide loading state
                  if (loadingIndicator) loadingIndicator.style.display = 'none';
                }
              }

              updateFilters(newFilters) {
                this.currentFilters = { ...this.currentFilters, ...newFilters };
                // Trigger search with updated filters
                this.performSearch();
              }

              clearFilters() {
                this.currentFilters = {};
                // Trigger search without filters
                this.performSearch();
              }
            }

            // Audio playback functionality
            let currentAudio = null;

            async function playAudio(wordId, italianWord, audioFilename) {
              try {
                // Stop any currently playing audio
                if (currentAudio) {
                  currentAudio.pause();
                  currentAudio = null;
                }

                // Check if we have a premium audio file
                if (audioFilename && audioFilename !== 'null' && audioFilename !== null) {
                  // Play premium audio from Supabase storage
                  const { data: audioData, error } = await supabaseClient.storage
                    .from('word-audio')
                    .createSignedUrl(audioFilename, 60); // 60 seconds expiry

                  if (error) {
                    console.error('Error getting audio URL:', error);
                    throw error;
                  }

                  if (audioData && audioData.signedUrl) {
                    currentAudio = new Audio(audioData.signedUrl);
                    currentAudio.play().catch(e => {
                      console.error('Error playing premium audio:', e);
                      // Fallback to basic audio
                      playBasicAudio(italianWord);
                    });
                    return;
                  }
                }

                // Fallback to basic text-to-speech
                playBasicAudio(italianWord);
              } catch (error) {
                console.error('Audio playback error:', error);
                // Fallback to basic audio
                playBasicAudio(italianWord);
              }
            }

            function playBasicAudio(text) {
              try {
                // Use Web Speech API for basic text-to-speech
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(text);
                  utterance.lang = 'it-IT'; // Italian language
                  utterance.rate = 0.8; // Slightly slower for learning
                  speechSynthesis.speak(utterance);
                } else {
                  console.warn('Speech synthesis not supported in this browser');
                  alert('Audio not supported in this browser');
                }
              } catch (error) {
                console.error('Basic audio error:', error);
                alert('Error playing audio');
              }
            }

            // Global dictionary system instance
            let dictionarySystem = null;

            // Dictionary modal functionality
            async function openDictionary() {
              try {
                // Initialize dictionary system if not already done
                if (!dictionarySystem) {
                  dictionarySystem = new EnhancedDictionarySystem();
                }

                // Show the modal
                const modal = document.getElementById('dictionaryModal');
                if (modal) {
                  modal.style.display = 'block';
                  document.body.style.overflow = 'hidden';
                  
                  // Focus on search input
                  const searchInput = document.getElementById('searchInput');
                  if (searchInput) {
                    searchInput.focus();
                  }

                  // Load initial words (empty search to show all)
                  await dictionarySystem.performSearch();
                }
              } catch (error) {
                console.error('Error opening dictionary:', error);
                alert('Error opening dictionary. Please try again.');
              }
            }

            function closeDictionary() {
              const modal = document.getElementById('dictionaryModal');
              if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
              }
              
              // Stop any playing audio
              if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
              }
            }

            // Event listeners setup
            document.addEventListener('DOMContentLoaded', function() {
              // Search input event listener
              const searchInput = document.getElementById('searchInput');
              if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', function() {
                  clearTimeout(searchTimeout);
                  searchTimeout = setTimeout(() => {
                    if (dictionarySystem) {
                      dictionarySystem.performSearch();
                    }
                  }, 300); // Debounce search for 300ms
                });

                // Enter key to search
                searchInput.addEventListener('keypress', function(e) {
                  if (e.key === 'Enter' && dictionarySystem) {
                    dictionarySystem.performSearch();
                  }
                });
              }

              // Close modal when clicking outside
              const modal = document.getElementById('dictionaryModal');
              if (modal) {
                modal.addEventListener('click', function(e) {
                  if (e.target === modal) {
                    closeDictionary();
                  }
                });
              }

              // Close modal with Escape key
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  closeDictionary();
                }
              });
            });

            // Make functions globally available
            window.openDictionary = openDictionary;
            window.closeDictionary = closeDictionary;
            window.playAudio = playAudio;
            window.playBasicAudio = playBasicAudio;
          `
        }} />

        {/* Supabase Client Library */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/supabase/2.39.3/supabase.min.js"></script>
        
        {/* Enhanced Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Dictionary Modal Styles */
            #dictionaryModal {
              display: none;
              position: fixed;
              z-index: 1000;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(5px);
            }

            .modal-content {
              background-color: #ffffff;
              margin: 2% auto;
              padding: 0;
              border-radius: 12px;
              width: 90%;
              max-width: 800px;
              height: 90vh;
              display: flex;
              flex-direction: column;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }

            .modal-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 12px 12px 0 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .modal-header h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }

            .close {
              color: white;
              font-size: 32px;
              font-weight: bold;
              cursor: pointer;
              border: none;
              background: none;
              padding: 0;
              line-height: 1;
              opacity: 0.8;
              transition: opacity 0.2s;
            }

            .close:hover {
              opacity: 1;
            }

            .search-container {
              padding: 20px;
              border-bottom: 1px solid #e0e0e0;
              background-color: #f8f9fa;
            }

            .search-box {
              position: relative;
              width: 100%;
            }

            #searchInput {
              width: 100%;
              padding: 15px 20px 15px 50px;
              border: 2px solid #e0e0e0;
              border-radius: 25px;
              font-size: 16px;
              outline: none;
              transition: all 0.3s ease;
              box-sizing: border-box;
            }

            #searchInput:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .search-icon {
              position: absolute;
              left: 18px;
              top: 50%;
              transform: translateY(-50%);
              color: #666;
              font-size: 18px;
            }

            .results-container {
              flex: 1;
              overflow-y: auto;
              padding: 20px;
            }

            #loadingIndicator {
              display: none;
              text-align: center;
              padding: 40px;
              color: #666;
            }

            .loading-spinner {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 3px solid #f3f3f3;
              border-top: 3px solid #667eea;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-right: 10px;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .results-count {
              margin-bottom: 20px;
              color: #666;
              font-size: 14px;
              font-weight: 500;
            }

            .words-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .word-item {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 16px;
              transition: all 0.2s ease;
              cursor: pointer;
            }

            .word-item:hover {
              border-color: #667eea;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
              transform: translateY(-1px);
            }

            .word-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }

            .word-main {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .italian-word {
              font-size: 20px;
              font-weight: 600;
              color: #2c3e50;
            }

            .word-type {
              font-size: 12px;
              color: #7f8c8d;
              background: #ecf0f1;
              padding: 2px 8px;
              border-radius: 12px;
              font-weight: 500;
            }

            .audio-btn {
              background: none;
              border: 1px solid #ddd;
              border-radius: 6px;
              padding: 8px 12px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
              transition: all 0.2s ease;
              font-size: 12px;
            }

            .audio-btn:hover {
              background-color: #f8f9fa;
              border-color: #667eea;
            }

            .premium-audio {
              border-color: #e74c3c;
              color: #e74c3c;
            }

            .premium-audio:hover {
              background-color: #e74c3c;
              color: white;
            }

            .basic-audio {
              border-color: #95a5a6;
              color: #95a5a6;
            }

            .basic-audio:hover {
              background-color: #95a5a6;
              color: white;
            }

            .premium-badge {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            }

            .audio-icon {
              font-size: 14px;
            }

            .word-content {
              padding-left: 0;
            }

            .english-translation {
              font-size: 16px;
              color: #34495e;
              margin-bottom: 8px;
              line-height: 1.4;
            }

            .word-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
            }

            .tag {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .no-results {
              text-align: center;
              padding: 60px 20px;
              color: #7f8c8d;
            }

            .no-results p {
              margin: 10px 0;
              font-size: 16px;
            }

            .error-message {
              text-align: center;
              padding: 40px 20px;
              color: #e74c3c;
              background-color: #fdf2f2;
              border-radius: 8px;
              border: 1px solid #f5c6cb;
            }

            .error-detail {
              font-size: 14px;
              color: #721c24;
              margin-top: 10px;
              font-family: monospace;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
              .modal-content {
                width: 95%;
                height: 95vh;
                margin: 2.5% auto;
              }

              .modal-header {
                padding: 15px;
              }

              .modal-header h2 {
                font-size: 20px;
              }

              .search-container {
                padding: 15px;
              }

              #searchInput {
                padding: 12px 15px 12px 45px;
                font-size: 16px;
              }

              .results-container {
                padding: 15px;
              }

              .word-item {
                padding: 12px;
              }

              .italian-word {
                font-size: 18px;
              }

              .english-translation {
                font-size: 15px;
              }

              .word-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
              }

              .audio-btn {
                align-self: flex-end;
              }
            }

            @media (max-width: 480px) {
              .modal-content {
                width: 100%;
                height: 100vh;
                margin: 0;
                border-radius: 0;
              }

              .modal-header {
                border-radius: 0;
                padding: 12px 15px;
              }

              .search-container {
                padding: 12px 15px;
              }

              .results-container {
                padding: 12px 15px;
              }
            }
          `
        }} />
      </body>
    </html>
  )
}
