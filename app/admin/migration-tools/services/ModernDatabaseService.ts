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