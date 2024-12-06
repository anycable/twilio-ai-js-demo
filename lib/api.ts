import type { Task } from './types';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');
  return response.json();
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });
  return response.json();
};

export const updateTask = async (id: number, changeset: Partial<Task>): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(changeset)
  });
  return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  await fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
};
