import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { Task, TaskHistory, Settings } from "../types";

// Create mock store instance
const mockStore = {
  get: jest.fn<(key: string) => Promise<any>>(),
  set: jest.fn<(key: string, value: any) => Promise<void>>(),
  save: jest.fn<() => Promise<void>>(),
};

// Mock the Tauri Store
jest.mock("@tauri-apps/plugin-store", () => ({
  Store: {
    load: jest.fn<(path: string) => Promise<typeof mockStore>>().mockResolvedValue(mockStore),
  },
}));

describe("Storage Operations", () => {
  let storage: any;

  const defaultSettings: Settings = {
    autoCarryOver: true,
    notifyInterval: 3,
    darkMode: false,
    autoStart: false,
  };

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Import storage fresh (after mocks are set up)
    storage = (await import("../store/storage")).storage;
  });

  describe("Generic get/set operations", () => {
    it("should get existing value from storage", async () => {
      const testValue = { test: "data" };
      mockStore.get.mockResolvedValue(testValue);

      const result = await storage.get("testKey", null);

      expect(mockStore.get).toHaveBeenCalledWith("testKey");
      expect(result).toEqual(testValue);
    });

    it("should return default value when item does not exist", async () => {
      mockStore.get.mockResolvedValue(null);
      const defaultValue = { default: "value" };

      const result = await storage.get("nonExistentKey", defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it("should set value in storage", async () => {
      const testValue = { test: "data" };
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockResolvedValue(undefined);

      await storage.set("testKey", testValue);

      expect(mockStore.set).toHaveBeenCalledWith("testKey", testValue);
      expect(mockStore.save).toHaveBeenCalled();
    });

    it("should handle storage errors gracefully", async () => {
      const error = new Error("Storage error");
      mockStore.get.mockRejectedValue(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await storage.get("errorKey", "default");

      expect(result).toBe("default");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error reading errorKey from storage:",
        error
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Today Tasks operations", () => {
    const sampleTasks: Task[] = [
      {
        id: 1,
        text: "Test task",
        completed: false,
        subtasks: [],
        expanded: false,
        created_at: new Date().toISOString(),
      },
    ];

    it("should get today tasks", async () => {
      mockStore.get.mockResolvedValue(sampleTasks);

      const result = await storage.getTodayTasks();

      expect(mockStore.get).toHaveBeenCalledWith("dailyTasks");
      expect(result).toEqual(sampleTasks);
    });

    it("should return empty array when no tasks exist", async () => {
      mockStore.get.mockResolvedValue(null);

      const result = await storage.getTodayTasks();

      expect(result).toEqual([]);
    });

    it("should set today tasks", async () => {
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockResolvedValue(undefined);

      await storage.setTodayTasks(sampleTasks);

      expect(mockStore.set).toHaveBeenCalledWith("dailyTasks", sampleTasks);
      expect(mockStore.save).toHaveBeenCalled();
    });
  });

  describe("Must-Do Tasks operations", () => {
    const sampleMustDoTasks: Task[] = [
      {
        id: 1,
        text: "Important task",
        completed: false,
        subtasks: [],
        expanded: false,
        created_at: new Date().toISOString(),
      },
    ];

    it("should get must-do tasks", async () => {
      mockStore.get.mockResolvedValue(sampleMustDoTasks);

      const result = await storage.getMustDoTasks();

      expect(mockStore.get).toHaveBeenCalledWith("mustDoTasks");
      expect(result).toEqual(sampleMustDoTasks);
    });

    it("should set must-do tasks", async () => {
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockResolvedValue(undefined);

      await storage.setMustDoTasks(sampleMustDoTasks);

      expect(mockStore.set).toHaveBeenCalledWith(
        "mustDoTasks",
        sampleMustDoTasks
      );
      expect(mockStore.save).toHaveBeenCalled();
    });
  });

  describe("Task History operations", () => {
    const sampleHistory: TaskHistory = {
      "2024-01-01": {
        date: "2024-01-01",
        tasks: [
          {
            id: 1,
            text: "Historical task",
            completed: true,
            subtasks: [],
            expanded: false,
            created_at: new Date().toISOString(),
          },
        ],
        completed: 1,
        total: 1,
      },
    };

    it("should get task history", async () => {
      mockStore.get.mockResolvedValue(sampleHistory);

      const result = await storage.getTaskHistory();

      expect(mockStore.get).toHaveBeenCalledWith("taskHistory");
      expect(result).toEqual(sampleHistory);
    });

    it("should return empty object when no history exists", async () => {
      mockStore.get.mockResolvedValue(null);

      const result = await storage.getTaskHistory();

      expect(result).toEqual({});
    });

    it("should set task history", async () => {
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockResolvedValue(undefined);

      await storage.setTaskHistory(sampleHistory);

      expect(mockStore.set).toHaveBeenCalledWith("taskHistory", sampleHistory);
      expect(mockStore.save).toHaveBeenCalled();
    });
  });

  describe("Last Date operations", () => {
    it("should get last date", async () => {
      const testDate = "2024-01-15";
      mockStore.get.mockResolvedValue(testDate);

      const result = await storage.getLastDate();

      expect(mockStore.get).toHaveBeenCalledWith("lastDate");
      expect(result).toBe(testDate);
    });

    it("should return current date when no last date exists", async () => {
      mockStore.get.mockResolvedValue(null);
      const currentDate = new Date().toDateString();

      const result = await storage.getLastDate();

      expect(result).toBe(currentDate);
    });

    it("should set last date", async () => {
      const testDate = "2024-01-15";
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockResolvedValue(undefined);

      await storage.setLastDate(testDate);

      expect(mockStore.set).toHaveBeenCalledWith("lastDate", testDate);
      expect(mockStore.save).toHaveBeenCalled();
    });
  });

  describe("Settings operations", () => {
    const sampleSettings: Settings = {
      autoCarryOver: false,
      notifyInterval: 5,
      darkMode: true,
      autoStart: true,
    };

    it("should get settings", async () => {
      mockStore.get.mockResolvedValue(sampleSettings);

      const result = await storage.getSettings();

      expect(mockStore.get).toHaveBeenCalledWith("settings");
      expect(result).toEqual(sampleSettings);
    });

    it("should return default settings when no settings exist", async () => {
      mockStore.get.mockResolvedValue(null);

      const result = await storage.getSettings();

      expect(result).toEqual(defaultSettings);
    });

    it("should set settings", async () => {
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockResolvedValue(undefined);

      await storage.setSettings(sampleSettings);

      expect(mockStore.set).toHaveBeenCalledWith("settings", sampleSettings);
      expect(mockStore.save).toHaveBeenCalled();
    });

    it("should validate settings structure", async () => {
      mockStore.get.mockResolvedValue(sampleSettings);

      const result = await storage.getSettings();

      expect(result).toHaveProperty("autoCarryOver");
      expect(result).toHaveProperty("notifyInterval");
      expect(result).toHaveProperty("darkMode");
      expect(result).toHaveProperty("autoStart");
      expect(typeof result.autoCarryOver).toBe("boolean");
      expect(typeof result.notifyInterval).toBe("number");
      expect(typeof result.darkMode).toBe("boolean");
      expect(typeof result.autoStart).toBe("boolean");
    });
  });

  describe("Error handling", () => {
    it("should handle set operation errors", async () => {
      const error = new Error("Set error");
      mockStore.set.mockRejectedValue(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await storage.set("testKey", "testValue");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error writing testKey to storage:",
        error
      );
      consoleSpy.mockRestore();
    });

    it("should handle save operation errors", async () => {
      const error = new Error("Save error");
      mockStore.set.mockResolvedValue(undefined);
      mockStore.save.mockRejectedValue(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await storage.set("testKey", "testValue");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error writing testKey to storage:",
        error
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Storage keys validation", () => {
    it("should use correct storage keys", async () => {
      mockStore.get.mockResolvedValue([]);

      await storage.getTodayTasks();
      await storage.getMustDoTasks();
      await storage.getTaskHistory();
      await storage.getLastDate();
      await storage.getSettings();

      expect(mockStore.get).toHaveBeenCalledWith("dailyTasks"); // backward compatibility
      expect(mockStore.get).toHaveBeenCalledWith("mustDoTasks");
      expect(mockStore.get).toHaveBeenCalledWith("taskHistory");
      expect(mockStore.get).toHaveBeenCalledWith("lastDate");
      expect(mockStore.get).toHaveBeenCalledWith("settings");
    });
  });
});
