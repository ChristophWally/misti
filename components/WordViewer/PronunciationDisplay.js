'use client'

// components/WordViewer/PronunciationDisplay.js
// Reusable pronunciation variant display with audio buttons.
// Shows IPA, phonetic, accent, and per-variant audio from pronunciation_links.

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
    // Compact mode: just IPA + single audio button (for conjugation cells, form cards)
    const ipa = primary.ipa_pronunciation || primary.accent || ''
    const media = primary.media_asset
    return (
      <span className="inline-flex items-center gap-1.5">
        {ipa && <span className="text-xs font-mono text-gray-500">[{ipa}]</span>}
        {media?.object_key && (
          <AudioButton
            wordId={wordId}
            italianText={italianText}
            audioObjectKey={media.object_key}
            audioBucket={media.storage_bucket || media.bucket}
            size="sm"
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
        {primary.media_asset?.object_key && (
          <AudioButton
            wordId={wordId}
            italianText={italianText}
            audioObjectKey={primary.media_asset.object_key}
            audioBucket={primary.media_asset.storage_bucket || primary.media_asset.bucket}
            size="md"
          />
        )}
        {primary.ipa_pronunciation && (
          <span className="text-sm font-mono text-gray-600">[{primary.ipa_pronunciation}]</span>
        )}
        {primary.phonetic_pronunciation && (
          <span className="text-sm italic text-gray-500">{primary.phonetic_pronunciation}</span>
        )}
        {primary.accent && !primary.ipa_pronunciation && (
          <span className="text-sm font-mono text-gray-600">{primary.accent}</span>
        )}
      </div>

      {/* Additional variants */}
      {additional.map((variant, i) => {
        const media = variant.media_asset
        return (
          <div key={i} className="flex items-center gap-2 ml-1">
            {media?.object_key && (
              <AudioButton
                wordId={wordId}
                italianText={italianText}
                audioObjectKey={media.object_key}
                audioBucket={media.storage_bucket || media.bucket}
                size="sm"
                variant="inline-icon"
              />
            )}
            {variant.ipa_pronunciation && (
              <span className="text-xs font-mono text-gray-500">[{variant.ipa_pronunciation}]</span>
            )}
            {media?.voice_name && (
              <span className="text-xs text-gray-400">{media.voice_name}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
