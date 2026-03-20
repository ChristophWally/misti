'use client'

// components/WordViewer/tabs/OverviewTab.js

import AudioButton from '../../AudioButton'
import WordSenseRow from '../WordSenseRow'

export default function OverviewTab({ word, fullBundle, isLoading }) {
  const pronunciationGroups = Array.isArray(word?.pronunciation_groups)
    ? word.pronunciation_groups
    : []

  // Fall back to list-level translations when bundle not yet loaded
  const allTranslations = fullBundle?.translations ||
    pronunciationGroups.flatMap(g => Array.isArray(g.translations) ? g.translations : [])

  if (pronunciationGroups.length === 0 && allTranslations.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">No pronunciation or translation data available.</div>
    )
  }

  // If pronunciation groups exist, render grouped
  if (pronunciationGroups.length > 0) {
    let senseIndex = 1
    return (
      <div className="p-4 space-y-4">
        {pronunciationGroups.map((group, gi) => {
          const groupIpa = group.ipa_pronunciation || group.phonetic_pronunciation || group.accent || ''
          const groupAudio = group.primary_audio_descriptor || null
          const groupTranslations = Array.isArray(group.translations) ? group.translations : []

          return (
            <div key={gi} className="rounded-lg border border-gray-100 overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                {groupIpa && (
                  <span className="text-sm font-mono text-gray-600">[{groupIpa}]</span>
                )}
                {groupAudio && (
                  <AudioButton audioDescriptor={groupAudio} size="sm" wordType={word?.word_type} />
                )}
              </div>

              {/* Senses for this group */}
              <div className="px-3">
                {groupTranslations.map((t, ti) => (
                  <WordSenseRow key={t.id || ti} translation={t} index={senseIndex++} />
                ))}
                {groupTranslations.length === 0 && (
                  <div className="py-2 text-xs text-gray-400">No translations for this pronunciation group.</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Flat translation list fallback
  return (
    <div className="p-4">
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-3">
          {allTranslations.map((t, ti) => (
            <WordSenseRow key={t.id || ti} translation={t} index={ti + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
