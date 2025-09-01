# Tagging v3 — Detailed Design Architecture (DDA)

Status: Draft v2 (Free-tier friendly)

Owner: Engineering

Last updated: 2025-09-01

---

## 1) TL;DR (Explain Like I’m 5)

- Words, forms, and translations are toy boxes.
- Stickers (tags/metadata) tell us things like "irregular" or "archaic".
- Instead of gluing lots of stickers on every box, we keep a neat notebook that says which box has which sticker.
- We look up the notebook when we need to find boxes — it’s smaller, faster, and easier to change.

What this means in database terms:
- Keep base tables clean (no big arrays/JSONB fields for tags).
- Use one small assignment table to link entities → meta_values (btree indexes only).
- Optional tags are just regular meta values under dedicated "optional tag" attributes.
- Propagation (e.g., irregular form → irregular word) is computed on demand, not on every write.

---

## 2) Goals, Constraints, Trade-offs

- Goals: lowest disk usage on Supabase Free (500 MB cap), simple and testable schema/migrations, scales to 100k+ forms using compact btree indexes and EXISTS filters.
- Constraints: Free plan has no PITR/backups/branching; avoid risky migrations, materialized views, and GIN by default.
- Trade-offs: Avoid synchronous triggers and heavy derived storage to keep writes fast and storage small. Arrays in views are optional (detail only); lists filter via EXISTS.

---

## 3) Current Context (Project snapshot)

- Optional tags appear primarily on `form_translations` (864 rows), then `word_translations` (22), with fewer on `word_forms` (8) and `dictionary` (5). Migrating those arrays to normalized assignments gives the biggest size win first.
- Existing meta system: `meta_attributes`, `meta_values`, and `metaval_rules` already exist and must be reused.

---

## 4) Design Overview (Reusing Existing Tables)

- Reference data (exists):
  - `meta_attributes(id, stable_id, source_level, propagation_rule, …)`
  - `meta_values(id, attribute_id, value, stable_id, …)`
- New meta attributes (3 rows total):
  - `optional_tag_word` (source_level='word')
  - `optional_tag_form` (source_level='form')
  - `optional_tag_translation` (source_level='translation')
- Assignments (new, single table):
  - `entity_meta_values(entity_type, entity_id, value_id, created_at, created_by)`
    - `entity_type in ('word','form','word_translation','form_translation')`
    - BEFORE INSERT trigger validates `entity_type` vs `meta_attributes.source_level`.
- Propagation (new, optional):
  - `word_meta_derived(word_id, value_id, derived_from, updated_at)`
  - Manual/async recompute function `refresh_word_propagation(word_id default null)`.
- Views (app interface):
  - Lists: base tables + EXISTS filters (no arrays).
  - Details: optional array/json aggregation for convenience.

---

## 5) ER Diagram (ASCII)

Reference

    [meta_attributes] 1 ──< [meta_values]
         (id, propagation_rule, source_level)

Backbone

    [dictionary] 1 ──< [word_forms] 1 ──< [form_translations]
        (id)            (id, word_id)         (id, form_id, word_translation_id)
           └─< [word_translations]
                 (id, word_id)

Assignments (polymorphic)

    [dictionary|word_forms|word_translations|form_translations]
            └──────< [entity_meta_values] >──────┘
                              │
                              └──> [meta_values]

Derived propagation

    [dictionary] 1 ──< [word_meta_derived] >── 1 [meta_values]

---

## 6) Table Specs (Minimal & Lean)

- meta_attributes (existing): add three rows only (optional_tag_word|form|translation). No schema change.
- meta_values (existing): reuse as-is (columns: value, stable_id, attribute_id, …). Suggested btree indexes:
  - `create index if not exists idx_meta_values_attribute on meta_values(attribute_id);`
  - `create index if not exists idx_meta_values_stable on meta_values(stable_id);`

entity_meta_values (new)

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

-- Level validation (pseudocode)
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

word_meta_derived (new; optional but recommended)

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

---

## 7) Indexing Strategy (No GIN, No MVs by default)

- Equality filters use compact btrees on UUID/text keys.
- Avoid broad GIN on arrays/JSONB (largest storage cost in current setup).
- If you later add real text search, add a single tsvector GIN on that text field only (not tags/metadata).

---

## 8) Propagation (Manual/Async)

Why manual: keeps writes fast and predictable on Free; avoids write amplification.

Refresh function (sketch):

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

Batch usage:
- After bulk form updates: `select refresh_word_propagation();`
- After single word change: `select refresh_word_propagation(<word_id>);`

---

## 9) App Interface (Views & Queries)

List endpoints (no arrays required)

```sql
-- Words with a given core value (by stable_id)
select d.*
from dictionary d
where exists (
  select 1 from entity_meta_values emv
  join meta_values mv on mv.id = emv.value_id
  where emv.entity_type='word'
    and emv.entity_id=d.id
    and mv.stable_id=$1
);

-- Forms with a given value (by value_id)
select f.*
from word_forms f
where exists (
  select 1 from entity_meta_values emv
  where emv.entity_type='form' and emv.entity_id=f.id and emv.value_id=$1
);
```

Detail endpoints (optional arrays)

