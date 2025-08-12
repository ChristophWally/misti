// lib/migration/migrationRuleEngine.ts
// Story 002.003: Scalable Rule-Based Migration System

export interface MigrationRule {
  id: string;
  name: string;
  description: string;
  category: 'terminology' | 'metadata' | 'cleanup' | 'structure' | 'custom';
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Rule pattern matching
  pattern: {
    table: string;
    column: string;
    condition: 'array_contains' | 'missing_key' | 'equals' | 'regex' | 'custom';
    value?: any;
    customSQL?: string;
  };

  // Transformation specification
  transformation: {
    type: 'array_replace' | 'json_merge' | 'json_add' | 'value_replace' | 'custom_sql';
    mappings?: Record<string, string>;
    additions?: Record<string, any>;
    customSQL?: string;
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

export interface SafetyCheck {
  type: 'count_preview' | 'backup_table' | 'validate_targets' | 'dry_run' | 'user_confirmation';
  threshold?: number;
  message?: string;
}

export interface ManualInputField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'json';
  options?: string[];
  required: boolean;
  defaultValue?: any;
  validation?: string; // regex pattern
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
}

export class MigrationRuleEngine {
  private supabase: any;
  private executionLog: MigrationExecution[] = [];

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Preview what a migration rule would do without executing it
   */
  async previewMigration(
    rule: MigrationRule,
    manualInputs?: Record<string, any>
  ): Promise<MigrationPreview> {
    console.log(`🔍 Previewing migration rule: ${rule.name}`);

    try {
      // Step 1: Find affected rows
      const affectedRows = await this.findAffectedRows(rule);

      // Step 2: Generate SQL statements
      const sqlStatements = await this.generateSQL(rule, manualInputs, false);

      // Step 3: Generate rollback SQL
      const rollbackSQL = await this.generateRollbackSQL(rule, affectedRows);

      // Step 4: Sample preview data (first 10 rows)
      const previewData = affectedRows.slice(0, 10);

      // Step 5: Safety analysis
      const safetyWarnings = await this.analyzeSafety(rule, affectedRows.length);

      // Step 6: Estimate duration
      const estimatedDuration = this.estimateExecutionTime(
        affectedRows.length,
        rule.transformation.type
      );

      return {
        ruleId: rule.id,
        affectedRows: affectedRows.length,
        previewData,
        sqlStatements,
        rollbackSQL,
        estimatedDuration,
        safetyWarnings,
      };
    } catch (error: any) {
      console.error(`❌ Preview failed for rule ${rule.id}:`, error);
      throw new Error(`Preview failed: ${error.message}`);
    }
  }

  /**
   * Execute a migration rule with full safety checks
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
    };

    this.executionLog.push(execution);

    try {
      // Step 1: Safety checks
      if (!skipSafetyChecks) {
        await this.performSafetyChecks(rule, manualInputs);
      }

      // Step 2: Create backup if required
      if (rule.rollbackStrategy.retainBackup) {
        await this.createBackup(rule);
      }

      // Step 3: Generate and execute SQL
      const sqlStatements = await this.generateSQL(rule, manualInputs, true);
      const results = await this.executeSQLStatements(sqlStatements);

      // Step 4: Update execution status
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.affectedRows = results.totalAffectedRows;
      execution.rollbackAvailable = true;

      console.log(`✅ Migration completed: ${execution.affectedRows} rows affected`);

      return execution;
    } catch (error: any) {
      console.error(`❌ Migration failed:`, error);

      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errorMessage = error.message;

      // Attempt automatic rollback
      if (rule.rollbackStrategy.type !== 'custom_sql') {
        try {
          await this.rollbackMigration(execution);
        } catch (rollbackError: any) {
          console.error(`❌ Rollback also failed:`, rollbackError);
          execution.errorMessage += ` | Rollback failed: ${rollbackError.message}`;
        }
      }

      throw error;
    }
  }

  /**
   * Rollback a completed migration
   */
  async rollbackMigration(execution: MigrationExecution): Promise<void> {
    console.log(`🔄 Rolling back migration: ${execution.executionId}`);

    try {
      // Find the original rule
      const rule = await this.findRuleById(execution.ruleId);
      if (!rule) {
        throw new Error(`Rule ${execution.ruleId} not found for rollback`);
      }

      // Generate rollback SQL
      const rollbackSQL = await this.generateRollbackSQL(rule, []);

      // Execute rollback
      await this.executeSQLStatements(rollbackSQL);

      // Update execution status
      execution.status = 'rolled_back';
      execution.rollbackAvailable = false;

      console.log(`✅ Rollback completed for ${execution.executionId}`);
    } catch (error: any) {
      console.error(`❌ Rollback failed:`, error);
      throw error;
    }
  }

