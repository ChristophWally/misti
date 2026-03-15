// lib/migration/migrationRuleEngine.ts
// Story 002.003: Enhanced Migration System with Word-Specific Targeting
// UPDATED: Duplicate prevention, word targeting, dynamic schemas, tag deletion

export interface MigrationRule {
  id: string;
  name: string;
  description: string;
  category: 'terminology' | 'metadata' | 'cleanup' | 'structure' | 'custom';
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Enhanced pattern matching with word targeting
  pattern: {
    table: string;
    column: string;
    condition: 'array_contains' | 'array_remove' | 'missing_key' | 'equals' | 'regex' | 'custom';
    value?: any;
    customSQL?: string;
    // NEW: Word-specific targeting
    targetWords?: string[]; // Italian words to target specifically
    targetWordIds?: string[]; // Specific word IDs to target
  };
  
  // Enhanced transformation with tag operations
  transformation: {
    type: 'array_replace' | 'array_add' | 'array_remove' | 'json_merge' | 'json_add' | 'json_remove' | 'value_replace' | 'custom_sql';
    mappings?: Record<string, string>;
    additions?: Record<string, any>;
    removals?: string[]; // NEW: Tags to remove completely
    customSQL?: string;
    // NEW: Duplicate prevention
    preventDuplicates?: boolean;
  };
  
  // Safety and validation
  safetyChecks: SafetyCheck[];
  requiresManualInput: boolean;
  manualInputFields?: ManualInputField[];
  
  // Execution metadata
  estimatedAffectedRows?: number;
  estimatedExecutionTime?: string;
  rollbackStrategy: RollbackStrategy;
  
  // UI configuration
  editable: boolean;
  autoExecutable: boolean;
}

// NEW: Word search and targeting interfaces
export interface WordSearchResult {
  wordId: string;
  italian: string;
  wordType: string;
  tags: string[];
  formsCount: number;
  translationsCount: number;
  formTranslationsCount: number;
}

export interface WordTagAnalysis {
  wordId: string;
  italian: string;
  dictionary: {
    tags: string[];
    tagCounts: Record<string, number>;
  };
  forms: {
    totalCount: number;
    tagBreakdown: Record<string, number>;
    sampleTags: string[][];
  };
  translations: {
    totalCount: number;
    metadataKeys: string[];
    sampleMetadata: any[];
  };
  formTranslations: {
    totalCount: number;
    coverageAnalysis: any;
  };
}

// NEW: Database schema interfaces
export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isArray: boolean;
  isJson: boolean;
  nullable: boolean;
}

export interface SafetyCheck {
  type: 'count_preview' | 'backup_table' | 'validate_targets' | 'dry_run' | 'user_confirmation' | 'duplicate_check';
  threshold?: number;
  message?: string;
}

export interface ManualInputField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'json' | 'word_search' | 'tag_list';
  options?: string[];
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

export interface RollbackStrategy {
  type: 'reverse_transformation' | 'restore_backup' | 'custom_sql';
  customSQL?: string;
  retainBackup: boolean;
}

export interface MigrationPreview {
  ruleId: string;
  affectedRows: number;
  previewData: any[];
  sqlStatements: string[];
  rollbackSQL: string[];
  estimatedDuration: string;
  safetyWarnings: string[];
  // NEW: Word-specific analysis
  targetedWords?: WordSearchResult[];
  duplicateAnalysis?: {
    wouldCreateDuplicates: boolean;
    duplicateCount: number;
    affectedTags: string[];
  };
}

export interface MigrationExecution {
  ruleId: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'rolled_back';
  startTime: Date;
  endTime?: Date;
  affectedRows: number;
  errorMessage?: string;
  rollbackAvailable: boolean;
  // NEW: Execution details
  targetedWords?: string[];
  duplicatesPreventedCount?: number;
}

