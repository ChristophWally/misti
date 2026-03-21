'use client'

// components/WordViewer/WordViewerHeader.js
// Sticky header: lemma + gender + POS + IRREG in title row,
// then CEFR/freq (filled), grammar (outlined theme), lexical (small) — matching WordCard.

import AudioButton from '../AudioButton'
import PronunciationDisplay from './PronunciationDisplay'
import { getWordTypeColors } from '../../lib/word-type-utils'
import { processRpcTagsForDisplay } from '../../lib/tag-processing'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
}

// Convert filled chip class to outlined (word-type border, transparent bg) — same as WordCard
function outlinedClass(cls) {
  const map = {
    'bg-blue-500 text-white': 'border bg-transparent text-blue-600 border-blue-500',
    'bg-pink-500 text-white': 'border bg-transparent text-pink-600 border-pink-500',
    'bg-purple-500 text-white': 'border bg-transparent text-purple-600 border-purple-500',
    'bg-yellow-500 text-white': 'border bg-transparent text-yellow-600 border-yellow-500',
    'bg-orange-500 text-white': 'border bg-transparent text-orange-600 border-orange-500',
    'bg-cyan-500 text-white': 'border bg-transparent text-cyan-600 border-cyan-500',
    'bg-teal-500 text-white': 'border bg-transparent text-teal-600 border-teal-500',
    'bg-gray-500 text-white': 'border bg-transparent text-gray-600 border-gray-500',
    'bg-indigo-500 text-white': 'border bg-transparent text-indigo-600 border-indigo-500',
  }
  return map[cls] || cls
}

