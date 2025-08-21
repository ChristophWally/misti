'use client';

import MigrationToolsRefactored from '../../../components/admin/MigrationToolsRefactored';

export default function MigrationToolsRefactoredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Migration Tools - Refactored Version
          </h1>
          <p className="mt-2 text-gray-600">
            Clean, maintainable version with fixed translation mappings and Step 2 loading.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900">Test Checklist:</h2>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>✅ Create new rule with translation mappings</li>
              <li>✅ Test Step 2 auto-loading for selected forms/translations</li>
              <li>✅ Verify word cards show actual form/translation names</li>
              <li>✅ Edit existing rules and confirm mappings appear in FROM/TO boxes</li>
              <li>✅ Test database persistence by refreshing page</li>
              <li>✅ Verify remove operations show selected items</li>
            </ul>
          </div>
        </div>
        
        <MigrationToolsRefactored />
      </div>
    </div>
  );
}