create or replace function public.app_dictionary_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.app_validate_dictionary_entity_reference(p_entity_type text, p_entity_id uuid)
returns boolean
language plpgsql
stable
set search_path = public
as $$
begin
  if p_entity_type = 'word' then
    return exists(select 1 from public.dictionary where id = p_entity_id);
  elsif p_entity_type = 'word_translation' then
    return exists(select 1 from public.word_translations where id = p_entity_id);
  elsif p_entity_type = 'form' then
    return exists(select 1 from public.word_forms where id = p_entity_id);
  elsif p_entity_type = 'form_translation_group' then
    return exists(select 1 from public.form_translation_groups where id = p_entity_id);
  elsif p_entity_type = 'form_translation_group_link' then
    return exists(select 1 from public.form_translation_group_links where id = p_entity_id);
  elsif p_entity_type = 'etymology_document' then
    return exists(select 1 from public.etymology_documents where id = p_entity_id);
  else
    return false;
  end if;
end;
$$;

create or replace function public.app_validate_polymorphic_link()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.app_validate_dictionary_entity_reference(new.entity_type, new.entity_id) then
    raise exception 'Invalid % reference for entity_id %', new.entity_type, new.entity_id;
  end if;
  return new;
end;
$$;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  media_kind text not null check (media_kind in ('audio', 'image')),
  storage_backend text not null default 'supabase',
  storage_bucket text not null,
  object_key text not null,
  key_version text not null default 'v1',
  content_sha256 text,
  mime_type text,
  file_ext text,
  display_name text,
  voice_name text,
  generation_tool text,
  generation_type text,
  selected_bytes bigint,
  duration_seconds numeric,
  sample_rate integer,
  bit_rate integer,
  width_px integer,
  height_px integer,
  source_ref jsonb not null default '{}'::jsonb,
  legacy_source_table text,
  legacy_source_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index if not exists idx_media_assets_storage_object
  on public.media_assets (storage_backend, storage_bucket, object_key);

create unique index if not exists idx_media_assets_hash_active
  on public.media_assets (media_kind, content_sha256)
  where archived_at is null and content_sha256 is not null;

create table if not exists public.pronunciations (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  accent text,
  ipa_pronunciation text,
  phonetic_pronunciation text,
  pronunciation_source text,
  source_ref text,
  notes text,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_translation_groups (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  word_translation_id uuid not null references public.word_translations(id) on delete cascade,
  translation text not null,
  usage_notes text,
  usage_examples jsonb not null default '[]'::jsonb,
  source_file_key text,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_form_translation_groups_word_translation_id
  on public.form_translation_groups (word_translation_id);

create table if not exists public.form_translation_group_links (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  form_translation_group_id uuid not null references public.form_translation_groups(id) on delete cascade,
  form_id uuid not null references public.word_forms(id) on delete cascade,
  variant_order integer not null default 1 check (variant_order > 0),
  usage_label text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_translation_group_id, form_id)
);

create index if not exists idx_form_translation_group_links_form_id
  on public.form_translation_group_links (form_id);

create table if not exists public.pronunciation_links (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  pronunciation_id uuid not null references public.pronunciations(id) on delete cascade,
  entity_type text not null check (entity_type in ('word', 'word_translation', 'form', 'form_translation_group_link')),
  entity_id uuid not null,
  variant_order integer not null default 1 check (variant_order > 0),
  usage_label text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pronunciation_id, entity_type, entity_id, variant_order)
);

create index if not exists idx_pronunciation_links_entity
  on public.pronunciation_links (entity_type, entity_id);

