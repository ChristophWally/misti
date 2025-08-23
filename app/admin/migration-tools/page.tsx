'use client';

import { useState } from 'react';

export default function MigrationToolsPage() {
  const [showTest, setShowTest] = useState(false);

  if (showTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Migration Tools</h1>
            <p className="mt-2 text-gray-600">Database tag and metadata management interface</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <p>Basic test successful. Components are causing the issue.</p>
            <button 
              onClick={() => setShowTest(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Try Loading Components
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Migration Tools</h1>
          <p className="mt-2 text-gray-600">Database tag and metadata management interface</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <p>If you see this, the page loads. Click to test components:</p>
          <button 
            onClick={() => setShowTest(true)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Load Test Mode
          </button>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Testing component loading step by step...</p>
            <div className="mt-2">
              <button className="bg-red-600 text-white px-3 py-1 text-sm rounded mr-2">
                Test Supabase
              </button>
              <button className="bg-yellow-600 text-white px-3 py-1 text-sm rounded mr-2">
                Test Components  
              </button>
              <button className="bg-purple-600 text-white px-3 py-1 text-sm rounded">
                Load Full Interface
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}