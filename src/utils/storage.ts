import type {
  AppData,
  AppSettings,
  TrainingSession,
  Measurement,
  UserProfile,
  ScheduledReminder,
  Variant,
} from "../types";

const STORAGE_KEY = "occam-protocol-data";

const DEFAULT_SETTINGS: AppSettings = {
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

export function getStoredData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        sessions: data.sessions || [],
        measurements: data.measurements || [],
        settings: {
          ...DEFAULT_SETTINGS,
          ...data.settings,
          // Ensure measurementNotifications exists for backward compatibility
          measurementNotifications:
            data.settings?.measurementNotifications ||
            DEFAULT_SETTINGS.measurementNotifications,
        },
        userProfile: data.userProfile,
        scheduledReminders: data.scheduledReminders || [],
      };
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return {
    sessions: [],
    measurements: [],
    settings: DEFAULT_SETTINGS,
    scheduledReminders: [],
  };
}

export function saveStoredData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
}

export function addSession(session: TrainingSession): boolean {
  const data = getStoredData();
  data.sessions.push(session);
  return saveStoredData(data);
}

export function updateSession(
  id: string,
  session: Partial<TrainingSession>
): boolean {
  const data = getStoredData();
  const index = data.sessions.findIndex((s) => s.id === id);
  if (index === -1) return false;

  data.sessions[index] = {
    ...data.sessions[index],
    ...session,
    updatedAt: Date.now(),
  };
  return saveStoredData(data);
}

export function deleteSession(id: string): boolean {
  const data = getStoredData();
  data.sessions = data.sessions.filter((s) => s.id !== id);
  return saveStoredData(data);
}

export function getSessions(): TrainingSession[] {
  return getStoredData().sessions;
}

export function getSettings(): AppSettings {
  return getStoredData().settings;
}

export function updateSettings(settings: Partial<AppSettings>): boolean {
  const data = getStoredData();
  data.settings = { ...data.settings, ...settings };
  return saveStoredData(data);
}

export function exportData(): string {
  return JSON.stringify(getStoredData(), null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.sessions && data.settings) {
      // Ensure measurements array exists
      const importedData: AppData = {
        sessions: data.sessions || [],
        measurements: data.measurements || [],
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
        userProfile: data.userProfile,
      };
      return saveStoredData(importedData);
    }
    return false;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
}

export function addMeasurement(measurement: Measurement): boolean {
  const data = getStoredData();
  data.measurements.push(measurement);
  return saveStoredData(data);
}

export function updateMeasurement(
  id: string,
  measurement: Partial<Measurement>
): boolean {
  const data = getStoredData();
  const index = data.measurements.findIndex((m) => m.id === id);
  if (index === -1) return false;

  data.measurements[index] = {
    ...data.measurements[index],
    ...measurement,
    updatedAt: Date.now(),
  };
  return saveStoredData(data);
}

export function deleteMeasurement(id: string): boolean {
  const data = getStoredData();
  data.measurements = data.measurements.filter((m) => m.id !== id);
  return saveStoredData(data);
}

export function getMeasurements(): Measurement[] {
  return getStoredData().measurements;
}

export function clearAllData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
}

export function getUserProfile(): UserProfile | null {
  const data = getStoredData();
  return data.userProfile || null;
}

export function updateUserProfile(profile: Partial<UserProfile>): boolean {
  const data = getStoredData();
  const existingProfile = data.userProfile;

  data.userProfile = {
    ...existingProfile,
    ...profile,
  } as UserProfile;

  return saveStoredData(data);
}

export function isOnboardingCompleted(): boolean {
  const profile = getUserProfile();
  return profile?.onboardingCompleted === true;
}

// Scheduled Reminders functions
export function getScheduledReminders(): ScheduledReminder[] {
  return getStoredData().scheduledReminders || [];
}

export function addScheduledReminder(
  date: string,
  variant: Variant
): ScheduledReminder | null {
  const data = getStoredData();

  // Check if there's already a reminder for this date and variant
  const existingIndex = data.scheduledReminders?.findIndex(
    (r) => r.date === date && r.variant === variant
  );

  if (existingIndex !== undefined && existingIndex !== -1) {
    // Update existing reminder
    return data.scheduledReminders![existingIndex];
  }

  const newReminder: ScheduledReminder = {
    id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  const index = data.scheduledReminders?.findIndex((r) => r.id === id);
  if (index === undefined || index === -1) return false;

  data.scheduledReminders![index].completed = true;
  return saveStoredData(data);
}

export function deleteScheduledReminder(id: string): boolean {
  const data = getStoredData();
  if (!data.scheduledReminders) return false;
  data.scheduledReminders = data.scheduledReminders.filter((r) => r.id !== id);
  return saveStoredData(data);
}

export function getRemindersForDate(date: string): ScheduledReminder[] {
  const reminders = getScheduledReminders();
  return reminders.filter((r) => r.date === date && !r.completed);
}