create table if not exists public.media_links (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  entity_type text not null check (entity_type in ('word_translation', 'form_translation_group', 'etymology_document')),
  entity_id uuid not null,
  media_role text not null default 'attachment',
  link_order integer not null default 1 check (link_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (media_asset_id, entity_type, entity_id, media_role, link_order)
);

create index if not exists idx_media_links_entity
  on public.media_links (entity_type, entity_id);

create table if not exists public.etymology_documents (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  body_text text not null,
  etymology_source text,
  notes text,
  body_sha256 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.etymology_links (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  etymology_document_id uuid not null references public.etymology_documents(id) on delete cascade,
  entity_type text not null check (entity_type in ('word', 'word_translation')),
  entity_id uuid not null,
  link_order integer not null default 1 check (link_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (etymology_document_id, entity_type, entity_id)
);

create index if not exists idx_etymology_links_entity
  on public.etymology_links (entity_type, entity_id);

drop trigger if exists trg_media_assets_set_updated_at on public.media_assets;
create trigger trg_media_assets_set_updated_at
before update on public.media_assets
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_pronunciations_set_updated_at on public.pronunciations;
create trigger trg_pronunciations_set_updated_at
before update on public.pronunciations
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_form_translation_groups_set_updated_at on public.form_translation_groups;
create trigger trg_form_translation_groups_set_updated_at
before update on public.form_translation_groups
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_form_translation_group_links_set_updated_at on public.form_translation_group_links;
create trigger trg_form_translation_group_links_set_updated_at
before update on public.form_translation_group_links
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_pronunciation_links_set_updated_at on public.pronunciation_links;
create trigger trg_pronunciation_links_set_updated_at
before update on public.pronunciation_links
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_media_links_set_updated_at on public.media_links;
create trigger trg_media_links_set_updated_at
before update on public.media_links
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_etymology_documents_set_updated_at on public.etymology_documents;
create trigger trg_etymology_documents_set_updated_at
before update on public.etymology_documents
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_etymology_links_set_updated_at on public.etymology_links;
create trigger trg_etymology_links_set_updated_at
before update on public.etymology_links
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_pronunciation_links_validate_entity on public.pronunciation_links;
create trigger trg_pronunciation_links_validate_entity
before insert or update on public.pronunciation_links
for each row
execute function public.app_validate_polymorphic_link();

drop trigger if exists trg_media_links_validate_entity on public.media_links;
create trigger trg_media_links_validate_entity
before insert or update on public.media_links
for each row
execute function public.app_validate_polymorphic_link();

drop trigger if exists trg_etymology_links_validate_entity on public.etymology_links;
create trigger trg_etymology_links_validate_entity
before insert or update on public.etymology_links
for each row
execute function public.app_validate_polymorphic_link();

insert into public.media_assets (
  id,
  external_id,
  media_kind,
  storage_backend,
  storage_bucket,
  object_key,
  key_version,
  file_ext,
  display_name,
  voice_name,
  generation_tool,
  generation_type,
  selected_bytes,
  duration_seconds,
  sample_rate,
  bit_rate,
  source_ref,
  legacy_source_table,
  legacy_source_id,
  created_at,
  updated_at
)
select
  wam.id,
  'legacy:wam:' || replace(wam.id::text, '-', ''),
  'audio',
  'supabase',
  'audio-files',
  wam.audio_filename,
  'legacy',
  nullif(split_part(wam.audio_filename, '.', array_length(regexp_split_to_array(wam.audio_filename, '\.'), 1)), ''),
  wam.audio_filename,
  wam.azure_voice_name,
  wam.generation_method,
  wam.variant_type,
  wam.file_size_bytes,
  wam.duration_seconds,
  wam.sample_rate,
  wam.bit_rate,
  jsonb_build_object(
    'source_table', wam.source_table,
    'source_id', wam.source_id,
    'azure_request_id', wam.azure_request_id,
    'voice_consistency_group', wam.voice_consistency_group
  ),
  'word_audio_metadata',
  wam.id,
  coalesce(wam.created_at, now()),
  coalesce(wam.updated_at, wam.created_at, now())
from public.word_audio_metadata wam
where wam.audio_filename is not null
  and btrim(wam.audio_filename) <> ''
on conflict (id) do update
set
  object_key = excluded.object_key,
  voice_name = excluded.voice_name,
  generation_tool = excluded.generation_tool,
  generation_type = excluded.generation_type,
  selected_bytes = excluded.selected_bytes,
  duration_seconds = excluded.duration_seconds,
  sample_rate = excluded.sample_rate,
  bit_rate = excluded.bit_rate,
  updated_at = excluded.updated_at;

with pronunciation_sources as (
  select
    'word'::text as entity_type,
    d.id as entity_id,
    null::text as accent,
    nullif(btrim(d.ipa_pronunciation), '') as ipa_pronunciation,
    nullif(btrim(d.phonetic_pronunciation), '') as phonetic_pronunciation,
    'legacy-dictionary'::text as pronunciation_source,
    ('dictionary:' || d.id::text) as source_ref,
    null::text as notes,
    (
      select wam.id
      from public.word_audio_metadata wam
      where wam.word_id = d.id
        and wam.audio_filename is not null
        and btrim(wam.audio_filename) <> ''
      order by wam.generated_at desc nulls last, wam.created_at desc nulls last
      limit 1
    ) as media_asset_id
  from public.dictionary d
  where nullif(btrim(d.ipa_pronunciation), '') is not null
     or nullif(btrim(d.phonetic_pronunciation), '') is not null
     or exists (
       select 1
       from public.word_audio_metadata wam
       where wam.word_id = d.id
         and wam.audio_filename is not null
         and btrim(wam.audio_filename) <> ''
     )
  union all
  select
    'form'::text as entity_type,
    wf.id as entity_id,
    null::text as accent,
    nullif(btrim(wf.ipa_pronunciation), '') as ipa_pronunciation,
    nullif(btrim(wf.phonetic_pronunciation), '') as phonetic_pronunciation,
    'legacy-word-form'::text as pronunciation_source,
    ('word_form:' || wf.id::text) as source_ref,
    null::text as notes,
    wf.audio_metadata_id as media_asset_id
  from public.word_forms wf
  where nullif(btrim(wf.ipa_pronunciation), '') is not null
     or nullif(btrim(wf.phonetic_pronunciation), '') is not null
     or wf.audio_metadata_id is not null
),
pronunciation_keys as (
  select
    ps.*,
    md5(
      coalesce(ps.accent, '') || '|' ||
      coalesce(ps.ipa_pronunciation, '') || '|' ||
      coalesce(ps.phonetic_pronunciation, '') || '|' ||
      coalesce(ps.media_asset_id::text, '')
    ) as pronunciation_key
  from pronunciation_sources ps
),
insert_pronunciations as (
  insert into public.pronunciations (
    external_id,
    accent,
    ipa_pronunciation,
    phonetic_pronunciation,
    pronunciation_source,
    source_ref,
    notes,
    media_asset_id,
    created_at,
    updated_at
  )
  select
    'legacy:pron:' || pronunciation_key,
    accent,
    ipa_pronunciation,
    phonetic_pronunciation,
    min(pronunciation_source),
    min(source_ref),
    min(notes),
    media_asset_id,
    now(),
    now()
  from pronunciation_keys
  group by pronunciation_key, accent, ipa_pronunciation, phonetic_pronunciation, media_asset_id
  on conflict (external_id) do nothing
  returning id
)
insert into public.pronunciation_links (
  external_id,
  pronunciation_id,
  entity_type,
  entity_id,
  variant_order,
  usage_label,
  note,
  created_at,
  updated_at
)
select
  'legacy:plink:' || pk.entity_type || ':' || replace(pk.entity_id::text, '-', '') || ':' || pk.pronunciation_key,
  p.id,
  pk.entity_type,
  pk.entity_id,
  1,
  null,
  null,
  now(),
  now()
from pronunciation_keys pk
join public.pronunciations p
  on p.external_id = 'legacy:pron:' || pk.pronunciation_key
on conflict (external_id) do nothing;

with grouped_form_translations as (
  select
    ft.word_translation_id,
    ft.translation,
    coalesce(ft.usage_examples, '[]'::jsonb) as usage_examples,
    min(ft.created_at) as created_at,
    max(ft.updated_at) as updated_at,
    md5(
      ft.word_translation_id::text || '|' ||
      ft.translation || '|' ||
      coalesce(ft.usage_examples, '[]'::jsonb)::text
    ) as ftg_key
  from public.form_translations ft
  group by ft.word_translation_id, ft.translation, coalesce(ft.usage_examples, '[]'::jsonb)
)
insert into public.form_translation_groups (
  external_id,
  word_translation_id,
  translation,
  usage_notes,
  usage_examples,
  provenance,
  created_at,
  updated_at
)
select
  'legacy:ftg:' || gft.ftg_key,
  gft.word_translation_id,
  gft.translation,
  null,
  gft.usage_examples,
  jsonb_build_object('origin', 'form_translations_backfill'),
  coalesce(gft.created_at, now()),
  coalesce(gft.updated_at, gft.created_at, now())
from grouped_form_translations gft
on conflict (external_id) do update
set
  usage_examples = excluded.usage_examples,
  updated_at = excluded.updated_at;

insert into public.form_translation_group_links (
  id,
  external_id,
  form_translation_group_id,
  form_id,
  variant_order,
  usage_label,
  note,
  created_at,
  updated_at
)
select
  ft.id,
  'legacy:ftgl:' || replace(ft.id::text, '-', ''),
  ftg.id,
  ft.form_id,
  1,
  null,
  null,
  coalesce(ft.created_at, now()),
  coalesce(ft.updated_at, ft.created_at, now())
from public.form_translations ft
join public.form_translation_groups ftg
  on ftg.external_id = 'legacy:ftg:' || md5(
    ft.word_translation_id::text || '|' ||
    ft.translation || '|' ||
    coalesce(ft.usage_examples, '[]'::jsonb)::text
  )
on conflict (id) do update
set
  form_translation_group_id = excluded.form_translation_group_id,
  form_id = excluded.form_id,
  updated_at = excluded.updated_at;

insert into public.etymology_documents (
  external_id,
  body_text,
  etymology_source,
  notes,
  body_sha256,
  created_at,
  updated_at
)
select
  'legacy:ety:' || replace(d.id::text, '-', ''),
  d.etymology,
  'dictionary_column',
  null,
  md5(d.etymology),
  coalesce(d.created_at, now()),
  coalesce(d.updated_at, d.created_at, now())
from public.dictionary d
where d.etymology is not null
  and btrim(d.etymology) <> ''
on conflict (external_id) do update
set
  body_text = excluded.body_text,
  body_sha256 = excluded.body_sha256,
  updated_at = excluded.updated_at;

insert into public.etymology_links (
  external_id,
  etymology_document_id,
  entity_type,
  entity_id,
  link_order,
  created_at,
  updated_at
)
select
  'legacy:etylink:' || replace(d.id::text, '-', ''),
  ed.id,
  'word',
  d.id,
  1,
  coalesce(d.created_at, now()),
  coalesce(d.updated_at, d.created_at, now())
from public.dictionary d
join public.etymology_documents ed
  on ed.external_id = 'legacy:ety:' || replace(d.id::text, '-', '')
where d.etymology is not null
  and btrim(d.etymology) <> ''
on conflict (external_id) do update
set
  etymology_document_id = excluded.etymology_document_id,
  updated_at = excluded.updated_at;

create table if not exists public.entity_meta_values_orphan_archive_20260314
as
select *
from public.entity_meta_values
where false;

insert into public.entity_meta_values_orphan_archive_20260314
select emv.*
from public.entity_meta_values emv
where (
    emv.entity_type = 'word'
    and not exists (select 1 from public.dictionary d where d.id = emv.entity_id)
  ) or (
    emv.entity_type = 'form'
    and not exists (select 1 from public.word_forms wf where wf.id = emv.entity_id)
  ) or (
    emv.entity_type = 'word_translation'
    and not exists (select 1 from public.word_translations wt where wt.id = emv.entity_id)
  ) or (
    emv.entity_type = 'translation_synonym'
    and not exists (select 1 from public.translation_synonyms ts where ts.id = emv.entity_id)
  );

delete from public.entity_meta_values emv
where (
    emv.entity_type = 'word'
    and not exists (select 1 from public.dictionary d where d.id = emv.entity_id)
  ) or (
    emv.entity_type = 'form'
    and not exists (select 1 from public.word_forms wf where wf.id = emv.entity_id)
  ) or (
    emv.entity_type = 'word_translation'
    and not exists (select 1 from public.word_translations wt where wt.id = emv.entity_id)
  ) or (
    emv.entity_type = 'translation_synonym'
    and not exists (select 1 from public.translation_synonyms ts where ts.id = emv.entity_id)
  );

create or replace view public.vw_pronunciation_links_resolved as
select
  pl.id as pronunciation_link_id,
  pl.external_id as pronunciation_link_external_id,
  pl.entity_type,
  pl.entity_id,
  pl.variant_order,
  pl.usage_label,
  pl.note,
  p.id as pronunciation_id,
  p.external_id as pronunciation_external_id,
  p.accent,
  p.ipa_pronunciation,
  p.phonetic_pronunciation,
  p.pronunciation_source,
  p.source_ref,
  p.notes as pronunciation_notes,
  ma.id as media_asset_id,
  ma.object_key as audio_filename,
  ma.storage_bucket,
  ma.voice_name,
  ma.key_version
from public.pronunciation_links pl
join public.pronunciations p on p.id = pl.pronunciation_id
left join public.media_assets ma
  on ma.id = p.media_asset_id
 and ma.media_kind = 'audio'
 and ma.archived_at is null;

create or replace view public.vw_form_translation_assignments as
select
  ftgl.id,
  ftgl.external_id,
  ftgl.form_id,
  ftg.id as form_translation_group_id,
  ftg.word_translation_id,
  ftg.translation,
  ftg.usage_notes,
  ftg.usage_examples,
  'canonical-ftg'::text as assignment_method,
  1.0::numeric as confidence_score,
  ftgl.variant_order,
  ftgl.usage_label,
  ftgl.note,
  ftgl.created_at,
  ftgl.updated_at
from public.form_translation_group_links ftgl
join public.form_translation_groups ftg
  on ftg.id = ftgl.form_translation_group_id;

create or replace function public.app_entity_core_tags_json(p_entity_type text, p_entity_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attribute_id', ma.id,
        'attribute_stable_id', ma.stable_id,
        'attribute_display_name', coalesce(ma.display_name, ma.name),
        'value_id', mv.id,
        'value_stable_id', mv.stable_id,
        'value_label', mv.value,
        'value_shorthand', mv.shorthand,
        'value_description', mv.description
      )
      order by ma.stable_id, mv.sort_order nulls last, mv.value
    ),
    '[]'::jsonb
  )
  from public.entity_meta_values emv
  join public.meta_values mv on mv.id = emv.value_id
  join public.meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = p_entity_type
    and emv.entity_id = p_entity_id
    and ma.stable_id not like 'metaattr_opt_tag_%';
$$;

create or replace function public.app_entity_optional_tags_json(p_entity_type text, p_entity_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attribute_id', ma.id,
        'attribute_stable_id', ma.stable_id,
        'attribute_display_name', coalesce(ma.display_name, ma.name),
        'value_id', mv.id,
        'value_stable_id', mv.stable_id,
        'value_label', mv.value,
        'value_shorthand', mv.shorthand,
        'value_description', mv.description
      )
      order by ma.stable_id, mv.sort_order nulls last, mv.value
    ),
    '[]'::jsonb
  )
  from public.entity_meta_values emv
  join public.meta_values mv on mv.id = emv.value_id
  join public.meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = p_entity_type
    and emv.entity_id = p_entity_id
    and ma.stable_id like 'metaattr_opt_tag_%';
