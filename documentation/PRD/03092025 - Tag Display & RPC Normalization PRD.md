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

Who this is for
- This document is written so that product, design, and engineering can each understand what is changing and why. It avoids code-heavy terminology and explains the logic behind decisions.

Why this is needed
- Our tagging has moved to a normalized structure to reduce database size and improve performance. The UI must now read from this structure in a predictable, user-friendly way. This PRD standardizes how we present tags, how we fetch them efficiently, and how we roll out changes safely.

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

Why these goals
- Consistency: Users should see the same tag categories in the same places. This reduces cognitive load.
- Level-awareness: Some tags only make sense at specific levels (e.g., form-level details should not clutter the main dictionary view). This keeps the UI focused and fast.
- Normalized reads: The database now stores tags in a compact, reference-driven format. Reading them directly (instead of duplicating arrays) saves space and improves performance.
- Shorthands: Optional tags can be numerous and verbose. Short labels keep chips readable, especially on mobile.

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

Why these choices
- The conjugation UI deserves its own PRD because it has unique UX and performance needs.
- We are not removing legacy code immediately to allow an easy rollback during validation.

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

Rationale (plain language)
- Core vs Optional: Core tags carry primary meaning for learners (e.g., gender, conjugation type). Optional tags convey extra context (e.g., confidence, source). We give core tags strong visuals and keep optional tags light to avoid overwhelming the user.
- Level scoping: Showing tags at the wrong level is confusing. For example, form-only tags shown on a word list add noise without value. Constraining where we show tags keeps things clear and fast.
- Deriving “Primary”: We already have an ordering field (`display_priority`). Using it avoids redundant tags and potential disagreements between fields.

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

What is an RPC (in this context)?
- A small, read-only database function that returns exactly the data our UI needs in one call. This keeps the app fast and avoids a “many small queries” pattern.

Why an RPC instead of building SQL in the app?
- Faster pages: the database can pre-join and aggregate data.
- Safer & clearer: the contract is documented here; changes are versionable and testable.
- Consistent performance: lets us add limits and defaults (e.g., `p_limit`) to protect resources.

---

## 6) Shorthand Policy

- Optional tags render only their `shorthand` label; if null, fallback to `value`.
- Propose shorthands for common values (confidence/source/semantic/domain/context); see SQL draft.
- Hide `test_*` values from user UI.

Why shorthands?
- Optional tags can be long (e.g., “semantic-type-aesthetic-quality”). Shorthands (“Aesthetic”) fit small chips and are easier to scan. We retain the full value for admin views and analytics.

Governance in practice
- Propose → Review → Seed. Before seeding, we sanity-check for clarity, brevity, and localization concerns. We avoid insider jargon.

---

## 7) Validation & Acceptance

- Visual parity for core chips with current UI.
- Optional chips appear in correct places (word-level optional on list; translation-level optional on rows; form-level optional only in conjugation UI).
- No duplication of “Primary” (derived from display order only).
- No optional tags shown at form-translation level.
- Data access via a single listing RPC or listing + batch tags RPC (no N+1).

What to check (non-technical)
- Pick a few words across categories (nouns, verbs, adjectives). Do the chips look sensible? Do you see only core tags on the list and optional translation tags beside translation texts?
- Confirm that “Primary” appears for the first translation only, and we don’t show a duplicate optional “primary” tag.
- When shorthands are missing, we should gracefully show the raw value (still readable) and log it for follow-up.
- Turn the feature flag off: app returns to the current behavior with no errors.

---

## 8) Backups & Rollback

- Before merging UI changes, back up current `components/WordCard.js`, `lib/enhanced-dictionary-system.js`, and relevant docs to `backup-archive/` with timestamp.
- Feature-flag the new path to allow quick rollback to legacy rendering.

Break‑glass rollback anchors

For rapid reversion of the word card behavior, restore the repo to the last commits that touched these files:

- WordCard.js: f7e2722b81445b299f9034103a1f36086755cde1 ("refactor: simplify query")
- DictionaryPanel.js: d9e291ea06475c1bbb083a42d01c418d07a90485 ("Fix dictionary loader")

You can revert just the files:

```bash
git checkout f7e2722 -- components/WordCard.js
git checkout d9e291e -- components/DictionaryPanel.js
```

