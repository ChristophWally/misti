'use client';

import React, { useState, useCallback } from 'react';
import { DatabaseService, UnifiedMetadata } from '../../services/DatabaseService';

interface Step2MetadataLoaderProps {
  tableName: string;
  columnName: string;
  selectedRecordIds: string[];
  selectedMetadata: string[];
  onMetadataChange: (metadata: string[]) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  debugLog?: (message: string) => void;
}

export default function Step2MetadataLoader({
  tableName,
  columnName,
  selectedRecordIds,
  selectedMetadata,
  onMetadataChange,
  onLoadingStateChange,
  debugLog
}: Step2MetadataLoaderProps) {
  const [availableMetadata, setAvailableMetadata] = useState<UnifiedMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const log = useCallback((message: string) => {
    debugLog?.(message);
  }, [debugLog]);

  const databaseService = new DatabaseService(log);

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

  const renderMetadataSource = () => {
    if (!availableMetadata) return null;

    const { fromMetadata, fromOptionalTags, fromLegacyTags } = availableMetadata;
    
    return (
      <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
        <div className="font-medium mb-1">Metadata Sources Found:</div>
        <div className="space-y-1">
          {fromMetadata.length > 0 && (
            <div>📋 <span className="font-mono">metadata</span> (JSONB): {fromMetadata.length} keys</div>
          )}
          {fromOptionalTags.length > 0 && (
            <div>🏷️ <span className="font-mono">optional_tags</span> (array): {fromOptionalTags.length} items</div>
          )}
          {fromLegacyTags.length > 0 && (
            <div>⚠️ <span className="font-mono">tags</span> (legacy array): {fromLegacyTags.length} items</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded p-3 bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-blue-900">
          🔍 Step 2: Select {columnName === 'metadata' ? 'Metadata Keys' : 'Tags'} from {selectedRecordIds.length} Selected Record(s)
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

      {!availableMetadata && !isLoading && (
        <button
          onClick={loadMetadata}
          disabled={selectedRecordIds.length === 0}
          className="w-full py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🔄 Load {columnName === 'metadata' ? 'Metadata Keys' : 'Tags'} from Selected Records
        </button>
      )}

      {availableMetadata && (
        <div>
          {renderMetadataSource()}
          
          {availableMetadata.combined.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No {columnName === 'metadata' ? 'metadata keys' : 'tags'} found in selected records
            </div>
          ) : (
            <div>
              <div className="text-xs text-blue-800 mb-2">
                Available {columnName === 'metadata' ? 'metadata keys' : 'tags'} from selected records:
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableMetadata.combined.map((value, index) => (
                  <label key={`${value}-${index}`} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedMetadata.includes(value)}
                      onChange={() => handleMetadataToggle(value)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-mono flex-grow">{value}</span>
                    <span 
                      className="text-xs px-1 py-0.5 rounded text-gray-600"
                      title={`Source: ${getSourceLabel(value)}`}
                    >
                      {getSourceIcon(value)}
                    </span>
                  </label>
                ))}
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
                  ✅ {selectedMetadata.length} {columnName === 'metadata' ? 'metadata key(s)' : 'tag(s)'} selected for migration
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}