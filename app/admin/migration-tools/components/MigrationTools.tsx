'use client';

import { useState } from 'react';
import RuleManager from './RuleManager';
import SearchInterface from './SearchInterface';
import ExecutionHistory from './ExecutionHistory';

type ActiveTab = 'rules' | 'search' | 'history';

export default function MigrationTools() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rules');

  const tabs = [
    { id: 'rules', name: 'Saved Rules', icon: '📋' },
    { id: 'search', name: 'Search & Execute', icon: '🔍' },
    { id: 'history', name: 'Execution History', icon: '📊' }
  ] as const;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'rules' && <RuleManager />}
        {activeTab === 'search' && <SearchInterface />}
        {activeTab === 'history' && <ExecutionHistory />}
      </div>
    </div>
  );
}