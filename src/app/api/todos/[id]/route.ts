import { NextResponse } from 'next/server';
import { toggleTodo, deleteTodo } from '@/lib/store';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todo = toggleTodo(id);
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json(todo);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteTodo(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
