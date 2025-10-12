// Storage wrapper using Tauri Store plugin
import { Store } from "@tauri-apps/plugin-store";
import { Task, TaskHistory, Settings } from "../types";

const STORAGE_KEYS = {
  TODAY_TASKS: "dailyTasks", // Keep the same key for backward compatibility
  MUST_DO_TASKS: "mustDoTasks",
  TASK_HISTORY: "taskHistory",
  LAST_DATE: "lastDate",
  SETTINGS: "settings",
} as const;

const DEFAULT_SETTINGS: Settings = {
  autoCarryOver: true,
  notifyInterval: 3,
  darkMode: false,
  autoStart: false,
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
  async setTodayTasks(tasks: Task[]): Promise<void> {
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
};
