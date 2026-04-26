import { Todo } from '@/types/todo';

declare global {
  // eslint-disable-next-line no-var
  var __todoStore: Map<string, Todo> | undefined;
}

const store: Map<string, Todo> = globalThis.__todoStore ?? new Map();
globalThis.__todoStore = store;

// Seed with sample todos on first load
if (store.size === 0) {
  const seeds: Todo[] = [
    { id: 'seed-1', title: 'Welcome! Click the circle to mark a task done', done: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'seed-2', title: 'Hover over a task to reveal the delete button', done: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'seed-3', title: 'Delete this and add your own tasks below ✦', done: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
  ];
  for (const todo of seeds) store.set(todo.id, todo);
}

export function getAllTodos(): Todo[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function searchTodos(query: string): Todo[] {
  const q = query.toLowerCase().trim();
  return getAllTodos().filter(t => t.title.toLowerCase().includes(q));
}

export function createTodo(title: string): Todo {
  const todo: Todo = {
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  store.set(todo.id, todo);
  return todo;
}

export function toggleTodo(id: string): Todo | null {
  const todo = store.get(id);
  if (!todo) return null;
  const updated = { ...todo, done: !todo.done };
  store.set(id, updated);
  return updated;
}

export function deleteTodo(id: string): boolean {
  return store.delete(id);
}

export function clearDoneTodos(): void {
  for (const [id, todo] of store) {
    if (todo.done) store.delete(id);
  }
}