Or revert the entire repository to a safe point via a branch or reset, depending on circumstance.

Why this matters
- These updates change how data is fetched and shown. A feature flag and file backups let us quickly revert if a UX or performance issue emerges during testing.

---

## 9) Risks & Mitigations

- Mixed tag sources during transition → feature flag and dual path.
- Missing shorthands produce noisy labels → seed common shorthands first; fall back to `value` safely.
- Query drift → RPCs encapsulate EXISTS patterns for normalized data.

Plain-language notes
- Tag noise: Optional tags are useful, but too many can distract. We start with a small, curated set and hide the rest in detail views.
- Performance: Batch RPCs and default limits protect us from slow pages when many translations are present.

---

## 10) Implementation Plan (High-Level)

Phase 1 – Data APIs
- Implement `app_get_translation_tags` and (optionally) `app_get_dictionary_listing`.
- Seed shorthands for key optional tags.

Why this phase
- It gives us a single, reliable way to fetch normalized tags in one go. Shorthands ensure chips are readable on small screens.

What will change
- The app can ask the database for “all translation tags for these items” in one call. Chips will show short labels instead of long raw values.

Success signals
- RPCs return expected data for a sample set; no timeouts; logs show no errors. Chips render with short labels.

Rollback
- Do not use the RPC in the app yet (or disable the feature flag). No schema changes are destructive in this phase.

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

Why this phase
- Centralizing mapping avoids scattered logic. It also makes future adjustments (e.g., style changes) easier.

What will change
- Word list looks the same or better for core tags. Translation rows show small, readable optional chips where applicable.

Success signals
- Pilot users can explain what each chip means without reading documentation. No visual regressions.

Rollback
- Toggle off the feature flag to use the legacy path. Keep the mapping module in code for future use.

Front‑end changes in this phase (WordCard & Data Layer)

We will introduce a small mapping utility and a feature‑flagged data path. The narrative below explains what changes and why, followed by code examples you can read line by line even if you don’t write code every day.

We create a single place to translate database tags into chips. This keeps our visual rules consistent and makes future changes safer.

- Add `lib/tag-display-map.js` to convert optional tag objects from the RPC into chip props.
- Add a feature flag in `EnhancedDictionarySystem` to switch between the legacy path and the normalized RPC path.
- Update `WordCard` to render optional chips per translation from the RPC, using the description for hover/tap tooltips.

Example: mapping utility

```js
// lib/tag-display-map.js
// Converts RPC tags (value, shorthand, description, attribute) to UI chips

export function mapOptionalTagsToChips(tags = []) {
  return tags
    .filter(t => t && t.attribute === 'metaattr_opt_tag_translation')
    .filter(t => !(t.value || '').startsWith('test_'))
    .map(t => ({
      key: `${t.attribute}:${t.value}`,
      label: t.shorthand || t.value,
      title: t.description || '',
      className: 'text-xs px-2 py-1 rounded-full font-medium border bg-transparent text-gray-700 border-gray-400',
    }));
}

export function mapWordOptionalTagsToChips(tags = []) {
  return tags
    .filter(t => t && t.attribute === 'metaattr_opt_tag_word')
    .filter(t => !(t.value || '').startsWith('test_'))
    .map(t => ({
      key: `${t.attribute}:${t.value}`,
      label: t.shorthand || t.value,
      title: t.description || '',
      className: 'text-xs px-2 py-1 rounded-full font-medium border bg-transparent text-gray-700 border-gray-400',
    }));
}
```

Example: feature‑flagged data loading (normalized path)

