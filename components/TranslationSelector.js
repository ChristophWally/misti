'use client'

// components/TranslationSelector.js
// Compact dropdown with beautiful context tags

import { useState, useRef, useEffect } from 'react'
import { renderRestrictionIndicators } from '../lib/restriction-utils'

export default function TranslationSelector({
  translations = [],
  selectedTranslationId,
  onTranslationChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const sortedTranslations = translations.sort((a, b) => a.display_priority - b.display_priority)
  const selectedTranslation = translations.find(t => t.id === selectedTranslationId)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Parse context metadata into visual tags
  const getContextTags = (translation) => {
    const metadata = translation.context_metadata || {}
    const tags = []

    if (metadata.usage) {
      tags.push({
        text: metadata.usage.replace('-', ' '),
        color: metadata.usage === 'reciprocal' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
      })
    }

    if (metadata.plurality) {
      tags.push({
        text: metadata.plurality.replace('-', ' '),
        color: metadata.plurality === 'plural-only' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
      })
    }

    if (metadata.semantic_type) {
      tags.push({
        text: metadata.semantic_type.replace('-', ' '),
        color: 'bg-gray-100 text-gray-700'
      })
    }

    return tags
  }

  const getRestrictionIndicators = (translation) => {
    const metadata = translation.context_metadata || {}
    return renderRestrictionIndicators(metadata, 'restriction-symbol-dropdown')
  }

  return (
    <div className={`translation-selector-compact relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Translation Meaning
      </label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-white border-2 border-teal-600 rounded-lg font-medium text-left flex items-center justify-between hover:border-teal-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-teal-800 font-semibold truncate">
              {selectedTranslation?.translation || 'Select translation'}
            </span>
            {selectedTranslation?.display_priority === 1 && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium flex-shrink-0">
                Primary
              </span>
            )}
          </div>
          <span className={`transform transition-transform duration-200 text-teal-600 ml-2 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {sortedTranslations.map((translation, index) => {
              const isSelected = selectedTranslationId === translation.id
              const isPrimary = translation.display_priority === 1
              const contextTags = getContextTags(translation)

              return (
                <button
                  key={translation.id}
                  onClick={() => {
                    onTranslationChange(translation.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-4 transition-all duration-150 ${
                    index !== sortedTranslations.length - 1 ? 'border-b border-gray-100' : ''
                  } ${
                    isSelected 
                      ? 'bg-teal-50 hover:bg-teal-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Main translation text and selection indicator */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`font-semibold text-base truncate ${
                        isSelected ? 'text-teal-800' : 'text-gray-800'
                      }`}>
                        {translation.translation}
                      </span>
                      {getRestrictionIndicators(translation).map((indicator) => (
                        <span
                          key={indicator.key}
                          className={indicator.className}
                          title={indicator.title}
                        >
                          {indicator.symbol}
                        </span>
                      ))}
                      {isPrimary && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium flex-shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-teal-600 text-lg flex-shrink-0 ml-2">✓</span>
                    )}
                  </div>

                  {/* Context tags */}
                  {contextTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {contextTags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${tag.color}`}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Usage notes */}
                  {translation.usage_notes && (
                    <div className={`text-sm mt-1 ${
                      isSelected ? 'text-teal-700' : 'text-gray-600'
                    }`}>
                      {translation.usage_notes}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
