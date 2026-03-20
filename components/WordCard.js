'use client'

// components/WordCard.js
// Updated for Story 10: Multiple Translations Display
// Uses pronunciation-group-level study action and compact sense rows

import { useState, useEffect } from 'react'
import AudioButton from './AudioButton'
import ConjugationModal from './ConjugationModal'
import { getWordTypeColors } from '../lib/word-type-utils'
import { processRpcTagsForDisplay } from '../lib/tag-processing'
import { ATTRIBUTES, VALUES, TAG_DISPLAYS, isAttribute, isValue, hasAttributeValue } from '../lib/meta-constants'

export default function WordCard({ word, onAddToDeck, className = '' }) {
  const [showConjugations, setShowConjugations] = useState(false)
  const [expandedMeaningGroups, setExpandedMeaningGroups] = useState({})
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 })

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
    const panelRect = tag.closest('.dictionary-panel')?.getBoundingClientRect() || cardRect
    
    // Calculate position relative to the WordCard container - position above the tag
    let tooltipX = (tagRect.left - cardRect.left) + (tagRect.width / 2) // Center above tag
    const tooltipY = (tagRect.top - cardRect.top) - 35 // Position above tag
    
    // Prevent tooltip from going off the right edge of panel (estimate tooltip width ~200px for longer text)
    const panelWidth = panelRect.width
    const cardOffsetInPanel = cardRect.left - panelRect.left
    const estimatedTooltipWidth = 200
    const absoluteTooltipX = cardOffsetInPanel + tooltipX
    
    if (absoluteTooltipX + (estimatedTooltipWidth / 2) > panelWidth - 20) {
      tooltipX = (panelWidth - 20 - cardOffsetInPanel) - (estimatedTooltipWidth / 2) // Keep 20px margin from panel right edge
    }
    // Prevent tooltip from going off the left edge of panel  
    if (absoluteTooltipX - (estimatedTooltipWidth / 2) < 20) {
      tooltipX = (20 - cardOffsetInPanel) + (estimatedTooltipWidth / 2) // Keep 20px margin from panel left edge
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
    if (!element?.closest || !element.closest('.tag-essential, .tag-detailed, .wordcard-primary-chip, .wordcard-secondary-chip, .wordcard-grammar-chip, .wordcard-sense-chip')) {
      setTooltip((prev) => ({ ...prev, show: false }))
    }
  }

  const formatPronunciationGroupLabel = (group) => {
    if (!group) return ''
    if (group.ipa_pronunciation) return group.ipa_pronunciation
    if (group.phonetic_pronunciation) return group.phonetic_pronunciation
    if (group.accent) return group.accent
    return 'Pronunciation'
  }

  useEffect(() => {
    document.addEventListener('click', hideTooltip)
    return () => {
      document.removeEventListener('click', hideTooltip)
    }
  }, [])

  const colors = getWordTypeColors(word.word_type)
  const displayCoreTags = word.word_display_core_tags || word.word_core_tags || []
  const wordOptionalTags = Array.isArray(word.word_optional_tags) ? word.word_optional_tags : []
  const processedTags = processRpcTagsForDisplay(displayCoreTags, word.word_type, wordOptionalTags)
  const pronunciationGroups = Array.isArray(word.pronunciation_groups)
    ? word.pronunciation_groups
    : []
  const maxVisibleMeaningsPerGroup = 2

  const verbConjugationLabel = String(word.word_type || '').toUpperCase() === 'VERB'
    ? (() => {
        const coreTags = Array.isArray(word.word_core_tags) ? word.word_core_tags : []
        const conjugationTag = coreTags.find((tag) => isAttribute(tag, ATTRIBUTES.CONJUGATION_TYPE))
        const conjugationValue = String(conjugationTag?.value_label || '').trim().toLowerCase()
        const conjugationMap = {
          'are': 'ARE',
          'ere': 'ERE',
          'ire': 'IRE',
          'ire-isc': 'IRE-ISC'
        }
        return conjugationMap[conjugationValue] || ''
      })()
    : ''
  const wordTypeLabel =
    String(word.word_type || '').toUpperCase() === 'VERB' && verbConjugationLabel
      ? `VERB - ${verbConjugationLabel}`
      : word.word_type

  // Convert filled tag classes to outlined style for less visual weight
  const outlinedClass = (cls) => {
    const map = {
      'bg-blue-500 text-white': 'border bg-transparent text-blue-500 border-blue-500',
      'bg-pink-500 text-white': 'border bg-transparent text-pink-500 border-pink-500',
      'bg-purple-500 text-white': 'border bg-transparent text-purple-500 border-purple-500',
      'bg-yellow-500 text-white': 'border bg-transparent text-yellow-500 border-yellow-500',
      'bg-orange-500 text-white': 'border bg-transparent text-orange-500 border-orange-500',
      'bg-green-500 text-white': 'border bg-transparent text-green-500 border-green-500',
      'bg-cyan-500 text-white': 'border bg-transparent text-cyan-500 border-cyan-500',
      'bg-teal-500 text-white': 'border bg-transparent text-teal-500 border-teal-500',
      'bg-indigo-500 text-white': 'border bg-transparent text-indigo-500 border-indigo-500',
      'bg-gray-500 text-white': 'border bg-transparent text-gray-500 border-gray-500',
      'bg-gray-200 text-gray-700': 'border bg-transparent text-gray-700 border-gray-400'
    }
    return map[cls] || cls
  }

  // Extract gender and irregularity tags for header
  const genderTag = processedTags.essential.find(tag =>
    tag.display === '♂' || tag.display === '♀' || tag.display === '⚥'
  )
  const irregularTag = processedTags.essential.find(tag =>
    typeof tag?.display === 'string' && tag.display.includes('IRREG')
  )

  // All other tags go under translations
  const bottomTags = [
    ...processedTags.essential.filter(tag =>
      tag.display !== '♂' &&
      tag.display !== '♀' &&
      tag.display !== '⚥' &&
      !(typeof tag?.display === 'string' && tag.display.includes('IRREG'))
    ),
    ...processedTags.detailed
  ]

  const orderedBottomTags = (() => {
    if (!Array.isArray(bottomTags) || bottomTags.length === 0) return []

    const cefrLevelTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('CEFR-'))
    const cefrTierTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('cefr-tier-'))
    const frequencyRankTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('freq-rank-'))
    const frequencyTierTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('freq-tier-'))
    const otherTags = bottomTags.filter((tag) =>
      !(typeof tag?.tag === 'string' && (
        tag.tag.startsWith('CEFR-') ||
        tag.tag.startsWith('cefr-tier-') ||
        tag.tag.startsWith('freq-rank-') ||
        tag.tag.startsWith('freq-tier-')
      ))
    )

    return [...cefrLevelTags, ...cefrTierTags, ...frequencyRankTags, ...frequencyTierTags, ...otherTags]
  })()

  const primaryMetadataTags = orderedBottomTags.filter((tag) =>
    typeof tag?.tag === 'string' && (
      tag.tag.startsWith('CEFR-') ||
      tag.tag.startsWith('cefr-tier-') ||
      tag.tag.startsWith('freq-rank-') ||
      tag.tag.startsWith('freq-tier-')
    )
  )

  const lexicalMetadataTags = orderedBottomTags.filter((tag) =>
    typeof tag?.tag === 'string' && (
      tag.tag.startsWith('abbreviation-type-') ||
      tag.tag.startsWith('affix-type-') ||
      tag.tag.startsWith('adjective-type-') ||
      tag.tag.startsWith('adverb-') ||
      tag.tag.startsWith('optional-tag-')
    )
  )

  const grammarMetadataTags = orderedBottomTags.filter((tag) =>
    typeof tag?.tag === 'string' && (
      tag.tag === 'singolare' ||
      tag.tag === 'plurale' ||
      tag.tag === 'number-restriction-singular-only' ||
      tag.tag === 'number-restriction-plural-only' ||
      tag.tag === 'form-2' ||
      tag.tag === 'form-4' ||
      tag.tag === 'form-invariable' ||
      tag.tag === 'reflexive' ||
      tag.tag === 'reflexive-verb' ||
      tag.tag.startsWith('plural-formation-') ||
      tag.tag.startsWith('noun-type-') ||
      tag.tag.startsWith('determiner-type-') ||
      tag.tag.startsWith('preposition-type-') ||
      tag.tag.startsWith('pronoun-form-') ||
      tag.tag.startsWith('pronoun-type-') ||
      tag.tag.startsWith('conjunction-type-') ||
      tag.tag.startsWith('phonology-position-')
    )
  )

  const themeOutlineChipClass =
    word.word_type === 'VERB'
      ? 'border border-teal-500 text-teal-700 bg-transparent'
      : word.word_type === 'ADJECTIVE'
        ? 'border border-blue-500 text-blue-700 bg-transparent'
        : word.word_type === 'ADVERB'
          ? 'border border-purple-500 text-purple-700 bg-transparent'
          : 'border border-cyan-500 text-cyan-700 bg-transparent'

  // Translation-level chips: auxiliary, reciprocal, number restrictions, and gender restrictions
  const renderTranslationChips = (translation) => {
    const chips = []
    const core = Array.isArray(translation.rpc_core) ? translation.rpc_core : []
    const normalizeValue = (value) => String(value || '').trim().toLowerCase()
    const standardRegisterChipClass = 'inline-block text-[12px] px-2 py-0.5 rounded-full font-semibold leading-none border bg-slate-700 text-white border-slate-700'
    const highRiskRegisterChipClass = 'inline-block text-[12px] px-2 py-0.5 rounded-full font-semibold leading-none border bg-red-900 text-white border-red-900'
    const isHighRiskRegister = (value) => ['vulgar', 'offensive', 'archaic'].includes(value)
    const addTextChip = (symbol, title, registerValue = null, classNameOverride = null) => {
      if (!symbol) return
      chips.push({
        symbol,
        title,
        className: classNameOverride || (isHighRiskRegister(normalizeValue(registerValue)) ? highRiskRegisterChipClass : standardRegisterChipClass)
      })
    }
    const neutralSenseChipClass = 'inline-block text-[12px] px-2 py-0.5 rounded-full font-semibold leading-none border bg-slate-700 text-white border-slate-700'

    // Conditional auxiliary/transitivity chips: show only when they disambiguate across this lemma.
    const translationRows = Array.isArray(translations) ? translations : []
    const uniqueAuxiliaries = new Set()
    const uniqueTransitivities = new Set()
    translationRows.forEach((row) => {
      const rowCore = Array.isArray(row?.rpc_core) ? row.rpc_core : []
      rowCore.forEach((tag) => {
        if (isAttribute(tag, ATTRIBUTES.AUXILIARY_VERB)) {
          uniqueAuxiliaries.add(normalizeValue(tag.value_label))
        }
        if (isAttribute(tag, ATTRIBUTES.TRANSITIVITY)) {
          uniqueTransitivities.add(tag.value_id || normalizeValue(tag.value_label))
        }
      })
    })

    if (uniqueAuxiliaries.size > 1) {
      const auxTag = core.find((tag) => isAttribute(tag, ATTRIBUTES.AUXILIARY_VERB))
      const auxValue = normalizeValue(auxTag?.value_label)
      if (auxValue === 'avere') {
        addTextChip('av.', 'Auxiliary: avere', null, neutralSenseChipClass)
      } else if (auxValue === 'essere') {
        addTextChip('ess.', 'Auxiliary: essere', null, neutralSenseChipClass)
      }
    }

    if (uniqueTransitivities.size > 1) {
      const transitivityTag = core.find((tag) => isAttribute(tag, ATTRIBUTES.TRANSITIVITY))
      if (transitivityTag) {
        if (isValue(transitivityTag, VALUES.TRANSITIVITY_TRANSITIVE)) {
          addTextChip('trans', 'Transitivity: transitive', null, neutralSenseChipClass)
        } else if (isValue(transitivityTag, VALUES.TRANSITIVITY_INTRANSITIVE)) {
          addTextChip('intrans', 'Transitivity: intransitive', null, neutralSenseChipClass)
        } else if (isValue(transitivityTag, VALUES.TRANSITIVITY_AMBITRANSITIVE)) {
          addTextChip('ambi', 'Transitivity: ambitransitive', null, neutralSenseChipClass)
        }
      }
    }

    // Register chips (translation-level, emoji-only display)
    core.forEach(tag => {
      if (isAttribute(tag, ATTRIBUTES.REGISTER)) {
        if (isValue(tag, VALUES.REGISTER_FORMAL)) {
          chips.push({
            symbol: TAG_DISPLAYS[VALUES.REGISTER_FORMAL].display,
            title: 'Formal register - use in professional/elevated contexts',
            className: standardRegisterChipClass
          })
        } else if (isValue(tag, VALUES.REGISTER_CASUAL)) {
          chips.push({
            symbol: TAG_DISPLAYS[VALUES.REGISTER_CASUAL].display,
            title: 'Casual register - informal/everyday speech',
            className: standardRegisterChipClass
          })
        } else if (isValue(tag, VALUES.REGISTER_MIXED)) {
          chips.push({
            symbol: TAG_DISPLAYS[VALUES.REGISTER_MIXED].display,
            title: 'Mixed register - appropriate in both formal and casual contexts',
            className: standardRegisterChipClass
          })
        }
        // Note: REGISTER_NEUTRAL is intentionally excluded (not displayed)
      }
    })

    // Additional register values currently present locally
    core.forEach(tag => {
      if (!isAttribute(tag, ATTRIBUTES.REGISTER)) return
      const value = normalizeValue(tag.value_label)
      const registerLabelMap = {
        'archaic': 'archaic',
        'figurative': 'figurative',
        'informal': 'informal',
        'literary': 'literary',
        'offensive': 'offensive',
        'regional': 'regional',
        'vulgar': 'vulgar'
      }
      if (value === 'neutral') return
      if (registerLabelMap[value]) {
        addTextChip(
          registerLabelMap[value],
          `${registerLabelMap[value]} register. This sense is specifically marked for that usage context`,
          value
        )
      }
    })

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

  const normalizedPronunciationGroups = pronunciationGroups.length > 0
    ? (() => {
        const groupsById = new Map()

        pronunciationGroups.forEach((group, index) => {
          groupsById.set(group?.id || `pronunciation-group-${index}`, {
            ...group,
            key: group?.id || `pronunciation-group-${index}`,
            meaningItems: [],
            firstTranslationOrder: Number.MAX_SAFE_INTEGER
          })
        })

        translations.forEach((translation, translationIndex) => {
          const matchingGroup = pronunciationGroups.find((group) =>
            Array.isArray(group?.linked_translations) &&
            group.linked_translations.some((linkedTranslation) => linkedTranslation.id === translation.id)
          )

          if (!matchingGroup) return

          const groupKey = matchingGroup?.id || `pronunciation-group-${translationIndex}`
          const groupRef = groupsById.get(groupKey)
          if (!groupRef) return

          const linkedTranslation = matchingGroup.linked_translations.find((item) => item.id === translation.id)
          groupRef.meaningItems.push({
            key: linkedTranslation?.pronunciation_link_id || translation.id || `linked-translation-${translationIndex}`,
            kind: 'translation',
            translation,
            note: linkedTranslation?.note || ''
          })
          groupRef.firstTranslationOrder = Math.min(groupRef.firstTranslationOrder, translationIndex)
        })

        return Array.from(groupsById.values())
          .sort((a, b) => {
            if (a.firstTranslationOrder !== b.firstTranslationOrder) {
              return a.firstTranslationOrder - b.firstTranslationOrder
            }
            return 0
          })
          .filter(group => group.meaningItems.length > 0)
      })()
    : [
        {
          key: 'fallback-pronunciation-group',
          id: 'fallback-pronunciation-group',
          ipa_pronunciation: word.primary_ipa || null,
          phonetic_pronunciation: word.primary_phonetic || null,
          primary_audio: word.primary_audio || null,
          meaningItems: translations.map((translation, index) => ({
            key: translation.id || `fallback-translation-${index}`,
            kind: 'translation',
            translation
          }))
        }
      ].filter(group => group.meaningItems.length > 0)

  // Format context hint for display
  const formatContextHint = (usageNotes) => {
    if (usageNotes && usageNotes.length < 30) {
      return usageNotes
    }

    return ''
  }

  const toggleMeaningGroup = (groupKey) => {
    setExpandedMeaningGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  const renderMeaningRow = (item, index, groupKey) => {
    const isTranslation = item.kind === 'translation'
    const translation = item.translation
    const displayText = isTranslation ? translation?.translation : item.label
    const usageText = isTranslation
      ? formatContextHint(translation?.usageNotes || item.note)
      : formatContextHint(item.note)
    const meaningChips = isTranslation
      ? renderTranslationChips(translation)
      : []

    return (
      <div key={item.key || `${groupKey}-${index}`}>
        <div className="flex items-start gap-1.5 py-0.5 min-h-[24px]">
          <div className="w-5 flex-shrink-0 pt-0.5 text-sm font-bold text-gray-500 leading-tight">
            {index}.
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-base leading-tight ${isTranslation ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {displayText}
              </span>
              {meaningChips.length > 0 && (
                <span className="flex items-center gap-0.5 flex-wrap leading-tight">
                  {meaningChips.map((chip, chipIndex) => (
                    <span
                      key={`meaning-chip-${groupKey}-${index}-${chipIndex}`}
                      className={`wordcard-sense-chip ${chip.className}`}
                      data-description={chip.title}
                      onClick={handleTagClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {chip.symbol}
                    </span>
                  ))}
                </span>
              )}
            </div>
            {usageText && (
              <div className="mt-0 text-[11px] leading-tight italic text-gray-500">
                {usageText}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

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
            zIndex: 10000
          }}
        >
          {tooltip.content}
        </div>
      )}
        {/* Main Word Header - New Layout */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Italian Word */}
            <h3 className={`text-3xl font-bold ${colors.text}`}>
              {word.italian}
            </h3>

            {/* Gender Tag */}
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

            {/* POS Chip */}
            {word.word_type === 'VERB' ? (
              <button
                onClick={() => setShowConjugations(true)}
                className={`px-3 py-1 rounded-full text-sm font-semibold border cursor-pointer active:translate-y-px transition-all ${colors.tag} ${colors.badgeHover}`}
                title="View conjugations"
              >
                {wordTypeLabel}
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colors.tag}`}>
                {wordTypeLabel}
              </span>
            )}

            {/* Irregularity chip in header, after POS */}
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

        {/* Pronunciation-led meanings */}
        {normalizedPronunciationGroups.length > 0 && (
          <div className="mb-3 space-y-3">
            {normalizedPronunciationGroups.map((group) => {
              const groupLabel = formatPronunciationGroupLabel(group)
              const groupAudio = group?.primary_audio || null
              const groupTranslations = []
              const seenGroupTranslationIds = new Set()
              group.meaningItems.forEach((item) => {
                if (item.kind !== 'translation' || !item.translation) return
                const dedupeKey = item.translation.id || item.translation.translation
                if (seenGroupTranslationIds.has(dedupeKey)) return
                seenGroupTranslationIds.add(dedupeKey)
                groupTranslations.push(item.translation)
              })
              const groupTranslationIds = groupTranslations
                .map((translation) => translation?.id)
                .filter(Boolean)
              const visibleItems = group.meaningItems.slice(0, maxVisibleMeaningsPerGroup)
              const additionalItems = group.meaningItems.slice(maxVisibleMeaningsPerGroup)
              const isExpanded = !!expandedMeaningGroups[group.key]
              const translationItems = group.meaningItems.filter(item => item.kind === 'translation')
              const groupBaseNumber = translationItems.length > 0
                ? translations.findIndex(translation => translation.id === translationItems[0].translation?.id) + 1
                : 1

              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-white/70 bg-white/75 px-3 py-2 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-base italic font-medium text-gray-600">
                      {groupLabel}
                    </span>
                    <AudioButton
                      wordId={word.id}
                      italianText={word.italian}
                      audioObjectKey={groupAudio?.object_key || null}
                      audioBucket={groupAudio?.storage_bucket || null}
                      size="chip"
                      variant="inline-icon"
                      title={
                        groupAudio?.voice_name
                          ? `Play pronunciation variant (${groupAudio.voice_name})`
                          : 'Play pronunciation variant'
                      }
                    />
                    {onAddToDeck && groupTranslations.length > 0 && (
                      <button
                        onClick={() =>
                          onAddToDeck(word, null, {
                            mode: 'pronunciation-group',
                            groupId: group.id || group.key,
                            groupLabel,
                            translations: groupTranslations,
                            translationIds: groupTranslationIds
                          })
                        }
                        className="ml-auto w-6 h-6 inline-flex items-center justify-center text-emerald-700 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-sm transition-colors cursor-pointer"
                        title={`Study pronunciation group: ${groupLabel} (${groupTranslations.length} meaning${groupTranslations.length === 1 ? '' : 's'})`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 5V19" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {visibleItems.map((item, index) => renderMeaningRow(item, groupBaseNumber + index, group.key))}

                    {additionalItems.length > 0 && (
                      <>
                        <button
                          onClick={() => toggleMeaningGroup(group.key)}
                          className="ml-7 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? '▾' : '▸'} {additionalItems.length} additional meaning{additionalItems.length === 1 ? '' : 's'}
                        </button>

                        {isExpanded && (
                          <div className="space-y-1">
                            {additionalItems.map((item, index) =>
                              renderMeaningRow(item, groupBaseNumber + visibleItems.length + index, group.key)
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(primaryMetadataTags.length > 0 || grammarMetadataTags.length > 0) && (
          <div className="flex gap-1 flex-wrap pt-1">
            {primaryMetadataTags.map((tag, index) => (
              <span
                key={`primary-${index}`}
                className={`wordcard-primary-chip inline-block text-[13px] px-2.5 py-1 rounded-full font-semibold leading-none ${tag.class}`}
                data-description={tag.description}
                onClick={handleTagClick}
                style={{ cursor: 'pointer' }}
              >
                {tag.display}
              </span>
            ))}
            {grammarMetadataTags.map((tag, index) => (
              <span
                key={`grammar-${index}`}
                className={`wordcard-grammar-chip inline-block text-[12px] px-2.5 py-1 rounded-full font-semibold leading-none ${themeOutlineChipClass}`}
                data-description={tag.description}
                onClick={handleTagClick}
                style={{ cursor: 'pointer' }}
              >
                {tag.display}
              </span>
            ))}
          </div>
        )}

        {lexicalMetadataTags.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {lexicalMetadataTags.map((tag, index) => (
              <span
                key={`lexical-${index}`}
                className={`wordcard-secondary-chip inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${tag.class}`}
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
