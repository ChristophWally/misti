// lib/universalTerminologyConverter.ts
// EPIC 002: Story 002.003 - Universal Terminology Converter
// Bidirectional mapping between legacy Italian terms and universal terminology

export interface TerminologyMapping {
  legacy: string;
  universal: string;
  category: 'person' | 'number' | 'auxiliary' | 'mood' | 'tense';
  description: string;
  examples?: string[];
}

export interface TerminologyAnalysis {
  totalTerms: number;
  legacyTerms: TerminologyFound[];
  universalTerms: TerminologyFound[];
  mixedUsage: TerminologyConflict[];
  migrationRecommendations: TerminologyMigration[];
}

export interface TerminologyFound {
  term: string;
  category: string;
  usageCount: number;
  tables: string[];
  universalEquivalent?: string;
}

export interface TerminologyConflict {
  legacyTerm: string;
  universalTerm: string;
  bothUsageCount: number;
  category: string;
  description: string;
  migrationPriority: 'high' | 'medium' | 'low';
}

export interface TerminologyMigration {
  fromTerm: string;
  toTerm: string;
  category: string;
  affectedRecords: number;
  safetyLevel: 'safe' | 'caution' | 'review';
  sqlPreview: string;
}

export interface ConversionOptions {
  allowMixedMode: boolean;
  strictValidation: boolean;
  preserveLegacyForTransition: boolean;
  validateSemanticConsistency: boolean;
}

/**
 * Universal Terminology Converter
 * 
 * Handles bidirectional mapping between legacy Italian grammatical terms
 * and universal terminology for multi-language support and consistency.
 */
export class UniversalTerminologyConverter {
  private readonly terminologyMappings: TerminologyMapping[];
  private readonly reverseMapping: Map<string, string>;
  private readonly categoryMappings: Map<string, TerminologyMapping[]>;

  constructor() {
    this.terminologyMappings = this.initializeTerminologyMappings();
    this.reverseMapping = this.createReverseMapping();
    this.categoryMappings = this.createCategoryMappings();
    
    console.log('🔧 Universal Terminology Converter initialized');
    console.log(`📊 Loaded ${this.terminologyMappings.length} terminology mappings`);
    console.log('🔄 Bidirectional conversion ready for migration support');
  }

  /**
   * Convert legacy term to universal equivalent
   */
  legacyToUniversal(legacyTerm: string): string | null {
    const mapping = this.terminologyMappings.find(m => m.legacy === legacyTerm);
    return mapping ? mapping.universal : null;
  }

  /**
   * Convert universal term to legacy equivalent
   */
  universalToLegacy(universalTerm: string): string | null {
    return this.reverseMapping.get(universalTerm) || null;
  }

  /**
   * Check if term is legacy format
   */
  isLegacyTerm(term: string): boolean {
    return this.terminologyMappings.some(m => m.legacy === term);
  }

  /**
   * Check if term is universal format
   */
  isUniversalTerm(term: string): boolean {
    return this.reverseMapping.has(term);
  }

  /**
   * Get category of a term (person, number, auxiliary, etc.)
   */
  getTermCategory(term: string): string | null {
    const mapping = this.terminologyMappings.find(m => 
      m.legacy === term || m.universal === term
    );
    return mapping ? mapping.category : null;
  }

  /**
   * Convert an array of tags from legacy to universal
   */
  convertTagsLegacyToUniversal(tags: string[], options: ConversionOptions = { 
    allowMixedMode: false, 
    strictValidation: true,
    preserveLegacyForTransition: false,
    validateSemanticConsistency: true 
  }): string[] {
    const convertedTags: string[] = [];
    const conversionLog: string[] = [];

    for (const tag of tags) {
      const universalEquivalent = this.legacyToUniversal(tag);
      
      if (universalEquivalent) {
        // This is a legacy term that can be converted
        if (options.preserveLegacyForTransition) {
          // During transition, keep both
          convertedTags.push(tag); // Keep legacy
          if (!tags.includes(universalEquivalent)) {
            convertedTags.push(universalEquivalent); // Add universal
          }
        } else {
          // Full migration: replace with universal
          convertedTags.push(universalEquivalent);
        }
        conversionLog.push(`${tag} → ${universalEquivalent}`);
      } else if (this.isUniversalTerm(tag)) {
        // Already universal, keep as-is
        convertedTags.push(tag);
      } else {
        // Not a terminology term, keep as-is
        convertedTags.push(tag);
      }
    }

    // Validate semantic consistency if requested
    if (options.validateSemanticConsistency) {
      this.validateSemanticConsistency(convertedTags);
    }

    if (conversionLog.length > 0) {
      console.log(`🔄 Converted terminology: ${conversionLog.join(', ')}`);
    }

    return convertedTags;
  }

