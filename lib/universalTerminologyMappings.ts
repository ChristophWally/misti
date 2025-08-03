// lib/universalTerminologyMappings.ts
// EPIC 002: Universal Terminology System for Multi-Language Support
// Maps Italian-specific terms to language-agnostic internal representation

/**
 * Universal Terminology Mapping System
 * 
 * Establishes consistent internal representation while maintaining 
 * language-specific display layers for Italian learning interface.
 * 
 * Architecture:
 * - Internal Storage: Language-agnostic terms (first-person, indicative, present)
 * - Display Layer: Italian-specific terms (io, indicativo, presente)
 * - Migration Support: Maps legacy terms to universal terms
 */

export type UniversalTerm = string;
export type ItalianTerm = string;
export type LegacyTerm = string;

export interface TerminologyMapping {
  universal: UniversalTerm;
  italian: ItalianTerm;
  legacy?: LegacyTerm[];
  category: 'person' | 'number' | 'mood' | 'tense' | 'formType' | 'auxiliary' | 'conjugationClass' | 'verbType';
  description: string;
  examples?: string[];
}

// ==========================================
// PERSON MAPPINGS (Grammatical Persons)
// ==========================================

export const PERSON_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'first-person',
    italian: 'prima persona',
    legacy: ['io', 'prima-persona', '1st-person', 'first'],
    category: 'person',
    description: 'First person (speaker)',
    examples: ['io parlo', 'noi parliamo']
  },
  {
    universal: 'second-person',
    italian: 'seconda persona',
    legacy: ['tu', 'seconda-persona', '2nd-person', 'second'],
    category: 'person',
    description: 'Second person (addressee)',
    examples: ['tu parli', 'voi parlate']
  },
  {
    universal: 'third-person',
    italian: 'terza persona',
    legacy: ['lui', 'lei', 'egli', 'ella', 'esso', 'essa', 'loro', 'essi', 'esse', 'terza-persona', '3rd-person', 'third'],
    category: 'person',
    description: 'Third person (referent)',
    examples: ['lui parla', 'lei parla', 'loro parlano']
  },
  {
    universal: 'person-invariable',
    italian: 'forma invariabile',
    legacy: ['invariable', 'no-person', 'non-finite'],
    category: 'person',
    description: 'Non-finite forms without person distinction',
    examples: ['parlare', 'parlando', 'parlato']
  }
];

// ==========================================
// NUMBER MAPPINGS (Grammatical Number)
// ==========================================

export const NUMBER_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'singular',
    italian: 'singolare',
    legacy: ['sing', 'sg', 's'],
    category: 'number',
    description: 'Singular number (one entity)',
    examples: ['io parlo', 'tu parli', 'lui parla']
  },
  {
    universal: 'plural',
    italian: 'plurale',
    legacy: ['plur', 'pl', 'p'],
    category: 'number',
    description: 'Plural number (multiple entities)',
    examples: ['noi parliamo', 'voi parlate', 'loro parlano']
  },
  {
    universal: 'number-invariable',
    italian: 'numero invariabile',
    legacy: ['invariable-number', 'no-number'],
    category: 'number',
    description: 'Forms without number distinction',
    examples: ['parlare', 'parlando', 'parlato']
  }
];

// ==========================================
// MOOD MAPPINGS (Grammatical Moods)
// ==========================================

