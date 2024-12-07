import { Task } from "@/lib/types";
import { db } from "@/server/db";
import { eq } from 'drizzle-orm';
import { todos } from "@/server/db/schema";
import { broadcastTo } from '@/server/cable';

export async function allTasks(): Promise<Task[]> {
  return db.select().from(todos);
}

export interface TaskParams {
  title: string;
  description?: string;
  completed: boolean;
  date: string;
}

export async function createTask(params: TaskParams): Promise<Task> {
  const task = (await db.insert(todos).values(params).returning())[0];

  broadcastTo("$tasks", {event: "sync_task", task})

  return task;
}

export async function findTask(id: number): Promise<Task | null> {
  const tasks = await db.select().from(todos).where(eq(todos.id, id));
  return tasks[0] || null;
}

export async function updateTask(id: number, params: Partial<TaskParams>): Promise<Task> {
  const task = (await db.update(todos).set(params).where(eq(todos.id, id)).returning())[0];

  if (!task) {
    throw "Not found"
  }

  broadcastTo("$tasks", {event: "sync_task", task})

  return task;
}

export async function deleteTask(id: number): Promise<void> {
  const task = await findTask(id);

  if (task) {
    await db.delete(todos).where(eq(todos.id, task.id))

    broadcastTo("$tasks", { event: "delete_task", id: task.id })
  } else {
    throw "Not found"
  }
}
