# 03092025 – Tag Display & RPC Normalization PRD

Status: Ready for Approval

Owner: Engineering

Related Docs:
- documentation/architecture/tagging_v3_dda.md (updated with FE display + RPC contracts)

---

## 1) Summary

Unify tag display and data access for the dictionary and translations:
- Core attributes render with emoji/fancy chips (gender, irregularity, conjugation, CEFR, frequency, auxiliary, etc.).
- Optional tags render as plain, text-only chips using `meta_values.shorthand` (fallback to `value`).
- Respect level scoping: word-level core/optional on list, translation-level optional on translation rows, form-level optional only in conjugation UI.
- Remove “usage-primary” as a tag source; derive “Primary” from `display_priority=1`.
- Provide compact RPCs for normalized tag aggregation to avoid N+1 fetches.

Non-goals: Rebuilding the conjugation UI (covered by a separate piece of work), physical removal of legacy code/docs before validation.

---

## 2) Goals & Non-Goals

Goals
- Consistent tag rendering with clear Core vs Optional rules.
- Level-aware tag surfaces (word, translation, form) to reduce UI noise.
- Use normalized data via EMV joins; minimize client roundtrips with RPCs.
- Seed shorthands for optional tags to produce readable chips.

Non-Goals
- Conjugation UI rebuild (tracked separately; consumes form-level optional tags).
- Immediate deprecation of legacy arrays (keep until validation and sign-off).

---

## 3) Scope

In scope
- FE display rules for core and optional tags, including de-duplication (Primary pill vs usage-primary).
- New RPCs:
  - `app_get_translation_tags(translation_ids uuid[])`
  - (Optional) `app_get_dictionary_listing(search text, word_types text[], limit int, offset int)`
- Shorthand seeding for key optional tags.
- Documentation updates in the existing architecture doc.

Out of scope
- Conjugation UI rebuild (will consume `optional_tag_form` in a later change).

---

## 4) Display Rules

- Word (dictionary list):
  - Show core chips: gender, irregularity, conjugation shorthand on badge, CEFR, frequency, auxiliary, transitivity, reflexive, topics, degree.
  - Show optional word-level tags (`optional_tag_word`) as plain shorthand chips (no emoji).
- Translation rows (inside WordCard):
  - Primary pill from `display_priority=1` (derived, not a tag).
  - Optional translation tags (`optional_tag_translation`) as plain shorthand chips beside translation text.
  - Restriction symbols still come from `context_metadata` (♂/♀/👥/👤).
- Form (conjugation UI):
  - Only show `optional_tag_form` as shorthand chips; do not show form tags elsewhere.
- Do not populate or surface optional tags at the form-translation level.

---

## 5) Data Contracts (RPCs)

app_get_translation_tags(translation_ids uuid[])
- Purpose: Batch-aggregate optional translation tags for provided IDs.
- Returns: rows with `translation_id uuid, tags text[]` where `tags[i] = COALESCE(mv.shorthand, mv.value)` for `optional_tag_translation`.
- Source: `entity_meta_values` (EMV) JOIN `meta_values` JOIN `meta_attributes` (stable_id = `metaattr_opt_tag_translation`).

app_get_dictionary_listing(search text, word_types text[], limit int=20, offset int=0) [optional]
- Purpose: Compact word listing including translations and an aggregated tags array per translation.
- Filtering: Optional EXISTS by tag for normalized tag-based filtering.
- Returns: words (+ translations) plus per-translation tags.

Notes
- Primary (usage) is derived from `display_priority=1` at the client; no tag needed.
- Shorthand seeding improves chip labels (e.g., High, Med, Original, Aesthetic).

---

## 6) Shorthand Policy

- Optional tags render only their `shorthand` label; if null, fallback to `value`.
- Propose shorthands for common values (confidence/source/semantic/domain/context); see SQL draft.
- Hide `test_*` values from user UI.

---

## 7) Validation & Acceptance

- Visual parity for core chips with current UI.
- Optional chips appear in correct places (word-level optional on list; translation-level optional on rows; form-level optional only in conjugation UI).
- No duplication of “Primary” (derived from display order only).
- No optional tags shown at form-translation level.
- Data access via a single listing RPC or listing + batch tags RPC (no N+1).

---

## 8) Backups & Rollback

- Before merging UI changes, back up current `components/WordCard.js`, `lib/enhanced-dictionary-system.js`, and relevant docs to `backup-archive/` with timestamp.
- Feature-flag the new path to allow quick rollback to legacy rendering.

---

## 9) Risks & Mitigations

- Mixed tag sources during transition → feature flag and dual path.
- Missing shorthands produce noisy labels → seed common shorthands first; fall back to `value` safely.
- Query drift → RPCs encapsulate EXISTS patterns for normalized data.

---

## 10) Implementation Plan (High-Level)

Phase 1 – Data APIs
- Implement `app_get_translation_tags` and (optionally) `app_get_dictionary_listing`.
- Seed shorthands for key optional tags.

SQL (to be executed post-approval)

1) Shorthand seeding (idempotent examples)

