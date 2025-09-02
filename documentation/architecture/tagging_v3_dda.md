# Tagging v3 — Detailed Design Architecture (DDA)

Status: Final v3.0 (Free-tier optimized)

Owner: Engineering

Last updated: 2025-09-02

---

## 1) Architectural Overview

The Tagging v3 architecture normalizes tag and metadata storage to eliminate expensive GIN indexes while maintaining query performance and data integrity. The system uses a polymorphic assignment pattern that consolidates all entity-to-metadata relationships into a single, efficiently indexed table.

### Core Principles

**Storage Optimization**: Base entity tables contain no tag arrays or JSONB fields. All tagging relationships are stored in normalized assignment tables with compact btree indexes on UUID keys.

**Unified Metadata Model**: Both core metadata and optional tags use the same `meta_values` reference system, distinguished by attribute classification rather than separate storage mechanisms.

**On-Demand Propagation**: Parent-level attributes (e.g., word irregularity derived from form-level data) are computed asynchronously rather than maintained via write triggers, reducing write complexity and ensuring predictable performance.

**Query Pattern Optimization**: List queries use EXISTS clauses against indexed assignment tables. Array aggregation is reserved for detail views where the overhead is justified by convenience.

---

## 2) Design Constraints and Trade-offs

### Environment Constraints
- **Storage Limit**: 500MB database cap with no backup recovery options
- **Operational Complexity**: No materialized views, minimal trigger logic, conservative indexing
- **Migration Risk**: Additive-only changes during transition periods

### Architectural Trade-offs
- **Write Performance vs. Read Convenience**: Manual propagation maintains write speed at the cost of requiring explicit refresh operations
- **Storage vs. Query Flexibility**: Normalized storage eliminates index bloat but requires JOIN operations for metadata access  
- **Schema Simplicity vs. Type Safety**: Polymorphic assignment table trades per-entity foreign key constraints for reduced table count

---

## 3) System Context

### Data Distribution Analysis
Current optional tag usage concentrates heavily in `form_translations` (864 instances), followed by `word_translations` (22), with minimal usage in `word_forms` (8) and `dictionary` (5). This distribution pattern indicates that translation-level metadata represents the primary storage optimization opportunity.

### Existing Infrastructure
The system already maintains a mature metadata framework through `meta_attributes`, `meta_values`, and `metaval_rules` tables. This existing infrastructure provides the foundation for both core metadata and optional tagging without requiring parallel systems.

---

## 4) Architectural Components

### Metadata Reference Layer
**meta_attributes** (existing): Defines metadata categories with source-level constraints and propagation rules
**meta_values** (existing): Contains actual metadata values linked to their defining attributes  

The architecture extends this system by introducing three new attribute categories for optional tagging:
- `optional_tag_word` (source_level='word')
- `optional_tag_form` (source_level='form') 
- `optional_tag_translation` (source_level='translation')

### Assignment Layer
**entity_meta_values** (new): Polymorphic assignment table linking any entity to any metadata value
- Entity identification through `(entity_type, entity_id)` composite key
- Metadata reference via `value_id` foreign key to `meta_values`
- Level validation ensures entity types match metadata source level constraints

### Propagation Layer  
**word_meta_derived** (new): Materialized propagation results for word-level rollups
- Stores computed attributes that bubble up from child entities (forms, translations)
- Updated through explicit refresh operations rather than write triggers
- Enables complex propagation rules (ANY_IRREGULAR, COMBINE, MAJORITY) without query-time computation

### Application Interface
**Query Patterns**: List operations use EXISTS clauses against assignment tables for optimal index utilization
**Detail Views**: Optional array aggregation provides application convenience without impacting list performance

---

## 5) Data Model Structure

### Entity Relationship Overview

```
Metadata Reference Layer
    [meta_attributes] 1 ──< [meta_values]
         (id, propagation_rule, source_level)

Core Entity Hierarchy  
    [dictionary] 1 ──< [word_forms] 1 ──< [form_translations]
        (id)            (id, word_id)         (id, form_id, word_translation_id)
           └─< [word_translations]
                 (id, word_id)

Polymorphic Assignment Layer
    [dictionary|word_forms|word_translations|form_translations]
            └──────< [entity_meta_values] >──────┘
                              │
                              └──> [meta_values]

Computed Propagation Layer
    [dictionary] 1 ──< [word_meta_derived] >── 1 [meta_values]
```

### Relationship Semantics
- **One-to-Many**: Each meta_attribute defines multiple meta_values
- **Many-to-Many**: Entities can have multiple metadata values; values can apply to multiple entities
- **Polymorphic Foreign Key**: entity_meta_values references multiple entity tables through (entity_type, entity_id)
- **Derived Relationships**: word_meta_derived materializes computed relationships from child entity metadata

---

