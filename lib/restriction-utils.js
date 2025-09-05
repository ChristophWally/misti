// lib/restriction-utils.js
// Utility functions for parsing and displaying translation restrictions
// Story 10.5: Translation Context Indicators - Updated for UUID-based system

import { ATTRIBUTES, VALUES, hasAttributeValue } from './meta-constants'

/**
 * Parse RPC core tags to extract hard restrictions that need visual indicators
 * Uses normalized attribute and value UUIDs directly from RPC
 * @param {Array} coreTags - Array of tag objects from RPC with attribute_id and value_id (UUIDs)
 * @returns {Array} Array of restriction objects with symbol and description
 */
export function parseRestrictions(coreTags) {
  if (!Array.isArray(coreTags)) {
    return []
  }

  const restrictions = []

  // Check each core tag for restriction patterns using UUIDs
  for (const tag of coreTags) {
    // Gender Usage restrictions
    if (hasAttributeValue(tag, ATTRIBUTES.GENDER_USAGE, VALUES.GENDER_MALE_ONLY)) {
      restrictions.push({
        type: 'gender',
        subtype: 'male',
        symbol: '♂',
        description: 'Use only with masculine subjects',
        severity: 'hard'
      })
    } else if (hasAttributeValue(tag, ATTRIBUTES.GENDER_USAGE, VALUES.GENDER_FEMALE_ONLY)) {
      restrictions.push({
        type: 'gender',
        subtype: 'female',
        symbol: '♀',
        description: 'Use only with feminine subjects',
        severity: 'hard'
      })
    }

    // Number/Plurality restrictions
    // Note: Need to get actual UUIDs for these restriction values
    if (tag.attribute_id === ATTRIBUTES.NUMBER_RESTRICTION) {
      // These UUIDs need to be updated with actual values from database
      if (tag.value_label && tag.value_label.includes('plural')) {
        restrictions.push({
          type: 'plurality',
          symbol: '👥',
          description: 'Use only with plural subjects',
          severity: 'hard'
        })
      } else if (tag.value_label && tag.value_label.includes('singular')) {
        restrictions.push({
          type: 'plurality',
          symbol: '👤',
          description: 'Use only with singular subjects',
          severity: 'hard'
        })
      }
    }

    // Plural Only attribute
    if (tag.attribute_id === ATTRIBUTES.PLURAL_ONLY) {
      restrictions.push({
        type: 'plurality',
        symbol: '👥',
        description: 'Use only with plural subjects',
        severity: 'hard'
      })
    }
  }

  return restrictions
}

/**
 * Get restriction symbols as a simple array of strings
 * @param {Array} coreTags - Array of tag objects from RPC
 * @returns {Array} Array of Unicode symbol strings
 */
export function getRestrictionSymbols(coreTags) {
  const restrictions = parseRestrictions(coreTags)
  return restrictions.map((r) => r.symbol)
}

/**
 * Check if a translation has any hard restrictions
 * @param {Array} coreTags - Array of tag objects from RPC
 * @returns {boolean} True if translation has restrictions requiring indicators
 */
export function hasRestrictions(coreTags) {
  const restrictions = parseRestrictions(coreTags)
  return restrictions.length > 0
}

/**
 * Get a readable description of all restrictions for a translation
 * @param {Array} coreTags - Array of tag objects from RPC
 * @returns {string} Human-readable restriction summary
 */
export function getRestrictionDescription(coreTags) {
  const restrictions = parseRestrictions(coreTags)

  if (restrictions.length === 0) {
    return 'No usage restrictions'
  }

  const descriptions = restrictions.map((r) => r.description)
  return descriptions.join(', ')
}

/**
 * Render restriction indicators as React/HTML elements
 * For use in React components - returns JSX-compatible structure
 * @param {Array} coreTags - Array of tag objects from RPC
 * @param {string} className - Optional CSS class for styling
 * @returns {Array} Array of restriction indicator objects for rendering
 */
export function renderRestrictionIndicators(coreTags, className = 'restriction-symbol') {
  const restrictions = parseRestrictions(coreTags)

  return restrictions.map((restriction, index) => {
    const subtypeClass = restriction.subtype
      ? ` restriction-${restriction.type}-${restriction.subtype}`
      : ''
    return {
      key: `${restriction.type}-${index}`,
      symbol: restriction.symbol,
      description: restriction.description,
      type: restriction.type,
      subtype: restriction.subtype,
      className: `${className} restriction-${restriction.type}${subtypeClass}`,
      title: restriction.description
    }
  })
}

/**
 * Check if a specific restriction type exists
 * @param {Array} coreTags - Array of tag objects from RPC
 * @param {string} restrictionType - Type to check ('gender', 'plurality', 'register')
 * @returns {boolean} True if restriction type exists
 */
export function hasRestrictionType(coreTags, restrictionType) {
  const restrictions = parseRestrictions(coreTags)
  return restrictions.some((r) => r.type === restrictionType)
}

/**
 * CSS classes for styling restriction symbols
 * Import this into your globals.css or component styles
 */
export const restrictionStyles = `
  /* Restriction symbol styling */
  .restriction-symbol {
    font-size: 14px;
    color: #6b7280;
    margin-left: 6px;
    font-weight: 500;
    cursor: help;
    transition: color 0.2s ease;
  }

  .restriction-symbol:hover {
    color: #374151;
  }

  /* Specific restriction type styling */
  .restriction-gender {
    font-weight: bold;
  }

  .restriction-gender-male {
    color: #3b82f6;
  }

  .restriction-gender-female {
    color: #ec4899;
  }

  .restriction-gender-male:hover {
    color: #1d4ed8;
  }

  .restriction-gender-female:hover {
    color: #be185d;
  }

  .restriction-plurality {
    color: #059669;
  }

  .restriction-register {
    color: #dc2626;
  }

  /* Different contexts */
  .restriction-symbol-dropdown {
    font-size: 12px;
    margin-left: 4px;
  }

  .restriction-symbol-card {
    font-size: 14px;
    margin-left: 8px;
  }
`

// Example usage patterns for documentation:
/*

// Basic usage in a component:
import { parseRestrictions, getRestrictionSymbols } from './restriction-utils'

const translation = {
  translation: 'handsome',
  context_metadata: {
    gender_usage: 'male-only',
    register: 'neutral'
  }
}

const restrictions = parseRestrictions(translation.context_metadata)
// Returns: [{ type: 'gender', symbol: '♂', description: 'Use only with masculine subjects', severity: 'hard' }]

const symbols = getRestrictionSymbols(translation.context_metadata)
// Returns: ['♂']

// In React component:
const indicators = renderRestrictionIndicators(translation.context_metadata)
return (
  <div>
    {translation.translation}
    {indicators.map(indicator => (
      <span
        key={indicator.key}
        className={indicator.className}
        title={indicator.title}
      >
        {indicator.symbol}
      </span>
    ))}
  </div>
)

*/
