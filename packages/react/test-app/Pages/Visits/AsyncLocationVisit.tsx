import { router } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [draft, setDraft] = useState('')

  const backgroundReload = () => {
    router.reload({
      data: { foo: 'bar' },
      headers: { 'X-Simulate-Version-Change': '1' },
    })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates async location visits</span>

      <input id="draft" value={draft} onChange={(e) => setDraft(e.target.value)} />

      <button onClick={backgroundReload} className="reload">
        Background reload
      </button>
    </div>
  )
}