```sql
-- Example detail view (arrays only for convenience)
create or replace view vw_dictionary_v3_detail as
select d.*,
  coalesce(array_agg(distinct emv_core.value_id) filter (where emv_core.value_id is not null), '{}'::uuid[]) as core_value_ids,
  coalesce(array_agg(distinct wmd.value_id)      filter (where wmd.value_id is not null), '{}'::uuid[])     as derived_value_ids,
  coalesce(array_agg(distinct emv_opt.value_id)  filter (where emv_opt.value_id is not null), '{}'::uuid[]) as optional_value_ids
from dictionary d
left join entity_meta_values emv_core on emv_core.entity_type='word' and emv_core.entity_id=d.id
left join meta_values mv_core on mv_core.id=emv_core.value_id and mv_core.attribute_id not in (
  select id from meta_attributes where stable_id in ('metaattr_opt_tag_word','metaattr_opt_tag_form','metaattr_opt_tag_translation')
)
left join word_meta_derived wmd on wmd.word_id=d.id
left join entity_meta_values emv_opt on emv_opt.entity_type='word' and emv_opt.entity_id=d.id
left join meta_values mv_opt on mv_opt.id=emv_opt.value_id and mv_opt.attribute_id in (
  select id from meta_attributes where stable_id in ('metaattr_opt_tag_word','metaattr_opt_tag_form','metaattr_opt_tag_translation')
)
group by d.id;
```

Notes:
- Use base-table SELECTs + EXISTS for large lists. Only aggregate in detail endpoints or small result sets.

---

## 10) Migration Plan (Additive → Cutover → Cleanup)

Phase 0 — Measure baseline
- Capture sizes for key tables (e.g., `form_translations`, `word_forms`, `dictionary`, `word_translations`).

Phase 1 — Additive
- Insert three optional_tag meta_attributes.
- Create `entity_meta_values` (+ indexes + level-check trigger).
- Create `word_meta_derived` (optional).

Phase 2 — Backfill (largest first)
- `form_translations.optional_tags` → `meta_values` under `optional_tag_translation` → `entity_meta_values(entity_type='form_translation', entity_id=ft.id, value_id=...)`.
- Then `word_translations.optional_tags` under `optional_tag_translation`.
- Then `word_forms.optional_tags` under `optional_tag_form`.
- Then `dictionary.optional_tags` under `optional_tag_word`.
- Core meta (if needed) → map legacy metadata keys to `meta_values.stable_id` and insert appropriate `entity_type` rows.

Phase 3 — Switch reads
- Update app list queries to EXISTS on `entity_meta_values`.
- Add detail view if desired; arrays not required for lists.

Phase 4 — Cleanup
- Drop old arrays/JSONB tag fields and GIN indexes when stable.
- `VACUUM FULL` affected tables to reclaim space.

Rollback
- Since changes are additive first, you can revert reads during soak. Cleanup is last.

---

## 11) Storage & Performance Notes

- Storage: normalized assignments + btree indexes are small; migrating `form_translations.optional_tags` yields the largest savings.
- Performance: EXISTS + btree equality is predictable and efficient; avoid array @> filters on views for list endpoints.
- Free plan: keep under 500 MB by avoiding MVs/GIN and reclaiming space after cleanup.

---

## 12) Admin Workflow (Optional Tags)

- Create optional tags by inserting `meta_values` under the appropriate optional_tag_* `meta_attribute` (word/form/translation).
- Admin approval/state can be handled in your UI or with a small companion flag table keyed by `value_id` (optional).
- Assign to entities via `entity_meta_values` only.

---

## 13) Data Quality & Validation

- Level guard: BEFORE INSERT trigger on `entity_meta_values` validates `entity_type` vs `meta_attributes.source_level`.
- Uniqueness: PK `(entity_type, entity_id, value_id)` prevents duplicates.
- Cascades: FKs on `word_meta_derived` and `value_id` clean up on delete.

---

## 14) Appendix — Example SQL Sketches

Insert meta_attributes

```sql
insert into meta_attributes (id, name, source_level, display_level, propagation_rule, stable_id)
values
  (gen_random_uuid(), 'optional_tag_word', 'word', 'word', 'COMBINE', 'metaattr_opt_tag_word'),
  (gen_random_uuid(), 'optional_tag_form', 'form', 'form', 'COMBINE', 'metaattr_opt_tag_form'),
  (gen_random_uuid(), 'optional_tag_translation', 'translation', 'translation', 'COMBINE', 'metaattr_opt_tag_translation')
on conflict do nothing;
```

Backfill form_translations (optional tags)

```sql
-- Example step: entity assignments from arrays
insert into entity_meta_values (entity_type, entity_id, value_id)
select 'form_translation', ft.id, mv.id
from form_translations ft
cross join lateral unnest(ft.optional_tags) as tag_name
join meta_values mv on mv.value = tag_name
-- and mv.attribute_id = (select id from meta_attributes where stable_id='metaattr_opt_tag_translation')
on conflict do nothing;
```

List query example

```sql
select d.*
from dictionary d
where exists (
  select 1 from entity_meta_values emv
  join meta_values mv on mv.id = emv.value_id
  where emv.entity_type = 'word'
    and emv.entity_id = d.id
    and mv.stable_id = $1
);
```

---

## 15) Operational Checklist

- [ ] Insert 3 optional_tag meta_attributes.
- [ ] Create entity_meta_values (+ indexes + level guard).
- [ ] (Optional) Create word_meta_derived and refresh function.
- [ ] Backfill optional tags — start with form_translations, then others.
- [ ] Switch list queries to EXISTS on entity_meta_values.
- [ ] Add detail views if needed; avoid arrays in list views.
- [ ] Drop legacy arrays/GIN indexes after soak; VACUUM FULL.
- [ ] Track table/index sizes; iterate only as needed.

