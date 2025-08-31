import { supabase } from '../../../../lib/supabase';

export interface ModernSelectionCriteria {
  field: 'metadata' | 'optional_tags';
  metadataPath?: string;
  value: any;
  selectedTables: string[];
}

export interface ModernMigrationRule {
  name: string;
  description: string;
  target: {
    selectedTables: string[];
    field: 'metadata' | 'optional_tags';
    metadataPath?: string;
  };
  transformation: {
    operation: 'add' | 'remove' | 'update' | 'replace';
    value: any;
    metadataPath?: string;
  };
}

export interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

// ============================================================================
// PHASE 2: RULEBUILDER SERIALIZED RULE INTERFACE
// ============================================================================

export interface SerializedRule {
  id: string;
  name: string;
  description: string;
  target_field: 'metadata' | 'optional_tags' | 'both';
  target_tables: string[];
  source_selections: Record<string, any>;
  operations: {
    metadata_operations: Record<string, Record<string, OperationConfig>>;
    optional_tag_operations: Record<string, OperationConfig>;
    bulk_operations: any[];
    hierarchical_operations: any[];
  };
  execution_metadata: {
    expected_records_affected: number;
    risk_level: 'low' | 'medium' | 'high';
    requires_confirmation: boolean;
    has_revert_data: boolean;
  };
}

export interface OperationConfig {
  action: 'keep' | 'update' | 'remove' | 'conditional';
  operation_type?: 'add' | 'replace' | 'remove';
  newValue?: any;
  new_value?: any;
  target_path?: string;
  condition?: { ifTagExists: string; ifValue?: string; [key: string]: any };
  applyTo: 'selected' | 'all_with_tag' | 'hierarchy';
}

// Standardized rollback data structure for RuleBuilder rules
export interface RollbackDataEntry {
  table: string;
  record_id: string;
  field_type: 'metadata' | 'optional_tags';
  original_value: any;
  target_path?: string; // for nested metadata operations
}

// Execution result structure
export interface RuleExecutionResult {
  executionId: string;
  status: 'success' | 'failed' | 'partial';
  recordsAffected: number;
  tablesModified: string[];
  changes: Array<{
    table: string;
    record_id: string;
    field_type: 'metadata' | 'optional_tags';
    before_value: any;
    after_value: any;
    target_path?: string;
  }>;
  rollback_data: RollbackDataEntry[];
  executionTimeMs?: number;
  errorMessage?: string;
}