```js
// lib/enhanced-dictionary-system.js (additions)

const USE_NORMALIZED_TAGS = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true';

function chunk(ids, size = 800) {
  const out = [];
  for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size));
  return out;
}

export class EnhancedDictionarySystem {
  // ...existing methods

  async loadWordsNormalized(searchTerm = '', filters = {}) {
    // 1) Fetch base words + translations (existing query)
    let query = this.supabase
      .from('dictionary')
      .select('id, italian, word_type, word_translations(id, translation, display_priority)')
      .order('italian', { ascending: true })
      .limit(20);

    if (searchTerm) query = query.or(`italian.ilike.%${searchTerm}%`);
    if (filters.wordType?.length) query = query.in('word_type', filters.wordType);

    const { data: words, error } = await query;
    if (error) throw error;

    // 2) Collect translation IDs and fetch tags via RPC in chunks
    const translationIds = (words || []).flatMap(w => (w.word_translations || []).map(t => t.id));
    const results = new Map();

    for (const batch of chunk(translationIds)) {
      const { data, error: rpcError } = await this.supabase
        .rpc('app_get_translation_tags', { p_translation_ids: batch });
      if (rpcError) throw rpcError;
      (data || []).forEach(row => results.set(row.translation_id, row.tags));
    }

    // 3) Attach tags array (objects) to each translation
    return (words || []).map(w => ({
      ...w,
      word_translations: (w.word_translations || []).map(t => ({
        ...t,
        rpc_tags: results.get(t.id) || [], // [{ value, shorthand, label, description, attribute }]
      })),
    }));
  }
}
```

Example: render optional chips on the WordCard translation rows

```jsx
// components/WordCard.js (excerpt)
import { mapOptionalTagsToChips } from '../lib/tag-display-map';

function TranslationRow({ translation }) {
  const chips = mapOptionalTagsToChips(translation.rpc_tags || []);
  return (
    <div className="flex items-stretch py-1 min-h-[32px]">
      {/* existing translation text, restriction indicators, etc. */}
      <div className="flex items-center mr-2">
        <span className="text-base text-gray-900 font-medium">
          {translation.translation}
        </span>
        {/* optional chips from RPC */}
        {chips.map(c => (
          <span key={c.key} className={c.className} title={c.title}>
            {c.label}
          </span>
        ))}
      </div>
      {/* ...rest unchanged */}
    </div>
  );
}
```

Feature flag wiring

We will introduce a simple flag so we can roll back instantly without code changes. If the flag is off, we keep using the current path and ignore the RPC output.

```js
// components/DictionaryPanel.js (excerpt)
const USE_NORMALIZED_TAGS = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true';

const loadWords = useCallback(async (term = searchTerm, currentFilters = filters) => {
  setIsLoading(true);
  try {
    const data = USE_NORMALIZED_TAGS
      ? await dictionarySystem.loadWordsNormalized(term, currentFilters)
      : await dictionarySystem.loadWordsWithTranslations(term, currentFilters);
    setWords(data);
  } finally {
    setIsLoading(false);
  }
}, [dictionarySystem, searchTerm, filters]);
```

Summary
- Mapping is centralized in one helper.
- The data layer can switch between legacy and normalized paths.
- WordCard shows small optional chips with tooltips based on the RPC.

Phase 3 – Conjugation UI (separate)
- Rebuild using `optional_tag_form` shorthand chips.

Why separate
- Conjugation has different UX goals (depth over breadth) and requires independent testing and acceptance.

Detail for this phase

The conjugation modal will fetch form‑level optional tags via a dedicated RPC or by reusing `entity_meta_values` for `optional_tag_form`. These tags will render as shorthand chips within the modal only. We will include a compact legend for form‑level tags and keep chips small to avoid visual noise.

Code sketch (future)

```sql
-- app_get_form_tags(form_ids uuid[]) -> [{ form_id, tags: [{ value, shorthand, label, description, attribute }] }]
```

```jsx
// components/ConjugationModal.js (future)
import { mapWordOptionalTagsToChips } from '../lib/tag-display-map';
// fetch and map optional_tag_form for forms in view, render as small chips
```

Phase 4 – Docs & Cleanup
- Update architecture doc sections.
- After validation/sign-off, remove obsolete docs and legacy code paths.

Why this phase
- Documentation is the shared memory of the team. Cleanup prevents confusion for future contributors.

Additional actions
- Move any view helpers created during testing to an `/admin` schema or remove them once we confirm the normalized path is stable.
- Remove any form‑translation optional tag population logic.

Summary
- We document the final contracts and UI rules.
- We remove temporary scaffolding and reduce schema noise.

Documentation clean‑up plan (exactly what changes)

We will make the v3 documents the single source of truth and retire or amend any material that still prescribes array/GIN patterns or the `optional_tags text[]` model. History is preserved by archiving; current readers see only the normalized approach.

