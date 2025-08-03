// lib/verbComplianceRules.ts
// EPIC 002: Complete Conjugation System Architectural Rebuild
// Comprehensive Validation Rules for Existing Data Structure Compliance

/**
 * EPIC 002 Verb Compliance Validation System
 * 
 * This file defines all validation rules for ensuring existing database content
 * complies with the new materialization-centric architecture requirements.
 * 
 * Validates 4 data layers:
 * 1. Word Level (dictionary table)
 * 2. Translation Level (word_translations table) 
 * 3. Form Level (word_forms table)
 * 4. Cross-Table Relationships
 */

export type ValidationPriority = 'critical' | 'high' | 'medium' | 'low';
export type ValidationCategory = 'missing-required' | 'incorrect-format' | 'inconsistent-data' | 'deprecated-content' | 'architectural-mismatch';

export interface ValidationRule {
  id: string;
  description: string;
  category: ValidationCategory;
  priority: ValidationPriority;
  epicRequirement: string;
  level: 'word' | 'translation' | 'form' | 'cross-table';
  autoFixable: boolean;
  blocksNewSystem: boolean;
}

export interface ComplianceIssue {
  ruleId: string;
  severity: ValidationPriority;
  message: string;
  currentValue: any;
  expectedValue: any;
  autoFix?: string;
  manualSteps?: string[];
  epicContext: string;
}

// ==========================================
// WORD LEVEL COMPLIANCE RULES (dictionary table)
// ==========================================

export const WORD_LEVEL_REQUIRED_TAGS = {
  // Exactly ONE conjugation class required
  conjugation_class: {
    tags: ['are-conjugation', 'ere-conjugation', 'ire-conjugation', 'ire-isc-conjugation'],
    rule: 'exactly-one',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Layer 1: Word Properties - conjugation class determines form generation patterns'
  },

  // Frequency classification (at least one recommended)
  frequency_level: {
    tags: ['freq-top100', 'freq-top200', 'freq-top500', 'freq-top1000', 'freq-top5000'],
    rule: 'at-least-one-recommended',
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'Priority-based gap analysis and materialization order'
  },

  // CEFR level (at least one recommended)
  cefr_level: {
    tags: ['CEFR-A1', 'CEFR-A2', 'CEFR-B1', 'CEFR-B2', 'CEFR-C1', 'CEFR-C2'],
    rule: 'at-least-one-recommended', 
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'Pedagogical ordering and learning progression'
  },

  // Verb type flags (multiple possible)
  verb_types: {
    tags: ['reflexive-verb', 'modal-verb', 'impersonal-verb', 'weather-verb', 'defective-verb'],
    rule: 'zero-or-more',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Special behavior patterns require different validation rules'
  },

  // Transitivity potential (exactly one required for new system)
  transitivity_potential: {
    tags: ['always-transitive', 'always-intransitive', 'both-possible'],
    rule: 'exactly-one-required',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Translation-level auxiliary assignment validation depends on word-level transitivity'
  },

  // Irregularity markers (multiple possible)
  irregularity_flags: {
    tags: ['irregular-pattern', 'stem-changing', 'irregular-participle', 'irregular-gerund', 'irregular-imperative'],
    rule: 'zero-or-more',
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'Materialization engine needs irregularity information for proper form generation'
  }
};

export const WORD_LEVEL_DEPRECATED_TAGS = [
  'singular-auxiliary', // Replaced by translation-level auxiliary specification
  'plural-auxiliary',   // Replaced by translation-level auxiliary specification
  'compound-auxiliary', // Too vague - must specify avere/essere/stare at translation level
  'reflexive-only',     // Should use reflexive-verb + proper translation constraints
  'transitive-only',    // Replaced by transitivity_potential system
  'intransitive-only'   // Replaced by transitivity_potential system
];

// ==========================================
// TRANSLATION LEVEL COMPLIANCE RULES (word_translations table)
// ==========================================

