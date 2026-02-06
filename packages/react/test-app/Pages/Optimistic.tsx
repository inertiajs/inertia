import { router } from '@inertiajs/react'
import { useState } from 'react'

interface Todo {
  id: number
  name: string
  done: boolean
}

export default ({
  todos,
  errors,
  serverTimestamp,
}: {
  todos: Todo[]
  errors?: Record<string, string>
  serverTimestamp?: number
}) => {
  const [newTodoName, setNewTodoName] = useState('')
  const [errorCount, setErrorCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)

  const addTodo = () => {
    const name = newTodoName.trim()
    const optimisticName = name || '(empty todo...)'
    setNewTodoName('')

    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: [...props.todos, { id: Date.now(), name: optimisticName, done: false }],
      }))
      .post(
        '/optimistic/todos',
        { name },
        {
          preserveScroll: true,
          onSuccess: () => {
            setSuccessCount((c) => c + 1)
            setNewTodoName('')
          },
          onError: () => {
            setErrorCount((c) => c + 1)
            setNewTodoName(name)
            document.getElementById('new-todo')?.focus()
          },
        },
      )
  }

  const toggleTodo = (todo: Todo) => {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
      }))
      .patch(`/optimistic/todos/${todo.id}`, { done: !todo.done }, { preserveScroll: true })
  }

  const deleteTodo = (todo: Todo) => {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.filter((t) => t.id !== todo.id),
      }))
      .delete(`/optimistic/todos/${todo.id}`, { preserveScroll: true })
  }

  const clearTodos = () => {
    router.post('/optimistic/clear')
  }

  const triggerServerError = () => {
    router.post('/optimistic/server-error', {}, {
      preserveScroll: true,
      optimistic: (pageProps) => ({
        todos: [...(pageProps.todos as Todo[]), { id: Date.now(), name: 'Will fail...', done: false }],
      }),
    })
  }

  return (
    <div>
      <h1>Optimistic Updates</h1>

      <div className="add-form" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
          <input
            id="new-todo"
            type="text"
            value={newTodoName}
            onChange={(e) => setNewTodoName(e.target.value)}
            placeholder="What needs to be done?"
            onKeyUp={(e) => e.key === 'Enter' && addTodo()}
          />
          {errors?.name && (
            <p className="error" style={{ margin: '4px 0 0' }}>
              {errors.name}
            </p>
          )}
        </div>
        <button id="add-btn" onClick={addTodo}>
          Add Todo
        </button>
      </div>

      <ul id="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo)} />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.name}</span>
            <button onClick={() => deleteTodo(todo)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="actions">
        <button id="clear-btn" onClick={clearTodos}>
          Reset
        </button>
        <button id="server-error-btn" onClick={triggerServerError}>
          Trigger Server Error
        </button>
      </div>

      <div className="counters">
        <div id="success-count">Success: {successCount}</div>
        <div id="error-count">Error: {errorCount}</div>
        {serverTimestamp && <div id="server-timestamp">Server timestamp: {serverTimestamp}</div>}
      </div>
    </div>
  )
}