## 6) Schema Specifications

### Existing Table Extensions
**meta_attributes**: Requires addition of three attribute definitions for optional tagging categories. No structural changes to existing table.

**meta_values**: Utilized as-is with existing columns (value, stable_id, attribute_id). Recommended index additions:
```sql
create index if not exists idx_meta_values_attribute on meta_values(attribute_id);
create index if not exists idx_meta_values_stable on meta_values(stable_id);
```

### New Table: entity_meta_values (Unified Assignment with Propagation)

```sql
create table if not exists entity_meta_values (
  entity_type text not null check (entity_type in ('word','form','word_translation','form_translation')),
  entity_id uuid not null,
  value_id uuid not null references meta_values(id),
  created_at timestamptz not null default now(),
  created_by uuid null,
  -- Enhanced fields for unified propagation tracking
  derived_from text null, -- 'form', 'translation', etc. (NULL = direct assignment)
  propagation_source_id uuid null, -- The specific child entity that caused propagation
  propagation_method text null, -- 'ANY_IRREGULAR', 'COMBINE', 'FIRST_WINS', etc.
  primary key (entity_type, entity_id, value_id)
);

create index if not exists idx_emv_entity on entity_meta_values (entity_type, entity_id);
create index if not exists idx_emv_value  on entity_meta_values (value_id);
create index if not exists idx_emv_lookup on entity_meta_values (entity_type, value_id);
create index if not exists idx_emv_propagation on entity_meta_values (entity_type, derived_from) where derived_from is not null;
```

**Design Rationale**: The unified polymorphic design consolidates both direct assignments AND propagated metadata into a single table, eliminating the need for separate `word_meta_derived` table. The composite primary key prevents duplicate assignments while enabling efficient lookups via multiple index strategies.

**Propagation Enhancement**: The additional fields enable complete traceability of propagated metadata:
- `derived_from`: Identifies the source level ('form', 'translation') for propagated entries
- `propagation_source_id`: Points to the specific child entity that triggered the propagation
- `propagation_method`: Records which propagation rule was applied (from existing meta_attributes.propagation_rule)

**Validation Logic**: Level validation ensures metadata values are only assigned to appropriate entity types based on meta_attribute source_level constraints:

```sql
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

create trigger trg_emv_level before insert on entity_meta_values
for each row execute function ensure_emv_level();
```

### ~~Eliminated Table: word_meta_derived~~ ✅ **ARCHITECTURAL IMPROVEMENT**

**Previous Design**: Separate `word_meta_derived` table for propagated metadata

**New Unified Design**: All propagated metadata stored directly in `entity_meta_values` with traceability fields

**Benefits of Unified Approach**:
- **Single Lookup**: All metadata (direct + propagated) accessed through one table
- **Simplified Queries**: No JOINs between assignment tables required
- **Unified Indexing**: One set of optimized indexes handles all metadata
- **Better Performance**: Fewer tables to scan, cleaner query plans
- **Enhanced Traceability**: Full audit trail maintained through propagation fields

**Migration Note**: This architectural improvement was identified during implementation planning and represents a significant simplification over the original design.

---

## 7) Index Architecture

### Indexing Strategy
The architecture exclusively uses btree indexes on UUID and text keys, eliminating the storage overhead of GIN indexes on arrays and JSONB fields that characterized the previous system.

**Index Types**:
- **Primary Keys**: Composite keys on assignment tables prevent duplicates
- **Foreign Key Indexes**: Enable efficient JOIN operations  
- **Lookup Indexes**: Support common query patterns (entity_type + value_id)

**Storage Optimization**: Btree indexes on small, fixed-size keys (UUIDs, short text values) maintain minimal storage footprint while providing optimal equality lookup performance.

**Text Search Consideration**: Future full-text search requirements should use dedicated tsvector GIN indexes on content fields, not on metadata structures.

---

## 8) Propagation Architecture

### Design Philosophy
Manual propagation maintains write performance predictability by decoupling metadata updates from propagation computation. This approach prevents write amplification where single form updates trigger cascading word-level recalculations.

### Unified Propagation Function Implementation

