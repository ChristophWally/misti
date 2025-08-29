/**
 * MetavalMappingService - Comprehensive string-to-stable-ID mapping service
 * Handles the migration from string-based metadata to metaval stable IDs
 */

import { supabase } from '../../../../lib/supabase';

export interface AttributeMapping {
  technicalName: string;
  stableId: string;
  displayName: string;
  values: ValueMapping[];
}

export interface ValueMapping {
  value: string;
  stableId: string;
  shorthand?: string;
}

export interface MigrationResult {
  success: boolean;
  originalMetadata: Record<string, any>;
  migratedMetadata: Record<string, any>;
  sizeReduction: number;
  errors: string[];
  warnings: string[];
}

export class MetavalMappingService {
  private attributeMappings: Map<string, AttributeMapping> = new Map();
  private valueMappings: Map<string, Map<string, ValueMapping>> = new Map(); // attribute -> value -> mapping
  private isInitialized = false;

  /**
   * Initialize the mapping service by loading all attribute and value mappings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load attribute mappings
      const { data: attributes, error: attrError } = await supabase
        .from('meta_attributes')
        .select('name, stable_id, display_name')
        .eq('is_active', true);

      if (attrError) {
        throw new Error(`Failed to load attributes: ${attrError.message}`);
      }

      // Load value mappings
      const { data: values, error: valError } = await supabase
        .from('meta_values')
        .select(`
          value,
          stable_id,
          shorthand,
          meta_attributes!inner(name)
        `)
        .eq('is_active', true)
        .eq('meta_attributes.is_active', true);

      if (valError) {
        throw new Error(`Failed to load values: ${valError.message}`);
      }

      // Build attribute mappings
      for (const attr of attributes || []) {
        const attributeValues = (values || [])
          .filter((v: any) => v.meta_attributes.name === attr.name)
          .map((v: any) => ({
            value: v.value,
            stableId: v.stable_id,
            shorthand: v.shorthand
          }));

        const mapping: AttributeMapping = {
          technicalName: attr.name,
          stableId: attr.stable_id,
          displayName: attr.display_name,
          values: attributeValues
        };

        this.attributeMappings.set(attr.name, mapping);

        // Build value lookup map for quick access
        const valueMap = new Map<string, ValueMapping>();
        attributeValues.forEach(v => valueMap.set(v.value, v));
        this.valueMappings.set(attr.name, valueMap);
      }

      this.isInitialized = true;
      console.log(`MetavalMappingService initialized with ${this.attributeMappings.size} attributes and ${values?.length || 0} values`);
    } catch (error) {
      console.error('Failed to initialize MetavalMappingService:', error);
      throw error;
    }
  }

  /**
   * Convert string-based metadata to stable ID format
   */
  async migrateMetadata(originalMetadata: Record<string, any>): Promise<MigrationResult> {
    await this.initialize();

    const result: MigrationResult = {
      success: true,
      originalMetadata,
      migratedMetadata: {},
      sizeReduction: 0,
      errors: [],
      warnings: []
    };

    const originalSize = JSON.stringify(originalMetadata).length;

    try {
      for (const [key, value] of Object.entries(originalMetadata)) {
        const attributeMapping = this.attributeMappings.get(key);
        
        if (!attributeMapping) {
          result.warnings.push(`Unknown attribute: ${key} - keeping as-is`);
          result.migratedMetadata[key] = value;
          continue;
        }

        // Map attribute key to stable ID
        const stableAttributeId = attributeMapping.stableId;

        // Map value to stable ID if possible
        const valueMap = this.valueMappings.get(key);
        const valueMapping = valueMap?.get(String(value));

        if (valueMapping) {
          result.migratedMetadata[stableAttributeId] = valueMapping.stableId;
        } else if (typeof value === 'boolean') {
          // Handle boolean values
          const boolValue = value ? 'true' : 'false';
          const boolMapping = valueMap?.get(boolValue);
          if (boolMapping) {
            result.migratedMetadata[stableAttributeId] = boolMapping.stableId;
          } else {
            result.warnings.push(`No stable ID for boolean value: ${key}=${boolValue}`);
            result.migratedMetadata[stableAttributeId] = boolValue;
          }
        } else {
          result.warnings.push(`No stable ID for value: ${key}=${value} - keeping original value`);
          result.migratedMetadata[stableAttributeId] = value;
        }
      }

      const migratedSize = JSON.stringify(result.migratedMetadata).length;
      result.sizeReduction = Math.round(((originalSize - migratedSize) / originalSize) * 100);

      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Migration failed: ${error}`);
    }

    return result;
  }

  /**
   * Batch migrate metadata for multiple records
   */
  async batchMigrateMetadata(records: Array<{
    id: string;
    metadata: Record<string, any>;
  }>): Promise<Array<{
    id: string;
    result: MigrationResult;
  }>> {
    await this.initialize();

    const results = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        result: await this.migrateMetadata(record.metadata)
      }))
    );

    return results;
  }

  /**
   * Preview migration without executing - for validation and user review
   */
  async previewMigration(tableName: string, limit: number = 10): Promise<{
    sampleMigrations: Array<{
      recordId: string;
      original: Record<string, any>;
      migrated: Record<string, any>;
      sizeReduction: number;
    }>;
    totalRecords: number;
    estimatedSizeReduction: number;
    warnings: string[];
  }> {
    await this.initialize();

    try {
      // Get sample records
      const { data: records, error } = await supabase
        .from(tableName)
        .select('id, metadata')
        .not('metadata', 'is', null)
        .neq('metadata', '{}')
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch preview records: ${error.message}`);
      }

