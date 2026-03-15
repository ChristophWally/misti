update public.pronunciation_links pl
set external_id = 'legacy:plink:' || pl.entity_type || ':' || replace(pl.entity_id::text, '-', '') || ':' || replace(p.external_id, 'legacy:pron:', '')
from public.pronunciations p
where p.id = pl.pronunciation_id
  and pl.external_id <> 'legacy:plink:' || pl.entity_type || ':' || replace(pl.entity_id::text, '-', '') || ':' || replace(p.external_id, 'legacy:pron:', '');

with pronunciation_sources as (
  select
    'word'::text as entity_type,
    d.id as entity_id,
    null::text as accent,
    nullif(btrim(d.ipa_pronunciation), '') as ipa_pronunciation,
    nullif(btrim(d.phonetic_pronunciation), '') as phonetic_pronunciation,
    'legacy-dictionary'::text as pronunciation_source,
    'dictionary:' || d.id::text as source_ref,
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
    'word_form:' || wf.id::text as source_ref,
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
on conflict (pronunciation_id, entity_type, entity_id, variant_order) do nothing;
