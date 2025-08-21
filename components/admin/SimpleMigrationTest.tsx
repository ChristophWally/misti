'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Simple, working rule structure
interface SimpleRule {
  id: string;
  name: string;
  mappings: { from: string; to: string }[];
  selectedTranslations: { id: string; name: string }[];
  status: 'ready' | 'saved';
}

export default function SimpleMigrationTest() {
  const [rules, setRules] = useState<SimpleRule[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<SimpleRule | null>(null);

  // Builder state
  const [ruleName, setRuleName] = useState('');
  const [mappings, setMappings] = useState<{ from: string; to: string }[]>([]);
  const [selectedTranslations, setSelectedTranslations] = useState<{ id: string; name: string }[]>([]);

  // Load saved rules on mount
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_migration_rules')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const simpleRules: SimpleRule[] = data?.map(rule => ({
        id: rule.rule_id,
        name: rule.name,
        mappings: Object.entries(rule.transformation?.mappings || {}).map(([from, to]) => ({ from, to })),
        selectedTranslations: rule.rule_config?.selectedTranslationNames?.map((name: string, index: number) => ({
          id: rule.rule_config?.selectedTranslationIds?.[index] || `id-${index}`,
          name
        })) || [],
        status: 'saved'
      })) || [];

      setRules(simpleRules);
      console.log('✅ Loaded rules:', simpleRules);
    } catch (error) {
      console.error('❌ Failed to load rules:', error);
    }
  };

  const saveRule = async () => {
    if (!ruleName.trim() || mappings.length === 0) return;

    const ruleId = editingRule?.id || `test-${Date.now()}`;
    
    try {
      const ruleData = {
        rule_id: ruleId,
        name: ruleName,
        description: 'Test rule',
        pattern: {
          table: 'word_translations',
          column: 'context_metadata',
          targetTranslationIds: selectedTranslations.map(t => t.id)
        },
        transformation: {
          type: 'array_replace',
          mappings: mappings.reduce((acc, m) => {
            acc[m.from] = m.to;
            return acc;
          }, {} as Record<string, string>)
        },
        rule_config: {
          selectedTranslationIds: selectedTranslations.map(t => t.id),
          selectedTranslationNames: selectedTranslations.map(t => t.name),
          ruleBuilderMappings: mappings.map((m, i) => ({ id: i.toString(), from: m.from, to: m.to }))
        },
        status: 'active',
        tags: ['test-rule'],
        created_at: new Date().toISOString()
      };

      let error;
      if (editingRule) {
        ({ error } = await supabase
          .from('custom_migration_rules')
          .update(ruleData)
          .eq('rule_id', ruleId));
      } else {
        ({ error } = await supabase
          .from('custom_migration_rules')
          .insert(ruleData));
      }

      if (error) throw error;

      const newRule: SimpleRule = {
        id: ruleId,
        name: ruleName,
        mappings: [...mappings],
        selectedTranslations: [...selectedTranslations],
        status: 'saved'
      };

      if (editingRule) {
        setRules(prev => prev.map(r => r.id === ruleId ? newRule : r));
      } else {
        setRules(prev => [...prev, newRule]);
      }

      resetBuilder();
      console.log('✅ Rule saved:', newRule);
    } catch (error) {
      console.error('❌ Failed to save rule:', error);
    }
  };

  const editRule = (rule: SimpleRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setMappings([...rule.mappings]);
    setSelectedTranslations([...rule.selectedTranslations]);
    setShowBuilder(true);
    console.log('✏️ Editing rule:', rule);
  };

  const resetBuilder = () => {
    setEditingRule(null);
    setRuleName('');
    setMappings([]);
    setSelectedTranslations([]);
    setShowBuilder(false);
  };

  const addMapping = () => {
    setMappings(prev => [...prev, { from: '', to: '' }]);
  };

  const updateMapping = (index: number, field: 'from' | 'to', value: string) => {
    setMappings(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };

  const addTranslation = () => {
    const id = `trans-${Date.now()}`;
    const name = `Sample Translation ${selectedTranslations.length + 1}`;
    setSelectedTranslations(prev => [...prev, { id, name }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Simple Migration Test - Prove Translations Work
          </h1>
          <button
            onClick={() => setShowBuilder(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Test Rule
          </button>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {rule.status}
                  </span>
                  <button
                    onClick={() => editRule(rule)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Mappings:</span> 
                  {rule.mappings.map((m, i) => (
                    <span key={i} className="ml-2">"{m.from}" → "{m.to}"</span>
                  ))}
                </div>
                <div>
                  <span className="font-medium">Translations:</span> 
                  {rule.selectedTranslations.map(t => t.name).join(', ') || 'None'}
                </div>
              </div>
            </div>
          ))}
          
          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No rules found. Create a test rule to verify functionality.
            </div>
          )}
        </div>

        {/* Simple Builder Modal */}
        {showBuilder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingRule ? 'Edit' : 'Create'} Test Rule
                </h2>
                <button
                  onClick={resetBuilder}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rule name..."
                  />
                </div>

                {/* Mappings */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Mappings</label>
                    <button
                      onClick={addMapping}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add Mapping
                    </button>
                  </div>
                  <div className="space-y-2">
                    {mappings.map((mapping, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <input
                          type="text"
                          value={mapping.from}
                          onChange={(e) => updateMapping(index, 'from', e.target.value)}
                          placeholder="From..."
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span>→</span>
                        <input
                          type="text"
                          value={mapping.to}
                          onChange={(e) => updateMapping(index, 'to', e.target.value)}
                          placeholder="To..."
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => removeMapping(index)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Translations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Selected Translations</label>
                    <button
                      onClick={addTranslation}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Add Translation
                    </button>
                  </div>
                  <div className="space-y-1">
                    {selectedTranslations.map((trans, index) => (
                      <div key={trans.id} className="flex items-center justify-between px-2 py-1 bg-purple-50 rounded">
                        <span className="text-sm">{trans.name}</span>
                        <button
                          onClick={() => setSelectedTranslations(prev => prev.filter(t => t.id !== trans.id))}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetBuilder}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRule}
                  disabled={!ruleName.trim() || mappings.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}