  /**
   * Convert an array of tags from universal to legacy (for rollback)
   */
  convertTagsUniversalToLegacy(tags: string[]): string[] {
    return tags.map(tag => {
      const legacyEquivalent = this.universalToLegacy(tag);
      return legacyEquivalent || tag;
    });
  }

  /**
   * Analyze terminology usage in a tag array
   */
  analyzeTagTerminology(tags: string[]): {
    legacyTerms: string[];
    universalTerms: string[];
    unknownTerms: string[];
    conflicts: string[];
    recommendations: string[];
  } {
    const legacyTerms: string[] = [];
    const universalTerms: string[] = [];
    const unknownTerms: string[] = [];
    const conflicts: string[] = [];
    const recommendations: string[] = [];

    for (const tag of tags) {
      if (this.isLegacyTerm(tag)) {
        legacyTerms.push(tag);
        const universal = this.legacyToUniversal(tag);
        if (universal && tags.includes(universal)) {
          conflicts.push(`Both ${tag} and ${universal} present`);
        } else if (universal) {
          recommendations.push(`Convert ${tag} → ${universal}`);
        }
      } else if (this.isUniversalTerm(tag)) {
        universalTerms.push(tag);
      } else if (this.isTerminologyRelated(tag)) {
        unknownTerms.push(tag);
      }
    }

    return {
      legacyTerms,
      universalTerms,
      unknownTerms,
      conflicts,
      recommendations
    };
  }

  /**
   * Generate comprehensive terminology analysis for system-wide migration
   */
  generateSystemAnalysis(formTags: string[][], verbIds: string[]): TerminologyAnalysis {
    const allTags = formTags.flat();
    const tagFrequency = this.calculateTagFrequency(allTags);
    
    const legacyTerms: TerminologyFound[] = [];
    const universalTerms: TerminologyFound[] = [];
    const mixedUsage: TerminologyConflict[] = [];

    // Analyze each terminology category
    for (const [category, mappings] of this.categoryMappings) {
      const categoryAnalysis = this.analyzeCategoryUsage(
        mappings, 
        tagFrequency, 
        ['word_forms'] // Currently analyzing forms
      );
      
      legacyTerms.push(...categoryAnalysis.legacy);
      universalTerms.push(...categoryAnalysis.universal);
      mixedUsage.push(...categoryAnalysis.conflicts);
    }

    const migrationRecommendations = this.generateMigrationRecommendations(mixedUsage);

    return {
      totalTerms: legacyTerms.length + universalTerms.length,
      legacyTerms,
      universalTerms,
      mixedUsage,
      migrationRecommendations
    };
  }

  /**
   * Validate semantic consistency in converted tags
   */
  private validateSemanticConsistency(tags: string[]): void {
    // Check for conflicting person terms
    const personTerms = tags.filter(tag => this.getTermCategory(tag) === 'person');
    if (personTerms.length > 1) {
      console.warn(`⚠️ Multiple person terms found: ${personTerms.join(', ')}`);
    }

    // Check for conflicting number terms
    const numberTerms = tags.filter(tag => this.getTermCategory(tag) === 'number');
    if (numberTerms.length > 1) {
      console.warn(`⚠️ Multiple number terms found: ${numberTerms.join(', ')}`);
    }

    // Check for person-number consistency
    this.validatePersonNumberConsistency(tags);
  }

  /**
   * Validate person-number combinations make sense
   */
  private validatePersonNumberConsistency(tags: string[]): void {
    const hasFirstPerson = tags.includes('prima-persona');
    const hasSecondPerson = tags.includes('seconda-persona');
    const hasThirdPerson = tags.includes('terza-persona');
    const hasSingular = tags.includes('singolare');
    const hasPlural = tags.includes('plurale');

    // Basic consistency checks
    if ((hasFirstPerson || hasSecondPerson || hasThirdPerson) && !(hasSingular || hasPlural)) {
      console.warn('⚠️ Person specified without number');
    }

    if ((hasSingular || hasPlural) && !(hasFirstPerson || hasSecondPerson || hasThirdPerson)) {
      console.warn('⚠️ Number specified without person');
    }
  }

