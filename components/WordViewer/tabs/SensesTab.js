'use client'

// components/WordViewer/tabs/SensesTab.js
// Renders senses with pronunciation groups and inline example sentences.
// Replaces OverviewTab in the new 5-tab structure.

import AudioButton from '../../AudioButton'
import WordSenseRow from '../WordSenseRow'
import SentenceList from '../SentenceList'

/**
 * Join translations to pronunciation groups via group.linked_translations[].id,
 * exactly as OverviewTab does. Returns an array of group objects each with a
 * `resolvedTranslations` array ordered by display_priority.
 */
function buildGroupedTranslations(pronunciationGroups, translations) {
  if (!pronunciationGroups.length) return null // signals: use flat fallback

  const translationsById = new Map(translations.map(t => [t.id, t]))
  const groups = pronunciationGroups.map((group, i) => {
    const linked = Array.isArray(group.linked_translations) ? group.linked_translations : []
    const resolvedTranslations = linked
      .map(link => translationsById.get(link.id))
      .filter(Boolean)
      .sort((a, b) => (a.display_priority || 999) - (b.display_priority || 999))
    return { ...group, key: group.id || `group-${i}`, resolvedTranslations }
  }).filter(g => g.resolvedTranslations.length > 0)

  return groups
}

export default function SensesTab({ word, fullBundle, isLoading }) {
  // After bundle loads, prefer the hydrated word's pronunciation groups and the
  // bundle's translation array (which carries usage_notes, core_tags, etc.).
  const pronunciationGroups = Array.isArray(fullBundle?.word?.pronunciation_groups)
    ? fullBundle.word.pronunciation_groups
    : Array.isArray(word?.pronunciation_groups)
      ? word.pronunciation_groups
      : []

  // Translations from bundle (hydrated, with usage_notes) or from list-level word
  const translations = Array.isArray(fullBundle?.translations)
    ? fullBundle.translations
    : (Array.isArray(word?.word_translations) ? word.word_translations : [])

  // Sentences and etymologies from bundle
  const sentences = Array.isArray(fullBundle?.sentences) ? fullBundle.sentences : []
  const etymologies = Array.isArray(fullBundle?.etymologies) ? fullBundle.etymologies : []

  const groups = buildGroupedTranslations(pronunciationGroups, translations)

  // Loading skeleton while bundle fetch is in flight and we have no data yet
  if (isLoading && !fullBundle && translations.length === 0) {
    return <div className="p-4 text-sm text-gray-400">Loading...</div>
  }

  if (translations.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No translation data available.</div>
  }

  // Helper: filter sentences for a specific sense
  const getSentencesForSense = (senseId) => {
    return sentences.filter(s => {
      if (!Array.isArray(s.links)) return false
      return s.links.some(link =>
        link.entity_type === 'word_translation' && link.entity_id === senseId
      )
    })
  }

  // Helper: check if sense has etymology
  const hasEtymologyForSense = (senseId) => {
    return etymologies.some(e =>
      e.entity_type === 'word_translation' && e.entity_id === senseId
    )
  }

  // Grouped display (pronunciation groups with linked translations)
  if (groups && groups.length > 0) {
    let senseIndex = 1
    return (
      <div className="p-4 space-y-4">
        {groups.map((group) => {
          const ipa = group.ipa_pronunciation || group.phonetic_pronunciation || group.accent || ''
          const audioDesc = group.primary_audio_descriptor || group.primary_audio || null

          return (
            <div key={group.key} className="rounded-lg border border-gray-100 overflow-hidden">
              {/* Group header: IPA + audio */}
              {(ipa || audioDesc) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  {ipa && <span className="text-sm font-mono text-gray-600">[{ipa}]</span>}
                  {audioDesc && (
                    <AudioButton audioDescriptor={audioDesc} size="sm" wordType={word?.word_type} />
                  )}
                </div>
              )}
              <div className="px-3">
                {group.resolvedTranslations.map(t => {
                  const senseSentences = getSentencesForSense(t.id)
                  const hasEtymology = hasEtymologyForSense(t.id)

                  return (
                    <div key={t.id}>
                      {/* Sense row */}
                      <div className="flex items-baseline gap-1">
                        {hasEtymology && (
                          <span
                            className="text-sm text-gray-400 cursor-help"
                            title="This sense has etymological information"
                          >
                            📜
                          </span>
                        )}
                        <div className="flex-1">
                          <WordSenseRow translation={t} index={senseIndex++} />
                        </div>
                      </div>

                      {/* Inline sentences for this sense */}
                      {senseSentences.length > 0 && (
                        <div className="ml-7 pb-2">
                          <SentenceList sentences={senseSentences} compact={true} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Flat fallback: no pronunciation groups, or no linked_translations — list all translations
  let senseIndex = 1
  const sortedTranslations = translations
    .slice()
    .sort((a, b) => (a.display_priority || 999) - (b.display_priority || 999))

  return (
    <div className="p-4">
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-3">
          {sortedTranslations.map(t => {
            const senseSentences = getSentencesForSense(t.id)
            const hasEtymology = hasEtymologyForSense(t.id)

            return (
              <div key={t.id}>
                <div className="flex items-baseline gap-1">
                  {hasEtymology && (
                    <span
                      className="text-sm text-gray-400 cursor-help"
                      title="This sense has etymological information"
                    >
                      📜
                    </span>
                  )}
                  <div className="flex-1">
                    <WordSenseRow translation={t} index={senseIndex++} />
                  </div>
                </div>

                {senseSentences.length > 0 && (
                  <div className="ml-7 pb-2">
                    <SentenceList sentences={senseSentences} compact={true} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
