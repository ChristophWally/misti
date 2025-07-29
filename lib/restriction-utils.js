// lib/restriction-utils.js
// Utility functions for parsing and displaying translation restrictions
// Story 10.5: Translation Context Indicators

/**
 * Parse context metadata to extract hard restrictions that need visual indicators
 * @param {Object} contextMetadata - The context_metadata JSONB field from word_translations
 * @returns {Array} Array of restriction objects with symbol and description
 */
export function parseRestrictions(contextMetadata) {
  if (!contextMetadata || typeof contextMetadata !== 'object') {
    return []
  }

  const restrictions = []

  // Gender restrictions (HARD restrictions only)
  if (contextMetadata.gender_usage === 'male-only') {
    restrictions.push({
      type: 'gender',
      subtype: 'male',
      symbol: '♂',
      description: 'Use only with masculine subjects',
      severity: 'hard'
    })
  } else if (contextMetadata.gender_usage === 'female-only') {
    restrictions.push({
      type: 'gender',
      subtype: 'female',
      symbol: '♀',
      description: 'Use only with feminine subjects',
      severity: 'hard'
    })
  }
  // Note: 'female-preferred' is NOT a hard restriction, so no indicator

  // Plurality restrictions (HARD restrictions only)
  if (contextMetadata.plurality === 'plural-only') {
    restrictions.push({
      type: 'plurality',
      symbol: '👥',
      description: 'Use only with plural subjects',
      severity: 'hard'
    })
  } else if (contextMetadata.plurality === 'singular-only') {
    restrictions.push({
      type: 'plurality',
      symbol: '👤',
      description: 'Use only with singular subjects',
      severity: 'hard'
    })
  }

  // Register restrictions (if we want to show formal restrictions)
  // Currently commented out - uncomment if you want formal indicators
  /*
  if (contextMetadata.register === 'formal') {
    restrictions.push({
      type: 'register',
      symbol: '👔',
      description: 'Formal contexts only',
      severity: 'soft'
    })
  }
  */

  return restrictions
}

/**
 * Get restriction symbols as a simple array of strings
 * @param {Object} contextMetadata - The context_metadata JSONB field
 * @returns {Array} Array of Unicode symbol strings
 */
export function getRestrictionSymbols(contextMetadata) {
  const restrictions = parseRestrictions(contextMetadata)
  return restrictions.map((r) => r.symbol)
}

/**
 * Check if a translation has any hard restrictions
 * @param {Object} contextMetadata - The context_metadata JSONB field
 * @returns {boolean} True if translation has restrictions requiring indicators
 */
export function hasRestrictions(contextMetadata) {
  const restrictions = parseRestrictions(contextMetadata)
  return restrictions.length > 0
}

/**
 * Get a readable description of all restrictions for a translation
 * @param {Object} contextMetadata - The context_metadata JSONB field
 * @returns {string} Human-readable restriction summary
 */
export function getRestrictionDescription(contextMetadata) {
  const restrictions = parseRestrictions(contextMetadata)

  if (restrictions.length === 0) {
    return 'No usage restrictions'
  }

  const descriptions = restrictions.map((r) => r.description)
  return descriptions.join(', ')
}

/**
 * Render restriction indicators as React/HTML elements
 * For use in React components - returns JSX-compatible structure
 * @param {Object} contextMetadata - The context_metadata JSONB field
 * @param {string} className - Optional CSS class for styling
 * @returns {Array} Array of restriction indicator objects for rendering
 */
export function renderRestrictionIndicators(contextMetadata, className = 'restriction-symbol') {
  const restrictions = parseRestrictions(contextMetadata)

  return restrictions.map((restriction, index) => {
    const subtypeClass = restriction.subtype
      ? ` restriction-${restriction.type}-${restriction.subtype}`
      : ''
    return {
      key: `${restriction.type}-${index}`,
      symbol: restriction.symbol,
      description: restriction.description,
      type: restriction.type,
      className: `${className} restriction-${restriction.type}${subtypeClass}`,
      title: restriction.description
    }
  })
}

/**
 * Check if a specific restriction type exists
 * @param {Object} contextMetadata - The context_metadata JSONB field
 * @param {string} restrictionType - Type to check ('gender', 'plurality', 'register')
 * @returns {boolean} True if restriction type exists
 */
export function hasRestrictionType(contextMetadata, restrictionType) {
  const restrictions = parseRestrictions(contextMetadata)
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
