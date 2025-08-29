import { MetavalService, MetaAttribute, MetaValue } from '../services/MetavalService';

/**
 * DisplayNameService - Centralized service for converting stable IDs to human-readable names
 * Provides caching to avoid repeated MetavalService instantiation and database calls
 */
export class DisplayNameService {
  private static instance: DisplayNameService | null = null;
  private metavalService: MetavalService;
  
  // Caches
  private attributeDisplayNames: Map<string, string> = new Map();
  private valueDisplayNames: Map<string, string> = new Map();
  private attributeToValues: Map<string, MetaValue[]> = new Map();
  
  // Pending requests to avoid duplicate calls
  private pendingAttributeRequests: Map<string, Promise<string>> = new Map();
  private pendingValueRequests: Map<string, Promise<string>> = new Map();
  
  private constructor() {
    this.metavalService = new MetavalService();
  }
  
  public static getInstance(): DisplayNameService {
    if (!DisplayNameService.instance) {
      DisplayNameService.instance = new DisplayNameService();
    }
    return DisplayNameService.instance;
  }
  
  /**
   * Get display name for attribute stable ID (e.g., "metaattr008" -> "Gender")
   */
  async getAttributeDisplayName(stableId: string): Promise<string> {
    // Return cached result
    if (this.attributeDisplayNames.has(stableId)) {
      return this.attributeDisplayNames.get(stableId)!;
    }
    
    // Return pending request if already in progress
    if (this.pendingAttributeRequests.has(stableId)) {
      return this.pendingAttributeRequests.get(stableId)!;
    }
    
    // Create new request
    const request = this.fetchAttributeDisplayName(stableId);
    this.pendingAttributeRequests.set(stableId, request);
    
    const result = await request;
    
    // Clean up pending request
    this.pendingAttributeRequests.delete(stableId);
    
    return result;
  }
  
  private async fetchAttributeDisplayName(stableId: string): Promise<string> {
    try {
      const attribute = await this.metavalService.getAttributeByStableId(stableId);
      let displayName: string;
      
      if (attribute && attribute.display_name) {
        displayName = attribute.display_name;
      } else {
        // Fallback to formatted technical name
        displayName = this.formatTechnicalName(stableId);
      }
      
      // Cache the result
      this.attributeDisplayNames.set(stableId, displayName);
      return displayName;
    } catch (error) {
      console.warn(`DisplayNameService: Failed to get attribute display name for ${stableId}:`, error);
      const fallback = this.formatTechnicalName(stableId);
      this.attributeDisplayNames.set(stableId, fallback);
      return fallback;
    }
  }
  
  /**
   * Get display name for value stable ID (e.g., "metaattr008val038" -> "Feminine")
   */
  async getValueDisplayName(valueStableId: string): Promise<string> {
    // Return cached result
    if (this.valueDisplayNames.has(valueStableId)) {
      return this.valueDisplayNames.get(valueStableId)!;
    }
    
    // Return pending request if already in progress
    if (this.pendingValueRequests.has(valueStableId)) {
      return this.pendingValueRequests.get(valueStableId)!;
    }
    
    // Create new request
    const request = this.fetchValueDisplayName(valueStableId);
    this.pendingValueRequests.set(valueStableId, request);
    
    const result = await request;
    
    // Clean up pending request
    this.pendingValueRequests.delete(valueStableId);
    
    return result;
  }
  
  private async fetchValueDisplayName(valueStableId: string): Promise<string> {
    try {
      // Try to find the value by searching through attributes
      // Value stable IDs typically follow pattern: attributeStableId + "val" + number
      // e.g., "metaattr008val038" where "metaattr008" is the attribute stable ID
      
      const attributeStableId = this.extractAttributeStableId(valueStableId);
      
      if (attributeStableId) {
        // Get values for this attribute
        let values = this.attributeToValues.get(attributeStableId);
        
        if (!values) {
          values = await this.metavalService.getValuesByStableId(attributeStableId);
          this.attributeToValues.set(attributeStableId, values);
        }
        
        // Find the specific value
        const value = values.find(v => v.stable_id === valueStableId);
        if (value) {
          const displayName = value.shorthand || value.value;
          this.valueDisplayNames.set(valueStableId, displayName);
          return displayName;
        }
      }
      
      // Fallback to the stable ID itself
      const fallback = valueStableId;
      this.valueDisplayNames.set(valueStableId, fallback);
      return fallback;
    } catch (error) {
      console.warn(`DisplayNameService: Failed to get value display name for ${valueStableId}:`, error);
      const fallback = valueStableId;
      this.valueDisplayNames.set(valueStableId, fallback);
      return fallback;
    }
  }
  
