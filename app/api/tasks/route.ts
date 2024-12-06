import { type NextRequest } from 'next/server'
import { allTasks, createTask } from "@/server/services/tasks";

export async function GET(request: NextRequest) {
  const tasks = await allTasks();

  return Response.json(tasks);
}

export async function POST(request: NextRequest) {
  const taskParams = await request.json();

  const task = await createTask(taskParams);

  return Response.json(task);
}
