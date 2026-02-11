import { Form } from '@inertiajs/react'

interface Todo {
  id: number
  name: string
  done: boolean
}

export default ({ todos }: { todos: Todo[] }) => {
  return (
    <div>
      <h1>Form Component Optimistic</h1>

      <Form
        method="post"
        action="/form-component/optimistic"
        optimistic={(props, data) => ({
          todos: [
            ...((props.todos as Todo[]) || []),
            { id: Date.now(), name: (data.name as string) || '(empty todo...)', done: false },
          ],
        })}
        options={{ preserveScroll: true }}
      >
        {({ processing }) => (
          <>
            <input id="name-input" type="text" name="name" />
            <button id="submit-btn" type="submit" disabled={processing}>
              Add Todo
            </button>
          </>
        )}
      </Form>

      <ul id="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <span>{todo.name}</span>
          </li>
        ))}
      </ul>

      <div id="todo-count">Count: {todos.length}</div>
    </div>
  )
}
