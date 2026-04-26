import { NextResponse } from 'next/server';
import { getAllTodos, searchTodos, createTodo, clearDoneTodos } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  return NextResponse.json(q !== null ? searchTodos(q) : getAllTodos());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const todo = createTodo(body.title.trim());
  return NextResponse.json(todo, { status: 201 });
}

export async function DELETE() {
  clearDoneTodos();
  return NextResponse.json({ success: true });
}