  /**
   * Extract attribute stable ID from value stable ID
   * e.g., "metaattr008val038" -> "metaattr008"
   */
  private extractAttributeStableId(valueStableId: string): string | null {
    const match = valueStableId.match(/^(metaattr\d+)val\d+$/);
    return match ? match[1] : null;
  }
  
  /**
   * Get formatted tag display: "AttributeName: ValueName"
   * e.g., "Gender: Feminine" instead of "metaattr008: metaattr008val038"
   */
  async getFormattedTagDisplay(attributeStableId: string, valueStableId: string): Promise<string> {
    const [attributeName, valueName] = await Promise.all([
      this.getAttributeDisplayName(attributeStableId),
      this.getValueDisplayName(valueStableId)
    ]);
    
    return `${attributeName}: ${valueName}`;
  }
  
  /**
   * Batch get attribute display names for efficiency
   */
  async batchGetAttributeDisplayNames(stableIds: string[]): Promise<Map<string, string>> {
    const promises = stableIds.map(id => 
      this.getAttributeDisplayName(id).then(name => [id, name] as [string, string])
    );
    
    const results = await Promise.all(promises);
    return new Map(results);
  }
  
  /**
   * Batch get value display names for efficiency  
   */
  async batchGetValueDisplayNames(stableIds: string[]): Promise<Map<string, string>> {
    const promises = stableIds.map(id => 
      this.getValueDisplayName(id).then(name => [id, name] as [string, string])
    );
    
    const results = await Promise.all(promises);
    return new Map(results);
  }
  
  /**
   * Format technical name to display name as fallback
   */
  private formatTechnicalName(technicalName: string): string {
    // Handle metaval stable IDs
    if (technicalName.startsWith('metaattr')) {
      return technicalName; // Keep as-is for stable IDs without metadata
    }
    
    // Format underscore-separated names
    return technicalName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Clear all caches (useful for testing or data refresh)
   */
  clearCache(): void {
    this.attributeDisplayNames.clear();
    this.valueDisplayNames.clear();
    this.attributeToValues.clear();
    this.pendingAttributeRequests.clear();
    this.pendingValueRequests.clear();
    this.metavalService.clearCache();
  }
  
  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    attributeDisplayNames: number;
    valueDisplayNames: number;
    attributeToValues: number;
    pendingRequests: number;
  } {
    return {
      attributeDisplayNames: this.attributeDisplayNames.size,
      valueDisplayNames: this.valueDisplayNames.size,
      attributeToValues: this.attributeToValues.size,
      pendingRequests: this.pendingAttributeRequests.size + this.pendingValueRequests.size
    };
  }
}

/**
 * Convenience functions for React components
 */

// React hook-like function for getting display names (not a real hook, but similar pattern)
export const useDisplayNames = () => {
  const service = DisplayNameService.getInstance();
  
  return {
    getAttributeDisplayName: (stableId: string) => service.getAttributeDisplayName(stableId),
    getValueDisplayName: (stableId: string) => service.getValueDisplayName(stableId),
    getFormattedTagDisplay: (attrId: string, valueId: string) => service.getFormattedTagDisplay(attrId, valueId),
    batchGetAttributeDisplayNames: (stableIds: string[]) => service.batchGetAttributeDisplayNames(stableIds),
    batchGetValueDisplayNames: (stableIds: string[]) => service.batchGetValueDisplayNames(stableIds),
    clearCache: () => service.clearCache()
  };
};