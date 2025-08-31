'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type StepType = 'config' | 'mappings' | 'words' | 'forms' | 'translations' | 'tags';
export type OperationType = 'replace' | 'add' | 'remove';

export interface WordSearchResult {
  wordId: string;
  italian: string;
  wordType: string;
  tags: string[];
  formsCount: number;
  translationsCount: number;
}

export interface MappingPair {
  id: string;
  from: string;
  to: string;
}

export interface RuleConfiguration {
  selectedTable: string;
  selectedColumn: string;
  selectedTagsForMigration: string[];
  ruleBuilderMappings: MappingPair[];
  tagsToRemove: string[];
  newTagToAdd: string;
  tagsToAdd: string[];
  selectedWords: WordSearchResult[];
  selectedFormIds: string[];
  selectedTranslationIds: string[];
  selectedFormNames?: string[];
  selectedTranslationNames?: string[];
}

export interface MigrationState {
  currentStep: StepType;
  operationType: OperationType;
  selectedTable: string;
  selectedColumn: string;
  selectedRecords: Record<string, any>[];
  availableMetadata: string[];
  selectedMetadata: string[];
  ruleConfig: RuleConfiguration;
  previewData: any[];
  isLoadingPreview: boolean;
  debugLog: string[];
}

export type MigrationAction = 
  | { type: 'SET_STEP'; payload: StepType }
  | { type: 'SET_OPERATION_TYPE'; payload: OperationType }
  | { type: 'SET_TABLE'; payload: string }
  | { type: 'SET_COLUMN'; payload: string }
  | { type: 'SET_SELECTED_RECORDS'; payload: Record<string, any>[] }
  | { type: 'SET_AVAILABLE_METADATA'; payload: string[] }
  | { type: 'SET_SELECTED_METADATA'; payload: string[] }
  | { type: 'UPDATE_RULE_CONFIG'; payload: Partial<RuleConfiguration> }
  | { type: 'SET_PREVIEW_DATA'; payload: any[] }
  | { type: 'SET_LOADING_PREVIEW'; payload: boolean }
  | { type: 'ADD_DEBUG_LOG'; payload: string }
  | { type: 'CLEAR_DEBUG_LOG' }
  | { type: 'RESET_STATE' };

const initialRuleConfig: RuleConfiguration = {
  selectedTable: 'word_forms',
  selectedColumn: 'tags',
  selectedTagsForMigration: [],
  ruleBuilderMappings: [],
  tagsToRemove: [],
  newTagToAdd: '',
  tagsToAdd: [],
  selectedWords: [],
  selectedFormIds: [],
  selectedTranslationIds: [],
  selectedFormNames: [],
  selectedTranslationNames: []
};

const initialState: MigrationState = {
  currentStep: 'config',
  operationType: 'replace',
  selectedTable: 'word_forms',
  selectedColumn: 'tags',
  selectedRecords: [],
  availableMetadata: [],
  selectedMetadata: [],
  ruleConfig: initialRuleConfig,
  previewData: [],
  isLoadingPreview: false,
  debugLog: []
};

function migrationReducer(state: MigrationState, action: MigrationAction): MigrationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_OPERATION_TYPE':
      return { ...state, operationType: action.payload };
    
    case 'SET_TABLE':
      return { 
        ...state, 
        selectedTable: action.payload,
        ruleConfig: { ...state.ruleConfig, selectedTable: action.payload }
      };
    
    case 'SET_COLUMN':
      return { 
        ...state, 
        selectedColumn: action.payload,
        ruleConfig: { ...state.ruleConfig, selectedColumn: action.payload }
      };
    
    case 'SET_SELECTED_RECORDS':
      return { ...state, selectedRecords: action.payload };
    
    case 'SET_AVAILABLE_METADATA':
      return { ...state, availableMetadata: action.payload };
    
    case 'SET_SELECTED_METADATA':
      return { 
        ...state, 
        selectedMetadata: action.payload,
        ruleConfig: { ...state.ruleConfig, selectedTagsForMigration: action.payload }
      };
    
    case 'UPDATE_RULE_CONFIG':
      return { 
        ...state, 
        ruleConfig: { ...state.ruleConfig, ...action.payload }
      };
    
    case 'SET_PREVIEW_DATA':
      return { ...state, previewData: action.payload };
    
    case 'SET_LOADING_PREVIEW':
      return { ...state, isLoadingPreview: action.payload };
    
    case 'ADD_DEBUG_LOG':
      const timestamp = new Date().toLocaleTimeString();
      return { 
        ...state, 
        debugLog: [...state.debugLog, `[${timestamp}] ${action.payload}`]
      };
    
    case 'CLEAR_DEBUG_LOG':
      return { ...state, debugLog: [] };
    
    case 'RESET_STATE':
      return { ...initialState, debugLog: state.debugLog }; // Preserve debug log
    
    default:
      return state;
  }
}

const MigrationContext = createContext<{
  state: MigrationState;
  dispatch: React.Dispatch<MigrationAction>;
} | null>(null);

export function MigrationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(migrationReducer, initialState);

  return (
    <MigrationContext.Provider value={{ state, dispatch }}>
      {children}
    </MigrationContext.Provider>
  );
}

export function useMigration() {
  const context = useContext(MigrationContext);
  if (!context) {
    throw new Error('useMigration must be used within a MigrationProvider');
  }
  return context;
}

// Helper hooks for common actions
export function useMigrationActions() {
  const { dispatch } = useMigration();

  const addDebugLog = (message: string) => {
    dispatch({ type: 'ADD_DEBUG_LOG', payload: message });
  };

  const setStep = (step: StepType) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const setOperationType = (operation: OperationType) => {
    dispatch({ type: 'SET_OPERATION_TYPE', payload: operation });
  };

  const updateRuleConfig = (config: Partial<RuleConfiguration>) => {
    dispatch({ type: 'UPDATE_RULE_CONFIG', payload: config });
  };

  const setSelectedMetadata = (metadata: string[]) => {
    dispatch({ type: 'SET_SELECTED_METADATA', payload: metadata });
  };

  return {
    addDebugLog,
    setStep,
    setOperationType,
    updateRuleConfig,
    setSelectedMetadata
  };
}