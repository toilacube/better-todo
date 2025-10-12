import { useState, useEffect } from 'react';
import { TaskHistory, Task } from '../types';
import { storage } from '../store/storage';
import { countRootTasks } from '../utils/taskHelpers';

export const useHistory = () => {
  const [history, setHistory] = useState<TaskHistory>({});

  useEffect(() => {
    const loadHistory = async () => {
      const loadedHistory = await storage.getTaskHistory();
      setHistory(loadedHistory);
    };
    loadHistory();
  }, []);

  const addHistoryEntry = async (date: string, tasks: Task[]) => {
    const { total, completed } = countRootTasks(tasks);

    const newHistory = {
      ...history,
      [date]: {
        date,
        tasks,
        completed,
        total,
      },
    };

    setHistory(newHistory);
    await storage.setTaskHistory(newHistory);
  };

  const getHistoryEntries = (limit: number = 10) => {
    return Object.entries(history)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, limit)
      .map(([_, entry]) => entry);
  };

  const getAllHistoryEntries = () => {
    return Object.entries(history)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([_, entry]) => entry);
  };

  return {
    history,
    addHistoryEntry,
    getHistoryEntries,
    getAllHistoryEntries,
  };
};
