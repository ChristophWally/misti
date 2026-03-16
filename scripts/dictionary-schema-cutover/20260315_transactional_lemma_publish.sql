create or replace function public.app_publish_lemma_bundle(p_payload jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_lemma_id uuid := nullif(trim(coalesce(p_payload->>'lemma_id', '')), '')::uuid;
  v_result jsonb;
begin
  if v_lemma_id is null then
    raise exception 'Missing lemma_id in publish payload';
  end if;

  insert into public.meta_values (
    stable_id,
    attribute_id,
    value,
    description,
    is_default,
    sort_order,
    is_active
  )
  select
    trim(coalesce(row.stable_id, '')),
    ma.id,
    trim(coalesce(row.value, '')),
    coalesce(nullif(row.description, ''), 'User-generated optional tag value'),
    false,
    null,
    true
  from jsonb_to_recordset(coalesce(p_payload->'optional_tag_values', '[]'::jsonb))
    as row(stable_id text, value text, description text)
  join public.meta_attributes ma
    on lower(ma.name) = 'optional_tag'
  where trim(coalesce(row.stable_id, '')) <> ''
    and trim(coalesce(row.value, '')) <> ''
  on conflict (stable_id) do update
    set value = excluded.value,
        description = excluded.description,
        is_active = true;

  insert into public.dictionary (
    id,
    italian,
    word_type,
    updated_at
  )
  select
    row.id,
    row.italian,
    row.word_type,
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'words', '[]'::jsonb))
    as row(id uuid, italian text, word_type text)
  on conflict (id) do update
    set italian = excluded.italian,
        word_type = excluded.word_type,
        updated_at = excluded.updated_at;

  insert into public.word_translations (
    id,
    word_id,
    translation,
    usage_notes,
    display_priority,
    frequency_estimate,
    updated_at
  )
  select
    row.id,
    row.word_id,
    row.translation,
    row.usage_notes,
    coalesce(row.display_priority, 1),
    row.frequency_estimate,
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'translations', '[]'::jsonb))
    as row(id uuid, word_id uuid, translation text, usage_notes text, display_priority integer, frequency_estimate numeric)
  on conflict (id) do update
    set word_id = excluded.word_id,
        translation = excluded.translation,
        usage_notes = excluded.usage_notes,
        display_priority = excluded.display_priority,
        frequency_estimate = excluded.frequency_estimate,
        updated_at = excluded.updated_at;

  delete from public.translation_synonyms
  where word_translation_id in (
    select row.id
    from jsonb_to_recordset(coalesce(p_payload->'translations', '[]'::jsonb))
      as row(id uuid, word_id uuid, translation text, usage_notes text, display_priority integer)
  );

  insert into public.translation_synonyms (
    id,
    word_translation_id,
    synonym,
    display_order
  )
  select
    row.id,
    row.word_translation_id,
    row.synonym,
    coalesce(row.display_order, 1)
  from jsonb_to_recordset(coalesce(p_payload->'translation_synonyms', '[]'::jsonb))
    as row(id uuid, word_translation_id uuid, synonym text, display_order integer);

  insert into public.word_forms (
    id,
    word_id,
    form_text,
    form_type,
    updated_at
  )
  select
    row.id,
    row.word_id,
    row.form_text,
    coalesce(nullif(row.form_type, ''), 'conjugation'),
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'forms', '[]'::jsonb))
    as row(id uuid, word_id uuid, form_text text, form_type text)
  on conflict (id) do update
    set word_id = excluded.word_id,
        form_text = excluded.form_text,
        form_type = excluded.form_type,
        updated_at = excluded.updated_at;

  insert into public.form_translation_groups (
    external_id,
    word_translation_id,
    translation,
    usage_notes,
    usage_examples,
    source_file_key,
    provenance,
    updated_at
  )
  select
    row.external_id,
    row.word_translation_id,
    row.translation,
    row.usage_notes,
    coalesce(row.usage_examples, '[]'::jsonb),
    row.source_file_key,
    coalesce(row.provenance, '{}'::jsonb),
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'form_translation_groups', '[]'::jsonb))
    as row(external_id text, word_translation_id uuid, translation text, usage_notes text, usage_examples jsonb, source_file_key text, provenance jsonb)
  on conflict (external_id) do update
    set word_translation_id = excluded.word_translation_id,
        translation = excluded.translation,
        usage_notes = excluded.usage_notes,
        usage_examples = excluded.usage_examples,
        source_file_key = excluded.source_file_key,
        provenance = excluded.provenance,
        updated_at = excluded.updated_at;

  if exists (
    with payload as (
      select *
      from jsonb_to_recordset(coalesce(p_payload->'form_translation_group_links', '[]'::jsonb))
        as row(external_id text, ftg_external_id text, form_id uuid, variant_order integer, usage_label text, note text)
    )
    select 1
    from payload p
    left join public.form_translation_groups ftg
      on ftg.external_id = p.ftg_external_id
    where ftg.id is null
  ) then
    raise exception 'Failed to resolve one or more form_translation_groups for FTG links';
  end if;

  insert into public.form_translation_group_links (
    external_id,
    form_translation_group_id,
    form_id,
    variant_order,
    usage_label,
    note,
    updated_at
  )
  select
    p.external_id,
    ftg.id,
    p.form_id,
    coalesce(p.variant_order, 1),
    p.usage_label,
    p.note,
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'form_translation_group_links', '[]'::jsonb))
    as p(external_id text, ftg_external_id text, form_id uuid, variant_order integer, usage_label text, note text)
  join public.form_translation_groups ftg
    on ftg.external_id = p.ftg_external_id
  on conflict (external_id) do update
    set form_translation_group_id = excluded.form_translation_group_id,
        form_id = excluded.form_id,
        variant_order = excluded.variant_order,
        usage_label = excluded.usage_label,
        note = excluded.note,
        updated_at = excluded.updated_at;

  with media_payload as (
    select *
    from jsonb_to_recordset(coalesce(p_payload->'media_assets', '[]'::jsonb))
      as row(
        workspace_media_asset_id text,
        existing_id uuid,
        external_id text,
        media_kind text,
        storage_backend text,
        storage_bucket text,
        object_key text,
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
        source_ref jsonb
      )
  ),
  existing_hash_match as (
    select
      mp.workspace_media_asset_id,
      ma.id as media_asset_id
    from media_payload mp
    join public.media_assets ma
      on mp.existing_id is null
     and trim(coalesce(mp.content_sha256, '')) <> ''
     and ma.content_sha256 = mp.content_sha256
     and ma.archived_at is null
  )
  insert into public.media_assets (
    external_id,
    media_kind,
    storage_backend,
    storage_bucket,
    object_key,
    content_sha256,
    mime_type,
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
    updated_at
  )
  select
    mp.external_id,
    mp.media_kind,
    coalesce(nullif(mp.storage_backend, ''), 'supabase'),
    mp.storage_bucket,
    mp.object_key,
    mp.content_sha256,
    mp.mime_type,
    mp.file_ext,
    mp.display_name,
    mp.voice_name,
    mp.generation_tool,
    mp.generation_type,
    mp.selected_bytes,
    mp.duration_seconds,
    mp.sample_rate,
    mp.bit_rate,
    coalesce(mp.source_ref, '{}'::jsonb),
    v_now
  from media_payload mp
  where mp.existing_id is null
    and not exists (
      select 1
      from existing_hash_match eh
      where eh.workspace_media_asset_id = mp.workspace_media_asset_id
    )
  on conflict (external_id) do update
    set media_kind = excluded.media_kind,
        storage_backend = excluded.storage_backend,
        storage_bucket = excluded.storage_bucket,
        object_key = excluded.object_key,
        content_sha256 = excluded.content_sha256,
        mime_type = excluded.mime_type,
        file_ext = excluded.file_ext,
        display_name = excluded.display_name,
        voice_name = excluded.voice_name,
        generation_tool = excluded.generation_tool,
        generation_type = excluded.generation_type,
        selected_bytes = excluded.selected_bytes,
        duration_seconds = excluded.duration_seconds,
        sample_rate = excluded.sample_rate,
        bit_rate = excluded.bit_rate,
        source_ref = excluded.source_ref,
        updated_at = excluded.updated_at;

  insert into public.pronunciations (
    external_id,
    accent,
    ipa_pronunciation,
    phonetic_pronunciation,
    pronunciation_source,
    source_ref,
    notes,
    media_asset_id,
    updated_at
  )
  with media_payload as (
    select *
    from jsonb_to_recordset(coalesce(p_payload->'media_assets', '[]'::jsonb))
      as row(
        workspace_media_asset_id text,
        existing_id uuid,
        external_id text,
        media_kind text,
        storage_backend text,
        storage_bucket text,
        object_key text,
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
        source_ref jsonb
      )
  ),
  media_ids as (
    select
      mp.workspace_media_asset_id,
      coalesce(mp.existing_id, by_hash.id, by_external.id) as media_asset_id
    from media_payload mp
    left join public.media_assets by_hash
      on trim(coalesce(mp.content_sha256, '')) <> ''
     and by_hash.content_sha256 = mp.content_sha256
     and by_hash.archived_at is null
    left join public.media_assets by_external
      on by_external.external_id = mp.external_id
  )
  select
    row.external_id,
    row.accent,
    row.ipa_pronunciation,
    row.phonetic_pronunciation,
    row.pronunciation_source,
    row.source_ref,
    row.notes,
    media_ids.media_asset_id,
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'pronunciations', '[]'::jsonb))
    as row(external_id text, accent text, ipa_pronunciation text, phonetic_pronunciation text, pronunciation_source text, source_ref text, notes text, media_asset_ref text)
  left join media_ids
    on media_ids.workspace_media_asset_id = row.media_asset_ref
  on conflict (external_id) do update
    set accent = excluded.accent,
        ipa_pronunciation = excluded.ipa_pronunciation,
        phonetic_pronunciation = excluded.phonetic_pronunciation,
        pronunciation_source = excluded.pronunciation_source,
        source_ref = excluded.source_ref,
        notes = excluded.notes,
        media_asset_id = excluded.media_asset_id,
        updated_at = excluded.updated_at;

  if exists (
    with payload as (
      select *
      from jsonb_to_recordset(coalesce(p_payload->'pronunciation_links', '[]'::jsonb))
        as row(external_id text, pronunciation_external_id text, entity_type text, entity_id uuid, entity_external_id text, variant_order integer, usage_label text, note text)
    )
    select 1
    from payload p
    left join public.pronunciations pr
      on pr.external_id = p.pronunciation_external_id
    left join public.form_translation_group_links ftgl
      on p.entity_type = 'form_translation_group_link'
     and ftgl.external_id = p.entity_external_id
    where pr.id is null
       or (p.entity_type = 'form_translation_group_link' and ftgl.id is null)
  ) then
    raise exception 'Failed to resolve one or more pronunciation_links';
  end if;

  insert into public.pronunciation_links (
    external_id,
    pronunciation_id,
    entity_type,
    entity_id,
    variant_order,
    usage_label,
    note,
    updated_at
  )
  select
    p.external_id,
    pr.id,
    p.entity_type,
    case
      when p.entity_type = 'form_translation_group_link' then ftgl.id
      else p.entity_id
    end,
    coalesce(p.variant_order, 1),
    p.usage_label,
    p.note,
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'pronunciation_links', '[]'::jsonb))
    as p(external_id text, pronunciation_external_id text, entity_type text, entity_id uuid, entity_external_id text, variant_order integer, usage_label text, note text)
  join public.pronunciations pr
    on pr.external_id = p.pronunciation_external_id
  left join public.form_translation_group_links ftgl
    on p.entity_type = 'form_translation_group_link'
   and ftgl.external_id = p.entity_external_id
  on conflict (external_id) do update
    set pronunciation_id = excluded.pronunciation_id,
        entity_type = excluded.entity_type,
        entity_id = excluded.entity_id,
        variant_order = excluded.variant_order,
        usage_label = excluded.usage_label,
        note = excluded.note,
        updated_at = excluded.updated_at;

  insert into public.etymology_documents (
    external_id,
    body_text,
    etymology_source,
    notes,
    body_sha256,
    updated_at
  )
  select
    row.external_id,
    row.body_text,
    row.etymology_source,
    row.notes,
    row.body_sha256,
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'etymology_documents', '[]'::jsonb))
    as row(external_id text, body_text text, etymology_source text, notes text, body_sha256 text)
  on conflict (external_id) do update
    set body_text = excluded.body_text,
        etymology_source = excluded.etymology_source,
        notes = excluded.notes,
        body_sha256 = excluded.body_sha256,
        updated_at = excluded.updated_at;

  delete from public.etymology_links
  where entity_type = 'word'
    and entity_id = v_lemma_id;

  if exists (
    with payload as (
      select *
      from jsonb_to_recordset(coalesce(p_payload->'etymology_links', '[]'::jsonb))
        as row(external_id text, etymology_document_external_id text, entity_type text, entity_id uuid, link_order integer)
    )
    select 1
    from payload p
    left join public.etymology_documents ed
      on ed.external_id = p.etymology_document_external_id
    where ed.id is null
  ) then
    raise exception 'Failed to resolve one or more etymology_documents';
  end if;

  insert into public.etymology_links (
    external_id,
    etymology_document_id,
    entity_type,
    entity_id,
    link_order,
    updated_at
  )
  select
    p.external_id,
    ed.id,
    p.entity_type,
    p.entity_id,
    coalesce(p.link_order, 1),
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'etymology_links', '[]'::jsonb))
    as p(external_id text, etymology_document_external_id text, entity_type text, entity_id uuid, link_order integer)
  join public.etymology_documents ed
    on ed.external_id = p.etymology_document_external_id;

  delete from public.media_links
  where entity_type = 'word_translation'
    and entity_id in (
      select row.id
      from jsonb_to_recordset(coalesce(p_payload->'translations', '[]'::jsonb))
        as row(id uuid, word_id uuid, translation text, usage_notes text, display_priority integer)
    );

  delete from public.media_links
  where entity_type = 'form_translation_group'
    and entity_id in (
      select ftg.id
      from jsonb_to_recordset(coalesce(p_payload->'form_translation_groups', '[]'::jsonb))
        as row(external_id text, word_translation_id uuid, translation text, usage_notes text, usage_examples jsonb, source_file_key text, provenance jsonb)
      join public.form_translation_groups ftg
        on ftg.external_id = row.external_id
    );

  delete from public.media_links
  where entity_type = 'etymology_document'
    and entity_id in (
      select ed.id
      from jsonb_to_recordset(coalesce(p_payload->'etymology_documents', '[]'::jsonb))
        as row(external_id text, body_text text, etymology_source text, notes text, body_sha256 text)
      join public.etymology_documents ed
        on ed.external_id = row.external_id
    );

  if exists (
    with media_payload as (
      select *
      from jsonb_to_recordset(coalesce(p_payload->'media_assets', '[]'::jsonb))
        as row(
          workspace_media_asset_id text,
          existing_id uuid,
          external_id text,
          media_kind text,
          storage_backend text,
          storage_bucket text,
          object_key text,
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
          source_ref jsonb
        )
    ),
    media_ids as (
      select
        mp.workspace_media_asset_id,
        coalesce(mp.existing_id, by_hash.id, by_external.id) as media_asset_id
      from media_payload mp
      left join public.media_assets by_hash
        on trim(coalesce(mp.content_sha256, '')) <> ''
       and by_hash.content_sha256 = mp.content_sha256
       and by_hash.archived_at is null
      left join public.media_assets by_external
        on by_external.external_id = mp.external_id
    ),
    payload as (
      select *
      from jsonb_to_recordset(coalesce(p_payload->'media_links', '[]'::jsonb))
        as row(external_id text, workspace_media_asset_id text, entity_type text, entity_id uuid, entity_external_id text, media_role text, link_order integer)
    )
    select 1
    from payload p
    left join media_ids mi
      on mi.workspace_media_asset_id = p.workspace_media_asset_id
    left join public.form_translation_groups ftg
      on p.entity_type = 'form_translation_group'
     and ftg.external_id = p.entity_external_id
    left join public.etymology_documents ed
      on p.entity_type = 'etymology_document'
     and ed.external_id = p.entity_external_id
    where mi.media_asset_id is null
       or (p.entity_type = 'form_translation_group' and ftg.id is null)
       or (p.entity_type = 'etymology_document' and ed.id is null)
  ) then
    raise exception 'Failed to resolve one or more media_links';
  end if;

  insert into public.media_links (
    external_id,
    media_asset_id,
    entity_type,
    entity_id,
    media_role,
    link_order,
    updated_at
  )
  with media_payload as (
    select *
    from jsonb_to_recordset(coalesce(p_payload->'media_assets', '[]'::jsonb))
      as row(
        workspace_media_asset_id text,
        existing_id uuid,
        external_id text,
        media_kind text,
        storage_backend text,
        storage_bucket text,
        object_key text,
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
        source_ref jsonb
      )
  ),
  media_ids as (
    select
      mp.workspace_media_asset_id,
      coalesce(mp.existing_id, by_hash.id, by_external.id) as media_asset_id
    from media_payload mp
    left join public.media_assets by_hash
      on trim(coalesce(mp.content_sha256, '')) <> ''
     and by_hash.content_sha256 = mp.content_sha256
     and by_hash.archived_at is null
    left join public.media_assets by_external
      on by_external.external_id = mp.external_id
  )
  select
    p.external_id,
    mi.media_asset_id,
    p.entity_type,
    case
      when p.entity_type = 'form_translation_group' then ftg.id
      when p.entity_type = 'etymology_document' then ed.id
      else p.entity_id
    end,
    coalesce(nullif(p.media_role, ''), 'attachment'),
    coalesce(p.link_order, 1),
    v_now
  from jsonb_to_recordset(coalesce(p_payload->'media_links', '[]'::jsonb))
    as p(external_id text, workspace_media_asset_id text, entity_type text, entity_id uuid, entity_external_id text, media_role text, link_order integer)
  join media_ids mi
    on mi.workspace_media_asset_id = p.workspace_media_asset_id
  left join public.form_translation_groups ftg
    on p.entity_type = 'form_translation_group'
   and ftg.external_id = p.entity_external_id
  left join public.etymology_documents ed
    on p.entity_type = 'etymology_document'
   and ed.external_id = p.entity_external_id
  on conflict (external_id) do update
    set media_asset_id = excluded.media_asset_id,
        entity_type = excluded.entity_type,
        entity_id = excluded.entity_id,
        media_role = excluded.media_role,
        link_order = excluded.link_order,
        updated_at = excluded.updated_at;

  insert into public.word_relationships (
    id,
    source_word_id,
    target_word_id,
    target_form_id,
    contracted_form_id,
    relationship_type,
    relationship_direction,
    description,
    systematic_rule,
    relationship_strength
  )
  select
    row.id,
    row.source_word_id,
    row.target_word_id,
    row.target_form_id,
    row.contracted_form_id,
    row.relationship_type,
    row.relationship_direction,
    row.description,
    row.systematic_rule,
    row.relationship_strength
  from jsonb_to_recordset(coalesce(p_payload->'relationships', '[]'::jsonb))
    as row(id uuid, source_word_id uuid, target_word_id uuid, target_form_id uuid, contracted_form_id uuid, relationship_type text, relationship_direction text, description text, systematic_rule text, relationship_strength numeric)
  where exists (
      select 1
      from public.dictionary source_word
      where source_word.id = row.source_word_id
    )
    and exists (
      select 1
      from public.dictionary target_word
      where target_word.id = row.target_word_id
    )
    and (
      row.target_form_id is null
      or exists (
        select 1
        from public.word_forms target_form
        where target_form.id = row.target_form_id
      )
    )
  on conflict (id) do update
    set source_word_id = excluded.source_word_id,
        target_word_id = excluded.target_word_id,
        target_form_id = excluded.target_form_id,
        contracted_form_id = excluded.contracted_form_id,
        relationship_type = excluded.relationship_type,
        relationship_direction = excluded.relationship_direction,
        description = excluded.description,
        systematic_rule = excluded.systematic_rule,
        relationship_strength = excluded.relationship_strength;

  delete from public.entity_meta_values
  where propagation_source_id is null
    and (
      (entity_type = 'word' and entity_id in (
        select row.id
        from jsonb_to_recordset(coalesce(p_payload->'words', '[]'::jsonb))
          as row(id uuid, italian text, word_type text)
      ))
      or (entity_type = 'word_translation' and entity_id in (
        select row.id
        from jsonb_to_recordset(coalesce(p_payload->'translations', '[]'::jsonb))
          as row(id uuid, word_id uuid, translation text, usage_notes text, display_priority integer)
      ))
      or (entity_type = 'form' and entity_id in (
        select row.id
        from jsonb_to_recordset(coalesce(p_payload->'forms', '[]'::jsonb))
          as row(id uuid, word_id uuid, form_text text, form_type text)
      ))
    );

  if exists (
    with payload as (
      select *
      from jsonb_to_recordset(coalesce(p_payload->'entity_tags', '[]'::jsonb))
        as row(entity_type text, entity_id uuid, attribute_name text, value text, derived_from text)
    )
    select 1
    from payload p
    left join public.meta_attributes ma
      on lower(ma.name) = lower(p.attribute_name)
    left join public.meta_values mv
      on mv.attribute_id = ma.id
     and lower(mv.value) = lower(p.value)
    where ma.id is null or mv.id is null
  ) then
    raise exception 'Failed to resolve one or more entity_meta_values';
  end if;

  insert into public.entity_meta_values (
    entity_type,
    entity_id,
    value_id,
    attribute_id,
    derived_from
  )
  select distinct
    p.entity_type,
    p.entity_id,
    mv.id,
    ma.id,
    coalesce(nullif(p.derived_from, ''), 'publish:workspace')
  from jsonb_to_recordset(coalesce(p_payload->'entity_tags', '[]'::jsonb))
    as p(entity_type text, entity_id uuid, attribute_name text, value text, derived_from text)
  join public.meta_attributes ma
    on lower(ma.name) = lower(p.attribute_name)
  join public.meta_values mv
    on mv.attribute_id = ma.id
   and lower(mv.value) = lower(p.value);

  if to_regprocedure('public.refresh_word_propagation(uuid)') is not null then
    perform public.refresh_word_propagation(v_lemma_id);
  end if;

  v_result := jsonb_build_object(
    'ok', true,
    'stats', jsonb_build_object(
      'words', jsonb_array_length(coalesce(p_payload->'words', '[]'::jsonb)),
      'senses', jsonb_array_length(coalesce(p_payload->'translations', '[]'::jsonb)),
      'forms', jsonb_array_length(coalesce(p_payload->'forms', '[]'::jsonb)),
      'form_translation_groups', jsonb_array_length(coalesce(p_payload->'form_translation_groups', '[]'::jsonb)),
      'form_translation_group_links', jsonb_array_length(coalesce(p_payload->'form_translation_group_links', '[]'::jsonb)),
      'pronunciations', jsonb_array_length(coalesce(p_payload->'pronunciations', '[]'::jsonb)),
      'media_assets', jsonb_array_length(coalesce(p_payload->'media_assets', '[]'::jsonb)),
      'relationships', jsonb_array_length(coalesce(p_payload->'relationships', '[]'::jsonb))
    )
  );

  return v_result;
end;
$$;
