'use client'

// components/WordViewer/tabs/FormsTab.js
// Layout:
//   1. Forms table — grouped by form type (Contracted Forms, Plural Forms, etc.)
//      Each row: symbol · form + audio · composition · accent/IPA/phonetic · tag chips · notes
//   2. FTG translation cards — each with small form pills (symbol + text only, no tags)
//
// For verbs: delegates to ConjugationPanel.

import { useState } from 'react'
import AudioButton from '../../AudioButton'
import ConjugationPanel from '../ConjugationPanel'
import SentenceList from '../SentenceList'
import WordImage from '../WordImage'
import { getWordTypeColors } from '../../../lib/word-type-utils'
import { processRpcTagsForDisplay } from '../../../lib/tag-processing'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
  PREPOSITION: 'bg-gray-500',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  for (const key of Object.keys(map)) map[key].sort((a, b) => a.link_order - b.link_order)
  return map
}

/** Resolve audio descriptor from a pronunciation link (nested or flat RPC fields). */
function resolvePronAudio(link) {
  if (link?.media_asset?.object_key) return link.media_asset
  if (link?.object_key) return { object_key: link.object_key, bucket: link.bucket || link.storage_bucket }
  return null
}

/** Get all tag chips for a form using processRpcTagsForDisplay. */
function getFormChips(coreTags = [], wordType = '') {
  const { essential, detailed } = processRpcTagsForDisplay(coreTags, wordType)
  return [...essential, ...detailed]
}

/**
 * Derive the gender/number symbol for a form.
 *
 * Primary: the contracted article from the word_relationship entry tells us
 * exactly which gender/number the form represents:
 *   il → ♂   lo → ♂   la → ♀   i → ⚤   gli → ⚤   le → ⚢   l' → ⚤ (both)
 *
 * Fallback: phonology-position tag (before-vowel-or-h → ⚤), then WORD_GENDER +
 * NUMBER tags for non-contracted forms (nouns / adjectives).
 */
const ARTICLE_TO_SYMBOL = {
  'il': '♂', 'lo': '♂',
  'la': '♀',
  'i':  '⚤', 'gli': '⚤', "l'": '⚤',
  'le': '⚢',
}

// Sort order for contracted forms (del→dei→della→delle→dello→degli→dell')
const ARTICLE_SORT_ORDER = { 'il': 0, 'i': 1, 'la': 2, 'le': 3, 'lo': 4, 'gli': 5, "l'": 6 }

function normaliseArticle(str) {
  return (str || '').toLowerCase().replace(/\u2019/g, "'").trim()
}

function getFormSymbol(form, relationships = []) {
  // Primary: derive from contracted article in relationship
  const rel = relationships.find(
    r => r.contracted_form_id === form.id || r.target_form_id === form.id
  )
  if (rel?.target_italian) {
    const article = normaliseArticle(rel.target_italian)
    if (ARTICLE_TO_SYMBOL[article]) return ARTICLE_TO_SYMBOL[article]
  }

  // Fallback: phonology-position tag
  const coreTags = Array.isArray(form.core_tags) ? form.core_tags : []
  const phonTag = coreTags.find(t => t.attribute_stable_id === 'metaattr035')
  if (phonTag?.value_label === 'before-vowel-or-h') return '⚤'

  // Fallback: explicit WORD_GENDER + NUMBER tags (nouns, adjectives)
  const genderTag = coreTags.find(t => t.attribute_stable_id === 'metaattr011')
  const numberTag = coreTags.find(t => t.attribute_stable_id === 'metaattr012')
  const isMasc = genderTag?.value_label === 'masculine'
  const isFem  = genderTag?.value_label === 'feminine'
  const isPlur = numberTag?.value_label === 'plurale'

  if (isMasc && isPlur)  return '⚤'
  if (isMasc)            return '♂'
  if (isFem  && isPlur)  return '⚢'
  if (isFem)             return '♀'
  return null
}

/**
 * Group forms into labelled sections.
 * Forms with phonology-position tags (metaattr035) OR a relationship entry → "Contracted Forms".
 * Other forms grouped by form.form_type.
 * Section order: contracted first, then remaining by key.
 */
