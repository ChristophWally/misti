'use client'

// components/WordViewer/PronunciationDisplay.js
// Reusable pronunciation variant display with audio buttons.
// Shows accent (diacritic), IPA, phonetic, and per-variant audio from pronunciation_links.

import AudioButton from '../AudioButton'

export default function PronunciationDisplay({ pronunciationLinks, wordId, italianText, compact = false }) {
  if (!Array.isArray(pronunciationLinks) || pronunciationLinks.length === 0) {
    return null
  }

  // Sort by variant_order (primary first)
  const sorted = pronunciationLinks
    .slice()
    .sort((a, b) => (a.variant_order || 999) - (b.variant_order || 999))

  const primary = sorted[0]
  const additional = sorted.slice(1)

  if (compact) {
    // Compact mode: accent or IPA + single audio button (for conjugation cells, form cards)
    const accent = primary.accent || ''
    const ipa = primary.ipa_pronunciation || ''
    const media = primary.media_asset || resolveFlatMedia(primary)
    return (
      <span className="inline-flex items-center gap-1.5">
        {accent && <span className="text-xs font-semibold text-gray-700">{accent}</span>}
        {ipa && <span className="text-xs font-mono text-gray-500">[{ipa}]</span>}
        {!accent && !ipa && primary.phonetic_pronunciation && (
          <span className="text-xs italic text-gray-500">{primary.phonetic_pronunciation}</span>
        )}
        {media?.object_key && (
          <AudioButton
            wordId={wordId}
            italianText={italianText}
            audioObjectKey={media.object_key}
            audioBucket={media.storage_bucket || media.bucket}
            size="chip"
            variant="inline-icon"
          />
        )}
      </span>
    )
  }

  // Full mode: primary variant prominent, additional variants as smaller rows
  return (
    <div className="space-y-1">
      {/* Primary variant */}
      <div className="flex items-center gap-2">
        {renderAudio(primary, wordId, italianText)}
        {primary.accent && (
          <span className="text-sm font-semibold text-gray-800">{primary.accent}</span>
        )}
        {primary.ipa_pronunciation && (
          <span className="text-sm font-mono text-gray-600">[{primary.ipa_pronunciation}]</span>
        )}
        {primary.phonetic_pronunciation && (
          <span className="text-sm italic text-gray-500">{primary.phonetic_pronunciation}</span>
        )}
      </div>

      {/* Additional variants */}
      {additional.map((variant, i) => (
        <div key={i} className="flex items-center gap-2 ml-1">
          {renderAudio(variant, wordId, italianText)}
          {variant.accent && (
            <span className="text-xs font-semibold text-gray-700">{variant.accent}</span>
          )}
          {variant.ipa_pronunciation && (
            <span className="text-xs font-mono text-gray-500">[{variant.ipa_pronunciation}]</span>
          )}
          {variant.phonetic_pronunciation && (
            <span className="text-xs italic text-gray-400">{variant.phonetic_pronunciation}</span>
          )}
          {(variant.media_asset?.voice_name || variant.voice_name) && (
            <span className="text-xs text-gray-400">
              {variant.media_asset?.voice_name || variant.voice_name}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/** Resolve media from either nested media_asset or flat pronunciation_link fields */
function resolveFlatMedia(link) {
  if (link.media_asset) return link.media_asset
  if (link.audio_filename) {
    return { object_key: link.audio_filename, storage_bucket: link.storage_bucket, voice_name: link.voice_name }
  }
  return null
}

function renderAudio(variant, wordId, italianText) {
  const media = variant.media_asset || resolveFlatMedia(variant)
  if (!media?.object_key) return null
  return (
    <AudioButton
      wordId={wordId}
      italianText={italianText}
      audioObjectKey={media.object_key}
      audioBucket={media.storage_bucket || media.bucket}
      size="chip"
      variant="inline-icon"
    />
  )
}