export const MOOD_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'indicative',
    italian: 'indicativo',
    legacy: ['indicativo-mood', 'ind'],
    category: 'mood',
    description: 'Indicative mood (factual statements)',
    examples: ['parlo', 'parlavo', 'parlerò']
  },
  {
    universal: 'subjunctive',
    italian: 'congiuntivo',
    legacy: ['congiuntivo', 'congiuntivo-mood', 'subj'],
    category: 'mood',
    description: 'Subjunctive mood (doubt, desire, emotion)',
    examples: ['che io parli', 'che tu parlassi']
  },
  {
    universal: 'conditional',
    italian: 'condizionale',
    legacy: ['condizionale-mood', 'cond'],
    category: 'mood',
    description: 'Conditional mood (hypothetical, polite)',
    examples: ['parlerei', 'avresti parlato']
  },
  {
    universal: 'imperative',
    italian: 'imperativo',
    legacy: ['imperativo-mood', 'imp'],
    category: 'mood',
    description: 'Imperative mood (commands)',
    examples: ['parla!', 'parlate!']
  },
  {
    universal: 'infinitive',
    italian: 'infinito',
    legacy: ['infinito-mood', 'inf'],
    category: 'mood',
    description: 'Infinitive mood (basic verb form)',
    examples: ['parlare', 'aver parlato']
  },
  {
    universal: 'participle',
    italian: 'participio',
    legacy: ['participio-mood', 'part'],
    category: 'mood',
    description: 'Participial forms (adjectival/compound)',
    examples: ['parlante', 'parlato']
  },
  {
    universal: 'gerund',
    italian: 'gerundio',
    legacy: ['gerundio-mood', 'ger'],
    category: 'mood',
    description: 'Gerund forms (progressive/adverbial)',
    examples: ['parlando', 'avendo parlato']
  }
];

// ==========================================
// TENSE MAPPINGS (All EPIC 26 Categories)
// ==========================================

