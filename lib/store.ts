import { atom } from 'nanostores';
import type { Task } from './types';

const STORAGE_KEY = 'daily-planner-tasks';

// Load initial state from localStorage
const loadInitialState = (): Task[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

export const $tasks = atom<Task[]>([]);

// Initialize store after hydration
if (typeof window !== 'undefined') {
  // Set initial state in next tick to avoid hydration mismatch
  Promise.resolve().then(() => {
    $tasks.set(loadInitialState());

    // Subscribe to changes and update localStorage
  $tasks.subscribe((tasks) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
    });
  });
}

export const tasksActions = {
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    $tasks.set([...$tasks.get(), newTask]);
    return newTask;
  },

  toggleTask: (taskId: string) => {
    const tasks = $tasks.get();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    $tasks.set(updatedTasks);
  },

  deleteTask: (taskId: string) => {
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

  getTask: (id: string) => {
    const tasks = $tasks.get();
    const task = tasks.find((t) => t.id === id);
    return task;
  }
};
