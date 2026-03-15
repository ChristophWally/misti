create table if not exists public.publish_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_by text not null default 'review-app',
  publish_mode text not null check (publish_mode in ('single', 'batch')),
  requested_lemma_ids jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'validated', 'running', 'completed', 'failed', 'partial')),
  validation_summary jsonb not null default '{}'::jsonb,
  publish_summary jsonb not null default '{}'::jsonb,
  error_summary jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_run_items (
  id uuid primary key default gen_random_uuid(),
  publish_run_id uuid not null references public.publish_runs(id) on delete cascade,
  lemma_id uuid,
  lemma text,
  publish_mode text not null default 'single' check (publish_mode in ('single', 'batch')),
  validation_status text not null default 'pending' check (validation_status in ('pending', 'passed', 'failed')),
  publish_status text not null default 'pending' check (publish_status in ('pending', 'running', 'completed', 'failed', 'skipped')),
  validation_errors jsonb not null default '[]'::jsonb,
  publish_stats jsonb not null default '{}'::jsonb,
  rollback_snapshot jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publish_run_id, lemma_id)
);

create table if not exists public.publish_run_errors (
  id uuid primary key default gen_random_uuid(),
  publish_run_id uuid not null references public.publish_runs(id) on delete cascade,
  publish_run_item_id uuid references public.publish_run_items(id) on delete cascade,
  lemma_id uuid,
  stage text not null,
  error_code text,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_publish_run_items_run on public.publish_run_items (publish_run_id);
create index if not exists idx_publish_run_items_lemma on public.publish_run_items (lemma_id);
create index if not exists idx_publish_run_errors_run on public.publish_run_errors (publish_run_id);

alter table public.publish_runs disable row level security;
alter table public.publish_run_items disable row level security;
alter table public.publish_run_errors disable row level security;

drop trigger if exists trg_publish_runs_set_updated_at on public.publish_runs;
create trigger trg_publish_runs_set_updated_at
before update on public.publish_runs
for each row
execute function public.app_dictionary_set_updated_at();

drop trigger if exists trg_publish_run_items_set_updated_at on public.publish_run_items;
create trigger trg_publish_run_items_set_updated_at
before update on public.publish_run_items
for each row
execute function public.app_dictionary_set_updated_at();

do $$
begin
  if to_regclass('public.user_form_translation_progress_legacy_20260314') is null
     and to_regclass('public.user_form_translation_progress') is not null then
    alter table public.user_form_translation_progress
      rename to user_form_translation_progress_legacy_20260314;
  end if;
end $$;

create table if not exists public.user_form_translation_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  form_translation_group_link_id uuid not null references public.form_translation_group_links(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  difficulty_factor numeric default 2.5,
  interval_days integer default 1,
  repetitions integer default 0,
  correct_streak integer default 0,
  total_reviews integer default 0,
  correct_reviews integer default 0,
  last_reviewed timestamptz,
  next_review timestamptz,
  average_response_time numeric,
  difficulty_adjustments integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, form_translation_group_link_id, deck_id)
);

create index if not exists idx_user_ftg_link_progress_lookup
  on public.user_form_translation_progress (user_id, form_translation_group_link_id);

alter table public.user_form_translation_progress enable row level security;

drop trigger if exists trg_user_form_translation_progress_set_updated_at on public.user_form_translation_progress;
create trigger trg_user_form_translation_progress_set_updated_at
before update on public.user_form_translation_progress
for each row
execute function public.app_dictionary_set_updated_at();

create or replace view public.vw_form_translation_progress_compat as
select
  uftp.id,
  uftp.user_id,
  uftp.form_translation_group_link_id as form_translation_id,
  uftp.deck_id,
  uftp.difficulty_factor,
  uftp.interval_days,
  uftp.repetitions,
  uftp.correct_streak,
  uftp.total_reviews,
  uftp.correct_reviews,
  uftp.last_reviewed,
  uftp.next_review,
  uftp.average_response_time,
  uftp.difficulty_adjustments,
  uftp.created_at,
  uftp.updated_at
from public.user_form_translation_progress uftp;

alter table if exists public.word_forms
  drop constraint if exists word_forms_audio_metadata_id_fkey;

drop view if exists public.vw_app_words_with_high_confidence_forms;
drop view if exists public.vw_app_high_confidence_forms;
drop view if exists public.vw_app_any_confidence_forms;
drop view if exists public.vw_form_translations_detail;
drop view if exists public.word_forms_overview;
drop view if exists public.word_translations_overview;
drop view if exists public.verb_form_compliance_details;
drop view if exists public.verb_form_compliance;

do $$
begin
  if to_regclass('public.word_audio_metadata_legacy_20260314') is null
     and to_regclass('public.word_audio_metadata') is not null then
    alter table public.word_audio_metadata rename to word_audio_metadata_legacy_20260314;
  end if;
end $$;

do $$
begin
  if to_regclass('public.form_translations_legacy_20260314') is null
     and to_regclass('public.form_translations') is not null then
    alter table public.form_translations rename to form_translations_legacy_20260314;
  end if;
end $$;

create or replace view public.form_translations as
select
  vfta.id,
  vfta.form_id,
  vfta.word_translation_id,
  vfta.translation,
  coalesce(vfta.usage_examples, '[]'::jsonb) as usage_examples,
  vfta.assignment_method,
  vfta.confidence_score,
  vfta.created_at,
  vfta.updated_at
from public.vw_form_translation_assignments vfta;

create or replace view public.word_audio_metadata as
select
  vpr.pronunciation_link_id as id,
  case
    when vpr.entity_type = 'word' then vpr.entity_id
    when vpr.entity_type = 'form' then wf.word_id
    else null::uuid
  end as word_id,
  vpr.voice_name as azure_voice_name,
  vpr.audio_filename,
  ma.selected_bytes::integer as file_size_bytes,
  ma.duration_seconds,
  vpr.pronunciation_source as generation_method,
  pl.created_at,
  0::integer as play_count,
  null::timestamptz as last_played_at,
  null::integer as quality_rating,
  false as needs_regeneration,
  null::text as regeneration_reason,
  null::integer as character_count,
  null::text as azure_request_id,
  pl.created_at as generated_at,
  pl.updated_at,
  case
    when vpr.entity_type = 'word' then 'dictionary'
    when vpr.entity_type = 'form' then 'word_forms'
    else 'dictionary'
  end as source_table,
  vpr.entity_id as source_id,
  null::uuid as voice_consistency_group,
  null::text as ssml_used,
  '{}'::jsonb as prosody_adjustments,
  ma.sample_rate,
  ma.bit_rate,
  null::timestamptz as last_verified,
  case
    when vpr.entity_type = 'word' then 'base-word'
    when vpr.entity_type = 'form' then 'form-only'
    else 'base-word'
  end as variant_type
