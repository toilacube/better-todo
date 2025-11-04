import { Task } from "../types";

// Generate unique task ID
export const generateTaskId = (): number => {
  return Date.now() + Math.random();
};

// Create a new task
export const createTask = (text: string): Task => ({
  id: generateTaskId(),
  text,
  completed: false,
  subtasks: [],
  expanded: false,
  created_at: new Date().toISOString(),
});

// Count total and completed tasks (recursive)
export const countTasks = (
  tasks: Task[]
): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;

  const countRecursive = (taskList: Task[]) => {
    taskList.forEach((task) => {
      total++;
      if (task.completed) completed++;
      if (task.subtasks.length > 0) {
        countRecursive(task.subtasks);
      }
    });
  };

  countRecursive(tasks);
  return { total, completed };
};

// Count only root-level tasks
export const countRootTasks = (
  tasks: Task[]
): { total: number; completed: number } => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  return { total, completed };
};

// Check if all subtasks are completed
export const areAllSubtasksCompleted = (task: Task): boolean => {
  if (task.subtasks.length === 0) return false;
  return task.subtasks.every((subtask) => subtask.completed);
};

// Toggle task completion (with cascading logic)
export const toggleTaskCompletion = (
  tasks: Task[],
  taskId: number,
  newStatus?: boolean
): Task[] => {
  const now = new Date().toISOString();

  const toggleRecursive = (taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        const completed = newStatus !== undefined ? newStatus : !task.completed;

        // If checking parent, check all subtasks and set their finished_at
        const updatedSubtasks = completed
          ? task.subtasks.map((st) => ({
              ...st,
              completed: true,
              finished_at: st.finished_at || now, // Set finished_at if not already set
            }))
          : task.subtasks.map((st) => ({
              ...st,
              finished_at: undefined, // Clear finished_at when unchecking
            }));

        // Determine finished_at for this task
        let finished_at: string | undefined = task.finished_at;
        if (completed) {
          // Only set finished_at if task is completed AND all subtasks are completed
          const allSubtasksCompleted =
            updatedSubtasks.length === 0 ||
            updatedSubtasks.every((st) => st.completed);
          if (allSubtasksCompleted) {
            finished_at = now;
          }
        } else {
          // Clear finished_at when unchecking
          finished_at = undefined;
        }

        return {
          ...task,
          completed,
          subtasks: updatedSubtasks,
          finished_at,
        };
      }

      // Recursively check subtasks
      if (task.subtasks.length > 0) {
        const updatedSubtasks = toggleRecursive(task.subtasks);

        // Auto-complete parent if all subtasks are completed
        const allSubtasksCompleted =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every((st) => st.completed);

        const completed = allSubtasksCompleted || task.completed;

        // Set finished_at if task is now fully completed
        let finished_at = task.finished_at;
        if (completed && allSubtasksCompleted && !task.finished_at) {
          finished_at = now;
        } else if (!completed || !allSubtasksCompleted) {
          // Clear finished_at if task is no longer fully completed
          finished_at = undefined;
        }

        return {
          ...task,
          subtasks: updatedSubtasks,
          completed,
          finished_at,
        };
      }

      return task;
    });
  };

  return toggleRecursive(tasks);
};

// Add a subtask to a parent task
export const addSubtask = (
  tasks: Task[],
  parentId: number,
  text: string
): Task[] => {
  const addRecursive = (taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: [...task.subtasks, createTask(text)],
          expanded: true, // Auto-expand when adding subtask
        };
      }

      if (task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: addRecursive(task.subtasks),
        };
      }

      return task;
    });
  };

  return addRecursive(tasks);
};

// Delete a task
export const deleteTask = (tasks: Task[], taskId: number): Task[] => {
  const deleteRecursive = (taskList: Task[]): Task[] => {
    return taskList
      .filter((task) => task.id !== taskId)
      .map((task) => {
        if (task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: deleteRecursive(task.subtasks),
          };
        }
        return task;
      });
  };

  return deleteRecursive(tasks);
};

// Toggle task expansion
export const toggleTaskExpansion = (tasks: Task[], taskId: number): Task[] => {
  const toggleRecursive = (taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        return { ...task, expanded: !task.expanded };
      }

      if (task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: toggleRecursive(task.subtasks),
        };
      }

      return task;
    });
  };

  return toggleRecursive(tasks);
};

// Get incomplete tasks (for carry-over)
export const getIncompleteTasks = (tasks: Task[]): Task[] => {
  return tasks
    .filter((task) => !task.completed)
    .map((task) => ({
      ...task,
      subtasks: getIncompleteTasks(task.subtasks),
    }));
};

// Count completed subtasks
export const countCompletedSubtasks = (
  task: Task
): { completed: number; total: number } => {
  const total = task.subtasks.length;
  const completed = task.subtasks.filter((st) => st.completed).length;
  return { completed, total };
};

// Expand all tasks recursively
export const expandAllTasks = (tasks: Task[]): Task[] => {
  return tasks.map((task) => ({
    ...task,
    expanded: task.subtasks.length > 0,
    subtasks: expandAllTasks(task.subtasks),
  }));
};

// Collapse all tasks recursively
export const collapseAllTasks = (tasks: Task[]): Task[] => {
  return tasks.map((task) => ({
    ...task,
    expanded: false,
    subtasks: collapseAllTasks(task.subtasks),
  }));
};

// Check if all tasks with subtasks are expanded
export const areAllTasksExpanded = (tasks: Task[]): boolean => {
  const checkRecursive = (taskList: Task[]): boolean => {
    for (const task of taskList) {
      if (task.subtasks.length > 0) {
        if (!task.expanded) return false;
        if (!checkRecursive(task.subtasks)) return false;
      }
    }
    return true;
  };

  // If there are no tasks with subtasks, return false (nothing to expand/collapse)
  const hasTasksWithSubtasks = tasks.some(
    (task) =>
      task.subtasks.length > 0 ||
      task.subtasks.some((subtask) => subtask.subtasks.length > 0)
  );

  if (!hasTasksWithSubtasks) return false;

  return checkRecursive(tasks);
};

// Update task text
export const updateTaskText = (
  tasks: Task[],
  taskId: number,
  newText: string
): Task[] => {
  const updateRecursive = (taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        return { ...task, text: newText };
      }
      if (task.subtasks.length > 0) {
        return { ...task, subtasks: updateRecursive(task.subtasks) };
      }
      return task;
    });
  };

  return updateRecursive(tasks);
};

// Check if task is fully completed (task + all subtasks are completed)
export const isTaskFullyCompleted = (task: Task): boolean => {
  if (!task.completed) return false;

  if (task.subtasks.length === 0) return true;

  return task.subtasks.every((subtask) => isTaskFullyCompleted(subtask));
};

// Calculate task duration in milliseconds (returns null if not finished)
export const calculateTaskDuration = (task: Task): number | null => {
  if (!task.created_at || !task.finished_at) return null;

  const createdTime = new Date(task.created_at).getTime();
  const finishedTime = new Date(task.finished_at).getTime();

  return finishedTime - createdTime;
};
