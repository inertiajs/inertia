import { Link } from '@inertiajs/react'
import { useState } from 'react'

export default (props) => {
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(false)
  const [untracked, setUntracked] = useState('')

  return (
    <div>
      <label>
        Full Name
        <input type="text" id="name" name="full_name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
      </label>
      <label>
        Untracked
        <input
          type="text"
          id="untracked"
          name="untracked"
          value={untracked}
          onChange={(e) => setUntracked(e.target.value)}
        />
      </label>

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
    </div>
  )
}
