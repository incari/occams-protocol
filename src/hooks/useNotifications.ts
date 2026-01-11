import { useEffect, useCallback } from "react";
import { useSettings } from "./useSettings";
import { getDayName } from "../utils/dateUtils";

export function useNotifications() {
  const { settings } = useSettings();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  const scheduleNotifications = useCallback(async () => {
    if (!settings.notifications.enabled) {
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      return;
    }

    // Clear existing notifications
    if (
      "serviceWorker" in navigator &&
      "showNotification" in ServiceWorkerRegistration.prototype
    ) {
      await navigator.serviceWorker.ready;
      // Schedule notifications for each training day
      // This would be handled by the service worker
      // For now, we'll just check if it's a training day
    }
  }, [settings, requestPermission]);

  const sendNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }

      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification(title, {
            badge: "/pwa-192x192.png",
            icon: "/pwa-192x192.png",
            ...options,
          });
        } catch (error) {
          // Fallback to regular notification
          new Notification(title, options);
        }
      } else {
        new Notification(title, options);
      }
    },
    [requestPermission]
  );

  const checkTrainingDay = useCallback(() => {
    if (!settings.notifications.enabled) {
      return false;
    }

    const today = getDayName(new Date());
    return settings.notifications.days.includes(today);
  }, [settings]);

  const checkMeasurementDay = useCallback(() => {
    if (!settings.measurementNotifications.enabled) {
      return false;
    }

    const today = getDayName(new Date());
    return settings.measurementNotifications.day === today;
  }, [settings]);

  useEffect(() => {
    scheduleNotifications();

    // Check for measurement notification day
    if (checkMeasurementDay()) {
      const [hours, minutes] =
        settings.measurementNotifications.time.split(":");
      const now = new Date();
      const notificationTime = new Date();
      notificationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Check if it's time for measurement notification
      if (
        now.getHours() === parseInt(hours) &&
        now.getMinutes() === parseInt(minutes)
      ) {
        sendNotification("Time to log your body measurements!", {
          body: "Track your progress with weekly measurements",
        });
      }
    }
  }, [scheduleNotifications, checkMeasurementDay, settings, sendNotification]);

  return {
    requestPermission,
    sendNotification,
    checkTrainingDay,
    hasPermission:
      "Notification" in window && Notification.permission === "granted",
  };
}
