# Tagging v3 — Detailed Design Architecture (DDA)

Status: Draft v1

Owner: Engineering

Last updated: 2025-09-01

---

## 1) TL;DR (Explain Like I’m 5)

- Think of every word, form, and translation as a toy box.
- “Core tags” are official stickers from the factory. They change how the toy is used.
- “Optional tags” are stickers anyone can add for organization.
- Instead of gluing stickers directly on the boxes, we keep a neat notebook of which box has which sticker.
- When you need toys with a certain sticker, we look it up in the notebook fast.
- This way the boxes stay small and tidy, and looking things up stays fast even when we have a huge number of boxes.

What this means in database terms:
- No arrays/JSONB of tags stored in the main tables → smaller rows and fewer heavy indexes.
- Compact “assignment” tables connect words/forms/translations to tag/value IDs with tiny btree indexes.
- Simple views give the app a single, clean read surface.
- Propagation rules automatically “pass up” important tags from forms to words (e.g., irregular form → irregular word).

---

## 2) Goals and Non‑Goals

Goals
- Lowest disk footprint for tagging and metadata at scale (>100k forms).
- Clean, efficient code: one straightforward read surface for the app.
- Accurate data quality with enforced constraints and deterministic propagation.

Non‑Goals
- Keeping legacy array/JSONB shapes identical. We can return different shapes if the app gets simpler and faster.
- Indexing normal views directly. If that’s ever needed, use a materialized view (MV); otherwise index the base/link tables.

---

## 3) Current Context (Why change?)

Observed in the current project:
- Core tables (dictionary, word_forms, word_translations, form_translations) are small, but their indexes (especially GIN on JSONB/arrays) are a big portion of total size.
- Backups are much smaller largely because they don’t have indexes.
- Arrays (`text[]`) and JSONB (`metadata`) add TOAST overhead and encourage GIN indexes, which are heavy on disk.

Design motivation:
- Normalize tag/meta assignments to keep base rows small.
- Replace GIN on arrays/JSONB with compact btrees on IDs.
- Precompute “rollups” (propagation) where it simplifies reads and avoids heavy on‑the‑fly aggregation.

---

## 4) Design Principles

- Normalize assignments: Store relationships (owner ↔ value/tag) in slim link tables.
- Index only what you filter: btree on small keys; avoid GIN unless text search is required.
- Single read surface: Provide one view per entity level (word/form/translation) so app code stays simple.
- Propagate once, read many: Implement deterministic rollups (derived values) for attributes that bubble up.
- Keep names separate from IDs: strings live in reference tables; assignments store stable IDs only.

---

## 5) Data Model Overview

### 5.1 ER Diagram (ASCII)

Reference data

    [meta_attributes] 1 ──< [meta_values]
         (id, propagation_rule, source_level)

Core entity backbone

    [dictionary] 1 ──< [word_forms] 1 ──< [form_translations]
        (id)            (id, word_id)         (id, form_id, word_translation_id)
           └─< [word_translations]
                 (id, word_id)

Core assignments (explicit)

    [dictionary] 1 ──< [word_meta_values]        >── 1 [meta_values]
    [word_forms] 1 ──< [form_meta_values]        >── 1 [meta_values]
    [word_translations] 1 ──< [translation_meta_values] >── 1 [meta_values]

Core rollups (derived from children)

    [dictionary] 1 ──< [word_meta_derived]       >── 1 [meta_values]

Optional tags (shared registry)

    [tag_reference]
        (tag_name PK, category, applies_to, ...)

    [dictionary] 1 ──< [dictionary_optional_tags]   >── 1 [tag_reference]
    [word_forms] 1 ──< [form_optional_tags]         >── 1 [tag_reference]
    [word_translations] 1 ──< [translation_optional_tags] >── 1 [tag_reference]

App read surfaces (views)

    [vw_dictionary_v2]       [vw_word_forms_v2]       [vw_word_translations_v2]

Notes
- We use three assignment tables for strict foreign keys (data quality). A single polymorphic table is possible but loses per‑row FK checks.
- `word_meta_derived` stores propagation results so reads don’t recompute at scale.

---

## 6) Table Specifications (Proposed)

