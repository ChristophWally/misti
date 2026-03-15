// lib/filter-utils.js
// Filter management utilities for Misti Italian Learning App
// Handles dictionary search filters and grammar-specific filtering

/**
 * Grammar filter options organized by word type
 * Used to show relevant filters based on selected word types
 */
export const grammarFiltersByType = {
  'NOUN': [
    // Note: plural-e and plural-i removed - now handled by dedicated Plural Formation section
    // Note: 'plural-invariable' and 'plural-irregular' removed - they don't exist in meta_values system
  ],
  'VERB': [
    // Verb type, auxiliary type, and reflexive indicator moved to dedicated sections
    // Keep any truly mixed grammar items here if needed in future
  ],
  'ADJECTIVE': [
    { value: 'form-invariable', label: 'Invariable' },
    { value: 'form-irregular', label: 'Irregular forms' },
    { value: 'gradable-analytical', label: '📊 Analytical Gradable' },
    { value: 'gradable-full', label: 'Fully Gradable' },
    { value: 'gradable-none', label: '🚫 Non-gradable' },
    { value: 'type-absolute', label: 'Absolute' }
  ],
  'ADVERB': [
    { value: 'type-manner', label: 'Manner' },
    { value: 'type-time', label: 'Time' },
    { value: 'type-place', label: 'Place' },
    { value: 'type-quantity', label: 'Quantity' },
    { value: 'type-frequency', label: 'Frequency' },
    { value: 'type-affirming', label: 'Affirming' },
    { value: 'type-negating', label: 'Negating' },
    { value: 'type-doubting', label: 'Doubting' },
    { value: 'type-interrogative', label: 'Question' }
  ],
  'ALL': [
    // Frequency filters moved to dedicated Frequency section in Advanced Filters
    // Advanced CEFR levels moved to cefrLevels with "Beyond -" prefix
  ]
}

/**
 * Topic-based filters that apply to all word types
 */
export const topicFilters = [
  { value: 'topic-place', label: 'Places 🌍' },
  { value: 'topic-food', label: 'Food 🍕' },
  { value: 'topic-bodypart', label: 'Body Parts 👁️' },
  { value: 'topic-profession', label: 'Jobs 👩‍💼' },
  { value: 'topic-abstract', label: 'Abstract 💭' },
  { value: 'topic-daily-life', label: 'Daily Life 🏡' }
]

/**
 * Frequency tier filters for word frequency ranking
 */
export const frequencyFilters = [
  { value: 'freq-top100', label: 'Top 100 ⭐' },
  { value: 'freq-top500', label: 'Top 500 ⭐' },
  { value: 'freq-top1000', label: 'Top 1K ⭐' },
  { value: 'freq-top2500', label: 'Top 2.5K ⭐' },
  { value: 'freq-top5000', label: 'Top 5K ⭐' },
  { value: 'freq-top10000', label: 'Top 10K ⭐' }
]

/**
 * Register formality level filters
 */
export const registerFilters = [
  { value: 'register-formal', label: '🎩 Formal' },
  { value: 'register-casual', label: '👕 Casual' },
  { value: 'register-mixed', label: '⚖️ Mixed' }
  // Note: 'register-neutral' intentionally excluded as it's the default/not displayed
]

/**
 * Transitivity filters for verbs
 */
export const transitivityFilters = [
  { value: 'transitive-verb', label: 'Transitive' },
  { value: 'intransitive-verb', label: 'Intransitive' },
  { value: 'both-transitivity', label: 'Ambitransitive' }
]

/**
 * Reflexive type filters for verbs
 */
export const reflexiveTypeFilters = [
  { value: 'reflexive-type-direct', label: '🔄 Direct Reflexive' },
  { value: 'reflexive-type-reciprocal', label: '🫂 Reciprocal' }
]

/**
 * Verb type filters (conjugation patterns)
 */
export const verbTypeFilters = [
  { value: 'are-conjugation', label: '-are verbs' },
  { value: 'ere-conjugation', label: '-ere verbs' },
  { value: 'ire-conjugation', label: '-ire verbs' },
  { value: 'ire-isc-conjugation', label: '-isc verbs' }
]

/**
 * Auxiliary type filters (auxiliary usage)
 */
