import { ModernDatabaseService } from './ModernDatabaseService';
import { supabase } from '../../../../lib/supabase';

export interface MetaAttribute {
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
  propagation_rule?: string;
}

export interface MetaValue {
  id: string;
  stable_id: string;
  value: string;
  shorthand?: string;
  description?: string;
  is_default: boolean;
  sort_order: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingMandatory: string[];
}

export interface ConditionalLevels {
  source_level: string;
  display_level: string;
  is_conditional: boolean;
}

/**
 * MetavalService - High-level service for metaval system operations
 * Provides abstractions over database operations for migration tools
 */
export class MetavalService {
  private dbService: ModernDatabaseService;
  private attributeCache: Map<string, MetaAttribute> = new Map();
  private valueCache: Map<string, MetaValue[]> = new Map();

  constructor() {
    this.dbService = ModernDatabaseService.getInstance();
  }

  // ========================================================================
  // ATTRIBUTE MANAGEMENT
  // ========================================================================

  /**
   * Get all attributes applicable to a word type with display-friendly formatting
   */
  async getAttributesForWordType(wordType: string): Promise<MetaAttribute[]> {
    const cacheKey = `wordtype_${wordType}`;
    
    try {
      const attributes = await this.dbService.getMetaAttributesForWordType(wordType);
      return attributes.map(attr => ({
        ...attr,
        display_name: attr.display_name || this.formatDisplayName(attr.name)
      }));
    } catch (error) {
      console.error(`MetavalService: Failed to get attributes for ${wordType}:`, error);
      return [];
    }
  }

  /**
   * Get attribute details by stable ID with caching
   */
  async getAttributeByStableId(stableId: string): Promise<MetaAttribute | null> {
    if (this.attributeCache.has(stableId)) {
      return this.attributeCache.get(stableId)!;
    }

    try {
      const attribute = await this.dbService.getAttributeByStableId(stableId);
      if (attribute) {
        const metaAttribute: MetaAttribute = {
          ...attribute,
          display_name: attribute.display_name || this.formatDisplayName(attribute.name)
        };
        this.attributeCache.set(stableId, metaAttribute);
        return metaAttribute;
      }
      return null;
    } catch (error) {
      console.error(`MetavalService: Failed to get attribute ${stableId}:`, error);
      return null;
    }
  }

  /**
   * Get user-friendly display name for attribute
   */
  async getAttributeDisplayName(stableId: string): Promise<string> {
    try {
      const attribute = await this.getAttributeByStableId(stableId);
      return attribute?.display_name || stableId;
    } catch (error) {
      console.error(`MetavalService: Failed to get display name for ${stableId}:`, error);
      return stableId;
    }
  }

  /**
   * Bulk lookup for attribute display names using optimized database function
   * Reduces N+1 queries to a single optimized function call
   */
  async getAttributeDisplayNamesBulk(attributeIds: string[]): Promise<Map<string, string>> {
    if (attributeIds.length === 0) {
      return new Map();
    }

    try {
      console.log(`MetavalService: Bulk lookup for ${attributeIds.length} attribute display names`);
      
      // Call the new optimized database function
      const { data, error } = await supabase.rpc('get_attribute_display_names', {
        attribute_ids: attributeIds
      });

      if (error) {
        console.error('Error calling get_attribute_display_names function:', error);
        // Fallback to individual lookups
        return await this.getAttributeDisplayNamesBulkFallback(attributeIds);
      }

      if (!data || data.length === 0) {
        console.warn('No display names returned from optimized function, using fallback');
        return await this.getAttributeDisplayNamesBulkFallback(attributeIds);
      }

      // Process the results into a Map
      const displayNameMap = new Map<string, string>();
      
      for (const row of data) {
        const { attribute_id, display_name, name } = row;
        // Use display_name if available, otherwise fallback to name, then to the original ID
        displayNameMap.set(attribute_id, display_name || name || attribute_id);
      }

      // For any IDs that weren't found, use the formatted version
      for (const id of attributeIds) {
        if (!displayNameMap.has(id)) {
          displayNameMap.set(id, this.formatDisplayName(id));
        }
      }

      console.log(`MetavalService: Bulk lookup resolved ${displayNameMap.size} display names`);
      return displayNameMap;

    } catch (error) {
      console.error('MetavalService: Error in bulk display name lookup, using fallback:', error);
      return await this.getAttributeDisplayNamesBulkFallback(attributeIds);
    }
  }