export default function WordViewerHeader({ word, fullBundle, onClose }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)
  const barClass = POS_COLOUR_BAR[wordType] || 'bg-gray-400'

  // Pronunciation links from bundle for multi-variant display
  const pronunciationLinks = fullBundle?.word?.pronunciation_links || word?.pronunciation_links || []

  // Primary audio for the lemma (before bundle loads)
  const primaryGroup = Array.isArray(word?.pronunciation_groups) ? word.pronunciation_groups[0] : null
  const primaryAudio = word?.primary_audio || primaryGroup?.primary_audio || null

  // Word-level tags
  const coreTags = Array.isArray(word?.word_display_core_tags) ? word.word_display_core_tags :
                   (Array.isArray(word?.word_core_tags) ? word.word_core_tags : [])
  const optionalTags = word?.word_display_optional_tags || word?.word_optional_tags || []
  const { essential, detailed } = processRpcTagsForDisplay(coreTags, wordType, optionalTags)

  // Conjugation label for verbs (for POS chip)
  const conjTag = coreTags.find(t => t?.attribute_stable_id === 'metaattr004')
  const conjMap = { 'are': '-ARE', 'ere': '-ERE', 'ire': '-IRE', 'ire-isc': '-ISC' }
  const conjLabel = conjTag ? conjMap[String(conjTag.value_label || '').toLowerCase()] : ''
  const wordTypeLabel = wordType === 'VERB' && conjLabel ? `VERB ${conjLabel}` : (wordType.charAt(0) + wordType.slice(1).toLowerCase())

  // Separate tags by display tier — matching WordCard's categorisation
  const allTags = [...essential, ...detailed]

  const genderTag = essential.find(t => t.display === '♂' || t.display === '♀' || t.display === '⚥')
  const irregularTag = essential.find(t => typeof t?.display === 'string' && t.display.includes('IRREG'))

  // Primary metadata: CEFR + frequency (filled solid chips)
  const primaryMetaTags = allTags.filter(t =>
    typeof t?.tag === 'string' && (t.tag.startsWith('CEFR-') || t.tag.startsWith('freq-rank-') || t.tag.startsWith('freq-tier-') || t.tag.startsWith('cefr-tier-'))
  )

  // Grammar chips: displayed with outlined theme style
  const grammarTags = allTags.filter(t =>
    typeof t?.tag === 'string' && (
      t.tag === 'singolare' || t.tag === 'plurale' ||
      t.tag === 'number-restriction-singular-only' || t.tag === 'number-restriction-plural-only' ||
      t.tag === 'form-2' || t.tag === 'form-4' || t.tag === 'form-invariable' ||
      t.tag === 'reflexive' || t.tag === 'reflexive-verb' ||
      t.tag.startsWith('plural-formation-') || t.tag.startsWith('noun-type-') ||
      t.tag.startsWith('determiner-type-') || t.tag.startsWith('preposition-type-') ||
      t.tag.startsWith('pronoun-form-') || t.tag.startsWith('pronoun-type-') ||
      t.tag.startsWith('conjunction-type-') || t.tag.startsWith('phonology-position-') ||
      t.tag.startsWith('are-') || t.tag.startsWith('ere-') || t.tag.startsWith('ire-') ||
      t.tag === 'auxiliary-combined' || t.tag === 'avere-auxiliary' || t.tag === 'essere-auxiliary' ||
      t.tag.startsWith('transitivity-') || t.tag.startsWith('gradable-') ||
      t.tag.startsWith('auxiliary-')
    )
  )

  // Lexical chips: smaller, filled
  const lexicalTags = allTags.filter(t =>
    typeof t?.tag === 'string' && (
      t.tag.startsWith('abbreviation-type-') || t.tag.startsWith('affix-type-') ||
      t.tag.startsWith('adjective-type-') || t.tag.startsWith('adverb-') ||
      t.tag.startsWith('optional-tag-')
    )
  )

  // Outlined theme chip class matching WordCard
  const themeOutlineChipClass =
    wordType === 'VERB' ? 'border border-teal-500 text-teal-700 bg-transparent' :
    wordType === 'ADJECTIVE' ? 'border border-blue-500 text-blue-700 bg-transparent' :
    wordType === 'ADVERB' ? 'border border-purple-500 text-purple-700 bg-transparent' :
    'border border-cyan-500 text-cyan-700 bg-transparent'

  return (
    <div className={`${colors.bg} border-b ${colors.border} px-4 py-3`}>
      <div className="flex items-start gap-3">
        {/* POS colour bar */}
        <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${barClass}`} />

        <div className="flex-1 min-w-0">
          {/* Lemma row: word + gender + POS + IRREG + audio */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={`text-2xl font-bold ${colors.text} leading-tight`}>
              {word?.italian}
            </h2>

            {/* Gender chip inline with lemma */}
            {genderTag && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${genderTag.class}`}
                title={genderTag.description}
              >
                {genderTag.display}
              </span>
            )}

            {/* POS chip */}
            <span className={`text-xs px-2.5 py-1 rounded-full border ${colors.tag} font-semibold`}>
              {wordTypeLabel}
            </span>

            {/* IRREG chip inline */}
            {irregularTag && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${irregularTag.class}`}
                title={irregularTag.description}
              >
                {irregularTag.display}
              </span>
            )}

            {/* Audio button (primary, before bundle loads) */}
            {primaryAudio && pronunciationLinks.length === 0 && (
              <AudioButton
                wordId={word?.id}
                italianText={word?.italian}
                audioObjectKey={primaryAudio?.object_key}
                audioBucket={primaryAudio?.bucket || primaryAudio?.storage_bucket}
                size="chip"
                variant="inline-icon"
              />
            )}
          </div>

          {/* Pronunciation variants (from bundle) */}
          {pronunciationLinks.length > 0 && (
            <div className="mt-1.5">
              <PronunciationDisplay
                pronunciationLinks={pronunciationLinks}
                wordId={word?.id}
                italianText={word?.italian}
              />
            </div>
          )}

          {/* Primary metadata chips: CEFR + frequency (filled, solid) */}
          {primaryMetaTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {primaryMetaTags.map((tag, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${tag.class}`}
                  title={tag.description}
                >
                  {tag.display}
                </span>
              ))}
            </div>
          )}

          {/* Grammar chips: outlined theme style */}
          {grammarTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {grammarTags.map((tag, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${themeOutlineChipClass}`}
                  title={tag.description}
                >
                  {tag.display}
                </span>
              ))}
            </div>
          )}

          {/* Lexical chips: small */}
          {lexicalTags.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {lexicalTags.map((tag, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${outlinedClass(tag.class)}`}
                  title={tag.description}
                >
                  {tag.display}
                </span>
              ))}
            </div>
          )}
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
