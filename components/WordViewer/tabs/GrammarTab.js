'use client'

// components/WordViewer/tabs/GrammarTab.js

import { getWordTypeColors } from '../../../lib/word-type-utils'

const ATTRIBUTE_LABELS = {
  metaattr001: 'CEFR Level',
  metaattr007: 'Frequency Rank',
  metaattr034: 'Frequency Tier',
  metaattr003: 'Gender',
  metaattr008: 'Number',
  metaattr006: 'Number Restriction',
  metaattr005: 'Irregular Forms',
  metaattr002: 'Auxiliary Verb',
  metaattr004: 'Conjugation Type',
  metaattr017: 'Reflexive',
  metaattr020: 'Transitivity',
  metaattr009: 'Form Pattern',
  metaattr012: 'Gradable',
  metaattr010: 'Register',
  metaattr016: 'Adverb Type',
  metaattr019: 'Plural Formation',
  metaattr030: 'Adjective Type',
  metaattr057: 'Noun Type',
  metaattr060: 'Preposition Type',
  metaattr061: 'Determiner Type',
  metaattr062: 'Conjunction Type',
}

export default function GrammarTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)

  if (isLoading && !fullBundle) {
    return <div className="p-4 text-sm text-gray-500">Loading grammar data...</div>
  }

  const coreTags = Array.isArray(word?.word_display_core_tags) ? word.word_display_core_tags :
                   (Array.isArray(word?.word_core_tags) ? word.word_core_tags : [])

  if (coreTags.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No grammar attributes available.</div>
  }

  // Group tags by attribute
  const grouped = {}
  coreTags.forEach(tag => {
    const sid = tag?.attribute_stable_id || 'unknown'
    const label = ATTRIBUTE_LABELS[sid] || sid
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(tag?.value_label || '')
  })

  // Core grammar section always
  const coreKeys = ['CEFR Level', 'Frequency Rank', 'Frequency Tier', 'Register']

  // Type-specific sections
  const verbKeys = ['Auxiliary Verb', 'Conjugation Type', 'Reflexive', 'Transitivity', 'Irregular Forms']
  const nounKeys = ['Gender', 'Number', 'Number Restriction', 'Plural Formation', 'Noun Type', 'Irregular Forms']
  const adjKeys = ['Form Pattern', 'Gradable', 'Adjective Type', 'Irregular Forms']
  const advKeys = ['Adverb Type']
  const otherKeys = Object.keys(grouped).filter(k =>
    !coreKeys.includes(k) &&
    !verbKeys.includes(k) &&
    !nounKeys.includes(k) &&
    !adjKeys.includes(k) &&
    !advKeys.includes(k)
  )

  const typeKeys = wordType === 'VERB' ? verbKeys
    : wordType === 'NOUN' ? nounKeys
    : wordType === 'ADJECTIVE' ? adjKeys
    : wordType === 'ADVERB' ? advKeys
    : []

  const renderSection = (title, keys) => {
    const rows = keys.filter(k => grouped[k])
    if (rows.length === 0) return null
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${colors.bg} ${colors.text} border-b ${colors.border}`}>
          {title}
        </div>
        {rows.map(key => (
          <div key={key} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-500">{key}</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {grouped[key].map((val, i) => (
                <span key={i} className={`text-xs px-2 py-0.5 rounded border ${colors.tag}`}>
                  {val}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {renderSection('Core Grammar', coreKeys)}
      {typeKeys.length > 0 && renderSection(`${wordType.charAt(0) + wordType.slice(1).toLowerCase()} Attributes`, typeKeys)}
      {otherKeys.length > 0 && renderSection('Other', otherKeys)}
    </div>
  )
}
