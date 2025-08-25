'use client'

import { useState, useEffect } from 'react'

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

    setLoadingOptions(prev => new Set([...prev, metadataKey]))

    try {
      const options = await databaseService.getMetadataAttributeOptions(metadataKey)
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
  }

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
  const buildSerializedRule = (): SerializedRule => ({
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
  })

  if (!isOpen) return null

  // ========================================================================
  // ULTRA-DESIGNED TWO-PANEL + BOTTOM INTERFACE
  // Left: Source Context (25%) | Right: Operations Builder (75%)
  // Bottom: Preview & Validation + Action Buttons
  // ========================================================================
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">🔧 Modern Rule Builder</h2>
            <p className="text-gray-600">Create sophisticated migration rules from your selections</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Two-Panel Interface + Bottom Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Section: Two-Panel Layout */}
          <div className="flex-1 flex overflow-hidden">
          
            {/* ================================================= */}
            {/* PANEL 1: SOURCE CONTEXT (Left - 25%) */}
            {/* ================================================= */}
            <div className="w-1/4 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                📋 Source Context
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {Object.keys(sourceSelections).length} records
                </span>
              </h3>
              
              <div className="space-y-3">
                {Object.entries(sourceSelections).map(([recordId, selection]) => {
                  const { displayName, recordTypeName } = getRecordDisplayName(recordId, selection.recordType)
                  return (
                  <div key={recordId} className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {recordTypeName} #{recordId.slice(-8)}
                    </div>
                    
                    {/* Metadata Tags */}
                    {selection.selectedMetadataPaths.size > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-600 mb-1">📋 Metadata:</div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(selection.selectedMetadataPaths).map(key => {
                            // Look up the actual value from the record data
                            let value = key // fallback to just key
                            for (const hierarchy of Object.values(wordHierarchies)) {
                              let record = null
                              if (hierarchy.word.id === recordId) record = hierarchy.word
                              else record = [...hierarchy.forms, ...hierarchy.translations, ...hierarchy.formTranslations]
                                .find(r => r.id === recordId)
                              
                              if (record && record.metadata && record.metadata[key]) {
                                value = `${key}: ${record.metadata[key]}`
                                break
                              }
                            }
                            
                            return (
                              <span key={key} className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                                {value}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Optional Tags */}
                    {selection.selectedOptionalTags.size > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">🏷️ Optional Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(selection.selectedOptionalTags).map(tag => (
                            <span key={tag} className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          </div>

            {/* ================================================= */}
            {/* PANEL 2: OPERATIONS BUILDER (Right - 75%) */}
            {/* ================================================= */}
            <div className="w-3/4 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                ⚙️ Operations Builder
              </h3>

              {/* Rule Basic Info */}
              <div className="bg-gray-50 p-4 rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rule Name</label>
                    <input
                      type="text"
                      value={ruleState.name}
                      onChange={(e) => setRuleState(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Auto-generated from selections"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Field</label>
                    <select
                      value={ruleState.target_field}
                      onChange={(e) => setRuleState(prev => ({ ...prev, target_field: e.target.value as any }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="metadata">📋 Metadata (JSONB)</option>
                      <option value="optional_tags">🏷️ Optional Tags (Array)</option>
                      <option value="both">Both Fields</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={ruleState.description}
                    onChange={(e) => setRuleState(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm h-20 resize-none"
                    placeholder="Describe what this rule does..."
                  />
                </div>
              </div>

              {/* Operations Grouped By Record */}
              <div className="space-y-4">
                <h4 className="font-medium">Operations by Record</h4>
                
                {/* Group operations by record */}
                {(() => {
                  // Create a map to group all operations by recordId
                  const recordOperationsMap: Record<string, {
                    metadataOps: Array<[string, OperationConfig]>
                    optionalOps: Array<[string, OperationConfig]>
                  }> = {}
                  
                  // Group metadata operations by record
                  Object.entries(ruleState.metadataOperations).forEach(([recordId, operations]) => {
                    if (!recordOperationsMap[recordId]) {
                      recordOperationsMap[recordId] = { metadataOps: [], optionalOps: [] }
                    }
                    recordOperationsMap[recordId].metadataOps = Object.entries(operations)
                  })
                  
                  // Group optional tag operations by record
                  Object.entries(ruleState.optionalTagOperations).forEach(([tagKey, config]) => {
                    const recordId = tagKey.split('_')[0] // Extract recordId from tagKey format
                    if (!recordOperationsMap[recordId]) {
                      recordOperationsMap[recordId] = { metadataOps: [], optionalOps: [] }
                    }
                    recordOperationsMap[recordId].optionalOps.push([tagKey, config])
                  })
                  
                  // Render grouped operations
                  return Object.entries(recordOperationsMap).map(([recordId, operations]) => {
                    const { displayName, recordTypeName } = getRecordDisplayName(recordId, sourceSelections[recordId]?.recordType || 'unknown')
                    const totalOps = operations.metadataOps.length + operations.optionalOps.length
                    
                    return (
                    <div key={recordId} className="border rounded-lg p-4 bg-white shadow-sm">
                      {/* Record Header */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                        <div>
                          <div className="text-base font-semibold text-gray-800">
                            {displayName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {recordTypeName} #{recordId.slice(-8)}
                          </div>
                        </div>
                        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {totalOps} operations
                        </div>
                      </div>
                      
                      {/* Metadata Operations for this record */}
                      {operations.metadataOps.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2 text-blue-700">📋 Core Tags</div>
                          {operations.metadataOps.map(([metadataKey, config]) => {                            
                            return (
                            <div key={metadataKey} className="flex items-center space-x-3 mb-2 ml-4">
                              {/* Column 1: Grouping/Attribute - Fixed Width */}
                              <div className="text-xs w-24">
                                <div className="text-gray-500 text-[10px] mb-1">Grouping</div>
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs block w-full truncate">
                                  {metadataKey}
                                </span>
                              </div>
                              
                              {/* Column 2: Current Value - Fixed Width */}
                              <div className="text-xs w-20">
                                <div className="text-gray-500 text-[10px] mb-1">Current</div>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs block w-full truncate">
                                {(() => {
                                  // Extract just the current value from the record data
                                  for (const hierarchy of Object.values(wordHierarchies)) {
                                    let record = null
                                    if (hierarchy.word.id === recordId) record = hierarchy.word
                                    else record = [...hierarchy.forms, ...hierarchy.translations, ...hierarchy.formTranslations]
                                      .find(r => r.id === recordId)
                                    
                                    if (record && record.metadata && record.metadata[metadataKey]) {
                                      return record.metadata[metadataKey]
                                    }
                                  }
                                  return 'unknown'
                                })()}
                                </span>
                              </div>
                              
                              {/* Column 3: Action - Fixed Width */}
                              <div className="text-xs w-20">
                                <div className="text-gray-500 text-[10px] mb-1">Action</div>
                                <select
                                value={config.action}
                                onChange={(e) => updateMetadataOperation(recordId, metadataKey, { action: e.target.value as any })}
                                className="border rounded px-2 py-1 text-xs w-full"
                              >
                                <option value="keep">Keep</option>
                                <option value="update">Update</option>
                                <option value="remove">Remove</option>
                                <option value="conditional">Conditional</option>
                                </select>
                              </div>
                              
                              {/* Column 4: New Value (when updating) - Fixed Width */}
                              {config.action === 'update' && (
                                <div className="text-xs w-28">
                                  <div className="text-gray-500 text-[10px] mb-1">New Value</div>
                                <select
                                  value={config.newValue || ''}
                                  onChange={(e) => updateMetadataOperation(recordId, metadataKey, { newValue: e.target.value })}
                                  className="border rounded px-2 py-1 text-xs w-full"
                                >
                                  <option value="">Select new value...</option>
                                  <MetadataAttributeOptions 
                                    metadataKey={metadataKey}
                                    getMetavalOptions={getMetavalOptions}
                                  />
                                  </select>
                                </div>
                              )}
                              
                              {/* Column 5: Apply To - Fixed Width */}
                              <div className="text-xs w-24">
                                <div className="text-gray-500 text-[10px] mb-1">Apply To</div>
                                <select
                                value={config.applyTo}
                                onChange={(e) => updateMetadataOperation(recordId, metadataKey, { applyTo: e.target.value as any })}
                                className="border rounded px-2 py-1 text-xs w-full"
                              >
                                <option value="selected">Selected Only</option>
                                <option value="all_with_tag">All with Tag</option>
                                <option value="hierarchy">Whole Hierarchy</option>
                                </select>
                              </div>
                            </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {/* Optional Tag Operations for this record */}
                      {operations.optionalOps.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2 text-green-700">🏷️ Optional Tags</div>
                          {operations.optionalOps.map(([tagKey, config]) => {
                            const tagValue = tagKey.split('_').slice(1).join('_')
                            
                            return (
                            <div key={tagKey} className="flex items-center space-x-3 mb-2 ml-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs min-w-[120px]">
                                {tagValue}
                              </span>
                              
                              <select
                                value={config.action}
                                onChange={(e) => updateOptionalTagOperation(tagKey, { action: e.target.value as any })}
                                className="border rounded px-2 py-1 text-xs"
                              >
                                <option value="keep">Keep</option>
                                <option value="remove">Remove</option>
                                <option value="update">Replace</option>
                                <option value="conditional">Conditional</option>
                              </select>
                              
                              {config.action === 'update' && (
                                <input
                                  type="text"
                                  value={config.newValue || ''}
                                  onChange={(e) => updateOptionalTagOperation(tagKey, { newValue: e.target.value })}
                                  className="border rounded px-2 py-1 text-xs flex-1"
                                  placeholder="Replacement value"
                                />
                              )}
                              
                              <select
                                value={config.applyTo}
                                onChange={(e) => updateOptionalTagOperation(tagKey, { applyTo: e.target.value as any })}
                                className="border rounded px-2 py-1 text-xs"
                              >
                                <option value="selected">Selected Only</option>
                                <option value="all_with_tag">All with Tag</option>
                                <option value="hierarchy">Whole Hierarchy</option>
                              </select>
                            </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    )
                  })
                })()}
              </div>

              {/* Quick Operation Shortcuts */}
              <div className="mt-6 p-4 bg-yellow-50 rounded">
                <div className="font-medium mb-2">⚡ Quick Operations</div>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                    Standardize All Person Tags
                  </button>
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                    Clean Empty Values
                  </button>
                  <button className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600">
                    Sync to Child Records
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          {/* Bottom Section: Preview & Validation + Action Buttons */}
          <div className="border-t bg-gray-50 p-4 flex justify-between items-end">
            
            {/* Left: Preview & Validation */}
            <div className="flex-1 mr-6">
              <h3 className="font-semibold mb-3 text-sm">🔍 Preview & Validation</h3>
              
              <div className="flex items-center space-x-6">
                {/* Summary Stats */}
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-bold text-center">
                    {previewState.expectedChanges}
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    Records Affected
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium">Risk Level:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      previewState.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      previewState.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {previewState.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Affected Tables */}
                  <div className="text-xs text-gray-600">
                    Tables: {previewState.affectedTables.join(', ')}
                  </div>
                </div>

                {/* Warnings & Conflicts */}
                {previewState.warnings.length > 0 && (
                  <div className="max-w-md">
                    <div className="text-sm font-medium mb-1 text-yellow-700">⚠️ Warnings:</div>
                    <div className="space-y-1">
                      {previewState.warnings.slice(0, 2).map((warning, idx) => (
                        <div key={idx} className="text-xs bg-yellow-50 p-2 rounded border">
                          {warning}
                        </div>
                      ))}
                      {previewState.warnings.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{previewState.warnings.length - 2} more warnings
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right: Action Buttons */}
            <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button 
              onClick={() => onSave(buildSerializedRule())}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              💾 Save Rule
            </button>
            
            <button 
              onClick={() => onExecute(buildSerializedRule())}
              className={`px-4 py-2 rounded text-white ${
                previewState.riskLevel === 'high' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              ⚡ Execute Now
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}