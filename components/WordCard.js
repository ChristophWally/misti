'use client'

import { useState, useEffect } from 'react'
import AudioButton from './AudioButton'
import ConjugationModal from './ConjugationModal'
import { checkPremiumAudio } from '../lib/audio-utils'

export default function WordCard({ word, onAddToDeck, className = '' }) {
  const [showForms, setShowForms] = useState(false)
  const [showRelationships, setShowRelationships] = useState(false)
  const [showConjugations, setShowConjugations] = useState(false)
  const [showTranslations, setShowTranslations] = useState(false) // NEW: Translation expansion
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 })

  // Get audio information
  const { hasPremiumAudio, audioFilename, voiceName } = checkPremiumAudio(word)

  // NEW: Check if word has multiple translations
  const hasMultipleTranslations = word.processedTranslations && word.processedTranslations.length > 1

  // Mobile-friendly tag tooltip system (existing)
  const handleTagClick = (event) => {
    const tag = event.target.closest('.tag-essential, .tag-detailed')
    if (!tag || !tag.title) return
    
    event.preventDefault()
    event.stopPropagation()
    
    const rect = tag.getBoundingClientRect()
    const tooltipX = Math.min(rect.left, window.innerWidth - 250)
    const tooltipY = rect.top - 35
    
    setTooltip({
      show: true,
      content: tag.title,
      x: tooltipX,
      y: tooltipY
    })
    
    setTimeout(() => {
      setTooltip(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  // Hide tooltip when clicking elsewhere (existing)
  const hideTooltip = (event) => {
    if (!event.target.closest('.tag-essential, .tag-detailed')) {
      setTooltip(prev => ({ ...prev, show: false }))
    }
  }

  useEffect(() => {
    document.addEventListener('click', hideTooltip)
    return () => {
      document.removeEventListener('click', hideTooltip)
    }
  }, [])

  // Tag processing system (existing)
  const processTagsForDisplay = (tags, wordType) => {
    // ... existing tag processing logic (keep unchanged)
    const essential = [];
    const detailed = [];

    const tagMap = {
      // Keep all existing tag mappings unchanged
      'masculine': { display: '♂', class: 'tag-primary-gender-masc', essential: wordType === 'NOUN', description: 'Masculine gender requiring masculine articles (il, un)' },
      'feminine': { display: '♀', class: 'tag-primary-gender-fem', essential: wordType === 'NOUN', description: 'Feminine gender requiring feminine articles (la, una)' },
      // ... (keep all existing tags)
    };

    (tags || []).forEach(tag => {
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
  };

  // Word type colors (existing)
  const getWordTypeColors = (wordType) => {
    const colors = {
      'VERB': { border: 'border-teal-200', bg: 'bg-teal-50', hover: 'hover:bg-teal-100', tag: 'bg-teal-100 text-teal-800', text: 'text-teal-900' },
      'NOUN': { border: 'border-cyan-200', bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', tag: 'bg-cyan-100 text-cyan-800', text: 'text-cyan-900' },
      'ADJECTIVE': { border: 'border-blue-200', bg: 'bg-blue-50', hover: 'hover:bg-blue-100', tag: 'bg-blue-100 text-blue-800', text: 'text-blue-900' },
      'ADVERB': { border: 'border-purple-200', bg: 'bg-purple-50', hover: 'hover:bg-purple-100', tag: 'bg-purple-100 text-purple-800', text: 'text-purple-900' }
    }
    return colors[wordType] || { border: 'border-gray-200', bg: 'bg-gray-50', hover: 'hover:bg-gray-100', tag: 'bg-gray-100 text-gray-800', text: 'text-gray-900' }
  }

  const colors = getWordTypeColors(word.word_type)
  const processedTags = processTagsForDisplay(word.tags, word.word_type)

  // Article display for nouns (existing)
  const renderArticleDisplay = () => {
    if (word.word_type !== 'NOUN' || !word.articles) return null
    return (
      <div className="article-display mb-2">
        {word.articles.singular} • {word.articles.plural} • {word.articles.indefinite.singular}
      </div>
    )
  }

  // Tag rendering (existing)
  const renderTags = (tags, type = 'essential') => {
    if (!tags || tags.length === 0) return null
    return tags.map((tag, index) => (
      <span
        key={index}
        className={`tag-${type} ${tag.class}`}
        title={tag.description}
        onClick={handleTagClick}
        style={{ cursor: 'pointer' }}
      >
        {tag.display}
      </span>
    ))
  }

  // NEW: Render context metadata for translations
  const renderContextMetadata = (contextInfo) => {
    if (!contextInfo) return null

    const contextTags = []

    if (contextInfo.usage) {
      contextTags.push({
        text: contextInfo.usage.replace('-', ' '),
        color: contextInfo.usage === 'reciprocal' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
      })
    }

    if (contextInfo.plurality) {
      contextTags.push({
        text: contextInfo.plurality.replace('-', ' '),
        color: contextInfo.plurality === 'plural-only' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
      })
    }

    if (contextInfo.register) {
      contextTags.push({
        text: contextInfo.register,
        color: 'bg-gray-100 text-gray-700'
      })
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {contextTags.map((tag, index) => (
          <span
            key={index}
            className={`text-xs px-2 py-1 rounded-full font-medium ${tag.color}`}
          >
            {tag.text}
          </span>
        ))}
      </div>
    )
  }

  // NEW: Render numbered translations layout
  const renderTranslationsSection = () => {
    if (!hasMultipleTranslations) {
      // Single translation - show as before
      return (
        <div className="mt-3 mb-3">
          <div className="bg-gray-100 p-3 rounded border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-base font-medium ${colors.text}`}>{word.english}</p>
              </div>
              <button
                onClick={() => onAddToDeck && onAddToDeck(word)}
                className="bg-emerald-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg font-semibold hover:bg-emerald-700 transition-colors ml-3"
                title="Add to study deck"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Multiple translations - show numbered list
    const sortedTranslations = word.processedTranslations.sort((a, b) => a.priority - b.priority)
    const firstThree = sortedTranslations.slice(0, 3)
    const additional = sortedTranslations.slice(3)

    return (
      <div className="mt-3 mb-3">
        {/* First 3 translations - always visible */}
        <div className="space-y-2">
          {firstThree.map((translation, index) => (
            <div key={translation.id} className="bg-gray-100 p-3 rounded border-l-4 border-gray-400">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-600 min-w-[24px]">{index + 1}.</span>
                    <div className="flex-1">
                      <p className={`text-base font-medium ${colors.text}`}>{translation.translation}</p>
                      {/* Context info inline */}
                      {translation.contextInfo && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {translation.contextInfo.usage && (
                            <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                              {translation.contextInfo.usage.replace('-', ' ')}
                            </span>
                          )}
                          {translation.contextInfo.plurality && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              {translation.contextInfo.plurality.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Usage notes */}
                      {translation.usageNotes && (
                        <p className="text-sm text-gray-600 mt-1 italic">{translation.usageNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onAddToDeck && onAddToDeck(word, translation)}
                  className="bg-emerald-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg font-semibold hover:bg-emerald-700 transition-colors ml-3"
                  title={`Add "${translation.translation}" to study deck`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional translations (4+) - expandable */}
        {additional.length > 0 && (
          <div className="mt-4">
            <button
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-2 font-medium"
              onClick={() => setShowTranslations(!showTranslations)}
            >
              <span>Additional meanings ({additional.length})</span>
              <span className={`transform transition-transform duration-200 ${showTranslations ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showTranslations && (
              <div className="space-y-2">
                {additional.map((translation, index) => (
                  <div key={translation.id} className="bg-gray-100 p-3 rounded border-l-4 border-gray-400">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-600 min-w-[24px]">{index + 4}.</span>
                          <div className="flex-1">
                            <p className={`text-base font-medium ${colors.text}`}>{translation.translation}</p>
                            {/* Context info inline */}
                            {translation.contextInfo && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {translation.contextInfo.usage && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                                    {translation.contextInfo.usage.replace('-', ' ')}
                                  </span>
                                )}
                                {translation.contextInfo.plurality && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                    {translation.contextInfo.plurality.replace('-', ' ')}
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Usage notes */}
                            {translation.usageNotes && (
                              <p className="text-sm text-gray-600 mt-1 italic">{translation.usageNotes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToDeck && onAddToDeck(word, translation)}
                        className="bg-emerald-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg font-semibold hover:bg-emerald-700 transition-colors ml-3"
                        title={`Add "${translation.translation}" to study deck`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Existing render functions (keep unchanged)
  const renderWordForms = () => {
    if (!word.forms || word.forms.length === 0) return null
    // ... existing logic
  }

  const renderRelationships = () => {
    if (!word.relationships || word.relationships.length === 0) return null
    // ... existing logic  
  }

  const renderVerbFeatures = () => {
    if (word.word_type !== 'VERB') return null
    return (
      <div className="mt-2">
        <button
          onClick={() => setShowConjugations(true)}
          className="text-sm bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition-colors mr-2 btn-sketchy"
        >
          📝 Conjugations
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile-friendly tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-gray-800 text-white text-xs rounded px-2 py-1 z-50 max-w-xs pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.content}
        </div>
      )}

      <div className={`
        word-card border-2 rounded-lg p-4 transition-all duration-200
        ${colors.border} ${colors.bg} ${colors.hover}
        word-card-${word.word_type.toLowerCase()} sketchy-fill
        ${className}
      `}>
        
        {/* Header Section - UPDATED: Tags moved to right of word */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {renderArticleDisplay()}

            <div className="flex items-center justify-between mb-2">
              {/* Left side: Word + Audio */}
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-semibold ${colors.text}`}>{word.italian}</h3>

                <AudioButton
                  wordId={word.id}
                  italianText={word.italian}
                  audioFilename={audioFilename}
                  size="md"
                  title={hasPremiumAudio ? `Play premium audio (${voiceName})` : 'Play pronunciation'}
                  colorClass="bg-emerald-600 hover:bg-emerald-700"
                />
              </div>

              {/* Right side: Tags */}
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <span className={`tag-essential tag-word-type ${colors.tag}`}>{word.word_type.toLowerCase()}</span>
                {renderTags(processedTags.essential, 'essential')}
                {renderTags(processedTags.detailed, 'detailed')}
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Numbered Translations Section */}
        {renderTranslationsSection()}

        <div className="flex flex-wrap gap-1 mb-2">
          {/* Word type tag already displayed above */}
        </div>

        {renderVerbFeatures()}
        {renderWordForms()}
        {renderRelationships()}
      </div>
      
      {/* Conjugation Modal */}
      {word.word_type === 'VERB' && (
        <ConjugationModal
          isOpen={showConjugations}
          onClose={() => setShowConjugations(false)}
          word={word}
          userAudioPreference="form-only"
        />
      )}
    </>
  )
}
