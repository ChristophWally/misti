'use client'

// components/WordViewer/WordSenseRow.js
// A single numbered sense: translation + ALL tag chips + collapsible usage notes.
// Uses processRpcTagsForDisplay for comprehensive tag display.

import { useState } from 'react'
import { processRpcTagsForDisplay } from '../../lib/tag-processing'

/** Extract the first paragraph from HTML. Returns { first, hasMore }. */
function extractFirstParagraph(html) {
  if (!html) return { first: '', hasMore: false }
  const closeIdx = html.indexOf('</p>')
  if (closeIdx === -1) {
    const hasMore = html.length > 300
    return { first: hasMore ? html.slice(0, 300) : html, hasMore }
  }
  const first = html.slice(0, closeIdx + 4)
  const rest = html.slice(closeIdx + 4).trim()
  return { first, hasMore: rest.length > 0 }
}

export default function WordSenseRow({ translation, index, wordType = '' }) {
  const [expanded, setExpanded] = useState(false)

  const usageNotes = translation?.usage_notes || translation?.usageNotes || ''
  const { first: firstParagraph, hasMore } = extractFirstParagraph(usageNotes)

  // Accept both rpc_core (list-level) and core_tags (bundle-hydrated)
  const coreTags = Array.isArray(translation?.rpc_core) ? translation.rpc_core
    : Array.isArray(translation?.core_tags) ? translation.core_tags
    : []

  const optionalTags = Array.isArray(translation?.optional_tags) ? translation.optional_tags : []

  // Use the full tag processing pipeline for all tags
  const { essential, detailed } = processRpcTagsForDisplay(coreTags, wordType.toUpperCase(), optionalTags)
  const allChips = [...essential, ...detailed]

  // Filter out tags already shown in the header (gender, POS, irregular, CEFR, frequency)
  // Keep only sense-relevant tags here
  const senseChips = allChips.filter(chip => {
    const tag = chip.tag || ''
    // Skip word-level identity tags (shown in header)
    if (tag === '♂' || tag === '♀' || tag === '⚥') return false
    if (tag.includes('IRREG')) return false
    return true
  })

  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-mono flex-shrink-0 w-5 text-right">{index}.</span>
        <span className="text-sm font-medium text-gray-900 flex-1">{translation?.translation}</span>
        {senseChips.map((chip, i) => (
          <span
            key={i}
            className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${chip.class}`}
            title={chip.description}
          >
            {chip.display}
          </span>
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
