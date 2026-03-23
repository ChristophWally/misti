'use client'

// components/WordViewer/SentenceList.js
// Reusable component to render a list of example sentences with translations and attribution.
// Props: sentences (array), compact (boolean for inline display)

import { useState } from 'react'
import SentenceCard from './SentenceCard'

function getSentenceStateKey(sentence, index) {
  if (sentence?.id) return `id:${sentence.id}`
  if (sentence?.external_id) return `external:${sentence.external_id}`
  return `index:${index}`
}

export default function SentenceList({
  sentences = [],
  compact = false,
  showSource,
  showNotes,
  showMeta = true,
  className = '',
  cardClassName = '',
  renderHeader,
  renderMeta,
  renderFooter,
  maxCompactItems = 2,
}) {
  const [expandedSentences, setExpandedSentences] = useState({})

  if (!Array.isArray(sentences) || sentences.length === 0) {
    return null
  }

  const toggleExpanded = (key) => {
    setExpandedSentences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const effectiveShowSource = typeof showSource === 'boolean' ? showSource : !compact
  const effectiveShowNotes = typeof showNotes === 'boolean' ? showNotes : !compact
  const visibleSentences = compact ? sentences.slice(0, maxCompactItems) : sentences

  if (compact) {
    // Compact mode: minimal display suitable for inline use in sense/form cards
    return (
      <div className={`mt-1.5 space-y-1.5 ${className}`}>
        {visibleSentences.map((sentence, i) => {
          const stateKey = getSentenceStateKey(sentence, i)
          const shouldCollapse = (sentence.notes || '').length > 150
          const isExpanded = !!expandedSentences[stateKey]

          return (
            <SentenceCard
              key={`${stateKey}:${i}`}
              sentence={sentence}
              variant="compact"
              showSource={effectiveShowSource}
              showNotes={effectiveShowNotes}
              showMeta={showMeta}
              shouldCollapseNotes={shouldCollapse}
              isNotesExpanded={isExpanded}
              onToggleNotes={() => toggleExpanded(stateKey)}
              className={cardClassName}
              renderHeader={renderHeader}
              renderMeta={renderMeta}
              renderFooter={renderFooter}
            />
          )
        })}
        {sentences.length > maxCompactItems && (
          <div className="pl-1 text-[11px] italic text-slate-500">
            +{sentences.length - maxCompactItems} more example{sentences.length - maxCompactItems === 1 ? '' : 's'}
          </div>
        )}
      </div>
    )
  }

  // Full mode: complete display with source attribution
  return (
    <div className={`space-y-2 ${className}`}>
      {visibleSentences.map((sentence, i) => {
        const stateKey = getSentenceStateKey(sentence, i)
        const shouldCollapse = (sentence.notes || '').length > 150
        const isExpanded = !!expandedSentences[stateKey]

        return (
          <SentenceCard
            key={`${stateKey}:${i}`}
            sentence={sentence}
            variant="full"
            showSource={effectiveShowSource}
            showNotes={effectiveShowNotes}
            showMeta={showMeta}
            shouldCollapseNotes={shouldCollapse}
            isNotesExpanded={isExpanded}
            onToggleNotes={() => toggleExpanded(stateKey)}
            className={cardClassName}
            renderHeader={renderHeader}
            renderMeta={renderMeta}
            renderFooter={renderFooter}
          />
        )
      })}
    </div>
  )
}
