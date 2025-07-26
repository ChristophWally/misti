'use client'

// components/TranslationSelector.js
// ENHANCED: Complete smooth animations and better interactions

import { useState, useRef, useEffect } from 'react'

export default function TranslationSelector({
  translations = [],
  selectedTranslationId,
  onTranslationChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const dropdownRef = useRef(null)

  const sortedTranslations = translations.sort((a, b) => a.display_priority - b.display_priority)
  const selectedTranslation = translations.find(t => t.id === selectedTranslationId)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) toggleDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false)
      setTimeout(() => setVisible(false), 200)
    } else {
      setVisible(true)
      setIsOpen(true)
    }
  }

  // Simple selection
  const handleSelect = (translationId) => {
    if (translationId === selectedTranslationId) {
      toggleDropdown()
      return
    }

    onTranslationChange(translationId)
    toggleDropdown()
  }

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

  return (
    <div className={`translation-selector-compact relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Translation Meaning
      </label>

      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="w-full p-3 bg-white border-2 border-teal-600 rounded-lg font-medium text-left flex items-center justify-between transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 active:scale-[0.98] hover:shadow-lg hover:border-teal-700 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-teal-800 font-semibold truncate transition-colors duration-200">
              {selectedTranslation?.translation || 'Select translation'}
            </span>
            {selectedTranslation?.display_priority === 1 && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium flex-shrink-0">
                Primary
              </span>
            )}
          </div>
          <span className={`transform transition-all duration-300 ease-out text-teal-600 ml-2 ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}>
            ▼
          </span>
        </button>

        {visible && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out"
            style={{
              transformOrigin: 'top',
              animation: `${isOpen ? 'dropdown-expand' : 'dropdown-collapse'} 200ms ease-out`
            }}
          >
            {sortedTranslations.map((translation, index) => {
              const isSelected = selectedTranslationId === translation.id
              const isPrimary = translation.display_priority === 1
              const contextTags = getContextTags(translation)

              return (
                <button
                  key={translation.id}
                  onClick={() => handleSelect(translation.id)}
                  className={`w-full text-left p-4 transition-all duration-200 hover:transform hover:translate-x-1 active:scale-[0.98] ${
                    index !== sortedTranslations.length - 1 ? 'border-b border-gray-100' : ''
                  } ${
                    isSelected 
                      ? 'bg-teal-50 hover:bg-teal-100 border-l-4 border-teal-500' 
                      : 'hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  {/* Main translation text and selection indicator */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`font-semibold text-base truncate transition-all duration-200 ${
                        isSelected ? 'text-teal-800' : 'text-gray-800'
                      }`}>
                        {translation.translation}
                      </span>
                      {isPrimary && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium flex-shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-teal-600 text-lg flex-shrink-0 ml-2">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Context tags */}
                  {contextTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {contextTags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105 ${tag.color}`}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Usage notes */}
                  {translation.usage_notes && (
                    <div className={`text-sm mt-1 transition-all duration-200 ${
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
