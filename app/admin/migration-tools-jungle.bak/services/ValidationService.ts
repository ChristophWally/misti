'use client';

import { DatabaseService } from './DatabaseService';

export interface ValidationResults {
  [tableName: string]: {
    status: 'success' | 'error';
    mandatoryCount?: number;
    optionalCount?: number;
    legacyCount?: number;
    totalCount?: number;
    error?: string;
  };
}

export interface SystemValidationResults {
  connectionTest: {
    status: 'success' | 'error';
    message: string;
  };
  metadataTests: ValidationResults;
  step2Test: {
    status: 'success' | 'error';
    message: string;
    details?: any;
  };
  timestamp: string;
}

export class ValidationService {
  private databaseService: DatabaseService;
  private debugLog: (message: string) => void;

  constructor(debugLog?: (message: string) => void) {
    this.debugLog = debugLog || ((msg) => console.log(msg));
    this.databaseService = new DatabaseService(this.debugLog);
  }

  // Validate metadata extraction from all tables
  async validateMetadataExtraction(): Promise<ValidationResults> {
    this.debugLog('🧪 Starting metadata extraction validation...');
    
    const results: ValidationResults = {};
    const testTables = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];
    
    for (const tableName of testTables) {
      try {
        this.debugLog(`🔍 Testing metadata extraction for ${tableName}...`);
        
        // Get sample records for testing
        const sampleIds = await this.databaseService.getSampleRecordIds(tableName, 3);
        
        if (sampleIds.length === 0) {
          results[tableName] = {
            status: 'error',
            error: 'No sample records found'
          };
          continue;
        }
        
        // Test unified metadata extraction
        const metadata = await this.databaseService.extractAvailableMetadata(tableName, sampleIds);
        
        results[tableName] = {
          status: 'success',
          mandatoryCount: metadata.fromMetadata.length,
          optionalCount: metadata.fromOptionalTags.length,
          legacyCount: metadata.fromLegacyTags.length,
          totalCount: metadata.combined.length
        };
        
        this.debugLog(`✅ ${tableName}: ${metadata.combined.length} total metadata items found`);
        
      } catch (error: any) {
        results[tableName] = {
          status: 'error',
          error: error.message
        };
        this.debugLog(`❌ ${tableName} validation failed: ${error.message}`);
      }
    }
    
    this.debugLog('🎯 Metadata extraction validation completed');
    return results;
  }

  // Simulate Step 2 loading to ensure it works correctly
  async simulateStep2Loading(): Promise<{ status: 'success' | 'error', message: string, details?: any }> {
    this.debugLog('🔄 Simulating Step 2 metadata loading...');
    
    try {
      const testCases = [
        { table: 'dictionary', description: 'Dictionary metadata + optional_tags + legacy tags' },
        { table: 'word_forms', description: 'Word forms metadata + optional_tags + legacy tags' },
        { table: 'word_translations', description: 'Word translations metadata + optional_tags' },
        { table: 'form_translations', description: 'Form translations metadata + optional_tags' }
      ];

      const results = [];

      for (const testCase of testCases) {
        const sampleIds = await this.databaseService.getSampleRecordIds(testCase.table, 2);
        
        if (sampleIds.length > 0) {
          const metadata = await this.databaseService.extractAvailableMetadata(testCase.table, sampleIds);
          
          results.push({
            table: testCase.table,
            description: testCase.description,
            sampleCount: sampleIds.length,
            mandatoryTags: metadata.fromMetadata.length,
            optionalTags: metadata.fromOptionalTags.length,
            legacyTags: metadata.fromLegacyTags.length,
            totalUnique: metadata.combined.length,
            primarySource: metadata.source
          });
        }
      }

      this.debugLog('✅ Step 2 simulation completed successfully');
      
      return {
        status: 'success',
        message: `Step 2 loading simulation successful for ${results.length} tables`,
        details: results
      };

    } catch (error: any) {
      this.debugLog(`❌ Step 2 simulation failed: ${error.message}`);
      
      return {
        status: 'error',
        message: `Step 2 simulation failed: ${error.message}`
      };
    }
  }

  // Run comprehensive system validation
  async runSystemValidation(): Promise<SystemValidationResults> {
    this.debugLog('🚀 Starting comprehensive system validation...');
    
    const timestamp = new Date().toISOString();
    
    try {
      // Test 1: Database connection
      this.debugLog('📡 Testing database connection...');
      const connectionTest = await this.databaseService.testConnection();
      
      // Test 2: Metadata extraction from all tables
      this.debugLog('🔍 Testing metadata extraction...');
      const metadataTests = await this.validateMetadataExtraction();
      
      // Test 3: Step 2 loading simulation
      this.debugLog('⚙️ Testing Step 2 loading...');
      const step2Test = await this.simulateStep2Loading();
      
      const results: SystemValidationResults = {
        connectionTest,
        metadataTests,
        step2Test,
        timestamp
      };
      
      // Summary logging
      const successfulTables = Object.values(metadataTests).filter(r => r.status === 'success').length;
      const totalTables = Object.keys(metadataTests).length;
      
      this.debugLog(`🎯 System validation completed:`);
      this.debugLog(`   📡 Database: ${connectionTest.status}`);
      this.debugLog(`   📊 Metadata: ${successfulTables}/${totalTables} tables successful`);
      this.debugLog(`   🔄 Step 2: ${step2Test.status}`);
      
      return results;
      
    } catch (error: any) {
      this.debugLog(`💥 System validation crashed: ${error.message}`);
      
      return {
        connectionTest: { status: 'error', message: 'Validation crashed before connection test' },
        metadataTests: {},
        step2Test: { status: 'error', message: `Validation crashed: ${error.message}` },
        timestamp
      };
    }
  }

  // Quick health check for admin page display
  async quickHealthCheck(): Promise<{ 
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details: { connection: boolean; tables: number; }
  }> {
    try {
      // Quick connection test
      const connectionResult = await this.databaseService.testConnection();
      const connectionOk = connectionResult.status === 'success';
      
      // Quick table count
      const stats = await this.databaseService.getDatabaseStats();
      const totalRecords = stats.totalDictionary + stats.totalWordForms + 
                          stats.totalWordTranslations + stats.totalFormTranslations;
      
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let message = `System healthy: ${totalRecords} total records across 4 tables`;
      
      if (!connectionOk) {
        status = 'error';
        message = 'Database connection failed';
      } else if (totalRecords === 0) {
        status = 'warning';
        message = 'Database connected but no records found';
      }
      
      return {
        status,
        message,
        details: {
          connection: connectionOk,
          tables: totalRecords
        }
      };
      
    } catch (error: any) {
      return {
        status: 'error',
        message: `Health check failed: ${error.message}`,
        details: {
          connection: false,
          tables: 0
        }
      };
    }
  }
}