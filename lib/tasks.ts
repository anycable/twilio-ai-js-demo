import { Task, TasksByDate } from './types';
import { cable, broadcastTo } from './cable';
import { tasksActions } from './store';

export function groupTasksByDate(tasks: Task[]): TasksByDate {
  return tasks.reduce((acc: TasksByDate, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});
}

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const channel = cable.streamFrom('$tasks');
  channel.on("message", (data) => {
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

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<void> {
  const newTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  
  const storedTask = tasksActions.addTask(task);
  broadcastTo("$tasks", {event: "sync_task", task: storedTask})
}

export async function toggleTaskCompletion(taskId: string, currentState: boolean): Promise<void> {
  tasksActions.toggleTask(taskId);
  broadcastTo("$tasks", {event: "sync_task", task: tasksActions.getTask(taskId)})
}

export async function deleteTask(taskId: string): Promise<void> {
  tasksActions.deleteTask(taskId);
  broadcastTo("$tasks", {event: "delete_task", id: taskId})
}
