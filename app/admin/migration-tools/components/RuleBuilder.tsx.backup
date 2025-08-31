'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { MetavalService, ValidationResult } from '../services/MetavalService'
import { DatabaseService } from '../services/DatabaseService'

// ============================================================================
// ULTRA-DESIGNED RULE BUILDER INTERFACE
// Three-Panel Architecture with Advanced Operations
// ============================================================================

interface RuleBuilderProps {
  isOpen: boolean
  sourceSelections: Record<string, {
    recordType: 'word' | 'form' | 'word_translation' | 'form_translation'
    selectedMetadataPaths: Set<string>
    selectedOptionalTags: Set<string>
    allTagsSelected: boolean
  }>
  wordHierarchies: Record<string, {
    word: any
    forms: any[]
    translations: any[]
    formTranslations: any[]
  }>
  onSave: (rule: SerializedRule) => void
  onExecute: (rule: SerializedRule) => void
  onClose: () => void
}

interface SerializedRule {
  id: string
  name: string
  description: string
  target_field: 'metadata' | 'optional_tags' | 'both'
  target_tables: string[]
  source_selections: Record<string, any>
  operations: {
    metadata_operations: Record<string, Record<string, OperationConfig>>
    optional_tag_operations: Record<string, OperationConfig>
    bulk_operations: any[]
    hierarchical_operations: any[]
  }
  execution_metadata: {
    expected_records_affected: number
    risk_level: 'low' | 'medium' | 'high'
    requires_confirmation: boolean
    has_revert_data: boolean
  }
}

interface OperationConfig {
  action: 'keep' | 'update' | 'remove' | 'conditional'
  newValue?: string
  condition?: { ifTagExists: string; ifValue?: string }
  applyTo: 'selected' | 'all_with_tag' | 'hierarchy'
}

// ========================================================================
// METAVAL OPTIONS COMPONENT - Issue #11
// ========================================================================
interface MetadataAttributeOptionsProps {
  metadataKey: string;
  getMetavalOptions: (key: string) => Promise<Array<{value: string, description?: string}>>;
}

const MetadataAttributeOptions: React.FC<MetadataAttributeOptionsProps> = ({ 
  metadataKey, 
  getMetavalOptions 
}) => {
  const [options, setOptions] = useState<Array<{value: string, description?: string}>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true)
      try {
        const opts = await getMetavalOptions(metadataKey)
        setOptions(opts)
      } catch (error) {
        console.error(`Failed to load options for ${metadataKey}:`, error)
        // Fallback to empty array
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [metadataKey, getMetavalOptions])

  if (loading) {
    return <option value="">Loading options...</option>
  }

  if (options.length === 0) {
    return (
      <>
        <option value="no-options-available" disabled>
          No valid options available for {metadataKey}
        </option>
        <option value="custom">Enter custom value...</option>
      </>
    )
  }

  return (
    <>
      {options.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          title={option.description || ''}
        >
          {option.value} {option.description && `(${option.description.slice(0, 30)}...)`}
        </option>
      ))}
    </>
  )
}

