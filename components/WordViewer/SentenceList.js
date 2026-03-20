'use client'

// components/WordViewer/SentenceList.js
// Reusable component to render a list of example sentences with translations and attribution.
// Props: sentences (array), compact (boolean for inline display)

import { useState } from 'react'

export default function SentenceList({ sentences = [], compact = false }) {
  const [expandedSentences, setExpandedSentences] = useState({})

  if (!Array.isArray(sentences) || sentences.length === 0) {
    return null
  }

  const toggleExpanded = (id) => {
    setExpandedSentences(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (compact) {
    // Compact mode: minimal display suitable for inline use in sense/form cards
    return (
      <div className="mt-2 space-y-1.5">
        {sentences.slice(0, 2).map((sentence, i) => (
          <div key={i} className="text-xs text-gray-600 italic">
            <span className="font-medium text-gray-700">
              {sentence.sentence_text_html ? (
                <span dangerouslySetInnerHTML={{ __html: sentence.sentence_text_html }} />
              ) : (
                sentence.sentence_text
              )}
            </span>
            {sentence.translation_en && (
              <div className="text-gray-500 mt-0.5">
                {sentence.translation_en}
              </div>
            )}
          </div>
        ))}
        {sentences.length > 2 && (
          <div className="text-xs text-gray-400 italic">
            +{sentences.length - 2} more example{sentences.length - 2 === 1 ? '' : 's'}
          </div>
        )}
      </div>
    )
  }

  // Full mode: complete display with source attribution
  return (
    <div className="space-y-3">
      {sentences.map((sentence, i) => {
        const isExpanded = expandedSentences[i]
        const shouldCollapse = (sentence.notes || '').length > 150

        return (
          <div key={i} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            {/* Italian sentence */}
            <div className="text-sm font-medium text-gray-900 mb-1.5">
              {sentence.sentence_text_html ? (
                <span dangerouslySetInnerHTML={{ __html: sentence.sentence_text_html }} />
              ) : (
                sentence.sentence_text
              )}
            </div>

            {/* English translation */}
            {sentence.translation_en && (
              <div className="text-sm text-gray-700 mb-1.5">
                {sentence.translation_en}
              </div>
            )}

            {/* Source attribution */}
            {(sentence.source_type || sentence.source_title) && (
              <div className="text-xs text-gray-500 mb-1.5">
                {sentence.source_citation ? (
                  <span>— {sentence.source_citation}</span>
                ) : (
                  <>
                    {sentence.source_type && <span className="mr-1">({sentence.source_type})</span>}
                    {sentence.source_title && <span className="font-medium">{sentence.source_title}</span>}
                    {sentence.source_author && <span className="mr-1">by {sentence.source_author}</span>}
                  </>
                )}
              </div>
            )}

            {/* Optional notes */}
            {sentence.notes && (
              <div className="mt-1.5">
                <div
                  className={`text-xs text-gray-600 leading-relaxed ${
                    shouldCollapse && !isExpanded ? 'line-clamp-2' : ''
                  }`}
                >
                  {sentence.notes}
                </div>
                {shouldCollapse && (
                  <button
                    onClick={() => toggleExpanded(i)}
                    className="text-xs text-teal-600 hover:text-teal-800 mt-1 underline"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
