'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { DatabaseService, DatabaseStats, TableMetadataInfo } from '../services/DatabaseService';

export interface DatabaseState {
  schemas: Record<string, TableMetadataInfo>;
  stats: DatabaseStats;
  connectionStatus: 'connected' | 'loading' | 'error';
  error: string | null;
  isInitialized: boolean;
}

export type DatabaseAction = 
  | { type: 'SET_CONNECTION_STATUS'; payload: DatabaseState['connectionStatus'] }
  | { type: 'SET_SCHEMAS'; payload: Record<string, TableMetadataInfo> }
  | { type: 'SET_STATS'; payload: DatabaseStats }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'RESET_DATABASE_STATE' };

const initialState: DatabaseState = {
  schemas: {},
  stats: {
    totalDictionary: 0,
    totalWordForms: 0,
    totalWordTranslations: 0,
    totalFormTranslations: 0
  },
  connectionStatus: 'loading',
  error: null,
  isInitialized: false
};

function databaseReducer(state: DatabaseState, action: DatabaseAction): DatabaseState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'SET_SCHEMAS':
      return { ...state, schemas: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'RESET_DATABASE_STATE':
      return initialState;
    
    default:
      return state;
  }
}

const DatabaseContext = createContext<{
  state: DatabaseState;
  dispatch: React.Dispatch<DatabaseAction>;
  databaseService: DatabaseService;
} | null>(null);

export function DatabaseProvider({ 
  children, 
  debugLog 
}: { 
  children: ReactNode;
  debugLog?: (message: string) => void;
}) {
  const [state, dispatch] = useReducer(databaseReducer, initialState);
  const databaseService = new DatabaseService(debugLog);

  // Initialize database connection and load schemas
  useEffect(() => {
    async function initializeDatabase() {
      debugLog?.('🔗 Initializing database connection...');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'loading' });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // Load table schemas
        const tableNames = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];
        const schemas: Record<string, TableMetadataInfo> = {};
        
        for (const tableName of tableNames) {
          try {
            schemas[tableName] = await databaseService.getTableMetadata(tableName);
            debugLog?.(`✅ Schema loaded for ${tableName}`);
          } catch (error) {
            debugLog?.(`❌ Failed to load schema for ${tableName}: ${error}`);
          }
        }

        dispatch({ type: 'SET_SCHEMAS', payload: schemas });

        // Load database statistics
        const stats = await databaseService.getDatabaseStats();
        dispatch({ type: 'SET_STATS', payload: stats });

        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        
        debugLog?.(`✅ Database initialized: ${Object.keys(schemas).length} tables loaded`);
        
      } catch (error: any) {
        const errorMsg = `Database initialization failed: ${error.message}`;
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
        debugLog?.(`❌ ${errorMsg}`);
      }
    }

    initializeDatabase();
  }, [debugLog, databaseService]);

  return (
    <DatabaseContext.Provider value={{ state, dispatch, databaseService }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Helper hooks for common database operations
export function useDatabaseActions() {
  const { dispatch, databaseService } = useDatabase();

  const refreshStats = async (debugLog?: (message: string) => void) => {
    debugLog?.('🔄 Refreshing database statistics...');
    try {
      const stats = await databaseService.getDatabaseStats();
      dispatch({ type: 'SET_STATS', payload: stats });
      debugLog?.('✅ Database statistics refreshed');
      return stats;
    } catch (error: any) {
      const errorMsg = `Failed to refresh stats: ${error.message}`;
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      debugLog?.(`❌ ${errorMsg}`);
      throw error;
    }
  };

  const refreshSchemas = async (debugLog?: (message: string) => void) => {
    debugLog?.('🔄 Refreshing table schemas...');
    try {
      const tableNames = ['dictionary', 'word_forms', 'word_translations', 'form_translations'];
      const schemas: Record<string, TableMetadataInfo> = {};
      
      for (const tableName of tableNames) {
        schemas[tableName] = await databaseService.getTableMetadata(tableName);
      }

      dispatch({ type: 'SET_SCHEMAS', payload: schemas });
      debugLog?.(`✅ Schemas refreshed for ${Object.keys(schemas).length} tables`);
      return schemas;
    } catch (error: any) {
      const errorMsg = `Failed to refresh schemas: ${error.message}`;
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      debugLog?.(`❌ ${errorMsg}`);
      throw error;
    }
  };

  return {
    refreshStats,
    refreshSchemas
  };
}