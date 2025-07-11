// lib/filter-utils.js
// Filter management utilities for Misti Italian Learning App
// Handles dictionary search filters and grammar-specific filtering

/**
 * Grammar filter options organized by word type
 * Used to show relevant filters based on selected word types
 */
export const grammarFiltersByType = {
  'NOUN': [
    { value: 'masculine', label: 'Masculine ♂' },
    { value: 'feminine', label: 'Feminine ♀' },
    { value: 'common-gender', label: 'Common ⚥' },
    { value: 'plural-i', label: 'Plural -i' },
    { value: 'plural-e', label: 'Plural -e' },
    { value: 'plural-invariable', label: 'Invariable' },
    { value: 'plural-irregular', label: 'Irregular Plural' }
  ],
  'VERB': [
    { value: 'are-conjugation', label: '-are verbs' },
    { value: 'ere-conjugation', label: '-ere verbs' },
    { value: 'ire-conjugation', label: '-ire verbs' },
    { value: 'ire-isc-conjugation', label: '-isc verbs' },
    { value: 'avere-auxiliary', label: 'Uses avere' },
    { value: 'essere-auxiliary', label: 'Uses essere' },
    { value: 'both-auxiliary', label: 'Uses both' },
    { value: 'transitive-verb', label: 'Transitive' },
    { value: 'intransitive-verb', label: 'Intransitive' },
    { value: 'both-transitivity', label: 'Both trans/intrans' },
    { value: 'reflexive-verb', label: 'Reflexive' },
    { value: 'modal-verb', label: 'Modal' },
    { value: 'impersonal-verb', label: 'Impersonal' }
  ],
  'ADJECTIVE': [
    { value: 'form-4', label: '4 forms (-o/-a/-i/-e)' },
    { value: 'form-2', label: '2 forms (-e/-i)' },
    { value: 'form-invariable', label: 'Invariable' },
    { value: 'form-irregular', label: 'Irregular forms' },
    { value: 'type-gradable', label: 'Gradable' },
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
    { value: 'irregular-pattern', label: 'Irregular ⚠️' },
    { value: 'freq-top100', label: 'Top 100 ⭐' },
    { value: 'freq-top500', label: 'Top 500 ⭐' },
    { value: 'freq-top1000', label: 'Top 1K ⭐' },
    { value: 'freq-top5000', label: 'Top 5K ⭐' },
    { value: 'native', label: 'Native 🗣️' },
    { value: 'business', label: 'Business 💼' },
    { value: 'academic', label: 'Academic 🎓' },
    { value: 'literary', label: 'Literary 📜' },
    { value: 'regional', label: 'Regional 🗺️' }
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
 * CEFR level filters
 */
export const cefrLevels = [
  { value: '', label: 'All Levels' },
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficiency' }
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
    wordType: [],
    cefrLevel: '',
    tags: [],
    searchTerm: ''
  }
}

/**
 * Get applicable grammar filters based on selected word types
 * @param {string[]} selectedWordTypes - Array of selected word types
 * @returns {Object[]} Array of applicable filter options
 */
export function getApplicableGrammarFilters(selectedWordTypes) {
  const types = selectedWordTypes.length === 0 ? ['ALL'] : selectedWordTypes
  
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
    // Handle multi-select for word types
    if (filterValue === '') {
      // "All" selected - clear all others
      const siblings = clickedElement.parentElement.querySelectorAll('.filter-chip')
      siblings.forEach(chip => chip.classList.remove('active'))
      clickedElement.classList.add('active')
      newFilters.wordType = []
    } else {
      // Specific type selected
      const allChip = clickedElement.parentElement.querySelector('[data-value=""]')
      if (allChip) allChip.classList.remove('active')
      
      // Toggle this chip
      if (newFilters.wordType.includes(filterValue)) {
        newFilters.wordType = newFilters.wordType.filter(type => type !== filterValue)
        clickedElement.classList.remove('active')
      } else {
        newFilters.wordType.push(filterValue)
        clickedElement.classList.add('active')
      }
      
      // If no types selected, activate "All"
      if (newFilters.wordType.length === 0 && allChip) {
        allChip.classList.add('active')
      }
    }
    
  } else if (filterType === 'tags') {
    // Handle multi-select for tags
    if (newFilters.tags.includes(filterValue)) {
      newFilters.tags = newFilters.tags.filter(tag => tag !== filterValue)
      clickedElement.classList.remove('active')
    } else {
      newFilters.tags.push(filterValue)
      clickedElement.classList.add('active')
    }
    
  } else {
    // Handle single-select for CEFR level
    const siblings = clickedElement.parentElement.querySelectorAll('.filter-chip')
    siblings.forEach(chip => chip.classList.remove('active'))
    clickedElement.classList.add('active')
    newFilters[filterType] = filterValue
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
