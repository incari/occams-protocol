import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useNotifications } from '../../hooks/useNotifications';
import { exportData, importData, clearAllData } from '../../utils/storage';
import { CombinedHistory } from '../History/CombinedHistory';

const WEEKDAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const { requestPermission, hasPermission } = useNotifications();
  const [message, setMessage] = useState<string>('');

  const handleUnitChange = (unit: 'kg' | 'lbs') => {
    updateSettings({ unit });
    setMessage('Unit preference saved');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setMessage('Theme preference saved');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setMessage('Notification permission denied');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }
    updateSettings({
      notifications: { ...settings.notifications, enabled },
    });
    setMessage(enabled ? 'Notifications enabled' : 'Notifications disabled');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDayToggle = (day: string) => {
    const currentDays = settings.notifications.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    updateSettings({
      notifications: { ...settings.notifications, days: newDays },
    });
  };

  const handleTimeChange = (time: string) => {
    updateSettings({
      notifications: { ...settings.notifications, time },
    });
  };

  const handleMeasurementNotificationToggle = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setMessage('Notification permission denied');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }
    updateSettings({
      measurementNotifications: { ...settings.measurementNotifications, enabled },
    });
    setMessage(enabled ? 'Measurement notifications enabled' : 'Measurement notifications disabled');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleMeasurementDayChange = (day: string) => {
    updateSettings({
      measurementNotifications: { ...settings.measurementNotifications, day },
    });
  };

  const handleMeasurementTimeChange = (time: string) => {
    updateSettings({
      measurementNotifications: { ...settings.measurementNotifications, time },
    });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `occam-protocol-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Data exported successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          if (importData(data)) {
            setMessage('Data imported successfully');
            window.location.reload(); // Reload to reflect changes
          } else {
            setMessage('Failed to import data. Invalid format.');
          }
        } catch (error) {
          setMessage('Error importing data');
        }
        setTimeout(() => setMessage(''), 3000);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      if (clearAllData()) {
        setMessage('All data cleared');
        window.location.reload();
      } else {
        setMessage('Failed to clear data');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Settings</h1>

      {message && (
        <div className="card mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Units */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Weight Unit</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleUnitChange('kg')}
              className={`btn flex-1 ${settings.unit === 'kg' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Kilograms (kg)
            </button>
            <button
              onClick={() => handleUnitChange('lbs')}
              className={`btn flex-1 ${settings.unit === 'lbs' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pounds (lbs)
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Theme</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`btn flex-1 ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`btn flex-1 ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {settings.notifications.enabled && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Training Days</label>
                <div className="grid grid-cols-2 gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`btn btn-secondary text-sm ${
                        settings.notifications.days.includes(day.value)
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : ''
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notification-time" className="block text-sm font-medium mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  id="notification-time"
                  value={settings.notifications.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Measurement Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Measurement Reminders</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.measurementNotifications.enabled}
                onChange={(e) => handleMeasurementNotificationToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {settings.measurementNotifications.enabled && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Day of Week</label>
                <select
                  value={settings.measurementNotifications.day}
                  onChange={(e) => handleMeasurementDayChange(e.target.value)}
                  className="input"
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="measurement-notification-time" className="block text-sm font-medium mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  id="measurement-notification-time"
                  value={settings.measurementNotifications.time}
                  onChange={(e) => handleMeasurementTimeChange(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">History</h2>
          <CombinedHistory />
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className="space-y-3">
            <button onClick={handleExport} className="btn btn-secondary w-full">
              Export Data
            </button>
            <button onClick={handleImport} className="btn btn-secondary w-full">
              Import Data
            </button>
            <button onClick={handleClearData} className="btn btn-danger w-full">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
