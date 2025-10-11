import { useState, useEffect } from "react";
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
} from "../utils/taskHelpers";

export const useTasks = (type: TabType) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from storage on mount
  useEffect(() => {
    const loadedTasks =
      type === "today" ? storage.getTodayTasks() : storage.getMustDoTasks();
    setTasks(loadedTasks);
  }, [type]);

  // Save tasks to storage whenever they change
  useEffect(() => {
    if (type === "today") {
      storage.setTodayTasks(tasks);
    } else {
      storage.setMustDoTasks(tasks);
    }
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
    updateTasks,
    expandAll,
    collapseAll,
    toggleExpandCollapse,
    allExpanded,
  };
};
