import { useState, useEffect } from "react";
import { LearningHistory, LearningTopic, WeeklyLearningEntry } from "../types";
import { storage } from "../store/storage";
import { countTopics } from "../utils/learningHelpers";
import { getWeekBounds } from "../utils/weekHelpers";

export const useLearningHistory = (reloadTrigger?: number) => {
  const [history, setHistory] = useState<LearningHistory>({});

  useEffect(() => {
    const loadHistory = async () => {
      const loadedHistory = await storage.getLearningHistory();
      setHistory(loadedHistory);
    };
    loadHistory();
  }, [reloadTrigger]);

  const addWeekEntry = async (weekId: string, topics: LearningTopic[]) => {
    const { total } = countTopics(topics);
    const { start, end } = getWeekBounds(weekId);

    // Load current history from storage to avoid race conditions
    const currentHistory = await storage.getLearningHistory();

    const newHistory = {
      ...currentHistory,
      [weekId]: {
        weekId,
        weekStart: start,
        weekEnd: end,
        topics,
        total,
      },
    };

    setHistory(newHistory);
    await storage.setLearningHistory(newHistory);
  };

  const updateWeekEntry = async (
    weekId: string,
    updates: Partial<WeeklyLearningEntry>
  ) => {
    const currentHistory = await storage.getLearningHistory();
    const existingEntry = currentHistory[weekId];

    if (!existingEntry) return;

    const updatedEntry = {
      ...existingEntry,
      ...updates,
    };

    const newHistory = {
      ...currentHistory,
      [weekId]: updatedEntry,
    };

    setHistory(newHistory);
    await storage.setLearningHistory(newHistory);
  };

  const getWeekEntry = (weekId: string): WeeklyLearningEntry | undefined => {
    return history[weekId];
  };

  const getRecentWeeks = (limit: number = 10): WeeklyLearningEntry[] => {
    return Object.values(history)
      .sort((a, b) => b.weekId.localeCompare(a.weekId))
      .slice(0, limit);
  };

  const getAllWeekEntries = (): WeeklyLearningEntry[] => {
    return Object.values(history).sort((a, b) =>
      b.weekId.localeCompare(a.weekId)
    );
  };

  const getWeeksInRange = (
    startWeek: string,
    endWeek: string
  ): WeeklyLearningEntry[] => {
    return Object.values(history)
      .filter((entry) => entry.weekId >= startWeek && entry.weekId <= endWeek)
      .sort((a, b) => b.weekId.localeCompare(a.weekId));
  };

  const getTotalWeeks = (): number => {
    return Object.keys(history).length;
  };

  const getWeeksWithActivity = (): number => {
    return Object.values(history).filter((entry) => entry.topics.length > 0)
      .length;
  };

  return {
    history,
    addWeekEntry,
    updateWeekEntry,
    getWeekEntry,
    getRecentWeeks,
    getAllWeekEntries,
    getWeeksInRange,
    getTotalWeeks,
    getWeeksWithActivity,
  };
};
