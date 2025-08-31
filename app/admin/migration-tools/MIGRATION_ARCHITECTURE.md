# Migration System Architecture

## Overview
The migration system provides a unified approach for managing database schema and data transformations. All migration rules are stored in the database and executed through a single, consistent interface.

## Core Architecture Principles

### 1. Database-Driven Design
- **Single Source of Truth**: All migration rules are stored in the `custom_migration_rules` table
- **No Hardcoded Rules**: No TypeScript files or hardcoded rule definitions
- **Unified Loading**: Single `loadMigrationRules()` function loads all rules regardless of type

### 2. Rule Classification
Rules are classified using the `tags` array field:
- **Default Rules**: Tagged with `['default-rule', ...]` - System-provided rules for common migrations
- **Custom Rules**: User-created rules without the `default-rule` tag

### 3. Execution Engine
- **Single Execution Path**: All rules use the same `handleExecuteRule()` function
- **Configuration-Driven**: Rules contain their execution configuration in the `pattern` and `transformation` fields
- **Database Operations**: Direct Supabase client operations, no server-side SQL generation

## Database Schema

### Migration Rules Table: `custom_migration_rules`

```sql
-- Core rule identification
rule_id TEXT PRIMARY KEY                    -- Unique rule identifier
name TEXT NOT NULL                         -- Human-readable rule name
description TEXT                           -- Rule description and purpose

-- Classification and priority
category TEXT CHECK (category IN ('terminology', 'metadata', 'cleanup', 'structure', 'custom'))
priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low'))
tags TEXT[]                                -- Array of tags including 'default-rule' for system rules

-- Execution configuration
pattern JSONB NOT NULL                     -- Target identification (table, column, conditions)
transformation JSONB NOT NULL             -- Transformation definition (type, mappings, operations)
safety_checks JSONB                       -- Safety validations and requirements

-- Execution metadata
requires_manual_input BOOLEAN DEFAULT false
estimated_affected_rows INTEGER
estimated_execution_time TEXT
auto_executable BOOLEAN DEFAULT true
status TEXT CHECK (status IN ('active', 'inactive', 'archived', 'executed'))

-- Audit and tracking
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
last_executed_at TIMESTAMP WITH TIME ZONE
execution_count INTEGER DEFAULT 0
```

### Pattern Configuration
The `pattern` field defines what data to target:

```json
{
  "table": "word_forms",                    // Target table
  "column": "tags",                         // Target column
  "condition": "array_contains",            // Condition type
  "targetTags": ["io", "tu", "lui"],       // Specific tags to match
  "targetWords": [],                        // Specific words to target
  "targetFormIds": [],                      // Specific form IDs
  "targetTranslationIds": []                // Specific translation IDs
}
```

### Transformation Configuration
The `transformation` field defines what changes to make:

```json
{
  "type": "array_replace",                  // Operation type
  "mappings": {                             // Replacement mappings
    "io": "prima-persona",
    "tu": "seconda-persona",
    "lui": "terza-persona"
  },
  "preventDuplicates": true                 // Prevent duplicate entries
}
```

## Frontend Architecture

### Loading Rules
```typescript
const loadMigrationRules = async () => {
  const { data: rules } = await supabase
    .from('custom_migration_rules')
    .select('*')
    .eq('status', 'active')
    .order('priority', { ascending: false });

  // Convert to VisualRule format with proper ruleConfig
  const visualRules = rules.map(rule => ({
    id: rule.rule_id,
    title: rule.name,
    ruleSource: rule.tags?.includes('default-rule') ? 'default' : 'custom',
    ruleConfig: {
      selectedTable: rule.pattern?.table,
      ruleBuilderMappings: Object.entries(rule.transformation?.mappings || {})
    }
  }));
};
```

### Rule Execution
```typescript
const handleExecuteRule = async (rule: VisualRule) => {
  const config = rule.ruleConfig;
  
  // All rules execute through same path
  for (const mapping of config.ruleBuilderMappings) {
    const { data: records } = await supabase
      .from(config.selectedTable)
      .select('id, tags')
      .contains('tags', [mapping.from]);
      
    // Update records with client-side transformations
    for (const record of records) {
      await supabase
        .from(config.selectedTable)
        .update({ 
          tags: record.tags.map(tag => 
            tag === mapping.from ? mapping.to : tag
          )
        })
        .eq('id', record.id);
    }
  }
};
```

## Default Rules Seeding

Default rules are inserted into the database during system setup:

```sql
INSERT INTO custom_migration_rules (
  rule_id,
  name,
  description,
  category,
  priority,
  pattern,
  transformation,
  tags
) VALUES (
  'italian-to-universal-terminology',
  'Convert Italian Person Terms',
  'Updates old Italian terms to universal format for multi-language support.',
  'terminology',
  'critical',
  '{"table": "word_forms", "column": "tags", "targetTags": ["io", "tu", "lui"]}',
  '{"type": "array_replace", "mappings": {"io": "prima-persona", "tu": "seconda-persona"}}',
  ARRAY['default-rule', 'terminology', 'critical']
);
```

## Execution Flow

1. **Rule Loading**: `loadMigrationRules()` loads all active rules from database
2. **Rule Selection**: User selects a rule from the interface
3. **Configuration**: Rule configuration is loaded from database `pattern` and `transformation` fields
4. **Validation**: Safety checks are performed based on `safety_checks` configuration
5. **Execution**: `handleExecuteRule()` executes the transformation using Supabase client
6. **Logging**: Execution details are logged to `migration_execution_log` table

## Benefits of This Architecture

- **Consistency**: All rules follow the same structure and execution path
- **Flexibility**: Easy to add new rule types without code changes
- **Auditability**: All rules and executions are tracked in the database
- **Maintainability**: No hardcoded rules to maintain in TypeScript files
- **Scalability**: Rules can be managed through admin interface or database directly

## Migration Execution Log

All rule executions are logged to `migration_execution_log`:

```sql
INSERT INTO migration_execution_log (
  rule_id,
  rule_name,
  operation_type,
  target_table,
  target_column,
  records_affected,
  rule_configuration,
  execution_context
) VALUES (
  'italian-to-universal-terminology',
  'Convert Italian Person Terms',
  'replace',
  'word_forms',
  'tags',
  42,
  '{"mappings": {"io": "prima-persona"}}',
  'admin-migration-tools'
);
```

This provides a complete audit trail of all database transformations performed by the migration system.