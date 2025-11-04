import { Task, TaskHistory, Settings } from "../types";

/**
 * Test utilities for storage tests
 */

export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  text: "Mock task",
  completed: false,
  subtasks: [],
  expanded: false,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockTaskWithSubtasks = (
  parentId: number,
  subtaskCount: number = 2
): Task => ({
  id: parentId,
  text: `Parent task ${parentId}`,
  completed: false,
  expanded: true,
  created_at: new Date().toISOString(),
  subtasks: Array.from({ length: subtaskCount }, (_, i) => ({
    id: parentId * 100 + i + 1,
    text: `Subtask ${i + 1}`,
    completed: false,
    subtasks: [],
    expanded: false,
    created_at: new Date().toISOString(),
  })),
});

export const createMockSettings = (
  overrides: Partial<Settings> = {}
): Settings => ({
  autoCarryOver: true,
  notifyInterval: 3,
  darkMode: false,
  autoStart: false,
  ...overrides,
});

export const createMockTaskHistory = (entries: number = 3): TaskHistory => {
  const history: TaskHistory = {};

  for (let i = 0; i < entries; i++) {
    const date = new Date(2024, 0, i + 1).toDateString();
    const tasks = [
      createMockTask({
        id: i * 10 + 1,
        text: `Task 1 for ${date}`,
        completed: true,
      }),
      createMockTask({
        id: i * 10 + 2,
        text: `Task 2 for ${date}`,
        completed: false,
      }),
    ];

    history[date] = {
      date,
      tasks,
      completed: 1,
      total: 2,
    };
  }

  return history;
};

export const createComplexTaskStructure = (): Task[] => [
  {
    id: 1,
    text: "Complex project",
    completed: false,
    expanded: true,
    created_at: new Date().toISOString(),
    subtasks: [
      {
        id: 2,
        text: "Phase 1",
        completed: true,
        expanded: true,
        created_at: new Date().toISOString(),
        subtasks: [
          {
            id: 3,
            text: "Research",
            completed: true,
            subtasks: [],
            expanded: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 4,
            text: "Planning",
            completed: true,
            subtasks: [],
            expanded: false,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 5,
        text: "Phase 2",
        completed: false,
        expanded: false,
        created_at: new Date().toISOString(),
        subtasks: [
          {
            id: 6,
            text: "Implementation",
            completed: false,
            subtasks: [],
            expanded: false,
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: 7,
    text: "Simple task",
    completed: true,
    subtasks: [],
    expanded: false,
    created_at: new Date().toISOString(),
  },
];

export const mockStoreFactory = () => ({
  get: jest.fn(),
  set: jest.fn(),
  save: jest.fn(),
});

export const expectTaskStructure = (task: any) => {
  expect(task).toHaveProperty("id");
  expect(task).toHaveProperty("text");
  expect(task).toHaveProperty("completed");
  expect(task).toHaveProperty("subtasks");
  expect(task).toHaveProperty("expanded");
  expect(task).toHaveProperty("created_at");
  expect(typeof task.id).toBe("number");
  expect(typeof task.text).toBe("string");
  expect(typeof task.completed).toBe("boolean");
  expect(Array.isArray(task.subtasks)).toBe(true);
  expect(typeof task.expanded).toBe("boolean");
  expect(typeof task.created_at).toBe("string");
  // finished_at is optional, only check if it exists
  if (task.finished_at !== undefined) {
    expect(typeof task.finished_at).toBe("string");
  }
};

export const expectSettingsStructure = (settings: any) => {
  expect(settings).toHaveProperty("autoCarryOver");
  expect(settings).toHaveProperty("notifyInterval");
  expect(settings).toHaveProperty("darkMode");
  expect(settings).toHaveProperty("autoStart");
  expect(typeof settings.autoCarryOver).toBe("boolean");
  expect(typeof settings.notifyInterval).toBe("number");
  expect(typeof settings.darkMode).toBe("boolean");
  expect(typeof settings.autoStart).toBe("boolean");
};

export const expectHistoryEntryStructure = (entry: any) => {
  expect(entry).toHaveProperty("date");
  expect(entry).toHaveProperty("tasks");
  expect(entry).toHaveProperty("completed");
  expect(entry).toHaveProperty("total");
  expect(typeof entry.date).toBe("string");
  expect(Array.isArray(entry.tasks)).toBe(true);
  expect(typeof entry.completed).toBe("number");
  expect(typeof entry.total).toBe("number");
};
