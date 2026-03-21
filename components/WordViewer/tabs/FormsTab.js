'use client'

// components/WordViewer/tabs/FormsTab.js
// Two layout modes:
//   Form-centric: each form card lists its FTGs (nouns, adjectives with distinct form meanings)
//   FTG-centric:  each FTG card lists the forms it applies to (contracted prepositions, shared FTGs)
// Auto-detects based on whether any FTG links to 2+ forms.

import { useState } from 'react'
import AudioButton from '../../AudioButton'
import ConjugationPanel from '../ConjugationPanel'
import SentenceList from '../SentenceList'
import PronunciationDisplay from '../PronunciationDisplay'
import WordImage from '../WordImage'
import { getWordTypeColors } from '../../../lib/word-type-utils'

// ─── Helpers ──────────────────────────────────────────

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

function buildImageMap(mediaLinks = [], mediaAssets = []) {
  const assetsById = new Map(mediaAssets.map(a => [a.id, a]))
  const map = {}
  for (const link of mediaLinks) {
    const asset = assetsById.get(link.media_asset_id)
    if (!asset || asset.media_kind !== 'image') continue
    const key = `${link.entity_type}:${link.entity_id}`
    if (!map[key]) map[key] = []
    map[key].push({ ...asset, link_order: link.link_order ?? 999 })
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.link_order - b.link_order)
  }
  return map
}

/** Extract tag chips from a form's core_tags array. Returns array of { label, cls, tip }. */
function getFormTagChips(coreTags = []) {
  const chips = []
  coreTags.forEach(tag => {
    const sid = tag?.attribute_stable_id || ''
    const val = String(tag?.value_label || '').toLowerCase()
    if (!val) return
    if (sid === 'metaattr003') {
      if (val === 'masculine') chips.push({ label: '♂', cls: 'bg-blue-100 text-blue-700', tip: 'Masculine gender' })
      else if (val === 'feminine') chips.push({ label: '♀', cls: 'bg-pink-100 text-pink-700', tip: 'Feminine gender' })
    } else if (sid === 'metaattr008') {
      if (val === 'singolare' || val === 'singular') chips.push({ label: 'sing.', cls: 'bg-cyan-100 text-cyan-700', tip: 'Singular form' })
      else if (val === 'plurale' || val === 'plural') chips.push({ label: 'pl.', cls: 'bg-cyan-100 text-cyan-700', tip: 'Plural form' })
    } else if (sid === 'metaattr005' && val === 'irregular') {
      chips.push({ label: '⚠ irreg.', cls: 'bg-red-100 text-red-700', tip: 'Irregular form' })
    }
  })
  return chips
}

/** Render tag chips inline. */
function FormTagChips({ coreTags = [] }) {
  const chips = getFormTagChips(coreTags)
  if (chips.length === 0) return null
  return (
    <span className="inline-flex flex-wrap gap-0.5">
      {chips.map((c, i) => (
        <span key={i} className={`text-[10px] px-1 py-0 rounded ${c.cls}`} title={c.tip}>{c.label}</span>
      ))}
    </span>
  )
}

// ─── FTG-centric layout (shared FTGs across forms) ──────

/**
 * Build a deduplicated FTG map from all forms.
 * Returns { ftgMap: Map<ftgId, { ftg, formEntries }>, hasShared: boolean }
 */
function buildFtgMap(forms) {
  const ftgMap = new Map() // ftgId → { ftg, formEntries: [{ form, usageLabel }] }

  for (const form of forms) {
    const ftgs = Array.isArray(form.resolved_translation_groups) ? form.resolved_translation_groups : []
    for (const ftg of ftgs) {
      const ftgId = ftg.form_translation_group_id || ftg.id
      if (!ftgMap.has(ftgId)) {
        ftgMap.set(ftgId, { ftg, formEntries: [] })
      }
      ftgMap.get(ftgId).formEntries.push({
        form,
        usageLabel: ftg.usage_label || ftg.note || '',
        linkId: ftg.form_translation_group_link_id || ftg.id,
      })
    }
  }

  // Check if any FTG is shared across 2+ forms
  let hasShared = false
  for (const entry of ftgMap.values()) {
    if (entry.formEntries.length > 1) {
      hasShared = true
      break
    }
  }

  return { ftgMap, hasShared }
}

