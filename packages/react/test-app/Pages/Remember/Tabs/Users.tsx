import { Link, useRemember } from '@inertiajs/react'
import { useState } from 'react'
import Notes from '../Components/Notes'

const users = [
  { id: 1, name: 'User One' },
  { id: 2, name: 'User Two' },
  { id: 3, name: 'User Three' },
]

export default () => {
  const [selected, setSelected] = useRemember<number[]>([], 'Users/Selected')
  const [showNotes, setShowNotes] = useState(false)

  const toggle = (id: number) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]))

  return (
    <div>
      <nav>
        <Link href="/remember/tabs/users">Users</Link>
        <Link href="/remember/tabs/teams">Teams</Link>
        <a href="/non-inertia">Navigate off-site</a>
      </nav>

      <h1>Users</h1>
      <p id="selected">{selected.length} selected</p>

      {users.map((user) => (
        <label key={user.id}>
          <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggle(user.id)} />
          {user.name}
        </label>
      ))}

      <button onClick={() => setShowNotes(!showNotes)}>Toggle notes</button>
      {showNotes && <Notes />}
    </div>
  )
}
