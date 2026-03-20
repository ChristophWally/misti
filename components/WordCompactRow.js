'use client'

// components/WordCompactRow.js
// Single-line compact word row for the DictionaryPanel list

import { getWordTypeColors } from '../lib/word-type-utils'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
}

export default function WordCompactRow({ word, onClick }) {
  const wordType = String(word.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)
  const barClass = POS_COLOUR_BAR[wordType] || 'bg-gray-400'

  // Derive primary translation text
  const primaryTranslation = (() => {
    const groups = Array.isArray(word.pronunciation_groups) ? word.pronunciation_groups : []
    for (const group of groups) {
      const translations = Array.isArray(group.translations) ? group.translations : []
      if (translations.length > 0) return translations[0].translation || ''
    }
    return ''
  })()

  const posLabel = wordType.charAt(0) + wordType.slice(1).toLowerCase()

  return (
    <button
      onClick={() => onClick(word)}
      className={`w-full flex items-center gap-2 px-3 py-2 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors group`}
    >
      {/* POS colour bar */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${barClass}`} />

      {/* Lemma */}
      <span className={`font-semibold text-sm ${colors.text} flex-shrink-0 min-w-0 truncate max-w-[120px]`}>
        {word.italian}
      </span>

      {/* Primary translation */}
      <span className="text-xs text-gray-500 flex-1 min-w-0 truncate">
        {primaryTranslation}
      </span>

      {/* POS badge */}
      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${colors.tag} border`}>
        {posLabel}
      </span>
    </button>
  )
}
