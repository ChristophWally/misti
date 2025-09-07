-- FIX: app_get_dictionary_listing RPC function - Handle Conditional Level Overrides
-- Problem: RPC function ignores conditional_display_level overrides from meta_word_type_rules/metaval_rules
-- Solution: Create dynamic display level logic that applies conditional overrides based on word type

-- Option 1: Use DEPRECATED meta_word_type_rules table (temporary fix)
-- Option 2: Use NEW metaval_rules table (recommended long-term)

-- =============================================================================
-- OPTION 1: TEMPORARY FIX USING DEPRECATED meta_word_type_rules TABLE
-- =============================================================================

CREATE OR REPLACE FUNCTION app_get_dictionary_listing(
  q text DEFAULT NULL,
  word_types text[] DEFAULT NULL,
  filters jsonb DEFAULT NULL,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0,
  word_ids uuid[] DEFAULT NULL,
  include_audio boolean DEFAULT true,
  include_translation_core boolean DEFAULT true,
  include_translation_optional boolean DEFAULT true,
  include_word_core boolean DEFAULT true,
  include_word_optional boolean DEFAULT true
) RETURNS TABLE(
  word_id uuid,
  italian text,
  word_type text,
  audio_filename text,
  ipa_pronunciation text,
  word_core_tags jsonb,
  word_optional_tags jsonb,
  translations jsonb,
  total_count integer
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH filter_ids AS (
    SELECT d.id
    FROM dictionary d
    WHERE (
      filters IS NULL OR jsonb_typeof(filters) <> 'array' OR NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(filters) AS f(obj)
        WHERE NOT EXISTS (
          SELECT 1
          FROM entity_meta_values emv
          JOIN meta_values mv ON mv.id = emv.value_id
          JOIN meta_attributes ma ON ma.id = mv.attribute_id
          WHERE emv.entity_type = 'word'
            AND emv.entity_id = d.id
            AND ma.stable_id = (f.obj ->> 'attribute')
            AND (
              mv.stable_id = ANY (ARRAY(SELECT jsonb_array_elements_text(f.obj -> 'values')))
              OR mv.value = ANY (ARRAY(SELECT jsonb_array_elements_text(f.obj -> 'values')))
            )
        )
      )
    )
  ),
  base_candidates AS (
    SELECT d.id, d.italian, d.word_type, d.audio_filename, d.ipa_pronunciation
    FROM dictionary d
    WHERE (
      word_ids IS NOT NULL AND d.id = ANY(word_ids)
    ) OR (
      word_ids IS NULL
      AND (q IS NULL OR d.italian ILIKE (q || '%'))
      AND (word_types IS NULL OR array_length(word_types,1) IS NULL OR LOWER(d.word_type) = ANY(word_types))
      AND (
        filters IS NULL OR jsonb_typeof(filters) <> 'array' OR d.id IN (SELECT id FROM filter_ids)
      )
    )
  ),
  base_words AS (
    SELECT * FROM base_candidates
    ORDER BY italian ASC, id ASC
    LIMIT LEAST(GREATEST(COALESCE(limit_count,20), 1), 100)
    OFFSET GREATEST(COALESCE(offset_count,0), 0)
  ),
  words_with_count AS (
    SELECT bw.*, (COUNT(*) OVER())::integer AS total_count
    FROM base_words bw
  ),
  -- FIXED: Dynamic display level logic with conditional overrides
  word_core AS (
    SELECT emv.entity_id AS word_id,
           jsonb_agg(
             jsonb_build_object(
               'attribute_id', ma.id,
               'attribute_stable_id', ma.stable_id,
               'attribute_display_name', COALESCE(ma.display_name, ma.name),
               'value_id', mv.id,
               'value_stable_id', mv.stable_id,
               'value_label', mv.value,
               'value_shorthand', mv.shorthand,
               'value_description', mv.description
             ) ORDER BY ma.stable_id, mv.sort_order NULLS LAST, mv.value
           ) AS tags
    FROM entity_meta_values emv
    JOIN meta_values mv ON mv.id = emv.value_id
    JOIN meta_attributes ma ON ma.id = mv.attribute_id
    JOIN words_with_count w ON w.id = emv.entity_id  -- Join to get word_type
    LEFT JOIN meta_word_type_rules mwtr ON (
      mwtr.attribute_id = ma.id 
      AND LOWER(mwtr.word_type) = LOWER(w.word_type)
    )
    WHERE emv.entity_type = 'word'
      AND ma.stable_id NOT LIKE 'metaattr_opt_tag_%'
      -- FIXED: Apply conditional display level logic
      AND (
        -- Use conditional_display_level if it exists for this word_type
        (mwtr.conditional_display_level IS NOT NULL AND mwtr.conditional_display_level = 'word')
        OR
        -- Fall back to base display_level if no conditional override
        (mwtr.conditional_display_level IS NULL AND ma.display_level = 'word')
      )
    GROUP BY emv.entity_id
  ),
  word_optional AS (
    SELECT emv.entity_id AS word_id,
           jsonb_agg(
             jsonb_build_object(
               'attribute_id', ma.id,
               'attribute_stable_id', ma.stable_id,
               'attribute_display_name', COALESCE(ma.display_name, ma.name),
               'value_id', mv.id,
               'value_stable_id', mv.stable_id,
               'value_label', mv.value,
               'value_shorthand', mv.shorthand,
               'value_description', mv.description
             ) ORDER BY ma.stable_id, mv.sort_order NULLS LAST, mv.value
           ) AS tags
    FROM entity_meta_values emv
    JOIN meta_values mv ON mv.id = emv.value_id
    JOIN meta_attributes ma ON ma.id = mv.attribute_id
    WHERE emv.entity_type = 'word'
      AND ma.stable_id LIKE 'metaattr_opt_tag_%'
    GROUP BY emv.entity_id
  ),
  translations_json AS (
    SELECT wt.word_id,
           jsonb_agg(
             jsonb_build_object(
               'id', wt.id,
               'translation', wt.translation,
               'display_priority', wt.display_priority,
               'is_primary', (wt.display_priority = 1),
               'core_tags', CASE WHEN include_translation_core THEN (
                 SELECT COALESCE(jsonb_agg(
                   jsonb_build_object(
                     'attribute_id', ma.id,
                     'attribute_stable_id', ma.stable_id,
                     'attribute_display_name', COALESCE(ma.display_name, ma.name),
                     'value_id', mv.id,
                     'value_stable_id', mv.stable_id,
                     'value_label', mv.value,
                     'value_shorthand', mv.shorthand,
                     'value_description', mv.description
                   ) ORDER BY ma.stable_id, mv.sort_order NULLS LAST, mv.value
                 ), '[]'::jsonb)
                 FROM entity_meta_values emv
                 JOIN meta_values mv ON mv.id = emv.value_id
                 JOIN meta_attributes ma ON ma.id = mv.attribute_id
                 WHERE emv.entity_type = 'word_translation'
                   AND emv.entity_id = wt.id
                   AND ma.stable_id NOT LIKE 'metaattr_opt_tag_%'
               ) ELSE NULL END,
               'optional_tags', CASE WHEN include_translation_optional THEN (
                 SELECT COALESCE(jsonb_agg(
                   jsonb_build_object(
                     'attribute_id', ma.id,
                     'attribute_stable_id', ma.stable_id,
                     'attribute_display_name', COALESCE(ma.display_name, ma.name),
                     'value_id', mv.id,
                     'value_stable_id', mv.stable_id,
                     'value_label', mv.value,
                     'value_shorthand', mv.shorthand,
                     'value_description', mv.description
                   ) ORDER BY ma.stable_id, mv.sort_order NULLS LAST, mv.value
                 ), '[]'::jsonb)
                 FROM entity_meta_values emv
                 JOIN meta_values mv ON mv.id = emv.value_id
                 JOIN meta_attributes ma ON ma.id = mv.attribute_id
                 WHERE emv.entity_type = 'word_translation'
                   AND emv.entity_id = wt.id
                   AND ma.stable_id LIKE 'metaattr_opt_tag_%'
               ) ELSE NULL END
             )
             ORDER BY wt.display_priority ASC, wt.created_at ASC, wt.id ASC
           ) AS translations
    FROM word_translations wt
    GROUP BY wt.word_id
  )
  SELECT 
    w.id AS word_id,
    w.italian,
    w.word_type,
    CASE WHEN include_audio THEN COALESCE(w.audio_filename, wam.audio_filename) ELSE NULL END AS audio_filename,
    CASE WHEN include_audio THEN w.ipa_pronunciation ELSE NULL END AS ipa_pronunciation,
    CASE WHEN include_word_core THEN wc.tags ELSE NULL END AS word_core_tags,
    CASE WHEN include_word_optional THEN wo.tags ELSE NULL END AS word_optional_tags,
    COALESCE(tj.translations, '[]'::jsonb) AS translations,
    w.total_count
  FROM words_with_count w
  LEFT JOIN word_core wc ON wc.word_id = w.id
  LEFT JOIN word_optional wo ON wo.word_id = w.id
  LEFT JOIN translations_json tj ON tj.word_id = w.id
  LEFT JOIN LATERAL (
    SELECT wam.audio_filename, wam.azure_voice_name
    FROM word_audio_metadata wam
    WHERE wam.word_id = w.id
    ORDER BY wam.generated_at DESC NULLS LAST, wam.created_at DESC NULLS LAST
    LIMIT 1
  ) wam ON TRUE
  ORDER BY w.italian ASC, w.id ASC;
