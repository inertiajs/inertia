import { useRemember } from '@inertiajs/react'
import { useState } from 'react'

export default (props) => {
  const [untracked, setUntracked] = useState('')

  const [data, setData] = useRemember({ name: '', remember: false }, 'Example/ComponentB')

  return (
    <div>
      <span>This component uses a callback-style 'key' for the remember functionality.</span>
      <label>
        Full Name
        <input
          type="text"
          className="b-name"
          name="full_name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          className="b-remember"
          name="remember"
          checked={data.remember}
          onChange={(e) => setData({ ...data, remember: e.target.checked })}
        />
      </label>
      <label>
        Remember Me
        <input
          type="text"
          className="b-untracked"
          name="untracked"
          value={untracked}
          onChange={(e) => setUntracked(e.target.value)}
        />
      </label>
    </div>
  )
}
