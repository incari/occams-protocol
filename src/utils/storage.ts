/**
 * Re-export all storage functions from the new modular storage system.
 * This maintains backward compatibility with existing imports.
 */
export {
  getStoredData,
  saveStoredData,
  getSessions,
  addSession,
  updateSession,
  deleteSession,
  getSettings,
  updateSettings,
  getMeasurements,
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getUserProfile,
  updateUserProfile,
  isOnboardingCompleted,
  completeOnboarding,
  exportData,
  importData,
  clearAllData,
  getScheduledReminders,
  addScheduledReminder,
  markReminderCompleted,
  deleteScheduledReminder,
  getRemindersForDate,
  // New exports for the storage provider system
  StorageProviderComponent,
  useStorage,
  useStorageMode,
  LocalStorageProvider,
  ApiStorageProvider,
  DEFAULT_SETTINGS,
  DEFAULT_APP_DATA,
} from "./storage/index";

export type {
  StorageProvider,
  StorageMode,
  StorageConfig,
} from "./storage/index";