Archive (move to `documentation/backup-archive/2025-09/`)
- `documentation/tagging and db design.md` (pre‑v3 guidance on arrays/GIN)
- `documentation/Tagging and Database Design v2.md` (prior iteration superseded by v3)
- `documentation/EPICS/002: Complete Conjugation System Architectural Rebuild/` (subsections that instruct `optional_tags` arrays or GIN on tags; archive the entire folder if all content is pre‑v3)

Update (retain file, revise content)
- `documentation/misti_audio_implementation_guide.md`: replace “tags TEXT[]” and array filtering with normalized reads via `entity_meta_values` and optional tag shorthands/description.
- `documentation/DEV_LOG.md`: add a clear editorial note where it recommends “GIN on arrays for tags,” explaining that v3 replaced arrays/GIN with normalized EMV + btree lookups; keep historic context but link to `tagging_v3_dda.md`.
- `app/admin/migration-tools/MIGRATION_ARCHITECTURE.md`: ensure examples and flows reference `meta_attributes`/`meta_values`/`entity_meta_values` and not `optional_tags` arrays.

Align and tighten (authoritative docs)
- `documentation/architecture/tagging_v3_dda.md`: confirm the “Front‑End Tag Display” and “Data Access & RPC Contracts” sections exactly match this PRD, including shorthand/description usage and the future‑proof RPC shape. Mark any view references as “admin convenience (optional)” or remove them if we decide to drop views.

Cross‑references
- Replace references to separate SQL files with “See PRD: Implementation Plan — SQL” so contracts and runnable statements live together.

Preservation
- For each archived path, include a short README noting “pre‑v3 tagging (arrays/GIN) — retained for historical reference,” with a link forward to `tagging_v3_dda.md`.

---

## 11) Testing Strategy

- RPC endpoints: unit and integration tests covering empty input, chunked input, and large sets (limit enforced).
- Display logic: snapshot/DOM tests for core chips and optional chips placement; verify de-duplication of “Primary”.
- Error cases: simulate RPC failure and missing shorthands; UI falls back to legacy behavior or raw `value` text.

Manual QA checklist (non-technical)
- Search for a word with multiple translations: confirm “Primary” shows only for the first one.
- Inspect a translation row with optional tags (e.g., “confidence-high”): chip label is “High”.
- Confirm that word-level optional tags (topics) appear as simple chips at the bottom of the word card.
- Temporarily break the RPC (simulate): the dictionary still loads (legacy path), and we see a console/log message.

---

## 12) Performance & Resilience Considerations

- RPC performance: `p_limit` guard; client chunks inputs (500–1000 IDs per call) to prevent memory issues.
- Feature flags: server or client flag allowing per-user/per-session rollout of the new path.
- Error handling: graceful degradation to current behavior on RPC failure; log and surface minimal UI impact.

Why these controls
- Limits and chunking prevent memory blow-ups when many items are requested.
- Per-user flags let us test with a small audience first.

---

## 13) Shorthand Governance

- Validation pass on shorthands to ensure readability and consistency across languages/locales.
- Process: propose → review → seed; lint rules to prevent overly cryptic labels.

Why governance matters
- Without light process, chips can become inconsistent (e.g., “Med” vs “Medium”). Governance keeps labels readable and familiar.

---

## 14) Migration Communication

- Document any optional tags that cannot cleanly map to shorthands and define a remediation (rename, merge, or hide).
- Communicate UI changes and rollout plan to stakeholders; confirm acceptance before removing legacy code/docs.

Guidance
- Share before/after screenshots of 3–5 representative words. Explain where optional tags moved and why. Include timelines and rollback plan.

---

## 15) Glossary

- Core tag: A high-importance attribute (e.g., noun gender) that gets a strong visual chip.
- Optional tag: An additional descriptor (e.g., confidence) shown as a plain text chip.
- Shorthand: A short label for an optional tag (e.g., “High”). If missing, we use the raw value.
- EMV: Entity–Metadata Values table that records “this entity has this tag value”.
- RPC: A small, read-only database function that returns the exact data the UI needs.
- EXISTS filter: A database pattern that efficiently checks “does a matching row exist?” — fast with our indexes.

---

## 16) Optional Tags Shorthand Reference and Descriptions

This section lists the optional tags we currently use most, the shorthand we will display on chips, and a short human-readable description that can appear in a tooltip or on click. It ensures anyone can understand the visible labels without reading code.

Proposed mapping (initial set)