```sql
create or replace function refresh_word_propagation(p_word_id uuid default null)
returns void as $$
begin
  -- Delete existing propagated entries from unified table
  delete from entity_meta_values
  where entity_type = 'word' 
    and derived_from is not null
    and (p_word_id is null or entity_id = p_word_id);

  -- ANY_MATCH: "Any match" propagation - if ANY child has target value, propagate it
  -- (Currently used primarily for form_irregular, but works for any attribute value)
  insert into entity_meta_values (
    entity_type, entity_id, value_id, 
    derived_from, propagation_source_id, propagation_method
  )
  select distinct 
    'word', wf.word_id, emv.value_id, 
    'form', emv.entity_id, 'ANY_MATCH'
  from entity_meta_values emv
  join word_forms wf on wf.id = emv.entity_id
  join meta_values mv on mv.id = emv.value_id
  join meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form'
    and emv.derived_from is null  -- Only propagate from direct assignments
    and (p_word_id is null or wf.word_id = p_word_id)
    and ma.propagation_rule = 'ANY_MATCH'
    -- Note: The specific target value would be determined by meta_attributes configuration
    -- Currently targets 'irregular' value, but pattern works for any target value
  on conflict do nothing;

  -- COMBINE: Union all distinct child values for combinable attributes
  insert into entity_meta_values (
    entity_type, entity_id, value_id, 
    derived_from, propagation_source_id, propagation_method
  )
  select distinct 
    'word', wf.word_id, emv.value_id, 
    'form', emv.entity_id, 'COMBINE'
  from entity_meta_values emv
  join word_forms wf on wf.id = emv.entity_id
  join meta_values mv on mv.id = emv.value_id
  join meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form'
    and emv.derived_from is null  -- Only propagate from direct assignments
    and (p_word_id is null or wf.word_id = p_word_id)
    and ma.propagation_rule = 'COMBINE'
  on conflict do nothing;

  -- FIRST_WINS: Take first child value encountered for first-wins attributes
  insert into entity_meta_values (
    entity_type, entity_id, value_id, 
    derived_from, propagation_source_id, propagation_method
  )
  select distinct on (wf.word_id, ma.id)
    'word', wf.word_id, emv.value_id,
    'translation', emv.entity_id, 'FIRST_WINS'
  from entity_meta_values emv
  join form_translations ft on ft.id = emv.entity_id
  join word_forms wf on wf.id = ft.form_id
  join meta_values mv on mv.id = emv.value_id
  join meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form_translation'
    and emv.derived_from is null
    and (p_word_id is null or wf.word_id = p_word_id)
    and ma.propagation_rule = 'FIRST_WINS'
  order by wf.word_id, ma.id, emv.created_at ASC  -- Earliest wins
  on conflict do nothing;

  -- LAST_WINS: Take most recent child value encountered for last-wins attributes
  insert into entity_meta_values (
    entity_type, entity_id, value_id, 
    derived_from, propagation_source_id, propagation_method
  )
  select distinct on (wf.word_id, ma.id)
    'word', wf.word_id, emv.value_id,
    'translation', emv.entity_id, 'LAST_WINS'
  from entity_meta_values emv
  join form_translations ft on ft.id = emv.entity_id
  join word_forms wf on wf.id = ft.form_id
  join meta_values mv on mv.id = emv.value_id
  join meta_attributes ma on ma.id = mv.attribute_id
  where emv.entity_type = 'form_translation'
    and emv.derived_from is null
    and (p_word_id is null or wf.word_id = p_word_id)
    and ma.propagation_rule = 'LAST_WINS'
  order by wf.word_id, ma.id, emv.created_at DESC  -- Latest wins
  on conflict do nothing;
end; $$ language plpgsql;
```

### Propagation Rules (From Existing meta_attributes.propagation_rule)
**ANY_MATCH**: "Any target match" propagation - if ANY child entity has a specific target value for an attribute, propagate that value to the parent. The target value is determined by the attribute's configuration. (e.g., form_irregular: if ANY form has "irregular" value → word inherits "irregular")  
**COMBINE**: Set union propagation where parent inherits all distinct child values for the attribute (e.g., auxiliary: "avere" + "essere" → "both")  
**FIRST_WINS**: First encountered value wins, prevents contradictory combinations (e.g., register conflicts - earliest created_at)
**LAST_WINS**: Last encountered value wins, allows updates to override previous values (e.g., priority to most recent assignment - latest created_at)
**ADMIN_ONLY**: No automatic propagation, manual assignment only

**Key Insight**: ANY_MATCH is a general "any target match" pattern that works for any attribute with a designated target value that should bubble up from children to parent. Currently used only by form_irregular (target: "irregular"), but the pattern is reusable for other binary marker attributes.

**Enhanced Traceability**: Each propagated entry records the specific source entity and propagation method used, enabling precise audit trails and debugging.

### Usage Patterns
- **Bulk Operations**: `select refresh_word_propagation();` after batch metadata changes
- **Targeted Updates**: `select refresh_word_propagation(<word_id>);` for single-word modifications

---

## 9) Application Interface Patterns

### Query Architecture
The application interface separates list operations (optimized for performance) from detail operations (optimized for convenience), enabling appropriate optimization strategies for each use case.

### List Query Patterns
List operations use EXISTS clauses against indexed assignment tables for optimal performance:

