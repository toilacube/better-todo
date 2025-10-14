// Storage wrapper using Tauri Store plugin
import { Store } from "@tauri-apps/plugin-store";
import {
  Task,
  TaskHistory,
  Settings,
  LearningTopic,
  LearningHistory,
  LearningSettings,
  LearningStatistics,
} from "../types";
import { getCurrentWeekId } from "../utils/weekHelpers";

const STORAGE_KEYS = {
  TODAY_TASKS: "dailyTasks", // Keep the same key for backward compatibility
  MUST_DO_TASKS: "mustDoTasks",
  TASK_HISTORY: "taskHistory",
  LAST_DATE: "lastDate",
  SETTINGS: "settings",
  // Learning Tracker keys
  LEARNING_CURRENT_WEEK: "learningCurrentWeekTopics",
  LEARNING_HISTORY: "learningHistory",
  LEARNING_LAST_WEEK: "learningLastWeekId",
  LEARNING_SETTINGS: "learningSettings",
  LEARNING_STATISTICS: "learningStatistics",
} as const;

const DEFAULT_SETTINGS: Settings = {
  autoCarryOver: true,
  notifyInterval: 3,
  darkMode: false,
  autoStart: false,
};

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  autoCreateNewWeek: true,
  weekStartDay: 1, // ISO standard (Monday)
};

const DEFAULT_LEARNING_STATISTICS: LearningStatistics = {
  totalTopics: 0,
  totalBlogPosts: 0,
  totalWeeks: 0,
  currentWeekStreak: 0,
  longestWeekStreak: 0,
  topicsByMonth: {},
  topicsByWeek: {},
};

// Singleton store instance
let storeInstance: Store | null = null;

const getStore = async (): Promise<Store> => {
  if (!storeInstance) {
    storeInstance = await Store.load("store.json");
    // Store will auto-save by default
  }
  return storeInstance;
};

export const storage = {
  // Generic get/set with JSON parsing
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const store = await getStore();
      const item = await store.get<T>(key);
      return item !== null && item !== undefined ? item : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const store = await getStore();
      await store.set(key, value);
      await store.save(); // Explicitly save changes
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
    }
  },

  // Specific getters
  async getTodayTasks(): Promise<Task[]> {
    return this.get<Task[]>(STORAGE_KEYS.TODAY_TASKS, []);
  },

  async getMustDoTasks(): Promise<Task[]> {
    return this.get<Task[]>(STORAGE_KEYS.MUST_DO_TASKS, []);
  },

  async getTaskHistory(): Promise<TaskHistory> {
    return this.get<TaskHistory>(STORAGE_KEYS.TASK_HISTORY, {});
  },

  async getLastDate(): Promise<string> {
    return this.get<string>(STORAGE_KEYS.LAST_DATE, new Date().toDateString());
  },

  async getSettings(): Promise<Settings> {
    return this.get<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  // Specific setters
  async   setTodayTasks(tasks: Task[]): Promise<void> {
    await this.set(STORAGE_KEYS.TODAY_TASKS, tasks);
  },

  async setMustDoTasks(tasks: Task[]): Promise<void> {
    await this.set(STORAGE_KEYS.MUST_DO_TASKS, tasks);
  },

  async setTaskHistory(history: TaskHistory): Promise<void> {
    await this.set(STORAGE_KEYS.TASK_HISTORY, history);
  },

  async setLastDate(date: string): Promise<void> {
    await this.set(STORAGE_KEYS.LAST_DATE, date);
  },

  async setSettings(settings: Settings): Promise<void> {
    await this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // Batch operation to set all data atomically
  async setAll(data: {
    todayTasks: Task[];
    mustDoTasks: Task[];
    taskHistory: TaskHistory;
    lastDate: string;
    settings: Settings;
  }): Promise<void> {
    try {
      const store = await getStore();
      // Set all values
      await store.set(STORAGE_KEYS.TODAY_TASKS, data.todayTasks);
      await store.set(STORAGE_KEYS.MUST_DO_TASKS, data.mustDoTasks);
      await store.set(STORAGE_KEYS.TASK_HISTORY, data.taskHistory);
      await store.set(STORAGE_KEYS.LAST_DATE, data.lastDate);
      await store.set(STORAGE_KEYS.SETTINGS, data.settings);
      // Save once after all values are set
      await store.save();
    } catch (error) {
      console.error("Error writing all data to storage:", error);
      throw error; // Re-throw to allow caller to handle
    }
  },

  // ==========================================
  // Learning Tracker Storage Methods
  // ==========================================

  // Learning - Specific getters
  async getCurrentWeekTopics(): Promise<LearningTopic[]> {
    return this.get<LearningTopic[]>(STORAGE_KEYS.LEARNING_CURRENT_WEEK, []);
  },

  async getLearningHistory(): Promise<LearningHistory> {
    return this.get<LearningHistory>(STORAGE_KEYS.LEARNING_HISTORY, {});
  },

  async getLastWeekId(): Promise<string> {
    return this.get<string>(STORAGE_KEYS.LEARNING_LAST_WEEK, getCurrentWeekId());
  },

  async getLearningSettings(): Promise<LearningSettings> {
    return this.get<LearningSettings>(
      STORAGE_KEYS.LEARNING_SETTINGS,
      DEFAULT_LEARNING_SETTINGS
    );
  },

  async getLearningStatistics(): Promise<LearningStatistics> {
    return this.get<LearningStatistics>(
      STORAGE_KEYS.LEARNING_STATISTICS,
      DEFAULT_LEARNING_STATISTICS
    );
  },

  // Learning - Specific setters
  async setCurrentWeekTopics(topics: LearningTopic[]): Promise<void> {
    await this.set(STORAGE_KEYS.LEARNING_CURRENT_WEEK, topics);
  },

  async setLearningHistory(history: LearningHistory): Promise<void> {
    await this.set(STORAGE_KEYS.LEARNING_HISTORY, history);
  },

  async setLastWeekId(weekId: string): Promise<void> {
    await this.set(STORAGE_KEYS.LEARNING_LAST_WEEK, weekId);
  },

  async setLearningSettings(settings: LearningSettings): Promise<void> {
    await this.set(STORAGE_KEYS.LEARNING_SETTINGS, settings);
  },

  async setLearningStatistics(statistics: LearningStatistics): Promise<void> {
    await this.set(STORAGE_KEYS.LEARNING_STATISTICS, statistics);
  },

  // Batch operation for learning data
  async setAllLearningData(data: {
    currentWeekTopics: LearningTopic[];
    learningHistory: LearningHistory;
    lastWeekId: string;
    learningSettings: LearningSettings;
    learningStatistics: LearningStatistics;
  }): Promise<void> {
    try {
      const store = await getStore();
      await store.set(STORAGE_KEYS.LEARNING_CURRENT_WEEK, data.currentWeekTopics);
      await store.set(STORAGE_KEYS.LEARNING_HISTORY, data.learningHistory);
      await store.set(STORAGE_KEYS.LEARNING_LAST_WEEK, data.lastWeekId);
      await store.set(STORAGE_KEYS.LEARNING_SETTINGS, data.learningSettings);
      await store.save();
    } catch (error) {
      console.error("Error writing all learning data to storage:", error);
      throw error;
    }
  },
};
