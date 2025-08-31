// Clean database service for migration rules
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { MigrationRule, DatabaseRule, RuleConfiguration, WordSearchResult } from './types';

const supabase = createClientComponentClient();

export class DatabaseService {
  // Load all migration rules from database
  static async loadRules(): Promise<MigrationRule[]> {
    const { data: rules, error } = await supabase
      .from('custom_migration_rules')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!rules?.length) return [];

    return rules.map(this.convertDatabaseToMigrationRule);
  }

  // Save new rule to database
  static async saveRule(
    title: string,
    description: string,
    operationType: 'replace' | 'add' | 'remove',
    configuration: RuleConfiguration,
    preventDuplicates: boolean
  ): Promise<string> {
    const ruleId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { error } = await supabase
      .from('custom_migration_rules')
      .insert({
        rule_id: ruleId,
        name: title,
        description: description,
        pattern: {
          table: configuration.selectedTable,
          column: configuration.selectedColumn,
          targetTags: configuration.selectedTagsForMigration,
          targetWords: configuration.selectedWords.map(w => w.italian),
          targetWordObjects: configuration.selectedWords,
          targetFormIds: configuration.selectedFormIds,
          targetTranslationIds: configuration.selectedTranslationIds
        },
        transformation: {
          type: operationType === 'replace' ? 'array_replace' : operationType === 'add' ? 'array_add' : 'array_remove',
          mappings: configuration.mappings.reduce((acc, mapping) => {
            acc[mapping.from] = mapping.to;
            return acc;
          }, {} as Record<string, string>),
          tagsToRemove: configuration.tagsToRemove,
          newTagToAdd: configuration.newTagToAdd || null,
          tagsToAdd: configuration.tagsToAdd,
          preventDuplicates
        },
        rule_config: configuration,
        tags: ['custom-rule'],
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return ruleId;
  }

  // Update existing rule in database
  static async updateRule(
    ruleId: string,
    title: string,
    description: string,
    operationType: 'replace' | 'add' | 'remove',
    configuration: RuleConfiguration,
    preventDuplicates: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('custom_migration_rules')
      .update({
        name: title,
        description: description,
        pattern: {
          table: configuration.selectedTable,
          column: configuration.selectedColumn,
          targetTags: configuration.selectedTagsForMigration,
          targetWords: configuration.selectedWords.map(w => w.italian),
          targetWordObjects: configuration.selectedWords,
          targetFormIds: configuration.selectedFormIds,
          targetTranslationIds: configuration.selectedTranslationIds
        },
        transformation: {
          type: operationType === 'replace' ? 'array_replace' : operationType === 'add' ? 'array_add' : 'array_remove',
          mappings: configuration.mappings.reduce((acc, mapping) => {
            acc[mapping.from] = mapping.to;
            return acc;
          }, {} as Record<string, string>),
          tagsToRemove: configuration.tagsToRemove,
          newTagToAdd: configuration.newTagToAdd || null,
          tagsToAdd: configuration.tagsToAdd,
          preventDuplicates
        },
        rule_config: configuration
      })
      .eq('rule_id', ruleId);

    if (error) throw error;
  }

  // Get form/translation names for display
  static async getFormNames(formIds: string[]): Promise<Record<string, string>> {
    if (formIds.length === 0) return {};
    
    const { data, error } = await supabase
      .from('word_forms')
      .select('id, form_text')
      .in('id', formIds);

    if (error) throw error;
    
    return data?.reduce((acc, form) => {
      acc[form.id] = form.form_text || `Form ${form.id}`;
      return acc;
    }, {} as Record<string, string>) || {};
  }

  static async getTranslationNames(translationIds: string[]): Promise<Record<string, string>> {
    if (translationIds.length === 0) return {};
    
    const { data, error } = await supabase
      .from('word_translations')
      .select('id, translation_text')
      .in('id', translationIds);

    if (error) throw error;
    
    return data?.reduce((acc, trans) => {
      acc[trans.id] = trans.translation_text || `Translation ${trans.id}`;
      return acc;
    }, {} as Record<string, string>) || {};
  }

  // Convert database rule to migration rule
  private static convertDatabaseToMigrationRule(dbRule: DatabaseRule): MigrationRule {
    return {
      id: dbRule.rule_id,
      title: dbRule.name,
      description: dbRule.description,
      operationType: dbRule.transformation?.type === 'array_replace' ? 'replace' : 
                     dbRule.transformation?.type === 'array_add' ? 'add' : 'remove',
      status: 'ready',
      affectedCount: 0, // Will be calculated separately
      preventDuplicates: dbRule.transformation?.preventDuplicates ?? true,
      ruleSource: dbRule.tags?.includes('default-rule') ? 'default' : 'custom',
      configuration: dbRule.rule_config || {
        selectedTable: dbRule.pattern?.table || '',
        selectedColumn: dbRule.pattern?.column || '',
        selectedTagsForMigration: dbRule.pattern?.targetTags || [],
        mappings: Object.entries(dbRule.transformation?.mappings || {}).map(([from, to], index) => ({
          id: index.toString(),
          from,
          to
        })),
        tagsToRemove: dbRule.transformation?.tagsToRemove || [],
        newTagToAdd: dbRule.transformation?.newTagToAdd || '',
        tagsToAdd: dbRule.transformation?.tagsToAdd || [],
        selectedWords: dbRule.pattern?.targetWordObjects || [],
        selectedFormIds: dbRule.pattern?.targetFormIds || [],
        selectedTranslationIds: dbRule.pattern?.targetTranslationIds || [],
        selectedFormNames: [],
        selectedTranslationNames: []
      }
    };
  }
}