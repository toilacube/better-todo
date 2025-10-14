import { useState, useEffect, useRef } from "react";
import { Task, TabType } from "../types";
import { storage } from "../store/storage";
import {
  createTask,
  toggleTaskCompletion,
  addSubtask,
  deleteTask,
  toggleTaskExpansion,
  expandAllTasks,
  collapseAllTasks,
  areAllTasksExpanded,
  updateTaskText,
} from "../utils/taskHelpers";

export const useTasks = (type: TabType, reloadTrigger?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const isLoadingRef = useRef(false);

  // Load tasks from storage on mount and when reloadTrigger changes
  useEffect(() => {
    const loadTasks = async () => {
      isLoadingRef.current = true;
      const loadedTasks =
        type === "today"
          ? await storage.getTodayTasks()
          : await storage.getMustDoTasks();
      setTasks(loadedTasks);
      // Reset flag after a small delay to allow state to settle
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 0);
    };
    loadTasks();
  }, [type, reloadTrigger]);

  // Save tasks to storage whenever they change (but not during load)
  useEffect(() => {
    // Skip saving if we're currently loading
    if (isLoadingRef.current) {
      return;
    }

    const saveTasks = async () => {
      if (type === "today") {
        await storage.setTodayTasks(tasks);
      } else {
        await storage.setMustDoTasks(tasks);
      }
    };
    saveTasks();
  }, [tasks, type]);

  const addTask = (text: string) => {
    if (!text.trim()) return;
    setTasks([...tasks, createTask(text)]);
  };

  const toggleTask = (taskId: number) => {
    setTasks(toggleTaskCompletion(tasks, taskId));
  };

  const addSubtaskToTask = (parentId: number, text: string) => {
    if (!text.trim()) return;
    setTasks(addSubtask(tasks, parentId, text));
  };

  const removeTask = (taskId: number) => {
    setTasks(deleteTask(tasks, taskId));
  };

  const toggleExpansion = (taskId: number) => {
    setTasks(toggleTaskExpansion(tasks, taskId));
  };

  const updateTaskTextHandler = (taskId: number, newText: string) => {
    if (!newText.trim()) return;
    setTasks(updateTaskText(tasks, taskId, newText));
  };

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const expandAll = () => {
    setTasks(expandAllTasks(tasks));
  };

  const collapseAll = () => {
    setTasks(collapseAllTasks(tasks));
  };

  const toggleExpandCollapse = () => {
    if (areAllTasksExpanded(tasks)) {
      setTasks(collapseAllTasks(tasks));
    } else {
      setTasks(expandAllTasks(tasks));
    }
  };

  const allExpanded = areAllTasksExpanded(tasks);

  return {
    tasks,
    addTask,
    toggleTask,
    addSubtaskToTask,
    removeTask,
    toggleExpansion,
    updateTaskText: updateTaskTextHandler,
    updateTasks,
    expandAll,
    collapseAll,
    toggleExpandCollapse,
    allExpanded,
  };
};