function groupFormsByType(forms, relationships) {
  const grouped = {}

  for (const form of forms) {
    const coreTags = Array.isArray(form.core_tags) ? form.core_tags : []
    const hasPhonTag = coreTags.some(t => t.attribute_stable_id === 'metaattr035')
    const hasRelationship = relationships.some(
      r => r.contracted_form_id === form.id || r.target_form_id === form.id
    )

    let sectionKey, sectionLabel
    if (hasPhonTag || hasRelationship) {
      sectionKey   = 'contracted'
      sectionLabel = 'Contracted Forms'
    } else {
      const ft = (form.form_type || 'other').toLowerCase().trim()
      sectionKey   = ft
      sectionLabel = ft === 'plural'    ? 'Plural Forms'
                   : ft === 'irregular' ? 'Irregular Forms'
                   : ft === 'other'     ? 'Forms'
                   : ft.charAt(0).toUpperCase() + ft.slice(1).replace(/[-_]/g, ' ') + ' Forms'
    }

    if (!grouped[sectionKey]) grouped[sectionKey] = { label: sectionLabel, forms: [] }
    grouped[sectionKey].forms.push(form)
  }

  const keys = Object.keys(grouped).sort((a, b) => {
    if (a === 'contracted') return -1
    if (b === 'contracted') return 1
    return a.localeCompare(b)
  })

  return keys.map(k => grouped[k])
}

/**
 * Sort contracted forms by their contracted article:
 * il(del) → i(dei) → la(della) → le(delle) → lo(dello) → gli(degli) → l'(dell')
 * Falls back to phonology-position order if no relationship found.
 */
function sortContractedForms(forms, relationships) {
  const phonOrder = { 'before-most-consonants': 0, 'before-impure-consonant': 1, 'before-vowel-or-h': 2 }

  return [...forms].sort((a, b) => {
    // Primary: article sort order from relationship
    const aRel = relationships.find(r => r.contracted_form_id === a.id || r.target_form_id === a.id)
    const bRel = relationships.find(r => r.contracted_form_id === b.id || r.target_form_id === b.id)
    const aArticle = normaliseArticle(aRel?.target_italian || '')
    const bArticle = normaliseArticle(bRel?.target_italian || '')
    const aArticleOrder = ARTICLE_SORT_ORDER[aArticle] ?? 99
    const bArticleOrder = ARTICLE_SORT_ORDER[bArticle] ?? 99
    if (aArticleOrder !== bArticleOrder) return aArticleOrder - bArticleOrder

    // Fallback: phonology-position tag order
    const aPhon = (Array.isArray(a.core_tags) ? a.core_tags : [])
      .find(t => t.attribute_stable_id === 'metaattr035')?.value_label || ''
    const bPhon = (Array.isArray(b.core_tags) ? b.core_tags : [])
      .find(t => t.attribute_stable_id === 'metaattr035')?.value_label || ''
    return (phonOrder[aPhon] ?? 0) - (phonOrder[bPhon] ?? 0)
  })
}

// ─── Forms Table ──────────────────────────────────────────────────────────────

/**
 * Single row in the forms table.
 * Columns (stacked within a 2-col grid: symbol | content):
 *   symbol · form text + audio · composition · accent / IPA / phonetic (all variants) · chips · notes
 */
