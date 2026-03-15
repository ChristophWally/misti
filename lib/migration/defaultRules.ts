// lib/migration/defaultRules.ts
// Story 002.003: Pre-configured Rules for Current Migration Issues

import { MigrationRule } from './migrationRuleEngine';

/**
 * Default migration rules for the issues identified in our analysis:
 * - 666 forms with legacy Italian person terms
 * - 25 translations missing auxiliary metadata
 * - 4 forms with deprecated English grammatical terms
 */
export const DEFAULT_MIGRATION_RULES: MigrationRule[] = [
  {
    id: 'italian-to-universal-terminology',
    name: 'Convert Italian Person Terms to Universal',
    description:
      'Converts legacy Italian person terms (io, tu, lui, etc.) to universal terminology (prima-persona, seconda-persona, terza-persona) for multi-language support.',
    category: 'terminology',
    priority: 'critical',

    pattern: {
      table: 'word_forms',
      column: 'tags',
      condition: 'array_contains',
    },

    transformation: {
      type: 'array_replace',
      mappings: {
        io: 'prima-persona',
        tu: 'seconda-persona',
        lui: 'terza-persona',
        lei: 'terza-persona',
        noi: 'prima-persona',
        voi: 'seconda-persona',
        loro: 'terza-persona',
      },
    },

    safetyChecks: [
      { type: 'count_preview', threshold: 1000 },
      { type: 'validate_targets' },
      { type: 'backup_table' },
    ],

    requiresManualInput: false,
    estimatedAffectedRows: 666,
    estimatedExecutionTime: '2-3 seconds',

    rollbackStrategy: {
      type: 'reverse_transformation',
      retainBackup: true,
    },

    editable: true,
    autoExecutable: true,
  },

  {
    id: 'add-missing-auxiliary-metadata',
    name: 'Add Missing Auxiliary Assignments',
    description:
      'Adds required auxiliary metadata (avere/essere) to translations that are missing this critical information for compound tense generation.',
    category: 'metadata',
    priority: 'critical',

    pattern: {
      table: 'word_translations',
      column: 'context_metadata',
      condition: 'missing_key',
      value: 'auxiliary',
    },

    transformation: {
      type: 'json_add',
      // Will be filled by manual input during execution
    },

    safetyChecks: [
      { type: 'count_preview', threshold: 50 },
      { type: 'user_confirmation' },
      { type: 'backup_table' },
    ],

    requiresManualInput: true,
    manualInputFields: [
      {
        key: 'auxiliary_assignments',
        label: 'Auxiliary Assignments',
        type: 'json',
        required: true,
        defaultValue: {
          // Will be populated based on verb analysis
        },
      },
    ],

    estimatedAffectedRows: 25,
    estimatedExecutionTime: '1-2 seconds',

    rollbackStrategy: {
      type: 'restore_backup',
      retainBackup: true,
    },

    editable: true,
    autoExecutable: false, // Requires manual auxiliary selection
  },

  {
    id: 'cleanup-deprecated-english-tags',
    name: 'Clean Up Deprecated English Tags',
    description:
      'Replaces deprecated English grammatical terms with proper Italian equivalents (past-participle → participio-passato, etc.).',
    category: 'cleanup',
    priority: 'medium',

    pattern: {
      table: 'word_forms',
      column: 'tags',
      condition: 'array_contains',
    },

    transformation: {
      type: 'array_replace',
      mappings: {
        'past-participle': 'participio-passato',
        gerund: 'gerundio',
        infinitive: 'infinito',
        'present-participle': 'participio-presente',
      },
    },

    safetyChecks: [
      { type: 'count_preview', threshold: 20 },
      { type: 'validate_targets' },
    ],

    requiresManualInput: false,
    estimatedAffectedRows: 4,
    estimatedExecutionTime: 'Under 1 second',

    rollbackStrategy: {
      type: 'reverse_transformation',
      retainBackup: false,
    },

    editable: true,
    autoExecutable: true,
  },

  {
    id: 'standardize-auxiliary-tag-format',
    name: 'Standardize Auxiliary Tag Format',
    description:
      'Converts legacy auxiliary tag formats (auxiliary-essere → essere-auxiliary) to the standardized format.',
    category: 'cleanup',
    priority: 'high',

    pattern: {
      table: 'word_forms',
      column: 'tags',
      condition: 'array_contains',
    },

    transformation: {
      type: 'array_replace',
      mappings: {
        'auxiliary-essere': 'essere-auxiliary',
        'auxiliary-avere': 'avere-auxiliary',
        'auxiliary-stare': 'stare-auxiliary',
      },
    },

    safetyChecks: [
      { type: 'count_preview', threshold: 50 },
      { type: 'validate_targets' },
    ],

    requiresManualInput: false,
    estimatedAffectedRows: 0, // May not exist in current data
    estimatedExecutionTime: 'Under 1 second',

    rollbackStrategy: {
      type: 'reverse_transformation',
      retainBackup: false,
    },

    editable: true,
    autoExecutable: true,
  },

  {
    id: 'add-missing-transitivity-metadata',
    name: 'Add Missing Transitivity Information',
    description:
      'Adds transitivity metadata (transitive/intransitive) to translations for consistency validation.',
    category: 'metadata',
    priority: 'high',

    pattern: {
      table: 'word_translations',
      column: 'context_metadata',
      condition: 'missing_key',
      value: 'transitivity',
    },

    transformation: {
      type: 'json_add',
      // Will be filled by manual input or linguistic analysis
    },

    safetyChecks: [
      { type: 'count_preview', threshold: 50 },
      { type: 'user_confirmation' },
    ],

    requiresManualInput: true,
    manualInputFields: [
      {
        key: 'transitivity_assignments',
        label: 'Transitivity Assignments',
        type: 'json',
        required: true,
        defaultValue: {},
      },
    ],

    estimatedAffectedRows: 25, // Likely same translations missing auxiliary
    estimatedExecutionTime: '1-2 seconds',

    rollbackStrategy: {
      type: 'restore_backup',
      retainBackup: true,
    },

    editable: true,
    autoExecutable: false,
  },
];