$$;

create or replace function public.app_translation_context_json(p_word_translation_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'auxiliary', (
        select mv.value
        from public.entity_meta_values emv
        join public.meta_values mv on mv.id = emv.value_id
        join public.meta_attributes ma on ma.id = mv.attribute_id
        where emv.entity_type = 'word_translation'
          and emv.entity_id = p_word_translation_id
          and ma.stable_id = 'metaattr002'
        order by mv.sort_order nulls last, mv.value
        limit 1
      ),
      'number_restriction', (
        select mv.value
        from public.entity_meta_values emv
        join public.meta_values mv on mv.id = emv.value_id
        join public.meta_attributes ma on ma.id = mv.attribute_id
        where emv.entity_type = 'word_translation'
          and emv.entity_id = p_word_translation_id
          and ma.stable_id = 'metaattr013'
        order by mv.sort_order nulls last, mv.value
        limit 1
      ),
      'register', (
        select mv.value
        from public.entity_meta_values emv
        join public.meta_values mv on mv.id = emv.value_id
        join public.meta_attributes ma on ma.id = mv.attribute_id
        where emv.entity_type = 'word_translation'
          and emv.entity_id = p_word_translation_id
          and ma.stable_id = 'metaattr018'
        order by mv.sort_order nulls last, mv.value
        limit 1
      ),
      'transitivity', (
        select mv.value
        from public.entity_meta_values emv
        join public.meta_values mv on mv.id = emv.value_id
        join public.meta_attributes ma on ma.id = mv.attribute_id
        where emv.entity_type = 'word_translation'
          and emv.entity_id = p_word_translation_id
          and ma.stable_id = 'metaattr020'
        order by mv.sort_order nulls last, mv.value
        limit 1
      ),
      'reflexive_type', (
        select mv.value
        from public.entity_meta_values emv
        join public.meta_values mv on mv.id = emv.value_id
        join public.meta_attributes ma on ma.id = mv.attribute_id
        where emv.entity_type = 'word_translation'
          and emv.entity_id = p_word_translation_id
          and ma.stable_id = 'metaattr021'
        order by mv.sort_order nulls last, mv.value
        limit 1
      )
    )
  );
