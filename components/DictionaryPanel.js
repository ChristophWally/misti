'use client'

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
  // State management (existing)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(createInitialFilters())
  const [words, setWords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dictionarySystem] = useState(() => new EnhancedDictionarySystem(supabase))

  // Resize functionality state (existing)
  const [isResizing, setIsResizing] = useState(false)
  const [panelWidth, setPanelWidth] = useState(null)

  // Debounced search (existing)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Load words with current filters (existing)
  const loadWords = useCallback(async (term = searchTerm, currentFilters = filters) => {
    setIsLoading(true)
    try {
      const processedFilters = {
        ...currentFilters,
        wordType: currentFilters.wordType?.length > 0 ? currentFilters.wordType : undefined
      }
      
      console.log('📚 Loading words with enhanced translation data:', processedFilters)
      const results = await dictionarySystem.loadWordsWithTranslations(term, processedFilters)
      console.log(`✅ Loaded ${results.length} words with translation data`)
      
      // Log sample translation data for debugging
      if (results.length > 0) {
        const sampleWord = results.find(w => w.processedTranslations?.length > 1) || results[0]
        console.log('📋 Sample word with translations:', {
          italian: sampleWord.italian,
          translations: sampleWord.processedTranslations?.map(t => ({
            translation: t.translation,
            priority: t.priority,
            isPrimary: t.isPrimary
          }))
        })
      }
      
      setWords(results)
    } catch (error) {
      console.error('❌ Error loading words:', error)
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }, [dictionarySystem, searchTerm, filters])

  // Handle search input with debouncing (existing)
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      loadWords(value, filters)
    }, 300)
    
    setSearchTimeout(timeout)
  }

  // Handle filter changes (existing)
  const handleFilterChange = (filterType, filterValue, clickedElement = null) => {
    let newFilters
    
    if (clickedElement) {
      newFilters = handleFilterChipClick(filterType, filterValue, filters, clickedElement)
    } else {
      newFilters = { ...filters, [filterType]: filterValue }
    }
    
    console.log('🔍 Filter changed:', { filterType, filterValue, newFilters })
    setFilters(newFilters)
    loadWords(searchTerm, newFilters)
  }

  // Handle filter chip clicks (existing)
  const handleChipClick = (event) => {
    const chip = event.target
    if (!chip.classList.contains('filter-chip')) return
    
    const filterType = chip.dataset.filter
    const filterValue = chip.dataset.value
    
    handleFilterChange(filterType, filterValue, chip)
  }

  // ENHANCED: Handle add to deck with translation-specific information
  const handleAddToDeck = (word, selectedTranslation = null) => {
    console.log('📚 Adding to deck:', {
      word: word.italian,
      wordType: word.word_type,
      selectedTranslation: selectedTranslation ? {
        translation: selectedTranslation.translation,
        priority: selectedTranslation.priority,
        isPrimary: selectedTranslation.isPrimary,
        contextInfo: selectedTranslation.contextInfo
      } : null,
      totalTranslations: word.processedTranslations?.length || 1
    })

    // For now, just log the action - this will be connected to SRS system later
    if (selectedTranslation) {
      console.log(`🎯 Specific translation selected: "${selectedTranslation.translation}"`)
      console.log('📋 Context info:', selectedTranslation.contextInfo)
      console.log('📝 Usage notes:', selectedTranslation.usageNotes)
      
      // Show user feedback for translation-specific addition
      const feedbackMessage = `Added "${word.italian}" with meaning "${selectedTranslation.translation}" to study deck`
      showUserFeedback(feedbackMessage, 'success')
    } else {
      // Fallback for single-translation words
      console.log(`📖 Adding word with primary translation: "${word.english}"`)
      const feedbackMessage = `Added "${word.italian}" to study deck`
      showUserFeedback(feedbackMessage, 'success')
    }
  }

  // NEW: Show user feedback for actions
  const showUserFeedback = (message, type = 'info') => {
    // Create temporary feedback notification
    const feedback = document.createElement('div')
    feedback.className = `
      fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white font-medium
      transition-all duration-300 transform translate-x-0
      ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
    `
    feedback.textContent = message
    document.body.appendChild(feedback)

    // Auto-remove after 3 seconds
    setTimeout(() => {
      feedback.style.transform = 'translateX(full)'
      feedback.style.opacity = '0'
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback)
        }
      }, 300)
    }, 3000)
  }

  // Resize functionality (existing)
  const startResize = (e) => {
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = panelWidth || (window.innerWidth * 0.5)
    
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

  // Get applicable grammar filters (existing)
  const grammarFilters = getApplicableGrammarFilters(filters.wordType)

  // Load words immediately when panel opens (existing)
  useEffect(() => {
    if (isOpen) {
      console.log('📖 Dictionary panel opened, loading initial words...')
      loadWords('', createInitialFilters())
    }
  }, [isOpen])

  // Cleanup timeout on unmount (existing)
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Cleanup resize listeners when panel closes (existing)
  useEffect(() => {
    if (!isOpen) {
      setIsResizing(false)
    }
  }, [isOpen])

  // NEW: Calculate statistics for display
  const getDisplayStats = () => {
    const totalWords = words.length
    const wordsWithMultipleTranslations = words.filter(w => w.processedTranslations?.length > 1).length
    const totalTranslations = words.reduce((sum, w) => sum + (w.processedTranslations?.length || 1), 0)
    
    return {
      totalWords,
      wordsWithMultipleTranslations,
      totalTranslations
    }
  }

  const stats = getDisplayStats()

  return (
    <>
      {/* Overlay with proper fade animation timing */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Panel with proper slide animation */}
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
          {/* Header with enhanced info */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-500">
            <div>
              <h2 className="text-lg font-semibold text-white nav-title-sketchy">Dictionary</h2>
              {/* NEW: Translation stats */}
              {stats.totalWords > 0 && (
                <p className="text-sm text-cyan-100 mt-1">
                  {stats.totalWords} words • {stats.totalTranslations} translations
                  {stats.wordsWithMultipleTranslations > 0 && (
                    <span className="ml-2 text-cyan-200">
                      ({stats.wordsWithMultipleTranslations} with multiple meanings)
                    </span>
                  )}
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-cyan-200 text-xl nav-btn-sketchy"
            >
              ✕
            </button>
          </div>

          {/* Search and Filters (existing) */}
          <div className="p-4 border-b bg-cyan-50">
            <div className="space-y-3">
              {/* Search Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Italian words and meanings..."
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
              
              {/* Advanced Filters (existing) */}
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
