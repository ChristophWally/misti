import { MetavalService, MetaAttribute, MetaValue } from '../services/MetavalService';

/**
 * DisplayNameService - Centralized service for converting stable IDs to human-readable names
 * Provides caching to avoid repeated MetavalService instantiation and database calls
 */
export class DisplayNameService {
  private static instance: DisplayNameService | null = null;
  private metavalService: MetavalService;
  
  // Caches
  private attributeDisplayNames: Map<string, { displayName: string; resolved: boolean }> = new Map();
  private valueDisplayNames: Map<string, { displayName: string; resolved: boolean }> = new Map();
  private attributeToValues: Map<string, MetaValue[]> = new Map();
  
  // Pending requests to avoid duplicate calls
  private pendingAttributeRequests: Map<string, Promise<{ displayName: string; resolved: boolean }>> = new Map();
  private pendingValueRequests: Map<string, Promise<{ displayName: string; resolved: boolean }>> = new Map();
  
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
  async getAttributeDisplayName(stableId: string): Promise<{ displayName: string; resolved: boolean }> {
    if (this.attributeDisplayNames.has(stableId)) {
      return this.attributeDisplayNames.get(stableId)!;
    }

    if (this.pendingAttributeRequests.has(stableId)) {
      return this.pendingAttributeRequests.get(stableId)!;
    }

    const request = this.fetchAttributeDisplayName(stableId);
    this.pendingAttributeRequests.set(stableId, request);

    const result = await request;
    this.pendingAttributeRequests.delete(stableId);

    return result;
  }

  private async fetchAttributeDisplayName(stableId: string): Promise<{ displayName: string; resolved: boolean }> {
    try {
      const attribute = await this.metavalService.getAttributeByStableId(stableId);
      let displayName: string;
      let resolved = true;

      if (attribute && attribute.display_name) {
        displayName = attribute.display_name;
      } else {
        displayName = this.formatTechnicalName(stableId);
        resolved = false;
        console.warn(`DisplayNameService: Falling back to technical name for attribute ${stableId}`);
      }

      const result = { displayName, resolved };
      this.attributeDisplayNames.set(stableId, result);
      return result;
    } catch (error) {
      console.warn(`DisplayNameService: Failed to get attribute display name for ${stableId}:`, error);
      const fallback = this.formatTechnicalName(stableId);
      const result = { displayName: fallback, resolved: false };
      this.attributeDisplayNames.set(stableId, result);
      return result;
    }
  }
  
  /**
   * Get display name for value stable ID (e.g., "metaattr008val038" -> "Feminine")
   */
  async getValueDisplayName(valueStableId: string): Promise<{ displayName: string; resolved: boolean }> {
    if (this.valueDisplayNames.has(valueStableId)) {
      return this.valueDisplayNames.get(valueStableId)!;
    }

    if (this.pendingValueRequests.has(valueStableId)) {
      return this.pendingValueRequests.get(valueStableId)!;
    }

    const request = this.fetchValueDisplayName(valueStableId);
    this.pendingValueRequests.set(valueStableId, request);

    const result = await request;
    this.pendingValueRequests.delete(valueStableId);

    return result;
  }

  private async fetchValueDisplayName(valueStableId: string): Promise<{ displayName: string; resolved: boolean }> {
    try {
      const attributeStableId = this.extractAttributeStableId(valueStableId);

      if (attributeStableId) {
        let values = this.attributeToValues.get(attributeStableId);

        if (!values) {
          values = await this.metavalService.getValuesByStableId(attributeStableId);
          this.attributeToValues.set(attributeStableId, values);
        }

        const value = values.find(v => v.stable_id === valueStableId);
        if (value) {
          const displayName = value.shorthand || value.value;
          const result = { displayName, resolved: true };
          this.valueDisplayNames.set(valueStableId, result);
          return result;
        }
      }

      console.warn(`DisplayNameService: Falling back to stable ID for value ${valueStableId}`);
      const fallback = { displayName: valueStableId, resolved: false };
      this.valueDisplayNames.set(valueStableId, fallback);
      return fallback;
    } catch (error) {
      console.warn(`DisplayNameService: Failed to get value display name for ${valueStableId}:`, error);
      const fallback = { displayName: valueStableId, resolved: false };
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

    return `${attributeName.displayName}: ${valueName.displayName}`;
  }
  
  /**
   * Batch get attribute display names for efficiency
   */
  async batchGetAttributeDisplayNames(stableIds: string[]): Promise<Map<string, string>> {
    const promises = stableIds.map(id => 
      this.getAttributeDisplayName(id).then(res => [id, res.displayName] as [string, string])
    );
    
    const results = await Promise.all(promises);
    return new Map(results);
  }
  
  /**
   * Batch get value display names for efficiency  
   */
  async batchGetValueDisplayNames(stableIds: string[]): Promise<Map<string, string>> {
    const promises = stableIds.map(id => 
      this.getValueDisplayName(id).then(res => [id, res.displayName] as [string, string])
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