'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UnifiedMetadata {
  fromMetadata: string[];      // Keys from JSONB metadata column
  fromOptionalTags: string[];  // Items from optional_tags text[]
  fromLegacyTags: string[];   // Items from legacy tags text[] (transition period)
  source: 'metadata' | 'optional_tags' | 'legacy_tags';
  combined: string[];         // All unique values combined
}

export interface TableMetadataInfo {
  hasMetadata: boolean;
  hasOptionalTags: boolean;
  hasLegacyTags: boolean;
  primaryColumn: string;
}

export interface DatabaseStats {
  totalDictionary: number;
  totalWordForms: number;
  totalWordTranslations: number;
  totalFormTranslations: number;
}

const COLUMN_MAPPINGS = {
  dictionary: {
    metadata: ['metadata', 'optional_tags', 'tags'],
    primary: 'italian'
  },
  word_forms: {
    metadata: ['metadata', 'optional_tags', 'tags'], 
    primary: 'form_text'
  },
  word_translations: {
    metadata: ['metadata', 'optional_tags'], // No legacy tags column
    primary: 'translation'
  },
  form_translations: {
    metadata: ['metadata', 'optional_tags'], // No legacy tags column
    primary: 'translation'
  }
} as const;

export class DatabaseService {
  private supabase = createClientComponentClient();
  private debugLog: (message: string) => void;

  constructor(debugLog?: (message: string) => void) {
    this.debugLog = debugLog || ((msg) => console.log(msg));
  }

  // Check if a column exists in a table
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('column_exists', {
        table_name: tableName,
        column_name: columnName
      });
      
      if (error) {
        // Fallback: query information_schema
        const { data: schemaData } = await this.supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', tableName)
          .eq('column_name', columnName)
          .limit(1);
          
        return schemaData && schemaData.length > 0;
      }
      
