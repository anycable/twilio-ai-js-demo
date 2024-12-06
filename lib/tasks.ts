import { Task, TasksByDate } from './types';
import { cable } from './cable';
import { tasksActions } from './store';
import { createTask, updateTask, deleteTask as remoteDeleteTask } from './api';

export function groupTasksByDate(tasks: Task[]): TasksByDate {
  return tasks.reduce((acc: TasksByDate, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    acc[date].sort((a, b) => a.id - b.id);
    return acc;
  }, {});
}

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const channel = cable.streamFrom('$tasks');
  channel.on("message", (data: any) => {
    if (data.event === 'sync_task') {
      tasksActions.syncTask(data.task);
    }

    if (data.event == 'delete_task') {
      tasksActions.deleteTask(data.id);
    }
  });

  return () => {
    channel.disconnect();
  };
}

export async function addTask(task: Partial<Task>): Promise<void> {
  const createdTask = await createTask(task);

  tasksActions.syncTask(createdTask);
}

export async function toggleTaskCompletion(taskId: number, currentState: boolean): Promise<void> {
  tasksActions.toggleTask(taskId);
  const updatedTask = await updateTask(taskId, { completed: !currentState });
  tasksActions.syncTask(updatedTask);
}

export async function deleteTask(taskId: number): Promise<void> {
  tasksActions.deleteTask(taskId);
  await remoteDeleteTask(taskId);
}