function FormTableRow({ form, word, wordType, relationships, isContracted = false }) {
  const coreTags   = Array.isArray(form.core_tags) ? form.core_tags : []
  const symbol     = getFormSymbol(form, relationships)
  const formText   = form.form_text || form.italian || ''
  const chips      = getFormChips(coreTags, wordType)

  // Pronunciation variants, sorted primary first
  const pronunciationLinks = Array.isArray(form.pronunciation_links)
    ? form.pronunciation_links.slice().sort((a, b) => (a.variant_order || 999) - (b.variant_order || 999))
    : []

  // Fallback audio when no pronunciation_links
  const primaryAudio = form.primary_audio || null

  // Relationship for composition line
  const relationship = relationships.find(
    r => r.contracted_form_id === form.id || r.target_form_id === form.id
  )
  const notes = relationship?.description || relationship?.systematic_rule || ''

  return (
    <div className="grid grid-cols-[2rem_1fr] gap-x-2 py-2.5 border-b border-gray-100 last:border-0 items-start">
      {/* Symbol */}
      <div className="text-base font-bold text-gray-500 text-center pt-0.5 select-none">
        {symbol || '—'}
      </div>

      {/* Content */}
      <div className="min-w-0">
        {/* Form text + audio */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-gray-900">{formText}</span>

          {/* Audio from pronunciation_links (first variant) */}
          {pronunciationLinks.length > 0 && (() => {
            const media = resolvePronAudio(pronunciationLinks[0])
            return media?.object_key ? (
              <AudioButton
                wordId={word?.id}
                italianText={formText}
                audioObjectKey={media.object_key}
                audioBucket={media.storage_bucket || media.bucket}
                size="chip"
                variant="inline-icon"
              />
            ) : null
          })()}

          {/* Fallback audio when no pronunciation_links */}
          {pronunciationLinks.length === 0 && primaryAudio?.object_key && (
            <AudioButton
              wordId={word?.id}
              italianText={formText}
              audioObjectKey={primaryAudio.object_key}
              audioBucket={primaryAudio.bucket || primaryAudio.storage_bucket}
              size="chip"
              variant="inline-icon"
            />
          )}
        </div>

        {/* Composition: di + il → del */}
        {relationship?.source_italian && relationship?.target_italian && (
          <div className="text-xs font-mono text-gray-400 mt-0.5">
            {relationship.source_italian} + {relationship.target_italian} → {formText}
          </div>
        )}

        {/* Pronunciation variants: accent / IPA / phonetic */}
        {pronunciationLinks.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {pronunciationLinks.map((link, i) => {
              const accent   = link.accent || ''
              const ipa      = link.ipa_pronunciation || ''
              const phonetic = link.phonetic_pronunciation || ''
              const dialect  = link.voice_name || link.dialect || ''
              if (!accent && !ipa && !phonetic) return null
              return (
                <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  {dialect && i > 0 && (
                    <span className="text-[10px] text-gray-400 italic">{dialect}</span>
                  )}
                  {accent   && <span className="text-xs font-semibold text-gray-700">{accent}</span>}
                  {ipa      && <span className="text-xs font-mono text-gray-500">[{ipa}]</span>}
                  {phonetic && <span className="text-xs italic text-gray-400">{phonetic}</span>}
                  {/* Additional variant audio */}
                  {i > 0 && (() => {
                    const media = resolvePronAudio(link)
                    return media?.object_key ? (
                      <AudioButton
                        wordId={word?.id}
                        italianText={formText}
                        audioObjectKey={media.object_key}
                        audioBucket={media.storage_bucket || media.bucket}
                        size="chip"
                        variant="inline-icon"
                      />
                    ) : null
                  })()}
                </div>
              )
            })}
          </div>
        )}

        {/* Tag chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {chips.map((chip, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded ${chip.class}`}
                title={chip.description}
              >
                {chip.display}
              </span>
            ))}
          </div>
        )}

        {/* Relationship notes */}
        {notes && (
          <p className="text-xs text-gray-400 italic mt-1">{notes}</p>
        )}
      </div>
    </div>
  )
}