export const TRANSLATION_LEVEL_REQUIRED_METADATA = {
  // Critical for new architecture
  auxiliary: {
    values: ['avere', 'essere'],
    rule: 'exactly-one-required',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Layer 2: Translation Metadata - auxiliary drives all compound form materialization'
  },

  transitivity: {
    values: ['transitive', 'intransitive'],
    rule: 'exactly-one-required', 
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Semantic consistency validation with auxiliary selection'
  },

  // Optional but important constraints
  usage: {
    values: ['direct-reflexive', 'reciprocal', 'intransitive'],
    rule: 'zero-or-one',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Drives form filtering logic for reflexive verbs'
  },

  plurality: {
    values: ['plural-only', 'singular-only', 'any'],
    rule: 'zero-or-one',
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'Reciprocal usage requires plural-only constraint'
  },

  gender_usage: {
    values: ['male-only', 'female-only', 'neutral'],
    rule: 'zero-or-one',
    priority: 'low' as ValidationPriority,
    epicRequirement: 'Subject constraint validation for specialized verbs'
  },

  // New architecture requirement
  form_ids: {
    rule: 'array-of-integers-required',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Translation-to-form relationship - each translation must specify which forms it uses'
  }
};

export const TRANSLATION_AUXILIARY_CONSISTENCY_RULES = {
  // Semantic auxiliary validation
  'state-change-verbs': {
    semanticTypes: ['state-change', 'motion-with-destination', 'existence-change'],
    requiredAuxiliary: 'essere',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Italian grammar requires essere for state-change verbs'
  },

  'action-verbs': {
    semanticTypes: ['general-action', 'transitive-action', 'creation'],
    requiredAuxiliary: 'avere',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Italian grammar requires avere for direct action verbs'
  },

  'reflexive-reciprocal': {
    usageTypes: ['direct-reflexive', 'reciprocal'],
    requiredAuxiliary: 'essere',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'All reflexive constructions require essere auxiliary'
  }
};

// ==========================================
// FORM LEVEL COMPLIANCE RULES (word_forms table)
// ==========================================

export const FORM_LEVEL_REQUIRED_TAGS = {
  // Universal terminology (language-agnostic)
  universal_persons: {
    tags: ['prima-persona', 'seconda-persona', 'terza-persona', 'person-invariable'],
    rule: 'exactly-one-for-finite-forms',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Multi-language support requires universal terminology',
    deprecatedAlternatives: ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']
  },

  universal_numbers: {
    tags: ['singolare', 'plurale', 'number-invariable'],
    rule: 'exactly-one-for-finite-forms',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Universal number specification for all finite forms'
  },

  // Mood classification (exactly one required)
  moods: {
    tags: ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'],
    rule: 'exactly-one',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Mood classification essential for form organization'
  },

  // Tense classification (exactly one required)
  tenses: {
    tags: [
      'presente', 'imperfetto', 'passato-remoto', 'futuro-semplice',
      'passato-prossimo', 'trapassato-prossimo', 'futuro-anteriore', 'trapassato-remoto',
      'congiuntivo-presente', 'congiuntivo-imperfetto', 'congiuntivo-passato', 'congiuntivo-trapassato',
      'condizionale-presente', 'condizionale-passato',
      'imperativo-presente', 'imperativo-passato',
      'infinito-presente', 'infinito-passato',
      'participio-presente', 'participio-passato',
      'gerundio-presente', 'gerundio-passato',
      'presente-progressivo', 'passato-progressivo', 'futuro-progressivo',
      'congiuntivo-presente-progressivo', 'condizionale-presente-progressivo'
    ],
    rule: 'exactly-one',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Complete tense specification from EPIC 26-category system'
  },

  // Form type classification (exactly one required)
  form_types: {
    tags: ['simple', 'compound', 'progressive'],
    rule: 'exactly-one',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Form type determines materialization vs generation logic'
  },

  // Special markers for new architecture
  auxiliary_tags: {
    tags: ['avere-auxiliary', 'essere-auxiliary', 'stare-auxiliary'],
    rule: 'exactly-one-for-compound-forms',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Explicit auxiliary tags eliminate runtime inference requirement'
  },

  building_blocks: {
    tags: ['building-block'],
    rule: 'required-for-participles-and-gerunds',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Building blocks enable compound form generation without materialization'
  }
};

