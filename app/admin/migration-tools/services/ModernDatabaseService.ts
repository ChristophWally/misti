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
}