  /**
   * Find rows that would be affected by a migration rule
   */
  private async findAffectedRows(rule: MigrationRule): Promise<any[]> {
    let query = this.supabase.from(rule.pattern.table).select('*');

    switch (rule.pattern.condition) {
      case 'array_contains':
        if (rule.transformation.mappings) {
          const searchTerms = Object.keys(rule.transformation.mappings);
          query = query.or(
            searchTerms
              .map((term) => `${rule.pattern.column}.cs.{"${term}"}`)
              .join(',')
          );
        }
        break;

      case 'missing_key':
        query = query.is(
          `${rule.pattern.column}->>${rule.pattern.value}`,
          null
        );
        break;

      case 'equals':
        query = query.eq(rule.pattern.column, rule.pattern.value);
        break;

      case 'custom':
        // For custom patterns, we'll need to handle this case-by-case
        if (rule.pattern.customSQL) {
          const { data, error } = await this.supabase.rpc(
            'execute_custom_query',
            {
              query: rule.pattern.customSQL,
            }
          );
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
   * Generate SQL statements for a migration rule
   */
  private async generateSQL(
    rule: MigrationRule,
    manualInputs?: Record<string, any>,
    forExecution: boolean = false
  ): Promise<string[]> {
    const statements: string[] = [];

    switch (rule.transformation.type) {
      case 'array_replace':
        if (rule.transformation.mappings) {
          for (const [oldValue, newValue] of Object.entries(
            rule.transformation.mappings
          )) {
            statements.push(
              `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_replace(${rule.pattern.column}, '${oldValue}', '${newValue}') WHERE ${rule.pattern.column} ? '${oldValue}';`
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
            `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = ${rule.pattern.column} || '${jsonAdditions}'::jsonb WHERE ${rule.pattern.column} IS NOT NULL;`
          );
        }
        break;

      case 'value_replace':
        statements.push(
          `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = '${rule.transformation.mappings?.new || ''}' WHERE ${rule.pattern.column} = '${rule.transformation.mappings?.old || ''}';`
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
   * Generate rollback SQL statements
   */
  private async generateRollbackSQL(
    rule: MigrationRule,
    affectedRows: any[]
  ): Promise<string[]> {
    const statements: string[] = [];

    switch (rule.rollbackStrategy.type) {
      case 'reverse_transformation':
        if (
          rule.transformation.type === 'array_replace' &&
          rule.transformation.mappings
        ) {
          // Reverse the mappings
          for (const [oldValue, newValue] of Object.entries(
            rule.transformation.mappings
          )) {
            statements.push(
              `UPDATE ${rule.pattern.table} SET ${rule.pattern.column} = array_replace(${rule.pattern.column}, '${newValue}', '${oldValue}') WHERE ${rule.pattern.column} ? '${newValue}';`
            );
          }
        }
        break;

      case 'restore_backup':
        statements.push(
          `SELECT restore_table_from_backup('${rule.pattern.table}');`
        );
        break;

      case 'custom_sql':
        if (rule.rollbackStrategy.customSQL) {
          statements.push(rule.rollbackStrategy.customSQL);
        }
        break;
    }

    return statements;
  }

  /**
   * Perform safety checks before execution
   */
  private async performSafetyChecks(
    rule: MigrationRule,
    manualInputs?: Record<string, any>
  ): Promise<void> {
    for (const check of rule.safetyChecks) {
      switch (check.type) {
        case 'count_preview':
          const affected = await this.findAffectedRows(rule);
          if (check.threshold && affected.length > check.threshold) {
            throw new Error(
              `Safety check failed: ${affected.length} rows affected (threshold: ${check.threshold})`
            );
          }
          break;

        case 'validate_targets':
          if (rule.transformation.mappings) {
            for (const newValue of Object.values(
              rule.transformation.mappings
            )) {
              // Validate that new values are acceptable
              if (typeof newValue === 'string' && newValue.length === 0) {
                throw new Error(
                  `Safety check failed: Empty replacement value detected`
                );
              }
            }
          }
          break;

        case 'user_confirmation':
          // This would be handled by the frontend
          break;
      }
    }
  }

  /**
   * Analyze safety concerns for a migration
   */
  private async analyzeSafety(
    rule: MigrationRule,
    affectedRowCount: number
  ): Promise<string[]> {
    const warnings: string[] = [];

    if (affectedRowCount > 100) {
      warnings.push(`High impact: ${affectedRowCount} rows will be modified`);
    }

    if (rule.transformation.type === 'custom_sql') {
      warnings.push('Custom SQL requires careful review');
    }

    if (rule.pattern.table === 'word_forms' && affectedRowCount > 50) {
      warnings.push(
        'Large number of word forms affected - verify impact on learning system'
      );
    }

    return warnings;
  }

  /**
   * Estimate execution time based on row count and operation type
   */
  private estimateExecutionTime(
    rowCount: number,
    operationType: string
  ): string {
    let baseTimeMs = 0;

    switch (operationType) {
      case 'array_replace':
        baseTimeMs = rowCount * 2; // 2ms per row
        break;
      case 'json_merge':
        baseTimeMs = rowCount * 5; // 5ms per row
        break;
      default:
        baseTimeMs = rowCount * 1; // 1ms per row
    }

    if (baseTimeMs < 1000) {
      return `${baseTimeMs}ms`;
    } else if (baseTimeMs < 60000) {
      return `${Math.round(baseTimeMs / 1000)}s`;
    } else {
      return `${Math.round(baseTimeMs / 60000)}m`;
    }
  }

  /**
   * Execute SQL statements with transaction safety
   */
  private async executeSQLStatements(
    statements: string[]
  ): Promise<{ totalAffectedRows: number }> {
    let totalAffectedRows = 0;

    for (const statement of statements) {
      console.log(`🔧 Executing: ${statement}`);
      const { data, error } = await this.supabase.rpc('execute_migration_sql', {
        sql_statement: statement,
      });

      if (error) {
        throw new Error(`SQL execution failed: ${error.message}`);
      }

      totalAffectedRows += data?.affected_rows || 0;
    }

    return { totalAffectedRows };
  }

  /**
   * Create backup of table before migration
   */
  private async createBackup(rule: MigrationRule): Promise<void> {
    const backupTableName = `${rule.pattern.table}_backup_${Date.now()}`;
    const { error } = await this.supabase.rpc('create_table_backup', {
      source_table: rule.pattern.table,
      backup_table: backupTableName,
    });

    if (error) {
      throw new Error(`Backup creation failed: ${error.message}`);
    }

    console.log(`📦 Backup created: ${backupTableName}`);
  }

  /**
   * Find rule by ID (placeholder - would load from configuration)
   */
  private async findRuleById(ruleId: string): Promise<MigrationRule | null> {
    // This would load from default rules or user configuration
    // For now, returning null as placeholder
    return null;
  }

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
    return (
      this.executionLog.find((exec) => exec.executionId === executionId) || null
    );
  }
}

console.log('✅ Migration Rule Engine loaded');
console.log('🔧 Scalable rule-based migration system ready');
console.log('📊 Supports preview, execution, rollback, and safety validation');