| Attribute (level) | Value (canonical)               | Shorthand  | Description                                |
|-------------------|---------------------------------|------------|--------------------------------------------|
| optional_tag_translation | confidence-high                 | High       | High confidence assignment                  |
| optional_tag_translation | confidence-medium               | Med        | Medium confidence assignment                |
| optional_tag_translation | source-original-dictionary      | Original   | Sourced from our original dictionary        |
| optional_tag_translation | semantic-type-aesthetic-quality | Aesthetic  | Describes an aesthetic quality              |
| optional_tag_translation | semantic-type-emotional-positive| Positive   | Conveys a positive emotion                  |
| optional_tag_translation | semantic-type-general-positive  | Positive   | Carries a generally positive connotation    |
| optional_tag_translation | semantic-type-quality-assessment| Quality    | Evaluates quality or merit                  |
| optional_tag_translation | semantic-domain-family          | Family     | Vocabulary in the family domain             |
| optional_tag_translation | semantic-domain-architecture    | Architecture| Vocabulary in the architecture domain      |
| optional_tag_translation | academic_context                | Academic   | Typically used in academic contexts         |
| optional_tag_translation | technical_context               | Technical  | Typically used in technical contexts        |
| optional_tag_translation | alternative_meaning             | Alt        | Alternate or secondary meaning              |
| optional_tag_translation | verified_quality                | Verified   | Quality has been reviewed and verified      |
| optional_tag_translation | context-leaving                 | Leaving    | Used in a “leaving” social context          |
| optional_tag_translation | context-meeting-people          | Meeting    | Used in a “meeting people” context          |
| optional_tag_translation | simple_case                     | Simple     | Simple or basic usage case                  |
| optional_tag_word        | topic-place                     | Place      | Topic category: places and locations        |
| optional_tag_word        | topic-daily-life                | Daily      | Topic category: daily life                  |
| optional_tag_word        | topic-abstract                  | Abstract   | Topic category: abstract concepts           |

Notes and exclusions

We intentionally exclude “usage-primary” because the UI indicates primary via `display_priority=1`. Values like `test_translation`, `test_form_translation`, `edge_case_testing`, and `test_data` are for internal use and should not be shown to end users. Form-specific signals such as `first_person_form`, `second_person_form`, or `present_active` will be handled in the conjugation UI, not on the dictionary list.

Surfacing descriptions in the UI

Chip tooltips or click popovers will display the description text. On desktop, we prefer hover tooltips; on touch devices, a tap opens a small popover that auto-dismisses. If a description is missing, the chip still shows; we log the gap for curation.

Data source of descriptions

Descriptions live in `meta_values.description`. When we add or refine a shorthand, we also ensure the description is present and clear. This keeps the database the single source of truth and allows localization in the future.

Key points
- Short, readable labels keep optional chips scannable.
- Descriptions are shown on hover/tap, sourced from `meta_values.description`.
- Internal/test values are not shown to end users.

---

## 17) Future‑Proof RPC Output (Labels and Descriptions)

To support tooltips and future UI behaviors, our RPC should return more than a flat list of strings. Returning lightweight objects lets the UI show labels and descriptions today, and grow tomorrow without schema changes.

Plain‑language rationale

Instead of returning only text labels, we return a compact set of fields for each tag (the canonical value, its shorthand label, its readable description, and which attribute it belongs to). This allows the UI to show a tooltip now and, later on, to make layout decisions (“only show some attributes here”) without another database change.

Proposed shape

```sql
CREATE OR REPLACE FUNCTION public.app_get_translation_tags(
  p_translation_ids uuid[],
  p_limit integer DEFAULT 5000
)
RETURNS TABLE(
  translation_id uuid,
  tags jsonb  -- array of objects: [{ value, shorthand, label, description, attribute }]
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    emv.entity_id AS translation_id,
    COALESCE(
      jsonb_agg(DISTINCT jsonb_build_object(
        'value', mv.value,
        'shorthand', mv.shorthand,
        'label', COALESCE(mv.shorthand, mv.value),
        'description', mv.description,
        'attribute', ma.stable_id
      ) ORDER BY mv.value),
      '[]'::jsonb
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

Key points
- The client receives an array of small objects, not just strings.
- `label` is what we render on the chip; `description` feeds the tooltip.
- `attribute` (stable ID) enables future filtering in the UI without another schema change.