/** A form pill: form_text + tag chips + audio, used inside FTG-centric cards. */
function FormPill({ form, word, colors }) {
  const formText = form.form_text || form.italian || ''
  const coreTags = Array.isArray(form.core_tags) ? form.core_tags : []
  const tagChips = getFormTagChips(coreTags)
  const primaryAudio = form.primary_audio || null

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${colors.border} ${colors.bg} text-sm`}>
      <span className={`font-bold ${colors.text}`}>{formText}</span>
      {tagChips.map((c, i) => (
        <span key={i} className={`text-[10px] px-1 rounded ${c.cls}`} title={c.tip}>{c.label}</span>
      ))}
      {primaryAudio && (
        <AudioButton
          wordId={word?.id}
          italianText={formText}
          audioObjectKey={primaryAudio?.object_key}
          audioBucket={primaryAudio?.bucket || primaryAudio?.storage_bucket}
          size="sm"
          variant="inline-icon"
        />
      )}
    </span>
  )
}

/** FTG-centric card: one card per unique FTG, with form pills showing which forms it applies to. */
function SharedFtgCard({ ftgEntry, word, wordType, sentences, imageMap }) {
  const [expanded, setExpanded] = useState(false)
  const colors = getWordTypeColors(wordType)
  const { ftg, formEntries } = ftgEntry

  const usageNotesRaw = ftg.usage_notes || ''
  const { first: firstParagraph, hasMore } = extractFirstParagraph(usageNotesRaw)
  const linkedSense = ftg.word_translation?.translation || null
  const ftgId = ftg.form_translation_group_id || ftg.id

  // Sentences linked to this FTG (deduplicate across links)
  const seenSentenceIds = new Set()
  const ftgSentences = sentences.filter(s => {
    if (!Array.isArray(s.links)) return false
    const matches = s.links.some(link =>
      (link.entity_type === 'form_translation_group' && link.entity_id === ftgId) ||
      formEntries.some(fe =>
        link.entity_type === 'form_translation_group_link' && link.entity_id === fe.linkId
      )
    )
    if (matches && !seenSentenceIds.has(s.id)) {
      seenSentenceIds.add(s.id)
      return true
    }
    return false
  })

  const ftgImages = imageMap[`form_translation_group:${ftgId}`] || []

  // Group forms by usage_label for cleaner display
  const hasUsageLabels = formEntries.some(fe => fe.usageLabel)

  return (
    <div className={`rounded-xl shadow-sm border ${colors.border} overflow-hidden`}>
      {/* FTG header: translation + linked sense */}
      <div className={`px-3 py-2.5 ${colors.bg} border-b ${colors.border}`}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${colors.text}`}>{ftg.translation}</span>
          {linkedSense && (
            <>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs text-gray-500">{linkedSense}</span>
            </>
          )}
        </div>
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        {/* Form pills: which forms use this FTG */}
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1.5">Forms</p>
          {hasUsageLabels ? (
            // When usage labels exist, show each form with its label
            <div className="space-y-1.5">
              {formEntries.map((fe, i) => (
                <div key={i} className="flex items-center gap-2 flex-wrap">
                  <FormPill form={fe.form} word={word} colors={colors} />
                  {fe.usageLabel && (
                    <span className="text-xs text-gray-400 italic">{fe.usageLabel}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // No usage labels: compact row of form pills
            <div className="flex flex-wrap gap-1.5">
              {formEntries.map((fe, i) => (
                <FormPill key={i} form={fe.form} word={word} colors={colors} />
              ))}
            </div>
          )}
        </div>

        {/* Usage notes */}
        {firstParagraph && (
          <div>
            <div
              className="text-xs text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: expanded ? usageNotesRaw : firstParagraph }}
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

        {/* Images */}
        {ftgImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {ftgImages.map((asset, i) => (
              <WordImage key={asset.id || i} mediaAsset={asset} alt={ftg.translation || ''} className="w-full max-w-xs max-h-40" />
            ))}
          </div>
        )}

        {/* Sentences */}
        {ftgSentences.length > 0 && (
          <SentenceList sentences={ftgSentences} compact={false} />
        )}
      </div>
    </div>
  )
}

// ─── Form-centric layout (unique FTGs per form) ──────

function FtgRow({ ftg, index, wordType, sentences = [], imageMap = {} }) {
  const [expanded, setExpanded] = useState(false)
  const colors = getWordTypeColors(wordType)
  const usageNotesRaw = ftg.usage_notes || ''
  const { first: firstParagraph, hasMore } = extractFirstParagraph(usageNotesRaw)
  const linkedSense = ftg.word_translation?.translation || null
  const usageLabel = ftg.usage_label || ftg.note || ''

  const ftgSentences = sentences.filter(s => {
    if (!Array.isArray(s.links)) return false
    return s.links.some(link =>
      (link.entity_type === 'form_translation_group' && link.entity_id === ftg.id) ||
      (link.entity_type === 'form_translation_group_link' && link.entity_id === ftg.form_translation_group_link_id)
    )
  })

  const ftgImages = imageMap[`form_translation_group:${ftg.id}`] || []

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
      {firstParagraph && (
        <div className="mt-1 ml-7">
          <div
            className="text-xs text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: expanded ? usageNotesRaw : firstParagraph }}
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
      {ftgImages.length > 0 && (
        <div className="ml-7 mt-2 flex gap-2 flex-wrap">
          {ftgImages.map((asset, i) => (
            <WordImage key={asset.id || i} mediaAsset={asset} alt={ftg.translation || ''} className="w-full max-w-xs max-h-40" />
          ))}
        </div>
      )}
      {ftgSentences.length > 0 && (
        <div className="mt-1.5 ml-7">
          <SentenceList sentences={ftgSentences} compact={false} />
        </div>
      )}
    </div>
  )
}

function FormCard({ form, word, wordType, sentences = [], imageMap = {} }) {
  const colors = getWordTypeColors(wordType)
  const primaryAudio = form.primary_audio || null
  const pronunciationLinks = Array.isArray(form.pronunciation_links) ? form.pronunciation_links : []
  const coreTags = Array.isArray(form.core_tags) ? form.core_tags : []
  const ftgs = Array.isArray(form.resolved_translation_groups) ? form.resolved_translation_groups : []
  const formText = form.form_text || form.italian || ''

  const formSentences = sentences.filter(s => {
    if (!Array.isArray(s.links)) return false
    return s.links.some(link =>
      link.entity_type === 'form' && link.entity_id === form.id
    )
  })

  return (
    <div className={`rounded-xl shadow-sm border ${colors.border} overflow-hidden`}>
      <div className={`px-3 py-2.5 ${colors.bg} border-b ${colors.border}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-base font-bold ${colors.text}`}>{formText}</span>
          <FormTagChips coreTags={coreTags} />
          {primaryAudio && pronunciationLinks.length === 0 && (
            <span className="ml-auto">
              <AudioButton
                wordId={word?.id}
                italianText={formText}
                audioObjectKey={primaryAudio?.object_key}
                audioBucket={primaryAudio?.bucket || primaryAudio?.storage_bucket}
                size="sm"
              />
            </span>
          )}
        </div>
        {pronunciationLinks.length > 0 && (
          <div className="mt-1.5">
            <PronunciationDisplay
              pronunciationLinks={pronunciationLinks}
              wordId={word?.id}
              italianText={formText}
            />
          </div>
        )}
      </div>

      {ftgs.length > 0 ? (
        <div className="px-3">
          {ftgs.map((ftg, i) => (
            <FtgRow key={ftg.id || i} ftg={ftg} index={i + 1} wordType={wordType} sentences={sentences} imageMap={imageMap} />
          ))}
        </div>
      ) : (
        <div className="px-3 py-2 text-xs text-gray-400">No translations for this form.</div>
      )}

      {formSentences.length > 0 && ftgs.length === 0 && (
        <div className="px-3 py-2">
          <SentenceList sentences={formSentences} compact={false} />
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────

export default function FormsTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const sentences = Array.isArray(fullBundle?.sentences) ? fullBundle.sentences : []

  const imageMap = buildImageMap(
    fullBundle?.media_links || [],
    fullBundle?.media_assets || []
  )

  if (isLoading && !fullBundle) {
    return <div className="p-4 text-sm text-gray-500">Loading forms...</div>
  }

  if (wordType === 'VERB') {
    return <ConjugationPanel word={word} resolvedBundle={fullBundle} />
  }

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

  // Detect layout mode: FTG-centric (shared) vs form-centric (unique)
  const { ftgMap, hasShared } = buildFtgMap(forms)

  // Forms with zero FTGs (standalone) — show separately in either mode
  const standaloneForms = forms.filter(f =>
    !Array.isArray(f.resolved_translation_groups) || f.resolved_translation_groups.length === 0
  )

  if (hasShared) {
    // ─── FTG-centric layout ─────
    // Sort FTG entries by the display priority of their first form entry
    const sortedFtgEntries = Array.from(ftgMap.values()).sort((a, b) => {
      const aIdx = forms.indexOf(a.formEntries[0]?.form)
      const bIdx = forms.indexOf(b.formEntries[0]?.form)
      return aIdx - bIdx
    })

    return (
      <div className="p-4 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
          {forms.length} form{forms.length !== 1 ? 's' : ''} · {ftgMap.size} translation{ftgMap.size !== 1 ? 's' : ''}
        </p>

        {sortedFtgEntries.map((entry, i) => (
          <SharedFtgCard
            key={entry.ftg.form_translation_group_id || entry.ftg.id || i}
            ftgEntry={entry}
            word={word}
            wordType={wordType}
            sentences={sentences}
            imageMap={imageMap}
          />
        ))}

        {/* Standalone forms (no FTGs) */}
        {standaloneForms.length > 0 && (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mt-4">
              Additional forms
            </p>
            {standaloneForms.map((form, i) => (
              <FormCard key={form.id || i} form={form} word={word} wordType={wordType} sentences={sentences} imageMap={imageMap} />
            ))}
          </>
        )}
      </div>
    )
  }

  // ─── Form-centric layout ─────
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
        {forms.length} form{forms.length !== 1 ? 's' : ''}
      </p>
      {forms.map((form, i) => (
        <FormCard key={form.id || i} form={form} word={word} wordType={wordType} sentences={sentences} imageMap={imageMap} />
      ))}
    </div>
  )
}
