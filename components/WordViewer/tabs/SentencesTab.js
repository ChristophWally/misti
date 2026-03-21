'use client'

// components/WordViewer/tabs/SentencesTab.js
// Aggregated view of all example sentences linked to the word, grouped by entity type.
// Card per group with sentence count badge and sticky group headers.

import SentenceList from '../SentenceList'
import { getWordTypeColors } from '../../../lib/word-type-utils'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
  PREPOSITION: 'bg-gray-500',
}

export default function SentencesTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const barClass = POS_COLOUR_BAR[wordType] || 'bg-gray-400'
  const sentences = Array.isArray(fullBundle?.sentences) ? fullBundle.sentences : []
  const translations = Array.isArray(fullBundle?.translations) ? fullBundle.translations : []
  const formTranslationGroups = Array.isArray(fullBundle?.form_translation_groups)
    ? fullBundle.form_translation_groups
    : []

  if (isLoading && !fullBundle && sentences.length === 0) {
    return <div className="p-4 text-sm text-gray-400">Loading sentences...</div>
  }

  if (sentences.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No example sentences available for this word.
      </div>
    )
  }

  // Group sentences by linked entity
  const groups = {}

  sentences.forEach(sentence => {
    if (!Array.isArray(sentence.links) || sentence.links.length === 0) {
      if (!groups['general']) {
        groups['general'] = { label: 'General', sentences: [] }
      }
      groups['general'].sentences.push(sentence)
      return
    }

    sentence.links.forEach(link => {
      const entityType = link?.entity_type
      const entityId = link?.entity_id
      let groupKey = null
      let groupLabel = null

      if (entityType === 'word_translation' && entityId) {
        const translation = translations.find(t => t.id === entityId)
        if (translation) {
          groupKey = `sense-${entityId}`
          groupLabel = translation.translation || `Sense ${entityId}`
        }
      } else if (entityType === 'form_translation_group' && entityId) {
        const ftg = formTranslationGroups.find(f => f.id === entityId)
        if (ftg) {
          groupKey = `ftg-${entityId}`
          groupLabel = ftg.translation || `Form translation ${entityId}`
        }
      }

      if (groupKey && groupLabel) {
        if (!groups[groupKey]) {
          groups[groupKey] = { label: groupLabel, sentences: [] }
        }
        if (!groups[groupKey].sentences.some(s => s.id === sentence.id)) {
          groups[groupKey].sentences.push(sentence)
        }
      } else if (!groupKey) {
        if (!groups['general']) {
          groups['general'] = { label: 'General', sentences: [] }
        }
        if (!groups['general'].sentences.some(s => s.id === sentence.id)) {
          groups['general'].sentences.push(sentence)
        }
      }
    })
  })

  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    const getOrder = (key) => {
      if (key.startsWith('sense-')) return 0
      if (key.startsWith('ftg-')) return 1
      if (key === 'general') return 2
      return 3
    }
    return getOrder(a) - getOrder(b)
  })

  return (
    <div className="p-4 space-y-4">
      {sortedGroupKeys.map(groupKey => {
        const group = groups[groupKey]
        const count = group.sentences.length
        return (
          <div key={groupKey} className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
            <div className={`w-1.5 flex-shrink-0 ${barClass}`} />
            <div className="flex-1 min-w-0">
            {/* Sticky group header */}
            <div className="sticky top-0 z-[5] flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                {group.label}
              </h3>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                {count}
              </span>
            </div>
            <div className="p-3">
              <SentenceList sentences={group.sentences} compact={false} colorBarClass={barClass} />
            </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
