'use client'

// components/WordViewer/WordSenseRow.js
// A single numbered sense: translation + chips + collapsible usage notes

import { useState } from 'react'

export default function WordSenseRow({ translation, index }) {
  const [expanded, setExpanded] = useState(false)

  const usageNotes = translation?.usage_notes || ''
  const shouldCollapse = usageNotes.length > 200

  const chips = []
  const coreTags = Array.isArray(translation?.rpc_core) ? translation.rpc_core :
                   (Array.isArray(translation?.core_tags) ? translation.core_tags : [])

  // Register chip
  const registerTag = coreTags.find(t => {
    const sid = t?.attribute_stable_id || ''
    return sid === 'metaattr010' || sid === 'metaattr_register'
  })
  if (registerTag && registerTag.value_label !== 'neutral') {
    chips.push({ label: registerTag.value_label, cls: 'bg-gray-200 text-gray-700' })
  }

  // Transitivity chip
  const transitivityTag = coreTags.find(t => {
    const sid = t?.attribute_stable_id || ''
    return sid === 'metaattr020' || sid === 'metaattr_transitivity'
  })
  if (transitivityTag) {
    const tMap = { transitive: 'tr.', intransitive: 'intr.', ambitransitive: 'ambitr.' }
    const label = tMap[String(transitivityTag.value_label || '').toLowerCase()]
    if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700' })
  }

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-mono flex-shrink-0">{index}.</span>
        <span className="text-sm font-medium text-gray-900">{translation?.translation}</span>
        {chips.map((c, i) => (
          <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${c.cls}`}>{c.label}</span>
        ))}
      </div>

      {usageNotes && (
        <div className="mt-1 ml-5 sense-usage-notes-collapsible">
          <div
            className={`text-xs text-gray-600 ${shouldCollapse && !expanded ? 'line-clamp-2' : ''}`}
            dangerouslySetInnerHTML={{ __html: usageNotes }}
          />
          {shouldCollapse && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-teal-600 hover:text-teal-800 mt-0.5"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