export const TENSE_MAPPINGS: TerminologyMapping[] = [
  // Simple Tenses
  {
    universal: 'present',
    italian: 'presente',
    legacy: ['presente', 'pres'],
    category: 'tense',
    description: 'Present tense',
    examples: ['parlo', 'parli', 'parla']
  },
  {
    universal: 'imperfect',
    italian: 'imperfetto',
    legacy: ['imperfetto', 'imperf'],
    category: 'tense',
    description: 'Imperfect past tense',
    examples: ['parlavo', 'parlavi', 'parlava']
  },
  {
    universal: 'past-remote',
    italian: 'passato remoto',
    legacy: ['passato-remoto', 'past-historic', 'remote-past'],
    category: 'tense',
    description: 'Past remote (historic past)',
    examples: ['parlai', 'parlasti', 'parlò']
  },
  {
    universal: 'future-simple',
    italian: 'futuro semplice',
    legacy: ['futuro-semplice', 'future', 'futuro'],
    category: 'tense',
    description: 'Simple future tense',
    examples: ['parlerò', 'parlerai', 'parlerà']
  },

  // Compound Perfect Tenses
  {
    universal: 'present-perfect',
    italian: 'passato prossimo',
    legacy: ['passato-prossimo', 'present-perfect', 'perfect'],
    category: 'tense',
    description: 'Present perfect (recent past)',
    examples: ['ho parlato', 'hai parlato', 'ha parlato']
  },
  {
    universal: 'past-perfect',
    italian: 'trapassato prossimo',
    legacy: ['trapassato-prossimo', 'pluperfect'],
    category: 'tense',
    description: 'Past perfect (pluperfect)',
    examples: ['avevo parlato', 'avevi parlato', 'aveva parlato']
  },
  {
    universal: 'future-perfect',
    italian: 'futuro anteriore',
    legacy: ['futuro-anteriore', 'future-anterior'],
    category: 'tense',
    description: 'Future perfect',
    examples: ['avrò parlato', 'avrai parlato', 'avrà parlato']
  },
  {
    universal: 'past-anterior',
    italian: 'trapassato remoto',
    legacy: ['trapassato-remoto', 'remote-perfect'],
    category: 'tense',
    description: 'Past anterior (remote perfect)',
    examples: ['ebbi parlato', 'avesti parlato', 'ebbe parlato']
  },

  // Subjunctive Tenses
  {
    universal: 'subjunctive-present',
    italian: 'congiuntivo presente',
    legacy: ['congiuntivo-presente', 'present-subjunctive'],
    category: 'tense',
    description: 'Present subjunctive',
    examples: ['che io parli', 'che tu parli', 'che lui parli']
  },
  {
    universal: 'subjunctive-imperfect',
    italian: 'congiuntivo imperfetto',
    legacy: ['congiuntivo-imperfetto', 'imperfect-subjunctive'],
    category: 'tense',
    description: 'Imperfect subjunctive',
    examples: ['che io parlassi', 'che tu parlassi', 'che lui parlasse']
  },
  {
    universal: 'subjunctive-perfect',
    italian: 'congiuntivo passato',
    legacy: ['congiuntivo-passato', 'perfect-subjunctive'],
    category: 'tense',
    description: 'Perfect subjunctive',
    examples: ['che io abbia parlato', 'che tu abbia parlato']
  },
  {
    universal: 'subjunctive-pluperfect',
    italian: 'congiuntivo trapassato',
    legacy: ['congiuntivo-trapassato', 'pluperfect-subjunctive'],
    category: 'tense',
    description: 'Pluperfect subjunctive',
    examples: ['che io avessi parlato', 'che tu avessi parlato']
  },

  // Conditional Tenses
  {
    universal: 'conditional-present',
    italian: 'condizionale presente',
    legacy: ['condizionale-presente', 'present-conditional'],
    category: 'tense',
    description: 'Present conditional',
    examples: ['parlerei', 'parleresti', 'parlerebbe']
  },
  {
    universal: 'conditional-perfect',
    italian: 'condizionale passato',
    legacy: ['condizionale-passato', 'perfect-conditional'],
    category: 'tense',
    description: 'Perfect conditional',
    examples: ['avrei parlato', 'avresti parlato', 'avrebbe parlato']
  },

  // Imperative Tenses
  {
    universal: 'imperative-present',
    italian: 'imperativo presente',
    legacy: ['imperativo-presente', 'imperative'],
    category: 'tense',
    description: 'Present imperative',
    examples: ['parla!', 'parliamo!', 'parlate!']
  },
  {
    universal: 'imperative-perfect',
    italian: 'imperativo passato',
    legacy: ['imperativo-passato', 'perfect-imperative'],
    category: 'tense',
    description: 'Perfect imperative (rare)',
    examples: ['abbi parlato!', 'abbiate parlato!']
  },

  // Progressive Tenses
  {
    universal: 'present-progressive',
    italian: 'presente progressivo',
    legacy: ['presente-progressivo', 'present-continuous'],
    category: 'tense',
    description: 'Present progressive (ongoing action)',
    examples: ['sto parlando', 'stai parlando', 'sta parlando']
  },
  {
    universal: 'past-progressive',
    italian: 'passato progressivo',
    legacy: ['passato-progressivo', 'imperfect-progressive'],
    category: 'tense',
    description: 'Past progressive (ongoing past action)',
    examples: ['stavo parlando', 'stavi parlando', 'stava parlando']
  },
  {
    universal: 'future-progressive',
    italian: 'futuro progressivo',
    legacy: ['futuro-progressivo', 'future-continuous'],
    category: 'tense',
    description: 'Future progressive (ongoing future action)',
    examples: ['starò parlando', 'starai parlando', 'starà parlando']
  },
  {
    universal: 'subjunctive-present-progressive',
    italian: 'congiuntivo presente progressivo',
    legacy: ['congiuntivo-presente-progressivo'],
    category: 'tense',
    description: 'Present subjunctive progressive',
    examples: ['che io stia parlando', 'che tu stia parlando']
  },
  {
    universal: 'conditional-present-progressive',
    italian: 'condizionale presente progressivo',
    legacy: ['condizionale-presente-progressivo'],
    category: 'tense',
    description: 'Present conditional progressive',
    examples: ['starei parlando', 'staresti parlando']
  },

  // Non-finite Tenses
  {
    universal: 'infinitive-present',
    italian: 'infinito presente',
    legacy: ['infinito-presente', 'present-infinitive'],
    category: 'tense',
    description: 'Present infinitive',
    examples: ['parlare', 'credere', 'dormire']
  },
  {
    universal: 'infinitive-perfect',
    italian: 'infinito passato',
    legacy: ['infinito-passato', 'perfect-infinitive'],
    category: 'tense',
    description: 'Perfect infinitive',
    examples: ['aver parlato', 'essere andato']
  },
  {
    universal: 'participle-present',
    italian: 'participio presente',
    legacy: ['participio-presente', 'present-participle'],
    category: 'tense',
    description: 'Present participle',
    examples: ['parlante', 'credente', 'dormiente']
  },
  {
    universal: 'participle-past',
    italian: 'participio passato',
    legacy: ['participio-passato', 'past-participle'],
    category: 'tense',
    description: 'Past participle',
    examples: ['parlato', 'creduto', 'dormito']
  },
  {
    universal: 'gerund-present',
    italian: 'gerundio presente',
    legacy: ['gerundio-presente', 'present-gerund'],
    category: 'tense',
    description: 'Present gerund',
    examples: ['parlando', 'credendo', 'dormendo']
  },
  {
    universal: 'gerund-perfect',
    italian: 'gerundio passato',
    legacy: ['gerundio-passato', 'perfect-gerund'],
    category: 'tense',
    description: 'Perfect gerund',
    examples: ['avendo parlato', 'essendo andato']
  }
];