export const FORM_LEVEL_DEPRECATED_TAGS = [
  'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', // Replaced by universal person terms
  'singolare', 'plurale', // Should use universal number terms
  'presente-indicativo', // Should separate mood and tense
  'compound-perfect', // Too vague - specify exact compound tense
  'auxiliary-essere', // Should use 'essere-auxiliary' format
  'auxiliary-avere', // Should use 'avere-auxiliary' format
  'irregular-form', // Should specify type: irregular-participle, irregular-gerund, etc.
];

// ==========================================
// CROSS-TABLE RELATIONSHIP RULES
// ==========================================

export const CROSS_TABLE_VALIDATION_RULES = {
  'translation-form-references': {
    rule: 'All form_ids in word_translations.form_ids must reference existing word_forms.id',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Translation-to-form relationship integrity essential for new architecture',
    autoFixable: false,
    blocksNewSystem: true
  },

  'auxiliary-consistency': {
    rule: 'word_forms with auxiliary tags must match word_translations.context_metadata.auxiliary',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Auxiliary consistency between translation metadata and form tags',
    autoFixable: true,
    blocksNewSystem: true
  },

  'reflexive-form-coverage': {
    rule: 'reflexive-verb tagged words must have base clitic forms (mi/ti/si + verb) stored',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Base reflexive forms must be materialized for clitic attachment foundation',
    autoFixable: false,
    blocksNewSystem: false
  },

  'building-block-completeness': {
    rule: 'All verbs must have participio-passato and gerundio-presente forms with building-block tags',
    priority: 'critical' as ValidationPriority,
    epicRequirement: 'Building blocks essential for compound tense generation',
    autoFixable: false,
    blocksNewSystem: true
  },

  'form-translation-assignments': {
    rule: 'All word_forms.id should have corresponding entries in form_translations table',
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'Complete English translation coverage for learning interface',
    autoFixable: false,
    blocksNewSystem: false
  },

  'orphaned-forms': {
    rule: 'No word_forms should exist without valid word_id reference to dictionary',
    priority: 'high' as ValidationPriority,
    epicRequirement: 'Direct relationship validation for form lookup efficiency',
    autoFixable: true,
    blocksNewSystem: false
  }
};

// ==========================================
// EPIC-SPECIFIC COMPLIANCE VALIDATORS
// ==========================================

export const EPIC_BUILDING_BLOCK_REQUIREMENTS = {
  'participio-passato': {
    required: true,
    tags: ['participio', 'participio-passato', 'simple', 'building-block'],
    priority: 'critical' as ValidationPriority,
    impact: 'Cannot generate any compound perfect tenses (passato prossimo, trapassato prossimo, etc.)',
    epicRequirement: 'Essential building block for 14 compound tense categories'
  },

  'gerundio-presente': {
    required: true,
    tags: ['gerundio', 'gerundio-presente', 'simple', 'building-block'],
    priority: 'critical' as ValidationPriority,
    impact: 'Cannot generate progressive tenses (presente progressivo, passato progressivo, etc.)',
    epicRequirement: 'Essential building block for 5 progressive tense categories'
  },

  'infinito-presente': {
    required: true,
    tags: ['infinito', 'infinito-presente', 'simple'],
    priority: 'high' as ValidationPriority,
    impact: 'Cannot generate negative imperatives and complex clitic attachments',
    epicRequirement: 'Base form for future clitic attachment engine'
  },

  'imperativo-base-forms': {
    required: true,
    tags: ['imperativo', 'imperativo-presente', 'simple'],
    priority: 'high' as ValidationPriority,
    impact: 'Cannot teach command forms or imperative clitic attachment',
    epicRequirement: 'Foundation for future enclitic attachment system'
  }
};

