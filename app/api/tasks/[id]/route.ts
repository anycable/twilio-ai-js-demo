import { type NextRequest } from 'next/server'
import { updateTask, deleteTask } from "@/server/services/tasks";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);

  try {
    await deleteTask(id);
    return new Response(null, { status: 200 });

  } catch(e) {
    console.error(e);
    return new Response(null, { status: 404 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);
  const changeset = await request.json();

  try {
    const task = await updateTask(id, changeset);
    return Response.json(task);
  } catch(e) {
    console.error(e);
    return new Response(null, { status: 404 });
  }
}
