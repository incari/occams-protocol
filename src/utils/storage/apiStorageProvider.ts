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

/**
 * API-based storage provider that communicates with a backend SQLite database.
 */
export class ApiStorageProvider implements StorageProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getStoredData(): Promise<AppData> {
    try {
      return await this.request<AppData>("/api/data");
    } catch (error) {
      console.error("Error fetching data from API:", error);
      return { ...DEFAULT_APP_DATA };
    }
  }

  async saveStoredData(data: AppData): Promise<boolean> {
    try {
      await this.request("/api/data", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return true;
    } catch (error) {
      console.error("Error saving data to API:", error);
      return false;
    }
  }

  async addSession(session: TrainingSession): Promise<boolean> {
    try {
      await this.request("/api/sessions", {
        method: "POST",
        body: JSON.stringify(session),
      });
      return true;
    } catch (error) {
      console.error("Error adding session:", error);
      return false;
    }
  }

  async updateSession(
    id: string,
    session: Partial<TrainingSession>
  ): Promise<boolean> {
    try {
      await this.request(`/api/sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify(session),
      });
      return true;
    } catch (error) {
      console.error("Error updating session:", error);
      return false;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await this.request(`/api/sessions/${id}`, { method: "DELETE" });
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  async getSessions(): Promise<TrainingSession[]> {
    try {
      return await this.request<TrainingSession[]>("/api/sessions");
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      return await this.request<AppSettings>("/api/settings");
    } catch (error) {
      console.error("Error fetching settings:", error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<boolean> {
    try {
      await this.request("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  }

  async addMeasurement(measurement: Measurement): Promise<boolean> {
    try {
      await this.request("/api/measurements", {
        method: "POST",
        body: JSON.stringify(measurement),
      });
      return true;
    } catch (error) {
      console.error("Error adding measurement:", error);
      return false;
    }
  }

  async updateMeasurement(
    id: string,
    measurement: Partial<Measurement>
  ): Promise<boolean> {
    try {
      await this.request(`/api/measurements/${id}`, {
        method: "PUT",
        body: JSON.stringify(measurement),
      });
      return true;
    } catch (error) {
      console.error("Error updating measurement:", error);
      return false;
    }
  }

  async deleteMeasurement(id: string): Promise<boolean> {
    try {
      await this.request(`/api/measurements/${id}`, { method: "DELETE" });
      return true;
    } catch (error) {
      console.error("Error deleting measurement:", error);
      return false;
    }
  }

  async getMeasurements(): Promise<Measurement[]> {
    try {
      return await this.request<Measurement[]>("/api/measurements");
    } catch (error) {
      console.error("Error fetching measurements:", error);
      return [];
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      return await this.request<UserProfile | null>("/api/profile");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      await this.request("/api/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.onboardingCompleted === true;
  }

  async completeOnboarding(): Promise<boolean> {
    return this.updateUserProfile({ onboardingCompleted: true });
  }

  async getScheduledReminders(): Promise<ScheduledReminder[]> {
    try {
      return await this.request<ScheduledReminder[]>("/api/reminders");
    } catch (error) {
      console.error("Error fetching reminders:", error);
      return [];
    }
  }

  async addScheduledReminder(
    date: string,
    variant: Variant
  ): Promise<ScheduledReminder | null> {
    try {
      return await this.request<ScheduledReminder>("/api/reminders", {
        method: "POST",
        body: JSON.stringify({ date, variant }),
      });
    } catch (error) {
      console.error("Error adding reminder:", error);
      return null;
    }
  }

  async markReminderCompleted(id: string): Promise<boolean> {
    try {
      await this.request(`/api/reminders/${id}/complete`, { method: "PUT" });
      return true;
    } catch (error) {
      console.error("Error marking reminder completed:", error);
      return false;
    }
  }

  async deleteScheduledReminder(id: string): Promise<boolean> {
    try {
      await this.request(`/api/reminders/${id}`, { method: "DELETE" });
      return true;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      return false;
    }
  }

  async exportData(): Promise<string> {
    try {
      const data = await this.getStoredData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error exporting data:", error);
      return JSON.stringify(DEFAULT_APP_DATA, null, 2);
    }
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      return await this.saveStoredData(data);
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      await this.request("/api/data", { method: "DELETE" });
      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }
}