export default function RuleBuilder({ 
  isOpen, 
  sourceSelections, 
  wordHierarchies,
  onSave, 
  onExecute, 
  onClose 
}: RuleBuilderProps) {
  // Initialize services
  const [metavalService] = useState(() => new MetavalService())
  const [databaseService] = useState(() => new DatabaseService())
  // ========================================================================
  // STATE MANAGEMENT - Ultra-Sophisticated Rule Building
  // ========================================================================
  const [ruleState, setRuleState] = useState<{
    name: string
    description: string
    target_field: 'metadata' | 'optional_tags' | 'both'
    target_tables: string[]
    metadataOperations: Record<string, Record<string, OperationConfig>>
    optionalTagOperations: Record<string, OperationConfig>
    bulkOperations: any[]
    hierarchicalOperations: any[]
  }>({
    name: '',
    description: '',
    target_field: 'both',
    target_tables: ['dictionary', 'word_forms', 'word_translations', 'form_translations'],
    metadataOperations: {},
    optionalTagOperations: {},
    bulkOperations: [],
    hierarchicalOperations: []
  })

  const [previewState, setPreviewState] = useState<{
    expectedChanges: number
    affectedTables: string[]
    riskLevel: 'low' | 'medium' | 'high'
    warnings: string[]
    conflicts: string[]
  }>({
    expectedChanges: 0,
    affectedTables: [],
    riskLevel: 'low',
    warnings: [],
    conflicts: []
  })

  // METAVAL: Enhanced validation state
  const [metavalState, setMetavalState] = useState<{
    attributeDisplayNames: Record<string, string>
    wordTypeValidation: Record<string, ValidationResult>
    loadingValidation: Set<string>
    constraintErrors: Record<string, string[]>
  }>({
    attributeDisplayNames: {},
    wordTypeValidation: {},
    loadingValidation: new Set(),
    constraintErrors: {}
  })

  // ========================================================================
  // INITIALIZATION - Auto-populate operations from source selections
  // ========================================================================
  useEffect(() => {
    if (Object.keys(sourceSelections).length > 0) {
      const newMetadataOps: Record<string, Record<string, OperationConfig>> = {}
      const newOptionalOps: Record<string, OperationConfig> = {}

      Object.entries(sourceSelections).forEach(([recordId, selection]) => {
        // Initialize metadata operations
        Array.from(selection.selectedMetadataPaths).forEach(metadataKey => {
          if (!newMetadataOps[recordId]) newMetadataOps[recordId] = {}
          newMetadataOps[recordId][metadataKey] = {
            action: 'keep',
            applyTo: 'selected'
          }
        })

        // Initialize optional tag operations
        Array.from(selection.selectedOptionalTags).forEach(tagValue => {
          newOptionalOps[`${recordId}_${tagValue}`] = {
            action: 'keep',
            applyTo: 'selected'
          }
        })
      })

      setRuleState(prev => ({
        ...prev,
        metadataOperations: newMetadataOps,
        optionalTagOperations: newOptionalOps
      }))
      
      // Trigger preview calculation after operations are initialized
      // Note: This will be called again by the useEffect, but ensures initial display
      setTimeout(() => calculatePreview(), 0)
    }
  }, [sourceSelections])

  // ========================================================================
  // METAVAL ENHANCED FUNCTIONALITY
  // ========================================================================
  
  // METAVAL: Load display names for metadata attributes
  useEffect(() => {
    const loadDisplayNames = async () => {
      const uniqueAttributes = new Set<string>()
      
      // Collect all metadata attributes from operations
      Object.values(ruleState.metadataOperations).forEach(operations => {
        Object.keys(operations).forEach(attr => uniqueAttributes.add(attr))
      })
      
      // Load display names for each attribute
      const displayNamePromises = Array.from(uniqueAttributes).map(async (attr) => {
        const displayName = await metavalService.getAttributeDisplayName(attr)
        return { attr, displayName }
      })
      
      const results = await Promise.all(displayNamePromises)
      const displayNames = results.reduce((acc, { attr, displayName }) => {
        acc[attr] = displayName
        return acc
      }, {} as Record<string, string>)
      
      setMetavalState(prev => ({
        ...prev,
        attributeDisplayNames: { ...prev.attributeDisplayNames, ...displayNames }
      }))
    }
    
    if (Object.keys(ruleState.metadataOperations).length > 0) {
      loadDisplayNames()
    }
  }, [ruleState.metadataOperations])

  // METAVAL: Validate operations against word-type constraints
  const validateMetavalConstraints = async (recordId: string, metadataKey: string, newValue?: string) => {
    const validationKey = `${recordId}_${metadataKey}`
    
    setMetavalState(prev => ({
      ...prev,
      loadingValidation: new Set([...Array.from(prev.loadingValidation), validationKey])
    }))
    
    try {
      // Get word type for the record
      const selection = sourceSelections[recordId]
      if (!selection) return
      
      // Determine word type based on record type (simplified logic)
      let wordType = 'noun' // default
      for (const hierarchy of Object.values(wordHierarchies)) {
        if (hierarchy.word.id === recordId && hierarchy.word.word_type) {
          wordType = hierarchy.word.word_type
          break
        }
      }
      
      // Check word-type restrictions
      const restrictions = await metavalService.checkWordTypeRestrictions(metadataKey, wordType)
      
      const errors: string[] = []
      if (!restrictions.isAllowed) {
        errors.push(restrictions.reason || `${metadataKey} not allowed for ${wordType}`)
      }
      
      // Additional validation for new values
      if (newValue && restrictions.isAllowed) {
        const attribute = await metavalService.getAttributeByStableId(metadataKey)
        if (attribute) {
          const values = await metavalService.getValuesForAttribute(attribute.id)
          if (values.length > 0 && !values.some(v => v.value === newValue)) {
            errors.push(`"${newValue}" is not a valid value for ${attribute.display_name}`)
          }
        }
      }
      
      setMetavalState(prev => ({
        ...prev,
        constraintErrors: {
          ...prev.constraintErrors,
          [validationKey]: errors
        }
      }))
      
    } catch (error) {
      console.error('Metaval validation error:', error)
    } finally {
      setMetavalState(prev => ({
        ...prev,
        loadingValidation: new Set(Array.from(prev.loadingValidation).filter(k => k !== validationKey))
      }))
    }
  }

  // METAVAL: Get display name for attribute with fallback
  const getAttributeDisplayName = (attr: string): string => {
    return metavalState.attributeDisplayNames[attr] || attr
  }

  // METAVAL: Check if attribute has validation errors
  const getValidationErrors = (recordId: string, metadataKey: string): string[] => {
    const validationKey = `${recordId}_${metadataKey}`
    return metavalState.constraintErrors[validationKey] || []
  }

  // METAVAL: Check if attribute is being validated
  const isValidating = (recordId: string, metadataKey: string): boolean => {
    const validationKey = `${recordId}_${metadataKey}`
    return metavalState.loadingValidation.has(validationKey)
  }

  // ========================================================================
  // METAVAL SYSTEM INTEGRATION - Issue #11
  // ========================================================================
  const [metavalOptions, setMetavalOptions] = useState<Record<string, Array<{value: string, description?: string}>>>({})
  const [loadingOptions, setLoadingOptions] = useState<Set<string>>(new Set())

  /**
   * Fetch valid options for a metadata attribute from metaval database
   * Caches results to avoid repeated database calls
   */
  const getMetavalOptions = async (metadataKey: string): Promise<Array<{value: string, description?: string}>> => {
    // Return cached options if available
    if (metavalOptions[metadataKey]) {
      return metavalOptions[metadataKey]
    }

    // Avoid duplicate requests
    if (loadingOptions.has(metadataKey)) {
      return []
    }

    setLoadingOptions(prev => {
      const newSet = new Set(prev)
      newSet.add(metadataKey)
      return newSet
    })

    try {
      const values = await metavalService.getValuesByStableId(metadataKey)
      const options = values.map(value => ({
        value: value.value,
        description: value.description
      }))
      setMetavalOptions(prev => ({
        ...prev,
        [metadataKey]: options
      }))
      return options
    } catch (error) {
      console.error(`Failed to load options for ${metadataKey}:`, error)
      return []
    } finally {
      setLoadingOptions(prev => {
        const newSet = new Set(prev)
        newSet.delete(metadataKey)
        return newSet
      })
    }
  }

  /**
   * Legacy function maintained for compatibility
   * Now uses database-driven metaval system
   */
  const getCoreTagOptions = (metadataKey: string): string[] => {
    const options = metavalOptions[metadataKey] || []
    return options.map(opt => opt.value)
  }

  // ========================================================================
  // UTILITY FUNCTIONS - Record Display Names
  // ========================================================================
  const getRecordDisplayName = (recordId: string, recordType: string): { displayName: string, recordTypeName: string } => {
    let displayName = `Record ${recordId.slice(-8)}`
    let recordTypeName = recordType.replace('_', ' ')
    
    // Look up the actual record content from wordHierarchies
    for (const hierarchy of Object.values(wordHierarchies)) {
      // Check if it's the main word
      if (hierarchy.word.id === recordId) {
        displayName = hierarchy.word.italian || `Word ${recordId.slice(-8)}`
        recordTypeName = 'word'
        break
      }
      
      // Check if it's a form
      const form = hierarchy.forms.find(f => f.id === recordId)
      if (form) {
        displayName = form.form_text || `Form ${recordId.slice(-8)}`
        recordTypeName = 'form'
        break
      }
      
      // Check if it's a word translation
      const translation = hierarchy.translations.find(t => t.id === recordId)
      if (translation) {
        displayName = translation.translation || translation.english || `Translation ${recordId.slice(-8)}`
        recordTypeName = 'word translation'
        break
      }
      
      // Check if it's a form translation
      const formTranslation = hierarchy.formTranslations.find(ft => ft.id === recordId)
      if (formTranslation) {
        displayName = formTranslation.translation || `Form Translation ${recordId.slice(-8)}`
        recordTypeName = 'form translation'
        break
      }
    }
    
    return { displayName, recordTypeName }
  }

  // ========================================================================
  // OPERATION HANDLERS - Advanced Rule Configuration
  // ========================================================================
  const updateMetadataOperation = (recordId: string, metadataKey: string, config: Partial<OperationConfig>) => {
    setRuleState(prev => ({
      ...prev,
      metadataOperations: {
        ...prev.metadataOperations,
        [recordId]: {
          ...prev.metadataOperations[recordId],
          [metadataKey]: { ...prev.metadataOperations[recordId]?.[metadataKey], ...config }
        }
      }
    }))
    
    // METAVAL: Trigger validation when operation changes
    if (config.action === 'update' && config.newValue) {
      validateMetavalConstraints(recordId, metadataKey, config.newValue)
    } else {
      validateMetavalConstraints(recordId, metadataKey)
    }
  }

  const updateOptionalTagOperation = (tagKey: string, config: Partial<OperationConfig>) => {
    setRuleState(prev => ({
      ...prev,
      optionalTagOperations: {
        ...prev.optionalTagOperations,
        [tagKey]: { ...prev.optionalTagOperations[tagKey], ...config }
      }
    }))
  }

  const calculatePreview = () => {
    // Calculate actual operations with scope analysis
    let totalOperations = 0
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    const warnings: string[] = []
    const affectedTables = new Set<string>()
    let estimatedRecords = 0

    // Calculate operations with scope analysis

    // Analyze metadata operations
    Object.entries(ruleState.metadataOperations).forEach(([recordId, operations]) => {
      Object.entries(operations).forEach(([metadataKey, config]) => {
        totalOperations++
        
        // Add to affected tables based on record type
        const selection = sourceSelections[recordId]
        if (selection) {
          switch (selection.recordType) {
            case 'word': affectedTables.add('dictionary'); break
            case 'form': affectedTables.add('word_forms'); break
            case 'word_translation': affectedTables.add('word_translations'); break
            case 'form_translation': affectedTables.add('form_translations'); break
          }
        }

        // Risk assessment based on operation type and scope
        if (config.action === 'remove') {
          riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
          if (config.applyTo === 'all_with_tag') {
            riskLevel = 'high'
            warnings.push(`High-risk: Removing ${metadataKey} from ALL records with this tag`)
            estimatedRecords += 50 // Estimate for "all with tag" operations
          } else if (config.applyTo === 'hierarchy') {
            riskLevel = 'high'
            warnings.push(`High-risk: Removing ${metadataKey} from entire hierarchy`)
            estimatedRecords += 10 // Estimate for hierarchy operations
          } else {
            estimatedRecords += 1 // Single record
          }
        } else if (config.action === 'update') {
          if (config.applyTo === 'all_with_tag') {
            riskLevel = riskLevel === 'low' ? 'medium' : 'high'
            warnings.push(`Medium-risk: Updating ${metadataKey} across multiple records`)
            estimatedRecords += 25
          } else {
            estimatedRecords += 1
          }
        } else {
          estimatedRecords += 1
        }
      })
    })

    // Analyze optional tag operations  
    Object.entries(ruleState.optionalTagOperations).forEach(([tagKey, config]) => {
      totalOperations++
      
      if (config.action === 'remove' && config.applyTo === 'all_with_tag') {
        riskLevel = 'high'
        warnings.push(`High-risk: Removing optional tag from ALL records`)
        estimatedRecords += 30
      } else if (config.applyTo === 'hierarchy') {
        riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
        estimatedRecords += 5
      } else {
        estimatedRecords += 1
      }
    })

    // Overall risk assessment
    if (totalOperations > 20) {
      riskLevel = 'high'
      warnings.push('Large number of operations - consider batch processing')
    } else if (totalOperations > 8) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
    }

    const newPreviewState = {
      expectedChanges: estimatedRecords,
      affectedTables: Array.from(affectedTables),
      riskLevel,
      warnings,
      conflicts: []
    }

    setPreviewState(newPreviewState)
  };

  // Calculate preview when any operation settings change
  useEffect(() => {
    calculatePreview()
  }, [
    ruleState.metadataOperations, 
    ruleState.optionalTagOperations, 
    ruleState.target_field,
    sourceSelections
  ])

  // ========================================================================
  // RULE SERIALIZATION & EXECUTION
  // ========================================================================
  const buildSerializedRule = (): SerializedRule => {
    return {
      id: `rule_${Date.now()}`,
      name: ruleState.name || `Rule for ${Object.keys(sourceSelections).length} selections`,
      description: ruleState.description || 'Generated from hierarchical search selections',
      target_field: ruleState.target_field,
      target_tables: ruleState.target_tables,
      source_selections: sourceSelections,
      operations: {
        metadata_operations: ruleState.metadataOperations,
        optional_tag_operations: ruleState.optionalTagOperations,
        bulk_operations: ruleState.bulkOperations,
        hierarchical_operations: ruleState.hierarchicalOperations
      },
      execution_metadata: {
        expected_records_affected: previewState.expectedChanges,
        risk_level: previewState.riskLevel,
        requires_confirmation: previewState.riskLevel !== 'low',
        has_revert_data: true
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div>
      <p>Test component works!</p>
    </div>
  )
}
