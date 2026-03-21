'use client'

// components/WordViewer/tabs/EtymologyTab.js
// Etymologies shown as self-contained cards; each card lists the senses it covers.
// Related words as interactive pills at the bottom.

export default function EtymologyTab({ word, fullBundle, isLoading }) {
  const etymologyGroups = Array.isArray(fullBundle?.etymologies)
    ? fullBundle.etymologies
    : []

  const translations = Array.isArray(fullBundle?.translations) ? fullBundle.translations : []

  const relationships = Array.isArray(fullBundle?.relationships)
    ? fullBundle.relationships
    : Array.isArray(fullBundle?.word?.relationships)
      ? fullBundle.word.relationships
      : Array.isArray(word?.relationships)
        ? word.relationships
        : []

  const hasContent = etymologyGroups.length > 0 || relationships.length > 0

  if (isLoading && !fullBundle) {
    return <div className="p-4 text-sm text-gray-500">Loading etymology...</div>
  }

  if (!hasContent) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No etymology data available for this word.
      </div>
    )
  }

  // Build translation label map
  const translationLabel = (senseId) => {
    const t = translations.find(t => t.id === senseId)
    return t?.translation || null
  }

  // Each etymology entry becomes a card.
  // Below the etymology text, list which senses it applies to (if sense-specific).
  // Word-level etymologies (no entity_id or entity_type !== 'word_translation') show without sense list.
  const wordLevelEtymologies = etymologyGroups.filter(
    e => !e.entity_id || e.entity_type !== 'word_translation'
  )

  // Sense-specific: one entry per (etymology_text, sense).
  // Group multiple senses under the same etymology text if text is identical.
  const senseEtymologies = etymologyGroups.filter(
    e => e.entity_type === 'word_translation' && e.entity_id
  )

  // Deduplicate by etymology text: group entries with matching text together
  const etymologyTextKey = (e) => e.etymology_text_raw || e.etymology_text || ''
  const senseEtymologyGroups = []
  const seenTexts = new Map() // text → index in senseEtymologyGroups

  for (const e of senseEtymologies) {
    const key = etymologyTextKey(e)
    if (seenTexts.has(key)) {
      senseEtymologyGroups[seenTexts.get(key)].senseIds.push(e.entity_id)
    } else {
      seenTexts.set(key, senseEtymologyGroups.length)
      senseEtymologyGroups.push({ ...e, senseIds: [e.entity_id] })
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Word-level etymologies (no sense association) */}
      {wordLevelEtymologies.map((group, i) => (
        <div key={i} className="rounded-xl shadow-sm border border-gray-200 bg-stone-50 p-4">
          {group.etymology_text_raw ? (
            <div
              className="text-sm text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: group.etymology_text_raw }}
            />
          ) : group.etymology_text ? (
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: group.etymology_text }}
            />
          ) : (
            <p className="text-sm text-gray-400">No etymology text.</p>
          )}
          {group.source && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-400">
              Source: {group.source}
            </div>
          )}
        </div>
      ))}

      {/* Sense-grouped etymologies: etymology card → list of covered senses */}
      {senseEtymologyGroups.map((group, i) => {
        const senseLabels = group.senseIds
          .map(id => translationLabel(id))
          .filter(Boolean)

        return (
          <div key={i} className="rounded-xl shadow-sm border border-gray-200 bg-stone-50 p-4">
            {/* Etymology text */}
            {group.etymology_text_raw ? (
              <div
                className="text-sm text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: group.etymology_text_raw }}
              />
            ) : group.etymology_text ? (
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: group.etymology_text }}
              />
            ) : (
              <p className="text-sm text-gray-400">No etymology text.</p>
            )}

            {/* Sense pills: which senses this etymology covers */}
            {senseLabels.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-1.5">Applies to:</p>
                <div className="flex flex-wrap gap-1.5">
                  {senseLabels.map((label, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {group.source && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-400">
                Source: {group.source}
              </div>
            )}
          </div>
        )
      })}

      {/* Related words */}
      {relationships.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Related words
          </h3>
          <div className="flex flex-wrap gap-2">
            {relationships.map((rel, i) => {
              const label = rel.target_italian || rel.source_italian || rel.related_lemma || ''
              const relType = rel.relationship_type || rel.type || ''
              return (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-default"
                  title={relType ? `Relationship: ${relType}` : undefined}
                >
                  {label}
                  {relType && <span className="ml-1 text-gray-400">({relType})</span>}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