from public.vw_pronunciation_links_resolved vpr
join public.pronunciation_links pl
  on pl.id = vpr.pronunciation_link_id
left join public.word_forms wf
  on vpr.entity_type = 'form'
 and wf.id = vpr.entity_id
left join public.media_assets ma
  on ma.id = vpr.media_asset_id
where vpr.entity_type in ('word', 'form');

create or replace view public.vw_form_translations_detail as
select
  ft.id,
  ft.form_id,
  ft.word_translation_id,
  ft.translation,
  ft.usage_examples,
  ft.assignment_method,
  ft.confidence_score,
  ft.created_at,
  ft.updated_at,
  null::jsonb as metadata,
  coalesce(array_agg(mv.value order by mv.value) filter (where mv.value is not null), '{}'::text[]) as metadata_tags,
  coalesce(array_agg(distinct emv.propagation_method) filter (where emv.propagation_method is not null), '{}'::text[]) as propagation_methods
from public.form_translations ft
left join public.entity_meta_values emv
  on emv.entity_type = 'form_translation'
 and emv.entity_id = ft.id
 and emv.derived_from is null
left join public.meta_values mv
  on mv.id = emv.value_id
left join public.meta_attributes ma
  on ma.id = mv.attribute_id
 and ma.stable_id = 'metaattr_opt_tag_translation'
group by ft.id, ft.form_id, ft.word_translation_id, ft.translation, ft.usage_examples, ft.assignment_method, ft.confidence_score, ft.created_at, ft.updated_at;

create or replace view public.vw_app_any_confidence_forms as
select
  ft.id,
  ft.form_id,
  ft.word_translation_id,
  ft.translation,
  ft.usage_examples,
  ft.assignment_method,
  ft.confidence_score,
  ft.created_at,
  ft.updated_at,
  null::jsonb as metadata
from public.form_translations ft
where exists (
  select 1
  from public.entity_meta_values emv
  join public.meta_values mv on mv.id = emv.value_id
  join public.meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form_translation'
    and emv.entity_id = ft.id
    and mv.value = any(array['confidence-high', 'confidence-medium', 'confidence-low'])
    and ma.stable_id = 'metaattr_opt_tag_translation'
);

create or replace view public.vw_app_high_confidence_forms as
select
  ft.id,
  ft.form_id,
  ft.word_translation_id,
  ft.translation,
  ft.usage_examples,
  ft.assignment_method,
  ft.confidence_score,
  ft.created_at,
  ft.updated_at,
  null::jsonb as metadata
from public.form_translations ft
where exists (
  select 1
  from public.entity_meta_values emv
  join public.meta_values mv on mv.id = emv.value_id
  join public.meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form_translation'
    and emv.entity_id = ft.id
    and mv.value = 'confidence-high'
    and ma.stable_id = 'metaattr_opt_tag_translation'
);

create or replace view public.vw_app_words_with_high_confidence_forms as
select
  d.id,
  d.italian,
  d.word_type,
  count(ft.id) as high_confidence_form_count
from public.dictionary d
join public.word_forms wf on wf.word_id = d.id
join public.form_translations ft on ft.form_id = wf.id
where exists (
  select 1
  from public.entity_meta_values emv
  join public.meta_values mv on mv.id = emv.value_id
  join public.meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form_translation'
    and emv.entity_id = ft.id
    and mv.value = 'confidence-high'
    and ma.stable_id = 'metaattr_opt_tag_translation'
)
group by d.id, d.italian, d.word_type;

create or replace view public.word_forms_overview as
select
  wf.id as form_id,
  wf.word_id,
  d.italian as word_text,
  d.word_type,
  wf.form_text,
  wf.form_type,
  wf.phonetic_pronunciation,
  wf.ipa_pronunciation,
  array(
    select ma.name || ': ' || mv.value
    from public.entity_meta_values emv
    join public.meta_values mv on emv.value_id = mv.id
    join public.meta_attributes ma on mv.attribute_id = ma.id
    where emv.entity_type = 'form'
      and emv.entity_id = wf.id
    order by ma.name
  ) as form_tags,
  array(
    select wt.translation
    from public.word_translations wt
    where wt.word_id = d.id
    order by wt.display_priority
  ) as word_translations,
  (
    select count(*)
    from public.word_translations wt
    where wt.word_id = d.id
  ) as word_translations_count,
  array(
    select ft.translation
    from public.form_translations ft
    where ft.form_id = wf.id
    order by ft.translation
  ) as form_translations,
  (
    select count(*)
    from public.form_translations ft
    where ft.form_id = wf.id
  ) as form_translations_count
from public.word_forms wf
join public.dictionary d on wf.word_id = d.id
order by d.italian, wf.form_type;

create or replace view public.word_translations_overview as
select
  d.id as word_id,
  d.italian as word_text,
  d.word_type,
  wt.id as translation_id,
  wt.translation,
  wt.display_priority,
  wt.usage_notes,
  array(
    select ma.name || ': ' || mv.value
    from public.entity_meta_values emv
    join public.meta_values mv on emv.value_id = mv.id
    join public.meta_attributes ma on mv.attribute_id = ma.id
    where emv.entity_type = 'word_translation'
      and emv.entity_id = wt.id
    order by ma.name
  ) as translation_tags,
  array(
    select jsonb_build_object(
      'synonym', ts.synonym,
      'usage_notes', ts.usage_notes,
      'display_order', ts.display_order,
      'metadata', (
        select jsonb_agg(jsonb_build_object('attribute', ma.name, 'value', mv.value))
        from public.entity_meta_values emv
        join public.meta_values mv on emv.value_id = mv.id
        join public.meta_attributes ma on mv.attribute_id = ma.id
        where emv.entity_type = 'translation_synonym'
          and emv.entity_id = ts.id
      )
    )
    from public.translation_synonyms ts
    where ts.word_translation_id = wt.id
    order by ts.display_order
  ) as synonyms,
  (
    select count(*)
    from public.translation_synonyms ts
    where ts.word_translation_id = wt.id
  ) as synonym_count,
  (
    select count(distinct wf.id)
    from public.word_forms wf
    where wf.word_id = d.id
  ) as word_forms_count,
  (
    select count(*)
    from public.form_translations ft
    join public.word_forms wf on ft.form_id = wf.id
    where wf.word_id = d.id
  ) as form_translations_count,
  (
    select count(distinct ft.form_id)
    from public.form_translations ft
    where ft.word_translation_id = wt.id
  ) as linked_form_count
