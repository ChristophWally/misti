'use client'

// components/WordViewer/WordSenseRow.js
// A single numbered sense: translation + chips + collapsible usage notes.
// Handles both list-level data (rpc_core, usageNotes) and hydrated bundle data (core_tags, usage_notes).

import { useState } from 'react'

export default function WordSenseRow({ translation, index }) {
  const [expanded, setExpanded] = useState(false)

  // Field names differ between list-level word_translations and hydrated bundle translations
  const usageNotes = translation?.usage_notes || translation?.usageNotes || ''
  const shouldCollapse = usageNotes.length > 200

  // Accept both rpc_core (list-level) and core_tags (bundle-hydrated)
  const coreTags = Array.isArray(translation?.rpc_core) ? translation.rpc_core
    : Array.isArray(translation?.core_tags) ? translation.core_tags
    : []

  const chips = []

  coreTags.forEach(tag => {
    const sid = tag?.attribute_stable_id || ''
    const val = String(tag?.value_label || '').toLowerCase()
    if (!val) return

    // Register (metaattr010) — skip neutral
    if (sid === 'metaattr010') {
      if (val !== 'neutral') chips.push({ label: val, cls: 'bg-gray-200 text-gray-700' })
    }
    // Transitivity (metaattr020)
    else if (sid === 'metaattr020') {
      const tMap = { transitive: 'tr.', intransitive: 'intr.', ambitransitive: 'ambitr.' }
      const label = tMap[val]
      if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700' })
    }
    // Auxiliary verb (metaattr002)
    else if (sid === 'metaattr002') {
      const auxMap = { avere: 'av.', essere: 'ess.' }
      const label = auxMap[val]
      if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700' })
    }
    // Reflexive (metaattr017 or metaattr021)
    else if (sid === 'metaattr017' || sid === 'metaattr021') {
      if (val === 'reflexive' || val.includes('reflexive')) {
        chips.push({ label: 'refl.', cls: 'bg-teal-100 text-teal-700' })
      }
    }
    // Verb type (metaattr018) — impersonal, modal, etc.
    else if (sid === 'metaattr018') {
      const vtMap = {
        'impersonal-verb': 'impers.',
        'modal-verb': 'modal',
        'copular-verb': 'copular',
        'causative-verb': 'causative',
        'support-verb': 'support',
      }
      const label = vtMap[val] || val.replace(/-verb$/, '')
      if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700' })
    }
    // Word restriction (metaattr022) — third-person-only, plural-only, etc.
    else if (sid === 'metaattr022') {
      chips.push({ label: val.replace(/-/g, '\u2011'), cls: 'bg-orange-100 text-orange-700' })
    }
    // Government / preposition governed (metaattr015)
    else if (sid === 'metaattr015') {
      chips.push({ label: `gov. ${val.replace('governs-', '')}`, cls: 'bg-indigo-100 text-indigo-700' })
    }
  })

  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-mono flex-shrink-0 w-5 text-right">{index}.</span>
        <span className="text-sm font-medium text-gray-900 flex-1">{translation?.translation}</span>
        {chips.map((c, i) => (
          <span key={i} className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${c.cls}`}>{c.label}</span>
        ))}
      </div>

      {usageNotes && (
        <div className="mt-1 ml-7 sense-usage-notes-collapsible">
          <div
            className={`text-xs text-gray-600 leading-relaxed ${shouldCollapse && !expanded ? 'line-clamp-2' : ''}`}
            dangerouslySetInnerHTML={{ __html: usageNotes }}
          />
          {shouldCollapse && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-teal-600 hover:text-teal-800 mt-0.5 underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
