'use client';

import MigrationTools from './components/MigrationTools';

export default function MigrationToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Migration Tools</h1>
          <p className="mt-2 text-gray-600">Database tag and metadata management interface</p>
        </div>
        
        <MigrationTools />
      </div>
    </div>
  );
}