// Process tags for visual display with proper SVG icons and mobile support
              processTagsForDisplay(tags, wordType) {
                const essential = [];
                const detailed = [];

                const tagMap = {
                  // Gender (essential for nouns) - Using actual symbols, not emoji
                  'masculine': { 
                    display: '♂', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: wordType === 'NOUN', 
                    description: 'Masculine gender requiring masculine articles (il, un)',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M9 9c0-3.31 2.69-6 6-6s6 2.69 6 6c0 3.31-2.69 6-6 6s-6-2.69-6-6zM15 3c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l-6.76 6.76 1.41 1.41 6.76-6.76C13.84 15.33 15.34 16 17 16c3.31 0 6-2.69 6-6s-2.69-6-6-6z"/></svg>\`
                  },
                  'feminine': { 
                    display: '♀', 
                    class: 'bg-pink-100 text-pink-800', 
                    essential: wordType === 'NOUN', 
                    description: 'Feminine gender requiring feminine articles (la, una)',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4m0-2C8.69 2 6 4.69 6 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zM12 14c-1.66 0-3.16-.67-4.24-1.76L1 19l1.41 1.41 6.76-6.76C10.84 14.33 12.34 15 14 15v-2h-2z"/></svg>\`
                  },
                  'common-gender': { 
                    display: '⚥', 
                    class: 'bg-purple-100 text-purple-800', 
                    essential: wordType === 'NOUN', 
                    description: 'Same form for both genders, determined by article',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L8 5h2.5v4h3V5H16l-4-4zM8 12v4h2.5v4h3v-4H16v-4H8z"/></svg>\`
                  },
                  
                  // Irregularity (essential when present)
                  'irregular-pattern': { 
                    display: 'IRREG', 
                    class: 'bg-red-100 text-red-800', 
                    essential: true, 
                    description: 'Does not follow standard patterns',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>\`
                  },
                  'form-irregular': { 
                    display: 'IRREG', 
                    class: 'bg-red-100 text-red-800', 
                    essential: true, 
                    description: 'Special rules or position-dependent forms',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>\`
                  },
                  
                  // ISC Conjugation (essential for verbs)
                  'ire-isc-conjugation': { 
                    display: '-ISC', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: wordType === 'VERB', 
                    description: 'Uses -isc- infix in present forms',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v9h2v-9zm8-2h-2v11h2V9zm-4-4h-2v15h2V5z"/></svg>\`
                  },
                  
                  // CEFR Levels (essential) - Using book icon
                  'CEFR-A1': { 
                    display: 'A1', 
                    class: 'bg-green-100 text-green-800', 
                    essential: true, 
                    description: 'Beginner level vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>\`
                  },
                  'CEFR-A2': { 
                    display: 'A2', 
                    class: 'bg-green-100 text-green-800', 
                    essential: true, 
                    description: 'Elementary level vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>\`
                  },
                  'CEFR-B1': { 
                    display: 'B1', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: true, 
                    description: 'Intermediate level vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>\`
                  },
                  'CEFR-B2': { 
                    display: 'B2', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: true, 
                    description: 'Upper intermediate vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>\`
                  },
                  'CEFR-C1': { 
                    display: 'C1', 
                    class: 'bg-purple-100 text-purple-800', 
                    essential: true, 
                    description: 'Advanced level vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>\`
                  },
                  'CEFR-C2': { 
                    display: 'C2', 
                    class: 'bg-purple-100 text-purple-800', 
                    essential: true, 
                    description: 'Proficiency level vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>\`
                  },
                  
                  // Frequency (essential) - Using star icon
                  'freq-top100': { 
                    display: '100', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: true, 
                    description: 'Top 100 most frequent words',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  'freq-top200': { 
                    display: '200', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: true, 
                    description: 'Top 200 most frequent words',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  'freq-top300': { 
                    display: '300', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: true, 
                    description: 'Top 300 most frequent words',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  'freq-top500': { 
                    display: '500', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: true, 
                    description: 'Top 500 most frequent words',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  'freq-top1000': { 
                    display: '1K', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: true, 
                    description: 'Top 1000 most frequent words',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  'freq-top5000': { 
                    display: '5K', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    essential: true, 
                    description: 'Top 5000 most frequent words',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  
                  // Advanced Fluency (essential)
                  'native': { 
                    display: 'NAT', 
                    class: 'bg-indigo-100 text-indigo-800', 
                    essential: true, 
                    description: 'Natural native-speaker vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>\`
                  },
                  'business': { 
                    display: 'BIZ', 
                    class: 'bg-gray-100 text-gray-800', 
                    essential: true, 
                    description: 'Professional/commercial terminology',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>\`
                  },
                  'academic': { 
                    display: 'ACAD', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: true, 
                    description: 'Scholarly and technical vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>\`
                  },
                  'literary': { 
                    display: 'LIT', 
                    class: 'bg-purple-100 text-purple-800', 
                    essential: true, 
                    description: 'Literary and artistic language',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>\`
                  },
                  'regional': { 
                    display: 'REG', 
                    class: 'bg-green-100 text-green-800', 
                    essential: true, 
                    description: 'Regional dialects and variants',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>\`
                  },
                  
                  // Conjugation Groups (detailed)
                  'are-conjugation': { 
                    display: '-are', 
                    class: 'bg-teal-100 text-teal-800', 
                    essential: false, 
                    description: 'First conjugation group',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>\`
                  },
                  'ere-conjugation': { 
                    display: '-ere', 
                    class: 'bg-teal-100 text-teal-800', 
                    essential: false, 
                    description: 'Second conjugation group',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>\`
                  },
                  'ire-conjugation': { 
                    display: '-ire', 
                    class: 'bg-teal-100 text-teal-800', 
                    essential: false, 
                    description: 'Third conjugation group',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>\`
                  },
                  
                  // Auxiliary Verbs (detailed)
                  'avere-auxiliary': { 
                    display: 'avere', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: false, 
                    description: 'Uses avere in compound tenses',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7l1.5-4.5L10 11H9zm6.5 0L14 6.5 12.5 11H15.5z"/></svg>\`
                  },
                  'essere-auxiliary': { 
                    display: 'essere', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: false, 
                    description: 'Uses essere in compound tenses',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>\`
                  },
                  'both-auxiliary': { 
                    display: 'both', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: false, 
                    description: 'Can use either auxiliary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>\`
                  },
                  
                  // Transitivity (detailed)
                  'transitive-verb': { 
                    display: 'trans', 
                    class: 'bg-green-100 text-green-800', 
                    essential: false, 
                    description: 'Takes a direct object',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>\`
                  },
                  'intransitive-verb': { 
                    display: 'intrans', 
                    class: 'bg-green-100 text-green-800', 
                    essential: false, 
                    description: 'Does not take direct object',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>\`
                  },
                  'both-transitivity': { 
                    display: 'both', 
                    class: 'bg-green-100 text-green-800', 
                    essential: false, 
                    description: 'Can be both transitive and intransitive',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>\`
                  },

                  // Plural patterns (detailed)
                  'plural-i': { 
                    display: 'plural-i', 
                    class: 'bg-gray-100 text-gray-800', 
                    essential: false, 
                    description: 'Forms plural by changing ending to -i',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>\`
                  },
                  'plural-e': { 
                    display: 'plural-e', 
                    class: 'bg-gray-100 text-gray-800', 
                    essential: false, 
                    description: 'Forms plural by changing ending to -e',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>\`
                  },
                  'plural-invariable': { 
                    display: 'invariable', 
                    class: 'bg-gray-100 text-gray-800', 
                    essential: false, 
                    description: 'Identical singular and plural forms',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>\`
                  },
                  
                  // Topics (detailed)
                  'topic-place': { 
                    display: 'place', 
                    class: 'bg-emerald-100 text-emerald-800', 
                    essential: false, 
                    description: 'Geographical locations or spaces',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>\`
                  },
                  'topic-food': { 
                    display: 'food', 
                    class: 'bg-orange-100 text-orange-800', 
                    essential: false, 
                    description: 'Food and drink vocabulary',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>\`
                  },
                  'topic-bodypart': { 
                    display: 'body', 
                    class: 'bg-pink-100 text-pink-800', 
                    essential: false, 
                    description: 'Parts of the body',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>\`
                  },
                  'topic-profession': { 
                    display: 'job', 
                    class: 'bg-blue-100 text-blue-800', 
                    essential: false, 
                    description: 'Jobs and professional roles',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>\`
                  },
                  'topic-abstract': { 
                    display: 'abstract', 
                    class: 'bg-purple-100 text-purple-800', 
                    essential: false, 
                    description: 'Concepts, ideas, and feelings',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`
                  },
                  'topic-daily-life': { 
                    display: 'daily', 
                    class: 'bg-green-100 text-green-800', 
                    essential: false, 
                    description: 'Everyday activities and household',
                    icon: \`<svg class="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>\`
                  }
                };

                tags.forEach(tag => {
                  const tagInfo = tagMap[tag];
                  if (tagInfo) {
                    if (tagInfo.essential) {
                      essential.push({
                        tag,
                        display: tagInfo.display,
                        class: tagInfo.class,
                        description: tagInfo.description,
                        icon: tagInfo.icon
                      });
                    } else {
                      detailed.push({
                        tag,
                        display: tagInfo.display,
                        class: tagInfo.class,
                        description: tagInfo.description,
                        icon: tagInfo.icon
                      });
                    }
                  }
                });

                return { essential, detailed };
              }export default function RootLayout({ children }) {
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
            .word-card {
              transition: all 0.2s ease;
            }
            .word-card:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .article-display {
              font-weight: 600;
              font-size: 14px;
              color: #059669;
              margin-right: 4px;
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
            }
            .filter-chip:hover {
              background-color: #f3f4f6;
            }
            .filter-chip.active {
              background-color: #0d9488;
              color: white;
              border-color: #0d9488;
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
              <h2 className="text-lg font-semibold text-white">Dictionary</h2>
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
                  className="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                
                {/* Filter Toggle */}
                <button id="toggle-filters" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
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

        {/* Enhanced Dictionary System JavaScript */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Enhanced Dictionary System Class
            class EnhancedDictionarySystem {
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

                  // Apply word type filter (now supports multiple types)
                  if (filters.wordType && filters.wordType.length > 0) {
                    query = query.in('word_type', filters.wordType);
                  }

                  // Apply tag filters
                  if (filters.tags && filters.tags.length > 0) {
                    query = query.overlaps('tags', filters.tags);
                  }

                  // Apply CEFR level filter
                  if (filters.cefrLevel) {
                    query = query.overlaps('tags', [\`CEFR-\${filters.cefrLevel}\`]);
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

            // Initialize Enhanced Dictionary System
            document.addEventListener('DOMContentLoaded', function() {
              // Supabase client
              const SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
              const SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
              
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

                } catch (error) {
                  console.error('Error loading words:', error);
                  loading.classList.add('hidden');
                  noResults.textContent = 'Error loading words';
                  noResults.classList.remove('hidden');
                }
              }

              // Create enhanced word element with all new features
              function createEnhancedWordElement(word) {
                const div = document.createElement('div');
                const colors = dictionarySystem.getWordTypeColors(word.word_type);
                
                div.className = \`word-card border-2 \${colors.border} \${colors.bg} \${colors.hover} rounded-lg p-4 transition-colors\`;
                
                // Build article display for nouns
                let articleDisplay = '';
                if (word.word_type === 'NOUN' && word.articles) {
                  articleDisplay = \`
                    <div class="flex items-center gap-2 mb-2 text-sm">
                      <span class="article-display">\${word.articles.singular}</span>
                      <span class="text-gray-400">/</span>
                      <span class="article-display">\${word.articles.plural}</span>
                      <span class="text-gray-500">(definite)</span>
                      <span class="article-display ml-2">\${word.articles.indefinite.singular}</span>
                      <span class="text-gray-500">(indefinite)</span>
                    </div>
                  \`;
                }
                
                // Build essential tags with proper icons
                const essentialTags = word.processedTags.essential
                  .map(tag => \`<span class="tag-essential \${tag.class}" title="\${tag.description}">\${tag.icon || ''}\${tag.display}</span>\`)
                  .join(' ');
                
                // Build detailed tags with proper icons
                const detailedTags = word.processedTags.detailed
                  .map(tag => \`<span class="tag-detailed \${tag.class}" title="\${tag.description}">\${tag.icon || ''}\${tag.display}</span>\`)
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
                        <h3 class="text-xl font-semibold \${colors.text}">\${word.italian}</h3>
                        <button 
                          class="audio-btn w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                          onclick="playAudio('\${word.id}', '\${word.italian}')"
                          title="Play pronunciation"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        \${essentialTags}
                      </div>
                      <p class="text-base \${colors.text} opacity-80 mb-3">\${word.english}</p>
                      <div class="flex flex-wrap gap-1 mb-2">
                        <span class="inline-block \${colors.tag} text-xs px-2 py-1 rounded-full">
                          \${word.word_type.toLowerCase()}
                        </span>
                        \${detailedTags}
                      </div>
                      \${formsSection}
                      \${relationshipsSection}
                    </div>
                    <button class="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4">
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

              // Audio playbook function with mobile-first approach
              async function playAudio(wordId, italianText) {
                const audioBtn = event.target.closest('button');
                const originalHTML = audioBtn.innerHTML;
                
                console.log('🔊 Audio request for:', italianText, 'ID:', wordId);
                
                // Show loading state
                audioBtn.innerHTML = \`
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
                  </svg>
                \`;
                audioBtn.disabled = true;

                // Mobile browsers often need user interaction first
                try {
                  // First, try pregenerated audio
                  console.log('🔍 Checking for pregenerated audio...');
                  const { data: audioData, error: audioError } = await supabaseClient
                    .from('word_audio_metadata')
                    .select('audio_filename, word_id, source_id, source_table')
                    .or(\`word_id.eq.\${wordId},source_id.eq.\${wordId}\`)
                    .limit(1)
                    .single();
                  
                  if (!audioError && audioData?.audio_filename) {
                    console.log('✅ Found pregenerated audio:', audioData.audio_filename);
                    
                    try {
                      const { data: signedUrl, error: urlError } = await supabaseClient.storage
                        .from('audio-files')
                        .createSignedUrl(audioData.audio_filename, 300); // 5 minutes
                      
                      if (!urlError && signedUrl?.signedUrl) {
                        console.log('🎵 Playing pregenerated audio');
                        
                        const audio = new Audio();
                        audio.preload = 'auto';
                        audio.src = signedUrl.signedUrl;
                        
                        return new Promise((resolve) => {
                          audio.oncanplaythrough = async () => {
                            try {
                              await audio.play();
                              console.log('✅ Pregenerated audio playing');
                            } catch (playError) {
                              console.log('❌ Pregenerated audio play failed:', playError);
                              fallbackToTTS(italianText, audioBtn, originalHTML);
                              resolve();
                            }
                          };
                          
                          audio.onended = () => {
                            console.log('✅ Pregenerated audio finished');
                            audioBtn.innerHTML = originalHTML;
                            audioBtn.disabled = false;
                            resolve();
                          };
                          
                          audio.onerror = (e) => {
                            console.log('❌ Pregenerated audio error:', e);
                            fallbackToTTS(italianText, audioBtn, originalHTML);
                            resolve();
                          };
                          
                          // Timeout fallback
                          setTimeout(() => {
                            if (audio.readyState < 2) {
                              console.log('⏰ Audio loading timeout, using TTS');
                              fallbackToTTS(italianText, audioBtn, originalHTML);
                              resolve();
                            }
                          }, 3000);
                        });
                      }
                    } catch (storageError) {
                      console.log('❌ Storage URL error:', storageError);
                    }
                  }
                  
                  console.log('📢 No pregenerated audio, using TTS');
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                  
                } catch (error) {
                  console.error('💥 Audio system error:', error);
                  fallbackToTTS(italianText, audioBtn, originalHTML);
                }
              }

              // Enhanced TTS with better mobile support and Italian voice selection
              function fallbackToTTS(text, audioBtn, originalHTML) {
                console.log('🗣️ Using TTS for:', text);
                
                if (!('speechSynthesis' in window)) {
                  console.log('❌ Speech synthesis not supported');
                  showAudioError(audioBtn, originalHTML);
                  return;
                }
                
                // Cancel any ongoing speech
                speechSynthesis.cancel();
                
                // Wait a bit for cancel to complete (mobile requirement)
                setTimeout(() => {
                  const utterance = new SpeechSynthesisUtterance(text);
                  
                  // Configure for Italian
                  utterance.lang = 'it-IT';
                  utterance.rate = 0.85;
                  utterance.pitch = 1.0;
                  utterance.volume = 1.0;
                  
                  // Try to find Italian voice
                  const voices = speechSynthesis.getVoices();
                  const italianVoice = voices.find(voice => {
                    const lang = voice.lang.toLowerCase();
                    const name = voice.name.toLowerCase();
                    return lang.startsWith('it-') || 
                           lang.includes('italian') || 
                           name.includes('italian') ||
                           name.includes('italia');
                  });
                  
                  if (italianVoice) {
                    utterance.voice = italianVoice;
                    console.log('🇮🇹 Using Italian voice:', italianVoice.name, '(' + italianVoice.lang + ')');
                  } else {
                    console.log('⚠️ No Italian voice found, using default with it-IT');
                  }
                  
                  let hasStarted = false;
                  
                  utterance.onstart = () => {
                    hasStarted = true;
                    console.log('🗣️ TTS started');
                  };
                  
                  utterance.onend = () => {
                    console.log('✅ TTS finished');
                    audioBtn.innerHTML = originalHTML;
                    audioBtn.disabled = false;
                  };
                  
                  utterance.onerror = (e) => {
                    console.error('❌ TTS error:', e.error);
                    showAudioError(audioBtn, originalHTML);
                  };
                  
                  // Timeout fallback for mobile
                  setTimeout(() => {
                    if (!hasStarted) {
                      console.log('⏰ TTS timeout');
                      showAudioError(audioBtn, originalHTML);
                    }
                  }, 5000);
                  
                  try {
                    speechSynthesis.speak(utterance);
                  } catch (speakError) {
                    console.error('❌ TTS speak error:', speakError);
                    showAudioError(audioBtn, originalHTML);
                  }
                }, 100);
              }
              
              function showAudioError(audioBtn, originalHTML) {
                audioBtn.innerHTML = \`
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-red-500">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
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
                  // Mobile browsers need this event
                  speechSynthesis.onvoiceschanged = () => {
                    const voices = speechSynthesis.getVoices();
                    console.log('🔄 Voices loaded:', voices.length);
                    const italianVoices = voices.filter(v => v.lang.startsWith('it'));
                    console.log('🇮🇹 Italian voices:', italianVoices.map(v => \`\${v.name} (\${v.lang})\`));
                  };
                  
                  // Trigger voices loading
                  speechSynthesis.getVoices();
                }
              }
              
              // Initialize on load
              initializeVoices();

              // Make functions global for onclick handlers
              window.playAudio = playAudio;
              window.dictionarySystem = dictionarySystem;
            });
          `
        }} />
      </body>
    </html>
  )
}