This section lists the new/adjusted tables and minimal indexes. All indexes are btree.

### 6.1 Core Meta Assignments

word_meta_values

```sql
create table if not exists public.word_meta_values (
  word_id  uuid not null references public.dictionary(id) on delete cascade,
  value_id uuid not null references public.meta_values(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (word_id, value_id)
);

create index if not exists idx_word_meta_values_value on public.word_meta_values (value_id);
create index if not exists idx_word_meta_values_word on public.word_meta_values (word_id);
```

form_meta_values

```sql
create table if not exists public.form_meta_values (
  form_id  uuid not null references public.word_forms(id) on delete cascade,
  value_id uuid not null references public.meta_values(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (form_id, value_id)
);

create index if not exists idx_form_meta_values_value on public.form_meta_values (value_id);
create index if not exists idx_form_meta_values_form on public.form_meta_values (form_id);
```

translation_meta_values

```sql
create table if not exists public.translation_meta_values (
  word_translation_id uuid not null references public.word_translations(id) on delete cascade,
  value_id            uuid not null references public.meta_values(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (word_translation_id, value_id)
);

create index if not exists idx_translation_meta_values_value on public.translation_meta_values (value_id);
create index if not exists idx_translation_meta_values_tr on public.translation_meta_values (word_translation_id);
```

Level validation (data quality)

```sql
-- Pseudocode: ensure value_id is allowed at this level
-- (uses meta_values.attribute_id → meta_attributes.source_level IN ('word'|'form'|'translation'|'any'))
/*
create function public.ensure_level_match_word() returns trigger as $$
begin
  if not exists (
    select 1 from public.meta_values v
    join public.meta_attributes a on a.id = v.attribute_id
    where v.id = new.value_id
      and (a.source_level in ('word','any'))
  ) then
    raise exception 'value_id % not allowed at word level', new.value_id;
  end if;
  return new;
end; $$ language plpgsql;

create trigger trg_word_meta_values_level
before insert or update on public.word_meta_values
for each row execute function public.ensure_level_match_word();
*/
```

### 6.2 Core Meta Rollups (Propagation)

word_meta_derived

```sql
create table if not exists public.word_meta_derived (
  word_id  uuid not null references public.dictionary(id) on delete cascade,
  value_id uuid not null references public.meta_values(id) on delete cascade,
  derived_from text not null default 'forms',
  updated_at timestamptz not null default now(),
  primary key (word_id, value_id)
);

create index if not exists idx_word_meta_derived_value on public.word_meta_derived (value_id);
create index if not exists idx_word_meta_derived_word on public.word_meta_derived (word_id);
```

Propagation overview
- Read `meta_attributes.propagation_rule` to decide how to roll values from forms/translations up to the word.
- Recommended rules already in your schema: e.g., `ANY_IRREGULAR`, `COMBINE`, `MAJORITY`, etc.

Trigger sketch (ANY_IRREGULAR and COMBINE)

```sql
/*
create function public.recompute_word_rollups(p_word_id uuid) returns void as $$
declare
  rec record;
begin
  -- Example: ANY_IRREGULAR for attribute "regularity"
  -- 1) find the specific meta_values.id for 'irregular' under the regularity attribute
  -- 2) if any form of this word has that value, ensure it exists in word_meta_derived; else remove it.

  -- Example: COMBINE (union distinct child values for selected attributes)
  -- 1) for each attribute with COMBINE, compute distinct child value_ids across forms
  -- 2) upsert rows for those value_ids in word_meta_derived and delete no‑longer present ones.

  update public.word_meta_derived set updated_at = now() where word_id = p_word_id; -- marker
  -- Actual implementation will join: word_forms → form_meta_values → meta_values → meta_attributes
end; $$ language plpgsql;

create function public.after_form_meta_change() returns trigger as $$
declare
  v_word uuid;
begin
  select f.word_id into v_word from public.word_forms f where f.id = coalesce(new.form_id, old.form_id);
  perform public.recompute_word_rollups(v_word);
  return coalesce(new, old);
end; $$ language plpgsql;

create trigger trg_form_meta_values_rollup_aiud
after insert or update or delete on public.form_meta_values
for each row execute function public.after_form_meta_change();
*/
```