```sql
-- Optional translation tags
UPDATE meta_values mv
SET shorthand = 'High'
FROM meta_attributes ma
WHERE ma.id = mv.attribute_id
  AND ma.stable_id = 'metaattr_opt_tag_translation'
  AND mv.value = 'confidence-high'
  AND (mv.shorthand IS NULL OR mv.shorthand <> 'High');

UPDATE meta_values mv
SET shorthand = 'Med'
FROM meta_attributes ma
WHERE ma.id = mv.attribute_id
  AND ma.stable_id = 'metaattr_opt_tag_translation'
  AND mv.value = 'confidence-medium'
  AND (mv.shorthand IS NULL OR mv.shorthand <> 'Med');

UPDATE meta_values mv
SET shorthand = 'Original'
FROM meta_attributes ma
WHERE ma.id = mv.attribute_id
  AND ma.stable_id = 'metaattr_opt_tag_translation'
  AND mv.value = 'source-original-dictionary'
  AND (mv.shorthand IS NULL OR mv.shorthand <> 'Original');

-- Optional word tags (topics — examples)
UPDATE meta_values mv
SET shorthand = 'Place'
FROM meta_attributes ma
WHERE ma.id = mv.attribute_id
  AND ma.stable_id = 'metaattr_opt_tag_word'
  AND mv.value = 'topic-place'
  AND (mv.shorthand IS NULL OR mv.shorthand <> 'Place');
```

2) Batch translation tags RPC (with safety limit)

```sql
CREATE OR REPLACE FUNCTION public.app_get_translation_tags(
  p_translation_ids uuid[],
  p_limit integer DEFAULT 5000
)
RETURNS TABLE(translation_id uuid, tags text[])
LANGUAGE sql
STABLE
AS $$
  SELECT
    emv.entity_id AS translation_id,
    COALESCE(
      ARRAY_AGG(DISTINCT COALESCE(mv.shorthand, mv.value) ORDER BY mv.value)
      FILTER (WHERE mv.id IS NOT NULL),
      ARRAY[]::text[]
    ) AS tags
  FROM entity_meta_values emv
  JOIN meta_values mv ON mv.id = emv.value_id
  JOIN meta_attributes ma ON ma.id = mv.attribute_id
  WHERE emv.entity_type = 'word_translation'
    AND emv.entity_id = ANY(p_translation_ids)
    AND ma.stable_id = 'metaattr_opt_tag_translation'
  GROUP BY emv.entity_id
  LIMIT GREATEST(0, COALESCE(p_limit, 5000));
$$;
```

Client guidance: chunk `p_translation_ids` to safe sizes (e.g., 500–1000 IDs per call) to avoid memory pressure.

3) Optional: compact dictionary listing RPC

```sql
CREATE OR REPLACE FUNCTION public.app_get_dictionary_listing(
  p_search text DEFAULT NULL,
  p_word_types text[] DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  word_id uuid,
  italian text,
  word_type text,
  translations jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH base AS (
    SELECT d.id, d.italian, d.word_type
    FROM dictionary d
    WHERE (p_search IS NULL OR d.italian ILIKE ('%' || p_search || '%'))
      AND (p_word_types IS NULL OR d.word_type = ANY(p_word_types))
    ORDER BY d.italian ASC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT
    b.id AS word_id,
    b.italian,
    b.word_type,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', wt.id,
          'translation', wt.translation,
          'display_priority', wt.display_priority,
          'tags', (
            SELECT COALESCE(
              ARRAY_AGG(DISTINCT COALESCE(mv.shorthand, mv.value) ORDER BY mv.value)::text[],
              ARRAY[]::text[]
            )
            FROM entity_meta_values emv
            JOIN meta_values mv ON mv.id = emv.value_id
            JOIN meta_attributes ma ON ma.id = mv.attribute_id
            WHERE emv.entity_type = 'word_translation'
              AND emv.entity_id = wt.id
              AND ma.stable_id = 'metaattr_opt_tag_translation'
          )
        )
        ORDER BY wt.display_priority, wt.translation
      )
      FROM word_translations wt
      WHERE wt.word_id = b.id
    ) AS translations
  FROM base b;
$$;
```

Phase 2 – UI Mapping (non-breaking)
- Add `lib/tag-display-map.js` centralizing core vs optional chip rules.
- Wire WordCard to use optional translation tags (shorthand) on rows; keep core chips as is.
- Allow optional word-level chips on the bottom row.

Phase 3 – Conjugation UI (separate)
- Rebuild using `optional_tag_form` shorthand chips.

Phase 4 – Docs & Cleanup
- Update architecture doc sections.
- After validation/sign-off, remove obsolete docs and legacy code paths.

---

## 11) Testing Strategy

- RPC endpoints: unit and integration tests covering empty input, chunked input, and large sets (limit enforced).
- Display logic: snapshot/DOM tests for core chips and optional chips placement; verify de-duplication of “Primary”.
- Error cases: simulate RPC failure and missing shorthands; UI falls back to legacy behavior or raw `value` text.

---

## 12) Performance & Resilience Considerations

- RPC performance: `p_limit` guard; client chunks inputs (500–1000 IDs per call) to prevent memory issues.
- Feature flags: server or client flag allowing per-user/per-session rollout of the new path.
- Error handling: graceful degradation to current behavior on RPC failure; log and surface minimal UI impact.

---

## 13) Shorthand Governance

- Validation pass on shorthands to ensure readability and consistency across languages/locales.
- Process: propose → review → seed; lint rules to prevent overly cryptic labels.

---

## 14) Migration Communication

- Document any optional tags that cannot cleanly map to shorthands and define a remediation (rename, merge, or hide).
- Communicate UI changes and rollout plan to stakeholders; confirm acceptance before removing legacy code/docs.
