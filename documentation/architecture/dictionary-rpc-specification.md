# Dictionary RPC Specification

**Document Version**: 2.0  
**Last Updated**: March 15, 2026  
**Status**: Current Runtime Contract

## Overview

The Misti app reads dictionary data through two RPCs:
- `app_get_dictionary_listing`
- `app_get_word_bundle`

The runtime contract is now canonical-first.

ELI5: the database no longer pretends that every form owns its own flat translation row and one direct audio file. Instead, the app reads shared translation groups, shared pronunciations, and shared media assets, then resolves the primary UI view from that canonical graph.

## `app_get_dictionary_listing`

### Purpose
Return a slim search/listing payload for dictionary browsing.

### Return Shape
```sql
RETURNS TABLE(
  word_id uuid,
  italian text,
  word_type text,
  primary_translation jsonb,
  primary_pronunciation jsonb,
  primary_media jsonb,
  word_core_tags jsonb,
  word_optional_tags jsonb,
  translations jsonb,
  forms jsonb,
  total_count integer
)
```

### Notes
- `primary_translation` is the first display-priority translation summary.
- `primary_pronunciation` contains the primary linked pronunciation summary.
- `primary_media` contains the primary linked media asset summary.
- `forms` is optional and returns slim canonical form summaries only.
- The listing RPC does **not** expose app-facing `form_translations`.

## `app_get_word_bundle`

### Purpose
Return the full canonical word bundle for the word detail and conjugation flows.

### Top-Level Payload
```json
{
  "word": {},
  "translations": [],
  "forms": [],
  "form_translation_groups": [],
  "pronunciation_links": [],
  "pronunciations": [],
  "media_assets": [],
  "media_links": [],
  "etymologies": []
}
```

### Canonical Arrays
- `form_translation_groups`: canonical FTGs with nested FTG links.
- `pronunciation_links`: reusable entity links to pronunciations.
- `pronunciations`: reusable pronunciation records.
- `media_assets`: reusable asset metadata.
- `media_links`: non-pronunciation media attachments.
- `etymologies`: linked long-text etymology documents.

### Convenience Fields
The RPC also returns primary audio/pronunciation summary fields on `word` and `forms`:
- `primary_pronunciation_link_id`
- `primary_pronunciation_id`
- `primary_audio_asset_id`
- `primary_audio_bucket`
- `primary_audio_object_key`
- `primary_audio_voice_name`
- `primary_ipa`
- `primary_phonetic`

These are convenience summaries only. The canonical source of truth remains the link arrays.

## Runtime Resolver Contract

Frontend code should resolve bundle data through the canonical resolver layer in [`/Users/Work/misti/lib/dictionary-bundle-compat.js`](/Users/Work/misti/lib/dictionary-bundle-compat.js).

Resolver responsibilities:
- resolve FTG links per form
- resolve primary pronunciation/media per entity
- expose simple primary-audio fields for UI consumers
- preserve canonical link metadata for future richer UI

## Explicit Non-Goals
- No runtime dependency on `word_audio_metadata`
- No runtime dependency on `form.form_translations`
- No bucket guessing in audio playback when RPC metadata is available