Notes
- Exact propagation logic will reference your `meta_attributes.propagation_rule` values and, if applicable, `metaval_rules` to translate/derive values.
- We recommend implementing per‑attribute handlers in SQL or plpgsql for clarity and testability.

### 6.3 Optional Tags (Shared Registry)

We reuse `public.tag_reference` as the tag registry (current PK = `tag_name`).

Pros: no migration for registry, simple joins.

Optional improvement: add a surrogate `id int` PK to shrink indexes a bit; keep `tag_name` unique. See Appendix A.

dictionary_optional_tags

```sql
create table if not exists public.dictionary_optional_tags (
  word_id uuid not null references public.dictionary(id) on delete cascade,
  tag_name text not null references public.tag_reference(tag_name) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (word_id, tag_name)
);

create index if not exists idx_dict_opt_tags_tag on public.dictionary_optional_tags (tag_name);
create index if not exists idx_dict_opt_tags_word on public.dictionary_optional_tags (word_id);
```

form_optional_tags

```sql
create table if not exists public.form_optional_tags (
  form_id uuid not null references public.word_forms(id) on delete cascade,
  tag_name text not null references public.tag_reference(tag_name) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (form_id, tag_name)
);

create index if not exists idx_form_opt_tags_tag on public.form_optional_tags (tag_name);
create index if not exists idx_form_opt_tags_form on public.form_optional_tags (form_id);
```

translation_optional_tags

```sql
create table if not exists public.translation_optional_tags (
  word_translation_id uuid not null references public.word_translations(id) on delete cascade,
  tag_name text not null references public.tag_reference(tag_name) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null,
  primary key (word_translation_id, tag_name)
);

create index if not exists idx_tr_opt_tags_tag on public.translation_optional_tags (tag_name);
create index if not exists idx_tr_opt_tags_tr on public.translation_optional_tags (word_translation_id);
```

Applicability guard (data quality)

```sql
-- Pseudocode: ensure tag applies to the right level (word|form|translation)
/*
create function public.ensure_tag_applies_word() returns trigger as $$
begin
  if not exists (
    select 1 from public.tag_reference t
    where t.tag_name = new.tag_name
      and (t.applies_to is null or 'word' = any(t.applies_to))
  ) then
    raise exception 'tag % does not apply to words', new.tag_name;
  end if;
  return new;
end; $$ language plpgsql;

create trigger trg_dict_opt_tags_applies
before insert or update on public.dictionary_optional_tags
for each row execute function public.ensure_tag_applies_word();
*/
```

---

## 7) App Read Surfaces (Views)

Views keep the app code simple: one SELECT target per entity. They do not store data and therefore don’t need (and can’t have) their own indexes. The planner uses indexes on the underlying tables for filtering via EXISTS/joins.

### 7.1 vw_dictionary_v2

```sql
create or replace view public.vw_dictionary_v2 as
select
  d.*,
  coalesce(array_agg(distinct wmv.value_id) filter (where wmv.value_id is not null), '{}'::uuid[]) as core_value_ids,
  coalesce(array_agg(distinct wmd.value_id) filter (where wmd.value_id is not null), '{}'::uuid[]) as derived_value_ids,
  coalesce(array_agg(distinct dot.tag_name)   filter (where dot.tag_name is not null), '{}'::text[]) as optional_tags
from public.dictionary d
left join public.word_meta_values   wmv on wmv.word_id = d.id
left join public.word_meta_derived  wmd on wmd.word_id = d.id
left join public.dictionary_optional_tags dot on dot.word_id = d.id
group by d.id;
```

### 7.2 vw_word_forms_v2

```sql
create or replace view public.vw_word_forms_v2 as
select
  f.*,
  coalesce(array_agg(distinct fmv.value_id) filter (where fmv.value_id is not null), '{}'::uuid[]) as core_value_ids,
  coalesce(array_agg(distinct fot.tag_name) filter (where fot.tag_name is not null), '{}'::text[]) as optional_tags
from public.word_forms f
left join public.form_meta_values fmv on fmv.form_id = f.id
left join public.form_optional_tags fot on fot.form_id = f.id
group by f.id;
```

