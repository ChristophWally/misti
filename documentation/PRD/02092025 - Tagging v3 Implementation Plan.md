# 02092025 - Tagging v3 Implementation Plan

Status: Draft v1

Owner: Engineering

Related Architecture: documentation/architecture/tagging_v3_dda.md

---

## 1) Summary

Implement a simplified, free‑tier‑friendly tagging system that:
- Reuses existing `meta_attributes`, `meta_values`, and `metaval_rules`.
- Introduces a single polymorphic assignment table `entity_meta_values`.
- Models optional tags as `meta_values` under three new optional‑tag attributes (word | form | translation).
- Adds an optional `word_meta_derived` table with a manual refresh function for propagation.
- Migrates legacy `optional_tags` arrays and legacy metadata into normalized assignments.
- Switches application reads to EXISTS filters; arrays are used only for detail views if desired.

---

## 2) Goals & Non‑Goals

Goals
- Reduce storage consumption and avoid GIN/MVs on Supabase Free (500 MB cap).
- Keep schema changes additive first; allow safe rollback before cleanup.
- Maintain query performance with compact btree indexes and EXISTS filters.
- Provide a clear, testable migration and validation pathway.

Non‑Goals
- Full text search or advanced indexing beyond equality lookups.
- Synchronous write‑time propagation or complex trigger logic.
- Introducing new registries for optional tags (we reuse meta tables).

---

## 3) Scope

In Scope
- New meta_attributes (3 rows): optional_tag_word, optional_tag_form, optional_tag_translation.
- New tables: `entity_meta_values` (required), `word_meta_derived` (optional but recommended).
- Backfill of legacy arrays from:
  - `form_translations.optional_tags` (largest win),
  - `word_translations.optional_tags`,
  - `word_forms.optional_tags`,
  - `dictionary.optional_tags`.
- Optional backfill of legacy metadata into assignments (by `meta_values.stable_id`).
- Switching application list queries to EXISTS against `entity_meta_values`.
- Cleanup of legacy array/JSONB tag fields + heavy indexes after soak period.

Out of Scope
- Per‑user tagging and RLS (future iteration).
- Text search or MVs (unless necessary later and budget allows).

---

## 4) Dependencies & Assumptions

Dependencies
- Existing `meta_attributes` and `meta_values` are authoritative; `stable_id` values reflect current taxonomy.
- Application can be updated to read via EXISTS filters or thin views.

Assumptions
- Optional tags are acceptable as `meta_values` under optional_tag_* attributes.
- Propagation rules are encoded in `meta_attributes.propagation_rule` or `metaval_rules`.
- No need to retain legacy arrays once the new reads are validated.

---

## 5) Rollout Plan (Phases)

Phase 0 — Baseline Measurement (Read‑only)
- Capture current sizes:
  - `select 'dictionary' t, pg_size_pretty(pg_total_relation_size('dictionary'));`
  - `select 'word_forms' t, pg_size_pretty(pg_total_relation_size('word_forms'));`
  - `select 'word_translations' t, pg_size_pretty(pg_total_relation_size('word_translations'));`
  - `select 'form_translations' t, pg_size_pretty(pg_total_relation_size('form_translations'));`
- Count rows with non‑empty optional_tags:
  - Verified via MCP: dictionary(5), word_forms(8), word_translations(22), form_translations(864).

Phase 1 — Additive DDL (Safe to run any time)
- Insert 3 meta_attributes:
  - `optional_tag_word (source_level='word', propagation_rule='COMBINE', stable_id='metaattr_opt_tag_word')`
  - `optional_tag_form (source_level='form', propagation_rule='COMBINE', stable_id='metaattr_opt_tag_form')`
  - `optional_tag_translation (source_level='translation', propagation_rule='COMBINE', stable_id='metaattr_opt_tag_translation')`
- Create `entity_meta_values` with btree indexes and level‑check trigger.
- (Optional) Create `word_meta_derived` and indexes.

Phase 2 — Backfill (Largest win first)
- For `form_translations.optional_tags`:
  - Upsert `meta_values` rows for each distinct tag under `optional_tag_translation`.
  - Insert `entity_meta_values('form_translation', ft.id, meta_value_id)` for each tag.