from public.word_translations wt
join public.dictionary d on wt.word_id = d.id
order by d.italian, wt.display_priority;

create or replace view public.verb_form_compliance as
with translation_metadata as (
  select
    wt.word_id,
    wt.id as translation_id,
    wt.translation,
    wt.display_priority,
    coalesce(restriction_mv.value, 'none') as restriction_type,
    aux_mv.value as auxiliary_type,
    case
      when aux_mv.value is not null then coalesce(restriction_mv.value, 'none') || ' (' || aux_mv.value || ')'
      else coalesce(restriction_mv.value, 'none')
    end as restriction_display
  from public.word_translations wt
  left join public.entity_meta_values restriction_emv
    on wt.id = restriction_emv.entity_id
   and restriction_emv.entity_type = 'word_translation'
   and restriction_emv.attribute_id = (select id from public.meta_attributes where name = 'word_restriction')
  left join public.meta_values restriction_mv on restriction_emv.value_id = restriction_mv.id
  left join public.entity_meta_values aux_emv
    on wt.id = aux_emv.entity_id
   and aux_emv.entity_type = 'word_translation'
   and aux_emv.attribute_id = (select id from public.meta_attributes where name = 'auxiliary')
  left join public.meta_values aux_mv on aux_emv.value_id = aux_mv.id
  where exists (
    select 1
    from public.dictionary d
    where d.id = wt.word_id
      and d.word_type = 'verb'
  )
), auxiliary_summary as (
  select
    tm.word_id,
    count(distinct tm.auxiliary_type) filter (where tm.auxiliary_type is not null) as auxiliary_count,
    coalesce(string_agg(distinct tm.auxiliary_type, ', ' order by tm.auxiliary_type) filter (where tm.auxiliary_type is not null), 'none') as auxiliary_types_list,
    coalesce(string_agg(distinct tm.restriction_display, ', ' order by tm.restriction_display), 'none') as restriction_summary
  from translation_metadata tm
  group by tm.word_id
), form_specs as (
  select *
  from (values
    ('simple','indicativo','presente',true,false,false),
    ('simple','indicativo','imperfetto',true,false,false),
    ('simple','indicativo','passato-remoto',true,false,false),
    ('simple','indicativo','futuro-semplice',true,false,false),
    ('simple','congiuntivo','congiuntivo-presente',true,false,false),
    ('simple','congiuntivo','congiuntivo-imperfetto',true,false,false),
    ('simple','condizionale','condizionale-presente',true,false,false),
    ('simple','imperativo','imperativo-presente',true,true,false),
    ('simple','infinito','infinito-presente',false,false,false),
    ('simple','participio','participio-presente',false,false,false),
    ('simple','participio','participio-passato',false,false,false),
    ('simple','gerundio','gerundio-presente',false,false,false),
    ('compound','indicativo','passato-prossimo',true,false,true),
    ('compound','indicativo','trapassato-prossimo',true,false,true),
    ('compound','indicativo','futuro-anteriore',true,false,true),
    ('compound','indicativo','trapassato-remoto',true,false,true),
    ('compound','congiuntivo','congiuntivo-passato',true,false,true),
    ('compound','congiuntivo','congiuntivo-trapassato',true,false,true),
    ('compound','condizionale','condizionale-passato',true,false,true),
    ('compound','imperativo','imperativo-passato',true,true,true),
    ('compound','infinito','infinito-passato',false,false,true),
    ('compound','gerundio','gerundio-passato',false,false,true),
    ('progressive','indicativo','presente-progressivo',true,false,false),
    ('progressive','indicativo','passato-progressivo',true,false,false),
    ('progressive','indicativo','futuro-progressivo',true,false,false),
    ('progressive','congiuntivo','congiuntivo-presente-progressivo',true,false,false),
    ('progressive','condizionale','condizionale-presente-progressivo',true,false,false)
  ) as fs(form_type, mood, tense, applies_to_persons, is_imperative, requires_auxiliary)
), person_codes as (
  select * from (values
    ('1sg', false),
    ('2sg', false),
    ('3sg', false),
    ('1pl', false),
    ('2pl', false),
    ('3pl', false),
    ('nonfinite', true)
  ) as pc(person_code, is_nonfinite)
), forms as (
  select fs.form_type, fs.mood, fs.tense, pc.person_code, fs.requires_auxiliary, fs.is_imperative
  from form_specs fs
  join person_codes pc on fs.applies_to_persons and pc.is_nonfinite = false and not (fs.is_imperative and pc.person_code = '1sg')
  union all
  select fs.form_type, fs.mood, fs.tense, 'nonfinite', fs.requires_auxiliary, fs.is_imperative
  from form_specs fs
  where fs.applies_to_persons = false
), restriction_persons as (
  select *
  from (values
    ('none','1sg'),('none','2sg'),('none','3sg'),('none','1pl'),('none','2pl'),('none','3pl'),('none','nonfinite'),
    ('plural-only','1pl'),('plural-only','2pl'),('plural-only','3pl'),('plural-only','nonfinite'),
    ('third-singular-only','3sg'),('third-singular-only','nonfinite'),
    ('third-person-only','3sg'),('third-person-only','3pl'),('third-person-only','nonfinite'),
    ('missing-first-second-person','3sg'),('missing-first-second-person','1pl'),('missing-first-second-person','2pl'),('missing-first-second-person','3pl'),('missing-first-second-person','nonfinite'),
    ('missing-imperative','1sg'),('missing-imperative','2sg'),('missing-imperative','3sg'),('missing-imperative','1pl'),('missing-imperative','2pl'),('missing-imperative','3pl'),('missing-imperative','nonfinite'),
    ('singular-only','1sg'),('singular-only','2sg'),('singular-only','3sg'),('singular-only','nonfinite')
  ) as rp(restriction_type, person_code)
), restriction_settings as (
  select *
  from (values
    ('none', true),
    ('plural-only', true),
    ('third-singular-only', true),
    ('third-person-only', true),
    ('missing-first-second-person', true),
    ('missing-imperative', false),
    ('singular-only', true)
  ) as rs(restriction_type, allow_imperative)
), forms_with_restrictions as (
  select f.form_type, f.mood, f.tense, f.person_code, f.requires_auxiliary, rp.restriction_type
  from forms f
  join restriction_persons rp on rp.person_code = f.person_code
  join restriction_settings rs on rs.restriction_type = rp.restriction_type
  where rs.allow_imperative or f.mood <> 'imperativo'
), translation_form_requirements as (
  select tm.word_id, tm.translation_id, tm.auxiliary_type, fwr.form_type, fwr.mood, fwr.tense, fwr.person_code
  from translation_metadata tm
  join forms_with_restrictions fwr on fwr.restriction_type = tm.restriction_type
  where fwr.form_type <> 'compound' or tm.auxiliary_type is not null
), simple_expected as (
  select word_id, mood, tense, person_code
  from translation_form_requirements
  where form_type = 'simple'
  group by word_id, mood, tense, person_code
), compound_expected as (
  select word_id, mood, tense, person_code, auxiliary_type
  from translation_form_requirements
  where form_type = 'compound'
  group by word_id, mood, tense, person_code, auxiliary_type
), progressive_expected as (
  select word_id, mood, tense, person_code
  from translation_form_requirements
  where form_type = 'progressive'
  group by word_id, mood, tense, person_code
), expected_counts as (
  select counts.word_id,
    sum(counts.simple_count) as expected_simple_forms,
    sum(counts.compound_count) as expected_compound_forms,
    sum(counts.progressive_count) as expected_progressive_forms
  from (
    select word_id, count(*) as simple_count, 0 as compound_count, 0 as progressive_count
    from simple_expected
    group by word_id
    union all
    select word_id, 0, count(*), 0
    from compound_expected
    group by word_id
    union all
    select word_id, 0, 0, count(*)
    from progressive_expected
    group by word_id
  ) counts
  group by counts.word_id
), expected_form_translations as (
  select word_id, count(*) as expected_form_translations
  from translation_form_requirements
  group by word_id
), expected_summary as (
  select
    coalesce(ec.word_id, eft.word_id) as word_id,
    coalesce(ec.expected_simple_forms, 0::numeric) as expected_simple_forms,
    coalesce(ec.expected_compound_forms, 0::numeric) as expected_compound_forms,
    coalesce(ec.expected_progressive_forms, 0::numeric) as expected_progressive_forms,
    coalesce(ec.expected_simple_forms, 0::numeric) + coalesce(ec.expected_compound_forms, 0::numeric) + coalesce(ec.expected_progressive_forms, 0::numeric) as expected_total_forms,
    coalesce(eft.expected_form_translations, 0::bigint) as expected_form_translations
  from expected_counts ec
  full join expected_form_translations eft on ec.word_id = eft.word_id
), form_counts as (
  select
    wf.word_id,
    count(case when form_type_mv.value = 'simple' then 1 end) as actual_simple_forms,
    count(case when form_type_mv.value = 'compound' then 1 end) as actual_compound_forms,
    count(case when form_type_mv.value = 'progressive' then 1 end) as actual_progressive_forms,
    count(*) as actual_total_forms
  from public.word_forms wf
  left join public.entity_meta_values form_type_emv
    on wf.id = form_type_emv.entity_id
   and form_type_emv.entity_type = 'form'
   and form_type_emv.attribute_id = (select id from public.meta_attributes where name = 'verb_form_type')
  left join public.meta_values form_type_mv on form_type_emv.value_id = form_type_mv.id
  group by wf.word_id
), form_translation_counts as (
  select wf.word_id, count(ft.id) as actual_form_translations
  from public.word_forms wf
  left join public.form_translations ft on wf.id = ft.form_id
  group by wf.word_id
)
select
  d.italian as verb_name,
  count(distinct wt.id) as translation_count,
  coalesce(aux.auxiliary_count, 0) as auxiliary_types_count,
  coalesce(aux.auxiliary_types_list, 'none') as auxiliary_types_list,
  coalesce(aux.restriction_summary, 'none') as restriction_summary,
  coalesce(es.expected_simple_forms, 0::numeric) as expected_simple_forms,
  coalesce(es.expected_compound_forms, 0::numeric) as expected_compound_forms,
  coalesce(es.expected_progressive_forms, 0::numeric) as expected_progressive_forms,
  coalesce(es.expected_total_forms, 0::numeric) as expected_forms,
  coalesce(es.expected_form_translations, 0) as expected_form_translations,
  coalesce(fc.actual_simple_forms, 0) as actual_simple_forms,
  coalesce(fc.actual_compound_forms, 0) as actual_compound_forms,
  coalesce(fc.actual_progressive_forms, 0) as actual_progressive_forms,
  coalesce(fc.actual_total_forms, 0) as actual_total_forms,
  coalesce(ftc.actual_form_translations, 0) as actual_form_translations,
  coalesce(fc.actual_total_forms, 0)::numeric = coalesce(es.expected_total_forms, 0::numeric) as forms_compliant,
  coalesce(ftc.actual_form_translations, 0) = coalesce(es.expected_form_translations, 0) as translations_compliant,
  coalesce(fc.actual_total_forms, 0)::numeric = coalesce(es.expected_total_forms, 0::numeric)
    and coalesce(ftc.actual_form_translations, 0) = coalesce(es.expected_form_translations, 0) as overall_compliant