### 7.3 vw_word_translations_v2

```sql
create or replace view public.vw_word_translations_v2 as
select
  wt.*,
  coalesce(array_agg(distinct tmv.value_id) filter (where tmv.value_id is not null), '{}'::uuid[]) as core_value_ids,
  coalesce(array_agg(distinct tot.tag_name) filter (where tot.tag_name is not null), '{}'::text[]) as optional_tags
from public.word_translations wt
left join public.translation_meta_values tmv on tmv.word_translation_id = wt.id
left join public.translation_optional_tags tot on tot.word_translation_id = wt.id
group by wt.id;
```

Filtering pattern (indexes are used under the hood):

```sql
-- Words having a specific core value
select v.*
from public.vw_dictionary_v2 v
where exists (
  select 1
  from public.word_meta_values wmv
  where wmv.word_id = v.id
    and wmv.value_id = $1 -- target value_id
);

-- Forms having an optional tag
select v.*
from public.vw_word_forms_v2 v
where exists (
  select 1
  from public.form_optional_tags fot
  where fot.form_id = v.id
    and fot.tag_name = $1
);
```

Materialized view (optional): If you need to filter directly on array columns (e.g., `@>`), create an MV and add a GIN to the MV only. This trades disk for speed and is usually unnecessary when EXISTS uses small btrees efficiently.

---

## 8) Indexing Strategy (Why no GIN?)

- GIN on arrays/JSONB is bulky; it grows quickly and dominated size in the current setup.
- Assignment tables use small keys (uuid/int), so btree is compact and fast for equality lookups (the common case).
- We filter using EXISTS/joins to those assignment tables; the planner uses their btree indexes.
- If you later add real text search across large text, add a single dedicated text‑search index (tsvector GIN) on that text, not on tags/metadata.

---

## 9) Propagation Logic (Pass values back up)

Use your existing `meta_attributes.propagation_rule` semantics to maintain `word_meta_derived`.

Examples
- ANY_IRREGULAR: If any form has value “irregular” for attribute “regularity”, upsert that value on the word; remove when none remain.
- COMBINE: Union distinct child values to the word for attributes that should display combined values.
- MAJORITY: Choose the most frequent child value and reflect just that on the word.

Implementation sketch

```sql
/*
-- Recompute all rollups for a word
create function public.recompute_word_rollups(p_word_id uuid) returns void as $$
begin
  -- 1) ANY_IRREGULAR example
  --    locate attribute(s) with propagation_rule = 'ANY_IRREGULAR'
  --    check if any form under p_word_id has the irregular value_id
  --    upsert into word_meta_derived accordingly

  -- 2) COMBINE example
  --    for each applicable attribute, compute distinct child value_ids and sync word_meta_derived

  -- 3) MAJORITY example
  --    compute counts per value_id across forms; keep the max

  -- (Exact SQL will join word_forms → form_meta_values → meta_values → meta_attributes.)
end; $$ language plpgsql;
*/
```

Trigger points
- After INSERT/UPDATE/DELETE on `form_meta_values`.
- After moving forms between words (if that’s a feature).
- After changes to meta rules that affect propagation (perform a one‑time batch recompute).

---

## 10) Migration Plan (from current arrays/JSONB)

High‑level steps
1) Create new tables: `word_meta_values`, `form_meta_values`, `translation_meta_values`, `word_meta_derived`, and the three `*_optional_tags` tables.
2) Backfill core meta assignments:
   - Map existing `metadata`/arrays to `meta_values.id` (by `stable_id` or by name).
   - Insert `(owner_id, value_id)` rows into the corresponding assignment tables.
3) Backfill optional tags:
   - Map existing `tags`/`optional_tags` arrays to `tag_reference.tag_name` and insert into `*_optional_tags`.
4) Create views `vw_dictionary_v2`, `vw_word_forms_v2`, `vw_word_translations_v2`.
5) Enable level/applicability validators and propagation triggers; run a full recompute once.
6) Update app reads to use the new views (or direct joins if preferred).
7) Drop deprecated arrays/JSONB tag fields and their GIN indexes.
8) Reclaim space with `VACUUM FULL` or `pg_repack`.

