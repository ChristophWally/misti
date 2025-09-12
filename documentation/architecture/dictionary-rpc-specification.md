# Dictionary RPC Specification

**Document Version**: 1.0  
**Last Updated**: September 12, 2025  
**Status**: Implementation Specification

---

## Overview

The `app_get_dictionary_listing` RPC function is the primary data access point for the Misti dictionary system. This document specifies its current functionality and proposed extensions to support the conjugation system optimization.

---

## Current RPC Function

### Function Signature
```sql
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
)
```

### Current Return Schema
```sql
RETURNS TABLE(
  word_id uuid,
  italian text,
  word_type text,
  audio_filename text,
  ipa_pronunciation text,
  word_core_tags jsonb,
  word_optional_tags jsonb,
  translations jsonb,
  total_count integer
)
```

### Current Functionality
- **Word Filtering**: Search by text, word types, and metadata filters
- **Pagination**: Limit and offset support
- **Conditional Loading**: Optional inclusion of audio and tag metadata
- **Translation Data**: Pre-processed translation information with RPC tags
- **Performance Optimization**: Uses normalized `entity_meta_values` table
- **Tag Processing**: Server-side tag aggregation and formatting

---

## Proposed Extensions for Conjugation System

### Extended Function Signature
```sql
CREATE OR REPLACE FUNCTION app_get_dictionary_listing(
  -- Existing parameters (unchanged)
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
  include_word_optional boolean DEFAULT true,
  
  -- NEW: Conjugation system parameters
  include_forms boolean DEFAULT false,
  include_form_translations boolean DEFAULT false
)
```

### Extended Return Schema
```sql
RETURNS TABLE(
  -- Existing fields (unchanged)
  word_id uuid,
  italian text,
  word_type text,
  audio_filename text,
  ipa_pronunciation text,
  word_core_tags jsonb,
  word_optional_tags jsonb,
  translations jsonb,
  total_count integer,
  
  -- NEW: Conjugation fields (only populated when requested)
  forms jsonb,              -- when include_forms=true
  form_translations jsonb   -- when include_form_translations=true
)
```

---

## Data Structure Specifications

### Current Translation Data Structure
```json
{
  "translations": [
    {
      "id": "uuid",
      "translation": "to sleep",
      "display_priority": 1,
      "usage_notes": "common verb",
      "core_tags": [
        {
          "attribute_id": "uuid",
          "attribute_stable_id": "metaattr002",
          "value_id": "uuid",
          "value_label": "avere",
          "value_shorthand": "av."
        }
      ],
      "optional_tags": []
    }
  ]
}
```

### New Forms Data Structure (when `include_forms=true`)
```json
{
  "forms": [
    {
      "id": "uuid",
      "form_text": "dormo",
      "form_type": "conjugation",
      "mood": "indicativo",
      "tense": "presente",
      "person": "io",
      "core_tags": [
        {
          "attribute_stable_id": "metaattr005",
          "value_label": "presente",
          "value_shorthand": "pres."
        }
      ]
    }
  ]
}
```

### New Form Translations Data Structure (when `include_form_translations=true`)
```json
{
  "form_translations": [
    {
      "id": "uuid",
      "form_id": "uuid",
      "word_translation_id": "uuid", 
      "translation": "I sleep",
      "confidence_score": 0.95,
      "assignment_method": "exact_match",
      "usage_examples": ["Io dormo bene la notte"]
    }
  ]
}
```

---

## Use Case Specifications

### Use Case 1: Dictionary Browsing (Current Behavior)
**Client Call:**
```javascript
const { data } = await supabase.rpc('app_get_dictionary_listing', {
  limit_count: 20,
  include_audio: true
  // include_forms: false (default)
  // include_form_translations: false (default)
})
```

**Expected Behavior:**
- Returns word list with translations and metadata
- **No performance impact**: forms data not fetched
- **Backward compatible**: existing functionality unchanged

### Use Case 2: Conjugation Modal (New Behavior)
**Client Call:**
```javascript
const { data } = await supabase.rpc('app_get_dictionary_listing', {
  word_ids: [selectedWordId],
  limit_count: 1,
  include_forms: true,
  include_form_translations: true
})
```

**Expected Behavior:**
- Returns single word with complete conjugation data
- **Single query**: replaces current multi-query pattern in ConjugationModal
- **Pre-processed**: forms organized by mood/tense, tags resolved

### Use Case 3: Study Session (Batch Optimization)
**Client Call:**
```javascript
const { data } = await supabase.rpc('app_get_dictionary_listing', {
  word_ids: studyWordIds,
  include_forms: true,
  include_form_translations: false // translation assignments not needed for display
})
```

**Expected Behavior:**
- Returns multiple words with conjugation data
- **Batch optimization**: prevents N+1 query patterns
- **Selective loading**: only includes needed data

---

## Implementation Requirements

