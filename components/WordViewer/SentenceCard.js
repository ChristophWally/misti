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
  const showCollapsedNotes = shouldCollapseNotes && !isNotesExpanded
  const sourceNode = showSource ? renderSource(sentence) : null

  const slotContext = { sentence, variant, isCompact }
  const headerNode = typeof renderHeader === 'function' ? renderHeader(slotContext) : null
  const metaNode = showMeta && typeof renderMeta === 'function' ? renderMeta(slotContext) : null
  const footerNode = typeof renderFooter === 'function' ? renderFooter(slotContext) : null

  return (
    <div
      className={`
        rounded-lg border border-slate-200 border-l-4 border-l-teal-500 bg-slate-50 shadow-sm
        ${isCompact ? 'px-2.5 py-1.5 space-y-0.5' : 'px-3 py-2 space-y-1'}
        ${className}
      `}
    >
      {headerNode && <div>{headerNode}</div>}

      {sentence.translation_en ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-0">
          <div className={`${isCompact ? 'text-sm' : 'text-[15px]'} font-medium leading-tight text-teal-700`}>
            {renderItalianSentence(sentence)}
          </div>
          <div className={`${isCompact ? 'text-sm' : 'text-[15px]'} leading-tight text-slate-700`}>
            {sentence.translation_en}
          </div>
        </div>
      ) : (
        <div className={`${isCompact ? 'text-sm' : 'text-[15px]'} font-medium leading-tight text-teal-700`}>
          {renderItalianSentence(sentence)}
        </div>
      )}

      {sourceNode && <div className="text-[11px] leading-snug italic text-slate-500">{sourceNode}</div>}

      {showNotes && sentence.notes && (
        <div className={`sense-usage-notes-collapsible ${isCompact ? 'mt-0.5' : 'mt-1'}`}>
          <div
            className={`text-xs leading-snug text-slate-600 ${showCollapsedNotes ? 'line-clamp-2' : ''}`}
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