from public.dictionary d
left join public.word_translations wt on d.id = wt.word_id
left join auxiliary_summary aux on d.id = aux.word_id
left join expected_summary es on d.id = es.word_id
left join form_counts fc on d.id = fc.word_id
left join form_translation_counts ftc on d.id = ftc.word_id
where d.word_type = 'verb'
group by d.id, d.italian, aux.auxiliary_count, aux.auxiliary_types_list, aux.restriction_summary, es.expected_simple_forms, es.expected_compound_forms, es.expected_progressive_forms, es.expected_total_forms, es.expected_form_translations, fc.actual_simple_forms, fc.actual_compound_forms, fc.actual_progressive_forms, fc.actual_total_forms, ftc.actual_form_translations
order by d.italian;

create or replace view public.verb_form_compliance_details as
with meta_ids as (
  select
    (select id from public.meta_attributes where name = 'word_restriction') as word_restriction_id,
    (select id from public.meta_attributes where name = 'auxiliary') as translation_auxiliary_id,
    (select id from public.meta_attributes where name = 'verb_form_type') as verb_form_type_id,
    (select id from public.meta_attributes where name = 'mood') as mood_id,
    (select id from public.meta_attributes where name = 'tense') as tense_id,
    (select id from public.meta_attributes where name = 'person') as person_id,
    (select id from public.meta_attributes where name = 'number') as number_id
), translation_metadata as (
  select
    wt.word_id,
    d.id as dictionary_id,
    wt.id as translation_id,
    wt.translation as translation_text,
    wt.display_priority,
    coalesce(restriction_mv.value, 'none') as restriction_type,
    aux_mv.value as auxiliary_type
  from public.word_translations wt
  join public.dictionary d on d.id = wt.word_id and d.word_type = 'verb'
  cross join meta_ids mi
  left join public.entity_meta_values restriction_emv
    on restriction_emv.entity_id = wt.id
   and restriction_emv.entity_type = 'word_translation'
   and restriction_emv.attribute_id = mi.word_restriction_id
  left join public.meta_values restriction_mv on restriction_mv.id = restriction_emv.value_id
  left join public.entity_meta_values aux_emv
    on aux_emv.entity_id = wt.id
   and aux_emv.entity_type = 'word_translation'
   and aux_emv.attribute_id = mi.translation_auxiliary_id
  left join public.meta_values aux_mv on aux_mv.id = aux_emv.value_id
), form_specs as (
  select *
  from (values
    ('simple','indicativo','presente',true,false,false),
    ('simple','indicativo','imperfetto',true,false,false),
    ('simple','indicativo','passato-remoto',true,false,false),
    ('simple','indicativo','futuro-semplice',true,false,false),
    ('simple','congiuntivo','congiuntivo-presente',true,false,false),
    ('simple','congiuntivo','congiuntivo-imperfetto',true,false,false),
    ('simple','condizionale','condizionale-presente',true,false,false),
    ('simple','imperativo','imperativo-presente',true,true,false),
    ('simple','infinito','infinito-presente',false,false,false),
    ('simple','participio','participio-presente',false,false,false),
    ('simple','participio','participio-passato',false,false,false),
    ('simple','gerundio','gerundio-presente',false,false,false),
    ('compound','indicativo','passato-prossimo',true,false,true),
    ('compound','indicativo','trapassato-prossimo',true,false,true),
    ('compound','indicativo','futuro-anteriore',true,false,true),
    ('compound','indicativo','trapassato-remoto',true,false,true),
    ('compound','congiuntivo','congiuntivo-passato',true,false,true),
    ('compound','congiuntivo','congiuntivo-trapassato',true,false,true),
    ('compound','condizionale','condizionale-passato',true,false,true),
    ('compound','imperativo','imperativo-passato',true,true,true),
    ('compound','infinito','infinito-passato',false,false,true),
    ('compound','gerundio','gerundio-passato',false,false,true),
    ('progressive','indicativo','presente-progressivo',true,false,false),
    ('progressive','indicativo','passato-progressivo',true,false,false),
    ('progressive','indicativo','futuro-progressivo',true,false,false),
    ('progressive','congiuntivo','congiuntivo-presente-progressivo',true,false,false),
    ('progressive','condizionale','condizionale-presente-progressivo',true,false,false)
  ) as fs(form_type, mood, tense, applies_to_persons, is_imperative, requires_auxiliary)
), person_codes as (
  select *
  from (values
    ('1sg', false),
    ('2sg', false),
    ('3sg', false),
    ('1pl', false),
    ('2pl', false),
    ('3pl', false),
    ('nonfinite', true)
  ) as pc(person_code, is_nonfinite)
), forms as (
  select fs.form_type, fs.mood, fs.tense, pc.person_code, fs.requires_auxiliary, fs.is_imperative
  from form_specs fs
  join person_codes pc on fs.applies_to_persons and pc.is_nonfinite = false and not (fs.is_imperative and pc.person_code = '1sg')
  union all
  select fs.form_type, fs.mood, fs.tense, 'nonfinite' as person_code, fs.requires_auxiliary, fs.is_imperative
  from form_specs fs
  where fs.applies_to_persons = false
), restriction_persons as (
  select *
  from (values
    ('none','1sg'),('none','2sg'),('none','3sg'),('none','1pl'),('none','2pl'),('none','3pl'),('none','nonfinite'),
    ('plural-only','1pl'),('plural-only','2pl'),('plural-only','3pl'),('plural-only','nonfinite'),
    ('third-singular-only','3sg'),('third-singular-only','nonfinite'),
    ('third-person-only','3sg'),('third-person-only','3pl'),('third-person-only','nonfinite'),
    ('missing-first-second-person','3sg'),('missing-first-second-person','1pl'),('missing-first-second-person','2pl'),('missing-first-second-person','3pl'),('missing-first-second-person','nonfinite'),
    ('missing-imperative','1sg'),('missing-imperative','2sg'),('missing-imperative','3sg'),('missing-imperative','1pl'),('missing-imperative','2pl'),('missing-imperative','3pl'),('missing-imperative','nonfinite'),
    ('singular-only','1sg'),('singular-only','2sg'),('singular-only','3sg'),('singular-only','nonfinite')
  ) as rp(restriction_type, person_code)
), restriction_settings as (
  select *
  from (values
    ('none', true),
    ('plural-only', true),
    ('third-singular-only', true),
    ('third-person-only', true),
    ('missing-first-second-person', true),
    ('missing-imperative', false),
    ('singular-only', true)
  ) as rs(restriction_type, allow_imperative)
), forms_with_restrictions as (
  select f.form_type, f.mood, f.tense, f.person_code, f.requires_auxiliary, rp.restriction_type
  from forms f
  join restriction_persons rp on rp.person_code = f.person_code
  join restriction_settings rs on rs.restriction_type = rp.restriction_type
  where rs.allow_imperative or f.mood <> 'imperativo'
), translation_form_requirements as (
  select
    tm.word_id,
    tm.dictionary_id,
    tm.translation_id,
    tm.translation_text,
    tm.restriction_type,
    tm.auxiliary_type,
    fwr.form_type,
    fwr.mood,
    fwr.tense,
    fwr.person_code
  from translation_metadata tm
  join forms_with_restrictions fwr on fwr.restriction_type = tm.restriction_type
  where fwr.form_type <> 'compound' or tm.auxiliary_type is not null
), expected_form_coverage as (
  select
    word_id,
    form_type,
    mood,
    tense,
    person_code,
    case when form_type = 'compound' then auxiliary_type else null end as auxiliary_type,
    count(distinct translation_id) as translation_requirement_count
  from translation_form_requirements
  group by word_id, form_type, mood, tense, person_code, case when form_type = 'compound' then auxiliary_type else null end
), expected_form_translation_rows as (
  select
    word_id,
    dictionary_id,
    translation_id,
    translation_text,
    form_type,
    mood,
    tense,
    person_code,
    case when form_type = 'compound' then auxiliary_type else null end as auxiliary_type
  from translation_form_requirements
), actual_forms_complete as (
  select
    wf.id as form_id,
    wf.word_id,
    d.id as dictionary_id,
    d.italian as verb_name,
    wf.form_text,
    coalesce(form_type_mv.value, 'unknown') as form_type,
    coalesce(mood_mv.value, 'unknown') as mood,
    coalesce(case when tense_mv.value = 'imperfetto-progressivo' then 'passato-progressivo' else tense_mv.value end, 'unknown') as tense,
    person_mv.value as person_raw,
    number_mv.value as number_raw,
    case
      when person_mv.value = 'prima-persona' and number_mv.value = 'singolare' then '1sg'
      when person_mv.value = 'prima-persona' and number_mv.value = 'plurale' then '1pl'
      when person_mv.value = 'seconda-persona' and number_mv.value = 'singolare' then '2sg'
      when person_mv.value = 'seconda-persona' and number_mv.value = 'plurale' then '2pl'
      when person_mv.value = 'terza-persona' and number_mv.value = 'singolare' then '3sg'
      when person_mv.value = 'terza-persona' and number_mv.value = 'plurale' then '3pl'
      else 'nonfinite'
    end as person_code
  from public.word_forms wf
  join public.dictionary d on d.id = wf.word_id and d.word_type = 'verb'
  cross join meta_ids mi
  left join public.entity_meta_values form_type_emv on form_type_emv.entity_id = wf.id and form_type_emv.entity_type = 'form' and form_type_emv.attribute_id = mi.verb_form_type_id
  left join public.meta_values form_type_mv on form_type_mv.id = form_type_emv.value_id
  left join public.entity_meta_values mood_emv on mood_emv.entity_id = wf.id and mood_emv.entity_type = 'form' and mood_emv.attribute_id = mi.mood_id
  left join public.meta_values mood_mv on mood_mv.id = mood_emv.value_id
  left join public.entity_meta_values tense_emv on tense_emv.entity_id = wf.id and tense_emv.entity_type = 'form' and tense_emv.attribute_id = mi.tense_id
  left join public.meta_values tense_mv on tense_mv.id = tense_emv.value_id
  left join public.entity_meta_values person_emv on person_emv.entity_id = wf.id and person_emv.entity_type = 'form' and person_emv.attribute_id = mi.person_id
  left join public.meta_values person_mv on person_mv.id = person_emv.value_id
  left join public.entity_meta_values number_emv on number_emv.entity_id = wf.id and number_emv.entity_type = 'form' and number_emv.attribute_id = mi.number_id
  left join public.meta_values number_mv on number_mv.id = number_emv.value_id
), auxiliary_patterns as (
  select * from (values
    ('passato-prossimo','prima-persona','singolare','ho','sono'),
    ('passato-prossimo','seconda-persona','singolare','hai','sei'),
    ('passato-prossimo','terza-persona','singolare','ha','è'),
    ('passato-prossimo','prima-persona','plurale','abbiamo','siamo'),
    ('passato-prossimo','seconda-persona','plurale','avete','siete'),
    ('passato-prossimo','terza-persona','plurale','hanno','sono'),
    ('trapassato-prossimo','prima-persona','singolare','avevo','ero'),
    ('trapassato-prossimo','seconda-persona','singolare','avevi','eri'),
    ('trapassato-prossimo','terza-persona','singolare','aveva','era'),
    ('trapassato-prossimo','prima-persona','plurale','avevamo','eravamo'),
    ('trapassato-prossimo','seconda-persona','plurale','avevate','eravate'),
    ('trapassato-prossimo','terza-persona','plurale','avevano','erano'),
    ('futuro-anteriore','prima-persona','singolare','avrò','sarò'),
    ('futuro-anteriore','seconda-persona','singolare','avrai','sarai'),
    ('futuro-anteriore','terza-persona','singolare','avrà','sarà'),
    ('futuro-anteriore','prima-persona','plurale','avremo','saremo'),
    ('futuro-anteriore','seconda-persona','plurale','avrete','sarete'),
    ('futuro-anteriore','terza-persona','plurale','avranno','saranno'),
    ('trapassato-remoto','prima-persona','singolare','ebbi','fui'),
    ('trapassato-remoto','seconda-persona','singolare','avesti','fosti'),
    ('trapassato-remoto','terza-persona','singolare','ebbe','fu'),
    ('trapassato-remoto','prima-persona','plurale','avemmo','fummo'),
    ('trapassato-remoto','seconda-persona','plurale','aveste','foste'),
    ('trapassato-remoto','terza-persona','plurale','ebbero','furono'),
    ('congiuntivo-passato','prima-persona','singolare','abbia','sia'),
    ('congiuntivo-passato','seconda-persona','singolare','abbia','sia'),
    ('congiuntivo-passato','terza-persona','singolare','abbia','sia'),
    ('congiuntivo-passato','prima-persona','plurale','abbiamo','siamo'),
    ('congiuntivo-passato','seconda-persona','plurale','abbiate','siate'),
    ('congiuntivo-passato','terza-persona','plurale','abbiano','siano'),
    ('congiuntivo-trapassato','prima-persona','singolare','avessi','fossi'),
    ('congiuntivo-trapassato','seconda-persona','singolare','avessi','fossi'),
    ('congiuntivo-trapassato','terza-persona','singolare','avesse','fosse'),
    ('congiuntivo-trapassato','prima-persona','plurale','avessimo','fossimo'),
    ('congiuntivo-trapassato','seconda-persona','plurale','aveste','foste'),
    ('congiuntivo-trapassato','terza-persona','plurale','avessero','fossero'),
    ('condizionale-passato','prima-persona','singolare','avrei','sarei'),
    ('condizionale-passato','seconda-persona','singolare','avresti','saresti'),
    ('condizionale-passato','terza-persona','singolare','avrebbe','sarebbe'),
    ('condizionale-passato','prima-persona','plurale','avremmo','saremmo'),
    ('condizionale-passato','seconda-persona','plurale','avreste','sareste'),
    ('condizionale-passato','terza-persona','plurale','avrebbero','sarebbero'),
    ('imperativo-passato','seconda-persona','singolare','abbi','sii'),
    ('imperativo-passato','terza-persona','singolare','abbia','sia'),
    ('imperativo-passato','prima-persona','plurale','abbiamo','siamo'),
    ('imperativo-passato','seconda-persona','plurale','abbiate','siate'),
    ('imperativo-passato','terza-persona','plurale','abbiano','siano'),
    ('infinito-passato','impersonal','invariable','avere','essere'),
    ('gerundio-passato','impersonal','invariable','avendo','essendo')
  ) as ap(compound_tense_tag, person, plurality, avere_auxiliary, essere_auxiliary)
), actual_forms_with_aux as (
  select
    afc.form_id,
    afc.word_id,
    afc.dictionary_id,
    afc.verb_name,
    afc.form_text,
    afc.form_type,
    afc.mood,
    afc.tense,
    afc.person_raw,
    afc.number_raw,
    afc.person_code,
    case
      when afc.form_type = 'compound' then (
        select case
          when ap.avere_auxiliary is not null and afc.form_text ilike ('%' || ap.avere_auxiliary || '%') then 'avere'
          when ap.essere_auxiliary is not null and afc.form_text ilike ('%' || ap.essere_auxiliary || '%') then 'essere'
          else null
        end
        from auxiliary_patterns ap
        where ap.compound_tense_tag = afc.tense
          and ((afc.person_raw is null and ap.person = any(array['impersonal', 'invariable'])) or afc.person_raw = ap.person)
          and ((afc.number_raw is null and ap.plurality = any(array['singolare', 'invariable'])) or afc.number_raw = ap.plurality)
        limit 1
      )
      else null
    end as auxiliary_type
  from actual_forms_complete afc
), actual_form_index as (
  select *
  from (
    select
      afw.*,
      row_number() over (
        partition by afw.word_id, afw.form_type, afw.mood, afw.tense, afw.person_code, coalesce(case when afw.form_type = 'compound' then afw.auxiliary_type else null end, '')
        order by afw.form_id
      ) as rn
    from actual_forms_with_aux afw
  ) ranked
  where rn = 1
), missing_forms as (
  select
    d.id as dictionary_id,
    d.italian as verb_name,
    'missing_form'::text as issue_type,
    'critical'::text as severity,
    ef.form_type,
    ef.mood,
    ef.tense,
    ef.person_code,
    ef.auxiliary_type,
    1 as expected_count,
    0 as actual_count,
    null::text as form_text,
    null::uuid as form_id,
    null::uuid as translation_id,
    null::text as translation_text,
    format(
      'Add missing %s %s %s%s',
      ef.mood,
      ef.tense,
      ef.person_code,
      case when ef.auxiliary_type is not null then ' (' || ef.auxiliary_type || ')' else '' end
    ) as recommendation
  from expected_form_coverage ef
  join public.dictionary d on d.id = ef.word_id
  left join actual_form_index afi
    on afi.word_id = ef.word_id
   and afi.form_type = ef.form_type
   and afi.mood = ef.mood
   and afi.tense = ef.tense
   and afi.person_code = ef.person_code
   and coalesce(case when afi.form_type = 'compound' then afi.auxiliary_type else null end, '') = coalesce(ef.auxiliary_type, '')
  where afi.form_id is null
), unexpected_forms as (
  select
    afi.dictionary_id,
    afi.verb_name,
    'unexpected_form'::text as issue_type,
    'critical'::text as severity,
    afi.form_type,
    afi.mood,
    afi.tense,
    afi.person_code,
    case when afi.form_type = 'compound' then afi.auxiliary_type else null end as auxiliary_type,
    0 as expected_count,
    1 as actual_count,
    afi.form_text,
    afi.form_id,
    null::uuid as translation_id,
    null::text as translation_text,
    'Remove or reclassify form that violates restriction matrix'::text as recommendation
  from actual_form_index afi
  left join expected_form_coverage ef
    on ef.word_id = afi.word_id
   and ef.form_type = afi.form_type
   and ef.mood = afi.mood
   and ef.tense = afi.tense
   and ef.person_code = afi.person_code
   and coalesce(ef.auxiliary_type, '') = coalesce(case when afi.form_type = 'compound' then afi.auxiliary_type else null end, '')
  left join form_specs fs_nonfinite
    on fs_nonfinite.mood = afi.mood
   and fs_nonfinite.tense = afi.tense
  where ef.word_id is null
    and not (afi.person_code = 'nonfinite' and afi.mood <> 'unknown' and afi.tense <> 'unknown' and fs_nonfinite.applies_to_persons = false)
), expected_links_with_forms as (
  select
    e.word_id,
    e.dictionary_id,
    e.translation_id,
    e.translation_text,
    e.form_type,
    e.mood,
    e.tense,
    e.person_code,
    e.auxiliary_type,
    afi.form_id,
    afi.form_text,
    afi.verb_name
  from expected_form_translation_rows e
  left join actual_form_index afi
    on afi.word_id = e.word_id
   and afi.form_type = e.form_type
   and afi.mood = e.mood
   and afi.tense = e.tense
   and afi.person_code = e.person_code
   and coalesce(case when afi.form_type = 'compound' then afi.auxiliary_type else null end, '') = coalesce(e.auxiliary_type, '')
), missing_form_translations as (
  select
    ewf.dictionary_id,
    ewf.verb_name,
    ewf.translation_id,
    ewf.translation_text,
    ewf.form_type,
    ewf.mood,
    ewf.tense,
    ewf.person_code,
    ewf.auxiliary_type,
    ewf.form_id,
    ewf.form_text
  from expected_links_with_forms ewf
  left join public.form_translations ft
    on ft.form_id = ewf.form_id
   and ft.word_translation_id = ewf.translation_id
  where ewf.form_id is not null
    and ft.id is null
), missing_form_translation_rows as (
  select
    m.dictionary_id,
    m.verb_name,
    'missing_form_translation'::text as issue_type,
    'critical'::text as severity,
    m.form_type,
    m.mood,
    m.tense,
    m.person_code,
    m.auxiliary_type,
    1 as expected_count,
    0 as actual_count,
    m.form_text,
    m.form_id,
    m.translation_id,
    m.translation_text,
    format('Link form "%s" to translation "%s"', coalesce(m.form_text, '???'), m.translation_text) as recommendation
  from missing_form_translations m
), unexpected_form_translations as (
  select
    tm.dictionary_id,
    tm.translation_id,
    tm.translation_text,
    afw.form_id,
    afw.form_text,
    afw.verb_name,
    afw.form_type,
    afw.mood,
    afw.tense,
    afw.person_code,
    case when afw.form_type = 'compound' then afw.auxiliary_type else null end as auxiliary_type
  from public.form_translations ft
  join actual_forms_with_aux afw on afw.form_id = ft.form_id
  join translation_metadata tm on tm.translation_id = ft.word_translation_id
  left join expected_form_translation_rows e
    on e.translation_id = tm.translation_id
   and e.form_type = afw.form_type
   and e.mood = afw.mood
   and e.tense = afw.tense
   and e.person_code = afw.person_code
   and coalesce(e.auxiliary_type, '') = coalesce(case when afw.form_type = 'compound' then afw.auxiliary_type else null end, '')
  where e.translation_id is null
), unexpected_form_translation_rows as (
  select
    u.dictionary_id,
    u.verb_name,
    'unexpected_form_translation'::text as issue_type,
    'critical'::text as severity,
    u.form_type,
    u.mood,
    u.tense,
    u.person_code,
    u.auxiliary_type,
    0 as expected_count,
    1 as actual_count,
    u.form_text,
    u.form_id,
    u.translation_id,
    u.translation_text,
    format('Remove translation "%s" from form "%s"', u.translation_text, u.form_text) as recommendation
  from unexpected_form_translations u
)
select dictionary_id, verb_name, issue_type, severity, form_type, mood, tense, person_code, auxiliary_type, expected_count, actual_count, form_text, form_id, translation_id, translation_text, recommendation
from (
  select * from missing_forms
  union all
  select * from unexpected_forms
  union all
  select * from missing_form_translation_rows
  union all
  select * from unexpected_form_translation_rows
) issues
order by verb_name, issue_type, mood, tense, person_code, form_text;

