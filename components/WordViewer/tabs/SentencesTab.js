'use client'

// components/WordViewer/tabs/SentencesTab.js
// Aggregated view of all example sentences linked to the word, grouped by entity type.

import SentenceList from '../SentenceList'

export default function SentencesTab({ word, fullBundle, isLoading }) {
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
      // Sentence with no specific link goes to "General"
      if (!groups['general']) {
        groups['general'] = { label: 'General', sentences: [] }
      }
      groups['general'].sentences.push(sentence)
      return
    }

    // Process each link
    sentence.links.forEach(link => {
      const entityType = link?.entity_type
      const entityId = link?.entity_id
      let groupKey = null
      let groupLabel = null

      if (entityType === 'word_translation' && entityId) {
        // Find the matching translation
        const translation = translations.find(t => t.id === entityId)
        if (translation) {
          groupKey = `sense-${entityId}`
          groupLabel = translation.translation || `Sense ${entityId}`
        }
      } else if (entityType === 'form_translation_group' && entityId) {
        // Find the matching FTG
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
        // Avoid duplicate sentences in the same group
        if (!groups[groupKey].sentences.some(s => s.id === sentence.id)) {
          groups[groupKey].sentences.push(sentence)
        }
      } else if (!groupKey) {
        // If we couldn't determine a specific group, add to general
        if (!groups['general']) {
          groups['general'] = { label: 'General', sentences: [] }
        }
        if (!groups['general'].sentences.some(s => s.id === sentence.id)) {
          groups['general'].sentences.push(sentence)
        }
      }
    })
  })

  // Sort groups: sense translations first, then FTGs, then general
  const groupOrder = ['sense', 'ftg', 'general']
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
    <div className="p-4 space-y-6">
      {sortedGroupKeys.map(groupKey => {
        const group = groups[groupKey]
        return (
          <div key={groupKey}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              {group.label}
            </h3>
            <SentenceList sentences={group.sentences} compact={false} />
          </div>
        )
      })}
    </div>
  )
}
