'use client'

// components/WordCard.js
// Updated for Story 10: Multiple Translations Display
// Shows top 2+ translations with individual "Study This Translation" buttons

import { useState, useEffect } from 'react'
import AudioButton from './AudioButton'
import ConjugationModal from './ConjugationModal'
import { checkPremiumAudio } from '../lib/audio-utils'
import { renderRestrictionIndicators } from '../lib/restriction-utils'
import { ATTRIBUTES, VALUES, TAG_DISPLAYS, isAttribute, isValue, hasAttributeValue } from '../lib/meta-constants'

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

  // Process RPC tags for display - Comprehensive mapping of all original tags
  const processRpcTagsForDisplay = (coreTags, wordType) => {
    const essential = []
    const detailed = []

    if (!Array.isArray(coreTags)) {
      return { essential, detailed }
    }

    coreTags.forEach(tag => {
      const valueId = tag.value_id
      const attributeId = tag.attribute_id
      const valueLabel = tag.value_label || ''
      const attributeStableId = tag.attribute_stable_id
      
      // CEFR LEVEL MAPPING (essential)
      if (isAttribute(tag, ATTRIBUTES.CEFR_LEVEL)) {
        if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(valueLabel)) {
          essential.push({
            tag: `CEFR-${valueLabel}`,
            display: `📚 ${valueLabel}`,
            class: 'bg-orange-500 text-white',
            description: `${valueLabel} level vocabulary`
          })
        } else if (['academic', 'literary', 'native', 'specialized'].includes(valueLabel)) {
          const icons = { academic: '🎓', literary: '📜', native: '🗣️', specialized: '⚙️' }
          essential.push({
            tag: valueLabel,
            display: `${icons[valueLabel]} ${valueLabel.toUpperCase()}`,
            class: 'bg-green-500 text-white',
            description: `${valueLabel} level vocabulary`
          })
        }
      }

      // FREQUENCY TIER MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.FREQUENCY_TIER)) {
        const freqMap = {
          'top100': '⭐ 100',
          'top500': '⭐ 500', 
          'top1000': '⭐ 1K',
          'top5000': '⭐ 5K'
        }
        if (freqMap[valueLabel]) {
          essential.push({
            tag: `freq-${valueLabel}`,
            display: freqMap[valueLabel],
            class: 'bg-yellow-500 text-white',
            description: `Top ${valueLabel.replace('top', '')} most frequent words`
          })
        }
      }

      // GENDER MAPPING (essential for nouns)
      else if (isAttribute(tag, ATTRIBUTES.WORD_GENDER)) {
        if (valueLabel === 'masculine') {
          essential.push({
            tag: 'masculine',
            display: '♂',
            class: 'bg-blue-500 text-white',
            description: 'Masculine gender requiring masculine articles (il, un)'
          })
        } else if (valueLabel === 'feminine') {
          essential.push({
            tag: 'feminine',
            display: '♀',
            class: 'bg-pink-500 text-white',
            description: 'Feminine gender requiring feminine articles (la, una)'
          })
        } else if (valueLabel === 'common') {
          essential.push({
            tag: 'common-gender',
            display: '⚥',
            class: 'bg-purple-500 text-white',
            description: 'Same form for both genders, determined by article'
          })
        }
      }

      // IRREGULAR FORMS MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.IRREGULAR_FORMS)) {
        if (valueLabel === 'irregular') {
          essential.push({
            tag: 'irregular-pattern',
            display: '⚠️ IRREG',
            class: 'bg-red-500 text-white',
            description: 'Does not follow standard patterns'
          })
        }
      }

      // AUXILIARY VERB MAPPING (detailed)
      else if (isAttribute(tag, ATTRIBUTES.AUXILIARY_VERB)) {
        if (valueLabel === 'avere') {
          detailed.push({
            tag: 'avere-auxiliary',
            display: '🤝 avere',
            class: 'bg-gray-200 text-gray-700',
            description: 'Uses avere in compound tenses'
          })
        } else if (valueLabel === 'essere') {
          detailed.push({
            tag: 'essere-auxiliary',
            display: '🫱 essere',
            class: 'bg-gray-200 text-gray-700',
            description: 'Uses essere in compound tenses'
          })
        }
      }

      // CONJUGATION TYPE MAPPING (detailed for verbs)
      else if (isAttribute(tag, ATTRIBUTES.CONJUGATION_TYPE) && wordType === 'VERB') {
        const conjMap = {
          'are': '🔸 -are',
          'ere': '🔹 -ere',
          'ire': '🔶 -ire',
          'ire-isc': '-ISC'
        }
        if (conjMap[valueLabel]) {
          const isIsc = valueLabel === 'ire-isc'
          detailed.push({
            tag: `${valueLabel}-conjugation`,
            display: conjMap[valueLabel],
            class: isIsc ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700',
            description: isIsc ? 'Uses -isc- infix in present forms' : `${valueLabel} conjugation group`
          })
        }
      }

      // REFLEXIVE MAPPING (detailed for verbs)
      else if (isAttribute(tag, ATTRIBUTES.REFLEXIVE) && wordType === 'VERB') {
        if (valueLabel === 'reflexive') {
          detailed.push({
            tag: 'reflexive-verb',
            display: '🪞 reflexive',
            class: 'bg-gray-200 text-gray-700',
            description: 'Action reflects back on the subject'
          })
        }
      }

      // REGISTER MAPPING (only show non-neutral)
      else if (isAttribute(tag, ATTRIBUTES.REGISTER)) {
        if (valueLabel === 'formal') {
          detailed.push({
            tag: 'formal-register',
            display: '👔 formal',
            class: 'bg-gray-200 text-gray-700',
            description: 'Formal contexts only'
          })
        } else if (valueLabel === 'casual') {
          detailed.push({
            tag: 'casual-register', 
            display: '👕 casual',
            class: 'bg-gray-200 text-gray-700',
            description: 'Casual/colloquial usage'
          })
        }
        // Skip 'neutral' register - don't display
      }

      // ADVERB TYPE MAPPING (detailed) - EXPANDED
      else if (isAttribute(tag, ATTRIBUTES.ADVERB_TYPE)) {
        const advMap = {
          'manner': { display: '📍 manner', desc: 'Describes how something is done' },
          'time': { display: '⏰ time', desc: 'Indicates when something happens' },
          'place': { display: '📍 place', desc: 'Indicates where something happens' },
          'quantity': { display: '🔢 quantity', desc: 'Indicates amount or degree' },
          'frequency': { display: '🔄 frequency', desc: 'Indicates how often' },
          'affirmation': { display: '✅ affirmation', desc: 'Expresses agreement or certainty' },
          'doubt': { display: '❓ doubt', desc: 'Expresses uncertainty' },
          'negation': { display: '❌ negation', desc: 'Expresses denial or refusal' },
          'interrogative': { display: '❓ interrogative', desc: 'Used in questions' },
          'evaluation': { display: '📊 evaluation', desc: 'Expresses judgment or opinion' },
          'emphasis': { display: '💪 emphasis', desc: 'Adds emphasis or intensity' }
        }
        if (advMap[valueLabel]) {
          detailed.push({
            tag: `adverb-${valueLabel}`,
            display: advMap[valueLabel].display,
            class: 'bg-gray-200 text-gray-700',
            description: advMap[valueLabel].desc
          })
        }
      }

      // NOUN GENDER MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.WORD_GENDER)) {
        if (valueLabel === 'masculine') {
          essential.push({
            tag: 'gender-masculine',
            display: '♂',
            class: 'bg-blue-500 text-white',
            description: 'Masculine gender'
          })
        } else if (valueLabel === 'feminine') {
          essential.push({
            tag: 'gender-feminine', 
            display: '♀',
            class: 'bg-pink-500 text-white',
            description: 'Feminine gender'
          })
        } else if (valueLabel === 'common-gender') {
          essential.push({
            tag: 'gender-common',
            display: '⚥',
            class: 'bg-purple-500 text-white',
            description: 'Common gender (both masculine and feminine)'
          })
        }
      }

      // REFLEXIVE MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.REFLEXIVE)) {
        if (valueLabel === 'reflexive') {
          essential.push({
            tag: 'reflexive',
            display: '🔄 REFL',
            class: 'bg-purple-500 text-white',
            description: 'Reflexive verb (action directed to subject)'
          })
        }
      }

      // PLURAL ONLY MAPPING (essential) 
      else if (isAttribute(tag, ATTRIBUTES.PLURAL_ONLY)) {
        if (valueLabel === 'plural only') {
          essential.push({
            tag: 'plural-only',
            display: '👥 PL-ONLY',
            class: 'bg-green-500 text-white',
            description: 'Always used in plural form'
          })
        }
      }
    })

    return { essential, detailed }
  }

  // Mobile-friendly tag tooltip system
  const handleTagClick = (event) => {
    // Use currentTarget since onClick is attached to the tag element.
    const tag = event.currentTarget
    const description = tag?.dataset?.description
    if (!tag || !description) return

    event.preventDefault()
    event.stopPropagation()

    const tagRect = tag.getBoundingClientRect()
    const cardRect = tag.closest('.word-card').getBoundingClientRect()
    
    // Calculate position relative to the WordCard container - position above the tag
    let tooltipX = (tagRect.left - cardRect.left) + (tagRect.width / 2) // Center above tag
    const tooltipY = (tagRect.top - cardRect.top) - 35 // Position above tag
    
    // Prevent tooltip from going off the right edge (estimate tooltip width ~150px)
    const cardWidth = cardRect.width
    const estimatedTooltipWidth = 150
    if (tooltipX + (estimatedTooltipWidth / 2) > cardWidth - 10) {
      tooltipX = cardWidth - (estimatedTooltipWidth / 2) - 10 // Keep 10px margin from right edge
    }
    // Prevent tooltip from going off the left edge  
    if (tooltipX - (estimatedTooltipWidth / 2) < 10) {
      tooltipX = (estimatedTooltipWidth / 2) + 10 // Keep 10px margin from left edge
    }

    setTooltip({ show: true, content: description, x: tooltipX, y: tooltipY })

    setTimeout(() => {
      setTooltip((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  const hideTooltip = (event) => {
    // document-level listener: event.target may be a Text node; guard for closest support
    const target = event.target
    const element = target && target.nodeType === 1 ? target : target?.parentElement
    if (!element?.closest || !element.closest('.tag-essential, .tag-detailed')) {
      setTooltip((prev) => ({ ...prev, show: false }))
    }
  }

  useEffect(() => {
    document.addEventListener('click', hideTooltip)
    return () => {
      document.removeEventListener('click', hideTooltip)
    }
  }, [])

  const colors = getWordTypeColors(word.word_type)
  const processedTags = processRpcTagsForDisplay(word.word_core_tags || [], word.word_type)

  // Determine verb conjugation type for combined badge label using RPC tags
  const verbType = word.word_type === 'VERB' ? (() => {
    const coreTags = word.word_core_tags || []
    const conjugationTag = coreTags.find(tag => isAttribute(tag, ATTRIBUTES.CONJUGATION_TYPE))
    if (conjugationTag?.value_label) {
      // Map to simple display format for badge
      const conjValue = conjugationTag.value_label
      if (conjValue === 'ire-isc') return 'ire-isc'
      return conjValue // are, ere, ire
    }
    return ''
  })() : ''

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
        'ire-isc-conjugation',
        'ire-isc',
        'are',
        'ere',
        'ire'
      ].includes(tag.tag)
    )
  ]

  // Get translations - use processedTranslations from EnhancedDictionarySystem
  // Ensure translations are sorted by display_priority so the first item is truly the primary meaning

  // Count unique auxiliaries at word level to determine if translation-level auxiliary chips should be shown
  const wordLevelAuxiliaries = new Set()
  const wordCoreTags = word.word_core_tags || []
  wordCoreTags.forEach(tag => {
    if (tag.attribute_stable_id === 'metaattr002') {
      wordLevelAuxiliaries.add(String(tag.value_label || '').toLowerCase())
    }
  })
  const hasMultipleWordLevelAuxiliaries = wordLevelAuxiliaries.size > 1

  // Translation-level chips: auxiliary (only when multiple exist at word level) and reciprocal
  const renderTranslationChips = (translation) => {
    const chips = []
    const core = Array.isArray(translation.rpc_core) ? translation.rpc_core : []
    const optional = Array.isArray(translation.rpc_tags) ? translation.rpc_tags : []

    // Auxiliary Verb (metaattr002): ONLY show when multiple auxiliaries exist at word level
    if (hasMultipleWordLevelAuxiliaries) {
      const auxTags = core.filter((t) => t.attribute_stable_id === 'metaattr002')
      if (auxTags.length > 0) {
        if (auxTags.length > 1) {
          // Multiple auxiliaries on this translation - combine into single chip
          const auxValues = auxTags.map(aux => String(aux.value_label || '').toLowerCase()).sort()
          const hasAvere = auxValues.includes('avere')
          const hasEssere = auxValues.includes('essere') 
          
          if (hasAvere && hasEssere) {
            chips.push({ 
              symbol: 'av./ess.', 
              title: 'Auxiliary: avere/essere (both)', 
              className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
            })
          } else {
            // Fallback - shouldn't happen but handle gracefully  
            const labels = auxValues.map(v => v === 'essere' ? 'ess.' : v === 'avere' ? 'av.' : v)
            chips.push({ 
              symbol: labels.join('/'), 
              title: `Auxiliary: ${auxValues.join('/')}`, 
              className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
            })
          }
        } else {
          // Single auxiliary on this translation
          const aux = auxTags[0]
          const v = String(aux.value_label || '').toLowerCase()
          const label = v === 'essere' ? 'ess.' : v === 'avere' ? 'av.' : (aux.value_shorthand || aux.value_label || '')
          if (label) chips.push({ 
            symbol: label, 
            title: `Auxiliary: ${aux.value_label || label}`, 
            className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
          })
        }
      }
    }

    // Reciprocal: detect from optional tag 'mutual-action'
    const reciprocalCore = core.find((t) => t.attribute_stable_id === 'metaattr021' && String(t.value_label || '').toLowerCase() === 'reciprocal')
    const reciprocalOpt = optional.find((t) => String(t.value_label || '').toLowerCase() === 'mutual-action')
    if (reciprocalCore || reciprocalOpt) {
      chips.push({ symbol: '↔️', title: 'Reciprocal action', className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' })
    }

    return chips
  }

  const translations =
    word.processedTranslations ||
    (word.word_translations || [])
      .slice()
      .sort((a, b) => (a.display_priority || 999) - (b.display_priority || 999))
      .map(t => ({
        id: t.id,
        translation: t.translation,
        isPrimary: t.display_priority === 1,
        usageNotes: t.usage_notes,
        rpc_core: t.rpc_core || [],
        rpc_tags: t.rpc_tags || []
      })) || []

  // Show first 2 translations, rest are "additional"
  const visibleTranslations = translations.slice(0, 2)
  const additionalTranslations = translations.slice(2)
  const fallbackTranslation = translations[0]?.translation || ''

  // Format context hint for display
  const formatContextHint = (usageNotes) => {
    if (usageNotes && usageNotes.length < 30) {
      return usageNotes
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
    const coreTags = Array.isArray(translation.rpc_core) ? translation.rpc_core : []
    return renderRestrictionIndicators(coreTags, 'restriction-symbol-card')
  }

  // Render verb-specific features

  return (
    <>
  <div className={`
    word-card border-2 rounded-lg p-3 text-sm transition-all duration-200
    ${colors.border} ${colors.bg} ${colors.hover}
    word-card-${word.word_type.toLowerCase()} sketchy-fill
    relative
    ${className}
  `}>
      {/* Mobile-friendly tooltip */}
      {tooltip.show && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded px-2 py-1 max-w-xs pointer-events-none shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            zIndex: 9999
          }}
        >
          {tooltip.content}
        </div>
      )}
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
              data-description={genderTag.description}
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
              data-description={irregularTag.description}
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
                    {/* Primary badge on the translation with display_priority === 1 */}
                    {translation.isPrimary && (
                      <>
                        <span className="mx-1"></span>
                        <span 
                          className="tag-detailed text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium"
                          data-description="Most common translation for this word"
                          onClick={handleTagClick}
                          style={{ cursor: 'pointer' }}
                        >
                          Primary
                        </span>
                      </>
                    )}
                    {/* Translation-level chips group */}
                    <span className="ml-2 flex items-center gap-1">
                      {renderTranslationChips(translation).map((chip, idx) => (
                        <span
                          key={`tchip-${translation.id}-${idx}`}
                          className={`tag-essential ${chip.className}`}
                          data-description={chip.title}
                          onClick={handleTagClick}
                          style={{ cursor: 'pointer' }}
                        >
                          {chip.symbol}
                        </span>
                      ))}
                      {getRestrictionIndicators(translation).map((indicator) => {
                        const base = 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent';
                        const color = indicator.type === 'gender'
                          ? (indicator.subtype === 'male' ? 'border-blue-500 text-blue-600' : indicator.subtype === 'female' ? 'border-pink-500 text-pink-600' : 'border-gray-400 text-gray-700')
                          : 'border-gray-400 text-gray-700';
                        return (
                          <span
                            key={indicator.key}
                            className={`tag-detailed ${base} ${color}`}
                            data-description={indicator.title}
                            onClick={handleTagClick}
                            style={{ cursor: 'pointer' }}
                          >
                            {indicator.symbol}
                          </span>
                        );
                      })}
                    </span>
                  </div>

                  {/* Context Hint - Flexible space to push button right */}
                  <div className="flex-1 flex items-center justify-end mr-2">
                    <span className="text-xs text-gray-500 italic text-right">
                      {formatContextHint(translation.usageNotes)}
                    </span>
                  </div>

                  {/* Study This Translation Button - Right edge */}
                  <div className="flex-shrink-0 flex items-center">
                    <button
                      onClick={() => {
                        console.log('Translation button clicked:', { word: word.italian, translation: translation.translation, onAddToDeck: !!onAddToDeck })
                        if (onAddToDeck) {
                          onAddToDeck(word, translation)
                        } else {
                          console.error('onAddToDeck function not provided')
                        }
                      }}
                      className="bg-emerald-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
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
                        <span className="ml-2 flex items-center gap-1">
                          {renderTranslationChips(translation).map((chip, idx) => (
                            <span
                              key={`tchip-b-${translation.id}-${idx}`}
                              className={`tag-essential ${chip.className}`}
                              data-description={chip.title}
                              onClick={handleTagClick}
                              style={{ cursor: 'pointer' }}
                            >
                              {chip.symbol}
                            </span>
                          ))}
                          {getRestrictionIndicators(translation).map((indicator) => {
                            const base = 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent';
                            const color = indicator.type === 'gender'
                              ? (indicator.subtype === 'male' ? 'border-blue-500 text-blue-600' : indicator.subtype === 'female' ? 'border-pink-500 text-pink-600' : 'border-gray-400 text-gray-700')
                              : 'border-gray-400 text-gray-700';
                            return (
                              <span
                                key={indicator.key}
                                className={`tag-detailed ${base} ${color}`}
                                data-description={indicator.title}
                                onClick={handleTagClick}
                                style={{ cursor: 'pointer' }}
                              >
                                {indicator.symbol}
                              </span>
                            );
                          })}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-end mr-2">
                        <span className="text-xs text-gray-500 italic text-right">
                          {formatContextHint(translation.usageNotes)}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <button
                          onClick={() => {
                            console.log('Additional translation button clicked:', { word: word.italian, translation: translation.translation })
                            if (onAddToDeck) {
                              onAddToDeck(word, translation)
                            } else {
                              console.error('onAddToDeck function not provided')
                            }
                          }}
                          className="bg-emerald-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
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
                data-description={tag.description}
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