      // Get total count
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .not('metadata', 'is', null)
        .neq('metadata', '{}');

      const sampleMigrations: Array<{
        recordId: any;
        original: any;
        migrated: Record<string, any>;
        sizeReduction: number;
      }> = [];
      let totalOriginalSize = 0;
      let totalMigratedSize = 0;
      const allWarnings = new Set<string>();

      for (const record of records || []) {
        const result = await this.migrateMetadata(record.metadata);
        
        const originalSize = JSON.stringify(record.metadata).length;
        const migratedSize = JSON.stringify(result.migratedMetadata).length;
        
        totalOriginalSize += originalSize;
        totalMigratedSize += migratedSize;
        
        result.warnings.forEach(w => allWarnings.add(w));

        sampleMigrations.push({
          recordId: record.id,
          original: record.metadata,
          migrated: result.migratedMetadata,
          sizeReduction: result.sizeReduction
        });
      }

      const estimatedSizeReduction = totalOriginalSize > 0 
        ? Math.round(((totalOriginalSize - totalMigratedSize) / totalOriginalSize) * 100)
        : 0;

      return {
        sampleMigrations,
        totalRecords: count || 0,
        estimatedSizeReduction,
        warnings: Array.from(allWarnings)
      };

    } catch (error) {
      console.error(`Preview migration failed for ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get mapping statistics for reporting
   */
  getMappingStats(): {
    totalAttributes: number;
    totalValues: number;
    attributesWithValues: number;
    attributesWithShorthand: number;
  } {
    const totalAttributes = this.attributeMappings.size;
    let totalValues = 0;
    let attributesWithValues = 0;
    let attributesWithShorthand = 0;

    for (const [attrName, mapping] of Array.from(this.attributeMappings.entries())) {
      if (mapping.values.length > 0) {
        attributesWithValues++;
        totalValues += mapping.values.length;
        
        if (mapping.values.some(v => v.shorthand)) {
          attributesWithShorthand++;
        }
      }
    }

    return {
      totalAttributes,
      totalValues,
      attributesWithValues,
      attributesWithShorthand
    };
  }

  /**
   * Get attribute mapping by technical name
   */
  getAttributeMapping(technicalName: string): AttributeMapping | undefined {
    return this.attributeMappings.get(technicalName);
  }

  /**
   * Get all attribute mappings
   */
  getAllAttributeMappings(): AttributeMapping[] {
    return Array.from(this.attributeMappings.values());
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}