create or replace function public.app_example_single_entity_check()
returns table(entity_id uuid, has_high_confidence boolean)
language plpgsql
as $function$
begin
  return query
  select
    ft.id,
    public.entity_has_metadata_tag_corrected('form_translation', ft.id, 'confidence-high') as has_high_confidence
  from public.form_translations ft
  limit 10;
end;
$function$;

create or replace function public.app_get_forms_by_tag_paginated(p_tag_value text, p_page_size integer default 20, p_offset integer default 0)
returns table(id uuid, form_id uuid, translation text, confidence_score numeric, metadata_tags text[])
language plpgsql
stable
as $function$
begin
  return query
  select
    ft.id,
    ft.form_id,
    ft.translation,
    ft.confidence_score,
    array(
      select mv.value
      from public.entity_meta_values emv2
      join public.meta_values mv on mv.id = emv2.value_id
      join public.meta_attributes ma on ma.id = mv.attribute_id
      where emv2.entity_type = 'form_translation'
        and emv2.entity_id = ft.id
        and ma.stable_id = 'metaattr_opt_tag_translation'
      order by mv.value
    ) as metadata_tags
  from public.form_translations ft
  where exists (
    select 1
    from public.entity_meta_values emv
    join public.meta_values mv on mv.id = emv.value_id
    join public.meta_attributes ma on ma.id = mv.attribute_id
    where emv.entity_type = 'form_translation'
      and emv.entity_id = ft.id
      and mv.value = p_tag_value
      and ma.stable_id = 'metaattr_opt_tag_translation'
  )
  order by ft.created_at desc
  limit p_page_size
  offset p_offset;
