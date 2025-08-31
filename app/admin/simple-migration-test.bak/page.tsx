'use client';

import SimpleMigrationTest from '../../../components/admin/SimpleMigrationTest';

export default function SimpleMigrationTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Simple Migration Test
          </h1>
          <p className="mt-2 text-gray-600">
            Minimal working example to prove translation mapping persistence works correctly.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-900">Test Instructions:</h2>
            <ol className="mt-2 space-y-1 text-sm text-green-800 list-decimal list-inside">
              <li>Create a test rule with mappings like "requires_avere" → "avere"</li>
              <li>Add some sample translations</li>
              <li>Save the rule to database</li>
              <li>Edit the rule to verify mappings appear correctly</li>
              <li>Refresh page to test database persistence</li>
            </ol>
          </div>
        </div>
        
        <SimpleMigrationTest />
      </div>
    </div>
  );
}