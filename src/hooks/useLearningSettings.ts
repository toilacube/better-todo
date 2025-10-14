import { useState, useEffect } from "react";
import { LearningSettings } from "../types";
import { storage } from "../store/storage";

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  autoCreateNewWeek: true,
  weekStartDay: 1, // ISO standard (Monday)
};

export const useLearningSettings = (reloadTrigger?: number) => {
  const [learningSettings, setLearningSettings] = useState<LearningSettings>(
    DEFAULT_LEARNING_SETTINGS
  );

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await storage.getLearningSettings();
      setLearningSettings(loadedSettings);
    };

    loadSettings();
  }, [reloadTrigger]);

  const updateLearningSettings = async (
    newSettings: Partial<LearningSettings>
  ) => {
    const updated = { ...learningSettings, ...newSettings };
    setLearningSettings(updated);
    await storage.setLearningSettings(updated);
  };

  return {
    learningSettings,
    updateLearningSettings,
  };
};
