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
      const changes = [];

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
        .from('migration_execution_history')
        .insert({
          execution_id: executionId,
          rule_name: rule.name,
          rule_config: rule,
          affected_records: changes.length,
          changes_made: changes,
          status: 'completed',
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

  // Unified tag discovery - get ALL tags from metadata and optional_tags
  async getAllAvailableTags(): Promise<{
    coreTags: { tag: string; count: number; tables: string[] }[];
    optionalTags: { tag: string; count: number; tables: string[] }[];
    groupedCoreTags: Record<string, { value: string; count: number; tables: string[] }[]>;
  }> {
    const coreTags: Map<string, { count: number; tables: Set<string> }> = new Map();
    const optionalTags: Map<string, { count: number; tables: Set<string> }> = new Map();
    const coreTagsByKey: Map<string, Map<string, { count: number; tables: Set<string> }>> = new Map();
    const tables = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];

    for (const table of tables) {
      try {
        // Get all records with metadata and optional_tags
        const { data, error } = await supabase
          .from(table)
          .select('metadata, optional_tags')
          .not('metadata', 'is', null)
          .not('optional_tags', 'is', null);

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

    for (const table of tablesToSearch) {
      try {
        let query = supabase.from(table).select('*');
        const conditions: string[] = [];

        // Search for core tags in metadata
        for (const coreTag of selectedTags.coreTags) {
          if (coreTag.includes(': ')) {
            const [key, value] = coreTag.split(': ', 2);
            conditions.push(`metadata->${key}.eq."${value}"`);
          }
        }

        // Search for optional tags in optional_tags array
        for (const optionalTag of selectedTags.optionalTags) {
          conditions.push(`optional_tags.cs.{"${optionalTag}"}`);
        }

        if (conditions.length > 0) {
          query = query.or(conditions.join(','));
        }

        const { data, error } = await query.limit(50);

        if (error) {
          console.error(`Error searching ${table}:`, error);
          results[tableMap[table as keyof typeof tableMap]] = [];
        } else {
          results[tableMap[table as keyof typeof tableMap]] = data || [];
        }
      } catch (tableError) {
        console.error(`Error searching table ${table}:`, tableError);
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
        .eq('dictionary_id', wordId);
      
      if (formsError) {
        console.error('Error fetching word forms:', formsError);
      }

      // Get word translations
      const { data: translations, error: translationsError } = await supabase
        .from('word_translations')
        .select('*')
        .eq('dictionary_id', wordId);
      
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
          .in('word_form_id', formIds);
        
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
        .from('migration_execution_history')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error loading execution history:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to load execution history:', error);
      throw error;
    }
  }
}