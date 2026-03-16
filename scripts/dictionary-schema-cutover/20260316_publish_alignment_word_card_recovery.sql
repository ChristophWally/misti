create or replace function public.app_entity_core_tags_json_filtered(
  p_entity_type text,
  p_entity_id uuid,
  p_propagated_only boolean default null
)
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
        'value_description', mv.description,
        'derived_from', emv.derived_from,
        'propagation_source_id', emv.propagation_source_id,
        'propagation_method', emv.propagation_method,
        'is_inherited', (emv.propagation_source_id is not null)
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
    and ma.stable_id not like 'metaattr_opt_tag_%'
    and (
      p_propagated_only is null
      or (p_propagated_only = true and emv.propagation_source_id is not null)
      or (p_propagated_only = false and emv.propagation_source_id is null)
    );
$$;

create or replace function public.app_word_display_core_tags_json(p_word_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  with direct_tags as (
    select
      ma.id as attribute_id,
      ma.stable_id as attribute_stable_id,
      coalesce(ma.display_name, ma.name) as attribute_display_name,
      mv.id as value_id,
      mv.stable_id as value_stable_id,
      mv.value as value_label,
      mv.shorthand as value_shorthand,
      mv.description as value_description,
      emv.derived_from,
      emv.propagation_source_id,
      emv.propagation_method,
      false as is_inherited,
      mv.sort_order
    from public.entity_meta_values emv
    join public.meta_values mv on mv.id = emv.value_id
    join public.meta_attributes ma on ma.id = mv.attribute_id
    where emv.entity_type = 'word'
      and emv.entity_id = p_word_id
      and ma.stable_id not like 'metaattr_opt_tag_%'
      and emv.propagation_source_id is null
  ),
  inherited_tags as (
    select
      ma.id as attribute_id,
      ma.stable_id as attribute_stable_id,
      coalesce(ma.display_name, ma.name) as attribute_display_name,
      mv.id as value_id,
      mv.stable_id as value_stable_id,
      mv.value as value_label,
      mv.shorthand as value_shorthand,
      mv.description as value_description,
      emv.derived_from,
      emv.propagation_source_id,
      emv.propagation_method,
      true as is_inherited,
      mv.sort_order
    from public.entity_meta_values emv
    join public.meta_values mv on mv.id = emv.value_id
    join public.meta_attributes ma on ma.id = mv.attribute_id
    where emv.entity_type = 'word'
      and emv.entity_id = p_word_id
      and ma.stable_id not like 'metaattr_opt_tag_%'
      and emv.propagation_source_id is not null
      and not exists (
        select 1
        from direct_tags dt
        where dt.attribute_id = ma.id
          and dt.value_id = mv.id
      )
  ),
  merged as (
    select * from direct_tags
    union all
    select * from inherited_tags
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attribute_id', attribute_id,
        'attribute_stable_id', attribute_stable_id,
        'attribute_display_name', attribute_display_name,
        'value_id', value_id,
        'value_stable_id', value_stable_id,
        'value_label', value_label,
        'value_shorthand', value_shorthand,
        'value_description', value_description,
        'derived_from', derived_from,
        'propagation_source_id', propagation_source_id,
        'propagation_method', propagation_method,
        'is_inherited', is_inherited
      )
      order by is_inherited, attribute_stable_id, sort_order nulls last, value_label
    ),
    '[]'::jsonb
  )
  from merged;
$$;

