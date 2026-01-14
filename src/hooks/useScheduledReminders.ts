import { useState, useEffect, useCallback } from "react";
import type { ScheduledReminder, Variant } from "../types";
import {
  getScheduledReminders,
  addScheduledReminder,
  deleteScheduledReminder,
  markReminderCompleted,
} from "../utils/storage";

export function useScheduledReminders() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReminders(
      getScheduledReminders().sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
    setLoading(false);
  }, []);

  const scheduleReminder = useCallback((date: string, variant: Variant) => {
    const newReminder = addScheduledReminder(date, variant);
    if (newReminder) {
      setReminders((prev) =>
        [...prev.filter((r) => r.id !== newReminder.id), newReminder].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      return newReminder;
    }
    return null;
  }, []);

  const removeReminder = useCallback((id: string) => {
    if (deleteScheduledReminder(id)) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      return true;
    }
    return false;
  }, []);

  const completeReminder = useCallback((id: string) => {
    if (markReminderCompleted(id)) {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: true } : r))
      );
      return true;
    }
    return false;
  }, []);

  const rescheduleReminder = useCallback(
    (id: string, newDate: string, newVariant: Variant) => {
      // Remove old and add new
      if (deleteScheduledReminder(id)) {
        const newReminder = addScheduledReminder(newDate, newVariant);
        if (newReminder) {
          setReminders((prev) =>
            [...prev.filter((r) => r.id !== id), newReminder].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          );
          return newReminder;
        }
      }
      return null;
    },
    []
  );

  const getRemindersByDate = useCallback(
    (date: string) => {
      return reminders.filter((r) => r.date === date && !r.completed);
    },
    [reminders]
  );

  const getUpcomingReminders = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reminders.filter((r) => !r.completed && new Date(r.date) >= today);
  }, [reminders]);

  return {
    reminders,
    loading,
    scheduleReminder,
    removeReminder,
    completeReminder,
    rescheduleReminder,
    getRemindersByDate,
    getUpcomingReminders,
  };
}