  /**
   * Initialize all terminology mappings
   */
  private initializeTerminologyMappings(): TerminologyMapping[] {
    return [
      // Person terminology
      {
        legacy: 'io',
        universal: 'prima-persona',
        category: 'person',
        description: 'First person singular',
        examples: ['io parlo', 'io dormo']
      },
      {
        legacy: 'tu',
        universal: 'seconda-persona',
        category: 'person',
        description: 'Second person singular',
        examples: ['tu parli', 'tu dormi']
      },
      {
        legacy: 'lui',
        universal: 'terza-persona',
        category: 'person',
        description: 'Third person singular masculine',
        examples: ['lui parla', 'lui dorme']
      },
      {
        legacy: 'lei',
        universal: 'terza-persona',
        category: 'person',
        description: 'Third person singular feminine',
        examples: ['lei parla', 'lei dorme']
      },
      {
        legacy: 'noi',
        universal: 'prima-persona',
        category: 'person',
        description: 'First person plural',
        examples: ['noi parliamo', 'noi dormiamo']
      },
      {
        legacy: 'voi',
        universal: 'seconda-persona',
        category: 'person',
        description: 'Second person plural',
        examples: ['voi parlate', 'voi dormite']
      },
      {
        legacy: 'loro',
        universal: 'terza-persona',
        category: 'person',
        description: 'Third person plural',
        examples: ['loro parlano', 'loro dormono']
      },

      // Auxiliary terminology (already standardized in our data)
      {
        legacy: 'auxiliary-essere',
        universal: 'essere-auxiliary',
        category: 'auxiliary',
        description: 'Essere auxiliary tag format',
        examples: ['sono andato', 'è finito']
      },
      {
        legacy: 'auxiliary-avere',
        universal: 'avere-auxiliary',
        category: 'auxiliary',
        description: 'Avere auxiliary tag format',
        examples: ['ho parlato', 'ha mangiato']
      },
      {
        legacy: 'auxiliary-stare',
        universal: 'stare-auxiliary',
        category: 'auxiliary',
        description: 'Stare auxiliary tag format',
        examples: ['sto parlando', 'sta mangiando']
      },

      // English grammatical terms (should be eliminated)
      {
        legacy: 'past-participle',
        universal: 'participio-passato',
        category: 'mood',
        description: 'Past participle form',
        examples: ['parlato', 'andato']
      },
      {
        legacy: 'gerund',
        universal: 'gerundio',
        category: 'mood',
        description: 'Gerund form',
        examples: ['parlando', 'andando']
      },
      {
        legacy: 'infinitive',
        universal: 'infinito',
        category: 'mood',
        description: 'Infinitive form',
        examples: ['parlare', 'andare']
      }
    ];
  }

  /**
   * Create reverse mapping for universal → legacy conversion
   */
  private createReverseMapping(): Map<string, string> {
    const map = new Map<string, string>();
    
    for (const mapping of this.terminologyMappings) {
      // For person terms, we need to handle the many-to-one mapping
      if (mapping.category === 'person') {
        if (!map.has(mapping.universal)) {
          // First occurrence - use this legacy term as primary
          map.set(mapping.universal, mapping.legacy);
        }
        // For terza-persona, we have both lui and lei
        // We'll use 'lui' as default, but this could be configurable
      } else {
        map.set(mapping.universal, mapping.legacy);
      }
    }
    
    return map;
  }

  /**
   * Create category-based mapping groups
   */
  private createCategoryMappings(): Map<string, TerminologyMapping[]> {
    const map = new Map<string, TerminologyMapping[]>();
    
    for (const mapping of this.terminologyMappings) {
      if (!map.has(mapping.category)) {
        map.set(mapping.category, []);
      }
      map.get(mapping.category)!.push(mapping);
    }
    
    return map;
  }

  /**
   * Check if term is terminology-related (for unknown term detection)
   */
  private isTerminologyRelated(term: string): boolean {
    // Patterns that might indicate terminology terms
    const terminologyPatterns = [
      /^(first|second|third)-person$/,
      /^(singular|plural)$/,
      /^(masculine|feminine|neuter)$/,
      /^.*-auxiliary$/,
      /^auxiliary-.*$/,
      /^.*-participle$/,
      /^.*-gerund$/
    ];
    
    return terminologyPatterns.some(pattern => pattern.test(term));
  }