      return data;
    } catch (error) {
      this.debugLog(`❌ Error checking column existence: ${error}`);
      return false;
    }
  }

  // Get table metadata information
  async getTableMetadata(tableName: string): Promise<TableMetadataInfo> {
    this.debugLog(`🔍 Analyzing table structure: ${tableName}`);
    
    const mapping = COLUMN_MAPPINGS[tableName as keyof typeof COLUMN_MAPPINGS];
    if (!mapping) {
      throw new Error(`Unsupported table: ${tableName}`);
    }

    const hasMetadata = mapping.metadata.includes('metadata');
    const hasOptionalTags = mapping.metadata.includes('optional_tags');
    const hasLegacyTags = mapping.metadata.includes('tags');

    this.debugLog(`📊 ${tableName}: metadata=${hasMetadata}, optional_tags=${hasOptionalTags}, legacy_tags=${hasLegacyTags}`);

    return {
      hasMetadata,
      hasOptionalTags,
      hasLegacyTags,
      primaryColumn: mapping.primary
    };
  }

  // Extract JSONB keys from metadata column
  async extractJSONBKeys(tableName: string, columnName: string, recordIds: string[]): Promise<string[]> {
    try {
      this.debugLog(`🔑 Extracting JSONB keys from ${tableName}.${columnName} for ${recordIds.length} records`);
      
      const { data, error } = await this.supabase
        .from(tableName)
        .select(columnName)
        .in('id', recordIds);

      if (error) throw error;

      const keys = new Set<string>();
      data?.forEach((record: any) => {
        const jsonbData = record[columnName];
        if (jsonbData && typeof jsonbData === 'object') {
          Object.keys(jsonbData).forEach(key => keys.add(key));
        }
      });

      const result = Array.from(keys).sort();
      this.debugLog(`✅ Found ${result.length} unique JSONB keys: ${result.slice(0, 5).join(', ')}${result.length > 5 ? '...' : ''}`);
      return result;
    } catch (error) {
      this.debugLog(`❌ Error extracting JSONB keys: ${error}`);
      return [];
    }
  }

  // Extract array values from text[] column
  async extractArrayValues(tableName: string, columnName: string, recordIds: string[]): Promise<string[]> {
    try {
      this.debugLog(`📋 Extracting array values from ${tableName}.${columnName} for ${recordIds.length} records`);
      
      const { data, error } = await this.supabase
        .from(tableName)
        .select(columnName)
        .in('id', recordIds);

      if (error) throw error;

      const values = new Set<string>();
      data?.forEach((record: any) => {
        const arrayData = record[columnName];
        if (Array.isArray(arrayData)) {
          arrayData.forEach(value => values.add(value));
        }
      });

      const result = Array.from(values).sort();
      this.debugLog(`✅ Found ${result.length} unique array values: ${result.slice(0, 5).join(', ')}${result.length > 5 ? '...' : ''}`);
      return result;
    } catch (error) {
      this.debugLog(`❌ Error extracting array values: ${error}`);
      return [];
    }
  }

  // Unified metadata extraction across all supported formats
  async extractAvailableMetadata(tableName: string, recordIds: string[]): Promise<UnifiedMetadata> {
    this.debugLog(`🔄 Starting unified metadata extraction for ${tableName} with ${recordIds.length} records`);
    
    const metadata = await this.getTableMetadata(tableName);
    const results: Partial<UnifiedMetadata> = {
      fromMetadata: [],
      fromOptionalTags: [],
      fromLegacyTags: [],
      combined: []
    };

    // Extract from each available source
    if (metadata.hasMetadata) {
      results.fromMetadata = await this.extractJSONBKeys(tableName, 'metadata', recordIds);
    }
    
    if (metadata.hasOptionalTags) {
      results.fromOptionalTags = await this.extractArrayValues(tableName, 'optional_tags', recordIds);
    }
    
    if (metadata.hasLegacyTags) {
      results.fromLegacyTags = await this.extractArrayValues(tableName, 'tags', recordIds);
    }

    // Combine all unique values
    const combinedSet = new Set([
      ...results.fromMetadata!,
      ...results.fromOptionalTags!,
      ...results.fromLegacyTags!
    ]);
    results.combined = Array.from(combinedSet).sort();

    // Determine primary source
    let source: UnifiedMetadata['source'] = 'metadata';
    if (results.fromMetadata!.length > 0) source = 'metadata';
    else if (results.fromOptionalTags!.length > 0) source = 'optional_tags';
    else if (results.fromLegacyTags!.length > 0) source = 'legacy_tags';

    const unified: UnifiedMetadata = {
      fromMetadata: results.fromMetadata!,
      fromOptionalTags: results.fromOptionalTags!,
      fromLegacyTags: results.fromLegacyTags!,
      source,
      combined: results.combined!
    };

    this.debugLog(`🎯 Unified extraction complete: ${unified.combined.length} total unique values from ${source} primary source`);
    return unified;
  }

  // Get database statistics
  async getDatabaseStats(): Promise<DatabaseStats> {
    this.debugLog('📊 Loading database statistics...');
    
    try {
      const [dictionaryResult, formsResult, translationsResult, formTranslationsResult] = await Promise.all([
        this.supabase.from('dictionary').select('id', { count: 'exact', head: true }),
        this.supabase.from('word_forms').select('id', { count: 'exact', head: true }),
        this.supabase.from('word_translations').select('id', { count: 'exact', head: true }),
        this.supabase.from('form_translations').select('id', { count: 'exact', head: true })
      ]);

      const stats: DatabaseStats = {
        totalDictionary: dictionaryResult.count || 0,
        totalWordForms: formsResult.count || 0,
        totalWordTranslations: translationsResult.count || 0,
        totalFormTranslations: formTranslationsResult.count || 0
      };

      this.debugLog(`✅ Stats loaded: Dictionary=${stats.totalDictionary}, Forms=${stats.totalWordForms}, Translations=${stats.totalWordTranslations}, FormTranslations=${stats.totalFormTranslations}`);
      return stats;
    } catch (error) {
      this.debugLog(`❌ Error loading database stats: ${error}`);
      return {
        totalDictionary: 0,
        totalWordForms: 0,
        totalWordTranslations: 0,
        totalFormTranslations: 0
      };
    }
  }

  // Search records by primary column with metadata filtering
  async searchRecords(
    tableName: string,
    searchTerm?: string,
    metadataFilter?: string[],
    limit: number = 100
  ): Promise<any[]> {
    try {
      const metadata = await this.getTableMetadata(tableName);
      let query = this.supabase.from(tableName).select('*').limit(limit);

      // Apply search term filter on primary column
      if (searchTerm) {
        query = query.ilike(metadata.primaryColumn, `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Apply client-side metadata filtering if specified
      if (metadataFilter && metadataFilter.length > 0) {
        return data!.filter((record: any) => {
          // Check metadata JSONB keys
          const metadataKeys = record.metadata ? Object.keys(record.metadata) : [];
          const optionalTags = record.optional_tags || [];
          const legacyTags = record.tags || [];
          
          const allValues = [...metadataKeys, ...optionalTags, ...legacyTags];
          return metadataFilter.some(filter => allValues.includes(filter));
        });
      }

      return data || [];
    } catch (error) {
      this.debugLog(`❌ Error searching records: ${error}`);
      return [];
    }
  }
}