end;
$function$;

create or replace function public.get_form_translations_paginated(p_tag_filter text default null, p_limit integer default 50, p_offset integer default 0)
returns table(id uuid, form_id uuid, word_translation_id uuid, translation text, assignment_method text, confidence_score numeric, metadata_tags text[])
language plpgsql
stable
as $function$
begin
  return query
  select
    ft.id,
    ft.form_id,
    ft.word_translation_id,
    ft.translation,
    ft.assignment_method,
    ft.confidence_score,
    public.get_entity_metadata_tags('form_translation', ft.id) as metadata_tags
  from public.form_translations ft
  where p_tag_filter is null or public.entity_has_metadata_tag('form_translation', ft.id, p_tag_filter)
  order by ft.created_at desc
  limit p_limit
  offset p_offset;
end;
$function$;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'load_lexical_entry'
  ) then
    alter function public.load_lexical_entry(jsonb) rename to load_lexical_entry_legacy_20260314;
  end if;
exception when undefined_function then
  null;
end $$;

create or replace function public.load_lexical_entry(payload jsonb)
returns uuid
language plpgsql
as $function$
begin
  raise exception 'load_lexical_entry is archived. Use the review-app publish pipeline for canonical FTG/pronunciation/media publishing.';
end;
$function$;

create or replace function public.get_all_available_tags()
returns table(tag_name text, tag_count integer, table_sources text[])
language plpgsql
as $function$
begin
  return query
  with tag_data as (
    select
      ma.name || ': ' || mv.value as tag,
      case emv.entity_type
        when 'word' then 'dictionary'
        when 'form' then 'word_forms'
        when 'word_translation' then 'word_translations'
        when 'translation_synonym' then 'translation_synonyms'
        when 'form_translation' then 'form_translations'
        else emv.entity_type
      end as source_table
    from public.entity_meta_values emv
    join public.meta_values mv on mv.id = emv.value_id
    join public.meta_attributes ma on ma.id = mv.attribute_id
  ), aggregated as (
    select
      tag,
      count(*) as total_count,
      array_agg(distinct source_table order by source_table) as sources
    from tag_data
    group by tag
  )
  select tag as tag_name, total_count::integer as tag_count, sources as table_sources
  from aggregated
  order by total_count desc, tag_name;