export const auxiliaryTypeFilters = [
  { value: 'avere-auxiliary', label: 'Uses avere' },
  { value: 'essere-auxiliary', label: 'Uses essere' },
  { value: 'both-auxiliary', label: 'Uses av./ess.' }
]

/**
 * Reflexive indicator filters (reflexive status)
 */
export const reflexiveIndicatorFilters = [
  { value: 'reflexive-verb', label: 'Reflexive' }
]

/**
 * CEFR level filters
 */
export const cefrLevels = [
  { value: '', label: 'All Levels' },
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficiency' },
  { value: 'native', label: 'Beyond - Native 🗣️' },
  { value: 'academic', label: 'Beyond - Academic 🎓' },
  { value: 'literary', label: 'Beyond - Literary 📜' },
  { value: 'specialized', label: 'Beyond - Specialized ⚙️' },
  { value: 'business', label: 'Beyond - Business 💼' },
  { value: 'regional', label: 'Beyond - Regional 🗺️' }
]

/**
 * Number filters for nouns (single-select)
 */
export const numberFilters = [
  { value: 'singolare', label: 'Singular' },
  { value: 'plurale', label: 'Plural' }
]

/**
 * Number restriction filters for nouns (single-select)
 */
export const numberRestrictionFilters = [
  { value: 'singular-only', label: 'Singular Only' },
  { value: 'plural-only', label: 'Plural Only' }
]

/**
 * Word type filters
 */
export const wordTypeFilters = [
  { value: '', label: 'All Types' },
  { value: 'NOUN', label: 'Nouns' },
  { value: 'VERB', label: 'Verbs' },
  { value: 'ADJECTIVE', label: 'Adjectives' },
  { value: 'ADVERB', label: 'Adverbs' }
]

/**
 * Create initial filter state
 */
export function createInitialFilters() {
  return {
    wordType: '', // Changed from array to string for single-select
    cefrLevel: '',
    numberFilter: '', // Single-select for noun number
    numberRestriction: '', // Single-select for noun number restriction
    tags: [],
    searchTerm: ''
  }
}

/**
 * Get applicable grammar filters based on selected word type
 * @param {string} selectedWordType - Selected word type string
 * @returns {Object[]} Array of applicable filter options
 */
export function getApplicableGrammarFilters(selectedWordType) {
  const types = !selectedWordType || selectedWordType === '' ? ['ALL'] : [selectedWordType]
  
  // Collect all applicable filters
  let applicableFilters = []
  types.forEach(type => {
    if (grammarFiltersByType[type]) {
      applicableFilters = applicableFilters.concat(grammarFiltersByType[type])
    }
  })
  
  // Always include universal filters
  applicableFilters = applicableFilters.concat(grammarFiltersByType['ALL'])
  
  // Remove duplicates
  const uniqueFilters = applicableFilters.filter((filter, index, self) => 
    index === self.findIndex(f => f.value === filter.value)
  )
  
  return uniqueFilters
}

/**
 * Update grammar filters in the DOM based on selected word types
 * @param {string[]} selectedWordTypes - Currently selected word types
 * @param {string[]} activeTags - Currently active tag filters
 * @param {HTMLElement} grammarContainer - DOM element to update
 */
export function updateGrammarFiltersDisplay(selectedWordTypes, activeTags, grammarContainer) {
  const applicableFilters = getApplicableGrammarFilters(selectedWordTypes)
  
  // Animate transition
  grammarContainer.style.opacity = '0.5'
  grammarContainer.style.transform = 'translateY(-10px)'
  
  setTimeout(() => {
    grammarContainer.innerHTML = applicableFilters
      .map(filter => `
        <span class="filter-chip ${activeTags.includes(filter.value) ? 'active' : ''}" 
              data-filter="tags" 
              data-value="${filter.value}">
          ${filter.label}
        </span>
      `)
      .join('')
    
    grammarContainer.style.opacity = '1'
    grammarContainer.style.transform = 'translateY(0)'
  }, 150)
}

/**
 * Handle filter chip click logic
 * @param {string} filterType - Type of filter (wordType, cefrLevel, tags)
 * @param {string} filterValue - Value of the clicked filter
 * @param {Object} currentFilters - Current filter state
 * @param {HTMLElement} clickedElement - The clicked DOM element
 * @returns {Object} Updated filter state
 */
