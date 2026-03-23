'use client'

// components/WordViewer/SentenceTable.js
// Compact shared table renderer for multi-sentence groups.

function renderItalianSentence(sentence) {
  if (sentence?.sentence_text_html) {
    return <span dangerouslySetInnerHTML={{ __html: sentence.sentence_text_html }} />
  }
  return sentence?.sentence_text || ''
}

function formatSourceText(sentence) {
  if (!sentence) return ''
  if (sentence.source_citation) return `— ${sentence.source_citation}`

  const parts = []
  if (sentence.source_type) parts.push(`(${sentence.source_type})`)
  if (sentence.source_title) parts.push(sentence.source_title)
  if (sentence.source_author) parts.push(`by ${sentence.source_author}`)

  return parts.join(' ')
}

export default function SentenceTable({
  sentences = [],
  showSource = true,
  showNotes = true,
  className = '',
}) {
  if (!Array.isArray(sentences) || sentences.length === 0) return null

  return (
    <div
      className={`
        rounded-lg border border-slate-200 border-l-4 border-l-teal-500 bg-slate-50 shadow-sm overflow-hidden
        ${className}
      `}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-100/80">
            <tr>
              <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Italian</th>
              <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">English</th>
              <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Source</th>
            </tr>
          </thead>
          <tbody>
            {sentences.map((sentence, index) => {
              const sourceText = showSource ? formatSourceText(sentence) : ''
              return (
                <tr key={sentence?.id || sentence?.external_id || index} className="border-t border-slate-200/80">
                  <td className="px-3 py-1.5 align-top text-[15px] font-medium leading-tight text-teal-700">
                    {renderItalianSentence(sentence)}
                  </td>
                  <td className="px-3 py-1.5 align-top text-[15px] leading-tight text-slate-700">
                    {sentence?.translation_en || '—'}
                  </td>
                  <td className="px-3 py-1.5 align-top">
                    {sourceText ? (
                      <div className="text-[11px] leading-snug italic text-slate-500">{sourceText}</div>
                    ) : (
                      <div className="text-[11px] leading-snug text-slate-400">&mdash;</div>
                    )}
                    {showNotes && sentence?.notes && (
                      <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-snug text-slate-500">
                        {sentence.notes}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
