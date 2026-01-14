import React, { createContext, useContext, useMemo } from "react";
import { StorageProvider, StorageMode } from "./types";
import { LocalStorageProvider } from "./localStorageProvider";
import { ApiStorageProvider } from "./apiStorageProvider";

interface StorageContextValue {
  storage: StorageProvider;
  mode: StorageMode;
}

const StorageContext = createContext<StorageContextValue | null>(null);

/**
 * Get the storage mode from environment variables
 */
function getStorageConfig(): { mode: StorageMode; apiUrl: string } {
  const mode = (import.meta.env.VITE_STORAGE_MODE as StorageMode) || "localStorage";
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return { mode, apiUrl };
}

interface StorageProviderProps {
  children: React.ReactNode;
}

/**
 * Storage provider component that initializes the appropriate storage implementation.
 */
export function StorageProviderComponent({ children }: StorageProviderProps) {
  const storageValue = useMemo<StorageContextValue>(() => {
    const config = getStorageConfig();

    if (config.mode === "api") {
      return {
        storage: new ApiStorageProvider(config.apiUrl),
        mode: "api",
      };
    }

    return {
      storage: new LocalStorageProvider(),
      mode: "localStorage",
    };
  }, []);

  return (
    <StorageContext.Provider value={storageValue}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Hook to access the storage provider
 */
export function useStorage(): StorageProvider {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProviderComponent");
  }
  return context.storage;
}

/**
 * Hook to check the current storage mode
 */
export function useStorageMode(): StorageMode {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorageMode must be used within a StorageProviderComponent");
  }
  return context.mode;
}

