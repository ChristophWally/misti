'use client'

// components/WordViewer/WordSenseRow.js
// A single numbered sense: translation + chips + collapsible usage notes.
// Usage notes truncated at end of first paragraph (first </p>), expandable.

import { useState } from 'react'

/** Extract the first paragraph from HTML. Returns { first, hasMore }. */
function extractFirstParagraph(html) {
  if (!html) return { first: '', hasMore: false }
  const closeIdx = html.indexOf('</p>')
  if (closeIdx === -1) {
    // No paragraph tags — treat whole string as first content
    const hasMore = html.length > 300
    return { first: hasMore ? html.slice(0, 300) : html, hasMore }
  }
  const first = html.slice(0, closeIdx + 4) // include </p>
  const rest = html.slice(closeIdx + 4).trim()
  return { first, hasMore: rest.length > 0 }
}

export default function WordSenseRow({ translation, index }) {
  const [expanded, setExpanded] = useState(false)

  const usageNotes = translation?.usage_notes || translation?.usageNotes || ''
  const { first: firstParagraph, hasMore } = extractFirstParagraph(usageNotes)

  // Accept both rpc_core (list-level) and core_tags (bundle-hydrated)
  const coreTags = Array.isArray(translation?.rpc_core) ? translation.rpc_core
    : Array.isArray(translation?.core_tags) ? translation.core_tags
    : []

  // Learner-friendly tooltip descriptions for tag chips
  const CHIP_TIPS = {
    'tr.': 'Transitive: takes a direct object',
    'intr.': 'Intransitive: no direct object',
    'ambitr.': 'Can be used with or without a direct object',
    'av.': 'Takes auxiliary "avere" in compound tenses',
    'ess.': 'Takes auxiliary "essere" in compound tenses',
    'refl.': 'Reflexive verb: used with si, mi, ti, ci, vi',
    'impers.': 'Impersonal: used only in third person',
    'modal': 'Modal verb: expresses ability, obligation, or possibility',
    'copular': 'Copular verb: links subject to complement',
    'causative': 'Causative verb: causes an action to happen',
    'support': 'Support verb: forms a fixed expression with a noun',
  }

  const chips = []

  coreTags.forEach(tag => {
    const sid = tag?.attribute_stable_id || ''
    const val = String(tag?.value_label || '').toLowerCase()
    if (!val) return

    // Register (metaattr010) — skip neutral
    if (sid === 'metaattr010') {
      if (val !== 'neutral') chips.push({ label: val, cls: 'bg-gray-200 text-gray-700', tip: `Register: ${val}` })
    }
    // Transitivity (metaattr020)
    else if (sid === 'metaattr020') {
      const tMap = { transitive: 'tr.', intransitive: 'intr.', ambitransitive: 'ambitr.' }
      const label = tMap[val]
      if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700', tip: CHIP_TIPS[label] })
    }
    // Auxiliary verb (metaattr002)
    else if (sid === 'metaattr002') {
      const auxMap = { avere: 'av.', essere: 'ess.' }
      const label = auxMap[val]
      if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700', tip: CHIP_TIPS[label] })
    }
    // Reflexive (metaattr017 or metaattr021)
    else if (sid === 'metaattr017' || sid === 'metaattr021') {
      if (val === 'reflexive' || val.includes('reflexive')) {
        chips.push({ label: 'refl.', cls: 'bg-teal-100 text-teal-700', tip: CHIP_TIPS['refl.'] })
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
      if (label) chips.push({ label, cls: 'bg-teal-100 text-teal-700', tip: CHIP_TIPS[label] || label })
    }
    // Word restriction (metaattr022) — third-person-only, plural-only, etc.
    else if (sid === 'metaattr022') {
      const display = val.replace(/-/g, '\u2011')
      chips.push({ label: display, cls: 'bg-orange-100 text-orange-700', tip: `Restriction: ${val.replace(/-/g, ' ')}` })
    }
    // Government / preposition governed (metaattr015)
    else if (sid === 'metaattr015') {
      const prep = val.replace('governs-', '')
      chips.push({ label: `gov. ${prep}`, cls: 'bg-indigo-100 text-indigo-700', tip: `This sense governs the preposition "${prep}"` })
    }
  })

  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-mono flex-shrink-0 w-5 text-right">{index}.</span>
        <span className="text-sm font-medium text-gray-900 flex-1">{translation?.translation}</span>
        {chips.map((c, i) => (
          <span key={i} className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${c.cls}`} title={c.tip}>{c.label}</span>
        ))}
      </div>

      {firstParagraph && (
        <div className="mt-1 ml-7 sense-usage-notes-collapsible">
          <div
            className="text-xs text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: expanded ? usageNotes : firstParagraph }}
          />
          {hasMore && (
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