export const EPIC_SCOPE_BOUNDARY_RULES = {
  'no-negative-forms': {
    rule: 'No forms should contain "non" prefix - negative construction is syntactic, not morphological',
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'EPIC explicitly excludes negative forms from materialization scope',
    autoFix: 'Remove forms containing "non" - handle negation in UI layer'
  },

  'base-clitics-only': {
    rule: 'Only store inherent reflexive clitics (mi lavo, ti sei lavato), not complex combinations',
    priority: 'medium' as ValidationPriority,
    epicRequirement: 'Current scope limited to base word clitics - complex clitics handled by future engine',
    examples: {
      allowed: ['mi lavo', 'ti sei lavato', 'si sono visti'],
      excluded: ['lavati!', 'me lo dai', 'gliene parla']
    }
  },

  'no-complex-enclisis': {
    rule: 'No imperative forms with attached pronouns (lavati, fallo, vattene)',
    priority: 'low' as ValidationPriority,
    epicRequirement: 'Enclitic attachment reserved for future dynamic generation',
    autoFix: 'Separate base imperative forms from attached pronouns'
  }
};

// ==========================================
// VALIDATION RULE GROUPS BY PRIORITY
// ==========================================

export const CRITICAL_COMPLIANCE_RULES = [
  'conjugation_class',
  'auxiliary',
  'form_ids',
  'universal_persons',
  'universal_numbers', 
  'moods',
  'tenses',
  'auxiliary_tags',
  'building_blocks',
  'translation-form-references',
  'auxiliary-consistency',
  'building-block-completeness'
];

export const HIGH_PRIORITY_RULES = [
  'verb_types',
  'transitivity_potential',
  'transitivity',
  'usage',
  'form_types',
  'reflexive-form-coverage',
  'infinito-presente',
  'imperativo-base-forms'
];

export const MEDIUM_PRIORITY_RULES = [
  'frequency_level',
  'cefr_level',
  'irregularity_flags',
  'plurality',
  'form-translation-assignments',
  'no-negative-forms',
  'base-clitics-only'
];

// ==========================================
// COMPLIANCE SCORING SYSTEM
// ==========================================

export interface ComplianceScore {
  overall: number; // 0-100 percentage
  critical: number; // 0-100 percentage for critical rules only
  blockers: number; // Count of issues that block new system
  warnings: number; // Count of non-blocking issues
  verbsCompliant: number; // Count of fully compliant verbs
  verbsNeedingWork: number; // Count of verbs with issues
}

export const COMPLIANCE_THRESHOLDS = {
  READY_FOR_MIGRATION: 95, // Overall compliance score
  CRITICAL_ISSUES_MAX: 0,  // No critical issues allowed
  SYSTEM_BLOCKERS_MAX: 0   // No system-blocking issues allowed
};

// ==========================================
// AUTO-FIX SPECIFICATIONS
// ==========================================

export const AUTO_FIXABLE_RULES = {
  'universal-terminology-migration': {
    fixes: {
      'io': 'prima-persona',
      'tu': 'seconda-persona', 
      'lui': 'terza-persona',
      'lei': 'terza-persona',
      'noi': 'prima-persona',
      'voi': 'seconda-persona',
      'loro': 'terza-persona'
    },
    sql: `UPDATE word_forms SET tags = tags || '["prima-persona"]' WHERE tags ? 'io' AND NOT tags ? 'prima-persona'`,
    priority: 'critical' as ValidationPriority
  },

  'auxiliary-tag-standardization': {
    fixes: {
      'auxiliary-essere': 'essere-auxiliary',
      'auxiliary-avere': 'avere-auxiliary',
      'auxiliary-stare': 'stare-auxiliary'
    },
    sql: `UPDATE word_forms SET tags = array_replace(tags, 'auxiliary-essere', 'essere-auxiliary')`,
    priority: 'critical' as ValidationPriority
  },

  'remove-deprecated-tags': {
    tagsToRemove: WORD_LEVEL_DEPRECATED_TAGS.concat(FORM_LEVEL_DEPRECATED_TAGS),
    sql: `UPDATE dictionary SET tags = tags - $1 WHERE tags && $1`,
    priority: 'medium' as ValidationPriority
  }
};

