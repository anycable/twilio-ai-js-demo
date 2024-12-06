import { type NextRequest } from 'next/server'
import { db } from "@/server/db";
import { todos } from "@/server/db/schema";
import { broadcastTo } from '@/server/db/cable';

export async function GET(request: NextRequest) {
  const allTasks = await db.select().from(todos)

  return Response.json(allTasks)
}

export async function POST(request: NextRequest) {
  const taskParams = await request.json();
  const task = (await db.insert(todos).values(taskParams).returning())[0];

  broadcastTo("$tasks", {event: "sync_task", task})

  return Response.json(task);
}
