import { Task } from "../types";

// Default created_at date for tasks without timestamp (set to a past date)
const DEFAULT_CREATED_AT = "2025-01-01T00:00:00.000Z";

/**
 * Migrates tasks to add created_at timestamp if missing
 * This is needed for tasks created before the timestamp feature was added
 */
export const migrateTasks = (tasks: Task[]): Task[] => {
  const migrateRecursive = (taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      const migratedTask: Task = {
        ...task,
        created_at: task.created_at || DEFAULT_CREATED_AT,
        // Don't set finished_at for old tasks - leave it undefined
        subtasks: task.subtasks.length > 0 ? migrateRecursive(task.subtasks) : [],
      };

      return migratedTask;
    });
  };

  return migrateRecursive(tasks);
};

/**
 * Check if any tasks need migration
 */
export const needsMigration = (tasks: Task[]): boolean => {
  const checkRecursive = (taskList: Task[]): boolean => {
    for (const task of taskList) {
      if (!task.created_at) return true;
      if (task.subtasks.length > 0 && checkRecursive(task.subtasks)) return true;
    }
    return false;
  };

  return checkRecursive(tasks);
};