export class EnhancedMigrationRuleEngine {
  private supabase: any;
  private executionLog: MigrationExecution[] = [];
  private schemaCache: Map<string, TableSchema> = new Map();
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * NEW: Search for words by Italian text
   */
  async searchWords(searchTerm: string, wordType?: string): Promise<WordSearchResult[]> {
    console.log(`🔍 Searching for words: "${searchTerm}"`);
    
    let query = this.supabase
      .from('dictionary')
      .select(`
        id,
        italian,
        word_type,
        tags,
        word_forms:word_forms(count),
        word_translations:word_translations(count),
        form_translations:word_translations!inner(
          form_translations(count)
        )
      `)
      .ilike('italian', `%${searchTerm}%`);

    if (wordType) {
      query = query.eq('word_type', wordType);
    }

    const { data, error } = await query.limit(20);
    
    if (error) {
      throw new Error(`Word search failed: ${error.message}`);
    }

    return (data || []).map((word: any) => ({
      wordId: word.id,
      italian: word.italian,
      wordType: word.word_type,
      tags: word.tags || [],
      formsCount: word.word_forms?.length || 0,
      translationsCount: word.word_translations?.length || 0,
      formTranslationsCount: word.form_translations?.length || 0
    }));
  }

  /**
   * NEW: Analyze tags for a specific word across all tables
   */
  async analyzeWordTags(wordId: string): Promise<WordTagAnalysis> {
    console.log(`📊 Analyzing tags for word ID: ${wordId}`);

    try {
      // Get dictionary entry
      const { data: word, error: wordError } = await this.supabase
        .from('dictionary')
        .select('id, italian, tags')
        .eq('id', wordId)
        .single();

      if (wordError) throw wordError;

      // Get forms analysis
      const { data: forms, error: formsError } = await this.supabase
        .from('word_forms')
        .select('id, form_text, tags')
        .eq('word_id', wordId);

      if (formsError) throw formsError;

      // Get translations analysis
      const { data: translations, error: translationsError } = await this.supabase
        .from('word_translations')
        .select('id, translation, context_metadata')
        .eq('word_id', wordId);

      if (translationsError) throw translationsError;

      // Get form translations count
      const { data: formTranslations, error: ftError } = await this.supabase
        .from('form_translations')
        .select('id, word_translation_id')
        .in('word_translation_id', (translations || []).map(t => t.id));

      if (ftError) throw ftError;

      // Analyze form tags
      const allFormTags = (forms || []).flatMap(f => f.tags || []);
      const tagBreakdown: Record<string, number> = {};
      allFormTags.forEach(tag => {
        tagBreakdown[tag] = (tagBreakdown[tag] || 0) + 1;
      });

      // Analyze translation metadata
      const metadataKeys = new Set<string>();
      (translations || []).forEach(t => {
        if (t.context_metadata) {
          Object.keys(t.context_metadata).forEach(key => metadataKeys.add(key));
        }
      });

      return {
        wordId: word.id,
        italian: word.italian,
        dictionary: {
          tags: word.tags || [],
          tagCounts: word.tags ? word.tags.reduce((acc: any, tag: string) => {
            acc[tag] = 1;
            return acc;
          }, {}) : {}
        },
        forms: {
          totalCount: forms?.length || 0,
          tagBreakdown,
          sampleTags: (forms || []).slice(0, 5).map(f => f.tags || [])
        },
        translations: {
          totalCount: translations?.length || 0,
          metadataKeys: Array.from(metadataKeys),
          sampleMetadata: (translations || []).slice(0, 3).map(t => t.context_metadata)
        },
        formTranslations: {
          totalCount: formTranslations?.length || 0,
          coverageAnalysis: {
            translationsWithForms: translations?.filter(t => 
              formTranslations?.some(ft => ft.word_translation_id === t.id)
            ).length || 0
          }
        }
      };

    } catch (error: any) {
      console.error(`❌ Word tag analysis failed:`, error);
      throw new Error(`Failed to analyze word tags: ${error.message}`);
    }
  }