$$;

create or replace function public.app_get_word_bundle(p_word_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'word',
    jsonb_build_object(
      'id', d.id,
      'italian', d.italian,
      'word_type', d.word_type,
      'word_core_tags', public.app_entity_core_tags_json('word', d.id),
      'word_optional_tags', public.app_entity_optional_tags_json('word', d.id),
      'primary_pronunciation_link_id', wp.pronunciation_link_id,
      'primary_pronunciation_id', wp.pronunciation_id,
      'primary_audio_asset_id', wp.media_asset_id,
      'primary_audio_bucket', wp.storage_bucket,
      'primary_audio_object_key', wp.audio_filename,
      'primary_audio_voice_name', wp.voice_name,
      'primary_ipa', coalesce(wp.ipa_pronunciation, d.ipa_pronunciation),
      'primary_phonetic', coalesce(wp.phonetic_pronunciation, d.phonetic_pronunciation)
    ),
    'translations',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', wt.id,
          'translation', wt.translation,
          'display_priority', wt.display_priority,
          'usage_notes', wt.usage_notes,
          'frequency_estimate', wt.frequency_estimate,
          'core_tags', public.app_entity_core_tags_json('word_translation', wt.id),
          'optional_tags', public.app_entity_optional_tags_json('word_translation', wt.id),
          'context_metadata', public.app_translation_context_json(wt.id),
          'synonyms', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', ts.id,
                'synonym', ts.synonym,
                'usage_notes', ts.usage_notes,
                'display_order', ts.display_order,
                'core_tags', public.app_entity_core_tags_json('translation_synonym', ts.id),
                'optional_tags', public.app_entity_optional_tags_json('translation_synonym', ts.id)
              )
              order by ts.display_order, ts.created_at, ts.id
            )
            from public.translation_synonyms ts
            where ts.word_translation_id = wt.id
          ), '[]'::jsonb)
        )
        order by wt.display_priority, wt.created_at, wt.id
      )
      from public.word_translations wt
      where wt.word_id = d.id
    ), '[]'::jsonb),
    'forms',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', wf.id,
          'form_text', wf.form_text,
          'form_type', wf.form_type,
          'core_tags', public.app_entity_core_tags_json('form', wf.id),
          'optional_tags', public.app_entity_optional_tags_json('form', wf.id),
          'primary_pronunciation_link_id', fp.pronunciation_link_id,
          'primary_pronunciation_id', fp.pronunciation_id,
          'primary_audio_asset_id', fp.media_asset_id,
          'primary_audio_bucket', fp.storage_bucket,
          'primary_audio_object_key', fp.audio_filename,
          'primary_audio_voice_name', fp.voice_name,
          'primary_ipa', coalesce(fp.ipa_pronunciation, wf.ipa_pronunciation),
          'primary_phonetic', coalesce(fp.phonetic_pronunciation, wf.phonetic_pronunciation)
        )
        order by wf.form_text, wf.id
      )
      from public.word_forms wf
      left join lateral (
        select *
        from public.vw_pronunciation_links_resolved vpr
        where vpr.entity_type = 'form'
          and vpr.entity_id = wf.id
        order by vpr.variant_order, vpr.pronunciation_link_id
        limit 1
      ) fp on true
      where wf.word_id = d.id
    ), '[]'::jsonb),
    'form_translation_groups',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ftg.id,
          'external_id', ftg.external_id,
          'word_translation_id', ftg.word_translation_id,
          'translation', ftg.translation,
          'usage_notes', ftg.usage_notes,
          'usage_examples', ftg.usage_examples,
          'links', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', ftgl.id,
                'external_id', ftgl.external_id,
                'form_id', ftgl.form_id,
                'variant_order', ftgl.variant_order,
                'usage_label', ftgl.usage_label,
                'note', ftgl.note
              )
              order by ftgl.variant_order, ftgl.id
            )
            from public.form_translation_group_links ftgl
            where ftgl.form_translation_group_id = ftg.id
          ), '[]'::jsonb)
        )
        order by ftg.translation, ftg.id
      )
      from public.form_translation_groups ftg
      join public.word_translations wt on wt.id = ftg.word_translation_id
      where wt.word_id = d.id
    ), '[]'::jsonb),
    'pronunciation_links',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', vpr.pronunciation_link_id,
          'external_id', vpr.pronunciation_link_external_id,
          'entity_type', vpr.entity_type,
          'entity_id', vpr.entity_id,
          'variant_order', vpr.variant_order,
          'usage_label', vpr.usage_label,
          'note', vpr.note,
          'pronunciation_id', vpr.pronunciation_id,
          'media_asset_id', vpr.media_asset_id,
          'accent', vpr.accent,
          'ipa_pronunciation', vpr.ipa_pronunciation,
          'phonetic_pronunciation', vpr.phonetic_pronunciation,
          'storage_bucket', vpr.storage_bucket,
          'audio_filename', vpr.audio_filename,
          'voice_name', vpr.voice_name,
          'key_version', vpr.key_version
        )
        order by vpr.entity_type, vpr.entity_id, vpr.variant_order, vpr.pronunciation_link_id
      )
      from public.vw_pronunciation_links_resolved vpr
      where (vpr.entity_type = 'word' and vpr.entity_id = d.id)
         or (vpr.entity_type = 'word_translation' and exists (
              select 1
              from public.word_translations wt
              where wt.id = vpr.entity_id
                and wt.word_id = d.id
            ))
         or (vpr.entity_type = 'form' and exists (
              select 1
              from public.word_forms wf
              where wf.id = vpr.entity_id
                and wf.word_id = d.id
            ))
         or (vpr.entity_type = 'form_translation_group_link' and exists (
              select 1
              from public.form_translation_group_links ftgl
              join public.form_translation_groups ftg
                on ftg.id = ftgl.form_translation_group_id
              join public.word_translations wt
                on wt.id = ftg.word_translation_id
              where ftgl.id = vpr.entity_id
                and wt.word_id = d.id
            ))
    ), '[]'::jsonb),
    'pronunciations',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'external_id', p.external_id,
          'accent', p.accent,
          'ipa_pronunciation', p.ipa_pronunciation,
          'phonetic_pronunciation', p.phonetic_pronunciation,
          'pronunciation_source', p.pronunciation_source,
          'source_ref', p.source_ref,
          'notes', p.notes,
          'media_asset_id', p.media_asset_id
        )
        order by p.id
      )
      from (
        select distinct
          vpr.pronunciation_id as id,
          vpr.pronunciation_external_id as external_id,
          vpr.accent,
          vpr.ipa_pronunciation,
          vpr.phonetic_pronunciation,
          vpr.pronunciation_source,
          vpr.source_ref,
          vpr.pronunciation_notes as notes,
          vpr.media_asset_id
        from public.vw_pronunciation_links_resolved vpr
        where (vpr.entity_type = 'word' and vpr.entity_id = d.id)
           or (vpr.entity_type = 'word_translation' and exists (
                select 1
                from public.word_translations wt
                where wt.id = vpr.entity_id
                  and wt.word_id = d.id
              ))
           or (vpr.entity_type = 'form' and exists (
                select 1
                from public.word_forms wf
                where wf.id = vpr.entity_id
                  and wf.word_id = d.id
              ))
           or (vpr.entity_type = 'form_translation_group_link' and exists (
                select 1
                from public.form_translation_group_links ftgl
                join public.form_translation_groups ftg
                  on ftg.id = ftgl.form_translation_group_id
                join public.word_translations wt
                  on wt.id = ftg.word_translation_id
                where ftgl.id = vpr.entity_id
                  and wt.word_id = d.id
              ))
      ) p
    ), '[]'::jsonb),
    'media_assets',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ma.id,
          'external_id', ma.external_id,
          'media_kind', ma.media_kind,
          'storage_backend', ma.storage_backend,
          'storage_bucket', ma.storage_bucket,
          'object_key', ma.object_key,
          'key_version', ma.key_version,
          'content_sha256', ma.content_sha256,
          'mime_type', ma.mime_type,
          'file_ext', ma.file_ext,
          'display_name', ma.display_name,
          'voice_name', ma.voice_name,
          'generation_tool', ma.generation_tool,
          'generation_type', ma.generation_type,
          'selected_bytes', ma.selected_bytes,
          'duration_seconds', ma.duration_seconds,
          'sample_rate', ma.sample_rate,
          'bit_rate', ma.bit_rate,
          'width_px', ma.width_px,
          'height_px', ma.height_px
        )
        order by ma.media_kind, ma.id
      )
      from (
        select distinct ma.*
        from public.media_assets ma
        where ma.id in (
          select vpr.media_asset_id
          from public.vw_pronunciation_links_resolved vpr
          where vpr.media_asset_id is not null
            and (
              (vpr.entity_type = 'word' and vpr.entity_id = d.id)
              or (vpr.entity_type = 'word_translation' and exists (
                    select 1
                    from public.word_translations wt
                    where wt.id = vpr.entity_id
                      and wt.word_id = d.id
                  ))
              or (vpr.entity_type = 'form' and exists (
                    select 1
                    from public.word_forms wf
                    where wf.id = vpr.entity_id
                      and wf.word_id = d.id
                  ))
              or (vpr.entity_type = 'form_translation_group_link' and exists (
                    select 1
                    from public.form_translation_group_links ftgl
                    join public.form_translation_groups ftg
                      on ftg.id = ftgl.form_translation_group_id
                    join public.word_translations wt
                      on wt.id = ftg.word_translation_id
                    where ftgl.id = vpr.entity_id
                      and wt.word_id = d.id
                  ))
            )
          union
          select ml.media_asset_id
          from public.media_links ml
          where (ml.entity_type = 'word_translation' and exists (
                  select 1
                  from public.word_translations wt
                  where wt.id = ml.entity_id
                    and wt.word_id = d.id
                ))
             or (ml.entity_type = 'form_translation_group' and exists (
                  select 1
                  from public.form_translation_groups ftg
                  join public.word_translations wt
                    on wt.id = ftg.word_translation_id
                  where ftg.id = ml.entity_id
                    and wt.word_id = d.id
                ))
             or (ml.entity_type = 'etymology_document' and exists (
                  select 1
                  from public.etymology_links el
                  where el.etymology_document_id = ml.entity_id
                    and (
                      (el.entity_type = 'word' and el.entity_id = d.id)
                      or (
                        el.entity_type = 'word_translation'
                        and exists (
                          select 1
                          from public.word_translations wt
                          where wt.id = el.entity_id
                            and wt.word_id = d.id
                        )
                      )
                    )
                ))
        )
      ) ma
    ), '[]'::jsonb),
    'media_links',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ml.id,
          'external_id', ml.external_id,
          'media_asset_id', ml.media_asset_id,
          'entity_type', ml.entity_type,
          'entity_id', ml.entity_id,
          'media_role', ml.media_role,
          'link_order', ml.link_order
        )
        order by ml.entity_type, ml.entity_id, ml.link_order, ml.id
      )
      from public.media_links ml
      where (ml.entity_type = 'word_translation' and exists (
              select 1
              from public.word_translations wt
              where wt.id = ml.entity_id
                and wt.word_id = d.id
            ))
         or (ml.entity_type = 'form_translation_group' and exists (
              select 1
              from public.form_translation_groups ftg
              join public.word_translations wt
                on wt.id = ftg.word_translation_id
              where ftg.id = ml.entity_id
                and wt.word_id = d.id
            ))
         or (ml.entity_type = 'etymology_document' and exists (
              select 1
              from public.etymology_links el
              where el.etymology_document_id = ml.entity_id
                and (
                  (el.entity_type = 'word' and el.entity_id = d.id)
                  or (
                    el.entity_type = 'word_translation'
                    and exists (
                      select 1
                      from public.word_translations wt
                      where wt.id = el.entity_id
                        and wt.word_id = d.id
                    )
                  )
                )
            ))
    ), '[]'::jsonb),
    'etymologies',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'link_id', el.id,
          'link_external_id', el.external_id,
          'entity_type', el.entity_type,
          'entity_id', el.entity_id,
          'link_order', el.link_order,
          'id', ed.id,
          'external_id', ed.external_id,
          'body_text', ed.body_text,
          'etymology_source', ed.etymology_source,
          'notes', ed.notes
        )
        order by el.link_order, ed.created_at, ed.id
      )
      from public.etymology_links el
      join public.etymology_documents ed on ed.id = el.etymology_document_id
      where el.entity_type = 'word'
        and el.entity_id = d.id
    ), '[]'::jsonb)
  )
  from public.dictionary d
  left join lateral (
    select *
    from public.vw_pronunciation_links_resolved vpr
    where vpr.entity_type = 'word'
      and vpr.entity_id = d.id
    order by vpr.variant_order, vpr.pronunciation_link_id
    limit 1
  ) wp on true
  where d.id = p_word_id;
