import type {
  AppData,
  AppSettings,
  TrainingSession,
  Measurement,
  UserProfile,
  ScheduledReminder,
  Variant,
} from "../../types";
import { StorageProvider, DEFAULT_SETTINGS, DEFAULT_APP_DATA } from "./types";

const STORAGE_KEY = "occam-protocol-data";

/**
 * LocalStorage implementation of the StorageProvider interface.
 * This maintains backward compatibility with the existing localStorage-based storage.
 */
export class LocalStorageProvider implements StorageProvider {
  private getDataSync(): AppData {
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
    return { ...DEFAULT_APP_DATA };
  }

  private saveDataSync(data: AppData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  }

  async getStoredData(): Promise<AppData> {
    return this.getDataSync();
  }

  async saveStoredData(data: AppData): Promise<boolean> {
    return this.saveDataSync(data);
  }

  async addSession(session: TrainingSession): Promise<boolean> {
    const data = this.getDataSync();
    data.sessions.push(session);
    return this.saveDataSync(data);
  }

  async updateSession(
    id: string,
    session: Partial<TrainingSession>
  ): Promise<boolean> {
    const data = this.getDataSync();
    const index = data.sessions.findIndex((s) => s.id === id);
    if (index === -1) return false;

    data.sessions[index] = {
      ...data.sessions[index],
      ...session,
      updatedAt: Date.now(),
    };
    return this.saveDataSync(data);
  }

  async deleteSession(id: string): Promise<boolean> {
    const data = this.getDataSync();
    data.sessions = data.sessions.filter((s) => s.id !== id);
    return this.saveDataSync(data);
  }

  async getSessions(): Promise<TrainingSession[]> {
    return this.getDataSync().sessions;
  }

  async getSettings(): Promise<AppSettings> {
    return this.getDataSync().settings;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<boolean> {
    const data = this.getDataSync();
    data.settings = { ...data.settings, ...settings };
    return this.saveDataSync(data);
  }

  async addMeasurement(measurement: Measurement): Promise<boolean> {
    const data = this.getDataSync();
    data.measurements.push(measurement);
    return this.saveDataSync(data);
  }

  async updateMeasurement(
    id: string,
    measurement: Partial<Measurement>
  ): Promise<boolean> {
    const data = this.getDataSync();
    const index = data.measurements.findIndex((m) => m.id === id);
    if (index === -1) return false;

    data.measurements[index] = {
      ...data.measurements[index],
      ...measurement,
      updatedAt: Date.now(),
    };
    return this.saveDataSync(data);
  }

  async deleteMeasurement(id: string): Promise<boolean> {
    const data = this.getDataSync();
    data.measurements = data.measurements.filter((m) => m.id !== id);
    return this.saveDataSync(data);
  }

  async getMeasurements(): Promise<Measurement[]> {
    return this.getDataSync().measurements;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const data = this.getDataSync();
    return data.userProfile || null;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    const data = this.getDataSync();
    data.userProfile = {
      ...data.userProfile,
      ...profile,
    } as UserProfile;
    return this.saveDataSync(data);
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.onboardingCompleted === true;
  }

  async completeOnboarding(): Promise<boolean> {
    return this.updateUserProfile({ onboardingCompleted: true });
  }

  async getScheduledReminders(): Promise<ScheduledReminder[]> {
    return this.getDataSync().scheduledReminders || [];
  }

  async addScheduledReminder(
    date: string,
    variant: Variant
  ): Promise<ScheduledReminder | null> {
    const data = this.getDataSync();

    const existingIndex = data.scheduledReminders?.findIndex(
      (r) => r.date === date && r.variant === variant
    );

    if (existingIndex !== undefined && existingIndex !== -1) {
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

    if (this.saveDataSync(data)) {
      return newReminder;
    }
    return null;
  }

  async markReminderCompleted(id: string): Promise<boolean> {
    const data = this.getDataSync();
    const index = data.scheduledReminders?.findIndex((r) => r.id === id);
    if (index === undefined || index === -1) return false;

    data.scheduledReminders![index].completed = true;
    return this.saveDataSync(data);
  }

  async deleteScheduledReminder(id: string): Promise<boolean> {
    const data = this.getDataSync();
    if (!data.scheduledReminders) return false;
    data.scheduledReminders = data.scheduledReminders.filter(
      (r) => r.id !== id
    );
    return this.saveDataSync(data);
  }

  async exportData(): Promise<string> {
    return JSON.stringify(this.getDataSync(), null, 2);
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.sessions && data.settings) {
        const importedData: AppData = {
          sessions: data.sessions || [],
          measurements: data.measurements || [],
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
          userProfile: data.userProfile,
          scheduledReminders: data.scheduledReminders || [],
        };
        return this.saveDataSync(importedData);
      }
      return false;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }
}