create or replace function public.app_word_pronunciation_groups_json(p_word_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  with raw_links as (
    select
      vpr.pronunciation_id,
      vpr.pronunciation_external_id,
      vpr.pronunciation_source,
      vpr.source_ref,
      vpr.pronunciation_notes,
      vpr.accent,
      vpr.ipa_pronunciation,
      vpr.phonetic_pronunciation,
      vpr.media_asset_id,
      vpr.storage_bucket,
      vpr.audio_filename,
      vpr.voice_name,
      vpr.key_version,
      vpr.entity_type,
      vpr.entity_id,
      vpr.pronunciation_link_id,
      vpr.pronunciation_link_external_id,
      coalesce(vpr.variant_order, 9999) as variant_order,
      vpr.usage_label,
      vpr.note,
      case vpr.entity_type
        when 'word' then 0
        when 'word_translation' then 1
        when 'form' then 2
        when 'form_translation_group_link' then 3
        else 9
      end as entity_rank,
      wt.translation as translation_text,
      wf.form_text,
      ftgl.form_id as ftgl_form_id,
      ftg.translation as ftg_translation
    from public.vw_pronunciation_links_resolved vpr
    left join public.word_translations wt
      on vpr.entity_type = 'word_translation'
     and wt.id = vpr.entity_id
    left join public.word_forms wf
      on vpr.entity_type = 'form'
     and wf.id = vpr.entity_id
    left join public.form_translation_group_links ftgl
      on vpr.entity_type = 'form_translation_group_link'
     and ftgl.id = vpr.entity_id
    left join public.form_translation_groups ftg
      on ftg.id = ftgl.form_translation_group_id
    where (vpr.entity_type = 'word' and vpr.entity_id = p_word_id)
       or (vpr.entity_type = 'word_translation' and exists (
            select 1
            from public.word_translations wt2
            where wt2.id = vpr.entity_id
              and wt2.word_id = p_word_id
          ))
       or (vpr.entity_type = 'form' and exists (
            select 1
            from public.word_forms wf2
            where wf2.id = vpr.entity_id
              and wf2.word_id = p_word_id
          ))
       or (vpr.entity_type = 'form_translation_group_link' and exists (
            select 1
            from public.form_translation_group_links ftgl2
            join public.form_translation_groups ftg2
              on ftg2.id = ftgl2.form_translation_group_id
            join public.word_translations wt2
              on wt2.id = ftg2.word_translation_id
            where ftgl2.id = vpr.entity_id
              and wt2.word_id = p_word_id
          ))
  ),
  grouped as (
    select
      rl.pronunciation_id,
      min(rl.entity_rank) as group_rank,
      min(rl.variant_order) as first_variant_order,
      jsonb_build_object(
        'id', rl.pronunciation_id,
        'external_id', (
          select prl.pronunciation_external_id
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'accent', (
          select prl.accent
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'ipa_pronunciation', (
          select prl.ipa_pronunciation
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'phonetic_pronunciation', (
          select prl.phonetic_pronunciation
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'pronunciation_source', (
          select prl.pronunciation_source
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'source_ref', (
          select prl.source_ref
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'notes', (
          select prl.pronunciation_notes
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'primary_pronunciation_link_id', (
          select prl.pronunciation_link_id
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'primary_audio', (
          select case
            when prl.media_asset_id is null then null
            else jsonb_build_object(
              'id', prl.media_asset_id,
              'storage_bucket', prl.storage_bucket,
              'object_key', prl.audio_filename,
              'voice_name', prl.voice_name,
              'key_version', prl.key_version
            )
          end
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
          order by prl.entity_rank, prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'linked_word', (
          select jsonb_build_object(
            'pronunciation_link_id', prl.pronunciation_link_id,
            'external_id', prl.pronunciation_link_external_id,
            'variant_order', prl.variant_order,
            'usage_label', prl.usage_label,
            'note', prl.note
          )
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
            and prl.entity_type = 'word'
          order by prl.variant_order, prl.pronunciation_link_id
          limit 1
        ),
        'linked_translations', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', prl.entity_id,
              'translation', prl.translation_text,
              'pronunciation_link_id', prl.pronunciation_link_id,
              'external_id', prl.pronunciation_link_external_id,
              'variant_order', prl.variant_order,
              'usage_label', prl.usage_label,
              'note', prl.note
            )
            order by prl.variant_order, prl.pronunciation_link_id
          )
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
            and prl.entity_type = 'word_translation'
        ), '[]'::jsonb),
        'linked_forms', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', prl.entity_id,
              'form_text', prl.form_text,
              'pronunciation_link_id', prl.pronunciation_link_id,
              'external_id', prl.pronunciation_link_external_id,
              'variant_order', prl.variant_order,
              'usage_label', prl.usage_label,
              'note', prl.note
            )
            order by prl.variant_order, prl.pronunciation_link_id
          )
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
            and prl.entity_type = 'form'
        ), '[]'::jsonb),
        'linked_ftg_links', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', prl.entity_id,
              'form_id', prl.ftgl_form_id,
              'translation', prl.ftg_translation,
              'pronunciation_link_id', prl.pronunciation_link_id,
              'external_id', prl.pronunciation_link_external_id,
              'variant_order', prl.variant_order,
              'usage_label', prl.usage_label,
              'note', prl.note
            )
            order by prl.variant_order, prl.pronunciation_link_id
          )
          from raw_links prl
          where prl.pronunciation_id = rl.pronunciation_id
            and prl.entity_type = 'form_translation_group_link'
        ), '[]'::jsonb)
      ) as group_json
    from raw_links rl
    group by rl.pronunciation_id
  )
  select coalesce(
    jsonb_agg(group_json order by group_rank, first_variant_order, pronunciation_id),
    '[]'::jsonb
  )
  from grouped;