// ==========================================
// VALIDATION REPORT STRUCTURE
// ==========================================

export interface VerbComplianceReport {
  verbId: string;
  verbItalian: string;
  overallScore: number;
  complianceStatus: 'compliant' | 'needs-work' | 'critical-issues' | 'blocks-migration';
  
  wordLevelIssues: ComplianceIssue[];
  translationLevelIssues: ComplianceIssue[];
  formLevelIssues: ComplianceIssue[];
  crossTableIssues: ComplianceIssue[];
  
  missingBuildingBlocks: string[];
  deprecatedContent: string[];
  autoFixableIssues: ComplianceIssue[];
  manualInterventionRequired: ComplianceIssue[];
  
  epicAlignmentNotes: string[];
  migrationReadiness: boolean;
  priorityLevel: 'high' | 'medium' | 'low';
  estimatedFixTime: string;
}

export interface SystemComplianceReport {
  totalVerbs: number;
  analyzedVerbs: number;
  complianceDistribution: {
    compliant: number;
    needsWork: number;
    criticalIssues: number;
    blocksMigration: number;
  };
  
  overallScore: ComplianceScore;
  topIssues: { ruleId: string; count: number; impact: string }[];
  autoFixableCount: number;
  estimatedWorkRequired: string;
  
  migrationReadiness: {
    ready: boolean;
    blockers: string[];
    recommendations: string[];
  };
  
  epicAlignmentSummary: {
    architecturalReadiness: number;
    dataQuality: number;
    linguisticAccuracy: number;
  };
}

/**
 * Export all compliance rules for validation engine consumption
 */
export const VERB_COMPLIANCE_RULES = {
  // Include both required and deprecated tag sets for word-level validation
  wordLevel: {
    ...WORD_LEVEL_REQUIRED_TAGS,
    deprecatedTags: WORD_LEVEL_DEPRECATED_TAGS
  },
  translationLevel: TRANSLATION_LEVEL_REQUIRED_METADATA,
  // Form-level rules now expose deprecated tags as well
  formLevel: {
    ...FORM_LEVEL_REQUIRED_TAGS,
    deprecatedTags: FORM_LEVEL_DEPRECATED_TAGS
  },
  crossTable: CROSS_TABLE_VALIDATION_RULES,
  buildingBlocks: EPIC_BUILDING_BLOCK_REQUIREMENTS,
  scopeBoundaries: EPIC_SCOPE_BOUNDARY_RULES,
  priorities: {
    critical: CRITICAL_COMPLIANCE_RULES,
    high: HIGH_PRIORITY_RULES,
    medium: MEDIUM_PRIORITY_RULES
  },
  autoFixes: AUTO_FIXABLE_RULES,
  thresholds: COMPLIANCE_THRESHOLDS
};

console.log('✅ EPIC 002 Verb Compliance Rules loaded');
console.log(`📊 Monitoring ${Object.keys(VERB_COMPLIANCE_RULES.wordLevel).length} word-level rule sets`);
console.log(`📊 Monitoring ${Object.keys(VERB_COMPLIANCE_RULES.translationLevel).length} translation-level rule sets`);
console.log(`📊 Monitoring ${Object.keys(VERB_COMPLIANCE_RULES.formLevel).length} form-level rule sets`);
console.log(`📊 Monitoring ${Object.keys(VERB_COMPLIANCE_RULES.crossTable).length} cross-table relationship rules`);
console.log(`📊 Tracking ${CRITICAL_COMPLIANCE_RULES.length} critical compliance requirements`);