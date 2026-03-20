'use client'

// components/WordViewer/tabs/EtymologyTab.js

export default function EtymologyTab({ word, fullBundle, isLoading }) {
  const etymologyGroups = fullBundle?.word?.etymology_groups ||
    (Array.isArray(word?.etymology_groups) ? word?.etymology_groups : [])

  const relationships = fullBundle?.word?.relationships ||
    (Array.isArray(word?.relationships) ? word?.relationships : [])

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

  return (
    <div className="p-4 space-y-4">
      {/* Etymology groups */}
      {etymologyGroups.map((group, i) => (
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
