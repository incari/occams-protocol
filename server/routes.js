import express from "express";
import db from "./database.js";

const router = express.Router();

const parseJSON = (str, fallback) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

// Sessions
router.get("/sessions", (req, res) => {
  const sessions = db.prepare("SELECT * FROM sessions ORDER BY date DESC").all();
  res.json(sessions.map((s) => ({
    id: s.id, date: s.date, variant: s.variant,
    exercises: parseJSON(s.exercises, []),
    createdAt: s.created_at, updatedAt: s.updated_at,
  })));
});

router.post("/sessions", (req, res) => {
  const { id, date, variant, exercises, createdAt, updatedAt } = req.body;
  db.prepare("INSERT INTO sessions (id, date, variant, exercises, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, date, variant, JSON.stringify(exercises), createdAt, updatedAt);
  res.json({ success: true });
});

router.put("/sessions/:id", (req, res) => {
  const updates = req.body;
  const existing = db.prepare("SELECT * FROM sessions WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Session not found" });
  
  db.prepare("UPDATE sessions SET date = ?, variant = ?, exercises = ?, updated_at = ? WHERE id = ?")
    .run(updates.date ?? existing.date, updates.variant ?? existing.variant,
         updates.exercises ? JSON.stringify(updates.exercises) : existing.exercises,
         Date.now(), req.params.id);
  res.json({ success: true });
});

router.delete("/sessions/:id", (req, res) => {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Measurements
router.get("/measurements", (req, res) => {
  const measurements = db.prepare("SELECT * FROM measurements ORDER BY date DESC").all();
  res.json(measurements.map((m) => ({
    id: m.id, date: m.date, weight: m.weight, bodyFat: m.body_fat,
    measurements: parseJSON(m.measurements, {}),
    measurementUnit: m.measurement_unit, weightUnit: m.weight_unit,
    createdAt: m.created_at, updatedAt: m.updated_at,
  })));
});

router.post("/measurements", (req, res) => {
  const { id, date, weight, bodyFat, measurements, measurementUnit, weightUnit, createdAt, updatedAt } = req.body;
  db.prepare(`INSERT INTO measurements (id, date, weight, body_fat, measurements, measurement_unit, weight_unit, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, date, weight, bodyFat, JSON.stringify(measurements), measurementUnit, weightUnit, createdAt, updatedAt);
  res.json({ success: true });
});

router.put("/measurements/:id", (req, res) => {
  const updates = req.body;
  const existing = db.prepare("SELECT * FROM measurements WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Measurement not found" });
  
  db.prepare(`UPDATE measurements SET date = ?, weight = ?, body_fat = ?, measurements = ?, 
              measurement_unit = ?, weight_unit = ?, updated_at = ? WHERE id = ?`)
    .run(updates.date ?? existing.date, updates.weight ?? existing.weight,
         updates.bodyFat ?? existing.body_fat,
         updates.measurements ? JSON.stringify(updates.measurements) : existing.measurements,
         updates.measurementUnit ?? existing.measurement_unit,
         updates.weightUnit ?? existing.weight_unit, Date.now(), req.params.id);
  res.json({ success: true });
});

router.delete("/measurements/:id", (req, res) => {
  db.prepare("DELETE FROM measurements WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Settings
router.get("/settings", (req, res) => {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  res.json(row ? {
    unit: row.unit, notifications: parseJSON(row.notifications, {}),
    measurementNotifications: parseJSON(row.measurement_notifications, {}), theme: row.theme,
  } : null);
});

router.put("/settings", (req, res) => {
  const { unit, notifications, measurementNotifications, theme } = req.body;
  const existing = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  db.prepare(`INSERT OR REPLACE INTO settings (id, unit, notifications, measurement_notifications, theme) VALUES (1, ?, ?, ?, ?)`)
    .run(unit ?? existing?.unit ?? "kg",
         notifications ? JSON.stringify(notifications) : existing?.notifications ?? "{}",
         measurementNotifications ? JSON.stringify(measurementNotifications) : existing?.measurement_notifications ?? "{}",
         theme ?? existing?.theme ?? "light");
  res.json({ success: true });
});

// Profile
router.get("/profile", (req, res) => {
  const row = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
  res.json(row ? {
    name: row.name, height: row.height, initialWeight: row.initial_weight,
    heightUnit: row.height_unit, weightUnit: row.weight_unit,
    onboardingCompleted: Boolean(row.onboarding_completed),
  } : null);
});

router.put("/profile", (req, res) => {
  const updates = req.body;
  const existing = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
  db.prepare(`INSERT OR REPLACE INTO user_profile (id, name, height, initial_weight, height_unit, weight_unit, onboarding_completed)
              VALUES (1, ?, ?, ?, ?, ?, ?)`)
    .run(updates.name ?? existing?.name, updates.height ?? existing?.height,
         updates.initialWeight ?? existing?.initial_weight,
         updates.heightUnit ?? existing?.height_unit, updates.weightUnit ?? existing?.weight_unit,
         updates.onboardingCompleted !== undefined ? (updates.onboardingCompleted ? 1 : 0) : (existing?.onboarding_completed ?? 0));
  res.json({ success: true });
});

// Reminders
router.get("/reminders", (req, res) => {
  const reminders = db.prepare("SELECT * FROM scheduled_reminders").all();
  res.json(reminders.map((r) => ({
    id: r.id, date: r.date, variant: r.variant, createdAt: r.created_at, completed: Boolean(r.completed),
  })));
});

router.post("/reminders", (req, res) => {
  const { date, variant } = req.body;
  const existing = db.prepare("SELECT * FROM scheduled_reminders WHERE date = ? AND variant = ?").get(date, variant);
  if (existing) return res.json({ id: existing.id, date: existing.date, variant: existing.variant, createdAt: existing.created_at, completed: Boolean(existing.completed) });
  
  const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = Date.now();
  db.prepare("INSERT INTO scheduled_reminders (id, date, variant, created_at, completed) VALUES (?, ?, ?, ?, 0)").run(id, date, variant, createdAt);
  res.json({ id, date, variant, createdAt, completed: false });
});

router.put("/reminders/:id/complete", (req, res) => {
  db.prepare("UPDATE scheduled_reminders SET completed = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.delete("/reminders/:id", (req, res) => {
  db.prepare("DELETE FROM scheduled_reminders WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;