Rollback strategy
- Keep the Phase 1 backups you already have until verification passes.
- Changes are additive first (create new tables/views), then switch reads, then remove old fields.

---

## 11) Storage Impact & Performance

Why this is smaller
- No repeated tag strings in base rows — tag names live once in `tag_reference`; core meta values live in `meta_values`.
- No GIN on arrays/JSONB — only compact btrees on small keys.
- Less TOAST — base entity rows lose large arrays/JSON payloads.

Performance characteristics
- Filters are equality joins (value_id/tag_name) using btree — extremely efficient and predictable at large scale.
- Views are thin aggregation layers; filters use EXISTS so the planner can leverage base indexes.
- Propagation precomputes rollups; reads don’t need to scan/aggregate children at runtime.

Scaling to 100k+ forms
- Assignment tables scale linearly with the number of relationships.
- Add selective covering indexes if a query pattern becomes hot, e.g., `(value_id, form_id)`.

---

## 12) FAQs

Q: Why not index the view arrays?
- Regular views don’t store data; there’s nothing to index. If you need indexable arrays, use a materialized view at the cost of more disk and refresh complexity.

Q: Why three assignment tables instead of one polymorphic table?
- Three tables allow strict foreign keys to the correct owner table, giving stronger data quality guarantees. A single table saves one schema object but loses per‑row FK enforcement.

Q: Do we need `word_type` as a column?
- Optional. Keeping hot, core facets as columns is fine (cheap and fast). This design also supports modeling them purely via meta values. You can add a column later if profiling shows it helps.

Q: Can we support per‑user tags?
- Yes. Add `user_id` to `*_optional_tags` (null = global), index `(user_id, tag_name)` and `(user_id, owner_id)`, and apply RLS.

---

## 13) Appendix A — Optional: integer PK for tag_reference

If you want to minimize index size further, introduce a surrogate integer primary key while keeping `tag_name` unique.

```sql
alter table public.tag_reference add column if not exists id int generated always as identity;
alter table public.tag_reference add constraint tag_reference_pkey primary key (id);
create unique index if not exists uq_tag_reference_name on public.tag_reference(tag_name);

-- Then adjust optional tag tables to reference id instead of tag_name
-- (Requires backfill + constraint swap.)
```

Trade‑off: small migration effort for slightly smaller indexes (int vs text key). The existing `tag_name` PK is acceptable if you prefer less churn now.

---

## 14) Appendix B — Example Backfill Sketches

Core meta (dictionary level) from existing metadata JSONB/arrays

```sql
-- Example: map legacy metadata keys → meta_values.id by stable_id
insert into public.word_meta_values (word_id, value_id)
select d.id, v.id
from public.dictionary d
join lateral (
  -- Extract legacy stable_ids from d.metadata or arrays
  select (jsonb_array_elements_text(coalesce(d.metadata->'core_values', '[]'::jsonb))) as stable_id
) x on true
join public.meta_values v on v.stable_id = x.stable_id
on conflict do nothing;
```

Optional tags (dictionary level) from legacy arrays

```sql
insert into public.dictionary_optional_tags (word_id, tag_name)
select d.id, unnest(d.optional_tags)
from public.dictionary d
where d.optional_tags is not null and array_length(d.optional_tags,1) > 0
on conflict do nothing;
```

Run recompute once after backfill

```sql
-- Pseudocode: for each word, recompute rollups
do $$
declare r record;
begin
  for r in select id from public.dictionary loop
    perform public.recompute_word_rollups(r.id);
  end loop;
end $$;
```

---

## 15) Appendix C — Operational Checklist

- [ ] Create assignment and rollup tables.
- [ ] Add level/applicability validators.
- [ ] Add propagation triggers and full recompute script.
- [ ] Backfill from legacy arrays/JSONB.
- [ ] Create `vw_*_v2` views; switch app reads.
- [ ] Drop legacy arrays/GIN indexes.
- [ ] Reclaim space (VACUUM FULL / pg_repack).
- [ ] Monitor query plans; add targeted indexes only if needed.