// ==========================================
// FORM TYPE MAPPINGS
// ==========================================

export const FORM_TYPE_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'simple',
    italian: 'semplice',
    legacy: ['simple-form', 'base-form'],
    category: 'formType',
    description: 'Simple verb forms (single word)',
    examples: ['parlo', 'parlavo', 'parlerò']
  },
  {
    universal: 'compound',
    italian: 'composto',
    legacy: ['compound-form', 'complex-form'],
    category: 'formType',
    description: 'Compound verb forms (auxiliary + participle)',
    examples: ['ho parlato', 'avevo parlato', 'avrò parlato']
  },
  {
    universal: 'progressive',
    italian: 'progressivo',
    legacy: ['progressive-form', 'continuous-form'],
    category: 'formType',
    description: 'Progressive verb forms (stare + gerund)',
    examples: ['sto parlando', 'stavo parlando', 'starò parlando']
  }
];

// ==========================================
// AUXILIARY MAPPINGS
// ==========================================

export const AUXILIARY_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'have-auxiliary',
    italian: 'ausiliare avere',
    legacy: ['avere-auxiliary', 'auxiliary-avere', 'avere', 'have'],
    category: 'auxiliary',
    description: 'Avere auxiliary for transitive verbs',
    examples: ['ho parlato', 'avevo finito', 'avrò mangiato']
  },
  {
    universal: 'be-auxiliary',
    italian: 'ausiliare essere',
    legacy: ['essere-auxiliary', 'auxiliary-essere', 'essere', 'be'],
    category: 'auxiliary',
    description: 'Essere auxiliary for intransitive/reflexive verbs',
    examples: ['sono andato', 'era partito', 'sarà arrivato']
  },
  {
    universal: 'stay-auxiliary',
    italian: 'ausiliare stare',
    legacy: ['stare-auxiliary', 'auxiliary-stare', 'stare', 'stay'],
    category: 'auxiliary',
    description: 'Stare auxiliary for progressive forms',
    examples: ['sto parlando', 'stava andando', 'starà lavorando']
  }
];

// ==========================================
// CONJUGATION CLASS MAPPINGS
// ==========================================

