'use client'

// components/DictionaryPanel.js
// Main dictionary panel component with search, filters, and word list

import { useState, useEffect, useCallback } from 'react'
import WordCard from './WordCard'
import { EnhancedDictionarySystem } from '../lib/enhanced-dictionary-system'
import { supabase } from '../lib/supabase'
import { 
  createInitialFilters, 
  getApplicableGrammarFilters, 
  handleFilterChipClick,
  wordTypeFilters,
  cefrLevels 
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

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Load words with current filters
  const loadWords = useCallback(async (term = searchTerm, currentFilters = filters) => {
    setIsLoading(true)
    try {
      const results = await dictionarySystem.loadWords(term, currentFilters)
      setWords(results)
    } catch (error) {
      console.error('Error loading words:', error)
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }, [dictionarySystem, searchTerm, filters])

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
  const handleAddToDeck = (word) => {
    // TODO: Implement deck addition logic
    console.log('Adding word to deck:', word.italian)
  }

  // Get applicable grammar filters
  const grammarFilters = getApplicableGrammarFilters(filters.wordType)

  // Load initial words
  useEffect(() => {
    if (isOpen) {
      loadWords()
    }
  }, [isOpen, loadWords])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        fixed inset-y-0 right-0 w-96 md:w-3/4 lg:w-2/3 xl:w-1/2 
        bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
        ${className}
      `}
      style={{ minWidth: '384px', maxWidth: '80vw' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-500">
            <h2 className="text-lg font-semibold text-white">Dictionary</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-cyan-200 text-xl"
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
                className="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              
              {/* Filter Toggle */}
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
              >
                <span className="mr-1">🔍</span> 
                Advanced Filters
                <span className={`ml-1 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="space-y-3 pt-2 border-t border-teal-200">
                  {/* Word Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Word Type
                    </label>
                    <div className="flex flex-wrap gap-2" onClick={handleChipClick}>
                      {wordTypeFilters.map(filter => (
                        <span
                          key={filter.value}
                          className={`filter-chip ${
                            (filter.value === '' && filters.wordType.length === 0) ||
                            filters.wordType.includes(filter.value) ? 'active' : ''
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
                  
                  {/* Grammar Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grammar
                    </label>
                    <div className="flex flex-wrap gap-2 transition-all duration-300" onClick={handleChipClick}>
                      {grammarFilters.map(filter => (
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
                </div>
              )}
            </div>
          </div>

          {/* Words List */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
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
                {searchTerm || filters.wordType.length > 0 || filters.cefrLevel || filters.tags.length > 0 
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