/**
 * Helper function to get rule by ID
 */
export function getRuleById(ruleId: string): MigrationRule | null {
  return DEFAULT_MIGRATION_RULES.find((rule) => rule.id === ruleId) || null;
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category: string): MigrationRule[] {
  return DEFAULT_MIGRATION_RULES.filter((rule) => rule.category === category);
}

/**
 * Get rules by priority
 */
export function getRulesByPriority(priority: string): MigrationRule[] {
  return DEFAULT_MIGRATION_RULES.filter((rule) => rule.priority === priority);
}

/**
 * Get auto-executable rules (no manual input required)
 */
export function getAutoExecutableRules(): MigrationRule[] {
  return DEFAULT_MIGRATION_RULES.filter((rule) => rule.autoExecutable);
}

/**
 * Get rules requiring manual input
 */
export function getManualInputRules(): MigrationRule[] {
  return DEFAULT_MIGRATION_RULES.filter((rule) => rule.requiresManualInput);
}

/**
 * Generate auxiliary assignments for the missing auxiliary rule
 * This analyzes verb semantics to suggest appropriate auxiliaries
 */
export async function generateAuxiliaryAssignments(
  supabase: any
): Promise<Record<string, string>> {
  console.log('🔍 Analyzing verb semantics for auxiliary assignment…');

  // Get translations missing auxiliary metadata
  const { data: missingAuxiliaryTranslations, error } = await supabase
    .from('word_translations')
    .select(
      `id, translation, context_metadata, word_id, dictionary:word_id ( italian, tags )`
    )
    .is('context_metadata->auxiliary', null);

  if (error) {
    throw new Error(
      `Failed to load missing auxiliary translations: ${error.message}`
    );
  }

  const assignments: Record<string, string> = {};

  for (const translation of missingAuxiliaryTranslations) {
    const verb = translation.dictionary;
    const verbTags = verb?.tags || [];

    // Analyze verb for auxiliary assignment
    let suggestedAuxiliary = 'avere'; // Default

    // Check word-level auxiliary tags first
    if (verbTags.includes('essere-auxiliary')) {
      suggestedAuxiliary = 'essere';
    } else if (verbTags.includes('avere-auxiliary')) {
      suggestedAuxiliary = 'avere';
    } else {
      // Semantic analysis for auxiliary selection
      const translationText = translation.translation.toLowerCase();

      // Essere patterns: motion, state change, reflexive
      if (
        translationText.includes('to be') ||
        translationText.includes('to go') ||
        translationText.includes('to come') ||
        translationText.includes('to become') ||
        translationText.includes('to remain') ||
        translationText.includes('oneself') ||
        translationText.includes('each other')
      ) {
        suggestedAuxiliary = 'essere';
      }

      // Avere patterns: transitive actions, possession
      if (
        translationText.includes('to have') ||
        translationText.includes('to eat') ||
        translationText.includes('to speak') ||
        translationText.includes('to finish') ||
        translationText.includes('to make')
      ) {
        suggestedAuxiliary = 'avere';
      }
    }

    assignments[translation.id] = suggestedAuxiliary;
  }

  console.log(
    `✅ Generated auxiliary assignments for ${Object.keys(assignments).length} translations`
  );
  return assignments;
}