  /**
   * Fallback method for bulk display name lookup using individual queries
   */
  private async getAttributeDisplayNamesBulkFallback(attributeIds: string[]): Promise<Map<string, string>> {
    console.log('MetavalService: Using fallback method for bulk display name lookup');
    
    const displayNameMap = new Map<string, string>();
    
    // Process in parallel to reduce latency
    const lookupPromises = attributeIds.map(async (id) => {
      try {
        const displayName = await this.getAttributeDisplayName(id);
        return { id, displayName };
      } catch (error) {
        console.error(`Failed to get display name for ${id}:`, error);
        return { id, displayName: this.formatDisplayName(id) };
      }
    });

    const results = await Promise.all(lookupPromises);
    
    for (const { id, displayName } of results) {
      displayNameMap.set(id, displayName);
    }

    return displayNameMap;
  }

  /**
   * Check if an attribute is applicable to a specific word type
   */
  async isAttributeApplicableToWordType(stableId: string, wordType: string): Promise<boolean> {
    try {
      const attributes = await this.getAttributesForWordType(wordType);
      return attributes.some(attr => attr.stable_id === stableId);
    } catch (error) {
      console.error(`MetavalService: Failed to check applicability for ${stableId}, ${wordType}:`, error);
      return false;
    }
  }

  // ========================================================================
  // VALUE MANAGEMENT
  // ========================================================================

  /**
   * Get all values for an attribute with caching
   */
  async getValuesForAttribute(attributeId: string): Promise<MetaValue[]> {
    if (this.valueCache.has(attributeId)) {
      return this.valueCache.get(attributeId)!;
    }

    try {
      const values = await this.dbService.getMetaValuesByAttribute(attributeId);
      this.valueCache.set(attributeId, values);
      return values;
    } catch (error) {
      console.error(`MetavalService: Failed to get values for attribute ${attributeId}:`, error);
      return [];
    }
  }

  /**
   * Get values for attribute by stable ID
   */
  async getValuesByStableId(stableId: string): Promise<MetaValue[]> {
    try {
      const attribute = await this.getAttributeByStableId(stableId);
      if (!attribute) return [];
      
      return await this.getValuesForAttribute(attribute.id);
    } catch (error) {
      console.error(`MetavalService: Failed to get values for stable ID ${stableId}:`, error);
      return [];
    }
  }

  /**
   * Get value display name by stable ID (e.g., "metaattr008val038" -> "Feminine")
   */
  async getValueDisplayName(valueStableId: string): Promise<string | null> {
    try {
      const value = await this.dbService.getMetaValueByStableId(valueStableId);
      if (value) {
        return value.value || value.shorthand || valueStableId;
      }
      return null;
    } catch (error) {
      console.error(`MetavalService: Failed to get value display name for ${valueStableId}:`, error);
      return null;
    }
  }

  /**
   * Get value details by stable ID
   */
  async getValueByStableId(stableId: string): Promise<MetaValue | null> {
    try {
      return await this.dbService.getMetaValueByStableId(stableId);
    } catch (error) {
      console.error(`MetavalService: Failed to get value by stable ID ${stableId}:`, error);
      return null;
    }
  }

  /**
   * Format COMBINE display with shorthand optimization
   */
  async formatCombineDisplay(attributeId: string, values: string[]): Promise<string> {
    try {
      return await this.dbService.formatCombineDisplay(attributeId, values);
    } catch (error) {
      console.error(`MetavalService: Failed to format COMBINE display:`, error);
      return values.join(' & ');
    }
  }

  // ========================================================================
  // VALIDATION SERVICES
  // ========================================================================

  /**
   * Validate metadata for a specific word type with user-friendly messages
   */
  async validateMetadataForWordType(wordType: string, metadata: Record<string, any>): Promise<ValidationResult> {
    try {
      const result = await this.dbService.validateAgainstWordTypeRules(wordType, metadata);
      
      // Enhance with user-friendly display names
      const attributes = await this.getAttributesForWordType(wordType);
      const displayNameMap = new Map(attributes.map(attr => [attr.name, attr.display_name]));

      const enhancedErrors = result.errors.map(error => {
        // Replace technical names with display names in error messages
        let enhancedError = error;
        for (const [techName, displayName] of Array.from(displayNameMap.entries())) {
          enhancedError = enhancedError.replace(techName, displayName || techName);
        }
        return enhancedError;
      });

      return {
        ...result,
        errors: enhancedErrors
      };
    } catch (error) {
      console.error(`MetavalService: Validation failed for ${wordType}:`, error);
      return {
        isValid: false,
        errors: [`Validation service error: ${error}`],
        warnings: [],
        missingMandatory: []
      };
    }
  }

