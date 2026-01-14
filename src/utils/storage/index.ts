// Storage module exports

import type {
  AppData,
  AppSettings,
  TrainingSession,
  Measurement,
  UserProfile,
  ScheduledReminder,
  Variant,
} from "../../types";
import { DEFAULT_SETTINGS, DEFAULT_APP_DATA } from "./types";

// Types
export type { StorageProvider, StorageMode, StorageConfig } from "./types";
export { DEFAULT_SETTINGS, DEFAULT_APP_DATA } from "./types";

// Providers
export { LocalStorageProvider } from "./localStorageProvider";
export { ApiStorageProvider } from "./apiStorageProvider";

// Context and hooks
export {
  StorageProviderComponent,
  useStorage,
  useStorageMode,
} from "./StorageContext";

// Legacy synchronous wrapper functions for backward compatibility
// These will be deprecated in favor of the async storage hooks
export function getStoredData() {
  // For backward compatibility, we use the sync version internally
  const stored = localStorage.getItem("occam-protocol-data");
  if (stored) {
    const data = JSON.parse(stored);
    return {
      sessions: data.sessions || [],
      measurements: data.measurements || [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...data.settings,
        measurementNotifications:
          data.settings?.measurementNotifications ||
          DEFAULT_SETTINGS.measurementNotifications,
      },
      userProfile: data.userProfile,
      scheduledReminders: data.scheduledReminders || [],
    };
  }
  return { ...DEFAULT_APP_DATA };
}

export function saveStoredData(data: AppData) {
  try {
    localStorage.setItem("occam-protocol-data", JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getSessions(): TrainingSession[] {
  return getStoredData().sessions;
}

export function addSession(session: TrainingSession) {
  const data = getStoredData();
  data.sessions.push(session);
  return saveStoredData(data);
}

export function updateSession(id: string, session: Partial<TrainingSession>) {
  const data = getStoredData();
  const index = data.sessions.findIndex((s: TrainingSession) => s.id === id);
  if (index === -1) return false;
  data.sessions[index] = {
    ...data.sessions[index],
    ...session,
    updatedAt: Date.now(),
  };
  return saveStoredData(data);
}

export function deleteSession(id: string) {
  const data = getStoredData();
  data.sessions = data.sessions.filter((s: TrainingSession) => s.id !== id);
  return saveStoredData(data);
}

export function getSettings(): AppSettings {
  return getStoredData().settings;
}

export function updateSettings(settings: Partial<AppSettings>) {
  const data = getStoredData();
  data.settings = { ...data.settings, ...settings };
  return saveStoredData(data);
}

export function getMeasurements(): Measurement[] {
  return getStoredData().measurements;
}

export function addMeasurement(measurement: Measurement) {
  const data = getStoredData();
  data.measurements.push(measurement);
  return saveStoredData(data);
}

export function updateMeasurement(
  id: string,
  measurement: Partial<Measurement>
) {
  const data = getStoredData();
  const index = data.measurements.findIndex((m: Measurement) => m.id === id);
  if (index === -1) return false;
  data.measurements[index] = {
    ...data.measurements[index],
    ...measurement,
    updatedAt: Date.now(),
  };
  return saveStoredData(data);
}

export function deleteMeasurement(id: string) {
  const data = getStoredData();
  data.measurements = data.measurements.filter((m: Measurement) => m.id !== id);
  return saveStoredData(data);
}

export function getUserProfile(): UserProfile | null {
  return getStoredData().userProfile || null;
}

export function updateUserProfile(profile: Partial<UserProfile>) {
  const data = getStoredData();
  data.userProfile = {
    ...data.userProfile,
    ...profile,
  } as UserProfile;
  return saveStoredData(data);
}

export function isOnboardingCompleted() {
  const profile = getUserProfile();
  return profile?.onboardingCompleted === true;
}

export function completeOnboarding() {
  return updateUserProfile({ onboardingCompleted: true });
}

export function exportData() {
  return JSON.stringify(getStoredData(), null, 2);
}

export function importData(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);
    if (data.sessions && data.settings) {
      return saveStoredData({
        sessions: data.sessions || [],
        measurements: data.measurements || [],
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
        userProfile: data.userProfile,
        scheduledReminders: data.scheduledReminders || [],
      });
    }
    return false;
  } catch {
    return false;
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem("occam-protocol-data");
    return true;
  } catch {
    return false;
  }
}

export function getScheduledReminders(): ScheduledReminder[] {
  return getStoredData().scheduledReminders || [];
}

export function addScheduledReminder(
  date: string,
  variant: Variant
): ScheduledReminder | null {
  const data = getStoredData();
  const existingIndex = data.scheduledReminders?.findIndex(
    (r: ScheduledReminder) => r.date === date && r.variant === variant
  );
  if (existingIndex !== undefined && existingIndex !== -1) {
    return data.scheduledReminders![existingIndex];
  }
  const newReminder: ScheduledReminder = {
    id: `reminder-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    date,
    variant,
    createdAt: Date.now(),
    completed: false,
  };
  if (!data.scheduledReminders) {
    data.scheduledReminders = [];
  }
  data.scheduledReminders.push(newReminder);
  if (saveStoredData(data)) {
    return newReminder;
  }
  return null;
}

export function markReminderCompleted(id: string): boolean {
  const data = getStoredData();
  const index = data.scheduledReminders?.findIndex(
    (r: ScheduledReminder) => r.id === id
  );
  if (index === undefined || index === -1) return false;
  data.scheduledReminders![index].completed = true;
  return saveStoredData(data);
}

export function deleteScheduledReminder(id: string): boolean {
  const data = getStoredData();
  if (!data.scheduledReminders) return false;
  data.scheduledReminders = data.scheduledReminders.filter(
    (r: ScheduledReminder) => r.id !== id
  );
  return saveStoredData(data);
}

export function getRemindersForDate(date: string): ScheduledReminder[] {
  const reminders = getScheduledReminders();
  return reminders.filter(
    (r: ScheduledReminder) => r.date === date && !r.completed
  );
}