export const CONJUGATION_CLASS_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'first-conjugation',
    italian: 'prima coniugazione',
    legacy: ['are-conjugation', 'first-class', '-are'],
    category: 'conjugationClass',
    description: 'First conjugation (-are verbs)',
    examples: ['parlare', 'amare', 'studiare']
  },
  {
    universal: 'second-conjugation',
    italian: 'seconda coniugazione',
    legacy: ['ere-conjugation', 'second-class', '-ere'],
    category: 'conjugationClass',
    description: 'Second conjugation (-ere verbs)',
    examples: ['credere', 'vendere', 'vivere']
  },
  {
    universal: 'third-conjugation',
    italian: 'terza coniugazione',
    legacy: ['ire-conjugation', 'third-class', '-ire'],
    category: 'conjugationClass',
    description: 'Third conjugation (-ire verbs)',
    examples: ['dormire', 'partire', 'sentire']
  },
  {
    universal: 'third-conjugation-isc',
    italian: 'terza coniugazione con -isc-',
    legacy: ['ire-isc-conjugation', 'ire-infix', '-ire-isc'],
    category: 'conjugationClass',
    description: 'Third conjugation with -isc- infix',
    examples: ['finire', 'pulire', 'costruire']
  }
];

// ==========================================
// VERB TYPE MAPPINGS
// ==========================================

export const VERB_TYPE_MAPPINGS: TerminologyMapping[] = [
  {
    universal: 'reflexive-verb',
    italian: 'verbo riflessivo',
    legacy: ['reflexive', 'riflessivo'],
    category: 'verbType',
    description: 'Reflexive verbs (with inherent pronouns)',
    examples: ['lavarsi', 'alzarsi', 'vestirsi']
  },
  {
    universal: 'modal-verb',
    italian: 'verbo modale',
    legacy: ['modal', 'modale', 'auxiliary-modal'],
    category: 'verbType',
    description: 'Modal verbs (expressing possibility, necessity)',
    examples: ['potere', 'dovere', 'volere']
  },
  {
    universal: 'impersonal-verb',
    italian: 'verbo impersonale',
    legacy: ['impersonal', 'impersonale', 'third-person-only'],
    category: 'verbType',
    description: 'Impersonal verbs (third person only)',
    examples: ['piovere', 'nevicare', 'bisognare']
  },
  {
    universal: 'weather-verb',
    italian: 'verbo meteorologico',
    legacy: ['weather', 'meteorological', 'atmospheric'],
    category: 'verbType',
    description: 'Weather verbs (atmospheric phenomena)',
    examples: ['piovere', 'nevicare', 'grandinare']
  },
  {
    universal: 'defective-verb',
    italian: 'verbo difettivo',
    legacy: ['defective', 'difettivo', 'incomplete'],
    category: 'verbType',
    description: 'Defective verbs (missing some forms)',
    examples: ['solere', 'vigere', 'vertere']
  }
];

// ==========================================
// COMPREHENSIVE MAPPING COLLECTIONS
// ==========================================

export const ALL_TERMINOLOGY_MAPPINGS: TerminologyMapping[] = [
  ...PERSON_MAPPINGS,
  ...NUMBER_MAPPINGS,
  ...MOOD_MAPPINGS,
  ...TENSE_MAPPINGS,
  ...FORM_TYPE_MAPPINGS,
  ...AUXILIARY_MAPPINGS,
  ...CONJUGATION_CLASS_MAPPINGS,
  ...VERB_TYPE_MAPPINGS
];

// ==========================================
// LOOKUP UTILITIES
// ==========================================

/**
 * Create fast lookup maps for bidirectional conversion
 */
export class TerminologyConverter {
  private italianToUniversal = new Map<string, string>();
  private universalToItalian = new Map<string, string>();
  private legacyToUniversal = new Map<string, string>();
  private categoryMaps = new Map<string, Map<string, string>>();

  constructor() {
    this.buildLookupMaps();
  }

