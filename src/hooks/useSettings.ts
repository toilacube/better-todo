import { useState, useEffect } from "react";
import { Settings } from "../types";
import { storage } from "../store/storage";
import { isEnabled } from "@tauri-apps/plugin-autostart";

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    autoCarryOver: true,
    notifyInterval: 3,
    darkMode: false,
    autoStart: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = storage.getSettings();

      // Sync autostart setting with actual system state
      try {
        const actualAutostartState = await isEnabled();
        const updatedSettings = {
          ...loadedSettings,
          autoStart: actualAutostartState,
        };
        setSettings(updatedSettings);

        // Update storage if there's a mismatch
        if (loadedSettings.autoStart !== actualAutostartState) {
          storage.setSettings(updatedSettings);
        }
      } catch (error) {
        console.error("Failed to check autostart state:", error);
        setSettings(loadedSettings);
      }
    };

    loadSettings();
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
