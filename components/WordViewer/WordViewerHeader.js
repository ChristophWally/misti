'use client'

// components/WordViewer/WordViewerHeader.js

import AudioButton from '../AudioButton'
import { getWordTypeColors } from '../../lib/word-type-utils'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
}

export default function WordViewerHeader({ word, onClose }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)
  const barClass = POS_COLOUR_BAR[wordType] || 'bg-gray-400'

  const posLabel = wordType.charAt(0) + wordType.slice(1).toLowerCase()

  // Derive IPA and primary audio from word
  const primaryGroup = Array.isArray(word?.pronunciation_groups) ? word.pronunciation_groups[0] : null
  const ipa = primaryGroup?.ipa_pronunciation || word?.ipa_pronunciation || ''
  const primaryAudio = word?.primary_audio_descriptor || primaryGroup?.primary_audio_descriptor || null

  // Derive CEFR and frequency chips from word core tags
  const coreTags = Array.isArray(word?.word_display_core_tags) ? word.word_display_core_tags :
                   (Array.isArray(word?.word_core_tags) ? word.word_core_tags : [])

  const cefrTag = coreTags.find(t => t?.attribute_stable_id === 'metaattr001' ||
    ['A1','A2','B1','B2','C1','C2'].includes(t?.value_label))
  const freqTag = coreTags.find(t => t?.attribute_stable_id === 'metaattr007')
  const freqMap = { 'top100': '100', 'top500': '500', 'top1000': '1K', 'top2500': '2.5K', 'top5000': '5K', 'top10000': '10K' }
  const freqDisplay = freqTag ? freqMap[String(freqTag.value_label || '').toLowerCase()] : null

  // Conjugation label for verbs
  const conjTag = coreTags.find(t => t?.attribute_stable_id === 'metaattr004')
  const conjMap = { 'are': '-ARE', 'ere': '-ERE', 'ire': '-IRE', 'ire-isc': '-ISC' }
  const conjLabel = conjTag ? conjMap[String(conjTag.value_label || '').toLowerCase()] : ''
  const wordTypeLabel = wordType === 'VERB' && conjLabel ? `VERB ${conjLabel}` : posLabel

  return (
    <div className={`${colors.bg} border-b ${colors.border} px-4 py-3`}>
      <div className="flex items-start gap-3">
        {/* POS colour bar */}
        <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${barClass}`} />

        <div className="flex-1 min-w-0">
          {/* Lemma row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={`text-2xl font-bold ${colors.text} leading-tight`}>
              {word?.italian}
            </h2>
            {ipa && (
              <span className="text-sm text-gray-500 font-mono">[{ipa}]</span>
            )}
            {primaryAudio && (
              <AudioButton
                audioDescriptor={primaryAudio}
                size="sm"
                wordType={wordType}
              />
            )}
          </div>

          {/* Chips row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded border ${colors.tag} font-medium`}>
              {wordTypeLabel}
            </span>
            {cefrTag && (
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500 text-white font-medium">
                {cefrTag.value_label}
              </span>
            )}
            {freqDisplay && (
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500 text-white font-medium">
                ⭐ {freqDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
          aria-label="Close word viewer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
