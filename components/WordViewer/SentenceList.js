'use client'

// components/WordViewer/SentenceList.js
// Reusable sentence list controller with card/table layout orchestration.

import { useState } from 'react'
import SentenceCard from './SentenceCard'
import SentenceTable from './SentenceTable'

function getSentenceStateKey(sentence, index) {
  if (sentence?.id) return `id:${sentence.id}`
  if (sentence?.external_id) return `external:${sentence.external_id}`
  return `index:${index}`
}

function normalizeNoteText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getLinkedUsageNote(sentence, linkContext = null) {
  const links = Array.isArray(sentence?.links) ? sentence.links : []
  if (links.length === 0) return ''

  const contexts = Array.isArray(linkContext)
    ? linkContext.filter(Boolean)
    : linkContext
      ? [linkContext]
      : []

  const matchesContext = (link, context) => {
    if (!context) return true
    const typeMatches = !context.entityType || link?.entity_type === context.entityType
    const idMatches = !context.entityId || link?.entity_id === context.entityId
    return typeMatches && idMatches
  }

  if (contexts.length > 0) {
    for (const context of contexts) {
      const match = links.find((link) => matchesContext(link, context) && normalizeNoteText(link?.usage_note))
      if (match) return normalizeNoteText(match.usage_note)
    }
  }

  const fallback = links.find((link) => normalizeNoteText(link?.usage_note))
  return fallback ? normalizeNoteText(fallback.usage_note) : ''
}

export default function SentenceList({
  sentences = [],
  compact = false,
  layoutMode = 'auto',
  tableMinRows = 2,
  tableShowHeaders = false,
  linkContext = null,
  resolveNotes,
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
    setExpandedSentences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const effectiveShowSource = typeof showSource === 'boolean' ? showSource : !compact
  const effectiveShowNotes = typeof showNotes === 'boolean' ? showNotes : !compact
  const visibleSentences = compact ? sentences.slice(0, maxCompactItems) : sentences

  const preparedSentences = visibleSentences.map((sentence) => {
    const customNotes = typeof resolveNotes === 'function' ? normalizeNoteText(resolveNotes(sentence)) : ''
    const displayNotes =
      customNotes ||
      normalizeNoteText(sentence?.notes) ||
      getLinkedUsageNote(sentence, linkContext)

    return {
      ...sentence,
      __display_notes: displayNotes,
    }
  })

  const renderCards = (variant, extraClassName = '') => (
    <div className={`${variant === 'compact' ? 'mt-1.5 space-y-1.5' : 'space-y-2'} ${className} ${extraClassName}`.trim()}>
      {preparedSentences.map((sentence, i) => {
        const stateKey = getSentenceStateKey(sentence, i)
        const shouldCollapse = (sentence.__display_notes || '').length > 150
        const isExpanded = !!expandedSentences[stateKey]

        return (
          <SentenceCard
            key={`${stateKey}:${i}`}
            sentence={sentence}
            variant={variant}
            showSource={effectiveShowSource}
            showNotes={effectiveShowNotes}
            notesText={sentence.__display_notes || ''}
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
      {variant === 'compact' && sentences.length > maxCompactItems && (
        <div className="pl-1 text-[11px] italic text-slate-500">
          +{sentences.length - maxCompactItems} more example{sentences.length - maxCompactItems === 1 ? '' : 's'}
        </div>
      )}
    </div>
  )

  // Compact mode stays card-based.
  if (compact) {
    return renderCards('compact')
  }

  const normalizedLayoutMode = ['auto', 'cards', 'table'].includes(layoutMode) ? layoutMode : 'auto'
  const qualifiesForTable = preparedSentences.length >= tableMinRows

  if (normalizedLayoutMode === 'cards' || !qualifiesForTable) {
    return renderCards('full')
  }

  if (normalizedLayoutMode === 'table') {
    return (
      <SentenceTable
        sentences={preparedSentences}
        showSource={effectiveShowSource}
        showNotes={effectiveShowNotes}
        showHeaders={tableShowHeaders}
        className={className}
      />
    )
  }

  // Auto: cards on mobile, table on desktop for multi-row groups.
  return (
    <>
      <div className="md:hidden">{renderCards('full')}</div>
      <div className="hidden md:block">
        <SentenceTable
          sentences={preparedSentences}
          showSource={effectiveShowSource}
          showNotes={effectiveShowNotes}
          showHeaders={tableShowHeaders}
          className={className}
        />
      </div>
    </>
  )
}
