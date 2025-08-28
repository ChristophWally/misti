'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DatabaseService, UnifiedMetadata } from '../../services/DatabaseService';
import { MetavalService, MetaAttribute, ValidationResult } from '../../services/MetavalService';

interface Step2MetadataLoaderProps {
  tableName: string;
  selectedRecordIds: string[];
  selectedMetadata: string[];
  onMetadataChange: (metadata: string[]) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  autoLoad?: boolean; // NEW: Automatic loading decision (collaborative decision)
  debugLog?: (message: string) => void;
  // METAVAL ENHANCEMENT: Optional word type filtering
  selectedWordTypes?: string[];
  enableMetavalIntegration?: boolean; // Toggle for metaval features
  onValidationChange?: (validation: ValidationResult[]) => void;
}

export default function Step2MetadataLoader({
  tableName,
  selectedRecordIds,
  selectedMetadata,
  onMetadataChange,
  onLoadingStateChange,
  autoLoad = true, // Default to automatic loading
  debugLog,
  selectedWordTypes = [],
  enableMetavalIntegration = true,
  onValidationChange
}: Step2MetadataLoaderProps) {
  const [availableMetadata, setAvailableMetadata] = useState<UnifiedMetadata | null>(null);
  const [metavalAttributes, setMetavalAttributes] = useState<MetaAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const log = useCallback((message: string) => {
    debugLog?.(message);
  }, [debugLog]);

  const databaseService = new DatabaseService(log);
  const metavalService = new MetavalService();

  // AUTO-LOAD: Trigger when selectedRecordIds changes (collaborative decision)
  useEffect(() => {
    if (autoLoad && selectedRecordIds.length > 0) {
      loadMetadata();
    }
  }, [selectedRecordIds, autoLoad]);

  // METAVAL: Load applicable attributes when word types change
  useEffect(() => {
    if (enableMetavalIntegration && selectedWordTypes.length > 0) {
      loadMetavalAttributes();
    }
  }, [selectedWordTypes, enableMetavalIntegration]);

  const loadMetavalAttributes = useCallback(async () => {
    if (!enableMetavalIntegration || selectedWordTypes.length === 0) return;

    try {
      log(`🔄 Loading metaval attributes for word types: ${selectedWordTypes.join(', ')}`);
      
      const allAttributes = await Promise.all(
        selectedWordTypes.map(wordType => metavalService.getAttributesForWordType(wordType))
      );
      
      // Merge and deduplicate attributes
      const uniqueAttributes = new Map<string, MetaAttribute>();
      allAttributes.flat().forEach(attr => {
        uniqueAttributes.set(attr.stable_id, attr);
      });
      
      const attributes = Array.from(uniqueAttributes.values())
        .sort((a, b) => {
          // Sort: mandatory first, then by display name
          if (a.is_mandatory !== b.is_mandatory) {
            return a.is_mandatory ? -1 : 1;
          }
          return a.display_name.localeCompare(b.display_name);
        });

      setMetavalAttributes(attributes);
      log(`✅ Loaded ${attributes.length} metaval attributes (${attributes.filter(a => a.is_mandatory).length} mandatory)`);
    } catch (error) {
      console.error('Failed to load metaval attributes:', error);
      log(`❌ Failed to load metaval attributes: ${error}`);
    }
  }, [selectedWordTypes, enableMetavalIntegration, log]);

  const loadMetadata = useCallback(async () => {
    if (selectedRecordIds.length === 0) {
      log('⚠️ No records selected for metadata loading');
      setError('No records selected');
      return;
    }

    setIsLoading(true);
    setError(null);
    onLoadingStateChange?.(true);

    try {
      log(`🔄 Loading metadata from ${tableName} for ${selectedRecordIds.length} records...`);
      
      const metadata = await databaseService.extractAvailableMetadata(tableName, selectedRecordIds);
      setAvailableMetadata(metadata);
      
      log(`✅ Metadata loaded: ${metadata.combined.length} unique values from multiple sources`);
      log(`📊 Sources: metadata(${metadata.fromMetadata.length}), optional_tags(${metadata.fromOptionalTags.length}), legacy_tags(${metadata.fromLegacyTags.length})`);
      
    } catch (err: any) {
      const errorMsg = `Failed to load metadata: ${err.message}`;
      setError(errorMsg);
      log(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
      onLoadingStateChange?.(false);
    }
  }, [tableName, selectedRecordIds, log, onLoadingStateChange]);

  const handleMetadataToggle = useCallback((metadataValue: string) => {
    const newSelection = selectedMetadata.includes(metadataValue)
      ? selectedMetadata.filter(m => m !== metadataValue)
      : [...selectedMetadata, metadataValue];
    
    onMetadataChange(newSelection);
    log(`🏷️ Metadata selection updated: ${newSelection.length} items selected`);
  }, [selectedMetadata, onMetadataChange, log]);

  const getSourceIcon = (value: string): string => {
    if (!availableMetadata) return '🏷️';
    
    if (availableMetadata.fromMetadata.includes(value)) return '📋'; // metadata JSONB
    if (availableMetadata.fromOptionalTags.includes(value)) return '🏷️'; // optional_tags array
    if (availableMetadata.fromLegacyTags.includes(value)) return '⚠️'; // legacy tags array
    return '❓';
  };

  const getSourceLabel = (value: string): string => {
    if (!availableMetadata) return 'unknown';
    
    if (availableMetadata.fromMetadata.includes(value)) return 'metadata';
    if (availableMetadata.fromOptionalTags.includes(value)) return 'optional_tags';
    if (availableMetadata.fromLegacyTags.includes(value)) return 'legacy_tags';
    return 'unknown';
  };

  // METAVAL: Get display name for metadata attribute
  const getMetavalDisplayInfo = (value: string): { displayName: string; isMandatory: boolean; stableId?: string } => {
    if (!enableMetavalIntegration || metavalAttributes.length === 0) {
      return { displayName: value, isMandatory: false };
    }

    // Check if this is a structured metadata value (attribute: value)
    if (value.includes(': ')) {
      const [attrName] = value.split(': ', 2);
      const attribute = metavalAttributes.find(attr => attr.name === attrName);
      if (attribute) {
        return {
          displayName: value.replace(attrName, attribute.display_name),
          isMandatory: attribute.is_mandatory,
          stableId: attribute.stable_id
        };
      }
    }

    return { displayName: value, isMandatory: false };
  };

  const renderMetadataSource = () => {
    if (!availableMetadata) return null;

    const { fromMetadata, fromOptionalTags, fromLegacyTags } = availableMetadata;
    
    return (
      <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
        <div className="font-medium mb-1">
          Metadata Sources Found 
          {enableMetavalIntegration && (
            <span className="text-green-600 ml-1">✨ Metaval Enhanced</span>
          )}:
        </div>
        <div className="space-y-1">
          {fromMetadata.length > 0 && (
            <div>📋 <span className="font-mono">Mandatory Tags (metadata)</span>: {fromMetadata.length} keys</div>
          )}
          {fromOptionalTags.length > 0 && (
            <div>🏷️ <span className="font-mono">Optional Tags (optional_tags)</span>: {fromOptionalTags.length} items</div>
          )}
          {fromLegacyTags.length > 0 && (
            <div className="text-yellow-600">⚠️ <span className="font-mono">Legacy Tags (transition)</span>: {fromLegacyTags.length} items</div>
          )}
          {enableMetavalIntegration && metavalAttributes.length > 0 && (
            <div className="text-green-600">
              ✨ <span className="font-mono">Metaval Attributes</span>: {metavalAttributes.length} available 
              ({metavalAttributes.filter(a => a.is_mandatory).length} mandatory)
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded p-3 bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-blue-900">
          🔍 Step 2: Select Metadata/Tags from {selectedRecordIds.length} Selected Record(s)
        </div>
        {isLoading && (
          <div className="text-xs text-blue-600">Loading...</div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600 mb-3 p-2 bg-red-50 rounded">
          ❌ {error}
        </div>
      )}

      {!availableMetadata && !isLoading && !autoLoad && (
        <button
          onClick={loadMetadata}
          disabled={selectedRecordIds.length === 0}
          className="w-full py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🔄 Load Metadata/Tags from Selected Records
        </button>
      )}

      {!availableMetadata && !isLoading && autoLoad && selectedRecordIds.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4">
          Select records first - metadata will load automatically
        </div>
      )}

      {availableMetadata && (
        <div>
          {renderMetadataSource()}
          
          {availableMetadata.combined.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No metadata or tags found in selected records
            </div>
          ) : (
            <div>
              <div className="text-xs text-blue-800 mb-2">
                Available metadata/tags from selected records (prioritizing mandatory):
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableMetadata.combined.map((value, index) => {
                  const displayInfo = getMetavalDisplayInfo(value);
                  return (
                    <label 
                      key={`${value}-${index}`} 
                      className={`flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-1 rounded ${
                        displayInfo.isMandatory ? 'border-l-2 border-red-400 bg-red-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMetadata.includes(value)}
                        onChange={() => handleMetadataToggle(value)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-grow min-w-0">
                        {enableMetavalIntegration && displayInfo.displayName !== value ? (
                          <div>
                            <div className="text-xs font-medium text-gray-900">{displayInfo.displayName}</div>
                            <div className="text-xs font-mono text-gray-500">{value}</div>
                          </div>
                        ) : (
                          <span className="text-xs font-mono">{value}</span>
                        )}
                        {displayInfo.isMandatory && (
                          <span className="text-xs text-red-600 font-medium ml-1">MANDATORY</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {displayInfo.stableId && (
                          <span 
                            className="text-xs px-1 py-0.5 rounded bg-green-100 text-green-700"
                            title={`Metaval Stable ID: ${displayInfo.stableId}`}
                          >
                            ✨
                          </span>
                        )}
                        <span 
                          className="text-xs px-1 py-0.5 rounded text-gray-600"
                          title={`Source: ${getSourceLabel(value)}`}
                        >
                          {getSourceIcon(value)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {selectedMetadata.length} of {availableMetadata.combined.length} items selected
                </span>
                <button
                  onClick={loadMetadata}
                  className="text-blue-600 hover:text-blue-800 underline"
                  title="Reload metadata from database"
                >
                  🔄 Refresh
                </button>
              </div>

              {selectedMetadata.length > 0 && (
                <div className="mt-2 text-xs text-blue-800">
                  ✅ {selectedMetadata.length} metadata/tag(s) selected for migration
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}