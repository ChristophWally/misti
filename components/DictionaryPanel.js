'use client'

// components/DictionaryPanel.js
// FIXED: Restored slide-in/slide-out animations

import { useState, useEffect, useCallback } from 'react'
import WordCard from './WordCard'
import { EnhancedDictionarySystem } from '../lib/enhanced-dictionary-system'
import { supabase } from '../lib/supabase'
import { 
  createInitialFilters, 
  getApplicableGrammarFilters, 
  handleFilterChipClick,
  wordTypeFilters,
  cefrLevels,
  frequencyFilters,
  registerFilters,
  transitivityFilters,
  verbTypeFilters,
  auxiliaryTypeFilters,
  reflexiveIndicatorFilters,
  numberFilters,
  numberRestrictionFilters
} from '../lib/filter-utils'

export default function DictionaryPanel({ 
  isOpen, 
  onClose, 
  className = '' 
}) {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(createInitialFilters())
  const [words, setWords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dictionarySystem] = useState(() => new EnhancedDictionarySystem(supabase))

  // Resize functionality state
  const [isResizing, setIsResizing] = useState(false)
  const [panelWidth, setPanelWidth] = useState(null) // null = use CSS default

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Load words with current filters - FIXED to handle empty filters
  const loadWords = useCallback(async (term = searchTerm, currentFilters = filters) => {
    setIsLoading(true)
    try {
      // IMPORTANT FIX: Convert empty filters to work with your enhanced dictionary system
      const processedFilters = {
        ...currentFilters,
        // If no word type selected, don't filter by word type (show all)
        wordType: currentFilters.wordType ? [currentFilters.wordType] : undefined
      }
      
      console.log('Loading words with filters:', processedFilters)
      const results = await dictionarySystem.loadWordsNormalized(term, processedFilters)
      console.log('Loaded words:', results.length)
      setWords(results)
    } catch (error) {
      console.error('Error loading words:', error)
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }, [dictionarySystem, searchTerm, filters])

  // Initial load when panel opens
  useEffect(() => {
    if (isOpen) {
      // Load with empty search to show initial results
      loadWords('', filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Handle search input with debouncing
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      loadWords(value, filters)
    }, 300)
    
    setSearchTimeout(timeout)
  }

  // Handle filter changes
  const handleFilterChange = (filterType, filterValue, clickedElement = null) => {
    let newFilters
    
    if (clickedElement) {
      // Use the extracted filter utility
      newFilters = handleFilterChipClick(filterType, filterValue, filters, clickedElement)
    } else {
      // Simple filter update
      newFilters = { ...filters, [filterType]: filterValue }
    }
    
    console.log('Filter changed:', { filterType, filterValue, newFilters })
    setFilters(newFilters)
    loadWords(searchTerm, newFilters)
  }

  // Handle filter chip clicks
  const handleChipClick = (event) => {
    const chip = event.target
    if (!chip.classList.contains('filter-chip')) return
    
    const filterType = chip.dataset.filter
    const filterValue = chip.dataset.value
    
    handleFilterChange(filterType, filterValue, chip)
  }

  // Handle add to deck
  const handleAddToDeck = (word, translation = null, studyContext = null) => {
    console.log('handleAddToDeck called with:', { word, translation, studyContext })
    
    // Provide immediate user feedback
    let item = word.italian
    if (studyContext?.mode === 'pronunciation-group') {
      const groupLabel = studyContext.groupLabel || 'pronunciation group'
      const meaningCount = Array.isArray(studyContext.translations) ? studyContext.translations.length : 0
      item = `${word.italian} - ${groupLabel} (${meaningCount} meaning${meaningCount === 1 ? '' : 's'})`
    } else if (translation) {
      item = `${word.italian} - ${translation.translation}`
    }
    
    // Show visual feedback (you can replace this with a proper toast/notification system)
    try {
      alert(`Added to study deck: ${item}`)
      console.log('Alert shown successfully')
    } catch (error) {
      console.error('Error showing alert:', error)
    }
    
    // TODO: Implement actual deck addition logic
    console.log('Adding to deck:', {
      word: word.italian,
      translation: translation?.translation,
      studyContext
    })
  }

  // Resize functionality
  const startResize = (e) => {
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = panelWidth || (window.innerWidth * 0.5) // Default to 50% if no custom width
    
    const handleMouseMove = (e) => {
      const deltaX = startX - e.clientX
      const newWidth = startWidth + deltaX
      const minWidth = 384
      const maxWidth = window.innerWidth * 0.8
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPanelWidth(newWidth)
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Get applicable grammar filters
  const grammarFilters = getApplicableGrammarFilters(filters.wordType)

  // IMPORTANT: Load words immediately when panel opens (fixed default state)
  useEffect(() => {
    if (isOpen) {
      console.log('Panel opened, loading initial words...')
      loadWords('', createInitialFilters()) // Load with empty search and default filters
    }
  }, [isOpen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Cleanup resize listeners when panel closes
  useEffect(() => {
    if (!isOpen) {
      setIsResizing(false)
    }
  }, [isOpen])

  return (
    <>
      {/* FIXED: Overlay with proper fade animation timing */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* FIXED: Panel with proper slide animation */}
      <div 
        className={`
          fixed inset-y-0 right-0 bg-white shadow-xl z-50
          transition-transform duration-300 ease-in-out
          ${panelWidth ? '' : 'w-96 md:w-3/4 lg:w-2/3 xl:w-1/2'}
          ${className}
          ${isOpen ? 'transform translate-x-0' : 'transform translate-x-full'}
        `}
        style={{ 
          width: panelWidth ? `${panelWidth}px` : undefined,
          minWidth: '384px', 
          maxWidth: '80vw'
        }}
      >
        {/* Resize Handle */}
        <div 
          onMouseDown={startResize}
          className="resize-handle"
        />
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-500">
            <h2 className="text-lg font-semibold text-white nav-title-sketchy">Dictionary</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-cyan-200 text-xl nav-btn-sketchy"
            >
              ✕
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b bg-cyan-50">
            <div className="space-y-3">
              {/* Search Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Italian words..."
                className="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 search-input-sketchy"
              />
              
              {/* Filter Toggle */}
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-teal-600 hover:text-teal-800 flex items-center btn-sketchy"
              >
                <span className="mr-1">🔍</span> 
                Advanced Filters
                <span className={`ml-1 transform transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="max-h-64 overflow-y-auto space-y-3 pt-2 border-t border-teal-200">
                  {/* Word Type Filter - Single Select Chips */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Word Type
                    </label>
                    <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                      {wordTypeFilters.map(filter => (
                        <span
                          key={filter.value}
                          className={`filter-chip ${
                            filters.wordType === filter.value ? 'active' : ''
                          }`}
                          data-filter="wordType"
                          data-value={filter.value}
                        >
                          {filter.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* CEFR Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEFR Level
                    </label>
                    <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                      {cefrLevels.map(level => (
                        <span
                          key={level.value}
                          className={`filter-chip ${filters.cefrLevel === level.value ? 'active' : ''}`}
                          data-filter="cefrLevel"
                          data-value={level.value}
                        >
                          {level.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Frequency Tier Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency Tier
                    </label>
                    <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                      {frequencyFilters.map(freq => (
                        <span
                          key={freq.value}
                          className={`filter-chip ${filters.tags.includes(freq.value) ? 'active' : ''}`}
                          data-filter="tags"
                          data-value={freq.value}
                          title={`Frequency tier - ${freq.label.replace(' ⭐', '').replace('10K', '10,000')}`}
                        >
                          {freq.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Irregular Forms Filter - Show for all word types and "All Types" */}
                  {(filters.wordType === '' || filters.wordType === 'NOUN' || filters.wordType === 'VERB' || filters.wordType === 'ADJECTIVE' || filters.wordType === 'ADVERB') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Irregular Forms
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        <span
                          className={`filter-chip ${filters.tags.includes('irregular-pattern') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="irregular-pattern"
                          title="Words with irregular patterns"
                        >
                          ⚠️ Irregular
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Gender Filter - Show only when NOUN is selected */}
                  {filters.wordType === 'NOUN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        <span
                          className={`filter-chip ${filters.tags.includes('masculine') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="masculine"
                          title="Masculine gender requiring masculine articles (il, un)"
                        >
                          ♂ Masculine
                        </span>
                        <span
                          className={`filter-chip ${filters.tags.includes('feminine') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="feminine"
                          title="Feminine gender requiring feminine articles (la, una)"
                        >
                          ♀ Feminine
                        </span>
                        <span
                          className={`filter-chip ${filters.tags.includes('common-gender') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="common-gender"
                          title="Same form for both genders, determined by article"
                        >
                          ⚥ Common
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Register Filter - Show for non-VERB word types */}
                  {filters.wordType !== 'VERB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Register
                    </label>
                    <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                      {registerFilters.map(register => (
                        <span
                          key={register.value}
                          className={`filter-chip ${filters.tags.includes(register.value) ? 'active' : ''}`}
                          data-filter="tags"
                          data-value={register.value}
                          title={`Register formality - ${register.label.replace(/🎩|👕|⚖️/g, '').trim()}`}
                        >
                          {register.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}
                  
                  {/* Adverb Type Filter - Show only when ADVERB is selected */}
                  {filters.wordType === 'ADVERB' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adverb Type
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        {[
                          { value: 'manner', label: '🔧 Manner' },
                          { value: 'time', label: '⏰ Time' },
                          { value: 'place', label: '📍 Place' },
                          { value: 'quantity', label: '🔢 Quantity' },
                          { value: 'frequency', label: '🔄 Frequency' },
                          { value: 'affirmation', label: '✅ Affirmation' },
                          { value: 'doubt', label: '❓ Doubt' },
                          { value: 'negation', label: '❌ Negation' },
                          { value: 'interrogative', label: '❓ Question' },
                          { value: 'evaluation', label: '📊 Evaluation' },
                          { value: 'emphasis', label: '💪 Emphasis' }
                        ].map(adverbType => (
                          <span
                            key={adverbType.value}
                            className={`filter-chip ${filters.tags.includes(`adverb-${adverbType.value}`) ? 'active' : ''}`}
                            data-filter="tags"
                            data-value={`adverb-${adverbType.value}`}
                          >
                            {adverbType.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Pattern Filter - Show only when ADJECTIVE is selected */}
                  {filters.wordType === 'ADJECTIVE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Form Pattern
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        <span
                          className={`filter-chip ${filters.tags.includes('form-4') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="form-4"
                          title="Form pattern - Full agreement: rosso/rossa/rossi/rosse"
                        >
                          📋 4 Forms
                        </span>
                        <span
                          className={`filter-chip ${filters.tags.includes('form-2') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="form-2"
                          title="Form pattern - Limited agreement: grande/grandi"
                        >
                          📑 2 Forms
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Gradable Filter - Show only when ADJECTIVE is selected */}
                  {filters.wordType === 'ADJECTIVE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gradable
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        <span
                          className={`filter-chip ${filters.tags.includes('gradable-analytical') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="gradable-analytical"
                          title="Can form analytical comparatives with più/meno: più intelligente"
                        >
                          📊 Analytical
                        </span>
                        <span
                          className={`filter-chip ${filters.tags.includes('gradable-full') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="gradable-full"
                          title="Can form both analytical and synthetic comparatives: più bello, bellissimo"
                        >
                          Fully Gradable
                        </span>
                        <span
                          className={`filter-chip ${filters.tags.includes('gradable-none') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="gradable-none"
                          title="Cannot form comparatives: morto, perfetto"
                        >
                          🚫 Non-gradable
                        </span>
                      </div>
                    </div>
                  )}


                  {/* Number Filter - Show only when NOUN is selected */}
                  {filters.wordType === 'NOUN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        {numberFilters.map(filter => (
                          <span
                            key={filter.value}
                            className={`filter-chip ${filters.numberFilter === filter.value ? 'active' : ''}`}
                            data-filter="numberFilter"
                            data-value={filter.value}
                            title={filter.label}
                          >
                            {filter.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Number Restriction Filter - Show only when NOUN is selected */}
                  {filters.wordType === 'NOUN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number Restriction
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        {numberRestrictionFilters.map(filter => (
                          <span
                            key={filter.value}
                            className={`filter-chip ${filters.numberRestriction === filter.value ? 'active' : ''}`}
                            data-filter="numberRestriction"
                            data-value={filter.value}
                            title={filter.label}
                          >
                            {filter.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  {/* Verb Type Filters - Show only when VERB is selected */}
                  {filters.wordType === 'VERB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verb Type
                    </label>
                    <div className="flex flex-wrap gap-2 transition-all duration-300" onClick={handleChipClick}>
                      {verbTypeFilters.map(filter => (
                        <span
                          key={filter.value}
                          className={`filter-chip ${filters.tags.includes(filter.value) ? 'active' : ''}`}
                          data-filter="tags"
                          data-value={filter.value}
                        >
                          {filter.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Auxiliary Type Filters - Show only when VERB is selected */}
                  {filters.wordType === 'VERB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auxiliary Type
                    </label>
                    <div className="flex flex-wrap gap-2 transition-all duration-300" onClick={handleChipClick}>
                      {auxiliaryTypeFilters.map(filter => (
                        <span
                          key={filter.value}
                          className={`filter-chip ${filters.tags.includes(filter.value) ? 'active' : ''}`}
                          data-filter="tags"
                          data-value={filter.value}
                        >
                          {filter.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Reflexive Indicator Filters - Show only when VERB is selected */}
                  {filters.wordType === 'VERB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reflexive Indicator
                    </label>
                    <div className="flex flex-wrap gap-2 transition-all duration-300" onClick={handleChipClick}>
                      {reflexiveIndicatorFilters.map(filter => (
                        <span
                          key={filter.value}
                          className={`filter-chip ${filters.tags.includes(filter.value) ? 'active' : ''}`}
                          data-filter="tags"
                          data-value={filter.value}
                        >
                          {filter.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Transitivity Filter - Show only when VERB is selected */}
                  {filters.wordType === 'VERB' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transitivity
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        {transitivityFilters.map(transitivity => (
                          <span
                            key={transitivity.value}
                            className={`filter-chip ${filters.tags.includes(transitivity.value) ? 'active' : ''}`}
                            data-filter="tags"
                            data-value={transitivity.value}
                            title={`Transitivity - ${transitivity.label.replace(/🎯|🌀|⚖️/g, '').trim()}`}
                          >
                            {transitivity.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Register Filter - Show only when VERB is selected */}
                  {filters.wordType === 'VERB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Register
                    </label>
                    <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                      {registerFilters.map(register => (
                        <span
                          key={register.value}
                          className={`filter-chip ${filters.tags.includes(register.value) ? 'active' : ''}`}
                          data-filter="tags"
                          data-value={register.value}
                          title={`Register formality - ${register.label.replace(/🎩|👕|⚖️/g, '').trim()}`}
                        >
                          {register.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}




                  {/* Plural Formation Filter - Show only when NOUN is selected */}
                  {filters.wordType === 'NOUN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plural Formation
                      </label>
                      <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                        <span
                          className={`filter-chip ${filters.tags.includes('plural-e') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="plural-e"
                          title="Nouns that form plural by changing -a to -e (casa → case)"
                        >
                          plural-e
                        </span>
                        <span
                          className={`filter-chip ${filters.tags.includes('plural-i') ? 'active' : ''}`}
                          data-filter="tags"
                          data-value="plural-i"
                          title="Nouns that form plural by changing -o to -i (libro → libri)"
                        >
                          plural-i
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Words List */}
          <div className="flex-1 overflow-y-auto p-4 bg-white dictionary-panel">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-teal-600">Loading words...</span>
                </div>
              </div>
            ) : words.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filters.wordType || filters.cefrLevel || filters.tags.length > 0 
                  ? 'No words found matching your filters' 
                  : 'No words available'
                }
              </div>
            ) : (
              <div className="space-y-3">
                {words.map(word => (
                  <WordCard
                    key={word.id}
                    word={word}
                    onAddToDeck={handleAddToDeck}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
