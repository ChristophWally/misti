'use client'

// components/TranslationSelector.js
// Translation selection interface for multiple word meanings

import { useState, useEffect } from 'react'

export default function TranslationSelector({
  translations = [],
  selectedTranslationId,
  onTranslationChange,
  currentFormContext = null, // { number: 'singular'|'plural', person: 'io'|'tu'|etc }
  className = ''
}) {
  const [tooltip, setTooltip] = useState({ show: false, content: '', id: null })

  // Sort translations by priority (primary first)
  const sortedTranslations = translations.sort((a, b) => a.display_priority - b.display_priority)

  // Check if translation is available for current context
  const isTranslationAvailable = (translation) => {
    if (!currentFormContext) return true
    
    const contextMetadata = translation.context_metadata || {}
    
    // Check plurality restrictions
    if (contextMetadata.plurality === 'plural-only' && currentFormContext.number === 'singular') {
      return false
    }
    if (contextMetadata.plurality === 'singular-only' && currentFormContext.number === 'plural') {
      return false
    }
    
    return true
  }

  // Get context hint for translation
  const getContextHint = (translation) => {
    const contextMetadata = translation.context_metadata || {}
    const hints = []
    
    if (contextMetadata.usage) {
      hints.push(contextMetadata.usage)
    }
    if (contextMetadata.plurality) {
      hints.push(contextMetadata.plurality.replace('-', ' '))
    }
    if (contextMetadata.semantic_type) {
      hints.push(contextMetadata.semantic_type.replace('-', ' '))
    }
    
    return hints.join(' • ')
  }

  // Handle tooltip show/hide
  const showTooltip = (translationId, content) => {
    setTooltip({ show: true, content, id: translationId })
  }

  const hideTooltip = () => {
    setTooltip({ show: false, content: '', id: null })
  }

  // Handle translation selection
  const handleTranslationSelect = (translationId) => {
    const translation = translations.find(t => t.id === translationId)
    if (translation && isTranslationAvailable(translation)) {
      onTranslationChange(translationId)
    }
  }

  return (
    <div className={`translation-selector ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Select Translation Meaning
      </label>
      
      <div className="flex flex-wrap gap-3">
        {sortedTranslations.map((translation, index) => {
          const isSelected = selectedTranslationId === translation.id
          const isAvailable = isTranslationAvailable(translation)
          const isPrimary = translation.display_priority === 1
          const contextHint = getContextHint(translation)
          
          return (
            <button
              key={translation.id}
              onClick={() => handleTranslationSelect(translation.id)}
              onMouseEnter={() => showTooltip(translation.id, translation.usage_notes || contextHint)}
              onMouseLeave={hideTooltip}
              disabled={!isAvailable}
              className={`
                relative px-4 py-3 rounded-xl border-2 transition-all duration-300 ease-in-out
                text-left min-w-[140px] flex-1 max-w-[300px]
                ${isAvailable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                ${isSelected 
                  ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-lg transform scale-105' 
                  : isAvailable 
                    ? 'border-gray-300 bg-white text-gray-700 hover:border-teal-300 hover:shadow-md' 
                    : 'border-gray-200 bg-gray-50 text-gray-400'
                }
                ${isPrimary ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                sketchy
              `}
              aria-pressed={isSelected}
              aria-describedby={`translation-${translation.id}-description`}
            >
              {/* Translation Text */}
              <div className="font-semibold text-base mb-1">
                {translation.translation}
              </div>
              
              {/* Priority and Context Indicators */}
              <div className="flex items-center gap-2 text-xs">
                {isPrimary && (
                  <span className={`
                    px-2 py-1 rounded-full font-medium
                    ${isSelected ? 'bg-teal-200 text-teal-800' : 'bg-blue-100 text-blue-600'}
                  `}>
                    Primary
                  </span>
                )}
                
                {contextHint && (
                  <span className={`
                    px-2 py-1 rounded-full font-medium
                    ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {contextHint}
                  </span>
                )}
                
                {!isAvailable && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">
                    Not Available
                  </span>
                )}
              </div>
              
              {/* Form Count Indicator */}
              {translation.assigned_forms > 0 && (
                <div className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                  {translation.assigned_forms}
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div className="mt-3 p-3 bg-gray-800 text-white text-sm rounded-lg">
          {tooltip.content}
        </div>
      )}
      
      {/* Hidden descriptions for screen readers */}
      {sortedTranslations.map(translation => (
        <div
          key={`desc-${translation.id}`}
          id={`translation-${translation.id}-description`}
          className="sr-only"
        >
          {translation.usage_notes || getContextHint(translation)}. 
          Priority {translation.display_priority}. 
          {translation.assigned_forms} forms available.
        </div>
      ))}
    </div>
  )
}