export class ModernDatabaseService {
  private static instance: ModernDatabaseService;
  private tagCache: {
    data: {
      coreTags: { tag: string; count: number; tables: string[] }[];
      optionalTags: { tag: string; count: number; tables: string[] }[];
      groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]>;
    } | null;
    timestamp: number | null;
  } = { data: null, timestamp: null };
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  public static getInstance(): ModernDatabaseService {
    if (!ModernDatabaseService.instance) {
      ModernDatabaseService.instance = new ModernDatabaseService();
    }
    return ModernDatabaseService.instance;
  }

  // Modern field queries - ONLY metadata and optional_tags
  async searchRecordsByMetadata(table: string, path: string, value: any): Promise<DatabaseRecord[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(`metadata->${path}`, value);
      
      if (error) {
        console.error(`Error searching ${table} by metadata:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Failed to search ${table} by metadata:`, error);
      throw error;
    }
  }

  async searchRecordsByOptionalTags(table: string, tagValue: string): Promise<DatabaseRecord[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .contains('optional_tags', [tagValue]);
      
      if (error) {
        console.error(`Error searching ${table} by optional_tags:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Failed to search ${table} by optional_tags:`, error);
      throw error;
    }
  }

  // Cross-table modern searches
  async searchAcrossTables(criteria: ModernSelectionCriteria): Promise<Record<string, DatabaseRecord[]>> {
    const results: Record<string, DatabaseRecord[]> = {};
    
    for (const table of criteria.selectedTables) {
      try {
        if (criteria.field === 'metadata' && criteria.metadataPath) {
          results[table] = await this.searchRecordsByMetadata(table, criteria.metadataPath, criteria.value);
        } else if (criteria.field === 'optional_tags') {
          results[table] = await this.searchRecordsByOptionalTags(table, criteria.value as string);
        }
      } catch (error) {
        console.error(`Error searching table ${table}:`, error);
        results[table] = [];
      }
    }
    
    return results;
  }

  // Rule persistence in modern format
  async saveModernRule(rule: ModernMigrationRule): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          pattern: rule.target,
          transformation: rule.transformation,
          target_tables: rule.target.selectedTables,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error saving rule:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to save modern rule:', error);
      throw error;
    }
  }

  // Save rule from RuleBuilder SerializedRule format
  async saveSerializedRule(rule: {
    id: string;
    name: string;
    description: string;
    target_field: 'metadata' | 'optional_tags' | 'both';
    target_tables: string[];
    source_selections: Record<string, any>;
    operations: {
      metadata_operations: Record<string, Record<string, any>>;
      optional_tag_operations: Record<string, any>;
      bulk_operations: any[];
      hierarchical_operations: any[];
    };
    execution_metadata: {
      expected_records_affected: number;
      risk_level: 'low' | 'medium' | 'high';
      requires_confirmation: boolean;
      has_revert_data: boolean;
    };
  }): Promise<any> {
    try {
      // Convert SerializedRule to database format
      const ruleData = {
        rule_id: rule.id,
        name: rule.name,
        description: rule.description,
        category: 'custom',
        priority: rule.execution_metadata.risk_level === 'high' ? 'high' : 
                 rule.execution_metadata.risk_level === 'medium' ? 'medium' : 'low',
        pattern: {
          target_field: rule.target_field,
          target_tables: rule.target_tables,
          source_selections: rule.source_selections
        },
        transformation: {
          metadata_operations: rule.operations.metadata_operations,
          optional_tag_operations: rule.operations.optional_tag_operations,
          bulk_operations: rule.operations.bulk_operations,
          hierarchical_operations: rule.operations.hierarchical_operations
        },
        estimated_affected_rows: rule.execution_metadata.expected_records_affected,
        requires_manual_input: rule.execution_metadata.requires_confirmation,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('custom_migration_rules')
        .insert(ruleData)
        .select();
      
      if (error) {
        console.error('Error saving serialized rule:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to save serialized rule:', error);
      throw error;
    }
  }

  async loadModernRules(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading rules:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to load rules:', error);
      throw error;
    }
  }

  // Execute modern transformation
  async executeModernTransformation(rule: ModernMigrationRule, selectedRecords: Record<string, DatabaseRecord[]>): Promise<any> {
    try {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const changes: Array<{
        table: string;
        record_id: string;
        before: DatabaseRecord;
        after: DatabaseRecord;
      }> = [];

      for (const [table, records] of Object.entries(selectedRecords)) {
        for (const record of records) {
          const updatedRecord = await this.applyTransformation(table, record, rule.transformation);
          changes.push({
            table,
            record_id: record.id,
            before: record,
            after: updatedRecord
          });
        }
      }

      // Log execution to history
      await this.logExecution(executionId, rule, changes);
      
      return { executionId, changes };
    } catch (error) {
      console.error('Failed to execute transformation:', error);
      throw error;
    }
  }

  private async applyTransformation(table: string, record: DatabaseRecord, transformation: ModernMigrationRule['transformation']): Promise<DatabaseRecord> {
    const updatedFields: any = {};

    if (transformation.operation === 'add') {
      if (transformation.metadataPath) {
        // Update metadata JSONB field
        const currentMetadata = record.metadata || {};
        const pathParts = transformation.metadataPath.split('.');
        let target = currentMetadata;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) target[pathParts[i]] = {};
          target = target[pathParts[i]];
        }
        
        target[pathParts[pathParts.length - 1]] = transformation.value;
        updatedFields.metadata = currentMetadata;
      } else {
        // Add to optional_tags array
        const currentTags = record.optional_tags || [];
        if (!currentTags.includes(transformation.value)) {
          updatedFields.optional_tags = [...currentTags, transformation.value];
        }
      }
    }

    // Update record in database
    const { data, error } = await supabase
      .from(table)
      .update(updatedFields)
      .eq('id', record.id)
      .select();

    if (error) {
      console.error(`Error updating record in ${table}:`, error);
      throw error;
    }

    return { ...record, ...updatedFields };
  }

  private async logExecution(executionId: string, rule: ModernMigrationRule, changes: any[]): Promise<void> {
    try {
      await supabase
        .from('migration_execution_log')
        .insert({
          rule_id: executionId,
          rule_name: rule.name,
          operation_type: 'replace', // Default operation type
          target_table: rule.target.selectedTables[0] || 'unknown', // Use first table as primary target
          target_column: rule.target.field === 'metadata' ? 'metadata' : 'optional_tags',
          records_affected: changes.length,
          changes_made: changes,
          rule_configuration: rule,
          status: 'success',
          execution_context: 'admin-interface',
          can_rollback: true,
          rollback_data: changes.map(change => ({
            table: change.table,
            record_id: change.record_id,
            original_value: change.before
          })),
          executed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }

  // Get available tables for selection
  async getAvailableTables(): Promise<string[]> {
    return ['dictionary', 'word_forms', 'word_translations', 'form_translations'];
  }

  // Clear tag cache to force fresh data retrieval
  clearTagCache(): void {
    this.tagCache = { data: null, timestamp: null };
    console.log('ModernDatabaseService: Tag cache cleared');
  }

  // Unified tag discovery - get ALL tags from metadata and optional_tags
  // Now uses optimized get_all_available_tags() database function with caching
  async getAllAvailableTags(): Promise<{
    coreTags: { tag: string; count: number; tables: string[] }[];
    optionalTags: { tag: string; count: number; tables: string[] }[];
    groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]>;
  }> {
    // Check cache first
    const now = Date.now();
    if (this.tagCache.data && this.tagCache.timestamp && (now - this.tagCache.timestamp < this.CACHE_DURATION)) {
      console.log('ModernDatabaseService: Returning cached tag data');
      return this.tagCache.data;
    }

    try {
      console.log('ModernDatabaseService: Fetching fresh tag data using optimized function');
      
      // Call the new optimized database function
      const { data, error } = await supabase.rpc('get_all_available_tags');

      if (error) {
        console.error('Error calling get_all_available_tags function:', error);
        // Fallback to the old method if the new function fails
        return await this.getAllAvailableTagsFallback();
      }

      if (!data || data.length === 0) {
        console.warn('No tag data returned from optimized function, using fallback');
        return await this.getAllAvailableTagsFallback();
      }

      // Process the optimized function results
      const coreTags: Map<string, { count: number; tables: Set<string> }> = new Map();
      const optionalTags: Map<string, { count: number; tables: Set<string> }> = new Map();
      const coreTagsByKey: Map<string, Map<string, { count: number; tables: Set<string> }>> = new Map();

      // Process each row from the function result
      for (const row of data) {
        const { tag_name, tag_count, table_sources } = row;
        const tables = Array.isArray(table_sources) ? table_sources : [table_sources];
        
        // Determine if this is a core tag (contains ': ') or optional tag
        if (tag_name.includes(': ')) {
          // Core tag (metadata)
          const [key, value] = tag_name.split(': ', 2);
          
          // Build original structure for backward compatibility
          if (!coreTags.has(tag_name)) {
            coreTags.set(tag_name, { count: 0, tables: new Set() });
          }
          coreTags.get(tag_name)!.count += tag_count;
          tables.forEach(table => coreTags.get(tag_name)!.tables.add(table));
          
          // Build grouped structure by metadata key
          if (!coreTagsByKey.has(key)) {
            coreTagsByKey.set(key, new Map());
          }
          const keyGroup = coreTagsByKey.get(key)!;
          if (!keyGroup.has(value)) {
            keyGroup.set(value, { count: 0, tables: new Set() });
          }
          keyGroup.get(value)!.count += tag_count;
          tables.forEach(table => keyGroup.get(value)!.tables.add(table));
        } else {
          // Optional tag
          if (!optionalTags.has(tag_name)) {
            optionalTags.set(tag_name, { count: 0, tables: new Set() });
          }
          optionalTags.get(tag_name)!.count += tag_count;
          tables.forEach(table => optionalTags.get(tag_name)!.tables.add(table));
        }
      }

      // Build grouped core tags structure
      const groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]> = {};
      for (const [key, valueMap] of Array.from(coreTagsByKey.entries()).sort()) {
        groupedCoreTags[key] = Array.from(valueMap.entries())
          .map(([value, data]) => ({
            value,
            count: data.count,
            tables: Array.from(data.tables)
          }))
          .sort((a, b) => b.count - a.count);
      }

      const result = {
        coreTags: Array.from(coreTags.entries()).map(([tag, data]) => ({
          tag,
          count: data.count,
          tables: Array.from(data.tables)
        })).sort((a, b) => b.count - a.count),
        optionalTags: Array.from(optionalTags.entries()).map(([tag, data]) => ({
          tag,
          count: data.count,
          tables: Array.from(data.tables)
        })).sort((a, b) => b.count - a.count),
        groupedCoreTags
      };

      // Cache the result
      this.tagCache.data = result;
      this.tagCache.timestamp = now;

      console.log(`ModernDatabaseService: Cached ${result.coreTags.length} core tags, ${result.optionalTags.length} optional tags`);
      return result;

    } catch (error) {
      console.error('ModernDatabaseService: Error in getAllAvailableTags, using fallback:', error);
      return await this.getAllAvailableTagsFallback();
    }
  }

  // Fallback method using the old approach if the optimized function fails
  private async getAllAvailableTagsFallback(): Promise<{
    coreTags: { tag: string; count: number; tables: string[] }[];
    optionalTags: { tag: string; count: number; tables: string[] }[];
    groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]>;
  }> {
    console.log('ModernDatabaseService: Using fallback method for tag discovery');
    
    const coreTags: Map<string, { count: number; tables: Set<string> }> = new Map();
    const optionalTags: Map<string, { count: number; tables: Set<string> }> = new Map();
    const coreTagsByKey: Map<string, Map<string, { count: number; tables: Set<string> }>> = new Map();
    const tables = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];

    for (const table of tables) {
      try {
        // Get all records with metadata OR optional_tags
        const { data, error } = await supabase
          .from(table)
          .select('metadata, optional_tags');

        if (error) {
          console.error(`Error fetching tags from ${table}:`, error);
          continue;
        }

        if (data) {
          for (const record of data) {
            // Extract core tags from metadata JSONB
            if (record.metadata && typeof record.metadata === 'object') {
              for (const [key, value] of Object.entries(record.metadata)) {
                if (value && typeof value === 'string') {
                  const tag = `${key}: ${value}`;
                  
                  // Build original structure for backward compatibility
                  if (!coreTags.has(tag)) {
                    coreTags.set(tag, { count: 0, tables: new Set() });
                  }
                  coreTags.get(tag)!.count++;
                  coreTags.get(tag)!.tables.add(table);
                  
                  // Build grouped structure by metadata key
                  if (!coreTagsByKey.has(key)) {
                    coreTagsByKey.set(key, new Map());
                  }
                  const keyGroup = coreTagsByKey.get(key)!;
                  if (!keyGroup.has(value)) {
                    keyGroup.set(value, { count: 0, tables: new Set() });
                  }
                  keyGroup.get(value)!.count++;
                  keyGroup.get(value)!.tables.add(table);
                }
              }
            }

            // Extract optional tags from array
            if (record.optional_tags && Array.isArray(record.optional_tags)) {
              for (const tag of record.optional_tags) {
                if (tag && typeof tag === 'string') {
                  if (!optionalTags.has(tag)) {
                    optionalTags.set(tag, { count: 0, tables: new Set() });
                  }
                  optionalTags.get(tag)!.count++;
                  optionalTags.get(tag)!.tables.add(table);
                }
              }
            }
          }
        }
      } catch (tableError) {
        console.error(`Error processing tags for table ${table}:`, tableError);
      }
    }

    // Build grouped core tags structure
    const groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]> = {};
    for (const [key, valueMap] of Array.from(coreTagsByKey.entries()).sort()) {
      groupedCoreTags[key] = Array.from(valueMap.entries())
        .map(([value, data]) => ({
          value,
          count: data.count,
          tables: Array.from(data.tables)
        }))
        .sort((a, b) => b.count - a.count);
    }

    return {
      coreTags: Array.from(coreTags.entries()).map(([tag, data]) => ({
        tag,
        count: data.count,
        tables: Array.from(data.tables)
      })).sort((a, b) => b.count - a.count),
      optionalTags: Array.from(optionalTags.entries()).map(([tag, data]) => ({
        tag,
        count: data.count,
        tables: Array.from(data.tables)
      })).sort((a, b) => b.count - a.count),
      groupedCoreTags
    };
  }

  // Simple database test
  async testDatabaseConnection(): Promise<{ success: boolean; sampleData: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .select('id, italian, english, metadata, optional_tags')
        .limit(3);
      
      if (error) {
        return { success: false, sampleData: null, error: error.message };
      }
      
      return { success: true, sampleData: data };
    } catch (err) {
      return { success: false, sampleData: null, error: String(err) };
    }
  }

  // Unified search - find records containing ANY of the selected tags
  async searchByUnifiedTags(selectedTags: {
    coreTags: string[];
    optionalTags: string[];
    contentTypes: string[];
  }): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};
    const tableMap = {
      'dictionary': 'Dictionary Words',
      'word_forms': 'Conjugated Forms', 
      'word_translations': 'English Translations',
      'form_translations': 'Form Translations'
    };

    // Filter tables based on content types
    const tablesToSearch = Object.entries(tableMap)
      .filter(([_, contentType]) => selectedTags.contentTypes.includes(contentType))
      .map(([table, _]) => table);

    // If no tags selected, return empty results
    if (selectedTags.coreTags.length === 0 && selectedTags.optionalTags.length === 0) {
      for (const table of tablesToSearch) {
        results[tableMap[table as keyof typeof tableMap]] = [];
      }
      return results;
    }

    for (const table of tablesToSearch) {
      try {
        let allRecords: any[] = [];

        // Search for core tags in metadata
        for (const coreTag of selectedTags.coreTags) {
          if (coreTag.includes(': ')) {
            const [key, value] = coreTag.split(': ', 2);
            
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .eq(`metadata->>${key}`, value)
              .limit(20);
            
            if (!error && data) {
              allRecords.push(...data);
            }
          }
        }

        // Search for optional tags in optional_tags array
        for (const optionalTag of selectedTags.optionalTags) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .contains('optional_tags', [optionalTag])
            .limit(20);
          
          if (!error && data) {
            allRecords.push(...data);
          }
        }

        // Remove duplicates based on ID
        const uniqueRecords = allRecords.filter((record, index, self) =>
          index === self.findIndex(r => r.id === record.id)
        );

        results[tableMap[table as keyof typeof tableMap]] = uniqueRecords;
        
      } catch (tableError) {
        results[tableMap[table as keyof typeof tableMap]] = [];
      }
    }

    return results;
  }

  // Get sample records for preview
  async getTableSample(table: string, limit: number = 5): Promise<DatabaseRecord[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(limit);
      
      if (error) {
        console.error(`Error getting sample from ${table}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Failed to get sample from ${table}:`, error);
      throw error;
    }
  }

  // Load all dictionary words (paginated)
  async loadAllDictionaryWords(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .order('italian')
        .limit(limit);
      
      if (error) {
        console.error('Error loading dictionary words:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to load dictionary words:', error);
      throw error;
    }
  }

  // Search dictionary words by text
  async searchDictionaryWords(searchTerm: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .ilike('italian', `%${searchTerm}%`)
        .limit(limit);
      
      if (error) {
        console.error('Error searching dictionary words:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to search dictionary words:', error);
      throw error;
    }
  }

  // Build word hierarchy (dictionary -> forms -> translations)
  async buildWordHierarchy(wordId: string): Promise<{
    word: any;
    forms: any[];
    translations: any[];
    formTranslations: any[];
  }> {
    try {
      // Get the dictionary word
      const { data: word, error: wordError } = await supabase
        .from('dictionary')
        .select('*')
        .eq('id', wordId)
        .single();
      
      if (wordError) {
        console.error('Error fetching dictionary word:', wordError);
        throw wordError;
      }

      // Get word forms
      const { data: forms, error: formsError } = await supabase
        .from('word_forms')
        .select('*')
        .eq('word_id', wordId);
      
      if (formsError) {
        console.error('Error fetching word forms:', formsError);
      }

      // Get word translations
      const { data: translations, error: translationsError } = await supabase
        .from('word_translations')
        .select('*')
        .eq('word_id', wordId);
      
      if (translationsError) {
        console.error('Error fetching word translations:', translationsError);
      }

      // Get form translations for all forms
      const formIds = forms?.map(f => f.id) || [];
      let formTranslations: any[] = [];
      
      if (formIds.length > 0) {
        const { data: ftData, error: ftError } = await supabase
          .from('form_translations')
          .select('*')
          .in('form_id', formIds);
        
        if (ftError) {
          console.error('Error fetching form translations:', ftError);
        } else {
          formTranslations = ftData || [];
        }
      }

      return {
        word: word || null,
        forms: forms || [],
        translations: translations || [],
        formTranslations
      };
    } catch (error) {
      console.error('Failed to build word hierarchy:', error);
      throw error;
    }
  }

  // Get execution history
  async getExecutionHistory(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('migration_execution_log')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error loading execution history:', error);
        throw error;
      }
      
      // Map database columns to expected UI format
      return (data || []).map(record => ({
        execution_id: record.id, // Use the actual primary key ID, not rule_id
        rule_id: record.rule_id, // Keep rule_id for reference
        rule_name: record.rule_name || 'Unknown Rule',
        status: record.status === 'success' ? 'completed' : record.status,
        executed_at: record.executed_at,
        affected_records: record.records_affected || 0,
        rule_config: record.rule_configuration,
        changes_made: record.changes_made || [],
        duration: record.execution_duration_ms ? `${record.execution_duration_ms}ms` : 'Unknown',
        can_rollback: record.can_rollback || false,
        rollback_data: record.rollback_data || [],
        is_reverted: record.is_reverted || false,
        operation_type: record.operation_type || 'unknown',
        target_table: record.target_table || 'unknown'
      }));
    } catch (error) {
      console.error('Failed to load execution history:', error);
      throw error;
    }
  }

  // ========================================================================
  // METAVAL SYSTEM INTEGRATION - Issue #11
  // ========================================================================

  /**
   * Get valid options for a metadata attribute from metaval system
   * @param attributeName - The metadata attribute name (e.g., 'auxiliary', 'mood', 'tense')
   * @returns Array of valid options with descriptions, sorted by sort_order
   */
  async getMetadataAttributeOptions(attributeName: string): Promise<Array<{value: string, description?: string}>> {
    try {
      const { data, error } = await supabase
        .from('meta_values')
        .select(`
          value,
          description,
          sort_order,
          meta_attributes!inner(name)
        `)
        .eq('meta_attributes.name', attributeName)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error(`Error loading options for ${attributeName}:`, error);
        return [];
      }

      return data?.map(item => ({
        value: item.value,
        description: item.description
      })) || [];
    } catch (error) {
      console.error(`Failed to load metadata options for ${attributeName}:`, error);
      return [];
    }
  }

  /**
   * Get all attributes applicable to a specific word type
   * @param wordType - The word type ('noun', 'verb', 'adjective', 'adverb')  
   * @returns Array of applicable attributes with their properties
   */
  async getApplicableAttributes(wordType: string): Promise<Array<{
    name: string;
    description?: string;
    is_mandatory: boolean;
    display_template?: string;
    combined_value_name?: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('metaval_rules')
        .select(`
          rule_config,
          meta_attributes!inner(
            name,
            description, 
            display_template,
            combined_value_name
          )
        `)
        .eq('rule_type', 'word_type')
        .eq('word_type', wordType)
        .eq('is_active', true);

      if (error) {
        console.error(`Error loading attributes for ${wordType}:`, error);
        return [];
      }

      return data?.map((item: any) => ({
        name: item.meta_attributes.name,
        description: item.meta_attributes.description,
        is_mandatory: item.is_mandatory,
        display_template: item.meta_attributes.display_template,
        combined_value_name: item.meta_attributes.combined_value_name
      })) || [];
    } catch (error) {
      console.error(`Failed to load applicable attributes for ${wordType}:`, error);
      return [];
    }
  }

  /**
   * Get implied attribute values when a source attribute is selected
   * @param attributeName - Source attribute name (e.g., 'tense')
   * @param value - Selected value (e.g., 'congiuntivo-presente')
   * @returns Array of implied attribute-value pairs
   */
  async getImpliedValues(attributeName: string, value: string): Promise<Array<{
    attribute: string;
    value: string;
    relationship_type: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('meta_attribute_relationships')
        .select(`
          relationship_type,
          source_attributes:meta_attributes!source_attribute_id(name),
          source_values:meta_values!source_value_id(value),
          target_attributes:meta_attributes!target_attribute_id(name),  
          target_values:meta_values!target_value_id(value)
        `)
        .eq('source_attributes.name', attributeName)
        .eq('source_values.value', value);

      if (error) {
        console.error(`Error loading implications for ${attributeName}=${value}:`, error);
        return [];
      }

      return data?.map((item: any) => ({
        attribute: item.target_attributes.name,
        value: item.target_values.value,
        relationship_type: item.relationship_type
      })) || [];
    } catch (error) {
      console.error(`Failed to load implied values for ${attributeName}=${value}:`, error);
      return [];
    }
  }

  // ========================================================================
  // ENHANCED METAVAL METHODS FOR MIGRATION TOOLS
  // ========================================================================

  /**
   * Get meta attributes for a specific word type with display names and stable IDs
   */
  async getMetaAttributesForWordType(wordType: string): Promise<Array<{
    id: string;
    stable_id: string;
    name: string;
    display_name: string;
    description?: string;
    is_mandatory: boolean;
    source_level: string;
    display_level: string;
    conditional_source_level?: string;
    conditional_display_level?: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('metaval_rules')
        .select(`
          rule_config,
          meta_attributes!inner(
            id,
            stable_id,
            name,
            display_name,
            description,
            source_level,
            display_level
          )
        `)
        .eq('rule_type', 'word_type')
        .eq('word_type', wordType)
        .eq('is_active', true)
        .eq('meta_attributes.is_active', true);

      if (error) {
        console.error(`Error loading metaval attributes for ${wordType}:`, error);
        return [];
      }

      return data?.map((item: any) => ({
        id: item.meta_attributes.id,
        stable_id: item.meta_attributes.stable_id,
        name: item.meta_attributes.name,
        display_name: item.meta_attributes.display_name,
        description: item.meta_attributes.description,
        is_mandatory: item.rule_config.is_mandatory || false,
        source_level: item.rule_config.conditional_source_level || item.meta_attributes.source_level,
        display_level: item.rule_config.conditional_display_level || item.meta_attributes.display_level,
        conditional_source_level: item.rule_config.conditional_source_level,
        conditional_display_level: item.rule_config.conditional_display_level
      })) || [];
    } catch (error) {
      console.error(`Failed to load metaval attributes for ${wordType}:`, error);
      return [];
    }
  }

  /**
   * Get meta values for a specific attribute with shorthand optimization
   */
  async getMetaValuesByAttribute(attributeId: string): Promise<Array<{
    id: string;
    stable_id: string;
    value: string;
    shorthand?: string;
    description?: string;
    is_default: boolean;
    sort_order: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('meta_values')
        .select('id, stable_id, value, shorthand, description, is_default, sort_order')
        .eq('attribute_id', attributeId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error(`Error loading meta values for attribute ${attributeId}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Failed to load meta values for attribute ${attributeId}:`, error);
      return [];
    }
  }

  /**
   * Get display name for an attribute by stable ID
   */
  async getDisplayNameForAttribute(stableId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('meta_attributes')
        .select('display_name, name')
        .eq('stable_id', stableId)
        .single();

      if (error) {
        console.error(`Error loading display name for ${stableId}:`, error);
        return stableId; // Fallback to stable ID
      }

      return data?.display_name || data?.name || stableId;
    } catch (error) {
      console.error(`Failed to load display name for ${stableId}:`, error);
      return stableId;
    }
  }

  /**
   * Get attribute by stable ID with full details
   */
  async getAttributeByStableId(stableId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('meta_attributes')
        .select('*')
        .eq('stable_id', stableId)
        .single();

      if (error) {
        console.error(`Error loading attribute ${stableId}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Failed to load attribute ${stableId}:`, error);
      return null;
    }
  }

  /**
   * Get meta value by stable ID with full details
   */
  async getMetaValueByStableId(stableId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('meta_values')
        .select('id, stable_id, value, shorthand, description, is_default, sort_order')
        .eq('stable_id', stableId)
        .single();

      if (error) {
        console.error(`Error loading meta value ${stableId}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Failed to load meta value ${stableId}:`, error);
      return null;
    }
  }

  /**
   * Validate metadata against word type rules
   */
  async validateAgainstWordTypeRules(wordType: string, metadata: Record<string, any>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    missingMandatory: string[];
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const missingMandatory: string[] = [];

      // Get mandatory attributes for this word type
      const { data: rules, error } = await supabase
        .from('metaval_rules')
        .select(`
          rule_config,
          meta_attributes!inner(
            name,
            display_name,
            stable_id
          )
        `)
        .eq('rule_type', 'word_type')
        .eq('word_type', wordType)
        .eq('is_active', true);

      if (error) {
        console.error(`Error loading validation rules for ${wordType}:`, error);
        return { isValid: false, errors: [`Failed to load validation rules: ${error.message}`], warnings, missingMandatory };
      }

      // Check for missing mandatory attributes
      for (const rule of rules || []) {
        const isMandatory = rule.rule_config?.is_mandatory || false;
        if (!isMandatory) continue;
        
        const metaAttributes = Array.isArray(rule.meta_attributes) ? rule.meta_attributes[0] : rule.meta_attributes;
        const attrName = (metaAttributes as any)?.name;
        const displayName = (metaAttributes as any)?.display_name;
        
        if (!metadata[attrName] || metadata[attrName] === null || metadata[attrName] === '') {
          missingMandatory.push(displayName || attrName);
          errors.push(`Missing mandatory attribute: ${displayName || attrName}`);
        }
      }

      // Additional validations can be added here
      // - Check for invalid values against meta_values
      // - Check conditional patterns
      // - Check relationship constraints

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        missingMandatory
      };
    } catch (error) {
      console.error(`Failed to validate metadata for ${wordType}:`, error);
      return {
        isValid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
        missingMandatory: []
      };
    }
  }

  /**
   * Search records by metaval stable ID
   */
  async searchByMetavalStableId(stableId: string, value: string, tables: string[]): Promise<Record<string, DatabaseRecord[]>> {
    try {
      const results: Record<string, DatabaseRecord[]> = {};

      // First get the attribute name from stable ID
      const attribute = await this.getAttributeByStableId(stableId);
      if (!attribute) {
        console.error(`Attribute not found for stable ID: ${stableId}`);
        return results;
      }

      // Search each table
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq(`metadata->>${attribute.name}`, value);

          if (error) {
            console.error(`Error searching ${table} by metaval:`, error);
            results[table] = [];
          } else {
            results[table] = data || [];
          }
        } catch (tableError) {
          console.error(`Error processing table ${table}:`, tableError);
          results[table] = [];
        }
      }

      return results;
    } catch (error) {
      console.error(`Failed to search by metaval stable ID ${stableId}:`, error);
      return {};
    }
  }

  /**
   * Get conditional levels for an attribute and word type
   */
  async getConditionalLevels(attributeId: string, wordType: string): Promise<{
    source_level: string;
    display_level: string;
    is_conditional: boolean;
  }> {
    try {
      const { data, error } = await supabase
        .from('metaval_rules')
        .select(`
          rule_config,
          meta_attributes!inner(
            source_level,
            display_level
          )
        `)
        .eq('rule_type', 'word_type')
        .eq('attribute_id', attributeId)
        .eq('word_type', wordType)
        .eq('is_active', true)
        .single();

      if (error) {
        // If no specific rule, get default from attribute
        const { data: attrData, error: attrError } = await supabase
          .from('meta_attributes')
          .select('source_level, display_level')
          .eq('id', attributeId)
          .single();

        if (attrError) {
          console.error(`Error loading levels for attribute ${attributeId}:`, attrError);
          return { source_level: 'word', display_level: 'word', is_conditional: false };
        }

        return {
          source_level: attrData.source_level,
          display_level: attrData.display_level,
          is_conditional: false
        };
      }

      const metaAttributes = Array.isArray(data.meta_attributes) ? data.meta_attributes[0] : data.meta_attributes;
      return {
        source_level: data.rule_config.conditional_source_level || (metaAttributes as any)?.source_level,
        display_level: data.rule_config.conditional_display_level || (metaAttributes as any)?.display_level,
        is_conditional: !!(data.rule_config.conditional_source_level || data.rule_config.conditional_display_level)
      };
    } catch (error) {
      console.error(`Failed to get conditional levels for ${attributeId}, ${wordType}:`, error);
      return { source_level: 'word', display_level: 'word', is_conditional: false };
    }
  }

  /**
   * Format COMBINE display with shorthand optimization
   */
  async formatCombineDisplay(attributeId: string, values: string[]): Promise<string> {
    try {
      // Get shorthand values for the attribute
      const metaValues = await this.getMetaValuesByAttribute(attributeId);
      const shorthandMap = new Map(metaValues.map(v => [v.value, v.shorthand || v.value]));

      // Check if all values have shorthand
      const hasShorthand = values.every(v => shorthandMap.has(v) && shorthandMap.get(v) !== v);

      if (hasShorthand) {
        // Use shorthand with "/" separator (57% character savings)
        return values.map(v => shorthandMap.get(v)).join('/');
      } else {
        // Use full values with " & " separator
        return values.join(' & ');
      }
    } catch (error) {
      console.error(`Failed to format COMBINE display for attribute ${attributeId}:`, error);
      return values.join(' & ');
    }
  }

  // ========================================================================
  // PHASE 2: ENHANCED RULE EXECUTION WITH LOGGING
  // ========================================================================

  /**
   * PHASE 3: COMPLETE OPERATION DISPATCHER
   * Main entry point for executing all rule operations with validation and state management
   */
  async executeRuleOperations(rule: SerializedRule): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`[Phase3-OperationDispatcher] Starting rule execution: ${rule.name} (${rule.id})`);
      
      // Validate SerializedRule structure
      this.validateSerializedRule(rule);
      
      // Initialize comprehensive execution result
      const result: RuleExecutionResult = {
        executionId,
        status: 'success',
        recordsAffected: 0,
        tablesModified: [],
        changes: [],
        rollback_data: [],
        executionTimeMs: 0
      };

      // Get affected records with enhanced selection logic
      const affectedRecords = await this.getAffectedRecordsEnhanced(rule.source_selections, rule.target_tables);
      const totalRecords = Object.values(affectedRecords).flat().length;
      console.log(`[Phase3-OperationDispatcher] Processing ${totalRecords} records across ${rule.target_tables.length} tables`);

      // Capture pre-execution state for all affected records
      await this.capturePreExecutionState(affectedRecords, result);

      // Route operations by type with comprehensive error handling
      await this.routeOperationsByType(rule, affectedRecords, result);

      // Validate post-execution state against metaval constraints
      await this.validatePostExecutionState(rule, result);

      // Calculate execution metrics
      result.executionTimeMs = Date.now() - startTime;
      result.tablesModified = Array.from(new Set(result.changes.map(c => c.table)));

      // Log comprehensive execution details
      await this.logRuleExecution(rule, result);
      
      console.log(`[Phase3-OperationDispatcher] Rule execution completed: ${result.recordsAffected} records affected in ${result.executionTimeMs}ms`);
      return result;

    } catch (error) {
      return await this.handleExecutionFailure(rule, executionId, startTime, error);
    }
  }

  /**
   * Main method for executing a SerializedRule with comprehensive logging
   * Implements comprehensive rollback data capture for both metadata and optional_tags
   */
  async executeRuleWithLogging(rule: SerializedRule): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`[ModernDatabaseService] Starting execution of rule: ${rule.name} (${rule.id})`);
      
      // Initialize execution result
      const result: RuleExecutionResult = {
        executionId,
        status: 'success',
        recordsAffected: 0,
        tablesModified: [],
        changes: [],
        rollback_data: [],
        executionTimeMs: 0
      };

      // Get all affected records based on source selections
      const affectedRecords = await this.getAffectedRecords(rule.source_selections);
      console.log(`[ModernDatabaseService] Found ${Object.values(affectedRecords).flat().length} potentially affected records`);

      // Execute operations by type
      if (rule.target_field === 'metadata' || rule.target_field === 'both') {
        await this.executeMetadataOperations(
          rule.operations.metadata_operations,
          affectedRecords,
          rule.target_tables,
          result
        );
      }

      if (rule.target_field === 'optional_tags' || rule.target_field === 'both') {
        await this.executeOptionalTagOperations(
          rule.operations.optional_tag_operations,
          affectedRecords,
          rule.target_tables,
          result
        );
      }

      // Calculate execution time
      result.executionTimeMs = Date.now() - startTime;
      result.tablesModified = Array.from(new Set(result.changes.map(c => c.table)));

      // Log execution to database
      await this.logRuleExecution(rule, result);
      
      console.log(`[ModernDatabaseService] Rule execution completed successfully: ${result.recordsAffected} records affected`);
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`[ModernDatabaseService] Rule execution failed:`, error);
      
      const failedResult: RuleExecutionResult = {
        executionId,
        status: 'failed',
        recordsAffected: 0,
        tablesModified: [],
        changes: [],
        rollback_data: [],
        executionTimeMs: executionTime,
        errorMessage: error instanceof Error ? error.message : String(error)
      };

      // Log failed execution
      await this.logRuleExecution(rule, failedResult);
      
      return failedResult;
    }
  }

  /**
   * Get all records affected by the rule based on source selections
   */
  private async getAffectedRecords(sourceSelections: Record<string, any>): Promise<Record<string, DatabaseRecord[]>> {
    const affectedRecords: Record<string, DatabaseRecord[]> = {};
    const tables = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];

    for (const table of tables) {
      const tableSelections = sourceSelections[table];
      if (!tableSelections) {
        affectedRecords[table] = [];
        continue;
      }

      let tableRecords: DatabaseRecord[] = [];

      // Get records based on metadata paths
      if (tableSelections.selectedMetadataPaths && tableSelections.selectedMetadataPaths.size > 0) {
        const metadataPaths = Array.from(tableSelections.selectedMetadataPaths);
        for (const metadataPath of metadataPaths) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .not(`metadata->>${metadataPath}`, 'is', null);
            
            if (!error && data) {
              tableRecords.push(...data);
            }
          } catch (error) {
            console.error(`Error getting records for metadata path ${metadataPath} in ${table}:`, error);
          }
        }
      }

      // Get records based on optional tags
      if (tableSelections.selectedOptionalTags && tableSelections.selectedOptionalTags.size > 0) {
        const optionalTags = Array.from(tableSelections.selectedOptionalTags);
        for (const tag of optionalTags) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .contains('optional_tags', [tag]);
            
            if (!error && data) {
              tableRecords.push(...data);
            }
          } catch (error) {
            console.error(`Error getting records for optional tag ${tag} in ${table}:`, error);
          }
        }
      }

      // Remove duplicates based on ID
      const uniqueRecords = tableRecords.filter((record, index, self) =>
        index === self.findIndex(r => r.id === record.id)
      );

      affectedRecords[table] = uniqueRecords;
    }

    return affectedRecords;
  }

  /**
   * Execute metadata operations with comprehensive state capture
   */
  private async executeMetadataOperations(
    metadataOps: Record<string, Record<string, OperationConfig>>,
    affectedRecords: Record<string, DatabaseRecord[]>,
    targetTables: string[],
    result: RuleExecutionResult
  ): Promise<void> {
    for (const table of targetTables) {
      const records = affectedRecords[table] || [];
      if (records.length === 0) continue;

      const tableOps = metadataOps[table];
      if (!tableOps) continue;

      for (const record of records) {
        const originalMetadata = { ...(record.metadata || {}) };
        let updatedMetadata = { ...originalMetadata };
        let hasChanges = false;

        // Apply operations to each metadata path
        for (const [metadataPath, operation] of Object.entries(tableOps)) {
          const originalValue = this.getNestedValue(originalMetadata, metadataPath);
          let newValue = originalValue;

          switch (operation.action) {
            case 'update':
              if (operation.newValue !== undefined) {
                newValue = operation.newValue;
                this.setNestedValue(updatedMetadata, metadataPath, newValue);
                hasChanges = true;
              }
              break;
            case 'remove':
              this.deleteNestedValue(updatedMetadata, metadataPath);
              newValue = undefined;
              hasChanges = true;
              break;
            case 'conditional':
              if (operation.condition) {
                const shouldApply = this.evaluateCondition(record, operation.condition);
                if (shouldApply && operation.newValue !== undefined) {
                  newValue = operation.newValue;
                  this.setNestedValue(updatedMetadata, metadataPath, newValue);
                  hasChanges = true;
                }
              }
              break;
            // 'keep' action - no changes needed
          }

          // Record change for rollback data
          if (hasChanges && originalValue !== newValue) {
            result.rollback_data.push({
              table,
              record_id: record.id,
              field_type: 'metadata',
              original_value: originalValue,
              target_path: metadataPath
            });

            result.changes.push({
              table,
              record_id: record.id,
              field_type: 'metadata',
              before_value: originalValue,
              after_value: newValue,
              target_path: metadataPath
            });
          }
        }

        // Update record in database if changes were made
        if (hasChanges) {
          try {
            const { error } = await supabase
              .from(table)
              .update({ metadata: updatedMetadata })
              .eq('id', record.id);

            if (error) {
              throw new Error(`Failed to update metadata for record ${record.id} in ${table}: ${error.message}`);
            }

            result.recordsAffected++;
          } catch (error) {
            console.error(`Error updating metadata for record ${record.id} in ${table}:`, error);
            throw error;
          }
        }
      }
    }
  }

  /**
   * Execute optional tag operations with comprehensive state capture
   */
  private async executeOptionalTagOperations(
    tagOps: Record<string, OperationConfig>,
    affectedRecords: Record<string, DatabaseRecord[]>,
    targetTables: string[],
    result: RuleExecutionResult
  ): Promise<void> {
    for (const table of targetTables) {
      const records = affectedRecords[table] || [];
      if (records.length === 0) continue;

      for (const record of records) {
        const originalTags = [...(record.optional_tags || [])];
        let updatedTags = [...originalTags];
        let hasChanges = false;

        // Apply operations to each tag
        for (const [tagValue, operation] of Object.entries(tagOps)) {
          const tagExists = originalTags.includes(tagValue);

          switch (operation.action) {
            case 'update':
              // For tags, update means add if not present
              if (!tagExists && operation.newValue) {
                updatedTags.push(operation.newValue);
                hasChanges = true;
              }
              break;
            case 'remove':
              if (tagExists) {
                updatedTags = updatedTags.filter(tag => tag !== tagValue);
                hasChanges = true;
              }
              break;
            case 'conditional':
              if (operation.condition) {
                const shouldApply = this.evaluateCondition(record, operation.condition);
                if (shouldApply && operation.newValue && !updatedTags.includes(operation.newValue)) {
                  updatedTags.push(operation.newValue);
                  hasChanges = true;
                }
              }
              break;
            // 'keep' action - no changes needed
          }
        }

        // Update record in database if changes were made
        if (hasChanges) {
          try {
            const { error } = await supabase
              .from(table)
              .update({ optional_tags: updatedTags })
              .eq('id', record.id);

            if (error) {
              throw new Error(`Failed to update optional_tags for record ${record.id} in ${table}: ${error.message}`);
            }

            // Record change for rollback data
            result.rollback_data.push({
              table,
              record_id: record.id,
              field_type: 'optional_tags',
              original_value: originalTags
            });

            result.changes.push({
              table,
              record_id: record.id,
              field_type: 'optional_tags',
              before_value: originalTags,
              after_value: updatedTags
            });

            result.recordsAffected++;
          } catch (error) {
            console.error(`Error updating optional_tags for record ${record.id} in ${table}:`, error);
            throw error;
          }
        }
      }
    }
  }

  /**
   * Helper method to get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Helper method to set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (current[key] === undefined) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    if (lastKey) {
      target[lastKey] = value;
    }
  }

  /**
   * Helper method to delete nested value from object using dot notation
   */
  private deleteNestedValue(obj: any, path: string): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current?.[key], obj);
    
    if (target && lastKey) {
      delete target[lastKey];
    }
  }

  /**
   * Evaluate condition for conditional operations
   */
  private evaluateCondition(record: DatabaseRecord, condition: { ifTagExists: string; ifValue?: string }): boolean {
    if (condition.ifValue !== undefined) {
      // Check if metadata path has specific value
      const actualValue = this.getNestedValue(record.metadata, condition.ifTagExists);
      return actualValue === condition.ifValue;
    } else {
      // Check if optional tag exists
      const tags = record.optional_tags || [];
      return tags.includes(condition.ifTagExists);
    }
  }

  /**
   * Log rule execution to migration_execution_log with standardized rollback data
   */
  private async logRuleExecution(rule: SerializedRule, result: RuleExecutionResult): Promise<void> {
    try {
      const logEntry = {
        rule_id: result.executionId,
        rule_name: rule.name,
        operation_type: this.determineOperationType(rule),
        target_table: result.tablesModified.join(',') || 'multiple',
        target_column: rule.target_field === 'both' ? 'metadata,optional_tags' : rule.target_field,
        records_affected: result.recordsAffected,
        changes_made: result.changes,
        rule_configuration: {
          rule_id: rule.id,
          name: rule.name,
          description: rule.description,
          target_field: rule.target_field,
          target_tables: rule.target_tables,
          operations: rule.operations,
          execution_metadata: rule.execution_metadata
        },
        status: result.status,
        error_message: result.errorMessage || null,
        rollback_data: result.rollback_data,
        can_rollback: result.rollback_data.length > 0,
        execution_duration_ms: result.executionTimeMs,
        execution_context: 'rule-builder',
        executed_at: new Date().toISOString(),
        is_reverted: false,
        reverted_at: null,
        reverted_by: null,
        revert_notes: null
      };

      const { error } = await supabase
        .from('migration_execution_log')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log rule execution:', error);
        // Don't throw here - logging failure shouldn't fail the entire operation
      } else {
        console.log(`[ModernDatabaseService] Logged rule execution: ${result.executionId}`);
      }
    } catch (error) {
      console.error('Error in logRuleExecution:', error);
    }
  }

  /**
   * Determine operation type based on rule operations
   */
  private determineOperationType(rule: SerializedRule): string {
    let hasUpdates = false;
    let hasRemovals = false;

    // Check metadata operations
    const metadataOps = rule.operations.metadata_operations || {};
    for (const tableOps of Object.values(metadataOps)) {
      for (const operation of Object.values(tableOps)) {
        if (operation.action === 'update' || operation.operation_type === 'add' || operation.operation_type === 'replace') hasUpdates = true;
        if (operation.action === 'remove' || operation.operation_type === 'remove') hasRemovals = true;
      }
    }

    // Check optional tag operations
    const tagOps = rule.operations.optional_tag_operations || {};
    for (const operation of Object.values(tagOps)) {
      if (operation.action === 'update' || operation.operation_type === 'add' || operation.operation_type === 'replace') hasUpdates = true;
      if (operation.action === 'remove' || operation.operation_type === 'remove') hasRemovals = true;
    }
    
    if (hasUpdates && hasRemovals) return 'replace';
    if (hasUpdates) return 'add';
    if (hasRemovals) return 'remove';
    return 'replace';
  }

  // ========================================================================
  // PHASE 3: ENHANCED OPERATION ENGINE SUPPORT METHODS
  // ========================================================================

  /**
   * Validate SerializedRule structure and operations
   */
  private validateSerializedRule(rule: SerializedRule): void {
    if (!rule.id || !rule.name) {
      throw new Error('Invalid rule: Missing id or name');
    }

    if (!rule.target_tables || rule.target_tables.length === 0) {
      throw new Error('Invalid rule: No target tables specified');
    }

    if (!rule.operations) {
      throw new Error('Invalid rule: No operations defined');
    }

    // Validate target_field
    if (!['metadata', 'optional_tags', 'both'].includes(rule.target_field)) {
      throw new Error(`Invalid rule: Invalid target_field '${rule.target_field}'`);
    }

    console.log(`[Phase3-Validation] Rule structure validated: ${rule.name}`);
  }

  /**
   * Enhanced record selection with proper source selection parsing
   */
  private async getAffectedRecordsEnhanced(
    sourceSelections: Record<string, any>, 
    targetTables: string[]
  ): Promise<Record<string, DatabaseRecord[]>> {
    const affectedRecords: Record<string, DatabaseRecord[]> = {};

    for (const table of targetTables) {
      try {
        let tableRecords: DatabaseRecord[] = [];
        const tableSelections = sourceSelections[table];

        if (!tableSelections) {
          // No specific selections - get all records
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1000); // Safety limit for large operations

          if (!error && data) {
            tableRecords = data;
          }
        } else {
          // Process specific selections
          tableRecords = await this.processTableSelections(table, tableSelections);
        }

        // Remove duplicates and store
        const uniqueRecords = this.removeDuplicateRecords(tableRecords);
        affectedRecords[table] = uniqueRecords;

        console.log(`[Phase3-Selection] Table ${table}: ${uniqueRecords.length} records selected`);
      } catch (error) {
        console.error(`Error selecting records from ${table}:`, error);
        affectedRecords[table] = [];
      }
    }

    return affectedRecords;
  }

  /**
   * Process table-specific selection criteria
   */
  private async processTableSelections(table: string, selections: any): Promise<DatabaseRecord[]> {
    let allRecords: DatabaseRecord[] = [];

    // Handle metadata path selections
    if (selections.selectedMetadataPaths) {
      const metadataPaths = Array.isArray(selections.selectedMetadataPaths) 
        ? selections.selectedMetadataPaths 
        : Array.from(selections.selectedMetadataPaths || []);

      for (const path of metadataPaths) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .not(`metadata->>${path}`, 'is', null);
        
        if (!error && data) {
          allRecords.push(...data);
        }
      }
    }

    // Handle optional tag selections
    if (selections.selectedOptionalTags) {
      const tags = Array.isArray(selections.selectedOptionalTags)
        ? selections.selectedOptionalTags
        : Array.from(selections.selectedOptionalTags || []);

      for (const tag of tags) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .contains('optional_tags', [tag]);
        
        if (!error && data) {
          allRecords.push(...data);
        }
      }
    }

    // Handle direct record ID selections
    if (selections.selectedRecords) {
      const recordIds = Array.isArray(selections.selectedRecords)
        ? selections.selectedRecords
        : Array.from(selections.selectedRecords || []);

      if (recordIds.length > 0) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .in('id', recordIds);
        
        if (!error && data) {
          allRecords.push(...data);
        }
      }
    }

    return allRecords;
  }

  /**
   * Remove duplicate records based on ID
   */
  private removeDuplicateRecords(records: DatabaseRecord[]): DatabaseRecord[] {
    const seen = new Set<string>();
    return records.filter(record => {
      if (seen.has(record.id)) {
        return false;
      }
      seen.add(record.id);
      return true;
    });
  }

  /**
   * Capture complete pre-execution state for rollback
   */
  private async capturePreExecutionState(
    affectedRecords: Record<string, DatabaseRecord[]>,
    result: RuleExecutionResult
  ): Promise<void> {
    console.log('[Phase3-StateCapture] Capturing pre-execution state...');

    for (const [table, records] of Object.entries(affectedRecords)) {
      for (const record of records) {
        // Capture complete metadata state
        if (record.metadata) {
          result.rollback_data.push({
            table,
            record_id: record.id,
            field_type: 'metadata',
            original_value: JSON.parse(JSON.stringify(record.metadata)) // Deep copy
          });
        }

        // Capture complete optional_tags state
        if (record.optional_tags) {
          result.rollback_data.push({
            table,
            record_id: record.id,
            field_type: 'optional_tags',
            original_value: [...record.optional_tags] // Array copy
          });
        }
      }
    }

    console.log(`[Phase3-StateCapture] Captured state for ${result.rollback_data.length} field instances`);
  }

  /**
   * Route operations by type with comprehensive support
   */
  private async routeOperationsByType(
    rule: SerializedRule,
    affectedRecords: Record<string, DatabaseRecord[]>,
    result: RuleExecutionResult
  ): Promise<void> {
    console.log('[Phase3-OperationRouting] Routing operations by type...');

    // Execute metadata operations
    if ((rule.target_field === 'metadata' || rule.target_field === 'both') && 
        rule.operations.metadata_operations) {
      console.log('[Phase3-OperationRouting] Processing metadata operations...');
      await this.executeEnhancedMetadataOperations(
        rule.operations.metadata_operations,
        affectedRecords,
        rule.target_tables,
        result
      );
    }

    // Execute optional tag operations
    if ((rule.target_field === 'optional_tags' || rule.target_field === 'both') && 
        rule.operations.optional_tag_operations) {
      console.log('[Phase3-OperationRouting] Processing optional tag operations...');
      await this.executeEnhancedOptionalTagOperations(
        rule.operations.optional_tag_operations,
        affectedRecords,
        rule.target_tables,
        result
      );
    }

    // Execute bulk operations if present
    if (rule.operations.bulk_operations && rule.operations.bulk_operations.length > 0) {
      console.log('[Phase3-OperationRouting] Processing bulk operations...');
      await this.executeBulkOperations(rule.operations.bulk_operations, affectedRecords, result);
    }

    // Execute hierarchical operations if present
    if (rule.operations.hierarchical_operations && rule.operations.hierarchical_operations.length > 0) {
      console.log('[Phase3-OperationRouting] Processing hierarchical operations...');
      await this.executeHierarchicalOperations(rule.operations.hierarchical_operations, affectedRecords, result);
    }

    console.log(`[Phase3-OperationRouting] All operations completed: ${result.recordsAffected} records affected`);
  }

  /**
   * Enhanced metadata operations with full operation type support
   */
  private async executeEnhancedMetadataOperations(
    metadataOps: Record<string, Record<string, OperationConfig>>,
    affectedRecords: Record<string, DatabaseRecord[]>,
    targetTables: string[],
    result: RuleExecutionResult
  ): Promise<void> {
    for (const table of targetTables) {
      const records = affectedRecords[table] || [];
      if (records.length === 0) continue;

      const tableOps = metadataOps[table];
      if (!tableOps) continue;

      for (const record of records) {
        const originalMetadata = JSON.parse(JSON.stringify(record.metadata || {}));
        let updatedMetadata = JSON.parse(JSON.stringify(originalMetadata));
        let hasChanges = false;

        // Process each operation on this record
        for (const [metadataPath, operation] of Object.entries(tableOps)) {
          const changeResult = await this.applyMetadataOperation(
            record,
            originalMetadata,
            updatedMetadata,
            metadataPath,
            operation
          );

          if (changeResult.hasChanges) {
            hasChanges = true;
            
            // Record change details
            result.changes.push({
              table,
              record_id: record.id,
              field_type: 'metadata',
              before_value: changeResult.beforeValue,
              after_value: changeResult.afterValue,
              target_path: metadataPath
            });
          }
        }

        // Update database if changes were made
        if (hasChanges) {
          await this.updateRecordMetadata(table, record.id, updatedMetadata);
          result.recordsAffected++;
        }
      }
    }
  }

  /**
   * Enhanced optional tag operations with full operation type support
   */
  private async executeEnhancedOptionalTagOperations(
    tagOps: Record<string, OperationConfig>,
    affectedRecords: Record<string, DatabaseRecord[]>,
    targetTables: string[],
    result: RuleExecutionResult
  ): Promise<void> {
    for (const table of targetTables) {
      const records = affectedRecords[table] || [];
      if (records.length === 0) continue;

      for (const record of records) {
        const originalTags = [...(record.optional_tags || [])];
        let updatedTags = [...originalTags];
        let hasChanges = false;

        // Process each tag operation
        for (const [tagValue, operation] of Object.entries(tagOps)) {
          const changeResult = this.applyOptionalTagOperation(
            record,
            originalTags,
            updatedTags,
            tagValue,
            operation
          );

          if (changeResult.hasChanges) {
            hasChanges = true;
            updatedTags = changeResult.updatedTags;
          }
        }

        // Update database if changes were made
        if (hasChanges) {
          await this.updateRecordOptionalTags(table, record.id, updatedTags);
          
          result.changes.push({
            table,
            record_id: record.id,
            field_type: 'optional_tags',
            before_value: originalTags,
            after_value: updatedTags
          });

          result.recordsAffected++;
        }
      }
    }
  }

  /**
   * Apply metadata operation with comprehensive operation type support
   */
  private async applyMetadataOperation(
    record: DatabaseRecord,
    originalMetadata: any,
    updatedMetadata: any,
    metadataPath: string,
    operation: OperationConfig
  ): Promise<{ hasChanges: boolean; beforeValue: any; afterValue: any }> {
    const beforeValue = this.getNestedValue(originalMetadata, metadataPath);
    let afterValue = beforeValue;
    let hasChanges = false;

    // Handle operation_type from RuleBuilder
    const operationType = operation.operation_type || operation.action;
    const newValue = operation.new_value || operation.newValue;

    switch (operationType) {
      case 'add':
        if (beforeValue === undefined || beforeValue === null) {
          afterValue = newValue;
          this.setNestedValue(updatedMetadata, metadataPath, afterValue);
          hasChanges = true;
        }
        break;

      case 'replace':
      case 'update':
        if (newValue !== undefined) {
          afterValue = newValue;
          this.setNestedValue(updatedMetadata, metadataPath, afterValue);
          hasChanges = beforeValue !== afterValue;
        }
        break;

      case 'remove':
        if (beforeValue !== undefined) {
          this.deleteNestedValue(updatedMetadata, metadataPath);
          afterValue = undefined;
          hasChanges = true;
        }
        break;

      case 'conditional':
        if (operation.condition) {
          const shouldApply = this.evaluateEnhancedCondition(record, operation.condition);
          if (shouldApply && newValue !== undefined) {
            afterValue = newValue;
            this.setNestedValue(updatedMetadata, metadataPath, afterValue);
            hasChanges = beforeValue !== afterValue;
          }
        }
        break;

      default:
        // 'keep' or unknown - no changes
        break;
    }

    return { hasChanges, beforeValue, afterValue };
  }

  /**
   * Apply optional tag operation with comprehensive operation type support
   */
  private applyOptionalTagOperation(
    record: DatabaseRecord,
    originalTags: string[],
    currentTags: string[],
    tagValue: string,
    operation: OperationConfig
  ): { hasChanges: boolean; updatedTags: string[] } {
    let updatedTags = [...currentTags];
    let hasChanges = false;

    const operationType = operation.operation_type || operation.action;
    const newValue = operation.new_value || operation.newValue;
    const tagExists = currentTags.includes(tagValue);

    switch (operationType) {
      case 'add':
        if (!tagExists && tagValue) {
          updatedTags.push(tagValue);
          hasChanges = true;
        } else if (newValue && Array.isArray(newValue)) {
          // Add multiple tags
          for (const tag of newValue) {
            if (!updatedTags.includes(tag)) {
              updatedTags.push(tag);
              hasChanges = true;
            }
          }
        }
        break;

      case 'replace':
        if (Array.isArray(newValue)) {
          updatedTags = [...newValue];
          hasChanges = JSON.stringify(originalTags.sort()) !== JSON.stringify(updatedTags.sort());
        } else if (tagExists && newValue) {
          const index = updatedTags.indexOf(tagValue);
          updatedTags[index] = newValue;
          hasChanges = true;
        }
        break;

      case 'remove':
        if (tagExists) {
          updatedTags = updatedTags.filter(tag => tag !== tagValue);
          hasChanges = true;
        }
        break;

      case 'conditional':
        if (operation.condition) {
          const shouldApply = this.evaluateEnhancedCondition(record, operation.condition);
          if (shouldApply) {
            if (newValue && !updatedTags.includes(newValue)) {
              updatedTags.push(newValue);
              hasChanges = true;
            }
          }
        }
        break;

      default:
        // 'keep' or unknown - no changes
        break;
    }

    return { hasChanges, updatedTags };
  }

  /**
   * Enhanced condition evaluation with more complex logic support
   */
  private evaluateEnhancedCondition(record: DatabaseRecord, condition: any): boolean {
    try {
      // Legacy format support
      if (condition.ifTagExists !== undefined) {
        if (condition.ifValue !== undefined) {
          const actualValue = this.getNestedValue(record.metadata, condition.ifTagExists);
          return actualValue === condition.ifValue;
        } else {
          const tags = record.optional_tags || [];
          return tags.includes(condition.ifTagExists);
        }
      }

      // Enhanced condition formats
      if (condition.metadata_path && condition.expected_value !== undefined) {
        const actualValue = this.getNestedValue(record.metadata, condition.metadata_path);
        return actualValue === condition.expected_value;
      }

      if (condition.optional_tag_exists) {
        const tags = record.optional_tags || [];
        return tags.includes(condition.optional_tag_exists);
      }

      if (condition.optional_tag_missing) {
        const tags = record.optional_tags || [];
        return !tags.includes(condition.optional_tag_missing);
      }

      // Default to true if no recognizable condition
      return true;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Execute bulk operations for batch processing
   */
  private async executeBulkOperations(
    bulkOps: any[],
    affectedRecords: Record<string, DatabaseRecord[]>,
    result: RuleExecutionResult
  ): Promise<void> {
    console.log(`[Phase3-BulkOps] Processing ${bulkOps.length} bulk operations...`);
    
    for (const bulkOp of bulkOps) {
      // Implementation depends on bulk operation structure
      // This is a placeholder for future bulk operation support
      console.log('[Phase3-BulkOps] Bulk operation processing not yet implemented:', bulkOp);
    }
  }

  /**
   * Execute hierarchical operations for related record processing
   */
  private async executeHierarchicalOperations(
    hierarchicalOps: any[],
    affectedRecords: Record<string, DatabaseRecord[]>,
    result: RuleExecutionResult
  ): Promise<void> {
    console.log(`[Phase3-HierarchicalOps] Processing ${hierarchicalOps.length} hierarchical operations...`);
    
    for (const hierarchicalOp of hierarchicalOps) {
      // Implementation depends on hierarchical operation structure
      // This is a placeholder for future hierarchical operation support
      console.log('[Phase3-HierarchicalOps] Hierarchical operation processing not yet implemented:', hierarchicalOp);
    }
  }

  /**
   * Update record metadata in database
   */
  private async updateRecordMetadata(table: string, recordId: string, metadata: any): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({ metadata })
      .eq('id', recordId);

    if (error) {
      throw new Error(`Failed to update metadata for record ${recordId} in ${table}: ${error.message}`);
    }
  }

  /**
   * Update record optional_tags in database
   */
  private async updateRecordOptionalTags(table: string, recordId: string, optional_tags: string[]): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({ optional_tags })
      .eq('id', recordId);

    if (error) {
      throw new Error(`Failed to update optional_tags for record ${recordId} in ${table}: ${error.message}`);
    }
  }

  /**
   * Validate post-execution state against metaval constraints
   */
  private async validatePostExecutionState(rule: SerializedRule, result: RuleExecutionResult): Promise<void> {
    console.log('[Phase3-PostValidation] Validating post-execution state...');

    // Get affected records to validate
    const validationErrors: string[] = [];
    
    for (const change of result.changes) {
      if (change.field_type === 'metadata' && change.after_value) {
        try {
          // Get word type to validate against
          const { data: record, error } = await supabase
            .from(change.table)
            .select('metadata')
            .eq('id', change.record_id)
            .single();

          if (!error && record?.metadata?.word_type) {
            const validation = await this.validateAgainstWordTypeRules(
              record.metadata.word_type,
              record.metadata
            );

            if (!validation.isValid) {
              validationErrors.push(
                `Record ${change.record_id} in ${change.table}: ${validation.errors.join(', ')}`
              );
            }
          }
        } catch (error) {
          console.warn(`Could not validate record ${change.record_id}:`, error);
        }
      }
    }

    if (validationErrors.length > 0) {
      console.warn('[Phase3-PostValidation] Validation warnings:', validationErrors);
      // For now, log warnings but don't fail the operation
      // In a production environment, you might want to rollback or require confirmation
    }

    console.log('[Phase3-PostValidation] Post-execution validation completed');
  }

  /**
   * Handle execution failure with comprehensive logging
   */
  private async handleExecutionFailure(
    rule: SerializedRule,
    executionId: string,
    startTime: number,
    error: any
  ): Promise<RuleExecutionResult> {
    const executionTime = Date.now() - startTime;
    console.error(`[Phase3-OperationDispatcher] Rule execution failed:`, error);
    
    const failedResult: RuleExecutionResult = {
      executionId,
      status: 'failed',
      recordsAffected: 0,
      tablesModified: [],
      changes: [],
      rollback_data: [],
      executionTimeMs: executionTime,
      errorMessage: error instanceof Error ? error.message : String(error)
    };

    // Log failed execution
    try {
      await this.logRuleExecution(rule, failedResult);
    } catch (logError) {
      console.error('[Phase3-OperationDispatcher] Failed to log execution failure:', logError);
    }
    
    return failedResult;
  }

  // ========================================================================
  // PHASE 3: ROLLBACK AND RECOVERY SYSTEM
  // ========================================================================

  /**
   * Execute rollback from RuleExecutionResult rollback data
   */
  async executeRollback(executionResult: RuleExecutionResult): Promise<{
    success: boolean;
    recordsReverted: number;
    errors: string[];
  }> {
    const rollbackStart = Date.now();
    console.log(`[Phase3-Rollback] Starting rollback for execution: ${executionResult.executionId}`);
    
    const errors: string[] = [];
    let recordsReverted = 0;

    try {
      // Group rollback data by table and record for efficient processing
      const rollbackByRecord = new Map<string, {
        table: string;
        record_id: string;
        metadata?: any;
        optional_tags?: string[];
      }>();

      // Process rollback data to reconstruct original state
      for (const rollbackEntry of executionResult.rollback_data) {
        const key = `${rollbackEntry.table}:${rollbackEntry.record_id}`;
        
        if (!rollbackByRecord.has(key)) {
          rollbackByRecord.set(key, {
            table: rollbackEntry.table,
            record_id: rollbackEntry.record_id
          });
        }

        const recordData = rollbackByRecord.get(key)!;
        
        if (rollbackEntry.field_type === 'metadata') {
          recordData.metadata = rollbackEntry.original_value;
        } else if (rollbackEntry.field_type === 'optional_tags') {
          recordData.optional_tags = rollbackEntry.original_value;
        }
      }

      // Execute rollback for each affected record
      for (const [key, recordData] of Array.from(rollbackByRecord.entries())) {
        try {
          const updateFields: any = {};
          
          if (recordData.metadata !== undefined) {
            updateFields.metadata = recordData.metadata;
          }
          
          if (recordData.optional_tags !== undefined) {
            updateFields.optional_tags = recordData.optional_tags;
          }

          if (Object.keys(updateFields).length > 0) {
            const { error } = await supabase
              .from(recordData.table)
              .update(updateFields)
              .eq('id', recordData.record_id);

            if (error) {
              errors.push(`Failed to rollback record ${recordData.record_id} in ${recordData.table}: ${error.message}`);
            } else {
              recordsReverted++;
            }
          }
        } catch (error) {
          errors.push(`Error rolling back record ${key}: ${error}`);
        }
      }

      // Log rollback execution
      await this.logRollbackExecution(executionResult.executionId, recordsReverted, errors, Date.now() - rollbackStart);

      const success = errors.length === 0;
      console.log(`[Phase3-Rollback] Rollback completed: ${recordsReverted} records reverted, ${errors.length} errors`);
      
      return { success, recordsReverted, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Phase3-Rollback] Rollback failed:', error);
      
      return {
        success: false,
        recordsReverted,
        errors: [...errors, `Rollback failed: ${errorMessage}`]
      };
    }
  }

  /**
   * Log rollback execution
   */
  private async logRollbackExecution(
    originalExecutionId: string,
    recordsReverted: number,
    errors: string[],
    rollbackTimeMs: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('migration_execution_log')
        .update({
          is_reverted: true,
          reverted_at: new Date().toISOString(),
          revert_notes: errors.length > 0 
            ? `Partial rollback: ${recordsReverted} records reverted, ${errors.length} errors: ${errors.join('; ')}`
            : `Complete rollback: ${recordsReverted} records reverted in ${rollbackTimeMs}ms`
        })
        .eq('rule_id', originalExecutionId);

      if (error) {
        console.error('Failed to log rollback execution:', error);
      }
    } catch (error) {
      console.error('Error logging rollback:', error);
    }
  }

  // ========================================================================
  // PHASE 3: ENHANCED VALIDATION AND CONSTRAINT CHECKING
  // ========================================================================

  /**
   * Comprehensive validation of rule operations before execution
   */
  async validateRuleOperationsBeforeExecution(rule: SerializedRule): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    affectedRecordCount: number;
  }> {
    console.log('[Phase3-PreValidation] Validating rule operations before execution...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    let affectedRecordCount = 0;

    try {
      // 1. Validate rule structure
      try {
        this.validateSerializedRule(rule);
      } catch (error) {
        errors.push(`Rule structure validation failed: ${error}`);
        return { isValid: false, errors, warnings, affectedRecordCount };
      }

      // 2. Validate target tables exist
      const availableTables = await this.getAvailableTables();
      for (const table of rule.target_tables) {
        if (!availableTables.includes(table)) {
          errors.push(`Target table '${table}' does not exist`);
        }
      }

      // 3. Get affected records and validate operations
      const affectedRecords = await this.getAffectedRecordsEnhanced(rule.source_selections, rule.target_tables);
      affectedRecordCount = Object.values(affectedRecords).flat().length;

      if (affectedRecordCount === 0) {
        warnings.push('No records will be affected by this rule');
      } else if (affectedRecordCount > 1000) {
        warnings.push(`Large number of records affected (${affectedRecordCount}). Consider breaking into smaller operations.`);
      }

      // 4. Validate metadata operations against metaval constraints
      if (rule.operations.metadata_operations) {
        const metadataValidation = await this.validateMetadataOperations(
          rule.operations.metadata_operations,
          affectedRecords
        );
        errors.push(...metadataValidation.errors);
        warnings.push(...metadataValidation.warnings);
      }

      // 5. Validate optional tag operations
      if (rule.operations.optional_tag_operations) {
        const tagValidation = this.validateOptionalTagOperations(
          rule.operations.optional_tag_operations
        );
        errors.push(...tagValidation.errors);
        warnings.push(...tagValidation.warnings);
      }

      console.log(`[Phase3-PreValidation] Validation completed: ${errors.length} errors, ${warnings.length} warnings`);
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        affectedRecordCount
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Validation process failed: ${errorMessage}`);
      
      return {
        isValid: false,
        errors,
        warnings,
        affectedRecordCount
      };
    }
  }

  /**
   * Validate metadata operations against metaval constraints
   */
  private async validateMetadataOperations(
    metadataOps: Record<string, Record<string, OperationConfig>>,
    affectedRecords: Record<string, DatabaseRecord[]>
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [table, tableOps] of Object.entries(metadataOps)) {
      const records = affectedRecords[table] || [];
      
      for (const [metadataPath, operation] of Object.entries(tableOps)) {
        const operationType = operation.operation_type || operation.action;
        const newValue = operation.new_value || operation.newValue;

        // Check if we're trying to set invalid values
        if ((operationType === 'add' || operationType === 'replace' || operationType === 'update') && newValue !== undefined) {
          // For each affected record, check if the new value would be valid
          for (const record of records.slice(0, 5)) { // Sample validation on first 5 records
            if (record.metadata?.word_type) {
              try {
                const testMetadata = { ...record.metadata };
                this.setNestedValue(testMetadata, metadataPath, newValue);
                
                const validation = await this.validateAgainstWordTypeRules(
                  record.metadata.word_type,
                  testMetadata
                );

                if (!validation.isValid) {
                  errors.push(
                    `Invalid value '${newValue}' for ${metadataPath} in ${table} (word_type: ${record.metadata.word_type}): ${validation.errors.join(', ')}`
                  );
                  break; // Stop after first validation error for this operation
                }
              } catch (validationError) {
                warnings.push(`Could not validate operation on ${metadataPath}: ${validationError}`);
              }
            }
          }
        }

        // Check for potentially destructive operations
        if (operationType === 'remove') {
          const affectedRecordCount = records.length;
          if (affectedRecordCount > 100) {
            warnings.push(
              `Remove operation on ${metadataPath} will affect ${affectedRecordCount} records in ${table}`
            );
          }
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate optional tag operations
   */
  private validateOptionalTagOperations(
    tagOps: Record<string, OperationConfig>
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [tagValue, operation] of Object.entries(tagOps)) {
      const operationType = operation.operation_type || operation.action;
      const newValue = operation.new_value || operation.newValue;

      // Validate tag values are strings
      if ((operationType === 'add' || operationType === 'replace') && newValue) {
        if (Array.isArray(newValue)) {
          for (const tag of newValue) {
            if (typeof tag !== 'string' || tag.trim() === '') {
              errors.push(`Invalid tag value: ${tag} (must be non-empty string)`);
            }
          }
        } else if (typeof newValue !== 'string' || newValue.trim() === '') {
          errors.push(`Invalid tag value: ${newValue} (must be non-empty string)`);
        }
      }

      // Check for potentially problematic operations
      if (operationType === 'replace' && Array.isArray(newValue) && newValue.length === 0) {
        warnings.push(`Replace operation will remove all optional tags`);
      }
    }

    return { errors, warnings };
  }

  // ========================================================================
  // PHASE 3: BATCH PROCESSING AND PERFORMANCE OPTIMIZATION
  // ========================================================================

  /**
   * Execute rule with batch processing for large datasets
   */
  async executeRuleInBatches(
    rule: SerializedRule, 
    batchSize: number = 50
  ): Promise<RuleExecutionResult> {
    console.log(`[Phase3-BatchExecution] Starting batch execution: ${rule.name}, batch size: ${batchSize}`);
    
    const startTime = Date.now();
    const executionId = `batch_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get all affected records
    const allAffectedRecords = await this.getAffectedRecordsEnhanced(rule.source_selections, rule.target_tables);
    const totalRecords = Object.values(allAffectedRecords).flat().length;
    
    if (totalRecords <= batchSize) {
      console.log('[Phase3-BatchExecution] Total records within batch size, using standard execution');
      return await this.executeRuleOperations(rule);
    }

    console.log(`[Phase3-BatchExecution] Processing ${totalRecords} records in batches of ${batchSize}`);
    
    // Initialize combined result
    const combinedResult: RuleExecutionResult = {
      executionId,
      status: 'success',
      recordsAffected: 0,
      tablesModified: [],
      changes: [],
      rollback_data: [],
      executionTimeMs: 0
    };

    const errors: string[] = [];
    let batchNumber = 0;

    // Process each table in batches
    for (const [table, records] of Object.entries(allAffectedRecords)) {
      if (records.length === 0) continue;

      // Split records into batches
      for (let i = 0; i < records.length; i += batchSize) {
        batchNumber++;
        const batch = records.slice(i, i + batchSize);
        
        console.log(`[Phase3-BatchExecution] Processing batch ${batchNumber}: ${batch.length} records from ${table}`);
        
        try {
          // Create batch-specific rule
          const batchRule: SerializedRule = {
            ...rule,
            id: `${rule.id}_batch_${batchNumber}`,
            name: `${rule.name} (Batch ${batchNumber})`
          };

          // Create batch-specific affected records
          const batchAffectedRecords = { [table]: batch };

          // Execute batch
          const batchResult = await this.executeBatchOperations(batchRule, batchAffectedRecords);
          
          // Combine results
          combinedResult.recordsAffected += batchResult.recordsAffected;
          combinedResult.changes.push(...batchResult.changes);
          combinedResult.rollback_data.push(...batchResult.rollback_data);
          
          if (!combinedResult.tablesModified.includes(table)) {
            combinedResult.tablesModified.push(table);
          }

          // Small delay between batches to reduce database load
          if (batchNumber % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Batch ${batchNumber} failed: ${errorMessage}`);
          console.error(`[Phase3-BatchExecution] Batch ${batchNumber} failed:`, error);
        }
      }
    }

    // Finalize combined result
    combinedResult.executionTimeMs = Date.now() - startTime;
    
    if (errors.length > 0) {
      combinedResult.status = errors.length === batchNumber ? 'failed' : 'partial';
      combinedResult.errorMessage = errors.join('; ');
    }

    // Log batch execution
    await this.logRuleExecution(rule, combinedResult);

    console.log(`[Phase3-BatchExecution] Batch execution completed: ${combinedResult.recordsAffected} records affected in ${batchNumber} batches`);
    
    return combinedResult;
  }

  /**
   * Execute operations on a specific batch of records
   */
  private async executeBatchOperations(
    rule: SerializedRule,
    batchAffectedRecords: Record<string, DatabaseRecord[]>
  ): Promise<RuleExecutionResult> {
    const result: RuleExecutionResult = {
      executionId: rule.id,
      status: 'success',
      recordsAffected: 0,
      tablesModified: [],
      changes: [],
      rollback_data: [],
      executionTimeMs: 0
    };

    // Capture pre-execution state for batch
    await this.capturePreExecutionState(batchAffectedRecords, result);

    // Route operations by type
    await this.routeOperationsByType(rule, batchAffectedRecords, result);

    return result;
  }
}