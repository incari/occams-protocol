export type Variant = "A" | "B";

export interface Exercise {
  name: string;
  weight: number;
  unit: "kg" | "lbs";
  reps?: number; // Optional: for exercises like Kettlebells swinging
}

export interface TrainingSession {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  variant: Variant;
  exercises: Exercise[];
  createdAt: number;
  updatedAt: number;
}

export interface BodyMeasurements {
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  waist: number;
  hip: number;
  chestWidth: number;
}

export interface Measurement {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  weight: number;
  bodyFat: number; // percentage
  measurements: BodyMeasurements;
  measurementUnit: "cm" | "inches";
  weightUnit: "kg" | "lbs";
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  unit: "kg" | "lbs";
  notifications: {
    enabled: boolean;
    days: string[]; // e.g., ['monday', 'wednesday', 'friday']
    time: string; // e.g., '18:00'
  };
  measurementNotifications: {
    enabled: boolean;
    day: string; // e.g., 'monday' - day of week for measurement reminder
    time: string; // e.g., '18:00'
  };
  theme: "light" | "dark";
}

export interface UserProfile {
  name: string;
  height: number; // in cm
  initialWeight: number; // in kg
  heightUnit: "cm" | "inches";
  weightUnit: "kg" | "lbs";
  onboardingCompleted: boolean;
}

export interface AppData {
  sessions: TrainingSession[];
  measurements: Measurement[];
  settings: AppSettings;
  userProfile?: UserProfile;
}

export const EXERCISES: Record<Variant, string[]> = {
  A: ["Lat Pulldown", "Shoulder Press", "Abdominal Exercises"],
  B: ["Chest Press", "Leg Press", "Kettlebells swinging"],
};