  private buildLookupMaps() {
    for (const mapping of ALL_TERMINOLOGY_MAPPINGS) {
      // Italian to Universal
      this.italianToUniversal.set(mapping.italian.toLowerCase(), mapping.universal);
      
      // Universal to Italian
      this.universalToItalian.set(mapping.universal, mapping.italian);
      
      // Legacy to Universal (handle multiple legacy terms)
      if (mapping.legacy) {
        for (const legacyTerm of mapping.legacy) {
          this.legacyToUniversal.set(legacyTerm.toLowerCase(), mapping.universal);
        }
      }
      
      // Category-specific maps
      if (!this.categoryMaps.has(mapping.category)) {
        this.categoryMaps.set(mapping.category, new Map());
      }
      const categoryMap = this.categoryMaps.get(mapping.category)!;
      categoryMap.set(mapping.italian.toLowerCase(), mapping.universal);
      if (mapping.legacy) {
        for (const legacyTerm of mapping.legacy) {
          categoryMap.set(legacyTerm.toLowerCase(), mapping.universal);
        }
      }
    }
    
    console.log('✅ Terminology converter initialized');
    console.log(`📊 ${this.italianToUniversal.size} Italian → Universal mappings`);
    console.log(`📊 ${this.legacyToUniversal.size} Legacy → Universal mappings`);
    console.log(`📊 ${this.categoryMaps.size} category-specific maps`);
  }

  /**
   * Convert Italian term to universal term
   */
  italianToUniversal(italianTerm: string): string | null {
    return this.italianToUniversal.get(italianTerm.toLowerCase()) || null;
  }

  /**
   * Convert universal term to Italian term
   */
  universalToItalian(universalTerm: string): string | null {
    return this.universalToItalian.get(universalTerm) || null;
  }

  /**
   * Convert legacy term to universal term
   */
  legacyToUniversal(legacyTerm: string): string | null {
    return this.legacyToUniversal.get(legacyTerm.toLowerCase()) || null;
  }

  /**
   * Attempt to convert any term (Italian, legacy, or universal) to universal
   */
  toUniversal(term: string): string {
    // Try legacy conversion first (most specific)
    const fromLegacy = this.legacyToUniversal(term);
    if (fromLegacy) return fromLegacy;
    
    // Try Italian conversion
    const fromItalian = this.italianToUniversal(term);
    if (fromItalian) return fromItalian;
    
    // Check if it's already universal
    if (this.universalToItalian.has(term)) return term;
    
    // Return as-is if no conversion found (with warning)
    console.warn(`⚠️ No universal mapping found for term: "${term}"`);
    return term;
  }

  /**
   * Convert array of terms to universal
   */
  convertTagsToUniversal(tags: string[]): string[] {
    return tags.map(tag => this.toUniversal(tag));
  }

  /**
   * Convert array of universal terms to Italian for display
   */
  convertTagsToItalian(universalTags: string[]): string[] {
    return universalTags.map(tag => this.universalToItalian(tag) || tag);
  }

  /**
   * Get all terms in a specific category
   */
  getCategoryTerms(category: string): { universal: string; italian: string; legacy?: string[] }[] {
    return ALL_TERMINOLOGY_MAPPINGS
      .filter(mapping => mapping.category === category)
      .map(mapping => ({
        universal: mapping.universal,
        italian: mapping.italian,
        legacy: mapping.legacy
      }));
  }

  /**
   * Validate that a term exists in the mapping system
   */
  isValidTerm(term: string): boolean {
    return this.toUniversal(term) !== term || this.universalToItalian.has(term);
  }

  /**
   * Get mapping details for a specific term
   */
  getMappingDetails(term: string): TerminologyMapping | null {
    return ALL_TERMINOLOGY_MAPPINGS.find(mapping => 
      mapping.universal === term ||
      mapping.italian.toLowerCase() === term.toLowerCase() ||
      (mapping.legacy && mapping.legacy.some(legacy => legacy.toLowerCase() === term.toLowerCase()))
    ) || null;
  }
}

// ==========================================
// MIGRATION UTILITIES
// ==========================================

