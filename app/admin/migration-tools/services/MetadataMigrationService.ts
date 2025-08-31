/**
 * MetadataMigrationService - Systematic metadata migration with safety features
 * Handles the complete migration from string-based to metaval stable ID system
 */

import { supabase } from '../../../../lib/supabase';
import { MetavalMappingService, MigrationResult } from './MetavalMappingService';

export interface MigrationPlan {
  tables: string[];
  expectedRecords: Record<string, number>;
  estimatedSizeReduction: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  requiresConfirmation: boolean;
}

export interface MigrationExecution {
  id: string;
  plan: MigrationPlan;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed' | 'rolled-back';
  results: Record<string, TableMigrationResult>;
  rollbackData: Record<string, any[]>;
  totalRecordsMigrated: number;
  totalSizeReduction: number;
  errors: string[];
}

export interface TableMigrationResult {
  tableName: string;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  sizeReduction: number;
  executionTime: number;
  errors: string[];
  warnings: string[];
}

export class MetadataMigrationService {
  private mappingService: MetavalMappingService;
  private currentExecution: MigrationExecution | null = null;

  constructor() {
    this.mappingService = new MetavalMappingService();
  }

  /**
   * Create comprehensive migration plan
   */
  async createMigrationPlan(tables: string[] = ['dictionary', 'word_forms', 'word_translations', 'form_translations']): Promise<MigrationPlan> {
    await this.mappingService.initialize();

    const plan: MigrationPlan = {
      tables,
      expectedRecords: {},
      estimatedSizeReduction: {},
      riskLevel: 'low',
      warnings: [],
      requiresConfirmation: false
    };

    try {
      for (const table of tables) {
        // Get record count with metadata
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .not('metadata', 'is', null)
          .neq('metadata', '{}');

        plan.expectedRecords[table] = count || 0;

        // Get size reduction estimate
        if (count && count > 0) {
          const preview = await this.mappingService.previewMigration(table, 5);
          plan.estimatedSizeReduction[table] = preview.estimatedSizeReduction;
          plan.warnings.push(...preview.warnings);
        }
      }

      // Calculate overall risk level
      const totalRecords = Object.values(plan.expectedRecords).reduce((sum, count) => sum + count, 0);
      if (totalRecords > 1000) {
        plan.riskLevel = 'high';
        plan.requiresConfirmation = true;
        plan.warnings.push('Large migration: >1000 records will be modified');
      } else if (totalRecords > 100) {
        plan.riskLevel = 'medium';
        plan.requiresConfirmation = true;
      }

      // Check for unknown attributes
      const unknownAttributeWarnings = plan.warnings.filter(w => w.includes('Unknown attribute'));
      if (unknownAttributeWarnings.length > 5) {
        plan.riskLevel = 'high';
        plan.warnings.push(`${unknownAttributeWarnings.length} unknown attributes detected - review mapping completeness`);
      }

      console.log('Migration plan created:', {
        tables: plan.tables,
        totalRecords,
        riskLevel: plan.riskLevel,
        warningsCount: plan.warnings.length
      });

      return plan;

    } catch (error) {
      console.error('Failed to create migration plan:', error);
      throw error;
    }
  }

  /**
   * Execute migration with comprehensive safety features
   */
  async executeMigration(plan: MigrationPlan, options: {
    dryRun?: boolean;
    batchSize?: number;
    createBackup?: boolean;
  } = {}): Promise<MigrationExecution> {
    const { dryRun = false, batchSize = 50, createBackup = true } = options;

    // Create execution tracking
    this.currentExecution = {
      id: `migration_${Date.now()}`,
      plan,
      startedAt: new Date(),
      status: 'running',
      results: {},
      rollbackData: {},
      totalRecordsMigrated: 0,
      totalSizeReduction: 0,
      errors: []
    };

    try {
      console.log(`Starting migration ${this.currentExecution.id} (${dryRun ? 'DRY RUN' : 'LIVE'}):`);

      for (const tableName of plan.tables) {
        console.log(`Processing table: ${tableName}`);
        
        const tableResult = await this.migrateTable(
          tableName, 
          { dryRun, batchSize, createBackup }
        );

        this.currentExecution.results[tableName] = tableResult;
        this.currentExecution.totalRecordsMigrated += tableResult.recordsSuccessful;
        
        if (tableResult.errors.length > 0) {
          this.currentExecution.errors.push(...tableResult.errors);
        }
      }

      // Calculate overall size reduction
      const totalOriginalSize = Object.values(this.currentExecution.results)
        .reduce((sum, result) => sum + (result.sizeReduction * result.recordsProcessed), 0);
      const totalResults = Object.values(this.currentExecution.results)
        .reduce((sum, result) => sum + result.recordsProcessed, 0);
      
      this.currentExecution.totalSizeReduction = totalResults > 0 
        ? Math.round(totalOriginalSize / totalResults) 
        : 0;

      this.currentExecution.completedAt = new Date();
      this.currentExecution.status = this.currentExecution.errors.length > 0 ? 'failed' : 'completed';

      console.log(`Migration ${this.currentExecution.id} completed:`, {
        status: this.currentExecution.status,
        recordsMigrated: this.currentExecution.totalRecordsMigrated,
        errors: this.currentExecution.errors.length
      });

      return this.currentExecution;

    } catch (error) {
      if (this.currentExecution) {
        this.currentExecution.status = 'failed';
        this.currentExecution.completedAt = new Date();
        this.currentExecution.errors.push(`Migration failed: ${error}`);
      }
      console.error('Migration execution failed:', error);
      throw error;
    }
  }