### Database Schema Requirements
The extended RPC requires access to these existing tables:
- `dictionary` (already accessed)
- `word_forms` (new access needed)
- `form_translations` (new access needed)
- `entity_meta_values` (already accessed for forms)
- `meta_values` and `meta_attributes` (already accessed)

### Performance Considerations

#### Query Optimization
```sql
-- Additional CTEs needed for conjugation data
forms_data AS (
  SELECT 
    wf.word_id,
    jsonb_agg(
      jsonb_build_object(
        'id', wf.id,
        'form_text', wf.form_text,
        'mood', wf.mood,
        'tense', wf.tense,
        'person', wf.person,
        'core_tags', wf_tags.tags
      ) ORDER BY wf.mood, wf.tense, wf.person
    ) AS forms
  FROM word_forms wf
  LEFT JOIN form_core_tags wf_tags ON wf_tags.form_id = wf.id
  WHERE ($include_forms = true) AND wf.word_id IN (SELECT id FROM base_words)
  GROUP BY wf.word_id
)
```

#### Index Requirements
Ensure these indexes exist for optimal performance:
```sql
CREATE INDEX IF NOT EXISTS idx_word_forms_word_id_mood_tense 
  ON word_forms(word_id, mood, tense, person);

CREATE INDEX IF NOT EXISTS idx_form_translations_form_id 
  ON form_translations(form_id);
```

### Backward Compatibility Requirements
- **Default Parameters**: New parameters must default to `false`
- **Optional Fields**: New return fields must be nullable/optional
- **Existing Calls**: All current client calls continue to work unchanged
- **Performance**: Dictionary browsing performance must not degrade

---

## Integration Points

### ConjugationModal Integration
**Before (Multiple Queries):**
```javascript
// Current implementation requires multiple calls
const word = await fetchWord(wordId)
const forms = await fetchWordForms(wordId)  
const translations = await fetchTranslations(wordId)
const formTranslations = await fetchFormTranslations(forms.map(f => f.id))
```

**After (Single RPC Call):**
```javascript
// New implementation uses single optimized call
const { data } = await supabase.rpc('app_get_dictionary_listing', {
  word_ids: [wordId],
  include_forms: true,
  include_form_translations: true
})
const word = data[0] // Contains all needed data
```

### WordCard Integration (Unchanged)
WordCard continues to use existing dictionary listing calls:
```javascript
const { data } = await supabase.rpc('app_get_dictionary_listing', {
  limit_count: 20
  // Forms data not requested, no performance impact
})
```

### Enhanced Dictionary System Integration
The `enhanced-dictionary-system.js` will use conditional parameters based on context:
- **Dictionary browsing**: `include_forms: false` (fast)
- **Conjugation modal**: `include_forms: true` (comprehensive)

---

## Testing & Validation Requirements

### Performance Testing
- **Benchmark current performance**: Measure existing dictionary listing speed
- **Test extended functionality**: Ensure conjugation data loading meets performance targets
- **Regression testing**: Verify no performance degradation for existing use cases

### Functional Testing
- **Backward compatibility**: All existing functionality works unchanged
- **Data integrity**: Forms and translations return correct, complete data
- **Error handling**: Graceful degradation when forms data unavailable

### Load Testing
- **Concurrent requests**: Test multiple users loading conjugations simultaneously  
- **Large datasets**: Ensure performance with verbs having 50+ conjugated forms
- **Memory usage**: Monitor database memory consumption with extended queries

---

## Migration Strategy

### Phase 1: RPC Extension (No Client Changes)
1. Extend RPC function with new optional parameters
2. Add forms and form_translations data when requested
3. Test thoroughly with existing client calls (should be unchanged)

### Phase 2: ConjugationModal Integration
1. Update ConjugationModal to use extended RPC
2. Remove existing multi-query pattern
3. Implement client-side caching for conjugation data

### Phase 3: Performance Optimization
1. Monitor real-world performance metrics
2. Optimize database queries based on usage patterns
3. Implement additional caching if needed

---

## Success Metrics

### Performance Targets
- **Dictionary listing**: <200ms response time (unchanged)
- **Conjugation loading**: <400ms response time (improvement from current ~800ms)
- **Memory usage**: No significant increase in database memory consumption

### Code Quality Targets
- **Reduced complexity**: ConjugationModal code reduction through single RPC call
- **Maintainability**: Centralized data processing in RPC function
- **Reliability**: Single point of data access reduces synchronization issues

---

## Future Considerations

### Potential Extensions
- `include_audio_metadata`: Extended audio information for conjugated forms
- `include_usage_examples`: Example sentences for forms
- `include_pronunciation_guides`: IPA for irregular conjugations

### Optimization Opportunities
- **Selective form loading**: Filter forms by mood/tense in RPC parameters
- **Translation prioritization**: Load only primary translation data
- **Caching strategies**: Database-level caching for frequently accessed conjugations

This specification provides the complete technical foundation for implementing the conjugation system optimization while maintaining the robust architecture that currently powers Misti's dictionary system.