/**
 * Generate SQL migration scripts for tag standardization
 */
export class TagMigrationGenerator {
  private converter: TerminologyConverter;

  constructor() {
    this.converter = new TerminologyConverter();
  }

  /**
   * Generate SQL for updating word_forms tags to universal terminology
   */
  generateFormTagMigration(): string[] {
    const migrations: string[] = [];
    
    for (const mapping of ALL_TERMINOLOGY_MAPPINGS) {
      if (mapping.legacy) {
        for (const legacyTerm of mapping.legacy) {
          migrations.push(`
-- Migrate ${legacyTerm} → ${mapping.universal}
UPDATE word_forms 
SET tags = array_replace(tags, '${legacyTerm}', '${mapping.universal}') 
WHERE tags @> '["${legacyTerm}"]';
          `.trim());
        }
      }
    }
    
    return migrations;
  }

  /**
   * Generate SQL for updating dictionary tags to universal terminology
   */
  generateWordTagMigration(): string[] {
    const migrations: string[] = [];
    
    for (const mapping of ALL_TERMINOLOGY_MAPPINGS.filter(m => 
      ['conjugationClass', 'verbType'].includes(m.category))) {
      if (mapping.legacy) {
        for (const legacyTerm of mapping.legacy) {
          migrations.push(`
-- Migrate ${legacyTerm} → ${mapping.universal}
UPDATE dictionary 
SET tags = array_replace(tags, '${legacyTerm}', '${mapping.universal}') 
WHERE tags @> '["${legacyTerm}"]' AND word_type = 'VERB';
          `.trim());
        }
      }
    }
    
    return migrations;
  }

  /**
   * Generate validation query to check migration completeness
   */
  generateValidationQuery(): string {
    const allLegacyTerms = ALL_TERMINOLOGY_MAPPINGS
      .flatMap(m => m.legacy || [])
      .map(term => `'${term}'`)
      .join(', ');

    return `
-- Check for remaining legacy terms after migration
SELECT 
  'word_forms' as table_name,
  id,
  form_text,
  tags
FROM word_forms 
WHERE tags && ARRAY[${allLegacyTerms}]

UNION ALL

SELECT 
  'dictionary' as table_name,
  id::text,
  italian,
  tags
FROM dictionary 
WHERE tags && ARRAY[${allLegacyTerms}] AND word_type = 'VERB';
    `.trim();
  }
}

// ==========================================
// EXPORT INSTANCES
// ==========================================

export const terminologyConverter = new TerminologyConverter();
export const tagMigrationGenerator = new TagMigrationGenerator();

// ==========================================
// VALIDATION AND STATISTICS
// ==========================================

export function validateMappingCompleteness(): boolean {
  const categories = ['person', 'number', 'mood', 'tense', 'formType', 'auxiliary', 'conjugationClass', 'verbType'];
  let isComplete = true;

  for (const category of categories) {
    const categoryMappings = ALL_TERMINOLOGY_MAPPINGS.filter(m => m.category === category);
    console.log(`📊 ${category}: ${categoryMappings.length} mappings`);
    
    if (categoryMappings.length === 0) {
      console.error(`❌ No mappings found for category: ${category}`);
      isComplete = false;
    }
  }

  console.log(`📊 Total mappings: ${ALL_TERMINOLOGY_MAPPINGS.length}`);
  console.log(`✅ Mapping completeness validation: ${isComplete ? 'PASSED' : 'FAILED'}`);
  
  return isComplete;
}

// Auto-validate on module load
validateMappingCompleteness();

console.log('✅ Universal Terminology Mappings loaded');
console.log(`📊 Supporting ${ALL_TERMINOLOGY_MAPPINGS.length} total terminology mappings`);
console.log(`🔄 Converter ready for bidirectional Italian ↔ Universal conversion`);
console.log(`🛠️ Migration generator ready for SQL tag standardization`);