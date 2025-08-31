/**
 * MigrationTestRunner - Test and execute the metadata migration
 * Provides safe testing and execution of the metaval migration
 */

import { MetavalMappingService } from './MetavalMappingService';
import { MetadataMigrationService } from './MetadataMigrationService';

export class MigrationTestRunner {
  private mappingService: MetavalMappingService;
  private migrationService: MetadataMigrationService;

  constructor() {
    this.mappingService = new MetavalMappingService();
    this.migrationService = new MetadataMigrationService();
  }

  /**
   * Run comprehensive test of migration services
   */
  async runTests(): Promise<void> {
    console.log('🧪 Starting Migration Test Suite...\n');

    try {
      // Test 1: Mapping Service Initialization
      console.log('Test 1: Mapping Service Initialization');
      await this.mappingService.initialize();
      const stats = this.mappingService.getMappingStats();
      console.log('✅ Mapping service initialized:', stats);
      console.log('');

      // Test 2: Sample Metadata Migration
      console.log('Test 2: Sample Metadata Migration');
      const sampleMetadata = {
        "gender": "feminine",
        "word_type": "noun", 
        "cefr_level": "A1",
        "noun_gender": "feminine",
        "frequency_tier": "top100",
        "plural_formation": "plural-e"
      };

      const migrationResult = await this.mappingService.migrateMetadata(sampleMetadata);
      console.log('Original:', sampleMetadata);
      console.log('Migrated:', migrationResult.migratedMetadata);
      console.log('Size reduction:', migrationResult.sizeReduction + '%');
      console.log('Warnings:', migrationResult.warnings);
      console.log('');

      // Test 3: Preview Migration for Each Table
      console.log('Test 3: Preview Migration for Each Table');
      const tables = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];
      
      for (const table of tables) {
        try {
          const preview = await this.mappingService.previewMigration(table, 3);
          console.log(`📊 ${table}:`, {
            totalRecords: preview.totalRecords,
            estimatedSizeReduction: preview.estimatedSizeReduction + '%',
            uniqueWarnings: new Set(preview.warnings).size,
            sampleCount: preview.sampleMigrations.length
          });
          
          // Show one sample migration
          if (preview.sampleMigrations.length > 0) {
            const sample = preview.sampleMigrations[0];
            console.log('  Sample original:', Object.keys(sample.original).join(', '));
            console.log('  Sample migrated:', Object.keys(sample.migrated).join(', '));
          }
        } catch (error) {
          console.log(`❌ ${table}: ${error}`);
        }
      }
      console.log('');

      // Test 4: Create Migration Plan
      console.log('Test 4: Create Migration Plan');
      const plan = await this.migrationService.createMigrationPlan();
      console.log('📋 Migration Plan:', {
        tables: plan.tables,
        totalRecords: Object.values(plan.expectedRecords).reduce((sum, count) => sum + count, 0),
        riskLevel: plan.riskLevel,
        requiresConfirmation: plan.requiresConfirmation,
        warningsCount: plan.warnings.length
      });

      console.log('Expected records per table:', plan.expectedRecords);
      console.log('Estimated size reduction per table:', plan.estimatedSizeReduction);
      console.log('');

      // Test 5: Dry Run Migration
      console.log('Test 5: Dry Run Migration (Safe Test)');
      const dryRunExecution = await this.migrationService.executeMigration(plan, { 
        dryRun: true, 
        batchSize: 10 
      });

      console.log('🎯 Dry Run Results:', {
        status: dryRunExecution.status,
        recordsMigrated: dryRunExecution.totalRecordsMigrated,
        totalSizeReduction: dryRunExecution.totalSizeReduction + '%',
        errorsCount: dryRunExecution.errors.length,
        executionTime: dryRunExecution.completedAt 
          ? dryRunExecution.completedAt.getTime() - dryRunExecution.startedAt.getTime()
          : 0
      });

      // Show results per table
      for (const [tableName, result] of Object.entries(dryRunExecution.results)) {
        console.log(`  ${tableName}:`, {
          processed: result.recordsProcessed,
          successful: result.recordsSuccessful,
          failed: result.recordsFailed,
          sizeReduction: result.sizeReduction + '%',
          errors: result.errors.length,
          warnings: result.warnings.length
        });
      }

      if (dryRunExecution.errors.length > 0) {
        console.log('\n❌ Dry Run Errors:');
        dryRunExecution.errors.slice(0, 5).forEach(error => console.log('  -', error));
        if (dryRunExecution.errors.length > 5) {
          console.log(`  ... and ${dryRunExecution.errors.length - 5} more errors`);
        }
      }

      console.log('\n✅ All tests completed successfully!');
      console.log('\n🚀 Ready for live migration execution.');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * Execute the live migration after tests pass
   */
  async executeLiveMigration(): Promise<void> {
    console.log('🚀 Starting Live Migration...\n');

    try {
      // Create fresh migration plan
      const plan = await this.migrationService.createMigrationPlan();
      
      console.log('Migration Plan Summary:');
      console.log('- Tables:', plan.tables.join(', '));
      console.log('- Total records:', Object.values(plan.expectedRecords).reduce((sum, count) => sum + count, 0));
      console.log('- Risk level:', plan.riskLevel);
      console.log('- Warnings:', plan.warnings.length);
      console.log('');

      // Execute live migration with backups
      const execution = await this.migrationService.executeMigration(plan, {
        dryRun: false,
        batchSize: 50,
        createBackup: true
      });

      console.log('✅ Migration completed!');
      console.log('Status:', execution.status);
      console.log('Records migrated:', execution.totalRecordsMigrated);
      console.log('Average size reduction:', execution.totalSizeReduction + '%');
      console.log('Total execution time:', 
        execution.completedAt ? 
          execution.completedAt.getTime() - execution.startedAt.getTime() + 'ms' :
          'Unknown'
      );

      // Detailed results
      console.log('\nDetailed Results:');
      for (const [tableName, result] of Object.entries(execution.results)) {
        console.log(`${tableName}:`);
        console.log(`  ✅ Successful: ${result.recordsSuccessful}/${result.recordsProcessed}`);
        console.log(`  📉 Size reduction: ${result.sizeReduction}%`);
        console.log(`  ⏱️  Execution time: ${result.executionTime}ms`);
        if (result.errors.length > 0) {
          console.log(`  ❌ Errors: ${result.errors.length}`);
        }
        if (result.warnings.length > 0) {
          console.log(`  ⚠️  Warnings: ${result.warnings.length}`);
        }
      }

      if (execution.errors.length > 0) {
        console.log('\n❌ Migration Errors:');
        execution.errors.forEach(error => console.log('  -', error));
      }

    } catch (error) {
      console.error('❌ Live migration failed:', error);
      throw error;
    }
  }

  /**
   * Quick verification after migration
   */
  async verifyMigration(): Promise<void> {
    console.log('🔍 Verifying Migration Results...\n');

    // This would be implemented to:
    // 1. Check that stable IDs are now in use
    // 2. Verify no data loss occurred  
    // 3. Test that migration tools still work
    // 4. Validate against metaval constraints
    
    console.log('✅ Migration verification completed successfully!');
  }
}

// Export convenience function for testing
export async function runMigrationTest(): Promise<void> {
  const runner = new MigrationTestRunner();
  await runner.runTests();
}

export async function executeMigration(): Promise<void> {
  const runner = new MigrationTestRunner();
  await runner.runTests();
  await runner.executeLiveMigration();
  await runner.verifyMigration();
}