export function handleFilterChipClick(filterType, filterValue, currentFilters, clickedElement) {
  const newFilters = { ...currentFilters }
  
  if (filterType === 'wordType') {
    // Handle single-select for word types
    const siblings = clickedElement.parentElement.querySelectorAll('.filter-chip')
    
    // If clicking the same filter that's already active, keep it active (no deselect)
    if (newFilters.wordType === filterValue) {
      return newFilters // No change needed
    }
    
    // Deactivate all chips and activate the clicked one
    siblings.forEach(chip => chip.classList.remove('active'))
    clickedElement.classList.add('active')
    newFilters.wordType = filterValue
    
  } else if (filterType === 'tags') {
    // Check if this is a frequency filter (single-select, hierarchical)
    if (filterValue.startsWith('freq-')) {
      // Handle single-select for frequency filters
      const siblings = clickedElement.parentElement.querySelectorAll('.filter-chip')
      
      // If clicking the same filter, deselect it
      if (newFilters.tags.some(tag => tag.startsWith('freq-')) && 
          newFilters.tags.includes(filterValue)) {
        newFilters.tags = newFilters.tags.filter(tag => !tag.startsWith('freq-'))
        siblings.forEach(chip => chip.classList.remove('active'))
      } else {
        // Remove any existing frequency filters and add new one
        newFilters.tags = newFilters.tags.filter(tag => !tag.startsWith('freq-'))
        newFilters.tags.push(filterValue)
        
        siblings.forEach(chip => chip.classList.remove('active'))
        clickedElement.classList.add('active')
      }
    } else {
      // Handle multi-select for other tags
      if (newFilters.tags.includes(filterValue)) {
        newFilters.tags = newFilters.tags.filter(tag => tag !== filterValue)
        clickedElement.classList.remove('active')
      } else {
        newFilters.tags.push(filterValue)
        clickedElement.classList.add('active')
      }
    }
    
  } else {
    // Handle single-select for CEFR level and Number filters with deselection
    const siblings = clickedElement.parentElement.querySelectorAll('.filter-chip')
    
    // If clicking the same filter that's already active, deselect it
    if (newFilters[filterType] === filterValue) {
      newFilters[filterType] = ''
      siblings.forEach(chip => chip.classList.remove('active'))
    } else {
      // Select the new filter
      siblings.forEach(chip => chip.classList.remove('active'))
      clickedElement.classList.add('active')
      newFilters[filterType] = filterValue
    }
  }
  
  return newFilters
}

/**
 * Convert filter state to query parameters for Supabase
 * @param {Object} filters - Current filter state
 * @returns {Object} Query parameters for database query
 */
export function filtersToQueryParams(filters) {
  const queryParams = {}
  
  if (filters.wordType && filters.wordType.length > 0) {
    queryParams.wordType = filters.wordType
  }
  
  if (filters.cefrLevel) {
    queryParams.cefrLevel = filters.cefrLevel
  }
  
  if (filters.numberRestriction) {
    queryParams.numberRestriction = filters.numberRestriction
  }
  
  if (filters.tags && filters.tags.length > 0) {
    queryParams.tags = filters.tags
  }
  
  return queryParams
}

/**
 * Reset all filters to default state
 * @param {HTMLElement} filterContainer - Container with filter chips
 * @returns {Object} Default filter state
 */
export function resetFilters(filterContainer) {
  // Remove active class from all chips
  const allChips = filterContainer.querySelectorAll('.filter-chip')
  allChips.forEach(chip => chip.classList.remove('active'))
  
  // Activate default "All" chips
  const defaultChips = filterContainer.querySelectorAll('[data-value=""]')
  defaultChips.forEach(chip => chip.classList.add('active'))
  
  return createInitialFilters()
}

/**
 * Get readable filter description for display
 * @param {Object} filters - Current filter state
 * @returns {string} Human-readable description of active filters
 */
export function getFilterDescription(filters) {
  const parts = []
  
  if (filters.wordType && filters.wordType.length > 0) {
    parts.push(`Types: ${filters.wordType.join(', ')}`)
  }
  
  if (filters.cefrLevel) {
    parts.push(`Level: ${filters.cefrLevel}`)
  }
  
  if (filters.tags && filters.tags.length > 0) {
    parts.push(`Tags: ${filters.tags.length} selected`)
  }
  
  if (filters.searchTerm) {
    parts.push(`Search: "${filters.searchTerm}"`)
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'All words'
}