/**
 * Generate transitivity assignments based on auxiliary and semantic analysis
 */
export async function generateTransitivityAssignments(
  supabase: any
): Promise<Record<string, string>> {
  console.log('🔍 Analyzing verb semantics for transitivity assignment…');

  const { data: missingTransitivityTranslations, error } = await supabase
    .from('word_translations')
    .select(
      `id, translation, context_metadata, word_id, dictionary:word_id ( italian, tags )`
    )
    .is('context_metadata->transitivity', null);

  if (error) {
    throw new Error(
      `Failed to load missing transitivity translations: ${error.message}`
    );
  }

  const assignments: Record<string, string> = {};

  for (const translation of missingTransitivityTranslations) {
    const verb = translation.dictionary;
    const verbTags = verb?.tags || [];
    const auxiliary = translation.context_metadata?.auxiliary;

    let suggestedTransitivity = 'intransitive'; // Default

    // Check word-level transitivity tags first
    if (verbTags.includes('transitive-verb')) {
      suggestedTransitivity = 'transitive';
    } else if (verbTags.includes('intransitive-verb')) {
      suggestedTransitivity = 'intransitive';
    } else {
      // Use auxiliary as hint (avere often = transitive, essere often = intransitive)
      if (auxiliary === 'avere') {
        suggestedTransitivity = 'transitive';
      } else if (auxiliary === 'essere') {
        suggestedTransitivity = 'intransitive';
      }

      // Semantic analysis for transitivity
      const translationText = translation.translation.toLowerCase();

      // Transitive patterns: actions with objects
      if (
        translationText.includes('to eat') ||
        translationText.includes('to speak') ||
        translationText.includes('to finish') ||
        translationText.includes('to make') ||
        translationText.includes('to see')
      ) {
        suggestedTransitivity = 'transitive';
      }

      // Intransitive patterns: states, motion without object
      if (
        translationText.includes('to be') ||
        translationText.includes('to go') ||
        translationText.includes('to sleep') ||
        translationText.includes('to come')
      ) {
        suggestedTransitivity = 'intransitive';
      }
    }

    assignments[translation.id] = suggestedTransitivity;
  }

  console.log(
    `✅ Generated transitivity assignments for ${Object.keys(assignments).length} translations`
  );
  return assignments;
}

console.log('✅ Default migration rules loaded');
console.log(
  `📊 ${DEFAULT_MIGRATION_RULES.length} rules available for current migration issues`
);
console.log(
  '🎯 Ready to handle: terminology (666 forms), auxiliaries (25 translations), deprecated tags (4 forms)'
);

