'use client';

import { useState, useEffect, useRef } from 'react';

interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

function authFetch(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRET ?? ''}`,
    },
  });
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enterIds, setEnterIds] = useState<Set<string>>(new Set());
  const [exitIds, setExitIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authFetch('/api/todos')
      .then(r => r.json())
      .then((data: unknown) => {
        setTodos(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const title = input.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    setInput('');
    const res = await authFetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const todo: Todo = await res.json();
    setTodos(prev => [todo, ...prev]);
    setEnterIds(prev => new Set(prev).add(todo.id));
    setTimeout(() => {
      setEnterIds(prev => { const s = new Set(prev); s.delete(todo.id); return s; });
    }, 400);
    setSubmitting(false);
    inputRef.current?.focus();
  }

  async function toggleTodo(id: string) {
    const res = await authFetch(`/api/todos/${id}`, { method: 'PATCH' });
    const updated: Todo = await res.json();
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  }

  async function deleteTodo(id: string) {
    setExitIds(prev => new Set(prev).add(id));
    await new Promise(r => setTimeout(r, 280));
    await authFetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t.id !== id));
    setExitIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  async function clearDone() {
    const doneIds = todos.filter(t => t.done).map(t => t.id);
    setExitIds(new Set(doneIds));
    await new Promise(r => setTimeout(r, 300));
    await authFetch('/api/todos', { method: 'DELETE' });
    setTodos(prev => prev.filter(t => !t.done));
    setExitIds(new Set());
  }

  const pending = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const total = todos.length;
  const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;

  return (
    <main className="app-root min-h-screen flex flex-col items-center px-4 py-14">

      {/* ── Header ── */}
      <header className="w-full max-w-md mb-10 text-center select-none">
        <span className="inline-block text-sage text-xl mb-3 opacity-70">✦</span>
        <h1 className="font-fraunces text-[3.25rem] font-semibold text-ink leading-none tracking-tight">
          My Things
        </h1>

        {/* Progress bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-rim rounded-full overflow-hidden">
            <div
              className="progress-bar h-full rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-nunito text-xs text-muted tabular-nums w-16 text-right">
            {loading ? '—' : `${done.length} / ${total} done`}
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Add form */}
        <form onSubmit={addTodo}>
          <div className="add-form flex gap-2 bg-white rounded-2xl p-2 border border-rim shadow-sm transition-all duration-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="What needs doing?"
              autoFocus
              className="flex-1 px-3 py-2 bg-transparent font-nunito text-ink placeholder:text-muted text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || submitting}
              className="bg-sage hover:bg-sage-dark text-white px-5 py-2 rounded-xl font-nunito font-semibold text-sm transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 select-none"
            >
              Add
            </button>
          </div>
        </form>

        {/* List */}
        {loading ? (
          <LoadingSkeleton />
        ) : todos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2 mt-1">

            {/* Pending */}
            {pending.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isEntering={enterIds.has(todo.id)}
                isExiting={exitIds.has(todo.id)}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}

            {/* Done section */}
            {done.length > 0 && (
              <>
                <div className="flex items-center gap-3 pt-2 pb-1">
                  <div className="flex-1 h-px bg-rim" />
                  <span className="font-nunito text-[10px] text-muted uppercase tracking-[0.12em]">
                    Completed
                  </span>
                  <div className="flex-1 h-px bg-rim" />
                </div>

                {done.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    isEntering={enterIds.has(todo.id)}
                    isExiting={exitIds.has(todo.id)}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearDone}
                    className="font-nunito text-xs text-muted hover:text-red-400 transition-colors duration-150 py-1"
                  >
                    Clear completed ({done.length})
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {!loading && (
        <p className="mt-10 font-nunito text-xs text-muted/70">
          {pending.length === 0 && done.length > 0
            ? <span className="font-fraunces text-sage italic text-base">All done — nice work ✦</span>
            : pending.length > 0
              ? `${pending.length} task${pending.length !== 1 ? 's' : ''} remaining`
              : null}
        </p>
      )}
    </main>
  );
}

/* ── Todo item ── */
function TodoItem({
  todo,
  isEntering,
  isExiting,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  isEntering: boolean;
  isExiting: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={[
        'group flex items-center gap-3 bg-white rounded-xl px-4 py-3.5',
        'border border-rim shadow-sm transition-shadow duration-200',
        'hover:shadow-md',
        todo.done ? 'opacity-55' : '',
        isEntering ? 'todo-enter' : '',
        isExiting ? 'todo-exit' : '',
      ].join(' ')}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
        className={`check-btn ${todo.done ? 'checked' : ''}`}
      >
        {todo.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Title */}
      <span
        className={`flex-1 font-nunito text-sm leading-relaxed select-text ${
          todo.done ? 'text-muted line-through decoration-muted/60' : 'text-ink'
        }`}
      >
        {todo.title}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-50 flex-shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="text-center py-16 flex flex-col items-center gap-2">
      <span className="font-fraunces text-5xl text-sage/25 select-none mb-1">✦</span>
      <p className="font-fraunces text-xl text-ink/50">Clean slate</p>
      <p className="font-nunito text-sm text-muted">Add your first task above to get started.</p>
    </div>
  );
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2 mt-1 animate-pulse">
      {[80, 65, 90].map((w, i) => (
        <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-rim">
          <div className="w-5 h-5 rounded-full bg-rim flex-shrink-0" />
          <div className="h-3.5 bg-rim rounded-full" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}
