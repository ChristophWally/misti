'use client'

// components/WordViewer/tabs/SensesTab.js
// Renders senses grouped by pronunciation group (ordered by first sense's display_priority),
// with all example sentences, images, and cross-tab etymology navigation.

import AudioButton from '../../AudioButton'
import WordSenseRow from '../WordSenseRow'
import SentenceList from '../SentenceList'
import WordImage from '../WordImage'
import { getWordTypeColors } from '../../../lib/word-type-utils'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
  PREPOSITION: 'bg-gray-500',
}

/**
 * Join translations to pronunciation groups, ordered by the display_priority
 * of the first linked translation in each group — matching WordCard's ordering.
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
    const firstPriority = resolvedTranslations[0]?.display_priority ?? 999
    return { ...group, key: group.id || `group-${i}`, resolvedTranslations, firstPriority }
  }).filter(g => g.resolvedTranslations.length > 0)

  // Sort groups by the display_priority of their first linked translation
  return groups.sort((a, b) => a.firstPriority - b.firstPriority)
}

/** Build a map of entity_id → [mediaAsset, ...] for images. */
function buildImageMap(mediaLinks = [], mediaAssets = []) {
  const assetsById = new Map(mediaAssets.map(a => [a.id, a]))
  const map = {}

  for (const link of mediaLinks) {
    const asset = assetsById.get(link.media_asset_id)
    if (!asset || asset.media_kind !== 'image') continue
    const key = `${link.entity_type}:${link.entity_id}`
    if (!map[key]) map[key] = []
    map[key].push({ ...asset, link_order: link.link_order ?? 999, media_role: link.media_role })
  }

  // Sort by link_order within each entity
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.link_order - b.link_order)
  }

  return map
}