$$;

create or replace function public.app_word_primary_pronunciation_group_json(p_word_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  select case
    when jsonb_typeof(groups) = 'array' and jsonb_array_length(groups) > 0 then groups -> 0
    else null
  end
  from (
    select public.app_word_pronunciation_groups_json(p_word_id) as groups
  ) src;
$$;

create or replace function public.refresh_word_propagation(p_word_id uuid default null)
returns void
language plpgsql
as $$
declare
  rec record;
  attr_rec record;
  value_rec record;
  propagated_count integer := 0;
  processed_words integer := 0;
  start_time timestamp := clock_timestamp();
  processing_time interval;
begin
  raise notice 'Starting unified word propagation at %', start_time;

  delete from entity_meta_values
  where entity_type = 'word'
    and propagation_source_id is not null
    and (p_word_id is null or entity_id = p_word_id);

  get diagnostics propagated_count = row_count;
  raise notice 'Cleared % existing propagated entries', propagated_count;

  for rec in
    select w.id as word_id, w.italian as word_text
    from dictionary w
    where (p_word_id is null or w.id = p_word_id)
    order by w.italian
  loop
    processed_words := processed_words + 1;

    for attr_rec in
      select
        ma.id as attribute_id,
        ma.name as attribute_name,
        ma.propagation_rule,
        ma.source_level,
        ma.display_level
      from meta_attributes ma
      where ma.is_active = true
        and ma.propagation_rule is not null
        and ma.propagation_rule != 'ADMIN_ONLY'
        and ma.display_level = 'word'
        and ma.source_level in ('form', 'translation')
    loop
      if attr_rec.propagation_rule = 'ANY_MATCH' then
        if attr_rec.source_level = 'form' then
          for value_rec in
            select distinct
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              emv.created_at as source_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_forms wf on emv.entity_id = wf.id
            where emv.entity_type = 'form'
              and wf.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            order by emv.created_at
            limit 1
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'form', value_rec.source_entity_id, 'ANY_MATCH', value_rec.source_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;

        if attr_rec.source_level = 'translation' then
          for value_rec in
            select distinct
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              emv.created_at as source_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_translations wt on emv.entity_id = wt.id
            where emv.entity_type = 'word_translation'
              and wt.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            order by emv.created_at
            limit 1
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'translation', value_rec.source_entity_id, 'ANY_MATCH', value_rec.source_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;
      end if;

      if attr_rec.propagation_rule = 'COMBINE' then
        if attr_rec.source_level = 'form' then
          for value_rec in
            select distinct
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              min(emv.created_at) as earliest_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_forms wf on emv.entity_id = wf.id
            where emv.entity_type = 'form'
              and wf.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            group by emv.value_id, mv.attribute_id, emv.entity_id
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'form', value_rec.source_entity_id, 'COMBINE', value_rec.earliest_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;

        if attr_rec.source_level = 'translation' then
          for value_rec in
            select distinct
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              min(emv.created_at) as earliest_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_translations wt on emv.entity_id = wt.id
            where emv.entity_type = 'word_translation'
              and wt.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            group by emv.value_id, mv.attribute_id, emv.entity_id
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'translation', value_rec.source_entity_id, 'COMBINE', value_rec.earliest_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;
      end if;

      if attr_rec.propagation_rule = 'FIRST_WINS' then
        if attr_rec.source_level = 'form' then
          for value_rec in
            select
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              emv.created_at as source_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_forms wf on emv.entity_id = wf.id
            where emv.entity_type = 'form'
              and wf.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            order by emv.created_at asc
            limit 1
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'form', value_rec.source_entity_id, 'FIRST_WINS', value_rec.source_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;

        if attr_rec.source_level = 'translation' then
          for value_rec in
            select
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              emv.created_at as source_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_translations wt on emv.entity_id = wt.id
            where emv.entity_type = 'word_translation'
              and wt.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            order by emv.created_at asc
            limit 1
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'translation', value_rec.source_entity_id, 'FIRST_WINS', value_rec.source_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;
      end if;

      if attr_rec.propagation_rule = 'LAST_WINS' then
        if attr_rec.source_level = 'form' then
          for value_rec in
            select
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              emv.created_at as source_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_forms wf on emv.entity_id = wf.id
            where emv.entity_type = 'form'
              and wf.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            order by emv.created_at desc
            limit 1
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'form', value_rec.source_entity_id, 'LAST_WINS', value_rec.source_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;

        if attr_rec.source_level = 'translation' then
          for value_rec in
            select
              emv.value_id,
              mv.attribute_id,
              emv.entity_id as source_entity_id,
              emv.created_at as source_created_at
            from entity_meta_values emv
            join meta_values mv on emv.value_id = mv.id
            join word_translations wt on emv.entity_id = wt.id
            where emv.entity_type = 'word_translation'
              and wt.word_id = rec.word_id
              and mv.attribute_id = attr_rec.attribute_id
            order by emv.created_at desc
            limit 1
          loop
            insert into entity_meta_values (
              entity_type, entity_id, attribute_id, value_id,
              derived_from, propagation_source_id, propagation_method, created_at
            )
            values (
              'word', rec.word_id, value_rec.attribute_id, value_rec.value_id,
              'translation', value_rec.source_entity_id, 'LAST_WINS', value_rec.source_created_at
            )
            on conflict (entity_type, entity_id, value_id) do nothing;
          end loop;
        end if;
      end if;
    end loop;
  end loop;

  processing_time := clock_timestamp() - start_time;

  select count(*) into propagated_count
  from entity_meta_values
  where entity_type = 'word'
    and propagation_source_id is not null
    and (p_word_id is null or entity_id = p_word_id);

  raise notice 'Propagation completed: % words processed, % values propagated in %',
    processed_words, propagated_count, processing_time;
end;
$$;

create or replace function public.app_get_word_bundle(p_word_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with word_row as (
    select d.*,
      public.app_word_primary_pronunciation_group_json(d.id) as primary_pronunciation_group,
      public.app_word_pronunciation_groups_json(d.id) as pronunciation_groups
    from public.dictionary d
    where d.id = p_word_id
  )
  select jsonb_build_object(
    'word',
    jsonb_build_object(
      'id', d.id,
      'italian', d.italian,
      'word_type', d.word_type,
      'word_direct_core_tags', public.app_entity_core_tags_json_filtered('word', d.id, false),
      'word_inherited_core_tags', public.app_entity_core_tags_json_filtered('word', d.id, true),
      'word_display_core_tags', public.app_word_display_core_tags_json(d.id),
      'word_core_tags', public.app_word_display_core_tags_json(d.id),
      'word_optional_tags', public.app_entity_optional_tags_json('word', d.id),
      'primary_pronunciation_group', d.primary_pronunciation_group,
      'primary_pronunciation_link_id', d.primary_pronunciation_group ->> 'primary_pronunciation_link_id',
      'primary_pronunciation_id', d.primary_pronunciation_group ->> 'id',
      'primary_audio_asset_id', d.primary_pronunciation_group #>> '{primary_audio,id}',
      'primary_audio_bucket', d.primary_pronunciation_group #>> '{primary_audio,storage_bucket}',
      'primary_audio_object_key', d.primary_pronunciation_group #>> '{primary_audio,object_key}',
      'primary_audio_voice_name', d.primary_pronunciation_group #>> '{primary_audio,voice_name}',
      'primary_ipa', d.primary_pronunciation_group ->> 'ipa_pronunciation',
      'primary_phonetic', d.primary_pronunciation_group ->> 'phonetic_pronunciation'
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
    'pronunciation_groups', coalesce(d.pronunciation_groups, '[]'::jsonb),
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
              select 1 from public.word_translations wt where wt.id = vpr.entity_id and wt.word_id = d.id
            ))
         or (vpr.entity_type = 'form' and exists (
              select 1 from public.word_forms wf where wf.id = vpr.entity_id and wf.word_id = d.id
            ))
         or (vpr.entity_type = 'form_translation_group_link' and exists (
              select 1
              from public.form_translation_group_links ftgl
              join public.form_translation_groups ftg on ftg.id = ftgl.form_translation_group_id
              join public.word_translations wt on wt.id = ftg.word_translation_id
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
                select 1 from public.word_translations wt where wt.id = vpr.entity_id and wt.word_id = d.id
              ))
           or (vpr.entity_type = 'form' and exists (
                select 1 from public.word_forms wf where wf.id = vpr.entity_id and wf.word_id = d.id
              ))
           or (vpr.entity_type = 'form_translation_group_link' and exists (
                select 1
                from public.form_translation_group_links ftgl
                join public.form_translation_groups ftg on ftg.id = ftgl.form_translation_group_id
                join public.word_translations wt on wt.id = ftg.word_translation_id
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
                    select 1 from public.word_translations wt where wt.id = vpr.entity_id and wt.word_id = d.id
                  ))
              or (vpr.entity_type = 'form' and exists (
                    select 1 from public.word_forms wf where wf.id = vpr.entity_id and wf.word_id = d.id
                  ))
              or (vpr.entity_type = 'form_translation_group_link' and exists (
                    select 1
                    from public.form_translation_group_links ftgl
                    join public.form_translation_groups ftg on ftg.id = ftgl.form_translation_group_id
                    join public.word_translations wt on wt.id = ftg.word_translation_id
                    where ftgl.id = vpr.entity_id
                      and wt.word_id = d.id
                  ))
            )
          union
          select ml.media_asset_id
          from public.media_links ml
          where (ml.entity_type = 'word_translation' and exists (
                  select 1 from public.word_translations wt where wt.id = ml.entity_id and wt.word_id = d.id
                ))
             or (ml.entity_type = 'form_translation_group' and exists (
                  select 1
                  from public.form_translation_groups ftg
                  join public.word_translations wt on wt.id = ftg.word_translation_id
                  where ftg.id = ml.entity_id
                    and wt.word_id = d.id
                ))
             or (ml.entity_type = 'etymology_document' and exists (
                  select 1
                  from public.etymology_links el
                  where el.etymology_document_id = ml.entity_id
                    and ((el.entity_type = 'word' and el.entity_id = d.id)
                      or (el.entity_type = 'word_translation' and exists (
                          select 1 from public.word_translations wt where wt.id = el.entity_id and wt.word_id = d.id
                      )))
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
              select 1 from public.word_translations wt where wt.id = ml.entity_id and wt.word_id = d.id
            ))
         or (ml.entity_type = 'form_translation_group' and exists (
              select 1
              from public.form_translation_groups ftg
              join public.word_translations wt on wt.id = ftg.word_translation_id
              where ftg.id = ml.entity_id and wt.word_id = d.id
            ))
         or (ml.entity_type = 'etymology_document' and exists (
              select 1
              from public.etymology_links el
              where el.etymology_document_id = ml.entity_id
                and ((el.entity_type = 'word' and el.entity_id = d.id)
                  or (el.entity_type = 'word_translation' and exists (
                      select 1 from public.word_translations wt where wt.id = el.entity_id and wt.word_id = d.id
                  )))
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
  from word_row d;
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
  primary_pronunciation_group jsonb,
  pronunciation_groups jsonb,
  word_core_tags jsonb,
  word_direct_core_tags jsonb,
  word_inherited_core_tags jsonb,
  word_display_core_tags jsonb,
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
    case when include_audio and pg.primary_group is not null then jsonb_strip_nulls(jsonb_build_object(
      'pronunciation_link_id', pg.primary_group ->> 'primary_pronunciation_link_id',
      'pronunciation_id', pg.primary_group ->> 'id',
      'accent', pg.primary_group ->> 'accent',
      'ipa_pronunciation', pg.primary_group ->> 'ipa_pronunciation',
      'phonetic_pronunciation', pg.primary_group ->> 'phonetic_pronunciation'
    )) else null end as primary_pronunciation,
    case when include_audio then pg.primary_group -> 'primary_audio' else null end as primary_media,
    case when include_audio then pg.primary_group else null end as primary_pronunciation_group,
    case when include_audio then coalesce(pg.groups, '[]'::jsonb) else '[]'::jsonb end as pronunciation_groups,
    case when include_word_core then public.app_word_display_core_tags_json(w.id) else null end as word_core_tags,
    case when include_word_core then public.app_entity_core_tags_json_filtered('word', w.id, false) else null end as word_direct_core_tags,
    case when include_word_core then public.app_entity_core_tags_json_filtered('word', w.id, true) else null end as word_inherited_core_tags,
    case when include_word_core then public.app_word_display_core_tags_json(w.id) else null end as word_display_core_tags,
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
  left join lateral (
    select
      public.app_word_pronunciation_groups_json(w.id) as groups,
      public.app_word_primary_pronunciation_group_json(w.id) as primary_group
  ) pg on true
  order by w.italian asc, w.id asc;
end;
$$;
