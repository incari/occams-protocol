import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./database.js";
import routes from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use("/api", routes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "..", "public");
  app.use(express.static(publicPath));

  // Handle client-side routing
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(publicPath, "index.html"));
    }
  });
}

// Helper functions
const parseJSON = (str, fallback) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// GET all data
app.get("/api/data", (req, res) => {
  try {
    const sessions = db.prepare("SELECT * FROM sessions ORDER BY date DESC").all();
    const measurements = db.prepare("SELECT * FROM measurements ORDER BY date DESC").all();
    const settingsRow = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const profileRow = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
    const reminders = db.prepare("SELECT * FROM scheduled_reminders").all();

    const data = {
      sessions: sessions.map((s) => ({
        id: s.id,
        date: s.date,
        variant: s.variant,
        exercises: parseJSON(s.exercises, []),
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })),
      measurements: measurements.map((m) => ({
        id: m.id,
        date: m.date,
        weight: m.weight,
        bodyFat: m.body_fat,
        measurements: parseJSON(m.measurements, {}),
        measurementUnit: m.measurement_unit,
        weightUnit: m.weight_unit,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      })),
      settings: settingsRow
        ? {
          unit: settingsRow.unit,
          notifications: parseJSON(settingsRow.notifications, {}),
          measurementNotifications: parseJSON(settingsRow.measurement_notifications, {}),
          theme: settingsRow.theme,
        }
        : null,
      userProfile: profileRow
        ? {
          name: profileRow.name,
          height: profileRow.height,
          initialWeight: profileRow.initial_weight,
          heightUnit: profileRow.height_unit,
          weightUnit: profileRow.weight_unit,
          onboardingCompleted: Boolean(profileRow.onboarding_completed),
        }
        : null,
      scheduledReminders: reminders.map((r) => ({
        id: r.id,
        date: r.date,
        variant: r.variant,
        createdAt: r.created_at,
        completed: Boolean(r.completed),
      })),
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// PUT all data (full replacement)
app.put("/api/data", (req, res) => {
  try {
    const { sessions, measurements, settings, userProfile, scheduledReminders } = req.body;

    db.exec("BEGIN TRANSACTION");

    // Clear and re-insert all data
    db.exec("DELETE FROM sessions");
    db.exec("DELETE FROM measurements");
    db.exec("DELETE FROM scheduled_reminders");

    const insertSession = db.prepare(
      "INSERT INTO sessions (id, date, variant, exercises, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    sessions?.forEach((s) => {
      insertSession.run(s.id, s.date, s.variant, JSON.stringify(s.exercises), s.createdAt, s.updatedAt);
    });

    const insertMeasurement = db.prepare(
      `INSERT INTO measurements (id, date, weight, body_fat, measurements, measurement_unit, weight_unit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    measurements?.forEach((m) => {
      insertMeasurement.run(
        m.id, m.date, m.weight, m.bodyFat, JSON.stringify(m.measurements),
        m.measurementUnit, m.weightUnit, m.createdAt, m.updatedAt
      );
    });

    if (settings) {
      db.prepare(
        `INSERT OR REPLACE INTO settings (id, unit, notifications, measurement_notifications, theme)
         VALUES (1, ?, ?, ?, ?)`
      ).run(settings.unit, JSON.stringify(settings.notifications), JSON.stringify(settings.measurementNotifications), settings.theme);
    }

    if (userProfile) {
      db.prepare(
        `INSERT OR REPLACE INTO user_profile (id, name, height, initial_weight, height_unit, weight_unit, onboarding_completed)
         VALUES (1, ?, ?, ?, ?, ?, ?)`
      ).run(userProfile.name, userProfile.height, userProfile.initialWeight, userProfile.heightUnit, userProfile.weightUnit, userProfile.onboardingCompleted ? 1 : 0);
    }

    const insertReminder = db.prepare(
      "INSERT INTO scheduled_reminders (id, date, variant, created_at, completed) VALUES (?, ?, ?, ?, ?)"
    );
    scheduledReminders?.forEach((r) => {
      insertReminder.run(r.id, r.date, r.variant, r.createdAt, r.completed ? 1 : 0);
    });

    db.exec("COMMIT");
    res.json({ success: true });
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// DELETE all data
app.delete("/api/data", (req, res) => {
  try {
    db.exec("DELETE FROM sessions");
    db.exec("DELETE FROM measurements");
    db.exec("DELETE FROM scheduled_reminders");
    db.exec("DELETE FROM user_profile");
    db.prepare("UPDATE settings SET unit = 'kg', notifications = ?, measurement_notifications = ?, theme = 'light' WHERE id = 1")
      .run('{"enabled":false,"days":["monday","wednesday","friday"],"time":"18:00"}', '{"enabled":false,"day":"monday","time":"18:00"}');
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing data:", error);
    res.status(500).json({ error: "Failed to clear data" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Occam Protocol API server running on port ${PORT}`);
});

