'use client'

// components/WordViewer/SentenceCard.js
// Shared sentence card for WordViewer: consistent UI + optional extension slots.

function renderItalianSentence(sentence) {
  if (sentence?.sentence_text_html) {
    return <span dangerouslySetInnerHTML={{ __html: sentence.sentence_text_html }} />
  }
  return sentence?.sentence_text || ''
}

function renderSource(sentence) {
  if (!sentence) return null
  if (sentence.source_citation) {
    return <span>&mdash; {sentence.source_citation}</span>
  }

  const parts = []
  if (sentence.source_type) parts.push(`(${sentence.source_type})`)
  if (sentence.source_title) parts.push(sentence.source_title)
  if (sentence.source_author) parts.push(`by ${sentence.source_author}`)

  if (parts.length === 0) return null
  return <span>{parts.join(' ')}</span>
}

export default function SentenceCard({
  sentence,
  variant = 'full',
  showSource = true,
  showNotes = true,
  showMeta = true,
  isNotesExpanded = false,
  shouldCollapseNotes = false,
  onToggleNotes,
  className = '',
  renderHeader,
  renderMeta,
  renderFooter,
}) {
  if (!sentence) return null

  const isCompact = variant === 'compact'
  const hasEnglish = !!sentence.translation_en
  const showCollapsedNotes = shouldCollapseNotes && !isNotesExpanded
  const sourceNode = showSource ? renderSource(sentence) : null

  const slotContext = { sentence, variant, isCompact }
  const headerNode = typeof renderHeader === 'function' ? renderHeader(slotContext) : null
  const metaNode = showMeta && typeof renderMeta === 'function' ? renderMeta(slotContext) : null
  const footerNode = typeof renderFooter === 'function' ? renderFooter(slotContext) : null

  return (
    <div
      className={`
        rounded-lg border border-teal-100 bg-white shadow-sm
        ${isCompact ? 'p-2 space-y-1.5' : 'p-2.5 space-y-2'}
        ${className}
      `}
    >
      {headerNode && <div>{headerNode}</div>}

      <div className={`grid gap-2 ${hasEnglish ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        <div className={`rounded-md border border-teal-200 bg-teal-50 ${isCompact ? 'p-2' : 'p-2.5'}`}>
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium leading-snug text-teal-800`}>
            {renderItalianSentence(sentence)}
          </div>
        </div>

        {hasEnglish && (
          <div className={`rounded-md border border-slate-200 bg-slate-50 ${isCompact ? 'p-2' : 'p-2.5'}`}>
            <div className={`${isCompact ? 'text-xs' : 'text-sm'} leading-snug text-slate-700`}>
              {sentence.translation_en}
            </div>
          </div>
        )}
      </div>

      {sourceNode && (
        <div className="text-[11px] leading-snug text-slate-500">
          {sourceNode}
        </div>
      )}

      {showNotes && sentence.notes && (
        <div className={`sense-usage-notes-collapsible ${isCompact ? 'mt-1' : 'mt-1.5'}`}>
          <div
            className={`text-xs leading-relaxed text-slate-600 ${showCollapsedNotes ? 'line-clamp-2' : ''}`}
          >
            {sentence.notes}
          </div>
          {shouldCollapseNotes && (
            <button
              onClick={onToggleNotes}
              className="mt-1 text-xs text-teal-600 underline hover:text-teal-800"
            >
              {isNotesExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {metaNode && <div>{metaNode}</div>}
      {footerNode && <div>{footerNode}</div>}
    </div>
  )
}