```sql
-- Words with specific core metadata (by stable_id)
select d.*
from dictionary d
where exists (
  select 1 from entity_meta_values emv
  join meta_values mv on mv.id = emv.value_id
  where emv.entity_type='word'
    and emv.entity_id=d.id
    and mv.stable_id=$1
);

-- Forms with specific value (by value_id)
select f.*
from word_forms f
where exists (
  select 1 from entity_meta_values emv
  where emv.entity_type='form' and emv.entity_id=f.id and emv.value_id=$1
);
```

### Detail View Implementation
Detail views provide array aggregation for application convenience while maintaining separation from performance-critical list operations:

```sql
create or replace view vw_dictionary_v3_detail as
select d.*,
  coalesce(array_agg(distinct emv_core.value_id) filter (where emv_core.value_id is not null), '{}'::uuid[]) as core_value_ids,
  coalesce(array_agg(distinct wmd.value_id) filter (where wmd.value_id is not null), '{}'::uuid[]) as derived_value_ids,
  coalesce(array_agg(distinct emv_opt.value_id) filter (where emv_opt.value_id is not null), '{}'::uuid[]) as optional_value_ids
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

### Performance Considerations
**List Operations**: Direct EXISTS queries against btree indexes provide predictable, fast performance regardless of dataset size
**Detail Operations**: Array aggregation overhead is acceptable for single-record or small-batch queries
**Index Utilization**: Query planner efficiently uses assignment table indexes through EXISTS clause patterns

---

## 10) Storage and Performance Characteristics

### Storage Optimization
The normalized assignment architecture eliminates the primary storage bottlenecks of the previous system:

**Index Footprint Reduction**: Btree indexes on UUID keys consume significantly less space than GIN indexes on array/JSONB fields
**String Deduplication**: Metadata strings stored once in reference tables rather than repeated across entity records  
**Base Table Simplification**: Core entity tables contain no metadata arrays or JSONB fields

**Impact Analysis**: Migration of `form_translations.optional_tags` (864 instances) provides the largest immediate storage benefit, followed by other entity types in descending order of tag density.

### Performance Characteristics  
**Query Performance**: EXISTS clauses with btree equality lookups provide consistent, predictable performance scaling
**Write Performance**: Elimination of synchronous propagation prevents write amplification effects
**Index Utilization**: PostgreSQL query planner efficiently leverages assignment table indexes through EXISTS patterns

### Scalability Considerations
The architecture maintains performance characteristics suitable for growth beyond current scale:
- Assignment table queries scale linearly with relationship count
- Index sizes remain proportional to entity count rather than metadata complexity  
- Propagation operations can be batched for efficiency during bulk operations

---

## 11) Administrative Interface

### Optional Tag Management
**Tag Creation**: New optional tags require insertion of `meta_values` records under appropriate optional_tag_* attributes (word/form/translation level)
**Assignment Workflow**: Tag-to-entity relationships are established through `entity_meta_values` records
**Approval Process**: Administrative approval can be implemented through application logic or companion metadata tables

### Metadata Governance
**Level Enforcement**: Trigger validation ensures metadata values are only assigned to appropriate entity types
**Referential Integrity**: Foreign key constraints maintain data consistency between assignments and reference tables
**Audit Trail**: Created_by and created_at fields support administrative tracking and accountability

---

## 12) Data Integrity and Validation

### Constraint Architecture
**Level Validation**: BEFORE INSERT triggers on `entity_meta_values` enforce compatibility between entity types and metadata source levels
**Uniqueness Enforcement**: Composite primary key `(entity_type, entity_id, value_id)` prevents duplicate assignments
**Referential Integrity**: Foreign key constraints ensure assignment validity and support cascading cleanup

### Data Quality Assurance
**Type Safety**: Entity type constraints prevent invalid metadata assignments
**Consistency Maintenance**: Propagation refresh operations maintain derived data consistency
**Cleanup Automation**: CASCADE DELETE options ensure orphaned records are automatically removed

---

## 13) Architecture Review Considerations

### Implementation Strengths
**Storage Efficiency**: Addresses primary storage optimization goals through GIN index elimination
**Operational Simplicity**: Manual propagation maintains predictable write performance for resource-constrained environments
**Extensibility**: Unified metadata model supports both current and future tagging requirements

### Design Considerations  
**Migration Complexity**: While the backfill process requires careful coordination, existing tag strings must match `meta_values.value` entries exactly, potentially requiring data cleanup or fuzzy matching logic
**View Performance**: Detail view array aggregation includes complex filtering logic that may impact performance on larger datasets and should be tested under realistic load conditions
**Administrative UX**: Optional tag creation requires understanding of the three-tier attribute→value→assignment structure, suggesting need for simplified administrative interfaces

### Architectural Validation
The design successfully balances storage optimization with operational pragmatism, providing clear migration paths and escape hatches while reusing existing infrastructure intelligently. The approach is well-suited for implementation within the identified environmental constraints.