  /**
   * NEW: Get database schema dynamically
   */
  async getTableSchema(tableName: string): Promise<TableSchema> {
    if (this.schemaCache.has(tableName)) {
      return this.schemaCache.get(tableName)!;
    }

    console.log(`📋 Loading schema for table: ${tableName}`);

    try {
      const { data, error } = await this.supabase.rpc('get_table_schema', {
        table_name: tableName
      });

      if (error) {
        // Fallback to hardcoded schemas if function doesn't exist
        const schema = this.getFallbackSchema(tableName);
        this.schemaCache.set(tableName, schema);
        return schema;
      }

      const schema: TableSchema = {
        tableName,
        columns: data.map((col: any) => ({
          columnName: col.column_name,
          dataType: col.data_type,
          isArray: col.is_array || false,
          isJson: col.data_type === 'jsonb' || col.data_type === 'json',
          nullable: col.is_nullable === 'YES'
        }))
      };

      this.schemaCache.set(tableName, schema);
      return schema;

    } catch (error: any) {
      console.warn(`⚠️ Schema loading failed, using fallback:`, error);
      const schema = this.getFallbackSchema(tableName);
      this.schemaCache.set(tableName, schema);
      return schema;
    }
  }

  /**
   * NEW: Fallback schemas for when dynamic loading fails
   */
  private getFallbackSchema(tableName: string): TableSchema {
    const schemas: Record<string, TableSchema> = {
      dictionary: {
        tableName: 'dictionary',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'italian', dataType: 'text', isArray: false, isJson: false, nullable: false },
          { columnName: 'word_type', dataType: 'text', isArray: false, isJson: false, nullable: false },
          { columnName: 'tags', dataType: 'text', isArray: true, isJson: false, nullable: true },
          { columnName: 'created_at', dataType: 'timestamp', isArray: false, isJson: false, nullable: true },
          { columnName: 'updated_at', dataType: 'timestamp', isArray: false, isJson: false, nullable: true }
        ]
      },
      word_forms: {
        tableName: 'word_forms',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'word_id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'form_text', dataType: 'text', isArray: false, isJson: false, nullable: false },
          { columnName: 'form_type', dataType: 'text', isArray: false, isJson: false, nullable: true },
          { columnName: 'tags', dataType: 'text', isArray: true, isJson: false, nullable: true },
          { columnName: 'created_at', dataType: 'timestamp', isArray: false, isJson: false, nullable: true }
        ]
      },
      word_translations: {
        tableName: 'word_translations',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'word_id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'translation', dataType: 'text', isArray: false, isJson: false, nullable: false },
          { columnName: 'context_metadata', dataType: 'jsonb', isArray: false, isJson: true, nullable: true },
          { columnName: 'display_priority', dataType: 'integer', isArray: false, isJson: false, nullable: true },
          { columnName: 'created_at', dataType: 'timestamp', isArray: false, isJson: false, nullable: true }
        ]
      },
      form_translations: {
        tableName: 'form_translations',
        columns: [
          { columnName: 'id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'form_id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'word_translation_id', dataType: 'uuid', isArray: false, isJson: false, nullable: false },
          { columnName: 'translation', dataType: 'text', isArray: false, isJson: false, nullable: false }
        ]
      }
    };

    return schemas[tableName] || { tableName, columns: [] };
  }

  /**
   * ENHANCED: Preview with duplicate detection and word targeting
   */
  async previewMigration(
    rule: MigrationRule, 
    manualInputs?: Record<string, any>
  ): Promise<MigrationPreview> {
    console.log(`🔍 Previewing migration rule: ${rule.name}`);
    
    try {
      // Find affected rows (with word targeting)
      const affectedRows = await this.findAffectedRows(rule);
      
      // NEW: Analyze duplicates
      const duplicateAnalysis = await this.analyzeDuplicates(rule, affectedRows);
      
      // Generate SQL statements
      const sqlStatements = await this.generateSQL(rule, manualInputs, false);
      
      // Generate rollback SQL
      const rollbackSQL = await this.generateRollbackSQL(rule, affectedRows);
      
      // Sample preview data
      const previewData = affectedRows.slice(0, 10);
      
      // Safety analysis
      const safetyWarnings = await this.analyzeSafety(rule, affectedRows.length);
      
      // Add duplicate warnings
      if (duplicateAnalysis.wouldCreateDuplicates) {
        safetyWarnings.push(
          `Would create ${duplicateAnalysis.duplicateCount} duplicate tags (${duplicateAnalysis.affectedTags.join(', ')})`
        );
      }
      
      // Estimate duration
      const estimatedDuration = this.estimateExecutionTime(affectedRows.length, rule.transformation.type);
      
      // NEW: Get targeted words info
      let targetedWords: WordSearchResult[] = [];
      if (rule.pattern.targetWords?.length) {
        for (const wordText of rule.pattern.targetWords) {
          const words = await this.searchWords(wordText);
          targetedWords.push(...words);
        }
      }
      
      return {
        ruleId: rule.id,
        affectedRows: affectedRows.length,
        previewData,
        sqlStatements,
        rollbackSQL,
        estimatedDuration,
        safetyWarnings,
        targetedWords,
        duplicateAnalysis
      };
      
    } catch (error: any) {
      console.error(`❌ Preview failed for rule ${rule.id}:`, error);
      throw new Error(`Preview failed: ${error.message}`);
    }
  }

  /**
   * NEW: Analyze potential duplicate tags
   */
  private async analyzeDuplicates(rule: MigrationRule, affectedRows: any[]): Promise<{
    wouldCreateDuplicates: boolean;
    duplicateCount: number;
    affectedTags: string[];
  }> {
    if (rule.transformation.type !== 'array_replace' && rule.transformation.type !== 'array_add') {
      return { wouldCreateDuplicates: false, duplicateCount: 0, affectedTags: [] };
    }

    let duplicateCount = 0;
    const affectedTags = new Set<string>();

    for (const row of affectedRows) {
      const currentTags = row[rule.pattern.column] || [];
      
      if (rule.transformation.mappings) {
        for (const [oldTag, newTag] of Object.entries(rule.transformation.mappings)) {
          if (currentTags.includes(oldTag) && currentTags.includes(newTag)) {
            duplicateCount++;
            affectedTags.add(newTag);
          }
        }
      }
    }

    return {
      wouldCreateDuplicates: duplicateCount > 0,
      duplicateCount,
      affectedTags: Array.from(affectedTags)
    };
  }

  /**
   * ENHANCED: Find affected rows with word targeting
   */
  private async findAffectedRows(rule: MigrationRule): Promise<any[]> {
    let query = this.supabase.from(rule.pattern.table).select('*');
    
    // NEW: Apply word targeting first
    if (rule.pattern.targetWordIds?.length) {
      if (rule.pattern.table === 'dictionary') {
        query = query.in('id', rule.pattern.targetWordIds);
      } else if (['word_forms', 'word_translations'].includes(rule.pattern.table)) {
        query = query.in('word_id', rule.pattern.targetWordIds);
      } else if (rule.pattern.table === 'form_translations') {
        // For form_translations, need to join through word_translations
        const { data: targetTranslations } = await this.supabase
          .from('word_translations')
          .select('id')
          .in('word_id', rule.pattern.targetWordIds);
        
        if (targetTranslations?.length) {
          query = query.in('word_translation_id', targetTranslations.map(t => t.id));
        } else {
          return []; // No translations for target words
        }
      }
    }

    // Apply pattern conditions
    switch (rule.pattern.condition) {
      case 'array_contains':
        if (rule.transformation.mappings) {
          const searchTerms = Object.keys(rule.transformation.mappings);
          query = query.or(searchTerms.map(term => `${rule.pattern.column}.cs.{"${term}"}`).join(','));
        }
        break;
        
      case 'array_remove':
        if (rule.transformation.removals) {
          query = query.or(rule.transformation.removals.map(term => `${rule.pattern.column}.cs.{"${term}"}`).join(','));
        }
        break;
        
      case 'missing_key':
        query = query.is(`${rule.pattern.column}->>${rule.pattern.value}`, null);
        break;
        
      case 'equals':
        query = query.eq(rule.pattern.column, rule.pattern.value);
        break;
        
      case 'custom':
        if (rule.pattern.customSQL) {
          const { data, error } = await this.supabase.rpc('execute_custom_query', {
            query: rule.pattern.customSQL
          });
          if (error) throw error;
          return data || [];
        }
        break;
    }
    
    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to query affected rows: ${error.message}`);
    }
    
    return data || [];
  }

  /**
   * ENHANCED: Generate SQL with duplicate prevention and tag removal
   */
  private async generateSQL(
    rule: MigrationRule, 
    manualInputs?: Record<string, any>,
    forExecution: boolean = false
  ): Promise<string[]> {
    const statements: string[] = [];
    
    // Build WHERE clause for word targeting
    const whereClause = this.buildWhereClause(rule);
    
    switch (rule.transformation.type) {
      case 'array_replace':
        if (rule.transformation.mappings) {
          for (const [oldValue, newValue] of Object.entries(rule.transformation.mappings)) {
            if (rule.transformation.preventDuplicates) {
              // Prevent duplicates by checking if new value already exists
              statements.push(
                `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_replace(${rule.pattern.column}, '${oldValue}', '${newValue}') WHERE ${rule.pattern.column} ? '${oldValue}' AND NOT ${rule.pattern.column} ? '${newValue}'${whereClause};`
              );
            } else {
              statements.push(
                `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_replace(${rule.pattern.column}, '${oldValue}', '${newValue}') WHERE ${rule.pattern.column} ? '${oldValue}'${whereClause};`
              );
            }
          }
        }
        break;

      case 'array_add':
        if (rule.transformation.additions) {
          for (const [key, value] of Object.entries(rule.transformation.additions)) {
            if (rule.transformation.preventDuplicates) {
              statements.push(
                `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_append(${rule.pattern.column}, '${value}') WHERE NOT ${rule.pattern.column} ? '${value}'${whereClause};`
              );
            } else {
              statements.push(
                `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_append(${rule.pattern.column}, '${value}')${whereClause};`
              );
            }
          }
        }
        break;
        
      case 'array_remove':
        if (rule.transformation.removals) {
          for (const tagToRemove of rule.transformation.removals) {
            statements.push(
              `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_remove(${rule.pattern.column}, '${tagToRemove}') WHERE ${rule.pattern.column} ? '${tagToRemove}'${whereClause};`
            );
          }
        }
        break;
        
      case 'json_merge':
      case 'json_add':
        if (manualInputs || rule.transformation.additions) {
          const additions = manualInputs || rule.transformation.additions || {};
          const jsonAdditions = JSON.stringify(additions).replace(/'/g, "''");
          statements.push(
            `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = ${rule.pattern.column} || '${jsonAdditions}'::jsonb WHERE ${rule.pattern.column} IS NOT NULL${whereClause};`
          );
        }
        break;

      case 'json_remove':
        if (rule.transformation.removals) {
          for (const keyToRemove of rule.transformation.removals) {
            statements.push(
              `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = ${rule.pattern.column} - '${keyToRemove}' WHERE ${rule.pattern.column} ? '${keyToRemove}'${whereClause};`
            );
          }
        }
        break;
        
      case 'value_replace':
        statements.push(
          `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = '${rule.transformation.mappings?.new || ''}' WHERE ${rule.pattern.column} = '${rule.transformation.mappings?.old || ''}'${whereClause};`
        );
        break;
        
      case 'custom_sql':
        if (rule.transformation.customSQL) {
          statements.push(rule.transformation.customSQL);
        }
        break;
    }
    
    return statements;
  }

  /**
   * NEW: Build WHERE clause for word targeting
   */
  private buildWhereClause(rule: MigrationRule): string {
    if (!rule.pattern.targetWordIds?.length) {
      return '';
    }

    const wordIds = rule.pattern.targetWordIds.map(id => `'${id}'`).join(',');
    
    if (rule.pattern.table === 'dictionary') {
      return ` AND id IN (${wordIds})`;
    } else if (['word_forms', 'word_translations'].includes(rule.pattern.table)) {
      return ` AND word_id IN (${wordIds})`;
    } else if (rule.pattern.table === 'form_translations') {
      return ` AND word_translation_id IN (SELECT id FROM word_translations WHERE word_id IN (${wordIds}))`;
    }
    
    return '';
  }

  /**
   * Execute migration (enhanced with duplicate prevention)
   */
  async executeMigration(
    rule: MigrationRule,
    manualInputs?: Record<string, any>,
    skipSafetyChecks: boolean = false
  ): Promise<MigrationExecution> {
    const executionId = `${rule.id}_${Date.now()}`;
    console.log(`🚀 Executing migration rule: ${rule.name} (ID: ${executionId})`);
    
    const execution: MigrationExecution = {
      ruleId: rule.id,
      executionId,
      status: 'running',
      startTime: new Date(),
      affectedRows: 0,
      rollbackAvailable: false,
      targetedWords: rule.pattern.targetWords || []
    };
    
    this.executionLog.push(execution);
    
    try {
      // Safety checks
      if (!skipSafetyChecks) {
        await this.performSafetyChecks(rule, manualInputs);
      }
      
      // Create backup if required
      if (rule.rollbackStrategy.retainBackup) {
        await this.createBackup(rule);
      }
      
      // Preview to get duplicate count
      const preview = await this.previewMigration(rule, manualInputs);
      
      // Generate and execute SQL
      const sqlStatements = await this.generateSQL(rule, manualInputs, true);
      const results = await this.executeSQLStatements(sqlStatements);
      
      // Update execution status
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.affectedRows = results.totalAffectedRows;
      execution.rollbackAvailable = true;
      execution.duplicatesPreventedCount = preview.duplicateAnalysis?.duplicateCount || 0;
      
      console.log(`✅ Migration completed: ${execution.affectedRows} rows affected`);
      if (execution.duplicatesPreventedCount > 0) {
        console.log(`🛡️ Prevented ${execution.duplicatesPreventedCount} duplicate tags`);
      }
      
      return execution;
      
    } catch (error: any) {
      console.error(`❌ Migration failed:`, error);
      
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errorMessage = error.message;
      
      throw error;
    }
  }

  // ... (other existing methods remain the same)

  /**
   * Enhanced safety checks including duplicate detection
   */
  private async performSafetyChecks(rule: MigrationRule, manualInputs?: Record<string, any>): Promise<void> {
    for (const check of rule.safetyChecks) {
      switch (check.type) {
        case 'count_preview':
          const affected = await this.findAffectedRows(rule);
          if (check.threshold && affected.length > check.threshold) {
            throw new Error(`Safety check failed: ${affected.length} rows affected (threshold: ${check.threshold})`);
          }
          break;
          
        case 'duplicate_check':
          if (rule.transformation.preventDuplicates) {
            const affected = await this.findAffectedRows(rule);
            const duplicateAnalysis = await this.analyzeDuplicates(rule, affected);
            if (duplicateAnalysis.wouldCreateDuplicates && duplicateAnalysis.duplicateCount > (check.threshold || 0)) {
              throw new Error(`Duplicate check failed: Would create ${duplicateAnalysis.duplicateCount} duplicate tags`);
            }
          }
          break;
          
        case 'validate_targets':
          if (rule.transformation.mappings) {
            for (const newValue of Object.values(rule.transformation.mappings)) {
              if (typeof newValue === 'string' && newValue.length === 0) {
                throw new Error(`Safety check failed: Empty replacement value detected`);
              }
            }
          }
          break;
      }
    }
  }

  // ... (remaining methods from original implementation)
  
  /**
   * Get execution history
   */
  getExecutionHistory(): MigrationExecution[] {
    return [...this.executionLog];
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): MigrationExecution | null {
    return this.executionLog.find(exec => exec.executionId === executionId) || null;
  }

  /**
   * Clear schema cache (useful for development)
   */
  clearSchemaCache(): void {
    this.schemaCache.clear();
  }

  // ... (implement remaining methods from original - generateRollbackSQL, analyzeSafety, etc.)
  private async generateRollbackSQL(rule: MigrationRule, affectedRows: any[]): Promise<string[]> {
    const statements: string[] = [];
    
    switch (rule.rollbackStrategy.type) {
      case 'reverse_transformation':
        if (rule.transformation.type === 'array_replace' && rule.transformation.mappings) {
          for (const [oldValue, newValue] of Object.entries(rule.transformation.mappings)) {
            statements.push(
              `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_replace(${rule.pattern.column}, '${newValue}', '${oldValue}') WHERE ${rule.pattern.column} ? '${newValue}';`
            );
          }
        }
        break;
        
      case 'restore_backup':
        statements.push(`SELECT restore_table_from_backup('${rule.pattern.table}');`);
        break;
        
      case 'custom_sql':
        if (rule.rollbackStrategy.customSQL) {
          statements.push(rule.rollbackStrategy.customSQL);
        }
        break;
    }
    
    return statements;
  }

  private async analyzeSafety(rule: MigrationRule, affectedRowCount: number): Promise<string[]> {
    const warnings: string[] = [];
    
    if (affectedRowCount > 100) {
      warnings.push(`High impact: ${affectedRowCount} rows will be modified`);
    }
    
    if (rule.transformation.type === 'custom_sql') {
      warnings.push('Custom SQL requires careful review');
    }
    
    if (rule.pattern.table === 'word_forms' && affectedRowCount > 50) {
      warnings.push('Large number of word forms affected - verify impact on learning system');
    }
    
    return warnings;
  }

  private estimateExecutionTime(rowCount: number, operationType: string): string {
    let baseTimeMs = 0;
    
    switch (operationType) {
      case 'array_replace':
        baseTimeMs = rowCount * 2;
        break;
      case 'json_merge':
        baseTimeMs = rowCount * 5;
        break;
      default:
        baseTimeMs = rowCount * 1;
    }
    
    if (baseTimeMs < 1000) {
      return `${baseTimeMs}ms`;
    } else if (baseTimeMs < 60000) {
      return `${Math.round(baseTimeMs / 1000)}s`;
    } else {
      return `${Math.round(baseTimeMs / 60000)}m`;
    }
  }

  private async executeSQLStatements(statements: string[]): Promise<{ totalAffectedRows: number }> {
    let totalAffectedRows = 0;
    
    for (const statement of statements) {
      console.log(`🔧 Executing: ${statement}`);
      const { data, error } = await this.supabase.rpc('execute_migration_sql', {
        sql_statement: statement
      });
      
      if (error) {
        throw new Error(`SQL execution failed: ${error.message}`);
      }
      
      totalAffectedRows += data?.affected_rows || 0;
    }
    
    return { totalAffectedRows };
  }

  private async createBackup(rule: MigrationRule): Promise<void> {
    const backupTableName = `${rule.pattern.table}_backup_${Date.now()}`;
    const { error } = await this.supabase.rpc('create_table_backup', {
      source_table: rule.pattern.table,
      backup_table: backupTableName
    });
    
    if (error) {
      throw new Error(`Backup creation failed: ${error.message}`);
    }
    
    console.log(`📦 Backup created: ${backupTableName}`);
  }
}

console.log('✅ Enhanced Migration Rule Engine loaded');
console.log('🎯 New features: Word targeting, duplicate prevention, dynamic schemas, tag deletion');
console.log('📊 Supports precise, surgical database migrations with advanced safety checks');

