import { useState, useEffect } from "react";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";

export const useAutostart = () => {
  const [isAutostartEnabled, setIsAutostartEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check autostart status on mount
  useEffect(() => {
    const checkAutostart = async () => {
      try {
        const enabled = await isEnabled();
        setIsAutostartEnabled(enabled);
      } catch (error) {
        console.error("Failed to check autostart status:", error);
      }
    };

    checkAutostart();
  }, []);

  const toggleAutostart = async (enable_autostart: boolean) => {
    setIsLoading(true);
    try {
      if (enable_autostart) {
        await enable();
      } else {
        await disable();
      }
      setIsAutostartEnabled(enable_autostart);
    } catch (error) {
      console.error("Failed to toggle autostart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAutostartEnabled,
    isLoading,
    toggleAutostart,
  };
};