  /**
   * Calculate frequency of tags
   */
  private calculateTagFrequency(tags: string[]): Map<string, number> {
    const frequency = new Map<string, number>();
    
    for (const tag of tags) {
      frequency.set(tag, (frequency.get(tag) || 0) + 1);
    }
    
    return frequency;
  }

  /**
   * Analyze category usage patterns
   */
  private analyzeCategoryUsage(
    mappings: TerminologyMapping[], 
    tagFrequency: Map<string, number>,
    tables: string[]
  ): {
    legacy: TerminologyFound[];
    universal: TerminologyFound[];
    conflicts: TerminologyConflict[];
  } {
    const legacy: TerminologyFound[] = [];
    const universal: TerminologyFound[] = [];
    const conflicts: TerminologyConflict[] = [];

    for (const mapping of mappings) {
      const legacyCount = tagFrequency.get(mapping.legacy) || 0;
      const universalCount = tagFrequency.get(mapping.universal) || 0;

      if (legacyCount > 0) {
        legacy.push({
          term: mapping.legacy,
          category: mapping.category,
          usageCount: legacyCount,
          tables,
          universalEquivalent: mapping.universal
        });
      }

      if (universalCount > 0) {
        universal.push({
          term: mapping.universal,
          category: mapping.category,
          usageCount: universalCount,
          tables
        });
      }

      if (legacyCount > 0 && universalCount > 0) {
        conflicts.push({
          legacyTerm: mapping.legacy,
          universalTerm: mapping.universal,
          bothUsageCount: legacyCount + universalCount,
          category: mapping.category,
          description: `Both ${mapping.legacy} and ${mapping.universal} are in use`,
          migrationPriority: this.calculateMigrationPriority(mapping.category, legacyCount + universalCount)
        });
      }
    }

    return { legacy, universal, conflicts };
  }

  /**
   * Calculate migration priority based on category and usage
   */
  private calculateMigrationPriority(category: string, usageCount: number): 'high' | 'medium' | 'low' {
    if (category === 'person' && usageCount > 50) return 'high';
    if (category === 'auxiliary' && usageCount > 10) return 'high';
    if (usageCount > 20) return 'medium';
    return 'low';
  }

  /**
   * Generate migration recommendations
   */
  private generateMigrationRecommendations(conflicts: TerminologyConflict[]): TerminologyMigration[] {
    return conflicts.map(conflict => ({
      fromTerm: conflict.legacyTerm,
      toTerm: conflict.universalTerm,
      category: conflict.category,
      affectedRecords: conflict.bothUsageCount,
      safetyLevel: this.determineSafetyLevel(conflict.category),
      sqlPreview: this.generateMigrationSQL(conflict.legacyTerm, conflict.universalTerm)
    }));
  }

  /**
   * Determine safety level for migration
   */
  private determineSafetyLevel(category: string): 'safe' | 'caution' | 'review' {
    switch (category) {
      case 'person':
      case 'auxiliary':
        return 'safe'; // Well-understood mappings
      default:
        return 'caution'; // May need review
    }
  }

  /**
   * Generate SQL preview for migration
   */
  private generateMigrationSQL(fromTerm: string, toTerm: string): string {
    return `UPDATE word_forms SET tags = array_replace(tags, '${fromTerm}', '${toTerm}') WHERE tags @> ARRAY['${fromTerm}'];`;
  }
}

// Export convenience functions
export const terminologyConverter = new UniversalTerminologyConverter();

export const ALL_TERMINOLOGY_MAPPINGS = {
  PERSON_MAPPINGS: {
    'io': 'prima-persona',
    'tu': 'seconda-persona',
    'lui': 'terza-persona',
    'lei': 'terza-persona',
    'noi': 'prima-persona',
    'voi': 'seconda-persona',
    'loro': 'terza-persona'
  },
  AUXILIARY_MAPPINGS: {
    'auxiliary-essere': 'essere-auxiliary',
    'auxiliary-avere': 'avere-auxiliary',
    'auxiliary-stare': 'stare-auxiliary'
  },
  ENGLISH_TERM_MAPPINGS: {
    'past-participle': 'participio-passato',
    'gerund': 'gerundio',
    'infinitive': 'infinito'
  }
};

console.log('✅ Universal Terminology Converter ready');
console.log('🔄 Bidirectional mapping between legacy and universal terms');
console.log('📊 Supports transition phases and semantic validation');
console.log('🛡️ Provides migration analysis and safety assessment');
