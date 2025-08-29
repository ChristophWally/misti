'use client';

import MetavalDebugTest from '../components/MetavalDebugTest';
import SimpleMetavalTest from '../components/SimpleMetavalTest';
import DisplayNameTestResults from '../components/DisplayNameTestResults';

export default function DebugMetavalPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Metaval System Debug Console
          </h1>
          <p className="text-gray-600">
            Debugging why display values show stable IDs instead of human-readable names.
          </p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="font-medium text-red-800">Current Issue</h2>
            <p className="text-red-700 text-sm mt-1">
              Expected: "Gender: Feminine" | Actual: "metaattr008: metaattr008val038"
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <DisplayNameTestResults />
          <SimpleMetavalTest />
          <MetavalDebugTest />
        </div>
      </div>
    </div>
  );
}