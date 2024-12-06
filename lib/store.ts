import { atom } from 'nanostores';
import type { Task } from './types';
import { fetchTasks } from './api';

const loadInitialState = async (): Promise<Task[]> => {
  try {
    const tasks = await fetchTasks();
    return tasks;
  } catch (error) {
    console.error('Error loading tasks from server:', error);
    return [];
  }
};

export const $tasks = atom<Task[]>([]);

// Initialize store after hydration
if (typeof window !== 'undefined') {
  Promise.resolve().then(async () => {
    const tasks = await loadInitialState();
    $tasks.set(tasks);
  });
}

export const tasksActions = {
  toggleTask: (taskId: number) => {
    const tasks = $tasks.get();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    $tasks.set(updatedTasks);
  },

  deleteTask: (taskId: number) => {
    const tasks = $tasks.get();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    $tasks.set(updatedTasks);
  },

  syncTask: (task: Task) => {
    const tasks = $tasks.get();
    let found = false;
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        found = true;
        return { ...t, ...task };
      } else {
        return t;
      }
    });

    if (found) {
      $tasks.set(updatedTasks);
    } else {
      $tasks.set([...tasks, task]);
    }
  },

  getTask: (id: number) => {
    const tasks = $tasks.get();
    const task = tasks.find((t) => t.id === id);
    return task;
  }
};
