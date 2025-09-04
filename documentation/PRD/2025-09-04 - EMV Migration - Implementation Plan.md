# EMV Migration: Implementation Plan (App Copy)

Status: Executing (normalized path live on this branch)

## Scope

- Normalize core and optional tags from four sources into `entity_meta_values` (EMV):
  - dictionary → entity_type `word`
  - word_forms → entity_type `form`
  - word_translations → entity_type `word_translation`
  - form_translations → entity_type `form_translation` (optional only)
- Sources per table:
  - Core: table `metadata` JSON with stable IDs (authoritative)
  - Optional: `optional_tags` arrays in phase1 cleanup backups (dictionary, word_translations), and `form_translations.metadata` keys for form translations
- Propagation included and updated to write both `attribute_id` and `value_id`.
- EMV schema: `attribute_id uuid` added (FK → `meta_attributes(id)`), populated on insert; left nullable for now.

## Key Decisions

- Optional values: Create new meta_values under the optional attributes when a label doesn’t exist (no mapping to canonical labels).
- Propagation: Part of migration; function updated to insert `attribute_id` with derived rows.
- UI reads: Switch Dictionary to normalized RPC; no optional chips in list, but return optional tags in payload for future UI choices.
- No .sql files stored in repo; SQL shared inline and executed with approvals.

## Non‑Resolvable Pairs (ignored intentionally)

- `metaattr017val065` (Reflexive, removed); catalog has `metaattr017val066`.
- `metaattr015val061` (Plural Only, removed); catalog has `metaattr015val060`.

## Migration Steps (completed)

1) Add `attribute_id` to EMV; backfill; add FK and index.
2) Update `refresh_word_propagation()` to insert `attribute_id`.
3) Truncate EMV.
4) Ensure namespaced optional values for form_translations (voice:active, formality:informal, certainty:high).
5) Insert core metadata (dictionary → word; word_forms → form; word_translations → word_translation).
6) Insert optional from backups (dictionary, word_translations).
7) Insert optional from form_translations.metadata (namespaced labels).
8) Run propagation and health checks.
9) QA validation: counts and per-attribute parity vs resolvable.

Entity totals after migration:
- form: 2526
- word_translation: 89 (56 core + 33 optional)
- form_translation: 6 (optional from metadata)
- word: 105 (72 core + 9 optional + 24 propagated)

## Dictionary Listing RPC (live)

- Name: `app_get_dictionary_listing`
- Inputs:
  - `q text` (prefix search on `dictionary.italian`)
  - `word_types text[]`
  - `filters jsonb` (word-level EMV filters)
    - Shape: `[ { "attribute": "<metaattrXXX>", "values": ["<stable_id or label>", ...] } ]`
    - AND across attributes; OR within values
  - Pagination: `limit_count`, `offset_count`
  - Include flags: `include_audio`, `include_translation_core`, `include_translation_optional`, `include_word_core`, `include_word_optional`
- Returns per word:
  - Basics: `word_id`, `italian`, `word_type`, `audio_filename`, `ipa_pronunciation`
  - `word_core_tags` and `word_optional_tags`: array of normalized tag objects
    - `{ attribute_id, attribute_stable_id, attribute_display_name, value_id, value_stable_id, value_label, value_shorthand, value_description }`
  - `translations`: ordered by `display_priority`
    - `{ id, translation, display_priority, is_primary, core_tags[], optional_tags[] }`
  - `total_count`
- Notes:
  - Filter values accepted by `stable_id` or by `value` label (e.g., CEFR `A1`, conjugation `are`).

## App Integration (this branch)

- `EnhancedDictionarySystem.loadWordsNormalized()` always calls the new RPC.
- UI filters → RPC filters mapping in code (word-level):
  - CEFR Level → metaattr003 (labels A1..C2)
  - Conjugation Type → metaattr004 (are/ere/ire/ire-isc)
  - Frequency Tier → metaattr007 (top100/top500/top1000/top5000)
  - Gender → metaattr011 (masculine/feminine/common)
  - Plural Formation → metaattr026 (plural-e/plural-i/invariable/irregular)
  - Reflexive → metaattr017 (reflexive)
  - Topics (optional word) → metaattr_opt_tag_word (topic-*)
- Result transform preserves WordCard expectations (uppercase word_type; header chips mapped from word core tags; translations carry normalized core/optional tags).

## Execution Steps (no .sql files in repo)

- SQL is shared inline and executed step-by-step with approvals. Sequence used:
  1. Alter EMV: add `attribute_id`, backfill, add FK + index.
  2. Update `refresh_word_propagation()` to insert `attribute_id`.
  3. Truncate EMV; insert core and optionals; run propagation.
  4. Reconciliation checks by entity_type and attribute vs resolvable source pairs.

## Acceptance Criteria (dictionary)

- List shows normalized chips (core); optional tags available in payload.
- Translations ordered by `display_priority`; `is_primary` only when `display_priority = 1`.
- Restriction icons pull from translation core tags (gender_usage, number_restriction, etc.).
- Filters operate via EMV: CEFR, conjugation, frequency, gender, plural formation, reflexive, topics (word-level).
- Performance: no worse than legacy; predictable pagination via RPC.

## Follow-Ups

- Extend filters for translation-level attributes (optional) if required for list.
- Rebuild `get_all_available_tags` to enumerate from EMV, if needed.
- Retire legacy array-based RPCs after cutover.