- For `word_translations.optional_tags` → `optional_tag_translation`.
- For `word_forms.optional_tags` → `optional_tag_form`.
- For `dictionary.optional_tags` → `optional_tag_word`.
- Optional: Backfill core metadata by mapping legacy keys to `meta_values.stable_id` into `entity_meta_values` for appropriate entity_type.

Phase 3 — Read Cutover
- Update list endpoints to use EXISTS filters on `entity_meta_values` joins.
- Add detail view (optional) for arrays if the UI prefers aggregated IDs.
- Verify correctness with validation queries (see §7).

Phase 4 — Cleanup & Reclaim
- Drop legacy arrays/JSONB columns used solely for tagging and remove any GIN indexes on arrays/JSONB no longer needed.
- Run `VACUUM FULL` on affected tables to reclaim disk.
- Re‑measure sizes and log improvements.

Phase 5 — Optional Propagation
- Implement and run `refresh_word_propagation()` to populate `word_meta_derived` using `propagation_rule` semantics.
- Trigger manually after bulk updates; avoid write‑time triggers on Free tier.

---

## 6) DDL / DML (Sketches)

New meta_attributes (3 rows)
```sql
insert into meta_attributes (id, name, source_level, display_level, propagation_rule, stable_id)
values
  (gen_random_uuid(), 'optional_tag_word', 'word', 'word', 'COMBINE', 'metaattr_opt_tag_word'),
  (gen_random_uuid(), 'optional_tag_form', 'form', 'form', 'COMBINE', 'metaattr_opt_tag_form'),
  (gen_random_uuid(), 'optional_tag_translation', 'translation', 'translation', 'COMBINE', 'metaattr_opt_tag_translation')
on conflict do nothing;
```

Assignment table
```sql
create table if not exists entity_meta_values (
  entity_type text not null check (entity_type in ('word','form','word_translation','form_translation')),
  entity_id uuid not null,
  value_id uuid not null references meta_values(id),
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (entity_type, entity_id, value_id)
);

create index if not exists idx_emv_entity on entity_meta_values (entity_type, entity_id);
create index if not exists idx_emv_value  on entity_meta_values (value_id);
create index if not exists idx_emv_lookup on entity_meta_values (entity_type, value_id);
```

Level‑check trigger (pseudocode)
```sql
/*
create function ensure_emv_level() returns trigger as $$
declare v_level text; begin
  select a.source_level into v_level
  from meta_values v join meta_attributes a on a.id = v.attribute_id
  where v.id = new.value_id;

  if (new.entity_type = 'word' and v_level not in ('word','any')) or
     (new.entity_type = 'form' and v_level not in ('form','any')) or
     (new.entity_type in ('word_translation','form_translation') and v_level not in ('translation','any')) then
    raise exception 'value % not allowed for entity_type %', new.value_id, new.entity_type;
  end if;
  return new;
end; $$ language plpgsql;

create trigger trg_emv_level
before insert on entity_meta_values
for each row execute function ensure_emv_level();
*/
```

Derived table (optional)
```sql
create table if not exists word_meta_derived (
  word_id  uuid not null references dictionary(id) on delete cascade,
  value_id uuid not null references meta_values(id) on delete cascade,
  derived_from text not null default 'forms',
  updated_at timestamptz not null default now(),
  primary key (word_id, value_id)
);

create index if not exists idx_wmd_word  on word_meta_derived (word_id);
create index if not exists idx_wmd_value on word_meta_derived (value_id);
```

