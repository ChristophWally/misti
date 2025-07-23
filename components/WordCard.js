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

  // NEW: Render expanded translations section
  const renderTranslationsSection = () => {
    if (!hasMultipleTranslations) {
      // Single translation - show as before with main study button
      return (
        <div className="mt-3">
          <p className={`text-base mb-3 opacity-80 ${colors.text}`}>
            {word.english}
          </p>
        </div>
      )
    }

    // Multiple translations - show primary + expandable section
    const primaryTranslation = word.processedTranslations.find(t => t.isPrimary) || word.processedTranslations[0]
    const secondaryTranslations = word.processedTranslations.filter(t => !t.isPrimary)

    return (
      <div className="mt-3">
        {/* Primary Translation */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-base opacity-80 ${colors.text} flex-1`}>
              {primaryTranslation.translation}
            </p>
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
              Primary
            </span>
          </div>
          {renderContextMetadata(primaryTranslation.contextInfo)}
          
          {/* Primary Translation Study Button */}
          <button 
            onClick={() => onAddToDeck && onAddToDeck(word, primaryTranslation)}
            className="mt-2 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 transition-colors btn-sketchy"
          >
            📚 Study "{primaryTranslation.translation}"
          </button>
        </div>

        {/* Additional Translations Toggle */}
        {secondaryTranslations.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 btn-sketchy mb-3"
              onClick={() => setShowTranslations(!showTranslations)}
            >
              <span>🔄 {secondaryTranslations.length} more meaning{secondaryTranslations.length > 1 ? 's' : ''}</span>
              <span className={`transform transition-transform duration-200 ${showTranslations ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {/* Expanded Translations */}
            {showTranslations && (
              <div className="space-y-3 bg-gray-50 p-3 rounded transition-all duration-300">
                {secondaryTranslations.map((translation, index) => (
                  <div key={translation.id} className="border-l-3 border-gray-300 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-base ${colors.text} flex-1`}>
                        {translation.translation}
                      </p>
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full font-medium">
                        #{translation.priority}
                      </span>
                    </div>
                    
                    {renderContextMetadata(translation.contextInfo)}
                    
                    {/* Usage Notes */}
                    {translation.usageNotes && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        {translation.usageNotes}
                      </p>
                    )}
                    
                    {/* Secondary Translation Study Button */}
                    <button 
                      onClick={() => onAddToDeck && onAddToDeck(word, translation)}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors btn-sketchy"
                    >
                      📖 Study "{translation.translation}"
                    </button>
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
        
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {renderArticleDisplay()}
            
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-xl font-semibold ${colors.text}`}>
                {word.italian}
              </h3>
              
              <AudioButton
                wordId={word.id}
                italianText={word.italian}
                audioFilename={audioFilename}
                size="md"
                title={hasPremiumAudio ? `Play premium audio (${voiceName})` : 'Play pronunciation'}
                colorClass="bg-emerald-600 hover:bg-emerald-700"
              />
              
              {renderTags(processedTags.essential, 'essential')}
            </div>
            
            {/* NEW: Multiple Translations Section */}
            {renderTranslationsSection()}
            
            <div className="flex flex-wrap gap-1 mb-2">
              <span className={`tag-essential tag-word-type ${colors.tag}`}>
                {word.word_type.toLowerCase()}
              </span>
              {renderTags(processedTags.detailed, 'detailed')}
            </div>
            
            {renderVerbFeatures()}
            {renderWordForms()}
            {renderRelationships()}
          </div>
          
          {/* UPDATED: Main add button only shown for single translations */}
          {!hasMultipleTranslations && (
            <button 
              onClick={() => onAddToDeck && onAddToDeck(word)}
              className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4 flex-shrink-0 btn-sketchy"
            >
              + Add
            </button>
          )}
        </div>
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
