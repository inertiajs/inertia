import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'

interface Todo {
  id: number
  name: string
  done: boolean
}

export default ({
  todos,
  likes = 0,
  foo,
  errors,
  serverTimestamp,
}: {
  todos: Todo[]
  likes?: number
  foo?: string
  errors?: Record<string, string>
  serverTimestamp?: number
}) => {
  const [newTodoName, setNewTodoName] = useState('')
  const [errorCount, setErrorCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)

  const addForm = useForm({ name: '' })

  const addTodo = () => {
    const name = newTodoName.trim()
    const optimisticName = name || '(empty todo...)'
    setNewTodoName('')

    addForm.transform(() => ({ name }))

    addForm
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: [...props.todos, { id: Date.now(), name: optimisticName, done: false }],
      }))
      .post('/optimistic/todos', {
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
      })
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

  const like = () => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post('/optimistic/like', {}, { preserveScroll: true })
  }

  const likeSlow = (delay: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like?delay=${delay}`, {}, { preserveScroll: true })
  }

  const likeControlled = (delay: number, serverLikes: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like-controlled?delay=${delay}&likes=${serverLikes}`, {}, { preserveScroll: true })
  }

  const likeTriple = () => {
    router
      .optimistic<{ likes: number }>((props) => ({ likes: (props.likes as number) + 1 }))
      .post('/optimistic/like-controlled?delay=300&likes=1', {}, { preserveScroll: true })

    router
      .optimistic<{ likes: number }>((props) => ({ likes: (props.likes as number) + 1 }))
      .post('/optimistic/like-controlled?delay=600&likes=2&foo=bar_updated', {}, { preserveScroll: true })

    router
      .optimistic<{ likes: number }>((props) => ({ likes: (props.likes as number) + 1 }))
      .post('/optimistic/like-controlled?delay=900&likes=3&foo=bar_updated_twice', {}, { preserveScroll: true })
  }

  const likeError = (delay: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like-error?delay=${delay}`, {}, { preserveScroll: true })
  }

  const resetLikes = () => {
    router.post('/optimistic/reset-likes')
  }

  const triggerServerError = () => {
    router.post(
      '/optimistic/server-error',
      {},
      {
        preserveScroll: true,
        optimistic: (pageProps) => ({
          todos: [...(pageProps.todos as Todo[]), { id: Date.now(), name: 'Will fail...', done: false }],
        }),
      },
    )
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

      <div className="likes" style={{ margin: '16px 0' }}>
        <span id="likes-count">Likes: {likes}</span>
        <button id="like-btn" onClick={() => like()}>
          Like
        </button>
        <button id="like-slow-btn" onClick={() => likeSlow(800)}>
          Like (slow)
        </button>
        <button id="like-fast-btn" onClick={() => likeSlow(100)}>
          Like (fast)
        </button>
        <button id="like-controlled-slow-btn" onClick={() => likeControlled(800, 5)}>
          Like Controlled (slow, 5)
        </button>
        <button id="like-controlled-fast-btn" onClick={() => likeControlled(100, 3)}>
          Like Controlled (fast, 3)
        </button>
        <button id="like-error-btn" onClick={() => likeError(100)}>
          Like Error (fast)
        </button>
        <button id="like-triple-btn" onClick={likeTriple}>
          Like Triple
        </button>
        <button id="reset-likes-btn" onClick={resetLikes}>
          Reset Likes
        </button>
      </div>

      {foo && <div id="foo-value">Foo: {foo}</div>}

      <div className="counters">
        <div id="success-count">Success: {successCount}</div>
        <div id="error-count">Error: {errorCount}</div>
        {serverTimestamp && <div id="server-timestamp">Server timestamp: {serverTimestamp}</div>}
      </div>
    </div>
  )
}
