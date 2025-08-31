'use client';

import MigrationToolsInterface from '../../../components/admin/MigrationToolsInterface';

export default function MigrationToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                Migration Tools
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Core Validation Systems and Tag Consistency Migration
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <a
                href="/admin/migration-tools/test"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🧪 Integration Tests
              </a>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Infrastructure Development
              </span>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">!</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Critical Issues
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      27 <span className="text-sm text-gray-500">identified</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold text-sm">⚠</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Terminology Issues
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      581 <span className="text-sm text-gray-500">forms affected</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">◐</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Missing Auxiliaries
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      25 <span className="text-sm text-gray-500">translations</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Building Blocks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Complete <span className="text-sm text-gray-500">7/7 verbs</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Migration Interface */}
        <MigrationToolsInterface />
      </div>
    </div>
  );
}

