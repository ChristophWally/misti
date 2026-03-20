'use client'

// components/WordViewer/tabs/FormsTab.js
// Renders non-verb forms with their resolved FTGs (form translation groups),
// tags, usage notes and audio. For verbs, shows the conjugation panel.

import AudioButton from '../../AudioButton'
import ConjugationPanel from '../ConjugationPanel'
import { getWordTypeColors } from '../../../lib/word-type-utils'

// Render simple chips from a form's core_tags array
function FormTagChips({ coreTags = [] }) {
  const chips = []

  coreTags.forEach(tag => {
    const sid = tag?.attribute_stable_id || ''
    const val = String(tag?.value_label || '').toLowerCase()
    if (!val) return

    // Gender
    if (sid === 'metaattr003') {
      if (val === 'masculine') chips.push({ label: '♂', cls: 'bg-blue-100 text-blue-700' })
      else if (val === 'feminine') chips.push({ label: '♀', cls: 'bg-pink-100 text-pink-700' })
    }
    // Number
    else if (sid === 'metaattr008') {
      if (val === 'singolare' || val === 'singular') chips.push({ label: 'sing.', cls: 'bg-cyan-100 text-cyan-700' })
      else if (val === 'plurale' || val === 'plural') chips.push({ label: 'pl.', cls: 'bg-cyan-100 text-cyan-700' })
    }
    // Irregular
    else if (sid === 'metaattr005' && val === 'irregular') {
      chips.push({ label: '⚠ irreg.', cls: 'bg-red-100 text-red-700' })
    }
  })

  if (chips.length === 0) return null
  return (
    <span className="flex flex-wrap gap-1">
      {chips.map((c, i) => (
        <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${c.cls}`}>{c.label}</span>
      ))}
    </span>
  )
}

// A single FTG row: translation + linked sense + usage notes + usage label
function FtgRow({ ftg, index, wordType }) {
  const colors = getWordTypeColors(wordType)
  const usageNotes = ftg.usage_notes || ''
  const linkedSense = ftg.word_translation?.translation || null
  const usageLabel = ftg.usage_label || ftg.note || ''

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-mono w-5 text-right flex-shrink-0">{index}.</span>
        <span className="text-sm font-medium text-gray-900 flex-1">{ftg.translation}</span>
        {usageLabel && (
          <span className="text-xs text-gray-400 italic flex-shrink-0">{usageLabel}</span>
        )}
      </div>
      {linkedSense && (
        <div className="mt-0.5 ml-7">
          <span className="text-xs text-gray-400">linked sense: </span>
          <span className={`text-xs ${colors.text}`}>{linkedSense}</span>
        </div>
      )}
      {usageNotes && (
        <div
          className="mt-1 ml-7 text-xs text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: usageNotes }}
        />
      )}
    </div>
  )
}

// A single form card: Italian form text + tags + audio + all FTGs
function FormCard({ form, wordType }) {
  const colors = getWordTypeColors(wordType)
  const audioDesc = form.primary_audio || null
  const ipa = form.primary_ipa || null
  const coreTags = Array.isArray(form.core_tags) ? form.core_tags : []
  const ftgs = Array.isArray(form.resolved_translation_groups)
    ? form.resolved_translation_groups
    : []

  const formText = form.form_text || form.italian || ''

  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      {/* Form header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 ${colors.bg} border-b ${colors.border}`}>
        <span className={`text-base font-bold ${colors.text}`}>{formText}</span>
        <FormTagChips coreTags={coreTags} />
        {ipa && <span className="text-xs font-mono text-gray-500 ml-1">[{ipa}]</span>}
        {audioDesc && (
          <span className="ml-auto">
            <AudioButton audioDescriptor={audioDesc} size="sm" wordType={wordType} />
          </span>
        )}
      </div>

      {/* FTGs */}
      {ftgs.length > 0 ? (
        <div className="px-3">
          {ftgs.map((ftg, i) => (
            <FtgRow key={ftg.id || i} ftg={ftg} index={i + 1} wordType={wordType} />
          ))}
        </div>
      ) : (
        <div className="px-3 py-2 text-xs text-gray-400">No translations for this form.</div>
      )}
    </div>
  )
}

export default function FormsTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)

  if (isLoading && !fullBundle) {
    return <div className="p-4 text-sm text-gray-500">Loading forms...</div>
  }

  if (wordType === 'VERB') {
    return <ConjugationPanel word={word} resolvedBundle={fullBundle} />
  }

  // Non-verb forms: exclude conjugation rows (there should be none, but guard anyway)
  const forms = Array.isArray(fullBundle?.forms)
    ? fullBundle.forms.filter(f => f.form_type !== 'conjugation')
    : []

  if (forms.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        {fullBundle ? 'No inflected forms recorded for this word.' : 'Loading…'}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
        {forms.length} form{forms.length !== 1 ? 's' : ''}
      </p>
      {forms.map((form, i) => (
        <FormCard key={form.id || i} form={form} wordType={wordType} />
      ))}
    </div>
  )
}
