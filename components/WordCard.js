'use client'

// components/WordCard.js
// Updated for Story 10: Multiple Translations Display
// Shows top 2+ translations with individual "Study This Translation" buttons

import { useState, useEffect } from 'react'
import AudioButton from './AudioButton'
import ConjugationModal from './ConjugationModal'
import { checkPremiumAudio } from '../lib/audio-utils'
import { renderRestrictionIndicators } from '../lib/restriction-utils'

export default function WordCard({ word, onAddToDeck, className = '' }) {
  const [showForms, setShowForms] = useState(false)
  const [showRelationships, setShowRelationships] = useState(false)
  const [showConjugations, setShowConjugations] = useState(false)
  const [showAdditionalMeanings, setShowAdditionalMeanings] = useState(false)
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 })

  // Get audio information
  const { hasPremiumAudio, audioFilename, voiceName } = checkPremiumAudio(word)

  // Get word type colors
  const getWordTypeColors = (wordType) => {
    const colors = {
      VERB: {
        border: 'border-teal-200',
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-100',
        badgeHover: 'hover:bg-teal-200',
        tag: 'bg-teal-100 text-teal-800 border-teal-300',
        text: 'text-teal-900'
      },
      NOUN: {
        border: 'border-cyan-200',
        bg: 'bg-cyan-50',
        hover: 'hover:bg-cyan-100',
        badgeHover: 'hover:bg-cyan-200',
        tag: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        text: 'text-cyan-900'
      },
      ADJECTIVE: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        badgeHover: 'hover:bg-blue-200',
        tag: 'bg-blue-100 text-blue-800 border-blue-300',
        text: 'text-blue-900'
      },
      ADVERB: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        badgeHover: 'hover:bg-purple-200',
        tag: 'bg-purple-100 text-purple-800 border-purple-300',
        text: 'text-purple-900'
      }
    }
    return colors[wordType] || colors.NOUN
  }

  // Process tags for display - Enhanced for multiple translations
  const processTagsForDisplay = (tags, wordType) => {
    const essential = []
    const detailed = []

    const tagMap = {
      // PRIMARY TAGS - Essential tags
      masculine: {
        display: '♂',
        class: 'bg-blue-500 text-white',
        essential: wordType === 'NOUN',
        description: 'Masculine gender requiring masculine articles (il, un)'
      },
      feminine: {
        display: '♀',
        class: 'bg-pink-500 text-white',
        essential: wordType === 'NOUN',
        description: 'Feminine gender requiring feminine articles (la, una)'
      },
      'common-gender': {
        display: '⚥',
        class: 'bg-purple-500 text-white',
        essential: wordType === 'NOUN',
        description: 'Same form for both genders, determined by article'
      },

      // Irregularity (essential when present)
      'irregular-pattern': {
        display: '⚠️ IRREG',
        class: 'bg-red-500 text-white',
        essential: true,
        description: 'Does not follow standard patterns'
      },
      'form-irregular': {
        display: '⚠️ IRREG',
        class: 'bg-red-500 text-white',
        essential: true,
        description: 'Special rules or position-dependent forms'
      },

      // ISC Conjugation (essential for verbs)
      'ire-isc-conjugation': {
        display: '-ISC',
        class: 'bg-yellow-500 text-white',
        essential: wordType === 'VERB',
        description: 'Uses -isc- infix in present forms'
      },

      // CEFR Levels (essential)
      'CEFR-A1': { display: '📚 A1', class: 'bg-orange-500 text-white', essential: true, description: 'Beginner level vocabulary' },
      'CEFR-A2': { display: '📚 A2', class: 'bg-orange-500 text-white', essential: true, description: 'Elementary level vocabulary' },
      'CEFR-B1': { display: '📚 B1', class: 'bg-orange-500 text-white', essential: true, description: 'Intermediate level vocabulary' },
      'CEFR-B2': { display: '📚 B2', class: 'bg-orange-500 text-white', essential: true, description: 'Upper intermediate vocabulary' },
      'CEFR-C1': { display: '📚 C1', class: 'bg-orange-500 text-white', essential: true, description: 'Advanced level vocabulary' },
      'CEFR-C2': { display: '📚 C2', class: 'bg-orange-500 text-white', essential: true, description: 'Proficiency level vocabulary' },

      // Frequency (essential)
      'freq-top100': { display: '⭐ 100', class: 'bg-yellow-500 text-white', essential: true, description: 'Top 100 most frequent words' },
      'freq-top200': { display: '⭐ 200', class: 'bg-yellow-500 text-white', essential: true, description: 'Top 200 most frequent words' },
      'freq-top300': { display: '⭐ 300', class: 'bg-yellow-500 text-white', essential: true, description: 'Top 300 most frequent words' },
      'freq-top500': { display: '⭐ 500', class: 'bg-yellow-500 text-white', essential: true, description: 'Top 500 most frequent words' },
      'freq-top1000': { display: '⭐ 1K', class: 'bg-yellow-500 text-white', essential: true, description: 'Top 1000 most frequent words' },
      'freq-top5000': { display: '⭐ 5K', class: 'bg-yellow-500 text-white', essential: true, description: 'Top 5000 most frequent words' },

      // Advanced Fluency (essential)
      native: { display: '🗣️ NAT', class: 'bg-green-500 text-white', essential: true, description: 'Natural native-speaker vocabulary' },
      business: { display: '💼 BIZ', class: 'bg-green-500 text-white', essential: true, description: 'Professional/commercial terminology' },
      academic: { display: '🎓 ACAD', class: 'bg-green-500 text-white', essential: true, description: 'Scholarly and technical vocabulary' },
      literary: { display: '📜 LIT', class: 'bg-green-500 text-white', essential: true, description: 'Literary and artistic language' },
      regional: { display: '🗺️ REG', class: 'bg-green-500 text-white', essential: true, description: 'Regional dialects and variants' },

      // SECONDARY TAGS - Detailed grammatical information
      'are-conjugation': { display: '🔸 -are', class: 'bg-gray-200 text-gray-700', essential: false, description: 'First conjugation group' },
      'ere-conjugation': { display: '🔹 -ere', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Second conjugation group' },
      'ire-conjugation': { display: '🔶 -ire', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Third conjugation group' },

      // Auxiliary Verbs (detailed)
      'avere-auxiliary': { display: '🤝 avere', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Uses avere in compound tenses' },
      'essere-auxiliary': { display: '🫱 essere', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Uses essere in compound tenses' },
      'both-auxiliary': { display: '🤜🤛 both', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Can use either auxiliary' },

      // Transitivity (detailed)
      'transitive-verb': { display: '➡️ trans', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Takes a direct object' },
      'intransitive-verb': { display: '↩️ intrans', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Does not take direct object' },
      'both-transitivity': { display: '↔️ both', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Can be both transitive and intransitive' },

      // Other detailed tags
      'reflexive-verb': { display: '🪞 reflexive', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Action reflects back on the subject' },
      'type-gradable': { display: '📈 gradable', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Can be intensified or compared' },
      'type-absolute': { display: '🛑 absolute', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Cannot be graded logically' },

      // Topics (detailed)
      'topic-place': { display: '🌍 place', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Geographical locations or spaces' },
      'topic-food': { display: '🍕 food', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Food and drink vocabulary' },
      'topic-bodypart': { display: '👁️ body', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Parts of the body' },
      'topic-profession': { display: '👩‍💼 job', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Jobs and professional roles' },
      'topic-abstract': { display: '💭 abstract', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Concepts, ideas, and feelings' },
      'topic-daily-life': { display: '🏡 daily', class: 'bg-gray-200 text-gray-700', essential: false, description: 'Everyday activities and household' }
    }

    ;(tags || []).forEach(tag => {
      const tagInfo = tagMap[tag]
      if (tagInfo) {
        if (tagInfo.essential) {
          essential.push({
            tag,
            display: tagInfo.display,
            class: tagInfo.class,
            description: tagInfo.description
          })
        } else {
          detailed.push({
            tag,
            display: tagInfo.display,
            class: tagInfo.class,
            description: tagInfo.description
          })
        }
      }
    })

    return { essential, detailed }
  }

  // Mobile-friendly tag tooltip system
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

  const colors = getWordTypeColors(word.word_type)
  const processedTags = processTagsForDisplay(word.tags, word.word_type)

  // Determine verb conjugation type for combined badge label
  const verbType = word.word_type === 'VERB'
    ? (word.tags?.includes('are-conjugation')
        ? 'are'
        : word.tags?.includes('ere-conjugation')
          ? 'ere'
          : word.tags?.includes('ire-isc-conjugation')
            ? 'ire-isc'
            : word.tags?.includes('ire-conjugation')
              ? 'ire'
              : '')
    : ''

  const wordTypeLabel = verbType ? `${word.word_type} ┃${verbType}` : word.word_type

  // Convert filled tag classes to outlined style for less visual weight
  const outlinedClass = (cls) => {
    const map = {
      'bg-blue-500 text-white': 'border bg-transparent text-blue-500 border-blue-500',
      'bg-pink-500 text-white': 'border bg-transparent text-pink-500 border-pink-500',
      'bg-purple-500 text-white': 'border bg-transparent text-purple-500 border-purple-500',
      'bg-yellow-500 text-white': 'border bg-transparent text-yellow-500 border-yellow-500',
      'bg-orange-500 text-white': 'border bg-transparent text-orange-500 border-orange-500',
      'bg-green-500 text-white': 'border bg-transparent text-green-500 border-green-500',
      'bg-gray-200 text-gray-700': 'border bg-transparent text-gray-700 border-gray-400'
    }
    return map[cls] || cls
  }

  // Extract gender and irregularity tags for header
  const genderTag = processedTags.essential.find(tag =>
    tag.display === '♂' || tag.display === '♀' || tag.display === '⚥'
  )

  const irregularTag = processedTags.essential.find(tag =>
    tag.display.includes('IRREG')
  )

  // All other tags go under translations
  const bottomTags = [
    ...processedTags.essential.filter(tag =>
      tag.display !== '♂' && tag.display !== '♀' && tag.display !== '⚥' &&
      !tag.display.includes('IRREG')
    ),
    ...processedTags.detailed.filter(tag =>
      ![
        'are-conjugation',
        'ere-conjugation',
        'ire-conjugation',
        'ire-isc-conjugation'
      ].includes(tag.tag)
    )
  ]

  // Get translations - use processedTranslations from EnhancedDictionarySystem
  const translations = word.processedTranslations || []

  // Show first 2 translations, rest are "additional"
  const visibleTranslations = translations.slice(0, 2)
  const additionalTranslations = translations.slice(2)
  const fallbackTranslation = translations[0]?.translation || ''

  // Format context hint for display
  const formatContextHint = (contextInfo, usageNotes) => {
    if (usageNotes && usageNotes.length < 30) {
      return usageNotes
    }

    if (contextInfo?.usage) {
      return contextInfo.usage.replace(/-/g, ' ')
    }

    return ''
  }

  // Article display for nouns with diamond separators
  const renderArticleDisplay = () => {
    if (word.word_type !== 'NOUN' || !word.articles) return null

    return (
      <div className="article-display mb-2 text-sm text-emerald-600 font-semibold">
        {word.articles.singular} • {word.articles.plural} • {word.articles.indefinite.singular}
      </div>
    )
  }

  const getRestrictionIndicators = (translation) => {
    const metadata = translation.contextInfo || {}
    return renderRestrictionIndicators(metadata, 'restriction-symbol-card')
  }

  // Render verb-specific features

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
    word-card border-2 rounded-lg p-3 text-sm transition-all duration-200
    ${colors.border} ${colors.bg} ${colors.hover}
    word-card-${word.word_type.toLowerCase()} sketchy-fill
    ${className}
  `}>
        {/* Main Word Header - New Layout */}
        <div className="mb-2">
          {renderArticleDisplay()}
          <div className="flex items-center gap-2">
            {/* Italian Word */}
            <h3 className={`text-2xl font-bold ${colors.text}`}>
              {word.italian}
            </h3>

          {/* Audio Button - Right next to word */}
          <AudioButton
            wordId={word.id}
            italianText={word.italian}
            audioFilename={audioFilename}
            size="md"
            title={hasPremiumAudio ? `Play premium audio (${voiceName})` : 'Play pronunciation'}
            colorClass="bg-emerald-600 hover:bg-emerald-700"
          />

          {/* Gender Tag - Early in header, before word type */}
          {genderTag && (
            <span
              className={`tag-essential text-xs px-2 py-1 rounded-full font-semibold ${genderTag.class}`}
              title={genderTag.description}
              onClick={handleTagClick}
              style={{ cursor: 'pointer' }}
            >
              {genderTag.display}
            </span>
          )}

          {/* Word Type Badge - opens conjugations */}
          <button
            onClick={() => setShowConjugations(true)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border cursor-pointer active:translate-y-px transition-all ${colors.tag} ${colors.badgeHover}`}
            title="View conjugations"
          >
            {wordTypeLabel}
          </button>

          {/* Irregularity Tag - After word type */}
          {irregularTag && (
            <span
              className={`tag-essential text-xs px-2 py-1 rounded-full font-semibold ${irregularTag.class}`}
              title={irregularTag.description}
              onClick={handleTagClick}
              style={{ cursor: 'pointer' }}
            >
              {irregularTag.display}
            </span>
          )}
        </div>
        </div>

        {/* Multiple Translations Box - Grey Background */}
        {visibleTranslations.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-2 mb-2">
            {visibleTranslations.map((translation, index) => (
              <div key={translation.id || index}>
                {/* Translation Row */}
                <div className="flex items-stretch py-1 min-h-[32px]">
                  {/* Number - Fixed width */}
                  <div className="w-6 flex-shrink-0 flex items-center">
                    <span className="text-sm font-bold text-gray-600">
                      {index + 1}.
                    </span>
                  </div>

                  {/* Translation Text - Natural width */}
                  <div className="flex items-center mr-2">
                    <span className="text-base text-gray-900 font-medium">
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
                  </div>

                  {/* Context Hint - Flexible space to push button right */}
                  <div className="flex-1 flex items-center justify-end mr-2">
                    <span className="text-xs text-gray-500 italic text-right">
                      {formatContextHint(translation.contextInfo, translation.usageNotes)}
                    </span>
                  </div>

                  {/* Study This Translation Button - Right edge */}
                  <div className="flex-shrink-0 flex items-center">
                    <button
                      onClick={() => onAddToDeck && onAddToDeck(word, translation)}
                      className="bg-emerald-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors"
                      title={`Study: ${translation.translation}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Separator Line */}
                {index < visibleTranslations.length - 1 && (
                  <div className="border-b border-gray-200 my-1"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Fallback for single translation */
          <div className="bg-gray-50 rounded-lg p-2 mb-2">
            <div className="flex items-stretch py-1 min-h-[32px]">
              <div className="w-6 flex-shrink-0 flex items-center">
                <span className="text-sm font-bold text-gray-600">1.</span>
              </div>
              <div className="flex items-center mr-2">
                <span className="text-base text-gray-900 font-medium">
                  {fallbackTranslation}
                </span>
              </div>
              <div className="flex-1"></div>
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => onAddToDeck && onAddToDeck(word)}
                  className="bg-emerald-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors"
                  title="Study this word"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Meanings Section */}
        {additionalTranslations.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowAdditionalMeanings(!showAdditionalMeanings)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <span
                className={`transform transition-transform duration-200 ${
                  showAdditionalMeanings ? 'rotate-0' : '-rotate-90'
                }`}
              >
                ▼
              </span>
              {additionalTranslations.length} additional meanings
            </button>

            {showAdditionalMeanings && (
              <div className="bg-gray-50 rounded-lg p-2 mt-1">
                {additionalTranslations.map((translation, index) => (
                  <div key={translation.id || index}>
                    <div className="flex items-stretch py-1 min-h-[32px]">
                      <div className="w-6 flex-shrink-0 flex items-center">
                        <span className="text-sm font-bold text-gray-600">
                          {visibleTranslations.length + index + 1}.
                        </span>
                      </div>
                      <div className="flex items-center mr-2">
                        <span className="text-base text-gray-900 font-medium">
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
                      </div>
                      <div className="flex-1 flex items-center justify-end mr-2">
                        <span className="text-xs text-gray-500 italic text-right">
                          {formatContextHint(translation.contextInfo, translation.usageNotes)}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <button
                          onClick={() => onAddToDeck && onAddToDeck(word, translation)}
                          className="bg-emerald-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors"
                          title={`Study: ${translation.translation}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {index < additionalTranslations.length - 1 && (
                      <div className="border-b border-gray-200 my-1"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key Tags - Under Translations */}
        {bottomTags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {bottomTags.map((tag, index) => (
              <span
                key={index}
                className={`tag-detailed text-xs px-2 py-1 rounded-full font-semibold ${outlinedClass(tag.class)}`}
                title={tag.description}
                onClick={handleTagClick}
                style={{ cursor: 'pointer' }}
              >
                {tag.display}
              </span>
            ))}
          </div>
        )}

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
