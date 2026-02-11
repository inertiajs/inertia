import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'

interface Todo {
  id: number
  name: string
  done: boolean
}

const Optimistic = ({ todos }: { todos: Todo[] }) => {
  const [newTodoName, setNewTodoName] = useState('')

  const addForm = useForm({ name: '' })

  const addTodo = (e) => {
    e.preventDefault()

    const name = newTodoName.trim()
    setNewTodoName('')

    addForm.transform(() => ({ name }))

    addForm
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: [...props.todos, { id: Date.now(), name: name || '(empty)', done: false }],
      }))
      .post('/optimistic', {
        preserveScroll: true,
        onSuccess: () => {
          setNewTodoName('')
        },
        onError: () => {
          setNewTodoName(name)
        },
      })
  }

  const toggleTodo = (todo: Todo) => {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
      }))
      .patch(`/optimistic/${todo.id}`, {}, { preserveScroll: true })
  }

  const deleteTodo = (todo: Todo) => {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.filter((t) => t.id !== todo.id),
      }))
      .delete(`/optimistic/${todo.id}`, { preserveScroll: true })
  }

  const resetTodos = () => {
    router.optimistic<{ todos: Todo[] }>(() => ({ todos: [] })).post('/optimistic/reset')
  }

  return (
    <>
      <Head title="Optimistic" />
      <h1 className="text-3xl">Optimistic</h1>
      <div className="mt-6 max-w-md space-y-4">
        <form onSubmit={addTodo} className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newTodoName}
              onChange={(e) => setNewTodoName(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
            />
            {addForm.errors.name && <div className="mt-2 text-sm text-red-600">{addForm.errors.name}</div>}
          </div>
          <button type="submit" className="rounded-sm bg-slate-800 px-4 py-1 text-white">
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-2 rounded-sm border border-gray-200 px-3 py-2">
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo)} />
              <span className={`flex-1 ${todo.done ? 'text-gray-400 line-through' : ''}`}>{todo.name}</span>
              <button onClick={() => deleteTodo(todo)} className="text-sm text-red-600">
                Delete
              </button>
            </li>
          ))}
        </ul>

        <div>
          <button type="button" onClick={resetTodos} className="text-sm text-gray-500 underline">
            Reset
          </button>
        </div>
      </div>
    </>
  )
}

export default Optimistic
