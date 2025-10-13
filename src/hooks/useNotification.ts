import { useEffect, useState } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export const useNotification = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        let granted = await isPermissionGranted();
        if (!granted) {
          const permission = await requestPermission();
          granted = permission === "granted";
        }
        setPermissionGranted(granted);
      } catch (error) {
        console.error("Failed to check notification permission:", error);
      }
    };

    checkPermission();
  }, []);

  const notify = async (title: string, body: string) => {
    try {
      if (!permissionGranted) {
        console.warn("Notification permission not granted");
        return;
      }

      sendNotification({ title, body });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return { notify, permissionGranted };
};