export default function SensesTab({ word, fullBundle, isLoading, onNavigateTab }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const barClass = POS_COLOUR_BAR[wordType] || 'bg-gray-400'
  const pronunciationGroups = Array.isArray(fullBundle?.word?.pronunciation_groups)
    ? fullBundle.word.pronunciation_groups
    : Array.isArray(word?.pronunciation_groups)
      ? word.pronunciation_groups
      : []

  const translations = Array.isArray(fullBundle?.translations)
    ? fullBundle.translations
    : (Array.isArray(word?.word_translations) ? word.word_translations : [])

  const sentences = Array.isArray(fullBundle?.sentences) ? fullBundle.sentences : []
  const etymologies = Array.isArray(fullBundle?.etymologies) ? fullBundle.etymologies : []

  // Build image map: "entity_type:entity_id" → [mediaAsset, ...]
  const imageMap = buildImageMap(
    fullBundle?.media_links || [],
    fullBundle?.media_assets || []
  )

  const groups = buildGroupedTranslations(pronunciationGroups, translations)

  if (isLoading && !fullBundle && translations.length === 0) {
    return <div className="p-4 text-sm text-gray-400">Loading...</div>
  }

  if (translations.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No translation data available.</div>
  }

  const getSentencesForSense = (senseId) => {
    return sentences.filter(s => {
      if (!Array.isArray(s.links)) return false
      return s.links.some(link =>
        link.entity_type === 'word_translation' && link.entity_id === senseId
      )
    })
  }

  const hasEtymologyForSense = (senseId) => {
    return etymologies.some(e =>
      e.entity_type === 'word_translation' && e.entity_id === senseId
    )
  }

  const getImagesForSense = (senseId) => {
    return imageMap[`word_translation:${senseId}`] || []
  }

  // Grouped display
  if (groups && groups.length > 0) {
    let senseIndex = 1
    return (
      <div className="p-4 space-y-4">
        {groups.map((group) => {
          const ipa = group.ipa_pronunciation || group.phonetic_pronunciation || group.accent || ''
          const audioDesc = group.primary_audio_descriptor || group.primary_audio || null

          return (
            <div key={group.key} className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
              <div className={`w-1.5 flex-shrink-0 ${barClass}`} />
              <div className="flex-1 min-w-0">
              {/* Group header: IPA + audio */}
              {(ipa || audioDesc) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  {ipa && <span className="text-sm font-mono text-gray-600 italic">[{ipa}]</span>}
                  {audioDesc && (
                    <AudioButton
                      wordId={word?.id}
                      italianText={word?.italian}
                      audioObjectKey={audioDesc?.object_key}
                      audioBucket={audioDesc?.bucket || audioDesc?.storage_bucket}
                      size="chip"
                      variant="inline-icon"
                    />
                  )}
                </div>
              )}
              <div className="px-3">
                {group.resolvedTranslations.map(t => {
                  const senseSentences = getSentencesForSense(t.id)
                  const hasEtymology = hasEtymologyForSense(t.id)
                  const senseImages = getImagesForSense(t.id)

                  return (
                    <div key={t.id}>
                      {/* Sense row */}
                      <div className="flex items-baseline gap-1">
                        {hasEtymology && (
                          <button
                            className="text-sm text-gray-400 hover:text-teal-600 transition-colors flex-shrink-0"
                            title="View etymology for this sense"
                            onClick={() => onNavigateTab?.('etymology')}
                          >
                            📜
                          </button>
                        )}
                        <div className="flex-1">
                          <WordSenseRow translation={t} index={senseIndex++} wordType={word?.word_type} />
                        </div>
                      </div>

                      {/* Sense images */}
                      {senseImages.length > 0 && (
                        <div className="ml-7 mt-2 mb-2 flex gap-2 flex-wrap">
                          {senseImages.map((asset, i) => (
                            <WordImage
                              key={asset.id || i}
                              mediaAsset={asset}
                              alt={`${word?.italian} — ${t.translation || ''}`}
                              className="w-full max-w-xs max-h-48"
                            />
                          ))}
                        </div>
                      )}

                      {/* All sentences for this sense */}
                      {senseSentences.length > 0 && (
                        <div className="ml-7 pb-2">
                          <SentenceList
                            sentences={senseSentences}
                            compact={false}
                            linkContext={{ entityType: 'word_translation', entityId: t.id }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Flat fallback
  let senseIndex = 1
  const sortedTranslations = translations
    .slice()
    .sort((a, b) => (a.display_priority || 999) - (b.display_priority || 999))

  return (
    <div className="p-4">
      <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
        <div className={`w-1.5 flex-shrink-0 ${barClass}`} />
        <div className="flex-1 min-w-0">
        <div className="px-3">
          {sortedTranslations.map(t => {
            const senseSentences = getSentencesForSense(t.id)
            const hasEtymology = hasEtymologyForSense(t.id)
            const senseImages = getImagesForSense(t.id)

            return (
              <div key={t.id}>
                <div className="flex items-baseline gap-1">
                  {hasEtymology && (
                    <button
                      className="text-sm text-gray-400 hover:text-teal-600 transition-colors"
                      title="View etymology for this sense"
                      onClick={() => onNavigateTab?.('etymology')}
                    >
                      📜
                    </button>
                  )}
                  <div className="flex-1">
                    <WordSenseRow translation={t} index={senseIndex++} wordType={word?.word_type} />
                  </div>
                </div>

                {senseImages.length > 0 && (
                  <div className="ml-7 mt-2 mb-2 flex gap-2 flex-wrap">
                    {senseImages.map((asset, i) => (
                      <WordImage
                        key={asset.id || i}
                        mediaAsset={asset}
                        alt={`${word?.italian} — ${t.translation || ''}`}
                        className="w-full max-w-xs max-h-48"
                      />
                    ))}
                  </div>
                )}

                {senseSentences.length > 0 && (
                  <div className="ml-7 pb-2">
                    <SentenceList
                      sentences={senseSentences}
                      compact={false}
                      linkContext={{ entityType: 'word_translation', entityId: t.id }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}