END;
$$;

-- =============================================================================
-- OPTION 2: FUTURE-PROOF FIX USING metaval_rules TABLE (RECOMMENDED)
-- =============================================================================

-- This version uses the new metaval_rules table instead of deprecated meta_word_type_rules
-- Uncomment this when ready to fully migrate away from meta_word_type_rules

/*
CREATE OR REPLACE FUNCTION app_get_dictionary_listing_v2(
  q text DEFAULT NULL,
  word_types text[] DEFAULT NULL,
  filters jsonb DEFAULT NULL,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0,
  word_ids uuid[] DEFAULT NULL,
  include_audio boolean DEFAULT true,
  include_translation_core boolean DEFAULT true,
  include_translation_optional boolean DEFAULT true,
  include_word_core boolean DEFAULT true,
  include_word_optional boolean DEFAULT true
) RETURNS TABLE(
  word_id uuid,
  italian text,
  word_type text,
  audio_filename text,
  ipa_pronunciation text,
  word_core_tags jsonb,
  word_optional_tags jsonb,
  translations jsonb,
  total_count integer
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH ... -- same base CTEs as above ...
  
  -- FUTURE: Enhanced word_core using metaval_rules
  word_core AS (
    SELECT emv.entity_id AS word_id,
           jsonb_agg(
             jsonb_build_object(
               'attribute_id', ma.id,
               'attribute_stable_id', ma.stable_id,
               'attribute_display_name', COALESCE(ma.display_name, ma.name),
               'value_id', mv.id,
               'value_stable_id', mv.stable_id,
               'value_label', mv.value,
               'value_shorthand', mv.shorthand,
               'value_description', mv.description
             ) ORDER BY ma.stable_id, mv.sort_order NULLS LAST, mv.value
           ) AS tags
    FROM entity_meta_values emv
    JOIN meta_values mv ON mv.id = emv.value_id
    JOIN meta_attributes ma ON ma.id = mv.attribute_id
    JOIN words_with_count w ON w.id = emv.entity_id
    LEFT JOIN metaval_rules mvr ON (
      mvr.attribute_id = ma.id 
      AND mvr.rule_type = 'word_type'
      AND LOWER(mvr.word_type) = LOWER(w.word_type)
      AND mvr.is_active = true
    )
    WHERE emv.entity_type = 'word'
      AND ma.stable_id NOT LIKE 'metaattr_opt_tag_%'
      -- Enhanced conditional display level logic using metaval_rules
      AND (
        -- Use conditional_display_level from rule_config if exists
        (mvr.rule_config->>'conditional_display_level' IS NOT NULL 
         AND mvr.rule_config->>'conditional_display_level' = 'word')
        OR
        -- Fall back to base display_level if no conditional override
        (mvr.rule_config->>'conditional_display_level' IS NULL 
         AND ma.display_level = 'word')
      )
    GROUP BY emv.entity_id
  )
  
  ... -- rest same as above
END;
$$;
*/

-- =============================================================================
-- TESTING QUERIES
-- =============================================================================

-- Test 1: Verify noun_gender appears in word_core_tags for NOUNs (should work before and after fix)
-- SELECT word_id, italian, word_type, word_core_tags 
-- FROM app_get_dictionary_listing(word_types := ARRAY['noun'], limit_count := 5)
-- WHERE word_core_tags IS NOT NULL;

-- Test 2: Verify number now appears in word_core_tags for NOUNs (should be fixed)
-- SELECT word_id, italian, word_type, 
--        jsonb_pretty(word_core_tags) as core_tags
-- FROM app_get_dictionary_listing(word_types := ARRAY['noun'], limit_count := 5)
-- WHERE word_core_tags::text LIKE '%number%' OR word_core_tags::text LIKE '%metaattr012%';

-- Test 3: Verify number does NOT appear in word_core_tags for VERBs (should remain form-level only)  
-- SELECT word_id, italian, word_type, word_core_tags
-- FROM app_get_dictionary_listing(word_types := ARRAY['verb'], limit_count := 5)
-- WHERE word_core_tags::text LIKE '%number%' OR word_core_tags::text LIKE '%metaattr012%';