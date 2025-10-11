// Storage wrapper using localStorage for now (can be replaced with Tauri store later)
import { Task, TaskHistory, Settings } from "../types";

const STORAGE_KEYS = {
  DAILY_TASKS: "dailyTasks",
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

export const storage = {
  // Generic get/set with JSON parsing
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
    }
  },

  // Specific getters
  getDailyTasks(): Task[] {
    return this.get<Task[]>(STORAGE_KEYS.DAILY_TASKS, []);
  },

  getMustDoTasks(): Task[] {
    return this.get<Task[]>(STORAGE_KEYS.MUST_DO_TASKS, []);
  },

  getTaskHistory(): TaskHistory {
    return this.get<TaskHistory>(STORAGE_KEYS.TASK_HISTORY, {});
  },

  getLastDate(): string {
    return this.get<string>(STORAGE_KEYS.LAST_DATE, new Date().toDateString());
  },

  getSettings(): Settings {
    return this.get<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  // Specific setters
  setDailyTasks(tasks: Task[]): void {
    this.set(STORAGE_KEYS.DAILY_TASKS, tasks);
  },

  setMustDoTasks(tasks: Task[]): void {
    this.set(STORAGE_KEYS.MUST_DO_TASKS, tasks);
  },

  setTaskHistory(history: TaskHistory): void {
    this.set(STORAGE_KEYS.TASK_HISTORY, history);
  },

  setLastDate(date: string): void {
    this.set(STORAGE_KEYS.LAST_DATE, date);
  },

  setSettings(settings: Settings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  },
};