$$;

drop function if exists public.app_get_dictionary_listing(
  text,
  text[],
  jsonb,
  uuid[],
  integer,
  integer,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
);

create or replace function public.app_get_dictionary_listing(
  q text default null,
  word_types text[] default null,
  filters jsonb default null,
  word_ids uuid[] default null,
  limit_count integer default 20,
  offset_count integer default 0,
  include_word_core boolean default true,
  include_word_optional boolean default false,
  include_translation_core boolean default true,
  include_translation_optional boolean default false,
  include_forms boolean default false,
  include_form_core boolean default false,
  include_form_optional boolean default false,
  include_audio boolean default false,
  include_form_translations boolean default false
) returns table(
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
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with filter_ids as (
    select d.id
    from public.dictionary d
    where (
      filters is null or jsonb_typeof(filters) <> 'array' or not exists (
        select 1
        from jsonb_array_elements(filters) as f(obj)
        where not exists (
          select 1
          from public.meta_attributes ma
          where ma.stable_id = (f.obj ->> 'attribute')
            and exists (
              select 1
              from public.entity_meta_values emv
              join public.meta_values mv on mv.id = emv.value_id
              where emv.entity_type = 'word'
                and emv.entity_id = d.id
                and mv.attribute_id = ma.id
                and (
                  mv.stable_id = any (array(select jsonb_array_elements_text(f.obj -> 'values')))
                  or mv.value = any (array(select jsonb_array_elements_text(f.obj -> 'values')))
                )
            )
        )
      )
    )
  ),
  base_candidates as (
    select d.id, d.italian, d.word_type
    from public.dictionary d
    where (
      word_ids is not null and d.id = any(word_ids)
    ) or (
      word_ids is null
      and (q is null or d.italian ilike (q || '%'))
      and (word_types is null or array_length(word_types, 1) is null or lower(d.word_type) = any(select lower(unnest(word_types))))
      and (
        filters is null or jsonb_typeof(filters) <> 'array' or d.id in (select id from filter_ids)
      )
    )
  ),
  limited_words as (
    select *
    from base_candidates
    order by italian asc, id asc
    limit least(greatest(coalesce(limit_count, 20), 1), 100)
    offset greatest(coalesce(offset_count, 0), 0)
  ),
  words_with_count as (
    select lw.*, (count(*) over ())::integer as total_count
    from limited_words lw
  )
  select
    w.id as word_id,
    w.italian,
    w.word_type,
    (
      select jsonb_build_object(
        'id', wt.id,
        'translation', wt.translation,
        'display_priority', wt.display_priority,
        'usage_notes', wt.usage_notes
      )
      from public.word_translations wt
      where wt.word_id = w.id
      order by wt.display_priority, wt.created_at, wt.id
      limit 1
    ) as primary_translation,
    case when include_audio then jsonb_build_object(
      'pronunciation_link_id', wp.pronunciation_link_id,
      'pronunciation_id', wp.pronunciation_id,
      'accent', wp.accent,
      'ipa_pronunciation', coalesce(wp.ipa_pronunciation, d.ipa_pronunciation),
      'phonetic_pronunciation', coalesce(wp.phonetic_pronunciation, d.phonetic_pronunciation)
    ) else null end as primary_pronunciation,
    case when include_audio and wp.media_asset_id is not null then jsonb_build_object(
      'id', wp.media_asset_id,
      'storage_bucket', wp.storage_bucket,
      'object_key', wp.audio_filename,
      'voice_name', wp.voice_name,
      'key_version', wp.key_version
    ) else null end as primary_media,
    case when include_word_core then public.app_entity_core_tags_json('word', w.id) else null end as word_core_tags,
    case when include_word_optional then public.app_entity_optional_tags_json('word', w.id) else null end as word_optional_tags,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', wt.id,
          'translation', wt.translation,
          'display_priority', wt.display_priority,
          'is_primary', (wt.display_priority = 1),
          'usage_notes', wt.usage_notes,
          'core_tags', case when include_translation_core then public.app_entity_core_tags_json('word_translation', wt.id) else null end,
          'optional_tags', case when include_translation_optional then public.app_entity_optional_tags_json('word_translation', wt.id) else null end
        )
        order by wt.display_priority, wt.created_at, wt.id
      )
      from public.word_translations wt
      where wt.word_id = w.id
    ), '[]'::jsonb) as translations,
    case when include_forms then coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', wf.id,
          'form_text', wf.form_text,
          'form_type', wf.form_type,
          'core_tags', case when include_form_core then public.app_entity_core_tags_json('form', wf.id) else '[]'::jsonb end,
          'optional_tags', case when include_form_optional then public.app_entity_optional_tags_json('form', wf.id) else '[]'::jsonb end,
          'primary_pronunciation', case when include_audio then jsonb_build_object(
            'pronunciation_link_id', fp.pronunciation_link_id,
            'pronunciation_id', fp.pronunciation_id,
            'accent', fp.accent,
            'ipa_pronunciation', coalesce(fp.ipa_pronunciation, wf.ipa_pronunciation),
            'phonetic_pronunciation', coalesce(fp.phonetic_pronunciation, wf.phonetic_pronunciation)
          ) else null end,
          'primary_media', case when include_audio and fp.media_asset_id is not null then jsonb_build_object(
            'id', fp.media_asset_id,
            'storage_bucket', fp.storage_bucket,
            'object_key', fp.audio_filename,
            'voice_name', fp.voice_name,
            'key_version', fp.key_version
          ) else null end
        )
        order by wf.form_text, wf.id
      )
      from public.word_forms wf
      left join lateral (
        select *
        from public.vw_pronunciation_links_resolved vpr
        where vpr.entity_type = 'form'
          and vpr.entity_id = wf.id
        order by vpr.variant_order, vpr.pronunciation_link_id
        limit 1
      ) fp on true
      where wf.word_id = w.id
    ), '[]'::jsonb) else '[]'::jsonb end as forms,
    w.total_count
  from words_with_count w
  join public.dictionary d on d.id = w.id
  left join lateral (
    select *
    from public.vw_pronunciation_links_resolved vpr
    where vpr.entity_type = 'word'
      and vpr.entity_id = w.id
    order by vpr.variant_order, vpr.pronunciation_link_id
    limit 1
  ) wp on true
  order by w.italian asc, w.id asc;
end;
$$;