end;
$function$;

create or replace function public.verify_rollback_state()
returns table(tbl_name text, has_metadata_column boolean, has_optional_tags_column boolean, row_count bigint)
language plpgsql
as $function$
begin
  return query
  select
    'dictionary'::text,
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'dictionary' and c.column_name = 'metadata'),
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'dictionary' and c.column_name = 'optional_tags'),
    (select count(*) from public.dictionary);

  return query
  select
    'word_forms'::text,
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'word_forms' and c.column_name = 'metadata'),
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'word_forms' and c.column_name = 'optional_tags'),
    (select count(*) from public.word_forms);

  return query
  select
    'word_translations'::text,
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'word_translations' and c.column_name = 'metadata'),
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'word_translations' and c.column_name = 'optional_tags'),
    (select count(*) from public.word_translations);

  return query
  select
    'form_translations_legacy_20260314'::text,
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'form_translations_legacy_20260314' and c.column_name = 'metadata'),
    exists(select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'form_translations_legacy_20260314' and c.column_name = 'optional_tags'),
    coalesce((select count(*) from public.form_translations_legacy_20260314), 0);
end;
$function$;

do $$
declare
  dependency_count integer;
begin
  select count(*)
    into dependency_count
  from (
    select distinct c.relname as obj_name
    from pg_depend d
    join pg_rewrite r on r.oid = d.objid
    join pg_class c on c.oid = r.ev_class
    join pg_class ref on ref.oid = d.refobjid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_namespace rn on rn.oid = ref.relnamespace
    where n.nspname = 'public'
      and rn.nspname = 'public'
      and ref.relname in ('form_translations_legacy_20260314', 'word_audio_metadata_legacy_20260314')
      and c.relname not like '%_legacy_20260314'
    union
    select distinct p.proname
    from pg_depend d
    join pg_proc p on p.oid = d.objid
    join pg_class ref on ref.oid = d.refobjid
    join pg_namespace pn on pn.oid = p.pronamespace
    join pg_namespace rn on rn.oid = ref.relnamespace
    where pn.nspname = 'public'
      and rn.nspname = 'public'
      and ref.relname in ('form_translations_legacy_20260314', 'word_audio_metadata_legacy_20260314')
      and p.proname not like '%_legacy_20260314'
  ) deps;

  if dependency_count > 0 then
    raise exception 'Live DB objects still depend on archived legacy tables.';
  end if;
end $$;
