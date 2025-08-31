/**
 * Test Migration Script - Execute the metaval migration with safety checks
 */

const { createClient } = require('@supabase/supabase-js');

// Import our services (note: this is a simplified test version)
class TestMigrationRunner {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async testSingleRecord() {
    console.log('🧪 Testing single record migration...');
    
    // Get one record from dictionary
    const { data: records, error } = await this.supabase
      .from('dictionary')
      .select('id, italian, metadata')
      .not('metadata', 'is', null)
      .neq('metadata', '{}')
      .limit(1);

    if (error || !records || records.length === 0) {
      console.error('Failed to get test record:', error);
      return;
    }

    const record = records[0];
    console.log('Original record:', {
      id: record.id,
      italian: record.italian,
      metadata: record.metadata,
      metadataSize: JSON.stringify(record.metadata).length
    });

    // Get mapping for attributes
    const { data: attributes } = await this.supabase
      .from('meta_attributes')
      .select('name, stable_id')
      .eq('is_active', true);

    const attributeMap = new Map(attributes.map(a => [a.name, a.stable_id]));

    // Simple migration simulation
    const migratedMetadata = {};
    const warnings = [];
    
    for (const [key, value] of Object.entries(record.metadata)) {
      const stableId = attributeMap.get(key);
      if (stableId) {
        migratedMetadata[stableId] = value; // Simplified - keeping original values
      } else {
        warnings.push(`Unknown attribute: ${key}`);
        migratedMetadata[key] = value; // Keep as-is
      }
    }

    console.log('Migrated metadata:', migratedMetadata);
    console.log('Warnings:', warnings);
    console.log('Size change:', {
      original: JSON.stringify(record.metadata).length,
      migrated: JSON.stringify(migratedMetadata).length,
      reduction: Math.round(((JSON.stringify(record.metadata).length - JSON.stringify(migratedMetadata).length) / JSON.stringify(record.metadata).length) * 100)
    });

    return { record, migratedMetadata, warnings };
  }

  async run() {
    try {
      await this.testSingleRecord();
      console.log('\n✅ Test completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

// Run the test
const runner = new TestMigrationRunner();
runner.run();