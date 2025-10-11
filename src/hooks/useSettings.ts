import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { storage } from '../store/storage';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    autoCarryOver: true,
    notifyInterval: 3,
    darkMode: false,
  });

  useEffect(() => {
    const loadedSettings = storage.getSettings();
    setSettings(loadedSettings);
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storage.setSettings(updated);
  };

  return {
    settings,
    updateSettings,
  };
};