  /**
   * Migrate a single table
   */
  private async migrateTable(
    tableName: string,
    options: { dryRun: boolean; batchSize: number; createBackup: boolean }
  ): Promise<TableMigrationResult> {
    const startTime = Date.now();
    const result: TableMigrationResult = {
      tableName,
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      sizeReduction: 0,
      executionTime: 0,
      errors: [],
      warnings: []
    };

    try {
      // Get all records with metadata
      const { data: records, error: fetchError } = await supabase
        .from(tableName)
        .select('id, metadata')
        .not('metadata', 'is', null)
        .neq('metadata', '{}');

      if (fetchError) {
        throw new Error(`Failed to fetch records from ${tableName}: ${fetchError.message}`);
      }

      if (!records || records.length === 0) {
        console.log(`No records to migrate in ${tableName}`);
        return result;
      }

      result.recordsProcessed = records.length;
      
      // Create backup if requested
      if (options.createBackup && !options.dryRun) {
        await this.createTableBackup(tableName, records);
      }

      // Process in batches
      const batches = this.chunkArray(records, options.batchSize);
      let totalSizeReduction = 0;

      for (const batch of batches) {
        const batchResults = await this.mappingService.batchMigrateMetadata(
          batch.map(record => ({ id: record.id, metadata: record.metadata }))
        );

        for (const { id, result: migrationResult } of batchResults) {
          if (migrationResult.success) {
            result.recordsSuccessful++;
            totalSizeReduction += migrationResult.sizeReduction;

            // Update database if not dry run
            if (!options.dryRun) {
              const { error: updateError } = await supabase
                .from(tableName)
                .update({ metadata: migrationResult.migratedMetadata })
                .eq('id', id);

              if (updateError) {
                result.recordsFailed++;
                result.errors.push(`Failed to update record ${id}: ${updateError.message}`);
              }
            }

            result.warnings.push(...migrationResult.warnings);
          } else {
            result.recordsFailed++;
            result.errors.push(`Migration failed for record ${id}: ${migrationResult.errors.join(', ')}`);
          }
        }
      }

      result.sizeReduction = result.recordsSuccessful > 0 
        ? Math.round(totalSizeReduction / result.recordsSuccessful)
        : 0;

      result.executionTime = Date.now() - startTime;

      console.log(`Table ${tableName} migration completed:`, {
        processed: result.recordsProcessed,
        successful: result.recordsSuccessful,
        failed: result.recordsFailed,
        sizeReduction: result.sizeReduction,
        executionTime: result.executionTime
      });

      return result;

    } catch (error) {
      result.errors.push(`Table migration failed: ${error}`);
      result.executionTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Create backup of original data for rollback
   */
  private async createTableBackup(tableName: string, records: any[]): Promise<void> {
    if (!this.currentExecution) return;

    try {
      this.currentExecution.rollbackData[tableName] = records.map(record => ({
        id: record.id,
        original_metadata: record.metadata
      }));

      console.log(`Created backup for ${tableName}: ${records.length} records`);
    } catch (error) {
      console.error(`Failed to create backup for ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Rollback migration using saved backup data
   */
  async rollbackMigration(executionId: string): Promise<void> {
    if (!this.currentExecution || this.currentExecution.id !== executionId) {
      throw new Error('No active migration to rollback');
    }

    try {
      console.log(`Rolling back migration ${executionId}`);

      for (const [tableName, backupRecords] of Object.entries(this.currentExecution.rollbackData)) {
        console.log(`Rolling back ${tableName}: ${backupRecords.length} records`);

        for (const backupRecord of backupRecords) {
          const { error } = await supabase
            .from(tableName)
            .update({ metadata: backupRecord.original_metadata })
            .eq('id', backupRecord.id);

          if (error) {
            console.error(`Failed to rollback record ${backupRecord.id}:`, error);
          }
        }
      }

      this.currentExecution.status = 'rolled-back';
      console.log(`Migration ${executionId} rolled back successfully`);

    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Get current execution status
   */
  getCurrentExecution(): MigrationExecution | null {
    return this.currentExecution;
  }

  /**
   * Utility: Chunk array into batches
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}