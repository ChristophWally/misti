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

export default function RuleBuilder({ 
  isOpen, 
  sourceSelections, 
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
  // UTILITY FUNCTIONS - Record Display Names
  // ========================================================================
  const getRecordDisplayName = (recordId: string, recordType: string): { displayName: string, recordTypeName: string } => {
    // For now, we need to look up the actual record names from the source data
    // This is a simplified version - full implementation would need access to the original record data
    
    let displayName = `Record ${recordId.slice(-8)}`
    let recordTypeName = recordType.replace('_', ' ')
    
    // Try to find the record in sourceSelections to get more context
    const selection = sourceSelections[recordId]
    if (selection) {
      recordTypeName = selection.recordType.replace('_', ' ')
      
      // TODO: In a full implementation, we'd need access to the original record data
      // from the search interface to show actual names like "testverb", "to test", etc.
      // For now, we'll improve the display format
      switch (selection.recordType) {
        case 'word':
          displayName = `Dictionary Word`
          break
        case 'form':
          displayName = `Word Form`
          break
        case 'word_translation':
          displayName = `Word Translation`
          break
        case 'form_translation':
          displayName = `Form Translation`
          break
        default:
          displayName = recordTypeName
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
  // ULTRA-DESIGNED THREE-PANEL INTERFACE
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

        {/* Three-Panel Interface */}
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
                          {Array.from(selection.selectedMetadataPaths).map(key => (
                            <span key={key} className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                              {key}
                            </span>
                          ))}
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
          {/* PANEL 2: OPERATIONS BUILDER (Center - 50%) */}
          {/* ================================================= */}
          <div className="w-1/2 overflow-y-auto">
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

              {/* Per-Tag Operations */}
              <div className="space-y-4">
                <h4 className="font-medium">Per-Tag Operations</h4>
                
                {/* Metadata Operations */}
                {Object.entries(ruleState.metadataOperations).map(([recordId, operations]) => {
                  const { displayName, recordTypeName } = getRecordDisplayName(recordId, sourceSelections[recordId]?.recordType || 'unknown')
                  return (
                  <div key={recordId} className="border rounded p-3">
                    <div className="text-sm font-medium mb-1">
                      📋 {displayName} - Core Tags
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {recordTypeName} #{recordId.slice(-8)}
                    </div>
                    
                    {Object.entries(operations).map(([metadataKey, config]) => (
                      <div key={metadataKey} className="flex items-center space-x-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs min-w-[80px]">
                          {metadataKey}
                        </span>
                        
                        <select
                          value={config.action}
                          onChange={(e) => updateMetadataOperation(recordId, metadataKey, { action: e.target.value as any })}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="keep">Keep</option>
                          <option value="update">Update</option>
                          <option value="remove">Remove</option>
                          <option value="conditional">Conditional</option>
                        </select>
                        
                        {config.action === 'update' && (
                          <input
                            type="text"
                            value={config.newValue || ''}
                            onChange={(e) => updateMetadataOperation(recordId, metadataKey, { newValue: e.target.value })}
                            className="border rounded px-2 py-1 text-xs flex-1"
                            placeholder="New value"
                          />
                        )}
                        
                        <select
                          value={config.applyTo}
                          onChange={(e) => updateMetadataOperation(recordId, metadataKey, { applyTo: e.target.value as any })}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="selected">Selected Only</option>
                          <option value="all_with_tag">All with Tag</option>
                          <option value="hierarchy">Whole Hierarchy</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  )
                })}

                {/* Optional Tag Operations */}
                {Object.entries(ruleState.optionalTagOperations).map(([tagKey, config]) => {
                  // Extract recordId from tagKey format: recordId_tagValue
                  const recordId = tagKey.split('_')[0]
                  const tagValue = tagKey.split('_').slice(1).join('_')
                  const { displayName, recordTypeName } = getRecordDisplayName(recordId, sourceSelections[recordId]?.recordType || 'unknown')
                  
                  return (
                  <div key={tagKey} className="border rounded p-3">
                    <div className="text-sm font-medium mb-1">
                      🏷️ {displayName} - Optional Tags
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {recordTypeName} #{recordId.slice(-8)} - Tag: "{tagValue}"
                    </div>
                    
                    <div className="flex items-center space-x-3">
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
                  </div>
                  )
                })}
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

          {/* ================================================= */}
          {/* PANEL 3: PREVIEW & VALIDATION (Right - 25%) */}
          {/* ================================================= */}
          <div className="w-1/4 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-3">🔍 Preview & Validation</h3>
              
              {/* Summary Stats */}
              <div className="bg-white p-3 rounded border mb-4">
                <div className="text-lg font-bold text-center">
                  {previewState.expectedChanges}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Records Affected
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mb-4">
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
                <div className="text-xs text-gray-600 mb-2">
                  Tables: {previewState.affectedTables.join(', ')}
                </div>
              </div>

              {/* Warnings & Conflicts */}
              {previewState.warnings.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2 text-yellow-700">⚠️ Warnings:</div>
                  <div className="space-y-1">
                    {previewState.warnings.map((warning, idx) => (
                      <div key={idx} className="text-xs bg-yellow-50 p-2 rounded border">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Context-Aware Suggestions */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">💡 Suggestions:</div>
                <div className="space-y-1">
                  <div className="text-xs bg-blue-50 p-2 rounded border">
                    Consider using conditional operations for complex changes
                  </div>
                  <div className="text-xs bg-blue-50 p-2 rounded border">
                    Test on a subset first for high-risk operations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t p-4 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Ready to affect {previewState.expectedChanges} records</span>
          </div>
          
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
  )
}