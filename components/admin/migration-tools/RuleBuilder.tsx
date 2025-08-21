'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { MigrationRule, RuleConfiguration, MappingPair, WordSearchResult } from './types';
import { DatabaseService } from './DatabaseService';

const supabase = createClientComponentClient();

interface RuleBuilderProps {
  isOpen: boolean;
  editingRule: MigrationRule | null;
  onClose: () => void;
  onSave: (rule: MigrationRule) => void;
}

export default function RuleBuilder({ isOpen, editingRule, onClose, onSave }: RuleBuilderProps) {
  // Basic rule info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'replace' | 'add' | 'remove'>('replace');
  const [preventDuplicates, setPreventDuplicates] = useState(true);

  // Configuration state
  const [selectedTable, setSelectedTable] = useState('word_forms');
  const [selectedColumn, setSelectedColumn] = useState('tags');
  const [selectedTagsForMigration, setSelectedTagsForMigration] = useState<string[]>([]);
  const [mappings, setMappings] = useState<MappingPair[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  const [newTagToAdd, setNewTagToAdd] = useState('');
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordSearchResult[]>([]);
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<string[]>([]);

  // UI state
  const [wordFormsData, setWordFormsData] = useState<Record<string, any[]>>({});
  const [wordTranslationsData, setWordTranslationsData] = useState<Record<string, any[]>>({});
  const [selectedFormTags, setSelectedFormTags] = useState<Record<string, number>>({});
  const [selectedTranslationMetadata, setSelectedTranslationMetadata] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (editingRule) {
        loadRuleForEditing(editingRule);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingRule]);

  // Load rule configuration for editing
  const loadRuleForEditing = async (rule: MigrationRule) => {
    setTitle(rule.title);
    setDescription(rule.description);
    setOperationType(rule.operationType);
    setPreventDuplicates(rule.preventDuplicates);
    
    const config = rule.configuration;
    setSelectedTable(config.selectedTable);
    setSelectedColumn(config.selectedColumn);
    setSelectedTagsForMigration(config.selectedTagsForMigration);
    setMappings(config.mappings);
    setTagsToRemove(config.tagsToRemove);
    setNewTagToAdd(config.newTagToAdd);
    setTagsToAdd(config.tagsToAdd);
    setSelectedWords(config.selectedWords);
    setSelectedFormIds(config.selectedFormIds);
    setSelectedTranslationIds(config.selectedTranslationIds);

    // Load data for selected words
    if (config.selectedWords.length > 0) {
      await loadWordData(config.selectedWords);
      
      // Load Step 2 data if forms/translations are selected
      if (config.selectedFormIds.length > 0) {
        setTimeout(() => loadSelectedFormTags(config.selectedFormIds), 300);
      }
      if (config.selectedTranslationIds.length > 0) {
        setTimeout(() => loadSelectedTranslationMetadata(config.selectedTranslationIds), 300);
      }
    }
  };

  // Reset form to defaults
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOperationType('replace');
    setPreventDuplicates(true);
    setSelectedTable('word_forms');
    setSelectedColumn('tags');
    setSelectedTagsForMigration([]);
    setMappings([]);
    setTagsToRemove([]);
    setNewTagToAdd('');
    setTagsToAdd([]);
    setSelectedWords([]);
    setSelectedFormIds([]);
    setSelectedTranslationIds([]);
    setWordFormsData({});
    setWordTranslationsData({});
    setSelectedFormTags({});
    setSelectedTranslationMetadata({});
  };

  // Load word forms and translations data
  const loadWordData = async (words: WordSearchResult[]) => {
    const wordIds = words.map(w => w.wordId);
    
    // Load word forms
    const { data: formsData } = await supabase
      .from('word_forms')
      .select('id, word_id, form_text, tags')
      .in('word_id', wordIds);
    
    if (formsData) {
      const formsGrouped = formsData.reduce((acc, form) => {
        if (!acc[form.word_id]) acc[form.word_id] = [];
        acc[form.word_id].push(form);
        return acc;
      }, {} as Record<string, any[]>);
      setWordFormsData(formsGrouped);
    }

    // Load word translations  
    const { data: translationsData } = await supabase
      .from('word_translations')
      .select('id, word_id, translation_text, context_metadata')
      .in('word_id', wordIds);

    if (translationsData) {
      const translationsGrouped = translationsData.reduce((acc, trans) => {
        if (!acc[trans.word_id]) acc[trans.word_id] = [];
        acc[trans.word_id].push(trans);
        return acc;
      }, {} as Record<string, any[]>);
      setWordTranslationsData(translationsGrouped);
    }
  };

  // Load tags from selected forms
  const loadSelectedFormTags = (formIds: string[]) => {
    const selectedForms = Object.values(wordFormsData)
      .flat()
      .filter(form => formIds.includes(form.id));
    
    const tagCounts: Record<string, number> = {};
    selectedForms.forEach(form => {
      (form.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    setSelectedFormTags(tagCounts);
  };

  // Load metadata from selected translations
  const loadSelectedTranslationMetadata = (translationIds: string[]) => {
    const selectedTranslations = Object.values(wordTranslationsData)
      .flat()
      .filter(trans => translationIds.includes(trans.id));
    
    const metadataCounts: Record<string, number> = {};
    selectedTranslations.forEach(trans => {
      if (trans.context_metadata) {
        Object.keys(trans.context_metadata).forEach(key => {
          metadataCounts[key] = (metadataCounts[key] || 0) + 1;
        });
      }
    });
    
    setSelectedTranslationMetadata(metadataCounts);
  };

  // Add new mapping pair
  const addMapping = () => {
    const newMapping: MappingPair = {
      id: Date.now().toString(),
      from: '',
      to: ''
    };
    setMappings([...mappings, newMapping]);
  };

  // Update mapping
  const updateMapping = (id: string, field: 'from' | 'to', value: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ));
  };

  // Remove mapping
  const removeMapping = (id: string) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  // Save rule
  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    try {
      // Get form and translation names for display
      const formNames = await DatabaseService.getFormNames(selectedFormIds);
      const translationNames = await DatabaseService.getTranslationNames(selectedTranslationIds);

      const configuration: RuleConfiguration = {
        selectedTable,
        selectedColumn,
        selectedTagsForMigration,
        mappings,
        tagsToRemove,
        newTagToAdd,
        tagsToAdd,
        selectedWords,
        selectedFormIds,
        selectedTranslationIds,
        selectedFormNames: selectedFormIds.map(id => formNames[id] || `Form ${id}`),
        selectedTranslationNames: selectedTranslationIds.map(id => translationNames[id] || `Translation ${id}`)
      };

      let ruleId: string;
      if (editingRule) {
        await DatabaseService.updateRule(editingRule.id, title, description, operationType, configuration, preventDuplicates);
        ruleId = editingRule.id;
      } else {
        ruleId = await DatabaseService.saveRule(title, description, operationType, configuration, preventDuplicates);
      }

      const savedRule: MigrationRule = {
        id: ruleId,
        title,
        description,
        operationType,
        status: 'ready',
        affectedCount: 0,
        preventDuplicates,
        ruleSource: 'custom',
        configuration
      };

      onSave(savedRule);
      onClose();
    } catch (error) {
      console.error('Failed to save rule:', error);
      // TODO: Show error message
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editingRule ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Rule Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter rule name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this rule does..."
              rows={2}
            />
          </div>

          {/* Operation Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Operation</label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="replace">Replace</option>
              <option value="add">Add</option>
              <option value="remove">Remove</option>
            </select>
          </div>

          {/* Mappings for Replace operations */}
          {operationType === 'replace' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Replacements</label>
                <button
                  onClick={addMapping}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Mapping
                </button>
              </div>
              <div className="space-y-2">
                {mappings.map((mapping) => (
                  <div key={mapping.id} className="flex space-x-2 items-center">
                    <input
                      type="text"
                      value={mapping.from}
                      onChange={(e) => updateMapping(mapping.id, 'from', e.target.value)}
                      placeholder="From..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">→</span>
                    <input
                      type="text"
                      value={mapping.to}
                      onChange={(e) => updateMapping(mapping.id, 'to', e.target.value)}
                      placeholder="To..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeMapping(mapping.id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Selected Form Tags */}
          {selectedFormIds.length > 0 && Object.keys(selectedFormTags).length > 0 && (
            <div className="border rounded p-3 bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">
                Step 2: Tags from Selected Forms
              </h4>
              <div className="space-y-1">
                {Object.entries(selectedFormTags).map(([tag, count]) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTagsForMigration.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTagsForMigration(prev => [...prev, tag]);
                        } else {
                          setSelectedTagsForMigration(prev => prev.filter(t => t !== tag));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {tag} ({count} form{count > 1 ? 's' : ''})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Selected Translation Metadata */}
          {selectedTranslationIds.length > 0 && Object.keys(selectedTranslationMetadata).length > 0 && (
            <div className="border rounded p-3 bg-purple-50">
              <h4 className="font-medium text-purple-900 mb-2">
                Step 2: Metadata from Selected Translations
              </h4>
              <div className="space-y-1">
                {Object.entries(selectedTranslationMetadata).map(([key, count]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTagsForMigration.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTagsForMigration(prev => [...prev, key]);
                        } else {
                          setSelectedTagsForMigration(prev => prev.filter(t => t !== key));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {key} ({count} translation{count > 1 ? 's' : ''})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Prevent Duplicates */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preventDuplicates}
                onChange={(e) => setPreventDuplicates(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Prevent Duplicates</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}