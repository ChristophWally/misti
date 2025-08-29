'use client';

import { useState, useEffect } from 'react';
import { DisplayNameService, useDisplayNames } from '../utils/DisplayNameUtils';

/**
 * Optimized CoreTagDisplay component that uses centralized DisplayNameService
 * Handles both attribute names and value names for complete tag display
 */
export function CoreTagDisplay({ attributeName, value }: { 
  attributeName: string; 
  value: string; 
}) {
  const [displayText, setDisplayText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDisplayNames = async () => {
      setIsLoading(true);
      try {
        const displayService = DisplayNameService.getInstance();
        
        // Check if value looks like a stable ID (metaattrXXXvalYYY)
        if (value.match(/^metaattr\d+val\d+$/)) {
          const attrRes = await displayService.getAttributeDisplayName(attributeName);
          const valRes = await displayService.getValueDisplayName(value);
          setDisplayText(`${attrRes.resolved ? attrRes.displayName : `${attrRes.displayName} (ID)`}: ${valRes.resolved ? valRes.displayName : `${valRes.displayName} (ID)`}`);
          if (!attrRes.resolved || !valRes.resolved) {
            console.warn('CoreTagDisplay: Falling back to stable IDs', attributeName, value);
          }
        } else if (attributeName.startsWith('metaattr')) {
          const attrRes = await displayService.getAttributeDisplayName(attributeName);
          setDisplayText(`${attrRes.resolved ? attrRes.displayName : `${attrRes.displayName} (ID)`}: ${value}`);
          if (!attrRes.resolved) {
            console.warn('CoreTagDisplay: Falling back to attribute ID', attributeName);
          }
        } else {
          // Neither are stable IDs, format the attribute name and use value as-is
          const formattedAttrName = attributeName.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          setDisplayText(`${formattedAttrName}: ${value}`);
        }
      } catch (error) {
        console.warn('CoreTagDisplay: Failed to load display names:', error);
        // Fallback to formatted display
        const formattedAttrName = attributeName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        setDisplayText(`${formattedAttrName}: ${value}`);
      }
      setIsLoading(false);
    };

    loadDisplayNames();
  }, [attributeName, value]);

  if (isLoading) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
        Loading...
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
      {displayText}
    </span>
  );
}

/**
 * ValueTagDisplay component specifically for handling value stable IDs
 * Optimized for displaying just values with their display names
 */
export function ValueTagDisplay({ valueStableId }: { valueStableId: string }) {
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const displayService = DisplayNameService.getInstance();

  useEffect(() => {
    const loadValueDisplayName = async () => {
      setIsLoading(true);
      try {
        const res = await displayService.getValueDisplayName(valueStableId);
        setDisplayName(res.resolved ? res.displayName : `${res.displayName} (ID)`);
        if (!res.resolved) {
          console.warn('ValueTagDisplay: Falling back to stable ID', valueStableId);
        }
      } catch (error) {
        console.warn('ValueTagDisplay: Failed to load value display name:', error);
        setDisplayName(valueStableId); // Fallback to stable ID
      }
      setIsLoading(false);
    };

    loadValueDisplayName();
  }, [valueStableId]);

  if (isLoading) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
        Loading...
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
      {displayName}
    </span>
  );
}

/**
 * OptionalTagDisplay component for optional tags with optional enhancement
 */
export function OptionalTagDisplay({ tag }: { tag: string }) {
  const [displayName, setDisplayName] = useState<string>(tag);
  const [isLoading, setIsLoading] = useState(false);
  const displayService = DisplayNameService.getInstance();

  useEffect(() => {
    // Only try to enhance if it looks like a value stable ID
    if (tag.match(/^metaattr\d+val\d+$/)) {
      setIsLoading(true);
      const loadDisplayName = async () => {
        try {
          const res = await displayService.getValueDisplayName(tag);
          setDisplayName(res.resolved ? res.displayName : `${res.displayName} (ID)`);
          if (!res.resolved) {
            console.warn('OptionalTagDisplay: Falling back to stable ID', tag);
          }
        } catch (error) {
          console.warn('OptionalTagDisplay: Failed to enhance tag name:', error);
          // Keep original tag name
        }
        setIsLoading(false);
      };
      loadDisplayName();
    }
  }, [tag]);

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
      {isLoading ? 'Loading...' : displayName}
    </span>
  );
}