/** Section card containing the forms table for one form type. */
function FormsSectionCard({ section, word, wordType, relationships, barClass, isContracted }) {
  const forms = isContracted
    ? sortContractedForms(section.forms, relationships)
    : section.forms

  return (
    <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
      <div className={`w-1.5 flex-shrink-0 ${barClass}`} />
      <div className="flex-1 min-w-0">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {section.label}
          </h3>
        </div>
        <div className="px-3">
          {forms.map((form, i) => (
            <FormTableRow
              key={form.id || i}
              form={form}
              word={word}
              wordType={wordType}
              relationships={relationships}
              isContracted={isContracted}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── FTG translation cards ────────────────────────────────────────────────────

/**
 * Build a deduplicated FTG map from all forms.
 * Returns { ftgMap: Map<ftgId, { ftg, formEntries }>, hasShared: boolean }
 */
function buildFtgMap(forms) {
  const ftgMap = new Map()

  for (const form of forms) {
    const ftgs = Array.isArray(form.resolved_translation_groups) ? form.resolved_translation_groups : []
    for (const ftg of ftgs) {
      const ftgId = ftg.form_translation_group_id || ftg.id
      if (!ftgMap.has(ftgId)) ftgMap.set(ftgId, { ftg, formEntries: [] })
      ftgMap.get(ftgId).formEntries.push({
        form,
        usageLabel: ftg.usage_label || ftg.note || '',
        linkId: ftg.form_translation_group_link_id || ftg.id,
      })
    }
  }

  let hasShared = false
  for (const entry of ftgMap.values()) {
    if (entry.formEntries.length > 1) { hasShared = true; break }
  }

  return { ftgMap, hasShared }
}

/** FTG translation card: header + small form pills + usage notes + sentences. */
function FtgCard({ ftgEntry, word, wordType, sentences, imageMap, barClass, relationships }) {
  const [expanded, setExpanded] = useState(false)
  const colors = getWordTypeColors(wordType)
  const { ftg, formEntries } = ftgEntry

  const usageNotesRaw = ftg.usage_notes || ''
  const { first: firstParagraph, hasMore } = extractFirstParagraph(usageNotesRaw)
  const linkedSense = ftg.word_translation?.translation || null
  const ftgId = ftg.form_translation_group_id || ftg.id

  const seenIds = new Set()
  const ftgSentences = sentences.filter(s => {
    if (!Array.isArray(s.links)) return false
    const matches = s.links.some(link =>
      (link.entity_type === 'form_translation_group' && link.entity_id === ftgId) ||
      formEntries.some(fe =>
        link.entity_type === 'form_translation_group_link' && link.entity_id === fe.linkId
      )
    )
    if (matches && !seenIds.has(s.id)) { seenIds.add(s.id); return true }
    return false
  })

  const ftgImages = imageMap[`form_translation_group:${ftgId}`] || []

  return (
    <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
      <div className={`w-1.5 flex-shrink-0 ${barClass}`} />
      <div className="flex-1 min-w-0 px-3 py-2.5 space-y-2">

        {/* FTG translation + linked sense */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{ftg.translation}</span>
          {linkedSense && (
            <>
              <span className="text-xs text-gray-400">→</span>
              <span className={`text-xs ${colors.text}`}>{linkedSense}</span>
            </>
          )}
        </div>

        {/* Form pills: symbol + form text only */}
        {formEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {formEntries.map((fe, i) => {
              const symbol = getFormSymbol(fe.form, relationships)
              const formText = fe.form.form_text || ''
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 font-medium"
                  title={fe.usageLabel || undefined}
                >
                  {symbol && <span>{symbol}</span>}
                  <span>{formText}</span>
                </span>
              )
            })}
          </div>
        )}

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
          <SentenceList sentences={ftgSentences} compact={false} colorBarClass={barClass} />
        )}
      </div>
    </div>
  )
}

// ─── Form-centric layout (unique FTGs per form, e.g. nouns) ──────────────────

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
        {usageLabel && <span className="text-xs text-gray-400 italic flex-shrink-0">{usageLabel}</span>}
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
            <button onClick={() => setExpanded(e => !e)} className="text-xs text-teal-600 hover:text-teal-800 mt-0.5 underline">
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

function FormCard({ form, word, wordType, sentences = [], imageMap = {}, barClass }) {
  const primaryAudio = form.primary_audio || null
  const pronunciationLinks = Array.isArray(form.pronunciation_links) ? form.pronunciation_links : []
  const coreTags = Array.isArray(form.core_tags) ? form.core_tags : []
  const chips = getFormChips(coreTags, wordType)
  const ftgs = Array.isArray(form.resolved_translation_groups) ? form.resolved_translation_groups : []
  const formText = form.form_text || form.italian || ''

  const formSentences = sentences.filter(s => {
    if (!Array.isArray(s.links)) return false
    return s.links.some(link => link.entity_type === 'form' && link.entity_id === form.id)
  })

  return (
    <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
      <div className={`w-1.5 flex-shrink-0 ${barClass}`} />
      <div className="flex-1 min-w-0">
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">{formText}</span>
            {chips.length > 0 && (
              <span className="inline-flex flex-wrap gap-0.5">
                {chips.map((c, i) => (
                  <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${c.class}`} title={c.description}>{c.display}</span>
                ))}
              </span>
            )}
            {primaryAudio?.object_key && pronunciationLinks.length === 0 && (
              <span className="ml-auto">
                <AudioButton
                  wordId={word?.id}
                  italianText={formText}
                  audioObjectKey={primaryAudio.object_key}
                  audioBucket={primaryAudio.bucket || primaryAudio.storage_bucket}
                  size="chip"
                  variant="inline-icon"
                />
              </span>
            )}
          </div>
          {pronunciationLinks.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {pronunciationLinks
                .slice()
                .sort((a, b) => (a.variant_order || 999) - (b.variant_order || 999))
                .map((link, i) => {
                  const accent = link.accent || ''
                  const ipa = link.ipa_pronunciation || ''
                  const phonetic = link.phonetic_pronunciation || ''
                  const media = resolvePronAudio(link)
                  if (!accent && !ipa && !phonetic) return null
                  return (
                    <div key={i} className="flex flex-wrap items-baseline gap-x-2">
                      {accent   && <span className="text-xs font-semibold text-gray-700">{accent}</span>}
                      {ipa      && <span className="text-xs font-mono text-gray-500">[{ipa}]</span>}
                      {phonetic && <span className="text-xs italic text-gray-400">{phonetic}</span>}
                      {media?.object_key && (
                        <AudioButton
                          wordId={word?.id}
                          italianText={formText}
                          audioObjectKey={media.object_key}
                          audioBucket={media.storage_bucket || media.bucket}
                          size="chip"
                          variant="inline-icon"
                        />
                      )}
                    </div>
                  )
                })}
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
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function FormsTab({ word, fullBundle, isLoading }) {
  const wordType     = String(word?.word_type || '').toUpperCase()
  const barClass     = POS_COLOUR_BAR[wordType] || 'bg-gray-400'
  const sentences    = Array.isArray(fullBundle?.sentences) ? fullBundle.sentences : []
  const relationships = Array.isArray(fullBundle?.word_relationships) ? fullBundle.word_relationships : []

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

  const { ftgMap, hasShared } = buildFtgMap(forms)

  // ── FTG-centric layout (prepositions, shared FTGs) ────────────────────────
  if (hasShared) {
    const formSections = groupFormsByType(forms, relationships)

    const sortedFtgEntries = Array.from(ftgMap.values()).sort((a, b) => {
      const aIdx = forms.indexOf(a.formEntries[0]?.form)
      const bIdx = forms.indexOf(b.formEntries[0]?.form)
      return aIdx - bIdx
    })

    const standaloneForms = forms.filter(
      f => !Array.isArray(f.resolved_translation_groups) || f.resolved_translation_groups.length === 0
    )

    return (
      <div className="p-4 space-y-3">
        {/* ── Forms table section(s) ── */}
        {formSections.map((section, i) => (
          <FormsSectionCard
            key={i}
            section={section}
            word={word}
            wordType={wordType}
            relationships={relationships}
            barClass={barClass}
            isContracted={section.label === 'Contracted Forms'}
          />
        ))}

        {/* ── FTG translation cards ── */}
        {sortedFtgEntries.length > 0 && (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold pt-1">
              Translations
            </p>
            {sortedFtgEntries.map((entry, i) => (
              <FtgCard
                key={entry.ftg.form_translation_group_id || entry.ftg.id || i}
                ftgEntry={entry}
                word={word}
                wordType={wordType}
                sentences={sentences}
                imageMap={imageMap}
                barClass={barClass}
                relationships={relationships}
              />
            ))}
          </>
        )}

        {/* ── Standalone forms (no FTG) ── */}
        {standaloneForms.length > 0 && (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mt-4">
              Additional forms
            </p>
            {standaloneForms.map((form, i) => (
              <FormCard key={form.id || i} form={form} word={word} wordType={wordType} sentences={sentences} imageMap={imageMap} barClass={barClass} />
            ))}
          </>
        )}
      </div>
    )
  }

  // ── Form-centric layout (nouns, adjectives) ───────────────────────────────
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
        {forms.length} form{forms.length !== 1 ? 's' : ''}
      </p>
      {forms.map((form, i) => (
        <FormCard key={form.id || i} form={form} word={word} wordType={wordType} sentences={sentences} imageMap={imageMap} barClass={barClass} />
      ))}
    </div>
  )
}
