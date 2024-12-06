import { type NextRequest } from 'next/server'
import { db } from "@/server/db";
import { todos } from "@/server/db/schema";
import { eq } from 'drizzle-orm';
import { broadcastTo } from '@/server/db/cable';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);
  const tasks = await db.select().from(todos).where(eq(todos.id, id));
  const task = tasks[0];

  if (task) {
    await db.delete(todos).where(eq(todos.id, task.id))

    broadcastTo("$tasks", {event: "delete_task", id: task.id})
  } else {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 200 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);
  const tasks = await db.select().from(todos).where(eq(todos.id, id));
  const task = tasks[0];

  if (task) {
    const changeset = await request.json();

    await db.update(todos)
      .set(changeset)
      .where(eq(todos.id, id));

    const updatedTask = (await db.select().from(todos).where(eq(todos.id, id)))[0];

    broadcastTo("$tasks", {event: "sync_task", task: updatedTask})

    return Response.json(updatedTask);
  } else {
    return new Response(null, { status: 404 });
  }
}