/**
 * AttributeNameDisplay component for showing just attribute display names
 * Useful for headers and labels
 */
export function AttributeNameDisplay({ 
  stableId, 
  fallback, 
  className = "font-medium text-gray-700" 
}: { 
  stableId: string; 
  fallback?: string;
  className?: string;
}) {
  const [displayName, setDisplayName] = useState<string>(fallback || stableId);
  const [isLoading, setIsLoading] = useState(true);
  const { getAttributeDisplayName } = useDisplayNames();

  useEffect(() => {
    const loadDisplayName = async () => {
      setIsLoading(true);
      try {
        const res = await getAttributeDisplayName(stableId);
        setDisplayName(res.resolved ? res.displayName : `${res.displayName} (ID)`);
        if (!res.resolved) {
          console.warn('AttributeNameDisplay: Falling back to stable ID', stableId);
        }
      } catch (error) {
        console.warn('AttributeNameDisplay: Failed to load display name:', error);
        // Keep fallback or stable ID
      }
      setIsLoading(false);
    };

    loadDisplayName();
  }, [stableId, getAttributeDisplayName]);

  return (
    <span className={className}>
      {isLoading ? (fallback || stableId) : displayName}
      {displayName !== stableId && (
        <span className="text-gray-500 ml-1 font-normal text-xs">({stableId})</span>
      )}
    </span>
  );
}

/**
 * BatchTagDisplay component for efficiently displaying multiple tags
 * Handles batch loading for better performance
 */
export function BatchTagDisplay({ 
  tags 
}: { 
  tags: Array<{ attributeName: string; value: string; key: string }>;
}) {
  const [displayTags, setDisplayTags] = useState<Array<{ key: string; displayText: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { batchGetAttributeDisplayNames, batchGetValueDisplayNames } = useDisplayNames();

  useEffect(() => {
    const loadBatchDisplayNames = async () => {
      setIsLoading(true);
      try {
        // Separate attribute and value stable IDs
        const attributeIds = tags
          .map(tag => tag.attributeName)
          .filter(id => id.startsWith('metaattr'));
        
        const valueIds = tags
          .map(tag => tag.value)
          .filter(value => value.match(/^metaattr\d+val\d+$/));

        // Batch load display names
        const [attributeNames, valueNames] = await Promise.all([
          attributeIds.length > 0 ? batchGetAttributeDisplayNames(attributeIds) : new Map(),
          valueIds.length > 0 ? batchGetValueDisplayNames(valueIds) : new Map()
        ]);

        // Build display tags
        const displayTagsResult = tags.map(tag => {
          const attrDisplayName = attributeNames.get(tag.attributeName) || 
            (tag.attributeName.startsWith('metaattr') ? tag.attributeName : 
             tag.attributeName.split('_').map(word => 
               word.charAt(0).toUpperCase() + word.slice(1)
             ).join(' '));
          
          const valueDisplayName = valueNames.get(tag.value) || tag.value;
          
          return {
            key: tag.key,
            displayText: `${attrDisplayName}: ${valueDisplayName}`
          };
        });

        setDisplayTags(displayTagsResult);
      } catch (error) {
        console.warn('BatchTagDisplay: Failed to load batch display names:', error);
        // Fallback to formatted names
        const fallbackTags = tags.map(tag => ({
          key: tag.key,
          displayText: `${tag.attributeName}: ${tag.value}`
        }));
        setDisplayTags(fallbackTags);
      }
      setIsLoading(false);
    };

    if (tags.length > 0) {
      loadBatchDisplayNames();
    } else {
      setDisplayTags([]);
      setIsLoading(false);
    }
  }, [tags, batchGetAttributeDisplayNames, batchGetValueDisplayNames]);

  if (isLoading) {
    return (
      <div className="inline-flex flex-wrap gap-1">
        {tags.map(tag => (
          <span key={tag.key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
            Loading...
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-wrap gap-1">
      {displayTags.map(tag => (
        <span key={tag.key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
          {tag.displayText}
        </span>
      ))}
    </div>
  );
}