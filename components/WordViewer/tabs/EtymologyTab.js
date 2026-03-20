'use client'

// components/WordViewer/tabs/EtymologyTab.js
// Renders etymologies grouped by sense. Word-level etymologies first, then sense-specific.

export default function EtymologyTab({ word, fullBundle, isLoading }) {
  // Etymology records live at fullBundle.etymologies (set by hydrateCanonicalWordBundle)
  const etymologyGroups = Array.isArray(fullBundle?.etymologies)
    ? fullBundle.etymologies
    : []

  // Translations to match sense IDs
  const translations = Array.isArray(fullBundle?.translations) ? fullBundle.translations : []

  // Relationships may be spread onto the bundle or nested on the word
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

  // Group etymologies by entity_id (sense) if they have etymology links with entity_id
  // Word-level etymologies have no entity_id, sense-specific ones do
  const wordLevelEtymologies = etymologyGroups.filter(e => !e.entity_id || e.entity_type !== 'word_translation')
  const senseGroupedEtymologies = {}

  etymologyGroups
    .filter(e => e.entity_type === 'word_translation' && e.entity_id)
    .forEach(e => {
      const senseId = e.entity_id
      if (!senseGroupedEtymologies[senseId]) {
        senseGroupedEtymologies[senseId] = []
      }
      senseGroupedEtymologies[senseId].push(e)
    })

  return (
    <div className="p-4 space-y-4">
      {/* Word-level etymologies */}
      {wordLevelEtymologies.map((group, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4">
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
        </div>
      ))}

      {/* Sense-grouped etymologies */}
      {Object.entries(senseGroupedEtymologies).map(([senseId, etymologies]) => {
        const translation = translations.find(t => t.id === senseId)
        const senseLabel = translation?.translation || `Sense ${senseId}`

        return (
          <div key={senseId}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {senseLabel}
            </h3>
            <div className="space-y-3">
              {etymologies.map((group, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
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
                </div>
              ))}
            </div>
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
            {relationships.map((rel, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700"
              >
                {rel.target_italian || rel.source_italian || rel.related_lemma || ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
