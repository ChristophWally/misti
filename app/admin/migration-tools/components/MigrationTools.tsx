'use client';

import { useState } from 'react';
import { ModernDatabaseService } from '../services/ModernDatabaseService';
import RuleManager from './RuleManager';
import SearchInterface from './SearchInterface';
import ExecutionHistory from './ExecutionHistory';

type ActiveTab = 'rules' | 'search' | 'history';

// Modern grouped state management - 8 total hooks vs 72+
interface AppState {
  activeTab: ActiveTab;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface DataState {
  rules: any[];
  searchResults: Record<string, any[]>;
  executionHistory: any[];
}

interface FormState {
  selectedTables: string[];
  searchCriteria: any;
  currentRule: any;
  showCreateForm?: boolean;
  showEditForm?: boolean;
}

export default function MigrationTools() {
  // Grouped useState hooks - Modern architecture
  const [appState, setAppState] = useState<AppState>({
    activeTab: 'rules'
  });

  const [uiState, setUIState] = useState<UIState>({
    isLoading: false,
    error: null,
    successMessage: null
  });

  const [dataState, setDataState] = useState<DataState>({
    rules: [],
    searchResults: {},
    executionHistory: []
  });

  const [formState, setFormState] = useState<FormState>({
    selectedTables: [],
    searchCriteria: null,
    currentRule: null
  });

  // Service instance
  const [dbService] = useState(() => ModernDatabaseService.getInstance());

  const tabs = [
    { id: 'rules', name: 'Saved Rules', icon: '📋' },
    { id: 'search', name: 'Search & Execute', icon: '🔍' },
    { id: 'history', name: 'Execution History', icon: '📊' }
  ] as const;

  // State update helpers
  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  };

  const updateDataState = (updates: Partial<DataState>) => {
    setDataState(prev => ({ ...prev, ...updates }));
  };

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Global error handler
  const handleError = (error: any, context: string) => {
    console.error(`${context}:`, error);
    updateUIState({
      error: `${context}: ${error.message || error}`,
      isLoading: false
    });
  };

  // Global success handler
  const handleSuccess = (message: string) => {
    updateUIState({
      successMessage: message,
      error: null,
      isLoading: false
    });
  };

  // Clear messages
  const clearMessages = () => {
    updateUIState({ error: null, successMessage: null });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                updateAppState({ activeTab: tab.id });
                clearMessages();
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                appState.activeTab === tab.id
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

      {/* Global Messages */}
      {(uiState.error || uiState.successMessage) && (
        <div className="p-4 border-b border-gray-200">
          {uiState.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{uiState.error}</div>
                </div>
                <button
                  onClick={clearMessages}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {uiState.successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">{uiState.successMessage}</div>
                </div>
                <button
                  onClick={clearMessages}
                  className="ml-auto text-green-400 hover:text-green-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {appState.activeTab === 'rules' && (
          <RuleManager 
            state={{ uiState, dataState, formState }}
            actions={{ updateUIState, updateDataState, updateFormState }}
            handlers={{ handleError, handleSuccess }}
            dbService={dbService}
          />
        )}
        
        {appState.activeTab === 'search' && (
          <SearchInterface 
            state={{ uiState, dataState, formState }}
            actions={{ updateUIState, updateDataState, updateFormState }}
            handlers={{ handleError, handleSuccess }}
            dbService={dbService}
          />
        )}
        
        {appState.activeTab === 'history' && (
          <ExecutionHistory 
            state={{ uiState, dataState, formState }}
            actions={{ updateUIState, updateDataState, updateFormState }}
            handlers={{ handleError, handleSuccess }}
            dbService={dbService}
          />
        )}
      </div>
    </div>
  );
}