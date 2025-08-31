// Clean type definitions for migration tools
export interface MigrationRule {
  id: string;
  title: string;
  description: string;
  operationType: 'replace' | 'add' | 'remove';
  status: 'ready' | 'needs-input' | 'executing' | 'completed' | 'failed';
  affectedCount: number;
  preventDuplicates: boolean;
  ruleSource: 'default' | 'custom' | 'loaded';
  configuration: RuleConfiguration;
}

export interface RuleConfiguration {
  selectedTable: string;
  selectedColumn: string;
  selectedTagsForMigration: string[];
  mappings: MappingPair[];
  tagsToRemove: string[];
  newTagToAdd: string;
  tagsToAdd: string[];
  selectedWords: WordSearchResult[];
  selectedFormIds: string[];
  selectedTranslationIds: string[];
  selectedFormNames: string[];
  selectedTranslationNames: string[];
}

export interface MappingPair {
  id: string;
  from: string;
  to: string;
}

export interface WordSearchResult {
  wordId: string;
  italian: string;
  wordType: string;
  tags: string[];
  formsCount: number;
  translationsCount: number;
}

export interface DatabaseRule {
  rule_id: string;
  name: string;
  description: string;
  pattern: {
    table: string;
    column: string;
    targetTags: string[];
    targetWords: string[];
    targetWordObjects: WordSearchResult[];
    targetFormIds: string[];
    targetTranslationIds: string[];
  };
  transformation: {
    type: string;
    mappings: Record<string, string>;
    tagsToRemove: string[];
    newTagToAdd: string | null;
    tagsToAdd: string[];
    preventDuplicates: boolean;
  };
  rule_config: RuleConfiguration;
  status: string;
  tags: string[];
  created_at: string;
}