  /**
   * Check word-type restrictions for an attribute
   */
  async checkWordTypeRestrictions(stableId: string, wordType: string): Promise<{
    isAllowed: boolean;
    isMandatory: boolean;
    reason?: string;
  }> {
    try {
      const isApplicable = await this.isAttributeApplicableToWordType(stableId, wordType);
      
      if (!isApplicable) {
        const displayName = await this.getAttributeDisplayName(stableId);
        return {
          isAllowed: false,
          isMandatory: false,
          reason: `${displayName} is not applicable to ${wordType} words`
        };
      }

      const attributes = await this.getAttributesForWordType(wordType);
      const attribute = attributes.find(attr => attr.stable_id === stableId);

      return {
        isAllowed: true,
        isMandatory: attribute?.is_mandatory || false
      };
    } catch (error) {
      console.error(`MetavalService: Failed to check restrictions for ${stableId}, ${wordType}:`, error);
      return {
        isAllowed: false,
        isMandatory: false,
        reason: 'Unable to check restrictions'
      };
    }
  }

  // ========================================================================
  // CONDITIONAL PATTERNS
  // ========================================================================

  /**
   * Get effective source/display levels considering conditional patterns
   */
  async getEffectiveLevels(attributeId: string, wordType: string): Promise<ConditionalLevels> {
    try {
      return await this.dbService.getConditionalLevels(attributeId, wordType);
    } catch (error) {
      console.error(`MetavalService: Failed to get conditional levels:`, error);
      return {
        source_level: 'word',
        display_level: 'word',
        is_conditional: false
      };
    }
  }

  /**
   * Check if attribute has conditional behavior for word type
   */
  async hasConditionalBehavior(stableId: string, wordType: string): Promise<boolean> {
    try {
      const attribute = await this.getAttributeByStableId(stableId);
      if (!attribute) return false;

      const levels = await this.getEffectiveLevels(attribute.id, wordType);
      return levels.is_conditional;
    } catch (error) {
      console.error(`MetavalService: Failed to check conditional behavior:`, error);
      return false;
    }
  }

  // ========================================================================
  // SEARCH & DISCOVERY
  // ========================================================================

  /**
   * Search records by metaval attribute with display-friendly results
   */
  async searchByAttribute(stableId: string, value: string, tables: string[]): Promise<{
    results: Record<string, any[]>;
    attributeInfo: {
      stable_id: string;
      display_name: string;
      technical_name: string;
    };
  }> {
    try {
      const attribute = await this.getAttributeByStableId(stableId);
      if (!attribute) {
        throw new Error(`Attribute not found: ${stableId}`);
      }

      const results = await this.dbService.searchByMetavalStableId(stableId, value, tables);

      return {
        results,
        attributeInfo: {
          stable_id: stableId,
          display_name: attribute.display_name,
          technical_name: attribute.name
        }
      };
    } catch (error) {
      console.error(`MetavalService: Search failed for ${stableId}:`, error);
      return {
        results: {},
        attributeInfo: {
          stable_id: stableId,
          display_name: stableId,
          technical_name: stableId
        }
      };
    }
  }

  /**
   * Get all available word types from metaval system
   */
  async getAvailableWordTypes(): Promise<string[]> {
    return ['noun', 'verb', 'adjective', 'adverb'];
  }

  // ========================================================================
  // UTILITIES
  // ========================================================================

  /**
   * Clear caches (useful for testing or after data changes)
   */
  clearCache(): void {
    this.attributeCache.clear();
    this.valueCache.clear();
  }

  /**
   * Format technical name to display name
   */
  private formatDisplayName(technicalName: string): string {
    return technicalName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Batch operation helper
   */
  async batchValidateMetadata(records: Array<{
    wordType: string;
    metadata: Record<string, any>;
    recordId: string;
  }>): Promise<Array<{
    recordId: string;
    validation: ValidationResult;
  }>> {
    const results = await Promise.all(
      records.map(async (record) => ({
        recordId: record.recordId,
        validation: await this.validateMetadataForWordType(record.wordType, record.metadata)
      }))
    );

    return results;
  }
}