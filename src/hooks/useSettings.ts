import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../types';
import { getSettings, updateSettings as saveSettings } from '../utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSettings(getSettings());
    setLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    if (saveSettings(newSettings)) {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      return true;
    }
    return false;
  }, []);

  return {
    settings,
    loading,
    updateSettings,
  };
}