Propagation refresh (sketch)
```sql
/*
create or replace function refresh_word_propagation(p_word_id uuid default null)
returns void as $$
begin
  delete from word_meta_derived w
  where p_word_id is null or w.word_id = p_word_id;

  -- ANY_IRREGULAR example
  insert into word_meta_derived (word_id, value_id, derived_from)
  select distinct wf.word_id, emv.value_id, 'forms'
  from entity_meta_values emv
  join word_forms wf on wf.id = emv.entity_id
  join meta_values mv on mv.id = emv.value_id
  join meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form'
    and (p_word_id is null or wf.word_id = p_word_id)
    and ma.propagation_rule = 'ANY_IRREGULAR'
    and mv.stable_id = 'metaval_irregular'
  on conflict do nothing;

  -- COMBINE example
  insert into word_meta_derived (word_id, value_id, derived_from)
  select distinct wf.word_id, emv.value_id, 'forms'
  from entity_meta_values emv
  join word_forms wf on wf.id = emv.entity_id
  join meta_values mv on mv.id = emv.value_id
  join meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form'
    and (p_word_id is null or wf.word_id = p_word_id)
    and ma.propagation_rule = 'COMBINE'
  on conflict do nothing;
end; $$ language plpgsql;
*/
```

Backfill: form_translations.optional_tags (largest set)
```sql
-- 1) Ensure optional_tag_translation attribute exists; fetch its id if needed
-- 2) Upsert meta_values for each distinct tag name under that attribute
-- 3) Assign to entities
insert into entity_meta_values (entity_type, entity_id, value_id)
select 'form_translation', ft.id, mv.id
from form_translations ft
cross join lateral unnest(ft.optional_tags) as tag_name
join meta_values mv on mv.value = tag_name
-- and mv.attribute_id = (select id from meta_attributes where stable_id='metaattr_opt_tag_translation')
on conflict do nothing;
```

Equivalent backfills (smaller sets)
```sql
-- word_translations.optional_tags → entity_type='word_translation'
-- word_forms.optional_tags        → entity_type='form'
-- dictionary.optional_tags        → entity_type='word'
```

---

## 7) Validation & QA

Structural checks
- Level guard trigger rejects invalid assignments (entity_type vs source_level).
- PK `(entity_type, entity_id, value_id)` prevents duplicates.

Functional checks
- Counts by entity should match or exceed legacy counts (allowing for de‑duplication):
  - For each table, compare number of distinct (entity, tag) in legacy arrays vs new `entity_meta_values` assignments.
- Spot‑check a sample of entities to confirm assigned values/tags match legacy arrays.
- Verify read queries:
  - EXISTS filters return same result sets as legacy array filters for a few core predicates.

Size checks
- Re‑measure table and index sizes post‑backfill and post‑cleanup.
- Expect reduction driven by removal of GIN on arrays/JSONB and elimination of repeated strings.

---

## 8) Rollback Plan

Before cleanup:
- The migration is additive — switch application reads back to legacy fields if issues arise.
- Drop `entity_meta_values` and `word_meta_derived` only after confirming rollback.

After cleanup:
- If legacy fields are dropped, rollback involves restoring from backup (Free plan lacks PITR). Plan changes cautiously and validate thoroughly before destructive steps.

---

## 9) Risks & Mitigations

- Free Tier read‑only risk: Keep an eye on database size; avoid MVs/GIN. Reclaim space with `VACUUM FULL` post‑cleanup.
- Migration correctness: Validate counts and samples before cutover; proceed in small batches (start with form_translations only).
- Operational load: No write‑time triggers; propagation is manual/async only.
- Data quality: Enforce level guard trigger; use stable_ids for deterministic mapping.

---

## 10) Acceptance Criteria

- Assignment table created; level guard operational.
- Optional tags from all four tables assigned into `entity_meta_values`.
- List queries switched to EXISTS and verified for correctness/performance.
- Legacy arrays/GIN removed after soak; disk usage demonstrably reduced.
- (If enabled) `word_meta_derived` populated via manual refresh and verified on sample words.

---

## 11) Runbook (Ops)

- Schedule: off‑peak window for backfill and cutover; stagger by table.
- Communication: announce read‑only UI windows if any; though reads remain available.
- Monitoring: track Postgres CPU/IO (Supabase Reports), and db size before/after.
- Contingency: halt after each table’s backfill if validation fails; rollback reads to legacy.

---

## 12) References

- Architecture: documentation/architecture/tagging_v3_dda.md
- Supabase Free Plan considerations: https://supabase.com/docs/guides/platform/database-size
