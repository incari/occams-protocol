import type {
  AppData,
  AppSettings,
  TrainingSession,
  Measurement,
  UserProfile,
  ScheduledReminder,
  Variant,
} from "../../types";

/**
 * Storage provider interface that defines all storage operations.
 * Both localStorage and SQLite implementations must follow this interface.
 */
export interface StorageProvider {
  // Data retrieval
  getStoredData(): Promise<AppData>;

  // Data persistence
  saveStoredData(data: AppData): Promise<boolean>;

  // Sessions
  addSession(session: TrainingSession): Promise<boolean>;
  updateSession(id: string, session: Partial<TrainingSession>): Promise<boolean>;
  deleteSession(id: string): Promise<boolean>;
  getSessions(): Promise<TrainingSession[]>;

  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<boolean>;

  // Measurements
  addMeasurement(measurement: Measurement): Promise<boolean>;
  updateMeasurement(id: string, measurement: Partial<Measurement>): Promise<boolean>;
  deleteMeasurement(id: string): Promise<boolean>;
  getMeasurements(): Promise<Measurement[]>;

  // User Profile
  getUserProfile(): Promise<UserProfile | null>;
  updateUserProfile(profile: Partial<UserProfile>): Promise<boolean>;
  isOnboardingCompleted(): Promise<boolean>;
  completeOnboarding(): Promise<boolean>;

  // Scheduled Reminders
  getScheduledReminders(): Promise<ScheduledReminder[]>;
  addScheduledReminder(date: string, variant: Variant): Promise<ScheduledReminder | null>;
  markReminderCompleted(id: string): Promise<boolean>;
  deleteScheduledReminder(id: string): Promise<boolean>;

  // Data management
  exportData(): Promise<string>;
  importData(jsonString: string): Promise<boolean>;
  clearAllData(): Promise<boolean>;
}

/**
 * Storage mode configuration
 */
export type StorageMode = "localStorage" | "api";

/**
 * Storage configuration
 */
export interface StorageConfig {
  mode: StorageMode;
  apiUrl?: string;
}

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  unit: "kg",
  notifications: {
    enabled: false,
    days: ["monday", "wednesday", "friday"],
    time: "18:00",
  },
  measurementNotifications: {
    enabled: false,
    day: "monday",
    time: "18:00",
  },
  theme: "light",
};

/**
 * Default app data
 */
export const DEFAULT_APP_DATA: AppData = {
  sessions: [],
  measurements: [],
  settings: DEFAULT_SETTINGS,
  scheduledReminders: [],
};

